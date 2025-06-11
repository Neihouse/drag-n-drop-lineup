import { Slot } from './data';

const STORAGE_KEY = 'lineup-slots';

/**
 * Load slots from localStorage
 * Includes error handling for corrupted data
 */
export const loadSlots = (): Slot[] => {
  if (typeof window === 'undefined') return [];
  
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    
    const slots = JSON.parse(data) as Slot[];
    
    // Validate the loaded data has the correct shape
    if (!Array.isArray(slots)) return [];
    
    // Filter out any malformed slots
    return slots.filter(slot => 
      typeof slot === 'object' && 
      slot !== null && 
      typeof slot.artistId === 'string' && 
      typeof slot.start === 'string' &&
      typeof slot.stage === 'string' &&
      ['Main', 'Side Room', 'Patio'].includes(slot.stage)
    );
  } catch (error) {
    console.error('Error loading slots:', error);
    return [];
  }
};

/**
 * Save slots to localStorage
 */
export const saveSlots = (slots: Slot[]): void => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(slots));
  } catch (error) {
    console.error('Error saving slots:', error);
  }
};

/**
 * Clear all stored slots
 */
export const clearSlots = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}; 