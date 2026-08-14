export type Subject =
  | "Science"
  | "Mathematics"
  | "Social Science"
  | "English"
  | "Hindi";
export type Scope = "full" | "chapter" | "topic";
export type Level = "Basic" | "Standard";
export type Difficulty = "Easy" | "Medium" | "Hard";

export interface TestConfig {
  subject: Subject;
  scope: Scope;
  scopeValue: string;
  level: Level;
  difficulty: Difficulty;
  totalMarks: number;
  pyq: boolean;
}

export interface Question {
  id: string;
  question: string;
  options: string[] | null;
  answer: string;
  marks: number;
  section: string;
  type: string;
  solution?: string;
}

export interface PaperSection {
  name: string;
  label: string;
  marksPerQuestion: number;
  questions: Question[];
}

export interface Paper {
  id?: string;
  title: string;
  subject: string;
  config: TestConfig;
  sections: PaperSection[];
  totalMarks: number;
  timeMinutes: number;
  solutions: Record<string, string> | null;
  createdAt?: string;
}

export interface Branding {
  schoolName: string;
  logoDataUrl: string | null;
  watermarkText: string;
  examTitle: string;
}

// CBSE section definitions
export const CBSE_SECTIONS = [
  { name: "Section A", label: "MCQs & Assertion-Reasoning", marksPerQuestion: 1 },
  { name: "Section B", label: "Very Short Answer", marksPerQuestion: 2 },
  { name: "Section C", label: "Short Answer", marksPerQuestion: 3 },
  { name: "Section D", label: "Long Answer", marksPerQuestion: 5 },
  { name: "Section E", label: "Case-Study / Source-Based", marksPerQuestion: 4 },
] as const;

// Subject -> chapters/topics data for scope selectors
export const SUBJECT_SCOPES: Record<Subject, { chapters: string[]; topics: Record<string, string[]> }> = {
  Science: {
    chapters: [
      "Chemical Reactions and Equations",
      "Acids, Bases and Salts",
      "Metals and Non-metals",
      "Carbon and its Compounds",
      "Life Processes",
      "Control and Coordination",
      "How Organisms Reproduce",
      "Heredity and Evolution",
      "Light - Reflection and Refraction",
      "The Human Eye and the Colourful World",
      "Electricity",
      "Magnetic Effects of Electric Current",
      "Our Environment",
      "Sources of Energy",
    ],
    topics: {},
  },
  Mathematics: {
    chapters: [
      "Real Numbers",
      "Polynomials",
      "Pair of Linear Equations in Two Variables",
      "Quadratic Equations",
      "Arithmetic Progressions",
      "Triangles",
      "Coordinate Geometry",
      "Trigonometry",
      "Applications of Trigonometry",
      "Circles",
      "Areas Related to Circles",
      "Surface Areas and Volumes",
      "Statistics",
      "Probability",
    ],
    topics: {},
  },
  "Social Science": {
    chapters: [
      "The Rise of Nationalism in Europe",
      "Nationalism in India",
      "The Making of a Global World",
      "The Age of Industrialisation",
      "Print Culture and the Modern World",
      "Resources and Development",
      "Forest and Wildlife Resources",
      "Water Resources",
      "Agriculture",
      "Mineral and Energy Resources",
      "Manufacturing Industries",
      "Lifelines of National Economy",
      "Power Sharing",
      "Federalism",
      "Democracy and Diversity",
      "Gender, Religion and Caste",
      "Political Parties",
      "Outcomes of Democracy",
      "Development",
      "Sectors of the Indian Economy",
      "Money and Credit",
      "Globalisation and the Indian Economy",
      "Consumer Rights",
    ],
    topics: {},
  },
  English: {
    chapters: [
      "A Letter to God",
      "Nelson Mandela: Long Walk to Freedom",
      "Two Stories about Flying",
      "From the Diary of Anne Frank",
      "The Hundred Dresses - I",
      "The Hundred Dresses - II",
      "Glimpses of India",
      "Mijbil the Otter",
      "Madam Rides the Bus",
      "The Sermon at Benares",
      "The Proposal",
      "Dust of Snow",
      "Fire and Ice",
      "A Tiger in the Zoo",
      "How to Tell Wild Animals",
      "The Ball Poem",
      "Amanda!",
      "The Trees",
      "Fog",
      "The Tale of Custard the Dragon",
      "For Anne Gregory",
    ],
    topics: {},
  },
  Hindi: {
    chapters: [
      "सूरदास के पद",
      "तुलसीदास - राम-लक्ष्मण-परशुराम संवाद",
      "देव - सवैया और कवित्त",
      "जयशंकर प्रसाद - आत्मकथ्य",
      "सूर्यकांत त्रिपाठी निराला - उत्सा",
      "नागार्जुन - यह दंतुरहित मुस्कान",
      "गिरिजाकुमार माथुर - छाया हरे शब्दों का",
      "ऋतुराज - कन्यादान",
      "भानुप्रसाद - संगतकार मोहन",
      "सुमित्रानंदन पंत - नेताजी का चश्मा",
      "स्वयं प्रकाश - बालगोबिन भगत",
      "यशपाल - लखनवी रसूल",
      "सर्वेश्वर दयाल सक्सेना - स्त्री शिक्षा के विरोधी कुतर्कों का खंडन",
      "मन्नू भंडारी - एक कहानी यह भी",
      "महावीर प्रसाद द्विवेदी - स्त्री शिक्षा",
      "यतींद्र मिश्र - नौबतखाने में इबादत",
      "भदंत आनंद कौसल्यायन - संस्कृति",
      "धर्मवीर भारती - कर चले हम फ़िदा",
      "आत्माराम सहाय - तीसरी कसम के शिल्पकार शैलेंद्र",
      "जाबिर हुसैन - एहसास",
      "रामविलास शर्मा - आत्मा की चेतना",
      "रामवृक्ष बेनीपुरी - बालक",
      "इन्द्रा धनुष - ढाई घर",
      "मालती जोशी - एक माँ की याद",
      "भीमसेन तिवारी - गुरु और चेला",
      "नरेंद्र कोहली - एक फूल की चाह",
      "राजेंद्र अवस्थी - कन्यादान",
    ],
    topics: {},
  },
};

// Calculate time allowed based on total marks
export function calcTimeMinutes(totalMarks: number): number {
  // 20 marks = 45 min, 80 marks = 180 min (3 hrs)
  // Linear: minutes = marks * 2.25
  return Math.round(totalMarks * 2.25);
}

export function calcTotalMarks(sections: PaperSection[]): number {
  return sections.reduce(
    (sum, s) => sum + s.questions.reduce((qs, q) => qs + q.marks, 0),
    0
  );
}
