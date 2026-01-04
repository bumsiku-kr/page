'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useCommentsQuery } from '../hooks';
import { useCreateComment } from '../mutations';
import type { CreateCommentRequest } from '@/types';
import Loading from '@/components/ui/feedback/Loading';
import ErrorMessage from '@/components/ui/feedback/ErrorMessage';
import { generateRandomNickname, getAnimalEmoji } from '@/shared/lib/nickname-generator';

interface CommentsProps {
  postId: string;
}

export default function Comments({ postId }: CommentsProps) {
  const t = useTranslations('comment');
  const tPost = useTranslations('post');
  const locale = useLocale();

  // SWR hooks for data fetching
  const { data: comments = [], isLoading, error } = useCommentsQuery(postId);
  const { createComment } = useCreateComment(postId);

  // Form state
  const [author, setAuthor] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Generate random nickname on mount
  useEffect(() => {
    setAuthor(generateRandomNickname());
  }, []);

  // Random nickname regeneration handler
  const handleRandomNickname = () => {
    setAuthor(generateRandomNickname());
  };

  // Comment submission handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!author.trim() || !content.trim()) {
      setSubmitError(t('validationError'));
      return;
    }

    try {
      setSubmitting(true);
      setSubmitError(null);

      const commentData: CreateCommentRequest = {
        author,
        content,
      };

      await createComment(commentData);

      // Reset form with new random nickname
      setAuthor(generateRandomNickname());
      setContent('');
    } catch {
      setSubmitError(t('submitError'));
    } finally {
      setSubmitting(false);
    }
  };

  // Date formatting function (SSR safe)
  const formatDate = (dateString: string) => {
    try {
      const dateToFormat = dateString.endsWith('Z') ? dateString : dateString + 'Z';
      const utcDate = new Date(dateToFormat);

      if (isNaN(utcDate.getTime())) {
        throw new Error('Invalid Date');
      }

      const formatOptions: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      };

      if (typeof window !== 'undefined') {
        formatOptions.timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      }

      return new Intl.DateTimeFormat(locale === 'en' ? 'en-US' : 'ko-KR', formatOptions).format(utcDate);
    } catch {
      return t('noDate');
    }
  };

  if (isLoading) return <Loading />;
  if (error) return <ErrorMessage message={t('loadError')} />;

  return (
    <div className="space-y-8">
      {/* Comments list */}
      {comments.length > 0 ? (
        <div className="space-y-6">
          {comments.map(comment => (
            <div key={comment.id} className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-start gap-3">
                {/* Comment author avatar */}
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-lg">
                  {getAnimalEmoji(comment.authorName)}
                </div>

                {/* Comment content */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-medium">{comment.authorName}</span>
                    <span className="text-xs text-gray-500">{formatDate(comment.createdAt)}</span>
                  </div>
                  <p className="text-gray-700 whitespace-pre-line">{comment.content}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <p>{tPost('noComments')}</p>
        </div>
      )}

      {/* Comment form */}
      <div className="bg-gray-50 p-6 rounded-lg overflow-hidden">
        <h3 className="text-lg font-semibold mb-4">{tPost('writeComment')}</h3>

        {submitError && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">{submitError}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nickname input area */}
          <div>
            <label htmlFor="author" className="block text-sm font-medium text-gray-700 mb-1">
              {t('nickname')}
            </label>
            <div className="flex gap-2 items-center">
              {/* Avatar icon */}
              <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-xl">
                {getAnimalEmoji(author)}
              </div>

              {/* Nickname input field */}
              <input
                type="text"
                id="author"
                value={author}
                onChange={e => setAuthor(e.target.value)}
                className="min-w-0 flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                disabled={submitting}
                maxLength={20}
                placeholder={t('nicknamePlaceholder')}
              />

              {/* Random button */}
              <button
                type="button"
                onClick={handleRandomNickname}
                className="flex-shrink-0 px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                disabled={submitting}
              >
                {t('randomChange')}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
              {t('content')}
            </label>
            <textarea
              id="content"
              value={content}
              onChange={e => setContent(e.target.value)}
              className="w-full max-w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              rows={4}
              disabled={submitting}
              maxLength={500}
            ></textarea>
          </div>

          <div className="text-right">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={submitting}
            >
              {submitting ? t('submitting') : t('submit')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
