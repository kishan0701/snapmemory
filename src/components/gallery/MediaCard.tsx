import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, Download, Play, MoreVertical, Trash2, Share2 } from 'lucide-react';
import type { Media } from '@/types';
import { formatFileSize } from '@/lib/utils';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

async function downloadMedia(url: string, filename: string) {
  const toastId = toast.loading('Preparing download...');
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Fetch failed');
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename || 'photo';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
    toast.success('Download started!', { id: toastId });
  } catch {
    // Fallback for CORS-restricted URLs
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || 'photo';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Download started!', { id: toastId });
  }
}

interface MediaCardProps {
  media: Media;
  onClick: () => void;
  canDownload?: boolean;
  canDelete?: boolean;
  onDelete?: (id: string) => void;
  index?: number;
}

export function MediaCard({
  media,
  onClick,
  canDownload = true,
  canDelete = false,
  onDelete,
  index = 0,
}: MediaCardProps) {
  const [isFav, setIsFav] = useState(media.is_favorited ?? false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const isVideo = media.type === 'video';

  useEffect(() => {
    if (!menuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.04, 0.4) }}
      className="masonry-item group relative rounded-xl overflow-hidden cursor-pointer card"
      style={{ aspectRatio: media.width && media.height ? `${media.width}/${media.height}` : undefined }}
    >
      {/* Skeleton */}
      {!imgLoaded && (
        <div className="absolute inset-0 skeleton" style={{ minHeight: 200 }} />
      )}

      {/* Image */}
      <img
        src={media.thumbnail_url ?? media.preview_url ?? media.original_url}
        alt={media.filename}
        loading="lazy"
        onLoad={() => setImgLoaded(true)}
        onClick={onClick}
        className={cn(
          'w-full h-auto object-cover transition-all duration-500',
          imgLoaded ? 'opacity-100' : 'opacity-0',
          'group-hover:scale-[1.02]'
        )}
        style={{ minHeight: imgLoaded ? 'auto' : 200, display: 'block' }}
      />

      {/* Video badge */}
      {isVideo && (
        <div className="absolute inset-0 flex items-center justify-center" onClick={onClick}>
          <div className="w-12 h-12 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center border border-white/20 group-hover:bg-purple-500/80 transition-all">
            <Play className="w-5 h-5 text-white fill-white ml-0.5" />
          </div>
          <div className="absolute bottom-2 right-2 badge badge-purple text-[10px]">
            VIDEO
          </div>
        </div>
      )}

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />

      {/* Action bar - bottom */}
      <div className="absolute bottom-0 left-0 right-0 p-2.5 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-all duration-200 translate-y-2 group-hover:translate-y-0">
        <button
          onClick={(e) => { e.stopPropagation(); setIsFav(f => !f); }}
          className={cn(
            'w-7 h-7 rounded-lg flex items-center justify-center backdrop-blur-sm transition-all',
            isFav ? 'bg-red-500/80 text-white' : 'bg-black/50 text-white/70 hover:text-white'
          )}
          aria-label="Favourite"
        >
          <Heart className="w-3.5 h-3.5" fill={isFav ? 'currentColor' : 'none'} />
        </button>

        <div className="flex items-center gap-1">
          {canDownload && (
            <button
              onClick={e => {
                e.stopPropagation();
                downloadMedia(media.original_url, media.filename);
              }}
              className="w-7 h-7 rounded-lg bg-black/50 backdrop-blur-sm flex items-center justify-center text-white/70 hover:text-white transition-colors"
              aria-label="Download"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
          )}

          {/* More menu */}
          <div ref={menuRef} className="relative">
            <button
              onClick={(e) => { e.stopPropagation(); setMenuOpen(m => !m); }}
              className="w-7 h-7 rounded-lg bg-black/50 backdrop-blur-sm flex items-center justify-center text-white/70 hover:text-white transition-colors"
              aria-label="More options"
            >
              <MoreVertical className="w-3.5 h-3.5" />
            </button>
            {menuOpen && (
              <div className="absolute bottom-8 right-0 glass rounded-lg shadow-xl overflow-hidden w-36 py-1 z-10">
                <button
                  onClick={(e) => { e.stopPropagation(); setMenuOpen(false); }}
                  className="flex items-center gap-2 px-3 py-2 text-xs text-secondary hover:text-white hover:bg-white/6 w-full transition-colors"
                >
                  <Share2 className="w-3 h-3" /> Share
                </button>
                {canDelete && onDelete && (
                  <button
                    onClick={(e) => { e.stopPropagation(); onDelete(media.id); setMenuOpen(false); }}
                    className="flex items-center gap-2 px-3 py-2 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 w-full transition-colors"
                  >
                    <Trash2 className="w-3 h-3" /> Delete
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Top right — size label */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <span className="text-[10px] text-white/60 bg-black/50 backdrop-blur-sm px-1.5 py-0.5 rounded">
          {formatFileSize(media.size)}
        </span>
      </div>
    </motion.div>
  );
}
