import { useState, useMemo } from 'react';
import {
  Search, ImageIcon, Video, LayoutGrid, Columns,
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
  onOpenFindMyPhotos: _onOpenFindMyPhotos,
}: MediaGridProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [filter, setFilter] = useState<GalleryFilter>({ sort_by: 'newest' });
  const [layout, setLayout] = useState<'masonry' | 'grid'>('masonry');
  const [searchOpen, setSearchOpen] = useState(false);

  const filtered = useMemo(() => {
    let result = [...media];

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
  }, [media, filter]);

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

  return (
    <div className="space-y-4">

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
          {(filter.album_id || filter.media_type || filter.search_query) && (
            <>
              <p className="text-xs text-white/20">Try clearing your filters</p>
              <button
                onClick={() => {
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
