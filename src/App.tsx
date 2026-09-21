import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  BareillyLocation,
  ChokeZoneInfo,
  RouteOption,
  TrafficReport,
  UserMode,
  AIRouteAdvice,
  AppLanguage,
  LiveRideState,
  UserProfile,
} from "./types";
import {
  BAREILLY_LOCATIONS,
  INITIAL_CHOKE_ZONES,
  INITIAL_REPORTS,
  generateRoutePaths,
} from "./data/bareillyData";
import { ALL_INDIA_STATES, getCityData } from "./data/indiaCitiesData";
import { StateCitySelector } from "./components/StateCitySelector";
import { TRANSLATIONS } from "./utils/i18n";
import { BareillyMap } from "./components/BareillyMap";
import { RoutePlanner } from "./components/RoutePlanner";
import { LiveRideDashboard } from "./components/LiveRideDashboard";
import { CrowdsourceModal } from "./components/CrowdsourceModal";
import { ReportsFeed } from "./components/ReportsFeed";
import { ErickshawDriverCockpit } from "./components/ErickshawDriverCockpit";
import { TrafficPoliceAdvisoryBanner } from "./components/TrafficPoliceAdvisoryBanner";
import { ArchitectureRoadmapConsole } from "./components/ArchitectureRoadmapConsole";
import { MobileAppInstallModal } from "./components/MobileAppInstallModal";
import { BareillyFareCalculator } from "./components/BareillyFareCalculator";
import { FestivalPoliceBulletin } from "./components/FestivalPoliceBulletin";
import { CitizenComplaintModal } from "./components/CitizenComplaintModal";
import { WomenSafetyPage } from "./components/WomenSafetyPage";
import { AutoSplashIntro } from "./components/AutoSplashIntro";
import { AutoRunningLoader } from "./components/AutoRunningLoader";
import { AuthModal } from "./components/AuthModal";
import { CityServicesDirectory } from "./components/CityServicesDirectory";
import { PremiumPassModal } from "./components/PremiumPassModal";
import { StorePromotionModal } from "./components/StorePromotionModal";
import { SimpleExplainerModal } from "./components/SimpleExplainerModal";
import { VoiceAssistantModal } from "./components/VoiceAssistantModal";
import { FareSplitterUpiModal } from "./components/FareSplitterUpiModal";
import { EvBatteryRadarModal } from "./components/EvBatteryRadarModal";
import { AutoStandDirectoryModal } from "./components/AutoStandDirectoryModal";
import { OfflinePocketModal } from "./components/OfflinePocketModal";
import {
  SAMPLE_HOSPITALS,
  SAMPLE_HOTELS,
  SAMPLE_COLLEGES,
  SAMPLE_LOCAL_STORES,
} from "./data/cityServicesData";
import {
  HospitalFacility,
  HotelLodge,
  LocalStoreClinic,
  CollegeUniversity,
} from "./types";
import { playHazardWarningChime, triggerHapticBuzz } from "./utils/audioAlerts";
import {
  AlertTriangle,
  MapPin,
  Map as MapIcon,
  Navigation,
  Radio,
  Shield,
  Sparkles,
  Smartphone,
  X,
  Cpu,
  Layers,
  Zap,
  Download,
  Calculator,
  MessageSquareWarning,
  HelpCircle,
  ShieldAlert,
  HeartHandshake,
  ChevronDown,
  User,
  LogIn,
  Play,
  Building2,
  Crown,
  Store,
  GraduationCap,
  BedDouble,
  Mic,
  QrCode,
  BatteryCharging,
  WifiOff,
  Signpost,
} from "lucide-react";

export default function App() {
  // All-India State and City State (Default: Uttar Pradesh > Bareilly)
  const [selectedStateId, setSelectedStateId] = useState<string>("up");
  const [selectedCityId, setSelectedCityId] = useState<string>("bareilly");

  const currentCity = useMemo(() => {
    return getCityData(selectedStateId, selectedCityId);
  }, [selectedStateId, selectedCityId]);

  // Default points: Nakatiya (loc-nakatiya) to Shyamganj (loc-shyamganj)
  const [origin, setOrigin] = useState<BareillyLocation>(() => {
    const initCity = getCityData("up", "bareilly");
    return (
      initCity.locations.find((l) => l.id === initCity.defaultOriginId) ||
      initCity.locations[0]
    );
  });
  const [destination, setDestination] = useState<BareillyLocation>(() => {
    const initCity = getCityData("up", "bareilly");
    return (
      initCity.locations.find((l) => l.id === initCity.defaultDestId) ||
      initCity.locations[1]
    );
  });

  const [userMode, setUserMode] = useState<UserMode>("commuter");
  const [chokeZones, setChokeZones] =
    useState<ChokeZoneInfo[]>(INITIAL_CHOKE_ZONES);
  const [reports, setReports] = useState<TrafficReport[]>(INITIAL_REPORTS);
  const [routes, setRoutes] = useState<RouteOption[]>([]);
  const [selectedRouteId, setSelectedRouteId] =
    useState<string>("route-smart-bypass");
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [clickedCoords, setClickedCoords] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [aiAdvice, setAiAdvice] = useState<AIRouteAdvice | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [showChargingStations, setShowChargingStations] = useState(false);
  const [isSurgeActive, setIsSurgeActive] = useState(false);
  const [selectedReportDetail, setSelectedReportDetail] =
    useState<TrafficReport | null>(null);
  const [isToolsMenuOpen, setIsToolsMenuOpen] = useState(false);
  const toolsMenuRef = useRef<HTMLDivElement>(null);

  // App Opening Splash Intro State
  const [showSplash, setShowSplash] = useState(true);

  // User Authentication & Profile State
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem("erahi_user_profile");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // E-Rahi Gold Premium Pass State (₹49/month)
  const [isPremiumPass, setIsPremiumPass] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem("erahi_is_premium");
      return saved === "true";
    } catch {
      return false;
    }
  });
  const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false);

  // Local Stores & Clinics Promotion State
  const [promotedStores, setPromotedStores] = useState<LocalStoreClinic[]>(
    () => {
      try {
        const saved = localStorage.getItem("erahi_custom_stores");
        return saved
          ? [...SAMPLE_LOCAL_STORES, ...JSON.parse(saved)]
          : SAMPLE_LOCAL_STORES;
      } catch {
        return SAMPLE_LOCAL_STORES;
      }
    },
  );
  const [isStoreModalOpen, setIsStoreModalOpen] = useState(false);

  // High-Impact Feature Modal States
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isFareSplitterModalOpen, setIsFareSplitterModalOpen] = useState(false);
  const [isEvRadarModalOpen, setIsEvRadarModalOpen] = useState(false);
  const [isAutoStandModalOpen, setIsAutoStandModalOpen] = useState(false);
  const [isOfflinePocketModalOpen, setIsOfflinePocketModalOpen] = useState(false);

  const handleActivatePremium = () => {
    setIsPremiumPass(true);
    try {
      localStorage.setItem("erahi_is_premium", "true");
    } catch (e) {
      console.error(e);
    }
    if (currentUser) {
      setCurrentUser({
        ...currentUser,
        isPremium: true,
      });
    }
  };

  const handleAddNewStore = (newStore: LocalStoreClinic) => {
    setPromotedStores((prev) => {
      const updated = [newStore, ...prev];
      try {
        localStorage.setItem("erahi_custom_stores", JSON.stringify([newStore]));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
  };

  // Running Auto Rickshaw Tab/View Switch Loader State
  const [tabTransitionLoading, setTabTransitionLoading] = useState<{
    active: boolean;
    message: string;
    subMessage: string;
  }>({
    active: false,
    message: "",
    subMessage: "",
  });

  // Live GPS & Auto Ride Tracking States
  const [userGpsLocation, setUserGpsLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [userGpsAvailable, setUserGpsAvailable] = useState(false);
  const [liveRideState, setLiveRideState] = useState<LiveRideState>({
    isActive: false,
    mode: "auto_simulation",
    currentLocation: null,
    speedKmh: 0,
    heading: 0,
    distanceRemainingKm: 0,
    timeRemainingMin: 0,
    totalDistanceKm: 0,
    totalDurationMin: 0,
    progressPercent: 0,
    currentStepIndex: 0,
    currentStepInstruction: "",
    isInsideAuto: false,
  });

  const rideIntervalRef = useRef<any>(null);
  const watchGpsIdRef = useRef<number | null>(null);

  const handleSelectStateAndCity = (stateId: string, cityId: string) => {
    const newCity = getCityData(stateId, cityId);
    setTabTransitionLoading({
      active: true,
      message: `${newCity.name} स्मार्ट ग्रिड लोड हो रहा है...`,
      subMessage: `Connecting to ${newCity.name} (${newCity.stateName}) traffic network`,
    });

    setSelectedStateId(stateId);
    setSelectedCityId(cityId);
    const newOrig =
      newCity.locations.find((l) => l.id === newCity.defaultOriginId) ||
      newCity.locations[0];
    const newDest =
      newCity.locations.find((l) => l.id === newCity.defaultDestId) ||
      newCity.locations[1];
    setOrigin(newOrig);
    setDestination(newDest);
    setChokeZones(newCity.chokeZones);
    if (newCity.reports.length > 0) {
      setReports(newCity.reports);
    }

    setTimeout(() => {
      setTabTransitionLoading({ active: false, message: "", subMessage: "" });
    }, 280);
  };

  const handleLoginSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    try {
      localStorage.setItem("erahi_user_profile", JSON.stringify(user));
    } catch (e) {
      console.error(e);
    }
    if (user.role === "driver") {
      setUserMode("driver");
    } else if (user.role === "commuter") {
      setUserMode("commuter");
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem("erahi_user_profile");
    } catch (e) {
      console.error(e);
    }
  };

  const handleQuickSelectRoute = (originId: string, destId: string) => {
    const orig = currentCity.locations.find((l) => l.id === originId);
    const dest = currentCity.locations.find((l) => l.id === destId);
    if (orig && dest) {
      setOrigin(orig);
      setDestination(dest);
    }
  };

  // Localization Language (Phase 3: English, Hindi, Urdu - Default: English)
  const [language, setLanguage] = useState<AppLanguage>(() => {
    try {
      const saved = localStorage.getItem("erahi_language");
      return saved === "hi" || saved === "ur" || saved === "en" ? saved : "en";
    } catch {
      return "en";
    }
  });

  const handleSetLanguage = (lang: AppLanguage) => {
    setLanguage(lang);
    try {
      localStorage.setItem("erahi_language", lang);
    } catch (e) {
      console.error(e);
    }
  };

  const t = TRANSLATIONS[language];

  // Mobile dedicated tab navigation: 'map' | 'route' | 'cockpit' | 'services' | 'fare' | 'feed' | 'police' | 'roadmap' | 'sos'
  const [activeMobileTab, setActiveMobileTab] = useState<
    | "map"
    | "route"
    | "cockpit"
    | "services"
    | "fare"
    | "feed"
    | "police"
    | "roadmap"
    | "sos"
  >("map");

  // Desktop view toggle: 'navigator' | 'services' | 'fare' | 'roadmap' | 'sos'
  const [desktopView, setDesktopView] = useState<
    "navigator" | "services" | "fare" | "roadmap" | "sos"
  >("navigator");

  // Animated Tab Switcher with Auto Rickshaw Loader
  const switchMobileTabWithLoader = (
    tab:
      | "map"
      | "route"
      | "cockpit"
      | "services"
      | "fare"
      | "feed"
      | "police"
      | "roadmap"
      | "sos",
  ) => {
    if (tab === activeMobileTab) return;

    const messages: Record<string, { msg: string; sub: string }> = {
      map: {
        msg:
          language === "hi"
            ? "लाइव मैप लोड हो रहा है..."
            : "Loading Live Transit Map...",
        sub:
          language === "hi"
            ? "जीपीएस ट्रैकिंग व चोकपॉइंट सेंसर कनेक्ट हो रहे हैं"
            : "Syncing GPS sensors & live choke zones",
      },
      route: {
        msg:
          language === "hi"
            ? "स्मार्ट रूट कैलकुलेटर..."
            : "Calculating Smart Detour...",
        sub:
          language === "hi"
            ? "गली-गली बायपास व सबसे तेज रास्ता"
            : "Finding fastest alleyways & congestion bypass",
      },
      cockpit: {
        msg:
          language === "hi"
            ? "ई-रिक्शा चालक कॉकपिट..."
            : "Initializing Driver Cockpit...",
        sub:
          language === "hi"
            ? "बैटरी चार्जिंग स्टेशन व लाइव पैसेंजर डिमांड"
            : "Syncing charging stations & passenger surges",
      },
      services: {
        msg:
          language === "hi"
            ? "शहर सेवाएं व अस्पताल लोड हो रहे हैं..."
            : "Loading City Directory...",
        sub:
          language === "hi"
            ? "अस्पताल, घंटे के होटल, कॉलेज व स्थानीय दुकानें"
            : "Hospitals, hourly stays, colleges & local clinics",
      },
      fare: {
        msg:
          language === "hi"
            ? "ई-रिक्शा किराया दरें लोड हो रही हैं..."
            : "Loading Official Fare Rates...",
        sub:
          language === "hi"
            ? `${currentCity.name} आधिकारिक रेट चार्ट व कैलकुलेटर`
            : `${currentCity.name} verified rates & route fare chart`,
      },
      sos: {
        msg:
          language === "hi"
            ? "महिला सुरक्षा एवं पुलिस SOS..."
            : "Loading Women Safety & SOS Hub...",
        sub:
          language === "hi"
            ? "112 पुलिस आपातकाल व लाइव जीपीएस लोकेशन"
            : "Connecting to emergency police desk & GPS broadcast",
      },
      feed: {
        msg:
          language === "hi"
            ? "लाइव क्राउडसोर्स अलर्ट्स..."
            : "Fetching Live Citizen Reports...",
        sub:
          language === "hi"
            ? "चालक व पुलिस लाइव अपडेट्स"
            : "Crowdsourced jam reports & police clearances",
      },
      police: {
        msg:
          language === "hi"
            ? "यातायात पुलिस एडवाइजरी..."
            : "Loading Police Bulletins...",
        sub:
          language === "hi"
            ? "आधिकारिक रूट डायवर्जन व नोटिस"
            : "Official traffic police notices & diversions",
      },
      roadmap: {
        msg:
          language === "hi"
            ? "4-फेज ट्रांजिट इंजन..."
            : "Loading Architecture Engine...",
        sub:
          language === "hi"
            ? "एआई रूटिंग व सेंसर मैट्रिक्स"
            : "Algorithms & data architecture",
      },
    };

    const info = messages[tab] || {
      msg: "लोड हो रहा है...",
      sub: "Updating transit data",
    };
    setTabTransitionLoading({
      active: true,
      message: info.msg,
      subMessage: info.sub,
    });
    setActiveMobileTab(tab);
    setTimeout(() => {
      setTabTransitionLoading({ active: false, message: "", subMessage: "" });
    }, 280);
  };

  const switchDesktopViewWithLoader = (
    view: "navigator" | "services" | "fare" | "roadmap" | "sos",
  ) => {
    if (view === desktopView) return;
    setTabTransitionLoading({
      active: true,
      message:
        view === "roadmap"
          ? language === "hi"
            ? "4-चरण आर्किटेक्चर..."
            : "Architecture Engine..."
          : view === "services"
            ? language === "hi"
              ? "शहर सेवाएं व अस्पताल..."
              : "City Services & Hospitals..."
            : view === "fare"
              ? language === "hi"
                ? "ई-रिक्शा किराया दरें..."
                : "E-Rickshaw Fare Rates..."
              : view === "sos"
                ? language === "hi"
                  ? "महिला सुरक्षा SOS..."
                  : "Women Safety & SOS..."
                : language === "hi"
                  ? "लाइव ट्रांजिट..."
                  : "Live Transit...",
      subMessage: `${currentCity.name}`,
    });
    setDesktopView(view);
    if (view === "navigator") setActiveMobileTab("map");
    else if (view === "fare") setActiveMobileTab("fare");
    else if (view === "services") setActiveMobileTab("services");
    else if (view === "sos") setActiveMobileTab("sos");
    else if (view === "roadmap") setActiveMobileTab("roadmap");

    setTimeout(() => {
      setTabTransitionLoading({ active: false, message: "", subMessage: "" });
    }, 280);
  };

  // PWA Install prompt state
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [isMobileInstallModalOpen, setIsMobileInstallModalOpen] =
    useState(false);
  const [isFareModalOpen, setIsFareModalOpen] = useState(false);
  const [isComplaintModalOpen, setIsComplaintModalOpen] = useState(false);
  const [isExplainerModalOpen, setIsExplainerModalOpen] = useState(false);

  // Audio and Haptic inspection handler
  const handleInspectReport = (rep: TrafficReport) => {
    setSelectedReportDetail(rep);
    playHazardWarningChime();
    triggerHapticBuzz([150, 80, 150]);
  };

  // Recalculate routes when origin, destination, or userMode changes
  useEffect(() => {
    const generated = generateRoutePaths(origin, destination, userMode);
    setRoutes(generated);
    setSelectedRouteId(generated[0]?.id || "route-smart-bypass");
  }, [origin, destination, userMode]);

  // Selected route object
  const currentSelectedRoute = useMemo(() => {
    return routes.find((r) => r.id === selectedRouteId) || routes[0];
  }, [routes, selectedRouteId]);

  // Handle Stopping the Live Ride
  const handleStopRide = () => {
    if (rideIntervalRef.current) {
      clearInterval(rideIntervalRef.current);
      rideIntervalRef.current = null;
    }
    if (watchGpsIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchGpsIdRef.current);
      watchGpsIdRef.current = null;
    }
    setLiveRideState((prev) => ({
      ...prev,
      isActive: false,
      isInsideAuto: false,
    }));
  };

  // Handle Starting the Live Auto Ride
  const handleStartRide = (simulated: boolean = true) => {
    handleStopRide();

    if (
      !currentSelectedRoute ||
      !currentSelectedRoute.pathPoints ||
      currentSelectedRoute.pathPoints.length === 0
    ) {
      return;
    }

    const path = currentSelectedRoute.pathPoints;
    const totalPts = path.length;
    let currentIdx = 0;
    const totalDist = currentSelectedRoute.distanceKm;
    const totalDur = currentSelectedRoute.durationMin;

    setLiveRideState({
      isActive: true,
      mode: "auto_simulation",
      currentLocation: { lat: path[0][0], lng: path[0][1] },
      speedKmh: 18,
      heading: 45,
      distanceRemainingKm: totalDist,
      timeRemainingMin: totalDur,
      totalDistanceKm: totalDist,
      totalDurationMin: totalDur,
      progressPercent: 0,
      currentStepIndex: 0,
      currentStepInstruction:
        currentSelectedRoute.stepInstructions[0] || "ऑटो में सफ़र शुरू हुआ",
      nextChokepointAhead: chokeZones[0]?.name,
      isInsideAuto: true,
      startedAt: Date.now(),
    });

    // Switch mobile view to map so passenger immediately sees their auto moving live
    if (window.innerWidth < 1024) {
      setActiveMobileTab("map");
    }

    // Interval to simulate the auto driving along the route
    rideIntervalRef.current = setInterval(() => {
      currentIdx += 1;
      if (currentIdx >= totalPts) {
        // Arrived at destination
        setLiveRideState((prev) => ({
          ...prev,
          isActive: false,
          progressPercent: 100,
          distanceRemainingKm: 0,
          timeRemainingMin: 0,
          speedKmh: 0,
          currentStepInstruction: `🎉 आप मंज़िल ${destination.name} पहुँच गए हैं!`,
        }));
        clearInterval(rideIntervalRef.current);
        rideIntervalRef.current = null;
        return;
      }

      const point = path[currentIdx];
      const progressRatio = currentIdx / (totalPts - 1);
      const remainingDist = parseFloat(
        (totalDist * (1 - progressRatio)).toFixed(1),
      );
      const remainingTime = Math.max(
        1,
        Math.round(totalDur * (1 - progressRatio)),
      );
      const pct = Math.min(100, Math.round(progressRatio * 100));

      // Calculate step instruction index
      const steps = currentSelectedRoute.stepInstructions;
      const stepIdx = Math.min(
        steps.length - 1,
        Math.floor(progressRatio * steps.length),
      );

      // Dynamic realistic auto speed (15 - 24 km/h, slows near choke points)
      const dynamicSpeed =
        pct > 40 && pct < 60 ? 12 : Math.floor(18 + Math.random() * 6);

      setLiveRideState((prev) => ({
        ...prev,
        currentLocation: { lat: point[0], lng: point[1] },
        progressPercent: pct,
        distanceRemainingKm: remainingDist,
        timeRemainingMin: remainingTime,
        speedKmh: dynamicSpeed,
        currentStepIndex: stepIdx,
        currentStepInstruction:
          steps[stepIdx] || `मंज़िल ${destination.name} की ओर अग्रसर`,
      }));
    }, 2200);
  };

  // Start Real Phone GPS Tracking
  const handleTrackRealGps = () => {
    if (!("geolocation" in navigator)) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    // Initial query
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserGpsLocation({ lat: latitude, lng: longitude });
        setUserGpsAvailable(true);

        // Calculate approximate distance to destination
        const destLat = destination.lat;
        const destLng = destination.lng;
        // Haversine formula
        const R = 6371; // km
        const dLat = ((destLat - latitude) * Math.PI) / 180;
        const dLon = ((destLng - longitude) * Math.PI) / 180;
        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos((latitude * Math.PI) / 180) *
            Math.cos((destLat * Math.PI) / 180) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distKm = parseFloat((R * c).toFixed(1));
        const estTime = Math.max(2, Math.round((distKm / 20) * 60));

        setLiveRideState((prev) => ({
          ...prev,
          isActive: true,
          mode: "real_gps",
          currentLocation: { lat: latitude, lng: longitude },
          distanceRemainingKm: distKm,
          timeRemainingMin: estTime,
          totalDistanceKm: distKm,
          totalDurationMin: estTime,
          speedKmh: pos.coords.speed ? Math.round(pos.coords.speed * 3.6) : 18,
          currentStepInstruction: `लाइव GPS सक्रिय: ${destination.name} की ओर बढ़ रहे हैं`,
          isInsideAuto: true,
        }));

        if (window.innerWidth < 1024) {
          setActiveMobileTab("map");
        }
      },
      (err) => {
        console.warn("GPS location access denied or unavailable:", err);
        // Fallback to route start simulation
        handleStartRide(true);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );

    // Watch position continuously
    if (watchGpsIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchGpsIdRef.current);
    }
    watchGpsIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude, speed } = pos.coords;
        setUserGpsLocation({ lat: latitude, lng: longitude });
        setUserGpsAvailable(true);

        const destLat = destination.lat;
        const destLng = destination.lng;
        const R = 6371;
        const dLat = ((destLat - latitude) * Math.PI) / 180;
        const dLon = ((destLng - longitude) * Math.PI) / 180;
        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos((latitude * Math.PI) / 180) *
            Math.cos((destLat * Math.PI) / 180) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distKm = parseFloat((R * c).toFixed(1));
        const estTime = Math.max(1, Math.round((distKm / 20) * 60));

        setLiveRideState((prev) => ({
          ...prev,
          currentLocation: { lat: latitude, lng: longitude },
          distanceRemainingKm: distKm,
          timeRemainingMin: estTime,
          speedKmh: speed ? Math.round(speed * 3.6) : prev.speedKmh || 18,
        }));
      },
      (err) => console.warn("watchPosition error:", err),
      { enableHighAccuracy: true },
    );
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (rideIntervalRef.current) clearInterval(rideIntervalRef.current);
      if (watchGpsIdRef.current !== null)
        navigator.geolocation.clearWatch(watchGpsIdRef.current);
    };
  }, []);

  // Fetch live reports from Express API on mount
  const fetchReports = async () => {
    try {
      const res = await fetch("/api/reports");
      if (res.ok) {
        const data = await res.json();
        if (data.reports && Array.isArray(data.reports)) {
          setReports(data.reports);
        }
      }
    } catch (err) {
      console.warn("Could not fetch server reports, using local state:", err);
    }
  };

  useEffect(() => {
    fetchReports();

    // Listen for PWA installation prompt
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBanner(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    return () =>
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setShowInstallBanner(false);
      }
      setDeferredPrompt(null);
    } else {
      alert(
        "To install on mobile: Tap your browser's share icon (iOS Safari) or menu (Chrome Android) and select 'Add to Home Screen'!",
      );
    }
  };

  const handleSwapLocations = () => {
    const temp = origin;
    setOrigin(destination);
    setDestination(temp);
  };

  const handleOpenReportModal = (lat?: number, lng?: number) => {
    if (lat && lng) {
      setClickedCoords({ lat, lng });
    } else {
      setClickedCoords(null);
    }
    setIsReportModalOpen(true);
  };

  const handleSubmitReport = async (
    newReportData: Omit<
      TrafficReport,
      "id" | "upvotes" | "downvotes" | "reportedAt"
    > & { userGps?: { lat: number; lng: number } },
  ) => {
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newReportData),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.report) {
          setReports((prev) => [data.report, ...prev]);
          // Refresh reports
          fetchReports();
          return;
        }
      }
    } catch (err) {
      console.warn("POST /api/reports failed, saving locally:", err);
    }

    // Local fallback
    const localReport: TrafficReport = {
      ...newReportData,
      id: `rep-${Date.now()}`,
      upvotes: 1,
      downvotes: 0,
      reportedAt: new Date().toISOString(),
    };
    setReports((prev) => [localReport, ...prev]);
  };

  const handleVoteReport = async (
    reportId: string,
    type: "up" | "down" | "cleared",
  ) => {
    setReports((prev) =>
      prev.map((rep) => {
        if (rep.id === reportId) {
          if (type === "up") return { ...rep, upvotes: rep.upvotes + 1 };
          if (type === "down") return { ...rep, downvotes: rep.downvotes + 1 };
          if (type === "cleared")
            return { ...rep, severity: "clearing", upvotes: rep.upvotes + 3 };
        }
        return rep;
      }),
    );

    try {
      await fetch(`/api/reports/${reportId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
      });
      fetchReports();
    } catch (err) {
      console.warn("Vote report API error:", err);
    }
  };

  const handleRequestAiAdvice = async () => {
    setIsLoadingAi(true);
    try {
      const res = await fetch("/api/ai-route-advice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          origin,
          destination,
          vehicleType: userMode === "driver" ? "erickshaw" : "commuter",
          activeCongestions: chokeZones,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.advice) {
          setAiAdvice(data.advice);
        }
      }
    } catch (err) {
      console.error("AI Advice fetch failed, using fallback advice:", err);
      setAiAdvice({
        headline:
          userMode === "driver"
            ? "Smart E-Rickshaw Gali Bypass"
            : "Commuter Peak Avoidance Detour",
        recommendedRoute: `Take Shahamatganj Flyover & Civil Lines link road to avoid Chowk and Koharapeer`,
        avoidHotspots: ["Chowk Narrow Gali Jam", "Koharapeer Central Chauraha"],
        estimatedTimeMin: 18,
        standardTimeMin: 37,
        timeSavedMin: 19,
        trafficPoliceAdvisory:
          "Kutubkhana inner market restricted for unregistered e-rickshaws. Use designated bypass corridors.",
        hindiAlert:
          "कोहाड़ापीर और चौक में भारी ई-रिक्शा जाम है। शाहमतगंज बाईपास से जाएं, 19 मिनट बचेंगे।",
      });
    } finally {
      setIsLoadingAi(false);
    }
  };

  const handleSimulateSurge = () => {
    setIsSurgeActive((prev) => {
      const next = !prev;
      if (next) {
        setChokeZones((current) =>
          current.map((cz) => {
            if (cz.id === "cz-koharapeer" || cz.id === "cz-chowk") {
              return {
                ...cz,
                congestionScore: Math.min(98, cz.congestionScore + 15),
                activeRickshawsEst: cz.activeRickshawsEst + 60,
                status: "Critical Standstill",
              };
            }
            return cz;
          }),
        );
      } else {
        setChokeZones(INITIAL_CHOKE_ZONES);
      }
      return next;
    });
  };

  const handleQuickReportJam = (laneName: string) => {
    handleSubmitReport({
      locationName: laneName,
      category: "erickshaw_gridlock",
      severity: "critical",
      title: `Heavy E-Rickshaw Queue Jam at ${laneName}`,
      description:
        "One-touch driver emergency alert: unregistered rickshaws blocking flow.",
      coordinates: { lat: 28.362, lng: 79.42 },
      userType: "erickshaw_driver",
      avoidanceTip: "Divert through outer bypass road.",
    });
  };

  // Close quick tools menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        toolsMenuRef.current &&
        !toolsMenuRef.current.contains(event.target as Node)
      ) {
        setIsToolsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col text-slate-900 font-sans pb-20 lg:pb-0">
      {/* Top Clean Navbar */}
      <header className="bg-white/95 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-[1100] shadow-2xs">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2 flex items-center justify-between gap-3">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-slate-900 text-amber-400 flex items-center justify-center text-lg shadow-2xs shrink-0 font-bold">
              🛺
            </div>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <h1 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight leading-none flex items-center gap-1.5">
                  <span>E-Rahi</span>
                  <span className="text-slate-400 font-normal">/</span>
                  <span className="text-slate-700 font-semibold">
                    {currentCity.name}
                  </span>
                </h1>
                <span className="hidden md:inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live Grid
                </span>
              </div>
            </div>
          </div>

          {/* Desktop Center: Navigation & Mode Switcher */}
          <div className="hidden lg:flex items-center gap-2">
            {/* Primary View Switcher: Ride & Route vs City Services vs Fare Rates vs Women Safety SOS */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/80 text-xs font-semibold">
              <button
                onClick={() => switchDesktopViewWithLoader("navigator")}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                  desktopView === "navigator"
                    ? "bg-slate-900 text-white shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <span>🛺</span>
                <span>
                  {language === "hi"
                    ? "सवारी व रूट"
                    : language === "ur"
                      ? "سواری و راستہ"
                      : "Find Ride & Route"}
                </span>
              </button>
              <button
                onClick={() => switchDesktopViewWithLoader("services")}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                  desktopView === "services"
                    ? "bg-slate-900 text-white shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>
                  {language === "hi"
                    ? "अस्पताल व शहर सेवाएं"
                    : "Hospitals & Services"}
                </span>
              </button>
              <button
                onClick={() => switchDesktopViewWithLoader("fare")}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                  desktopView === "fare"
                    ? "bg-slate-900 text-white shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Calculator className="w-3.5 h-3.5" />
                <span>
                  {language === "hi"
                    ? "किराया दरें"
                    : language === "ur"
                      ? "کرایہ ریٹ"
                      : "Fare Rates"}
                </span>
              </button>
              <button
                onClick={() => switchDesktopViewWithLoader("sos")}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                  desktopView === "sos"
                    ? "bg-rose-600 text-white shadow-2xs"
                    : "text-rose-700 hover:bg-rose-50"
                }`}
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>
                  {language === "hi"
                    ? "महिला सुरक्षा SOS"
                    : language === "ur"
                      ? "خواتین سیفٹی"
                      : "Safety SOS"}
                </span>
              </button>
            </div>

            {/* Simple 1-Minute Explainer Guide Trigger */}
            <button
              onClick={() => setIsExplainerModalOpen(true)}
              className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
              title="How E-Rahi Works"
            >
              <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
              <span>{language === "hi" ? "गाइड" : "Guide"}</span>
            </button>
          </div>

          {/* Right Actions: Clean, Streamlined & Organized */}
          <div className="flex items-center gap-2">
            {/* Women & Girls Safety SOS Button */}
            <button
              onClick={() => {
                if (window.innerWidth < 1024) {
                  switchMobileTabWithLoader("sos");
                } else {
                  switchDesktopViewWithLoader("sos");
                }
              }}
              className={`font-semibold text-xs px-2.5 sm:px-3 py-2 rounded-xl transition-all active:scale-95 flex items-center gap-1.5 min-h-[36px] cursor-pointer border ${
                desktopView === "sos" || activeMobileTab === "sos"
                  ? "bg-rose-600 text-white border-rose-600 shadow-2xs"
                  : "bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200"
              }`}
              title={
                language === "hi"
                  ? "महिला सुरक्षा एवं पुलिस हेल्पलाइन SOS पेज"
                  : "Women Safety & Emergency SOS Page"
              }
            >
              <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">
                {language === "hi" ? "महिला सुरक्षा SOS" : "Women SOS"}
              </span>
              <span className="sm:hidden font-bold">SOS</span>
            </button>

            {/* 1. Flag Jam CTA Button */}
            <button
              onClick={() => handleOpenReportModal()}
              className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-2.5 sm:px-3 py-2 rounded-xl shadow-2xs transition-all active:scale-95 flex items-center gap-1.5 min-h-[36px] cursor-pointer"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="hidden xs:inline">{t.flagJam}</span>
              <span className="xs:hidden">
                {language === "hi" ? "रिपोर्ट" : "Report"}
              </span>
            </button>

            {/* 2. Clean More Tools Dropdown */}
            <div className="relative" ref={toolsMenuRef}>
              <button
                onClick={() => setIsToolsMenuOpen(!isToolsMenuOpen)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/80 text-xs font-semibold px-2.5 py-2 rounded-xl transition-colors flex items-center gap-1 min-h-[36px] cursor-pointer"
                title="More Tools & Services"
              >
                <span className="hidden md:inline">
                  {language === "hi" ? "टूल्स" : "Tools"}
                </span>
                <span className="md:hidden">⚙️</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-150 ${isToolsMenuOpen ? "rotate-180" : ""}`}
                />
              </button>

              {isToolsMenuOpen && (
                <div className="absolute right-0 top-full mt-1.5 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100 p-1.5 divide-y divide-slate-100">
                  {/* 1. Multi-Lingual AI Voice Search */}
                  <div className="py-1">
                    <button
                      onClick={() => {
                        setIsVoiceModalOpen(true);
                        setIsToolsMenuOpen(false);
                      }}
                      className="w-full px-3 py-2 text-left rounded-xl text-xs font-semibold text-slate-800 hover:bg-amber-50 hover:text-amber-900 transition-colors flex items-center gap-2.5 cursor-pointer"
                    >
                      <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
                        <Mic className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold flex items-center gap-1.5">
                          <span>{language === "hi" ? "🎙️ एआई वॉयस असिस्टेंट" : "🎙️ AI Voice Search"}</span>
                          <span className="text-[9px] bg-amber-100 text-amber-800 px-1 rounded font-bold">NEW</span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-normal">
                          {language === "hi" ? "बोलकर रूट, किराया व अस्पताल पूछें" : "Search routes & fares by voice"}
                        </div>
                      </div>
                    </button>
                  </div>

                  {/* 2. Shared Seat Fare Splitter & UPI QR */}
                  <div className="py-1">
                    <button
                      onClick={() => {
                        setIsFareSplitterModalOpen(true);
                        setIsToolsMenuOpen(false);
                      }}
                      className="w-full px-3 py-2 text-left rounded-xl text-xs font-semibold text-slate-800 hover:bg-slate-50 transition-colors flex items-center gap-2.5 cursor-pointer"
                    >
                      <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                        <QrCode className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold">
                          {language === "hi" ? "🛺 शेयर्ड सीट व UPI QR" : "🛺 Seat Split & UPI QR"}
                        </div>
                        <div className="text-[10px] text-slate-400 font-normal">
                          {language === "hi" ? "खुल्ले पैसों का हिसाब व ऑनलाइन पेमेंट" : "Split ride fare & pay via UPI"}
                        </div>
                      </div>
                    </button>
                  </div>

                  {/* 3. EV Battery Radar */}
                  <div className="py-1">
                    <button
                      onClick={() => {
                        setIsEvRadarModalOpen(true);
                        setIsToolsMenuOpen(false);
                      }}
                      className="w-full px-3 py-2 text-left rounded-xl text-xs font-semibold text-slate-800 hover:bg-slate-50 transition-colors flex items-center gap-2.5 cursor-pointer"
                    >
                      <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                        <BatteryCharging className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold">
                          {language === "hi" ? "⚡ बैटरी हेल्थ व स्वैप रडार" : "⚡ EV Battery & Swap Radar"}
                        </div>
                        <div className="text-[10px] text-slate-400 font-normal">
                          {language === "hi" ? "ड्राइविंग रेंज व 2 मिनट स्वैप केंद्र" : "Safe km range & swap docks"}
                        </div>
                      </div>
                    </button>
                  </div>

                  {/* 4. Local Auto Stands Directory */}
                  <div className="py-1">
                    <button
                      onClick={() => {
                        setIsAutoStandModalOpen(true);
                        setIsToolsMenuOpen(false);
                      }}
                      className="w-full px-3 py-2 text-left rounded-xl text-xs font-semibold text-slate-800 hover:bg-slate-50 transition-colors flex items-center gap-2.5 cursor-pointer"
                    >
                      <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
                        <Signpost className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold">
                          {language === "hi" ? "🚏 अधिकृत ऑटो स्टैंड गाइड" : "🚏 Auto Stand Directory"}
                        </div>
                        <div className="text-[10px] text-slate-400 font-normal">
                          {language === "hi" ? "तय सरकारी रेट व यूनियन हेल्पलाइन" : "Fixed stage rates & helplines"}
                        </div>
                      </div>
                    </button>
                  </div>

                  {/* 5. Offline Pocket Mode & SMS */}
                  <div className="py-1">
                    <button
                      onClick={() => {
                        setIsOfflinePocketModalOpen(true);
                        setIsToolsMenuOpen(false);
                      }}
                      className="w-full px-3 py-2 text-left rounded-xl text-xs font-semibold text-slate-800 hover:bg-slate-50 transition-colors flex items-center gap-2.5 cursor-pointer"
                    >
                      <div className="w-7 h-7 rounded-lg bg-rose-500/10 text-rose-600 flex items-center justify-center shrink-0">
                        <WifiOff className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold">
                          {language === "hi" ? "📴 ऑफलाइन मोड व SMS" : "📴 Offline Pocket & SMS"}
                        </div>
                        <div className="text-[10px] text-slate-400 font-normal">
                          {language === "hi" ? "बिना इंटरनेट किराया व इमरजेंसी SMS" : "Zero-data matrix & SMS dispatch"}
                        </div>
                      </div>
                    </button>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => {
                        setIsExplainerModalOpen(true);
                        setIsToolsMenuOpen(false);
                      }}
                      className="w-full px-3 py-2 text-left rounded-xl text-xs font-semibold text-slate-800 hover:bg-slate-50 transition-colors flex items-center gap-2.5 cursor-pointer"
                    >
                      <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                        <HelpCircle className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-semibold">
                          {language === "hi"
                            ? "💡 आसान 1-मिनट गाइड"
                            : "💡 Simple 1-Min Guide"}
                        </div>
                        <div className="text-[10px] text-slate-500 font-normal">
                          {language === "hi"
                            ? "ई-राही का उपयोग कैसे करें"
                            : "How to use E-Rahi app"}
                        </div>
                      </div>
                    </button>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => {
                        setIsComplaintModalOpen(true);
                        setIsToolsMenuOpen(false);
                      }}
                      className="w-full px-3 py-2 text-left rounded-xl text-xs font-semibold text-slate-800 hover:bg-slate-50 transition-colors flex items-center gap-2.5 cursor-pointer"
                    >
                      <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                        <MessageSquareWarning className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div>
                          {language === "hi"
                            ? "नागरिक शिकायत डेस्क"
                            : "Citizen Help Desk"}
                        </div>
                        <div className="text-[10px] text-slate-400 font-normal">
                          {language === "hi"
                            ? "शिकायत व फीडबैक"
                            : "Lodge complaint & issues"}
                        </div>
                      </div>
                    </button>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => {
                        setIsPremiumModalOpen(true);
                        setIsToolsMenuOpen(false);
                      }}
                      className="w-full px-3 py-2 text-left rounded-xl text-xs font-semibold text-slate-800 hover:bg-slate-50 transition-colors flex items-center gap-2.5 cursor-pointer"
                    >
                      <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-900 flex items-center justify-center shrink-0">
                        <Crown className="w-3.5 h-3.5 fill-amber-700 text-amber-700" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1">
                          <span>
                            {language === "hi"
                              ? "गोल्ड पास (₹49/माह)"
                              : "Gold Pass (₹49/mo)"}
                          </span>
                          {isPremiumPass && (
                            <span className="text-[9px] bg-emerald-600 text-white px-1 rounded font-semibold">
                              ACTIVE
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400 font-normal">
                          {language === "hi"
                            ? "अस्पताल व घंटे वाले होटल"
                            : "Unlock hospitals & hotels"}
                        </div>
                      </div>
                    </button>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => {
                        setIsStoreModalOpen(true);
                        setIsToolsMenuOpen(false);
                      }}
                      className="w-full px-3 py-2 text-left rounded-xl text-xs font-semibold text-slate-800 hover:bg-slate-50 transition-colors flex items-center gap-2.5 cursor-pointer"
                    >
                      <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                        <Store className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div>
                          {language === "hi"
                            ? "दुकान / क्लीनिक जोड़ें"
                            : "Add Store / Clinic"}
                        </div>
                        <div className="text-[10px] text-slate-400 font-normal">
                          {language === "hi"
                            ? "स्थानीय व्यापार लिस्ट करें"
                            : "List your local store"}
                        </div>
                      </div>
                    </button>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => {
                        setIsMobileInstallModalOpen(true);
                        setIsToolsMenuOpen(false);
                      }}
                      className="w-full px-3 py-2 text-left rounded-xl text-xs font-semibold text-slate-800 hover:bg-slate-50 transition-colors flex items-center gap-2.5 cursor-pointer"
                    >
                      <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                        <Smartphone className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div>
                          {language === "hi"
                            ? "मोबाइल ऐप इंस्टॉल"
                            : "Get Mobile App"}
                        </div>
                        <div className="text-[10px] text-slate-400 font-normal">
                          {language === "hi"
                            ? "होमस्क्रीन पर जोड़ें"
                            : "Save to home screen"}
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* 4. Trilingual Language Switcher */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200/80 text-[11px] font-semibold">
              <button
                onClick={() => handleSetLanguage("en")}
                className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${language === "en" ? "bg-white text-slate-900 font-bold shadow-2xs" : "text-slate-600 hover:text-slate-900"}`}
              >
                EN
              </button>
              <button
                onClick={() => handleSetLanguage("hi")}
                className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${language === "hi" ? "bg-white text-slate-900 font-bold shadow-2xs" : "text-slate-600 hover:text-slate-900"}`}
              >
                हिं
              </button>
              <button
                onClick={() => handleSetLanguage("ur")}
                className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${language === "ur" ? "bg-white text-slate-900 font-bold shadow-2xs" : "text-slate-600 hover:text-slate-900"}`}
              >
                اردو
              </button>
            </div>

            {/* 5. User Account / Login & Register Button */}
            {currentUser ? (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="bg-white hover:bg-slate-50 text-slate-900 border border-slate-200 font-semibold text-xs px-2.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs min-h-[36px]"
                title={currentUser.name}
              >
                <span className="text-sm">{currentUser.avatar}</span>
                <span className="hidden sm:inline font-semibold max-w-[85px] truncate">
                  {currentUser.name.split(" ")[0]}
                </span>
                <span className="text-[10px] bg-slate-100 text-slate-700 font-medium px-1 rounded-full">
                  ⭐{currentUser.reputationPoints}
                </span>
              </button>
            ) : (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-semibold text-xs px-2.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs min-h-[36px]"
              >
                <LogIn className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden sm:inline">
                  {language === "hi"
                    ? "लॉग इन"
                    : language === "ur"
                      ? "لاگ ان"
                      : "Login"}
                </span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* 4 Dedicated Searching Bars: 1. State ➔ 2. City ➔ 3. From (कहाँ से) ➔ 4. To (कहाँ तक) - Kept only on Map, Ride, & Fare pages */}
      {(desktopView === "navigator" || desktopView === "fare") &&
        ["map", "route", "cockpit", "fare"].includes(activeMobileTab) && (
          <StateCitySelector
            selectedStateId={selectedStateId}
            selectedCityId={selectedCityId}
            onSelectStateAndCity={handleSelectStateAndCity}
            availableLocations={currentCity.locations}
            selectedOrigin={origin}
            selectedDestination={destination}
            onSelectOrigin={(loc) => setOrigin(loc)}
            onSelectDestination={(loc) => {
              setDestination(loc);
              if (window.innerWidth < 1024) {
                setActiveMobileTab("map");
              }
            }}
            onSwapLocations={() => {
              const temp = origin;
              setOrigin(destination);
              setDestination(temp);
            }}
            language={language}
          />
        )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-4">
        {/* Quick Transit Tools Ribbon: 1-Click Access to Voice, Fare Split, EV Radar, Stands, Offline Mode */}
        <div className="mb-3.5 bg-gradient-to-r from-amber-500/10 via-slate-100 to-emerald-500/10 p-2 sm:p-2.5 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between gap-1.5 overflow-x-auto scrollbar-none pb-0.5">
            {/* 1. Voice Search */}
            <button
              onClick={() => setIsVoiceModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-all shrink-0 shadow-xs cursor-pointer group"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              </span>
              <Mic className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
              <span>{language === "hi" ? "बोलकर खोजें" : "Voice Search"}</span>
            </button>

            {/* 2. Seat Fare Splitter & UPI */}
            <button
              onClick={() => setIsFareSplitterModalOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl bg-white text-slate-800 font-bold text-xs hover:bg-slate-50 border border-slate-200/80 transition-all shrink-0 cursor-pointer shadow-2xs"
            >
              <QrCode className="w-3.5 h-3.5 text-emerald-600" />
              <span>{language === "hi" ? "सीट किराया व UPI" : "Fare Split & UPI"}</span>
            </button>

            {/* 3. EV Battery Radar */}
            <button
              onClick={() => setIsEvRadarModalOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl bg-white text-slate-800 font-bold text-xs hover:bg-slate-50 border border-slate-200/80 transition-all shrink-0 cursor-pointer shadow-2xs"
            >
              <BatteryCharging className="w-3.5 h-3.5 text-emerald-600" />
              <span>{language === "hi" ? "बैटरी व स्वैप रडार" : "EV Swap Radar"}</span>
            </button>

            {/* 4. Local Auto Stands */}
            <button
              onClick={() => setIsAutoStandModalOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl bg-white text-slate-800 font-bold text-xs hover:bg-slate-50 border border-slate-200/80 transition-all shrink-0 cursor-pointer shadow-2xs"
            >
              <Signpost className="w-3.5 h-3.5 text-blue-600" />
              <span>{language === "hi" ? "ऑटो स्टैंड गाइड" : "Auto Stands"}</span>
            </button>

            {/* 5. Offline Pocket Mode & SMS */}
            <button
              onClick={() => setIsOfflinePocketModalOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl bg-white text-slate-800 font-bold text-xs hover:bg-slate-50 border border-slate-200/80 transition-all shrink-0 cursor-pointer shadow-2xs"
            >
              <WifiOff className="w-3.5 h-3.5 text-rose-500" />
              <span>{language === "hi" ? "ऑफलाइन व SMS" : "Offline Mode"}</span>
            </button>
          </div>
        </div>

        {/* Mobile View Toggles (Visible on phones & tablets < 1024px) - Only on Map, Ride, & Fare pages */}
        {["map", "route", "cockpit", "fare"].includes(activeMobileTab) && (
          <div className="lg:hidden mb-3">
            <div className="flex items-center bg-white p-1 rounded-xl border border-slate-200 shadow-xs mb-2">
              <button
                onClick={() => setUserMode("commuter")}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all text-center min-h-[44px] flex items-center justify-center gap-1.5 ${
                  userMode === "commuter"
                    ? "bg-slate-900 text-white shadow-xs"
                    : "text-slate-600"
                }`}
              >
                <span>🚶</span>
                <span>{t.commuterMode}</span>
              </button>
              <button
                onClick={() => setUserMode("driver")}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all text-center min-h-[44px] flex items-center justify-center gap-1.5 ${
                  userMode === "driver"
                    ? "bg-amber-500 text-white shadow-xs"
                    : "text-slate-600"
                }`}
              >
                <span>🛺</span>
                <span>{t.driverMode}</span>
              </button>
            </div>
          </div>
        )}

        {/* View Switching: Services Hub OR Fare Rates Hub OR Women Safety SOS Hub OR 4-Phase Roadmap OR Live Transit Dual-Pane */}
        {(desktopView === "sos" && window.innerWidth >= 1024) ||
        activeMobileTab === "sos" ? (
          <div className="space-y-4">
            <WomenSafetyPage
              cityName={currentCity.name}
              cityId={currentCity.id}
              language={language}
              cityLocations={currentCity.locations}
              onBackToRide={() => {
                switchDesktopViewWithLoader("navigator");
                switchMobileTabWithLoader("map");
              }}
              onNavigateToPoliceStation={(lat, lng, name) => {
                const customDest: BareillyLocation = {
                  id: `loc-police-${Date.now()}`,
                  name,
                  hindiName: name,
                  lat,
                  lng,
                  category: "police_station",
                  description: `${name} - Police Facility`,
                  isChokeHazard: false,
                };
                setDestination(customDest);
                switchDesktopViewWithLoader("navigator");
                switchMobileTabWithLoader("map");
              }}
            />
          </div>
        ) : (desktopView === "services" && window.innerWidth >= 1024) ||
          activeMobileTab === "services" ? (
          <div className="space-y-4">
            <CityServicesDirectory
              cityName={currentCity.name}
              userGpsLocation={userGpsLocation}
              isPremium={isPremiumPass}
              onOpenPremiumModal={() => setIsPremiumModalOpen(true)}
              onOpenStoreModal={() => setIsStoreModalOpen(true)}
              hospitals={SAMPLE_HOSPITALS}
              hotels={SAMPLE_HOTELS}
              colleges={SAMPLE_COLLEGES}
              stores={promotedStores}
              language={language}
              defaultUserName={currentUser?.name || ""}
              defaultUserPhone={currentUser?.phone || ""}
              onNavigateToLocation={(lat, lng, name) => {
                // Set as custom destination on live map
                const customDest: BareillyLocation = {
                  id: `loc-service-${Date.now()}`,
                  name,
                  hindiName: name,
                  lat,
                  lng,
                  category: "hospital",
                  description: `${name} - City Landmark`,
                  isChokeHazard: false,
                };
                setDestination(customDest);
                switchDesktopViewWithLoader("navigator");
                switchMobileTabWithLoader("map");
              }}
            />
          </div>
        ) : (desktopView === "fare" && window.innerWidth >= 1024) ||
          activeMobileTab === "fare" ? (
          <div className="space-y-4">
            <BareillyFareCalculator
              language={language}
              cityName={currentCity.name}
              cityLocations={currentCity.locations}
              baseFare={currentCity.baseFare}
              perKmRate={currentCity.perKmRate}
              isFullPage={true}
              chokeZones={chokeZones}
              trafficReports={reports}
              onNavigateRoute={(fromLoc, toLoc) => {
                if (fromLoc) {
                  const oLoc: BareillyLocation = {
                    id: fromLoc.id,
                    name: fromLoc.name,
                    hindiName: fromLoc.hindiName,
                    lat: fromLoc.lat,
                    lng: fromLoc.lng,
                    category: (fromLoc.category as any) || "station",
                    description: `${fromLoc.name} Transit Point`,
                    isChokeHazard: false,
                  };
                  setOrigin(oLoc);
                }
                if (toLoc) {
                  const dLoc: BareillyLocation = {
                    id: toLoc.id,
                    name: toLoc.name,
                    hindiName: toLoc.hindiName,
                    lat: toLoc.lat,
                    lng: toLoc.lng,
                    category: (toLoc.category as any) || "station",
                    description: `${toLoc.name} Transit Point`,
                    isChokeHazard: false,
                  };
                  setDestination(dLoc);
                }
                switchDesktopViewWithLoader("navigator");
                switchMobileTabWithLoader("map");
              }}
            />
          </div>
        ) : (desktopView === "roadmap" && window.innerWidth >= 1024) ||
          activeMobileTab === "roadmap" ? (
          <div className="space-y-4">
            <ArchitectureRoadmapConsole
              language={language}
              onLanguageChange={setLanguage}
              onSimulateSpikeSuccess={() => {
                fetchReports();
              }}
            />
          </div>
        ) : (
          /* Standard Live Transit Dual-Pane Layout */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Left Column (Desktop) OR Mobile Tabs for Route / Cockpit / Analytics */}
            <div
              className={`space-y-4 flex-col lg:col-span-5 ${
                activeMobileTab === "route" || activeMobileTab === "cockpit"
                  ? "flex"
                  : "hidden lg:flex"
              }`}
            >
              {/* Clean Women & Girls Safety Quick SOS Trigger Bar */}
              <div className="bg-white border border-rose-200/90 rounded-2xl p-3 sm:p-3.5 shadow-2xs flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center shrink-0">
                    <ShieldAlert className="w-5 h-5 text-rose-600" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-extrabold text-slate-900">
                        {language === "hi"
                          ? "महिला सुरक्षा हेल्पलाइन"
                          : language === "ur"
                            ? "خواتین سیفٹی"
                            : "Women Safety SOS"}
                      </span>
                      <span className="bg-rose-100 text-rose-800 text-[9px] font-bold px-1.5 py-0.2 rounded-full">
                        UP 112 / 1090
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium truncate mt-0.5">
                      {language === "hi"
                        ? "1-क्लिक में लाइव GPS लोकेशन व पुलिस सहायता"
                        : "1-Click live GPS broadcast to police & family"}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (window.innerWidth < 1024) {
                      switchMobileTabWithLoader("sos");
                    } else {
                      switchDesktopViewWithLoader("sos");
                    }
                  }}
                  className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-2xs transition-all active:scale-95 shrink-0 flex items-center gap-1 cursor-pointer min-h-[36px]"
                >
                  <span>
                    {language === "hi" ? "🚨 SOS खोलें" : "🚨 Open SOS"}
                  </span>
                </button>
              </div>

              {/* Route Planner */}
              {(activeMobileTab === "route" || window.innerWidth >= 1024) && (
                <div className="space-y-4">
                  <RoutePlanner
                    origin={origin}
                    destination={destination}
                    onOriginChange={setOrigin}
                    onDestinationChange={setDestination}
                    onSwapLocations={handleSwapLocations}
                    routes={routes}
                    selectedRouteId={selectedRouteId}
                    onSelectRoute={(id) => {
                      setSelectedRouteId(id);
                      if (window.innerWidth < 1024) {
                        setActiveMobileTab("map");
                      }
                    }}
                    userMode={userMode}
                    onUserModeChange={setUserMode}
                    aiAdvice={aiAdvice}
                    isLoadingAi={isLoadingAi}
                    onRequestAiAdvice={handleRequestAiAdvice}
                    availableLocations={currentCity.locations}
                    liveRideState={liveRideState}
                    onStartRide={handleStartRide}
                    onStopRide={handleStopRide}
                    language={language}
                  />

                  {/* Live Auto Ride Dashboard */}
                  <LiveRideDashboard
                    rideState={liveRideState}
                    selectedRoute={currentSelectedRoute}
                    origin={origin}
                    destination={destination}
                    onStartRide={handleStartRide}
                    onStopRide={handleStopRide}
                    userGpsAvailable={userGpsAvailable}
                    onTrackRealGps={handleTrackRealGps}
                    language={language}
                  />
                </div>
              )}

              {/* Specialized Driver Cockpit (Shown in Driver Mode or when Cockpit tab selected) */}
              {(userMode === "driver" || activeMobileTab === "cockpit") && (
                <ErickshawDriverCockpit
                  onQuickReportJam={handleQuickReportJam}
                  showChargingStations={showChargingStations}
                  onToggleChargingStations={() => {
                    setShowChargingStations(!showChargingStations);
                    if (window.innerWidth < 1024) setActiveMobileTab("map");
                  }}
                  onOpenFareCalculator={() => setIsFareModalOpen(true)}
                  cityName={currentCity.name}
                  language={language}
                />
              )}
            </div>

            {/* Right Column (Desktop) OR Mobile Tab for Map, Feed, Police */}
            <div
              className={`space-y-4 flex-col lg:col-span-7 ${
                activeMobileTab === "map" ||
                activeMobileTab === "feed" ||
                activeMobileTab === "police"
                  ? "flex"
                  : "hidden lg:flex"
              }`}
            >
              {/* Interactive Map (Shown on desktop or when 'map' mobile tab active) */}
              {(activeMobileTab === "map" || window.innerWidth >= 1024) && (
                <div className="space-y-2">
                  {/* Map Controls Bar */}
                  <div className="bg-white rounded-xl border border-slate-200 p-2.5 shadow-xs flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 text-xs">
                      <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                      <span className="font-bold text-slate-800">
                        {currentCity.name}{" "}
                        {language === "hi" ? "मानचित्र" : "Map"}
                      </span>
                      <span className="hidden sm:inline text-slate-400 text-[11px] font-medium">
                        •{" "}
                        {currentCity.locations
                          .slice(0, 3)
                          .map((l) => l.name.split(" ")[0])
                          .join(" / ")}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setShowHeatmap(!showHeatmap)}
                        className={`text-[11px] font-semibold px-2 py-1 rounded-lg border transition-all ${
                          showHeatmap
                            ? "bg-amber-100 text-amber-900 border-amber-300"
                            : "bg-slate-50 text-slate-600 border-slate-200"
                        }`}
                      >
                        🔥 {language === "hi" ? "जाम हीटमैप" : "Choke Heat"}
                      </button>

                      <button
                        onClick={() =>
                          setShowChargingStations(!showChargingStations)
                        }
                        className={`text-[11px] font-semibold px-2 py-1 rounded-lg border transition-all ${
                          showChargingStations
                            ? "bg-emerald-100 text-emerald-900 border-emerald-300"
                            : "bg-slate-50 text-slate-600 border-slate-200"
                        }`}
                      >
                        ⚡ {language === "hi" ? "चार्जिंग हब" : "EV Hubs"}
                      </button>
                    </div>
                  </div>

                  {/* Leaflet Map Stage */}
                  <div className="h-[380px] sm:h-[450px] lg:h-[480px] w-full">
                    <BareillyMap
                      origin={origin}
                      destination={destination}
                      routes={routes}
                      selectedRouteId={selectedRouteId}
                      onSelectRoute={setSelectedRouteId}
                      chokeZones={chokeZones}
                      reports={reports}
                      onMapClickReport={(lat, lng) =>
                        handleOpenReportModal(lat, lng)
                      }
                      onSelectReport={(rep) => handleInspectReport(rep)}
                      showHeatmap={showHeatmap}
                      showChargingStations={showChargingStations}
                      userMode={userMode}
                      cityName={currentCity.name}
                      cityCenter={currentCity.center}
                      liveRideState={liveRideState}
                      userGpsLocation={userGpsLocation}
                      onGpsLocateSuccess={(pos) => {
                        setUserGpsLocation(pos);
                        setUserGpsAvailable(true);
                      }}
                      onOpenComplaintModal={() => setIsComplaintModalOpen(true)}
                      language={language}
                    />
                  </div>

                  {/* If Live Ride is Active on Mobile Map View: Floating Live Progress HUD */}
                  {liveRideState.isActive && (
                    <div className="bg-slate-900 text-white rounded-xl p-3 shadow-lg border border-amber-500/40 flex items-center justify-between gap-3 animate-in slide-in-from-top duration-300">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-9 h-9 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-lg shrink-0 animate-pulse">
                          🛺
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-black text-amber-300 truncate">
                            {liveRideState.currentStepInstruction ||
                              (language === "hi"
                                ? `सफ़र जारी है ➔ ${destination.name}`
                                : `In Transit ➔ ${destination.name}`)}
                          </div>
                          <div className="text-[11px] text-slate-300 flex items-center gap-2 font-medium">
                            <span>
                              {language === "hi" ? "बची दूरी:" : "Dist:"}{" "}
                              <b className="text-emerald-400">
                                {liveRideState.distanceRemainingKm} km
                              </b>
                            </span>
                            <span>•</span>
                            <span>
                              {language === "hi" ? "समय:" : "ETA:"}{" "}
                              <b className="text-amber-400">
                                ~{liveRideState.timeRemainingMin} min
                              </b>
                            </span>
                            <span>•</span>
                            <span>
                              {language === "hi" ? "स्पीड:" : "Speed:"}{" "}
                              <b className="text-sky-300">
                                {liveRideState.speedKmh} km/h
                              </b>
                            </span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={handleStopRide}
                        className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg shrink-0 shadow transition-all active:scale-95 cursor-pointer"
                      >
                        {language === "hi" ? "रोकें" : "Stop"}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* City Traffic Police Citizen Advisory Banner & Festival Bulletins */}
              {(activeMobileTab === "police" || window.innerWidth >= 1024) && (
                <div className="space-y-4">
                  <TrafficPoliceAdvisoryBanner
                    cityName={currentCity.name}
                    notices={currentCity.policeNotices}
                    language={language}
                  />
                  <FestivalPoliceBulletin language={language} />
                </div>
              )}

              {/* Real-time Crowdsource Reports Feed */}
              {(activeMobileTab === "feed" || window.innerWidth >= 1024) && (
                <ReportsFeed
                  reports={reports}
                  onVoteReport={handleVoteReport}
                  onFocusReportOnMap={(rep) => {
                    handleInspectReport(rep);
                    if (window.innerWidth < 1024) setActiveMobileTab("map");
                  }}
                  onOpenReportModal={() => handleOpenReportModal()}
                  language={language}
                  cityName={currentCity.name}
                />
              )}
            </div>
          </div>
        )}
      </main>

      {/* City Fare Calculator Modal */}
      {isFareModalOpen && (
        <div className="fixed inset-0 z-[2200] flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
          <div className="max-w-md w-full my-auto animate-in fade-in zoom-in-95">
            <BareillyFareCalculator
              language={language}
              onClose={() => setIsFareModalOpen(false)}
              cityName={currentCity.name}
              cityLocations={currentCity.locations}
              baseFare={currentCity.baseFare}
              perKmRate={currentCity.perKmRate}
            />
          </div>
        </div>
      )}

      {/* Crowdsource Incident Modal */}
      {isReportModalOpen && (
        <CrowdsourceModal
          isOpen={isReportModalOpen}
          onClose={() => setIsReportModalOpen(false)}
          clickedCoords={clickedCoords}
          onSubmitReport={handleSubmitReport}
          language={language}
          cityName={currentCity.name}
        />
      )}

      {/* Citizen Grievance & Help Desk Modal (Name, Phone, Auto GPS) */}
      {isComplaintModalOpen && (
        <CitizenComplaintModal
          isOpen={isComplaintModalOpen}
          onClose={() => setIsComplaintModalOpen(false)}
          cityName={currentCity.name}
          defaultCoords={currentCity.center}
          language={language}
          onComplaintSubmitted={() => {
            fetchReports();
          }}
        />
      )}

      {/* Mobile App Installation Guide & QR Scan Modal */}
      {isMobileInstallModalOpen && (
        <MobileAppInstallModal
          isOpen={isMobileInstallModalOpen}
          onClose={() => setIsMobileInstallModalOpen(false)}
          language={language}
          onInstallClick={handleInstallClick}
          deferredPromptAvailable={!!deferredPrompt}
        />
      )}

      {/* Selected Report Detail Popup Modal */}
      {selectedReportDetail && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-5 space-y-3 animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
                  {selectedReportDetail.category.replace("_", " ")}
                </span>
                <h3 className="font-bold text-sm text-slate-900 mt-1">
                  {selectedReportDetail.locationName}
                </h3>
              </div>
              <button
                onClick={() => setSelectedReportDetail(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 space-y-1 text-xs">
              <div className="font-bold text-slate-800">
                {selectedReportDetail.title}
              </div>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                {selectedReportDetail.description}
              </p>
            </div>

            {/* Anti-Spam GPS Geofence Badge */}
            <div className="flex items-center gap-1.5 text-[11px]">
              {selectedReportDetail.verifiedByGps ? (
                <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded font-semibold flex items-center gap-1">
                  ✓{" "}
                  {language === "hi"
                    ? "GPS सत्यापित (< 500m)"
                    : language === "ur"
                      ? "GPS تصدیق شدہ (< 500m)"
                      : "GPS Verified (< 500m)"}
                </span>
              ) : (
                <span className="text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded font-semibold">
                  📍{" "}
                  {language === "hi"
                    ? "नागरिक रिपोर्ट पिन"
                    : language === "ur"
                      ? "شہری رپورٹ پن"
                      : "Citizen Pin Report"}
                </span>
              )}
            </div>

            {selectedReportDetail.avoidanceTip && (
              <div className="bg-amber-50 p-2.5 rounded-lg border border-amber-200 text-xs text-amber-900">
                <span className="font-bold">
                  {language === "hi"
                    ? "सुझाया गया बाईपास रास्ता: "
                    : language === "ur"
                      ? "تجویز کردہ متبادل راستہ: "
                      : "Recommended Detour: "}
                </span>
                {selectedReportDetail.avoidanceTip}
              </div>
            )}

            <div className="flex items-center justify-between pt-2 text-xs">
              <span className="text-slate-500">
                {selectedReportDetail.userType === "erickshaw_driver"
                  ? language === "hi"
                    ? "🛺 ई-रिक्शा चालक"
                    : language === "ur"
                      ? "🛺 ای رکشہ ڈرائیور"
                      : "🛺 Rickshaw Driver"
                  : language === "hi"
                    ? "🚶 यात्री / नागरिक"
                    : language === "ur"
                      ? "🚶 مسافر / شہری"
                      : "🚶 Commuter"}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    handleVoteReport(selectedReportDetail.id, "up");
                    setSelectedReportDetail(null);
                  }}
                  className="px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-bold min-h-[40px]"
                >
                  {language === "hi"
                    ? "अभी भी जाम है (+1)"
                    : language === "ur"
                      ? "ابھی بھی جام ہے (+1)"
                      : "Still Jammed (+1)"}
                </button>
                <button
                  onClick={() => {
                    handleVoteReport(selectedReportDetail.id, "cleared");
                    setSelectedReportDetail(null);
                  }}
                  className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold min-h-[40px]"
                >
                  {language === "hi"
                    ? "जाम साफ हुआ"
                    : language === "ur"
                      ? "جام صاف ہے"
                      : "Clear"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MOBILE BOTTOM NAVIGATION BAR (Clean, spacious, intuitive touch targets) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-[1200] bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-2 py-1.5 shadow-lg flex items-center justify-around">
        <button
          onClick={() => switchMobileTabWithLoader("map")}
          className={`flex flex-col items-center justify-center py-1 px-2.5 min-h-[44px] rounded-xl transition-all cursor-pointer ${
            activeMobileTab === "map"
              ? "text-slate-900 font-bold bg-slate-100/90 shadow-2xs"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <MapIcon className="w-4 h-4" />
          <span className="text-[10px] mt-0.5">
            {language === "hi" ? "नक्शा" : "Map"}
          </span>
        </button>

        <button
          onClick={() => switchMobileTabWithLoader("route")}
          className={`flex flex-col items-center justify-center py-1 px-2.5 min-h-[44px] rounded-xl transition-all cursor-pointer ${
            activeMobileTab === "route" || activeMobileTab === "cockpit"
              ? "text-slate-900 font-bold bg-slate-100/90 shadow-2xs"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <Navigation className="w-4 h-4" />
          <span className="text-[10px] mt-0.5">
            {language === "hi" ? "सवारी" : "Ride"}
          </span>
        </button>

        {/* Fare Rate Dedicated Page Tab */}
        <button
          onClick={() => switchMobileTabWithLoader("fare")}
          className={`flex flex-col items-center justify-center py-1 px-2.5 min-h-[44px] rounded-xl transition-all cursor-pointer ${
            activeMobileTab === "fare"
              ? "text-slate-900 font-bold bg-slate-100/90 shadow-2xs"
              : "text-slate-500 hover:text-slate-800"
          }`}
          title={
            language === "hi"
              ? "ई-रिक्शा किराया दरें व कैलकुलेटर"
              : "Fare Rates"
          }
        >
          <Calculator className="w-4 h-4" />
          <span className="text-[10px] mt-0.5">
            {language === "hi"
              ? "किराया"
              : language === "ur"
                ? "کرایہ"
                : "Fare"}
          </span>
        </button>

        {/* Mobile Services & Hospitals Tab */}
        <button
          onClick={() => switchMobileTabWithLoader("services")}
          className={`flex flex-col items-center justify-center py-1 px-2.5 min-h-[44px] rounded-xl transition-all cursor-pointer ${
            activeMobileTab === "services"
              ? "text-slate-900 font-bold bg-slate-100/90 shadow-2xs"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span className="text-[10px] mt-0.5">
            {language === "hi" ? "सेवाएं" : "Services"}
          </span>
        </button>

        {/* Unified Alerts Tab (Police Advisory + Citizen Jam Reports) */}
        <button
          onClick={() => switchMobileTabWithLoader("feed")}
          className={`flex flex-col items-center justify-center py-1 px-2.5 min-h-[44px] rounded-xl transition-all relative cursor-pointer ${
            activeMobileTab === "feed" || activeMobileTab === "police"
              ? "text-slate-900 font-bold bg-slate-100/90 shadow-2xs"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <Radio className="w-4 h-4" />
          <span className="text-[10px] mt-0.5">
            {language === "hi" ? "अलर्ट्स" : "Alerts"}
          </span>
          <span className="absolute top-1.5 right-2 w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
        </button>

        {/* Mobile Women Safety SOS Dedicated Page Tab */}
        <button
          onClick={() => switchMobileTabWithLoader("sos")}
          className={`flex flex-col items-center justify-center py-1 px-2.5 min-h-[44px] rounded-xl transition-all cursor-pointer ${
            activeMobileTab === "sos"
              ? "text-rose-700 font-bold bg-rose-50 border border-rose-200/80 shadow-2xs"
              : "text-rose-600 hover:text-rose-700 hover:bg-rose-50/50"
          }`}
          title={
            language === "hi"
              ? "महिला सुरक्षा SOS पेज"
              : "Women Safety SOS Page"
          }
        >
          <div className="relative">
            <ShieldAlert className="w-4 h-4 text-rose-600" />
            <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse" />
          </div>
          <span className="text-[9px] mt-0.5 font-bold text-rose-700">SOS</span>
        </button>
      </nav>

      {/* 1-Minute Simple Guide Explainer Modal */}
      <SimpleExplainerModal
        isOpen={isExplainerModalOpen}
        onClose={() => setIsExplainerModalOpen(false)}
        language={language}
        onSelectTransit={() => {
          if (window.innerWidth >= 1024)
            switchDesktopViewWithLoader("navigator");
          else switchMobileTabWithLoader("route");
        }}
        onSelectServices={() => {
          if (window.innerWidth >= 1024)
            switchDesktopViewWithLoader("services");
          else switchMobileTabWithLoader("services");
        }}
      />

      {/* Fullscreen Initial Opening Splash Animation */}
      {showSplash && (
        <AutoSplashIntro
          cityName={currentCity.name}
          onComplete={() => setShowSplash(false)}
        />
      )}

      {/* Running Auto Rickshaw View/Tab Switch Loading Overlay (Rapido-style floating pill) */}
      {tabTransitionLoading.active && (
        <AutoRunningLoader
          size="floating-pill"
          message={tabTransitionLoading.message}
          subMessage={tabTransitionLoading.subMessage}
          cityName={currentCity.name}
        />
      )}

      {/* Login & Register Authentication Modal */}
      {isAuthModalOpen && (
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          currentUser={currentUser}
          onLoginSuccess={handleLoginSuccess}
          onLogout={handleLogout}
          language={language}
          cityName={currentCity.name}
        />
      )}

      {/* Gold Premium Pass Modal (₹49/month) */}
      <PremiumPassModal
        isOpen={isPremiumModalOpen}
        onClose={() => setIsPremiumModalOpen(false)}
        isPremium={isPremiumPass}
        onActivatePremium={handleActivatePremium}
        language={language}
      />

      {/* Local Store & Clinic Free Promotion Listing Modal */}
      <StorePromotionModal
        isOpen={isStoreModalOpen}
        onClose={() => setIsStoreModalOpen(false)}
        onAddStore={handleAddNewStore}
        cityName={currentCity.name}
        language={language}
      />

      {/* 1. Multi-Lingual AI Voice Assistant Modal */}
      <VoiceAssistantModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        language={language}
        cityName={currentCity.name}
        onSelectRouteQuick={(origName, destName) => {
          const oLoc = currentCity.locations.find(
            (l) =>
              l.name.toLowerCase().includes(origName.toLowerCase()) ||
              l.hindiName.includes(origName)
          );
          const dLoc = currentCity.locations.find(
            (l) =>
              l.name.toLowerCase().includes(destName.toLowerCase()) ||
              l.hindiName.includes(destName)
          );
          if (oLoc) setOrigin(oLoc);
          if (dLoc) setDestination(dLoc);
          setIsVoiceModalOpen(false);
        }}
        onNavigateTab={(tab) => {
          setIsVoiceModalOpen(false);
          if (tab === "sos") {
            if (window.innerWidth >= 1024) switchDesktopViewWithLoader("sos");
            else switchMobileTabWithLoader("sos");
          } else if (tab === "services") {
            if (window.innerWidth >= 1024) switchDesktopViewWithLoader("services");
            else switchMobileTabWithLoader("services");
          } else if (tab === "fare") {
            if (window.innerWidth >= 1024) switchDesktopViewWithLoader("fare");
            else switchMobileTabWithLoader("fare");
          } else {
            if (window.innerWidth >= 1024) switchDesktopViewWithLoader("navigator");
            else switchMobileTabWithLoader(tab);
          }
        }}
        onOpenSos={() => {
          setIsVoiceModalOpen(false);
          if (window.innerWidth >= 1024) switchDesktopViewWithLoader("sos");
          else switchMobileTabWithLoader("sos");
        }}
      />

      {/* 2. Shared Seat Fare Splitter & UPI QR Modal */}
      <FareSplitterUpiModal
        isOpen={isFareSplitterModalOpen}
        onClose={() => setIsFareSplitterModalOpen(false)}
        language={language}
        cityName={currentCity.name}
        defaultFare={routes.find((r) => r.id === selectedRouteId)?.fareEstimate || 15}
      />

      {/* 3. EV Rickshaw Battery Health & Swap Station Radar Modal */}
      <EvBatteryRadarModal
        isOpen={isEvRadarModalOpen}
        onClose={() => setIsEvRadarModalOpen(false)}
        language={language}
        cityName={currentCity.name}
        onNavigateToPoint={(lat, lng, name) => {
          const customDest: BareillyLocation = {
            id: `loc-ev-${Date.now()}`,
            name,
            hindiName: name,
            lat,
            lng,
            category: "erickshaw_stand",
            description: `${name} - EV Swapping & Charging Station`,
            isChokeHazard: false,
            erickshawChargingAvailable: true,
          };
          setDestination(customDest);
          if (window.innerWidth < 1024) setActiveMobileTab("map");
        }}
      />

      {/* 4. Local Auto Stands Directory & Route Matrix Modal */}
      <AutoStandDirectoryModal
        isOpen={isAutoStandModalOpen}
        onClose={() => setIsAutoStandModalOpen(false)}
        language={language}
        cityName={currentCity.name}
        onSelectStandForRoute={(standName) => {
          const matched = currentCity.locations.find(
            (l) =>
              standName.toLowerCase().includes(l.name.toLowerCase()) ||
              l.name.toLowerCase().includes(standName.toLowerCase()) ||
              standName.includes(l.hindiName)
          );
          if (matched) {
            setOrigin(matched);
          }
        }}
      />

      {/* 5. Offline Pocket Mode & Zero-Data Emergency SMS Modal */}
      <OfflinePocketModal
        isOpen={isOfflinePocketModalOpen}
        onClose={() => setIsOfflinePocketModalOpen(false)}
        language={language}
        cityName={currentCity.name}
        userGpsLocation={userGpsLocation}
      />

      {/* Floating Action Button: Quick Voice Assistant (Always accessible) */}
      <button
        onClick={() => setIsVoiceModalOpen(true)}
        className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-40 p-3.5 sm:p-4 rounded-full bg-gradient-to-tr from-amber-500 to-amber-600 text-slate-950 shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center cursor-pointer border-2 border-white ring-4 ring-amber-500/20 group"
        title={language === "hi" ? "बोलकर खोजें (AI Voice Search)" : "AI Voice Search"}
      >
        <span className="relative flex h-2 w-2 absolute -top-0.5 -right-0.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-600"></span>
        </span>
        <Mic className="w-5 h-5 sm:w-6 sm:h-6" />
        <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs transition-all duration-300 ease-in-out text-xs font-black ml-0 group-hover:ml-1.5 text-slate-950">
          {language === "hi" ? "आवाज़ से पूछें" : "Ask by Voice"}
        </span>
      </button>

      {/* Desktop Footer */}
      <footer className="hidden lg:block bg-white border-t border-slate-200 py-3 text-center text-xs text-slate-500 mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between text-[11px]">
          <div>
            <b>E-Rahi India (ई-राही इंडिया)</b> —{" "}
            {language === "hi"
              ? "ई-रिक्शा रूट, किराया व शहर सेवाएं"
              : "Hyperlocal Transit & City Services"}
          </div>
          <div className="flex items-center gap-3 text-slate-500">
            <button
              onClick={() => setIsExplainerModalOpen(true)}
              className="text-amber-700 font-extrabold hover:underline cursor-pointer flex items-center gap-1"
            >
              <HelpCircle className="w-3 h-3 text-amber-600" />
              <span>{language === "hi" ? "💡 आसान गाइड" : "How it works"}</span>
            </button>
            <span>•</span>
            <button
              onClick={() => switchDesktopViewWithLoader("roadmap")}
              className="text-slate-600 hover:text-slate-900 hover:underline cursor-pointer"
            >
              ⚙️{" "}
              {language === "hi"
                ? "4-फेज आर्किटेक्चर (डेवलपर स्पेसिफिकेशन)"
                : "4-Phase Architecture (Developer Spec)"}
            </button>
            <span>•</span>
            <a
              href="https://www.bareillytrafficpolice.in/citizen-services"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              UP Traffic Police
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
