import { useState, useCallback, RefObject } from 'react';
import { api } from '@/lib/api/index';
import { logger } from '@/lib/utils/logger';

/**
 * 이미지 업로드 및 드래그 앤 드롭 Hook
 */
export function useImageUpload(
  contentRef: RefObject<HTMLTextAreaElement>,
  content: string,
  onContentChange: (content: string) => void
) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // 이미지 업로드 처리
  const uploadImage = useCallback(
    async (file: File) => {
      setIsUploading(true);
      try {
        const response = await api.images.upload(file);
        const imageMarkdown = `![${file.name}](${response.url})`;

        // 커서 위치에 이미지 삽입
        if (contentRef.current) {
          const start = contentRef.current.selectionStart;
          const end = contentRef.current.selectionEnd;
          const newContent = content.slice(0, start) + '\n' + imageMarkdown + '\n' + content.slice(end);
          onContentChange(newContent);

          // 커서 위치 조정
          setTimeout(() => {
            if (contentRef.current) {
              const newCursorPos = start + imageMarkdown.length + 2;
              contentRef.current.setSelectionRange(newCursorPos, newCursorPos);
              contentRef.current.focus();
            }
          }, 0);
        }

        logger.debug('이미지 업로드 성공', { fileName: file.name });
      } catch (error) {
        logger.error('이미지 업로드 오류', error);
        throw error;
      } finally {
        setIsUploading(false);
      }
    },
    [contentRef, content, onContentChange]
  );

  // 드래그 앤 드롭 핸들러
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const files = Array.from(e.dataTransfer.files);
      const imageFiles = files.filter(file => file.type.startsWith('image/'));

      if (imageFiles.length > 0) {
        imageFiles.forEach(uploadImage);
      }
    },
    [uploadImage]
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

  return {
    isUploading,
    isDragging,
    uploadImage,
    handleDrop,
    handleDragOver,
    handleDragLeave,
  };
}
