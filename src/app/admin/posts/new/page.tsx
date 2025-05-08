'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Input } from '@/components/ui/Input';
import { api } from '@/lib/api';
import { CreatePostRequest } from '@/types';
import { Category } from '@/types/blog';
import '@uiw/react-md-editor/markdown-editor.css';
import '@uiw/react-markdown-preview/markdown.css';

// next-remove-imports를 사용하여 SSR 문제 해결
const MDEditor = dynamic(
  () => import('@uiw/react-md-editor').then((mod) => mod.default),
  { ssr: false }
);

// Markdown 명령 툴바 옵션
const commands = [
  'bold', 'italic', 'strikethrough', 'hr', 'divider',
  'link', 'quote', 'code', 'image', 'divider',
  'unordered-list', 'ordered-list', 'divider',
  'preview', 'fullscreen'
];

export default function NewPostPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [summary, setSummary] = useState('');
  const [category, setCategory] = useState<number>(1); // 기본 카테고리
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedImages, setUploadedImages] = useState<{url: string, size: number}[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // 카테고리 목록 불러오기
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.categories.getList();
        setCategories(response);
        if (response.length > 0) {
          setCategory(response[0].id);
        }
      } catch (err) {
        console.error('카테고리 로딩 오류:', err);
      }
    };

    fetchCategories();
  }, []);

  // 게시글 저장
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      setError('제목을 입력해주세요.');
      return;
    }

    if (!content.trim()) {
      setError('내용을 입력해주세요.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const postData: CreatePostRequest = {
        title,
        content,
        summary: summary || title.substring(0, 100), // 요약이 없으면 제목을 사용
        category,
      };

      await api.posts.create(postData);
      router.push('/admin');
    } catch (err) {
      console.error('게시글 저장 오류:', err);
      setError('게시글을 저장하는 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 이미지 업로드 처리
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const file = files[0];

    try {
      const response = await api.images.upload(file);
      setUploadedImages(prev => [...prev, { url: response.url, size: response.size }]);
      
      // 업로드된 이미지 URL을 마크다운 형식으로 에디터에 추가
      const imageMarkdown = `![이미지](${response.url})`;
      setContent(prev => prev + '\n' + imageMarkdown);
    } catch (err) {
      console.error('이미지 업로드 오류:', err);
      setError('이미지 업로드 중 오류가 발생했습니다.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">새 게시글 작성</h1>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          취소
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          label="제목"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="게시글 제목을 입력하세요"
          className="w-full"
          required
        />

        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">내용</label>
          <div className="wmde-markdown-var"></div>
          <MDEditor
            value={content}
            onChange={(val: string | undefined) => setContent(val || '')}
            height={400}
            preview="edit"
            visiableDragbar={false}
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">이미지 첨부</label>
          <div className="flex items-center space-x-2">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={isUploading}
              className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {isUploading && <span className="text-sm text-blue-500">업로드 중...</span>}
          </div>
          
          {uploadedImages.length > 0 && (
            <div className="mt-2">
              <p className="text-sm font-medium text-gray-700 mb-1">업로드된 이미지</p>
              <ul className="space-y-1 max-h-32 overflow-y-auto border rounded-md p-2">
                {uploadedImages.map((img, idx) => (
                  <li key={idx} className="text-sm flex justify-between">
                    <a href={img.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline truncate">
                      {img.url}
                    </a>
                    <span className="text-gray-500 ml-2">{Math.round(img.size / 1024)} KB</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <Input
          label="요약 (선택사항)"
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          placeholder="게시글 요약을 입력하세요 (미입력시 제목으로 자동생성)"
          className="w-full"
        />

        <div className="space-y-1">
          <label htmlFor="category" className="block text-sm font-medium text-gray-700">
            카테고리
          </label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(Number(e.target.value))}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
          >
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            disabled={isLoading}
          >
            취소
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            disabled={isLoading}
          >
            {isLoading ? '저장 중...' : '저장'}
          </button>
        </div>
      </form>
    </div>
  );
} 