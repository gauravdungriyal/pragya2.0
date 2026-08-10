import React, { useState, useEffect } from 'react';
import { Save, Sparkles, Image as ImageIcon, MapPin, BookOpen, Share2, Check, Plus, Trash2, Loader2 } from 'lucide-react';
import {
  getSiteConfig,
  saveSiteConfig,
  resetSiteConfig,
  fetchSiteConfigFromFirebase,
  SiteConfig,
  StudioLocation,
} from '../../services/siteConfig';

export const ContentManager: React.FC = () => {
  const [subTab, setSubTab] = useState<'hero' | 'whyus' | 'journey' | 'perks' | 'locations' | 'about' | 'courses' | 'footer'>('hero');
  const [config, setConfig] = useState<SiteConfig>(getSiteConfig());
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchSiteConfigFromFirebase().then((liveConfig) => {
      if (liveConfig) {
        setConfig(liveConfig);
      }
    });
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    await saveSiteConfig(config);
    setIsSaving(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all site text and settings to default factory values?')) {
      const def = resetSiteConfig();
      setConfig(def);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  // Locations Handlers
  const handleUpdateLocation = (index: number, updated: Partial<StudioLocation>) => {
    const nextLocations = [...config.locations];
    nextLocations[index] = { ...nextLocations[index], ...updated };
    setConfig({ ...config, locations: nextLocations });
  };

  const handleAddLocation = () => {
    const newLoc: StudioLocation = {
      id: Date.now(),
      name: 'New Pragya Sanctuary Branch',
      address: '123 Peace Boulevard',
      city: 'Kowloon Studio, HK',
      hours: 'Mon - Sun: 07:00 AM - 09:00 PM',
      phone: '+852 9000 0000',
      image: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?q=80&w=1000&auto=format&fit=crop',
      amenities: ['Practice Studio', 'Changing Rooms'],
    };
    setConfig({ ...config, locations: [...config.locations, newLoc] });
  };

  const handleDeleteLocation = (index: number) => {
    const locName = config.locations[index]?.name || 'this studio location';
    if (window.confirm(`⚠️ WARNING: Are you sure you want to remove "${locName}"? This action cannot be undone.`)) {
      const nextLocations = config.locations.filter((_, i) => i !== index);
      setConfig({ ...config, locations: nextLocations });
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      
      {/* CMS Action Bar & Sub-Tabs */}
      <div style={{ backgroundColor: '#FFFFFF', padding: '20px 28px', borderRadius: '16px', border: '1px solid #E7E5E4', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
        
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={() => setSubTab('hero')}
            style={{
              padding: '10px 18px',
              borderRadius: '12px',
              fontWeight: 500,
              fontSize: '13px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              border: subTab === 'hero' ? 'none' : '1px solid #E7E5E4',
              backgroundColor: subTab === 'hero' ? '#B45309' : '#F5F5F4',
              color: subTab === 'hero' ? '#FFFFFF' : '#44403C',
            }}
          >
            <ImageIcon className="w-4 h-4" /> Hero Banner & Badge
          </button>

          <button
            onClick={() => setSubTab('whyus')}
            style={{
              padding: '10px 18px',
              borderRadius: '12px',
              fontWeight: 500,
              fontSize: '13px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              border: subTab === 'whyus' ? 'none' : '1px solid #E7E5E4',
              backgroundColor: subTab === 'whyus' ? '#B45309' : '#F5F5F4',
              color: subTab === 'whyus' ? '#FFFFFF' : '#44403C',
            }}
          >
            <Sparkles className="w-4 h-4" /> Why Choose Us
          </button>

          <button
            onClick={() => setSubTab('journey')}
            style={{
              padding: '10px 18px',
              borderRadius: '12px',
              fontWeight: 500,
              fontSize: '13px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              border: subTab === 'journey' ? 'none' : '1px solid #E7E5E4',
              backgroundColor: subTab === 'journey' ? '#B45309' : '#F5F5F4',
              color: subTab === 'journey' ? '#FFFFFF' : '#44403C',
            }}
          >
            <BookOpen className="w-4 h-4" /> Wellness 4-Steps
          </button>

          <button
            onClick={() => setSubTab('perks')}
            style={{
              padding: '10px 18px',
              borderRadius: '12px',
              fontWeight: 500,
              fontSize: '13px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              border: subTab === 'perks' ? 'none' : '1px solid #E7E5E4',
              backgroundColor: subTab === 'perks' ? '#B45309' : '#F5F5F4',
              color: subTab === 'perks' ? '#FFFFFF' : '#44403C',
            }}
          >
            <Plus className="w-4 h-4" /> Membership Perks
          </button>

          <button
            onClick={() => setSubTab('locations')}
            style={{
              padding: '10px 18px',
              borderRadius: '12px',
              fontWeight: 500,
              fontSize: '13px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              border: subTab === 'locations' ? 'none' : '1px solid #E7E5E4',
              backgroundColor: subTab === 'locations' ? '#B45309' : '#F5F5F4',
              color: subTab === 'locations' ? '#FFFFFF' : '#44403C',
            }}
          >
            <MapPin className="w-4 h-4" /> Studio Locations ({config.locations.length})
          </button>

          <button
            onClick={() => setSubTab('about')}
            style={{
              padding: '10px 18px',
              borderRadius: '12px',
              fontWeight: 500,
              fontSize: '13px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              border: subTab === 'about' ? 'none' : '1px solid #E7E5E4',
              backgroundColor: subTab === 'about' ? '#B45309' : '#F5F5F4',
              color: subTab === 'about' ? '#FFFFFF' : '#44403C',
            }}
          >
            <Sparkles className="w-4 h-4" /> Brand Story
          </button>

          <button
            onClick={() => setSubTab('courses')}
            style={{
              padding: '10px 18px',
              borderRadius: '12px',
              fontWeight: 500,
              fontSize: '13px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              border: subTab === 'courses' ? 'none' : '1px solid #E7E5E4',
              backgroundColor: subTab === 'courses' ? '#B45309' : '#F5F5F4',
              color: subTab === 'courses' ? '#FFFFFF' : '#44403C',
            }}
          >
            <BookOpen className="w-4 h-4" /> Course Templates
          </button>

          <button
            onClick={() => setSubTab('footer')}
            style={{
              padding: '10px 18px',
              borderRadius: '12px',
              fontWeight: 500,
              fontSize: '13px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              border: subTab === 'footer' ? 'none' : '1px solid #E7E5E4',
              backgroundColor: subTab === 'footer' ? '#B45309' : '#F5F5F4',
              color: subTab === 'footer' ? '#FFFFFF' : '#44403C',
            }}
          >
            <Share2 className="w-4 h-4" /> Footer Links
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={handleSave}
            disabled={isSaving}
            style={{
              padding: '10px 24px',
              backgroundColor: isSaving ? '#059669' : '#047857',
              color: '#FFFFFF',
              borderRadius: '12px',
              fontSize: '13px',
              fontWeight: 500,
              border: 'none',
              cursor: isSaving ? 'wait' : 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 3px 10px rgba(4,120,87,0.3)',
              opacity: isSaving ? 0.8 : 1,
            }}
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : saveSuccess ? (
              <Check className="w-4 h-4" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {isSaving ? 'Syncing to Cloud...' : saveSuccess ? 'Live Changes Saved!' : 'Save All Changes'}
          </button>
        </div>

      </div>

      {/* SUB-TAB 1: HERO */}
      {subTab === 'hero' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

          {/* Hero Banner Card */}
          <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E7E5E4', padding: '24px 28px', borderRadius: '18px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 400, fontFamily: 'var(--font-sans)', color: '#1C1917', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ImageIcon className="w-5 h-5 text-amber-700" /> Hero Section Content & Carousel Images
            </h3>

            <div>
              <label style={{ display: 'block', color: '#44403C', fontWeight: 500, marginBottom: '6px', fontSize: '13px' }}>Main Hero Headline</label>
              <input
                type="text"
                value={config.hero.mainTitle}
                onChange={(e) => setConfig({ ...config, hero: { ...config.hero, mainTitle: e.target.value } })}
                placeholder="e.g. Transform Body & Mind With Authentic Yoga"
                style={{ width: '100%', backgroundColor: '#FAF7F2', border: '1px solid #D6D3D1', borderRadius: '12px', padding: '12px 14px', fontSize: '14px', fontWeight: 500 }}
              />
            </div>

            <div>
              <label style={{ display: 'block', color: '#44403C', fontWeight: 500, marginBottom: '6px', fontSize: '13px' }}>Hero Subtitle Paragraph</label>
              <textarea
                rows={3}
                value={config.hero.subtitle}
                onChange={(e) => setConfig({ ...config, hero: { ...config.hero, subtitle: e.target.value } })}
                placeholder="Subtitle text..."
                style={{ width: '100%', backgroundColor: '#FAF7F2', border: '1px solid #D6D3D1', borderRadius: '12px', padding: '12px 14px', fontSize: '13px', lineHeight: '1.6' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', color: '#44403C', fontWeight: 500, marginBottom: '6px', fontSize: '13px' }}>Primary Button Text</label>
                <input
                  type="text"
                  value={config.hero.ctaPrimaryText}
                  onChange={(e) => setConfig({ ...config, hero: { ...config.hero, ctaPrimaryText: e.target.value } })}
                  placeholder="e.g. Book Complimentary Trial"
                  style={{ width: '100%', backgroundColor: '#FAF7F2', border: '1px solid #D6D3D1', borderRadius: '12px', padding: '10px 14px', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', color: '#44403C', fontWeight: 500, marginBottom: '6px', fontSize: '13px' }}>Secondary Button Text</label>
                <input
                  type="text"
                  value={config.hero.ctaSecondaryText}
                  onChange={(e) => setConfig({ ...config, hero: { ...config.hero, ctaSecondaryText: e.target.value } })}
                  placeholder="e.g. Explore Memberships"
                  style={{ width: '100%', backgroundColor: '#FAF7F2', border: '1px solid #D6D3D1', borderRadius: '12px', padding: '10px 14px', fontSize: '13px' }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', color: '#44403C', fontWeight: 500, marginBottom: '6px', fontSize: '13px' }}>Hero Background Image URLs (One URL per line)</label>
              <textarea
                rows={3}
                value={config.hero.images.join('\n')}
                onChange={(e) => setConfig({ ...config, hero: { ...config.hero, images: e.target.value.split('\n').filter(Boolean) } })}
                placeholder="https://images.unsplash.com/..."
                style={{ width: '100%', backgroundColor: '#FAF7F2', border: '1px solid #D6D3D1', borderRadius: '12px', padding: '12px 14px', fontSize: '12px', fontFamily: 'monospace', lineHeight: '1.6' }}
              />
            </div>
          </div>

        </div>
      )}

      {/* SUB-TAB: WHY CHOOSE US */}
      {subTab === 'whyus' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E7E5E4', padding: '24px 28px', borderRadius: '18px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 400, fontFamily: 'var(--font-sans)', color: '#1C1917', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles className="w-5 h-5 text-amber-700" /> Why Choose Us Section
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', color: '#44403C', fontWeight: 500, marginBottom: '6px', fontSize: '13px' }}>Sub-Tagline</label>
                <input
                  type="text"
                  value={config.whyChooseUs?.subtitle || '— VALUE —'}
                  onChange={(e) => setConfig({ ...config, whyChooseUs: { ...config.whyChooseUs, subtitle: e.target.value } })}
                  placeholder="e.g. — VALUE —"
                  style={{ width: '100%', backgroundColor: '#FAF7F2', border: '1px solid #D6D3D1', borderRadius: '12px', padding: '10px 14px', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', color: '#44403C', fontWeight: 500, marginBottom: '6px', fontSize: '13px' }}>Section Main Heading</label>
                <input
                  type="text"
                  value={config.whyChooseUs?.title || 'Why Choose Pragya Yog School'}
                  onChange={(e) => setConfig({ ...config, whyChooseUs: { ...config.whyChooseUs, title: e.target.value } })}
                  placeholder="Heading..."
                  style={{ width: '100%', backgroundColor: '#FAF7F2', border: '1px solid #D6D3D1', borderRadius: '12px', padding: '10px 14px', fontSize: '13px' }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', color: '#44403C', fontWeight: 500, marginBottom: '6px', fontSize: '13px' }}>Section Intro Description</label>
              <textarea
                rows={2}
                value={config.whyChooseUs?.description || ''}
                onChange={(e) => setConfig({ ...config, whyChooseUs: { ...config.whyChooseUs, description: e.target.value } })}
                placeholder="Description..."
                style={{ width: '100%', backgroundColor: '#FAF7F2', border: '1px solid #D6D3D1', borderRadius: '12px', padding: '10px 14px', fontSize: '13px' }}
              />
            </div>
          </div>

          {/* Feature Cards Editor */}
          <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E7E5E4', padding: '24px 28px', borderRadius: '18px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <h4 style={{ fontSize: '15px', fontWeight: 500, color: '#1C1917', margin: 0 }}>Feature Cards (4 Key Benefits)</h4>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              {(config.whyChooseUs?.features || []).map((feat, idx) => (
                <div key={feat.id || idx} style={{ border: '1px solid #E7E5E4', padding: '16px', borderRadius: '14px', backgroundColor: '#FAF7F2', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', fontWeight: 500, color: '#B45309' }}>Card #{idx + 1}</span>
                    <select
                      value={feat.iconName || 'Dumbbell'}
                      onChange={(e) => {
                        const nextFeatures = [...config.whyChooseUs.features];
                        nextFeatures[idx] = { ...feat, iconName: e.target.value };
                        setConfig({ ...config, whyChooseUs: { ...config.whyChooseUs, features: nextFeatures } });
                      }}
                      style={{ fontSize: '11px', padding: '4px 8px', borderRadius: '6px', border: '1px solid #D6D3D1' }}
                    >
                      <option value="Dumbbell">Icon: Dumbbell</option>
                      <option value="Command">Icon: Command</option>
                      <option value="Layers">Icon: Layers</option>
                      <option value="Heart">Icon: Heart</option>
                      <option value="Sparkles">Icon: Sparkles</option>
                      <option value="Star">Icon: Star</option>
                      <option value="Zap">Icon: Zap</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '11px', color: '#666', marginBottom: '4px' }}>Title</label>
                    <input
                      type="text"
                      value={feat.title}
                      onChange={(e) => {
                        const nextFeatures = [...config.whyChooseUs.features];
                        nextFeatures[idx] = { ...feat, title: e.target.value };
                        setConfig({ ...config, whyChooseUs: { ...config.whyChooseUs, features: nextFeatures } });
                      }}
                      style={{ width: '100%', border: '1px solid #D6D3D1', borderRadius: '8px', padding: '8px 10px', fontSize: '13px' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '11px', color: '#666', marginBottom: '4px' }}>Description</label>
                    <textarea
                      rows={2}
                      value={feat.description}
                      onChange={(e) => {
                        const nextFeatures = [...config.whyChooseUs.features];
                        nextFeatures[idx] = { ...feat, description: e.target.value };
                        setConfig({ ...config, whyChooseUs: { ...config.whyChooseUs, features: nextFeatures } });
                      }}
                      style={{ width: '100%', border: '1px solid #D6D3D1', borderRadius: '8px', padding: '8px 10px', fontSize: '12px' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB: WELLNESS JOURNEY */}
      {subTab === 'journey' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E7E5E4', padding: '24px 28px', borderRadius: '18px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 400, fontFamily: 'var(--font-sans)', color: '#1C1917', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BookOpen className="w-5 h-5 text-amber-700" /> Wellness 4-Stage Pathway Header
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', color: '#44403C', fontWeight: 500, marginBottom: '6px', fontSize: '13px' }}>Badge Pill Text</label>
                <input
                  type="text"
                  value={config.wellnessJourney?.badge || 'TRANSFORMATION PATHWAY'}
                  onChange={(e) => setConfig({ ...config, wellnessJourney: { ...config.wellnessJourney, badge: e.target.value } })}
                  placeholder="e.g. TRANSFORMATION PATHWAY"
                  style={{ width: '100%', backgroundColor: '#FAF7F2', border: '1px solid #D6D3D1', borderRadius: '12px', padding: '10px 14px', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', color: '#44403C', fontWeight: 500, marginBottom: '6px', fontSize: '13px' }}>Main Section Title</label>
                <input
                  type="text"
                  value={config.wellnessJourney?.title || 'Your Path to Inner Peace'}
                  onChange={(e) => setConfig({ ...config, wellnessJourney: { ...config.wellnessJourney, title: e.target.value } })}
                  placeholder="Title..."
                  style={{ width: '100%', backgroundColor: '#FAF7F2', border: '1px solid #D6D3D1', borderRadius: '12px', padding: '10px 14px', fontSize: '13px' }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', color: '#44403C', fontWeight: 500, marginBottom: '6px', fontSize: '13px' }}>Section Subtitle</label>
              <textarea
                rows={2}
                value={config.wellnessJourney?.subtitle || ''}
                onChange={(e) => setConfig({ ...config, wellnessJourney: { ...config.wellnessJourney, subtitle: e.target.value } })}
                placeholder="Subtitle..."
                style={{ width: '100%', backgroundColor: '#FAF7F2', border: '1px solid #D6D3D1', borderRadius: '12px', padding: '10px 14px', fontSize: '13px' }}
              />
            </div>
          </div>

          {/* 4 Steps Editor */}
          <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E7E5E4', padding: '24px 28px', borderRadius: '18px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <h4 style={{ fontSize: '15px', fontWeight: 500, color: '#1C1917', margin: 0 }}>4 Journey Steps Details</h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {(config.wellnessJourney?.steps || []).map((step, idx) => (
                <div key={step.num || idx} style={{ border: '1px solid #E7E5E4', padding: '18px', borderRadius: '14px', backgroundColor: '#FAF7F2', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ backgroundColor: '#B45309', color: '#FFFFFF', padding: '4px 10px', borderRadius: '999px', fontSize: '12px', fontWeight: 600 }}>Step {step.num || `0${idx + 1}`}</span>
                    <input
                      type="text"
                      value={step.title}
                      onChange={(e) => {
                        const nextSteps = [...config.wellnessJourney.steps];
                        nextSteps[idx] = { ...step, title: e.target.value };
                        setConfig({ ...config, wellnessJourney: { ...config.wellnessJourney, steps: nextSteps } });
                      }}
                      placeholder="Step Title"
                      style={{ flex: 1, border: '1px solid #D6D3D1', borderRadius: '8px', padding: '8px 12px', fontSize: '13px', fontWeight: 500 }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', color: '#666', marginBottom: '4px' }}>Sub-headline</label>
                      <input
                        type="text"
                        value={step.subtitle}
                        onChange={(e) => {
                          const nextSteps = [...config.wellnessJourney.steps];
                          nextSteps[idx] = { ...step, subtitle: e.target.value };
                          setConfig({ ...config, wellnessJourney: { ...config.wellnessJourney, steps: nextSteps } });
                        }}
                        style={{ width: '100%', border: '1px solid #D6D3D1', borderRadius: '8px', padding: '8px 10px', fontSize: '12px' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '11px', color: '#666', marginBottom: '4px' }}>Bullet Points (One per line)</label>
                      <textarea
                        rows={2}
                        value={(step.bullets || []).join('\n')}
                        onChange={(e) => {
                          const nextSteps = [...config.wellnessJourney.steps];
                          nextSteps[idx] = { ...step, bullets: e.target.value.split('\n').filter(Boolean) };
                          setConfig({ ...config, wellnessJourney: { ...config.wellnessJourney, steps: nextSteps } });
                        }}
                        style={{ width: '100%', border: '1px solid #D6D3D1', borderRadius: '8px', padding: '8px 10px', fontSize: '12px' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '11px', color: '#666', marginBottom: '4px' }}>Description Paragraph</label>
                    <textarea
                      rows={2}
                      value={step.description}
                      onChange={(e) => {
                        const nextSteps = [...config.wellnessJourney.steps];
                        nextSteps[idx] = { ...step, description: e.target.value };
                        setConfig({ ...config, wellnessJourney: { ...config.wellnessJourney, steps: nextSteps } });
                      }}
                      style={{ width: '100%', border: '1px solid #D6D3D1', borderRadius: '8px', padding: '8px 10px', fontSize: '12px' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB: MEMBERSHIP PERKS */}
      {subTab === 'perks' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E7E5E4', padding: '24px 28px', borderRadius: '18px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 400, fontFamily: 'var(--font-sans)', color: '#1C1917', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Plus className="w-5 h-5 text-amber-700" /> Membership Plan Perks & Badges
            </h3>

            <div>
              <label style={{ display: 'block', color: '#44403C', fontWeight: 500, marginBottom: '6px', fontSize: '13px' }}>Standard Plan Featured Badge</label>
              <input
                type="text"
                value={config.membershipPerks?.standardBadge || 'MOST POPULAR'}
                onChange={(e) => setConfig({ ...config, membershipPerks: { ...config.membershipPerks, standardBadge: e.target.value } })}
                placeholder="e.g. MOST POPULAR"
                style={{ width: '100%', backgroundColor: '#FAF7F2', border: '1px solid #D6D3D1', borderRadius: '12px', padding: '10px 14px', fontSize: '13px' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', color: '#44403C', fontWeight: 500, marginBottom: '6px', fontSize: '13px' }}>Basic Plan Perks (One bullet per line)</label>
                <textarea
                  rows={4}
                  value={(config.membershipPerks?.basicPerks || []).join('\n')}
                  onChange={(e) => setConfig({ ...config, membershipPerks: { ...config.membershipPerks, basicPerks: e.target.value.split('\n').filter(Boolean) } })}
                  placeholder="Perk 1&#10;Perk 2..."
                  style={{ width: '100%', backgroundColor: '#FAF7F2', border: '1px solid #D6D3D1', borderRadius: '12px', padding: '12px 14px', fontSize: '12px', lineHeight: '1.6' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', color: '#44403C', fontWeight: 500, marginBottom: '6px', fontSize: '13px' }}>Standard Plan Perks (One bullet per line)</label>
                <textarea
                  rows={4}
                  value={(config.membershipPerks?.standardPerks || []).join('\n')}
                  onChange={(e) => setConfig({ ...config, membershipPerks: { ...config.membershipPerks, standardPerks: e.target.value.split('\n').filter(Boolean) } })}
                  placeholder="Perk 1&#10;Perk 2..."
                  style={{ width: '100%', backgroundColor: '#FAF7F2', border: '1px solid #D6D3D1', borderRadius: '12px', padding: '12px 14px', fontSize: '12px', lineHeight: '1.6' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', color: '#44403C', fontWeight: 500, marginBottom: '6px', fontSize: '13px' }}>Premium Plan Perks (One bullet per line)</label>
                <textarea
                  rows={4}
                  value={(config.membershipPerks?.premiumPerks || []).join('\n')}
                  onChange={(e) => setConfig({ ...config, membershipPerks: { ...config.membershipPerks, premiumPerks: e.target.value.split('\n').filter(Boolean) } })}
                  placeholder="Perk 1&#10;Perk 2..."
                  style={{ width: '100%', backgroundColor: '#FAF7F2', border: '1px solid #D6D3D1', borderRadius: '12px', padding: '12px 14px', fontSize: '12px', lineHeight: '1.6' }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: STUDIO LOCATIONS */}
      {subTab === 'locations' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ fontSize: '17px', fontWeight: 400, fontFamily: 'var(--font-sans)', color: '#1C1917', margin: 0 }}>Manage Studio Branches & Pavilions</h3>
            <button
              onClick={handleAddLocation}
              style={{ padding: '10px 20px', backgroundColor: '#B45309', color: '#FFFFFF', borderRadius: '12px', fontSize: '13px', fontWeight: 500, border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <Plus className="w-4 h-4" /> Add Studio Branch
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>
            {config.locations.map((loc, idx) => (
              <div key={loc.id || idx} style={{ backgroundColor: '#FFFFFF', border: '1px solid #E7E5E4', padding: '24px', borderRadius: '18px', display: 'flex', flexDirection: 'column', gap: '16px', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '12px', fontWeight: 500, color: '#78350F', backgroundColor: '#FEF3C7', padding: '3px 10px', borderRadius: '999px', border: '1px solid #FDE68A' }}>
                    Branch #{idx + 1}
                  </span>
                  <button
                    onClick={() => handleDeleteLocation(idx)}
                    style={{ padding: '6px 10px', backgroundColor: '#FEF2F2', color: '#991B1B', borderRadius: '8px', border: '1px solid #FECDD3', cursor: 'pointer', fontSize: '12px', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Remove
                  </button>
                </div>

                <div>
                  <label style={{ display: 'block', color: '#44403C', fontWeight: 500, marginBottom: '4px', fontSize: '12px' }}>Studio Name</label>
                  <input
                    type="text"
                    value={loc.name}
                    onChange={(e) => handleUpdateLocation(idx, { name: e.target.value })}
                    style={{ width: '100%', backgroundColor: '#FAF7F2', border: '1px solid #D6D3D1', borderRadius: '10px', padding: '8px 12px', fontSize: '13px', fontWeight: 500 }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', color: '#44403C', fontWeight: 500, marginBottom: '4px', fontSize: '12px' }}>Address & City</label>
                  <input
                    type="text"
                    value={loc.address}
                    onChange={(e) => handleUpdateLocation(idx, { address: e.target.value })}
                    placeholder="Address"
                    style={{ width: '100%', backgroundColor: '#FAF7F2', border: '1px solid #D6D3D1', borderRadius: '10px', padding: '8px 12px', fontSize: '12px', marginBottom: '8px' }}
                  />
                  <input
                    type="text"
                    value={loc.city}
                    onChange={(e) => handleUpdateLocation(idx, { city: e.target.value })}
                    placeholder="City / Area label"
                    style={{ width: '100%', backgroundColor: '#FAF7F2', border: '1px solid #D6D3D1', borderRadius: '10px', padding: '8px 12px', fontSize: '12px' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ display: 'block', color: '#44403C', fontWeight: 500, marginBottom: '4px', fontSize: '12px' }}>Hours</label>
                    <input
                      type="text"
                      value={loc.hours}
                      onChange={(e) => handleUpdateLocation(idx, { hours: e.target.value })}
                      style={{ width: '100%', backgroundColor: '#FAF7F2', border: '1px solid #D6D3D1', borderRadius: '10px', padding: '8px 12px', fontSize: '12px' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', color: '#44403C', fontWeight: 500, marginBottom: '4px', fontSize: '12px' }}>Phone</label>
                    <input
                      type="text"
                      value={loc.phone}
                      onChange={(e) => handleUpdateLocation(idx, { phone: e.target.value })}
                      style={{ width: '100%', backgroundColor: '#FAF7F2', border: '1px solid #D6D3D1', borderRadius: '10px', padding: '8px 12px', fontSize: '12px' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', color: '#44403C', fontWeight: 500, marginBottom: '4px', fontSize: '12px' }}>Image URL</label>
                  <input
                    type="text"
                    value={loc.image}
                    onChange={(e) => handleUpdateLocation(idx, { image: e.target.value })}
                    style={{ width: '100%', backgroundColor: '#FAF7F2', border: '1px solid #D6D3D1', borderRadius: '10px', padding: '8px 12px', fontSize: '11px', fontFamily: 'monospace' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', color: '#44403C', fontWeight: 500, marginBottom: '4px', fontSize: '12px' }}>Amenities (Comma-separated)</label>
                  <input
                    type="text"
                    value={loc.amenities.join(', ')}
                    onChange={(e) => handleUpdateLocation(idx, { amenities: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })}
                    style={{ width: '100%', backgroundColor: '#FAF7F2', border: '1px solid #D6D3D1', borderRadius: '10px', padding: '8px 12px', fontSize: '12px' }}
                  />
                </div>

              </div>
            ))}
          </div>

        </div>
      )}

      {/* SUB-TAB 3: ABOUT US & BRAND */}
      {subTab === 'about' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E7E5E4', padding: '24px 28px', borderRadius: '18px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 400, fontFamily: 'var(--font-sans)', color: '#1C1917', margin: 0 }}>Brand Story & Philosophy</h3>

            <div>
              <label style={{ display: 'block', color: '#44403C', fontWeight: 500, marginBottom: '6px', fontSize: '13px' }}>Story Title</label>
              <input
                type="text"
                value={config.about.storyTitle}
                onChange={(e) => setConfig({ ...config, about: { ...config.about, storyTitle: e.target.value } })}
                style={{ width: '100%', backgroundColor: '#FAF7F2', border: '1px solid #D6D3D1', borderRadius: '12px', padding: '10px 14px', fontSize: '14px', fontWeight: 500 }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', color: '#44403C', fontWeight: 500, marginBottom: '6px', fontSize: '13px' }}>Story Paragraph 1</label>
                <textarea
                  rows={4}
                  value={config.about.storyText1}
                  onChange={(e) => setConfig({ ...config, about: { ...config.about, storyText1: e.target.value } })}
                  style={{ width: '100%', backgroundColor: '#FAF7F2', border: '1px solid #D6D3D1', borderRadius: '12px', padding: '12px 14px', fontSize: '13px', lineHeight: '1.6' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', color: '#44403C', fontWeight: 500, marginBottom: '6px', fontSize: '13px' }}>Story Paragraph 2</label>
                <textarea
                  rows={4}
                  value={config.about.storyText2}
                  onChange={(e) => setConfig({ ...config, about: { ...config.about, storyText2: e.target.value } })}
                  style={{ width: '100%', backgroundColor: '#FAF7F2', border: '1px solid #D6D3D1', borderRadius: '12px', padding: '12px 14px', fontSize: '13px', lineHeight: '1.6' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', color: '#44403C', fontWeight: 500, marginBottom: '6px', fontSize: '13px' }}>Mission Statement</label>
                <textarea
                  rows={3}
                  value={config.about.mission}
                  onChange={(e) => setConfig({ ...config, about: { ...config.about, mission: e.target.value } })}
                  style={{ width: '100%', backgroundColor: '#FAF7F2', border: '1px solid #D6D3D1', borderRadius: '12px', padding: '12px 14px', fontSize: '13px', lineHeight: '1.5' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', color: '#44403C', fontWeight: 500, marginBottom: '6px', fontSize: '13px' }}>Vision Statement</label>
                <textarea
                  rows={3}
                  value={config.about.vision}
                  onChange={(e) => setConfig({ ...config, about: { ...config.about, vision: e.target.value } })}
                  style={{ width: '100%', backgroundColor: '#FAF7F2', border: '1px solid #D6D3D1', borderRadius: '12px', padding: '12px 14px', fontSize: '13px', lineHeight: '1.5' }}
                />
              </div>
            </div>
          </div>

          {/* Founder Bio */}
          <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E7E5E4', padding: '24px 28px', borderRadius: '18px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 400, fontFamily: 'var(--font-sans)', color: '#1C1917', margin: 0 }}>Founder & Spiritual Director Profile</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', color: '#44403C', fontWeight: 500, marginBottom: '4px', fontSize: '12px' }}>Founder Name</label>
                <input
                  type="text"
                  value={config.about.founderName}
                  onChange={(e) => setConfig({ ...config, about: { ...config.about, founderName: e.target.value } })}
                  style={{ width: '100%', backgroundColor: '#FAF7F2', border: '1px solid #D6D3D1', borderRadius: '10px', padding: '10px 14px', fontSize: '13px', fontWeight: 500 }}
                />
              </div>

              <div>
                <label style={{ display: 'block', color: '#44403C', fontWeight: 500, marginBottom: '4px', fontSize: '12px' }}>Title / Designation</label>
                <input
                  type="text"
                  value={config.about.founderTitle}
                  onChange={(e) => setConfig({ ...config, about: { ...config.about, founderTitle: e.target.value } })}
                  style={{ width: '100%', backgroundColor: '#FAF7F2', border: '1px solid #D6D3D1', borderRadius: '10px', padding: '10px 14px', fontSize: '13px' }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', color: '#44403C', fontWeight: 500, marginBottom: '4px', fontSize: '12px' }}>Bio Paragraph</label>
              <textarea
                rows={3}
                value={config.about.founderBio}
                onChange={(e) => setConfig({ ...config, about: { ...config.about, founderBio: e.target.value } })}
                style={{ width: '100%', backgroundColor: '#FAF7F2', border: '1px solid #D6D3D1', borderRadius: '10px', padding: '10px 14px', fontSize: '13px' }}
              />
            </div>
          </div>

        </div>
      )}

      {/* SUB-TAB 4: COURSE TEMPLATES & SYLLABUS */}
      {subTab === 'courses' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E7E5E4', padding: '24px 28px', borderRadius: '18px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 400, fontFamily: 'var(--font-sans)', color: '#1C1917', margin: 0 }}>Teacher Training Course (TTC) Dynamic Syllabus & Inclusions</h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', color: '#44403C', fontWeight: 500, marginBottom: '6px', fontSize: '13px' }}>Course Title</label>
                <input
                  type="text"
                  value={config.courseTemplates.ttcTitle}
                  onChange={(e) => setConfig({ ...config, courseTemplates: { ...config.courseTemplates, ttcTitle: e.target.value } })}
                  style={{ width: '100%', backgroundColor: '#FAF7F2', border: '1px solid #D6D3D1', borderRadius: '12px', padding: '10px 14px', fontSize: '13px', fontWeight: 500 }}
                />
              </div>

              <div>
                <label style={{ display: 'block', color: '#44403C', fontWeight: 500, marginBottom: '6px', fontSize: '13px' }}>Certification Body</label>
                <input
                  type="text"
                  value={config.courseTemplates.ttcCertification}
                  onChange={(e) => setConfig({ ...config, courseTemplates: { ...config.courseTemplates, ttcCertification: e.target.value } })}
                  style={{ width: '100%', backgroundColor: '#FAF7F2', border: '1px solid #D6D3D1', borderRadius: '12px', padding: '10px 14px', fontSize: '13px' }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', color: '#44403C', fontWeight: 500, marginBottom: '6px', fontSize: '13px' }}>Course Inclusions (One per line)</label>
              <textarea
                rows={4}
                value={config.courseTemplates.ttcInclusions.join('\n')}
                onChange={(e) => setConfig({ ...config, courseTemplates: { ...config.courseTemplates, ttcInclusions: e.target.value.split('\n').filter(Boolean) } })}
                style={{ width: '100%', backgroundColor: '#FAF7F2', border: '1px solid #D6D3D1', borderRadius: '12px', padding: '12px 14px', fontSize: '13px', lineHeight: '1.6' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', color: '#44403C', fontWeight: 500, marginBottom: '6px', fontSize: '13px' }}>Course Prerequisites (One per line)</label>
              <textarea
                rows={3}
                value={config.courseTemplates.ttcPrerequisites.join('\n')}
                onChange={(e) => setConfig({ ...config, courseTemplates: { ...config.courseTemplates, ttcPrerequisites: e.target.value.split('\n').filter(Boolean) } })}
                style={{ width: '100%', backgroundColor: '#FAF7F2', border: '1px solid #D6D3D1', borderRadius: '12px', padding: '12px 14px', fontSize: '13px', lineHeight: '1.6' }}
              />
            </div>

          </div>

        </div>
      )}

      {/* SUB-TAB 5: FOOTER & SOCIAL LINKS */}
      {subTab === 'footer' && (
        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E7E5E4', padding: '24px 28px', borderRadius: '18px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 400, fontFamily: 'var(--font-sans)', color: '#1C1917', margin: 0 }}>Footer & Social Media Links Configuration</h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', color: '#44403C', fontWeight: 500, marginBottom: '6px', fontSize: '13px' }}>Support Email</label>
              <input
                type="email"
                value={config.footer.email}
                onChange={(e) => setConfig({ ...config, footer: { ...config.footer, email: e.target.value } })}
                style={{ width: '100%', backgroundColor: '#FAF7F2', border: '1px solid #D6D3D1', borderRadius: '12px', padding: '10px 14px', fontSize: '13px' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', color: '#44403C', fontWeight: 500, marginBottom: '6px', fontSize: '13px' }}>Support Phone</label>
              <input
                type="text"
                value={config.footer.phone}
                onChange={(e) => setConfig({ ...config, footer: { ...config.footer, phone: e.target.value } })}
                style={{ width: '100%', backgroundColor: '#FAF7F2', border: '1px solid #D6D3D1', borderRadius: '12px', padding: '10px 14px', fontSize: '13px' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', color: '#44403C', fontWeight: 500, marginBottom: '6px', fontSize: '13px' }}>WhatsApp Number</label>
              <input
                type="text"
                value={config.footer.whatsappNumber}
                onChange={(e) => setConfig({ ...config, footer: { ...config.footer, whatsappNumber: e.target.value } })}
                placeholder="e.g. +85298765432"
                style={{ width: '100%', backgroundColor: '#FAF7F2', border: '1px solid #D6D3D1', borderRadius: '12px', padding: '10px 14px', fontSize: '13px' }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', color: '#44403C', fontWeight: 500, marginBottom: '6px', fontSize: '13px' }}>Studio HQ Address</label>
            <input
              type="text"
              value={config.footer.address}
              onChange={(e) => setConfig({ ...config, footer: { ...config.footer, address: e.target.value } })}
              style={{ width: '100%', backgroundColor: '#FAF7F2', border: '1px solid #D6D3D1', borderRadius: '12px', padding: '10px 14px', fontSize: '13px' }}
            />
          </div>

          <div style={{ borderTop: '1px solid #F5F5F4', paddingTop: '16px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', color: '#44403C', fontWeight: 500, marginBottom: '6px', fontSize: '13px' }}>Instagram URL</label>
              <input
                type="text"
                value={config.footer.instagramUrl}
                onChange={(e) => setConfig({ ...config, footer: { ...config.footer, instagramUrl: e.target.value } })}
                style={{ width: '100%', backgroundColor: '#FAF7F2', border: '1px solid #D6D3D1', borderRadius: '12px', padding: '10px 14px', fontSize: '13px' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', color: '#44403C', fontWeight: 500, marginBottom: '6px', fontSize: '13px' }}>Facebook URL</label>
              <input
                type="text"
                value={config.footer.facebookUrl}
                onChange={(e) => setConfig({ ...config, footer: { ...config.footer, facebookUrl: e.target.value } })}
                style={{ width: '100%', backgroundColor: '#FAF7F2', border: '1px solid #D6D3D1', borderRadius: '12px', padding: '10px 14px', fontSize: '13px' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', color: '#44403C', fontWeight: 500, marginBottom: '6px', fontSize: '13px' }}>YouTube URL</label>
              <input
                type="text"
                value={config.footer.youtubeUrl}
                onChange={(e) => setConfig({ ...config, footer: { ...config.footer, youtubeUrl: e.target.value } })}
                style={{ width: '100%', backgroundColor: '#FAF7F2', border: '1px solid #D6D3D1', borderRadius: '12px', padding: '10px 14px', fontSize: '13px' }}
              />
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
