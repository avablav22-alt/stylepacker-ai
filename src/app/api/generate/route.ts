import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

interface ClothingPiece {
  id: string;
  name: string;
  brand: string;
  price: string;
  color: string;
  colorHex: string;
  category: string;
  shopUrl: string;
}

interface Outfit {
  lookName: string;
  pieces: ClothingPiece[];
  colorPalette: string[];
  styleNote: string;
}

interface Day {
  dayNumber: number;
  date: string;
  title: string;
  activitySummary: string;
  daytimeOutfit: Outfit;
  eveningOutfit?: Outfit;
}

interface CapsuleResponse {
  capsuleSummary: string;
  days: Day[];
  localStyleGuide: string;
  blendInTips: string;
  mixMatchTips: string[];
  dontForgetItems: string[];
}

interface WeatherData {
  temp: number;
  tempMin: number;
  tempMax: number;
  description: string;
  icon: string;
  humidity: number;
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
  const totalDays = Math.max(1, Math.ceil(
    (new Date(endDate).getTime() - new Date(startDate).getTime()) /
      (1000 * 60 * 60 * 24)
  ) + 1);

  // Parse itinerary into day descriptions
  const itineraryDays: { title: string; summary: string; hasEvening: boolean }[] = [];
  if (itinerary) {
    const dayMatches = itinerary.split(/day\s*\d+\s*[:\-]/i);
    dayMatches.filter(d => d.trim()).forEach((dayText, idx) => {
      const text = dayText.trim();
      const hasEvening = /dinner|cocktail|night|evening|club|bar|rooftop/i.test(text);
      const firstActivity = text.split(/[,.]/).map(s => s.trim()).filter(Boolean)[0] || text;
      itineraryDays.push({
        title: firstActivity.length > 50 ? firstActivity.slice(0, 50) + '...' : firstActivity,
        summary: text.length > 120 ? text.slice(0, 120) + '...' : text,
        hasEvening,
      });
    });
  }

  const priceMap: { [key: string]: { low: string; mid: string; high: string } } = {
    '$': { low: '$29', mid: '$45', high: '$69' },
    '$$': { low: '$78', mid: '$120', high: '$165' },
    '$$$': { low: '$195', mid: '$325', high: '$485' },
  };

  const prices = priceMap[budgetTier] || priceMap['$$'];

  // Generate brand suggestions based on budget
  let brands: string[] = [];
  if (budgetTier === '$') {
    brands = ['H&M', 'Zara', 'ASOS', 'Uniqlo', 'Gap'];
  } else if (budgetTier === '$$') {
    brands = ['COS', 'Reformation', 'Everlane', 'Mango', 'Banana Republic'];
  } else {
    brands = ['Sezane', 'Toteme', 'The Row', 'Reiss', 'Theory'];
  }

  const days: Day[] = [];

  for (let i = 1; i <= Math.min(totalDays, 5); i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(currentDate.getDate() + i - 1);
    const dateStr = currentDate.toISOString().split('T')[0];

    let daytimePieces: ClothingPiece[] = [];
    let eveningPieces: ClothingPiece[] = [];

    if (i === 1) {
      // Arrival day
      daytimePieces = [
        {
          id: `d${i}-day-1`,
          name: 'Linen Blend Blazer',
          brand: brands[0],
          price: prices.high,
          color: 'Oat',
          colorHex: '#D4C5A9',
          category: 'layers',
          shopUrl: `https://www.google.com/search?tbm=shop&q=${encodeURIComponent(brands[0] + ' linen blazer')}`,
        },
        {
          id: `d${i}-day-2`,
          name: 'Wide-Leg Trousers',
          brand: brands[1],
          price: prices.mid,
          color: 'Cream',
          colorHex: '#FFFDD0',
          category: 'bottoms',
          shopUrl: `https://www.google.com/search?tbm=shop&q=${encodeURIComponent(brands[1] + ' wide leg trousers')}`,
        },
        {
          id: `d${i}-day-3`,
          name: 'Leather Slip-On Loafers',
          brand: brands[2],
          price: prices.mid,
          color: 'Cognac',
          colorHex: '#8B4513',
          category: 'shoes',
          shopUrl: `https://www.google.com/search?tbm=shop&q=${encodeURIComponent(brands[2] + ' leather loafers')}`,
        },
      ];

      eveningPieces = [
        {
          id: `d${i}-eve-1`,
          name: 'Silk Camisole',
          brand: brands[3],
          price: prices.mid,
          color: 'Champagne',
          colorHex: '#F7E7CE',
          category: 'tops',
          shopUrl: `https://www.google.com/search?tbm=shop&q=${encodeURIComponent(brands[3] + ' silk camisole')}`,
        },
        {
          id: `d${i}-eve-2`,
          name: 'Midi Skirt',
          brand: brands[1],
          price: prices.mid,
          color: 'Navy',
          colorHex: '#001F3F',
          category: 'bottoms',
          shopUrl: `https://www.google.com/search?tbm=shop&q=${encodeURIComponent(brands[1] + ' midi skirt')}`,
        },
        {
          id: `d${i}-eve-3`,
          name: 'Strappy Heels',
          brand: brands[4],
          price: prices.high,
          color: 'Gold',
          colorHex: '#FFD700',
          category: 'shoes',
          shopUrl: `https://www.google.com/search?tbm=shop&q=${encodeURIComponent(brands[4] + ' strappy heels')}`,
        },
      ];
    } else if (i === 2) {
      // Exploring/Activities day
      daytimePieces = [
        {
          id: `d${i}-day-1`,
          name: 'Cotton T-Shirt',
          brand: brands[0],
          price: prices.low,
          color: 'White',
          colorHex: '#FFFFFF',
          category: 'tops',
          shopUrl: `https://www.google.com/search?tbm=shop&q=${encodeURIComponent(brands[0] + ' cotton tshirt')}`,
        },
        {
          id: `d${i}-day-2`,
          name: 'Lightweight Chinos',
          brand: brands[1],
          price: prices.mid,
          color: 'Sage',
          colorHex: '#9DC183',
          category: 'bottoms',
          shopUrl: `https://www.google.com/search?tbm=shop&q=${encodeURIComponent(brands[1] + ' chinos')}`,
        },
        {
          id: `d${i}-day-3`,
          name: 'Canvas Sneakers',
          brand: brands[2],
          price: prices.low,
          color: 'White',
          colorHex: '#FFFFFF',
          category: 'shoes',
          shopUrl: `https://www.google.com/search?tbm=shop&q=${encodeURIComponent(brands[2] + ' canvas sneakers')}`,
        },
        {
          id: `d${i}-day-4`,
          name: 'Denim Jacket',
          brand: brands[3],
          price: prices.mid,
          color: 'Light Indigo',
          colorHex: '#6495ED',
          category: 'layers',
          shopUrl: `https://www.google.com/search?tbm=shop&q=${encodeURIComponent(brands[3] + ' denim jacket')}`,
        },
      ];

      eveningPieces = [
        {
          id: `d${i}-eve-1`,
          name: 'Linen Shirt',
          brand: brands[4],
          price: prices.mid,
          color: 'Blush',
          colorHex: '#FFB6C1',
          category: 'tops',
          shopUrl: `https://www.google.com/search?tbm=shop&q=${encodeURIComponent(brands[4] + ' linen shirt')}`,
        },
        {
          id: `d${i}-eve-2`,
          name: 'Linen Trousers',
          brand: brands[1],
          price: prices.mid,
          color: 'Camel',
          colorHex: '#C19A6B',
          category: 'bottoms',
          shopUrl: `https://www.google.com/search?tbm=shop&q=${encodeURIComponent(brands[1] + ' linen trousers')}`,
        },
        {
          id: `d${i}-eve-3`,
          name: 'Woven Sandals',
          brand: brands[2],
          price: prices.mid,
          color: 'Natural',
          colorHex: '#D2B48C',
          category: 'shoes',
          shopUrl: `https://www.google.com/search?tbm=shop&q=${encodeURIComponent(brands[2] + ' woven sandals')}`,
        },
      ];
    } else {
      // Additional days
      daytimePieces = [
        {
          id: `d${i}-day-1`,
          name: 'Striped Linen Top',
          brand: brands[1],
          price: prices.mid,
          color: 'Navy & White',
          colorHex: '#001F3F',
          category: 'tops',
          shopUrl: `https://www.google.com/search?tbm=shop&q=${encodeURIComponent(brands[1] + ' striped linen top')}`,
        },
        {
          id: `d${i}-day-2`,
          name: 'Linen Shorts',
          brand: brands[0],
          price: prices.low,
          color: 'Ecru',
          colorHex: '#F5DEB3',
          category: 'bottoms',
          shopUrl: `https://www.google.com/search?tbm=shop&q=${encodeURIComponent(brands[0] + ' linen shorts')}`,
        },
        {
          id: `d${i}-day-3`,
          name: 'Leather Flat Sandals',
          brand: brands[3],
          price: prices.mid,
          color: 'Tan',
          colorHex: '#D2B48C',
          category: 'shoes',
          shopUrl: `https://www.google.com/search?tbm=shop&q=${encodeURIComponent(brands[3] + ' leather sandals')}`,
        },
      ];
    }

    const colorPalette = ['#FFFFFF', '#2C3E50', '#D4C5A9'];

    const itDay = itineraryDays[i - 1];
    const hasEvening = itDay?.hasEvening ?? (i <= 2);

    days.push({
      dayNumber: i,
      date: dateStr,
      title: itDay?.title || (i === 1 ? 'Arrival Day' : `Exploring ${destination}`),
      activitySummary: itDay?.summary || (i === 1 ? 'Arriving and settling in' : `A day of exploring ${destination}`),
      daytimeOutfit: {
        lookName:
          i === 1 ? 'Effortless Arrival' : `Casual Exploration Day ${i}`,
        pieces: daytimePieces,
        colorPalette,
        styleNote:
          i === 1
            ? 'A relaxed but put-together look for travel day'
            : 'Comfortable and stylish for exploring',
      },
      ...(eveningPieces.length > 0 && hasEvening && {
        eveningOutfit: {
          lookName: i === 1 ? 'Sunset Dinner' : `Evening Look Day ${i}`,
          pieces: eveningPieces,
          colorPalette,
          styleNote: 'Elevated look for dinner and evening activities',
        },
      }),
    });
  }

  return {
    capsuleSummary: `${days.reduce((sum, d) => sum + d.daytimeOutfit.pieces.length + (d.eveningOutfit?.pieces.length || 0), 0)} pieces for ${totalDays} days`,
    days,
    localStyleGuide: `In ${destination}, locals favor quality basics and timeless pieces. Neutral colors dominate the palette, with an emphasis on natural fabrics and understated elegance. Comfort is key, but style is never compromised.`,
    blendInTips: 'Opt for neutral colors and classic silhouettes. Avoid overly trendy or branded pieces. Comfortable, quality shoes are essential. Keep accessories minimal but intentional.',
    mixMatchTips: [
      'The linen blazer works with the midi skirt and wide-leg trousers',
      'The white cotton t-shirt pairs with both chinos and linen shorts',
      'Use neutral layers to create different looks from the same base pieces',
      'The denim jacket layers over all tops for a cohesive look',
      'Mix and match bottoms with all tops for varied outfits',
    ],
    dontForgetItems: [
      'Portable steamer or wrinkle spray',
      'Comfortable insoles or blister balm',
      'Lightweight scarf for sun protection',
      'Quality sunscreen',
      'Reusable water bottle',
      'Crossbody bag for daily exploring',
    ],
  };
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      styleTags = [],
      styleDescription = '',
      budget: budgetTier = '$$',
      destination = '',
      startDate = '',
      endDate = '',
      itinerary = '',
      activities = [],
      weather,
      inspoPics,
      closetPics,
    } = body;

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

      const totalDays = Math.ceil(
        (new Date(endDate).getTime() - new Date(startDate).getTime()) /
          (1000 * 60 * 60 * 24)
      );

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
        },
      });
    }

    // Calculate total days
    const totalDays = Math.ceil(
      (new Date(endDate).getTime() - new Date(startDate).getTime()) /
        (1000 * 60 * 60 * 24)
    );

    // Build content blocks for Claude
    const contentBlocks: ContentBlock[] = [];

    // Add text prompt
    const prompt = `You are an expert fashion stylist specializing in creating capsule vacation wardrobes.

User Details:
- Style Tags: ${styleTags.join(', ')}
- Style Description: ${styleDescription}
- Budget Tier: ${budgetTier}
- Destination: ${destination}
- Trip Duration: ${startDate} to ${endDate} (${totalDays} days)
- Itinerary: ${itinerary}
- Planned Activities: ${activities.join(', ')}
${weather ? `- Weather Forecast: ${weather.temp}°F, ${weather.description}, Humidity: ${weather.humidity}%` : ''}

Your task is to create a detailed, mix-and-match capsule wardrobe for this trip. For each day, create a daytime outfit and an evening outfit (only if evening activities are mentioned).

Important Requirements:
1. Generate realistic clothing items with specific brands, prices, and colors
2. Match all prices to the budget tier exactly:
   - $ = H&M, Zara, ASOS, Uniqlo prices
   - $$ = COS, Reformation, Everlane prices
   - $$$ = Sezane, Toteme, The Row prices
3. Respect all style tags and preferences
4. Use weather data to suggest appropriate fabrics and layers
5. Create pieces that mix-and-match across multiple days
6. For each piece, generate a Google Shopping URL
7. Include a local style guide for the destination
8. Provide blend-in tips for respecting local fashion norms
9. List mix-and-match combinations for versatility
10. Suggest essential items not to forget

Return ONLY a valid JSON object matching this exact structure:
{
  "capsuleSummary": "string describing total pieces and duration",
  "days": [
    {
      "dayNumber": number,
      "date": "YYYY-MM-DD",
      "title": "string",
      "activitySummary": "string",
      "daytimeOutfit": {
        "lookName": "string",
        "pieces": [
          {
            "id": "unique-id-format",
            "name": "string",
            "brand": "string",
            "price": "string with currency",
            "color": "string",
            "colorHex": "#hexcode",
            "category": "tops|bottoms|layers|shoes|accessories",
            "shopUrl": "https://www.google.com/search?tbm=shop&q=..."
          }
        ],
        "colorPalette": ["#hexcode1", "#hexcode2", "#hexcode3"],
        "styleNote": "string"
      },
      "eveningOutfit": {
        "lookName": "string",
        "pieces": [...same structure...],
        "colorPalette": ["#hexcode1", "#hexcode2", "#hexcode3"],
        "styleNote": "string"
      }
    }
  ],
  "localStyleGuide": "string",
  "blendInTips": "string",
  "mixMatchTips": ["string", "string", ...],
  "dontForgetItems": ["string", "string", ...]
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
    const client = new Anthropic({
      apiKey,
    });

    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: contentBlocks,
        },
      ],
      system:
        'You are an expert fashion stylist AI that creates detailed, personalized capsule vacation wardrobes. You have deep knowledge of fashion brands at all price points, fabric properties, and styling. You provide practical, wearable advice that respects user preferences and budgets. Always return valid JSON that can be parsed.',
    });

    // Extract JSON from response
    let capsuleData: CapsuleResponse;

    const responseText =
      message.content[0].type === 'text' ? message.content[0].text : '';

    // Try to extract JSON from the response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      capsuleData = JSON.parse(jsonMatch[0]);
    } else {
      throw new Error('Could not extract JSON from Claude response');
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
      },
    });
  } catch (error) {
    console.error('Error in generate route:', error);

    // Return error response
    return NextResponse.json(
      {
        error: 'Failed to generate capsule wardrobe',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
