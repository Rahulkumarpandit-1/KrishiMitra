import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { adminApi } from '../../lib/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import { Users, Sprout, MessageCircle, Bug, ChevronRight } from 'lucide-react';
import type { AdminStats } from '../../lib/types';

export default function AdminDashboard() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.stats();
      setStats(res.data);
    } catch {
      setError(t('common_error'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => { load(); }, [load]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} onRetry={load} />;

  const cards = [
    { label: t('admin_total_farmers'), value: stats?.total_farmers || 0, icon: Users, color: 'bg-blue-100 text-blue-600', to: '/admin/farmers' },
    { label: t('admin_total_crops'), value: stats?.total_crops || 0, icon: Sprout, color: 'bg-green-100 text-green-600', to: '/admin/crops' },
    { label: t('admin_total_conversations'), value: stats?.total_conversations || 0, icon: MessageCircle, color: 'bg-purple-100 text-purple-600', to: '' },
    { label: t('admin_total_reports'), value: stats?.total_reports || 0, icon: Bug, color: 'bg-orange-100 text-orange-600', to: '' },
  ];

  const links = [
    { label: t('admin_manage_farmers'), to: '/admin/farmers' },
    { label: t('admin_manage_crops'), to: '/admin/crops' },
    { label: t('admin_manage_knowledge'), to: '/admin/knowledge' },
  ];

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-xl font-bold text-gray-800 mb-4">{t('admin_title')}</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {cards.map((c) => (
          <div key={c.label} className="card text-center cursor-pointer hover:shadow-md" onClick={() => c.to && navigate(c.to)}>
            <div className={`w-10 h-10 rounded-xl ${c.color} flex items-center justify-center mx-auto mb-2`}>
              <c.icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold text-gray-800">{c.value}</p>
            <p className="text-xs text-gray-500">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        {links.map((l) => (
          <button key={l.to} onClick={() => navigate(l.to)} className="card w-full text-left flex items-center justify-between hover:shadow-md transition-shadow">
            <span className="font-medium text-gray-700">{l.label}</span>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>
        ))}
      </div>
    </div>
  );
}
