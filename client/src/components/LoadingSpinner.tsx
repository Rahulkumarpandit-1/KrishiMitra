import { Loader2 } from 'lucide-react';

export default function LoadingSpinner({ text }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-3">
      <Loader2 className="w-10 h-10 text-primary-600 animate-spin" />
      {text && <p className="text-gray-500 text-sm">{text}</p>}
    </div>
  );
}
