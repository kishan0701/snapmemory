import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar, Footer } from '@/components/layout';
import {
  Briefcase,
  MapPin,
  Clock,
  Sparkles,
  Zap,
  Heart,
  Laptop,
  GraduationCap,
  ArrowRight,
  X,
  Send,
  CheckCircle2
} from 'lucide-react';
import toast from 'react-hot-toast';

interface JobPosition {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  experience: string;
  description: string;
  responsibilities: string[];
  skills: string[];
}

const POSITIONS: JobPosition[] = [
  {
    id: 'job-1',
    title: 'Senior Frontend & WebGL Engineer',
    department: 'Engineering',
    location: 'Remote / Hybrid (Bengaluru)',
    type: 'Full-time',
    experience: '3+ Years',
    description: 'Lead the development of our high-performance client gallery. Optimize responsive masonry grids, virtualized image rendering, and smooth gestures for millions of event photos.',
    responsibilities: [
      'Architect sub-second loading galleries using React 19, TypeScript, and Vite.',
      'Optimize WebGL canvas operations for live photo preview and filter rendering.',
      'Work closely with design to craft buttery-smooth micro-interactions with Framer Motion.',
    ],
    skills: ['React 19', 'TypeScript', 'Tailwind CSS', 'Framer Motion', 'Canvas / WebGL'],
  },
  {
    id: 'job-2',
    title: 'Computer Vision & On-Device ML Specialist',
    department: 'AI & Research',
    location: 'Remote (India)',
    type: 'Full-time',
    experience: '2+ Years',
    description: 'Push the frontiers of browser-based computer vision. You will optimize neural model quantization, face detection lattices, and 128-D embedding matching directly inside client WebAssembly & WebGL.',
    responsibilities: [
      'Benchmark and prune SSD MobileNet and tiny face models for lower memory footprints on mobile browsers.',
      'Improve multi-face clustering accuracy and selfie distance calibration.',
      'Design fail-safe fallback algorithms for low-light wedding photography.',
    ],
    skills: ['TensorFlow.js', 'face-api.js', 'ONNX / WebAssembly', 'Python', 'Computer Vision'],
  },
  {
    id: 'job-3',
    title: 'Product & Brand Designer (UI/UX)',
    department: 'Design',
    location: 'Remote / Jaipur HQ',
    type: 'Full-time',
    experience: '2+ Years',
    description: 'Define the visual language of SnapMemory across web, mobile viewports, and printed event QR displays. Craft unforgettable experiences for wedding couples and fest organizers.',
    responsibilities: [
      'Design clean, intuitive event management flows, guest contributor modals, and QR card generators.',
      'Maintain and expand our dark-mode design system with accessibility standards.',
      'Conduct user testing with real event organizers and photographers.',
    ],
    skills: ['Figma', 'Design Systems', 'Micro-interactions', 'Prototyping', 'Visual Design'],
  },
  {
    id: 'job-4',
    title: 'Event Partner & Community Specialist',
    department: 'Growth',
    location: 'Hybrid (Mumbai / Delhi)',
    type: 'Full-time',
    experience: '1+ Years',
    description: 'Connect with premium wedding photographers, event management firms, and college festival councils to onboard them onto the SnapMemory ecosystem.',
    responsibilities: [
      'Build relationships with top-tier wedding planners and student council leads.',
      'Deliver live demos and assist coordinators with QR stand placement and gallery setup.',
      'Gather direct feature feedback to influence our technical roadmap.',
    ],
    skills: ['Relationship Management', 'Event Planning', 'Public Speaking', 'Customer Success'],
  },
];

const PERKS = [
  { icon: Laptop, title: 'Remote-First Flexibility', desc: 'Work from wherever you do your best work with flexible hours.' },
  { icon: Sparkles, title: 'Cutting-Edge AI Tech', desc: 'Solve real-world client-side neural vision and high-throughput media challenges.' },
  { icon: Heart, title: 'Generous Health Cover', desc: 'Comprehensive medical insurance for you and your dependents.' },
  { icon: GraduationCap, title: 'Annual Learning Grant', desc: '₹50,000 yearly stipend for books, conferences, courses, and certifications.' },
];

export function CareersPage() {
  const [selectedJob, setSelectedJob] = useState<JobPosition | null>(null);
  const [form, setForm] = useState({
    name: '',
    email: '',
    linkedin: '',
    portfolio: '',
    notes: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email) {
      toast.error('Please fill in your name and email');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      toast.success(`Application for "${selectedJob?.title}" submitted successfully! Our team will contact you shortly.`);
      setSelectedJob(null);
      setForm({ name: '', email: '', linkedin: '', portfolio: '', notes: '' });
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#0c0a1a] flex flex-col text-white selection:bg-purple-500 selection:text-white">
      <Navbar />

      <main className="flex-1">
        {/* ── Hero Section ── */}
        <section className="relative pt-32 pb-16 px-4 sm:px-6 max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/25 text-xs font-semibold text-purple-300 mb-6">
            <Briefcase className="w-3.5 h-3.5" />
            <span>We Are Hiring</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight mb-5">
            Help Us Build the{' '}
            <span className="bg-gradient-to-r from-purple-400 via-fuchsia-300 to-indigo-400 bg-clip-text text-transparent">
              Future of Memories
            </span>
          </h1>

          <p className="text-secondary text-base sm:text-lg max-w-2xl mx-auto leading-relaxed mb-12">
            We’re an ambitious team building high-performance software for life’s most cherished celebrations. Join us in shaping how millions of people share and remember.
          </p>

          {/* Perks Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
            {PERKS.map(p => (
              <div key={p.title} className="card p-5 border border-purple-500/20 bg-purple-950/20">
                <div className="w-9 h-9 rounded-lg bg-purple-600/20 border border-purple-500/30 flex items-center justify-center mb-3">
                  <p.icon className="w-4 h-4 text-purple-400" />
                </div>
                <h4 className="text-sm font-bold text-white mb-1">{p.title}</h4>
                <p className="text-xs text-muted leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Open Positions ── */}
        <section className="py-16 px-4 sm:px-6 max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-bold text-purple-400 uppercase tracking-widest mb-2">Opportunities</p>
            <h2 className="text-3xl font-black text-white">Current Open Roles</h2>
          </div>

          <div className="space-y-4">
            {POSITIONS.map(job => (
              <motion.div
                key={job.id}
                whileHover={{ scale: 1.01 }}
                className="card p-6 border border-purple-500/20 bg-gradient-to-br from-[#16122d] to-[#0d0920] flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all duration-200"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="badge badge-purple text-xs font-bold">{job.department}</span>
                    <span className="badge bg-purple-900/30 text-purple-300 border border-purple-700/30 text-xs">
                      {job.type}
                    </span>
                    <span className="badge bg-surface-800 text-muted border border-surface-700 text-xs">
                      Exp: {job.experience}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-white">{job.title}</h3>
                  <p className="text-sm text-secondary leading-relaxed line-clamp-2">
                    {job.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-muted pt-1">
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-purple-400" /> {job.location}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedJob(job)}
                  className="btn-primary whitespace-nowrap self-start md:self-center"
                >
                  View &amp; Apply <ArrowRight className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </div>
        </section>
      </main>

      {/* ── Application Modal ── */}
      <AnimatePresence>
        {selectedJob && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="card max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-purple-500/30 bg-[#14102c] p-6 sm:p-8 relative shadow-2xl"
            >
              <button
                onClick={() => setSelectedJob(null)}
                className="absolute top-5 right-5 w-8 h-8 rounded-full glass-light flex items-center justify-center text-secondary hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <span className="badge badge-purple text-xs font-bold mb-2">{selectedJob.department}</span>
              <h2 className="text-2xl font-black text-white mb-2">{selectedJob.title}</h2>
              <p className="text-xs text-muted mb-6 flex items-center gap-3">
                <span>{selectedJob.location}</span> · <span>{selectedJob.type}</span> · <span>{selectedJob.experience}</span>
              </p>

              {/* Responsibilities */}
              <div className="mb-6 space-y-2">
                <p className="text-xs font-bold text-purple-300 uppercase tracking-widest">Key Responsibilities</p>
                {selectedJob.responsibilities.map(r => (
                  <div key={r} className="flex items-start gap-2 text-sm text-secondary">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <span>{r}</span>
                  </div>
                ))}
              </div>

              {/* Application Form */}
              <form onSubmit={handleSubmit} className="border-t border-purple-900/30 pt-6 space-y-4">
                <h4 className="text-base font-bold text-white">Apply for this Role</h4>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-secondary block mb-1.5">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={e => setForm({ ...form, name: e.target.value })}
                      placeholder="e.g. Kishan Yadav"
                      className="input bg-surface-900 text-sm w-full"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-secondary block mb-1.5">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={e => setForm({ ...form, email: e.target.value })}
                      placeholder="you@domain.com"
                      className="input bg-surface-900 text-sm w-full"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-secondary block mb-1.5">LinkedIn Profile</label>
                    <input
                      type="url"
                      value={form.linkedin}
                      onChange={e => setForm({ ...form, linkedin: e.target.value })}
                      placeholder="https://linkedin.com/in/..."
                      className="input bg-surface-900 text-sm w-full"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-secondary block mb-1.5">Portfolio / GitHub</label>
                    <input
                      type="url"
                      value={form.portfolio}
                      onChange={e => setForm({ ...form, portfolio: e.target.value })}
                      placeholder="https://github.com/..."
                      className="input bg-surface-900 text-sm w-full"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-secondary block mb-1.5">Why are you excited about SnapMemory?</label>
                  <textarea
                    rows={3}
                    value={form.notes}
                    onChange={e => setForm({ ...form, notes: e.target.value })}
                    placeholder="Tell us briefly about relevant projects or your background..."
                    className="input bg-surface-900 text-sm w-full resize-none"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedJob(null)}
                    className="btn-ghost text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-primary text-sm flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Send className="w-4 h-4" /> Submit Application
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
