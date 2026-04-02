'use client';

import { useApp } from '@/context/AppContext';

export default function LocalStyleGuide() {
  const { results, premium, setCurrentPage } = useApp();

  if (!results) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <p className="text-gray-600">No results available</p>
      </div>
    );
  }

  const handleSearchStreetStyle = () => {
    // Use custom URL if provided, otherwise default to Google Images
    if (results.streetStyleSearchUrl) {
      window.open(results.streetStyleSearchUrl, '_blank');
    } else {
      const searchQuery = `${results.destination} street style fashion`;
      const googleImagesUrl = `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(
        searchQuery
      )}`;
      window.open(googleImagesUrl, '_blank');
    }
  };

  const parseTextWithParagraphs = (text: string) => {
    return text
      .split('\n')
      .filter((para) => para.trim())
      .map((para, idx) => (
        <p key={idx} className="text-gray-700 leading-relaxed mb-4">
          {para}
        </p>
      ));
  };

  if (!premium) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-4xl font-bold text-gray-900">
              👀 Local Style Guide
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

          {/* Locked State */}
          <div className="bg-white rounded-lg border border-gray-100 p-12 text-center">
            <div className="mb-6">
              <svg className="w-20 h-20 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm6-10V7a3 3 0 00-6 0v4h6z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Premium Feature
            </h2>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              The Local Style Guide is available for premium members. Upgrade your account to discover how locals dress in {results.destination}.
            </p>
            <button
              onClick={() => setCurrentPage(6)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#534AB7] to-[#7c5cdb] text-white rounded-lg font-medium hover:shadow-lg transition-all"
            >
              Explore Other Features
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <h1 className="text-4xl font-bold text-gray-900">
              👀 Local Style Guide
            </h1>
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-gradient-to-r from-[#534AB7] to-[#7c5cdb] text-white text-xs font-semibold">
              Premium
            </span>
          </div>
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

        {/* What Locals Actually Wear */}
        <div className="bg-white rounded-lg border border-gray-100 p-8 mb-8 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <span className="text-3xl">👗</span>
            What Locals Actually Wear
          </h2>
          <div className="space-y-4">
            {parseTextWithParagraphs(results.localStyleGuide)}
          </div>
        </div>

        {/* How to Blend In */}
        <div className="bg-white rounded-lg border border-gray-100 p-8 mb-8 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <span className="text-3xl">🕶️</span>
            How to Blend In
          </h2>
          <div className="space-y-4">
            {parseTextWithParagraphs(results.blendInTips)}
          </div>
        </div>

        {/* Capsule Reuse Tips */}
        {results.capsuleAnalysis && (
          <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg border border-purple-200 p-8 mb-8 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <span className="text-3xl">♻️</span>
              Wardrobe Mix & Match Tips
            </h2>
            <div className="space-y-3">
              <p className="text-gray-700 font-medium">{results.capsuleAnalysis.packingEfficiency}</p>
              {results.capsuleAnalysis.fitsInCarryOn && (
                <p className="text-green-700 font-semibold">🧳 Fits in a carry-on!</p>
              )}
              {results.capsuleAnalysis.reusedPieces?.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Versatile Pieces</p>
                  {results.capsuleAnalysis.reusedPieces.map((rp, i) => (
                    <p key={i} className="text-gray-600 text-sm py-1">
                      <span className="font-medium text-gray-900">{rp.pieceName}</span> — appears in Day {rp.usedInDays.join(', ')}
                    </p>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Street Style Mood Board */}
        <div className="bg-white rounded-lg border border-gray-100 p-8 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <span className="text-3xl">📸</span>
              Street Style Mood Board
            </h2>
          </div>

          <p className="text-gray-600 mb-8">
            Get inspired by real street style from {results.destination}
          </p>

          {/* Clean Placeholder Section */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border-2 border-dashed border-gray-300 p-12 text-center mb-6">
            <div className="mb-6">
              <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Discover {results.destination} Street Style
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              See how locals dress and find inspiration for your trip. Browse real street style photos from {results.destination}.
            </p>
            <button
              onClick={handleSearchStreetStyle}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#534AB7] to-[#7c5cdb] text-white rounded-lg font-semibold hover:shadow-lg transition-all duration-300"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
              Search {results.destination} Street Style on Google Images
            </button>
          </div>
        </div>

        {/* Tip Box */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <p className="text-blue-900 text-sm">
            💡 <strong>Tip:</strong> Take screenshots of styles you love and compare them to your
            generated outfits. Local fashion insights will help you blend in and feel confident!
          </p>
        </div>
      </div>
    </div>
  );
}
