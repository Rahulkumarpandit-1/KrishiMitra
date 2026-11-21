import { Cloud, Sun, CloudRain, CloudDrizzle, CloudLightning, CloudFog, Snowflake, CloudSun } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import type { WeatherCurrent } from '../lib/types';

function getWeatherIcon(code: number) {
  if (code === 0 || code === 1) return <Sun className="w-10 h-10 text-yellow-500" />;
  if (code === 2) return <CloudSun className="w-10 h-10 text-gray-500" />;
  if (code === 3) return <Cloud className="w-10 h-10 text-gray-500" />;
  if (code >= 45 && code <= 48) return <CloudFog className="w-10 h-10 text-gray-400" />;
  if (code >= 51 && code <= 55) return <CloudDrizzle className="w-10 h-10 text-blue-400" />;
  if (code >= 61 && code <= 67) return <CloudRain className="w-10 h-10 text-blue-500" />;
  if (code >= 71 && code <= 77) return <Snowflake className="w-10 h-10 text-blue-200" />;
  if (code >= 80 && code <= 82) return <CloudRain className="w-10 h-10 text-blue-600" />;
  if (code >= 95) return <CloudLightning className="w-10 h-10 text-yellow-600" />;
  return <Sun className="w-10 h-10 text-yellow-500" />;
}

function getWeatherLabel(code: number, t: (k: any) => string): string {
  if (code === 0 || code === 1) return t('weather_sunny');
  if (code === 2) return t('weather_partly_cloudy');
  if (code === 3) return t('weather_cloudy');
  if (code >= 45 && code <= 48) return t('weather_foggy');
  if (code >= 51 && code <= 55) return t('weather_drizzle');
  if (code >= 61 && code <= 67) return t('weather_rainy');
  if (code >= 71 && code <= 77) return t('weather_snow');
  if (code >= 80 && code <= 82) return t('weather_rainy');
  if (code >= 95) return t('weather_thunderstorm');
  return t('weather_sunny');
}

interface WeatherCardProps {
  weather: WeatherCurrent | null;
  loading?: boolean;
}

export default function WeatherCard({ weather, loading }: WeatherCardProps) {
  const { t } = useLanguage();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="card animate-pulse">
        <div className="h-20 bg-gray-200 rounded-lg" />
      </div>
    );
  }

  if (!weather) return null;

  return (
    <button
      onClick={() => navigate('/weather')}
      className="card w-full text-left glass-card-hover border border-emerald-500/20"
    >
      <p className="text-xs font-semibold text-emerald-300 uppercase tracking-wider mb-2">{t('dashboard_weather')}</p>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {getWeatherIcon(weather.weather_code)}
          <div>
            <p className="text-3xl font-extrabold text-white">{Math.round(weather.temperature)}°C</p>
            <p className="text-xs text-emerald-300/80">{getWeatherLabel(weather.weather_code, t)}</p>
          </div>
        </div>
        <div className="text-right text-xs text-emerald-200/80 space-y-1">
          <p>{t('weather_humidity')}: <span className="font-bold text-white">{weather.humidity}%</span></p>
          <p>{t('weather_wind')}: <span className="font-bold text-white">{weather.wind_speed} km/h</span></p>
        </div>
      </div>
    </button>
  );
}

export { getWeatherIcon, getWeatherLabel };
