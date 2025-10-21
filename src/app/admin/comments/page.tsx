'use client';

import { useState, useEffect } from 'react';
import DataTable from '@/components/ui/DataTable';
import { api } from '@/lib/api/index';
import { Comment } from '@/types';
import { truncateText } from '@/lib/utils';
import { dateUtils } from '@/lib/utils/date';

export default function CommentsManagementPage() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);
  const [posts, setPosts] = useState<{ id: number; title: string }[]>([]);

  const fetchPosts = async () => {
    try {
      const response = await api.posts.getList(0, 100);
      const postsList = response.content.map((post: any) => ({
        id: post.id,
        title: post.title,
      }));
      setPosts(postsList);
    } catch (err) {
      console.error('게시글 목록을 불러오는 중 오류 발생:', err);
    }
  };

  const fetchComments = async () => {
    setIsLoading(true);
    try {
      if (selectedPostId) {
        const data = await api.comments.getByPostId(selectedPostId);
        setComments(data);
      } else {
        // 모든 댓글을 가져오는 API가 없으므로 개별 게시글의 댓글을 모두 가져옴
        let allComments: Comment[] = [];

        for (const post of posts) {
          try {
            const postComments = await api.comments.getByPostId(post.id);
            // 각 댓글에 게시글 ID 정보 추가
            const commentsWithPostId = postComments.map(comment => ({
              ...comment,
              postId: post.id,
            }));
            allComments = [...allComments, ...commentsWithPostId];
          } catch (error) {
            console.log(`게시글 ${post.id}의 댓글을 불러오는 데 실패했습니다.`);
          }
        }

        setComments(allComments);
      }
      setError(null);
    } catch (err) {
      setError('댓글을 불러오는 중 오류가 발생했습니다.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect(() => {
    if (posts.length > 0) {
      fetchComments();
    }
  }, [selectedPostId, posts]);

  const handleDelete = async (id: number) => {
    if (!window.confirm('이 댓글을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      return;
    }

    try {
      await api.comments.delete(id);
      fetchComments();
    } catch (err) {
      console.error('댓글 삭제 중 오류 발생:', err);
      alert('댓글을 삭제하는 중 오류가 발생했습니다.');
    }
  };

  const columns = [
    {
      key: 'id',
      label: 'ID',
    },
    {
      key: 'postId',
      label: '게시글',
      render: (comment: Comment & { postId?: number }) => {
        const post = posts.find(p => p.id === comment.postId);
        return post ? truncateText(post.title, 30) : '알 수 없음';
      },
    },
    {
      key: 'authorName',
      label: '작성자',
    },
    {
      key: 'content',
      label: '내용',
      render: (comment: Comment) => (
        <div className="truncate max-w-xs" title={comment.content}>
          {truncateText(comment.content, 50)}
        </div>
      ),
    },
    {
      key: 'createdAt',
      label: '작성일',
      render: (comment: Comment) => dateUtils.formatShort(comment.createdAt),
    },
    {
      key: 'actions',
      label: '관리',
      render: (comment: Comment) => (
        <button
          onClick={() => handleDelete(comment.id)}
          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
        >
          삭제
        </button>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-4">댓글 관리</h1>

        <div className="mb-4">
          <label htmlFor="postFilter" className="block text-sm font-medium text-gray-700 mb-1">
            게시글 필터링
          </label>
          <select
            id="postFilter"
            value={selectedPostId || ''}
            onChange={e => setSelectedPostId(e.target.value ? Number(e.target.value) : null)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            <option value="">모든 게시글</option>
            {posts.map(post => (
              <option key={post.id} value={post.id}>
                {truncateText(post.title, 50)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <DataTable columns={columns} data={comments} isLoading={isLoading} error={error} />
    </div>
  );
}
