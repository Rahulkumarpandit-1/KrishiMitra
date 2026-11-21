import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Wheat, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

const STATES = [
  'state_up', 'state_mp', 'state_maharashtra', 'state_rajasthan', 'state_karnataka',
  'state_gujarat', 'state_punjab', 'state_haryana', 'state_bihar', 'state_wb',
  'state_ap', 'state_telangana', 'state_tn', 'state_kerala', 'state_odisha',
  'state_assam', 'state_jharkhand', 'state_chhattisgarh',
] as const;

const SOIL_TYPES = [
  'soil_type_alluvial', 'soil_type_black', 'soil_type_red', 'soil_type_laterite',
  'soil_type_sandy', 'soil_type_clay', 'soil_type_loamy',
] as const;

const IRRIGATION_TYPES = [
  'irrigation_drip', 'irrigation_sprinkler', 'irrigation_flood',
  'irrigation_canal', 'irrigation_well', 'irrigation_rain',
] as const;

export default function Register() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    name: '', mobile: '', password: '', confirmPassword: '', preferred_language: 'en',
    village: '', district: '', state: '',
    land_size: '', soil_type: '', irrigation_available: false, irrigation_type: '', preferred_crops: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const set = (key: string, val: any) => setForm({ ...form, [key]: val });

  const handleSubmit = async () => {
    if (form.password !== form.confirmPassword) {
      setError(t('register_passwords_mismatch'));
      return;
    }
    setError('');
    setLoading(true);
    try {
      await register({
        name: form.name,
        mobile: form.mobile,
        password: form.password,
        preferred_language: form.preferred_language,
        village: form.village,
        district: form.district,
        state: form.state,
        land_size: form.land_size ? parseFloat(form.land_size) : undefined,
        soil_type: form.soil_type,
        irrigation_available: form.irrigation_available,
        irrigation_type: form.irrigation_type,
        preferred_crops: form.preferred_crops,
      });
      navigate('/');
    } catch {
      setError(t('register_error'));
    } finally {
      setLoading(false);
    }
  };

  const steps = [t('register_step1'), t('register_step2'), t('register_step3')];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-gradient-to-b from-primary-50 to-white py-8">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 mb-3">
            <Wheat className="w-8 h-8 text-primary-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">{t('register_title')}</h1>
          <p className="text-gray-500 mt-1 text-sm">{t('register_subtitle')}</p>
        </div>

        {/* Step indicators */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {steps.map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                i <= step ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-500'
              }`}>{i + 1}</div>
              {i < 2 && <div className={`w-8 h-0.5 ${i < step ? 'bg-primary-600' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm mb-4">{error}</div>
        )}

        {step === 0 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('register_name')}</label>
              <input value={form.name} onChange={(e) => set('name', e.target.value)} placeholder={t('register_name_placeholder')} className="input-field" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('register_mobile')}</label>
              <input type="tel" value={form.mobile} onChange={(e) => set('mobile', e.target.value)} placeholder={t('register_mobile_placeholder')} className="input-field" required maxLength={10} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('register_password')}</label>
              <input type="password" value={form.password} onChange={(e) => set('password', e.target.value)} placeholder={t('register_password_placeholder')} className="input-field" required minLength={6} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('register_confirm_password')}</label>
              <input type="password" value={form.confirmPassword} onChange={(e) => set('confirmPassword', e.target.value)} placeholder={t('register_confirm_placeholder')} className="input-field" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('register_language')}</label>
              <select value={form.preferred_language} onChange={(e) => set('preferred_language', e.target.value)} className="input-field">
                <option value="en">English</option>
                <option value="hi">हिंदी</option>
              </select>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('register_village')}</label>
              <input value={form.village} onChange={(e) => set('village', e.target.value)} placeholder={t('register_village_placeholder')} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('register_district')}</label>
              <input value={form.district} onChange={(e) => set('district', e.target.value)} placeholder={t('register_district_placeholder')} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('register_state')}</label>
              <select value={form.state} onChange={(e) => set('state', e.target.value)} className="input-field">
                <option value="">{t('register_state_placeholder')}</option>
                {STATES.map((s) => <option key={s} value={t(s)}>{t(s)}</option>)}
              </select>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('register_land_size')}</label>
              <input type="number" step="0.1" value={form.land_size} onChange={(e) => set('land_size', e.target.value)} placeholder={t('register_land_placeholder')} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('register_soil_type')}</label>
              <select value={form.soil_type} onChange={(e) => set('soil_type', e.target.value)} className="input-field">
                <option value="">{t('register_soil_placeholder')}</option>
                {SOIL_TYPES.map((s) => <option key={s} value={t(s)}>{t(s)}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" id="irrigation" checked={form.irrigation_available} onChange={(e) => set('irrigation_available', e.target.checked)} className="w-5 h-5 rounded text-primary-600" />
              <label htmlFor="irrigation" className="text-sm font-medium text-gray-700">{t('register_irrigation')}</label>
            </div>
            {form.irrigation_available && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('register_irrigation_type')}</label>
                <select value={form.irrigation_type} onChange={(e) => set('irrigation_type', e.target.value)} className="input-field">
                  <option value="">Select</option>
                  {IRRIGATION_TYPES.map((s) => <option key={s} value={t(s)}>{t(s)}</option>)}
                </select>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('register_preferred_crops')}</label>
              <input value={form.preferred_crops} onChange={(e) => set('preferred_crops', e.target.value)} placeholder={t('register_crops_placeholder')} className="input-field" />
            </div>
          </div>
        )}

        <div className="flex gap-3 mt-6">
          {step > 0 && (
            <button onClick={() => setStep(step - 1)} className="btn-secondary flex-1">
              <ChevronLeft className="w-5 h-5" /> {t('register_prev')}
            </button>
          )}
          {step < 2 ? (
            <button
              onClick={() => {
                if (step === 0 && (!form.name || !form.mobile || !form.password)) return;
                setStep(step + 1);
              }}
              className="btn-primary flex-1"
            >
              {t('register_next')} <ChevronRight className="w-5 h-5" />
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={loading} className="btn-primary flex-1">
              {loading ? t('common_loading') : t('register_submit')}
            </button>
          )}
        </div>

        <p className="text-center mt-6 text-gray-500 text-sm">
          {t('register_have_account')}{' '}
          <Link to="/login" className="text-primary-600 font-semibold hover:underline">
            {t('register_login')}
          </Link>
        </p>
      </div>
    </div>
  );
}
