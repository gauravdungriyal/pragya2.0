import React, { useState, useEffect } from 'react';
import {
  Plus, Edit2, Trash2, CheckCircle2, XCircle, ArrowLeft,
  RefreshCw, Sparkles, Database, Layers, Search, Award, Zap,
  Calendar, Compass, UserCheck, Gift, Grid3X3, List, Copy,
  Check, AlertTriangle, Tag, Clock, Users, MapPin
} from 'lucide-react';
import { DynamicPackage, PackageType } from '../../types';
import {
  getDynamicPackages, saveDynamicPackage,
  deleteDynamicPackage, toggleDynamicPackageActive
} from '../../services/api';
import { AdminPackageForm } from './AdminPackageForm';

// ─── Brand palette ──────────────────────────────────────────────────────────
const C = {
  cream:      '#F5EFE5',
  sand:       '#EAE1D3',
  white:      '#FFFFFF',
  charcoal:   '#1C1C1C',
  muted:      '#5A5550',
  placeholder:'#A09890',
  terracotta: '#944426',
  terracotaL: 'rgba(148,68,38,0.08)',
  burgundy:   '#620513',
  olive:      '#9D9D48',
  forest:     '#00381F',
  forestL:    'rgba(0,56,31,0.08)',
  gold:       '#D9AE29',
  goldL:      'rgba(217,174,41,0.12)',
  border:     'rgba(28,28,28,0.09)',
  borderMed:  'rgba(28,28,28,0.14)',
  danger:     '#dc2626',
  dangerL:    'rgba(220,38,38,0.07)',
  success:    '#15803d',
  successL:   'rgba(21,128,61,0.09)',
};

// ─── Type-specific config ────────────────────────────────────────────────────
interface CatCfg { label: string; Icon: React.ElementType; accent: string; bg: string }
const CAT_CFG: Record<string, CatCfg> = {
  teacher_training: { label: 'Teacher Training', Icon: Award,     accent: C.terracotta, bg: 'rgba(148,68,38,0.07)' },
  workshop:         { label: 'Workshop',          Icon: Zap,       accent: C.forest,     bg: 'rgba(0,56,31,0.07)'  },
  event:            { label: 'Event',             Icon: Calendar,  accent: C.burgundy,   bg: 'rgba(98,5,19,0.07)'  },
  retreat:          { label: 'Retreat',           Icon: Compass,   accent: C.olive,      bg: 'rgba(157,157,72,0.1)'},
  regular:          { label: 'Membership',        Icon: Sparkles,  accent: '#B8860B',    bg: C.goldL               },
  private:          { label: 'Private',           Icon: UserCheck, accent: '#1d4ed8',    bg: 'rgba(29,78,216,0.07)'},
  free_class:       { label: 'Free Trial',        Icon: Gift,      accent: C.success,    bg: C.successL            },
};

const ALL_CATS = [
  { id: 'teacher_training', label: 'Training',        Icon: Award     },
  { id: 'workshop',         label: 'Workshops',       Icon: Zap       },
  { id: 'event',            label: 'Events',          Icon: Calendar  },
  { id: 'retreat',          label: 'Retreats',        Icon: Compass   },
  { id: 'regular',          label: 'Memberships',     Icon: Sparkles  },
  { id: 'private',          label: 'Private',         Icon: UserCheck },
] as const;

interface AdminPanelProps { onBackToSite: () => void; }

export const AdminPanel: React.FC<AdminPanelProps> = ({ onBackToSite }) => {
  const [packages,      setPackages]      = useState<DynamicPackage[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [filterType,    setFilterType]    = useState<PackageType | 'all'>('all');
  const [searchQuery,   setSearchQuery]   = useState('');
  const [viewMode,      setViewMode]      = useState<'grid' | 'table'>('grid');
  const [isEditing,     setIsEditing]     = useState(false);
  const [editingPkg,    setEditingPkg]    = useState<DynamicPackage | null>(null);
  const [notification,  setNotification]  = useState<{ msg: string; ok: boolean } | null>(null);
  const [confirmDel,    setConfirmDel]    = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const data = await getDynamicPackages('all');
    setPackages(data);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);
  useEffect(() => {
    const prev = document.body.style.backgroundColor;
    document.body.style.backgroundColor = C.cream;
    return () => { document.body.style.backgroundColor = prev; };
  }, []);

  const notify = (msg: string, ok = true) => {
    setNotification({ msg, ok });
    setTimeout(() => setNotification(null), 3500);
  };

  const handleSave = async (pkg: DynamicPackage) => {
    setLoading(true);
    const res = await saveDynamicPackage(pkg);
    if (res.success) { notify(`"${pkg.title}" saved!`); setIsEditing(false); setEditingPkg(null); await load(); }
    else { notify('Failed to save package.', false); }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    const t = packages.find(p => p.id === id);
    await deleteDynamicPackage(id);
    notify(`"${t?.title ?? 'Package'}" deleted.`);
    setConfirmDel(null);
    await load();
  };

  const handleDuplicate = async (pkg: DynamicPackage) => {
    const dup: DynamicPackage = { ...pkg, id: 'pkg-' + Date.now(), title: `${pkg.title} (Copy)`, isActive: false };
    await saveDynamicPackage(dup);
    notify(`Duplicated: "${dup.title}"`);
    await load();
  };

  const handleToggle = async (id: string, cur: boolean) => {
    await toggleDynamicPackageActive(id, !cur);
    notify(`Status → ${!cur ? 'Active' : 'Draft'}`);
    await load();
  };

  const countFor = (t: string) =>
    t === 'all' ? packages.length : packages.filter(p => p.type === t).length;

  const visible = packages.filter(p => {
    const byType  = filterType === 'all' || p.type === filterType;
    const byQuery = !searchQuery ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.badge ?? '').toLowerCase().includes(searchQuery.toLowerCase());
    return byType && byQuery;
  });

  const stats = {
    total:    packages.length,
    active:   packages.filter(p => p.isActive).length,
    ttc:      packages.filter(p => p.type === 'teacher_training').length,
    retreats: packages.filter(p => p.type === 'retreat').length,
  };

  // ── Subcomponents ──────────────────────────────────────────────────────────

  const StatCard = ({
    label, value, sub, accent, icon: Icon,
  }: { label: string; value: number; sub: string; accent: string; icon: React.ElementType }) => (
    <div style={{
      backgroundColor: C.white, borderRadius: 18,
      border: `1px solid ${C.border}`,
      boxShadow: '0 2px 16px rgba(28,28,28,0.05)',
      padding: '24px 28px',
      display: 'flex', flexDirection: 'column', gap: 2,
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Faint background icon */}
      <Icon size={80} style={{ position: 'absolute', right: -8, bottom: -12, color: accent, opacity: 0.06, pointerEvents: 'none' }} />
      <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: C.muted }}>
        {label}
      </span>
      <span style={{ fontSize: 48, fontWeight: 800, lineHeight: 1, color: accent, fontFamily: 'var(--font-serif)', marginTop: 6 }}>
        {value}
      </span>
      <span style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>{sub}</span>
      {/* Accent left bar */}
      <div style={{ position: 'absolute', left: 0, top: '20%', bottom: '20%', width: 4, borderRadius: '0 4px 4px 0', backgroundColor: accent }} />
    </div>
  );

  const TypeBadge = ({ type }: { type: string }) => {
    const cfg = CAT_CFG[type] ?? { label: type, Icon: Layers, accent: C.charcoal, bg: C.sand };
    const { label, accent, bg } = cfg;
    return (
      <span style={{
        display: 'inline-flex', alignItems: 'center',
        fontSize: 10, fontWeight: 800, letterSpacing: '0.12em',
        textTransform: 'uppercase',
        padding: '4px 11px', borderRadius: 99,
        backgroundColor: bg, color: accent,
        border: `1px solid ${accent}28`,
      }}>
        {label}
      </span>
    );
  };

  const StatusToggle = ({ pkg }: { pkg: DynamicPackage }) => (
    <button
      onClick={() => handleToggle(pkg.id, pkg.isActive)}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 5,
        fontSize: 12, fontWeight: 600,
        padding: '5px 12px', borderRadius: 99,
        border: 'none', cursor: 'pointer',
        backgroundColor: pkg.isActive ? C.successL : C.sand,
        color: pkg.isActive ? C.success : C.muted,
        transition: 'all 0.2s',
      }}
    >
      {pkg.isActive
        ? <CheckCircle2 size={13} />
        : <XCircle size={13} />}
      {pkg.isActive ? 'Active' : 'Draft'}
    </button>
  );

  const IconBtn = ({ icon: Icon, onClick, danger, title }: { icon: React.ElementType; onClick: () => void; danger?: boolean; title?: string }) => (
    <button
      onClick={onClick}
      title={title}
      style={{
        padding: 8, borderRadius: 9,
        border: danger ? 'none' : `1px solid ${C.border}`,
        backgroundColor: danger ? C.dangerL : 'transparent',
        color: danger ? C.danger : C.muted,
        cursor: 'pointer', display: 'flex', alignItems: 'center',
        transition: 'all 0.15s',
      }}
      onMouseEnter={e => { e.currentTarget.style.backgroundColor = danger ? 'rgba(220,38,38,0.14)' : C.sand; }}
      onMouseLeave={e => { e.currentTarget.style.backgroundColor = danger ? C.dangerL : 'transparent'; }}
    >
      <Icon size={14} />
    </button>
  );

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', backgroundColor: C.cream, fontFamily: 'var(--font-sans)' }}>

      {/* ── Top Navigation Bar ────────────────────────────────────────────── */}
      <header style={{
        backgroundColor: C.forest,
        height: 68, padding: '0 36px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 50,
        boxShadow: '0 4px 20px rgba(0,0,0,0.22)',
      }}>
        {/* Left */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <button
            onClick={onBackToSite}
            title="Back to website"
            style={{
              width: 38, height: 38, borderRadius: 10,
              backgroundColor: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.15)',
              color: C.gold, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.18)'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'}
          >
            <ArrowLeft size={17} />
          </button>

          <div style={{ borderLeft: '1px solid rgba(255,255,255,0.12)', paddingLeft: 14 }}>
            <span style={{
              fontSize: 16, fontWeight: 700,
              fontFamily: 'var(--font-serif)',
              letterSpacing: '0.04em',
              color: C.gold,
            }}>
              Pragya Yog — Admin Console
            </span>
          </div>
        </div>

        {/* Right */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 7,
            fontSize: 12, color: '#86efac',
            padding: '7px 14px', borderRadius: 99,
            backgroundColor: 'rgba(255,255,255,0.07)',
            border: '1px solid rgba(255,255,255,0.10)',
          }}>
            <Database size={13} style={{ color: '#4ade80' }} />
            <span>Live Sync</span>
          </div>

          <button
            onClick={load}
            title="Refresh data"
            style={{
              width: 38, height: 38, borderRadius: 10,
              backgroundColor: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.12)',
              color: '#fff', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.16)'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)'}
          >
            <RefreshCw size={15} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
          </button>

          {!isEditing && (
            <button
              onClick={() => { setEditingPkg(null); setIsEditing(true); }}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '9px 22px', borderRadius: 11,
                background: `linear-gradient(135deg, ${C.terracotta} 0%, ${C.gold} 100%)`,
                border: 'none', color: '#fff',
                fontSize: 14, fontWeight: 700, cursor: 'pointer',
                boxShadow: '0 4px 16px rgba(148,68,38,0.40)',
                letterSpacing: '0.01em',
                transition: 'opacity 0.2s, transform 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.opacity = '0.9'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              <Plus size={16} /> Create Offering
            </button>
          )}
        </div>
      </header>

      {/* ── Page Content ──────────────────────────────────────────────────── */}
      <div style={{ maxWidth: 1320, margin: '0 auto', padding: '36px 28px 100px' }}>

        {/* Notification toast */}
        {notification && (
          <div style={{
            marginBottom: 24, padding: '14px 22px',
            borderRadius: 12,
            backgroundColor: notification.ok ? C.successL : C.dangerL,
            border: `1px solid ${notification.ok ? 'rgba(21,128,61,0.2)' : 'rgba(220,38,38,0.2)'}`,
            display: 'flex', alignItems: 'center', gap: 10,
            color: notification.ok ? C.success : C.danger,
            fontSize: 14, fontWeight: 600,
          }}>
            <Check size={16} /> {notification.msg}
          </div>
        )}

        {/* Delete modal */}
        {confirmDel && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.38)', backdropFilter: 'blur(5px)' }}>
            <div style={{
              backgroundColor: C.white, borderRadius: 20,
              border: `1px solid ${C.border}`,
              padding: '36px 40px', maxWidth: 440, width: '90%',
              boxShadow: '0 32px 80px rgba(0,0,0,0.22)',
              textAlign: 'center',
            }}>
              <div style={{ width: 52, height: 52, borderRadius: 14, backgroundColor: C.dangerL, border: '1px solid rgba(220,38,38,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <AlertTriangle size={26} style={{ color: C.danger }} />
              </div>
              <h3 style={{ fontSize: 22, fontWeight: 800, fontFamily: 'var(--font-serif)', color: C.charcoal, margin: '0 0 10px' }}>
                Delete this offering?
              </h3>
              <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.65, margin: '0 0 28px' }}>
                This action is permanent and cannot be undone. The package will be removed from your live catalog.
              </p>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                <button
                  onClick={() => setConfirmDel(null)}
                  style={{ padding: '11px 28px', borderRadius: 11, border: `1px solid ${C.borderMed}`, backgroundColor: 'transparent', color: C.charcoal, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(confirmDel)}
                  style={{ padding: '11px 28px', borderRadius: 11, border: 'none', backgroundColor: C.danger, color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 14px rgba(220,38,38,0.32)' }}
                >
                  Yes, Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {isEditing ? (
          <AdminPackageForm
            initialPackage={editingPkg}
            onSave={handleSave}
            onCancel={() => { setIsEditing(false); setEditingPkg(null); }}
          />
        ) : (
          <>
            {/* ── Analytics Stats Row ─────────────────────────────────────── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 32 }}>
              <StatCard label="Total Offerings"    value={stats.total}    sub="Configured packages"        accent={C.charcoal}   icon={Layers}    />
              <StatCard label="Active & Published" value={stats.active}   sub="Live on website now"        accent={C.forest}     icon={CheckCircle2} />
              <StatCard label="Teacher Trainings"  value={stats.ttc}      sub="RYT Certification courses"  accent={C.terracotta} icon={Award}     />
              <StatCard label="Retreat Programs"   value={stats.retreats} sub="Destination experiences"    accent={C.olive}      icon={Compass}   />
            </div>

            {/* ── Filter / Search Bar ─────────────────────────────────────── */}
            <div style={{
              backgroundColor: C.white,
              borderRadius: 16,
              border: `1px solid ${C.border}`,
              boxShadow: '0 2px 12px rgba(28,28,28,0.05)',
              padding: '16px 20px',
              marginBottom: 28,
            }}>
              {/* Category pill row */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {ALL_CATS.map(({ id, label, Icon }) => {
                    const cnt   = countFor(id);
                    const isAct = filterType === id;
                    return (
                      <button
                        key={id}
                        onClick={() => setFilterType(isAct ? 'all' : (id as any))}
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: 6,
                          padding: '8px 16px', borderRadius: 10,
                          fontSize: 13, fontWeight: isAct ? 700 : 500,
                          cursor: 'pointer',
                          border: isAct ? 'none' : `1px solid ${C.border}`,
                          backgroundColor: isAct ? C.forest : 'transparent',
                          color: isAct ? '#fff' : C.muted,
                          transition: 'all 0.18s',
                        }}
                        onMouseEnter={e => { if (!isAct) { e.currentTarget.style.backgroundColor = C.sand; e.currentTarget.style.color = C.charcoal; } }}
                        onMouseLeave={e => { if (!isAct) { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = C.muted; } }}
                      >
                        <Icon size={14} />
                        {label}
                        <span style={{
                          minWidth: 20, height: 20,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          borderRadius: 99, fontSize: 11, fontWeight: 700,
                          backgroundColor: isAct ? 'rgba(255,255,255,0.20)' : C.sand,
                          color: isAct ? '#fff' : C.muted,
                          padding: '0 5px',
                        }}>
                          {cnt}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Right: search + view toggle */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                  <div style={{ position: 'relative' }}>
                    <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: C.placeholder, pointerEvents: 'none' }} />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      placeholder="Search offerings…"
                      style={{
                        padding: '9px 14px 9px 36px',
                        borderRadius: 10,
                        border: `1px solid ${C.border}`,
                        backgroundColor: C.cream,
                        fontSize: 13, color: C.charcoal,
                        outline: 'none', width: 220,
                        fontFamily: 'var(--font-sans)',
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', backgroundColor: C.cream, borderRadius: 10, border: `1px solid ${C.border}`, overflow: 'hidden' }}>
                    {(['grid', 'table'] as const).map(m => (
                      <button
                        key={m}
                        onClick={() => setViewMode(m)}
                        title={m === 'grid' ? 'Card grid' : 'Table list'}
                        style={{
                          padding: '9px 13px', border: 'none', cursor: 'pointer',
                          backgroundColor: viewMode === m ? C.forest : 'transparent',
                          color: viewMode === m ? '#fff' : C.muted,
                          display: 'flex', alignItems: 'center',
                          transition: 'all 0.18s',
                        }}
                      >
                        {m === 'grid' ? <Grid3X3 size={16} /> : <List size={16} />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Result count hint */}
              {!loading && (
                <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${C.border}`, fontSize: 12, color: C.muted }}>
                  Showing <strong style={{ color: C.charcoal }}>{visible.length}</strong> of {packages.length} offerings
                  {filterType !== 'all' && <span> · filtered by <strong style={{ color: C.terracotta }}>{CAT_CFG[filterType]?.label ?? filterType}</strong></span>}
                  {searchQuery && <span> · search: "<strong>{searchQuery}</strong>"</span>}
                </div>
              )}
            </div>

            {/* ── Package Listing ─────────────────────────────────────────── */}
            {loading ? (
              <div style={{ padding: 80, textAlign: 'center', color: C.muted }}>
                <RefreshCw size={32} style={{ margin: '0 auto 14px', display: 'block', color: C.terracotta, animation: 'spin 1s linear infinite' }} />
                <span style={{ fontSize: 14 }}>Loading packages…</span>
              </div>
            ) : visible.length === 0 ? (
              <div style={{ backgroundColor: C.white, borderRadius: 18, border: `1px solid ${C.border}`, padding: 72, textAlign: 'center' }}>
                <Layers size={40} style={{ color: C.sand, margin: '0 auto 14px', display: 'block' }} />
                <p style={{ fontSize: 18, fontWeight: 700, color: C.charcoal, marginBottom: 8, fontFamily: 'var(--font-serif)' }}>No Offerings Found</p>
                <p style={{ fontSize: 14, color: C.muted }}>Adjust filters or create a new offering to get started.</p>
              </div>
            ) : viewMode === 'grid' ? (
              /* ─────────── GRID VIEW ─────────────────────────────────────── */
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 24 }}>
                {visible.map(pkg => {
                  const cfg    = CAT_CFG[pkg.type] ?? { accent: C.charcoal, bg: C.sand, label: pkg.type, Icon: Layers };
                  const accent = cfg.accent;
                  const meta   = pkg.metadata ?? {};

                  return (
                    <div
                      key={pkg.id}
                      style={{
                        backgroundColor: C.white,
                        borderRadius: 18,
                        border: `1px solid ${C.border}`,
                        boxShadow: '0 2px 16px rgba(28,28,28,0.05)',
                        display: 'flex', flexDirection: 'column',
                        overflow: 'hidden',
                        opacity: pkg.isActive ? 1 : 0.65,
                        transition: 'box-shadow 0.2s, transform 0.2s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 10px 32px rgba(28,28,28,0.12)'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
                      onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 2px 16px rgba(28,28,28,0.05)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                    >
                      {/* Top accent stripe */}
                      <div style={{ height: 5, backgroundColor: accent }} />

                      {/* Card body */}
                      <div style={{ padding: '22px 24px 20px', flex: 1, display: 'flex', flexDirection: 'column', gap: 14 }}>

                        {/* Row 1: type badge + status */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <TypeBadge type={pkg.type} />
                          <StatusToggle pkg={pkg} />
                        </div>

                        {/* Row 2: Title + subtitle */}
                        <div>
                          <h3 style={{
                            fontSize: 20, fontWeight: 800,
                            fontFamily: 'var(--font-serif)',
                            color: C.charcoal, lineHeight: 1.25,
                            margin: '0 0 5px',
                          }}>
                            {pkg.title}
                          </h3>
                          {pkg.subtitle && (
                            <p style={{ fontSize: 13, color: C.muted, margin: 0, lineHeight: 1.4 }}>
                              {pkg.subtitle}
                            </p>
                          )}
                        </div>

                        {/* Row 3: Price block */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{ fontSize: 28, fontWeight: 900, fontFamily: 'var(--font-serif)', color: accent, lineHeight: 1 }}>
                            {pkg.currency}{pkg.discountPrice ?? pkg.price}
                          </span>
                          {pkg.discountPrice && (
                            <span style={{ fontSize: 15, textDecoration: 'line-through', color: C.placeholder }}>
                              {pkg.currency}{pkg.price}
                            </span>
                          )}
                          {pkg.discountPrice && (
                            <span style={{ fontSize: 11, fontWeight: 800, padding: '3px 8px', borderRadius: 99, backgroundColor: C.successL, color: C.success }}>
                              {Math.round((1 - pkg.discountPrice / pkg.price) * 100)}% OFF
                            </span>
                          )}
                        </div>

                        {/* Row 4: Highlight badge */}
                        {pkg.badge && (
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 99, backgroundColor: C.goldL, border: `1px solid rgba(217,174,41,0.22)`, width: 'fit-content' }}>
                            <Tag size={11} style={{ color: C.gold }} />
                            <span style={{ fontSize: 12, fontWeight: 600, color: '#8B6914' }}>{pkg.badge}</span>
                          </div>
                        )}

                        {/* Row 5: Meta pills (dynamic per type) */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                          {meta.eventDate && (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, color: C.muted, backgroundColor: C.cream, border: `1px solid ${C.border}`, borderRadius: 99, padding: '4px 10px' }}>
                              <Calendar size={12} /> {meta.eventDate}
                            </span>
                          )}
                          {meta.totalSeats && (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, color: C.muted, backgroundColor: C.cream, border: `1px solid ${C.border}`, borderRadius: 99, padding: '4px 10px' }}>
                              <Users size={12} /> {meta.bookedSeats}/{meta.totalSeats} seats
                            </span>
                          )}
                          {meta.location && (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, color: C.muted, backgroundColor: C.cream, border: `1px solid ${C.border}`, borderRadius: 99, padding: '4px 10px' }}>
                              <MapPin size={12} /> {meta.location}
                            </span>
                          )}
                          {meta.validityPeriod && (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, color: C.muted, backgroundColor: C.cream, border: `1px solid ${C.border}`, borderRadius: 99, padding: '4px 10px' }}>
                              <Clock size={12} /> {meta.validityPeriod}
                            </span>
                          )}
                          {meta.certification && (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, color: C.muted, backgroundColor: C.cream, border: `1px solid ${C.border}`, borderRadius: 99, padding: '4px 10px' }}>
                              <Award size={12} /> {meta.certification}
                            </span>
                          )}
                        </div>

                        {/* Row 6: Description */}
                        <p style={{
                          fontSize: 13, color: C.muted, lineHeight: 1.65, margin: 0,
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}>
                          {pkg.description}
                        </p>

                        {/* Row 7: Feature chips (first 3) */}
                        {pkg.features && pkg.features.length > 0 && (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                            {pkg.features.slice(0, 3).map((f, i) => (
                              <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, color: C.forest, backgroundColor: C.forestL, border: `1px solid rgba(0,56,31,0.1)`, borderRadius: 99, padding: '3px 9px' }}>
                                <Check size={10} /> {f}
                              </span>
                            ))}
                            {pkg.features.length > 3 && (
                              <span style={{ fontSize: 11, color: C.muted, padding: '3px 9px' }}>+{pkg.features.length - 3} more</span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* ── Card footer actions ────────────────────────────── */}
                      <div style={{
                        padding: '14px 24px',
                        borderTop: `1px solid ${C.border}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        backgroundColor: C.cream,
                      }}>
                        <IconBtn icon={Copy}   onClick={() => handleDuplicate(pkg)}  title="Duplicate" />
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button
                            onClick={() => { setEditingPkg(pkg); setIsEditing(true); }}
                            style={{
                              display: 'flex', alignItems: 'center', gap: 6,
                              padding: '8px 18px', borderRadius: 9,
                              border: `1px solid ${C.borderMed}`,
                              backgroundColor: C.white,
                              color: C.charcoal, fontSize: 13, fontWeight: 700,
                              cursor: 'pointer',
                              transition: 'all 0.15s',
                            }}
                            onMouseEnter={e => e.currentTarget.style.borderColor = C.terracotta}
                            onMouseLeave={e => e.currentTarget.style.borderColor = C.borderMed}
                          >
                            <Edit2 size={13} style={{ color: C.terracotta }} /> Edit
                          </button>
                          <IconBtn icon={Trash2} onClick={() => setConfirmDel(pkg.id)} danger title="Delete" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* ─────────── TABLE VIEW ────────────────────────────────────── */
              <div style={{ backgroundColor: C.white, borderRadius: 18, border: `1px solid ${C.border}`, boxShadow: '0 2px 16px rgba(28,28,28,0.05)', overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ backgroundColor: C.cream, borderBottom: `1px solid ${C.borderMed}` }}>
                        {['Offering', 'Category', 'Price', 'Label', 'Status', 'Actions'].map(h => (
                          <th key={h} style={{ padding: '14px 20px', textAlign: 'left', fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: C.muted, whiteSpace: 'nowrap' }}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {visible.map((pkg, idx) => {
                        const accent = CAT_CFG[pkg.type]?.accent ?? C.charcoal;
                        return (
                          <tr
                            key={pkg.id}
                            style={{ borderBottom: idx < visible.length - 1 ? `1px solid ${C.border}` : 'none', transition: 'background 0.15s', opacity: pkg.isActive ? 1 : 0.6 }}
                            onMouseEnter={e => e.currentTarget.style.backgroundColor = C.cream}
                            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                          >
                            <td style={{ padding: '18px 20px', maxWidth: 280 }}>
                              <div style={{ fontFamily: 'var(--font-serif)', fontSize: 16, fontWeight: 700, color: C.charcoal, marginBottom: 2 }}>{pkg.title}</div>
                              {pkg.subtitle && <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.4 }}>{pkg.subtitle}</div>}
                            </td>
                            <td style={{ padding: '18px 20px', whiteSpace: 'nowrap' }}>
                              <TypeBadge type={pkg.type} />
                            </td>
                            <td style={{ padding: '18px 20px', whiteSpace: 'nowrap' }}>
                              <span style={{ fontFamily: 'var(--font-serif)', fontWeight: 900, fontSize: 20, color: accent }}>{pkg.currency}{pkg.discountPrice ?? pkg.price}</span>
                              {pkg.discountPrice && <span style={{ fontSize: 12, textDecoration: 'line-through', color: C.placeholder, marginLeft: 6 }}>{pkg.currency}{pkg.price}</span>}
                            </td>
                            <td style={{ padding: '18px 20px' }}>
                              {pkg.badge
                                ? <span style={{ fontSize: 12, fontWeight: 600, color: '#8B6914', backgroundColor: C.goldL, padding: '4px 11px', borderRadius: 99 }}>{pkg.badge}</span>
                                : <span style={{ color: C.sand }}>—</span>}
                            </td>
                            <td style={{ padding: '18px 20px' }}>
                              <StatusToggle pkg={pkg} />
                            </td>
                            <td style={{ padding: '18px 20px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <IconBtn icon={Copy}  onClick={() => handleDuplicate(pkg)} title="Duplicate" />
                                <button
                                  onClick={() => { setEditingPkg(pkg); setIsEditing(true); }}
                                  style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 14px', borderRadius: 9, border: `1px solid ${C.borderMed}`, backgroundColor: 'transparent', color: C.charcoal, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
                                >
                                  <Edit2 size={13} style={{ color: C.terracotta }} /> Edit
                                </button>
                                <IconBtn icon={Trash2} onClick={() => setConfirmDel(pkg.id)} danger title="Delete" />
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
      <footer style={{ backgroundColor: C.forest, padding: '18px 36px', textAlign: 'center', fontSize: 12, color: 'rgba(255,255,255,0.38)' }}>
        Pragya Yog School Sanctuary &copy; {new Date().getFullYear()} — Admin Portal
      </footer>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};
