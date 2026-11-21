import { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, MicOff, X, Check, Volume2, Sparkles, AlertCircle, RefreshCw } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface VoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (text: string) => Promise<string | void>;
  initialCropName?: string;
}

export default function VoiceModal({
  isOpen,
  onClose,
  onSubmit,
  initialCropName
}: VoiceModalProps) {
  const { language } = useLanguage();
  const isHi = language === 'hi';

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Quick sample prompts for immediate tap
  const quickPrompts = isHi
    ? [
        'अगली सिंचाई कब करनी चाहिए?',
        'पत्तियां पीली क्यों हो रही हैं?',
        'क्या कल कीटनाशक स्प्रे कर सकते हैं?',
        'इस अवस्था में कौन सी खाद डालें?'
      ]
    : [
        'When should I irrigate next?',
        'Why are my crop leaves turning yellow?',
        'Is tomorrow good for spraying pesticides?',
        'What fertilizer dosage for this stage?'
      ];

  const [selectedLang, setSelectedLang] = useState<'hi' | 'en'>(isHi ? 'hi' : 'en');

  // Stop listening
  const stopListening = useCallback(() => {
    try {
      recognitionRef.current?.stop();
    } catch {
      // ignore
    }
    setIsListening(false);
  }, []);

  // Text to speech playback
  const speak = useCallback((text: string) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();

    const clean = text.replace(/[*#_`]/g, '').replace(/https?:\/\/\S+/g, '');
    const utter = new SpeechSynthesisUtterance(clean);
    utter.lang = selectedLang === 'hi' ? 'hi-IN' : 'en-IN';
    utter.rate = 0.95;
    utter.onend = () => setIsSpeaking(false);
    utter.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utter);
    setIsSpeaking(true);
  }, [selectedLang]);

  // Start listening with Web Speech API and explicit mic permission probe
  const startListening = useCallback(async () => {
    setErrorMsg(null);
    setTranscript('');
    setInterimTranscript('');
    setAiResponse(null);

    const SpeechRecognitionClass = window.SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      setErrorMsg(
        isHi
          ? 'आपके ब्राउज़र में आवाज़ पहचान उपलब्ध नहीं है। कृपया Google Chrome या Edge का उपयोग करें।'
          : 'Speech recognition not supported in this browser. Please use Chrome or Edge.'
      );
      return;
    }

    // Explicit mic permission check to trigger browser permission dialog
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach((track) => track.stop());
      } catch (micErr: any) {
        console.warn('Microphone permission check:', micErr);
        if (micErr.name === 'NotAllowedError' || micErr.name === 'PermissionDeniedError') {
          setErrorMsg(
            isHi
              ? 'माइक्रोफ़ोन की अनुमति नहीं मिली। कृपया ब्राउज़र एड्रेस बार में लॉक/माइक आइकन पर क्लिक करके "Allow" करें।'
              : 'Microphone permission blocked. Please click the lock or camera icon in the browser address bar and choose "Allow".'
          );
          return;
        }
      }
    }

    try {
      if (recognitionRef.current) {
        try { (recognitionRef.current as any).abort(); } catch {}
      }

      const recognition = new SpeechRecognitionClass();
      recognition.lang = selectedLang === 'hi' ? 'hi-IN' : 'en-IN';
      recognition.continuous = false;
      recognition.interimResults = true;
      (recognition as any).maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        setErrorMsg(null);
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let interim = '';
        let final = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const text = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            final += text;
          } else {
            interim += text;
          }
        }

        if (interim) setInterimTranscript(interim);
        if (final) {
          const trimmed = final.trim();
          setTranscript(trimmed);
          setInterimTranscript('');
          setIsListening(false);
          // Auto submit to AI
          handleConfirmSubmit(trimmed);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('SpeechRecognition error:', event.error);
        if (event.error === 'not-allowed') {
          setErrorMsg(
            isHi
              ? 'माइक्रोफ़ोन की अनुमति नहीं मिली। कृपया ब्राउज़र सेटिंग्स में माइक को Allow करें।'
              : 'Microphone permission denied. Please allow mic access in your browser.'
          );
        } else if (event.error === 'no-speech') {
          setErrorMsg(
            isHi
              ? 'कोई आवाज़ सुनाई नहीं दी। कृपया माइक बटन दबाकर दोबारा बोलें।'
              : 'No speech was detected. Tap the mic button to speak again.'
          );
        } else if (event.error === 'network') {
          setErrorMsg(
            isHi
              ? 'नेटवर्क समस्या के कारण आवाज़ पहचानी नहीं जा सकी। इंटरनेट चेक करें।'
              : 'Network error with speech service. Please verify your connection.'
          );
        } else {
          setErrorMsg(isHi ? 'आवाज़ पहचानने में समस्या आई।' : 'Speech recognition error.');
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      console.warn('Failed to start speech:', err);
      setErrorMsg(isHi ? 'माइक्रोफ़ोन सक्रिय नहीं हो सका।' : 'Could not activate microphone.');
      setIsListening(false);
    }
  }, [isHi, selectedLang]);

  // Handle submit query
  const handleConfirmSubmit = async (queryText?: string) => {
    const textToSubmit = queryText || transcript || interimTranscript;
    if (!textToSubmit.trim()) return;

    stopListening();
    setIsProcessing(true);
    try {
      const result = await onSubmit(textToSubmit);
      if (typeof result === 'string') {
        setAiResponse(result);
        speak(result);
      }
    } catch (err: any) {
      console.error('Voice submit error:', err);
      setErrorMsg(isHi ? 'जवाब प्राप्त करने में समस्या आई।' : 'Failed to get answer.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Auto start when modal opens
  useEffect(() => {
    if (isOpen) {
      startListening();
    } else {
      stopListening();
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      setIsSpeaking(false);
      setAiResponse(null);
      setTranscript('');
      setInterimTranscript('');
      setErrorMsg(null);
    }
  }, [isOpen, startListening, stopListening]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Blurred Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-xl transition-opacity animate-fade-in"
        onClick={() => {
          stopListening();
          onClose();
        }}
      />

      {/* Main Glass Voice Card (ChatGPT Style) */}
      <div className="relative w-full max-w-lg glass-card p-6 sm:p-8 rounded-3xl border border-emerald-400/50 shadow-2xl z-10 flex flex-col items-center text-center overflow-hidden bg-gradient-to-b from-[#071c0f]/95 to-[#040e07]/95">
        
        {/* Top Close Button */}
        <button
          onClick={() => {
            stopListening();
            onClose();
          }}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-emerald-950 border border-emerald-500/30 flex items-center justify-center text-emerald-400 hover:text-white hover:border-lime-400 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Header */}
        <div className="flex items-center gap-2 mb-2">
          <span className="w-2 h-2 rounded-full bg-lime-400 animate-pulse" />
          <span className="text-xs font-bold text-lime-300 uppercase tracking-wider">
            {isHi ? 'कृषि मित्र वॉइस मोड' : 'KrishiMitra Voice Mode'}
          </span>
        </div>

        <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
          {isProcessing
            ? (isHi ? 'सोच रहे हैं...' : 'Thinking...')
            : isListening
            ? (isHi ? 'बोलिए, हम सुन रहे हैं...' : 'Listening... Speak now')
            : (isHi ? 'अपना सवाल पुष्टि करें' : 'Confirm Your Question')}
        </h3>

        {/* 3D Animated DotLottie Orb / Waveform Area */}
        <div className="relative w-44 h-44 my-4 flex items-center justify-center">
          {/* Ambient Glow */}
          <div className={`absolute inset-0 rounded-full blur-2xl transition-all duration-500 ${
            isListening ? 'bg-lime-400/25 scale-110 animate-pulse' : isProcessing ? 'bg-sky-400/25 scale-100' : 'bg-emerald-500/15'
          }`} />

          {/* DotLottie Animated Orb */}
          <div className="relative w-36 h-36 flex items-center justify-center">
            <dotlottie-player
              src="https://lottie.host/89534c3f-10dd-4fac-b3fb-867963f3cffc/YerGkXzK8J.lottie"
              background="transparent"
              speed={isListening ? '1.4' : '0.8'}
              style={{ width: '140px', height: '140px' }}
              loop
              autoplay
            />
          </div>

          {/* Audio Visualization Waves when listening */}
          {isListening && (
            <div className="absolute -bottom-2 flex items-center gap-1">
              {[40, 75, 55, 90, 60, 80, 45].map((h, i) => (
                <div
                  key={i}
                  className="w-1 bg-lime-400 rounded-full animate-pulse"
                  style={{
                    height: `${h * 0.25}px`,
                    animationDelay: `${i * 120}ms`
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Live Transcript / Response Box */}
        <div className="w-full min-h-[90px] max-h-48 overflow-y-auto p-4 rounded-2xl bg-emerald-950/70 border border-emerald-400/30 text-left my-2 shadow-inner">
          {aiResponse ? (
            <div>
              <div className="flex items-center justify-between text-xs text-lime-400 font-bold mb-1">
                <span>{isHi ? 'कृषि मित्र उत्तर:' : 'KrishiMitra Advisory:'}</span>
                <button
                  onClick={() => speak(aiResponse)}
                  className="flex items-center gap-1 text-[11px] text-emerald-300 hover:text-white"
                >
                  <Volume2 className="w-3.5 h-3.5 text-lime-300" />
                  <span>{isSpeaking ? (isHi ? 'बोल रहा है...' : 'Speaking...') : (isHi ? 'पुनः सुनें' : 'Replay')}</span>
                </button>
              </div>
              <p className="text-xs sm:text-sm text-emerald-100 leading-relaxed whitespace-pre-wrap">
                {aiResponse}
              </p>
            </div>
          ) : (
            <div>
              <p className="text-xs text-emerald-400/80 font-medium mb-1">
                {isHi ? 'आपकी आवाज़ (Transcribed Speech):' : 'Your Speech:'}
              </p>
              <p className="text-sm sm:text-base font-semibold text-white">
                {transcript || interimTranscript || (
                  <span className="text-emerald-500/60 italic font-normal">
                    {isListening
                      ? (isHi ? 'साफ और स्पष्ट आवाज़ में बोलें...' : 'Start speaking clearly...')
                      : (isHi ? 'माइक पर टैप करके सवाल बोलें या नीचे से चुनें' : 'Tap mic to speak or select a quick question below')}
                  </span>
                )}
              </p>
            </div>
          )}
        </div>

        {/* Error / Permission Guidance */}
        {errorMsg && (
          <div className="w-full my-2 p-3 rounded-xl bg-rose-950/70 border border-rose-500/40 text-rose-200 text-xs flex items-start gap-2 text-left">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span>{errorMsg}</span>
              <button
                onClick={startListening}
                className="block text-lime-300 font-bold mt-1 underline hover:text-white"
              >
                {isHi ? 'दोबारा कोशिश करें' : 'Try Again'}
              </button>
            </div>
          </div>
        )}

        {/* Quick Question Chips (If user wants 1-tap questions) */}
        {!aiResponse && (
          <div className="w-full my-3">
            <p className="text-[11px] text-emerald-400/70 mb-2 font-medium">
              {isHi ? 'या इन आम सवालों पर सीधा टैप करें:' : 'Or tap one of these common questions:'}
            </p>
            <div className="flex flex-wrap gap-1.5 justify-center">
              {quickPrompts.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setTranscript(q);
                    handleConfirmSubmit(q);
                  }}
                  className="px-3 py-1.5 rounded-full text-xs font-medium bg-emerald-900/60 border border-emerald-500/30 text-emerald-200 hover:text-white hover:border-lime-400 hover:bg-emerald-800 transition-all text-left"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Bottom Controls (ChatGPT-Style Big Buttons) */}
        <div className="flex items-center justify-center gap-4 mt-4 w-full">
          {aiResponse ? (
            <div className="flex items-center gap-3 w-full">
              <button
                onClick={() => {
                  setAiResponse(null);
                  startListening();
                }}
                className="flex-1 py-3 px-4 rounded-2xl bg-emerald-900 border border-emerald-400/40 text-white font-bold text-xs sm:text-sm hover:bg-emerald-800 transition-all flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4 text-lime-400" />
                <span>{isHi ? 'दूसरा सवाल पूछें' : 'Ask Another'}</span>
              </button>
              <button
                onClick={() => {
                  stopListening();
                  onClose();
                }}
                className="py-3 px-6 rounded-2xl bg-lime-400 text-gray-950 font-extrabold text-xs sm:text-sm hover:bg-lime-300 transition-all"
              >
                {isHi ? 'समाप्त' : 'Done'}
              </button>
            </div>
          ) : (
            <>
              {/* Cancel Button */}
              <button
                type="button"
                onClick={() => {
                  stopListening();
                  onClose();
                }}
                className="w-13 h-13 p-3.5 rounded-full bg-rose-950/80 border border-rose-500/40 text-rose-300 hover:bg-rose-900 hover:text-white transition-all shadow-lg active:scale-95"
                title={isHi ? 'रद्द करें' : 'Cancel'}
              >
                <X className="w-6 h-6" />
              </button>

              {/* Large Center Mic Toggle */}
              <button
                type="button"
                onClick={() => {
                  if (isListening) stopListening();
                  else startListening();
                }}
                className={`w-16 h-16 rounded-full flex items-center justify-center transition-all shadow-2xl active:scale-95 ${
                  isListening
                    ? 'bg-rose-500 text-white ring-4 ring-rose-400/40 animate-pulse'
                    : 'bg-gradient-to-tr from-emerald-500 to-lime-400 text-gray-950 hover:scale-105'
                }`}
                title={isListening ? 'Stop' : 'Speak'}
              >
                {isListening ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
              </button>

              {/* Submit Button */}
              <button
                type="button"
                disabled={isProcessing || (!transcript && !interimTranscript)}
                onClick={() => handleConfirmSubmit()}
                className="w-13 h-13 p-3.5 rounded-full bg-emerald-500 text-gray-950 font-bold hover:bg-lime-400 disabled:opacity-40 transition-all shadow-lg active:scale-95"
                title={isHi ? 'भेजें' : 'Submit'}
              >
                {isProcessing ? (
                  <div className="w-6 h-6 border-2 border-gray-950 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Check className="w-6 h-6" />
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
