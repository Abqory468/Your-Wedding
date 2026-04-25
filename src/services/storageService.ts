import { Guest, Invitation, UserProfile } from '../types';

const STORAGE_KEYS = {
  USERS: 'wedding_app_users',
  INVITATIONS: 'wedding_app_invitations',
  GUESTS: 'wedding_app_guests_prefix_', // invitations/{id}/guests
  CURRENT_USER: 'wedding_app_current_user'
};

export const storageService = {
  // Auth
  getCurrentUser: (): UserProfile | null => {
    const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return data ? JSON.parse(data) : null;
  },

  setCurrentUser: (user: UserProfile | null) => {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
  },

  register: (email: string): UserProfile => {
    const users = storageService.getUsers();
    const existing = users.find(u => u.email === email);
    if (existing) return existing;

    const newUser: UserProfile = {
      uid: crypto.randomUUID(),
      email,
      displayName: email.split('@')[0],
    };
    
    users.push(newUser);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    return newUser;
  },

  getUsers: (): UserProfile[] => {
    const data = localStorage.getItem(STORAGE_KEYS.USERS);
    return data ? JSON.parse(data) : [];
  },

  // Invitations
  getInvitations: (userId: string): Invitation[] => {
    const data = localStorage.getItem(STORAGE_KEYS.INVITATIONS);
    const all: Invitation[] = data ? JSON.parse(data) : [];
    return all.filter(inv => inv.ownerId === userId);
  },

  getInvitationBySlug: (slug: string): Invitation | null => {
    const data = localStorage.getItem(STORAGE_KEYS.INVITATIONS);
    const all: Invitation[] = data ? JSON.parse(data) : [];
    return all.find(inv => inv.slug === slug) || null;
  },

  saveInvitation: (invitation: Invitation) => {
    const data = localStorage.getItem(STORAGE_KEYS.INVITATIONS);
    let all: Invitation[] = data ? JSON.parse(data) : [];
    const index = all.findIndex(i => i.id === invitation.id);
    
    if (index > -1) {
      all[index] = invitation;
    } else {
      all.push(invitation);
    }
    localStorage.setItem(STORAGE_KEYS.INVITATIONS, JSON.stringify(all));
  },

  deleteInvitation: (id: string) => {
    const data = localStorage.getItem(STORAGE_KEYS.INVITATIONS);
    let all: Invitation[] = data ? JSON.parse(data) : [];
    all = all.filter(i => i.id !== id);
    localStorage.setItem(STORAGE_KEYS.INVITATIONS, JSON.stringify(all));
    localStorage.removeItem(STORAGE_KEYS.GUESTS + id);
  },

  // Guests
  getGuests: (invitationId: string): Guest[] => {
    const data = localStorage.getItem(STORAGE_KEYS.GUESTS + invitationId);
    return data ? JSON.parse(data) : [];
  },

  saveGuest: (invitationId: string, guest: Guest) => {
    const guests = storageService.getGuests(invitationId);
    const index = guests.findIndex(g => g.id === guest.id);
    
    if (index > -1) {
      guests[index] = guest;
    } else {
      guests.push(guest);
    }
    localStorage.setItem(STORAGE_KEYS.GUESTS + invitationId, JSON.stringify(guests));
  },

  updateGuest: (invitationId: string, guestId: string, updates: Partial<Guest>) => {
    const guests = storageService.getGuests(invitationId);
    const index = guests.findIndex(g => g.id === guestId);
    if (index > -1) {
      guests[index] = { ...guests[index], ...updates };
      localStorage.setItem(STORAGE_KEYS.GUESTS + invitationId, JSON.stringify(guests));
    }
  },

  deleteGuest: (invitationId: string, guestId: string) => {
    let guests = storageService.getGuests(invitationId);
    guests = guests.filter(g => g.id !== guestId);
    localStorage.setItem(STORAGE_KEYS.GUESTS + invitationId, JSON.stringify(guests));
  }
};
