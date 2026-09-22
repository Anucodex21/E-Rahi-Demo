import React from "react";
import {
  Map as MapIcon,
  Navigation,
  Calculator,
  Building2,
  Radio,
  ShieldAlert,
} from "lucide-react";
import { AppLanguage } from "../types";

export type MobileTab =
  | "map"
  | "route"
  | "cockpit"
  | "services"
  | "fare"
  | "feed"
  | "police"
  | "roadmap"
  | "sos";

interface MobileBottomNavProps {
  activeMobileTab: MobileTab;
  language: AppLanguage;
  onSwitchTab: (tab: MobileTab) => void;
}

/**
 * MobileBottomNav:
 * High-accessibility, touch-friendly bottom navigation bar for mobile devices.
 * Provides instant 1-tap switching between Map, Ride, Fare, Services, Alerts, and SOS.
 */
export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeMobileTab,
  language,
  onSwitchTab,
}) => {
  const isHindi = language === "hi";
  const isUrdu = language === "ur";

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-[1200] bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-2 py-1.5 shadow-lg flex items-center justify-around">
      {/* 1. Map Tab */}
      <button
        onClick={() => onSwitchTab("map")}
        className={`flex flex-col items-center justify-center py-1 px-2.5 min-h-[44px] rounded-xl transition-all cursor-pointer ${
          activeMobileTab === "map"
            ? "text-slate-900 font-bold bg-slate-100/90 shadow-2xs"
            : "text-slate-500 hover:text-slate-800"
        }`}
      >
        <MapIcon className="w-4 h-4" />
        <span className="text-[10px] mt-0.5">
          {isHindi ? "नक्शा" : "Map"}
        </span>
      </button>

      {/* 2. Ride Navigation Tab */}
      <button
        onClick={() => onSwitchTab("route")}
        className={`flex flex-col items-center justify-center py-1 px-2.5 min-h-[44px] rounded-xl transition-all cursor-pointer ${
          activeMobileTab === "route" || activeMobileTab === "cockpit"
            ? "text-slate-900 font-bold bg-slate-100/90 shadow-2xs"
            : "text-slate-500 hover:text-slate-800"
        }`}
      >
        <Navigation className="w-4 h-4" />
        <span className="text-[10px] mt-0.5">
          {isHindi ? "सवारी" : "Ride"}
        </span>
      </button>

      {/* 3. Fare Rate Tab */}
      <button
        onClick={() => onSwitchTab("fare")}
        className={`flex flex-col items-center justify-center py-1 px-2.5 min-h-[44px] rounded-xl transition-all cursor-pointer ${
          activeMobileTab === "fare"
            ? "text-slate-900 font-bold bg-slate-100/90 shadow-2xs"
            : "text-slate-500 hover:text-slate-800"
        }`}
        title={isHindi ? "ई-रिक्शा किराया दरें व कैलकुलेटर" : "Fare Rates"}
      >
        <Calculator className="w-4 h-4" />
        <span className="text-[10px] mt-0.5">
          {isHindi ? "किराया" : isUrdu ? "کرایہ" : "Fare"}
        </span>
      </button>

      {/* 4. Services & Hospitals Directory Tab */}
      <button
        onClick={() => onSwitchTab("services")}
        className={`flex flex-col items-center justify-center py-1 px-2.5 min-h-[44px] rounded-xl transition-all cursor-pointer ${
          activeMobileTab === "services"
            ? "text-slate-900 font-bold bg-slate-100/90 shadow-2xs"
            : "text-slate-500 hover:text-slate-800"
        }`}
      >
        <Building2 className="w-4 h-4" />
        <span className="text-[10px] mt-0.5">
          {isHindi ? "सेवाएं" : "Services"}
        </span>
      </button>

      {/* 5. Alerts & Jam Feeds Tab */}
      <button
        onClick={() => onSwitchTab("feed")}
        className={`flex flex-col items-center justify-center py-1 px-2.5 min-h-[44px] rounded-xl transition-all relative cursor-pointer ${
          activeMobileTab === "feed" || activeMobileTab === "police"
            ? "text-slate-900 font-bold bg-slate-100/90 shadow-2xs"
            : "text-slate-500 hover:text-slate-800"
        }`}
      >
        <Radio className="w-4 h-4" />
        <span className="text-[10px] mt-0.5">
          {isHindi ? "अलर्ट्स" : "Alerts"}
        </span>
        <span className="absolute top-1.5 right-2 w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
      </button>

      {/* 6. Emergency SOS Tab */}
      <button
        onClick={() => onSwitchTab("sos")}
        className={`flex flex-col items-center justify-center py-1 px-2.5 min-h-[44px] rounded-xl transition-all cursor-pointer ${
          activeMobileTab === "sos"
            ? "text-rose-700 font-bold bg-rose-50 border border-rose-200/80 shadow-2xs"
            : "text-rose-600 hover:text-rose-700 hover:bg-rose-50/50"
        }`}
        title={isHindi ? "महिला सुरक्षा SOS पेज" : "Women Safety SOS Page"}
      >
        <div className="relative">
          <ShieldAlert className="w-4 h-4 text-rose-600" />
          <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse" />
        </div>
        <span className="text-[9px] mt-0.5 font-bold text-rose-700">SOS</span>
      </button>
    </nav>
  );
};
