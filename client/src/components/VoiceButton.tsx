import { useState, useCallback, useRef, useEffect } from 'react';
import { Mic, MicOff, Volume2, AlertCircle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface VoiceButtonProps {
  onResult: (text: string) => void;
  onInterim?: (text: string) => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export default function VoiceButton({
  onResult,
  onInterim,
  className = '',
  size = 'md',
  showLabel = false
}: VoiceButtonProps) {
  const [listening, setListening] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const { language } = useLanguage();
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const isHi = language === 'hi';

  const stopListening = useCallback(() => {
    try {
      recognitionRef.current?.stop();
    } catch {
      // ignore
    }
    setListening(false);
  }, []);

  const startListening = useCallback(() => {
    setErrorMsg(null);
    const SpeechRecognitionClass = window.SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      setErrorMsg(isHi ? 'आपके ब्राउज़र में वॉइस सपोर्ट उपलब्ध नहीं है' : 'Voice recognition not supported in this browser');
      setTimeout(() => setErrorMsg(null), 4000);
      return;
    }

    try {
      const recognition = new SpeechRecognitionClass();
      recognition.lang = isHi ? 'hi-IN' : 'en-IN';
      recognition.continuous = false;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setListening(true);
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let interimText = '';
        let finalText = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalText += transcript;
          } else {
            interimText += transcript;
          }
        }

        if (interimText && onInterim) {
          onInterim(interimText);
        }

        if (finalText) {
          onResult(finalText.trim());
          setListening(false);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          setErrorMsg(isHi ? 'कृपया माइक्रोफ़ोन की अनुमति दें' : 'Please allow microphone access in browser settings');
        } else if (event.error === 'no-speech') {
          // just timeout silently
        } else {
          setErrorMsg(isHi ? 'आवाज़ पहचान में समस्या आई' : 'Voice input error');
        }
        setListening(false);
        setTimeout(() => setErrorMsg(null), 4000);
      };

      recognition.onend = () => {
        setListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      console.warn('Failed to start speech recognition:', err);
      setErrorMsg(isHi ? 'माइक्रोफ़ोन शुरू नहीं हो सका' : 'Could not activate microphone');
      setListening(false);
      setTimeout(() => setErrorMsg(null), 4000);
    }
  }, [isHi, onInterim, onResult]);

  const toggle = () => {
    if (listening) {
      stopListening();
    } else {
      startListening();
    }
  };

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
    };
  }, []);

  const sizeClasses = {
    sm: 'w-9 h-9 min-h-[36px] min-w-[36px] text-xs',
    md: 'w-11 h-11 min-h-[44px] min-w-[44px] text-sm',
    lg: 'w-14 h-14 min-h-[56px] min-w-[56px] text-base'
  }[size];

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-7 h-7'
  }[size];

  return (
    <div className="relative inline-flex items-center">
      <button
        type="button"
        onClick={toggle}
        className={`rounded-full flex items-center justify-center transition-all duration-300 relative group active:scale-95 shadow-lg ${
          listening
            ? 'bg-rose-500 text-white animate-pulse ring-4 ring-rose-400/40 shadow-rose-500/50'
            : 'bg-gradient-to-tr from-emerald-600 to-lime-400 text-gray-950 hover:from-emerald-500 hover:to-lime-300 shadow-emerald-950/40 hover:shadow-lime-400/30'
        } ${sizeClasses} ${className}`}
        title={listening ? (isHi ? 'बोलना बंद करें' : 'Stop Listening') : (isHi ? 'माइक दबाकर बोलें' : 'Tap to Speak')}
      >
        {listening && (
          <span className="absolute -inset-1 rounded-full bg-rose-400 animate-ping opacity-60 pointer-events-none" />
        )}
        {listening ? <MicOff className={iconSizes} /> : <Mic className={iconSizes} />}
      </button>

      {showLabel && (
        <span
          onClick={toggle}
          className="ml-2.5 text-xs font-semibold cursor-pointer select-none transition-colors"
        >
          {listening ? (
            <span className="text-rose-400 flex items-center gap-1.5 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-rose-400" />
              {isHi ? 'सुन रहा हूँ... बोलिए' : 'Listening... Speak now'}
            </span>
          ) : (
            <span className="text-emerald-200 group-hover:text-white">
              {isHi ? 'बोलकर पूछें' : 'Speak to Ask'}
            </span>
          )}
        </span>
      )}

      {/* Floating Error Notice */}
      {errorMsg && (
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 z-50 whitespace-nowrap bg-rose-950 text-rose-200 border border-rose-500/40 text-[11px] px-2.5 py-1 rounded-full flex items-center gap-1 shadow-xl animate-fade-in">
          <AlertCircle className="w-3 h-3 text-rose-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}
    </div>
  );
}
