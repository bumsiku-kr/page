'use client';

import { useState, useEffect, useCallback } from 'react';
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

// 아이콘 컴포넌트들
const RefreshIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

const SendIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
  </svg>
);

const SpinnerIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={`${className} animate-spin`} fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
  </svg>
);

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
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [touched, setTouched] = useState({ author: false, content: false });

  // 유효성 검사
  const validation = {
    author: author.trim().length >= 1 && author.trim().length <= 20,
    content: content.trim().length >= 1 && content.trim().length <= 500,
  };

  const MAX_CONTENT_LENGTH = 500;

  // Generate random nickname on mount
  useEffect(() => {
    setAuthor(generateRandomNickname());
  }, []);

  // Random nickname regeneration handler
  const handleRandomNickname = useCallback(() => {
    setAuthor(generateRandomNickname());
    setTouched(prev => ({ ...prev, author: false }));
  }, []);

  // Comment submission handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ author: true, content: true });

    if (!validation.author || !validation.content) {
      setSubmitError(t('validationError'));
      return;
    }

    try {
      setSubmitting(true);
      setSubmitError(null);
      setSubmitSuccess(false);

      const commentData: CreateCommentRequest = {
        author: author.trim(),
        content: content.trim(),
      };

      await createComment(commentData);

      // Success feedback
      setSubmitSuccess(true);
      setTimeout(() => setSubmitSuccess(false), 3000);

      // Reset form with new random nickname
      setAuthor(generateRandomNickname());
      setContent('');
      setTouched({ author: false, content: false });
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
      <div className="bg-gradient-to-b from-gray-50 to-gray-100/50 p-4 sm:p-6 rounded-xl border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{tPost('writeComment')}</h3>

        {/* 성공 메시지 */}
        {submitSuccess && (
          <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg text-sm flex items-center gap-2 animate-in fade-in duration-300">
            <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            {t('submitSuccess')}
          </div>
        )}

        {/* 에러 메시지 */}
        {submitError && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm flex items-center gap-2">
            <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {submitError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Nickname input area */}
          <div>
            <label htmlFor="author" className="block text-sm font-medium text-gray-700 mb-2">
              {t('nickname')}
            </label>
            <div className="flex gap-3 items-center">
              {/* Avatar */}
              <div
                className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center text-2xl shadow-sm"
                aria-hidden="true"
              >
                {getAnimalEmoji(author)}
              </div>
              {/* Input + Button 그룹 */}
              <div className="flex-1 flex gap-2">
                <input
                  type="text"
                  id="author"
                  value={author}
                  onChange={e => setAuthor(e.target.value)}
                  onBlur={() => setTouched(prev => ({ ...prev, author: true }))}
                  className={`min-w-0 flex-1 px-3 py-2.5 border rounded-lg shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    touched.author && !validation.author
                      ? 'border-red-300 bg-red-50'
                      : 'border-gray-300 bg-white'
                  }`}
                  disabled={submitting}
                  maxLength={20}
                  placeholder={t('nicknamePlaceholder')}
                  aria-describedby={touched.author && !validation.author ? 'author-error' : undefined}
                />
                {/* Random button - 아이콘만 */}
                <button
                  type="button"
                  onClick={handleRandomNickname}
                  className="flex-shrink-0 w-11 h-11 flex items-center justify-center text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
                  disabled={submitting}
                  aria-label={t('randomChange')}
                  title={t('randomChange')}
                >
                  <RefreshIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
            {touched.author && !validation.author && (
              <p id="author-error" className="mt-1.5 text-sm text-red-600">{t('nicknameRequired')}</p>
            )}
          </div>

          {/* Content textarea */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                {t('content')}
              </label>
              <span className={`text-xs ${content.length > MAX_CONTENT_LENGTH * 0.9 ? 'text-orange-600' : 'text-gray-400'}`}>
                {content.length}/{MAX_CONTENT_LENGTH}
              </span>
            </div>
            <textarea
              id="content"
              value={content}
              onChange={e => setContent(e.target.value)}
              onBlur={() => setTouched(prev => ({ ...prev, content: true }))}
              className={`w-full px-3 py-3 border rounded-lg shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
                touched.content && !validation.content
                  ? 'border-red-300 bg-red-50'
                  : 'border-gray-300 bg-white'
              }`}
              rows={4}
              disabled={submitting}
              maxLength={MAX_CONTENT_LENGTH}
              placeholder={t('contentPlaceholder')}
              aria-describedby={touched.content && !validation.content ? 'content-error' : undefined}
            />
            {touched.content && !validation.content && (
              <p id="content-error" className="mt-1.5 text-sm text-red-600">{t('contentRequired')}</p>
            )}
          </div>

          {/* Submit button */}
          <button
            type="submit"
            className="w-full h-12 flex items-center justify-center gap-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
            disabled={submitting || (!validation.author || !validation.content)}
          >
            {submitting ? (
              <>
                <SpinnerIcon className="w-5 h-5" />
                {t('submitting')}
              </>
            ) : (
              <>
                <SendIcon className="w-5 h-5" />
                {t('submit')}
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
