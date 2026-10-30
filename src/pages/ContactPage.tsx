import { useState } from 'react';
import { motion } from 'framer-motion';
import { Navbar, Footer } from '@/components/layout';
import {
  Mail,
  MessageCircle,
  MapPin,
  Clock,
  Send,
  HelpCircle,
  ChevronDown,
  Sparkles,
  PhoneCall
} from 'lucide-react';
import toast from 'react-hot-toast';

const FAQS = [
  {
    q: 'How does AI face recognition work in SnapMemory?',
    a: 'We use client-side neural networks (face-api.js with WebGL acceleration). When a guest uploads a selfie, a 128-dimensional vector is calculated on their device. Photos from the event gallery are matched in real time. No raw face biometric data is stored or sold.',
  },
  {
    q: 'Do guests need to install an app to view photos?',
    a: 'Not at all! Guests simply scan the event QR code with their default camera app. It opens directly in any modern mobile browser without requiring any download or account creation.',
  },
  {
    q: 'Can I restrict who can upload photos to my event?',
    a: 'Yes. You can configure your event to "Anyone can upload with QR code", or enable "Contributor Approval Mode" where you approve or reject submitted photos before they appear in the public gallery.',
  },
  {
    q: 'What is the maximum photo resolution and file size supported?',
    a: 'SnapMemory supports original full-resolution photos up to 50MB per file and 4K videos up to 500MB, retaining full EXIF metadata and original quality.',
  },
  {
    q: 'Can professional photographers use SnapMemory for client delivery?',
    a: 'Absolutely! Many wedding and corporate event photographers use SnapMemory to deliver proofs and real-time galleries to couples with watermarking and PIN protection.',
  },
];

export function ContactPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    category: 'General Support',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      toast.success('Message sent! Our support team will reply within 2 business hours.');
      setForm({
        name: '',
        email: '',
        category: 'General Support',
        subject: '',
        message: '',
      });
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#0c0a1a] flex flex-col text-white selection:bg-purple-500 selection:text-white">
      <Navbar />

      <main className="flex-1">
        {/* ── Hero Section ── */}
        <section className="relative pt-32 pb-16 px-4 sm:px-6 max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/25 text-xs font-semibold text-purple-300 mb-6">
            <Mail className="w-3.5 h-3.5" />
            <span>24/7 Support &amp; Inquiries</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight mb-4">
            We'd Love to{' '}
            <span className="bg-gradient-to-r from-purple-400 via-fuchsia-300 to-indigo-400 bg-clip-text text-transparent">
              Hear From You
            </span>
          </h1>

          <p className="text-secondary text-sm sm:text-base max-w-lg mx-auto">
            Have questions about an upcoming wedding, corporate event, or need custom technical integration? Get in touch with our team.
          </p>
        </section>

        {/* ── Contact Grid ── */}
        <section className="py-8 px-4 sm:px-6 max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-5 gap-8 items-start">
            {/* Left: Contact Details Cards (2 cols) */}
            <div className="lg:col-span-2 space-y-4">
              <div className="card p-6 border border-purple-500/20 bg-purple-950/20 space-y-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-400" /> Direct Channels
                </h3>

                <div className="space-y-4 text-sm text-secondary">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-600/20 flex items-center justify-center flex-shrink-0 text-purple-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs text-muted font-medium">Email Us</p>
                      <a href="mailto:support@snapmemory.app" className="text-white hover:text-purple-300 transition-colors">
                        support@snapmemory.app
                      </a>
                      <p className="text-[11px] text-muted">yadavkishan0701@gmail.com</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-600/20 flex items-center justify-center flex-shrink-0 text-emerald-400">
                      <MessageCircle className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs text-muted font-medium">WhatsApp Community</p>
                      <a
                        href="https://wa.me/?text=Hi%20SnapMemory%20Team!"
                        target="_blank"
                        rel="noreferrer"
                        className="text-white hover:text-emerald-300 transition-colors"
                      >
                        +91 98765 43210
                      </a>
                      <p className="text-[11px] text-muted">Instant event coordinators chat</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-600/20 flex items-center justify-center flex-shrink-0 text-blue-400">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs text-muted font-medium">Response Time</p>
                      <p className="text-white font-medium">&lt; 2 Hours</p>
                      <p className="text-[11px] text-muted">Monday – Saturday (9 AM – 9 PM IST)</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-600/20 flex items-center justify-center flex-shrink-0 text-purple-400">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs text-muted font-medium">Offices</p>
                      <p className="text-white">Jaipur, Rajasthan</p>
                      <p className="text-[11px] text-muted">Bengaluru, Karnataka (India)</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick tip card */}
              <div className="card p-5 border border-purple-500/20 bg-gradient-to-br from-purple-900/20 to-indigo-900/10">
                <h4 className="text-xs font-bold text-purple-300 uppercase tracking-widest mb-1">
                  Urgent Event Live Support?
                </h4>
                <p className="text-xs text-secondary leading-relaxed">
                  If your event is currently active and you need immediate assistance with guest QR display or photo limits, message our WhatsApp hotline directly.
                </p>
              </div>
            </div>

            {/* Right: Contact Form (3 cols) */}
            <div className="lg:col-span-3">
              <div className="card p-6 sm:p-8 border border-purple-500/25 bg-gradient-to-br from-[#16112d] to-[#0e0a22]">
                <h3 className="text-xl font-bold text-white mb-2">Send Us a Message</h3>
                <p className="text-xs text-muted mb-6">
                  Fill in the details below and we’ll get back to you with actionable answers.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium text-secondary block mb-1.5">Your Name *</label>
                      <input
                        type="text"
                        required
                        value={form.name}
                        onChange={e => setForm({ ...form, name: e.target.value })}
                        placeholder="Kishan Yadav"
                        className="input bg-surface-900 text-sm w-full"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-secondary block mb-1.5">Your Email *</label>
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
                      <label className="text-xs font-medium text-secondary block mb-1.5">Topic</label>
                      <select
                        value={form.category}
                        onChange={e => setForm({ ...form, category: e.target.value })}
                        className="input bg-surface-900 text-sm w-full"
                      >
                        <option>General Support</option>
                        <option>Wedding / Event Setup</option>
                        <option>Enterprise &amp; Photographers</option>
                        <option>AI Face Search Inquiry</option>
                        <option>Billing &amp; Custom Plans</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-secondary block mb-1.5">Subject</label>
                      <input
                        type="text"
                        value={form.subject}
                        onChange={e => setForm({ ...form, subject: e.target.value })}
                        placeholder="e.g. Wedding gallery query"
                        className="input bg-surface-900 text-sm w-full"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-secondary block mb-1.5">Your Message *</label>
                    <textarea
                      required
                      rows={5}
                      value={form.message}
                      onChange={e => setForm({ ...form, message: e.target.value })}
                      placeholder="Write your questions, expected event date, guest count, or feature requirements..."
                      className="input bg-surface-900 text-sm w-full resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-primary w-full py-3 text-sm flex items-center justify-center gap-2 mt-2"
                  >
                    {isSubmitting ? (
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Send className="w-4 h-4" /> Send Message
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </section>

        {/* ── FAQ Section ── */}
        <section className="py-16 px-4 sm:px-6 max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-xs font-bold text-purple-400 uppercase tracking-widest mb-2">Instant Answers</p>
            <h2 className="text-2xl sm:text-3xl font-black text-white">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={faq.q}
                  className="card overflow-hidden border border-purple-500/20 bg-purple-950/15"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-white text-sm hover:text-purple-300 transition-colors"
                  >
                    <span className="flex items-center gap-2.5">
                      <HelpCircle className="w-4 h-4 text-purple-400 flex-shrink-0" />
                      {faq.q}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-muted transition-transform duration-200 flex-shrink-0 ${
                        isOpen ? 'rotate-180 text-purple-400' : ''
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="px-5 pb-5 pt-1 text-sm text-secondary leading-relaxed border-t border-purple-900/20"
                    >
                      {faq.a}
                    </motion.div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
