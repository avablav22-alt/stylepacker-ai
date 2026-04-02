'use client';

import { useApp } from '@/context/AppContext';

export default function CalendarView() {
  const { results, setCurrentPage } = useApp();

  if (!results) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <p className="text-gray-600">No results available</p>
      </div>
    );
  }

  const handleDayClick = (dayNumber: number) => {
    // Navigate to results page (page 6) with the selected day
    // The Results component can be updated to track selected day
    setCurrentPage(6);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-gray-900">
            📅 Calendar View
          </h1>
          <button
            onClick={() => setCurrentPage(6)}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {results.days.map((day) => (
            <button
              key={day.dayNumber}
              onClick={() => handleDayClick(day.dayNumber)}
              className="group text-left bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100 hover:border-[#534AB7] cursor-pointer"
            >
              {/* Card Content */}
              <div className="p-6">
                {/* Day Header */}
                <div className="mb-4 pb-4 border-b border-gray-100">
                  <div className="text-sm text-gray-600 font-medium">
                    {new Date(day.date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mt-1">
                    Day {day.dayNumber}
                  </h3>
                  {day.title && (
                    <p className="text-sm text-gray-600 mt-2">{day.title}</p>
                  )}
                </div>

                {/* Daytime Outfit */}
                <div className="mb-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Daytime
                  </p>
                  <p className="text-sm font-medium text-gray-900 mb-3">
                    {day.daytimeOutfit.lookName}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {day.daytimeOutfit.colorPalette.map((color, idx) => (
                      <div
                        key={idx}
                        className="w-6 h-6 rounded-full border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>

                {/* Evening Outfit */}
                {day.eveningOutfit && (
                  <div className="pt-4 border-t border-gray-100">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                      Evening
                    </p>
                    <p className="text-sm font-medium text-gray-900 mb-3">
                      {day.eveningOutfit.lookName}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {day.eveningOutfit.colorPalette.map((color, idx) => (
                        <div
                          key={idx}
                          className="w-6 h-6 rounded-full border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Hover Overlay */}
              <div className="bg-gradient-to-r from-[#534AB7] to-[#7c5cdb] px-6 py-3 text-white text-sm font-medium text-center transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                View Details
              </div>
            </button>
          ))}
        </div>

        {/* Summary Info */}
        <div className="mt-12 bg-white rounded-lg border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Trip Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <p className="text-sm text-gray-600 mb-1">Duration</p>
              <p className="text-lg font-semibold text-gray-900">{results.totalDays} days</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Destination</p>
              <p className="text-lg font-semibold text-gray-900">{results.destination}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Outfits</p>
              <p className="text-lg font-semibold text-gray-900">
                {results.days.reduce((acc, day) => acc + (day.eveningOutfit ? 2 : 1), 0)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Temperature</p>
              <p className="text-lg font-semibold text-gray-900">
                {Math.round(results.weather.temp)}°F
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
