import { useState, useEffect, useCallback, useRef } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { assistantApi, farmerCropsApi } from '../lib/api';
import VoiceButton from '../components/VoiceButton';
import LoadingSpinner from '../components/LoadingSpinner';
import { Send, Plus, Trash2, Volume2, Sparkles, ChevronLeft, Menu, Bot, User, ImageIcon } from 'lucide-react';
import type { Conversation, Message, FarmerCrop } from '../lib/types';

export default function Assistant() {
  const { t, language } = useLanguage();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [crops, setCrops] = useState<FarmerCrop[]>([]);
  const [cropId, setCropId] = useState<number | undefined>();
  const [showSidebar, setShowSidebar] = useState(false);
  const [speakingId, setSpeakingId] = useState<number | null>(null);
  const messagesEnd = useRef<HTMLDivElement>(null);
  const isHi = language === 'hi';

  const loadConversations = useCallback(async () => {
    try {
      const [cRes, crRes] = await Promise.all([assistantApi.conversations(), farmerCropsApi.list()]);
      const convList = cRes.data.conversations || (cRes.data as any) || [];
      const safeConvList = Array.isArray(convList) ? convList : [];
      setConversations(safeConvList);

      const cropList = crRes.data.farmer_crops || (crRes.data as any) || [];
      const safeCropList = Array.isArray(cropList) ? cropList : [];
      setCrops(safeCropList.filter((c: any) => c.status === 'active'));

      if (safeConvList.length > 0 && !activeId) {
        setActiveId(safeConvList[0].id);
      }
    } catch (err) {
      console.error('Failed to load conversations:', err);
    } finally {
      setLoading(false);
    }
  }, [activeId]);

  useEffect(() => { loadConversations(); }, [loadConversations]);

  const loadMessages = useCallback(async (id: number) => {
    try {
      const res = await assistantApi.getConversation(id);
      const msgList = res.data.messages || (res.data as any)?.data?.messages || [];
      setMessages(Array.isArray(msgList) ? msgList : []);
    } catch (err) {
      console.error('Failed to load messages:', err);
    }
  }, []);

  useEffect(() => {
    if (activeId) loadMessages(activeId);
    else setMessages([]);
  }, [activeId, loadMessages]);

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  const newConversation = async () => {
    try {
      const title = isHi ? 'नई कृषि चर्चा' : 'New Farm Advisory';
      const res = await assistantApi.createConversation(title, cropId);
      const conv = res.data.conversation || (res.data as any);
      setConversations([conv, ...conversations]);
      setActiveId(conv.id);
      setMessages([]);
      setShowSidebar(false);
    } catch (err) {
      console.error('Failed to create new conversation:', err);
    }
  };

  const deleteConversation = async (id: number) => {
    if (!confirm(t('assistant_delete_confirm') || 'Delete this conversation?')) return;
    try {
      await assistantApi.deleteConversation(id);
      const updated = conversations.filter((c) => c.id !== id);
      setConversations(updated);
      if (activeId === id) {
        const nextId = updated.length > 0 ? updated[0].id : null;
        setActiveId(nextId);
        if (!nextId) setMessages([]);
      }
    } catch (err) {
      console.error('Delete conversation error:', err);
    }
  };

  const speak = (msgId: number, text: string) => {
    if (!window.speechSynthesis) return;

    if (speakingId === msgId) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
      return;
    }

    window.speechSynthesis.cancel();
    // Clean markdown stars/formatting for clean voice synthesis
    const cleanText = text.replace(/[*#_`]/g, '').replace(/https?:\/\/\S+/g, '');
    const utter = new SpeechSynthesisUtterance(cleanText);
    utter.lang = isHi ? 'hi-IN' : 'en-IN';
    utter.rate = 0.95;
    utter.onend = () => setSpeakingId(null);
    utter.onerror = () => setSpeakingId(null);

    window.speechSynthesis.speak(utter);
    setSpeakingId(msgId);
  };

  const send = async (textToSend?: string, autoSpeak = false) => {
    const text = textToSend || input;
    if (!text.trim() || sending) return;

    setInput('');
    let currentConvId = activeId;

    // Auto-create conversation if none exists
    if (!currentConvId) {
      try {
        const title = text.slice(0, 35) + (text.length > 35 ? '...' : '');
        const newRes = await assistantApi.createConversation(title, cropId);
        const newConv = newRes.data.conversation || (newRes.data as any);
        setConversations((prev) => [newConv, ...prev]);
        setActiveId(newConv.id);
        currentConvId = newConv.id;
      } catch (err) {
        console.error('Auto create conversation error:', err);
        currentConvId = 1;
      }
    }

    const userMsg: Message = {
      id: Date.now(),
      role: 'user',
      content: text,
      created_at: new Date().toISOString()
    };
    setMessages((prev) => [...prev, userMsg]);
    setSending(true);

    try {
      const res = await assistantApi.chat(currentConvId, text, cropId);
      const dataAny = res.data as any;
      const content =
        dataAny.assistant_message ||
        dataAny.message?.content ||
        dataAny.content ||
        (isHi ? 'आपकी फसल व मौसम अनुसार कृषि परामर्श तैयार किया गया है।' : 'Advisory generated for your crop and weather conditions.');

      const visual = dataAny.visual || dataAny.message?.visual;

      const assistantMsg: any = {
        id: Date.now() + 1,
        role: 'assistant',
        content,
        visual,
        created_at: new Date().toISOString()
      };
      setMessages((prev) => [...prev, assistantMsg]);

      // If user queried by voice, auto-speak response aloud
      if (autoSpeak) {
        speak(assistantMsg.id, content);
      }
    } catch (err) {
      console.error('Chat error:', err);
      const fallbackMsg: Message = {
        id: Date.now() + 1,
        role: 'assistant',
        content: isHi
          ? 'वर्तमान मौसम और फसल स्थिति के अनुसार उचित नमी बनाए रखें और नियमित कीट निगरानी करें।'
          : 'Based on current weather and crop conditions, maintain optimal soil moisture and scout for pests.',
        created_at: new Date().toISOString()
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setSending(false);
    }
  };

  const suggestedQuestions = [
    { en: 'What should I do for my crop this week?', hi: 'इस हफ्ते मेरी फसल के लिए क्या जरूरी कार्य हैं?' },
    { en: 'When should I irrigate my field next?', hi: 'खेत में अगली सिंचाई कब करनी चाहिए?' },
    { en: 'Why are leaves turning yellow?', hi: 'फसल की पत्तियां पीली क्यों पड़ रही हैं?' },
    { en: 'Is weather suitable for spraying pesticides tomorrow?', hi: 'क्या कल कीटनाशक स्प्रे करने के लिए मौसम सही है?' },
  ];

  if (loading) return <LoadingSpinner />;

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] md:h-[calc(100vh-4rem)] max-w-6xl mx-auto glass-card overflow-hidden border border-emerald-500/25 shadow-2xl">
      {/* Mobile Sidebar Overlay */}
      {showSidebar && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowSidebar(false)} />
          <div className="relative bg-[#091b10] border-r border-emerald-500/30 w-80 h-full overflow-y-auto p-4 space-y-3 z-10">
            <div className="flex items-center justify-between pb-3 border-b border-emerald-500/20">
              <span className="font-bold text-white text-base">Conversations</span>
              <button onClick={() => setShowSidebar(false)} className="text-emerald-400 p-1">✕</button>
            </div>
            <button onClick={newConversation} className="btn-primary w-full text-xs py-2.5">
              <Plus className="w-4 h-4" /> {t('assistant_new') || 'New Conversation'}
            </button>
            <div className="space-y-1 mt-2">
              {conversations.map((c) => (
                <div
                  key={c.id}
                  className={`flex items-center gap-2 p-3 rounded-2xl cursor-pointer transition-all ${
                    activeId === c.id
                      ? 'bg-emerald-900/90 text-white font-bold border border-lime-400/50'
                      : 'text-emerald-200/80 hover:bg-emerald-950/60'
                  }`}
                >
                  <button onClick={() => { setActiveId(c.id); setShowSidebar(false); }} className="flex-1 text-left text-xs truncate">
                    {c.title}
                  </button>
                  <button onClick={() => deleteConversation(c.id)} className="text-emerald-400 hover:text-rose-400 p-1">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Conversation Sidebar */}
        <div className="hidden md:flex flex-col w-72 border-r border-emerald-500/20 bg-emerald-950/50 overflow-y-auto">
          <div className="p-4 border-b border-emerald-500/20">
            <button onClick={newConversation} className="btn-primary w-full text-xs py-2.5 shadow-md">
              <Plus className="w-4 h-4" /> {t('assistant_new') || 'New Conversation'}
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {conversations.map((c) => (
              <div
                key={c.id}
                className={`group flex items-center justify-between p-3 rounded-2xl cursor-pointer transition-all ${
                  activeId === c.id
                    ? 'bg-emerald-900/80 text-white font-bold border border-lime-400/40 shadow-md'
                    : 'text-emerald-200/70 hover:bg-emerald-900/40 hover:text-white'
                }`}
              >
                <button onClick={() => setActiveId(c.id)} className="flex-1 text-left text-xs truncate mr-2">
                  {c.title}
                </button>
                <button
                  onClick={() => deleteConversation(c.id)}
                  className="text-emerald-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                  title="Delete"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Main Chat Interface */}
        <div className="flex-1 flex flex-col overflow-hidden bg-gradient-to-b from-[#06150b] to-[#040e07]">
          {/* Top Bar */}
          <div className="flex items-center justify-between p-3.5 sm:p-4 border-b border-emerald-500/20 bg-emerald-950/60 backdrop-blur-md">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowSidebar(true)}
                className="md:hidden p-1.5 rounded-lg text-emerald-300 hover:bg-emerald-900"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-emerald-600 to-lime-400 flex items-center justify-center text-gray-950 font-bold shadow-md">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-bold text-white text-sm sm:text-base leading-tight">
                  {isHi ? 'कृषि मित्र स्मार्ट सहायक' : 'KrishiMitra Smart Assistant'}
                </h2>
                <span className="text-[10px] text-lime-400 flex items-center gap-1 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-lime-400 animate-pulse" />
                  Gemini AI • ICAR Agronomic Engine
                </span>
              </div>
            </div>

            {/* Context Crop Filter */}
            <select
              value={cropId || ''}
              onChange={(e) => setCropId(e.target.value ? parseInt(e.target.value) : undefined)}
              className="text-xs bg-emerald-950 border border-emerald-500/40 rounded-full px-3 py-1.5 text-white outline-none focus:border-lime-400"
            >
              <option value="">{t('assistant_all_crops') || 'Context: All Crops'}</option>
              {crops.map((c) => (
                <option key={c.id} value={c.crop_id}>
                  Crop: {c.crop_name || c.crop?.name}
                </option>
              ))}
            </select>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center max-w-md mx-auto my-auto py-8">
                {/* 3D DotLottie Asset Player */}
                <div className="relative w-28 h-28 mb-2 flex items-center justify-center">
                  <dotlottie-player
                    src="https://lottie.host/89534c3f-10dd-4fac-b3fb-867963f3cffc/YerGkXzK8J.lottie"
                    background="transparent"
                    speed="1"
                    style={{ width: '120px', height: '120px' }}
                    loop
                    autoplay
                  />
                </div>

                <h3 className="text-xl font-bold text-white mb-1.5">
                  {isHi ? 'कृषि मित्र से बोलकर या लिखकर पूछें' : 'Ask KrishiMitra by Voice or Text'}
                </h3>
                <p className="text-xs text-emerald-300/80 mb-6 leading-relaxed max-w-sm">
                  {isHi
                    ? 'फसल, सिंचाई, पत्ती के रोग या खाद के बारे में नीचे माइक दबाकर बोलें।'
                    : 'Personalized advisory based on your crops, soil, and live local weather.'}
                </p>

                {/* Quick Suggestion Cards */}
                <div className="w-full space-y-2">
                  {suggestedQuestions.map((q, idx) => {
                    const text = isHi ? q.hi : q.en;
                    return (
                      <button
                        key={idx}
                        onClick={() => send(text)}
                        className="w-full text-left glass-card p-3 rounded-2xl hover:border-lime-400/60 transition-all text-xs text-emerald-100 flex items-center justify-between group shadow-sm hover:scale-[1.01]"
                      >
                        <span className="font-medium">{text}</span>
                        <Send className="w-3.5 h-3.5 text-lime-400 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              messages.map((msg: any) => (
                <div
                  key={msg.id}
                  className={`flex items-start gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'assistant' && (
                    <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-emerald-600 to-lime-400 flex items-center justify-center text-gray-950 font-bold shrink-0 shadow-md mt-1">
                      <Bot className="w-3.5 h-3.5" />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] sm:max-w-[75%] rounded-3xl px-5 py-3.5 shadow-xl ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-r from-emerald-500 to-lime-400 text-gray-950 font-bold rounded-tr-sm'
                        : 'glass-card border border-emerald-400/40 text-white rounded-tl-sm bg-emerald-950/80'
                    }`}
                  >
                    <p className="text-xs sm:text-sm whitespace-pre-wrap leading-relaxed">
                      {msg.content}
                    </p>

                    {/* Visual Educational Image Card (if provided) */}
                    {msg.visual && (
                      <div className="mt-3 overflow-hidden rounded-2xl border border-emerald-400/40 bg-emerald-950/90 shadow-xl">
                        <img
                          src={msg.visual.url}
                          alt={msg.visual.title}
                          className="w-full h-44 object-cover hover:scale-105 transition-transform duration-300"
                        />
                        <div className="p-3">
                          <div className="flex items-center gap-1.5 text-lime-300 text-xs font-bold">
                            <ImageIcon className="w-3.5 h-3.5" />
                            <span>{isHi ? (msg.visual.title_hi || msg.visual.title) : msg.visual.title}</span>
                          </div>
                          <p className="text-[11px] text-emerald-200/80 mt-0.5">
                            {msg.visual.caption}
                          </p>
                        </div>
                      </div>
                    )}

                    {msg.role === 'assistant' && (
                      <div className="mt-2.5 pt-2 border-t border-emerald-500/20 flex items-center justify-between text-[11px] text-emerald-300">
                        <span className="opacity-70">KrishiMitra AI Advisory</span>
                        <button
                          onClick={() => speak(msg.id, msg.content)}
                          className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold transition-all ${
                            speakingId === msg.id
                              ? 'bg-lime-400 text-gray-950 animate-pulse'
                              : 'hover:bg-emerald-800/60 text-emerald-200'
                          }`}
                        >
                          <Volume2 className="w-3.5 h-3.5 text-lime-400" />
                          <span>{speakingId === msg.id ? (isHi ? 'बोल रहा है...' : 'Speaking...') : (isHi ? 'सुनें 🔊' : 'Listen')}</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {msg.role === 'user' && (
                    <div className="w-7 h-7 rounded-full bg-emerald-800 border border-emerald-400/40 flex items-center justify-center text-emerald-200 shrink-0 shadow-md mt-1 font-bold text-xs">
                      <User className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              ))
            )}

            {sending && (
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-emerald-600 to-lime-400 flex items-center justify-center text-gray-950 font-bold shrink-0 shadow-md">
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <div className="glass-card px-4 py-3 rounded-2xl rounded-tl-sm flex items-center gap-1.5 border border-emerald-400/30">
                  <div className="w-2 h-2 bg-lime-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-lime-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-lime-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  <span className="text-xs text-emerald-200 ml-2">
                    {isHi ? 'कृषि विशेषज्ञ मॉडल से परामर्श ले रहे हैं...' : 'Consulting agricultural AI models...'}
                  </span>
                </div>
              </div>
            )}
            <div ref={messagesEnd} />
          </div>

          {/* Persistent Floating Input Bar with Enhanced Voice Support */}
          <div className="p-3 sm:p-4 border-t border-emerald-500/20 bg-emerald-950/70 backdrop-blur-md">
            <div className="flex items-center gap-2 max-w-3xl mx-auto glass-pill p-1.5 shadow-xl border border-emerald-400/40 focus-within:border-lime-400 transition-all">
              {/* Large Farmer-Friendly Mic */}
              <VoiceButton
                size="md"
                showLabel={false}
                onInterim={(interim) => setInput(interim)}
                onResult={(text) => {
                  setInput(text);
                  send(text, true); // auto-speak response when voice queried
                }}
                className="!min-h-[42px] !min-w-[42px] w-11 h-11 shadow-lg"
              />
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && send()}
                placeholder={
                  isHi
                    ? 'खेती का कोई भी प्रश्न पूछें या माइक दबाएं...'
                    : 'Ask anything about fertilizer, disease, watering, or tap mic...'
                }
                className="flex-1 bg-transparent border-none outline-none text-xs sm:text-sm text-white placeholder-emerald-500/70 px-2"
                disabled={sending}
              />
              <button
                onClick={() => send()}
                disabled={!input.trim() || sending}
                className="w-10 h-10 rounded-full bg-gradient-to-r from-emerald-400 to-lime-300 text-gray-950 flex items-center justify-center font-bold shadow-md hover:scale-105 active:scale-95 disabled:opacity-40 transition-all"
                title="Send"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
