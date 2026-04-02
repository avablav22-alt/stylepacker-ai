'use client';

import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { DayPlan, DayOutfit, OutfitPiece } from '@/types';

export default function Results() {
  const { results, setCurrentPage, premium } = useApp();
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);

  if (!results || !results.days || results.days.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-center">
          <p className="text-gray-500 mb-4">No results yet</p>
          <button
            onClick={() => setCurrentPage(4)}
            className="px-6 py-2 bg-[#534AB7] text-white rounded-lg"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const { destination, startDate, endDate, totalDays, weather, capsuleSummary, days } = results;
  const selectedDay = days[selectedDayIndex];

  const getWeatherEmoji = (desc: string): string => {
    const d = (desc || '').toLowerCase();
    if (d.includes('rain')) return '🌧️';
    if (d.includes('cloud') || d.includes('overcast')) return '☁️';
    if (d.includes('sun') || d.includes('clear')) return '☀️';
    if (d.includes('snow')) return '❄️';
    return '🌤️';
  };

  const getTotalPieces = (): number => {
    const pieceIds = new Set<string>();
    days.forEach((day) => {
      day.daytimeOutfit?.pieces?.forEach((p) => pieceIds.add(p.id));
      day.eveningOutfit?.pieces?.forEach((p) => pieceIds.add(p.id));
    });
    return pieceIds.size;
  };

  const handleSwap = () => {
    alert('Regenerating outfit for Day ' + (selectedDayIndex + 1) + '...');
  };

  const handleShopAll = () => {
    const urls: string[] = [];
    if (selectedDay.daytimeOutfit?.pieces) {
      selectedDay.daytimeOutfit.pieces.forEach((p) => {
        if (p.shopUrl) urls.push(p.shopUrl);
      });
    }
    if (selectedDay.eveningOutfit?.pieces) {
      selectedDay.eveningOutfit.pieces.forEach((p) => {
        if (p.shopUrl) urls.push(p.shopUrl);
      });
    }
    urls.slice(0, 5).forEach((url) => window.open(url, '_blank'));
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr + 'T00:00:00');
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">{destination}</h1>

          <div className="flex flex-wrap items-center gap-4 sm:gap-8 text-sm mb-6">
            <div>
              <p className="text-gray-400 uppercase tracking-wider text-xs mb-1">Dates</p>
              <p className="text-gray-800 font-medium">{formatDate(startDate)} – {formatDate(endDate)}</p>
            </div>
            <div className="hidden sm:block w-px h-8 bg-gray-200" />
            <div>
              <p className="text-gray-400 uppercase tracking-wider text-xs mb-1">Duration</p>
              <p className="text-gray-800 font-medium">{totalDays} days</p>
            </div>
            <div className="hidden sm:block w-px h-8 bg-gray-200" />
            <div>
              <p className="text-gray-400 uppercase tracking-wider text-xs mb-1">Weather</p>
              <p className="text-gray-800 font-medium">
                {getWeatherEmoji(weather?.description || '')} {Math.round(weather?.temp || 72)}°F · {weather?.description || 'Clear'}
              </p>
            </div>
            <div className="hidden sm:block w-px h-8 bg-gray-200" />
            <div>
              <p className="text-gray-400 uppercase tracking-wider text-xs mb-1">Capsule</p>
              <p className="text-gray-800 font-medium">{capsuleSummary || `${getTotalPieces()} pieces`}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setCurrentPage(7)}
              className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 font-medium hover:border-[#534AB7] hover:text-[#534AB7] transition-colors"
            >
              📅 Calendar
            </button>
            <button
              onClick={() => setCurrentPage(8)}
              className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 font-medium hover:border-[#534AB7] hover:text-[#534AB7] transition-colors"
            >
              ✓ Packing List
            </button>
            <button
              onClick={() => setCurrentPage(9)}
              className="px-4 py-2 border border-[#534AB7] rounded-lg text-sm text-[#534AB7] font-medium hover:bg-[#534AB7] hover:text-white transition-colors flex items-center gap-1.5"
            >
              👀 Local Style
              {premium && <span className="premium-badge text-white text-xs px-1.5 py-0.5 rounded-full">PRO</span>}
            </button>
          </div>
        </div>
      </div>

      {/* Day Tabs */}
      <div className="border-b border-gray-100 bg-white sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex overflow-x-auto gap-0 -mb-px" style={{ scrollbarWidth: 'none' }}>
            {days.map((day, i) => (
              <button
                key={i}
                onClick={() => setSelectedDayIndex(i)}
                className={`px-5 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  selectedDayIndex === i
                    ? 'border-[#534AB7] text-[#534AB7]'
                    : 'border-transparent text-gray-500 hover:text-gray-800'
                }`}
              >
                Day {day.dayNumber}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Day Content */}
      {selectedDay && (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
          <div className="animate-fade-in">
            {/* Day Header */}
            <div className="mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{selectedDay.title}</h2>
              <p className="text-gray-500">{selectedDay.activitySummary}</p>
            </div>

            {/* Daytime Outfit */}
            {selectedDay.daytimeOutfit && (
              <OutfitSection
                outfit={selectedDay.daytimeOutfit}
                timeOfDay="daytime"
              />
            )}

            {/* Evening Outfit */}
            {selectedDay.eveningOutfit && (
              <div className="mt-10">
                <OutfitSection
                  outfit={selectedDay.eveningOutfit}
                  timeOfDay="evening"
                />
              </div>
            )}

            {/* Day Actions */}
            <div className="flex flex-wrap gap-3 mt-10 pt-8 border-t border-gray-100">
              <button
                onClick={handleSwap}
                className="px-5 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 font-medium hover:border-[#534AB7] hover:text-[#534AB7] transition-colors"
              >
                🔄 Swap this look
              </button>
              <button
                onClick={handleShopAll}
                className="px-5 py-2.5 bg-[#534AB7] text-white text-sm rounded-lg font-medium hover:bg-[#3E369A] transition-colors"
              >
                🛒 Shop All Pieces
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="border-t border-gray-100 mt-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 flex justify-between items-center">
          <button
            onClick={() => setCurrentPage(1)}
            className="text-sm text-gray-500 hover:text-gray-800 transition-colors"
          >
            ← Start Over
          </button>
          <span className="text-xs text-gray-400">StylePacker AI</span>
        </div>
      </div>
    </div>
  );
}

/* ─── Outfit Section ─── */
function OutfitSection({ outfit, timeOfDay }: { outfit: DayOutfit; timeOfDay: 'daytime' | 'evening' }) {
  const isDaytime = timeOfDay === 'daytime';

  return (
    <div className={`rounded-2xl border ${isDaytime ? 'border-gray-100 bg-white' : 'border-gray-200 bg-gray-50'} p-6 sm:p-8`}>
      <div className="mb-6">
        <span className="text-xs uppercase tracking-wider text-gray-400">
          {isDaytime ? '☀️ Daytime Look' : '🌙 Evening Look'}
        </span>
        <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">{outfit.lookName}</h3>
        {outfit.styleNote && <p className="text-gray-500 italic mt-2 text-sm">{outfit.styleNote}</p>}
      </div>

      {/* Color Palette */}
      {outfit.colorPalette && outfit.colorPalette.length > 0 && (
        <div className="flex gap-2 mb-6">
          {outfit.colorPalette.map((color, i) => (
            <div
              key={i}
              className="w-8 h-8 rounded-full border border-gray-200 shadow-sm"
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>
      )}

      {/* Pieces */}
      <div className="space-y-2">
        {outfit.pieces?.map((piece, i) => (
          <PieceCard key={piece.id || i} piece={piece} />
        ))}
      </div>
    </div>
  );
}

/* ─── Piece Card ─── */
function PieceCard({ piece }: { piece: OutfitPiece }) {
  const handleShop = () => {
    if (piece.shopUrl) window.open(piece.shopUrl, '_blank');
  };

  return (
    <div className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors group">
      {/* Color Swatch */}
      <div
        className="w-10 h-10 rounded-full border border-gray-200 flex-shrink-0 shadow-sm"
        style={{ backgroundColor: piece.colorHex || '#ccc' }}
      />

      {/* Details */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900 text-sm">{piece.name}</p>
        <p className="text-xs text-gray-400">{piece.brand} · <span className="text-gray-600 font-medium">{piece.price}</span></p>
      </div>

      {/* Shop Button */}
      <button
        onClick={handleShop}
        className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 text-gray-600 hover:border-[#534AB7] hover:text-[#534AB7] hover:bg-[#F3F1FF] transition-all opacity-0 group-hover:opacity-100 flex-shrink-0"
      >
        Shop →
      </button>
    </div>
  );
}
