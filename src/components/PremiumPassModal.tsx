import React, { useState } from 'react';
import { Crown, Check, ShieldCheck, Sparkles, X, Star, Eye, EyeOff, Zap, Building2, BedDouble, GraduationCap, Store } from 'lucide-react';
import { playCleanChime } from '../utils/audioAlerts';

interface PremiumPassModalProps {
  isOpen: boolean;
  onClose: () => void;
  isPremium: boolean;
  onActivatePremium: () => void;
  language?: string;
}

export const PremiumPassModal: React.FC<PremiumPassModalProps> = ({
  isOpen,
  onClose,
  isPremium,
  onActivatePremium,
  language = 'hi'
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const isHindi = language === 'hi';

  if (!isOpen) return null;

  const handleSubscribe = () => {
    setIsProcessing(true);
    playCleanChime('fare');
    setTimeout(() => {
      onActivatePremium();
      setIsProcessing(false);
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-[2500] flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-slate-900 border-2 border-amber-500/40 rounded-3xl p-5 sm:p-6 text-white shadow-2xl overflow-hidden">
        
        {/* Glow Accent */}
        <div className="absolute -top-16 -right-16 w-44 h-44 bg-gradient-to-br from-amber-500/25 to-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-44 h-44 bg-gradient-to-tr from-amber-600/20 to-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 p-1.5 rounded-full text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Crown Badge */}
        <div className="flex items-center gap-2 mb-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 flex items-center justify-center shadow-lg shadow-amber-500/20 font-black">
            <Crown className="w-5 h-5 fill-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-lg font-black tracking-tight text-white">
                E-Rahi City Gold Pass
              </h3>
              <span className="text-[10px] bg-amber-400/20 border border-amber-400/40 text-amber-300 font-extrabold px-1.5 py-0.5 rounded-md uppercase">
                VIP
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              {isHindi ? 'सभी अस्पताल, घंटे के होटल व कॉलेज अनलॉक करें' : 'Unlock all hospitals, hourly hotels & colleges'}
            </p>
          </div>
        </div>

        {/* Price Tag Highlight */}
        <div className="bg-gradient-to-r from-amber-500/15 via-slate-800 to-emerald-500/15 border border-amber-500/30 rounded-2xl p-4 my-4 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-amber-300 font-bold uppercase tracking-wider block">
              {isHindi ? 'सस्ता व छात्र-सुलभ प्लान' : 'Budget Student & Commuter Pass'}
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-3xl font-black text-white">₹49</span>
              <span className="text-xs text-slate-400 font-medium">/ {isHindi ? 'प्रति माह' : 'month'}</span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/80 border border-emerald-500/40 px-2 py-1 rounded-lg">
              {isHindi ? 'कोई छुपा शुल्क नहीं' : 'No Hidden Charges'}
            </span>
            <p className="text-[10px] text-slate-400 mt-1">₹1.6 / day</p>
          </div>
        </div>

        {/* Features Checklist */}
        <div className="space-y-2.5 text-xs text-slate-200 mb-5">
          <div className="flex items-start gap-2.5">
            <div className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
              <Check className="w-3.5 h-3.5 stroke-[3]" />
            </div>
            <div>
              <strong className="text-white font-bold">{isHindi ? 'अस्पताल व डॉक्टर अनलॉक' : 'Full Hospital & Doctor Info'}</strong>
              <p className="text-[11px] text-slate-400">
                {isHindi ? 'विशेषज्ञ डॉक्टर, मोबाइल नंबर, ओपीडी समय व बेड उपलब्धता की अनब्लर लिस्ट।' : 'Unblur all specialist doctors, emergency contacts, OPD fees & live bed counts.'}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <div className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
              <Check className="w-3.5 h-3.5 stroke-[3]" />
            </div>
            <div>
              <strong className="text-white font-bold">{isHindi ? 'घंटे वाले लॉज व होटल (₹99/hr से)' : 'Hourly Lodges & Student Rooms'}</strong>
              <p className="text-[11px] text-slate-400">
                {isHindi ? 'परीक्षा, इंटरव्यू व विश्राम हेतु सत्यापित कमरों के प्रत्यक्ष फोन व पता।' : 'Verified contacts for 2-4 hour short stays & quiet exam prep hubs.'}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <div className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
              <Check className="w-3.5 h-3.5 stroke-[3]" />
            </div>
            <div>
              <strong className="text-white font-bold">{isHindi ? 'कॉलेज व यूनिवर्सिटी बजट रेटिंग' : 'College & University Ratings'}</strong>
              <p className="text-[11px] text-slate-400">
                {isHindi ? 'फीस स्ट्रक्चर, परीक्षा केंद्र अलर्ट व छात्रों की लाइव रेटिंग।' : 'Real-time student ratings, fee ranges, admission helpline & exam centers.'}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <div className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
              <Check className="w-3.5 h-3.5 stroke-[3]" />
            </div>
            <div>
              <strong className="text-white font-bold">{isHindi ? 'स्थानीय क्लीनिक व दुकानों पर 15-25% छूट' : '15-25% Store & Clinic Discounts'}</strong>
              <p className="text-[11px] text-slate-400">
                {isHindi ? 'दवाओं, पैथोलॉजी टेस्ट व किताबों पर विशेष बचत।' : 'Exclusive discounts at verified local pharmacies, diagnostic labs & bookstores.'}
              </p>
            </div>
          </div>
        </div>

        {/* Blur comparison preview mini banner */}
        <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-2.5 mb-5 flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-2">
            <EyeOff className="w-4 h-4 text-slate-500" />
            <span className="text-slate-400">{isHindi ? 'बिना प्रीमियम: केवल 2 परिणाम दृश्य, बाकी धुंधले' : 'Free tier: 2 results visible, rest blurred'}</span>
          </div>
          <div className="flex items-center gap-1 text-amber-400 font-bold">
            <Eye className="w-3.5 h-3.5" />
            <span>100% Unlocked</span>
          </div>
        </div>

        {/* Action Button */}
        {isPremium ? (
          <div className="bg-emerald-950/60 border border-emerald-500/40 rounded-2xl p-3 text-center">
            <span className="text-xs text-emerald-400 font-extrabold flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              {isHindi ? 'आपका गोल्ड प्रीमियम पास सक्रिय है!' : 'Your Gold Pass is Active!'}
            </span>
            <p className="text-[10px] text-slate-400 mt-0.5">
              {isHindi ? 'सभी सेवाएं 30 दिनों के लिए अनलॉक हैं।' : 'All city services unlocked for 30 days.'}
            </p>
          </div>
        ) : (
          <button
            onClick={handleSubscribe}
            disabled={isProcessing}
            className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm rounded-2xl shadow-xl shadow-amber-500/25 transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
          >
            {isProcessing ? (
              <span className="animate-pulse">{isHindi ? 'प्रीमियम सक्रिय हो रहा है...' : 'Activating Pass...'}</span>
            ) : (
              <>
                <Crown className="w-4 h-4 fill-slate-950" />
                <span>{isHindi ? '₹49 में अभी अनलॉक करें (1 महीना)' : 'Unlock All for ₹49 / Month'}</span>
              </>
            )}
          </button>
        )}

        {/* Secure badge */}
        <p className="text-center text-[10px] text-slate-500 mt-3 flex items-center justify-center gap-1">
          <ShieldCheck className="w-3 h-3 text-emerald-400" />
          <span>{isHindi ? 'UPI, Paytm, PhonePe, GPay व कार्ड द्वारा सुरक्षित भुगतान' : 'Secure instant activation via UPI, GPay, Paytm & Cards'}</span>
        </p>
      </div>
    </div>
  );
};
