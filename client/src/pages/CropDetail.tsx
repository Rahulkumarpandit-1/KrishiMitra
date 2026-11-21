import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, X, CheckCircle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { farmerCropsApi, activitiesApi, calendarApi } from '../lib/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import type { FarmerCrop, FarmingActivity, CalendarEntry } from '../lib/types';

const ACTIVITY_TYPES = ['sowing', 'irrigation', 'fertilizer', 'pesticide', 'weeding', 'harvesting', 'pruning', 'other'];

export default function CropDetail() {
  const { id } = useParams<{ id: string }>();
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [crop, setCrop] = useState<FarmerCrop | null>(null);
  const [activities, setActivities] = useState<FarmingActivity[]>([]);
  const [calendar, setCalendar] = useState<CalendarEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showLog, setShowLog] = useState(false);
  const [logForm, setLogForm] = useState({ activity_type: 'irrigation', description: '', activity_date: new Date().toISOString().slice(0, 10) });
  const [logging, setLogging] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError('');
    try {
      const [cRes, aRes, calRes] = await Promise.all([
        farmerCropsApi.get(parseInt(id)),
        activitiesApi.list(parseInt(id)),
        calendarApi.list({ farmer_crop_id: parseInt(id) }),
      ]);
      setCrop(cRes.data.farmer_crop);
      setActivities(aRes.data.activities || []);
      setCalendar(calRes.data.entries || []);
    } catch {
      setError(t('common_error'));
    } finally {
      setLoading(false);
    }
  }, [id, t]);

  useEffect(() => { load(); }, [load]);

  const handleLogActivity = async () => {
    if (!id) return;
    setLogging(true);
    try {
      await activitiesApi.create({
        farmer_crop_id: parseInt(id),
        activity_type: logForm.activity_type,
        description: logForm.description,
        activity_date: logForm.activity_date,
      });
      setShowLog(false);
      setLogForm({ activity_type: 'irrigation', description: '', activity_date: new Date().toISOString().slice(0, 10) });
      load();
    } catch {
      setError(t('common_error'));
    } finally {
      setLogging(false);
    }
  };

  const markCalendar = async (entryId: number, status: string) => {
    try {
      await calendarApi.updateStatus(entryId, status);
      load();
    } catch {
      setError(t('common_error'));
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error || !crop) return <ErrorMessage message={error || t('common_error')} onRetry={load} />;

  const cropName = language === 'hi' && crop.crop?.name_hi ? crop.crop.name_hi : crop.crop?.name;
  const stages = crop.crop?.stages || [];
  const totalDays = crop.crop?.avg_duration_days || 1;
  const progress = Math.min(100, Math.round((crop.days_since_sowing / totalDays) * 100));

  return (
    <div className="p-4 max-w-2xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl hover:bg-gray-100">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-800">{cropName}</h1>
          <p className="text-sm text-gray-500">{crop.variety} • {crop.field_size} {t('common_acres')}</p>
        </div>
      </div>

      {/* Growth Progress */}
      <div className="card">
        <h2 className="font-semibold text-gray-700 mb-3">{t('crop_detail_growth')}</h2>
        <div className="relative">
          <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-primary-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
          </div>
          <p className="text-sm text-gray-500 mt-1">{crop.days_since_sowing} / {totalDays} {t('crops_days')} ({progress}%)</p>
        </div>
        {stages.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {stages.map((s, i) => {
              const isActive = crop.days_since_sowing >= s.start_day && crop.days_since_sowing <= s.end_day;
              return (
                <span key={i} className={`text-xs px-2.5 py-1 rounded-full ${isActive ? 'bg-primary-100 text-primary-700 font-semibold' : 'bg-gray-100 text-gray-500'}`}>
                  {language === 'hi' && s.name_hi ? s.name_hi : s.name}
                </span>
              );
            })}
          </div>
        )}
      </div>

      {/* Calendar */}
      <div className="card">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-700">{t('crop_detail_calendar')}</h2>
        </div>
        {calendar.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">{t('calendar_no_entries')}</p>
        ) : (
          <div className="space-y-2">
            {calendar.slice(0, 10).map((entry) => (
              <div key={entry.id} className="flex items-center gap-2 p-2 rounded-lg bg-gray-50">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{entry.title}</p>
                  <p className="text-xs text-gray-400">{entry.scheduled_date} • {entry.activity_type}</p>
                </div>
                {entry.status === 'pending' && (
                  <div className="flex gap-1">
                    <button onClick={() => markCalendar(entry.id, 'completed')} className="text-green-600 text-xs px-2 py-1 rounded bg-green-50 min-h-[32px]">{t('calendar_mark_complete')}</button>
                    <button onClick={() => markCalendar(entry.id, 'skipped')} className="text-gray-500 text-xs px-2 py-1 rounded bg-gray-100 min-h-[32px]">{t('calendar_mark_skip')}</button>
                  </div>
                )}
                {entry.status === 'completed' && <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Activity Log */}
      <div className="card">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-700">{t('crop_detail_activities')}</h2>
          <button onClick={() => setShowLog(true)} className="btn-primary text-xs px-3 py-1.5">
            <Plus className="w-3 h-3" /> {t('crop_detail_log_activity')}
          </button>
        </div>
        {activities.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">{t('crop_detail_no_activities')}</p>
        ) : (
          <div className="space-y-2">
            {activities.map((a) => (
              <div key={a.id} className="p-2 rounded-lg bg-gray-50">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-800">{t(`activity_${a.activity_type}` as any) || a.activity_type}</span>
                  <span className="text-xs text-gray-400">{a.activity_date}</span>
                </div>
                {a.description && <p className="text-xs text-gray-500 mt-0.5">{a.description}</p>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Log Activity Modal */}
      {showLog && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end md:items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">{t('crop_detail_add_activity')}</h2>
              <button onClick={() => setShowLog(false)} className="min-h-[44px] min-w-[44px] flex items-center justify-center">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('crop_detail_activity_type')}</label>
              <select value={logForm.activity_type} onChange={(e) => setLogForm({ ...logForm, activity_type: e.target.value })} className="input-field">
                {ACTIVITY_TYPES.map((a) => <option key={a} value={a}>{t(`activity_${a}` as any)}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('crop_detail_date')}</label>
              <input type="date" value={logForm.activity_date} onChange={(e) => setLogForm({ ...logForm, activity_date: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('crop_detail_description')}</label>
              <textarea value={logForm.description} onChange={(e) => setLogForm({ ...logForm, description: e.target.value })} rows={3} className="input-field" />
            </div>
            <button onClick={handleLogActivity} disabled={logging} className="btn-primary w-full">
              {logging ? t('common_loading') : t('crop_detail_add_activity')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
