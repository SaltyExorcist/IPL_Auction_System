import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';
import clsx from 'clsx';

export interface ToastProps {
  id: string;
  type: 'sold' | 'unsold';
  playerName: string;
  teamName?: string;
  amount?: string;
  duration?: number;
  onClose: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({
  id,
  type,
  playerName,
  teamName,
  amount,
  duration = 5000,
  onClose,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Trigger enter animation
    setTimeout(() => setIsVisible(true), 10);

    // Auto-dismiss after duration
    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onClose(id);
    }, 300); // Match animation duration
  };

  return (
    <div
      className={clsx(
        'flex items-start gap-3 p-4 rounded-xl shadow-2xl border backdrop-blur-md',
        'transition-all duration-300 ease-out',
        'min-w-[280px] max-w-[400px]',
        isVisible && !isExiting ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0',
        type === 'sold'
          ? 'bg-gradient-to-r from-green-900/90 to-emerald-900/90 border-green-500/50'
          : 'bg-gradient-to-r from-red-900/90 to-rose-900/90 border-red-500/50'
      )}
    >
      {/* Icon */}
      <div className="flex-shrink-0 mt-0.5">
        {type === 'sold' ? (
          <CheckCircle className="w-6 h-6 text-green-300" />
        ) : (
          <XCircle className="w-6 h-6 text-red-300" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {type === 'sold' ? (
          <>
            <p className="text-sm font-semibold text-white mb-1">SOLD!</p>
            <p className="text-xs sm:text-sm text-gray-200 mb-1 truncate">
              {playerName}
            </p>
            <p className="text-xs text-green-300">
              to <span className="font-bold">{teamName}</span> for{' '}
              <span className="font-bold text-amber-300">₹{amount}L</span>
            </p>
          </>
        ) : (
          <>
            <p className="text-sm font-semibold text-white mb-1">UNSOLD</p>
            <p className="text-xs sm:text-sm text-gray-200 truncate">
              {playerName}
            </p>
            <p className="text-xs text-red-300">No bids received</p>
          </>
        )}
      </div>

      {/* Close Button */}
      <button
        onClick={handleClose}
        className="flex-shrink-0 p-1 rounded-md hover:bg-white/10 transition-colors"
        aria-label="Close notification"
      >
        <X className="w-4 h-4 text-gray-300" />
      </button>
    </div>
  );
};

// Toast Container Component
export const ToastContainer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-3 pointer-events-none">
      <div className="pointer-events-auto">{children}</div>
    </div>
  );
};