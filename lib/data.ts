export interface Artist {
  id: string;
  name: string;
  genre: string;
  avatarColor: string;
  minutes: number;
}

export interface Slot {
  artistId: string;
  start: string; // Changed to string to handle times like "10:00 PM"
  stage: 'Main' | 'Side Room' | 'Patio';
}

export const artists: Artist[] = [
  { 
    id: 'dj-nova', 
    name: 'DJ Nova', 
    genre: 'House',
    avatarColor: 'bg-avatar-amber',
    minutes: 45 
  },
  { 
    id: 'dj-echo', 
    name: 'DJ Echo', 
    genre: 'Techno',
    avatarColor: 'bg-avatar-orange',
    minutes: 45 
  },
  { 
    id: 'dj-pulse', 
    name: 'DJ Pulse', 
    genre: 'Trance',
    avatarColor: 'bg-avatar-rose',
    minutes: 45 
  },
  { 
    id: 'dj-rhythm', 
    name: 'DJ Rhythm', 
    genre: 'Hip Hop',
    avatarColor: 'bg-avatar-teal',
    minutes: 45 
  },
];

// Time slots for the timeline
export const timeSlots = [
  '10:00 PM',
  '10:15 PM', 
  '10:30 PM',
  '10:45 PM',
  '11:00 PM',
  '11:15 PM',
  '11:30 PM', 
  '11:45 PM',
  '12:00 AM',
  '12:15 AM',
]; 