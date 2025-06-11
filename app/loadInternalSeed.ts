// One-time loader for internal seed data
// Only runs if localStorage is empty (fresh browser/cleared state)

import { seed } from '@/seed/internalSeed';
import type { LineupState } from '@/app/providers/LineupStore';

export function primeInternalStore() {
  // Don't override existing data - preserves user work
  if (localStorage.getItem('lineupState')) {
    console.log('🌱 Lineup data already exists, skipping seed load');
    return;
  }

  // Create initial state with our lean internal seed
  const initialState: LineupState = {
    artists: seed.artists,
    events: [seed.event],
    slots: seed.slots,
    activeEventId: seed.event.id,
    selectedSlot: null,
    history: [seed.slots],
    historyIndex: 0
  };

  localStorage.setItem('lineupState', JSON.stringify(initialState));
  console.log('🌱 Internal seed data loaded:', {
    venue: seed.venue.name,
    artists: seed.artists.length,
    event: seed.event.title
  });
}

// Development helper - force reload seed data
export function forceReloadSeed() {
  localStorage.removeItem('lineupState');
  primeInternalStore();
  window.location.reload();
} 