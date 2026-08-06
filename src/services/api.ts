import { ClassScheduleItem, Instructor, PackageItem, UpcomingEvent, DailyQuote, FaqItem, FilterOptions, DynamicPackage, PackageType } from '../types';

const API_BASE_URL = 'https://pragya-yog.com/api.php';

async function fetchFromApi<T>(action: string, payload: Record<string, any> = {}): Promise<T | null> {
  try {
    const body = { action, ...payload };
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      console.warn(`API HTTP error ${response.status} for action: ${action}`);
      return null;
    }

    const json = await response.json();
    if (json && json.status !== false) {
      return json;
    }
    return null;
  } catch (error) {
    console.warn(`Failed to fetch from Pragya Yog API (${action}):`, error);
    return null;
  }
}

// 1. Daily Quote
export async function getDailyQuote(): Promise<DailyQuote | null> {
  const res = await fetchFromApi<any>('get-daily-quote');
  if (res && Array.isArray(res.data) && res.data.length > 0) {
    return res.data[0];
  }
  // Fallback quote
  return {
    q: "Yog is the journey of the self, through the self, to the self.",
    a: "The Bhagavad Gita",
    h: "<blockquote>&ldquo;Yog is the journey of the self, through the self, to the self.&rdquo; &mdash; <footer>The Bhagavad Gita</footer></blockquote>"
  };
}

// 2. FAQs
export async function getFaqs(): Promise<FaqItem[]> {
  const res = await fetchFromApi<any>('faqs');
  if (res && Array.isArray(res.data) && res.data.length > 0) {
    return res.data.map((item: any) => ({
      question: item.question || item.q || '',
      answer: item.answer || item.a || ''
    }));
  }
  return [
    {
      question: "How far in advance can I book a class?",
      answer: "Regular group classes can be booked up to 4 days in advance and close 4 hours before class start. Private classes are confirmed based on teacher availability."
    },
    {
      question: "Do you offer a demo class?",
      answer: "Yes! We offer a complimentary trial/demo session for new practitioners to experience our teaching methodology and sanctuary atmosphere before choosing a membership plan."
    },
    {
      question: "Minimum students required for a class?",
      answer: "Our group classes require a minimum of 2 students to run. If a class does not meet the minimum capacity 2 hours prior to start time, registered participants will be notified and rebooked without penalty."
    },
    {
      question: "Do you provide mats and props?",
      answer: "Yes, we provide premium eco-friendly yoga mats, cork blocks, bolsters, straps, and organic cotton blankets free of charge. All equipment is sanitized after every session."
    },
    {
      question: "What should I bring to class?",
      answer: "Just bring yourself in comfortable, stretchable athletic wear, a reusable water bottle, and a personal hand towel if desired. We handle all mats, props, and sanctuary essentials."
    }
  ];
}

// 3. Teachers & Instructors
export async function getTeachers(): Promise<Instructor[]> {
  const res = await fetchFromApi<any>('teachers');
  if (res && Array.isArray(res.data) && res.data.length > 0) {
    return res.data.map((item: any, idx: number) => {
      // Clean HTML tags from description for preview
      const cleanDesc = (item.description || '')
        .replace(/<[^>]*>?/gm, '')
        .replace(/&ndash;/g, '–')
        .replace(/&rsquo;/g, "'")
        .replace(/&lsquo;/g, "'")
        .replace(/&amp;/g, '&')
        .replace(/&nbsp;/g, ' ')
        .trim();

      const postTitle = item.post || item.designation || 'Yog Instructor';
      const isShoaib = (item.name || '').toLowerCase().includes('shoaib') || item.staff_id === 361004;
      const imgUrl = isShoaib ? '/shoaib.webp' : (item.image || item.photo || item.avatar);

      return {
        staff_id: item.staff_id || idx + 100,
        name: item.name || 'Master Teacher',
        description: cleanDesc || 'Dedicated practitioner and guide at Pragya Yog School.',
        designation: postTitle,
        specialization: item.specialization || [postTitle],
        image: imgUrl
      };
    });
  }
  return [
    {
      staff_id: 360610,
      name: "Master Aarya Kuldeep",
      designation: "Founder & PhD Research Scholar",
      description: "Aarya, founder of Pragya Yog School, is a PhD research scholar and seasoned yog teacher with nearly a decade of international teaching experience. His passion for yog began at age three and integrates ancient wisdom with modern physiological science.",
      specialization: ["Classical Hatha", "Pranayama & Kriya", "Meditation Science"],
      image: "https://pragya-yog.com/uploads/teachers/1744359416.webp"
    },
    {
      staff_id: 360637,
      name: "Angela Lee",
      designation: "Senior Vinyasa & Pilates Master",
      description: "Angela brings high-energy grace to mindful movement. Her classes combine dynamic Vinyasa sequencing with postural alignment and restorative Breathwork.",
      specialization: ["Dynamic Vinyasa", "Reformer Pilates", "Postural Realignment"],
      image: "https://pragya-yog.com/uploads/teachers/1744359563.webp"
    },
    {
      staff_id: 360735,
      name: "Charlotte Chiu",
      designation: "Sound Healing & Yin Yoga Guide",
      description: "Charlotte specializes in immersive acoustic meditation using Tibetan Singing Bowls and Gongs, coupled with deep restorative Yin practices.",
      specialization: ["Yin Yoga", "Sound Therapy", "Stress Recovery"],
      image: "https://pragya-yog.com/uploads/teachers/1744359589.webp"
    },
    {
      staff_id: 361006,
      name: "Ashish P",
      designation: "Senior Yog & Alignment Specialist",
      description: "Ashish focuses on precise anatomical alignment, traditional pranayama techniques, and building core structural vitality.",
      specialization: ["Asana Alignment", "Hatha Yoga", "Breathing Techniques"],
      image: "https://pragya-yog.com/uploads/teachers/1768183299.webp"
    },
    {
      staff_id: 360801,
      name: "Louise Vance",
      designation: "Holistic Movement & Yin-Yang Specialist",
      description: "Louise believes yoga is for every body. Certified in over 500 hours, her teaching balances dynamic Hatha/Vinyasa with restorative Yin and mindfulness.",
      specialization: ["Yin & Yang Yoga", "Mindfulness", "Prenatal Yoga"],
      image: "https://pragya-yog.com/uploads/teachers/1779244503.webp"
    },
    {
      staff_id: 360880,
      name: "Marcus Chan",
      designation: "Mindfulness & Tibetan Sound Healer",
      description: "Marcus combines breath awareness and posture foundations with sound therapy to cultivate deep inner presence and emotional healing.",
      specialization: ["Sound Therapy", "Mindfulness Meditation", "Chair Yoga"],
      image: "https://pragya-yog.com/uploads/teachers/1779244590.webp"
    },
    {
      staff_id: 360736,
      name: "Dr. Yatendra Amoli",
      designation: "Director of Teaching & Research Scholar",
      description: "Dr. Amoli holds a PhD in Kashmir Saivism and over 20 years of international academic and yogic research leadership.",
      specialization: ["Kashmir Shaivism", "Yogic Philosophy", "Tantra & Meditation"],
      image: "https://pragya-yog.com/uploads/teachers/1781458525.webp"
    },
    {
      staff_id: 361004,
      name: "Master Shoaib M",
      designation: "Master Yoga Therapist & Neuropathy Specialist",
      description: "With over 15 years of yog therapy experience, Master Shoaib specializes in spinal health, back pain recovery, and customized neuro-therapy.",
      specialization: ["Yoga Therapy", "Back & Spine Alignment", "Neuropathy"],
      image: "/shoaib.webp"
    }
  ];
}

// 4. Packages & Bundles
export async function getPackages(): Promise<Record<string, PackageItem[]>> {
  const res = await fetchFromApi<any>('get-packages');
  if (res && res.data && typeof res.data === 'object') {
    return res.data;
  }
  return {
    "Unlimited Memberships": [
      {
        id: 101,
        packageID: "MEM-UNLIM-1M",
        title: "Sanctuary Unlimited Monthly",
        payment_type: 1,
        amount: 280,
        discount_type: "",
        discount: "",
        discount_remarks: "",
        discount_start: null,
        discount_end: null,
        frequency: 1,
        period: "month",
        duration_type: 2,
        duration_length: 1,
        category: "Membership",
        description: "Unlimited access to all studio yoga, pilates, and meditation classes with exclusive luxury amenities.",
        features: ["Unlimited Mat & Reformer Classes", "Complimentary Hydrotherapy Access", "1 Monthly Private 1-on-1 Session", "15% Off Workshops & Retreats", "Guest Pass (2/month)"]
      },
      {
        id: 102,
        packageID: "MEM-ANNUAL",
        title: "Pragya Master Annual Membership",
        payment_type: 1,
        amount: 2600,
        discount_type: "fixed",
        discount: "400",
        discount_remarks: "Annual Savings",
        discount_start: null,
        discount_end: null,
        frequency: 12,
        period: "year",
        duration_type: 2,
        duration_length: 12,
        category: "Membership",
        description: "Our signature annual commitment for dedicated practitioners seeking complete holistic transformation.",
        features: ["Unlimited Access to All Locations", "Personalized Health & Ayurvedic Consult", "Unlimited Guest Passes", "VIP Concierge & Preferred Booking", "Complimentary Mat & Towel Service"]
      }
    ],
    "Private Sessions": [
      {
        id: 12795,
        packageID: "PRIV-HEALTH-1",
        title: "Professional 1-1 Health Consultation with Master Faculty",
        payment_type: 2,
        amount: 150,
        discount_type: "",
        discount: "",
        discount_remarks: "",
        discount_start: null,
        discount_end: null,
        frequency: 1,
        period: "session",
        duration_type: 1,
        duration_length: 1,
        category: "Private",
        description: "Personalized 90-minute bio-individual health, postural, and yogic consultation.",
        features: ["Comprehensive Postural & Bio-Analysis", "Customized Daily Asana & Pranayama Plan", "Ayurvedic Lifestyle Assessment", "Direct Q&A with Master Teacher"]
      },
      {
        id: 12796,
        packageID: "PRIV-5PACK",
        title: "Private 1-on-1 Movement & Sound Immersion (5 Sessions)",
        payment_type: 2,
        amount: 650,
        discount_type: "bundle",
        discount: "100",
        discount_remarks: "",
        discount_start: null,
        discount_end: null,
        frequency: 5,
        period: "package",
        duration_type: 1,
        duration_length: 5,
        category: "Private",
        description: "Five dedicated 75-minute sessions tailored to your physical goals, injury recovery, or advanced practice.",
        features: ["1-on-1 Asana Alignment & Modification", "Personalized Sound & Breathwork", "Flexible Schedule Booking", "Private Suite Suite Access"]
      }
    ],
    "Class Packs": [
      {
        id: 201,
        packageID: "PACK-10",
        title: "10-Class Sanctuary Pass",
        payment_type: 1,
        amount: 220,
        discount_type: "",
        discount: "",
        discount_remarks: "",
        discount_start: null,
        discount_end: null,
        frequency: 10,
        period: "3 months",
        duration_type: 1,
        duration_length: 10,
        category: "Group",
        description: "Flexible class pack valid for all morning, afternoon, and evening group sessions.",
        features: ["Valid for 3 Months", "Shareable with 1 Friend", "Priority Waitlist Status"]
      }
    ]
  };
}

// 5. Upcoming Events & Retreats
export async function getUpcomingEvents(): Promise<UpcomingEvent[]> {
  const res = await fetchFromApi<any>('upcoming-events');
  if (res && Array.isArray(res.data) && res.data.length > 0) {
    return res.data.map((item: any, idx: number) => {
      const cleanDesc = (item.description || '').replace(/<[^>]*>?/gm, '').trim();
      const amountVal = typeof item.amount === 'number' ? item.amount : parseFloat(item.amount);
      const formattedPrice = !isNaN(amountVal) ? `HK$ ${amountVal.toLocaleString()}` : item.price || '$45';

      const rawImg = item.image || item.image_url || item.banner_image?.url || item.square_image?.url || item.cover_image || item.photo || item.featured_image || item.poster || item.img;
      let imageUrl: string | undefined = undefined;
      if (typeof rawImg === 'string' && rawImg.trim() !== '') {
        imageUrl = rawImg.startsWith('http') ? rawImg : `https://pragya-yog.com/${rawImg.replace(/^\//, '')}`;
      } else if (rawImg && typeof rawImg.url === 'string' && rawImg.url.trim() !== '') {
        imageUrl = rawImg.url.startsWith('http') ? rawImg.url : `https://pragya-yog.com/${rawImg.url.replace(/^\//, '')}`;
      }

      // Map to local compressed WebP image for instant sub-50ms local loading
      let localImage = imageUrl;
      if (imageUrl) {
        const lower = imageUrl.toLowerCase();
        if (lower.includes('1783740951')) localImage = '/gallery/upcomingevents/event_8_event_8_1783740951_jpg.webp';
        else if (lower.includes('1784376938')) localImage = '/gallery/upcomingevents/event_15_event_15_1784376938_jpg.webp';
        else if (lower.includes('1785134240')) localImage = '/gallery/upcomingevents/event_18_event_18_1785134240_jpg.webp';
        else if (lower.includes('1785133717')) localImage = '/gallery/upcomingevents/event_19_event_19_1785133717_jpg.webp';
        else if (lower.includes('1783772088')) localImage = '/gallery/upcomingevents/event_16_event_1783772088_jpg.webp';
        else if (lower.includes('1783756915')) localImage = '/gallery/upcomingevents/event_14_event_1783756915_jpg.webp';
      }

      return {
        id: String(item.id || item.event_id || idx + 1),
        title: item.title || item.name || item.event_title || 'Pragya Wellness Event',
        name: item.name || item.title || item.event_title || 'Pragya Wellness Event',
        description: cleanDesc || 'Join us for a transformative session guided by Pragya Yog faculty.',
        date: item.countdown_label || item.date || item.starts_at || (idx === 0 ? 'Saturday, Sunrise' : idx === 1 ? 'Full Moon Weekend' : 'Upcoming Season'),
        location: item.location || item.venue || 'Pragya Sanctuary Studio',
        price: formattedPrice,
        amount: !isNaN(amountVal) ? amountVal : undefined,
        category: (item.difficulty_tags && item.difficulty_tags.length > 0 ? item.difficulty_tags[0] : item.category) || 'Retreat',
        image: localImage || `/gallery/upcomingevents/default_${(idx % 4) + 1}.webp`,
        banner_image: item.banner_image,
        starts_at: item.starts_at,
        ends_at: item.ends_at,
        countdown_label: item.countdown_label,
        difficulty_tags: item.difficulty_tags || [],
        instructor: item.instructor,
        benefits: item.benefits || [],
        spots_label: item.spots_label,
        share_url: item.share_url
      };
    });
  }
  return [
    {
      id: "1",
      title: "Sun-Kissed + Centered: Morning Beach Reset",
      name: "Sun-Kissed + Centered: Morning Beach Reset",
      description: "Step away from the city hustle and give yourself the ultimate weekend recharge. Dynamic oceanfront Hatha flow followed by sound bath and organic cold-pressed juices.",
      date: "This Saturday • 07:00 AM - 08:30 AM",
      location: "Private Oceanfront Lawn",
      price: "$45",
      category: "Outdoor Reset"
    },
    {
      id: "2",
      title: "Himalayan Breathwork & Sound Immersion Workshop",
      name: "Himalayan Breathwork & Sound Immersion Workshop",
      description: "Master ancient Pranayama techniques to reset the central nervous system. Guided by Master Aarya with live acoustic Tibetan singing bowls.",
      date: "Next Sunday • 04:00 PM - 06:30 PM",
      location: "Main Sanctuary Hall",
      price: "$75",
      category: "Master Workshop"
    },
    {
      id: "3",
      title: "200-Hour International Yoga Teacher Training 2026",
      name: "200-Hour International Yoga Teacher Training 2026",
      description: "Transform your relationship with yoga and earn an internationally recognized certification accredited by Yoga Alliance.",
      date: "Starts Oct 15, 2026",
      location: "Pragya Academy Center",
      price: "$2,400",
      category: "Teacher Training"
    }
  ];
}

// 6. Schedule List by Date
export async function getScheduleByDate(dateStr?: string, instructorId?: string): Promise<{ today: string; schedules: ClassScheduleItem[] }> {
  const payload: any = {};
  if (dateStr) {
    if (dateStr.includes('-')) {
      const parts = dateStr.split('-');
      if (parts.length === 3 && parts[0].length === 4) {
        // YYYY-MM-DD -> DD/MM/YYYY required by API
        payload.date = `${parts[2]}/${parts[1]}/${parts[0]}`;
      } else {
        payload.date = dateStr;
      }
    } else {
      payload.date = dateStr;
    }
  }
  if (instructorId) payload.instructor = instructorId;

  const res = await fetchFromApi<any>('publicClassByDate', payload);
  if (res && res.status && Array.isArray(res.todaySchedules)) {
    return {
      today: res.today || 'Schedule',
      schedules: res.todaySchedules
    };
  }

  // Fallback realistic schedule items
  return {
    today: "Today's Schedule",
    schedules: [
      {
        id: "101",
        schedule_id: "25493",
        title: "Morning Sun Hatha & Pranayama",
        date: "Today",
        instructor: "Master Aarya",
        color: "#944426",
        timing: "07:00 AM - 08:15 AM",
        book_limit: "20",
        booked: 14,
        levels: "All Levels",
        completed: "0",
        credit: "1",
        book_cost: "$25",
        is_booked: false,
        showButton: "true",
        buttonType: "book",
        booking_id: "",
        description: "Awaken the bodily energy through rhythmic breathwork, classical sun salutations, and grounding posture holds.",
        video: "",
        duration: "75",
        room: "Lotus Sanctuary Room A"
      },
      {
        id: "102",
        schedule_id: "25494",
        title: "Mindful Vinyasa Flow",
        date: "Today",
        instructor: "Angela Lee",
        color: "#620513",
        timing: "09:00 AM - 10:15 AM",
        book_limit: "18",
        booked: 12,
        levels: "Intermediate",
        completed: "0",
        credit: "1",
        book_cost: "$25",
        is_booked: false,
        showButton: "true",
        buttonType: "book",
        booking_id: "",
        description: "Fluid movement synchronized with dynamic breath to build stamina, balance, and centered presence.",
        video: "",
        duration: "75",
        room: "Prana Studio"
      },
      {
        id: "103",
        schedule_id: "25495",
        title: "Reformer Pilates & Core Sculpt",
        date: "Today",
        instructor: "Angela Lee",
        color: "#9D9D48",
        timing: "11:00 AM - 12:00 PM",
        book_limit: "10",
        booked: 9,
        levels: "All Levels",
        completed: "0",
        credit: "1",
        book_cost: "$35",
        is_booked: false,
        showButton: "true",
        buttonType: "book",
        booking_id: "",
        description: "Precision-controlled movement using Pilates reformers to lengthen, align, and strengthen deep stabilizing muscles.",
        video: "",
        duration: "60",
        room: "Reformer Suite"
      },
      {
        id: "104",
        schedule_id: "25496",
        title: "Acoustic Sound Bath & Yin Recovery",
        date: "Today",
        instructor: "Charlotte Chiu",
        color: "#00381F",
        timing: "05:30 PM - 06:45 PM",
        book_limit: "25",
        booked: 20,
        levels: "Restorative",
        completed: "0",
        credit: "1",
        book_cost: "$30",
        is_booked: false,
        showButton: "true",
        buttonType: "book",
        booking_id: "",
        description: "Deep passive floor postures held with prop support while immersion in multi-frequency quartz and Tibetan singing bowls.",
        video: "",
        duration: "75",
        room: "Lotus Sanctuary Room B"
      },
      {
        id: "105",
        schedule_id: "25497",
        title: "Sunset Kundalini Meditation & Kriya",
        date: "Today",
        instructor: "Master Aarya",
        color: "#944426",
        timing: "07:15 PM - 08:30 PM",
        book_limit: "20",
        booked: 15,
        levels: "All Levels",
        completed: "0",
        credit: "1",
        book_cost: "$25",
        is_booked: false,
        showButton: "true",
        buttonType: "book",
        booking_id: "",
        description: "Sacred breath sequences and mudras designed to clear subconscious stress and awaken dormant vital force.",
        video: "",
        duration: "75",
        room: "Lotus Sanctuary Room A"
      }
    ]
  };
}

// 7. Get Filters
export async function getFilters(): Promise<FilterOptions> {
  const res = await fetchFromApi<any>('get-filters');
  if (res && res.status && res.data) {
    return {
      instructors: res.data.instructors || [
        { id: "", name: "All Instructors" },
        { id: "360610", name: "Master Aarya" },
        { id: "360637", name: "Angela Lee" },
        { id: "360735", name: "Charlotte Chiu" }
      ],
      levels: [
        { id: "", name: "All Levels" },
        { id: "beginner", name: "Beginner" },
        { id: "intermediate", name: "Intermediate" },
        { id: "advanced", name: "Advanced" },
        { id: "restorative", name: "Restorative" }
      ],
      pillars: [
        { id: "", name: "All Practices" },
        { id: "yoga", name: "Yoga Asana" },
        { id: "pilates", name: "Reformer Pilates" },
        { id: "meditation", name: "Meditation & Sound" },
        { id: "recovery", name: "Hydrotherapy & Recovery" }
      ]
    };
  }
  return {
    instructors: [
      { id: "", name: "All Instructors" },
      { id: "360610", name: "Master Aarya" },
      { id: "360637", name: "Angela Lee" },
      { id: "360735", name: "Charlotte Chiu" },
      { id: "360801", name: "Louise Vance" }
    ],
    levels: [
      { id: "", name: "All Levels" },
      { id: "beginner", name: "Beginner Foundation" },
      { id: "intermediate", name: "Intermediate Flow" },
      { id: "advanced", name: "Master Class" },
      { id: "restorative", name: "Yin & Restorative" }
    ],
    pillars: [
      { id: "", name: "All Experiences" },
      { id: "yoga", name: "Yoga" },
      { id: "pilates", name: "Pilates" },
      { id: "meditation", name: "Meditation" },
      { id: "recovery", name: "Recovery" }
    ]
  };
}

// ---------------------------------------------------------------------------
// Dynamic 7-Package System (API Integration + LocalStorage Fallback)
// ---------------------------------------------------------------------------

const LOCAL_STORAGE_PACKAGES_KEY = 'pragyayog_dynamic_packages_v1';

export const INITIAL_DYNAMIC_PACKAGES: DynamicPackage[] = [
  // 1. TEACHER TRAINING
  {
    id: 'ttc-200hr',
    type: 'teacher_training',
    title: '200-Hour Master Yoga Teacher Training',
    subtitle: 'Yoga Alliance USA Certified Immersion Program',
    price: 185000,
    discountPrice: 165000,
    currency: '₹',
    badge: 'Yoga Alliance Certified',
    badgeColor: 'amber',
    coverImage: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=1200&q=80',
    description: 'Transform your practice and become an internationally accredited yoga teacher. Comprehensive curriculum covering Hatha, Vinyasa, Anatomy, Pranayama, and Yogic Philosophy.',
    features: [
      '200 Hours Yoga Alliance USA Certification',
      'Comprehensive Printed & Digital Study Manual',
      'Hands-on Anatomy & Biomechanics Labs',
      'Teaching Methodology & Micro-practicum',
      'Lifetime Alumni Mentorship Community Access'
    ],
    isActive: true,
    isFeatured: true,
    displayOrder: 1,
    metadata: {
      certification: '200-Hour RYT (Yoga Alliance)',
      totalHours: 200,
      batchDates: 'Oct 15 - Nov 12, 2026',
      syllabus: [
        { moduleTitle: 'Module 1: Asana Alignment & Kinesiology', topics: ['Biomechanical Principles', 'Structural Adjustments', 'Injury Prevention'] },
        { moduleTitle: 'Module 2: Pranayama & Subtle Energy Science', topics: ['Nadi Shodhana & Bandhas', 'Kriya Practices', 'Chakra Anatomy'] },
        { moduleTitle: 'Module 3: Philosophy & Patanjali Yoga Sutras', topics: ['Classical Texts Analysis', 'Yama & Niyama Integration', 'Ethics for Teachers'] }
      ]
    }
  },
  // 2. WORKSHOP
  {
    id: 'ws-yog-therapy',
    type: 'workshop',
    title: 'Yog Therapy 2.0 – Realign Your Foundation',
    subtitle: 'Intensive Structural Alignment & Rehabilitation Masterclass',
    price: 6000,
    currency: '₹',
    badge: 'Popular Workshop',
    badgeColor: 'emerald',
    coverImage: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1200&q=80',
    description: 'Deconstruct structural imbalances. Learn spine rehab, pelvis alignment, core activation, and personalized therapy protocols guided by Master Shoaib.',
    features: [
      'Interactive Clinical Therapy Session',
      'Personalized Biomechanical Assessment',
      'Postural Realignment & Neuropathy Drills',
      'Take-home Practice Routine PDF'
    ],
    isActive: true,
    isFeatured: true,
    displayOrder: 2,
    metadata: {
      eventDate: 'Saturday, Sept 12, 2026',
      eventTime: '02:00 PM - 05:00 PM',
      venue: 'Pragya Main Sanctuary Studio A',
      totalSeats: 20,
      bookedSeats: 14,
      instructorName: 'Master Shoaib M'
    }
  },
  {
    id: 'ws-sacred-sound',
    type: 'workshop',
    title: 'Sacred Soundscapes: CET-Certified Chanting & Kirtan',
    subtitle: 'Acoustic Sound Therapy & Vocal Resonance Immersion',
    price: 8600,
    currency: '₹',
    badge: 'CET Certified',
    badgeColor: 'amber',
    coverImage: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&q=80',
    description: 'Immerse in ancient Vedic mantras, Himalayan singing bowl acoustics, and vocal resonance techniques for emotional clearing and nervous system regulation.',
    features: [
      'CET Certification of Completion',
      'Tibetan Bowl & Gong Acoustic Meditation',
      'Sanskrit Pronunciation & Chanting Guide',
      'Herbal Tea & Closing Circle'
    ],
    isActive: true,
    isFeatured: true,
    displayOrder: 3,
    metadata: {
      eventDate: 'Sunday, Sept 20, 2026',
      eventTime: '10:00 AM - 04:00 PM',
      venue: 'Pragya Acoustic Sanctuary',
      totalSeats: 15,
      bookedSeats: 11,
      instructorName: 'Charlotte Chiu'
    }
  },
  // 3. EVENT
  {
    id: 'ev-backbend-intensive',
    type: 'event',
    title: 'Back Bend Intensive 2026',
    subtitle: '21-Day Guided Heart-Opening & Mobility Series',
    price: 6500,
    discountPrice: 5500,
    currency: '₹',
    badge: 'Early Bird Special',
    coverImage: 'https://images.unsplash.com/photo-1599447421416-3414500d18a5?auto=format&fit=crop&w=1200&q=80',
    description: 'A 21-day structured journey to safely open thoracic spine mobility, strengthen posterior chain, and master deep backbends without lower back compression.',
    features: [
      '7 Dedicated In-person Sessions',
      'Thoracic Mobility & Shoulder Stacking',
      'Safe Wheel & Camel Pose Conditioning',
      'Daily Practice Tracker'
    ],
    isActive: true,
    isFeatured: true,
    displayOrder: 4,
    metadata: {
      eventDate: 'Aug 9 - Aug 30, 2026',
      eventTime: '07:00 AM - 08:30 AM',
      venue: 'Pragya Main Hall',
      totalSeats: 25,
      bookedSeats: 18,
      instructorName: 'Master Aarya Kuldeep'
    }
  },
  {
    id: 'ev-boat-trip',
    type: 'event',
    title: 'Pragya Boat Trip 2.0',
    subtitle: 'Ganga Sunrise River Meditative Experience',
    price: 1500,
    currency: '₹',
    badge: 'Popular Event',
    coverImage: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=1200&q=80',
    description: 'Sail down the sacred Ganges at dawn. Includes river pranayama, acoustic chanting, organic sattvic breakfast, and silent meditation.',
    features: [
      'Private Boat Cruise on the River Ganges',
      'Guided Dawn Meditation & Breathwork',
      'Organic Herbal Tea & Breakfast Box',
      'Sacred Ganga Aarti Ceremony'
    ],
    isActive: true,
    isFeatured: false,
    displayOrder: 5,
    metadata: {
      eventDate: 'Saturday, Sept 12, 2026',
      eventTime: '05:30 AM - 08:30 AM',
      venue: 'Rishikesh Ghat Pier',
      totalSeats: 30,
      bookedSeats: 22,
      instructorName: 'Pragya Faculty Team'
    }
  },
  // 4. RETREAT
  {
    id: 'ret-nepal-single',
    type: 'retreat',
    title: 'Nepal Himalayan Sanctuary Retreat (Single Suite)',
    subtitle: '9-Day Luxury Mountain Meditation & Renewal Journey',
    price: 24375,
    currency: '₹',
    badge: 'Limited Availability',
    coverImage: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&q=80',
    description: 'Immerse yourself in pristine Himalayan mountain air. Includes private luxury suite, daily organic sattvic dining, guided morning flow, and Buddhist monastery visits.',
    features: [
      '9 Days / 8 Nights Private Luxury Suite Accommodation',
      '3 Daily Gourmet Organic Sattvic Meals & Fresh Juices',
      'Daily Morning Hatha & Evening Yin Sound Healing',
      'Guided Monastery Tours & Mountain Treks',
      'Roundtrip Airport & Sanctuary Transfers'
    ],
    isActive: true,
    isFeatured: true,
    displayOrder: 6,
    metadata: {
      location: 'Pokhara Valley, Nepal',
      eventDate: 'Sept 25 - Oct 04, 2026',
      roomOptions: [
        { name: 'Private Suite', price: 24375 },
        { name: 'Shared Twin Suite', price: 19125 }
      ],
      itinerary: [
        { day: 'Day 1', title: 'Arrival & Welcome Dinner', detail: 'Sanctuary orientation, herbal tea tasting, and evening sound bath.' },
        { day: 'Day 2', title: 'Dawn Mountain Flow & Temple Trek', detail: 'Sunrise pranayama over the Himalayas followed by World Peace Pagoda hike.' },
        { day: 'Day 3-8', title: 'Deep Practice & Silent Reflection', detail: 'Asana labs, Ayurveda consultations, and monastery acoustic meditation.' },
        { day: 'Day 9', title: 'Closing Circle & Departure', detail: 'Sattvic farewell brunch and airport transfers.' }
      ]
    }
  },
  // 5. MEMBERSHIP
  {
    id: 'mem-unlim-12m',
    type: 'regular',
    title: 'Unlimited Membership (12 Months)',
    subtitle: 'Full Year All-Access Sanctuary Pass',
    price: 21292,
    currency: '₹',
    badge: 'Best Value',
    coverImage: 'https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b?auto=format&fit=crop&w=1200&q=80',
    description: 'Complete 365-day unlimited access to all daily group classes, sound healing sessions, reformer pilates, and member-only events.',
    features: [
      'Unlimited Access to 45+ Weekly Classes',
      'Free Mat Storage & Towel Service',
      '2 Complimentary Guest Passes per Month',
      '15% Off All Workshops & Retreats',
      'Free Access to Digital On-Demand Library'
    ],
    isActive: true,
    isFeatured: true,
    displayOrder: 7,
    metadata: {
      validityPeriod: '12 Months (365 Days)',
      classCount: 'Unlimited Classes'
    }
  },
  {
    id: 'mem-8class',
    type: 'regular',
    title: '8 Class / Month Membership',
    subtitle: 'Flexible Semi-Private Practice Pass',
    price: 8498,
    currency: '₹',
    badge: 'Most Popular',
    coverImage: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=1200&q=80',
    description: 'Ideal for practitioners attending twice a week. Unused class credits roll over for up to 30 days.',
    features: [
      '8 Class Credits per Month',
      'Valid for Hatha, Vinyasa & Yin Sessions',
      'Complimentary Mat & Prop Usage',
      '10% Discount on Studio Boutique'
    ],
    isActive: true,
    isFeatured: false,
    displayOrder: 8,
    metadata: {
      validityPeriod: '1 Month (30 Days)',
      classCount: '8 Classes'
    }
  },
  // 6. PRIVATE
  {
    id: 'priv-shoaib-consult',
    type: 'private',
    title: 'Professional 1-1 Health Consultation with Master Shoaib',
    subtitle: 'Personalized Neuro-Therapy & Spine Rehabilitation',
    price: 1250,
    currency: '₹',
    badge: 'Therapy Special',
    coverImage: 'https://images.unsplash.com/photo-1599447421416-3414500d18a5?auto=format&fit=crop&w=1200&q=80',
    description: 'One-on-one diagnostic consultation focused on back pain recovery, spinal alignment, posture correction, and custom neuro-therapy protocols.',
    features: [
      '60-Minute Comprehensive Assessment',
      'Spinal Alignment & Postural Scan',
      'Custom Home Exercise & Kriya Routine',
      'Direct Guidance by Master Shoaib'
    ],
    isActive: true,
    isFeatured: true,
    displayOrder: 9,
    metadata: {
      sessionDuration: '60 Minutes',
      focusAreas: ['Spine Alignment', 'Back Pain Recovery', 'Neuropathy'],
      assignedInstructor: 'Master Shoaib M'
    }
  },
  {
    id: 'priv-aarya-1on1',
    type: 'private',
    title: '1-on-1 Private Session with Master Aarya',
    subtitle: 'Bespoke Asana Alignment & Subtle Energy Mastery',
    price: 1500,
    currency: '₹',
    badge: 'Master Guide',
    coverImage: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=1200&q=80',
    description: 'Private immersion tailored to your personal goals. Includes advanced posture adjustments, personalized pranayama, and meditation instruction.',
    features: [
      '75-Minute Customized Private Session',
      'Advanced Postural Adjustments',
      'Personalized Pranayama & Meditation',
      'Exclusive Private Studio Access'
    ],
    isActive: true,
    isFeatured: false,
    displayOrder: 10,
    metadata: {
      sessionDuration: '75 Minutes',
      focusAreas: ['Classical Hatha', 'Pranayama Science', 'Meditation'],
      assignedInstructor: 'Master Aarya Kuldeep'
    }
  }
];

function mapPhpPackageToDynamicPackage(item: any, catName: string): DynamicPackage {
  let pType: PackageType = 'regular';
  const c = (catName || item.category || '').toLowerCase();
  if (c.includes('retreat')) pType = 'retreat';
  else if (c.includes('event')) pType = 'event';
  else if (c.includes('workshop')) pType = 'workshop';
  else if (c.includes('private')) pType = 'private';
  else if (c.includes('ttc') || c.includes('teacher')) pType = 'teacher_training';

  const origPrice = Number(item.original_amount || item.price || item.amount || 0);
  const currentPrice = Number(item.amount || item.price || origPrice);
  const hasDiscount = item.discount_active || (origPrice > currentPrice && currentPrice > 0);
  const discountPrice = hasDiscount ? currentPrice : undefined;
  const basePrice = discountPrice ? origPrice : currentPrice;

  const covers: Record<PackageType, string> = {
    teacher_training: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=1200&q=80',
    workshop: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1200&q=80',
    event: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&q=80',
    retreat: 'https://images.unsplash.com/photo-1599447421416-3414500d18a5?auto=format&fit=crop&w=1200&q=80',
    regular: 'https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b?auto=format&fit=crop&w=1200&q=80',
    private: 'https://images.unsplash.com/photo-1599447421416-3414500d18a5?auto=format&fit=crop&w=1200&q=80',
    free_class: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=1200&q=80',
  };

  return {
    id: String(item.id || item.packageID || 'pkg-' + Math.random()),
    type: pType,
    title: item.title ? item.title.trim() : 'Pragya Offering',
    subtitle: item.duration_label ? `${item.duration_label} · ${item.access_label || 'Sanctuary Pass'}` : (item.class_access || ''),
    price: basePrice || 1000,
    discountPrice: discountPrice,
    currency: '₹',
    badge: item.discount_type ? 'Special Offer' : (item.promo_active ? 'Promo Deal' : undefined),
    coverImage: covers[pType],
    description: item.description || (item.benefit ? `Sanctuary Access: ${item.benefit} (${item.access_label || ''})` : 'Experience authentic traditional practice at Pragya Yog School Sanctuary.'),
    features: [
      item.benefit ? `Access: ${item.benefit}` : 'Sanctuary Access',
      item.duration_label ? `Duration: ${item.duration_label}` : 'Flexible Schedule',
      item.class_access ? `Access Code: ${item.class_access}` : 'All Props Included'
    ],
    isActive: item.status !== 0,
    isFeatured: true,
    displayOrder: 1,
    metadata: {
      location: pType === 'retreat' ? 'Nepal Sanctuary & Resort' : 'Rishikesh Main Studio',
      eventDate: item.periods_start_date ? `Starts: ${item.periods_start_date}` : undefined,
      totalSeats: item.total_access_sessions || 20,
      bookedSeats: Math.floor((item.total_access_sessions || 20) * 0.5),
      instructorName: pType === 'private' ? 'Master Shoaib M / Master Aarya' : 'Senior Faculty',
      validityPeriod: item.duration_label || '30 Days',
      classCount: item.benefit || 'Unlimited Sessions',
      certification: pType === 'teacher_training' ? '200-Hour RYT (Yoga Alliance)' : undefined,
    }
  };
}

export async function getDynamicPackages(typeFilter?: PackageType | 'all'): Promise<DynamicPackage[]> {
  let liveList: DynamicPackage[] = [];

  try {
    const res = await fetchFromApi<any>('get-packages');
    if (res && res.data && typeof res.data === 'object') {
      const allApiItems: DynamicPackage[] = [];
      for (const catName in res.data) {
        if (Array.isArray(res.data[catName])) {
          res.data[catName].forEach((item: any) => {
            allApiItems.push(mapPhpPackageToDynamicPackage(item, catName));
          });
        }
      }
      if (allApiItems.length > 0) {
        liveList = allApiItems;
      }
    }
  } catch (err) {
    console.warn('Live API get-packages fetch error, using cache:', err);
  }

  // Combine live API results with local modifications or fallbacks
  let finalList: DynamicPackage[] = liveList.length > 0 ? liveList : INITIAL_DYNAMIC_PACKAGES;

  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_PACKAGES_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Merge custom/updated items from local storage with liveList
        const mergedMap = new Map<string, DynamicPackage>();
        finalList.forEach(p => mergedMap.set(p.id, p));
        parsed.forEach(p => mergedMap.set(p.id, p));
        finalList = Array.from(mergedMap.values());
      }
    } else {
      localStorage.setItem(LOCAL_STORAGE_PACKAGES_KEY, JSON.stringify(finalList));
    }
  } catch (e) {
    console.warn('LocalStorage merge error:', e);
  }

  if (typeFilter && typeFilter !== 'all') {
    return finalList.filter(p => p.type === typeFilter);
  }
  return finalList;
}

export async function saveDynamicPackage(pkg: DynamicPackage): Promise<{ success: boolean; package: DynamicPackage }> {
  let savedPkg = { ...pkg };
  if (!savedPkg.id) {
    savedPkg.id = 'pkg-' + Date.now();
  }

  // Send request to API
  try {
    const res = await fetchFromApi<any>('save-dynamic-package', { package: savedPkg });
    if (res && res.status && res.data) {
      savedPkg = res.data;
    }
  } catch (err) {
    console.warn('API save-dynamic-package failed, saving locally:', err);
  }

  // Save in LocalStorage
  try {
    const currentList = await getDynamicPackages('all');
    const existingIndex = currentList.findIndex(p => p.id === savedPkg.id);
    let updatedList: DynamicPackage[];
    if (existingIndex >= 0) {
      updatedList = [...currentList];
      updatedList[existingIndex] = savedPkg;
    } else {
      updatedList = [savedPkg, ...currentList];
    }
    localStorage.setItem(LOCAL_STORAGE_PACKAGES_KEY, JSON.stringify(updatedList));
  } catch (e) {
    console.warn('LocalStorage save error:', e);
  }

  return { success: true, package: savedPkg };
}

export async function deleteDynamicPackage(id: string): Promise<boolean> {
  try {
    await fetchFromApi<any>('delete-dynamic-package', { id });
  } catch (err) {
    console.warn('API delete-dynamic-package failed, deleting locally:', err);
  }

  try {
    const currentList = await getDynamicPackages('all');
    const updatedList = currentList.filter(p => p.id !== id);
    localStorage.setItem(LOCAL_STORAGE_PACKAGES_KEY, JSON.stringify(updatedList));
  } catch (e) {
    console.warn('LocalStorage delete error:', e);
  }

  return true;
}

export async function toggleDynamicPackageActive(id: string, isActive: boolean): Promise<boolean> {
  const currentList = await getDynamicPackages('all');
  const pkg = currentList.find(p => p.id === id);
  if (pkg) {
    pkg.isActive = isActive;
    await saveDynamicPackage(pkg);
    return true;
  }
  return false;
}

