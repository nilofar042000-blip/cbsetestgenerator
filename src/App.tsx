import { useState, useEffect, useCallback } from "react";
import {
  Moon,
  Sun,
  FileText,
  FileType2,
  CopyPlus,
  Loader2,
  Save,
  History,
  Trash2,
  GraduationCap,
  Sparkles,
  Download,
  X,
  SlidersHorizontal,
} from "lucide-react";
import ConfigPanel from "./components/ConfigPanel";
import BrandingPanel from "./components/BrandingPanel";
import PaperPreview from "./components/PaperPreview";
import {
  calcTimeMinutes,
  calcTotalMarks,
  type Branding,
  type Paper,
  type TestConfig,
} from "./lib/types";
import { generatePaper, generateSolutions } from "./lib/aiClient";
import { downloadPDF } from "./lib/pdfExport";
import { downloadWord } from "./lib/wordExport";
import { supabase } from "./lib/supabase";

type Theme = "light" | "dark";

const DEFAULT_CONFIG: TestConfig = {
  subject: "Science",
  scope: "full",
  scopeValue: "",
  level: "Standard",
  difficulty: "Medium",
  totalMarks: 40,
  pyq: false,
};

const DEFAULT_BRANDING: Branding = {
  schoolName: "",
  logoDataUrl: null,
  watermarkText: "SAMPLE ONLY",
  examTitle: "CBSE Class 10 Examination",
};

export default function App() {
  const [theme, setTheme] = useState<Theme>("light");
  const [config, setConfig] = useState<TestConfig>(DEFAULT_CONFIG);
  const [branding, setBranding] = useState<Branding>(DEFAULT_BRANDING);
  const [paper, setPaper] = useState<Paper | null>(null);
  const [loading, setLoading] = useState(false);
  const [provider, setProvider] = useState<string | null>(null);
  const [showSolutions, setShowSolutions] = useState(false);
  const [generatingSolutions, setGeneratingSolutions] = useState(false);
  const [activeSet, setActiveSet] = useState(0); // 0 = main, 1=A, 2=B, 3=C
  const [sets, setSets] = useState<Paper[]>([]);
  const [savedPapers, setSavedPapers] = useState<Paper[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isFallback, setIsFallback] = useState(false);

  // Theme
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  // Load saved papers
  useEffect(() => {
    loadSavedPapers();
  }, []);

  const loadSavedPapers = async () => {
    try {
      const { data, error } = await supabase
        .from("papers")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      if (data) {
        setSavedPapers(
          data.map((r) => ({
            id: r.id,
            title: r.title,
            subject: r.subject,
            config: r.config,
            sections: r.sections,
            totalMarks: r.total_marks,
            timeMinutes: r.time_minutes,
            solutions: r.solutions,
            createdAt: r.created_at,
          }))
        );
      }
    } catch (err) {
      console.error("Failed to load saved papers:", err);
    }
  };

  const handleGenerate = async () => {
    setLoading(true);
    setProvider(null);
    setShowSolutions(false);
    try {
      const { sections, provider: prov, fallback } = await generatePaper(config);
      const totalMarks = calcTotalMarks(sections);
      const newPaper: Paper = {
        title: `${config.subject} ${config.level} Paper`,
        subject: config.subject,
        config,
        sections,
        totalMarks,
        timeMinutes: calcTimeMinutes(totalMarks),
        solutions: null,
      };
      setPaper(newPaper);
      setProvider(prov);
      setIsFallback(fallback);
      setSets([]);
      setActiveSet(0);
    } catch (err) {
      console.error(err);
      alert(
        err instanceof Error
          ? `Generation failed: ${err.message}`
          : "Generation failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSolutions = async () => {
    if (!paper) return;
    if (!showSolutions && !paper.solutions) {
      setGeneratingSolutions(true);
      try {
        const allQs = paper.sections.flatMap((s) =>
          s.questions.map((q) => ({
            question: q.question,
            marks: q.marks,
            section: q.section,
          }))
        );
        const sols = await generateSolutions(allQs);
        setPaper({ ...paper, solutions: sols });
        setShowSolutions(true);
      } catch (err) {
        console.error(err);
        alert("Could not generate solutions. AI providers may be busy.");
      } finally {
        setGeneratingSolutions(false);
      }
    } else {
      setShowSolutions(!showSolutions);
    }
  };

  const shuffleArray = <T,>(arr: T[]): T[] => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  const handleReset = () => {
    setConfig(DEFAULT_CONFIG);
    setPaper(null);
    setSets([]);
    setActiveSet(0);
    setShowSolutions(false);
  };

  const handleGenerateSets = () => {
    if (!paper) return;
    const newSets: Paper[] = [];
    for (let i = 0; i < 3; i++) {
      const shuffledSections = paper.sections.map((s) => ({
        ...s,
        questions: shuffleArray(
          s.questions.map((q) => ({
            ...q,
            options: q.options ? shuffleArray(q.options) : null,
          }))
        ),
      }));
      newSets.push({
        ...paper,
        title: `${paper.title} — Set ${String.fromCharCode(65 + i)}`,
        sections: shuffledSections,
      });
    }
    setSets(newSets);
    setActiveSet(1);
  };

  const currentDisplayPaper: Paper | null =
    activeSet === 0 ? paper : sets[activeSet - 1] ?? paper;

  const handleSave = async () => {
    if (!paper) return;
    try {
      const { error } = await supabase.from("papers").insert({
        title: paper.title,
        subject: paper.subject,
        config: paper.config,
        sections: paper.sections,
        total_marks: paper.totalMarks,
        time_minutes: paper.timeMinutes,
        solutions: paper.solutions,
      });
      if (error) throw error;
      await loadSavedPapers();
      alert("Paper saved to your library!");
    } catch (err) {
      console.error(err);
      alert("Could not save paper.");
    }
  };

  const handleLoadSaved = (p: Paper) => {
    setPaper(p);
    setConfig(p.config);
    setSets([]);
    setActiveSet(0);
    setShowSolutions(!!p.solutions);
    setShowHistory(false);
  };

  const handleDeleteSaved = async (id: string) => {
    try {
      await supabase.from("papers").delete().eq("id", id);
      await loadSavedPapers();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDownloadPDF = () => {
    if (!currentDisplayPaper) return;
    downloadPDF(currentDisplayPaper, branding);
  };

  const handleDownloadWord = () => {
    if (!currentDisplayPaper) return;
    downloadWord(currentDisplayPaper, branding);
  };

  const renderSidebar = (closeOnAction = false) => (
    <>
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-5">
        <h2 className="text-sm font-bold text-slate-800 dark:text-white mb-4">
          School Name &amp; Logo
        </h2>
        <BrandingPanel
          branding={branding}
          onChange={setBranding}
          showSolutions={showSolutions}
          onToggleSolutions={handleToggleSolutions}
        />
        {generatingSolutions && (
          <p className="text-xs text-blue-500 mt-2 flex items-center gap-1">
            <Loader2 className="w-3 h-3 animate-spin" />
            Generating solutions...
          </p>
        )}
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-5">
        <h2 className="text-sm font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          Test Configuration
        </h2>
        <ConfigPanel
          config={config}
          onChange={setConfig}
          onGenerate={() => {
            handleGenerate();
            if (closeOnAction) setSidebarOpen(false);
          }}
          onReset={handleReset}
          loading={loading}
        />
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors">
      {/* Top Bar */}
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-600/30">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-800 dark:text-white tracking-tight">
                freetest
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 -mt-0.5">
                CBSE Class 10 Paper Generator
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
              title="Saved papers"
            >
              <History className="w-5 h-5" />
            </button>
            <button
              onClick={() =>
                setTheme(theme === "light" ? "dark" : "light")
              }
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
              title="Toggle theme"
            >
              {theme === "light" ? (
                <Moon className="w-5 h-5" />
              ) : (
                <Sun className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* History drawer */}
      {showHistory && (
        <div className="fixed inset-0 z-40 bg-black/30" onClick={() => setShowHistory(false)}>
          <div
            className="absolute right-0 top-0 bottom-0 w-80 max-w-[85vw] bg-white dark:bg-slate-900 shadow-2xl overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-slate-200 dark:border-slate-800">
              <h2 className="font-bold text-slate-800 dark:text-white">
                Saved Papers
              </h2>
            </div>
            <div className="p-3 space-y-2">
              {savedPapers.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-8">
                  No saved papers yet
                </p>
              ) : (
                savedPapers.map((p) => (
                  <div
                    key={p.id}
                    className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors group"
                  >
                    <div className="flex justify-between items-start">
                      <button
                        onClick={() => handleLoadSaved(p)}
                        className="text-left flex-1 min-w-0"
                      >
                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate">
                          {p.title}
                        </p>
                        <p className="text-xs text-slate-500">
                          {p.subject} · {p.totalMarks} marks
                        </p>
                      </button>
                      <button
                        onClick={() => handleDeleteSaved(p.id!)}
                        className="p-1 rounded hover:bg-rose-100 text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main layout */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Mobile sidebar toggle */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden mb-4 w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 text-sm font-semibold shadow-sm"
        >
          <SlidersHorizontal className="w-4 h-4" />
          Settings & Branding
        </button>

        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-50 bg-black/40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <div
              className="absolute left-0 top-0 bottom-0 w-80 max-w-[85vw] bg-slate-50 dark:bg-slate-950 overflow-y-auto p-4 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-bold text-slate-800 dark:text-white">Settings</h2>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              {renderSidebar(true)}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6">
          {/* Left sidebar (desktop) */}
          <aside className="hidden lg:block space-y-4">
            {renderSidebar(true)}
          </aside>
          <section>
            {!paper && !loading && (
              <div className="flex flex-col items-center justify-center h-[400px] sm:h-[500px] text-center px-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30 flex items-center justify-center mb-4">
                  <FileText className="w-8 h-8 sm:w-10 sm:h-10 text-blue-600 dark:text-blue-400" />
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-700 dark:text-slate-200 mb-2">
                  Generate Your CBSE Test Paper
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md">
                  Configure your test — choose subject, scope,
                  marks, level, difficulty, and PYQ focus — then click generate.
                  The AI engine builds a complete CBSE-pattern paper in seconds.
                </p>
              </div>
            )}

            {loading && (
              <div className="flex flex-col items-center justify-center h-[500px]">
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                  Generating your test paper...
                </p>
              </div>
            )}

            {paper && !loading && currentDisplayPaper && (
              <>
                {isFallback && (
                  <div className="flex items-center gap-2 mb-4 px-4 py-2.5 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 text-xs font-medium">
                    <Sparkles className="w-4 h-4 shrink-0" />
                    Paper assembled from the built-in CBSE question bank (AI providers unavailable). Your test is ready to use.
                  </div>
                )}
                {/* Action bar */}
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  {/* Sets */}
                  <div className="flex items-center gap-1 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-1 shrink-0">
                    <button
                      onClick={() => setActiveSet(0)}
                      className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                        activeSet === 0
                          ? "bg-blue-600 text-white"
                          : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                      }`}
                    >
                      Main
                    </button>
                    {sets.length > 0 &&
                      [0, 1, 2].map((i) => (
                        <button
                          key={i}
                          onClick={() => setActiveSet(i + 1)}
                          className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                            activeSet === i + 1
                              ? "bg-blue-600 text-white"
                              : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                          }`}
                        >
                          Set {String.fromCharCode(65 + i)}
                        </button>
                      ))}
                  </div>

                  {sets.length === 0 && (
                    <button
                      onClick={handleGenerateSets}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      <CopyPlus className="w-4 h-4" />
                      Generate Sets A/B/C
                    </button>
                  )}

                  <div className="flex-1" />

                  <div className="flex items-center gap-2 ml-auto">
                    <button
                      onClick={handleSave}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      <Save className="w-4 h-4" />
                      Save
                    </button>

                    <button
                      onClick={handleDownloadPDF}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 transition-colors shadow-sm"
                    >
                      <Download className="w-4 h-4" />
                      PDF
                    </button>

                    <button
                      onClick={handleDownloadWord}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors shadow-sm"
                    >
                      <FileType2 className="w-4 h-4" />
                      Word
                    </button>
                  </div>
                </div>

                <PaperPreview
                  paper={currentDisplayPaper}
                  config={config}
                  branding={branding}
                  onPaperChange={(updated) => {
                    if (activeSet === 0) {
                      setPaper(updated);
                    } else {
                      const newSets = [...sets];
                      newSets[activeSet - 1] = updated;
                      setSets(newSets);
                    }
                  }}
                  showSolutions={showSolutions}
                  onToggleSolutions={handleToggleSolutions}
                />
              </>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
