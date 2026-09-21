export interface PoliceStation {
  id: string;
  name: string;
  hindiName: string;
  cityId: string;
  lat: number;
  lng: number;
  address: string;
  phone: string;
  isMahilaThana?: boolean;
  inChargeTitle?: string;
}

export interface EmergencyHelpline {
  number: string;
  title: string;
  hindiTitle: string;
  description: string;
  badgeColor: string;
  iconName: string;
  actionType: 'call' | 'sms' | 'whatsapp';
}

export const EMERGENCY_HELPLINES: EmergencyHelpline[] = [
  {
    number: '112',
    title: 'UP Police Emergency (Dial 112)',
    hindiTitle: 'डायल 112 (पुलिस आपातकालीन सेवा)',
    description: 'Instant police dispatch vehicle with GPS tracking & 24x7 control room.',
    badgeColor: 'bg-rose-600 text-white',
    iconName: 'ShieldAlert',
    actionType: 'call'
  },
  {
    number: '1090',
    title: 'Women Power Line (WPL 1090)',
    hindiTitle: 'महिला हेल्पलाइन 1090 (वूमेन पावर लाइन)',
    description: 'Dedicated UP state women safety helpline for harassment, stalking & eve-teasing.',
    badgeColor: 'bg-pink-600 text-white',
    iconName: 'HeartHandshake',
    actionType: 'call'
  },
  {
    number: '181',
    title: 'Women Helpline (181)',
    hindiTitle: 'महिला हेल्पलाइन 181 (राष्ट्रीय/राज्य)',
    description: 'Support for women in distress, domestic safety & emergency transit rescue.',
    badgeColor: 'bg-purple-600 text-white',
    iconName: 'PhoneCall',
    actionType: 'call'
  },
  {
    number: '1098',
    title: 'Childline & Minor Helpline (1098)',
    hindiTitle: 'चाइल्डलाइन 1098 (बाल सुरक्षा)',
    description: 'Emergency safety and support for minors, students and girls.',
    badgeColor: 'bg-amber-600 text-white',
    iconName: 'Users',
    actionType: 'call'
  }
];

export const CITY_POLICE_STATIONS: Record<string, PoliceStation[]> = {
  bareilly: [
    {
      id: 'thana-mahila-bareilly',
      name: 'Mahila Police Station Bareilly (Kotwali Campus)',
      hindiName: 'महिला थाना बरेली (कोतवाली परिसर)',
      cityId: 'bareilly',
      lat: 28.3595,
      lng: 79.4168,
      address: 'Near Kotwali, Civil Lines / Chowk Link Road, Bareilly',
      phone: '0581-2550112',
      isMahilaThana: true,
      inChargeTitle: 'SHO Mahila Thana Bareilly'
    },
    {
      id: 'thana-kotwali-bareilly',
      name: 'Thana Kotwali (City Central)',
      hindiName: 'थाना कोतवाली (शहर केंद्र)',
      cityId: 'bareilly',
      lat: 28.3610,
      lng: 79.4180,
      address: 'Main Chowk Road, Kutubkhana, Bareilly',
      phone: '0581-2550100',
      isMahilaThana: false,
      inChargeTitle: 'Kotwali Inspector'
    },
    {
      id: 'thana-premnagar-bareilly',
      name: 'Thana Prem Nagar (DD Puram / Rajendra Nagar)',
      hindiName: 'थाना प्रेमनगर (डीडी पुरम / राजेन्द्र नगर)',
      cityId: 'bareilly',
      lat: 28.3740,
      lng: 79.4310,
      address: 'Near Selection Point Chauraha, DD Puram, Bareilly',
      phone: '0581-2570112',
      isMahilaThana: false,
      inChargeTitle: 'Prem Nagar Inspector'
    },
    {
      id: 'thana-cantt-bareilly',
      name: 'Thana Cantt (Sadar Bazar / Junction Link)',
      hindiName: 'थाना कैंट (सदर बाजार / जंक्शन रोड)',
      cityId: 'bareilly',
      lat: 28.3390,
      lng: 79.4210,
      address: 'Near Cantt Board Office, Bareilly Cantt',
      phone: '0581-2510112',
      isMahilaThana: false,
      inChargeTitle: 'Cantt Inspector'
    },
    {
      id: 'thana-baradari-bareilly',
      name: 'Thana Baradari (Shyamganj / Rubee Chauraha)',
      hindiName: 'थाना बारादरी (श्यामगंज / रूबी चौराहा)',
      cityId: 'bareilly',
      lat: 28.3510,
      lng: 79.4320,
      address: 'Near Shyamganj Sabzi Mandi, Bareilly',
      phone: '0581-2560112',
      isMahilaThana: false,
      inChargeTitle: 'Baradari Inspector'
    },
    {
      id: 'thana-izzatnagar-bareilly',
      name: 'Thana Izzatnagar (IVRI / Mini Bypass Road)',
      hindiName: 'थाना इज्जतनगर (आईवीआरआई / मिनी बाईपास)',
      cityId: 'bareilly',
      lat: 28.3910,
      lng: 79.4280,
      address: 'Nainital Highway, Near Izzatnagar Rly Station, Bareilly',
      phone: '0581-2580112',
      isMahilaThana: false,
      inChargeTitle: 'Izzatnagar Inspector'
    },
    {
      id: 'thana-subhash-nagar-bareilly',
      name: 'Thana Subhash Nagar (Badaun Road)',
      hindiName: 'थाना सुभाष नगर (बदायूं रोड)',
      cityId: 'bareilly',
      lat: 28.3320,
      lng: 79.4050,
      address: 'Near Overbridge, Subhash Nagar, Bareilly',
      phone: '0581-2540112',
      isMahilaThana: false,
      inChargeTitle: 'Subhash Nagar Inspector'
    },
    {
      id: 'thana-qila-bareilly',
      name: 'Thana Qila (Old City / CB Ganj Link)',
      hindiName: 'थाना किला (किला बाजार)',
      cityId: 'bareilly',
      lat: 28.3650,
      lng: 79.4010,
      address: 'Qila Bridge Road, Bareilly',
      phone: '0581-2530112',
      isMahilaThana: false,
      inChargeTitle: 'Qila Inspector'
    }
  ]
};

// Fallback generic police station for any other city
export function getPoliceStationsForCity(cityId: string, cityLat: number = 28.36, cityLng: number = 79.42): PoliceStation[] {
  if (CITY_POLICE_STATIONS[cityId]) {
    return CITY_POLICE_STATIONS[cityId];
  }
  return [
    {
      id: `thana-mahila-${cityId}`,
      name: `City Mahila Police Station & Women Desk`,
      hindiName: `महिला थाना एवं महिला हेल्प डेस्क`,
      cityId,
      lat: cityLat + 0.005,
      lng: cityLng + 0.004,
      address: `SP City Office & Police Lines`,
      phone: '112',
      isMahilaThana: true,
      inChargeTitle: 'Mahila Thana Incharge'
    },
    {
      id: `thana-central-${cityId}`,
      name: `City Kotwali / Central Police Station`,
      hindiName: `शहर कोतवाली / पुलिस कंट्रोल रूम`,
      cityId,
      lat: cityLat - 0.003,
      lng: cityLng - 0.002,
      address: `Main City Market Chowk`,
      phone: '112',
      isMahilaThana: false,
      inChargeTitle: 'Kotwali Station Officer'
    }
  ];
}

// Calculate distance in kilometers using Haversine formula
export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
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

export function findNearestPoliceStation(
  userLat: number,
  userLng: number,
  stations: PoliceStation[]
): { station: PoliceStation; distanceKm: number; distanceMeters: number } | null {
  if (!stations || stations.length === 0) return null;

  let nearest = stations[0];
  let minDistance = calculateDistanceKm(userLat, userLng, nearest.lat, nearest.lng);

  for (let i = 1; i < stations.length; i++) {
    const d = calculateDistanceKm(userLat, userLng, stations[i].lat, stations[i].lng);
    if (d < minDistance) {
      minDistance = d;
      nearest = stations[i];
    }
  }

  return {
    station: nearest,
    distanceKm: minDistance,
    distanceMeters: Math.round(minDistance * 1000)
  };
}
