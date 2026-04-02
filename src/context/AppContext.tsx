'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { AppState, BudgetTier, StyleMethod, StyleTag, Activity, TripResults } from '@/types';

interface AppContextType extends AppState {
  setName: (name: string) => void;
  setAge: (age: string) => void;
  setBudget: (budget: BudgetTier) => void;
  setPremium: (premium: boolean) => void;
  setStyleMethod: (method: StyleMethod) => void;
  addInspoPic: (pic: string) => void;
  removeInspoPic: (index: number) => void;
  addClosetPic: (pic: string) => void;
  removeClosetPic: (index: number) => void;
  toggleStyleTag: (tag: StyleTag) => void;
  setStyleDescription: (desc: string) => void;
  setDestination: (dest: string) => void;
  setStartDate: (date: string) => void;
  setEndDate: (date: string) => void;
  setItinerary: (itinerary: string) => void;
  toggleActivity: (activity: Activity) => void;
  setResults: (results: TripResults | null) => void;
  setIsGenerating: (generating: boolean) => void;
  setLoadingMessage: (message: string) => void;
  togglePackedItem: (itemId: string) => void;
  setCurrentPage: (page: number) => void;
  goNext: () => void;
  goBack: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [budget, setBudget] = useState<BudgetTier>('$$');
  const [premium, setPremium] = useState(true);
  const [styleMethod, setStyleMethod] = useState<StyleMethod | null>(null);
  const [inspoPics, setInspoPics] = useState<string[]>([]);
  const [closetPics, setClosetPics] = useState<string[]>([]);
  const [styleTags, setStyleTags] = useState<StyleTag[]>([]);
  const [styleDescription, setStyleDescription] = useState('');
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [itinerary, setItinerary] = useState('');
  const [activities, setActivities] = useState<Activity[]>([]);
  const [results, setResults] = useState<TripResults | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [packedItems, setPackedItems] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);

  const addInspoPic = useCallback((pic: string) => {
    setInspoPics(prev => [...prev, pic]);
  }, []);

  const removeInspoPic = useCallback((index: number) => {
    setInspoPics(prev => prev.filter((_, i) => i !== index));
  }, []);

  const addClosetPic = useCallback((pic: string) => {
    setClosetPics(prev => [...prev, pic]);
  }, []);

  const removeClosetPic = useCallback((index: number) => {
    setClosetPics(prev => prev.filter((_, i) => i !== index));
  }, []);

  const toggleStyleTag = useCallback((tag: StyleTag) => {
    setStyleTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  }, []);

  const toggleActivity = useCallback((activity: Activity) => {
    setActivities(prev =>
      prev.includes(activity) ? prev.filter(a => a !== activity) : [...prev, activity]
    );
  }, []);

  const togglePackedItem = useCallback((itemId: string) => {
    setPackedItems(prev => {
      const next = new Set(prev);
      if (next.has(itemId)) next.delete(itemId);
      else next.add(itemId);
      return next;
    });
  }, []);

  const goNext = useCallback(() => setCurrentPage(p => p + 1), []);
  const goBack = useCallback(() => setCurrentPage(p => Math.max(1, p - 1)), []);

  return (
    <AppContext.Provider
      value={{
        name, setName,
        age, setAge,
        budget, setBudget,
        premium, setPremium,
        styleMethod, setStyleMethod,
        inspoPics, addInspoPic, removeInspoPic,
        closetPics, addClosetPic, removeClosetPic,
        styleTags, toggleStyleTag,
        styleDescription, setStyleDescription,
        destination, setDestination,
        startDate, setStartDate,
        endDate, setEndDate,
        itinerary, setItinerary,
        activities, toggleActivity,
        results, setResults,
        isGenerating, setIsGenerating,
        loadingMessage, setLoadingMessage,
        packedItems, togglePackedItem,
        currentPage, setCurrentPage,
        goNext, goBack,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
