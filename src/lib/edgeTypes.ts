// Shared types between client and edge function contract
export interface GenRequest {
  mode: "generate" | "swap" | "solutions";
  subject: string;
  scope: "full" | "chapter" | "topic";
  scopeValue?: string;
  level: "Basic" | "Standard";
  difficulty: "Easy" | "Medium" | "Hard";
  totalMarks: number;
  pyq: boolean;
  swapQuestion?: {
    section: string;
    marks: number;
    subject: string;
    difficulty: string;
    pyq: boolean;
  };
  questions?: Array<{
    question: string;
    marks: number;
    section: string;
  }>;
}
