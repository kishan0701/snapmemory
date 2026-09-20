import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Camera, Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/features/auth/AuthContext';

export function ForgotPasswordPage() {
  const { forgotPassword, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await forgotPassword(email);
    setSent(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/3 w-80 h-80 bg-purple-600/15 rounded-full blur-3xl" />
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-9 h-9 rounded-xl gradient-brand flex items-center justify-center">
              <Camera className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">Event<span className="gradient-text-brand">Snap</span></span>
          </Link>
          <h1 className="text-2xl font-black text-white">Reset password</h1>
          <p className="text-secondary text-sm mt-1">We'll email you a reset link</p>
        </div>

        <div className="card p-7">
          {sent ? (
            <div className="text-center space-y-4 py-4">
              <div className="w-14 h-14 rounded-full bg-green-500/20 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7 text-green-400" />
              </div>
              <h2 className="text-base font-semibold text-white">Check your email</h2>
              <p className="text-sm text-secondary">
                We sent a reset link to <strong className="text-white">{email}</strong>. Check your inbox and follow the instructions.
              </p>
              <Link to="/login" className="btn-secondary w-full justify-center mt-4">
                Back to login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="forgot-email" className="block text-xs font-medium text-secondary mb-1.5">Email address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                  <input
                    id="forgot-email"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="input-field pl-9"
                    placeholder="your@email.com"
                    required
                  />
                </div>
              </div>
              <button
                id="forgot-submit-btn"
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full justify-center py-2.5 disabled:opacity-60"
              >
                {isLoading ? 'Sending...' : 'Send reset link'}
              </button>
              <Link to="/login" className="flex items-center justify-center gap-1.5 text-sm text-secondary hover:text-white mt-2">
                <ArrowLeft className="w-3.5 h-3.5" /> Back to login
              </Link>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
