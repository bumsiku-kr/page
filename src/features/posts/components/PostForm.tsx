'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Controller } from 'react-hook-form';
import { Input } from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { api } from '@/lib/api/index';
import { usePostForm, generateSlug } from '../hooks/usePostForm';
import type { CreatePostInput } from '@/shared/types/schemas';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import '@uiw/react-md-editor/markdown-editor.css';
import '@uiw/react-markdown-preview/markdown.css';

const MDEditor = dynamic(() => import('@uiw/react-md-editor').then(mod => mod.default), {
  ssr: false,
});

interface PostFormProps {
  initialValues?: Partial<CreatePostInput>;
  existingTags?: string[];
  pageTitle: string;
  submitButtonText: string;
  onSubmit: (data: CreatePostInput) => Promise<void>;
  onCancel: () => void;
}

export default function PostForm({
  initialValues,
  existingTags = [],
  pageTitle,
  submitButtonText,
  onSubmit,
  onCancel,
}: PostFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
    control,
  } = usePostForm(initialValues);

  const [tagInput, setTagInput] = useState('');
  const [uploadedImages, setUploadedImages] = useState<{ url: string; size: number }[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const title = watch('title');
  const slug = watch('slug');
  const content = watch('content');
  const tags = watch('tags');

  // Auto-generate slug from title
  useEffect(() => {
    if (!initialValues?.slug && title) {
      setValue('slug', generateSlug(title));
    }
  }, [title, setValue, initialValues?.slug]);

  // Tag management
  const addTag = (value: string) => {
    const newTag = value.trim();
    if (!newTag || tags.includes(newTag)) {
      setTagInput('');
      return;
    }
    setValue('tags', [...tags, newTag]);
    setTagInput('');
  };

  const removeTag = (value: string) => {
    setValue(
      'tags',
      tags.filter(t => t !== value)
    );
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(tagInput);
    } else if (e.key === 'Backspace' && !tagInput && tags.length) {
      e.preventDefault();
      setValue('tags', tags.slice(0, -1));
    }
  };

  // Image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const file = files[0];

    try {
      // Compress image before upload
      const { compressImage } = await import('@/lib/utils/imageCompression');
      const compressedFile = await compressImage(file, {
        quality: 0.85,
        maxWidth: 2048,
        maxHeight: 2048,
        preferredFormat: 'webp',
      });

      const response = await api.images.upload(compressedFile);
      // New backend returns { url, key } instead of { url, size }
      setUploadedImages(prev => [...prev, { url: response.url, size: compressedFile.size }]);

      const imageMarkdown = `![이미지](${response.url})`;
      setValue('content', content + '\n' + imageMarkdown);
    } catch (err) {
      console.error('이미지 업로드 오류:', err);
      setFormError('이미지 업로드 중 오류가 발생했습니다.');
    } finally {
      setIsUploading(false);
    }
  };

  // AI summary generation
  const handleGenerateSummary = async () => {
    if (!content.trim() && !title.trim()) {
      setFormError('요약할 내용 또는 제목이 필요합니다.');
      return;
    }

    // AI service temporarily disabled
    setFormError('AI 요약 기능은 현재 사용할 수 없습니다.');
    return;

    // TODO: Re-enable when backend supports AI endpoints
    // setIsSummarizing(true);
    // try {
    //   const text = content?.trim() ? content : title;
    //   const { summary: generated } = await api.ai.generateSummary({ text });
    //   if (!generated) {
    //     setFormError('요약 결과가 비어 있습니다.');
    //     return;
    //   }
    //   setValue('summary', generated);
    // } catch (err) {
    //   console.error('요약 생성 오류:', err);
    //   setFormError('요약 생성 중 오류가 발생했습니다.');
    // } finally {
    //   setIsSummarizing(false);
    // }
  };

  const onFormSubmit = async (data: CreatePostInput) => {
    try {
      setFormError(null);
      await onSubmit({
        ...data,
        summary: data.summary || title.substring(0, 100),
      });
    } catch (err) {
      console.error('폼 제출 오류:', err);
      setFormError('저장 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{pageTitle}</h1>
        <Button onClick={onCancel} variant="outline">
          취소
        </Button>
      </div>

      {formError && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
          <p>{formError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
        {/* Title */}
        <Input
          label="제목"
          {...register('title')}
          placeholder="게시글 제목을 입력하세요"
          error={errors.title?.message}
        />

        {/* Slug */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-gray-700">
              Slug <span className="text-red-500">*</span>
            </label>
            <button
              type="button"
              onClick={() => setValue('slug', generateSlug(title))}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              제목에서 자동 생성
            </button>
          </div>
          <Input
            {...register('slug')}
            placeholder="url-friendly-slug"
            className="font-mono text-sm"
            error={errors.slug?.message}
          />
          <p className="text-xs text-gray-500">
            URL에서 사용될 고유 식별자입니다. 영문 소문자, 숫자, 한글, 하이픈만 사용 가능합니다.
          </p>
          {slug && (
            <p className="text-xs text-blue-600">
              미리보기: <code className="bg-gray-100 px-1 rounded">/posts/{slug}</code>
            </p>
          )}
        </div>

        {/* Content */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">내용</label>
          <Controller
            name="content"
            control={control}
            render={({ field }) => (
              <MDEditor
                value={field.value}
                onChange={(val: string | undefined) => field.onChange(val || '')}
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
                    },
                  },
                  className:
                    'prose max-w-none bg-white prose-headings:my-4 prose-h1:text-2xl prose-h1:font-bold prose-h2:text-xl prose-h2:font-semibold prose-h3:text-lg prose-h3:font-medium prose-h4:text-base prose-h4:font-medium prose-p:text-base prose-p:my-2 prose-ul:my-2 prose-ol:my-2 prose-li:my-1 prose-li:text-base prose-pre:text-sm prose-pre:bg-transparent prose-pre:p-0 prose-pre:m-0 prose-pre:border-0 prose-pre:shadow-none prose-pre:rounded-none prose-code:text-sm prose-code:bg-gray-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none prose-img:my-4',
                }}
              />
            )}
          />
          {errors.content && <p className="text-sm text-red-600">{errors.content.message}</p>}
        </div>

        {/* Image Upload */}
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
                    <a
                      href={img.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline truncate"
                    >
                      {img.url}
                    </a>
                    <span className="text-gray-500 ml-2">{Math.round(img.size / 1024)} KB</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Summary */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-gray-700">요약 (선택사항)</label>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={handleGenerateSummary}
              isLoading={isSummarizing}
              aria-label="요약 자동 생성"
            >
              Summary 생성
            </Button>
          </div>
          <Textarea
            {...register('summary')}
            placeholder="게시글 요약을 입력하세요 (미입력시 제목으로 자동생성)"
            rows={5}
            error={errors.summary?.message}
          />
        </div>

        {/* Tags */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">태그</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {tags.map(tag => (
              <span
                key={tag}
                className="inline-flex items-center px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded"
              >
                #{tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="ml-1 text-blue-600 hover:text-blue-800"
                  aria-label={`${tag} 태그 제거`}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <input
            type="text"
            value={tagInput}
            onChange={e => setTagInput(e.target.value)}
            onKeyDown={handleTagKeyDown}
            placeholder="태그를 입력하고 Enter 또는 , 를 누르세요"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
          />
          {tagInput && (
            <div className="mt-2 border rounded-md divide-y bg-white">
              {existingTags
                .filter(t => t.toLowerCase().includes(tagInput.toLowerCase()))
                .slice(0, 8)
                .map(s => (
                  <button
                    type="button"
                    key={s}
                    onClick={() => addTag(s)}
                    className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm"
                  >
                    #{s}
                  </button>
                ))}
            </div>
          )}
          <p className="text-xs text-gray-500">
            자유롭게 태그를 입력하거나 기존 태그를 선택하세요.
          </p>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4">
          <Button type="button" onClick={onCancel} variant="outline" disabled={isSubmitting}>
            취소
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? '저장 중...' : submitButtonText}
          </Button>
        </div>
      </form>
    </div>
  );
}
