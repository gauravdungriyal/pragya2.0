export interface ClassScheduleItem {
  id: string;
  title: string;
  date: string;
  instructor: string;
  color: string;
  timing: string;
  book_limit: string;
  booked: number;
  levels: string;
  completed: string;
  credit: string;
  book_cost: string;
  is_booked: boolean;
  showButton: string;
  buttonType: string;
  booking_id: string;
  description: string;
  video: string;
  duration: string;
  schedule_id: string;
  room?: string;
  pillar?: string;
}

export interface Instructor {
  staff_id: number;
  name: string;
  description: string;
  designation?: string;
  photo?: string;
  image?: string;
  specialization?: string[];
  experience?: string;
}

export type PackageType = 
  | 'teacher_training' 
  | 'workshop' 
  | 'event' 
  | 'retreat' 
  | 'regular' 
  | 'private' 
  | 'free_class';

export interface ItineraryItem {
  day: string;
  title: string;
  detail: string;
}

export interface SyllabusModule {
  moduleTitle: string;
  topics: string[];
}

export interface RoomOption {
  name: string;
  price: number;
}

export interface PackageMetadata {
  // Teacher Training
  certification?: string; // e.g. "200-Hour RYT"
  totalHours?: number;
  syllabus?: SyllabusModule[];
  batchDates?: string;

  // Retreat
  location?: string;
  itinerary?: ItineraryItem[];
  roomOptions?: RoomOption[];

  // Workshop & Event
  eventDate?: string;
  eventTime?: string;
  venue?: string;
  totalSeats?: number;
  bookedSeats?: number;
  instructorName?: string;
  instructorRole?: string;

  // Regular Package
  validityPeriod?: string;
  classCount?: number | string;

  // Private Session
  sessionDuration?: string;
  focusAreas?: string[];
  assignedInstructor?: string;

  // Free Class
  eligibilityText?: string;
  validForDays?: number;
}

export interface DynamicPackage {
  id: string;
  type: PackageType;
  title: string;
  subtitle?: string;
  price: number;
  discountPrice?: number;
  currency: string;
  badge?: string;
  badgeColor?: string;
  coverImage?: string;
  gallery?: string[];
  description: string;
  features: string[];
  isActive: boolean;
  isFeatured?: boolean;
  displayOrder: number;
  metadata: PackageMetadata;
}

export interface PackageItem {
  id: number;
  packageID: string | null;
  title: string;
  payment_type: number;
  amount: number;
  discount_type?: string;
  discount?: string;
  discount_remarks?: string;
  discount_start?: string | null;
  discount_end?: string | null;
  frequency: number;
  period: string;
  duration_type: number;
  duration_length: number;
  category?: 'Private' | 'Group' | 'Retreat' | 'Membership';
  description?: string;
  features?: string[];
  type?: PackageType;
  metadata?: PackageMetadata;
}

export interface UpcomingEvent {
  id: string;
  title: string;
  name: string;
  description: string;
  date?: string;
  time?: string;
  location?: string;
  image?: string;
  banner_image?: { url: string };
  price?: string;
  amount?: number;
  category?: string;
  level?: string;
  duration?: string;
  focus?: string;
  instructor_name?: string;
  instructor_bio?: string;
  starts_at?: string;
  ends_at?: string;
  countdown_label?: string;
  difficulty_tags?: string[];
  instructor?: { name?: string; title?: string; image?: string } | null;
  benefits?: { slug: string; label: string; icon: string }[];
  spots_label?: string;
  share_url?: string;
}

export interface DailyQuote {
  q: string;
  a: string;
  h: string;
}

export interface FaqItem {
  question: string;
  answer: string;
  category?: string;
}

export interface FilterOptions {
  instructors: { id: string; name: string }[];
  levels?: { id: string; name: string }[];
  pillars?: { id: string; name: string }[];
  rooms?: { id: string; name: string }[];
}
