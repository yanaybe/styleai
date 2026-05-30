export interface WeatherData {
  temp: number;
  feelsLike: number;
  humidity: number;
  description: string;
  weatherCode: number;
  windSpeed: number;
  precipitationProbability: number;
  uvIndex: number;
  sunrise: string;
  sunset: string;
}

const WEATHER_CODES: Record<number, string> = {
  1000: "Clear, sunny",
  1100: "Mostly clear",
  1101: "Partly cloudy",
  1102: "Mostly cloudy",
  1001: "Cloudy",
  2000: "Foggy",
  4000: "Drizzle",
  4001: "Rain",
  4200: "Light rain",
  4201: "Heavy rain",
  5000: "Snow",
  5001: "Flurries",
  5100: "Light snow",
  5101: "Heavy snow",
  6000: "Freezing drizzle",
  6200: "Light freezing rain",
  6201: "Freezing rain",
  7000: "Ice pellets",
  7101: "Heavy ice pellets",
  7102: "Light ice pellets",
  8000: "Thunderstorm",
};

export async function getWeatherForecast(
  city: string,
  country: string
): Promise<WeatherData | null> {
  if (!process.env.TOMORROW_IO_API_KEY) return null;

  try {
    const location = `${city}, ${country}`;
    const res = await fetch(
      `https://api.tomorrow.io/v4/weather/forecast?location=${encodeURIComponent(location)}&timesteps=1d&apikey=${process.env.TOMORROW_IO_API_KEY}`,
      { next: { revalidate: 3600 } }
    );

    if (!res.ok) return null;

    const data = await res.json();
    const today = data.timelines?.daily?.[0]?.values;
    if (!today) return null;

    return {
      temp: Math.round(today.temperatureAvg ?? 20),
      feelsLike: Math.round(today.temperatureApparentAvg ?? 20),
      humidity: Math.round(today.humidityAvg ?? 50),
      description: WEATHER_CODES[today.weatherCodeMax] ?? "Clear",
      weatherCode: today.weatherCodeMax ?? 1000,
      windSpeed: Math.round(today.windSpeedAvg ?? 0),
      precipitationProbability: Math.round(today.precipitationProbabilityAvg ?? 0),
      uvIndex: Math.round(today.uvIndexAvg ?? 0),
      sunrise: today.sunriseTime ?? "",
      sunset: today.sunsetTime ?? "",
    };
  } catch {
    return null;
  }
}

export function getWeatherEmoji(weatherCode: number): string {
  if (weatherCode === 1000) return "☀️";
  if (weatherCode <= 1102) return "⛅";
  if (weatherCode === 1001) return "☁️";
  if (weatherCode <= 2000) return "🌫️";
  if (weatherCode <= 4201) return "🌧️";
  if (weatherCode <= 5101) return "❄️";
  if (weatherCode === 8000) return "⛈️";
  return "🌤️";
}

export function getOutfitWeatherAdvice(weather: WeatherData): string {
  const tips: string[] = [];

  if (weather.temp < 10) tips.push("Layer up with a warm coat");
  else if (weather.temp < 18) tips.push("A light jacket works perfectly");
  else if (weather.temp > 28) tips.push("Light, breathable fabrics");

  if (weather.precipitationProbability > 50) tips.push("Don't forget an umbrella");
  if (weather.uvIndex > 6) tips.push("UV is high — consider light coverage");
  if (weather.windSpeed > 30) tips.push("Windy — avoid loose flowy pieces");

  return tips.join(". ");
}
