'use client';

import Link from 'next/link';
import { useLineup } from './providers/LineupStore';

export default function Home() {
  const { state } = useLineup();

  return (
    <div className="min-h-screen bg-primordial-background-primary text-white flex flex-col">
      {/* Mobile-First Header */}
      <header className="mobile-header">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6">
              <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" clipRule="evenodd" d="M24 4H6V17.3333V30.6667H24V44H42V30.6667V17.3333H24V4Z" fill="currentColor" />
              </svg>
            </div>
            <h2 className="text-lg font-bold">Primordial Groove</h2>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden min-[768px]:flex items-center gap-8">
            <a className="text-white text-sm font-medium hover:text-primordial-accent-primary transition-colors" href="#about">About</a>
            <Link
              href="/events/create"
              className="btn bg-primordial-accent-primary hover:bg-primordial-accent-hover text-primordial-background-primary text-sm px-4 py-2"
            >
              Create Event
            </Link>
          </div>
        </div>
      </header>

      {/* Mobile-First Hero Section */}
      <main className="flex-1 flex flex-col">
        <div className="main-content">
          {/* Hero */}
          <div className="text-center py-8 space-y-6">
            <div className="space-y-4">
              <h1 className="text-2xl font-black leading-tight">
                Line-Up Planner
              </h1>
              <p className="text-sm text-gray-300 max-w-md mx-auto">
                Drag and drop artists onto a live timeline to create line-ups in seconds.
              </p>
            </div>
            
            {/* Mobile-First CTA Buttons */}
            <div className="space-y-3">
              <Link
                href="/events/create"
                className="btn w-full bg-primordial-accent-primary hover:bg-primordial-accent-hover text-primordial-background-primary font-bold"
              >
                Create Event
              </Link>
              
              {state.events.length > 0 && (
                <Link
                  href="/lineup"
                  className="btn w-full bg-transparent border-2 border-white text-white hover:bg-white/10 font-bold"
                >
                  Go to Planner
                </Link>
              )}
            </div>
          </div>

          {/* Progressive Enhancement: Larger Hero for Desktop */}
          <div className="hidden min-[768px]:block py-12">
            <div className="text-center space-y-8">
              <div
                className="min-h-[400px] bg-cover bg-center bg-no-repeat rounded-xl flex items-center justify-center p-8"
                style={{
                  backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0.6) 100%), url("https://lh3.googleusercontent.com/aida-public/AB6AXuCdQS1esuteZzHxoNgj_shxuAkA4YOrQBemcZ2lVRipgTS3ijIbl2-Vko6KnlAyFRTU6ZNat7wjrqcvTh9FKxbR4c4YBmHEZZNrpalx2q_s5FdLXsaOBTNYYbsjGIiaXyB0SC8E54_unLW-5BZPER1IqzsiJ1qBb0GnrFUzqNw0ts6r9Nqtk97ALc1PqLwT_L6PmEzgzm43pdofwcEbUNb5bAcFdYyEfvIEeu3pFs4LQMhtpIP5w-ZQicCUwTAM-0X9fD0wu5IXxlI")'
                }}
              >
                <div className="space-y-6 text-center">
                  <h1 className="text-5xl font-black leading-tight">
                    Line-Up Planner
                  </h1>
                  <p className="text-lg text-gray-200 max-w-lg mx-auto">
                    Drag and drop artists onto a live timeline to create line-ups in seconds.
                  </p>
                  
                  <div className="flex gap-4 justify-center">
                    <Link
                      href="/events/create"
                      className="btn bg-primordial-accent-primary hover:bg-primordial-accent-hover text-primordial-background-primary text-lg px-6 py-3 font-bold"
                    >
                      Create Event
                    </Link>
                    
                    {state.events.length > 0 && (
                      <Link
                        href="/lineup"
                        className="btn bg-transparent border-2 border-white text-white hover:bg-white/10 text-lg px-6 py-3 font-bold"
                      >
                        Go to Planner
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Events Dashboard - Mobile First */}
          {state.events.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold">Your Events</h2>
              <div className="space-y-3">
                {state.events.map(event => (
                  <Link 
                    key={event.id}
                    href="/lineup"
                    className="card p-4 block hover:bg-primordial-background-hover transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-white truncate">{event.title}</h3>
                        <p className="text-sm text-gray-400">{event.date}</p>
                      </div>
                      <div className="text-right">
                        <span className={`inline-block w-3 h-3 rounded-full ${
                          event.status === 'published' ? 'bg-green-500' : 'bg-yellow-500'
                        }`}></span>
                        {event.locked && (
                          <div className="text-xs text-red-400 mt-1">🔒 Locked</div>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Features Section - Mobile First */}
          <div className="space-y-6 mt-8">
            <h2 className="text-xl font-bold text-center">For Every Role</h2>
            
            {/* Mobile: Stacked cards */}
            <div className="space-y-4">
              {/* Promoter Card */}
              <div className="card p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-white mb-2">For Promoters</h3>
                    <p className="text-gray-400 text-sm mb-4">Create events, set up stages, and hand off to your booking team.</p>
                    <Link
                      href="/events/create"
                      className="text-blue-400 hover:text-blue-300 text-sm font-medium"
                    >
                      Create Event →
                    </Link>
                  </div>
                </div>
              </div>

              {/* Booker Card */}
              <div className="card p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-white mb-2">For Bookers</h3>
                    <p className="text-gray-400 text-sm mb-4">Build lineups with drag-and-drop ease, manage conflicts.</p>
                    <Link
                      href="/lineup"
                      className="text-green-400 hover:text-green-300 text-sm font-medium"
                    >
                      Build Lineup →
                    </Link>
                  </div>
                </div>
              </div>

              {/* Artist Card */}
              <div className="card p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
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

            {/* Progressive Enhancement: Desktop Grid */}
            <div className="hidden min-[768px]:block">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Promoter Flow */}
                <div className="card p-6">
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
                <div className="card p-6">
                  <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">For Bookers</h3>
                  <p className="text-gray-400 text-sm mb-4">Build lineups with drag-and-drop ease, manage conflicts.</p>
                  <Link
                    href="/lineup"
                    className="text-green-400 hover:text-green-300 text-sm font-medium"
                  >
                    Build Lineup →
                  </Link>
                </div>

                {/* Artist Flow */}
                <div className="card p-6">
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
      </main>

      {/* Mobile Bottom Navigation (if no events) */}
      {state.events.length === 0 && (
        <nav className="mobile-nav">
          <Link
            href="/events/create"
            className="flex flex-col items-center gap-1 p-2 text-primordial-accent-primary"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span className="text-xs">Create</span>
          </Link>
          
          <a 
            href="#about"
            className="flex flex-col items-center gap-1 p-2 text-gray-400"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-xs">About</span>
          </a>
          
          <Link
            href="/artist"
            className="flex flex-col items-center gap-1 p-2 text-gray-400"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="text-xs">Artists</span>
          </Link>
        </nav>
      )}
    </div>
  );
}
