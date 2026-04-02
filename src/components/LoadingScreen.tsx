'use client';

import { useApp } from '@/context/AppContext';
import { useEffect, useState, useCallback } from 'react';

export default function LoadingScreen() {
  const {
    name,
    budget,
    premium,
    styleMethod,
    inspoPics,
    closetPics,
    styleTags,
    styleDescription,
    destination,
    startDate,
    endDate,
    itinerary,
    activities,
    setResults,
    setCurrentPage,
  } = useApp();

  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [fadeKey, setFadeKey] = useState(0);

  const statusMessages = [
    'Analyzing your style preferences...',
    `Checking ${destination} weather...`,
    'Researching local fashion trends...',
    'Finding shoppable pieces in your budget...',
    'Styling your perfect outfits...',
    'Creating your capsule wardrobe...',
  ];

  // Progress bar animation
  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return prev;
        return prev + Math.random() * 15;
      });
    }, 400);

    return () => clearInterval(progressInterval);
  }, []);

  // Message rotation
  useEffect(() => {
    const messageInterval = setInterval(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % statusMessages.length);
      setFadeKey((prev) => prev + 1);
    }, 2500);

    return () => clearInterval(messageInterval);
  }, [statusMessages.length]);

  // API calls
  useEffect(() => {
    const abortController = new AbortController();

    const fetchData = async () => {
      try {
        const weatherResponse = await fetch('/api/weather', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ destination, startDate, endDate }),
          signal: abortController.signal,
        });

        if (!weatherResponse.ok) {
          throw new Error('Failed to fetch weather data');
        }

        const weatherData = await weatherResponse.json();

        const generateResponse = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name,
            budget,
            premium,
            styleMethod,
            inspoPics: inspoPics?.slice(0, 3),
            closetPics: closetPics?.slice(0, 3),
            styleTags,
            styleDescription,
            destination,
            startDate,
            endDate,
            itinerary,
            activities,
            weather: weatherData,
          }),
          signal: abortController.signal,
        });

        if (!generateResponse.ok) {
          throw new Error('Failed to generate outfits');
        }

        const outfitData = await generateResponse.json();
        setProgress(100);

        setTimeout(() => {
          setResults(outfitData);
          setCurrentPage(6);
        }, 500);
      } catch (err) {
        if (err instanceof Error && err.name !== 'AbortError') {
          setError(err.message || 'An error occurred while generating your outfits');
        }
      }
    };

    fetchData();

    return () => {
      abortController.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTryAgain = useCallback(() => {
    setError(null);
    setCurrentPage(4);
  }, [setCurrentPage]);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-center">
          <div className="mb-6">
            <svg className="w-16 h-16 mx-auto text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Oops! Something went wrong</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={handleTryAgain}
            className="px-8 py-3 bg-[#534AB7] text-white rounded-lg font-medium hover:bg-[#3f36a5] transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div className="text-center max-w-md w-full px-6">
        {/* Spinning Circle */}
        <div className="mb-12 flex justify-center">
          <div className="animate-spin-slow">
            <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
              <circle
                cx="40"
                cy="40"
                r="35"
                stroke="#E5E7EB"
                strokeWidth="3"
                fill="none"
              />
              <path
                d="M40 5 A35 35 0 0 1 75 40"
                stroke="#534AB7"
                strokeWidth="3"
                strokeLinecap="round"
                fill="none"
              />
            </svg>
          </div>
        </div>

        {/* Status Message */}
        <div className="mb-8 h-12 flex items-center justify-center">
          <p key={fadeKey} className="text-lg text-gray-700 font-medium animate-fade-in">
            {statusMessages[currentMessageIndex]}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className="bg-[#534AB7] h-full rounded-full transition-all duration-300 ease-out"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
          <p className="text-xs text-gray-400 mt-2">{Math.round(Math.min(progress, 100))}%</p>
        </div>

        {/* Trip Summary */}
        <p className="text-sm text-gray-500">
          {name ? `${name}'s trip to ` : 'Trip to '}{destination}
        </p>
      </div>
    </div>
  );
}
