'use client';

import Link from 'next/link';
import { useLineup } from './providers/LineupStore';

export default function Home() {
  const { state } = useLineup();

  return (
    <div className="relative flex size-full min-h-screen flex-col bg-primordial-background-primary">
      <div className="layout-container flex h-full grow flex-col">
        {/* Header */}
        <header className="mobile-header flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#2b2f36] px-4 md:px-10 py-3">
          <div className="flex items-center gap-2 md:gap-4 text-white">
            <div className="size-4">
              <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" clipRule="evenodd" d="M24 4H6V17.3333V30.6667H24V44H42V30.6667V17.3333H24V4Z" fill="currentColor" />
              </svg>
            </div>
            <h2 className="text-white text-base md:text-lg font-bold leading-tight tracking-[-0.015em]">Primordial Groove</h2>
          </div>
          <div className="flex flex-1 justify-end gap-2 md:gap-8">
            <div className="hidden md:flex items-center gap-9">
              <a className="text-white text-sm font-medium leading-normal" href="#">About</a>
            </div>
            <Link
              href="/events/create"
              className="mobile-touch-target flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 md:h-10 px-3 md:px-4 bg-primordial-accent-primary text-primordial-background-primary text-sm font-bold leading-normal tracking-[0.015em] hover:bg-primordial-accent-hover transition-colors"
            >
              <span className="truncate hidden sm:inline">Create Event</span>
              <span className="truncate sm:hidden">Create</span>
            </Link>
          </div>
        </header>

        {/* Main Content */}
        <div className="px-4 md:px-8 lg:px-40 flex flex-1 justify-center py-5">
          <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
            {/* Hero Section */}
            <div className="@container">
              <div className="@[480px]:p-4">
                <div
                  className="flex min-h-[480px] flex-col gap-6 bg-cover bg-center bg-no-repeat @[480px]:gap-8 @[480px]:rounded-xl items-center justify-center p-4"
                  style={{
                    backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0.4) 100%), url("https://lh3.googleusercontent.com/aida-public/AB6AXuCdQS1esuteZzHxoNgj_shxuAkA4YOrQBemcZ2lVRipgTS3ijIbl2-Vko6KnlAyFRTU6ZNat7wjrqcvTh9FKxbR4c4YBmHEZZNrpalx2q_s5FdLXsaOBTNYYbsjGIiaXyB0SC8E54_unLW-5BZPER1IqzsiJ1qBb0GnrFUzqNw0ts6r9Nqtk97ALc1PqLwT_L6PmEzgzm43pdofwcEbUNb5bAcFdYyEfvIEeu3pFs4LQMhtpIP5w-ZQicCUwTAM-0X9fD0wu5IXxlI")'
                  }}
                >
                  <div className="flex flex-col gap-2 text-center">
                    <h1 className="text-white text-4xl font-black leading-tight tracking-[-0.033em] @[480px]:text-5xl @[480px]:font-black @[480px]:leading-tight @[480px]:tracking-[-0.033em]">
                      Line-Up Planner
                    </h1>
                    <h2 className="text-white text-sm font-normal leading-normal @[480px]:text-base @[480px]:font-normal @[480px]:leading-normal">
                      Drag and drop artists onto a live timeline to create line-ups in seconds.
                    </h2>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
                    <Link
                      href="/events/create"
                      className="mobile-touch-target flex min-w-[140px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-12 px-6 @[480px]:h-12 @[480px]:px-5 bg-primordial-accent-primary text-primordial-background-primary text-base font-bold leading-normal tracking-[0.015em] @[480px]:text-base @[480px]:font-bold @[480px]:leading-normal @[480px]:tracking-[0.015em] hover:bg-primordial-accent-hover transition-colors"
                    >
                      <span className="truncate">Create Event</span>
                    </Link>
                    
                    {state.events.length > 0 && (
                      <Link
                        href="/lineup"
                        className="mobile-touch-target flex min-w-[140px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-12 px-6 @[480px]:h-12 @[480px]:px-5 bg-transparent border-2 border-white text-white text-base font-bold leading-normal tracking-[0.015em] @[480px]:text-base @[480px]:font-bold @[480px]:leading-normal @[480px]:tracking-[0.015em] hover:bg-white/10 transition-colors"
                      >
                        <span className="truncate">Go to Planner</span>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Events Dashboard */}
            {state.events.length > 0 && (
              <div className="p-4">
                <div className="bg-primordial-background-tertiary rounded-xl p-6">
                  <h3 className="text-2xl font-bold text-white mb-6">Your Events</h3>
                  
                  <div className="grid gap-4">
                    {state.events.map(event => {
                      const eventSlots = state.slots.filter(slot => slot.eventId === event.id);
                      const totalArtists = new Set(eventSlots.map(slot => slot.artistId)).size;
                      
                      return (
                        <div key={event.id} className="bg-primordial-background-quaternary rounded-lg p-4 hover:bg-primordial-background-hover transition-colors">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h4 className="font-semibold text-white text-lg">{event.title}</h4>
                              <p className="text-gray-400">{event.date}</p>
                              <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                                <span>{event.stages.length} stages</span>
                                <span>•</span>
                                <span>{totalArtists} artists scheduled</span>
                                <span>•</span>
                                <span className={`px-2 py-1 rounded-full text-xs ${
                                  event.status === 'published' 
                                    ? 'bg-green-600/20 text-green-300' 
                                    : 'bg-yellow-600/20 text-yellow-300'
                                }`}>
                                  {event.status}
                                </span>
                              </div>
                            </div>
                            
                            <div className="flex gap-2">
                              <Link
                                href={`/lineup?event=${event.id}`}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                              >
                                Edit Lineup
                              </Link>
                              <Link
                                href={`/public/${event.id}`}
                                className="px-4 py-2 bg-primordial-background-quaternary hover:bg-primordial-background-hover text-white rounded-lg text-sm font-medium transition-colors"
                              >
                                Public View
                              </Link>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Features Section */}
            <div className="p-4">
              <div className="responsive-grid grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                {/* Promoter Flow */}
                <div className="bg-primordial-background-tertiary rounded-lg p-6">
                  <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">For Promoters</h3>
                  <p className="text-gray-400 text-sm mb-4">Create events, set up stages, and hand off to your booking team.</p>
                  <Link
                    href="/events/create"
                    className="text-blue-400 hover:text-blue-300 text-sm font-medium"
                  >
                    Create Event →
                  </Link>
                </div>

                {/* Booker Flow */}
                <div className="bg-primordial-background-tertiary rounded-lg p-6">
                  <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">For Bookers</h3>
                  <p className="text-gray-400 text-sm mb-4">Drag artists to timeline, manage conflicts, export schedules.</p>
                  <Link
                    href="/lineup"
                    className="text-green-400 hover:text-green-300 text-sm font-medium"
                  >
                    Build Lineup →
                  </Link>
                </div>

                {/* Artist Flow */}
                <div className="bg-primordial-background-tertiary rounded-lg p-6">
                  <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">For Artists</h3>
                  <p className="text-gray-400 text-sm mb-4">View your slots, accept or decline bookings.</p>
                  <Link
                    href="/artist"
                    className="text-purple-400 hover:text-purple-300 text-sm font-medium"
                  >
                    Artist Dashboard →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
