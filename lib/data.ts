export interface Artist {
  id: string;
  name: string;
  minutes: number;
}

export interface Slot {
  artistId: string;
  start: number;
}

export const artists: Artist[] = [
  { id: 'neihouse', name: 'Neihouse', minutes: 45 },
  { id: 'blove',    name: 'Blove',    minutes: 45 },
  { id: 'markiv',   name: 'Markiv',   minutes: 45 },
  { id: 'chaoz',    name: 'Chaoz',    minutes: 45 },
  { id: 'nebula',   name: 'Nebula',   minutes: 45 },
  { id: 'synapse',  name: 'Synapse',  minutes: 45 },
]; 