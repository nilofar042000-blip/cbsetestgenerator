import { jsPDF } from "jspdf";
import type { Branding, Paper, PaperSection, Question } from "./types";

function formatTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h > 0 && m > 0) return `${h} hrs ${m} mins`;
  if (h > 0) return `${h} hrs`;
  return `${m} mins`;
}

function drawWatermark(
  doc: jsPDF,
  text: string,
  pageW: number,
  pageH: number
) {
  if (!text) return;
  doc.saveGraphicsState();
  doc.setTextColor(200, 200, 200);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(60);
  const txt = text.toUpperCase();
  const w = doc.getTextWidth(txt);
  doc.text(txt, pageW / 2 - w / 2, pageH / 2, { angle: 45 });
  doc.restoreGraphicsState();
}

function drawHeader(
  doc: jsPDF,
  branding: Branding,
  paper: Paper,
  margin: number,
  pageW: number
): number {
  let y = margin;

  // Logo
  if (branding.logoDataUrl) {
    try {
      const fmt = branding.logoDataUrl.includes("image/png") ? "PNG" : "JPEG";
      doc.addImage(branding.logoDataUrl, fmt, margin, y, 28, 28);
    } catch {
      // skip if image fails
    }
  }

  // School name
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(20, 20, 20);
  const school = branding.schoolName || "________________________";
  doc.text(school, pageW / 2, y + 8, { align: "center" });

  doc.setFontSize(13);
  doc.text(
    branding.examTitle || "CBSE Class 10 Examination",
    pageW / 2,
    y + 16,
    { align: "center" }
  );

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text(`${paper.subject} - ${paper.title}`, pageW / 2, y + 24, {
    align: "center",
  });

  y += 34;

  // Info line
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text(`Maximum Marks: ${paper.totalMarks}`, margin, y);
  doc.text(`Time Allowed: ${formatTime(paper.timeMinutes)}`, pageW / 2, y, {
    align: "center",
  });
  doc.text(`Level: ${paper.config.level}`, pageW - margin, y, { align: "right" });

  y += 6;
  doc.setDrawColor(100, 100, 100);
  doc.line(margin, y, pageW - margin, y);
  y += 8;

  // Instructions
  doc.setFont("helvetica", "italic");
  doc.setFontSize(9);
  doc.setTextColor(80, 80, 80);
  doc.text(
    "General Instructions: Read the question paper carefully. All questions are compulsory.",
    margin,
    y
  );
  y += 5;
  doc.text(
    "Marks are indicated against each question. Write neatly and show all working.",
    margin,
    y
  );
  y += 10;

  return y;
}

function drawQuestion(
  doc: jsPDF,
  q: Question,
  num: number,
  x: number,
  y: number,
  margin: number,
  pageW: number,
  pageH: number
): number {
  const wrapW = pageW - margin - x - 4;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(30, 30, 30);

  const qText = `Q${num}. ${q.question}`;
  const lines = doc.splitTextToSize(qText, wrapW);
  doc.text(lines, x, y);
  let cy = y + lines.length * 5.5;

  if (q.options && q.options.length > 0) {
    for (const opt of q.options) {
      const optLines = doc.splitTextToSize(opt, wrapW - 10);
      doc.text(optLines, x + 6, cy);
      cy += optLines.length * 5;
    }
    cy += 1;
  }

  // marks indicator on right
  doc.setFont("helvetica", "bold");
  doc.text(`[${q.marks}]`, pageW - margin, y, { align: "right" });

  cy += 4;
  if (cy > pageH - margin) {
    doc.addPage();
    cy = margin + 10;
  }
  return cy;
}

export function downloadPDF(paper: Paper, branding: Branding) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 20;

  drawWatermark(doc, branding.watermarkText, pageW, pageH);
  let y = drawHeader(doc, branding, paper, margin, pageW);

  let qNum = 0;
  for (const section of paper.sections) {
    if (section.questions.length === 0) continue;

    if (y > pageH - 30) {
      doc.addPage();
      drawWatermark(doc, branding.watermarkText, pageW, pageH);
      y = margin + 10;
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(20, 20, 20);
    doc.text(`${section.name}: ${section.label}`, margin, y);
    doc.text(
      `(${section.marksPerQuestion} Marks each)`,
      pageW - margin,
      y,
      { align: "right" }
    );
    y += 8;

    for (const q of section.questions) {
      qNum += 1;
      y = drawQuestion(doc, q, qNum, margin, y, margin, pageW, pageH);
    }
    y += 4;
  }

  // Answer key
  if (paper.solutions) {
    doc.addPage();
    drawWatermark(doc, branding.watermarkText, pageW, pageH);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("Answer Key & Solutions", pageW / 2, margin + 10, {
      align: "center",
    });
    y = margin + 24;

    let solNum = 0;
    for (const section of paper.sections) {
      for (const q of section.questions) {
        solNum += 1;
        const sol = paper.solutions[q.question] || q.solution || q.answer;
        if (!sol) continue;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        const qLines = doc.splitTextToSize(
          `Ans ${solNum}: ${sol}`,
          pageW - margin * 2
        );
        doc.text(qLines, margin, y);
        y += qLines.length * 5 + 3;
        if (y > pageH - margin) {
          doc.addPage();
          drawWatermark(doc, branding.watermarkText, pageW, pageH);
          y = margin + 10;
        }
      }
    }
  }

  doc.save(`${paper.subject}_${paper.title}.pdf`);
}

export function downloadPDFFromSections(
  sections: PaperSection[],
  paper: Paper,
  branding: Branding
) {
  downloadPDF({ ...paper, sections }, branding);
}
