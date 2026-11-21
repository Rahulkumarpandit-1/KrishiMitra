import { NavLink } from 'react-router-dom';
import { Home, Sprout, Cloud, Sparkles, Menu } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export default function BottomNav() {
  const { t } = useLanguage();

  const links = [
    { to: '/', icon: Home, label: t('nav_home') },
    { to: '/crops', icon: Sprout, label: t('nav_crops') },
    { to: '/weather', icon: Cloud, label: t('nav_weather') },
    { to: '/assistant', icon: Sparkles, label: t('nav_assistant'), highlight: true },
    { to: '/more', icon: Menu, label: t('nav_more') },
  ];

  return (
    <nav className="fixed bottom-3 left-4 right-4 glass-card px-2 py-1.5 z-50 md:hidden border border-emerald-500/25 shadow-2xl backdrop-blur-2xl">
      <div className="flex items-center justify-around">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl min-h-[48px] transition-all ${
                isActive
                  ? 'text-gray-950 bg-gradient-to-tr from-emerald-400 to-lime-300 font-bold shadow-md shadow-emerald-500/25 scale-105'
                  : link.highlight
                  ? 'text-lime-400 hover:text-white'
                  : 'text-emerald-300/70 hover:text-white'
              }`
            }
          >
            <link.icon className="w-5 h-5" />
            <span className="text-[10px] mt-0.5 font-medium leading-none">{link.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
