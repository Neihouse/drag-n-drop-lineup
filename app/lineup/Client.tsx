'use client';

import { DndContext, DragEndEvent, DndContextProps } from '@dnd-kit/core';
import { useState, useEffect } from 'react';
import { artists } from '@/lib/data';
import { loadSlots, saveSlots, clearSlots } from '@/lib/storage';
import { Draggable, Droppable } from '@/components/DragDrop';
import type { Slot } from '@/lib/data';

export default function Client() {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  
  // Load slots from localStorage when component mounts
  useEffect(() => {
    const savedSlots = loadSlots();
    setSlots(savedSlots);
    console.log('Loaded slots:', savedSlots);
  }, []);

  // Ensure localStorage is synchronized with state
  useEffect(() => {
    saveSlots(slots);
    console.log('Saved slots:', slots);
  }, [slots]);

  const handleDragStart: DndContextProps['onDragStart'] = () => {
    setIsDragging(true);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setIsDragging(false);
    
    if (!event.over) return;
    
    const artistId = event.active.id as string;
    
    // Get the hour from the droppable data
    const hour = event.over.data.current?.hour;
    if (hour === undefined) return;
    
    console.log('Dropping artist', artistId, 'at hour', hour);
    
    // Remove any existing slot for this hour
    const filteredSlots = slots.filter(slot => slot.start !== hour);
    
    // Add the new slot
    const newSlots = [...filteredSlots, { artistId, start: hour }];
    
    // Update state and save to localStorage
    setSlots(newSlots);
    saveSlots(newSlots);
  };

  const handleDragCancel: DndContextProps['onDragCancel'] = () => {
    setIsDragging(false);
  };

  const handleClearAll = () => {
    setSlots([]);
    clearSlots();
  };

  // Get list of available artists (not yet scheduled)
  const scheduledArtistIds = slots.map(slot => slot.artistId);
  const availableArtists = artists.filter(artist => !scheduledArtistIds.includes(artist.id));

  // Function to remove an artist from a specific time slot
  const removeArtistFromSlot = (hour: number) => {
    const newSlots = slots.filter(slot => slot.start !== hour);
    setSlots(newSlots);
    saveSlots(newSlots);
  };

  return (
    <div className="flex h-screen">
      <DndContext 
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <aside className="w-64 border-r p-4 bg-gray-50 overflow-auto">
          <h2 className="font-bold text-xl mb-4 text-black">Available Artists</h2>
          {availableArtists.length > 0 ? (
            availableArtists.map(artist => (
              <Draggable key={artist.id} id={artist.id} className="mb-2">
                <div className="p-3 bg-white rounded shadow border hover:border-blue-500 transition-colors">
                  <div className="font-semibold text-black">{artist.name}</div>
                  <div className="text-sm text-gray-700">{artist.minutes} min</div>
                </div>
              </Draggable>
            ))
          ) : (
            <div className="text-gray-500 text-center py-8">
              All artists have been scheduled!
            </div>
          )}
        </aside>

        <main className="flex-1 p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-black">Stage Timeline</h1>
            <button 
              onClick={handleClearAll}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded text-sm transition-colors"
            >
              Clear All
            </button>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            {[...Array(6)].map((_, i) => {
              const hour = 20 + i; // 8 PM – 1 AM
              const slot = slots.find(s => s.start === hour);
              const artist = slot ? artists.find(a => a.id === slot.artistId) : null;
              
              return (
                <Droppable 
                  key={hour} 
                  id={`h${hour}`} 
                  data={{ hour }}
                  className={`h-20 border rounded flex items-center justify-center ${isDragging ? 'bg-blue-50' : 'bg-gray-50'}`}
                >
                  {slot && artist ? (
                    <div className="bg-green-100 border-green-300 border w-full h-full p-4 rounded flex items-center justify-between">
                      <div className="flex-1">
                        <div className="font-bold text-black text-lg">{artist.name}</div>
                        <div className="text-sm text-gray-700">{hour}:00 - {hour + 1}:00</div>
                      </div>
                      <button
                        onClick={() => removeArtistFromSlot(hour)}
                        className="ml-4 bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs transition-colors"
                        title="Remove artist"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <div className="text-gray-600 flex items-center justify-center w-full h-full">
                      {isDragging ? 'Drop here' : `${hour}:00 - ${hour + 1}:00`}
                    </div>
                  )}
                </Droppable>
              );
            })}
          </div>
        </main>
      </DndContext>
    </div>
  );
} 