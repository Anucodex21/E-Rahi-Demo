import React, { useState } from 'react';
import { 
  X, 
  MapPin, 
  Navigation, 
  ExternalLink, 
  Compass, 
  Camera, 
  Eye, 
  ChevronLeft, 
  ChevronRight, 
  Layers, 
  Zap, 
  Sparkles, 
  Car, 
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import { AppLanguage } from '../types';

export interface StreetViewData {
  name: string;
  hindiName?: string;
  area: string;
  lat: number;
  lng: number;
  roadType: string;
  trafficStatus: 'smooth' | 'moderate' | 'heavy' | 'jammed';
  trafficSpeedKmph: number;
  roadWidthMeters: number;
  fareFromStation: number;
  description: string;
  photos: {
    url: string;
    caption: string;
    type: 'street' | 'landmark' | 'panorama' | 'overhead';
  }[];
  nearbyLandmarks: string[];
}

interface StreetViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  streetData: StreetViewData | null;
  language: AppLanguage;
  cityName: string;
  onSetAsOrigin?: (name: string, lat: number, lng: number) => void;
  onSetAsDestination?: (name: string, lat: number, lng: number) => void;
  onOpenTrafficReport?: (lat: number, lng: number, name: string) => void;
}

export const StreetViewModal: React.FC<StreetViewModalProps> = ({
  isOpen,
  onClose,
  streetData,
  language,
  cityName,
  onSetAsOrigin,
  onSetAsDestination,
  onOpenTrafficReport
}) => {
  const isHindi = language === 'hi';
  const isUrdu = language === 'ur';

  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [viewMode, setViewMode] = useState<'photos' | 'panorama'>('photos');
  const [panoramaPan, setPanoramaPan] = useState(0);
  const [isAutoPanning, setIsAutoPanning] = useState(false);

  if (!isOpen || !streetData) return null;

  const currentPhoto = streetData.photos[activePhotoIndex] || streetData.photos[0] || {
    url: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=1000&q=80',
    caption: streetData.name,
    type: 'street'
  };

  const googleStreetViewUrl = `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${streetData.lat},${streetData.lng}`;
  const googleMapsPlaceUrl = `https://www.google.com/maps/search/?api=1&query=${streetData.lat},${streetData.lng}`;

  const getTrafficBadge = (status: StreetViewData['trafficStatus']) => {
    switch (status) {
      case 'smooth':
        return {
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          label: isHindi ? 'ट्रैफिक सुगम (हरा)' : 'Smooth Flow (Green)'
        };
      case 'moderate':
        return {
          bg: 'bg-amber-50 text-amber-800 border-amber-200',
          label: isHindi ? 'मध्यम चाल (पीला)' : 'Moderate Traffic (Yellow)'
        };
      case 'heavy':
        return {
          bg: 'bg-orange-50 text-orange-800 border-orange-200',
          label: isHindi ? 'भारी भीड़ (नारंगी)' : 'Heavy Traffic (Orange)'
        };
      case 'jammed':
      default:
        return {
          bg: 'bg-rose-50 text-rose-800 border-rose-200',
          label: isHindi ? 'भीषण जाम / चोक (लाल)' : 'Gridlock / Jammed (Red)'
        };
    }
  };

  const trafficBadge = getTrafficBadge(streetData.trafficStatus);

  const handleNextPhoto = () => {
    setActivePhotoIndex((prev) => (prev + 1) % streetData.photos.length);
  };

  const handlePrevPhoto = () => {
    setActivePhotoIndex((prev) => (prev - 1 + streetData.photos.length) % streetData.photos.length);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      {/* Street View Modal Container */}
      <div className="relative w-full sm:max-w-2xl bg-white border-t sm:border border-slate-200 rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] sm:max-h-[85vh] animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-200">
        
        {/* Header Bar */}
        <div className="px-4 py-3 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300 shrink-0">
              <Camera className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-extrabold text-white truncate">
                  {streetData.name}
                </h3>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-400 text-slate-950">
                  {cityName}
                </span>
              </div>
              <p className="text-xs text-slate-300 truncate font-medium">
                {streetData.hindiName || streetData.area} • {streetData.lat.toFixed(4)}°N, {streetData.lng.toFixed(4)}°E
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* View on Google 360 Button */}
            <a
              href={googleStreetViewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1.5 text-xs font-bold px-2.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition-colors"
              title="Open in Google 360° Street View"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>360° Street View</span>
            </a>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          
          {/* Main Photo & 360 Viewer Canvas */}
          <div className="relative bg-slate-950 aspect-[16/10] sm:aspect-[16/9] w-full overflow-hidden select-none group">
            {viewMode === 'photos' ? (
              <img
                src={currentPhoto.url}
                alt={currentPhoto.caption}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-102"
              />
            ) : (
              /* Simulated 360 Panorama View */
              <div 
                className="w-full h-full relative cursor-grab active:cursor-grabbing overflow-hidden"
                style={{
                  backgroundImage: `url(${currentPhoto.url})`,
                  backgroundSize: '250% 100%',
                  backgroundPosition: `${panoramaPan}% center`,
                  transition: isAutoPanning ? 'background-position 0.2s linear' : 'none'
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none" />
                <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md text-amber-400 text-[11px] font-bold px-2.5 py-1 rounded-full border border-amber-400/30 flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 animate-spin" />
                  <span>{isHindi ? '360° पैनोरामा सिमुलेशन (घुमाएं)' : '360° Panorama Simulation'}</span>
                </div>

                {/* Panorama Slider Drag Controls */}
                <div className="absolute bottom-3 inset-x-4 flex items-center justify-between gap-2 bg-black/60 backdrop-blur-md p-2 rounded-xl border border-white/20">
                  <span className="text-[10px] text-slate-300 font-medium">Pan View</span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={panoramaPan}
                    onChange={(e) => setPanoramaPan(Number(e.target.value))}
                    className="flex-1 accent-amber-400 cursor-pointer h-1.5 bg-slate-700 rounded-lg"
                  />
                  <span className="text-[10px] text-amber-300 font-bold">{panoramaPan * 3.6}°</span>
                </div>
              </div>
            )}

            {/* Photo Caption Overlay */}
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-950/90 via-slate-950/50 to-transparent p-3 pt-8 flex items-end justify-between pointer-events-none">
              <div>
                <p className="text-white text-xs sm:text-sm font-bold drop-shadow-md">
                  {currentPhoto.caption}
                </p>
                <p className="text-[11px] text-slate-300">
                  {isHindi ? 'सड़क / चौराहा वास्तविक दृश्य' : 'Street & Junction View'} • {activePhotoIndex + 1} of {streetData.photos.length}
                </p>
              </div>

              {/* View Mode Toggle Button */}
              <button
                onClick={() => setViewMode(viewMode === 'photos' ? 'panorama' : 'photos')}
                className="pointer-events-auto bg-white/20 hover:bg-white/30 backdrop-blur-md text-white text-xs font-bold px-2.5 py-1.5 rounded-xl border border-white/20 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {viewMode === 'photos' ? (
                  <>
                    <Eye className="w-3.5 h-3.5 text-amber-300" />
                    <span>360° View</span>
                  </>
                ) : (
                  <>
                    <Layers className="w-3.5 h-3.5" />
                    <span>Photos</span>
                  </>
                )}
              </button>
            </div>

            {/* Photo Carousel Navigation Arrows */}
            {streetData.photos.length > 1 && (
              <>
                <button
                  onClick={handlePrevPhoto}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition-colors cursor-pointer border border-white/20"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={handleNextPhoto}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition-colors cursor-pointer border border-white/20"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </>
            )}
          </div>

          {/* Thumbnail Strip */}
          {streetData.photos.length > 1 && (
            <div className="p-2.5 bg-slate-50 flex items-center gap-2 overflow-x-auto scrollbar-none">
              {streetData.photos.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setActivePhotoIndex(idx);
                    setViewMode('photos');
                  }}
                  className={`relative w-16 h-12 rounded-lg overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                    activePhotoIndex === idx
                      ? 'border-amber-500 scale-105 shadow-sm ring-2 ring-amber-400/20'
                      : 'border-slate-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={p.url} alt={p.caption} className="w-full h-full object-cover" />
                  <span className="absolute bottom-0.5 right-0.5 text-[8px] bg-black/70 text-white px-1 rounded">
                    #{idx + 1}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Street Telemetry & Live Traffic Details */}
          <div className="p-4 space-y-3 bg-white">
            
            {/* Live Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${trafficBadge.bg}`}>
                {trafficBadge.label}
              </span>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
                🛣️ {streetData.roadType}
              </span>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                🛺 {isHindi ? `किराया: ₹${streetData.fareFromStation}` : `E-Rickshaw: ₹${streetData.fareFromStation}`}
              </span>
            </div>

            {/* Street Description */}
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
              {streetData.description}
            </p>

            {/* Street Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-center">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Avg Speed</span>
                <p className="text-sm font-extrabold text-slate-900 mt-0.5">{streetData.trafficSpeedKmph} km/h</p>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-center">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Road Width</span>
                <p className="text-sm font-extrabold text-slate-900 mt-0.5">{streetData.roadWidthMeters} Meters</p>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-center">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Auto Stand</span>
                <p className="text-sm font-extrabold text-emerald-700 mt-0.5">Available</p>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-center">
                <span className="text-[10px] text-slate-400 font-bold uppercase">GPS Accuracy</span>
                <p className="text-sm font-extrabold text-blue-700 mt-0.5">± 4m</p>
              </div>
            </div>

            {/* Nearby Landmarks */}
            {streetData.nearbyLandmarks.length > 0 && (
              <div className="pt-1">
                <span className="text-xs font-bold text-slate-500">
                  {isHindi ? '📍 आसपास के प्रमुख स्थल:' : '📍 Nearby Landmarks:'}
                </span>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {streetData.nearbyLandmarks.map((lm, idx) => (
                    <span
                      key={idx}
                      className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 border border-slate-200"
                    >
                      {lm}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Bottom Bar */}
        <div className="p-3 sm:p-4 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-1.5 flex-1 sm:flex-initial">
            {/* Set as Origin (A) */}
            <button
              onClick={() => {
                if (onSetAsOrigin) onSetAsOrigin(streetData.name, streetData.lat, streetData.lng);
                onClose();
              }}
              className="flex-1 sm:flex-initial text-xs font-bold px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-colors cursor-pointer shadow-2xs flex items-center justify-center gap-1"
            >
              <span>{isHindi ? '🟢 प्रस्थान (A) चुनें' : '🟢 Start From Here'}</span>
            </button>

            {/* Set as Destination (B) */}
            <button
              onClick={() => {
                if (onSetAsDestination) onSetAsDestination(streetData.name, streetData.lat, streetData.lng);
                onClose();
              }}
              className="flex-1 sm:flex-initial text-xs font-bold px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white transition-colors cursor-pointer shadow-2xs flex items-center justify-center gap-1"
            >
              <span>{isHindi ? '🔴 गंतव्य (B) चुनें' : '🔴 Route To Here'}</span>
            </button>
          </div>

          {/* External Google 360 link for mobile */}
          <a
            href={googleStreetViewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-bold px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white transition-colors flex items-center justify-center gap-1.5 w-full sm:w-auto"
          >
            <ExternalLink className="w-3.5 h-3.5 text-amber-300" />
            <span>{isHindi ? 'गूगल 360° स्ट्रीट व्यू खोलें' : 'Google 360° Street View'}</span>
          </a>
        </div>
      </div>
    </div>
  );
};
