import { Link } from 'react-router-dom';
import { MessageCircle, Globe2, Briefcase, Code2, Heart } from 'lucide-react';

const footerLinks = {
  Product: [
    { label: 'Features', href: '#features' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'Demo', href: '/event/evt-1' },
  ],
  Platform: [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Create Event', href: '/create-event' },
    { label: 'Find My Photos', href: '/find-my-photos' },
  ],
  Company: [
    { label: 'About', href: '#' },
    { label: 'Blog', href: '#' },
    { label: 'Careers', href: '#' },
    { label: 'Contact', href: '#' },
  ],
  Legal: [
    { label: 'Privacy Policy', href: '#' },
    { label: 'Terms of Service', href: '#' },
    { label: 'Cookie Policy', href: '#' },
    { label: 'GDPR', href: '#' },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-purple-900/20 mt-auto">
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
              {[MessageCircle, Globe2, Briefcase, Code2].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-8 h-8 glass-light rounded-lg flex items-center justify-center hover:bg-purple-500/20 hover:border-purple-500/40 transition-all text-secondary hover:text-purple-300"
                >
                  <Icon className="w-3.5 h-3.5" />
                </a>
              ))}
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
          {/* Subtle credit — not in header, quietly in footer */}
          <p className="text-xs text-muted/50 flex items-center gap-1">
            Made with <Heart className="w-3 h-3 text-red-400/70" /> by{' '}
            <span className="text-purple-400/60 font-medium">Kishan Yadav</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
