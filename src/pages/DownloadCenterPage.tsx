import { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Download, Check, X, FolderOpen, Images,
  CheckSquare, Loader2,
  Image as ImageIcon, Video, FileDown, Info
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { getEventById, getMediaForEvent, getAlbumsForEvent } from '@/lib/mock-data';
import { formatFileSize } from '@/lib/utils';
import type { Media } from '@/types';
import toast from 'react-hot-toast';

type FilterType = 'all' | 'photos' | 'videos';
type GroupBy = 'album' | 'none';

export function DownloadCenterPage() {
  const { id } = useParams<{ id: string }>();
  const event = getEventById(id ?? '');
  const media = getMediaForEvent(id ?? '');
  const albums = getAlbumsForEvent(id ?? '');

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [groupBy, setGroupBy] = useState<GroupBy>('album');
  const [isDownloading, setIsDownloading] = useState(false);
  const [albumFilter, setAlbumFilter] = useState('');

  const filtered = useMemo(() => {
    return media.filter(m => {
      if (filterType === 'photos' && m.type !== 'photo') return false;
      if (filterType === 'videos' && m.type !== 'video') return false;
      if (albumFilter && m.album_id !== albumFilter) return false;
      return true;
    });
  }, [media, filterType, albumFilter]);

  // Group by album
  const grouped = useMemo(() => {
    if (groupBy === 'none') return [{ albumName: 'All Media', items: filtered }];
    const map = new Map<string, { albumName: string; items: Media[] }>();
    filtered.forEach(m => {
      const album = albums.find(a => a.id === m.album_id);
      const key = album?.id ?? 'unsorted';
      const name = album?.name ?? 'Unsorted';
      if (!map.has(key)) map.set(key, { albumName: name, items: [] });
      map.get(key)!.items.push(m);
    });
    return Array.from(map.values());
  }, [filtered, albums, groupBy]);

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

  if (!event.allow_downloads) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <Navbar />
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
          <Download className="w-8 h-8 text-red-400" />
        </div>
        <h1 className="text-xl font-bold text-white">Downloads Disabled</h1>
        <p className="text-secondary text-sm">The event organizer has disabled downloads for this event.</p>
        <Link to={`/event/${id}`} className="btn-secondary">
          <ArrowLeft className="w-4 h-4" /> Back to Gallery
        </Link>
      </div>
    );
  }

  const toggleItem = (mediaId: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(mediaId)) next.delete(mediaId);
      else next.add(mediaId);
      return next;
    });
  };

  const selectAll = () => setSelected(new Set(filtered.map(m => m.id)));
  const deselectAll = () => setSelected(new Set());
  const selectGroup = (items: Media[]) => {
    setSelected(prev => {
      const next = new Set(prev);
      items.forEach(m => next.add(m.id));
      return next;
    });
  };

  const handleDownload = async () => {
    if (selected.size === 0) { toast.error('Select at least one item'); return; }
    setIsDownloading(true);
    await new Promise(r => setTimeout(r, 1200));

    // Trigger individual downloads (browser limitation — real ZIP would use a backend)
    const toDownload = filtered.filter(m => selected.has(m.id));
    toDownload.forEach((m, i) => {
      setTimeout(() => {
        const a = document.createElement('a');
        a.href = m.original_url;
        a.download = m.filename;
        a.target = '_blank';
        a.click();
      }, i * 300);
    });

    toast.success(`Downloading ${selected.size} file${selected.size > 1 ? 's' : ''}!`);
    setIsDownloading(false);
  };

  const totalSize = filtered
    .filter(m => selected.has(m.id))
    .reduce((sum, m) => sum + m.size, 0);

  const allSelected = filtered.length > 0 && filtered.every(m => selected.has(m.id));

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-16">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Link
              to={`/event/${id}`}
              className="w-9 h-9 glass-light rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 text-secondary" />
            </Link>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white">Download Center</h1>
              <p className="text-sm text-muted">{event.title}</p>
            </div>
          </div>

          {/* Download action */}
          <div className="flex items-center gap-2">
            {selected.size > 0 && (
              <div className="text-xs text-muted">
                {selected.size} selected · {formatFileSize(totalSize)}
              </div>
            )}
            <button
              id="download-center-download-btn"
              onClick={handleDownload}
              disabled={selected.size === 0 || isDownloading}
              className="btn-primary disabled:opacity-50"
            >
              {isDownloading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Downloading...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Download {selected.size > 0 ? `(${selected.size})` : ''}
                </>
              )}
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mb-6">
          {[
            { label: 'Total Photos', value: event.photo_count ?? 0, icon: ImageIcon, color: 'text-purple-400' },
            { label: 'Total Videos', value: event.video_count ?? 0, icon: Video, color: 'text-blue-400' },
            { label: 'Albums', value: albums.length, icon: FolderOpen, color: 'text-amber-400' },
            { label: 'Selected', value: selected.size, icon: Check, color: 'text-green-400' },
            { label: 'Downloads', value: event.download_count ?? 0, icon: FileDown, color: 'text-pink-400' },
          ].map(s => (
            <div key={s.label} className="card p-3 text-center">
              <s.icon className={`w-4 h-4 ${s.color} mx-auto mb-1`} />
              <p className="text-base font-bold text-white">{s.value}</p>
              <p className="text-[10px] text-muted">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          {/* Select all */}
          <button
            id="download-center-select-all-btn"
            onClick={allSelected ? deselectAll : selectAll}
            className="btn-ghost border border-purple-900/30 text-sm"
          >
            {allSelected
              ? <><X className="w-3.5 h-3.5" /> Deselect All</>
              : <><CheckSquare className="w-3.5 h-3.5" /> Select All</>
            }
          </button>

          {/* Type filter */}
          <div className="flex items-center gap-1 glass-light rounded-lg p-1">
            {[
              { value: 'all' as FilterType, label: 'All' },
              { value: 'photos' as FilterType, label: 'Photos' },
              { value: 'videos' as FilterType, label: 'Videos' },
            ].map(f => (
              <button
                key={f.value}
                onClick={() => setFilterType(f.value)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  filterType === f.value ? 'bg-purple-600 text-white' : 'text-secondary hover:text-white'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Album filter */}
          <select
            id="download-center-album-filter"
            value={albumFilter}
            onChange={e => setAlbumFilter(e.target.value)}
            className="input-field sm:w-44 cursor-pointer"
          >
            <option value="">All Albums</option>
            {albums.map(a => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>

          {/* Group by */}
          <div className="flex items-center gap-1 glass-light rounded-lg p-1 ml-auto">
            <span className="text-xs text-muted px-2">Group:</span>
            {[
              { value: 'album' as GroupBy, label: 'Album' },
              { value: 'none' as GroupBy, label: 'None' },
            ].map(g => (
              <button
                key={g.value}
                onClick={() => setGroupBy(g.value)}
                className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-all ${
                  groupBy === g.value ? 'bg-purple-600 text-white' : 'text-secondary hover:text-white'
                }`}
              >
                {g.label}
              </button>
            ))}
          </div>
        </div>

        {/* Info bar */}
        {selected.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 mb-4 text-sm"
          >
            <Info className="w-4 h-4 text-purple-400 flex-shrink-0" />
            <p className="text-secondary">
              <span className="text-white font-medium">{selected.size} item{selected.size > 1 ? 's' : ''}</span> selected
              {' '}({formatFileSize(totalSize)}). Files will open in new tabs for download.
            </p>
            <button
              onClick={deselectAll}
              className="ml-auto text-xs text-muted hover:text-white transition-colors flex items-center gap-1"
            >
              <X className="w-3 h-3" /> Clear
            </button>
          </motion.div>
        )}

        {/* Media groups */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-2xl gradient-brand-subtle border border-purple-500/20 flex items-center justify-center mb-4">
              <Images className="w-8 h-8 text-purple-400" />
            </div>
            <h3 className="text-base font-semibold text-white mb-2">No media found</h3>
            <p className="text-sm text-secondary">Try adjusting your filters.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {grouped.map(group => (
              <section key={group.albumName}>
                {/* Group header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <FolderOpen className="w-4 h-4 text-purple-400" />
                    <h2 className="text-sm font-semibold text-white">{group.albumName}</h2>
                    <span className="badge badge-purple text-[10px]">{group.items.length}</span>
                  </div>
                  <button
                    onClick={() => selectGroup(group.items)}
                    className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
                  >
                    Select all in album
                  </button>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
                  {group.items.map((m, i) => {
                    const isSelected = selected.has(m.id);
                    return (
                      <motion.div
                        key={m.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.02 }}
                        className={`relative aspect-square rounded-xl overflow-hidden cursor-pointer group border-2 transition-all ${
                          isSelected
                            ? 'border-purple-500 scale-[0.97]'
                            : 'border-transparent hover:border-purple-500/40'
                        }`}
                        onClick={() => toggleItem(m.id)}
                      >
                        <img
                          src={m.thumbnail_url ?? m.preview_url}
                          alt={m.filename}
                          loading="lazy"
                          className="w-full h-full object-cover"
                        />

                        {/* Overlay */}
                        <div className={`absolute inset-0 transition-all ${
                          isSelected ? 'bg-purple-500/25' : 'bg-transparent group-hover:bg-black/30'
                        }`} />

                        {/* Checkbox */}
                        <div className="absolute top-2 left-2">
                          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                            isSelected
                              ? 'bg-purple-600 border-purple-500'
                              : 'border-white/60 bg-black/40 opacity-0 group-hover:opacity-100'
                          }`}>
                            {isSelected && <Check className="w-3 h-3 text-white" />}
                          </div>
                        </div>

                        {/* Video badge */}
                        {m.type === 'video' && (
                          <div className="absolute top-2 right-2">
                            <span className="badge badge-blue text-[9px]">
                              <Video className="w-2 h-2" /> Video
                            </span>
                          </div>
                        )}

                        {/* File size on hover */}
                        <div className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <p className="text-[10px] text-white/80 truncate">{formatFileSize(m.size)}</p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        )}

        {/* Download sticky bar (mobile) */}
        <AnimatePresence>
          {selected.size > 0 && (
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="fixed bottom-0 left-0 right-0 p-4 glass border-t border-purple-900/20 sm:hidden"
            >
              <button
                onClick={handleDownload}
                disabled={isDownloading}
                className="btn-primary w-full justify-center py-3 disabled:opacity-60"
              >
                {isDownloading
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Downloading...</>
                  : <><Download className="w-4 h-4" /> Download {selected.size} item{selected.size > 1 ? 's' : ''}</>
                }
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
