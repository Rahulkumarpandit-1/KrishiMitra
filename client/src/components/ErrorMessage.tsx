import { AlertTriangle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface ErrorMessageProps {
  message?: string;
  onRetry?: () => void;
}

export default function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  const { t } = useLanguage();
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <AlertTriangle className="w-12 h-12 text-red-400 mb-3" />
      <p className="text-gray-700 font-medium mb-1">{message || t('common_error')}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn-primary mt-3 text-sm px-4 py-2">
          {t('common_retry')}
        </button>
      )}
    </div>
  );
}
