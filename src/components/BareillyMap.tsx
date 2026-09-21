import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  Layers, 
  Maximize2, 
  Minimize2, 
  Plus, 
  Minus, 
  Navigation, 
  Crosshair, 
  Compass, 
  Zap, 
  Flame, 
  ShieldAlert, 
  Volume2, 
  MapPin,
  Sparkles,
  RotateCcw
} from 'lucide-react';
import { BareillyLocation, ChokeZoneInfo, RouteOption, TrafficReport, LiveRideState, AppLanguage } from '../types';
import { TRANSLATIONS } from '../utils/i18n';

interface BareillyMapProps {
  origin: BareillyLocation;
  destination: BareillyLocation;
  routes: RouteOption[];
  selectedRouteId: string;
  onSelectRoute: (id: string) => void;
  chokeZones: ChokeZoneInfo[];
  reports: TrafficReport[];
  onMapClickReport?: (lat: number, lng: number) => void;
  onSelectReport: (report: TrafficReport) => void;
  showHeatmap: boolean;
  showChargingStations: boolean;
  userMode: 'commuter' | 'driver';
  cityName?: string;
  cityCenter?: { lat: number; lng: number };
  liveRideState?: LiveRideState;
  userGpsLocation?: { lat: number; lng: number } | null;
  onGpsLocateSuccess?: (pos: { lat: number; lng: number }) => void;
  onOpenComplaintModal?: () => void;
  language?: AppLanguage;
}

type MapTheme = 'google-streets' | 'google-hybrid' | 'google-terrain' | 'osm' | 'dark';

export const BareillyMap: React.FC<BareillyMapProps> = ({
  origin,
  destination,
  routes,
  selectedRouteId,
  onSelectRoute,
  chokeZones,
  reports,
  onMapClickReport,
  onSelectReport,
  showHeatmap,
  showChargingStations,
  userMode,
  cityName = 'Bareilly',
  cityCenter = { lat: 28.3620, lng: 79.4200 },
  liveRideState,
  userGpsLocation,
  onGpsLocateSuccess,
  onOpenComplaintModal,
  language = 'en'
}) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;
  const isHindi = language === 'hi';
  
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const baseTileLayerRef = useRef<L.TileLayer | null>(null);
  const satelliteLabelsLayerRef = useRef<L.TileLayer | null>(null);
  
  const routeLayersRef = useRef<L.LayerGroup | null>(null);
  const markerLayersRef = useRef<L.LayerGroup | null>(null);
  const chokeLayersRef = useRef<L.LayerGroup | null>(null);
  const liveVehicleLayerRef = useRef<L.LayerGroup | null>(null);
  const userGpsLayerRef = useRef<L.LayerGroup | null>(null);

  const [mapTheme, setMapTheme] = useState<MapTheme>('google-streets');
  const [isLayerMenuOpen, setIsLayerMenuOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [currentZoom, setCurrentZoom] = useState(14);
  const [showLiveTrafficOverlay, setShowLiveTrafficOverlay] = useState(true);

  // Define Google-like Map Tiles with vivid street colors & labels
  const getTileConfig = (theme: MapTheme) => {
    const commonOpts = {
      keepBuffer: 8,
      updateWhenIdle: false,
      updateWhenZooming: false,
      crossOrigin: true
    };

    switch (theme) {
      case 'google-hybrid':
        return {
          url: 'https://mt{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
          options: {
            attribution: '&copy; Google Maps',
            subdomains: ['0', '1', '2', '3'],
            maxZoom: 20,
            ...commonOpts
          },
          hasOverlay: false
        };
      case 'google-terrain':
        return {
          url: 'https://mt{s}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}',
          options: {
            attribution: '&copy; Google Maps',
            subdomains: ['0', '1', '2', '3'],
            maxZoom: 20,
            ...commonOpts
          },
          hasOverlay: false
        };
      case 'osm':
        return {
          url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
          options: {
            attribution: '&copy; OpenStreetMap contributors',
            maxZoom: 19,
            ...commonOpts
          },
          hasOverlay: false
        };
      case 'dark':
        return {
          url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
          options: {
            attribution: '&copy; OpenStreetMap &copy; CARTO',
            subdomains: 'abcd',
            maxZoom: 20,
            ...commonOpts
          },
          hasOverlay: false
        };
      case 'google-streets':
      default:
        return {
          url: 'https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
          options: {
            attribution: '&copy; Google Maps',
            subdomains: ['0', '1', '2', '3'],
            maxZoom: 20,
            ...commonOpts
          },
          hasOverlay: false
        };
    }
  };

  // Initialize Map with Google Maps-style smooth physics & animations
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [cityCenter.lat || 28.3620, cityCenter.lng || 79.4200],
      zoom: 14,
      zoomControl: false,
      zoomSnap: 0.25,
      zoomDelta: 0.5,
      wheelDebounceTime: 25,
      wheelPxPerZoomLevel: 120,
      inertia: true,
      inertiaDeceleration: 3200,
      inertiaMaxSpeed: 2400,
      easeLinearity: 0.15,
      fadeAnimation: true,
      zoomAnimation: true,
      zoomAnimationThreshold: 5,
      markerZoomAnimation: true,
      touchZoom: true,
      bounceAtZoomLimits: false
    });

    const tileConf = getTileConfig('google-streets');
    const primaryTileLayer = L.tileLayer(tileConf.url, tileConf.options);

    // Fallback if Google tile network is restricted
    const fallbackTileLayer = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
      keepBuffer: 6
    });

    primaryTileLayer.on('tileerror', () => {
      if (!map.hasLayer(fallbackTileLayer)) {
        fallbackTileLayer.addTo(map);
      }
    });

    primaryTileLayer.addTo(map);
    baseTileLayerRef.current = primaryTileLayer;

    // Layer groups for clean rendering
    routeLayersRef.current = L.layerGroup().addTo(map);
    markerLayersRef.current = L.layerGroup().addTo(map);
    chokeLayersRef.current = L.layerGroup().addTo(map);
    liveVehicleLayerRef.current = L.layerGroup().addTo(map);
    userGpsLayerRef.current = L.layerGroup().addTo(map);

    map.on('zoomend', () => {
      setCurrentZoom(Math.round(map.getZoom() * 10) / 10);
    });

    mapInstanceRef.current = map;

    // Trigger multi-phase resize invalidations for smooth initial render
    const t1 = setTimeout(() => map.invalidateSize(), 150);
    const t2 = setTimeout(() => map.invalidateSize(), 400);

    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
    });
    resizeObserver.observe(mapContainerRef.current);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      resizeObserver.disconnect();
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Switch Tile Theme smoothly
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (baseTileLayerRef.current) {
      map.removeLayer(baseTileLayerRef.current);
    }
    if (satelliteLabelsLayerRef.current) {
      map.removeLayer(satelliteLabelsLayerRef.current);
      satelliteLabelsLayerRef.current = null;
    }

    const tileConf = getTileConfig(mapTheme);
    const newBase = L.tileLayer(tileConf.url, tileConf.options);

    newBase.on('tileerror', () => {
      const fallback = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 });
      if (!map.hasLayer(fallback)) fallback.addTo(map);
    });

    newBase.addTo(map);
    baseTileLayerRef.current = newBase;
    newBase.bringToBack();
  }, [mapTheme]);

  // Center/Fly to city smoothly when center changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !cityCenter) return;
    map.flyTo([cityCenter.lat, cityCenter.lng], 14, {
      animate: true,
      duration: 1.2,
      easeLinearity: 0.2
    });
  }, [cityCenter?.lat, cityCenter?.lng, cityName]);

  // Update Choke Zones & Bottleneck Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    const chokeLayer = chokeLayersRef.current;
    if (!map || !chokeLayer) return;

    chokeLayer.clearLayers();

    if (showLiveTrafficOverlay) {
      chokeZones.forEach((cz) => {
        const isDeadlock = cz.congestionScore > 80;
        const sizeClass = isDeadlock ? 'w-10 h-10' : 'w-8 h-8';
        const colorBg = isDeadlock ? 'bg-rose-600' : 'bg-amber-500';
        const pingColor = isDeadlock ? 'bg-rose-500' : 'bg-amber-400';

        const chokeIcon = L.divIcon({
          className: 'custom-choke-pin',
          html: `
            <div class="relative flex items-center justify-center cursor-pointer group">
              <span class="absolute inline-flex h-full w-full rounded-full ${pingColor} opacity-75 animate-ping"></span>
              <div class="${sizeClass} ${colorBg} text-white rounded-full flex flex-col items-center justify-center shadow-xl border-2 border-white text-xs font-black transition-transform group-hover:scale-115">
                <span class="text-[12px] leading-tight">🛺</span>
                <span class="text-[9px] leading-none">${cz.congestionScore}%</span>
              </div>
              <div class="absolute -bottom-6 whitespace-nowrap bg-slate-900/90 backdrop-blur-xs text-white text-[10px] font-semibold px-2 py-0.5 rounded-md shadow-md border border-white/15 pointer-events-none">
                ${cz.name.split(' ')[0]}
              </div>
            </div>
          `,
          iconSize: [40, 40],
          iconAnchor: [20, 20]
        });

        const marker = L.marker([cz.lat, cz.lng], { icon: chokeIcon });
        marker.bindPopup(`
          <div class="p-3 min-w-[220px] font-sans">
            <div class="flex items-center justify-between gap-2 mb-1.5">
              <span class="inline-flex items-center gap-1 text-xs font-bold text-rose-600">
                <span class="w-2 h-2 rounded-full bg-rose-600 animate-pulse"></span>
                ${isDeadlock ? 'High Congestion Gridlock' : 'Moderate Bottleneck'}
              </span>
              <span class="text-[10px] font-extrabold px-1.5 py-0.5 bg-rose-50 text-rose-700 rounded border border-rose-200">
                ${cz.congestionScore}% Choked
              </span>
            </div>
            <h4 class="font-bold text-slate-900 text-sm leading-snug">${cz.name}</h4>
            <p class="text-xs text-slate-500 mb-2 font-medium">${cz.hindiName}</p>
            <div class="bg-slate-50 p-2 rounded-lg border border-slate-100 text-xs text-slate-700 space-y-1">
              <div><b>Cause:</b> ${cz.cause}</div>
              <div class="text-slate-500 text-[11px]">Est. ~${cz.activeRickshawsEst} e-rickshaws queued</div>
            </div>
          </div>
        `, {
          className: 'google-style-popup',
          closeButton: true
        });
        chokeLayer.addLayer(marker);

        // Pulsing Heatmap Circle
        if (showHeatmap) {
          const radius = isDeadlock ? 320 : 200;
          const circle = L.circle([cz.lat, cz.lng], {
            radius: radius,
            color: isDeadlock ? '#e11d48' : '#f59e0b',
            fillColor: isDeadlock ? '#f43f5e' : '#fbbf24',
            fillOpacity: isDeadlock ? 0.24 : 0.16,
            weight: 2,
            dashArray: '4, 6'
          });
          chokeLayer.addLayer(circle);
        }
      });
    }

    // Crowdsourced Reports with Google-style Pin Badges
    reports.forEach((rep) => {
      const isCritical = rep.severity === 'critical';
      const isHeavy = rep.severity === 'heavy';
      const badgeColor = isCritical ? 'bg-rose-600' : isHeavy ? 'bg-amber-600' : 'bg-blue-600';

      const iconEmoji = 
        rep.category === 'erickshaw_gridlock' ? '🛺' :
        rep.category === 'railway_crossing' ? '🚂' :
        rep.category === 'festive_rush' ? '🎪' :
        rep.category === 'police_diversion' ? '👮' : '⚠️';

      const reportIcon = L.divIcon({
        className: 'custom-report-pin',
        html: `
          <div class="relative cursor-pointer group flex flex-col items-center">
            <div class="w-8 h-8 ${badgeColor} text-white rounded-full flex items-center justify-center shadow-lg border-2 border-white text-xs transition-transform group-hover:scale-120">
              <span class="text-sm">${iconEmoji}</span>
            </div>
            <div class="absolute -top-1.5 -right-1.5 bg-slate-900 text-white text-[9px] font-black px-1.5 py-0.2 rounded-full border border-white shadow">
              +${rep.upvotes}
            </div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      const repMarker = L.marker([rep.coordinates.lat, rep.coordinates.lng], { icon: reportIcon });
      repMarker.on('click', () => onSelectReport(rep));
      chokeLayer.addLayer(repMarker);
    });

    // Charging Stations
    if (showChargingStations) {
      const chargingPoints = [
        { name: 'Station Road E-Rickshaw Charging Hub', lat: 28.3440, lng: 79.4160 },
        { name: 'Shahamatganj Battery Swap & Charge', lat: 28.3625, lng: 79.4290 },
        { name: 'Delapeer 100ft Fast Charge Bay', lat: 28.3890, lng: 79.4310 },
        { name: 'Satellite Bus Stand EV Point', lat: 28.3475, lng: 79.4470 }
      ];

      chargingPoints.forEach(cp => {
        const chargingIcon = L.divIcon({
          className: 'charging-pin',
          html: `
            <div class="w-7 h-7 bg-emerald-600 text-white rounded-xl flex items-center justify-center shadow-md border-2 border-white text-xs font-bold transition-transform hover:scale-110">
              ⚡
            </div>
          `,
          iconSize: [28, 28],
          iconAnchor: [14, 14]
        });
        const marker = L.marker([cp.lat, cp.lng], { icon: chargingIcon });
        marker.bindPopup(`
          <div class="p-2 text-xs">
            <b class="text-emerald-700 text-sm flex items-center gap-1">⚡ ${cp.name}</b>
            <p class="text-slate-500 mt-1">Certified EV Battery Swap & Fast Charge Station (₹30-₹50/swap)</p>
          </div>
        `);
        chokeLayer.addLayer(marker);
      });
    }

  }, [chokeZones, reports, showHeatmap, showChargingStations, showLiveTrafficOverlay, onSelectReport]);

  // Update Route Polylines and Start/Destination Markers with Google Maps Drop Pins
  useEffect(() => {
    const map = mapInstanceRef.current;
    const routeLayer = routeLayersRef.current;
    const markerLayer = markerLayersRef.current;
    if (!map || !routeLayer || !markerLayer) return;

    routeLayer.clearLayers();
    markerLayer.clearLayers();

    // Start Pin (Google Maps Style Green Drop Pin)
    const originIcon = L.divIcon({
      className: 'google-origin-pin',
      html: `
        <div class="relative flex flex-col items-center group cursor-pointer">
          <div class="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center font-black text-sm shadow-xl border-2 border-white ring-4 ring-emerald-400/30">
            A
          </div>
          <div class="w-2 h-2 bg-emerald-600 rotate-45 -mt-1 shadow-sm"></div>
          <div class="bg-slate-900/95 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg border border-white/20 mt-1 whitespace-nowrap">
            ${origin.name.split(' ')[0]}
          </div>
        </div>
      `,
      iconSize: [36, 52],
      iconAnchor: [18, 28]
    });
    const originMarker = L.marker([origin.lat, origin.lng], { icon: originIcon });
    originMarker.bindPopup(`
      <div class="p-2.5">
        <div class="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Pickup Point (प्रस्थान)</div>
        <div class="font-extrabold text-slate-900 text-sm">${origin.name}</div>
        <div class="text-xs text-slate-500">${origin.hindiName}</div>
      </div>
    `);
    markerLayer.addLayer(originMarker);

    // Destination Pin (Google Maps Style Red Drop Pin)
    const destIcon = L.divIcon({
      className: 'google-dest-pin',
      html: `
        <div class="relative flex flex-col items-center group cursor-pointer">
          <div class="w-9 h-9 rounded-full bg-rose-600 text-white flex items-center justify-center font-black text-sm shadow-xl border-2 border-white ring-4 ring-rose-400/30">
            B
          </div>
          <div class="w-2 h-2 bg-rose-600 rotate-45 -mt-1 shadow-sm"></div>
          <div class="bg-slate-900/95 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg border border-white/20 mt-1 whitespace-nowrap">
            ${destination.name.split(' ')[0]}
          </div>
        </div>
      `,
      iconSize: [36, 52],
      iconAnchor: [18, 28]
    });
    const destMarker = L.marker([destination.lat, destination.lng], { icon: destIcon });
    destMarker.bindPopup(`
      <div class="p-2.5">
        <div class="text-[10px] font-bold text-rose-600 uppercase tracking-wider">Drop Location (गंतव्य)</div>
        <div class="font-extrabold text-slate-900 text-sm">${destination.name}</div>
        <div class="text-xs text-slate-500">${destination.hindiName}</div>
      </div>
    `);
    markerLayer.addLayer(destMarker);

    // Render Routes with smooth casing & polyline glow
    const allBoundsPoints: [number, number][] = [
      [origin.lat, origin.lng],
      [destination.lat, destination.lng]
    ];

    routes.forEach((route) => {
      const isSelected = route.id === selectedRouteId;
      const isBypass = route.isBypass;

      // Base outline casing for crisp Google Maps highway look
      const casingColor = isSelected ? '#ffffff' : '#e2e8f0';
      const casingWidth = isSelected ? 9 : 6;

      const casing = L.polyline(route.pathPoints, {
        color: casingColor,
        weight: casingWidth,
        opacity: 0.9,
        lineCap: 'round',
        lineJoin: 'round'
      });
      routeLayer.addLayer(casing);

      // Main route polyline
      const strokeColor = isBypass 
        ? (isSelected ? '#059669' : '#10b981') 
        : (isSelected ? '#2563eb' : '#94a3b8');
      const strokeWidth = isSelected ? 6 : 4;
      const strokeOpacity = isSelected ? 1.0 : 0.7;

      const polyline = L.polyline(route.pathPoints, {
        color: strokeColor,
        weight: strokeWidth,
        opacity: strokeOpacity,
        lineCap: 'round',
        lineJoin: 'round'
      });

      polyline.on('click', () => onSelectRoute(route.id));

      polyline.bindTooltip(`
        <div class="p-1 font-sans text-xs">
          <div class="font-black ${isBypass ? 'text-emerald-700' : 'text-blue-700'} flex items-center gap-1">
            <span>${isBypass ? '⚡ Smart Bypass' : '📍 Standard Route'}</span>
            <span>· ${route.name}</span>
          </div>
          <div class="font-semibold text-slate-700 mt-0.5">${route.durationMin} mins (${route.distanceKm} km)</div>
          ${isBypass ? `<div class="text-emerald-600 text-[11px] font-bold">⚡ Saves ${route.timeSavedMin} mins</div>` : ''}
        </div>
      `, { sticky: true });

      routeLayer.addLayer(polyline);
      route.pathPoints.forEach(p => allBoundsPoints.push(p));
    });

    // Fit map bounds smoothly
    if (allBoundsPoints.length > 0 && (!liveRideState || !liveRideState.isActive)) {
      const bounds = L.latLngBounds(allBoundsPoints);
      map.fitBounds(bounds, { padding: [60, 60], maxZoom: 15, animate: true, duration: 0.8 });
    }

  }, [origin, destination, routes, selectedRouteId, onSelectRoute]);

  // Live Auto GPS & Motion Tracking
  useEffect(() => {
    const map = mapInstanceRef.current;
    const liveLayer = liveVehicleLayerRef.current;
    const userLayer = userGpsLayerRef.current;
    if (!map || !liveLayer || !userLayer) return;

    liveLayer.clearLayers();
    userLayer.clearLayers();

    // 1. User Real GPS Pin (Google Blue Dot with Pulsing Radar Ring)
    if (userGpsLocation) {
      const userIcon = L.divIcon({
        className: 'google-my-location-dot',
        html: `
          <div class="relative flex items-center justify-center">
            <span class="absolute inline-flex h-9 w-9 rounded-full bg-blue-500 opacity-40 animate-ping"></span>
            <div class="w-5 h-5 bg-blue-600 rounded-full border-3 border-white shadow-xl flex items-center justify-center">
              <div class="w-1.5 h-1.5 bg-white rounded-full"></div>
            </div>
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18]
      });

      const userMarker = L.marker([userGpsLocation.lat, userGpsLocation.lng], { icon: userIcon, zIndexOffset: 800 });
      userMarker.bindPopup("<b>आपकी लोकेशन (Your Live GPS Location)</b>");
      userLayer.addLayer(userMarker);
    }

    // 2. Active Ride Auto Marker
    if (liveRideState && liveRideState.isActive && liveRideState.currentLocation) {
      const { lat, lng } = liveRideState.currentLocation;

      const autoIcon = L.divIcon({
        className: 'live-erickshaw-active-marker',
        html: `
          <div class="relative flex items-center justify-center group cursor-pointer">
            <span class="absolute -inset-2.5 rounded-full bg-amber-400/80 animate-ping"></span>
            <div class="w-11 h-11 rounded-full bg-slate-950 border-2 border-amber-400 text-white flex items-center justify-center shadow-2xl relative z-10">
              <span class="text-2xl">🛺</span>
            </div>
            <!-- Speed badge -->
            <div class="absolute -top-3 bg-emerald-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow border border-white whitespace-nowrap z-20">
              ${liveRideState.speedKmh} km/h
            </div>
            <!-- Distance remaining tag -->
            <div class="absolute -bottom-6 bg-slate-900/95 text-amber-300 text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-lg border border-amber-400/40 whitespace-nowrap z-20">
              ${liveRideState.distanceRemainingKm} km (${liveRideState.timeRemainingMin}m)
            </div>
          </div>
        `,
        iconSize: [44, 44],
        iconAnchor: [22, 22]
      });

      const autoMarker = L.marker([lat, lng], { icon: autoIcon, zIndexOffset: 1000 });
      liveLayer.addLayer(autoMarker);

      // Smooth pan to follow vehicle
      map.panTo([lat, lng], { animate: true, duration: 0.6 });
    }
  }, [liveRideState, userGpsLocation]);

  // Smooth Zoom Controls (Google Maps Style)
  const handleSmoothZoomIn = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomIn(0.5, { animate: true });
    }
  };

  const handleSmoothZoomOut = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomOut(0.5, { animate: true });
    }
  };

  const handleRecenter = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([cityCenter.lat, cityCenter.lng], 14, {
        animate: true,
        duration: 0.9,
        easeLinearity: 0.2
      });
    }
  };

  const handleLocateMe = () => {
    if (!('geolocation' in navigator)) return;
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const { latitude, longitude } = pos.coords;
        if (onGpsLocateSuccess) {
          onGpsLocateSuccess({ lat: latitude, lng: longitude });
        }
        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([latitude, longitude], 15.5, {
            animate: true,
            duration: 1.2
          });
        }
      },
      (err) => {
        setIsLocating(false);
        console.warn('Geolocation error:', err);
        handleRecenter();
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleToggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    }, 100);
    setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    }, 300);
  };

  return (
    <div 
      className={`relative w-full transition-all duration-300 ${
        isFullscreen 
          ? 'fixed inset-0 z-[9999] bg-white h-screen w-screen p-0 m-0 rounded-none' 
          : 'h-full min-h-[460px] rounded-2xl overflow-hidden border border-slate-200/90 shadow-sm'
      }`}
    >
      {/* Map Surface */}
      <div ref={mapContainerRef} className="w-full h-full z-0 bg-slate-100" />

      {/* Top Left Floating Google Maps Layer Switcher Pill */}
      <div className="absolute top-3 left-3 z-[1000] flex flex-col gap-2">
        <div className="relative">
          <button
            onClick={() => setIsLayerMenuOpen(!isLayerMenuOpen)}
            className="bg-white/95 hover:bg-white text-slate-800 text-xs font-bold px-3 py-2 rounded-xl shadow-md border border-slate-200/80 backdrop-blur-md flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
            title="Switch Map Layers"
          >
            <Layers className="w-4 h-4 text-blue-600" />
            <span className="capitalize">{mapTheme}</span>
          </button>

          {isLayerMenuOpen && (
            <div className="absolute left-0 top-full mt-2 w-48 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider px-2 py-1">
                Map Types (नक्शा प्रकार)
              </div>
              <div className="grid grid-cols-1 gap-1">
                <button
                  onClick={() => { setMapTheme('google-streets'); setIsLayerMenuOpen(false); }}
                  className={`w-full px-2.5 py-1.5 rounded-xl text-left text-xs font-semibold flex items-center justify-between transition-colors ${
                    mapTheme === 'google-streets' ? 'bg-blue-50 text-blue-700 font-bold' : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <span className="flex items-center gap-2">🗺️ <span>Google Streets</span></span>
                  {mapTheme === 'google-streets' && <span className="text-blue-600 font-bold">✓</span>}
                </button>
                <button
                  onClick={() => { setMapTheme('google-hybrid'); setIsLayerMenuOpen(false); }}
                  className={`w-full px-2.5 py-1.5 rounded-xl text-left text-xs font-semibold flex items-center justify-between transition-colors ${
                    mapTheme === 'google-hybrid' ? 'bg-blue-50 text-blue-700 font-bold' : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <span className="flex items-center gap-2">🛰️ <span>Google Satellite</span></span>
                  {mapTheme === 'google-hybrid' && <span className="text-blue-600 font-bold">✓</span>}
                </button>
                <button
                  onClick={() => { setMapTheme('google-terrain'); setIsLayerMenuOpen(false); }}
                  className={`w-full px-2.5 py-1.5 rounded-xl text-left text-xs font-semibold flex items-center justify-between transition-colors ${
                    mapTheme === 'google-terrain' ? 'bg-blue-50 text-blue-700 font-bold' : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <span className="flex items-center gap-2">⛰️ <span>Google Terrain</span></span>
                  {mapTheme === 'google-terrain' && <span className="text-blue-600 font-bold">✓</span>}
                </button>
                <button
                  onClick={() => { setMapTheme('osm'); setIsLayerMenuOpen(false); }}
                  className={`w-full px-2.5 py-1.5 rounded-xl text-left text-xs font-semibold flex items-center justify-between transition-colors ${
                    mapTheme === 'osm' ? 'bg-blue-50 text-blue-700 font-bold' : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <span className="flex items-center gap-2">🌐 <span>OpenStreetMap</span></span>
                  {mapTheme === 'osm' && <span className="text-blue-600 font-bold">✓</span>}
                </button>
                <button
                  onClick={() => { setMapTheme('dark'); setIsLayerMenuOpen(false); }}
                  className={`w-full px-2.5 py-1.5 rounded-xl text-left text-xs font-semibold flex items-center justify-between transition-colors ${
                    mapTheme === 'dark' ? 'bg-blue-50 text-blue-700 font-bold' : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <span className="flex items-center gap-2">🌙 <span>Night Mode</span></span>
                  {mapTheme === 'dark' && <span className="text-blue-600 font-bold">✓</span>}
                </button>
              </div>

              <div className="border-t border-slate-100 my-1 pt-1">
                <button
                  onClick={() => setShowLiveTrafficOverlay(!showLiveTrafficOverlay)}
                  className={`w-full px-2.5 py-1.5 rounded-xl text-left text-xs font-semibold flex items-center justify-between transition-colors ${
                    showLiveTrafficOverlay ? 'text-amber-700 bg-amber-50' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <span className="text-xs">🚦</span>
                    <span>Live Traffic Layer</span>
                  </span>
                  <span className="text-[10px] font-bold">{showLiveTrafficOverlay ? 'ON' : 'OFF'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Top Right Floating Controls (Locate Me, Fullscreen / Minimize, Recenter) */}
      <div className="absolute top-3 right-3 z-[1000] flex items-center gap-2">
        {/* My Location GPS Button */}
        <button
          onClick={handleLocateMe}
          className="bg-white/95 hover:bg-white text-blue-700 text-xs font-bold px-3 py-2 rounded-xl shadow-md border border-slate-200/80 backdrop-blur-md flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
          title={t.myGpsBtn}
        >
          <Crosshair className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin text-blue-600' : ''}`} />
          <span className="hidden sm:inline">{t.myGpsBtn}</span>
        </button>

        {/* Recenter City Button */}
        <button
          onClick={handleRecenter}
          className="bg-white/95 hover:bg-white text-slate-700 text-xs font-bold px-2.5 py-2 rounded-xl shadow-md border border-slate-200/80 backdrop-blur-md flex items-center gap-1 transition-all active:scale-95 cursor-pointer"
          title={t.recenterMapBtn}
        >
          <Compass className="w-3.5 h-3.5 text-slate-600" />
          <span className="hidden sm:inline">{isHindi ? 'रीसेंटर' : 'Recenter'}</span>
        </button>

        {/* Maximize / Minimize Full-Screen Theater Button */}
        <button
          onClick={handleToggleFullscreen}
          className={`text-xs font-bold px-3 py-2 rounded-xl shadow-md backdrop-blur-md flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer border ${
            isFullscreen 
              ? 'bg-slate-900 text-white border-slate-900 ring-2 ring-slate-400/40' 
              : 'bg-white/95 hover:bg-white text-slate-800 border-slate-200/80'
          }`}
          title={isFullscreen ? 'Minimize Map' : 'Maximize Map'}
        >
          {isFullscreen ? (
            <>
              <Minimize2 className="w-3.5 h-3.5 text-amber-300" />
              <span>{isHindi ? 'छोटा करें' : 'Minimize'}</span>
            </>
          ) : (
            <>
              <Maximize2 className="w-3.5 h-3.5 text-slate-700" />
              <span>{isHindi ? 'बड़ा नक्शा' : 'Expand'}</span>
            </>
          )}
        </button>
      </div>

      {/* Bottom Right Floating Smooth Zoom Controls (Google Maps Style) */}
      <div className="absolute bottom-6 right-3 z-[1000] flex flex-col items-center bg-white/95 backdrop-blur-md rounded-2xl shadow-lg border border-slate-200/90 overflow-hidden divide-y divide-slate-100">
        <button
          onClick={handleSmoothZoomIn}
          className="p-2.5 hover:bg-slate-50 text-slate-700 hover:text-slate-900 transition-colors active:scale-90 cursor-pointer"
          title="Zoom in smoothly"
        >
          <Plus className="w-4 h-4" />
        </button>
        <button
          onClick={handleSmoothZoomOut}
          className="p-2.5 hover:bg-slate-50 text-slate-700 hover:text-slate-900 transition-colors active:scale-90 cursor-pointer"
          title="Zoom out smoothly"
        >
          <Minus className="w-4 h-4" />
        </button>
      </div>

      {/* Bottom Left Quick Informational Hint Pill */}
      <div className="absolute bottom-3 left-3 z-[1000] bg-slate-950/85 backdrop-blur-md text-white text-[11px] font-medium px-3.5 py-1.5 rounded-full shadow-lg border border-white/15 pointer-events-none flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        <span>{cityName} Live Transit Network</span>
      </div>
    </div>
  );
};

