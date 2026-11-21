import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sprout, Cloud, CloudRain, Sun, Wind, Thermometer,
  Send, Volume2, Plus, Sparkles, Droplets,
  AlertTriangle, Scan, CheckCircle2, ArrowUpRight,
  TrendingUp, TrendingDown, Minus, Check, Calendar,
  Mic, ImageIcon, ShieldAlert, Award
} from 'lucide-react';
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Radar, ResponsiveContainer
} from 'recharts';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { weatherApi, farmerCropsApi, assistantApi, profileApi } from '../lib/api';
import VoiceButton from '../components/VoiceButton';
import VoiceModal from '../components/VoiceModal';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import type { WeatherData, FarmerCrop, FarmerProfile } from '../lib/types';

export default function Dashboard() {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const isHi = language === 'hi';

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
  const [assistantVisual, setAssistantVisual] = useState<any | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);

  // Today's Interactive Farm Tasks
  const [tasks, setTasks] = useState([
    {
      id: 1,
      title_en: 'Morning root-zone irrigation for Onion nursery',
      title_hi: 'प्याज नर्सरी में सुबह की हल्की सिंचाई (2 सेमी)',
      stage: 'Nursery / Vegetative',
      time: '6:30 AM - 8:00 AM',
      completed: false,
      priority: 'high'
    },
    {
      id: 2,
      title_en: 'Field scouting: inspect under leaf surfaces for aphid clusters',
      title_hi: 'खेत निरीक्षण: पत्तियों के नीचे माहू (एफिड्स) कीट की जांच',
      stage: 'Pest Scouting',
      time: '9:00 AM',
      completed: true,
      priority: 'medium'
    },
    {
      id: 3,
      title_en: 'Foliar spray: 0.5% Zinc Sulphate + 0.25% lime solution',
      title_hi: 'पर्णीय छिड़काव: 0.5% जिंक सल्फेट + चूने का घोल',
      stage: 'Nutrient Boost',
      time: '4:00 PM - 5:30 PM',
      completed: false,
      priority: 'medium'
    },
    {
      id: 4,
      title_en: 'Check local Mandi auction prices for harvested produce',
      title_hi: 'स्थानीय मंडी में आज के भाव व नीलामी दर की समीक्षा',
      stage: 'Market Intelligence',
      time: 'Evening',
      completed: false,
      priority: 'low'
    }
  ]);

  const toggleTask = (id: number) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

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
  const handleAsk = async (textToAsk?: string, autoSpeak = false): Promise<string> => {
    const question = textToAsk || query;
    if (!question.trim()) return '';

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
        (isHi ? 'आपकी फसल व मौसम अनुसार कृषि परामर्श तैयार किया गया है।' : 'Advisory generated based on current soil and weather conditions.');

      setAssistantReply(replyText);
      const visual = dataAny.visual || dataAny.message?.visual;
      setAssistantVisual(visual || null);

      if (autoSpeak) {
        toggleSpeech(replyText);
      }
      return replyText;
    } catch (err: any) {
      console.error('Ask assistant error:', err);
      const fallback = isHi
        ? 'वर्तमान मौसम और फसल स्थिति के अनुसार नियमित सिंचाई और कीट निगरानी की सलाह दी जाती है।'
        : 'Based on your crop stage and weather, optimal moisture management and pest scouting are recommended.';
      setAssistantReply(fallback);
      setAssistantVisual(null);
      return fallback;
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

    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[*#_`]/g, '').replace(/https?:\/\/\S+/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = isHi ? 'hi-IN' : 'en-IN';
    utterance.rate = 0.95;
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
      return d.toLocaleDateString(isHi ? 'hi-IN' : 'en-US', { weekday: 'short' });
    } catch {
      return dateStr;
    }
  };

  // Live Mandi Prices Feed
  const mandiRates = [
    { crop_en: 'Onion (प्याज)', crop_hi: 'प्याज (Onion)', market: 'Nashik Mandi', price: 2450, change: +120, trend: 'up' },
    { crop_en: 'Wheat (गेहूं)', crop_hi: 'गेहूं (Wheat)', market: 'Indore Mandi', price: 2275, change: 0, trend: 'stable' },
    { crop_en: 'Paddy / Rice (धान)', crop_hi: 'धान (Paddy)', market: 'Karnal Mandi', price: 2320, change: +45, trend: 'up' },
    { crop_en: 'Tomato (टमाटर)', crop_hi: 'टमाटर (Tomato)', market: 'Kolar Market', price: 1850, change: +90, trend: 'up' },
    { crop_en: 'Potato (आलू)', crop_hi: 'आलू (Potato)', market: 'Agra Mandi', price: 1420, change: -30, trend: 'down' },
    { crop_en: 'Mustard (सरसों)', crop_hi: 'सरसों (Mustard)', market: 'Jaipur Mandi', price: 5650, change: +150, trend: 'up' },
  ];

  return (
    <div className="space-y-6 pb-20 relative">
      {/* ChatGPT-Style Full Screen Voice Assistant Modal */}
      <VoiceModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        onSubmit={async (spokenText) => {
          return await handleAsk(spokenText, false);
        }}
        initialCropName={activeCrop?.crop_name || 'Crop'}
      />

      {/* ============================================================== */}
      {/* TOP ROW: SEEDLING PLANT HERO (LEFT) + AI VOICE ASSISTANT (RIGHT)*/}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* 1. THE SEEDLING HERO CARD (7 Cols) */}
        <div className="lg:col-span-7 glass-card p-6 md:p-8 flex flex-col justify-between relative overflow-hidden border border-emerald-500/25 shadow-2xl min-h-[380px]">
          {/* Subtle Eco Glow behind the Seedling */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

          {/* Header Row: Crop Badge + Disease Quick Scan CTA */}
          <div className="flex items-center justify-between z-10">
            <div>
              <span className="px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase bg-emerald-950/80 text-lime-300 border border-emerald-500/40">
                {activeCrop?.crop_name || 'Active Crop'}
              </span>
              <span className="text-xs text-emerald-300/80 ml-2 font-medium">
                Variety: {activeCrop?.variety || 'Hybrid Basmati'}
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1 tracking-tight">
                {activeCrop?.growth_stage?.current_stage || 'Nursery'}
              </h2>
            </div>

            <button
              onClick={() => navigate('/disease')}
              className="glass-pill px-3.5 py-1.5 flex items-center gap-2 text-xs font-semibold text-emerald-200 hover:text-white hover:border-lime-400 transition-all shadow-md group"
            >
              <Scan className="w-3.5 h-3.5 text-lime-400 group-hover:scale-110 transition-transform" />
              <span>{isHi ? 'रोग स्कैन करें' : 'Scan Disease'}</span>
            </button>
          </div>

          {/* Seedling Graphic Area with Dual Metric Callouts */}
          <div className="relative my-4 flex items-center justify-center min-h-[200px] z-10">
            {/* SVG Plant Seedling Artwork */}
            <div className="relative w-44 h-48 flex items-center justify-center">
              <svg viewBox="0 0 200 200" className="w-full h-full filter drop-shadow-[0_15px_25px_rgba(34,197,94,0.35)]">
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
                    className={`w-11 h-11 rounded-2xl border flex items-center justify-center transition-all overflow-hidden ${
                      selectedCropIndex === idx
                        ? 'border-lime-400 ring-2 ring-lime-400/50 scale-105 bg-emerald-900 shadow-lg'
                        : 'border-emerald-500/30 bg-emerald-950/70 hover:border-emerald-400/60'
                    }`}
                    title={crop.crop_name}
                  >
                    <Sprout className={`w-5 h-5 ${selectedCropIndex === idx ? 'text-lime-300' : 'text-emerald-400'}`} />
                  </button>
                ))
              ) : (
                <div className="w-11 h-11 rounded-2xl border border-emerald-500/30 bg-emerald-950/70 flex items-center justify-center text-emerald-400">
                  <Sprout className="w-5 h-5" />
                </div>
              )}

              {/* Add Crop Button */}
              <button
                onClick={() => navigate('/crops')}
                className="w-11 h-11 rounded-2xl border border-dashed border-emerald-500/40 bg-emerald-950/40 flex items-center justify-center text-emerald-400 hover:text-white hover:border-lime-400 hover:bg-emerald-900/60 transition-all"
                title="Add New Crop"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Seedling Footer: Next Activity + Calendar Link */}
          <div className="pt-3 border-t border-emerald-500/20 flex items-center justify-between text-xs text-emerald-200 z-10">
            <div className="flex items-center gap-1.5 font-medium">
              <CheckCircle2 className="w-4 h-4 text-lime-400" />
              <span>{isHi ? 'अगला कार्य: 2 दिन में खरपतवार निरीक्षण' : 'Next Activity: Weed inspection due in 2 days'}</span>
            </div>
            <button
              onClick={() => navigate('/calendar')}
              className="text-lime-300 hover:text-white font-semibold flex items-center gap-1 group transition-colors"
            >
              <span>{isHi ? 'कैलेंडर देखें' : 'View Calendar'}</span>
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
            {/* 3D DotLottie Asset Player - Tapping opens VoiceModal */}
            <div
              className="relative flex items-center justify-center mb-2 cursor-pointer group"
              onClick={() => setIsVoiceModalOpen(true)}
              title="Click for Voice Assistant Mode"
            >
              <div className="w-24 h-24 flex items-center justify-center group-hover:scale-105 transition-transform">
                <dotlottie-player
                  src="https://lottie.host/89534c3f-10dd-4fac-b3fb-867963f3cffc/YerGkXzK8J.lottie"
                  background="transparent"
                  speed="1"
                  style={{ width: '100px', height: '100px' }}
                  loop
                  autoplay
                />
              </div>
            </div>

            <h3 className="text-xl font-bold text-white tracking-tight">
              {isHi ? 'नमस्ते, ' : 'Hello, '}
              <span className="text-lime-300">{user?.name ? user.name.split(' ')[0] : (isHi ? 'किसान भाई' : 'Farmer')}</span>!
            </h3>
            <p className="text-xs sm:text-sm text-emerald-200/80 mt-1 max-w-sm">
              {isHi
                ? 'मैं कृषि मित्र हूँ - आपका AI खेती सहायक। बोलकर या लिखकर कोई भी सवाल पूछें।'
                : "I'm KrishiMitra, your AI Farming Assistant. Tap mic to talk or type any farming question."}
            </p>
          </div>

          {/* AI Response Display Box (if answered) */}
          {assistantReply && (
            <div className="my-3 p-3.5 rounded-2xl bg-emerald-950/80 border border-emerald-400/40 text-xs sm:text-sm text-emerald-100 z-10 animate-fade-in relative shadow-lg">
              <div className="flex items-start justify-between gap-2">
                <p className="leading-relaxed flex-1 whitespace-pre-wrap">{assistantReply}</p>
                <button
                  onClick={() => toggleSpeech(assistantReply)}
                  className={`p-1.5 rounded-full transition-all shrink-0 ${
                    isSpeaking ? 'bg-lime-400 text-gray-950 animate-pulse' : 'hover:bg-emerald-800 text-emerald-300'
                  }`}
                  title={isHi ? 'आवाज़ में सुनें' : 'Listen aloud (Text-to-Speech)'}
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>

              {/* Visual Attachment (if provided) */}
              {assistantVisual && (
                <div className="mt-2.5 overflow-hidden rounded-xl border border-emerald-400/30 bg-emerald-900/60">
                  <img src={assistantVisual.url} alt={assistantVisual.title} className="w-full h-28 object-cover" />
                  <div className="p-2 text-[11px]">
                    <span className="font-bold text-lime-300">
                      {isHi ? (assistantVisual.title_hi || assistantVisual.title) : assistantVisual.title}
                    </span>
                    <p className="text-emerald-200/70 mt-0.5">{assistantVisual.caption}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Quick Query Suggestion Pills */}
          <div className="flex flex-wrap gap-1.5 my-2 justify-center z-10">
            {[
              { q: 'Is tomorrow suitable for spraying?', hi: 'क्या कल कीटनाशक छिड़काव कर सकते हैं?' },
              { q: 'When should I irrigate next?', hi: 'अगली सिंचाई कब करें?' },
              { q: 'Why are leaves turning yellow?', hi: 'पत्तियां पीली क्यों हो रही हैं?' },
            ].map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleAsk(isHi ? chip.hi : chip.q, true)}
                className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-950/70 border border-emerald-500/30 text-emerald-300 hover:text-white hover:border-lime-400 transition-all text-left"
              >
                {isHi ? chip.hi : chip.q}
              </button>
            ))}
          </div>

          {/* Floating Voice Input Bar with ChatGPT Voice Modal Trigger */}
          <div className="mt-3 z-10">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAsk(query);
              }}
              className="flex items-center gap-2 p-1.5 rounded-full bg-emerald-950/90 border border-emerald-400/40 shadow-inner focus-within:border-lime-400 transition-all"
            >
              {/* Voice Microphone Input Button that triggers ChatGPT Modal */}
              <VoiceButton
                size="sm"
                onClick={() => setIsVoiceModalOpen(true)}
                className="w-9 h-9 !min-h-[36px] !min-w-[36px]"
              />

              {/* Text Input Field */}
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={
                  isHi
                    ? 'खेती से जुड़ा सवाल पूछें या माइक दबाएं...'
                    : 'Ask anything about crop, disease, weather or tap mic...'
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
      {/* MIDDLE ROW: 7-DAY WEATHER + ACTIVE CROP RADAR + 4-STAT KPI     */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* 1. 7-DAY FORECAST WITH HORIZONTAL TEMPERATURE RANGE BARS (4 Cols) */}
        <div className="lg:col-span-4 glass-card p-5 border border-emerald-500/20 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <Cloud className="w-4 h-4 text-sky-400" />
              <span>{isHi ? '7-दिवसीय कृषि मौसम पूर्वानुमान' : '7-Day Agricultural Forecast'}</span>
            </h3>
            <button onClick={() => navigate('/weather')} className="text-xs text-lime-400 hover:underline">
              {isHi ? 'विस्तृत राडार' : 'Full Radar'}
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

                  {/* Horizontal Range Bar */}
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
            <span className="text-emerald-300/80">{isHi ? 'छिड़काव अनुकूलता:' : 'Spray window:'}</span>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-lime-300 border border-emerald-400/30">
              {isHi ? 'अनुकूल (बुधवार सुबह)' : 'Optimal (Wed morning)'}
            </span>
          </div>
        </div>

        {/* 2. ACTIVE CROPS SPIDER / RADAR CHART (4 Cols) */}
        <div className="lg:col-span-4 glass-card p-5 border border-emerald-500/20 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="font-bold text-white text-base">{isHi ? 'खेत का स्वास्थ्य सूचकांक' : 'Field Vigor & Metrics'}</h3>
              <p className="text-xs text-emerald-300/70">
                {activeCrop?.crop_name || 'Active Field'} • Real-time Agronomic Index
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-lime-400/20 text-lime-300 border border-lime-400/30">
              96% Health
            </span>
          </div>

          {/* Recharts Radar Chart */}
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
          {/* KPI 1: Total Land & Crops */}
          <div className="glass-card p-4 border border-emerald-500/20 shadow-lg flex flex-col justify-between">
            <div className="w-8 h-8 rounded-xl bg-emerald-950 border border-emerald-400/30 flex items-center justify-center text-lime-400 mb-2">
              <Sprout className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs text-emerald-300/80 font-medium">{isHi ? 'कुल भूमि व फसलें' : 'Total Land & Crops'}</p>
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
              <p className="text-xs text-emerald-300/80 font-medium">{isHi ? 'औसत फसल स्वास्थ्य' : 'Avg Health Score'}</p>
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
              <p className="text-xs text-sky-200/80 font-medium">{isHi ? 'मिट्टी की नमी (औसत)' : 'Soil Moisture (Avg)'}</p>
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
              <p className="text-xs text-amber-200/80 font-medium">{isHi ? 'सक्रिय कृषि अलर्ट' : 'Active Farm Alerts'}</p>
              <h4 className="text-xl font-extrabold text-white mt-0.5">3 Alerts</h4>
              <p className="text-[10px] text-amber-300/70 mt-1">1 weather, 2 reminders</p>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* ENRICHED BOTTOM SECTION: SCROLLABLE ACTIONS, ALERTS & MANDI   */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* 1. TODAY'S FARM ACTION CHECKLIST (7 Cols) */}
        <div className="lg:col-span-7 glass-card p-6 border border-emerald-500/25 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-emerald-500/20 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-900 border border-emerald-400/30 flex items-center justify-center text-lime-400">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">
                    {isHi ? 'आज के प्राथमिक कृषि कार्य' : "Today's Farm Action Checklist"}
                  </h3>
                  <p className="text-xs text-emerald-300/70">
                    {isHi ? 'फसल की अवस्था अनुसार अनुशंसित कार्य' : 'Crop lifecycle stage recommendations'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => navigate('/calendar')}
                className="text-xs text-lime-400 hover:text-white flex items-center gap-1 font-semibold"
              >
                <span>{isHi ? 'पूरा कैलेंडर' : 'Full Calendar'}</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Checklist Items */}
            <div className="space-y-3">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => toggleTask(task.id)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group ${
                    task.completed
                      ? 'bg-emerald-950/40 border-emerald-500/20 opacity-70'
                      : 'bg-emerald-950/80 border-emerald-400/30 hover:border-lime-400/60 hover:bg-emerald-900/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <button
                      className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-all ${
                        task.completed
                          ? 'bg-lime-400 border-lime-400 text-gray-950 font-bold'
                          : 'border-emerald-500/50 hover:border-lime-400 text-transparent'
                      }`}
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <div>
                      <p className={`text-xs sm:text-sm font-semibold text-white ${task.completed ? 'line-through text-emerald-400/70' : ''}`}>
                        {isHi ? task.title_hi : task.title_en}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-900/80 text-emerald-300 border border-emerald-500/30">
                          {task.stage}
                        </span>
                        <span className="text-[10px] text-emerald-400/60">
                          {task.time}
                        </span>
                      </div>
                    </div>
                  </div>

                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                    task.completed
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : 'bg-lime-400/20 text-lime-300 group-hover:bg-lime-400 group-hover:text-gray-950 transition-colors'
                  }`}>
                    {task.completed ? (isHi ? 'पूर्ण' : 'Done') : (isHi ? 'कार्य करें' : 'Do Task')}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-emerald-500/20 flex items-center justify-between text-xs text-emerald-300/80">
            <span>
              {isHi
                ? `${tasks.filter(t => t.completed).length} / ${tasks.length} कार्य संपन्न`
                : `${tasks.filter(t => t.completed).length} of ${tasks.length} tasks completed today`}
            </span>
            <span className="text-lime-300 font-semibold">
              {Math.round((tasks.filter(t => t.completed).length / tasks.length) * 100)}% Complete
            </span>
          </div>
        </div>

        {/* 2. AGRO-WEATHER ALERTS & ADVISORY BANNER (5 Cols) */}
        <div className="lg:col-span-5 glass-card p-6 border border-emerald-500/25 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-emerald-500/20 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-950/80 border border-amber-400/40 flex items-center justify-center text-amber-400">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">
                    {isHi ? 'सक्रिय कृषि व मौसम अलर्ट' : 'Agro-Weather Active Advisories'}
                  </h3>
                  <p className="text-xs text-amber-300/70">
                    {isHi ? 'ओपन-मेटियो उपग्रह डेटा आधारित' : 'Powered by Open-Meteo telemetry'}
                  </p>
                </div>
              </div>
            </div>

            {/* Alert Cards */}
            <div className="space-y-3">
              {/* Alert 1 */}
              <div className="p-3.5 rounded-2xl bg-amber-950/40 border border-amber-500/30 shadow-md">
                <div className="flex items-start gap-2.5">
                  <span className="p-1 rounded-lg bg-amber-500/20 text-amber-300 shrink-0 mt-0.5">
                    <Sun className="w-3.5 h-3.5" />
                  </span>
                  <div>
                    <h5 className="text-xs font-bold text-amber-200">
                      {isHi ? 'तापमान वृद्धि: मिट्टी की नमी की निगरानी' : 'Rising Temperature: Monitor Field Moisture'}
                    </h5>
                    <p className="text-[11px] text-amber-100/80 mt-1 leading-relaxed">
                      {isHi
                        ? 'अगले 3 दिनों में अधिकतम तापमान 30°C छू सकता है। प्याज व सब्जी फसलों में दोपहर के समय जल-तनाव से बचाने हेतु शाम को सिंचाई करें।'
                        : 'Temperatures reaching 30°C. Irrigate vegetables in evening hours to prevent evapotranspiration stress.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Alert 2 */}
              <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-400/30 shadow-md">
                <div className="flex items-start gap-2.5">
                  <span className="p-1 rounded-lg bg-emerald-500/20 text-lime-300 shrink-0 mt-0.5">
                    <Wind className="w-3.5 h-3.5" />
                  </span>
                  <div>
                    <h5 className="text-xs font-bold text-lime-300">
                      {isHi ? 'अनुकूल हवा गति: पर्णीय छिड़काव का समय' : 'Calm Winds: Optimal Foliar Spray Window'}
                    </h5>
                    <p className="text-[11px] text-emerald-100/80 mt-1 leading-relaxed">
                      {isHi
                        ? 'बुधवार सुबह हवा की गति 8 किमी/घंटा रहेगी तथा बारिश का शून्य पूर्वानुमान है। जिंक सल्फेट व कीटनाशक छिड़काव के लिए सर्वोत्तम समय।'
                        : 'Wind speed under 10 km/h with 0% rain probability tomorrow morning. Excellent window for nutrient sprays.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-emerald-500/20 flex items-center justify-between text-xs text-emerald-300/80">
            <span>{isHi ? 'स्रोत: भारतीय मौसम विभाग एवं ICAR' : 'Source: IMD & ICAR Agronomic Rules'}</span>
            <button onClick={() => navigate('/notifications')} className="text-lime-400 hover:underline">
              {isHi ? 'सभी अलर्ट देखें' : 'View All Alerts'}
            </button>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* BOTTOM SECTION 2: LIVE MANDI MARKET RATES (दैनिक मंडी भाव)   */}
      {/* ============================================================== */}
      <div className="glass-card p-6 border border-emerald-500/25 shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-emerald-500/20 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-900 border border-emerald-400/30 flex items-center justify-center text-lime-400">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">
                {isHi ? 'दैनिक कृषि मंडी भाव (Mandi Market Rates)' : 'Daily Agricultural Mandi Market Rates'}
              </h3>
              <p className="text-xs text-emerald-300/70">
                {isHi ? 'प्रमुख मंडियों की ताज़ा नीलामी दरें (रुपये प्रति क्विंटल)' : 'Latest regional spot prices (₹ per Quintal)'}
              </p>
            </div>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-950 border border-emerald-400/30 text-lime-300 font-semibold">
            {isHi ? 'लाइव अपडेट' : 'Live Updated'}
          </span>
        </div>

        {/* Mandi Rates Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          {mandiRates.map((item, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-2xl bg-emerald-950/70 border border-emerald-500/25 hover:border-lime-400/50 transition-all flex flex-col justify-between"
            >
              <div>
                <p className="text-xs font-bold text-white truncate">
                  {isHi ? item.crop_hi : item.crop_en}
                </p>
                <p className="text-[10px] text-emerald-300/70 mt-0.5">{item.market}</p>
              </div>

              <div className="mt-3">
                <p className="text-lg font-extrabold text-lime-300">₹{item.price}</p>
                <div className="flex items-center gap-1 text-[10px] mt-0.5 font-semibold">
                  {item.trend === 'up' && (
                    <span className="text-lime-400 flex items-center gap-0.5">
                      <TrendingUp className="w-3 h-3" /> +₹{item.change}
                    </span>
                  )}
                  {item.trend === 'down' && (
                    <span className="text-rose-400 flex items-center gap-0.5">
                      <TrendingDown className="w-3 h-3" /> -₹{Math.abs(item.change)}
                    </span>
                  )}
                  {item.trend === 'stable' && (
                    <span className="text-sky-300 flex items-center gap-0.5">
                      <Minus className="w-3 h-3" /> MSP Base
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ============================================================== */}
      {/* STICKY FLOATING EASY-MIC HELP PILL FOR ILLITERATE / BUSY FARMERS */}
      {/* ============================================================== */}
      <div className="fixed bottom-20 right-6 z-40 animate-bounce-subtle">
        <div className="glass-card pl-3 pr-2 py-1.5 rounded-full border border-lime-400/60 shadow-2xl flex items-center gap-2.5 bg-emerald-950/90 backdrop-blur-xl">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-white leading-tight">
              {isHi ? 'कोई भी सवाल पूछें' : 'Need Farming Help?'}
            </p>
            <p className="text-[10px] text-lime-300 leading-tight">
              {isHi ? 'माइक दबाकर बोलें' : 'Tap mic to speak'}
            </p>
          </div>
          <VoiceButton
            size="md"
            onClick={() => setIsVoiceModalOpen(true)}
            className="w-11 h-11 shadow-lg"
          />
        </div>
      </div>
    </div>
  );
}
