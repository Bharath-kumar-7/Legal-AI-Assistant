import React, { useEffect } from 'react';
import { X, FileText, Download, ExternalLink, ShieldCheck, Image as ImageIcon } from 'lucide-react';
import type { VerificationDocument } from '../types';

interface DocumentPreviewModalProps {
  isOpen: boolean;
  document: VerificationDocument | null;
  lawyerName: string;
  onClose: () => void;
}

export const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({
  isOpen,
  document,
  lawyerName,
  onClose,
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

  if (!isOpen || !document) return null;

  const isImage = document.type === 'IMAGE' || document.fileName.match(/\.(jpg|jpeg|png|webp)$/i);
  const isPdf = document.type === 'PDF' || document.fileName.match(/\.pdf$/i);

  return (
    <div className="admin-modal-overlay" role="dialog" aria-modal="true">
      <div className="admin-modal-card document-modal-card">
        <div className="admin-modal-header">
          <div className="title-with-icon">
            {isImage ? <ImageIcon size={20} /> : <FileText size={20} />}
            <div>
              <h3>{document.title}</h3>
              <p className="modal-subtitle-text">Submitted by: {lawyerName}</p>
            </div>
          </div>
          <button className="admin-icon-btn" onClick={onClose} aria-label="Close preview">
            <X size={18} />
          </button>
        </div>

        <div className="admin-modal-body document-preview-body">
          {/* Metadata bar */}
          <div className="document-meta-bar">
            <span>
              <strong>File:</strong> {document.fileName}
            </span>
            <span>
              <strong>Size:</strong> {document.fileSize}
            </span>
            <span>
              <strong>Type:</strong> {document.type}
            </span>
            <span className="secure-badge">
              <ShieldCheck size={14} /> Bar Verification Document
            </span>
          </div>

          {/* Preview Canvas */}
          <div className="preview-canvas">
            {isImage ? (
              <div className="image-preview-container">
                <img
                  src={document.url}
                  alt={document.title}
                  className="preview-image"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>
            ) : isPdf ? (
              <div className="pdf-preview-box">
                <div className="pdf-icon-hero">
                  <FileText size={48} />
                </div>
                <h4>{document.title}</h4>
                <p>PDF Document ({document.fileSize}) — Secure cryptographic copy verified.</p>
                <div className="pdf-actions">
                  <a
                    href={document.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="admin-btn admin-btn-secondary"
                  >
                    <ExternalLink size={16} /> Open in New Tab
                  </a>
                  <a href={document.url} download={document.fileName} className="admin-btn admin-btn-primary">
                    <Download size={16} /> Download File
                  </a>
                </div>
              </div>
            ) : (
              <div className="unsupported-preview">
                <p>Preview not available for this file type. Please download to view.</p>
                <a href={document.url} download={document.fileName} className="admin-btn admin-btn-primary">
                  <Download size={16} /> Download Document
                </a>
              </div>
            )}
          </div>
        </div>

        <div className="admin-modal-footer">
          <button type="button" className="admin-btn admin-btn-secondary" onClick={onClose}>
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
};
