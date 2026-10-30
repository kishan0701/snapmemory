import { useState, useEffect, useRef } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Images, Sparkles, QrCode, Download, Shield, ScanFace,
  ArrowRight, Star, Users, CheckCircle2, Zap, Play,
  Upload, Camera, ChevronRight, Lock,
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { MOCK_MEDIA_WEDDING, MOCK_MEDIA_COLLEGE } from '@/lib/mock-data';

// ─── Data ──────────────────────────────────────────────────────────────────────
const HERO_PHOTOS = [
  ...MOCK_MEDIA_WEDDING.slice(0, 3).map(m => m.preview_url ?? m.original_url),
  ...MOCK_MEDIA_COLLEGE.slice(0, 3).map(m => m.preview_url ?? m.original_url),
];

const FEATURES = [
  {
    icon: Upload,
    title: 'Easy Upload',
    desc: 'Photos & Videos',
    color: 'from-violet-600 to-purple-600',
    glow: 'shadow-purple-500/30',
  },
  {
    icon: Images,
    title: 'Beautiful Gallery',
    desc: 'Modern & Responsive',
    color: 'from-blue-600 to-indigo-600',
    glow: 'shadow-blue-500/30',
  },
  {
    icon: ScanFace,
    title: 'Find My Photos',
    desc: 'AI-Powered Search',
    color: 'from-fuchsia-600 to-pink-600',
    glow: 'shadow-pink-500/30',
  },
  {
    icon: QrCode,
    title: 'Share Instantly',
    desc: 'QR Code / Link',
    color: 'from-amber-500 to-orange-500',
    glow: 'shadow-orange-500/30',
  },
  {
    icon: Download,
    title: 'Download Easily',
    desc: 'Full Quality Media',
    color: 'from-emerald-500 to-teal-500',
    glow: 'shadow-emerald-500/30',
  },
];

const OCCASIONS = [
  {
    emoji: '💍',
    title: 'Weddings',
    desc: 'Capture your special day',
    img: MOCK_MEDIA_WEDDING[2].preview_url!,
  },
  {
    emoji: '🎓',
    title: 'College Events',
    desc: 'Fests, Farewells & More',
    img: MOCK_MEDIA_COLLEGE[0].preview_url!,
  },
  {
    emoji: '🎂',
    title: 'Birthdays',
    desc: 'Cherish the moments',
    img: MOCK_MEDIA_WEDDING[5].preview_url!,
  },
  {
    emoji: '💼',
    title: 'Corporate Events',
    desc: 'Professional & Seamless',
    img: MOCK_MEDIA_COLLEGE[3].preview_url!,
  },
];

const FEATURE_CARDS = [
  {
    icon: Images, title: 'Beautiful Event Galleries',
    desc: 'Masonry and grid layouts that make every photo look stunning. Auto-organized by albums.',
    color: 'from-purple-500/20 to-violet-500/10', border: 'border-purple-500/20',
  },
  {
    icon: ScanFace, title: 'AI Face Matching',
    desc: 'Upload a selfie and let AI find every photo you appear in from the entire event instantly.',
    color: 'from-blue-500/20 to-indigo-500/10', border: 'border-blue-500/20',
  },
  {
    icon: Users, title: 'Collaborative Uploads',
    desc: 'Guests can request upload access. Admins approve with full control over permissions.',
    color: 'from-green-500/20 to-emerald-500/10', border: 'border-green-500/20',
  },
  {
    icon: QrCode, title: 'QR Code Sharing',
    desc: 'One QR code opens your entire event gallery. Print it, share it, scan it — done.',
    color: 'from-amber-500/20 to-orange-500/10', border: 'border-amber-500/20',
  },
  {
    icon: Download, title: 'Full-Quality Downloads',
    desc: 'Download single photos, entire albums or ZIP archives in full original resolution.',
    color: 'from-pink-500/20 to-rose-500/10', border: 'border-pink-500/20',
  },
  {
    icon: Shield, title: 'Secure Event Access',
    desc: 'Public, private, unlisted or password-protected. You control who sees what.',
    color: 'from-teal-500/20 to-cyan-500/10', border: 'border-teal-500/20',
  },
];

const STATS = [
  { value: '120+', label: 'Events Created', icon: Camera },
  { value: '450+', label: 'Photos Shared', icon: Images },
  { value: '280+', label: 'Happy Users', icon: Users },
  { value: '4.8★', label: 'App Rating', icon: Star },
];

// ─── Animated Section Wrapper ──────────────────────────────────────────────────
function FadeIn({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── Hero photo rotator (full-screen background) ──────────────────────────────
function HeroPhotoGrid() {
  const [active, setActive] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setActive(a => (a + 1) % HERO_PHOTOS.length), 3000);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="absolute inset-0">
      <AnimatePresence mode="sync">
        <motion.img
          key={active}
          src={HERO_PHOTOS[active]}
          alt="Event moment"
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: 'easeInOut' }}
          className="absolute inset-0 w-full h-full object-cover"
        />
      </AnimatePresence>
      {/* Dot indicators — bottom center */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
        {HERO_PHOTOS.map((_, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className={`rounded-full transition-all ${i === active ? 'bg-white w-5 h-1.5' : 'bg-white/40 w-1.5 h-1.5'}`}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────────
export function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0d0920]">
      <Navbar />

      {/* ═══════════════════════════════════════════════════════════
          HERO — Full-screen photo background like EventSnap
      ═══════════════════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex items-end overflow-hidden">
        {/* Full-screen background photo */}
        <div className="absolute inset-0">
          <HeroPhotoGrid />
        </div>

        {/* Multi-layer overlay: bottom dark, left dark, top subtle */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d0920] via-[#0d0920]/55 to-[#0d0920]/20 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0d0920]/80 via-[#0d0920]/20 to-transparent pointer-events-none" />

        {/* Ambient glow */}
        <div className="absolute top-1/3 left-1/4 w-[500px] h-[400px] rounded-full blur-[120px] opacity-20 pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.6) 0%, transparent 70%)' }} />

        {/* Content — bottom aligned, left side */}
        <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 pb-16 pt-32 flex flex-col lg:flex-row items-end justify-between gap-10">
          {/* Left text block */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-xl"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/20 border border-purple-500/30 text-xs font-semibold text-purple-300 mb-5">
              <Sparkles className="w-3 h-3" /> AI-Powered Event Photography Platform
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight tracking-tight mb-4 drop-shadow-2xl">
              Event Memories<br />
              Made <span className="gradient-text-brand">Simple</span>
            </h1>

            <p className="text-base text-white/70 leading-relaxed mb-7 max-w-md">
              Upload, organize and share your event photos &amp; videos in a beautiful gallery.
              Let your guests find, view and download their memories with ease.
            </p>

            <div className="flex flex-wrap gap-3 mb-8">
              <Link to="/signup" className="btn-primary px-6 py-3 text-base shadow-2xl shadow-purple-500/30">
                Create Event <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/event/evt-1" className="btn-secondary px-6 py-3 text-base gap-2">
                <Play className="w-4 h-4" /> View Demo
              </Link>
            </div>

            {/* Features strip — 5 icons */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {FEATURES.slice(0, 5).map(f => (
                <div key={f.title} className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${f.color} shadow-lg flex items-center justify-center flex-shrink-0`}>
                    <f.icon className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white leading-tight">{f.title}</p>
                    <p className="text-[10px] text-white/50">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right — floating cards */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="flex flex-col gap-3 flex-shrink-0"
          >
            {/* Floating live badge */}
            <motion.div
              animate={{ y: [-4, 4, -4] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="glass px-4 py-3 rounded-2xl flex items-center gap-3 shadow-xl"
            >
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
              <div>
                <p className="text-xs text-white font-bold">Live · 2,436 photos uploaded</p>
                <p className="text-[10px] text-white/50">TSDC Annual Fest 2026</p>
              </div>
            </motion.div>

            {/* Floating card — top */}
            <motion.div
              animate={{ y: [-6, 6, -6] }}
              transition={{ duration: 4, repeat: Infinity, delay: 0.5 }}
              className="glass px-4 py-3 rounded-2xl flex items-center gap-2.5 shadow-xl"
            >
              <span className="text-xl">📸</span>
              <div>
                <p className="text-xs text-white font-bold">More Than Photos</p>
                <p className="text-[10px] text-white/50 italic">It's Your Story</p>
              </div>
            </motion.div>

            {/* Stars review */}
            <motion.div
              animate={{ y: [5, -5, 5] }}
              transition={{ duration: 3.5, repeat: Infinity, delay: 1 }}
              className="glass px-4 py-3 rounded-2xl shadow-xl"
            >
              <div className="flex items-center gap-1 mb-1">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-3 h-3 text-amber-400 fill-amber-400" />)}
              </div>
              <p className="text-xs text-white font-semibold">"Best event app ever!"</p>
              <p className="text-[10px] text-white/50">— Priya M., Wedding Photographer</p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          STATS BAR
      ═══════════════════════════════════════════════════════════ */}
      <section className="border-y border-purple-900/20 bg-purple-950/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map((s, i) => (
            <FadeIn key={s.label} delay={i * 0.08} className="text-center">
              <p className="text-3xl font-black text-white mb-1">{s.value}</p>
              <p className="text-sm text-muted">{s.label}</p>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          PERFECT FOR EVERY OCCASION
      ═══════════════════════════════════════════════════════════ */}
      <section id="occasions" className="max-w-7xl mx-auto px-4 sm:px-6 py-24">
        <FadeIn className="text-center mb-14">
          <p className="text-xs font-bold text-purple-400 uppercase tracking-widest mb-3">Use Cases</p>
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
            Perfect for Every Occasion
          </h2>
          <p className="text-secondary max-w-xl mx-auto">
            From intimate gatherings to large corporate events — SnapMemory scales beautifully.
          </p>
        </FadeIn>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {OCCASIONS.map((occ, i) => (
            <FadeIn key={occ.title} delay={i * 0.1}>
              <div className="group relative rounded-2xl overflow-hidden aspect-[3/4] cursor-pointer">
                <img
                  src={occ.img}
                  alt={occ.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute inset-0 p-4 flex flex-col justify-end">
                  <span className="text-2xl mb-1">{occ.emoji}</span>
                  <h3 className="text-white font-black text-base leading-tight">{occ.title}</h3>
                  <p className="text-white/60 text-xs mt-0.5">{occ.desc}</p>
                </div>
                {/* Hover glow */}
                <div className="absolute inset-0 rounded-2xl ring-2 ring-purple-500/0 group-hover:ring-purple-500/50 transition-all duration-300" />
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          FEATURES GRID
      ═══════════════════════════════════════════════════════════ */}
      <section id="features" className="bg-purple-950/10 border-y border-purple-900/15 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <FadeIn className="text-center mb-14">
            <p className="text-xs font-bold text-purple-400 uppercase tracking-widest mb-3">Features</p>
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
              Everything You Need
            </h2>
            <p className="text-secondary max-w-xl mx-auto">
              A complete toolkit for managing event photos — from upload to download.
            </p>
          </FadeIn>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURE_CARDS.map((f, i) => (
              <FadeIn key={f.title} delay={i * 0.07}>
                <div className={`card p-6 bg-gradient-to-br ${f.color} border ${f.border} hover:scale-[1.02] transition-transform duration-200 h-full`}>
                  <div className="w-10 h-10 rounded-xl gradient-brand flex items-center justify-center mb-4 shadow-lg">
                    <f.icon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-bold text-white text-base mb-2">{f.title}</h3>
                  <p className="text-sm text-secondary leading-relaxed">{f.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          DEMO EVENT PREVIEW (like image — gallery mockup)
      ═══════════════════════════════════════════════════════════ */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 py-24">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <FadeIn>
            <p className="text-xs font-bold text-purple-400 uppercase tracking-widest mb-3">Live Preview</p>
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-5">
              Your Event Gallery,<br />
              <span className="gradient-text-brand">Beautifully Organized</span>
            </h2>
            <p className="text-secondary mb-8 leading-relaxed">
              Every photo and video from your event in one stunning gallery.
              Guests can browse albums, download memories, and even find themselves using AI.
            </p>
            <div className="space-y-4 mb-8">
              {[
                { icon: CheckCircle2, text: 'Auto-organized into albums by time & category', color: 'text-emerald-400' },
                { icon: ScanFace, text: 'AI face matching — find yourself in 2 seconds', color: 'text-purple-400' },
                { icon: QrCode, text: 'Share via QR code — no app download needed', color: 'text-blue-400' },
                { icon: Lock, text: 'Granular privacy controls per event', color: 'text-amber-400' },
              ].map(item => (
                <div key={item.text} className="flex items-start gap-3">
                  <item.icon className={`w-5 h-5 ${item.color} flex-shrink-0 mt-0.5`} />
                  <p className="text-sm text-secondary">{item.text}</p>
                </div>
              ))}
            </div>
            <Link to="/event/evt-1" className="btn-primary inline-flex">
              See Live Demo <ChevronRight className="w-4 h-4" />
            </Link>
          </FadeIn>

          {/* Gallery mockup */}
          <FadeIn delay={0.2}>
            <div className="card p-4 shadow-2xl shadow-purple-900/40">
              {/* Mock event header */}
              <div className="relative rounded-xl overflow-hidden h-36 mb-4">
                <img src={MOCK_MEDIA_WEDDING[0].preview_url} className="w-full h-full object-cover" alt="Event" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute bottom-3 left-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="badge badge-purple text-[10px]">Wedding</span>
                  </div>
                  <h3 className="text-white font-black text-lg">Karan &amp; Riya</h3>
                  <p className="text-white/60 text-xs">21 Feb 2026 · The Grand Palace, Jaipur</p>
                </div>
                {/* Share card */}
                <div className="absolute top-3 right-3 glass rounded-xl p-2.5 text-center">
                  <div className="w-14 h-14 bg-white rounded-lg mx-auto mb-1 flex items-center justify-center">
                    <QrCode className="w-10 h-10 text-black" />
                  </div>
                  <p className="text-[9px] text-white/60">Scan QR to open</p>
                  <p className="text-[9px] text-purple-300 font-mono">snapmemory.in/karan-riya</p>
                </div>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                {[
                  { val: '1,248', label: 'Photos' },
                  { val: '86', label: 'Videos' },
                  { val: '12', label: 'Albums' },
                ].map(s => (
                  <div key={s.label} className="glass-light rounded-xl p-2 text-center">
                    <p className="text-white font-black text-sm">{s.val}</p>
                    <p className="text-muted text-[10px]">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Photo grid preview */}
              <div className="grid grid-cols-3 gap-1.5">
                {MOCK_MEDIA_WEDDING.slice(0, 6).map(m => (
                  <div key={m.id} className="aspect-square rounded-lg overflow-hidden">
                    <img src={m.thumbnail_url ?? m.preview_url} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          FIND MY PHOTOS HIGHLIGHT
      ═══════════════════════════════════════════════════════════ */}
      <section className="bg-gradient-to-br from-purple-950/30 via-[#0d0920] to-indigo-950/20 border-y border-purple-900/15 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid lg:grid-cols-2 gap-16 items-center">
          {/* Phone mockup */}
          <FadeIn className="flex justify-center">
            <div className="relative w-64">
              {/* Phone frame */}
              <div className="bg-[#1a1035] rounded-3xl border border-purple-500/20 shadow-2xl shadow-purple-900/50 overflow-hidden">
                {/* Status bar */}
                <div className="flex items-center justify-between px-5 pt-3 pb-2">
                  <span className="text-[10px] text-white font-semibold">9:41</span>
                  <div className="flex gap-1">
                    <div className="w-3 h-1.5 bg-white/60 rounded-sm" />
                    <div className="w-3 h-1.5 bg-white/60 rounded-sm" />
                    <div className="w-1.5 h-1.5 bg-white/80 rounded-full" />
                  </div>
                </div>
                {/* Header */}
                <div className="px-4 py-2 border-b border-purple-500/10">
                  <h3 className="text-white font-black text-sm text-center">Find My Photos</h3>
                  <p className="text-muted text-[10px] text-center mt-0.5">Upload a clear selfie and we'll show you photos from this event.</p>
                </div>
                {/* Selfie upload area */}
                <div className="px-4 py-4">
                  <div className="w-20 h-20 rounded-full mx-auto border-2 border-dashed border-purple-500/40 flex items-center justify-center mb-3 bg-purple-500/10">
                    <img src={MOCK_MEDIA_COLLEGE[7].preview_url} alt="selfie" className="w-full h-full object-cover rounded-full" />
                  </div>
                  <button className="w-full py-2 rounded-xl gradient-brand text-white text-xs font-bold mb-1">
                    Upload Selfie
                  </button>
                  <p className="text-muted text-[9px] text-center">Works best with a clear front face photo</p>
                </div>
                {/* Results */}
                <div className="px-4 pb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white text-[11px] font-bold">Matching Photos</span>
                    <span className="text-purple-400 text-[10px]">View All</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    {MOCK_MEDIA_COLLEGE.slice(0, 3).map(m => (
                      <div key={m.id} className="aspect-square rounded-lg overflow-hidden">
                        <img src={m.thumbnail_url ?? m.preview_url} alt="" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-center">
                    <p className="text-xs text-purple-300 font-semibold">Your photos, your memories ❤️</p>
                  </div>
                </div>
              </div>

              {/* Floating glow */}
              <div className="absolute inset-0 rounded-3xl blur-xl -z-10 opacity-30"
                style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.6) 0%, transparent 70%)' }} />
            </div>
          </FadeIn>

          <FadeIn delay={0.2}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-fuchsia-500/15 border border-fuchsia-500/25 text-xs font-semibold text-fuchsia-300 mb-5">
              <ScanFace className="w-3.5 h-3.5" /> Powered by face-api.js · 100% Private
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-5">
              Find Yourself in<br />
              <span className="gradient-text-brand">Every Photo</span>
            </h2>
            <p className="text-secondary mb-6 leading-relaxed">
              Upload a selfie, and our on-device AI scans the entire event gallery to find
              every photo you appear in — in seconds. No server. No data stored. Pure privacy.
            </p>
            <div className="space-y-3 mb-8">
              {[
                '🔒 Face data never leaves your device',
                '⚡ Scans 200+ photos in under 30 seconds',
                '🎯 Ranked by match confidence',
                '⬇️ Download all your photos in one click',
              ].map(item => (
                <div key={item} className="flex items-center gap-2 text-sm text-secondary">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  {item}
                </div>
              ))}
            </div>
            <Link to="/event/evt-2/find-photos" className="btn-primary inline-flex">
              Try It Now <ScanFace className="w-4 h-4" />
            </Link>
          </FadeIn>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          TESTIMONIALS
      ═══════════════════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-24">
        <FadeIn className="text-center mb-14">
          <p className="text-xs font-bold text-purple-400 uppercase tracking-widest mb-3">Testimonials</p>
          <h2 className="text-3xl sm:text-4xl font-black text-white">Loved by Event Organizers</h2>
        </FadeIn>

        <div className="grid md:grid-cols-3 gap-5">
          {[
            {
              name: 'Priya Mehta', role: 'Wedding Photographer', avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=priya&backgroundColor=7c3aed',
              text: 'SnapMemory transformed how I deliver wedding galleries. Clients love the QR code sharing and AI face search. Absolute game changer.',
              stars: 5,
            },
            {
              name: 'Rahul Verma', role: 'College Fest Organizer', avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=rahul&backgroundColor=4f46e5',
              text: 'We had 2,400 photos from our annual fest. Every student found their photos in seconds using the face matching. Unbelievable!',
              stars: 5,
            },
            {
              name: 'Sneha Kapoor', role: 'Corporate Event Manager', avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=sneha&backgroundColor=2563eb',
              text: 'The download analytics and contributor management saved us hours. Professional, clean, and our clients love the premium gallery look.',
              stars: 5,
            },
          ].map((t, i) => (
            <FadeIn key={t.name} delay={i * 0.1}>
              <div className="card p-6 h-full">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(t.stars)].map((_, j) => (
                    <Star key={j} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-secondary text-sm leading-relaxed mb-5 italic">"{t.text}"</p>
                <div className="flex items-center gap-3 mt-auto">
                  <img src={t.avatar} alt={t.name} className="w-9 h-9 rounded-full" />
                  <div>
                    <p className="text-white text-sm font-bold">{t.name}</p>
                    <p className="text-muted text-xs">{t.role}</p>
                  </div>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          CTA
      ═══════════════════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-24">
        <FadeIn>
          <div className="relative rounded-3xl overflow-hidden border border-purple-500/20 bg-gradient-to-br from-purple-600/20 via-[#120d26] to-indigo-600/15 p-12 text-center">
            {/* Background glow */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] blur-[100px] opacity-20"
                style={{ background: 'radial-gradient(ellipse, rgba(124,58,237,0.8) 0%, transparent 70%)' }} />
            </div>
            <div className="relative">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/20 border border-purple-500/30 text-xs font-semibold text-purple-300 mb-5">
                <Zap className="w-3 h-3" /> Free to start — no credit card required
              </div>
              <h2 className="text-3xl sm:text-5xl font-black text-white mb-5">
                Start Capturing Memories<br />
                <span className="gradient-text-brand">Today</span>
              </h2>
              <p className="text-secondary text-lg mb-8 max-w-xl mx-auto">
                Create your first event gallery in under 2 minutes. Your guests will thank you.
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                <Link to="/signup" className="btn-primary px-8 py-3.5 text-base">
                  Create Free Event <ArrowRight className="w-4 h-4" />
                </Link>
                <Link to="/event/evt-1" className="btn-secondary px-8 py-3.5 text-base">
                  View Demo
                </Link>
              </div>
              {/* Subtle credit — hidden in plain sight for curious devs */}
              <p className="mt-8 text-xs text-white/10 select-none">
                Crafted with ❤️ by Kishan Yadav · v1.0.0 · SnapMemory
              </p>
            </div>
          </div>
        </FadeIn>
      </section>

      <Footer />
    </div>
  );
}
