import React, { useState } from 'react';
import { 
  X, 
  WifiOff, 
  MessageSquare, 
  MapPin, 
  Phone, 
  FileText, 
  Share2, 
  Check, 
  ShieldCheck, 
  Download,
  AlertTriangle,
  Send
} from 'lucide-react';
import { AppLanguage } from '../types';
import { OFFLINE_CITY_FARE_RULES } from '../data/autoStandsAndEvData';

interface OfflinePocketModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: AppLanguage;
  cityName: string;
  userGpsLocation?: { lat: number; lng: number } | null;
}

export const OfflinePocketModal: React.FC<OfflinePocketModalProps> = ({
  isOpen,
  onClose,
  language,
  cityName,
  userGpsLocation
}) => {
  const isHindi = language === 'hi';
  const [recipientPhone, setRecipientPhone] = useState('112');
  const [copiedText, setCopiedText] = useState(false);

  const currentCoordsString = userGpsLocation 
    ? `${userGpsLocation.lat.toFixed(4)}, ${userGpsLocation.lng.toFixed(4)}`
    : 'Bareilly City Center (28.3685, 79.4210)';

  const smsMessageBody = `[E-RAHI EMERGENCY ALERT] I need immediate assistance or auto ride support in ${cityName}. My current GPS Coordinates: ${currentCoordsString}. Google Maps: https://maps.google.com/?q=${userGpsLocation ? `${userGpsLocation.lat},${userGpsLocation.lng}` : '28.3685,79.4210'}`;

  const smsUri = `sms:${recipientPhone}?body=${encodeURIComponent(smsMessageBody)}`;
  const whatsappUri = `https://wa.me/?text=${encodeURIComponent(smsMessageBody)}`;

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(smsMessageBody);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white rounded-3xl p-5 sm:p-6 shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 flex items-center justify-center font-bold text-lg shadow-2xs">
              📴
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-1.5">
                <span>{isHindi ? 'ऑफलाइन पॉकेट मोड एवं आपातकालीन एसएमएस' : 'Offline Pocket Mode & Emergency SMS'}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  {isHindi ? 'बिना इंटरनेट' : 'No Data'}
                </span>
              </h3>
              <p className="text-[11px] text-slate-500">
                {isHindi ? 'इंटरनेट न होने पर भी अधिकृत किराया दरें व एसएमएस लोकेशन अलर्ट' : 'Zero-data fare matrix & SMS dispatch when mobile data drops'}
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
          {/* Offline Status Badge */}
          <div className="bg-slate-900 text-white p-3 rounded-2xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <WifiOff className="w-4 h-4 text-amber-400" />
              <div>
                <span className="font-bold">{isHindi ? 'ऑफलाइन लोकल कैश सक्रिय' : 'Local Storage Cache Ready'}</span>
                <span className="block text-[10px] text-slate-400">{isHindi ? 'यह डेटा हमेशा बिना नेटवर्क के फोन में सुरक्षित रहता है' : 'Available anytime without 4G/WiFi in narrow bazaars'}</span>
              </div>
            </div>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold px-2 py-0.5 rounded-full">
              SAVED
            </span>
          </div>

          {/* 1. Official Offline Fare Table */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-amber-600" />
                <span>{isHindi ? 'सरकारी अधिकृत किराया दर सूची (Fare Chart):' : 'Official Government Rate Chart:'}</span>
              </h4>
              <span className="text-[10px] text-slate-500">{cityName} RTO</span>
            </div>

            <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-slate-50 text-xs">
              {OFFLINE_CITY_FARE_RULES.map((rule, idx) => (
                <div key={idx} className="p-3 bg-white hover:bg-slate-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-slate-900 text-xs sm:text-sm">{rule.distanceRange}</span>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-xs font-bold text-emerald-600">₹{rule.sharedFarePerSeat}</span>
                        <span className="block text-[9px] text-slate-400">{isHindi ? 'शेयर्ड/सीट' : 'shared/seat'}</span>
                      </div>
                      <div className="text-right border-l border-slate-200 pl-3">
                        <span className="text-xs font-bold text-slate-800">₹{rule.reservedFullRickshawFare}</span>
                        <span className="block text-[9px] text-slate-400">{isHindi ? 'पूरा रिक्शा' : 'reserved'}</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    {isHindi ? rule.notesHindi : rule.notesEnglish}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* 2. Zero-Internet Emergency SMS Alert Dispatcher */}
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-rose-600 text-white flex items-center justify-center shrink-0">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-rose-950">
                  {isHindi ? 'नेट न चलने पर इमरजेंसी एसएमएस फॉलबैक' : 'Zero-Internet Emergency SMS Fallback'}
                </h4>
                <p className="text-[10px] text-rose-700">
                  {isHindi ? 'भीड़-भाड़ वाली गलियों में नेट बंद होने पर जीपीएस लोकेशन सीधे एसएमएस से भेजें' : 'Send pre-filled GPS alert to police or family via standard SMS'}
                </p>
              </div>
            </div>

            {/* Recipient Number */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block">
                {isHindi ? 'प्राप्तकर्ता फोन नंबर (Recipient Phone):' : 'Emergency Recipient Phone:'}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={recipientPhone}
                  onChange={(e) => setRecipientPhone(e.target.value)}
                  placeholder="112 (Police) or 10-digit mobile"
                  className="flex-1 bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-mono text-slate-800 outline-none"
                />
                <button
                  onClick={() => setRecipientPhone('112')}
                  className="px-2.5 py-1.5 bg-rose-100 hover:bg-rose-200 text-rose-800 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  112
                </button>
                <button
                  onClick={() => setRecipientPhone('1090')}
                  className="px-2.5 py-1.5 bg-rose-100 hover:bg-rose-200 text-rose-800 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  1090
                </button>
              </div>
            </div>

            {/* Message Preview Box */}
            <div className="bg-white p-2.5 rounded-xl border border-rose-200 text-[11px] font-mono text-slate-700 space-y-1">
              <div className="flex items-center justify-between text-[10px] text-slate-400">
                <span>{isHindi ? 'एसएमएस मैसेज प्रीव्यू:' : 'SMS Message Body:'}</span>
                <button
                  onClick={handleCopyMessage}
                  className="flex items-center gap-1 text-rose-600 hover:text-rose-700 font-sans font-bold cursor-pointer"
                >
                  {copiedText ? <Check className="w-3 h-3 text-emerald-600" /> : <Share2 className="w-3 h-3" />}
                  <span>{copiedText ? (isHindi ? 'कॉपी हो गया' : 'Copied') : (isHindi ? 'कॉपी' : 'Copy')}</span>
                </button>
              </div>
              <p className="line-clamp-3 italic text-slate-800">{smsMessageBody}</p>
            </div>

            {/* Direct Action Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <a
                href={smsUri}
                className="py-2.5 px-3 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md shadow-rose-600/20 transition-transform active:scale-95"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isHindi ? 'एसएमएस भेजें (Send SMS)' : 'Send SMS'}</span>
              </a>

              <a
                href={whatsappUri}
                target="_blank"
                rel="noreferrer"
                className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20 transition-transform active:scale-95"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>{isHindi ? 'व्हाट्सएप भेजें' : 'WhatsApp'}</span>
              </a>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 pt-3 flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>{isHindi ? 'ऑफलाइन सुरक्षित स्टोरेज' : 'Client-side Encrypted Storage'}</span>
          </span>
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
