import React, { useState } from 'react';
import {
  Plus, Trash2, Save, Award, Zap, Calendar,
  Compass, UserCheck, Sparkles, ArrowLeft, Eye
} from 'lucide-react';
import { DynamicPackage, PackageType, ItineraryItem, SyllabusModule } from '../../types';
import { PackageDetailPage } from '../PackageDetailPage';

// ─── Brand Tokens ───────────────────────────────────────────────────────────
const C = {
  cream:       '#F5EFE5',
  sand:        '#EAE1D3',
  white:       '#FFFFFF',
  charcoal:    '#1C1C1C',
  muted:       '#5A5550',
  placeholder: '#9CA3AF',
  terracotta:  '#944426',
  terracottaL: 'rgba(148,68,38,0.06)',
  forest:      '#00381F',
  forestL:     'rgba(0,56,31,0.06)',
  gold:        '#D9AE29',
  goldL:       'rgba(217,174,41,0.12)',
  border:      'rgba(28,28,28,0.12)',
  borderMed:   'rgba(28,28,28,0.18)',
  danger:      '#dc2626',
  dangerL:     'rgba(220,38,38,0.07)',
};

const cardStyle: React.CSSProperties = {
  backgroundColor: C.white,
  borderRadius: 18,
  border: `1px solid ${C.border}`,
  boxShadow: '0 2px 16px rgba(28,28,28,0.05)',
  overflow: 'hidden',
};

const inputStyle = (focused?: boolean, error?: boolean): React.CSSProperties => ({
  width: '100%',
  boxSizing: 'border-box',
  padding: '12px 16px',
  borderRadius: 11,
  border: `1.5px solid ${error ? C.danger : focused ? C.terracotta : C.borderMed}`,
  boxShadow: focused ? '0 0 0 3.5px rgba(148,68,38,0.12)' : 'none',
  backgroundColor: C.white,
  fontSize: 14,
  fontWeight: 500,
  color: C.charcoal,
  outline: 'none',
  fontFamily: 'var(--font-sans)',
  transition: 'all 0.18s ease-in-out',
});

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 11,
  fontWeight: 800,
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  color: C.charcoal,
  marginBottom: 7,
};

// ─── Package Types ──────────────────────────────────────────────────────────
const PKG_TYPES = [
  { id: 'teacher_training', label: 'Teacher Training', desc: 'RYT Accreditation + Syllabus',  Icon: Award,     color: '#944426' },
  { id: 'workshop',         label: 'Workshop',         desc: 'Masterclass + Seat Progress',   Icon: Zap,       color: '#00381F' },
  { id: 'event',            label: 'Event',            desc: 'Community Event + Venue',        Icon: Calendar,  color: '#620513' },
  { id: 'retreat',          label: 'Retreat',          desc: 'Luxury Destination + Itinerary', Icon: Compass,   color: '#9D9D48' },
  { id: 'regular',          label: 'Membership',       desc: 'Class Pass + Validity',          Icon: Sparkles,  color: '#B8860B' },
  { id: 'private',          label: 'Private 1-on-1',   desc: 'Therapy Focus + Instructor',     Icon: UserCheck, color: '#1d4ed8' },
] as const;

// ─── Focus Inputs ───────────────────────────────────────────────────────────
const FocusInput = (props: React.InputHTMLAttributes<HTMLInputElement>) => {
  const [f, setF] = useState(false);
  return (
    <input
      {...props}
      style={{ ...inputStyle(f), ...(props.style ?? {}) }}
      onFocus={() => setF(true)}
      onBlur={() => setF(false)}
    />
  );
};

const FocusTextarea = (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => {
  const [f, setF] = useState(false);
  return (
    <textarea
      {...props}
      style={{ ...inputStyle(f), resize: 'vertical', minHeight: 90, ...(props.style ?? {}) }}
      onFocus={() => setF(true)}
      onBlur={() => setF(false)}
    />
  );
};

// ─── Section Wrapper ────────────────────────────────────────────────────────
const Section = ({ step, title, accent, children }: { step: number; title: string; accent: string; children: React.ReactNode }) => (
  <div style={cardStyle}>
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '18px 24px',
      backgroundColor: C.white,
      borderBottom: `1px solid ${C.border}`,
    }}>
      <div style={{
        width: 28, height: 28, borderRadius: 99,
        backgroundColor: accent, color: '#fff',
        fontSize: 13, fontWeight: 800,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
        boxShadow: `0 3px 10px ${accent}33`,
      }}>
        {step}
      </div>
      <h3 style={{ fontSize: 16, fontWeight: 700, color: C.charcoal, fontFamily: 'var(--font-serif)', margin: 0 }}>
        {title}
      </h3>
    </div>
    <div style={{ padding: 24 }}>{children}</div>
  </div>
);

const Grid = ({ cols = 2, children }: { cols?: number; children: React.ReactNode }) => (
  <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 18 }}>
    {children}
  </div>
);

const Field = ({ label: lbl, children }: { label: string; children: React.ReactNode }) => (
  <div>
    <label style={labelStyle}>{lbl}</label>
    {children}
  </div>
);

// ────────────────────────────────────────────────────────────────────────────
interface AdminPackageFormProps {
  initialPackage?: DynamicPackage | null;
  onSave: (pkg: DynamicPackage) => void;
  onCancel: () => void;
}

export const AdminPackageForm: React.FC<AdminPackageFormProps> = ({ initialPackage, onSave, onCancel }) => {
  const [showPreview, setShowPreview] = useState(false);

  // ── Core fields ──────────────────────────────────────────────────────────
  const [type,         setType]         = useState<PackageType>(initialPackage?.type ?? 'teacher_training');
  const [title,        setTitle]        = useState(initialPackage?.title ?? '');
  const [subtitle,     setSubtitle]     = useState(initialPackage?.subtitle ?? '');
  const [price,        setPrice]        = useState<number>(initialPackage?.price ?? 1000);
  const [discountPrice,setDiscountPrice]= useState<number | undefined>(initialPackage?.discountPrice);
  const [currency,     setCurrency]     = useState(initialPackage?.currency ?? 'HK$');
  const [badge,        setBadge]        = useState(initialPackage?.badge ?? '');
  const [coverImage,   setCoverImage]   = useState(initialPackage?.coverImage ?? '');
  const [description,  setDescription]  = useState(initialPackage?.description ?? '');
  const [features,     setFeatures]     = useState<string[]>(initialPackage?.features ?? ['Sanctuary Class Access', 'All Equipment & Props Included']);
  const [isActive,     setIsActive]     = useState(initialPackage?.isActive ?? true);
  const [isFeatured,   setIsFeatured]   = useState(initialPackage?.isFeatured ?? false);
  const [displayOrder, setDisplayOrder] = useState(initialPackage?.displayOrder ?? 1);

  // ── Metadata ─────────────────────────────────────────────────────────────
  const m = initialPackage?.metadata ?? {};
  const [certification,   setCertification]   = useState(m.certification   ?? '200-Hour RYT (Yoga Alliance)');
  const [totalHours,      setTotalHours]      = useState(m.totalHours      ?? 200);
  const [batchDates,      setBatchDates]      = useState(m.batchDates      ?? 'Oct 15 - Nov 12, 2026');
  const [syllabus,        setSyllabus]        = useState<SyllabusModule[]>(m.syllabus ?? [{ moduleTitle: 'Module 1: Alignment & Biomechanics', topics: ['Posture', 'Adjustments'] }]);
  const [eventDate,       setEventDate]       = useState(m.eventDate       ?? 'Saturday, Oct 10, 2026');
  const [eventTime,       setEventTime]       = useState(m.eventTime       ?? '02:00 PM – 05:00 PM');
  const [venue,           setVenue]           = useState(m.venue           ?? 'Pragya Sanctuary Studio A');
  const [totalSeats,      setTotalSeats]      = useState(m.totalSeats      ?? 20);
  const [bookedSeats,     setBookedSeats]     = useState(m.bookedSeats     ?? 0);
  const [instructorName,  setInstructorName]  = useState(m.instructorName  ?? 'Master Faculty');
  const [location,        setLocation]        = useState(m.location        ?? 'Central, Hong Kong');
  const [itinerary,       setItinerary]       = useState<ItineraryItem[]>(m.itinerary ?? [{ day: 'Day 1', title: 'Arrival & Welcome', detail: 'Orientation & Sound Healing' }]);
  const [validityPeriod,  setValidityPeriod]  = useState(m.validityPeriod  ?? '30 Days');
  const [classCount,      setClassCount]      = useState(String(m.classCount ?? 'Unlimited'));
  const [sessionDuration, setSessionDuration] = useState(m.sessionDuration ?? '90 Minutes');
  const [focusAreasText,  setFocusAreasText]  = useState((m.focusAreas ?? ['Postural Rehab', 'Spine Health']).join(', '));
  const [assignedInstructor, setAssignedInstructor] = useState(m.assignedInstructor ?? 'Dr. Yatendra Amoli');

  const buildDraftPackage = (): DynamicPackage => {
    return {
      id: initialPackage?.id ?? 'preview-' + Date.now(),
      type,
      title: title.trim() || 'Untitled Package',
      subtitle: subtitle.trim() || undefined,
      price: Number(price) || 0,
      discountPrice: discountPrice ? Number(discountPrice) : undefined,
      currency,
      badge: badge.trim() || undefined,
      coverImage: coverImage.trim() || undefined,
      description: description.trim() || 'No description provided.',
      features: features.filter(f => f.trim().length > 0),
      isActive,
      isFeatured,
      displayOrder: Number(displayOrder) || 1,
      metadata: {
        certification,
        totalHours,
        batchDates,
        syllabus,
        eventDate,
        eventTime,
        venue,
        totalSeats,
        bookedSeats,
        instructorName,
        location,
        itinerary,
        validityPeriod,
        classCount,
        sessionDuration,
        focusAreas: focusAreasText.split(',').map(s => s.trim()).filter(Boolean),
        assignedInstructor
      }
    };
  };

  if (showPreview) {
    return (
      <PackageDetailPage
        pkg={buildDraftPackage()}
        onBack={() => setShowPreview(false)}
        onOpenBooking={(type, title) => alert(`[Preview Mode] Booking button clicked for "${title}"`)}
        isPreview={true}
      />
    );
  }

  // ── Build Package Object ─────────────────────────────────────────────────
  const buildPkg = (): DynamicPackage => {
    const meta: any = {};
    if (type === 'teacher_training') { meta.certification = certification; meta.totalHours = totalHours; meta.batchDates = batchDates; meta.syllabus = syllabus; }
    else if (type === 'workshop' || type === 'event') { meta.eventDate = eventDate; meta.eventTime = eventTime; meta.venue = venue; meta.totalSeats = totalSeats; meta.bookedSeats = bookedSeats; meta.instructorName = instructorName; }
    else if (type === 'retreat') { meta.location = location; meta.itinerary = itinerary; }
    else if (type === 'regular') { meta.validityPeriod = validityPeriod; meta.classCount = classCount; }
    else if (type === 'private') { meta.sessionDuration = sessionDuration; meta.focusAreas = focusAreasText.split(',').map(s => s.trim()).filter(Boolean); meta.assignedInstructor = assignedInstructor; }
    
    return {
      id: initialPackage?.id ?? '',
      type, title: title || 'Untitled Package', subtitle, price: Number(price),
      discountPrice: discountPrice ? Number(discountPrice) : undefined,
      currency, badge, coverImage: coverImage || 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=1200&q=80',
      description, features: features.filter(Boolean),
      isActive, isFeatured, displayOrder: Number(displayOrder), metadata: meta,
    };
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
        <button
          type="button"
          onClick={onCancel}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            fontSize: 13, color: C.muted, fontWeight: 600,
            backgroundColor: C.white, border: `1px solid ${C.border}`,
            borderRadius: 9, padding: '7px 14px', cursor: 'pointer',
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = C.terracotta}
          onMouseLeave={e => e.currentTarget.style.borderColor = C.border}
        >
          <ArrowLeft size={14} /> Back to Catalog
        </button>
        <span style={{ color: C.placeholder }}>/</span>
        <span style={{ fontSize: 15, fontWeight: 700, fontFamily: 'var(--font-serif)', color: C.charcoal }}>
          {initialPackage ? `Edit: ${initialPackage.title}` : 'Create New Offering'}
        </span>
      </div>

      {/* ── Editor Form ─────────────────────────────────────────────────── */}
      <form onSubmit={e => { e.preventDefault(); onSave(buildPkg()); }} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

          {/* Step 1 — Package Type */}
          <Section step={1} title="Select Offering Kind & Presentation Style" accent={C.terracotta}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14 }}>
              {PKG_TYPES.map(({ id, label: lbl, desc, Icon, color }) => {
                const sel = type === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setType(id)}
                    style={{
                      padding: '16px 18px', borderRadius: 14, cursor: 'pointer',
                      border: sel ? `2.5px solid ${C.terracotta}` : `1.5px solid ${C.border}`,
                      backgroundColor: sel ? C.terracottaL : C.white,
                      textAlign: 'left',
                      boxShadow: sel ? '0 4px 16px rgba(148,68,38,0.14)' : 'none',
                      transition: 'all 0.18s ease-in-out',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <Icon size={18} style={{ color: sel ? C.terracotta : C.muted }} />
                      <span style={{ fontSize: 14, fontWeight: 800, color: sel ? C.terracotta : C.charcoal }}>{lbl}</span>
                    </div>
                    <span style={{ fontSize: 12, color: C.muted, lineHeight: 1.4, display: 'block' }}>{desc}</span>
                  </button>
                );
              })}
            </div>
          </Section>

          {/* Step 2 — General Info */}
          <Section step={2} title="General Information & Pricing" accent={C.forest}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <Field label="Offering Title *">
                <FocusInput
                  value={title}
                  required
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. 200-Hour Master Yoga Teacher Training"
                />
              </Field>
              <Grid>
                <Field label="Subtitle / Tagline">
                  <FocusInput
                    value={subtitle}
                    onChange={e => setSubtitle(e.target.value)}
                    placeholder="e.g. Yoga Alliance USA Certified Immersion Program"
                  />
                </Field>
                <Field label="Cover Image URL">
                  <FocusInput
                    value={coverImage}
                    onChange={e => setCoverImage(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                  />
                </Field>
              </Grid>
              <Grid cols={3}>
                <Field label={`Base Price (${currency}) *`}>
                  <FocusInput
                    type="number"
                    value={price}
                    required
                    onChange={e => setPrice(Number(e.target.value))}
                  />
                </Field>
                <Field label={`Discount Price (${currency})`}>
                  <FocusInput
                    type="number"
                    value={discountPrice ?? ''}
                    onChange={e => setDiscountPrice(e.target.value ? Number(e.target.value) : undefined)}
                    placeholder="Leave blank if no discount"
                  />
                </Field>
                <Field label="Currency Symbol">
                  <FocusInput
                    value={currency}
                    onChange={e => setCurrency(e.target.value)}
                    placeholder="₹ or $"
                  />
                </Field>
              </Grid>
              <Grid>
                <Field label="Highlight Badge Text">
                  <FocusInput
                    value={badge}
                    onChange={e => setBadge(e.target.value)}
                    placeholder="e.g. Early Bird Special / 20% Off"
                  />
                </Field>
                <Field label="Display Priority Order">
                  <FocusInput
                    type="number"
                    value={displayOrder}
                    onChange={e => setDisplayOrder(Number(e.target.value))}
                  />
                </Field>
              </Grid>
              <Field label="Description Overview">
                <FocusTextarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Write a clear, compelling description for your students…"
                />
              </Field>
            </div>
          </Section>

          {/* Step 3 — Dynamic Payload per Type */}
          <Section step={3} title={`Dynamic Fields — ${type.replace('_', ' ')}`} accent={C.gold}>
            {type === 'teacher_training' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                <Grid cols={3}>
                  <Field label="Certification Title">
                    <FocusInput value={certification} onChange={e => setCertification(e.target.value)} />
                  </Field>
                  <Field label="Total Hours">
                    <FocusInput type="number" value={totalHours} onChange={e => setTotalHours(Number(e.target.value))} />
                  </Field>
                  <Field label="Batch Dates">
                    <FocusInput value={batchDates} onChange={e => setBatchDates(e.target.value)} />
                  </Field>
                </Grid>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <label style={{ ...labelStyle, marginBottom: 0 }}>Curriculum Modules</label>
                    <button
                      type="button"
                      onClick={() => setSyllabus([...syllabus, { moduleTitle: `Module ${syllabus.length + 1}: New Module`, topics: ['Topic'] }])}
                      style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 700, color: C.terracotta, background: C.terracottaL, border: `1px solid ${C.terracotta}33`, borderRadius: 8, padding: '6px 14px', cursor: 'pointer' }}
                    >
                      <Plus size={14} /> Add Module
                    </button>
                  </div>
                  {syllabus.map((mod, i) => (
                    <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 10, alignItems: 'center' }}>
                      <FocusInput
                        value={mod.moduleTitle}
                        onChange={e => { const n = [...syllabus]; n[i].moduleTitle = e.target.value; setSyllabus(n); }}
                        style={{ flex: 1 }}
                      />
                      <button
                        type="button"
                        onClick={() => setSyllabus(syllabus.filter((_, j) => j !== i))}
                        style={{ padding: '10px', borderRadius: 9, border: 'none', backgroundColor: C.dangerL, color: C.danger, cursor: 'pointer', display: 'flex', flexShrink: 0 }}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(type === 'workshop' || type === 'event') && (
              <Grid cols={3}>
                <Field label="Event Date"><FocusInput value={eventDate} onChange={e => setEventDate(e.target.value)} /></Field>
                <Field label="Event Time"><FocusInput value={eventTime} onChange={e => setEventTime(e.target.value)} /></Field>
                <Field label="Venue / Location"><FocusInput value={venue} onChange={e => setVenue(e.target.value)} /></Field>
                <Field label="Total Seat Capacity"><FocusInput type="number" value={totalSeats} onChange={e => setTotalSeats(Number(e.target.value))} /></Field>
                <Field label="Seats Reserved/Booked"><FocusInput type="number" value={bookedSeats} onChange={e => setBookedSeats(Number(e.target.value))} /></Field>
                <Field label="Lead Instructor"><FocusInput value={instructorName} onChange={e => setInstructorName(e.target.value)} /></Field>
              </Grid>
            )}

            {type === 'retreat' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                <Field label="Retreat Location / Destination">
                  <FocusInput value={location} onChange={e => setLocation(e.target.value)} />
                </Field>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <label style={{ ...labelStyle, marginBottom: 0 }}>Itinerary Days</label>
                    <button
                      type="button"
                      onClick={() => setItinerary([...itinerary, { day: `Day ${itinerary.length + 1}`, title: 'Activity Title', detail: 'Details…' }])}
                      style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 700, color: C.forest, background: C.forestL, border: `1px solid ${C.forest}33`, borderRadius: 8, padding: '6px 14px', cursor: 'pointer' }}
                    >
                      <Plus size={14} /> Add Itinerary Day
                    </button>
                  </div>
                  {itinerary.map((day, i) => (
                    <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 10, alignItems: 'flex-start' }}>
                      <FocusInput value={day.day} onChange={e => { const n = [...itinerary]; n[i].day = e.target.value; setItinerary(n); }} style={{ width: 90, flexShrink: 0 }} />
                      <FocusInput value={day.title} onChange={e => { const n = [...itinerary]; n[i].title = e.target.value; setItinerary(n); }} placeholder="Title" style={{ flex: 1 }} />
                      <button
                        type="button"
                        onClick={() => setItinerary(itinerary.filter((_, j) => j !== i))}
                        style={{ padding: '10px', borderRadius: 9, border: 'none', backgroundColor: C.dangerL, color: C.danger, cursor: 'pointer', display: 'flex', flexShrink: 0, marginTop: 1 }}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {type === 'regular' && (
              <Grid>
                <Field label="Validity Period"><FocusInput value={validityPeriod} onChange={e => setValidityPeriod(e.target.value)} /></Field>
                <Field label="Class Count / Session Access"><FocusInput value={classCount} onChange={e => setClassCount(e.target.value)} /></Field>
              </Grid>
            )}

            {type === 'private' && (
              <Grid cols={3}>
                <Field label="Session Duration"><FocusInput value={sessionDuration} onChange={e => setSessionDuration(e.target.value)} /></Field>
                <Field label="Focus Areas (comma separated)"><FocusInput value={focusAreasText} onChange={e => setFocusAreasText(e.target.value)} /></Field>
                <Field label="Assigned Instructor"><FocusInput value={assignedInstructor} onChange={e => setAssignedInstructor(e.target.value)} /></Field>
              </Grid>
            )}
          </Section>

          {/* Step 4 — Feature Checklist */}
          <Section step={4} title="Included Features & Key Benefits" accent={C.terracotta}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: C.charcoal }}>Feature Checklist Points</span>
              <button
                type="button"
                onClick={() => setFeatures([...features, ''])}
                style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 700, color: C.terracotta, background: C.terracottaL, border: `1px solid ${C.terracotta}33`, borderRadius: 8, padding: '6px 14px', cursor: 'pointer' }}
              >
                <Plus size={14} /> Add Benefit Point
              </button>
            </div>
            {features.map((feat, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
                <FocusInput
                  value={feat}
                  onChange={e => { const n = [...features]; n[i] = e.target.value; setFeatures(n); }}
                  placeholder={`Feature benefit ${i + 1}…`}
                  style={{ flex: 1 }}
                />
                <button
                  type="button"
                  onClick={() => setFeatures(features.filter((_, j) => j !== i))}
                  style={{ padding: '10px', borderRadius: 9, border: 'none', backgroundColor: C.dangerL, color: C.danger, cursor: 'pointer', display: 'flex', flexShrink: 0 }}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </Section>

          {/* Action Bar Footer */}
          <div style={{
            ...cardStyle,
            padding: '20px 28px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            flexWrap: 'wrap', gap: 16,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 9, cursor: 'pointer', fontSize: 14, fontWeight: 700, color: C.charcoal }}>
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={e => setIsActive(e.target.checked)}
                  style={{ accentColor: C.forest, width: 18, height: 18, cursor: 'pointer' }}
                />
                Publish Immediately
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 9, cursor: 'pointer', fontSize: 14, fontWeight: 700, color: C.charcoal }}>
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={e => setIsFeatured(e.target.checked)}
                  style={{ accentColor: C.gold, width: 18, height: 18, cursor: 'pointer' }}
                />
                Mark as Featured
              </label>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button
                type="button"
                onClick={onCancel}
                style={{
                  padding: '11px 24px', borderRadius: 11,
                  border: `1px solid ${C.borderMed}`,
                  backgroundColor: C.white, color: C.charcoal,
                  fontSize: 14, fontWeight: 700, cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => setShowPreview(true)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '11px 20px', borderRadius: 11,
                  border: `1.5px solid ${C.terracotta}`,
                  backgroundColor: C.white, color: C.terracotta,
                  fontSize: 14, fontWeight: 700, cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                <Eye size={16} /> Live Preview
              </button>
              <button
                type="submit"
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '11px 30px', borderRadius: 11,
                  border: 'none',
                  background: `linear-gradient(135deg, ${C.terracotta} 0%, ${C.gold} 100%)`,
                  color: '#fff', fontSize: 14, fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 4px 16px rgba(148,68,38,0.35)',
                  letterSpacing: '0.01em',
                  transition: 'all 0.18s ease-in-out',
                }}
                onMouseEnter={e => { e.currentTarget.style.opacity = '0.92'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                <Save size={16} /> Save &amp; Sync Package
              </button>
            </div>
          </div>
        </form>
    </div>
  );
};
