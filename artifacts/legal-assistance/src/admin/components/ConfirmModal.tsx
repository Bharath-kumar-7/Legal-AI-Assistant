import React, { useEffect } from 'react';
import { X, AlertTriangle, Info, CheckCircle } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: 'danger' | 'warning' | 'primary' | 'success';
  onConfirm: () => void;
  onClose: () => void;
  details?: React.ReactNode;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  tone = 'primary',
  onConfirm,
  onClose,
  details,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const getIcon = () => {
    switch (tone) {
      case 'danger':
        return <AlertTriangle size={22} className="modal-icon text-danger" />;
      case 'warning':
        return <AlertTriangle size={22} className="modal-icon text-warning" />;
      case 'success':
        return <CheckCircle size={22} className="modal-icon text-success" />;
      default:
        return <Info size={22} className="modal-icon text-primary" />;
    }
  };

  return (
    <div className="admin-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="admin-modal-card">
        <div className="admin-modal-header">
          <div className="title-with-icon">
            {getIcon()}
            <h3 id="modal-title">{title}</h3>
          </div>
          <button className="admin-icon-btn" onClick={onClose} aria-label="Close dialog">
            <X size={18} />
          </button>
        </div>

        <div className="admin-modal-body">
          <p className="modal-message">{message}</p>
          {details && <div className="modal-details-callout">{details}</div>}
        </div>

        <div className="admin-modal-footer">
          <button type="button" className="admin-btn admin-btn-secondary" onClick={onClose}>
            {cancelLabel}
          </button>
          <button
            type="button"
            className={`admin-btn ${
              tone === 'danger'
                ? 'admin-btn-danger'
                : tone === 'warning'
                ? 'admin-btn-warning'
                : 'admin-btn-primary'
            }`}
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
