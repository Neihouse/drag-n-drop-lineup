// Internal seed data for Primordial Groove team testing
// Real names, real venue, minimal but realistic

export const seed = {
  venue: {
    id: 'gratitude',
    name: 'Gratitude Lounge',
    address: '1901 Pacheco St, Concord, CA',
    capacity: 120
  },
  
  artists: [
    { 
      id: 'neihouse', 
      name: 'Neihouse', 
      genre: 'House', 
      avatarColor: 'bg-avatar-blue',
      email: 'neihouse@primordialgroove.com',
      bio: 'Founder & resident DJ'
    },
    { 
      id: 'gobi', 
      name: 'Gobi', 
      genre: 'Tech-House', 
      avatarColor: 'bg-avatar-orange',
      email: 'gobi@primordialgroove.com',
      bio: 'Tech house specialist'
    },
    { 
      id: 'quietpack', 
      name: 'Quiet Pack', 
      genre: 'Minimal', 
      avatarColor: 'bg-avatar-purple',
      email: 'quietpack@primordialgroove.com',
      bio: 'Minimal techno curator'
    },
    { 
      id: 'openslot1', 
      name: 'TBA #1', 
      genre: '—', 
      avatarColor: 'bg-avatar-gray',
      email: '',
      bio: 'Available slot for testing'
    },
    { 
      id: 'openslot2', 
      name: 'TBA #2', 
      genre: '—', 
      avatarColor: 'bg-avatar-gray',
      email: '',
      bio: 'Available slot for testing'
    }
  ],
  
  event: {
    id: 'bpm-010',
    title: 'BPM @ Gratitude',
    date: '2025-06-21',
    stages: ['Main'],
    hours: { start: '17:00', end: '22:00' },
    status: 'draft' as const,
    locked: false,
    createdAt: '2024-12-01T10:00:00Z'
  },
  
  // Pre-set one slot so there's something to interact with immediately
  slots: [
    {
      id: 'slot-neihouse-opening',
      eventId: 'bpm-010',
      artistId: 'neihouse',
      stage: 'Main',
      startTime: '17:00',
      endTime: '18:30',
      status: 'accepted' as const,
      createdAt: '2024-12-01T12:00:00Z'
    }
  ]
};

export type UserRole = 'promoter' | 'booker' | 'artist';

// Hard-coded for internal testing - replace with real auth later
export const CURRENT_ROLE: UserRole = 'booker';   // Change to test different views
export const CURRENT_ARTIST_ID = 'neihouse';      // Used on /artist dashboard 