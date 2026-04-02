'use client';

import { useApp } from '@/context/AppContext';
import { ALL_ACTIVITIES } from '@/types';

const ACTIVITY_EMOJIS: Record<string, string> = {
  'Beach day': '🏖️',
  'Fancy dinner': '🍽️',
  'Club/nightlife': '🪩',
  'Hiking': '🥾',
  'Museum visits': '🏛️',
  'Shopping': '🛍️',
  'Brunch': '🥂',
  'Concert': '🎵',
  'Business meeting': '💼',
  'Wedding': '💒',
};

export default function TripDetails() {
  const {
    destination,
    startDate,
    endDate,
    itinerary,
    activities,
    setDestination,
    setStartDate,
    setEndDate,
    setItinerary,
    toggleActivity,
    goNext,
    goBack,
  } = useApp();

  const isFormValid = destination.trim().length > 0 && startDate && endDate;

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-purple-50 to-white p-6 md:p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
            Where are you headed?
          </h1>
          <p className="text-lg text-gray-600">
            Tell us about your trip so we can perfectly curate your wardrobe
          </p>
        </div>

        {/* Destination Input */}
        <div className="mb-8 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <label className="block text-lg font-semibold text-gray-900 mb-3">
            Destination
          </label>
          <input
            type="text"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="Paris, France"
            className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-purple-600 focus:outline-none font-medium text-gray-900 placeholder-gray-400 transition-colors"
          />
        </div>

        {/* Trip Dates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 animate-fade-in" style={{ animationDelay: '0.15s' }}>
          <div>
            <label className="block text-lg font-semibold text-gray-900 mb-3">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-purple-600 focus:outline-none font-medium text-gray-900 transition-colors"
            />
          </div>
          <div>
            <label className="block text-lg font-semibold text-gray-900 mb-3">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-purple-600 focus:outline-none font-medium text-gray-900 transition-colors"
            />
          </div>
        </div>

        {/* Itinerary */}
        <div className="mb-8 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <label className="block text-lg font-semibold text-gray-900 mb-3">
            Itinerary (Optional)
          </label>
          <textarea
            value={itinerary}
            onChange={(e) => setItinerary(e.target.value)}
            placeholder={`Day 1: Arrive afternoon, rooftop dinner at sunset
Day 2: Louvre museum, shopping in Le Marais, cocktails at night
Day 3: Brunch, Montmartre walk, fancy dinner...`}
            className="w-full h-40 p-4 rounded-lg border-2 border-gray-300 focus:border-purple-600 focus:outline-none resize-none font-medium text-gray-700 placeholder-gray-400 transition-colors"
          />
          <p className="text-sm text-gray-500 mt-2">
            Hint: The more detail you provide, the better we can personalize your looks
          </p>
        </div>

        {/* Activity Selection */}
        <div className="mb-8 animate-fade-in" style={{ animationDelay: '0.25s' }}>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Quick-Add Activities
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {ALL_ACTIVITIES.map((activity) => {
              const emoji = ACTIVITY_EMOJIS[activity];
              const isSelected = activities.includes(activity);
              return (
                <button
                  key={activity}
                  onClick={() => toggleActivity(activity)}
                  className={`px-3 py-3 rounded-lg font-medium transition-all duration-200 whitespace-nowrap text-sm md:text-base ${
                    isSelected
                      ? 'bg-purple-600 text-white shadow-lg hover:shadow-xl hover:bg-purple-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <span className="mr-2">{emoji}</span>
                  {activity}
                </button>
              );
            })}
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex gap-4 justify-between mt-12 animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <button
            onClick={goBack}
            className="px-8 py-3 rounded-lg border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
          >
            Back
          </button>
          <button
            onClick={goNext}
            disabled={!isFormValid}
            className={`px-8 py-4 rounded-lg font-bold text-lg transition-all duration-200 ${
              isFormValid
                ? 'bg-purple-600 text-white hover:bg-purple-700 hover:shadow-lg cursor-pointer'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            Generate My Lookbook
          </button>
        </div>

        {/* Validation Message */}
        {!isFormValid && (
          <p className="text-sm text-red-500 mt-4 text-center animate-fade-in">
            Please enter a destination and select both start and end dates
          </p>
        )}
      </div>
    </div>
  );
}
