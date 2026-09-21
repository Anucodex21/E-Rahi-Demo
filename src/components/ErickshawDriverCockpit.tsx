import React, { useState } from 'react';
import { 
  Zap, 
  Users, 
  AlertOctagon, 
  CheckCircle2, 
  ShieldAlert, 
  BatteryCharging, 
  Compass, 
  Volume2, 
  Vibrate, 
  Calculator, 
  Sparkles 
} from 'lucide-react';
import { triggerProximityHazardAlert } from '../utils/audioAlerts';
import { AppLanguage } from '../types';
import { TRANSLATIONS } from '../utils/i18n';

interface DriverCockpitProps {
  onQuickReportJam: (laneName: string) => void;
  showChargingStations: boolean;
  onToggleChargingStations: () => void;
  onOpenFareCalculator?: () => void;
  cityName?: string;
  language?: AppLanguage;
}

export const ErickshawDriverCockpit: React.FC<DriverCockpitProps> = ({
  onQuickReportJam,
  showChargingStations,
  onToggleChargingStations,
  onOpenFareCalculator,
  cityName = 'Bareilly',
  language = 'en'
}) => {
  const [testedAlert, setTestedAlert] = useState(false);
  const isHindi = language === 'hi';
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  const handleTestAudioHaptic = () => {
    triggerProximityHazardAlert(cityName === 'Bareilly' ? 'Koharapeer Chauraha' : `${cityName} Junction`, language);
    setTestedAlert(true);
    setTimeout(() => setTestedAlert(false), 3000);
  };

  const laneClearanceStatus = [
    { 
      name: isHindi ? 'कुतुबखाना - नॉवल्टी सिनेमा गली' : 'Kutubkhana - Novelty Cinema Gali', 
      width: '10 ft', 
      status: isHindi ? 'जाम / अवरुद्ध' : 'Blocked', 
      detail: isHindi ? 'ठेले व दोहरी पार्किंग' : 'Carts + dual parking', 
      safe: false 
    },
    { 
      name: isHindi ? 'कोहाड़ापीर सब्जी मंडी कट' : 'Koharapeer Sabzi Mandi Cut', 
      width: '14 ft', 
      status: isHindi ? 'धीमी गति' : 'Heavy Crawl', 
      detail: isHindi ? 'सवारी चढ़ने-उतरने की कतार' : 'Passenger boarding queue', 
      safe: false 
    },
    { 
      name: isHindi ? 'शाहमतगंज फ्लाईओवर निचली लेन' : 'Shahamatganj Flyover Lower Lane', 
      width: '22 ft', 
      status: isHindi ? 'सुगम व तेज़' : 'Clear & Fast', 
      detail: isHindi ? 'ई-रिक्शा के लिए साफ़ मार्ग' : 'Smooth flow for rickshaws', 
      safe: true 
    },
    { 
      name: isHindi ? 'बरेली जंक्शन गेट 2 (सुभाष नगर लिंक)' : 'Bareilly Jn Gate 2 (Subhash Nagar Link)', 
      width: '18 ft', 
      status: isHindi ? 'सुगम व तेज़' : 'Clear & Fast', 
      detail: isHindi ? 'वैकल्पिक स्टेशन निकास' : 'Alternative station exit', 
      safe: true 
    }
  ];

  const highDemandHotspots = [
    { 
      hub: isHindi ? 'बरेली जंक्शन (गेट 1)' : 'Bareilly Jn (Gate 1)', 
      reason: isHindi ? 'श्रमजीवी एक्सप्रेस ट्रेन पहुंची' : 'Train Shramjeevi Express arrived', 
      riders: isHindi ? '150+ सवारियां उपलब्ध' : '150+ waiting', 
      fare: isHindi ? '₹15/सवारी सैटेलाइट तक' : '₹15/seat to Satellite' 
    },
    { 
      hub: isHindi ? 'सैटेलाइट बस डिपो' : 'Satellite Bus Depot', 
      reason: isHindi ? 'दिल्ली व लखनऊ बसें पहुंची' : 'Delhi & Lucknow buses inbound', 
      riders: isHindi ? '80+ सवारियां उपलब्ध' : '80+ waiting', 
      fare: isHindi ? '₹20/सवारी चौक तक' : '₹20/seat to Chowk' 
    },
    { 
      hub: isHindi ? 'IVRI / डेलापीर गेट' : 'IVRI / Delapeer Gate', 
      reason: isHindi ? 'शाम की कॉलेज छुट्टी' : 'Evening university shift close', 
      riders: isHindi ? '45+ सवारियां उपलब्ध' : '45+ waiting', 
      fare: isHindi ? '₹10/सवारी अयूब खान तक' : '₹10/seat to Ayub Khan' 
    }
  ];

  return (
    <div className="bg-gradient-to-br from-amber-500/10 via-white to-amber-500/5 rounded-xl border-2 border-amber-400 p-4 space-y-4 shadow-sm">
      {/* Cockpit Banner */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-amber-500 text-white rounded-lg shadow-sm">
            <span className="text-lg">🛺</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-sm text-slate-950">
                {isHindi ? `ई-रिक्शा चालक कॉकपिट (${cityName})` : `E-Rickshaw Driver Cockpit (${cityName})`}
              </h3>
              <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                {cityName} Smart Driver
              </span>
            </div>
            <p className="text-[11px] text-slate-600">
              {isHindi ? 'जाम से बचें, यात्री मांग देखें और बैटरी स्टेशन खोजें' : 'Avoid chokepoints, track rider demand hotspots & locate charging stations'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onOpenFareCalculator && (
            <button
              onClick={onOpenFareCalculator}
              className="text-xs font-bold px-2.5 py-1.5 rounded-lg border border-amber-400 bg-amber-100 hover:bg-amber-200 text-amber-950 flex items-center gap-1.5 transition-all shadow-xs"
            >
              <Calculator className="w-3.5 h-3.5 text-amber-700" />
              <span>{isHindi ? 'किराया दर' : 'Fare Rates'}</span>
            </button>
          )}

          <button
            onClick={onToggleChargingStations}
            className={`text-xs font-bold px-3 py-1.5 rounded-lg border flex items-center gap-1.5 transition-all ${
              showChargingStations
                ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm'
                : 'bg-white text-emerald-700 border-emerald-300 hover:bg-emerald-50'
            }`}
          >
            <BatteryCharging className="w-4 h-4" />
            <span>{showChargingStations ? (isHindi ? 'स्टेशन दिख रहे हैं' : 'Hubs Active') : (isHindi ? 'चार्जिंग स्टेशन' : 'Charging Hubs')}</span>
          </button>
        </div>
      </div>

      {/* Quick 1-Tap Jam Reporter for Drivers on the road */}
      <div className="bg-white rounded-lg p-3 border border-amber-200 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
            <AlertOctagon className="w-4 h-4 text-rose-600" />
            {isHindi ? '1-टैप जाम रिपोर्ट (चलते-चलते सूचना दें)' : '1-Tap Jam Flag (Instant Report)'}
          </span>
          <span className="text-[10px] text-slate-400">
            {isHindi ? 'सभी ड्राइवरों को तुरंत अलर्ट जाता है' : 'Broadcasts to nearby drivers'}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { id: 'Kutubkhana', label: isHindi ? 'कुतुबखाना' : 'Kutubkhana' },
            { id: 'Koharapeer', label: isHindi ? 'कोहाड़ापीर' : 'Koharapeer' },
            { id: 'Shyamganj', label: isHindi ? 'श्यामगंज' : 'Shyamganj' },
            { id: 'Station Rd', label: isHindi ? 'स्टेशन रोड' : 'Station Rd' }
          ].map((choke) => (
            <button
              key={choke.id}
              onClick={() => onQuickReportJam(choke.id)}
              className="px-2.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold transition-all active:scale-95 text-center flex flex-col items-center justify-center gap-0.5"
            >
              <span className="text-[10px] text-rose-500 font-semibold">{isHindi ? 'जाम है' : 'Gridlock'}</span>
              <span>{choke.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Real Bareilly Lane Width & Obstruction Live Status */}
      <div className="bg-white rounded-lg p-3 border border-amber-200 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
            <Compass className="w-4 h-4 text-amber-600" />
            {isHindi ? 'गलियों की चौड़ाई व निकासी स्थिति' : 'Narrow Alley Clearance Status'}
          </span>
          <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded">
            {isHindi ? '4.5 फीट रिक्शा अनुकूल' : '4.5ft E-Rickshaw Fit'}
          </span>
        </div>

        <div className="space-y-1.5">
          {laneClearanceStatus.map((lane, idx) => (
            <div
              key={idx}
              className={`p-2 rounded-lg border text-xs flex items-center justify-between ${
                lane.safe
                  ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                  : 'bg-rose-50/70 border-rose-200 text-rose-950'
              }`}
            >
              <div className="min-w-0 pr-2">
                <div className="font-bold flex items-center gap-1.5 truncate">
                  <span>{lane.safe ? '🟢' : '🔴'}</span>
                  <span className="truncate">{lane.name}</span>
                  <span className="text-[10px] bg-white/80 px-1 py-0.2 rounded border font-mono">
                    {lane.width}
                  </span>
                </div>
                <div className="text-[10px] text-slate-600 mt-0.5 pl-4">
                  {lane.detail}
                </div>
              </div>

              <span
                className={`text-[10px] font-black px-2 py-0.5 rounded shrink-0 ${
                  lane.safe
                    ? 'bg-emerald-200 text-emerald-900'
                    : 'bg-rose-200 text-rose-900'
                }`}
              >
                {lane.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* High-Earning Passenger Demand Hotspots */}
      <div className="bg-white rounded-lg p-3 border border-amber-200 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
            <Users className="w-4 h-4 text-blue-600" />
            {isHindi ? 'सवारी मांग केंद्र (जहाँ तुरंत पैसेंजर मिलें)' : 'High Demand Rider Hotspots'}
          </span>
          <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5">
            <Sparkles className="w-3 h-3" />
            {isHindi ? 'उच्च कमाई अवसर' : 'Surge Earnings'}
          </span>
        </div>

        <div className="space-y-1.5">
          {highDemandHotspots.map((hotspot, idx) => (
            <div
              key={idx}
              className="p-2 bg-blue-50/50 border border-blue-200 rounded-lg text-xs flex items-center justify-between"
            >
              <div>
                <div className="font-bold text-slate-900">{hotspot.hub}</div>
                <div className="text-[10px] text-slate-500">{hotspot.reason}</div>
              </div>
              <div className="text-right">
                <div className="font-extrabold text-blue-700 text-xs">{hotspot.riders}</div>
                <div className="text-[10px] text-emerald-700 font-semibold">{hotspot.fare}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Proximity Sound & Vibration Test */}
      <div className="flex items-center justify-between pt-1 text-xs">
        <span className="text-[11px] text-slate-500 font-medium">
          {isHindi ? 'आसपास जाम होने पर ड्राइवर को आवाज व कंपन से अलर्ट' : 'Proximity Voice & Haptic Jam Alerts'}
        </span>
        <button
          onClick={handleTestAudioHaptic}
          className={`px-3 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-1.5 transition-all ${
            testedAlert
              ? 'bg-amber-500 text-slate-950 border-amber-600'
              : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
          }`}
        >
          <Volume2 className="w-3.5 h-3.5 text-amber-600" />
          <span>{testedAlert ? (isHindi ? 'अलर्ट बज रहा है' : 'Alert Triggered') : (isHindi ? 'साउंड टेस्ट' : 'Test Alert Sound')}</span>
        </button>
      </div>
    </div>
  );
};
