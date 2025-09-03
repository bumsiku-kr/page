'use client';

import { useEffect } from 'react';
import { api } from '../../lib/api/index';

interface ViewCounterProps {
  postId: string;
}

const ViewCounter = ({ postId }: ViewCounterProps) => {
  useEffect(() => {
    const incrementViews = async () => {
      try {
        await api.posts.incrementViews(parseInt(postId, 10));
      } catch (error) {
        console.error('조회수 증가 실패:', error);
      }
    };

    incrementViews();
  }, [postId]);

  return null;
};

export default ViewCounter;
