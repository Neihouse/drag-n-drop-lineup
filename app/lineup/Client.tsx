'use client';

import { DndContext, DragEndEvent, DndContextProps } from '@dnd-kit/core';
import { useState, useEffect } from 'react';
import { artists, timeSlots } from '@/lib/data';
import { loadSlots, saveSlots, clearSlots } from '@/lib/storage';
import { Draggable, Droppable } from '@/components/DragDrop';
import type { Slot } from '@/lib/data';
import Link from 'next/link';

export default function Client() {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [activeStage, setActiveStage] = useState<'Main' | 'Side Room' | 'Patio'>('Main');
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  
  // Load slots from localStorage when component mounts
  useEffect(() => {
    const savedSlots = loadSlots();
    setSlots(savedSlots);
  }, []);

  // Auto-save slots when they change
  useEffect(() => {
    saveSlots(slots);
  }, [slots]);

  const handleDragStart: DndContextProps['onDragStart'] = () => {
    setIsDragging(true);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setIsDragging(false);
    
    if (!event.over) return;
    
    const artistId = event.active.id as string;
    const timeSlot = event.over.data.current?.timeSlot;
    
    if (!timeSlot) return;
    
    // Remove any existing slot for this time/stage combination
    const filteredSlots = slots.filter(slot => 
      !(slot.start === timeSlot && slot.stage === activeStage)
    );
    
    // Add the new slot
    const newSlots = [...filteredSlots, { 
      artistId, 
      start: timeSlot, 
      stage: activeStage 
    }];
    
    setSlots(newSlots);
  };

  const handleDragCancel: DndContextProps['onDragCancel'] = () => {
    setIsDragging(false);
  };

  const handleClearAll = () => {
    setSlots([]);
    clearSlots();
  };

  // Filter artists based on search query
  const filteredArtists = artists.filter(artist =>
    artist.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    artist.genre.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get slots for current stage
  const currentStageSlots = slots.filter(slot => slot.stage === activeStage);

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white">
      <DndContext 
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        {/* Header */}
        <header className="bg-[#2a2a2a] border-b border-gray-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-gray-400 hover:text-white">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-blue-500 rounded flex items-center justify-center">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <h1 className="text-xl font-semibold">DJ Lineup Builder</h1>
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
          <div className="w-80 bg-[#2a2a2a] border-r border-gray-700 flex flex-col">
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
                  className="w-full bg-[#3a3a3a] border border-gray-600 rounded-md pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto px-4 pb-4">
              <div className="space-y-3">
                {filteredArtists.map(artist => (
                  <Draggable key={artist.id} id={artist.id}>
                    <div className="flex items-center gap-3 p-3 bg-[#3a3a3a] rounded-lg hover:bg-[#4a4a4a] transition-colors cursor-grab active:cursor-grabbing">
                      <div className={`w-12 h-12 ${artist.avatarColor} rounded-lg flex items-center justify-center text-white font-semibold text-sm`}>
                        {artist.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-white">{artist.name}</div>
                        <div className="text-sm text-gray-400">Genre: {artist.genre}</div>
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
            <div className="bg-[#2a2a2a] border-b border-gray-700 px-6 py-3">
              <div className="flex gap-8">
                {(['Main', 'Side Room', 'Patio'] as const).map(stage => (
                  <button
                    key={stage}
                    onClick={() => setActiveStage(stage)}
                    className={`px-4 py-2 font-medium transition-colors ${
                      activeStage === stage 
                        ? 'text-white border-b-2 border-blue-500' 
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
                <thead className="bg-[#2a2a2a] sticky top-0">
                  <tr>
                    <th className="text-left p-4 font-medium text-gray-300 border-b border-gray-700">Time</th>
                    <th className="text-left p-4 font-medium text-gray-300 border-b border-gray-700">Artist</th>
                  </tr>
                </thead>
                <tbody>
                  {timeSlots.map(timeSlot => {
                    const slot = currentStageSlots.find(s => s.start === timeSlot);
                    const artist = slot ? artists.find(a => a.id === slot.artistId) : null;
                    
                    return (
                      <Droppable 
                        key={timeSlot} 
                        id={`${activeStage}-${timeSlot}`} 
                        data={{ timeSlot }}
                      >
                        <tr 
                          className={`border-b border-gray-700 hover:bg-[#2a2a2a] transition-colors ${
                            isDragging ? 'bg-[#2a2a2a]' : ''
                          }`}
                          onClick={() => setSelectedSlot(timeSlot)}
                        >
                          <td className="p-4 font-medium">{timeSlot}</td>
                          <td className="p-4">
                            {artist ? (
                              <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 ${artist.avatarColor} rounded flex items-center justify-center text-white font-semibold text-xs`}>
                                  {artist.name.split(' ').map(n => n[0]).join('')}
                                </div>
                                <span className="font-medium">{artist.name}</span>
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
            <div className="bg-[#2a2a2a] border-t border-gray-700 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex gap-3">
                  <button className="px-4 py-2 bg-[#3a3a3a] hover:bg-[#4a4a4a] rounded-md text-sm font-medium transition-colors">
                    Undo
                  </button>
                  <button className="px-4 py-2 bg-[#3a3a3a] hover:bg-[#4a4a4a] rounded-md text-sm font-medium transition-colors">
                    Redo
                  </button>
                  <button 
                    onClick={handleClearAll}
                    className="px-4 py-2 bg-[#3a3a3a] hover:bg-[#4a4a4a] rounded-md text-sm font-medium transition-colors"
                  >
                    Reset
                  </button>
                  <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-sm font-medium transition-colors">
                    Export
                  </button>
                </div>
                <div className="text-sm text-gray-400">
                  Autosaved
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar - Slot Details */}
          <div className="w-80 bg-[#2a2a2a] border-l border-gray-700 p-6">
            <h3 className="text-lg font-semibold mb-6">Slot Details</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Artist</label>
                <div className="w-full h-10 bg-[#3a3a3a] border border-gray-600 rounded-md"></div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Stage</label>
                <div className="w-full h-10 bg-[#3a3a3a] border border-gray-600 rounded-md"></div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Start Time</label>
                <div className="w-full h-10 bg-[#3a3a3a] border border-gray-600 rounded-md"></div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">End Time</label>
                <div className="w-full h-10 bg-[#3a3a3a] border border-gray-600 rounded-md"></div>
              </div>
              
              <button className="w-full mt-6 bg-[#1a1a1a] hover:bg-black text-white font-medium py-2 px-4 rounded-md transition-colors">
                Save
              </button>
            </div>
          </div>
        </div>
      </DndContext>
    </div>
  );
} 