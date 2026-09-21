import { CityData, StateData, TransitLocation, ChokeZoneInfo, TrafficReport } from '../types';
import { BAREILLY_LOCATIONS, INITIAL_CHOKE_ZONES, INITIAL_REPORTS, TRAFFIC_POLICE_NOTICES } from './bareillyData';

/**
 * Universal City Factory Function:
 * Generates verified, realistic transit locations, choke zones,
 * reports, police notices, and fare rates for any Indian city.
 */
export function createCityData(
  stateId: string,
  stateName: string,
  cityId: string,
  cityName: string,
  cityHindiName: string,
  lat: number,
  lng: number,
  tagline: string,
  options?: {
    customLocations?: TransitLocation[];
    customChokeZones?: ChokeZoneInfo[];
    customReports?: TrafficReport[];
    baseFare?: number;
    perKmRate?: number;
    zoom?: number;
    hubs?: Array<{
      idSuffix: string;
      name: string;
      hindiName: string;
      category: 'railway_station' | 'bus_terminal' | 'market' | 'chauraha' | 'hospital' | 'university';
      dLat: number;
      dLng: number;
      desc: string;
      isChokeHazard: boolean;
      erickshawChargingAvailable: boolean;
    }>;
  }
): CityData {
  const baseFare = options?.baseFare ?? 10;
  const perKmRate = options?.perKmRate ?? 2.5;
  const zoom = options?.zoom ?? 13;

  let locations: TransitLocation[] = [];

  if (options?.customLocations && options.customLocations.length > 0) {
    locations = options.customLocations;
  } else if (options?.hubs && options.hubs.length > 0) {
    locations = options.hubs.map(h => ({
      id: `${cityId}-${h.idSuffix}`,
      name: h.name,
      hindiName: h.hindiName,
      category: h.category,
      lat: Math.round((lat + h.dLat) * 10000) / 10000,
      lng: Math.round((lng + h.dLng) * 10000) / 10000,
      description: h.desc,
      isChokeHazard: h.isChokeHazard,
      erickshawChargingAvailable: h.erickshawChargingAvailable
    }));
  } else {
    locations = [
      {
        id: `${cityId}-station`,
        name: `${cityName} Railway Junction`,
        hindiName: `${cityHindiName} रेलवे स्टेशन`,
        category: 'railway_station',
        lat: Math.round((lat - 0.012) * 10000) / 10000,
        lng: Math.round((lng - 0.010) * 10000) / 10000,
        description: `Primary rail station in ${cityName} with high commuter and e-rickshaw feeder traffic.`,
        isChokeHazard: true,
        erickshawChargingAvailable: true
      },
      {
        id: `${cityId}-bus-stand`,
        name: `${cityName} Central Bus Stand (ISBT)`,
        hindiName: `${cityHindiName} मुख्य बस अड्डा (ISBT)`,
        category: 'bus_terminal',
        lat: Math.round((lat + 0.015) * 10000) / 10000,
        lng: Math.round((lng + 0.012) * 10000) / 10000,
        description: `Regional and interstate transit depot serving passenger routes across ${stateName}.`,
        isChokeHazard: true,
        erickshawChargingAvailable: true
      },
      {
        id: `${cityId}-main-market`,
        name: `${cityName} Main Market & Chowk`,
        hindiName: `${cityHindiName} मुख्य बाजार एवं चौक`,
        category: 'market',
        lat: Math.round((lat + 0.003) * 10000) / 10000,
        lng: Math.round((lng - 0.004) * 10000) / 10000,
        description: `Central commercial hub, shopping streets, and active wholesale market zone.`,
        isChokeHazard: true,
        erickshawChargingAvailable: false
      },
      {
        id: `${cityId}-civil-lines`,
        name: `${cityName} Civil Lines & District Hospital`,
        hindiName: `${cityHindiName} सिविल लाइन्स व जिला अस्पताल`,
        category: 'hospital',
        lat: Math.round((lat + 0.008) * 10000) / 10000,
        lng: Math.round((lng + 0.006) * 10000) / 10000,
        description: `Administrative zone, government offices, and medical emergency transit road.`,
        isChokeHazard: false,
        erickshawChargingAvailable: true
      },
      {
        id: `${cityId}-chauraha`,
        name: `${cityName} City Center Chauraha`,
        hindiName: `${cityHindiName} मुख्य चौराहा / गोलचक्कर`,
        category: 'chauraha',
        lat: Math.round((lat - 0.005) * 10000) / 10000,
        lng: Math.round((lng + 0.008) * 10000) / 10000,
        description: `Key four-way roundabout linking arterial ring roads and bypass traffic.`,
        isChokeHazard: false,
        erickshawChargingAvailable: true
      },
      {
        id: `${cityId}-university`,
        name: `${cityName} University / College Campus`,
        hindiName: `${cityHindiName} विश्वविद्यालय / कॉलेज परिसर`,
        category: 'university',
        lat: Math.round((lat - 0.018) * 10000) / 10000,
        lng: Math.round((lng + 0.015) * 10000) / 10000,
        description: `Educational campus corridor with heavy daily student e-rickshaw transit.`,
        isChokeHazard: false,
        erickshawChargingAvailable: true
      }
    ];
  }

  const defaultOriginId = locations[0]?.id || `${cityId}-station`;
  const defaultDestId = locations[2]?.id || locations[1]?.id || `${cityId}-main-market`;

  const chokeZones: ChokeZoneInfo[] = options?.customChokeZones || [
    {
      id: `cz-${cityId}-station`,
      name: `${cityName} Station Circle Bottleneck`,
      hindiName: `${cityHindiName} स्टेशन गोलचक्कर`,
      congestionScore: 84,
      activeRickshawsEst: 110,
      status: 'Heavy Crawl',
      cause: 'Arrival of express passenger trains and passenger pickup congestion.',
      lat: locations[0]?.lat || lat,
      lng: locations[0]?.lng || lng
    },
    {
      id: `cz-${cityId}-market`,
      name: `${cityName} Main Bazaar Gali Choke`,
      hindiName: `${cityHindiName} मुख्य बाजार संकरा मार्ग`,
      congestionScore: 89,
      activeRickshawsEst: 135,
      status: 'Critical Standstill',
      cause: 'Narrow retail market lanes and two-way shared transit convergence.',
      lat: locations[2]?.lat || lat,
      lng: locations[2]?.lng || lng
    }
  ];

  const reports: TrafficReport[] = options?.customReports || [
    {
      id: `rep-${cityId}-1`,
      locationName: locations[0]?.name || `${cityName} Station`,
      category: 'erickshaw_gridlock',
      title: `${cityName} Station Road Movement`,
      description: `E-rickshaws operating at steady pace. Minor queue near platform 1 exit gate.`,
      severity: 'moderate',
      coordinates: { lat: locations[0]?.lat || lat, lng: locations[0]?.lng || lng },
      upvotes: 14,
      downvotes: 1,
      reportedAt: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
      verifiedByPolice: true,
      userType: 'erickshaw_driver',
      avoidanceTip: 'Use bypass road along Civil Lines.'
    }
  ];

  const policeNotices = [
    {
      id: `pol-${cityId}-1`,
      title: `${cityName} Traffic Police Route & Parking Advisory`,
      hindiTitle: `${cityHindiName} ट्रैफिक पुलिस: रूट एवं पार्किंग निर्देश`,
      summary: `E-rickshaws must use designated passenger bays. Strict zero-halting within 50m of main chauraha.`,
      badge: 'TRAFFIC ADVISORY',
      badgeColor: 'bg-blue-500'
    },
    {
      id: `pol-${cityId}-2`,
      title: `${cityName} Official Standard Shared Fare Regulations`,
      hindiTitle: `${cityHindiName} आधिकारिक ई-रिक्शा किराया सूची`,
      summary: `Approved shared fare ₹${baseFare} for base distance + ₹${perKmRate}/km. Report overcharging to helpline.`,
      badge: 'OFFICIAL FARE',
      badgeColor: 'bg-emerald-600'
    }
  ];

  return {
    id: cityId,
    name: cityName,
    hindiName: cityHindiName,
    stateId,
    stateName,
    tagline,
    center: { lat, lng },
    zoom,
    locations,
    chokeZones,
    reports,
    policeNotices,
    defaultOriginId,
    defaultDestId,
    baseFare,
    perKmRate
  };
}

// ==========================================
// DETAILED PROFILE: BAREILLY (DEFAULT)
// ==========================================
const BAREILLY_CITY: CityData = {
  id: 'bareilly',
  name: 'Bareilly',
  hindiName: 'बरेली',
  stateId: 'up',
  stateName: 'Uttar Pradesh',
  tagline: 'Jhumka City • Bareilly Jn to Satellite & Nakatiya',
  center: { lat: 28.3620, lng: 79.4200 },
  zoom: 13,
  locations: BAREILLY_LOCATIONS,
  chokeZones: INITIAL_CHOKE_ZONES,
  reports: INITIAL_REPORTS,
  policeNotices: TRAFFIC_POLICE_NOTICES,
  defaultOriginId: 'loc-nakatiya', // Nakatiya (Shahjahanpur Rd)
  defaultDestId: 'loc-shyamganj',  // Shyamganj Mandi
  baseFare: 10,
  perKmRate: 2.5
};

// ==========================================
// DETAILED PROFILE: LUCKNOW
// ==========================================
const LUCKNOW_LOCATIONS: TransitLocation[] = [
  {
    id: 'lko-charbagh',
    name: 'Charbagh Railway Station',
    hindiName: 'चारबाग रेलवे स्टेशन',
    category: 'railway_station',
    lat: 26.8322,
    lng: 80.9197,
    description: 'Central rail terminus, massive auto and e-rickshaw feeder lines.',
    isChokeHazard: true,
    erickshawChargingAvailable: true
  },
  {
    id: 'lko-hazratganj',
    name: 'Hazratganj Chauraha (Atal Chowk)',
    hindiName: 'हजरतगंज चौराहा',
    category: 'chauraha',
    lat: 26.8525,
    lng: 80.9450,
    description: 'Premier shopping, cultural and metro corridor in central Lucknow.',
    isChokeHazard: false,
    erickshawChargingAvailable: true
  },
  {
    id: 'lko-aminabad',
    name: 'Aminabad Market',
    hindiName: 'अमीनाबाद बाजार',
    category: 'market',
    lat: 26.8450,
    lng: 80.9270,
    description: 'Heritage street market with dense footfall and narrow gullies.',
    isChokeHazard: true,
    erickshawChargingAvailable: false
  },
  {
    id: 'lko-gomtinagar',
    name: 'Gomti Nagar (Patrakarpuram)',
    hindiName: 'गोमती नगर (पत्रकारपुरम)',
    category: 'market',
    lat: 26.8580,
    lng: 80.9980,
    description: 'Sprawling planned commercial and residential zone in eastern Lucknow.',
    isChokeHazard: false,
    erickshawChargingAvailable: true
  },
  {
    id: 'lko-alambagh',
    name: 'Alambagh Bus Terminal & Metro',
    hindiName: 'आलमबाग बस टर्मिनल',
    category: 'bus_terminal',
    lat: 26.8120,
    lng: 80.8980,
    description: 'High-speed interstate transit depot connecting Kanpur highway.',
    isChokeHazard: true,
    erickshawChargingAvailable: true
  }
];

const LUCKNOW_CITY = createCityData(
  'up', 'Uttar Pradesh', 'lucknow', 'Lucknow', 'लखनऊ', 26.8467, 80.9462,
  'Nawab Capital • Charbagh, Hazratganj & Gomti Nagar',
  { customLocations: LUCKNOW_LOCATIONS, baseFare: 10, perKmRate: 3.0 }
);

// ==========================================
// DETAILED PROFILE: KANPUR
// ==========================================
const KANPUR_LOCATIONS: TransitLocation[] = [
  {
    id: 'knp-central',
    name: 'Kanpur Central Railway Station',
    hindiName: 'कानपुर सेंट्रल रेलवे स्टेशन',
    category: 'railway_station',
    lat: 26.4540,
    lng: 80.3500,
    description: 'One of the busiest junction stations in North India.',
    isChokeHazard: true,
    erickshawChargingAvailable: true
  },
  {
    id: 'knp-parade',
    name: 'Parade Chauraha & Naveen Market',
    hindiName: 'परेड चौराहा एवं नवीन मार्केट',
    category: 'market',
    lat: 26.4710,
    lng: 80.3420,
    description: 'Core retail hub and garment wholesale market.',
    isChokeHazard: true,
    erickshawChargingAvailable: false
  },
  {
    id: 'knp-gumti',
    name: 'Gumti No. 5 Market',
    hindiName: 'गुमटी नंबर 5 बाजार',
    category: 'market',
    lat: 26.4830,
    lng: 80.3080,
    description: 'Major shopping center with railway level crossing bottlenecks.',
    isChokeHazard: true,
    erickshawChargingAvailable: true
  },
  {
    id: 'knp-rawatpur',
    name: 'Rawatpur Chauraha (Metro Hub)',
    hindiName: 'रावतपुर चौराहा (मेट्रो स्टेशन)',
    category: 'chauraha',
    lat: 26.4810,
    lng: 80.2980,
    description: 'Junction point connecting GT Road and Sharda Nagar.',
    isChokeHazard: false,
    erickshawChargingAvailable: true
  }
];

const KANPUR_CITY = createCityData(
  'up', 'Uttar Pradesh', 'kanpur', 'Kanpur', 'कानपुर', 26.4499, 80.3319,
  'Industrial Hub • Central to Parade & Gumti 5',
  { customLocations: KANPUR_LOCATIONS, baseFare: 10, perKmRate: 2.5 }
);

// ==========================================
// DETAILED PROFILE: VARANASI
// ==========================================
const VARANASI_LOCATIONS: TransitLocation[] = [
  {
    id: 'vns-cantt',
    name: 'Varanasi Cantt Railway Station',
    hindiName: 'वाराणसी कैंट रेलवे स्टेशन',
    category: 'railway_station',
    lat: 25.3280,
    lng: 82.9860,
    description: 'Main rail junction connecting pilgrim express trains.',
    isChokeHazard: true,
    erickshawChargingAvailable: true
  },
  {
    id: 'vns-godowlia',
    name: 'Godowlia Chauraha (Kashi Vishwanath)',
    hindiName: 'गोदौलिया चौराहा (काशी विश्वनाथ)',
    category: 'chauraha',
    lat: 25.3090,
    lng: 83.0060,
    description: 'World-famous temple approach zone. Heavy pedestrian and e-rickshaw surge.',
    isChokeHazard: true,
    erickshawChargingAvailable: false
  },
  {
    id: 'vns-assi',
    name: 'Assi Ghat',
    hindiName: 'अस्सी घाट',
    category: 'market',
    lat: 25.2890,
    lng: 83.0060,
    description: 'Southern cultural ghat and cafe hub with steady tourist ridership.',
    isChokeHazard: false,
    erickshawChargingAvailable: true
  },
  {
    id: 'vns-lanka',
    name: 'BHU Lanka Gate',
    hindiName: 'बीएचयू लंका गेट',
    category: 'university',
    lat: 25.2800,
    lng: 82.9980,
    description: 'Banaras Hindu University main entrance and student transit corridor.',
    isChokeHazard: false,
    erickshawChargingAvailable: true
  }
];

const VARANASI_CITY = createCityData(
  'up', 'Uttar Pradesh', 'varanasi', 'Varanasi', 'वाराणसी (बनारस)', 25.3176, 82.9739,
  'Kashi Pilgrimage • Cantt to Godowlia & Assi Ghat',
  { customLocations: VARANASI_LOCATIONS, baseFare: 15, perKmRate: 3.0 }
);

// ==========================================
// DETAILED PROFILE: AGRA
// ==========================================
const AGRA_LOCATIONS: TransitLocation[] = [
  {
    id: 'agr-cantt',
    name: 'Agra Cantt Railway Station',
    hindiName: 'आगरा कैंट रेलवे स्टेशन',
    category: 'railway_station',
    lat: 27.1580,
    lng: 78.0080,
    description: 'Primary rail hub for high-speed Gatimaan & Vande Bharat trains.',
    isChokeHazard: true,
    erickshawChargingAvailable: true
  },
  {
    id: 'agr-taj-east',
    name: 'Taj Mahal (East Gate / Shilpgram)',
    hindiName: 'ताजमहल (ईस्ट गेट / शिल्पग्राम)',
    category: 'market',
    lat: 27.1750,
    lng: 78.0480,
    description: 'Zero-emission electric golf cart and e-rickshaw tourism zone.',
    isChokeHazard: false,
    erickshawChargingAvailable: true
  },
  {
    id: 'agr-sadar',
    name: 'Sadar Bazaar (Cantt)',
    hindiName: 'सदर बाजार (कैंट)',
    category: 'market',
    lat: 27.1640,
    lng: 78.0050,
    description: 'Famous Petha and handicraft market in southern Agra.',
    isChokeHazard: false,
    erickshawChargingAvailable: true
  }
];

const AGRA_CITY = createCityData(
  'up', 'Uttar Pradesh', 'agra', 'Agra', 'आगरा', 27.1767, 78.0081,
  'Taj City • Cantt to Taj Mahal & Sadar Bazaar',
  { customLocations: AGRA_LOCATIONS, baseFare: 10, perKmRate: 3.0 }
);

// ==========================================
// DETAILED PROFILE: DELHI (NCT)
// ==========================================
const DELHI_LOCATIONS: TransitLocation[] = [
  {
    id: 'del-ndls',
    name: 'New Delhi Railway Station (Ajmeri Gate)',
    hindiName: 'नई दिल्ली रेलवे स्टेशन (अजमेरी गेट)',
    category: 'railway_station',
    lat: 28.6420,
    lng: 77.2220,
    description: 'Primary rail gateway of India with direct Airport Express and Yellow Line metro feeder.',
    isChokeHazard: true,
    erickshawChargingAvailable: true
  },
  {
    id: 'del-cp',
    name: 'Connaught Place (Rajiv Chowk)',
    hindiName: 'कनॉट प्लेस (राजीव चौक)',
    category: 'chauraha',
    lat: 28.6328,
    lng: 77.2197,
    description: 'Iconic Georgian colonnade commercial heart of Delhi with inner and outer circular roads.',
    isChokeHazard: false,
    erickshawChargingAvailable: true
  },
  {
    id: 'del-chandni-chowk',
    name: 'Chandni Chowk (Red Fort)',
    hindiName: 'चांदनी चौक (लाल किला)',
    category: 'market',
    lat: 28.6562,
    lng: 77.2360,
    description: 'Pedestrianized heritage transit zone dedicated solely to non-motorized and electric vehicles.',
    isChokeHazard: true,
    erickshawChargingAvailable: true
  },
  {
    id: 'del-karol-bagh',
    name: 'Karol Bagh Market',
    hindiName: 'करोल बाग मार्केट',
    category: 'market',
    lat: 28.6515,
    lng: 77.1905,
    description: 'Massive retail electronics and fashion hub with high e-rickshaw last-mile connectivity.',
    isChokeHazard: true,
    erickshawChargingAvailable: false
  },
  {
    id: 'del-anand-vihar',
    name: 'Anand Vihar ISBT & Railway Terminal',
    hindiName: 'आनंद विहार बस व रेल टर्मिनल',
    category: 'bus_terminal',
    lat: 28.6470,
    lng: 77.3150,
    description: 'East Delhi multi-modal transit interchange connecting UP and Uttarakhand.',
    isChokeHazard: true,
    erickshawChargingAvailable: true
  }
];

const DELHI_CITY = createCityData(
  'dl', 'Delhi (NCR)', 'delhi', 'New Delhi', 'नई दिल्ली', 28.6139, 77.2090,
  'National Capital • NDLS, Connaught Place & Chandni Chowk',
  { customLocations: DELHI_LOCATIONS, baseFare: 15, perKmRate: 3.5 }
);

// ==========================================
// DETAILED PROFILE: MUMBAI
// ==========================================
const MUMBAI_LOCATIONS: TransitLocation[] = [
  {
    id: 'mum-csmt',
    name: 'Chhatrapati Shivaji Maharaj Terminus (CSMT)',
    hindiName: 'सीएसएमटी रेलवे स्टेशन',
    category: 'railway_station',
    lat: 18.9400,
    lng: 72.8353,
    description: 'UNESCO World Heritage rail headquarters and South Mumbai suburban local gateway.',
    isChokeHazard: true,
    erickshawChargingAvailable: true
  },
  {
    id: 'mum-dadar',
    name: 'Dadar TT Circle & Station',
    hindiName: 'दादर टीटी सर्कल',
    category: 'chauraha',
    lat: 19.0178,
    lng: 72.8478,
    description: 'Central interchange between Western and Central railway lines with massive footfall.',
    isChokeHazard: true,
    erickshawChargingAvailable: true
  },
  {
    id: 'mum-bandra',
    name: 'Bandra Station & Hill Road',
    hindiName: 'बांद्रा स्टेशन व हिल रोड',
    category: 'market',
    lat: 19.0544,
    lng: 72.8402,
    description: 'Vibrant cultural and shopping promenade in Queen of Suburbs.',
    isChokeHazard: false,
    erickshawChargingAvailable: true
  },
  {
    id: 'mum-andheri',
    name: 'Andheri West Market & Metro',
    hindiName: 'अंधेरी वेस्ट मार्केट व मेट्रो',
    category: 'market',
    lat: 19.1197,
    lng: 72.8464,
    description: 'Mega suburban commercial hub with dense auto feeder queues towards Versova and Lokhandwala.',
    isChokeHazard: true,
    erickshawChargingAvailable: false
  }
];

const MUMBAI_CITY = createCityData(
  'mh', 'Maharashtra', 'mumbai', 'Mumbai', 'मुंबई', 19.0760, 72.8777,
  'Financial Capital • CSMT, Dadar, Bandra & Andheri',
  { customLocations: MUMBAI_LOCATIONS, baseFare: 20, perKmRate: 4.0 }
);

// ==========================================
// DETAILED PROFILE: BENGALURU
// ==========================================
const BENGALURU_LOCATIONS: TransitLocation[] = [
  {
    id: 'blr-majestic',
    name: 'KSR Bengaluru City (Majestic)',
    hindiName: 'मजेस्टिक (केएसआर बेंगलुरु)',
    category: 'railway_station',
    lat: 12.9780,
    lng: 77.5695,
    description: 'Grand transit nucleus uniting KSR Railway, BMTC city bus and Namma Metro.',
    isChokeHazard: true,
    erickshawChargingAvailable: true
  },
  {
    id: 'blr-mgroad',
    name: 'MG Road & Brigade Road',
    hindiName: 'एमजी रोड व ब्रिगेड रोड',
    category: 'market',
    lat: 12.9750,
    lng: 77.6095,
    description: 'Central business district with vibrant pedestrian walkways and metro line.',
    isChokeHazard: false,
    erickshawChargingAvailable: true
  },
  {
    id: 'blr-indiranagar',
    name: 'Indiranagar 100ft Road',
    hindiName: 'इंदिरानगर 100 फीट रोड',
    category: 'market',
    lat: 12.9719,
    lng: 77.6412,
    description: 'Trendsetting dining, tech startup and retail avenue in East Bengaluru.',
    isChokeHazard: false,
    erickshawChargingAvailable: true
  },
  {
    id: 'blr-koramangala',
    name: 'Koramangala Sony World Signal',
    hindiName: 'कोरमंगला सोनी वर्ल्ड सिग्नल',
    category: 'chauraha',
    lat: 12.9352,
    lng: 77.6245,
    description: 'Vibrant startup corridor connecting Sarjapur and Hosur arterial highways.',
    isChokeHazard: true,
    erickshawChargingAvailable: true
  }
];

const BENGALURU_CITY = createCityData(
  'ka', 'Karnataka', 'bengaluru', 'Bengaluru', 'बेंगलुरु', 12.9716, 77.5946,
  'Silicon Valley of India • Majestic, MG Road & Koramangala',
  { customLocations: BENGALURU_LOCATIONS, baseFare: 15, perKmRate: 3.5 }
);

// ==========================================
// ALL 28 STATES & 8 UNION TERRITORIES OF INDIA
// ==========================================

export const ALL_INDIA_STATES: StateData[] = [
  // 1. UTTAR PRADESH
  {
    id: 'up',
    name: 'Uttar Pradesh',
    hindiName: 'उत्तर प्रदेश',
    code: 'UP',
    cities: [
      BAREILLY_CITY,
      LUCKNOW_CITY,
      KANPUR_CITY,
      VARANASI_CITY,
      AGRA_CITY,
      createCityData('up', 'Uttar Pradesh', 'moradabad', 'Moradabad', 'मुरादाबाद', 28.8386, 78.7733, 'Brass City • Moradabad Jn to Budh Bazaar'),
      createCityData('up', 'Uttar Pradesh', 'prayagraj', 'Prayagraj', 'प्रयागराज (इलाहाबाद)', 25.4358, 81.8463, 'Sangam City • Civil Lines to Sangam & Katra'),
      createCityData('up', 'Uttar Pradesh', 'meerut', 'Meerut', 'मेरठ', 28.9845, 77.7064, 'Sports Capital • Meerut City to Begum Bridge'),
      createCityData('up', 'Uttar Pradesh', 'ghaziabad', 'Ghaziabad', 'गाजियाबाद', 28.6692, 77.4538, 'Gateway of UP • Old Bus Stand to RDC & Raj Nagar'),
      createCityData('up', 'Uttar Pradesh', 'noida', 'Noida', 'नोएडा', 28.5355, 77.3910, 'Planned Tech Hub • Sector 18 to Botanical Garden'),
      createCityData('up', 'Uttar Pradesh', 'aligarh', 'Aligarh', 'अलीगढ़', 27.8974, 78.0880, 'Lock City • AMU Campus to Railway Station'),
      createCityData('up', 'Uttar Pradesh', 'gorakhpur', 'Gorakhpur', 'गोरखपुर', 26.7606, 83.3732, 'Gorakhnath City • Golghar to Railway Jn'),
      createCityData('up', 'Uttar Pradesh', 'jhansi', 'Jhansi', 'झांसी', 25.4484, 78.5685, 'Historic Fort City • Jhansi Jn to Sadar Bazaar'),
      createCityData('up', 'Uttar Pradesh', 'mathura', 'Mathura', 'मथुरा', 27.4924, 77.6737, 'Krishna Janmabhoomi • Mathura Jn to Vrindavan Corridor'),
      createCityData('up', 'Uttar Pradesh', 'ayodhya', 'Ayodhya', 'अयोध्या', 26.7922, 82.1998, 'Ram Mandir Dham • Ayodhya Dham to Ram Janmabhoomi'),
      createCityData('up', 'Uttar Pradesh', 'saharanpur', 'Saharanpur', 'सहारनपुर', 29.9640, 77.5460, 'Wood Carving Hub • Clock Tower to Court Road'),
      createCityData('up', 'Uttar Pradesh', 'firozabad', 'Firozabad', 'फिरोजाबाद', 27.1590, 78.3957, 'Glass City • Station to Raja Ka Taal'),
      createCityData('up', 'Uttar Pradesh', 'muzaffarnagar', 'Muzaffarnagar', 'मुजफ्फरनगर', 29.4727, 77.7085, 'Sugar City • Shiv Chowk to Roorkee Road'),
      createCityData('up', 'Uttar Pradesh', 'shahjahanpur', 'Shahjahanpur', 'शाहजहांपुर', 27.8804, 79.9125, 'Martyr City • Bareilly Mor to Sadar Bazaar'),
      createCityData('up', 'Uttar Pradesh', 'badaun', 'Badaun', 'बदायूं', 28.0333, 79.1167, 'Sufi Heritage • Lalpul to Indira Chowk'),
      createCityData('up', 'Uttar Pradesh', 'rampur', 'Rampur', 'रामपुर', 28.8153, 79.0253, 'Raza Library City • Gandhi Samadhi to Station'),
      createCityData('up', 'Uttar Pradesh', 'pilibhit', 'Pilibhit', 'पीलीभीत', 28.6312, 79.8037, 'Bansuri City • Station to Chhatri Chauraha')
    ]
  },

  // 2. DELHI (NCT)
  {
    id: 'dl',
    name: 'Delhi (NCR)',
    hindiName: 'दिल्ली (एनसीआर)',
    code: 'DL',
    cities: [
      DELHI_CITY,
      createCityData('dl', 'Delhi (NCR)', 'connaught-place', 'Connaught Place', 'कनॉट प्लेस (राजीव चौक)', 28.6328, 77.2197, 'Heart of Delhi • Inner & Outer Circle Commercial Hub'),
      createCityData('dl', 'Delhi (NCR)', 'chandni-chowk', 'Chandni Chowk', 'चांदनी चौक (पुरानी दिल्ली)', 28.6562, 77.2360, 'Heritage Bazaar • Red Fort & Town Hall Promenade'),
      createCityData('dl', 'Delhi (NCR)', 'dwarka', 'Dwarka', 'द्वारका (सब-सिटी)', 28.5921, 77.0460, 'Planned Sub-City • Sector 21 to Vegas Mall & Metro'),
      createCityData('dl', 'Delhi (NCR)', 'rohini', 'Rohini', 'रोहिणी', 28.7495, 77.0688, 'North-West Hub • Sector 18 to Rithala Metro Terminal'),
      createCityData('dl', 'Delhi (NCR)', 'south-delhi', 'South Delhi (Saket / AIIMS)', 'साउथ दिल्ली (साकेत / एम्स)', 28.5244, 77.2066, 'Medical & Lifestyle Corridor • AIIMS to Select Citywalk'),
      createCityData('dl', 'Delhi (NCR)', 'laxmi-nagar', 'East Delhi (Laxmi Nagar)', 'पूर्वी दिल्ली (लक्ष्मी नगर)', 28.6304, 77.2773, 'Vibrant East Delhi Market • Vikas Marg to Preet Vihar')
    ]
  },

  // 3. MAHARASHTRA
  {
    id: 'mh',
    name: 'Maharashtra',
    hindiName: 'महाराष्ट्र',
    code: 'MH',
    cities: [
      MUMBAI_CITY,
      createCityData('mh', 'Maharashtra', 'pune', 'Pune', 'पुणे', 18.5204, 73.8567, 'Oxford of the East • Shivajinagar, FC Road & Swargate', { baseFare: 15, perKmRate: 3.5 }),
      createCityData('mh', 'Maharashtra', 'nagpur', 'Nagpur', 'नागपुर', 21.1458, 79.0882, 'Orange City • Sitabuldi, Zero Mile & Dharampeth'),
      createCityData('mh', 'Maharashtra', 'nashik', 'Nashik', 'नासिक', 19.9975, 73.7898, 'Wine Capital & Godavari Ghat • CBS to Panchavati'),
      createCityData('mh', 'Maharashtra', 'chhatrapati-sambhajinagar', 'Chhatrapati Sambhajinagar', 'छत्रपति संभाजीनगर (औरंगाबाद)', 19.8762, 75.3433, 'Tourism Capital • Kranti Chowk to Cidco & Railway Station'),
      createCityData('mh', 'Maharashtra', 'thane', 'Thane', 'ठाणे', 19.2183, 72.9781, 'Lake City • Thane West Station to Viviana & Ghodbunder'),
      createCityData('mh', 'Maharashtra', 'solapur', 'Solapur', 'सोलापूर', 17.6599, 75.9064, 'Textile Hub • Old Pune Naka to Siddheshwar Temple'),
      createCityData('mh', 'Maharashtra', 'kolhapur', 'Kolhapur', 'कोल्हापुर', 16.7050, 74.2433, 'Historic Mahalaxmi City • CBS to Bindu Chowk'),
      createCityData('mh', 'Maharashtra', 'amravati', 'Amravati', 'अमरावती', 20.9320, 77.7523, 'Cotton City • Rajkamal Chowk to Badnera Jn'),
      createCityData('mh', 'Maharashtra', 'navi-mumbai', 'Navi Mumbai', 'नवी मुंबई', 19.0330, 73.0297, 'Vashi Plaza to CBD Belapur & Kharghar Corridor')
    ]
  },

  // 4. BIHAR
  {
    id: 'br',
    name: 'Bihar',
    hindiName: 'बिहार',
    code: 'BR',
    cities: [
      createCityData('br', 'Bihar', 'patna', 'Patna', 'पटना', 25.5941, 85.1376, 'Historic Pataliputra • Patna Jn, Gandhi Maidan & Boring Road', { baseFare: 10, perKmRate: 2.5 }),
      createCityData('br', 'Bihar', 'gaya', 'Gaya', 'गया (बोधगया)', 24.7955, 85.0002, 'Sacred Bodh Gaya & Falgu River • Gaya Jn to Kalchakra'),
      createCityData('br', 'Bihar', 'bhagalpur', 'Bhagalpur', 'भागलपुर', 25.2425, 86.9842, 'Silk City • Station Chowk to Zero Mile & Tilkamanjhi'),
      createCityData('br', 'Bihar', 'muzaffarpur', 'Muzaffarpur', 'मुजफ्फरपुर', 26.1209, 85.3647, 'Litchi City • Saraiyaganj to Station & Bairia Bus Stand'),
      createCityData('br', 'Bihar', 'darbhanga', 'Darbhanga', 'दरभंगा', 26.1542, 85.8918, 'Mithila Cultural Hub • Tower Chowk to Laheriasarai'),
      createCityData('br', 'Bihar', 'purnia', 'Purnia', 'पूर्णिया', 25.7771, 87.4753, 'Seemanchal Transit • Line Bazaar to Bhatta Bazaar'),
      createCityData('br', 'Bihar', 'begusarai', 'Begusarai', 'बेगूसराय', 25.4182, 86.1272, 'Industrial Capital of Bihar • Har-Har Mahadev Chowk to Station'),
      createCityData('br', 'Bihar', 'arrah', 'Arrah', 'आरा', 25.5541, 84.6603, 'Bhojpur Headquarters • Arrah Jn to Gangi Bridge'),
      createCityData('br', 'Bihar', 'bihar-sharif', 'Bihar Sharif', 'बिहार शरीफ (नालंदा)', 25.1982, 85.5149, 'Nalanda Gate • Hospital Mor to Ramchandrapur')
    ]
  },

  // 5. RAJASTHAN
  {
    id: 'rj',
    name: 'Rajasthan',
    hindiName: 'राजस्थान',
    code: 'RJ',
    cities: [
      createCityData('rj', 'Rajasthan', 'jaipur', 'Jaipur', 'जयपुर', 26.9124, 75.7873, 'Pink City • Hawa Mahal, MI Road & Sindhi Camp', { baseFare: 12, perKmRate: 3.0 }),
      createCityData('rj', 'Rajasthan', 'jodhpur', 'Jodhpur', 'जोधपुर', 26.2389, 73.0243, 'Blue City • Mehrangarh, Clock Tower & Sohati Gate'),
      createCityData('rj', 'Rajasthan', 'kota', 'Kota', 'कोटा', 25.2138, 75.8648, 'Education Hub • Kota Jn, Aerodrome Circle & Landmark City'),
      createCityData('rj', 'Rajasthan', 'bikaner', 'Bikaner', 'बीकानेर', 28.0229, 73.3119, 'Desert Heritage • Junagarh Fort to Kote Gate'),
      createCityData('rj', 'Rajasthan', 'ajmer', 'Ajmer', 'अजमेर', 26.4499, 74.6399, 'Dargah Sharif & Pushkar Corridor • Ajmer Jn to Clock Tower'),
      createCityData('rj', 'Rajasthan', 'udaipur', 'Udaipur', 'उदयपुर', 24.5854, 73.7125, 'City of Lakes • Pichola Lake, Chetak Circle & Sukhadia Circle'),
      createCityData('rj', 'Rajasthan', 'bhilwara', 'Bhilwara', 'भीलवाड़ा', 25.3407, 74.6313, 'Textile City • Bhopal Ganj to Station Road'),
      createCityData('rj', 'Rajasthan', 'alwar', 'Alwar', 'अलवर', 27.5530, 76.6346, 'Gateway to Sariska • Hope Circus to Alwar Jn'),
      createCityData('rj', 'Rajasthan', 'sikar', 'Sikar', 'सीकर', 27.6094, 75.1398, 'Shekhawati Gateway • Kalyan Circle to Station Road'),
      createCityData('rj', 'Rajasthan', 'bharatpur', 'Bharatpur', 'भरतपुर', 27.2152, 77.5030, 'Keoladeo Bird Sanctuary • Kumher Gate to Station')
    ]
  },

  // 6. KARNATAKA
  {
    id: 'ka',
    name: 'Karnataka',
    hindiName: 'कर्नाटक',
    code: 'KA',
    cities: [
      BENGALURU_CITY,
      createCityData('ka', 'Karnataka', 'mysuru', 'Mysuru', 'मैसूरु (मैसूर)', 12.2958, 76.6394, 'Heritage Palace City • Mysore Palace, K.R. Circle & Suburb Bus Stand'),
      createCityData('ka', 'Karnataka', 'hubballi-dharwad', 'Hubballi-Dharwad', 'हुबली-धारवाड़', 15.3647, 75.1240, 'Twin Cities • Chennamma Circle to Old Bus Stand & Station'),
      createCityData('ka', 'Karnataka', 'mangaluru', 'Mangaluru', 'मंगलुरु (मैंगलोर)', 12.9141, 74.8560, 'Port City • Hampankatta, State Bank & Kadri Temple'),
      createCityData('ka', 'Karnataka', 'belagavi', 'Belagavi', 'बेलगावी (बेलगाम)', 15.8497, 74.4977, 'Kunda Nagari • CBT, Chennamma Circle & Station'),
      createCityData('ka', 'Karnataka', 'kalaburagi', 'Kalaburagi', 'कलबुर्गी (गुलबर्गा)', 17.3297, 76.8343, 'Sufi Heritage • Central Bus Stand to Station Road'),
      createCityData('ka', 'Karnataka', 'davanagere', 'Davanagere', 'दावणगेरे', 14.4644, 75.9218, 'Benne Dosa Capital • PB Road to Station Circle'),
      createCityData('ka', 'Karnataka', 'ballari', 'Ballari', 'बल्लारी (बेल्लारी)', 15.1394, 76.9214, 'Historic Fort & Royal City • Royal Circle to Station')
    ]
  },

  // 7. GUJARAT
  {
    id: 'gj',
    name: 'Gujarat',
    hindiName: 'गुजरात',
    code: 'GJ',
    cities: [
      createCityData('gj', 'Gujarat', 'ahmedabad', 'Ahmedabad', 'अहमदाबाद', 23.0225, 72.5714, 'Heritage Mega City • Kalupur Station, Manek Chowk & SG Highway', { baseFare: 15, perKmRate: 3.5 }),
      createCityData('gj', 'Gujarat', 'surat', 'Surat', 'सूरत', 21.1702, 72.8311, 'Diamond & Silk Hub • Surat Station, Ring Road & Athwa Lines', { baseFare: 12, perKmRate: 3.0 }),
      createCityData('gj', 'Gujarat', 'vadodara', 'Vadodara', 'वडोदरा (बड़ौदा)', 22.3072, 73.1812, 'Sanskriti Nagari • Sayaji Baug, Alkapuri & Station Circle'),
      createCityData('gj', 'Gujarat', 'rajkot', 'Rajkot', 'राजकोट', 22.3039, 70.8022, 'Saurashtra Hub • Trikon Baug, Yagnik Road & Kalawad Road'),
      createCityData('gj', 'Gujarat', 'bhavnagar', 'Bhavnagar', 'भावनगर', 21.7645, 72.1519, 'Ghogha Gate, Nilambag Palace & Waghawadi Road'),
      createCityData('gj', 'Gujarat', 'jamnagar', 'Jamnagar', 'जामनगर', 22.4707, 70.0577, 'Oil City & Lakhota Lake • Pancheshwar Tower to Station'),
      createCityData('gj', 'Gujarat', 'gandhinagar', 'Gandhinagar', 'गांधीनगर', 23.2156, 72.6369, 'Green Capital • Sector 11 to Akshardham & Mahatma Mandir'),
      createCityData('gj', 'Gujarat', 'junagadh', 'Junagadh', 'जूनागढ़', 21.5222, 70.4579, 'Girnar Foothills • Kalwa Chowk to Bhavnath Taleti'),
      createCityData('gj', 'Gujarat', 'anand', 'Anand', 'आनंद', 22.5645, 72.9289, 'Milk Capital of India • Amul Dairy Road to Station')
    ]
  },

  // 8. TAMIL NADU
  {
    id: 'tn',
    name: 'Tamil Nadu',
    hindiName: 'तमिलनाडु',
    code: 'TN',
    cities: [
      createCityData('tn', 'Tamil Nadu', 'chennai', 'Chennai', 'चेन्नई (मद्रास)', 13.0827, 80.2707, 'Detroit of South Asia • Chennai Central, T. Nagar & CMBT', { baseFare: 15, perKmRate: 3.5 }),
      createCityData('tn', 'Tamil Nadu', 'coimbatore', 'Coimbatore', 'कोयंबटूर', 11.0168, 76.9558, 'Manchester of South India • Gandhipuram, RS Puram & Town Hall'),
      createCityData('tn', 'Tamil Nadu', 'madurai', 'Madurai', 'मदुरै', 9.9252, 78.1198, 'Temple City • Meenakshi Amman Temple, Periyar Bus Stand & Station'),
      createCityData('tn', 'Tamil Nadu', 'tiruchirappalli', 'Tiruchirappalli', 'तिरुचिरापल्ली (त्रिची)', 10.7905, 78.7047, 'Rockfort City • Central Bus Stand to Chathiram & Junction'),
      createCityData('tn', 'Tamil Nadu', 'salem', 'Salem', 'सलेम', 11.6643, 78.1460, 'Steel & Mango Hub • New Bus Stand to Town Railway Station'),
      createCityData('tn', 'Tamil Nadu', 'tirunelveli', 'Tirunelveli', 'तिरुनेलवेली', 8.7139, 77.7567, 'Nellai Halwa Town • Junction to Palayamkottai Market'),
      createCityData('tn', 'Tamil Nadu', 'erode', 'Erode', 'इरोड', 11.3410, 77.7172, 'Turmeric City • Bus Stand to Brough Road'),
      createCityData('tn', 'Tamil Nadu', 'vellore', 'Vellore', 'वेल्लोर', 12.9165, 79.1325, 'Fort & CMC Medical Hub • Katpadi Jn to Bagayam'),
      createCityData('tn', 'Tamil Nadu', 'thanjavur', 'Thanjavur', 'तंजावुर', 10.7870, 79.1378, 'Brihadisvara Big Temple • Old Bus Stand to Medical College')
    ]
  },

  // 9. WEST BENGAL
  {
    id: 'wb',
    name: 'West Bengal',
    hindiName: 'पश्चिम बंगाल',
    code: 'WB',
    cities: [
      createCityData('wb', 'West Bengal', 'kolkata', 'Kolkata', 'कोलकाता (कलकत्ता)', 22.5726, 88.3639, 'City of Joy • Howrah, Sealdah, Esplanade & Park Street', { baseFare: 12, perKmRate: 3.0 }),
      createCityData('wb', 'West Bengal', 'howrah', 'Howrah', 'हावड़ा', 22.5958, 88.2636, 'Grand Rail Terminus • Howrah Bridge, Kadamtala & Nabanna'),
      createCityData('wb', 'West Bengal', 'durgapur', 'Durgapur', 'दुर्गापुर', 23.5204, 87.3119, 'Steel City • City Centre to Durgapur Station & Benachity'),
      createCityData('wb', 'West Bengal', 'asansol', 'Asansol', 'आसनसोल', 23.6739, 86.9524, 'Coal Belt Hub • Asansol Jn to Hutton Road & Court Mor'),
      createCityData('wb', 'West Bengal', 'siliguri', 'Siliguri', 'सिलीगुड़ी', 26.7271, 88.3953, 'Gateway to North East • Sevoke Road to NJP Station & Court Mor'),
      createCityData('wb', 'West Bengal', 'bardhaman', 'Bardhaman', 'बर्दवान (बर्धमान)', 23.2324, 87.8615, 'Curzon Gate to Burdwan Station & Golapbag Campus'),
      createCityData('wb', 'West Bengal', 'kharagpur', 'Kharagpur', 'खड़गपुर', 22.3460, 87.2320, 'Longest Railway Platform & IIT Campus • Golbazar to Station'),
      createCityData('wb', 'West Bengal', 'malda', 'Malda', 'मालदा (इंग्लिश बाजार)', 25.0108, 88.1411, 'Mango & Silk Hub • Rathbari Mor to Malda Town Station')
    ]
  },

  // 10. MADHYA PRADESH
  {
    id: 'mp',
    name: 'Madhya Pradesh',
    hindiName: 'मध्य प्रदेश',
    code: 'MP',
    cities: [
      createCityData('mp', 'Madhya Pradesh', 'bhopal', 'Bhopal', 'भोपाल', 23.2599, 77.4126, 'City of Lakes • Rani Kamlapati, New Market & MP Nagar', { baseFare: 10, perKmRate: 2.5 }),
      createCityData('mp', 'Madhya Pradesh', 'indore', 'Indore', 'इन्दौर', 22.7196, 75.8577, 'Cleanest City of India • Rajwada, Chhappan Dukan & Vijay Nagar', { baseFare: 12, perKmRate: 3.0 }),
      createCityData('mp', 'Madhya Pradesh', 'gwalior', 'Gwalior', 'ग्वालियर', 26.2183, 78.1828, 'Historic Fort & Tansen City • Maharaj Bada, Morar & Station'),
      createCityData('mp', 'Madhya Pradesh', 'jabalpur', 'Jabalpur', 'जबलपुर', 23.1815, 79.9864, 'Bhedaghat Marble Rocks • Civic Centre, Wright Town & Station'),
      createCityData('mp', 'Madhya Pradesh', 'ujjain', 'Ujjain', 'उज्जैन', 23.1765, 75.7885, 'Mahakaleshwar Jyotirlinga • Mahakal Corridor to Dewas Gate'),
      createCityData('mp', 'Madhya Pradesh', 'sagar', 'Sagar', 'सागर', 23.8388, 78.7378, 'Lakha Banjara Lake • Katra Bazaar to Station Road'),
      createCityData('mp', 'Madhya Pradesh', 'dewas', 'Dewas', 'देवास', 22.9676, 76.0534, 'Chamunda Mata Tekri to Station & Industrial Area'),
      createCityData('mp', 'Madhya Pradesh', 'satna', 'Satna', 'सतना', 24.5800, 80.8300, 'Cement City • Station Road to Circuit House Chauraha'),
      createCityData('mp', 'Madhya Pradesh', 'ratlam', 'Ratlam', 'रतलाम', 23.3315, 75.0367, 'Sev & Gold City • Do Batti to Station Circle'),
      createCityData('mp', 'Madhya Pradesh', 'rewa', 'Rewa', 'रीवा', 24.5362, 81.3037, 'White Tiger Land • Shilpi Plaza to College Chauraha')
    ]
  },

  // 11. TELANGANA
  {
    id: 'tg',
    name: 'Telangana',
    hindiName: 'तेलंगाना',
    code: 'TG',
    cities: [
      createCityData('tg', 'Telangana', 'hyderabad', 'Hyderabad', 'हैदराबाद', 17.3850, 78.4867, 'Cyberabad & Biryani Capital • Secunderabad, Hitec City & Charminar', { baseFare: 15, perKmRate: 3.5 }),
      createCityData('tg', 'Telangana', 'warangal', 'Warangal', 'वारंगल', 17.9689, 79.5941, 'Kakatiya Heritage • Kazipet Jn to Thousand Pillar Temple'),
      createCityData('tg', 'Telangana', 'nizamabad', 'Nizamabad', 'निजामाबाद', 18.6725, 78.0941, 'Indur Hub • Railway Station to Gandhi Chowk'),
      createCityData('tg', 'Telangana', 'karimnagar', 'Karimnagar', 'करीमनगर', 18.4386, 79.1288, 'Granite City • Bus Station to Tower Circle'),
      createCityData('tg', 'Telangana', 'khammam', 'Khammam', 'खम्मम', 17.2473, 80.1514, 'Fort City • Wyra Road to Station Chowk'),
      createCityData('tg', 'Telangana', 'ramagundam', 'Ramagundam', 'रामागुंडम', 18.7557, 79.5130, 'Power City • NTPC Gate to Godavarikhani Market')
    ]
  },

  // 12. ANDHRA PRADESH
  {
    id: 'ap',
    name: 'Andhra Pradesh',
    hindiName: 'आंध्र प्रदेश',
    code: 'AP',
    cities: [
      createCityData('ap', 'Andhra Pradesh', 'visakhapatnam', 'Visakhapatnam', 'विशाखापट्टनम (वाइज़ाग)', 17.6868, 83.2185, 'City of Destiny • RTC Complex, Jagadamba & RK Beach', { baseFare: 12, perKmRate: 3.0 }),
      createCityData('ap', 'Andhra Pradesh', 'vijayawada', 'Vijayawada', 'विजयवाड़ा', 16.5062, 80.6480, 'Kanaka Durga City • Vijayawada Jn to Benz Circle & MG Road'),
      createCityData('ap', 'Andhra Pradesh', 'guntur', 'Guntur', 'गुंटूर', 16.3067, 80.4365, 'Chilli Capital • Market Yard to Brodipet & Station'),
      createCityData('ap', 'Andhra Pradesh', 'tirupati', 'Tirupati', 'तिरुपति', 13.6288, 79.4192, 'Spiritual Capital • Tirupati Central to Alipiri & Bus Stand'),
      createCityData('ap', 'Andhra Pradesh', 'kurnool', 'Kurnool', 'कर्नूल', 15.8281, 78.0373, 'Konda Reddy Buruju to Station Road & C-Camp'),
      createCityData('ap', 'Andhra Pradesh', 'nellore', 'Nellore', 'नेल्लोर', 14.4426, 79.9865, 'Simhapuri • VR Complex to Station Road'),
      createCityData('ap', 'Andhra Pradesh', 'rajahmundry', 'Rajahmundry', 'राजमुंदरी', 17.0005, 81.8040, 'Godavari Cultural Hub • Kotipalli Bus Stand to Pushkar Ghat'),
      createCityData('ap', 'Andhra Pradesh', 'kakinada', 'Kakinada', 'काकीनाडा', 16.9891, 82.2475, 'Smart Port City • Bhanugudi Junction to Main Road')
    ]
  },

  // 13. PUNJAB
  {
    id: 'pb',
    name: 'Punjab',
    hindiName: 'पंजाब',
    code: 'PB',
    cities: [
      createCityData('pb', 'Punjab', 'ludhiana', 'Ludhiana', 'लुधियाना', 30.9010, 75.8573, 'Manchester of India • Clock Tower, Chaura Bazaar & Model Town', { baseFare: 12, perKmRate: 3.0 }),
      createCityData('pb', 'Punjab', 'amritsar', 'Amritsar', 'अमृतसर', 31.6340, 74.8723, 'Holy Golden Temple City • Heritage Street, Hall Bazaar & Station', { baseFare: 12, perKmRate: 3.0 }),
      createCityData('pb', 'Punjab', 'jalandhar', 'Jalandhar', 'जालंधर', 31.3260, 75.5762, 'Sports Goods Hub • Model Town, BMC Chowk & Jyoti Chowk'),
      createCityData('pb', 'Punjab', 'patiala', 'Patiala', 'पटियाला', 30.3398, 76.3869, 'Royal Heritage • Qila Mubarak, Leela Bhawan & Bus Stand'),
      createCityData('pb', 'Punjab', 'bathinda', 'Bathinda', 'बठिंडा', 30.2110, 74.9455, 'Thermal & Lakes Hub • Dhobi Bazaar to Station Circle'),
      createCityData('pb', 'Punjab', 'mohali', 'Mohali (SAS Nagar)', 'मोहाली (एसएएस नगर)', 30.7046, 76.7179, 'PCA Stadium to Phase 7 Market & Airport Road'),
      createCityData('pb', 'Punjab', 'pathankot', 'Pathankot', 'पठानकोट', 32.2684, 75.6529, 'Jammu-Kashmir Junction • Cantt Station to Dhangu Road')
    ]
  },

  // 14. HARYANA
  {
    id: 'hr',
    name: 'Haryana',
    hindiName: 'हरियाणा',
    code: 'HR',
    cities: [
      createCityData('hr', 'Haryana', 'gurugram', 'Gurugram', 'गुरुग्राम (गुड़गांव)', 28.4595, 77.0266, 'Millennium Cyber City • Cyber Hub, IFFCO Chowk & Huda City Centre', { baseFare: 15, perKmRate: 3.5 }),
      createCityData('hr', 'Haryana', 'faridabad', 'Faridabad', 'फरीदाबाद', 28.4089, 77.3178, 'Industrial Giant • Neelam Chowk, Bata Flyover & Ballabgarh'),
      createCityData('hr', 'Haryana', 'panipat', 'Panipat', 'पानीपत', 29.3909, 76.9635, 'Textile City • Sanjay Chowk to GT Road & Station'),
      createCityData('hr', 'Haryana', 'ambala', 'Ambala', 'अंबाला', 30.3782, 76.7767, 'Cloth Market & Rail Hub • Ambala Cantt Jn to Sadar Bazaar'),
      createCityData('hr', 'Haryana', 'rohtak', 'Rohtak', 'रोहतक', 28.8955, 76.6066, 'Education City • Mansarovar Park to Station & PGIMS'),
      createCityData('hr', 'Haryana', 'hisar', 'Hisar', 'हिसार', 29.1492, 75.7217, 'Steel City • Nagori Gate to Station Road'),
      createCityData('hr', 'Haryana', 'karnal', 'Karnal', 'करनाल', 29.6857, 76.9905, 'Rice City • Liberty Chowk to Sector 12 Market'),
      createCityData('hr', 'Haryana', 'sonipat', 'Sonipat', 'सोनीपत', 28.9931, 77.0151, 'Education City • Subhash Chowk to Murthal Road')
    ]
  },

  // 15. KERALA
  {
    id: 'kl',
    name: 'Kerala',
    hindiName: 'केरल',
    code: 'KL',
    cities: [
      createCityData('kl', 'Kerala', 'thiruvananthapuram', 'Thiruvananthapuram', 'तिरुवनंतपुरम (त्रिवेंद्रम)', 8.5241, 76.9366, 'Capital City • East Fort (Padmanabhaswamy), Thampanoor & Palayam', { baseFare: 15, perKmRate: 3.0 }),
      createCityData('kl', 'Kerala', 'kochi', 'Kochi', 'कोच्चि (कोचीन)', 9.9312, 76.2673, 'Queen of Arabian Sea • MG Road, Marine Drive & Vyttila Hub', { baseFare: 15, perKmRate: 3.5 }),
      createCityData('kl', 'Kerala', 'kozhikode', 'Kozhikode', 'कोझिकोड (कालिकट)', 11.2588, 75.7804, 'Culinary Capital • SM Street (Sweet Meat), Mananchira & Station'),
      createCityData('kl', 'Kerala', 'thrissur', 'Thrissur', 'त्रिशूर', 10.5276, 76.2144, 'Cultural Capital • Thekkinkadu Maidan (Swaraj Round) & Station'),
      createCityData('kl', 'Kerala', 'kollam', 'Kollam', 'कोल्लम', 8.8932, 76.6141, 'Cashew Hub & Ashtamudi Lake • Chinnakada Clock Tower to Station'),
      createCityData('kl', 'Kerala', 'kannur', 'Kannur', 'कन्नूर', 11.8745, 75.3704, 'Theyyam Land • Caltex Junction to Fort Road'),
      createCityData('kl', 'Kerala', 'alappuzha', 'Alappuzha', 'अलप्पुझा (अलेप्पी)', 9.4981, 76.3388, 'Venice of the East • Boat Jetty to Beach Road')
    ]
  },

  // 16. ODISHA
  {
    id: 'od',
    name: 'Odisha',
    hindiName: 'ओडिशा',
    code: 'OD',
    cities: [
      createCityData('od', 'Odisha', 'bhubaneswar', 'Bhubaneswar', 'भुवनेश्वर', 20.2961, 85.8245, 'Temple City • Master Canteen, Saheed Nagar & Patia Infocity', { baseFare: 12, perKmRate: 2.8 }),
      createCityData('od', 'Odisha', 'cuttack', 'Cuttack', 'कटक', 20.4625, 85.8828, 'Silver City • Badambadi Bus Stand, Choudhury Bazaar & Station'),
      createCityData('od', 'Odisha', 'rourkela', 'Rourkela', 'राउरकेला', 22.2604, 84.8536, 'Steel City • Panposh to Bisra Square & Station'),
      createCityData('od', 'Odisha', 'puri', 'Puri', 'पुरी', 19.8135, 85.8312, 'Lord Jagannath Dham • Grand Road (Bada Danda) to Golden Beach'),
      createCityData('od', 'Odisha', 'sambalpur', 'Sambalpur', 'संबलपुर', 21.4669, 83.9812, 'Hirakud Dam & Handloom Hub • Golebazar to Station'),
      createCityData('od', 'Odisha', 'berhampur', 'Berhampur', 'ब्रह्मपुर', 19.3150, 84.7941, 'Silk City • Old Bus Stand to Gate Bazaar')
    ]
  },

  // 17. JHARKHAND
  {
    id: 'jh',
    name: 'Jharkhand',
    hindiName: 'झारखंड',
    code: 'JH',
    cities: [
      createCityData('jh', 'Jharkhand', 'ranchi', 'Ranchi', 'रांची', 23.3441, 85.3096, 'City of Waterfalls • Albert Ekka Chowk, Main Road & Station', { baseFare: 10, perKmRate: 2.5 }),
      createCityData('jh', 'Jharkhand', 'jamshedpur', 'Jamshedpur', 'जमशेदपुर (टाटानगर)', 22.8046, 86.2029, 'Steel City • Bistupur, Sakchi Market & Tatanagar Jn'),
      createCityData('jh', 'Jharkhand', 'dhanbad', 'Dhanbad', 'धनबाद', 23.7957, 86.4304, 'Coal Capital of India • Bank More to Station Circle & Steel Gate'),
      createCityData('jh', 'Jharkhand', 'bokaro', 'Bokaro Steel City', 'बोकारो स्टील सिटी', 23.6693, 86.1511, 'City Centre (Sector 4) to Bokaro Station'),
      createCityData('jh', 'Jharkhand', 'deoghar', 'Deoghar', 'देवघर', 24.4826, 86.7001, 'Baba Baidyanath Dham • Tower Chowk to Temple Complex'),
      createCityData('jh', 'Jharkhand', 'hazaribagh', 'Hazaribagh', 'हजारीबाग', 23.9960, 85.3644, 'Jhanda Chowk to Korrah Chowk & Bus Stand')
    ]
  },

  // 18. ASSAM
  {
    id: 'as',
    name: 'Assam',
    hindiName: 'असम',
    code: 'AS',
    cities: [
      createCityData('as', 'Assam', 'guwahati', 'Guwahati', 'गुवाहाटी', 26.1445, 91.7362, 'Gateway to North-East • Paltan Bazaar, Fancy Bazaar & Dispur', { baseFare: 12, perKmRate: 3.0 }),
      createCityData('as', 'Assam', 'silchar', 'Silchar', 'सिलचर', 24.8333, 92.7789, 'Barak Valley Hub • Rangirkhari to Station Road'),
      createCityData('as', 'Assam', 'dibrugarh', 'Dibrugarh', 'डिब्रूगढ़', 27.4728, 94.9120, 'Tea City • Thana Chariali to Station'),
      createCityData('as', 'Assam', 'jorhat', 'Jorhat', 'जोरहाट', 26.7509, 94.2037, 'Cultural Capital of Assam • AT Road to Gar-Ali'),
      createCityData('as', 'Assam', 'nagaon', 'Nagaon', 'नगांव', 26.3466, 92.6840, 'Haibargaon to Daccapatty Market'),
      createCityData('as', 'Assam', 'tezpur', 'Tezpur', 'तेजपुर', 26.6528, 92.7926, 'City of Blood • Tribeni to Court Chariali')
    ]
  },

  // 19. CHHATTISGARH
  {
    id: 'cg',
    name: 'Chhattisgarh',
    hindiName: 'छत्तीसगढ़',
    code: 'CG',
    cities: [
      createCityData('cg', 'Chhattisgarh', 'raipur', 'Raipur', 'रायपुर', 21.2514, 81.6296, 'Capital City • Jaistambh Chowk, Telibandha Marine Drive & Station', { baseFare: 10, perKmRate: 2.5 }),
      createCityData('cg', 'Chhattisgarh', 'bilaspur', 'Bilaspur', 'बिलासपुर', 22.0797, 82.1409, 'High Court & Rail Hub • Gol Bazaar to Station Road'),
      createCityData('cg', 'Chhattisgarh', 'bhilai-durg', 'Bhilai-Durg', 'भिलाई-दुर्ग', 21.1938, 81.3509, 'Steel & Education Hub • Civic Centre Bhilai to Durg Station'),
      createCityData('cg', 'Chhattisgarh', 'korba', 'Korba', 'कोरबा', 22.3595, 82.7501, 'Power Hub of India • Transport Nagar to Kosabadi'),
      createCityData('cg', 'Chhattisgarh', 'rajnandgaon', 'Rajnandgaon', 'राजनंदगांव', 21.0974, 81.0366, 'Sanskar Dhani • Manav Mandir Chowk to Station')
    ]
  },

  // 20. UTTARAKHAND
  {
    id: 'uk',
    name: 'Uttarakhand',
    hindiName: 'उत्तराखंड',
    code: 'UK',
    cities: [
      createCityData('uk', 'Uttarakhand', 'dehradun', 'Dehradun', 'देहरादून', 30.3165, 78.0322, 'Doon Valley • Clock Tower, Paltan Bazaar & Rajpur Road', { baseFare: 12, perKmRate: 3.0 }),
      createCityData('uk', 'Uttarakhand', 'haridwar', 'Haridwar', 'हरिद्वार', 29.9457, 78.1642, 'Har Ki Pauri & Ganga Ghat • Haridwar Jn to Maya Devi Temple'),
      createCityData('uk', 'Uttarakhand', 'rishikesh', 'Rishikesh', 'ऋषिकेश', 30.0869, 78.2676, 'Yoga Capital of the World • Ram Jhula, Laxman Jhula & Triveni Ghat'),
      createCityData('uk', 'Uttarakhand', 'haldwani', 'Haldwani', 'हल्द्वानी (नैनीताल प्रवेश)', 29.2183, 79.5130, 'Gateway to Kumaon • Tikonia Chauraha to Bareilly-Nainital Road'),
      createCityData('uk', 'Uttarakhand', 'roorkee', 'Roorkee', 'रुड़की', 29.8543, 77.8880, 'IIT Engineering Hub • Civil Lines to Canal Road'),
      createCityData('uk', 'Uttarakhand', 'rudrapur', 'Rudrapur', 'रुद्रपुर', 28.9800, 79.4000, 'Industrial SIDCUL Hub • Main Market to Kichha Road'),
      createCityData('uk', 'Uttarakhand', 'nainital', 'Nainital', 'नैनीताल', 29.3919, 79.4542, 'Lake District • Mallital to Tallital Promenade')
    ]
  },

  // 21. HIMACHAL PRADESH
  {
    id: 'hp',
    name: 'Himachal Pradesh',
    hindiName: 'हिमाचल प्रदेश',
    code: 'HP',
    cities: [
      createCityData('hp', 'Himachal Pradesh', 'shimla', 'Shimla', 'शिमला', 31.1048, 77.1734, 'Queen of Hills • The Ridge, Mall Road & Old Bus Stand', { baseFare: 15, perKmRate: 3.5 }),
      createCityData('hp', 'Himachal Pradesh', 'dharamshala', 'Dharamshala', 'धर्मशाला (मैकलोडगंज)', 32.2190, 76.3234, 'Kotwali Bazaar to McLeod Ganj & Cricket Stadium'),
      createCityData('hp', 'Himachal Pradesh', 'solan', 'Solan', 'सोलन', 30.9045, 77.0967, 'Mushroom City • Mall Road to Old Bus Stand'),
      createCityData('hp', 'Himachal Pradesh', 'mandi', 'Mandi', 'मंडी', 31.7087, 76.9320, 'Choti Kashi • Indira Market to Victoria Bridge'),
      createCityData('hp', 'Himachal Pradesh', 'kullu-manali', 'Kullu-Manali', 'कुल्लू-मनाली', 31.9579, 77.1095, 'Valley of Gods • Dhalpur Ground to Mall Road Manali')
    ]
  },

  // 22. GOA
  {
    id: 'ga',
    name: 'Goa',
    hindiName: 'गोवा',
    code: 'GA',
    cities: [
      createCityData('ga', 'Goa', 'panaji', 'Panaji', 'पणजी', 15.4909, 73.8278, 'Capital Promenade • Church Square, Miramar Beach & Patto Plaza', { baseFare: 15, perKmRate: 3.5 }),
      createCityData('ga', 'Goa', 'margao', 'Margao', 'मडगांव', 15.2832, 73.9862, 'Commercial South Goa Hub • Margao Municipal Council to Madgaon Jn'),
      createCityData('ga', 'Goa', 'vasco', 'Vasco da Gama', 'वास्को द गामा', 15.3982, 73.8113, 'Port & Airport City • FL Gomes Road to Baina Beach'),
      createCityData('ga', 'Goa', 'mapusa', 'Mapusa', 'मापुसा', 15.5937, 73.8142, 'Friday Market Hub • Mapusa Bus Stand to Market Circle')
    ]
  },

  // 23. JAMMU & KASHMIR
  {
    id: 'jk',
    name: 'Jammu & Kashmir',
    hindiName: 'जम्मू और कश्मीर',
    code: 'JK',
    cities: [
      createCityData('jk', 'Jammu & Kashmir', 'srinagar', 'Srinagar', 'श्रीनगर', 34.0837, 74.7973, 'Paradise on Earth • Lal Chowk, Dal Lake Boulevard & Dalgate', { baseFare: 15, perKmRate: 3.5 }),
      createCityData('jk', 'Jammu & Kashmir', 'jammu', 'Jammu', 'जम्मू', 32.7266, 74.8570, 'City of Temples • Raghunath Bazaar, Jammu Tawi & Gandhi Nagar'),
      createCityData('jk', 'Jammu & Kashmir', 'katra', 'Katra (Vaishno Devi)', 'कटरा (वैष्णो देवी)', 32.9922, 74.9318, 'Shri Mata Vaishno Devi Base • Katra Railway Station to Banganga Corridor'),
      createCityData('jk', 'Jammu & Kashmir', 'anantnag', 'Anantnag', 'अनंतनाग (इस्लामाबाद)', 33.7311, 75.1487, 'Lal Chowk Anantnag to Janglat Mandi'),
      createCityData('jk', 'Jammu & Kashmir', 'baramulla', 'Baramulla', 'बारामूला', 34.2000, 74.3400, 'Main Bazaar to Old Town & Station')
    ]
  },

  // 24. CHANDIGARH
  {
    id: 'ch',
    name: 'Chandigarh',
    hindiName: 'चंडीगढ़',
    code: 'CH',
    cities: [
      createCityData('ch', 'Chandigarh', 'chandigarh', 'Chandigarh', 'चंडीगढ़', 30.7333, 76.7794, 'City Beautiful • Sector 17 Plaza, Sukhna Lake & Sector 43 ISBT', { baseFare: 15, perKmRate: 3.5 })
    ]
  },

  // 25. LADAKH
  {
    id: 'la',
    name: 'Ladakh',
    hindiName: 'लद्दाख',
    code: 'LA',
    cities: [
      createCityData('la', 'Ladakh', 'leh', 'Leh', 'लेह', 34.1526, 77.5771, 'High Altitude Trans-Himalaya • Leh Main Bazaar to Shanti Stupa', { baseFare: 20, perKmRate: 4.0 }),
      createCityData('la', 'Ladakh', 'kargil', 'Kargil', 'कारगिल', 34.5539, 76.1349, 'Main Market to Suru River Promenade')
    ]
  },

  // 26. PUDUCHERRY
  {
    id: 'py',
    name: 'Puducherry',
    hindiName: 'पुडुचेरी (पांडिचेरी)',
    code: 'PY',
    cities: [
      createCityData('py', 'Puducherry', 'puducherry', 'Puducherry', 'पुडुचेरी', 11.9416, 79.8083, 'French Quarter Promenade • White Town, Goubert Avenue & Rock Beach', { baseFare: 12, perKmRate: 3.0 }),
      createCityData('py', 'Puducherry', 'karaikal', 'Karaikal', 'कराईकल', 10.9254, 79.8380, 'Coastal Port • Ambagarattur to Beach Road')
    ]
  },

  // 27. TRIPURA
  {
    id: 'tr',
    name: 'Tripura',
    hindiName: 'त्रिपुरा',
    code: 'TR',
    cities: [
      createCityData('tr', 'Tripura', 'agartala', 'Agartala', 'अगरतला', 23.8315, 91.2868, 'Ujjayanta Palace & Battala Market • Agartala Station to City Centre'),
      createCityData('tr', 'Tripura', 'dharmanagar', 'Dharmanagar', 'धर्मनगर', 24.3752, 92.1642, 'North Tripura Commercial Hub • Station Road to Market')
    ]
  },

  // 28. MEGHALAYA
  {
    id: 'ml',
    name: 'Meghalaya',
    hindiName: 'मेघालय',
    code: 'ML',
    cities: [
      createCityData('ml', 'Meghalaya', 'shillong', 'Shillong', 'शिलांग', 25.5788, 91.8933, 'Scotland of the East • Police Bazar (PB), Ward’s Lake & Laitumkhrah', { baseFare: 15, perKmRate: 3.5 }),
      createCityData('ml', 'Meghalaya', 'tura', 'Tura', 'तुरा', 25.5144, 90.2033, 'Garo Hills Cultural Capital • Ring Road to Hawakhana')
    ]
  },

  // 29. MANIPUR
  {
    id: 'mn',
    name: 'Manipur',
    hindiName: 'मणिपुर',
    code: 'MN',
    cities: [
      createCityData('mn', 'Manipur', 'imphal', 'Imphal', 'इंफाल', 24.8170, 93.9368, 'Kangla Fort & Ima Keithel (Mother Market) • Thangal Bazar to Palace Gate'),
      createCityData('mn', 'Manipur', 'churachandpur', 'Churachandpur', 'चुराचांदपुर (लामका)', 24.3333, 93.6833, 'Main Market to Tedim Road')
    ]
  },

  // 30. NAGALAND
  {
    id: 'nl',
    name: 'Nagaland',
    hindiName: 'नागालैंड',
    code: 'NL',
    cities: [
      createCityData('nl', 'Nagaland', 'kohima', 'Kohima', 'कोहिमा', 25.6751, 94.1086, 'Capital Ridge • PR Hill, Razhu Point & War Cemetery'),
      createCityData('nl', 'Nagaland', 'dimapur', 'Dimapur', 'दीमापुर', 25.9090, 93.7270, 'Commercial Gateway • Railway Station to Hong Kong Market')
    ]
  },

  // 31. MIZORAM
  {
    id: 'mz',
    name: 'Mizoram',
    hindiName: 'मिजोरम',
    code: 'MZ',
    cities: [
      createCityData('mz', 'Mizoram', 'aizawl', 'Aizawl', 'आइजोल', 23.7271, 92.7176, 'Scenic Hill Capital • Bara Bazar, Zarkawt & Chanmari Promenade', { baseFare: 15, perKmRate: 3.5 }),
      createCityData('mz', 'Mizoram', 'lunglei', 'Lunglei', 'लुंगलेई', 22.8800, 92.7400, 'Southern Commercial Centre • Venglai to Bazar')
    ]
  },

  // 32. ARUNACHAL PRADESH
  {
    id: 'ar',
    name: 'Arunachal Pradesh',
    hindiName: 'अरुणाचल प्रदेश',
    code: 'AR',
    cities: [
      createCityData('ar', 'Arunachal Pradesh', 'itanagar', 'Itanagar', 'ईटानगर', 27.0844, 93.6053, 'Land of Dawn-Lit Mountains • Ganga Market to Civil Secretariat'),
      createCityData('ar', 'Arunachal Pradesh', 'naharlagun', 'Naharlagun', 'नाहरलगुन', 27.1050, 93.6920, 'Railhead of Arunachal • Station to Barapani Market'),
      createCityData('ar', 'Arunachal Pradesh', 'pasighat', 'Pasighat', 'पासीघाट', 28.0667, 95.3333, 'Oldest Town on Siang River • Main Market to Medical Colony')
    ]
  },

  // 33. SIKKIM
  {
    id: 'sk',
    name: 'Sikkim',
    hindiName: 'सिक्किम',
    code: 'SK',
    cities: [
      createCityData('sk', 'Sikkim', 'gangtok', 'Gangtok', 'गंगटोक', 27.3389, 88.6065, 'Himalayan Ridge Promenade • MG Marg, Lal Bazaar & Deorali', { baseFare: 15, perKmRate: 3.5 }),
      createCityData('sk', 'Sikkim', 'namchi', 'Namchi', 'नामची', 27.1667, 88.3500, 'Char Dham Pilgrimage • Central Park to Namchi Bazar')
    ]
  },

  // 34. ANDAMAN & NICOBAR ISLANDS
  {
    id: 'an',
    name: 'Andaman & Nicobar Islands',
    hindiName: 'अंडमान और निकोबार द्वीप समूह',
    code: 'AN',
    cities: [
      createCityData('an', 'Andaman & Nicobar Islands', 'port-blair', 'Port Blair', 'पोर्ट ब्लेयर (श्री विजय पुरम)', 11.6234, 92.7265, 'Cellular Jail & Marina Park • Aberdeen Bazaar to Phoenix Bay Jetty', { baseFare: 15, perKmRate: 3.5 })
    ]
  },

  // 35. DADRA & NAGAR HAVELI AND DAMAN & DIU
  {
    id: 'dn',
    name: 'Dadra & Nagar Haveli and Daman & Diu',
    hindiName: 'दादरा और नगर हवेली और दमन और दीव',
    code: 'DN',
    cities: [
      createCityData('dn', 'Dadra & Nagar Haveli and Daman & Diu', 'daman', 'Daman', 'दमन', 20.3974, 72.8328, 'Coastal Portuguese Forts • Nani Daman to Moti Daman Market'),
      createCityData('dn', 'Dadra & Nagar Haveli and Daman & Diu', 'silvassa', 'Silvassa', 'सिलवासा', 20.2763, 73.0083, 'Tribal & Industrial Hub • Kilvani Road to Station'),
      createCityData('dn', 'Dadra & Nagar Haveli and Daman & Diu', 'diu', 'Diu', 'दीव', 20.7144, 70.9874, 'Historic Island Fortress • Bunder Chowk to Nagoa Beach')
    ]
  },

  // 36. LAKSHADWEEP
  {
    id: 'ld',
    name: 'Lakshadweep',
    hindiName: 'लक्षद्वीप',
    code: 'LD',
    cities: [
      createCityData('ld', 'Lakshadweep', 'kavaratti', 'Kavaratti', 'कवरत्ती', 10.5667, 72.6417, 'Coral Island Capital • Jetty Road to Ujra Mosque & Beach Promenade', { baseFare: 15, perKmRate: 3.5 })
    ]
  }
];

/**
 * Helper to look up a state and city by ID with fallback
 */
export function getCityData(stateId: string, cityId: string): CityData {
  const state = ALL_INDIA_STATES.find(s => s.id === stateId) || ALL_INDIA_STATES[0];
  const city = state.cities.find(c => c.id === cityId) || state.cities[0];
  return city;
}

/**
 * Flat list of all cities across all 36 States & UTs for universal instant search
 */
export const ALL_CITIES_FLAT = ALL_INDIA_STATES.flatMap(state =>
  state.cities.map(city => ({
    ...city,
    stateName: state.name,
    stateCode: state.code
  }))
);
