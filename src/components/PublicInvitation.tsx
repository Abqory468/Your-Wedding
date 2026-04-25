import React, { useEffect, useState } from 'react';
import { Invitation, Guest, RSVPStatus } from '../types';
import { storageService } from '../services/storageService';
import { Heart, Calendar, MapPin, Clock, MessageCircle, Info, CheckCircle2, XCircle } from 'lucide-react';
import { cn } from '../lib/utils';
import { format } from 'date-fns';
import { motion } from 'motion/react';

interface Props {
  slug: string;
}

export const PublicInvitation: React.FC<Props> = ({ slug }) => {
  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // RSVP Form State
  const [rsvpName, setRsvpName] = useState('');
  const [guestFound, setGuestFound] = useState<Guest | null>(null);
  const [status, setStatus] = useState<RSVPStatus>('pending');
  const [plusOnes, setPlusOnes] = useState(0);
  const [dietary, setDietary] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [step, setStep] = useState<'find' | 'respond'>('find');

  useEffect(() => {
    const fetchInvitation = () => {
      const inv = storageService.getInvitationBySlug(slug);
      if (inv) {
        setInvitation(inv);
      } else {
        setError('Invitation not found');
      }
      setLoading(false);
    };
    
    fetchInvitation();
  }, [slug]);

  const handleFindGuest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!invitation) return;
    
    const guests = storageService.getGuests(invitation.id);
    const guest = guests.find(g => g.name.toLowerCase() === rsvpName.toLowerCase());
    
    if (guest) {
      setGuestFound(guest);
      setStatus(guest.status);
      setPlusOnes(guest.plusOnes || 0);
      setDietary(guest.dietaryRequirements || '');
      setMessage(guest.message || '');
      setStep('respond');
    } else {
      setError('Name not found. Please check your invitation or contact the couple.');
    }
  };

  const handleRSVP = (e: React.FormEvent) => {
    e.preventDefault();
    if (!invitation || !guestFound) return;
    
    storageService.updateGuest(invitation.id, guestFound.id, {
      status,
      plusOnes,
      dietaryRequirements: dietary,
      message
    });
    setSubmitted(true);
  };

  if (loading && !invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <Heart className="w-12 h-12 text-brand-300 fill-brand-300/10" />
        </motion.div>
      </div>
    );
  }

  if (error || !invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-50 p-6">
        <div className="bg-white p-8 rounded-3xl shadow-xl max-w-sm w-full text-center space-y-4">
          <div className="text-brand-300 mx-auto">
            <Info className="w-12 h-12 mx-auto" />
          </div>
          <h2 className="text-xl font-serif text-slate-800">{error || 'Invitation not found'}</h2>
          <p className="text-slate-500 text-sm">Please double-check the URL or contact the sender.</p>
        </div>
      </div>
    );
  }

  const isSerif = invitation.design.fontFamily === 'serif';

  return (
    <div className={cn("min-h-screen bg-brand-50 pt-20 pb-40 px-4", isSerif ? "font-serif" : "font-sans")}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-xl mx-auto bg-white shadow-2xl rounded-3xl overflow-hidden border border-brand-100"
      >
        {/* Header Ornament */}
        <div className="h-4 bg-brand-200" style={{ backgroundColor: invitation.design.themeColor }} />
        
        <div className="p-10 text-center space-y-12">
          {/* Couple Names */}
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-[0.3em] text-brand-400 font-bold">The Wedding of</p>
            <h1 
              className="text-4xl md:text-5xl leading-tight"
              style={{ color: invitation.design.themeColor }}
            >
              {invitation.coupleNames}
            </h1>
          </div>

          {/* Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-8 border-y border-brand-50">
            <div className="flex flex-col items-center gap-2">
              <Calendar className="w-6 h-6 text-brand-400" />
              <p className="text-sm font-semibold text-slate-800">{format(invitation.date, 'EEEE, d MMMM yyyy')}</p>
              <p className="text-xs text-brand-500">Save the Date</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <MapPin className="w-6 h-6 text-brand-400" />
              <p className="text-sm font-semibold text-slate-800">{invitation.venueName}</p>
              <p className="text-xs text-brand-500">{invitation.location}</p>
            </div>
          </div>

          <div className="space-y-6">
            <p className="text-sm text-slate-600 leading-relaxed px-6 italic">
              "{invitation.description}"
            </p>
          </div>

          {/* RSVP Section */}
          <div className="mt-12 bg-brand-50/50 p-8 rounded-2xl border border-brand-100">
            <h2 className="text-xl mb-6 text-brand-800">RSVP</h2>
            
            {submitted ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-4"
              >
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <p className="font-medium text-emerald-700">Response Received!</p>
                <p className="text-xs text-slate-500">Thank you for letting us know. We look forward to seeing you!</p>
              </motion.div>
            ) : step === 'find' ? (
              <form onSubmit={handleFindGuest} className="space-y-4">
                <p className="text-xs text-slate-500 mb-4">Please enter your name as it appears on your invitation to RSVP.</p>
                <input 
                  value={rsvpName}
                  onChange={e => setRsvpName(e.target.value)}
                  placeholder="Full Name"
                  className="w-full px-4 py-3 rounded-xl border border-brand-100 focus:ring-2 focus:ring-brand-200 outline-none text-center font-sans"
                  required
                />
                <button 
                  disabled={loading}
                  className="w-full bg-brand-600 text-white py-3 rounded-xl font-medium hover:bg-brand-700 transition-colors font-sans"
                >
                  {loading ? 'Searching...' : 'Continue'}
                </button>
                {/* Simplified Error View */}
                {error && <p className="text-[10px] text-rose-500 mt-2">{error}</p>}
              </form>
            ) : (
              <form onSubmit={handleRSVP} className="space-y-6 text-left font-sans">
                <div className="space-y-3">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Attendance</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setStatus('attending')}
                      className={cn(
                        "flex items-center justify-center gap-2 py-3 rounded-xl border transition-all",
                        status === 'attending' ? "bg-emerald-50 border-emerald-300 text-emerald-700" : "bg-white border-brand-100 text-slate-400"
                      )}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Joyfully Attend
                    </button>
                    <button
                      type="button"
                      onClick={() => setStatus('declined')}
                      className={cn(
                        "flex items-center justify-center gap-2 py-3 rounded-xl border transition-all",
                        status === 'declined' ? "bg-rose-50 border-rose-300 text-rose-700" : "bg-white border-brand-100 text-slate-400"
                      )}
                    >
                      <XCircle className="w-4 h-4" />
                      Decline
                    </button>
                  </div>
                </div>

                {status === 'attending' && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-4"
                  >
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Additional Guests</label>
                      <select 
                        value={plusOnes}
                        onChange={e => setPlusOnes(parseInt(e.target.value))}
                        className="w-full px-4 py-3 rounded-xl border border-brand-100 focus:ring-2 focus:ring-brand-200 outline-none"
                      >
                        {[0, 1, 2, 3].map(n => (
                          <option key={n} value={n}>{n}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Dietary Requirements</label>
                      <input 
                        value={dietary}
                        onChange={e => setDietary(e.target.value)}
                        placeholder="e.g. Vegetarian, Nut Allergy"
                        className="w-full px-4 py-3 rounded-xl border border-brand-100 focus:ring-2 focus:ring-brand-200 outline-none"
                      />
                    </div>
                  </motion.div>
                )}

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Message for the Couple</label>
                  <textarea 
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    rows={3}
                    placeholder="Wishes, notes, or messages..."
                    className="w-full px-4 py-3 rounded-xl border border-brand-100 focus:ring-2 focus:ring-brand-200 outline-none resize-none"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button 
                    type="button"
                    onClick={() => setStep('find')}
                    className="flex-1 bg-white border border-brand-100 text-slate-500 py-3 rounded-xl font-medium hover:bg-brand-50"
                  >
                    Back
                  </button>
                  <button 
                    disabled={loading}
                    className="flex-[2] bg-brand-600 text-white py-3 rounded-xl font-medium hover:bg-brand-700 transition-colors"
                  >
                    {loading ? 'Submitting...' : 'Submit RSVP'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        <div className="p-8 text-center text-slate-400 text-[10px] space-x-4">
          <span>Created with Eternal Ties</span>
        </div>
      </motion.div>
    </div>
  );
};
