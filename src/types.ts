export type RSVPStatus = 'pending' | 'attending' | 'declined';

export interface Guest {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  status: RSVPStatus;
  plusOnes: number;
  dietaryRequirements?: string;
  message?: string;
  invitedAt: number;
}

export interface DesignConfig {
  themeColor: string;
  accentColor: string;
  fontFamily: 'serif' | 'sans';
  backgroundImage?: string;
  ornamentStyle?: 'floral' | 'minimal' | 'classic';
}

export interface Invitation {
  id: string;
  ownerId: string;
  coupleNames: string;
  date: number;
  location: string;
  venueName?: string;
  description: string;
  design: DesignConfig;
  slug: string; // Unique URL for the invitation
  createdAt: number;
  updatedAt: number;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
}
