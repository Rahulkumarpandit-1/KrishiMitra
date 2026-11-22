import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Wheat, ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import LanguageToggle from '../components/LanguageToggle';

const STATES = [
  'state_up', 'state_mp', 'state_maharashtra', 'state_rajasthan', 'state_karnataka',
  'state_gujarat', 'state_punjab', 'state_haryana', 'state_bihar', 'state_wb',
  'state_ap', 'state_telangana', 'state_tn', 'state_kerala', 'state_odisha',
  'state_assam', 'state_jharkhand', 'state_chhattisgarh',
] as const;

const SOIL_TYPES = [
  'soil_type_alluvial', 'soil_type_black', 'soil_type_red', 'soil_type_laterite',
  'soil_type_sandy', 'soil_type_clay', 'soil_type_loamy',
] as const;

const IRRIGATION_TYPES = [
  'irrigation_drip', 'irrigation_sprinkler', 'irrigation_flood',
  'irrigation_canal', 'irrigation_well', 'irrigation_rain',
] as const;

export default function Register() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    name: '', mobile: '', password: '', confirmPassword: '', preferred_language: 'en',
    village: '', district: '', state: '',
    land_size: '', soil_type: '', irrigation_available: false, irrigation_type: '', preferred_crops: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const isHi = language === 'hi';

  const set = (key: string, val: any) => setForm({ ...form, [key]: val });

  const handleSubmit = async () => {
    if (form.password !== form.confirmPassword) {
      setError(t('register_passwords_mismatch') || 'Passwords do not match');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await register({
        name: form.name,
        mobile: form.mobile,
        password: form.password,
        preferred_language: form.preferred_language,
        village: form.village,
        district: form.district,
        state: form.state,
        land_size: form.land_size ? parseFloat(form.land_size) : undefined,
        soil_type: form.soil_type,
        irrigation_available: form.irrigation_available,
        irrigation_type: form.irrigation_type,
        preferred_crops: form.preferred_crops,
      });
      navigate('/');
    } catch (err: any) {
      const serverMsg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err?.message ||
        (isHi ? 'पंजीकरण विफल रहा। मोबाइल नंबर पहले से मौजूद हो सकता है।' : 'Registration failed. Mobile number might already be registered.');
      setError(serverMsg);
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { title: isHi ? 'मूल जानकारी' : 'Basic Info', sub: isHi ? 'नाम व पासवर्ड' : 'Account' },
    { title: isHi ? 'स्थान विवरण' : 'Location', sub: isHi ? 'गांव व जिला' : 'Region' },
    { title: isHi ? 'कृषि विवरण' : 'Farm Details', sub: isHi ? 'भूमि व मिट्टी' : 'Land & Soil' }
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden bg-gradient-to-b from-[#06150b] via-[#040e07] to-[#020703]">
      {/* Ambient Lighting Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-lime-400/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Language Toggle */}
      <div className="absolute top-6 right-6 z-20">
        <LanguageToggle />
      </div>

      <div className="w-full max-w-lg glass-card p-6 sm:p-10 rounded-3xl border border-emerald-400/40 shadow-2xl relative z-10 backdrop-blur-2xl bg-emerald-950/70">
        
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-lime-400 flex items-center justify-center text-gray-950 font-bold shadow-xl border border-lime-300/40 mb-2">
            <Wheat className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            {isHi ? 'नया किसान पंजीकरण' : 'Farmer Registration'}
          </h1>
          <p className="text-xs text-emerald-200/80 mt-0.5">
            {isHi ? 'कृषि मित्र से जुड़ें और स्मार्ट खेती शुरू करें' : 'Join KrishiMitra for personalized farming guidance'}
          </p>
        </div>

        {/* Step indicators */}
        <div className="flex items-center justify-between mb-6 px-2">
          {steps.map((s, i) => (
            <div key={i} className="flex-1 flex flex-col items-center relative">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-md ${
                i === step
                  ? 'bg-lime-400 text-gray-950 ring-4 ring-lime-400/30'
                  : i < step
                  ? 'bg-emerald-500 text-white'
                  : 'bg-emerald-950 border border-emerald-500/40 text-emerald-400'
              }`}>
                {i < step ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
              </div>
              <span className={`text-[10px] mt-1 font-semibold ${i <= step ? 'text-white' : 'text-emerald-500/70'}`}>
                {s.title}
              </span>
            </div>
          ))}
        </div>

        {error && (
          <div 
            role="alert" 
            aria-live="assertive" 
            className="bg-rose-950/80 border border-rose-500/50 text-rose-200 px-4 py-3 rounded-2xl text-xs mb-4 flex items-center gap-2"
          >
            <span className="w-2 h-2 rounded-full bg-rose-400 shrink-0" aria-hidden="true" />
            <span>{error}</span>
          </div>
        )}

        {/* Step 0: Basic Info */}
        {step === 0 && (
          <div className="space-y-3.5">
            <div>
              <label htmlFor="reg-name" className="block text-xs font-bold text-emerald-300 uppercase tracking-wider mb-1">
                {isHi ? 'पूरा नाम (Full Name)' : 'Full Name'}
              </label>
              <input
                id="reg-name"
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
                placeholder={isHi ? 'उदा. रमेश कुमार' : 'e.g. Ramesh Patel'}
                className="w-full px-4 py-3 rounded-xl bg-emerald-950/90 border border-emerald-500/40 text-white placeholder-emerald-600 outline-none focus:border-lime-400 text-sm"
                required
                aria-required="true"
              />
            </div>
            <div>
              <label htmlFor="reg-mobile" className="block text-xs font-bold text-emerald-300 uppercase tracking-wider mb-1">
                {isHi ? 'मोबाइल नंबर (Mobile Number)' : 'Mobile Number'}
              </label>
              <input
                id="reg-mobile"
                type="tel"
                value={form.mobile}
                onChange={(e) => set('mobile', e.target.value)}
                placeholder={isHi ? '10 अंकों का मोबाइल नंबर' : '10-digit mobile number'}
                className="w-full px-4 py-3 rounded-xl bg-emerald-950/90 border border-emerald-500/40 text-white placeholder-emerald-600 outline-none focus:border-lime-400 text-sm"
                required
                aria-required="true"
                maxLength={10}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="reg-password" className="block text-xs font-bold text-emerald-300 uppercase tracking-wider mb-1">
                  {isHi ? 'पासवर्ड' : 'Password'}
                </label>
                <input
                  id="reg-password"
                  type="password"
                  value={form.password}
                  onChange={(e) => set('password', e.target.value)}
                  placeholder="Min 6 chars"
                  className="w-full px-4 py-3 rounded-xl bg-emerald-950/90 border border-emerald-500/40 text-white placeholder-emerald-600 outline-none focus:border-lime-400 text-sm"
                  required
                  aria-required="true"
                  minLength={6}
                />
              </div>
              <div>
                <label htmlFor="reg-confirm" className="block text-xs font-bold text-emerald-300 uppercase tracking-wider mb-1">
                  {isHi ? 'पुष्टि करें' : 'Confirm'}
                </label>
                <input
                  id="reg-confirm"
                  type="password"
                  value={form.confirmPassword}
                  onChange={(e) => set('confirmPassword', e.target.value)}
                  placeholder="Confirm password"
                  className="w-full px-4 py-3 rounded-xl bg-emerald-950/90 border border-emerald-500/40 text-white placeholder-emerald-600 outline-none focus:border-lime-400 text-sm"
                  required
                  aria-required="true"
                />
              </div>
            </div>
            <div>
              <label htmlFor="reg-lang" className="block text-xs font-bold text-emerald-300 uppercase tracking-wider mb-1">
                {isHi ? 'पसंदीदा भाषा (Preferred Language)' : 'Preferred Language'}
              </label>
              <select
                id="reg-lang"
                value={form.preferred_language}
                onChange={(e) => set('preferred_language', e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-emerald-950/90 border border-emerald-500/40 text-white outline-none focus:border-lime-400 text-sm"
              >
                <option value="en">English</option>
                <option value="hi">हिंदी (Hindi)</option>
              </select>
            </div>
          </div>
        )}

        {/* Step 1: Location */}
        {step === 1 && (
          <div className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-emerald-300 uppercase tracking-wider mb-1">
                {isHi ? 'गांव (Village)' : 'Village'}
              </label>
              <input
                value={form.village}
                onChange={(e) => set('village', e.target.value)}
                placeholder={isHi ? 'अपने गांव का नाम' : 'Village name'}
                className="w-full px-4 py-3 rounded-xl bg-emerald-950/90 border border-emerald-500/40 text-white placeholder-emerald-600 outline-none focus:border-lime-400 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-emerald-300 uppercase tracking-wider mb-1">
                {isHi ? 'जिला (District)' : 'District'}
              </label>
              <input
                value={form.district}
                onChange={(e) => set('district', e.target.value)}
                placeholder={isHi ? 'जिले का नाम' : 'District name'}
                className="w-full px-4 py-3 rounded-xl bg-emerald-950/90 border border-emerald-500/40 text-white placeholder-emerald-600 outline-none focus:border-lime-400 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-emerald-300 uppercase tracking-wider mb-1">
                {isHi ? 'राज्य (State)' : 'State'}
              </label>
              <select
                value={form.state}
                onChange={(e) => set('state', e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-emerald-950/90 border border-emerald-500/40 text-white outline-none focus:border-lime-400 text-sm"
              >
                <option value="">{isHi ? 'राज्य चुनें' : 'Select State'}</option>
                {STATES.map((s) => <option key={s} value={t(s)}>{t(s)}</option>)}
              </select>
            </div>
          </div>
        )}

        {/* Step 2: Farming Details */}
        {step === 2 && (
          <div className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-emerald-300 uppercase tracking-wider mb-1">
                {isHi ? 'कुल भूमि एकड़ में (Land Size in Acres)' : 'Land Size (Acres)'}
              </label>
              <input
                type="number"
                step="0.1"
                value={form.land_size}
                onChange={(e) => set('land_size', e.target.value)}
                placeholder="e.g. 5.5"
                className="w-full px-4 py-3 rounded-xl bg-emerald-950/90 border border-emerald-500/40 text-white placeholder-emerald-600 outline-none focus:border-lime-400 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-emerald-300 uppercase tracking-wider mb-1">
                {isHi ? 'मिट्टी का प्रकार (Soil Type)' : 'Soil Type'}
              </label>
              <select
                value={form.soil_type}
                onChange={(e) => set('soil_type', e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-emerald-950/90 border border-emerald-500/40 text-white outline-none focus:border-lime-400 text-sm"
              >
                <option value="">{isHi ? 'मिट्टी चुनें' : 'Select Soil Type'}</option>
                {SOIL_TYPES.map((s) => <option key={s} value={t(s)}>{t(s)}</option>)}
              </select>
            </div>
            <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/30 flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-200">
                {isHi ? 'सिंचाई की सुविधा उपलब्ध है?' : 'Irrigation Available?'}
              </span>
              <input
                type="checkbox"
                id="irrigation"
                checked={form.irrigation_available}
                onChange={(e) => set('irrigation_available', e.target.checked)}
                className="w-5 h-5 rounded accent-lime-400 cursor-pointer"
              />
            </div>
            {form.irrigation_available && (
              <div>
                <label className="block text-xs font-bold text-emerald-300 uppercase tracking-wider mb-1">
                  {isHi ? 'सिंचाई का साधन (Irrigation Source)' : 'Irrigation Source'}
                </label>
                <select
                  value={form.irrigation_type}
                  onChange={(e) => set('irrigation_type', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-emerald-950/90 border border-emerald-500/40 text-white outline-none focus:border-lime-400 text-sm"
                >
                  <option value="">{isHi ? 'साधन चुनें' : 'Select Source'}</option>
                  {IRRIGATION_TYPES.map((s) => <option key={s} value={t(s)}>{t(s)}</option>)}
                </select>
              </div>
            )}
            <div>
              <label className="block text-xs font-bold text-emerald-300 uppercase tracking-wider mb-1">
                {isHi ? 'पसंदीदा फसलें (Preferred Crops)' : 'Preferred Crops'}
              </label>
              <input
                value={form.preferred_crops}
                onChange={(e) => set('preferred_crops', e.target.value)}
                placeholder={isHi ? 'उदा. धान, गेहूं, प्याज' : 'e.g. Rice, Wheat, Onion'}
                className="w-full px-4 py-3 rounded-xl bg-emerald-950/90 border border-emerald-500/40 text-white placeholder-emerald-600 outline-none focus:border-lime-400 text-sm"
              />
            </div>
          </div>
        )}

        {/* Step Navigation Buttons */}
        <div className="flex gap-3 mt-6">
          {step > 0 && (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="flex-1 py-3 px-4 rounded-xl border border-emerald-500/40 text-emerald-200 font-bold hover:bg-emerald-900/60 transition-all flex items-center justify-center gap-1.5 text-sm"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>{isHi ? 'पिछला' : 'Back'}</span>
            </button>
          )}
          {step < 2 ? (
            <button
              type="button"
              onClick={() => {
                if (step === 0 && (!form.name || !form.mobile || !form.password)) {
                  setError(isHi ? 'कृपया नाम, मोबाइल और पासवर्ड भरें' : 'Please fill Name, Mobile and Password');
                  return;
                }
                setError('');
                setStep(step + 1);
              }}
              className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-400 to-lime-300 text-gray-950 font-extrabold shadow-lg hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-1.5 text-sm"
            >
              <span>{isHi ? 'आगे बढ़ें' : 'Next'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-400 via-lime-400 to-emerald-300 text-gray-950 font-extrabold shadow-xl hover:scale-[1.02] active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-2 text-sm"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-gray-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <span>{isHi ? 'पंजीकरण पूरा करें' : 'Complete Registration'}</span>
              )}
            </button>
          )}
        </div>

        <p className="text-center mt-6 text-xs text-emerald-300/80">
          {isHi ? 'पहले से खाता है?' : 'Already have an account?'}{' '}
          <Link to="/login" className="text-lime-300 font-bold hover:underline ml-1">
            {isHi ? 'लॉगिन करें' : 'Sign In'}
          </Link>
        </p>
      </div>
    </div>
  );
}
