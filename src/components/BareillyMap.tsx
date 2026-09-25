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
  RotateCcw,
  Camera,
  Eye,
  ExternalLink,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { BareillyLocation, ChokeZoneInfo, RouteOption, TrafficReport, LiveRideState, AppLanguage } from '../types';
import { TRANSLATIONS } from '../utils/i18n';
import { StreetViewModal, StreetViewData } from './StreetViewModal';
import { resolveStreetData, STREET_DATABASE } from '../utils/streetViewData';

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
  onSetOriginLocation?: (loc: BareillyLocation) => void;
  onSetDestinationLocation?: (loc: BareillyLocation) => void;
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
  onSetOriginLocation,
  onSetDestinationLocation,
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
  const streetInspectorLayerRef = useRef<L.LayerGroup | null>(null);

  const [mapTheme, setMapTheme] = useState<MapTheme>('google-streets');
  const [isLayerMenuOpen, setIsLayerMenuOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [currentZoom, setCurrentZoom] = useState(14);
  const [showLiveTrafficOverlay, setShowLiveTrafficOverlay] = useState(true);

  // Spot Inspector State (Instant on-map Photo & Info Card)
  const [activeSpotData, setActiveSpotData] = useState<StreetViewData | null>(null);
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const [isFullModalOpen, setIsFullModalOpen] = useState(false);

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

  // Inspect spot instantly on click — drops marker and shows Photo & Info card
  const inspectSpotAt = (lat: number, lng: number, customName?: string) => {
    const spotInfo = resolveStreetData(lat, lng, customName);
    setActiveSpotData(spotInfo);
    setActivePhotoIdx(0);

    // Drop interactive pin on the clicked spot
    const map = mapInstanceRef.current;
    const inspectorLayer = streetInspectorLayerRef.current;
    if (map && inspectorLayer) {
      inspectorLayer.clearLayers();

      const spotPinIcon = L.divIcon({
        className: 'spot-clicked-pin',
        html: `
          <div class="relative flex flex-col items-center cursor-pointer animate-bounce">
            <div class="w-8 h-8 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center font-black text-xs shadow-2xl border-2 border-white ring-4 ring-amber-400/40">
              📍
            </div>
            <div class="w-2 h-2 bg-amber-400 rotate-45 -mt-1 shadow-sm"></div>
          </div>
        `,
        iconSize: [32, 42],
        iconAnchor: [16, 21]
      });

      const inspectorMarker = L.marker([lat, lng], { icon: spotPinIcon });
      inspectorLayer.addLayer(inspectorMarker);
    }
  };

  // Initialize Map
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
    streetInspectorLayerRef.current = L.layerGroup().addTo(map);

    map.on('zoomend', () => {
      setCurrentZoom(Math.round(map.getZoom() * 10) / 10);
    });

    // Directly on clicking ANY spot/street on the map, show Photo & Info!
    map.on('click', (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      inspectSpotAt(lat, lng);
    });

    mapInstanceRef.current = map;

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
        marker.on('click', () => {
          inspectSpotAt(cz.lat, cz.lng, cz.name);
        });

        marker.bindTooltip(`
          <div class="p-1.5 font-sans">
            <div class="font-bold text-slate-900 text-xs">${cz.name}</div>
            <div class="text-[11px] text-rose-600 font-bold">${cz.congestionScore}% Jammed • Click for Photo & Info</div>
          </div>
        `, { sticky: true });

        chokeLayer.addLayer(marker);
      });
    }

    // Charging Stations Layer
    if (showChargingStations) {
      const sampleEvStations = [
        { name: 'Battery Smart Hub (Satellite)', lat: 28.3490, lng: 79.4470, slots: 14 },
        { name: 'Sun Mobility Swapping Dock (Shyamganj)', lat: 28.3540, lng: 79.4260, slots: 8 },
        { name: 'GreenCharge EV Point (Choupla)', lat: 28.3505, lng: 79.4140, slots: 12 },
        { name: 'Kutubkhana EV Swapper', lat: 28.3590, lng: 79.4190, slots: 6 },
      ];

      sampleEvStations.forEach((st) => {
        const evIcon = L.divIcon({
          className: 'ev-station-pin',
          html: `
            <div class="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg border-2 border-white ring-2 ring-emerald-300 cursor-pointer hover:scale-110 transition-transform">
              <span class="text-xs font-black">⚡</span>
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 16]
        });

        const marker = L.marker([st.lat, st.lng], { icon: evIcon });
        marker.on('click', () => {
          inspectSpotAt(st.lat, st.lng, st.name);
        });
        marker.bindTooltip(`
          <div class="p-1 font-sans text-xs">
            <div class="font-bold text-emerald-700">${st.name}</div>
            <div class="text-slate-500">${st.slots} Swapping Docks Available • Click for Photo</div>
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
    originMarker.on('click', () => {
      inspectSpotAt(origin.lat, origin.lng, origin.name);
    });
    originMarker.bindTooltip(`
      <div class="p-1 text-xs">
        <div class="font-bold text-emerald-700">Pickup: ${origin.name}</div>
        <div class="text-slate-500">Click to view photo & details</div>
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
    destMarker.on('click', () => {
      inspectSpotAt(destination.lat, destination.lng, destination.name);
    });
    destMarker.bindTooltip(`
      <div class="p-1 text-xs">
        <div class="font-bold text-rose-700">Drop: ${destination.name}</div>
        <div class="text-slate-500">Click to view photo & details</div>
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

      // Clicking on route selects route AND directly shows photo & corridor info!
      polyline.on('click', (e) => {
        onSelectRoute(route.id);
        const lat = e.latlng.lat;
        const lng = e.latlng.lng;
        inspectSpotAt(lat, lng, `${route.name} Corridor`);
      });

      polyline.bindTooltip(`
        <div class="p-1 font-sans text-xs">
          <div class="font-black ${isBypass ? 'text-emerald-700' : 'text-blue-700'} flex items-center gap-1">
            <span>${isBypass ? '⚡ Smart Bypass' : '📍 Standard Route'}</span>
            <span>· ${route.name}</span>
          </div>
          <div class="font-semibold text-slate-700 mt-0.5">${route.durationMin} mins (${route.distanceKm} km)</div>
          <div class="text-amber-600 text-[11px] font-bold mt-0.5">Click spot to view photo & details</div>
        </div>
      `, { sticky: true });

      routeLayer.addLayer(polyline);
      route.pathPoints.forEach(p => allBoundsPoints.push(p));
    });

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

    if (userGpsLocation) {
      const userIcon = L.divIcon({
        className: 'google-my-location-dot',
        html: `
          <div class="relative flex items-center justify-center">
            <span class="absolute inline-flex h-8 w-8 rounded-full bg-blue-500 opacity-40 animate-ping"></span>
            <div class="w-4 h-4 rounded-full bg-blue-600 border-2 border-white shadow-lg"></div>
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });
      const userMarker = L.marker([userGpsLocation.lat, userGpsLocation.lng], { icon: userIcon });
      userMarker.bindTooltip('<div class="text-xs font-bold text-blue-700">📍 You Are Here</div>', { permanent: false });
      userLayer.addLayer(userMarker);
    }

    if (liveRideState && liveRideState.isActive && liveRideState.currentLocation) {
      const autoIcon = L.divIcon({
        className: 'google-live-auto',
        html: `
          <div class="relative flex flex-col items-center cursor-pointer animate-pulse">
            <div class="w-10 h-10 rounded-2xl bg-amber-400 text-slate-900 flex items-center justify-center font-black text-base shadow-2xl border-2 border-white ring-4 ring-amber-400/40 transform transition-transform duration-300">
              🛺
            </div>
            <div class="bg-slate-900 text-white text-[9px] font-extrabold px-1.5 py-0.2 rounded-full shadow-md mt-0.5 whitespace-nowrap">
              ${Math.round(liveRideState.speedKmh || 0)} km/h
            </div>
          </div>
        `,
        iconSize: [40, 48],
        iconAnchor: [20, 24]
      });

      const autoMarker = L.marker(
        [liveRideState.currentLocation.lat, liveRideState.currentLocation.lng], 
        { icon: autoIcon }
      );
      liveLayer.addLayer(autoMarker);
    }
  }, [liveRideState, userGpsLocation]);

  const handleSmoothZoomIn = () => {
    mapInstanceRef.current?.setZoom((mapInstanceRef.current.getZoom() || 14) + 1);
  };

  const handleSmoothZoomOut = () => {
    mapInstanceRef.current?.setZoom((mapInstanceRef.current.getZoom() || 14) - 1);
  };

  const handleLocateMe = () => {
    setIsLocating(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setIsLocating(false);
          const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          if (onGpsLocateSuccess) onGpsLocateSuccess(coords);
          mapInstanceRef.current?.flyTo([coords.lat, coords.lng], 16, {
            animate: true,
            duration: 1.2
          });
        },
        (err) => {
          console.log('GPS error:', err);
          setIsLocating(false);
          if (cityCenter) {
            mapInstanceRef.current?.flyTo([cityCenter.lat, cityCenter.lng], 15);
          }
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    } else {
      setIsLocating(false);
    }
  };

  const handleRecenter = () => {
    if (cityCenter && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([cityCenter.lat, cityCenter.lng], 14, {
        animate: true,
        duration: 1.0
      });
    }
  };

  const handleToggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    setTimeout(() => mapInstanceRef.current?.invalidateSize(), 200);
  };

  return (
    <div 
      className={`relative w-full overflow-hidden transition-all duration-300 font-sans ${
        isFullscreen 
          ? 'fixed inset-0 z-[9999] h-screen w-screen bg-white' 
          : 'h-full w-full rounded-2xl border border-slate-200/90 shadow-2xs'
      }`}
    >
      {/* Map Canvas */}
      <div ref={mapContainerRef} className="h-full w-full z-0 bg-slate-100" />

      {/* Top Left Floating Toolbar (Layer Switcher) */}
      <div className="absolute top-2.5 left-2.5 z-[1000] flex items-center gap-1.5">
        <div className="relative">
          <button
            onClick={() => setIsLayerMenuOpen(!isLayerMenuOpen)}
            className="bg-white/95 hover:bg-white text-slate-800 text-xs font-semibold px-2.5 py-1.5 rounded-xl shadow-2xs border border-slate-200/90 backdrop-blur-md flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer min-h-[34px]"
            title="Switch Map Layers"
          >
            <Layers className="w-3.5 h-3.5 text-slate-600" />
            <span className="hidden sm:inline capitalize">
              {mapTheme.replace('google-', '')}
            </span>
          </button>

          {isLayerMenuOpen && (
            <div className="absolute top-10 left-0 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-slate-200/90 p-1.5 w-44 z-[1010] animate-in fade-in duration-150">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">
                Map Types
              </div>
              <div className="space-y-0.5">
                <button
                  onClick={() => { setMapTheme('google-streets'); setIsLayerMenuOpen(false); }}
                  className={`w-full px-2.5 py-1.5 rounded-xl text-left text-xs font-medium flex items-center justify-between transition-colors ${
                    mapTheme === 'google-streets' ? 'bg-slate-900 text-white font-semibold' : 'hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <span className="flex items-center gap-2"><span>🗺️</span> <span>Google Streets</span></span>
                  {mapTheme === 'google-streets' && <span className="font-bold">✓</span>}
                </button>
                <button
                  onClick={() => { setMapTheme('google-hybrid'); setIsLayerMenuOpen(false); }}
                  className={`w-full px-2.5 py-1.5 rounded-xl text-left text-xs font-medium flex items-center justify-between transition-colors ${
                    mapTheme === 'google-hybrid' ? 'bg-slate-900 text-white font-semibold' : 'hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <span className="flex items-center gap-2"><span>🛰️</span> <span>Satellite</span></span>
                  {mapTheme === 'google-hybrid' && <span className="font-bold">✓</span>}
                </button>
                <button
                  onClick={() => { setMapTheme('google-terrain'); setIsLayerMenuOpen(false); }}
                  className={`w-full px-2.5 py-1.5 rounded-xl text-left text-xs font-medium flex items-center justify-between transition-colors ${
                    mapTheme === 'google-terrain' ? 'bg-slate-900 text-white font-semibold' : 'hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <span className="flex items-center gap-2"><span>⛰️</span> <span>Terrain</span></span>
                  {mapTheme === 'google-terrain' && <span className="font-bold">✓</span>}
                </button>
                <button
                  onClick={() => { setMapTheme('osm'); setIsLayerMenuOpen(false); }}
                  className={`w-full px-2.5 py-1.5 rounded-xl text-left text-xs font-medium flex items-center justify-between transition-colors ${
                    mapTheme === 'osm' ? 'bg-slate-900 text-white font-semibold' : 'hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <span className="flex items-center gap-2"><span>🌐</span> <span>OpenStreetMap</span></span>
                  {mapTheme === 'osm' && <span className="font-bold">✓</span>}
                </button>
              </div>

              <div className="border-t border-slate-100 my-1 pt-1">
                <button
                  onClick={() => setShowLiveTrafficOverlay(!showLiveTrafficOverlay)}
                  className={`w-full px-2.5 py-1.5 rounded-xl text-left text-xs font-medium flex items-center justify-between transition-colors ${
                    showLiveTrafficOverlay ? 'text-amber-800 bg-amber-50 font-semibold' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <span className="text-xs">🚦</span>
                    <span>Live Traffic</span>
                  </span>
                  <span className="text-[10px] font-bold">{showLiveTrafficOverlay ? 'ON' : 'OFF'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Top Right Floating Controls (Locate Me, Recenter, Fullscreen) */}
      <div className="absolute top-2.5 right-2.5 z-[1000] flex items-center gap-1.5">
        {/* My Location GPS Button */}
        <button
          onClick={handleLocateMe}
          className="bg-white/95 hover:bg-white text-slate-800 text-xs font-semibold px-2.5 py-1.5 rounded-xl shadow-2xs border border-slate-200/90 backdrop-blur-md flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer min-h-[34px]"
          title={t.myGpsBtn}
        >
          <Crosshair className={`w-3.5 h-3.5 text-blue-600 ${isLocating ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">{t.myGpsBtn}</span>
        </button>

        {/* Recenter City Button */}
        <button
          onClick={handleRecenter}
          className="bg-white/95 hover:bg-white text-slate-700 text-xs font-semibold px-2.5 py-1.5 rounded-xl shadow-2xs border border-slate-200/90 backdrop-blur-md flex items-center gap-1 transition-all active:scale-95 cursor-pointer min-h-[34px]"
          title={t.recenterMapBtn}
        >
          <Compass className="w-3.5 h-3.5 text-slate-500" />
          <span className="hidden sm:inline">{isHindi ? 'रीसेंटर' : 'Recenter'}</span>
        </button>

        {/* Maximize / Minimize Full-Screen Theater Button */}
        <button
          onClick={handleToggleFullscreen}
          className={`text-xs font-semibold px-2.5 py-1.5 rounded-xl shadow-2xs backdrop-blur-md flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer min-h-[34px] border ${
            isFullscreen 
              ? 'bg-slate-900 text-white border-slate-900' 
              : 'bg-white/95 hover:bg-white text-slate-700 border-slate-200/90'
          }`}
          title={isFullscreen ? 'Minimize Map' : 'Maximize Map'}
        >
          {isFullscreen ? (
            <>
              <Minimize2 className="w-3.5 h-3.5 text-amber-300" />
              <span>{isHindi ? 'छोटा' : 'Exit'}</span>
            </>
          ) : (
            <>
              <Maximize2 className="w-3.5 h-3.5 text-slate-600" />
              <span>{isHindi ? 'बड़ा' : 'Expand'}</span>
            </>
          )}
        </button>
      </div>

      {/* Bottom Right Floating Smooth Zoom Controls */}
      <div className="absolute bottom-4 right-2.5 z-[1000] flex flex-col items-center bg-white/95 backdrop-blur-md rounded-xl shadow-2xs border border-slate-200/90 overflow-hidden divide-y divide-slate-100">
        <button
          onClick={handleSmoothZoomIn}
          className="p-2 hover:bg-slate-100 text-slate-700 transition-colors active:scale-90 cursor-pointer"
          title="Zoom in smoothly"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={handleSmoothZoomOut}
          className="p-2 hover:bg-slate-100 text-slate-700 transition-colors active:scale-90 cursor-pointer"
          title="Zoom out smoothly"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* DIRECT ON-MAP SPOT PHOTO & INFO CARD (Appears immediately when user clicks any spot/street) */}
      {activeSpotData && (
        <div className="absolute bottom-3 left-3 right-3 sm:right-auto sm:max-w-[380px] z-[1020] bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-200/90 overflow-hidden animate-in slide-in-from-bottom-3 duration-200 flex flex-col max-h-[75vh]">
          
          {/* Hero Spot Photo */}
          <div className="relative aspect-[16/9] w-full bg-slate-900 overflow-hidden select-none group">
            <img
              src={activeSpotData.photos[activePhotoIdx]?.url || activeSpotData.photos[0]?.url}
              alt={activeSpotData.name}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            
            {/* Top Overlay Badges */}
            <div className="absolute top-2 inset-x-2 flex items-center justify-between pointer-events-none">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white border border-white/20">
                📍 {cityName}
              </span>

              <div className="flex items-center gap-1 pointer-events-auto">
                {/* Expand to Full Modal */}
                <button
                  onClick={() => setIsFullModalOpen(true)}
                  className="w-7 h-7 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-md transition-colors cursor-pointer"
                  title="360° & Full Gallery"
                >
                  <Eye className="w-3.5 h-3.5" />
                </button>

                {/* Close Spot Card */}
                <button
                  onClick={() => setActiveSpotData(null)}
                  className="w-7 h-7 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-md transition-colors cursor-pointer"
                  title="Close Card"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Photo Caption & Multi-photo Indicators */}
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-2.5 pt-6 flex items-end justify-between">
              <p className="text-white text-xs font-bold leading-snug drop-shadow-md truncate max-w-[80%]">
                {activeSpotData.photos[activePhotoIdx]?.caption || activeSpotData.name}
              </p>

              {activeSpotData.photos.length > 1 && (
                <div className="flex items-center gap-1 bg-black/50 backdrop-blur-xs px-1.5 py-0.5 rounded-md text-[10px] text-white">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActivePhotoIdx((prev) => (prev - 1 + activeSpotData.photos.length) % activeSpotData.photos.length);
                    }}
                    className="hover:text-amber-300 cursor-pointer"
                  >
                    ‹
                  </button>
                  <span>{activePhotoIdx + 1}/{activeSpotData.photos.length}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActivePhotoIdx((prev) => (prev + 1) % activeSpotData.photos.length);
                    }}
                    className="hover:text-amber-300 cursor-pointer"
                  >
                    ›
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Spot Information & Live Metrics */}
          <div className="p-3 space-y-2 overflow-y-auto scrollbar-none">
            <div>
              <h4 className="text-sm font-extrabold text-slate-900 leading-tight">
                {activeSpotData.name}
              </h4>
              <p className="text-[11px] text-slate-500 font-medium">
                {activeSpotData.hindiName || activeSpotData.area}
              </p>
            </div>

            {/* Live Metrics Chips */}
            <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                activeSpotData.trafficStatus === 'smooth'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : activeSpotData.trafficStatus === 'moderate'
                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                  : 'bg-rose-50 text-rose-700 border-rose-200'
              }`}>
                🚦 {activeSpotData.trafficSpeedKmph} km/h • {activeSpotData.trafficStatus.toUpperCase()}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                🛺 ₹{activeSpotData.fareFromStation} Shared Fare
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                🛣️ {activeSpotData.roadWidthMeters}m Wide
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
              {activeSpotData.description}
            </p>

            {/* Quick Action Buttons */}
            <div className="pt-1 grid grid-cols-2 gap-1.5">
              <button
                onClick={() => {
                  if (onSetOriginLocation) {
                    onSetOriginLocation({
                      id: `spot-origin-${Date.now()}`,
                      name: activeSpotData.name,
                      hindiName: activeSpotData.name,
                      lat: activeSpotData.lat,
                      lng: activeSpotData.lng,
                      category: 'market',
                      description: `${activeSpotData.name} Transit Hub`,
                      isChokeHazard: false
                    });
                  }
                  setActiveSpotData(null);
                }}
                className="py-1.5 px-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold transition-colors shadow-2xs flex items-center justify-center gap-1 cursor-pointer"
              >
                <span>{isHindi ? '🟢 प्रस्थान (A) चुनें' : '🟢 Start Here (A)'}</span>
              </button>

              <button
                onClick={() => {
                  if (onSetDestinationLocation) {
                    onSetDestinationLocation({
                      id: `spot-dest-${Date.now()}`,
                      name: activeSpotData.name,
                      hindiName: activeSpotData.name,
                      lat: activeSpotData.lat,
                      lng: activeSpotData.lng,
                      category: 'market',
                      description: `${activeSpotData.name} Transit Destination`,
                      isChokeHazard: false
                    });
                  }
                  setActiveSpotData(null);
                }}
                className="py-1.5 px-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold transition-colors shadow-2xs flex items-center justify-center gap-1 cursor-pointer"
              >
                <span>{isHindi ? '🔴 गंतव्य (B) चुनें' : '🔴 Drop Here (B)'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full Screen Street View & 360° Panorama Modal */}
      <StreetViewModal
        isOpen={isFullModalOpen}
        onClose={() => setIsFullModalOpen(false)}
        streetData={activeSpotData}
        language={language}
        cityName={cityName}
        onSetAsOrigin={(name, lat, lng) => {
          if (onSetOriginLocation) {
            onSetOriginLocation({
              id: `street-origin-${Date.now()}`,
              name,
              hindiName: name,
              lat,
              lng,
              category: 'market',
              description: `${name} Transit Hub`,
              isChokeHazard: false
            });
          }
        }}
        onSetAsDestination={(name, lat, lng) => {
          if (onSetDestinationLocation) {
            onSetDestinationLocation({
              id: `street-dest-${Date.now()}`,
              name,
              hindiName: name,
              lat,
              lng,
              category: 'market',
              description: `${name} Transit Destination`,
              isChokeHazard: false
            });
          }
        }}
        onOpenTrafficReport={onMapClickReport}
      />
    </div>
  );
};
