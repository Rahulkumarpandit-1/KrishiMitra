import { NavLink, useNavigate } from 'react-router-dom';
import { Sprout, Search, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import NotificationBell from './NotificationBell';
import LanguageToggle from './LanguageToggle';

export default function Header() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const navPills = [
    { to: '/', label: t('nav_home') || 'Overview' },
    { to: '/crops', label: t('nav_crops') || 'Crops & Irrigation' },
    { to: '/weather', label: t('nav_weather') || 'Weather' },
    { to: '/disease', label: t('nav_disease') || 'Disease AI' },
    { to: '/soil', label: t('nav_soil') || 'Soil Analysis' },
  ];

  return (
    <header className="sticky top-0 z-30 w-full pt-3 pb-2 px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between gap-4 max-w-7xl mx-auto">
        {/* Mobile Logo */}
        <div className="flex items-center gap-2 md:hidden">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-lime-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Sprout className="w-5 h-5 text-gray-950" />
          </div>
          <div>
            <span className="font-bold text-white text-base leading-none block">{t('app_name')}</span>
            <span className="text-[10px] text-emerald-400 leading-none">Smart Farming</span>
          </div>
        </div>

        {/* Desktop Center Floating Pill Nav Bar (From Dribbble shot!) */}
        <div className="hidden md:flex items-center glass-pill p-1.5 shadow-xl border border-emerald-500/20 mx-auto">
          {navPills.map((pill) => (
            <NavLink
              key={pill.to}
              to={pill.to}
              end={pill.to === '/'}
              className={({ isActive }) =>
                `px-5 py-2 rounded-full text-xs font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-emerald-400 to-lime-300 text-gray-950 shadow-md shadow-emerald-500/20 scale-100 font-bold'
                    : 'text-emerald-300/80 hover:text-white hover:bg-emerald-800/40'
                }`
              }
            >
              {pill.label}
            </NavLink>
          ))}
        </div>

        {/* Right Action Icons & Profile Chip */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => navigate('/assistant')}
            className="w-10 h-10 rounded-full glass-card flex items-center justify-center text-emerald-300 hover:text-white hover:border-emerald-400/40 transition-all"
            title="Search or Ask Assistant"
          >
            <Search className="w-4 h-4" />
          </button>

          <LanguageToggle />

          {user && <NotificationBell />}

          {user && (
            <button
              onClick={() => navigate('/profile')}
              className="hidden sm:flex items-center gap-2.5 pl-2 pr-3.5 py-1.5 rounded-full glass-card hover:border-emerald-400/40 transition-all text-left group"
            >
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-emerald-600 to-lime-400 flex items-center justify-center font-bold text-xs text-gray-950 shadow-md">
                {user.name ? user.name.charAt(0).toUpperCase() : <User className="w-3.5 h-3.5" />}
              </div>
              <div className="text-xs">
                <span className="font-semibold text-white block leading-tight group-hover:text-lime-300 transition-colors">
                  {user.name.split(' ')[0]}
                </span>
                <span className="text-[10px] text-emerald-400/80 block leading-none">
                  {user.role === 'admin' ? 'Admin' : 'Farmer'}
                </span>
              </div>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
