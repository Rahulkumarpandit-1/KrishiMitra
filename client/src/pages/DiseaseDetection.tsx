import { useState, useEffect, useCallback, useRef } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { diseaseApi, cropsApi } from '../lib/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';
import { Camera, Upload, AlertTriangle, Bug, Sparkles, ShieldCheck, CheckCircle2 } from 'lucide-react';
import type { DiseaseReport, Crop } from '../lib/types';

export default function DiseaseDetection() {
  const { t, language } = useLanguage();
  const [crops, setCrops] = useState<Crop[]>([]);
  const [cropId, setCropId] = useState<number>(0);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<DiseaseReport | null>(null);
  const [reports, setReports] = useState<DiseaseReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [cRes, rRes] = await Promise.all([cropsApi.list(), diseaseApi.reports()]);
      setCrops(cRes.data.crops || []);
      setReports(rRes.data.reports || []);
    } catch {
      setError(t('common_error'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => { load(); }, [load]);

  const handleFile = (f: File) => {
    setFile(f);
    setResult(null);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(f);
  };

  const analyze = async () => {
    if (!file) { setError(t('disease_no_image')); return; }
    setAnalyzing(true);
    setError('');
    try {
      const form = new FormData();
      form.append('image', file);
      if (cropId) form.append('crop_id', String(cropId));
      const res = await diseaseApi.analyze(form);
      setResult(res.data.report || (res.data as any));
      load();
    } catch {
      setError(t('common_error'));
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Title & Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-lime-400 flex items-center justify-center text-gray-950 shadow-lg shadow-emerald-500/20">
            <Bug className="w-6 h-6" />
          </div>
          <span>{t('disease_title') || 'Crop Disease Identification'}</span>
        </h1>
        <p className="text-sm text-emerald-300/80 mt-1.5">
          {language === 'hi'
            ? 'पौधे की प्रभावित पत्ती या भाग का फोटो अपलोड करें। AI मॉडल संभावित बीमारी और रोकथाम के उपाय बताएगा।'
            : 'Capture or upload a clear photo of the affected plant leaf. Our AI system will identify potential diseases and suggest remedies.'}
        </p>
      </div>

      {error && (
        <div className="bg-rose-950/80 border border-rose-500/40 text-rose-200 px-4 py-3 rounded-2xl text-sm shadow-lg flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Crop selector */}
      <div className="glass-card p-4">
        <label className="block text-xs font-bold uppercase tracking-wider text-emerald-300 mb-2">
          {t('disease_select_crop') || '1. Select Affected Crop'}
        </label>
        <select
          value={cropId}
          onChange={(e) => setCropId(parseInt(e.target.value))}
          className="input-field text-white font-medium"
        >
          <option value={0} className="bg-emerald-950 text-white">-- Select Crop (e.g. Rice, Wheat, Tomato) --</option>
          {crops.map((c) => (
            <option key={c.id} value={c.id} className="bg-emerald-950 text-white">
              {language === 'hi' && c.name_hi ? c.name_hi : c.name} ({c.category || 'Crop'})
            </option>
          ))}
        </select>
      </div>

      {/* Upload area */}
      <div className="glass-card p-6 border border-emerald-500/25 shadow-2xl">
        <h3 className="text-base font-bold text-white mb-1">
          {t('disease_upload') || '2. Upload or Capture Leaf Image'}
        </h3>
        <p className="text-xs text-emerald-300/80 mb-4">
          {t('disease_upload_desc') || 'Take a close-up photo of the affected leaf showing spots or discoloration.'}
        </p>
        
        {preview ? (
          <div className="relative rounded-2xl overflow-hidden border border-emerald-400/40 bg-emerald-950/60 p-2 shadow-inner">
            <img src={preview} alt="Leaf Preview" className="w-full rounded-xl max-h-72 object-contain mx-auto" />
            <button
              onClick={() => { setFile(null); setPreview(null); setResult(null); }}
              className="absolute top-4 right-4 bg-emerald-950/90 border border-emerald-400/50 text-emerald-200 hover:text-white rounded-full p-2 shadow-xl hover:scale-110 transition-all"
              title="Remove image"
            >
              ✕
            </button>
          </div>
        ) : (
          <div
            className="border-2 border-dashed border-emerald-500/40 rounded-2xl p-8 sm:p-10 text-center cursor-pointer hover:border-lime-400 hover:bg-emerald-900/30 transition-all group"
            onClick={() => fileRef.current?.click()}
            onDrop={(e) => { e.preventDefault(); if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]); }}
            onDragOver={(e) => e.preventDefault()}
          >
            <div className="w-16 h-16 rounded-full bg-emerald-900/70 border border-emerald-400/40 flex items-center justify-center mx-auto mb-3 text-lime-400 group-hover:scale-110 transition-transform shadow-lg">
              <Upload className="w-8 h-8" />
            </div>
            <p className="text-white font-bold text-sm sm:text-base">Upload or Capture Image</p>
            <p className="text-emerald-400/70 text-xs mt-1">Supports JPG, PNG, WEBP from Camera or Gallery</p>
          </div>
        )}

        <div className="flex gap-3 mt-4">
          <button
            onClick={() => cameraRef.current?.click()}
            className="btn-secondary flex-1 text-xs sm:text-sm"
          >
            <Camera className="w-4 h-4 text-lime-400" />
            <span>{t('disease_capture') || 'Take Live Photo'}</span>
          </button>
          <button
            onClick={() => fileRef.current?.click()}
            className="btn-secondary flex-1 text-xs sm:text-sm"
          >
            <Upload className="w-4 h-4 text-emerald-400" />
            <span>{t('disease_gallery') || 'Upload from Gallery'}</span>
          </button>
        </div>

        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
        <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
      </div>

      {/* Analyze button */}
      {file && !result && (
        <button
          onClick={analyze}
          disabled={analyzing}
          className="btn-primary w-full text-base py-3.5 shadow-xl shadow-emerald-500/25"
        >
          {analyzing ? (
            <>
              <div className="w-5 h-5 border-2 border-gray-950 border-t-transparent rounded-full animate-spin" />
              <span>{t('disease_analyzing') || 'Analyzing Plant Leaf with AI...'}</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              <span>{t('disease_analyze') || 'Run AI Diagnosis Now'}</span>
            </>
          )}
        </button>
      )}

      {/* Analysis Results Display */}
      {result && (
        <div className="glass-card p-6 border-2 border-emerald-400/50 shadow-2xl space-y-4 animate-fade-in bg-gradient-to-b from-emerald-950/90 to-emerald-900/80">
          <div className="flex items-center justify-between border-b border-emerald-500/20 pb-3">
            <h2 className="text-lg sm:text-xl font-extrabold text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-lime-400" />
              <span>{t('disease_results') || 'Diagnostic Assessment'}</span>
            </h2>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-lime-400/20 text-lime-300 border border-lime-400/30">
              {result.confidence || 'AI Verified'}
            </span>
          </div>

          <div>
            <p className="text-xs uppercase font-bold tracking-wider text-emerald-300 mb-1.5">
              {t('disease_diagnosis') || 'Findings & Symptoms'}
            </p>
            <div className="text-white text-sm sm:text-base leading-relaxed bg-emerald-950/80 p-4 rounded-xl border border-emerald-500/30 whitespace-pre-wrap font-medium">
              {result.diagnosis}
            </div>
          </div>

          {result.suggestions && (
            <div>
              <p className="text-xs uppercase font-bold tracking-wider text-lime-300 mb-1.5">
                {t('disease_suggestions') || 'Recommended Next Steps & Remedies'}
              </p>
              <div className="text-emerald-100 text-xs sm:text-sm leading-relaxed bg-emerald-950/60 p-4 rounded-xl border border-emerald-500/20 whitespace-pre-wrap">
                {result.suggestions}
              </div>
            </div>
          )}

          {/* Expert Verification Advisory */}
          <div className="flex items-start gap-3 bg-amber-950/60 border border-amber-500/40 p-4 rounded-2xl shadow-md">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-200/90 leading-relaxed">
              <span className="font-bold text-amber-300 block mb-0.5">Agricultural Advisory Disclaimer:</span>
              {t('disease_disclaimer') ||
                'This is an AI-assisted preliminary assessment. Before applying chemical sprays, confirm with your local Krishi Vigyan Kendra (KVK) or Kisan Call Centre (1800-180-1551).'}
            </div>
          </div>
        </div>
      )}

      {/* Previous Reports History */}
      <div className="space-y-3">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <span>{t('disease_previous') || 'Previous Diagnostic Reports'}</span>
        </h2>

        {reports.length === 0 ? (
          <EmptyState icon={<Bug className="w-12 h-12" />} title={t('disease_no_reports') || 'No previous reports recorded'} />
        ) : (
          <div className="space-y-3">
            {reports.map((r) => (
              <div
                key={r.id}
                className="glass-card p-5 border border-emerald-500/25 hover:border-emerald-400/50 transition-all shadow-lg space-y-2"
              >
                <div className="flex items-start justify-between gap-3 border-b border-emerald-500/15 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-lime-400" />
                    <span className="font-bold text-white text-sm sm:text-base">
                      {r.crop_id ? `Crop ID #${r.crop_id}` : 'Leaf Scan'}
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-emerald-300/80 bg-emerald-950/80 px-2.5 py-1 rounded-full border border-emerald-500/20">
                    {new Date(r.created_at).toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </span>
                </div>

                {/* Clearly visible, bright, formatted diagnosis text */}
                <p className="text-sm text-emerald-100 font-medium leading-relaxed whitespace-pre-wrap">
                  {r.diagnosis}
                </p>

                {r.suggestions && (
                  <p className="text-xs text-emerald-300/80 bg-emerald-950/60 p-2.5 rounded-xl border border-emerald-500/20">
                    <strong className="text-lime-300">Remedy: </strong> {r.suggestions}
                  </p>
                )}

                <div className="flex items-center justify-between text-[11px] text-emerald-400/80 pt-1">
                  <span>Confidence: <strong className="text-white">{r.confidence || 'AI-based'}</strong></span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
