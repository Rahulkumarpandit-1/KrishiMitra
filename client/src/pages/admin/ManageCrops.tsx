import { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { cropsApi } from '../../lib/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import EmptyState from '../../components/EmptyState';
import { Plus, Trash2, Sprout, X } from 'lucide-react';
import type { Crop } from '../../lib/types';

export default function ManageCrops() {
  const { t, language } = useLanguage();
  const [crops, setCrops] = useState<Crop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', name_hi: '', category: '', avg_duration_days: '' });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await cropsApi.list();
      setCrops(res.data.crops || []);
    } catch {
      setError(t('common_error'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => { load(); }, [load]);

  const handleAdd = async () => {
    setSaving(true);
    try {
      await cropsApi.create({
        name: form.name,
        name_hi: form.name_hi,
        category: form.category,
        avg_duration_days: parseInt(form.avg_duration_days) || 0,
      });
      setShowAdd(false);
      setForm({ name: '', name_hi: '', category: '', avg_duration_days: '' });
      load();
    } catch {
      setError(t('common_error'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(t('admin_delete_confirm'))) return;
    try {
      await cropsApi.delete(id);
      setCrops(crops.filter((c) => c.id !== id));
    } catch {
      setError(t('common_error'));
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error && crops.length === 0) return <ErrorMessage message={error} onRetry={load} />;

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-gray-800">{t('admin_manage_crops')}</h1>
        <button onClick={() => setShowAdd(true)} className="btn-primary text-sm px-4 py-2">
          <Plus className="w-4 h-4" /> {t('admin_add_crop')}
        </button>
      </div>

      {error && <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm mb-4">{error}</div>}

      {crops.length === 0 ? (
        <EmptyState icon={<Sprout className="w-16 h-16" />} title={t('admin_no_crops')} />
      ) : (
        <div className="space-y-2">
          {crops.map((c) => (
            <div key={c.id} className="card flex items-center gap-3">
              <div className="flex-1">
                <p className="font-medium text-gray-800">{language === 'hi' && c.name_hi ? c.name_hi : c.name}</p>
                <p className="text-xs text-gray-500">{c.category} • {c.avg_duration_days} {t('crops_days')}</p>
              </div>
              <button onClick={() => handleDelete(c.id)} className="text-red-500 hover:text-red-700 min-h-[44px] min-w-[44px] flex items-center justify-center">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {showAdd && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end md:items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">{t('admin_add_crop')}</h2>
              <button onClick={() => setShowAdd(false)} className="min-h-[44px] min-w-[44px] flex items-center justify-center"><X className="w-5 h-5 text-gray-500" /></button>
            </div>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Name (English)" className="input-field" />
            <input value={form.name_hi} onChange={(e) => setForm({ ...form, name_hi: e.target.value })} placeholder="Name (Hindi)" className="input-field" />
            <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Category" className="input-field" />
            <input type="number" value={form.avg_duration_days} onChange={(e) => setForm({ ...form, avg_duration_days: e.target.value })} placeholder="Duration (days)" className="input-field" />
            <button onClick={handleAdd} disabled={saving || !form.name} className="btn-primary w-full">
              {saving ? t('common_loading') : t('admin_save')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
