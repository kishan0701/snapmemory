import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Save, Trash2, Globe, Lock, Link2, Key,
  Users, Download, Sparkles, MapPin, Camera,
  AlertTriangle, Copy, RefreshCw, Eye, EyeOff, QrCode,
  CheckCircle2, Shield
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { SmartDatePicker } from '@/components/ui/SmartDatePicker';
import { getEventById } from '@/lib/mock-data';
import {
  buildEventUrl, copyToClipboard,
  getPrivacyLabel
} from '@/lib/utils';
import type { EventPrivacy } from '@/types';
import toast from 'react-hot-toast';

type SettingsTab = 'general' | 'privacy' | 'sharing' | 'danger';

const PRIVACY_OPTIONS: { value: EventPrivacy; label: string; desc: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { value: 'public', label: 'Public', desc: 'Anyone can find and view this event gallery', icon: Globe },
  { value: 'unlisted', label: 'Unlisted', desc: 'Only people with the link can access', icon: Link2 },
  { value: 'private', label: 'Private', desc: 'Only invited guests and contributors can view', icon: Lock },
  { value: 'password', label: 'Password Protected', desc: 'Guests need a password to access', icon: Key },
];

export function EventSettingsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const event = getEventById(id ?? '');

  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Form state (initialised from mock event)
  const [title, setTitle] = useState(event?.title ?? '');
  const [location, setLocation] = useState(event?.location ?? '');
  const [description, setDescription] = useState(event?.description ?? '');
  const [privacy, setPrivacy] = useState<EventPrivacy>(event?.privacy ?? 'unlisted');
  const [accessCode, setAccessCode] = useState('WEDDING2026');
  const [expiryAt, setExpiryAt] = useState(event?.expiry_at?.slice(0, 10) ?? '');
  const [allowContributorRequests, setAllowContributorRequests] = useState(event?.allow_contributor_requests ?? true);
  const [allowDownloads, setAllowDownloads] = useState(event?.allow_downloads ?? true);
  const [enableFindMyPhotos, setEnableFindMyPhotos] = useState(event?.enable_find_my_photos ?? true);

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Navbar />
        <div className="text-center">
          <p className="text-5xl mb-4">🔍</p>
          <h1 className="text-xl font-bold text-white mb-2">Event not found</h1>
          <Link to="/dashboard" className="btn-primary">Go to Dashboard</Link>
        </div>
      </div>
    );
  }

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise(r => setTimeout(r, 800));
    toast.success('Settings saved successfully');
    setIsSaving(false);
  };

  const handleCopyLink = async () => {
    await copyToClipboard(buildEventUrl(event.id));
    toast.success('Event link copied!');
  };

  const handleDelete = async () => {
    if (deleteConfirmText !== event.title) {
      toast.error('Event title does not match');
      return;
    }
    await new Promise(r => setTimeout(r, 800));
    toast.success('Event deleted');
    navigate('/dashboard');
  };

  const TABS: { id: SettingsTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'general', label: 'General', icon: Camera },
    { id: 'privacy', label: 'Privacy & Access', icon: Shield },
    { id: 'sharing', label: 'Sharing', icon: QrCode },
    { id: 'danger', label: 'Danger Zone', icon: AlertTriangle },
  ];

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-24 pb-16">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            to={`/event/${id}`}
            className="w-9 h-9 glass-light rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-secondary" />
          </Link>
          <div>
            <h1 className="text-xl font-black text-white">Event Settings</h1>
            <p className="text-sm text-muted">{event.title}</p>
          </div>
          <div className="ml-auto">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="btn-primary disabled:opacity-60"
            >
              {isSaving ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Saving...
                </span>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-[220px_1fr] gap-6">
          {/* Sidebar tabs */}
          <div className="space-y-1">
            {TABS.map(tab => (
              <button
                key={tab.id}
                id={`settings-tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full text-left flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? tab.id === 'danger'
                      ? 'bg-red-500/15 text-red-400 border border-red-500/20'
                      : 'bg-purple-600/20 text-white border border-purple-500/25'
                    : tab.id === 'danger'
                    ? 'text-red-400/60 hover:bg-red-500/10 hover:text-red-400'
                    : 'text-secondary hover:bg-white/5 hover:text-white'
                }`}
              >
                <tab.icon className="w-4 h-4 flex-shrink-0" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content panel */}
          <div>
            {/* ── General ── */}
            {activeTab === 'general' && (
              <motion.div
                key="general"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="card p-6 space-y-5"
              >
                <h2 className="text-base font-semibold text-white">General Information</h2>

                {/* Cover preview */}
                <div className="relative h-36 rounded-xl overflow-hidden group cursor-pointer">
                  <img src={event.cover_url} alt="" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="btn-primary text-sm py-1.5">
                      <Camera className="w-3.5 h-3.5" /> Change Cover
                    </span>
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label htmlFor="settings-title" className="block text-xs font-medium text-secondary mb-1.5">
                    Event Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    id="settings-title"
                    type="text"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    className="input-field"
                    maxLength={120}
                  />
                </div>

                {/* Location */}
                <div>
                  <label htmlFor="settings-location" className="block text-xs font-medium text-secondary mb-1.5">
                    Location
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                    <input
                      id="settings-location"
                      type="text"
                      value={location}
                      onChange={e => setLocation(e.target.value)}
                      className="input-field pl-9"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label htmlFor="settings-description" className="block text-xs font-medium text-secondary mb-1.5">
                    Description
                  </label>
                  <textarea
                    id="settings-description"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    className="input-field resize-none"
                    rows={4}
                    maxLength={500}
                  />
                  <p className="text-[11px] text-muted mt-1 text-right">{description.length}/500</p>
                </div>

                {/* Expiry */}
                <div>
                  <label htmlFor="settings-expiry" className="block text-xs font-medium text-secondary mb-1.5">
                    Event Expiry <span className="text-muted">(optional)</span>
                  </label>
                  <SmartDatePicker
                    id="settings-expiry"
                    value={expiryAt}
                    onChange={setExpiryAt}
                    placeholder="No expiry set"
                  />
                  <p className="text-[11px] text-muted mt-1">Gallery will be archived after this date</p>
                </div>

                {/* Collaboration toggles */}
                <div className="pt-2 border-t border-purple-900/20 space-y-3">
                  <p className="text-xs font-medium text-secondary uppercase tracking-wider">Collaboration</p>
                  {[
                    {
                      key: 'contributor_requests' as const,
                      icon: Users,
                      label: 'Allow contributor requests',
                      desc: 'Guests can request upload access',
                      value: allowContributorRequests,
                      toggle: () => setAllowContributorRequests(v => !v),
                      color: 'text-blue-400',
                    },
                    {
                      key: 'downloads' as const,
                      icon: Download,
                      label: 'Allow downloads',
                      desc: 'Guests can download photos and videos',
                      value: allowDownloads,
                      toggle: () => setAllowDownloads(v => !v),
                      color: 'text-green-400',
                    },
                    {
                      key: 'find_my_photos' as const,
                      icon: Sparkles,
                      label: 'Enable Find My Photos',
                      desc: 'AI face matching for guests',
                      value: enableFindMyPhotos,
                      toggle: () => setEnableFindMyPhotos(v => !v),
                      color: 'text-amber-400',
                    },
                  ].map(setting => (
                    <div key={setting.key} className="flex items-center justify-between p-3 glass-light rounded-xl">
                      <div className="flex items-center gap-2.5">
                        <setting.icon className={`w-4 h-4 ${setting.color}`} />
                        <div>
                          <p className="text-sm font-medium text-white">{setting.label}</p>
                          <p className="text-xs text-muted">{setting.desc}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={setting.toggle}
                        id={`toggle-${setting.key}`}
                        className={`w-11 h-6 rounded-full transition-all flex-shrink-0 ${
                          setting.value ? 'bg-purple-600' : 'bg-surface-500'
                        }`}
                        role="switch"
                        aria-checked={setting.value}
                      >
                        <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform mx-1 ${
                          setting.value ? 'translate-x-5' : 'translate-x-0'
                        }`} />
                      </button>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ── Privacy ── */}
            {activeTab === 'privacy' && (
              <motion.div
                key="privacy"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="card p-6 space-y-5"
              >
                <h2 className="text-base font-semibold text-white">Privacy & Access Control</h2>

                <div className="space-y-3">
                  {PRIVACY_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      id={`privacy-option-${opt.value}`}
                      type="button"
                      onClick={() => setPrivacy(opt.value)}
                      className={`w-full text-left p-4 rounded-xl border transition-all ${
                        privacy === opt.value
                          ? 'bg-purple-600/20 border-purple-500/60'
                          : 'glass-light border-transparent hover:border-purple-500/30'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          privacy === opt.value ? 'bg-purple-500/30' : 'bg-white/6'
                        }`}>
                          <opt.icon className="w-4 h-4 text-purple-300" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-white">{opt.label}</p>
                          <p className="text-xs text-muted">{opt.desc}</p>
                        </div>
                        {privacy === opt.value && (
                          <CheckCircle2 className="w-4 h-4 text-purple-400" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>

                {/* Password input */}
                {privacy === 'password' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                  >
                    <label htmlFor="settings-access-code" className="block text-xs font-medium text-secondary mb-1.5">
                      Access Code
                    </label>
                    <div className="relative">
                      <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                      <input
                        id="settings-access-code"
                        type={showPassword ? 'text' : 'password'}
                        value={accessCode}
                        onChange={e => setAccessCode(e.target.value)}
                        className="input-field pl-9 pr-20"
                        maxLength={20}
                      />
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setShowPassword(v => !v)}
                          className="w-7 h-7 flex items-center justify-center text-muted hover:text-white transition-colors"
                        >
                          {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
                            const code = Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
                            setAccessCode(code);
                          }}
                          className="w-7 h-7 flex items-center justify-center text-muted hover:text-white transition-colors"
                          title="Generate new code"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}

                <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                  <p className="text-xs text-blue-300 leading-relaxed">
                    <span className="font-semibold">Current setting:</span> {getPrivacyLabel(privacy)}.
                    {privacy === 'public' && ' Your event will appear in search results.'}
                    {privacy === 'unlisted' && ' Only people with the direct link can access.'}
                    {privacy === 'private' && ' Only explicitly invited guests can access.'}
                    {privacy === 'password' && ' Guests must enter the access code to view.'}
                  </p>
                </div>
              </motion.div>
            )}

            {/* ── Sharing ── */}
            {activeTab === 'sharing' && (
              <motion.div
                key="sharing"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="card p-6 space-y-5"
              >
                <h2 className="text-base font-semibold text-white">Sharing & Links</h2>

                {/* Event URL */}
                <div>
                  <label className="block text-xs font-medium text-secondary mb-1.5">Event Link</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      readOnly
                      value={buildEventUrl(event.id)}
                      className="input-field flex-1 font-mono text-xs text-muted cursor-text"
                    />
                    <button
                      id="settings-copy-link-btn"
                      onClick={handleCopyLink}
                      className="btn-secondary px-3 py-2 flex-shrink-0"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* QR code section */}
                <div className="p-5 glass-light rounded-xl text-center space-y-4">
                  <QrCode className="w-10 h-10 text-purple-400 mx-auto" />
                  <div>
                    <p className="text-sm font-medium text-white">QR Code</p>
                    <p className="text-xs text-muted mt-1">Open the event page to generate and download the QR code</p>
                  </div>
                  <Link
                    to={`/event/${id}`}
                    className="btn-primary text-sm py-2 inline-flex"
                  >
                    <QrCode className="w-3.5 h-3.5" /> Open Event & Share
                  </Link>
                </div>

                {/* Share stats */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Total Views', value: (event.view_count ?? 0).toLocaleString() },
                    { label: 'Total Downloads', value: (event.download_count ?? 0).toLocaleString() },
                    { label: 'Guest Visits', value: (event.guest_count ?? 0).toLocaleString() },
                    { label: 'Contributors', value: (event.contributor_count ?? 0).toLocaleString() },
                  ].map(s => (
                    <div key={s.label} className="card p-3 text-center">
                      <p className="text-lg font-bold text-white">{s.value}</p>
                      <p className="text-xs text-muted">{s.label}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ── Danger Zone ── */}
            {activeTab === 'danger' && (
              <motion.div
                key="danger"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                {/* Archive */}
                <div className="card border-amber-500/20 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-white">Archive Event</p>
                    <p className="text-xs text-muted mt-0.5">
                      Archiving makes the event read-only. Media is preserved but no new uploads are accepted.
                    </p>
                  </div>
                  <button
                    id="settings-archive-btn"
                    onClick={() => toast('Archive feature coming soon', { icon: '📦' })}
                    className="btn-ghost text-sm border border-amber-500/30 text-amber-400 hover:bg-amber-500/10 flex-shrink-0"
                  >
                    Archive Event
                  </button>
                </div>

                {/* Transfer */}
                <div className="card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-white">Transfer Ownership</p>
                    <p className="text-xs text-muted mt-0.5">
                      Transfer this event to another user's account. You'll lose owner access.
                    </p>
                  </div>
                  <button
                    id="settings-transfer-btn"
                    onClick={() => toast('Transfer feature coming soon', { icon: '🔄' })}
                    className="btn-ghost text-sm border border-surface-500 flex-shrink-0"
                  >
                    Transfer
                  </button>
                </div>

                {/* Delete */}
                <div className="card border-red-500/25 p-5 space-y-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-white">Delete Event</p>
                      <p className="text-xs text-muted mt-0.5">
                        Permanently delete this event and all its photos, videos, and data. This action cannot be undone.
                      </p>
                    </div>
                  </div>

                  {!showDeleteConfirm ? (
                    <button
                      id="settings-delete-btn"
                      onClick={() => setShowDeleteConfirm(true)}
                      className="btn-ghost text-sm text-red-400 hover:text-red-300 border border-red-500/25 hover:bg-red-500/10"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete Event
                    </button>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="space-y-3"
                    >
                      <p className="text-xs text-secondary">
                        Type <span className="font-semibold text-white">{event.title}</span> to confirm deletion:
                      </p>
                      <input
                        id="settings-delete-confirm"
                        type="text"
                        value={deleteConfirmText}
                        onChange={e => setDeleteConfirmText(e.target.value)}
                        placeholder={event.title}
                        className="input-field border-red-500/30 focus:border-red-500"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={handleDelete}
                          disabled={deleteConfirmText !== event.title}
                          className="btn-ghost text-sm text-red-400 hover:text-red-300 border border-red-500/40 hover:bg-red-500/10 disabled:opacity-40"
                        >
                          <Trash2 className="w-4 h-4" />
                          Confirm Delete
                        </button>
                        <button
                          onClick={() => { setShowDeleteConfirm(false); setDeleteConfirmText(''); }}
                          className="btn-ghost text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
