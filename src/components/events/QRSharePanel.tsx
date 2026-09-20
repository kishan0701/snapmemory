import { useState } from 'react';
import { motion } from 'framer-motion';
import { AnimatePresence } from 'framer-motion';
import { X, QrCode, Copy, Download, Share2, Check, ExternalLink, MessageCircle, Mail } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import type { Event } from '@/types';
import { buildEventShareUrl, copyToClipboard } from '@/lib/utils';
import toast from 'react-hot-toast';

interface QRSharePanelProps {
  event: Event;
  onClose: () => void;
}

export function QRSharePanel({ event, onClose }: QRSharePanelProps) {
  const [copied, setCopied] = useState(false);
  const shareUrl = buildEventShareUrl(event.id);

  const handleCopy = async () => {
    await copyToClipboard(shareUrl);
    setCopied(true);
    toast.success('Link copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: event.title,
        text: `Check out the gallery for ${event.title}`,
        url: shareUrl,
      });
    } else {
      await handleCopy();
    }
  };

  const handleDownloadQR = () => {
    const svg = document.getElementById('event-qr-code');
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([svgData], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${event.title}-qr.svg`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('QR code downloaded');
  };

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`Check out the gallery for ${event.title}: ${shareUrl}`)}`;
  const emailUrl = `mailto:?subject=${encodeURIComponent(`Photo gallery: ${event.title}`)}&body=${encodeURIComponent(`Hi!\n\nI've created a photo gallery for ${event.title}. Check it out:\n\n${shareUrl}`)}`;

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
          className="card p-6 w-full max-w-sm"
        >
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <QrCode className="w-4 h-4 text-purple-400" />
              <h2 className="text-sm font-semibold text-white">Share Event</h2>
            </div>
            <button
              id="qr-close-btn"
              onClick={onClose}
              className="w-7 h-7 glass-light rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors"
            >
              <X className="w-3.5 h-3.5 text-secondary" />
            </button>
          </div>

          {/* QR Code */}
          <div className="flex flex-col items-center mb-6">
            <div className="p-4 bg-white rounded-2xl mb-3 shadow-lg">
              <QRCodeSVG
                id="event-qr-code"
                value={shareUrl}
                size={160}
                level="H"
                marginSize={0}
                fgColor="#1e1a35"
              />
            </div>
            <p className="text-xs text-secondary text-center">Scan to open the event gallery</p>
          </div>

          {/* Link */}
          <div className="mb-5">
            <p className="text-xs text-muted mb-1.5">Event link</p>
            <div className="flex items-center gap-2">
              <div className="flex-1 input-field text-xs text-secondary truncate py-2.5 cursor-text">
                {shareUrl}
              </div>
              <button
                id="qr-copy-link-btn"
                onClick={handleCopy}
                className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 transition-all ${
                  copied ? 'bg-green-500/20 text-green-400' : 'glass-light text-secondary hover:text-white'
                }`}
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
              <a
                href={shareUrl}
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-lg glass-light flex items-center justify-center text-secondary hover:text-white flex-shrink-0"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            <button
              id="qr-download-btn"
              onClick={handleDownloadQR}
              className="btn-secondary text-xs py-2 px-2 justify-center flex-col gap-1 h-auto"
            >
              <Download className="w-4 h-4" />
              Download QR
            </button>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="btn-secondary text-xs py-2 px-2 justify-center flex-col gap-1 h-auto flex items-center"
            >
              <MessageCircle className="w-4 h-4" />
              WhatsApp
            </a>
            <a
              href={emailUrl}
              className="btn-secondary text-xs py-2 px-2 justify-center flex-col gap-1 h-auto flex items-center"
            >
              <Mail className="w-4 h-4" />
              Email
            </a>
          </div>

          <button
            onClick={handleShare}
            className="btn-primary w-full justify-center text-sm py-2.5"
          >
            <Share2 className="w-4 h-4" /> Share Event
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
