import React, { useState } from 'react';
import { TRAFFIC_POLICE_NOTICES } from '../data/bareillyData';
import { AppLanguage } from '../types';
import { Shield, ExternalLink, AlertCircle, CheckCircle2, Volume2, VolumeX } from 'lucide-react';
import { speakCleanVoice, stopVoice, playCleanChime } from '../utils/audioAlerts';

interface TrafficPoliceProps {
  cityName?: string;
  language?: AppLanguage;
  notices?: {
    id: string;
    title: string;
    hindiTitle: string;
    summary: string;
    badge: string;
    badgeColor: string;
  }[];
}

export const TrafficPoliceAdvisoryBanner: React.FC<TrafficPoliceProps> = ({
  cityName = 'Bareilly',
  language = 'hi',
  notices = TRAFFIC_POLICE_NOTICES
}) => {
  const [activeSpeakingId, setActiveSpeakingId] = useState<string | null>(null);
  const isHindi = language === 'hi';
  const isUrdu = language === 'ur';

  const displayNotices = (notices && notices.length > 0) ? notices : TRAFFIC_POLICE_NOTICES;

  const handleSpeakNotice = (notice: typeof displayNotices[0]) => {
    if (activeSpeakingId === notice.id) {
      stopVoice();
      setActiveSpeakingId(null);
      return;
    }

    playCleanChime('alert');
    const text = isHindi
      ? `${cityName} ट्रैफिक पुलिस सूचना: ${notice.hindiTitle}। ${notice.summary}`
      : `${cityName} Traffic Police Advisory: ${notice.title}. ${notice.summary}`;
    speakCleanVoice(
      text,
      language,
      () => setActiveSpeakingId(notice.id),
      () => setActiveSpeakingId(null)
    );
  };

  return (
    <div className="bg-slate-900 text-white rounded-xl p-4 shadow-sm border border-slate-800 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-blue-600 rounded-lg text-white">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-xs tracking-wide uppercase text-blue-300">
                {isHindi ? `${cityName} ट्रैफिक पुलिस आधिकारिक सूचना` : `${cityName} Traffic Police Citizen Advisory`}
              </h3>
              <span className="bg-blue-500/20 text-blue-300 border border-blue-400/30 text-[9px] font-bold px-1.5 py-0.5 rounded">
                {isHindi ? 'सत्यापित' : 'Official Sync'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              {isHindi ? `${cityName} में सक्रिय डायवर्जन व ई-रिक्शा नियम` : `Active traffic diversions & E-rickshaw regulatory guidelines for ${cityName}`}
            </p>
          </div>
        </div>

        <span className="text-xs text-blue-400 flex items-center gap-1 font-medium">
          <Shield className="w-3 h-3 text-blue-400" />
          <span>{cityName} {isHindi ? 'पुलिस पोर्टल' : 'Police E-Portal'}</span>
        </span>
      </div>

      {/* Advisory Cards Carousel / Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
        {displayNotices.map((notice) => (
          <div
            key={notice.id}
            className="bg-slate-800/80 border border-slate-700/80 rounded-lg p-2.5 space-y-1 hover:border-slate-600 transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className={`text-[9px] font-bold text-white px-1.5 py-0.5 rounded ${notice.badgeColor}`}>
                {notice.badge}
              </span>
              <button
                onClick={() => handleSpeakNotice(notice)}
                className={`px-1.5 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 transition-all ${
                  activeSpeakingId === notice.id
                    ? 'bg-amber-400 text-slate-950 font-black animate-pulse'
                    : 'bg-slate-700 hover:bg-slate-600 text-amber-300'
                }`}
                title={isHindi ? 'बोलकर सुनें' : 'Listen via audio'}
              >
                {activeSpeakingId === notice.id ? (
                  <>
                    <VolumeX className="w-3 h-3 text-rose-600" />
                    <span>{isHindi ? 'रोकें' : 'Stop'}</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-3 h-3 text-amber-300" />
                    <span>🔊 {isHindi ? 'सुनें' : 'Listen'}</span>
                  </>
                )}
              </button>
            </div>
            <h4 className="font-bold text-slate-100 text-xs leading-snug">
              {isHindi ? notice.hindiTitle : notice.title}
            </h4>
            <div className="text-[10px] text-slate-400 font-medium">
              {isHindi ? notice.title : notice.hindiTitle}
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed pt-0.5">{notice.summary}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
