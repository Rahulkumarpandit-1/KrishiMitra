import { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { notificationsApi } from '../lib/api';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import ErrorMessage from '../components/ErrorMessage';
import { Bell, Trash2, Cloud, Sprout, Calendar, Settings, CheckCheck } from 'lucide-react';
import type { Notification } from '../lib/types';

const FILTERS = ['all', 'weather', 'crop', 'calendar', 'system'];
const FILTER_KEYS: Record<string, string> = {
  all: 'notifications_filter_all',
  weather: 'notifications_filter_weather',
  crop: 'notifications_filter_crop',
  calendar: 'notifications_filter_calendar',
  system: 'notifications_filter_system',
};

function getCategoryIcon(cat: string) {
  if (cat === 'weather') return <Cloud className="w-5 h-5 text-blue-500" />;
  if (cat === 'crop') return <Sprout className="w-5 h-5 text-green-500" />;
  if (cat === 'calendar') return <Calendar className="w-5 h-5 text-orange-500" />;
  return <Settings className="w-5 h-5 text-gray-500" />;
}

export default function Notifications() {
  const { t } = useLanguage();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await notificationsApi.list();
      setNotifications(res.data.notifications || []);
    } catch {
      setError(t('common_error'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => { load(); }, [load]);

  const markAllRead = async () => {
    try {
      await notificationsApi.markAllRead();
      setNotifications(notifications.map((n) => ({ ...n, is_read: true })));
    } catch {}
  };

  const markRead = async (id: number) => {
    try {
      await notificationsApi.markRead(id);
      setNotifications(notifications.map((n) => n.id === id ? { ...n, is_read: true } : n));
    } catch {}
  };

  const deleteNotification = async (id: number) => {
    try {
      await notificationsApi.delete(id);
      setNotifications(notifications.filter((n) => n.id !== id));
    } catch {}
  };

  const filtered = filter === 'all' ? notifications : notifications.filter((n) => n.category === filter);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} onRetry={load} />;

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-gray-800">{t('notifications_title')}</h1>
        {notifications.some((n) => !n.is_read) && (
          <button onClick={markAllRead} className="text-sm text-primary-600 font-medium flex items-center gap-1 min-h-[44px]">
            <CheckCheck className="w-4 h-4" /> {t('notifications_mark_all')}
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors min-h-[40px] ${
              filter === f ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {t(FILTER_KEYS[f] as any)}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Bell className="w-16 h-16" />}
          title={t('notifications_no_notifications')}
          description={t('notifications_no_notifications_desc')}
        />
      ) : (
        <div className="space-y-2">
          {filtered.map((n) => (
            <div
              key={n.id}
              onClick={() => !n.is_read && markRead(n.id)}
              className={`card flex items-start gap-3 cursor-pointer ${!n.is_read ? 'border-l-4 border-l-primary-500 bg-primary-50/30' : ''}`}
            >
              {getCategoryIcon(n.category)}
              <div className="flex-1 min-w-0">
                <p className={`text-sm ${!n.is_read ? 'font-semibold text-gray-800' : 'text-gray-700'}`}>{n.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{n.message}</p>
                <p className="text-xs text-gray-400 mt-1">{new Date(n.created_at).toLocaleString()}</p>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); deleteNotification(n.id); }}
                className="text-gray-400 hover:text-red-500 min-h-[44px] min-w-[44px] flex items-center justify-center shrink-0"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
