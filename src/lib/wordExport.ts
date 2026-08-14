import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  AlignmentType,
  HeadingLevel,
  ImageRun,
} from "docx";
import type { Branding, Paper, PaperSection } from "./types";

function saveBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function formatTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h > 0 && m > 0) return `${h} hrs ${m} mins`;
  if (h > 0) return `${h} hrs`;
  return `${m} mins`;
}

async function logoToUint8Array(dataUrl: string): Promise<Uint8Array | null> {
  try {
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    const buf = await blob.arrayBuffer();
    return new Uint8Array(buf);
  } catch {
    return null;
  }
}

export async function downloadWord(paper: Paper, branding: Branding) {
  const children: Paragraph[] = [];

  // Logo
  if (branding.logoDataUrl) {
    const imgData = await logoToUint8Array(branding.logoDataUrl);
    if (imgData) {
      children.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new ImageRun({
              data: imgData,
              transformation: { width: 80, height: 80 },
              type: "png",
            } as unknown as ConstructorParameters<typeof ImageRun>[0]),
          ],
        })
      );
    }
  }

  // School name
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: branding.schoolName || "________________________",
          bold: true,
          size: 32,
        }),
      ],
    })
  );

  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: branding.examTitle || "CBSE Class 10 Examination",
          bold: true,
          size: 26,
        }),
      ],
    })
  );

  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: `${paper.subject} - ${paper.title}`,
          size: 22,
        }),
      ],
    })
  );

  children.push(new Paragraph({ text: "" }));

  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: `Maximum Marks: ${paper.totalMarks}    |    Time Allowed: ${formatTime(paper.timeMinutes)}    |    Level: ${paper.config.level}`,
          bold: true,
          size: 20,
        }),
      ],
    })
  );

  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: "General Instructions: Read the question paper carefully. All questions are compulsory. Marks are indicated against each question.",
          italics: true,
          size: 18,
        }),
      ],
    })
  );

  children.push(new Paragraph({ text: "" }));

  // Sections
  let qNum = 0;
  for (const section of paper.sections) {
    if (section.questions.length === 0) continue;

    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [
          new TextRun({
            text: `${section.name}: ${section.label} (${section.marksPerQuestion} Marks each)`,
            bold: true,
            size: 22,
          }),
        ],
      })
    );

    for (const q of section.questions) {
      qNum += 1;
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `Q${qNum}. ${q.question}  [${q.marks} marks]`,
              size: 20,
            }),
          ],
        })
      );

      if (q.options) {
        for (const opt of q.options) {
          children.push(
            new Paragraph({
              children: [new TextRun({ text: `    ${opt}`, size: 20 })],
            })
          );
        }
      }
      children.push(new Paragraph({ text: "" }));
    }
  }

  // Answer key
  if (paper.solutions) {
    children.push(new Paragraph({ children: [] }));
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({ text: "Answer Key & Solutions", bold: true, size: 28 }),
        ],
      })
    );

    let solNum = 0;
    for (const section of paper.sections) {
      for (const q of section.questions) {
        solNum += 1;
        const sol = paper.solutions[q.question] || q.solution || q.answer;
        if (!sol) continue;
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `Ans ${solNum}: ${sol}`,
                size: 20,
              }),
            ],
          })
        );
      }
    }
  }

  const doc = new Document({
    sections: [
      {
        properties: {},
        children,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  saveBlob(blob, `${paper.subject}_${paper.title}.docx`);
}
