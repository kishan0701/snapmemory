import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, MessageSquare, FolderOpen, Check } from 'lucide-react';
import type { Event, Album } from '@/types';
import { delay } from '@/lib/utils';
import toast from 'react-hot-toast';

interface ContributorRequestModalProps {
  event: Event;
  albums: Album[];
  onClose: () => void;
}

export function ContributorRequestModal({ event, albums, onClose }: ContributorRequestModalProps) {
  const [form, setForm] = useState({ message: '', album_id: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await delay(1000);
    setSubmitted(true);
    setIsSubmitting(false);
    toast.success('Request sent! The event admin will review it shortly.');
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: 'rgba(8, 6, 18, 0.85)' }}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          onClick={e => e.stopPropagation()}
          className="card p-6 w-full max-w-md"
        >
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Upload className="w-4 h-4 text-purple-400" />
              <h2 className="text-sm font-semibold text-white">Request Upload Access</h2>
            </div>
            <button onClick={onClose} className="w-7 h-7 glass-light rounded-lg flex items-center justify-center hover:bg-white/10">
              <X className="w-3.5 h-3.5 text-secondary" />
            </button>
          </div>

          {submitted ? (
            <div className="text-center py-6 space-y-3">
              <div className="w-14 h-14 rounded-full bg-green-500/20 flex items-center justify-center mx-auto">
                <Check className="w-7 h-7 text-green-400" />
              </div>
              <h3 className="text-base font-semibold text-white">Request Sent!</h3>
              <p className="text-sm text-secondary">
                The event admin will review your request and notify you once approved.
              </p>
              <button onClick={onClose} className="btn-primary w-full justify-center mt-4">
                Done
              </button>
            </div>
          ) : (
            <>
              <div className="p-3 glass-light rounded-lg mb-5">
                <p className="text-xs text-secondary">
                  You're requesting upload access for <strong className="text-white">{event.title}</strong>.
                  The event admin will review and approve your request.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Album selection */}
                {albums.length > 0 && (
                  <div>
                    <label htmlFor="request-album" className="block text-xs font-medium text-secondary mb-1.5">
                      <FolderOpen className="w-3.5 h-3.5 inline mr-1" />
                      Upload to album (optional)
                    </label>
                    <select
                      id="request-album"
                      value={form.album_id}
                      onChange={e => setForm(f => ({ ...f, album_id: e.target.value }))}
                      className="input-field cursor-pointer"
                    >
                      <option value="">Any album (admin decides)</option>
                      {albums.filter(a => a.visibility === 'public').map(a => (
                        <option key={a.id} value={a.id}>{a.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Message */}
                <div>
                  <label htmlFor="request-message" className="block text-xs font-medium text-secondary mb-1.5">
                    <MessageSquare className="w-3.5 h-3.5 inline mr-1" />
                    Message to admin
                  </label>
                  <textarea
                    id="request-message"
                    value={form.message}
                    onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                    className="input-field resize-none"
                    rows={3}
                    placeholder="Introduce yourself and explain what photos you'd like to contribute..."
                    maxLength={300}
                    required
                  />
                  <p className="text-[11px] text-muted text-right mt-1">{form.message.length}/300</p>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="btn-ghost flex-1 justify-center"
                  >
                    Cancel
                  </button>
                  <button
                    id="submit-request-btn"
                    type="submit"
                    disabled={isSubmitting || !form.message.trim()}
                    className="btn-primary flex-1 justify-center disabled:opacity-60"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                        Sending...
                      </span>
                    ) : (
                      <>
                        <Upload className="w-3.5 h-3.5" /> Send Request
                      </>
                    )}
                  </button>
                </div>
              </form>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
