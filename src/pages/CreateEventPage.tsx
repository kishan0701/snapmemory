import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Camera, MapPin, Lock, Globe, Link2, Key,
  ChevronRight, ChevronLeft, Check, Users,
  Sparkles, Download, AlertCircle
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { SmartDatePicker } from '@/components/ui/SmartDatePicker';
import { CoverImageSelector, CATEGORIZED_PRESETS } from '@/components/events/CoverImageSelector';
import { useEventStore } from '@/lib/eventStore';
import { useAuth } from '@/features/auth/AuthContext';
import type { EventType, EventPrivacy } from '@/types';
import toast from 'react-hot-toast';

interface EventForm {
  title: string;
  type: EventType;
  date: string;
  location: string;
  description: string;
  cover_url: string;
  privacy: EventPrivacy;
  access_code: string;
  allow_contributor_requests: boolean;
  allow_downloads: boolean;
  enable_find_my_photos: boolean;
  expiry_at: string;
}

const EVENT_TYPES: EventType[] = [
  'Wedding', 'College Event', 'Birthday', 'Corporate',
  'School Event', 'Family Function', 'Other'
];
const EVENT_TYPE_EMOJIS: Record<string, string> = {
  'Wedding': '💍', 'College Event': '🎓', 'Birthday': '🎂',
  'Corporate': '💼', 'School Event': '📚', 'Family Function': '👨‍👩‍👧‍👦', 'Other': '📸'
};

const PRIVACY_OPTIONS = [
  { value: 'public' as EventPrivacy, label: 'Public', desc: 'Anyone can find and view this event', icon: Globe },
  { value: 'unlisted' as EventPrivacy, label: 'Unlisted link', desc: 'Only people with the link can view', icon: Link2 },
  { value: 'private' as EventPrivacy, label: 'Private / Invite-only', desc: 'Only invited guests can view', icon: Lock },
  { value: 'password' as EventPrivacy, label: 'Password protected', desc: 'Guests need a password to access', icon: Key },
];

const STEPS = [
  { id: 1, label: 'Basics', icon: Camera },
  { id: 2, label: 'Privacy', icon: Lock },
  { id: 3, label: 'Settings', icon: Sparkles },
];

const DEFAULT_FORM: EventForm = {
  title: '',
  type: 'Wedding',
  date: '',
  location: '',
  description: '',
  cover_url: CATEGORIZED_PRESETS[0].url,
  privacy: 'unlisted',
  access_code: '',
  allow_contributor_requests: true,
  allow_downloads: true,
  enable_find_my_photos: true,
  expiry_at: '',
};

export function CreateEventPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<EventForm>(DEFAULT_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const setField = <K extends keyof EventForm>(key: K, value: EventForm[K]) => {
    setForm(f => ({ ...f, [key]: value }));
    setError('');
  };

  const validateStep1 = () => {
    if (!form.title.trim()) return 'Event name is required.';
    if (!form.date) return 'Event date is required.';
    if (!form.location.trim()) return 'Location is required.';
    return null;
  };

  const validateStep2 = () => {
    if (form.privacy === 'password' && !form.access_code.trim()) {
      return 'Please set an access code for password-protected events.';
    }
    return null;
  };

  const nextStep = () => {
    if (step === 1) {
      const err = validateStep1();
      if (err) { setError(err); return; }
    }
    if (step === 2) {
      const err = validateStep2();
      if (err) { setError(err); return; }
    }
    setStep(s => Math.min(s + 1, 3));
    setError('');
  };

  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  const createEvent = useEventStore(s => s.createEvent);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    await new Promise(r => setTimeout(r, 600));
    // Create event in store with logged-in user ID
    const newId = createEvent({
      title: form.title,
      type: form.type,
      date: form.date,
      location: form.location,
      description: form.description,
      cover_url: form.cover_url,
      privacy: form.privacy,
      access_code: form.access_code,
      allow_contributor_requests: form.allow_contributor_requests,
      allow_downloads: form.allow_downloads,
      enable_find_my_photos: form.enable_find_my_photos,
      expiry_at: form.expiry_at,
      owner_id: user?.id || 'user-1',
    });
    toast.success('Event created! Start uploading your photos 🎉');
    setIsSubmitting(false);
    navigate(`/event/${newId}`);
  };

  const toggle = (key: 'allow_contributor_requests' | 'allow_downloads' | 'enable_find_my_photos') => {
    setField(key, !form[key]);
  };

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 pt-24 pb-16">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl sm:text-3xl font-black text-white mb-2">Create New Event</h1>
          <p className="text-secondary text-sm">Set up your event gallery in under 2 minutes</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-0 mb-10">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center">
              <button
                onClick={() => step > s.id && setStep(s.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  step === s.id
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/25'
                    : step > s.id
                    ? 'text-green-400 cursor-pointer hover:bg-green-500/10'
                    : 'text-muted cursor-default'
                }`}
              >
                {step > s.id ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <s.icon className="w-4 h-4" />
                )}
                <span className="hidden sm:block">{s.label}</span>
              </button>
              {i < STEPS.length - 1 && (
                <div className={`w-8 h-px mx-1 ${step > s.id ? 'bg-green-500/50' : 'bg-purple-900/30'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 mb-5"
          >
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-red-300">{error}</p>
          </motion.div>
        )}

        {/* Card */}
        <div className="card p-6 sm:p-8">
          <AnimatePresence mode="wait">
            {/* ── Step 1: Basics ── */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-5"
              >
                <h2 className="text-base font-semibold text-white mb-5">Event Details</h2>

                {/* Title */}
                <div>
                  <label htmlFor="event-title" className="block text-xs font-medium text-secondary mb-1.5">
                    Event Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    id="event-title"
                    type="text"
                    value={form.title}
                    onChange={e => setField('title', e.target.value)}
                    className="input-field"
                    placeholder="e.g. Karan & Riya Wedding"
                    maxLength={120}
                  />
                </div>

                {/* Type */}
                <div>
                  <label className="block text-xs font-medium text-secondary mb-2">
                    Event Type <span className="text-red-400">*</span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {EVENT_TYPES.map(type => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setField('type', type)}
                        className={`px-2 py-2.5 rounded-lg text-xs font-medium text-center transition-all border ${
                          form.type === type
                            ? 'bg-purple-600/30 border-purple-500/60 text-white'
                            : 'glass-light border-transparent text-secondary hover:border-purple-500/30 hover:text-white'
                        }`}
                      >
                        <span className="text-base block mb-1">{EVENT_TYPE_EMOJIS[type]}</span>
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Date & Location */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="event-date" className="block text-xs font-medium text-secondary mb-1.5">
                      Event Date <span className="text-red-400">*</span>
                    </label>
                    <SmartDatePicker
                      id="event-date"
                      value={form.date}
                      onChange={v => setField('date', v)}
                      placeholder="Pick event date"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="event-location" className="block text-xs font-medium text-secondary mb-1.5">
                      Location <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                      <input
                        id="event-location"
                        type="text"
                        value={form.location}
                        onChange={e => setField('location', e.target.value)}
                        className="input-field pl-9"
                        placeholder="Jaipur, Rajasthan"
                      />
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label htmlFor="event-desc" className="block text-xs font-medium text-secondary mb-1.5">
                    Description
                  </label>
                  <textarea
                    id="event-desc"
                    value={form.description}
                    onChange={e => setField('description', e.target.value)}
                    className="input-field resize-none"
                    rows={3}
                    placeholder="Tell guests what this event is about..."
                    maxLength={500}
                  />
                  <p className="text-[11px] text-muted mt-1 text-right">{form.description.length}/500</p>
                </div>

                {/* Cover Image Selector */}
                <div>
                  <label className="block text-xs font-medium text-secondary mb-2">
                    Event Cover Photo
                  </label>
                  <CoverImageSelector
                    value={form.cover_url}
                    onChange={v => setField('cover_url', v)}
                    eventTitle={form.title}
                    eventType={form.type}
                    eventDate={form.date}
                    eventLocation={form.location}
                  />
                </div>
              </motion.div>
            )}

            {/* ── Step 2: Privacy ── */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-5"
              >
                <h2 className="text-base font-semibold text-white mb-5">Privacy Settings</h2>

                <div className="space-y-3">
                  {PRIVACY_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setField('privacy', opt.value)}
                      className={`w-full text-left p-4 rounded-xl border transition-all ${
                        form.privacy === opt.value
                          ? 'bg-purple-600/20 border-purple-500/60'
                          : 'glass-light border-transparent hover:border-purple-500/30'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          form.privacy === opt.value ? 'bg-purple-500/30' : 'bg-white/6'
                        }`}>
                          <opt.icon className="w-4 h-4 text-purple-300" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{opt.label}</p>
                          <p className="text-xs text-muted">{opt.desc}</p>
                        </div>
                        {form.privacy === opt.value && (
                          <Check className="w-4 h-4 text-purple-400 ml-auto" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>

                {/* Access code */}
                {form.privacy === 'password' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                  >
                    <label htmlFor="event-access-code" className="block text-xs font-medium text-secondary mb-1.5">
                      Access Code <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                      <input
                        id="event-access-code"
                        type="text"
                        value={form.access_code}
                        onChange={e => setField('access_code', e.target.value)}
                        className="input-field pl-9"
                        placeholder="e.g. WEDDING2026"
                        maxLength={20}
                      />
                    </div>
                  </motion.div>
                )}

                {/* Expiry */}
                <div>
                  <label htmlFor="event-expiry" className="block text-xs font-medium text-secondary mb-1.5">
                    Event Expiry Date <span className="text-muted">(optional)</span>
                  </label>
                  <SmartDatePicker
                    id="event-expiry"
                    value={form.expiry_at}
                    onChange={v => setField('expiry_at', v)}
                    placeholder="No expiry set"
                    minDate={form.date || undefined}
                  />
                  <p className="text-[11px] text-muted mt-1">Gallery will be automatically archived after this date</p>
                </div>
              </motion.div>
            )}

            {/* ── Step 3: Settings ── */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-5"
              >
                <h2 className="text-base font-semibold text-white mb-5">Collaboration Settings</h2>

                {/* Preview card */}
                <div className="glass-light rounded-xl overflow-hidden mb-6">
                  <div className="h-28 relative">
                    <img src={form.cover_url} alt="" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-3 left-3">
                      <p className="text-sm font-bold text-white">{form.title || 'Your Event'}</p>
                      <p className="text-xs text-white/60">{form.type} · {form.location || 'Location'}</p>
                    </div>
                  </div>
                </div>

                {[
                  {
                    key: 'allow_contributor_requests' as const,
                    icon: Users,
                    label: 'Allow contributor requests',
                    desc: 'Guests can request permission to upload photos and videos',
                    color: 'text-blue-400',
                  },
                  {
                    key: 'allow_downloads' as const,
                    icon: Download,
                    label: 'Allow downloads',
                    desc: 'Guests can download photos and videos from this event',
                    color: 'text-green-400',
                  },
                  {
                    key: 'enable_find_my_photos' as const,
                    icon: Sparkles,
                    label: 'Enable Find My Photos',
                    desc: 'Guests can use AI face matching to find photos of themselves',
                    color: 'text-amber-400',
                  },
                ].map(setting => (
                  <div
                    key={setting.key}
                    className="flex items-center justify-between p-4 glass-light rounded-xl"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white/6 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <setting.icon className={`w-4 h-4 ${setting.color}`} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{setting.label}</p>
                        <p className="text-xs text-muted">{setting.desc}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggle(setting.key)}
                      id={`toggle-${setting.key}`}
                      className={`w-11 h-6 rounded-full transition-all flex-shrink-0 ${
                        form[setting.key] ? 'bg-purple-600' : 'bg-surface-500'
                      }`}
                      role="switch"
                      aria-checked={form[setting.key]}
                    >
                      <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform mx-1 ${
                        form[setting.key] ? 'translate-x-5' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>
                ))}

                <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                  <p className="text-xs text-green-300 font-medium mb-1">✅ Ready to create!</p>
                  <p className="text-xs text-secondary">
                    Your event will be created with a shareable link and QR code. You can change these settings anytime.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-purple-900/20">
            <button
              type="button"
              onClick={prevStep}
              disabled={step === 1}
              className="btn-ghost disabled:opacity-30"
            >
              <ChevronLeft className="w-4 h-4" /> Back
            </button>

            {step < 3 ? (
              <button
                id="create-event-next-btn"
                type="button"
                onClick={nextStep}
                className="btn-primary"
              >
                Continue <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                id="create-event-submit-btn"
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="btn-primary disabled:opacity-60"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    Creating...
                  </span>
                ) : (
                  <>
                    <Camera className="w-4 h-4" /> Create Event
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Step dots */}
        <div className="flex justify-center gap-2 mt-6">
          {STEPS.map(s => (
            <div
              key={s.id}
              className={`h-1.5 rounded-full transition-all ${
                step >= s.id ? 'w-6 bg-purple-500' : 'w-1.5 bg-surface-500'
              }`}
            />
          ))}
        </div>
      </main>
    </div>
  );
}
