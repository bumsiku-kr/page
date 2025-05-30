'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { Input } from '@/components/ui/Input';
import { api } from '@/lib/api';
import { Category } from '@/types/blog';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import '@uiw/react-md-editor/markdown-editor.css';
import '@uiw/react-markdown-preview/markdown.css';

// next-remove-imports를 사용하여 SSR 문제 해결
const MDEditor = dynamic(
  () => import('@uiw/react-md-editor').then((mod) => mod.default),
  { ssr: false }
);

interface PostFormProps {
  initialValues: {
    title: string;
    content: string;
    summary: string;
    category: number;
  };
  categories: Category[];
  isSubmitting: boolean;
  error: string | null;
  pageTitle: string;
  submitButtonText: string;
  onSubmit: (formData: {
    title: string;
    content: string;
    summary: string;
    category: number;
  }) => Promise<void>;
  onCancel: () => void;
}

export default function PostForm({
  initialValues,
  categories,
  isSubmitting,
  error,
  pageTitle,
  submitButtonText,
  onSubmit,
  onCancel,
}: PostFormProps) {
  const [title, setTitle] = useState(initialValues.title);
  const [content, setContent] = useState(initialValues.content);
  const [summary, setSummary] = useState(initialValues.summary);
  const [category, setCategory] = useState<number>(initialValues.category);
  const [formError, setFormError] = useState<string | null>(error);
  const [uploadedImages, setUploadedImages] = useState<{url: string, size: number}[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // 폼 제출 처리
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      setFormError('제목을 입력해주세요.');
      return;
    }

    if (!content.trim()) {
      setFormError('내용을 입력해주세요.');
      return;
    }

    try {
      await onSubmit({
        title,
        content,
        summary: summary || title.substring(0, 100),
        category,
      });
    } catch (err) {
      console.error('폼 제출 오류:', err);
      setFormError('저장 중 오류가 발생했습니다.');
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
      setFormError('이미지 업로드 중 오류가 발생했습니다.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{pageTitle}</h1>
        <button
          onClick={onCancel}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          취소
        </button>
      </div>

      {(formError || error) && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
          <p>{formError || error}</p>
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
            visibleDragbar={false}
            previewOptions={{
              rehypePlugins: [rehypeRaw, rehypeSanitize],
              components: {
                code: ({ node, inline, className, children, ...props }: any) => {
                  const match = /language-(\w+)/.exec(className || '');
                  return !inline && match ? (
                    <SyntaxHighlighter
                      style={oneLight}
                      language={match[1]}
                      PreTag="div"
                      customStyle={{
                        backgroundColor: '#fafafa',
                        padding: '1rem',
                        overflow: 'auto',
                        maxWidth: '100%',
                      }}
                      {...props}
                    >
                      {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                  ) : (
                    <code className={inline ? 'inline-code' : className} {...props}>
                      {children}
                    </code>
                  );
                }
              },
              className: 'prose max-w-none bg-white prose-headings:my-4 prose-h1:text-2xl prose-h1:font-bold prose-h2:text-xl prose-h2:font-semibold prose-h3:text-lg prose-h3:font-medium prose-h4:text-base prose-h4:font-medium prose-p:text-base prose-p:my-2 prose-ul:my-2 prose-ol:my-2 prose-li:my-1 prose-li:text-base prose-pre:text-sm prose-pre:bg-transparent prose-pre:p-0 prose-pre:m-0 prose-pre:border-0 prose-pre:shadow-none prose-pre:rounded-none prose-code:text-sm prose-code:bg-gray-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none prose-img:my-4'
            }}
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
            onClick={onCancel}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            disabled={isSubmitting}
          >
            취소
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            disabled={isSubmitting}
          >
            {isSubmitting ? '저장 중...' : submitButtonText}
          </button>
        </div>
      </form>
    </div>
  );
} 