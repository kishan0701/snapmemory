import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, X, CheckCircle2, AlertCircle, Image as ImageIcon,
  Video, FolderOpen, Loader2, CloudUpload
} from 'lucide-react';
import type { Album, UploadQueueItem, UploadStatus } from '@/types';
import { validateMediaFile, formatFileSize, isVideoFile, delay } from '@/lib/utils';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

interface UploadZoneProps {
  albums: Album[];
  eventId: string;
}

const STATUS_COLORS: Record<UploadStatus, string> = {
  waiting: 'text-muted',
  uploading: 'text-blue-400',
  processing: 'text-amber-400',
  completed: 'text-green-400',
  failed: 'text-red-400',
  cancelled: 'text-muted',
};

const STATUS_LABELS: Record<UploadStatus, string> = {
  waiting: 'Waiting',
  uploading: 'Uploading',
  processing: 'Processing',
  completed: 'Done',
  failed: 'Failed',
  cancelled: 'Cancelled',
};

export function UploadZone({ albums, eventId: _eventId }: UploadZoneProps) {
  const [queue, setQueue] = useState<UploadQueueItem[]>([]);
  const [selectedAlbum, setSelectedAlbum] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const updateItem = (id: string, update: Partial<UploadQueueItem>) => {
    setQueue(prev => prev.map(item => item.id === update.id || item.id === id ? { ...item, ...update } : item));
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newItems: UploadQueueItem[] = [];
    const errors: string[] = [];

    for (const file of acceptedFiles) {
      const error = validateMediaFile(file);
      if (error) {
        errors.push(`${file.name}: ${error}`);
        continue;
      }
      const id = Math.random().toString(36).slice(2);
      const preview_url = URL.createObjectURL(file);
      newItems.push({
        id,
        file,
        preview_url,
        album_id: selectedAlbum || undefined,
        status: 'waiting',
        progress: 0,
      });
    }

    if (errors.length > 0) {
      errors.forEach(err => toast.error(err));
    }

    setQueue(prev => [...prev, ...newItems]);
  }, [selectedAlbum]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': [], 'image/png': [], 'image/webp': [], 'image/heic': [],
      'video/mp4': [], 'video/quicktime': [], 'video/webm': [],
    },
    maxFiles: 50,
  });

  const simulateUpload = async (item: UploadQueueItem) => {
    updateItem(item.id, { status: 'uploading', progress: 0 });

    // Simulate progress
    for (let p = 0; p <= 90; p += 10) {
      await delay(120);
      updateItem(item.id, { progress: p });
    }

    updateItem(item.id, { status: 'processing', progress: 95 });
    await delay(400);
    updateItem(item.id, { status: 'completed', progress: 100 });
  };

  const startUpload = async () => {
    const waiting = queue.filter(item => item.status === 'waiting');
    if (waiting.length === 0) { toast.error('No files in queue'); return; }
    setIsUploading(true);

    for (const item of waiting) {
      await simulateUpload(item);
    }

    setIsUploading(false);
    toast.success(`${waiting.length} file(s) uploaded successfully!`);
  };

  const removeItem = (id: string) => {
    setQueue(prev => {
      const item = prev.find(i => i.id === id);
      if (item?.preview_url) URL.revokeObjectURL(item.preview_url);
      return prev.filter(i => i.id !== id);
    });
  };

  const clearCompleted = () => {
    setQueue(prev => prev.filter(i => i.status !== 'completed'));
  };

  const waitingCount = queue.filter(i => i.status === 'waiting').length;
  const completedCount = queue.filter(i => i.status === 'completed').length;
  const failedCount = queue.filter(i => i.status === 'failed').length;

  return (
    <div className="space-y-5">
      {/* Album selector */}
      {albums.length > 0 && (
        <div>
          <label htmlFor="upload-album" className="block text-xs font-medium text-secondary mb-1.5">
            <FolderOpen className="w-3.5 h-3.5 inline mr-1" />
            Upload to album
          </label>
          <select
            id="upload-album"
            value={selectedAlbum}
            onChange={e => setSelectedAlbum(e.target.value)}
            className="input-field cursor-pointer"
          >
            <option value="">No album (unsorted)</option>
            {albums.map(a => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
        </div>
      )}

      {/* Drop zone */}
      <div
        {...getRootProps()}
        className={cn(
          'relative border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all',
          isDragActive
            ? 'border-purple-500 bg-purple-500/10 scale-[1.01]'
            : 'border-purple-900/40 hover:border-purple-500/50 hover:bg-purple-500/5'
        )}
      >
        <input {...getInputProps()} id="upload-file-input" />
        <div className="flex flex-col items-center gap-3">
          <div className={cn(
            'w-14 h-14 rounded-2xl flex items-center justify-center transition-all',
            isDragActive ? 'gradient-brand' : 'glass-light'
          )}>
            <CloudUpload className={cn('w-7 h-7', isDragActive ? 'text-white' : 'text-purple-400')} />
          </div>
          {isDragActive ? (
            <p className="text-base font-semibold text-purple-300">Drop to upload!</p>
          ) : (
            <>
              <p className="text-sm font-semibold text-white">
                Drag & drop photos and videos here
              </p>
              <p className="text-xs text-muted">
                or <span className="text-purple-400 underline cursor-pointer">browse files</span>
              </p>
              <p className="text-[11px] text-muted">
                JPG, PNG, WEBP, HEIC, MP4, MOV · Max 50MB/photo, 500MB/video
              </p>
            </>
          )}
        </div>
      </div>

      {/* Queue */}
      {queue.length > 0 && (
        <div className="space-y-3">
          {/* Queue header */}
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-secondary">
              {queue.length} file(s) · {waitingCount} waiting · {completedCount} done
              {failedCount > 0 && ` · ${failedCount} failed`}
            </p>
            <div className="flex gap-2">
              {completedCount > 0 && (
                <button onClick={clearCompleted} className="text-xs text-muted hover:text-secondary">
                  Clear done
                </button>
              )}
            </div>
          </div>

          {/* Items */}
          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            <AnimatePresence>
              {queue.map(item => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex items-center gap-3 p-3 glass-light rounded-xl"
                >
                  {/* Thumbnail */}
                  <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-surface-700">
                    {item.preview_url && !isVideoFile(item.file) ? (
                      <img src={item.preview_url} alt="" className="w-full h-full object-cover" />
                    ) : isVideoFile(item.file) ? (
                      <div className="w-full h-full flex items-center justify-center">
                        <Video className="w-4 h-4 text-purple-400" />
                      </div>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="w-4 h-4 text-muted" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-white truncate">{item.file.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-muted">{formatFileSize(item.file.size)}</span>
                      <span className={cn('text-[10px] font-medium flex items-center gap-0.5', STATUS_COLORS[item.status])}>
                        {item.status === 'uploading' && <Loader2 className="w-2.5 h-2.5 animate-spin" />}
                        {item.status === 'completed' && <CheckCircle2 className="w-2.5 h-2.5" />}
                        {item.status === 'failed' && <AlertCircle className="w-2.5 h-2.5" />}
                        {STATUS_LABELS[item.status]}
                        {item.status === 'uploading' && ` ${item.progress}%`}
                      </span>
                    </div>

                    {/* Progress bar */}
                    {(item.status === 'uploading' || item.status === 'processing') && (
                      <div className="mt-1.5 h-1 bg-surface-600 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full gradient-brand"
                          initial={{ width: 0 }}
                          animate={{ width: `${item.progress}%` }}
                          transition={{ duration: 0.1 }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Remove */}
                  {item.status !== 'uploading' && item.status !== 'processing' && (
                    <button
                      onClick={() => removeItem(item.id)}
                      className="w-6 h-6 flex items-center justify-center rounded text-muted hover:text-red-400 flex-shrink-0"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Upload button */}
          {waitingCount > 0 && (
            <button
              id="start-upload-btn"
              onClick={startUpload}
              disabled={isUploading}
              className="btn-primary w-full justify-center disabled:opacity-60"
            >
              {isUploading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Uploading...
                </span>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Upload {waitingCount} file{waitingCount !== 1 ? 's' : ''}
                </>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
