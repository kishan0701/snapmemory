import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload,
  Check,
  Trash2,
  Link2,
  Camera,
  Layers,
  ExternalLink,
  Info,
  Sparkles,
} from 'lucide-react';
import toast from 'react-hot-toast';

export interface CoverPreset {
  url: string;
  title: string;
  category: string;
}

export interface CoverCategory {
  id: string;
  name: string;
  emoji: string;
  icon?: string;
}

export const COVER_CATEGORIES: CoverCategory[] = [
  { id: 'all', name: 'All Presets', emoji: '✨' },
  { id: 'wedding', name: 'Wedding & Reception', emoji: '💍' },
  { id: 'birthday', name: 'Birthday & Anniversary', emoji: '🎂' },
  { id: 'party', name: 'Party & Concert', emoji: '🎉' },
  { id: 'college', name: 'College & School', emoji: '🎓' },
  { id: 'corporate', name: 'Corporate & Tech', emoji: '💼' },
  { id: 'festivals', name: 'Festivals & Culture', emoji: '🪔' },
  { id: 'travel', name: 'Travel & Outdoors', emoji: '✈️' },
  { id: 'aesthetic', name: 'Aesthetic & Minimal', emoji: '✨' },
];

export const CATEGORIZED_PRESETS: CoverPreset[] = [
  // Wedding
  {
    url: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&q=80',
    title: 'Floral Mandap & Ceremony',
    category: 'wedding',
  },
  {
    url: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=1200&q=80',
    title: 'Traditional Wedding Garland',
    category: 'wedding',
  },
  {
    url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=1200&q=80',
    title: 'Sunset Couple Portrait',
    category: 'wedding',
  },
  {
    url: 'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=1200&q=80',
    title: 'Rings & Floral Bouquet',
    category: 'wedding',
  },
  {
    url: 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=1200&q=80',
    title: 'Fairy Light Reception Dinner',
    category: 'wedding',
  },
  {
    url: 'https://images.unsplash.com/photo-1545232979-8bf68ee9b1af?w=1200&q=80',
    title: 'Grand Palace Venue',
    category: 'wedding',
  },

  // Birthday & Anniversary
  {
    url: 'https://images.unsplash.com/photo-1464349153735-7db50ed83c84?w=1200&q=80',
    title: 'Birthday Cake & Sparklers',
    category: 'birthday',
  },
  {
    url: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=1200&q=80',
    title: 'Festive Balloons & Confetti',
    category: 'birthday',
  },
  {
    url: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=1200&q=80',
    title: 'Celebration Lights & Table',
    category: 'birthday',
  },
  {
    url: 'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?w=1200&q=80',
    title: 'Party Toast with Friends',
    category: 'birthday',
  },
  {
    url: 'https://images.unsplash.com/photo-1558636508-e0db3814bd1d?w=1200&q=80',
    title: 'Celebration Cupcakes & Treats',
    category: 'birthday',
  },
  {
    url: 'https://images.unsplash.com/photo-1504196606672-aef5c9cefc92?w=1200&q=80',
    title: 'Golden Celebration Balloons',
    category: 'birthday',
  },

  // Party & Concert
  {
    url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1200&q=80',
    title: 'Music Concert Stage & Lights',
    category: 'party',
  },
  {
    url: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1200&q=80',
    title: 'Neon Dance Floor & Club',
    category: 'party',
  },
  {
    url: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=1200&q=80',
    title: 'Rooftop Party & Fairy Lights',
    category: 'party',
  },
  {
    url: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=1200&q=80',
    title: 'Champagne Cheers & Toast',
    category: 'party',
  },
  {
    url: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1200&q=80',
    title: 'DJ Deck & EDM Music Fest',
    category: 'party',
  },
  {
    url: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200&q=80',
    title: 'Glitter Confetti Explosion',
    category: 'party',
  },

  // College & School
  {
    url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1200&q=80',
    title: 'Convocation Caps in the Sky',
    category: 'college',
  },
  {
    url: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1200&q=80',
    title: 'Auditorium Graduation Stage',
    category: 'college',
  },
  {
    url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1200&q=80',
    title: 'College Friends Together',
    category: 'college',
  },
  {
    url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200&q=80',
    title: 'Campus Fest & Dance Night',
    category: 'college',
  },
  {
    url: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=1200&q=80',
    title: 'Campus Seminar & Hall',
    category: 'college',
  },

  // Corporate & Tech
  {
    url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&q=80',
    title: 'Tech Keynote & Big Screen',
    category: 'corporate',
  },
  {
    url: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=1200&q=80',
    title: 'Corporate Summit Stage',
    category: 'corporate',
  },
  {
    url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=1200&q=80',
    title: 'Networking & Gala Evening',
    category: 'corporate',
  },
  {
    url: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=1200&q=80',
    title: 'Conference Presentation Stage',
    category: 'corporate',
  },
  {
    url: 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=1200&q=80',
    title: 'Team Workshop & Roundtable',
    category: 'corporate',
  },

  // Festivals & Culture
  {
    url: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=1200&q=80',
    title: 'Diwali Diyas & Golden Light',
    category: 'festivals',
  },
  {
    url: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=1200&q=80',
    title: 'Holi Colors & Celebration',
    category: 'festivals',
  },
  {
    url: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=1200&q=80',
    title: 'Floating Sky Lanterns',
    category: 'festivals',
  },
  {
    url: 'https://images.unsplash.com/photo-1512389142860-9c449e58a543?w=1200&q=80',
    title: 'Festive Warm Lights & Decor',
    category: 'festivals',
  },
  {
    url: 'https://images.unsplash.com/photo-1567653418876-5bb0e566e1c2?w=1200&q=80',
    title: 'Traditional Cultural Setup',
    category: 'festivals',
  },

  // Travel & Outdoors
  {
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&q=80',
    title: 'Tropical Beach Sunset',
    category: 'travel',
  },
  {
    url: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1200&q=80',
    title: 'Scenic Mountain Road Trip',
    category: 'travel',
  },
  {
    url: 'https://images.unsplash.com/photo-1510312305653-8ed496efae75?w=1200&q=80',
    title: 'Campfire & Starry Sky',
    category: 'travel',
  },
  {
    url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1200&q=80',
    title: 'Luxury Resort Poolside',
    category: 'travel',
  },
  {
    url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&q=80',
    title: 'Majestic Valley & Peaks',
    category: 'travel',
  },

  // Aesthetic & Minimal
  {
    url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&q=80',
    title: 'Warm Bokeh Fairy Lights',
    category: 'aesthetic',
  },
  {
    url: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=1200&q=80',
    title: 'Neon Violet & Magenta Gradient',
    category: 'aesthetic',
  },
  {
    url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1200&q=80',
    title: 'Minimal Botanical Shadows',
    category: 'aesthetic',
  },
  {
    url: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=1200&q=80',
    title: 'Golden Glow & Velvet Shadows',
    category: 'aesthetic',
  },
  {
    url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1200&q=80',
    title: 'Cosmic Night Sky Stars',
    category: 'aesthetic',
  },
];

interface CoverImageSelectorProps {
  value: string;
  onChange: (url: string) => void;
  eventTitle?: string;
  eventType?: string;
  eventDate?: string;
  eventLocation?: string;
}

export function CoverImageSelector({
  value,
  onChange,
  eventTitle,
  eventType,
  eventDate,
  eventLocation,
}: CoverImageSelectorProps) {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [customUploads, setCustomUploads] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [customUrl, setCustomUrl] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync category when eventType changes initially if user hasn't explicitly navigated
  useEffect(() => {
    if (!eventType) return;
    const typeMap: Record<string, string> = {
      'Wedding': 'wedding',
      'Birthday': 'birthday',
      'College Event': 'college',
      'School Event': 'college',
      'Corporate': 'corporate',
      'Family Function': 'festivals',
    };
    const mapped = typeMap[eventType];
    if (mapped) {
      setActiveCategory(mapped);
    }
  }, [eventType]);

  // Check if current value is a custom uploaded image (data URL or not in preset list)
  const isCustomImage = value.startsWith('data:') || value.startsWith('blob:') || !CATEGORIZED_PRESETS.some(p => p.url === value);

  // Filtered presets
  const filteredPresets = activeCategory === 'all'
    ? CATEGORIZED_PRESETS
    : CATEGORIZED_PRESETS.filter(p => p.category === activeCategory);

  // Handle file reading
  const processImageFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload a valid image file (JPG, PNG, WEBP, etc.)');
      return;
    }

    // Max 15MB
    if (file.size > 15 * 1024 * 1024) {
      toast.error('Image size should be less than 15MB');
      return;
    }

    setIsProcessing(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (dataUrl) {
        setCustomUploads(prev => [dataUrl, ...prev.filter(u => u !== dataUrl)]);
        onChange(dataUrl);
        toast.success('Custom cover image applied!');
      }
      setIsProcessing(false);
    };
    reader.onerror = () => {
      toast.error('Failed to read image file');
      setIsProcessing(false);
    };
    reader.readAsDataURL(file);
  }, [onChange]);

  // Drag & drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processImageFile(files[0]);
    }
  };

  // URL Apply handler
  const handleApplyUrl = () => {
    if (!customUrl.trim()) return;
    try {
      const urlObj = new URL(customUrl.trim());
      if (urlObj.protocol === 'http:' || urlObj.protocol === 'https:') {
        setCustomUploads(prev => [customUrl.trim(), ...prev.filter(u => u !== customUrl.trim())]);
        onChange(customUrl.trim());
        setCustomUrl('');
        setShowUrlInput(false);
        toast.success('Cover image link applied!');
      } else {
        toast.error('Please enter a valid HTTP or HTTPS image URL');
      }
    } catch {
      toast.error('Please enter a valid URL (e.g. https://...)');
    }
  };

  // Revert / remove custom image
  const handleResetToPreset = () => {
    const defaultPreset = CATEGORIZED_PRESETS[0].url;
    onChange(defaultPreset);
    toast('Reverted to default cover preset', { icon: '🔄' });
  };

  return (
    <div className="space-y-4">
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif,image/avif"
        className="hidden"
        onChange={(e) => {
          const files = e.target.files;
          if (files && files.length > 0) {
            processImageFile(files[0]);
          }
          // Reset value so same file can be chosen again if desired
          e.target.value = '';
        }}
      />

      {/* ── Live Banner Preview Card ── */}
      <div className="relative rounded-2xl overflow-hidden border border-purple-500/30 bg-surface-900/90 shadow-xl group">
        <div className="relative aspect-[21/9] sm:aspect-[24/9] w-full max-h-[220px] overflow-hidden">
          <img
            src={value}
            alt="Event Cover Preview"
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />

          {/* Gradient Overlay for Readable Text */}
          <div className="absolute inset-0 bg-gradient-to-t from-surface-950 via-surface-950/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-surface-950/70 via-transparent to-transparent" />

          {/* Badge & Quick Action in Top Bar */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
            <div className="pointer-events-auto flex items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide backdrop-blur-md border ${
                isCustomImage
                  ? 'bg-purple-600/70 border-purple-400/50 text-white shadow-lg shadow-purple-500/30'
                  : 'bg-black/50 border-white/15 text-purple-200'
              }`}>
                {isCustomImage ? (
                  <>
                    <Camera className="w-3 h-3 text-purple-300" />
                    Custom Uploaded Cover
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3 h-3 text-purple-400" />
                    Cover Preview
                  </>
                )}
              </span>
            </div>

            {/* Top Right Action */}
            <div className="pointer-events-auto flex items-center gap-2">
              {isCustomImage && (
                <button
                  type="button"
                  onClick={handleResetToPreset}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-red-500/20 text-red-300 border border-red-500/30 hover:bg-red-500/30 backdrop-blur-md transition-all cursor-pointer"
                  title="Switch back to preset"
                >
                  <Trash2 className="w-3 h-3" />
                  Reset
                </button>
              )}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-white/15 hover:bg-white/25 text-white border border-white/20 backdrop-blur-md transition-all shadow-md cursor-pointer active:scale-95"
              >
                <Upload className="w-3 h-3 text-purple-300" />
                Upload New
              </button>
            </div>
          </div>

          {/* Bottom Event Meta Overlay */}
          <div className="absolute bottom-3 left-4 right-4 pointer-events-none">
            <p className="text-[11px] font-medium uppercase tracking-wider text-purple-300/80 mb-0.5">
              {eventType || 'Event Gallery'}
            </p>
            <h3 className="text-base sm:text-xl font-bold text-white tracking-tight drop-shadow-md truncate">
              {eventTitle && eventTitle.trim() ? eventTitle : 'Your Event Title'}
            </h3>
            {(eventDate || eventLocation) && (
              <p className="text-xs text-white/80 font-normal mt-0.5 flex items-center gap-2 drop-shadow">
                {eventDate && <span>📅 {eventDate}</span>}
                {eventDate && eventLocation && <span className="opacity-40">•</span>}
                {eventLocation && <span>📍 {eventLocation}</span>}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── Action Bar: Upload Trigger & Mode Switches ── */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1">
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-white flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-purple-400" />
            Select Cover Image
          </label>
          <span className="text-[11px] text-muted">
            ({filteredPresets.length} presets available)
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Direct URL input toggle */}
          <button
            type="button"
            onClick={() => setShowUrlInput(!showUrlInput)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all border ${
              showUrlInput
                ? 'bg-purple-600/30 border-purple-500/60 text-white'
                : 'glass-light border-white/10 text-secondary hover:text-white hover:border-purple-500/30'
            }`}
          >
            <Link2 className="w-3 h-3 text-purple-400" />
            Paste Image URL
          </button>

          {/* Primary Upload Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-md shadow-purple-600/25 transition-all cursor-pointer active:scale-95"
          >
            <Upload className="w-3.5 h-3.5" />
            Upload My Image
          </button>
        </div>
      </div>

      {/* ── Optional URL Input Panel ── */}
      <AnimatePresence>
        {showUrlInput && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-3 rounded-xl bg-surface-900 border border-purple-500/30 flex flex-col sm:flex-row items-center gap-2 shadow-lg">
              <div className="relative flex-1 w-full">
                <ExternalLink className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                <input
                  type="url"
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleApplyUrl()}
                  placeholder="Paste direct image link (e.g. https://.../photo.jpg)"
                  className="w-full bg-surface-950/80 text-xs text-white pl-9 pr-3 py-2 rounded-lg border border-white/10 focus:border-purple-500 focus:outline-none placeholder:text-muted"
                />
              </div>
              <button
                type="button"
                onClick={handleApplyUrl}
                disabled={!customUrl.trim()}
                className="w-full sm:w-auto px-4 py-2 rounded-lg text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white disabled:opacity-40 disabled:hover:bg-purple-600 transition-all cursor-pointer whitespace-nowrap"
              >
                Apply Cover
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Custom Uploads Tray (if user uploaded photos during session) ── */}
      {customUploads.length > 0 && (
        <div className="p-3 rounded-xl bg-purple-950/20 border border-purple-500/20 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-purple-300 flex items-center gap-1.5">
              <Camera className="w-3 h-3 text-purple-400" />
              Your Uploaded Images ({customUploads.length})
            </span>
            <span className="text-[11px] text-muted">Click any to apply as cover</span>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
            {customUploads.map((imgUrl, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onChange(imgUrl)}
                className={`relative flex-shrink-0 w-24 aspect-video rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                  value === imgUrl
                    ? 'border-purple-400 ring-2 ring-purple-500/50 scale-105 shadow-md shadow-purple-500/30'
                    : 'border-transparent opacity-70 hover:opacity-100 hover:border-purple-400/50'
                }`}
              >
                <img src={imgUrl} alt={`Custom upload ${idx + 1}`} className="w-full h-full object-cover" />
                {value === imgUrl && (
                  <div className="absolute inset-0 bg-purple-900/40 flex items-center justify-center">
                    <Check className="w-4 h-4 text-white drop-shadow" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Category Filter Pills ── */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-0.5 no-scrollbar">
        {COVER_CATEGORIES.map(cat => {
          const count = cat.id === 'all'
            ? CATEGORIZED_PRESETS.length
            : CATEGORIZED_PRESETS.filter(p => p.category === cat.id).length;
          const isActive = activeCategory === cat.id;

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                isActive
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30 ring-1 ring-purple-400/40'
                  : 'bg-surface-800/80 text-secondary border border-white/5 hover:text-white hover:bg-surface-700 hover:border-purple-500/20'
              }`}
            >
              <span>{cat.emoji}</span>
              <span>{cat.name}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                isActive ? 'bg-purple-800/80 text-purple-200' : 'bg-white/5 text-muted'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Presets & Drag-and-Drop Grid ── */}
      <div
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* Upload Card as First Item */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className={`relative aspect-video rounded-xl border-2 border-dashed flex flex-col items-center justify-center p-3 text-center cursor-pointer transition-all group overflow-hidden ${
            isDragging
              ? 'border-purple-400 bg-purple-950/40 scale-[1.02] shadow-lg shadow-purple-500/30'
              : 'border-purple-500/40 bg-surface-900/60 hover:border-purple-400 hover:bg-surface-800/80'
          }`}
        >
          {/* Subtle animated background glow on hover */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-indigo-600/10 opacity-0 group-hover:opacity-100 transition-opacity" />

          <div className="relative z-10 flex flex-col items-center gap-1">
            <div className="w-8 h-8 rounded-full bg-purple-600/20 group-hover:bg-purple-600/40 flex items-center justify-center text-purple-300 transition-colors">
              {isProcessing ? (
                <div className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Upload className="w-4 h-4" />
              )}
            </div>
            <p className="text-xs font-semibold text-white group-hover:text-purple-200 transition-colors">
              Upload Custom
            </p>
            <p className="text-[10px] text-muted leading-tight">
              Drop photo or browse
            </p>
          </div>
        </div>

        {/* Preset Cards */}
        {filteredPresets.map((preset) => {
          const isSelected = value === preset.url;
          return (
            <button
              key={preset.url}
              type="button"
              onClick={() => onChange(preset.url)}
              className={`group relative aspect-video rounded-xl overflow-hidden text-left border-2 transition-all cursor-pointer ${
                isSelected
                  ? 'border-purple-500 ring-2 ring-purple-500/50 scale-[1.02] shadow-lg shadow-purple-500/25'
                  : 'border-transparent opacity-75 hover:opacity-100 hover:border-purple-500/40 hover:scale-[1.01]'
              }`}
            >
              <img
                src={preset.url}
                alt={preset.title}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />

              {/* Gradient scrim for title */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-70 group-hover:opacity-90 transition-opacity" />

              {/* Title & checkmark */}
              <div className="absolute bottom-1.5 left-2 right-2 flex items-center justify-between">
                <span className="text-[11px] font-medium text-white/90 truncate drop-shadow pr-1">
                  {preset.title}
                </span>
                {isSelected && (
                  <div className="w-4 h-4 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0 shadow">
                    <Check className="w-2.5 h-2.5 text-white" />
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <p className="text-[11px] text-muted flex items-center gap-1.5 pt-0.5">
        <Info className="w-3.5 h-3.5 text-purple-400/80 flex-shrink-0" />
        Choose from curated categories or upload any photo from your phone or PC (up to 15MB).
      </p>
    </div>
  );
}
