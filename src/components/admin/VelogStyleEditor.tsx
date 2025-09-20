'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { api } from '@/lib/api';
import MarkdownRenderer from '@/components/ui/data-display/MarkdownRenderer';

interface VelogStyleEditorProps {
  initialValues: {
    title: string;
    content: string;
    tags: string[];
  };
  existingTags: string[];
  onSave: (data: {
    title: string;
    content: string;
    tags: string[];
    summary: string;
  }) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

export default function VelogStyleEditor({
  initialValues,
  existingTags,
  onSave,
  onCancel,
  isSubmitting,
}: VelogStyleEditorProps) {
  const [title, setTitle] = useState(initialValues.title);
  const [content, setContent] = useState(initialValues.content);
  const [tags, setTags] = useState<string[]>(initialValues.tags || []);
  const [tagInput, setTagInput] = useState('');
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const titleRef = useRef<HTMLTextAreaElement>(null);
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const tagInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 임시저장 키
  const DRAFT_KEY = 'velog-draft';

  // 자동 임시저장
  useEffect(() => {
    const interval = setInterval(() => {
      const draft = {
        title,
        content,
        tags,
        timestamp: new Date().toISOString(),
      };
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
      setLastSaved(new Date());
    }, 30000); // 30초마다 저장

    return () => clearInterval(interval);
  }, [title, content, tags]);

  // 임시저장된 데이터 불러오기
  useEffect(() => {
    if (!initialValues.title && !initialValues.content) {
      const saved = localStorage.getItem(DRAFT_KEY);
      if (saved) {
        try {
          const draft = JSON.parse(saved);
          if (confirm('임시저장된 글이 있습니다. 불러오시겠습니까?')) {
            setTitle(draft.title || '');
            setContent(draft.content || '');
            setTags(draft.tags || []);
          }
        } catch (error) {
          console.error('임시저장 데이터 로드 오류:', error);
        }
      }
    }
  }, []);

  // 제목 자동 높이 조정
  const adjustTitleHeight = useCallback(() => {
    if (titleRef.current) {
      titleRef.current.style.height = 'auto';
      titleRef.current.style.height = `${titleRef.current.scrollHeight}px`;
    }
  }, []);

  // 내용 자동 높이 조정
  const adjustContentHeight = useCallback(() => {
    if (contentRef.current) {
      contentRef.current.style.height = 'auto';
      contentRef.current.style.height = `${contentRef.current.scrollHeight}px`;
    }
  }, []);

  useEffect(() => {
    adjustTitleHeight();
  }, [title, adjustTitleHeight]);

  useEffect(() => {
    adjustContentHeight();
  }, [content, adjustContentHeight]);

  // 제목 변경 핸들러
  const handleTitleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTitle(e.target.value);
  };

  // 내용 변경 핸들러
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
  };

  // 태그 추가
  const addTag = (tagName: string) => {
    const newTag = tagName.trim();
    if (newTag && !tags.includes(newTag)) {
      setTags(prev => [...prev, newTag]);
    }
    setTagInput('');
    setShowTagSuggestions(false);
  };

  // 태그 제거
  const removeTag = (tagToRemove: string) => {
    setTags(prev => prev.filter(tag => tag !== tagToRemove));
  };

  // 태그 입력 핸들러
  const handleTagInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTagInput(value);
    setShowTagSuggestions(value.length > 0);
  };

  // 태그 입력 키 핸들러
  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(tagInput);
    } else if (e.key === 'Backspace' && !tagInput && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    }
  };

  // 필터된 태그 제안
  const filteredSuggestions = existingTags.filter(
    tag => tag.toLowerCase().includes(tagInput.toLowerCase()) && !tags.includes(tag)
  );

  // 이미지 업로드 처리
  const handleImageUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const response = await api.images.upload(file);
      const imageMarkdown = `![${file.name}](${response.url})`;

      // 커서 위치에 이미지 삽입
      if (contentRef.current) {
        const start = contentRef.current.selectionStart;
        const end = contentRef.current.selectionEnd;
        const newContent = content.slice(0, start) + imageMarkdown + content.slice(end);
        setContent(newContent);

        // 커서 위치 조정
        setTimeout(() => {
          if (contentRef.current) {
            const newCursorPos = start + imageMarkdown.length;
            contentRef.current.setSelectionRange(newCursorPos, newCursorPos);
            contentRef.current.focus();
          }
        }, 0);
      }
    } catch (error) {
      console.error('이미지 업로드 오류:', error);
      alert('이미지 업로드에 실패했습니다.');
    } finally {
      setIsUploading(false);
    }
  };

  // 드래그 앤 드롭 핸들러
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const files = Array.from(e.dataTransfer.files);
      const imageFiles = files.filter(file => file.type.startsWith('image/'));

      if (imageFiles.length > 0) {
        imageFiles.forEach(handleImageUpload);
      }
    },
    [content]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragging(false);
    }
  }, []);

  // 파일 선택 핸들러
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      handleImageUpload(files[0]);
    }
  };

  // 저장 핸들러
  const handleSave = async () => {
    if (!title.trim()) {
      alert('제목을 입력해주세요.');
      titleRef.current?.focus();
      return;
    }

    if (!content.trim()) {
      alert('내용을 입력해주세요.');
      contentRef.current?.focus();
      return;
    }

    const summary = content
      .substring(0, 200)
      .replace(/[#*`\[\]]/g, '')
      .trim();

    try {
      await onSave({ title, content, tags, summary });
      localStorage.removeItem(DRAFT_KEY); // 저장 성공시 임시저장 삭제
    } catch (error) {
      console.error('저장 오류:', error);
    }
  };

  // 키보드 단축키
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [title, content, tags]);

  return (
    <div className="min-h-screen bg-white">
      {/* 헤더 */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={onCancel}
              className="text-gray-600 hover:text-gray-800 transition-colors"
            >
              ← 나가기
            </button>

            <div className="flex items-center gap-4">
              {lastSaved && (
                <span className="text-sm text-gray-500">
                  {lastSaved.toLocaleTimeString()} 임시저장됨
                </span>
              )}

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsPreviewMode(!isPreviewMode)}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  {isPreviewMode ? '편집' : '미리보기'}
                </button>

                <button
                  onClick={handleSave}
                  disabled={isSubmitting}
                  className="px-4 py-1.5 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors"
                >
                  {isSubmitting ? '저장 중...' : '출간하기'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {!isPreviewMode ? (
          <div
            className={`space-y-6 ${isDragging ? 'bg-blue-50 border-2 border-dashed border-blue-300 rounded-lg p-4' : ''}`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            {isDragging && (
              <div className="text-center text-blue-600 font-medium">
                이미지를 여기에 드롭하세요
              </div>
            )}

            {/* 제목 입력 */}
            <div>
              <textarea
                ref={titleRef}
                value={title}
                onChange={handleTitleChange}
                placeholder="제목을 입력하세요"
                className="w-full text-4xl font-bold placeholder-gray-300 border-none outline-none resize-none overflow-hidden"
                rows={1}
              />
            </div>

            {/* 태그 입력 */}
            <div className="relative">
              <div className="flex flex-wrap gap-2 mb-3">
                {tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm"
                  >
                    {tag}
                    <button
                      onClick={() => removeTag(tag)}
                      className="ml-2 text-gray-500 hover:text-gray-700"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>

              <input
                ref={tagInputRef}
                type="text"
                value={tagInput}
                onChange={handleTagInput}
                onKeyDown={handleTagKeyDown}
                onFocus={() => setShowTagSuggestions(tagInput.length > 0)}
                onBlur={() => setTimeout(() => setShowTagSuggestions(false), 200)}
                placeholder="태그를 입력하세요"
                className="w-full text-lg placeholder-gray-400 border-none outline-none"
              />

              {/* 태그 제안 */}
              {showTagSuggestions && filteredSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg z-20 max-h-40 overflow-y-auto">
                  {filteredSuggestions.slice(0, 5).map((tag, index) => (
                    <button
                      key={index}
                      onClick={() => addTag(tag)}
                      className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 내용 입력 */}
            <div className="relative">
              <textarea
                ref={contentRef}
                value={content}
                onChange={handleContentChange}
                placeholder="당신의 이야기를 적어보세요..."
                className="w-full text-lg leading-relaxed placeholder-gray-400 border-none outline-none resize-none overflow-hidden min-h-[500px]"
              />

              {/* 이미지 업로드 버튼 */}
              <div className="absolute bottom-4 left-0">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 bg-gray-50 hover:bg-gray-100 rounded-md transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  {isUploading ? '업로드 중...' : '이미지 추가'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* 미리보기 모드 */
          <div className="space-y-6">
            <h1 className="text-4xl font-bold">{title || '제목을 입력하세요'}</h1>

            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <MarkdownRenderer content={content || '내용을 입력하세요...'} />
          </div>
        )}
      </div>
    </div>
  );
}
