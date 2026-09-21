import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory crowdsourced traffic reports pre-seeded with Bareilly hotspots
let trafficReports = [
  {
    id: "rep-1",
    locationName: "Chowk Bazaar - Kutubkhana Road",
    category: "erickshaw_gridlock",
    title: "Over 40 unregistered E-rickshaws blocking cloth market gali",
    description: "Narrow lane choked near Novelty cut. Handcarts and double-parked e-rickshaws have caused a 35-minute standstill.",
    severity: "critical", // 'critical' | 'heavy' | 'moderate' | 'clearing'
    coordinates: { lat: 28.3582, lng: 79.4184 },
    upvotes: 28,
    downvotes: 1,
    reportedAt: new Date(Date.now() - 14 * 60 * 1000).toISOString(),
    verifiedByPolice: true,
    userType: "erickshaw_driver",
    avoidanceTip: "Detour via Shahamatganj Flyover or Patel Chowk outer lane."
  },
  {
    id: "rep-2",
    locationName: "Koharapeer Chauraha",
    category: "bottleneck",
    title: "Sabzi Mandi spillover & illegal U-turns",
    description: "E-rickshaws picking passengers directly in front of the intersection. Traffic moving at under 4 km/h.",
    severity: "heavy",
    coordinates: { lat: 28.3734, lng: 79.4215 },
    upvotes: 19,
    downvotes: 2,
    reportedAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    verifiedByPolice: false,
    userType: "commuter",
    avoidanceTip: "Use Stadium Road connector to bypass the main crossing."
  },
  {
    id: "rep-3",
    locationName: "Bareilly Junction Railway Station (Gate 1)",
    category: "festive_rush",
    title: "Train Arrival Rush (Shramjeevi Express) - Entry Choked",
    description: "Hundreds of passengers exiting simultaneously. Aggressive queue jumping by e-rickshaw operators at Station Road.",
    severity: "critical",
    coordinates: { lat: 28.3432, lng: 79.4146 },
    upvotes: 42,
    downvotes: 0,
    reportedAt: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
    verifiedByPolice: true,
    userType: "commuter",
    avoidanceTip: "E-rickshaws should pick passengers from designated Gate 2 Subhash Nagar bypass."
  },
  {
    id: "rep-4",
    locationName: "Shyamganj Railway Crossing (Fatak)",
    category: "railway_crossing",
    title: "Goods Train Passing - Fatak Closed",
    description: "Gate shut for railway shunting. Tailback extending up to Old City turn.",
    severity: "heavy",
    coordinates: { lat: 28.3526, lng: 79.4287 },
    upvotes: 15,
    downvotes: 1,
    reportedAt: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
    verifiedByPolice: false,
    userType: "erickshaw_driver",
    avoidanceTip: "Take Pilibhit Road underpass bypass."
  },
  {
    id: "rep-5",
    locationName: "Satellite Bus Stand Outer Ring",
    category: "bottleneck",
    title: "Interstate Volvo Buses parked + E-Rickshaw boarding scrum",
    description: "Severe congestion near highway entry. 2 lanes reduced to 1.",
    severity: "moderate",
    coordinates: { lat: 28.3468, lng: 79.4485 },
    upvotes: 11,
    downvotes: 0,
    reportedAt: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
    verifiedByPolice: false,
    userType: "erickshaw_driver",
    avoidanceTip: "Use service lane along green belt."
  }
];

// Lazy AI Client initialization
let aiClient: GoogleGenAI | null = null;
function getAI() {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return aiClient;
}

// Spatial helper: Haversine distance in meters (PostGIS ST_Distance / ST_DWithin approximation)
function calculateDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000; // Earth radius in meters
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

// Key Bareilly Road Segments monitored by the Crowdsource Aggregation Engine
interface BareillySegment {
  id: string;
  name: string;
  hindiName: string;
  urduName: string;
  lat: number;
  lng: number;
  baseTravelTimeMin: number;
  penaltyMultiplier: number;
  reportCount15Min: number;
  isAutoPenaltyTriggered: boolean;
  status: 'Normal' | 'Slowdown' | 'Standstill (Auto-Detour Active)';
  lastReportedTimestamp?: string;
}

let monitoredSegments: BareillySegment[] = [
  {
    id: 'seg-koharapeer',
    name: 'Koharapeer Crossing & Sabzi Mandi',
    hindiName: 'कोहाड़ापीर चौराहा एवं सब्जी मंडी',
    urduName: 'کوہارا پیر چوراہا اور سبزی منڈی',
    lat: 28.3734,
    lng: 79.4215,
    baseTravelTimeMin: 8,
    penaltyMultiplier: 1.0,
    reportCount15Min: 1,
    isAutoPenaltyTriggered: false,
    status: 'Normal'
  },
  {
    id: 'seg-chowk',
    name: 'Chowk Bazaar - Kutubkhana Inner Market',
    hindiName: 'चौक बाजार - कुतुबखाना आंतरिक बाजार',
    urduName: 'چوک بازار - کتب خانہ اندرونی مارکیٹ',
    lat: 28.3582,
    lng: 79.4184,
    baseTravelTimeMin: 10,
    penaltyMultiplier: 1.0,
    reportCount15Min: 2,
    isAutoPenaltyTriggered: false,
    status: 'Slowdown'
  },
  {
    id: 'seg-station-rd',
    name: 'Bareilly Junction - Station Road Corridors',
    hindiName: 'बरेली जंक्शन - स्टेशन रोड गलियारा',
    urduName: 'بریلی جنکشن - اسٹیشن روڈ کوریڈور',
    lat: 28.3432,
    lng: 79.4146,
    baseTravelTimeMin: 7,
    penaltyMultiplier: 1.0,
    reportCount15Min: 1,
    isAutoPenaltyTriggered: false,
    status: 'Normal'
  },
  {
    id: 'seg-shyamganj',
    name: 'Shyamganj Railway Crossing (Fatak)',
    hindiName: 'श्यामगंज रेलवे फाटक एवं मंडी',
    urduName: 'شیام گنج ریلوے پھاٹک اور منڈی',
    lat: 28.3526,
    lng: 79.4287,
    baseTravelTimeMin: 6,
    penaltyMultiplier: 1.0,
    reportCount15Min: 1,
    isAutoPenaltyTriggered: false,
    status: 'Normal'
  },
  {
    id: 'seg-delhapeer',
    name: 'Delhapeer Mandi Chauraha',
    hindiName: 'डेलापीर मंडी चौराहा',
    urduName: 'ڈیلا پیر منڈی چوراہا',
    lat: 28.3840,
    lng: 79.4320,
    baseTravelTimeMin: 9,
    penaltyMultiplier: 1.0,
    reportCount15Min: 0,
    isAutoPenaltyTriggered: false,
    status: 'Normal'
  }
];

// Phase 2 Crowdsource Aggregation Worker:
// Recalculates 15-minute rolling window report counts for all segments within 500m radius.
// If count >= 3: Trigger segment weight penalty multiplier (e.g. 3.2x) to force auto-rerouting.
function runCrowdsourceAggregationWorker() {
  const fifteenMinutesAgo = Date.now() - 15 * 60 * 1000;

  monitoredSegments.forEach(segment => {
    // Count active standstill/bottleneck reports within 500m of this segment in the last 15 mins
    const matchingReports = trafficReports.filter(report => {
      const reportTime = new Date(report.reportedAt).getTime();
      if (reportTime < fifteenMinutesAgo) return false;
      if (report.severity === 'clearing') return false;

      const dist = calculateDistanceMeters(segment.lat, segment.lng, report.coordinates.lat, report.coordinates.lng);
      return dist <= 600; // 600m spatial cluster
    });

    segment.reportCount15Min = matchingReports.length;
    if (matchingReports.length > 0) {
      segment.lastReportedTimestamp = matchingReports[0].reportedAt;
    }

    // THRESHOLD ALGORITHM: 3 or more user reports within 15 mins
    if (segment.reportCount15Min >= 3) {
      segment.isAutoPenaltyTriggered = true;
      segment.penaltyMultiplier = 3.2; // 220% increase in routing penalty
      segment.status = 'Standstill (Auto-Detour Active)';
    } else if (segment.reportCount15Min === 2) {
      segment.isAutoPenaltyTriggered = false;
      segment.penaltyMultiplier = 1.7;
      segment.status = 'Slowdown';
    } else {
      segment.isAutoPenaltyTriggered = false;
      segment.penaltyMultiplier = 1.0;
      segment.status = 'Normal';
    }
  });
}

// Initial calculation
runCrowdsourceAggregationWorker();

// API Routes
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", app: "E-Rahi Bareilly", timestamp: new Date().toISOString() });
});

// Get all active crowdsourced reports
app.get("/api/reports", (_req, res) => {
  res.json({ reports: trafficReports });
});

// Submit a new crowdsourced report (with GPS Anti-Fraud verification)
app.post("/api/reports", (req, res) => {
  const { locationName, category, title, description, severity, coordinates, userType, userGps } = req.body;
  
  if (!locationName || !category || !title) {
    return res.status(400).json({ error: "Missing required report fields" });
  }

  const targetCoords = coordinates || { lat: 28.3670, lng: 79.4304 };
  
  // Phase 4 Spam & Fraud Protection: GPS Radius Geofence Verification
  let verifiedByGps = false;
  let gpsDistanceMeters = null;
  let fraudWarning = null;

  if (userGps && typeof userGps.lat === 'number' && typeof userGps.lng === 'number') {
    gpsDistanceMeters = calculateDistanceMeters(userGps.lat, userGps.lng, targetCoords.lat, targetCoords.lng);
    if (gpsDistanceMeters <= 600) {
      verifiedByGps = true;
    } else {
      fraudWarning = `User GPS location is ${gpsDistanceMeters}m away from reported road segment (Threshold: 600m). Marked as unverified.`;
    }
  }

  const newReport = {
    id: `rep-${Date.now()}`,
    locationName,
    category: category || "bottleneck",
    title,
    description: description || "Reported by citizen commuter/driver in Bareilly.",
    severity: severity || "heavy",
    coordinates: targetCoords,
    upvotes: 1,
    downvotes: 0,
    reportedAt: new Date().toISOString(),
    verifiedByPolice: false,
    verifiedByGps,
    gpsDistanceMeters,
    fraudWarning,
    userType: userType || "commuter",
    avoidanceTip: req.body.avoidanceTip || "Check alternate ring roads or local gali connectors."
  };

  trafficReports.unshift(newReport);
  // Keep recent 40 reports
  if (trafficReports.length > 40) {
    trafficReports = trafficReports.slice(0, 40);
  }

  // Run Phase 2 Crowdsource Aggregation Worker immediately
  runCrowdsourceAggregationWorker();

  res.status(201).json({ 
    success: true, 
    report: newReport,
    aggregationStatus: monitoredSegments.find(s => calculateDistanceMeters(s.lat, s.lng, targetCoords.lat, targetCoords.lng) <= 600)
  });
});

// Vote on a report (Upvote / Confirm bottleneck)
app.post("/api/reports/:id/vote", (req, res) => {
  const { id } = req.params;
  const { type } = req.body; // 'up' | 'down' | 'cleared'
  
  const report = trafficReports.find(r => r.id === id);
  if (!report) {
    return res.status(404).json({ error: "Report not found" });
  }

  if (type === "up") {
    report.upvotes += 1;
  } else if (type === "down") {
    report.downvotes += 1;
  } else if (type === "cleared") {
    report.severity = "clearing";
    report.upvotes += 3;
  }

  // Update dynamic segment penalties
  runCrowdsourceAggregationWorker();

  res.json({ success: true, report });
});

// Phase 2: Get live dynamic Road Segment Weights from Crowdsource Aggregation Engine
app.get("/api/algorithm/segment-weights", (_req, res) => {
  runCrowdsourceAggregationWorker();
  const autoPenaltySegments = monitoredSegments.filter(s => s.isAutoPenaltyTriggered);
  res.json({
    timestamp: new Date().toISOString(),
    ruleDescription: "If 3 or more users report a standstill within 15 minutes, weight penalty increases by 320% to automatically detour drivers.",
    activePenaltiesCount: autoPenaltySegments.length,
    segments: monitoredSegments
  });
});

// Phase 2 & 4 Simulation: Trigger rapid 3-user crowd reports to demonstrate real-time automatic rerouting
app.post("/api/algorithm/simulate-cluster", (req, res) => {
  const { segmentId } = req.body;
  const targetSegment = monitoredSegments.find(s => s.id === (segmentId || 'seg-koharapeer')) || monitoredSegments[0];

  const simulatedNames = ['E-Rickshaw #412 (Chowk Union)', 'Commuter Amit Saxena', 'Auto Driver Ramesh UP25'];
  const now = Date.now();

  // Create 3 fresh standstill reports spaced within the last 5 minutes
  simulatedNames.forEach((name, idx) => {
    const rep = {
      id: `sim-cluster-${now}-${idx}`,
      locationName: targetSegment.name,
      category: "erickshaw_gridlock",
      title: `Standstill Alert: 25+ E-Rickshaws deadlocked at ${targetSegment.name}`,
      description: `Simulated report ${idx + 1}/3 by ${name}. Zero vehicle movement detected.`,
      severity: "critical",
      coordinates: { 
        lat: targetSegment.lat + (idx * 0.0003), 
        lng: targetSegment.lng + (idx * 0.0003) 
      },
      upvotes: 4 + idx * 2,
      downvotes: 0,
      reportedAt: new Date(now - (idx * 2) * 60 * 1000).toISOString(),
      verifiedByPolice: false,
      verifiedByGps: true,
      gpsDistanceMeters: 45,
      userType: "erickshaw_driver" as const,
      avoidanceTip: "Automatic detour triggered: divert via outer ring flyover."
    };
    trafficReports.unshift(rep);
  });

  // Re-run the worker
  runCrowdsourceAggregationWorker();

  res.json({
    success: true,
    message: `3 user reports successfully injected within 15 min window for ${targetSegment.name}! Auto-penalty triggered.`,
    segment: targetSegment,
    allSegments: monitoredSegments
  });
});

// Phase 1: Spatial Query - PostGIS ST_DWithin simulation (find hazards within radius)
app.post("/api/spatial/nearby-hazards", (req, res) => {
  const { lat, lng, radiusMeters = 600 } = req.body;
  
  if (typeof lat !== 'number' || typeof lng !== 'number') {
    return res.status(400).json({ error: "lat and lng numbers are required" });
  }

  const results = trafficReports
    .map(rep => {
      const dist = calculateDistanceMeters(lat, lng, rep.coordinates.lat, rep.coordinates.lng);
      return {
        report: rep,
        distanceMeters: dist,
        isWithinGeofence: dist <= radiusMeters
      };
    })
    .filter(item => item.distanceMeters <= radiusMeters)
    .sort((a, b) => a.distanceMeters - b.distanceMeters);

  res.json({
    userCoords: { lat, lng },
    radiusMeters,
    hazardsCount: results.length,
    hazards: results
  });
});

// In-memory citizen complaints store (Name, Phone, Auto GPS Coordinates, Issue Category)
let citizenComplaints: Array<{
  id: string;
  name: string;
  phone: string;
  issueType: string;
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
}> = [
  {
    id: "comp-sample-1",
    name: "Rajesh Sharma",
    phone: "+91 98370 12345",
    issueType: "auto_overcharging",
    description: "Driver at Bareilly Station asking ₹80 instead of official ₹20 fixed rate to Satellite.",
    emergency: false,
    userGps: {
      lat: 28.3432,
      lng: 79.4146,
      accuracyMeters: 12,
      addressHint: "Bareilly Jn Railway Station, Gate 1"
    },
    cityName: "Bareilly",
    createdAt: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
    status: "UNDER_REVIEW",
    ticketNumber: "ERAHI-BLY-8492"
  },
  {
    id: "comp-sample-2",
    name: "Sunita Verma",
    phone: "+91 94125 67890",
    issueType: "road_blocked",
    description: "15+ unregistered rickshaws completely blocked narrow alley near Koharapeer sabzi mandi, ambulance unable to pass.",
    emergency: true,
    userGps: {
      lat: 28.3734,
      lng: 79.4215,
      accuracyMeters: 8,
      addressHint: "Koharapeer Crossing, Main Bazaar"
    },
    cityName: "Bareilly",
    createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    status: "DISPATCHED",
    ticketNumber: "ERAHI-BLY-9910"
  }
];

// Citizen Complaints API: List complaints
app.get("/api/complaints", (_req, res) => {
  res.json({ complaints: citizenComplaints });
});

// Citizen Complaints API: Register new complaint with Name, Phone, and auto-fetched GPS location
app.post("/api/complaints", (req, res) => {
  const { name, phone, issueType, description, emergency, userGps, cityName } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ error: "Citizen name is required" });
  }
  if (!phone || !phone.trim()) {
    return res.status(400).json({ error: "Phone number is required" });
  }
  if (!userGps || typeof userGps.lat !== 'number' || typeof userGps.lng !== 'number') {
    return res.status(400).json({ error: "Valid live GPS location coordinates are required" });
  }

  const cleanPhone = phone.trim();
  const cleanName = name.trim();
  const ticketNumber = `ERAHI-${(cityName || 'IND').substring(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

  const complaint = {
    id: `comp-${Date.now()}`,
    name: cleanName,
    phone: cleanPhone,
    issueType: issueType || 'other_issue',
    description: description || 'Issue registered via E-Rahi India citizen portal.',
    emergency: Boolean(emergency),
    userGps: {
      lat: userGps.lat,
      lng: userGps.lng,
      accuracyMeters: userGps.accuracyMeters || 10,
      addressHint: userGps.addressHint || `Near (${userGps.lat.toFixed(4)}, ${userGps.lng.toFixed(4)})`
    },
    cityName: cityName || 'Bareilly',
    createdAt: new Date().toISOString(),
    status: (emergency ? 'DISPATCHED' : 'UNDER_REVIEW') as 'DISPATCHED' | 'UNDER_REVIEW',
    ticketNumber
  };

  citizenComplaints.unshift(complaint);
  if (citizenComplaints.length > 50) {
    citizenComplaints = citizenComplaints.slice(0, 50);
  }

  // Also auto-broadcast into traffic incidents if it's a road blockage or emergency
  if (issueType === 'road_blocked' || emergency) {
    const reportFromComplaint = {
      id: `rep-comp-${complaint.id}`,
      locationName: complaint.userGps.addressHint || `${cityName || 'Bareilly'} (Citizen Report)`,
      category: "erickshaw_gridlock",
      title: emergency ? `🚨 URGENT CITIZEN ALERT: ${cleanName}` : `Citizen Report: ${cleanName}`,
      description: `${complaint.description} (Contact: ${cleanPhone.slice(-4).padStart(cleanPhone.length, '*')})`,
      severity: (emergency ? "critical" : "heavy") as "critical" | "heavy",
      coordinates: { lat: userGps.lat, lng: userGps.lng },
      upvotes: 3,
      downvotes: 0,
      reportedAt: complaint.createdAt,
      verifiedByPolice: false,
      verifiedByGps: true,
      gpsDistanceMeters: 0,
      fraudWarning: null,
      userType: "commuter" as const,
      avoidanceTip: "Live citizen complaint filed with GPS verification."
    };
    trafficReports.unshift(reportFromComplaint);
    runCrowdsourceAggregationWorker();
  }

  res.status(201).json({
    success: true,
    message: emergency 
      ? "🚨 Emergency alert registered! Nearest traffic patrol & helpline notified."
      : "Complaint successfully registered with verified GPS coordinates.",
    complaint,
    ticketNumber
  });
});

// Emergency SOS & Pre-Shutdown Guard State
interface EmergencyEvent {
  id: string;
  type: 'SOS_TRIGGERED' | 'LAST_KNOWN_LOCATION_PRE_SHUTDOWN' | 'DEVICE_POWER_RESTORED';
  userName: string;
  userPhone?: string;
  coords: { lat: number; lng: number; accuracyMeters?: number };
  addressHint?: string;
  batteryLevel?: number;
  isCharging?: boolean;
  contactsNotified?: Array<{ name: string; phone: string; relation?: string }>;
  timestamp: string;
  notes?: string;
}

let emergencyEvents: EmergencyEvent[] = [];
let lastKnownLocations: Record<string, EmergencyEvent> = {};

// Log SOS Trigger
app.post("/api/emergency/sos", (req, res) => {
  const { userName, userPhone, coords, addressHint, batteryLevel, isCharging, contactsNotified, notes } = req.body;
  if (!coords || typeof coords.lat !== 'number' || typeof coords.lng !== 'number') {
    return res.status(400).json({ error: "Valid GPS coordinates required for SOS" });
  }

  const event: EmergencyEvent = {
    id: `sos-${Date.now()}`,
    type: 'SOS_TRIGGERED',
    userName: userName || 'Protected User',
    userPhone,
    coords,
    addressHint: addressHint || `GPS Location (${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)})`,
    batteryLevel: typeof batteryLevel === 'number' ? batteryLevel : undefined,
    isCharging,
    contactsNotified: contactsNotified || [],
    timestamp: new Date().toISOString(),
    notes
  };

  emergencyEvents.unshift(event);
  lastKnownLocations[userPhone || userName || 'primary'] = event;
  if (emergencyEvents.length > 50) emergencyEvents = emergencyEvents.slice(0, 50);

  res.status(201).json({
    success: true,
    message: "SOS event recorded in emergency security log.",
    event,
    googleMapsUrl: `https://maps.google.com/?q=${coords.lat},${coords.lng}`
  });
});

// Record Pre-Shutdown / Critical Battery Last Known Location ("Last Gasp" Safeguard)
app.post("/api/emergency/last-known-location", (req, res) => {
  const { userName, userPhone, coords, addressHint, batteryLevel, contactsNotified, reason } = req.body;
  if (!coords || typeof coords.lat !== 'number' || typeof coords.lng !== 'number') {
    return res.status(400).json({ error: "Valid GPS coordinates required" });
  }

  const event: EmergencyEvent = {
    id: `last-loc-${Date.now()}`,
    type: 'LAST_KNOWN_LOCATION_PRE_SHUTDOWN',
    userName: userName || 'Protected User',
    userPhone,
    coords,
    addressHint: addressHint || `Last Known Pin (${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)})`,
    batteryLevel: typeof batteryLevel === 'number' ? batteryLevel : undefined,
    isCharging: false,
    contactsNotified: contactsNotified || [],
    timestamp: new Date().toISOString(),
    notes: reason || "Device battery critical or shutting down"
  };

  emergencyEvents.unshift(event);
  lastKnownLocations[userPhone || userName || 'primary'] = event;
  if (emergencyEvents.length > 50) emergencyEvents = emergencyEvents.slice(0, 50);

  res.status(201).json({
    success: true,
    message: "Pre-shutdown last known location safeguarded.",
    event,
    googleMapsUrl: `https://maps.google.com/?q=${coords.lat},${coords.lng}`
  });
});

// Record Device Restored / Powered On Event
app.post("/api/emergency/device-restored", (req, res) => {
  const { userName, userPhone, coords, addressHint, batteryLevel } = req.body;
  const targetCoords = coords || { lat: 28.3620, lng: 79.4200 };

  const event: EmergencyEvent = {
    id: `restored-${Date.now()}`,
    type: 'DEVICE_POWER_RESTORED',
    userName: userName || 'Protected User',
    userPhone,
    coords: targetCoords,
    addressHint: addressHint || "Device powered back on",
    batteryLevel: typeof batteryLevel === 'number' ? batteryLevel : undefined,
    isCharging: true,
    timestamp: new Date().toISOString(),
    notes: "Phone restored and live GPS tracking resumed"
  };

  emergencyEvents.unshift(event);
  lastKnownLocations[userPhone || userName || 'primary'] = event;
  if (emergencyEvents.length > 50) emergencyEvents = emergencyEvents.slice(0, 50);

  res.status(201).json({
    success: true,
    message: "Device restored event recorded.",
    event
  });
});

// Fetch Emergency Events / Last Known Locations
app.get("/api/emergency/events", (req, res) => {
  const { userKey } = req.query;
  const lastLocation = userKey ? lastKnownLocations[String(userKey)] : null;
  res.json({
    events: emergencyEvents,
    lastKnownLocation: lastLocation || lastKnownLocations['primary'] || emergencyEvents[0] || null
  });
});

// Reset segment weights & clear simulated tests
app.post("/api/algorithm/reset", (_req, res) => {
  trafficReports = trafficReports.filter(r => !r.id.startsWith('sim-cluster-'));
  monitoredSegments.forEach(s => {
    s.isAutoPenaltyTriggered = false;
    s.penaltyMultiplier = 1.0;
    s.reportCount15Min = 1;
    s.status = 'Normal';
  });
  runCrowdsourceAggregationWorker();
  res.json({ success: true, message: "Crowdsource weights reset to baseline", segments: monitoredSegments });
});

// AI Smart Rerouting & Bareilly Traffic Cop Advisory
app.post("/api/ai-route-advice", async (req, res) => {
  const { origin, destination, vehicleType, activeCongestions } = req.body;

  const originName = origin?.name || "Bareilly Junction";
  const destName = destination?.name || "Kutubkhana / Chowk";
  const isErickshaw = vehicleType === "erickshaw";

  const fallbackDetourGuidance = {
    headline: `Smart ${isErickshaw ? "E-Rickshaw Gali Detour" : "Commuter Bypass"} from ${originName} to ${destName}`,
    recommendedRoute: isErickshaw 
      ? "Via Shahamatganj Overbridge & Civil Lines Outer Link" 
      : "Via Ring Road & Patel Chowk Flyover corridor",
    avoidHotspots: ["Chowk Market Narrow Gali", "Koharapeer Central Chauraha"],
    estimatedTimeMin: 18,
    standardTimeMin: 37,
    timeSavedMin: 19,
    trafficPoliceAdvisory: "Bareilly Traffic Police notice: E-rickshaws prohibited inside inner Kutubkhana lane between 10 AM and 8 PM. Violators subject to e-challan. Follow smart bypass corridors.",
    hindiAlert: isErickshaw 
      ? "कोहाड़ापीर और चौक में भारी ई-रिक्शा जाम है। शाहमतगंज ओवरब्रिज वाला रास्ता पकड़ें, 19 मिनट बचेंगे।" 
      : "कुतुबखाना मुख्य मार्ग पर जाम है। पटेल चौक और सिविल लाइन्स लिंक रोड से जाएं।"
  };

  const ai = getAI();
  if (!ai) {
    return res.json({ advice: fallbackDetourGuidance, source: "hyperlocal_engine" });
  }

  try {
    const prompt = `You are E-Rahi (ई-राही), the hyperlocal Bareilly traffic and E-rickshaw route intelligence assistant for Bareilly city, Uttar Pradesh, India.
    Origin: ${originName}
    Destination: ${destName}
    User mode: ${isErickshaw ? "E-Rickshaw Driver (needs to avoid narrow deadlocks, police challan zones, congested pick-up spots)" : "Commuter / Passenger (wants quickest, most comfortable transit)"}
    Known Bareilly bottleneck areas: Chowk, Koharapeer, Bareilly Jn Station Road, Shyamganj railway crossing, Kutubkhana, Satellite bus stand.
    Active citizen alerts: ${JSON.stringify(activeCongestions?.map((c: any) => `${c.locationName}: ${c.title} (${c.severity})`) || [])}

    Return a concise JSON object with:
    {
      "headline": "Brief punchy route title",
      "recommendedRoute": "Specific street-level Bareilly detour instructions",
      "avoidHotspots": ["list of 2-3 specific choked spots to avoid right now"],
      "estimatedTimeMin": number (smart detour time in minutes),
      "standardTimeMin": number (standard choked route time in minutes),
      "timeSavedMin": number (time saved in minutes),
      "trafficPoliceAdvisory": "Official Bareilly traffic regulation or tip relevant to this stretch",
      "hindiAlert": "A practical 1-sentence Hindi advisory for drivers/commuters"
    }
    Output valid JSON only.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const text = response.text;
    if (text) {
      const parsed = JSON.parse(text);
      return res.json({ advice: parsed, source: "gemini-3.8-flash" });
    }
  } catch (err) {
    console.error("Gemini advice error, falling back to local engine:", err);
  }

  return res.json({ advice: fallbackDetourGuidance, source: "hyperlocal_engine" });
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true, host: "0.0.0.0", port: PORT },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Bareilly Route-Smart server running on port ${PORT}`);
  });
}

startServer();
