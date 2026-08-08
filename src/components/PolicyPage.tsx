import React, { useEffect, useState } from 'react';
import { ArrowLeft, ShieldCheck, FileText, Lock, Info, RefreshCw, CheckCircle, Mail, Printer, Share2 } from 'lucide-react';
import { getPolicy } from '../services/api';
import { PolicyItem } from '../types';

interface PolicyPageProps {
  policyId: number | string;
  onBack: () => void;
  onSelectPolicy?: (id: number) => void;
}

export const PolicyPage: React.FC<PolicyPageProps> = ({
  policyId,
  onBack,
  onSelectPolicy
}) => {
  const [currentId, setCurrentId] = useState<number>(Number(policyId) || 3);
  const [policyData, setPolicyData] = useState<PolicyItem | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    getPolicy(currentId).then((data) => {
      if (isMounted) {
        setPolicyData(data);
        setLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [currentId]);

  const policiesNav = [
    { id: 1, title: 'Booking & Cancellation', icon: CheckCircle },
    { id: 2, title: 'Terms & Conditions', icon: FileText },
    { id: 3, title: 'Privacy Policy', icon: Lock },
    { id: 4, title: 'About Us', icon: Info },
  ];

  const handleTabChange = (id: number) => {
    setCurrentId(id);
    if (onSelectPolicy) {
      onSelectPolicy(id);
    }
  };

  // Helper to format API HTML text with proper spacing & readability fixes
  const formatPolicyHtml = (rawHtml?: string) => {
    if (!rawHtml) return '';
    return rawHtml
      .replace(/classesor/gi, 'classes or ')
      .replace(/ClassesandPackages/gi, 'Classes and Packages')
      .replace(/thepackages/gi, 'the packages')
      .replace(/eventshave/gi, 'events have ')
      .replace(/thefirst/gi, 'the first ')
      .replace(/firstclass/gi, 'first class ')
      .replace(/classyou/gi, 'class you ')
      .replace(/youattend/gi, 'you attend')
      .replace(/ofPragya/gi, 'of Pragya ')
      .replace(/\)1/g, ') 1')
      .replace(/details,please/gi, 'details, please')
      .replace(/non-refundable\./gi, '<strong style="color:#944426;">non-refundable</strong>.')
      .replace(/cannot be transferred/gi, '<strong style="color:#944426;">cannot be transferred</strong>');
  };

  return (
    <div style={{ backgroundColor: '#F5EFE5', minHeight: '100vh', color: '#21201E', paddingBottom: '90px' }}>
      {/* Top Hero Header Section */}
      <section
        style={{
          backgroundColor: '#00381F',
          color: '#FFFFFF',
          padding: '135px 24px 64px 24px',
          textAlign: 'center',
          position: 'relative',
          boxShadow: '0 8px 24px rgba(0,0,0,0.1)'
        }}
      >
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
          {/* Back Button */}
          <button
            onClick={onBack}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: 'rgba(255, 255, 255, 0.12)',
              color: '#FFFFFF',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              borderRadius: '999px',
              padding: '8px 20px',
              fontSize: '12.5px',
              fontWeight: 700,
              cursor: 'pointer',
              marginBottom: '24px',
              transition: 'all 0.2s ease',
              backdropFilter: 'blur(8px)'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.25)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.12)'; }}
          >
            <ArrowLeft size={16} />
            <span>Back to Home</span>
          </button>

          {/* Legal Badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              fontSize: '11px',
              fontWeight: 800,
              letterSpacing: '0.16em',
              color: '#D9A726',
              textTransform: 'uppercase',
              marginBottom: '14px'
            }}
          >
            <ShieldCheck size={16} color="#D9A726" />
            <span>PRAGYA YOG POLICIES & LEGAL TERMS</span>
          </div>

          {/* Title */}
          <h1
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: 'clamp(32px, 5vw, 52px)',
              fontWeight: 400,
              color: '#FFFFFF',
              margin: '0 0 14px 0',
              lineHeight: 1.15
            }}
          >
            {policyData?.title || 'Terms & Conditions'}
          </h1>
          <p style={{ fontSize: '15px', color: 'rgba(255, 255, 255, 0.82)', maxWidth: '620px', margin: '0 auto', lineHeight: 1.5 }}>
            Transparent guidelines protecting your privacy, studio safety, and membership privileges.
          </p>
        </div>
      </section>

      {/* Main Content Area */}
      <div style={{ maxWidth: '960px', margin: '36px auto 0 auto', padding: '0 24px' }}>
        {/* Navigation Tabs Bar */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '22px',
            padding: '8px',
            boxShadow: '0 12px 32px rgba(0,0,0,0.06)',
            display: 'flex',
            gap: '8px',
            overflowX: 'auto',
            marginBottom: '36px',
            border: '1px solid rgba(39,39,39,0.08)'
          }}
          className="policy-tabs-bar"
        >
          {policiesNav.map((nav) => {
            const Icon = nav.icon;
            const isActive = currentId === nav.id;
            return (
              <button
                key={nav.id}
                onClick={() => handleTabChange(nav.id)}
                style={{
                  flex: 1,
                  minWidth: '170px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '13px 18px',
                  borderRadius: '16px',
                  backgroundColor: isActive ? '#00381F' : 'transparent',
                  color: isActive ? '#FFFFFF' : '#4A4540',
                  fontWeight: isActive ? 800 : 600,
                  fontSize: '13px',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  whiteSpace: 'nowrap'
                }}
              >
                <Icon size={16} color={isActive ? '#D9A726' : '#7A756F'} />
                <span>{nav.title}</span>
              </button>
            );
          })}
        </div>

        {/* Policy Document Content Card */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '32px',
            padding: '52px 48px',
            boxShadow: '0 16px 44px rgba(0,0,0,0.05)',
            border: '1px solid rgba(39,39,39,0.08)'
          }}
          className="policy-card"
        >
          {loading ? (
            <div style={{ textAlign: 'center', padding: '64px 0', color: '#00381F' }}>
              <RefreshCw size={36} className="animate-spin" style={{ margin: '0 auto 16px auto', display: 'block', color: '#944426' }} />
              <p style={{ fontSize: '15px', color: '#7A756F', fontWeight: 600 }}>Loading policy document...</p>
            </div>
          ) : policyData ? (
            <div>
              {/* Document Header Row */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderBottom: '1px solid #F0EAE1',
                  paddingBottom: '24px',
                  marginBottom: '32px',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 800,
                      color: '#FFFFFF',
                      backgroundColor: '#944426',
                      padding: '4px 10px',
                      borderRadius: '999px',
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase'
                    }}
                  >
                    Policy ID #{policyData.id}
                  </span>
                  <span style={{ fontSize: '13px', color: '#7A756F', fontWeight: 600 }}>
                    Official Pragya Yog Standard
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <button
                    onClick={() => window.print()}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      backgroundColor: '#FAF6F0',
                      border: '1px solid rgba(39,39,39,0.12)',
                      borderRadius: '999px',
                      padding: '6px 14px',
                      fontSize: '12px',
                      fontWeight: 700,
                      color: '#4A4540',
                      cursor: 'pointer'
                    }}
                  >
                    <Printer size={14} />
                    <span>Print</span>
                  </button>

                  {policyData.updated_at && (
                    <span style={{ fontSize: '12.5px', color: '#8A8580', fontWeight: 500 }}>
                      Effective: {policyData.updated_at}
                    </span>
                  )}
                </div>
              </div>

              {/* Render HTML content safely with polished formatting */}
              <div
                className="policy-html-body"
                style={{
                  fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                  fontSize: '16px',
                  lineHeight: 1.8,
                  color: '#272727'
                }}
                dangerouslySetInnerHTML={{
                  __html: formatPolicyHtml(policyData.content || policyData.description) || '<p>No detailed policy text available.</p>'
                }}
              />
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '48px 0' }}>
              <p style={{ color: '#7A756F', fontSize: '15px' }}>Policy document could not be retrieved.</p>
            </div>
          )}
        </div>

        {/* Legal Inquiry Support Banner */}
        <div
          style={{
            backgroundColor: '#00381F',
            color: '#FFFFFF',
            borderRadius: '24px',
            padding: '28px 36px',
            marginTop: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '24px',
            flexWrap: 'wrap',
            boxShadow: '0 12px 32px rgba(0,56,31,0.15)'
          }}
        >
          <div>
            <h4 style={{ fontSize: '16px', fontWeight: 800, color: '#FFFFFF', margin: '0 0 6px 0', fontFamily: 'var(--font-sans)' }}>
              Questions about our terms or member policies?
            </h4>
            <p style={{ fontSize: '13.5px', color: 'rgba(255, 255, 255, 0.8)', margin: 0 }}>
              Our sanctuary support team is ready to clarify any studio or legal policy inquiries.
            </p>
          </div>
          <a
            href="mailto:info@pyshk.com"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#944426',
              color: '#FFFFFF',
              padding: '12px 24px',
              borderRadius: '999px',
              fontSize: '13px',
              fontWeight: 800,
              textDecoration: 'none',
              letterSpacing: '0.04em',
              transition: 'transform 0.2s ease',
              whiteSpace: 'nowrap'
            }}
          >
            <Mail size={16} />
            <span>CONTACT SUPPORT</span>
          </a>
        </div>
      </div>

      {/* Styled Scoped CSS for Policy Content */}
      <style>{`
        .policy-html-body {
          overflow-x: auto;
        }
        .policy-html-body h2, .policy-html-body u {
          font-family: var(--font-serif);
          font-size: 22px;
          color: #00381F;
          margin-top: 36px;
          margin-bottom: 16px;
          font-weight: 700;
          display: block;
          text-decoration: none !important;
          border-bottom: 2px solid #D9A726;
          padding-bottom: 8px;
        }
        .policy-html-body h3 {
          font-family: var(--font-serif);
          font-size: 20px;
          color: #00381F;
          margin-top: 32px;
          margin-bottom: 14px;
          font-weight: 700;
          line-height: 1.3;
          border-left: 4px solid #944426;
          padding-left: 14px;
          background-color: #FAF6F0;
          padding-top: 8px;
          padding-bottom: 8px;
          border-radius: 0 10px 10px 0;
        }
        .policy-html-body h4 {
          font-family: var(--font-sans);
          font-size: 16.5px;
          color: #944426;
          margin-top: 24px;
          margin-bottom: 10px;
          font-weight: 700;
          letter-spacing: 0.01em;
        }
        .policy-html-body p {
          margin-bottom: 20px;
          color: #353330;
          font-size: 15.5px;
          line-height: 1.85;
          word-break: break-word;
        }
        .policy-html-body strong, .policy-html-body b {
          color: #21201E;
          font-weight: 700;
        }
        .policy-html-body table {
          width: 100% !important;
          max-width: 100% !important;
          border-collapse: separate !important;
          border-spacing: 0 !important;
          margin: 28px 0 !important;
          border: 1px solid #EBE4D8 !important;
          border-radius: 16px !important;
          overflow: hidden !important;
          box-shadow: 0 4px 16px rgba(0,0,0,0.03) !important;
          table-layout: auto !important;
        }
        .policy-html-body th {
          background-color: #00381F !important;
          color: #FFFFFF !important;
          font-family: var(--font-sans) !important;
          font-size: 13px !important;
          font-weight: 700 !important;
          letter-spacing: 0.06em !important;
          text-transform: uppercase !important;
          padding: 14px 18px !important;
          text-align: left !important;
        }
        .policy-html-body td {
          padding: 14px 18px !important;
          font-size: 14px !important;
          color: #353330 !important;
          border-bottom: 1px solid #F0EAE1 !important;
          background-color: #FFFFFF !important;
          line-height: 1.6 !important;
        }
        .policy-html-body tr:nth-child(even) td {
          background-color: #FAF6F0 !important;
        }
        .policy-html-body tr:last-child td {
          border-bottom: none !important;
        }
        .policy-html-body ul, .policy-html-body ol {
          margin-bottom: 24px;
          padding-left: 24px;
        }
        .policy-html-body li {
          margin-bottom: 10px;
          line-height: 1.75;
          color: #353330;
        }

        /* Mobile View Tweaks */
        @media (max-width: 640px) {
          .policy-card {
            padding: 28px 20px !important;
            border-radius: 20px !important;
          }
          .policy-tabs-bar {
            padding: 6px !important;
            border-radius: 16px !important;
          }
          .policy-html-body table {
            display: block !important;
            overflow-x: auto !important;
            white-space: nowrap !important;
          }
        }
      `}</style>
    </div>
  );
};
