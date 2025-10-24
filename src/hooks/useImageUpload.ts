import { useState, useCallback, RefObject } from 'react';
import { api } from '@/lib/api/index';
import { logger } from '@/lib/utils/logger';
import { compressImage } from '@/lib/utils/imageCompression';

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
        // 이미지 압축 및 포맷 변환 (WebP 우선, JPEG 폴백)
        logger.debug('이미지 압축 시작', {
          originalName: file.name,
          originalSize: file.size,
        });

        const compressedFile = await compressImage(file, {
          quality: 0.85, // 15% 손실 압축
          maxWidth: 2048,
          maxHeight: 2048,
          preferredFormat: 'webp',
        });

        logger.debug('이미지 압축 완료', {
          compressedName: compressedFile.name,
          compressedSize: compressedFile.size,
          compressionRatio: ((1 - compressedFile.size / file.size) * 100).toFixed(2) + '%',
        });

        // 압축된 이미지 업로드
        const response = await api.images.upload(compressedFile);
        const imageMarkdown = `![${compressedFile.name}](${response.url})`;

        // 커서 위치에 이미지 삽입
        if (contentRef.current) {
          const start = contentRef.current.selectionStart;
          const end = contentRef.current.selectionEnd;
          const newContent =
            content.slice(0, start) + '\n' + imageMarkdown + '\n' + content.slice(end);
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

        logger.debug('이미지 업로드 성공', {
          originalFileName: file.name,
          uploadedFileName: compressedFile.name,
        });
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
