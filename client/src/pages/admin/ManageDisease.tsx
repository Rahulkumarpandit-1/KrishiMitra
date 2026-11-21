import { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { diseaseApi } from '../../lib/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import { Bug } from 'lucide-react';
import type { DiseaseReport } from '../../lib/types';

export default function ManageDisease() {
  const { t } = useLanguage();
  const [reports, setReports] = useState<DiseaseReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await diseaseApi.reports();
      setReports(res.data.reports || []);
    } catch {
      setError(t('common_error'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => { load(); }, [load]);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-xl font-bold text-gray-800 mb-4">{t('admin_manage_disease')}</h1>

      {error && <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm mb-4">{error}</div>}

      {reports.length === 0 ? (
        <EmptyState icon={<Bug className="w-16 h-16" />} title={t('disease_no_reports')} />
      ) : (
        <div className="space-y-2">
          {reports.map((r) => (
            <div key={r.id} className="card">
              <div className="flex items-center justify-between">
                <p className="font-medium text-sm text-gray-800">{r.diagnosis}</p>
                <span className="text-xs text-gray-400">{new Date(r.created_at).toLocaleDateString()}</span>
              </div>
              {r.confidence && <p className="text-xs text-gray-500 mt-0.5">Confidence: {r.confidence}</p>}
              {r.suggestions && <p className="text-xs text-gray-600 mt-1">{r.suggestions?.slice(0, 200)}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
