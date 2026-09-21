import { AutoStand, BatterySwapPoint } from '../types';

/**
 * Realistic Data for Indian E-Rickshaw Ecosystem:
 * 1. Official Auto Rickshaw Stands with fixed stage fares and peak frequencies.
 * 2. EV Battery Swapping & Fast Charging Network Points.
 * 3. Offline Official Fare Matrix for Bareilly & Northern India Tier-2 transit hubs.
 */

export const SAMPLE_AUTO_STANDS: AutoStand[] = [
  {
    id: 'stand-bareilly-junction',
    name: 'Bareilly Junction Railway Station Main Stand',
    hindiName: 'बरेली जंक्शन मुख्य रेलवे स्टेशन ऑटो स्टैंड',
    cityName: 'Bareilly',
    stateCode: 'UP',
    lat: 28.3415,
    lng: 79.4182,
    landmark: 'Outside Platform 1 Exit, Near RPF Post',
    activeRickshawsEst: 38,
    peakHours: '05:30 AM - 10:00 AM & 06:00 PM - 11:30 PM (Train arrivals)',
    nightServiceAvailable: true,
    unionHelpline: '+91 94508 12341 (Bareilly E-Rickshaw Welfare Union)',
    routes: [
      { destinationName: 'Satellite Bus Stand (पीलीभीत/लखनऊ रोड)', distanceKm: 4.8, standardSharedFare: 15, travelTimeMin: 18 },
      { destinationName: 'Chowk Bazaar / Kutubkhana (कुतुबखाना)', distanceKm: 3.2, standardSharedFare: 10, travelTimeMin: 14 },
      { destinationName: 'Civil Lines / Ayub Khan Chauraha (अयूब खान)', distanceKm: 2.7, standardSharedFare: 10, travelTimeMin: 12 },
      { destinationName: 'MJPRU University Campus (रुहेलखंड वि.वि.)', distanceKm: 8.5, standardSharedFare: 25, travelTimeMin: 32 },
      { destinationName: 'Delapeer Mandi / Stadium (डेलापीर)', distanceKm: 5.6, standardSharedFare: 20, travelTimeMin: 22 },
      { destinationName: 'Izzatnagar Railway Station (इज्जतनगर)', distanceKm: 6.9, standardSharedFare: 20, travelTimeMin: 26 }
    ]
  },
  {
    id: 'stand-satellite-bus',
    name: 'Satellite Bus Stand Terminal Auto Hub',
    hindiName: 'सेटेलाइट बस स्टैंड प्रमुख ऑटो हब',
    cityName: 'Bareilly',
    stateCode: 'UP',
    lat: 28.3370,
    lng: 79.4580,
    landmark: 'Opposite State Transport Booking Counter',
    activeRickshawsEst: 45,
    peakHours: '07:00 AM - 11:00 PM',
    nightServiceAvailable: true,
    unionHelpline: '+91 98370 54129',
    routes: [
      { destinationName: 'Bareilly Junction (रेलवे स्टेशन)', distanceKm: 4.8, standardSharedFare: 15, travelTimeMin: 18 },
      { destinationName: 'Shyamganj Mandi / Pul (श्यामगंज)', distanceKm: 2.9, standardSharedFare: 10, travelTimeMin: 10 },
      { destinationName: 'Chowk / Kutubkhana (चौक बाजार)', distanceKm: 4.4, standardSharedFare: 15, travelTimeMin: 19 },
      { destinationName: 'University Gate (रुहेलखंड)', distanceKm: 6.2, standardSharedFare: 20, travelTimeMin: 24 },
      { destinationName: 'Nakatiya Cantonment (नकटिया)', distanceKm: 3.5, standardSharedFare: 15, travelTimeMin: 14 }
    ]
  },
  {
    id: 'stand-kutubkhana-chowk',
    name: 'Kutubkhana / Chowk City Center Stand',
    hindiName: 'कुतुबखाना घंटाघर / चौक बाज़ार ऑटो स्टैंड',
    cityName: 'Bareilly',
    stateCode: 'UP',
    lat: 28.3610,
    lng: 79.4140,
    landmark: 'Near Historic Clock Tower & Kotwali',
    activeRickshawsEst: 30,
    peakHours: '10:00 AM - 09:00 PM (Heavy Market Hours)',
    nightServiceAvailable: false,
    unionHelpline: '+91 94122 87610',
    routes: [
      { destinationName: 'Ayub Khan / Civil Lines (अयूब खान)', distanceKm: 1.8, standardSharedFare: 10, travelTimeMin: 8 },
      { destinationName: 'Bareilly Junction (स्टेशन)', distanceKm: 3.2, standardSharedFare: 10, travelTimeMin: 14 },
      { destinationName: 'Koharapeer Bypass (कोहाड़ापीर)', distanceKm: 1.9, standardSharedFare: 10, travelTimeMin: 9 },
      { destinationName: 'Satellite Stand (सेटेलाइट)', distanceKm: 4.4, standardSharedFare: 15, travelTimeMin: 19 }
    ]
  },
  {
    id: 'stand-mjpru-university',
    name: 'MJPRU University Gate Student Stand',
    hindiName: 'रुहेलखंड विश्वविद्यालय मुख्य गेट छात्र ऑटो स्टैंड',
    cityName: 'Bareilly',
    stateCode: 'UP',
    lat: 28.3840,
    lng: 79.4610,
    landmark: 'Opposite University Entrance Gate No. 1, Pilibhit Bypass',
    activeRickshawsEst: 28,
    peakHours: '08:30 AM - 11:30 AM & 02:00 PM - 05:30 PM (Class timings)',
    nightServiceAvailable: false,
    unionHelpline: '+91 98971 63200',
    routes: [
      { destinationName: 'Satellite Bus Terminal (सेटेलाइट)', distanceKm: 6.2, standardSharedFare: 20, travelTimeMin: 24 },
      { destinationName: 'Bareilly Junction (रेलवे स्टेशन)', distanceKm: 8.5, standardSharedFare: 25, travelTimeMin: 32 },
      { destinationName: 'Suresh Sharma Nagar (सुरेश शर्मा नगर)', distanceKm: 3.1, standardSharedFare: 10, travelTimeMin: 11 },
      { destinationName: 'Delapeer Chauraha (डेलापीर)', distanceKm: 4.7, standardSharedFare: 15, travelTimeMin: 16 }
    ]
  },
  {
    id: 'stand-delapeer-mandi',
    name: 'Delapeer / Stadium Chauraha Stand',
    hindiName: 'डेलापीर चौराहा एवं स्पोर्ट्स स्टेडियम स्टैंड',
    cityName: 'Bareilly',
    stateCode: 'UP',
    lat: 28.3812,
    lng: 79.4255,
    landmark: 'Near Delapeer Mandi Flyover Pillar 14',
    activeRickshawsEst: 25,
    peakHours: '06:00 AM - 10:00 AM & 04:00 PM - 08:30 PM',
    nightServiceAvailable: false,
    unionHelpline: '+91 94511 77209',
    routes: [
      { destinationName: 'Kutubkhana / Chowk (चौक बाज़ार)', distanceKm: 3.8, standardSharedFare: 15, travelTimeMin: 15 },
      { destinationName: 'Izzatnagar Workshop (इज्जतनगर)', distanceKm: 2.4, standardSharedFare: 10, travelTimeMin: 10 },
      { destinationName: 'Bareilly Junction (स्टेशन)', distanceKm: 5.6, standardSharedFare: 20, travelTimeMin: 22 }
    ]
  }
];

export const SAMPLE_BATTERY_SWAP_POINTS: BatterySwapPoint[] = [
  {
    id: 'swap-shyamganj-smart',
    name: 'Battery Smart Swapping Station (Shyamganj Hub)',
    provider: 'Battery Smart',
    cityName: 'Bareilly',
    address: 'Near Shyamganj Railway Crossing, Old Pilibhit Road, Bareilly',
    lat: 28.3520,
    lng: 79.4310,
    phone: '+91 98371 99012',
    availableBatteries: 14,
    totalSlots: 20,
    swapFeeRupees: 65,
    isOpen24Hours: true,
    isFastChargingSupported: true
  },
  {
    id: 'swap-junction-sun',
    name: 'Sun Mobility Quick-Swap Dock (Station Road)',
    provider: 'Sun Mobility',
    cityName: 'Bareilly',
    address: 'Outside Goods Shed Road, 200m from Bareilly Junction Exit',
    lat: 28.3430,
    lng: 79.4195,
    phone: '+91 94120 44321',
    availableBatteries: 9,
    totalSlots: 16,
    swapFeeRupees: 60,
    isOpen24Hours: true,
    isFastChargingSupported: true
  },
  {
    id: 'swap-satellite-tata',
    name: 'Tata Power EZ Fast EV Hub (Satellite Bypass)',
    provider: 'Tata Power EZ',
    cityName: 'Bareilly',
    address: 'Near Indian Oil Petrol Pump, Satellite Chauraha, Bareilly',
    lat: 28.3385,
    lng: 79.4560,
    phone: '+91 98399 11029',
    availableBatteries: 18,
    totalSlots: 24,
    swapFeeRupees: 70,
    isOpen24Hours: true,
    isFastChargingSupported: true
  },
  {
    id: 'swap-delapeer-local',
    name: 'Delapeer Green Rickshaw Charging & Swap Hub',
    provider: 'Local Fast Charge Hub',
    cityName: 'Bareilly',
    address: 'Shop 12, Delapeer Mandi Complex, Stadium Road, Bareilly',
    lat: 28.3800,
    lng: 79.4240,
    phone: '+91 97580 88214',
    availableBatteries: 6,
    totalSlots: 12,
    swapFeeRupees: 55,
    isOpen24Hours: false,
    isFastChargingSupported: false
  },
  {
    id: 'swap-koharapeer-indigrid',
    name: 'IndiGrid Swapping Point (Koharapeer Gate)',
    provider: 'IndiGrid Swapping',
    cityName: 'Bareilly',
    address: 'Near Eidgah Road, Koharapeer Chauraha, Bareilly',
    lat: 28.3690,
    lng: 79.4090,
    phone: '+91 94126 55081',
    availableBatteries: 11,
    totalSlots: 18,
    swapFeeRupees: 65,
    isOpen24Hours: true,
    isFastChargingSupported: true
  }
];

export interface OfflineFareRule {
  distanceRange: string;
  sharedFarePerSeat: number;
  reservedFullRickshawFare: number;
  nightSurchargeMultiplier: number;
  maxLuggageCharge: number;
  notesHindi: string;
  notesEnglish: string;
}

export const OFFLINE_CITY_FARE_RULES: OfflineFareRule[] = [
  {
    distanceRange: '0.0 - 2.0 km',
    sharedFarePerSeat: 10,
    reservedFullRickshawFare: 40,
    nightSurchargeMultiplier: 1.25,
    maxLuggageCharge: 10,
    notesHindi: 'न्यूनतम साझा किराया ₹10। किसी भी छोटे सफर (1-2 किमी) के लिए तय सरकारी दर।',
    notesEnglish: 'Base stage fare ₹10 per seat. Standard municipal rate for short hops.'
  },
  {
    distanceRange: '2.1 - 4.5 km',
    sharedFarePerSeat: 15,
    reservedFullRickshawFare: 60,
    nightSurchargeMultiplier: 1.25,
    maxLuggageCharge: 10,
    notesHindi: 'मध्यम दूरी (जैसे स्टेशन से सेटेलाइट/कुतुबखाना) के लिए ₹15 प्रति सवारी।',
    notesEnglish: 'Medium haul rate (e.g. Junction to Satellite or Chowk) ₹15 per seat.'
  },
  {
    distanceRange: '4.6 - 7.5 km',
    sharedFarePerSeat: 20,
    reservedFullRickshawFare: 80,
    nightSurchargeMultiplier: 1.25,
    maxLuggageCharge: 15,
    notesHindi: 'लंबी दूरी (जैसे सेटेलाइट से यूनिवर्सिटी या डेलापीर) ₹20 प्रति सवारी।',
    notesEnglish: 'Long transit route (Satellite to University/Delapeer) ₹20 per seat.'
  },
  {
    distanceRange: '7.6 - 12.0 km',
    sharedFarePerSeat: 25,
    reservedFullRickshawFare: 110,
    nightSurchargeMultiplier: 1.25,
    maxLuggageCharge: 20,
    notesHindi: 'शहर के आर-पार लंबी यात्रा (जैसे नकटिया से इज्जतनगर/मिनी बाईपास) ₹25 प्रति सवारी।',
    notesEnglish: 'Cross-city travel (Nakatiya to Izzatnagar or Mini Bypass) ₹25 per seat.'
  }
];
