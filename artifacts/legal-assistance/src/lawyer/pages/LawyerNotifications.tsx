import React, { useState } from 'react';
import { useLawyer } from '../context/LawyerContext';
import { Bell, Check, Filter, Users, ShieldCheck, Settings } from 'lucide-react';
import type { NotificationSource } from '../types';

function cx(...cls: (string | false | null | undefined)[]) { return cls.filter(Boolean).join(' '); }
function formatTimeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

const SOURCE_ICON: Record<NotificationSource, typeof Bell> = {
  CLIENT: Users,
  ADMIN: ShieldCheck,
  SYSTEM: Settings,
};

const SOURCE_PILL: Record<NotificationSource, string> = {
  CLIENT: 'lp-pill-teal',
  ADMIN: 'lp-pill-gold',
  SYSTEM: 'lp-pill-neutral',
};

export function LawyerNotifications() {
  const { notifications, markNotificationRead, markAllNotificationsRead } = useLawyer();
  const [filter, setFilter] = useState<'ALL' | NotificationSource | 'UNREAD'>('ALL');

  const filtered = notifications.filter(n => {
    if (filter === 'ALL') return true;
    if (filter === 'UNREAD') return !n.isRead;
    return n.source === filter;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="lp-page">
      <div className="lp-page-header">
        <div>
          <span className="lp-eyebrow">NYAYA / NOTIFICATIONS</span>
          <h1>Notification Centre</h1>
          <p>{unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}</p>
        </div>
        {unreadCount > 0 && (
          <button className="lp-btn lp-btn-secondary" onClick={markAllNotificationsRead}>
            <Check size={16} /> Mark all as read
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="lp-tabs">
        {([['ALL', 'All'], ['UNREAD', 'Unread'], ['CLIENT', 'From Clients'], ['ADMIN', 'From Admin'], ['SYSTEM', 'System']] as const).map(([id, label]) => (
          <button key={id} className={cx('lp-tab', filter === id && 'lp-tab-active')} onClick={() => setFilter(id)}>
            {label}
            {id === 'UNREAD' && unreadCount > 0 && <span className="lp-badge">{unreadCount}</span>}
          </button>
        ))}
      </div>

      <div className="lp-card">
        {filtered.length === 0 ? (
          <div className="lp-empty"><Bell size={24} /><p>No notifications in this category.</p></div>
        ) : (
          <div className="lp-notif-list">
            {filtered.map(n => {
              const Icon = SOURCE_ICON[n.source];
              return (
                <div
                  key={n.notificationId}
                  className={cx('lp-notif-item', !n.isRead && 'lp-notif-item-unread')}
                  onClick={() => markNotificationRead(n.notificationId)}
                  role="button"
                >
                  <div className={cx('lp-notif-icon', n.source === 'CLIENT' ? 'lp-icon-teal' : n.source === 'ADMIN' ? 'lp-icon-gold' : 'lp-icon-neutral')}>
                    <Icon size={18} />
                  </div>
                  <div className="lp-notif-content">
                    <div className="lp-notif-header">
                      <strong>{n.title}</strong>
                      <div className="lp-notif-meta">
                        <span className={cx('lp-pill lp-pill-sm', SOURCE_PILL[n.source])}>{n.source}</span>
                        <small className="lp-muted">{formatTimeAgo(n.createdAt)}</small>
                        {!n.isRead && <span className="lp-unread-dot" />}
                      </div>
                    </div>
                    <p>{n.message}</p>
                    {n.relatedCaseTitle && (
                      <small className="lp-notif-case">📁 {n.relatedCaseTitle}</small>
                    )}
                    <small className="lp-muted">From: {n.senderName}</small>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
