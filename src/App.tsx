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
  LocalStoreClinic,
} from "./types";
import {
  INITIAL_CHOKE_ZONES,
  INITIAL_REPORTS,
  generateRoutePaths,
} from "./data/bareillyData";
import { getCityData } from "./data/indiaCitiesData";
import {
  SAMPLE_HOSPITALS,
  SAMPLE_HOTELS,
  SAMPLE_COLLEGES,
  SAMPLE_LOCAL_STORES,
} from "./data/cityServicesData";
import { TRANSLATIONS } from "./utils/i18n";
import { getTabTransitionMessage } from "./utils/transitionMessages";
import { playHazardWarningChime, triggerHapticBuzz } from "./utils/audioAlerts";

// Navigation & Interactive Layout Components
import { AppHeader, DesktopView } from "./components/AppHeader";
import { MobileBottomNav, MobileTab } from "./components/MobileBottomNav";
import { ReportDetailModal } from "./components/ReportDetailModal";
import { VoiceFloatingButton } from "./components/VoiceFloatingButton";
import { StateCitySelector } from "./components/StateCitySelector";
import { BareillyMap } from "./components/BareillyMap";
import { RoutePlanner } from "./components/RoutePlanner";
import { LiveRideDashboard } from "./components/LiveRideDashboard";
import { ErickshawDriverCockpit } from "./components/ErickshawDriverCockpit";
import { ReportsFeed } from "./components/ReportsFeed";
import { TrafficPoliceAdvisoryBanner } from "./components/TrafficPoliceAdvisoryBanner";
import { FestivalPoliceBulletin } from "./components/FestivalPoliceBulletin";

// Dedicated City Hub Views
import { WomenSafetyPage } from "./components/WomenSafetyPage";
import { CityServicesDirectory } from "./components/CityServicesDirectory";
import { BareillyFareCalculator } from "./components/BareillyFareCalculator";
import { ArchitectureRoadmapConsole } from "./components/ArchitectureRoadmapConsole";

// Overlay Dialogs & Modals
import { AutoSplashIntro } from "./components/AutoSplashIntro";
import { AutoRunningLoader } from "./components/AutoRunningLoader";
import { AuthModal } from "./components/AuthModal";
import { PremiumPassModal } from "./components/PremiumPassModal";
import { StorePromotionModal } from "./components/StorePromotionModal";
import { SimpleExplainerModal } from "./components/SimpleExplainerModal";
import { VoiceAssistantModal } from "./components/VoiceAssistantModal";
import { CrowdsourceModal } from "./components/CrowdsourceModal";
import { CitizenComplaintModal } from "./components/CitizenComplaintModal";
import { MobileAppInstallModal } from "./components/MobileAppInstallModal";

// Essential Icons
import { MapPin, ShieldAlert, HelpCircle } from "lucide-react";

export default function App() {
  // ==========================================
  // 1. Geographic State & Active City
  // ==========================================
  const [selectedStateId, setSelectedStateId] = useState<string>("up");
  const [selectedCityId, setSelectedCityId] = useState<string>("bareilly");

  const currentCity = useMemo(() => {
    return getCityData(selectedStateId, selectedCityId);
  }, [selectedStateId, selectedCityId]);

  // Origin and destination points (defaults to city default anchors)
  const [origin, setOrigin] = useState<BareillyLocation>(() => {
    const init = getCityData("up", "bareilly");
    return init.locations.find((l) => l.id === init.defaultOriginId) || init.locations[0];
  });
  const [destination, setDestination] = useState<BareillyLocation>(() => {
    const init = getCityData("up", "bareilly");
    return init.locations.find((l) => l.id === init.defaultDestId) || init.locations[1];
  });

  // ==========================================
  // 2. User Mode & Traffic Data
  // ==========================================
  const [userMode, setUserMode] = useState<UserMode>("commuter");
  const [chokeZones, setChokeZones] = useState<ChokeZoneInfo[]>(INITIAL_CHOKE_ZONES);
  const [reports, setReports] = useState<TrafficReport[]>(INITIAL_REPORTS);
  const [routes, setRoutes] = useState<RouteOption[]>([]);
  const [selectedRouteId, setSelectedRouteId] = useState<string>("route-smart-bypass");
  const [clickedCoords, setClickedCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedReportDetail, setSelectedReportDetail] = useState<TrafficReport | null>(null);

  // Map display layers & AI advice state
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [showChargingStations, setShowChargingStations] = useState(false);
  const [aiAdvice, setAiAdvice] = useState<AIRouteAdvice | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);

  // ==========================================
  // 3. User Authentication & Profile
  // ==========================================
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem("erahi_user_profile");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // E-Rahi Gold Pass state (saved locally)
  const [isPremiumPass, setIsPremiumPass] = useState<boolean>(() => {
    try {
      return localStorage.getItem("erahi_is_premium") === "true";
    } catch {
      return false;
    }
  });

  // Local community store listings
  const [promotedStores, setPromotedStores] = useState<LocalStoreClinic[]>(() => {
    try {
      const saved = localStorage.getItem("erahi_custom_stores");
      return saved ? [...SAMPLE_LOCAL_STORES, ...JSON.parse(saved)] : SAMPLE_LOCAL_STORES;
    } catch {
      return SAMPLE_LOCAL_STORES;
    }
  });

  // App language setting (English, Hindi, Urdu)
  const [language, setLanguage] = useState<AppLanguage>(() => {
    try {
      const saved = localStorage.getItem("erahi_language");
      return saved === "hi" || saved === "ur" || saved === "en" ? saved : "en";
    } catch {
      return "en";
    }
  });
  const t = TRANSLATIONS[language];

  // ==========================================
  // 4. Modal Visibility Toggles
  // ==========================================
  const [showSplash, setShowSplash] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false);
  const [isStoreModalOpen, setIsStoreModalOpen] = useState(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isFareModalOpen, setIsFareModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isComplaintModalOpen, setIsComplaintModalOpen] = useState(false);
  const [isExplainerModalOpen, setIsExplainerModalOpen] = useState(false);
  const [isMobileInstallModalOpen, setIsMobileInstallModalOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  // Animated view transition state
  const [tabTransitionLoading, setTabTransitionLoading] = useState({
    active: false,
    message: "",
    subMessage: "",
  });

  // Active view: Desktop view vs Mobile tab
  const [desktopView, setDesktopView] = useState<DesktopView>("navigator");
  const [activeMobileTab, setActiveMobileTab] = useState<MobileTab>("map");

  // ==========================================
  // 5. GPS & Active Ride State
  // ==========================================
  const [userGpsLocation, setUserGpsLocation] = useState<{ lat: number; lng: number } | null>(null);
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

  // Recalculate routes whenever origin, destination, or mode changes
  useEffect(() => {
    const generated = generateRoutePaths(origin, destination, userMode);
    setRoutes(generated);
    setSelectedRouteId(generated[0]?.id || "route-smart-bypass");
  }, [origin, destination, userMode]);

  const currentSelectedRoute = useMemo(() => {
    return routes.find((r) => r.id === selectedRouteId) || routes[0];
  }, [routes, selectedRouteId]);

  // Fetch incident reports from server (with graceful local fallback)
  const fetchReports = async () => {
    try {
      const res = await fetch("/api/reports");
      if (res.ok) {
        const data = await res.json();
        if (data.reports && Array.isArray(data.reports)) {
          setReports(data.reports);
        }
      }
    } catch {
      // Retain local state
    }
  };

  useEffect(() => {
    fetchReports();
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
  }, []);

  // Clean up ride intervals on unmount
  useEffect(() => {
    return () => {
      if (rideIntervalRef.current) clearInterval(rideIntervalRef.current);
      if (watchGpsIdRef.current !== null) navigator.geolocation.clearWatch(watchGpsIdRef.current);
    };
  }, []);

  // ==========================================
  // 6. Navigation & View Switchers
  // ==========================================
  const switchMobileTabWithLoader = (tab: MobileTab) => {
    if (tab === activeMobileTab) return;
    const info = getTabTransitionMessage(tab, language, currentCity.name);
    setTabTransitionLoading({ active: true, message: info.message, subMessage: info.subMessage });
    setActiveMobileTab(tab);
    setTimeout(() => {
      setTabTransitionLoading({ active: false, message: "", subMessage: "" });
    }, 280);
  };

  const switchDesktopViewWithLoader = (view: DesktopView) => {
    if (view === desktopView) return;
    const info = getTabTransitionMessage(view, language, currentCity.name);
    setTabTransitionLoading({ active: true, message: info.message, subMessage: info.subMessage });
    setDesktopView(view);

    // Synchronize mobile equivalent tab
    if (view === "navigator") setActiveMobileTab("map");
    else if (view === "fare") setActiveMobileTab("fare");
    else if (view === "services") setActiveMobileTab("services");
    else if (view === "sos") setActiveMobileTab("sos");
    else if (view === "roadmap") setActiveMobileTab("roadmap");

    setTimeout(() => {
      setTabTransitionLoading({ active: false, message: "", subMessage: "" });
    }, 280);
  };

  const handleSelectStateAndCity = (stateId: string, cityId: string) => {
    const newCity = getCityData(stateId, cityId);
    setTabTransitionLoading({
      active: true,
      message: `${newCity.name} स्मार्ट ग्रिड लोड हो रहा है...`,
      subMessage: `Connecting to ${newCity.name} (${newCity.stateName}) traffic network`,
    });

    setSelectedStateId(stateId);
    setSelectedCityId(cityId);
    setOrigin(newCity.locations.find((l) => l.id === newCity.defaultOriginId) || newCity.locations[0]);
    setDestination(newCity.locations.find((l) => l.id === newCity.defaultDestId) || newCity.locations[1]);
    setChokeZones(newCity.chokeZones);
    if (newCity.reports.length > 0) setReports(newCity.reports);

    setTimeout(() => {
      setTabTransitionLoading({ active: false, message: "", subMessage: "" });
    }, 280);
  };

  const handleSetLanguage = (lang: AppLanguage) => {
    setLanguage(lang);
    try {
      localStorage.setItem("erahi_language", lang);
    } catch {}
  };

  // ==========================================
  // 7. Live Ride & GPS Handlers
  // ==========================================
  const handleStopRide = () => {
    if (rideIntervalRef.current) {
      clearInterval(rideIntervalRef.current);
      rideIntervalRef.current = null;
    }
    if (watchGpsIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchGpsIdRef.current);
      watchGpsIdRef.current = null;
    }
    setLiveRideState((prev) => ({ ...prev, isActive: false, isInsideAuto: false }));
  };

  const handleStartRide = () => {
    handleStopRide();
    if (!currentSelectedRoute?.pathPoints?.length) return;

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
      currentStepInstruction: currentSelectedRoute.stepInstructions[0] || "ऑटो में सफ़र शुरू हुआ",
      nextChokepointAhead: chokeZones[0]?.name,
      isInsideAuto: true,
      startedAt: Date.now(),
    });

    if (window.innerWidth < 1024) setActiveMobileTab("map");

    rideIntervalRef.current = setInterval(() => {
      currentIdx += 1;
      if (currentIdx >= totalPts) {
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
      const remainingDist = parseFloat((totalDist * (1 - progressRatio)).toFixed(1));
      const remainingTime = Math.max(1, Math.round(totalDur * (1 - progressRatio)));
      const pct = Math.min(100, Math.round(progressRatio * 100));
      const steps = currentSelectedRoute.stepInstructions;
      const stepIdx = Math.min(steps.length - 1, Math.floor(progressRatio * steps.length));
      const dynamicSpeed = pct > 40 && pct < 60 ? 12 : Math.floor(18 + Math.random() * 6);

      setLiveRideState((prev) => ({
        ...prev,
        currentLocation: { lat: point[0], lng: point[1] },
        progressPercent: pct,
        distanceRemainingKm: remainingDist,
        timeRemainingMin: remainingTime,
        speedKmh: dynamicSpeed,
        currentStepIndex: stepIdx,
        currentStepInstruction: steps[stepIdx] || `मंज़िल ${destination.name} की ओर अग्रसर`,
      }));
    }, 2200);
  };

  const handleTrackRealGps = () => {
    if (!("geolocation" in navigator)) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserGpsLocation({ lat: latitude, lng: longitude });
        setUserGpsAvailable(true);

        const destLat = destination.lat;
        const destLng = destination.lng;
        const R = 6371;
        const dLat = ((destLat - latitude) * Math.PI) / 180;
        const dLon = ((destLng - longitude) * Math.PI) / 180;
        const a =
          Math.sin(dLat / 2) ** 2 +
          Math.cos((latitude * Math.PI) / 180) * Math.cos((destLat * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
        const distKm = parseFloat((R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(1));
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

        if (window.innerWidth < 1024) setActiveMobileTab("map");
      },
      () => handleStartRide(),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // ==========================================
  // 8. Community Incidents & Reports Handlers
  // ==========================================
  const handleInspectReport = (rep: TrafficReport) => {
    setSelectedReportDetail(rep);
    playHazardWarningChime();
    triggerHapticBuzz([150, 80, 150]);
  };

  const handleSubmitReport = async (newReportData: any) => {
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
          fetchReports();
          return;
        }
      }
    } catch {}

    const localReport: TrafficReport = {
      ...newReportData,
      id: `rep-${Date.now()}`,
      upvotes: 1,
      downvotes: 0,
      reportedAt: new Date().toISOString(),
    };
    setReports((prev) => [localReport, ...prev]);
  };

  const handleVoteReport = async (reportId: string, type: "up" | "cleared") => {
    setReports((prev) =>
      prev.map((rep) => {
        if (rep.id === reportId) {
          if (type === "up") return { ...rep, upvotes: rep.upvotes + 1 };
          if (type === "cleared") return { ...rep, severity: "clearing", upvotes: rep.upvotes + 3 };
        }
        return rep;
      })
    );

    try {
      await fetch(`/api/reports/${reportId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
      });
      fetchReports();
    } catch {}
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
        if (data.advice) setAiAdvice(data.advice);
      }
    } catch {
      setAiAdvice({
        headline: userMode === "driver" ? "Smart E-Rickshaw Gali Bypass" : "Commuter Peak Avoidance Detour",
        recommendedRoute: `Take Shahamatganj Flyover & Civil Lines link road to avoid Chowk and Koharapeer`,
        avoidHotspots: ["Chowk Narrow Gali Jam", "Koharapeer Central Chauraha"],
        estimatedTimeMin: 18,
        standardTimeMin: 37,
        timeSavedMin: 19,
        trafficPoliceAdvisory: "Kutubkhana inner market restricted for unregistered e-rickshaws. Use designated bypass corridors.",
        hindiAlert: "कोहाड़ापीर और चौक में भारी ई-रिक्शा जाम है। शाहमतगंज बाईपास से जाएं, 19 मिनट बचेंगे।",
      });
    } finally {
      setIsLoadingAi(false);
    }
  };

  // ==========================================
  // 9. Premium & Promotions Handlers
  // ==========================================
  const handleActivatePremium = () => {
    setIsPremiumPass(true);
    try {
      localStorage.setItem("erahi_is_premium", "true");
    } catch {}
    if (currentUser) {
      setCurrentUser({ ...currentUser, isPremium: true });
    }
  };

  const handleAddNewStore = (newStore: LocalStoreClinic) => {
    setPromotedStores((prev) => {
      const updated = [newStore, ...prev];
      try {
        localStorage.setItem("erahi_custom_stores", JSON.stringify([newStore]));
      } catch {}
      return updated;
    });
  };

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") setDeferredPrompt(null);
    } else {
      alert("To install: Tap your browser's share icon (iOS Safari) or menu (Chrome) and select 'Add to Home Screen'!");
    }
  };

  // ==========================================
  // RENDER UI
  // ==========================================
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans pb-24 lg:pb-0 selection:bg-amber-100 selection:text-amber-900">
      {/* Top Header Navbar */}
      <AppHeader
        currentCity={currentCity}
        desktopView={desktopView}
        activeMobileTab={activeMobileTab}
        language={language}
        currentUser={currentUser}
        isPremiumPass={isPremiumPass}
        t={t}
        onSwitchDesktopView={switchDesktopViewWithLoader}
        onSwitchMobileTab={switchMobileTabWithLoader}
        onSetLanguage={handleSetLanguage}
        onOpenReportModal={() => {
          setClickedCoords(null);
          setIsReportModalOpen(true);
        }}
        onOpenVoiceModal={() => setIsVoiceModalOpen(true)}
        onOpenExplainerModal={() => setIsExplainerModalOpen(true)}
        onOpenComplaintModal={() => setIsComplaintModalOpen(true)}
        onOpenPremiumModal={() => setIsPremiumModalOpen(true)}
        onOpenStoreModal={() => setIsStoreModalOpen(true)}
        onOpenMobileInstallModal={() => setIsMobileInstallModalOpen(true)}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
      />

      {/* 4 Dedicated Search Bars: State ➔ City ➔ From ➔ To */}
      {(desktopView === "navigator" || desktopView === "fare") &&
        ["map", "route", "cockpit", "fare"].includes(activeMobileTab) && (
          <StateCitySelector
            selectedStateId={selectedStateId}
            selectedCityId={selectedCityId}
            onSelectStateAndCity={handleSelectStateAndCity}
            availableLocations={currentCity.locations}
            selectedOrigin={origin}
            selectedDestination={destination}
            onSelectOrigin={setOrigin}
            onSelectDestination={(loc) => {
              setDestination(loc);
              if (window.innerWidth < 1024) setActiveMobileTab("map");
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
        {/* Mobile Commuter / Driver Mode Switcher */}
        {["map", "route", "cockpit", "fare"].includes(activeMobileTab) && (
          <div className="lg:hidden mb-3">
            <div className="flex items-center bg-white p-1 rounded-xl border border-slate-200 shadow-xs mb-2">
              <button
                onClick={() => setUserMode("commuter")}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all text-center min-h-[44px] flex items-center justify-center gap-1.5 ${
                  userMode === "commuter" ? "bg-slate-900 text-white shadow-xs" : "text-slate-600"
                }`}
              >
                <span>🚶</span>
                <span>{t.commuterMode}</span>
              </button>
              <button
                onClick={() => setUserMode("driver")}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all text-center min-h-[44px] flex items-center justify-center gap-1.5 ${
                  userMode === "driver" ? "bg-amber-500 text-white shadow-xs" : "text-slate-600"
                }`}
              >
                <span>🛺</span>
                <span>{t.driverMode}</span>
              </button>
            </div>
          </div>
        )}

        {/* View Routing: SOS Hub | Services Hub | Fare Rates Hub | Roadmap | Dual-Pane Transit */}
        {(desktopView === "sos" && window.innerWidth >= 1024) || activeMobileTab === "sos" ? (
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
                setDestination({
                  id: `loc-police-${Date.now()}`,
                  name,
                  hindiName: name,
                  lat,
                  lng,
                  category: "police_station",
                  description: `${name} - Police Facility`,
                  isChokeHazard: false,
                });
                switchDesktopViewWithLoader("navigator");
                switchMobileTabWithLoader("map");
              }}
            />
          </div>
        ) : (desktopView === "services" && window.innerWidth >= 1024) || activeMobileTab === "services" ? (
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
                setDestination({
                  id: `loc-service-${Date.now()}`,
                  name,
                  hindiName: name,
                  lat,
                  lng,
                  category: "hospital",
                  description: `${name} - City Landmark`,
                  isChokeHazard: false,
                });
                switchDesktopViewWithLoader("navigator");
                switchMobileTabWithLoader("map");
              }}
            />
          </div>
        ) : (desktopView === "fare" && window.innerWidth >= 1024) || activeMobileTab === "fare" ? (
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
                  setOrigin({
                    id: fromLoc.id,
                    name: fromLoc.name,
                    hindiName: fromLoc.hindiName,
                    lat: fromLoc.lat,
                    lng: fromLoc.lng,
                    category: (fromLoc.category as any) || "station",
                    description: `${fromLoc.name} Transit Point`,
                    isChokeHazard: false,
                  });
                }
                if (toLoc) {
                  setDestination({
                    id: toLoc.id,
                    name: toLoc.name,
                    hindiName: toLoc.hindiName,
                    lat: toLoc.lat,
                    lng: toLoc.lng,
                    category: (toLoc.category as any) || "station",
                    description: `${toLoc.name} Transit Point`,
                    isChokeHazard: false,
                  });
                }
                switchDesktopViewWithLoader("navigator");
                switchMobileTabWithLoader("map");
              }}
            />
          </div>
        ) : (desktopView === "roadmap" && window.innerWidth >= 1024) || activeMobileTab === "roadmap" ? (
          <div className="space-y-4">
            <ArchitectureRoadmapConsole
              language={language}
              onLanguageChange={setLanguage}
              onSimulateSpikeSuccess={fetchReports}
            />
          </div>
        ) : (
          /* Standard Live Transit Dual-Pane Layout */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Left Column: Route Planner & Driver Cockpit */}
            <div
              className={`space-y-4 flex-col lg:col-span-5 ${
                activeMobileTab === "route" || activeMobileTab === "cockpit" ? "flex" : "hidden lg:flex"
              }`}
            >
              {/* Women Safety Emergency SOS Quick Trigger */}
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
                    if (window.innerWidth < 1024) switchMobileTabWithLoader("sos");
                    else switchDesktopViewWithLoader("sos");
                  }}
                  className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-2xs transition-all active:scale-95 shrink-0 flex items-center gap-1 cursor-pointer min-h-[36px]"
                >
                  <span>{language === "hi" ? "🚨 SOS खोलें" : "🚨 Open SOS"}</span>
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
                    onSwapLocations={() => {
                      const temp = origin;
                      setOrigin(destination);
                      setDestination(temp);
                    }}
                    routes={routes}
                    selectedRouteId={selectedRouteId}
                    onSelectRoute={(id) => {
                      setSelectedRouteId(id);
                      if (window.innerWidth < 1024) setActiveMobileTab("map");
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

              {/* Driver Cockpit */}
              {(userMode === "driver" || activeMobileTab === "cockpit") && (
                <ErickshawDriverCockpit
                  onQuickReportJam={(laneName) => {
                    handleSubmitReport({
                      locationName: laneName,
                      category: "heavy_jam",
                      severity: "high",
                      title: `${laneName} Chokepoint Alert`,
                      description: `Reported by active driver: Standstill traffic in ${laneName}.`,
                      avoidanceTip: "Use parallel residential lane bypass.",
                      coordinates: [origin.lat, origin.lng],
                      userType: "erickshaw_driver",
                    });
                  }}
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

            {/* Right Column: Interactive Map, Alerts & Bulletins */}
            <div
              className={`space-y-4 flex-col lg:col-span-7 ${
                activeMobileTab === "map" || activeMobileTab === "feed" || activeMobileTab === "police"
                  ? "flex"
                  : "hidden lg:flex"
              }`}
            >
              {(activeMobileTab === "map" || window.innerWidth >= 1024) && (
                <div className="space-y-2">
                  {/* Map Layer Controls Bar */}
                  <div className="bg-white rounded-xl border border-slate-200 p-2.5 shadow-xs flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 text-xs">
                      <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                      <span className="font-bold text-slate-800">
                        {currentCity.name} {language === "hi" ? "मानचित्र" : "Map"}
                      </span>
                      <span className="hidden sm:inline text-slate-400 text-[11px] font-medium">
                        • {currentCity.locations.slice(0, 3).map((l) => l.name.split(" ")[0]).join(" / ")}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setShowHeatmap(!showHeatmap)}
                        className={`text-[11px] font-semibold px-2 py-1 rounded-lg border transition-all cursor-pointer ${
                          showHeatmap
                            ? "bg-amber-100 text-amber-900 border-amber-300"
                            : "bg-slate-50 text-slate-600 border-slate-200"
                        }`}
                      >
                        🔥 {language === "hi" ? "जाम हीटमैप" : "Choke Heat"}
                      </button>

                      <button
                        onClick={() => setShowChargingStations(!showChargingStations)}
                        className={`text-[11px] font-semibold px-2 py-1 rounded-lg border transition-all cursor-pointer ${
                          showChargingStations
                            ? "bg-emerald-100 text-emerald-900 border-emerald-300"
                            : "bg-slate-50 text-slate-600 border-slate-200"
                        }`}
                      >
                        ⚡ {language === "hi" ? "चार्जिंग हब" : "EV Hubs"}
                      </button>
                    </div>
                  </div>

                  {/* Leaflet Map Canvas */}
                  <div className="h-[380px] sm:h-[450px] lg:h-[480px] w-full">
                    <BareillyMap
                      origin={origin}
                      destination={destination}
                      routes={routes}
                      selectedRouteId={selectedRouteId}
                      onSelectRoute={setSelectedRouteId}
                      chokeZones={chokeZones}
                      reports={reports}
                      onMapClickReport={(lat, lng) => {
                        setClickedCoords({ lat, lng });
                        setIsReportModalOpen(true);
                      }}
                      onSelectReport={handleInspectReport}
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

                  {/* Live Auto Ride HUD Notification when Ride Active */}
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
                              <b className="text-emerald-400">{liveRideState.distanceRemainingKm} km</b>
                            </span>
                            <span>•</span>
                            <span>
                              {language === "hi" ? "समय:" : "ETA:"}{" "}
                              <b className="text-amber-400">~{liveRideState.timeRemainingMin} min</b>
                            </span>
                            <span>•</span>
                            <span>
                              {language === "hi" ? "स्पीड:" : "Speed:"}{" "}
                              <b className="text-sky-300">{liveRideState.speedKmh} km/h</b>
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

              {/* Traffic Police Notices */}
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

              {/* Community Reports Feed */}
              {(activeMobileTab === "feed" || window.innerWidth >= 1024) && (
                <ReportsFeed
                  reports={reports}
                  onVoteReport={handleVoteReport}
                  onFocusReportOnMap={(rep) => {
                    handleInspectReport(rep);
                    if (window.innerWidth < 1024) setActiveMobileTab("map");
                  }}
                  onOpenReportModal={() => {
                    setClickedCoords(null);
                    setIsReportModalOpen(true);
                  }}
                  language={language}
                  cityName={currentCity.name}
                />
              )}
            </div>
          </div>
        )}
      </main>

      {/* Floating Action Button: AI Voice Assistant */}
      <VoiceFloatingButton language={language} onClick={() => setIsVoiceModalOpen(true)} />

      {/* Mobile Touch-Optimized Bottom Navigation Bar */}
      <MobileBottomNav
        activeMobileTab={activeMobileTab}
        language={language}
        onSwitchTab={switchMobileTabWithLoader}
      />

      {/* Report Detail & Upvoting Dialog */}
      <ReportDetailModal
        report={selectedReportDetail}
        language={language}
        onClose={() => setSelectedReportDetail(null)}
        onVote={(id, type) => {
          handleVoteReport(id, type);
          setSelectedReportDetail(null);
        }}
      />

      {/* Floating View Switch Loading Indicator */}
      {tabTransitionLoading.active && (
        <AutoRunningLoader
          size="floating-pill"
          message={tabTransitionLoading.message}
          subMessage={tabTransitionLoading.subMessage}
          cityName={currentCity.name}
        />
      )}

      {/* App Intro Splash Screen */}
      {showSplash && (
        <AutoSplashIntro cityName={currentCity.name} onComplete={() => setShowSplash(false)} />
      )}

      {/* User Auth Modal */}
      {isAuthModalOpen && (
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          currentUser={currentUser}
          onLoginSuccess={(user) => {
            setCurrentUser(user);
            try {
              localStorage.setItem("erahi_user_profile", JSON.stringify(user));
            } catch {}
            if (user.role === "driver") setUserMode("driver");
            else if (user.role === "commuter") setUserMode("commuter");
          }}
          onLogout={() => {
            setCurrentUser(null);
            try {
              localStorage.removeItem("erahi_user_profile");
            } catch {}
          }}
          language={language}
          cityName={currentCity.name}
        />
      )}

      {/* Gold Premium Pass Modal */}
      <PremiumPassModal
        isOpen={isPremiumModalOpen}
        onClose={() => setIsPremiumModalOpen(false)}
        isPremium={isPremiumPass}
        onActivatePremium={handleActivatePremium}
        language={language}
      />

      {/* Store Listing Modal */}
      <StorePromotionModal
        isOpen={isStoreModalOpen}
        onClose={() => setIsStoreModalOpen(false)}
        onAddStore={handleAddNewStore}
        cityName={currentCity.name}
        language={language}
      />

      {/* Multi-Lingual AI Voice Assistant Modal */}
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

      {/* City Fare Calculator Dialog */}
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

      {/* Report Jam Modal */}
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

      {/* Citizen Grievance & Complaint Desk Modal */}
      {isComplaintModalOpen && (
        <CitizenComplaintModal
          isOpen={isComplaintModalOpen}
          onClose={() => setIsComplaintModalOpen(false)}
          cityName={currentCity.name}
          defaultCoords={currentCity.center}
          language={language}
          onComplaintSubmitted={fetchReports}
        />
      )}

      {/* 1-Minute App Guide Modal */}
      <SimpleExplainerModal
        isOpen={isExplainerModalOpen}
        onClose={() => setIsExplainerModalOpen(false)}
        language={language}
        onSelectTransit={() => {
          if (window.innerWidth >= 1024) switchDesktopViewWithLoader("navigator");
          else switchMobileTabWithLoader("route");
        }}
        onSelectServices={() => {
          if (window.innerWidth >= 1024) switchDesktopViewWithLoader("services");
          else switchMobileTabWithLoader("services");
        }}
      />

      {/* Mobile App Install Modal */}
      {isMobileInstallModalOpen && (
        <MobileAppInstallModal
          isOpen={isMobileInstallModalOpen}
          onClose={() => setIsMobileInstallModalOpen(false)}
          language={language}
          onInstallClick={handleInstallClick}
          deferredPromptAvailable={!!deferredPrompt}
        />
      )}

      {/* Desktop Clean Footer */}
      <footer className="hidden lg:block bg-white border-t border-slate-200 py-3 text-center text-xs text-slate-500 mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between text-[11px]">
          <div>
            <b>E-Rahi India (ई-राही इंडिया)</b> —{" "}
            {language === "hi" ? "ई-रिक्शा रूट, किराया व शहर सेवाएं" : "Hyperlocal Transit & City Services"}
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
              ⚙️ {language === "hi" ? "4-फेज आर्किटेक्चर (डेवलपर स्पेसिफिकेशन)" : "4-Phase Architecture (Developer Spec)"}
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
