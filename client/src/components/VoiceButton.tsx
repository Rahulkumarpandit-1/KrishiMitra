import { useState, useCallback, useRef } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface VoiceButtonProps {
  onResult: (text: string) => void;
  className?: string;
}

export default function VoiceButton({ onResult, className = '' }: VoiceButtonProps) {
  const [listening, setListening] = useState(false);
  const { language, t } = useLanguage();
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const toggle = useCallback(() => {
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.lang = language === 'hi' ? 'hi-IN' : 'en-IN';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const text = event.results[0][0].transcript;
      onResult(text);
      setListening(false);
    };

    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  }, [listening, language, onResult]);

  return (
    <button
      onClick={toggle}
      className={`min-h-[44px] min-w-[44px] rounded-full flex items-center justify-center transition-all ${
        listening
          ? 'bg-red-500 text-white animate-pulse'
          : 'bg-primary-100 text-primary-700 hover:bg-primary-200'
      } ${className}`}
      title={listening ? t('assistant_listening') : 'Voice input'}
    >
      {listening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
    </button>
  );
}
