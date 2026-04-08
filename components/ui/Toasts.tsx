'use client';

import React, { useState, useEffect, useCallback } from 'react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
}

// Event system for triggering toasts from anywhere
const TOAST_EVENT = 'etn-toast-event';

export const toast = {
  success: (message: string) => {
    window.dispatchEvent(new CustomEvent(TOAST_EVENT, { detail: { type: 'success', title: message } }));
  },
  error: (message: string) => {
    window.dispatchEvent(new CustomEvent(TOAST_EVENT, { detail: { type: 'error', title: message } }));
  },
  info: (message: string) => {
    window.dispatchEvent(new CustomEvent(TOAST_EVENT, { detail: { type: 'info', title: message } }));
  },
  warning: (message: string) => {
    window.dispatchEvent(new CustomEvent(TOAST_EVENT, { detail: { type: 'warning', title: message } }));
  },
};

const Toast = ({ type, title, onClose }: { type: ToastType; title: string; onClose: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const getIcon = () => {
    switch (type) {
      case 'error':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" viewBox="0 0 24 24" height="24" fill="none">
            <path fill="#ffffff" d="m13 13h-2v-6h2zm0 4h-2v-2h2zm-1-15c-1.3132 0-2.61358.25866-3.82683.7612-1.21326.50255-2.31565 1.23915-3.24424 2.16773-1.87536 1.87537-2.92893 4.41891-2.92893 7.07107 0 2.6522 1.05357 5.1957 2.92893 7.0711.92859.9286 2.03098 1.6651 3.24424 2.1677 1.21325.5025 2.51363.7612 3.82683.7612 2.6522 0 5.1957-1.0536 7.0711-2.9289 1.8753-1.8754 2.9289-4.4189 2.9289-7.0711 0-1.3132-.2587-2.61358-.7612-3.82683-.5026-1.21326-1.2391-2.31565-2.1677-3.24424-.9286-.92858-2.031-1.66518-3.2443-2.16773-1.2132-.50254-2.5136-.7612-3.8268-.7612z"></path>
          </svg>
        );
      case 'success':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path fill="#ffffff" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"></path>
          </svg>
        );
      case 'warning':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path fill="#ffffff" d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"></path>
          </svg>
        );
      case 'info':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path fill="#ffffff" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"></path>
          </svg>
        );
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'error': return '#EF665B';
      case 'success': return '#4CAF50';
      case 'warning': return '#FF9800';
      case 'info': return '#3498db';
      default: return '#EF665B';
    }
  };

  return (
    <div className="etn-toast" style={{ backgroundColor: getBackgroundColor() }}>
      <div className="etn-toast__icon">
        {getIcon()}
      </div>
      <div className="etn-toast__title">{title}</div>
      <div className="etn-toast__close" onClick={onClose}>
        <svg xmlns="http://www.w3.org/2000/svg" width="20" viewBox="0 0 20 20" height="20">
          <path fill="#ffffff" d="m15.8333 5.34166-1.175-1.175-4.6583 4.65834-4.65833-4.65834-1.175 1.175 4.65833 4.65834-4.65833 4.6583 1.175 1.175 4.65833-4.6583 4.6583 4.6583 1.175-1.175-4.6583-4.6583z"></path>
        </svg>
      </div>

      <style jsx>{`
        .etn-toast {
          font-family: 'Montserrat', sans-serif;
          width: 320px;
          padding: 12px;
          display: flex;
          flex-direction: row;
          align-items: center;
          justify-content: start;
          border-radius: 8px;
          box-shadow: 0px 4px 12px rgba(0,0,0,0.15);
          margin-bottom: 10px;
          animation: slideIn 0.3s ease-out forwards;
          transition: all 0.3s ease;
          pointer-events: auto;
        }

        .etn-toast__icon {
          width: 24px;
          height: 24px;
          margin-right: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .etn-toast__title {
          font-weight: 500;
          font-size: 14px;
          color: #fff;
          flex: 1;
        }

        .etn-toast__close {
          width: 20px;
          height: 20px;
          cursor: pointer;
          margin-left: 12px;
          opacity: 0.8;
          transition: opacity 0.2s;
        }

        .etn-toast__close:hover {
          opacity: 1;
        }

        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export const ToastContainer = () => {
  const [isMounted, setIsMounted] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((type: ToastType, title: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, type, title }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const handleEvent = (event: Event) => {
      const { type, title } = (event as CustomEvent).detail;
      addToast(type, title);
    };

    window.addEventListener(TOAST_EVENT, handleEvent);
    return () => window.removeEventListener(TOAST_EVENT, handleEvent);
  }, [addToast]);

  if (!isMounted) {
    return null;
  }

  return (
    <div className="etn-toast-container">
      {toasts.map((t) => (
        <Toast key={t.id} type={t.type} title={t.title} onClose={() => removeToast(t.id)} />
      ))}

      <style jsx>{`
        .etn-toast-container {
          position: fixed;
          top: 20px;
          right: 20px;
          z-index: 9999;
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          pointer-events: none;
        }
      `}</style>
    </div>
  );
};
