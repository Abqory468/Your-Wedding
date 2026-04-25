import React, { useState, useEffect } from 'react';
import { Invitation, DesignConfig } from '../types';
import { storageService } from '../services/storageService';
import { useAuth } from './FirebaseProvider';
import { cn } from '../lib/utils';
import { Save, ArrowLeft, Palette, Info } from 'lucide-react';
import { motion } from 'motion/react';

interface Props {
  initialData?: Invitation;
  onSave: (invitation: Invitation) => void;
  onCancel: () => void;
}

export const InvitationEditor: React.FC<Props> = ({ initialData, onSave, onCancel }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'info' | 'design'>('info');
  const [coupleNames, setCoupleNames] = useState(initialData?.coupleNames || '');
  const [date, setDate] = useState(initialData?.date ? new Date(initialData.date).toISOString().split('T')[0] : '');
  const [location, setLocation] = useState(initialData?.location || '');
  const [venueName, setVenueName] = useState(initialData?.venueName || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [slug, setSlug] = useState(initialData?.slug || '');
  
  const [design, setDesign] = useState<DesignConfig>(initialData?.design || {
    themeColor: '#bf8576',
    accentColor: '#8e5447',
    fontFamily: 'serif',
    ornamentStyle: 'classic'
  });

  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setSaving(true);
    const invitationId = initialData?.id || crypto.randomUUID();
    const timestamp = Date.now();
    
    const invitationData: Invitation = {
      id: invitationId,
      ownerId: user.uid,
      coupleNames,
      date: new Date(date).getTime(),
      location,
      venueName,
      description,
      slug: slug || coupleNames.toLowerCase().replace(/\s+/g, '-'),
      design,
      createdAt: initialData?.createdAt || timestamp,
      updatedAt: timestamp,
    };

    try {
      storageService.saveInvitation(invitationData);
      onSave(invitationData);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <button onClick={onCancel} className="flex items-center gap-2 text-slate-500 hover:text-brand-600 transition-colors">
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Dashboard</span>
        </button>
        <button 
          onClick={handleSubmit}
          disabled={saving}
          className="bg-brand-600 text-white px-6 py-2 rounded-full font-medium hover:bg-brand-700 transition-colors flex items-center gap-2"
        >
          <Save className="w-5 h-5" />
          {saving ? 'Saving...' : 'Save Invitation'}
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-brand-100 overflow-hidden">
        <div className="flex border-b border-brand-100">
          <button 
            onClick={() => setActiveTab('info')}
            className={cn(
              "flex-1 py-4 font-medium transition-colors flex items-center justify-center gap-2",
              activeTab === 'info' ? "text-brand-600 bg-brand-50/50" : "text-slate-500 hover:bg-brand-50/30"
            )}
          >
            <Info className="w-5 h-5" />
            General Info
          </button>
          <button 
            onClick={() => setActiveTab('design')}
            className={cn(
              "flex-1 py-4 font-medium transition-colors flex items-center justify-center gap-2",
              activeTab === 'design' ? "text-brand-600 bg-brand-50/50" : "text-slate-500 hover:bg-brand-50/30"
            )}
          >
            <Palette className="w-5 h-5" />
            Design & Theme
          </button>
        </div>

        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {activeTab === 'info' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2 space-y-2">
                  <label className="text-sm font-medium text-slate-700">Couple's Names</label>
                  <input 
                    value={coupleNames}
                    onChange={e => setCoupleNames(e.target.value)}
                    placeholder="e.g. Sarah & Michael"
                    className="w-full px-4 py-3 rounded-xl border border-brand-100 focus:ring-2 focus:ring-brand-200 focus:border-brand-400 outline-none transition-all"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Wedding Date</label>
                  <input 
                    type="date"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-brand-100 focus:ring-2 focus:ring-brand-200 focus:border-brand-400 outline-none transition-all"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Custom URL Slug</label>
                  <div className="flex items-center group">
                    <span className="px-3 py-3 bg-brand-50 border border-r-0 border-brand-100 rounded-l-xl text-slate-400 text-sm">/</span>
                    <input 
                      value={slug}
                      onChange={e => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                      placeholder="sarah-michael"
                      className="flex-1 px-4 py-3 rounded-r-xl border border-brand-100 focus:ring-2 focus:ring-brand-200 focus:border-brand-400 outline-none transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Venue Name</label>
                  <input 
                    value={venueName}
                    onChange={e => setVenueName(e.target.value)}
                    placeholder="e.g. The Grand Ballroom"
                    className="w-full px-4 py-3 rounded-xl border border-brand-100 focus:ring-2 focus:ring-brand-200 focus:border-brand-400 outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Location Address</label>
                  <input 
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    placeholder="e.g. 123 Wedding St, New York"
                    className="w-full px-4 py-3 rounded-xl border border-brand-100 focus:ring-2 focus:ring-brand-200 focus:border-brand-400 outline-none transition-all"
                    required
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-sm font-medium text-slate-700">Short Description / Welcome Message</label>
                  <textarea 
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    rows={4}
                    placeholder="Tell your guests about your special day..."
                    className="w-full px-4 py-3 rounded-xl border border-brand-100 focus:ring-2 focus:ring-brand-200 focus:border-brand-400 outline-none transition-all resize-none"
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-slate-700">Theme Color</label>
                    <div className="flex flex-wrap gap-3">
                      {['#bf8576', '#76473d', '#4a5d4e', '#2c3e50', '#a18b7c'].map(color => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setDesign({ ...design, themeColor: color })}
                          className={cn(
                            "w-10 h-10 rounded-full transition-all",
                            design.themeColor === color ? "ring-2 ring-offset-2 ring-brand-400 scale-110" : "hover:scale-105"
                          )}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                      <input 
                        type="color"
                        value={design.themeColor}
                        onChange={e => setDesign({ ...design, themeColor: e.target.value })}
                        className="w-10 h-10 rounded-full overflow-hidden border-none cursor-pointer"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm font-medium text-slate-700">Font Style</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setDesign({ ...design, fontFamily: 'serif' })}
                        className={cn(
                          "px-4 py-3 rounded-xl border text-sm font-medium transition-all",
                          design.fontFamily === 'serif' ? "bg-brand-50 border-brand-300 text-brand-700" : "bg-white border-brand-100 text-slate-500"
                        )}
                      >
                        Classic Serif
                      </button>
                      <button
                        type="button"
                        onClick={() => setDesign({ ...design, fontFamily: 'sans' })}
                        className={cn(
                          "px-4 py-3 rounded-xl border text-sm font-medium transition-all",
                          design.fontFamily === 'sans' ? "bg-brand-50 border-brand-300 text-brand-700" : "bg-white border-brand-100 text-slate-500"
                        )}
                      >
                        Modern Sans
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm font-medium text-slate-700">Ornament Style</label>
                    <select
                      value={design.ornamentStyle}
                      onChange={e => setDesign({ ...design, ornamentStyle: e.target.value as any })}
                      className="w-full px-4 py-3 rounded-xl border border-brand-100 focus:ring-2 focus:ring-brand-200 focus:border-brand-400 outline-none transition-all"
                    >
                      <option value="classic">Classic Elegant</option>
                      <option value="minimal">Minimalist</option>
                      <option value="floral">Soft Floral</option>
                    </select>
                  </div>
                </div>

                <div className="bg-brand-50/30 rounded-2xl p-6 flex flex-col items-center justify-center border border-brand-100/50">
                  <span className="text-xs uppercase tracking-widest text-brand-400 font-bold mb-8">Preview</span>
                  <div 
                    className={cn(
                      "w-64 h-80 bg-white shadow-xl rounded-lg p-6 flex flex-col items-center justify-between text-center border transition-all",
                      design.fontFamily === 'serif' ? "font-serif" : "font-sans"
                    )}
                    style={{ borderColor: design.themeColor + '40' }}
                  >
                    <div className={cn(
                      "w-12 h-12 mb-4",
                      design.ornamentStyle === 'floral' ? "text-pink-200" : "text-brand-200"
                    )}>
                      {/* Decorative SVG placeholder */}
                      <svg viewBox="0 0 100 100" fill="currentColor">
                        <path d="M50 0 L60 40 L100 50 L60 60 L50 100 L40 60 L0 50 L40 40 Z" />
                      </svg>
                    </div>
                    <div className="space-y-2">
                      <p className="text-[8px] tracking-[0.2em] text-slate-400 uppercase">Save the Date</p>
                      <h4 className="text-lg leading-tight" style={{ color: design.themeColor }}>
                        {coupleNames || 'Sarah & Michael'}
                      </h4>
                      <p className="text-[10px] text-slate-500">
                        {date ? format(new Date(date), 'MMMM d, yyyy') : 'October 12, 2026'}
                      </p>
                    </div>
                    <div className="w-16 h-[1px] bg-brand-100 my-4" />
                    <p className="text-[8px] text-slate-400 italic">At {venueName || 'Your Favorite Venue'}</p>
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

// Helper for date formatting in preview
function format(date: Date, fmt: string) {
  // Simple fallback since we don't want to overcomplicate the preview
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}
