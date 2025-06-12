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
    // We'll use a timeout to allow the state to update
    setTimeout(() => {
      router.push('/lineup');
    }, 100);
  };

  const nextStep = () => setStep(prev => Math.min(prev + 1, 3));
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

  return (
    <div className="min-h-screen bg-primordial-background-primary">
      {/* Header */}
      <header className="mobile-header bg-primordial-background-tertiary border-b border-gray-700 px-4 md:px-6 py-4">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center gap-2 md:gap-4">
            <Link href="/" className="mobile-touch-target text-gray-400 hover:text-white p-2 -m-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>
            <h1 className="text-lg md:text-xl font-semibold text-white">Create New Event</h1>
          </div>
          
          {/* Progress indicator */}
          <div className="flex items-center gap-1 md:gap-2">
            {[1, 2, 3].map(num => (
              <div
                key={num}
                className={`w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center text-xs md:text-sm font-medium transition-colors ${
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

      {/* Main Content */}
      <div className="max-w-2xl mx-auto py-6 md:py-12 px-4 md:px-6">
        <div className="bg-primordial-background-tertiary rounded-lg p-4 md:p-8">
          
          {/* Step 1: Event Details */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Event Details</h2>
                <p className="text-gray-400">Let's start with the basics about your event.</p>
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
                    className="w-full px-4 py-3 bg-primordial-background-quaternary border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
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
                    className="w-full px-4 py-3 bg-primordial-background-quaternary border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
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
                      className="w-full px-4 py-3 bg-primordial-background-quaternary border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
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
                      className="w-full px-4 py-3 bg-primordial-background-quaternary border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Stages */}
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
                      className="flex-1 px-4 py-3 bg-primordial-background-quaternary border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    />
                    {formData.stages.length > 1 && (
                      <button
                        onClick={() => removeStage(index)}
                        className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded"
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
                  className="w-full py-3 border-2 border-dashed border-gray-600 rounded-lg text-gray-400 hover:border-gray-500 hover:text-gray-300 transition-colors"
                >
                  + Add Another Stage
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Review & Publish */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Review & Publish</h2>
                <p className="text-gray-400">Review your event details and publish to start building your lineup.</p>
              </div>
              
              <div className="space-y-4 p-6 bg-primordial-background-quaternary rounded-lg">
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

          {/* Navigation */}
          <div className="flex flex-col sm:flex-row justify-between mt-6 md:mt-8 pt-4 md:pt-6 border-t border-gray-600 gap-3">
            <button
              onClick={prevStep}
              disabled={step === 1}
              className="mobile-touch-target px-6 py-3 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors order-2 sm:order-1"
            >
              ← Previous
            </button>
            
            <div className="flex gap-3 order-1 sm:order-2">
              {step < 3 ? (
                <button
                  onClick={nextStep}
                  disabled={
                    (step === 1 && (!formData.title || !formData.date)) ||
                    (step === 2 && formData.stages.some(stage => !stage.trim()))
                  }
                  className="mobile-touch-target flex-1 sm:flex-none px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next →
                </button>
              ) : (
                <button
                  onClick={handlePublish}
                  className="mobile-touch-target flex-1 sm:flex-none px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                >
                  🚀 Publish Event
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 