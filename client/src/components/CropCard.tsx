import { Sprout, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import type { FarmerCrop } from '../lib/types';

interface CropCardProps {
  crop: FarmerCrop;
}

export default function CropCard({ crop }: CropCardProps) {
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  const statusColor = {
    active: 'bg-emerald-500/20 text-lime-300 border border-emerald-400/30',
    harvested: 'bg-amber-500/20 text-amber-300 border border-amber-400/30',
    cancelled: 'bg-rose-500/20 text-rose-300 border border-rose-400/30',
  }[crop.status] || 'bg-emerald-950/60 text-emerald-300';

  const statusLabel = {
    active: t('crops_active'),
    harvested: t('crops_harvested'),
    cancelled: t('crops_cancelled'),
  }[crop.status] || crop.status;

  const cropName = language === 'hi' && crop.crop?.name_hi ? crop.crop.name_hi : (crop.crop?.name || crop.crop_name);

  return (
    <button
      onClick={() => navigate(`/crops/${crop.id}`)}
      className="card w-full text-left glass-card-hover flex items-center gap-3.5 border border-emerald-500/20"
    >
      <div className="w-12 h-12 rounded-2xl bg-emerald-950 border border-emerald-400/30 flex items-center justify-center shrink-0 shadow-md">
        <Sprout className="w-6 h-6 text-lime-400" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-white text-base truncate">{cropName}</h3>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${statusColor}`}>{statusLabel}</span>
        </div>
        <div className="text-xs text-emerald-300/80 mt-1 flex flex-wrap gap-x-3 gap-y-0.5">
          {crop.growth_stage?.current_stage && (
            <span className="text-lime-300 font-medium">
              {t('crops_stage')}: {crop.growth_stage.current_stage}
            </span>
          )}
          {crop.days_since_sowing !== undefined && <span>{crop.days_since_sowing} {t('crops_days')}</span>}
          {crop.field_size > 0 && <span>{crop.field_size} {t('common_acres')}</span>}
        </div>
      </div>
      <ChevronRight className="w-5 h-5 text-emerald-400/60 shrink-0" />
    </button>
  );
}
