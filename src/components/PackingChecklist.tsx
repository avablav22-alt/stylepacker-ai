'use client';

import { useApp } from '@/context/AppContext';
import { OutfitPiece } from '@/types';

export default function PackingChecklist() {
  const { results, packedItems, togglePackedItem, setCurrentPage } = useApp();

  if (!results) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <p className="text-gray-600">No results available</p>
      </div>
    );
  }

  // Extract all unique pieces from all days
  const allPieces = new Map<string, OutfitPiece>();
  results.days.forEach((day) => {
    day.daytimeOutfit.pieces.forEach((piece) => {
      if (!allPieces.has(piece.id)) {
        allPieces.set(piece.id, piece);
      }
    });
    if (day.eveningOutfit) {
      day.eveningOutfit.pieces.forEach((piece) => {
        if (!allPieces.has(piece.id)) {
          allPieces.set(piece.id, piece);
        }
      });
    }
  });

  // Group pieces by category
  const categories = [
    { key: 'tops', label: 'Tops & Layers', categoryNames: ['tops', 'layers'] },
    { key: 'bottoms', label: 'Bottoms & Dresses', categoryNames: ['bottoms', 'dresses'] },
    { key: 'shoes', label: 'Shoes', categoryNames: ['shoes'] },
    { key: 'accessories', label: 'Bags & Accessories', categoryNames: ['accessories'] },
  ];

  const groupedPieces = categories.map((cat) => ({
    ...cat,
    items: Array.from(allPieces.values()).filter((piece) =>
      cat.categoryNames.includes(piece.category)
    ),
  }));

  const totalItems = allPieces.size;
  const packedCount = packedItems.size;
  const packedPercentage = totalItems > 0 ? Math.round((packedCount / totalItems) * 100) : 0;

  const dontForgetItems = results.dontForgetItems || [];
  const mixMatchTips = results.mixMatchTips || [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-gray-900">
            ✓ Packing Checklist
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

        {/* Progress Section */}
        <div className="bg-white rounded-lg border border-gray-100 p-6 mb-8">
          <div className="flex items-baseline justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-900">
              Packing Progress
            </h2>
            <p className="text-sm font-bold text-[#534AB7]">
              {packedCount}/{totalItems} items packed
            </p>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-[#534AB7] to-[#7c5cdb] h-full rounded-full transition-all duration-500"
              style={{ width: `${packedPercentage}%` }}
            />
          </div>
          <p className="text-xs text-gray-600 mt-3">
            {packedPercentage}% complete — great job!
          </p>
        </div>

        {/* Checklist Sections */}
        <div className="space-y-6">
          {groupedPieces.map((category) =>
            category.items.length > 0 ? (
              <div key={category.key} className="bg-white rounded-lg border border-gray-100 overflow-hidden">
                {/* Category Header */}
                <div className="bg-gray-50 px-6 py-3 border-b border-gray-100">
                  <h3 className="font-semibold text-gray-900">
                    {category.label}
                  </h3>
                </div>

                {/* Items */}
                <div className="divide-y divide-gray-100">
                  {category.items.map((piece) => {
                    const isPacked = packedItems.has(piece.id);
                    return (
                      <div
                        key={piece.id}
                        className={`flex items-center gap-4 px-6 py-4 transition-all duration-200 ${
                          isPacked
                            ? 'bg-gray-50 opacity-60'
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        {/* Checkbox */}
                        <button
                          onClick={() => togglePackedItem(piece.id)}
                          className={`flex-shrink-0 w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${
                            isPacked
                              ? 'bg-[#534AB7] border-[#534AB7]'
                              : 'border-gray-300 hover:border-[#534AB7]'
                          }`}
                        >
                          {isPacked && (
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </button>

                        {/* Color Swatch */}
                        <div
                          className="flex-shrink-0 w-8 h-8 rounded-full border border-gray-200 shadow-sm"
                          style={{ backgroundColor: piece.colorHex }}
                          title={piece.color}
                        />

                        {/* Item Info */}
                        <div className="flex-grow min-w-0">
                          <p
                            className={`font-medium transition-all ${
                              isPacked
                                ? 'text-gray-600 line-through'
                                : 'text-gray-900'
                            }`}
                          >
                            {piece.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {piece.brand}
                          </p>
                        </div>

                        {/* Price Indicator */}
                        <div className="flex-shrink-0 text-right">
                          <p className="text-xs text-gray-600">{piece.price}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : null
          )}

          {/* Don't Forget Section */}
          {dontForgetItems.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg overflow-hidden">
              <div className="bg-amber-100 px-6 py-3 border-b border-amber-200">
                <h3 className="font-semibold text-amber-900">
                  🚨 Don't Forget
                </h3>
              </div>
              <div className="divide-y divide-amber-200">
                {dontForgetItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-4 px-6 py-3 hover:bg-amber-50 transition-colors"
                  >
                    <button
                      onClick={() => togglePackedItem(`dont-forget-${idx}`)}
                      className={`flex-shrink-0 w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${
                        packedItems.has(`dont-forget-${idx}`)
                          ? 'bg-amber-600 border-amber-600'
                          : 'border-amber-300 hover:border-amber-600'
                      }`}
                    >
                      {packedItems.has(`dont-forget-${idx}`) && (
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>
                    <span className="text-amber-900">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Mix & Match Tips */}
          {mixMatchTips.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-100 overflow-hidden">
              <div className="bg-gray-50 px-6 py-3 border-b border-gray-100">
                <h3 className="font-semibold text-gray-900">
                  🔄 Mix & Match Tips
                </h3>
              </div>
              <div className="divide-y divide-gray-100">
                {mixMatchTips.map((tip, idx) => (
                  <div key={idx} className="px-6 py-4 flex gap-3">
                    <span className="text-[#534AB7] font-bold flex-shrink-0">•</span>
                    <p className="text-gray-700">{tip}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer CTA */}
        <div className="mt-8 bg-gradient-to-r from-[#534AB7] to-[#7c5cdb] rounded-lg p-6 text-white text-center">
          <p className="text-lg font-semibold">
            {packedPercentage === 100
              ? '✨ You\'re all packed! Have a great trip!'
              : `${totalItems - packedCount} items left to pack`}
          </p>
        </div>
      </div>
    </div>
  );
}
