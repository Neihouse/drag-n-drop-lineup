'use client';

import { useState, useEffect } from 'react';
import { useLineup } from '@/app/providers/LineupStore';
import type { LineupSlot, Artist, Event } from '@/app/providers/LineupStore';
import Link from 'next/link';

// Mock artist data - in real app this would come from auth/user context
const CURRENT_ARTIST: Artist = {
  id: 'dj-nova',
  name: 'DJ Nova',
  genre: 'House',
  avatarColor: 'bg-avatar-amber',
  email: 'nova@primordialgroove.com',
  bio: 'House music specialist with 10+ years experience'
};

interface SlotCardProps {
  slot: LineupSlot;
  event: Event;
  artist: Artist;
  onStatusChange: (slotId: string, status: 'accepted' | 'declined') => void;
  showAnimation: boolean;
}

function SlotCard({ slot, event, artist, onStatusChange, showAnimation }: SlotCardProps) {
  const [isRiderOpen, setIsRiderOpen] = useState(false);
  const [riderNotes, setRiderNotes] = useState('');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return 'bg-green-100 text-green-800 border-green-200';
      case 'declined': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const downloadICS = () => {
    // Simple ICS generation for individual slot
    const startDate = new Date(`${event.date} ${slot.startTime}`);
    const endDate = new Date(`${event.date} ${slot.endTime}`);
    
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Primordial Groove//DJ Dashboard//EN',
      'BEGIN:VEVENT',
      `UID:${slot.id}@primordialgroove.com`,
      `DTSTART:${startDate.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')}`,
      `DTEND:${endDate.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')}`,
      `SUMMARY:${event.title} - ${slot.stage} Stage`,
      `DESCRIPTION:Performance at ${event.title}\\nStage: ${slot.stage}\\nTime: ${slot.startTime} - ${slot.endTime}`,
      `LOCATION:${slot.stage} Stage, ${event.title}`,
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    // Generate proper slugged filename: 2025-07-05_house-warning_dj-nova.ics
    const eventSlug = event.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const artistSlug = artist.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const dateSlug = event.date; // Already in YYYY-MM-DD format
    
    link.download = `${dateSlug}_${eventSlug}_${artistSlug}.ics`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-primordial-card-background rounded-lg shadow-lg p-6 border border-gray-200 relative overflow-hidden">
      {/* Animation overlay */}
      {showAnimation && (
        <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center z-10 animate-pulse">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {/* Event Title */}
        <div>
          <h3 className="text-xl font-semibold text-primordial-card-text font-heading">{event.title}</h3>
          <p className="text-gray-600">{event.date}</p>
        </div>

        {/* Stage and Time */}
        <div className="flex items-center gap-4">
          <span className="px-3 py-1 bg-primordial-accent-primary text-primordial-background-primary rounded-full text-sm font-medium">
            {slot.stage}
          </span>
          <span className="text-lg font-medium text-primordial-card-text">
            {slot.startTime} – {slot.endTime}
          </span>
        </div>

        {/* Venue */}
        <div className="text-gray-600">
          {/* Desktop: Icon + text inline */}
          <div className="hidden sm:flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <a 
              href={`https://maps.google.com/?q=${encodeURIComponent(`${event.title} venue`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primordial-accent-primary transition-colors"
            >
              {event.title} Venue
            </a>
          </div>
          
          {/* Mobile: Just link icon below time */}
          <div className="sm:hidden mt-2">
            <a 
              href={`https://maps.google.com/?q=${encodeURIComponent(`${event.title} venue`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm hover:text-primordial-accent-primary transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Venue
            </a>
          </div>
        </div>

        {/* Status */}
        <div className="flex items-center justify-between">
          <span 
            className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(slot.status)}`}
            role="status"
            aria-label={`Booking status: ${slot.status}`}
          >
            {slot.status.charAt(0).toUpperCase() + slot.status.slice(1)}
          </span>
        </div>

        {/* Actions */}
        <div className="space-y-3 pt-4 border-t border-gray-200">
          {/* Accept/Decline Buttons */}
          {event.locked ? (
            <div className="p-3 bg-gray-100 border border-gray-300 rounded-lg text-center">
              <span className="text-gray-600 font-medium">Final</span>
              <p className="text-xs text-gray-500 mt-1">Lineup finalised</p>
            </div>
          ) : slot.status === 'pending' ? (
            <div className="flex gap-3">
              <button
                onClick={() => onStatusChange(slot.id, 'accepted')}
                tabIndex={0}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-green-500/60"
              >
                Accept
              </button>
              <button
                onClick={() => onStatusChange(slot.id, 'declined')}
                tabIndex={0}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-red-500/60"
              >
                Decline
              </button>
            </div>
          ) : slot.status === 'accepted' ? (
            <button
              onClick={() => onStatusChange(slot.id, 'declined')}
              tabIndex={0}
              className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-red-500/60"
            >
              Change to Decline
            </button>
          ) : (
            <button
              onClick={() => onStatusChange(slot.id, 'accepted')}
              tabIndex={0}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-green-500/60"
            >
              Change to Accept
            </button>
          )}

          {/* Secondary Actions */}
          <div className="flex gap-2">
            <button
              onClick={() => setIsRiderOpen(true)}
              disabled={event.locked}
              tabIndex={0}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-lg font-medium transition-colors text-sm focus:outline-none focus:ring-2 focus:ring-gray-400/60 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add Tech Rider
            </button>
            <button
              onClick={downloadICS}
              tabIndex={0}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400/60"
              title="Download calendar event"
              aria-label="Download calendar event"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Tech Rider Drawer */}
      {isRiderOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50">
          <div className="bg-white rounded-t-2xl w-full max-w-lg mx-4 mb-0 transform transition-transform">
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Tech Rider Notes</h3>
                <button
                  onClick={() => setIsRiderOpen(false)}
                  className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400/60 rounded"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <textarea
                value={riderNotes}
                onChange={(e) => setRiderNotes(e.target.value)}
                placeholder="e.g. 2x XLR inputs, HD25 headphones, stage monitor positioning..."
                className="w-full h-32 p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primordial-accent-primary focus:border-primordial-accent-primary"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    // In real app, save rider notes
                    setIsRiderOpen(false);
                  }}
                  className="flex-1 bg-primordial-accent-primary hover:bg-primordial-accent-hover text-primordial-background-primary py-2 px-4 rounded-lg font-medium transition-colors"
                >
                  Save Notes
                </button>
                <button
                  onClick={() => setIsRiderOpen(false)}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ArtistDashboard() {
  const { state, dispatch } = useLineup();
  const [animatingSlot, setAnimatingSlot] = useState<string | null>(null);
  const [showAutosave, setShowAutosave] = useState(false);

  // Get slots for current artist
  const artistSlots = state.slots.filter(slot => slot.artistId === CURRENT_ARTIST.id);

  const handleStatusChange = (slotId: string, status: 'accepted' | 'declined') => {
    // Show tick animation
    setAnimatingSlot(slotId);
    
    // Update slot status
    dispatch({
      type: 'UPDATE_SLOT',
      payload: {
        id: slotId,
        updates: { status }
      }
    });

    // Show autosave flash
    setShowAutosave(true);

    // Clear animations
    setTimeout(() => {
      setAnimatingSlot(null);
    }, 300);

    setTimeout(() => {
      setShowAutosave(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-primordial-background-primary">
      {/* Header */}
      <header className="bg-primordial-background-tertiary border-b border-gray-700 px-6 py-4 relative">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-gray-400 hover:text-white">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>
            
            {/* Avatar and Name */}
            <div className="flex items-center gap-4">
              <div className={`w-15 h-15 ${CURRENT_ARTIST.avatarColor} rounded-full flex items-center justify-center text-white font-semibold text-lg`}>
                {CURRENT_ARTIST.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <h1 className="text-xl font-semibold text-white font-heading">{CURRENT_ARTIST.name}</h1>
                <p className="text-gray-400 text-sm">{CURRENT_ARTIST.genre} Artist</p>
              </div>
              {/* Tier Badge */}
              <div className="px-3 py-1 bg-primordial-accent-primary text-primordial-background-primary rounded-full text-xs font-bold">
                PRO
              </div>
            </div>
          </div>

          {/* Autosave Flash */}
          {showAutosave && (
            <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium animate-pulse">
              ✓ Saved
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto py-8 px-6">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-2 font-heading">Your Gigs</h2>
          <p className="text-gray-400">Manage your upcoming performances and confirm your availability.</p>
        </div>

        {/* Gig List */}
        {artistSlots.length > 0 ? (
          <div className="space-y-6">
            {artistSlots.map(slot => {
              const event = state.events.find(e => e.id === slot.eventId);
              if (!event) return null;

              return (
                <SlotCard
                  key={slot.id}
                  slot={slot}
                  event={event}
                  artist={CURRENT_ARTIST}
                  onStatusChange={handleStatusChange}
                  showAnimation={animatingSlot === slot.id}
                />
              );
            })}
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-primordial-accent-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-primordial-accent-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No gigs yet</h3>
            <p className="text-gray-400">Check back after bookings are made for your upcoming performances.</p>
          </div>
        )}
      </div>
    </div>
  );
} 