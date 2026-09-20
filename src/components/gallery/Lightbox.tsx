import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, ChevronLeft, ChevronRight, Download, Heart,
  Share2, Info, ZoomIn, ZoomOut
} from 'lucide-react';
import type { Media } from '@/types';
import { formatFileSize, formatDate, copyToClipboard } from '@/lib/utils';
import toast from 'react-hot-toast';

interface LightboxProps {
  media: Media[];
  initialIndex: number;
  onClose: () => void;
  canDownload?: boolean;
}

export function Lightbox({ media, initialIndex, onClose, canDownload = true }: LightboxProps) {
  const [index, setIndex] = useState(initialIndex);
  const [showInfo, setShowInfo] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [isFav, setIsFav] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const current = media[index];

  // Reset zoom and sync fav when active item changes
  useEffect(() => {
    setIsZoomed(false);
    setIsFav(current?.is_favorited ?? false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  const goNext = useCallback(() => {
    setIndex(i => (i + 1) % media.length);
  }, [media.length]);

  const goPrev = useCallback(() => {
    setIndex(i => (i - 1 + media.length) % media.length);
  }, [media.length]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose, goNext, goPrev]);

  // Prevent body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const handleDownload = async () => {
    if (!canDownload) { toast.error('Downloads are disabled for this event'); return; }
    const toastId = toast.loading('Preparing download...');
    try {
      const response = await fetch(current.original_url);
      if (!response.ok) throw new Error('Network response was not ok');
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = current.filename || 'photo';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
      toast.success('Download started!', { id: toastId });
    } catch {
      // Fallback: open in new tab if fetch fails (e.g. CORS)
      const link = document.createElement('a');
      link.href = current.original_url;
      link.download = current.filename || 'photo';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Download started!', { id: toastId });
    }
  };

  const handleShare = async () => {
    const url = current.original_url;
    if (navigator.share) {
      await navigator.share({ title: current.filename, url });
    } else {
      await copyToClipboard(url);
      toast.success('Link copied to clipboard');
    }
  };

  if (!current) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex flex-col"
        style={{ background: 'rgba(8, 6, 18, 0.97)' }}
        role="dialog"
        aria-modal="true"
        aria-label="Media viewer"
      >
        {/* Top bar */}
        <div className="flex items-center justify-between px-4 py-3 glass border-b border-white/5 flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              id="lightbox-close-btn"
              onClick={onClose}
              className="w-8 h-8 rounded-lg glass-light flex items-center justify-center hover:bg-white/10 transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4 text-white" />
            </button>
            <span className="text-sm text-secondary">
              {index + 1} / {media.length}
            </span>
          </div>

          <p className="text-sm font-medium text-white truncate max-w-xs hidden sm:block">
            {current.filename}
          </p>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsFav(f => !f)}
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                isFav ? 'bg-red-500/20 text-red-400' : 'glass-light text-secondary hover:text-white'
              }`}
              aria-label="Favourite"
            >
              <Heart className="w-4 h-4" fill={isFav ? 'currentColor' : 'none'} />
            </button>
            <button
              onClick={handleShare}
              className="w-8 h-8 rounded-lg glass-light flex items-center justify-center hover:bg-white/10 transition-colors text-secondary hover:text-white"
              aria-label="Share"
            >
              <Share2 className="w-4 h-4" />
            </button>
            {canDownload && (
              <button
                id="lightbox-download-btn"
                onClick={handleDownload}
                className="w-8 h-8 rounded-lg glass-light flex items-center justify-center hover:bg-white/10 transition-colors text-secondary hover:text-white"
                aria-label="Download"
              >
                <Download className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => setIsZoomed(z => !z)}
              className="w-8 h-8 rounded-lg glass-light items-center justify-center hover:bg-white/10 transition-colors text-secondary hover:text-white hidden sm:flex"
              aria-label="Toggle zoom"
            >
              {isZoomed ? <ZoomOut className="w-4 h-4" /> : <ZoomIn className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setShowInfo(s => !s)}
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                showInfo ? 'bg-purple-500/20 text-purple-400' : 'glass-light text-secondary hover:text-white'
              }`}
              aria-label="Info"
            >
              <Info className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Main viewer */}
        <div className="flex-1 flex overflow-hidden relative">
          {/* Prev button */}
          {media.length > 1 && (
            <button
              id="lightbox-prev-btn"
              onClick={goPrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 glass rounded-full flex items-center justify-center hover:bg-white/15 transition-colors"
              aria-label="Previous photo"
            >
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>
          )}

          {/* Image */}
          <div className="flex-1 flex items-center justify-center p-4 overflow-auto">
            <AnimatePresence mode="wait">
              <motion.img
                key={current.id}
                ref={imgRef}
                src={current.preview_url ?? current.original_url}
                alt={current.filename}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.2 }}
                className={`max-h-full object-contain rounded-lg cursor-pointer transition-transform duration-300 ${
                  isZoomed ? 'scale-150 cursor-zoom-out' : 'cursor-zoom-in'
                }`}
                style={{ maxWidth: isZoomed ? '150%' : '100%' }}
                onClick={() => setIsZoomed(z => !z)}
                draggable={false}
              />
            </AnimatePresence>
          </div>

          {/* Next button */}
          {media.length > 1 && (
            <button
              id="lightbox-next-btn"
              onClick={goNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 glass rounded-full flex items-center justify-center hover:bg-white/15 transition-colors"
              aria-label="Next photo"
            >
              <ChevronRight className="w-5 h-5 text-white" />
            </button>
          )}

          {/* Info panel */}
          <AnimatePresence>
            {showInfo && (
              <motion.div
                initial={{ x: 300, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 300, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="w-72 glass border-l border-white/5 p-5 flex-shrink-0 overflow-y-auto"
              >
                <h3 className="text-sm font-semibold text-white mb-4">Media Info</h3>
                <div className="space-y-3">
                  <InfoRow label="Filename" value={current.filename} />
                  <InfoRow label="Type" value={current.type === 'photo' ? '📷 Photo' : '🎥 Video'} />
                  <InfoRow label="Size" value={formatFileSize(current.size)} />
                  {current.width && current.height && (
                    <InfoRow label="Dimensions" value={`${current.width} × ${current.height}`} />
                  )}
                  <InfoRow label="Uploaded" value={formatDate(current.created_at)} />
                  {current.uploader && (
                    <InfoRow label="By" value={current.uploader.name} />
                  )}
                  {current.caption && (
                    <InfoRow label="Caption" value={current.caption} />
                  )}
                  <InfoRow label="Downloads" value={String(current.download_count ?? 0)} />
                  <InfoRow label="Favourites" value={String(current.favorite_count ?? 0)} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Thumbnail strip */}
        {media.length > 1 && (
          <div className="flex-shrink-0 glass border-t border-white/5 px-4 py-2 flex gap-2 overflow-x-auto">
            {media.map((m, i) => (
              <button
                key={m.id}
                onClick={() => setIndex(i)}
                className={`flex-shrink-0 w-12 h-12 rounded-md overflow-hidden transition-all ${
                  i === index
                    ? 'ring-2 ring-purple-500 opacity-100'
                    : 'opacity-40 hover:opacity-70'
                }`}
              >
                <img
                  src={m.thumbnail_url ?? m.preview_url}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] text-muted uppercase tracking-wider mb-0.5">{label}</p>
      <p className="text-sm text-white break-all">{value}</p>
    </div>
  );
}
