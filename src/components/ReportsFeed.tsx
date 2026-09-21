import React, { useState } from 'react';
import { ReportCategory, TrafficReport, AppLanguage } from '../types';
import { ThumbsUp, CheckCircle, ShieldAlert, Clock, MapPin, Sparkles, Filter } from 'lucide-react';
import { TRANSLATIONS } from '../utils/i18n';

interface ReportsFeedProps {
  reports: TrafficReport[];
  onVoteReport: (reportId: string, type: 'up' | 'down' | 'cleared') => void;
  onFocusReportOnMap: (report: TrafficReport) => void;
  onOpenReportModal: () => void;
  language?: AppLanguage;
  cityName?: string;
}

export const ReportsFeed: React.FC<ReportsFeedProps> = ({
  reports,
  onVoteReport,
  onFocusReportOnMap,
  onOpenReportModal,
  language = 'hi',
  cityName = 'Bareilly'
}) => {
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const isHindi = language === 'hi';
  const isUrdu = language === 'ur';
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  const filteredReports = filterCategory === 'all'
    ? reports
    : reports.filter(r => r.category === filterCategory);

  const getRelativeTime = (isoString: string) => {
    try {
      const diffMs = Date.now() - new Date(isoString).getTime();
      const mins = Math.max(1, Math.round(diffMs / (1000 * 60)));
      if (mins < 60) return isHindi ? `${mins} मिनट पहले` : `${mins}m ago`;
      const hours = Math.round(mins / 60);
      return isHindi ? `${hours} घंटे पहले` : `${hours}h ago`;
    } catch {
      return isHindi ? 'अभी-अभी' : 'Just now';
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-3.5">
      {/* Feed Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>
          <h3 className="text-sm font-bold text-slate-900">
            {isHindi ? `${cityName} लाइव ट्रैफिक व जाम अलर्ट` : `${cityName} Live Incident Feed`}
          </h3>
        </div>

        <button
          onClick={onOpenReportModal}
          className="bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs px-3 py-1.5 rounded-lg shadow-sm transition-all active:scale-95 flex items-center gap-1"
        >
          <span>{isHindi ? '+ जाम रिपोर्ट करें' : '+ Flag Jam'}</span>
        </button>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 text-xs">
        {[
          { id: 'all', label: isHindi ? 'सभी अलर्ट' : 'All Alerts' },
          { id: 'erickshaw_gridlock', label: isHindi ? '🛺 ई-रिक्शा जाम' : '🛺 Rickshaw Jam' },
          { id: 'bottleneck', label: isHindi ? '🛑 संकरी गली' : '🛑 Narrow Lane' },
          { id: 'festive_rush', label: isHindi ? '🎪 भीड़' : '🎪 Rush' },
          { id: 'railway_crossing', label: isHindi ? '🚂 रेलवे फाटक' : '🚂 Fatak' },
          { id: 'police_diversion', label: isHindi ? '👮 पुलिस चेकिंग' : '👮 Police Check' }
        ].map((cat) => (
          <button
            key={cat.id}
            onClick={() => setFilterCategory(cat.id)}
            className={`whitespace-nowrap px-2.5 py-1 rounded-full text-[11px] font-medium transition-all ${
              filterCategory === cat.id
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Report Cards List */}
      <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
        {filteredReports.length === 0 ? (
          <div className="text-center py-6 text-slate-400 text-xs">
            {isHindi ? 'इस श्रेणी में कोई घटना दर्ज नहीं। मार्ग साफ है!' : 'No incidents reported in this category. All clear!'}
          </div>
        ) : (
          filteredReports.map((report) => {
            const isCritical = report.severity === 'critical';
            const isHeavy = report.severity === 'heavy';
            const isClearing = report.severity === 'clearing';

            const severityBadge = isClearing
              ? { text: isHindi ? 'खुल रहा है' : 'Clearing / Moving', bg: 'bg-emerald-100 text-emerald-800' }
              : isCritical
              ? { text: isHindi ? 'भारी जाम / ठहराव' : 'Critical Deadlock', bg: 'bg-rose-100 text-rose-800' }
              : isHeavy
              ? { text: isHindi ? 'धीमा ट्रैफिक' : 'Heavy Crawl', bg: 'bg-amber-100 text-amber-800' }
              : { text: isHindi ? 'हल्की रुकावट' : 'Moderate Slowdown', bg: 'bg-blue-100 text-blue-800' };

            return (
              <div
                key={report.id}
                className="border border-slate-200/90 rounded-lg p-3 bg-slate-50/50 hover:bg-white hover:border-slate-300 transition-all space-y-2"
              >
                {/* Header row */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-bold text-xs text-slate-900 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-rose-500" />
                      {report.locationName}
                    </span>
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${severityBadge.bg}`}>
                      {severityBadge.text}
                    </span>
                    {report.verifiedByPolice && (
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 flex items-center gap-0.5">
                        <CheckCircle className="w-2.5 h-2.5" />
                        {isHindi ? 'पुलिस द्वारा सत्यापित' : 'Police Verified'}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400 shrink-0 flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5" />
                    {getRelativeTime(report.reportedAt)}
                  </span>
                </div>

                {/* Title and Description */}
                <div>
                  <h4 className="text-xs font-semibold text-slate-800 leading-snug">{report.title}</h4>
                  <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">{report.description}</p>
                </div>

                {/* Footer and voting */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs">
                  <div className="text-[10px] text-slate-500">
                    {isHindi ? 'द्वारा: ' : 'By '}{report.userType === 'erickshaw_driver' ? (isHindi ? '🛺 ई-रिक्शा चालक' : '🛺 Rickshaw Driver') : (isHindi ? '🚶 यात्री' : '🚶 Commuter')}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onVoteReport(report.id, 'up')}
                      className="px-2 py-1 rounded bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-[11px] font-medium flex items-center gap-1 active:scale-95 transition-all"
                      title={isHindi ? 'पुष्टि करें कि जाम अभी भी है' : 'Confirm this jam is still present'}
                    >
                      <ThumbsUp className="w-3 h-3 text-amber-600" />
                      <span>{isHindi ? `जाम अभी भी है (${report.upvotes})` : `Still Jammed (${report.upvotes})`}</span>
                    </button>

                    <button
                      onClick={() => onVoteReport(report.id, 'cleared')}
                      className="px-2 py-1 rounded bg-white hover:bg-emerald-50 border border-slate-200 text-emerald-700 text-[11px] font-medium flex items-center gap-1 active:scale-95 transition-all"
                      title={isHindi ? 'जाम खुल गया है' : 'Mark as cleared / moving freely'}
                    >
                      <CheckCircle className="w-3 h-3 text-emerald-600" />
                      <span>{isHindi ? 'खुल गया' : 'Clear'}</span>
                    </button>

                    <button
                      onClick={() => onFocusReportOnMap(report)}
                      className="px-2 py-1 rounded bg-slate-900 text-white text-[11px] font-medium hover:bg-slate-800 transition-colors"
                      title={isHindi ? 'मानचित्र पर देखें' : 'Highlight location on map'}
                    >
                      {isHindi ? 'देखें' : 'View'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
