/**
 * FAQ List — for the Admin Dashboard FAQ Manager
 * These are the categorized FAQs the chatbot's knowledge covers.
 * Sourced from pyshk.com. The AI answers from the full knowledge base,
 * but this list gives the admin a manageable view of coverage.
 */

const FAQ_LIST = [
  // Admissions
  { category: "Admissions", question: "How do I enroll in a class?", answer: "Start with the 3-Class Trial Pass (HK$450), or contact us to join a membership. The trial fee counts toward your membership if you join." },
  { category: "Admissions", question: "Do you offer a trial class?", answer: "Yes — the 3-Class Trial Pass is HK$450 for 3 classes over 3 weeks." },
  { category: "Admissions", question: "Can beginners join?", answer: "Absolutely. Our Starter Membership and classes like Flexibility and Restorative are ideal for beginners." },

  // Fees
  { category: "Fees", question: "How much is the Unlimited Membership?", answer: "HK$9,707 for 6 months or HK$18,098 for 12 months." },
  { category: "Fees", question: "What is a single drop-in class?", answer: "A single drop-in class is HK$288." },
  { category: "Fees", question: "Do you have payment plans?", answer: "Payment plans are available for some memberships. Contact info@pyshk.com for details." },

  // Courses
  { category: "Courses", question: "What types of yoga classes do you offer?", answer: "9 classes: Advanced, Balance, Flow, Pragya (signature), Flexibility, Restorative, Strength, Pregnancy-Friendly, and Traditional." },
  { category: "Courses", question: "Do you offer private classes?", answer: "Yes — 1-on-1 (from HK$13,200 for 10 hours) and 2-on-1 private classes, in-studio or online." },
  { category: "Courses", question: "Do you offer online classes?", answer: "Yes, private classes are available online. Group classes are held in-studio in Central, Hong Kong." },

  // Certification
  { category: "Certification", question: "Is the 200-Hour Teacher Training recognised?", answer: "Yes — it is university-affiliated (India), the only such TTC in Hong Kong, with a Certificate of Completion." },
  { category: "Certification", question: "How much is the Teacher Training?", answer: "The 200-Hour TTC is HK$38,000, held April–May 2026." },
  { category: "Certification", question: "What CET courses are available?", answer: "CET Hands-On Adjustment (HK$8,725) and Sacred Soundscapes CET (HK$10,750, 30 Yoga Alliance credits)." },

  // Schedule
  { category: "Schedule", question: "How far in advance can I book a class?", answer: "Up to 4 days in advance. Bookings close 4 hours before class. Minimum 3 students required." },
  { category: "Schedule", question: "What is the cancellation policy?", answer: "Group classes: cancel 6+ hours before or forfeit a credit. Private: cancel 24+ hours before." },
  { category: "Schedule", question: "What happens in bad weather?", answer: "Typhoon Signal 8+ or Black Rainstorm Warning before class means the class is automatically cancelled." },

  // Teachers
  { category: "Teachers", question: "Who is the founder of the school?", answer: "Aarya Kuldeep — a PhD Scholar with an MSc in Yogic Science and nearly a decade of international teaching experience." },
  { category: "Teachers", question: "Who are the master teachers?", answer: "Dr. Yatendra Dutt Amoli, Dr. Usha Jaiswal, and Dr. Rakesh Jaiswal." },

  // Contact
  { category: "Contact", question: "Where are you located?", answer: "1303-04, 13/F Tak Woo House, 1-3 Wo On Lane, Central, Hong Kong." },
  { category: "Contact", question: "How can I contact the school?", answer: "Phone +852 6708 2503, email info@pyshk.com, or visit pyshk.com." },
];

module.exports = { FAQ_LIST };
