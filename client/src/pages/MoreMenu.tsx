import { NavLink, useNavigate } from 'react-router-dom';
import { Bug, FlaskConical, BookOpen, Bell, User, Shield, LogOut, Calendar } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

export default function MoreMenu() {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const links = [
    { to: '/calendar', icon: Calendar, label: t('nav_calendar') },
    { to: '/disease', icon: Bug, label: t('nav_disease') },
    { to: '/soil', icon: FlaskConical, label: t('nav_soil') },
    { to: '/knowledge', icon: BookOpen, label: t('nav_knowledge') },
    { to: '/notifications', icon: Bell, label: t('nav_notifications') },
    { to: '/profile', icon: User, label: t('nav_profile') },
  ];

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-xl font-bold text-gray-800 mb-4">{t('nav_more')}</h1>
      <div className="space-y-1">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 transition-colors min-h-[52px]"
          >
            <link.icon className="w-5 h-5 text-primary-600" />
            <span className="text-sm font-medium text-gray-700">{link.label}</span>
          </NavLink>
        ))}

        {user?.role === 'admin' && (
          <>
            <div className="border-t border-gray-100 my-2" />
            <NavLink
              to="/admin"
              className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 transition-colors min-h-[52px]"
            >
              <Shield className="w-5 h-5 text-primary-600" />
              <span className="text-sm font-medium text-gray-700">{t('nav_admin')}</span>
            </NavLink>
          </>
        )}

        <div className="border-t border-gray-100 my-2" />
        <button
          onClick={() => { logout(); navigate('/login'); }}
          className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-50 transition-colors min-h-[52px] w-full text-left"
        >
          <LogOut className="w-5 h-5 text-red-500" />
          <span className="text-sm font-medium text-red-600">{t('nav_logout')}</span>
        </button>
      </div>
    </div>
  );
}
