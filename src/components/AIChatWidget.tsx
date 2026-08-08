import React, { useState, useEffect, useRef } from 'react';
import { Send, RotateCcw, X, Globe, Sparkles, MessageSquare, Mic, ChevronDown } from 'lucide-react';

const CHAT_API_URL = 'https://pragya-ai-assistant.vercel.app/api/chat';
const WHATSAPP_URL = 'https://wa.me/85267082503?text=Namaste%20%F0%9F%99%8F%20I%20have%20a%20question%20about%20Pragya%20Yog%20School';

interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  suggestions?: string[];
}

interface AIChatWidgetProps {
  onOpenFullPage?: () => void;
  onOpenBooking?: (type?: string, title?: string) => void;
}

export const AIChatWidget: React.FC<AIChatWidgetProps> = ({ onOpenFullPage, onOpenBooking }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');
  const [unreadBadge, setUnreadBadge] = useState(true);
  const [showTooltip, setShowTooltip] = useState(true);

  // Language state
  const [lang, setLang] = useState<'auto' | 'en' | 'yue' | 'cmn'>('auto');
  const [langMenuOpen, setLangMenuOpen] = useState(false);

  // Voice dictation & audio state
  const [isListening, setIsListening] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  // Dynamic greeting based on current time
  const [greetingTime, setGreetingTime] = useState('Good day');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreetingTime('Good morning');
    else if (hour < 17) setGreetingTime('Good afternoon');
    else setGreetingTime('Good evening');
  }, []);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome-bot-msg',
      sender: 'bot',
      text: "Still browsing? 😊 Most people ask me about the 3-Class Trial Pass (HK$450) or our class schedule. Or just tell me what you're looking for — I'm happy to help!",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestions: [
        'Compare memberships',
        'Any current offers?',
        'Book a trial class',
        'Payment options'
      ]
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setUnreadBadge(false);
      setShowTooltip(false);
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, messages, loading]);

  useEffect(() => {
    const timer = setTimeout(() => setShowTooltip(false), 8000);
    return () => clearTimeout(timer);
  }, []);

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || loading) return;

    const userMsgId = Date.now().toString();
    const userMsg: Message = {
      id: userMsgId,
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
        body: JSON.stringify({
          message: query,
          sessionId: sessionId || undefined
        })
      });

      if (!response.ok) throw new Error('API Request Failed');

      const data = await response.json();
      if (data.sessionId) setSessionId(data.sessionId);

      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: data.reply || 'I am happy to assist you with any questions about Pragya Yog School.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestions: data.suggestions && data.suggestions.length > 0 ? data.suggestions : [
          'Compare Memberships',
          'Book a Trial Class',
          'Contact on WhatsApp'
        ]
      };

      setMessages((prev) => [...prev, botMsg]);

      if (!isMuted && 'speechSynthesis' in window) {
        const cleanText = data.reply.replace(/[*_#`~]/g, '');
        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.rate = 0.95;
        window.speechSynthesis.speak(utterance);
      }
    } catch (err) {
      console.error(err);
      const fallbackMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: 'Namaste! I am experiencing a brief connection delay. You can also chat directly with us on [WhatsApp](https://wa.me/85267082503) or ask me again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestions: ['Try again', 'Classes & Schedule', 'Contact Info']
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSessionId('');
    setMessages([
      {
        id: Date.now().toString(),
        sender: 'bot',
        text: 'Conversation reset. Namaste! How may I assist you today?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestions: [
          'Book a Trial Class',
          '200-Hour TTC Info',
          'Membership Prices',
          'Studio Location'
        ]
      }
    ]);
  };

  // Speech Recognition (Dictation)
  const toggleSpeechRecognition = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = lang === 'yue' ? 'zh-HK' : lang === 'cmn' ? 'zh-CN' : 'en-US';

    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      setIsListening(false);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognition.start();
  };

  // Render markdown text formatting
  const renderFormattedText = (text: string) => {
    return text.split('\n').map((line, lIdx) => {
      const boldFormatted = line.split(/(\*\*.*?\*\*)/g).map((chunk, cIdx) => {
        if (chunk.startsWith('**') && chunk.endsWith('**')) {
          return <strong key={cIdx} style={{ fontWeight: 600, color: '#FDE68A' }}>{chunk.slice(2, -2)}</strong>;
        }
        
        const linkSplit = chunk.split(/(\[.*?\]\(.*?\))/g).map((subChunk, sIdx) => {
          const match = subChunk.match(/^\[(.*?)\]\((.*?)\)$/);
          if (match) {
            return (
              <a
                key={sIdx}
                href={match[2]}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#FCD34D', textDecoration: 'underline' }}
              >
                {match[1]}
              </a>
            );
          }
          return subChunk;
        });

        return <span key={cIdx}>{linkSplit}</span>;
      });

      if (line.startsWith('* ') || line.startsWith('- ')) {
        return (
          <li key={lIdx} style={{ marginLeft: '16px', listStyleType: 'disc', margin: '3px 0' }}>
            {boldFormatted}
          </li>
        );
      }

      return (
        <p key={lIdx} style={{ margin: '3px 0', lineHeight: '1.55' }}>
          {boldFormatted}
        </p>
      );
    });
  };

  return (
    <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' }}>
      {/* ── Floating Launcher Button & Tooltip (Hidden when chat modal is open to avoid overlap) ── */}
      {!isOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            zIndex: 9990,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            pointerEvents: 'none',
            animation: 'floatUpDown 3.4s ease-in-out infinite'
          }}
        >
          {/* Idle Tooltip Badge */}
          {showTooltip && (
            <div
              style={{
                pointerEvents: 'auto',
                marginBottom: '10px',
                backgroundColor: '#1C1512',
                color: '#F5EFE5',
                border: '1px solid rgba(242, 169, 60, 0.4)',
                padding: '10px 16px',
                borderRadius: '16px',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.35)',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                maxWidth: '280px',
                fontSize: '13px'
              }}
            >
              <img src="/mascot.png" alt="Pragya AI Mascot" style={{ width: '24px', height: '24px', objectFit: 'contain', flexShrink: 0 }} />
              <div>
                <span style={{ fontWeight: 600, display: 'block', color: '#FCD34D' }}>Ask Pragya AI</span>
                <span style={{ fontSize: '11.5px', color: '#D6D3D1' }}>Instant answers on classes, TTC & pricing</span>
              </div>
              <button
                onClick={() => setShowTooltip(false)}
                style={{ background: 'none', border: 'none', color: '#A8A29E', cursor: 'pointer', padding: '2px', marginLeft: '4px' }}
                aria-label="Dismiss message"
              >
                <X size={14} />
              </button>
            </div>
          )}

          {/* Floating Trigger Circle */}
          <button
            onClick={() => setIsOpen(true)}
            aria-label="Toggle AI Assistant Chat"
            style={{
              pointerEvents: 'auto',
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              border: '2px solid rgba(242, 169, 60, 0.7)',
              background: 'linear-gradient(135deg, #FF7F3F 0%, #F2A93C 50%, #5E9E56 100%)',
              color: '#FFFFFF',
              boxShadow: '0 8px 32px rgba(255, 127, 63, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              position: 'relative',
              transition: 'all 0.3s ease'
            }}
          >
            <span
              style={{
                position: 'absolute',
                top: '-4px',
                left: '-4px',
                right: '-4px',
                bottom: '-4px',
                borderRadius: '50%',
                border: '2px solid #F2A93C',
                opacity: 0.8,
                animation: 'pulseGlow 2.5s infinite ease-out'
              }}
            />

            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {/* Mascot Lotus Yogi Avatar */}
              <div style={{ width: '46px', height: '46px', borderRadius: '50%', backgroundColor: '#1C1512', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '2px solid #F2A93C', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>
                <img src="/mascot.png" alt="Pragya AI Mascot" style={{ width: '100%', height: '100%', objectFit: 'contain', animation: 'floatMascot 2.8s ease-in-out infinite' }} />
              </div>
              {unreadBadge && (
                <span style={{ position: 'absolute', top: '-4px', right: '-4px', width: '14px', height: '14px', backgroundColor: '#EF4444', borderRadius: '50%', border: '2px solid #1C1512' }} />
              )}
            </div>
          </button>
        </div>
      )}

      {/* ── Exact Chat Window Modal Panel ────────────────────────────────────────── */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            width: 'min(400px, calc(100vw - 32px))',
            height: 'min(640px, calc(100vh - 40px))',
            maxHeight: 'calc(100vh - 40px)',
            zIndex: 9995,
            backgroundColor: '#1E1815',
            color: '#F5EFE5',
            borderRadius: '24px',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.65), 0 0 0 1px rgba(196, 154, 42, 0.3)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}
        >
          {/* 1. Header with Sunrise Gradient & Close Button */}
          <div
            style={{
              background: 'linear-gradient(120deg, #ff7f3f 0%, #f2a93c 48%, #5e9e56 100%)',
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '2px solid #C49A2A',
              position: 'relative'
            }}
          >
            {/* Left: Avatar + Status */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  backgroundColor: '#1C1512',
                  boxShadow: '0 0 0 2px rgba(242, 169, 60, 0.8), 0 2px 8px rgba(0,0,0,0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  flexShrink: 0
                }}
              >
                <img src="/mascot.png" alt="Pragya AI Mascot" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              </div>

              <div>
                <h3 style={{ margin: 0, fontWeight: 700, fontSize: '15px', color: '#FFFFFF', letterSpacing: '0.2px', lineHeight: 1.2 }}>Pragya</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'rgba(255,255,255,0.92)', marginTop: '2px', fontWeight: 600 }}>
                  <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#FFFFFF', display: 'inline-block' }} />
                  Online
                </div>
              </div>
            </div>

            {/* Right: Lang Picker + WhatsApp + Reset + Close */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {/* Language Dropdown */}
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setLangMenuOpen(!langMenuOpen)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    backgroundColor: 'rgba(255,255,255,0.22)',
                    border: 'none',
                    color: '#FFFFFF',
                    fontSize: '11.5px',
                    fontWeight: 700,
                    padding: '4px 10px',
                    borderRadius: '16px',
                    cursor: 'pointer'
                  }}
                >
                  <Globe size={13} />
                  <span>{lang === 'auto' ? 'Auto' : lang === 'en' ? 'EN' : lang === 'yue' ? '廣' : '普'}</span>
                  <ChevronDown size={11} />
                </button>

                {langMenuOpen && (
                  <div style={{ position: 'absolute', right: 0, top: '100%', marginTop: '6px', width: '180px', backgroundColor: '#231A15', border: '1px solid rgba(242, 169, 60, 0.3)', borderRadius: '12px', boxShadow: '0 12px 32px rgba(0,0,0,0.4)', padding: '6px', zIndex: 50 }}>
                    <button onClick={() => { setLang('auto'); setLangMenuOpen(false); }} style={{ width: '100%', textAlign: 'left', padding: '8px 10px', background: 'none', border: 'none', color: lang === 'auto' ? '#FCD34D' : '#E7E5E4', fontSize: '12px', borderRadius: '6px', cursor: 'pointer' }}>🌐 Auto-detect</button>
                    <button onClick={() => { setLang('en'); setLangMenuOpen(false); }} style={{ width: '100%', textAlign: 'left', padding: '8px 10px', background: 'none', border: 'none', color: lang === 'en' ? '#FCD34D' : '#E7E5E4', fontSize: '12px', borderRadius: '6px', cursor: 'pointer' }}>English</button>
                    <button onClick={() => { setLang('yue'); setLangMenuOpen(false); }} style={{ width: '100%', textAlign: 'left', padding: '8px 10px', background: 'none', border: 'none', color: lang === 'yue' ? '#FCD34D' : '#E7E5E4', fontSize: '12px', borderRadius: '6px', cursor: 'pointer' }}>廣東話 Cantonese</button>
                    <button onClick={() => { setLang('cmn'); setLangMenuOpen(false); }} style={{ width: '100%', textAlign: 'left', padding: '8px 10px', background: 'none', border: 'none', color: lang === 'cmn' ? '#FCD34D' : '#E7E5E4', fontSize: '12px', borderRadius: '6px', cursor: 'pointer' }}>普通话 Mandarin</button>
                  </div>
                )}
              </div>

              {/* WhatsApp Green Circle Button */}
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: '#25D366',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textDecoration: 'none',
                  boxShadow: '0 2px 8px rgba(37,211,102,0.4)',
                  flexShrink: 0
                }}
                title="Chat on WhatsApp"
              >
                <svg viewBox="0 0 24 24" style={{ width: '18px', height: '18px', fill: '#FFFFFF' }}>
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              </a>

              {/* Reset Button */}
              <button
                onClick={handleReset}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255,255,255,0.22)',
                  border: 'none',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  flexShrink: 0
                }}
                title="Reset Conversation"
              >
                <RotateCcw size={15} />
              </button>

              {/* Close Button */}
              <button
                onClick={() => setIsOpen(false)}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255,255,255,0.22)',
                  border: 'none',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  flexShrink: 0,
                  marginLeft: '2px'
                }}
                title="Close Window"
              >
                <X size={17} />
              </button>
            </div>
          </div>

          {/* 2. Scrollable Body with Sacred Geometry Background */}
          <div
            style={{
              flexGrow: 1,
              overflowY: 'auto',
              padding: '14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              backgroundColor: '#1E1815',
              backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(196, 154, 42, 0.05) 0%, transparent 65%)'
            }}
          >
            {/* Top Greeting Info Banner */}
            <div
              style={{
                backgroundColor: '#281F1A',
                border: '1px solid rgba(242, 169, 60, 0.3)',
                borderRadius: '16px',
                padding: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '14px'
              }}
            >
              <img src="/mascot.png" alt="Pragya AI Mascot" style={{ width: '48px', height: '48px', objectFit: 'contain', flexShrink: 0, filter: 'drop-shadow(0 2px 6px rgba(242,169,60,0.4))' }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <p style={{ margin: 0, fontSize: '13px', color: '#E7E5E4', lineHeight: 1.5, fontWeight: 400 }}>
                  I'm <strong style={{ color: '#FCD34D', fontWeight: 600 }}>Pragya</strong> — ask me about classes, memberships & teacher training.
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{ backgroundColor: '#1C1512', color: '#FCD34D', border: '1px solid rgba(242, 169, 60, 0.3)', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    🌙 {greetingTime}
                  </span>
                  <span style={{ backgroundColor: '#1C1512', color: '#FCD34D', border: '1px solid rgba(242, 169, 60, 0.3)', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    ⚡ 24/7 answers
                  </span>
                </div>
              </div>
            </div>

            {/* Divider 1: HOW CAN I HELP YOU TODAY? */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '4px 0 2px 0' }}>
              <div style={{ height: '1px', backgroundColor: 'rgba(255,255,255,0.12)', flex: 1 }} />
              <span style={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '1.2px', color: 'rgba(242, 169, 60, 0.85)', fontFamily: 'monospace' }}>
                HOW CAN I HELP YOU TODAY?
              </span>
              <div style={{ height: '1px', backgroundColor: 'rgba(255,255,255,0.12)', flex: 1 }} />
            </div>

            {/* 4 Quick Action Cards Grid (2x2) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {/* Card 1: Book a Trial */}
              <button
                onClick={() => {
                  if (onOpenBooking) onOpenBooking('class', 'Book a Trial Class');
                  else handleSend('I want to book a trial class');
                }}
                style={{
                  backgroundColor: '#281F1A',
                  border: '1px solid rgba(242, 169, 60, 0.22)',
                  borderRadius: '16px',
                  padding: '12px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  minHeight: '84px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: '6px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '10px', backgroundColor: 'rgba(249, 115, 22, 0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>
                    📝
                  </div>
                  <span style={{ backgroundColor: '#F59E0B', color: '#1C1512', fontWeight: 800, fontSize: '8.5px', padding: '2px 6px', borderRadius: '10px', letterSpacing: '0.5px' }}>
                    ★ POPULAR
                  </span>
                </div>
                <div>
                  <h4 style={{ margin: 0, fontWeight: 700, fontSize: '12.5px', color: '#F5EFE5' }}>Book a Trial</h4>
                  <p style={{ margin: '2px 0 0 0', fontSize: '10.5px', color: '#A8A29E' }}>3 classes · HK$450</p>
                </div>
              </button>

              {/* Card 2: Class Schedule */}
              <button
                onClick={() => handleSend('Show me the live class schedule')}
                style={{
                  backgroundColor: '#281F1A',
                  border: '1px solid rgba(242, 169, 60, 0.22)',
                  borderRadius: '16px',
                  padding: '12px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  minHeight: '84px'
                }}
              >
                <div style={{ width: '32px', height: '32px', borderRadius: '10px', backgroundColor: 'rgba(59, 130, 246, 0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', marginBottom: '6px' }}>
                  📅
                </div>
                <div>
                  <h4 style={{ margin: 0, fontWeight: 700, fontSize: '12.5px', color: '#F5EFE5' }}>Class Schedule</h4>
                  <p style={{ margin: '2px 0 0 0', fontSize: '10.5px', color: '#A8A29E' }}>View & book online</p>
                </div>
              </button>

              {/* Card 3: Memberships */}
              <button
                onClick={() => handleSend('What are the membership plans and pricing?')}
                style={{
                  backgroundColor: '#281F1A',
                  border: '1px solid rgba(242, 169, 60, 0.22)',
                  borderRadius: '16px',
                  padding: '12px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  minHeight: '84px'
                }}
              >
                <div style={{ width: '32px', height: '32px', borderRadius: '10px', backgroundColor: 'rgba(234, 179, 8, 0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', marginBottom: '6px' }}>
                  💰
                </div>
                <div>
                  <h4 style={{ margin: 0, fontWeight: 700, fontSize: '12.5px', color: '#F5EFE5' }}>Memberships</h4>
                  <p style={{ margin: '2px 0 0 0', fontSize: '10.5px', color: '#A8A29E' }}>Plans & pricing</p>
                </div>
              </button>

              {/* Card 4: Teacher Training */}
              <button
                onClick={() => handleSend('Tell me about the 200-Hour Teacher Training program')}
                style={{
                  backgroundColor: '#281F1A',
                  border: '1px solid rgba(242, 169, 60, 0.22)',
                  borderRadius: '16px',
                  padding: '12px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  minHeight: '84px'
                }}
              >
                <div style={{ width: '32px', height: '32px', borderRadius: '10px', backgroundColor: 'rgba(16, 185, 129, 0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', marginBottom: '6px' }}>
                  🎓
                </div>
                <div>
                  <h4 style={{ margin: 0, fontWeight: 700, fontSize: '12.5px', color: '#F5EFE5' }}>Teacher Training</h4>
                  <p style={{ margin: '2px 0 0 0', fontSize: '10.5px', color: '#A8A29E' }}>200-Hr certified</p>
                </div>
              </button>
            </div>

            {/* Divider 2: OR ASK ME ANYTHING */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '4px 0 2px 0' }}>
              <div style={{ height: '1px', backgroundColor: 'rgba(255,255,255,0.12)', flex: 1 }} />
              <span style={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '1.2px', color: 'rgba(242, 169, 60, 0.85)', fontFamily: 'monospace' }}>
                OR ASK ME ANYTHING
              </span>
              <div style={{ height: '1px', backgroundColor: 'rgba(255,255,255,0.12)', flex: 1 }} />
            </div>

            {/* Question Pills Row */}
            <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }} className="no-scrollbar">
              {[
                'What courses do you offer?',
                'What is Pragya Yog School?',
                'Do you offer beginner classes?'
              ].map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(q)}
                  style={{
                    backgroundColor: '#281F1A',
                    border: '1px solid rgba(242, 169, 60, 0.25)',
                    color: '#E7E5E4',
                    fontSize: '12px',
                    padding: '7px 12px',
                    borderRadius: '12px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    flexShrink: 0
                  }}
                >
                  <MessageSquare size={13} style={{ color: '#FCD34D' }} />
                  <span>{q}</span>
                </button>
              ))}
            </div>

            {/* WhatsApp Full Banner Button */}
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                backgroundColor: '#1B2C1E',
                border: '1px solid rgba(37, 211, 102, 0.4)',
                color: '#6EE7B7',
                fontSize: '12px',
                fontWeight: 600,
                padding: '10px 14px',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                textDecoration: 'none',
                boxShadow: '0 2px 8px rgba(0,0,0,0.25)'
              }}
            >
              <svg viewBox="0 0 24 24" style={{ width: '16px', height: '16px', fill: '#25D366' }}>
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Talk to a human on WhatsApp
            </a>

            {/* Messages Stream */}
            {messages.map((msg) => (
              <div
                key={msg.id}
                style={{
                  display: 'flex',
                  gap: '10px',
                  justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '92%',
                  marginLeft: msg.sender === 'user' ? 'auto' : '0',
                  marginRight: msg.sender === 'bot' ? 'auto' : '0'
                }}
              >
                {/* Bot Avatar Icon */}
                {msg.sender === 'bot' && (
                  <div
                    style={{
                      width: '34px',
                      height: '34px',
                      borderRadius: '50%',
                      backgroundColor: '#1C1512',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
                      marginTop: '2px',
                      overflow: 'hidden',
                      border: '1px solid rgba(242, 169, 60, 0.6)'
                    }}
                  >
                    <img src="/mascot.png" alt="Pragya AI" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div
                    style={{
                      padding: '12px 16px',
                      borderRadius: msg.sender === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                      backgroundColor: msg.sender === 'user' ? '#944426' : '#281F1A',
                      color: '#F5EFE5',
                      border: msg.sender === 'user' ? 'none' : '1px solid rgba(196, 154, 42, 0.2)',
                      fontSize: '13px',
                      lineHeight: '1.5'
                    }}
                  >
                    {renderFormattedText(msg.text)}
                  </div>

                  <div style={{ fontSize: '10px', color: '#A8A29E', padding: '0 4px' }}>{msg.timestamp}</div>

                  {/* Suggestions Pills */}
                  {msg.sender === 'bot' && msg.suggestions && msg.suggestions.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', paddingTop: '4px' }}>
                      {msg.suggestions.map((sug, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSend(sug)}
                          style={{
                            backgroundColor: '#281F1A',
                            border: '1px solid rgba(242, 169, 60, 0.3)',
                            color: '#FCD34D',
                            fontSize: '11.5px',
                            padding: '5px 12px',
                            borderRadius: '16px',
                            cursor: 'pointer'
                          }}
                        >
                          {sug}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Loading Indicator */}
            {loading && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#281F1A', border: '1px solid rgba(242, 169, 60, 0.2)', padding: '10px 14px', borderRadius: '16px', fontSize: '12px', color: '#E7E5E4', width: 'fit-content' }}>
                <img src="/mascot.png" alt="Thinking mascot" style={{ width: '22px', height: '22px', objectFit: 'contain', animation: 'bounce 1s infinite' }} />
                <span style={{ width: '6px', height: '6px', backgroundColor: '#FCD34D', borderRadius: '50%', animation: 'bounce 1s infinite -0.3s' }} />
                <span style={{ width: '6px', height: '6px', backgroundColor: '#FCD34D', borderRadius: '50%', animation: 'bounce 1s infinite -0.15s' }} />
                <span style={{ width: '6px', height: '6px', backgroundColor: '#FCD34D', borderRadius: '50%', animation: 'bounce 1s infinite' }} />
                <span style={{ marginLeft: '4px', color: '#A8A29E' }}>Pragya is thinking...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* 3. Input Footer Bar */}
          <div style={{ padding: '10px 12px', backgroundColor: '#16100D', borderTop: '1px solid rgba(242, 169, 60, 0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {/* Voice Dictation Button */}
              <button
                onClick={toggleSpeechRecognition}
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  border: isListening ? '1px solid #EF4444' : '1px solid rgba(242, 169, 60, 0.35)',
                  backgroundColor: isListening ? '#DC2626' : '#281F1A',
                  color: isListening ? '#FFFFFF' : '#FCD34D',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  flexShrink: 0
                }}
                title="Dictate message"
              >
                <Mic size={17} />
              </button>

              {/* Text Input Pill */}
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask me anything"
                style={{
                  flex: 1,
                  backgroundColor: '#281F1A',
                  border: '1px solid rgba(242, 169, 60, 0.3)',
                  borderRadius: '20px',
                  padding: '8px 14px',
                  fontSize: '13px',
                  color: '#F5EFE5',
                  outline: 'none'
                }}
              />

              {/* Glowing Yellow Soundwave Button */}
              <button
                onClick={() => setIsMuted(!isMuted)}
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  backgroundColor: '#FACC15',
                  color: '#1C1512',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '11px',
                  cursor: 'pointer',
                  boxShadow: '0 2px 10px rgba(250, 204, 21, 0.4)',
                  flexShrink: 0
                }}
                title={isMuted ? 'Enable Voice Output' : 'Mute Voice Output'}
              >
                |||
              </button>

              {/* Send Button Circle */}
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || loading}
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  backgroundColor: input.trim() && !loading ? '#896315' : '#281F1A',
                  border: input.trim() && !loading ? 'none' : '1px solid rgba(255,255,255,0.08)',
                  color: input.trim() && !loading ? '#FEF3C7' : '#78716C',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
                  flexShrink: 0
                }}
                title="Send message"
              >
                <Send size={15} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global Animation Styles */}
      <style>{`
        @keyframes floatUpDown {
          0%, 100% {
            transform: translateY(0px);
            filter: drop-shadow(0 6px 16px rgba(255, 127, 63, 0.4));
          }
          50% {
            transform: translateY(-10px);
            filter: drop-shadow(0 16px 24px rgba(255, 127, 63, 0.65));
          }
        }
        @keyframes floatMascot {
          0%, 100% {
            transform: translateY(0px) scale(1);
          }
          50% {
            transform: translateY(-3px) scale(1.04);
          }
        }
        @keyframes pulseGlow {
          0% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.22); opacity: 0; }
          100% { transform: scale(1); opacity: 0; }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};
