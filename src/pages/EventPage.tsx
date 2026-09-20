import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar, MapPin, Images, Video, FolderOpen, Users,
  Download, Upload, QrCode, Settings, Eye,
  Lock, Globe, TrendingUp, UserCheck,
  Plus, BarChart3, Share2, Copy, Check,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Navbar } from '@/components/layout/Navbar';
import { MediaGrid } from '@/components/gallery/MediaGrid';
import { UploadZone } from '@/components/upload/UploadZone';
import {
  getEventById as getMockEventById, getMediaForEvent, getAlbumsForEvent,
  MOCK_UPLOAD_REQUESTS
} from '@/lib/mock-data';
import { useEventStore } from '@/lib/eventStore';
import {
  formatDate, formatStorageUsed, getEventTypeEmoji,
  getPrivacyLabel, getPrivacyBadge, formatNumber
} from '@/lib/utils';
import { useAuth } from '@/features/auth/AuthContext';
import { ContributorRequestModal } from '@/components/events/ContributorRequestModal';

type Tab = 'gallery' | 'albums' | 'upload' | 'contributors' | 'analytics' | 'settings';

export function EventPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const getUserEvent = useEventStore(s => s.getEventById);

  const event = getMockEventById(id ?? '') ?? getUserEvent(id ?? '');
  const media = getMediaForEvent(id ?? '');
  const albums = getAlbumsForEvent(id ?? '');

  const [activeTab, setActiveTab] = useState<Tab>('gallery');
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Navbar />
        <div className="text-center">
          <p className="text-5xl mb-4">🔍</p>
          <h1 className="text-xl font-bold text-white mb-2">Event not found</h1>
          <p className="text-secondary mb-4">This event may have been deleted or is private.</p>
          <Link to="/dashboard" className="btn-primary">Go to Dashboard</Link>
        </div>
      </div>
    );
  }

  const isOwner = (user && user.id === event.owner_id) || event.current_user_role === 'owner';
  const isContributor = event.current_user_role === 'contributor' || isOwner;
  const pendingRequests = MOCK_UPLOAD_REQUESTS.filter(r => r.event_id === id && r.status === 'pending');

  const shareUrl = `snapmemory.in/e/${id}`;
  const fullShareUrl = `https://snapmemory.in/e/${id}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(fullShareUrl).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const TABS: { id: Tab; label: string; icon: React.ComponentType<{ className?: string }>; ownerOnly?: boolean }[] = [
    { id: 'gallery', label: 'Gallery', icon: Images },
    { id: 'albums', label: 'Albums', icon: FolderOpen },
    { id: 'upload', label: 'Upload', icon: Upload },
    { id: 'contributors', label: 'Contributors', icon: Users, ownerOnly: true },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, ownerOnly: true },
  ];

  return (
    <div className="min-h-screen bg-[#0a0814]">
      <Navbar />

      {/* ══════════════════════════════════════════════════════
          HERO COVER — Full-width tall photo with overlays
      ══════════════════════════════════════════════════════ */}
      <div className="relative pt-16">
        {/* Full-width cover image */}
        <div className="relative h-[380px] sm:h-[460px] overflow-hidden">
          <img
            src={event.cover_url}
            alt={event.title}
            className="w-full h-full object-cover"
          />
          {/* Multi-layer gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0814] via-[#0a0814]/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a0814]/60 via-transparent to-transparent" />
        </div>

        {/* Event info — absolute positioned over cover */}
        <div className="absolute bottom-0 left-0 right-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-6">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">

              {/* Left: Event details */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                {/* Category badge */}
                <div className="flex items-center gap-2 mb-3">
                  <span className={`badge text-xs ${getPrivacyBadge(event.privacy)}`}>
                    {event.privacy === 'public' ? <Globe className="w-2.5 h-2.5" /> : <Lock className="w-2.5 h-2.5" />}
                    {getPrivacyLabel(event.privacy)}
                  </span>
                  <span className="badge badge-purple text-xs">{event.type}</span>
                </div>

                {/* Event name */}
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-2 leading-tight drop-shadow-lg">
                  {event.title}
                  {event.type === 'Wedding' && (
                    <span className="ml-2 text-red-400">❤️</span>
                  )}
                </h1>

                {/* Tagline / description */}
                {event.description && (
                  <p className="text-white/70 text-sm mb-3 max-w-lg">{event.description}</p>
                )}

                {/* Date + location */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-white/70">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-purple-400" />
                    {formatDate(event.date)}
                  </span>
                  {event.location && (
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-purple-400" />
                      {event.location}
                    </span>
                  )}
                </div>
              </motion.div>

              {/* Right: QR Share Card — exactly like EventSnap */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.15 }}
                className="lg:flex-shrink-0"
              >
                <div
                  className="rounded-2xl p-4 w-full lg:w-64"
                  style={{
                    background: 'rgba(15, 13, 30, 0.92)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(124, 58, 237, 0.25)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                  }}
                >
                  <p className="text-white text-xs font-bold mb-3 text-center">Share This Event</p>

                  {/* QR Code */}
                  <div className="flex justify-center mb-3">
                    <div className="bg-white p-2.5 rounded-xl shadow-lg">
                      <QRCodeSVG
                        id="event-qr-code"
                        value={fullShareUrl}
                        size={100}
                        level="H"
                        marginSize={0}
                        fgColor="#1e1a35"
                      />
                    </div>
                  </div>

                  <p className="text-white/50 text-[10px] text-center mb-2">
                    Scan QR code to open gallery
                  </p>

                  {/* URL copy row */}
                  <div className="flex items-center gap-1.5 mb-3">
                    <div
                      className="flex-1 rounded-lg px-2.5 py-1.5 text-[10px] font-mono truncate"
                      style={{ background: 'rgba(255,255,255,0.06)', color: '#a78bfa' }}
                    >
                      {shareUrl}
                    </div>
                    <button
                      onClick={handleCopy}
                      className="w-7 h-7 rounded-lg flex items-center justify-center transition-all flex-shrink-0"
                      style={{ background: 'rgba(124,58,237,0.2)', color: '#a78bfa' }}
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  {/* Share button */}
                  <button
                    id="event-share-btn"
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({ title: event.title, url: fullShareUrl }).catch(() => {});
                      } else {
                        handleCopy();
                      }
                    }}
                    className="w-full btn-primary py-2 text-sm justify-center"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    Share Event
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
          STATS BAR — Photos · Videos · Albums · Contributors
      ══════════════════════════════════════════════════════ */}
      <div className="border-b border-purple-900/20" style={{ background: 'rgba(15,13,30,0.6)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex flex-wrap items-center gap-6">
            {[
              { icon: Images, value: formatNumber(event.photo_count ?? 0), label: 'Photos' },
              { icon: Video, value: formatNumber(event.video_count ?? 0), label: 'Videos' },
              { icon: FolderOpen, value: event.album_count ?? 0, label: 'Albums' },
              { icon: Users, value: formatNumber(event.contributor_count ?? 0), label: 'Contributors' },
              { icon: Eye, value: formatNumber(event.view_count ?? 0), label: 'Views' },
              { icon: Download, value: formatNumber(event.download_count ?? 0), label: 'Downloads' },
            ].map(stat => (
              <div key={stat.label} className="flex items-center gap-2">
                <stat.icon className="w-4 h-4 text-purple-400 flex-shrink-0" />
                <div>
                  <span className="text-white font-black text-base">{stat.value}</span>
                  <span className="text-white/50 text-xs ml-1.5">{stat.label}</span>
                </div>
              </div>
            ))}

            {/* Action buttons pushed right */}
            <div className="ml-auto flex items-center gap-2 flex-wrap">
              {event.allow_downloads && (
                <Link
                  to={`/event/${id}/downloads`}
                  id="event-download-center-btn"
                  className="btn-secondary text-xs py-1.5 px-3"
                >
                  <Download className="w-3.5 h-3.5" /> Downloads
                </Link>
              )}
              {!isContributor && event.allow_contributor_requests && (
                <button
                  id="event-request-upload-btn"
                  onClick={() => setShowRequestModal(true)}
                  className="btn-secondary text-xs py-1.5 px-3"
                >
                  <Upload className="w-3.5 h-3.5" /> Request Access
                </button>
              )}
              {isOwner && (
                <Link to={`/event/${id}/settings`} className="btn-ghost text-xs py-1.5 px-3">
                  <Settings className="w-3.5 h-3.5" /> Settings
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
          TAB NAV — Gallery · Albums · Upload · Contributors
      ══════════════════════════════════════════════════════ */}
      <div className="border-b border-purple-900/20 sticky top-14 z-30 backdrop-blur-xl"
        style={{ background: 'rgba(10,8,20,0.92)' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
            {TABS.filter(t => !t.ownerOnly || isOwner).map(tab => (
              <button
                key={tab.id}
                id={`event-tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-4 py-3.5 text-sm font-semibold whitespace-nowrap border-b-2 transition-all ${
                  activeTab === tab.id
                    ? 'border-purple-500 text-white'
                    : 'border-transparent text-white/50 hover:text-white hover:border-white/20'
                }`}
              >
                <tab.icon className="w-3.5 h-3.5" />
                {tab.label}
                {tab.id === 'contributors' && pendingRequests.length > 0 && (
                  <span className="ml-1 w-4 h-4 bg-amber-500 rounded-full text-[9px] text-white font-bold flex items-center justify-center">
                    {pendingRequests.length}
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-20">
        <AnimatePresence mode="wait">
          {activeTab === 'gallery' && (
            <motion.div key="gallery" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <MediaGrid
                media={media}
                albums={albums}
                canDownload={event.allow_downloads}
                canDelete={isOwner}
              />
            </motion.div>
          )}

          {activeTab === 'albums' && (
            <motion.div key="albums" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <AlbumsTab albums={albums} isOwner={isOwner} />
            </motion.div>
          )}

          {activeTab === 'upload' && (
            <motion.div key="upload" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="max-w-2xl mx-auto">
                <UploadZone albums={albums} eventId={event.id} />
              </div>
            </motion.div>
          )}

          {activeTab === 'contributors' && isOwner && (
            <motion.div key="contributors" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <ContributorsTab eventId={event.id} />
            </motion.div>
          )}

          {activeTab === 'analytics' && isOwner && (
            <motion.div key="analytics" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <AnalyticsTab event={event} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Contributor request modal */}
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

// ─── Albums Tab ───────────────────────────────────────────────────────────────
function AlbumsTab({ albums, isOwner }: { albums: ReturnType<typeof getAlbumsForEvent>; isOwner: boolean }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-white">{albums.length} Albums</h2>
        {isOwner && (
          <button id="create-album-btn" className="btn-primary text-sm py-2">
            <Plus className="w-3.5 h-3.5" /> New Album
          </button>
        )}
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {albums.map((album, i) => (
          <motion.div
            key={album.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.06 }}
            className="group relative rounded-2xl overflow-hidden cursor-pointer"
            style={{ border: '1px solid rgba(124,58,237,0.15)' }}
          >
            {/* Cover image */}
            <div className="h-44 relative overflow-hidden">
              <img
                src={album.cover_url}
                alt={album.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

              {/* Count badge */}
              <div className="absolute bottom-2 right-2">
                <span className="badge badge-purple text-[10px]">
                  <Images className="w-2.5 h-2.5" /> {album.media_count}
                </span>
              </div>
              {album.visibility !== 'public' && (
                <div className="absolute top-2 right-2">
                  <span className="badge badge-amber text-[10px]">
                    <Lock className="w-2.5 h-2.5" />
                    {album.visibility === 'contributors_only' ? 'Contributors' : 'Private'}
                  </span>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="p-3" style={{ background: 'rgba(15,13,30,0.95)' }}>
              <h3 className="text-sm font-bold text-white mb-0.5">{album.name}</h3>
              {album.description && (
                <p className="text-xs text-white/50 line-clamp-1">{album.description}</p>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ─── Contributors Tab ─────────────────────────────────────────────────────────
function ContributorsTab({ eventId }: { eventId: string }) {
  const requests = MOCK_UPLOAD_REQUESTS.filter(r => r.event_id === eventId);
  const [requests_state, setRequestsState] = useState(requests);

  const handleApprove = (id: string) => {
    setRequestsState(prev => prev.map(r => r.id === id ? { ...r, status: 'approved' as const } : r));
  };
  const handleReject = (id: string) => {
    setRequestsState(prev => prev.map(r => r.id === id ? { ...r, status: 'rejected' as const } : r));
  };

  return (
    <div className="space-y-5">
      <h2 className="text-base font-semibold text-white">Upload Requests</h2>
      {requests_state.length === 0 ? (
        <div className="text-center py-12">
          <UserCheck className="w-10 h-10 text-white/20 mx-auto mb-3" />
          <p className="text-white/50 text-sm">No requests yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests_state.map(req => (
            <div key={req.id} className="card p-4 flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0">
                <img
                  src={`https://api.dicebear.com/7.x/notionists/svg?seed=${req.requester?.name}&backgroundColor=7c3aed`}
                  alt={req.requester?.name}
                  className="w-full h-full"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white">{req.requester?.name}</p>
                <p className="text-xs text-white/40">{req.requester?.email}</p>
                {req.message && (
                  <p className="text-xs text-white/60 mt-1 line-clamp-2">"{req.message}"</p>
                )}
                {req.selected_album && (
                  <p className="text-xs text-purple-400 mt-1">Album: {req.selected_album.name}</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                {req.status === 'pending' ? (
                  <>
                    <button onClick={() => handleApprove(req.id)} className="btn-primary text-xs py-1.5 px-3">
                      Approve
                    </button>
                    <button onClick={() => handleReject(req.id)} className="btn-ghost text-xs py-1.5 px-3 text-red-400 hover:text-red-300">
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

// ─── Analytics Tab ────────────────────────────────────────────────────────────
function AnalyticsTab({ event }: { event: ReturnType<typeof getMockEventById> }) {
  if (!event) return null;
  const stats = [
    { label: 'Total Photos', value: event.photo_count ?? 0, icon: Images, color: 'text-purple-400', bg: 'bg-purple-500/10' },
    { label: 'Total Videos', value: event.video_count ?? 0, icon: Video, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: 'Storage Used', value: formatStorageUsed(event.storage_used ?? 0), icon: TrendingUp, color: 'text-green-400', bg: 'bg-green-500/10' },
    { label: 'Total Views', value: formatNumber(event.view_count ?? 0), icon: Eye, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { label: 'Downloads', value: formatNumber(event.download_count ?? 0), icon: Download, color: 'text-pink-400', bg: 'bg-pink-500/10' },
    { label: 'Contributors', value: event.contributor_count ?? 0, icon: Users, color: 'text-teal-400', bg: 'bg-teal-500/10' },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-base font-semibold text-white">Event Analytics</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {stats.map(s => (
          <div key={s.label} className={`card p-4 ${s.bg} border-0`}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-white/50">{s.label}</p>
              <s.icon className={`w-4 h-4 ${s.color}`} />
            </div>
            <p className="text-xl font-bold text-white">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="card p-5">
        <h3 className="text-sm font-semibold text-white mb-4">Upload Activity (Last 7 days)</h3>
        <div className="flex items-end gap-2 h-28">
          {[12, 28, 45, 19, 34, 22, 3].map((val, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div
                className="w-full rounded-t gradient-brand opacity-80 hover:opacity-100 transition-opacity"
                style={{ height: `${(val / 45) * 100}%` }}
              />
              <span className="text-[9px] text-white/40">
                {['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
