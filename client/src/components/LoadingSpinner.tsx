import { Loader2 } from 'lucide-react';

export default function LoadingSpinner({ text }: { text?: string }) {
  return (
    <div 
      role="status" 
      aria-live="polite" 
      className="flex flex-col items-center justify-center min-h-[200px] py-12 gap-3"
    >
      <Loader2 className="w-10 h-10 text-emerald-400 animate-spin" aria-hidden="true" />
      <span className="sr-only">Loading content, please wait...</span>
      {text && <p className="text-emerald-300/80 text-sm font-medium">{text}</p>}
    </div>
  );
}
