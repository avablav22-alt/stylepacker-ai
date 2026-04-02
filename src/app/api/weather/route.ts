import { NextResponse } from 'next/server';

interface WeatherResponse {
  temp: number;
  tempMin: number;
  tempMax: number;
  description: string;
  icon: string;
  humidity: number;
}

interface FallbackWeatherMap {
  [key: string]: WeatherResponse;
}

// Simple destination-based weather fallback
const getFallbackWeather = (destination: string): WeatherResponse => {
  const lowerDest = destination.toLowerCase();

  const fallbackMap: FallbackWeatherMap = {
    // European cities - summer
    'paris': { temp: 75, tempMin: 68, tempMax: 82, description: 'partly cloudy', icon: '02d', humidity: 65 },
    'london': { temp: 72, tempMin: 65, tempMax: 79, description: 'cloudy', icon: '04d', humidity: 70 },
    'barcelona': { temp: 82, tempMin: 75, tempMax: 89, description: 'sunny', icon: '01d', humidity: 55 },
    'rome': { temp: 84, tempMin: 77, tempMax: 91, description: 'sunny', icon: '01d', humidity: 50 },
    'amsterdam': { temp: 70, tempMin: 63, tempMax: 77, description: 'partly cloudy', icon: '02d', humidity: 72 },

    // Tropical destinations
    'bali': { temp: 85, tempMin: 78, tempMax: 92, description: 'partly cloudy', icon: '02d', humidity: 80 },
    'caribbean': { temp: 88, tempMin: 82, tempMax: 94, description: 'sunny', icon: '01d', humidity: 75 },
    'miami': { temp: 88, tempMin: 82, tempMax: 94, description: 'sunny', icon: '01d', humidity: 78 },
    'cancun': { temp: 86, tempMin: 80, tempMax: 92, description: 'sunny', icon: '01d', humidity: 76 },

    // Mediterranean
    'greece': { temp: 84, tempMin: 77, tempMax: 91, description: 'sunny', icon: '01d', humidity: 52 },
    'greece, athens': { temp: 84, tempMin: 77, tempMax: 91, description: 'sunny', icon: '01d', humidity: 52 },
    'greece, santorini': { temp: 82, tempMin: 75, tempMax: 89, description: 'sunny', icon: '01d', humidity: 58 },
    'italy': { temp: 82, tempMin: 75, tempMax: 89, description: 'sunny', icon: '01d', humidity: 55 },
    'spain': { temp: 80, tempMin: 73, tempMax: 87, description: 'sunny', icon: '01d', humidity: 54 },

    // Asia
    'tokyo': { temp: 78, tempMin: 71, tempMax: 85, description: 'partly cloudy', icon: '02d', humidity: 68 },
    'bangkok': { temp: 90, tempMin: 84, tempMax: 96, description: 'partly cloudy', icon: '02d', humidity: 82 },
    'singapore': { temp: 88, tempMin: 82, tempMax: 94, description: 'partly cloudy', icon: '02d', humidity: 80 },

    // US destinations
    'new york': { temp: 76, tempMin: 69, tempMax: 83, description: 'partly cloudy', icon: '02d', humidity: 68 },
    'los angeles': { temp: 78, tempMin: 70, tempMax: 85, description: 'sunny', icon: '01d', humidity: 45 },
    'san francisco': { temp: 72, tempMin: 65, tempMax: 78, description: 'partly cloudy', icon: '02d', humidity: 62 },
  };

  // Exact match first
  if (fallbackMap[lowerDest]) {
    return fallbackMap[lowerDest];
  }

  // Check if destination contains any known city
  for (const [city, weather] of Object.entries(fallbackMap)) {
    if (lowerDest.includes(city)) {
      return weather;
    }
  }

  // Default fallback for unknown destinations
  return {
    temp: 72,
    tempMin: 65,
    tempMax: 80,
    description: 'partly cloudy',
    icon: '02d',
    humidity: 55,
  };
};

export async function POST(request: Request) {
  try {
    const { destination, startDate, endDate } = await request.json();

    if (!destination) {
      return NextResponse.json(
        { error: 'Destination is required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENWEATHERMAP_API_KEY;

    // If no API key, return fallback weather
    if (!apiKey) {
      const fallbackWeather = getFallbackWeather(destination);
      return NextResponse.json(fallbackWeather);
    }

    try {
      // Geocode the destination
      const geoResponse = await fetch(
        `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(
          destination
        )}&limit=1&appid=${apiKey}`
      );

      if (!geoResponse.ok) {
        console.warn('Geocoding failed, using fallback weather');
        const fallbackWeather = getFallbackWeather(destination);
        return NextResponse.json(fallbackWeather);
      }

      const geoData = await geoResponse.json();

      if (!geoData || geoData.length === 0) {
        console.warn('Geocoding returned no results, using fallback weather');
        const fallbackWeather = getFallbackWeather(destination);
        return NextResponse.json(fallbackWeather);
      }

      const { lat, lon } = geoData[0];

      // Get weather data
      const weatherResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=imperial&appid=${apiKey}`
      );

      if (!weatherResponse.ok) {
        console.warn('Weather fetch failed, using fallback weather');
        const fallbackWeather = getFallbackWeather(destination);
        return NextResponse.json(fallbackWeather);
      }

      const weatherData = await weatherResponse.json();

      const result: WeatherResponse = {
        temp: Math.round(weatherData.main.temp),
        tempMin: Math.round(weatherData.main.temp_min),
        tempMax: Math.round(weatherData.main.temp_max),
        description: weatherData.weather[0].main,
        icon: weatherData.weather[0].icon,
        humidity: weatherData.main.humidity,
      };

      return NextResponse.json(result);
    } catch (apiError) {
      console.error('OpenWeatherMap API error:', apiError);
      const fallbackWeather = getFallbackWeather(destination);
      return NextResponse.json(fallbackWeather);
    }
  } catch (error) {
    console.error('Error processing weather request:', error);
    return NextResponse.json(
      { error: 'Failed to process weather request' },
      { status: 500 }
    );
  }
}
