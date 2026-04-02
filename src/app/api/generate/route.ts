import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

interface ClothingPiece {
  id: string;
  name: string;
  brand: string;
  price: string;
  priceNum: number;
  color: string;
  colorHex: string;
  category: 'tops' | 'bottoms' | 'shoes' | 'bags' | 'jewelry' | 'accessories' | 'outerwear' | 'dresses' | 'layers';
  material: string;
  shopUrl: string;
  imageUrl: string;
  isReused: boolean;
  reusedDays: number[];
}

interface Outfit {
  lookName: string;
  pieces: ClothingPiece[];
  colorPalette: string[];
  styleNote: string;
  totalPrice: number;
}

interface DayWeather {
  temp: number;
  tempHigh: number;
  tempLow: number;
  conditions: string;
  rainChance: number;
  recommendation: string;
}

interface Day {
  dayNumber: number;
  date: string;
  title: string;
  activitySummary: string;
  venue?: string;
  dressCode?: string;
  daytimeOutfit: Outfit;
  eveningOutfit?: Outfit;
  weather: DayWeather;
  dayTotal: number;
}

interface ReusedPiece {
  pieceId: string;
  pieceName: string;
  usedInDays: number[];
}

interface CapsuleAnalysis {
  totalUniquePieces: number;
  totalOutfits: number;
  reusedPieces: ReusedPiece[];
  packingEfficiency: string;
  fitsInCarryOn: boolean;
}

interface CapsuleResponse {
  capsuleSummary: string;
  days: Day[];
  localStyleGuide: string;
  localStyleGuideDetails: string;
  blendInTips: string;
  streetStyleSearchUrl: string;
  mixMatchTips: string[];
  dontForgetItems: string[];
  capsuleAnalysis: CapsuleAnalysis;
  tripTotal: number;
}

interface WeatherData {
  temp: number;
  tempMin: number;
  tempMax: number;
  description: string;
  icon: string;
  humidity: number;
  rainChance?: number;
}

interface GenerateRequest {
  styleTags: string[];
  styleDescription: string;
  budgetTier: string;
  destination: string;
  startDate: string;
  endDate: string;
  itinerary: string;
  activities: string[];
  weather?: WeatherData;
  inspoPics?: string[];
  closetPics?: string[];
}

interface ImageContent {
  type: 'image';
  source: {
    type: 'base64';
    media_type: 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp';
    data: string;
  };
}

interface TextContent {
  type: 'text';
  text: string;
}

type ContentBlock = TextContent | ImageContent;

// Mock response for demo mode when API key is missing
const generateMockCapsule = (
  destination: string,
  startDate: string,
  endDate: string,
  budgetTier: string,
  styleTags: string[],
  weather?: WeatherData,
  itinerary?: string
): CapsuleResponse => {
  // Parse dates safely — append T00:00:00 to avoid timezone offset issues
  const sdParts = startDate.split('-').map(Number);
  const edParts = endDate.split('-').map(Number);
  const sdDate = new Date(sdParts[0], sdParts[1] - 1, sdParts[2]);
  const edDate = new Date(edParts[0], edParts[1] - 1, edParts[2]);
  const totalDays = Math.max(1, Math.round(
    (edDate.getTime() - sdDate.getTime()) / (1000 * 60 * 60 * 24)
  ) + 1);

  // Parse itinerary into day descriptions with venues
  const itineraryDays: {
    title: string;
    summary: string;
    hasEvening: boolean;
    venue?: string;
    dressCode?: string;
  }[] = [];

  if (itinerary) {
    // Try multiple parsing strategies:
    // 1. Split by "Day X:" / "Day X -" pattern
    // 2. Split by newlines if no day markers found
    // 3. Split by numbered lines (1. / 1) / 1:)

    let rawDayTexts: string[] = [];

    // Strategy 1: "Day 1:", "Day 1 -", "Day 1 –"
    const dayMarkerSplit = itinerary.split(/day\s*\d+\s*[:\-–]/i);
    const dayMarkerTexts = dayMarkerSplit.filter(d => d.trim());

    if (dayMarkerTexts.length > 0) {
      rawDayTexts = dayMarkerTexts;
    } else {
      // Strategy 2: Numbered lines "1.", "1)", "1:"
      const numberedSplit = itinerary.split(/(?:^|\n)\s*\d+\s*[.):\-]/);
      const numberedTexts = numberedSplit.filter(d => d.trim());

      if (numberedTexts.length > 1) {
        rawDayTexts = numberedTexts;
      } else {
        // Strategy 3: Split by newlines
        const lineSplit = itinerary.split(/\n+/).filter(l => l.trim());
        if (lineSplit.length > 0) {
          rawDayTexts = lineSplit;
        } else {
          // Single blob of text — treat as one day
          rawDayTexts = [itinerary.trim()];
        }
      }
    }

    rawDayTexts.forEach((dayText) => {
      const text = dayText.trim();
      if (!text) return;

      const hasEvening = /dinner|cocktail|night|evening|club|bar|rooftop|lounge/i.test(text);

      // Extract venue name if mentioned
      const venueMatch = text.match(/(?:at|visiting|going to)\s+([^,\.]+)/i);
      const venue = venueMatch?.[1]?.trim();

      // Determine dress code from activity keywords
      let dressCode = 'Smart Casual';
      if (/museum|gallery|cultural|historic/i.test(text)) dressCode = 'Polished Casual';
      if (/beach|pool|water/i.test(text)) dressCode = 'Resort Wear';
      if (/business|lunch|meeting/i.test(text)) dressCode = 'Business Casual';
      if (/nightclub|club|party|lounge/i.test(text)) dressCode = 'Dressy/Edgy';
      if (/hiking|adventure|outdoor|nature/i.test(text)) dressCode = 'Active Wear';

      // Use the actual user text as the title (clean up leading punctuation/whitespace)
      const cleanedTitle = text.replace(/^[\s,.\-–:]+/, '').trim();
      const firstActivity = cleanedTitle.split(/[,.]/).map(s => s.trim()).filter(Boolean)[0] || cleanedTitle;
      itineraryDays.push({
        title: firstActivity.length > 60 ? firstActivity.slice(0, 60) + '...' : firstActivity,
        summary: cleanedTitle.length > 200 ? cleanedTitle.slice(0, 200) + '...' : cleanedTitle,
        hasEvening,
        venue,
        dressCode,
      });
    });
  }

  // Brand pools by budget tier with extensive variety
  const brandPools = {
    '$': [
      'Zara', 'H&M', 'ASOS', 'Mango', 'Uniqlo', '& Other Stories', 'Topshop',
      'Urban Outfitters', 'Abercrombie', 'COS', 'Arket', 'Pull&Bear', 'Stradivarius'
    ],
    '$$': [
      'Reformation', 'Sézane', 'Reiss', 'AllSaints', 'Massimo Dutti', 'Ba&sh',
      'Rouje', 'Ganni', 'Staud', 'Cult Gaia', 'Anine Bing', 'Vince', 'Theory',
      'Club Monaco', 'J.Crew', 'Aritzia'
    ],
    '$$$': [
      'The Row', 'Totème', 'Khaite', 'Jacquemus', 'Isabel Marant', 'Zimmermann',
      'Ulla Johnson', 'Nanushka', 'By Far', 'Max Mara', 'Brunello Cucinelli',
      'Acne Studios', 'Bottega Veneta'
    ],
  };

  const brands = brandPools[budgetTier as keyof typeof brandPools] || brandPools['$$'];

  const priceMap: { [key: string]: { low: string; mid: string; high: string; lowNum: number; midNum: number; highNum: number } } = {
    '$': { low: '$24', lowNum: 24, mid: '$48', midNum: 48, high: '$72', highNum: 72 },
    '$$': { low: '$85', lowNum: 85, mid: '$145', midNum: 145, high: '$195', highNum: 195 },
    '$$$': { low: '$245', lowNum: 245, mid: '$425', midNum: 425, high: '$625', highNum: 625 },
  };

  const prices = priceMap[budgetTier] || priceMap['$$'];

  // Weather variation across days
  const getWeatherForDay = (dayIndex: number): DayWeather => {
    const baseTemp = weather?.temp ?? 72;
    const variation = Math.sin(dayIndex * 0.7) * 3;
    const rainChance = 20 + Math.random() * 40;

    return {
      temp: Math.round(baseTemp + variation),
      tempHigh: Math.round(baseTemp + variation + 5),
      tempLow: Math.round(baseTemp + variation - 3),
      conditions: rainChance > 50 ? 'Partly cloudy with showers' : 'Sunny and pleasant',
      rainChance: Math.round(rainChance),
      recommendation: rainChance > 50
        ? 'Waterproof layer and compact umbrella recommended'
        : 'Light layers for temperature changes'
    };
  };

  const generateRealisticOutfit = (
    dayNum: number,
    isEvening: boolean,
    activity: string,
    dressCode: string
  ) => {
    let pieces: ClothingPiece[] = [];
    let lookName = '';
    let styleNote = '';
    let colorPalette: string[] = [];

    // Create diverse outfit patterns
    if (activity.toLowerCase().includes('museum') || activity.toLowerCase().includes('gallery')) {
      if (isEvening) {
        lookName = 'Gallery Opening Chic';
        colorPalette = ['#2C2C2C', '#FFFFFF', '#D4AF37'];
        pieces = [
          {
            id: `d${dayNum}-eve-${Math.random()}`,
            name: 'Silk Blend Blazer',
            brand: brands[Math.floor(Math.random() * brands.length)],
            price: '$' + prices.highNum,
            priceNum: prices.highNum,
            color: 'Black',
            colorHex: '#1A1A1A',
            category: 'outerwear',
            material: '65% Viscose, 35% Silk',
            shopUrl: `https://www.${brands[0].toLowerCase().replace(/\s+/g, '')}.com/search?q=silk+blend+blazer`,
            imageUrl: `https://www.google.com/search?tbm=isch&q=${encodeURIComponent('silk blend blazer black')}`,
            isReused: false,
            reusedDays: [dayNum],
          },
          {
            id: `d${dayNum}-eve-${Math.random()}`,
            name: 'Wide-Leg Tailored Trousers',
            brand: brands[Math.floor(Math.random() * brands.length)],
            price: '$' + prices.midNum,
            priceNum: prices.midNum,
            color: 'Charcoal',
            colorHex: '#36454F',
            category: 'bottoms',
            material: '100% Wool',
            shopUrl: `https://www.${brands[1].toLowerCase().replace(/\s+/g, '')}.com/search?q=tailored+trousers`,
            imageUrl: `https://www.google.com/search?tbm=isch&q=${encodeURIComponent('wool tailored trousers charcoal')}`,
            isReused: false,
            reusedDays: [dayNum],
          },
          {
            id: `d${dayNum}-eve-${Math.random()}`,
            name: 'Minimal Gold Hoop Earrings',
            brand: brands[Math.floor(Math.random() * brands.length)],
            price: '$' + prices.lowNum,
            priceNum: prices.lowNum,
            color: 'Gold',
            colorHex: '#FFD700',
            category: 'jewelry',
            material: '18k Gold Plated',
            shopUrl: `https://www.${brands[2].toLowerCase().replace(/\s+/g, '')}.com/search?q=gold+hoop+earrings`,
            imageUrl: `https://www.google.com/search?tbm=isch&q=${encodeURIComponent('gold hoop earrings minimal')}`,
            isReused: false,
            reusedDays: [dayNum],
          },
          {
            id: `d${dayNum}-eve-${Math.random()}`,
            name: 'Pointed-Toe Leather Pumps',
            brand: brands[Math.floor(Math.random() * brands.length)],
            price: '$' + prices.highNum,
            priceNum: prices.highNum,
            color: 'Black',
            colorHex: '#000000',
            category: 'shoes',
            material: '100% Leather',
            shopUrl: `https://www.${brands[3].toLowerCase().replace(/\s+/g, '')}.com/search?q=pointed+toe+pumps`,
            imageUrl: `https://www.google.com/search?tbm=isch&q=${encodeURIComponent('leather pumps pointed toe black')}`,
            isReused: false,
            reusedDays: [dayNum],
          },
        ];
        styleNote = 'Polished and sophisticated for an evening out at gallery or cultural event';
      } else {
        lookName = 'Casual Museum Day';
        colorPalette = ['#FFFFFF', '#8B7355', '#E8D5C4'];
        pieces = [
          {
            id: `d${dayNum}-day-${Math.random()}`,
            name: 'Lightweight Linen Shirt',
            brand: brands[Math.floor(Math.random() * brands.length)],
            price: '$' + prices.midNum,
            priceNum: prices.midNum,
            color: 'Off-White',
            colorHex: '#F5F5DC',
            category: 'tops',
            material: '100% Linen',
            shopUrl: `https://www.${brands[0].toLowerCase().replace(/\s+/g, '')}.com/search?q=linen+shirt`,
            imageUrl: `https://www.google.com/search?tbm=isch&q=${encodeURIComponent('lightweight linen shirt off-white')}`,
            isReused: false,
            reusedDays: [dayNum],
          },
          {
            id: `d${dayNum}-day-${Math.random()}`,
            name: 'Tailored Chino Pants',
            brand: brands[Math.floor(Math.random() * brands.length)],
            price: '$' + prices.midNum,
            priceNum: prices.midNum,
            color: 'Camel',
            colorHex: '#C19A6B',
            category: 'bottoms',
            material: 'Cotton-Linen Blend',
            shopUrl: `https://www.${brands[1].toLowerCase().replace(/\s+/g, '')}.com/search?q=chino+pants`,
            imageUrl: `https://www.google.com/search?tbm=isch&q=${encodeURIComponent('tailored chino pants camel')}`,
            isReused: false,
            reusedDays: [dayNum],
          },
          {
            id: `d${dayNum}-day-${Math.random()}`,
            name: 'Leather Crossbody Bag',
            brand: brands[Math.floor(Math.random() * brands.length)],
            price: '$' + prices.highNum,
            priceNum: prices.highNum,
            color: 'Cognac',
            colorHex: '#8B4513',
            category: 'bags',
            material: 'Full-Grain Leather',
            shopUrl: `https://www.${brands[2].toLowerCase().replace(/\s+/g, '')}.com/search?q=leather+crossbody`,
            imageUrl: `https://www.google.com/search?tbm=isch&q=${encodeURIComponent('leather crossbody bag cognac')}`,
            isReused: true,
            reusedDays: [dayNum, dayNum + 1],
          },
          {
            id: `d${dayNum}-day-${Math.random()}`,
            name: 'Suede Slip-On Loafers',
            brand: brands[Math.floor(Math.random() * brands.length)],
            price: '$' + prices.highNum,
            priceNum: prices.highNum,
            color: 'Tan',
            colorHex: '#D2B48C',
            category: 'shoes',
            material: 'Italian Suede',
            shopUrl: `https://www.${brands[3].toLowerCase().replace(/\s+/g, '')}.com/search?q=suede+loafers`,
            imageUrl: `https://www.google.com/search?tbm=isch&q=${encodeURIComponent('suede slip-on loafers tan')}`,
            isReused: false,
            reusedDays: [dayNum],
          },
          {
            id: `d${dayNum}-day-${Math.random()}`,
            name: 'Oversized Sunglasses',
            brand: brands[Math.floor(Math.random() * brands.length)],
            price: '$' + prices.lowNum,
            priceNum: prices.lowNum,
            color: 'Black',
            colorHex: '#000000',
            category: 'accessories',
            material: 'Acetate Frame',
            shopUrl: `https://www.${brands[4].toLowerCase().replace(/\s+/g, '')}.com/search?q=oversized+sunglasses`,
            imageUrl: `https://www.google.com/search?tbm=isch&q=${encodeURIComponent('oversized sunglasses black')}`,
            isReused: true,
            reusedDays: [dayNum, dayNum + 1, dayNum + 2],
          },
        ];
        styleNote = 'Refined casual for exploring museums and galleries with comfort in mind';
      }
    } else if (activity.toLowerCase().includes('beach') || activity.toLowerCase().includes('pool')) {
      lookName = isEvening ? 'Beachside Evening' : 'Beach Day Essentials';
      colorPalette = ['#87CEEB', '#FFFFFF', '#FFB347'];
      pieces = [
        {
          id: `d${dayNum}-${isEvening ? 'eve' : 'day'}-${Math.random()}`,
          name: isEvening ? 'Linen Cover-Up Dress' : 'Classic Swimsuit',
          brand: brands[Math.floor(Math.random() * brands.length)],
          price: '$' + (isEvening ? prices.midNum : prices.lowNum),
          priceNum: isEvening ? prices.midNum : prices.lowNum,
          color: isEvening ? 'White' : 'Navy',
          colorHex: isEvening ? '#FFFFFF' : '#001F3F',
          category: isEvening ? 'dresses' : 'layers',
          material: isEvening ? '100% Linen' : 'Polyester/Nylon',
          shopUrl: `https://www.${brands[0].toLowerCase().replace(/\s+/g, '')}.com/search?q=${isEvening ? 'linen+dress' : 'swimsuit'}`,
          imageUrl: `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(isEvening ? 'linen cover-up white' : 'navy swimsuit')}`,
          isReused: false,
          reusedDays: [dayNum],
        },
        {
          id: `d${dayNum}-${isEvening ? 'eve' : 'day'}-${Math.random()}`,
          name: isEvening ? 'Woven Leather Sandals' : 'Flip Flops',
          brand: brands[Math.floor(Math.random() * brands.length)],
          price: '$' + prices.lowNum,
          priceNum: prices.lowNum,
          color: 'Natural',
          colorHex: '#D2B48C',
          category: 'shoes',
          material: isEvening ? 'Leather' : 'Rubber',
          shopUrl: `https://www.${brands[1].toLowerCase().replace(/\s+/g, '')}.com/search?q=${isEvening ? 'sandals' : 'flip+flops'}`,
          imageUrl: `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(isEvening ? 'woven leather sandals' : 'flip flops')}`,
          isReused: false,
          reusedDays: [dayNum],
        },
        {
          id: `d${dayNum}-${isEvening ? 'eve' : 'day'}-${Math.random()}`,
          name: 'Canvas Tote Bag',
          brand: brands[Math.floor(Math.random() * brands.length)],
          price: '$' + prices.lowNum,
          priceNum: prices.lowNum,
          color: 'White',
          colorHex: '#FFFFFF',
          category: 'bags',
          material: '100% Canvas',
          shopUrl: `https://www.${brands[2].toLowerCase().replace(/\s+/g, '')}.com/search?q=canvas+tote`,
          imageUrl: `https://www.google.com/search?tbm=isch&q=${encodeURIComponent('canvas tote bag white')}`,
          isReused: true,
          reusedDays: [dayNum, dayNum + 1],
        },
      ];
      styleNote = isEvening ? 'Effortless resort vibes for evening strolls' : 'Beach-ready with casual island style';
    } else if (activity.toLowerCase().includes('nightclub') || activity.toLowerCase().includes('party')) {
      lookName = 'Night Out Glamour';
      colorPalette = ['#1A1A1A', '#FF1493', '#C0C0C0'];
      pieces = [
        {
          id: `d${dayNum}-eve-${Math.random()}`,
          name: 'Satin Slip Dress',
          brand: brands[Math.floor(Math.random() * brands.length)],
          price: '$' + prices.midNum,
          priceNum: prices.midNum,
          color: 'Deep Red',
          colorHex: '#8B0000',
          category: 'dresses',
          material: '100% Satin',
          shopUrl: `https://www.${brands[0].toLowerCase().replace(/\s+/g, '')}.com/search?q=satin+slip+dress`,
          imageUrl: `https://www.google.com/search?tbm=isch&q=${encodeURIComponent('satin slip dress red')}`,
          isReused: false,
          reusedDays: [dayNum],
        },
        {
          id: `d${dayNum}-eve-${Math.random()}`,
          name: 'Metallic Heeled Sandals',
          brand: brands[Math.floor(Math.random() * brands.length)],
          price: '$' + prices.highNum,
          priceNum: prices.highNum,
          color: 'Silver',
          colorHex: '#C0C0C0',
          category: 'shoes',
          material: 'Satin and Leather',
          shopUrl: `https://www.${brands[1].toLowerCase().replace(/\s+/g, '')}.com/search?q=heeled+sandals`,
          imageUrl: `https://www.google.com/search?tbm=isch&q=${encodeURIComponent('metallic heeled sandals silver')}`,
          isReused: false,
          reusedDays: [dayNum],
        },
        {
          id: `d${dayNum}-eve-${Math.random()}`,
          name: 'Layered Pendant Necklace',
          brand: brands[Math.floor(Math.random() * brands.length)],
          price: '$' + prices.lowNum,
          priceNum: prices.lowNum,
          color: 'Gold',
          colorHex: '#FFD700',
          category: 'jewelry',
          material: 'Gold Plated',
          shopUrl: `https://www.${brands[2].toLowerCase().replace(/\s+/g, '')}.com/search?q=pendant+necklace`,
          imageUrl: `https://www.google.com/search?tbm=isch&q=${encodeURIComponent('layered pendant necklace gold')}`,
          isReused: false,
          reusedDays: [dayNum],
        },
        {
          id: `d${dayNum}-eve-${Math.random()}`,
          name: 'Structured Evening Clutch',
          brand: brands[Math.floor(Math.random() * brands.length)],
          price: '$' + prices.highNum,
          priceNum: prices.highNum,
          color: 'Black',
          colorHex: '#000000',
          category: 'bags',
          material: 'Satin',
          shopUrl: `https://www.${brands[3].toLowerCase().replace(/\s+/g, '')}.com/search?q=evening+clutch`,
          imageUrl: `https://www.google.com/search?tbm=isch&q=${encodeURIComponent('structured evening clutch black')}`,
          isReused: false,
          reusedDays: [dayNum],
        },
      ];
      styleNote = 'Bold and glamorous for dancing and nightlife';
    } else {
      // Default casual/exploration
      lookName = isEvening ? 'Evening Dinner' : 'Day Exploration';
      colorPalette = ['#F5F5DC', '#8B7355', '#DCDCDC'];
      pieces = [
        {
          id: `d${dayNum}-${isEvening ? 'eve' : 'day'}-${Math.random()}`,
          name: isEvening ? 'Silk Blend Blouse' : 'Classic Crewneck Tee',
          brand: brands[Math.floor(Math.random() * brands.length)],
          price: '$' + (isEvening ? prices.midNum : prices.lowNum),
          priceNum: isEvening ? prices.midNum : prices.lowNum,
          color: isEvening ? 'Cream' : 'White',
          colorHex: isEvening ? '#FFFDD0' : '#FFFFFF',
          category: 'tops',
          material: isEvening ? 'Silk blend' : '100% Cotton',
          shopUrl: `https://www.${brands[0].toLowerCase().replace(/\s+/g, '')}.com/search?q=${isEvening ? 'blouse' : 'tee'}`,
          imageUrl: `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(isEvening ? 'silk blouse cream' : 'crewneck tee')}`,
          isReused: false,
          reusedDays: [dayNum],
        },
        {
          id: `d${dayNum}-${isEvening ? 'eve' : 'day'}-${Math.random()}`,
          name: isEvening ? 'Wide-Leg Linen Trousers' : 'Relaxed Denim Jeans',
          brand: brands[Math.floor(Math.random() * brands.length)],
          price: '$' + prices.midNum,
          priceNum: prices.midNum,
          color: isEvening ? 'Oat' : 'Medium Blue',
          colorHex: isEvening ? '#D4C5A9' : '#4169E1',
          category: 'bottoms',
          material: isEvening ? '100% Linen' : 'Cotton-Elastane',
          shopUrl: `https://www.${brands[1].toLowerCase().replace(/\s+/g, '')}.com/search?q=${isEvening ? 'linen+trousers' : 'jeans'}`,
          imageUrl: `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(isEvening ? 'wide-leg linen trousers' : 'denim jeans')}`,
          isReused: false,
          reusedDays: [dayNum],
        },
        {
          id: `d${dayNum}-${isEvening ? 'eve' : 'day'}-${Math.random()}`,
          name: isEvening ? 'Leather Strap Sandals' : 'White Canvas Sneakers',
          brand: brands[Math.floor(Math.random() * brands.length)],
          price: '$' + (isEvening ? prices.highNum : prices.lowNum),
          priceNum: isEvening ? prices.highNum : prices.lowNum,
          color: isEvening ? 'Tan' : 'White',
          colorHex: isEvening ? '#D2B48C' : '#FFFFFF',
          category: 'shoes',
          material: isEvening ? 'Leather' : 'Canvas',
          shopUrl: `https://www.${brands[2].toLowerCase().replace(/\s+/g, '')}.com/search?q=${isEvening ? 'sandals' : 'sneakers'}`,
          imageUrl: `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(isEvening ? 'leather sandals tan' : 'canvas sneakers')}`,
          isReused: false,
          reusedDays: [dayNum],
        },
        {
          id: `d${dayNum}-${isEvening ? 'eve' : 'day'}-${Math.random()}`,
          name: 'Structured Crossbody Bag',
          brand: brands[Math.floor(Math.random() * brands.length)],
          price: '$' + prices.midNum,
          priceNum: prices.midNum,
          color: 'Cognac',
          colorHex: '#8B4513',
          category: 'bags',
          material: 'Vegan Leather',
          shopUrl: `https://www.${brands[3].toLowerCase().replace(/\s+/g, '')}.com/search?q=crossbody+bag`,
          imageUrl: `https://www.google.com/search?tbm=isch&q=${encodeURIComponent('structured crossbody bag')}`,
          isReused: true,
          reusedDays: [dayNum, dayNum + 1, dayNum + 2],
        },
      ];
      styleNote = isEvening ? 'Relaxed elegance for dinner' : 'Comfortable and stylish for exploring';
    }

    return {
      lookName,
      pieces,
      colorPalette,
      styleNote,
      totalPrice: pieces.reduce((sum, p) => sum + p.priceNum, 0),
    };
  };

  const days: Day[] = [];
  let allPieces: ClothingPiece[] = [];

  for (let i = 1; i <= Math.min(totalDays, 5); i++) {
    const currentDate = new Date(sdDate.getTime());
    currentDate.setDate(currentDate.getDate() + i - 1);
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;

    const itDay = itineraryDays[i - 1];
    const hasEvening = itDay?.hasEvening ?? (i <= 2);
    const activityText = itDay?.summary || (i === 1 ? 'Arriving and settling in' : `A day of exploring ${destination}`);
    const venueText = itDay?.venue || '';
    const dressCode = itDay?.dressCode || 'Smart Casual';

    const daytimeOutfit = generateRealisticOutfit(i, false, activityText, dressCode);
    allPieces.push(...daytimeOutfit.pieces);

    let eveningOutfit: Outfit | undefined;
    if (hasEvening) {
      eveningOutfit = generateRealisticOutfit(i, true, activityText, dressCode);
      allPieces.push(...eveningOutfit.pieces);
    }

    const dayTotal = daytimeOutfit.totalPrice + (eveningOutfit?.totalPrice || 0);
    const dayWeather = getWeatherForDay(i);

    const titleText = itDay?.title || (i === 1 ? 'Arrival Day' : `Day ${i} in ${destination}`);

    days.push({
      dayNumber: i,
      date: dateStr,
      title: titleText,
      activitySummary: activityText,
      venue: venueText,
      dressCode,
      daytimeOutfit,
      ...(eveningOutfit && { eveningOutfit }),
      weather: dayWeather,
      dayTotal,
    });
  }

  // Calculate capsule analysis
  const uniquePieces = Array.from(
    new Map(allPieces.map(p => [p.id, p])).values()
  );

  const reusedPiecesMap = new Map<string, ReusedPiece>();
  allPieces.forEach(piece => {
    if (piece.isReused) {
      if (!reusedPiecesMap.has(piece.id)) {
        reusedPiecesMap.set(piece.id, {
          pieceId: piece.id,
          pieceName: piece.name,
          usedInDays: piece.reusedDays,
        });
      }
    }
  });

  const totalOutfits = days.reduce((sum, d) => sum + 1 + (d.eveningOutfit ? 1 : 0), 0);
  const tripTotal = days.reduce((sum, d) => sum + d.dayTotal, 0);

  // Local style guide
  let localStyleGuideDetails = '';
  let streetStyleSearchUrl = 'https://www.google.com/search?tbm=isch&q=street+style';

  if (destination.toLowerCase().includes('paris')) {
    localStyleGuideDetails = 'Parisian fashion favors minimalism, quality basics, and timeless pieces. Think neutral palettes with pops of color through accessories. Comfortable flats are preferred to athletic wear. Effortless sophistication is the goal.';
    streetStyleSearchUrl = 'https://www.google.com/search?tbm=isch&q=Paris+street+style';
  } else if (destination.toLowerCase().includes('tokyo')) {
    localStyleGuideDetails = 'Tokyo style is trend-forward and experimental, mixing vintage with cutting-edge. Unexpected combinations are celebrated. Accessories are statement-making. Quality fabrics and clean silhouettes are key.';
    streetStyleSearchUrl = 'https://www.google.com/search?tbm=isch&q=Tokyo+street+style';
  } else if (destination.toLowerCase().includes('miami')) {
    localStyleGuideDetails = 'Miami style is vibrant, bold, and beach-influenced. Bright colors, lightweight fabrics, and statement pieces work here. Luxury basics mixed with fun accessories. Less is more formality-wise.';
    streetStyleSearchUrl = 'https://www.google.com/search?tbm=isch&q=Miami+street+style';
  } else {
    localStyleGuideDetails = `In ${destination}, locals favor quality basics and timeless pieces in neutral tones. Natural fabrics are appreciated. Keep style understated but polished. Comfortable, quality shoes are a must. Mix high and low fashion effortlessly.`;
    streetStyleSearchUrl = `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(destination + ' street style')}`;
  }

  return {
    capsuleSummary: `${uniquePieces.length} carefully curated pieces creating ${totalOutfits} versatile looks for ${totalDays} days in ${destination}`,
    days,
    localStyleGuide: `${destination} Style Guide`,
    localStyleGuideDetails,
    blendInTips: 'Opt for neutral base colors with pops of personality. Avoid overly branded pieces. Invest in comfortable, quality footwear. Keep accessories minimal but intentional. Mix vintage with contemporary pieces.Quality over quantity is the local philosophy.',
    streetStyleSearchUrl,
    mixMatchTips: [
      `The neutral-toned pieces (whites, creams, tans) create a versatile base that mixes with all bottoms`,
      `Structured bags transition from day to evening effortlessly`,
      `Lightweight layers can be mixed to adapt to weather changes throughout the day`,
      `Neutral color palette allows accessories and jewelry to be statement pieces`,
      `Shoes range from comfortable flats for exploration to elevated heels for evening`,
      `Reused pieces reduce packing weight while maintaining outfit variety`,
    ],
    dontForgetItems: [
      'Comfortable walking shoes with cushioned insoles',
      'Lightweight scarf for sun protection and versatility',
      'Quality sunscreen (SPF 30+)',
      'Portable phone charger',
      'Compact umbrella or rain jacket',
      'Travel-size wrinkle release spray',
      'Basic sewing kit for quick fixes',
      'Neutral-toned undergarments',
    ],
    capsuleAnalysis: {
      totalUniquePieces: uniquePieces.length,
      totalOutfits,
      reusedPieces: Array.from(reusedPiecesMap.values()),
      packingEfficiency: `${uniquePieces.length} pieces → ${totalOutfits} outfits`,
      fitsInCarryOn: uniquePieces.length <= 18,
    },
    tripTotal,
  };
};

export async function POST(request: Request) {
  let destination = '';
  let startDate = '';
  let endDate = '';

  try {
    const body = await request.json();
    const {
      styleTags = [],
      styleDescription = '',
      budget: budgetTier = '$$',
      destination: dest = '',
      startDate: sd = '',
      endDate: ed = '',
      itinerary = '',
      activities = [],
      weather,
      inspoPics,
      closetPics,
    } = body;

    destination = dest;
    startDate = sd;
    endDate = ed;

    const apiKey = process.env.ANTHROPIC_API_KEY;

    // If no API key, return realistic mock response
    if (!apiKey) {
      const mockCapsule = generateMockCapsule(
        destination,
        startDate,
        endDate,
        budgetTier,
        styleTags,
        weather,
        itinerary
      );

      // Parse dates safely — use local date parts to avoid timezone issues
      const sdP = startDate.split('-').map(Number);
      const edP = endDate.split('-').map(Number);
      const sdD = new Date(sdP[0], sdP[1] - 1, sdP[2]);
      const edD = new Date(edP[0], edP[1] - 1, edP[2]);
      const rawDays = Math.round((edD.getTime() - sdD.getTime()) / (1000 * 60 * 60 * 24));
      const totalDays = isNaN(rawDays) ? 3 : Math.max(1, rawDays + 1);

      return NextResponse.json({
        ...mockCapsule,
        destination,
        startDate,
        endDate,
        totalDays,
        weather: weather || {
          temp: 72,
          tempMin: 65,
          tempMax: 80,
          description: 'partly cloudy',
          icon: '02d',
          humidity: 55,
          rainChance: 20,
        },
      });
    }

    // Calculate total days — parse dates safely to avoid timezone issues
    const sdParts2 = startDate.split('-').map(Number);
    const edParts2 = endDate.split('-').map(Number);
    const sdDate2 = new Date(sdParts2[0], sdParts2[1] - 1, sdParts2[2]);
    const edDate2 = new Date(edParts2[0], edParts2[1] - 1, edParts2[2]);
    const rawTotalDays = Math.round((edDate2.getTime() - sdDate2.getTime()) / (1000 * 60 * 60 * 24));
    const totalDays = isNaN(rawTotalDays) ? 3 : Math.max(1, rawTotalDays + 1);

    // Build content blocks for Claude
    const contentBlocks: ContentBlock[] = [];

    // Add comprehensive system prompt
    const systemPrompt = `You are an expert fashion stylist AI specializing in creating detailed, personalized capsule vacation wardrobes. You have deep expertise in:
- Fashion brands across all price points and their aesthetic signatures
- Fabric properties and how to match them to activities and weather
- Venue research and venue-specific dress codes
- Color theory and creating cohesive color palettes
- Layering strategies for different climates
- Accessory styling that elevates looks

Your responses should be sophisticated, practical, and trend-aware. Always return ONLY valid JSON with no markdown formatting or code fences.`;

    const prompt = `You are an expert fashion stylist creating a luxury capsule vacation wardrobe.

USER DETAILS:
- Style Tags: ${styleTags.join(', ')}
- Style Description: ${styleDescription}
- Budget Tier: ${budgetTier}
- Destination: ${destination}
- Trip Duration: ${startDate} to ${endDate} (${totalDays} days)
- Itinerary: ${itinerary}
- Planned Activities: ${activities.join(', ')}
${weather ? `- Weather Forecast: ${weather.temp}°F, ${weather.description}, Humidity: ${weather.humidity}%, Rain Chance: ${weather.rainChance || 'unknown'}%` : ''}

CRITICAL REQUIREMENTS FOR YOUR RESPONSE:

1. VENUE AND DRESS CODE RESEARCH:
   - For each day, identify the specific venue/restaurant/activity mentioned
   - Research typical dress codes (e.g., "Kappa Massa" = fancy Italian → smart casual; "Ralph's Coffee" = preppy casual)
   - Adjust outfit formality accordingly (museum = polished casual, nightclub = dressy/edgy, beach = resort wear, business = smart casual)

2. WEATHER INTELLIGENCE:
   - Consider temperature, rain probability, and humidity when selecting fabrics
   - Recommend layering strategies for temperature fluctuations
   - Choose breathable fabrics for hot/humid days, insulating layers for cool days
   - Factor in rain with appropriate material choices

3. COMPLETE OUTFITS WITH FULL ACCESSORIES:
   - Every outfit must include: top, bottom/dress, shoes, bag, jewelry (2-3 pieces minimum), sunglasses (daytime), outerwear (if needed), belt/scarf/hat as appropriate
   - No incomplete looks or missing accessories
   - Make accessories intentional and style-enhancing

4. DIVERSE BRAND MIXING:
   Use a HUGE variety of brands across budget tiers. Mix brands realistically within single outfits (e.g., Zara top + The Row pants).

   $ tier: Zara, H&M, ASOS, Mango, Uniqlo, & Other Stories, Topshop, Urban Outfitters, Abercrombie, COS, Arket, Pull&Bear, Stradivarius
   $$ tier: Reformation, Sézane, Reiss, AllSaints, Massimo Dutti, Ba&sh, Rouje, Ganni, Staud, Cult Gaia, Anine Bing, Vince, Theory, Club Monaco, J.Crew, Aritzia
   $$$ tier: The Row, Totème, Khaite, Jacquemus, Isabel Marant, Zimmermann, Ulla Johnson, Nanushka, By Far, Max Mara, Brunello Cucinelli, Acne Studios, Bottega Veneta

5. SHOPPING LINKS:
   - Generate retailer-specific URLs:
     * $ brands: link to brand's website search (e.g., https://www.zara.com/us/en/search?searchTerm=linen+blazer)
     * $$ brands: link to Nordstrom or Revolve search (e.g., https://www.nordstrom.com/sr?keyword=Reformation+linen+dress)
     * $$$ brands: link to Net-a-Porter, Ssense, or Mytheresa search
   - Brand-appropriate retailers, NOT generic Google Shopping

6. PRODUCT IMAGE URLS:
   - For each piece, generate imageUrl using Google Shopping image search:
   - Format: https://www.google.com/search?tbm=isch&q=\${encodeURIComponent(brand + ' ' + itemName + ' ' + color)}
   - This gives users a way to visualize products

7. PER-DAY WEATHER:
   - Include weather data for each day (not just overall):
   - temp (current), tempHigh, tempLow, conditions, rainChance (0-100), recommendation
   - Example: {"temp": 72, "tempHigh": 78, "tempLow": 65, "conditions": "Partly cloudy", "rainChance": 30, "recommendation": "Light layers recommended for temperature swings"}

8. BUDGET TRACKING:
   - Each piece: price (string with $), priceNum (raw number)
   - Each outfit: totalPrice (sum of all pieces)
   - Each day: dayTotal (daytime + evening outfit totals)
   - Response: tripTotal (sum of all outfit costs)

9. PIECE STRUCTURE:
   {
     "id": "unique-id",
     "name": "Relaxed Linen Blazer" (specific, not generic),
     "brand": "Brand Name",
     "price": "$48",
     "priceNum": 48,
     "color": "Off-White",
     "colorHex": "#F5F5DC",
     "category": "tops|bottoms|shoes|bags|jewelry|accessories|outerwear|dresses|layers",
     "material": "100% Linen" (specific fiber content),
     "shopUrl": "retailer-specific search URL",
     "imageUrl": "Google image search URL",
     "isReused": boolean,
     "reusedDays": [1, 3, 5] (which days this appears)
   }

10. CAPSULE ANALYSIS:
    {
      "totalUniquePieces": number,
      "totalOutfits": number,
      "reusedPieces": [{"pieceId": "...", "pieceName": "...", "usedInDays": [1, 2, 3]}],
      "packingEfficiency": "12 pieces → 8 outfits",
      "fitsInCarryOn": boolean (true if ≤18 pieces)
    }

11. LOCAL STYLE INSIGHTS:
    - Include destination-specific style guide details
    - Provide street style search URL for the destination
    - Give practical blend-in tips for respecting local fashion norms
    - Mix-and-match tips that maximize outfit combinations

12. OUTFIT VARIETY:
    - Create 3-5 distinctly different daytime looks
    - If there are evening activities, create equally diverse evening looks
    - Different silhouettes, color palettes, and vibes for each day
    - Show how pieces are reused strategically across days

Return ONLY a valid JSON object matching this EXACT structure (note: all fields are required, use empty arrays/objects if needed):
{
  "capsuleSummary": "string",
  "days": [
    {
      "dayNumber": number,
      "date": "YYYY-MM-DD",
      "title": "string",
      "activitySummary": "string",
      "venue": "string or null",
      "dressCode": "string",
      "daytimeOutfit": {
        "lookName": "string",
        "pieces": [piece objects with all 13 fields],
        "colorPalette": ["#hex", "#hex", "#hex"],
        "styleNote": "string",
        "totalPrice": number
      },
      "eveningOutfit": {
        "lookName": "string",
        "pieces": [piece objects],
        "colorPalette": ["#hex", "#hex", "#hex"],
        "styleNote": "string",
        "totalPrice": number
      },
      "weather": {
        "temp": number,
        "tempHigh": number,
        "tempLow": number,
        "conditions": "string",
        "rainChance": number,
        "recommendation": "string"
      },
      "dayTotal": number
    }
  ],
  "localStyleGuide": "string",
  "localStyleGuideDetails": "string",
  "blendInTips": "string",
  "streetStyleSearchUrl": "string",
  "mixMatchTips": ["string", "string"],
  "dontForgetItems": ["string", "string"],
  "capsuleAnalysis": {
    "totalUniquePieces": number,
    "totalOutfits": number,
    "reusedPieces": [{"pieceId": "string", "pieceName": "string", "usedInDays": [1, 2]}],
    "packingEfficiency": "string",
    "fitsInCarryOn": boolean
  },
  "tripTotal": number
}`;

    contentBlocks.push({
      type: 'text',
      text: prompt,
    });

    // Add inspiration pictures if provided
    if (inspoPics && inspoPics.length > 0) {
      for (const pic of inspoPics) {
        if (pic.startsWith('data:image/')) {
          const matches = pic.match(/^data:(image\/\w+);base64,(.+)$/);
          if (matches) {
            const [, mimeType, base64Data] = matches;
            contentBlocks.push({
              type: 'image',
              source: {
                type: 'base64',
                media_type: mimeType as
                  | 'image/jpeg'
                  | 'image/png'
                  | 'image/gif'
                  | 'image/webp',
                data: base64Data,
              },
            });
          }
        }
      }
    }

    // Add closet pictures if provided
    if (closetPics && closetPics.length > 0) {
      for (const pic of closetPics) {
        if (pic.startsWith('data:image/')) {
          const matches = pic.match(/^data:(image\/\w+);base64,(.+)$/);
          if (matches) {
            const [, mimeType, base64Data] = matches;
            contentBlocks.push({
              type: 'image',
              source: {
                type: 'base64',
                media_type: mimeType as
                  | 'image/jpeg'
                  | 'image/png'
                  | 'image/gif'
                  | 'image/webp',
                data: base64Data,
              },
            });
          }
        }
      }
    }

    // Call Anthropic API
    let capsuleData: CapsuleResponse | null = null;

    try {
      const client = new Anthropic({
        apiKey,
      });

      const message = await client.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 16000,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: contentBlocks,
          },
        ],
      });

      const responseText =
        message.content[0].type === 'text' ? message.content[0].text : '';

      // Try to extract JSON from the response — strip markdown code fences if present
      const cleaned = responseText.replace(/```json\s*/g, '').replace(/```\s*/g, '');
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        capsuleData = JSON.parse(jsonMatch[0]);
      }
    } catch (aiError) {
      console.error('Claude API error, falling back to mock:', aiError);
      // Fall through to mock fallback below
    }

    // If AI failed or returned bad data, use mock
    if (!capsuleData || !capsuleData.days || capsuleData.days.length === 0) {
      capsuleData = generateMockCapsule(
        destination,
        startDate,
        endDate,
        budgetTier,
        styleTags,
        weather,
        itinerary
      );
    }

    // Return response with metadata
    return NextResponse.json({
      ...capsuleData,
      destination,
      startDate,
      endDate,
      totalDays,
      weather: weather || {
        temp: 72,
        tempMin: 65,
        tempMax: 80,
        description: 'partly cloudy',
        icon: '02d',
        humidity: 55,
        rainChance: 20,
      },
    });
  } catch (error) {
    console.error('Error in generate route:', error);

    // Last resort: return a minimal valid response so the app doesn't crash
    let fallbackTotalDays = 3;
    try {
      const fbSd = startDate.split('-').map(Number);
      const fbEd = endDate.split('-').map(Number);
      const fbSdD = new Date(fbSd[0], fbSd[1] - 1, fbSd[2]);
      const fbEdD = new Date(fbEd[0], fbEd[1] - 1, fbEd[2]);
      const fbRaw = Math.round((fbEdD.getTime() - fbSdD.getTime()) / (1000 * 60 * 60 * 24));
      if (!isNaN(fbRaw)) fallbackTotalDays = Math.max(1, fbRaw + 1);
    } catch { /* keep default 3 */ }

    const fallback = generateMockCapsule(
      destination || 'Your Destination',
      startDate || '2026-07-01',
      endDate || '2026-07-04',
      '$$',
      [],
      undefined,
      ''
    );

    return NextResponse.json({
      ...fallback,
      destination: destination || 'Your Destination',
      startDate: startDate || '2026-07-01',
      endDate: endDate || '2026-07-04',
      totalDays: fallbackTotalDays,
      weather: {
        temp: 72,
        tempMin: 65,
        tempMax: 80,
        description: 'partly cloudy',
        icon: '02d',
        humidity: 55,
        rainChance: 20,
      },
    });
  }
}
