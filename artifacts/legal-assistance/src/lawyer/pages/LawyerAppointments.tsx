import React, { useState } from 'react';
import { useLawyer } from '../context/LawyerContext';
import { CalendarDays, Clock, CheckCircle2, X, RotateCcw, Video, MapPin, Plus } from 'lucide-react';
import type { AppointmentStatus } from '../types';

function cx(...cls: (string | false | null | undefined)[]) { return cls.filter(Boolean).join(' '); }
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

const STATUS_PILL: Record<string, string> = {
  PENDING: 'lp-pill-gold',
  CONFIRMED: 'lp-pill-teal',
  COMPLETED: 'lp-pill-green',
  CANCELLED: 'lp-pill-neutral',
  RESCHEDULED: 'lp-pill-gold',
};

export function LawyerAppointments() {
  const { appointments, updateAppointmentStatus } = useLawyer();
  const [tab, setTab] = useState<'upcoming' | 'past' | 'all'>('upcoming');
  const [actionAppt, setActionAppt] = useState<string | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('');

  const upcoming = appointments.filter(a => a.status === 'PENDING' || a.status === 'CONFIRMED' || a.status === 'RESCHEDULED');
  const past = appointments.filter(a => a.status === 'COMPLETED' || a.status === 'CANCELLED');

  const displayed = tab === 'upcoming' ? upcoming : tab === 'past' ? past : appointments;

  const handleReschedule = (aptId: string) => {
    updateAppointmentStatus(aptId, 'RESCHEDULED');
    setActionAppt(null);
  };

  return (
    <div className="lp-page">
      <div className="lp-page-header">
        <div>
          <span className="lp-eyebrow">NYAYA / CALENDAR</span>
          <h1>Appointments</h1>
          <p>Manage your consultations and client meetings.</p>
        </div>
      </div>

      <div className="lp-tabs">
        {([['upcoming', 'Upcoming', upcoming.length], ['past', 'Past', past.length], ['all', 'All', appointments.length]] as const).map(([id, label, count]) => (
          <button key={id} className={cx('lp-tab', tab === id && 'lp-tab-active')} onClick={() => setTab(id)}>
            {label} <span className="lp-tab-count">{count}</span>
          </button>
        ))}
      </div>

      <div className="lp-card">
        {displayed.length === 0 ? (
          <div className="lp-empty"><CalendarDays size={24} /><p>No {tab} appointments.</p></div>
        ) : (
          <div className="lp-list">
            {displayed.map(a => (
              <div key={a.appointmentId} className="lp-appt-card">
                <div className="lp-appt-card-left">
                  <div className="lp-date-tile">
                    <b>{new Date(a.date).getDate()}</b>
                    <span>{new Date(a.date).toLocaleString('en-IN', { month: 'short' })}</span>
                  </div>
                  <div className="lp-appt-info">
                    <div className="lp-appt-meta">
                      <span className={cx('lp-pill', STATUS_PILL[a.status])}>{a.status}</span>
                      <span className="lp-pill lp-pill-neutral">{a.type === 'VIDEO' ? '🎥 Video' : '🏢 Office'}</span>
                    </div>
                    <h3>{a.client.name}</h3>
                    <div className="lp-appt-details">
                      <span><Clock size={13} /> {a.time}</span>
                      <span>{a.caseTitle}</span>
                      <span>₹{a.fee.toLocaleString('en-IN')}</span>
                    </div>
                    {a.meetingLink && a.type === 'VIDEO' && a.status === 'CONFIRMED' && (
                      <a href={a.meetingLink} className="lp-btn lp-btn-teal lp-btn-sm" target="_blank" rel="noreferrer">
                        <Video size={14} /> Join Meeting
                      </a>
                    )}
                  </div>
                </div>

                {(a.status === 'PENDING' || a.status === 'CONFIRMED') && actionAppt !== a.appointmentId && (
                  <div className="lp-appt-actions">
                    {a.status === 'PENDING' && (
                      <button className="lp-btn lp-btn-primary lp-btn-sm" onClick={() => updateAppointmentStatus(a.appointmentId, 'CONFIRMED')}>
                        <CheckCircle2 size={14} /> Confirm
                      </button>
                    )}
                    {a.status === 'CONFIRMED' && (
                      <button className="lp-btn lp-btn-secondary lp-btn-sm" onClick={() => updateAppointmentStatus(a.appointmentId, 'COMPLETED')}>
                        <CheckCircle2 size={14} /> Mark Completed
                      </button>
                    )}
                    <button className="lp-btn lp-btn-secondary lp-btn-sm" onClick={() => setActionAppt(a.appointmentId)}>
                      <RotateCcw size={14} /> Reschedule
                    </button>
                    <button className="lp-btn lp-btn-danger lp-btn-sm" onClick={() => updateAppointmentStatus(a.appointmentId, 'CANCELLED')}>
                      <X size={14} /> Cancel
                    </button>
                  </div>
                )}

                {actionAppt === a.appointmentId && (
                  <div className="lp-reschedule-form">
                    <label>New Date<input type="date" value={rescheduleDate} onChange={e => setRescheduleDate(e.target.value)} /></label>
                    <label>New Time
                      <select value={rescheduleTime} onChange={e => setRescheduleTime(e.target.value)} className="lp-select">
                        {['09:00 AM','10:00 AM','11:00 AM','12:00 PM','02:00 PM','03:00 PM','04:00 PM','05:00 PM'].map(t => <option key={t}>{t}</option>)}
                      </select>
                    </label>
                    <div className="lp-form-actions">
                      <button className="lp-btn lp-btn-secondary lp-btn-sm" onClick={() => setActionAppt(null)}>Cancel</button>
                      <button className="lp-btn lp-btn-primary lp-btn-sm" onClick={() => handleReschedule(a.appointmentId)}>
                        <RotateCcw size={14} /> Confirm Reschedule
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
