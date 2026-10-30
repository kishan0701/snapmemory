import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar, MapPin, Images, Video, FolderOpen, Users,
  Download, Upload, Settings, Eye,
  Lock, Globe, TrendingUp, UserCheck,
  Plus, BarChart3, Share2, Copy, Check, ScanFace,
  RotateCcw, Trash2, Zap, AlertCircle, CheckCircle2, X, Shield, Clock,
  FileCheck2, ThumbsUp, ThumbsDown
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import toast from 'react-hot-toast';
import { Navbar } from '@/components/layout/Navbar';
import { MediaGrid } from '@/components/gallery/MediaGrid';
import { UploadZone } from '@/components/upload/UploadZone';
import { useEventStore } from '@/store/eventStore';
import {
  formatDate, formatStorageUsed,
  getPrivacyLabel, getPrivacyBadge, formatNumber, formatRelativeTime, formatFileSize
} from '@/lib/utils';
import { useAuth } from '@/features/auth/AuthContext';
import { ContributorRequestModal } from '@/components/events/ContributorRequestModal';
import {
  loadModels, detectFaceDescriptor, matchPhotosAgainstFace, type FaceMatchResult,
} from '@/services/faceMatcher';
import type { Media, Event } from '@/types';

type Tab = 'gallery' | 'albums' | 'upload' | 'find-my-photos' | 'approvals' | 'contributors' | 'analytics';

export function EventPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  const getEventById = useEventStore((s) => s.getEventById);
  const getEventMedia = useEventStore((s) => s.getEventMedia);
  const getPendingMediaForEvent = useEventStore((s) => s.getPendingMediaForEvent);
  const getEventAlbums = useEventStore((s) => s.getEventAlbums);
  const approveMedia = useEventStore((s) => s.approveMedia);
  const rejectMedia = useEventStore((s) => s.rejectMedia);
  const approveAllPendingMedia = useEventStore((s) => s.approveAllPendingMedia);
  const updateMediaFaceDescriptors = useEventStore((s) => s.updateMediaFaceDescriptors);
  const getUploadRequestsForEvent = useEventStore((s) => s.getUploadRequestsForEvent);
  const approveUploadRequest = useEventStore((s) => s.approveUploadRequest);
  const rejectUploadRequest = useEventStore((s) => s.rejectUploadRequest);

  const event = getEventById(id ?? '');
  const media = getEventMedia(id ?? '', false); // Approved photos only for general gallery
  const pendingMedia = getPendingMediaForEvent(id ?? '');
  const albums = getEventAlbums(id ?? '');
  const uploadRequests = getUploadRequestsForEvent(id ?? '');

  const [activeTab, setActiveTab] = useState<Tab>('gallery');
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0814]">
        <Navbar />
        <div className="text-center p-6">
          <p className="text-5xl mb-4">🔍</p>
          <h1 className="text-xl font-bold text-white mb-2">Event not found</h1>
          <p className="text-secondary mb-4">This event may have been deleted or the link is invalid.</p>
          <Link to="/dashboard" className="btn-primary">Go to Dashboard</Link>
        </div>
      </div>
    );
  }

  const isOwner = (user && user.id === event.owner_id) || event.current_user_role === 'owner';
  const isContributor = event.current_user_role === 'contributor' || isOwner;
  const pendingRequestsCount = uploadRequests.filter((r) => r.status === 'pending').length;

  const shareUrl = `snapmemory.in/e/${event.id}`;
  const fullShareUrl = window.location.href.split('#')[0];

  const handleCopy = () => {
    navigator.clipboard.writeText(fullShareUrl).catch(() => {});
    setCopied(true);
    toast.success('Event link copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const TABS: { id: Tab; label: string; icon: React.ComponentType<{ className?: string }>; ownerOnly?: boolean; badge?: number }[] = [
    { id: 'gallery', label: 'Gallery', icon: Images },
    { id: 'albums', label: 'Albums', icon: FolderOpen },
    { id: 'upload', label: 'Upload', icon: Upload },
    { id: 'find-my-photos', label: 'Find My Photos', icon: ScanFace },
    ...(isOwner && pendingMedia.length > 0 ? [{ id: 'approvals' as Tab, label: 'Pending Approvals', icon: FileCheck2, ownerOnly: true, badge: pendingMedia.length }] : []),
    { id: 'contributors', label: 'Contributors', icon: Users, ownerOnly: true, badge: pendingRequestsCount },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, ownerOnly: true },
  ];

  return (
    <div className="min-h-screen bg-[#0a0814] text-white overflow-x-hidden">
      <Navbar />

      {/* ══════════════════════════════════════════════════════
          HERO COVER — Full-width responsive with layered overlays
      ══════════════════════════════════════════════════════ */}
      <div className="relative pt-16">
        {/* Background Cover Image */}
        <div className="absolute inset-0 overflow-hidden">
          <img
            src={event.cover_url || 'https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&q=80'}
            alt={event.title}
            className="w-full h-full object-cover scale-105 filter blur-[1px]"
          />
          {/* Gradients to guarantee 100% text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0814] via-[#0a0814]/85 to-[#0a0814]/60" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a0814]/90 via-[#0a0814]/40 to-transparent" />
        </div>

        {/* Content container */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-8 pb-8">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">

            {/* Left: Event Details */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="flex-1 min-w-0"
            >
              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className={`badge text-xs ${getPrivacyBadge(event.privacy)}`}>
                  {event.privacy === 'public' ? <Globe className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                  {getPrivacyLabel(event.privacy)}
                </span>
                <span className="badge badge-purple text-xs font-semibold">{event.type}</span>
                {isOwner && (
                  <span className="badge text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    Host Admin
                  </span>
                )}
              </div>

              {/* Event Title */}
              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white mb-2 leading-tight drop-shadow-md break-words">
                {event.title}
                {event.type === 'Wedding' && <span className="ml-2 text-red-400">❤️</span>}
              </h1>

              {/* Tagline / Description */}
              {event.description && (
                <p className="text-white/80 text-sm sm:text-base mb-4 max-w-2xl leading-relaxed">
                  {event.description}
                </p>
              )}

              {/* Date + Location */}
              <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-white/70">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-purple-400" />
                  {formatDate(event.date)}
                </span>
                {event.location && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-purple-400" />
                    {event.location}
                  </span>
                )}
              </div>
            </motion.div>

            {/* Right: QR Share Card (Fully Responsive on Mobile & Desktop) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="w-full sm:w-72 lg:w-64 flex-shrink-0"
            >
              <div
                className="rounded-2xl p-4 w-full"
                style={{
                  background: 'rgba(15, 13, 30, 0.92)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(124, 58, 237, 0.3)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                }}
              >
                <p className="text-white text-xs font-bold mb-3 text-center">Scan to Open & Upload</p>

                {/* QR Code */}
                <div className="flex justify-center mb-3">
                  <div className="bg-white p-2.5 rounded-xl shadow-lg">
                    <QRCodeSVG
                      id="event-qr-code"
                      value={fullShareUrl}
                      size={100}
                      level="H"
                      marginSize={0}
                      fgColor="#151228"
                    />
                  </div>
                </div>

                <p className="text-white/60 text-[11px] text-center mb-2.5">
                  Scan with any phone camera
                </p>

                {/* URL Copy Row */}
                <div className="flex items-center gap-1.5 mb-3">
                  <div
                    className="flex-1 rounded-lg px-2.5 py-1.5 text-[10px] font-mono truncate select-all"
                    style={{ background: 'rgba(255,255,255,0.06)', color: '#a78bfa' }}
                  >
                    {shareUrl}
                  </div>
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="w-7 h-7 rounded-lg flex items-center justify-center transition-all flex-shrink-0 hover:bg-purple-500/30"
                    style={{ background: 'rgba(124,58,237,0.2)', color: '#a78bfa' }}
                    title="Copy share link"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {/* Share Button */}
                <button
                  id="event-share-btn"
                  type="button"
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({ title: event.title, url: fullShareUrl }).catch(() => {});
                    } else {
                      handleCopy();
                    }
                  }}
                  className="w-full btn-primary py-2 text-xs font-semibold justify-center"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  Share Event
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
          CREATOR APPROVAL ALERT BANNER (If guests uploaded photos)
      ══════════════════════════════════════════════════════ */}
      {isOwner && pendingMedia.length > 0 && activeTab !== 'approvals' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-3">
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg"
            style={{
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.20) 0%, rgba(124, 58, 237, 0.15) 100%)',
              border: '1px solid rgba(245, 158, 11, 0.45)',
            }}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0 animate-pulse">
                <FileCheck2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-white flex items-center gap-2">
                  <span>{pendingMedia.length} Photo{pendingMedia.length > 1 ? 's' : ''} Submitted by Guests Waiting for Approval</span>
                  <span className="badge badge-amber text-[10px]">Action Required</span>
                </p>
                <p className="text-xs text-white/70 mt-0.5">
                  Review and publish attendee photos to the public gallery so everyone can see and search them.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setActiveTab('approvals')}
              className="btn-primary py-2 px-4 text-xs font-bold whitespace-nowrap bg-amber-500 hover:bg-amber-400 text-black border-none self-end sm:self-center"
            >
              Review & Approve ({pendingMedia.length})
            </button>
          </motion.div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          STATS BAR — Responsive Grid
      ══════════════════════════════════════════════════════ */}
      <div className="border-b border-purple-900/20" style={{ background: 'rgba(15,13,30,0.6)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 sm:gap-6">
              {[
                { icon: Images, value: formatNumber(media.length), label: 'Photos' },
                { icon: Video, value: formatNumber(event.video_count ?? 0), label: 'Videos' },
                { icon: FolderOpen, value: albums.length, label: 'Albums' },
                { icon: Users, value: formatNumber(event.contributor_count ?? 0), label: 'Contributors' },
                { icon: Eye, value: formatNumber(event.view_count ?? 1), label: 'Views' },
                { icon: Download, value: formatNumber(event.download_count ?? 0), label: 'Downloads' },
              ].map((stat) => (
                <div key={stat.label} className="flex items-center gap-2">
                  <stat.icon className="w-4 h-4 text-purple-400 flex-shrink-0" />
                  <div>
                    <span className="text-white font-black text-sm sm:text-base">{stat.value}</span>
                    <span className="text-white/50 text-[10px] sm:text-xs ml-1">{stat.label}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Top Action Buttons */}
            <div className="flex items-center gap-2 flex-wrap self-end sm:self-center">
              {event.allow_downloads && (
                <Link
                  to={`/event/${event.id}/downloads`}
                  className="btn-secondary text-xs py-1.5 px-3"
                >
                  <Download className="w-3.5 h-3.5" /> Downloads
                </Link>
              )}
              {!isContributor && event.allow_contributor_requests && (
                <button
                  type="button"
                  onClick={() => setShowRequestModal(true)}
                  className="btn-secondary text-xs py-1.5 px-3"
                >
                  <Upload className="w-3.5 h-3.5" /> Request Access
                </button>
              )}
              {isOwner && (
                <Link to={`/event/${event.id}/settings`} className="btn-ghost text-xs py-1.5 px-3">
                  <Settings className="w-3.5 h-3.5" /> Settings
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
          TAB NAVIGATION (Smooth Horizontal Scrolling on Mobile)
      ══════════════════════════════════════════════════════ */}
      <div
        className="border-b border-purple-900/20 sticky top-14 z-30 backdrop-blur-xl"
        style={{ background: 'rgba(10,8,20,0.94)' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-1">
            {TABS.filter((t) => !t.ownerOnly || isOwner).map((tab) => (
              <button
                key={tab.id}
                id={`event-tab-${tab.id}`}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-4 py-3 text-xs sm:text-sm font-semibold whitespace-nowrap border-b-2 transition-all ${
                  activeTab === tab.id
                    ? 'border-purple-500 text-white font-bold'
                    : 'border-transparent text-white/50 hover:text-white hover:border-white/20'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span
                    className={`ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] font-bold text-white flex items-center justify-center ${
                      tab.id === 'approvals' ? 'bg-amber-500 text-black' : 'bg-purple-600 text-white'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
          TAB CONTENT
      ══════════════════════════════════════════════════════ */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-24">
        <AnimatePresence mode="wait">
          {/* ─── Gallery Tab ─── */}
          {activeTab === 'gallery' && (
            <motion.div key="gallery" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              {/* Find My Photos Promo Banner */}
              <div
                className="mb-5 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center gap-4"
                style={{
                  background: 'linear-gradient(135deg, rgba(124,58,237,0.18) 0%, rgba(79,70,229,0.10) 100%)',
                  border: '1px solid rgba(124,58,237,0.30)',
                }}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-xl gradient-brand flex items-center justify-center flex-shrink-0">
                    <ScanFace className="w-5 h-5 text-white" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-white">Find Your Photos with AI Face Recognition</p>
                    <p className="text-xs text-white/60 leading-relaxed">
                      Upload a selfie — AI instantly scans all photos in this event to find every photo you appear in. 100% private.
                    </p>
                  </div>
                </div>
                <button
                  id="event-find-my-photos-btn"
                  type="button"
                  onClick={() => setActiveTab('find-my-photos')}
                  className="btn-primary text-sm py-2 px-4 flex-shrink-0 sm:w-auto w-full justify-center"
                >
                  <ScanFace className="w-4 h-4" />
                  Find My Photos
                </button>
              </div>

              {/* Gallery Grid */}
              <MediaGrid
                media={media}
                albums={albums}
                canDownload={event.allow_downloads}
                canDelete={isOwner}
                onOpenFindMyPhotos={() => setActiveTab('find-my-photos')}
              />
            </motion.div>
          )}

          {/* ─── Albums Tab ─── */}
          {activeTab === 'albums' && (
            <motion.div key="albums" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <AlbumsTab eventId={event.id} albums={albums} isOwner={isOwner} />
            </motion.div>
          )}

          {/* ─── Upload Tab ─── */}
          {activeTab === 'upload' && (
            <motion.div key="upload" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="max-w-2xl mx-auto">
                <UploadZone
                  albums={albums}
                  eventId={event.id}
                  isOwner={isOwner}
                  onUploadComplete={() => {
                    // If creator uploaded, switch to gallery; if guest, show gallery or approvals
                    if (isOwner && pendingMedia.length > 0) {
                      setActiveTab('approvals');
                    } else {
                      setActiveTab('gallery');
                    }
                  }}
                />
              </div>
            </motion.div>
          )}

          {/* ─── Pending Approvals Tab (Host Creator Only) ─── */}
          {activeTab === 'approvals' && isOwner && (
            <motion.div key="approvals" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <ApprovalsTab
                eventId={event.id}
                pendingMedia={pendingMedia}
                onApprove={async (mediaId) => {
                  await approveMedia(mediaId);
                  toast.success('Photo approved and published to gallery! 🎉');
                }}
                onReject={async (mediaId) => {
                  await rejectMedia(mediaId);
                  toast.error('Photo rejected.');
                }}
                onApproveAll={async () => {
                  await approveAllPendingMedia(event.id);
                  toast.success(`🎉 Approved all ${pendingMedia.length} pending photos!`);
                  setActiveTab('gallery');
                }}
              />
            </motion.div>
          )}

          {/* ─── Find My Photos Tab ─── */}
          {activeTab === 'find-my-photos' && (
            <motion.div key="find-my-photos" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <FindMyPhotosTab
                eventId={event.id}
                photos={media.filter((m) => m.type === 'photo')}
                onDescriptorCached={(mediaId, desc) => updateMediaFaceDescriptors(mediaId, desc)}
              />
            </motion.div>
          )}

          {/* ─── Contributors Tab ─── */}
          {activeTab === 'contributors' && isOwner && (
            <motion.div key="contributors" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <ContributorsTab
                requests={uploadRequests}
                onApprove={(reqId) => {
                  approveUploadRequest(reqId);
                  toast.success('Contributor access approved! ✓');
                }}
                onReject={(reqId) => {
                  rejectUploadRequest(reqId);
                  toast.error('Contributor access rejected.');
                }}
              />
            </motion.div>
          )}

          {/* ─── Analytics Tab ─── */}
          {activeTab === 'analytics' && isOwner && (
            <motion.div key="analytics" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <AnalyticsTab event={event} mediaCount={media.length} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Contributor Request Modal */}
      {showRequestModal && (
        <ContributorRequestModal
          event={event}
          albums={albums}
          onClose={() => setShowRequestModal(false)}
        />
      )}
    </div>
  );
}

// ─── Approvals Tab Component (Host Creator Workflow) ──────────────────────────
function ApprovalsTab({
  pendingMedia,
  onApprove,
  onReject,
  onApproveAll,
}: {
  eventId: string;
  pendingMedia: Media[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onApproveAll: () => void;
}) {
  if (pendingMedia.length === 0) {
    return (
      <div className="card p-12 text-center max-w-xl mx-auto space-y-4">
        <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-white">All Caught Up!</h3>
        <p className="text-secondary text-sm">
          There are currently no photos waiting for approval. When guests or attendees upload photos in guest mode, they will appear here for you to review and publish.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & Batch Controls */}
      <div className="card p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="badge badge-amber text-xs font-bold">
              {pendingMedia.length} Pending Approval
            </span>
            <span className="text-xs text-white/50">Host Moderation Queue</span>
          </div>
          <h2 className="text-base sm:text-lg font-bold text-white">
            Guest Photos Awaiting Your Approval
          </h2>
          <p className="text-xs text-secondary mt-0.5">
            Review attendee submissions. Approved photos will immediately appear in the live gallery.
          </p>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          <button
            type="button"
            onClick={onApproveAll}
            className="btn-primary text-xs py-2 px-4 font-bold bg-emerald-600 hover:bg-emerald-500 text-white"
          >
            <ThumbsUp className="w-3.5 h-3.5" /> Approve All ({pendingMedia.length})
          </button>
        </div>
      </div>

      {/* Grid of Pending Media */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {pendingMedia.map((item) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card overflow-hidden flex flex-col justify-between border border-amber-500/30 hover:border-amber-500/60 transition-all"
          >
            {/* Image Thumbnail */}
            <div className="relative aspect-square overflow-hidden bg-surface-900">
              <img
                src={item.original_url || item.preview_url}
                alt={item.filename}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 left-2">
                <span className="badge badge-amber text-[10px]">Pending</span>
              </div>
              {item.face_descriptors && item.face_descriptors.length > 0 && (
                <div className="absolute bottom-2 left-2">
                  <span className="badge badge-purple text-[10px] flex items-center gap-1">
                    <ScanFace className="w-2.5 h-2.5" /> {item.face_descriptors.length} Face(s) Indexed
                  </span>
                </div>
              )}
            </div>

            {/* Metadata */}
            <div className="p-3 space-y-2 flex-1 flex flex-col justify-between">
              <div>
                <p className="text-xs font-semibold text-white truncate" title={item.filename}>
                  {item.filename}
                </p>
                <div className="flex items-center justify-between text-[11px] text-white/50 mt-1">
                  <span>{formatFileSize(item.size)}</span>
                  <span>{formatRelativeTime(item.created_at)}</span>
                </div>
                <div className="mt-2 pt-2 border-t border-purple-900/20 text-xs">
                  <span className="text-white/40 text-[10px]">Uploader:</span>
                  <p className="text-amber-300 font-medium truncate">
                    {item.uploader_name || 'Guest Attendee'}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => onApprove(item.id)}
                  className="btn-primary text-xs py-1.5 justify-center bg-emerald-600 hover:bg-emerald-500 text-white"
                >
                  <Check className="w-3.5 h-3.5" /> Approve
                </button>
                <button
                  type="button"
                  onClick={() => onReject(item.id)}
                  className="btn-ghost text-xs py-1.5 justify-center text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-red-500/20"
                >
                  <X className="w-3.5 h-3.5" /> Reject
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ─── Albums Tab Component ─────────────────────────────────────────────────────
function AlbumsTab({ eventId, albums, isOwner }: { eventId: string; albums: ReturnType<typeof useEventStore.getState>['userAlbums']; isOwner: boolean }) {
  const addAlbum = useEventStore((s) => s.addAlbum);
  const [showNewAlbumModal, setShowNewAlbumModal] = useState(false);
  const [albumName, setAlbumName] = useState('');
  const [albumDesc, setAlbumDesc] = useState('');

  const handleCreateAlbum = (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!albumName.trim()) return;
    addAlbum(eventId, albumName.trim(), albumDesc.trim());
    toast.success('New album created!');
    setAlbumName('');
    setAlbumDesc('');
    setShowNewAlbumModal(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-base sm:text-lg font-bold text-white">{albums.length} Albums</h2>
        {isOwner && (
          <button
            type="button"
            id="create-album-btn"
            onClick={() => setShowNewAlbumModal(true)}
            className="btn-primary text-xs sm:text-sm py-2"
          >
            <Plus className="w-3.5 h-3.5" /> New Album
          </button>
        )}
      </div>

      {albums.length === 0 ? (
        <div className="card p-12 text-center max-w-md mx-auto">
          <FolderOpen className="w-12 h-12 text-white/20 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white mb-1">No albums yet</h3>
          <p className="text-xs text-secondary mb-4">Organize photos into albums like Ceremony, Reception, or Friends.</p>
          {isOwner && (
            <button
              type="button"
              onClick={() => setShowNewAlbumModal(true)}
              className="btn-primary text-xs mx-auto"
            >
              <Plus className="w-3.5 h-3.5" /> Create First Album
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {albums.map((album, i) => (
            <motion.div
              key={album.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className="group relative rounded-2xl overflow-hidden cursor-pointer border border-purple-900/30"
            >
              <div className="h-44 relative overflow-hidden bg-surface-900">
                <img
                  src={album.cover_url || 'https://images.unsplash.com/photo-1511285560929-80b456503681?w=800&q=80'}
                  alt={album.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-2 right-2">
                  <span className="badge badge-purple text-[10px]">
                    <Images className="w-2.5 h-2.5" /> {album.media_count ?? 0}
                  </span>
                </div>
              </div>

              <div className="p-3" style={{ background: 'rgba(15,13,30,0.95)' }}>
                <h3 className="text-sm font-bold text-white mb-0.5 truncate">{album.name}</h3>
                {album.description && (
                  <p className="text-xs text-white/50 line-clamp-1">{album.description}</p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* New Album Modal */}
      {showNewAlbumModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
          <div className="card p-6 w-full max-w-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">Create New Album</h3>
              <button type="button" onClick={() => setShowNewAlbumModal(false)} className="text-muted hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateAlbum} className="space-y-3">
              <div>
                <label className="text-xs text-secondary mb-1 block">Album Name</label>
                <input
                  type="text"
                  required
                  value={albumName}
                  onChange={(e) => setAlbumName(e.target.value)}
                  placeholder="e.g. Sangeet, Stage, Friends"
                  className="input-field text-xs"
                />
              </div>
              <div>
                <label className="text-xs text-secondary mb-1 block">Description (optional)</label>
                <input
                  type="text"
                  value={albumDesc}
                  onChange={(e) => setAlbumDesc(e.target.value)}
                  placeholder="Memorable highlights"
                  className="input-field text-xs"
                />
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <button type="button" onClick={() => setShowNewAlbumModal(false)} className="btn-ghost text-xs">
                  Cancel
                </button>
                <button type="submit" className="btn-primary text-xs">
                  Create Album
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Contributors Tab Component ───────────────────────────────────────────────
function ContributorsTab({
  requests,
  onApprove,
  onReject,
}: {
  requests: ReturnType<typeof useEventStore.getState>['uploadRequests'];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}) {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-white">Contributor Upload Requests</h2>
        <span className="badge badge-purple text-xs">
          {requests.filter((r) => r.status === 'pending').length} Pending
        </span>
      </div>

      {requests.length === 0 ? (
        <div className="card text-center py-12">
          <UserCheck className="w-10 h-10 text-white/20 mx-auto mb-3" />
          <p className="text-white/50 text-sm">No upload requests received yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((req) => (
            <div key={req.id} className="card p-4 flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-purple-700">
                <img
                  src={`https://api.dicebear.com/7.x/notionists/svg?seed=${req.requester?.name || 'Guest'}&backgroundColor=7c3aed`}
                  alt=""
                  className="w-full h-full"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white">{req.requester?.name || 'Guest Attendee'}</p>
                <p className="text-xs text-white/50">{req.requester?.email || 'guest@snapmemory.in'}</p>
                {req.message && (
                  <p className="text-xs text-purple-300 mt-1 italic">"{req.message}"</p>
                )}
              </div>
              <div className="flex items-center gap-2 self-end sm:self-center">
                {req.status === 'pending' ? (
                  <>
                    <button
                      type="button"
                      onClick={() => onApprove(req.id)}
                      className="btn-primary text-xs py-1.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white"
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      onClick={() => onReject(req.id)}
                      className="btn-ghost text-xs py-1.5 px-3 text-red-400 hover:bg-red-500/10"
                    >
                      Reject
                    </button>
                  </>
                ) : (
                  <span className={`badge text-xs ${req.status === 'approved' ? 'badge-green' : 'badge-red'}`}>
                    {req.status}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Analytics Tab Component ──────────────────────────────────────────────────
function AnalyticsTab({ event, mediaCount }: { event: Event; mediaCount: number }) {
  const stats = [
    { label: 'Live Photos', value: mediaCount, icon: Images, color: 'text-purple-400', bg: 'bg-purple-500/10' },
    { label: 'Videos', value: event.video_count ?? 0, icon: Video, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: 'Storage Used', value: formatStorageUsed(event.storage_used ?? 0), icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: 'Total Views', value: formatNumber(event.view_count ?? 1), icon: Eye, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { label: 'Downloads', value: formatNumber(event.download_count ?? 0), icon: Download, color: 'text-pink-400', bg: 'bg-pink-500/10' },
    { label: 'Contributors', value: event.contributor_count ?? 0, icon: Users, color: 'text-teal-400', bg: 'bg-teal-500/10' },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-base font-semibold text-white">Event Performance & Analytics</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
        {stats.map((s) => (
          <div key={s.label} className={`card p-4 ${s.bg} border border-purple-900/20`}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-white/60">{s.label}</p>
              <s.icon className={`w-4 h-4 ${s.color}`} />
            </div>
            <p className="text-lg sm:text-2xl font-black text-white">{s.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Find My Photos Tab Component ─────────────────────────────────────────────
type FmpState = 'intro' | 'upload' | 'processing' | 'results' | 'no_results' | 'error' | 'no_face';

function FindMyPhotosTab({
  photos,
  onDescriptorCached,
}: {
  eventId: string;
  photos: Media[];
  onDescriptorCached?: (mediaId: string, descriptors: number[][]) => void;
}) {
  const [fmpState, setFmpState] = useState<FmpState>('intro');
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null);
  const [consent, setConsent] = useState(false);
  const [results, setResults] = useState<FaceMatchResult[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [progress, setProgress] = useState({ scanned: 0, total: 0, currentFile: '', modelStep: '' });
  const [errorMsg, setErrorMsg] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const eventPhotos = useMemo(() => {
    return photos.map((m) => ({
      id: m.id,
      url: m.original_url || m.preview_url || '',
      thumbnailUrl: m.thumbnail_url || m.preview_url || m.original_url || '',
      filename: m.filename,
      face_descriptors: m.face_descriptors,
    }));
  }, [photos]);

  useEffect(() => {
    loadModels().catch(() => {});
  }, []);

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    setSelfiePreview(URL.createObjectURL(file));
    setFmpState('upload');
  };

  const handleSearch = useCallback(async () => {
    if (!consent || !selfiePreview) return;
    setFmpState('processing');
    setProgress({ scanned: 0, total: 0, currentFile: '', modelStep: 'Initializing AI models…' });

    try {
      await loadModels((step) => setProgress((p) => ({ ...p, modelStep: step })));
      setProgress((p) => ({ ...p, modelStep: 'Analyzing facial features in selfie…' }));

      const descriptor = await detectFaceDescriptor(selfiePreview);
      if (!descriptor) {
        setFmpState('no_face');
        return;
      }

      setProgress((p) => ({ ...p, total: eventPhotos.length, modelStep: 'Scanning event photos…' }));
      const matches = await matchPhotosAgainstFace(
        descriptor,
        eventPhotos,
        (scanned, total, currentFile) => setProgress((p) => ({ ...p, scanned, total, currentFile })),
        0.60,
        onDescriptorCached
      );

      setResults(matches);
      if (matches.length === 0) {
        setFmpState('no_results');
      } else {
        setFmpState('results');
        toast.success(`🎉 Found ${matches.length} photo${matches.length > 1 ? 's' : ''} containing your face!`);
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Unknown error during face matching');
      setFmpState('error');
    }
  }, [consent, selfiePreview, eventPhotos, onDescriptorCached]);

  const toggleSel = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleDownload = () => {
    results
      .filter((r) => selected.has(r.mediaId))
      .forEach((r) => {
        const a = document.createElement('a');
        a.href = r.url;
        a.download = r.filename;
        a.target = '_blank';
        a.click();
      });
    toast.success(`Downloading ${selected.size} photo(s)`);
  };

  const handleReset = () => {
    if (selfiePreview) URL.revokeObjectURL(selfiePreview);
    setSelfiePreview(null);
    setConsent(false);
    setSelected(new Set());
    setResults([]);
    setErrorMsg('');
    setFmpState('intro');
  };

  const pct = progress.total > 0 ? Math.round((progress.scanned / progress.total) * 100) : 0;

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 badge badge-purple mb-3">
          <ScanFace className="w-3.5 h-3.5" /> AI Facial Recognition
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-white mb-2">Find My Photos</h2>
        <p className="text-secondary text-xs sm:text-sm">
          Upload a selfie — AI scans all <strong className="text-white">{eventPhotos.length} photos</strong> in this event to find every photo you appear in.
        </p>
      </div>

      <AnimatePresence mode="wait">
        {/* Intro */}
        {fmpState === 'intro' && (
          <motion.div key="fmp-intro" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="card p-6 space-y-5">
            <div className="flex items-start gap-3 p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
              <Shield className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-white mb-1">🔒 100% Private — On-Device Matching</p>
                <p className="text-xs text-secondary leading-relaxed">
                  Your selfie is processed locally in your browser to extract facial landmarks. Your face image is never uploaded to any remote server or stored.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                id="fmp-tab-upload-btn"
                onClick={() => {
                  if (fileRef.current) {
                    fileRef.current.removeAttribute('capture');
                    fileRef.current.click();
                  }
                }}
                className="btn-primary justify-center py-3"
              >
                <Upload className="w-4 h-4" /> Upload Selfie
              </button>

              <button
                type="button"
                id="fmp-tab-camera-btn"
                onClick={() => {
                  if (fileRef.current) {
                    fileRef.current.setAttribute('capture', 'user');
                    fileRef.current.click();
                  }
                }}
                className="btn-secondary justify-center py-3"
              >
                <ScanFace className="w-4 h-4" /> Take Selfie (Camera)
              </button>
            </div>

            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
            />
          </motion.div>
        )}

        {/* Consent / Confirmation */}
        {fmpState === 'upload' && (
          <motion.div key="fmp-upload" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="card p-6 space-y-5">
            <div className="flex items-center gap-4">
              <div className="relative w-20 h-20 rounded-xl overflow-hidden border-2 border-purple-500/40 flex-shrink-0">
                {selfiePreview && <img src={selfiePreview} alt="Selfie" className="w-full h-full object-cover" />}
              </div>
              <div>
                <div className="flex items-center gap-1.5 mb-0.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <p className="text-sm font-semibold text-white">Selfie ready</p>
                </div>
                <p className="text-xs text-muted">Ready to search {eventPhotos.length} photos.</p>
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="text-xs text-purple-400 hover:text-purple-300 mt-1"
                >
                  Change photo
                </button>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 mt-0.5"
                />
                <p className="text-xs text-secondary leading-relaxed">
                  I consent to matching this selfie locally against event photos. I understand this runs privately on my device.
                </p>
              </label>
            </div>

            <div className="flex gap-3">
              <button type="button" onClick={handleReset} className="btn-ghost text-xs">
                <X className="w-4 h-4" /> Cancel
              </button>
              <button
                id="fmp-tab-search-btn"
                type="button"
                onClick={handleSearch}
                disabled={!consent}
                className="btn-primary flex-1 justify-center disabled:opacity-50"
              >
                <ScanFace className="w-4 h-4" /> Find My Photos Now
              </button>
            </div>

            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
            />
          </motion.div>
        )}

        {/* Processing State */}
        {fmpState === 'processing' && (
          <motion.div key="fmp-processing" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="card p-8 text-center space-y-6">
            <div className="relative w-20 h-20 mx-auto">
              <div className="w-20 h-20 rounded-2xl gradient-brand flex items-center justify-center">
                <ScanFace className="w-9 h-9 text-white" />
              </div>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0 rounded-2xl border-2 border-transparent border-t-purple-400"
              />
            </div>
            <div>
              <h3 className="text-base font-bold text-white mb-1">
                {progress.scanned > 0 ? 'Scanning Event Photos…' : 'Processing Face Data…'}
              </h3>
              <p className="text-xs text-muted">
                {progress.scanned > 0 ? `Matched ${progress.scanned} of ${progress.total} photos` : progress.modelStep}
              </p>
            </div>
            {progress.total > 0 && (
              <div className="space-y-2">
                <div className="w-full bg-purple-950/60 rounded-full h-2 overflow-hidden">
                  <motion.div
                    className="h-full gradient-brand rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.2 }}
                  />
                </div>
                <p className="text-xs font-semibold text-purple-300">{pct}%</p>
              </div>
            )}
          </motion.div>
        )}

        {/* Results */}
        {fmpState === 'results' && (
          <motion.div key="fmp-results" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400" />
                  Found {results.length} photo{results.length > 1 ? 's' : ''}!
                </h3>
                <p className="text-xs text-muted mt-0.5">Ranked by face match confidence</p>
              </div>
              <div className="flex gap-2">
                {selected.size > 0 && (
                  <button type="button" onClick={handleDownload} className="btn-primary text-xs py-2">
                    <Download className="w-3.5 h-3.5" /> Download ({selected.size})
                  </button>
                )}
                <button type="button" onClick={handleReset} className="btn-ghost text-xs py-2">
                  <RotateCcw className="w-3.5 h-3.5" /> New Search
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {results.map((result, i) => (
                <motion.div
                  key={result.mediaId}
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className={`relative rounded-xl overflow-hidden cursor-pointer group border-2 transition-all ${
                    selected.has(result.mediaId) ? 'border-purple-500 scale-[0.98]' : 'border-transparent hover:border-purple-500/40'
                  }`}
                  onClick={() => toggleSel(result.mediaId)}
                >
                  <img src={result.thumbnailUrl} alt={result.filename} className="w-full aspect-square object-cover" />
                  <div
                    className={`absolute inset-0 transition-all ${
                      selected.has(result.mediaId) ? 'bg-purple-500/20' : 'bg-transparent group-hover:bg-black/20'
                    }`}
                  />
                  <div className="absolute top-2 left-2">
                    <div
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                        selected.has(result.mediaId) ? 'bg-purple-600 border-purple-500' : 'border-white/60 bg-black/40'
                      }`}
                    >
                      {selected.has(result.mediaId) && <CheckCircle2 className="w-3 h-3 text-white" />}
                    </div>
                  </div>
                  <div className="absolute bottom-2 right-2">
                    <span
                      className={`badge text-[10px] ${
                        result.confidence > 0.8 ? 'badge-green' : result.confidence > 0.65 ? 'badge-amber' : 'badge-blue'
                      }`}
                    >
                      {Math.round(result.confidence * 100)}% match
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* No Results / No Face / Error */}
        {(fmpState === 'no_face' || fmpState === 'no_results' || fmpState === 'error') && (
          <motion.div key="fmp-err" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="card p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto bg-amber-500/15 border border-amber-500/30">
              <AlertCircle className="w-8 h-8 text-amber-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white mb-2">
                {fmpState === 'error' ? 'Face scan error' : fmpState === 'no_face' ? 'No face detected in selfie' : 'No photos found with your face'}
              </h3>
              <p className="text-sm text-secondary max-w-sm mx-auto">
                {fmpState === 'error'
                  ? errorMsg
                  : fmpState === 'no_face'
                  ? 'Please use a clear, front-facing photo in good lighting without sunglasses.'
                  : `Checked all ${eventPhotos.length} photos in this event but didn't find a matching face. Try uploading a clearer selfie.`}
              </p>
            </div>
            <button type="button" onClick={handleReset} className="btn-primary mx-auto">
              <RotateCcw className="w-4 h-4" /> Try Again
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
