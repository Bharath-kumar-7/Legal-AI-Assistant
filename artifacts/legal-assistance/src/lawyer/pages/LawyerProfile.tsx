import React, { useState } from 'react';
import { useLawyer } from '../context/LawyerContext';
import {
  User, Shield, Edit2, Save, X, Camera, CheckCircle2, Clock, AlertCircle,
  MapPin, Phone, Mail, Scale, Award, Globe, BookOpen,
} from 'lucide-react';

function cx(...cls: (string | false | null | undefined)[]) { return cls.filter(Boolean).join(' '); }
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

const PRACTICE_AREAS = [
  'Criminal Law', 'Civil Law', 'Family Law', 'Property Law', 'Consumer Law',
  'Cyber Law', 'Labour Law', 'Tax Law', 'Constitutional Law', 'Corporate Law',
  'Commercial Law', 'Intellectual Property', 'Banking Law', 'Environmental Law',
];

const VERIFICATION_BADGE: Record<string, { label: string; pill: string; icon: typeof CheckCircle2; desc: string }> = {
  VERIFIED: { label: 'Verified', pill: 'lp-pill-green', icon: CheckCircle2, desc: 'Your bar credentials have been verified.' },
  PENDING: { label: 'Pending', pill: 'lp-pill-gold', icon: Clock, desc: 'Your verification is pending admin review.' },
  UNDER_REVIEW: { label: 'Under Review', pill: 'lp-pill-teal', icon: Clock, desc: 'Admin is reviewing your credentials.' },
  REJECTED: { label: 'Rejected', pill: 'lp-pill-neutral', icon: AlertCircle, desc: 'Your verification was rejected. Please contact support.' },
};

export function LawyerProfile() {
  const { profile, updateProfile } = useLawyer();
  const [tab, setTab] = useState<'personal' | 'professional' | 'verification'>('personal');
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ ...profile });

  const handleSave = () => {
    updateProfile(form);
    setEditing(false);
  };

  const togglePracticeArea = (area: string) => {
    setForm(f => ({
      ...f,
      practiceAreas: f.practiceAreas.includes(area)
        ? f.practiceAreas.filter(a => a !== area)
        : [...f.practiceAreas, area],
    }));
  };

  const verif = VERIFICATION_BADGE[profile.verificationStatus] || VERIFICATION_BADGE.PENDING;
  const VerifIcon = verif.icon;

  return (
    <div className="lp-page">
      <div className="lp-page-header">
        <div>
          <span className="lp-eyebrow">NYAYA / YOUR PROFILE</span>
          <h1>My Profile</h1>
          <p>Your professional information visible to clients and the platform.</p>
        </div>
        {!editing ? (
          <button className="lp-btn lp-btn-primary" onClick={() => setEditing(true)}>
            <Edit2 size={16} /> Edit Profile
          </button>
        ) : (
          <div className="lp-header-actions">
            <button className="lp-btn lp-btn-secondary" onClick={() => { setForm({ ...profile }); setEditing(false); }}>
              <X size={16} /> Cancel
            </button>
            <button className="lp-btn lp-btn-primary" onClick={handleSave}>
              <Save size={16} /> Save Changes
            </button>
          </div>
        )}
      </div>

      {/* Profile Hero */}
      <div className="lp-card lp-profile-hero">
        <div className="lp-profile-avatar-wrap">
          <div className="lp-profile-avatar">
            {profile.fullName.split(' ').filter(w => !w.endsWith('.')).map(w => w[0]).join('').toUpperCase().slice(0, 2)}
          </div>
          {editing && (
            <button className="lp-avatar-upload-btn" title="Change photo">
              <Camera size={16} />
            </button>
          )}
        </div>
        <div className="lp-profile-hero-info">
          <h2>{profile.fullName}</h2>
          <p className="lp-profile-id"><Scale size={14} /> {profile.lawyerId}</p>
          <div className="lp-profile-tags">
            <span className={cx('lp-pill', verif.pill)}>
              <VerifIcon size={13} /> {verif.label}
            </span>
            {profile.practiceAreas.slice(0, 3).map(a => (
              <span key={a} className="lp-pill lp-pill-navy">{a}</span>
            ))}
            {profile.practiceAreas.length > 3 && (
              <span className="lp-pill lp-pill-neutral">+{profile.practiceAreas.length - 3}</span>
            )}
          </div>
          <div className="lp-profile-meta">
            <span><MapPin size={14} /> {profile.location}</span>
            <span><Award size={14} /> {profile.yearsOfExperience} years experience</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="lp-tabs">
        <button className={cx('lp-tab', tab === 'personal' && 'lp-tab-active')} onClick={() => setTab('personal')}>
          Personal
        </button>
        <button className={cx('lp-tab', tab === 'professional' && 'lp-tab-active')} onClick={() => setTab('professional')}>
          Professional
        </button>
        <button className={cx('lp-tab', tab === 'verification' && 'lp-tab-active')} onClick={() => setTab('verification')}>
          Verification
        </button>
      </div>

      {/* ─── Personal ─── */}
      {tab === 'personal' && (
        <div className="lp-card">
          <span className="lp-section-kicker">PERSONAL INFORMATION</span>
          <div className="lp-profile-form">
            {editing ? (
              <>
                <label>Full Name<input value={form.fullName} onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))} /></label>
                <label>Email<input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></label>
                <label>Phone<input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} /></label>
                <label>Location<input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} /></label>
              </>
            ) : (
              <div className="lp-detail-grid">
                <div className="lp-detail-field"><label><User size={14} /> Full Name</label><span>{profile.fullName}</span></div>
                <div className="lp-detail-field"><label><Mail size={14} /> Email</label><span>{profile.email}</span></div>
                <div className="lp-detail-field"><label><Phone size={14} /> Phone</label><span>{profile.phone}</span></div>
                <div className="lp-detail-field"><label><MapPin size={14} /> Location</label><span>{profile.location}</span></div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── Professional ─── */}
      {tab === 'professional' && (
        <>
          <div className="lp-card">
            <span className="lp-section-kicker">PROFESSIONAL INFORMATION</span>
            <div className="lp-profile-form">
              {editing ? (
                <>
                  <label>Bar Council Registration No.<input value={form.barCouncilNumber} onChange={e => setForm(f => ({ ...f, barCouncilNumber: e.target.value }))} /></label>
                  <label>Bar Council / State<input value={form.barCouncilState} onChange={e => setForm(f => ({ ...f, barCouncilState: e.target.value }))} /></label>
                  <label>Years of Experience<input type="number" value={form.yearsOfExperience} onChange={e => setForm(f => ({ ...f, yearsOfExperience: Number(e.target.value) }))} /></label>
                  <label>Languages (comma-separated)<input value={form.languages.join(', ')} onChange={e => setForm(f => ({ ...f, languages: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }))} /></label>
                  <label className="lp-label-full">Professional Biography
                    <textarea value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} rows={4} className="lp-textarea" />
                  </label>
                </>
              ) : (
                <div className="lp-detail-grid">
                  <div className="lp-detail-field"><label><Scale size={14} /> Bar Council No.</label><code className="lp-mono">{profile.barCouncilNumber}</code></div>
                  <div className="lp-detail-field"><label><Award size={14} /> Bar Council</label><span>{profile.barCouncilState}</span></div>
                  <div className="lp-detail-field"><label><BookOpen size={14} /> Experience</label><span>{profile.yearsOfExperience} years</span></div>
                  <div className="lp-detail-field"><label><Globe size={14} /> Languages</label><span>{profile.languages.join(', ')}</span></div>
                  <div className="lp-detail-field lp-detail-full"><label>Professional Biography</label><p className="lp-description-text">{profile.bio}</p></div>
                </div>
              )}
            </div>
          </div>

          <div className="lp-card">
            <span className="lp-section-kicker">PRACTICE AREAS</span>
            <div className="lp-practice-areas">
              {PRACTICE_AREAS.map(area => {
                const selected = (editing ? form.practiceAreas : profile.practiceAreas).includes(area);
                return (
                  <button
                    key={area}
                    className={cx('lp-area-chip', selected && 'lp-area-chip-selected')}
                    onClick={() => editing && togglePracticeArea(area)}
                    disabled={!editing}
                  >
                    {selected && <CheckCircle2 size={13} />}
                    {area}
                  </button>
                );
              })}
            </div>
            {!editing && <p className="lp-muted lp-note-sm">Click "Edit Profile" to update practice areas.</p>}
          </div>
        </>
      )}

      {/* ─── Verification ─── */}
      {tab === 'verification' && (
        <div className="lp-card">
          <span className="lp-section-kicker">VERIFICATION STATUS</span>
          <div className={cx('lp-verification-status', `lp-verif-${profile.verificationStatus.toLowerCase()}`)}>
            <VerifIcon size={32} />
            <div>
              <h3>{verif.label}</h3>
              <p>{verif.desc}</p>
            </div>
            <span className={cx('lp-pill lp-pill-lg', verif.pill)}>{verif.label}</span>
          </div>

          {profile.verificationMessage && (
            <div className="lp-verif-message">
              <Shield size={16} />
              <div>
                <strong>Admin Message:</strong>
                <p>{profile.verificationMessage}</p>
              </div>
            </div>
          )}

          <div className="lp-detail-grid lp-detail-grid-sm">
            <div className="lp-detail-field"><label>Lawyer ID</label><code className="lp-mono">{profile.lawyerId}</code></div>
            <div className="lp-detail-field"><label>Account Status</label><span className="lp-pill lp-pill-teal">{profile.accountStatus}</span></div>
            <div className="lp-detail-field"><label>Registered Since</label><span>{formatDate(profile.createdAt)}</span></div>
            <div className="lp-detail-field"><label>Bar Council No.</label><code className="lp-mono">{profile.barCouncilNumber}</code></div>
          </div>

          <div className="lp-verif-flow">
            <span className="lp-section-kicker">VERIFICATION PROCESS</span>
            <div className="lp-verif-steps">
              {[['Pending', 'PENDING'], ['Under Review', 'UNDER_REVIEW'], ['Verified', 'VERIFIED']].map(([label, status]) => {
                const stepStatuses = ['PENDING', 'UNDER_REVIEW', 'VERIFIED'];
                const currentIdx = stepStatuses.indexOf(profile.verificationStatus);
                const stepIdx = stepStatuses.indexOf(status);
                const done = stepIdx < currentIdx || profile.verificationStatus === 'VERIFIED';
                const current = profile.verificationStatus === status;
                return (
                  <div key={status} className={cx('lp-verif-step', done && 'lp-step-done', current && 'lp-step-current')}>
                    <div className="lp-verif-step-dot">
                      {done ? <CheckCircle2 size={16} /> : <span />}
                    </div>
                    <span>{label}</span>
                  </div>
                );
              })}
              {profile.verificationStatus === 'REJECTED' && (
                <div className="lp-verif-step lp-step-rejected">
                  <div className="lp-verif-step-dot"><AlertCircle size={16} /></div>
                  <span>Rejected</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
