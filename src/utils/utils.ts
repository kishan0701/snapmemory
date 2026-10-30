/**
 * SnapMemory — Utility Functions
 * @author Kishan Yadav
 */
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { formatDistanceToNow, format, parseISO } from 'date-fns';

// ─── Tailwind merge helper ─────────────────────────────────────────────────────
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ─── Date helpers ─────────────────────────────────────────────────────────────
export function formatDate(dateStr: string): string {
  try {
    return format(parseISO(dateStr), 'dd MMM yyyy');
  } catch {
    return dateStr;
  }
}

export function formatDateLong(dateStr: string): string {
  try {
    return format(parseISO(dateStr), 'EEEE, dd MMMM yyyy');
  } catch {
    return dateStr;
  }
}

export function formatRelativeTime(dateStr: string): string {
  try {
    return formatDistanceToNow(parseISO(dateStr), { addSuffix: true });
  } catch {
    return dateStr;
  }
}

export function formatDateTime(dateStr: string): string {
  try {
    return format(parseISO(dateStr), 'dd MMM yyyy, hh:mm a');
  } catch {
    return dateStr;
  }
}

// ─── File size helpers ────────────────────────────────────────────────────────
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

export function formatStorageUsed(bytes: number): string {
  return formatFileSize(bytes);
}

// ─── Number helpers ───────────────────────────────────────────────────────────
export function formatNumber(num: number): string {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return num.toString();
}

// ─── Duration helpers ─────────────────────────────────────────────────────────
export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// ─── String helpers ───────────────────────────────────────────────────────────
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + '...';
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function getFirstLetter(name?: string): string {
  if (!name || !name.trim()) return '?';
  const clean = name.trim().replace(/^[^a-zA-Z0-9]+/, '');
  return (clean || name.trim()).charAt(0).toUpperCase();
}

export interface AvatarTheme {
  bg: string;
  ring: string;
  badge: string;
  border: string;
}

export function getAvatarTheme(name?: string): AvatarTheme {
  const safeName = name && name.trim() ? name.trim() : 'User';
  const themes: AvatarTheme[] = [
    {
      bg: 'bg-gradient-to-br from-emerald-500 to-teal-700',
      ring: 'ring-emerald-400/40',
      badge: 'bg-emerald-500/20 text-emerald-300',
      border: 'border-emerald-500/30',
    },
    {
      bg: 'bg-gradient-to-br from-purple-600 to-indigo-800',
      ring: 'ring-purple-400/40',
      badge: 'bg-purple-500/20 text-purple-300',
      border: 'border-purple-500/30',
    },
    {
      bg: 'bg-gradient-to-br from-blue-500 to-indigo-700',
      ring: 'ring-blue-400/40',
      badge: 'bg-blue-500/20 text-blue-300',
      border: 'border-blue-500/30',
    },
    {
      bg: 'bg-gradient-to-br from-amber-500 to-rose-700',
      ring: 'ring-amber-400/40',
      badge: 'bg-amber-500/20 text-amber-300',
      border: 'border-amber-500/30',
    },
    {
      bg: 'bg-gradient-to-br from-rose-500 to-pink-700',
      ring: 'ring-rose-400/40',
      badge: 'bg-rose-500/20 text-rose-300',
      border: 'border-rose-500/30',
    },
    {
      bg: 'bg-gradient-to-br from-cyan-500 to-blue-700',
      ring: 'ring-cyan-400/40',
      badge: 'bg-cyan-500/20 text-cyan-300',
      border: 'border-cyan-500/30',
    },
    {
      bg: 'bg-gradient-to-br from-teal-500 to-emerald-800',
      ring: 'ring-teal-400/40',
      badge: 'bg-teal-500/20 text-teal-300',
      border: 'border-teal-500/30',
    },
    {
      bg: 'bg-gradient-to-br from-violet-500 to-purple-800',
      ring: 'ring-violet-400/40',
      badge: 'bg-violet-500/20 text-violet-300',
      border: 'border-violet-500/30',
    },
  ];

  let hash = 0;
  for (let i = 0; i < safeName.length; i++) {
    hash = safeName.charCodeAt(i) + ((hash << 5) - hash);
  }
  const idx = Math.abs(hash) % themes.length;
  return themes[idx];
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// ─── Event type colors ────────────────────────────────────────────────────────
export function getEventTypeColor(type: string): string {
  const map: Record<string, string> = {
    'Wedding': 'badge-purple',
    'College Event': 'badge-blue',
    'Birthday': 'badge-amber',
    'Corporate': 'badge-blue',
    'School Event': 'badge-green',
    'Family Function': 'badge-amber',
    'Other': 'badge-blue',
  };
  return map[type] ?? 'badge-blue';
}

export function getEventTypeEmoji(type: string): string {
  const map: Record<string, string> = {
    'Wedding': '💍',
    'College Event': '🎓',
    'Birthday': '🎂',
    'Corporate': '💼',
    'School Event': '📚',
    'Family Function': '👨‍👩‍👧‍👦',
    'Other': '📸',
  };
  return map[type] ?? '📸';
}

// ─── Privacy labels ───────────────────────────────────────────────────────────
export function getPrivacyLabel(privacy: string): string {
  const map: Record<string, string> = {
    public: 'Public',
    unlisted: 'Unlisted',
    private: 'Private',
    password: 'Password Protected',
  };
  return map[privacy] ?? privacy;
}

export function getPrivacyBadge(privacy: string): string {
  const map: Record<string, string> = {
    public: 'badge-green',
    unlisted: 'badge-amber',
    private: 'badge-red',
    password: 'badge-amber',
  };
  return map[privacy] ?? 'badge-blue';
}

// ─── Status colors ────────────────────────────────────────────────────────────
export function getRequestStatusColor(status: string): string {
  const map: Record<string, string> = {
    pending: 'badge-amber',
    approved: 'badge-green',
    rejected: 'badge-red',
    expired: 'badge-blue',
    revoked: 'badge-red',
  };
  return map[status] ?? 'badge-blue';
}

// ─── Media helpers ────────────────────────────────────────────────────────────
export function isVideoFile(file: File): boolean {
  return file.type.startsWith('video/');
}

export function isImageFile(file: File): boolean {
  return file.type.startsWith('image/');
}

export function validateMediaFile(file: File): string | null {
  const MAX_IMAGE_SIZE = 50 * 1024 * 1024; // 50MB
  const MAX_VIDEO_SIZE = 500 * 1024 * 1024; // 500MB
  const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic'];
  const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/mov', 'video/quicktime', 'video/webm'];

  if (isImageFile(file)) {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return `Unsupported image format: ${file.type}`;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      return `Image too large. Maximum size is ${formatFileSize(MAX_IMAGE_SIZE)}`;
    }
  } else if (isVideoFile(file)) {
    if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
      return `Unsupported video format: ${file.type}`;
    }
    if (file.size > MAX_VIDEO_SIZE) {
      return `Video too large. Maximum size is ${formatFileSize(MAX_VIDEO_SIZE)}`;
    }
  } else {
    return `Unsupported file type: ${file.type}`;
  }

  return null;
}

// ─── URL helpers ──────────────────────────────────────────────────────────────
export function buildEventUrl(eventId: string): string {
  return `${window.location.origin}/event/${eventId}`;
}

export function buildEventShareUrl(eventId: string): string {
  return `${window.location.origin}/event/${eventId}`;
}

// ─── Random ID generator ──────────────────────────────────────────────────────
export function generateId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

// ─── Async delay ──────────────────────────────────────────────────────────────
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ─── Copy to clipboard ────────────────────────────────────────────────────────
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    return true;
  }
}
