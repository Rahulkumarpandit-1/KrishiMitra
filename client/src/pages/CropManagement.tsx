import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, X } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { farmerCropsApi, cropsApi } from '../lib/api';
import CropCard from '../components/CropCard';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import ErrorMessage from '../components/ErrorMessage';
import type { FarmerCrop, Crop } from '../lib/types';

export default function CropManagement() {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [crops, setCrops] = useState<FarmerCrop[]>([]);
  const [refCrops, setRefCrops] = useState<Crop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState({ crop_id: 0, sowing_date: '', field_size: '', variety: '' });
  const [adding, setAdding] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [fRes, rRes] = await Promise.all([farmerCropsApi.list(), cropsApi.list()]);
      setCrops(fRes.data.farmer_crops || []);
      setRefCrops(rRes.data.crops || []);
    } catch {
      setError(t('common_error'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => { load(); }, [load]);

  const handleAdd = async () => {
    if (!addForm.crop_id || !addForm.sowing_date) return;
    setAdding(true);
    try {
      await farmerCropsApi.add({
        crop_id: addForm.crop_id,
        sowing_date: addForm.sowing_date,
        field_size: parseFloat(addForm.field_size) || 0,
        variety: addForm.variety,
      });
      setShowAdd(false);
      setAddForm({ crop_id: 0, sowing_date: '', field_size: '', variety: '' });
      load();
    } catch {
      setError(t('common_error'));
    } finally {
      setAdding(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error && crops.length === 0) return <ErrorMessage message={error} onRetry={load} />;

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-gray-800">{t('crops_title')}</h1>
        <button onClick={() => setShowAdd(true)} className="btn-primary text-sm px-4 py-2">
          <Plus className="w-4 h-4" /> {t('crops_add')}
        </button>
      </div>

      {error && <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm mb-4">{error}</div>}

      {crops.length === 0 ? (
        <EmptyState
          title={t('crops_no_crops')}
          description={t('crops_no_crops_desc')}
          action={
            <button onClick={() => setShowAdd(true)} className="btn-primary">
              <Plus className="w-4 h-4" /> {t('crops_add')}
            </button>
          }
        />
      ) : (
        <div className="space-y-2">
          {crops.map((c) => <CropCard key={c.id} crop={c} />)}
        </div>
      )}

      {/* Add Crop Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end md:items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-5 space-y-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-800">{t('crops_add')}</h2>
              <button onClick={() => setShowAdd(false)} className="min-h-[44px] min-w-[44px] flex items-center justify-center">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('crops_select')}</label>
              <select value={addForm.crop_id} onChange={(e) => setAddForm({ ...addForm, crop_id: parseInt(e.target.value) })} className="input-field">
                <option value={0}>{t('crops_select')}</option>
                {refCrops.map((c) => (
                  <option key={c.id} value={c.id}>{language === 'hi' && c.name_hi ? c.name_hi : c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('crops_sowing_date')}</label>
              <input type="date" value={addForm.sowing_date} onChange={(e) => setAddForm({ ...addForm, sowing_date: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('crops_field_size')} ({t('common_acres')})</label>
              <input type="number" step="0.1" value={addForm.field_size} onChange={(e) => setAddForm({ ...addForm, field_size: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('crops_variety')}</label>
              <input value={addForm.variety} onChange={(e) => setAddForm({ ...addForm, variety: e.target.value })} placeholder={t('crops_variety_placeholder')} className="input-field" />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowAdd(false)} className="btn-secondary flex-1">{t('crops_cancel')}</button>
              <button onClick={handleAdd} disabled={adding || !addForm.crop_id} className="btn-primary flex-1">
                {adding ? t('common_loading') : t('crops_add_button')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
