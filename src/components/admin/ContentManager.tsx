import React, { useState, useEffect } from 'react';
import {
  Save, Sparkles, Image as ImageIcon, MapPin, Check, Plus, Trash2, Loader2, Calendar,
  Ticket, Shield, Globe, Info, RefreshCw, Layers, Award, BookOpen, User, Eye, ArrowRight,
  Dumbbell, Heart, Command, X, Edit3, Edit
} from 'lucide-react';
import {
  getSiteConfig,
  saveSiteConfig,
  resetSiteConfig,
  fetchSiteConfigFromFirebase,
  SiteConfig,
  StudioLocation,
  NavbarVisibilityConfig
} from '../../services/siteConfig';
import { getUpcomingEvents, getMerchandiseItems, saveMerchandiseItem, deleteMerchandiseItem } from '../../services/api';
import { UpcomingEvent, MerchandiseItem, MerchandiseCategory } from '../../types';
import { AddProductPage } from './AddProductPage';

export const ContentManager: React.FC = () => {
  const [selectedPage, setSelectedPage] = useState<'home' | 'about' | 'shop' | 'events' | 'classes' | 'teachers' | 'membership'>('home');
  const [shopSubView, setShopSubView] = useState<'list' | 'add-product'>('list');
  const [editingProduct, setEditingProduct] = useState<MerchandiseItem | null>(null);
  const [config, setConfig] = useState<SiteConfig>(getSiteConfig());
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [allEvents, setAllEvents] = useState<UpcomingEvent[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);

  // Merchandise Store State for Shop tab
  const [merchandiseItems, setMerchandiseItems] = useState<MerchandiseItem[]>([]);
  const [isLoadingMerch, setIsLoadingMerch] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newProdTitle, setNewProdTitle] = useState('');
  const [newProdCategory, setNewProdCategory] = useState<MerchandiseCategory>('apparel');
  const [newProdPrice, setNewProdPrice] = useState('');
  const [newProdImage, setNewProdImage] = useState('');
  const [newProdBadge, setNewProdBadge] = useState('');
  const [newProdDesc, setNewProdDesc] = useState('');
  const [isSubmittingProd, setIsSubmittingProd] = useState(false);

  useEffect(() => {
    fetchSiteConfigFromFirebase().then((liveConfig) => {
      if (liveConfig) {
        setConfig(liveConfig);
      }
    });

    setIsLoadingEvents(true);
    getUpcomingEvents().then((eventsData) => {
      if (eventsData && eventsData.length > 0) {
        setAllEvents(eventsData);
      }
      setIsLoadingEvents(false);
    });

    setIsLoadingMerch(true);
    getMerchandiseItems().then((itemsData) => {
      if (itemsData && itemsData.length > 0) {
        setMerchandiseItems(itemsData);
      }
      setIsLoadingMerch(false);
    });
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveSiteConfig(config);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      console.error('Save failed:', err);
      alert(`⚠️ Save Error: ${err?.message || 'Could not save changes to Firebase. Local changes preserved.'}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all site text and settings to default factory values?')) {
      const def = resetSiteConfig();
      setConfig(def);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  // Navbar Visibility Toggle Handler
  const handleToggleNavbarItem = (key: keyof NavbarVisibilityConfig) => {
    const currentVis = config.navbarVisibility || {
      home: true,
      about: true,
      shop: true,
      events: true,
      classes: true,
      teachers: true,
      membership: true,
    };
    const nextVis = { ...currentVis, [key]: !currentVis[key] };
    setConfig({ ...config, navbarVisibility: nextVis });
  };

  // Home Page -> Featured Events Tick Handler
  const handleToggleEventOnHome = (eventId: string) => {
    const enabledIds = config.upcomingEventsConfig?.enabledEventIds || [];
    let nextEnabled: string[];

    if (enabledIds.includes(eventId)) {
      nextEnabled = enabledIds.filter((id) => id !== eventId);
    } else {
      nextEnabled = [...enabledIds.filter((id) => id !== '__none__'), eventId];
    }

    if (nextEnabled.length === 0) {
      nextEnabled = ['__none__'];
    }

    setConfig({
      ...config,
      upcomingEventsConfig: {
        enabledEventIds: nextEnabled,
      },
    });
  };

  const isEventEnabled = (eventId: string) => {
    const enabledIds = config.upcomingEventsConfig?.enabledEventIds || [];
    if (enabledIds.length === 0) return true; // Default: show all if not configured
    return enabledIds.includes(eventId);
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

  const navVisibility = config.navbarVisibility || {
    home: true,
    about: true,
    shop: true,
    events: true,
    classes: true,
    teachers: true,
    membership: true,
  };

  const navButtonsList: { key: keyof NavbarVisibilityConfig; label: string }[] = [
    { key: 'home', label: 'Home' },
    { key: 'about', label: 'About' },
    { key: 'shop', label: 'Shop' },
    { key: 'events', label: 'Events' },
    { key: 'classes', label: 'Classes' },
    { key: 'teachers', label: 'Teachers' },
    { key: 'membership', label: 'Membership & Packages' },
  ];

  const pageTabsList: { id: typeof selectedPage; label: string }[] = [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'About' },
    { id: 'shop', label: 'Shop' },
    { id: 'events', label: 'Events' },
    { id: 'classes', label: 'Classes' },
    { id: 'teachers', label: 'Teachers' },
    { id: 'membership', label: 'Membership & Packages' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', fontFamily: 'var(--font-sans, system-ui, sans-serif)' }}>
      
      {/* ── SECTION 1: NAVBAR BUTTONS VISIBILITY CONTROL ───────────────────────────── */}
      <div style={{
        backgroundColor: '#FFFFFF',
        padding: '24px 28px',
        borderRadius: '16px',
        border: '1px solid #E7E5E4',
        boxShadow: '0 4px 14px rgba(0,0,0,0.03)',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#1C1917', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Globe className="w-5 h-5 text-amber-700" /> Navigation Bar Button Visibility
            </h2>
            <p style={{ fontSize: '13px', color: '#78716C', margin: '4px 0 0 0' }}>
              Select which navigation buttons appear in the main website header. Ticked items are live on the website.
            </p>
          </div>

          <button
            onClick={handleSave}
            disabled={isSaving}
            style={{
              padding: '10px 22px',
              borderRadius: '10px',
              backgroundColor: '#B45309',
              color: '#FFFFFF',
              border: 'none',
              fontWeight: 600,
              fontSize: '13.5px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(180, 83, 9, 0.3)',
              opacity: isSaving ? 0.7 : 1,
              transition: 'all 0.2s ease'
            }}
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saveSuccess ? 'Changes Saved!' : 'Save Navbar Settings'}
          </button>
        </div>

        {/* Horizontal Nav Item Checkboxes */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: '12px',
          padding: '16px',
          backgroundColor: '#FAFAF9',
          borderRadius: '12px',
          border: '1px solid #F5F5F4'
        }}>
          {navButtonsList.map((item) => {
            const isChecked = navVisibility[item.key];
            return (
              <button
                key={item.key}
                onClick={() => handleToggleNavbarItem(item.key)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 18px',
                  borderRadius: '10px',
                  border: isChecked ? '1.5px solid #B45309' : '1px solid #D6D3D1',
                  backgroundColor: isChecked ? '#FEF3C7' : '#FFFFFF',
                  color: isChecked ? '#92400E' : '#57534E',
                  fontWeight: 600,
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: isChecked ? '0 2px 6px rgba(180, 83, 9, 0.12)' : 'none'
                }}
              >
                <div style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '5px',
                  backgroundColor: isChecked ? '#B45309' : '#E7E5E4',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                  fontSize: '12px',
                  transition: 'all 0.2s ease'
                }}>
                  {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── SECTION 2: PAGE CONTENT EDITOR (HIERARCHY BASED) ────────────────────── */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '16px',
        border: '1px solid #E7E5E4',
        boxShadow: '0 4px 14px rgba(0,0,0,0.03)',
        overflow: 'hidden'
      }}>
        {/* Top Header & Page Selector Tabs */}
        <div style={{
          padding: '24px 28px',
          borderBottom: '1px solid #E7E5E4',
          backgroundColor: '#FAFAF9',
          display: 'flex',
          flexDirection: 'column',
          gap: '18px'
        }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#1C1917', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Sparkles className="w-5 h-5 text-amber-700" /> Page Content Hierarchy Manager
              </h2>
              <p style={{ fontSize: '13.5px', color: '#78716C', margin: '4px 0 0 0' }}>
                Select a page tab below to view and edit all non-API sections in their exact visual page order.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button
                onClick={handleReset}
                style={{
                  padding: '9px 16px',
                  borderRadius: '10px',
                  border: '1px solid #E7E5E4',
                  backgroundColor: '#FFFFFF',
                  color: '#78716C',
                  fontSize: '13px',
                  fontWeight: 500,
                  cursor: 'pointer'
                }}
              >
                Reset Defaults
              </button>

              <button
                onClick={handleSave}
                disabled={isSaving}
                style={{
                  padding: '10px 22px',
                  borderRadius: '10px',
                  backgroundColor: '#B45309',
                  color: '#FFFFFF',
                  border: 'none',
                  fontWeight: 600,
                  fontSize: '13.5px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(180, 83, 9, 0.3)',
                  opacity: isSaving ? 0.7 : 1
                }}
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saveSuccess ? 'Page Saved!' : 'Save Page Changes'}
              </button>
            </div>
          </div>

          {/* Horizontal Page Tabs */}
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px', paddingTop: '4px' }}>
            {pageTabsList.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedPage(tab.id)}
                style={{
                  padding: '10px 20px',
                  borderRadius: '10px',
                  fontWeight: 600,
                  fontSize: '13.5px',
                  cursor: 'pointer',
                  border: selectedPage === tab.id ? 'none' : '1px solid #E7E5E4',
                  backgroundColor: selectedPage === tab.id ? '#B45309' : '#FFFFFF',
                  color: selectedPage === tab.id ? '#FFFFFF' : '#44403C',
                  boxShadow: selectedPage === tab.id ? '0 2px 8px rgba(180,83,9,0.25)' : 'none',
                  transition: 'all 0.2s ease'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Main Editor Body */}
        <div style={{ padding: '28px' }}>

          {/* ════════════════════ PAGE: HOME ════════════════════ */}
          {selectedPage === 'home' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>

              {/* Section 1: Hero Section */}
              <div style={{ border: '1px solid #E7E5E4', borderRadius: '14px', padding: '22px', backgroundColor: '#FFFFFF' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px', borderBottom: '1px solid #F5F5F4', paddingBottom: '12px' }}>
                  <span style={{ backgroundColor: '#FEF3C7', color: '#B45309', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 700 }}>
                    Section 1
                  </span>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1C1917', margin: 0 }}>
                    Hero Banner Section
                  </h3>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '18px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#44403C', marginBottom: '6px' }}>
                      Main Title Text
                    </label>
                    <input
                      type="text"
                      value={config.hero.mainTitle}
                      onChange={(e) => setConfig({ ...config, hero: { ...config.hero, mainTitle: e.target.value } })}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #D6D3D1', fontSize: '14px' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#44403C', marginBottom: '6px' }}>
                      Subtitle Description
                    </label>
                    <textarea
                      rows={3}
                      value={config.hero.subtitle}
                      onChange={(e) => setConfig({ ...config, hero: { ...config.hero, subtitle: e.target.value } })}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #D6D3D1', fontSize: '14px' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#44403C', marginBottom: '6px' }}>
                      Primary Button Text
                    </label>
                    <input
                      type="text"
                      value={config.hero.ctaPrimaryText}
                      onChange={(e) => setConfig({ ...config, hero: { ...config.hero, ctaPrimaryText: e.target.value } })}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #D6D3D1', fontSize: '14px' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#44403C', marginBottom: '6px' }}>
                      Hero Carousel Images (URLs separated by comma)
                    </label>
                    <textarea
                      rows={2}
                      value={config.hero.images.join(', ')}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          hero: {
                            ...config.hero,
                            images: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                          },
                        })
                      }
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #D6D3D1', fontSize: '13px', fontFamily: 'monospace' }}
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Why Choose Us Section */}
              <div style={{ border: '1px solid #E7E5E4', borderRadius: '14px', padding: '22px', backgroundColor: '#FFFFFF' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
                  <span style={{ backgroundColor: '#FEF3C7', color: '#B45309', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 700 }}>
                    Section 2
                  </span>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1C1917', margin: 0 }}>
                    Why Choose Us Section
                  </h3>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '18px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#44403C', marginBottom: '6px' }}>Subtitle</label>
                    <input
                      type="text"
                      value={config.whyChooseUs.subtitle}
                      onChange={(e) => setConfig({ ...config, whyChooseUs: { ...config.whyChooseUs, subtitle: e.target.value } })}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #D6D3D1', fontSize: '14px' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#44403C', marginBottom: '6px' }}>Title</label>
                    <input
                      type="text"
                      value={config.whyChooseUs.title}
                      onChange={(e) => setConfig({ ...config, whyChooseUs: { ...config.whyChooseUs, title: e.target.value } })}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #D6D3D1', fontSize: '14px' }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '18px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#44403C', marginBottom: '6px' }}>Description</label>
                  <textarea
                    rows={2}
                    value={config.whyChooseUs.description}
                    onChange={(e) => setConfig({ ...config, whyChooseUs: { ...config.whyChooseUs, description: e.target.value } })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #D6D3D1', fontSize: '14px' }}
                  />
                </div>

                {/* 4 Feature Cards */}
                <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#1C1917', margin: '0 0 12px 0' }}>Feature Cards (4 Items)</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
                  {config.whyChooseUs.features.map((feat, idx) => (
                    <div key={feat.id || idx} style={{ border: '1px solid #F5F5F4', borderRadius: '10px', padding: '14px', backgroundColor: '#FAFAF9' }}>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: '#B45309', marginBottom: '8px' }}>Card #{idx + 1}</div>
                      <input
                        type="text"
                        placeholder="Feature Title"
                        value={feat.title}
                        onChange={(e) => {
                          const next = [...config.whyChooseUs.features];
                          next[idx] = { ...next[idx], title: e.target.value };
                          setConfig({ ...config, whyChooseUs: { ...config.whyChooseUs, features: next } });
                        }}
                        style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #E7E5E4', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}
                      />
                      <textarea
                        rows={2}
                        placeholder="Feature Description"
                        value={feat.description}
                        onChange={(e) => {
                          const next = [...config.whyChooseUs.features];
                          next[idx] = { ...next[idx], description: e.target.value };
                          setConfig({ ...config, whyChooseUs: { ...config.whyChooseUs, features: next } });
                        }}
                        style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #E7E5E4', fontSize: '12.5px' }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 3: The Gift of Yoga Section */}
              <div style={{ border: '1px solid #E7E5E4', borderRadius: '14px', padding: '22px', backgroundColor: '#FFFFFF' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
                  <span style={{ backgroundColor: '#FEF3C7', color: '#B45309', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 700 }}>
                    Section 3
                  </span>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1C1917', margin: 0 }}>
                    The Gift of Yoga Section
                  </h3>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#44403C', marginBottom: '6px' }}>Title Prefix</label>
                    <input
                      type="text"
                      value={config.classesPageConfig?.giftTitle || 'The'}
                      onChange={(e) => setConfig({
                        ...config,
                        classesPageConfig: {
                          ...config.classesPageConfig,
                          topTitle: config.classesPageConfig?.topTitle || 'Explore Our',
                          topTitleItalic: config.classesPageConfig?.topTitleItalic || 'Classes',
                          topSuffix: config.classesPageConfig?.topSuffix || '',
                          topSubtitle: config.classesPageConfig?.topSubtitle || '',
                          idealTitle: config.classesPageConfig?.idealTitle || 'Discover Your',
                          idealTitleItalic: config.classesPageConfig?.idealTitleItalic || 'Ideal',
                          idealSuffix: config.classesPageConfig?.idealSuffix || 'Yog Practice',
                          idealSubtitle: config.classesPageConfig?.idealSubtitle || '',
                          giftTitle: e.target.value,
                          giftTitleItalic: config.classesPageConfig?.giftTitleItalic || 'Gift',
                          giftSuffix: config.classesPageConfig?.giftSuffix || 'of Yoga',
                          giftSubtitle: config.classesPageConfig?.giftSubtitle || '',
                          giftCards: config.classesPageConfig?.giftCards || []
                        }
                      })}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #D6D3D1', fontSize: '14px' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#44403C', marginBottom: '6px' }}>Title Italic Part</label>
                    <input
                      type="text"
                      value={config.classesPageConfig?.giftTitleItalic || 'Gift'}
                      onChange={(e) => setConfig({
                        ...config,
                        classesPageConfig: {
                          ...config.classesPageConfig,
                          topTitle: config.classesPageConfig?.topTitle || 'Explore Our',
                          topTitleItalic: config.classesPageConfig?.topTitleItalic || 'Classes',
                          topSuffix: config.classesPageConfig?.topSuffix || '',
                          topSubtitle: config.classesPageConfig?.topSubtitle || '',
                          idealTitle: config.classesPageConfig?.idealTitle || 'Discover Your',
                          idealTitleItalic: config.classesPageConfig?.idealTitleItalic || 'Ideal',
                          idealSuffix: config.classesPageConfig?.idealSuffix || 'Yog Practice',
                          idealSubtitle: config.classesPageConfig?.idealSubtitle || '',
                          giftTitle: config.classesPageConfig?.giftTitle || 'The',
                          giftTitleItalic: e.target.value,
                          giftSuffix: config.classesPageConfig?.giftSuffix || 'of Yoga',
                          giftSubtitle: config.classesPageConfig?.giftSubtitle || '',
                          giftCards: config.classesPageConfig?.giftCards || []
                        }
                      })}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #D6D3D1', fontSize: '14px' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#44403C', marginBottom: '6px' }}>Title Suffix</label>
                    <input
                      type="text"
                      value={config.classesPageConfig?.giftSuffix || 'of Yoga'}
                      onChange={(e) => setConfig({
                        ...config,
                        classesPageConfig: {
                          ...config.classesPageConfig,
                          topTitle: config.classesPageConfig?.topTitle || 'Explore Our',
                          topTitleItalic: config.classesPageConfig?.topTitleItalic || 'Classes',
                          topSuffix: config.classesPageConfig?.topSuffix || '',
                          topSubtitle: config.classesPageConfig?.topSubtitle || '',
                          idealTitle: config.classesPageConfig?.idealTitle || 'Discover Your',
                          idealTitleItalic: config.classesPageConfig?.idealTitleItalic || 'Ideal',
                          idealSuffix: config.classesPageConfig?.idealSuffix || 'Yog Practice',
                          idealSubtitle: config.classesPageConfig?.idealSubtitle || '',
                          giftTitle: config.classesPageConfig?.giftTitle || 'The',
                          giftTitleItalic: config.classesPageConfig?.giftTitleItalic || 'Gift',
                          giftSuffix: e.target.value,
                          giftSubtitle: config.classesPageConfig?.giftSubtitle || '',
                          giftCards: config.classesPageConfig?.giftCards || []
                        }
                      })}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #D6D3D1', fontSize: '14px' }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#44403C', marginBottom: '6px' }}>Subtitle Description</label>
                  <textarea
                    rows={2}
                    value={config.classesPageConfig?.giftSubtitle || "Yoga is more than a physical practice, it's a path toward wellness, balance, and inner peace"}
                    onChange={(e) => setConfig({
                      ...config,
                      classesPageConfig: {
                        ...config.classesPageConfig,
                        topTitle: config.classesPageConfig?.topTitle || 'Explore Our',
                        topTitleItalic: config.classesPageConfig?.topTitleItalic || 'Classes',
                        topSuffix: config.classesPageConfig?.topSuffix || '',
                        topSubtitle: config.classesPageConfig?.topSubtitle || '',
                        idealTitle: config.classesPageConfig?.idealTitle || 'Discover Your',
                        idealTitleItalic: config.classesPageConfig?.idealTitleItalic || 'Ideal',
                        idealSuffix: config.classesPageConfig?.idealSuffix || 'Yog Practice',
                        idealSubtitle: config.classesPageConfig?.idealSubtitle || '',
                        giftTitle: config.classesPageConfig?.giftTitle || 'The',
                        giftTitleItalic: config.classesPageConfig?.giftTitleItalic || 'Gift',
                        giftSuffix: config.classesPageConfig?.giftSuffix || 'of Yoga',
                        giftSubtitle: e.target.value,
                        giftCards: config.classesPageConfig?.giftCards || []
                      }
                    })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #D6D3D1', fontSize: '14px' }}
                  />
                </div>

                <label style={{ display: 'block', fontSize: '14px', fontWeight: 700, color: '#1C1917', marginBottom: '12px' }}>4 Gift Benefit Cards</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  {(config.classesPageConfig?.giftCards && config.classesPageConfig.giftCards.length === 4
                    ? config.classesPageConfig.giftCards
                    : [
                        { title: 'Physical Strength & Flexibility', description: 'Build endurance, improve posture, and move with more ease and confidence.' },
                        { title: 'Mental Clarity', description: 'Reduce stress, sharpen focus, and calm the mind through mindful movement and breathwork.' },
                        { title: 'Emotional Balance', description: 'Release tension, manage emotions, and create harmony between body and spirit.' },
                        { title: 'Community Connection', description: 'Join a welcoming space where like-minded individuals grow and thrive together.' }
                      ]
                  ).map((card, idx) => (
                    <div key={idx} style={{ border: '1px solid #E7E5E4', borderRadius: '10px', padding: '14px', backgroundColor: '#FAFAF9' }}>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#B45309', display: 'block', marginBottom: '6px' }}>Benefit Card #{idx + 1}</span>
                      <div style={{ marginBottom: '8px' }}>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#57534E', marginBottom: '4px' }}>Card Title</label>
                        <input
                          type="text"
                          value={card.title}
                          onChange={(e) => {
                            const newCards = [...(config.classesPageConfig?.giftCards || [
                              { title: 'Physical Strength & Flexibility', description: 'Build endurance, improve posture, and move with more ease and confidence.' },
                              { title: 'Mental Clarity', description: 'Reduce stress, sharpen focus, and calm the mind through mindful movement and breathwork.' },
                              { title: 'Emotional Balance', description: 'Release tension, manage emotions, and create harmony between body and spirit.' },
                              { title: 'Community Connection', description: 'Join a welcoming space where like-minded individuals grow and thrive together.' }
                            ])];
                            newCards[idx] = { ...newCards[idx], title: e.target.value };
                            setConfig({
                              ...config,
                              classesPageConfig: {
                                ...config.classesPageConfig,
                                topTitle: config.classesPageConfig?.topTitle || 'Explore Our',
                                topTitleItalic: config.classesPageConfig?.topTitleItalic || 'Classes',
                                topSuffix: config.classesPageConfig?.topSuffix || '',
                                topSubtitle: config.classesPageConfig?.topSubtitle || '',
                                idealTitle: config.classesPageConfig?.idealTitle || 'Discover Your',
                                idealTitleItalic: config.classesPageConfig?.idealTitleItalic || 'Ideal',
                                idealSuffix: config.classesPageConfig?.idealSuffix || 'Yog Practice',
                                idealSubtitle: config.classesPageConfig?.idealSubtitle || '',
                                giftTitle: config.classesPageConfig?.giftTitle || 'The',
                                giftTitleItalic: config.classesPageConfig?.giftTitleItalic || 'Gift',
                                giftSuffix: config.classesPageConfig?.giftSuffix || 'of Yoga',
                                giftSubtitle: config.classesPageConfig?.giftSubtitle || "Yoga is more than a physical practice, it's a path toward wellness, balance, and inner peace",
                                giftCards: newCards
                              }
                            });
                          }}
                          style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #D6D3D1', fontSize: '13px' }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#57534E', marginBottom: '4px' }}>Card Description</label>
                        <textarea
                          rows={2}
                          value={card.description}
                          onChange={(e) => {
                            const newCards = [...(config.classesPageConfig?.giftCards || [
                              { title: 'Physical Strength & Flexibility', description: 'Build endurance, improve posture, and move with more ease and confidence.' },
                              { title: 'Mental Clarity', description: 'Reduce stress, sharpen focus, and calm the mind through mindful movement and breathwork.' },
                              { title: 'Emotional Balance', description: 'Release tension, manage emotions, and create harmony between body and spirit.' },
                              { title: 'Community Connection', description: 'Join a welcoming space where like-minded individuals grow and thrive together.' }
                            ])];
                            newCards[idx] = { ...newCards[idx], description: e.target.value };
                            setConfig({
                              ...config,
                              classesPageConfig: {
                                ...config.classesPageConfig,
                                topTitle: config.classesPageConfig?.topTitle || 'Explore Our',
                                topTitleItalic: config.classesPageConfig?.topTitleItalic || 'Classes',
                                topSuffix: config.classesPageConfig?.topSuffix || '',
                                topSubtitle: config.classesPageConfig?.topSubtitle || '',
                                idealTitle: config.classesPageConfig?.idealTitle || 'Discover Your',
                                idealTitleItalic: config.classesPageConfig?.idealTitleItalic || 'Ideal',
                                idealSuffix: config.classesPageConfig?.idealSuffix || 'Yog Practice',
                                idealSubtitle: config.classesPageConfig?.idealSubtitle || '',
                                giftTitle: config.classesPageConfig?.giftTitle || 'The',
                                giftTitleItalic: config.classesPageConfig?.giftTitleItalic || 'Gift',
                                giftSuffix: config.classesPageConfig?.giftSuffix || 'of Yoga',
                                giftSubtitle: config.classesPageConfig?.giftSubtitle || "Yoga is more than a physical practice, it's a path toward wellness, balance, and inner peace",
                                giftCards: newCards
                              }
                            });
                          }}
                          style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #D6D3D1', fontSize: '13px' }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 4: Featured Programs & Events (API Event Selection with Ticks) */}
              <div style={{ border: '1px solid #E7E5E4', borderRadius: '14px', padding: '22px', backgroundColor: '#FFFFFF' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ backgroundColor: '#FEF3C7', color: '#B45309', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 700 }}>
                      Section 4
                    </span>
                    <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1C1917', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Ticket className="w-4 h-4 text-amber-700" /> Featured Events Slider (API Events Selection)
                    </h3>
                  </div>

                  <span style={{ fontSize: '12px', color: '#B45309', fontWeight: 600, backgroundColor: '#FEF3C7', padding: '4px 10px', borderRadius: '6px' }}>
                    {allEvents.filter((ev) => isEventEnabled(String(ev.id))).length} / {allEvents.length} Events Selected
                  </span>
                </div>

                <p style={{ fontSize: '13.5px', color: '#78716C', margin: '0 0 16px 0' }}>
                  Select (tick) which live events from the database API should be displayed in the Home Page slider.
                </p>

                {isLoadingEvents ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '20px', color: '#78716C' }}>
                    <Loader2 className="w-5 h-5 animate-spin" /> Loading API events list...
                  </div>
                ) : allEvents.length === 0 ? (
                  <div style={{ padding: '16px', backgroundColor: '#FAFAF9', borderRadius: '8px', color: '#78716C', fontSize: '13px' }}>
                    No events returned from API. Default promotional events will be shown.
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '14px' }}>
                    {allEvents.map((ev) => {
                      const evIdStr = String(ev.id);
                      const enabled = isEventEnabled(evIdStr);
                      return (
                        <div
                          key={evIdStr}
                          onClick={() => handleToggleEventOnHome(evIdStr)}
                          style={{
                            border: enabled ? '1.5px solid #B45309' : '1px solid #E7E5E4',
                            backgroundColor: enabled ? '#FEF3C7' : '#FAFAF9',
                            borderRadius: '12px',
                            padding: '14px',
                            cursor: 'pointer',
                            display: 'flex',
                            gap: '12px',
                            alignItems: 'flex-start',
                            transition: 'all 0.2s ease',
                            boxShadow: enabled ? '0 2px 8px rgba(180, 83, 9, 0.1)' : 'none'
                          }}
                        >
                          <div style={{
                            width: '22px',
                            height: '22px',
                            borderRadius: '6px',
                            backgroundColor: enabled ? '#B45309' : '#D6D3D1',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#FFFFFF',
                            flexShrink: 0,
                            marginTop: '2px'
                          }}>
                            {enabled && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </div>

                          <div style={{ flexGrow: 1 }}>
                            <div style={{ fontSize: '14px', fontWeight: 700, color: enabled ? '#78350F' : '#292524', marginBottom: '4px' }}>
                              {ev.title || ev.name}
                            </div>
                            <div style={{ fontSize: '12px', color: '#78716C' }}>
                              📅 {ev.date || 'Upcoming'} • 📍 {ev.location || 'Sanctuary'}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* ════════════════════ PAGE: ABOUT ════════════════════ */}
          {selectedPage === 'about' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>

              {/* Section 1: Hero Banner (Pragya Yog School) */}
              <div style={{ border: '1px solid #E7E5E4', borderRadius: '14px', padding: '22px', backgroundColor: '#FFFFFF' }}>
                <span style={{ backgroundColor: '#FEF3C7', color: '#B45309', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 700 }}>
                  Section 1
                </span>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1C1917', margin: '8px 0 16px 0' }}>
                  Pragya Yog School Hero Banner
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#44403C', marginBottom: '6px' }}>Title Prefix</label>
                    <input
                      type="text"
                      value={config.aboutPageConfig?.topTitle || 'Pragya'}
                      onChange={(e) => setConfig({
                        ...config,
                        aboutPageConfig: {
                          ...config.aboutPageConfig,
                          topTitle: e.target.value,
                          topTitleItalic: config.aboutPageConfig?.topTitleItalic || 'Yog School',
                          topSuffix: config.aboutPageConfig?.topSuffix || '',
                          topSubtitle: config.aboutPageConfig?.topSubtitle || '',
                          aboutTitle: config.aboutPageConfig?.aboutTitle || '',
                          aboutDesc: config.aboutPageConfig?.aboutDesc || '',
                          benefitTitle: config.aboutPageConfig?.benefitTitle || '',
                          benefits: config.aboutPageConfig?.benefits || [],
                          coreValuesBadge: config.aboutPageConfig?.coreValuesBadge || '',
                          coreValuesTitle: config.aboutPageConfig?.coreValuesTitle || '',
                          coreValueCards: config.aboutPageConfig?.coreValueCards || [],
                          pillarsBadge: config.aboutPageConfig?.pillarsBadge || '',
                          pillarsTitle: config.aboutPageConfig?.pillarsTitle || '',
                          pillarCards: config.aboutPageConfig?.pillarCards || []
                        }
                      })}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #D6D3D1', fontSize: '14px' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#44403C', marginBottom: '6px' }}>Title Italic Part</label>
                    <input
                      type="text"
                      value={config.aboutPageConfig?.topTitleItalic || 'Yog School'}
                      onChange={(e) => setConfig({
                        ...config,
                        aboutPageConfig: {
                          ...config.aboutPageConfig,
                          topTitle: config.aboutPageConfig?.topTitle || 'Pragya',
                          topTitleItalic: e.target.value,
                          topSuffix: config.aboutPageConfig?.topSuffix || '',
                          topSubtitle: config.aboutPageConfig?.topSubtitle || '',
                          aboutTitle: config.aboutPageConfig?.aboutTitle || '',
                          aboutDesc: config.aboutPageConfig?.aboutDesc || '',
                          benefitTitle: config.aboutPageConfig?.benefitTitle || '',
                          benefits: config.aboutPageConfig?.benefits || [],
                          coreValuesBadge: config.aboutPageConfig?.coreValuesBadge || '',
                          coreValuesTitle: config.aboutPageConfig?.coreValuesTitle || '',
                          coreValueCards: config.aboutPageConfig?.coreValueCards || [],
                          pillarsBadge: config.aboutPageConfig?.pillarsBadge || '',
                          pillarsTitle: config.aboutPageConfig?.pillarsTitle || '',
                          pillarCards: config.aboutPageConfig?.pillarCards || []
                        }
                      })}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #D6D3D1', fontSize: '14px' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#44403C', marginBottom: '6px' }}>Title Suffix</label>
                    <input
                      type="text"
                      placeholder="(Optional)"
                      value={config.aboutPageConfig?.topSuffix || ''}
                      onChange={(e) => setConfig({
                        ...config,
                        aboutPageConfig: {
                          ...config.aboutPageConfig,
                          topTitle: config.aboutPageConfig?.topTitle || 'Pragya',
                          topTitleItalic: config.aboutPageConfig?.topTitleItalic || 'Yog School',
                          topSuffix: e.target.value,
                          topSubtitle: config.aboutPageConfig?.topSubtitle || '',
                          aboutTitle: config.aboutPageConfig?.aboutTitle || '',
                          aboutDesc: config.aboutPageConfig?.aboutDesc || '',
                          benefitTitle: config.aboutPageConfig?.benefitTitle || '',
                          benefits: config.aboutPageConfig?.benefits || [],
                          coreValuesBadge: config.aboutPageConfig?.coreValuesBadge || '',
                          coreValuesTitle: config.aboutPageConfig?.coreValuesTitle || '',
                          coreValueCards: config.aboutPageConfig?.coreValueCards || [],
                          pillarsBadge: config.aboutPageConfig?.pillarsBadge || '',
                          pillarsTitle: config.aboutPageConfig?.pillarsTitle || '',
                          pillarCards: config.aboutPageConfig?.pillarCards || []
                        }
                      })}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #D6D3D1', fontSize: '14px' }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#44403C', marginBottom: '6px' }}>Subtitle Description</label>
                  <textarea
                    rows={2}
                    value={config.aboutPageConfig?.topSubtitle || 'A meditative practice of stillness and deep stretches designed to release tension, restore balance, and calm the mind.'}
                    onChange={(e) => setConfig({
                      ...config,
                      aboutPageConfig: {
                        ...config.aboutPageConfig,
                        topTitle: config.aboutPageConfig?.topTitle || 'Pragya',
                        topTitleItalic: config.aboutPageConfig?.topTitleItalic || 'Yog School',
                        topSuffix: config.aboutPageConfig?.topSuffix || '',
                        topSubtitle: e.target.value,
                        aboutTitle: config.aboutPageConfig?.aboutTitle || '',
                        aboutDesc: config.aboutPageConfig?.aboutDesc || '',
                        benefitTitle: config.aboutPageConfig?.benefitTitle || '',
                        benefits: config.aboutPageConfig?.benefits || [],
                        coreValuesBadge: config.aboutPageConfig?.coreValuesBadge || '',
                        coreValuesTitle: config.aboutPageConfig?.coreValuesTitle || '',
                        coreValueCards: config.aboutPageConfig?.coreValueCards || [],
                        pillarsBadge: config.aboutPageConfig?.pillarsBadge || '',
                        pillarsTitle: config.aboutPageConfig?.pillarsTitle || '',
                        pillarCards: config.aboutPageConfig?.pillarCards || []
                      }
                    })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #D6D3D1', fontSize: '14px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#44403C', marginBottom: '6px' }}>Hero Banner Image URL</label>
                  <input
                    type="text"
                    value={config.aboutPageConfig?.heroImage || '/about.png'}
                    onChange={(e) => setConfig({
                      ...config,
                      aboutPageConfig: {
                        ...config.aboutPageConfig,
                        topTitle: config.aboutPageConfig?.topTitle || 'Pragya',
                        topTitleItalic: config.aboutPageConfig?.topTitleItalic || 'Yog School',
                        topSuffix: config.aboutPageConfig?.topSuffix || '',
                        topSubtitle: config.aboutPageConfig?.topSubtitle || '',
                        heroImage: e.target.value,
                        aboutTitle: config.aboutPageConfig?.aboutTitle || '',
                        aboutDesc: config.aboutPageConfig?.aboutDesc || '',
                        benefitTitle: config.aboutPageConfig?.benefitTitle || '',
                        benefits: config.aboutPageConfig?.benefits || [],
                        coreValuesBadge: config.aboutPageConfig?.coreValuesBadge || '',
                        coreValuesTitle: config.aboutPageConfig?.coreValuesTitle || '',
                        coreValueCards: config.aboutPageConfig?.coreValueCards || [],
                        pillarsBadge: config.aboutPageConfig?.pillarsBadge || '',
                        pillarsTitle: config.aboutPageConfig?.pillarsTitle || '',
                        pillarCards: config.aboutPageConfig?.pillarCards || []
                      }
                    })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #D6D3D1', fontSize: '13px', fontFamily: 'monospace' }}
                  />
                </div>
              </div>

              {/* Section 2: About Pragya Yog School & Benefits */}
              <div style={{ border: '1px solid #E7E5E4', borderRadius: '14px', padding: '22px', backgroundColor: '#FFFFFF' }}>
                <span style={{ backgroundColor: '#FEF3C7', color: '#B45309', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 700 }}>
                  Section 2
                </span>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1C1917', margin: '8px 0 16px 0' }}>
                  About Pragya Yog School & Benefit List
                </h3>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#44403C', marginBottom: '6px' }}>About Section Title</label>
                  <input
                    type="text"
                    value={config.aboutPageConfig?.aboutTitle || 'About Pragya Yog School'}
                    onChange={(e) => setConfig({
                      ...config,
                      aboutPageConfig: {
                        ...config.aboutPageConfig,
                        topTitle: config.aboutPageConfig?.topTitle || 'Pragya',
                        topTitleItalic: config.aboutPageConfig?.topTitleItalic || 'Yog School',
                        topSuffix: config.aboutPageConfig?.topSuffix || '',
                        topSubtitle: config.aboutPageConfig?.topSubtitle || '',
                        aboutTitle: e.target.value,
                        aboutDesc: config.aboutPageConfig?.aboutDesc || '',
                        benefitTitle: config.aboutPageConfig?.benefitTitle || '',
                        benefits: config.aboutPageConfig?.benefits || [],
                        coreValuesBadge: config.aboutPageConfig?.coreValuesBadge || '',
                        coreValuesTitle: config.aboutPageConfig?.coreValuesTitle || '',
                        coreValueCards: config.aboutPageConfig?.coreValueCards || [],
                        pillarsBadge: config.aboutPageConfig?.pillarsBadge || '',
                        pillarsTitle: config.aboutPageConfig?.pillarsTitle || '',
                        pillarCards: config.aboutPageConfig?.pillarCards || []
                      }
                    })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #D6D3D1', fontSize: '14px' }}
                  />
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#44403C', marginBottom: '6px' }}>About Description Paragraph</label>
                  <textarea
                    rows={3}
                    value={config.aboutPageConfig?.aboutDesc || 'Pragya Yog School is a holistic sanctuary dedicated to traditional Hatha, Ashtanga, Yin Yoga, and therapeutic sound healing. Guided by ancient lineage and modern physiological science, our sanctuary empowers students to cultivate awareness, deepen their practice, and experience true mind-body harmony.'}
                    onChange={(e) => setConfig({
                      ...config,
                      aboutPageConfig: {
                        ...config.aboutPageConfig,
                        topTitle: config.aboutPageConfig?.topTitle || 'Pragya',
                        topTitleItalic: config.aboutPageConfig?.topTitleItalic || 'Yog School',
                        topSuffix: config.aboutPageConfig?.topSuffix || '',
                        topSubtitle: config.aboutPageConfig?.topSubtitle || '',
                        aboutTitle: config.aboutPageConfig?.aboutTitle || 'About Pragya Yog School',
                        aboutDesc: e.target.value,
                        benefitTitle: config.aboutPageConfig?.benefitTitle || '',
                        benefits: config.aboutPageConfig?.benefits || [],
                        coreValuesBadge: config.aboutPageConfig?.coreValuesBadge || '',
                        coreValuesTitle: config.aboutPageConfig?.coreValuesTitle || '',
                        coreValueCards: config.aboutPageConfig?.coreValueCards || [],
                        pillarsBadge: config.aboutPageConfig?.pillarsBadge || '',
                        pillarsTitle: config.aboutPageConfig?.pillarsTitle || '',
                        pillarCards: config.aboutPageConfig?.pillarCards || []
                      }
                    })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #D6D3D1', fontSize: '14px' }}
                  />
                </div>

                <div style={{ borderTop: '1px solid #E7E5E4', paddingTop: '16px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 700, color: '#1C1917', marginBottom: '10px' }}>Benefit Section Header</label>
                  <input
                    type="text"
                    value={config.aboutPageConfig?.benefitTitle || 'Benefit'}
                    onChange={(e) => setConfig({
                      ...config,
                      aboutPageConfig: {
                        ...config.aboutPageConfig,
                        topTitle: config.aboutPageConfig?.topTitle || 'Pragya',
                        topTitleItalic: config.aboutPageConfig?.topTitleItalic || 'Yog School',
                        topSuffix: config.aboutPageConfig?.topSuffix || '',
                        topSubtitle: config.aboutPageConfig?.topSubtitle || '',
                        aboutTitle: config.aboutPageConfig?.aboutTitle || 'About Pragya Yog School',
                        aboutDesc: config.aboutPageConfig?.aboutDesc || '',
                        benefitTitle: e.target.value,
                        benefits: config.aboutPageConfig?.benefits || [],
                        coreValuesBadge: config.aboutPageConfig?.coreValuesBadge || '',
                        coreValuesTitle: config.aboutPageConfig?.coreValuesTitle || '',
                        coreValueCards: config.aboutPageConfig?.coreValueCards || [],
                        pillarsBadge: config.aboutPageConfig?.pillarsBadge || '',
                        pillarsTitle: config.aboutPageConfig?.pillarsTitle || '',
                        pillarCards: config.aboutPageConfig?.pillarCards || []
                      }
                    })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #D6D3D1', fontSize: '14px', marginBottom: '16px' }}
                  />

                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#44403C', marginBottom: '10px' }}>5 Key Benefit Bullet Points</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {(config.aboutPageConfig?.benefits && config.aboutPageConfig.benefits.length === 5
                      ? config.aboutPageConfig.benefits
                      : [
                          'Enhances flexibility, strength, and joint mobility',
                          'Improves circulation and subtle energy flow',
                          'Promotes deep cellular relaxation and stress relief',
                          'Increases mindfulness and bodily self-awareness',
                          'Balances the nervous system for better sleep and calmness'
                        ]
                    ).map((benefitItem, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '12px', fontWeight: 700, color: '#944426', minWidth: '20px' }}>#{idx + 1}</span>
                        <input
                          type="text"
                          value={benefitItem}
                          onChange={(e) => {
                            const newBenefits = [...(config.aboutPageConfig?.benefits || [
                              'Enhances flexibility, strength, and joint mobility',
                              'Improves circulation and subtle energy flow',
                              'Promotes deep cellular relaxation and stress relief',
                              'Increases mindfulness and bodily self-awareness',
                              'Balances the nervous system for better sleep and calmness'
                            ])];
                            newBenefits[idx] = e.target.value;
                            setConfig({
                              ...config,
                              aboutPageConfig: {
                                ...config.aboutPageConfig,
                                topTitle: config.aboutPageConfig?.topTitle || 'Pragya',
                                topTitleItalic: config.aboutPageConfig?.topTitleItalic || 'Yog School',
                                topSuffix: config.aboutPageConfig?.topSuffix || '',
                                topSubtitle: config.aboutPageConfig?.topSubtitle || '',
                                aboutTitle: config.aboutPageConfig?.aboutTitle || 'About Pragya Yog School',
                                aboutDesc: config.aboutPageConfig?.aboutDesc || '',
                                benefitTitle: config.aboutPageConfig?.benefitTitle || 'Benefit',
                                benefits: newBenefits,
                                coreValuesBadge: config.aboutPageConfig?.coreValuesBadge || '',
                                coreValuesTitle: config.aboutPageConfig?.coreValuesTitle || '',
                                coreValueCards: config.aboutPageConfig?.coreValueCards || [],
                                pillarsBadge: config.aboutPageConfig?.pillarsBadge || '',
                                pillarsTitle: config.aboutPageConfig?.pillarsTitle || '',
                                pillarCards: config.aboutPageConfig?.pillarCards || []
                              }
                            });
                          }}
                          style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #D6D3D1', fontSize: '13.5px' }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Section 3: Core Values (Guided by Wisdom & Purpose) */}
              <div style={{ border: '1px solid #E7E5E4', borderRadius: '14px', padding: '22px', backgroundColor: '#FFFFFF' }}>
                <span style={{ backgroundColor: '#FEF3C7', color: '#B45309', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 700 }}>
                  Section 3
                </span>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1C1917', margin: '8px 0 16px 0' }}>
                  Core Values Section (Guided by Wisdom & Purpose)
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#44403C', marginBottom: '6px' }}>Section Badge Label</label>
                    <input
                      type="text"
                      value={config.aboutPageConfig?.coreValuesBadge || '— CORE VALUES —'}
                      onChange={(e) => setConfig({
                        ...config,
                        aboutPageConfig: {
                          ...config.aboutPageConfig,
                          topTitle: config.aboutPageConfig?.topTitle || 'Pragya',
                          topTitleItalic: config.aboutPageConfig?.topTitleItalic || 'Yog School',
                          topSuffix: config.aboutPageConfig?.topSuffix || '',
                          topSubtitle: config.aboutPageConfig?.topSubtitle || '',
                          aboutTitle: config.aboutPageConfig?.aboutTitle || 'About Pragya Yog School',
                          aboutDesc: config.aboutPageConfig?.aboutDesc || '',
                          benefitTitle: config.aboutPageConfig?.benefitTitle || 'Benefit',
                          benefits: config.aboutPageConfig?.benefits || [],
                          coreValuesBadge: e.target.value,
                          coreValuesTitle: config.aboutPageConfig?.coreValuesTitle || 'Guided by Wisdom & Purpose',
                          coreValueCards: config.aboutPageConfig?.coreValueCards || [],
                          pillarsBadge: config.aboutPageConfig?.pillarsBadge || '',
                          pillarsTitle: config.aboutPageConfig?.pillarsTitle || '',
                          pillarCards: config.aboutPageConfig?.pillarCards || []
                        }
                      })}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #D6D3D1', fontSize: '14px' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#44403C', marginBottom: '6px' }}>Section Main Heading</label>
                    <input
                      type="text"
                      value={config.aboutPageConfig?.coreValuesTitle || 'Guided by Wisdom & Purpose'}
                      onChange={(e) => setConfig({
                        ...config,
                        aboutPageConfig: {
                          ...config.aboutPageConfig,
                          topTitle: config.aboutPageConfig?.topTitle || 'Pragya',
                          topTitleItalic: config.aboutPageConfig?.topTitleItalic || 'Yog School',
                          topSuffix: config.aboutPageConfig?.topSuffix || '',
                          topSubtitle: config.aboutPageConfig?.topSubtitle || '',
                          aboutTitle: config.aboutPageConfig?.aboutTitle || 'About Pragya Yog School',
                          aboutDesc: config.aboutPageConfig?.aboutDesc || '',
                          benefitTitle: config.aboutPageConfig?.benefitTitle || 'Benefit',
                          benefits: config.aboutPageConfig?.benefits || [],
                          coreValuesBadge: config.aboutPageConfig?.coreValuesBadge || '— CORE VALUES —',
                          coreValuesTitle: e.target.value,
                          coreValueCards: config.aboutPageConfig?.coreValueCards || [],
                          pillarsBadge: config.aboutPageConfig?.pillarsBadge || '',
                          pillarsTitle: config.aboutPageConfig?.pillarsTitle || '',
                          pillarCards: config.aboutPageConfig?.pillarCards || []
                        }
                      })}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #D6D3D1', fontSize: '14px' }}
                    />
                  </div>
                </div>

                <label style={{ display: 'block', fontSize: '14px', fontWeight: 700, color: '#1C1917', marginBottom: '12px' }}>4 Core Value Cards</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  {(config.aboutPageConfig?.coreValueCards && config.aboutPageConfig.coreValueCards.length === 4
                    ? config.aboutPageConfig.coreValueCards
                    : [
                        { title: 'Holistic Well-being', description: 'Embracing the ancient wisdom and practices of yog to nurture holistic well-being.' },
                        { title: 'Harmony', description: 'Bridging mind, body, and spirit for a harmonious and balanced life.' },
                        { title: 'Self-Discovery', description: 'Encouraging self-exploration and mindfulness to awaken your true potential.' },
                        { title: 'Continuous Growth', description: 'Fostering continuous learning and personal development through yogic practices.' }
                      ]
                  ).map((card, idx) => (
                    <div key={idx} style={{ border: '1px solid #E7E5E4', borderRadius: '10px', padding: '14px', backgroundColor: '#FAFAF9' }}>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#944426', display: 'block', marginBottom: '6px' }}>Card #{idx + 1}</span>
                      <div style={{ marginBottom: '8px' }}>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#57534E', marginBottom: '4px' }}>Card Title</label>
                        <input
                          type="text"
                          value={card.title}
                          onChange={(e) => {
                            const newCards = [...(config.aboutPageConfig?.coreValueCards || [
                              { title: 'Holistic Well-being', description: 'Embracing the ancient wisdom and practices of yog to nurture holistic well-being.' },
                              { title: 'Harmony', description: 'Bridging mind, body, and spirit for a harmonious and balanced life.' },
                              { title: 'Self-Discovery', description: 'Encouraging self-exploration and mindfulness to awaken your true potential.' },
                              { title: 'Continuous Growth', description: 'Fostering continuous learning and personal development through yogic practices.' }
                            ])];
                            newCards[idx] = { ...newCards[idx], title: e.target.value };
                            setConfig({
                              ...config,
                              aboutPageConfig: {
                                ...config.aboutPageConfig,
                                topTitle: config.aboutPageConfig?.topTitle || 'Pragya',
                                topTitleItalic: config.aboutPageConfig?.topTitleItalic || 'Yog School',
                                topSuffix: config.aboutPageConfig?.topSuffix || '',
                                topSubtitle: config.aboutPageConfig?.topSubtitle || '',
                                aboutTitle: config.aboutPageConfig?.aboutTitle || 'About Pragya Yog School',
                                aboutDesc: config.aboutPageConfig?.aboutDesc || '',
                                benefitTitle: config.aboutPageConfig?.benefitTitle || 'Benefit',
                                benefits: config.aboutPageConfig?.benefits || [],
                                coreValuesBadge: config.aboutPageConfig?.coreValuesBadge || '— CORE VALUES —',
                                coreValuesTitle: config.aboutPageConfig?.coreValuesTitle || 'Guided by Wisdom & Purpose',
                                coreValueCards: newCards,
                                pillarsBadge: config.aboutPageConfig?.pillarsBadge || '',
                                pillarsTitle: config.aboutPageConfig?.pillarsTitle || '',
                                pillarCards: config.aboutPageConfig?.pillarCards || []
                              }
                            });
                          }}
                          style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #D6D3D1', fontSize: '13px' }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#57534E', marginBottom: '4px' }}>Card Description</label>
                        <textarea
                          rows={2}
                          value={card.description}
                          onChange={(e) => {
                            const newCards = [...(config.aboutPageConfig?.coreValueCards || [
                              { title: 'Holistic Well-being', description: 'Embracing the ancient wisdom and practices of yog to nurture holistic well-being.' },
                              { title: 'Harmony', description: 'Bridging mind, body, and spirit for a harmonious and balanced life.' },
                              { title: 'Self-Discovery', description: 'Encouraging self-exploration and mindfulness to awaken your true potential.' },
                              { title: 'Continuous Growth', description: 'Fostering continuous learning and personal development through yogic practices.' }
                            ])];
                            newCards[idx] = { ...newCards[idx], description: e.target.value };
                            setConfig({
                              ...config,
                              aboutPageConfig: {
                                ...config.aboutPageConfig,
                                topTitle: config.aboutPageConfig?.topTitle || 'Pragya',
                                topTitleItalic: config.aboutPageConfig?.topTitleItalic || 'Yog School',
                                topSuffix: config.aboutPageConfig?.topSuffix || '',
                                topSubtitle: config.aboutPageConfig?.topSubtitle || '',
                                aboutTitle: config.aboutPageConfig?.aboutTitle || 'About Pragya Yog School',
                                aboutDesc: config.aboutPageConfig?.aboutDesc || '',
                                benefitTitle: config.aboutPageConfig?.benefitTitle || 'Benefit',
                                benefits: config.aboutPageConfig?.benefits || [],
                                coreValuesBadge: config.aboutPageConfig?.coreValuesBadge || '— CORE VALUES —',
                                coreValuesTitle: config.aboutPageConfig?.coreValuesTitle || 'Guided by Wisdom & Purpose',
                                coreValueCards: newCards,
                                pillarsBadge: config.aboutPageConfig?.pillarsBadge || '',
                                pillarsTitle: config.aboutPageConfig?.pillarsTitle || '',
                                pillarCards: config.aboutPageConfig?.pillarCards || []
                              }
                            });
                          }}
                          style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #D6D3D1', fontSize: '13px' }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 4: Pillars of Pragya Sanctuary */}
              <div style={{ border: '1px solid #E7E5E4', borderRadius: '14px', padding: '22px', backgroundColor: '#FFFFFF' }}>
                <span style={{ backgroundColor: '#FEF3C7', color: '#B45309', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 700 }}>
                  Section 4
                </span>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1C1917', margin: '8px 0 16px 0' }}>
                  Pillars of Pragya Sanctuary Section
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#44403C', marginBottom: '6px' }}>Section Badge Label</label>
                    <input
                      type="text"
                      value={config.aboutPageConfig?.pillarsBadge || '— OUR FOUNDATION —'}
                      onChange={(e) => setConfig({
                        ...config,
                        aboutPageConfig: {
                          ...config.aboutPageConfig,
                          topTitle: config.aboutPageConfig?.topTitle || 'Pragya',
                          topTitleItalic: config.aboutPageConfig?.topTitleItalic || 'Yog School',
                          topSuffix: config.aboutPageConfig?.topSuffix || '',
                          topSubtitle: config.aboutPageConfig?.topSubtitle || '',
                          aboutTitle: config.aboutPageConfig?.aboutTitle || 'About Pragya Yog School',
                          aboutDesc: config.aboutPageConfig?.aboutDesc || '',
                          benefitTitle: config.aboutPageConfig?.benefitTitle || 'Benefit',
                          benefits: config.aboutPageConfig?.benefits || [],
                          coreValuesBadge: config.aboutPageConfig?.coreValuesBadge || '— CORE VALUES —',
                          coreValuesTitle: config.aboutPageConfig?.coreValuesTitle || 'Guided by Wisdom & Purpose',
                          coreValueCards: config.aboutPageConfig?.coreValueCards || [],
                          pillarsBadge: e.target.value,
                          pillarsTitle: config.aboutPageConfig?.pillarsTitle || 'Pillars of Pragya Sanctuary',
                          pillarCards: config.aboutPageConfig?.pillarCards || []
                        }
                      })}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #D6D3D1', fontSize: '14px' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#44403C', marginBottom: '6px' }}>Section Main Heading</label>
                    <input
                      type="text"
                      value={config.aboutPageConfig?.pillarsTitle || 'Pillars of Pragya Sanctuary'}
                      onChange={(e) => setConfig({
                        ...config,
                        aboutPageConfig: {
                          ...config.aboutPageConfig,
                          topTitle: config.aboutPageConfig?.topTitle || 'Pragya',
                          topTitleItalic: config.aboutPageConfig?.topTitleItalic || 'Yog School',
                          topSuffix: config.aboutPageConfig?.topSuffix || '',
                          topSubtitle: config.aboutPageConfig?.topSubtitle || '',
                          aboutTitle: config.aboutPageConfig?.aboutTitle || 'About Pragya Yog School',
                          aboutDesc: config.aboutPageConfig?.aboutDesc || '',
                          benefitTitle: config.aboutPageConfig?.benefitTitle || 'Benefit',
                          benefits: config.aboutPageConfig?.benefits || [],
                          coreValuesBadge: config.aboutPageConfig?.coreValuesBadge || '— CORE VALUES —',
                          coreValuesTitle: config.aboutPageConfig?.coreValuesTitle || 'Guided by Wisdom & Purpose',
                          coreValueCards: config.aboutPageConfig?.coreValueCards || [],
                          pillarsBadge: config.aboutPageConfig?.pillarsBadge || '— OUR FOUNDATION —',
                          pillarsTitle: e.target.value,
                          pillarCards: config.aboutPageConfig?.pillarCards || []
                        }
                      })}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #D6D3D1', fontSize: '14px' }}
                    />
                  </div>
                </div>

                <label style={{ display: 'block', fontSize: '14px', fontWeight: 700, color: '#1C1917', marginBottom: '12px' }}>6 Pillar Cards</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  {(config.aboutPageConfig?.pillarCards && config.aboutPageConfig.pillarCards.length === 6
                    ? config.aboutPageConfig.pillarCards
                    : [
                        { tag: 'BODY & MIND ACCURACY', title: 'Biomechanical Precision', description: 'Every posture is taught with deep anatomical awareness and alignment...' },
                        { tag: 'ANCIENT LINEAGE', title: 'Traditional Roots', description: 'We preserve the sacred integrity of traditional Hatha & Ashtanga Vinyasa...' },
                        { tag: 'AUTONOMIC HEALING', title: 'Nervous System Regulation', description: 'Integrating targeted pranayama breathwork and restorative sound baths...' },
                        { tag: 'COMMUNITY & GUIDANCE', title: 'Personalized Mentorship', description: 'Small class sizes ensure every practitioner receives individualized feedback...' },
                        { tag: 'PURPOSE & PASSION', title: 'Our Mission', description: 'To guide you to embrace conscious living through the transformative power...' },
                        { tag: 'SCIENCE MEETS SPIRITUALITY', title: 'Our Goal', description: 'We aim at being the most comprehensive and authentic yog institute...' }
                      ]
                  ).map((pillar, idx) => (
                    <div key={idx} style={{ border: '1px solid #E7E5E4', borderRadius: '10px', padding: '14px', backgroundColor: '#FAFAF9' }}>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#00381F', display: 'block', marginBottom: '6px' }}>Pillar #{idx + 1}</span>
                      <div style={{ marginBottom: '8px' }}>
                        <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: '#57534E', marginBottom: '3px' }}>Tag / Category</label>
                        <input
                          type="text"
                          value={pillar.tag}
                          onChange={(e) => {
                            const newPillars = [...(config.aboutPageConfig?.pillarCards || [
                              { tag: 'BODY & MIND ACCURACY', title: 'Biomechanical Precision', description: 'Every posture is taught with deep anatomical awareness and alignment...' },
                              { tag: 'ANCIENT LINEAGE', title: 'Traditional Roots', description: 'We preserve the sacred integrity of traditional Hatha & Ashtanga Vinyasa...' },
                              { tag: 'AUTONOMIC HEALING', title: 'Nervous System Regulation', description: 'Integrating targeted pranayama breathwork and restorative sound baths...' },
                              { tag: 'COMMUNITY & GUIDANCE', title: 'Personalized Mentorship', description: 'Small class sizes ensure every practitioner receives individualized feedback...' },
                              { tag: 'PURPOSE & PASSION', title: 'Our Mission', description: 'To guide you to embrace conscious living through the transformative power...' },
                              { tag: 'SCIENCE MEETS SPIRITUALITY', title: 'Our Goal', description: 'We aim at being the most comprehensive and authentic yog institute...' }
                            ])];
                            newPillars[idx] = { ...newPillars[idx], tag: e.target.value };
                            setConfig({
                              ...config,
                              aboutPageConfig: {
                                ...config.aboutPageConfig,
                                topTitle: config.aboutPageConfig?.topTitle || 'Pragya',
                                topTitleItalic: config.aboutPageConfig?.topTitleItalic || 'Yog School',
                                topSuffix: config.aboutPageConfig?.topSuffix || '',
                                topSubtitle: config.aboutPageConfig?.topSubtitle || '',
                                aboutTitle: config.aboutPageConfig?.aboutTitle || 'About Pragya Yog School',
                                aboutDesc: config.aboutPageConfig?.aboutDesc || '',
                                benefitTitle: config.aboutPageConfig?.benefitTitle || 'Benefit',
                                benefits: config.aboutPageConfig?.benefits || [],
                                coreValuesBadge: config.aboutPageConfig?.coreValuesBadge || '— CORE VALUES —',
                                coreValuesTitle: config.aboutPageConfig?.coreValuesTitle || 'Guided by Wisdom & Purpose',
                                coreValueCards: config.aboutPageConfig?.coreValueCards || [],
                                pillarsBadge: config.aboutPageConfig?.pillarsBadge || '— OUR FOUNDATION —',
                                pillarsTitle: config.aboutPageConfig?.pillarsTitle || 'Pillars of Pragya Sanctuary',
                                pillarCards: newPillars
                              }
                            });
                          }}
                          style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid #D6D3D1', fontSize: '12px' }}
                        />
                      </div>

                      <div style={{ marginBottom: '8px' }}>
                        <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: '#57534E', marginBottom: '3px' }}>Pillar Title</label>
                        <input
                          type="text"
                          value={pillar.title}
                          onChange={(e) => {
                            const newPillars = [...(config.aboutPageConfig?.pillarCards || [
                              { tag: 'BODY & MIND ACCURACY', title: 'Biomechanical Precision', description: 'Every posture is taught with deep anatomical awareness and alignment...' },
                              { tag: 'ANCIENT LINEAGE', title: 'Traditional Roots', description: 'We preserve the sacred integrity of traditional Hatha & Ashtanga Vinyasa...' },
                              { tag: 'AUTONOMIC HEALING', title: 'Nervous System Regulation', description: 'Integrating targeted pranayama breathwork and restorative sound baths...' },
                              { tag: 'COMMUNITY & GUIDANCE', title: 'Personalized Mentorship', description: 'Small class sizes ensure every practitioner receives individualized feedback...' },
                              { tag: 'PURPOSE & PASSION', title: 'Our Mission', description: 'To guide you to embrace conscious living through the transformative power...' },
                              { tag: 'SCIENCE MEETS SPIRITUALITY', title: 'Our Goal', description: 'We aim at being the most comprehensive and authentic yog institute...' }
                            ])];
                            newPillars[idx] = { ...newPillars[idx], title: e.target.value };
                            setConfig({
                              ...config,
                              aboutPageConfig: {
                                ...config.aboutPageConfig,
                                topTitle: config.aboutPageConfig?.topTitle || 'Pragya',
                                topTitleItalic: config.aboutPageConfig?.topTitleItalic || 'Yog School',
                                topSuffix: config.aboutPageConfig?.topSuffix || '',
                                topSubtitle: config.aboutPageConfig?.topSubtitle || '',
                                aboutTitle: config.aboutPageConfig?.aboutTitle || 'About Pragya Yog School',
                                aboutDesc: config.aboutPageConfig?.aboutDesc || '',
                                benefitTitle: config.aboutPageConfig?.benefitTitle || 'Benefit',
                                benefits: config.aboutPageConfig?.benefits || [],
                                coreValuesBadge: config.aboutPageConfig?.coreValuesBadge || '— CORE VALUES —',
                                coreValuesTitle: config.aboutPageConfig?.coreValuesTitle || 'Guided by Wisdom & Purpose',
                                coreValueCards: config.aboutPageConfig?.coreValueCards || [],
                                pillarsBadge: config.aboutPageConfig?.pillarsBadge || '— OUR FOUNDATION —',
                                pillarsTitle: config.aboutPageConfig?.pillarsTitle || 'Pillars of Pragya Sanctuary',
                                pillarCards: newPillars
                              }
                            });
                          }}
                          style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid #D6D3D1', fontSize: '12px' }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: '#57534E', marginBottom: '3px' }}>Description</label>
                        <textarea
                          rows={2}
                          value={pillar.description}
                          onChange={(e) => {
                            const newPillars = [...(config.aboutPageConfig?.pillarCards || [
                              { tag: 'BODY & MIND ACCURACY', title: 'Biomechanical Precision', description: 'Every posture is taught with deep anatomical awareness and alignment...' },
                              { tag: 'ANCIENT LINEAGE', title: 'Traditional Roots', description: 'We preserve the sacred integrity of traditional Hatha & Ashtanga Vinyasa...' },
                              { tag: 'AUTONOMIC HEALING', title: 'Nervous System Regulation', description: 'Integrating targeted pranayama breathwork and restorative sound baths...' },
                              { tag: 'COMMUNITY & GUIDANCE', title: 'Personalized Mentorship', description: 'Small class sizes ensure every practitioner receives individualized feedback...' },
                              { tag: 'PURPOSE & PASSION', title: 'Our Mission', description: 'To guide you to embrace conscious living through the transformative power...' },
                              { tag: 'SCIENCE MEETS SPIRITUALITY', title: 'Our Goal', description: 'We aim at being the most comprehensive and authentic yog institute...' }
                            ])];
                            newPillars[idx] = { ...newPillars[idx], description: e.target.value };
                            setConfig({
                              ...config,
                              aboutPageConfig: {
                                ...config.aboutPageConfig,
                                topTitle: config.aboutPageConfig?.topTitle || 'Pragya',
                                topTitleItalic: config.aboutPageConfig?.topTitleItalic || 'Yog School',
                                topSuffix: config.aboutPageConfig?.topSuffix || '',
                                topSubtitle: config.aboutPageConfig?.topSubtitle || '',
                                aboutTitle: config.aboutPageConfig?.aboutTitle || 'About Pragya Yog School',
                                aboutDesc: config.aboutPageConfig?.aboutDesc || '',
                                benefitTitle: config.aboutPageConfig?.benefitTitle || 'Benefit',
                                benefits: config.aboutPageConfig?.benefits || [],
                                coreValuesBadge: config.aboutPageConfig?.coreValuesBadge || '— CORE VALUES —',
                                coreValuesTitle: config.aboutPageConfig?.coreValuesTitle || 'Guided by Wisdom & Purpose',
                                coreValueCards: config.aboutPageConfig?.coreValueCards || [],
                                pillarsBadge: config.aboutPageConfig?.pillarsBadge || '— OUR FOUNDATION —',
                                pillarsTitle: config.aboutPageConfig?.pillarsTitle || 'Pillars of Pragya Sanctuary',
                                pillarCards: newPillars
                              }
                            });
                          }}
                          style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid #D6D3D1', fontSize: '12px' }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 5: API Notice for Master Instructors & Sanctuary Locations */}
              <div style={{ border: '1.5px dashed #D6D3D1', borderRadius: '14px', padding: '24px', backgroundColor: '#FAFAF9', textAlign: 'center' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', borderRadius: '20px', backgroundColor: '#E0F2FE', color: '#0369A1', fontSize: '12px', fontWeight: 700, marginBottom: '10px' }}>
                  ⚡ API-Driven Content
                </div>
                <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#1C1917', margin: '0 0 6px 0' }}>
                  Master Yogic Instructors & Sanctuary Locations
                </h4>
                <p style={{ fontSize: '13.5px', color: '#78716C', margin: '0 auto', maxWidth: '560px' }}>
                  The teacher profiles and sanctuary location gallery cards are dynamically managed via the database API. To create or manage teacher profiles, use the <strong>Teachers Manager</strong> in the admin sidebar.
                </p>
              </div>

            </div>
          )}

          {/* ════════════════════ PAGE: SHOP ════════════════════ */}
          {selectedPage === 'shop' && (
            shopSubView === 'add-product' ? (
              <AddProductPage
                initialData={editingProduct}
                onBack={() => {
                  setEditingProduct(null);
                  setShopSubView('list');
                }}
                onProductSaved={(updatedItems) => {
                  setMerchandiseItems(updatedItems);
                  setEditingProduct(null);
                  setShopSubView('list');
                }}
              />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>

              <div style={{ border: '1px solid #E7E5E4', borderRadius: '14px', padding: '22px', backgroundColor: '#FFFFFF' }}>
                <span style={{ backgroundColor: '#FEF3C7', color: '#B45309', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 700 }}>
                  Section 1
                </span>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1C1917', margin: '8px 0 16px 0' }}>
                  Merchandise & Yogic Wear Hero Banner
                </h3>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#44403C', marginBottom: '6px' }}>Top Badge Label</label>
                  <input
                    type="text"
                    value={config.shopPageConfig?.badge || '— PRAGYA SANCTUARY STORE —'}
                    onChange={(e) => setConfig({
                      ...config,
                      shopPageConfig: {
                        ...config.shopPageConfig,
                        badge: e.target.value,
                        topTitle: config.shopPageConfig?.topTitle || 'Merchandise &',
                        topTitleItalic: config.shopPageConfig?.topTitleItalic || 'Yogic Wear',
                        topSuffix: config.shopPageConfig?.topSuffix || '',
                        topSubtitle: config.shopPageConfig?.topSubtitle || ''
                      }
                    })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #D6D3D1', fontSize: '14px' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#44403C', marginBottom: '6px' }}>Title Prefix</label>
                    <input
                      type="text"
                      value={config.shopPageConfig?.topTitle || 'Merchandise &'}
                      onChange={(e) => setConfig({
                        ...config,
                        shopPageConfig: {
                          ...config.shopPageConfig,
                          badge: config.shopPageConfig?.badge || '— PRAGYA SANCTUARY STORE —',
                          topTitle: e.target.value,
                          topTitleItalic: config.shopPageConfig?.topTitleItalic || 'Yogic Wear',
                          topSuffix: config.shopPageConfig?.topSuffix || '',
                          topSubtitle: config.shopPageConfig?.topSubtitle || ''
                        }
                      })}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #D6D3D1', fontSize: '14px' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#44403C', marginBottom: '6px' }}>Title Italic Part</label>
                    <input
                      type="text"
                      value={config.shopPageConfig?.topTitleItalic || 'Yogic Wear'}
                      onChange={(e) => setConfig({
                        ...config,
                        shopPageConfig: {
                          ...config.shopPageConfig,
                          badge: config.shopPageConfig?.badge || '— PRAGYA SANCTUARY STORE —',
                          topTitle: config.shopPageConfig?.topTitle || 'Merchandise &',
                          topTitleItalic: e.target.value,
                          topSuffix: config.shopPageConfig?.topSuffix || '',
                          topSubtitle: config.shopPageConfig?.topSubtitle || ''
                        }
                      })}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #D6D3D1', fontSize: '14px' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#44403C', marginBottom: '6px' }}>Title Suffix</label>
                    <input
                      type="text"
                      placeholder="(Optional)"
                      value={config.shopPageConfig?.topSuffix || ''}
                      onChange={(e) => setConfig({
                        ...config,
                        shopPageConfig: {
                          ...config.shopPageConfig,
                          badge: config.shopPageConfig?.badge || '— PRAGYA SANCTUARY STORE —',
                          topTitle: config.shopPageConfig?.topTitle || 'Merchandise &',
                          topTitleItalic: config.shopPageConfig?.topTitleItalic || 'Yogic Wear',
                          topSuffix: e.target.value,
                          topSubtitle: config.shopPageConfig?.topSubtitle || ''
                        }
                      })}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #D6D3D1', fontSize: '14px' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#44403C', marginBottom: '6px' }}>Subtitle Description</label>
                  <textarea
                    rows={2}
                    value={config.shopPageConfig?.topSubtitle || 'Explore our sanctuary products, organic cotton apparel, non-slip jute mats, and authentic handcrafted essentials for your daily practice.'}
                    onChange={(e) => setConfig({
                      ...config,
                      shopPageConfig: {
                        ...config.shopPageConfig,
                        badge: config.shopPageConfig?.badge || '— PRAGYA SANCTUARY STORE —',
                        topTitle: config.shopPageConfig?.topTitle || 'Merchandise &',
                        topTitleItalic: config.shopPageConfig?.topTitleItalic || 'Yogic Wear',
                        topSuffix: config.shopPageConfig?.topSuffix || '',
                        topSubtitle: e.target.value
                      }
                    })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #D6D3D1', fontSize: '14px' }}
                  />
                </div>
              </div>

              {/* Section 2: Product Detail Page & Store Policy Badges Settings */}
              <div style={{ border: '1px solid #E7E5E4', borderRadius: '14px', padding: '22px', backgroundColor: '#FFFFFF' }}>
                <span style={{ backgroundColor: '#FEF3C7', color: '#B45309', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 700 }}>
                  Storewide PDP Settings
                </span>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1C1917', margin: '8px 0 16px 0' }}>
                  Product Detail Page Policies & Trust Badges
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#44403C', marginBottom: '6px' }}>Default Store Currency</label>
                    <input
                      type="text"
                      placeholder="e.g. HK$, USD, INR"
                      value={config.shopPageConfig?.currency || 'HK$'}
                      onChange={(e) => setConfig({
                        ...config,
                        shopPageConfig: {
                          ...config.shopPageConfig,
                          badge: config.shopPageConfig?.badge || '— PRAGYA SANCTUARY STORE —',
                          topTitle: config.shopPageConfig?.topTitle || 'Merchandise &',
                          topTitleItalic: config.shopPageConfig?.topTitleItalic || 'Yogic Wear',
                          currency: e.target.value
                        }
                      })}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #D6D3D1', fontSize: '14px' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#44403C', marginBottom: '6px' }}>Tax Notice Text (Under Price)</label>
                    <input
                      type="text"
                      placeholder="e.g. inclusive of all taxes"
                      value={config.shopPageConfig?.taxNotice !== undefined ? config.shopPageConfig.taxNotice : 'inclusive of all taxes'}
                      onChange={(e) => setConfig({
                        ...config,
                        shopPageConfig: {
                          ...config.shopPageConfig,
                          badge: config.shopPageConfig?.badge || '— PRAGYA SANCTUARY STORE —',
                          topTitle: config.shopPageConfig?.topTitle || 'Merchandise &',
                          topTitleItalic: config.shopPageConfig?.topTitleItalic || 'Yogic Wear',
                          taxNotice: e.target.value
                        }
                      })}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #D6D3D1', fontSize: '14px' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#44403C', marginBottom: '6px' }}>Guarantee Box Title</label>
                    <input
                      type="text"
                      placeholder="e.g. AUTHENTIC GUARANTEE"
                      value={config.shopPageConfig?.guaranteeTitle !== undefined ? config.shopPageConfig.guaranteeTitle : 'AUTHENTIC GUARANTEE'}
                      onChange={(e) => setConfig({
                        ...config,
                        shopPageConfig: {
                          ...config.shopPageConfig,
                          badge: config.shopPageConfig?.badge || '— PRAGYA SANCTUARY STORE —',
                          topTitle: config.shopPageConfig?.topTitle || 'Merchandise &',
                          topTitleItalic: config.shopPageConfig?.topTitleItalic || 'Yogic Wear',
                          guaranteeTitle: e.target.value
                        }
                      })}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #D6D3D1', fontSize: '14px' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#44403C', marginBottom: '6px' }}>Guarantee Box Subtitle</label>
                    <input
                      type="text"
                      placeholder="e.g. 100% Authentic product with quality assurance."
                      value={config.shopPageConfig?.guaranteeSubtitle !== undefined ? config.shopPageConfig.guaranteeSubtitle : '100% Authentic product with quality assurance.'}
                      onChange={(e) => setConfig({
                        ...config,
                        shopPageConfig: {
                          ...config.shopPageConfig,
                          badge: config.shopPageConfig?.badge || '— PRAGYA SANCTUARY STORE —',
                          topTitle: config.shopPageConfig?.topTitle || 'Merchandise &',
                          topTitleItalic: config.shopPageConfig?.topTitleItalic || 'Yogic Wear',
                          guaranteeSubtitle: e.target.value
                        }
                      })}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #D6D3D1', fontSize: '14px' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#44403C', marginBottom: '6px' }}>
                    Trust & Delivery Policy Badges (Shown Under Add To Bag)
                  </label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {(config.shopPageConfig?.trustBadges || [
                      { icon: 'shield', text: '100% Original Authentic Products' },
                      { icon: 'truck', text: 'Pay on delivery available' },
                      { icon: 'refresh', text: 'Easy 7 days returns and exchanges' }
                    ]).map((tb, idx) => (
                      <div key={idx} style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: '10px' }}>
                        <select
                          value={tb.icon || 'shield'}
                          onChange={(e) => {
                            const updated = [...(config.shopPageConfig?.trustBadges || [
                              { icon: 'shield', text: '100% Original Authentic Products' },
                              { icon: 'truck', text: 'Pay on delivery available' },
                              { icon: 'refresh', text: 'Easy 7 days returns and exchanges' }
                            ])];
                            updated[idx] = { ...updated[idx], icon: e.target.value };
                            setConfig({
                              ...config,
                              shopPageConfig: {
                                ...config.shopPageConfig,
                                badge: config.shopPageConfig?.badge || '— PRAGYA SANCTUARY STORE —',
                                topTitle: config.shopPageConfig?.topTitle || 'Merchandise &',
                                topTitleItalic: config.shopPageConfig?.topTitleItalic || 'Yogic Wear',
                                trustBadges: updated
                              }
                            });
                          }}
                          style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #D6D3D1', fontSize: '13px', backgroundColor: '#FAF7F2' }}
                        >
                          <option value="shield">🛡️ Shield / Security</option>
                          <option value="truck">🚚 Truck / Delivery</option>
                          <option value="refresh">🔄 Refresh / Return</option>
                          <option value="award">🎖️ Award / Quality</option>
                          <option value="package">📦 Package / Dispatch</option>
                          <option value="sparkles">✨ Sparkles / Premium</option>
                        </select>
                        <input
                          type="text"
                          value={tb.text}
                          onChange={(e) => {
                            const updated = [...(config.shopPageConfig?.trustBadges || [
                              { icon: 'shield', text: '100% Original Authentic Products' },
                              { icon: 'truck', text: 'Pay on delivery available' },
                              { icon: 'refresh', text: 'Easy 7 days returns and exchanges' }
                            ])];
                            updated[idx] = { ...updated[idx], text: e.target.value };
                            setConfig({
                              ...config,
                              shopPageConfig: {
                                ...config.shopPageConfig,
                                badge: config.shopPageConfig?.badge || '— PRAGYA SANCTUARY STORE —',
                                topTitle: config.shopPageConfig?.topTitle || 'Merchandise &',
                                topTitleItalic: config.shopPageConfig?.topTitleItalic || 'Yogic Wear',
                                trustBadges: updated
                              }
                            });
                          }}
                          style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #D6D3D1', fontSize: '13px' }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Section 3: Store Merchandise Products Catalog & Manager */}
              <div style={{ border: '1px solid #E7E5E4', borderRadius: '14px', padding: '22px', backgroundColor: '#FFFFFF', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
                  <div>
                    <span style={{ backgroundColor: '#FEF3C7', color: '#B45309', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 700 }}>
                      Section 3
                    </span>
                    <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1C1917', margin: '8px 0 2px 0' }}>
                      Live Store Products & Merchandise Catalog ({merchandiseItems.length})
                    </h3>
                    <p style={{ fontSize: '12.5px', color: '#78716C', margin: 0 }}>
                      Add new products, edit pricing, or remove items displayed on your store page catalog.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setEditingProduct(null);
                      setShopSubView('add-product');
                    }}
                    style={{
                      padding: '10px 20px',
                      borderRadius: '12px',
                      backgroundColor: '#944426',
                      color: '#FFFFFF',
                      fontSize: '13px',
                      fontWeight: 800,
                      border: 'none',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      boxShadow: '0 2px 8px rgba(148,68,38,0.25)'
                    }}
                  >
                    <Plus className="w-4 h-4" /> Add New Product
                  </button>
                </div>

                {isLoadingMerch ? (
                  <div style={{ padding: '30px', textAlign: 'center', color: '#78716C', fontWeight: 700 }}>Loading Store Merchandise Catalog...</div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px' }}>
                    {merchandiseItems.map((item) => (
                      <div
                        key={item.id}
                        style={{
                          backgroundColor: '#FAF7F2',
                          border: '1px solid #E7E5E4',
                          borderRadius: '16px',
                          padding: '18px',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          gap: '14px'
                        }}
                      >
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: '10.5px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.06em', padding: '3px 9px', borderRadius: '6px', backgroundColor: '#FEF3C7', color: '#78350F' }}>
                              {item.category.toUpperCase()}
                            </span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingProduct(item);
                                  setShopSubView('add-product');
                                }}
                                style={{ background: 'none', border: 'none', color: '#944426', cursor: 'pointer', padding: '2px', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 700 }}
                                title="Edit Product"
                              >
                                <Edit3 className="w-4 h-4" /> Edit
                              </button>
                              <button
                                type="button"
                                onClick={async () => {
                                  if (window.confirm(`Delete product "${item.title}"?`)) {
                                    const updated = await deleteMerchandiseItem(item.id);
                                    setMerchandiseItems(updated);
                                  }
                                }}
                                style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', padding: '2px' }}
                                title="Delete Product"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          <div style={{ height: '110px', borderRadius: '10px', overflow: 'hidden', backgroundColor: '#FFFFFF' }}>
                            <img src={item.image} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          </div>

                          <div>
                            <h4 style={{ fontWeight: 800, color: '#1C1917', fontSize: '14.5px', margin: '0 0 2px 0', lineHeight: 1.3 }}>{item.title}</h4>
                            <span style={{ fontSize: '14px', fontWeight: 900, color: '#944426' }}>
                              {item.currency || 'HK$'} {item.price}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )
        )}

          {/* ════════════════════ PAGE: EVENTS ════════════════════ */}
          {selectedPage === 'events' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>

              <div style={{ border: '1px solid #E7E5E4', borderRadius: '14px', padding: '22px', backgroundColor: '#FFFFFF' }}>
                <span style={{ backgroundColor: '#FEF3C7', color: '#B45309', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 700 }}>
                  Section 1
                </span>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1C1917', margin: '8px 0 16px 0' }}>
                  Events & Workshops Hero Banner
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#44403C', marginBottom: '6px' }}>Title Prefix</label>
                    <input
                      type="text"
                      value={config.eventsPageConfig?.topTitle || 'Events &'}
                      onChange={(e) => setConfig({
                        ...config,
                        eventsPageConfig: {
                          ...config.eventsPageConfig,
                          topTitle: e.target.value,
                          topTitleItalic: config.eventsPageConfig?.topTitleItalic || 'Workshops',
                          topSuffix: config.eventsPageConfig?.topSuffix || '',
                          topSubtitle: config.eventsPageConfig?.topSubtitle || ''
                        }
                      })}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #D6D3D1', fontSize: '14px' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#44403C', marginBottom: '6px' }}>Title Italic Part</label>
                    <input
                      type="text"
                      value={config.eventsPageConfig?.topTitleItalic || 'Workshops'}
                      onChange={(e) => setConfig({
                        ...config,
                        eventsPageConfig: {
                          ...config.eventsPageConfig,
                          topTitle: config.eventsPageConfig?.topTitle || 'Events &',
                          topTitleItalic: e.target.value,
                          topSuffix: config.eventsPageConfig?.topSuffix || '',
                          topSubtitle: config.eventsPageConfig?.topSubtitle || ''
                        }
                      })}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #D6D3D1', fontSize: '14px' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#44403C', marginBottom: '6px' }}>Title Suffix</label>
                    <input
                      type="text"
                      placeholder="(Optional)"
                      value={config.eventsPageConfig?.topSuffix || ''}
                      onChange={(e) => setConfig({
                        ...config,
                        eventsPageConfig: {
                          ...config.eventsPageConfig,
                          topTitle: config.eventsPageConfig?.topTitle || 'Events &',
                          topTitleItalic: config.eventsPageConfig?.topTitleItalic || 'Workshops',
                          topSuffix: e.target.value,
                          topSubtitle: config.eventsPageConfig?.topSubtitle || ''
                        }
                      })}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #D6D3D1', fontSize: '14px' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#44403C', marginBottom: '6px' }}>Subtitle Description</label>
                  <textarea
                    rows={2}
                    value={config.eventsPageConfig?.topSubtitle || 'Explore our sanctuary events, oceanfront resets, sound bath immersions, and international retreats. Filter by month to find your next journey.'}
                    onChange={(e) => setConfig({
                      ...config,
                      eventsPageConfig: {
                        ...config.eventsPageConfig,
                        topTitle: config.eventsPageConfig?.topTitle || 'Events &',
                        topTitleItalic: config.eventsPageConfig?.topTitleItalic || 'Workshops',
                        topSuffix: config.eventsPageConfig?.topSuffix || '',
                        topSubtitle: e.target.value
                      }
                    })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #D6D3D1', fontSize: '14px' }}
                  />
                </div>
              </div>

              {/* API Notice for Events */}
              <div style={{ border: '1.5px dashed #D6D3D1', borderRadius: '14px', padding: '24px', backgroundColor: '#FAFAF9', textAlign: 'center' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', borderRadius: '20px', backgroundColor: '#E0F2FE', color: '#0369A1', fontSize: '12px', fontWeight: 700, marginBottom: '10px' }}>
                  ⚡ API-Driven Content
                </div>
                <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#1C1917', margin: '0 0 6px 0' }}>
                  Live Events & Workshop Listings ({allEvents.length} Events)
                </h4>
                <p style={{ fontSize: '13.5px', color: '#78716C', margin: '0 auto', maxWidth: '540px' }}>
                  All event cards, dates, locations, prices, and booking links are dynamically fetched from the database API. To create or manage events, use the <strong>Events Manager</strong> in the admin sidebar.
                </p>
              </div>

            </div>
          )}

          {/* ════════════════════ PAGE: CLASSES ════════════════════ */}
          {selectedPage === 'classes' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>

              {/* Section 1: Top Hero Banner (Explore Our Classes) */}
              <div style={{ border: '1px solid #E7E5E4', borderRadius: '14px', padding: '22px', backgroundColor: '#FFFFFF' }}>
                <span style={{ backgroundColor: '#FEF3C7', color: '#B45309', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 700 }}>
                  Section 1
                </span>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1C1917', margin: '8px 0 16px 0' }}>
                  Explore Our Classes Hero Banner
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#44403C', marginBottom: '6px' }}>Title Prefix</label>
                    <input
                      type="text"
                      value={config.classesPageConfig?.topTitle || 'Explore'}
                      onChange={(e) => setConfig({
                        ...config,
                        classesPageConfig: {
                          ...config.classesPageConfig,
                          topTitle: e.target.value,
                          topTitleItalic: config.classesPageConfig?.topTitleItalic || 'Our Classes',
                          topSuffix: config.classesPageConfig?.topSuffix || '',
                          topSubtitle: config.classesPageConfig?.topSubtitle || '',
                          idealTitle: config.classesPageConfig?.idealTitle || 'Discover Your',
                          idealTitleItalic: config.classesPageConfig?.idealTitleItalic || 'Ideal',
                          idealSuffix: config.classesPageConfig?.idealSuffix || 'Yog Practice',
                          idealSubtitle: config.classesPageConfig?.idealSubtitle || '',
                          giftTitle: config.classesPageConfig?.giftTitle || 'The',
                          giftTitleItalic: config.classesPageConfig?.giftTitleItalic || 'Gift',
                          giftSuffix: config.classesPageConfig?.giftSuffix || 'of Yoga',
                          giftSubtitle: config.classesPageConfig?.giftSubtitle || '',
                          giftCards: config.classesPageConfig?.giftCards || []
                        }
                      })}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #D6D3D1', fontSize: '14px' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#44403C', marginBottom: '6px' }}>Title Italic Part</label>
                    <input
                      type="text"
                      value={config.classesPageConfig?.topTitleItalic || 'Our Classes'}
                      onChange={(e) => setConfig({
                        ...config,
                        classesPageConfig: {
                          ...config.classesPageConfig,
                          topTitle: config.classesPageConfig?.topTitle || 'Explore',
                          topTitleItalic: e.target.value,
                          topSuffix: config.classesPageConfig?.topSuffix || '',
                          topSubtitle: config.classesPageConfig?.topSubtitle || '',
                          idealTitle: config.classesPageConfig?.idealTitle || 'Discover Your',
                          idealTitleItalic: config.classesPageConfig?.idealTitleItalic || 'Ideal',
                          idealSuffix: config.classesPageConfig?.idealSuffix || 'Yog Practice',
                          idealSubtitle: config.classesPageConfig?.idealSubtitle || '',
                          giftTitle: config.classesPageConfig?.giftTitle || 'The',
                          giftTitleItalic: config.classesPageConfig?.giftTitleItalic || 'Gift',
                          giftSuffix: config.classesPageConfig?.giftSuffix || 'of Yoga',
                          giftSubtitle: config.classesPageConfig?.giftSubtitle || '',
                          giftCards: config.classesPageConfig?.giftCards || []
                        }
                      })}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #D6D3D1', fontSize: '14px' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#44403C', marginBottom: '6px' }}>Title Suffix</label>
                    <input
                      type="text"
                      placeholder="(Optional)"
                      value={config.classesPageConfig?.topSuffix || ''}
                      onChange={(e) => setConfig({
                        ...config,
                        classesPageConfig: {
                          ...config.classesPageConfig,
                          topTitle: config.classesPageConfig?.topTitle || 'Explore',
                          topTitleItalic: config.classesPageConfig?.topTitleItalic || 'Our Classes',
                          topSuffix: e.target.value,
                          topSubtitle: config.classesPageConfig?.topSubtitle || '',
                          idealTitle: config.classesPageConfig?.idealTitle || 'Discover Your',
                          idealTitleItalic: config.classesPageConfig?.idealTitleItalic || 'Ideal',
                          idealSuffix: config.classesPageConfig?.idealSuffix || 'Yog Practice',
                          idealSubtitle: config.classesPageConfig?.idealSubtitle || '',
                          giftTitle: config.classesPageConfig?.giftTitle || 'The',
                          giftTitleItalic: config.classesPageConfig?.giftTitleItalic || 'Gift',
                          giftSuffix: config.classesPageConfig?.giftSuffix || 'of Yoga',
                          giftSubtitle: config.classesPageConfig?.giftSubtitle || '',
                          giftCards: config.classesPageConfig?.giftCards || []
                        }
                      })}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #D6D3D1', fontSize: '14px' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#44403C', marginBottom: '6px' }}>Subtitle Description</label>
                  <textarea
                    rows={2}
                    value={config.classesPageConfig?.topSubtitle || 'From calming flows to energizing practices, Pragya Yog School offers a variety of yoga classes designed to fit every lifestyle and level.'}
                    onChange={(e) => setConfig({
                      ...config,
                      classesPageConfig: {
                        ...config.classesPageConfig,
                        topTitle: config.classesPageConfig?.topTitle || 'Explore',
                        topTitleItalic: config.classesPageConfig?.topTitleItalic || 'Our Classes',
                        topSuffix: config.classesPageConfig?.topSuffix || '',
                        topSubtitle: e.target.value,
                        idealTitle: config.classesPageConfig?.idealTitle || 'Discover Your',
                        idealTitleItalic: config.classesPageConfig?.idealTitleItalic || 'Ideal',
                        idealSuffix: config.classesPageConfig?.idealSuffix || 'Yog Practice',
                        idealSubtitle: config.classesPageConfig?.idealSubtitle || '',
                        giftTitle: config.classesPageConfig?.giftTitle || 'The',
                        giftTitleItalic: config.classesPageConfig?.giftTitleItalic || 'Gift',
                        giftSuffix: config.classesPageConfig?.giftSuffix || 'of Yoga',
                        giftSubtitle: config.classesPageConfig?.giftSubtitle || '',
                        giftCards: config.classesPageConfig?.giftCards || []
                      }
                    })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #D6D3D1', fontSize: '14px' }}
                  />
                </div>
              </div>

              {/* Section 2: Discover Your Ideal Yog Practice */}
              <div style={{ border: '1px solid #E7E5E4', borderRadius: '14px', padding: '22px', backgroundColor: '#FFFFFF' }}>
                <span style={{ backgroundColor: '#FEF3C7', color: '#B45309', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 700 }}>
                  Section 2
                </span>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1C1917', margin: '8px 0 16px 0' }}>
                  Discover Your Ideal Yog Practice Header
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#44403C', marginBottom: '6px' }}>Title Prefix</label>
                    <input
                      type="text"
                      value={config.classesPageConfig?.idealTitle || 'Discover Your'}
                      onChange={(e) => setConfig({
                        ...config,
                        classesPageConfig: {
                          ...config.classesPageConfig,
                          topTitle: config.classesPageConfig?.topTitle || 'Explore',
                          topTitleItalic: config.classesPageConfig?.topTitleItalic || 'Our Classes',
                          topSuffix: config.classesPageConfig?.topSuffix || '',
                          topSubtitle: config.classesPageConfig?.topSubtitle || '',
                          idealTitle: e.target.value,
                          idealTitleItalic: config.classesPageConfig?.idealTitleItalic || 'Ideal',
                          idealSuffix: config.classesPageConfig?.idealSuffix || 'Yog Practice',
                          idealSubtitle: config.classesPageConfig?.idealSubtitle || '',
                          giftTitle: config.classesPageConfig?.giftTitle || 'The',
                          giftTitleItalic: config.classesPageConfig?.giftTitleItalic || 'Gift',
                          giftSuffix: config.classesPageConfig?.giftSuffix || 'of Yoga',
                          giftSubtitle: config.classesPageConfig?.giftSubtitle || '',
                          giftCards: config.classesPageConfig?.giftCards || []
                        }
                      })}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #D6D3D1', fontSize: '14px' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#44403C', marginBottom: '6px' }}>Title Italic Keyword</label>
                    <input
                      type="text"
                      value={config.classesPageConfig?.idealTitleItalic || 'Ideal'}
                      onChange={(e) => setConfig({
                        ...config,
                        classesPageConfig: {
                          ...config.classesPageConfig,
                          topTitle: config.classesPageConfig?.topTitle || 'Explore',
                          topTitleItalic: config.classesPageConfig?.topTitleItalic || 'Our Classes',
                          topSuffix: config.classesPageConfig?.topSuffix || '',
                          topSubtitle: config.classesPageConfig?.topSubtitle || '',
                          idealTitle: config.classesPageConfig?.idealTitle || 'Discover Your',
                          idealTitleItalic: e.target.value,
                          idealSuffix: config.classesPageConfig?.idealSuffix || 'Yog Practice',
                          idealSubtitle: config.classesPageConfig?.idealSubtitle || '',
                          giftTitle: config.classesPageConfig?.giftTitle || 'The',
                          giftTitleItalic: config.classesPageConfig?.giftTitleItalic || 'Gift',
                          giftSuffix: config.classesPageConfig?.giftSuffix || 'of Yoga',
                          giftSubtitle: config.classesPageConfig?.giftSubtitle || '',
                          giftCards: config.classesPageConfig?.giftCards || []
                        }
                      })}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #D6D3D1', fontSize: '14px' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#44403C', marginBottom: '6px' }}>Title Suffix</label>
                    <input
                      type="text"
                      value={config.classesPageConfig?.idealSuffix !== undefined ? config.classesPageConfig.idealSuffix : 'Yog Practice'}
                      onChange={(e) => setConfig({
                        ...config,
                        classesPageConfig: {
                          ...config.classesPageConfig,
                          topTitle: config.classesPageConfig?.topTitle || 'Explore',
                          topTitleItalic: config.classesPageConfig?.topTitleItalic || 'Our Classes',
                          topSuffix: config.classesPageConfig?.topSuffix || '',
                          topSubtitle: config.classesPageConfig?.topSubtitle || '',
                          idealTitle: config.classesPageConfig?.idealTitle || 'Discover Your',
                          idealTitleItalic: config.classesPageConfig?.idealTitleItalic || 'Ideal',
                          idealSuffix: e.target.value,
                          idealSubtitle: config.classesPageConfig?.idealSubtitle || '',
                          giftTitle: config.classesPageConfig?.giftTitle || 'The',
                          giftTitleItalic: config.classesPageConfig?.giftTitleItalic || 'Gift',
                          giftSuffix: config.classesPageConfig?.giftSuffix || 'of Yoga',
                          giftSubtitle: config.classesPageConfig?.giftSubtitle || '',
                          giftCards: config.classesPageConfig?.giftCards || []
                        }
                      })}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #D6D3D1', fontSize: '14px' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#44403C', marginBottom: '6px' }}>Subtitle</label>
                  <input
                    type="text"
                    value={config.classesPageConfig?.idealSubtitle || 'Join a class that matches your pace, your goals, and your lifestyle'}
                    onChange={(e) => setConfig({
                      ...config,
                      classesPageConfig: {
                        ...config.classesPageConfig,
                        topTitle: config.classesPageConfig?.topTitle || 'Explore',
                        topTitleItalic: config.classesPageConfig?.topTitleItalic || 'Our Classes',
                        topSuffix: config.classesPageConfig?.topSuffix || '',
                        topSubtitle: config.classesPageConfig?.topSubtitle || '',
                        idealTitle: config.classesPageConfig?.idealTitle || 'Discover Your',
                        idealTitleItalic: config.classesPageConfig?.idealTitleItalic || 'Ideal',
                        idealSuffix: config.classesPageConfig?.idealSuffix !== undefined ? config.classesPageConfig.idealSuffix : 'Yog Practice',
                        idealSubtitle: e.target.value,
                        giftTitle: config.classesPageConfig?.giftTitle || 'The',
                        giftTitleItalic: config.classesPageConfig?.giftTitleItalic || 'Gift',
                        giftSuffix: config.classesPageConfig?.giftSuffix || 'of Yoga',
                        giftSubtitle: config.classesPageConfig?.giftSubtitle || '',
                        giftCards: config.classesPageConfig?.giftCards || []
                      }
                    })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #D6D3D1', fontSize: '14px' }}
                  />
                </div>
              </div>

              {/* Section 3: API Notice for Timetable */}
              <div style={{ border: '1.5px dashed #D6D3D1', borderRadius: '14px', padding: '24px', backgroundColor: '#FAFAF9', textAlign: 'center' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', borderRadius: '20px', backgroundColor: '#E0F2FE', color: '#0369A1', fontSize: '12px', fontWeight: 700, marginBottom: '10px' }}>
                  ⚡ API-Driven Content
                </div>
                <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#1C1917', margin: '0 0 6px 0' }}>
                  Interactive Weekly Class Schedule & Timetable
                </h4>
                <p style={{ fontSize: '13.5px', color: '#78716C', margin: '0 auto', maxWidth: '540px' }}>
                  Daily class slots, timings, teacher assignments, and booking limits are served directly from the Schedule Database API.
                </p>
              </div>

              {/* Section 4: The Gift of Yoga */}
              <div style={{ border: '1px solid #E7E5E4', borderRadius: '14px', padding: '22px', backgroundColor: '#FFFFFF' }}>
                <span style={{ backgroundColor: '#FEF3C7', color: '#B45309', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 700 }}>
                  Section 4
                </span>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1C1917', margin: '8px 0 16px 0' }}>
                  The Gift of Yoga Section
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#44403C', marginBottom: '6px' }}>Title Prefix</label>
                    <input
                      type="text"
                      value={config.classesPageConfig?.giftTitle || 'The'}
                      onChange={(e) => setConfig({
                        ...config,
                        classesPageConfig: {
                          ...config.classesPageConfig,
                          topTitle: config.classesPageConfig?.topTitle || 'Explore',
                          topTitleItalic: config.classesPageConfig?.topTitleItalic || 'Our Classes',
                          topSuffix: config.classesPageConfig?.topSuffix || '',
                          topSubtitle: config.classesPageConfig?.topSubtitle || '',
                          idealTitle: config.classesPageConfig?.idealTitle || 'Discover Your',
                          idealTitleItalic: config.classesPageConfig?.idealTitleItalic || 'Ideal',
                          idealSuffix: config.classesPageConfig?.idealSuffix !== undefined ? config.classesPageConfig.idealSuffix : 'Yog Practice',
                          idealSubtitle: config.classesPageConfig?.idealSubtitle || '',
                          giftTitle: e.target.value,
                          giftTitleItalic: config.classesPageConfig?.giftTitleItalic || 'Gift',
                          giftSuffix: config.classesPageConfig?.giftSuffix !== undefined ? config.classesPageConfig.giftSuffix : 'of Yoga',
                          giftSubtitle: config.classesPageConfig?.giftSubtitle || '',
                          giftCards: config.classesPageConfig?.giftCards || []
                        }
                      })}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #D6D3D1', fontSize: '14px' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#44403C', marginBottom: '6px' }}>Title Italic Word</label>
                    <input
                      type="text"
                      value={config.classesPageConfig?.giftTitleItalic || 'Gift'}
                      onChange={(e) => setConfig({
                        ...config,
                        classesPageConfig: {
                          ...config.classesPageConfig,
                          topTitle: config.classesPageConfig?.topTitle || 'Explore',
                          topTitleItalic: config.classesPageConfig?.topTitleItalic || 'Our Classes',
                          topSuffix: config.classesPageConfig?.topSuffix || '',
                          topSubtitle: config.classesPageConfig?.topSubtitle || '',
                          idealTitle: config.classesPageConfig?.idealTitle || 'Discover Your',
                          idealTitleItalic: config.classesPageConfig?.idealTitleItalic || 'Ideal',
                          idealSuffix: config.classesPageConfig?.idealSuffix !== undefined ? config.classesPageConfig.idealSuffix : 'Yog Practice',
                          idealSubtitle: config.classesPageConfig?.idealSubtitle || '',
                          giftTitle: config.classesPageConfig?.giftTitle || 'The',
                          giftTitleItalic: e.target.value,
                          giftSuffix: config.classesPageConfig?.giftSuffix !== undefined ? config.classesPageConfig.giftSuffix : 'of Yoga',
                          giftSubtitle: config.classesPageConfig?.giftSubtitle || '',
                          giftCards: config.classesPageConfig?.giftCards || []
                        }
                      })}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #D6D3D1', fontSize: '14px' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#44403C', marginBottom: '6px' }}>Title Suffix</label>
                    <input
                      type="text"
                      value={config.classesPageConfig?.giftSuffix !== undefined ? config.classesPageConfig.giftSuffix : 'of Yoga'}
                      onChange={(e) => setConfig({
                        ...config,
                        classesPageConfig: {
                          ...config.classesPageConfig,
                          topTitle: config.classesPageConfig?.topTitle || 'Explore',
                          topTitleItalic: config.classesPageConfig?.topTitleItalic || 'Our Classes',
                          topSuffix: config.classesPageConfig?.topSuffix || '',
                          topSubtitle: config.classesPageConfig?.topSubtitle || '',
                          idealTitle: config.classesPageConfig?.idealTitle || 'Discover Your',
                          idealTitleItalic: config.classesPageConfig?.idealTitleItalic || 'Ideal',
                          idealSuffix: config.classesPageConfig?.idealSuffix !== undefined ? config.classesPageConfig.idealSuffix : 'Yog Practice',
                          idealSubtitle: config.classesPageConfig?.idealSubtitle || '',
                          giftTitle: config.classesPageConfig?.giftTitle || 'The',
                          giftTitleItalic: config.classesPageConfig?.giftTitleItalic || 'Gift',
                          giftSuffix: e.target.value,
                          giftSubtitle: config.classesPageConfig?.giftSubtitle || '',
                          giftCards: config.classesPageConfig?.giftCards || []
                        }
                      })}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #D6D3D1', fontSize: '14px' }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#44403C', marginBottom: '6px' }}>Section Subtitle</label>
                  <input
                    type="text"
                    value={config.classesPageConfig?.giftSubtitle || "Yoga is more than a physical practice, it's a path toward wellness, balance, and inner peace"}
                    onChange={(e) => setConfig({
                      ...config,
                      classesPageConfig: {
                        ...config.classesPageConfig,
                        topTitle: config.classesPageConfig?.topTitle || 'Explore',
                        topTitleItalic: config.classesPageConfig?.topTitleItalic || 'Our Classes',
                        topSubtitle: config.classesPageConfig?.topSubtitle || '',
                        idealTitle: config.classesPageConfig?.idealTitle || 'Discover Your',
                        idealTitleItalic: config.classesPageConfig?.idealTitleItalic || 'Ideal',
                        idealSubtitle: config.classesPageConfig?.idealSubtitle || '',
                        giftTitle: config.classesPageConfig?.giftTitle || 'The',
                        giftTitleItalic: config.classesPageConfig?.giftTitleItalic || 'Gift',
                        giftSubtitle: e.target.value,
                        giftCards: config.classesPageConfig?.giftCards || []
                      }
                    })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #D6D3D1', fontSize: '14px' }}
                  />
                </div>

                <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#1C1917', margin: '0 0 12px 0' }}>Gift of Yoga Benefit Cards ({config.classesPageConfig?.giftCards?.length || 4} Cards)</h4>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
                  {(config.classesPageConfig?.giftCards || []).map((card, idx) => (
                    <div key={idx} style={{ border: '1px solid #F5F5F4', borderRadius: '10px', padding: '16px', backgroundColor: '#FAFAF9' }}>
                      <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#B45309', marginBottom: '8px' }}>Card #{idx + 1}</div>

                      <div style={{ marginBottom: '10px' }}>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#57534E', marginBottom: '4px' }}>Card Title</label>
                        <input
                          type="text"
                          value={card.title}
                          onChange={(e) => {
                            const nextCards = [...(config.classesPageConfig?.giftCards || [])];
                            nextCards[idx] = { ...nextCards[idx], title: e.target.value };
                            setConfig({
                              ...config,
                              classesPageConfig: {
                                ...config.classesPageConfig,
                                topTitle: config.classesPageConfig?.topTitle || 'Explore',
                                topTitleItalic: config.classesPageConfig?.topTitleItalic || 'Our Classes',
                                topSubtitle: config.classesPageConfig?.topSubtitle || '',
                                idealTitle: config.classesPageConfig?.idealTitle || 'Discover Your',
                                idealTitleItalic: config.classesPageConfig?.idealTitleItalic || 'Ideal',
                                idealSubtitle: config.classesPageConfig?.idealSubtitle || '',
                                giftTitle: config.classesPageConfig?.giftTitle || 'The',
                                giftTitleItalic: config.classesPageConfig?.giftTitleItalic || 'Gift',
                                giftSubtitle: config.classesPageConfig?.giftSubtitle || '',
                                giftCards: nextCards
                              }
                            });
                          }}
                          style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #E7E5E4', fontSize: '13px', fontWeight: 600 }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#57534E', marginBottom: '4px' }}>Card Description</label>
                        <textarea
                          rows={3}
                          value={card.description}
                          onChange={(e) => {
                            const nextCards = [...(config.classesPageConfig?.giftCards || [])];
                            nextCards[idx] = { ...nextCards[idx], description: e.target.value };
                            setConfig({
                              ...config,
                              classesPageConfig: {
                                ...config.classesPageConfig,
                                topTitle: config.classesPageConfig?.topTitle || 'Explore',
                                topTitleItalic: config.classesPageConfig?.topTitleItalic || 'Our Classes',
                                topSubtitle: config.classesPageConfig?.topSubtitle || '',
                                idealTitle: config.classesPageConfig?.idealTitle || 'Discover Your',
                                idealTitleItalic: config.classesPageConfig?.idealTitleItalic || 'Ideal',
                                idealSubtitle: config.classesPageConfig?.idealSubtitle || '',
                                giftTitle: config.classesPageConfig?.giftTitle || 'The',
                                giftTitleItalic: config.classesPageConfig?.giftTitleItalic || 'Gift',
                                giftSubtitle: config.classesPageConfig?.giftSubtitle || '',
                                giftCards: nextCards
                              }
                            });
                          }}
                          style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #E7E5E4', fontSize: '13px' }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* ════════════════════ PAGE: TEACHERS ════════════════════ */}
          {selectedPage === 'teachers' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>

              <div style={{ border: '1px solid #E7E5E4', borderRadius: '14px', padding: '22px', backgroundColor: '#FFFFFF' }}>
                <span style={{ backgroundColor: '#FEF3C7', color: '#B45309', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 700 }}>
                  Section 1
                </span>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1C1917', margin: '8px 0 16px 0' }}>
                  Teachers Page Header Banner
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#44403C', marginBottom: '6px' }}>Page Title</label>
                    <input
                      type="text"
                      defaultValue="OUR MASTER TEACHERS & FACULTY"
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #D6D3D1', fontSize: '14px' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#44403C', marginBottom: '6px' }}>Subtitle</label>
                    <textarea
                      rows={2}
                      defaultValue="Guiding your journey with authentic Himalayan lineage, deep anatomical precision, and compassionate wisdom."
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #D6D3D1', fontSize: '14px' }}
                    />
                  </div>
                </div>
              </div>

              {/* API Notice for Teachers Grid */}
              <div style={{ border: '1.5px dashed #D6D3D1', borderRadius: '14px', padding: '24px', backgroundColor: '#FAFAF9', textAlign: 'center' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', borderRadius: '20px', backgroundColor: '#E0F2FE', color: '#0369A1', fontSize: '12px', fontWeight: 700, marginBottom: '10px' }}>
                  ⚡ API-Driven Content
                </div>
                <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#1C1917', margin: '0 0 6px 0' }}>
                  Certified Instructors & Faculty Grid
                </h4>
                <p style={{ fontSize: '13.5px', color: '#78716C', margin: '0 auto', maxWidth: '540px' }}>
                  Teacher bio profiles, photos, experience details, and specializations are fetched dynamically from the Staff API database.
                </p>
              </div>

            </div>
          )}

          {/* ════════════════════ PAGE: MEMBERSHIP & PACKAGES ════════════════════ */}
          {selectedPage === 'membership' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>

              <div style={{ border: '1px solid #E7E5E4', borderRadius: '14px', padding: '22px', backgroundColor: '#FFFFFF' }}>
                <span style={{ backgroundColor: '#FEF3C7', color: '#B45309', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 700 }}>
                  Section 1
                </span>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1C1917', margin: '8px 0 16px 0' }}>
                  Membership & Packages Header Banner
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#44403C', marginBottom: '6px' }}>Page Title</label>
                    <input
                      type="text"
                      defaultValue="MEMBERSHIP TIERS & SACRED PACKAGES"
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #D6D3D1', fontSize: '14px' }}
                    />
                  </div>
                </div>
              </div>

              {/* API Notice for Packages */}
              <div style={{ border: '1.5px dashed #D6D3D1', borderRadius: '14px', padding: '24px', backgroundColor: '#FAFAF9', textAlign: 'center' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', borderRadius: '20px', backgroundColor: '#E0F2FE', color: '#0369A1', fontSize: '12px', fontWeight: 700, marginBottom: '10px' }}>
                  ⚡ API-Driven Content
                </div>
                <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#1C1917', margin: '0 0 6px 0' }}>
                  Dynamic Packages Grid
                </h4>
                <p style={{ fontSize: '13.5px', color: '#78716C', margin: '0 auto', maxWidth: '540px' }}>
                  Membership tiers, TTC courses, retreat pricing, and package features are managed dynamically via the <strong>Package Manager</strong> in the admin sidebar.
                </p>
              </div>

              {/* Section 2: Why Explore Our Packages */}
              <div style={{ border: '1px solid #E7E5E4', borderRadius: '14px', padding: '22px', backgroundColor: '#FFFFFF' }}>
                <span style={{ backgroundColor: '#FEF3C7', color: '#B45309', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 700 }}>
                  Section 2
                </span>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1C1917', margin: '8px 0 16px 0' }}>
                  Why Explore Our Packages? Section
                </h3>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#44403C', marginBottom: '6px' }}>Section Main Title</label>
                  <input
                    type="text"
                    value={config.whyExplorePackages?.title || 'Why Explore Our Packages?'}
                    onChange={(e) => setConfig({
                      ...config,
                      whyExplorePackages: {
                        title: e.target.value,
                        points: config.whyExplorePackages?.points || []
                      }
                    })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #D6D3D1', fontSize: '14px' }}
                  />
                </div>

                <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#1C1917', margin: '0 0 12px 0' }}>Package Benefit Points ({config.whyExplorePackages?.points?.length || 4} Points)</h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {(config.whyExplorePackages?.points || []).map((pt, idx) => (
                    <div key={idx} style={{ border: '1px solid #F5F5F4', borderRadius: '10px', padding: '16px', backgroundColor: '#FAFAF9' }}>
                      <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#B45309', marginBottom: '8px' }}>Point #{idx + 1}</div>
                      
                      <div style={{ marginBottom: '10px' }}>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#57534E', marginBottom: '4px' }}>Bold Heading / Prefix</label>
                        <input
                          type="text"
                          value={pt.boldTitle}
                          onChange={(e) => {
                            const nextPoints = [...(config.whyExplorePackages?.points || [])];
                            nextPoints[idx] = { ...nextPoints[idx], boldTitle: e.target.value };
                            setConfig({
                              ...config,
                              whyExplorePackages: {
                                title: config.whyExplorePackages?.title || 'Why Explore Our Packages?',
                                points: nextPoints
                              }
                            });
                          }}
                          style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #E7E5E4', fontSize: '13px', fontWeight: 600 }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#57534E', marginBottom: '4px' }}>Point Description</label>
                        <textarea
                          rows={3}
                          value={pt.description}
                          onChange={(e) => {
                            const nextPoints = [...(config.whyExplorePackages?.points || [])];
                            nextPoints[idx] = { ...nextPoints[idx], description: e.target.value };
                            setConfig({
                              ...config,
                              whyExplorePackages: {
                                title: config.whyExplorePackages?.title || 'Why Explore Our Packages?',
                                points: nextPoints
                              }
                            });
                          }}
                          style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #E7E5E4', fontSize: '13px' }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
};
