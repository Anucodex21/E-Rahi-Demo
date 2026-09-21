import { HospitalFacility, HotelLodge, LocalStoreClinic, CollegeUniversity } from '../types';

/**
 * Realistic City Services Database
 * Covers Hospitals (specialist doctors, ratings, contact, emergency timing, treated symptoms),
 * Hourly Hotels & Lodges for exams/interviews/students,
 * Colleges & Universities (ratings, streams, budget, fees),
 * Local Clinics & Promoted Stores.
 */

// 1. HOSPITALS
export const SAMPLE_HOSPITALS: HospitalFacility[] = [
  {
    id: 'hosp-bareilly-district',
    name: 'District Government Hospital (Pandit Deendayal Upadhyay)',
    hindiName: 'जिला पुरुष एवं महिला अस्पताल (पंडित दीनदयाल उपाध्याय)',
    category: 'government',
    rating: 4.4,
    totalReviews: 890,
    address: 'Civil Lines, Near Ayub Khan Chauraha, Bareilly, UP 243001',
    phone: '+91 581 242 0102',
    emergencyHelpline: '108 / +91 581 242 0108',
    email: 'cmobareilly@up.nic.in',
    timing: '24x7 Emergency, Trauma & OPD 8:00 AM - 2:00 PM',
    lat: 28.3685,
    lng: 79.4210,
    cityName: 'Bareilly',
    stateCode: 'UP',
    bedsAvailableEst: 42,
    ayushmanBharatAccepted: true,
    services: ['24x7 Emergency Trauma Care', 'Ayushman Golden Card Desk', 'Blood Bank (O+, B+, A-)', 'Digital X-Ray & CT Scan', 'Free Generic Pharmacy'],
    treatedSymptoms: ['accident', 'fever', 'head injury', 'fracture', 'delivery maternity', 'poisoning', 'burn', 'chest pain', 'loose motion'],
    specialistDoctors: [
      {
        name: 'Dr. Ramesh Kumar Saxena',
        specialization: 'Chief Medical Officer & General Physician',
        experienceYears: 24,
        availableTiming: '9:00 AM - 1:00 PM (Mon-Sat)',
        consultationFee: 1, // Govt token ₹1
        opdDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
      },
      {
        name: 'Dr. Sunita Verma',
        specialization: 'Senior Gynecologist & Maternity Specialist',
        experienceYears: 18,
        availableTiming: '10:00 AM - 2:00 PM',
        consultationFee: 1,
        opdDays: ['Mon', 'Wed', 'Fri']
      },
      {
        name: 'Dr. V. K. Aggarwal',
        specialization: 'Senior Orthopedic Surgeon (Fractures & Joints)',
        experienceYears: 21,
        availableTiming: '10:30 AM - 1:30 PM',
        consultationFee: 1,
        opdDays: ['Tue', 'Thu', 'Sat']
      }
    ]
  },
  {
    id: 'hosp-clara-swain',
    name: 'Clara Swain Mission Hospital (Asia\'s 1st Women Hospital)',
    hindiName: 'क्लारा स्वेन मिशन अस्पताल',
    category: 'private_multispecialty',
    rating: 4.6,
    totalReviews: 1240,
    address: 'Near Chowki Chauraha, Civil Lines, Bareilly, UP 243001',
    phone: '+91 581 251 0422',
    emergencyHelpline: '+91 94122 88400',
    email: 'info@claraswainhospital.org',
    timing: '24x7 Emergency & Critical Care',
    lat: 28.3590,
    lng: 79.4180,
    cityName: 'Bareilly',
    stateCode: 'UP',
    bedsAvailableEst: 18,
    ayushmanBharatAccepted: true,
    services: ['Cardiology & Cath Lab', 'Neonatal ICU (NICU)', 'Emergency Ambulance 24x7', 'Laparoscopic Surgery', 'Dialysis Unit'],
    treatedSymptoms: ['heart attack', 'chest pain', 'breathing problem', 'asthma', 'pediatric child illness', 'kidney stone', 'pregnancy complications'],
    specialistDoctors: [
      {
        name: 'Dr. Amit Gangwar',
        specialization: 'Interventional Cardiologist (Heart Specialist)',
        experienceYears: 15,
        availableTiming: '11:00 AM - 4:00 PM',
        consultationFee: 500,
        opdDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
      },
      {
        name: 'Dr. Rebecca Mathews',
        specialization: 'Senior Pediatrician (Child & Newborn Specialist)',
        experienceYears: 19,
        availableTiming: '10:00 AM - 3:00 PM',
        consultationFee: 400,
        opdDays: ['Mon', 'Tue', 'Thu', 'Fri']
      },
      {
        name: 'Dr. Alok Ranjan',
        specialization: 'Neurologist (Brain & Stroke Specialist)',
        experienceYears: 14,
        availableTiming: '2:00 PM - 6:00 PM',
        consultationFee: 600,
        opdDays: ['Wed', 'Sat']
      }
    ]
  },
  {
    id: 'hosp-gangasheel',
    name: 'Gangasheel Super Speciality Hospital & Trauma Centre',
    hindiName: 'गंगाशील सुपर स्पेशियलिटी हॉस्पिटल एवं ट्रॉमा सेंटर',
    category: 'emergency_trauma',
    rating: 4.8,
    totalReviews: 2150,
    address: 'Deen Dayal Puram, Bareilly, UP 243122',
    phone: '+91 581 230 3344',
    emergencyHelpline: '+91 581 230 0000',
    email: 'emergency@gangasheel.com',
    timing: '24x7 Emergency, ICU & Trauma',
    lat: 28.3840,
    lng: 79.4350,
    cityName: 'Bareilly',
    stateCode: 'UP',
    bedsAvailableEst: 28,
    ayushmanBharatAccepted: true,
    services: ['Level 1 Trauma Care', 'Neuro & Spine Surgery', 'Advanced ICU & Ventilators', '24x7 In-House Pharmacy', 'Cardiac Emergency'],
    treatedSymptoms: ['severe accident', 'stroke paralysis', 'fracture backbone', 'severe burns', 'unconscious', 'chest pain', 'bleeding'],
    specialistDoctors: [
      {
        name: 'Dr. Nishant Gupta',
        specialization: 'Neurosurgeon (Brain & Spine)',
        experienceYears: 16,
        availableTiming: '10:00 AM - 2:00 PM & 6:00 PM - 8:00 PM',
        consultationFee: 700,
        opdDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
      },
      {
        name: 'Dr. Shalini Singhal',
        specialization: 'Pulmonologist & Critical Care (Chest & Lungs)',
        experienceYears: 12,
        availableTiming: '12:00 PM - 5:00 PM',
        consultationFee: 500,
        opdDays: ['Mon', 'Wed', 'Fri']
      }
    ]
  },
  {
    id: 'hosp-rohilkhand-medical',
    name: 'Rohilkhand Medical College & Hospital (RMCH)',
    hindiName: 'रुहेलखंड मेडिकल कॉलेज एवं हॉस्पिटल',
    category: 'private_multispecialty',
    rating: 4.5,
    totalReviews: 1890,
    address: 'Pilibhit Bypass Road, Bareilly, UP 243006',
    phone: '+91 581 252 6053',
    emergencyHelpline: '+91 581 252 6051',
    email: 'hospital@rmch.ac.in',
    timing: '24x7 Hospital Services, OPD 9 AM - 3 PM',
    lat: 28.3550,
    lng: 79.4650,
    cityName: 'Bareilly',
    stateCode: 'UP',
    bedsAvailableEst: 65,
    ayushmanBharatAccepted: true,
    services: ['Multi-Organ Care', '1000+ Bed Facility', 'Subsidized OPD & Surgeries', 'MRI, PET-CT & Radiotherapy', 'Super-Specialty Clinics'],
    treatedSymptoms: ['cancer oncology', 'kidney failure', 'liver jaundice', 'eye cataract', 'ear nose throat ent', 'dental surgery'],
    specialistDoctors: [
      {
        name: 'Dr. Ashok Aggarwal',
        specialization: 'Senior Medical Director & Oncologist',
        experienceYears: 26,
        availableTiming: '10:00 AM - 1:00 PM',
        consultationFee: 300,
        opdDays: ['Mon', 'Tue', 'Thu']
      },
      {
        name: 'Dr. Meenakshi Chauhan',
        specialization: 'ENT Surgeon (Ear, Nose, Throat Specialist)',
        experienceYears: 13,
        availableTiming: '9:30 AM - 2:00 PM',
        consultationFee: 200,
        opdDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
      }
    ]
  }
];

// 2. HOTELS, LODGES & HOURLY ROOMS FOR STUDENTS / EXAM CANDIDATES / TRAVELERS
export const SAMPLE_HOTELS: HotelLodge[] = [
  {
    id: 'hotel-student-junction',
    name: 'Transit & Exam Student Lodge (Hourly Available)',
    hindiName: 'स्टूडेंट ट्रांजिट लॉज एवं रेस्ट रूम (प्रति घंटा उपलब्ध)',
    type: 'student_lodge',
    rating: 4.7,
    totalReviews: 540,
    hourlyRate: 99, // ₹99 / 2 hours
    minHours: 2,
    perNightRate: 499,
    address: 'Station Road, 150m from Bareilly Junction Platform 1, Bareilly',
    nearHub: 'Bareilly Junction Railway Station',
    phone: '+91 94112 04511',
    lat: 28.3450,
    lng: 79.4120,
    cityName: 'Bareilly',
    features: ['High-Speed Wi-Fi for Exam Prep', 'Hot Water & Fresh Towels', 'Secure Luggage Lockers', 'Power Backup & Study Lamp', 'Early 5 AM Check-in'],
    idealFor: ['UPSC / SSC / NEET / JEE Exam Candidates', 'Interview Aspirants', 'Short 2-4 Hr Transit Refreshment', 'Single Budget Travelers'],
    verifiedByApp: true
  },
  {
    id: 'hotel-civil-lines-hourly',
    name: 'Smart Stay Rooms & Pods (Hourly & Night Stay)',
    hindiName: 'स्मार्ट स्टे रूम्स एवं पॉड्स',
    type: 'hourly_stay',
    rating: 4.8,
    totalReviews: 780,
    hourlyRate: 149, // ₹149 / 3 hours
    minHours: 3,
    perNightRate: 699,
    address: 'Civil Lines, Near Ayub Khan Chauraha, Bareilly',
    nearHub: 'Civil Lines & Bareilly Bus Terminal (Old)',
    phone: '+91 98370 19283',
    lat: 28.3640,
    lng: 79.4230,
    cityName: 'Bareilly',
    features: ['Split AC Rooms', 'Clean Attached Washroom', 'Tea/Coffee Maker', 'Desk & Charging Ports', 'Card & UPI Payment'],
    idealFor: ['Business Visitors', 'Exam Aspirants with Parents', 'Short Layover Refreshment', 'Couples & Solo Stays'],
    verifiedByApp: true
  },
  {
    id: 'hotel-comfort-inn-bypass',
    name: 'Comfort Inn Family & Student Hotel',
    hindiName: 'कम्फर्ट इन फैमिली व स्टूडेंट होटल',
    type: 'budget_hotel',
    rating: 4.5,
    totalReviews: 420,
    hourlyRate: 199,
    minHours: 3,
    perNightRate: 899,
    address: 'Pilibhit Bypass Road, Opposite Rohilkhand University Gate 2, Bareilly',
    nearHub: 'M.J.P. Rohilkhand University & Exam Center',
    phone: '+91 94120 77123',
    lat: 28.3690,
    lng: 79.4580,
    cityName: 'Bareilly',
    features: ['Walking Distance to University Gate', 'Family Suite with 3 Beds', 'Pure Veg In-House Mess', '24x7 Auto Rickshaw on Call', 'RO Purified Water'],
    idealFor: ['University Entrance & Semester Exam Students', 'Visiting Parents & Families', 'Educational Seminar Attendees'],
    verifiedByApp: true
  },
  {
    id: 'hotel-royal-heritage-junction',
    name: 'Hotel Royal Stay & Executive Lodge',
    hindiName: 'होटल रॉयल स्टे एवं एग्जीक्यूटिव लॉज',
    type: 'family_hotel',
    rating: 4.6,
    totalReviews: 610,
    hourlyRate: 249,
    minHours: 4,
    perNightRate: 1199,
    address: 'Subhash Nagar Road, Near Bareilly City Station, Bareilly',
    nearHub: 'Bareilly City Railway Station',
    phone: '+91 581 247 8899',
    lat: 28.3610,
    lng: 79.4050,
    cityName: 'Bareilly',
    features: ['Elevator / Lift', 'Room Service & Breakfast', 'Free High Speed Wi-Fi', 'Soundproof Windows', 'Taxi & Auto Booking'],
    idealFor: ['Families Traveling for Weddings / Functions', 'Corporate & Field Officers', 'Longer Stay with Heavy Bags'],
    verifiedByApp: true
  }
];

// 3. COLLEGES & UNIVERSITIES (Real-time ratings, streams, budget, fees)
export const SAMPLE_COLLEGES: CollegeUniversity[] = [
  {
    id: 'univ-mjpru',
    name: 'Mahatma Jyotiba Phule Rohilkhand University (MJPRU)',
    hindiName: 'महात्मा ज्योतिबा फुले रुहेलखंड विश्वविद्यालय',
    type: 'government_university',
    rating: 4.6,
    totalReviews: 3840,
    establishedYear: 1975,
    address: 'Pilibhit Bypass Road, Bareilly, UP 243006',
    phone: '+91 581 252 0401',
    email: 'registrar@mjpru.ac.in',
    website: 'https://mjpru.ac.in',
    lat: 28.3710,
    lng: 79.4620,
    cityName: 'Bareilly',
    streams: [
      'Engineering & Technology (B.Tech, M.Tech)',
      'Management & MBA',
      'Law & Judicial Studies (LLB, LLM)',
      'Pharmacy (B.Pharm, M.Pharm)',
      'Arts, Science & Humanities (BA, B.Sc, M.Sc)'
    ],
    annualFeeRange: '₹18,000 - ₹65,000 / year (Govt Subsidized)',
    budgetCategory: 'affordable',
    highlights: [
      'NAAC A++ Grade State University',
      'Central Examination Center for 500+ Affiliated Colleges',
      'Boys & Girls On-Campus Hostels',
      'Dedicated E-Rickshaw Stand outside Gate 1 & 2',
      'Central Wi-Fi Enabled Library'
    ],
    examCenterActive: true
  },
  {
    id: 'univ-bareilly-college',
    name: 'Bareilly College Bareilly (Historic Premier Institution)',
    hindiName: 'बरेली कॉलेज बरेली (1837 स्थापित)',
    type: 'government_university',
    rating: 4.5,
    totalReviews: 4120,
    establishedYear: 1837,
    address: 'Shahamat Ganj / College Road, Bareilly, UP 243005',
    phone: '+91 581 256 7808',
    email: 'principal@bareillycollege.org',
    website: 'https://bareillycollege.org',
    lat: 28.3580,
    lng: 79.4310,
    cityName: 'Bareilly',
    streams: [
      'Arts & Literature (BA, MA)',
      'Commerce & Accountancy (B.Com, M.Com)',
      'Sciences (B.Sc Physics, Chemistry, Bio)',
      'Law (LLB 3 Years)',
      'BBA & BCA Computer Applications'
    ],
    annualFeeRange: '₹4,500 - ₹18,000 / year (Very Affordable)',
    budgetCategory: 'affordable',
    highlights: [
      'One of the Oldest Colleges in India (Est. 1837)',
      'Alumni including Top Judges, IAS Officers & Scientists',
      'Walking distance from Shyamganj & Kutubkhana',
      'Affiliated with MJPRU'
    ],
    examCenterActive: true
  },
  {
    id: 'univ-ivri',
    name: 'Indian Veterinary Research Institute (IVRI Deemed University)',
    hindiName: 'भारतीय पशुचिकित्सा अनुसंधान संस्थान (आई.वी.आर.आई.)',
    type: 'government_university',
    rating: 4.9,
    totalReviews: 2480,
    establishedYear: 1889,
    address: 'Izatnagar, Bareilly, UP 243122',
    phone: '+91 581 258 6230',
    email: 'dirivri@ivri.res.in',
    website: 'https://ivri.nic.in',
    lat: 28.4020,
    lng: 79.4410,
    cityName: 'Bareilly',
    streams: [
      'Veterinary Science (B.V.Sc & A.H.)',
      'Postgraduate & PhD Research (M.V.Sc, Ph.D)',
      'Biotechnology & Animal Genetics',
      'Epidemiology & Veterinary Public Health'
    ],
    annualFeeRange: '₹12,000 - ₹35,000 / year (Full ICAR Fellowship available)',
    budgetCategory: 'affordable',
    highlights: [
      'National Premier Institute of ICAR (Deemed University)',
      'Huge 800-acre Lush Green Research Campus',
      'High Placement & Scientist Recruitments',
      'Direct Transit via Izatnagar Station'
    ],
    examCenterActive: false
  },
  {
    id: 'univ-invertis',
    name: 'Invertis University (Private Multi-Disciplinary Campus)',
    hindiName: 'इन्वर्टिस यूनिवर्सिटी बरेली',
    type: 'private_university',
    rating: 4.4,
    totalReviews: 3100,
    establishedYear: 1998,
    address: 'Bareilly-Lucknow Highway NH-24, Bareilly, UP 243123',
    phone: '+91 581 246 0442',
    email: 'info@invertis.org',
    website: 'https://invertisuniversity.ac.in',
    lat: 28.3180,
    lng: 79.5120,
    cityName: 'Bareilly',
    streams: [
      'Computer Science & AI Engineering (B.Tech)',
      'MBA & Corporate Management',
      'Agriculture & Forestry (B.Sc Ag)',
      'Pharmacy & Nursing',
      'Journalism & Mass Comm'
    ],
    annualFeeRange: '₹75,000 - ₹1,45,000 / year',
    budgetCategory: 'moderate',
    highlights: [
      'UGC Recognized Private University',
      'Placement Tie-Ups with MNCs (TCS, Infosys, Wipro)',
      'Air-Conditioned Hostels & Sports Complex',
      'Dedicated Shuttle Buses from Bareilly City'
    ],
    examCenterActive: true
  }
];

// 4. LOCAL CLINICS & PROMOTED COMMUNITY STORES
export const SAMPLE_LOCAL_STORES: LocalStoreClinic[] = [
  {
    id: 'store-shree-shyam-med',
    businessName: 'Shree Shyam 24x7 Chemist & Diagnostic Clinic',
    category: 'clinic_pharmacy',
    rating: 4.8,
    ownerName: 'Sunil Agarwal (Pharmacist)',
    phone: '+91 94121 55660',
    address: 'Opp. District Hospital Gate, Civil Lines, Bareilly',
    timing: 'Open 24 Hours (Night Emergency Window Available)',
    lat: 28.3688,
    lng: 79.4215,
    cityName: 'Bareilly',
    discountOffer: '15% Flat Discount on Generic Medicines & Baby Food for E-Rahi Users',
    isPromoted: true,
    promotedBadge: 'Verified Health Partner'
  },
  {
    id: 'store-student-book-depot',
    businessName: 'Bareilly Book Depot & Competition Exam Center',
    category: 'student_bookstore',
    rating: 4.7,
    ownerName: 'Ravi Prakash Rastogi',
    phone: '+91 581 254 0912',
    address: 'Kutubkhana Bazaar, Near Clock Tower, Bareilly',
    timing: '9:30 AM - 9:00 PM',
    lat: 28.3620,
    lng: 79.4190,
    cityName: 'Bareilly',
    discountOffer: '20% Off on NCERT, Lucent & Competition Test Series with E-Rahi pass',
    isPromoted: true,
    promotedBadge: 'Top Student Hub'
  },
  {
    id: 'store-sharma-ev-battery',
    businessName: 'Sharma E-Rickshaw Battery Fast Charging & Tyre Hub',
    category: 'repairs_battery',
    rating: 4.9,
    ownerName: 'Manoj Sharma',
    phone: '+91 98970 88219',
    address: 'Shyamganj Mandi Road, Near Flyover Pillar 14, Bareilly',
    timing: '6:00 AM - 11:00 PM',
    lat: 28.3540,
    lng: 79.4320,
    cityName: 'Bareilly',
    discountOffer: '₹30 Fast Swap for E-Rahi Drivers + Free Tyre Air Check',
    isPromoted: true,
    promotedBadge: 'Official Driver Station'
  },
  {
    id: 'store-life-care-pathology',
    businessName: 'LifeCare Blood & Pathology Lab (Home Collection)',
    category: 'diagnostic_lab',
    rating: 4.6,
    ownerName: 'Dr. Neeraj Saxena (Pathologist)',
    phone: '+91 94128 33100',
    address: 'Chowki Chauraha, Civil Lines, Bareilly',
    timing: '7:00 AM - 9:00 PM (Daily)',
    lat: 28.3605,
    lng: 79.4185,
    cityName: 'Bareilly',
    discountOffer: 'Free Blood Sugar & BP check + 25% off on Full Body Health Checkup',
    isPromoted: false
  }
];

// Helper to compute distance between two coords in km
export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}
