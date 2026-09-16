import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  PenSquare,
  FolderTree,
  Search,
  Smartphone,
  ArrowRight,
  Check,
  LayoutDashboard,
  Code2,
  Image as ImageIcon,
  Trash2,
  Download,
  Pin,
  ArrowUpRight,
  BookOpen,
} from 'lucide-react';
import Logo from '../components/brand/Logo.jsx';
import Button from '../components/ui/Button.jsx';
import LandingIllustration from '../components/brand/LandingIllustration.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { APP_NAME, TAGLINE } from '../lib/constants.js';

const NAV = [
  { label: 'Home', href: '#home' },
  { label: 'Features', href: '#features' },
  { label: 'About', href: '#about' },
];

const FEATURES_STRIP = [
  { icon: PenSquare, title: 'Create & Edit', sub: 'notes easily' },
  { icon: FolderTree, title: 'Organize with', sub: 'folders' },
  { icon: Search, title: 'Search anytime,', sub: 'find instantly' },
  { icon: Smartphone, title: 'Access on', sub: 'any device' },
];

const FEATURE_CARDS = [
  {
    icon: PenSquare,
    title: 'Rich text editor',
    text: 'Headings, lists, quotes, links and formatted code blocks - everything in one clean editor.',
  },
  {
    icon: Code2,
    title: 'Code blocks with syntax highlight',
    text: 'Your DSA, JavaScript or Python snippets render exactly as written. Copy in one click.',
  },
  {
    icon: ImageIcon,
    title: 'Image insertion',
    text: 'Drag and drop screenshots and diagrams - images are uploaded and stored securely in the cloud.',
  },
  {
    icon: FolderTree,
    title: 'Folders with nesting',
    text: 'Class 12 → Physics → Optics. Nest as deep as you need, without ever losing your place.',
  },
  {
    icon: Search,
    title: 'Instant search',
    text: 'Titles, content, tags or folders - results as you type, narrowed down by filters.',
  },
  {
    icon: Pin,
    title: 'Pin & favorite',
    text: 'Pin important notes to the top and mark favorites with a star.',
  },
  {
    icon: Trash2,
    title: 'Trash with 5-day safety',
    text: 'Deleted by mistake? Notes stay in trash for 5 days - restore them or delete forever.',
  },
  {
    icon: Download,
    title: 'Export as PDF',
    text: 'Export any note to PDF or Markdown in a single click.',
  },
];

const Landing = () => {
  const { user } = useAuth();
  const [menu, setMenu] = useState(false);

  const startLink = user ? '/dashboard' : '/signup';

  return (
    <div className="min-h-screen bg-white" id="home">
      {/* ---------------- navbar ---------------- */}
      <header className="sticky top-0 z-40 border-b border-line/70 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-[1180px] items-center justify-between px-4 sm:px-6">
          <Logo />

          <nav className="hidden items-center gap-8 md:flex">
            {NAV.map((n) => (
              <a key={n.label} href={n.href} className="text-sm font-medium text-ink-muted transition hover:text-ink">
                {n.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {user ? (
              <Button size="sm" iconRight={ArrowRight} as={Link} to="/dashboard">
                Dashboard
              </Button>
            ) : (
              <>
                <Button variant="ghost" size="sm" as={Link} to="/login" className="hidden sm:inline-flex">
                  Login
                </Button>
                <Button size="sm" as={Link} to="/signup">
                  Get Started
                </Button>
              </>
            )}

            <button
              onClick={() => setMenu((m) => !m)}
              className="rounded-lg p-2 text-ink-muted transition hover:bg-slate-100 md:hidden"
              aria-label="Toggle menu"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>

        {menu && (
          <div className="border-t border-line bg-white px-4 py-3 md:hidden">
            {NAV.map((n) => (
              <a key={n.label} href={n.href} onClick={() => setMenu(false)} className="block rounded-lg px-3 py-2.5 text-sm font-medium text-ink-muted hover:bg-slate-50">
                {n.label}
              </a>
            ))}
            <Link to="/login" className="block rounded-lg px-3 py-2.5 text-sm font-medium text-ink-muted hover:bg-slate-50">
              Login
            </Link>
          </div>
        )}
      </header>

      {/* ---------------- hero ---------------- */}
      <section className="mx-auto max-w-[1180px] px-4 pb-4 pt-12 sm:px-6 sm:pt-16">
        <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_1fr]">
          <div>
            <span className="chip">{TAGLINE}</span>

            <h1 className="mt-5 text-[40px] font-extrabold leading-[1.05] tracking-[-0.03em] text-ink sm:text-[52px]">{APP_NAME}</h1>

            <p className="mt-4 max-w-[430px] text-[19px] font-semibold leading-snug text-ink sm:text-[21px]">
              Your space to create, organize and never lose your notes.
            </p>

            <p className="mt-4 max-w-[460px] text-[14.5px] leading-relaxed text-ink-muted">
              Simple. Clean. Powerful. The all-in-one note management app for students, learners and lifelong learners - rich text,
              code blocks, images, nested folders and instant search.
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Button size="lg" as={Link} to={startLink} iconRight={ArrowRight}>
                Get Started Free
              </Button>
              <Button size="lg" variant="outline" as="a" href="#features">
                Learn More
              </Button>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px] text-ink-muted">
              {['100% free', 'No credit card', '5-day trash safety'].map((t) => (
                <span key={t} className="inline-flex items-center gap-1.5">
                  <Check size={14} className="text-emerald-600" /> {t}
                </span>
              ))}
            </div>
          </div>

          <div className="order-first lg:order-last">
            <LandingIllustration className="mx-auto w-full max-w-[460px]" />
          </div>
        </div>
      </section>

      {/* ---------------- feature strip ---------------- */}
      <section className="mx-auto max-w-[1180px] px-4 py-10 sm:px-6">
        <div className="grid gap-4 border-t border-line pt-8 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES_STRIP.map((f) => (
            <div key={f.title} className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                <f.icon size={18} />
              </span>
              <p className="text-[13.5px] font-semibold leading-snug text-ink">
                {f.title}
                <br />
                <span className="font-normal text-ink-muted">{f.sub}</span>
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------------- features ---------------- */}
      <section id="features" className="bg-canvas py-16 sm:py-20">
        <div className="mx-auto max-w-[1180px] px-4 sm:px-6">
          <div className="mx-auto max-w-[620px] text-center">
            <span className="chip">Everything you need</span>
            <h2 className="mt-4 text-[30px] font-bold tracking-[-0.02em] text-ink sm:text-[36px]">
              Everything you need to create, find and keep your notes
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-ink-muted">
              From lecture rough notes to final exam revision - {APP_NAME} keeps it all safe.
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURE_CARDS.map((f) => (
              <div key={f.title} className="card p-5 transition hover:border-brand-200 hover:shadow-pop">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                  <f.icon size={18} />
                </span>
                <h3 className="mt-4 text-[15px] font-semibold text-ink">{f.title}</h3>
                <p className="mt-1.5 text-[13px] leading-relaxed text-ink-muted">{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- how it works ---------------- */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-[1180px] px-4 sm:px-6">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div>
              <span className="chip">3 simple steps</span>
              <h2 className="mt-4 text-[28px] font-bold tracking-[-0.02em] text-ink sm:text-[34px]">Up and running in 30 seconds</h2>

              <ol className="mt-7 space-y-5">
                {[
                  { t: 'Create your account', d: 'Sign up with email or Google - done in one click.' },
                  { t: 'Write your first note', d: 'Create a folder and start writing - autosave keeps everything safe.' },
                  { t: 'Never lose anything', d: 'Search, pins, favorites, PDF export and 5-day trash protection.' },
                ].map((s, i) => (
                  <li key={s.t} className="flex gap-4">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-700 text-[13px] font-bold text-white">
                      {i + 1}
                    </span>
                    <div>
                      <p className="text-[15px] font-semibold text-ink">{s.t}</p>
                      <p className="mt-0.5 text-[13.5px] leading-relaxed text-ink-muted">{s.d}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            {/* mini UI mock - a glimpse of the dashboard design */}
            <div className="card overflow-hidden p-4">
              <div className="flex items-center justify-between border-b border-line pb-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-700 text-white">
                    <BookOpen size={14} />
                  </span>
                  <span className="text-[13.5px] font-bold text-ink">{APP_NAME}</span>
                </div>
                <span className="chip-muted">Good Morning</span>
              </div>

              <div className="mt-3 grid grid-cols-3 gap-2">
                {[
                  { label: 'Total Notes', value: '24' },
                  { label: 'Folders', value: '4' },
                  { label: 'Last Updated', value: 'Today' },
                ].map((s) => (
                  <div key={s.label} className="rounded-xl border border-line p-2.5">
                    <p className="text-[10.5px] font-medium text-ink-soft">{s.label}</p>
                    <p className="text-[15px] font-bold text-ink">{s.value}</p>
                  </div>
                ))}
              </div>

              <div className="mt-3 space-y-1.5">
                {[
                  { t: 'Business Environment - Chapter 1', m: 'Class 12 · 2 hours ago' },
                  { t: 'JEE Physics - Motion in a Straight Line', m: 'JEE Preparation · 5 hours ago' },
                  { t: 'Personal Goals', m: 'Personal · 1 day ago' },
                ].map((n) => (
                  <div key={n.t} className="flex items-center gap-2.5 rounded-lg border border-transparent px-2 py-2 transition hover:border-line hover:bg-slate-50">
                    <span className="flex h-7 w-7 items-center justify-center rounded-md bg-brand-50 text-brand-700">
                      <LayoutDashboard size={13} />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-[12.5px] font-semibold text-ink">{n.t}</p>
                      <p className="truncate text-[11px] text-ink-soft">{n.m}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- about ---------------- */}
      <section id="about" className="bg-canvas py-16 sm:py-20">
        <div className="mx-auto max-w-[820px] px-4 text-center sm:px-6">
          <span className="chip">About</span>
          <h2 className="mt-4 text-[28px] font-bold tracking-[-0.02em] text-ink sm:text-[34px]">Built for students, with students</h2>
          <p className="mt-4 text-[15px] leading-relaxed text-ink-muted">
            {APP_NAME} is a note management app built around the way students actually work. Lecture
            rough notes, important questions and revision points used to get lost in every possible place. Here everything
            stays organized - and even if something is deleted by mistake, it stays safe in trash for 5 days.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {[
              { k: 'Dated', v: 'Created and last-edited time on every note' },
              { k: 'Nested', v: 'Folders inside folders, as deep as you need' },
              { k: 'Fast', v: 'Instant search - results as you type' },
            ].map((x) => (
              <div key={x.k} className="card p-4 text-left">
                <p className="text-[13px] font-bold text-brand-700">{x.k}</p>
                <p className="mt-1 text-[13px] leading-relaxed text-ink-muted">{x.v}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- CTA ---------------- */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-[1180px] px-4 sm:px-6">
          <div className="relative overflow-hidden rounded-3xl bg-brand-700 px-6 py-12 text-center sm:px-12">
            <div className="pointer-events-none absolute -left-16 -top-16 h-56 w-56 rounded-full bg-white/10" />
            <div className="pointer-events-none absolute -bottom-20 -right-10 h-64 w-64 rounded-full bg-white/10" />

            <h2 className="relative text-[26px] font-bold tracking-[-0.02em] text-white sm:text-[32px]">Start writing your notes today - for free</h2>
            <p className="relative mx-auto mt-3 max-w-[520px] text-[14.5px] leading-relaxed text-blue-100">
              One account keeps your entire academic notebook online. The same notes on mobile, tablet and laptop.
            </p>

            <div className="relative mt-7 flex flex-wrap justify-center gap-3">
              <Button size="lg" as={Link} to={startLink} className="bg-white text-brand-700 hover:bg-blue-50" iconRight={ArrowUpRight}>
                Get Started Free
              </Button>
              {!user && (
                <Button size="lg" as={Link} to="/login" variant="ghost" className="text-white hover:bg-white/10">
                  Already have an account? Login
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- footer ---------------- */}
      <footer className="border-t border-line py-8">
        <div className="mx-auto flex max-w-[1180px] flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6">
          <Logo size="sm" />
          <p className="text-center text-[12.5px] text-ink-soft">
            © {new Date().getFullYear()} {APP_NAME}. Built with MongoDB · Express · React · Node.
          </p>
          <div className="flex items-center gap-5 text-[12.5px] text-ink-muted">
            <a href="#features" className="hover:text-ink">
              Features
            </a>
            <a href="#about" className="hover:text-ink">
              About
            </a>
            <Link to="/login" className="hover:text-ink">
              Login
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
