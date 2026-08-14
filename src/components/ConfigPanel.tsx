import { useState } from "react";
import {
  BookOpen,
  GraduationCap,
  Layers,
  Target,
  Gauge,
  History,
  Sparkles,
  Loader2,
  RotateCcw,
} from "lucide-react";
import type {
  Difficulty,
  Level,
  Scope,
  Subject,
  TestConfig,
} from "../lib/types";
import { SUBJECT_SCOPES } from "../lib/types";

interface Props {
  config: TestConfig;
  onChange: (config: TestConfig) => void;
  onGenerate: () => void;
  onReset: () => void;
  loading: boolean;
}

const SUBJECTS: Subject[] = [
  "Science",
  "Mathematics",
  "Social Science",
  "English",
  "Hindi",
];
const DIFFICULTIES: Difficulty[] = ["Easy", "Medium", "Hard"];
const LEVELS: Level[] = ["Basic", "Standard"];
const SCOPES: { value: Scope; label: string }[] = [
  { value: "full", label: "Full Subject" },
  { value: "chapter", label: "Chapter-wise" },
  { value: "topic", label: "Topic-wise" },
];

export default function ConfigPanel({
  config,
  onChange,
  onGenerate,
  onReset,
  loading,
}: Props) {
  const update = (patch: Partial<TestConfig>) =>
    onChange({ ...config, ...patch });

  const scopeOptions =
    config.scope === "chapter"
      ? SUBJECT_SCOPES[config.subject].chapters
      : config.scope === "topic"
      ? SUBJECT_SCOPES[config.subject].chapters
      : [];

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Subject */}
      <div>
        <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
          <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          Subject
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {SUBJECTS.map((s) => (
            <button
              key={s}
              onClick={() => update({ subject: s, scopeValue: "" })}
              className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                config.subject === s
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Scope */}
      <div>
        <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
          <Layers className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          Scope
        </label>
        <div className="grid grid-cols-3 gap-2">
          {SCOPES.map((s) => (
            <button
              key={s.value}
              onClick={() => update({ scope: s.value, scopeValue: "" })}
              className={`px-2 py-2 rounded-lg text-xs font-medium transition-all ${
                config.scope === s.value
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Scope value (chapter/topic) */}
      {config.scope !== "full" && (
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
            <Target className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            {config.scope === "chapter" ? "Select Chapter" : "Select Topic"}
          </label>
          <select
            value={config.scopeValue}
            onChange={(e) => update({ scopeValue: e.target.value })}
            className="w-full px-3 py-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="">-- Choose --</option>
            {scopeOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Marks slider */}
      <div>
        <label className="flex items-center justify-between text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
          <span className="flex items-center gap-2">
            <Gauge className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            Total Marks
          </span>
          <span className="text-blue-600 dark:text-blue-400 font-bold">
            {config.totalMarks} marks
          </span>
        </label>
        <input
          type="range"
          min={10}
          max={80}
          step={5}
          value={config.totalMarks}
          onChange={(e) => update({ totalMarks: Number(e.target.value) })}
          className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
        />
        <div className="flex justify-between text-xs text-slate-400 mt-1">
          <span>10</span>
          <span>40</span>
          <span>80</span>
        </div>
      </div>

      {/* Level */}
      <div>
        <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
          <GraduationCap className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          CBSE Level
        </label>
        <div className="grid grid-cols-2 gap-2">
          {LEVELS.map((l) => (
            <button
              key={l}
              onClick={() => update({ level: l })}
              className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                config.level === l
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* Difficulty */}
      <div>
        <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
          <Gauge className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          Difficulty
        </label>
        <div className="grid grid-cols-3 gap-2">
          {DIFFICULTIES.map((d) => (
            <button
              key={d}
              onClick={() => update({ difficulty: d })}
              className={`px-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                config.difficulty === d
                  ? d === "Easy"
                    ? "bg-emerald-600 text-white"
                    : d === "Medium"
                    ? "bg-amber-600 text-white"
                    : "bg-rose-600 text-white"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* PYQ toggle */}
      <div>
        <label className="flex items-center gap-3 p-3 rounded-lg bg-slate-100 dark:bg-slate-800 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
          <input
            type="checkbox"
            checked={config.pyq}
            onChange={(e) => update({ pyq: e.target.checked })}
            className="w-5 h-5 rounded accent-blue-600 cursor-pointer"
          />
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
              PYQ Focus (Previous Year Questions)
            </span>
          </div>
        </label>
        {config.pyq && (
          <p className="text-xs text-slate-500 mt-1.5 ml-1">
            Questions will be tagged with year (e.g. [CBSE 2023])
          </p>
        )}
      </div>

      {/* Generate + Reset buttons */}
      <div className="flex gap-2">
        <button
          onClick={onGenerate}
          disabled={loading || (config.scope !== "full" && !config.scopeValue)}
          className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold text-sm shadow-lg shadow-blue-600/30 hover:shadow-xl hover:shadow-blue-600/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Generate Test Paper
            </>
          )}
        </button>
        <button
          onClick={onReset}
          disabled={loading}
          title="Reset all settings to default"
          className="px-4 py-3.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <RotateCcw className="w-5 h-5" />
          Reset
        </button>
      </div>

    </div>
  );
}
