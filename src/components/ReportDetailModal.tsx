import React from "react";
import { TrafficReport, AppLanguage } from "../types";

interface ReportDetailModalProps {
  report: TrafficReport | null;
  language: AppLanguage;
  onClose: () => void;
  onVote: (reportId: string, type: "up" | "cleared") => void;
}

/**
 * ReportDetailModal:
 * Displays incident details when a citizen or driver clicks a traffic report pin on the map.
 * Allows quick community verification: confirming the jam or marking it clear.
 */
export const ReportDetailModal: React.FC<ReportDetailModalProps> = ({
  report,
  language,
  onClose,
  onVote,
}) => {
  if (!report) return null;

  const isHindi = language === "hi";
  const isUrdu = language === "ur";

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-5 space-y-3 animate-in fade-in zoom-in-95">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
              {report.category.replace("_", " ")}
            </span>
            <h3 className="font-bold text-sm text-slate-900 mt-1">
              {report.locationName}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 cursor-pointer rounded-lg hover:bg-slate-100"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 space-y-1 text-xs">
          <div className="font-bold text-slate-800">{report.title}</div>
          <p className="text-slate-600 text-[11px] leading-relaxed">
            {report.description}
          </p>
        </div>

        {/* Anti-Spam GPS Geofence Badge */}
        <div className="flex items-center gap-1.5 text-[11px]">
          {report.verifiedByGps ? (
            <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded font-semibold flex items-center gap-1">
              ✓{" "}
              {isHindi
                ? "GPS सत्यापित (< 500m)"
                : isUrdu
                  ? "GPS تصدیق شدہ (< 500m)"
                  : "GPS Verified (< 500m)"}
            </span>
          ) : (
            <span className="text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded font-semibold">
              📍{" "}
              {isHindi
                ? "नागरिक रिपोर्ट पिन"
                : isUrdu
                  ? "شہری رپورٹ پن"
                  : "Citizen Pin Report"}
            </span>
          )}
        </div>

        {report.avoidanceTip && (
          <div className="bg-amber-50 p-2.5 rounded-lg border border-amber-200 text-xs text-amber-900">
            <span className="font-bold">
              {isHindi
                ? "सुझाया गया बाईपास रास्ता: "
                : isUrdu
                  ? "تجویز کردہ متبادل راستہ: "
                  : "Recommended Detour: "}
            </span>
            {report.avoidanceTip}
          </div>
        )}

        <div className="flex items-center justify-between pt-2 text-xs">
          <span className="text-slate-500">
            {report.userType === "erickshaw_driver"
              ? isHindi
                ? "🛺 ई-रिक्शा चालक"
                : isUrdu
                  ? "🛺 ای رکشہ ڈرائیور"
                  : "🛺 Rickshaw Driver"
              : isHindi
                ? "🚶 यात्री / नागरिक"
                : isUrdu
                  ? "🚶 مسافر / شہری"
                  : "🚶 Commuter"}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onVote(report.id, "up")}
              className="px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-bold min-h-[40px] cursor-pointer"
            >
              {isHindi
                ? "अभी भी जाम है (+1)"
                : isUrdu
                  ? "ابھی بھی جام ہے (+1)"
                  : "Still Jammed (+1)"}
            </button>
            <button
              onClick={() => onVote(report.id, "cleared")}
              className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold min-h-[40px] cursor-pointer"
            >
              {isHindi ? "जाम साफ हुआ" : isUrdu ? "جام صاف ہے" : "Clear"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
