import { useState, useEffect } from 'react';
import { Navbar, Footer } from '@/components/layout';
import {
  Shield,
  FileText,
  Cookie,
  Globe2,
  Lock,
  CheckCircle2,
  Calendar,
  Sparkles,
  Download
} from 'lucide-react';

interface LegalPageProps {
  initialTab?: 'privacy' | 'terms' | 'cookies' | 'gdpr';
}

export function LegalPage({ initialTab = 'privacy' }: LegalPageProps) {
  const [activeTab, setActiveTab] = useState<'privacy' | 'terms' | 'cookies' | 'gdpr'>(initialTab);

  useEffect(() => {
    setActiveTab(initialTab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [initialTab]);

  const tabs = [
    { id: 'privacy', label: 'Privacy Policy', icon: Shield },
    { id: 'terms', label: 'Terms of Service', icon: FileText },
    { id: 'cookies', label: 'Cookie Policy', icon: Cookie },
    { id: 'gdpr', label: 'GDPR & DPDP', icon: Globe2 },
  ] as const;

  return (
    <div className="min-h-screen bg-[#0c0a1a] flex flex-col text-white selection:bg-purple-500 selection:text-white">
      <Navbar />

      <main className="flex-1 pt-32 pb-20 px-4 sm:px-6 max-w-5xl mx-auto w-full">
        {/* ── Header ── */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/25 text-xs font-semibold text-purple-300 mb-4">
            <Lock className="w-3.5 h-3.5" />
            <span>Transparency &amp; Legal Protection</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-3">
            Legal &amp; Privacy Center
          </h1>
          <p className="text-secondary text-sm max-w-lg mx-auto flex items-center justify-center gap-2">
            <Calendar className="w-4 h-4 text-purple-400" /> Last updated: October 2026 · Effective Immediately
          </p>
        </div>

        {/* ── Navigation Tabs ── */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10 pb-4 border-b border-purple-900/20">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  window.scrollTo({ top: 200, behavior: 'smooth' });
                }}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                    : 'bg-surface-800 text-secondary hover:text-white border border-purple-900/30'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ── Content Card ── */}
        <div className="card p-6 sm:p-10 border border-purple-500/20 bg-gradient-to-br from-[#15112c] to-[#0d0920] space-y-8 text-secondary text-sm leading-relaxed">
          {/* ══════════════ PRIVACY POLICY ══════════════ */}
          {activeTab === 'privacy' && (
            <div className="space-y-6">
              <div className="border-b border-purple-900/30 pb-4">
                <h2 className="text-2xl font-black text-white">SnapMemory Privacy Policy</h2>
                <p className="text-xs text-muted mt-1">How we protect your photos, personal information, and facial privacy.</p>
              </div>

              <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/25 space-y-2">
                <p className="text-xs font-bold text-purple-300 uppercase tracking-widest flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> Core Privacy Guarantee
                </p>
                <p className="text-xs text-secondary leading-relaxed">
                  We never sell your photos, videos, or contact details to third parties or advertising brokers. Your memories belong to you and the event host.
                </p>
              </div>

              <div>
                <h3 className="text-base font-bold text-white mb-2">1. On-Device Facial Biometrics &amp; AI</h3>
                <p>
                  SnapMemory offers an AI-powered "Find My Photos" feature. When you upload a selfie:
                </p>
                <ul className="list-disc pl-5 space-y-1.5 mt-2">
                  <li><strong>Local Computation:</strong> Face landmarks and 128-dimensional mathematical vector descriptors are computed inside your local browser memory using WebGL and WebAssembly.</li>
                  <li><strong>No Biometric Storage:</strong> Your raw selfie image is discarded immediately after matching; it is never stored on persistent disk servers.</li>
                  <li><strong>Opt-Out:</strong> Any event host can disable the face-matching engine with a single toggle in Event Settings.</li>
                </ul>
              </div>

              <div>
                <h3 className="text-base font-bold text-white mb-2">2. Information We Collect</h3>
                <p>We only collect information strictly required to run your event galleries:</p>
                <ul className="list-disc pl-5 space-y-1.5 mt-2">
                  <li><strong>Account Data:</strong> Name, email address, and encrypted hashed passwords for registered hosts and contributors.</li>
                  <li><strong>Media Content:</strong> Event photos, videos, album titles, and upload timestamps.</li>
                  <li><strong>Device Telemetry:</strong> Standard browser user-agent and IP addresses strictly for rate-limiting, security, and spam prevention.</li>
                </ul>
              </div>

              <div>
                <h3 className="text-base font-bold text-white mb-2">3. Data Retention &amp; Auto-Deletion</h3>
                <p>
                  Every event has an explicit expiry timestamp. Once an event reaches its scheduled expiry or when the host chooses to delete it, all full-resolution photos, thumbnails, and database records are permanently purged from storage.
                </p>
              </div>

              <div>
                <h3 className="text-base font-bold text-white mb-2">4. Contact Privacy Officer</h3>
                <p>
                  For privacy inquiries, data deletion requests, or questions regarding facial biometrics:
                  <br />
                  Email: <a href="mailto:privacy@snapmemory.app" className="text-purple-400 font-medium">privacy@snapmemory.app</a>
                </p>
              </div>
            </div>
          )}

          {/* ══════════════ TERMS OF SERVICE ══════════════ */}
          {activeTab === 'terms' && (
            <div className="space-y-6">
              <div className="border-b border-purple-900/30 pb-4">
                <h2 className="text-2xl font-black text-white">Terms of Service</h2>
                <p className="text-xs text-muted mt-1">Rules and guidelines for hosting and contributing to SnapMemory events.</p>
              </div>

              <div>
                <h3 className="text-base font-bold text-white mb-2">1. Acceptance of Terms</h3>
                <p>
                  By accessing SnapMemory, creating an event gallery, scanning a QR code, or uploading media, you agree to these Terms of Service. If you do not agree, please do not use the service.
                </p>
              </div>

              <div>
                <h3 className="text-base font-bold text-white mb-2">2. Intellectual Property &amp; Media Ownership</h3>
                <ul className="list-disc pl-5 space-y-1.5 mt-2">
                  <li><strong>Your Ownership:</strong> You retain full copyright ownership of all photos, videos, and media you upload.</li>
                  <li><strong>License to Host:</strong> You grant SnapMemory a non-exclusive, worldwide, royalty-free license solely for the purpose of storing, displaying, and transmitting your media to authorized event guests.</li>
                  <li><strong>Commercial Rights:</strong> SnapMemory will never license, sell, or commercialize user photos.</li>
                </ul>
              </div>

              <div>
                <h3 className="text-base font-bold text-white mb-2">3. Acceptable Content &amp; Media Standards</h3>
                <p>You agree NOT to upload content that:</p>
                <ul className="list-disc pl-5 space-y-1.5 mt-2">
                  <li>Infringes on copyrights, trademarks, or personal privacy of others.</li>
                  <li>Contains illegal, explicit, abusive, defamatory, or hateful material.</li>
                  <li>Attempts to inject malicious code, viruses, or exploit client-side neural libraries.</li>
                </ul>
              </div>

              <div>
                <h3 className="text-base font-bold text-white mb-2">4. Event Moderator Authority</h3>
                <p>
                  Event owners and moderators reserve the complete right to remove any uploaded photo, ban contributors, or switch an event from public to password-protected at any time.
                </p>
              </div>

              <div>
                <h3 className="text-base font-bold text-white mb-2">5. Limitation of Liability</h3>
                <p>
                  SnapMemory provides services on an "as-is" and "as-available" basis. While we employ multi-region redundancy, we recommend hosts retain primary backups of all irreplaceable original photography.
                </p>
              </div>
            </div>
          )}

          {/* ══════════════ COOKIE POLICY ══════════════ */}
          {activeTab === 'cookies' && (
            <div className="space-y-6">
              <div className="border-b border-purple-900/30 pb-4">
                <h2 className="text-2xl font-black text-white">Cookie Policy</h2>
                <p className="text-xs text-muted mt-1">How and why we use cookies and local storage tokens.</p>
              </div>

              <div>
                <h3 className="text-base font-bold text-white mb-2">1. What Are Cookies?</h3>
                <p>
                  Cookies and browser localStorage are small pieces of text stored on your device that enable web applications to remember your preferences and keep you securely logged in.
                </p>
              </div>

              <div>
                <h3 className="text-base font-bold text-white mb-2">2. Types of Cookies We Use</h3>
                <div className="space-y-3 mt-3">
                  <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-500/20">
                    <p className="text-sm font-bold text-white flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Strictly Essential Cookies
                    </p>
                    <p className="text-xs text-muted mt-1">
                      Required for authenticating user sessions (<code className="text-purple-300">SnapMemory_user</code>), maintaining security tokens, and ensuring smooth event creation. Cannot be switched off.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-500/20">
                    <p className="text-sm font-bold text-white flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Functional &amp; AI Cache
                    </p>
                    <p className="text-xs text-muted mt-1">
                      Temporarily caches neural weights (<code className="text-purple-300">__faceapi_models__</code>) in browser IndexedDB so you don’t have to redownload the 6MB AI model on every page refresh.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-500/20">
                    <p className="text-sm font-bold text-white flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Performance &amp; Analytics
                    </p>
                    <p className="text-xs text-muted mt-1">
                      Aggregated counts of photo views and downloads for the event host’s dashboard analytics. No third-party ad-tracking cookies (e.g. Meta Pixel, TikTok tracking) are used.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-base font-bold text-white mb-2">3. Managing Your Cookies</h3>
                <p>
                  You can clear your cookies and local storage anytime via your browser settings (<kbd className="px-2 py-0.5 bg-surface-800 rounded text-xs text-purple-300 font-mono">Settings &gt; Clear Browsing Data</kbd>). Note that signing out of SnapMemory immediately clears your active session token.
                </p>
              </div>
            </div>
          )}

          {/* ══════════════ GDPR & DPDP ══════════════ */}
          {activeTab === 'gdpr' && (
            <div className="space-y-6">
              <div className="border-b border-purple-900/30 pb-4">
                <h2 className="text-2xl font-black text-white">GDPR &amp; DPDP Compliance</h2>
                <p className="text-xs text-muted mt-1">Rights under the General Data Protection Regulation (EU) &amp; Digital Personal Data Protection Act (India).</p>
              </div>

              <div>
                <h3 className="text-base font-bold text-white mb-2">Your Fundamental Data Rights</h3>
                <div className="grid sm:grid-cols-2 gap-4 mt-3">
                  <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-500/20">
                    <p className="text-sm font-bold text-white mb-1">Right to Access &amp; Portability</p>
                    <p className="text-xs text-muted">
                      Request a full ZIP archive of all original media you uploaded to any event at any time.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-500/20">
                    <p className="text-sm font-bold text-white mb-1">Right to Erasure ("Forget Me")</p>
                    <p className="text-xs text-muted">
                      Request permanent deletion of your account, photos, or face match indexes with zero residual retention.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-500/20">
                    <p className="text-sm font-bold text-white mb-1">Right to Rectification</p>
                    <p className="text-xs text-muted">
                      Update or correct your profile display name, email, or credentials through Account Settings.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-500/20">
                    <p className="text-sm font-bold text-white mb-1">Consent Withdrawal</p>
                    <p className="text-xs text-muted">
                      Guests can revoke contributor status or request removal of specific photos from public event albums.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-base font-bold text-white mb-2">Exercising Your GDPR Rights</h3>
                <p>
                  To exercise your rights or request an immediate data export / erasure report:
                </p>
                <div className="p-4 rounded-xl bg-surface-900 border border-purple-900/40 text-xs font-mono space-y-1 mt-3">
                  <p>Data Protection Officer: Kishan Yadav</p>
                  <p>Email: <a href="mailto:dpo@snapmemory.app" className="text-purple-300">dpo@snapmemory.app</a></p>
                  <p>Turnaround SLA: All formal erasure requests are processed within 72 hours.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
