import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { profileApi } from '../lib/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import type { FarmerProfile } from '../lib/types';

const SOIL_TYPES = ['Alluvial', 'Black (Regur)', 'Red', 'Laterite', 'Sandy', 'Clay', 'Loamy'];
const IRRIGATION_TYPES = ['Drip', 'Sprinkler', 'Flood', 'Canal', 'Well/Borewell', 'Rain-fed only'];

export default function Profile() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [profile, setProfile] = useState<Partial<FarmerProfile>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await profileApi.get();
      setProfile(res.data.profile || {});
    } catch {
      setError(t('common_error'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => { load(); }, [load]);

  const save = async () => {
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await profileApi.update(profile);
      setSuccess(t('profile_saved'));
      setTimeout(() => setSuccess(''), 3000);
    } catch {
      setError(t('profile_error'));
    } finally {
      setSaving(false);
    }
  };

  const set = (key: string, val: any) => setProfile({ ...profile, [key]: val });

  if (loading) return <LoadingSpinner />;
  if (error && !profile) return <ErrorMessage message={error} onRetry={load} />;

  return (
    <div className="p-4 max-w-2xl mx-auto space-y-6">
      <h1 className="text-xl font-bold text-gray-800">{t('profile_title')}</h1>

      {success && <div className="bg-green-50 text-green-700 px-4 py-3 rounded-xl text-sm">{success}</div>}
      {error && <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm">{error}</div>}

      {/* Personal */}
      <div className="card space-y-4">
        <h2 className="font-semibold text-gray-700">{t('profile_personal')}</h2>
        <div>
          <label className="block text-sm text-gray-600 mb-1">{t('profile_name')}</label>
          <input value={user?.name || ''} disabled className="input-field bg-gray-50" />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">{t('profile_mobile')}</label>
          <input value={user?.mobile || ''} disabled className="input-field bg-gray-50" />
        </div>
      </div>

      {/* Location */}
      <div className="card space-y-4">
        <h2 className="font-semibold text-gray-700">{t('profile_location')}</h2>
        <div>
          <label className="block text-sm text-gray-600 mb-1">{t('register_village')}</label>
          <input value={profile.village || ''} onChange={(e) => set('village', e.target.value)} className="input-field" />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">{t('register_district')}</label>
          <input value={profile.district || ''} onChange={(e) => set('district', e.target.value)} className="input-field" />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">{t('register_state')}</label>
          <input value={profile.state || ''} onChange={(e) => set('state', e.target.value)} className="input-field" />
        </div>
      </div>

      {/* Farm Details */}
      <div className="card space-y-4">
        <h2 className="font-semibold text-gray-700">{t('profile_farm')}</h2>
        <div>
          <label className="block text-sm text-gray-600 mb-1">{t('register_land_size')}</label>
          <input type="number" step="0.1" value={profile.land_size || ''} onChange={(e) => set('land_size', parseFloat(e.target.value))} className="input-field" />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">{t('register_soil_type')}</label>
          <select value={profile.soil_type || ''} onChange={(e) => set('soil_type', e.target.value)} className="input-field">
            <option value="">Select</option>
            {SOIL_TYPES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-3">
          <input type="checkbox" id="irr" checked={!!profile.irrigation_available} onChange={(e) => set('irrigation_available', e.target.checked)} className="w-5 h-5 rounded text-primary-600" />
          <label htmlFor="irr" className="text-sm text-gray-700">{t('register_irrigation')}</label>
        </div>
        {profile.irrigation_available && (
          <div>
            <label className="block text-sm text-gray-600 mb-1">{t('register_irrigation_type')}</label>
            <select value={profile.irrigation_type || ''} onChange={(e) => set('irrigation_type', e.target.value)} className="input-field">
              <option value="">Select</option>
              {IRRIGATION_TYPES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        )}
        <div>
          <label className="block text-sm text-gray-600 mb-1">{t('register_preferred_crops')}</label>
          <input value={profile.preferred_crops || ''} onChange={(e) => set('preferred_crops', e.target.value)} className="input-field" />
        </div>
      </div>

      <button onClick={save} disabled={saving} className="btn-primary w-full">
        {saving ? t('common_loading') : t('profile_save')}
      </button>
    </div>
  );
}
