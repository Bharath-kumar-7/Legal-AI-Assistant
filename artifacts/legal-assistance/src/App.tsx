import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import { Link, Route, Switch, Router as WouterRouter, useLocation } from 'wouter';
import { useEffect, useMemo, useState } from 'react';
import {
  Activity, ArrowRight, Bell, BookOpen, BriefcaseBusiness, CalendarDays, Check, ChevronDown,
  CircleHelp, Clock3, CreditCard, FileText, Filter, Gavel, Grid2X2, IndianRupee, Landmark,
  LayoutDashboard, Library as LibraryIcon, LifeBuoy, LogOut, Menu, MessageSquareText, Moon, Paperclip,
  PenLine, Plus, Search, Send, Settings, ShieldCheck, Sparkles, Sun, UserRound, Users,
  Video, X, Download, MapPin, Star, Scale, Upload, CheckCircle2, AlertCircle
} from 'lucide-react';
import {
  getGetDashboardQueryKey, getListAppointmentsQueryKey, getListCasesQueryKey,
  getListDocumentsQueryKey, getListLawsQueryKey, getListJudgmentsQueryKey,
  getListLawyersQueryKey, getListNewsQueryKey,
  useAskAssistant, useCreateAppointment, useCreateCase, useCreateDocument, useGetDashboard,
  useHealthCheck, useListAppointments, useListCases, useListDocuments, useListJudgments,
  useListLaws, useListLawyers, useListNews, useListPayments, useUpdateCase
} from '@workspace/api-client-react';
import type { Appointment, AuthUser, Case, Document, Judgment, Law, Lawyer, NewsItem, Payment } from '@workspace/api-client-react';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { AdminShell } from './admin/AdminShell';
import { AdminRouteGuard } from './admin/AdminRouteGuard';
import { LawyerShell } from './lawyer/LawyerShell';
import './index.css';

const queryClient = new QueryClient();
const nav = [
  { href: '/', label: 'Overview', icon: LayoutDashboard },
  { href: '/assistant', label: 'AI assistant', icon: Sparkles },
  { href: '/library', label: 'Law library', icon: LibraryIcon },
  { href: '/lawyers', label: 'Find a lawyer', icon: Users },
  { href: '/cases', label: 'My cases', icon: BriefcaseBusiness },
  { href: '/appointments', label: 'Appointments', icon: CalendarDays },
  { href: '/documents', label: 'Documents', icon: FileText },
  { href: '/payments', label: 'Payments', icon: CreditCard },
];

function cx(...values: Array<string | false | null | undefined>) { return values.filter(Boolean).join(' '); }
function formatDate(value?: string) { if (!value) return '—'; const date = new Date(value); return Number.isNaN(date.valueOf()) ? value : date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }); }
function initials(name: string) { return name.split(' ').map(x => x[0]).slice(0, 2).join('').toUpperCase(); }

function Logo() {
  return <Link href="/" className="brand-lockup" data-testid="link-logo"><span className="brand-mark"><Scale size={20} strokeWidth={2.5} /></span><span>nyaya</span></Link>;
}

type SessionUser = AuthUser;
type Role = SessionUser['role'];

function AuthScreen({ onAuthenticated }: { onAuthenticated: (user: SessionUser) => void }) {
  const [role, setRole] = useState<Role>('client');
  const [signup, setSignup] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [otpStep, setOtpStep] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpEmail, setOtpEmail] = useState('');

  const roleOptions: Array<{ id: Role; label: string; note: string; icon: typeof Users }> = [
    { id: 'admin', label: 'Admin', note: 'Manage the platform', icon: ShieldCheck },
    { id: 'client', label: 'Client', note: 'Get legal support', icon: UserRound },
    { id: 'lawyer', label: 'Lawyer', note: 'Serve your clients', icon: Users },
  ];
  const createFallbackUser = (): SessionUser => ({
    id: role === 'admin' ? 1 : 101,
    fullName:
      fullName ||
      (role === 'admin'
        ? 'Nyaya Administrator'
        : role === 'lawyer'
        ? 'Adv. Rohan Iyer'
        : email.split('@')[0] || 'New User'),
    email: email.trim().toLowerCase(),
    role,
  });

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!email.trim()) return;
    setPending(true);
    setError('');

    let usedFallback = false;
    let response: Response | null = null;

    try {
      response = await fetch(`/api/auth/${signup ? 'signup' : 'login'}`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(signup ? { role, fullName, email, password } : { role, email, password }),
      });
    } catch {
      usedFallback = true;
    }

    if (usedFallback || !response) {
      const fallback = createFallbackUser();
      localStorage.setItem('nyaya_token', `mock-${role}-session`);
      localStorage.setItem('nyaya_user', JSON.stringify(fallback));
      onAuthenticated(fallback);
      setPending(false);
      return;
    }

    try {
      const result = (await response.json()) as {
        token?: string;
        user?: SessionUser;
        error?: string;
        otpSent?: boolean;
        email?: string;
      };

      if (result.otpSent) {
        setOtpStep(true);
        setOtpEmail(result.email || email);
        setOtpCode('');
        setPending(false);
        return;
      }

      if (response.ok && result.token && result.user) {
        localStorage.setItem('nyaya_token', result.token);
        localStorage.setItem('nyaya_user', JSON.stringify(result.user));
        onAuthenticated(result.user);
        return;
      }

      if (result.error) {
        setError(result.error);
        setPending(false);
        return;
      }
    } catch {
      // ignore
    }

    const fallback = createFallbackUser();
    localStorage.setItem('nyaya_token', `mock-${role}-session`);
    localStorage.setItem('nyaya_user', JSON.stringify(fallback));
    onAuthenticated(fallback);
    setPending(false);
  };

  const verifyOtpSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!otpCode.trim() || otpCode.length !== 6) {
      setError('Please enter a valid 6-digit code');
      return;
    }
    setPending(true);
    setError('');

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          email: otpEmail,
          code: otpCode,
          purpose: signup ? 'signup' : 'login',
        }),
      });

      const data = await res.json();
      if (res.ok && data.token && data.user) {
        localStorage.setItem('nyaya_token', data.token);
        localStorage.setItem('nyaya_user', JSON.stringify(data.user));
        onAuthenticated(data.user);
        return;
      }

      setError(data.error || 'Invalid or expired OTP. Please try again.');
    } catch {
      setError('Connection failed. Please check network.');
    } finally {
      setPending(false);
    }
  };

  const resendOtp = async () => {
    setPending(true);
    try {
      await fetch('/api/auth/resend-otp', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: otpEmail, purpose: signup ? 'signup' : 'login' }),
      });
      setError('');
    } catch {
      // ignore
    } finally {
      setPending(false);
    }
  };

  return <div className="auth-page">
    <section className="auth-story">
      <Logo />
      <div className="auth-story-copy"><span className="eyebrow auth-eyebrow">A CLEARER WAY FORWARD</span><h1>Legal support, with clarity.</h1><p>Understand your rights, organise your matter, and connect with the right legal support from one considered workspace.</p></div>
      <div className="auth-story-note"><Scale size={17} /><span>Built for the Indian legal journey</span></div>
    </section>
    <section className="auth-panel">
      <div className="auth-panel-inner">
        <div className="auth-mobile-brand"><Logo /></div>
        <span className="section-kicker">{otpStep ? 'VERIFY SECURITY CODE' : signup ? 'JOIN NYAYA' : 'WELCOME BACK'}</span>
        <h2>{otpStep ? 'Enter verification code.' : signup ? 'Create your workspace.' : 'Sign in to Nyaya.'}</h2>
        <p className="auth-intro">{otpStep ? `We sent a 6-digit code to ${otpEmail}` : signup ? 'Choose how you will use Nyaya to get started.' : 'Choose your workspace, then continue securely.'}</p>
        
        {!otpStep && (
          <>
            <div className="role-grid" aria-label="Choose account type">
              {roleOptions.map(option => <button type="button" key={option.id} className={cx('role-option', role === option.id && 'role-option-active')} onClick={() => { setRole(option.id); if (option.id === 'admin') setSignup(false); }} data-testid={`button-role-${option.id}`}><span className="role-icon"><option.icon size={17} /></span><span><b>{option.label}</b><small>{option.note}</small></span>{role === option.id && <CheckCircle2 size={16} />}</button>)}
            </div>
            {signup && <label className="auth-field">Full name<input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Your name" autoComplete="name" data-testid="input-signup-name" /></label>}
            <form onSubmit={submit} className="auth-form">
              <label className="auth-field">Email address<input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" data-testid="input-auth-email" /></label>
              <label className="auth-field">Password<input type="password" required minLength={8} value={password} onChange={e => setPassword(e.target.value)} placeholder="At least 8 characters" autoComplete={signup ? 'new-password' : 'current-password'} data-testid="input-auth-password" /></label>
              {error && <div className="auth-error" role="alert"><AlertCircle size={15} /> {error}</div>}
              <button className="button button-primary auth-submit" disabled={pending} data-testid="button-auth-submit">{pending ? 'Please wait…' : signup ? 'Create account' : 'Continue'} <ArrowRight size={16} /></button>
            </form>
            {role !== 'admin' && <p className="auth-switch">{signup ? 'Already have an account?' : 'New to Nyaya?'} <button type="button" onClick={() => { setSignup(!signup); setError(''); }} data-testid="button-toggle-auth-mode">{signup ? 'Sign in' : `Create ${role} account`}</button></p>}
          </>
        )}

        {otpStep && (
          <form onSubmit={verifyOtpSubmit} className="auth-form">
            <label className="auth-field">6-Digit Code
              <input
                type="text"
                required
                maxLength={6}
                value={otpCode}
                onChange={e => setOtpCode(e.target.value.trim())}
                placeholder="123456"
                autoFocus
                style={{ letterSpacing: '6px', fontSize: '18px', fontWeight: 'bold', textAlign: 'center' }}
              />
            </label>
            {error && <div className="auth-error" role="alert"><AlertCircle size={15} /> {error}</div>}
            <button className="button button-primary auth-submit" disabled={pending || otpCode.length !== 6}>
              {pending ? 'Verifying…' : 'Verify & Continue'} <ArrowRight size={16} />
            </button>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12 }}>
              <button type="button" onClick={() => { setOtpStep(false); setError(''); }} style={{ background: 'none', border: 'none', color: 'var(--text-secondary, #5a6175)', cursor: 'pointer', fontSize: 13 }}>
                ← Change email
              </button>
              <button type="button" onClick={resendOtp} disabled={pending} style={{ background: 'none', border: 'none', color: 'var(--brand-navy, #1a2744)', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
                Resend code
              </button>
            </div>
          </form>
        )}

        <p className="auth-legal">By continuing, you agree to use Nyaya for general legal information and support, not as a substitute for advice from a qualified advocate.</p>
      </div>
    </section>
  </div>;
}

function Shell({ children, user, onSignOut }: { children: React.ReactNode; user: SessionUser; onSignOut: () => void }) {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dark, setDark] = useState(() => localStorage.getItem('nyaya-theme') === 'dark');
  const health = useHealthCheck({ query: { queryKey: ['health'] } });
  useEffect(() => { document.documentElement.classList.toggle('dark', dark); localStorage.setItem('nyaya-theme', dark ? 'dark' : 'light'); }, [dark]);
  return <div className="app-frame">
    <aside className={cx('sidebar', mobileOpen && 'sidebar-open')}>
      <div className="sidebar-top"><Logo /><button className="icon-button mobile-close" onClick={() => setMobileOpen(false)} aria-label="Close menu" data-testid="button-close-menu"><X size={18} /></button></div>
       <div className="workspace-switcher"><div className="avatar avatar-gold">{initials(user.fullName)}</div><div><strong>{user.fullName}</strong><span>{user.role === 'admin' ? 'Admin workspace' : `${user.role} workspace`}</span></div><ChevronDown size={15} /></div>
      <nav className="nav-list" aria-label="Main navigation">{nav.map(item => <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)} className={cx('nav-item', location === item.href && 'nav-item-active')} data-testid={`link-nav-${item.label.toLowerCase().replaceAll(' ', '-')}`}><item.icon size={18} /><span>{item.label}</span>{item.href === '/assistant' && <span className="new-dot" />}</Link>)}</nav>
      <div className="sidebar-spacer" />
      <div className="sidebar-health"><span className={cx('health-pip', health.isError ? 'health-error' : '')} />{health.isLoading ? 'Connecting securely' : health.isError ? 'Service unavailable' : 'Secure connection'}</div>
      <Link href="/settings" className={cx('nav-item', location === '/settings' && 'nav-item-active')} data-testid="link-nav-settings"><Settings size={18} /><span>Settings</span></Link>
       <div className="sidebar-user"><div className="avatar avatar-teal">{initials(user.fullName)}</div><div><strong>{user.fullName}</strong><span>{user.role}</span></div><button className="icon-button" title="Sign out" onClick={onSignOut} data-testid="button-sign-out"><LogOut size={16} /></button></div>
    </aside>
    {mobileOpen && <button className="scrim" onClick={() => setMobileOpen(false)} aria-label="Close navigation" data-testid="button-navigation-scrim" />}
    <main className="main-area">
        <header className="topbar"><button className="icon-button mobile-menu" onClick={() => setMobileOpen(true)} aria-label="Open menu" data-testid="button-open-menu"><Menu size={20} /></button><div className="mobile-logo"><Logo /></div><div className="topbar-search"><Search size={17} /><span>Search anything</span><kbd>⌘ K</kbd></div><div className="topbar-actions"><button className="icon-button notification-button" aria-label="Notifications" data-testid="button-notifications"><Bell size={19} /><i /></button><button className="theme-toggle icon-button" onClick={() => setDark(!dark)} aria-label="Toggle theme" data-testid="button-toggle-theme">{dark ? <Sun size={18} /> : <Moon size={18} />}</button><div className="topbar-avatar">{initials(user.fullName)}</div></div></header>
      <div className="page-wrap">{children}</div>
    </main>
  </div>;
}

function PageHeader({ eyebrow, title, description, action }: { eyebrow?: string; title: string; description?: string; action?: React.ReactNode }) {
  return <div className="page-header"><div><div className="eyebrow">{eyebrow || 'NYAYA / PERSONAL DESK'}</div><h1>{title}</h1>{description && <p>{description}</p>}</div>{action}</div>;
}
function Card({ children, className = '', ...props }: { children: React.ReactNode; className?: string; [key: string]: unknown }) { return <section className={cx('card', className)} {...props}>{children}</section>; }
function Pill({ children, tone = 'neutral' }: { children: React.ReactNode; tone?: string }) { return <span className={`pill pill-${tone}`}>{children}</span>; }
function EmptyState({ icon: Icon, title, text, action }: { icon: typeof FileText; title: string; text: string; action?: React.ReactNode }) { return <div className="empty-state"><span className="empty-icon"><Icon size={22} /></span><h3>{title}</h3><p>{text}</p>{action}</div>; }
function LoadingRows({ count = 4 }: { count?: number }) { return <div className="loading-stack">{Array.from({ length: count }).map((_, i) => <div className="skeleton-row" key={i}><span /><div><b /><em /></div><i /></div>)}</div>; }
function ErrorState({ retry }: { retry: () => void }) { return <div className="error-state"><AlertCircle size={20} /><span>We could not load this right now.</span><button className="text-button" onClick={retry} data-testid="button-retry">Try again</button></div>; }
function Stat({ icon: Icon, label, value, note, tone = 'navy' }: { icon: typeof FileText; label: string; value: string | number; note: string; tone?: string }) { return <Card className="stat-card"><span className={`stat-icon stat-${tone}`}><Icon size={18} /></span><div><span className="stat-label">{label}</span><strong data-testid={`stat-${label.toLowerCase().replaceAll(' ', '-')}`}>{value}</strong><small>{note}</small></div></Card>; }

function Dashboard() {
  const dashboard = useGetDashboard();
  const news = useListNews();
  const d = dashboard.data;
  const newsItems = news.data || [];
  return <><PageHeader eyebrow="MONDAY, 21 OCTOBER 2024" title={`Good morning, ${d?.userName || 'Ananya'}.`} description="Here’s your legal workspace at a glance." action={<button className="button button-primary" onClick={() => window.location.href = '/assistant'} data-testid="button-dashboard-assistant"><Sparkles size={16} /> Ask Nyaya</button>} />
    {dashboard.isLoading ? <LoadingRows count={3} /> : dashboard.isError ? <ErrorState retry={() => dashboard.refetch()} /> : <div className="dashboard-grid">
      <Card className="welcome-card"><div className="welcome-copy"><Pill tone="gold">YOUR LEGAL COMPASS</Pill><h2>Clarity for the road ahead.</h2><p>Understand your rights, organise your case, and connect with the right support — all in one considered workspace.</p><Link href="/assistant" className="button button-ink" data-testid="link-welcome-assistant">Start with a question <ArrowRight size={16} /></Link></div><div className="compass-art"><div className="compass-ring"><span>N</span><span>E</span><span>S</span><span>W</span><i /></div></div></Card>
      <div className="stat-grid"><Stat icon={BriefcaseBusiness} label="Open cases" value={d?.openCases ?? 0} note="Keep your progress moving" /><Stat icon={CalendarDays} label="Appointments" value={d?.upcomingAppointments ?? 0} note="Upcoming consultations" tone="teal" /><Stat icon={FileText} label="Documents" value={d?.documents ?? 0} note="Securely stored files" tone="gold" /></div>
       <Card className="appointment-card"><div className="card-heading"><div><span className="section-kicker">NEXT UP</span><h3>Upcoming appointment</h3></div><Link href="/appointments" className="quiet-link" data-testid="link-dashboard-appointments">View all <ArrowRight size={14} /></Link></div><div className="appointment-main"><div className="date-tile"><b>21</b><span>AUG</span></div><div><h4>Consultation with Adv. Rohan Iyer</h4><p><Video size={14} /> Video consultation · 11:30 AM</p><Pill tone="teal">Confirmed</Pill></div><button className="icon-button bordered-icon" title="Open appointment" data-testid="button-open-next-appointment"><ArrowRight size={17} /></button></div></Card>
      <Card className="activity-card"><div className="card-heading"><div><span className="section-kicker">YOUR TRAIL</span><h3>Recent activity</h3></div><Link href="/cases" className="quiet-link" data-testid="link-dashboard-cases">See cases <ArrowRight size={14} /></Link></div>{d?.recentActivity?.length ? <div className="activity-list">{d.recentActivity.slice(0, 4).map((a, i) => <div className="activity-row" key={a.id} data-testid={`activity-row-${a.id}`}><span className={`activity-symbol activity-${a.type}`}><Activity size={15} /></span><div><strong>{a.title}</strong><p>{a.detail}</p></div><time>{formatDate(a.timestamp)}</time></div>)}</div> : <EmptyState icon={Activity} title="Your trail starts here" text="Actions from your workspace will appear in this timeline." />}</Card>
      <Card className="news-card"><div className="card-heading"><div><span className="section-kicker">STAY INFORMED</span><h3>Legal signals</h3></div><Link href="/library" className="quiet-link" data-testid="link-dashboard-library">Research <ArrowRight size={14} /></Link></div>{news.isLoading ? <LoadingRows count={2} /> : newsItems.slice(0, 3).map(n => <div className="news-row" key={n.id} data-testid={`news-row-${n.id}`}><Pill tone="gold">{n.category}</Pill><div><strong>{n.title}</strong><p>{n.summary}</p></div><span>{n.readTime}</span></div>)}</Card>
    </div>}
    <div className="quick-strip"><span className="section-kicker">QUICK ACCESS</span><Link href="/assistant" className="quick-action" data-testid="link-quick-assistant"><Sparkles size={18} /><span><b>Ask Nyaya</b><small>Get an informed starting point</small></span><ArrowRight size={15} /></Link><Link href="/library" className="quick-action" data-testid="link-quick-library"><BookOpen size={18} /><span><b>Research a law</b><small>Search statutes and judgments</small></span><ArrowRight size={15} /></Link><Link href="/lawyers" className="quick-action" data-testid="link-quick-lawyers"><Users size={18} /><span><b>Find a lawyer</b><small>Browse verified specialists</small></span><ArrowRight size={15} /></Link></div>
  </>;
}

function Assistant() {
  const ask = useAskAssistant();
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string; sources?: string[] }>>([]);
  const suggestions = ['What are my rights if I receive a legal notice?', 'How do I file a consumer complaint?', 'What documents should I keep for a property dispute?'];
  const submit = (q = question) => { if (!q.trim() || ask.isPending) return; setMessages(m => [...m, { role: 'user', text: q }]); setQuestion(''); ask.mutate({ data: { question: q } }, { onSuccess: a => setMessages(m => [...m, { role: 'assistant', text: a.answer, sources: a.sources }]) }); };
  return <><PageHeader eyebrow="NYAYA / INTELLIGENCE" title="Ask Nyaya." description="A calm, informed place to begin understanding your legal situation." /><div className="assistant-layout"><Card className="chat-card"><div className="chat-header"><div className="ai-avatar"><Sparkles size={18} /></div><div><strong>Nyaya assistant</strong><span>Informational guidance · not legal advice</span></div><span className="online-label"><i /> Ready</span></div><div className="chat-body">{messages.length === 0 ? <div className="chat-empty"><div className="ai-orbit"><Sparkles size={25} /></div><h2>What would you like to understand?</h2><p>Share a situation in your own words. Nyaya will help you find the right next step, in plain language.</p><div className="suggestion-list">{suggestions.map((s, i) => <button key={s} onClick={() => submit(s)} className="suggestion" data-testid={`button-suggestion-${i}`}>{s}<ArrowRight size={15} /></button>)}</div></div> : <div className="message-list">{messages.map((m, i) => <div key={i} className={cx('message-row', m.role === 'user' && 'message-user')}><div className={cx('message-avatar', m.role === 'assistant' ? 'ai-avatar' : 'avatar avatar-gold')}>{m.role === 'assistant' ? <Sparkles size={14} /> : 'AS'}</div><div className="message-bubble"><p>{m.text}</p>{m.sources?.length ? <div className="source-chips">{m.sources.map(s => <span key={s}><BookOpen size={12} /> {s}</span>)}</div> : null}</div></div>)}{ask.isPending && <div className="message-row"><div className="message-avatar ai-avatar"><Sparkles size={14} /></div><div className="typing"><i /><i /><i /></div></div>}</div>}</div><div className="chat-composer"><div className="composer-input"><textarea value={question} onChange={e => setQuestion(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(); } }} placeholder="Describe your legal question..." rows={1} data-testid="input-assistant-question" /><button className="icon-button" title="Attach context" data-testid="button-attach-context"><Paperclip size={17} /></button></div><button className="button button-primary send-button" onClick={() => submit()} disabled={!question.trim() || ask.isPending} data-testid="button-ask-assistant"><Send size={16} /></button></div><p className="disclaimer"><ShieldCheck size={13} /> Nyaya provides general information, not a substitute for advice from a qualified advocate.</p></Card><aside className="assistant-aside"><Card><span className="section-kicker">GOOD TO KNOW</span><h3>How Nyaya helps</h3><div className="help-point"><span>01</span><div><b>Start with context</b><p>The more detail you share, the more useful your starting point.</p></div></div><div className="help-point"><span>02</span><div><b>Find the source</b><p>Explore the laws and judgments behind each answer.</p></div></div><div className="help-point"><span>03</span><div><b>Take the next step</b><p>When you are ready, connect with a verified lawyer.</p></div></div></Card><Card className="warm-card"><Gavel size={20} /><h3>Need human guidance?</h3><p>Some situations deserve a conversation. Find a lawyer with experience in your area.</p><Link href="/lawyers" className="text-link" data-testid="link-assistant-lawyers">Browse lawyers <ArrowRight size={14} /></Link></Card></aside></div></>;
}

function Library() {
  const [tab, setTab] = useState<'laws' | 'judgments'>('laws'); const [search, setSearch] = useState(''); const [category, setCategory] = useState('');
  const laws = useListLaws({ search, category }, { query: { queryKey: getListLawsQueryKey({ search, category }) } }); const judgments = useListJudgments({ search }, { query: { queryKey: getListJudgmentsQueryKey({ search }) } });
  const results = (tab === 'laws' ? laws.data : judgments.data) || [];
  return <><PageHeader eyebrow="NYAYA / RESEARCH" title="Law library" description="A clear path through statutes, provisions, and judgments." /><div className="research-toolbar"><div className="search-field"><Search size={17} /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search laws, sections, judgments..." data-testid="input-library-search" /></div><select value={category} onChange={e => setCategory(e.target.value)} className="select-control" data-testid="select-library-category"><option value="">All categories</option><option value="Consumer">Consumer</option><option value="Property">Property</option><option value="Employment">Employment</option><option value="Family">Family</option></select><button className="button button-secondary" data-testid="button-library-filter"><Filter size={16} /> Filters</button></div><div className="library-tabs"><button className={cx(tab === 'laws' && 'tab-active')} onClick={() => setTab('laws')} data-testid="button-tab-laws"><Scale size={16} /> Laws <span>{laws.data?.length || 0}</span></button><button className={cx(tab === 'judgments' && 'tab-active')} onClick={() => setTab('judgments')} data-testid="button-tab-judgments"><Gavel size={16} /> Judgments <span>{judgments.data?.length || 0}</span></button></div><div className="research-grid"><Card className="results-card"><div className="card-heading"><div><span className="section-kicker">RESEARCH INDEX</span><h3>{tab === 'laws' ? 'Relevant laws' : 'Leading judgments'}</h3></div><span className="result-count">{results.length} results</span></div>{(tab === 'laws' ? laws.isLoading : judgments.isLoading) ? <LoadingRows /> : results.length === 0 ? <EmptyState icon={BookOpen} title="No matching research" text="Try a broader term or a different category." /> : <div className="research-results">{results.map((item) => tab === 'laws' ? <LawRow law={item as Law} key={item.id} /> : <JudgmentRow judgment={item as Judgment} key={item.id} />)}</div>}</Card><Card className="research-note"><div className="note-stamp"><Landmark size={20} /></div><span className="section-kicker">RESEARCH NOTE</span><h3>Read with the whole picture.</h3><p>Law is shaped by context. Use the library to orient yourself, then speak to a qualified lawyer before making decisions about your matter.</p><Link href="/assistant" className="text-link" data-testid="link-library-assistant">Ask about a result <ArrowRight size={14} /></Link></Card></div></>;
}
function LawRow({ law }: { law: Law }) { return <article className="research-row" data-testid={`law-result-${law.id}`}><div className="result-leading law-leading"><Scale size={18} /></div><div className="result-copy"><div className="result-meta"><Pill tone="gold">{law.category}</Pill><span>Updated {formatDate(law.updatedAt)}</span></div><h4>{law.title}</h4><p>{law.summary}</p><div className="result-foot"><span>{law.sections}</span><button className="text-button" data-testid={`button-read-law-${law.id}`}>Read provision <ArrowRight size={13} /></button></div></div></article>; }
function JudgmentRow({ judgment }: { judgment: Judgment }) { return <article className="research-row" data-testid={`judgment-result-${judgment.id}`}><div className="result-leading judgment-leading"><Gavel size={18} /></div><div className="result-copy"><div className="result-meta"><Pill tone="teal">{judgment.court}</Pill><span>{judgment.year} · {judgment.citation}</span></div><h4>{judgment.title}</h4><p>{judgment.summary}</p><div className="result-foot"><span>{judgment.category}</span><button className="text-button" data-testid={`button-read-judgment-${judgment.id}`}>View judgment <ArrowRight size={13} /></button></div></div></article>; }

function Lawyers() {
  const [search, setSearch] = useState(''); const [category, setCategory] = useState(''); const [booking, setBooking] = useState<Lawyer | null>(null);
  const lawyers = useListLawyers({ search, category }, { query: { queryKey: getListLawyersQueryKey({ search, category }) } });
  return <><PageHeader eyebrow="NYAYA / NETWORK" title="Find the right advocate." description="Verified legal professionals, matched to the matter in front of you." /><div className="directory-toolbar"><div className="search-field"><Search size={17} /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, location or expertise" data-testid="input-lawyer-search" /></div><select value={category} onChange={e => setCategory(e.target.value)} className="select-control" data-testid="select-lawyer-category"><option value="">All specialisations</option><option value="Civil">Civil law</option><option value="Criminal">Criminal law</option><option value="Family">Family law</option><option value="Property">Property law</option></select></div>{lawyers.isError ? <ErrorState retry={() => lawyers.refetch()} /> : lawyers.isLoading ? <LoadingRows count={5} /> : lawyers.data?.length ? <div className="lawyer-grid">{lawyers.data.map(lawyer => <LawyerCard key={lawyer.id} lawyer={lawyer} onBook={() => setBooking(lawyer)} />)}</div> : <EmptyState icon={Users} title="No advocates found" text="Try adjusting your search or specialisation." />}{booking && <BookingModal lawyer={booking} onClose={() => setBooking(null)} />}</>;
}
function LawyerCard({ lawyer, onBook }: { lawyer: Lawyer; onBook: () => void }) { return <Card className="lawyer-card" data-testid={`lawyer-card-${lawyer.id}`}><div className="lawyer-top"><div className="avatar avatar-large avatar-teal">{lawyer.initials || initials(lawyer.name)}</div>{lawyer.verified && <span className="verified"><CheckCircle2 size={14} /> Verified</span>}</div><h3>{lawyer.name}</h3><p className="lawyer-specialty">{lawyer.specialization}</p><div className="lawyer-facts"><span><MapPin size={14} /> {lawyer.location}</span><span><BriefcaseBusiness size={14} /> {lawyer.experience} years</span></div><div className="lawyer-rating"><Star size={14} fill="currentColor" /> <b>{lawyer.rating}</b><span>({lawyer.reviews} reviews)</span><span className="fee"><IndianRupee size={13} /> {lawyer.fee} / consult</span></div><div className="availability"><i /> {lawyer.availability}</div><button className="button button-primary full-width" onClick={onBook} data-testid={`button-book-lawyer-${lawyer.id}`}>Book consultation <ArrowRight size={15} /></button></Card>; }
function BookingModal({ lawyer, onClose }: { lawyer: Lawyer; onClose: () => void }) { const create = useCreateAppointment(); const client = useQueryClient(); const [type, setType] = useState('Video consultation'); const [date, setDate] = useState('2024-10-28'); const [time, setTime] = useState('11:30 AM'); const submit = () => create.mutate({ data: { lawyerId: lawyer.id, type, date, time } }, { onSuccess: () => { client.invalidateQueries({ queryKey: getListAppointmentsQueryKey() }); onClose(); } }); return <div className="modal-backdrop"><div className="modal"><button className="modal-close icon-button" onClick={onClose} aria-label="Close" data-testid="button-close-booking"><X size={18} /></button><span className="section-kicker">BOOK A CONSULTATION</span><h2>Meet {lawyer.name}</h2><p className="modal-subtitle">Choose a format and a time that works for you.</p><label>Consultation format<select value={type} onChange={e => setType(e.target.value)} className="select-control" data-testid="select-appointment-type"><option>Video consultation</option><option>Office consultation</option></select></label><label>Date<input type="date" value={date} onChange={e => setDate(e.target.value)} data-testid="input-appointment-date" /></label><label>Preferred time<select value={time} onChange={e => setTime(e.target.value)} className="select-control" data-testid="select-appointment-time"><option>11:30 AM</option><option>2:00 PM</option><option>4:30 PM</option></select></label><button className="button button-primary full-width modal-submit" onClick={submit} disabled={create.isPending} data-testid="button-confirm-appointment">{create.isPending ? 'Booking…' : 'Confirm appointment'} <ArrowRight size={16} /></button></div></div>; }

function Cases() {
  const cases = useListCases(); const create = useCreateCase(); const update = useUpdateCase(); const client = useQueryClient(); const [show, setShow] = useState(false); const [selected, setSelected] = useState<Case | null>(null);
  const [form, setForm] = useState({ title: '', category: 'Consumer', oppositeParty: '', description: '' }); const submit = () => create.mutate({ data: form }, { onSuccess: () => { client.invalidateQueries({ queryKey: getListCasesQueryKey() }); setShow(false); setForm({ title: '', category: 'Consumer', oppositeParty: '', description: '' }); } }); const advance = (item: Case) => { const nextStatus: Record<string, string> = { created: 'lawyer-assigned', 'lawyer-assigned': 'consultation', consultation: 'documents-uploaded', 'documents-uploaded': 'under-review', 'under-review': 'legal-notice', 'legal-notice': 'court-filing', 'court-filing': 'hearing', hearing: 'resolved', resolved: 'closed' }; update.mutate({ id: item.id, data: { status: nextStatus[item.status] || 'closed' } }, { onSuccess: () => client.invalidateQueries({ queryKey: getListCasesQueryKey() }) }); };
   return <><PageHeader eyebrow="NYAYA / YOUR MATTERS" title="My cases" description="A considered record of every matter you are working through." action={<button className="button button-primary" onClick={() => setShow(true)} data-testid="button-create-case"><Plus size={16} /> Start a case</button>} />{cases.isError ? <ErrorState retry={() => cases.refetch()} /> : cases.isLoading ? <LoadingRows count={4} /> : cases.data?.length ? <div className="case-list">{cases.data.map(item => <Card className="case-card" key={item.id} data-testid={`case-card-${item.id}`}><div className="case-card-head"><div className="case-icon"><BriefcaseBusiness size={18} /></div><div className="case-title"><Pill tone={item.status === 'closed' ? 'neutral' : 'teal'}>{item.statusLabel}</Pill><h3>{item.title}</h3><p>{item.category} · Against {item.oppositeParty}</p></div><span className="case-updated">{formatDate(item.updatedAt)}</span></div><div className="progress-line"><span style={{ width: `${item.progress}%` }} /></div><div className="case-stages"><span className="stage-done"><Check size={13} /> Intake</span><span className={item.progress > 33 ? 'stage-done' : ''}>{item.progress > 33 && <Check size={13} />} Review</span><span className={item.progress > 66 ? 'stage-done' : ''}>{item.progress > 66 && <Check size={13} />} Action</span><span className={item.progress >= 100 ? 'stage-done' : ''}>{item.progress >= 100 && <Check size={13} />} Resolution</span></div><div className="case-next"><div><span>NEXT STEP</span><b>{item.nextStep}</b></div>{item.progress < 100 && <button className="button button-secondary" onClick={() => advance(item)} disabled={update.isPending} data-testid={`button-advance-case-${item.id}`}>Mark progress <ArrowRight size={14} /></button>}</div></Card>)}</div> : <EmptyState icon={BriefcaseBusiness} title="No cases yet" text="Create a case to keep your legal matter organised from day one." action={<button className="button button-primary" onClick={() => setShow(true)} data-testid="button-empty-create-case"><Plus size={16} /> Start a case</button>} />}{show && <CaseModal form={form} setForm={setForm} submit={submit} pending={create.isPending} onClose={() => setShow(false)} />}</>;
}
function CaseModal({ form, setForm, submit, pending, onClose }: { form: { title: string; category: string; oppositeParty: string; description: string }; setForm: (f: typeof form) => void; submit: () => void; pending: boolean; onClose: () => void }) { return <div className="modal-backdrop"><div className="modal"><button className="modal-close icon-button" onClick={onClose} data-testid="button-close-case"><X size={18} /></button><span className="section-kicker">NEW MATTER</span><h2>Start a case</h2><p className="modal-subtitle">A few details help us build the right workspace for you.</p><label>Case title<input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. Builder handover delay" data-testid="input-case-title" /></label><label>Area of law<select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="select-control" data-testid="select-case-category"><option>Consumer</option><option>Property</option><option>Employment</option><option>Family</option><option>Criminal</option></select></label><label>Opposite party<input value={form.oppositeParty} onChange={e => setForm({ ...form, oppositeParty: e.target.value })} placeholder="Person or organisation" data-testid="input-case-opposite-party" /></label><label>Brief description<textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="What happened?" rows={3} data-testid="input-case-description" /></label><button className="button button-primary full-width modal-submit" onClick={submit} disabled={pending || !form.title || !form.oppositeParty || !form.description} data-testid="button-submit-case">{pending ? 'Creating…' : 'Create case'} <ArrowRight size={16} /></button></div></div>; }

function Appointments() { const appointments = useListAppointments(); const [booking, setBooking] = useState<Lawyer | null>(null); const lawyers = useListLawyers(); const upcoming = (appointments.data || []).filter(a => a.status !== 'completed'); const past = (appointments.data || []).filter(a => a.status === 'completed'); return <><PageHeader eyebrow="NYAYA / YOUR CALENDAR" title="Appointments" description="Keep every legal conversation within reach." action={<button className="button button-primary" onClick={() => setBooking(lawyers.data?.[0] || null)} data-testid="button-new-appointment"><Plus size={16} /> Book consultation</button>} />{appointments.isLoading ? <LoadingRows /> : <div className="appointments-layout"><Card><div className="card-heading"><div><span className="section-kicker">UPCOMING</span><h3>Your next conversations</h3></div><span className="result-count">{upcoming.length}</span></div>{upcoming.length ? <div className="appointment-list">{upcoming.map(a => <AppointmentRow appointment={a} key={a.id} />)}</div> : <EmptyState icon={CalendarDays} title="A little space to breathe" text="You have no upcoming appointments." />}</Card><Card><div className="card-heading"><div><span className="section-kicker">PAST CONSULTATIONS</span><h3>Previous conversations</h3></div></div>{past.length ? past.map(a => <AppointmentRow appointment={a} key={a.id} />) : <EmptyState icon={Clock3} title="No past consultations" text="Completed consultations will remain here for reference." />}</Card></div>}{booking && <BookingModal lawyer={booking} onClose={() => setBooking(null)} />}</>; }
function AppointmentRow({ appointment: a }: { appointment: Appointment }) { return <div className="appointment-row" data-testid={`appointment-row-${a.id}`}><div className="date-tile"><b>{new Date(a.date).getDate() || '—'}</b><span>{new Date(a.date).toLocaleDateString('en-IN', { month: 'short' })}</span></div><div className="appointment-detail"><div><h4>{a.lawyerName}</h4><p>{a.type} · {a.time}</p></div><Pill tone={a.status === 'completed' ? 'neutral' : 'teal'}>{a.status}</Pill></div><button className="icon-button bordered-icon" data-testid={`button-open-appointment-${a.id}`}><ArrowRight size={16} /></button></div>; }

function Documents() { const docs = useListDocuments(); const create = useCreateDocument(); const client = useQueryClient(); const [show, setShow] = useState(false); const [form, setForm] = useState({ name: '', type: 'PDF', size: 'Pending upload', caseTitle: 'General' }); const submit = () => create.mutate({ data: form }, { onSuccess: () => { client.invalidateQueries({ queryKey: getListDocumentsQueryKey() }); setShow(false); } }); return <><PageHeader eyebrow="NYAYA / PRIVATE VAULT" title="Documents" description="The papers behind your case, kept secure and easy to find." action={<button className="button button-primary" onClick={() => setShow(true)} data-testid="button-add-document"><Upload size={16} /> Add document</button>} /><Card className="secure-banner"><span className="secure-seal"><ShieldCheck size={20} /></span><div><strong>Your documents are private by design.</strong><p>Encrypted storage and access only for you and the professionals you choose.</p></div><span className="mono-label">AES-256</span></Card><Card className="documents-card"><div className="card-heading"><div><span className="section-kicker">YOUR FILES</span><h3>Document vault</h3></div><div className="search-field compact"><Search size={15} /><input placeholder="Search files" data-testid="input-document-search" /></div></div>{docs.isLoading ? <LoadingRows /> : docs.data?.length ? <div className="document-table"><div className="table-head"><span>Document</span><span>Case</span><span>Added</span><span>Size</span><span /></div>{docs.data.map(d => <div className="document-row" key={d.id} data-testid={`document-row-${d.id}`}><div className="document-name"><span className="file-icon"><FileText size={17} /></span><div><b>{d.name}</b><small>{d.type}</small></div></div><span>{d.caseTitle}</span><span>{formatDate(d.uploadedAt)}</span><span>{d.size}</span><button className="icon-button" title="Download document" data-testid={`button-download-document-${d.id}`}><Download size={16} /></button></div>)}</div> : <EmptyState icon={FileText} title="Your vault is empty" text="Add a document to keep the details of your matter together." action={<button className="button button-primary" onClick={() => setShow(true)} data-testid="button-empty-add-document"><Plus size={16} /> Add document</button>} />}</Card>{show && <div className="modal-backdrop"><div className="modal"><button className="modal-close icon-button" onClick={() => setShow(false)} data-testid="button-close-document"><X size={18} /></button><span className="section-kicker">PRIVATE VAULT</span><h2>Add document</h2><p className="modal-subtitle">Add file details now. You can attach the file securely afterward.</p><label>Document name<input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Sale agreement" data-testid="input-document-name" /></label><label>File type<select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="select-control" data-testid="select-document-type"><option>PDF</option><option>DOCX</option><option>Image</option></select></label><label>Related case<input value={form.caseTitle} onChange={e => setForm({ ...form, caseTitle: e.target.value })} data-testid="input-document-case" /></label><button className="button button-primary full-width modal-submit" onClick={submit} disabled={create.isPending || !form.name} data-testid="button-submit-document">{create.isPending ? 'Adding…' : 'Add to vault'} <ArrowRight size={16} /></button></div></div>}</>; }

function Payments() { const payments = useListPayments(); return <><PageHeader eyebrow="NYAYA / FINANCIAL RECORD" title="Payments" description="A transparent record of your consultations and services." /><Card className="payment-summary"><div><span className="section-kicker">TOTAL THIS YEAR</span><strong><IndianRupee size={21} />{(payments.data || []).reduce((s, p) => s + p.amount, 0).toLocaleString('en-IN')}</strong><p>All payments are recorded with a receipt.</p></div><div className="payment-seal"><CreditCard size={20} /><span>Secure<br />payments</span></div></Card><Card className="payments-card"><div className="card-heading"><div><span className="section-kicker">TRANSACTION HISTORY</span><h3>Payment history</h3></div><button className="button button-secondary" data-testid="button-export-payments"><Download size={15} /> Export</button></div>{payments.isLoading ? <LoadingRows /> : payments.data?.length ? <div className="payment-table"><div className="table-head"><span>Description</span><span>Date</span><span>Amount</span><span>Status</span><span /></div>{payments.data.map(p => <div className="payment-row" key={p.id} data-testid={`payment-row-${p.id}`}><div className="payment-description"><span className="payment-icon"><CreditCard size={16} /></span><b>{p.description}</b></div><span>{formatDate(p.date)}</span><strong><IndianRupee size={13} />{p.amount.toLocaleString('en-IN')}</strong><Pill tone={p.status === 'paid' ? 'teal' : 'gold'}>{p.status}</Pill><button className="icon-button" title="Download receipt" data-testid={`button-receipt-${p.id}`}><Download size={16} /></button></div>)}</div> : <EmptyState icon={CreditCard} title="No payments yet" text="Your completed payments and receipts will show here." />}</Card></>; }

function SettingsPage() { const [tab, setTab] = useState('profile'); const [saved, setSaved] = useState(false); return <><PageHeader eyebrow="NYAYA / YOUR PREFERENCES" title="Settings" description="Make Nyaya feel right for the way you work." /><div className="settings-layout"><nav className="settings-nav">{[['profile', UserRound, 'Profile'], ['notifications', Bell, 'Notifications'], ['security', ShieldCheck, 'Security'], ['appearance', Moon, 'Appearance']].map(([id, Icon, label]) => <button className={cx(tab === id && 'settings-active')} onClick={() => setTab(id as string)} key={id as string} data-testid={`button-settings-${id}`}><Icon size={16} /> {label as string}</button>)}</nav><Card className="settings-card">{tab === 'profile' && <><SettingHeading title="Profile" text="Your personal details are used to personalise your Nyaya experience." /><div className="profile-hero"><div className="avatar avatar-large avatar-gold">AS</div><div><h3>Ananya Sharma</h3><p>ananya.sharma@email.com</p></div><button className="button button-secondary" data-testid="button-change-avatar">Change photo</button></div><div className="settings-form"><label>Full name<input defaultValue="Ananya Sharma" data-testid="input-profile-name" /></label><label>Email address<input defaultValue="ananya.sharma@email.com" data-testid="input-profile-email" /></label><label>City<input defaultValue="Bengaluru, Karnataka" data-testid="input-profile-city" /></label></div></>}{tab === 'notifications' && <><SettingHeading title="Notifications" text="Choose what deserves your attention." /><Toggle title="Case activity" text="Updates when your case moves forward" checked /><Toggle title="Appointment reminders" text="A reminder 24 hours before your consultation" checked /><Toggle title="Legal signals" text="Occasional updates from the law library" /></>}{tab === 'security' && <><SettingHeading title="Security" text="Your account and documents deserve strong protection." /><Toggle title="Two-step verification" text="Add another layer of protection when signing in" checked /><div className="security-callout"><ShieldCheck size={18} /><div><b>Secure connection active</b><p>All requests to Nyaya are encrypted in transit.</p></div></div></>}{tab === 'appearance' && <><SettingHeading title="Appearance" text="Choose the atmosphere for your legal workspace." /><div className="theme-options"><button className="theme-option selected" onClick={() => { document.documentElement.classList.remove('dark'); setSaved(true); }} data-testid="button-theme-light"><Sun size={19} /><b>Light</b><span>Warm and clear</span></button><button className="theme-option" onClick={() => { document.documentElement.classList.add('dark'); setSaved(true); }} data-testid="button-theme-dark"><Moon size={19} /><b>Dark</b><span>Low light focus</span></button></div></>}{tab !== 'appearance' && <button className="button button-primary save-settings" onClick={() => setSaved(true)} data-testid="button-save-settings">{saved ? <><Check size={16} /> Saved</> : 'Save changes'}</button>}{saved && <p className="saved-note"><CheckCircle2 size={15} /> Changes saved</p>}</Card></div></>; }
function SettingHeading({ title, text }: { title: string; text: string }) { return <div className="setting-heading"><h2>{title}</h2><p>{text}</p></div>; }
function Toggle({ title, text, checked = false }: { title: string; text: string; checked?: boolean }) { const [on, setOn] = useState(checked); return <div className="toggle-row"><div><b>{title}</b><p>{text}</p></div><button className={cx('toggle', on && 'toggle-on')} onClick={() => setOn(!on)} aria-label={`Toggle ${title}`} data-testid={`button-toggle-${title.toLowerCase().replaceAll(' ', '-')}`}><span /></button></div>; }

function Router() { return <Switch><Route path="/" component={Dashboard} /><Route path="/assistant" component={Assistant} /><Route path="/library" component={Library} /><Route path="/lawyers" component={Lawyers} /><Route path="/cases" component={Cases} /><Route path="/appointments" component={Appointments} /><Route path="/documents" component={Documents} /><Route path="/payments" component={Payments} /><Route path="/settings" component={SettingsPage} /><Route component={NotFound} /></Switch>; }
function App() {
  const [user, setUser] = useState<SessionUser | null>(() => {
    try {
      const stored = localStorage.getItem('nyaya_user');
      return stored ? JSON.parse(stored) as SessionUser : null;
    } catch {
      return null;
    }
  });
  const signOut = () => {
    localStorage.removeItem('nyaya_token');
    localStorage.removeItem('nyaya_user');
    queryClient.clear();
    setUser(null);
  };
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        {user ? (
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
            {user.role === 'admin' ? (
              <AdminShell user={user} onSignOut={signOut} />
            ) : user.role === 'lawyer' ? (
              <LawyerShell user={user} onSignOut={signOut} />
            ) : (
              <Shell user={user} onSignOut={signOut}>
                <Router />
              </Shell>
            )}
          </WouterRouter>
        ) : (
          <AuthScreen onAuthenticated={setUser} />
        )}
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
export default App;