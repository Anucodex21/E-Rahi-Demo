export type LocationCategory = 
  | 'railway_station' 
  | 'bus_terminal' 
  | 'market' 
  | 'chauraha' 
  | 'hospital' 
  | 'university' 
  | 'erickshaw_stand'
  | 'police_station';

export interface BareillyLocation {
  id: string;
  name: string;
  hindiName: string;
  category: LocationCategory;
  lat: number;
  lng: number;
  description: string;
  isChokeHazard: boolean;
  erickshawChargingAvailable?: boolean;
}

// Universal alias for all cities across India
export type TransitLocation = BareillyLocation;

export interface CityData {
  id: string;
  name: string;
  hindiName: string;
  stateId: string;
  stateName: string;
  tagline: string;
  center: { lat: number; lng: number };
  zoom: number;
  locations: TransitLocation[];
  chokeZones: ChokeZoneInfo[];
  reports: TrafficReport[];
  policeNotices: {
    id: string;
    title: string;
    hindiTitle: string;
    summary: string;
    badge: string;
    badgeColor: string;
  }[];
  defaultOriginId: string;
  defaultDestId: string;
  baseFare: number;
  perKmRate: number;
}

export interface StateData {
  id: string;
  name: string;
  hindiName: string;
  code: string;
  cities: CityData[];
}

export type ReportCategory = 
  | 'erickshaw_gridlock' 
  | 'bottleneck' 
  | 'festive_rush' 
  | 'railway_crossing' 
  | 'narrow_street_block' 
  | 'police_diversion' 
  | 'waterlogging';

export type ReportSeverity = 'critical' | 'heavy' | 'moderate' | 'clearing';

export interface TrafficReport {
  id: string;
  locationName: string;
  category: ReportCategory;
  title: string;
  description: string;
  severity: ReportSeverity;
  coordinates: {
    lat: number;
    lng: number;
  };
  upvotes: number;
  downvotes: number;
  reportedAt: string;
  verifiedByPolice?: boolean;
  verifiedByGps?: boolean;
  gpsDistanceMeters?: number | null;
  fraudWarning?: string | null;
  userType: 'erickshaw_driver' | 'commuter';
  avoidanceTip?: string;
}

export interface RouteOption {
  id: string;
  name: string;
  tagline: string;
  distanceKm: number;
  durationMin: number;
  chokedDurationMin: number;
  timeSavedMin: number;
  fareEstimate?: number;
  isRecommended: boolean;
  isBypass: boolean;
  congestionLevel: 'low' | 'medium' | 'high' | 'deadlock';
  pathPoints: [number, number][];
  stepInstructions: string[];
  avoidedChokepoints: string[];
  rickshawSuitability: 'optimal' | 'moderate' | 'restricted';
}

export type UserMode = 'commuter' | 'driver';

export type VehicleProfile = 'erickshaw' | 'twowheeler' | 'car';

export type AppLanguage = 'en' | 'hi' | 'ur';

export interface RoadSegmentWeight {
  segmentId: string;
  id?: string;
  name: string;
  hindiName: string;
  urduName: string;
  baseTravelTimeMin: number;
  currentTravelTimeMin: number;
  weightMultiplier: number; // e.g. 1.0 -> 3.5
  penaltyMultiplier?: number;
  reportCount15Min: number;
  isAutoPenaltyTriggered: boolean; // triggered if >= 3 reports within 15 min
  lastReportedTimestamp?: string;
  status: 'Normal' | 'Slowdown' | 'Standstill (Auto-Detour Active)';
}

export interface NearbyHazardResult {
  report: TrafficReport;
  distanceMeters: number;
  isWithinGeofence: boolean;
}

export interface AIRouteAdvice {
  headline: string;
  recommendedRoute: string;
  avoidHotspots: string[];
  estimatedTimeMin: number;
  standardTimeMin: number;
  timeSavedMin: number;
  trafficPoliceAdvisory: string;
  hindiAlert: string;
}

export interface LiveRideState {
  isActive: boolean;
  mode: 'real_gps' | 'auto_simulation';
  currentLocation: { lat: number; lng: number } | null;
  speedKmh: number;
  heading: number; // degrees
  distanceRemainingKm: number;
  timeRemainingMin: number;
  totalDistanceKm: number;
  totalDurationMin: number;
  progressPercent: number;
  currentStepIndex: number;
  currentStepInstruction: string;
  nextChokepointAhead?: string;
  isInsideAuto: boolean;
  startedAt?: number;
}

export interface ChokeZoneInfo {
  id: string;
  name: string;
  hindiName: string;
  congestionScore: number; // 0 to 100
  activeRickshawsEst: number;
  status: 'Critical Standstill' | 'Heavy Crawl' | 'Moderate' | 'Smooth Bypass';
  cause: string;
  lat: number;
  lng: number;
}

export type ComplaintCategory =
  | 'emergency_help'
  | 'auto_overcharging'
  | 'reckless_driving'
  | 'road_blocked'
  | 'harassment_safety'
  | 'lost_belonging'
  | 'auto_refusal'
  | 'other_issue';

export interface CitizenComplaint {
  id: string;
  name: string;
  phone: string;
  issueType: ComplaintCategory;
  description: string;
  emergency: boolean;
  userGps: {
    lat: number;
    lng: number;
    accuracyMeters?: number;
    addressHint?: string;
  };
  cityName?: string;
  createdAt: string;
  status: 'DISPATCHED' | 'UNDER_REVIEW' | 'RESOLVED';
  ticketNumber: string;
}

export type UserRole = 'commuter' | 'driver' | 'police_official';

export interface UserProfile {
  id: string;
  name: string;
  phone: string;
  email?: string;
  role: UserRole;
  avatar: string;
  cityName: string;
  stateCode: string;
  isVerifiedDriver?: boolean;
  vehicleNumber?: string; // e.g. "UP25 ET 9842"
  batteryCapacityKwh?: number;
  guardianPhone?: string;
  reputationPoints: number;
  reportsSubmitted: number;
  favoriteRoutes?: { from: string; to: string }[];
  memberSince: string;
  isPremium?: boolean;
  premiumExpiryDate?: string;
}

// -------------------------------------------------------------
// NEW CITY SERVICES: Hospitals, Hotels/Lodges, Stores/Clinics, Colleges, Premium
// -------------------------------------------------------------

export interface SpecialistDoctor {
  name: string;
  specialization: string; // e.g., 'Cardiologist', 'Pediatrician', 'Orthopedic', 'Neurologist', 'Gynecologist', 'General Physician'
  experienceYears: number;
  availableTiming: string;
  consultationFee: number;
  opdDays: string[];
}

export interface HospitalFacility {
  id: string;
  name: string;
  hindiName: string;
  category: 'government' | 'private_multispecialty' | 'emergency_trauma' | 'maternity_childcare';
  rating: number; // e.g., 4.7
  totalReviews: number;
  address: string;
  phone: string;
  emergencyHelpline: string;
  email: string;
  timing: string; // e.g. "24x7 Emergency Services"
  lat: number;
  lng: number;
  cityName: string;
  stateCode: string;
  specialistDoctors: SpecialistDoctor[];
  services: string[]; // e.g., ['ICU & NICU', 'CT Scan & MRI', '24x7 Pharmacy', 'Dialysis', 'Trauma Care']
  treatedSymptoms: string[]; // For smart symptom matching: e.g. ['chest pain', 'fever', 'fracture', 'accident', 'headache']
  bedsAvailableEst?: number;
  ayushmanBharatAccepted?: boolean;
}

export interface HotelLodge {
  id: string;
  name: string;
  hindiName: string;
  type: 'hourly_stay' | 'student_lodge' | 'budget_hotel' | 'family_hotel';
  rating: number;
  totalReviews: number;
  hourlyRate: number; // e.g. ₹99/hr or ₹149/3hr
  minHours?: number; // e.g. 2 hrs or 3 hrs
  perNightRate: number; // e.g. ₹699/night
  address: string;
  nearHub: string; // e.g. 'Near Railway Station', 'Near Exam Center / University'
  phone: string;
  lat: number;
  lng: number;
  cityName: string;
  features: string[]; // ['Free High-Speed Wi-Fi', 'AC & Power Backup', 'Quiet Study Desk', 'Luggage Locker', '24x7 Check-in']
  idealFor: string[]; // ['Exam Candidates', 'Interview Aspirants', 'Short Transit / 3-Hr Rest', 'Parents & Family']
  verifiedByApp: boolean;
}

export interface LocalStoreClinic {
  id: string;
  businessName: string;
  category: 'clinic_pharmacy' | 'diagnostic_lab' | 'grocery_mart' | 'student_bookstore' | 'repairs_battery';
  rating: number;
  ownerName: string;
  phone: string;
  address: string;
  timing: string;
  lat: number;
  lng: number;
  cityName: string;
  discountOffer?: string; // e.g. "15% off on generic medicines for E-Rahi users"
  isPromoted: boolean;
  promotedBadge?: string; // e.g. 'Featured Local Partner'
}

export interface CollegeUniversity {
  id: string;
  name: string;
  hindiName: string;
  type: 'government_university' | 'private_university' | 'engineering_polytechnic' | 'medical_college' | 'degree_college';
  rating: number;
  totalReviews: number;
  establishedYear: number;
  address: string;
  phone: string;
  email: string;
  website?: string;
  lat: number;
  lng: number;
  cityName: string;
  streams: string[]; // ['Engineering (B.Tech)', 'Medical (MBBS)', 'Law (LLB)', 'Commerce & MBA', 'Arts & Science']
  annualFeeRange: string; // e.g. '₹25,000 - ₹85,000 / year'
  budgetCategory: 'affordable' | 'moderate' | 'premium';
  highlights: string[]; // ['NAAC A+ Accredited', 'Direct E-Rickshaw Route from Station', 'Hostel for Boys & Girls']
  examCenterActive?: boolean; // When students come for entrance tests
}

export type CityServicesTab = 'hospitals' | 'hotels' | 'colleges' | 'local_stores';

// Emergency SOS & Professional Guardian System Types
export type GuardianRelationship = 
  | 'Husband' 
  | 'Wife' 
  | 'Father' 
  | 'Mother' 
  | 'Brother' 
  | 'Sister' 
  | 'Friend' 
  | 'Police' 
  | 'Guardian';

// -------------------------------------------------------------
// DIRECT BOOKINGS & APPOINTMENTS (Hotels, Lodges, Hospitals, Clinics)
// -------------------------------------------------------------

export type BookingCategory = 'hotel' | 'lodge' | 'hospital' | 'clinic';

export interface BookingRecord {
  id: string; // e.g. "ER-HTL-8491", "ER-OPD-302"
  bookingType: BookingCategory;
  venueId: string;
  venueName: string;
  venueHindiName?: string;
  venueAddress: string;
  venuePhone: string;
  venueLat: number;
  venueLng: number;
  cityName: string;
  createdAt: string; // ISO string
  status: 'CONFIRMED' | 'CHECKED_IN' | 'COMPLETED' | 'CANCELLED';
  
  // Customer details
  customerName: string;
  customerPhone: string;
  customerAge?: number;
  customerGender?: 'male' | 'female' | 'other';
  guardianName?: string;
  idProofType?: 'Aadhaar Card' | 'Voter ID' | 'Student ID' | 'Driving License' | 'Passport';
  
  // Stay / Appointment timing
  bookedDate: string; // e.g. "2026-09-20"
  bookedTimeSlot: string; // e.g. "10:30 AM", "2:00 PM - 5:00 PM"
  
  // Hotel & Lodge specifics
  stayType?: 'hourly' | 'nightly';
  durationHoursOrNights?: number;
  guestsCount?: number;
  roomType?: string;
  specialRequest?: string;
  
  // Hospital & Doctor specifics
  doctorName?: string;
  doctorSpecialization?: string;
  symptomsProblem?: string;
  ayushmanCardHolder?: boolean;
  opdTokenNumber?: string;
  consultationFee?: number;
  
  // Clinic & Lab specifics
  serviceType?: string;
  diagnosticTest?: string;
  homeCollection?: boolean;
  
  // Pricing & Payment
  estimatedAmount: number;
  discountApplied: number;
  finalPayableAmount: number;
  paymentMode: 'PAY_AT_VENUE' | 'UPI_ONLINE';
  isPaid: boolean;
  
  // Notes / Instructions
  instructions: string[];
}

export interface EmergencyContact {
  id: string;
  name: string;
  relationship: GuardianRelationship;
  phone: string;
  isPrimary: boolean;
  notifyViaWhatsapp: boolean;
  notifyViaSms: boolean;
  lastNotifiedTimestamp?: string;
}

export interface DevicePowerState {
  batteryLevel: number; // 0 - 100
  isCharging: boolean;
  isCritical: boolean; // <= 10%
  isBatteryApiSupported: boolean;
  lastCheckedTime: string;
  isOnline: boolean;
}

export interface LastKnownLocationRecord {
  lat: number;
  lng: number;
  accuracyMeters: number;
  addressHint: string;
  timestamp: string;
  batteryLevel: number;
  reason: 'SOS_TRIGGER' | 'LOW_BATTERY_SHUTDOWN' | 'MANUAL_PIN' | 'DEVICE_RESTORED';
  dispatchedToContacts: string[];
}

export interface SafetyPermissionsState {
  geolocation: 'granted' | 'prompt' | 'denied';
  batteryMonitoring: boolean;
  notifications: 'granted' | 'default' | 'denied';
  audioAlerts: boolean;
  autoLastGaspDispatch: boolean;
}

// -------------------------------------------------------------
// NEW ENHANCEMENTS: Auto Stands, Battery Swapping & Voice Assistant
// -------------------------------------------------------------

export interface AutoStand {
  id: string;
  name: string;
  hindiName: string;
  cityName: string;
  stateCode: string;
  lat: number;
  lng: number;
  landmark: string;
  activeRickshawsEst: number;
  routes: {
    destinationName: string;
    distanceKm: number;
    standardSharedFare: number;
    travelTimeMin: number;
  }[];
  peakHours: string;
  nightServiceAvailable: boolean;
  unionHelpline?: string;
}

export interface BatterySwapPoint {
  id: string;
  name: string;
  provider: 'Battery Smart' | 'Sun Mobility' | 'Tata Power EZ' | 'IndiGrid Swapping' | 'Local Fast Charge Hub';
  cityName: string;
  address: string;
  lat: number;
  lng: number;
  phone: string;
  availableBatteries: number;
  totalSlots: number;
  swapFeeRupees: number;
  isOpen24Hours: boolean;
  isFastChargingSupported: boolean;
}

export interface VoiceQueryIntent {
  query: string;
  detectedIntent: 'route_search' | 'fare_check' | 'hospital_emergency' | 'hotel_search' | 'battery_swap' | 'sos_trigger' | 'general_info';
  spokenResponseHindi: string;
  spokenResponseEnglish: string;
  targetView?: 'navigator' | 'services' | 'fare' | 'roadmap' | 'sos';
  targetMobileTab?: 'map' | 'route' | 'cockpit' | 'services' | 'fare' | 'feed' | 'police' | 'roadmap' | 'sos';
  routeParams?: {
    originName?: string;
    destinationName?: string;
  };
}

