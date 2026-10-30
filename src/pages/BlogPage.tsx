import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar, Footer } from '@/components/layout';
import {
  BookOpen,
  Calendar,
  Clock,
  User,
  ArrowRight,
  Sparkles,
  Tag,
  X,
  Share2,
  CheckCircle,
  ThumbsUp,
  Search
} from 'lucide-react';
import toast from 'react-hot-toast';

interface BlogPost {
  id: string;
  title: string;
  summary: string;
  category: 'AI & Vision' | 'Wedding' | 'Event Tech' | 'Guides';
  author: string;
  authorRole: string;
  date: string;
  readTime: string;
  cover: string;
  tags: string[];
  content: string[];
  takeaways: string[];
}

const POSTS: BlogPost[] = [
  {
    id: 'post-1',
    title: 'How On-Device AI Face Recognition is Revolutionizing Indian Weddings',
    summary: 'Indian weddings generate upwards of 3,000 photos across 3 days. Here is how running 128-D facial vector embeddings in the browser lets guests find their memories in 2 seconds without privacy risk.',
    category: 'AI & Vision',
    author: 'Kishan Yadav',
    authorRole: 'Founder & Tech Lead',
    date: 'Oct 24, 2026',
    readTime: '4 min read',
    cover: 'https://images.unsplash.com/photo-1469371670807-013ccf25f16a?w=800&q=80',
    tags: ['AI', 'Computer Vision', 'Weddings', 'face-api'],
    takeaways: [
      'Browsers can now run SSD MobileNet and 68-point landmark detection locally via WebGL.',
      'Guests do not need to upload their biometric face data to foreign cloud servers.',
      'Average search time drops from 45 minutes of manual scrolling to 1.8 seconds.',
    ],
    content: [
      'The modern wedding photographer delivers a Google Drive link with thousands of photos. While stunning, finding photos of yourself, your grandparents, or your childhood friends feels like searching for a needle in a digital haystack.',
      'SnapMemory changes this paradigm by using on-device neural networks powered by face-api.js. When a guest uploads a selfie, a 128-dimensional mathematical vector descriptor is calculated entirely inside the browser RAM.',
      'The client then calculates Euclidean distances against the pre-indexed photo bounding boxes. If the distance is under 0.60, a match is verified instantly. No raw selfie leaves the phone, and no facial biometrics are stored permanently on server disks.',
      'The result? Guests experience absolute delight finding their laughter, dance steps, and moments within seconds of opening the gallery.',
    ],
  },
  {
    id: 'post-2',
    title: 'Why WhatsApp Compression is Ruining Your Event Photos (And How to Fix It)',
    summary: 'When family members share wedding and party photos over messaging apps, up to 90% of image fidelity is destroyed. Here is what happens under the hood.',
    category: 'Guides',
    author: 'Priya Mehta',
    authorRole: 'Wedding Photographer',
    date: 'Oct 18, 2026',
    readTime: '5 min read',
    cover: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80',
    tags: ['Photography', 'Compression', 'Event Tips', 'Storage'],
    takeaways: [
      'Standard messaging algorithms downsample 24MP sensor photos down to ~1.2MP.',
      'Crucial EXIF metadata like capture timestamp and camera sensor profiles are stripped.',
      'SnapMemory retains original lossless JPEG & WebP quality with high dynamic range.',
    ],
    content: [
      'Every wedding photographer knows the heartbreak: you shoot with a ₹3,00,000 full-frame camera and prime lens, deliver crystalline 6000x4000 photos, only to see guests screenshot them or forward them three times on WhatsApp.',
      'WhatsApp compresses images from 8MB down to 180KB, crushing shadow details, introducing blocky compression artifacts, and stripping color profiles.',
      'By providing a seamless QR-code powered web platform, SnapMemory enables instant original-quality downloads. When guests download a photo, they receive the full dynamic range captured by the lens, ready for framing and printing.',
    ],
  },
  {
    id: 'post-3',
    title: 'Organizing College Fests with SnapMemory: 2,000+ Students, Zero Chaos',
    summary: 'Case study on how the TSDC Annual Fest replaced scattered Google Forms and Telegram drives with a centralized, collaborative event gallery.',
    category: 'Event Tech',
    author: 'Rahul Verma',
    authorRole: 'Fest Convener',
    date: 'Oct 10, 2026',
    readTime: '3 min read',
    cover: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&q=80',
    tags: ['College Fest', 'Case Study', 'QR Sharing'],
    takeaways: [
      'Over 240+ photos and 12 stage clips collected across 7 distinct albums.',
      'QR banners placed at main gates and stage sideboards enabled friction-free student access.',
      'Contributor approval workflows kept troll and spam uploads at exactly 0%.',
    ],
    content: [
      'College festivals are electric, high-energy events. But historically, collecting memories from the media team, student council, and attendees meant tracking 10 different Google Drive folders with permission requests.',
      'For TSDC Fest 2026, we generated an event QR code and printed it on volunteer badges and food stall banners. Students could immediately view the live stream of stage events, dance competitions, and backstage moments.',
      'Student contributors submitted photos with one tap, while event moderators approved submissions from the host dashboard in real-time.',
    ],
  },
  {
    id: 'post-4',
    title: 'The Blueprint for Creating High-Conversion Event QR Code Displays',
    summary: 'Practical tips for event hosts and decorators: where and how to place QR codes so that 80%+ of guests actually scan and contribute their photos.',
    category: 'Wedding',
    author: 'Sneha Kapoor',
    authorRole: 'Event Experience Designer',
    date: 'Sep 29, 2026',
    readTime: '4 min read',
    cover: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&q=80',
    tags: ['Event Planning', 'QR Codes', 'Guest Experience'],
    takeaways: [
      'Table tents and dinner menu cards yield 4x more scans than a single entrance banner.',
      'Clear call-to-actions ("Scan to see today\'s photos & upload yours") beat generic labels.',
      'Include a live photo counter to gamify guest participation.',
    ],
    content: [
      'Having a QR code for your event is only half the battle. If guests don’t know what the code does or don’t notice it, your shared gallery will remain empty.',
      'Our data across 120+ events shows that table cards placed where guests sit during dinner have the highest scan rate. Guests naturally reach for their phones between courses and performances.',
      'SnapMemory’s built-in QR generator lets you download print-ready high-contrast QR codes formatted perfectly for 4x6 acrylic stands.',
    ],
  },
];

const CATEGORIES = ['All', 'AI & Vision', 'Wedding', 'Event Tech', 'Guides'];

export function BlogPage() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activePost, setActivePost] = useState<BlogPost | null>(null);
  const [newsletterEmail, setNewsletterEmail] = useState('');

  const filteredPosts = POSTS.filter(post => {
    const matchesCat = selectedCategory === 'All' || post.category === selectedCategory;
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim() || !newsletterEmail.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }
    toast.success('Subscribed successfully! You will receive new guides directly.');
    setNewsletterEmail('');
  };

  const handleShare = (post: BlogPost) => {
    if (navigator.share) {
      navigator.share({
        title: post.title,
        text: post.summary,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(`${window.location.origin}/blog#${post.id}`);
      toast.success('Article link copied to clipboard!');
    }
  };

  return (
    <div className="min-h-screen bg-[#0c0a1a] flex flex-col text-white selection:bg-purple-500 selection:text-white">
      <Navbar />

      <main className="flex-1">
        {/* ── Hero Section ── */}
        <section className="relative pt-32 pb-16 px-4 sm:px-6 max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/25 text-xs font-semibold text-purple-300 mb-6">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Engineering, Photography &amp; Product Guides</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight mb-4">
            SnapMemory{' '}
            <span className="bg-gradient-to-r from-purple-400 via-fuchsia-300 to-indigo-400 bg-clip-text text-transparent">
              Stories &amp; Guides
            </span>
          </h1>
          <p className="text-secondary text-sm sm:text-base max-w-xl mx-auto mb-10">
            Insights on computer vision, event photography, guest engagement, and modern memory preservation.
          </p>

          {/* Search & Category Pills */}
          <div className="max-w-2xl mx-auto space-y-4">
            <div className="relative">
              <Search className="w-4 h-4 text-muted absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search articles by keyword or tag (e.g. AI, Weddings)..."
                className="input pl-11 py-2.5 w-full bg-purple-950/20 border-purple-500/20 text-sm focus:border-purple-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-white text-xs"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    selectedCategory === cat
                      ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                      : 'bg-surface-800 text-secondary hover:text-white border border-purple-900/30'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ── Articles Grid ── */}
        <section className="py-10 px-4 sm:px-6 max-w-6xl mx-auto">
          {filteredPosts.length === 0 ? (
            <div className="card p-12 text-center max-w-md mx-auto">
              <p className="text-muted text-sm mb-3">No articles match your search.</p>
              <button
                onClick={() => { setSelectedCategory('All'); setSearchQuery(''); }}
                className="btn-secondary text-xs"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-8">
              {filteredPosts.map((post, i) => (
                <motion.article
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="card group overflow-hidden border border-purple-500/20 bg-gradient-to-br from-[#15112c] to-[#0d0920] flex flex-col hover:border-purple-500/50 transition-all duration-300"
                >
                  <div className="h-48 relative overflow-hidden">
                    <img
                      src={post.cover}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#15112c] via-transparent to-transparent" />
                    <span className="absolute top-3 left-3 badge badge-purple text-[10px] font-bold">
                      {post.category}
                    </span>
                  </div>

                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-3 text-xs text-muted mb-3">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" /> {post.date}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" /> {post.readTime}
                        </span>
                      </div>

                      <h2 className="text-xl font-bold text-white group-hover:text-purple-300 transition-colors line-clamp-2 mb-3">
                        {post.title}
                      </h2>

                      <p className="text-sm text-secondary leading-relaxed line-clamp-3 mb-5">
                        {post.summary}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-purple-900/20 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-purple-600/30 border border-purple-500/40 flex items-center justify-center text-xs font-bold text-purple-300">
                          {post.author.slice(0, 1)}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white leading-none">{post.author}</p>
                          <p className="text-[10px] text-muted">{post.authorRole}</p>
                        </div>
                      </div>

                      <button
                        onClick={() => setActivePost(post)}
                        className="text-xs font-bold text-purple-400 group-hover:text-purple-300 flex items-center gap-1.5 transition-colors"
                      >
                        Read Full <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          )}
        </section>

        {/* ── Newsletter Section ── */}
        <section className="py-16 px-4 sm:px-6 max-w-4xl mx-auto">
          <div className="card p-8 sm:p-10 border border-purple-500/30 bg-gradient-to-r from-purple-950/40 via-[#181235] to-indigo-950/40 text-center">
            <Sparkles className="w-8 h-8 text-purple-400 mx-auto mb-3" />
            <h3 className="text-2xl font-black text-white mb-2">Subscribe to Tech &amp; Photo Guides</h3>
            <p className="text-sm text-secondary max-w-md mx-auto mb-6">
              Get bi-weekly teardowns on WebGL computer vision, event photography workflows, and feature releases.
            </p>

            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                value={newsletterEmail}
                onChange={e => setNewsletterEmail(e.target.value)}
                placeholder="Enter your email address..."
                className="input flex-1 bg-surface-900 text-sm focus:border-purple-400"
              />
              <button type="submit" className="btn-primary whitespace-nowrap">
                Subscribe Free
              </button>
            </form>
          </div>
        </section>
      </main>

      {/* ── Reader Modal ── */}
      <AnimatePresence>
        {activePost && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="card max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-purple-500/30 bg-[#120e29] p-6 sm:p-10 relative shadow-2xl"
            >
              <button
                onClick={() => setActivePost(null)}
                className="absolute top-5 right-5 w-8 h-8 rounded-full glass-light flex items-center justify-center text-secondary hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <span className="badge badge-purple text-xs font-bold mb-3">{activePost.category}</span>
              <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight mb-4">
                {activePost.title}
              </h2>

              <div className="flex flex-wrap items-center gap-4 text-xs text-muted mb-6 pb-6 border-b border-purple-900/30">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-purple-600/30 flex items-center justify-center font-bold text-purple-300">
                    {activePost.author.slice(0, 1)}
                  </div>
                  <div>
                    <span className="font-bold text-white">{activePost.author}</span> · {activePost.authorRole}
                  </div>
                </div>
                <span>•</span>
                <span>{activePost.date}</span>
                <span>•</span>
                <span>{activePost.readTime}</span>
              </div>

              <div className="rounded-2xl overflow-hidden h-64 mb-8">
                <img src={activePost.cover} alt={activePost.title} className="w-full h-full object-cover" />
              </div>

              {/* Key Takeaways */}
              <div className="card p-5 border border-purple-500/20 bg-purple-950/30 mb-8 space-y-2">
                <p className="text-xs font-bold text-purple-300 uppercase tracking-widest flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> Key Takeaways
                </p>
                {activePost.takeaways.map(t => (
                  <div key={t} className="flex items-start gap-2 text-sm text-secondary">
                    <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <span>{t}</span>
                  </div>
                ))}
              </div>

              {/* Body */}
              <div className="space-y-4 text-sm sm:text-base text-secondary leading-relaxed">
                {activePost.content.map((paragraph, idx) => (
                  <p key={idx}>{paragraph}</p>
                ))}
              </div>

              {/* Tags & Share */}
              <div className="mt-8 pt-6 border-t border-purple-900/30 flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-2">
                  {activePost.tags.map(tag => (
                    <span key={tag} className="badge bg-purple-900/30 text-purple-300 border border-purple-700/30 text-xs">
                      #{tag}
                    </span>
                  ))}
                </div>

                <button
                  onClick={() => handleShare(activePost)}
                  className="btn-secondary text-xs flex items-center gap-1.5"
                >
                  <Share2 className="w-3.5 h-3.5" /> Share Article
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
