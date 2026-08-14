import type { GenRequest } from "./edgeTypes";
import type { PaperSection, Question, TestConfig } from "./types";
import {
  generateLocalPaper,
  swapLocalQuestion,
  generateLocalSolutions,
} from "./questionBank";

const FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-proxy`;
const HEADERS = {
  Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
  "Content-Type": "application/json",
};

interface AIResponse {
  data: {
    sections?: Array<{
      name: string;
      label: string;
      marksPerQuestion: number;
      questions: Array<{
        question: string;
        options?: string[] | null;
        answer: string;
        marks: number;
        section: string;
        type: string;
        solution?: string;
      }>;
    }>;
    question?: {
      question: string;
      options?: string[] | null;
      answer: string;
      marks: number;
      section: string;
      type: string;
      solution?: string;
    };
    solutions?: Array<{ question: string; solution: string }>;
  };
  provider: string;
  fallback?: boolean;
  error?: string;
}

export interface GenerateResult {
  sections: PaperSection[];
  provider: string;
  fallback: boolean;
}

export interface SwapResult {
  question: Question;
  provider: string;
  fallback: boolean;
}

let _uid = 0;
function uid(): string {
  _uid += 1;
  return `q_${Date.now()}_${_uid}`;
}

const EDGE_TIMEOUT_MS = 12000;

function fetchWithTimeout(
  url: string,
  init: RequestInit,
  ms = EDGE_TIMEOUT_MS
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  return fetch(url, { ...init, signal: controller.signal }).finally(() =>
    clearTimeout(timer)
  );
}

export async function generatePaper(
  config: TestConfig
): Promise<GenerateResult> {
  const body: GenRequest = {
    mode: "generate",
    subject: config.subject,
    scope: config.scope,
    scopeValue: config.scopeValue,
    level: config.level,
    difficulty: config.difficulty,
    totalMarks: config.totalMarks,
    pyq: config.pyq,
  };

  try {
    const res = await fetchWithTimeout(FUNCTION_URL, {
      method: "POST",
      headers: HEADERS,
      body: JSON.stringify(body),
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const json: AIResponse = await res.json();
    if (json.error) throw new Error(json.error);
    if (!json.data?.sections) throw new Error("No sections returned");

    const sections: PaperSection[] = json.data.sections.map((s) => ({
      name: s.name,
      label: s.label,
      marksPerQuestion: s.marksPerQuestion,
      questions: s.questions.map((q) => ({
        id: uid(),
        question: q.question,
        options: q.options ?? null,
        answer: q.answer,
        marks: q.marks,
        section: q.section,
        type: q.type,
        solution: q.solution,
      })),
    }));

    return {
      sections,
      provider: json.provider,
      fallback: json.fallback ?? false,
    };
  } catch {
    // Seamless client-side fallback — zero downtime
    const local = generateLocalPaper(config);
    return { ...local, fallback: true };
  }
}

export async function swapQuestion(
  config: TestConfig,
  section: string,
  marks: number
): Promise<SwapResult> {
  const body: GenRequest = {
    mode: "swap",
    subject: config.subject,
    scope: config.scope,
    scopeValue: config.scopeValue,
    level: config.level,
    difficulty: config.difficulty,
    totalMarks: config.totalMarks,
    pyq: config.pyq,
    swapQuestion: {
      section,
      marks,
      subject: config.subject,
      difficulty: config.difficulty,
      pyq: config.pyq,
    },
  };

  try {
    const res = await fetchWithTimeout(FUNCTION_URL, {
      method: "POST",
      headers: HEADERS,
      body: JSON.stringify(body),
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json: AIResponse = await res.json();
    if (json.error) throw new Error(json.error);
    if (!json.data?.question) throw new Error("No question returned");

    const q = json.data.question;
    return {
      question: {
        id: uid(),
        question: q.question,
        options: q.options ?? null,
        answer: q.answer,
        marks: q.marks,
        section: q.section,
        type: q.type,
        solution: q.solution,
      },
      provider: json.provider,
      fallback: json.fallback ?? false,
    };
  } catch {
    const local = swapLocalQuestion(config, section, marks);
    return { ...local, fallback: true };
  }
}

export async function generateSolutions(
  questions: Array<{ question: string; marks: number; section: string }>
): Promise<Record<string, string>> {
  const body: GenRequest = {
    mode: "solutions",
    subject: "",
    scope: "full",
    level: "Standard",
    difficulty: "Medium",
    totalMarks: 0,
    pyq: false,
    questions,
  };

  try {
    const res = await fetchWithTimeout(FUNCTION_URL, {
      method: "POST",
      headers: HEADERS,
      body: JSON.stringify(body),
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json: AIResponse = await res.json();
    if (json.error) throw new Error(json.error);
    if (!json.data?.solutions) throw new Error("No solutions returned");

    const map: Record<string, string> = {};
    for (const s of json.data.solutions) {
      map[s.question] = s.solution;
    }
    return map;
  } catch {
    return generateLocalSolutions(questions);
  }
}
