import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Calendar, 
  MapPin, 
  AlertTriangle, 
  ExternalLink, 
  PhoneCall, 
  FileText, 
  CheckCircle2, 
  ChevronRight, 
  Info 
} from 'lucide-react';
import { AppLanguage } from '../types';

export interface PoliceAdvisoryNotice {
  id: string;
  category: 'Festival' | 'Construction' | 'Emergency Diversion' | 'Night Restriction';
  title: string;
  hindiTitle: string;
  eventDate: string;
  status: 'ACTIVE NOW' | 'UPCOMING' | 'PERMANENT RULE';
  restrictedZone: string;
  alternateRoute: string;
  rickshawRules: string;
  policeOrderRef: string;
}

const POLICE_ADVISORIES: PoliceAdvisoryNotice[] = [
  {
    id: 'pol-urs-razvi',
    category: 'Festival',
    title: 'Urs-e-Razvi (Dargah Ala Hazrat) Congestion Plan',
    hindiTitle: 'उर्स-ए-रजवी यातायात डायवर्जन व्यवस्था',
    eventDate: 'Annual Event / Peak Rush Alert',
    status: 'ACTIVE NOW',
    restrictedZone: 'Qila to Kutubkhana Inner Bazaar & Novelty Chauraha',
    alternateRoute: 'Divert through Subhash Nagar Railway Overbridge & Shahamatganj Flyover',
    rickshawRules: 'Unregistered E-rickshaws strictly barred inside Chowk core. Designated parking at Islamia Inter College Ground.',
    policeOrderRef: 'BTP/TRAFFIC/DIV/2026-88'
  },
  {
    id: 'pol-kanwar',
    category: 'Festival',
    title: 'Kanwar Yatra Bareilly Highway Route Corridor',
    hindiTitle: 'कांवड़ यात्रा मार्ग सुरक्षा एवं सर्विस लेन व्यवस्था',
    eventDate: 'Shravan Pilgrimage Corridor',
    status: 'UPCOMING',
    restrictedZone: 'NH-24 Bareilly bypass & Satellite Bus Station exit',
    alternateRoute: 'Use designated outer service lanes; main carriage-way reserved for pilgrims',
    rickshawRules: 'E-rickshaws must not cross highway divider cuts near Satellite Stand.',
    policeOrderRef: 'BTP/HIGHWAY/DIV-04'
  },
  {
    id: 'pol-kutubkhana',
    category: 'Construction',
    title: 'Kutubkhana Elevated Corridor One-Way Regulations',
    hindiTitle: 'कुतुबखाना ओवरब्रिज व नीचे का एकतरफा ट्रैफिक नियम',
    eventDate: 'Daily (4:00 PM - 9:00 PM)',
    status: 'PERMANENT RULE',
    restrictedZone: 'Underpass market lanes between Ghanta Ghar and Koharapeer turn',
    alternateRoute: 'Light vehicles use elevated flyover; passenger rickshaws use Patel Chowk outer cut',
    rickshawRules: 'No boarding or halting allowed underneath flyover pillars.',
    policeOrderRef: 'BTP/COMMISSIONER/ORD-12'
  },
  {
    id: 'pol-delhapeer-mandi',
    category: 'Emergency Diversion',
    title: 'Delhapeer Vegetable Mandi Morning Unloading Protocol',
    hindiTitle: 'डेलापीर सब्जी मंडी सुबह की लोडिंग-अनलोडिंग गाइडलाइन',
    eventDate: 'Every Morning 5:00 AM - 10:00 AM',
    status: 'ACTIVE NOW',
    restrictedZone: 'Pilibhit Bypass entry towards Delhapeer Chauraha',
    alternateRoute: 'Use Stadium Road link road for commuter passage',
    rickshawRules: 'Double-row parking by e-rickshaws subject to immediate ₹500 e-challan by Bareilly Traffic Police.',
    policeOrderRef: 'BTP/MANDI/CHALLAN-90'
  }
];

interface Props {
  language: AppLanguage;
  onClose?: () => void;
}

export const FestivalPoliceBulletin: React.FC<Props> = ({ language, onClose }) => {
  const [selectedNotice, setSelectedNotice] = useState<PoliceAdvisoryNotice>(POLICE_ADVISORIES[0]);
  const [filterCategory, setFilterCategory] = useState<string>('ALL');

  const filtered = filterCategory === 'ALL' 
    ? POLICE_ADVISORIES 
    : POLICE_ADVISORIES.filter(n => n.category === filterCategory);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-4 text-slate-800">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-blue-600 text-white rounded-xl shadow-xs font-bold">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">
                Bareilly Traffic Police Bulletin
              </h2>
              <span className="text-[10px] font-black bg-blue-100 text-blue-900 px-1.5 py-0.5 rounded uppercase">
                Official
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Live festival diversions, one-way orders, and e-rickshaw regulation zones
            </p>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1"
          >
            ✕
          </button>
        )}
      </div>

      {/* Official Contact & Citizen Helpline Bar */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-3 rounded-xl flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <PhoneCall className="w-4 h-4 text-amber-400 shrink-0" />
          <div>
            <span className="font-bold">Bareilly Traffic Police Helpline:</span>
            <span className="text-amber-300 ml-1.5 font-extrabold">0581-2555555 / 112</span>
          </div>
        </div>
        <a
          href="https://www.bareillytrafficpolice.in/citizen-services"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[11px] text-blue-300 hover:text-white flex items-center gap-1 font-semibold underline"
        >
          <span>Citizen Portal</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-bold">
        {['ALL', 'Festival', 'Construction', 'Emergency Diversion'].map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
              filterCategory === cat
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {cat === 'ALL' ? 'All Notices (सभी)' : cat}
          </button>
        ))}
      </div>

      {/* Notice List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filtered.map((notice) => {
          const isSelected = selectedNotice.id === notice.id;
          return (
            <div
              key={notice.id}
              onClick={() => setSelectedNotice(notice)}
              className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                isSelected 
                  ? 'border-blue-500 bg-blue-50/50 shadow-xs ring-1 ring-blue-400' 
                  : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                  notice.status === 'ACTIVE NOW' 
                    ? 'bg-rose-500 text-white' 
                    : notice.status === 'UPCOMING'
                    ? 'bg-amber-500 text-white'
                    : 'bg-slate-200 text-slate-800'
                }`}>
                  {notice.status}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {notice.policeOrderRef}
                </span>
              </div>

              <div className="font-bold text-xs text-slate-900 mt-2">
                {notice.title}
              </div>
              <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                {notice.hindiTitle}
              </div>

              <div className="text-[11px] text-slate-600 mt-2 space-y-1">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
                  <span className="truncate"><b>Zone:</b> {notice.restrictedZone}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Notice Deep Dive Details */}
      {selectedNotice && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2.5 text-xs">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <div className="font-extrabold text-sm text-slate-900">
              {selectedNotice.title}
            </div>
            <span className="text-[11px] font-semibold text-slate-500">
              {selectedNotice.eventDate}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-rose-700 uppercase flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Restricted Choke Area:</span>
              </span>
              <p className="text-slate-700 leading-relaxed text-[11px] bg-white p-2 rounded-lg border border-slate-200">
                {selectedNotice.restrictedZone}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-bold text-emerald-700 uppercase flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Recommended Alternate Route:</span>
              </span>
              <p className="text-slate-700 leading-relaxed text-[11px] bg-white p-2 rounded-lg border border-slate-200">
                {selectedNotice.alternateRoute}
              </p>
            </div>
          </div>

          <div className="bg-amber-50 p-2.5 rounded-lg border border-amber-200 text-amber-900 space-y-0.5">
            <div className="font-bold text-[11px]">🛺 E-Rickshaw Specific Order:</div>
            <p className="text-[11px] leading-relaxed">{selectedNotice.rickshawRules}</p>
          </div>
        </div>
      )}

    </div>
  );
};
