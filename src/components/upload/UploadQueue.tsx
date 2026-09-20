import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Check, AlertCircle, Loader2, Image as ImageIcon,
  Video, Upload, Trash2, RefreshCw
} from 'lucide-react';
import type { UploadQueueItem } from '@/types';
import { formatFileSize } from '@/lib/utils';

interface UploadQueueProps {
  items: UploadQueueItem[];
  onRemove: (id: string) => void;
  onRetry: (id: string) => void;
  onClearCompleted: () => void;
}

const STATUS_CONFIG = {
  waiting: { icon: Upload, color: 'text-muted', label: 'Waiting' },
  uploading: { icon: Loader2, color: 'text-blue-400', label: 'Uploading' },
  processing: { icon: Loader2, color: 'text-amber-400', label: 'Processing' },
  completed: { icon: Check, color: 'text-green-400', label: 'Done' },
  failed: { icon: AlertCircle, color: 'text-red-400', label: 'Failed' },
  cancelled: { icon: X, color: 'text-muted', label: 'Cancelled' },
};

function QueueItem({
  item,
  onRemove,
  onRetry,
}: {
  item: UploadQueueItem;
  onRemove: (id: string) => void;
  onRetry: (id: string) => void;
}) {
  const cfg = STATUS_CONFIG[item.status];
  const Icon = cfg.icon;
  const isVideo = item.file.type.startsWith('video/');
  const isActive = item.status === 'uploading' || item.status === 'processing';
  const isCompleted = item.status === 'completed';
  const isFailed = item.status === 'failed' || item.status === 'cancelled';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
        isCompleted
          ? 'border-green-500/15 bg-green-500/5'
          : isFailed
          ? 'border-red-500/15 bg-red-500/5'
          : 'border-purple-900/20 bg-surface-800/60'
      }`}
    >
      {/* Preview / icon */}
      <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-surface-700 flex items-center justify-center">
        {item.preview_url ? (
          <img
            src={item.preview_url}
            alt=""
            className="w-full h-full object-cover"
          />
        ) : isVideo ? (
          <Video className="w-5 h-5 text-muted" />
        ) : (
          <ImageIcon className="w-5 h-5 text-muted" />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white truncate">{item.file.name}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-muted">{formatFileSize(item.file.size)}</span>
          {item.album_id && (
            <span className="text-xs text-purple-400">→ Album</span>
          )}
        </div>

        {/* Progress bar */}
        {isActive && (
          <div className="mt-1.5 h-1 bg-surface-600 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-purple-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${item.progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        )}

        {/* Error message */}
        {item.error && (
          <p className="text-xs text-red-400 mt-0.5 truncate">{item.error}</p>
        )}
      </div>

      {/* Status + actions */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <div className={`flex items-center gap-1 text-xs font-medium ${cfg.color}`}>
          <Icon className={`w-3.5 h-3.5 ${isActive ? 'animate-spin' : ''}`} />
          <span className="hidden sm:block">{cfg.label}</span>
          {isActive && (
            <span className="text-xs text-muted">{item.progress}%</span>
          )}
        </div>

        {isFailed && (
          <button
            onClick={() => onRetry(item.id)}
            className="w-7 h-7 rounded-md glass-light flex items-center justify-center hover:bg-white/10 transition-colors"
            aria-label="Retry"
          >
            <RefreshCw className="w-3 h-3 text-secondary" />
          </button>
        )}

        {!isActive && (
          <button
            onClick={() => onRemove(item.id)}
            className="w-7 h-7 rounded-md glass-light flex items-center justify-center hover:bg-white/10 transition-colors"
            aria-label="Remove"
          >
            <X className="w-3 h-3 text-secondary" />
          </button>
        )}
      </div>
    </motion.div>
  );
}

export function UploadQueue({ items, onRemove, onRetry, onClearCompleted }: UploadQueueProps) {
  const completedCount = items.filter(i => i.status === 'completed').length;
  const failedCount = items.filter(i => i.status === 'failed').length;
  const activeCount = items.filter(i => i.status === 'uploading' || i.status === 'processing').length;
  const totalProgress = items.length > 0
    ? Math.round(items.reduce((sum, i) => sum + i.progress, 0) / items.length)
    : 0;

  if (items.length === 0) return null;

  return (
    <div className="mt-5 space-y-3">
      {/* Summary bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <p className="text-sm font-medium text-white">
            Upload Queue
          </p>
          <div className="flex items-center gap-1.5">
            {activeCount > 0 && (
              <span className="badge badge-blue text-[10px]">
                <Loader2 className="w-2.5 h-2.5 animate-spin" />
                {activeCount} uploading
              </span>
            )}
            {completedCount > 0 && (
              <span className="badge badge-green text-[10px]">
                <Check className="w-2.5 h-2.5" />
                {completedCount} done
              </span>
            )}
            {failedCount > 0 && (
              <span className="badge badge-red text-[10px]">
                <AlertCircle className="w-2.5 h-2.5" />
                {failedCount} failed
              </span>
            )}
          </div>
        </div>

        {completedCount > 0 && (
          <button
            onClick={onClearCompleted}
            className="text-xs text-muted hover:text-secondary transition-colors flex items-center gap-1"
          >
            <Trash2 className="w-3 h-3" />
            Clear done
          </button>
        )}
      </div>

      {/* Overall progress */}
      {activeCount > 0 && (
        <div className="h-1.5 bg-surface-700 rounded-full overflow-hidden">
          <motion.div
            className="h-full gradient-brand rounded-full"
            animate={{ width: `${totalProgress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      )}

      {/* Items list */}
      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {items.map(item => (
            <QueueItem
              key={item.id}
              item={item}
              onRemove={onRemove}
              onRetry={onRetry}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
