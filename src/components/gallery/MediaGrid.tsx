import { useState, useMemo } from 'react';
import { Search, SlidersHorizontal, ImageIcon, Video, LayoutGrid, Columns } from 'lucide-react';
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
}

const SKELETONS = Array.from({ length: 12 });

export function MediaGrid({
  media,
  albums = [],
  canDownload = true,
  canDelete = false,
  onDelete,
  isLoading = false,
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
                placeholder="Search photos..."
                value={filter.search_query ?? ''}
                onChange={e => setFilter(f => ({ ...f, search_query: e.target.value || undefined }))}
                onBlur={() => { if (!filter.search_query) setSearchOpen(false); }}
                className="w-full pl-8 pr-3 py-1.5 rounded-full text-xs text-white placeholder:text-white/30 outline-none transition-all"
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(124,58,237,0.3)' }}
              />
            </div>
          ) : (
            <button
              onClick={() => setSearchOpen(true)}
              className="p-2 rounded-full transition-all hover:text-white text-white/50"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
              title="Search"
            >
              <Search className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Sort */}
        <select
          id="gallery-sort"
          value={filter.sort_by}
          onChange={e => setFilter(f => ({ ...f, sort_by: e.target.value as GalleryFilter['sort_by'] }))}
          className="text-xs text-white/60 rounded-full px-2.5 py-1.5 cursor-pointer outline-none transition-all hover:text-white appearance-none"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <option value="newest" className="bg-[#151228]">Newest</option>
          <option value="oldest" className="bg-[#151228]">Oldest</option>
          <option value="popular" className="bg-[#151228]">Popular</option>
        </select>

        {/* Layout toggle + filter icon */}
        <div className="flex items-center gap-1 rounded-full p-1" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <button
            onClick={() => setLayout('masonry')}
            className={cn('p-1.5 rounded-full transition-all', layout === 'masonry' ? 'bg-purple-600 text-white' : 'text-white/40 hover:text-white')}
            aria-label="Masonry layout"
          >
            <Columns className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setLayout('grid')}
            className={cn('p-1.5 rounded-full transition-all', layout === 'grid' ? 'bg-purple-600 text-white' : 'text-white/40 hover:text-white')}
            aria-label="Grid layout"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
          </button>
        </div>

        <button
          className="p-2 rounded-full text-white/40 hover:text-white transition-all"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
          title="Filters"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Count */}
      <p className="text-xs text-white/30">
        {isLoading ? 'Loading...' : `${filtered.length} items`}
      </p>

      {/* ─── Grid ───────────────────────────────────────────────── */}
      {isLoading ? (
        <div className="masonry-grid">
          {SKELETONS.map((_, i) => (
            <div
              key={i}
              className="masonry-item skeleton rounded-xl"
              style={{ height: [200, 280, 240, 320, 180, 260][i % 6] }}
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          {media.length === 0 ? (
            <>
              <div className="relative mb-6">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-purple-600/25 to-indigo-600/20 border border-purple-500/25 flex items-center justify-center shadow-xl shadow-purple-500/10">
                  <ImageIcon className="w-9 h-9 text-purple-400" />
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center shadow">
                  <span className="text-[11px] font-bold text-white">0</span>
                </div>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">No photos yet</h3>
              <p className="text-sm text-white/50 max-w-xs mb-6 leading-relaxed">
                This event gallery is empty. Switch to the{' '}
                <span className="text-purple-400 font-medium">Upload</span> tab to add your first photos and videos!
              </p>
              <div className="flex items-center gap-2 text-xs text-white/30 px-4 py-2 rounded-full" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <Video className="w-3.5 h-3.5 text-purple-400" />
                Supports photos, videos up to 500MB each
              </div>
            </>
          ) : (
            <>
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)' }}>
                <ImageIcon className="w-8 h-8 text-purple-400" />
              </div>
              <h3 className="text-base font-semibold text-white mb-2">No results</h3>
              <p className="text-sm text-white/50 max-w-xs">
                {filter.search_query
                  ? `No photos match "${filter.search_query}". Try a different search.`
                  : 'No photos match the selected filters.'}
              </p>
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
