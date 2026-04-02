export type BudgetTier = '$' | '$$' | '$$$';

export type StyleMethod = 'inspo' | 'closet' | 'both' | 'describe';

export type StyleTag =
  | 'Minimalist' | 'Bohemian' | 'Dark academia' | 'Coastal'
  | 'Streetwear' | 'Old money' | 'Y2K' | 'Cottagecore'
  | 'Parisian chic' | 'Scandi' | 'Artsy' | 'Romantic'
  | 'Edgy' | 'Preppy' | 'Athleisure';

export const ALL_STYLE_TAGS: StyleTag[] = [
  'Minimalist', 'Bohemian', 'Dark academia', 'Coastal',
  'Streetwear', 'Old money', 'Y2K', 'Cottagecore',
  'Parisian chic', 'Scandi', 'Artsy', 'Romantic',
  'Edgy', 'Preppy', 'Athleisure',
];

export type Activity =
  | 'Beach day' | 'Fancy dinner' | 'Club/nightlife' | 'Hiking'
  | 'Museum visits' | 'Shopping' | 'Brunch' | 'Concert'
  | 'Business meeting' | 'Wedding';

export const ALL_ACTIVITIES: Activity[] = [
  'Beach day', 'Fancy dinner', 'Club/nightlife', 'Hiking',
  'Museum visits', 'Shopping', 'Brunch', 'Concert',
  'Business meeting', 'Wedding',
];

export interface OutfitPiece {
  id: string;
  name: string;
  brand: string;
  price: string;
  priceNum?: number;
  color: string;
  colorHex: string;
  category: string;
  material?: string;
  shopUrl: string;
  imageUrl?: string;
  isReused?: boolean;
  reusedDays?: number[];
}

export interface DayOutfit {
  lookName: string;
  pieces: OutfitPiece[];
  colorPalette: string[];
  styleNote: string;
  totalPrice?: number;
}

export interface DayWeather {
  temp: number;
  tempHigh: number;
  tempLow: number;
  conditions: string;
  rainChance: number;
  recommendation: string;
}

export interface DayPlan {
  dayNumber: number;
  date: string;
  title: string;
  activitySummary: string;
  daytimeOutfit: DayOutfit;
  eveningOutfit?: DayOutfit;
  weather?: DayWeather;
  dayTotal?: number;
}

export interface WeatherData {
  temp: number;
  tempMin: number;
  tempMax: number;
  description: string;
  icon: string;
  humidity: number;
  rainChance?: number;
}

export interface CapsuleAnalysis {
  totalUniquePieces: number;
  totalOutfits: number;
  reusedPieces: { pieceId: string; pieceName: string; usedInDays: number[] }[];
  packingEfficiency: string;
  fitsInCarryOn: boolean;
}

export interface TripResults {
  destination: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  weather: WeatherData;
  capsuleSummary: string;
  days: DayPlan[];
  localStyleGuide: string;
  blendInTips: string;
  mixMatchTips: string[];
  dontForgetItems: string[];
  tripTotal?: number;
  capsuleAnalysis?: CapsuleAnalysis;
  streetStyleSearchUrl?: string;
}

export interface AppState {
  // Page 1: Onboarding
  name: string;
  age: string;
  budget: BudgetTier;
  premium: boolean;

  // Page 2: Style Method
  styleMethod: StyleMethod | null;

  // Page 3: Style Input
  inspoPics: string[];
  closetPics: string[];
  styleTags: StyleTag[];
  styleDescription: string;

  // Page 4: Trip Details
  destination: string;
  startDate: string;
  endDate: string;
  itinerary: string;
  activities: Activity[];

  // Results
  results: TripResults | null;
  isGenerating: boolean;
  loadingMessage: string;

  // Packing
  packedItems: Set<string>;

  // Current page
  currentPage: number;
}

export const BUDGET_INFO: Record<BudgetTier, { label: string; range: string; brands: string }> = {
  '$': {
    label: 'Budget',
    range: 'Under $50/piece',
    brands: 'Zara, H&M, ASOS, Mango, Uniqlo, COS',
  },
  '$$': {
    label: 'Mid-range',
    range: '$50-150/piece',
    brands: 'Reformation, Sezane, Reiss, Ganni, Anine Bing',
  },
  '$$$': {
    label: 'Splurge',
    range: '$150+/piece',
    brands: 'The Row, Toteme, Khaite, Jacquemus, Max Mara',
  },
};
