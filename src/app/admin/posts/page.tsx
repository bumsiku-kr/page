'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DataTable from '@/components/ui/DataTable';
import { api } from '@/lib/api/index';
import { AdminPostSummary } from '@/types';
import { dateUtils } from '@/lib/utils/date';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { useToast } from '@/components/ui/Toast';
import { useConfirm } from '@/hooks/useConfirm';
import { ConfirmModal } from '@/components/ui/Modal';

type LocaleTab = 'ko' | 'en';

export default function PostsManagementPage() {
  useAuthGuard();
  const router = useRouter();
  const { addToast } = useToast();
  const { confirm, confirmState, handleConfirm, handleCancel } = useConfirm();

  const [activeTab, setActiveTab] = useState<LocaleTab>('ko');
  const [posts, setPosts] = useState<AdminPostSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPosts, setTotalPosts] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize] = useState(10);
  const [translatingId, setTranslatingId] = useState<number | null>(null);

  const fetchPosts = async () => {
    setIsLoading(true);
    try {
      const response = await api.posts.getAdminList(page, pageSize, 'createdAt,desc', activeTab);
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
    setPage(0);
  }, [activeTab]);

  useEffect(() => {
    fetchPosts();
  }, [page, pageSize, activeTab]);

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

  const handleTranslate = async (id: number) => {
    setTranslatingId(id);
    try {
      const result = await api.posts.translate(id, 'en');
      if (result.success) {
        addToast('번역이 생성되었습니다. English 탭에서 확인하세요.', 'success');
        // Switch to English tab to show the new translation
        setActiveTab('en');
      }
    } catch (err) {
      console.error('번역 생성 중 오류 발생:', err);
      addToast('번역 생성에 실패했습니다.', 'error');
    } finally {
      setTranslatingId(null);
    }
  };

  const handleNewPost = () => {
    router.push('/admin/posts/write');
  };

  const stateStyles: Record<string, string> = {
    published: 'bg-green-100 text-green-800',
    scheduled: 'bg-yellow-100 text-yellow-800',
    draft: 'bg-gray-100 text-gray-800',
  };

  const stateLabels: Record<string, string> = {
    published: '발행됨',
    scheduled: '예약됨',
    draft: '임시저장',
  };

  const columns = [
    {
      key: 'id',
      label: 'ID',
      render: (post: AdminPostSummary) => (
        <div className="font-mono text-sm text-gray-600">{post.id}</div>
      ),
    },
    {
      key: 'state',
      label: '상태',
      render: (post: AdminPostSummary) => (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${stateStyles[post.state] || stateStyles.draft}`}
        >
          {stateLabels[post.state] || post.state}
        </span>
      ),
    },
    {
      key: 'title',
      label: 'TITLE',
      render: (post: AdminPostSummary) => (
        <div className="truncate font-medium max-w-md" title={post.title}>
          {post.title}
        </div>
      ),
    },
    {
      key: 'createdAt',
      label: '발행일',
      render: (post: AdminPostSummary) => (
        <span className="text-sm text-gray-600">{dateUtils.formatShort(post.createdAt)}</span>
      ),
    },
    {
      key: 'actions',
      label: '관리',
      render: (post: AdminPostSummary) => (
        <div className="flex space-x-2">
          <button
            onClick={() => handleEdit(post.id)}
            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            수정
          </button>
          {activeTab === 'ko' && (
            <button
              onClick={() => handleTranslate(post.id)}
              disabled={translatingId === post.id || post.hasTranslation}
              className="px-3 py-1 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
              title={post.hasTranslation ? '이미 번역됨' : '영어로 번역'}
            >
              {translatingId === post.id ? '번역 중...' : post.hasTranslation ? '번역됨' : '번역'}
            </button>
          )}
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

      {/* Locale Tabs */}
      <div className="mb-4 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('ko')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'ko'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            한국어
          </button>
          <button
            onClick={() => setActiveTab('en')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'en'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            English
          </button>
        </nav>
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
              {page + 1} / {Math.max(1, Math.ceil(totalPosts / pageSize))}
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
