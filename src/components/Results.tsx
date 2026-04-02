'use client';

import { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { DayPlan, DayOutfit, OutfitPiece } from '@/types';

export default function Results() {
  const { results, setCurrentPage, premium } = useApp();
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [ownedPieces, setOwnedPieces] = useState<Set<string>>(new Set());

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

  const { destination, startDate, endDate, totalDays, weather, days } = results;
  const selectedDay = days[selectedDayIndex];

  // Calculate price totals
  const getTotalPieces = (): number => {
    const pieceIds = new Set<string>();
    days.forEach((day) => {
      day.daytimeOutfit?.pieces?.forEach((p) => pieceIds.add(p.id));
      day.eveningOutfit?.pieces?.forEach((p) => pieceIds.add(p.id));
    });
    return pieceIds.size;
  };

  const parsePrice = (priceStr: string | number | undefined): number => {
    if (!priceStr) return 0;
    if (typeof priceStr === 'number') return priceStr;
    const num = parseFloat(String(priceStr).replace(/[^0-9.]/g, ''));
    return isNaN(num) ? 0 : num;
  };

  const getTotalPrice = (pieces: OutfitPiece[]): number => {
    return pieces
      .filter((p) => !ownedPieces.has(p.id))
      .reduce((sum, p) => sum + parsePrice(p.priceNum || p.price), 0);
  };

  const getOutfitTotal = (outfit: DayOutfit | undefined): number => {
    if (!outfit?.pieces) return 0;
    return getTotalPrice(outfit.pieces);
  };

  const getDayTotal = (day: DayPlan): number => {
    let total = 0;
    if (day.daytimeOutfit?.pieces) total += getTotalPrice(day.daytimeOutfit.pieces);
    if (day.eveningOutfit?.pieces) total += getTotalPrice(day.eveningOutfit.pieces);
    return total;
  };

  const getTripTotal = (): number => {
    return days.reduce((sum, day) => sum + getDayTotal(day), 0);
  };

  const getWeatherEmoji = (desc: string): string => {
    const d = (desc || '').toLowerCase();
    if (d.includes('rain')) return '🌧️';
    if (d.includes('cloud') || d.includes('overcast')) return '☁️';
    if (d.includes('sun') || d.includes('clear')) return '☀️';
    if (d.includes('snow')) return '❄️';
    return '🌤️';
  };

  const getWeatherRecommendation = (desc: string): string => {
    const d = (desc || '').toLowerCase();
    if (d.includes('rain')) return 'Bring a water-resistant layer';
    if (d.includes('cold') || d.includes('snow')) return 'Layer up for warmth';
    if (d.includes('hot') || d.includes('sun')) return 'Light fabrics recommended';
    return 'Light layers recommended';
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr + 'T00:00:00');
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const handleSwap = () => {
    alert('Regenerating outfit for Day ' + (selectedDayIndex + 1) + '...');
  };

  const handleAdjustStyle = () => {
    alert('Opening style adjustment panel for Day ' + (selectedDayIndex + 1) + '...');
  };

  const handleExportPDF = async () => {
    if (!results) return;
    try {
      const response = await fetch('/api/export-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(results),
      });
      const html = await response.text();
      const blob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const win = window.open(url, '_blank');
      if (win) {
        win.onload = () => setTimeout(() => win.print(), 500);
      }
    } catch {
      alert('Failed to export PDF');
    }
  };

  const handleShopAll = (pieces: OutfitPiece[]) => {
    const urls = pieces.filter((p) => p.shopUrl).map((p) => p.shopUrl);
    urls.slice(0, 5).forEach((url) => {
      if (url) window.open(url, '_blank');
    });
  };

  const toggleOwned = (pieceId: string) => {
    const newOwned = new Set(ownedPieces);
    if (newOwned.has(pieceId)) {
      newOwned.delete(pieceId);
    } else {
      newOwned.add(pieceId);
    }
    setOwnedPieces(newOwned);
  };

  const totalOutfits = days.reduce((sum, day) => {
    let count = 0;
    if (day.daytimeOutfit) count++;
    if (day.eveningOutfit) count++;
    return sum + count;
  }, 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 lg:py-12">
          {/* Destination Title */}
          <div className="mb-8">
            <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-3">{destination}</h1>
            <p className="text-gray-500 text-lg">{formatDate(startDate)} – {formatDate(endDate)} · {totalDays} days</p>
          </div>

          {/* Capsule Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 mb-8">
            <div>
              <p className="text-gray-400 text-xs uppercase tracking-widest mb-1">Duration</p>
              <p className="text-2xl font-bold text-gray-900">{totalDays}d</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs uppercase tracking-widest mb-1">Unique Pieces</p>
              <p className="text-2xl font-bold text-gray-900">{getTotalPieces()}</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs uppercase tracking-widest mb-1">Outfits</p>
              <p className="text-2xl font-bold text-gray-900">{totalOutfits}</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs uppercase tracking-widest mb-1">Total Cost</p>
              <p className="text-2xl font-bold text-[#534AB7]">${getTripTotal().toFixed(2)}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2 sm:gap-3">
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
              {premium && <span className="bg-[#534AB7] text-white text-xs px-2 py-0.5 rounded-full">PRO</span>}
            </button>
            <button
              onClick={handleExportPDF}
              className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 font-medium hover:border-[#534AB7] hover:text-[#534AB7] transition-colors"
            >
              📥 Export PDF
            </button>
          </div>
        </div>
      </div>

      {/* Day Tabs */}
      <div className="border-b border-gray-100 bg-white sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
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
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
          <div className="animate-fade-in">
            {/* Day Header */}
            <div className="mb-8">
              <h2 className="text-4xl font-bold text-gray-900 mb-2">{selectedDay.title}</h2>
              <p className="text-lg text-gray-600">{selectedDay.activitySummary}</p>
            </div>

            {/* Weather Banner */}
            <WeatherBanner
              description={weather?.description || 'Clear'}
              tempHigh={weather?.temp || 72}
              tempLow={weather?.tempMin || 60}
              rainChance={weather?.rainChance || 0}
              emoji={getWeatherEmoji(weather?.description || '')}
              recommendation={getWeatherRecommendation(weather?.description || '')}
            />

            {/* Daytime Outfit */}
            {selectedDay.daytimeOutfit && (
              <OutfitSection
                outfit={selectedDay.daytimeOutfit}
                timeOfDay="daytime"
                outfitTotal={getOutfitTotal(selectedDay.daytimeOutfit)}
                ownedPieces={ownedPieces}
                toggleOwned={toggleOwned}
                onSwap={handleSwap}
                onAdjust={handleAdjustStyle}
                onShopAll={() => handleShopAll(selectedDay.daytimeOutfit?.pieces || [])}
              />
            )}

            {/* Evening Outfit */}
            {selectedDay.eveningOutfit && (
              <OutfitSection
                outfit={selectedDay.eveningOutfit}
                timeOfDay="evening"
                outfitTotal={getOutfitTotal(selectedDay.eveningOutfit)}
                ownedPieces={ownedPieces}
                toggleOwned={toggleOwned}
                onSwap={handleSwap}
                onAdjust={handleAdjustStyle}
                onShopAll={() => handleShopAll(selectedDay.eveningOutfit?.pieces || [])}
              />
            )}

            {/* Day Total */}
            <div className="mt-8 p-6 bg-gradient-to-r from-[#534AB7]/5 to-[#534AB7]/10 rounded-xl border border-[#534AB7]/20">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-700">Day Total</span>
                <span className="text-3xl font-bold text-[#534AB7]">${getDayTotal(selectedDay).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="border-t border-gray-100 mt-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex justify-between items-center">
          <button
            onClick={() => setCurrentPage(1)}
            className="text-sm text-gray-500 hover:text-gray-800 transition-colors font-medium"
          >
            ← Start Over
          </button>
          <span className="text-xs text-gray-400">StylePacker AI</span>
        </div>
      </div>
    </div>
  );
}

/* ─── Weather Banner ─── */
function WeatherBanner({
  description,
  tempHigh,
  tempLow,
  rainChance,
  emoji,
  recommendation,
}: {
  description: string;
  tempHigh: number;
  tempLow: number;
  rainChance: number;
  emoji: string;
  recommendation: string;
}) {
  return (
    <div className="mb-10 p-6 bg-gradient-to-r from-blue-50 to-blue-100/50 rounded-xl border border-blue-200">
      <div className="flex items-start gap-4 flex-wrap sm:flex-nowrap">
        <div className="text-5xl">{emoji}</div>
        <div className="flex-1">
          <p className="text-2xl font-bold text-gray-900 mb-1">
            {tempHigh}°F {tempLow && <span className="text-lg font-normal text-gray-600">· Low {tempLow}°F</span>}
          </p>
          <p className="text-gray-700 mb-2">{description}</p>
          <div className="flex gap-4 text-sm text-gray-600 mb-3">
            {rainChance > 0 && <span>💧 {rainChance}% chance of rain</span>}
          </div>
          <p className="text-sm font-medium text-blue-900 italic">{recommendation}</p>
        </div>
      </div>
    </div>
  );
}

/* ─── Outfit Section ─── */
function OutfitSection({
  outfit,
  timeOfDay,
  outfitTotal,
  ownedPieces,
  toggleOwned,
  onSwap,
  onAdjust,
  onShopAll,
}: {
  outfit: DayOutfit;
  timeOfDay: 'daytime' | 'evening';
  outfitTotal: number;
  ownedPieces: Set<string>;
  toggleOwned: (id: string) => void;
  onSwap: () => void;
  onAdjust: () => void;
  onShopAll: () => void;
}) {
  const isDaytime = timeOfDay === 'daytime';

  // Organize pieces by category — use includes() to match both singular and plural forms
  const mainPieces = outfit.pieces?.filter((p) => {
    const cat = (p.category || '').toLowerCase();
    return cat.includes('top') || cat.includes('bottom') || cat.includes('dress');
  }) || [];

  const shoesPieces = outfit.pieces?.filter((p) => {
    const cat = (p.category || '').toLowerCase();
    return cat.includes('shoe') || cat.includes('boot') || cat.includes('sneaker') || cat.includes('sandal') || cat.includes('loafer') || cat.includes('pump') || cat.includes('heel');
  }) || [];

  const outerwearPieces = outfit.pieces?.filter((p) => {
    const cat = (p.category || '').toLowerCase();
    return cat.includes('outerwear') || cat.includes('layer') || cat.includes('jacket') || cat.includes('coat') || cat.includes('cardigan') || cat.includes('sweater') || cat.includes('blazer');
  }) || [];

  const accessoryPieces = outfit.pieces?.filter((p) => {
    const cat = (p.category || '').toLowerCase();
    return cat.includes('bag') || cat.includes('accessor') || cat.includes('jewelry') || cat.includes('sunglasses') || cat.includes('scarf') || cat.includes('hat') || cat.includes('belt');
  }) || [];

  // Catch any pieces that didn't match the above categories
  const categorizedIds = new Set([...mainPieces, ...shoesPieces, ...outerwearPieces, ...accessoryPieces].map(p => p.id));
  const uncategorizedPieces = outfit.pieces?.filter((p) => !categorizedIds.has(p.id)) || [];

  return (
    <div className={`mb-10 rounded-2xl border ${isDaytime ? 'border-gray-100 bg-white' : 'border-purple-100 bg-gradient-to-br from-white to-purple-50'} overflow-hidden`}>
      {/* Section Header */}
      <div className={`px-6 sm:px-8 py-6 ${isDaytime ? 'bg-gray-50' : 'bg-gradient-to-r from-[#534AB7]/10 to-[#534AB7]/5'} border-b ${isDaytime ? 'border-gray-100' : 'border-purple-100'}`}>
        <div className="flex items-start justify-between mb-3">
          <div>
            <span className="text-xs uppercase tracking-widest text-gray-500 font-semibold">
              {isDaytime ? '☀️ Daytime Look' : '🌙 Evening Look'}
            </span>
            <h3 className="text-3xl font-bold text-gray-900 mt-2">{outfit.lookName}</h3>
            {outfit.styleNote && <p className="text-gray-600 italic mt-2 text-base">{outfit.styleNote}</p>}
          </div>
          <span className="text-sm font-semibold text-[#534AB7] whitespace-nowrap">This look: ${outfitTotal.toFixed(2)}</span>
        </div>

        {/* Color Palette */}
        {outfit.pieces && outfit.pieces.length > 0 && (
          <div className="flex gap-2 mt-4 flex-wrap">
            {[...new Set(outfit.pieces.map((p) => p.colorHex).filter(Boolean))].map((color, i) => (
              <div
                key={i}
                className="w-8 h-8 rounded-full border-2 border-white shadow-md"
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
        )}
      </div>

      {/* Pieces Grid */}
      <div className="px-6 sm:px-8 py-8">
        {/* Main Pieces (tops, bottoms, dresses + any uncategorized) */}
        {(mainPieces.length > 0 || uncategorizedPieces.length > 0) && (
          <div className="mb-10">
            <h4 className="text-sm uppercase tracking-widest font-bold text-gray-400 mb-4">Core Pieces</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[...mainPieces, ...uncategorizedPieces].map((piece, i) => (
                <PieceCard
                  key={piece.id || i}
                  piece={piece}
                  isOwned={ownedPieces.has(piece.id)}
                  toggleOwned={toggleOwned}
                  size="large"
                />
              ))}
            </div>
          </div>
        )}

        {/* Shoes & Outerwear */}
        {(shoesPieces.length > 0 || outerwearPieces.length > 0) && (
          <div className="mb-10">
            <h4 className="text-sm uppercase tracking-widest font-bold text-gray-400 mb-4">Shoes & Layers</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[...shoesPieces, ...outerwearPieces].map((piece, i) => (
                <PieceCard
                  key={piece.id || i}
                  piece={piece}
                  isOwned={ownedPieces.has(piece.id)}
                  toggleOwned={toggleOwned}
                  size="medium"
                />
              ))}
            </div>
          </div>
        )}

        {/* Accessories */}
        {accessoryPieces.length > 0 && (
          <div className="mb-8">
            <h4 className="text-sm uppercase tracking-widest font-bold text-gray-400 mb-4">Accessories</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {accessoryPieces.map((piece, i) => (
                <PieceCard
                  key={piece.id || i}
                  piece={piece}
                  isOwned={ownedPieces.has(piece.id)}
                  toggleOwned={toggleOwned}
                  size="small"
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Outfit Actions */}
      <div className={`px-6 sm:px-8 py-6 flex flex-wrap gap-3 border-t ${isDaytime ? 'border-gray-100 bg-white' : 'border-purple-100 bg-purple-50'}`}>
        <button
          onClick={onSwap}
          className="px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 font-medium hover:border-[#534AB7] hover:text-[#534AB7] transition-colors"
        >
          🔄 Swap this look
        </button>
        <button
          onClick={onAdjust}
          className="px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 font-medium hover:border-[#534AB7] hover:text-[#534AB7] transition-colors"
        >
          🎨 Adjust style
        </button>
        <button
          onClick={onShopAll}
          className="px-4 py-2.5 bg-[#534AB7] text-white text-sm rounded-lg font-medium hover:bg-[#3E369A] transition-colors ml-auto"
        >
          🛒 Shop All ({outfit.pieces?.length || 0})
        </button>
      </div>
    </div>
  );
}

/* ─── Piece Card ─── */
function PieceCard({
  piece,
  isOwned,
  toggleOwned,
  size = 'medium',
}: {
  piece: OutfitPiece;
  isOwned: boolean;
  toggleOwned: (id: string) => void;
  size?: 'small' | 'medium' | 'large';
}) {
  const parsePrice = (priceStr: string | number | undefined): number => {
    if (!priceStr) return 0;
    if (typeof priceStr === 'number') return priceStr;
    const num = parseFloat(String(priceStr).replace(/[^0-9.]/g, ''));
    return isNaN(num) ? 0 : num;
  };

  const price = parsePrice(piece.priceNum || piece.price);
  const displayPrice = isOwned ? 'Owned' : `$${price.toFixed(0)}`;

  const sizeClasses = {
    small: 'h-24',
    medium: 'h-32',
    large: 'h-40',
  };

  return (
    <div className={`group rounded-xl border border-gray-200 bg-white overflow-hidden hover:shadow-lg transition-all duration-300 ${isOwned ? 'opacity-75' : ''}`}>
      {/* Image Container */}
      <div className={`relative w-full ${sizeClasses[size]} bg-gradient-to-br from-gray-100 to-gray-50 overflow-hidden`}>
        {piece.imageUrl ? (
          <img
            src={piece.imageUrl}
            alt={piece.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              const target = e.currentTarget;
              target.style.display = 'none';
            }}
          />
        ) : null}

        {/* Fallback: Color Swatch + Category */}
        <div
          className="absolute inset-0 flex items-center justify-center text-2xl"
          style={{
            backgroundColor: piece.colorHex || '#f0f0f0',
            display: piece.imageUrl ? 'none' : 'flex',
          }}
        >
          <span>
            {(piece.category || '').toLowerCase().includes('shoe') || (piece.category || '').toLowerCase().includes('boot') || (piece.category || '').toLowerCase().includes('sandal')
              ? '👟'
              : (piece.category || '').toLowerCase().includes('bag')
                ? '👜'
                : (piece.category || '').toLowerCase().includes('jewelry')
                  ? '✨'
                  : (piece.category || '').toLowerCase().includes('accessor')
                    ? '🕶️'
                    : (piece.category || '').toLowerCase().includes('outerwear') || (piece.category || '').toLowerCase().includes('layer')
                      ? '🧥'
                      : '👕'}
          </span>
        </div>

        {/* Owned Checkbox */}
        <div className="absolute top-2 right-2">
          <input
            type="checkbox"
            checked={isOwned}
            onChange={() => toggleOwned(piece.id)}
            className="w-5 h-5 cursor-pointer rounded border-2 border-white bg-white accent-[#534AB7] shadow-md"
            title="Mark as owned"
          />
        </div>

        {/* Reuse Badge */}
        {piece.reusedDays && piece.reusedDays.length > 0 && (
          <div className="absolute bottom-2 left-2 bg-[#534AB7] text-white text-xs font-bold px-2 py-1 rounded-full">
            Also in Day {piece.reusedDays.join(', ')}
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-4 flex flex-col">
        <h4 className={`font-bold text-gray-900 mb-1 line-clamp-2 ${isOwned ? 'line-through text-gray-500' : ''}`}>
          {piece.name}
        </h4>

        {piece.brand && <p className="text-xs text-gray-500 mb-2">{piece.brand}</p>}

        {piece.material && <p className="text-xs text-gray-400 mb-2 italic">{piece.material}</p>}

        <div className="mt-auto">
          <p className={`text-lg font-bold mb-3 ${isOwned ? 'text-gray-400 line-through' : 'text-[#534AB7]'}`}>
            {displayPrice}
          </p>

          <button
            onClick={() => {
              if (piece.shopUrl) window.open(piece.shopUrl, '_blank');
            }}
            disabled={!piece.shopUrl}
            className={`w-full py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
              piece.shopUrl
                ? 'bg-[#534AB7] text-white hover:bg-[#3E369A]'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            Shop →
          </button>
        </div>
      </div>
    </div>
  );
}
