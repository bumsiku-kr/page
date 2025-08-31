'use client';

import { useState, useEffect } from 'react';
import { Share2Icon, CheckIcon } from 'lucide-react';
import Button from '../ui/Button';

interface ShareButtonProps {
  className?: string;
}

const ShareButton: React.FC<ShareButtonProps> = ({ className }) => {
  const [isCopied, setIsCopied] = useState(false);
  const [currentUrl, setCurrentUrl] = useState('');

  useEffect(() => {
    // 클라이언트 사이드에서만 window.location.href에 접근 가능
    setCurrentUrl(window.location.href);
  }, []);

  const handleShare = async () => {
    if (!currentUrl) return;

    try {
      await navigator.clipboard.writeText(currentUrl);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000); // 2초 후 초기 상태로
    } catch (error) {
      console.error('클립보드 복사 실패:', error);
      // 사용자에게 오류 알림 (예: toast 메시지)
    }
  };

  return (
    <Button
      variant="link"
      size="icon"
      className={`w-8 h-8 p-0 flex items-center justify-center ${className}`}
      onClick={handleShare}
      aria-label={isCopied ? '링크 복사 완료' : '링크 공유하기'}
    >
      {isCopied ? (
        <CheckIcon className="h-4 w-4 text-green-500" />
      ) : (
        <Share2Icon className="h-4 w-4" />
      )}
    </Button>
  );
};

export default ShareButton;
