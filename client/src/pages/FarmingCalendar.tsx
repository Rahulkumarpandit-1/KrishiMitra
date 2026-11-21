import { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { calendarApi } from '../lib/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';
import { CheckCircle, Circle, XCircle, Calendar as CalIcon } from 'lucide-react';
import type { CalendarEntry } from '../lib/types';

export default function FarmingCalendar() {
  const { t } = useLanguage();
  const [entries, setEntries] = useState<CalendarEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [view, setView] = useState<'daily' | 'weekly' | 'monthly'>('weekly');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const now = new Date();
      let start: string, end: string;
      if (view === 'daily') {
        start = end = now.toISOString().slice(0, 10);
      } else if (view === 'weekly') {
        start = now.toISOString().slice(0, 10);
        const e = new Date(now); e.setDate(e.getDate() + 7);
        end = e.toISOString().slice(0, 10);
      } else {
        start = now.toISOString().slice(0, 10);
        const e = new Date(now); e.setDate(e.getDate() + 30);
        end = e.toISOString().slice(0, 10);
      }
      const res = await calendarApi.list({ start_date: start, end_date: end });
      setEntries(res.data.entries || []);
    } catch {
      setError(t('common_error'));
    } finally {
      setLoading(false);
    }
  }, [t, view]);

  useEffect(() => { load(); }, [load]);

  const markStatus = async (id: number, status: string) => {
    try {
      await calendarApi.updateStatus(id, status);
      load();
    } catch {
      setError(t('common_error'));
    }
  };

  const statusIcon = (s: string) => {
    if (s === 'completed') return <CheckCircle className="w-5 h-5 text-green-500" />;
    if (s === 'skipped') return <XCircle className="w-5 h-5 text-gray-400" />;
    return <Circle className="w-5 h-5 text-yellow-500" />;
  };

  const activityColor: Record<string, string> = {
    sowing: 'border-l-green-500',
    irrigation: 'border-l-blue-500',
    fertilizer: 'border-l-amber-500',
    pesticide: 'border-l-red-500',
    weeding: 'border-l-orange-500',
    harvesting: 'border-l-earth-500',
    pruning: 'border-l-purple-500',
    other: 'border-l-gray-500',
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} onRetry={load} />;

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-xl font-bold text-gray-800 mb-4">{t('calendar_title')}</h1>

      <div className="flex gap-2 mb-4">
        {(['daily', 'weekly', 'monthly'] as const).map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors min-h-[44px] ${
              view === v ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {t(`calendar_${v}` as any)}
          </button>
        ))}
      </div>

      {entries.length === 0 ? (
        <EmptyState icon={<CalIcon className="w-16 h-16" />} title={t('calendar_no_entries')} />
      ) : (
        <div className="space-y-2">
          {entries.map((entry) => (
            <div key={entry.id} className={`card border-l-4 ${activityColor[entry.activity_type] || 'border-l-gray-500'} flex items-center gap-3`}>
              {statusIcon(entry.status)}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-gray-800 truncate">{entry.title}</p>
                <p className="text-xs text-gray-400">{entry.scheduled_date} • {t(`activity_${entry.activity_type}` as any) || entry.activity_type}
                  {entry.crop_name && ` • ${entry.crop_name}`}</p>
                {entry.description && <p className="text-xs text-gray-500 mt-0.5">{entry.description}</p>}
              </div>
              {entry.status === 'pending' && (
                <div className="flex flex-col gap-1 shrink-0">
                  <button onClick={() => markStatus(entry.id, 'completed')} className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded min-h-[28px]">{t('calendar_mark_complete')}</button>
                  <button onClick={() => markStatus(entry.id, 'skipped')} className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded min-h-[28px]">{t('calendar_mark_skip')}</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
