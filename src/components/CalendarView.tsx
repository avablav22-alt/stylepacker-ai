'use client';

import { useApp } from '@/context/AppContext';

const WEATHER_EMOJIS: Record<string, string> = {
  sunny: '☀️',
  cloudy: '☁️',
  rainy: '🌧️',
  snowy: '❄️',
  stormy: '⛈️',
  partly_cloudy: '⛅',
  windy: '💨',
  clear: '🌙',
};

export default function CalendarView() {
  const { results, setCurrentPage } = useApp();

  if (!results) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <p className="text-gray-600">No results available</p>
      </div>
    );
  }

  const getWeatherEmoji = (condition?: string): string => {
    if (!condition) return '🌡️';
    const key = condition.toLowerCase().replace(/\s+/g, '_');
    return WEATHER_EMOJIS[key] || '🌡️';
  };

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
          {results.days.map((day) => {
            const daytimePieceCount = day.daytimeOutfit.pieces.length;
            const eveningPieceCount = day.eveningOutfit?.pieces.length || 0;
            const totalPieces = daytimePieceCount + eveningPieceCount;
            return (
              <button
                key={day.dayNumber}
                onClick={() => handleDayClick(day.dayNumber)}
                className="group text-left bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100 hover:border-[#534AB7] cursor-pointer"
              >
                {/* Card Content */}
                <div className="p-6">
                  {/* Day Header */}
                  <div className="mb-4 pb-4 border-b border-gray-100">
                    <div className="flex items-start justify-between">
                      <div>
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
                      </div>
                      {day.weather && (
                        <div className="text-right">
                          <div className="text-2xl mb-1">
                            {getWeatherEmoji(day.weather.conditions)}
                          </div>
                          <p className="text-xs text-gray-600">
                            {Math.round(day.weather.temp)}°F
                          </p>
                        </div>
                      )}
                    </div>
                    {day.title && (
                      <p className="text-sm text-gray-600 mt-2">{day.title}</p>
                    )}
                  </div>

                  {/* Piece Count */}
                  <div className="mb-4 flex items-center gap-2">
                    <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM15 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2h-2zM5 13a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5z" />
                    </svg>
                    <p className="text-sm text-gray-600">
                      {totalPieces} piece{totalPieces !== 1 ? 's' : ''}
                    </p>
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
                      {day.daytimeOutfit.colorPalette.slice(0, 4).map((color, idx) => (
                        <div
                          key={idx}
                          className="w-6 h-6 rounded-full border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                      ))}
                      {day.daytimeOutfit.colorPalette.length > 4 && (
                        <div className="w-6 h-6 rounded-full border border-gray-300 bg-gray-100 flex items-center justify-center">
                          <span className="text-xs text-gray-600 font-medium">
                            +{day.daytimeOutfit.colorPalette.length - 4}
                          </span>
                        </div>
                      )}
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
                        {day.eveningOutfit.colorPalette.slice(0, 4).map((color, idx) => (
                          <div
                            key={idx}
                            className="w-6 h-6 rounded-full border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                            style={{ backgroundColor: color }}
                            title={color}
                          />
                        ))}
                        {day.eveningOutfit.colorPalette.length > 4 && (
                          <div className="w-6 h-6 rounded-full border border-gray-300 bg-gray-100 flex items-center justify-center">
                            <span className="text-xs text-gray-600 font-medium">
                              +{day.eveningOutfit.colorPalette.length - 4}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Day Cost */}
                  {day.dayTotal !== undefined && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <p className="text-xs text-gray-600">Daily budget</p>
                      <p className="text-lg font-semibold text-[#534AB7]">
                        ${day.dayTotal.toFixed(2)}
                      </p>
                    </div>
                  )}
                </div>

                {/* Hover Overlay */}
                <div className="bg-gradient-to-r from-[#534AB7] to-[#7c5cdb] px-6 py-3 text-white text-sm font-medium text-center transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  View Details
                </div>
              </button>
            );
          })}
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
          {results.tripTotal !== undefined && (
            <div className="mt-6 pt-6 border-t border-gray-100">
              <p className="text-sm text-gray-600 mb-2">Total Trip Budget</p>
              <p className="text-2xl font-bold text-[#534AB7]">
                ${results.tripTotal.toFixed(2)}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
