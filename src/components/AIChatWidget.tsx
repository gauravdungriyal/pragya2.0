import React, { useState, useEffect } from 'react';
import { X, ExternalLink } from 'lucide-react';
import { CHAT_EMBED_URL } from '../config/apiConfig';

interface AIChatWidgetProps {
  onOpenFullPage?: () => void;
  onOpenBooking?: (type?: string, title?: string) => void;
}

export const AIChatWidget: React.FC<AIChatWidgetProps> = ({ onOpenFullPage }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadBadge, setUnreadBadge] = useState(true);
  const [showTooltip, setShowTooltip] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setUnreadBadge(false);
      setShowTooltip(false);
    }
  }, [isOpen]);

  useEffect(() => {
    const timer = setTimeout(() => setShowTooltip(false), 8000);
    return () => clearTimeout(timer);
  }, []);

  // Listen for global open chat widget event (e.g. when AI Assistant is clicked in Header/Footer)
  useEffect(() => {
    const handleOpenChatWidget = () => {
      setIsOpen(true);
    };
    window.addEventListener('pragya-open-chat-widget', handleOpenChatWidget);
    return () => {
      window.removeEventListener('pragya-open-chat-widget', handleOpenChatWidget);
    };
  }, []);

  return (
    <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' }}>
      {/* ── Floating Launcher Button & Tooltip (Hidden when chat modal is open) ── */}
      {!isOpen && (
        <div
          className="pragya-launcher-container"
          style={{
            position: 'fixed',
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
              className="pragya-tooltip-badge"
              style={{
                pointerEvents: 'auto',
                marginBottom: '10px',
                backgroundColor: '#161311',
                color: '#F5EFE5',
                border: '1px solid rgba(212, 157, 51, 0.4)',
                padding: '10px 16px',
                borderRadius: '16px',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.45)',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                fontSize: '13px'
              }}
            >
              <img src="/mascot.png" alt="Pragya AI Mascot" style={{ width: '24px', height: '24px', objectFit: 'contain', flexShrink: 0 }} />
              <div>
                <span style={{ fontWeight: 600, display: 'block', color: '#F5D061' }}>Ask Pragya AI</span>
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
              border: '2px solid rgba(212, 157, 51, 0.8)',
              background: 'linear-gradient(135deg, #E67A26 0%, #D49D33 50%, #629B43 100%)',
              color: '#FFFFFF',
              boxShadow: '0 8px 32px rgba(230, 122, 38, 0.5)',
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
                border: '2px solid #D49D33',
                opacity: 0.8,
                animation: 'pulseGlow 2.5s infinite ease-out'
              }}
            />

            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: '46px', height: '46px', borderRadius: '50%', backgroundColor: '#161311', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '2px solid #D49D33', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>
                <img src="/mascot.png" alt="Pragya AI Mascot" style={{ width: '100%', height: '100%', objectFit: 'contain', animation: 'floatMascot 2.8s ease-in-out infinite' }} />
              </div>
              {unreadBadge && (
                <span style={{ position: 'absolute', top: '-4px', right: '-4px', width: '14px', height: '14px', backgroundColor: '#EF4444', borderRadius: '50%', border: '2px solid #161311' }} />
              )}
            </div>
          </button>
        </div>
      )}

      {/* ── Exact Chat Window Modal Panel Embed ── */}
      {isOpen && (
        <div
          className="pragya-chat-modal"
          style={{
            position: 'fixed',
            zIndex: 9995,
            backgroundColor: '#161311',
            color: '#F5EFE5',
            boxShadow: '0 24px 64px rgba(0, 0, 0, 0.75), 0 0 0 1px rgba(212, 157, 51, 0.4)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}
        >
          {/* Modal Close / Top Bar Overlay Control */}
          <div
            className="pragya-chat-top-overlay"
            style={{
              position: 'absolute',
              top: '10px',
              right: '12px',
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            {onOpenFullPage && (
              <button
                onClick={() => {
                  setIsOpen(false);
                  onOpenFullPage();
                }}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(0, 0, 0, 0.4)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
                title="Expand Full Page"
              >
                <ExternalLink size={14} />
              </button>
            )}

            <button
              onClick={() => setIsOpen(false)}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: 'rgba(0, 0, 0, 0.4)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
              title="Close Assistant"
            >
              <X size={16} />
            </button>
          </div>

          <div className="pragya-mobile-handle" />

          {/* Iframe embedding the exact hosted Pragya AI Assistant web app */}
          <iframe
            src={CHAT_EMBED_URL}
            title="Pragya AI Assistant"
            allow="microphone; autoplay; clipboard-write"
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              borderRadius: 'inherit'
            }}
          />
        </div>
      )}

      {/* Global Responsive & Animation CSS */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @media (min-width: 641px) {
          .pragya-launcher-container {
            bottom: 24px;
            right: 24px;
          }
          .pragya-tooltip-badge {
            max-width: 280px;
          }
          .pragya-chat-modal {
            bottom: 24px;
            right: 24px;
            width: 420px;
            height: 670px;
            max-height: calc(100vh - 48px);
            border-radius: 24px;
          }
          .pragya-mobile-handle {
            display: none;
          }
        }
        @media (max-width: 640px) {
          .pragya-launcher-container {
            bottom: max(16px, env(safe-area-inset-bottom));
            right: 16px;
          }
          .pragya-tooltip-badge {
            max-width: calc(100vw - 32px);
          }
          .pragya-chat-modal {
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            width: 100vw;
            height: 100dvh;
            max-height: 100dvh;
            border-radius: 0;
            z-index: 99999 !important;
          }
          .pragya-mobile-handle {
            width: 38px;
            height: 4px;
            background-color: rgba(255, 255, 255, 0.4);
            border-radius: 2px;
            position: absolute;
            top: 6px;
            left: 50%;
            transform: translateX(-50%);
            z-index: 9999;
          }
        }

        @keyframes floatUpDown {
          0%, 100% {
            transform: translateY(0px);
            filter: drop-shadow(0 6px 16px rgba(230, 122, 38, 0.4));
          }
          50% {
            transform: translateY(-10px);
            filter: drop-shadow(0 16px 24px rgba(230, 122, 38, 0.65));
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
      `
      }} />
    </div>
  );
};
