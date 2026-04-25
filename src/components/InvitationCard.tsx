import React from 'react';
import { Invitation } from '../types';
import { Calendar, MapPin, Heart, Share2, Users, Edit3 } from 'lucide-react';
import { format } from 'date-fns';

interface CardProps {
  invitation: Invitation;
  onEdit: () => void;
  onManageGuests: () => void;
  onShare: () => void;
}

export const InvitationCard: React.FC<CardProps> = ({ invitation, onEdit, onManageGuests, onShare }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-brand-100 overflow-hidden hover:shadow-md transition-shadow">
      <div 
        className="h-32 w-full flex items-center justify-center relative bg-brand-50"
        style={{ backgroundColor: invitation.design.themeColor + '10' }}
      >
        <div className="absolute top-4 right-4">
          <Heart className="w-5 h-5 text-brand-400 fill-brand-400/20" />
        </div>
        <h3 className="font-serif text-xl text-brand-800 text-center px-4">
          {invitation.coupleNames}
        </h3>
      </div>
      
      <div className="p-6 space-y-4">
        <div className="space-y-2 text-sm text-slate-600">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-brand-500" />
            <span>{format(invitation.date, 'MMMM d, yyyy')}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-brand-500" />
            <span className="truncate">{invitation.venueName || invitation.location}</span>
          </div>
        </div>
        
        <div className="pt-4 grid grid-cols-3 gap-2">
          <button 
            onClick={onEdit}
            className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-brand-50 text-brand-600 transition-colors"
          >
            <Edit3 className="w-5 h-5" />
            <span className="text-xs font-medium">Design</span>
          </button>
          <button 
            onClick={onManageGuests}
            className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-brand-50 text-brand-600 transition-colors"
          >
            <Users className="w-5 h-5" />
            <span className="text-xs font-medium">Guests</span>
          </button>
          <button 
            onClick={onShare}
            className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-brand-50 text-brand-600 transition-colors"
          >
            <Share2 className="w-5 h-5" />
            <span className="text-xs font-medium">Share</span>
          </button>
        </div>
      </div>
    </div>
  );
};
