import React from 'react';
import { ChokeZoneInfo, AppLanguage } from '../types';
import { Activity, Gauge, TrendingUp, AlertTriangle, RefreshCw } from 'lucide-react';

interface BottleneckAnalyticsProps {
  chokeZones: ChokeZoneInfo[];
  onSimulateSurge: () => void;
  isSurgeActive: boolean;
  language?: AppLanguage;
  cityName?: string;
}

export const BottleneckAnalytics: React.FC<BottleneckAnalyticsProps> = ({
  chokeZones,
  onSimulateSurge,
  isSurgeActive,
  language = 'hi',
  cityName = 'Bareilly'
}) => {
  const isHindi = language === 'hi';
  const isUrdu = language === 'ur';

  const avgCongestion = Math.round(
    chokeZones.reduce((acc, cz) => acc + cz.congestionScore, 0) / chokeZones.length
  );

  const totalRickshawsInJam = chokeZones.reduce((acc, cz) => acc + cz.activeRickshawsEst, 0);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Activity className="w-4 h-4 text-rose-500" />
          <h3 className="text-sm font-bold text-slate-900">
            {isHindi ? `${cityName} बॉटलनेक व जाम सूचकांक` : `${cityName} Chokepoint Pulse Index`}
          </h3>
        </div>

        <button
          onClick={onSimulateSurge}
          className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all active:scale-95 ${
            isSurgeActive
              ? 'bg-rose-600 text-white shadow-xs'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
          }`}
          title={isHindi ? 'शाम की भीड़ का सिमुलेशन करें' : 'Simulate rush hour spike'}
        >
          <RefreshCw className={`w-3 h-3 ${isSurgeActive ? 'animate-spin' : ''}`} />
          <span>
            {isSurgeActive
              ? (isHindi ? 'शाम की भीड़ सक्रिय' : 'Evening Rush Active')
              : (isHindi ? 'पीक ऑवर सिमुलेट करें' : 'Simulate Rush Hour')}
          </span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-3 gap-2">
        <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-center">
          <div className="text-[10px] uppercase font-bold text-slate-500">
            {isHindi ? 'औसत जाम इंडेक्स' : 'City Choke Index'}
          </div>
          <div className={`text-lg font-black mt-0.5 ${avgCongestion > 75 ? 'text-rose-600' : 'text-amber-600'}`}>
            {avgCongestion}%
          </div>
          <div className="text-[9px] text-slate-400">
            {isHindi ? 'शहर का घनत्व' : 'Peak Inner Gridlock'}
          </div>
        </div>

        <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-center">
          <div className="text-[10px] uppercase font-bold text-slate-500">
            {isHindi ? 'जाम में फंसे रिक्शे' : 'Rickshaws in Jam'}
          </div>
          <div className="text-lg font-black text-slate-800 mt-0.5">
            ~{totalRickshawsInJam}
          </div>
          <div className="text-[9px] text-slate-400">
            {isHindi ? 'सवारी कतार' : 'Unregistered queuing'}
          </div>
        </div>

        <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-center">
          <div className="text-[10px] uppercase font-bold text-slate-500">
            {isHindi ? 'औसत समय बचत' : 'Bypass Detour Avg'}
          </div>
          <div className="text-lg font-black text-emerald-600 mt-0.5">
            -18 {isHindi ? 'मि' : 'min'}
          </div>
          <div className="text-[9px] text-slate-400">
            {isHindi ? 'स्मार्ट रूट से' : 'Time saved per trip'}
          </div>
        </div>
      </div>

      {/* Bottleneck Progress Bars */}
      <div className="space-y-2 pt-1">
        {chokeZones.map((cz) => {
          const isCritical = cz.congestionScore > 80;
          return (
            <div key={cz.id} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-800 truncate">{cz.name}</span>
                <span className={`font-bold ${isCritical ? 'text-red-600' : 'text-amber-600'}`}>
                  {cz.congestionScore}% ({isHindi ? (cz.status === 'Critical Standstill' ? 'गंभीर' : cz.status === 'Heavy Crawl' ? 'धीमा' : cz.status === 'Moderate' ? 'मध्यम' : 'सुगम') : cz.status})
                </span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isCritical ? 'bg-red-600' : 'bg-amber-500'
                  }`}
                  style={{ width: `${cz.congestionScore}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
