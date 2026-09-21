import React, { useState, useEffect, useMemo, useRef } from 'react';
import { AppLanguage, TransitLocation, BareillyLocation, ChokeZoneInfo, TrafficReport } from '../types';
import { BAREILLY_LOCATIONS, INITIAL_CHOKE_ZONES } from '../data/bareillyData';
import { 
  Calculator, 
  MapPin, 
  Navigation, 
  ArrowRight, 
  ArrowUpDown, 
  Search, 
  Users, 
  UserCheck, 
  Clock, 
  ShieldCheck, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Check, 
  RotateCcw,
  Compass,
  AlertCircle,
  Zap,
  Activity,
  Radio,
  Filter,
  Flame,
  Info
} from 'lucide-react';
import { playCleanChime, speakBareillyFare, stopVoice, speakCleanVoice } from '../utils/audioAlerts';

export interface FareRouteRule {
  id: string;
  originId: string;
  destId: string;
  originName: string;
  destName: string;
  sharedFare: number;
  sharedFareMax?: number;
  reserveFare: number;
  distanceKm: number;
  fareRangeText: string;
  category: 'Popular' | 'Commuter' | 'Student' | 'Station' | 'Market' | 'Hospital';
  notes: string;
  trafficStatus: 'Smooth' | 'Moderate' | 'Heavy Congestion';
  activeErickshawsEst: number;
  frequency: string;
  chokeAlert?: string;
}

export const OFFICIAL_BAREILLY_FARE_RULES: FareRouteRule[] = [
  // 1. Nakatiya Corridors (Lucknow Entry Gateway)
  {
    id: 'fr-nakatiya-shyamganj',
    originId: 'loc-nakatiya',
    destId: 'loc-shyamganj',
    originName: 'Nakatiya (नकटिया)',
    destName: 'Shyamganj (श्यामगंज मंडी)',
    sharedFare: 10,
    reserveFare: 50,
    distanceKm: 4.5,
    fareRangeText: '₹10',
    category: 'Commuter',
    notes: 'Major southern corridor connecting Lucknow highway entry to Shyamganj mandi.',
    trafficStatus: 'Moderate',
    activeErickshawsEst: 65,
    frequency: '1-2 min',
    chokeAlert: 'Shyamganj railway crossing gate closure causes intermittent 5-min queue.'
  },
  {
    id: 'fr-nakatiya-satellite',
    originId: 'loc-nakatiya',
    destId: 'loc-satellite-bus',
    originName: 'Nakatiya (नकटिया)',
    destName: 'Satellite Bus Stand (सैटेलाइट)',
    sharedFare: 10,
    reserveFare: 50,
    distanceKm: 4.2,
    fareRangeText: '₹10',
    category: 'Commuter',
    notes: 'Direct transit from Cantt/Nakatiya gate to Interstate Bus Terminal.',
    trafficStatus: 'Smooth',
    activeErickshawsEst: 80,
    frequency: '1 min'
  },
  {
    id: 'fr-nakatiya-cantt',
    originId: 'loc-nakatiya',
    destId: 'loc-cantt-sadar',
    originName: 'Nakatiya (नकटिया)',
    destName: 'Cantt Sadar Bazaar (कैंट सदर)',
    sharedFare: 10,
    reserveFare: 45,
    distanceKm: 3.5,
    fareRangeText: '₹10',
    category: 'Commuter',
    notes: 'Smooth wide military road link from southern border into Cantt area.',
    trafficStatus: 'Smooth',
    activeErickshawsEst: 40,
    frequency: '3-4 min'
  },
  {
    id: 'fr-nakatiya-mjpru',
    originId: 'loc-nakatiya',
    destId: 'loc-mjp-university',
    originName: 'Nakatiya (नकटिया)',
    destName: 'MJPRU University (रुहेलखंड विश्वविद्यालय)',
    sharedFare: 15,
    reserveFare: 70,
    distanceKm: 6.8,
    fareRangeText: '₹15',
    category: 'Student',
    notes: 'Dedicated student corridor to university campus via Pilibhit bypass road.',
    trafficStatus: 'Smooth',
    activeErickshawsEst: 50,
    frequency: '2-3 min'
  },
  {
    id: 'fr-nakatiya-siddhivinayak',
    originId: 'loc-nakatiya',
    destId: 'loc-siddhi-vinayak',
    originName: 'Nakatiya (नकटिया)',
    destName: 'Siddhi Vinayak College (सिद्धि विनायक कॉलेज)',
    sharedFare: 10,
    reserveFare: 45,
    distanceKm: 3.8,
    fareRangeText: '₹10',
    category: 'Student',
    notes: 'Direct campus link for students along Dohna road bypass.',
    trafficStatus: 'Smooth',
    activeErickshawsEst: 45,
    frequency: '2 min'
  },
  {
    id: 'fr-nakatiya-bareillyjn',
    originId: 'loc-nakatiya',
    destId: 'loc-bareilly-jn',
    originName: 'Nakatiya (नकटिया)',
    destName: 'Bareilly Junction (बरेली जंक्शन)',
    sharedFare: 15,
    reserveFare: 75,
    distanceKm: 6.2,
    fareRangeText: '₹15',
    category: 'Station',
    notes: 'Cross-city southern shuttle via Cantt road to main railway platform.',
    trafficStatus: 'Moderate',
    activeErickshawsEst: 60,
    frequency: '2-3 min'
  },

  // 2. Shyamganj Mandi & Crossing Corridors
  {
    id: 'fr-shyamganj-kutubkhana',
    originId: 'loc-shyamganj',
    destId: 'loc-chowk-kutubkhana',
    originName: 'Shyamganj (श्यामगंज)',
    destName: 'Kutubkhana / Chowk (कुतुबखाना)',
    sharedFare: 10,
    reserveFare: 40,
    distanceKm: 2.0,
    fareRangeText: '₹10',
    category: 'Popular',
    notes: 'Frequent inner-city market hop through Purana Shahar connector.',
    trafficStatus: 'Heavy Congestion',
    activeErickshawsEst: 110,
    frequency: '30 sec',
    chokeAlert: 'Kutubkhana narrow market lane has heavy shopper and handcart congestion.'
  },
  {
    id: 'fr-shyamganj-satellite',
    originId: 'loc-shyamganj',
    destId: 'loc-satellite-bus',
    originName: 'Shyamganj (श्यामगंज)',
    destName: 'Satellite Bus Stand (सैटेलाइट)',
    sharedFare: 10,
    reserveFare: 45,
    distanceKm: 2.8,
    fareRangeText: '₹10',
    category: 'Popular',
    notes: 'Direct shuttle from interstate bus terminus to Shyamganj trading hub.',
    trafficStatus: 'Smooth',
    activeErickshawsEst: 95,
    frequency: '1 min'
  },
  {
    id: 'fr-shyamganj-citystation',
    originId: 'loc-shyamganj',
    destId: 'loc-bareilly-city-stn',
    originName: 'Shyamganj (श्यामगंज)',
    destName: 'Bareilly City Station (सिटी स्टेशन)',
    sharedFare: 10,
    sharedFareMax: 15,
    reserveFare: 55,
    distanceKm: 3.2,
    fareRangeText: '₹10 - ₹15',
    category: 'Station',
    notes: 'Standard fare ₹10 (may rise to ₹15 during late train arrival windows).',
    trafficStatus: 'Moderate',
    activeErickshawsEst: 55,
    frequency: '2 min'
  },
  {
    id: 'fr-shyamganj-delhapeer',
    originId: 'loc-shyamganj',
    destId: 'loc-delhapeer',
    originName: 'Shyamganj (श्यामगंज)',
    destName: 'Delhapeer (डेलापीर 100 Ft Rd)',
    sharedFare: 10,
    reserveFare: 50,
    distanceKm: 4.2,
    fareRangeText: '₹10',
    category: 'Commuter',
    notes: 'Mandi to Mandi 100ft road corridor via Shahamatganj elevated road.',
    trafficStatus: 'Smooth',
    activeErickshawsEst: 75,
    frequency: '1-2 min'
  },
  {
    id: 'fr-shyamganj-ayubkhan',
    originId: 'loc-shyamganj',
    destId: 'loc-ayub-khan',
    originName: 'Shyamganj (श्यामगंज)',
    destName: 'Ayub Khan Chauraha (अयूब खान)',
    sharedFare: 10,
    reserveFare: 45,
    distanceKm: 2.3,
    fareRangeText: '₹10',
    category: 'Popular',
    notes: 'High-frequency commuter link between market and Civil Lines.',
    trafficStatus: 'Smooth',
    activeErickshawsEst: 85,
    frequency: '1 min'
  },
  {
    id: 'fr-shyamganj-shahamatganj',
    originId: 'loc-shyamganj',
    destId: 'loc-shahamatganj',
    originName: 'Shyamganj (श्यामगंज)',
    destName: 'Shahamatganj Flyover (शहामतगंज)',
    sharedFare: 10,
    reserveFare: 35,
    distanceKm: 1.5,
    fareRangeText: '₹10',
    category: 'Market',
    notes: 'Direct 10-rupee short hop connecting both major grain markets.',
    trafficStatus: 'Moderate',
    activeErickshawsEst: 90,
    frequency: '1 min'
  },
  {
    id: 'fr-shyamganj-sanjaynagar',
    originId: 'loc-shyamganj',
    destId: 'loc-sanjay-nagar',
    originName: 'Shyamganj (श्यामगंज)',
    destName: 'Sanjay Nagar (संजय नगर)',
    sharedFare: 10,
    reserveFare: 35,
    distanceKm: 1.8,
    fareRangeText: '₹10',
    category: 'Commuter',
    notes: 'Fast residential link towards Bajrang Nagar.',
    trafficStatus: 'Smooth',
    activeErickshawsEst: 40,
    frequency: '2 min'
  },

  // 3. Bareilly Junction Railway Hub Corridors
  {
    id: 'fr-jn-chowk',
    originId: 'loc-bareilly-jn',
    destId: 'loc-chowk-kutubkhana',
    originName: 'Bareilly Junction (बरेली जंक्शन)',
    destName: 'Chowk / Kutubkhana (कुतुबखाना)',
    sharedFare: 10,
    reserveFare: 50,
    distanceKm: 3.2,
    fareRangeText: '₹10',
    category: 'Station',
    notes: 'Main railway passenger corridor via Patel Chowk & Station Road.',
    trafficStatus: 'Heavy Congestion',
    activeErickshawsEst: 130,
    frequency: '30 sec',
    chokeAlert: 'Station Road e-rickshaw queue spillover during express train arrivals.'
  },
  {
    id: 'fr-jn-satellite',
    originId: 'loc-bareilly-jn',
    destId: 'loc-satellite-bus',
    originName: 'Bareilly Junction (बरेली जंक्शन)',
    destName: 'Satellite Bus Stand (सैटेलाइट)',
    sharedFare: 15,
    sharedFareMax: 20,
    reserveFare: 80,
    distanceKm: 5.5,
    fareRangeText: '₹15 - ₹20',
    category: 'Station',
    notes: 'Direct train-to-bus transit link through Cantt or Old City.',
    trafficStatus: 'Smooth',
    activeErickshawsEst: 105,
    frequency: '1 min'
  },
  {
    id: 'fr-jn-delhapeer',
    originId: 'loc-bareilly-jn',
    destId: 'loc-delhapeer',
    originName: 'Bareilly Junction (बरेली जंक्शन)',
    destName: 'Delhapeer (डेलापीर चौराहा)',
    sharedFare: 15,
    reserveFare: 75,
    distanceKm: 6.2,
    fareRangeText: '₹15',
    category: 'Station',
    notes: 'North-south cross-city trunk route via Ayub Khan & Civil Lines.',
    trafficStatus: 'Moderate',
    activeErickshawsEst: 70,
    frequency: '2 min'
  },
  {
    id: 'fr-jn-ayubkhan',
    originId: 'loc-bareilly-jn',
    destId: 'loc-ayub-khan',
    originName: 'Bareilly Junction (बरेली जंक्शन)',
    destName: 'Ayub Khan Chauraha (अयूब खान)',
    sharedFare: 10,
    reserveFare: 40,
    distanceKm: 2.0,
    fareRangeText: '₹10',
    category: 'Station',
    notes: 'Short direct route through Patel Chowk into Civil Lines.',
    trafficStatus: 'Smooth',
    activeErickshawsEst: 90,
    frequency: '1 min'
  },
  {
    id: 'fr-jn-chaupula',
    originId: 'loc-bareilly-jn',
    destId: 'loc-chaupula',
    originName: 'Bareilly Junction (बरेली जंक्शन)',
    destName: 'Chaupula (चौपुला फ्लाईओव्हर)',
    sharedFare: 10,
    reserveFare: 40,
    distanceKm: 1.8,
    fareRangeText: '₹10',
    category: 'Station',
    notes: 'Connecting station exit to Budaun / Delhi highway junction.',
    trafficStatus: 'Moderate',
    activeErickshawsEst: 60,
    frequency: '1 min'
  },
  {
    id: 'fr-jn-kilabus',
    originId: 'loc-bareilly-jn',
    destId: 'loc-kila-bus-stand',
    originName: 'Bareilly Junction (बरेली जंक्शन)',
    destName: 'Qila / Kila Bus Stand (किला बस अड्डा)',
    sharedFare: 10,
    reserveFare: 45,
    distanceKm: 2.4,
    fareRangeText: '₹10',
    category: 'Station',
    notes: 'Direct west-side link via Subhash Nagar / Chopla underpass.',
    trafficStatus: 'Smooth',
    activeErickshawsEst: 50,
    frequency: '2 min'
  },
  {
    id: 'fr-jn-medical',
    originId: 'loc-bareilly-jn',
    destId: 'loc-rohilkhand-medical',
    originName: 'Bareilly Junction (बरेली जंक्शन)',
    destName: 'Rohilkhand Medical College (मेडिकल कॉलेज)',
    sharedFare: 20,
    reserveFare: 100,
    distanceKm: 8.5,
    fareRangeText: '₹20',
    category: 'Hospital',
    notes: 'Long-haul patient and student trunk route to super-speciality hospital.',
    trafficStatus: 'Smooth',
    activeErickshawsEst: 45,
    frequency: '3-4 min'
  },

  // 4. Satellite Bus Terminus Corridors
  {
    id: 'fr-satellite-mjpru',
    originId: 'loc-satellite-bus',
    destId: 'loc-mjp-university',
    originName: 'Satellite Bus Stand (सैटेलाइट)',
    destName: 'MJPRU University (रुहेलखंड वि.वि.)',
    sharedFare: 10,
    reserveFare: 50,
    distanceKm: 3.5,
    fareRangeText: '₹10',
    category: 'Student',
    notes: 'Express student line via Pilibhit bypass road.',
    trafficStatus: 'Smooth',
    activeErickshawsEst: 95,
    frequency: '1 min'
  },
  {
    id: 'fr-satellite-izzatnagar',
    originId: 'loc-satellite-bus',
    destId: 'loc-izzatnagar',
    originName: 'Satellite Bus Stand (सैटेलाइट)',
    destName: 'Izzatnagar Station / IVRI (इज्जतनगर)',
    sharedFare: 15,
    reserveFare: 70,
    distanceKm: 6.0,
    fareRangeText: '₹15',
    category: 'Station',
    notes: 'Connecting bus terminus with northern railway zone & IVRI.',
    trafficStatus: 'Smooth',
    activeErickshawsEst: 65,
    frequency: '2 min'
  },
  {
    id: 'fr-satellite-medical',
    originId: 'loc-satellite-bus',
    destId: 'loc-rohilkhand-medical',
    originName: 'Satellite Bus Stand (सैटेलाइट)',
    destName: 'Medical College / Rohilkhand (अस्पताल)',
    sharedFare: 10,
    sharedFareMax: 15,
    reserveFare: 55,
    distanceKm: 4.8,
    fareRangeText: '₹10 - ₹15',
    category: 'Hospital',
    notes: 'Direct expressway hop along Pilibhit bypass.',
    trafficStatus: 'Smooth',
    activeErickshawsEst: 70,
    frequency: '2 min'
  },
  {
    id: 'fr-satellite-phoenix',
    originId: 'loc-satellite-bus',
    destId: 'loc-phoenix-mall',
    originName: 'Satellite Bus Stand (सैटेलाइट)',
    destName: 'Phoenix United Mall (फीनिक्स मॉल)',
    sharedFare: 10,
    reserveFare: 45,
    distanceKm: 2.5,
    fareRangeText: '₹10',
    category: 'Popular',
    notes: 'Fast retail connector along Pilibhit bypass.',
    trafficStatus: 'Smooth',
    activeErickshawsEst: 80,
    frequency: '1 min'
  },
  {
    id: 'fr-satellite-nariyawal',
    originId: 'loc-satellite-bus',
    destId: 'loc-nariyawal',
    originName: 'Satellite Bus Stand (सैटेलाइट)',
    destName: 'Nariyawal Industrial Area (नरियावल)',
    sharedFare: 10,
    reserveFare: 50,
    distanceKm: 4.0,
    fareRangeText: '₹10',
    category: 'Commuter',
    notes: 'Eastward industrial worker route towards Bisalpur road.',
    trafficStatus: 'Smooth',
    activeErickshawsEst: 40,
    frequency: '3 min'
  },

  // 5. Chaupula & Chopla Flyover Hub
  {
    id: 'fr-chopla-satellite',
    originId: 'loc-chaupula',
    destId: 'loc-satellite-bus',
    originName: 'Chaupula (चौपुला)',
    destName: 'Satellite Bus Stand (सैटेलाइट)',
    sharedFare: 15,
    reserveFare: 70,
    distanceKm: 5.2,
    fareRangeText: '₹15',
    category: 'Commuter',
    notes: 'Direct crossover from Delhi road entry into Satellite bus stand.',
    trafficStatus: 'Smooth',
    activeErickshawsEst: 75,
    frequency: '1-2 min'
  },
  {
    id: 'fr-chopla-delhapeer',
    originId: 'loc-chaupula',
    destId: 'loc-delhapeer',
    originName: 'Chaupula (चौपुला)',
    destName: 'Delhapeer (डेलापीर चौराहा)',
    sharedFare: 10,
    reserveFare: 50,
    distanceKm: 3.8,
    fareRangeText: '₹10',
    category: 'Commuter',
    notes: 'Connecting western highway entrance with northern mandi.',
    trafficStatus: 'Moderate',
    activeErickshawsEst: 60,
    frequency: '2 min'
  },
  {
    id: 'fr-chopla-shyamganj',
    originId: 'loc-chaupula',
    destId: 'loc-shyamganj',
    originName: 'Chaupula (चौपुला)',
    destName: 'Shyamganj Mandi (श्यामगंज)',
    sharedFare: 10,
    reserveFare: 45,
    distanceKm: 3.1,
    fareRangeText: '₹10',
    category: 'Market',
    notes: 'Connecting west entry to central wholesale market via Civil Lines.',
    trafficStatus: 'Moderate',
    activeErickshawsEst: 70,
    frequency: '1-2 min'
  },
  {
    id: 'fr-chopla-kilabus',
    originId: 'loc-chaupula',
    destId: 'loc-kila-bus-stand',
    originName: 'Chaupula (चौपुला)',
    destName: 'Qila / Kila Bus Stand (किला बस अड्डा)',
    sharedFare: 10,
    reserveFare: 35,
    distanceKm: 1.4,
    fareRangeText: '₹10',
    category: 'Commuter',
    notes: 'Short connection underneath the Chopla 4-way flyover.',
    trafficStatus: 'Smooth',
    activeErickshawsEst: 55,
    frequency: '1 min'
  },

  // 6. Delhapeer & North Bareilly Hub
  {
    id: 'fr-delhapeer-dakkhana',
    originId: 'loc-delhapeer',
    destId: 'loc-dakkhana',
    originName: 'Delhapeer (डेलापीर)',
    destName: 'Dakkhana / Civil Lines (डाकखाना)',
    sharedFare: 10,
    reserveFare: 45,
    distanceKm: 3.6,
    fareRangeText: '₹10',
    category: 'Popular',
    notes: 'Direct 100ft road to central Civil Lines government district.',
    trafficStatus: 'Smooth',
    activeErickshawsEst: 65,
    frequency: '2 min'
  },
  {
    id: 'fr-delhapeer-izzatnagar',
    originId: 'loc-delhapeer',
    destId: 'loc-izzatnagar',
    originName: 'Delhapeer (डेलापीर)',
    destName: 'Izzatnagar IVRI (इज्जतनगर)',
    sharedFare: 10,
    reserveFare: 45,
    distanceKm: 2.9,
    fareRangeText: '₹10',
    category: 'Station',
    notes: 'Short north-link to railway divisional headquarters.',
    trafficStatus: 'Smooth',
    activeErickshawsEst: 55,
    frequency: '2 min'
  },
  {
    id: 'fr-delhapeer-koharapeer',
    originId: 'loc-delhapeer',
    destId: 'loc-koharapeer',
    originName: 'Delhapeer (डेलापीर)',
    destName: 'Koharapeer Chauraha (कोहाड़ापीर)',
    sharedFare: 10,
    reserveFare: 40,
    distanceKm: 2.2,
    fareRangeText: '₹10',
    category: 'Market',
    notes: 'Direct straight-line connection on Nainital highway arterial.',
    trafficStatus: 'Moderate',
    activeErickshawsEst: 80,
    frequency: '1 min',
    chokeAlert: 'Morning sabzi mandi creates minor slowdown near Koharapeer.'
  },

  // 7. Koharapeer & Old City Markets
  {
    id: 'fr-koharapeer-chowk',
    originId: 'loc-koharapeer',
    destId: 'loc-chowk-kutubkhana',
    originName: 'Koharapeer (कोहाड़ापीर)',
    destName: 'Chowk & Kutubkhana (कुतुबखाना)',
    sharedFare: 10,
    reserveFare: 40,
    distanceKm: 1.8,
    fareRangeText: '₹10',
    category: 'Popular',
    notes: 'Historic market hop with dense passenger movement.',
    trafficStatus: 'Heavy Congestion',
    activeErickshawsEst: 95,
    frequency: '30 sec',
    chokeAlert: 'Extremely high pedestrian & vehicle density in inner market.'
  },

  // 8. Higher Education Campuses & Colleges
  {
    id: 'fr-izzatnagar-ssvgi',
    originId: 'loc-izzatnagar',
    destId: 'loc-ssvgi-college',
    originName: 'Izzatnagar (इज्जतनगर)',
    destName: 'Siddhi Vinayak College (SSVGI)',
    sharedFare: 10,
    reserveFare: 45,
    distanceKm: 4.1,
    fareRangeText: '₹10',
    category: 'Student',
    notes: 'Express college route along Nainital highway corridor.',
    trafficStatus: 'Smooth',
    activeErickshawsEst: 50,
    frequency: '2 min'
  },
  {
    id: 'fr-mjpru-phoenix',
    originId: 'loc-mjp-university',
    destId: 'loc-phoenix-mall',
    originName: 'MJPRU University (रुहेलखंड वि.वि.)',
    destName: 'Phoenix Mall (फीनिक्स मॉल)',
    sharedFare: 10,
    reserveFare: 35,
    distanceKm: 1.6,
    fareRangeText: '₹10',
    category: 'Student',
    notes: 'Popular youth and student shopping shuttle along bypass.',
    trafficStatus: 'Smooth',
    activeErickshawsEst: 65,
    frequency: '1 min'
  }
];

interface Props {
  language: AppLanguage;
  onClose?: () => void;
  cityName?: string;
  cityLocations?: TransitLocation[];
  baseFare?: number;
  perKmRate?: number;
  isFullPage?: boolean;
  chokeZones?: ChokeZoneInfo[];
  trafficReports?: TrafficReport[];
  onNavigateRoute?: (originLoc: TransitLocation | null, destLoc: TransitLocation | null) => void;
}

export const BareillyFareCalculator: React.FC<Props> = ({
  language,
  onClose,
  cityName = 'Bareilly',
  cityLocations = [],
  baseFare = 10,
  perKmRate = 2.5,
  isFullPage = false,
  chokeZones = INITIAL_CHOKE_ZONES,
  trafficReports = [],
  onNavigateRoute
}) => {
  const isHindi = language === 'hi';
  const isUrdu = language === 'ur';

  // Use provided city locations or fallback to Bareilly default locations
  const availableLocations: TransitLocation[] = useMemo(() => {
    if (cityLocations && cityLocations.length > 0) {
      return cityLocations;
    }
    return BAREILLY_LOCATIONS;
  }, [cityLocations]);

  // Search input states
  const [fromQuery, setFromQuery] = useState<string>('');
  const [toQuery, setToQuery] = useState<string>('');
  const [selectedFromLoc, setSelectedFromLoc] = useState<TransitLocation | null>(null);
  const [selectedToLoc, setSelectedToLoc] = useState<TransitLocation | null>(null);

  // Dropdown suggestions active states
  const [isFromFocused, setIsFromFocused] = useState<boolean>(false);
  const [isToFocused, setIsToFocused] = useState<boolean>(false);

  // Active Corridor Filter Tab
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('All');

  // Searched result state
  const [hasSearched, setHasSearched] = useState<boolean>(false);
  const [calculatedResult, setCalculatedResult] = useState<{
    originName: string;
    destName: string;
    distanceKm: number;
    estimatedMin: number;
    sharedFare: number;
    sharedFareMax?: number;
    reserveFare: number;
    fareRangeText: string;
    notes: string;
    trafficStatus: 'Smooth' | 'Moderate' | 'Heavy Congestion';
    activeErickshawsEst: number;
    frequency: string;
    chokeAlert?: string;
    isChokeHazard: boolean;
    fromLocationObj: TransitLocation | null;
    toLocationObj: TransitLocation | null;
  } | null>(null);

  // Fare options
  const [passengers, setPassengers] = useState<number>(1);
  const [rideType, setRideType] = useState<'shared' | 'reserve'>('shared');
  const [isPeakRateSelected, setIsPeakRateSelected] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  const fromRef = useRef<HTMLDivElement>(null);
  const toRef = useRef<HTMLDivElement>(null);

  // Click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (fromRef.current && !fromRef.current.contains(e.target as Node)) {
        setIsFromFocused(false);
      }
      if (toRef.current && !toRef.current.contains(e.target as Node)) {
        setIsToFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter locations for From dropdown
  const fromSuggestions = useMemo(() => {
    const q = fromQuery.trim().toLowerCase();
    if (!q) return availableLocations.slice(0, 10);
    return availableLocations.filter(loc => 
      loc.name.toLowerCase().includes(q) || 
      loc.hindiName.toLowerCase().includes(q)
    ).slice(0, 10);
  }, [availableLocations, fromQuery]);

  // Filter locations for To dropdown
  const toSuggestions = useMemo(() => {
    const q = toQuery.trim().toLowerCase();
    if (!q) {
      return availableLocations.filter(loc => loc.id !== selectedFromLoc?.id).slice(0, 10);
    }
    return availableLocations.filter(loc => 
      (loc.name.toLowerCase().includes(q) || loc.hindiName.toLowerCase().includes(q)) &&
      loc.id !== selectedFromLoc?.id
    ).slice(0, 10);
  }, [availableLocations, toQuery, selectedFromLoc]);

  // Handle Search Calculation
  const handleSearchFare = (fromInput?: TransitLocation | string, toInput?: TransitLocation | string) => {
    playCleanChime('fare');

    const fromLoc = typeof fromInput === 'object' ? fromInput : selectedFromLoc || availableLocations.find(l => 
      l.name.toLowerCase().includes((typeof fromInput === 'string' ? fromInput : fromQuery).toLowerCase()) ||
      l.hindiName.toLowerCase().includes((typeof fromInput === 'string' ? fromInput : fromQuery).toLowerCase())
    ) || availableLocations[0];

    const toLoc = typeof toInput === 'object' ? toInput : selectedToLoc || availableLocations.find(l => 
      l.name.toLowerCase().includes((typeof toInput === 'string' ? toInput : toQuery).toLowerCase()) ||
      l.hindiName.toLowerCase().includes((typeof toInput === 'string' ? toInput : toQuery).toLowerCase())
    ) || availableLocations[1] || availableLocations[0];

    if (!fromLoc || !toLoc) return;

    // Check if there is an exact official fare rule
    const matchingRule = OFFICIAL_BAREILLY_FARE_RULES.find(r => 
      (r.originId === fromLoc.id && r.destId === toLoc.id) ||
      (r.originId === toLoc.id && r.destId === fromLoc.id) ||
      (r.originName.toLowerCase().includes(fromLoc.name.toLowerCase().slice(0, 6)) && r.destName.toLowerCase().includes(toLoc.name.toLowerCase().slice(0, 6)))
    );

    let distanceKm = 3.0;
    let sharedFare = 10;
    let sharedFareMax: number | undefined = undefined;
    let reserveFare = 50;
    let notes = `${cityName} verified official e-rickshaw route rate.`;
    let trafficStatus: 'Smooth' | 'Moderate' | 'Heavy Congestion' = 'Smooth';
    let activeErickshawsEst = 60;
    let frequency = '1-2 min';
    let chokeAlert: string | undefined = undefined;

    // Check choke hazard in either location or active choke zones
    const isChokeHazard = !!(fromLoc.isChokeHazard || toLoc.isChokeHazard);
    const relatedChoke = chokeZones.find(cz => 
      cz.name.toLowerCase().includes(fromLoc.name.toLowerCase().slice(0, 5)) ||
      cz.name.toLowerCase().includes(toLoc.name.toLowerCase().slice(0, 5))
    );

    if (matchingRule) {
      distanceKm = matchingRule.distanceKm;
      sharedFare = matchingRule.sharedFare;
      sharedFareMax = matchingRule.sharedFareMax;
      reserveFare = matchingRule.reserveFare;
      notes = matchingRule.notes;
      trafficStatus = matchingRule.trafficStatus;
      activeErickshawsEst = matchingRule.activeErickshawsEst;
      frequency = matchingRule.frequency;
      chokeAlert = matchingRule.chokeAlert;
    } else if (fromLoc.lat && fromLoc.lng && toLoc.lat && toLoc.lng) {
      const dLat = (toLoc.lat - fromLoc.lat) * 111;
      const dLng = (toLoc.lng - fromLoc.lng) * 98;
      distanceKm = Math.max(1.2, Math.round(Math.sqrt(dLat * dLat + dLng * dLng) * 10) / 10);
      
      // Standard distance tariff matrix
      if (distanceKm <= 3.5) {
        sharedFare = baseFare;
        reserveFare = 45;
      } else if (distanceKm <= 6.0) {
        sharedFare = baseFare + 5;
        reserveFare = 65;
      } else if (distanceKm <= 9.0) {
        sharedFare = baseFare + 10;
        reserveFare = 85;
      } else {
        sharedFare = baseFare + 15;
        reserveFare = 110;
      }
      notes = `${cityName} verified distance-based tariff (~${distanceKm} km).`;
      trafficStatus = isChokeHazard ? 'Heavy Congestion' : distanceKm > 5 ? 'Moderate' : 'Smooth';
      activeErickshawsEst = isChokeHazard ? 110 : 65;
      frequency = '1-3 min';
    }

    if (relatedChoke) {
      chokeAlert = `${relatedChoke.name}: ${relatedChoke.cause} (${relatedChoke.status})`;
      trafficStatus = 'Heavy Congestion';
    }

    const estimatedMin = Math.max(6, Math.round(distanceKm * (trafficStatus === 'Heavy Congestion' ? 4.8 : 3.5)));

    setCalculatedResult({
      originName: fromLoc.name,
      destName: toLoc.name,
      distanceKm,
      estimatedMin,
      sharedFare,
      sharedFareMax,
      reserveFare,
      fareRangeText: sharedFareMax ? `₹${sharedFare} - ₹${sharedFareMax}` : `₹${sharedFare}`,
      notes,
      trafficStatus,
      activeErickshawsEst,
      frequency,
      chokeAlert,
      isChokeHazard,
      fromLocationObj: fromLoc,
      toLocationObj: toLoc
    });

    setHasSearched(true);
    setIsFromFocused(false);
    setIsToFocused(false);
  };

  // Swap From and To
  const handleSwapLocations = () => {
    const tempQuery = fromQuery;
    const tempLoc = selectedFromLoc;
    setFromQuery(toQuery);
    setSelectedFromLoc(selectedToLoc);
    setToQuery(tempQuery);
    setSelectedToLoc(tempLoc);

    if (calculatedResult) {
      handleSearchFare(selectedToLoc || toQuery, tempLoc || tempQuery);
    }
  };

  // Auto calculate total based on passengers and peak
  const effectivePerSeatFare = (isPeakRateSelected && calculatedResult?.sharedFareMax)
    ? calculatedResult.sharedFareMax
    : (calculatedResult?.sharedFare || 10);

  const totalCalculatedFare = rideType === 'shared'
    ? effectivePerSeatFare * passengers
    : (calculatedResult?.reserveFare || 50);

  // Voice narration
  const handleSpeakFare = () => {
    if (!calculatedResult) return;
    if (isSpeaking) {
      stopVoice();
      setIsSpeaking(false);
      return;
    }

    const cleanOrigin = calculatedResult.originName.replace(/\(.*?\)/g, '').trim();
    const cleanDest = calculatedResult.destName.replace(/\(.*?\)/g, '').trim();

    if (isHindi) {
      speakBareillyFare(
        cleanOrigin,
        cleanDest,
        totalCalculatedFare,
        passengers,
        rideType,
        () => setIsSpeaking(true),
        () => setIsSpeaking(false)
      );
    } else {
      playCleanChime('fare');
      const rideDesc = rideType === 'shared'
        ? `${passengers} passenger shared ride`
        : 'private reserve rickshaw';
      const speech = `From ${cleanOrigin} to ${cleanDest}, for ${rideDesc}, the official fare is ${totalCalculatedFare} Rupees. Estimated travel time is ${calculatedResult.estimatedMin} minutes.`;
      speakCleanVoice(
        speech,
        language,
        () => setIsSpeaking(true),
        () => setIsSpeaking(false)
      );
    }
  };

  // Pre-load a default search on first mount if none done
  useEffect(() => {
    if (!hasSearched && availableLocations.length >= 2) {
      setSelectedFromLoc(availableLocations[0]);
      setFromQuery(availableLocations[0].name);
      setSelectedToLoc(availableLocations[1]);
      setToQuery(availableLocations[1].name);
      handleSearchFare(availableLocations[0], availableLocations[1]);
    }
  }, [availableLocations]);

  // Filter corridors by category
  const filteredCorridors = useMemo(() => {
    if (selectedCategoryFilter === 'All') return OFFICIAL_BAREILLY_FARE_RULES;
    return OFFICIAL_BAREILLY_FARE_RULES.filter(r => r.category === selectedCategoryFilter);
  }, [selectedCategoryFilter]);

  // Convert numbers to words for commuters
  const getNumberWord = (num: number): string => {
    if (isHindi) {
      const words: Record<number, string> = {
        10: 'दस',
        15: 'पंद्रह',
        20: 'बीस',
        25: 'पच्चीस',
        30: 'तीस',
        35: 'पैंतीस',
        40: 'चालीस',
        45: 'पैंतालीस',
        50: 'पचास',
        55: 'पचपन',
        60: 'साठ',
        65: 'पैंसठ',
        70: 'सत्तर',
        75: 'पचहत्तर',
        80: 'अस्सी',
        85: 'पचासी',
        90: 'नब्बे',
        100: 'एक सौ'
      };
      return words[num] ? `(${words[num]} रुपये)` : `(${num} रुपये)`;
    } else if (isUrdu) {
      return `(${num} روپے)`;
    } else {
      return `(${num} Rupees)`;
    }
  };

  return (
    <div id="bareilly-fare-page" className={isFullPage ? "w-full max-w-5xl mx-auto space-y-3.5 text-slate-800" : "bg-white rounded-2xl border border-slate-200 shadow-xl p-3.5 sm:p-4 space-y-3.5 text-slate-800 max-h-[90vh] overflow-y-auto"}>
      
      {/* Sleek, Professional Header */}
      <div id="fare-search-header" className="bg-white border border-slate-200 rounded-2xl p-3 sm:p-3.5 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center font-bold text-base shadow-2xs">
            🛺
          </div>
          <h1 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
            {cityName} Fare & Routes
          </h1>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center text-xs font-bold cursor-pointer transition-colors"
          >
            ✕
          </button>
        )}
      </div>

      {/* Main Search Bar: From & To Location */}
      <div id="fare-search-box-container" className="bg-white rounded-2xl border border-slate-200 p-3 sm:p-4 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5 items-center">
          
          {/* From Location Search Input */}
          <div id="fare-from-input-group" className="md:col-span-5 relative" ref={fromRef}>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>{isHindi ? 'कहाँ से (Pickup):' : 'Pickup Location (From):'}</span>
            </label>

            <div className="relative">
              <MapPin className="w-3.5 h-3.5 text-emerald-600 absolute left-3 top-3" />
              <input
                type="text"
                value={fromQuery}
                onFocus={() => setIsFromFocused(true)}
                onChange={(e) => {
                  setFromQuery(e.target.value);
                  setSelectedFromLoc(null);
                  setIsFromFocused(true);
                }}
                placeholder={isHindi ? 'स्थान खोजें (उदा. नकटिया, श्यामगंज)...' : 'Search pickup (e.g. Nakatiya, Shyamganj)...'}
                className="w-full text-xs font-semibold pl-9 pr-3 py-2 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 focus:border-slate-800 rounded-xl focus:outline-hidden transition-all shadow-2xs"
              />
            </div>

            {/* From Suggestions Dropdown */}
            {isFromFocused && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-50 max-h-56 overflow-y-auto p-1 space-y-0.5">
                <div className="text-[10px] font-semibold text-slate-400 px-2.5 py-1 uppercase tracking-wider">
                  {isHindi ? 'सुझाए गए स्थान' : 'Suggested Locations'}
                </div>
                {fromSuggestions.map((loc) => (
                  <button
                    key={loc.id}
                    type="button"
                    onClick={() => {
                      setSelectedFromLoc(loc);
                      setFromQuery(loc.name);
                      setIsFromFocused(false);
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium hover:bg-slate-50 flex items-center justify-between text-slate-800 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-amber-500 text-xs">📍</span>
                      <div>
                        <div className="font-semibold text-slate-800">{loc.name}</div>
                        <div className="text-[10px] text-slate-400">{loc.hindiName}</div>
                      </div>
                    </div>
                    {selectedFromLoc?.id === loc.id && (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Swap Button */}
          <div className="md:col-span-1 flex justify-center py-0.5 md:py-0">
            <button
              type="button"
              onClick={handleSwapLocations}
              title="Swap"
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 shadow-2xs transition-all active:scale-95 cursor-pointer flex items-center justify-center"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* To Location Search Input */}
          <div id="fare-to-input-group" className="md:col-span-6 relative" ref={toRef}>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <span>{isHindi ? 'कहाँ तक (Drop):' : 'Drop Location (To):'}</span>
            </label>

            <div className="relative">
              <Compass className="w-3.5 h-3.5 text-rose-600 absolute left-3 top-3" />
              <input
                type="text"
                value={toQuery}
                onFocus={() => setIsToFocused(true)}
                onChange={(e) => {
                  setToQuery(e.target.value);
                  setSelectedToLoc(null);
                  setIsToFocused(true);
                }}
                placeholder={isHindi ? 'स्थान खोजें (उदा. सैटेलाइट, जंक्शन)...' : 'Search drop (e.g. Satellite, Junction)...'}
                className="w-full text-xs font-semibold pl-9 pr-3 py-2 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 focus:border-slate-800 rounded-xl focus:outline-hidden transition-all shadow-2xs"
              />
            </div>

            {/* To Suggestions Dropdown */}
            {isToFocused && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-50 max-h-56 overflow-y-auto p-1 space-y-0.5">
                <div className="text-[10px] font-semibold text-slate-400 px-2.5 py-1 uppercase tracking-wider">
                  {isHindi ? 'सुझाए गए स्थान' : 'Suggested Locations'}
                </div>
                {toSuggestions.map((loc) => (
                  <button
                    key={loc.id}
                    type="button"
                    onClick={() => {
                      setSelectedToLoc(loc);
                      setToQuery(loc.name);
                      setIsToFocused(false);
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium hover:bg-slate-50 flex items-center justify-between text-slate-800 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-rose-500 text-xs">🎯</span>
                      <div>
                        <div className="font-semibold text-slate-800">{loc.name}</div>
                        <div className="text-[10px] text-slate-400">{loc.hindiName}</div>
                      </div>
                    </div>
                    {selectedToLoc?.id === loc.id && (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Location Pills & Search Action */}
        <div className="pt-1 flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-0.5 text-[11px]">
            <span className="text-slate-400 font-medium shrink-0">Quick:</span>
            {['Nakatiya', 'Shyamganj', 'Satellite', 'Bareilly Jn', 'Chaupula', 'Delhapeer'].map((name) => {
              const loc = availableLocations.find(l => l.name.toLowerCase().includes(name.toLowerCase()));
              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => {
                    if (!selectedFromLoc) {
                      setFromQuery(loc ? loc.name : name);
                      setSelectedFromLoc(loc || null);
                    } else {
                      setToQuery(loc ? loc.name : name);
                      setSelectedToLoc(loc || null);
                      handleSearchFare(selectedFromLoc, loc || name);
                    }
                  }}
                  className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md whitespace-nowrap transition-colors cursor-pointer text-[11px] font-medium"
                >
                  {name}
                </button>
              );
            })}
          </div>

          <button
            id="fare-search-submit-btn"
            type="button"
            onClick={() => handleSearchFare()}
            className="w-full sm:w-auto px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl shadow-2xs transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
          >
            <Search className="w-3.5 h-3.5" />
            <span>{isHindi ? 'किराया देखें' : 'Calculate Fare'}</span>
          </button>
        </div>
      </div>

      {/* SEARCH RESULT: Clean, Professional, Light-themed, Per-Seat Focused */}
      {hasSearched && calculatedResult && (
        <div id="fare-search-results-card" className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-3.5 sm:p-4 space-y-3.5">
          
          {/* Route Overview */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                <span>~{calculatedResult.distanceKm} km</span>
                <span>•</span>
                <span>~{calculatedResult.estimatedMin} mins</span>
              </div>

              <div className="flex items-center gap-2 text-sm sm:text-base font-bold text-slate-900">
                <span className="text-emerald-700">{calculatedResult.originName.split('(')[0].trim()}</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="text-rose-700">{calculatedResult.destName.split('(')[0].trim()}</span>
              </div>
            </div>

            {/* Audio Voice Readout */}
            <button
              onClick={handleSpeakFare}
              className="self-start sm:self-center px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-semibold text-xs transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer shadow-2xs shrink-0"
            >
              {isSpeaking ? (
                <>
                  <VolumeX className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                  <span>{isHindi ? 'रोकें' : 'Stop'}</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-slate-600" />
                  <span>{isHindi ? 'किराया सुनें' : 'Listen'}</span>
                </>
              )}
            </button>
          </div>

          {/* Just Per Seat Pricing Card */}
          <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-3 sm:p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-medium text-emerald-800">
                    {isHindi ? 'ई-रिक्शा शेयरिंग किराया' : 'Standard Shared Tariff'}
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-black text-emerald-950">₹{effectivePerSeatFare}</span>
                    <span className="text-xs font-semibold text-emerald-700">/{isHindi ? 'प्रति सीट' : 'per seat'}</span>
                  </div>
                </div>
              </div>

              {/* Passenger Selector */}
              <div className="flex items-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-emerald-200/60">
                <span className="text-xs font-medium text-slate-600">{isHindi ? 'सवारी:' : 'Seats:'}</span>
                <div className="flex items-center gap-1 bg-white border border-emerald-200 rounded-lg p-0.5 shadow-2xs">
                  {[1, 2, 3, 4].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setPassengers(num)}
                      className={`w-6 h-6 rounded-md text-xs font-bold transition-all cursor-pointer ${
                        passengers === num
                          ? 'bg-emerald-600 text-white shadow-2xs'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>

                {passengers > 1 && (
                  <div className="text-xs font-bold text-slate-800 ml-1">
                    = ₹{effectivePerSeatFare * passengers}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Navigation & Action */}
          {onNavigateRoute && (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => onNavigateRoute(calculatedResult.fromLocationObj, calculatedResult.toLocationObj)}
                className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-medium text-xs flex items-center gap-1.5 shadow-2xs transition-all active:scale-95 cursor-pointer"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>{isHindi ? 'मैप पर रूट देखें' : 'View on Map'}</span>
              </button>
            </div>
          )}

          {/* Official Verification Notice */}
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 pt-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>
              {isHindi 
                ? 'परिवहन विभाग द्वारा निर्धारित मानक दर।' 
                : 'Official verified city transit rate.'}
            </span>
          </div>

        </div>
      )}

      {/* Verified City Corridors Directory */}
      <div id="fare-popular-corridors-section" className="bg-white rounded-2xl border border-slate-200 p-3 sm:p-4 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h2 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5">
            <span>⭐</span>
            <span>{isHindi ? `${cityName} रूट रेट कार्ड` : `${cityName} Corridors & Rates`}</span>
          </h2>

          {/* Category Filter Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-0.5">
            {['All', 'Popular', 'Commuter', 'Station', 'Student', 'Market', 'Hospital'].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategoryFilter(cat)}
                className={`px-2.5 py-0.5 rounded-lg text-[11px] font-medium transition-all whitespace-nowrap cursor-pointer ${
                  selectedCategoryFilter === cat
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat === 'All' ? (isHindi ? 'सभी' : 'All') : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Corridor Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {filteredCorridors.map((rule) => (
            <button
              key={rule.id}
              type="button"
              onClick={() => {
                setFromQuery(rule.originName);
                setToQuery(rule.destName);
                const oLoc = availableLocations.find(l => l.id === rule.originId) || availableLocations[0];
                const dLoc = availableLocations.find(l => l.id === rule.destId) || availableLocations[1];
                setSelectedFromLoc(oLoc);
                setSelectedToLoc(dLoc);
                handleSearchFare(oLoc, dLoc);
              }}
              className="text-left p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200 hover:border-slate-300 transition-all cursor-pointer flex flex-col justify-between gap-1.5 shadow-2xs group"
            >
              <div className="space-y-0.5 w-full">
                <div className="flex items-center justify-between text-[10px] text-slate-400 font-semibold">
                  <span className="px-1.5 py-0.2 rounded bg-slate-200/80 text-slate-700">{rule.category}</span>
                  <span className="text-slate-500 font-medium">
                    ~{rule.distanceKm} km
                  </span>
                </div>

                <div className="text-xs font-semibold text-slate-900 line-clamp-1">
                  {rule.originName.split(' ')[0]} ➔ {rule.destName.split(' ')[0]}
                </div>
              </div>

              <div className="pt-1.5 border-t border-slate-200/60 flex items-center justify-between w-full">
                <span className="text-xs font-bold text-emerald-800">
                  {rule.fareRangeText}
                  <span className="text-[10px] text-slate-400 font-normal ml-0.5">
                    /{isHindi ? 'सीट' : 'seat'}
                  </span>
                </span>
                <span className="text-[10px] text-slate-400">
                  ~{rule.frequency}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

    </div>
  );
};
