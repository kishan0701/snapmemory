import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Navbar, Footer } from '@/components/layout';
import {
  ScanFace,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Camera,
  Search,
  CheckCircle2,
  Calendar,
  MapPin,
  Images
} from 'lucide-react';
import toast from 'react-hot-toast';

export function FindMyPhotosHubPage() {
  const [eventQuery, setEventQuery] = useState('');
  const navigate = useNavigate();

  const handleSearchEvent = (e: React.FormEvent) => {
    e.preventDefault();
    const query = eventQuery.trim().toLowerCase();
    if (!query) {
      toast.error('Please enter an Event Code or Event Name');
      return;
    }

    if (query.includes('wedding') || query.includes('karan') || query.includes('evt-1')) {
      navigate('/event/evt-1/find-my-photos');
    } else if (query.includes('fest') || query.includes('tsdc') || query.includes('college') || query.includes('evt-2')) {
      navigate('/event/evt-2/find-my-photos');
    } else {
      // Default to demo event 1
      toast('Redirecting to sample demo event for facial scan...', { icon: '📸' });
      navigate('/event/evt-1/find-my-photos');
    }
  };

  return (
    <div className="min-h-screen bg-[#0c0a1a] flex flex-col text-white selection:bg-purple-500 selection:text-white">
      <Navbar />

      <main className="flex-1">
        {/* ── Hero Section ── */}
        <section className="relative pt-32 pb-16 px-4 sm:px-6 max-w-5xl mx-auto text-center overflow-hidden">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/25 text-xs font-semibold text-purple-300 mb-6">
              <ScanFace className="w-3.5 h-3.5" />
              <span>On-Device Neural Vision Engine</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight mb-5">
              Find Yourself in{' '}
              <span className="bg-gradient-to-r from-purple-400 via-fuchsia-300 to-indigo-400 bg-clip-text text-transparent">
                Every Event Photo
              </span>
            </h1>

            <p className="text-secondary text-base sm:text-lg max-w-xl mx-auto leading-relaxed mb-10">
              No more scrolling through hundreds of photos. Upload a single selfie and let our client-side AI match every photo you appear in within 2 seconds.
            </p>

            {/* Jump to event input */}
            <form onSubmit={handleSearchEvent} className="max-w-md mx-auto relative mb-12">
              <Search className="w-4 h-4 text-muted absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={eventQuery}
                onChange={e => setEventQuery(e.target.value)}
                placeholder="Enter event name or code (e.g. karan-riya, fest2026)..."
                className="input pl-11 pr-28 py-3.5 w-full bg-purple-950/25 border-purple-500/30 text-sm focus:border-purple-400 shadow-xl"
              />
              <button
                type="submit"
                className="btn-primary absolute right-2 top-1/2 -translate-y-1/2 text-xs py-2 px-3.5"
              >
                Find Event <ArrowRight className="w-3 h-3" />
              </button>
            </form>
          </motion.div>
        </section>

        {/* ── Active Demo Events ── */}
        <section className="py-10 px-4 sm:px-6 max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <p className="text-xs font-bold text-purple-400 uppercase tracking-widest mb-1">Instant Demo</p>
            <h2 className="text-2xl font-bold text-white">Select an Event to Test Face Search</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Event 1: Wedding */}
            <div className="card overflow-hidden border border-purple-500/25 bg-gradient-to-br from-[#16122e] to-[#0f0b20] group hover:border-purple-500/50 transition-all duration-300">
              <div className="h-44 relative overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1469371670807-013ccf25f16a?w=800&q=80"
                  alt="Karan & Riya Wedding"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#16122e] via-transparent to-transparent" />
                <span className="absolute top-3 left-3 badge badge-purple text-xs font-bold">Wedding</span>
                <span className="absolute bottom-3 right-3 glass-light px-2.5 py-1 rounded-lg text-xs font-mono text-purple-300 flex items-center gap-1.5">
                  <Images className="w-3.5 h-3.5" /> 155 Photos
                </span>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-white">Karan &amp; Riya Wedding</h3>
                  <div className="flex items-center gap-3 text-xs text-muted mt-1">
                    <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> 21 Feb 2026</span>
                    <span>•</span>
                    <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> Jaipur, Rajasthan</span>
                  </div>
                </div>

                <p className="text-sm text-secondary leading-relaxed">
                  Grand ceremony &amp; royal reception with 5 organized albums: Ceremony, Reception, Couple Shoot, Family &amp; Friends.
                </p>

                <div className="pt-2 flex items-center justify-between">
                  <Link
                    to="/event/evt-1"
                    className="text-xs text-secondary hover:text-white transition-colors"
                  >
                    View Full Gallery
                  </Link>

                  <Link
                    to="/event/evt-1/find-my-photos"
                    className="btn-primary text-xs flex items-center gap-1.5"
                  >
                    <ScanFace className="w-3.5 h-3.5" /> Launch Face Scan
                  </Link>
                </div>
              </div>
            </div>

            {/* Event 2: College Fest */}
            <div className="card overflow-hidden border border-purple-500/25 bg-gradient-to-br from-[#16122e] to-[#0f0b20] group hover:border-purple-500/50 transition-all duration-300">
              <div className="h-44 relative overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&q=80"
                  alt="TSDC Annual Fest"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#16122e] via-transparent to-transparent" />
                <span className="absolute top-3 left-3 badge badge-purple text-xs font-bold">College Event</span>
                <span className="absolute bottom-3 right-3 glass-light px-2.5 py-1 rounded-lg text-xs font-mono text-purple-300 flex items-center gap-1.5">
                  <Images className="w-3.5 h-3.5" /> 245 Photos
                </span>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-white">TSDC Annual Fest 2026</h3>
                  <div className="flex items-center gap-3 text-xs text-muted mt-1">
                    <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> 15 Mar 2026</span>
                    <span>•</span>
                    <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> Mumbai, Maharashtra</span>
                  </div>
                </div>

                <p className="text-sm text-secondary leading-relaxed">
                  Cultural showcase, dance performances, sports events, and crowd memories across 7 dynamic albums.
                </p>

                <div className="pt-2 flex items-center justify-between">
                  <Link
                    to="/event/evt-2"
                    className="text-xs text-secondary hover:text-white transition-colors"
                  >
                    View Full Gallery
                  </Link>

                  <Link
                    to="/event/evt-2/find-my-photos"
                    className="btn-primary text-xs flex items-center gap-1.5"
                  >
                    <ScanFace className="w-3.5 h-3.5" /> Launch Face Scan
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── 3-Step Process ── */}
        <section className="py-16 px-4 sm:px-6 max-w-5xl mx-auto border-t border-purple-900/20">
          <div className="text-center mb-12">
            <p className="text-xs font-bold text-purple-400 uppercase tracking-widest mb-2">How It Works</p>
            <h2 className="text-3xl font-black text-white">Three Simple Steps</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div className="card p-6 border border-purple-500/20 bg-purple-950/20 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center mx-auto text-purple-400 font-black text-lg">
                1
              </div>
              <h3 className="text-base font-bold text-white">Take or Upload Selfie</h3>
              <p className="text-xs text-secondary leading-relaxed">
                Use your front camera or select a photo from your gallery with good front-facing lighting.
              </p>
            </div>

            <div className="card p-6 border border-purple-500/20 bg-purple-950/20 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center mx-auto text-purple-400 font-black text-lg">
                2
              </div>
              <h3 className="text-base font-bold text-white">Neural Match in &lt; 2s</h3>
              <p className="text-xs text-secondary leading-relaxed">
                The browser computes 128 mathematical landmarks and scans the event album directly on your device.
              </p>
            </div>

            <div className="card p-6 border border-purple-500/20 bg-purple-950/20 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center mx-auto text-purple-400 font-black text-lg">
                3
              </div>
              <h3 className="text-base font-bold text-white">Download in Full HD</h3>
              <p className="text-xs text-secondary leading-relaxed">
                Browse every matching photo ranked by confidence and download them all with one tap.
              </p>
            </div>
          </div>
        </section>

        {/* ── Privacy Note ── */}
        <section className="py-10 px-4 sm:px-6 max-w-4xl mx-auto mb-12">
          <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-950/30 via-purple-950/20 to-blue-950/30 border border-emerald-500/30 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center flex-shrink-0 text-emerald-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">100% Private &amp; Secure</h4>
              <p className="text-xs text-secondary mt-0.5 leading-relaxed">
                Your selfie never leaves your device. Biometric mathematical coordinates are calculated in temporary memory and purged immediately after the search completes.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
