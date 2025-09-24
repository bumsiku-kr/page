'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { api } from '@/lib/api';
import MarkdownRenderer from '@/components/ui/data-display/MarkdownRenderer';

interface VelogWriteEditorProps {
  initialValues: {
    title: string;
    content: string;
    tags: string[];
    summary?: string;
    slug?: string;
  };
  existingTags: string[];
  onSave: (data: {
    title: string;
    content: string;
    tags: string[];
    summary: string;
    slug: string;
  }) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

export default function VelogWriteEditor({
  initialValues,
  existingTags,
  onSave,
  onCancel,
  isSubmitting,
}: VelogWriteEditorProps) {
  const [title, setTitle] = useState(initialValues.title);
  const [content, setContent] = useState(initialValues.content);
  const [tags, setTags] = useState<string[]>(initialValues.tags || []);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isSplitMode, setIsSplitMode] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [showDraftModal, setShowDraftModal] = useState(false);
  const [isManualSaving, setIsManualSaving] = useState(false);
  const [summary, setSummary] = useState(initialValues.summary || '');
  const [slug, setSlug] = useState(initialValues.slug || '');
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [isGeneratingSlug, setIsGeneratingSlug] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);

  const titleRef = useRef<HTMLTextAreaElement>(null);
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const tagInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 임시저장 키
  const DRAFTS_KEY = 'velog-drafts';

  // slug 생성 함수
  const generateSlug = useCallback((title: string): string => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9가-힣\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
      .replace(/^-|-$/g, '');
  }, []);

  // 초기값 설정
  useEffect(() => {
    if (initialValues.title && !slug) {
      setSlug(generateSlug(initialValues.title));
    }
  }, [initialValues.title, slug, generateSlug]);

  // 임시저장된 글 목록 가져오기
  const getDraftsList = useCallback(() => {
    try {
      const saved = localStorage.getItem(DRAFTS_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('임시저장 목록 로드 오류:', error);
      return [];
    }
  }, [DRAFTS_KEY]);

  // 수동 임시저장
  const handleManualSave = useCallback(() => {
    if (!title.trim() && !content.trim()) {
      alert('제목 또는 내용을 입력해주세요.');
      return;
    }

    setIsManualSaving(true);

    try {
      const drafts = getDraftsList();
      const now = new Date();
      const timestamp = now.toISOString();
      const draftTitle = title.trim() || '제목 없음';

      // 같은 제목의 기존 임시저장 제거
      const filteredDrafts = drafts.filter((draft: any) => draft.title !== draftTitle);

      const newDraft = {
        id: `${timestamp}-${draftTitle}`,
        title: draftTitle,
        content,
        tags,
        summary,
        slug,
        timestamp,
        displayName: `${now.toLocaleString()} - ${draftTitle}`,
      };

      const updatedDrafts = [newDraft, ...filteredDrafts];
      localStorage.setItem(DRAFTS_KEY, JSON.stringify(updatedDrafts));

      alert('임시저장되었습니다.');
    } catch (error) {
      console.error('임시저장 오류:', error);
      alert('임시저장에 실패했습니다.');
    } finally {
      setIsManualSaving(false);
    }
  }, [title, content, tags, summary, slug, getDraftsList, DRAFTS_KEY]);

  // 임시저장 글 불러오기
  const handleLoadDraft = useCallback((draft: any) => {
    setTitle(draft.title || '');
    setContent(draft.content || '');
    setTags(draft.tags || []);
    setSummary(draft.summary || '');
    setSlug(draft.slug || '');
    setShowDraftModal(false);
  }, []);

  // 임시저장 글 삭제
  const handleDeleteDraft = useCallback(
    (draftId: string, draftTitle: string) => {
      if (!confirm(`"${draftTitle}"을(를) 삭제하시겠습니까?`)) {
        return;
      }

      try {
        const drafts = getDraftsList();
        const filteredDrafts = drafts.filter((draft: any) => draft.id !== draftId);
        localStorage.setItem(DRAFTS_KEY, JSON.stringify(filteredDrafts));

        // 모달을 강제로 새로고침하기 위해 상태를 업데이트
        setShowDraftModal(false);
        setTimeout(() => setShowDraftModal(true), 0);
      } catch (error) {
        console.error('임시저장 삭제 오류:', error);
        alert('임시저장 삭제에 실패했습니다.');
      }
    },
    [getDraftsList, DRAFTS_KEY]
  );

  // 모든 임시저장 글 삭제
  const handleDeleteAllDrafts = useCallback(() => {
    const drafts = getDraftsList();
    if (drafts.length === 0) {
      alert('삭제할 임시저장이 없습니다.');
      return;
    }

    if (
      !confirm(
        `총 ${drafts.length}개의 임시저장을 모두 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`
      )
    ) {
      return;
    }

    try {
      localStorage.setItem(DRAFTS_KEY, JSON.stringify([]));

      // 모달을 강제로 새로고침하기 위해 상태를 업데이트
      setShowDraftModal(false);
      setTimeout(() => setShowDraftModal(true), 0);
    } catch (error) {
      console.error('임시저장 전체 삭제 오류:', error);
      alert('임시저장 전체 삭제에 실패했습니다.');
    }
  }, [getDraftsList, DRAFTS_KEY]);

  // 임시저장된 데이터 확인 및 목록 표시 제안 (편집 모드에서만)
  useEffect(() => {
    // 편집 모드가 아닌 경우 (새 글 작성)에는 임시저장 확인하지 않음
    if (!initialValues.title && !initialValues.content) {
      // 새 글 작성 시에는 임시저장 확인 안내를 하지 않음
      return;
    }
  }, [initialValues.title, initialValues.content, getDraftsList]);

  // 제목 자동 높이 조정
  const adjustTitleHeight = useCallback(() => {
    if (titleRef.current) {
      titleRef.current.style.height = 'auto';
      titleRef.current.style.height = `${titleRef.current.scrollHeight}px`;
    }
  }, []);

  useEffect(() => {
    adjustTitleHeight();
  }, [title, adjustTitleHeight]);

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
    if (newTag && !tags.includes(newTag) && tags.length < 10) {
      setTags(prev => [...prev, newTag]);
    }
    setTagInput('');
    setShowTagSuggestions(false);
  };

  // 태그 제거
  const removeTag = (tagToRemove: string) => {
    setTags(prev => prev.filter(tag => tag !== tagToRemove));
  };

  // 태그 입력 핸들러 (출간 모달용)
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
  const filteredSuggestions = useMemo(
    () =>
      existingTags
        .filter(tag => tag.toLowerCase().includes(tagInput.toLowerCase()) && !tags.includes(tag))
        .slice(0, 5),
    [existingTags, tagInput, tags]
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
        const newContent =
          content.slice(0, start) + '\n' + imageMarkdown + '\n' + content.slice(end);
        setContent(newContent);

        // 커서 위치 조정
        setTimeout(() => {
          if (contentRef.current) {
            const newCursorPos = start + imageMarkdown.length + 2;
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

  // 출간 모달 열기
  const handlePublish = () => {
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

    // 모달 열 때 기본값 설정하지 않음 (사용자가 직접 생성하도록)

    setShowPublishModal(true);
  };

  // slug 유효성 검증
  const validateSlug = (slug: string): string | null => {
    if (!slug.trim()) {
      return 'URL 주소는 필수입니다.';
    }

    if (slug.length < 1 || slug.length > 100) {
      return 'URL 주소는 1-100자 사이여야 합니다.';
    }

    if (!/^[a-z0-9가-힣-]+$/.test(slug)) {
      return 'URL 주소는 영문 소문자, 숫자, 한글, 하이픈만 포함할 수 있습니다.';
    }

    if (slug.startsWith('-') || slug.endsWith('-')) {
      return 'URL 주소는 하이픈으로 시작하거나 끝날 수 없습니다.';
    }

    if (slug.includes('--')) {
      return 'URL 주소에는 연속된 하이픈을 사용할 수 없습니다.';
    }

    return null;
  };

  // 실제 저장 처리
  const handleActualSave = async () => {
    // 유효성 검증
    if (!summary.trim()) {
      alert('요약을 입력해주세요.');
      return;
    }

    const slugError = validateSlug(slug);
    if (slugError) {
      alert(slugError);
      return;
    }

    try {
      await onSave({ title, content, tags, summary, slug });

      // 저장 성공시 해당 제목의 임시저장 삭제
      try {
        const drafts = getDraftsList();
        const filteredDrafts = drafts.filter((draft: any) => draft.title !== title.trim());
        localStorage.setItem(DRAFTS_KEY, JSON.stringify(filteredDrafts));
      } catch (error) {
        console.error('임시저장 정리 오류:', error);
      }

      setShowPublishModal(false);
      // 모달 상태 리셋
      setTagInput('');
      setShowTagSuggestions(false);
    } catch (error) {
      console.error('저장 오류:', error);
    }
  };

  // 텍스트 감싸기 함수
  const wrapSelectedText = useCallback((prefix: string, suffix?: string) => {
    if (!contentRef.current) return;
    
    const textarea = contentRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.slice(start, end);
    const actualSuffix = suffix || prefix;
    
    let newText;
    let newCursorPos;
    
    if (selectedText) {
      // 텍스트가 선택된 경우: 선택된 텍스트를 감싸기
      newText = content.slice(0, start) + prefix + selectedText + actualSuffix + content.slice(end);
      newCursorPos = end + prefix.length + actualSuffix.length;
    } else {
      // 텍스트가 선택되지 않은 경우: 커서 위치에 prefix+suffix 삽입하고 커서를 중간에 위치
      newText = content.slice(0, start) + prefix + actualSuffix + content.slice(start);
      newCursorPos = start + prefix.length;
    }
    
    setContent(newText);
    
    // 다음 렌더링 후 커서 위치 설정
    setTimeout(() => {
      if (contentRef.current) {
        contentRef.current.setSelectionRange(newCursorPos, newCursorPos);
        contentRef.current.focus();
      }
    }, 0);
  }, [content]);

  // 키보드 단축키
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 입력 필드에서 이벤트가 발생한 경우 마크다운 단축키 무시
      const isInInput = e.target instanceof HTMLElement && 
        (e.target.tagName === 'INPUT' || 
         (e.target.tagName === 'TEXTAREA' && e.target !== contentRef.current));
      
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        if (e.shiftKey) {
          // Cmd/Ctrl + Shift + S: 임시저장
          handleManualSave();
        } else {
          // Cmd/Ctrl + S: 출간
          handlePublish();
        }
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'p') {
        e.preventDefault();
        setIsPreviewMode(!isPreviewMode);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'o') {
        e.preventDefault();
        setShowDraftModal(true);
      }
      
      // 마크다운 포맷팅 단축키 (콘텐츠 에디터에서만)
      if (!isInInput && contentRef.current && e.target === contentRef.current) {
        if ((e.metaKey || e.ctrlKey) && e.key === 'e') {
          e.preventDefault();
          wrapSelectedText('`');
        }
        if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
          e.preventDefault();
          wrapSelectedText('**');
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isPreviewMode, handleManualSave, handlePublish, wrapSelectedText]);

  return (
    <div className="min-h-screen bg-white">
      {/* 헤더 */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={onCancel}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              <span className="hidden sm:inline">나가기</span>
            </button>

            <div className="flex items-center gap-2 sm:gap-4">
              <div className="flex items-center gap-1 sm:gap-2">
                <button
                  onClick={() => setShowDraftModal(true)}
                  className="px-2 sm:px-3 py-1.5 text-xs sm:text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  <span className="hidden sm:inline">불러오기</span>
                  <span className="sm:hidden">📂</span>
                </button>

                <button
                  onClick={handleManualSave}
                  disabled={isManualSaving}
                  className="px-2 sm:px-3 py-1.5 text-xs sm:text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 transition-colors"
                >
                  {isManualSaving ? (
                    '저장 중...'
                  ) : (
                    <>
                      <span className="hidden sm:inline">임시저장</span>
                      <span className="sm:hidden">💾</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => setIsSplitMode(!isSplitMode)}
                  className={`px-2 sm:px-3 py-1.5 text-xs sm:text-sm border rounded-md transition-colors hidden lg:block ${
                    isSplitMode
                      ? 'bg-blue-50 border-blue-300 text-blue-700'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  나란히
                </button>

                <button
                  onClick={() => setIsPreviewMode(!isPreviewMode)}
                  className={`px-2 sm:px-3 py-1.5 text-xs sm:text-sm border rounded-md transition-colors ${
                    isPreviewMode
                      ? 'bg-blue-50 border-blue-300 text-blue-700'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {isPreviewMode ? '편집' : '미리보기'}
                </button>

                <button
                  onClick={handlePublish}
                  disabled={isSubmitting}
                  className="px-3 sm:px-4 py-1.5 bg-green-600 text-white text-xs sm:text-sm rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors"
                >
                  {isSubmitting ? '출간 중...' : '출간하기'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      <div
        className={`${isSplitMode ? 'max-w-7xl' : 'max-w-4xl'} mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8`}
      >
        <div className={`${isSplitMode ? 'hidden lg:grid lg:grid-cols-2 gap-8' : ''}`}>
          {/* 편집 영역 */}
          {(!isPreviewMode || isSplitMode) && (
            <div
              className={`space-y-6 ${isDragging ? 'bg-blue-50 border-2 border-dashed border-blue-300 rounded-lg p-4' : ''}`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              {isDragging && (
                <div className="text-center text-blue-600 font-medium py-8">
                  <svg
                    className="w-12 h-12 mx-auto mb-4 text-blue-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
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
                  className="w-full text-2xl sm:text-3xl lg:text-4xl font-bold placeholder-gray-300 border-none outline-none resize-none overflow-hidden bg-transparent"
                  rows={1}
                />
              </div>

              {/* 내용 입력 */}
              <div className="relative">
                <textarea
                  ref={contentRef}
                  value={content}
                  onChange={handleContentChange}
                  placeholder="당신의 이야기를 적어보세요..."
                  className="w-full text-base sm:text-lg leading-relaxed placeholder-gray-400 border-none outline-none resize-none bg-transparent min-h-[400px] sm:min-h-[500px] lg:min-h-[600px]"
                />

                {/* 하단 툴바 */}
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-4">
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
                      className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 bg-gray-50 hover:bg-gray-100 rounded-md transition-colors disabled:opacity-50"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
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

                  <div className="text-sm text-gray-500">{content.length.toLocaleString()} 자</div>
                </div>
              </div>
            </div>
          )}

          {/* 미리보기 영역 */}
          {(isPreviewMode || isSplitMode) && (
            <div className={`${isSplitMode ? 'border-l border-gray-200 pl-4 sm:pl-8' : ''}`}>
              <div className="space-y-4 sm:space-y-6">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight">
                  {title || '제목을 입력하세요'}
                </h1>

                <div className="border-t border-gray-200 pt-6">
                  <MarkdownRenderer content={content || '내용을 입력하세요...'} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 출간 모달 */}
      {showPublishModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold mb-4">포스트 출간</h3>

            <div className="space-y-4 mb-6">
              {/* 요약 입력 */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    요약 <span className="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={async () => {
                      if (!content.trim()) {
                        alert('요약할 내용이 필요합니다.');
                        return;
                      }
                      setIsSummarizing(true);
                      try {
                        const { summary: generated } = await api.ai.generateSummary({
                          text: content,
                        });
                        if (generated) {
                          setSummary(generated);
                        } else {
                          alert('요약 생성에 실패했습니다.');
                        }
                      } catch (err) {
                        console.error('요약 생성 오류:', err);
                        alert('요약 생성 중 오류가 발생했습니다.');
                      } finally {
                        setIsSummarizing(false);
                      }
                    }}
                    disabled={isSummarizing || !content.trim()}
                    className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 disabled:opacity-50 transition-colors"
                  >
                    {isSummarizing ? '생성 중...' : 'AI 요약 생성'}
                  </button>
                </div>
                <textarea
                  value={summary}
                  onChange={e => setSummary(e.target.value)}
                  placeholder="포스트 요약을 입력하세요..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                  rows={3}
                  maxLength={200}
                />
                <div className="text-xs text-gray-500 mt-1">{summary.length}/200자</div>
              </div>

              {/* URL 주소 입력 */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    URL 주소 <span className="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={async () => {
                      if (!title.trim() || !content.trim()) {
                        alert('제목과 내용을 입력해주세요.');
                        return;
                      }
                      setIsGeneratingSlug(true);
                      try {
                        const { slug: generated } = await api.ai.generateSlug({
                          title: title.trim(),
                          text: content.trim(),
                        });
                        if (generated) {
                          setSlug(generated);
                        } else {
                          alert('slug 생성에 실패했습니다.');
                        }
                      } catch (err) {
                        console.error('slug 생성 오류:', err);
                        alert('slug 생성 중 오류가 발생했습니다.');
                      } finally {
                        setIsGeneratingSlug(false);
                      }
                    }}
                    disabled={isGeneratingSlug || !title.trim() || !content.trim()}
                    className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 disabled:opacity-50 transition-colors"
                  >
                    {isGeneratingSlug ? '생성 중...' : 'AI slug 생성'}
                  </button>
                </div>
                <input
                  type="text"
                  value={slug}
                  onChange={e => setSlug(e.target.value.toLowerCase())}
                  placeholder="url-friendly-slug"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent font-mono text-sm"
                />
                <div className="text-xs text-gray-500 mt-1">
                  {slug && (
                    <span className="text-green-600">
                      미리보기: <code className="bg-gray-100 px-1 rounded">/posts/{slug}</code>
                    </span>
                  )}
                </div>
              </div>

              {/* 태그 입력 */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">태그</label>

                {/* 기존 태그들 */}
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-1 text-blue-600 hover:text-blue-800 font-bold"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {/* 태그 입력 */}
                <input
                  ref={tagInputRef}
                  type="text"
                  value={tagInput}
                  onChange={handleTagInput}
                  onKeyDown={handleTagKeyDown}
                  onFocus={() => setShowTagSuggestions(tagInput.length > 0)}
                  onBlur={() => setTimeout(() => setShowTagSuggestions(false), 200)}
                  placeholder={
                    tags.length < 10
                      ? '태그를 입력하고 Enter를 누르세요 (최대 10개)'
                      : '태그는 최대 10개까지 입력할 수 있습니다'
                  }
                  disabled={tags.length >= 10}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm disabled:opacity-50"
                />

                {/* 태그 제안 */}
                {showTagSuggestions && filteredSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-30 max-h-40 overflow-y-auto mt-1">
                    {filteredSuggestions.map((tag, index) => (
                      <button
                        type="button"
                        key={index}
                        onClick={() => addTag(tag)}
                        className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm border-b border-gray-100 last:border-b-0"
                      >
                        #{tag}
                      </button>
                    ))}
                  </div>
                )}

                <div className="text-xs text-gray-500 mt-1">
                  포스트와 관련된 태그를 추가해보세요. 최대 10개까지 가능합니다.
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-3">
              <button
                onClick={() => {
                  setShowPublishModal(false);
                  setTagInput('');
                  setShowTagSuggestions(false);
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors order-2 sm:order-1"
              >
                취소
              </button>
              <button
                onClick={handleActualSave}
                disabled={isSubmitting || !summary.trim() || !slug.trim()}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors order-1 sm:order-2"
              >
                {isSubmitting ? '출간 중...' : '출간하기'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 임시저장 목록 모달 */}
      {showDraftModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-bold mb-4">임시저장된 글 목록</h3>

            <div className="space-y-3 mb-6">
              {getDraftsList().length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>임시저장된 글이 없습니다.</p>
                </div>
              ) : (
                getDraftsList().map((draft: any, index: number) => (
                  <div
                    key={draft.id}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 cursor-pointer" onClick={() => handleLoadDraft(draft)}>
                        <h4 className="font-medium text-gray-900 mb-1">{draft.title}</h4>
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                          {draft.content
                            ? draft.content.substring(0, 100) +
                              (draft.content.length > 100 ? '...' : '')
                            : '내용 없음'}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>{new Date(draft.timestamp).toLocaleString()}</span>
                          {draft.tags && draft.tags.length > 0 && (
                            <span>태그: {draft.tags.join(', ')}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            handleLoadDraft(draft);
                          }}
                          className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                        >
                          불러오기
                        </button>
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            handleDeleteDraft(draft.id, draft.title);
                          }}
                          className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                          title="삭제"
                        >
                          삭제
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="flex items-center justify-between">
              {getDraftsList().length > 0 && (
                <button
                  onClick={handleDeleteAllDrafts}
                  className="px-3 py-2 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                >
                  모두 삭제
                </button>
              )}
              <div className={getDraftsList().length > 0 ? '' : 'w-full flex justify-end'}>
                <button
                  onClick={() => setShowDraftModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
