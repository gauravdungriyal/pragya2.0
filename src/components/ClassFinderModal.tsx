import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Sparkles, ArrowRight, CheckCircle2, MessageCircle, HelpCircle, RefreshCw, Calendar, ChevronRight } from 'lucide-react';

export interface ClassFinderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectRecommendation: (classType: string, classTitle: string) => void;
  onOpenBooking?: (type?: string, title?: string, details?: any) => void;
  onOpenChat?: () => void;
}

export type LevelOption = 'New' | 'Returning' | 'Regular' | 'Advanced';
export type GoalOption = 'Strength' | 'Mobility' | 'Flexibility' | 'Balance' | 'Recovery' | 'Deeper practice';

interface RecommendationResult {
  title: string;
  subtitle: string;
  description: string;
  targetFilter: string;
}

export const ClassFinderModal: React.FC<ClassFinderModalProps> = ({
  isOpen,
  onClose,
  onSelectRecommendation,
  onOpenBooking,
  onOpenChat,
}) => {
  const [level, setLevel] = useState<LevelOption | null>(null);
  const [goal, setGoal] = useState<GoalOption | null>(null);
  const [step, setStep] = useState<'quiz' | 'result'>('quiz');

  // Lock body scroll when modal opens so window doesn't jump or require scrolling
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const levels: { id: LevelOption; label: string; desc: string }[] = [
    { id: 'New', label: 'New', desc: 'First time or just beginning your yoga journey' },
    { id: 'Returning', label: 'Returning', desc: 'Practised before, restarting after a break' },
    { id: 'Regular', label: 'Regular', desc: 'Consistent practice and building confidence' },
    { id: 'Advanced', label: 'Advanced', desc: 'Experienced practitioner seeking deep work' },
  ];

  const goals: { id: GoalOption; label: string; desc: string }[] = [
    { id: 'Strength', label: 'Strength', desc: 'Build power, stability, and muscular tone' },
    { id: 'Mobility', label: 'Mobility', desc: 'Unlock stiffness, free joint movements' },
    { id: 'Flexibility', label: 'Flexibility', desc: 'Deep stretches for hips, hamstrings & spine' },
    { id: 'Balance', label: 'Balance', desc: 'Arm balances, inversions & poise' },
    { id: 'Recovery', label: 'Recovery', desc: 'Calm the mind, relieve fatigue & stress' },
    { id: 'Deeper practice', label: 'Deeper practice', desc: 'Advanced posture work & subtle energy' },
  ];

  const computeRecommendation = (): RecommendationResult => {
    if (level === 'New' || level === 'Returning') {
      return {
        title: "We'd suggest starting with Hatha Yog / Mobility Classes",
        subtitle: 'A supportive foundation for your practice',
        description:
          'A supportive introduction to alignment and fundamental asan, designed to help you build confidence and a strong foundation.',
        targetFilter: 'Hatha Yog',
      };
    }

    switch (goal) {
      case 'Strength':
        return {
          title: 'Vinyasa / Yog Strength & Core',
          subtitle: 'Dynamic flow & deep power',
          description:
            "Fluid movement synchronized with breath to challenge stamina, strengthen core muscles, and elevate physical vitality.",
          targetFilter: 'Vinyasa',
        };
      case 'Mobility':
        return {
          title: 'Mobility Classes & Hips & Hamstrings',
          subtitle: 'Functional movement & joint health',
          description:
            'Targeted sessions focused on joint longevity, functional range of motion, and releasing deep bodily tension.',
          targetFilter: 'Mobility',
        };
      case 'Balance':
        return {
          title: 'Yog Balance / Inversion / Arm Balance',
          subtitle: 'Equilibrium, focus & playfulness',
          description:
            'Explore center of gravity, wrist and shoulder stability, and master inversions and arm balance postures with safety.',
          targetFilter: 'Balance',
        };
      case 'Recovery':
        return {
          title: 'Hatha Yog & Yin Yang',
          subtitle: 'Restorative healing & deep release',
          description:
            'Slower-paced, soothing postures designed to reset the nervous system, lower stress, and rejuvenate the body.',
          targetFilter: 'Yin Yang',
        };
      case 'Deeper practice':
        return {
          title: 'Hatha Yog 2 / Vinyasa & Inversions',
          subtitle: 'Refinement, depth & mastery',
          description:
            'Advanced alignment cues, pranayama integration, and challenging asana variations for dedicated practitioners.',
          targetFilter: 'Hatha Yog 2',
        };
      case 'Flexibility':
      default:
        return {
          title: 'Hips & Hamstrings / Mobility & Hatha Yog',
          subtitle: 'Surrender & muscle lengthening',
          description:
            'Dedicated work on hips, hamstrings, and spinal flex, helping you safely increase range of motion without strain.',
          targetFilter: 'Hips & Hamstrings',
        };
    }
  };

  const handleSeeClasses = () => {
    const rec = computeRecommendation();
    onSelectRecommendation(rec.targetFilter, rec.title);
    onClose();
  };

  const handleTrialBooking = () => {
    if (onOpenBooking) {
      onOpenBooking('trial', '3-Class Trial', {
        title: '3-Class Trial Pass',
        price: 'Special Intro Offer',
        description: 'Try. Explore. Find your practice across studio classes.',
      });
    }
    onClose();
  };

  const handleReset = () => {
    setLevel(null);
    setGoal(null);
    setStep('quiz');
  };

  const rec = computeRecommendation();
  const canProceed = level === 'New' || level === 'Returning' || (level !== null && goal !== null);

  const modalMarkup = (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 999999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)'
      }}
      className="animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="relative w-full max-w-4xl bg-[#F5EFE5] rounded-3xl shadow-2xl border border-[#272727]/12 overflow-hidden flex flex-col my-0 mx-auto transition-all"
        style={{ maxHeight: '95vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Ribbon - Fixed at top of modal with explicit padding */}
        <div
          className="bg-[#FAF6F0] text-[#272727] flex items-center justify-between border-b border-[#272727]/12 flex-shrink-0"
          style={{ padding: '16px 28px', minHeight: '64px' }}
        >
          <div className="flex items-center gap-3.5">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#944426]/10 text-[#944426] border border-[#944426]/20 flex items-center justify-center flex-shrink-0 shadow-inner">
              <Sparkles className="w-4.5 h-4.5 text-[#944426]" />
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider text-[#944426] font-bold block mb-0.5 font-sans">
                NEW TO PRAGYA?
              </span>
              <h2 className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-[#272727]">
                Find Your Starting Point
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-[#272727]/10 hover:bg-[#272727]/20 flex items-center justify-center text-[#272727] transition-all hover:scale-105 cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body - Generous size fitting cleanly without scrollbar */}
        <div
          className="flex-1 overflow-y-auto"
          style={{
            padding: '20px 28px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px'
          }}
        >
          {step === 'quiz' ? (
            <div className="space-y-4">
              <p className="text-sm sm:text-base text-[#272727]/85 leading-snug font-sans pb-2 border-b border-[#272727]/10 text-center">
                Not sure which class is right for you? Answer 2 simple questions to get your personalized class recommendation.
              </p>

              {/* Question 1 */}
              <div className="space-y-2 text-center">
                <label
                  className="block text-xs sm:text-sm uppercase tracking-wider text-[#944426] font-bold font-sans text-center"
                  style={{ padding: '2px 0' }}
                >
                  1. WHERE ARE YOU IN YOUR PRACTICE?
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full">
                  {levels.map((lvl) => {
                    const isSelected = level === lvl.id;
                    return (
                      <button
                        key={lvl.id}
                        type="button"
                        onClick={() => setLevel(lvl.id)}
                        className={`w-full text-center rounded-2xl border transition-all duration-200 shadow-sm flex flex-col items-center justify-center space-y-1 cursor-pointer ${
                          isSelected
                            ? 'bg-[#944426] text-white border-[#944426] shadow-md ring-2 ring-[#D9AE29]'
                            : 'bg-white hover:bg-[#FAF6F0] text-[#272727] border-[#272727]/15 hover:border-[#944426]/50'
                        }`}
                        style={{ padding: '12px 18px', minHeight: '58px' }}
                      >
                        <div className="flex items-center justify-center gap-2">
                          <span className="font-serif font-bold text-sm sm:text-base text-center">{lvl.label}</span>
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-[#D9AE29]" />}
                        </div>
                        <p className={`text-xs leading-tight text-center ${isSelected ? 'text-white/90' : 'text-[#272727]/70'}`}>
                          {lvl.desc}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Question 2 */}
              <div className="space-y-2 pt-2.5 text-center border-t border-[#272727]/10">
                <label
                  className="block text-xs sm:text-sm uppercase tracking-wider text-[#944426] font-bold font-sans text-center"
                  style={{ padding: '2px 0' }}
                >
                  2. WHAT ARE YOU LOOKING FOR?
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 w-full">
                  {goals.map((g) => {
                    const isSelected = goal === g.id;
                    return (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => setGoal(g.id)}
                        className={`w-full text-center rounded-2xl border transition-all duration-200 shadow-sm flex flex-col items-center justify-center space-y-1 cursor-pointer ${
                          isSelected
                            ? 'bg-[#944426] text-white border-[#944426] shadow-md ring-2 ring-[#D9AE29]'
                            : 'bg-white hover:bg-[#FAF6F0] text-[#272727] border-[#272727]/15 hover:border-[#944426]/50'
                        }`}
                        style={{ padding: '10px 14px', minHeight: '48px' }}
                      >
                        <div className="font-serif font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 text-center">
                          <span>{g.label}</span>
                          {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-[#D9AE29]" />}
                        </div>
                        <p className={`text-[11px] leading-tight text-center ${isSelected ? 'text-white/90' : 'text-[#272727]/70'}`}>
                          {g.desc}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Action Button Section with Explicit Padding */}
              <div
                className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-[#272727]/12"
                style={{ paddingTop: '12px', marginTop: '10px' }}
              >
                <span className="text-xs text-[#272727]/60 italic font-sans text-center sm:text-left">
                  {canProceed
                    ? 'Ready to view recommendation'
                    : level !== null
                    ? 'Please select what you are looking for to continue'
                    : 'Please select an option above to continue'}
                </span>
                <button
                  type="button"
                  disabled={!canProceed}
                  onClick={() => setStep('result')}
                  className={`w-full sm:w-auto rounded-full font-serif font-bold text-xs sm:text-sm flex items-center justify-center gap-2.5 transition-all ${
                    canProceed
                      ? 'bg-[#944426] hover:bg-[#7a351c] text-white shadow-lg hover:shadow-xl hover:scale-105 cursor-pointer ring-2 ring-[#944426]/15'
                      : 'bg-[#272727]/20 text-[#272727]/40 cursor-not-allowed'
                  }`}
                  style={{ padding: '12px 32px', minHeight: '46px' }}
                >
                  <span>Show Recommendation</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            /* Result Screen - Compact layout fitting without scrollbar */
            <div className="animate-fade-in text-center" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Top Terracotta Card */}
              <div
                className="bg-[#944426] text-white rounded-2xl relative overflow-hidden border-2 border-[#D9AE29]/40 shadow-xl text-center"
                style={{ padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}
              >
                <div className="absolute top-0 right-0 transform translate-x-6 -translate-y-6 w-32 h-32 bg-[#D9AE29]/20 rounded-full blur-2xl pointer-events-none" />
                <span
                  className="inline-block bg-[#D9AE29] text-[#272727] text-[10px] sm:text-xs font-sans font-bold uppercase tracking-wider rounded-full mx-auto"
                  style={{ padding: '4px 16px' }}
                >
                  YOUR STARTING POINT
                </span>
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-white tracking-tight text-center">{rec.title}</h3>
                <p className="text-[#D9AE29] font-serif text-xs sm:text-sm font-medium text-center">{rec.subtitle}</p>
                <p className="text-white/90 text-xs sm:text-sm leading-relaxed font-sans text-center" style={{ paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.15)' }}>
                  {rec.description}
                </p>
              </div>

              {/* Action Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 w-full">
                {/* CTA 1: View Classes */}
                <button
                  type="button"
                  onClick={handleSeeClasses}
                  className="group bg-white hover:bg-[#FAF6F0] border-2 border-[#944426] text-[#944426] rounded-2xl text-center transition-all shadow-sm hover:shadow-md flex flex-col items-center justify-between cursor-pointer"
                  style={{ padding: '14px 18px', minHeight: '90px' }}
                >
                  <div className="text-center w-full" style={{ paddingBottom: '8px' }}>
                    <div className="flex items-center justify-center gap-1.5 mb-1">
                      <span className="font-serif font-bold text-sm sm:text-base text-[#944426] text-center">See Suitable Classes</span>
                      <Calendar className="w-4 h-4 text-[#944426] group-hover:scale-110 transition-transform" />
                    </div>
                    <p className="text-[11px] sm:text-xs text-[#272727]/75 leading-relaxed font-sans text-center">
                      View 4–6 upcoming {rec.targetFilter} classes directly in the live timetable schedule.
                    </p>
                  </div>
                  <div
                    className="flex items-center justify-center gap-1 text-xs font-bold text-[#944426] group-hover:translate-x-1 transition-transform font-sans w-full"
                    style={{ paddingTop: '8px', borderTop: '1px solid rgba(148,68,38,0.12)' }}
                  >
                    <span>Show Schedule</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </button>

                {/* CTA 2: 3-Class Trial */}
                <button
                  type="button"
                  onClick={handleTrialBooking}
                  className="group bg-[#944426] hover:bg-[#7a351c] text-white rounded-2xl text-center transition-all shadow-md hover:shadow-lg flex flex-col items-center justify-between cursor-pointer"
                  style={{ padding: '14px 18px', minHeight: '90px' }}
                >
                  <div className="text-center w-full" style={{ paddingBottom: '8px' }}>
                    <div className="flex items-center justify-center gap-1.5 mb-1">
                      <span className="font-serif font-bold text-sm sm:text-base text-white text-center">3-Class Trial Pass</span>
                      <Sparkles className="w-4 h-4 text-[#D9AE29] group-hover:rotate-12 transition-transform" />
                    </div>
                    <p className="text-[11px] sm:text-xs text-white/85 leading-relaxed font-sans text-center">
                      Try. Explore. Find your practice. Ideal intro trial pass for new practitioners.
                    </p>
                  </div>
                  <div
                    className="flex items-center justify-center gap-1 text-xs font-bold text-[#D9AE29] group-hover:translate-x-1 transition-transform font-sans w-full"
                    style={{ paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.18)' }}
                  >
                    <span>Explore Trial</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </button>
              </div>

              {/* Still Not Sure? Ask Us Box */}
              <div
                className="bg-white rounded-2xl border border-[#272727]/12 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3"
                style={{ padding: '12px 18px' }}
              >
                <div className="flex items-center gap-3 text-center sm:text-left">
                  <div className="w-9 h-9 rounded-full bg-[#944426]/10 text-[#944426] flex items-center justify-center flex-shrink-0 mx-auto sm:mx-0">
                    <HelpCircle className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-xs sm:text-sm text-[#272727]">STILL NOT SURE? ASK US</h4>
                    <p className="text-[11px] text-[#272727]/75 font-sans">
                      Tell us about your experience and what you're looking for. Our team can help you choose where to begin.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto flex-shrink-0 justify-center">
                  <a
                    href="https://wa.me/919999999999?text=Hi%20Pragya%20Yog%20Team!%20I'm%20looking%20for%20guidance%20on%20which%20class%20to%20start%20with."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 sm:flex-none rounded-full bg-[#25D366] hover:bg-[#20ba5a] text-white font-serif text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors shadow-sm hover:shadow-md"
                    style={{ padding: '8px 18px' }}
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </a>
                  {onOpenChat && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenChat();
                      }}
                      className="flex-1 sm:flex-none rounded-full bg-[#944426] hover:bg-[#7a351c] text-white font-serif text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors shadow-sm hover:shadow-md cursor-pointer"
                      style={{ padding: '8px 18px' }}
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#D9AE29]" />
                      <span>AI Assistant</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Footer navigation */}
              <div className="flex items-center justify-between border-t border-[#272727]/10" style={{ paddingTop: '8px', marginTop: '2px' }}>
                <button
                  type="button"
                  onClick={handleReset}
                  className="text-xs text-[#944426] font-bold flex items-center gap-1 hover:underline cursor-pointer font-sans"
                  style={{ padding: '4px 8px' }}
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Start over</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="text-xs text-[#272727]/70 hover:text-[#272727] font-semibold rounded-full hover:bg-black/5 cursor-pointer font-sans"
                  style={{ padding: '6px 16px' }}
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (typeof window !== 'undefined') {
    return createPortal(modalMarkup, document.body);
  }

  return modalMarkup;
};
