import React, { useState, useEffect } from 'react';
import { X, AlertTriangle, ShieldAlert } from 'lucide-react';

interface ReasonModalProps {
  isOpen: boolean;
  title: string;
  subtitle?: string;
  entityName: string;
  entityId: string;
  actionType: 'SUSPEND' | 'DEACTIVATE' | 'REJECT' | 'RESOLVE';
  reasonPlaceholder?: string;
  warningNote?: string;
  confirmLabel?: string;
  onConfirm: (reason: string) => void;
  onClose: () => void;
}

export const ReasonModal: React.FC<ReasonModalProps> = ({
  isOpen,
  title,
  subtitle,
  entityName,
  entityId,
  actionType,
  reasonPlaceholder = 'Please enter the administrative justification...',
  warningNote,
  confirmLabel = 'Proceed',
  onConfirm,
  onClose,
}) => {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setReason('');
      setError('');
    }
  }, [isOpen]);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim() || reason.trim().length < 5) {
      setError('A valid justification of at least 5 characters is required for audit logs.');
      return;
    }
    onConfirm(reason.trim());
    onClose();
  };

  const getTone = () => {
    if (actionType === 'DEACTIVATE' || actionType === 'REJECT') return 'danger';
    if (actionType === 'SUSPEND') return 'warning';
    return 'primary';
  };

  return (
    <div className="admin-modal-overlay" role="dialog" aria-modal="true">
      <div className="admin-modal-card">
        <div className="admin-modal-header">
          <div className="title-with-icon">
            <ShieldAlert
              size={22}
              className={`modal-icon ${actionType === 'DEACTIVATE' ? 'text-danger' : 'text-warning'}`}
            />
            <div>
              <h3>{title}</h3>
              {subtitle && <p className="modal-subtitle-text">{subtitle}</p>}
            </div>
          </div>
          <button className="admin-icon-btn" onClick={onClose} aria-label="Close dialog">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="admin-modal-body">
            <div className="entity-target-box">
              <div className="entity-target-row">
                <span className="label">Target:</span>
                <strong>{entityName}</strong>
              </div>
              <div className="entity-target-row">
                <span className="label">ID:</span>
                <code>{entityId}</code>
              </div>
            </div>

            {warningNote && (
              <div className="admin-alert-box alert-warning">
                <AlertTriangle size={16} />
                <span>{warningNote}</span>
              </div>
            )}

            <div className="admin-form-group">
              <label htmlFor="reason-input">
                Administrative Reason <span className="required-star">*</span>
              </label>
              <textarea
                id="reason-input"
                rows={3}
                className="admin-textarea"
                placeholder={reasonPlaceholder}
                value={reason}
                onChange={(e) => {
                  setReason(e.target.value);
                  if (error) setError('');
                }}
                autoFocus
              />
              {error && <span className="admin-field-error">{error}</span>}
              <small className="field-hint">This reason will be preserved permanently in the Audit Trail.</small>
            </div>
          </div>

          <div className="admin-modal-footer">
            <button type="button" className="admin-btn admin-btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              disabled={!reason.trim()}
              className={`admin-btn ${
                getTone() === 'danger'
                  ? 'admin-btn-danger'
                  : getTone() === 'warning'
                  ? 'admin-btn-warning'
                  : 'admin-btn-primary'
              }`}
            >
              {confirmLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
