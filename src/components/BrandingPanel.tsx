import { useRef } from "react";
import { Upload, School, Stamp, FileText, Eye, EyeOff } from "lucide-react";
import type { Branding } from "../lib/types";

interface Props {
  branding: Branding;
  onChange: (b: Branding) => void;
  showSolutions: boolean;
  onToggleSolutions: () => void;
}

export default function BrandingPanel({
  branding,
  onChange,
  showSolutions,
  onToggleSolutions,
}: Props) {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      onChange({ ...branding, logoDataUrl: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-4">
      {/* School Name */}
      <div>
        <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
          <School className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          School / Institution Name
        </label>
        <input
          type="text"
          value={branding.schoolName}
          onChange={(e) =>
            onChange({ ...branding, schoolName: e.target.value })
          }
          placeholder="e.g. Delhi Public School"
          className="w-full px-3 py-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none"
        />
      </div>

      {/* Exam Title */}
      <div>
        <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
          <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          Exam Title
        </label>
        <input
          type="text"
          value={branding.examTitle}
          onChange={(e) =>
            onChange({ ...branding, examTitle: e.target.value })
          }
          placeholder="e.g. Pre-Board Examination 2024-25"
          className="w-full px-3 py-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none"
        />
      </div>

      {/* Logo Upload */}
      <div>
        <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
          <Upload className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          School Logo
        </label>
        <input
          ref={fileRef}
          type="file"
          accept="image/png,image/jpeg"
          onChange={handleLogo}
          className="hidden"
        />
        <div className="flex items-center gap-3">
          <button
            onClick={() => fileRef.current?.click()}
            className="px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            Upload Logo
          </button>
          {branding.logoDataUrl && (
            <>
              <img
                src={branding.logoDataUrl}
                alt="Logo"
                className="w-10 h-10 object-contain rounded border border-slate-200 dark:border-slate-700"
              />
              <button
                onClick={() =>
                  onChange({ ...branding, logoDataUrl: null })
                }
                className="text-xs text-rose-500 hover:text-rose-600"
              >
                Remove
              </button>
            </>
          )}
        </div>
      </div>

      {/* Watermark */}
      <div>
        <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
          <Stamp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          Watermark Text
        </label>
        <input
          type="text"
          value={branding.watermarkText}
          onChange={(e) =>
            onChange({ ...branding, watermarkText: e.target.value })
          }
          placeholder="e.g. SAMPLE ONLY"
          className="w-full px-3 py-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none"
        />
      </div>

      {/* Solutions toggle */}
      <button
        onClick={onToggleSolutions}
        className="w-full flex items-center justify-between p-3 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
      >
        <span className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-200">
          {showSolutions ? (
            <Eye className="w-4 h-4 text-emerald-500" />
          ) : (
            <EyeOff className="w-4 h-4 text-slate-400" />
          )}
          Answer Key &amp; Solutions
        </span>
        <span
          className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
            showSolutions
              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
              : "bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-400"
          }`}
        >
          {showSolutions ? "ON" : "OFF"}
        </span>
      </button>
    </div>
  );
}
