import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Send,
  RotateCcw,
  X,
  Sparkles,
  MessageSquare,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Maximize2,
  Copy,
  Check,
  ThumbsUp,
  ThumbsDown,
  Calendar,
  ExternalLink,
  Bot,
  User,
  ShieldCheck
} from 'lucide-react';

const CHAT_API_URL = 'https://pragya-ai-assistant.vercel.app/api/chat';
const WHATSAPP_URL = 'https://wa.me/85267082503?text=Namaste%20%F0%9F%99%8F%20I%20have%20a%20question%20about%20Pragya%20Yog%20School';

export interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  suggestions?: string[];
  action?: {
    type: 'booking' | 'whatsapp' | 'link';
    label: string;
    payload?: string;
  };
  feedback?: 'like' | 'dislike';
}

export interface AIChatWidgetProps {
  onOpenFullPage?: () => void;
  onOpenBooking?: (type?: string, title?: string) => void;
}

const DEFAULT_WELCOME_MESSAGE: Message = {
  id: 'welcome-1',
  sender: 'bot',
  text: "Namaste 🙏 Welcome to **Pragya Yog School**!\n\nI am your AI Yogic Assistant. How can I guide your practice today?",
  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  suggestions: [
    '🧘 Group Classes & Schedule',
    '📜 200-Hour Teacher Training',
    '💳 Memberships & Trial Pass',
    '📍 Studio Location & Contact'
  ]
};

export const AIChatWidget: React.FC<AIChatWidgetProps> = ({
  onOpenFullPage,
  onOpenBooking
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showTeaser, setShowTeaser] = useState(true);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');
  const [isMuted, setIsMuted] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  // Persistent session messages
  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const saved = sessionStorage.getItem('pragya_chat_messages');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Could not restore chat session:', e);
    }
    return [DEFAULT_WELCOME_MESSAGE];
  });

  // Save messages to session storage
  useEffect(() => {
    try {
      sessionStorage.setItem('pragya_chat_messages', JSON.stringify(messages));
    } catch (e) {
      // ignore quota limits
    }
  }, [messages]);

  // Auto scroll to bottom when new messages arrive
  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      // Focus input on desktop
      if (window.innerWidth >= 640) {
        setTimeout(() => inputRef.current?.focus(), 150);
      }
    }
  }, [isOpen, messages, scrollToBottom]);

  // Setup Web Speech Recognition API if available
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'en-US';

      rec.onstart = () => setIsListening(true);
      rec.onend = () => setIsListening(false);
      rec.onerror = (e: any) => {
        console.warn('Speech recognition error:', e);
        setIsListening(false);
      };
      rec.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInput(transcript);
          handleSend(transcript);
        }
      };
      recognitionRef.current = rec;
    }
  }, []);

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) {
      alert('Voice recognition is not supported in this browser.');
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      try {
        recognitionRef.current.start();
      } catch (e) {
        console.warn(e);
      }
    }
  };

  // Speak bot response using Web Speech Synthesis
  const speakText = (text: string) => {
    if (isMuted || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const clean = text.replace(/[*_#`~]/g, '').replace(/\[.*?\]\(.*?\)/g, '');
      const utterance = new SpeechSynthesisUtterance(clean.slice(0, 300));
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis error:', e);
    }
  };

  // Smart Offline Knowledge Fallback
  const getOfflineFallback = (query: string): { reply: string; suggestions?: string[]; action?: Message['action'] } => {
    const q = query.toLowerCase();

    if (q.includes('ttc') || q.includes('200') || q.includes('teacher training') || q.includes('certification')) {
      return {
        reply: "📜 **200-Hour Hatha & Ashtanga Vinyasa Yoga Teacher Training (TTC)**\n\n- **Affiliation**: University-affiliated program in Hong Kong partnered with Indian Universities.\n- **Curriculum**: Asana alignment, Pranayama, Anatomy, Yogic Philosophy & Teaching Methodology.\n- **Schedule**: Weekend & Intensive options available.\n- **Certificate**: Internationally recognized Yoga Alliance RYT-200 certification.",
        suggestions: ['How to enroll in TTC?', 'View Membership Options', 'Book a Consultation'],
        action: { type: 'whatsapp', label: 'Inquire on WhatsApp', payload: WHATSAPP_URL }
      };
    }

    if (q.includes('class') || q.includes('schedule') || q.includes('group') || q.includes('type')) {
      return {
        reply: "🧘 **Pragya Signature Group Classes**\n\nWe offer 9 specialized class styles led by Master Teachers from Rishikesh & India:\n\n1. **Pragya Flow & Hatha Vinyasa**\n2. **Pranayama & Meditation Sanctuary**\n3. **Yin & Deep Restorative**\n4. **Ashtanga Primary Series**\n5. **Spine & Posture Care**",
        suggestions: ['Book Trial Class (3 for HK$450)', 'View Class Pricing', 'Contact Us'],
        action: { type: 'booking', label: '📅 Book a Class Now' }
      };
    }

    if (q.includes('trial') || q.includes('price') || q.includes('membership') || q.includes('cost') || q.includes('pass')) {
      return {
        reply: "💳 **Passes & Membership Options**\n\n• **New Student Trial Pass**: HK$450 for 3 Group Classes (Valid 14 days)\n• **Single Drop-in**: HK$280 / class\n• **10-Class Pass**: HK$2,400\n• **Unlimited Monthly Pass**: HK$1,980 / month\n• **Annual Unlimited**: Special rates available upon inquiry.",
        suggestions: ['Book Trial Pass', 'Group Classes Info', 'WhatsApp Studio Manager'],
        action: { type: 'booking', label: '🎁 Get Trial Pass (HK$450)' }
      };
    }

    if (q.includes('location') || q.includes('where') || q.includes('address') || q.includes('contact') || q.includes('phone')) {
      return {
        reply: "📍 **Studio Location & Details**\n\n- **Address**: 1303-04 Tak Woo House, 17-19 Wo On Lane, Central, Hong Kong\n- **MTR**: Central Station Exit D2 (3 min walk)\n- **WhatsApp / Phone**: +852 6708 2503\n- **Email**: info@pragyayog.com",
        suggestions: ['Chat on WhatsApp', 'Book a Class', 'View Schedule'],
        action: { type: 'whatsapp', label: '💬 Open WhatsApp (+852 6708 2503)' }
      };
    }

    return {
      reply: "Thank you for reaching out! 🙏 I am here to help you with **Group Classes**, **200-Hr Teacher Training**, **Memberships**, and **Retreats** at Pragya Yog School Central HK.\n\nWould you like to book a trial session or speak directly with our studio manager?",
      suggestions: ['Book Trial Class', 'What classes do you offer?', 'Chat on WhatsApp'],
      action: { type: 'booking', label: 'Book Trial Session' }
    };
  };

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || loading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const response = await fetch(CHAT_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: query, sessionId: sessionId || undefined })
      });

      if (!response.ok) throw new Error('API server returned error');

      const data = await response.json();
      if (data.sessionId) setSessionId(data.sessionId);

      const replyText = data.reply || 'How else can I assist your yogic journey today?';
      const fallback = getOfflineFallback(query);

      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestions:
          data.suggestions && data.suggestions.length > 0
            ? data.suggestions
            : fallback.suggestions || ['Book Trial Class', 'View Schedule', 'Contact Studio'],
        action: query.toLowerCase().includes('book') || query.toLowerCase().includes('trial')
          ? { type: 'booking', label: '📅 Book a Class' }
          : undefined
      };

      setMessages((prev) => [...prev, botMsg]);
      speakText(replyText);
    } catch (err) {
      console.warn('API fetch issue, using smart fallback logic:', err);
      const fallback = getOfflineFallback(query);

      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: fallback.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestions: fallback.suggestions,
        action: fallback.action
      };

      setMessages((prev) => [...prev, botMsg]);
      speakText(fallback.reply);
    } finally {
      setLoading(false);
    }
  };

  const handleResetSession = () => {
    setSessionId('');
    setMessages([DEFAULT_WELCOME_MESSAGE]);
    try {
      sessionStorage.removeItem('pragya_chat_messages');
    } catch (e) {
      // ignore
    }
  };

  const handleCopyMessage = (id: string, text: string) => {
    try {
      const clean = text.replace(/[*_#`~]/g, '');
      navigator.clipboard.writeText(clean);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (e) {
      console.warn('Copy failed:', e);
    }
  };

  const handleFeedback = (id: string, type: 'like' | 'dislike') => {
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, feedback: m.feedback === type ? undefined : type } : m))
    );
  };

  const renderFormattedText = (text: string) => {
    return text.split('\n').map((line, lIdx) => {
      const boldFormatted = line.split(/(\*\*.*?\*\*)/g).map((chunk, cIdx) => {
        if (chunk.startsWith('**') && chunk.endsWith('**')) {
          return (
            <strong key={cIdx} className="font-semibold text-amber-200">
              {chunk.slice(2, -2)}
            </strong>
          );
        }
        return chunk;
      });

      if (line.startsWith('* ') || line.startsWith('- ')) {
        return (
          <li key={lIdx} className="ml-4 list-disc space-y-0.5 my-0.5 text-stone-200">
            {boldFormatted}
          </li>
        );
      }

      return (
        <p key={lIdx} className="my-1 leading-relaxed text-stone-100">
          {boldFormatted}
        </p>
      );
    });
  };

  return (
    <>
      {/* ── Floating Launcher Toggle Button ──────────────────────────────── */}
      {!isOpen && (
        <div className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-50 flex flex-col items-end gap-2 animate-in fade-in slide-in-from-bottom-4 duration-300">
          
          {/* Teaser notification bubble */}
          {showTeaser && (
            <div className="bg-[#1E3A2B] text-[#F5EFE5] border border-[#C5A059]/40 shadow-xl rounded-2xl p-3 max-w-[260px] text-xs flex items-start gap-2.5 relative group animate-bounce-subtle">
              <div className="w-7 h-7 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-400/40">
                <Sparkles size={14} />
              </div>
              <div className="flex-1">
                <p className="font-medium text-amber-200">Pragya AI Assistant</p>
                <p className="text-[11px] text-stone-300">Need help booking a class or TTC details?</p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowTeaser(false);
                }}
                className="text-stone-400 hover:text-white p-0.5"
                title="Dismiss"
              >
                <X size={13} />
              </button>
            </div>
          )}

          {/* Trigger Button */}
          <button
            onClick={() => {
              setIsOpen(true);
              setShowTeaser(false);
            }}
            className="group relative flex items-center gap-2.5 bg-gradient-to-r from-[#1E3A2B] to-[#11241A] hover:from-[#254936] hover:to-[#173023] text-[#F5EFE5] px-4 py-3 sm:px-5 sm:py-3.5 rounded-full shadow-2xl border border-[#C5A059]/50 hover:border-amber-400 transition-all duration-300 hover:scale-105 active:scale-95"
            aria-label="Open Pragya AI Assistant"
          >
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
            </span>

            <div className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-300">
              <Bot size={18} />
            </div>

            <span className="font-serif font-medium text-xs sm:text-sm tracking-wide text-amber-100 hidden sm:inline">
              Ask Pragya AI
            </span>
          </button>
        </div>
      )}

      {/* ── Main Chat Modal / Mobile Bottom Drawer ───────────────────────── */}
      {isOpen && (
        <div className="fixed inset-0 sm:inset-auto sm:bottom-6 sm:right-6 z-50 flex flex-col sm:w-[420px] sm:h-[630px] h-[100dvh] w-full bg-[#1E3A2B] sm:rounded-3xl shadow-2xl border border-[#C5A059]/40 overflow-hidden animate-in slide-in-from-bottom-6 sm:slide-in-from-bottom-4 duration-300">
          
          {/* Mobile Top Drag Indicator Bar */}
          <div className="sm:hidden w-full bg-[#11241A] pt-2 pb-1 flex justify-center border-b border-amber-500/10">
            <div className="w-12 h-1.5 bg-amber-500/30 rounded-full"></div>
          </div>

          {/* Header Bar */}
          <div className="bg-gradient-to-r from-[#11241A] to-[#1E3A2B] px-4 py-3.5 sm:px-5 sm:py-4 border-b border-[#C5A059]/30 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-amber-300 shadow-inner">
                  <Bot size={22} />
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-[#11241A] rounded-full"></span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h2 className="font-serif font-bold text-sm sm:text-base text-amber-100 tracking-wide">
                    Pragya AI Assistant
                  </h2>
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-400/30 px-1.5 py-0.5 rounded font-mono uppercase">
                    Live
                  </span>
                </div>
                <p className="text-[11px] text-stone-300 flex items-center gap-1">
                  <ShieldCheck size={11} className="text-amber-400" />
                  Official Studio Intelligence
                </p>
              </div>
            </div>

            {/* Top Controls */}
            <div className="flex items-center gap-1">
              {/* Voice Mute/Unmute */}
              <button
                onClick={() => setIsMuted(!isMuted)}
                className={`p-2 rounded-xl text-stone-300 hover:text-white hover:bg-emerald-900/50 transition-colors ${
                  !isMuted ? 'text-amber-400 bg-amber-500/10' : ''
                }`}
                title={isMuted ? 'Unmute Audio Speech' : 'Mute Audio Speech'}
              >
                {isMuted ? <VolumeX size={17} /> : <Volume2 size={17} className="animate-pulse" />}
              </button>

              {/* Reset Session */}
              <button
                onClick={handleResetSession}
                className="p-2 rounded-xl text-stone-300 hover:text-white hover:bg-emerald-900/50 transition-colors"
                title="Clear Session"
              >
                <RotateCcw size={16} />
              </button>

              {/* Open Full Screen Page */}
              {onOpenFullPage && (
                <button
                  onClick={() => {
                    setIsOpen(false);
                    onOpenFullPage();
                  }}
                  className="p-2 rounded-xl text-stone-300 hover:text-amber-300 hover:bg-emerald-900/50 transition-colors hidden sm:flex"
                  title="Expand to Full Page"
                >
                  <Maximize2 size={16} />
                </button>
              )}

              {/* Close Widget Button */}
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-xl text-stone-300 hover:text-white hover:bg-emerald-900/50 transition-colors ml-1"
                aria-label="Close Chat"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* ── Messages Container ────────────────────────────────────────── */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-radial from-emerald-950/60 to-emerald-950 text-xs sm:text-sm scrollbar-thin">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.sender === 'user' ? 'items-end' : 'items-start'
                } max-w-[88%] sm:max-w-[85%] ${msg.sender === 'user' ? 'ml-auto' : 'mr-auto'}`}
              >
                {/* Header Icon + Sender Label */}
                <div className="flex items-center gap-1.5 mb-1 px-1 text-[10px] text-stone-400 font-mono">
                  {msg.sender === 'bot' ? (
                    <>
                      <Sparkles size={11} className="text-amber-400" />
                      <span>Pragya AI</span>
                    </>
                  ) : (
                    <>
                      <span>You</span>
                      <User size={11} className="text-amber-300" />
                    </>
                  )}
                  <span>· {msg.timestamp}</span>
                </div>

                {/* Message Bubble */}
                <div
                  className={`p-3.5 sm:p-4 rounded-2xl leading-relaxed text-xs sm:text-sm shadow-md relative group ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-r from-[#944426] to-[#7B351B] text-[#F5EFE5] rounded-br-xs border border-amber-500/20'
                      : 'bg-[#2A4E3B] text-[#F5EFE5] rounded-bl-xs border border-[#C5A059]/30'
                  }`}
                >
                  {renderFormattedText(msg.text)}

                  {/* Inline Action Button if available */}
                  {msg.action && (
                    <div className="mt-3 pt-2.5 border-t border-white/10 flex flex-wrap gap-2">
                      {msg.action.type === 'booking' && onOpenBooking && (
                        <button
                          onClick={() => {
                            setIsOpen(false);
                            onOpenBooking('class', 'Book Trial Class');
                          }}
                          className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-semibold py-2 px-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow"
                        >
                          <Calendar size={14} />
                          {msg.action.label}
                        </button>
                      )}

                      {msg.action.type === 'whatsapp' && (
                        <a
                          href={msg.action.payload || WHATSAPP_URL}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-2 px-3 rounded-xl flex items-center justify-center gap-2 transition-colors shadow text-xs"
                        >
                          <MessageSquare size={14} />
                          {msg.action.label}
                        </a>
                      )}
                    </div>
                  )}

                  {/* Message Utilities (Copy / Feedback) */}
                  {msg.sender === 'bot' && (
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-amber-500/10 text-[10px] text-stone-400">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleCopyMessage(msg.id, msg.text)}
                          className="flex items-center gap-1 hover:text-amber-300 transition-colors"
                          title="Copy text"
                        >
                          {copiedId === msg.id ? (
                            <>
                              <Check size={12} className="text-emerald-400" />
                              <span className="text-emerald-400">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy size={12} />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleFeedback(msg.id, 'like')}
                          className={`p-1 rounded hover:text-amber-300 ${
                            msg.feedback === 'like' ? 'text-amber-400 bg-amber-500/20' : ''
                          }`}
                        >
                          <ThumbsUp size={12} />
                        </button>
                        <button
                          onClick={() => handleFeedback(msg.id, 'dislike')}
                          className={`p-1 rounded hover:text-amber-300 ${
                            msg.feedback === 'dislike' ? 'text-amber-400 bg-amber-500/20' : ''
                          }`}
                        >
                          <ThumbsDown size={12} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Chips Suggestions */}
                {msg.sender === 'bot' && msg.suggestions && msg.suggestions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2.5 max-w-full">
                    {msg.suggestions.map((sug, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSend(sug)}
                        className="text-[11px] sm:text-xs bg-emerald-950/80 hover:bg-amber-600 text-amber-200 hover:text-stone-950 border border-amber-500/30 px-3 py-1.5 rounded-full transition-all duration-200 active:scale-95 shadow-sm"
                      >
                        {sug}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Loading Indicator */}
            {loading && (
              <div className="flex items-center gap-2.5 bg-emerald-900/40 border border-amber-500/20 px-4 py-3 rounded-2xl w-fit animate-pulse">
                <Bot size={18} className="text-amber-400 animate-spin" />
                <span className="text-xs text-stone-300 font-medium">Pragya AI is typing...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* ── Quick Contact Banner for Mobile ─────────────────────────── */}
          <div className="bg-[#11241A] px-4 py-2 border-t border-amber-500/20 flex items-center justify-between text-[11px] text-stone-300 shrink-0">
            <span className="flex items-center gap-1.5 text-stone-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              Central Studio HK
            </span>
            <div className="flex items-center gap-3">
              {onOpenBooking && (
                <button
                  onClick={() => {
                    setIsOpen(false);
                    onOpenBooking('class', 'Book Trial Class');
                  }}
                  className="text-amber-300 hover:underline font-medium"
                >
                  Book Trial Pass
                </button>
              )}
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-400 hover:underline flex items-center gap-1"
              >
                WhatsApp <ExternalLink size={10} />
              </a>
            </div>
          </div>

          {/* ── Input Controls Bar ────────────────────────────────────────── */}
          <div className="p-3 sm:p-4 bg-stone-950 border-t border-emerald-800/40 shrink-0 pb-safe">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2 bg-emerald-950 border border-amber-500/30 rounded-2xl px-3 py-1.5 sm:px-4 sm:py-2 focus-within:border-amber-400 transition-colors shadow-inner"
            >
              {/* Voice Mic Button */}
              <button
                type="button"
                onClick={toggleVoiceInput}
                className={`p-2 rounded-xl transition-all ${
                  isListening
                    ? 'bg-rose-500 text-white animate-pulse'
                    : 'text-stone-400 hover:text-amber-300 hover:bg-emerald-900/50'
                }`}
                title={isListening ? 'Stop Recording' : 'Voice Input (Speak)'}
              >
                {isListening ? <MicOff size={16} /> : <Mic size={16} />}
              </button>

              {/* Text Input */}
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={isListening ? 'Listening to your voice...' : 'Ask about classes, TTC, pricing...'}
                className="w-full bg-transparent text-xs sm:text-sm text-stone-100 placeholder-stone-400 focus:outline-none py-1 min-h-[38px]"
              />

              {/* Send Button */}
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 to-amber-400 disabled:opacity-40 text-stone-950 p-2.5 rounded-xl font-bold transition-all shrink-0 active:scale-95 shadow"
                aria-label="Send message"
              >
                <Send size={16} />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default AIChatWidget;
