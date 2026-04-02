'use client';

import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { DayPlan, DayOutfit, OutfitPiece } from '@/types';

// ─── Category Classifier ───
// Maps ANY category string (from API or mock) into a display group
function classifyPiece(piece: OutfitPiece): 'tops' | 'bottoms' | 'dresses' | 'outerwear' | 'shoes' | 'bags' | 'accessories' {
  const cat = (piece.category || '').toLowerCase();
  const name = (piece.name || '').toLowerCase();

  // Check category field first, then fall back to item name
  // TOPS
  if (
    cat === 'tops' || cat === 'top' ||
    cat.includes('blouse') || cat.includes('shirt') || cat.includes('tee') ||
    cat.includes('tank') || cat.includes('cami') || cat.includes('polo') ||
    cat.includes('henley') || cat.includes('bodysuit') ||
    name.includes('blouse') || name.includes('shirt') || name.includes('tank') ||
    name.includes('tee') || name.includes('cami') || name.includes('polo') ||
    name.includes('henley') || name.includes('bodysuit') || name.includes('crop top')
  ) return 'tops';

  // BOTTOMS
  if (
    cat === 'bottoms' || cat === 'bottom' ||
    cat.includes('pant') || cat.includes('jean') || cat.includes('trouser') ||
    cat.includes('skirt') || cat.includes('short') || cat.includes('legging') ||
    cat.includes('chino') || cat.includes('cargo') ||
    name.includes('pants') || name.includes('jeans') || name.includes('trousers') ||
    name.includes('skirt') || name.includes('shorts') || name.includes('leggings') ||
    name.includes('chinos') || name.includes('cargo')
  ) return 'bottoms';

  // DRESSES / JUMPSUITS
  if (
    cat === 'dresses' || cat === 'dress' ||
    cat.includes('jumpsuit') || cat.includes('romper') || cat.includes('playsuit') ||
    name.includes('dress') || name.includes('jumpsuit') || name.includes('romper') ||
    name.includes('gown') || name.includes('maxi') || name.includes('midi dress')
  ) return 'dresses';

  // SHOES
  if (
    cat === 'shoes' || cat === 'shoe' || cat === 'footwear' ||
    cat.includes('shoe') || cat.includes('boot') || cat.includes('sneaker') ||
    cat.includes('sandal') || cat.includes('loafer') || cat.includes('pump') ||
    cat.includes('heel') || cat.includes('flat') || cat.includes('mule') ||
    cat.includes('espadrille') || cat.includes('flip') || cat.includes('slipper') ||
    name.includes('shoe') || name.includes('boot') || name.includes('sneaker') ||
    name.includes('sandal') || name.includes('loafer') || name.includes('pump') ||
    name.includes('heel') || name.includes('flat') || name.includes('mule') ||
    name.includes('espadrille') || name.includes('flip flop')
  ) return 'shoes';

  // OUTERWEAR / LAYERS
  if (
    cat === 'outerwear' || cat === 'layers' || cat === 'layer' ||
    cat.includes('jacket') || cat.includes('coat') || cat.includes('blazer') ||
    cat.includes('cardigan') || cat.includes('sweater') || cat.includes('hoodie') ||
    cat.includes('vest') || cat.includes('poncho') || cat.includes('cape') ||
    cat.includes('parka') || cat.includes('trench') || cat.includes('windbreaker') ||
    cat.includes('pullover') || cat.includes('outerwear') || cat.includes('layer') ||
    name.includes('jacket') || name.includes('coat') || name.includes('blazer') ||
    name.includes('cardigan') || name.includes('sweater') || name.includes('hoodie') ||
    name.includes('vest') || name.includes('poncho') || name.includes('trench') ||
    name.includes('parka') || name.includes('pullover') || name.includes('windbreaker')
  ) return 'outerwear';

  // BAGS
  if (
    cat === 'bags' || cat === 'bag' ||
    cat.includes('bag') || cat.includes('purse') || cat.includes('clutch') ||
    cat.includes('tote') || cat.includes('backpack') || cat.includes('crossbody') ||
    cat.includes('satchel') || cat.includes('handbag') ||
    name.includes('bag') || name.includes('purse') || name.includes('clutch') ||
    name.includes('tote') || name.includes('backpack') || name.includes('crossbody') ||
    name.includes('satchel') || name.includes('handbag')
  ) return 'bags';

  // ACCESSORIES (catch-all for jewelry, scarves, hats, belts, sunglasses, watches, etc.)
  return 'accessories';
}

// Display config for each group
const CATEGORY_CONFIG: Record<string, { label: string; emoji: string; order: number; cardSize: 'small' | 'medium' | 'large' }> = {
  tops:        { label: 'Tops',              emoji: '👕', order: 1, cardSize: 'large' },
  bottoms:     { label: 'Bottoms',           emoji: '👖', order: 2, cardSize: 'large' },
  dresses:     { label: 'Dresses & Jumpsuits', emoji: '👗', order: 3, cardSize: 'large' },
  outerwear:   { label: 'Outerwear & Layers', emoji: '🧥', order: 4, cardSize: 'medium' },
  shoes:       { label: 'Shoes',             emoji: '👟', order: 5, cardSize: 'medium' },
  bags:        { label: 'Bags',              emoji: '👜', order: 6, cardSize: 'medium' },
  accessories: { label: 'Accessories',       emoji: '✨', order: 7, cardSize: 'small' },
};

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
          <div className="mb-8">
            <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-3">{destination}</h1>
            <p className="text-gray-500 text-lg">{formatDate(startDate)} – {formatDate(endDate)} · {totalDays} days</p>
          </div>

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

          <div className="flex flex-wrap gap-2 sm:gap-3">
            <button onClick={() => setCurrentPage(7)} className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 font-medium hover:border-[#534AB7] hover:text-[#534AB7] transition-colors">
              📅 Calendar
            </button>
            <button onClick={() => setCurrentPage(8)} className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 font-medium hover:border-[#534AB7] hover:text-[#534AB7] transition-colors">
              ✓ Packing List
            </button>
            <button onClick={() => setCurrentPage(9)} className="px-4 py-2 border border-[#534AB7] rounded-lg text-sm text-[#534AB7] font-medium hover:bg-[#534AB7] hover:text-white transition-colors flex items-center gap-1.5">
              👀 Local Style
              {premium && <span className="bg-[#534AB7] text-white text-xs px-2 py-0.5 rounded-full">PRO</span>}
            </button>
            <button onClick={handleExportPDF} className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 font-medium hover:border-[#534AB7] hover:text-[#534AB7] transition-colors">
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
            <div className="mb-8">
              <h2 className="text-4xl font-bold text-gray-900 mb-2">{selectedDay.title}</h2>
              <p className="text-lg text-gray-600">{selectedDay.activitySummary}</p>
            </div>

            <WeatherBanner
              description={weather?.description || 'Clear'}
              tempHigh={weather?.temp || 72}
              tempLow={weather?.tempMin || 60}
              rainChance={weather?.rainChance || 0}
              emoji={getWeatherEmoji(weather?.description || '')}
              recommendation={getWeatherRecommendation(weather?.description || '')}
            />

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
          <button onClick={() => setCurrentPage(1)} className="text-sm text-gray-500 hover:text-gray-800 transition-colors font-medium">
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

/* ─── Outfit Section (REWRITTEN: dynamic grouping, no pieces lost) ─── */
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
  const pieces = outfit.pieces || [];

  // Group ALL pieces by classified category — nothing gets lost
  const grouped: Record<string, OutfitPiece[]> = {};
  pieces.forEach((piece) => {
    const group = classifyPiece(piece);
    if (!grouped[group]) grouped[group] = [];
    grouped[group].push(piece);
  });

  // Sort groups by display order
  const sortedGroups = Object.entries(grouped)
    .sort(([a], [b]) => (CATEGORY_CONFIG[a]?.order ?? 99) - (CATEGORY_CONFIG[b]?.order ?? 99));

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
        {pieces.length > 0 && (
          <div className="flex gap-2 mt-4 flex-wrap">
            {[...new Set(pieces.map((p) => p.colorHex).filter(Boolean))].map((color, i) => (
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

      {/* Pieces — dynamically grouped, EVERY piece renders */}
      <div className="px-6 sm:px-8 py-8">
        {sortedGroups.map(([groupKey, groupPieces]) => {
          const config = CATEGORY_CONFIG[groupKey] || { label: groupKey, emoji: '🏷️', order: 99, cardSize: 'medium' as const };
          const isSmall = config.cardSize === 'small';
          return (
            <div key={groupKey} className="mb-10 last:mb-0">
              <h4 className="text-sm uppercase tracking-widest font-bold text-gray-400 mb-4">
                {config.emoji} {config.label}
              </h4>
              <div className={`grid gap-5 ${
                isSmall
                  ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
                  : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
              }`}>
                {groupPieces.map((piece, i) => (
                  <PieceCard
                    key={piece.id || `${groupKey}-${i}`}
                    piece={piece}
                    isOwned={ownedPieces.has(piece.id)}
                    toggleOwned={toggleOwned}
                    size={config.cardSize}
                  />
                ))}
              </div>
            </div>
          );
        })}

        {/* Fallback: if no pieces at all, show a message */}
        {pieces.length === 0 && (
          <p className="text-gray-400 text-center py-8">No pieces generated for this look</p>
        )}
      </div>

      {/* Outfit Actions */}
      <div className={`px-6 sm:px-8 py-6 flex flex-wrap gap-3 border-t ${isDaytime ? 'border-gray-100 bg-white' : 'border-purple-100 bg-purple-50'}`}>
        <button onClick={onSwap} className="px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 font-medium hover:border-[#534AB7] hover:text-[#534AB7] transition-colors">
          🔄 Swap this look
        </button>
        <button onClick={onAdjust} className="px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 font-medium hover:border-[#534AB7] hover:text-[#534AB7] transition-colors">
          🎨 Adjust style
        </button>
        <button onClick={onShopAll} className="px-4 py-2.5 bg-[#534AB7] text-white text-sm rounded-lg font-medium hover:bg-[#3E369A] transition-colors ml-auto">
          🛒 Shop All ({pieces.length})
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
  const group = classifyPiece(piece);
  const config = CATEGORY_CONFIG[group];

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
              // Show fallback
              const fallback = target.nextElementSibling as HTMLElement | null;
              if (fallback) fallback.style.display = 'flex';
            }}
          />
        ) : null}

        {/* Fallback: Color Swatch + Emoji */}
        <div
          className="absolute inset-0 flex items-center justify-center text-2xl"
          style={{
            backgroundColor: piece.colorHex || '#f0f0f0',
            display: piece.imageUrl ? 'none' : 'flex',
          }}
        >
          <span>{config?.emoji || '👕'}</span>
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
