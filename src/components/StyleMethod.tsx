'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import type { StyleMethod as StyleMethodType } from '@/types';

interface MethodCard {
  id: StyleMethodType;
  emoji: string;
  title: string;
  description: string;
  isRecommended?: boolean;
}

const STYLE_METHODS: MethodCard[] = [
  {
    id: 'inspo',
    emoji: '📷',
    title: 'Upload inspo pics',
    description: 'Pinterest, TikTok, IG screenshots of your dream aesthetic',
  },
  {
    id: 'closet',
    emoji: '👕',
    title: 'Upload my closet',
    description: 'Flat-lay photos of your actual clothes',
  },
  {
    id: 'both',
    emoji: '✨',
    title: 'Both inspo + closet',
    description: 'Best results — matches aspirations with reality',
    isRecommended: true,
  },
  {
    id: 'describe',
    emoji: '✏️',
    title: 'Just describe it',
    description: 'Text-based style input for the verbally gifted',
  },
];

export default function StyleMethod() {
  const { styleMethod, setStyleMethod, goNext, goBack } = useApp();

  const handleCardClick = (method: StyleMethodType) => {
    setStyleMethod(method);
    // Auto-advance after selection
    setTimeout(() => goNext(), 300);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col px-4 py-8">
      {/* Header with Back Button */}
      <div className="flex items-center justify-between mb-12 max-w-4xl mx-auto w-full">
        <button
          onClick={goBack}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium transition-colors"
        >
          <span className="text-xl">←</span>
          <span>Back</span>
        </button>
        <h1 className="text-3xl font-bold text-gray-900 flex-1 text-center mr-16">
          How should we learn your style?
        </h1>
      </div>

      {/* Cards Grid */}
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-6">
          {STYLE_METHODS.map((method) => (
            <button
              key={method.id}
              onClick={() => handleCardClick(method.id)}
              className={`relative p-8 rounded-xl border-2 transition-all duration-300 text-left hover:shadow-lg active:scale-95 group ${
                styleMethod === method.id
                  ? 'border-[#534AB7] bg-purple-50 shadow-md'
                  : 'border-gray-200 bg-white hover:border-[#534AB7] hover:bg-purple-50'
              }`}
            >
              {/* Recommended Badge */}
              {method.isRecommended && (
                <div className="absolute -top-3 right-6 bg-[#534AB7] text-white px-3 py-1 rounded-full text-xs font-semibold">
                  Recommended
                </div>
              )}

              {/* Emoji Icon */}
              <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">
                {method.emoji}
              </div>

              {/* Title */}
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {method.title}
              </h3>

              {/* Description */}
              <p className="text-gray-600 text-sm leading-relaxed">
                {method.description}
              </p>

              {/* Selection Indicator */}
              {styleMethod === method.id && (
                <div className="absolute bottom-4 right-4 inline-flex items-center justify-center w-6 h-6 bg-[#534AB7] rounded-full">
                  <span className="text-white text-sm">✓</span>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Footer spacing */}
      <div className="h-8" />
    </div>
  );
}
