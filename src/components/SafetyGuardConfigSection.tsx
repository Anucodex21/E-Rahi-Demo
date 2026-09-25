import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  User, 
  Phone, 
  Heart, 
  Check, 
  CheckCircle2, 
  Send, 
  PhoneCall, 
  Lock, 
  AlertCircle,
  Save,
  Sparkles,
  Zap,
  Info
} from 'lucide-react';
import { EmergencyContact, GuardianRelationship } from '../types';
import { openWhatsAppDirect, saveSafetyGuardContact, buildLiveLocationShareMessage } from '../utils/safetyGuardian';
import { triggerHapticBuzz, speakHindiSosAlert } from '../utils/audioAlerts';

interface SafetyGuardConfigSectionProps {
  primaryContact: EmergencyContact | null;
  userName: string;
  isHindi?: boolean;
  onSaved: (updatedContacts: EmergencyContact[], updatedUserName: string) => void;
  compactMode?: boolean;
  className?: string;
}

const RELATIONSHIP_OPTIONS: { value: GuardianRelationship; labelHi: string; labelEn: string }[] = [
  { value: 'Husband', labelHi: 'पति (Husband)', labelEn: 'Husband' },
  { value: 'Father', labelHi: 'पिता (Father)', labelEn: 'Father' },
  { value: 'Mother', labelHi: 'माता (Mother)', labelEn: 'Mother' },
  { value: 'Brother', labelHi: 'भाई (Brother)', labelEn: 'Brother' },
  { value: 'Sister', labelHi: 'बहन (Sister)', labelEn: 'Sister' },
  { value: 'Friend', labelHi: 'मित्र (Friend)', labelEn: 'Friend' },
  { value: 'Guardian', labelHi: 'अभिभावक / अन्य (Guardian)', labelEn: 'Guardian' }
];

export const SafetyGuardConfigSection: React.FC<SafetyGuardConfigSectionProps> = ({
  primaryContact,
  userName,
  isHindi = true,
  onSaved,
  compactMode = false,
  className = ''
}) => {
  // Read direct persistent keys as source of truth for reboot resilience
  const [trustedName, setTrustedName] = useState<string>(() => {
    return (
      localStorage.getItem('erahi_primary_guardian_name') ||
      primaryContact?.name ||
      'Rahul (Husband)'
    );
  });

  const [trustedPhone, setTrustedPhone] = useState<string>(() => {
    return (
      localStorage.getItem('erahi_primary_guardian_phone') ||
      primaryContact?.phone ||
      '+919876543210'
    );
  });

  const [relationship, setRelationship] = useState<GuardianRelationship>(() => {
    return (
      (localStorage.getItem('erahi_primary_guardian_relation') as GuardianRelationship) ||
      primaryContact?.relationship ||
      'Husband'
    );
  });

  const [senderName, setSenderName] = useState<string>(() => {
    return localStorage.getItem('erahi_sos_user_name') || userName || 'Priya Sharma';
  });

  const [notifyWhatsapp, setNotifyWhatsapp] = useState<boolean>(() => {
    return primaryContact ? primaryContact.notifyViaWhatsapp : true;
  });

  const [notifySms, setNotifySms] = useState<boolean>(() => {
    return primaryContact ? primaryContact.notifyViaSms : true;
  });

  const [savedSuccessNotice, setSavedSuccessNotice] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState<boolean>(false);

  // Sync if external primaryContact updates and user hasn't edited yet
  useEffect(() => {
    if (!isDirty && primaryContact) {
      if (primaryContact.name) setTrustedName(primaryContact.name);
      if (primaryContact.phone) setTrustedPhone(primaryContact.phone);
      if (primaryContact.relationship) setRelationship(primaryContact.relationship);
    }
  }, [primaryContact, isDirty]);

  const handlePhoneInputChange = (val: string) => {
    setTrustedPhone(val);
    setIsDirty(true);
    if (validationError) setValidationError(null);
  };

  const handleNameInputChange = (val: string) => {
    setTrustedName(val);
    setIsDirty(true);
    if (validationError) setValidationError(null);
  };

  const handleSaveSafetyGuard = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const cleanName = trustedName.trim();
    const cleanPhone = trustedPhone.trim().replace(/\s+/g, '');
    const cleanSender = senderName.trim();

    if (!cleanName) {
      setValidationError(isHindi ? 'कृपया विश्वसनीय व्यक्ति का नाम दर्ज करें।' : 'Please enter contact name.');
      return;
    }

    if (!cleanPhone || cleanPhone.length < 10) {
      setValidationError(isHindi ? 'कृपया वैध 10-अंकीय मोबाइल नंबर दर्ज करें।' : 'Please enter a valid phone number (10+ digits).');
      return;
    }

    // Format phone with +91 if 10 digits without country code
    let formattedPhone = cleanPhone;
    if (!formattedPhone.startsWith('+') && formattedPhone.length === 10) {
      formattedPhone = `+91${formattedPhone}`;
    }

    // 1. Persist permanently to localStorage (Guaranteed across crashes, reboots, and session resets)
    try {
      localStorage.setItem('erahi_primary_guardian_name', cleanName);
      localStorage.setItem('erahi_primary_guardian_phone', formattedPhone);
      localStorage.setItem('erahi_primary_guardian_relation', relationship);
      localStorage.setItem('erahi_sos_user_name', cleanSender || 'App User');
    } catch (err) {
      console.warn('LocalStorage error:', err);
    }

    // 2. Update via utility to save structured array as well
    const updatedContacts = saveSafetyGuardContact({
      name: cleanName,
      phone: formattedPhone,
      relationship,
      notifyViaWhatsapp: notifyWhatsapp,
      notifyViaSms: notifySms
    });

    // 3. Callback to parent component
    onSaved(updatedContacts, cleanSender);

    // 4. Feedback to user
    setIsDirty(false);
    setValidationError(null);
    triggerHapticBuzz([100, 50, 150]);

    const successMsg = isHindi
      ? `✅ ${cleanName} (${formattedPhone}) सुरक्षा गार्ड के रूप में सुरक्षित हुआ! यह डेटा फोन रीस्टार्ट होने पर भी उपलब्ध रहेगा।`
      : `✅ ${cleanName} (${formattedPhone}) saved as Safety Guard! Persisted to device storage.`;

    setSavedSuccessNotice(successMsg);
    setTimeout(() => {
      setSavedSuccessNotice(null);
    }, 5000);
  };

  const handleTestWhatsApp = () => {
    const cleanPhone = trustedPhone.trim().replace(/\s+/g, '');
    if (!cleanPhone) {
      setValidationError(isHindi ? 'पहले मोबाइल नंबर दर्ज करें।' : 'Please enter phone number first.');
      return;
    }

    const testMsg = isHindi
      ? `🛡️ *E-Rahi India - सुरक्षा गार्ड टेस्ट कनेक्शन*\n\nनमस्ते ${trustedName},\nयह ${senderName || 'आपकी प्रियजन'} द्वारा E-Rahi India सुरक्षा ऐप से भेजा गया सत्यापन संदेश है।\n\n✅ आपातकाल (SOS) होने पर या फोन स्विच-ऑफ होने से पहले मेरी अंतिम लाइव GPS लोकेशन व Google Maps लिंक इसी चैट पर स्वतः प्राप्त होगी।`
      : `🛡️ *E-Rahi India - Safety Guard Test Connection*\n\nHello ${trustedName},\nThis is a test verification message from ${senderName || 'your family member'} via E-Rahi India Safety Guard.\n\n✅ In an emergency or before my phone shuts down, my live GPS location will be automatically delivered here.`;

    openWhatsAppDirect(cleanPhone, testMsg);
  };

  const handleShareLiveLocation = () => {
    const cleanPhone = trustedPhone.trim().replace(/\s+/g, '');
    if (!cleanPhone) {
      setValidationError(isHindi ? 'पहले मोबाइल नंबर दर्ज करें।' : 'Please enter phone number first.');
      return;
    }

    let lat = 28.3620;
    let lng = 79.4200;
    try {
      const stored = localStorage.getItem('erahi_last_known_location');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.lat && parsed.lng) {
          lat = parsed.lat;
          lng = parsed.lng;
        }
      }
    } catch {
      // fallback to Bareilly default
    }

    const msg = buildLiveLocationShareMessage({
      userName: senderName || 'Priya Sharma',
      lat,
      lng,
      accuracyMeters: 10,
      contactName: trustedName,
      isHindi
    });

    openWhatsAppDirect(cleanPhone, msg);
    triggerHapticBuzz([100, 50, 150]);
    setSavedSuccessNotice(
      isHindi 
        ? `✅ ${trustedName} (${cleanPhone}) के WhatsApp पर लाइव लोकेशन भेजी जा रही है!` 
        : `✅ Live location dispatch opened for ${trustedName} on WhatsApp!`
    );
    setTimeout(() => {
      setSavedSuccessNotice(null);
    }, 5000);
  };

  return (
    <div className={`bg-white rounded-2xl border border-rose-200/90 shadow-2xs overflow-hidden ${className}`}>
      {/* Top Banner with Trust Shield */}
      <div className="bg-gradient-to-r from-rose-50 via-rose-50/70 to-amber-50/60 p-4 border-b border-rose-100 flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-2xl bg-rose-600 text-white flex items-center justify-center shadow-xs shrink-0 mt-0.5">
            <ShieldCheck className="w-6 h-6 text-amber-200" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm sm:text-base font-black text-slate-900 tracking-tight">
                {isHindi ? '🛡️ सेफ्टी गार्ड (Safety Guard)' : '🛡️ Safety Guard'}
              </h3>
            </div>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              {isHindi
                ? 'अपने विश्वसनीय व्यक्ति (पति/पिता) का नाम और नंबर दर्ज करें। फोन क्रैश या रीस्टार्ट होने पर भी यह विवरण सुरक्षित रहेगा।'
                : 'Enter your trusted guardian name & phone number. Persisted locally to survive app reboots & crashes.'}
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-5 space-y-4">
        {/* Success Alert Banner */}
        {savedSuccessNotice && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-950 rounded-2xl text-xs font-semibold flex items-start gap-2.5 animate-in fade-in zoom-in-98 duration-150">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span>{savedSuccessNotice}</span>
            </div>
          </div>
        )}

        {/* Validation Error Banner */}
        {validationError && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-900 rounded-2xl text-xs font-semibold flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        {/* Main Configuration Form */}
        <form onSubmit={handleSaveSafetyGuard} className="space-y-3.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* 1. Trusted Contact Name */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                <span>{isHindi ? 'विश्वसनीय व्यक्ति का नाम (Guardian Name)' : 'Guardian / Husband Name'}</span>
                <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={trustedName}
                  onChange={(e) => handleNameInputChange(e.target.value)}
                  placeholder={isHindi ? 'उदा. राहुल (पति) या पापा' : 'e.g. Rahul (Husband)'}
                  className="w-full text-xs font-semibold pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-100 outline-none bg-white transition-all shadow-2xs"
                  required
                />
              </div>
            </div>

            {/* 2. Trusted Contact Phone Number */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                <span>{isHindi ? 'मोबाइल नंबर (Phone Number for WhatsApp/SMS)' : 'Phone Number'}</span>
                <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="tel"
                  value={trustedPhone}
                  onChange={(e) => handlePhoneInputChange(e.target.value)}
                  placeholder={isHindi ? '10 अंकों का नंबर (उदा. 9876543210)' : '+91 98765 43210'}
                  className="w-full text-xs font-semibold pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-100 outline-none bg-white transition-all shadow-2xs font-mono"
                  required
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* 3. Relationship */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                {isHindi ? 'संबंध (Relationship with You)' : 'Relationship'}
              </label>
              <select
                value={relationship}
                onChange={(e) => {
                  setRelationship(e.target.value as GuardianRelationship);
                  setIsDirty(true);
                }}
                className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-slate-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-100 outline-none bg-white transition-all shadow-2xs cursor-pointer"
              >
                {RELATIONSHIP_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>
                    {isHindi ? opt.labelHi : opt.labelEn}
                  </option>
                ))}
              </select>
            </div>

            {/* 4. Sender's Own Name */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                {isHindi ? 'आपकी पहचान (Your Name in SOS Message)' : 'Your Name (SOS Sender)'}
              </label>
              <input
                type="text"
                value={senderName}
                onChange={(e) => {
                  setSenderName(e.target.value);
                  setIsDirty(true);
                }}
                placeholder={isHindi ? 'उदा. पूजा / प्रिया' : 'e.g. Priya Sharma'}
                className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-slate-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-100 outline-none bg-white transition-all shadow-2xs"
              />
            </div>
          </div>

          {/* Quick Dispatch Channels */}
          <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="text-xs">
              <span className="font-bold text-slate-900 block">
                {isHindi ? 'प्रेषण के माध्यम (Dispatch Channels):' : 'Dispatch Channels:'}
              </span>
              <span className="text-[11px] text-slate-500">
                {isHindi 
                  ? 'आपातकाल में WhatsApp और SMS द्वारा तुरंत संपर्क होगा' 
                  : 'Live coordinates dispatched via WhatsApp & SMS'}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <label className="flex items-center gap-1.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={notifyWhatsapp}
                  onChange={(e) => {
                    setNotifyWhatsapp(e.target.checked);
                    setIsDirty(true);
                  }}
                  className="w-3.5 h-3.5 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
                />
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                  <Send className="w-3 h-3 text-emerald-600" />
                  WhatsApp
                </span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={notifySms}
                  onChange={(e) => {
                    setNotifySms(e.target.checked);
                    setIsDirty(true);
                  }}
                  className="w-3.5 h-3.5 text-rose-600 rounded border-slate-300 focus:ring-rose-500 cursor-pointer"
                />
                <span className="text-xs font-bold text-slate-800">SMS</span>
              </label>
            </div>
          </div>

          {/* Buttons: Save + WhatsApp Live Location + WhatsApp Test + Call */}
          <div className="space-y-2 pt-1">
            {/* Primary Action Row: Save + Share Live Location on WhatsApp */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <button
                type="submit"
                className="flex-1 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4 text-emerald-400" />
                <span>{isHindi ? '💾 सुरक्षा गार्ड सुरक्षित करें (Save Details)' : '💾 Save Safety Guard'}</span>
              </button>

              <button
                type="button"
                onClick={handleShareLiveLocation}
                className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                title="Send current live GPS location with Google Maps pin directly to guardian on WhatsApp"
              >
                <Send className="w-4 h-4 text-white fill-white" />
                <span>{isHindi ? '🟢 WhatsApp लाइव लोकेशन भेजें' : '🟢 Share Live Location'}</span>
              </button>
            </div>

            {/* Secondary Action Row: Test Ping & Phone Call */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleTestWhatsApp}
                className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                title="Send a verification test message on WhatsApp"
              >
                <Send className="w-3.5 h-3.5 text-emerald-600" />
                <span>{isHindi ? 'WhatsApp टेस्ट पिंग' : 'Test WhatsApp Ping'}</span>
              </button>

              <a
                href={`tel:${trustedPhone}`}
                className="py-2 px-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 font-bold text-xs shadow-2xs transition-all flex items-center justify-center gap-1.5"
                title="Direct voice call"
              >
                <PhoneCall className="w-3.5 h-3.5 text-rose-600" />
                <span>{isHindi ? 'कॉल करें' : 'Direct Call'}</span>
              </a>
            </div>
          </div>
        </form>


      </div>
    </div>
  );
};
