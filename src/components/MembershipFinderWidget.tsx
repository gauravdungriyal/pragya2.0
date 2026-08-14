import React, { useState } from 'react';
import { Sparkles, ArrowRight, CheckCircle2, RefreshCw, Clock } from 'lucide-react';

export interface MembershipFinderWidgetProps {
  onSelectUnlimited: () => void;
  onExploreFlexible: () => void;
}

export type MembershipGoal =
  | 'Build Strength & Stability'
  | 'Improve Mobility & Alignment'
  | 'Feel Better in My Body'
  | 'Find Balance & Clarity'
  | 'Deepen My Yog Practice'
  | 'Build a Consistent Practice';

export type PracticeExperience =
  | "I'm New"
  | "I'm Returning"
  | 'I Practise Regularly'
  | "I'm Experienced";

export const MembershipFinderWidget: React.FC<MembershipFinderWidgetProps> = ({
  onSelectUnlimited,
  onExploreFlexible,
}) => {
  const [selectedGoal, setSelectedGoal] = useState<MembershipGoal | null>(null);
  const [selectedExp, setSelectedExp] = useState<PracticeExperience | null>(null);
  const [showResult, setShowResult] = useState<boolean>(false);

  const goals: { id: MembershipGoal; label: string; icon: string }[] = [
    { id: 'Build Strength & Stability', label: 'Build Strength & Stability', icon: '💪' },
    { id: 'Improve Mobility & Alignment', label: 'Improve Mobility & Alignment', icon: '🧘' },
    { id: 'Feel Better in My Body', label: 'Feel Better in My Body', icon: '✨' },
    { id: 'Find Balance & Clarity', label: 'Find Balance & Clarity', icon: '🌿' },
    { id: 'Deepen My Yog Practice', label: 'Deepen My Yog Practice', icon: '🕉️' },
    { id: 'Build a Consistent Practice', label: 'Build a Consistent Practice', icon: '🔥' },
  ];

  const experiences: { id: PracticeExperience; label: string; desc: string }[] = [
    { id: "I'm New", label: "I'm New", desc: "I'm beginning or learning the foundations." },
    { id: "I'm Returning", label: "I'm Returning", desc: "I've practised before and want to rebuild consistency." },
    { id: 'I Practise Regularly', label: 'I Practise Regularly', desc: 'I have a foundation and want to develop further.' },
    { id: "I'm Experienced", label: "I'm Experienced", desc: "I'm looking for refinement, progression and deeper practice." },
  ];

  const canShowRecommendation = selectedGoal !== null && selectedExp !== null;

  const handleStartQuiz = () => {
    if (canShowRecommendation) {
      setShowResult(true);
    }
  };

  const handleReset = () => {
    setSelectedGoal(null);
    setSelectedExp(null);
    setShowResult(false);
  };

  return (
    <div
      className="w-full max-w-5xl mx-auto bg-[#FAF6F0] border border-[#272727]/12 rounded-3xl shadow-xl relative overflow-hidden transition-all"
      style={{
        padding: 'clamp(48px, 6vw, 84px) clamp(24px, 5vw, 64px) clamp(72px, 8vw, 110px) clamp(24px, 5vw, 64px)',
        marginTop: '24px',
        marginBottom: '24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      {/* Background Decorative Lighting */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#9D9D48]/12 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#944426]/8 rounded-full blur-3xl pointer-events-none" />

      {/* Header Section - Explicitly Centered */}
      <div
        className="w-full relative z-10"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          maxWidth: '768px',
          margin: '0 auto 48px auto'
        }}
      >
        {/* Text 1: Badge */}
        <div
          className="rounded-full bg-[#944426]/10 border border-[#944426]/20 text-[#944426] text-xs sm:text-sm font-sans font-bold uppercase tracking-wider"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            gap: '8px',
            padding: '8px 20px',
            margin: '0 auto 20px auto'
          }}
        >
          <Sparkles className="w-4 h-4 text-[#944426]" />
          <span style={{ textAlign: 'center' }}>Interactive Membership Finder</span>
        </div>

        {/* Text 2: Main Title */}
        <h2
          className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-[#272727] tracking-tight leading-tight"
          style={{
            textAlign: 'center',
            width: '100%',
            margin: '0 auto 16px auto',
            display: 'block'
          }}
        >
          FIND YOUR RIGHT MEMBERSHIP
        </h2>

        {/* Text 3: Subtitle */}
        <p
          className="font-sans text-sm sm:text-base md:text-lg text-[#272727]/80 leading-relaxed"
          style={{
            textAlign: 'center',
            width: '100%',
            maxWidth: '680px',
            margin: '0 auto',
            display: 'block'
          }}
        >
          We’ll help you find the membership that fits your practice, goals, and lifestyle. Answer just two questions and we'll make a recommendation based on what we believe will best support your practice.
        </p>
      </div>

      {!showResult ? (
        /* Quiz Form View */
        <div className="w-full relative z-10" style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
          {/* Question 1 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', textAlign: 'center', alignItems: 'center' }}>
            <label
              className="block text-xs sm:text-sm uppercase tracking-wider text-[#944426] font-bold font-sans"
              style={{ textAlign: 'center', width: '100%', padding: '16px 0 10px 0' }}
            >
              1. WHAT WOULD YOU LIKE TO DEVELOP?
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 w-full">
              {goals.map((g) => {
                const isSelected = selectedGoal === g.id;
                return (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setSelectedGoal(g.id)}
                    className={`w-full text-center rounded-2xl border transition-all duration-200 flex items-center justify-center gap-3.5 shadow-sm cursor-pointer ${
                      isSelected
                        ? 'bg-[#21201E] text-white border-[#21201E] shadow-lg ring-2 ring-[#D9AE29]'
                        : 'bg-white hover:bg-[#F5EFE5] text-[#272727] border-[#272727]/12 hover:border-[#944426]/50'
                    }`}
                    style={{ padding: '18px 24px', minHeight: '68px' }}
                  >
                    <span className="text-2xl flex-shrink-0">{g.icon}</span>
                    <span className="font-serif font-bold text-sm sm:text-base leading-snug text-center">
                      {g.label}
                    </span>
                    {isSelected && <CheckCircle2 className="w-5 h-5 text-[#D9AE29] flex-shrink-0 ml-1" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Question 2 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingTop: '32px', borderTop: '1px solid rgba(39,39,39,0.1)', textAlign: 'center', alignItems: 'center' }}>
            <div className="text-center w-full">
              <label
                className="block text-xs sm:text-sm uppercase tracking-wider text-[#944426] font-bold font-sans"
                style={{ textAlign: 'center', width: '100%', padding: '16px 0 10px 0' }}
              >
                2. WHERE ARE YOU IN YOUR PRACTICE?
              </label>
              <p className="text-xs sm:text-sm text-[#272727]/70 mt-1.5 italic font-sans" style={{ textAlign: 'center', width: '100%' }}>
                Everyone starts from a different place. Where are you now?
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 w-full">
              {experiences.map((exp) => {
                const isSelected = selectedExp === exp.id;
                return (
                  <button
                    key={exp.id}
                    type="button"
                    onClick={() => setSelectedExp(exp.id)}
                    className={`w-full text-center rounded-2xl border transition-all duration-200 shadow-sm flex flex-col items-center justify-center space-y-2.5 cursor-pointer ${
                      isSelected
                        ? 'bg-[#944426] text-white border-[#944426] shadow-lg ring-2 ring-[#D9AE29]'
                        : 'bg-white hover:bg-[#F5EFE5] text-[#272727] border-[#272727]/12 hover:border-[#944426]/50'
                    }`}
                    style={{ padding: '24px 28px', minHeight: '110px' }}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <span className="font-serif font-bold text-lg sm:text-xl text-center">{exp.label}</span>
                      {isSelected && <CheckCircle2 className="w-5 h-5 text-[#D9AE29]" />}
                    </div>
                    <p className={`text-xs sm:text-sm leading-relaxed text-center ${isSelected ? 'text-white/90' : 'text-[#272727]/75'}`}>
                      {exp.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Get Recommendation Button Section */}
          <div className="text-center w-full" style={{ paddingTop: '32px', borderTop: '1px solid rgba(39,39,39,0.1)', display: 'flex', justifyContent: 'center' }}>
            <button
              type="button"
              disabled={!canShowRecommendation}
              onClick={handleStartQuiz}
              className={`rounded-full font-serif font-bold text-base sm:text-lg inline-flex items-center justify-center gap-3 transition-all ${
                canShowRecommendation
                  ? 'bg-[#21201E] hover:bg-[#354336] text-white shadow-2xl hover:shadow-2xl hover:scale-105 cursor-pointer ring-4 ring-[#21201E]/15'
                  : 'bg-[#272727]/20 text-[#272727]/40 cursor-not-allowed'
              }`}
              style={{ padding: '18px 44px' }}
            >
              <span>Get Recommendation</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      ) : (
        /* Result & Recommendations View */
        <div className="w-full relative z-10 animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
          {/* Main Recommendation Card */}
          <div
            className="bg-[#21201E] text-white rounded-3xl border-2 border-[#D9AE29]/40 shadow-2xl relative overflow-hidden text-center"
            style={{ padding: 'clamp(32px, 5vw, 64px)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}
          >
            <span
              className="inline-block bg-[#944426] text-white text-xs sm:text-sm font-sans font-bold uppercase tracking-wider rounded-full mx-auto"
              style={{ padding: '8px 24px', textAlign: 'center' }}
            >
              3. WE'VE GOT A RECOMMENDATION FOR YOU
            </span>

            <h3 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight leading-tight text-center" style={{ width: '100%' }}>
              We'd Recommend Unlimited Membership
            </h3>
            <p className="text-[#D9AE29] font-serif text-lg sm:text-xl leading-relaxed text-center" style={{ width: '100%' }}>
              Based on what you've told us, we believe a regular practice of 2–3 classes per week would best support your goals.
            </p>

            {/* Why Unlimited */}
            <div
              className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 text-center w-full"
              style={{ padding: '28px 32px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}
            >
              <h4 className="font-serif font-bold text-xl text-white flex items-center justify-center gap-2.5" style={{ width: '100%' }}>
                <Sparkles className="w-6 h-6 text-[#D9AE29]" />
                <span>Why Unlimited?</span>
              </h4>
              <p className="text-white/95 text-base sm:text-lg leading-relaxed font-sans text-center" style={{ width: '100%' }}>
                It gives you the freedom to practise consistently and explore different classes as your needs evolve—without having to count every class.
              </p>
              <p className="text-white/85 text-sm sm:text-base leading-relaxed italic border-t border-white/15 pt-4 font-sans text-center" style={{ width: '100%' }}>
                "Your practice doesn't have to look the same every week. What matters is building a rhythm that allows you to grow."
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-4 w-full">
              <button
                type="button"
                onClick={onSelectUnlimited}
                className="w-full sm:w-auto rounded-full bg-[#944426] hover:bg-[#7a351c] text-white font-serif font-bold text-base sm:text-lg flex items-center justify-center gap-3 transition-all shadow-xl hover:shadow-2xl hover:scale-105 cursor-pointer"
                style={{ padding: '18px 44px' }}
              >
                <span>START MY PRACTICE →</span>
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="text-sm text-white/80 hover:text-white flex items-center justify-center gap-2 transition-colors rounded-full hover:bg-white/10 cursor-pointer font-sans"
                style={{ padding: '10px 20px' }}
              >
                <RefreshCw className="w-4 h-4" />
                <span>Change my answers</span>
              </button>
            </div>
          </div>

          {/* Flexible Options Section */}
          <div
            className="bg-white rounded-3xl border border-[#272727]/12 shadow-lg text-center"
            style={{ padding: 'clamp(32px, 5vw, 56px)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '32px' }}
          >
            <div className="space-y-2 text-center w-full">
              <span className="text-xs sm:text-sm font-sans font-bold uppercase tracking-wider text-[#944426] block text-center" style={{ width: '100%' }}>
                FLEXIBLE ALTERNATIVES
              </span>
              <h4 className="font-serif text-2xl sm:text-3xl font-bold text-[#272727] text-center" style={{ width: '100%' }}>
                If your lifestyle requires more flexibility
              </h4>
              <p className="text-base text-[#272727]/80 leading-relaxed font-sans text-center" style={{ width: '100%' }}>
                We understand that work and travel can make a regular schedule difficult. If that's your situation, we'll help you find a more flexible option.
              </p>
            </div>

            {/* Flexible Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
              <div
                className="bg-[#FAF6F0] rounded-2xl border border-[#272727]/12 flex flex-col items-center justify-between space-y-4 hover:border-[#944426]/30 transition-all text-center"
                style={{ padding: '28px 24px' }}
              >
                <div className="text-center w-full">
                  <h5 className="font-serif font-bold text-xl text-[#21201E] mb-2 text-center">8-Class / Month</h5>
                  <p className="text-xs sm:text-sm text-[#272727]/80 leading-relaxed font-sans text-center">For a busy schedule with room for regular practice.</p>
                </div>
                <div className="pt-4 border-t border-[#272727]/10 flex items-center justify-center gap-2 text-xs font-bold text-[#944426] font-sans w-full">
                  <Clock className="w-4 h-4" />
                  <span>2 Classes per week</span>
                </div>
              </div>

              <div
                className="bg-[#FAF6F0] rounded-2xl border border-[#272727]/12 flex flex-col items-center justify-between space-y-4 hover:border-[#944426]/30 transition-all text-center"
                style={{ padding: '28px 24px' }}
              >
                <div className="text-center w-full">
                  <h5 className="font-serif font-bold text-xl text-[#21201E] mb-2 text-center">4-Class / Month</h5>
                  <p className="text-xs sm:text-sm text-[#272727]/80 leading-relaxed font-sans text-center">For a lighter monthly commitment.</p>
                </div>
                <div className="pt-4 border-t border-[#272727]/10 flex items-center justify-center gap-2 text-xs font-bold text-[#944426] font-sans w-full">
                  <Clock className="w-4 h-4" />
                  <span>1 Class per week</span>
                </div>
              </div>

              <div
                className="bg-[#FAF6F0] rounded-2xl border border-[#272727]/12 flex flex-col items-center justify-between space-y-4 hover:border-[#944426]/30 transition-all text-center"
                style={{ padding: '28px 24px' }}
              >
                <div className="text-center w-full">
                  <h5 className="font-serif font-bold text-xl text-[#21201E] mb-2 text-center">Class Credits</h5>
                  <p className="text-xs sm:text-sm text-[#272727]/80 leading-relaxed font-sans text-center">For frequent travel or an unpredictable schedule.</p>
                </div>
                <div className="pt-4 border-t border-[#272727]/10 flex items-center justify-center gap-2 text-xs font-bold text-[#944426] font-sans w-full">
                  <Clock className="w-4 h-4" />
                  <span>Pay-as-you-go flexibility</span>
                </div>
              </div>
            </div>

            <div className="text-center pt-2 w-full flex justify-center">
              <button
                type="button"
                onClick={onExploreFlexible}
                className="rounded-full bg-[#21201E] hover:bg-[#354336] text-white font-serif font-bold text-sm sm:text-base inline-flex items-center justify-center gap-3 transition-all shadow-lg hover:shadow-xl hover:scale-105 cursor-pointer"
                style={{ padding: '16px 36px' }}
              >
                <span>EXPLORE FLEXIBLE OPTIONS →</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
