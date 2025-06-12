'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLineup } from '@/app/providers/LineupStore';
import Link from 'next/link';

interface EventFormData {
  title: string;
  date: string;
  stages: string[];
  hours: { start: string; end: string };
}

export default function CreateEvent() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    date: '',
    stages: ['Main'],
    hours: { start: '20:00', end: '02:00' },
  });
  
  const { dispatch } = useLineup();
  const router = useRouter();

  const addStage = () => {
    setFormData(prev => ({
      ...prev,
      stages: [...prev.stages, `Stage ${prev.stages.length + 1}`]
    }));
  };

  const removeStage = (index: number) => {
    if (formData.stages.length > 1) {
      setFormData(prev => ({
        ...prev,
        stages: prev.stages.filter((_, i) => i !== index)
      }));
    }
  };

  const updateStage = (index: number, name: string) => {
    setFormData(prev => ({
      ...prev,
      stages: prev.stages.map((stage, i) => i === index ? name : stage)
    }));
  };

  const handlePublish = () => {
    dispatch({
      type: 'CREATE_EVENT',
      payload: {
        ...formData,
        status: 'published',
        locked: false
      }
    });
    
    // Navigate to the new event's lineup planner
    setTimeout(() => {
      router.push('/lineup');
    }, 100);
  };

  const nextStep = () => setStep(prev => Math.min(prev + 1, 3));
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

  return (
    <div className="min-h-screen bg-primordial-background-primary text-white flex flex-col">
      {/* Mobile-First Header */}
      <header className="mobile-header">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <Link href="/" className="btn p-2 bg-transparent">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>
            <h1 className="text-lg font-semibold">Create New Event</h1>
          </div>
          
          {/* Progress indicator */}
          <div className="flex items-center gap-1">
            {[1, 2, 3].map(num => (
              <div
                key={num}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-colors ${
                  num === step
                    ? 'bg-blue-600 text-white'
                    : num < step
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-600 text-gray-300'
                }`}
              >
                {num < step ? '✓' : num}
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* Mobile-First Main Content */}
      <main className="flex-1">
        <div className="main-content space-y-6">
          
          {/* Step 1: Event Details */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-xl font-bold mb-2">Event Details</h2>
                <p className="text-gray-400 text-sm">Let&apos;s start with the basics about your event.</p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Event Name
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g. House Warning 006"
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Event Date
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Start Time
                    </label>
                    <input
                      type="time"
                      value={formData.hours.start}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        hours: { ...prev.hours, start: e.target.value }
                      }))}
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      End Time
                    </label>
                    <input
                      type="time"
                      value={formData.hours.end}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        hours: { ...prev.hours, end: e.target.value }
                      }))}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Stages */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-xl font-bold mb-2">Configure Stages</h2>
                <p className="text-gray-400 text-sm">Set up the different stages or areas for your event.</p>
              </div>
              
              <div className="space-y-4">
                {formData.stages.map((stage, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <input
                      type="text"
                      value={stage}
                      onChange={(e) => updateStage(index, e.target.value)}
                      className="flex-1"
                    />
                    {formData.stages.length > 1 && (
                      <button
                        onClick={() => removeStage(index)}
                        className="btn p-3 bg-red-600 hover:bg-red-700 text-white flex-shrink-0"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
                
                <button
                  onClick={addStage}
                  className="btn w-full border-2 border-dashed border-gray-600 text-gray-400 hover:border-gray-500 hover:text-gray-300 bg-transparent"
                >
                  + Add Another Stage
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Review & Publish */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-xl font-bold mb-2">Review & Publish</h2>
                <p className="text-gray-400 text-sm">Review your event details and publish to start building your lineup.</p>
              </div>
              
              <div className="card p-6 space-y-4">
                <div>
                  <h3 className="font-semibold text-white text-lg">{formData.title}</h3>
                  <p className="text-gray-400">{formData.date}</p>
                </div>
                
                <div>
                  <h4 className="font-medium text-white mb-2">Event Hours</h4>
                  <p className="text-gray-400">{formData.hours.start} - {formData.hours.end}</p>
                </div>
                
                <div>
                  <h4 className="font-medium text-white mb-2">Stages ({formData.stages.length})</h4>
                  <div className="flex flex-wrap gap-2">
                    {formData.stages.map((stage, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-600/20 text-blue-300 rounded-full text-sm"
                      >
                        {stage}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="mobile-nav">
        <button
          onClick={prevStep}
          disabled={step === 1}
          className={`flex flex-col items-center gap-1 p-2 ${
            step === 1 ? 'text-gray-600' : 'text-gray-400'
          }`}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="text-xs">Previous</span>
        </button>
        
        <div className="flex flex-col items-center gap-1 p-2">
          <div className="text-xs text-gray-400">Step {step} of 3</div>
          <div className="text-xs font-medium text-white">
            {step === 1 ? 'Details' : step === 2 ? 'Stages' : 'Review'}
          </div>
        </div>
        
        {step < 3 ? (
          <button
            onClick={nextStep}
            disabled={
              (step === 1 && (!formData.title || !formData.date)) ||
              (step === 2 && formData.stages.some(stage => !stage.trim()))
            }
            className={`flex flex-col items-center gap-1 p-2 ${
              (step === 1 && (!formData.title || !formData.date)) ||
              (step === 2 && formData.stages.some(stage => !stage.trim()))
                ? 'text-gray-600' 
                : 'text-primordial-accent-primary'
            }`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-xs">Next</span>
          </button>
        ) : (
          <button
            onClick={handlePublish}
            className="flex flex-col items-center gap-1 p-2 text-green-400"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-xs">Publish</span>
          </button>
        )}
      </nav>

      {/* Progressive Enhancement: Desktop Layout */}
      <div className="hidden min-[768px]:block fixed inset-0 bg-primordial-background-primary">
        <div className="min-h-screen flex flex-col">
          {/* Desktop Header */}
          <header className="bg-primordial-background-tertiary border-b border-gray-700 px-6 py-4">
            <div className="flex items-center justify-between max-w-4xl mx-auto">
              <div className="flex items-center gap-4">
                <Link href="/" className="btn p-2 bg-transparent text-gray-400 hover:text-white">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                </Link>
                <h1 className="text-xl font-semibold text-white">Create New Event</h1>
              </div>
              
              {/* Progress indicator */}
              <div className="flex items-center gap-2">
                {[1, 2, 3].map(num => (
                  <div
                    key={num}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                      num === step
                        ? 'bg-blue-600 text-white'
                        : num < step
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-600 text-gray-300'
                    }`}
                  >
                    {num < step ? '✓' : num}
                  </div>
                ))}
              </div>
            </div>
          </header>

          {/* Desktop Main Content */}
          <main className="flex-1 py-12 px-6">
            <div className="max-w-2xl mx-auto">
              <div className="card p-8">
                {/* Desktop content uses same structure but with desktop spacing */}
                {step === 1 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-2">Event Details</h2>
                      <p className="text-gray-400">Let&apos;s start with the basics about your event.</p>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Event Name
                        </label>
                        <input
                          type="text"
                          value={formData.title}
                          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                          placeholder="e.g. House Warning 006"
                          className="w-full"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Event Date
                        </label>
                        <input
                          type="date"
                          value={formData.date}
                          onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                          className="w-full"
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Start Time
                          </label>
                          <input
                            type="time"
                            value={formData.hours.start}
                            onChange={(e) => setFormData(prev => ({ 
                              ...prev, 
                              hours: { ...prev.hours, start: e.target.value }
                            }))}
                            className="w-full"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            End Time
                          </label>
                          <input
                            type="time"
                            value={formData.hours.end}
                            onChange={(e) => setFormData(prev => ({ 
                              ...prev, 
                              hours: { ...prev.hours, end: e.target.value }
                            }))}
                            className="w-full"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-2">Configure Stages</h2>
                      <p className="text-gray-400">Set up the different stages or areas for your event.</p>
                    </div>
                    
                    <div className="space-y-4">
                      {formData.stages.map((stage, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <input
                            type="text"
                            value={stage}
                            onChange={(e) => updateStage(index, e.target.value)}
                            className="flex-1"
                          />
                          {formData.stages.length > 1 && (
                            <button
                              onClick={() => removeStage(index)}
                              className="btn p-2 bg-red-600 hover:bg-red-700 text-white"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          )}
                        </div>
                      ))}
                      
                      <button
                        onClick={addStage}
                        className="btn w-full border-2 border-dashed border-gray-600 text-gray-400 hover:border-gray-500 hover:text-gray-300 bg-transparent py-3"
                      >
                        + Add Another Stage
                      </button>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-2">Review & Publish</h2>
                      <p className="text-gray-400">Review your event details and publish to start building your lineup.</p>
                    </div>
                    
                    <div className="bg-primordial-background-quaternary rounded-lg p-6 space-y-4">
                      <div>
                        <h3 className="font-semibold text-white">{formData.title}</h3>
                        <p className="text-gray-400">{formData.date}</p>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-white mb-2">Event Hours</h4>
                        <p className="text-gray-400">{formData.hours.start} - {formData.hours.end}</p>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-white mb-2">Stages ({formData.stages.length})</h4>
                        <div className="flex flex-wrap gap-2">
                          {formData.stages.map((stage, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-blue-600/20 text-blue-300 rounded-full text-sm"
                            >
                              {stage}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Desktop Navigation */}
                <div className="flex justify-between mt-8 pt-6 border-t border-gray-600">
                  <button
                    onClick={prevStep}
                    disabled={step === 1}
                    className="btn px-6 py-2 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed bg-transparent"
                  >
                    ← Previous
                  </button>
                  
                  <div className="flex gap-3">
                    {step < 3 ? (
                      <button
                        onClick={nextStep}
                        disabled={
                          (step === 1 && (!formData.title || !formData.date)) ||
                          (step === 2 && formData.stages.some(stage => !stage.trim()))
                        }
                        className="btn px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next →
                      </button>
                    ) : (
                      <button
                        onClick={handlePublish}
                        className="btn px-6 py-2 bg-green-600 hover:bg-green-700 text-white"
                      >
                        🚀 Publish Event
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
} 