import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Navbar, Footer } from '@/components/layout';
import {
  Sparkles,
  ScanFace,
  ShieldCheck,
  Zap,
  Users,
  Camera,
  Heart,
  ArrowRight,
  Target,
  Award,
  Layers,
  Code2
} from 'lucide-react';

const STATS = [
  { value: '120+', label: 'Events Hosted' },
  { value: '450+', label: 'Photos Preserved' },
  { value: '280+', label: 'Happy Guests' },
  { value: '99.9%', label: 'Uptime Reliability' },
];

const PILLARS = [
  {
    icon: ScanFace,
    title: 'On-Device AI Face Intelligence',
    desc: 'Cutting-edge face matching that runs in the browser. Zero server transfer of biometric features, delivering instant search without sacrificing privacy.',
    color: 'from-purple-500/20 to-indigo-500/10',
    border: 'border-purple-500/20',
  },
  {
    icon: ShieldCheck,
    title: 'Zero-Compression Quality',
    desc: 'Unlike messaging apps that compress away clarity, SnapMemory stores photos in original full resolution with complete color fidelity and metadata.',
    color: 'from-blue-500/20 to-cyan-500/10',
    border: 'border-blue-500/20',
  },
  {
    icon: Zap,
    title: 'Effortless QR Code Onboarding',
    desc: 'Guests don’t need to download a heavy app or create complex accounts. One simple scan opens the live event gallery instantly.',
    color: 'from-amber-500/20 to-orange-500/10',
    border: 'border-amber-500/20',
  },
  {
    icon: Users,
    title: 'Collaborative Real-Time Memory',
    desc: 'An event seen from 50 different angles. Friends, family, and professional photographers all contribute to a single synchronized album.',
    color: 'from-pink-500/20 to-rose-500/10',
    border: 'border-pink-500/20',
  },
];

const TECH_STACK = [
  { name: 'React 19 & TypeScript', desc: 'Ultra-fast modern component architecture' },
  { name: 'face-api.js & WebGL', desc: 'Hardware-accelerated on-device neural vision' },
  { name: 'Vite & Tailwind CSS v4', desc: 'Sub-second page rendering and sleek theme' },
  { name: 'Supabase & Cloud Storage', desc: 'Scalable media storage and instant metadata' },
];

export function AboutPage() {
  return (
    <div className="min-h-screen bg-[#0c0a1a] flex flex-col text-white selection:bg-purple-500 selection:text-white">
      <Navbar />

      <main className="flex-1">
        {/* ── Hero Section ── */}
        <section className="relative pt-32 pb-20 px-4 sm:px-6 max-w-6xl mx-auto text-center overflow-hidden">
          {/* Subtle Glows */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/25 text-xs font-semibold text-purple-300 mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Our Story &amp; Vision</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight mb-6">
              Every Event. Every Memory.{' '}
              <span className="bg-gradient-to-r from-purple-400 via-fuchsia-300 to-indigo-400 bg-clip-text text-transparent">
                One Place.
              </span>
            </h1>

            <p className="text-secondary text-base sm:text-lg max-w-2xl mx-auto leading-relaxed mb-10">
              We started SnapMemory with a simple belief: celebrations are fleeting, but the memories made by everyone present should never be lost in buried WhatsApp groups or expired Google Drive links.
            </p>
          </motion.div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mt-6">
            {STATS.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 * i }}
                className="card p-6 border border-purple-500/20 bg-purple-950/20 text-center"
              >
                <p className="text-3xl font-black text-white mb-1">{s.value}</p>
                <p className="text-xs text-muted font-medium">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── Founder Story ── */}
        <section className="py-16 px-4 sm:px-6 max-w-5xl mx-auto">
          <div className="card p-8 sm:p-12 border border-purple-500/25 bg-gradient-to-br from-[#16122e] to-[#0f0b20] relative overflow-hidden">
            <div className="grid md:grid-cols-3 gap-8 items-center">
              <div className="text-center md:text-left">
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-500 p-1 mx-auto md:mx-0 shadow-lg shadow-purple-900/40 mb-4">
                  <div className="w-full h-full rounded-xl bg-[#151228] flex items-center justify-center text-3xl font-black text-purple-300">
                    KY
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white">Kishan Yadav</h3>
                <p className="text-xs text-purple-400 font-medium">Founder &amp; Lead Architect</p>
                <div className="flex items-center justify-center md:justify-start gap-2 mt-3 text-muted text-xs">
                  <Code2 className="w-3.5 h-3.5" /> Full-Stack &amp; AI
                </div>
              </div>

              <div className="md:col-span-2 space-y-4 text-sm text-secondary leading-relaxed">
                <h4 className="text-lg font-bold text-white flex items-center gap-2">
                  <Target className="w-5 h-5 text-purple-400" /> Why We Built SnapMemory
                </h4>
                <p>
                  At every wedding or college festival, hundreds of guests take breathtaking photos. Yet weeks later, the host receives just a trickle of them over compressed chat apps, while the official photographers take months to deliver an album.
                </p>
                <p>
                  SnapMemory solves this by giving every event an interactive digital hub. Guests scan a table QR code, drop their photos in seconds, and use on-device AI face matching to instantly discover every photo they appear in without endless scrolling.
                </p>
                <p className="text-purple-300 font-medium">
                  "Our goal is to make event photography collaborative, high-speed, and deeply personal."
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Core Pillars ── */}
        <section className="py-16 px-4 sm:px-6 max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-bold text-purple-400 uppercase tracking-widest mb-2">Our Foundation</p>
            <h2 className="text-3xl font-black text-white">Engineered For Perfection</h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            {PILLARS.map((p, i) => (
              <motion.div
                key={p.title}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`card p-6 bg-gradient-to-br ${p.color} border ${p.border}`}
              >
                <div className="w-10 h-10 rounded-xl gradient-brand flex items-center justify-center mb-4 shadow-lg shadow-purple-900/30">
                  <p.icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{p.title}</h3>
                <p className="text-sm text-secondary leading-relaxed">{p.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── Tech Stack ── */}
        <section className="py-16 px-4 sm:px-6 max-w-5xl mx-auto border-t border-purple-900/20">
          <div className="text-center mb-10">
            <p className="text-xs font-bold text-purple-400 uppercase tracking-widest mb-2">Modern Architecture</p>
            <h2 className="text-2xl font-bold text-white">Powered By Modern Web Standards</h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {TECH_STACK.map(tech => (
              <div key={tech.name} className="glass-light p-4 rounded-xl border border-purple-500/10">
                <p className="text-sm font-bold text-white mb-1">{tech.name}</p>
                <p className="text-xs text-muted">{tech.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA Banner ── */}
        <section className="py-16 px-4 sm:px-6 max-w-4xl mx-auto text-center">
          <div className="card p-10 border border-purple-500/30 bg-gradient-to-r from-purple-900/30 via-purple-950/40 to-indigo-900/30">
            <h3 className="text-2xl font-black text-white mb-3">Ready to Experience SnapMemory?</h3>
            <p className="text-secondary text-sm mb-6 max-w-md mx-auto">
              Create an event gallery or explore our live wedding demonstration.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link to="/signup" className="btn-primary">
                Create Free Event <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/event/evt-1" className="btn-secondary">
                View Live Demo
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
