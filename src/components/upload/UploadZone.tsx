import { useState, useCallback, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, X, CheckCircle2, AlertCircle, Image as ImageIcon,
  Video, FolderOpen, Loader2, CloudUpload, Camera, UserCheck, ShieldCheck, Sparkles
} from 'lucide-react';
import type { Album, UploadQueueItem, UploadStatus } from '@/types';
import { validateMediaFile, formatFileSize, isVideoFile, delay } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { useAuth } from '@/features/auth/AuthContext';
import { useEventStore } from '@/store/eventStore';
import { detectAllFaceDescriptors } from '@/services/faceMatcher';
import toast from 'react-hot-toast';

interface UploadZoneProps {
  albums: Album[];
  eventId: string;
  isOwner?: boolean;
  onUploadComplete?: () => void;
}

const STATUS_COLORS: Record<UploadStatus, string> = {
  waiting: 'text-muted',
  uploading: 'text-blue-400',
  processing: 'text-amber-400',
  completed: 'text-emerald-400',
  failed: 'text-red-400',
  cancelled: 'text-muted',
};

const STATUS_LABELS: Record<UploadStatus, string> = {
  waiting: 'Waiting',
  uploading: 'Uploading…',
  processing: 'AI Face Indexing…',
  completed: 'Uploaded ✓',
  failed: 'Failed',
  cancelled: 'Cancelled',
};

export function UploadZone({ albums, eventId, isOwner = true, onUploadComplete }: UploadZoneProps) {
  const { user } = useAuth();
  const addMedia = useEventStore((s) => s.addMedia);

  const [queue, setQueue] = useState<UploadQueueItem[]>([]);
  const [selectedAlbum, setSelectedAlbum] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [guestName, setGuestName] = useState('');

  // Role toggle: Host (instant approved) vs Guest (requires host approval)
  const [simulateGuestUpload, setSimulateGuestUpload] = useState(!isOwner);

  const cameraInputRef = useRef<HTMLInputElement>(null);

  const updateItem = (id: string, update: Partial<UploadQueueItem>) => {
    setQueue((prev) =>
      prev.map((item) => (item.id === update.id || item.id === id ? { ...item, ...update } : item))
    );
  };

  const handleFiles = useCallback((acceptedFiles: File[]) => {
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
      errors.forEach((err) => toast.error(err));
    }

    setQueue((prev) => [...prev, ...newItems]);
  }, [selectedAlbum]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    handleFiles(acceptedFiles);
  }, [handleFiles]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': [],
      'image/png': [],
      'image/webp': [],
      'image/heic': [],
      'video/mp4': [],
      'video/quicktime': [],
      'video/webm': [],
    },
    maxFiles: 50,
  });

  const readFileAsDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  };

  const processAndUpload = async (item: UploadQueueItem) => {
    updateItem(item.id, { status: 'uploading', progress: 20 });

    try {
      // 1. Read file data URL
      const dataUrl = await readFileAsDataUrl(item.file);
      updateItem(item.id, { progress: 50 });

      // 2. Face detection indexing for images
      let faceDescriptors: number[][] = [];
      const isVideo = isVideoFile(item.file);

      if (!isVideo) {
        updateItem(item.id, { status: 'processing', progress: 75 });
        try {
          faceDescriptors = await detectAllFaceDescriptors(dataUrl);
        } catch {
          // Graceful fallback if face-api model isn't downloaded yet
        }
      }

      updateItem(item.id, { progress: 90 });
      await delay(150);

      // 3. Determine approval status:
      // If uploading as host/owner -> approved instantly
      // If uploading as guest/contributor -> pending host approval
      const isApproved = isOwner && !simulateGuestUpload;
      const approval_status: 'approved' | 'pending' = isApproved ? 'approved' : 'pending';

      const uploaderName = simulateGuestUpload
        ? guestName.trim() || 'Guest Attendee'
        : user?.name || 'Event Host';

      const uploaderEmail = simulateGuestUpload
        ? 'guest@snapmemory.in'
        : user?.email || 'host@snapmemory.in';

      // 4. Save to persistent eventStore + IndexedDB + Supabase
      await addMedia({
        event_id: eventId,
        album_id: item.album_id || undefined,
        uploader_id: user?.id || (simulateGuestUpload ? 'guest-attendee' : 'host-1'),
        uploader_name: uploaderName,
        uploader_email: uploaderEmail,
        is_creator_upload: isApproved,
        type: isVideo ? 'video' : 'photo',
        original_url: dataUrl,
        preview_url: dataUrl,
        thumbnail_url: dataUrl,
        filename: item.file.name,
        mime_type: item.file.type,
        size: item.file.size,
        approval_status,
        is_approved: isApproved,
        face_descriptors: faceDescriptors,
        processing_status: 'ready',
      });

      updateItem(item.id, { status: 'completed', progress: 100 });
    } catch (err) {
      console.error('Upload failed for item:', item.file.name, err);
      updateItem(item.id, { status: 'failed', progress: 0, error: 'Upload failed' });
    }
  };

  const startUpload = async () => {
    const waiting = queue.filter((item) => item.status === 'waiting');
    if (waiting.length === 0) {
      toast.error('No files in queue to upload');
      return;
    }
    setIsUploading(true);

    for (const item of waiting) {
      await processAndUpload(item);
    }

    setIsUploading(false);

    if (simulateGuestUpload) {
      toast.success(
        `🎉 ${waiting.length} photo(s) submitted! Waiting for event creator approval.`,
        { duration: 5000, icon: '⏳' }
      );
    } else {
      toast.success(
        `🎉 ${waiting.length} photo(s) uploaded & indexed with AI face recognition!`,
        { duration: 4000 }
      );
    }

    onUploadComplete?.();
  };

  const removeItem = (id: string) => {
    setQueue((prev) => {
      const item = prev.find((i) => i.id === id);
      if (item?.preview_url) URL.revokeObjectURL(item.preview_url);
      return prev.filter((i) => i.id !== id);
    });
  };

  const clearCompleted = () => {
    setQueue((prev) => prev.filter((i) => i.status !== 'completed'));
  };

  const waitingCount = queue.filter((i) => i.status === 'waiting').length;
  const completedCount = queue.filter((i) => i.status === 'completed').length;
  const failedCount = queue.filter((i) => i.status === 'failed').length;

  return (
    <div className="space-y-5">
      {/* ─── Uploader Persona / Approval Mode Switcher ───────────────── */}
      <div
        className="rounded-2xl p-4 transition-all"
        style={{
          background: simulateGuestUpload
            ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.12) 0%, rgba(124, 58, 237, 0.08) 100%)'
            : 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(124, 58, 237, 0.08) 100%)',
          border: simulateGuestUpload
            ? '1px solid rgba(245, 158, 11, 0.3)'
            : '1px solid rgba(16, 185, 129, 0.3)',
        }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
                simulateGuestUpload ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'
              )}
            >
              {simulateGuestUpload ? <UserCheck className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
            </div>
            <div>
              <p className="text-sm font-bold text-white flex items-center gap-1.5">
                {simulateGuestUpload ? 'Guest / Attendee Upload Mode' : 'Event Creator (Host) Mode'}
                <span
                  className={cn(
                    'badge text-[10px] py-0.5',
                    simulateGuestUpload ? 'badge-amber' : 'badge-green'
                  )}
                >
                  {simulateGuestUpload ? 'Requires Creator Approval' : 'Auto-Approved Live'}
                </span>
              </p>
              <p className="text-xs text-white/60">
                {simulateGuestUpload
                  ? 'Photos will go to your Creator Approval Queue first before showing in the gallery.'
                  : 'You are uploading as Event Creator. Photos go live directly in gallery & AI search.'}
              </p>
            </div>
          </div>

          {/* Quick toggle for viva / presentation testing */}
          <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-center">
            <button
              type="button"
              onClick={() => setSimulateGuestUpload(!simulateGuestUpload)}
              className="btn-secondary text-xs py-1.5 px-3"
            >
              {simulateGuestUpload ? 'Switch to Host Mode' : 'Test as Guest Attendee'}
            </button>
          </div>
        </div>

        {/* Guest name input if simulating guest */}
        {simulateGuestUpload && (
          <div className="mt-3 pt-3 border-t border-amber-500/20 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <label htmlFor="guest-name" className="text-xs text-amber-300 font-medium whitespace-nowrap">
              Your Name (as guest):
            </label>
            <input
              id="guest-name"
              type="text"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              placeholder="e.g. Rahul Verma or Sneha"
              className="input-field text-xs py-1.5 flex-1"
            />
          </div>
        )}
      </div>

      {/* Album selector & Camera button */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label htmlFor="upload-album" className="block text-xs font-medium text-secondary mb-1.5">
            <FolderOpen className="w-3.5 h-3.5 inline mr-1 text-purple-400" />
            Upload to album
          </label>
          <select
            id="upload-album"
            value={selectedAlbum}
            onChange={(e) => setSelectedAlbum(e.target.value)}
            className="input-field cursor-pointer text-sm"
          >
            <option value="">No album (General Gallery)</option>
            {albums.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </div>

        {/* Mobile Camera Fast-Snap Button */}
        <div>
          <label className="block text-xs font-medium text-secondary mb-1.5">
            <Camera className="w-3.5 h-3.5 inline mr-1 text-purple-400" />
            Quick Capture (Mobile Camera)
          </label>
          <button
            type="button"
            onClick={() => cameraInputRef.current?.click()}
            className="btn-secondary w-full justify-center text-sm py-2.5"
          >
            <Camera className="w-4 h-4 text-purple-400" />
            Take Photo with Camera
          </button>
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                handleFiles(Array.from(e.target.files));
              }
            }}
          />
        </div>
      </div>

      {/* Drag & Drop Zone */}
      <div
        {...getRootProps()}
        className={cn(
          'relative border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all',
          isDragActive
            ? 'border-purple-500 bg-purple-500/15 scale-[1.01]'
            : 'border-purple-900/40 hover:border-purple-500/60 hover:bg-purple-500/5'
        )}
      >
        <input {...getInputProps()} id="upload-file-input" />
        <div className="flex flex-col items-center gap-3">
          <div
            className={cn(
              'w-16 h-16 rounded-2xl flex items-center justify-center transition-all',
              isDragActive ? 'gradient-brand shadow-lg shadow-purple-500/40' : 'glass-light'
            )}
          >
            <CloudUpload className={cn('w-8 h-8', isDragActive ? 'text-white' : 'text-purple-400')} />
          </div>
          {isDragActive ? (
            <p className="text-base font-bold text-purple-300">Drop files right here!</p>
          ) : (
            <>
              <p className="text-base font-bold text-white">
                Drag & drop photos or videos here
              </p>
              <p className="text-xs text-secondary">
                or <span className="text-purple-400 font-semibold underline">browse files</span> from your phone / computer
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className="badge badge-purple text-[10px] flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5" /> AI Face Indexing On Upload
                </span>
                <span className="text-[11px] text-muted">
                  JPG, PNG, WEBP, MP4
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Upload Queue */}
      {queue.length > 0 && (
        <div className="space-y-3">
          {/* Queue header */}
          <div className="flex items-center justify-between text-xs font-medium text-secondary">
            <p>
              {queue.length} file(s) · {waitingCount} waiting · {completedCount} uploaded
              {failedCount > 0 && ` · ${failedCount} failed`}
            </p>
            {completedCount > 0 && (
              <button
                type="button"
                onClick={clearCompleted}
                className="text-purple-400 hover:text-purple-300 transition-colors"
              >
                Clear completed
              </button>
            )}
          </div>

          {/* Items List */}
          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            <AnimatePresence>
              {queue.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex items-center gap-3 p-3 glass-light rounded-xl border border-purple-900/20"
                >
                  {/* Thumbnail */}
                  <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-surface-700">
                    {item.preview_url && !isVideoFile(item.file) ? (
                      <img src={item.preview_url} alt="" className="w-full h-full object-cover" />
                    ) : isVideoFile(item.file) ? (
                      <div className="w-full h-full flex items-center justify-center bg-purple-950/40">
                        <Video className="w-5 h-5 text-purple-400" />
                      </div>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="w-5 h-5 text-muted" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-white truncate">{item.file.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-muted">{formatFileSize(item.file.size)}</span>
                      <span
                        className={cn(
                          'text-[10px] font-medium flex items-center gap-1',
                          STATUS_COLORS[item.status]
                        )}
                      >
                        {(item.status === 'uploading' || item.status === 'processing') && (
                          <Loader2 className="w-2.5 h-2.5 animate-spin" />
                        )}
                        {item.status === 'completed' && <CheckCircle2 className="w-2.5 h-2.5" />}
                        {item.status === 'failed' && <AlertCircle className="w-2.5 h-2.5" />}
                        {STATUS_LABELS[item.status]}
                        {item.status === 'uploading' && ` ${item.progress}%`}
                      </span>
                    </div>

                    {/* Progress bar */}
                    {(item.status === 'uploading' || item.status === 'processing') && (
                      <div className="mt-1.5 h-1.5 bg-surface-600 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full gradient-brand"
                          initial={{ width: 0 }}
                          animate={{ width: `${item.progress}%` }}
                          transition={{ duration: 0.15 }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Remove */}
                  {item.status !== 'uploading' && item.status !== 'processing' && (
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="w-7 h-7 flex items-center justify-center rounded-lg text-muted hover:text-red-400 hover:bg-red-500/10 transition-colors flex-shrink-0"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Start Upload Button */}
          {waitingCount > 0 && (
            <button
              id="start-upload-btn"
              type="button"
              onClick={startUpload}
              disabled={isUploading}
              className="btn-primary w-full justify-center py-3 text-sm font-bold shadow-lg shadow-purple-600/30 disabled:opacity-60"
            >
              {isUploading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Uploading & Indexing Faces…
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  {simulateGuestUpload
                    ? `Submit ${waitingCount} File${waitingCount !== 1 ? 's' : ''} for Host Approval`
                    : `Upload & Publish ${waitingCount} File${waitingCount !== 1 ? 's' : ''} to Gallery`}
                </span>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
