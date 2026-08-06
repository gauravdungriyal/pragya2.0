import React, { useState } from 'react';
import { Bot, Sparkles, MessageSquare, ExternalLink, ShieldCheck, ArrowLeft, Send, RotateCcw, Volume2, VolumeX, CheckCircle2 } from 'lucide-react';

interface AiAssistantPageProps {
  onBackToHome: () => void;
  onOpenBooking?: (type?: string, title?: string) => void;
}

const CHAT_API_URL = 'https://pragya-ai-assistant.vercel.app/api/chat';
const VERCEL_EMBED_URL = 'https://pragya-ai-assistant.vercel.app/';

export const AiAssistantPage: React.FC<AiAssistantPageProps> = ({ onBackToHome, onOpenBooking }) => {
  const [activeTab, setActiveTab] = useState<'native' | 'iframe'>('native');
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');
  const [isMuted, setIsMuted] = useState(true);

  const [messages, setMessages] = useState<Array<{ id: string; sender: 'user' | 'bot'; text: string; timestamp: string; suggestions?: string[] }>>([
    {
      id: 'welcome-page-1',
      sender: 'bot',
      text: 'Namaste 🙏 Welcome to the official **Pragya AI Assistant**!\n\nI can answer questions about our **200-Hour Teacher Training**, **9 Group Class Types**, **Memberships**, **2026 Retreats in Niseko & Nepal**, and help you book your classes.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestions: [
        '🧘 Tell me about Group Classes',
        '📜 What are 200-Hr TTC details?',
        '💳 View Membership & Passes',
        '🏔️ Tell me about 2026 Retreats'
      ]
    }
  ]);

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || loading) return;

    const userMsg = {
      id: Date.now().toString(),
      sender: 'user' as const,
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

      if (!response.ok) throw new Error('API request failed');

      const data = await response.json();
      if (data.sessionId) setSessionId(data.sessionId);

      const botMsg = {
        id: (Date.now() + 1).toString(),
        sender: 'bot' as const,
        text: data.reply || 'How else can I assist your yogic journey today?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestions: data.suggestions && data.suggestions.length > 0 ? data.suggestions : [
          'Compare Memberships',
          'Book a Trial Class',
          'Contact Studio on WhatsApp'
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
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          sender: 'bot',
          text: 'I had trouble connecting to the backend. Please try again or reach out directly on [WhatsApp](https://wa.me/85267082503).',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const renderFormattedText = (text: string) => {
    return text.split('\n').map((line, lIdx) => {
      const boldFormatted = line.split(/(\*\*.*?\*\*)/g).map((chunk, cIdx) => {
        if (chunk.startsWith('**') && chunk.endsWith('**')) {
          return <strong key={cIdx} className="font-semibold text-amber-200">{chunk.slice(2, -2)}</strong>;
        }
        return chunk;
      });

      if (line.startsWith('* ') || line.startsWith('- ')) {
        return (
          <li key={lIdx} className="ml-4 list-disc space-y-1 my-0.5">
            {boldFormatted}
          </li>
        );
      }

      return (
        <p key={lIdx} className="my-1 leading-relaxed">
          {boldFormatted}
        </p>
      );
    });
  };

  return (
    <div className="min-h-screen bg-[#F5EFE5] text-[#21201E] pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-[#1E3A2B] to-[#11241A] text-[#F5EFE5] p-6 sm:p-8 rounded-3xl shadow-xl border border-[#C5A059]/30">
          <div className="space-y-2">
            <button
              onClick={onBackToHome}
              className="inline-flex items-center gap-2 text-xs font-semibold text-amber-300 hover:text-amber-100 uppercase tracking-widest transition-colors mb-2"
            >
              <ArrowLeft size={14} /> Back to main site
            </button>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-amber-400 shadow-inner">
                <Bot size={28} />
              </div>
              <div>
                <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight">Pragya AI Assistant</h1>
                <p className="text-xs sm:text-sm text-stone-300">
                  Where Science Meets Spirituality · Powered by Google Gemini AI
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* View Mode Toggle Buttons */}
            <div className="bg-emerald-950 p-1 rounded-xl border border-amber-500/30 flex text-xs">
              <button
                onClick={() => setActiveTab('native')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeTab === 'native' ? 'bg-amber-600 text-stone-950 font-semibold shadow' : 'text-stone-300 hover:text-white'
                }`}
              >
                Interactive AI
              </button>
              <button
                onClick={() => setActiveTab('iframe')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeTab === 'iframe' ? 'bg-amber-600 text-stone-950 font-semibold shadow' : 'text-stone-300 hover:text-white'
                }`}
              >
                Full Web Embed
              </button>
            </div>

            <a
              href="https://pragya-ai-assistant.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-400/40 px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors"
            >
              Open Standalone <ExternalLink size={14} />
            </a>
          </div>
        </div>

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Chat Container */}
          <div className="lg:col-span-8 flex flex-col h-[650px] bg-[#1E3A2B] rounded-3xl overflow-hidden shadow-2xl border border-[#C5A059]/30">
            
            {activeTab === 'native' ? (
              <>
                {/* Chat Header bar */}
                <div className="bg-[#11241A] px-6 py-4 border-b border-amber-500/20 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-amber-300 text-xs font-mono uppercase tracking-wider">
                    <Sparkles size={14} /> Live AI Assistant Session
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsMuted(!isMuted)}
                      className="p-1.5 text-stone-300 hover:text-amber-300 rounded-lg"
                      title={isMuted ? 'Unmute' : 'Mute'}
                    >
                      {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} className="text-amber-400" />}
                    </button>
                    <button
                      onClick={() => {
                        setSessionId('');
                        setMessages([messages[0]]);
                      }}
                      className="p-1.5 text-stone-300 hover:text-amber-300 rounded-lg"
                      title="Reset Session"
                    >
                      <RotateCcw size={16} />
                    </button>
                  </div>
                </div>

                {/* Messages Body */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-radial from-emerald-950/60 to-emerald-950">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'} max-w-[85%] ${
                        msg.sender === 'user' ? 'ml-auto' : 'mr-auto'
                      }`}
                    >
                      <div
                        className={`p-4 rounded-2xl text-sm ${
                          msg.sender === 'user'
                            ? 'bg-[#944426] text-[#F5EFE5] rounded-br-none'
                            : 'bg-[#2A4E3B] text-[#F5EFE5] rounded-bl-none border border-amber-500/20'
                        }`}
                      >
                        {renderFormattedText(msg.text)}
                      </div>
                      <span className="text-[10px] text-stone-400 mt-1 px-1">{msg.timestamp}</span>

                      {msg.sender === 'bot' && msg.suggestions && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {msg.suggestions.map((sug, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleSend(sug)}
                              className="text-xs bg-emerald-900/80 hover:bg-amber-600 text-amber-200 hover:text-stone-950 border border-amber-500/30 px-3 py-1.5 rounded-full transition-all"
                            >
                              {sug}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}

                  {loading && (
                    <div className="flex items-center gap-2 bg-emerald-900/40 border border-amber-500/20 px-4 py-3 rounded-2xl w-fit">
                      <Bot size={18} className="text-amber-400 animate-spin" />
                      <span className="text-xs text-stone-300">Pragya AI is typing...</span>
                    </div>
                  )}
                </div>

                {/* Input Bar */}
                <div className="p-4 bg-stone-900 border-t border-emerald-800/40">
                  <div className="flex items-center gap-3 bg-emerald-950 border border-amber-500/30 rounded-2xl px-4 py-2 focus-within:border-amber-400">
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                      placeholder="Ask anything about Pragya Yog School (classes, pricing, TTC)..."
                      className="w-full bg-transparent text-sm text-stone-100 placeholder-stone-400 focus:outline-none py-1"
                    />
                    <button
                      onClick={() => handleSend()}
                      disabled={!input.trim() || loading}
                      className="bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-stone-950 p-2.5 rounded-xl font-bold transition-colors"
                    >
                      <Send size={16} />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              /* Iframe Embed View */
              <iframe
                src={VERCEL_EMBED_URL}
                title="Pragya AI Assistant Full App"
                className="w-full h-full border-none"
              />
            )}
          </div>

          {/* Right Sidebar — Studio Info & Quick Topics */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* School Highlights Card */}
            <div className="bg-white p-6 rounded-3xl shadow-lg border border-amber-900/10 space-y-4">
              <h3 className="font-serif font-bold text-lg text-[#1E3A2B] flex items-center gap-2">
                <ShieldCheck size={20} className="text-[#C5A059]" /> Official Knowledge Source
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Pragya AI is directly trained on official studio information from Pragya Yog School Central, Hong Kong.
              </p>

              <div className="space-y-2.5 pt-2">
                <div className="flex items-start gap-2.5 text-xs text-stone-700">
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>University-Affiliated TTC:</strong> Only school in HK partnered with Indian Universities.</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs text-stone-700">
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>9 Group Classes:</strong> Pragya Signature, Flow, Restorative, Strength, etc.</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs text-stone-700">
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Location:</strong> 1303-04 Tak Woo House, Wo On Lane, Central HK.</span>
                </div>
              </div>

              {onOpenBooking && (
                <button
                  onClick={() => onOpenBooking('class', 'Book a Trial Class')}
                  className="w-full mt-4 bg-[#1E3A2B] hover:bg-[#11241A] text-[#F5EFE5] font-semibold text-xs py-3 px-4 rounded-xl transition-colors shadow-md"
                >
                  Book Trial Class (HK$450 for 3)
                </button>
              )}
            </div>

            {/* Quick Question Prompts */}
            <div className="bg-white p-6 rounded-3xl shadow-lg border border-amber-900/10 space-y-3">
              <h4 className="font-serif font-bold text-sm text-[#1E3A2B] uppercase tracking-wider">Popular Questions</h4>
              <div className="space-y-2">
                {[
                  'What is included in the 200-Hour TTC?',
                  'How much is an unlimited annual membership?',
                  'Tell me about the Niseko Japan Ski & Yog Retreat',
                  'Do you offer beginner classes?'
                ].map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setActiveTab('native');
                      handleSend(q);
                    }}
                    className="w-full text-left text-xs bg-stone-50 hover:bg-amber-50 text-stone-700 hover:text-stone-900 p-3 rounded-xl border border-stone-200 hover:border-amber-400 transition-colors flex items-center justify-between group"
                  >
                    <span>{q}</span>
                    <MessageSquare size={14} className="text-stone-400 group-hover:text-amber-600 shrink-0 ml-2" />
                  </button>
                ))}
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
