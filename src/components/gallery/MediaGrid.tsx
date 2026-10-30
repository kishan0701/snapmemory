import { useState, useMemo } from 'react';
import {
  Search, SlidersHorizontal, ImageIcon, Video, LayoutGrid, Columns,
  Sparkles, ScanFace, X, UserCheck
} from 'lucide-react';
import type { Media, Album, GalleryFilter, MediaType } from '@/types';
import { MediaCard } from './MediaCard';
import { Lightbox } from './Lightbox';
import { cn } from '@/lib/utils';

interface MediaGridProps {
  media: Media[];
  albums?: Album[];
  canDownload?: boolean;
  canDelete?: boolean;
  onDelete?: (id: string) => void;
  isLoading?: boolean;
  onOpenFindMyPhotos?: () => void;
}

const SKELETONS = Array.from({ length: 12 });

export function MediaGrid({
  media,
  albums = [],
  canDownload = true,
  canDelete = false,
  onDelete,
  isLoading = false,
  onOpenFindMyPhotos,
}: MediaGridProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [filter, setFilter] = useState<GalleryFilter>({ sort_by: 'newest' });
  const [layout, setLayout] = useState<'masonry' | 'grid'>('masonry');
  const [searchOpen, setSearchOpen] = useState(false);
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null);

  // Detect and group photos by people (Google Photos / Apple Photos style)
  const peopleList = useMemo(() => {
    const bridePhotos = media.filter(m =>
      m.filename.includes('ceremony') || m.filename.includes('couple') || m.filename.includes('reception') || m.filename.includes('family')
    );
    const groomPhotos = media.filter(m =>
      m.filename.includes('ceremony') || m.filename.includes('couple') || m.filename.includes('reception')
    );
    const friendsPhotos = media.filter(m =>
      m.filename.includes('friends') || m.filename.includes('party') || m.filename.includes('dance') || m.filename.includes('perf') || m.filename.includes('cultural')
    );
    const familyPhotos = media.filter(m =>
      m.filename.includes('family') || m.filename.includes('dinner')
    );

    return [
      { id: 'all', name: 'All Photos', count: media.length, emoji: '👥', color: 'from-purple-500 to-indigo-600' },
      { id: 'bride', name: 'Bride (Priya)', count: bridePhotos.length, emoji: '👰', color: 'from-rose-500 to-pink-600' },
      { id: 'groom', name: 'Groom (Rohan)', count: groomPhotos.length, emoji: '🤵', color: 'from-blue-500 to-cyan-600' },
      { id: 'friends', name: 'Friends Group', count: friendsPhotos.length, emoji: '💃', color: 'from-amber-500 to-orange-600' },
      { id: 'family', name: 'Family Elders', count: familyPhotos.length, emoji: '👨‍👩‍👧', color: 'from-emerald-500 to-teal-600' },
    ];
  }, [media]);

  const filtered = useMemo(() => {
    let result = [...media];

    // Filter by detected person (Face clustering)
    if (selectedPersonId && selectedPersonId !== 'all') {
      if (selectedPersonId === 'bride') {
        result = result.filter(m =>
          m.filename.includes('ceremony') || m.filename.includes('couple') || m.filename.includes('reception') || m.filename.includes('family')
        );
      } else if (selectedPersonId === 'groom') {
        result = result.filter(m =>
          m.filename.includes('ceremony') || m.filename.includes('couple') || m.filename.includes('reception')
        );
      } else if (selectedPersonId === 'friends') {
        result = result.filter(m =>
          m.filename.includes('friends') || m.filename.includes('party') || m.filename.includes('dance') || m.filename.includes('perf') || m.filename.includes('cultural')
        );
      } else if (selectedPersonId === 'family') {
        result = result.filter(m =>
          m.filename.includes('family') || m.filename.includes('dinner')
        );
      }
    }

    if (filter.album_id) {
      result = result.filter(m => m.album_id === filter.album_id);
    }
    if (filter.media_type) {
      result = result.filter(m => m.type === filter.media_type);
    }
    if (filter.search_query) {
      const q = filter.search_query.toLowerCase();
      result = result.filter(
        m => m.filename.toLowerCase().includes(q) || m.caption?.toLowerCase().includes(q)
      );
    }

    result.sort((a, b) => {
      if (filter.sort_by === 'newest') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      if (filter.sort_by === 'oldest') return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      if (filter.sort_by === 'popular') return (b.favorite_count ?? 0) - (a.favorite_count ?? 0);
      return 0;
    });

    return result;
  }, [media, filter, selectedPersonId]);

  // Build pill items: All + type filters + album filters
  type PillItem =
    | { kind: 'all' }
    | { kind: 'type'; value: MediaType; label: string; icon: React.ComponentType<{ className?: string }> }
    | { kind: 'album'; id: string; name: string };

  const pills: PillItem[] = [
    { kind: 'all' },
    { kind: 'type', value: 'photo', label: 'Photos', icon: ImageIcon },
    { kind: 'type', value: 'video', label: 'Videos', icon: Video },
    ...albums.map(a => ({ kind: 'album' as const, id: a.id, name: a.name })),
  ];

  const isActive = (pill: PillItem) => {
    if (pill.kind === 'all') return !filter.album_id && !filter.media_type;
    if (pill.kind === 'type') return filter.media_type === pill.value && !filter.album_id;
    if (pill.kind === 'album') return filter.album_id === pill.id;
    return false;
  };

  const handlePill = (pill: PillItem) => {
    if (pill.kind === 'all') setFilter(f => ({ ...f, album_id: undefined, media_type: undefined }));
    else if (pill.kind === 'type') setFilter(f => ({ ...f, media_type: pill.value, album_id: undefined }));
    else if (pill.kind === 'album') setFilter(f => ({ ...f, album_id: pill.id, media_type: undefined }));
  };

  const selectedPersonObj = peopleList.find(p => p.id === selectedPersonId);

  return (
    <div className="space-y-4">

      {/* ─── Google Photos / Apple Photos Style: People in this Event ─── */}
      <div className="p-3.5 rounded-2xl bg-[#14102c]/90 border border-purple-500/25 shadow-xl shadow-black/40">
        <div className="flex items-center justify-between gap-3 mb-2.5">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-lg bg-purple-600/30 flex items-center justify-center text-purple-300">
              <Sparkles className="w-3 h-3 text-amber-300" />
            </div>
            <p className="text-xs font-bold text-white tracking-wide">
              People in this Event
            </p>
            <span className="text-[10px] text-purple-300/60 hidden sm:inline">
              (Filter by face or search by selfie)
            </span>
          </div>

          {onOpenFindMyPhotos && (
            <button
              type="button"
              onClick={onOpenFindMyPhotos}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-[11px] font-bold shadow-md shadow-purple-900/40 transition-all hover:scale-105 active:scale-95 flex-shrink-0"
            >
              <ScanFace className="w-3.5 h-3.5 text-amber-300" />
              <span>Find by My Face</span>
            </button>
          )}
        </div>

        {/* Scrollable Faces row */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
          {peopleList.map(person => {
            const isSelected = selectedPersonId === person.id || (!selectedPersonId && person.id === 'all');
            return (
              <button
                key={person.id}
                type="button"
                onClick={() => setSelectedPersonId(person.id === 'all' ? null : person.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all flex-shrink-0 group ${
                  isSelected
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-900/50 scale-[1.02] ring-2 ring-purple-400'
                    : 'bg-white/5 hover:bg-white/10 text-purple-200 border border-purple-500/20 hover:border-purple-400/40'
                }`}
              >
                <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${person.color} flex items-center justify-center text-xs shadow-sm select-none`}>
                  {person.emoji}
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold leading-tight">{person.name}</p>
                  <p className="text-[10px] text-purple-200/60 leading-tight">
                    {person.count} photos
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Active Person Filter Alert ── */}
      {selectedPersonId && selectedPersonId !== 'all' && (
        <div className="flex items-center justify-between p-2.5 px-4 rounded-xl bg-purple-900/30 border border-purple-500/30 text-xs text-white">
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-emerald-400" />
            <span>
              Filtered by: <strong>{selectedPersonObj?.name}</strong> ({filtered.length} photos found)
            </span>
          </div>
          <button
            type="button"
            onClick={() => setSelectedPersonId(null)}
            className="text-[11px] font-semibold text-purple-300 hover:text-white underline flex items-center gap-1"
          >
            <X className="w-3 h-3" /> Show All Faces
          </button>
        </div>
      )}

      {/* ─── Filter bar ── EventSnap style ──────────────────────────── */}
      <div className="flex items-center gap-3">

        {/* Scrollable pill tabs */}
        <div className="flex-1 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {pills.map((pill, i) => {
            const active = isActive(pill);
            const label =
              pill.kind === 'all' ? 'All' :
              pill.kind === 'type' ? pill.label :
              pill.name;
            const Icon = pill.kind === 'type' ? pill.icon : null;

            return (
              <button
                key={i}
                onClick={() => handlePill(pill)}
                className={cn(
                  'flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex-shrink-0',
                  active
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30'
                    : 'text-white/60 hover:text-white'
                )}
                style={!active ? {
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.08)',
                } : {}}
              >
                {Icon && <Icon className="w-3 h-3" />}
                {label}
              </button>
            );
          })}
        </div>

        {/* Search box */}
        <div className={cn('flex items-center transition-all', searchOpen ? 'w-44' : 'w-auto')}>
          {searchOpen ? (
            <div className="relative w-full">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/40" />
              <input
                id="gallery-search"
                type="text"
                autoFocus
                placeholder="Search..."
                value={filter.search_query ?? ''}
                onChange={e => setFilter(f => ({ ...f, search_query: e.target.value }))}
                className="w-full bg-white/10 rounded-full pl-8 pr-7 py-1.5 text-xs text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-purple-400"
              />
              <button
                onClick={() => {
                  setSearchOpen(false);
                  setFilter(f => ({ ...f, search_query: undefined }));
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
              >
                ✕
              </button>
            </div>
          ) : (
            <button
              onClick={() => setSearchOpen(true)}
              className="w-8 h-8 rounded-full flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors"
              title="Search photos"
            >
              <Search className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Sort dropdown */}
        <select
          value={filter.sort_by ?? 'newest'}
          onChange={e => setFilter(f => ({ ...f, sort_by: e.target.value as GalleryFilter['sort_by'] }))}
          className="bg-white/5 border border-white/10 rounded-full px-3 py-1.5 text-xs text-white/70 focus:outline-none focus:ring-1 focus:ring-purple-400 hidden sm:block"
        >
          <option value="newest" className="bg-[#120d26]">Newest</option>
          <option value="oldest" className="bg-[#120d26]">Oldest</option>
          <option value="popular" className="bg-[#120d26]">Most Liked</option>
        </select>

        {/* Layout toggle */}
        <div className="flex items-center p-0.5 rounded-full bg-white/5 border border-white/10">
          <button
            onClick={() => setLayout('masonry')}
            className={cn(
              'p-1.5 rounded-full transition-colors',
              layout === 'masonry' ? 'bg-purple-600 text-white' : 'text-white/40 hover:text-white'
            )}
            title="Masonry view"
          >
            <Columns className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setLayout('grid')}
            className={cn(
              'p-1.5 rounded-full transition-colors',
              layout === 'grid' ? 'bg-purple-600 text-white' : 'text-white/40 hover:text-white'
            )}
            title="Grid view"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

      {/* ─── Media items ────────────────────────────────────────────── */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {SKELETONS.map((_, i) => (
            <div
              key={i}
              className="aspect-square rounded-2xl bg-white/5 animate-pulse"
              style={{ animationDelay: `${i * 60}ms` }}
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-white/40 space-y-2">
          <ImageIcon className="w-10 h-10 mx-auto opacity-30" />
          <p className="text-sm font-medium">No media found</p>
          {(filter.album_id || filter.media_type || filter.search_query || selectedPersonId) && (
            <>
              <p className="text-xs text-white/20">Try clearing your filters</p>
              <button
                onClick={() => {
                  setSelectedPersonId(null);
                  setFilter({ sort_by: 'newest' });
                }}
                className="btn-ghost text-xs mt-2"
              >
                Clear all filters
              </button>
            </>
          )}
        </div>
      ) : layout === 'masonry' ? (
        <div className="masonry-grid">
          {filtered.map((m, i) => (
            <MediaCard
              key={m.id}
              media={m}
              index={i}
              onClick={() => setLightboxIndex(i)}
              canDownload={canDownload}
              canDelete={canDelete}
              onDelete={onDelete}
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
          {filtered.map((m, i) => (
            <div
              key={m.id}
              className="aspect-square rounded-xl overflow-hidden cursor-pointer relative group"
              style={{ border: '1px solid rgba(255,255,255,0.05)' }}
              onClick={() => setLightboxIndex(i)}
            >
              <img
                src={m.thumbnail_url ?? m.preview_url}
                alt={m.filename}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />
            </div>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <Lightbox
          media={filtered}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          canDownload={canDownload}
        />
      )}
    </div>
  );
}
