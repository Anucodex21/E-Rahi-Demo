import React from 'react';
import { LiveRideState, RouteOption, BareillyLocation, AppLanguage } from '../types';
import { Navigation, Play, Square, Gauge, ShieldAlert, Sparkles, Volume2, ArrowRight } from 'lucide-react';
import { speakCleanVoice, playCleanChime } from '../utils/audioAlerts';
import { TRANSLATIONS } from '../utils/i18n';

interface LiveRideDashboardProps {
  rideState: LiveRideState;
  selectedRoute: RouteOption;
  origin: BareillyLocation;
  destination: BareillyLocation;
  onStartRide: (simulated: boolean) => void;
  onStopRide: () => void;
  userGpsAvailable: boolean;
  onTrackRealGps: () => void;
  language?: AppLanguage;
}

export const LiveRideDashboard: React.FC<LiveRideDashboardProps> = ({
  rideState,
  selectedRoute,
  origin,
  destination,
  onStartRide,
  onStopRide,
  userGpsAvailable,
  onTrackRealGps,
  language = 'en'
}) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;
  const isHindi = language === 'hi';
  const isUrdu = language === 'ur';

  const originName = isHindi && origin.hindiName ? origin.hindiName : origin.name;
  const destName = isHindi && destination.hindiName ? destination.hindiName : destination.name;

  const handleAnnounceStatus = () => {
    playCleanChime('fare');
    let text = '';
    if (isHindi) {
      text = rideState.isActive
        ? `ई-रिक्शा चल रहा है। बची हुई दूरी ${rideState.distanceRemainingKm} किलोमीटर है। मंज़िल ${destName} तक पहुँचने में लगभग ${rideState.timeRemainingMin} मिनट बाकी हैं। गति ${rideState.speedKmh} किलोमीटर प्रति घंटा है।`
        : `यात्रा शुरू करने के लिए स्टार्ट दबाएं। शुरुआत ${originName} से मंज़िल ${destName} तक।`;
    } else if (isUrdu) {
      text = rideState.isActive
        ? `سفر جاری ہے۔ باقی فاصلہ ${rideState.distanceRemainingKm} کلومیٹر ہے۔`
        : `سفر شروع کرنے کے لیے بٹن دبائیں۔`;
    } else {
      text = rideState.isActive
        ? `Ride in progress. Remaining distance is ${rideState.distanceRemainingKm} kilometers. Time to arrival at ${destination.name} is approximately ${rideState.timeRemainingMin} minutes. Speed is ${rideState.speedKmh} kilometers per hour.`
        : `Press start to begin navigation from ${origin.name} to ${destination.name}.`;
    }
    speakCleanVoice(text, language);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Top Banner Header */}
      <div className={`p-3 text-white flex items-center justify-between transition-colors ${
        rideState.isActive ? 'bg-gradient-to-r from-emerald-600 to-teal-700' : 'bg-slate-900'
      }`}>
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-base ${
            rideState.isActive ? 'bg-white text-emerald-700 animate-pulse' : 'bg-amber-500 text-slate-950'
          }`}>
            🛺
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm leading-tight">
                {rideState.isActive 
                  ? (isHindi ? 'सफ़र जारी है (Live Navigation)' : 'Live Navigation Active') 
                  : (isHindi ? 'लाइव राइड ट्रैकर' : 'Live Ride & GPS Tracker')}
              </span>
              {rideState.isActive && (
                <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-950/50 text-emerald-200 px-2 py-0.5 rounded-full font-bold border border-emerald-400/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                  LIVE
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-300">
              {rideState.isActive
                ? `${originName.split(' ')[0]} ➔ ${destName.split(' ')[0]}`
                : (isHindi ? 'लाइव लोकेशन व बची दूरी देखने के लिए स्टार्ट करें' : 'Track real-time GPS location and distance remaining')}
            </p>
          </div>
        </div>

        {/* Live Audio Announce */}
        <button
          onClick={handleAnnounceStatus}
          className="bg-white/20 hover:bg-white/30 text-white text-xs font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition-all active:scale-95"
          title={t.listenAudio}
        >
          <Volume2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{isHindi ? 'आवाज से सुनें' : 'Audio Update'}</span>
        </button>
      </div>

      {/* Main Content Area */}
      <div className="p-3.5 space-y-3">
        {rideState.isActive ? (
          <>
            {/* Live Progress Bar */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span className="flex items-center gap-1">
                  <span>{isHindi ? 'प्रगति' : isUrdu ? 'پیش رفت' : 'Progress'}</span>
                  <span className="text-emerald-700 font-extrabold">{Math.round(rideState.progressPercent)}%</span>
                </span>
                <span className="text-slate-500 font-medium">
                  {originName.split(' ')[0]} ➔ {destName.split(' ')[0]}
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden border border-slate-200">
                <div
                  className="bg-gradient-to-r from-emerald-500 to-amber-500 h-full rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${Math.min(100, Math.max(0, rideState.progressPercent))}%` }}
                />
              </div>
            </div>

            {/* 3 Live Metric Tiles: Distance Left, Time Left, Speed */}
            <div className="grid grid-cols-3 gap-2 text-center">
              {/* Distance Remaining */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-2.5">
                <div className="text-[10px] uppercase font-black text-emerald-800 tracking-wider">
                  {isHindi ? 'बची हुई दूरी' : 'Distance Left'}
                </div>
                <div className="text-xl font-black text-emerald-950 mt-0.5">
                  {rideState.distanceRemainingKm} <span className="text-xs font-bold text-emerald-700">km</span>
                </div>
                <div className="text-[10px] text-emerald-700 font-semibold mt-0.5">
                  {isHindi ? `कुल: ${rideState.totalDistanceKm} km` : `Total: ${rideState.totalDistanceKm} km`}
                </div>
              </div>

              {/* Time Remaining */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-2.5">
                <div className="text-[10px] uppercase font-black text-amber-800 tracking-wider">
                  {isHindi ? 'बचा समय' : 'Time Left'}
                </div>
                <div className="text-xl font-black text-amber-950 mt-0.5">
                  ~{rideState.timeRemainingMin} <span className="text-xs font-bold text-amber-700">{isHindi ? 'मिनट' : 'min'}</span>
                </div>
                <div className="text-[10px] text-amber-700 font-semibold mt-0.5">
                  {isHindi ? `कुल: ~${rideState.totalDurationMin} min` : `Total: ~${rideState.totalDurationMin} min`}
                </div>
              </div>

              {/* Live Auto Speed */}
              <div className="bg-sky-50 border border-sky-200 rounded-xl p-2.5">
                <div className="text-[10px] uppercase font-black text-sky-800 tracking-wider flex items-center justify-center gap-0.5">
                  <Gauge className="w-3 h-3 text-sky-700" />
                  <span>{isHindi ? 'स्पीड' : 'Speed'}</span>
                </div>
                <div className="text-xl font-black text-sky-950 mt-0.5">
                  {rideState.speedKmh} <span className="text-xs font-bold text-sky-700">km/h</span>
                </div>
                <div className="text-[10px] text-sky-700 font-semibold mt-0.5">
                  {isHindi ? 'ई-रिक्शा रनिंग' : 'In Transit'}
                </div>
              </div>
            </div>

            {/* Current Turn & Road Direction Indicator */}
            <div className="bg-slate-900 text-white rounded-xl p-3 flex items-start gap-3 shadow-xs">
              <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 font-bold mt-0.5">
                <Navigation className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[10px] text-amber-400 font-black uppercase tracking-wider">
                  {isHindi ? 'अगला मोड़ व मार्ग' : 'Next Step & Waypoint'}
                </div>
                <div className="text-xs font-bold text-white mt-0.5 leading-snug">
                  {rideState.currentStepInstruction || (isHindi ? `मंज़िल ${destName} की तरफ बढ़ रहे हैं` : `Heading towards ${destination.name}`)}
                </div>
                {rideState.nextChokepointAhead && (
                  <div className="text-[10px] text-amber-300 font-semibold mt-1 flex items-center gap-1">
                    <ShieldAlert className="w-3 h-3 text-amber-400" />
                    <span>{isHindi ? `जाम चेतावनी: आगे ${rideState.nextChokepointAhead} है` : `Traffic Alert: Upcoming ${rideState.nextChokepointAhead}`}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Stop / End Ride Button */}
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={onStopRide}
                className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition-all active:scale-95"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>{isHindi ? 'सफ़र समाप्त करें' : 'End Trip Navigation'}</span>
              </button>

              <button
                onClick={onTrackRealGps}
                className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs py-2.5 px-3 rounded-xl border border-slate-300 flex items-center gap-1 transition-all active:scale-95"
                title="Use Phone Real GPS"
              >
                <span>📡</span>
                <span>{isHindi ? 'GPS री-सिंक' : 'Re-sync GPS'}</span>
              </button>
            </div>
          </>
        ) : (
          <>
            {/* When Ride is Idle: Action Buttons to start Ride */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">
                  📍
                </div>
                <div className="flex-1 text-xs">
                  <div className="font-extrabold text-slate-900 flex items-center gap-1">
                    <span>{originName}</span>
                    <ArrowRight className="w-3 h-3 text-slate-400" />
                    <span>{destName}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {isHindi 
                      ? `दूरी: ${selectedRoute.distanceKm} km • अनुमानित समय: ${selectedRoute.durationMin} मिनट`
                      : `Distance: ${selectedRoute.distanceKm} km • Est. Time: ${selectedRoute.durationMin} mins`}
                  </p>
                </div>
              </div>

              <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-[11px] text-slate-600 leading-relaxed">
                💡 {isHindi 
                  ? 'सफ़र शुरू करते ही स्टार्ट बटन दबाएं। ऐप मैप पर लाइव प्रगति और बची हुई दूरी अपडेट करेगा।'
                  : 'Start live GPS tracking to see real-time distance remaining, ETA, and turn-by-turn guidance on the map.'}
              </div>
            </div>

            {/* Launch Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                onClick={() => onStartRide(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-all active:scale-95"
              >
                <Play className="w-4 h-4 fill-current text-white" />
                <span>{isHindi ? 'यात्रा शुरू करें (Start Ride)' : 'Start Live Ride'}</span>
              </button>

              <button
                onClick={onTrackRealGps}
                className="bg-slate-900 hover:bg-slate-800 text-amber-400 font-extrabold text-xs py-2.5 px-3 rounded-xl border border-slate-700 flex items-center justify-center gap-1.5 shadow-xs transition-all active:scale-95"
              >
                <Navigation className="w-3.5 h-3.5 text-amber-400" />
                <span>{isHindi ? 'फ़ोन GPS से ट्रैक करें' : 'Track with Device GPS'}</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
