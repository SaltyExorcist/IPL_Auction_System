import { useState, useCallback } from 'react';

export interface ToastData {
  id: string;
  type: 'sold' | 'unsold';
  playerName: string;
  teamName?: string;
  amount?: string;
}

export const useToast = () => {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const showToast = useCallback((data: Omit<ToastData, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    const newToast: ToastData = { ...data, id };

    setToasts((prev) => [...prev, newToast]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showSoldToast = useCallback(
    (playerName: string, teamName: string, amount: string) => {
      showToast({
        type: 'sold',
        playerName,
        teamName,
        amount,
      });
    },
    [showToast]
  );

  const showUnsoldToast = useCallback(
    (playerName: string) => {
      showToast({
        type: 'unsold',
        playerName,
      });
    },
    [showToast]
  );

  return {
    toasts,
    removeToast,
    showSoldToast,
    showUnsoldToast,
  };
};