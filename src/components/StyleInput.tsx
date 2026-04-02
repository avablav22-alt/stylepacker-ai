'use client';

import { useRef, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { ALL_STYLE_TAGS, ALL_ACTIVITIES } from '@/types';
import { Upload, X } from 'lucide-react';

export default function StyleInput() {
  const {
    styleMethod,
    inspoPics,
    closetPics,
    styleTags,
    styleDescription,
    addInspoPic,
    removeInspoPic,
    addClosetPic,
    removeClosetPic,
    toggleStyleTag,
    setStyleDescription,
    goNext,
    goBack,
  } = useApp();

  const inspoFileInputRef = useRef<HTMLInputElement>(null);
  const closetFileInputRef = useRef<HTMLInputElement>(null);
  const [inspoDragOver, setInspoDragOver] = useState(false);
  const [closetDragOver, setClosetDragOver] = useState(false);

  const handleImageUpload = (
    files: FileList,
    onAdd: (pic: string) => void
  ) => {
    Array.from(files).forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const dataUrl = e.target?.result as string;
          onAdd(dataUrl);
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const handleInspoUpload = (files: FileList) => {
    handleImageUpload(files, addInspoPic);
  };

  const handleClosetUpload = (files: FileList) => {
    handleImageUpload(files, addClosetPic);
  };

  const hasStyleInput =
    styleTags.length > 0 ||
    styleDescription.trim().length > 0 ||
    inspoPics.length > 0 ||
    closetPics.length > 0;

  const showInspiration =
    styleMethod === 'inspo' || styleMethod === 'both';
  const showCloset = styleMethod === 'closet' || styleMethod === 'both';
  const showDescription =
    styleMethod === 'describe' || styleMethod === 'inspo' ||
    styleMethod === 'closet' || styleMethod === 'both';

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-purple-50 to-white p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
            Let's Define Your Style
          </h1>
          <p className="text-lg text-gray-600">
            Show us what you love, and we'll curate the perfect capsule wardrobe
          </p>
        </div>

        {/* Inspiration Photos Section */}
        {showInspiration && (
          <div className="mb-8 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Inspiration Photos
            </h2>
            <div
              className="drop-zone p-8 rounded-lg bg-white cursor-pointer mb-4 text-center"
              onDragOver={(e) => {
                e.preventDefault();
                setInspoDragOver(true);
              }}
              onDragLeave={() => setInspoDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setInspoDragOver(false);
                handleInspoUpload(e.dataTransfer.files);
              }}
              onClick={() => inspoFileInputRef.current?.click()}
            >
              <input
                ref={inspoFileInputRef}
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={(e) => e.target.files && handleInspoUpload(e.target.files)}
              />
              <Upload
                className="mx-auto mb-3"
                size={40}
                color={inspoDragOver ? '#534AB7' : '#6B7280'}
              />
              <p className="text-gray-700 font-medium">
                Drag & drop or click to upload
              </p>
              <p className="text-sm text-gray-500 mt-1">
                PNG, JPG, GIF up to 10MB
              </p>
            </div>

            {/* Inspiration Photo Thumbnails */}
            {inspoPics.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {inspoPics.map((pic, idx) => (
                  <div key={idx} className="relative group">
                    <img
                      src={pic}
                      alt={`Inspiration ${idx + 1}`}
                      className="w-full h-40 object-cover rounded-lg"
                    />
                    <button
                      onClick={() => removeInspoPic(idx)}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={18} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Closet Photos Section */}
        {showCloset && (
          <div className="mb-8 animate-fade-in" style={{ animationDelay: '0.15s' }}>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Your Closet
            </h2>
            <div
              className="drop-zone p-8 rounded-lg bg-white cursor-pointer mb-4 text-center"
              onDragOver={(e) => {
                e.preventDefault();
                setClosetDragOver(true);
              }}
              onDragLeave={() => setClosetDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setClosetDragOver(false);
                handleClosetUpload(e.dataTransfer.files);
              }}
              onClick={() => closetFileInputRef.current?.click()}
            >
              <input
                ref={closetFileInputRef}
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={(e) => e.target.files && handleClosetUpload(e.target.files)}
              />
              <Upload
                className="mx-auto mb-3"
                size={40}
                color={closetDragOver ? '#534AB7' : '#6B7280'}
              />
              <p className="text-gray-700 font-medium">
                Drag & drop or click to upload
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Show us your favorite pieces
              </p>
            </div>

            {/* Closet Photo Thumbnails */}
            {closetPics.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {closetPics.map((pic, idx) => (
                  <div key={idx} className="relative group">
                    <img
                      src={pic}
                      alt={`Closet item ${idx + 1}`}
                      className="w-full h-40 object-cover rounded-lg"
                    />
                    <button
                      onClick={() => removeClosetPic(idx)}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={18} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Style Tags Section */}
        <div className="mb-8 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Style Tags
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {ALL_STYLE_TAGS.map((tag) => (
              <button
                key={tag}
                onClick={() => toggleStyleTag(tag)}
                className={`px-4 py-3 rounded-full font-medium transition-all duration-200 ${
                  styleTags.includes(tag)
                    ? 'bg-purple-600 text-white shadow-lg hover:shadow-xl hover:bg-purple-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Style Description Section */}
        {showDescription && (
          <div className="mb-8 animate-fade-in" style={{ animationDelay: '0.25s' }}>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Describe Your Style
            </h2>
            <textarea
              value={styleDescription}
              onChange={(e) => setStyleDescription(e.target.value)}
              placeholder="Describe your style in your own words... e.g., 'Minimalist with a touch of bohemian, lots of neutral tones and natural fabrics'"
              className="w-full h-32 p-4 rounded-lg border-2 border-gray-300 focus:border-purple-600 focus:outline-none resize-none font-medium text-gray-700 placeholder-gray-400 transition-colors"
            />
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex gap-4 justify-between mt-12 animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <button
            onClick={goBack}
            className="px-8 py-3 rounded-lg border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
          >
            Back
          </button>
          <button
            onClick={goNext}
            disabled={!hasStyleInput}
            className={`px-12 py-3 rounded-lg font-semibold transition-all duration-200 ${
              hasStyleInput
                ? 'bg-purple-600 text-white hover:bg-purple-700 hover:shadow-lg cursor-pointer'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
