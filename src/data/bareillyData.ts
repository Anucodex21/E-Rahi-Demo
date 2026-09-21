import { BareillyLocation, ChokeZoneInfo, TrafficReport } from '../types';

export const BAREILLY_LOCATIONS: BareillyLocation[] = [
  {
    id: 'loc-bareilly-jn',
    name: 'Bareilly Junction Railway Station',
    hindiName: 'बरेली जंक्शन रेलवे स्टेशन',
    category: 'railway_station',
    lat: 28.3432,
    lng: 79.4146,
    description: 'Main railway hub. High passenger flow, major e-rickshaw queue spillover on Station Road.',
    isChokeHazard: true,
    erickshawChargingAvailable: true
  },
  {
    id: 'loc-chowk-kutubkhana',
    name: 'Chowk Bazaar & Kutubkhana',
    hindiName: 'चौक बाजार एवं कुतुबखाना',
    category: 'market',
    lat: 28.3582,
    lng: 79.4184,
    description: 'Heritage market area with ultra-narrow galis, heavily congested by unregistered e-rickshaws & handcarts.',
    isChokeHazard: true,
    erickshawChargingAvailable: false
  },
  {
    id: 'loc-koharapeer',
    name: 'Koharapeer Chauraha',
    hindiName: 'कोहाड़ापीर चौराहा',
    category: 'chauraha',
    lat: 28.3734,
    lng: 79.4215,
    description: 'Major intersection connecting Nainital Highway & Old City. Sabzi mandi creates chronic morning/evening jams.',
    isChokeHazard: true,
    erickshawChargingAvailable: true
  },
  {
    id: 'loc-satellite-bus',
    name: 'Satellite Bus Terminal',
    hindiName: 'सैटेलाइट बस स्टैंड',
    category: 'bus_terminal',
    lat: 28.3468,
    lng: 79.4485,
    description: 'Interstate bus depot on Pilibhit bypass road. Massive feeder demand for e-rickshaws.',
    isChokeHazard: true,
    erickshawChargingAvailable: true
  },
  {
    id: 'loc-ayub-khan',
    name: 'Ayub Khan Chauraha (Civil Lines)',
    hindiName: 'अयूब खान चौराहा (सिविल लाइन्स)',
    category: 'chauraha',
    lat: 28.3560,
    lng: 79.4100,
    description: 'Central commercial district, coaching centers and banks. Regulated by Bareilly Traffic Police.',
    isChokeHazard: false,
    erickshawChargingAvailable: true
  },
  {
    id: 'loc-shyamganj',
    name: 'Shyamganj Mandi & Crossing',
    hindiName: 'श्यामगंज गल्ला मंडी एवं रेलवे फाटक',
    category: 'market',
    lat: 28.3526,
    lng: 79.4287,
    description: 'Wholesale grain market with level crossing. Gate closures produce instant 1km queues.',
    isChokeHazard: true,
    erickshawChargingAvailable: false
  },
  {
    id: 'loc-shahamatganj',
    name: 'Shahamatganj Flyover Corridor',
    hindiName: 'शहामतगंज फ्लाईओवर कॉरिडोर',
    category: 'chauraha',
    lat: 28.3610,
    lng: 79.4275,
    description: 'Key elevated bypass corridor allowing e-rickshaws and commuters to avoid inner market gridlocks.',
    isChokeHazard: false,
    erickshawChargingAvailable: true
  },
  {
    id: 'loc-delapeer',
    name: 'Delapeer Chauraha / 100 Ft Road',
    hindiName: 'डेलापीर चौराहा (100 फीट रोड)',
    category: 'chauraha',
    lat: 28.3882,
    lng: 79.4320,
    description: 'North Bareilly junction connecting IVRI, medical college, and Pilibhit highway.',
    isChokeHazard: false,
    erickshawChargingAvailable: true
  },
  {
    id: 'loc-bareilly-city-stn',
    name: 'Bareilly City Railway Station',
    hindiName: 'बरेली सिटी रेलवे स्टेशन',
    category: 'railway_station',
    lat: 28.3688,
    lng: 79.4095,
    description: 'Secondary station serving Purana Shahar and northern residential colonies.',
    isChokeHazard: false,
    erickshawChargingAvailable: false
  },
  {
    id: 'loc-phoenix-mall',
    name: 'Phoenix United Mall (Pilibhit Bypass)',
    hindiName: 'फीनिक्स यूनाइटेड मॉल (बाईपास)',
    category: 'market',
    lat: 28.3810,
    lng: 79.4620,
    description: 'Retail entertainment hub on the bypass with wide lanes and fast vehicle flow.',
    isChokeHazard: false,
    erickshawChargingAvailable: true
  },
  {
    id: 'loc-nakatiya',
    name: 'Nakatiya (Shahjahanpur Road)',
    hindiName: 'नकटिया (शाहजहांपुर रोड)',
    category: 'chauraha',
    lat: 28.3180,
    lng: 79.4450,
    description: 'Southern gateway point on Lucknow highway. Key staging zone for commuter e-rickshaws.',
    isChokeHazard: false,
    erickshawChargingAvailable: true
  },
  {
    id: 'loc-chaupula',
    name: 'Chaupula (Chopla Flyover Junction)',
    hindiName: 'चौपुला (चोपला फ्लाईओव्हर चौराहा)',
    category: 'chauraha',
    lat: 28.3490,
    lng: 79.4020,
    description: 'Crucial flyover node connecting Qila, Bareilly Jn, and Budaun/Delhi arterial roads.',
    isChokeHazard: true,
    erickshawChargingAvailable: true
  },
  {
    id: 'loc-nariyawal',
    name: 'Nariyawal (Industrial Area)',
    hindiName: 'नरियावल (औद्योगिक क्षेत्र)',
    category: 'chauraha',
    lat: 28.3300,
    lng: 79.4900,
    description: 'Eastern transit belt connecting rural and industrial commuter routes towards Bisalpur.',
    isChokeHazard: false,
    erickshawChargingAvailable: true
  },
  {
    id: 'loc-dakkhana',
    name: 'Dakkhana (Head Post Office / Civil Lines)',
    hindiName: 'डाकखाना (प्रधान डाकघर / सिविल लाइन्स)',
    category: 'chauraha',
    lat: 28.3585,
    lng: 79.4120,
    description: 'Core administrative and postal landmark connecting Ayub Khan and Court road.',
    isChokeHazard: false,
    erickshawChargingAvailable: true
  },
  {
    id: 'loc-ssvgi-college',
    name: 'Shri Siddhi Vinayak College (SSVGI)',
    hindiName: 'श्री सिद्धि विनायक कॉलेज (SSVGI)',
    category: 'market',
    lat: 28.4420,
    lng: 79.4450,
    description: 'Major higher education campus on Nainital Highway with heavy student e-rickshaw transit.',
    isChokeHazard: false,
    erickshawChargingAvailable: true
  },
  {
    id: 'loc-izzatnagar',
    name: 'Izzatnagar (Railway Station / IVRI)',
    hindiName: 'इज्जत नगर (रेलवे स्टेशन / IVRI)',
    category: 'railway_station',
    lat: 28.4050,
    lng: 79.4320,
    description: 'North Bareilly railway divisional headquarters and IVRI research campus hub.',
    isChokeHazard: false,
    erickshawChargingAvailable: true
  },
  {
    id: 'loc-kila-bus-stand',
    name: 'Qila / Kila Bus Stand',
    hindiName: 'किला बस स्टैंड (पुराना बस अड्डा)',
    category: 'bus_terminal',
    lat: 28.3620,
    lng: 79.3950,
    description: 'Historic bus and e-rickshaw transit hub serving western Bareilly and Delhi highway.',
    isChokeHazard: true,
    erickshawChargingAvailable: true
  },
  {
    id: 'loc-gandhi-park',
    name: 'Gandhi Park (Civil Lines / Town Hall)',
    hindiName: 'गांधी पार्क (सिविल लाइन्स)',
    category: 'market',
    lat: 28.3550,
    lng: 79.4140,
    description: 'Prominent municipal garden and recreation hub in central Civil Lines.',
    isChokeHazard: false,
    erickshawChargingAvailable: true
  },
  {
    id: 'loc-sanjay-nagar',
    name: 'Sanjay Nagar (Bajrang Nagar Link)',
    hindiName: 'संजय नगर (बजरंग नगर लिंक)',
    category: 'chauraha',
    lat: 28.3750,
    lng: 79.4350,
    description: 'High-density residential colony between Shyamganj, Shahamatganj, and Delhapeer.',
    isChokeHazard: false,
    erickshawChargingAvailable: true
  },
  {
    id: 'loc-mjpru-campus',
    name: 'MJPRU University Campus (Pilibhit Bypass)',
    hindiName: 'MJPRU विश्वविद्यालय (रुहेलखंड कैंपस)',
    category: 'university',
    lat: 28.3730,
    lng: 79.4750,
    description: 'Mahatma Jyotiba Phule Rohilkhand University sprawling campus with heavy student ridership.',
    isChokeHazard: false,
    erickshawChargingAvailable: true
  },
  {
    id: 'loc-rohilkhand-medical',
    name: 'Rohilkhand / Medical College (Pilibhit Bypass)',
    hindiName: 'मेडिकल कॉलेज / रोहिलखंड अस्पताल',
    category: 'hospital',
    lat: 28.3680,
    lng: 79.4920,
    description: 'Major super-speciality medical campus and patient attendant transit corridor.',
    isChokeHazard: false,
    erickshawChargingAvailable: true
  }
];

export const INITIAL_CHOKE_ZONES: ChokeZoneInfo[] = [
  {
    id: 'cz-chowk',
    name: 'Chowk & Kutubkhana Inner Lane',
    hindiName: 'चौक एवं कुतुबखाना संकरी गली',
    congestionScore: 89,
    activeRickshawsEst: 140,
    status: 'Critical Standstill',
    cause: 'Unregistered e-rickshaw queuing + thela encroachment in 12-foot lane',
    lat: 28.3582,
    lng: 79.4184
  },
  {
    id: 'cz-koharapeer',
    name: 'Koharapeer Central Chauraha',
    hindiName: 'कोहाड़ापीर मुख्य चौराहा',
    congestionScore: 78,
    activeRickshawsEst: 95,
    status: 'Heavy Crawl',
    cause: 'Sabzi mandi crowd overflow and unauthorized passenger boarding',
    lat: 28.3734,
    lng: 79.4215
  },
  {
    id: 'cz-station-rd',
    name: 'Bareilly Jn Station Road (Gate 1)',
    hindiName: 'स्टेशन रोड (गेट 1)',
    congestionScore: 92,
    activeRickshawsEst: 180,
    status: 'Critical Standstill',
    cause: 'Simultaneous arrival of 2 express trains, unmetered e-rickshaw congestion',
    lat: 28.3432,
    lng: 79.4146
  },
  {
    id: 'cz-shyamganj',
    name: 'Shyamganj Railway Fatak & Mandi',
    hindiName: 'श्यामगंज रेलवे फाटक',
    congestionScore: 74,
    activeRickshawsEst: 65,
    status: 'Heavy Crawl',
    cause: 'Train shunting gate closure + heavy cargo tractors',
    lat: 28.3526,
    lng: 79.4287
  }
];

export const INITIAL_REPORTS: TrafficReport[] = [
  {
    id: 'rep-1',
    locationName: 'Chowk Bazaar - Kutubkhana Road',
    category: 'erickshaw_gridlock',
    title: 'Over 40 unregistered E-rickshaws blocking cloth market gali',
    description: 'Narrow lane choked near Novelty cut. Handcarts and double-parked e-rickshaws have caused a 35-minute standstill.',
    severity: 'critical',
    coordinates: { lat: 28.3582, lng: 79.4184 },
    upvotes: 28,
    downvotes: 1,
    reportedAt: new Date(Date.now() - 14 * 60 * 1000).toISOString(),
    verifiedByPolice: true,
    userType: 'erickshaw_driver',
    avoidanceTip: 'Detour via Shahamatganj Flyover or Patel Chowk outer lane.'
  },
  {
    id: 'rep-2',
    locationName: 'Koharapeer Chauraha',
    category: 'bottleneck',
    title: 'Sabzi Mandi spillover & illegal U-turns',
    description: 'E-rickshaws picking passengers directly in front of the intersection. Traffic moving at under 4 km/h.',
    severity: 'heavy',
    coordinates: { lat: 28.3734, lng: 79.4215 },
    upvotes: 19,
    downvotes: 2,
    reportedAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    verifiedByPolice: false,
    userType: 'commuter',
    avoidanceTip: 'Use Stadium Road connector to bypass the main crossing.'
  },
  {
    id: 'rep-3',
    locationName: 'Bareilly Junction Railway Station (Gate 1)',
    category: 'festive_rush',
    title: 'Train Arrival Rush (Shramjeevi Express) - Entry Choked',
    description: 'Hundreds of passengers exiting simultaneously. Aggressive queue jumping by e-rickshaw operators at Station Road.',
    severity: 'critical',
    coordinates: { lat: 28.3432, lng: 79.4146 },
    upvotes: 42,
    downvotes: 0,
    reportedAt: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
    verifiedByPolice: true,
    userType: 'commuter',
    avoidanceTip: 'E-rickshaws should pick passengers from designated Gate 2 Subhash Nagar bypass.'
  },
  {
    id: 'rep-4',
    locationName: 'Shyamganj Railway Crossing (Fatak)',
    category: 'railway_crossing',
    title: 'Goods Train Passing - Fatak Closed',
    description: 'Gate shut for railway shunting. Tailback extending up to Old City turn.',
    severity: 'heavy',
    coordinates: { lat: 28.3526, lng: 79.4287 },
    upvotes: 15,
    downvotes: 1,
    reportedAt: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
    verifiedByPolice: false,
    userType: 'erickshaw_driver',
    avoidanceTip: 'Take Pilibhit Road underpass bypass.'
  },
  {
    id: 'rep-5',
    locationName: 'Satellite Bus Stand Outer Ring',
    category: 'bottleneck',
    title: 'Interstate Volvo Buses parked + E-Rickshaw boarding scrum',
    description: 'Severe congestion near highway entry. 2 lanes reduced to 1.',
    severity: 'moderate',
    coordinates: { lat: 28.3468, lng: 79.4485 },
    upvotes: 11,
    downvotes: 0,
    reportedAt: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
    verifiedByPolice: false,
    userType: 'erickshaw_driver',
    avoidanceTip: 'Use service lane along green belt.'
  }
];

export const TRAFFIC_POLICE_NOTICES = [
  {
    id: 'tp-1',
    title: 'E-Rickshaw Color-Code Zoning in Force',
    hindiTitle: 'ई-रिक्शा कलर कोडिंग ज़ोन नियम लागू',
    summary: 'Zone 1 (Blue) allowed on Kutubkhana-Chowk; Zone 2 (Yellow) restricted to Satellite-Delapeer. Violators face impound under Bareilly Traffic Police advisory.',
    badge: 'Mandatory Compliance',
    badgeColor: 'bg-amber-500'
  },
  {
    id: 'tp-2',
    title: 'One-Way Hours on Kutubkhana Underbridge',
    hindiTitle: 'कुतुबखाना अंडरब्रिज वन-वे समय',
    summary: 'Strict one-way traffic towards Novelty Cinema between 4:00 PM and 9:00 PM. All e-rickshaws must divert through Patel Chowk.',
    badge: 'One-Way Restriction',
    badgeColor: 'bg-rose-500'
  },
  {
    id: 'tp-3',
    title: 'Designated E-Rickshaw Pickup Bays at Bareilly Jn',
    hindiTitle: 'बरेली जंक्शन पर निर्धारित पिकअप बे',
    summary: 'Stopping on main Station Road prohibited. Drivers must use designated Bay C behind GRP outpost to prevent passenger jam.',
    badge: 'Station Traffic Rule',
    badgeColor: 'bg-emerald-600'
  }
];

// Calculation helper for generating coordinates between 2 locations avoiding or passing choke points
export function generateRoutePaths(
  origin: BareillyLocation,
  destination: BareillyLocation,
  userMode: 'commuter' | 'driver'
) {
  const isDriver = userMode === 'driver';
  
  // Calculate direct Euclidean distance in km approx
  const dLat = (destination.lat - origin.lat) * 111;
  const dLng = (destination.lng - origin.lng) * 98;
  const directDistanceKm = Math.max(1.2, Math.sqrt(dLat * dLat + dLng * dLng));
  
  // Midpoint
  const midLat = (origin.lat + destination.lat) / 2;
  const midLng = (origin.lng + destination.lng) / 2;

  // Dynamic choke influence: if in Bareilly use Chowk, otherwise calculate realistic inner-city detour
  const isBareilly = Math.abs(midLat - 28.36) < 0.25 && Math.abs(midLng - 79.42) < 0.25;
  const chokeInfluenceLat = isBareilly ? 28.3582 : (midLat + (destination.lng - origin.lng) * 0.08);
  const chokeInfluenceLng = isBareilly ? 79.4184 : (midLng - (destination.lat - origin.lat) * 0.08);
  
  const standardMidLat = midLat * 0.65 + chokeInfluenceLat * 0.35;
  const standardMidLng = midLng * 0.65 + chokeInfluenceLng * 0.35;

  const standardPath: [number, number][] = [
    [origin.lat, origin.lng],
    [
      origin.lat + (standardMidLat - origin.lat) * 0.5 + 0.001,
      origin.lng + (standardMidLng - origin.lng) * 0.5 - 0.001
    ],
    [standardMidLat, standardMidLng],
    [
      standardMidLat + (destination.lat - standardMidLat) * 0.5 - 0.001,
      standardMidLng + (destination.lng - standardMidLng) * 0.5 + 0.001
    ],
    [destination.lat, destination.lng]
  ];

  // Smart Bypass detour skirts around via arterial ring road or flyovers
  const bypassOffsetLat = (destination.lng > origin.lng) ? 0.007 : -0.007;
  const bypassOffsetLng = 0.009;

  const bypassMidLat = midLat + bypassOffsetLat;
  const bypassMidLng = midLng + bypassOffsetLng;

  const bypassPath: [number, number][] = [
    [origin.lat, origin.lng],
    [
      origin.lat + (bypassMidLat - origin.lat) * 0.4 - 0.002,
      origin.lng + (bypassMidLng - origin.lng) * 0.4 + 0.003
    ],
    [bypassMidLat, bypassMidLng],
    [
      bypassMidLat + (destination.lat - bypassMidLat) * 0.6 + 0.002,
      bypassMidLng + (destination.lng - bypassMidLng) * 0.6 + 0.003
    ],
    [destination.lat, destination.lng]
  ];

  const standardDist = parseFloat((directDistanceKm * 1.15).toFixed(1));
  const bypassDist = parseFloat((directDistanceKm * 1.28).toFixed(1));

  // Times in minutes: inner city crawl is ~6-8 km/h due to e-rickshaw deadlocks, bypass is 18-22 km/h
  const chokedDuration = Math.round(standardDist * 7.5) + 12; // extra 12 min deadlock penalty
  const bypassDuration = Math.max(8, Math.round(bypassDist * 3.2));
  const timeSaved = Math.max(6, chokedDuration - bypassDuration);

  const smartDetourOption: import('../types').RouteOption = {
    id: 'route-smart-bypass',
    name: isDriver ? '🛺 Smart E-Rickshaw Arterial Bypass' : '✨ Route-Smart Chokepoint Bypass',
    tagline: 'Avoids Kutubkhana & Chowk deadlock, saves battery and travel time',
    distanceKm: bypassDist,
    durationMin: bypassDuration,
    chokedDurationMin: chokedDuration,
    timeSavedMin: timeSaved,
    isRecommended: true,
    isBypass: true,
    congestionLevel: 'low',
    pathPoints: bypassPath,
    stepInstructions: isBareilly ? [
      `Depart from ${origin.name}`,
      `Take Shahamatganj Elevated Corridor / Civil Lines Link Road`,
      `Bypass congested Koharapeer Sabzi Mandi cut via Stadium Road bypass`,
      `Merge smoothly towards ${destination.name} with free-flowing traffic`
    ] : [
      `Depart from ${origin.name}`,
      `Take arterial bypass road avoiding inner market bottlenecks`,
      `Maintain 18-22 km/h smooth speed on the wide outer lane`,
      `Arrive at ${destination.name} saving ~${timeSaved} minutes`
    ],
    avoidedChokepoints: isBareilly ? ['Chowk Narrow Gali Jam', 'Koharapeer Sabzi Chauraha', 'Kutubkhana Base'] : ['Inner City Market Chokepoints', 'Central Junction Jam'],
    rickshawSuitability: 'optimal'
  };

  const standardChokedOption: import('../types').RouteOption = {
    id: 'route-standard-choked',
    name: 'Standard Direct Market Path (High Jam)',
    tagline: 'Direct path through dense market streets with heavy unregistered rickshaw gridlocks',
    distanceKm: standardDist,
    durationMin: chokedDuration,
    chokedDurationMin: chokedDuration,
    timeSavedMin: 0,
    isRecommended: false,
    isBypass: false,
    congestionLevel: 'deadlock',
    pathPoints: standardPath,
    stepInstructions: isBareilly ? [
      `Depart from ${origin.name}`,
      `Enter Kutubkhana Inner Bazaar (avg speed ~3.8 km/h)`,
      `Heavy bottleneck at Chowk cloth market turn with stopped e-rickshaws`,
      `Arrive at ${destination.name} with ~${timeSaved} min delay`
    ] : [
      `Depart from ${origin.name}`,
      `Enter crowded central market corridor (avg speed ~4 km/h)`,
      `Severe slow-moving bottleneck and double-parked vehicles`,
      `Arrive at ${destination.name} with ~${timeSaved} min delay`
    ],
    avoidedChokepoints: [],
    rickshawSuitability: 'restricted'
  };

  return [smartDetourOption, standardChokedOption];
}
