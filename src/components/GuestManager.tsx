import React, { useEffect, useState } from 'react';
import { Invitation, Guest, RSVPStatus } from '../types';
import { storageService } from '../services/storageService';
import { Users, UserPlus, Mail, Phone, Trash2, CheckCircle2, XCircle, Clock, ArrowLeft, MessageSquare } from 'lucide-react';
import { cn } from '../lib/utils';
import { format } from 'date-fns';

interface Props {
  invitation: Invitation;
  onBack: () => void;
}

export const GuestManager: React.FC<Props> = ({ invitation, onBack }) => {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Form State
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');

  useEffect(() => {
    const guestList = storageService.getGuests(invitation.id);
    setGuests(guestList);
    setLoading(false);
  }, [invitation.id]);

  const handleAddGuest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName) return;

    try {
      const guest: Guest = {
        id: crypto.randomUUID(),
        name: newName,
        email: newEmail,
        phone: newPhone,
        status: 'pending' as RSVPStatus,
        plusOnes: 0,
        invitedAt: Date.now()
      };
      storageService.saveGuest(invitation.id, guest);
      setGuests([...guests, guest]);
      
      setNewName('');
      setNewEmail('');
      setNewPhone('');
      setShowAddForm(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteGuest = async (id: string) => {
    if (!confirm('Are you sure you want to remove this guest?')) return;
    try {
      storageService.deleteGuest(invitation.id, id);
      setGuests(guests.filter(g => g.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const stats = {
    total: guests.length,
    attending: guests.filter(g => g.status === 'attending').length,
    plusOnes: guests.filter(g => g.status === 'attending').reduce((acc, g) => acc + (g.plusOnes || 0), 0),
    declined: guests.filter(g => g.status === 'declined').length,
    pending: guests.filter(g => g.status === 'pending').length,
  };

  return (
    <div className="max-w-5xl mx-auto pb-20">
      <div className="flex items-center justify-between mb-8">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-brand-600 transition-colors">
          <ArrowLeft className="w-5 h-5" />
          <span>Dashboard</span>
        </button>
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-brand-600 text-white px-5 py-2 rounded-full font-medium hover:bg-brand-700 transition-colors flex items-center gap-2"
        >
          <UserPlus className="w-5 h-5" />
          Add Guest
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Guests', value: stats.total, icon: Users, color: 'text-brand-600', bg: 'bg-brand-50' },
          { label: 'Attending', value: `${stats.attending} (+${stats.plusOnes})`, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Declined', value: stats.declined, icon: XCircle, color: 'text-rose-600', bg: 'bg-rose-50' },
          { label: 'Pending', value: stats.pending, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
        ].map((item, i) => (
          <div key={i} className={cn("p-4 rounded-2xl flex items-center gap-4 border border-transparent", item.bg)}>
            <div className={cn("p-2 rounded-xl bg-white", item.color)}>
              <item.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{item.label}</p>
              <p className={cn("text-xl font-bold", item.color)}>{item.value}</p>
            </div>
          </div>
        ))}
      </div>

      {showAddForm && (
        <div className="bg-white rounded-3xl p-6 mb-8 border border-brand-100 shadow-sm animate-in fade-in slide-in-from-top-4 duration-300">
          <form onSubmit={handleAddGuest} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input 
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder="Guest Name"
              className="px-4 py-3 rounded-xl border border-brand-100 focus:ring-2 focus:ring-brand-100 outline-none"
              required
            />
            <input 
              value={newEmail}
              onChange={e => setNewEmail(e.target.value)}
              placeholder="Email (Optional)"
              className="px-4 py-3 rounded-xl border border-brand-100 focus:ring-2 focus:ring-brand-100 outline-none"
            />
            <div className="flex gap-2">
              <input 
                value={newPhone}
                onChange={e => setNewPhone(e.target.value)}
                placeholder="Phone (Optional)"
                className="flex-1 px-4 py-3 rounded-xl border border-brand-100 focus:ring-2 focus:ring-brand-100 outline-none"
              />
              <button className="bg-brand-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-brand-700">
                Add
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-3xl border border-brand-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-brand-50/50 text-slate-500 text-sm font-medium uppercase tracking-wider">
                <th className="px-6 py-4">Guest</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Plus Ones</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-50">
              {guests.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic">
                    No guests added yet.
                  </td>
                </tr>
              ) : (
                guests.map((guest) => (
                  <tr key={guest.id} className="hover:bg-brand-50/30 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-slate-900">{guest.name}</div>
                        <div className="text-xs text-slate-400">Added {format(guest.invitedAt, 'MMM d, p')}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {guest.email && <div className="flex items-center gap-2 text-xs text-slate-600"><Mail className="w-3 h-3" /> {guest.email}</div>}
                        {guest.phone && <div className="flex items-center gap-2 text-xs text-slate-600"><Phone className="w-3 h-3" /> {guest.phone}</div>}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-3 py-1 rounded-full text-xs font-semibold flex items-center w-fit gap-1",
                        guest.status === 'attending' ? "bg-emerald-100 text-emerald-700" :
                        guest.status === 'declined' ? "bg-rose-100 text-rose-700" :
                        "bg-slate-100 text-slate-600"
                      )}>
                        {guest.status === 'attending' ? <CheckCircle2 className="w-3 h-3" /> :
                         guest.status === 'declined' ? <XCircle className="w-3 h-3" /> :
                         <Clock className="w-3 h-3" />}
                        {guest.status.charAt(0).toUpperCase() + guest.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-slate-600">{guest.plusOnes || 0}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {guest.message && (
                          <div className="relative group">
                            <MessageSquare className="w-5 h-5 text-brand-400 cursor-help" />
                            <div className="absolute bottom-full right-0 mb-2 w-48 p-2 bg-slate-800 text-white text-[10px] rounded shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                              {guest.message}
                            </div>
                          </div>
                        )}
                        <button 
                          onClick={() => handleDeleteGuest(guest.id)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
