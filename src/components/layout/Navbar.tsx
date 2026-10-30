import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell, Menu, X, ChevronDown, LogOut,
  Settings, User, LayoutDashboard, Plus, Zap
} from 'lucide-react';
import { useAuth } from '@/features/auth/AuthContext';
import { MOCK_NOTIFICATIONS } from '@/lib/mock-data';
import { getFirstLetter, getAvatarTheme, formatRelativeTime } from '@/lib/utils';

export function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const mobileBtnRef = useRef<HTMLButtonElement>(null);
  const mobileDrawerRef = useRef<HTMLDivElement>(null);

  const unreadCount = MOCK_NOTIFICATIONS.filter(n => !n.read_at).length;
  const avatarTheme = getAvatarTheme(user?.name);
  const firstLetter = getFirstLetter(user?.name);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setUserMenuOpen(false);
    setNotifOpen(false);
  }, [location.pathname]);

  // Close dropdowns when clicking anywhere outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node;
      if (notifRef.current && !notifRef.current.contains(target)) {
        setNotifOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(target)) {
        setUserMenuOpen(false);
      }
      if (
        mobileBtnRef.current &&
        !mobileBtnRef.current.contains(target) &&
        mobileDrawerRef.current &&
        !mobileDrawerRef.current.contains(target)
      ) {
        setMobileOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setUserMenuOpen(false);
        setNotifOpen(false);
        setMobileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const isLanding = location.pathname === '/';

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled || !isLanding
          ? 'glass border-b border-purple-900/20 shadow-lg shadow-black/20'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <img
              src="/logo.png"
              alt="SnapMemory"
              className="w-8 h-8 rounded-lg object-cover shadow-lg group-hover:shadow-purple-500/30 transition-shadow"
            />
            <span className="text-lg font-bold text-white tracking-tight">
              Snap<span className="gradient-text-brand">Memory</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {isLanding ? (
              <>
                <a href="#features" className="btn-ghost text-sm">Features</a>
                <a href="#how-it-works" className="btn-ghost text-sm">How It Works</a>
                <a href="#occasions" className="btn-ghost text-sm">Occasions</a>
              </>
            ) : isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    location.pathname === '/dashboard'
                      ? 'bg-purple-600/20 text-white border border-purple-500/30'
                      : 'text-secondary hover:text-white hover:bg-white/6'
                  }`}
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  Dashboard
                </Link>
                <button
                  onClick={() => {
                    if (location.pathname === '/dashboard') {
                      document.getElementById('my-events-section')?.scrollIntoView({ behavior: 'smooth' });
                    } else {
                      window.location.href = '/dashboard#my-events';
                    }
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all text-secondary hover:text-white hover:bg-white/6 focus:outline-none"
                >
                  My Events
                </button>
              </>
            ) : null}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <>
                {/* Create event button - compact on mobile */}
                <Link
                  to="/create-event"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-lg gradient-brand text-white text-xs font-semibold shadow-md shadow-purple-900/40 hover:opacity-90 transition-opacity"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span className="hidden xs:inline sm:inline">New Event</span>
                </Link>

                {/* Notifications */}
                <div ref={notifRef} className="relative">
                  <button
                    id="nav-notifications-btn"
                    onClick={() => { setNotifOpen(p => !p); setUserMenuOpen(false); }}
                    className="relative w-9 h-9 rounded-lg glass-light flex items-center justify-center hover:bg-white/10 transition-colors"
                    aria-label="Notifications"
                  >
                    <Bell className="w-4 h-4 text-secondary" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-purple-500 rounded-full text-white text-[10px] font-bold flex items-center justify-center">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  <AnimatePresence>
                    {notifOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-11 w-80 glass rounded-xl shadow-2xl shadow-black/40 overflow-hidden"
                      >
                        <div className="p-3 border-b border-purple-900/20">
                          <p className="text-sm font-semibold text-white">Notifications</p>
                        </div>
                        <div className="max-h-80 overflow-y-auto">
                          {MOCK_NOTIFICATIONS.map(notif => (
                            <div
                              key={notif.id}
                              onClick={() => setNotifOpen(false)}
                              className={`p-3 hover:bg-white/5 transition-colors border-b border-purple-900/10 last:border-0 cursor-pointer ${
                                !notif.read_at ? 'bg-purple-900/10' : ''
                              }`}
                            >
                              <p className="text-xs text-white leading-relaxed">{notif.message}</p>
                              <p className="text-[11px] text-muted mt-1">{formatRelativeTime(notif.created_at)}</p>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* User menu */}
                <div ref={userMenuRef} className="relative">
                  <button
                    id="nav-user-menu-btn"
                    onClick={() => { setUserMenuOpen(p => !p); setNotifOpen(false); }}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-white/8 transition-all border border-transparent hover:border-purple-500/20"
                    title={user?.name || 'Account'}
                  >
                    {/* WhatsApp-style dynamic circular avatar with 1st letter */}
                    <div className={`w-8 h-8 rounded-full ${avatarTheme.bg} ring-2 ${avatarTheme.ring} flex items-center justify-center text-white text-xs font-black shadow-md shadow-black/40 select-none flex-shrink-0`}>
                      {firstLetter}
                    </div>
                    <span className="text-sm font-semibold text-white hidden sm:block max-w-28 truncate">
                      {user?.name}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-purple-300/60 hidden sm:block" />
                  </button>

                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-11 w-60 glass rounded-2xl shadow-2xl shadow-black/60 overflow-hidden py-1 border border-purple-500/30"
                      >
                        {/* WhatsApp-style User Card inside Dropdown */}
                        <div className="px-3.5 py-3 border-b border-purple-900/30 mb-1 bg-purple-950/40 flex items-center gap-3">
                          <div className={`w-11 h-11 rounded-full ${avatarTheme.bg} ring-2 ${avatarTheme.ring} flex items-center justify-center text-white text-base font-black shadow-lg shadow-black/50 flex-shrink-0 select-none`}>
                            {firstLetter}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-bold text-white truncate">{user?.name}</p>
                            <p className="text-[11px] text-purple-300/70 truncate">{user?.email}</p>
                            <div className="mt-1 flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                              <span className="text-[10px] text-emerald-300 font-semibold uppercase tracking-wider">Account Active</span>
                            </div>
                          </div>
                        </div>

                        <Link
                          to="/dashboard"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-3.5 py-2 text-sm text-purple-200 hover:text-white hover:bg-white/8 transition-colors"
                        >
                          <LayoutDashboard className="w-4 h-4 text-purple-400" /> Dashboard
                        </Link>
                        <Link
                          to="/create-event"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-3.5 py-2 text-sm text-purple-200 hover:text-white hover:bg-white/8 transition-colors"
                        >
                          <Plus className="w-4 h-4 text-purple-400" /> Create Event
                        </Link>
                        
                        <div className="border-t border-purple-900/30 mt-1 pt-1">
                          <button
                            id="nav-logout-btn"
                            onClick={() => { setUserMenuOpen(false); logout(); }}
                            className="flex items-center gap-2.5 px-3.5 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors w-full text-left"
                          >
                            <LogOut className="w-4 h-4" /> Sign out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-xs sm:text-sm font-medium text-purple-300 hover:text-white transition-colors px-2 py-1.5 rounded-lg hover:bg-white/5"
                >
                  Sign in
                </Link>
                <Link
                  to="/signup"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg gradient-brand text-white text-xs font-semibold shadow-md shadow-purple-900/40 hover:opacity-90 transition-opacity"
                >
                  <Zap className="w-3 h-3" />
                  <span>Get Started</span>
                </Link>
              </>
            )}

            {/* Mobile menu toggle */}
            <button
              id="nav-mobile-menu-btn"
              ref={mobileBtnRef}
              className="md:hidden w-9 h-9 glass-light rounded-lg flex items-center justify-center"
              onClick={() => setMobileOpen(p => !p)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            ref={mobileDrawerRef}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass border-t border-purple-900/20 overflow-hidden"
          >
            <nav className="px-4 py-3 space-y-1">
              {isLanding ? (
                <>
                  <a href="#features" onClick={() => setMobileOpen(false)} className="block py-2 text-sm text-secondary hover:text-white">Features</a>
                  <a href="#how-it-works" onClick={() => setMobileOpen(false)} className="block py-2 text-sm text-secondary hover:text-white">How It Works</a>
                  <a href="#occasions" onClick={() => setMobileOpen(false)} className="block py-2 text-sm text-secondary hover:text-white">Occasions</a>
                </>
              ) : null}
              {!isAuthenticated && (
                <>
                  <Link to="/login" onClick={() => setMobileOpen(false)} className="block py-2 text-sm text-secondary hover:text-white">Sign in</Link>
                  <Link to="/signup" onClick={() => setMobileOpen(false)} className="block py-2 text-sm font-medium text-purple-400 hover:text-purple-300">Get Started</Link>
                </>
              )}
              {isAuthenticated && (
                <>
                  <div className="flex items-center gap-3 p-2.5 mb-2 rounded-xl bg-purple-950/60 border border-purple-500/25">
                    <div className={`w-9 h-9 rounded-full ${avatarTheme.bg} ring-2 ${avatarTheme.ring} flex items-center justify-center text-white text-xs font-black shadow-md flex-shrink-0 select-none`}>
                      {firstLetter}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-white truncate">{user?.name}</p>
                      <p className="text-[10px] text-purple-300/70 truncate">{user?.email}</p>
                    </div>
                  </div>
                  <Link to="/dashboard" onClick={() => setMobileOpen(false)} className="block py-2 text-sm text-secondary hover:text-white">Dashboard</Link>
                  <Link to="/create-event" onClick={() => setMobileOpen(false)} className="block py-2 text-sm text-purple-400 hover:text-purple-300">+ New Event</Link>
                  <button onClick={() => { setMobileOpen(false); logout(); }} className="block py-2 text-sm text-red-400 hover:text-red-300 w-full text-left">Sign out</button>
                </>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
