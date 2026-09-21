import React, { useState } from 'react';
import { 
  X, 
  BatteryCharging, 
  Battery, 
  BatteryMedium, 
  BatteryLow, 
  Zap, 
  MapPin, 
  Phone, 
  Clock, 
  ArrowRight, 
  ShieldCheck, 
  Sliders, 
  Compass,
  AlertTriangle,
  RotateCcw,
  Navigation
} from 'lucide-react';
import { AppLanguage, BatterySwapPoint } from '../types';
import { SAMPLE_BATTERY_SWAP_POINTS } from '../data/autoStandsAndEvData';

interface EvBatteryRadarModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: AppLanguage;
  cityName: string;
  onNavigateToPoint?: (lat: number, lng: number, name: string) => void;
}

export const EvBatteryRadarModal: React.FC<EvBatteryRadarModalProps> = ({
  isOpen,
  onClose,
  language,
  cityName,
  onNavigateToPoint
}) => {
  const isHindi = language === 'hi';

  const [batteryPercent, setBatteryPercent] = useState<number>(65);
  const [filter24Hours, setFilter24Hours] = useState<boolean>(false);
  const [filterFastCharge, setFilterFastCharge] = useState<boolean>(false);

  // Estimations for Lead-Acid & Lithium E-Rickshaws
  // Average standard 48V / 100Ah battery ~ 80km full charge range
  const estimatedRangeKm = Math.round((batteryPercent / 100) * 80);
  const estimatedTripsRemaining = Math.max(1, Math.round(estimatedRangeKm / 4.5)); // ~4.5km per average trip
  const isBatteryLow = batteryPercent <= 25;
  const isBatteryCritical = batteryPercent <= 15;

  const filteredStations = SAMPLE_BATTERY_SWAP_POINTS.filter((station) => {
    if (filter24Hours && !station.isOpen24Hours) return false;
    if (filterFastCharge && !station.isFastChargingSupported) return false;
    return true;
  });

  const handleNavigate = (station: BatterySwapPoint) => {
    if (onNavigateToPoint) {
      onNavigateToPoint(station.lat, station.lng, station.name);
      onClose();
    } else {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${station.lat},${station.lng}`, '_blank');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl p-5 sm:p-6 shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 flex items-center justify-center font-bold text-lg shadow-2xs">
              ⚡
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-1.5">
                <span>{isHindi ? 'ई-रिक्शा बैटरी रेंज व स्वैपिंग स्टेशन रडार' : 'EV Rickshaw Battery Range & Swap Radar'}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  {SAMPLE_BATTERY_SWAP_POINTS.length} {isHindi ? 'सक्रिय डॉक' : 'Active Docks'}
                </span>
              </h3>
              <p className="text-[11px] text-slate-500">
                {isHindi ? `${cityName} के निकटतम बैटरी स्वैप केंद्र व बची हुई सुरक्षित रेंज` : `Live swap availability, safe km range & charging docks for ${cityName}`}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto py-4 space-y-4 scrollbar-thin">
          {/* 1. Interactive Battery Health & Range Calculator */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 text-white rounded-2xl p-4 sm:p-5 shadow-lg space-y-4 border border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <BatteryCharging className="w-4 h-4 text-emerald-400" />
                <span>{isHindi ? 'चालक बैटरी स्टेटस (Live Battery %):' : 'Driver Battery Reading:'}</span>
              </span>
              <span className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full border ${
                isBatteryCritical 
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse' 
                  : isBatteryLow 
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' 
                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
              }`}>
                {isBatteryCritical 
                  ? (isHindi ? '⚠️ गंभीर डिस्चार्ज' : 'Critical Drain') 
                  : isBatteryLow 
                  ? (isHindi ? '⚡ कम बैटरी' : 'Low Battery') 
                  : (isHindi ? '✅ सुरक्षित' : 'Healthy')}
              </span>
            </div>

            {/* Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">{isHindi ? 'बैटरी प्रतिशत चुनें:' : 'Adjust Battery Gauge:'}</span>
                <span className="text-2xl font-black text-amber-400">{batteryPercent}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="100"
                value={batteryPercent}
                onChange={(e) => setBatteryPercent(Number(e.target.value))}
                className="w-full h-2.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>0% (Empty)</span>
                <span>25% (Warning)</span>
                <span>50%</span>
                <span>75%</span>
                <span>100% (Full)</span>
              </div>
            </div>

            {/* Estimation Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2 border-t border-slate-800">
              <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60">
                <div className="text-[10px] text-slate-400">{isHindi ? 'सुरक्षित ड्राइविंग रेंज:' : 'Safe Remaining Range:'}</div>
                <div className="text-lg sm:text-xl font-black text-emerald-400 mt-0.5 flex items-baseline gap-1">
                  <span>{estimatedRangeKm}</span>
                  <span className="text-xs font-normal text-slate-300">km</span>
                </div>
              </div>

              <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60">
                <div className="text-[10px] text-slate-400">{isHindi ? 'संभावित सवारियां / ट्रिप:' : 'Estimated Trips Left:'}</div>
                <div className="text-lg sm:text-xl font-black text-amber-400 mt-0.5 flex items-baseline gap-1">
                  <span>~{estimatedTripsRemaining}</span>
                  <span className="text-xs font-normal text-slate-300">{isHindi ? 'सफर' : 'trips'}</span>
                </div>
              </div>

              <div className="col-span-2 sm:col-span-1 bg-slate-800/80 p-3 rounded-xl border border-slate-700/60">
                <div className="text-[10px] text-slate-400">{isHindi ? 'स्वैप में लगने वाला समय:' : 'Swapping Time:'}</div>
                <div className="text-lg sm:text-xl font-black text-sky-400 mt-0.5 flex items-baseline gap-1">
                  <span>2</span>
                  <span className="text-xs font-normal text-slate-300">{isHindi ? 'मिनट' : 'mins'}</span>
                </div>
              </div>
            </div>

            {isBatteryLow && (
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-2.5 text-xs text-amber-300 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  {isHindi 
                    ? 'बैटरी 25% से कम है! यात्रियों को बैठाने से पहले नजदीकी स्वैप स्टेशन पर जाएं।'
                    : 'Battery under 25%! Detour to nearest swap dock before taking long passenger trips.'}
                </span>
              </div>
            )}
          </div>

          {/* 2. Swap Stations Filter Bar */}
          <div className="flex items-center justify-between flex-wrap gap-2 pt-1">
            <h4 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-emerald-600" />
              <span>{isHindi ? 'निकटतम बैटरी स्वैप केंद्र सूची' : 'Nearest Swapping Docks'}</span>
            </h4>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setFilter24Hours(!filter24Hours)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                  filter24Hours 
                    ? 'bg-slate-900 text-white border-slate-900 shadow-2xs' 
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {isHindi ? '24x7 खुले' : '24x7 Open'}
              </button>

              <button
                onClick={() => setFilterFastCharge(!filterFastCharge)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                  filterFastCharge 
                    ? 'bg-slate-900 text-white border-slate-900 shadow-2xs' 
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {isHindi ? 'फास्ट चार्ज' : 'Fast Charge'}
              </button>
            </div>
          </div>

          {/* 3. Swapping Stations Cards List */}
          <div className="space-y-3">
            {filteredStations.map((station) => (
              <div
                key={station.id}
                className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs hover:shadow-md transition-shadow space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-extrabold text-xs sm:text-sm text-slate-900">{station.name}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {station.provider}
                      </span>
                      {station.isOpen24Hours && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                          24x7
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{station.address}</span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs sm:text-sm font-black text-slate-900">₹{station.swapFeeRupees}</span>
                    <span className="block text-[10px] text-slate-400">{isHindi ? 'प्रति स्वैप' : 'per swap'}</span>
                  </div>
                </div>

                {/* Stock details & Action */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 flex-wrap gap-2 text-xs">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                      <span className="text-[11px] font-bold text-slate-800">
                        {station.availableBatteries}/{station.totalSlots} {isHindi ? 'बैटरी उपलब्ध' : 'Batteries Ready'}
                      </span>
                    </div>
                    <a
                      href={`tel:${station.phone}`}
                      className="text-[11px] font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1"
                    >
                      <Phone className="w-3 h-3 text-slate-400" />
                      <span>{station.phone}</span>
                    </a>
                  </div>

                  <button
                    onClick={() => handleNavigate(station)}
                    className="py-1.5 px-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-2xs transition-transform active:scale-95 cursor-pointer"
                  >
                    <Navigation className="w-3.5 h-3.5 text-amber-400" />
                    <span>{isHindi ? 'रास्ता देखें (Navigate)' : 'Navigate'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 pt-3 flex items-center justify-between text-xs text-slate-500">
          <span>{isHindi ? '⚡ 2 मिनट में 100% फुल स्वैप' : '⚡ Instant 2-Min Battery Swapping'}</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl cursor-pointer"
          >
            {isHindi ? 'बंद करें' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
