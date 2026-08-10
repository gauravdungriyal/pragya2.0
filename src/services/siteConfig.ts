// Centralized Site Configuration & CMS State Management
// Enables real-time dynamic updates across the website from the Admin Panel
import { db, isFirebaseConfigured } from './firebase';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';

export interface StudioLocation {
  id: number;
  name: string;
  address: string;
  city: string;
  hours: string;
  phone: string;
  image: string;
  amenities: string[];
}

export interface SyllabusModuleItem {
  moduleTitle: string;
  topics: string[];
}

export interface MilestoneItem {
  year: string;
  title: string;
  description: string;
}

export interface WhyChooseFeature {
  id: number;
  title: string;
  description: string;
  iconName: string;
}

export interface WellnessStep {
  num: string;
  title: string;
  subtitle: string;
  description: string;
  bullets: string[];
  image: string;
}

export interface MembershipPerksConfig {
  basicPerks: string[];
  standardPerks: string[];
  premiumPerks: string[];
  standardBadge: string;
}

export interface SiteConfig {
  announcement: {
    enabled: boolean;
    badge: string;
    message: string;
    phone: string;
  };
  hero: {
    images: string[];
    mainTitle: string;
    subtitle: string;
    ctaPrimaryText: string;
    ctaSecondaryText: string;
  };
  whyChooseUs: {
    subtitle: string;
    title: string;
    description: string;
    features: WhyChooseFeature[];
  };
  wellnessJourney: {
    badge: string;
    title: string;
    subtitle: string;
    steps: WellnessStep[];
  };
  membershipPerks: MembershipPerksConfig;
  locations: StudioLocation[];
  about: {
    storyTitle: string;
    storyText1: string;
    storyText2: string;
    mission: string;
    vision: string;
    founderName: string;
    founderTitle: string;
    founderBio: string;
    founderImage: string;
    milestones: MilestoneItem[];
  };
  courseTemplates: {
    ttcTitle: string;
    ttcCertification: string;
    ttcSyllabus: SyllabusModuleItem[];
    ttcInclusions: string[];
    ttcPrerequisites: string[];
  };
  footer: {
    email: string;
    phone: string;
    address: string;
    instagramUrl: string;
    facebookUrl: string;
    youtubeUrl: string;
    whatsappNumber: string;
  };
}

export const DEFAULT_SITE_CONFIG: SiteConfig = {
  announcement: {
    enabled: true,
    badge: 'LIMITED OFFER',
    message: '🎉 Special Promotion: Enroll in 200-Hr Teacher Training & Get 20% Off + Free Mat Vault Access!',
    phone: '+852 9876 5432',
  },
  hero: {
    images: [
      'https://images.unsplash.com/photo-1545205597-3d9d02c29597?q=80&w=2000&auto=format&fit=crop',
      '/hero1.webp',
      '/hero3.webp?v=2',
    ],
    mainTitle: 'Transform Body & Mind With Authentic Yoga',
    subtitle: 'Immerse in holistic wellness, traditional Pranayama, Kriya practices, and luxury Reformer Pilates sessions in serene sanctuary spaces.',
    ctaPrimaryText: 'Book Complimentary Trial',
    ctaSecondaryText: 'Explore Memberships',
  },
  whyChooseUs: {
    subtitle: '— VALUE —',
    title: 'Why Choose Pragya Yog School',
    description: 'Discover the transformative benefits of yog & pilates for body, mind, and lifestyle.',
    features: [
      {
        id: 1,
        title: 'Improved Core Strength',
        description: 'Develop strength and balance through precise, core-centered movements.',
        iconName: 'Dumbbell',
      },
      {
        id: 2,
        title: 'Increased Flexibility',
        description: 'Expand your mobility with smooth and intentional motion towards inner harmony.',
        iconName: 'Command',
      },
      {
        id: 3,
        title: 'Better Posture',
        description: 'Align your spine and develop awareness for daily posture improvements.',
        iconName: 'Layers',
      },
      {
        id: 4,
        title: 'Low-Impact Fitness',
        description: 'Safe and effective Yog & Pilates workouts suitable for all ages and levels.',
        iconName: 'Heart',
      },
    ],
  },
  wellnessJourney: {
    badge: 'TRANSFORMATION PATHWAY',
    title: 'Your Path to Inner Peace',
    subtitle: 'A structured, 4-stage journey engineered to restore vitality, clarity, and physical strength.',
    steps: [
      {
        num: '01',
        title: 'Bio-Individual Consult',
        subtitle: 'Understanding your unique constitution',
        description: 'Begin with a 1-on-1 assessment with our master teachers. We analyze your posture, joint range, stress patterns, and energy levels to design your personalized path.',
        bullets: ['Postural & Mobility Scan', 'Stress & Nervous System Baseline', 'Ayurvedic Dosha Profile'],
        image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=800&auto=format&fit=crop',
      },
      {
        num: '02',
        title: 'Foundation & Core Alignment',
        subtitle: 'Building physical resilience',
        description: 'Master breath-led movement mechanics through tailored Hatha and Reformer Pilates practices designed to unlock joint freedom and build core stability.',
        bullets: ['Diaphragmatic Breath Integration', 'Pelvic & Spine Realignment', 'Injury-Prevention Fundamentals'],
        image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=800&auto=format&fit=crop',
      },
      {
        num: '03',
        title: 'Pranayama & Sound Recovery',
        subtitle: 'Calming the central nervous system',
        description: 'Transition into high-frequency vibrational sound baths, cold contrast hydrotherapy, and advanced Kundalini Kriyas to clear mental fatigue.',
        bullets: ['Multi-Frequency Quartz Sound Bath', 'Guided Contrast Hydro Therapy', 'Deep Vagus Nerve Reset'],
        image: 'https://images.unsplash.com/photo-1512290900673-70024421191e?q=80&w=800&auto=format&fit=crop',
      },
      {
        num: '04',
        title: 'Mastery & Daily Ikigai',
        subtitle: 'Living in effortless balance',
        description: 'Embody your practice seamlessly into daily life with advanced flow classes, weekend retreats, and lifelong participation in our supportive community.',
        bullets: ['Advanced Asana & Meditation', 'Seasonal Detox & Retreat Access', 'Lifetime Community Circle'],
        image: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?q=80&w=800&auto=format&fit=crop',
      },
    ],
  },
  membershipPerks: {
    basicPerks: ['Access to group classes', 'Studio equipment included', 'Flexible class scheduling'],
    standardPerks: ['Unlimited classes every week', 'Free trial workshop access', 'Priority booking for members'],
    premiumPerks: ['Access all pilates sessions', 'One private class monthly', 'Access to private events'],
    standardBadge: 'MOST POPULAR',
  },
  locations: [
    {
      id: 1,
      name: 'The Lotus Main Sanctuary & Spa',
      address: '108 Serenity Way, Sanctuary Heights',
      city: 'Central Studio, HK',
      hours: 'Mon - Sun: 06:00 AM - 09:30 PM',
      phone: '+852 9876 5431',
      image: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?q=80&w=1000&auto=format&fit=crop',
      amenities: [
        '2 Main Asana Practice Suites',
        'Peak Reformer Pilates Studio',
        'Contrast Hydrotherapy & Ice Plunge',
        'Infrared Detox Sauna',
        'Organic Ayurvedic Tea Lounge',
        'Manduka Eco-Mat & Towel Vault',
        'Private Member Lockers & Rain Showers',
      ],
    },
    {
      id: 2,
      name: 'Oceanfront Beachfront Pavilion',
      address: 'Beachside Promenade, Deck 4',
      city: 'Coastal Sanctuary Shore',
      hours: 'Sat - Sun: 06:30 AM - 11:00 AM',
      phone: '+852 9876 5432',
      image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=1000&auto=format&fit=crop',
      amenities: [
        'Open-Air Oceanfront Deck',
        'Sunrise & Sunset Hatha Sessions',
        'Acoustic Sound Bath Lawn',
        'Cold-Pressed Juice Bar',
        'Direct Beach Access',
      ],
    },
    {
      id: 3,
      name: 'Himalayan Retreat & Academy',
      address: 'Mountain Crest Valley, Gate 2',
      city: 'Himalayan Foothills Sanctuary',
      hours: 'Seasonal Retreats & Trainings',
      phone: '+852 9876 5433',
      image: 'https://images.unsplash.com/photo-1512290900673-70024421191e?q=80&w=1000&auto=format&fit=crop',
      amenities: [
        '200h & 300h Teacher Training Halls',
        'Organic Farm-to-Table Dining',
        'Silent Meditation Forest Path',
        'Private Eco-Villas',
        'Ayurvedic Panchakarma Spa',
      ],
    },
  ],
  about: {
    storyTitle: 'Our Sacred Journey & Philosophy',
    storyText1: 'Founded on ancient Yogic traditions, Pragya Yog bridges centuries-old wisdom with modern physiological wellness. We cultivate an inclusive sanctuary for practitioners seeking physical vitality, emotional calm, and spiritual alignment.',
    storyText2: 'Our masters lead each session with deep anatomical precision and compassionate guidance, empowering every practitioner along their unique wellness journey.',
    mission: 'To make authentic Yoga, Kriya, and holistic mindfulness accessible to every seeker, fostering balance and harmony across mind, body, and spirit.',
    vision: 'To build a global community of conscious practitioners and master teachers dedicated to sacred living, healing, and self-realization.',
    founderName: 'Master Gurudev',
    founderTitle: 'Founder & Spiritual Director',
    founderBio: 'With over 25 years of Himalayan tapasya and traditional Yogic mastery, Master Gurudev has trained thousands of certified instructors worldwide.',
    founderImage: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=800&auto=format&fit=crop',
    milestones: [
      { year: '2018', title: 'Sanctuary Foundation', description: 'Established the first Pragya Yog studio sanctuary.' },
      { year: '2021', title: 'Academy Accreditation', description: 'Accredited 200-Hour and 300-Hour Yoga Alliance International certifications.' },
      { year: '2024', title: 'Global Expansion', description: 'Expanded with oceanfront pavilions and Himalayan retreat grounds.' },
    ],
  },
  courseTemplates: {
    ttcTitle: '200-Hour Holistic Teacher Training Course',
    ttcCertification: 'Yoga Alliance International (RYT 200)',
    ttcSyllabus: [
      { moduleTitle: 'Module 1: Asana Alignment & Kinesiology', topics: ['Anatomy of 50+ Primary Postures', 'Hands-on Adjustments & Modifications', 'Injury Prevention & Biomechanics'] },
      { moduleTitle: 'Module 2: Pranayama & Subtle Energy', topics: ['Nadi Shodhana & Kapalabhati Practice', 'Bandhas (Energy Locks) Activation', 'Chakra Architecture & Bio-energetics'] },
      { moduleTitle: 'Module 3: Philosophy & Sacred Texts', topics: ['Yoga Sutras of Patanjali Deep Dive', 'Bhagavad Gita Wisdom for Modern Life', 'Ethical Guidelines for Yoga Masters'] },
      { moduleTitle: 'Module 4: Teaching Methodology & Practicum', topics: ['Sequencing Principles & Class Flow', 'Voice Modulation & Cueing Mastery', 'Live Student Teaching & Feedback'] },
    ],
    ttcInclusions: [
      'Yoga Alliance International RYT 200 Certificate',
      'Comprehensive 300-page Training Manual & Guidebook',
      'Unlimited Studio Pass for duration of course',
      '1-on-1 Mentorship Session with Master Gurudev',
      'Organic Ayurvedic Lunch & Herbal Teas provided daily',
    ],
    ttcPrerequisites: [
      'Minimum 6 months of regular yoga practice',
      'Open mind and dedication to immersive daily study',
      'Attendance in all scheduled modules',
    ],
  },
  footer: {
    email: 'namaste@pragya-yog.com',
    phone: '+852 9876 5432',
    address: '108 Serenity Way, Sanctuary Heights, Central Studio, HK',
    instagramUrl: 'https://instagram.com/pragyayog',
    facebookUrl: 'https://facebook.com/pragyayog',
    youtubeUrl: 'https://youtube.com/pragyayog',
    whatsappNumber: '+85298765432',
  },
};

const STORAGE_KEY = 'pragya_site_config_v2';
const EVENT_NAME = 'pragya_site_config_updated';
const FIRESTORE_COLLECTION = 'settings';
const FIRESTORE_DOC_ID = 'siteConfig';

export function getSiteConfig(): SiteConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SITE_CONFIG;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_SITE_CONFIG,
      ...parsed,
      announcement: { ...DEFAULT_SITE_CONFIG.announcement, ...(parsed.announcement || {}) },
      hero: { ...DEFAULT_SITE_CONFIG.hero, ...(parsed.hero || {}) },
      about: { ...DEFAULT_SITE_CONFIG.about, ...(parsed.about || {}) },
      courseTemplates: { ...DEFAULT_SITE_CONFIG.courseTemplates, ...(parsed.courseTemplates || {}) },
      footer: { ...DEFAULT_SITE_CONFIG.footer, ...(parsed.footer || {}) },
    };
  } catch (err) {
    console.warn('Error parsing site config from localStorage:', err);
    return DEFAULT_SITE_CONFIG;
  }
}

export async function fetchSiteConfigFromFirebase(): Promise<SiteConfig> {
  if (!db || !isFirebaseConfigured) return getSiteConfig();
  try {
    const docRef = doc(db, FIRESTORE_COLLECTION, FIRESTORE_DOC_ID);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data() as SiteConfig;
      const merged = {
        ...DEFAULT_SITE_CONFIG,
        ...data,
        announcement: { ...DEFAULT_SITE_CONFIG.announcement, ...(data.announcement || {}) },
        hero: { ...DEFAULT_SITE_CONFIG.hero, ...(data.hero || {}) },
        whyChooseUs: { ...DEFAULT_SITE_CONFIG.whyChooseUs, ...(data.whyChooseUs || {}) },
        wellnessJourney: { ...DEFAULT_SITE_CONFIG.wellnessJourney, ...(data.wellnessJourney || {}) },
        membershipPerks: { ...DEFAULT_SITE_CONFIG.membershipPerks, ...(data.membershipPerks || {}) },
        about: { ...DEFAULT_SITE_CONFIG.about, ...(data.about || {}) },
        courseTemplates: { ...DEFAULT_SITE_CONFIG.courseTemplates, ...(data.courseTemplates || {}) },
        footer: { ...DEFAULT_SITE_CONFIG.footer, ...(data.footer || {}) },
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
      return merged;
    }
  } catch (err) {
    console.warn('Could not fetch site config from Firestore, falling back to local:', err);
  }
  return getSiteConfig();
}

export async function saveSiteConfig(newConfig: SiteConfig): Promise<void> {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newConfig));
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: newConfig }));

    if (db && isFirebaseConfigured) {
      const docRef = doc(db, FIRESTORE_COLLECTION, FIRESTORE_DOC_ID);
      await setDoc(docRef, newConfig, { merge: true });
      console.log('Site config successfully saved to Firebase Firestore!');
    }
  } catch (err) {
    console.error('Error saving site config:', err);
  }
}

export function resetSiteConfig(): SiteConfig {
  try {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: DEFAULT_SITE_CONFIG }));
  } catch (err) {
    console.error('Failed to reset site config:', err);
  }
  return DEFAULT_SITE_CONFIG;
}

export function subscribeSiteConfig(callback: (config: SiteConfig) => void): () => void {
  const handler = (e: Event) => {
    const customEvent = e as CustomEvent<SiteConfig>;
    if (customEvent.detail) {
      callback(customEvent.detail);
    } else {
      callback(getSiteConfig());
    }
  };

  window.addEventListener(EVENT_NAME, handler);

  let unsubscribeFirestore: (() => void) | null = null;

  if (db && isFirebaseConfigured) {
    try {
      const docRef = doc(db, FIRESTORE_COLLECTION, FIRESTORE_DOC_ID);
      unsubscribeFirestore = onSnapshot(docRef, (snap: any) => {
        if (snap.exists()) {
          const data = snap.data() as SiteConfig;
          const merged = {
            ...DEFAULT_SITE_CONFIG,
            ...data,
            announcement: { ...DEFAULT_SITE_CONFIG.announcement, ...(data.announcement || {}) },
            hero: { ...DEFAULT_SITE_CONFIG.hero, ...(data.hero || {}) },
            whyChooseUs: { ...DEFAULT_SITE_CONFIG.whyChooseUs, ...(data.whyChooseUs || {}) },
            wellnessJourney: { ...DEFAULT_SITE_CONFIG.wellnessJourney, ...(data.wellnessJourney || {}) },
            membershipPerks: { ...DEFAULT_SITE_CONFIG.membershipPerks, ...(data.membershipPerks || {}) },
            about: { ...DEFAULT_SITE_CONFIG.about, ...(data.about || {}) },
            courseTemplates: { ...DEFAULT_SITE_CONFIG.courseTemplates, ...(data.courseTemplates || {}) },
            footer: { ...DEFAULT_SITE_CONFIG.footer, ...(data.footer || {}) },
          };
          localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
          callback(merged);
        }
      });
    } catch (err) {
      console.warn('Failed to subscribe to Firestore real-time updates:', err);
    }
  }

  return () => {
    window.removeEventListener(EVENT_NAME, handler);
    if (unsubscribeFirestore) {
      unsubscribeFirestore();
    }
  };
}
