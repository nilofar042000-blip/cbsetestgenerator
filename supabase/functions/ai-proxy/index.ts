import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

// --- Server-side API keys from environment variables (never hardcoded) ---
const GEMINI_KEY = Deno.env.get("GEMINI_API_KEY") ?? "";
const OPENAI_KEY = Deno.env.get("OPENAI_API_KEY") ?? "";
const GROQ_KEY = Deno.env.get("GROQ_API_KEY") ?? "";

const GEMINI_MODEL = "gemini-1.5-flash";
const GROQ_MODEL = "llama-3.3-70b-versatile";

interface GenRequest {
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

interface AIQuestion {
  question: string;
  options?: string[] | null;
  answer: string;
  marks: number;
  section: string;
  type: string;
  solution?: string;
}

// ---------- Local CBSE Question Bank ----------

const QUESTION_BANK: Record<string, {
  sectionA: AIQuestion[];
  sectionB: AIQuestion[];
  sectionC: AIQuestion[];
  sectionD: AIQuestion[];
  sectionE: AIQuestion[];
}> = {
  Science: {
    sectionA: [
      {
        question: "Which of the following is a decomposition reaction?",
        options: ["A) CaCO₃ → CaO + CO₂", "B) 2H₂ + O₂ → 2H₂O", "C) NaOH + HCl → NaCl + H₂O", "D) Fe + CuSO₄ → FeSO₄ + Cu"],
        answer: "A) CaCO₃ → CaO + CO₂",
        marks: 1, section: "Section A", type: "MCQ",
        solution: "A decomposition reaction breaks a single compound into two or more simpler substances. CaCO₃ → CaO + CO₂ fits this pattern.",
      },
      {
        question: "Assertion (A): Sodium metal is kept immersed in kerosene.\nReason (R): Sodium reacts vigorously with moisture and air.",
        options: ["A) Both A and R are true and R is the correct explanation of A", "B) Both A and R are true but R is NOT the correct explanation of A", "C) A is true but R is false", "D) A is false but R is true"],
        answer: "A) Both A and R are true and R is the correct explanation of A",
        marks: 1, section: "Section A", type: "Assertion-Reason",
        solution: "Sodium is highly reactive with moisture and air, so it is stored in kerosene to prevent contact. R correctly explains A.",
      },
      {
        question: "The SI unit of electric current is:",
        options: ["A) Volt", "B) Ampere", "C) Ohm", "D) Watt"],
        answer: "B) Ampere",
        marks: 1, section: "Section A", type: "MCQ",
        solution: "The SI unit of electric current is the ampere (A).",
      },
      {
        question: "Which part of the human eye controls the amount of light entering it?",
        options: ["A) Cornea", "B) Iris", "C) Retina", "D) Pupil"],
        answer: "B) Iris",
        marks: 1, section: "Section A", type: "MCQ",
        solution: "The iris controls the size of the pupil, regulating the amount of light entering the eye.",
      },
      {
        question: "Assertion (A): Carbon can form a large number of compounds.\nReason (R): Carbon has the property of catenation and tetravalency.",
        options: ["A) Both A and R are true and R is the correct explanation of A", "B) Both A and R are true but R is NOT the correct explanation of A", "C) A is true but R is false", "D) A is false but R is true"],
        answer: "A) Both A and R are true and R is the correct explanation of A",
        marks: 1, section: "Section A", type: "Assertion-Reason",
        solution: "Carbon's catenation (self-linking) and tetravalency (4 valence electrons) allow it to form millions of compounds. R explains A.",
      },
      {
        question: "Which of the following is NOT a greenhouse gas?",
        options: ["A) Carbon dioxide", "B) Methane", "C) Oxygen", "D) Water vapour"],
        answer: "C) Oxygen",
        marks: 1, section: "Section A", type: "MCQ",
        solution: "Oxygen does not trap heat in the atmosphere; CO₂, methane, and water vapour are greenhouse gases.",
      },
      {
        question: "The pH value of a neutral solution is:",
        options: ["A) 0", "B) 7", "C) 14", "D) 1"],
        answer: "B) 7",
        marks: 1, section: "Section A", type: "MCQ",
        solution: "A neutral solution has a pH of 7, indicating equal H⁺ and OH⁻ ion concentrations.",
      },
      {
        question: "Which hormone is responsible for the regulation of blood sugar levels?",
        options: ["A) Thyroxine", "B) Insulin", "C) Adrenaline", "D) Growth hormone"],
        answer: "B) Insulin",
        marks: 1, section: "Section A", type: "MCQ",
        solution: "Insulin, produced by the pancreas, regulates blood glucose levels by promoting glucose uptake.",
      },
    ],
    sectionB: [
      {
        question: "Why does tooth decay occur when the pH of mouth is lower than 5.5? Explain.",
        answer: "When pH falls below 5.5, the acidic environment corrodes the calcium phosphate (enamel) of teeth, causing decay.",
        marks: 2, section: "Section B", type: "Very Short Answer",
        solution: "Bacteria in the mouth produce acids from food debris. When pH < 5.5, the acid dissolves tooth enamel (calcium phosphate), leading to cavities.",
      },
      {
        question: "State the function of a fuse in an electric circuit. On what principle does it work?",
        answer: "A fuse protects circuits by melting and breaking the circuit when current exceeds a safe limit. It works on the heating effect of electric current (Joule's law).",
        marks: 2, section: "Section B", type: "Very Short Answer",
        solution: "The fuse wire has a low melting point. Excess current heats it (Joule heating), causing it to melt and break the circuit, protecting appliances.",
      },
      {
        question: "What is the role of saliva in the digestion of food?",
        answer: "Saliva contains the enzyme salivary amylase which breaks down starch into simple sugars, beginning chemical digestion in the mouth.",
        marks: 2, section: "Section B", type: "Very Short Answer",
        solution: "Saliva moistens food and its amylase enzyme converts starch to maltose, initiating digestion.",
      },
      {
        question: "Write the chemical formula of washing soda and name the process of its preparation from baking soda.",
        answer: "Washing soda is Na₂CO₃·10H₂O. It is prepared by heating baking soda (NaHCO₃) followed by recrystallisation.",
        marks: 2, section: "Section B", type: "Very Short Answer",
        solution: "2NaHCO₃ → Na₂CO₃ + H₂O + CO₂. The Na₂CO₃ is then recrystallised to get Na₂CO₃·10H₂O.",
      },
    ],
    sectionC: [
      {
        question: "Draw a labelled diagram of the longitudinal section of a flower and explain the function of the stigma.",
        answer: "The stigma is the receptive surface of the pistil that catches pollen grains during pollination, enabling fertilisation.",
        marks: 3, section: "Section C", type: "Short Answer",
        solution: "The stigma provides a sticky surface for pollen to land on. Pollen germinates here, and the pollen tube grows down through the style to reach the ovary for fertilisation.",
      },
      {
        question: "Explain why carbon forms covalent bonds. Give two reasons.",
        answer: "1) Carbon has 4 valence electrons and cannot lose or gain 4 electrons easily, so it shares electrons. 2) It has a small atomic size, allowing strong sharing of electrons (covalent bonding).",
        marks: 3, section: "Section C", type: "Short Answer",
        solution: "Carbon's tetravalency (4 valence electrons) makes it energetically unfavorable to form C⁴⁺ or C⁴⁻ ions, so it shares electrons. Its small size enables effective orbital overlap for strong covalent bonds.",
      },
      {
        question: "An electric bulb is rated 220 V and 100 W. Calculate the current flowing through it and its resistance when it is operating.",
        answer: "Current = P/V = 100/220 ≈ 0.455 A. Resistance = V/I = 220/0.455 ≈ 484 Ω.",
        marks: 3, section: "Section C", type: "Short Answer",
        solution: "Using P = VI: I = P/V = 100/220 = 0.455 A. Using Ohm's law: R = V/I = 220/0.455 ≈ 484 Ω.",
      },
      {
        question: "What is a magnetic field? Draw the magnetic field lines around a bar magnet and state two properties of field lines.",
        answer: "A magnetic field is the region around a magnet where magnetic forces can be detected. Properties: 1) Lines go from N to S outside, S to N inside. 2) They never intersect.",
        marks: 3, section: "Section C", type: "Short Answer",
        solution: "The magnetic field is the space where a magnetic force is experienced. Field lines: emerge from N pole, enter S pole externally, never cross each other, and their density indicates field strength.",
      },
    ],
    sectionD: [
      {
        question: "Explain the process of photosynthesis in detail. Write the balanced chemical equation and state the role of chlorophyll.",
        answer: "Photosynthesis is the process by which green plants make food (glucose) using CO₂, water, and sunlight. Equation: 6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂ (in presence of sunlight and chlorophyll). Chlorophyll absorbs sunlight energy needed for the reaction.",
        marks: 5, section: "Section D", type: "Long Answer",
        solution: "Photosynthesis occurs in chloroplasts. Chlorophyll absorbs light energy, which splits water (photolysis) and excites electrons. CO₂ is reduced to glucose via the Calvin cycle. Overall: 6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂. Chlorophyll acts as the energy transducer.",
      },
      {
        question: "Describe the human excretory system. Name the main components and explain how urine is formed.",
        answer: "The excretory system consists of kidneys, ureters, urinary bladder, and urethra. Blood enters kidneys via renal artery. Nephrons filter blood: filtration occurs in glomerulus, reabsorption in tubules, and secretion adds waste. The filtrate becomes urine, collected by collecting ducts, sent to bladder via ureters.",
        marks: 5, section: "Section D", type: "Long Answer",
        solution: "Kidneys contain millions of nephrons. Blood is filtered in the glomerulus (ultrafiltration). Useful substances are reabsorbed in the proximal tubule. Additional waste is secreted. The remaining fluid (urine) passes through the loop of Henle and collecting duct, then to the ureter → bladder → urethra.",
      },
      {
        question: "A concave lens has focal length 15 cm. At what distance should the object from the lens be placed so that it forms an image at 10 cm from the lens? Also find the magnification.",
        answer: "Using lens formula: 1/f = 1/v - 1/u. f = -15 cm (concave), v = -10 cm. 1/(-15) = 1/(-10) - 1/u → 1/u = -1/10 + 1/15 = (-3+2)/30 = -1/30. u = -30 cm. Magnification m = v/u = -10/-30 = +1/3 ≈ 0.33.",
        marks: 5, section: "Section D", type: "Long Answer",
        solution: "Lens formula: 1/f = 1/v - 1/u. For concave lens f = -15 cm, v = -10 cm. 1/u = 1/v - 1/f = -1/10 + 1/15 = -1/30. u = -30 cm. Object at 30 cm. m = v/u = (-10)/(-30) = +0.33 (virtual, erect, diminished).",
      },
    ],
    sectionE: [
      {
        question: "Case Study: A student observed that when a strip of zinc metal is placed in copper sulphate solution, the blue colour of the solution fades over time and a brownish coating appears on the zinc strip.\n\n(i) Name the type of reaction and write the balanced equation. (ii) Why does the blue colour fade? (iii) Identify the substance deposited on the zinc strip.",
        answer: "(i) Displacement reaction: Zn + CuSO₄ → ZnSO₄ + Cu. (ii) Blue colour fades because Cu²⁺ ions (blue) are replaced by Zn²⁺ ions (colourless). (iii) Copper metal is deposited on the zinc strip.",
        marks: 4, section: "Section E", type: "Case-Study",
        solution: "Zinc is more reactive than copper, so it displaces Cu from CuSO₄. Zn + CuSO₄ → ZnSO₄ + Cu. Cu²⁺ gives the blue colour; as they are consumed, colour fades. The brown deposit is copper metal.",
      },
      {
        question: "Case Study: An electric heater draws a current of 5 A when connected to a 220 V supply.\n\n(i) Calculate the power of the heater. (ii) Calculate the energy consumed in 2 hours. (iii) If the heater is used for 30 days, 2 hours daily, find the cost at ₹6/kWh.",
        answer: "(i) P = VI = 220 × 5 = 1100 W = 1.1 kW. (ii) E = P × t = 1.1 × 2 = 2.2 kWh per day. (iii) Total = 2.2 × 30 = 66 kWh. Cost = 66 × 6 = ₹396.",
        marks: 4, section: "Section E", type: "Case-Study",
        solution: "P = VI = 220×5 = 1100 W = 1.1 kW. Energy/day = 1.1 × 2 = 2.2 kWh. Total for 30 days = 66 kWh. Cost = 66 × 6 = ₹396.",
      },
      {
        question: "Case Study: A gardener found that his plants were not growing well in a particular soil. On testing, the soil pH was found to be 4.5.\n\n(i) Is the soil acidic or basic? (ii) Which nutrient availability is affected in this soil? (iii) Suggest two methods to improve soil pH for plant growth.",
        answer: "(i) The soil is acidic (pH < 7). (ii) In highly acidic soil, nutrients like nitrogen and phosphorus become less available. (iii) Add lime (CaO) or organic manure to reduce acidity and improve pH.",
        marks: 4, section: "Section E", type: "Case-Study",
        solution: "pH 4.5 is strongly acidic. Acidic soils reduce availability of N, P, and some micronutrients. Adding lime (CaO/CaCO₃) neutralises acidity. Organic matter improves soil buffering capacity.",
      },
    ],
  },
  Mathematics: {
    sectionA: [
      {
        question: "The HCF of 96 and 404 is:",
        options: ["A) 2", "B) 4", "C) 8", "D) 12"],
        answer: "B) 4",
        marks: 1, section: "Section A", type: "MCQ",
        solution: "96 = 2⁵ × 3, 404 = 2² × 101. HCF = 2² = 4.",
      },
      {
        question: "Assertion (A): The decimal expansion of a rational number is either terminating or non-terminating recurring.\nReason (R): A rational number can be expressed as p/q where q ≠ 0.",
        options: ["A) Both A and R are true and R is the correct explanation of A", "B) Both A and R are true but R is NOT the correct explanation of A", "C) A is true but R is false", "D) A is false but R is true"],
        answer: "B) Both A and R are true but R is NOT the correct explanation of A",
        marks: 1, section: "Section A", type: "Assertion-Reason",
        solution: "Both statements are true: rational numbers have terminating or recurring decimals, and can be written as p/q. However, R (definition) does not explain A (decimal property); the prime factorisation of q does.",
      },
      {
        question: "The value of sin 30° + cos 60° is:",
        options: ["A) 0", "B) 1", "C) 2", "D) 1/2"],
        answer: "B) 1",
        marks: 1, section: "Section A", type: "MCQ",
        solution: "sin 30° = 1/2, cos 60° = 1/2. Sum = 1/2 + 1/2 = 1.",
      },
      {
        question: "If the discriminant of a quadratic equation is zero, the roots are:",
        options: ["A) Real and distinct", "B) Real and equal", "C) Not real", "D) Complex"],
        answer: "B) Real and equal",
        marks: 1, section: "Section A", type: "MCQ",
        solution: "When D = b² - 4ac = 0, the quadratic has two real and equal roots: x = -b/2a.",
      },
      {
        question: "Assertion (A): The probability of an impossible event is 0.\nReason (R): Probability ranges from 0 to 1 inclusive.",
        options: ["A) Both A and R are true and R is the correct explanation of A", "B) Both A and R are true but R is NOT the correct explanation of A", "C) A is true but R is false", "D) A is false but R is true"],
        answer: "A) Both A and R are true and R is the correct explanation of A",
        marks: 1, section: "Section A", type: "Assertion-Reason",
        solution: "An impossible event cannot occur, so its probability is 0. Since probability ranges from 0 to 1, the lower bound 0 corresponds to impossibility. R explains A.",
      },
      {
        question: "The nth term of the AP: 2, 7, 12, 17, ... is:",
        options: ["A) 5n - 3", "B) 5n + 2", "C) 5n - 2", "D) 3n - 1"],
        answer: "A) 5n - 3",
        marks: 1, section: "Section A", type: "MCQ",
        solution: "a = 2, d = 5. aₙ = a + (n-1)d = 2 + (n-1)(5) = 5n - 3.",
      },
      {
        question: "The number of tangents that can be drawn from a point on the circle is:",
        options: ["A) 0", "B) 1", "C) 2", "D) Infinite"],
        answer: "B) 1",
        marks: 1, section: "Section A", type: "MCQ",
        solution: "A point on the circle has exactly one tangent at that point, perpendicular to the radius at that point.",
      },
      {
        question: "If P(E) = 0.05, what is the probability of 'not E'?",
        options: ["A) 0.95", "B) 0.05", "C) 1.05", "D) 0.5"],
        answer: "A) 0.95",
        marks: 1, section: "Section A", type: "MCQ",
        solution: "P(not E) = 1 - P(E) = 1 - 0.05 = 0.95.",
      },
    ],
    sectionB: [
      {
        question: "Find the roots of the quadratic equation 2x² - x - 6 = 0.",
        answer: "x = 2 or x = -3/2.",
        marks: 2, section: "Section B", type: "Very Short Answer",
        solution: "2x² - x - 6 = 0. Using the quadratic formula: x = (1 ± √(1+48))/4 = (1 ± 7)/4. x = 2 or x = -3/2.",
      },
      {
        question: "Find the 10th term of the AP: -3, -1, 1, 3, ...",
        answer: "The 10th term is 15.",
        marks: 2, section: "Section B", type: "Very Short Answer",
        solution: "a = -3, d = 2. a₁₀ = a + 9d = -3 + 9(2) = -3 + 18 = 15.",
      },
      {
        question: "A die is thrown once. Find the probability of getting a number less than 3.",
        answer: "P(number < 3) = 2/6 = 1/3.",
        marks: 2, section: "Section B", type: "Very Short Answer",
        solution: "Numbers less than 3 on a die: {1, 2}. Total outcomes = 6. P = 2/6 = 1/3.",
      },
      {
        question: "Evaluate: 2 tan²45° + cos²30° - sin²90°.",
        answer: "2(1) + (3/4) - 1 = 2 + 0.75 - 1 = 1.75 = 7/4.",
        marks: 2, section: "Section B", type: "Very Short Answer",
        solution: "tan 45° = 1, cos 30° = √3/2, sin 90° = 1. 2(1)² + (√3/2)² - (1)² = 2 + 3/4 - 1 = 7/4.",
      },
    ],
    sectionC: [
      {
        question: "Solve the pair of linear equations: 2x + 3y = 11 and 2x - 4y = -24. Find the value of x and y.",
        answer: "x = -2, y = 5.",
        marks: 3, section: "Section C", type: "Short Answer",
        solution: "Subtract: (2x+3y) - (2x-4y) = 11-(-24) → 7y = 35 → y = 5. Substitute: 2x + 15 = 11 → 2x = -4 → x = -2.",
      },
      {
        question: "Prove that the tangents drawn from an external point to a circle are equal in length.",
        answer: "Let PT and PT' be tangents from external point P to circle with centre O. In △OPT and △OPT': OT = OT' (radii), OP common, ∠OTP = ∠OT'P = 90°. By RHS congruence, △OPT ≅ △OPT'. Hence PT = PT'.",
        marks: 3, section: "Section C", type: "Short Answer",
        solution: "Consider tangents PT and PT' from P to circle with centre O. ∠OTP = ∠OT'P = 90° (tangent ⊥ radius). OT = OT' (radii), OP is common. By RHS congruence, △OPT ≅ △OPT', so PT = PT'.",
      },
      {
        question: "The coordinates of the points A and B are (3, 4) and (5, -2) respectively. Find the coordinates of the midpoint of AB and the distance AB.",
        answer: "Midpoint = (4, 1). AB = √((5-3)² + (-2-4)²) = √(4+36) = √40 = 2√10 units.",
        marks: 3, section: "Section C", type: "Short Answer",
        solution: "Midpoint = ((3+5)/2, (4+(-2))/2) = (4, 1). Distance = √((5-3)² + (-2-4)²) = √(4+36) = √40 = 2√10.",
      },
      {
        question: "Find the area of the sector of a circle with radius 7 cm and central angle 60°. (Use π = 22/7)",
        answer: "Area = (θ/360°) × πr² = (60/360) × (22/7) × 49 = (1/6) × 154 = 25.67 cm².",
        marks: 3, section: "Section C", type: "Short Answer",
        solution: "Area of sector = (θ/360°) × πr² = (60/360) × (22/7) × 7² = (1/6) × (22/7) × 49 = (1/6) × 154 = 77/3 ≈ 25.67 cm².",
      },
    ],
    sectionD: [
      {
        question: "A train travels 360 km at a uniform speed. If the speed had been 5 km/h more, it would have taken 1 hour less for the same journey. Find the speed of the train.",
        answer: "Let speed = x km/h. Time = 360/x. New time = 360/(x+5). 360/x - 360/(x+5) = 1. Solving: 360(x+5) - 360x = x(x+5). 1800 = x² + 5x. x² + 5x - 1800 = 0. x = (-5 + √(25+7200))/2 = (-5+85)/2 = 40. Speed = 40 km/h.",
        marks: 5, section: "Section D", type: "Long Answer",
        solution: "Let speed = x. 360/x - 360/(x+5) = 1. Multiply by x(x+5): 360(x+5) - 360x = x(x+5). 1800 = x² + 5x. x² + 5x - 1800 = 0. x = (-5 ± √(25+7200))/2 = (-5 ± 85)/2. x = 40 (positive). Speed = 40 km/h.",
      },
      {
        question: "Prove that if a line is drawn parallel to one side of a triangle to intersect the other two sides at distinct points, the other two sides are divided in the same ratio (Basic Proportionality Theorem / Thales' Theorem).",
        answer: "Given: △ABC with DE ∥ BC, D on AB, E on AC. To prove: AD/DB = AE/EC. Construction: Draw EM ⊥ AB, DN ⊥ AC. Join BE and CD. Proof: Area(△ADE)/Area(△BDE) = AD/DB (same height from E to AB). Area(△ADE)/Area(△CDE) = AE/EC (same height from D to AC). Since DE ∥ BC, Area(△BDE) = Area(△CDE) (same base DE, between same parallels). Therefore AD/DB = AE/EC.",
        marks: 5, section: "Section D", type: "Long Answer",
        solution: "In △ABC, DE ∥ BC. Triangles △BDE and △CDE stand on the same base DE and between the same parallels DE and BC, so they have equal areas. Now, △ADE and △BDE share the same altitude from E to AB, so Area(△ADE)/Area(△BDE) = AD/DB. Similarly, Area(△ADE)/Area(△CDE) = AE/EC. Since Area(△BDE) = Area(△CDE), we get AD/DB = AE/EC. Hence proved.",
      },
      {
        question: "A solid metallic sphere of radius 6 cm is melted and recast into a cylinder of radius 3 cm. Find the height of the cylinder and the ratio of the total surface area of the sphere to that of the cylinder.",
        answer: "Volume of sphere = (4/3)π(6)³ = 288π cm³. Volume of cylinder = π(3)²h = 9πh. So 9πh = 288π → h = 32 cm. Surface area of sphere = 4π(36) = 144π. Surface area of cylinder = 2π(3)(32) + 2π(9) = 192π + 18π = 210π. Ratio = 144π : 210π = 24:35.",
        marks: 5, section: "Section D", type: "Long Answer",
        solution: "Volume conservation: (4/3)πr³ = πR²h → (4/3)π(216) = π(9)h → h = 288/9 = 32 cm. Sphere SA = 4π(36) = 144π. Cylinder SA = 2πrh + 2πr² = 2π(3)(32) + 2π(9) = 192π + 18π = 210π. Ratio = 144:210 = 24:35.",
      },
    ],
    sectionE: [
      {
        question: "Case Study: A cricket player's scores in 5 consecutive matches are: 40, 50, 60, 50, 50.\n\n(i) Find the mean, median, and mode of the scores. (ii) Which measure of central tendency best represents the data? (iii) Find the range of the scores.",
        answer: "(i) Mean = (40+50+60+50+50)/5 = 250/5 = 50. Median (sorted: 40,50,50,50,60) = 50. Mode = 50. (ii) All three are equal (50), so any represents the data well. (iii) Range = 60 - 40 = 20.",
        marks: 4, section: "Section E", type: "Case-Study",
        solution: "Mean = 250/5 = 50. Median: sorted data = 40,50,50,50,60; middle value = 50. Mode = most frequent = 50. Since mean = median = mode, the data is symmetric. Range = max - min = 60 - 40 = 20.",
      },
      {
        question: "Case Study: Two poles of heights 6 m and 11 m stand on a plane ground. The distance between their feet is 12 m.\n\n(i) Find the distance between their tops. (ii) Find the angle of elevation of the top of the taller pole from the top of the shorter pole. (iii) If a wire connects the tops, what length of wire is needed?",
        answer: "(i) Height difference = 11 - 6 = 5 m. Distance between tops = √(12² + 5²) = √(144+25) = √169 = 13 m. (ii) tan θ = 5/12 → θ = tan⁻¹(5/12) ≈ 22.6°. (iii) Wire length = 13 m.",
        marks: 4, section: "Section E", type: "Case-Study",
        solution: "The tops form a right triangle with base 12 m (distance between feet) and height 5 m (difference in pole heights). Distance between tops = √(144+25) = 13 m. Angle: tan θ = 5/12, θ ≈ 22.6°. Wire length = 13 m.",
      },
      {
        question: "Case Study: A bag contains 5 red, 8 white, and 7 black balls. A ball is drawn at random.\n\n(i) Find the probability of drawing a red ball. (ii) Find the probability of drawing a white ball. (iii) Find the probability of drawing neither a red nor a white ball.",
        answer: "Total = 5+8+7 = 20 balls. (i) P(red) = 5/20 = 1/4. (ii) P(white) = 8/20 = 2/5. (iii) P(neither red nor white) = P(black) = 7/20.",
        marks: 4, section: "Section E", type: "Case-Study",
        solution: "Total balls = 20. P(red) = 5/20 = 1/4. P(white) = 8/20 = 2/5. P(neither red nor white) = P(black) = 7/20.",
      },
    ],
  },
  "Social Science": {
    sectionA: [
      {
        question: "Who was the first President of the Indian National Congress?",
        options: ["A) Womesh Chunder Bonnerjee", "B) Dadabhai Naoroji", "C) Allan Octavian Hume", "D) Surendranath Banerjee"],
        answer: "A) Womesh Chunder Bonnerjee",
        marks: 1, section: "Section A", type: "MCQ",
        solution: "W.C. Bonnerjee was the first President of the INC, presiding over its first session in Bombay in 1885.",
      },
      {
        question: "Assertion (A): The Non-Cooperation Movement was withdrawn in 1922.\nReason (R): The Chauri Chaura incident led Gandhi to call off the movement.",
        options: ["A) Both A and R are true and R is the correct explanation of A", "B) Both A and R are true but R is NOT the correct explanation of A", "C) A is true but R is false", "D) A is false but R is true"],
        answer: "A) Both A and R are true and R is the correct explanation of A",
        marks: 1, section: "Section A", type: "Assertion-Reason",
        solution: "The Non-Cooperation Movement (1920) was withdrawn by Gandhi in February 1922 after the violent Chauri Chaura incident where protesters set fire to a police station, killing 22 policemen. R explains A.",
      },
      {
        question: "Which type of resource is iron ore?",
        options: ["A) Renewable", "B) Biotic", "C) Non-renewable", "D) Ubiquitous"],
        answer: "C) Non-renewable",
        marks: 1, section: "Section A", type: "MCQ",
        solution: "Iron ore is a non-renewable resource because it cannot be replenished naturally in a short period of time.",
      },
      {
        question: "The Earth Summit held in Rio de Janeiro was in the year:",
        options: ["A) 1987", "B) 1992", "C) 1997", "D) 2002"],
        answer: "B) 1992",
        marks: 1, section: "Section A", type: "MCQ",
        solution: "The Earth Summit (UN Conference on Environment and Development) was held in Rio de Janeiro, Brazil, in 1992.",
      },
      {
        question: "Assertion (A): Power sharing is desirable in a democracy.\nReason (R): Power sharing helps to reduce the possibility of conflict between social groups.",
        options: ["A) Both A and R are true and R is the correct explanation of A", "B) Both A and R are true but R is NOT the correct explanation of A", "C) A is true but R is false", "D) A is false but R is true"],
        answer: "A) Both A and R are true and R is the correct explanation of A",
        marks: 1, section: "Section A", type: "Assertion-Reason",
        solution: "Power sharing is desirable because it reduces conflict between groups, ensures stability, and upholds the spirit of democracy. R explains A.",
      },
      {
        question: "Which of the following is an example of an economic activity?",
        options: ["A) A mother cooking for her family", "B) A father teaching his own child", "C) A teacher teaching in a school for salary", "D) A person cleaning their own house"],
        answer: "C) A teacher teaching in a school for salary",
        marks: 1, section: "Section A", type: "MCQ",
        solution: "Economic activities involve the production or exchange of goods/services for money. A teacher earning a salary is an economic activity.",
      },
      {
        question: "Globalisation refers to:",
        options: ["A) Integration of national economies with the world economy", "B) Isolation of domestic markets", "C) Reduction in international trade", "D) Increase in import duties"],
        answer: "A) Integration of national economies with the world economy",
        marks: 1, section: "Section A", type: "MCQ",
        solution: "Globalisation is the process of integration of national economies with the global economy through trade, investment, and technology flows.",
      },
      {
        question: "Which sector includes agriculture, forestry, and fishing?",
        options: ["A) Primary sector", "B) Secondary sector", "C) Tertiary sector", "D) Quaternary sector"],
        answer: "A) Primary sector",
        marks: 1, section: "Section A", type: "MCQ",
        solution: "The primary sector includes activities that use natural resources directly: agriculture, forestry, fishing, mining, etc.",
      },
    ],
    sectionB: [
      {
        question: "What was the main aim of the Simon Commission? Why was it opposed by Indians?",
        answer: "The Simon Commission (1928) was set up to review the constitutional progress in India. It was opposed because it had no Indian members.",
        marks: 2, section: "Section B", type: "Very Short Answer",
        solution: "The British government appointed the Simon Commission in 1928 to suggest constitutional reforms. Indians opposed it because all seven members were British, with no Indian representation, which was seen as an insult.",
      },
      {
        question: "Why is agriculture called the backbone of the Indian economy?",
        answer: "Agriculture employs the largest section of the population, provides food security, supplies raw materials to industries, and contributes significantly to GDP and exports.",
        marks: 2, section: "Section B", type: "Very Short Answer",
        solution: "Agriculture employs over 50% of the workforce, provides food for 1.4 billion people, supplies raw materials to agro-based industries, and contributes ~15-20% to GDP.",
      },
      {
        question: "What is meant by 'federalism'? Give one example from India.",
        answer: "Federalism is a system of government where power is divided between a central authority and constituent units. Example: India has a Union government and state governments with their own jurisdictions.",
        marks: 2, section: "Section B", type: "Very Short Answer",
        solution: "Federalism divides power between central and state governments. India has three levels: Union List, State List, and Concurrent List, each with defined powers.",
      },
      {
        question: "What is the difference between renewable and non-renewable resources? Give one example of each.",
        answer: "Renewable resources can be replenished naturally (e.g., solar energy). Non-renewable resources cannot be replenished once used (e.g., coal).",
        marks: 2, section: "Section B", type: "Very Short Answer",
        solution: "Renewable resources regenerate naturally (solar, wind, water). Non-renewable resources take millions of years to form and are finite (coal, petroleum, natural gas).",
      },
    ],
    sectionC: [
      {
        question: "Explain the three types of resource classification with examples.",
        answer: "1) Renewable: can be replenished (solar energy, water). 2) Non-renewable: cannot be replenished (coal, petroleum). 3) Biotic/Abiotic: Biotic has life (forests), Abiotic doesn't (rocks).",
        marks: 3, section: "Section C", type: "Short Answer",
        solution: "Resources are classified as: 1) Renewable (solar, wind, water — naturally replenished), 2) Non-renewable (coal, oil, minerals — finite, take millions of years), 3) Biotic (living — forests, animals) vs Abiotic (non-living — rocks, minerals).",
      },
      {
        question: "Describe any three features of the Indian federal system.",
        answer: "1) Two levels of government (Union and State). 2) Division of powers through three lists (Union, State, Concurrent). 3) Independent judiciary to interpret the constitution and resolve disputes.",
        marks: 3, section: "Section C", type: "Short Answer",
        solution: "Indian federalism features: 1) Dual government (Centre + States), 2) Written constitution with three legislative lists dividing powers, 3) Independent judiciary as the guardian of the constitution, 4) Supremacy of the constitution.",
      },
      {
        question: "Explain the role of MNCs (Multinational Corporations) in the process of globalisation.",
        answer: "MNCs set up production in countries with low costs, bringing capital, technology, and management expertise. They create global supply chains, increase foreign investment, and connect distant markets, accelerating globalisation.",
        marks: 3, section: "Section C", type: "Short Answer",
        solution: "MNCs drive globalisation by: 1) Investing in developing countries (FDI), 2) Spreading production across countries to reduce costs, 3) Creating interconnected global supply chains, 4) Transferring technology and skills.",
      },
      {
        question: "Why did the Non-Cooperation Movement start? Explain any three of its key features.",
        answer: "It started (1920) to protest the Rowlatt Act, Jallianwala Bagh massacre, and Khilafat issue. Features: 1) Boycott of British schools, courts, and titles. 2) Surrender of government posts. 3) Promotion of swadeshi goods and khadi.",
        marks: 3, section: "Section C", type: "Short Answer",
        solution: "Causes: Rowlatt Act (1919), Jallianwala Bagh massacre, Khilafat wrong. Features: 1) Boycott of British institutions (schools, courts, legislatures), 2) Renunciation of British titles, 3) Promotion of khadi and swadeshi, 4) Non-violent resistance.",
      },
    ],
    sectionD: [
      {
        question: "Explain the causes of the rise of nationalism in India, with reference to the role of the freedom movement.",
        answer: "1) Economic exploitation: British policies ruined Indian artisans and peasants, creating widespread resentment. 2) Western education: Exposed Indians to ideas of liberty, equality, and democracy, inspiring nationalist thought. 3) The Indian National Congress (1885): Provided a national platform for political dialogue. 4) Movements like Non-Cooperation (1920), Civil Disobedience (1930), and Quit India (1942) united people across regions and classes. 5) The press and literature spread nationalist ideas. 6) The Rowlatt Act, Jallianwala Bagh, and Khilafat issues galvanised mass participation.",
        marks: 5, section: "Section D", type: "Long Answer",
        solution: "Causes: 1) British economic exploitation (land revenue, deindustrialisation), 2) Western education creating a new middle class, 3) Socio-religious reform movements (Brahmo Samaj, Arya Samaj), 4) INC providing national leadership, 5) Anti-Rowlatt, Jallianwala Bagh, Khilafat movements, 6) Role of press (Kesari, Hind Swaraj), 7) Gandhi's mass mobilisation through Satyagraha.",
      },
      {
        question: "Describe the different types of farming practised in India. Explain any two in detail.",
        answer: "Types: 1) Primitive subsistence farming (shifting cultivation, small plots, tools like hoe/dao). 2) Intensive subsistence farming (high labour, small holdings, high yield per acre, e.g., rice paddies). 3) Commercial farming (plantation agriculture, cash crops like tea, coffee, rubber, sugarcane, high capital and technology).",
        marks: 5, section: "Section D", type: "Long Answer",
        solution: "1) Primitive subsistence: practised on small patches with primitive tools, depends on monsoon, e.g., shifting cultivation in NE India. 2) Intensive subsistence: high labour input per hectare, multiple cropping, common in densely populated areas (UP, Bihar). 3) Commercial/plantation: single crop, large estates, capital-intensive, e.g., tea in Assam, coffee in Karnataka.",
      },
      {
        question: "Explain the role of the tertiary sector in the Indian economy. Why is it the largest sector today?",
        answer: "The tertiary sector (services) includes trade, transport, communication, banking, education, health, tourism, IT. It is the largest because: 1) Basic services (health, education) are in demand. 2) Development of agriculture and industry creates demand for services. 3) Rising income leads to more services (tourism, restaurants). 4) IT and IT-enabled services have boomed. 5) Outsourcing has made India a global service hub. However, it employs fewer people than its GDP share, indicating disguised unemployment in agriculture.",
        marks: 5, section: "Section D", type: "Long Answer",
        solution: "The tertiary sector contributes ~55% of GDP. Reasons: 1) Development of primary/secondary sectors requires transport, trade, banking. 2) Growing population needs more health, education, communication. 3) IT-BPO sector has grown rapidly, exporting services globally. 4) Rising incomes boost personal services. 5) However, it employs only ~28% of workforce, less than its GDP share.",
      },
    ],
    sectionE: [
      {
        question: "Case Study: The Jallianwala Bagh massacre took place on April 13, 1919, when General Dyer ordered troops to fire on an unarmed crowd gathered at Jallianwala Bagh, Amritsar.\n\n(i) Why had the crowd gathered at Jallianwala Bagh? (ii) What was the immediate cause of the gathering? (iii) How did this event impact the Indian freedom struggle?",
        answer: "(i) The crowd gathered for the Baisakhi fair and to protest the Rowlatt Act. (ii) People were unaware of the martial law imposed in Amritsar. (iii) It led to nationwide outrage, withdrawal of titles by Indians, and Gandhi launching the Non-Cooperation Movement.",
        marks: 4, section: "Section E", type: "Case-Study",
        solution: "(i) People gathered for the annual Baisakhi fair and to peacefully protest the Rowlatt Act. (ii) Many were from outside Amritsar and didn't know martial law had been declared. (iii) The massacre caused shock and anger nationwide. Rabindranath Tagore renounced his knighthood. Gandhi launched the Non-Cooperation Movement in 1920. It marked a turning point in the freedom struggle.",
      },
      {
        question: "Case Study: Water is a critical resource, but its distribution is highly uneven across India. Some regions face floods while others face droughts.\n\n(i) What is water scarcity? (ii) Name two regions in India that face severe water scarcity. (iii) Suggest two measures to conserve water.",
        answer: "(i) Water scarcity is the lack of sufficient fresh water to meet water demands. (ii) Rajasthan and parts of Maharashtra face severe water scarcity. (iii) Rainwater harvesting and drip irrigation.",
        marks: 4, section: "Section E", type: "Case-Study",
        solution: "(i) Water scarcity occurs when demand exceeds available supply. (ii) Rajasthan, Marathwada (Maharashtra), and Bundelkhand face chronic scarcity. (iii) Measures: rainwater harvesting, drip irrigation, watershed management, recycling wastewater, afforestation.",
      },
      {
        question: "Case Study: The Reserve Bank of India (RBI) issues currency notes on behalf of the central government. The RBI regulates the money supply and credit in the economy.\n\n(i) Who issues currency notes in India? (ii) What is the role of credit in development? (iii) Why do banks ask for collateral while giving loans?",
        answer: "(i) The Reserve Bank of India (RBI) issues currency notes. (ii) Credit helps farmers, businesses, and industries to invest and produce, leading to development. (iii) Collateral serves as a guarantee that the bank can sell to recover the loan amount if the borrower defaults.",
        marks: 4, section: "Section E", type: "Case-Study",
        solution: "(i) RBI is the sole authority to issue currency in India. (ii) Credit enables investment in agriculture, trade, and industry, creating employment and output. However, excessive debt can lead to debt traps. (iii) Collateral (land, gold, property) acts as security — if the borrower defaults, the bank can sell it to recover the loan.",
      },
    ],
  },
  English: {
    sectionA: [
      {
        question: "Read the extract and answer: \"He didn't know what to do. He couldn't walk, he couldn't talk. He just stood there.\" The word 'stood' here suggests:\n\nA) Confidence\nB) Helplessness\nC) Anger\nD) Joy",
        options: ["A) Confidence", "B) Helplessness", "C) Anger", "D) Joy"],
        answer: "B) Helplessness",
        marks: 1, section: "Section A", type: "MCQ",
        solution: "The character 'didn't know what to do' and 'couldn't walk, couldn't talk' — these indicate inability and helplessness. Standing still reflects inaction due to confusion.",
      },
      {
        question: "Choose the correct synonym for 'diligent':\nA) Lazy\nB) Hardworking\nC) Careless\nD) Slow",
        options: ["A) Lazy", "B) Hardworking", "C) Careless", "D) Slow"],
        answer: "B) Hardworking",
        marks: 1, section: "Section A", type: "MCQ",
        solution: "'Diligent' means showing care and conscientious effort in one's work or duties, i.e., hardworking.",
      },
      {
        question: "Identify the figure of speech: 'The wind whispered through the trees.'\nA) Simile\nB) Metaphor\nC) Personification\nD) Alliteration",
        options: ["A) Simile", "B) Metaphor", "C) Personification", "D) Alliteration"],
        answer: "C) Personification",
        marks: 1, section: "Section A", type: "MCQ",
        solution: "Personification gives human qualities (whispering) to non-human things (wind).",
      },
      {
        question: "Choose the correct passive voice: 'She wrote a letter.'\nA) A letter was written by her\nB) A letter is written by her\nC) A letter has been written by her\nD) A letter was being written by her",
        options: ["A) A letter was written by her", "B) A letter is written by her", "C) A letter has been written by her", "D) A letter was being written by her"],
        answer: "A) A letter was written by her",
        marks: 1, section: "Section A", type: "MCQ",
        solution: "Simple past ('wrote') → passive: was/were + past participle. 'She wrote a letter' → 'A letter was written by her.'",
      },
      {
        question: "Assertion (A): Reading comprehension involves understanding both explicit and implicit meanings.\nReason (R): Inference requires the reader to go beyond the literal text.",
        options: ["A) Both A and R are true and R is the correct explanation of A", "B) Both A and R are true but R is NOT the correct explanation of A", "C) A is true but R is false", "D) A is false but R is true"],
        answer: "A) Both A and R are true and R is the correct explanation of A",
        marks: 1, section: "Section A", type: "Assertion-Reason",
        solution: "Reading comprehension includes both literal understanding (explicit) and inference (implicit). R explains why A is true — inference is the skill of going beyond literal text.",
      },
      {
        question: "Fill in the blank: 'Neither the teacher nor the students ___ present.'\nA) was\nB) were\nC) is\nD) has",
        options: ["A) was", "B) were", "C) is", "D) has"],
        answer: "B) were",
        marks: 1, section: "Section A", type: "MCQ",
        solution: "With 'neither...nor', the verb agrees with the nearer subject. 'Students' (plural) is nearer, so 'were' is correct.",
      },
      {
        question: "What is the antonym of 'generous'?\nA) Kind\nB) Stingy\nC) Helpful\nD) Friendly",
        options: ["A) Kind", "B) Stingy", "C) Helpful", "D) Friendly"],
        answer: "B) Stingy",
        marks: 1, section: "Section A", type: "MCQ",
        solution: "'Generous' means willing to give; the opposite is 'stingy' — reluctant to give or share.",
      },
      {
        question: "Choose the correct indirect speech: He said, 'I am happy.'\nA) He said that I am happy\nB) He said that he is happy\nC) He said that he was happy\nD) He told that he was happy",
        options: ["A) He said that I am happy", "B) He said that he is happy", "C) He said that he was happy", "D) He told that he was happy"],
        answer: "C) He said that he was happy",
        marks: 1, section: "Section A", type: "MCQ",
        solution: "In indirect speech, present tense changes to past. 'I am happy' → 'he was happy'. 'Said' takes 'that'.",
      },
    ],
    sectionB: [
      {
        question: "Read the lines: 'The fog comes on little cat feet.' What figure of speech is used? Explain its effect.",
        answer: "The poet uses a metaphor/personification comparing fog to a cat. It creates a quiet, stealthy image of the fog arriving silently and gently.",
        marks: 2, section: "Section B", type: "Very Short Answer",
        solution: "Carl Sandburg uses an extended metaphor comparing fog to a cat that comes silently and sits looking over the city. This personification makes the fog feel alive, quiet, and mysterious.",
      },
      {
        question: "What message does the poem 'Fire and Ice' by Robert Frost convey?",
        answer: "The poem conveys that the world could end either in fire (desire/passion) or ice (hatred/coldness). Both emotions are equally destructive.",
        marks: 2, section: "Section B", type: "Very Short Answer",
        solution: "Frost uses fire as a metaphor for desire/passion and ice for hatred/coldness. He suggests that both uncontrolled desire and cold hatred can destroy the world, and that hatred is equally sufficient for destruction.",
      },
      {
        question: "Why did Lencho write a letter to God? What did he ask for?",
        answer: "Lencho wrote to God because his corn crop was destroyed by hail. He asked for 100 pesos to sow the field again and survive until the next harvest.",
        marks: 2, section: "Section B", type: "Very Short Answer",
        solution: "In 'A Letter to God', Lencho's entire crop was destroyed by a hailstorm. He had immense faith in God and wrote a letter asking for 100 pesos to support his family and replant his field.",
      },
      {
        question: "Change the following to passive voice: 'The mechanic is repairing my car.'",
        answer: "My car is being repaired by the mechanic.",
        marks: 2, section: "Section B", type: "Very Short Answer",
        solution: "Present continuous ('is repairing') → passive: is/are being + past participle. 'The mechanic is repairing my car' → 'My car is being repaired by the mechanic.'",
      },
    ],
    sectionC: [
      {
        question: "Describe the character of Anne Frank as revealed in her diary entries. What kind of person was she?",
        answer: "Anne Frank was intelligent, observant, witty, and sensitive. She was a deep thinker who questioned the world around her. She was also lonely, seeking a true friend in her diary (Kitty). She showed remarkable maturity and optimism despite the horrors of hiding during the Holocaust.",
        marks: 3, section: "Section C", type: "Short Answer",
        solution: "Anne was a lively, intelligent girl who loved writing. She was perceptive and critical of adults, yet showed warmth and humour. Her diary reveals her as thoughtful, resilient, and hopeful even in the face of war and persecution. She longed for freedom and a true friend she could confide in.",
      },
      {
        question: "How does the poem 'Dust of Snow' by Robert Frost convey the idea that small things in nature can have a big impact?",
        answer: "A crow shaking down a dust of snow from a hemlock tree changes the poet's mood from regret to joy. This small event shows how nature can transform our outlook and save a ruined day.",
        marks: 3, section: "Section C", type: "Short Answer",
        solution: "Frost shows that a seemingly insignificant moment — a crow shaking snow off a hemlock tree onto the poet — lifts his spirits and changes his mood entirely. The poem conveys that nature, even in its smallest manifestations, has the power to heal and transform our emotional state.",
      },
      {
        question: "Write a paragraph (80-100 words) on the importance of discipline in student life.",
        answer: "Discipline is the foundation of a successful student life. It helps students manage time, stay focused, and achieve their goals. A disciplined student attends classes regularly, completes assignments on time, and maintains a balance between studies and extracurricular activities. Discipline also builds character, teaching responsibility and self-control. Without it, even the most talented students may fail to reach their potential. It creates a structured routine that reduces stress and increases productivity. In essence, discipline is the bridge between goals and accomplishment, making it essential for every student's growth and success.",
        marks: 3, section: "Section C", type: "Short Answer",
        solution: "The paragraph should cover: time management, focus, character building, responsibility, balance, and the connection between discipline and success. A well-structured paragraph with a clear topic sentence, supporting details, and a concluding statement.",
      },
      {
        question: "Explain the theme of courage in the chapter 'Nelson Mandela: Long Walk to Freedom'.",
        answer: "The chapter highlights Mandela's courage in fighting apartheid despite 27 years of imprisonment. It also speaks of the courage of ordinary South Africans who endured oppression. Mandela's vision of a rainbow nation free from discrimination shows moral courage.",
        marks: 3, section: "Section C", type: "Short Answer",
        solution: "Mandela's courage is shown through his unwavering commitment to justice despite decades of imprisonment. The chapter also honours the collective courage of South Africans who protested, faced violence, and never gave up. Mandela's ability to forgive his oppressors and build a democratic nation shows the highest form of moral courage.",
      },
    ],
    sectionD: [
      {
        question: "Compare and contrast the characters of the two pilots in 'Two Stories About Flying' (The Black Aeroplane and His First Flight). How do they overcome their fears?",
        answer: "In 'His First Flight', the young seagull overcomes his fear of flying through hunger and parental encouragement, eventually taking the plunge and discovering his natural ability. In 'The Black Aeroplane', the narrator pilot faces a dangerous storm and is guided by a mysterious black aeroplane to safety. The seagull's fear is overcome by necessity and instinct, while the narrator's fear is overcome by trust in an unknown rescuer. Both stories show that courage is needed to face the unknown, and that help often comes when we need it most. The seagull learns self-reliance, while the narrator learns faith in others.",
        marks: 5, section: "Section D", type: "Long Answer",
        solution: "The young seagull in 'His First Flight' overcomes fear through hunger and his mother's bait, learning to trust his wings. The narrator in 'The Black Aeroplane' faces a life-threatening storm and is guided to safety by a mysterious pilot. The seagull's journey is one of self-discovery and instinct; the narrator's is one of faith in the unknown. Both show that overcoming fear requires courage, and that the unknown, while frightening, can lead to growth and safety.",
      },
      {
        question: "Write an essay (200-250 words) on the topic: 'The Impact of Technology on Education'.",
        answer: "Technology has transformed education in unprecedented ways. The traditional classroom, once limited to textbooks and blackboards, now includes smart boards, online resources, and virtual learning platforms. Students can access information instantly, collaborate with peers globally, and learn at their own pace through video lectures and interactive modules. However, technology also presents challenges. Excessive screen time can affect health, and the digital divide means not all students have equal access. Over-reliance on technology may reduce critical thinking and face-to-face communication skills. Despite these challenges, the benefits outweigh the drawbacks when technology is used judiciously. It democratizes education, making quality learning resources available to remote areas. During the COVID-19 pandemic, technology proved essential by keeping education alive through online classes. The future of education lies in a blended approach — combining the best of traditional teaching with digital tools. Teachers remain irreplaceable as guides and mentors, but technology empowers them with better resources and data-driven insights. In conclusion, technology is a powerful ally in education, but it must be used thoughtfully to enhance, not replace, the human element of teaching and learning.",
        marks: 5, section: "Section D", type: "Long Answer",
        solution: "A good essay should include: introduction (technology's role in education), benefits (access, collaboration, personalization, pandemic example), challenges (health, digital divide, over-reliance), balanced approach (blended learning), and conclusion (technology as an ally, not a replacement for teachers). The essay should be well-structured with clear paragraphs.",
      },
      {
        question: "Analyse the poem 'The Ball Poem' by John Berryman. What is the deeper meaning of the boy losing his ball? Explain the theme of loss and responsibility.",
        answer: "In 'The Ball Poem', the loss of a ball represents the universal experience of losing something precious and irreplaceable. The poet uses this simple incident to teach a profound lesson about loss, responsibility, and growing up. The boy is not to be given another ball or money, because the lost ball represents the first real loss of his life — a loss that cannot be replaced. The poem shows that material things are transient, and that true maturity comes from accepting loss without being broken by it. The boy learns the epistemology of loss — that losing is part of life, and one must bear it with dignity. The poem transitions from a simple childhood incident to a philosophical meditation on impermanence, responsibility, and the inevitability of loss in the human experience.",
        marks: 5, section: "Section D", type: "Long Answer",
        solution: "Berryman uses the ball as a metaphor for all that we lose in life. The poem's central theme is the 'epistemology of loss' — learning to accept that loss is inevitable and irreplaceable. The poet argues against consoling the boy with a new ball, because the lesson is in experiencing the loss itself. The poem moves from the literal (a lost ball) to the philosophical (accepting life's losses), teaching that responsibility and resilience are essential aspects of growing up.",
      },
    ],
    sectionE: [
      {
        question: "Read the passage and answer:\n\nClimate change is one of the most pressing challenges of our time. Rising global temperatures, caused by greenhouse gas emissions, are leading to more frequent extreme weather events, rising sea levels, and disruptions to ecosystems. While governments play a crucial role in policy-making, individual actions also matter. Simple steps like reducing energy consumption, using public transport, and planting trees can collectively make a significant impact. Education and awareness are key to mobilising communities.\n\n(i) What are the main causes of climate change mentioned in the passage? (ii) List two effects of climate change. (iii) Suggest two individual actions mentioned to combat climate change.",
        answer: "(i) Greenhouse gas emissions are the main cause. (ii) Two effects: extreme weather events and rising sea levels. (iii) Two individual actions: reducing energy consumption and using public transport (also planting trees).",
        marks: 4, section: "Section E", type: "Case-Study",
        solution: "(i) Greenhouse gas emissions from human activities cause rising temperatures. (ii) Effects include extreme weather, rising sea levels, and ecosystem disruption. (iii) Individual actions: reduce energy use, use public transport, plant trees. Education and awareness are also highlighted as key strategies.",
      },
      {
        question: "Read the passage and answer:\n\nThe Right to Education (RTE) Act, passed in 2009, made education a fundamental right for every child between the ages of 6 and 14 in India. The act mandates free and compulsory education, prohibits discrimination, and requires schools to maintain certain infrastructure and teacher quality standards. While enrolment has increased significantly, challenges remain in terms of quality, dropout rates, and unequal access in rural areas.\n\n(i) What does the RTE Act guarantee? (ii) Name two provisions of the act. (iii) Mention two challenges in implementing the RTE Act.",
        answer: "(i) The RTE Act guarantees free and compulsory education for children aged 6-14. (ii) Two provisions: free education and prohibition of discrimination. (iii) Two challenges: quality of education and high dropout rates (also unequal rural access).",
        marks: 4, section: "Section E", type: "Case-Study",
        solution: "(i) RTE makes education a fundamental right for children 6-14. (ii) Provisions: free and compulsory education, no discrimination, infrastructure and teacher quality standards. (iii) Challenges: quality concerns, dropout rates, and unequal access in rural/remote areas.",
      },
      {
        question: "Read the passage and answer:\n\nSocial media has revolutionised communication but has also created new challenges. While it connects people across the globe and provides platforms for expression, it has been linked to mental health issues, cyberbullying, and the spread of misinformation. Studies show that excessive use can lead to anxiety, depression, and sleep disorders, particularly among teenagers. Responsible use, digital literacy, and parental guidance are essential to mitigate these risks.\n\n(i) What are two benefits of social media mentioned? (ii) Name two negative effects. (iii) Suggest two measures to mitigate the risks of social media.",
        answer: "(i) Two benefits: connecting people globally and providing platforms for expression. (ii) Two negative effects: mental health issues and cyberbullying (also misinformation). (iii) Two measures: responsible use and digital literacy (also parental guidance).",
        marks: 4, section: "Section E", type: "Case-Study",
        solution: "(i) Benefits: global connectivity and platforms for self-expression. (ii) Negative effects: anxiety/depression, cyberbullying, misinformation, sleep disorders. (iii) Mitigation: responsible use, digital literacy education, parental guidance, and setting screen-time limits.",
      },
    ],
  },
  Hindi: {
    sectionA: [
      {
        question: "'आत्मकथ्य' कविता के रचयिता हैं:\nA) जयशंकर प्रसाद\nB) सूर्यकांत त्रिपाठी निराला\nC) नागार्जुन\nD) गिरिजाकुमार माथुर",
        options: ["A) जयशंकर प्रसाद", "B) सूर्यकांत त्रिपाठी निराला", "C) नागार्जुन", "D) गिरिजाकुमार माथुर"],
        answer: "A) जयशंकर प्रसाद",
        marks: 1, section: "Section A", type: "MCQ",
        solution: "'आत्मकथ्य' कविता जयशंकर प्रसाद द्वारा रचित है, जो छायावादी काव्यधारा के प्रमुख कवि हैं।",
      },
      {
        question: "Assertion (A): निराला जी को 'महाप्राण' नाम दिया गया।\nReason (R): उनकी कविताओं में प्राणों का स्पंदन झलकता है।",
        options: ["A) Both A and R are true and R is the correct explanation of A", "B) Both A and R are true but R is NOT the correct explanation of A", "C) A is true but R is false", "D) A is false but R is true"],
        answer: "B) Both A and R are true but R is NOT the correct explanation of A",
        marks: 1, section: "Section A", type: "Assertion-Reason",
        solution: "निराला जी को 'महाप्राण' कहा जाता है और उनकी कविताओं में प्राणों का स्पंदन है, परंतु R, A की व्याख्या नहीं करता — यह नाम उनके व्यक्तित्व और काव्य-शैली के कारण पड़ा।",
      },
      {
        question: "'कन्यादान' कविता किसने लिखी?\nA) ऋतुराज\nB) राजेंद्र अवस्थी\nC) नरेंद्र कोहली\nD) धर्मवीर भारती",
        options: ["A) ऋतुराज", "B) राजेंद्र अवस्थी", "C) नरेंद्र कोहली", "D) धर्मवीर भारती"],
        answer: "A) ऋतुराज",
        marks: 1, section: "Section A", type: "MCQ",
        solution: "'कन्यादान' कविता ऋतुराज द्वारा रचित है, जो स्त्री-शिक्षा और सामाजिक चेतना का संदेश देती है।",
      },
      {
        question: "'बालगोबिन भगत' पाठ के लेखक हैं:\nA) स्वयं प्रकाश\nB) यशपाल\nC) मन्नू भंडारी\nD) भदंत आनंद कौसल्यायन",
        options: ["A) स्वयं प्रकाश", "B) यशपाल", "C) मन्नू भंडारी", "D) भदंत आनंद कौसल्यायन"],
        answer: "A) स्वयं प्रकाश",
        marks: 1, section: "Section A", type: "MCQ",
        solution: "'बालगोबिन भगत' पाठ स्वयं प्रकाश द्वारा रचित है, जो एक संत-व्यक्तित्व के जीवन को दर्शाता है।",
      },
      {
        question: "Assertion (A): 'कर चले हम फ़िदा' एक देशभक्ति गीत है।\nReason (R): इसमें देश के लिए अपना जीवन न्योछावर करने का भाव है।",
        options: ["A) Both A and R are true and R is the correct explanation of A", "B) Both A and R are true but R is NOT the correct explanation of A", "C) A is true but R is false", "D) A is false but R is true"],
        answer: "A) Both A and R are true and R is the correct explanation of A",
        marks: 1, section: "Section A", type: "Assertion-Reason",
        solution: "धर्मवीर भारती की कविता 'कर चले हम फ़िदा' देशभक्ति का गीत है, जिसमें सैनिक देश के लिए अपना जीवन न्योछावर करने का संकल्प व्यक्त करता है। R, A की व्याख्या करता है।",
      },
      {
        question: "'यह दंतुरहित मुस्कान' कविता के रचयिता हैं:\nA) नागार्जुन\nB) सूरदास\nC) तुलसीदास\nD) देव",
        options: ["A) नागार्जुन", "B) सूरदास", "C) तुलसीदास", "D) देव"],
        answer: "A) नागार्जुन",
        marks: 1, section: "Section A", type: "MCQ",
        solution: "'यह दंतुरहित मुस्कान' कविता नागार्जुन द्वारा रचित है, जो बच्चों की मुस्कान का सुंदर वर्णन करती है।",
      },
      {
        question: "निम्नलिखित में से कौन-सा शब्द 'विद्यालय' का पर्यायवाची नहीं है?\nA) पाठशाला\nB) गुरुकुल\nC) उद्यान\nD) विद्यामंदिर",
        options: ["A) पाठशाला", "B) गुरुकुल", "C) उद्यान", "D) विद्यामंदिर"],
        answer: "C) उद्यान",
        marks: 1, section: "Section A", type: "MCQ",
        solution: "'उद्यान' का अर्थ बगीचा है, जो विद्यालय का पर्यायवाची नहीं है। पाठशाला, गुरुकुल, विद्यामंदिर — ये सभी विद्यालय के पर्यायवाची हैं।",
      },
      {
        question: "'छाया हरे शब्दों का' कविता के रचयिता हैं:\nA) गिरिजाकुमार माथुर\nB) सूर्यकांत त्रिपाठी निराला\nC) नागार्जुन\nD) ऋतुराज",
        options: ["A) गिरिजाकुमार माथुर", "B) सूर्यकांत त्रिपाठी निराला", "C) नागार्जुन", "D) ऋतुराज"],
        answer: "A) गिरिजाकुमार माथुर",
        marks: 1, section: "Section A", type: "MCQ",
        solution: "'छाया हरे शब्दों का' कविता गिरिजाकुमार माथुर द्वारा रचित है, जो शब्दों के महत्व और उनके प्रभाव को दर्शाती है।",
      },
    ],
    sectionB: [
      {
        question: "'स्त्री शिक्षा' निबंध में महावीर प्रसाद द्विवेदी का मुख्य तर्क क्या है?",
        answer: "द्विवेदी जी तर्क देते हैं कि स्त्री-शिक्षा आवश्यक है क्योंकि स्त्रियाँ पुरुषों के समान ही बुद्धिमान और सक्षम हैं। शिक्षित स्त्रियाँ समाज और परिवार दोनों का उत्थान करती हैं।",
        marks: 2, section: "Section B", type: "Very Short Answer",
        solution: "महावीर प्रसाद द्विवेदी का तर्क है कि स्त्री-शिक्षा समाज के उत्थान के लिए आवश्यक है। वे पौरुष-गर्व और रूढ़िवादी तर्कों का खंडन करते हुए दर्शाते हैं कि स्त्रियाँ भी बुद्धि और क्षमता में पुरुषों से कम नहीं हैं।",
      },
      {
        question: "'नेताजी का चश्मा' कहानी में नेताजी के चश्मे का क्या महत्व है?",
        answer: "नेताजी का चश्मा एक प्रतीक है — यह नेताजी के व्यक्तित्व, उनकी दूरदर्शिता और उनके प्रति लोगों के सम्मान का प्रतिनिधित्व करता है।",
        marks: 2, section: "Section B", type: "Very Short Answer",
        solution: "सुमित्रानंदन पंत की इस कहानी में चश्मा नेताजी सुभाष चंद्र बोस के व्यक्तित्व का प्रतीक है। यह उनकी दूरदृष्टि, नेतृत्व और जन-सम्मान को दर्शाता है।",
      },
      {
        question: "'लखनवी रसूल' पाठ में लखनवी तहज़ीब की क्या विशेषता बताई गई है?",
        answer: "लखनवी तहज़ीब में विनम्रता, शिष्टाचार, और जीवन के प्रति नरमी और संस्कार की झलक मिलती है। लखनवी लोग बातचीत में मिठास और शालीनता रखते हैं।",
        marks: 2, section: "Section B", type: "Very Short Answer",
        solution: "यशपाल के 'लखनवी रसूल' में लखनवी तहज़ीब की विशेषताएँ — विनम्रता, शालीनता, मिठास, और जीवन के प्रति संवेदनशील दृष्टि — का सुंदर वर्णन है।",
      },
      {
        question: "'एहसास' कविता में कवि क्या भाव व्यक्त करते हैं?",
        answer: "जाबिर हुसैन की 'एहसास' कविता में मानवीय संवेदनाओं, रिश्तों के गहरे एहसास और जीवन के सूक्ष्म अनुभवों का वर्णन है।",
        marks: 2, section: "Section B", type: "Very Short Answer",
        solution: "कवि जाबिर हुसैन 'एहसास' कविता में जीवन के सूक्ष्म अनुभवों, मानवीय संवेदनाओं और रिश्तों की गहराई को व्यक्त करते हैं।",
      },
    ],
    sectionC: [
      {
        question: "'कन्यादान' कविता में ऋतुराज ने स्त्री-शिक्षा के प्रति कैसा दृष्टिकोण प्रस्तुत किया है? स्पष्ट करें।",
        answer: "ऋतुराज 'कन्यादान' में स्त्री-शिक्षा का प्रबल पक्षधर हैं। वे तर्क देते हैं कि बिना शिक्षा के कन्या-दान अधूरा है। शिक्षा से सशक्त स्त्री ही समाज का वास्तविक उत्थान कर सकती है। कवि रूढ़िवादियों का खंडन करते हैं और कहते हैं कि ज्ञान-दान ही सबसे बड़ा दान है।",
        marks: 3, section: "Section C", type: "Short Answer",
        solution: "ऋतुराज का दृष्टिकोण है कि कन्यादान के साथ ज्ञान-दान भी आवश्यक है। बिना शिक्षा के कन्या केवल एक बोझ बन जाती है। शिक्षित स्त्री स्वतंत्र और सशक्त बनती है, जो परिवार और समाज दोनों को आगे बढ़ाती है। कवि रूढ़िवादी विचारों का विरोध करते हैं।",
      },
      {
        question: "'बालगोबिन भगत' पाठ में बालगोबिन भगत के चरित्र की विशेषताओं का वर्णन करें।",
        answer: "बालगोबिन भगत एक साधारण जीवन जीने वाले संत-व्यक्ति थे। वे दयालु, निस्वार्थ, और लोगों के प्रति प्रेमशील थे। वे धन-संपदा से दूर रहते थे और सबकी मदद करते थे। उनका जीवन सरलता और त्याग का प्रतीक था।",
        marks: 3, section: "Section C", type: "Short Answer",
        solution: "बालगोबिन भगत की मुख्य विशेषताएँ: 1) सरल और त्यागपूर्ण जीवन, 2) निस्वार्थ सेवा-भाव, 3) दयालुता और प्रेम, 4) धन-मोह से मुक्ति, 5) सबके प्रति समान व्यवहार। वे एक आदर्श संत-व्यक्तित्व थे।",
      },
      {
        question: "'स्त्री शिक्षा के विरोधी कुतर्कों का खंडन' पाठ में सर्वेश्वर दयाल सक्सेना ने किन कुतर्कों का खंडन किया है?",
        answer: "सक्सेना जी ने स्त्री-शिक्षा के विरोधियों के तर्कों जैसे — स्त्रियाँ अबला हैं, शिक्षा से उनका चरित्र बिगड़ेगा, घर-गृहस्थी छोड़ देंगी — का तार्किक खंडन किया है।",
        marks: 3, section: "Section C", type: "Short Answer",
        solution: "सर्वेश्वर दयाल सक्सेना ने इन कुतर्कों का खंडन किया: 1) स्त्रियाँ बुद्धि में कमज़ोर हैं — गलत, 2) शिक्षा से स्त्रियाँ चरित्रहीन होंगी — निराधार, 3) घर-गृहस्थी छोड़ देंगी — अतिशयोक्ति। वे तर्क देते हैं कि शिक्षित स्त्री ही श्रेष्ठ गृहणी बनती है।",
      },
      {
        question: "'एक कहानी यह भी' पाठ में मन्नू भंडारी ने स्त्री-पुरुष संबंधों को कैसे दर्शाया है?",
        answer: "मन्नू भंडारी ने इस पाठ में स्त्री-पुरुष संबंधों की जटिलता, संवेदनाओं और सामाजिक दबावों को यथार्थवादी ढंग से दर्शाया है। उन्होंने दिखाया कि कैसे व्यक्तिगत चुनौतियाँ और सामाजिक अपेक्षाएँ रिश्तों को प्रभावित करती हैं।",
        marks: 3, section: "Section C", type: "Short Answer",
        solution: "मन्नू भंडारी ने स्त्री-पुरुष संबंधों में व्यक्तिगत संघर्ष, सामाजिक दबाव, और भावनात्मक जटिलता को दर्शाया है। उनकी कहानी में नारी की स्वतंत्र अस्मिता और रिश्तों की नाजुकी का संतुलन सुंदर है।",
      },
    ],
    sectionD: [
      {
        question: "'कर चले हम फ़िदा' कविता का विस्तार से भावार्थ स्पष्ट करें। इसमें देशभक्ति का चित्रण किस प्रकार हुआ है?",
        answer: "धर्मवीर भारती की 'कर चले हम फ़िदा' एक देशभक्ति का गीत है। इसमें सैनिक देश की रक्षा के लिए अपना जीवन न्योछावर करने का संकल्प व्यक्त करता है। कवि कहता है कि देश की आन के लिए मरना पवित्र कर्तव्य है। यह कविता राष्ट्र-प्रेम, त्याग, और वीरता का संदेश देती है। सैनिक कहता है — 'जान दे देंगे तेरे नाम पर' — यह वीर-रस का उत्कर्ष है। कविता में देशमाता के प्रति समर्पण और उसकी रक्षा का दायित्व झलकता है।",
        marks: 5, section: "Section D", type: "Long Answer",
        solution: "भावार्थ: सैनिक देश की रक्षा हेतु अपना जीवन न्योछावर करने को तैयार है। देशभक्ति का सर्वोच्च रूप — जीवन-दान — इस कविता का केंद्र है। धर्मवीर भारती ने वीर-रस और राष्ट्रीय चेतना का सुंदर संगम प्रस्तुत किया है। सैनिक का त्याग, संकल्प, और देश-प्रेम इस कविता की आत्मा हैं।",
      },
      {
        question: "'संस्कृति' निबंध में भदंत आनंद कौसल्यायन ने संस्कृति को किस रूप में परिभाषित किया है? विस्तार से बताएँ।",
        answer: "कौसल्यायन जी के अनुसार संस्कृति का अर्थ केवल रहन-सहन या आचार-विचार नहीं है। संस्कृति वह विद्या है जो मनुष्य को सभ्य, संवेदनशील और विवेकशील बनाती है। वे तर्क देते हैं कि संस्कृति भोजन, वस्त्र, भाषा, और आचारों में नहीं, बल्कि विचारों और दृष्टिकोण में निहित है। जो समाज जितना अधिक संवेदनशील और विवेकशील होता है, वह उतना ही अधिक सुसंस्कृत है। संस्कृति आदमी को जानवर से अलग करती है।",
        marks: 5, section: "Section D", type: "Long Answer",
        solution: "कौसल्यायन के अनुसार संस्कृति = सम्यक + कृति = उत्तम कर्म। यह बाह्य आडंबर नहीं, बल्कि आंतरिक चेतना है। संस्कृति विवेक, संवेदना, और मानवीय मूल्यों का समूह है। जो समाज विवेकशील और संवेदनशील है, वही सुसंस्कृत है। संस्कृति ही मनुष्य को पशु से अलग करती है।",
      },
      {
        question: "'नौबतखाने में इबादत' पाठ में यतीन्द्र मिश्र ने संगीत और आध्यात्मिकता के संबंध को किस प्रकार प्रस्तुत किया है?",
        answer: "यतीन्द्र मिश्र के अनुसार संगीत और आध्यात्मिकता एक ही सत्य के दो रूप हैं। नौबतखाने में बजने वाले वाद्य-यंत्र केवल संगीत नहीं बजाते, बल्कि ईश्वर की आराधना करते हैं। संगीत एक इबादत (प्रार्थना) है, जो आत्मा को परमात्मा से जोड़ती है। लेखक दर्शाते हैं कि जहाँ संगीत है, वही ईश्वर है। संगीत की तानों में ईश्वरीय उपस्थिति झलकती है। यह पाठ संगीत को आध्यात्मिक अनुभूति का माध्यम बताता है।",
        marks: 5, section: "Section D", type: "Long Answer",
        solution: "यतीन्द्र मिश्र ने संगीत को इबादत (प्रार्थना) के रूप में दर्शाया है। नौबतखाने के वाद्य-यंत्र ईश्वर की स्तुति करते हैं। संगीत और आध्यात्म — दोनों एक हैं। संगीत आत्मा को परमात्मा से जोड़ता है, और वही सच्ची इबादत है।",
      },
    ],
    sectionE: [
      {
        question: "गद्यांश पढ़कर उत्तर दें:\n\nशिक्षा मनुष्य को जीवन जीने की कला सिखाती है। एक शिक्षित व्यक्ति न केवल अपना विकास करता है, बल्कि समाज का भी उत्थान करता है। शिक्षा से व्यक्ति में चेतना, विवेक और संवेदना का विकास होता है। आज के युग में शिक्षा के बिना व्यक्ति अंधकार में जीवन व्यतीत करता है।\n\n(i) शिक्षा का मुख्य उद्देश्य क्या है? (ii) शिक्षित व्यक्ति के दो लाभ बताइए। (iii) शिक्षा के बिना व्यक्ति की स्थिति कैसी होती है?",
        answer: "(i) शिक्षा का उद्देश्य जीवन जीने की कला सिखाना। (ii) दो लाभ: व्यक्तिगत विकास और समाज का उत्थान। (iii) शिक्षा के बिना व्यक्ति अंधकार में जीवन व्यतीत करता है।",
        marks: 4, section: "Section E", type: "Case-Study",
        solution: "(i) शिक्षा जीवन जीने की कला सिखाती है। (ii) लाभ: चेतना-विवेक-संवेदना का विकास, समाज-उत्थान। (iii) बिना शिक्षा व्यक्ति अंधकार में जीता है — अज्ञानता में डूबा रहता है।",
      },
      {
        question: "काव्यांश पढ़कर उत्तर दें:\n\n'यह दंतुरहित मुस्कान,\nइस मुस्कान की जय हो,\nइस मुस्कान के लिए,\nकुछ भी कर जाने का जोश है।'\n\n(i) कवि किस मुस्कान की जय कहता है? (ii) इस मुस्कान के लिए कवि का भाव क्या है? (iii) इस काव्यांश में किस भाव की अभिव्यक्ति है?",
        answer: "(i) बच्चों की दंतुरहित (बिना दांतों वाली) मुस्कान। (ii) कवि का भाव — इस मुस्कान के लिए कुछ भी कर जाने का जोश। (iii) बच्चों के प्रति असीम प्रेम और समर्पण की अभिव्यक्ति।",
        marks: 4, section: "Section E", type: "Case-Study",
        solution: "(i) नागार्जुन बच्चों की बिना दांतों वाली मुस्कान की जय कहते हैं। (ii) कवि इस मुस्कान के लिए कुछ भी करने को तैयार है — असीम प्रेम और जोश। (iii) वात्सल्य-रस (बच्चों के प्रति प्रेम) की सुंदर अभिव्यक्ति है।",
      },
      {
        question: "गद्यांश पढ़कर उत्तर दें:\n\nप्रौढ्यावस्था में व्यक्ति अपने अनुभवों के आधार पर जीवन को समझता है। वह यह जान लेता है कि जीवन में सफलता एकाएक नहीं मिलती, बल्कि निरंतर प्रयास से प्राप्त होती है। वह अपनी गलतियों से सीखता है और आगे बढ़ता है।\n\n(i) प्रौढ्यावस्था में व्यक्ति जीवन को कैसे समझता है? (ii) सफलता कैसे प्राप्त होती है? (iii) व्यक्ति अपनी गलतियों से क्या सीखता है?",
        answer: "(i) अनुभवों के आधार पर। (ii) निरंतर प्रयास से, एकाएक नहीं। (iii) गलतियों से सीखकर आगे बढ़ता है।",
        marks: 4, section: "Section E", type: "Case-Study",
        solution: "(i) अनुभवों के आधार पर जीवन को समझता है। (ii) सफलता निरंतर प्रयास से मिलती है, एकाएक नहीं। (iii) गलतियों से सीखकर व्यक्ति आत्म-सुधार और आगे बढ़ने की प्रेरणा लेता है।",
      },
    ],
  },
};

// ---------- Local generation from question bank ----------

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function generateFromBank(req: GenRequest): { sections: unknown[] } {
  const bank = QUESTION_BANK[req.subject] ?? QUESTION_BANK["Science"];

  const marks = req.totalMarks;
  const a = Math.max(2, Math.round((marks * 0.25) / 1));
  const b = Math.max(1, Math.round((marks * 0.15) / 2));
  const c = Math.max(1, Math.round((marks * 0.2) / 3));
  const d = Math.max(1, Math.round((marks * 0.25) / 5));
  const e = Math.max(1, Math.round((marks * 0.15) / 4));

  const pick = <T,>(arr: T[], n: number): T[] => {
    if (arr.length >= n) return shuffle(arr).slice(0, n);
    // Repeat to fill if not enough
    const result: T[] = [];
    for (let i = 0; i < n; i++) result.push(arr[i % arr.length]);
    return result;
  };

  const sections = [
    {
      name: "Section A",
      label: "MCQs & Assertion-Reasoning",
      marksPerQuestion: 1,
      questions: pick(bank.sectionA, a),
    },
    {
      name: "Section B",
      label: "Very Short Answer",
      marksPerQuestion: 2,
      questions: pick(bank.sectionB, b),
    },
    {
      name: "Section C",
      label: "Short Answer",
      marksPerQuestion: 3,
      questions: pick(bank.sectionC, c),
    },
    {
      name: "Section D",
      label: "Long Answer",
      marksPerQuestion: 5,
      questions: pick(bank.sectionD, d),
    },
    {
      name: "Section E",
      label: "Case-Study / Source-Based",
      marksPerQuestion: 4,
      questions: pick(bank.sectionE, e),
    },
  ];

  return { sections };
}

function swapFromBank(req: GenRequest): { question: AIQuestion } {
  const bank = QUESTION_BANK[req.subject] ?? QUESTION_BANK["Science"];
  const sq = req.swapQuestion!;
  let pool: AIQuestion[];
  if (sq.section === "Section A") pool = bank.sectionA;
  else if (sq.section === "Section B") pool = bank.sectionB;
  else if (sq.section === "Section C") pool = bank.sectionC;
  else if (sq.section === "Section D") pool = bank.sectionD;
  else pool = bank.sectionE;

  const q = shuffle(pool)[0];
  return { question: q };
}

function solutionsFromBank(req: GenRequest): { solutions: Array<{ question: string; solution: string }> } {
  return {
    solutions: req.questions!.map((q) => ({
      question: q.question,
      solution: "See the answer key provided with the question.",
    })),
  };
}

// ---------- Prompt builders ----------

function buildGeneratePrompt(req: GenRequest): string {
  const scopeDesc =
    req.scope === "full"
      ? `the full ${req.subject} syllabus for CBSE Class 10`
      : req.scope === "chapter"
      ? `the chapter "${req.scopeValue}" from CBSE Class 10 ${req.subject}`
      : `the topic "${req.scopeValue}" from CBSE Class 10 ${req.subject}`;

  const pyqInstruction = req.pyq
    ? `\nIMPORTANT: Generate questions strictly based on Previous Years' CBSE Board Papers. Tag each question with the year in the question text, e.g. "[CBSE 2023]". Prioritize real board exam questions.`
    : "";

  const marks = req.totalMarks;

  const isLanguageSubject =
    req.subject === "English" || req.subject === "Hindi";
  const isCoreSubject =
    req.subject === "Science" ||
    req.subject === "Mathematics" ||
    req.subject === "Social Science";

  const a = Math.max(2, Math.round((marks * 0.25) / 1));
  const b = Math.max(1, Math.round((marks * 0.15) / 2));
  const c = Math.max(1, Math.round((marks * 0.2) / 3));
  const d = Math.max(1, Math.round((marks * 0.25) / 5));
  const e = Math.max(1, Math.round((marks * 0.15) / 4));

  let sectionARules: string;
  let sectionERules: string;

  if (isCoreSubject) {
    const arCount = Math.min(4, Math.max(2, Math.round(a * 0.3)));
    sectionARules = `- Section A: ${a} MCQs / Assertion-Reasoning (1 mark each). Include ${arCount} Assertion-Reason (A&R) questions. Each A&R question has two statements: Assertion (A) and Reason (R), followed by 4 options: (a) Both A and R are true and R is the correct explanation of A. (b) Both A and R are true but R is NOT the correct explanation of A. (c) A is true but R is false. (d) A is false but R is true.`;
    sectionERules = `- Section E: ${e} Case-Study / Source-Based (4 marks each). Include exactly 3 case studies. Each case study has a short case/passage/source in the question text, then 3-4 sub-questions totaling 4 marks.`;
  } else if (isLanguageSubject) {
    sectionARules = `- Section A: ${a} MCQs (1 mark each). NO Assertion-Reason questions. Instead, include 1-2 passage-based comprehension questions where a short passage is given followed by MCQs testing reading comprehension, inference, and vocabulary.`;
    sectionERules = `- Section E: ${e} Passage-based / Source-Based (4 marks each). Include a reading passage (prose or poetry extract), then sub-questions on comprehension, inference, and vocabulary totaling 4 marks.`;
  } else {
    sectionARules = `- Section A: ${a} MCQs / Assertion-Reasoning (1 mark each)`;
    sectionERules = `- Section E: ${e} Case-Study / Source-Based (4 marks each). Include a short case/passage/source in the question text, then sub-questions totaling 4 marks.`;
  }

  return `You are an expert CBSE Class 10 exam paper setter. Generate a test paper for ${scopeDesc}.
Level: ${req.level} | Difficulty: ${req.difficulty} | Total Marks: ${marks}${pyqInstruction}

Distribute questions across these CBSE sections (approximate counts, adjust so total marks ≈ ${marks}):
${sectionARules}
- Section B: ${b} Very Short Answer (2 marks each)
- Section C: ${c} Short Answer (3 marks each)
- Section D: ${d} Long Answer (5 marks each)
${sectionERules}

Rules:
- Section A questions must have exactly 4 options (A, B, C, D) and a single correct answer.
- For Assertion-Reason questions, use the format: "Assertion (A): ... Reason (R): ..." with the 4 standard A&R response options.
- All other sections are free-response unless they are passage-based.
- Make questions original, accurate, and grade-appropriate for CBSE Class 10 ${req.level} level.
- Provide a concise answer for each. For MCQs, answer is the option letter + text.
- Provide a brief step-by-step solution for each question.

Return ONLY valid JSON (no markdown fences) in this exact shape:
{
  "sections": [
    {
      "name": "Section A",
      "label": "MCQs & Assertion-Reasoning",
      "marksPerQuestion": 1,
      "questions": [
        { "question": "...", "options": ["A) ...","B) ...","C) ...","D) ..."], "answer": "...", "marks": 1, "section": "Section A", "type": "MCQ" or "Assertion-Reason", "solution": "..." }
      ]
    },
    ...
  ]
}`;
}

function buildSwapPrompt(req: GenRequest): string {
  const sq = req.swapQuestion!;
  const isLanguageSubject =
    req.subject === "English" || req.subject === "Hindi";
  const isCoreSubject =
    req.subject === "Science" ||
    req.subject === "Mathematics" ||
    req.subject === "Social Science";

  let formatRule: string;
  if (sq.marks === 1) {
    if (isCoreSubject) {
      formatRule =
        "Provide 4 options (A-D) and a single correct answer. You may generate an Assertion-Reason question (Assertion (A) + Reason (R) with the 4 standard A&R options) or a standard MCQ.";
    } else if (isLanguageSubject) {
      formatRule =
        "Provide 4 options (A-D) and a single correct answer. Do NOT use Assertion-Reason format. You may include a short passage followed by MCQs for comprehension.";
    } else {
      formatRule = "Provide 4 options (A-D) and a single correct answer.";
    }
  } else if (sq.section === "Section E") {
    if (isLanguageSubject) {
      formatRule =
        "Include a reading passage (prose or poetry extract), then sub-questions on comprehension, inference, and vocabulary totaling the marks.";
    } else {
      formatRule =
        "Include a short case/passage/source, then sub-questions totaling the marks.";
    }
  } else {
    formatRule = "Free-response question.";
  }

  return `You are an expert CBSE Class 10 exam paper setter. Generate ONE replacement question to match this slot:
- Subject: ${req.subject}
- Section: ${sq.section}
- Marks: ${sq.marks}
- Difficulty: ${req.difficulty}
- Level: ${req.level}
- PYQ only: ${req.pyq}${req.pyq ? " Tag with year e.g. [CBSE 2023]." : ""}

${formatRule}

Return ONLY valid JSON (no markdown fences):
{ "question": "...", "options": ["A) ...","B) ...","C) ...","D) ..."] | null, "answer": "...", "marks": ${sq.marks}, "section": "${sq.section}", "type": "...", "solution": "..." }`;
}

function buildSolutionsPrompt(req: GenRequest): string {
  const list = req.questions!
    .map((q, i) => `${i + 1}. [${q.section}, ${q.marks} marks] ${q.question}`)
    .join("\n");
  return `You are an expert CBSE Class 10 teacher. Provide detailed step-by-step solutions for each question below. Return ONLY valid JSON (no markdown fences):
{ "solutions": [ { "question": "...", "solution": "step-by-step solution..." }, ... ] }

Questions:
${list}`;
}

// ---------- AI providers ----------

const AI_TIMEOUT_MS = 8000;

function fetchWithTimeout(url: string, init: RequestInit, ms = AI_TIMEOUT_MS): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  return fetch(url, { ...init, signal: controller.signal }).finally(() => clearTimeout(timer));
}

async function callGemini(prompt: string): Promise<string> {
  if (!GEMINI_KEY) throw new Error("GEMINI_NO_KEY");
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_KEY}`;
  const res = await fetchWithTimeout(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.7, maxOutputTokens: 8192 },
    }),
  });
  if (res.status === 429) throw new Error("GEMINI_RATE_LIMIT");
  if (!res.ok) throw new Error(`GEMINI_ERROR_${res.status}`);
  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("GEMINI_EMPTY");
  return text;
}

async function callOpenAI(prompt: string): Promise<string> {
  if (!OPENAI_KEY) throw new Error("OPENAI_NO_KEY");
  const res = await fetchWithTimeout("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 8192,
    }),
  });
  if (res.status === 429) throw new Error("OPENAI_RATE_LIMIT");
  if (!res.ok) throw new Error(`OPENAI_ERROR_${res.status}`);
  const data = await res.json();
  const text = data?.choices?.[0]?.message?.content;
  if (!text) throw new Error("OPENAI_EMPTY");
  return text;
}

async function callGroq(prompt: string): Promise<string> {
  if (!GROQ_KEY) throw new Error("GROQ_NO_KEY");
  const res = await fetchWithTimeout("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${GROQ_KEY}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 8192,
    }),
  });
  if (res.status === 429) throw new Error("GROQ_RATE_LIMIT");
  if (!res.ok) throw new Error(`GROQ_ERROR_${res.status}`);
  const data = await res.json();
  const text = data?.choices?.[0]?.message?.content;
  if (!text) throw new Error("GROQ_EMPTY");
  return text;
}

function stripFences(text: string): string {
  let t = text.trim();
  if (t.startsWith("```")) {
    t = t.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "").trim();
  }
  return t;
}

function hasAnyKey(): boolean {
  return !!(GEMINI_KEY || OPENAI_KEY || GROQ_KEY);
}

async function generateWithFallback(
  prompt: string
): Promise<{ text: string; provider: string }> {
  if (!hasAnyKey()) throw new Error("NO_API_KEYS_CONFIGURED");

  const providers: Array<{
    name: string;
    fn: (p: string) => Promise<string>;
  }> = [
    { name: "Gemini", fn: callGemini },
    { name: "OpenAI", fn: callOpenAI },
    { name: "Groq", fn: callGroq },
  ];

  let lastError = "";
  for (const p of providers) {
    try {
      const text = await p.fn(prompt);
      return { text, provider: p.name };
    } catch (err) {
      lastError = err.message;
    }
  }
  throw new Error(`All AI providers failed. Last error: ${lastError}`);
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const body = (await req.json()) as GenRequest;

    let prompt: string;
    if (body.mode === "generate") prompt = buildGeneratePrompt(body);
    else if (body.mode === "swap") prompt = buildSwapPrompt(body);
    else if (body.mode === "solutions") prompt = buildSolutionsPrompt(body);
    else {
      return new Response(JSON.stringify({ error: "Invalid mode" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Try AI providers first, fall back to local question bank
    let data: unknown;
    let provider: string;
    let fallback = false;

    try {
      const { text, provider: prov } = await generateWithFallback(prompt);
      const cleaned = stripFences(text);

      let parsed: unknown;
      try {
        parsed = JSON.parse(cleaned);
      } catch {
        const match = cleaned.match(/\{[\s\S]*\}/);
        if (match) {
          parsed = JSON.parse(match[0]);
        } else {
          throw new Error("AI returned non-JSON response");
        }
      }

      if (body.mode === "swap") {
        data = { question: parsed };
      } else {
        data = parsed;
      }
      provider = prov;
    } catch {
      // Seamless fallback to local question bank — zero downtime
      fallback = true;
      if (body.mode === "generate") {
        data = generateFromBank(body);
        provider = "Local Bank";
      } else if (body.mode === "swap") {
        data = swapFromBank(body);
        provider = "Local Bank";
      } else {
        data = solutionsFromBank(body);
        provider = "Local Bank";
      }
    }

    return new Response(
      JSON.stringify({ data, provider, fallback }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
