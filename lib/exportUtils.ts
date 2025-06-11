import type { Event, Artist, LineupSlot } from '@/app/providers/LineupStore';

// CSV Export
export function generateLineupCSV(
  event: Event,
  slots: LineupSlot[],
  artists: Artist[]
): string {
  const headers = ['Stage', 'Start Time', 'End Time', 'Artist', 'Genre', 'Email', 'Status'];
  
  const rows = slots
    .filter(slot => slot.eventId === event.id)
    .sort((a, b) => {
      // Sort by stage, then by start time
      if (a.stage !== b.stage) {
        return a.stage.localeCompare(b.stage);
      }
      return a.startTime.localeCompare(b.startTime);
    })
    .map(slot => {
      const artist = artists.find(a => a.id === slot.artistId);
      return [
        slot.stage,
        slot.startTime,
        slot.endTime,
        artist?.name || 'Unknown Artist',
        artist?.genre || '',
        artist?.email || '',
        slot.status,
      ];
    });

  const csvContent = [headers, ...rows]
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\n');

  return csvContent;
}

// ICS (Calendar) Export
export function generateLineupICS(
  event: Event,
  slots: LineupSlot[],
  artists: Artist[]
): string {
  const eventSlots = slots.filter(slot => slot.eventId === event.id);
  
  const icsEvents = eventSlots.map(slot => {
    const artist = artists.find(a => a.id === slot.artistId);
    const startDateTime = convertToDateTime(event.date, slot.startTime);
    const endDateTime = convertToDateTime(event.date, slot.endTime);
    
    return [
      'BEGIN:VEVENT',
      `UID:${slot.id}@primordialgroove.com`,
      `DTSTART:${startDateTime}`,
      `DTEND:${endDateTime}`,
      `SUMMARY:${artist?.name || 'Unknown Artist'} - ${slot.stage}`,
      `DESCRIPTION:${event.title}\\nGenre: ${artist?.genre || 'Unknown'}\\nStage: ${slot.stage}\\nStatus: ${slot.status}`,
      `LOCATION:${slot.stage} Stage`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
    ].join('\r\n');
  });

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Primordial Groove//Lineup Planner//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${event.title} Lineup`,
    `X-WR-CALDESC:Artist lineup for ${event.title}`,
    ...icsEvents,
    'END:VCALENDAR',
  ].join('\r\n');

  return icsContent;
}

// Helper function to convert date and time to ISO format
function convertToDateTime(date: string, time: string): string {
  // Handle next day times (like 02:00 AM which is actually the next day)
  const eventDate = new Date(date);
  const [hours, minutes] = time.split(':').map(Number);
  
  // If time is between 00:00 and 06:00, assume it's the next day
  if (hours >= 0 && hours < 6) {
    eventDate.setDate(eventDate.getDate() + 1);
  }
  
  eventDate.setHours(hours, minutes, 0, 0);
  
  // Format for ICS: YYYYMMDDTHHMMSSZ
  return eventDate.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

// Download helper functions
export function downloadCSV(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function downloadICS(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Email helper - generates mailto link with lineup summary
export function generateArtistEmail(
  event: Event,
  slots: LineupSlot[],
  artists: Artist[]
): string {
  const eventSlots = slots.filter(slot => slot.eventId === event.id);
  const artistEmails = eventSlots
    .map(slot => artists.find(a => a.id === slot.artistId)?.email)
    .filter(Boolean)
    .join(',');

  const subject = encodeURIComponent(`${event.title} - Performance Schedule`);
  
  const body = encodeURIComponent(`Hi everyone!

Here's the performance schedule for ${event.title} on ${event.date}:

${eventSlots.map(slot => {
  const artist = artists.find(a => a.id === slot.artistId);
  return `• ${artist?.name} - ${slot.stage} Stage (${slot.startTime} - ${slot.endTime})`;
}).join('\n')}

Please confirm your slot by replying to this email.

Thanks!
The ${event.title} Team`);

  return `mailto:${artistEmails}?subject=${subject}&body=${body}`;
}

// Conflict detection
export function detectConflicts(slots: LineupSlot[]): { 
  artistConflicts: LineupSlot[]; 
  stageConflicts: LineupSlot[]; 
} {
  const artistConflicts: LineupSlot[] = [];
  const stageConflicts: LineupSlot[] = [];

  // Check for artist double-booking
  const artistSlots = new Map<string, LineupSlot[]>();
  slots.forEach(slot => {
    if (!artistSlots.has(slot.artistId)) {
      artistSlots.set(slot.artistId, []);
    }
    artistSlots.get(slot.artistId)!.push(slot);
  });

  artistSlots.forEach(artistSlotList => {
    if (artistSlotList.length > 1) {
      // Check for time overlaps
      for (let i = 0; i < artistSlotList.length; i++) {
        for (let j = i + 1; j < artistSlotList.length; j++) {
          if (timesOverlap(artistSlotList[i], artistSlotList[j])) {
            artistConflicts.push(artistSlotList[i], artistSlotList[j]);
          }
        }
      }
    }
  });

  // Check for stage conflicts
  const stageSlots = new Map<string, LineupSlot[]>();
  slots.forEach(slot => {
    const key = `${slot.stage}-${slot.eventId}`;
    if (!stageSlots.has(key)) {
      stageSlots.set(key, []);
    }
    stageSlots.get(key)!.push(slot);
  });

  stageSlots.forEach(stageSlotList => {
    for (let i = 0; i < stageSlotList.length; i++) {
      for (let j = i + 1; j < stageSlotList.length; j++) {
        if (timesOverlap(stageSlotList[i], stageSlotList[j])) {
          stageConflicts.push(stageSlotList[i], stageSlotList[j]);
        }
      }
    }
  });

  return {
    artistConflicts: [...new Set(artistConflicts)],
    stageConflicts: [...new Set(stageConflicts)],
  };
}

// Helper to check if two time slots overlap
function timesOverlap(slot1: LineupSlot, slot2: LineupSlot): boolean {
  const start1 = new Date(`1970-01-01 ${slot1.startTime}`);
  const end1 = new Date(`1970-01-01 ${slot1.endTime}`);
  const start2 = new Date(`1970-01-01 ${slot2.startTime}`);
  const end2 = new Date(`1970-01-01 ${slot2.endTime}`);

  return start1 < end2 && start2 < end1;
} 