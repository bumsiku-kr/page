'use client';

import { useState, useCallback } from 'react';

interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}

interface ConfirmState extends ConfirmOptions {
  isOpen: boolean;
  resolve: ((value: boolean) => void) | null;
}

const initialState: ConfirmState = {
  isOpen: false,
  title: '',
  message: '',
  confirmText: '확인',
  cancelText: '취소',
  resolve: null,
};

export function useConfirm() {
  const [state, setState] = useState<ConfirmState>(initialState);

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise(resolve => {
      setState({
        ...options,
        confirmText: options.confirmText || '확인',
        cancelText: options.cancelText || '취소',
        isOpen: true,
        resolve,
      });
    });
  }, []);

  const handleConfirm = useCallback(() => {
    state.resolve?.(true);
    setState(initialState);
  }, [state.resolve]);

  const handleCancel = useCallback(() => {
    state.resolve?.(false);
    setState(initialState);
  }, [state.resolve]);

  return {
    confirm,
    confirmState: {
      isOpen: state.isOpen,
      title: state.title,
      message: state.message,
      confirmText: state.confirmText,
      cancelText: state.cancelText,
    },
    handleConfirm,
    handleCancel,
  };
}
