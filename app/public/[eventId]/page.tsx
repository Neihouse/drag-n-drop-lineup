'use client';

import { useParams } from 'next/navigation';
import { useLineup } from '@/app/providers/LineupStore';
import type { LineupSlot, Artist, Event } from '@/app/providers/LineupStore';
import { useState } from 'react';

interface TimelineSlotProps {
  slot: LineupSlot;
  artist: Artist;
  style: React.CSSProperties;
}

function TimelineSlot({ slot, artist, style }: TimelineSlotProps) {
  return (
    <div
      className="absolute bg-primordial-card-background border border-gray-300 rounded-md shadow-md p-2 text-primordial-card-text pointer-events-none select-none"
      style={style}
    >
      <div className="font-medium text-sm">{artist.name}</div>
      <div className="text-xs text-gray-600">{artist.genre}</div>
      <div className="text-xs text-gray-500 mt-1">
        {slot.startTime} - {slot.endTime}
      </div>
    </div>
  );
}

interface TimelineGridProps {
  event: Event;
  slots: LineupSlot[];
  artists: Artist[];
}

function TimelineGrid({ event, slots, artists }: TimelineGridProps) {
  const stages = event.stages || ['Main', 'Patio'];
  
  // Generate time slots for the day (example: 18:00 to 06:00)
  const generateTimeSlots = () => {
    const times = [];
    for (let hour = 18; hour <= 23; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        times.push(`${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`);
      }
    }
    for (let hour = 0; hour <= 6; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        times.push(`${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`);
      }
    }
    return times;
  };

  const timeSlots = generateTimeSlots();

  const getSlotPosition = (slot: LineupSlot) => {
    const startIndex = timeSlots.findIndex(time => time === slot.startTime);
    const endIndex = timeSlots.findIndex(time => time === slot.endTime);
    const stageIndex = stages.indexOf(slot.stage);
    
    if (startIndex === -1 || endIndex === -1 || stageIndex === -1) return null;
    
    const left = (startIndex * 80) + 200; // 80px per 15min + 200px for stage labels
    const width = (endIndex - startIndex) * 80 - 4; // 4px gap
    const top = (stageIndex * 80) + 60; // 80px per stage + 60px for headers
    const height = 60;
    
    return { left, width, top, height };
  };

  return (
    <div className="relative bg-primordial-background-secondary rounded-lg border border-gray-700 overflow-hidden">
      {/* Scrollable container with fade hint */}
      <div className="overflow-x-auto scrollbar-hide relative">
        <div className="min-w-max relative" style={{ height: (stages.length * 80) + 100 }}>
          {/* Time Headers */}
          <div className="absolute top-0 left-0 right-0 h-15 bg-primordial-background-tertiary border-b border-gray-700 flex">
            <div className="w-50 flex-shrink-0"></div>
            {timeSlots.map((time, index) => (
              <div
                key={time}
                className="w-20 flex-shrink-0 px-2 py-4 text-center text-xs text-gray-400 border-r border-gray-700"
              >
                {index % 4 === 0 ? time : ''}
              </div>
            ))}
          </div>

        {/* Stage Labels and Grid */}
        {stages.map((stage, stageIndex) => (
          <div key={stage} className="absolute left-0" style={{ top: (stageIndex * 80) + 60, height: 80 }}>
            {/* Stage Label */}
            <div className="w-50 h-20 bg-primordial-background-tertiary border-r border-gray-700 flex items-center justify-center">
              <span className="text-white font-semibold">{stage}</span>
            </div>
            
            {/* Grid Lines */}
            <div className="absolute left-50 top-0 right-0 h-20 border-b border-gray-700">
              {timeSlots.map((time) => (
                <div
                  key={time}
                  className="absolute top-0 h-full w-px bg-gray-700"
                  style={{ left: timeSlots.indexOf(time) * 80 }}
                />
              ))}
            </div>
          </div>
        ))}

          {/* Slots */}
          {slots.map(slot => {
            const artist = artists.find(a => a.id === slot.artistId);
            if (!artist) return null;

            const position = getSlotPosition(slot);
            if (!position) return null;

            return (
              <TimelineSlot
                key={slot.id}
                slot={slot}
                artist={artist}
                style={position}
              />
            );
          })}
        </div>
      </div>
      
      {/* Subtle fade gradient hint for horizontal scroll on mobile */}
      <div className="absolute top-0 right-0 w-8 h-full bg-gradient-to-l from-primordial-background-secondary to-transparent pointer-events-none sm:hidden"></div>
    </div>
  );
}

function MobileTimelineList({ slots, artists }: Omit<TimelineGridProps, 'event'>) {
  const eventSlots = slots
    .map(slot => ({
      ...slot,
      artist: artists.find(a => a.id === slot.artistId)
    }))
    .filter(slot => slot.artist)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  return (
    <div className="space-y-4">
      {eventSlots.map(slot => (
        <div key={slot.id} className="bg-primordial-card-background rounded-lg p-4 shadow-md">
          <div className="flex justify-between items-start mb-2">
            <div className="font-semibold text-primordial-card-text">{slot.artist?.name}</div>
            <span className="px-2 py-1 bg-primordial-accent-primary text-primordial-background-primary rounded-full text-xs font-medium">
              {slot.stage}
            </span>
          </div>
          <div className="text-sm text-gray-600 mb-1">{slot.artist?.genre}</div>
          <div className="text-sm text-gray-500">{slot.startTime} - {slot.endTime}</div>
        </div>
      ))}
    </div>
  );
}

export default function PublicTimetable() {
  const params = useParams();
  const { state } = useLineup();
  const [isExporting, setIsExporting] = useState(false);
  
  const eventId = params.eventId as string;
  const event = state.events.find(e => e.id === eventId);
  
  if (!event) {
    return (
      <div className="min-h-screen bg-primordial-background-primary flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-2">Event Not Found</h1>
          <p className="text-gray-400">The requested event could not be found.</p>
        </div>
      </div>
    );
  }

  const eventSlots = state.slots.filter(slot => slot.eventId === eventId);
  const eventArtists = state.artists.filter(artist => 
    eventSlots.some(slot => slot.artistId === artist.id)
  );

  const exportCalendar = async () => {
    setIsExporting(true);
    
    try {
      // Generate ICS content for all event slots
      const icsEvents = eventSlots.map(slot => {
        const artist = eventArtists.find(a => a.id === slot.artistId);
        if (!artist) return '';

        const startDate = new Date(`${event.date} ${slot.startTime}`);
        const endDate = new Date(`${event.date} ${slot.endTime}`);
        
        return [
          'BEGIN:VEVENT',
          `UID:${slot.id}@primordialgroove.com`,
          `DTSTART:${startDate.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')}`,
          `DTEND:${endDate.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')}`,
          `SUMMARY:${artist.name} at ${event.title}`,
          `DESCRIPTION:${artist.name} performing on ${slot.stage} stage\\nGenre: ${artist.genre}`,
          `LOCATION:${event.title} - ${slot.stage} Stage`,
          'END:VEVENT'
        ].join('\r\n');
      }).filter(Boolean);

      const icsContent = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Primordial Groove//Public Timetable//EN',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
        `X-WR-CALNAME:${event.title} Lineup`,
        `X-WR-CALDESC:Full lineup for ${event.title}`,
        ...icsEvents,
        'END:VCALENDAR'
      ].join('\r\n');

      const blob = new Blob([icsContent], { type: 'text/calendar' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${event.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}-${event.date}-lineup.ics`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export calendar:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-primordial-background-primary">
      {/* Hero Section */}
      <div className="bg-primordial-background-secondary border-b border-gray-700">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            {/* Flyer Thumbnail */}
            <div className="w-40 h-53 bg-gradient-to-br from-primordial-accent-primary to-purple-600 rounded-lg flex-shrink-0 flex items-center justify-center">
              <div className="text-white text-center">
                <div className="font-bold text-lg mb-2 font-heading">PG</div>
                <div className="text-xs opacity-80">FLYER</div>
              </div>
            </div>

            {/* Event Details */}
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 font-heading">{event.title}</h1>
              <div className="text-lg text-gray-300 mb-4">{event.date}</div>
              <div className="flex items-center gap-2 text-gray-400 mb-6">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>{event.title} Venue Location</span>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={exportCalendar}
                  disabled={isExporting}
                  className="bg-primordial-accent-primary hover:bg-primordial-accent-hover text-primordial-background-primary px-6 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primordial-accent-primary/60"
                >
                  {isExporting ? 'Exporting...' : 'Add to Calendar'}
                </button>
                <button className="border border-gray-500 text-gray-300 hover:bg-gray-800 px-6 py-3 rounded-lg font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500/60">
                  Get Tickets
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <h2 className="text-2xl font-bold text-white mb-6 font-heading">Lineup Schedule</h2>
        
        {/* Desktop Timeline Grid */}
        <div className="hidden lg:block">
          <TimelineGrid event={event} slots={eventSlots} artists={eventArtists} />
        </div>

        {/* Mobile Timeline List */}
        <div className="lg:hidden">
          <MobileTimelineList slots={eventSlots} artists={eventArtists} />
        </div>

        {/* Artist Count */}
        <div className="mt-6 text-center text-gray-400">
          {eventArtists.length} artists • {eventSlots.length} performances
        </div>
      </div>

      {/* Footer for Embed */}
      <div className="border-t border-gray-700 py-4 text-center text-gray-500 text-sm">
        <div className="max-w-6xl mx-auto px-6">
          Powered by <span className="text-primordial-accent-primary font-semibold">Primordial Groove</span>
        </div>
      </div>
    </div>
  );
} 