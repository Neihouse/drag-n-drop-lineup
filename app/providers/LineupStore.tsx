'use client';

import { createContext, useContext, useReducer, useEffect } from 'react';

// Types
interface Event {
  id: string;
  title: string;
  date: string;
  stages: string[];
  hours: { start: string; end: string };
  createdAt: string;
  status: 'draft' | 'published';
}

interface Artist {
  id: string;
  name: string;
  genre: string;
  avatarColor: string;
  email?: string;
  bio?: string;
}

interface LineupSlot {
  id: string;
  eventId: string;
  artistId: string;
  stage: string;
  startTime: string;
  endTime: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: string;
}

interface LineupState {
  events: Event[];
  artists: Artist[];
  slots: LineupSlot[];
  activeEventId: string | null;
  selectedSlot: LineupSlot | null;
  history: LineupSlot[][];
  historyIndex: number;
}

// Actions
type LineupAction = 
  | { type: 'CREATE_EVENT'; payload: Omit<Event, 'id' | 'createdAt'> }
  | { type: 'UPDATE_EVENT'; payload: { id: string; updates: Partial<Event> } }
  | { type: 'SET_ACTIVE_EVENT'; payload: string }
  | { type: 'ADD_SLOT'; payload: Omit<LineupSlot, 'id' | 'createdAt'> }
  | { type: 'UPDATE_SLOT'; payload: { id: string; updates: Partial<LineupSlot> } }
  | { type: 'REMOVE_SLOT'; payload: string }
  | { type: 'SELECT_SLOT'; payload: LineupSlot | null }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'CLEAR_EVENT_SLOTS'; payload: string }
  | { type: 'LOAD_STATE'; payload: LineupState };

// Dummy data
const DUMMY_ARTISTS: Artist[] = [
  { id: 'dj-nova', name: 'DJ Nova', genre: 'House', avatarColor: 'bg-avatar-amber', email: 'nova@primordialgroove.com' },
  { id: 'dj-echo', name: 'DJ Echo', genre: 'Techno', avatarColor: 'bg-avatar-orange', email: 'echo@primordialgroove.com' },
  { id: 'dj-pulse', name: 'DJ Pulse', genre: 'Trance', avatarColor: 'bg-avatar-rose', email: 'pulse@primordialgroove.com' },
  { id: 'dj-rhythm', name: 'DJ Rhythm', genre: 'Hip Hop', avatarColor: 'bg-avatar-teal', email: 'rhythm@primordialgroove.com' },
  { id: 'dj-vibe', name: 'DJ Vibe', genre: 'Deep House', avatarColor: 'bg-avatar-blue', email: 'vibe@primordialgroove.com' },
  { id: 'dj-flux', name: 'DJ Flux', genre: 'Progressive', avatarColor: 'bg-avatar-purple', email: 'flux@primordialgroove.com' },
  { id: 'dj-zen', name: 'DJ Zen', genre: 'Ambient', avatarColor: 'bg-avatar-green', email: 'zen@primordialgroove.com' },
  { id: 'dj-storm', name: 'DJ Storm', genre: 'Hardcore', avatarColor: 'bg-avatar-red', email: 'storm@primordialgroove.com' },
];

// Dummy events and slots for demo
const DUMMY_EVENTS: Event[] = [
  {
    id: 'primordial-festival',
    title: 'Primordial Festival',
    date: '2024-07-15',
    stages: ['Main', 'Patio'],
    hours: { start: '18:00', end: '06:00' },
    createdAt: '2024-06-01T10:00:00Z',
    status: 'published'
  },
  {
    id: 'underground-nights',
    title: 'Underground Nights',
    date: '2024-08-12',
    stages: ['Main', 'Basement'],
    hours: { start: '20:00', end: '04:00' },
    createdAt: '2024-06-15T14:30:00Z',
    status: 'draft'
  }
];

const DUMMY_SLOTS: LineupSlot[] = [
  {
    id: 'slot-1',
    eventId: 'primordial-festival',
    artistId: 'dj-nova',
    stage: 'Main',
    startTime: '22:00',
    endTime: '23:00',
    status: 'pending',
    createdAt: '2024-06-01T12:00:00Z'
  },
  {
    id: 'slot-2',
    eventId: 'underground-nights',
    artistId: 'dj-nova',
    stage: 'Main',
    startTime: '01:00',
    endTime: '02:30',
    status: 'accepted',
    createdAt: '2024-06-15T16:00:00Z'
  },
  {
    id: 'slot-3',
    eventId: 'primordial-festival',
    artistId: 'dj-echo',
    stage: 'Patio',
    startTime: '20:00',
    endTime: '21:30',
    status: 'accepted',
    createdAt: '2024-06-01T13:00:00Z'
  },
  {
    id: 'slot-4',
    eventId: 'primordial-festival',
    artistId: 'dj-pulse',
    stage: 'Main',
    startTime: '23:00',
    endTime: '00:30',
    status: 'accepted',
    createdAt: '2024-06-01T14:00:00Z'
  }
];

const initialState: LineupState = {
  events: DUMMY_EVENTS,
  artists: DUMMY_ARTISTS,
  slots: DUMMY_SLOTS,
  activeEventId: 'primordial-festival',
  selectedSlot: null,
  history: [DUMMY_SLOTS],
  historyIndex: 0,
};

// Reducer
function lineupReducer(state: LineupState, action: LineupAction): LineupState {
  switch (action.type) {
    case 'CREATE_EVENT': {
      const newEvent: Event = {
        ...action.payload,
        id: `evt-${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
      return {
        ...state,
        events: [...state.events, newEvent],
        activeEventId: newEvent.id,
      };
    }

    case 'UPDATE_EVENT': {
      return {
        ...state,
        events: state.events.map(event =>
          event.id === action.payload.id
            ? { ...event, ...action.payload.updates }
            : event
        ),
      };
    }

    case 'SET_ACTIVE_EVENT': {
      return {
        ...state,
        activeEventId: action.payload,
      };
    }

    case 'SELECT_SLOT': {
      return {
        ...state,
        selectedSlot: action.payload,
      };
    }

    case 'ADD_SLOT': {
      const newSlot: LineupSlot = {
        ...action.payload,
        id: `slot-${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
      
      // Helper function to check if two time slots overlap
      const timesOverlap = (slot1: LineupSlot, slot2: LineupSlot): boolean => {
        const start1 = new Date(`1970-01-01 ${slot1.startTime}`);
        const end1 = new Date(`1970-01-01 ${slot1.endTime}`);
        const start2 = new Date(`1970-01-01 ${slot2.startTime}`);
        const end2 = new Date(`1970-01-01 ${slot2.endTime}`);
        
        // Handle next day times (00:00-06:00)
        if (start1.getHours() >= 0 && start1.getHours() < 6) {
          start1.setDate(start1.getDate() + 1);
        }
        if (end1.getHours() >= 0 && end1.getHours() < 6) {
          end1.setDate(end1.getDate() + 1);
        }
        if (start2.getHours() >= 0 && start2.getHours() < 6) {
          start2.setDate(start2.getDate() + 1);
        }
        if (end2.getHours() >= 0 && end2.getHours() < 6) {
          end2.setDate(end2.getDate() + 1);
        }

        return start1 < end2 && start2 < end1;
      };
      
      // Remove any existing slots that would conflict with the new slot
      const filteredSlots = state.slots.filter(slot => {
        // Remove exact time/stage matches
        if (slot.eventId === newSlot.eventId && 
            slot.stage === newSlot.stage && 
            slot.startTime === newSlot.startTime) {
          return false;
        }
        
        // Remove overlapping slots on the same stage/event
        if (slot.eventId === newSlot.eventId && 
            slot.stage === newSlot.stage && 
            timesOverlap(slot, newSlot)) {
          return false;
        }
        
        return true;
      });

      const newSlots = [...filteredSlots, newSlot];
      
      return {
        ...state,
        slots: newSlots,
        history: [...state.history.slice(0, state.historyIndex + 1), newSlots],
        historyIndex: state.historyIndex + 1,
      };
    }

    case 'UPDATE_SLOT': {
      const updatedSlots = state.slots.map(slot =>
        slot.id === action.payload.id
          ? { ...slot, ...action.payload.updates }
          : slot
      );
      
      return {
        ...state,
        slots: updatedSlots,
        history: [...state.history.slice(0, state.historyIndex + 1), updatedSlots],
        historyIndex: state.historyIndex + 1,
      };
    }

    case 'REMOVE_SLOT': {
      const filteredSlots = state.slots.filter(slot => slot.id !== action.payload);
      
      return {
        ...state,
        slots: filteredSlots,
        history: [...state.history.slice(0, state.historyIndex + 1), filteredSlots],
        historyIndex: state.historyIndex + 1,
      };
    }

    case 'UNDO': {
      if (state.historyIndex > 0) {
        return {
          ...state,
          slots: state.history[state.historyIndex - 1],
          historyIndex: state.historyIndex - 1,
        };
      }
      return state;
    }

    case 'REDO': {
      if (state.historyIndex < state.history.length - 1) {
        return {
          ...state,
          slots: state.history[state.historyIndex + 1],
          historyIndex: state.historyIndex + 1,
        };
      }
      return state;
    }

    case 'CLEAR_EVENT_SLOTS': {
      const filteredSlots = state.slots.filter(slot => slot.eventId !== action.payload);
      
      return {
        ...state,
        slots: filteredSlots,
        history: [...state.history.slice(0, state.historyIndex + 1), filteredSlots],
        historyIndex: state.historyIndex + 1,
      };
    }

    case 'LOAD_STATE': {
      return action.payload;
    }

    default:
      return state;
  }
}

// Storage helpers
const STORAGE_KEY = 'primordial-lineup-data';

function loadFromStorage(): LineupState {
  if (typeof window === 'undefined') return initialState;
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return initialState;
    
    const parsed = JSON.parse(stored);
    
    // Merge stored data with dummy data to ensure we always have demo content
    const mergedEvents = [...DUMMY_EVENTS];
    const mergedSlots = [...DUMMY_SLOTS];
    
    // Add any additional events/slots from storage that aren't in dummy data
    if (parsed.events) {
      parsed.events.forEach((event: Event) => {
        if (!mergedEvents.find(e => e.id === event.id)) {
          mergedEvents.push(event);
        }
      });
    }
    
    if (parsed.slots) {
      parsed.slots.forEach((slot: LineupSlot) => {
        if (!mergedSlots.find(s => s.id === slot.id)) {
          mergedSlots.push(slot);
        }
      });
    }
    
    return {
      ...initialState,
      ...parsed,
      artists: DUMMY_ARTISTS, // Always use fresh dummy artists
      events: mergedEvents,
      slots: mergedSlots,
      activeEventId: parsed.activeEventId || 'primordial-festival',
      selectedSlot: null, // Always start with no selection
    };
  } catch (error) {
    console.error('Error loading lineup data:', error);
    return initialState;
  }
}

function saveToStorage(state: LineupState) {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Error saving lineup data:', error);
  }
}

// Context
const LineupContext = createContext<{
  state: LineupState;
  dispatch: React.Dispatch<LineupAction>;
} | null>(null);

// Provider
export function LineupProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(lineupReducer, initialState, loadFromStorage);

  // Auto-save to localStorage
  useEffect(() => {
    saveToStorage(state);
  }, [state]);

  return (
    <LineupContext.Provider value={{ state, dispatch }}>
      {children}
    </LineupContext.Provider>
  );
}

// Hook
export function useLineup() {
  const context = useContext(LineupContext);
  if (!context) {
    throw new Error('useLineup must be used within a LineupProvider');
  }
  return context;
}

// Export types for use in components
export type { Event, Artist, LineupSlot, LineupState, LineupAction }; 