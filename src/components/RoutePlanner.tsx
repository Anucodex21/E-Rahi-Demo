import React, { useState } from 'react';
import { BareillyLocation, RouteOption, UserMode, AIRouteAdvice, LiveRideState, AppLanguage } from '../types';
import { BAREILLY_LOCATIONS } from '../data/bareillyData';
import { ArrowRightLeft, Sparkles, Volume2, VolumeX, ShieldAlert, CheckCircle2, Zap, Clock, Navigation, Play, Square, ArrowDown, ArrowRight, MapPin, Camera, ExternalLink } from 'lucide-react';
import { speakCleanVoice, stopVoice, playCleanChime } from '../utils/audioAlerts';
import { TRANSLATIONS } from '../utils/i18n';
import { AutoRunningLoader } from './AutoRunningLoader';

interface RoutePlannerProps {
  origin: BareillyLocation;
  destination: BareillyLocation;
  onOriginChange: (loc: BareillyLocation) => void;
  onDestinationChange: (loc: BareillyLocation) => void;
  onSwapLocations: () => void;
  routes: RouteOption[];
  selectedRouteId: string;
  onSelectRoute: (id: string) => void;
  userMode: UserMode;
  onUserModeChange: (mode: UserMode) => void;
  aiAdvice: AIRouteAdvice | null;
  isLoadingAi: boolean;
  onRequestAiAdvice: () => void;
  availableLocations?: BareillyLocation[];
  liveRideState?: LiveRideState;
  onStartRide?: (simulated: boolean) => void;
  onStopRide?: () => void;
  onOpenStreetView?: (loc: BareillyLocation) => void;
  language?: AppLanguage;
}

export const RoutePlanner: React.FC<RoutePlannerProps> = ({
  origin,
  destination,
  onOriginChange,
  onDestinationChange,
  onSwapLocations,
  routes,
  selectedRouteId,
  onSelectRoute,
  userMode,
  onUserModeChange,
  aiAdvice,
  isLoadingAi,
  onRequestAiAdvice,
  availableLocations = BAREILLY_LOCATIONS,
  liveRideState,
  onStartRide,
  onStopRide,
  onOpenStreetView,
  language = 'en'
}) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const selectedRoute = routes.find(r => r.id === selectedRouteId) || routes[0];
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  const isHindi = language === 'hi';
  const isUrdu = language === 'ur';

  const handleSpeakAdvisory = () => {
    if (isPlayingAudio) {
      stopVoice();
      setIsPlayingAudio(false);
      return;
    }

    playCleanChime('alert');

    let text = '';
    if (isHindi) {
      text = aiAdvice?.hindiAlert || 
        (selectedRoute.isBypass
          ? `${origin.hindiName || origin.name} से ${destination.hindiName || destination.name} जाने के लिए बाईपास रास्ता सबसे बढ़िया है। समय लगभग ${selectedRoute.durationMin} मिनट लगेगा और आप भीतरी बाजार के जाम से बचेंगे।`
          : `सावधान! ${origin.hindiName || origin.name} से ${destination.hindiName || destination.name} के मुख्य मार्ग पर भारी ई-रिक्शा जाम है। लगभग ${selectedRoute.durationMin} मिनट लग सकते हैं।`);
    } else if (isUrdu) {
      text = selectedRoute.isBypass
        ? `${origin.name} سے ${destination.name} تک کا بائی پاس راستہ بہترین ہے۔ تقریبا ${selectedRoute.durationMin} منٹ لگیں گے۔`
        : `توجہ فرمائیں! ${origin.name} سے ${destination.name} تک کے راستے میں شدید ٹریفک جام ہے۔`;
    } else {
      text = aiAdvice?.headline
        ? `${aiAdvice.headline}. Recommended route: ${aiAdvice.recommendedRoute}. You save about ${aiAdvice.timeSavedMin} minutes.`
        : (selectedRoute.isBypass
          ? `Taking the smart bypass route from ${origin.name} to ${destination.name}. Travel time is about ${selectedRoute.durationMin} minutes. This route avoids heavy street traffic.`
          : `Traffic alert. The main route from ${origin.name} to ${destination.name} has heavy congestion. Travel time is about ${selectedRoute.durationMin} minutes.`);
    }

    speakCleanVoice(
      text,
      language,
      () => setIsPlayingAudio(true),
      () => setIsPlayingAudio(false)
    );
  };

  const getLocationDisplayName = (loc: BareillyLocation) => {
    if (isHindi && loc.hindiName) return loc.hindiName;
    return loc.name;
  };

  // Popular quick-pick locations
  const popularLocations = availableLocations.slice(0, 5);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-4 sm:p-5 space-y-4">
      {/* Header Title & Mode Switcher */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-slate-900">
            {isHindi ? 'यात्रा व रूट विवरण' : 'Plan Your Journey'}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {isHindi ? 'स्थान चुनें और तय सरकारी किराया व सबसे तेज रास्ता देखें' : 'Pick locations to view fair fare & avoid congested bottlenecks'}
          </p>
        </div>

        {/* Mode Switcher */}
        <div className="inline-flex rounded-xl bg-slate-100 p-0.5 border border-slate-200/80">
          <button
            onClick={() => onUserModeChange('commuter')}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
              userMode === 'commuter'
                ? 'bg-white text-slate-900 font-semibold shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🚶 {isHindi ? 'यात्री' : 'Rider'}
          </button>
          <button
            onClick={() => onUserModeChange('driver')}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
              userMode === 'driver'
                ? 'bg-slate-900 text-white font-semibold shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🛺 {isHindi ? 'चालक' : 'Driver'}
          </button>
        </div>
      </div>

      {/* Quick Select Popular Location Chips */}
      <div>
        <div className="text-[11px] font-semibold text-slate-500 mb-1.5 flex items-center justify-between">
          <span>{isHindi ? 'त्वरित गंतव्य (Popular Places):' : 'Popular Destinations:'}</span>
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {popularLocations.map((loc) => (
            <button
              key={loc.id}
              onClick={() => {
                playCleanChime('fare');
                if (loc.id !== origin.id) {
                  onDestinationChange(loc);
                } else {
                  const another = availableLocations.find(l => l.id !== loc.id);
                  if (another) onOriginChange(another);
                  onDestinationChange(loc);
                }
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium shrink-0 transition-colors cursor-pointer border ${
                destination.id === loc.id
                  ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
              }`}
            >
              {getLocationDisplayName(loc)}
            </button>
          ))}
        </div>
      </div>

      {/* Origin & Destination Selectors */}
      <div className="bg-slate-50/70 rounded-2xl p-3 sm:p-3.5 border border-slate-200/80 space-y-2.5">
        <div className="flex items-center gap-2.5">
          <div className="w-5 flex flex-col items-center justify-center py-1 self-stretch my-auto">
            <span className="w-3.5 h-3.5 rounded-full bg-emerald-600 border-2 border-white shadow-2xs flex items-center justify-center shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
            </span>
            <div className="w-0.5 h-3.5 bg-slate-300 my-0.5"></div>
            <div className="w-4 h-4 rounded-full bg-white border border-slate-300 flex items-center justify-center text-slate-600 shrink-0 shadow-2xs my-0.5">
              <ArrowDown className="w-2.5 h-2.5 text-slate-600 stroke-[2.5]" />
            </div>
            <div className="w-0.5 h-3.5 bg-slate-300 my-0.5"></div>
            <span className="w-3.5 h-3.5 rounded-full bg-rose-600 border-2 border-white shadow-2xs flex items-center justify-center shrink-0">
              <MapPin className="w-2 h-2 text-white stroke-[2.5]" />
            </span>
          </div>

          <div className="flex-1 space-y-2">
            <div>
              <div className="flex items-center justify-between mb-0.5">
                <label className="text-[11px] font-semibold text-slate-700">
                  {isHindi ? 'आरंभिक स्थान (From)' : 'Origin'}
                </label>
              </div>
              <select
                aria-label="From Location"
                value={origin.id}
                onChange={(e) => {
                  const loc = availableLocations.find(l => l.id === e.target.value);
                  if (loc) {
                    playCleanChime('fare');
                    onOriginChange(loc);
                  }
                }}
                className="w-full bg-white border border-slate-200 text-slate-900 text-xs font-semibold rounded-xl px-3 py-2 focus:outline-hidden focus:ring-2 focus:ring-slate-400/40 shadow-2xs"
              >
                {availableLocations.map((loc) => (
                  <option key={loc.id} value={loc.id} disabled={loc.id === destination.id}>
                    {getLocationDisplayName(loc)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-0.5">
                <label className="text-[11px] font-semibold text-slate-700">
                  {isHindi ? 'गंतव्य स्थान (To)' : 'Destination'}
                </label>
              </div>
              <select
                aria-label="To Location"
                value={destination.id}
                onChange={(e) => {
                  const loc = availableLocations.find(l => l.id === e.target.value);
                  if (loc) {
                    playCleanChime('fare');
                    onDestinationChange(loc);
                  }
                }}
                className="w-full bg-white border border-slate-200 text-slate-900 text-xs font-semibold rounded-xl px-3 py-2 focus:outline-hidden focus:ring-2 focus:ring-slate-400/40 shadow-2xs"
              >
                {availableLocations.map((loc) => (
                  <option key={loc.id} value={loc.id} disabled={loc.id === origin.id}>
                    {getLocationDisplayName(loc)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={onSwapLocations}
            className="p-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 transition-colors self-center shadow-2xs border border-slate-200 cursor-pointer active:scale-95"
            title={t.swapTooltip}
          >
            <ArrowRightLeft className="w-4 h-4 text-slate-600" />
          </button>
        </div>
      </div>

      {/* AI Advisory Action & Audio Helper */}
      <div className="flex items-center gap-2 pt-1">
        <button
          onClick={onRequestAiAdvice}
          disabled={isLoadingAi}
          className="flex-1 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 shadow-2xs transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>{isLoadingAi ? t.loadingAiAdvice : t.getAiAdvice}</span>
        </button>

        <button
          onClick={handleSpeakAdvisory}
          className={`px-3 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
            isPlayingAudio
              ? 'bg-amber-50 text-amber-900 border-amber-300 animate-pulse'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 shadow-2xs'
          }`}
          title={t.listenAudio}
        >
          <Volume2 className="w-3.5 h-3.5 text-slate-600" />
          <span>{isPlayingAudio ? (isHindi ? 'बोल रहा है...' : 'Speaking...') : t.listenAudio}</span>
        </button>
      </div>

      {/* AI Loading State with Running Rickshaw Animation */}
      {isLoadingAi && (
        <div className="py-2">
          <AutoRunningLoader
            size="inline"
            message={isHindi ? 'एआई स्मार्ट बाईपास मार्ग तैयार कर रहा है...' : 'AI is calculating smart bypass alleyways...'}
            subMessage={isHindi ? 'भीड़भाड़ व संकरी गलियों का रियल-टाइम विश्लेषण' : 'Analyzing traffic congestion & narrow street clearances'}
          />
        </div>
      )}

      {/* AI Advisory Alert Card */}
      {aiAdvice && !isLoadingAi && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2 text-xs">
          <div className="flex items-start justify-between">
            <div className="font-semibold text-slate-900 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>{aiAdvice.headline}</span>
            </div>
            <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-semibold px-1.5 py-0.5 rounded-full">
              ⚡ {isHindi ? `~${aiAdvice.timeSavedMin} मिनट की बचत` : `Saves ~${aiAdvice.timeSavedMin} mins`}
            </span>
          </div>

          <div className="text-slate-700 text-[11px] leading-relaxed">
            <span className="font-semibold text-slate-900">{isHindi ? 'मार्ग: ' : isUrdu ? 'راستہ: ' : 'Route: '}</span>
            {aiAdvice.recommendedRoute}
          </div>

          {isHindi && aiAdvice.hindiAlert && (
            <div className="bg-white p-2 rounded-lg border border-slate-200 text-[11px] text-slate-600 italic">
              "{aiAdvice.hindiAlert}"
            </div>
          )}

          <div className="text-[10px] text-slate-500 flex items-center gap-1">
            <ShieldAlert className="w-3 h-3 text-slate-500 shrink-0" />
            <span>{isHindi ? 'बचें: ' : 'Avoid: '}{aiAdvice.avoidHotspots.join(' • ')}</span>
          </div>
        </div>
      )}

      {/* Route Cards Comparison */}
      <div className="space-y-2.5 pt-1">
        <div className="text-xs font-bold text-slate-800 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-3.5 bg-slate-900 rounded-full"></span>
            <span>{isHindi ? 'मार्ग विकल्प व तुलना' : isUrdu ? 'راستوں کا موازنہ' : 'Route Comparison & Options'}</span>
          </span>
          <span className="text-[11px] font-medium text-slate-400">
            {isHindi ? 'रास्ता देखने हेतु क्लिक करें' : isUrdu ? 'راستہ منتخب کریں' : 'Click to select route'}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-2.5">
          {routes.map((route) => {
            const isSelected = route.id === selectedRouteId;
            const isBypass = route.isBypass;

            return (
              <div
                key={route.id}
                onClick={() => onSelectRoute(route.id)}
                className={`relative rounded-2xl border transition-all duration-200 cursor-pointer overflow-hidden p-3.5 ${
                  isSelected
                    ? isBypass
                      ? 'border-emerald-600 bg-gradient-to-br from-emerald-50/70 via-white to-emerald-50/30 shadow-md ring-2 ring-emerald-500/30'
                      : 'border-slate-800 bg-white shadow-md ring-2 ring-slate-400/30'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60 shadow-2xs hover:shadow-xs'
                }`}
              >
                {/* Active Indicator Top Accent Bar */}
                {isSelected && (
                  <div className={`absolute top-0 inset-x-0 h-1 ${isBypass ? 'bg-emerald-600' : 'bg-slate-800'}`} />
                )}

                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5 min-w-0">
                    <div
                      className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 mt-0.5 font-black text-xs ${
                        isBypass
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}
                    >
                      {isBypass ? '⚡' : '📍'}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm font-extrabold text-slate-900 truncate">
                          {isHindi ? (isBypass ? t.smartBypass : t.chokedRoute) : route.name}
                        </span>
                        {isBypass && (
                          <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-emerald-600 text-white uppercase tracking-wider shrink-0 shadow-2xs">
                            {isHindi ? 'सर्वश्रेष्ठ' : 'Fastest'}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 font-medium mt-0.5 leading-snug">
                        {isHindi ? (isBypass ? 'कम जाम वाली संकरी व सुगम गलियों का रूट' : 'भीतरी मुख्य बाज़ार का धीमा व जाम मार्ग') : route.tagline}
                      </p>
                    </div>
                  </div>

                  {/* Duration & Estimated Fare */}
                  <div className="text-right shrink-0">
                    <div className="flex items-baseline justify-end gap-1">
                      <span className={`text-base sm:text-lg font-black tracking-tight ${isBypass ? 'text-emerald-700' : 'text-slate-900'}`}>
                        {route.durationMin}
                      </span>
                      <span className="text-[11px] font-bold text-slate-500">
                        {isHindi ? 'मिनट' : isUrdu ? 'منٹ' : 'min'}
                      </span>
                    </div>

                    <div className="flex items-center justify-end gap-1.5 mt-0.5">
                      <span className="text-[11px] font-semibold text-slate-500">
                        {route.distanceKm} km
                      </span>
                      <span className="text-[11px] font-extrabold text-slate-900 bg-slate-100 border border-slate-200/80 px-1.5 py-0.5 rounded-lg shadow-2xs">
                        ₹{route.fareEstimate || (isBypass ? 15 : 10)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom Spec & Highlights Footer */}
                <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-100 text-[11px]">
                  {isBypass ? (
                    <div className="flex items-center gap-1.5 text-emerald-800 font-bold text-[11px]">
                      <Zap className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>
                        {isHindi 
                          ? `${route.timeSavedMin} मिनट की वास्तविक बचत`
                          : `Saves ~${route.timeSavedMin} mins vs main choke`}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-rose-700 font-bold text-[11px]">
                      <ShieldAlert className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                      <span>
                        {isHindi
                          ? `संभावित जाम (+${route.chokedDurationMin - 15} मिनट देरी)`
                          : `Congested (+${route.chokedDurationMin - 15}m peak delay)`}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-1.5">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                      isBypass 
                        ? 'bg-emerald-100/70 text-emerald-800 border-emerald-300' 
                        : 'bg-slate-100 text-slate-700 border-slate-200'
                    }`}>
                      {isBypass 
                        ? (isHindi ? '🟢 सुगम गलियां' : '🟢 Smooth Clear') 
                        : (isHindi ? '🔴 भीड़भाड़' : '🔴 Bottleneck')}
                    </span>
                    {isSelected && (
                      <span className="w-4 h-4 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-black">
                        ✓
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Turn-by-Turn Guidance */}
      {selectedRoute && (
        <div className="border border-slate-200 rounded-xl p-3 bg-slate-50/50 space-y-2.5">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-800">
            <span className="flex items-center gap-1.5">
              <Navigation className="w-3.5 h-3.5 text-slate-500" />
              {isHindi ? 'मोड़-दर-मोड़ मार्गदर्शन' : isUrdu ? 'موڑ بہ موڑ راستہ' : 'Turn-by-Turn Guidance'}
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleSpeakAdvisory}
                className={`text-[11px] font-semibold px-2 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                  isPlayingAudio
                    ? 'bg-amber-500 text-slate-950 animate-pulse'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 shadow-2xs'
                }`}
                title={t.listenAudio}
              >
                {isPlayingAudio ? (
                  <>
                    <VolumeX className="w-3 h-3 text-rose-600" />
                    <span>{isHindi ? 'रोकें' : 'Stop'}</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-3 h-3 text-slate-600" />
                    <span>{isHindi ? 'ऑडियो गाइड' : 'Audio Guide'}</span>
                  </>
                )}
              </button>
              {selectedRoute.isBypass && (
                <span className="text-[10px] text-emerald-700 font-medium bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-200">
                  {isHindi ? 'साफ़ मार्ग' : 'Clear Route'}
                </span>
              )}
            </div>
          </div>

          <ol className="space-y-1.5 text-[11px] text-slate-600">
            {selectedRoute.stepInstructions.map((step, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-700 font-semibold text-[9px] flex items-center justify-center shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>

          {/* Live Auto Ride Button in Route Planner */}
          {onStartRide && (
            <div className="pt-2 border-t border-slate-200/80">
              {liveRideState && liveRideState.isActive ? (
                <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-2.5 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg animate-bounce">🛺</span>
                    <div className="text-xs">
                      <div className="font-semibold text-emerald-950 flex items-center gap-1">
                        <span>{t.rideOngoing}</span>
                        <span className="text-[10px] bg-emerald-200/80 text-emerald-900 px-1.5 py-0.2 rounded-full font-bold">
                          {Math.round(liveRideState.progressPercent)}%
                        </span>
                      </div>
                      <div className="text-[11px] text-emerald-800">
                        {t.remainingDist}: <b>{liveRideState.distanceRemainingKm} km</b> • ~{liveRideState.timeRemainingMin} {isHindi ? 'मिनट' : 'min'}
                      </div>
                    </div>
                  </div>
                  {onStopRide && (
                    <button
                      onClick={onStopRide}
                      className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg shrink-0 shadow-2xs cursor-pointer"
                    >
                      {t.stopNavigation}
                    </button>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => onStartRide(true)}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 shadow-2xs transition-all active:scale-95 cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>{t.startNavigation}</span>
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
