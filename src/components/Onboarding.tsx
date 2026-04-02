'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { BudgetTier, BUDGET_INFO } from '@/types';

export default function Onboarding() {
  const { name, setName, age, setAge, budget, setBudget, premium, setPremium, goNext } = useApp();
  const [errors, setErrors] = useState<string[]>([]);

  const handleNextClick = () => {
    const newErrors: string[] = [];
    if (!name.trim()) {
      newErrors.push('Please enter your name');
    }
    setErrors(newErrors);
    if (newErrors.length === 0) {
      goNext();
    }
  };

  const budgetTiers: BudgetTier[] = ['$', '$$', '$$$'];

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-2xl">
        {/* Logo/Title */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-gray-900 mb-3">
            StylePacker <span className="text-[#534AB7]">AI</span>
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            Your AI-powered vacation outfit curator
          </p>
          <p className="text-sm text-gray-500 max-w-lg mx-auto">
            Designed for overthinkers, last-minute packers, and anyone who's ever stood in front of their closet for 45 minutes
          </p>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm mb-8">
          {/* Name Input */}
          <div className="mb-6">
            <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
              What's your name?
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#534AB7] focus:border-transparent transition-all"
            />
          </div>

          {/* Age Input */}
          <div className="mb-8">
            <label htmlFor="age" className="block text-sm font-semibold text-gray-700 mb-2">
              How old are you? <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              id="age"
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="Enter your age"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#534AB7] focus:border-transparent transition-all"
            />
          </div>

          {/* Budget Selector */}
          <div className="mb-8">
            <label className="block text-sm font-semibold text-gray-700 mb-4">
              What's your budget?
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {budgetTiers.map((tier) => (
                <button
                  key={tier}
                  onClick={() => setBudget(tier)}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                    budget === tier
                      ? 'border-[#534AB7] bg-purple-50'
                      : 'border-gray-200 bg-white hover:border-[#534AB7] hover:bg-purple-50'
                  }`}
                >
                  <div className="text-lg font-semibold text-gray-900 mb-1">{tier}</div>
                  <div className="text-sm font-medium text-gray-600 mb-2">
                    {BUDGET_INFO[tier].label}
                  </div>
                  <div className="text-xs text-gray-500 mb-2">
                    {BUDGET_INFO[tier].range}
                  </div>
                  <div className="text-xs text-gray-600">
                    {BUDGET_INFO[tier].brands}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Premium Toggle */}
          <div className="mb-8 bg-gradient-to-r from-purple-50 to-transparent rounded-lg p-4 border border-purple-100">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-semibold text-gray-900">
                Premium Mode
              </label>
              <button
                onClick={() => setPremium(!premium)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  premium ? 'bg-[#534AB7]' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    premium ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            <div className="text-sm text-gray-700 space-y-1">
              <div className="flex items-start gap-2">
                <span className="text-[#534AB7] mt-0.5">✓</span>
                <span>AI outfit visualizations</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-[#534AB7] mt-0.5">✓</span>
                <span>Real product shopping links</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-[#534AB7] mt-0.5">✓</span>
                <span>Saved closet inventory</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-[#534AB7] mt-0.5">✓</span>
                <span>Local street style mood board</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-[#534AB7] mt-0.5">✓</span>
                <span>Outfit remix suggestions</span>
              </div>
            </div>
          </div>

          {/* Error Messages */}
          {errors.length > 0 && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg">
              {errors.map((error, idx) => (
                <p key={idx} className="text-sm text-red-700">
                  {error}
                </p>
              ))}
            </div>
          )}

          {/* Let's Pack Button */}
          <button
            onClick={handleNextClick}
            disabled={!name.trim()}
            className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-all duration-200 ${
              name.trim()
                ? 'bg-[#534AB7] hover:bg-[#3d3685] active:scale-95 cursor-pointer'
                : 'bg-gray-300 cursor-not-allowed'
            }`}
          >
            Let's Pack
          </button>
        </div>
      </div>
    </div>
  );
}
