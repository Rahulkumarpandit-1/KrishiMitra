import { NavLink } from 'react-router-dom';
import {
  Home, Sprout, Cloud, Sparkles, Bug, FlaskConical,
  BookOpen, Bell, User, Shield, LogOut, Calendar
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';

export default function Sidebar() {
  const { t } = useLanguage();
  const { user, logout } = useAuth();

  const dockLinks = [
    { to: '/', icon: Home, label: t('nav_home') },
    { to: '/crops', icon: Sprout, label: t('nav_crops') },
    { to: '/calendar', icon: Calendar, label: t('nav_calendar') },
    { to: '/weather', icon: Cloud, label: t('nav_weather') },
    { to: '/assistant', icon: Sparkles, label: t('nav_assistant'), highlight: true },
    { to: '/disease', icon: Bug, label: t('nav_disease') },
    { to: '/soil', icon: FlaskConical, label: t('nav_soil') },
    { to: '/knowledge', icon: BookOpen, label: t('nav_knowledge') },
    { to: '/notifications', icon: Bell, label: t('nav_notifications') },
  ];

  return (
    <aside 
      aria-label="Desktop Dock Navigation" 
      className="hidden md:flex flex-col items-center justify-between w-20 lg:w-24 h-[calc(100vh-2rem)] fixed left-4 top-4 z-40 glass-card py-5 px-2 border border-emerald-500/20 shadow-2xl"
    >
      {/* Top Logo */}
      <div className="flex flex-col items-center">
        <NavLink
          to="/"
          aria-label="KrishiMitra Home"
          className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-lime-400 flex items-center justify-center shadow-lg shadow-emerald-500/25 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-400 transition-all group"
          title="KrishiMitra"
        >
          <Sprout className="w-6 h-6 text-gray-950 group-hover:rotate-6 transition-transform" aria-hidden="true" />
        </NavLink>
      </div>

      {/* Center Nav Dock */}
      <nav aria-label="Main Navigation" className="flex flex-col items-center gap-2 my-auto py-2">
        {dockLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/'}
            title={link.label}
            aria-label={link.label}
            className={({ isActive }) =>
              `relative group w-11 h-11 rounded-2xl flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-400 transition-all ${
                isActive
                  ? 'bg-gradient-to-tr from-emerald-500 to-lime-400 text-gray-950 font-bold shadow-lg shadow-emerald-500/30 scale-105'
                  : link.highlight
                  ? 'text-lime-300 hover:text-white bg-emerald-950/60 hover:bg-emerald-900/60 border border-lime-400/30'
                  : 'text-emerald-300/70 hover:text-white hover:bg-emerald-900/40'
              }`
            }
          >
            <link.icon className="w-5 h-5 transition-transform group-hover:scale-110" aria-hidden="true" />

            {/* Tooltip on hover */}
            <span className="absolute left-14 px-3 py-1.5 rounded-xl bg-emerald-950/95 border border-emerald-500/30 text-emerald-100 text-xs font-semibold whitespace-nowrap shadow-xl pointer-events-none opacity-0 group-hover:opacity-100 translate-x-1 group-hover:translate-x-0 transition-all z-50">
              {link.label}
            </span>
          </NavLink>
        ))}

        {user?.role === 'admin' && (
          <NavLink
            to="/admin"
            title={t('nav_admin')}
            aria-label={t('nav_admin')}
            className={({ isActive }) =>
              `relative group w-11 h-11 rounded-2xl flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 transition-all ${
                isActive
                  ? 'bg-amber-400 text-gray-950 font-bold shadow-lg shadow-amber-500/30'
                  : 'text-amber-300/70 hover:text-white hover:bg-emerald-900/40'
              }`
            }
          >
            <Shield className="w-5 h-5" aria-hidden="true" />
            <span className="absolute left-14 px-3 py-1.5 rounded-xl bg-emerald-950/95 border border-emerald-500/30 text-emerald-100 text-xs font-semibold whitespace-nowrap shadow-xl pointer-events-none opacity-0 group-hover:opacity-100 transition-all z-50">
              {t('nav_admin')}
            </span>
          </NavLink>
        )}
      </nav>

      {/* Bottom Profile & Logout */}
      <div className="flex flex-col items-center gap-2">
        <NavLink
          to="/profile"
          title={t('nav_profile')}
          aria-label={t('nav_profile')}
          className="relative group w-11 h-11 rounded-2xl flex items-center justify-center text-emerald-300/80 hover:text-white hover:bg-emerald-900/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-400 transition-all"
        >
          <div className="w-8 h-8 rounded-full bg-emerald-800/80 border border-emerald-400/40 flex items-center justify-center font-bold text-xs text-emerald-200">
            {user?.name ? user.name.charAt(0).toUpperCase() : <User className="w-4 h-4" aria-hidden="true" />}
          </div>
          <span className="absolute left-14 px-3 py-1.5 rounded-xl bg-emerald-950/95 border border-emerald-500/30 text-emerald-100 text-xs font-semibold whitespace-nowrap shadow-xl pointer-events-none opacity-0 group-hover:opacity-100 transition-all z-50">
            {t('nav_profile')}
          </span>
        </NavLink>

        <button
          onClick={logout}
          title={t('nav_logout')}
          aria-label={t('nav_logout')}
          className="w-10 h-10 rounded-2xl flex items-center justify-center text-rose-400/80 hover:text-rose-300 hover:bg-rose-950/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 transition-all"
        >
          <LogOut className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>
    </aside>
  );
}
