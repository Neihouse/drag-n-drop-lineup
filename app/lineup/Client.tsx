'use client';

import React from 'react';
import { DndContext, DragEndEvent, DndContextProps } from '@dnd-kit/core';
import { useState } from 'react';
import { useLineup } from '@/app/providers/LineupStore';
import type { LineupSlot, Artist, Event } from '@/app/providers/LineupStore';
import { Draggable, Droppable } from '@/components/DragDrop';
import { generateLineupCSV, generateLineupICS, downloadCSV, downloadICS, generateArtistEmail } from '@/lib/exportUtils';
import { CURRENT_ROLE } from '@/seed/internalSeed';
import Link from 'next/link';

export default function Client() {
  const { state, dispatch } = useLineup();
  const [searchQuery, setSearchQuery] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [activeStage, setActiveStage] = useState<string>('Main');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Get current event
  const currentEvent = state.events.find(e => e.id === state.activeEventId);
  if (!currentEvent) {
    return (
      <div className="min-h-screen bg-primordial-background-primary flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-xl md:text-2xl font-bold text-white mb-2">No Event Selected</h1>
          <p className="text-gray-400 mb-4 text-sm md:text-base">Please create or select an event to start building lineups.</p>
          <Link href="/events/create" className="mobile-touch-target bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg">
            Create Event
          </Link>
        </div>
      </div>
    );
  }

  // Generate time slots based on event hours
  const generateTimeSlots = () => {
    const times = [];
    const startHour = parseInt(currentEvent.hours.start.split(':')[0]);
    const endHour = parseInt(currentEvent.hours.end.split(':')[0]);
    
    // Handle cross-midnight events
    if (endHour < startHour) {
      // Same day times
      for (let hour = startHour; hour <= 23; hour++) {
        for (let minute = 0; minute < 60; minute += 15) {
          times.push(`${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`);
        }
      }
      // Next day times
      for (let hour = 0; hour <= endHour; hour++) {
        for (let minute = 0; minute < 60; minute += 15) {
          times.push(`${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`);
        }
      }
    } else {
      // Same day event
      for (let hour = startHour; hour <= endHour; hour++) {
        for (let minute = 0; minute < 60; minute += 15) {
          times.push(`${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`);
        }
      }
    }
    
    return times;
  };

  const timeSlots = generateTimeSlots();

  const handleDragStart: DndContextProps['onDragStart'] = () => {
    if (currentEvent?.locked) return; // Prevent drag when locked
    setIsDragging(true);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setIsDragging(false);
    
    if (!event.over || currentEvent?.locked) return; // Prevent drop when locked
    
    const artistId = event.active.id as string;
    const timeSlot = event.over.data.current?.timeSlot;
    
    if (!timeSlot || !currentEvent) return;
    
    // Find next available time slot (assume 1-hour slots)
    const startIndex = timeSlots.findIndex(t => t === timeSlot);
    const endIndex = Math.min(startIndex + 4, timeSlots.length - 1); // 4 * 15min = 1 hour
    const endTime = timeSlots[endIndex] || timeSlot;
    
    dispatch({
      type: 'ADD_SLOT',
      payload: {
        eventId: currentEvent.id,
        artistId,
        stage: activeStage,
        startTime: timeSlot,
        endTime: endTime,
        status: 'pending'
      }
    });
    
    // Close mobile sidebar after drop
    setIsMobileSidebarOpen(false);
  };

  const handleDragCancel: DndContextProps['onDragCancel'] = () => {
    setIsDragging(false);
  };

  const handleToggleLock = () => {
    if (!currentEvent) return;
    dispatch({ type: 'TOGGLE_LOCK', payload: currentEvent.id });
  };

  const handleSlotClick = (slot: LineupSlot) => {
    dispatch({ type: 'SELECT_SLOT', payload: slot });
  };

  const handleExport = () => {
    if (!currentEvent) return;
    
    const eventSlots = state.slots.filter(s => s.eventId === currentEvent.id);
    const csvContent = generateLineupCSV(currentEvent, eventSlots, state.artists);
    const icsContent = generateLineupICS(currentEvent, eventSlots, state.artists);
    
    downloadCSV(csvContent, `${currentEvent.title}-lineup-${currentEvent.date}.csv`);
    downloadICS(icsContent, `${currentEvent.title}-lineup-${currentEvent.date}.ics`);
  };

  const handleEmailArtists = () => {
    if (!currentEvent) return;
    
    const eventSlots = state.slots.filter(s => s.eventId === currentEvent.id);
    const emailUrl = generateArtistEmail(currentEvent, eventSlots, state.artists);
    window.open(emailUrl);
  };

  // Filter artists based on search query
  const filteredArtists = state.artists.filter(artist =>
    artist.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    artist.genre.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get slots for current event and stage
  const eventSlots = state.slots.filter(s => s.eventId === currentEvent.id);
  const currentStageSlots = eventSlots.filter(slot => slot.stage === activeStage);

  return (
    <div className="min-h-screen bg-primordial-background-primary text-white">
      <DndContext 
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        {/* Mobile Sidebar Overlay */}
        <div 
          className={`mobile-sidebar-overlay ${isMobileSidebarOpen ? 'open' : ''} md:hidden`}
          onClick={() => setIsMobileSidebarOpen(false)}
        />

        {/* Header */}
        <header className="mobile-header bg-primordial-background-tertiary border-b border-gray-700 px-4 md:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-4">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="mobile-touch-target md:hidden text-gray-400 hover:text-white p-2 -m-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            
            <Link href="/" className="mobile-touch-target text-gray-400 hover:text-white p-2 -m-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>
            
            <div className="flex items-center gap-2 md:gap-3">
              <div className="w-5 h-5 md:w-6 md:h-6 bg-primordial-accent-primary rounded flex items-center justify-center">
                <svg className="w-3 h-3 md:w-4 md:h-4 text-primordial-background-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <div>
                <h1 className="text-lg md:text-xl font-semibold">{currentEvent.title}</h1>
                <p className="text-xs md:text-sm text-gray-400">{currentEvent.date}</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 md:gap-4">
            {/* Lock/Unlock Toggle - Promoters & Bookers */}
            {(CURRENT_ROLE === 'promoter' || CURRENT_ROLE === 'booker') && (
              <button
                onClick={handleToggleLock}
                className={`mobile-touch-target px-2 md:px-3 py-2 rounded-md text-xs md:text-sm font-medium transition-colors ${
                  currentEvent.locked 
                    ? 'bg-red-600 hover:bg-red-500 text-white' 
                    : 'bg-primordial-accent-primary hover:bg-primordial-accent-hover text-primordial-background-primary'
                }`}
                title={currentEvent.locked ? 'Unlock lineup' : 'Lock lineup'}
              >
                {currentEvent.locked ? (
                  <>
                    <svg className="w-3 h-3 md:w-4 md:h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <span className="hidden sm:inline">Unlock</span>
                  </>
                ) : (
                  <>
                    <svg className="w-3 h-3 md:w-4 md:h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                    </svg>
                    <span className="hidden sm:inline">Lock</span>
                  </>
                )}
              </button>
            )}
            
            {/* Status Indicators */}
            <div className="hidden md:flex items-center gap-2 text-sm">
              {currentEvent.locked && (
                <span className="text-red-400 font-medium">
                  🔒 Locked
                </span>
              )}
              <span className="text-green-400">
                <svg className="w-4 h-4 inline mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                </svg>
                Autosaved
              </span>
            </div>
          </div>
        </header>

        {/* Main Layout */}
        <div className="flex h-[calc(100vh-73px)]">
          {/* Desktop Left Sidebar - Artist List */}
          <div className="hidden md:block w-80 bg-primordial-background-tertiary border-r border-gray-700 flex-col">
            <div className="p-4">
              <div className="relative">
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search artists"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-primordial-background-quaternary border border-gray-600 rounded-md pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-primordial-accent-primary"
                />
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto px-4 pb-4 ios-momentum-scroll">
              <div className="space-y-3">
                {filteredArtists.map(artist => {
                  const artistCard = (
                    <div className={`flex items-center gap-3 p-3 bg-primordial-background-quaternary rounded-lg transition-colors ${
                      currentEvent?.locked 
                        ? 'opacity-60 cursor-not-allowed' 
                        : 'hover:bg-primordial-background-hover cursor-grab active:cursor-grabbing'
                    }`}>
                      <div className={`w-12 h-12 ${artist.avatarColor} rounded-lg flex items-center justify-center text-white font-semibold text-sm ${
                        currentEvent?.locked ? 'opacity-75' : ''
                      }`}>
                        {artist.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-white">{artist.name}</div>
                        <div className="text-sm text-gray-400">{artist.genre}</div>
                      </div>
                      {currentEvent?.locked && (
                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      )}
                    </div>
                  );

                  return currentEvent?.locked ? (
                    <div key={artist.id}>
                      {artistCard}
                    </div>
                  ) : (
                    <Draggable key={artist.id} id={artist.id}>
                      {artistCard}
                    </Draggable>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Mobile Sidebar - Artist List */}
          <div className={`mobile-sidebar ${isMobileSidebarOpen ? 'open' : ''} md:hidden`}>
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between p-4 border-b border-gray-600">
                <h2 className="text-lg font-semibold text-white">Artists</h2>
                <button
                  onClick={() => setIsMobileSidebarOpen(false)}
                  className="mobile-touch-target text-gray-400 hover:text-white p-2 -m-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="p-4">
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search artists"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-primordial-background-quaternary border border-gray-600 rounded-md pl-10 pr-4 py-3 text-base focus:outline-none focus:border-primordial-accent-primary"
                  />
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto px-4 pb-4 ios-momentum-scroll">
                <div className="space-y-3">
                  {filteredArtists.map(artist => {
                    const artistCard = (
                      <div className={`draggable-mobile flex items-center gap-3 p-4 bg-primordial-background-quaternary rounded-lg transition-colors ${
                        currentEvent?.locked 
                          ? 'opacity-60 cursor-not-allowed' 
                          : 'hover:bg-primordial-background-hover cursor-grab active:cursor-grabbing'
                      }`}>
                        <div className={`w-12 h-12 ${artist.avatarColor} rounded-lg flex items-center justify-center text-white font-semibold text-sm ${
                          currentEvent?.locked ? 'opacity-75' : ''
                        }`}>
                          {artist.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-white">{artist.name}</div>
                          <div className="text-sm text-gray-400">{artist.genre}</div>
                        </div>
                        {currentEvent?.locked && (
                          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                        )}
                      </div>
                    );

                    return currentEvent?.locked ? (
                      <div key={artist.id}>
                        {artistCard}
                      </div>
                    ) : (
                      <Draggable key={artist.id} id={artist.id}>
                        {artistCard}
                      </Draggable>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col">
            {/* Stage Tabs */}
            <div className="bg-primordial-background-tertiary border-b border-gray-700 px-4 md:px-6 py-3">
              <div className="flex gap-4 md:gap-8 overflow-x-auto scrollbar-hide">
                {currentEvent.stages.map(stage => (
                  <button
                    key={stage}
                    onClick={() => setActiveStage(stage)}
                    className={`mobile-touch-target px-3 md:px-4 py-2 font-medium transition-colors whitespace-nowrap ${
                      activeStage === stage 
                        ? 'text-white border-b-2 border-primordial-accent-primary' 
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {stage}
                  </button>
                ))}
              </div>
            </div>

            {/* Timeline Table */}
            <div className="flex-1 overflow-auto ios-momentum-scroll">
              <table className="timeline-table w-full">
                <thead className="bg-primordial-background-tertiary sticky top-0">
                  <tr>
                    <th className="text-left p-3 md:p-4 font-medium text-gray-300 border-b border-gray-700">Time</th>
                    <th className="text-left p-3 md:p-4 font-medium text-gray-300 border-b border-gray-700">Artist</th>
                  </tr>
                </thead>
                <tbody>
                  {timeSlots.map(timeSlot => {
                    const slot = currentStageSlots.find(s => s.startTime === timeSlot);
                    const artist = slot ? state.artists.find(a => a.id === slot.artistId) : null;
                    
                    return (
                      <Droppable 
                        key={timeSlot} 
                        id={`${activeStage}-${timeSlot}`} 
                        data={{ timeSlot }}
                      >
                        <tr 
                          className={`border-b border-gray-700 transition-colors ${
                            currentEvent?.locked 
                              ? 'opacity-60 cursor-not-allowed' 
                              : 'hover:bg-primordial-background-tertiary cursor-pointer'
                          } ${
                            isDragging && !currentEvent?.locked ? 'bg-primordial-background-tertiary' : ''
                          } ${
                            state.selectedSlot?.id === slot?.id ? 'bg-blue-600/20 border-blue-500' : ''
                          }`}
                          onClick={() => slot && !currentEvent?.locked && handleSlotClick(slot)}
                        >
                          <td className="p-3 md:p-4 font-medium">{timeSlot}</td>
                          <td className="p-3 md:p-4">
                            {artist ? (
                              <div className="flex items-center gap-2 md:gap-3">
                                <div className={`artist-avatar-mobile w-6 h-6 md:w-8 md:h-8 ${artist.avatarColor} rounded flex items-center justify-center text-white font-semibold text-xs`}>
                                  {artist.name.split(' ').map(n => n[0]).join('')}
                                </div>
                                <span className="font-medium text-sm md:text-base">{artist.name}</span>
                                <span className="text-xs text-gray-400">({slot?.startTime} - {slot?.endTime})</span>
                              </div>
                            ) : (
                              <span className="text-gray-500 text-sm">
                                {isDragging ? 'Drop artist here' : ''}
                              </span>
                            )}
                          </td>
                        </tr>
                      </Droppable>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Bottom Controls */}
            <div className="bg-primordial-background-tertiary border-t border-gray-700 px-4 md:px-6 py-3 md:py-4 safe-area-inset-bottom">
              <div className="flex flex-col md:flex-row items-center justify-between gap-3">
                <div className="button-group-horizontal flex gap-2 md:gap-3 w-full md:w-auto">
                  <button 
                    onClick={() => dispatch({ type: 'UNDO' })}
                    disabled={state.historyIndex <= 0 || currentEvent?.locked}
                    className="mobile-touch-target flex-1 md:flex-none px-3 md:px-4 py-2 bg-primordial-background-quaternary hover:bg-primordial-background-hover rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Undo
                  </button>
                  <button 
                    onClick={() => dispatch({ type: 'REDO' })}
                    disabled={state.historyIndex >= state.history.length - 1 || currentEvent?.locked}
                    className="mobile-touch-target flex-1 md:flex-none px-3 md:px-4 py-2 bg-primordial-background-quaternary hover:bg-primordial-background-hover rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Redo
                  </button>
                  <button 
                    onClick={() => dispatch({ type: 'CLEAR_EVENT_SLOTS', payload: currentEvent.id })}
                    disabled={currentEvent?.locked}
                    className="mobile-touch-target flex-1 md:flex-none px-3 md:px-4 py-2 bg-primordial-background-quaternary hover:bg-primordial-background-hover rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Reset
                  </button>
                  <button 
                    onClick={handleExport}
                    className="mobile-touch-target flex-1 md:flex-none px-3 md:px-4 py-2 bg-primordial-accent-primary hover:bg-primordial-accent-hover text-primordial-background-primary rounded-md text-sm font-medium transition-colors"
                  >
                    Export
                  </button>
                  <button 
                    onClick={handleEmailArtists}
                    className="mobile-touch-target flex-1 md:flex-none px-3 md:px-4 py-2 bg-green-600 hover:bg-green-700 rounded-md text-sm font-medium transition-colors"
                  >
                    <span className="hidden sm:inline">Email Artists</span>
                    <span className="sm:hidden">Email</span>
                  </button>
                </div>
                <div className="flex items-center gap-4 text-xs md:text-sm text-gray-400">
                  <span>{eventSlots.length} slots scheduled</span>
                  
                  {/* Dev-only reset button */}
                  {process.env.NODE_ENV === 'development' && (
                    <button
                      onClick={() => {
                        localStorage.clear();
                        window.location.reload();
                      }}
                      className="px-2 md:px-3 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded text-xs transition-colors"
                      title="Clear all data and reset to seed state"
                    >
                      Reset Demo Data
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar - Slot Details - Hidden on mobile */}
          <div className="hidden lg:block">
            <SlotDetailsPanel />
          </div>
        </div>
      </DndContext>
    </div>
  );
}

// Slot Details Panel Component
function SlotDetailsPanel() {
  const { state, dispatch } = useLineup();
  const slot = state.selectedSlot;
  const artist = slot ? state.artists.find(a => a.id === slot.artistId) : null;
  const event = slot ? state.events.find(e => e.id === slot.eventId) : null;

  const [editedStartTime, setEditedStartTime] = useState(slot?.startTime || '');
  const [editedEndTime, setEditedEndTime] = useState(slot?.endTime || '');
  const [editedArtistId, setEditedArtistId] = useState(slot?.artistId || '');

  // Update local state when selected slot changes
  React.useEffect(() => {
    if (slot) {
      setEditedStartTime(slot.startTime);
      setEditedEndTime(slot.endTime);
      setEditedArtistId(slot.artistId);
    }
  }, [slot]);

  const handleSave = () => {
    if (!slot || event?.locked) return;

    dispatch({
      type: 'UPDATE_SLOT',
      payload: {
        id: slot.id,
        updates: {
          startTime: editedStartTime,
          endTime: editedEndTime,
          artistId: editedArtistId,
        }
      }
    });

    // Show success toast (you can implement this)
    console.log('Slot updated successfully!');
  };

  const handleDelete = () => {
    if (!slot || event?.locked) return;
    
    dispatch({ type: 'REMOVE_SLOT', payload: slot.id });
    dispatch({ type: 'SELECT_SLOT', payload: null });
  };

  return (
    <div className="w-80 bg-primordial-background-tertiary border-l border-gray-700 p-6">
      <h3 className="text-lg font-semibold mb-6">Slot Details</h3>
      
      {slot ? (
        <div className="space-y-4">
          {/* Artist Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Artist</label>
            <select
              value={editedArtistId}
              onChange={(e) => setEditedArtistId(e.target.value)}
              disabled={event?.locked}
              className="w-full px-3 py-2 bg-primordial-background-quaternary border border-gray-600 rounded-md text-white focus:outline-none focus:border-primordial-accent-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {state.artists.map(artist => (
                <option key={artist.id} value={artist.id}>
                  {artist.name} ({artist.genre})
                </option>
              ))}
            </select>
          </div>
          
          {/* Stage Display */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Stage</label>
            <div className="w-full px-3 py-2 bg-primordial-background-quaternary border border-gray-600 rounded-md text-gray-400">
              {slot.stage}
            </div>
          </div>
          
          {/* Start Time */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Start Time</label>
            <input
              type="time"
              value={editedStartTime}
              onChange={(e) => setEditedStartTime(e.target.value)}
              disabled={event?.locked}
              className="w-full px-3 py-2 bg-primordial-background-quaternary border border-gray-600 rounded-md text-white focus:outline-none focus:border-primordial-accent-primary disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>
          
          {/* End Time */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">End Time</label>
            <input
              type="time"
              value={editedEndTime}
              onChange={(e) => setEditedEndTime(e.target.value)}
              disabled={event?.locked}
              className="w-full px-3 py-2 bg-primordial-background-quaternary border border-gray-600 rounded-md text-white focus:outline-none focus:border-primordial-accent-primary disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={handleSave}
              disabled={event?.locked}
              className="flex-1 px-4 py-2 bg-primordial-accent-primary hover:bg-primordial-accent-hover text-primordial-background-primary rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save
            </button>
            <button
              onClick={handleDelete}
              disabled={event?.locked}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Delete
            </button>
          </div>
          
          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
            <div className={`px-3 py-2 rounded-md text-center font-medium ${
              slot.status === 'accepted' ? 'bg-green-600/20 text-green-300' :
              slot.status === 'declined' ? 'bg-red-600/20 text-red-300' :
              'bg-yellow-600/20 text-yellow-300'
            }`}>
              {slot.status.charAt(0).toUpperCase() + slot.status.slice(1)}
            </div>
          </div>
          
        </div>
      ) : (
        <div className="text-center text-gray-400 py-8">
          <p>Select a slot to view details</p>
        </div>
      )}
    </div>
  );
} 