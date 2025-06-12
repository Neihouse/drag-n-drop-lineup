'use client';

import React from 'react';
import { DndContext, DragEndEvent, DndContextProps } from '@dnd-kit/core';
import { useState } from 'react';
import { useLineup } from '@/app/providers/LineupStore';
import type { LineupSlot } from '@/app/providers/LineupStore';
import { Draggable, Droppable } from '@/components/DragDrop';
import { generateLineupCSV, generateLineupICS, downloadCSV, downloadICS, generateArtistEmail } from '@/lib/exportUtils';
import { CURRENT_ROLE } from '@/seed/internalSeed';
import Link from 'next/link';

export default function Client() {
  const { state, dispatch } = useLineup();
  const [searchQuery, setSearchQuery] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [activeStage, setActiveStage] = useState<string>('Main');
  const [currentView, setCurrentView] = useState<'timeline' | 'artists' | 'settings'>('timeline');

  // Get current event
  const currentEvent = state.events.find(e => e.id === state.activeEventId);
  if (!currentEvent) {
    return (
      <div className="main-content flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-bold text-white mb-4">No Event Selected</h1>
          <p className="text-gray-400 mb-6 text-sm">Please create or select an event to start building lineups.</p>
          <Link href="/events/create" className="btn bg-blue-600 hover:bg-blue-700 text-white">
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
    if (currentEvent?.locked) return;
    setIsDragging(true);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setIsDragging(false);
    
    if (!event.over || currentEvent?.locked) return;
    
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
    
    // Switch back to timeline view after drop on mobile
    setCurrentView('timeline');
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
    <div className="min-h-screen bg-primordial-background-primary text-white flex flex-col">
      <DndContext 
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        {/* Mobile-First Header */}
        <header className="mobile-header">
          <div className="flex items-center gap-3 flex-1">
            <Link href="/" className="btn p-2 bg-transparent">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>
            
            <div className="flex items-center gap-2 flex-1">
              <div className="w-6 h-6 bg-primordial-accent-primary rounded flex items-center justify-center">
                <svg className="w-4 h-4 text-primordial-background-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-lg font-semibold truncate">{currentEvent.title}</h1>
                <p className="text-xs text-gray-400">{currentEvent.date}</p>
              </div>
            </div>
          </div>
          
          {/* Header Actions - Desktop Only */}
          <div className="hidden min-[768px]:flex items-center gap-2">
            {(CURRENT_ROLE === 'promoter' || CURRENT_ROLE === 'booker') && (
              <button
                onClick={handleToggleLock}
                className={`btn text-xs px-3 py-2 ${
                  currentEvent.locked 
                    ? 'bg-red-600 hover:bg-red-500 text-white' 
                    : 'bg-primordial-accent-primary hover:bg-primordial-accent-hover text-primordial-background-primary'
                }`}
              >
                {currentEvent.locked ? 'Unlock' : 'Lock'}
              </button>
            )}
            
            <span className="text-green-400 text-xs">
              ✓ Saved
            </span>
          </div>
        </header>

        {/* Mobile-First Main Content */}
        <div className="flex-1 flex flex-col">
          
          {/* Mobile View: Timeline */}
          {currentView === 'timeline' && (
            <div className="flex-1 flex flex-col">
              {/* Stage Tabs */}
              <div className="bg-primordial-background-tertiary border-b border-gray-700 p-4">
                <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                  {currentEvent.stages.map(stage => (
                    <button
                      key={stage}
                      onClick={() => setActiveStage(stage)}
                      className={`btn px-4 py-2 whitespace-nowrap text-sm ${
                        activeStage === stage 
                          ? 'bg-primordial-accent-primary text-primordial-background-primary' 
                          : 'bg-primordial-background-quaternary text-gray-300'
                      }`}
                    >
                      {stage}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mobile Timeline List */}
              <div className="timeline-mobile flex-1 overflow-auto ios-scroll p-4 space-y-3">
                {timeSlots.map(timeSlot => {
                  const slot = currentStageSlots.find(s => s.startTime === timeSlot);
                  const artist = slot ? state.artists.find(a => a.id === slot.artistId) : null;
                  
                  return (
                    <Droppable 
                      key={timeSlot} 
                      id={`${activeStage}-${timeSlot}`} 
                      data={{ timeSlot }}
                    >
                      <div 
                        className={`card p-4 transition-all ${
                          currentEvent?.locked 
                            ? 'opacity-60' 
                            : 'cursor-pointer'
                        } ${
                          isDragging && !currentEvent?.locked ? 'bg-primordial-background-hover' : ''
                        } ${
                          state.selectedSlot?.id === slot?.id ? 'ring-2 ring-blue-500' : ''
                        }`}
                        onClick={() => slot && !currentEvent?.locked && handleSlotClick(slot)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-mono text-lg text-primordial-accent-primary">{timeSlot}</span>
                          {slot && (
                            <span className="text-xs text-gray-400">
                              {slot.startTime} - {slot.endTime}
                            </span>
                          )}
                        </div>
                        
                        {artist ? (
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 ${artist.avatarColor} rounded-lg flex items-center justify-center text-white font-semibold text-sm`}>
                              {artist.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold text-white truncate">{artist.name}</div>
                              <div className="text-sm text-gray-400">{artist.genre}</div>
                            </div>
                          </div>
                        ) : (
                          <div className="text-gray-500 text-sm py-2">
                            {isDragging ? 'Drop artist here' : 'Empty slot'}
                          </div>
                        )}
                      </div>
                    </Droppable>
                  );
                })}
              </div>

              {/* Desktop Timeline Table */}
              <div className="timeline-desktop flex-1 overflow-auto ios-scroll">
                <table className="w-full">
                  <thead className="bg-primordial-background-tertiary sticky top-0">
                    <tr>
                      <th className="text-left p-4 font-medium text-gray-300 border-b border-gray-700">Time</th>
                      <th className="text-left p-4 font-medium text-gray-300 border-b border-gray-700">Artist</th>
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
                            <td className="p-4 font-mono text-primordial-accent-primary">{timeSlot}</td>
                            <td className="p-4">
                              {artist ? (
                                <div className="flex items-center gap-3">
                                  <div className={`w-8 h-8 ${artist.avatarColor} rounded flex items-center justify-center text-white font-semibold text-xs`}>
                                    {artist.name.split(' ').map(n => n[0]).join('')}
                                  </div>
                                  <span className="font-medium">{artist.name}</span>
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
            </div>
          )}

          {/* Mobile View: Artists */}
          {currentView === 'artists' && (
            <div className="flex-1 flex flex-col">
              <div className="p-4">
                <div className="relative mb-4">
                  <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="search"
                    placeholder="Search artists"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4"
                  />
                </div>
                
                <div className="space-y-3">
                  {filteredArtists.map(artist => {
                    const artistCard = (
                      <div className={`card draggable ${
                        currentEvent?.locked 
                          ? 'opacity-60 cursor-not-allowed' 
                          : 'cursor-grab active:cursor-grabbing'
                      }`}>
                        <div className="flex items-center gap-3">
                          <div className={`w-12 h-12 ${artist.avatarColor} rounded-lg flex items-center justify-center text-white font-semibold`}>
                            {artist.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-white truncate">{artist.name}</div>
                            <div className="text-sm text-gray-400">{artist.genre}</div>
                          </div>
                          {currentEvent?.locked && (
                            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                          )}
                        </div>
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
          )}

          {/* Mobile View: Settings */}
          {currentView === 'settings' && (
            <div className="flex-1 p-4">
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold mb-4">Event Settings</h2>
                  
                  {(CURRENT_ROLE === 'promoter' || CURRENT_ROLE === 'booker') && (
                    <div className="card p-4 mb-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-white">Lineup Lock</h3>
                          <p className="text-sm text-gray-400">
                            {currentEvent.locked ? 'Lineup is locked for editing' : 'Lineup is open for editing'}
                          </p>
                        </div>
                        <button
                          onClick={handleToggleLock}
                          className={`btn ${
                            currentEvent.locked 
                              ? 'bg-red-600 hover:bg-red-500 text-white' 
                              : 'bg-primordial-accent-primary hover:bg-primordial-accent-hover text-primordial-background-primary'
                          }`}
                        >
                          {currentEvent.locked ? 'Unlock' : 'Lock'}
                        </button>
                      </div>
                    </div>
                  )}
                  
                  <div className="space-y-3">
                    <button 
                      onClick={handleExport}
                      className="btn w-full bg-primordial-accent-primary hover:bg-primordial-accent-hover text-primordial-background-primary"
                    >
                      Export Lineup
                    </button>
                    
                    <button 
                      onClick={handleEmailArtists}
                      className="btn w-full bg-green-600 hover:bg-green-700 text-white"
                    >
                      Email Artists
                    </button>
                    
                    <button 
                      onClick={() => dispatch({ type: 'CLEAR_EVENT_SLOTS', payload: currentEvent.id })}
                      disabled={currentEvent?.locked}
                      className="btn w-full bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
                    >
                      Reset Lineup
                    </button>
                  </div>
                </div>
                
                <div className="card p-4">
                  <h3 className="font-medium text-white mb-2">Event Info</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Slots:</span>
                      <span className="text-white">{eventSlots.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Duration:</span>
                      <span className="text-white">{currentEvent.hours.start} - {currentEvent.hours.end}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Stages:</span>
                      <span className="text-white">{currentEvent.stages.length}</span>
                    </div>
                  </div>
                </div>
                
                {process.env.NODE_ENV === 'development' && (
                  <button
                    onClick={() => {
                      localStorage.clear();
                      window.location.reload();
                    }}
                    className="btn w-full bg-gray-700 hover:bg-gray-600 text-gray-300 text-xs"
                  >
                    Reset Demo Data
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Desktop Sidebar - Artists */}
          <div className="hidden min-[768px]:flex">
            <div className="w-80 bg-primordial-background-tertiary border-r border-gray-700 flex flex-col">
              <div className="p-4">
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="search"
                    placeholder="Search artists"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full text-sm pl-10 pr-4"
                  />
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto ios-scroll px-4 pb-4">
                <div className="space-y-3">
                  {filteredArtists.map(artist => {
                    const artistCard = (
                      <div className={`card p-3 draggable ${
                        currentEvent?.locked 
                          ? 'opacity-60 cursor-not-allowed' 
                          : 'cursor-grab active:cursor-grabbing'
                      }`}>
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 ${artist.avatarColor} rounded-lg flex items-center justify-center text-white font-semibold text-sm`}>
                            {artist.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-white text-sm truncate">{artist.name}</div>
                            <div className="text-xs text-gray-400">{artist.genre}</div>
                          </div>
                          {currentEvent?.locked && (
                            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                          )}
                        </div>
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
            
            {/* Desktop Settings Panel */}
            <div className="hidden min-[1024px]:block w-80 bg-primordial-background-tertiary border-l border-gray-700">
              <SlotDetailsPanel />
            </div>
          </div>
        </div>

        {/* Mobile Bottom Navigation */}
        <nav className="mobile-nav">
          <button
            onClick={() => setCurrentView('timeline')}
            className={`flex flex-col items-center gap-1 p-2 ${
              currentView === 'timeline' ? 'text-primordial-accent-primary' : 'text-gray-400'
            }`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-xs">Timeline</span>
          </button>
          
          <button
            onClick={() => setCurrentView('artists')}
            className={`flex flex-col items-center gap-1 p-2 ${
              currentView === 'artists' ? 'text-primordial-accent-primary' : 'text-gray-400'
            }`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
            <span className="text-xs">Artists</span>
          </button>
          
          <button
            onClick={() => setCurrentView('settings')}
            className={`flex flex-col items-center gap-1 p-2 ${
              currentView === 'settings' ? 'text-primordial-accent-primary' : 'text-gray-400'
            }`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-xs">Settings</span>
          </button>
        </nav>
      </DndContext>
    </div>
  );
}

// Slot Details Panel Component (Desktop Only)
function SlotDetailsPanel() {
  const { state, dispatch } = useLineup();
  const slot = state.selectedSlot;
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
  };

  const handleDelete = () => {
    if (!slot || event?.locked) return;
    
    dispatch({ type: 'REMOVE_SLOT', payload: slot.id });
    dispatch({ type: 'SELECT_SLOT', payload: null });
  };

  return (
    <div className="p-6">
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
              className="w-full text-sm"
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
            <div className="card p-3 text-gray-400 text-sm">
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
              className="w-full text-sm"
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
              className="w-full text-sm"
            />
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={handleSave}
              disabled={event?.locked}
              className="btn flex-1 bg-primordial-accent-primary hover:bg-primordial-accent-hover text-primordial-background-primary text-sm disabled:opacity-50"
            >
              Save
            </button>
            <button
              onClick={handleDelete}
              disabled={event?.locked}
              className="btn bg-red-600 hover:bg-red-700 text-white text-sm disabled:opacity-50"
            >
              Delete
            </button>
          </div>
          
          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
            <div className={`card p-3 text-center text-sm font-medium ${
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
          <p className="text-sm">Select a slot to view details</p>
        </div>
      )}
    </div>
  );
} 