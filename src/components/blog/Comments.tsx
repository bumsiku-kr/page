'use client';

import { useState, useEffect } from 'react';
import { api } from '../../lib/api/index';
import { Comment, CreateCommentRequest } from '../../types';
import Loading from '../ui/feedback/Loading';
import ErrorMessage from '../ui/feedback/ErrorMessage';

interface CommentsProps {
  postId: string;
}

export default function Comments({ postId }: CommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [author, setAuthor] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // 댓글 목록 가져오기
  useEffect(() => {
    const fetchComments = async () => {
      try {
        setLoading(true);
        if (!postId) {
          throw new Error('게시물 ID가 없습니다.');
        }

        const response = await api.comments.getByPostId(parseInt(postId, 10));
        console.log('댓글 데이터:', response);
        setComments(response || []);
        setError(null);
      } catch (err) {
        setError('댓글을 불러오는 중 오류가 발생했습니다.');
        console.error('댓글 불러오기 오류:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
  }, [postId]);

  // 댓글 제출 핸들러
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!author.trim() || !content.trim()) {
      setSubmitError('작성자 이름과 댓글 내용을 모두 입력해주세요.');
      return;
    }

    try {
      setSubmitting(true);
      setSubmitError(null);

      if (!postId) {
        throw new Error('게시물 ID가 없습니다.');
      }

      const commentData: CreateCommentRequest = {
        author,
        content,
      };

      const newComment = await api.comments.create(parseInt(postId, 10), commentData);

      // 새 댓글이 성공적으로 생성된 경우에만 목록에 추가
      if (newComment && newComment.id) {
        setComments(prevComments => [...prevComments, newComment]);

        // 폼 초기화
        setAuthor('');
        setContent('');
      } else {
        throw new Error('댓글이 생성되지 않았습니다.');
      }
    } catch (err) {
      setSubmitError('댓글 작성 중 오류가 발생했습니다.');
      console.error('댓글 작성 오류:', err);
    } finally {
      setSubmitting(false);
    }
  };

  // 날짜 포맷팅 함수 (SSR 안전)
  const formatDate = (dateString: string) => {
    try {
      // UTC 시간을 Date 객체로 변환
      const utcDate = new Date(dateString + 'Z'); // 'Z'를 추가하여 명시적으로 UTC임을 표시

      // 서버사이드에서는 기본 포맷 사용, 클라이언트에서는 로컬 시간대 사용
      const formatOptions: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false, // 24시간 형식 사용
      };

      // 클라이언트에서만 시간대 설정
      if (typeof window !== 'undefined') {
        formatOptions.timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      }

      return new Intl.DateTimeFormat('ko-KR', formatOptions).format(utcDate);
    } catch (error) {
      console.error('날짜 포맷팅 오류:', error, '입력값:', dateString);
      return '날짜 정보 없음';
    }
  };

  if (loading) return <Loading />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="space-y-8">
      {/* 댓글 목록 */}
      {comments.length > 0 ? (
        <div className="space-y-6">
          {comments.map(comment => {
            console.log('개별 댓글 데이터:', comment);
            return (
              <div key={comment.id} className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-medium">{comment.authorName}</span>
                  <span className="text-xs text-gray-500">{formatDate(comment.createdAt)}</span>
                </div>
                <p className="text-gray-700 whitespace-pre-line">{comment.content}</p>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <p>아직 댓글이 없습니다. 첫 댓글을 작성해보세요!</p>
        </div>
      )}

      {/* 댓글 작성 폼 */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">댓글 작성</h3>

        {submitError && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">{submitError}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="author" className="block text-sm font-medium text-gray-700 mb-1">
              작성자
            </label>
            <input
              type="text"
              id="author"
              value={author}
              onChange={e => setAuthor(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              disabled={submitting}
              maxLength={20}
            />
          </div>

          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
              댓글 내용
            </label>
            <textarea
              id="content"
              value={content}
              onChange={e => setContent(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
              {submitting ? '등록 중...' : '댓글 등록'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
