import { Link } from 'react-router-dom';
import { MessageCircle, Globe2, Briefcase, Code2, Heart } from 'lucide-react';

const footerLinks = {
  Product: [
    { label: 'Features', href: '/#features' },
    { label: 'How It Works', href: '/#how-it-works' },
    { label: 'Pricing', href: '/#pricing' },
    { label: 'Demo', href: '/event/evt-1' },
  ],
  Platform: [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Create Event', href: '/create-event' },
    { label: 'Find My Photos', href: '/find-my-photos' },
  ],
  Company: [
    { label: 'About', href: '/about' },
    { label: 'Blog', href: '/blog' },
    { label: 'Careers', href: '/careers' },
    { label: 'Contact', href: '/contact' },
  ],
  Legal: [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Cookie Policy', href: '/cookies' },
    { label: 'GDPR', href: '/gdpr' },
  ],
};

const SOCIAL_LINKS = [
  { icon: MessageCircle, href: 'https://wa.me/?text=Hello%20SnapMemory%20Team!', label: 'WhatsApp Community', external: true },
  { icon: Globe2, href: '/', label: 'SnapMemory Platform', external: false },
  { icon: Briefcase, href: '/careers', label: 'Careers at SnapMemory', external: false },
  { icon: Code2, href: 'https://github.com/kishan0701/snapmemory', label: 'GitHub Repository', external: true },
];

export function Footer() {
  return (
    <footer className="border-t border-purple-900/20 mt-auto bg-[#0a0817]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2">
            <Link to="/" className="flex items-center gap-2.5 mb-4 group">
              <img
                src="/logo.png"
                alt="SnapMemory"
                className="w-8 h-8 rounded-lg object-cover"
              />
              <span className="text-lg font-bold text-white">
                Snap<span className="gradient-text-brand">Memory</span>
              </span>
            </Link>
            <p className="text-sm text-secondary leading-relaxed mb-5 max-w-xs">
              Every Event. Every Memory. One Place. The premium platform for event photo and video sharing.
            </p>
            <div className="flex items-center gap-2">
              {SOCIAL_LINKS.map((item, i) =>
                item.external ? (
                  <a
                    key={i}
                    href={item.href}
                    target="_blank"
                    rel="noreferrer"
                    title={item.label}
                    className="w-8 h-8 glass-light rounded-lg flex items-center justify-center hover:bg-purple-500/20 hover:border-purple-500/40 transition-all text-secondary hover:text-purple-300"
                  >
                    <item.icon className="w-3.5 h-3.5" />
                  </a>
                ) : (
                  <Link
                    key={i}
                    to={item.href}
                    title={item.label}
                    className="w-8 h-8 glass-light rounded-lg flex items-center justify-center hover:bg-purple-500/20 hover:border-purple-500/40 transition-all text-secondary hover:text-purple-300"
                  >
                    <item.icon className="w-3.5 h-3.5" />
                  </Link>
                )
              )}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-4">{category}</h4>
              <ul className="space-y-2.5">
                {links.map(link => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      className="text-sm text-secondary hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="divider pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted">
            © {new Date().getFullYear()} SnapMemory. All rights reserved.
          </p>
          <p className="text-xs text-muted/50 flex items-center gap-1">
            Made with <Heart className="w-3 h-3 text-red-400/70" /> by{' '}
            <span className="text-purple-400/60 font-medium">Kishan Yadav</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
