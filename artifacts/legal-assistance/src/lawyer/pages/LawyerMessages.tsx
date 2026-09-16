import React, { useState } from 'react';
import { useLawyer } from '../context/LawyerContext';
import { MessageSquareText, Search, Send, Users } from 'lucide-react';
import type { LawyerCase } from '../types';

function cx(...cls: (string | false | null | undefined)[]) { return cls.filter(Boolean).join(' '); }
function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

export function LawyerMessages() {
  const { cases, profile, sendMessage } = useLawyer();
  const [selectedCase, setSelectedCase] = useState<LawyerCase | null>(cases[0] || null);
  const [chatText, setChatText] = useState('');
  const [search, setSearch] = useState('');

  // Cases that have messages or are active
  const activeCases = cases.filter(c => !['CLOSED'].includes(c.currentStatus));
  const filtered = activeCases.filter(c =>
    !search || c.caseTitle.toLowerCase().includes(search.toLowerCase()) || c.client.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSend = () => {
    if (!chatText.trim() || !selectedCase) return;
    sendMessage(selectedCase.caseId, chatText.trim());
    setChatText('');
  };

  const unreadForCase = (c: LawyerCase) =>
    c.messages.filter(m => m.senderRole === 'CLIENT' && !m.readAt).length;

  return (
    <div className="lp-page">
      <div className="lp-page-header">
        <div>
          <span className="lp-eyebrow">NYAYA / MESSAGES</span>
          <h1>Client Messages</h1>
          <p>All client-lawyer conversations, organised by case.</p>
        </div>
      </div>

      <div className="lp-messages-layout">
        {/* Conversation List */}
        <div className="lp-conversation-list">
          <div className="lp-search-field lp-search-compact">
            <Search size={15} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search conversations..." />
          </div>
          {filtered.map(c => {
            const lastMsg = c.messages[c.messages.length - 1];
            const unread = unreadForCase(c);
            return (
              <div
                key={c.caseId}
                className={cx('lp-conversation-item', selectedCase?.caseId === c.caseId && 'lp-conversation-active')}
                onClick={() => setSelectedCase(c)}
                role="button"
              >
                <div className="lp-conversation-avatar">
                  {c.client.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)}
                </div>
                <div className="lp-conversation-info">
                  <div className="lp-conversation-header">
                    <strong>{c.client.name}</strong>
                    {unread > 0 && <span className="lp-badge">{unread}</span>}
                  </div>
                  <p className="lp-conversation-preview">{lastMsg ? lastMsg.text.substring(0, 50) + (lastMsg.text.length > 50 ? '…' : '') : 'No messages yet'}</p>
                  <small className="lp-muted">{c.caseTitle}</small>
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div className="lp-empty lp-empty-sm"><Users size={20} /><p>No conversations found.</p></div>
          )}
        </div>

        {/* Chat Window */}
        {selectedCase ? (
          <div className="lp-chat-window">
            <div className="lp-chat-window-header">
              <div className="lp-conversation-avatar">
                {selectedCase.client.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)}
              </div>
              <div>
                <strong>{selectedCase.client.name}</strong>
                <p className="lp-muted">{selectedCase.caseTitle}</p>
              </div>
            </div>

            <div className="lp-chat-body lp-chat-body-full">
              {selectedCase.messages.length === 0 ? (
                <div className="lp-empty"><MessageSquareText size={24} /><p>No messages yet. Start the conversation.</p></div>
              ) : (
                <div className="lp-message-list">
                  {selectedCase.messages.map(msg => (
                    <div key={msg.messageId} className={cx('lp-message-row', msg.senderRole === 'LAWYER' && 'lp-message-lawyer')}>
                      <div className="lp-message-avatar">
                        {msg.senderName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)}
                      </div>
                      <div className="lp-message-bubble">
                        <div className="lp-message-meta">
                          <strong>{msg.senderRole === 'LAWYER' ? 'You' : msg.senderName}</strong>
                          <small>{formatDateTime(msg.sentAt)}</small>
                        </div>
                        <p>{msg.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="lp-chat-composer">
              <textarea
                value={chatText}
                onChange={e => setChatText(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                placeholder={`Message ${selectedCase.client.name}...`}
                rows={2}
                className="lp-textarea lp-chat-input"
              />
              <button className="lp-btn lp-btn-primary" onClick={handleSend} disabled={!chatText.trim()}>
                <Send size={16} />
              </button>
            </div>
          </div>
        ) : (
          <div className="lp-chat-window lp-chat-empty-state">
            <div className="lp-empty"><MessageSquareText size={32} /><p>Select a conversation to start messaging.</p></div>
          </div>
        )}
      </div>
    </div>
  );
}
