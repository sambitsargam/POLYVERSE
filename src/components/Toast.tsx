'use client';

import { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
  duration?: number;
}

let toastQueue: ToastMessage[] = [];
let setToastMessages: ((messages: ToastMessage[]) => void) | null = null;

export const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info', duration = 5000) => {
  const toast: ToastMessage = {
    id: `toast_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    message,
    type,
    duration,
  };

  toastQueue.push(toast);
  
  if (setToastMessages) {
    setToastMessages([...toastQueue]);
  }

  // Auto-remove after duration
  setTimeout(() => {
    removeToast(toast.id);
  }, duration);
};

export const removeToast = (id: string) => {
  toastQueue = toastQueue.filter(toast => toast.id !== id);
  if (setToastMessages) {
    setToastMessages([...toastQueue]);
  }
};

export const Toast = () => {
  const [toastMessages, setToastMessagesState] = useState<ToastMessage[]>([]);

  useEffect(() => {
    setToastMessages = setToastMessagesState;
    return () => {
      setToastMessages = null;
    };
  }, []);

  if (toastMessages.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      {toastMessages.map((toast) => (
        <div
          key={toast.id}
          className={`
            max-w-sm p-4 rounded-lg shadow-lg border animate-slide-up
            ${toast.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : ''}
            ${toast.type === 'error' ? 'bg-red-50 border-red-200 text-red-800' : ''}
            ${toast.type === 'info' ? 'bg-blue-50 border-blue-200 text-blue-800' : ''}
          `}
        >
          <div className="flex items-start justify-between">
            <p className="text-sm font-medium flex-1">{toast.message}</p>
            <button
              onClick={() => removeToast(toast.id)}
              className="ml-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};