import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Plus, Search, Calendar, Images, Video,
  FolderOpen, MapPin, Lock, Globe, Link2,
  TrendingUp, Clock, Heart, Star, ChevronRight, Zap
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { useAuth } from '@/features/auth/AuthContext';
import { MOCK_EVENTS } from '@/lib/mock-data';
import { useEventStore } from '@/lib/eventStore';
import type { Event } from '@/types';
import {
  formatDate, formatStorageUsed, getEventTypeEmoji,
  getEventTypeColor, getPrivacyLabel, getPrivacyBadge,
  getFirstLetter, getAvatarTheme
} from '@/lib/utils';

function EventCard({ event }: { event: Event }) {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.3 }}
      className="card overflow-hidden cursor-pointer group"
      onClick={() => navigate(`/event/${event.id}`)}
    >
      {/* Cover */}
      <div className="relative h-44 overflow-hidden">
        <img
          src={event.cover_url}
          alt={event.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-1.5">
          <span className={`badge text-[10px] ${getPrivacyBadge(event.privacy)}`}>
            {event.privacy === 'public' ? <Globe className="w-2.5 h-2.5" /> : <Lock className="w-2.5 h-2.5" />}
            {getPrivacyLabel(event.privacy)}
          </span>
        </div>

        {event.current_user_role === 'owner' && (
          <div className="absolute top-3 right-3">
            <span className="badge badge-purple text-[10px]">
              <Star className="w-2.5 h-2.5" /> Owner
            </span>
          </div>
        )}
        {event.current_user_role === 'contributor' && (
          <div className="absolute top-3 right-3">
            <span className="badge badge-blue text-[10px]">Contributor</span>
          </div>
        )}

        {/* Bottom info */}
        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
          <div>
            <p className="text-xs text-white/60 flex items-center gap-1">
              <MapPin className="w-3 h-3" /> {event.location}
            </p>
          </div>
          <p className="text-xs text-white/60 flex items-center gap-1">
            <Calendar className="w-3 h-3" /> {formatDate(event.date)}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-base">{getEventTypeEmoji(event.type)}</span>
              <span className={`badge text-[10px] ${getEventTypeColor(event.type)}`}>{event.type}</span>
            </div>
            <h3 className="text-sm font-semibold text-white line-clamp-1">{event.title}</h3>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="text-center p-2 glass-light rounded-lg">
            <p className="text-base font-bold text-white">{event.photo_count ?? 0}</p>
            <p className="text-[10px] text-muted flex items-center justify-center gap-0.5">
              <Images className="w-2.5 h-2.5" /> Photos
            </p>
          </div>
          <div className="text-center p-2 glass-light rounded-lg">
            <p className="text-base font-bold text-white">{event.video_count}</p>
            <p className="text-[10px] text-muted flex items-center justify-center gap-0.5">
              <Video className="w-2.5 h-2.5" /> Videos
            </p>
          </div>
          <div className="text-center p-2 glass-light rounded-lg">
            <p className="text-base font-bold text-white">{event.album_count}</p>
            <p className="text-[10px] text-muted flex items-center justify-center gap-0.5">
              <FolderOpen className="w-2.5 h-2.5" /> Albums
            </p>
          </div>
        </div>

        <button className="btn-ghost w-full justify-center text-xs border border-purple-900/30 hover:border-purple-500/40 py-1.5">
          Open Event <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </motion.div>
  );
}

export function DashboardPage() {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');

  // Merge session-created events (store) with permanent mock events
  const userEvents = useEventStore(s => s.userEvents);
  const ALL_EVENTS = [...userEvents, ...MOCK_EVENTS];

  const myEvents = ALL_EVENTS.filter(e => e.current_user_role === 'owner');
  const joinedEvents = ALL_EVENTS.filter(e => e.current_user_role !== 'owner');

  const filtered = ALL_EVENTS.filter(e => {
    if (search && !e.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (typeFilter && e.type !== typeFilter) return false;
    return true;
  }).sort((a, b) => {
    if (sortBy === 'newest') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
  });

  const totalPhotos = ALL_EVENTS.reduce((sum, e) => sum + (e.photo_count ?? 0), 0);
  const totalStorage = ALL_EVENTS.reduce((sum, e) => sum + (e.storage_used ?? 0), 0);

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-16">
        {/* Header with WhatsApp-style Profile Badge */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3.5">
            <div className={`w-12 h-12 rounded-2xl ${getAvatarTheme(user?.name).bg} ring-2 ${getAvatarTheme(user?.name).ring} flex items-center justify-center text-white text-xl font-black shadow-lg shadow-black/50 flex-shrink-0 select-none`}>
              {getFirstLetter(user?.name)}
            </div>
            <div>
              <h1 className="text-xl sm:text-3xl font-black text-white flex items-center gap-2">
                Welcome, {user?.name ? user.name.split(' ')[0] : 'User'} 👋
              </h1>
              <p className="text-purple-300/70 text-xs sm:text-sm mt-0.5">
                {user?.email} • Manage your event galleries and memories
              </p>
            </div>
          </div>
          <Link
            to="/create-event"
            id="dashboard-create-event-btn"
            className="inline-flex items-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl gradient-brand text-white text-xs sm:text-sm font-semibold shadow-lg shadow-purple-900/40 hover:opacity-90 transition-opacity whitespace-nowrap flex-shrink-0"
          >
            <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>New Event</span>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { label: 'My Events', value: myEvents.length, icon: Calendar, color: 'text-purple-400' },
            { label: 'Total Photos', value: totalPhotos, icon: Images, color: 'text-blue-400' },
            { label: 'Events Joined', value: joinedEvents.length, icon: Heart, color: 'text-pink-400' },
            { label: 'Storage Used', value: formatStorageUsed(totalStorage), icon: TrendingUp, color: 'text-green-400' },
          ].map(stat => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="card p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-muted">{stat.label}</p>
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </div>
              <p className="text-xl font-bold text-white">{stat.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              id="dashboard-search"
              type="text"
              placeholder="Search events..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input-field pl-9"
            />
          </div>
          <select
            id="dashboard-type-filter"
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            className="input-field sm:w-48 cursor-pointer"
          >
            <option value="">All Types</option>
            {['Wedding', 'College Event', 'Birthday', 'Corporate', 'School Event', 'Family Function', 'Other'].map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <select
            id="dashboard-sort"
            value={sortBy}
            onChange={e => setSortBy(e.target.value as 'newest' | 'oldest')}
            className="input-field sm:w-36 cursor-pointer"
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
          </select>
        </div>

        {/* Events I own */}
        {myEvents.length > 0 && (
          <section id="my-events-section" className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-white flex items-center gap-2">
                <Star className="w-4 h-4 text-purple-400" /> My Events
                <span className="badge badge-purple text-[10px]">{myEvents.length}</span>
              </h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filtered.filter(e => e.current_user_role === 'owner').map(event => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </section>
        )}

        {/* Events I joined */}
        {joinedEvents.length > 0 && (
          <section className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-base font-semibold text-white flex items-center gap-2">
                <Heart className="w-4 h-4 text-pink-400" /> Events I Joined
                <span className="badge badge-blue text-[10px]">{joinedEvents.length}</span>
              </h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filtered.filter(e => e.current_user_role !== 'owner').map(event => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </section>
        )}

        {/* Empty state */}
        {filtered.length === 0 && (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-2xl gradient-brand-subtle border border-purple-500/20 flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-purple-400" />
            </div>
            <h3 className="text-base font-semibold text-white mb-2">No events found</h3>
            <p className="text-sm text-secondary mb-5">
              {search ? `No events match "${search}"` : 'Create your first event to get started.'}
            </p>
            {!search && (
              <Link to="/create-event" className="btn-primary">
                <Plus className="w-4 h-4" /> Create Event
              </Link>
            )}
          </div>
        )}

        {/* Quick links */}
        <section className="mt-8">
          <h2 className="text-sm font-semibold text-muted uppercase tracking-wider mb-4">Quick Actions</h2>
          <div className="grid sm:grid-cols-3 gap-3">
            {[
              { icon: Zap, label: 'Find My Photos', desc: 'Use AI to find photos of yourself', href: '/event/evt-1/find-my-photos', color: 'text-amber-400' },
              { icon: Link2, label: 'Share an Event', desc: 'Copy or generate a QR code', href: '/event/evt-1', color: 'text-green-400' },
              { icon: Clock, label: 'Recent Activity', desc: 'View recent uploads and downloads', href: '/dashboard', color: 'text-blue-400' },
            ].map(item => (
              <Link
                key={item.label}
                to={item.href}
                className="card card-hover p-4 flex items-center gap-3"
              >
                <div className="w-9 h-9 glass-light rounded-lg flex items-center justify-center flex-shrink-0">
                  <item.icon className={`w-4 h-4 ${item.color}`} />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{item.label}</p>
                  <p className="text-xs text-muted">{item.desc}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted ml-auto" />
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
