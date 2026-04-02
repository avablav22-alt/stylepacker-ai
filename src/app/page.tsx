'use client';

import { useApp } from '@/context/AppContext';
import Onboarding from '@/components/Onboarding';
import StyleMethod from '@/components/StyleMethod';
import StyleInput from '@/components/StyleInput';
import TripDetails from '@/components/TripDetails';
import LoadingScreen from '@/components/LoadingScreen';
import Results from '@/components/Results';
import CalendarView from '@/components/CalendarView';
import PackingChecklist from '@/components/PackingChecklist';
import LocalStyleGuide from '@/components/LocalStyleGuide';

export default function Home() {
  const { currentPage } = useApp();

  return (
    <main className="min-h-screen">
      {currentPage === 1 && <Onboarding />}
      {currentPage === 2 && <StyleMethod />}
      {currentPage === 3 && <StyleInput />}
      {currentPage === 4 && <TripDetails />}
      {currentPage === 5 && <LoadingScreen />}
      {currentPage === 6 && <Results />}
      {currentPage === 7 && <CalendarView />}
      {currentPage === 8 && <PackingChecklist />}
      {currentPage === 9 && <LocalStyleGuide />}
    </main>
  );
}
