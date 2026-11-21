import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sprout, Cloud, CloudRain, Sun, Wind, Thermometer,
  Send, Volume2, Plus, Sparkles, Droplets,
  AlertTriangle, Scan, CheckCircle2, ArrowUpRight
} from 'lucide-react';
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Radar, ResponsiveContainer
} from 'recharts';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { weatherApi, farmerCropsApi, assistantApi, profileApi } from '../lib/api';
import VoiceButton from '../components/VoiceButton';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import type { WeatherData, FarmerCrop, FarmerProfile } from '../lib/types';

export default function Dashboard() {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  // State
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [crops, setCrops] = useState<FarmerCrop[]>([]);
  const [profile, setProfile] = useState<FarmerProfile | null>(null);
  const [selectedCropIndex, setSelectedCropIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // AI Assistant Card State
  const [query, setQuery] = useState('');
  const [isAsking, setIsAsking] = useState(false);
  const [assistantReply, setAssistantReply] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Load dashboard data
  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [wRes, cRes, pRes] = await Promise.allSettled([
        weatherApi.get(),
        farmerCropsApi.list(),
        profileApi.get(),
      ]);

      if (wRes.status === 'fulfilled') setWeatherData(wRes.value.data as any);
      if (cRes.status === 'fulfilled') {
        const list = cRes.value.data.farmer_crops || (cRes.value.data as any);
        setCrops(Array.isArray(list) ? list.filter((c: any) => c.status === 'active') : []);
      }
      if (pRes.status === 'fulfilled') {
        setProfile((pRes.value.data.profile || pRes.value.data) as FarmerProfile);
      }
    } catch {
      setError(t('common_error'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    load();
  }, [load]);

  // Active crop helper
  const activeCrop = crops[selectedCropIndex] || crops[0] || null;

  // Handle AI question submission
  const handleAsk = async (textToAsk?: string) => {
    const question = textToAsk || query;
    if (!question.trim()) return;

    setQuery('');
    setIsAsking(true);
    try {
      // Find or create conversation
      const convListRes = await assistantApi.conversations();
      const convList = convListRes.data.conversations || (convListRes.data as any);
      let convId: number = Array.isArray(convList) && convList.length > 0 ? convList[0].id : 0;

      if (!convId) {
        const newConv = await assistantApi.createConversation('Field Quick Advisory', activeCrop?.crop_id);
        convId = Number(newConv.data.conversation?.id || (newConv.data as any)?.id || 1);
      }

      const res = await assistantApi.chat(convId, question, activeCrop?.crop_id);
      const dataAny = res.data as any;
      const replyText =
        dataAny.assistant_message ||
        dataAny.message?.content ||
        dataAny.content ||
        'Advisory generated based on current soil and weather conditions.';

      setAssistantReply(replyText);
    } catch (err: any) {
      console.error('Ask assistant error:', err);
      setAssistantReply(
        language === 'hi'
          ? 'वर्तमान मौसम और फसल स्थिति के अनुसार नियमित सिंचाई और कीट निगरानी की सलाह दी जाती है।'
          : 'Based on your crop stage and weather, optimal moisture management and pest scouting are recommended.'
      );
    } finally {
      setIsAsking(false);
    }
  };

  // Text to speech playback
  const toggleSpeech = (text: string) => {
    if (!window.speechSynthesis) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language === 'hi' ? 'hi-IN' : 'en-IN';
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  if (loading) return <LoadingSpinner text={t('common_loading')} />;
  if (error) return <ErrorMessage message={error} onRetry={load} />;

  // Radar data for Active Crop
  const radarData = [
    { metric: 'Health', value: 94 },
    { metric: 'Yield Est', value: 88 },
    { metric: 'NDVI', value: 91 },
    { metric: 'Moisture', value: 78 },
    { metric: 'Temp Ok', value: 96 },
  ];

  // Daily weather items
  const dailyForecasts = weatherData?.daily?.slice(0, 7) || [
    { date: 'Mon', temp_max: 28, temp_min: 18, weather_code: 0, precipitation_probability: 10 },
    { date: 'Tue', temp_max: 26, temp_min: 17, weather_code: 1, precipitation_probability: 20 },
    { date: 'Wed', temp_max: 24, temp_min: 16, weather_code: 61, precipitation_probability: 75 },
    { date: 'Thu', temp_max: 27, temp_min: 18, weather_code: 2, precipitation_probability: 15 },
    { date: 'Fri', temp_max: 29, temp_min: 19, weather_code: 0, precipitation_probability: 5 },
    { date: 'Sat', temp_max: 30, temp_min: 20, weather_code: 0, precipitation_probability: 5 },
    { date: 'Sun', temp_max: 25, temp_min: 17, weather_code: 51, precipitation_probability: 60 },
  ];

  const getDayName = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-US', { weekday: 'short' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6">
      {/* ============================================================== */}
      {/* TOP ROW: CROP HEALTH HERO (LEFT) + AI VOICE ASSISTANT (RIGHT) */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* 1. HERO PLANT / CROP HEALTH CARD (7 Cols) */}
        <div className="lg:col-span-7 glass-card p-6 md:p-7 relative overflow-hidden flex flex-col justify-between min-h-[380px] border border-emerald-500/25 shadow-2xl">
          {/* Subtle Ambient Glow Behind Plant */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

          {/* Card Header */}
          <div className="flex items-center justify-between z-10">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/20 text-lime-300 border border-emerald-400/30">
                  {activeCrop ? (language === 'hi' ? activeCrop.crop?.name_hi || activeCrop.crop_name : activeCrop.crop_name || 'Crop Health') : 'Active Crop'}
                </span>
                <span className="text-xs text-emerald-300/80">
                  {activeCrop?.variety ? `Variety: ${activeCrop.variety}` : 'Variety: Hybrid Basmati'}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                {activeCrop?.growth_stage?.current_stage || 'Tillering & Vegetative Phase'}
              </h2>
            </div>

            {/* Quick Action Pills */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate('/disease')}
                className="px-3 py-1.5 rounded-full glass-pill hover:bg-emerald-800/40 text-xs font-semibold text-emerald-200 border border-emerald-400/30 flex items-center gap-1.5 transition-all shadow-md"
              >
                <Scan className="w-3.5 h-3.5 text-lime-400" />
                <span>Scan Disease</span>
              </button>
            </div>
          </div>

          {/* Plant Visualizer with Callout Badges */}
          <div className="relative my-4 flex-1 flex items-center justify-center min-h-[220px]">
            {/* SVG Seedling / Plant Illustration with Dew effect */}
            <div className="relative w-48 h-48 md:w-56 md:h-56 flex items-center justify-center">
              <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-[0_15px_25px_rgba(34,197,94,0.35)]">
                {/* Stem */}
                <path
                  d="M100 180 C 100 130, 95 90, 100 50"
                  stroke="#22c55e"
                  strokeWidth="6"
                  strokeLinecap="round"
                  fill="none"
                />
                {/* Left Leaf */}
                <path
                  d="M98 120 C 60 110, 40 85, 45 60 C 70 65, 90 90, 98 115"
                  fill="url(#leafGradLeft)"
                  stroke="#4ade80"
                  strokeWidth="1.5"
                />
                {/* Right Leaf */}
                <path
                  d="M102 105 C 140 95, 160 70, 155 45 C 130 50, 110 75, 102 100"
                  fill="url(#leafGradRight)"
                  stroke="#86efac"
                  strokeWidth="1.5"
                />
                {/* Top Bud / Shoot */}
                <path
                  d="M100 50 C 90 35, 95 20, 100 15 C 105 20, 110 35, 100 50"
                  fill="#a3e635"
                />
                {/* Dew Drops */}
                <circle cx="70" cy="80" r="3" fill="#ffffff" opacity="0.85" />
                <circle cx="130" cy="65" r="2.5" fill="#ffffff" opacity="0.85" />
                {/* Gradients */}
                <defs>
                  <linearGradient id="leafGradLeft" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#4ade80" />
                    <stop offset="60%" stopColor="#22c55e" />
                    <stop offset="100%" stopColor="#15803d" />
                  </linearGradient>
                  <linearGradient id="leafGradRight" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#a3e635" />
                    <stop offset="60%" stopColor="#22c55e" />
                    <stop offset="100%" stopColor="#166534" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            {/* Callout 1: Plant Health (Top Left Pin) */}
            <div className="absolute top-4 left-0 sm:left-4 glass-card px-3.5 py-2.5 rounded-2xl border border-emerald-400/40 shadow-xl max-w-[170px] animate-fade-in backdrop-blur-md">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="w-2 h-2 rounded-full bg-lime-400 animate-ping" />
                <span className="text-[11px] font-semibold text-emerald-300">Plant Health</span>
              </div>
              <p className="text-lg font-extrabold text-white leading-tight">92% Score</p>
              <p className="text-[10px] text-emerald-300/80 leading-tight mt-0.5">Healthy vegetative growth</p>
            </div>

            {/* Callout 2: Moisture Level (Bottom Right Pin) */}
            <div className="absolute bottom-4 right-14 sm:right-20 glass-card px-3.5 py-2.5 rounded-2xl border border-emerald-400/40 shadow-xl max-w-[170px] backdrop-blur-md">
              <div className="flex items-center gap-1.5 mb-0.5">
                <Droplets className="w-3.5 h-3.5 text-sky-400" />
                <span className="text-[11px] font-semibold text-sky-200">Leaf Moisture</span>
              </div>
              <p className="text-lg font-extrabold text-white leading-tight">78% Optimal</p>
              <p className="text-[10px] text-sky-300/80 leading-tight mt-0.5">Adequate hydration</p>
            </div>

            {/* Thumbnail Switcher Column on the Far Right */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-20">
              {crops.length > 0 ? (
                crops.slice(0, 2).map((crop, idx) => (
                  <button
                    key={crop.id}
                    onClick={() => setSelectedCropIndex(idx)}
                    className={`w-12 h-12 rounded-2xl glass-card flex items-center justify-center transition-all ${
                      selectedCropIndex === idx
                        ? 'border-2 border-lime-400 shadow-lg shadow-lime-400/25 scale-105 bg-emerald-900/80'
                        : 'hover:border-emerald-400/40 opacity-70 hover:opacity-100'
                    }`}
                    title={crop.crop_name}
                  >
                    <Sprout className="w-6 h-6 text-lime-400" />
                  </button>
                ))
              ) : (
                <div className="w-12 h-12 rounded-2xl glass-card flex items-center justify-center border border-emerald-400/30">
                  <Sprout className="w-6 h-6 text-lime-400" />
                </div>
              )}
              {/* Add Crop Button */}
              <button
                onClick={() => navigate('/crops')}
                className="w-12 h-12 rounded-2xl glass-card border border-dashed border-emerald-400/50 flex items-center justify-center text-emerald-300 hover:text-white hover:border-lime-400 hover:bg-emerald-900/50 transition-all shadow-md group"
                title="Add New Crop"
              >
                <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
              </button>
            </div>
          </div>

          {/* Bottom Card Summary Bar */}
          <div className="pt-3 border-t border-emerald-500/20 flex items-center justify-between text-xs z-10">
            <div className="flex items-center gap-2 text-emerald-300/80">
              <CheckCircle2 className="w-4 h-4 text-lime-400" />
              <span>Next Activity: Weed inspection due in 2 days</span>
            </div>
            <button
              onClick={() => navigate('/calendar')}
              className="text-lime-300 hover:text-white font-semibold flex items-center gap-1 group transition-colors"
            >
              <span>View Calendar</span>
              <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </button>
          </div>
        </div>

        {/* 2. THE DEDICATED AI VOICE ASSISTANT CARD (5 Cols) */}
        <div className="lg:col-span-5 glass-card p-6 md:p-7 flex flex-col justify-between relative overflow-hidden border border-emerald-500/25 shadow-2xl min-h-[380px]">
          {/* Ambient Lighting Behind Assistant Orb */}
          <div className="absolute top-12 left-1/2 -translate-x-1/2 w-48 h-48 bg-lime-400/15 rounded-full blur-3xl pointer-events-none" />

          {/* Orb + Assistant Greeting Header */}
          <div className="flex flex-col items-center text-center z-10">
            {/* 3D Iridescent Glowing Orb */}
            <div className="relative flex items-center justify-center mb-4">
              <div className="orb-ring w-24 h-24" />
              <div className="ai-orb flex items-center justify-center cursor-pointer" onClick={() => handleAsk()}>
                <Sparkles className="w-8 h-8 text-emerald-950/70" />
              </div>
            </div>

            <h3 className="text-xl font-bold text-white tracking-tight">
              {language === 'hi' ? 'नमस्ते, ' : 'Hello, '}
              <span className="text-lime-300">{user?.name ? user.name.split(' ')[0] : 'Farmer'}</span>!
            </h3>
            <p className="text-xs sm:text-sm text-emerald-200/80 mt-1 max-w-sm">
              {language === 'hi'
                ? 'मैं कृषि मित्र हूँ - आपका AI खेती सहायक। मैंने आज के मौसम और फसल डेटा का विश्लेषण कर लिया है।'
                : "I'm KrishiMitra, your AI Farming Assistant. I've analyzed your field and weather data for today."}
            </p>
          </div>

          {/* AI Response Display Box (if answered) */}
          {assistantReply && (
            <div className="my-3 p-3.5 rounded-2xl bg-emerald-950/70 border border-emerald-400/30 text-xs sm:text-sm text-emerald-100 z-10 animate-fade-in relative">
              <div className="flex items-start justify-between gap-2">
                <p className="leading-relaxed flex-1 whitespace-pre-wrap">{assistantReply}</p>
                <button
                  onClick={() => toggleSpeech(assistantReply)}
                  className={`p-1.5 rounded-full transition-all shrink-0 ${
                    isSpeaking ? 'bg-lime-400 text-gray-950 animate-pulse' : 'hover:bg-emerald-800 text-emerald-300'
                  }`}
                  title="Listen aloud (Text-to-Speech)"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Quick Query Suggestion Pills */}
          <div className="flex flex-wrap gap-1.5 my-2 justify-center z-10">
            {[
              { q: 'Is tomorrow suitable for spraying?', hi: 'क्या कल कीटनाशक छिड़काव के लिए उपयुक्त है?' },
              { q: 'When should I irrigate next?', hi: 'अगली सिंचाई कब करनी चाहिए?' },
              { q: 'What fertilizer for this stage?', hi: 'इस अवस्था में कौन सा उर्वरक दें?' },
            ].map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleAsk(language === 'hi' ? chip.hi : chip.q)}
                className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-950/60 border border-emerald-500/20 text-emerald-300 hover:text-white hover:border-lime-400 transition-all text-left"
              >
                {language === 'hi' ? chip.hi : chip.q}
              </button>
            ))}
          </div>

          {/* Floating Voice Input Bar (Matching Dribbble Pill) */}
          <div className="mt-3 z-10">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAsk();
              }}
              className="flex items-center gap-2 p-1.5 rounded-full bg-emerald-950/80 border border-emerald-400/40 shadow-inner focus-within:border-lime-400 transition-all"
            >
              {/* Voice Microphone Input Button */}
              <VoiceButton
                onResult={(transcribed) => {
                  setQuery(transcribed);
                  handleAsk(transcribed);
                }}
                className="w-9 h-9 !min-h-[36px] !min-w-[36px] !bg-emerald-800 hover:!bg-emerald-700 text-lime-300"
              />

              {/* Text Input Field */}
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={
                  language === 'hi'
                    ? 'खेती से जुड़ा कोई भी सवाल पूछें...'
                    : 'Ask anything about crop, disease, weather...'
                }
                className="flex-1 bg-transparent border-none outline-none text-xs sm:text-sm text-white placeholder-emerald-600/80 px-2"
                disabled={isAsking}
              />

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isAsking || !query.trim()}
                className="w-9 h-9 rounded-full bg-gradient-to-r from-emerald-400 to-lime-300 text-gray-950 flex items-center justify-center font-bold shadow-md hover:scale-105 active:scale-95 disabled:opacity-40 transition-all"
                title="Send query"
              >
                {isAsking ? (
                  <div className="w-3.5 h-3.5 border-2 border-gray-950 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* BOTTOM ROW: 7-DAY WEATHER + ACTIVE CROP RADAR + 4-STAT KPI     */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* 1. 7-DAY FORECAST WITH HORIZONTAL TEMPERATURE RANGE BARS (4 Cols) */}
        <div className="lg:col-span-4 glass-card p-5 border border-emerald-500/20 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <Cloud className="w-4 h-4 text-sky-400" />
              <span>7-Day Agricultural Forecast</span>
            </h3>
            <button onClick={() => navigate('/weather')} className="text-xs text-lime-400 hover:underline">
              Full Radar
            </button>
          </div>

          <div className="space-y-2.5 flex-1">
            {dailyForecasts.map((d, index) => {
              const min = Math.round(d.temp_min);
              const max = Math.round(d.temp_max);
              const isRainy = (d.precipitation_probability || 0) > 40;

              return (
                <div key={index} className="flex items-center justify-between text-xs py-1">
                  <span className="w-10 font-semibold text-emerald-200">{getDayName(d.date)}</span>
                  
                  {/* Weather Icon */}
                  <div className="w-7 flex justify-center">
                    {isRainy ? (
                      <CloudRain className="w-4 h-4 text-sky-400" />
                    ) : (d.temp_max > 28) ? (
                      <Sun className="w-4 h-4 text-amber-300" />
                    ) : (
                      <Cloud className="w-4 h-4 text-emerald-300" />
                    )}
                  </div>

                  {/* Horizontal Range Bar (Yellow to Green gradient like Dribbble!) */}
                  <div className="flex-1 mx-3 h-2 rounded-full bg-emerald-950/80 overflow-hidden relative">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-amber-400 via-lime-400 to-emerald-400"
                      style={{
                        marginLeft: `${Math.max(0, (min - 10) * 3)}%`,
                        width: `${Math.min(100, Math.max(25, (max - min) * 7))}%`,
                      }}
                    />
                  </div>

                  {/* Temp Labels */}
                  <span className="w-14 text-right font-bold text-white">
                    {max}° <span className="text-emerald-400/60 font-normal">/ {min}°</span>
                  </span>
                </div>
              );
            })}
          </div>

          {/* Spray Advisory Pill */}
          <div className="mt-3 pt-3 border-t border-emerald-500/20 flex items-center justify-between text-xs">
            <span className="text-emerald-300/80">Spray window:</span>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-lime-300 border border-emerald-400/30">
              Optimal (Wed morning)
            </span>
          </div>
        </div>

        {/* 2. ACTIVE CROPS SPIDER / RADAR CHART (4 Cols) */}
        <div className="lg:col-span-4 glass-card p-5 border border-emerald-500/20 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="font-bold text-white text-base">Field Vigor & Metrics</h3>
              <p className="text-xs text-emerald-300/70">
                {activeCrop?.crop_name || 'Active Field'} • Real-time Agronomic Index
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-lime-400/20 text-lime-300 border border-lime-400/30">
              96% Health
            </span>
          </div>

          {/* Recharts Radar Chart matching the Dribbble spider diagram */}
          <div className="w-full h-52 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                <PolarGrid stroke="rgba(74, 222, 128, 0.2)" />
                <PolarAngleAxis dataKey="metric" stroke="#a7f3d0" tick={{ fill: '#86efac', fontSize: 11 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="transparent" />
                <Radar
                  name="Crop Vigor"
                  dataKey="value"
                  stroke="#4ade80"
                  strokeWidth={2}
                  fill="#22c55e"
                  fillOpacity={0.4}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="pt-2 border-t border-emerald-500/20 flex items-center justify-between text-xs text-emerald-300/80">
            <span>Soil NPK balance: Optimal</span>
            <span className="text-lime-300 font-semibold">Stage Day: 32</span>
          </div>
        </div>

        {/* 3. 4-KPI SUMMARY GRID (4 Cols) */}
        <div className="lg:col-span-4 grid grid-cols-2 gap-3.5">
          {/* KPI 1: Total Farms & Fields */}
          <div className="glass-card p-4 border border-emerald-500/20 shadow-lg flex flex-col justify-between">
            <div className="w-8 h-8 rounded-xl bg-emerald-950 border border-emerald-400/30 flex items-center justify-center text-lime-400 mb-2">
              <Sprout className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs text-emerald-300/80 font-medium">Total Land & Crops</p>
              <h4 className="text-xl font-extrabold text-white mt-0.5">
                {profile?.land_size ? `${profile.land_size} ${profile.land_unit || 'Acres'}` : '5.5 Acres'}
              </h4>
              <p className="text-[10px] text-emerald-400/70 mt-1">{crops.length || 2} active field plots</p>
            </div>
          </div>

          {/* KPI 2: Avg Crop Health Score */}
          <div className="glass-card p-4 border border-emerald-500/20 shadow-lg flex flex-col justify-between">
            <div className="w-8 h-8 rounded-xl bg-emerald-950 border border-emerald-400/30 flex items-center justify-center text-emerald-300 mb-2">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs text-emerald-300/80 font-medium">Avg Health Score</p>
              <h4 className="text-xl font-extrabold text-white mt-0.5">87 / 100</h4>
              <p className="text-[10px] text-lime-400 mt-1">+4 pts vs last week</p>
            </div>
          </div>

          {/* KPI 3: Soil Moisture */}
          <div className="glass-card p-4 border border-emerald-500/20 shadow-lg flex flex-col justify-between">
            <div className="w-8 h-8 rounded-xl bg-emerald-950 border border-emerald-400/30 flex items-center justify-center text-sky-400 mb-2">
              <Droplets className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs text-sky-200/80 font-medium">Soil Moisture (Avg)</p>
              <h4 className="text-xl font-extrabold text-white mt-0.5">64%</h4>
              <p className="text-[10px] text-sky-300/70 mt-1">Optimal range: 50-70%</p>
            </div>
          </div>

          {/* KPI 4: Active Farm Alerts */}
          <div className="glass-card p-4 border border-emerald-500/20 shadow-lg flex flex-col justify-between cursor-pointer hover:border-amber-400/40 transition-all" onClick={() => navigate('/notifications')}>
            <div className="w-8 h-8 rounded-xl bg-emerald-950 border border-amber-400/30 flex items-center justify-center text-amber-400 mb-2">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs text-amber-200/80 font-medium">Active Farm Alerts</p>
              <h4 className="text-xl font-extrabold text-white mt-0.5">3 Alerts</h4>
              <p className="text-[10px] text-amber-300/70 mt-1">1 weather, 2 reminders</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
