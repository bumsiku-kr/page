import { useState, useEffect, useRef, useCallback } from 'react';
import { logger } from '@/lib/utils/logger';

const DRAFTS_KEY = 'velog-drafts';
const AUTO_SAVE_INTERVAL = 30000; // 30초

export interface DraftSnapshot {
  title: string;
  content: string;
  tags: string[];
  summary: string;
  slug: string;
}

export interface Draft extends DraftSnapshot {
  id: string;
  timestamp: string;
  displayName: string;
  isAutoSave?: boolean;
}

/**
 * 임시저장 관리 Hook
 * - 자동 저장 (30초 간격)
 * - 수동 저장
 * - 불러오기/삭제 기능
 */
export function useDraftManagement(currentDraft: DraftSnapshot) {
  const [lastAutoSavedAt, setLastAutoSavedAt] = useState<Date | null>(null);

  const latestDraftRef = useRef<DraftSnapshot>(currentDraft);
  const previousDraftJSONRef = useRef<string | null>(null);

  // 현재 draft 상태 동기화
  useEffect(() => {
    latestDraftRef.current = currentDraft;
  }, [currentDraft]);

  // Draft 목록 가져오기
  const getDraftsList = useCallback((): Draft[] => {
    try {
      const saved = localStorage.getItem(DRAFTS_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      logger.error('임시저장 목록 로드 오류', error);
      return [];
    }
  }, []);

  // 자동 저장 로직
  useEffect(() => {
    const intervalId = window.setInterval(() => {
      const snapshot = latestDraftRef.current;
      const normalizedTitle = snapshot.title.trim();
      const hasContent =
        normalizedTitle ||
        snapshot.content.trim() ||
        snapshot.summary.trim() ||
        snapshot.tags.length > 0 ||
        snapshot.slug.trim();

      if (!hasContent) {
        return;
      }

      try {
        const serializedSnapshot = JSON.stringify(snapshot);
        if (serializedSnapshot === previousDraftJSONRef.current) {
          return; // 변경사항 없으면 스킵
        }

        const drafts = getDraftsList();
        const filteredDrafts = Array.isArray(drafts)
          ? drafts.filter((draft: Draft) => !draft?.isAutoSave)
          : [];

        const now = new Date();
        const timestamp = now.toISOString();
        const draftTitle = normalizedTitle || '제목 없음';

        const autoDraft: Draft = {
          id: 'auto-draft',
          title: draftTitle,
          content: snapshot.content,
          tags: snapshot.tags,
          summary: snapshot.summary,
          slug: snapshot.slug,
          timestamp,
          displayName: `${now.toLocaleString()} - ${draftTitle}`,
          isAutoSave: true,
        };

        localStorage.setItem(DRAFTS_KEY, JSON.stringify([autoDraft, ...filteredDrafts]));
        previousDraftJSONRef.current = serializedSnapshot;
        setLastAutoSavedAt(now);

        logger.debug('자동 임시저장 완료', { draftTitle });
      } catch (error) {
        logger.error('자동 임시저장 오류', error);
      }
    }, AUTO_SAVE_INTERVAL);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [getDraftsList]);

  // 마지막 자동저장 시간 초기화
  useEffect(() => {
    const drafts = getDraftsList();
    if (!Array.isArray(drafts)) return;

    const autoDraft = drafts.find((draft: Draft) => draft?.isAutoSave && draft?.timestamp);
    if (autoDraft) {
      setLastAutoSavedAt(new Date(autoDraft.timestamp));
    }
  }, [getDraftsList]);

  // 수동 저장
  const saveDraft = useCallback((): boolean => {
    const snapshot = latestDraftRef.current;

    if (!snapshot.title.trim() && !snapshot.content.trim()) {
      return false;
    }

    try {
      const drafts = getDraftsList();
      const now = new Date();
      const timestamp = now.toISOString();
      const draftTitle = snapshot.title.trim() || '제목 없음';

      // 같은 제목의 기존 임시저장 제거
      const filteredDrafts = drafts.filter((draft: Draft) => draft.title !== draftTitle);

      const newDraft: Draft = {
        id: `${timestamp}-${draftTitle}`,
        title: draftTitle,
        content: snapshot.content,
        tags: snapshot.tags,
        summary: snapshot.summary,
        slug: snapshot.slug,
        timestamp,
        displayName: `${now.toLocaleString()} - ${draftTitle}`,
      };

      const updatedDrafts = [newDraft, ...filteredDrafts];
      localStorage.setItem(DRAFTS_KEY, JSON.stringify(updatedDrafts));

      logger.debug('수동 임시저장 완료', { draftTitle });
      return true;
    } catch (error) {
      logger.error('수동 임시저장 오류', error);
      return false;
    }
  }, [getDraftsList]);

  // Draft 삭제
  const deleteDraft = useCallback(
    (draftId: string): boolean => {
      try {
        const drafts = getDraftsList();
        const filteredDrafts = drafts.filter((draft: Draft) => draft.id !== draftId);
        localStorage.setItem(DRAFTS_KEY, JSON.stringify(filteredDrafts));

        logger.debug('임시저장 삭제 완료', { draftId });
        return true;
      } catch (error) {
        logger.error('임시저장 삭제 오류', error);
        return false;
      }
    },
    [getDraftsList]
  );

  // 모든 Draft 삭제
  const deleteAllDrafts = useCallback((): boolean => {
    try {
      localStorage.setItem(DRAFTS_KEY, JSON.stringify([]));
      logger.debug('임시저장 전체 삭제 완료');
      return true;
    } catch (error) {
      logger.error('임시저장 전체 삭제 오류', error);
      return false;
    }
  }, []);

  return {
    lastAutoSavedAt,
    getDraftsList,
    saveDraft,
    deleteDraft,
    deleteAllDrafts,
  };
}
