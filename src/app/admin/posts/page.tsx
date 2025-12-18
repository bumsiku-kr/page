'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DataTable from '@/components/ui/DataTable';
import { api } from '@/lib/api/index';
import { PostSummary } from '@/types';
import { dateUtils } from '@/lib/utils/date';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { useToast } from '@/components/ui/Toast';
import { useConfirm } from '@/hooks/useConfirm';
import { ConfirmModal } from '@/components/ui/Modal';

export default function PostsManagementPage() {
  useAuthGuard(); // Protect this admin route
  const router = useRouter();
  const { addToast } = useToast();
  const { confirm, confirmState, handleConfirm, handleCancel } = useConfirm();

  const [posts, setPosts] = useState<PostSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPosts, setTotalPosts] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize] = useState(10);

  const fetchPosts = async () => {
    setIsLoading(true);
    try {
      const response = await api.posts.getList(page, pageSize);
      setPosts(response.content);
      setTotalPosts(response.totalElements);
      setError(null);
    } catch (err) {
      setError('게시글을 불러오는 중 오류가 발생했습니다.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [page, pageSize]);

  const handleEdit = (id: number) => {
    router.push(`/admin/posts/edit/${id}`);
  };

  const handleDelete = async (id: number) => {
    const confirmed = await confirm({
      title: '게시글 삭제',
      message: '이 게시글을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.',
      confirmText: '삭제',
      cancelText: '취소',
    });

    if (!confirmed) return;

    try {
      await api.posts.delete(id);
      addToast('게시글이 삭제되었습니다.', 'success');
      fetchPosts();
    } catch (err) {
      console.error('게시글 삭제 중 오류 발생:', err);
      addToast('게시글을 삭제하는 중 오류가 발생했습니다.', 'error');
    }
  };

  const handleNewPost = () => {
    router.push('/admin/posts/write');
  };

  const columns = [
    {
      key: 'id',
      label: 'ID',
      render: (post: PostSummary) => (
        <div className="font-mono text-sm text-gray-600">{post.id}</div>
      ),
    },
    {
      key: 'slug',
      label: 'SLUG',
      render: (post: PostSummary) => (
        <div className="font-mono text-sm max-w-xs truncate" title={post.slug}>
          {post.slug || '-'}
        </div>
      ),
    },
    {
      key: 'title',
      label: 'TITLE',
      render: (post: PostSummary) => (
        <div className="truncate font-medium max-w-md" title={post.title}>
          {post.title}
        </div>
      ),
    },
    {
      key: 'actions',
      label: '관리',
      render: (post: PostSummary) => (
        <div className="flex space-x-2">
          <button
            onClick={() => handleEdit(post.id)}
            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            수정
          </button>
          <button
            onClick={() => handleDelete(post.id)}
            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
          >
            삭제
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">게시글 관리</h1>
        <button
          onClick={handleNewPost}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          새 게시글
        </button>
      </div>

      <DataTable columns={columns} data={posts} isLoading={isLoading} error={error} />

      {!isLoading && !error && (
        <div className="mt-4 flex justify-between items-center">
          <div>총 {totalPosts}개의 게시글</div>
          <div className="flex space-x-1">
            <button
              disabled={page === 0}
              onClick={() => setPage(page - 1)}
              className={`px-3 py-1 rounded ${
                page === 0 ? 'bg-gray-300 cursor-not-allowed' : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              이전
            </button>
            <span className="px-3 py-1">
              {page + 1} / {Math.ceil(totalPosts / pageSize)}
            </span>
            <button
              disabled={(page + 1) * pageSize >= totalPosts}
              onClick={() => setPage(page + 1)}
              className={`px-3 py-1 rounded ${
                (page + 1) * pageSize >= totalPosts
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              다음
            </button>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={confirmState.isOpen}
        onClose={handleCancel}
        onConfirm={handleConfirm}
        title={confirmState.title}
        message={confirmState.message}
        confirmText={confirmState.confirmText}
        cancelText={confirmState.cancelText}
      />
    </div>
  );
}
