import { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { soilApi } from '../lib/api';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { AlertTriangle, FlaskConical } from 'lucide-react';
import type { SoilRecord } from '../lib/types';

const SOIL_TYPES = ['Alluvial', 'Black (Regur)', 'Red', 'Laterite', 'Sandy', 'Clay', 'Loamy'];

export default function SoilRecommendations() {
  const { t } = useLanguage();
  const [form, setForm] = useState({ soil_type: '', ph: '', nitrogen: '', phosphorus: '', potassium: '', notes: '' });
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState<string | null>(null);
  const [records, setRecords] = useState<SoilRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await soilApi.records();
      setRecords(res.data.records || []);
    } catch {
      setError(t('common_error'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => { load(); }, [load]);

  const analyze = async () => {
    setAnalyzing(true);
    setError('');
    try {
      const res = await soilApi.analyze({
        soil_type: form.soil_type,
        ph: parseFloat(form.ph) || 0,
        nitrogen: parseFloat(form.nitrogen) || 0,
        phosphorus: parseFloat(form.phosphorus) || 0,
        potassium: parseFloat(form.potassium) || 0,
        notes: form.notes,
      });
      setResults(res.data.recommendations);
      load();
    } catch {
      setError(t('common_error'));
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="p-4 max-w-2xl mx-auto space-y-4">
      <h1 className="text-xl font-bold text-gray-800">{t('soil_title')}</h1>

      {error && <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm">{error}</div>}

      <div className="card space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('soil_type')}</label>
          <select value={form.soil_type} onChange={(e) => setForm({ ...form, soil_type: e.target.value })} className="input-field">
            <option value="">Select</option>
            {SOIL_TYPES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('soil_ph')}</label>
            <input type="number" step="0.1" value={form.ph} onChange={(e) => setForm({ ...form, ph: e.target.value })} className="input-field" placeholder="6.5" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('soil_nitrogen')}</label>
            <input type="number" value={form.nitrogen} onChange={(e) => setForm({ ...form, nitrogen: e.target.value })} className="input-field" placeholder="kg/ha" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('soil_phosphorus')}</label>
            <input type="number" value={form.phosphorus} onChange={(e) => setForm({ ...form, phosphorus: e.target.value })} className="input-field" placeholder="kg/ha" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('soil_potassium')}</label>
            <input type="number" value={form.potassium} onChange={(e) => setForm({ ...form, potassium: e.target.value })} className="input-field" placeholder="kg/ha" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('soil_notes')}</label>
          <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} placeholder={t('soil_notes_placeholder')} className="input-field" />
        </div>
        <button onClick={analyze} disabled={analyzing} className="btn-primary w-full">
          {analyzing ? t('soil_analyzing') : t('soil_analyze')}
        </button>
      </div>

      {/* Results */}
      {results && (
        <div className="card space-y-3">
          <h2 className="font-semibold text-gray-800">{t('soil_results')}</h2>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{results}</p>
          <div className="flex items-start gap-2 bg-yellow-50 p-3 rounded-xl">
            <AlertTriangle className="w-4 h-4 text-yellow-600 shrink-0 mt-0.5" />
            <p className="text-xs text-yellow-700">{t('soil_disclaimer')}</p>
          </div>
        </div>
      )}

      {/* Previous records */}
      <div>
        <h2 className="font-semibold text-gray-700 mb-2">{t('soil_previous')}</h2>
        {records.length === 0 ? (
          <EmptyState icon={<FlaskConical className="w-12 h-12" />} title={t('soil_no_records')} />
        ) : (
          <div className="space-y-2">
            {records.map((r) => (
              <div key={r.id} className="card">
                <p className="font-medium text-sm text-gray-800">{r.soil_type}</p>
                <div className="flex gap-3 text-xs text-gray-500 mt-1">
                  <span>pH: {r.ph}</span>
                  <span>N: {r.nitrogen}</span>
                  <span>P: {r.phosphorus}</span>
                  <span>K: {r.potassium}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
