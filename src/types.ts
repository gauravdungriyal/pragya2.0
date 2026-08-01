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
  specialization?: string[];
  experience?: string;
}

export interface PackageItem {
  id: number;
  packageID: string | null;
  title: string;
  payment_type: number;
  amount: number;
  discount_type: string;
  discount: string;
  discount_remarks: string;
  discount_start: string | null;
  discount_end: string | null;
  frequency: number;
  period: string;
  duration_type: number;
  duration_length: number;
  category?: 'Private' | 'Group' | 'Retreat' | 'Membership';
  description?: string;
  features?: string[];
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
  price?: string;
  category?: string;
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
