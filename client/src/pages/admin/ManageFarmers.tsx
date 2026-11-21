import { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { adminApi } from '../../lib/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import EmptyState from '../../components/EmptyState';
import { Users, Trash2 } from 'lucide-react';
import type { User, FarmerProfile } from '../../lib/types';

export default function ManageFarmers() {
  const { t } = useLanguage();
  const [farmers, setFarmers] = useState<(User & { profile: FarmerProfile })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.farmers();
      setFarmers(res.data.farmers || []);
    } catch {
      setError(t('common_error'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id: number) => {
    if (!confirm(t('admin_delete_confirm'))) return;
    try {
      await adminApi.deleteFarmer(id);
      setFarmers(farmers.filter((f) => f.id !== id));
    } catch {
      setError(t('common_error'));
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} onRetry={load} />;

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-xl font-bold text-gray-800 mb-4">{t('admin_manage_farmers')}</h1>

      {farmers.length === 0 ? (
        <EmptyState icon={<Users className="w-16 h-16" />} title={t('admin_no_farmers')} />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-2 font-semibold text-gray-600">{t('profile_name')}</th>
                <th className="text-left py-3 px-2 font-semibold text-gray-600">{t('profile_mobile')}</th>
                <th className="text-left py-3 px-2 font-semibold text-gray-600 hidden md:table-cell">{t('register_village')}</th>
                <th className="text-left py-3 px-2 font-semibold text-gray-600 hidden md:table-cell">{t('register_state')}</th>
                <th className="text-left py-3 px-2 font-semibold text-gray-600 hidden md:table-cell">{t('register_land_size')}</th>
                <th className="py-3 px-2"></th>
              </tr>
            </thead>
            <tbody>
              {farmers.map((f) => (
                <tr key={f.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-2 font-medium">{f.name}</td>
                  <td className="py-3 px-2 text-gray-500">{f.mobile}</td>
                  <td className="py-3 px-2 text-gray-500 hidden md:table-cell">{f.profile?.village || '-'}</td>
                  <td className="py-3 px-2 text-gray-500 hidden md:table-cell">{f.profile?.state || '-'}</td>
                  <td className="py-3 px-2 text-gray-500 hidden md:table-cell">{f.profile?.land_size ? `${f.profile.land_size} acres` : '-'}</td>
                  <td className="py-3 px-2">
                    <button onClick={() => handleDelete(f.id)} className="text-red-500 hover:text-red-700 min-h-[44px] min-w-[44px] flex items-center justify-center">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
