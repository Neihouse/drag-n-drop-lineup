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

const initialState: LineupState = {
  events: [],
  artists: DUMMY_ARTISTS,
  slots: [],
  activeEventId: null,
  history: [[]],
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

    case 'ADD_SLOT': {
      const newSlot: LineupSlot = {
        ...action.payload,
        id: `slot-${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
      
      // Remove any existing slot for the same time/stage
      const filteredSlots = state.slots.filter(slot => 
        !(slot.eventId === newSlot.eventId && 
          slot.stage === newSlot.stage && 
          slot.startTime === newSlot.startTime)
      );

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
    return {
      ...initialState,
      ...parsed,
      artists: DUMMY_ARTISTS, // Always use fresh dummy artists
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