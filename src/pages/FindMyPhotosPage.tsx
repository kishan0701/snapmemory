import { useState, useRef, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, Camera as CameraIcon, X, CheckCircle2,
  Download, Shield, Eye, RotateCcw, Trash2, AlertCircle,
  Cpu, ScanFace, ImageOff, Zap,
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { useEventStore } from '@/store/eventStore';
import { Lightbox } from '@/components/gallery/Lightbox';
import {
  loadModels,
  detectFaceDescriptor,
  matchPhotosAgainstFace,
  type FaceMatchResult,
} from '@/services/faceMatcher';
import type { Media } from '@/types';
import toast from 'react-hot-toast';

// ─── Types ────────────────────────────────────────────────────────────────────
type FlowState = 'intro' | 'upload' | 'processing' | 'results' | 'no_results' | 'error' | 'no_face';

interface ScanProgress {
  scanned: number;
  total: number;
  currentFile: string;
  modelStep: string;
}

// ─── Component ────────────────────────────────────────────────────────────────
export function FindMyPhotosPage() {
  const { id } = useParams<{ id: string }>();
  const getEventById = useEventStore((s) => s.getEventById);
  const getEventMedia = useEventStore((s) => s.getEventMedia);
  const updateMediaFaceDescriptors = useEventStore((s) => s.updateMediaFaceDescriptors);

  const event = getEventById(id ?? 'evt-1');

  const [state, setState] = useState<FlowState>('intro');
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null);
  const [consent, setConsent] = useState(false);
  const [results, setResults] = useState<FaceMatchResult[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [progress, setProgress] = useState<ScanProgress>({
    scanned: 0, total: 0, currentFile: '', modelStep: '',
  });
  const [errorMsg, setErrorMsg] = useState('');

  const fileRef = useRef<HTMLInputElement>(null);

  // Pre-load models when page mounts (runs in background)
  useEffect(() => {
    loadModels().catch(() => {}); // silent pre-warm
  }, []);

  // Get all approved photos for this event
  const rawMedia = getEventMedia(id ?? 'evt-1', false);
  const eventPhotos = rawMedia
    .filter(m => m.type === 'photo')
    .map(m => ({
      id: m.id,
      url: m.original_url ?? m.preview_url,
      thumbnailUrl: m.thumbnail_url ?? m.preview_url ?? m.original_url ?? '',
      filename: m.filename,
      face_descriptors: m.face_descriptors,
    }));

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) { toast.error('Please select an image file'); return; }
    const url = URL.createObjectURL(file);
    setSelfiePreview(url);
    setState('upload');
  };

  const handleSearch = useCallback(async () => {
    if (!consent) { toast.error('Please accept the consent to continue'); return; }
    if (!selfiePreview) return;

    setState('processing');
    setProgress({ scanned: 0, total: 0, currentFile: '', modelStep: 'Initializing AI models…' });

    try {
      // 1. Load models (cached after first load)
      await loadModels(step => setProgress(p => ({ ...p, modelStep: step })));

      // 2. Detect face in selfie
      setProgress(p => ({ ...p, modelStep: 'Analyzing your face…' }));
      const descriptor = await detectFaceDescriptor(selfiePreview);

      if (!descriptor) {
        setState('no_face');
        return;
      }

      // 3. Scan event photos (uses pre-computed descriptors if available for instant matching!)
      setProgress(p => ({ ...p, total: eventPhotos.length, modelStep: 'Scanning event photos…' }));
      const matches = await matchPhotosAgainstFace(
        descriptor,
        eventPhotos,
        (scanned, total, currentFile) => {
          setProgress(p => ({ ...p, scanned, total, currentFile }));
        },
        0.60,
        (mediaId, desc) => updateMediaFaceDescriptors(mediaId, desc)
      );

      setResults(matches);
      if (matches.length === 0) {
        setState('no_results');
      } else {
        setState('results');
        toast.success(`🎉 Found ${matches.length} photo${matches.length > 1 ? 's' : ''} with your face!`);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      setErrorMsg(msg);
      setState('error');
    }
  }, [consent, selfiePreview, eventPhotos]);

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleDownload = () => {
    results
      .filter(r => selected.has(r.mediaId))
      .forEach(r => {
        const a = document.createElement('a');
        a.href = r.url;
        a.download = r.filename;
        a.target = '_blank';
        a.click();
      });
    toast.success(`Downloading ${selected.size} photo(s)`);
  };

  const handleReset = () => {
    if (selfiePreview) URL.revokeObjectURL(selfiePreview);
    setSelfiePreview(null);
    setConsent(false);
    setSelected(new Set());
    setResults([]);
    setErrorMsg('');
    setState('intro');
  };

  // Build Media[] for lightbox from results
  const lightboxMedia: Media[] = results.map((r, i) => ({
    id: r.mediaId,
    event_id: id ?? 'evt-1',
    album_id: '',
    uploader_id: '',
    type: 'photo',
    original_url: r.url,
    preview_url: r.url,
    thumbnail_url: r.thumbnailUrl,
    filename: r.filename,
    mime_type: 'image/jpeg',
    size: 0,
    width: 0,
    height: 0,
    processing_status: 'ready',
    created_at: new Date().toISOString(),
    is_favorited: false,
    favorite_count: 0,
    download_count: 0,
    sort_order: i,
  }));

  // Progress percentage
  const pct = progress.total > 0 ? Math.round((progress.scanned / progress.total) * 100) : 0;

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="max-w-2xl mx-auto px-4 sm:px-6 pt-24 pb-16">
        {/* ── Page Header ── */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 badge badge-purple mb-4">
            <ScanFace className="w-3.5 h-3.5" /> AI Face Matching
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white mb-3">
            Find My Photos
          </h1>
          <p className="text-secondary">
            Upload a selfie and AI will scan every photo in{' '}
            <strong className="text-white">{event?.title ?? 'this event'}</strong>
            {' '}to find you — 100% private, runs in your browser.
          </p>
        </div>

        <AnimatePresence mode="wait">

          {/* ── INTRO ─────────────────────────────────────────────── */}
          {state === 'intro' && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="card p-6 space-y-5"
            >
              {/* Privacy notice */}
              <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                <Shield className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-white mb-1">🔒 100% Private</p>
                  <p className="text-xs text-secondary leading-relaxed">
                    Face matching runs <strong className="text-white">entirely in your browser</strong> using
                    TensorFlow.js. Your selfie never leaves your device. No data is sent to any server.
                  </p>
                </div>
              </div>

              {/* How it works */}
              <div className="space-y-3">
                {[
                  { icon: Upload, title: 'Upload your selfie', desc: 'Choose a clear, well-lit front-facing photo' },
                  { icon: Cpu, title: 'AI detects your face', desc: 'TinyFaceDetector extracts your unique face embedding locally' },
                  { icon: ScanFace, title: 'Scans all event photos', desc: `Checks every photo in the event for your face` },
                  { icon: Download, title: 'Download your photos', desc: 'Select and download any matching photos instantly' },
                ].map((step, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-lg gradient-brand flex items-center justify-center flex-shrink-0 mt-0.5">
                      <step.icon className="w-3.5 h-3.5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{step.title}</p>
                      <p className="text-xs text-muted">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  id="fmp-upload-btn"
                  onClick={() => { if (fileRef.current) { fileRef.current.removeAttribute('capture'); fileRef.current.click(); } }}
                  className="btn-primary justify-center py-3"
                >
                  <Upload className="w-4 h-4" /> Upload Selfie
                </button>
                <button
                  id="fmp-camera-btn"
                  onClick={() => { if (fileRef.current) { fileRef.current.setAttribute('capture', 'user'); fileRef.current.click(); } }}
                  className="btn-secondary justify-center py-3"
                >
                  <CameraIcon className="w-4 h-4" /> Use Camera
                </button>
              </div>

              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={e => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
              />
            </motion.div>
          )}

          {/* ── UPLOAD / CONSENT ──────────────────────────────────── */}
          {state === 'upload' && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="card p-6 space-y-5"
            >
              {/* Selfie preview */}
              <div className="flex items-center gap-4">
                <div className="relative w-20 h-20 rounded-xl overflow-hidden border-2 border-purple-500/40 flex-shrink-0">
                  {selfiePreview && (
                    <img src={selfiePreview} alt="Your selfie" className="w-full h-full object-cover" />
                  )}
                  <div className="absolute inset-0 rounded-xl ring-2 ring-purple-500/20" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <p className="text-sm font-semibold text-white">Selfie ready</p>
                  </div>
                  <p className="text-xs text-muted">AI will search {eventPhotos.length} photos for your face.</p>
                  <button
                    onClick={() => fileRef.current?.click()}
                    className="text-xs text-purple-400 hover:text-purple-300 mt-1 transition-colors"
                  >
                    Change photo
                  </button>
                </div>
              </div>

              {/* Consent */}
              <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
                <label className="flex items-start gap-3 cursor-pointer">
                  <button
                    type="button"
                    onClick={() => setConsent(c => !c)}
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${
                      consent ? 'bg-purple-600 border-purple-500' : 'border-purple-700 hover:border-purple-500'
                    }`}
                  >
                    {consent && <CheckCircle2 className="w-3 h-3 text-white" />}
                  </button>
                  <p className="text-xs text-secondary leading-relaxed">
                    I consent to my selfie being used <strong className="text-white">locally in my browser</strong> to
                    match event photos. I understand it stays on my device and is never uploaded to any server.
                  </p>
                </label>
              </div>

              <div className="flex gap-3">
                <button onClick={handleReset} className="btn-ghost">
                  <X className="w-4 h-4" /> Cancel
                </button>
                <button
                  id="fmp-search-btn"
                  onClick={handleSearch}
                  disabled={!consent}
                  className="btn-primary flex-1 justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ScanFace className="w-4 h-4" /> Find My Photos
                </button>
              </div>

              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={e => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
              />
            </motion.div>
          )}

          {/* ── PROCESSING ────────────────────────────────────────── */}
          {state === 'processing' && (
            <motion.div
              key="processing"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="card p-8 text-center space-y-6"
            >
              {/* Animated scanner icon */}
              <div className="relative w-20 h-20 mx-auto">
                <div className="w-20 h-20 rounded-2xl gradient-brand flex items-center justify-center">
                  <ScanFace className="w-9 h-9 text-white" />
                </div>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  className="absolute inset-0 rounded-2xl border-2 border-transparent border-t-purple-400"
                />
              </div>

              {/* Model loading step */}
              <div>
                <h3 className="text-base font-bold text-white mb-1">
                  {progress.scanned > 0 ? 'Scanning Photos…' : 'Loading AI Models…'}
                </h3>
                <p className="text-xs text-muted">
                  {progress.scanned > 0
                    ? `Checked ${progress.scanned} of ${progress.total} photos`
                    : progress.modelStep || 'Preparing face recognition…'}
                </p>
              </div>

              {/* Progress bar (shown after model loads) */}
              {progress.total > 0 && (
                <div className="space-y-2">
                  <div className="w-full bg-purple-950/60 rounded-full h-2 overflow-hidden">
                    <motion.div
                      className="h-full gradient-brand rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                  <p className="text-[11px] text-muted truncate">
                    {progress.currentFile && `Scanning: ${progress.currentFile}`}
                  </p>
                  <p className="text-xs font-semibold text-purple-300">{pct}%</p>
                </div>
              )}

              {/* Stage badges */}
              <div className="flex justify-center gap-2 flex-wrap">
                {[
                  { label: 'Models loaded', done: _modelsReady() },
                  { label: 'Face detected', done: progress.scanned > 0 },
                  { label: 'Matching…', done: progress.scanned === progress.total && progress.total > 0 },
                ].map(({ label, done }) => (
                  <span
                    key={label}
                    className={`badge text-[10px] transition-all ${done ? 'badge-green' : 'badge-purple'}`}
                  >
                    {done ? '✓ ' : ''}{label}
                  </span>
                ))}
              </div>
            </motion.div>
          )}

          {/* ── RESULTS ───────────────────────────────────────────── */}
          {state === 'results' && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-5"
            >
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-400" />
                    Found {results.length} photo{results.length > 1 ? 's' : ''}!
                  </h2>
                  <p className="text-xs text-muted mt-0.5">Sorted by match confidence</p>
                </div>
                <div className="flex gap-2">
                  {selected.size > 0 && (
                    <button
                      id="fmp-download-btn"
                      onClick={handleDownload}
                      className="btn-primary text-sm py-2"
                    >
                      <Download className="w-3.5 h-3.5" /> {selected.size}
                    </button>
                  )}
                  <button onClick={handleReset} className="btn-ghost text-sm py-2">
                    <RotateCcw className="w-3.5 h-3.5" /> Retry
                  </button>
                </div>
              </div>

              {/* Selfie + stats bar */}
              {selfiePreview && (
                <div className="card p-3 flex items-center gap-3">
                  <img src={selfiePreview} alt="Selfie" className="w-10 h-10 rounded-lg object-cover border border-purple-500/30" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-white">Your selfie matched {results.length} photo{results.length > 1 ? 's' : ''}</p>
                    <p className="text-[11px] text-muted">Best match: {Math.round(results[0]?.confidence * 100)}% confidence</p>
                  </div>
                  <span className="badge badge-green text-[10px]">✓ Matched</span>
                </div>
              )}

              {/* Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {results.map((result, i) => (
                  <motion.div
                    key={result.mediaId}
                    initial={{ opacity: 0, scale: 0.92 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.07 }}
                    className={`relative rounded-xl overflow-hidden cursor-pointer group border-2 transition-all ${
                      selected.has(result.mediaId)
                        ? 'border-purple-500 scale-[0.98]'
                        : 'border-transparent hover:border-purple-500/40'
                    }`}
                    onClick={() => toggleSelect(result.mediaId)}
                  >
                    <img
                      src={result.thumbnailUrl}
                      alt={result.filename}
                      className="w-full aspect-square object-cover"
                    />

                    {/* Overlay */}
                    <div className={`absolute inset-0 transition-all ${
                      selected.has(result.mediaId) ? 'bg-purple-500/20' : 'bg-transparent group-hover:bg-black/20'
                    }`} />

                    {/* Checkbox */}
                    <div className="absolute top-2 left-2">
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                        selected.has(result.mediaId)
                          ? 'bg-purple-600 border-purple-500'
                          : 'border-white/60 bg-black/40 opacity-0 group-hover:opacity-100'
                      }`}>
                        {selected.has(result.mediaId) && <CheckCircle2 className="w-3 h-3 text-white" />}
                      </div>
                    </div>

                    {/* Confidence badge */}
                    <div className="absolute bottom-2 right-2">
                      <span className={`badge text-[10px] ${
                        result.confidence > 0.8 ? 'badge-green' : result.confidence > 0.65 ? 'badge-amber' : 'badge-blue'
                      }`}>
                        {Math.round(result.confidence * 100)}%
                      </span>
                    </div>

                    {/* Expand */}
                    <button
                      onClick={e => { e.stopPropagation(); setLightboxIndex(i); }}
                      className="absolute top-2 right-2 w-6 h-6 bg-black/50 rounded-md items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hidden sm:flex"
                    >
                      <Eye className="w-3 h-3 text-white" />
                    </button>
                  </motion.div>
                ))}
              </div>

              {/* Session footer */}
              <div className="card p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-white">Matching session</p>
                  <p className="text-xs text-muted">Runs locally — no data stored on servers</p>
                </div>
                <button onClick={handleReset} className="btn-ghost text-xs text-red-400 hover:text-red-300 py-1.5">
                  <Trash2 className="w-3.5 h-3.5" /> End session
                </button>
              </div>
            </motion.div>
          )}

          {/* ── NO FACE DETECTED ──────────────────────────────────── */}
          {state === 'no_face' && (
            <motion.div
              key="no_face"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="card p-8 text-center space-y-4"
            >
              <div className="w-16 h-16 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center mx-auto">
                <AlertCircle className="w-8 h-8 text-amber-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white mb-2">No face detected in selfie</h3>
                <p className="text-sm text-secondary leading-relaxed">
                  The AI couldn't find a clear face in your photo. Try a different selfie with:
                </p>
                <ul className="mt-3 text-xs text-muted space-y-1 text-left max-w-xs mx-auto">
                  <li>• Good lighting (avoid backlighting)</li>
                  <li>• Face fully visible and centred</li>
                  <li>• No sunglasses or mask covering face</li>
                  <li>• Clear, unblurred image</li>
                </ul>
              </div>
              <button onClick={handleReset} className="btn-primary mx-auto">
                <RotateCcw className="w-4 h-4" /> Try Again
              </button>
            </motion.div>
          )}

          {/* ── NO RESULTS ────────────────────────────────────────── */}
          {state === 'no_results' && (
            <motion.div
              key="no_results"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="card p-8 text-center space-y-4"
            >
              <div className="w-16 h-16 rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center mx-auto">
                <ImageOff className="w-8 h-8 text-purple-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white mb-2">No matches found</h3>
                <p className="text-sm text-secondary">
                  We scanned all {eventPhotos.length} photos but couldn't find a strong face match.
                  Try a clearer selfie or a different photo of yourself.
                </p>
              </div>
              <button onClick={handleReset} className="btn-primary mx-auto">
                <RotateCcw className="w-4 h-4" /> Try Again
              </button>
            </motion.div>
          )}

          {/* ── ERROR ─────────────────────────────────────────────── */}
          {state === 'error' && (
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="card p-8 text-center space-y-4"
            >
              <div className="w-16 h-16 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-center justify-center mx-auto">
                <AlertCircle className="w-8 h-8 text-red-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white mb-2">Something went wrong</h3>
                <p className="text-xs text-muted font-mono bg-black/30 rounded-lg px-3 py-2 mt-2">{errorMsg}</p>
              </div>
              <button onClick={handleReset} className="btn-primary mx-auto">
                <RotateCcw className="w-4 h-4" /> Try Again
              </button>
            </motion.div>
          )}

        </AnimatePresence>

        {/* Lightbox */}
        {lightboxIndex !== null && (
          <Lightbox
            media={lightboxMedia}
            initialIndex={lightboxIndex}
            onClose={() => setLightboxIndex(null)}
            canDownload={true}
          />
        )}
      </main>
    </div>
  );
}

// Helper — check if face-api models are already in memory
function _modelsReady(): boolean {
  try {
    // @ts-ignore
    return typeof window !== 'undefined' && !!window.__faceapi_models_loaded__;
  } catch { return false; }
}
