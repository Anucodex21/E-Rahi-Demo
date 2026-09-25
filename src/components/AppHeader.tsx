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

          {/* Single Language Switcher Pill (Click or double-click to toggle language) */}
          <button
            onClick={() => {
              const next: Record<AppLanguage, AppLanguage> = { en: "hi", hi: "ur", ur: "en" };
              onSetLanguage(next[language] || "en");
            }}
            onDoubleClick={() => {
              const next: Record<AppLanguage, AppLanguage> = { en: "hi", hi: "ur", ur: "en" };
              onSetLanguage(next[language] || "en");
            }}
            title={
              language === "en"
                ? "Language: EN (Click/double-click to switch to हिन्दी)"
                : language === "hi"
                  ? "भाषा: हिन्दी (Click to switch to اردو)"
                  : "زبان: اردو (Click to switch to English)"
            }
            className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200/80 text-xs font-bold transition-all active:scale-95 cursor-pointer min-h-[36px] flex items-center gap-1 shadow-2xs select-none"
          >
            <span className="text-slate-500 text-[11px]">🌐</span>
            <span className="uppercase font-extrabold tracking-wider">
              {language === "en" ? "EN" : language === "hi" ? "हिं" : "اردو"}
            </span>
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
