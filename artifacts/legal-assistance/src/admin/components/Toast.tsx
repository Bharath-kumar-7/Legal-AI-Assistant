import React from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import type { ToastMessage } from '../context/AdminContext';

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  const getIcon = (tone: ToastMessage['tone']) => {
    switch (tone) {
      case 'success':
        return <CheckCircle2 size={18} className="toast-icon text-success" />;
      case 'error':
        return <AlertCircle size={18} className="toast-icon text-danger" />;
      case 'warning':
        return <AlertTriangle size={18} className="toast-icon text-warning" />;
      default:
        return <Info size={18} className="toast-icon text-info" />;
    }
  };

  return (
    <div className="admin-toast-container" aria-live="polite">
      {toasts.map((toast) => (
        <div key={toast.id} className={`admin-toast-item toast-${toast.tone}`}>
          <div className="toast-leading">{getIcon(toast.tone)}</div>
          <div className="toast-content">
            <strong>{toast.title}</strong>
            {toast.message && <p>{toast.message}</p>}
          </div>
          <button
            className="toast-close-btn"
            onClick={() => onDismiss(toast.id)}
            aria-label="Dismiss notification"
          >
            <X size={15} />
          </button>
        </div>
      ))}
    </div>
  );
};
