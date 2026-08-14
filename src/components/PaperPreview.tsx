import { useState, useRef } from "react";
import {
  RefreshCw,
  Trash2,
  ArrowUp,
  ArrowDown,
  GripVertical,
  Loader2,
} from "lucide-react";
import type {
  Branding,
  Paper,
  PaperSection,
  Question,
  TestConfig,
} from "../lib/types";
import { calcTotalMarks } from "../lib/types";
import { swapQuestion } from "../lib/aiClient";

interface Props {
  paper: Paper;
  config: TestConfig;
  branding: Branding;
  onPaperChange: (paper: Paper) => void;
  showSolutions: boolean;
  onToggleSolutions: () => void;
}

function formatTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h > 0 && m > 0) return `${h} hrs ${m} mins`;
  if (h > 0) return `${h} hrs`;
  return `${m} mins`;
}

export default function PaperPreview({
  paper,
  config,
  branding,
  onPaperChange,
  showSolutions,
  onToggleSolutions,
}: Props) {
  const [swappingId, setSwappingId] = useState<string | null>(null);
  const [draggedQ, setDraggedQ] = useState<{
    sectionIdx: number;
    qIdx: number;
  } | null>(null);
  const [editField, setEditField] = useState<string | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  const totalMarks = calcTotalMarks(paper.sections);

  const updateQuestion = (
    sectionIdx: number,
    qIdx: number,
    patch: Partial<Question>
  ) => {
    const sections = paper.sections.map((s, si) => {
      if (si !== sectionIdx) return s;
      return {
        ...s,
        questions: s.questions.map((q, qi) =>
          qi === qIdx ? { ...q, ...patch } : q
        ),
      };
    });
    onPaperChange({ ...paper, sections, totalMarks: calcTotalMarks(sections) });
  };

  const deleteQuestion = (sectionIdx: number, qIdx: number) => {
    const sections = paper.sections.map((s, si) => {
      if (si !== sectionIdx) return s;
      return { ...s, questions: s.questions.filter((_, qi) => qi !== qIdx) };
    });
    onPaperChange({ ...paper, sections, totalMarks: calcTotalMarks(sections) });
  };

  const moveQuestion = (
    fromSection: number,
    fromQ: number,
    toSection: number,
    toQ: number
  ) => {
    const sections = paper.sections.map((s) => ({
      ...s,
      questions: [...s.questions],
    }));
    const [moved] = sections[fromSection].questions.splice(fromQ, 1);
    sections[toSection].questions.splice(toQ, 0, moved);
    onPaperChange({ ...paper, sections, totalMarks: calcTotalMarks(sections) });
  };

  const handleSwap = async (sectionIdx: number, qIdx: number) => {
    const q = paper.sections[sectionIdx].questions[qIdx];
    setSwappingId(q.id);
    try {
      const { question } = await swapQuestion(config, q.section, q.marks);
      updateQuestion(sectionIdx, qIdx, question);
    } catch (err) {
      console.error("Swap failed:", err);
      alert("Could not swap question. AI providers may be busy. Try again.");
    } finally {
      setSwappingId(null);
    }
  };

  let globalQNum = 0;

  return (
    <div
      ref={previewRef}
      className="relative bg-white text-slate-900 rounded-lg shadow-2xl overflow-hidden min-h-[600px]"
      style={{ fontFamily: "'Times New Roman', Times, serif" }}
    >
      {/* Watermark */}
      {branding.watermarkText && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
          <span
            className="text-slate-200 font-bold text-6xl rotate-45 select-none"
            style={{ opacity: 0.4 }}
          >
            {branding.watermarkText.toUpperCase()}
          </span>
        </div>
      )}

      <div className="relative z-10 p-4 sm:p-6 md:p-12">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-5 sm:mb-6 border-b-2 border-slate-800 pb-3 sm:pb-4">
          {branding.logoDataUrl && (
            <img
              src={branding.logoDataUrl}
              alt="School Logo"
              className="w-12 h-12 sm:w-16 sm:h-16 object-contain mb-2"
            />
          )}
          <h1 className="text-lg sm:text-2xl font-bold tracking-wide break-words">
            {branding.schoolName || "________________________"}
          </h1>
          <h2 className="text-sm sm:text-lg font-semibold mt-1">
            {branding.examTitle || "CBSE Class 10 Examination"}
          </h2>
          <p className="text-xs sm:text-base mt-1">
            {paper.subject} — {paper.title}
          </p>
        </div>

        {/* Info bar */}
        <div className="flex flex-col sm:flex-row justify-between items-center text-xs sm:text-sm font-semibold mb-3 sm:mb-4 px-2 gap-1.5 sm:gap-2">
          <span>Maximum Marks: {totalMarks}</span>
          <span>Time Allowed: {formatTime(paper.timeMinutes)}</span>
          <span>Level: {config.level}</span>
        </div>

        {/* Instructions */}
        <div className="text-xs italic text-slate-600 mb-5 sm:mb-6 px-2">
          <p className="font-semibold not-italic mb-1">General Instructions:</p>
          <p>
            1. All questions are compulsory. 2. Marks are indicated against each
            question. 3. Write neatly and show all working.
          </p>
        </div>

        {/* Sections */}
        {paper.sections.map((section, si) => {
          if (section.questions.length === 0) return null;
          return (
            <div key={si} className="mb-6">
              <div className="flex justify-between items-baseline border-b border-slate-300 pb-1 mb-3">
                <h3 className="text-base font-bold">
                  {section.name}: {section.label}
                </h3>
                <span className="text-sm font-semibold">
                  ({section.marksPerQuestion} Marks each)
                </span>
              </div>

              <div className="space-y-3">
                {section.questions.map((q, qi) => {
                  globalQNum += 1;
                  const isSwapping = swappingId === q.id;
                  return (
                    <div
                      key={q.id}
                      draggable
                      onDragStart={() =>
                        setDraggedQ({ sectionIdx: si, qIdx: qi })
                      }
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={() => {
                        if (draggedQ) {
                          moveQuestion(
                            draggedQ.sectionIdx,
                            draggedQ.qIdx,
                            si,
                            qi
                          );
                          setDraggedQ(null);
                        }
                      }}
                      className="group relative pl-6 sm:pl-6 pr-2 py-1.5 rounded hover:bg-slate-50 transition-colors"
                    >
                      {/* Drag handle */}
                      <div className="absolute left-0 top-2 cursor-grab opacity-0 sm:group-hover:opacity-40 sm:hover:opacity-70 transition-opacity hidden sm:block">
                        <GripVertical className="w-4 h-4" />
                      </div>

                      <div className="flex justify-between items-start gap-2">
                        <div className="flex-1 min-w-0">
                          {/* Question text (editable) */}
                          {editField === `${q.id}-q` ? (
                            <textarea
                              autoFocus
                              defaultValue={q.question}
                              onBlur={(e) => {
                                updateQuestion(si, qi, {
                                  question: e.target.value,
                                });
                                setEditField(null);
                              }}
                              className="w-full text-sm p-1 border border-blue-400 rounded focus:ring-2 focus:ring-blue-300 outline-none resize-y"
                              rows={3}
                            />
                          ) : (
                            <p
                              onClick={() => setEditField(`${q.id}-q`)}
                              className="text-sm leading-relaxed cursor-text hover:bg-blue-50 hover:bg-opacity-50 rounded px-1 -mx-1"
                            >
                              <span className="font-semibold">
                                Q{globalQNum}.
                              </span>{" "}
                              {q.question}
                            </p>
                          )}

                          {/* Options */}
                          {q.options && q.options.length > 0 && (
                            <div className="mt-1.5 ml-4 space-y-1">
                              {q.options.map((opt, oi) => (
                                <div
                                  key={oi}
                                  className="text-sm text-slate-700"
                                >
                                  {editField === `${q.id}-opt-${oi}` ? (
                                    <input
                                      autoFocus
                                      defaultValue={opt}
                                      onBlur={(e) => {
                                        const newOpts = [...q.options!];
                                        newOpts[oi] = e.target.value;
                                        updateQuestion(si, qi, {
                                          options: newOpts,
                                        });
                                        setEditField(null);
                                      }}
                                      className="w-full text-sm p-0.5 border border-blue-400 rounded outline-none"
                                    />
                                  ) : (
                                    <span
                                      onClick={() =>
                                        setEditField(`${q.id}-opt-${oi}`)
                                      }
                                      className="cursor-text hover:bg-blue-50 hover:bg-opacity-50 rounded px-1 -mx-1"
                                    >
                                      {opt}
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Inline answer (only in solutions mode) */}
                          {showSolutions && (
                            <div className="mt-1.5 ml-4 text-sm text-emerald-700">
                              <span className="font-semibold">Ans: </span>
                              {paper.solutions?.[q.question] ||
                                q.solution ||
                                q.answer}
                            </div>
                          )}
                        </div>

                        {/* Right: marks + actions */}
                        <div className="flex flex-col items-end gap-1 shrink-0">
                          <span className="text-sm font-bold text-slate-700">
                            [{q.marks}]
                          </span>
                          <div className="flex gap-0.5 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleSwap(si, qi)}
                              disabled={isSwapping}
                              title="Swap question"
                              className="p-1 rounded hover:bg-blue-100 text-blue-600 disabled:opacity-50"
                            >
                              {isSwapping ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <RefreshCw className="w-3.5 h-3.5" />
                              )}
                            </button>
                            <button
                              onClick={() =>
                                moveQuestion(si, qi, si, Math.max(0, qi - 1))
                              }
                              disabled={qi === 0}
                              title="Move up"
                              className="p-1 rounded hover:bg-slate-200 text-slate-500 disabled:opacity-30"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() =>
                                moveQuestion(
                                  si,
                                  qi,
                                  si,
                                  Math.min(
                                    section.questions.length - 1,
                                    qi + 1
                                  )
                                )
                              }
                              disabled={qi === section.questions.length - 1}
                              title="Move down"
                              className="p-1 rounded hover:bg-slate-200 text-slate-500 disabled:opacity-30"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => deleteQuestion(si, qi)}
                              title="Delete question"
                              className="p-1 rounded hover:bg-rose-100 text-rose-600"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Solutions section */}
        {showSolutions && paper.solutions && (
          <div className="mt-8 pt-4 border-t-2 border-slate-800">
            <h3 className="text-base font-bold mb-3">
              Answer Key &amp; Solutions
            </h3>
            <div className="space-y-2">
              {(() => {
                let sn = 0;
                return paper.sections.flatMap((section) =>
                  section.questions.map((q) => {
                    sn += 1;
                    const sol =
                      paper.solutions?.[q.question] || q.solution || q.answer;
                    if (!sol) return null;
                    return (
                      <div key={q.id} className="text-sm">
                        <span className="font-semibold">Ans {sn}:</span> {sol}
                      </div>
                    );
                  })
                );
              })()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
