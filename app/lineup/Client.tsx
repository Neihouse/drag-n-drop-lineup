'use client';

import React from 'react';
import { DndContext, DragEndEvent, DndContextProps } from '@dnd-kit/core';
import { useState } from 'react';
import { useLineup } from '@/app/providers/LineupStore';
import type { LineupSlot, Artist, Event } from '@/app/providers/LineupStore';
import { Draggable, Droppable } from '@/components/DragDrop';
import { generateLineupCSV, generateLineupICS, downloadCSV, downloadICS, generateArtistEmail } from '@/lib/exportUtils';
import Link from 'next/link';

export default function Client() {
  const { state, dispatch } = useLineup();
  const [searchQuery, setSearchQuery] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [activeStage, setActiveStage] = useState<string>('Main');

  // Get current event
  const currentEvent = state.events.find(e => e.id === state.activeEventId);
  if (!currentEvent) {
    return (
      <div className="min-h-screen bg-primordial-background-primary flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-2">No Event Selected</h1>
          <p className="text-gray-400 mb-4">Please create or select an event to start building lineups.</p>
          <Link href="/events/create" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg">
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
    setIsDragging(true);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setIsDragging(false);
    
    if (!event.over) return;
    
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
  };

  const handleDragCancel: DndContextProps['onDragCancel'] = () => {
    setIsDragging(false);
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
        {/* Header */}
        <header className="bg-primordial-background-tertiary border-b border-gray-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-gray-400 hover:text-white">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-primordial-accent-primary rounded flex items-center justify-center">
                <svg className="w-4 h-4 text-primordial-background-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-semibold">{currentEvent.title}</h1>
                <p className="text-sm text-gray-400">{currentEvent.date}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-green-400">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
            </svg>
            Autosaved
          </div>
        </header>

        {/* Main Layout */}
        <div className="flex h-[calc(100vh-73px)]">
          {/* Left Sidebar - Artist List */}
          <div className="w-80 bg-primordial-background-tertiary border-r border-gray-700 flex flex-col">
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
            
            <div className="flex-1 overflow-y-auto px-4 pb-4">
              <div className="space-y-3">
                {filteredArtists.map(artist => (
                  <Draggable key={artist.id} id={artist.id}>
                    <div className="flex items-center gap-3 p-3 bg-primordial-background-quaternary rounded-lg hover:bg-primordial-background-hover transition-colors cursor-grab active:cursor-grabbing">
                      <div className={`w-12 h-12 ${artist.avatarColor} rounded-lg flex items-center justify-center text-white font-semibold text-sm`}>
                        {artist.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-white">{artist.name}</div>
                        <div className="text-sm text-gray-400">{artist.genre}</div>
                      </div>
                    </div>
                  </Draggable>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col">
            {/* Stage Tabs */}
            <div className="bg-primordial-background-tertiary border-b border-gray-700 px-6 py-3">
              <div className="flex gap-8">
                {currentEvent.stages.map(stage => (
                  <button
                    key={stage}
                    onClick={() => setActiveStage(stage)}
                    className={`px-4 py-2 font-medium transition-colors ${
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
            <div className="flex-1 overflow-auto">
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
                          className={`border-b border-gray-700 hover:bg-primordial-background-tertiary transition-colors cursor-pointer ${
                            isDragging ? 'bg-primordial-background-tertiary' : ''
                          } ${
                            state.selectedSlot?.id === slot?.id ? 'bg-blue-600/20 border-blue-500' : ''
                          }`}
                          onClick={() => slot && handleSlotClick(slot)}
                        >
                          <td className="p-4 font-medium">{timeSlot}</td>
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
                              <span className="text-gray-500">
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
            <div className="bg-primordial-background-tertiary border-t border-gray-700 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex gap-3">
                  <button 
                    onClick={() => dispatch({ type: 'UNDO' })}
                    disabled={state.historyIndex <= 0}
                    className="px-4 py-2 bg-primordial-background-quaternary hover:bg-primordial-background-hover rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Undo
                  </button>
                  <button 
                    onClick={() => dispatch({ type: 'REDO' })}
                    disabled={state.historyIndex >= state.history.length - 1}
                    className="px-4 py-2 bg-primordial-background-quaternary hover:bg-primordial-background-hover rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Redo
                  </button>
                  <button 
                    onClick={() => dispatch({ type: 'CLEAR_EVENT_SLOTS', payload: currentEvent.id })}
                    className="px-4 py-2 bg-primordial-background-quaternary hover:bg-primordial-background-hover rounded-md text-sm font-medium transition-colors"
                  >
                    Reset
                  </button>
                  <button 
                    onClick={handleExport}
                    className="px-4 py-2 bg-primordial-accent-primary hover:bg-primordial-accent-hover text-primordial-background-primary rounded-md text-sm font-medium transition-colors"
                  >
                    Export
                  </button>
                  <button 
                    onClick={handleEmailArtists}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-md text-sm font-medium transition-colors"
                  >
                    Email Artists
                  </button>
                </div>
                <div className="text-sm text-gray-400">
                  {eventSlots.length} slots scheduled
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar - Slot Details */}
          <SlotDetailsPanel />
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
    if (!slot) return;

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
    if (!slot) return;
    
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
              className="w-full px-3 py-2 bg-primordial-background-quaternary border border-gray-600 rounded-md text-white focus:outline-none focus:border-primordial-accent-primary"
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
              className="w-full px-3 py-2 bg-primordial-background-quaternary border border-gray-600 rounded-md text-white focus:outline-none focus:border-primordial-accent-primary"
            />
          </div>
          
          {/* End Time */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">End Time</label>
            <input
              type="time"
              value={editedEndTime}
              onChange={(e) => setEditedEndTime(e.target.value)}
              className="w-full px-3 py-2 bg-primordial-background-quaternary border border-gray-600 rounded-md text-white focus:outline-none focus:border-primordial-accent-primary"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
            <div className={`px-3 py-2 rounded-md text-sm font-medium ${
              slot.status === 'accepted' ? 'bg-green-600/20 text-green-300' :
              slot.status === 'declined' ? 'bg-red-600/20 text-red-300' :
              'bg-gray-600/20 text-gray-300'
            }`}>
              {slot.status.charAt(0).toUpperCase() + slot.status.slice(1)}
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <button
              onClick={handleSave}
              className="flex-1 bg-primordial-accent-primary hover:bg-primordial-accent-hover text-primordial-background-primary font-medium py-2 px-4 rounded-md transition-colors"
            >
              Save
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-md transition-colors"
            >
              Delete
            </button>
          </div>

          {/* Event Info */}
          {event && (
            <div className="pt-4 border-t border-gray-600">
              <h4 className="text-sm font-medium text-gray-300 mb-2">Event</h4>
              <div className="text-sm text-gray-400">
                <div>{event.title}</div>
                <div>{event.date}</div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center text-gray-400 mt-8">
          <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <p>Click on a scheduled slot to edit details</p>
        </div>
      )}
    </div>
  );
} 