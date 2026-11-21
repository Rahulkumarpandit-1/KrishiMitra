import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Wheat, Eye, EyeOff, Sparkles, ArrowRight, ShieldCheck, UserCheck } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import LanguageToggle from '../components/LanguageToggle';

export default function Login() {
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const isHi = language === 'hi';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(mobile, password);
      navigate('/');
    } catch (err: any) {
      setError(
        err?.response?.data?.error ||
        (isHi ? 'मोबाइल नंबर या पासवर्ड गलत है।' : 'Invalid mobile number or password.')
      );
    } finally {
      setLoading(false);
    }
  };

  // Quick Demo Autofill Helpers
  const fillDemoFarmer = () => {
    setMobile('9876543210');
    setPassword('password123');
  };

  const fillAdmin = () => {
    setMobile('9999999999');
    setPassword('admin123');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden bg-gradient-to-b from-[#06150b] via-[#040e07] to-[#020703]">
      {/* Ambient Lighting Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-lime-400/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Language Toggle */}
      <div className="absolute top-6 right-6 z-20">
        <LanguageToggle />
      </div>

      {/* Main Glassmorphic Login Card */}
      <div className="w-full max-w-md glass-card p-8 sm:p-10 rounded-3xl border border-emerald-400/40 shadow-2xl relative z-10 backdrop-blur-2xl bg-emerald-950/70">
        
        {/* Brand Icon Badge */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-lime-400 flex items-center justify-center text-gray-950 font-bold shadow-xl border border-lime-300/40 mb-3 hover:scale-105 transition-transform">
            <Wheat className="w-8 h-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {isHi ? 'कृषि मित्र में लॉगिन करें' : 'Welcome to KrishiMitra'}
          </h1>
          <p className="text-xs sm:text-sm text-emerald-200/80 mt-1">
            {isHi
              ? 'स्मार्ट कृषि निर्णय व फसल सलाहकार सहायक'
              : 'Smart Farming Decision & Crop Assistant'}
          </p>
        </div>

        {/* Demo Fast-Login Pills for Judges & Farmers */}
        <div className="mb-6 p-3 rounded-2xl bg-emerald-900/40 border border-emerald-500/30">
          <p className="text-[11px] font-bold text-lime-300 mb-2 text-center uppercase tracking-wider">
            {isHi ? '⚡ एक-क्लिक डेमो लॉगिन' : '⚡ One-Click Demo Accounts'}
          </p>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={fillDemoFarmer}
              className="py-2 px-3 rounded-xl text-xs font-semibold bg-emerald-950/80 border border-emerald-400/40 text-emerald-200 hover:text-white hover:border-lime-400 hover:bg-emerald-800 transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              <UserCheck className="w-4 h-4 text-lime-400" />
              <span>{isHi ? 'किसान डेमो' : 'Farmer Demo'}</span>
            </button>
            <button
              type="button"
              onClick={fillAdmin}
              className="py-2 px-3 rounded-xl text-xs font-semibold bg-emerald-950/80 border border-emerald-400/40 text-emerald-200 hover:text-white hover:border-lime-400 hover:bg-emerald-800 transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              <ShieldCheck className="w-4 h-4 text-sky-400" />
              <span>{isHi ? 'व्यवस्थापक डेमो' : 'Admin Demo'}</span>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-rose-950/80 border border-rose-500/50 text-rose-200 px-4 py-3 rounded-2xl text-xs flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-emerald-300 uppercase tracking-wider mb-1.5">
              {isHi ? 'मोबाइल नंबर (Mobile Number)' : 'Mobile Number'}
            </label>
            <input
              type="tel"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              placeholder={isHi ? '10 अंकों का मोबाइल नंबर' : '10-digit mobile number'}
              className="w-full px-4 py-3.5 rounded-2xl bg-emerald-950/90 border border-emerald-500/40 text-white placeholder-emerald-600 outline-none focus:border-lime-400 focus:ring-2 focus:ring-lime-400/20 text-sm font-medium transition-all"
              required
              maxLength={10}
              pattern="[0-9]{10}"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-emerald-300 uppercase tracking-wider mb-1.5">
              {isHi ? 'पासवर्ड (Password)' : 'Password'}
            </label>
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isHi ? 'अपना पासवर्ड दर्ज करें' : 'Enter your password'}
                className="w-full px-4 py-3.5 rounded-2xl bg-emerald-950/90 border border-emerald-500/40 text-white placeholder-emerald-600 outline-none focus:border-lime-400 focus:ring-2 focus:ring-lime-400/20 text-sm font-medium pr-12 transition-all"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-400 hover:text-white p-1.5 rounded-lg transition-colors"
              >
                {showPw ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-400 via-lime-400 to-emerald-300 text-gray-950 font-extrabold text-base shadow-xl hover:scale-[1.02] active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-gray-950 border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>{isHi ? 'साइन इन करें (Sign In)' : 'Sign In'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <p className="text-center mt-6 text-xs text-emerald-300/80">
          {isHi ? 'नया किसान खाता बनाएं?' : "Don't have an account?"}{' '}
          <Link to="/register" className="text-lime-300 font-bold hover:underline ml-1">
            {isHi ? 'पंजीकरण करें (Register)' : 'Register now'}
          </Link>
        </p>
      </div>

      {/* Footer Branding */}
      <div className="mt-6 text-center text-xs text-emerald-400/60 z-10">
        KrishiMitra • Empowering Indian Agriculture through AI
      </div>
    </div>
  );
}
