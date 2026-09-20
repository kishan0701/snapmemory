import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Camera } from 'lucide-react';

export function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/3 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl" />
      </div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="text-7xl mb-6">📸</div>
        <h1 className="text-6xl font-black gradient-text mb-4">404</h1>
        <h2 className="text-xl font-bold text-white mb-3">Page not found</h2>
        <p className="text-secondary mb-8 max-w-sm mx-auto">
          The page you're looking for doesn't exist or has been moved. Maybe the event link expired?
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link to="/" className="btn-primary">
            <Home className="w-4 h-4" /> Go Home
          </Link>
          <Link to="/dashboard" className="btn-secondary">
            <Camera className="w-4 h-4" /> Dashboard
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
