import React, { useState, useRef, useEffect } from "react";
import {
  Building2,
  Calculator,
  ShieldAlert,
  HelpCircle,
  AlertTriangle,
  ChevronDown,
  Mic,
  MessageSquareWarning,
  Crown,
  Store,
  Smartphone,
  LogIn,
} from "lucide-react";
import { CityData, AppLanguage, UserProfile } from "../types";

export type DesktopView = "navigator" | "services" | "fare" | "roadmap" | "sos";

interface AppHeaderProps {
  currentCity: CityData;
  desktopView: DesktopView;
  activeMobileTab: string;
  language: AppLanguage;
  currentUser: UserProfile | null;
  isPremiumPass: boolean;
  t: { flagJam: string; [key: string]: any };
  onSwitchDesktopView: (view: DesktopView) => void;
  onSwitchMobileTab: (tab: any) => void;
  onSetLanguage: (lang: AppLanguage) => void;
  onOpenReportModal: () => void;
  onOpenVoiceModal: () => void;
  onOpenExplainerModal: () => void;
  onOpenComplaintModal: () => void;
  onOpenPremiumModal: () => void;
  onOpenStoreModal: () => void;
  onOpenMobileInstallModal: () => void;
  onOpenAuthModal: () => void;
}

/**
 * AppHeader:
 * Primary navigation and status bar.
 * Contains the city branding, desktop navigation tabs, Quick Emergency SOS trigger,
 * Flag Jam incident reporting, Tools dropdown, Trilingual switcher, and User Profile.
 */
export const AppHeader: React.FC<AppHeaderProps> = ({
  currentCity,
  desktopView,
  activeMobileTab,
  language,
  currentUser,
  isPremiumPass,
  t,
  onSwitchDesktopView,
  onSwitchMobileTab,
  onSetLanguage,
  onOpenReportModal,
  onOpenVoiceModal,
  onOpenExplainerModal,
  onOpenComplaintModal,
  onOpenPremiumModal,
  onOpenStoreModal,
  onOpenMobileInstallModal,
  onOpenAuthModal,
}) => {
  const [isToolsMenuOpen, setIsToolsMenuOpen] = useState(false);
  const toolsMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        toolsMenuRef.current &&
        !toolsMenuRef.current.contains(event.target as Node)
      ) {
        setIsToolsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleOpenSos = () => {
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      onSwitchMobileTab("sos");
    } else {
      onSwitchDesktopView("sos");
    }
  };

  const isHindi = language === "hi";
  const isUrdu = language === "ur";

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-[1100] shadow-2xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2 flex items-center justify-between gap-3">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-slate-900 text-amber-400 flex items-center justify-center text-lg shadow-2xs shrink-0 font-bold">
            🛺
          </div>
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <h1 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight leading-none flex items-center gap-1.5">
                <span>E-Rahi</span>
                <span className="text-slate-400 font-normal">/</span>
                <span className="text-slate-700 font-semibold">
                  {currentCity.name}
                </span>
              </h1>
              <span className="hidden md:inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Grid
              </span>
            </div>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <div className="hidden lg:flex items-center gap-2">
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/80 text-xs font-semibold">
            <button
              onClick={() => onSwitchDesktopView("navigator")}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                desktopView === "navigator"
                  ? "bg-slate-900 text-white shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <span>🛺</span>
              <span>
                {isHindi
                  ? "सवारी व रूट"
                  : isUrdu
                    ? "سواری و راستہ"
                    : "Find Ride & Route"}
              </span>
            </button>
            <button
              onClick={() => onSwitchDesktopView("services")}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                desktopView === "services"
                  ? "bg-slate-900 text-white shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>
                {isHindi ? "अस्पताल व शहर सेवाएं" : "Hospitals & Services"}
              </span>
            </button>
            <button
              onClick={() => onSwitchDesktopView("fare")}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                desktopView === "fare"
                  ? "bg-slate-900 text-white shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Calculator className="w-3.5 h-3.5" />
              <span>
                {isHindi ? "किराया दरें" : isUrdu ? "کرایہ ریٹ" : "Fare Rates"}
              </span>
            </button>
            <button
              onClick={() => onSwitchDesktopView("sos")}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                desktopView === "sos"
                  ? "bg-rose-600 text-white shadow-2xs"
                  : "text-rose-700 hover:bg-rose-50"
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>
                {isHindi
                  ? "महिला सुरक्षा SOS"
                  : isUrdu
                    ? "خواتین سیفٹی"
                    : "Safety SOS"}
              </span>
            </button>
          </div>

          {/* Simple 1-Minute Explainer Guide Trigger */}
          <button
            onClick={onOpenExplainerModal}
            className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
            title="How E-Rahi Works"
          >
            <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
            <span>{isHindi ? "गाइड" : "Guide"}</span>
          </button>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* Quick SOS Trigger */}
          <button
            onClick={handleOpenSos}
            className={`font-semibold text-xs px-2.5 sm:px-3 py-2 rounded-xl transition-all active:scale-95 flex items-center gap-1.5 min-h-[36px] cursor-pointer border ${
              desktopView === "sos" || activeMobileTab === "sos"
                ? "bg-rose-600 text-white border-rose-600 shadow-2xs"
                : "bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200"
            }`}
            title={
              isHindi
                ? "महिला सुरक्षा एवं पुलिस हेल्पलाइन SOS पेज"
                : "Women Safety & Emergency SOS Page"
            }
          >
            <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">
              {isHindi ? "महिला सुरक्षा SOS" : "Women SOS"}
            </span>
            <span className="sm:hidden font-bold">SOS</span>
          </button>

          {/* Report Jam Button */}
          <button
            onClick={onOpenReportModal}
            className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-2.5 sm:px-3 py-2 rounded-xl shadow-2xs transition-all active:scale-95 flex items-center gap-1.5 min-h-[36px] cursor-pointer"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="hidden xs:inline">{t.flagJam}</span>
            <span className="xs:hidden">{isHindi ? "रिपोर्ट" : "Report"}</span>
          </button>

          {/* Tools Menu Dropdown */}
          <div className="relative" ref={toolsMenuRef}>
            <button
              onClick={() => setIsToolsMenuOpen(!isToolsMenuOpen)}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/80 text-xs font-semibold px-2.5 py-2 rounded-xl transition-colors flex items-center gap-1 min-h-[36px] cursor-pointer"
              title="More Tools & Services"
            >
              <span className="hidden md:inline">
                {isHindi ? "टूल्स" : "Tools"}
              </span>
              <span className="md:hidden">⚙️</span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-150 ${
                  isToolsMenuOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {isToolsMenuOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100 p-1.5 divide-y divide-slate-100">
                {/* AI Voice Search */}
                <div className="py-1">
                  <button
                    onClick={() => {
                      onOpenVoiceModal();
                      setIsToolsMenuOpen(false);
                    }}
                    className="w-full px-3 py-2 text-left rounded-xl text-xs font-semibold text-slate-800 hover:bg-amber-50 hover:text-amber-900 transition-colors flex items-center gap-2.5 cursor-pointer"
                  >
                    <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
                      <Mic className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold flex items-center gap-1.5">
                        <span>
                          {isHindi
                            ? "🎙️ एआई वॉयस असिस्टेंट"
                            : "🎙️ AI Voice Search"}
                        </span>
                        <span className="text-[9px] bg-amber-100 text-amber-800 px-1 rounded font-bold">
                          NEW
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-normal">
                        {isHindi
                          ? "बोलकर रूट, किराया व अस्पताल पूछें"
                          : "Search routes & fares by voice"}
                      </div>
                    </div>
                  </button>
                </div>

                {/* 1-Min Guide */}
                <div className="py-1">
                  <button
                    onClick={() => {
                      onOpenExplainerModal();
                      setIsToolsMenuOpen(false);
                    }}
                    className="w-full px-3 py-2 text-left rounded-xl text-xs font-semibold text-slate-800 hover:bg-slate-50 transition-colors flex items-center gap-2.5 cursor-pointer"
                  >
                    <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                      <HelpCircle className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-semibold">
                        {isHindi
                          ? "💡 आसान 1-मिनट गाइड"
                          : "💡 Simple 1-Min Guide"}
                      </div>
                      <div className="text-[10px] text-slate-500 font-normal">
                        {isHindi
                          ? "ई-राही का उपयोग कैसे करें"
                          : "How to use E-Rahi app"}
                      </div>
                    </div>
                  </button>
                </div>

                {/* Citizen Complaint Help Desk */}
                <div className="py-1">
                  <button
                    onClick={() => {
                      onOpenComplaintModal();
                      setIsToolsMenuOpen(false);
                    }}
                    className="w-full px-3 py-2 text-left rounded-xl text-xs font-semibold text-slate-800 hover:bg-slate-50 transition-colors flex items-center gap-2.5 cursor-pointer"
                  >
                    <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                      <MessageSquareWarning className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div>
                        {isHindi ? "नागरिक शिकायत डेस्क" : "Citizen Help Desk"}
                      </div>
                      <div className="text-[10px] text-slate-400 font-normal">
                        {isHindi
                          ? "शिकायत व फीडबैक"
                          : "Lodge complaint & issues"}
                      </div>
                    </div>
                  </button>
                </div>

                {/* Gold Pass */}
                <div className="py-1">
                  <button
                    onClick={() => {
                      onOpenPremiumModal();
                      setIsToolsMenuOpen(false);
                    }}
                    className="w-full px-3 py-2 text-left rounded-xl text-xs font-semibold text-slate-800 hover:bg-slate-50 transition-colors flex items-center gap-2.5 cursor-pointer"
                  >
                    <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-900 flex items-center justify-center shrink-0">
                      <Crown className="w-3.5 h-3.5 fill-amber-700 text-amber-700" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1">
                        <span>
                          {isHindi
                            ? "गोल्ड पास (₹49/माह)"
                            : "Gold Pass (₹49/mo)"}
                        </span>
                        {isPremiumPass && (
                          <span className="text-[9px] bg-emerald-600 text-white px-1 rounded font-semibold">
                            ACTIVE
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 font-normal">
                        {isHindi
                          ? "अस्पताल व घंटे वाले होटल"
                          : "Unlock hospitals & hotels"}
                      </div>
                    </div>
                  </button>
                </div>

                {/* Promote Local Store */}
                <div className="py-1">
                  <button
                    onClick={() => {
                      onOpenStoreModal();
                      setIsToolsMenuOpen(false);
                    }}
                    className="w-full px-3 py-2 text-left rounded-xl text-xs font-semibold text-slate-800 hover:bg-slate-50 transition-colors flex items-center gap-2.5 cursor-pointer"
                  >
                    <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                      <Store className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div>
                        {isHindi
                          ? "दुकान / क्लीनिक जोड़ें"
                          : "Add Store / Clinic"}
                      </div>
                      <div className="text-[10px] text-slate-400 font-normal">
                        {isHindi
                          ? "स्थानीय व्यापार लिस्ट करें"
                          : "List your local store"}
                      </div>
                    </div>
                  </button>
                </div>

                {/* Install App */}
                <div className="py-1">
                  <button
                    onClick={() => {
                      onOpenMobileInstallModal();
                      setIsToolsMenuOpen(false);
                    }}
                    className="w-full px-3 py-2 text-left rounded-xl text-xs font-semibold text-slate-800 hover:bg-slate-50 transition-colors flex items-center gap-2.5 cursor-pointer"
                  >
                    <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                      <Smartphone className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div>
                        {isHindi ? "मोबाइल ऐप इंस्टॉल" : "Get Mobile App"}
                      </div>
                      <div className="text-[10px] text-slate-400 font-normal">
                        {isHindi
                          ? "होमस्क्रीन पर जोड़ें"
                          : "Save to home screen"}
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Trilingual Language Switcher */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200/80 text-[11px] font-semibold">
            <button
              onClick={() => onSetLanguage("en")}
              className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                language === "en"
                  ? "bg-white text-slate-900 font-bold shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              EN
            </button>
            <button
              onClick={() => onSetLanguage("hi")}
              className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                language === "hi"
                  ? "bg-white text-slate-900 font-bold shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              हिं
            </button>
            <button
              onClick={() => onSetLanguage("ur")}
              className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                language === "ur"
                  ? "bg-white text-slate-900 font-bold shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              اردو
            </button>
          </div>

          {/* Quick Voice Mic in Header */}
          <button
            onClick={onOpenVoiceModal}
            className="flex items-center justify-center p-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200/90 text-slate-700 shadow-2xs transition-colors cursor-pointer min-h-[36px] min-w-[36px]"
            title={
              isHindi
                ? "गूगल वॉयस असिस्टेंट • बोलकर पूछें"
                : "Google Voice Assistant"
            }
            aria-label="Google Voice Assistant"
          >
            <svg
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 14C13.66 14 15 12.66 15 11V5C15 3.34 13.66 2 12 2C10.34 2 9 3.34 9 5V11C9 12.66 10.34 14 12 14Z"
                fill="#4285F4"
              />
              <path
                d="M15.9 8.1C15.5 8.1 15.2 8.4 15.2 8.8V11C15.2 12.77 13.77 14.2 12 14.2C10.23 14.2 8.8 12.77 8.8 11V8.8C8.8 8.4 8.5 8.1 8.1 8.1C7.7 8.1 7.4 8.4 7.4 8.8V11C7.4 13.3 9.1 15.2 11.3 15.5V19H9.5C9.1 19 8.8 19.3 8.8 19.7C8.8 20.1 9.1 20.4 9.5 20.4H14.5C14.9 20.4 15.2 20.1 15.2 19.7C15.2 19.3 14.9 19 14.5 19H12.7V15.5C14.9 15.2 16.6 13.3 16.6 11V8.8C16.6 8.4 16.3 8.1 15.9 8.1Z"
                fill="#34A853"
              />
              <path
                d="M7.4 11C7.4 12.27 7.91 13.42 8.74 14.25L9.73 13.26C9.14 12.68 8.8 11.88 8.8 11H7.4Z"
                fill="#FBBC05"
              />
              <path
                d="M16.6 11H15.2C15.2 11.88 14.86 12.68 14.27 13.26L15.26 14.25C16.09 13.42 16.6 12.27 16.6 11Z"
                fill="#EA4335"
              />
            </svg>
          </button>

          {/* User Account / Login & Profile */}
          {currentUser ? (
            <button
              onClick={onOpenAuthModal}
              className="bg-white hover:bg-slate-50 text-slate-900 border border-slate-200 font-semibold text-xs px-2.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs min-h-[36px]"
              title={currentUser.name}
            >
              <span className="text-sm">{currentUser.avatar}</span>
              <span className="hidden sm:inline font-semibold max-w-[85px] truncate">
                {currentUser.name.split(" ")[0]}
              </span>
              <span className="text-[10px] bg-slate-100 text-slate-700 font-medium px-1 rounded-full">
                ⭐{currentUser.reputationPoints}
              </span>
            </button>
          ) : (
            <button
              onClick={onOpenAuthModal}
              className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-semibold text-xs px-2.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs min-h-[36px]"
            >
              <LogIn className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">
                {isHindi ? "लॉग इन" : isUrdu ? "لاگ ان" : "Login"}
              </span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
