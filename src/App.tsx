import React, { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from './components/FirebaseProvider';
import { Invitation } from './types';
import { storageService } from './services/storageService';
import { InvitationCard } from './components/InvitationCard';
import { InvitationEditor } from './components/InvitationEditor';
import { GuestManager } from './components/GuestManager';
import { PublicInvitation } from './components/PublicInvitation';
import { Heart, Plus, LogOut, LayoutDashboard, Share2, Copy, Check, Mail, Lock, User as UserIcon } from 'lucide-react';
import { cn } from './lib/utils';
import { motion, AnimatePresence } from 'motion/react';

const Dashboard = ({ 
  invitations, 
  onEdit, 
  onManageGuests, 
  onShare 
}: { 
  invitations: Invitation[], 
  onEdit: (inv: Invitation) => void,
  onManageGuests: (inv: Invitation) => void,
  onShare: (inv: Invitation) => void
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {invitations.map((inv) => (
        <InvitationCard 
          key={inv.id} 
          invitation={inv} 
          onEdit={() => onEdit(inv)}
          onManageGuests={() => onManageGuests(inv)}
          onShare={() => onShare(inv)}
        />
      ))}
      <button 
        onClick={() => onEdit({} as Invitation)} // Creating new
        className="h-full min-h-[300px] border-2 border-dashed border-brand-200 rounded-2xl flex flex-col items-center justify-center gap-4 text-brand-400 hover:border-brand-400 hover:text-brand-600 transition-all group"
      >
        <div className="p-4 rounded-full bg-brand-50 group-hover:bg-brand-100 transition-colors">
          <Plus className="w-8 h-8" />
        </div>
        <span className="font-medium">Create New Invitation</span>
      </button>
    </div>
  );
};

const ShareModal = ({ invitation, onClose }: { invitation: Invitation, onClose: () => void }) => {
  const [copied, setCopied] = useState(false);
  const shareUrl = `${window.location.origin}/${invitation.slug}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl relative font-sans"
      >
        <button onClick={onClose} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 font-bold">×</button>
        <div className="text-center space-y-6">
          <div className="w-16 h-16 bg-brand-50 rounded-full flex items-center justify-center mx-auto text-brand-600">
            <Share2 className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-serif text-slate-800">Share Invitation</h3>
            <p className="text-sm text-slate-500">Note: Links only work on this device in Local mode.</p>
          </div>
          
          <div className="flex gap-2 p-1 bg-brand-50 rounded-xl border border-brand-100">
            <input 
              readOnly 
              value={shareUrl} 
              className="flex-1 bg-transparent border-none text-xs px-3 focus:ring-0 text-slate-600 truncate"
            />
            <button 
              onClick={copyToClipboard}
              className="bg-brand-600 text-white p-2 rounded-lg hover:bg-brand-700 transition-colors"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-4">
            <a 
              href={`https://wa.me/?text=${encodeURIComponent(`You're invited to our wedding! ${shareUrl}`)}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-emerald-100 text-emerald-600 font-medium hover:bg-emerald-50 transition-colors text-sm"
            >
              WhatsApp
            </a>
            <a 
              href={`mailto:?subject=${encodeURIComponent(`Wedding Invitation: ${invitation.coupleNames}`)}&body=${encodeURIComponent(`We'd love for you to celebrate with us! RSVP here: ${shareUrl}`)}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-brand-100 text-brand-600 font-medium hover:bg-brand-50 transition-colors text-sm"
            >
              Email
            </a>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const AuthForm = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(email);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-brand-50 p-6 font-sans">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-8 rounded-3xl shadow-xl max-w-sm w-full border border-brand-100"
      >
        <div className="text-center space-y-6 mb-8">
          <div className="w-16 h-16 bg-brand-50 rounded-2xl flex items-center justify-center mx-auto text-brand-600 border border-brand-100">
            <Heart className="w-8 h-8 fill-brand-600/10" />
          </div>
          <div className="space-y-1">
            <h1 className="text-3xl font-serif text-slate-800">Eternal Ties</h1>
            <p className="text-slate-500 text-sm">
              Local Storage Mode
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Email Address</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-brand-500 transition-colors" />
              <input 
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-brand-100 focus:ring-2 focus:ring-brand-200 outline-none transition-all text-sm"
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Password</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-brand-500 transition-colors" />
              <input 
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-brand-100 focus:ring-2 focus:ring-brand-200 outline-none transition-all text-sm"
                required={!isLogin}
              />
            </div>
          </div>

          <button 
            type="submit"
            className="w-full bg-brand-600 text-white py-3.5 rounded-xl font-semibold hover:bg-brand-700 transition-all shadow-sm"
          >
            {isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm text-slate-500 hover:text-brand-600 transition-colors"
          >
            {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const Layout = () => {
  const { user, loading, logout } = useAuth();
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [view, setView] = useState<'dashboard' | 'editor' | 'guests'>('dashboard');
  const [selectedInv, setSelectedInv] = useState<Invitation | undefined>();
  const [shareInv, setShareInv] = useState<Invitation | null>(null);

  useEffect(() => {
    if (!user) return;
    const invList = storageService.getInvitations(user.uid);
    setInvitations(invList);
  }, [user, view]);

  // Simple path-based routing for public invitations
  const path = window.location.pathname.slice(1);
  if (path && path !== 'dashboard' && path !== '') {
    return <PublicInvitation slug={path} />;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-50">
        <Heart className="w-10 h-10 text-brand-300 animate-pulse" />
      </div>
    );
  }

  if (!user) {
    return <AuthForm />;
  }

  return (
    <div className="min-h-screen bg-brand-50/30">
      <nav className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-brand-100 z-40">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer group" onClick={() => setView('dashboard')}>
            <div className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center text-brand-600 transition-colors group-hover:bg-brand-100">
              <Heart className="w-6 h-6 fill-brand-600/10" />
            </div>
            <span className="font-serif text-xl tracking-tight text-slate-800">Eternal Ties</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-slate-800">{user?.displayName || user?.email}</p>
              <button 
                onClick={logout}
                className="text-xs text-slate-400 hover:text-rose-500 transition-colors flex items-center gap-1 ml-auto"
              >
                Sign Out <LogOut className="w-3 h-3" />
              </button>
            </div>
            <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 font-bold border border-brand-200">
               {(user?.displayName || user?.email || '?')[0].toUpperCase()}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-10">
        <AnimatePresence mode="wait">
          {view === 'dashboard' && (
            <motion.div 
              key="dashboard"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <div className="mb-10 flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-serif text-slate-800">Your Invitations</h2>
                  <p className="text-slate-500 text-sm mt-1">Manage your active wedding events.</p>
                </div>
              </div>
              <Dashboard 
                invitations={invitations} 
                onEdit={(inv) => { setSelectedInv(inv.id ? inv : undefined); setView('editor'); }}
                onManageGuests={(inv) => { setSelectedInv(inv); setView('guests'); }}
                onShare={(inv) => setShareInv(inv)}
              />
            </motion.div>
          )}

          {view === 'editor' && (
            <motion.div 
              key="editor"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <InvitationEditor 
                initialData={selectedInv}
                onSave={() => setView('dashboard')}
                onCancel={() => setView('dashboard')}
              />
            </motion.div>
          )}

          {view === 'guests' && selectedInv && (
            <motion.div 
              key="guests"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="mb-8">
                <h2 className="text-3xl font-serif text-slate-800">Guest List</h2>
                <p className="text-slate-500 text-sm mt-1">{selectedInv.coupleNames}'s Wedding</p>
              </div>
              <GuestManager 
                invitation={selectedInv}
                onBack={() => setView('dashboard')}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {shareInv && (
        <ShareModal invitation={shareInv} onClose={() => setShareInv(null)} />
      )}
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <Layout />
    </AuthProvider>
  );
}
