import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, ProtectedRoute, GuestRoute } from '@/features/auth';
import {
  LandingPage,
  AuthPage,
  ForgotPasswordPage,
  DashboardPage,
  CreateEventPage,
  EventPage,
  EventSettingsPage,
  DownloadCenterPage,
  FindMyPhotosPage,
  NotFoundPage,
  AboutPage,
  BlogPage,
  CareersPage,
  ContactPage,
  LegalPage,
  FindMyPhotosHubPage,
} from '@/pages';

function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const element = document.querySelector(hash);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
        return;
      }
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pathname, hash]);

  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/careers" element={<CareersPage />} />
          <Route path="/contact" element={<ContactPage />} />

          {/* Legal routes */}
          <Route path="/privacy" element={<LegalPage initialTab="privacy" />} />
          <Route path="/terms" element={<LegalPage initialTab="terms" />} />
          <Route path="/cookies" element={<LegalPage initialTab="cookies" />} />
          <Route path="/gdpr" element={<LegalPage initialTab="gdpr" />} />
          <Route path="/legal" element={<LegalPage initialTab="privacy" />} />

          {/* Event routes */}
          <Route path="/find-my-photos" element={<FindMyPhotosHubPage />} />
          <Route path="/event/:id" element={<EventPage />} />
          <Route path="/event/:id/find-my-photos" element={<FindMyPhotosPage />} />
          <Route path="/event/:id/settings" element={<ProtectedRoute><EventSettingsPage /></ProtectedRoute>} />
          <Route path="/event/:id/downloads" element={<DownloadCenterPage />} />

          {/* Auth routes (redirect if already logged in) */}
          <Route path="/login" element={<GuestRoute><AuthPage /></GuestRoute>} />
          <Route path="/signup" element={<GuestRoute><AuthPage /></GuestRoute>} />
          <Route path="/auth" element={<GuestRoute><AuthPage /></GuestRoute>} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

          {/* Protected routes */}
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/create-event" element={<ProtectedRoute><CreateEventPage /></ProtectedRoute>} />

          {/* 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>

        {/* Toast notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#151228',
              color: '#f8f7ff',
              border: '1px solid rgba(124, 58, 237, 0.25)',
              borderRadius: '0.75rem',
              fontSize: '0.875rem',
              fontFamily: 'Inter, sans-serif',
            },
            success: {
              iconTheme: { primary: '#6ee7b7', secondary: '#151228' },
            },
            error: {
              iconTheme: { primary: '#fca5a5', secondary: '#151228' },
            },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  );
}
