import { Languages } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export default function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  return (
    <button
      onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold
                 glass-card hover:border-emerald-400/50 text-emerald-200 hover:text-white transition-all
                 min-h-[40px] shadow-sm"
      aria-label="Toggle language"
    >
      <Languages className="w-3.5 h-3.5 text-lime-400" />
      <span>{language === 'en' ? 'हिंदी' : 'English'}</span>
    </button>
  );
}
