import type { PaperSection, Question, TestConfig } from "./types";
import { calcTotalMarks, calcTimeMinutes, CBSE_SECTIONS } from "./types";

export interface BankQuestion {
  question: string;
  options?: string[] | null;
  answer: string;
  marks: number;
  section: string;
  type: string;
  solution?: string;
}

export const QUESTION_BANK: Record<
  string,
  Record<string, BankQuestion[]>
> = {
  Science: {
    "Section A": [
      {
        question: "Which of the following is a decomposition reaction?",
        options: ["A) CaCO₃ → CaO + CO₂", "B) 2H₂ + O₂ → 2H₂O", "C) NaOH + HCl → NaCl + H₂O", "D) Fe + CuSO₄ → FeSO₄ + Cu"],
        answer: "A) CaCO₃ → CaO + CO₂",
        marks: 1, section: "Section A", type: "MCQ",
        solution: "A decomposition reaction breaks a single compound into two or more simpler substances.",
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
        solution: "The iris controls the size of the pupil, regulating light entering the eye.",
      },
      {
        question: "The pH value of a neutral solution is:",
        options: ["A) 0", "B) 7", "C) 14", "D) 1"],
        answer: "B) 7",
        marks: 1, section: "Section A", type: "MCQ",
        solution: "A neutral solution has a pH of 7.",
      },
      {
        question: "Which hormone regulates blood sugar levels?",
        options: ["A) Thyroxine", "B) Insulin", "C) Adrenaline", "D) Growth hormone"],
        answer: "B) Insulin",
        marks: 1, section: "Section A", type: "MCQ",
        solution: "Insulin, produced by the pancreas, regulates blood glucose levels.",
      },
      {
        question: "Assertion (A): Carbon can form a large number of compounds.\nReason (R): Carbon has the property of catenation and tetravalency.",
        options: ["A) Both A and R are true and R is the correct explanation of A", "B) Both A and R are true but R is NOT the correct explanation of A", "C) A is true but R is false", "D) A is false but R is true"],
        answer: "A) Both A and R are true and R is the correct explanation of A",
        marks: 1, section: "Section A", type: "Assertion-Reason",
        solution: "Carbon's catenation and tetravalency allow it to form millions of compounds.",
      },
      {
        question: "Which of the following is NOT a greenhouse gas?",
        options: ["A) Carbon dioxide", "B) Methane", "C) Oxygen", "D) Water vapour"],
        answer: "C) Oxygen",
        marks: 1, section: "Section A", type: "MCQ",
        solution: "Oxygen does not trap heat in the atmosphere.",
      },
      {
        question: "Assertion (A): Sodium metal is kept immersed in kerosene.\nReason (R): Sodium reacts vigorously with moisture and air.",
        options: ["A) Both A and R are true and R is the correct explanation of A", "B) Both A and R are true but R is NOT the correct explanation of A", "C) A is true but R is false", "D) A is false but R is true"],
        answer: "A) Both A and R are true and R is the correct explanation of A",
        marks: 1, section: "Section A", type: "Assertion-Reason",
        solution: "Sodium is stored in kerosene to prevent reaction with moisture and air.",
      },
    ],
    "Section B": [
      {
        question: "Why does tooth decay occur when the pH of mouth is lower than 5.5? Explain.",
        answer: "When pH falls below 5.5, the acidic environment corrodes the calcium phosphate (enamel) of teeth, causing decay.",
        marks: 2, section: "Section B", type: "Very Short Answer",
        solution: "Bacteria produce acids from food debris. When pH < 5.5, the acid dissolves tooth enamel, leading to cavities.",
      },
      {
        question: "State the function of a fuse in an electric circuit. On what principle does it work?",
        answer: "A fuse protects circuits by melting and breaking the circuit when current exceeds a safe limit. It works on the heating effect of electric current.",
        marks: 2, section: "Section B", type: "Very Short Answer",
        solution: "The fuse wire has a low melting point. Excess current heats it, causing it to melt and break the circuit.",
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
    "Section C": [
      {
        question: "Explain why carbon forms covalent bonds. Give two reasons.",
        answer: "1) Carbon has 4 valence electrons and cannot lose or gain 4 electrons easily, so it shares electrons. 2) It has a small atomic size, allowing strong sharing of electrons.",
        marks: 3, section: "Section C", type: "Short Answer",
        solution: "Carbon's tetravalency makes it unfavorable to form C⁴⁺ or C⁴⁻ ions, so it shares electrons. Its small size enables effective orbital overlap.",
      },
      {
        question: "An electric bulb is rated 220 V and 100 W. Calculate the current flowing through it and its resistance.",
        answer: "Current = P/V = 100/220 ≈ 0.455 A. Resistance = V/I = 220/0.455 ≈ 484 Ω.",
        marks: 3, section: "Section C", type: "Short Answer",
        solution: "Using P = VI: I = P/V = 100/220 = 0.455 A. Using Ohm's law: R = V/I ≈ 484 Ω.",
      },
      {
        question: "What is a magnetic field? State two properties of magnetic field lines.",
        answer: "A magnetic field is the region around a magnet where magnetic forces can be detected. Properties: 1) Lines go from N to S outside, S to N inside. 2) They never intersect.",
        marks: 3, section: "Section C", type: "Short Answer",
        solution: "The magnetic field is the space where a magnetic force is experienced. Field lines emerge from N pole, enter S pole, never cross each other.",
      },
      {
        question: "Draw a labelled diagram of the longitudinal section of a flower and explain the function of the stigma.",
        answer: "The stigma is the receptive surface of the pistil that catches pollen grains during pollination, enabling fertilisation.",
        marks: 3, section: "Section C", type: "Short Answer",
        solution: "The stigma provides a sticky surface for pollen to land on. Pollen germinates here and the tube grows down through the style to reach the ovary.",
      },
    ],
    "Section D": [
      {
        question: "Explain the process of photosynthesis in detail. Write the balanced chemical equation and state the role of chlorophyll.",
        answer: "Photosynthesis is the process by which green plants make food (glucose) using CO₂, water, and sunlight. Equation: 6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂ (in presence of sunlight and chlorophyll). Chlorophyll absorbs sunlight energy needed for the reaction.",
        marks: 5, section: "Section D", type: "Long Answer",
        solution: "Photosynthesis occurs in chloroplasts. Chlorophyll absorbs light energy, which splits water and excites electrons. CO₂ is reduced to glucose via the Calvin cycle. Overall: 6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂.",
      },
      {
        question: "Describe the human excretory system. Name the main components and explain how urine is formed.",
        answer: "The excretory system consists of kidneys, ureters, urinary bladder, and urethra. Blood enters kidneys via renal artery. Nephrons filter blood: filtration in glomerulus, reabsorption in tubules, secretion adds waste. The filtrate becomes urine.",
        marks: 5, section: "Section D", type: "Long Answer",
        solution: "Kidneys contain nephrons. Blood is filtered in the glomerulus (ultrafiltration). Useful substances are reabsorbed. Additional waste is secreted. The remaining fluid (urine) passes through the collecting duct to the ureter → bladder → urethra.",
      },
      {
        question: "A concave lens has focal length 15 cm. At what distance should the object from the lens be placed so that it forms an image at 10 cm from the lens? Also find the magnification.",
        answer: "Using lens formula: 1/f = 1/v - 1/u. f = -15 cm, v = -10 cm. 1/u = -1/10 + 1/15 = -1/30. u = -30 cm. Magnification m = v/u = -10/-30 = +1/3 ≈ 0.33.",
        marks: 5, section: "Section D", type: "Long Answer",
        solution: "Lens formula: 1/f = 1/v - 1/u. For concave lens f = -15 cm, v = -10 cm. 1/u = 1/v - 1/f = -1/10 + 1/15 = -1/30. u = -30 cm. m = v/u = +0.33 (virtual, erect, diminished).",
      },
    ],
    "Section E": [
      {
        question: "Case Study: A student observed that when a strip of zinc metal is placed in copper sulphate solution, the blue colour fades and a brownish coating appears on the zinc strip.\n\n(i) Name the type of reaction and write the balanced equation. (ii) Why does the blue colour fade? (iii) Identify the substance deposited on the zinc strip.",
        answer: "(i) Displacement reaction: Zn + CuSO₄ → ZnSO₄ + Cu. (ii) Blue colour fades because Cu²⁺ ions (blue) are replaced by Zn²⁺ ions (colourless). (iii) Copper metal is deposited on the zinc strip.",
        marks: 4, section: "Section E", type: "Case-Study",
        solution: "Zinc is more reactive than copper, so it displaces Cu from CuSO₄. Cu²⁺ gives the blue colour; as they are consumed, colour fades. The brown deposit is copper metal.",
      },
      {
        question: "Case Study: An electric heater draws a current of 5 A when connected to a 220 V supply.\n\n(i) Calculate the power of the heater. (ii) Calculate the energy consumed in 2 hours. (iii) If used for 30 days, 2 hours daily, find the cost at ₹6/kWh.",
        answer: "(i) P = VI = 220 × 5 = 1100 W = 1.1 kW. (ii) E = P × t = 1.1 × 2 = 2.2 kWh per day. (iii) Total = 2.2 × 30 = 66 kWh. Cost = 66 × 6 = ₹396.",
        marks: 4, section: "Section E", type: "Case-Study",
        solution: "P = VI = 220×5 = 1100 W = 1.1 kW. Energy/day = 1.1 × 2 = 2.2 kWh. Total for 30 days = 66 kWh. Cost = 66 × 6 = ₹396.",
      },
      {
        question: "Case Study: A gardener found that his plants were not growing well. On testing, the soil pH was 4.5.\n\n(i) Is the soil acidic or basic? (ii) Which nutrient availability is affected? (iii) Suggest two methods to improve soil pH.",
        answer: "(i) The soil is acidic (pH < 7). (ii) Nitrogen and phosphorus become less available. (iii) Add lime (CaO) or organic manure to reduce acidity.",
        marks: 4, section: "Section E", type: "Case-Study",
        solution: "pH 4.5 is strongly acidic. Acidic soils reduce availability of N, P. Adding lime neutralises acidity. Organic matter improves soil buffering.",
      },
    ],
  },
  Mathematics: {
    "Section A": [
      {
        question: "The HCF of 96 and 404 is:",
        options: ["A) 2", "B) 4", "C) 8", "D) 12"],
        answer: "B) 4",
        marks: 1, section: "Section A", type: "MCQ",
        solution: "96 = 2⁵ × 3, 404 = 2² × 101. HCF = 2² = 4.",
      },
      {
        question: "The value of sin 30° + cos 60° is:",
        options: ["A) 0", "B) 1", "C) 2", "D) 1/2"],
        answer: "B) 1",
        marks: 1, section: "Section A", type: "MCQ",
        solution: "sin 30° = 1/2, cos 60° = 1/2. Sum = 1.",
      },
      {
        question: "If the discriminant of a quadratic equation is zero, the roots are:",
        options: ["A) Real and distinct", "B) Real and equal", "C) Not real", "D) Complex"],
        answer: "B) Real and equal",
        marks: 1, section: "Section A", type: "MCQ",
        solution: "When D = b² - 4ac = 0, the quadratic has two real and equal roots.",
      },
      {
        question: "The nth term of the AP: 2, 7, 12, 17, ... is:",
        options: ["A) 5n - 3", "B) 5n + 2", "C) 5n - 2", "D) 3n - 1"],
        answer: "A) 5n - 3",
        marks: 1, section: "Section A", type: "MCQ",
        solution: "a = 2, d = 5. aₙ = a + (n-1)d = 2 + (n-1)(5) = 5n - 3.",
      },
      {
        question: "If P(E) = 0.05, what is the probability of 'not E'?",
        options: ["A) 0.95", "B) 0.05", "C) 1.05", "D) 0.5"],
        answer: "A) 0.95",
        marks: 1, section: "Section A", type: "MCQ",
        solution: "P(not E) = 1 - P(E) = 1 - 0.05 = 0.95.",
      },
      {
        question: "The number of tangents from a point on the circle is:",
        options: ["A) 0", "B) 1", "C) 2", "D) Infinite"],
        answer: "B) 1",
        marks: 1, section: "Section A", type: "MCQ",
        solution: "A point on the circle has exactly one tangent at that point.",
      },
      {
        question: "Assertion (A): The decimal expansion of a rational number is either terminating or non-terminating recurring.\nReason (R): A rational number can be expressed as p/q where q ≠ 0.",
        options: ["A) Both A and R are true and R is the correct explanation of A", "B) Both A and R are true but R is NOT the correct explanation of A", "C) A is true but R is false", "D) A is false but R is true"],
        answer: "B) Both A and R are true but R is NOT the correct explanation of A",
        marks: 1, section: "Section A", type: "Assertion-Reason",
        solution: "Both are true, but R (definition) does not explain A (decimal property); the prime factorisation of q does.",
      },
      {
        question: "Assertion (A): The probability of an impossible event is 0.\nReason (R): Probability ranges from 0 to 1 inclusive.",
        options: ["A) Both A and R are true and R is the correct explanation of A", "B) Both A and R are true but R is NOT the correct explanation of A", "C) A is true but R is false", "D) A is false but R is true"],
        answer: "A) Both A and R are true and R is the correct explanation of A",
        marks: 1, section: "Section A", type: "Assertion-Reason",
        solution: "An impossible event cannot occur, so its probability is 0. R explains A.",
      },
    ],
    "Section B": [
      {
        question: "Find the roots of the quadratic equation 2x² - x - 6 = 0.",
        answer: "x = 2 or x = -3/2.",
        marks: 2, section: "Section B", type: "Very Short Answer",
        solution: "x = (1 ± √(1+48))/4 = (1 ± 7)/4. x = 2 or x = -3/2.",
      },
      {
        question: "Find the 10th term of the AP: -3, -1, 1, 3, ...",
        answer: "The 10th term is 15.",
        marks: 2, section: "Section B", type: "Very Short Answer",
        solution: "a = -3, d = 2. a₁₀ = a + 9d = -3 + 18 = 15.",
      },
      {
        question: "A die is thrown once. Find the probability of getting a number less than 3.",
        answer: "P(number < 3) = 2/6 = 1/3.",
        marks: 2, section: "Section B", type: "Very Short Answer",
        solution: "Numbers less than 3: {1, 2}. P = 2/6 = 1/3.",
      },
      {
        question: "Evaluate: 2 tan²45° + cos²30° - sin²90°.",
        answer: "2(1) + (3/4) - 1 = 7/4.",
        marks: 2, section: "Section B", type: "Very Short Answer",
        solution: "tan 45° = 1, cos 30° = √3/2, sin 90° = 1. 2(1)² + 3/4 - 1 = 7/4.",
      },
    ],
    "Section C": [
      {
        question: "Solve the pair of linear equations: 2x + 3y = 11 and 2x - 4y = -24.",
        answer: "x = -2, y = 5.",
        marks: 3, section: "Section C", type: "Short Answer",
        solution: "Subtract: 7y = 35 → y = 5. Substitute: 2x + 15 = 11 → x = -2.",
      },
      {
        question: "Prove that the tangents drawn from an external point to a circle are equal in length.",
        answer: "Let PT and PT' be tangents from P. In △OPT and △OPT': OT = OT' (radii), OP common, ∠OTP = ∠OT'P = 90°. By RHS, △OPT ≅ △OPT'. Hence PT = PT'.",
        marks: 3, section: "Section C", type: "Short Answer",
        solution: "Tangents PT and PT' from P to circle with centre O. ∠OTP = ∠OT'P = 90°, OT = OT' (radii), OP common. By RHS congruence, PT = PT'.",
      },
      {
        question: "Find the distance between A(3, 4) and B(5, -2), and the midpoint of AB.",
        answer: "Midpoint = (4, 1). AB = √(4+36) = √40 = 2√10 units.",
        marks: 3, section: "Section C", type: "Short Answer",
        solution: "Midpoint = ((3+5)/2, (4-2)/2) = (4, 1). Distance = √((5-3)²+(-2-4)²) = √40 = 2√10.",
      },
      {
        question: "Find the area of a sector of a circle with radius 7 cm and central angle 60°. (Use π = 22/7)",
        answer: "Area = (60/360) × (22/7) × 49 = 77/3 ≈ 25.67 cm².",
        marks: 3, section: "Section C", type: "Short Answer",
        solution: "Area of sector = (θ/360°) × πr² = (1/6) × (22/7) × 49 = 77/3 ≈ 25.67 cm².",
      },
    ],
    "Section D": [
      {
        question: "A train travels 360 km at a uniform speed. If the speed had been 5 km/h more, it would have taken 1 hour less. Find the speed of the train.",
        answer: "Let speed = x. 360/x - 360/(x+5) = 1. Solving: x² + 5x - 1800 = 0. x = 40. Speed = 40 km/h.",
        marks: 5, section: "Section D", type: "Long Answer",
        solution: "360/x - 360/(x+5) = 1. Multiply by x(x+5): 1800 = x² + 5x. x² + 5x - 1800 = 0. x = (-5 + 85)/2 = 40 km/h.",
      },
      {
        question: "Prove that if a line is drawn parallel to one side of a triangle to intersect the other two sides at distinct points, the other two sides are divided in the same ratio (BPT/Thales' Theorem).",
        answer: "Given: △ABC with DE ∥ BC. To prove: AD/DB = AE/EC. Proof: △ADE and △BDE share the same altitude from E. Area(△ADE)/Area(△BDE) = AD/DB. Similarly, Area(△ADE)/Area(△CDE) = AE/EC. Since DE ∥ BC, Area(△BDE) = Area(△CDE). Therefore AD/DB = AE/EC.",
        marks: 5, section: "Section D", type: "Long Answer",
        solution: "In △ABC, DE ∥ BC. Triangles △BDE and △CDE stand on the same base DE between the same parallels, so equal areas. △ADE/△BDE = AD/DB and △ADE/△CDE = AE/EC. Since △BDE = △CDE, AD/DB = AE/EC.",
      },
      {
        question: "A solid metallic sphere of radius 6 cm is melted and recast into a cylinder of radius 3 cm. Find the height of the cylinder and the ratio of total surface areas.",
        answer: "Volume: (4/3)π(216) = π(9)h → h = 32 cm. Sphere SA = 144π, Cylinder SA = 210π. Ratio = 24:35.",
        marks: 5, section: "Section D", type: "Long Answer",
        solution: "Volume conservation: (4/3)πr³ = πR²h → (4/3)(216) = 9h → h = 32 cm. Sphere SA = 4π(36) = 144π. Cylinder SA = 2π(3)(32) + 2π(9) = 210π. Ratio = 144:210 = 24:35.",
      },
    ],
    "Section E": [
      {
        question: "Case Study: A cricket player's scores in 5 consecutive matches are: 40, 50, 60, 50, 50.\n\n(i) Find the mean, median, and mode. (ii) Which measure best represents the data? (iii) Find the range.",
        answer: "(i) Mean = 50, Median = 50, Mode = 50. (ii) All three are equal, so any represents the data well. (iii) Range = 60 - 40 = 20.",
        marks: 4, section: "Section E", type: "Case-Study",
        solution: "Mean = 250/5 = 50. Sorted: 40,50,50,50,60; median = 50. Mode = 50. Range = 20.",
      },
      {
        question: "Case Study: Two poles of heights 6 m and 11 m stand on a plane ground. The distance between their feet is 12 m.\n\n(i) Find the distance between their tops. (ii) Find the angle of elevation of the taller pole's top from the shorter's. (iii) What length of wire connects the tops?",
        answer: "(i) Distance = √(12² + 5²) = 13 m. (ii) tan θ = 5/12, θ ≈ 22.6°. (iii) Wire = 13 m.",
        marks: 4, section: "Section E", type: "Case-Study",
        solution: "Heights differ by 5 m, base = 12 m. Distance between tops = √(144+25) = 13 m. Angle: tan θ = 5/12. Wire = 13 m.",
      },
      {
        question: "Case Study: A bag contains 5 red, 8 white, and 7 black balls. A ball is drawn at random.\n\n(i) Find P(red). (ii) Find P(white). (iii) Find P(neither red nor white).",
        answer: "Total = 20. (i) P(red) = 5/20 = 1/4. (ii) P(white) = 8/20 = 2/5. (iii) P(black) = 7/20.",
        marks: 4, section: "Section E", type: "Case-Study",
        solution: "Total = 20 balls. P(red) = 5/20 = 1/4. P(white) = 8/20 = 2/5. P(neither red nor white) = P(black) = 7/20.",
      },
    ],
  },
  "Social Science": {
    "Section A": [
      {
        question: "Who was the first President of the Indian National Congress?",
        options: ["A) Womesh Chunder Bonnerjee", "B) Dadabhai Naoroji", "C) Allan Octavian Hume", "D) Surendranath Banerjee"],
        answer: "A) Womesh Chunder Bonnerjee",
        marks: 1, section: "Section A", type: "MCQ",
        solution: "W.C. Bonnerjee presided over the first INC session in Bombay in 1885.",
      },
      {
        question: "Which type of resource is iron ore?",
        options: ["A) Renewable", "B) Biotic", "C) Non-renewable", "D) Ubiquitous"],
        answer: "C) Non-renewable",
        marks: 1, section: "Section A", type: "MCQ",
        solution: "Iron ore is non-renewable because it cannot be replenished naturally in a short period.",
      },
      {
        question: "The Earth Summit in Rio de Janeiro was held in:",
        options: ["A) 1987", "B) 1992", "C) 1997", "D) 2002"],
        answer: "B) 1992",
        marks: 1, section: "Section A", type: "MCQ",
        solution: "The Earth Summit (UN Conference on Environment and Development) was held in Rio in 1992.",
      },
      {
        question: "Which sector includes agriculture, forestry, and fishing?",
        options: ["A) Primary sector", "B) Secondary sector", "C) Tertiary sector", "D) Quaternary sector"],
        answer: "A) Primary sector",
        marks: 1, section: "Section A", type: "MCQ",
        solution: "The primary sector uses natural resources directly: agriculture, forestry, fishing, mining.",
      },
      {
        question: "Globalisation refers to:",
        options: ["A) Integration of national economies with the world economy", "B) Isolation of domestic markets", "C) Reduction in international trade", "D) Increase in import duties"],
        answer: "A) Integration of national economies with the world economy",
        marks: 1, section: "Section A", type: "MCQ",
        solution: "Globalisation is the integration of national economies with the global economy through trade and investment.",
      },
      {
        question: "Assertion (A): The Non-Cooperation Movement was withdrawn in 1922.\nReason (R): The Chauri Chaura incident led Gandhi to call off the movement.",
        options: ["A) Both A and R are true and R is the correct explanation of A", "B) Both A and R are true but R is NOT the correct explanation of A", "C) A is true but R is false", "D) A is false but R is true"],
        answer: "A) Both A and R are true and R is the correct explanation of A",
        marks: 1, section: "Section A", type: "Assertion-Reason",
        solution: "The Non-Cooperation Movement was withdrawn in 1922 after the violent Chauri Chaura incident.",
      },
      {
        question: "Assertion (A): Power sharing is desirable in a democracy.\nReason (R): Power sharing helps to reduce the possibility of conflict between social groups.",
        options: ["A) Both A and R are true and R is the correct explanation of A", "B) Both A and R are true but R is NOT the correct explanation of A", "C) A is true but R is false", "D) A is false but R is true"],
        answer: "A) Both A and R are true and R is the correct explanation of A",
        marks: 1, section: "Section A", type: "Assertion-Reason",
        solution: "Power sharing reduces conflict between groups, ensuring stability. R explains A.",
      },
      {
        question: "Which of the following is an economic activity?",
        options: ["A) A mother cooking for her family", "B) A father teaching his own child", "C) A teacher teaching in a school for salary", "D) A person cleaning their own house"],
        answer: "C) A teacher teaching in a school for salary",
        marks: 1, section: "Section A", type: "MCQ",
        solution: "Economic activities involve production or exchange of goods/services for money.",
      },
    ],
    "Section B": [
      {
        question: "What was the main aim of the Simon Commission? Why was it opposed by Indians?",
        answer: "The Simon Commission (1928) was set up to review constitutional progress in India. It was opposed because it had no Indian members.",
        marks: 2, section: "Section B", type: "Very Short Answer",
        solution: "All seven members were British, with no Indian representation, which was seen as an insult.",
      },
      {
        question: "Why is agriculture called the backbone of the Indian economy?",
        answer: "Agriculture employs the largest section of the population, provides food security, supplies raw materials to industries, and contributes significantly to GDP.",
        marks: 2, section: "Section B", type: "Very Short Answer",
        solution: "Agriculture employs over 50% of the workforce, provides food for 1.4 billion people, and contributes ~15-20% to GDP.",
      },
      {
        question: "What is meant by 'federalism'? Give one example from India.",
        answer: "Federalism is a system where power is divided between a central authority and constituent units. India has Union and state governments with their own jurisdictions.",
        marks: 2, section: "Section B", type: "Very Short Answer",
        solution: "India has three legislative lists: Union, State, and Concurrent, each with defined powers.",
      },
      {
        question: "What is the difference between renewable and non-renewable resources? Give one example of each.",
        answer: "Renewable resources can be replenished naturally (solar energy). Non-renewable resources cannot be replenished once used (coal).",
        marks: 2, section: "Section B", type: "Very Short Answer",
        solution: "Renewable: solar, wind, water. Non-renewable: coal, petroleum, natural gas.",
      },
    ],
    "Section C": [
      {
        question: "Explain the three types of resource classification with examples.",
        answer: "1) Renewable: can be replenished (solar energy). 2) Non-renewable: cannot be replenished (coal). 3) Biotic/Abiotic: Biotic has life (forests), Abiotic doesn't (rocks).",
        marks: 3, section: "Section C", type: "Short Answer",
        solution: "Resources are classified as renewable (naturally replenished), non-renewable (finite), and biotic (living) vs abiotic (non-living).",
      },
      {
        question: "Describe any three features of the Indian federal system.",
        answer: "1) Two levels of government (Union and State). 2) Division of powers through three lists. 3) Independent judiciary to interpret the constitution.",
        marks: 3, section: "Section C", type: "Short Answer",
        solution: "Indian federalism features dual government, written constitution with three legislative lists, and independent judiciary.",
      },
      {
        question: "Explain the role of MNCs in the process of globalisation.",
        answer: "MNCs set up production in countries with low costs, bringing capital, technology, and management expertise. They create global supply chains and connect distant markets.",
        marks: 3, section: "Section C", type: "Short Answer",
        solution: "MNCs drive globalisation by investing in developing countries, spreading production, creating global supply chains, and transferring technology.",
      },
      {
        question: "Why did the Non-Cooperation Movement start? Explain any three key features.",
        answer: "It started (1920) to protest the Rowlatt Act, Jallianwala Bagh massacre, and Khilafat issue. Features: 1) Boycott of British schools, courts, titles. 2) Surrender of government posts. 3) Promotion of swadeshi goods.",
        marks: 3, section: "Section C", type: "Short Answer",
        solution: "Causes: Rowlatt Act, Jallianwala Bagh, Khilafat. Features: boycott of British institutions, renunciation of titles, promotion of khadi and swadeshi.",
      },
    ],
    "Section D": [
      {
        question: "Explain the causes of the rise of nationalism in India, with reference to the freedom movement.",
        answer: "1) Economic exploitation by British policies. 2) Western education exposing Indians to democratic ideas. 3) The INC providing a national platform. 4) Movements like Non-Cooperation, Civil Disobedience, and Quit India uniting people. 5) The press spreading nationalist ideas. 6) Gandhi's mass mobilisation through Satyagraha.",
        marks: 5, section: "Section D", type: "Long Answer",
        solution: "Causes: British economic exploitation, Western education creating a middle class, socio-religious reforms, INC leadership, anti-Rowlatt/Jallianwala/Khilafat movements, role of press, Gandhi's Satyagraha.",
      },
      {
        question: "Describe the different types of farming practised in India. Explain any two in detail.",
        answer: "1) Primitive subsistence farming (shifting cultivation, small plots). 2) Intensive subsistence farming (high labour, small holdings, high yield). 3) Commercial farming (plantation agriculture, cash crops like tea, coffee, rubber).",
        marks: 5, section: "Section D", type: "Long Answer",
        solution: "Primitive subsistence: small patches, primitive tools, depends on monsoon. Intensive subsistence: high labour, multiple cropping. Commercial/plantation: single crop, large estates, capital-intensive.",
      },
      {
        question: "Explain the role of the tertiary sector in the Indian economy. Why is it the largest sector today?",
        answer: "The tertiary sector includes trade, transport, communication, banking, education, health, IT. It is the largest because: 1) Basic services are in demand. 2) Development of agriculture and industry creates demand for services. 3) Rising income leads to more services. 4) IT and outsourcing have boomed.",
        marks: 5, section: "Section D", type: "Long Answer",
        solution: "The tertiary sector contributes ~55% of GDP. Reasons: development of primary/secondary sectors, growing population needs, IT-BPO growth, rising incomes. However, it employs only ~28% of workforce.",
      },
    ],
    "Section E": [
      {
        question: "Case Study: The Jallianwala Bagh massacre took place on April 13, 1919, when General Dyer ordered troops to fire on an unarmed crowd at Jallianwala Bagh, Amritsar.\n\n(i) Why had the crowd gathered? (ii) What was the immediate cause? (iii) How did this impact the freedom struggle?",
        answer: "(i) For the Baisakhi fair and to protest the Rowlatt Act. (ii) People were unaware of martial law. (iii) Nationwide outrage, Gandhi launching Non-Cooperation Movement.",
        marks: 4, section: "Section E", type: "Case-Study",
        solution: "(i) Baisakhi fair and Rowlatt protest. (ii) Unaware of martial law. (iii) Tagore renounced knighthood, Gandhi launched Non-Cooperation Movement in 1920.",
      },
      {
        question: "Case Study: Water is a critical resource, but its distribution is highly uneven across India.\n\n(i) What is water scarcity? (ii) Name two regions facing severe water scarcity. (iii) Suggest two measures to conserve water.",
        answer: "(i) Lack of sufficient fresh water to meet demands. (ii) Rajasthan and parts of Maharashtra. (iii) Rainwater harvesting and drip irrigation.",
        marks: 4, section: "Section E", type: "Case-Study",
        solution: "Water scarcity: demand exceeds supply. Regions: Rajasthan, Marathwada. Measures: rainwater harvesting, drip irrigation, watershed management, recycling.",
      },
      {
        question: "Case Study: The RBI issues currency notes and regulates the money supply in the economy.\n\n(i) Who issues currency in India? (ii) What is the role of credit in development? (iii) Why do banks ask for collateral?",
        answer: "(i) The Reserve Bank of India. (ii) Credit helps farmers and businesses invest and produce. (iii) Collateral is a guarantee the bank can sell if the borrower defaults.",
        marks: 4, section: "Section E", type: "Case-Study",
        solution: "RBI issues currency. Credit enables investment in agriculture, trade, industry. Collateral (land, gold) acts as security against default.",
      },
    ],
  },
  English: {
    "Section A": [
      {
        question: "Choose the correct synonym for 'diligent':\nA) Lazy\nB) Hardworking\nC) Careless\nD) Slow",
        options: ["A) Lazy", "B) Hardworking", "C) Careless", "D) Slow"],
        answer: "B) Hardworking",
        marks: 1, section: "Section A", type: "MCQ",
        solution: "'Diligent' means showing care and conscientious effort — hardworking.",
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
        solution: "Simple past ('wrote') → passive: was/were + past participle.",
      },
      {
        question: "Fill in the blank: 'Neither the teacher nor the students ___ present.'\nA) was\nB) were\nC) is\nD) has",
        options: ["A) was", "B) were", "C) is", "D) has"],
        answer: "B) were",
        marks: 1, section: "Section A", type: "MCQ",
        solution: "With 'neither...nor', the verb agrees with the nearer subject. 'Students' (plural) → 'were'.",
      },
      {
        question: "What is the antonym of 'generous'?\nA) Kind\nB) Stingy\nC) Helpful\nD) Friendly",
        options: ["A) Kind", "B) Stingy", "C) Helpful", "D) Friendly"],
        answer: "B) Stingy",
        marks: 1, section: "Section A", type: "MCQ",
        solution: "'Generous' means willing to give; the opposite is 'stingy'.",
      },
      {
        question: "Choose the correct indirect speech: He said, 'I am happy.'\nA) He said that I am happy\nB) He said that he is happy\nC) He said that he was happy\nD) He told that he was happy",
        options: ["A) He said that I am happy", "B) He said that he is happy", "C) He said that he was happy", "D) He told that he was happy"],
        answer: "C) He said that he was happy",
        marks: 1, section: "Section A", type: "MCQ",
        solution: "In indirect speech, present tense changes to past. 'I am happy' → 'he was happy'.",
      },
      {
        question: "Assertion (A): Reading comprehension involves understanding both explicit and implicit meanings.\nReason (R): Inference requires the reader to go beyond the literal text.",
        options: ["A) Both A and R are true and R is the correct explanation of A", "B) Both A and R are true but R is NOT the correct explanation of A", "C) A is true but R is false", "D) A is false but R is true"],
        answer: "A) Both A and R are true and R is the correct explanation of A",
        marks: 1, section: "Section A", type: "Assertion-Reason",
        solution: "Reading comprehension includes both literal understanding (explicit) and inference (implicit). R explains A.",
      },
      {
        question: "Read the extract: \"He didn't know what to do. He couldn't walk, he couldn't talk. He just stood there.\" The word 'stood' here suggests:\nA) Confidence\nB) Helplessness\nC) Anger\nD) Joy",
        options: ["A) Confidence", "B) Helplessness", "C) Anger", "D) Joy"],
        answer: "B) Helplessness",
        marks: 1, section: "Section A", type: "MCQ",
        solution: "The character 'didn't know what to do' and 'couldn't walk, couldn't talk' — indicating helplessness.",
      },
    ],
    "Section B": [
      {
        question: "Read the lines: 'The fog comes on little cat feet.' What figure of speech is used? Explain its effect.",
        answer: "The poet uses a metaphor/personification comparing fog to a cat. It creates a quiet, stealthy image of the fog arriving silently.",
        marks: 2, section: "Section B", type: "Very Short Answer",
        solution: "Carl Sandburg uses an extended metaphor comparing fog to a cat that comes silently and sits looking over the city.",
      },
      {
        question: "What message does the poem 'Fire and Ice' by Robert Frost convey?",
        answer: "The poem conveys that the world could end either in fire (desire) or ice (hatred). Both emotions are equally destructive.",
        marks: 2, section: "Section B", type: "Very Short Answer",
        solution: "Frost uses fire as a metaphor for desire and ice for hatred. Both can destroy the world.",
      },
      {
        question: "Why did Lencho write a letter to God? What did he ask for?",
        answer: "Lencho wrote to God because his corn crop was destroyed by hail. He asked for 100 pesos to sow the field again and survive.",
        marks: 2, section: "Section B", type: "Very Short Answer",
        solution: "In 'A Letter to God', Lencho's crop was destroyed by hailstorm. He asked for 100 pesos to support his family and replant.",
      },
      {
        question: "Change to passive voice: 'The mechanic is repairing my car.'",
        answer: "My car is being repaired by the mechanic.",
        marks: 2, section: "Section B", type: "Very Short Answer",
        solution: "Present continuous → passive: is/are being + past participle.",
      },
    ],
    "Section C": [
      {
        question: "Describe the character of Anne Frank as revealed in her diary entries.",
        answer: "Anne Frank was intelligent, observant, witty, and sensitive. She was a deep thinker who questioned the world. She was lonely, seeking a true friend in her diary (Kitty). She showed remarkable maturity and optimism despite the horrors of hiding.",
        marks: 3, section: "Section C", type: "Short Answer",
        solution: "Anne was lively, intelligent, perceptive, and critical of adults. She showed warmth, humour, and resilience, longing for freedom and a true friend.",
      },
      {
        question: "How does the poem 'Dust of Snow' by Robert Frost convey that small things in nature can have a big impact?",
        answer: "A crow shaking down a dust of snow from a hemlock tree changes the poet's mood from regret to joy. This small event shows how nature can transform our outlook.",
        marks: 3, section: "Section C", type: "Short Answer",
        solution: "A seemingly insignificant moment — a crow shaking snow onto the poet — lifts his spirits entirely. Nature, even in its smallest forms, can heal and transform.",
      },
      {
        question: "Write a paragraph (80-100 words) on the importance of discipline in student life.",
        answer: "Discipline is the foundation of a successful student life. It helps students manage time, stay focused, and achieve their goals. A disciplined student attends classes regularly, completes assignments on time, and maintains a balance between studies and extracurricular activities. Discipline also builds character, teaching responsibility and self-control. Without it, even the most talented students may fail to reach their potential. It creates a structured routine that reduces stress and increases productivity. In essence, discipline is the bridge between goals and accomplishment.",
        marks: 3, section: "Section C", type: "Short Answer",
        solution: "The paragraph should cover time management, focus, character building, responsibility, balance, and the connection between discipline and success.",
      },
      {
        question: "Explain the theme of courage in 'Nelson Mandela: Long Walk to Freedom'.",
        answer: "The chapter highlights Mandela's courage in fighting apartheid despite 27 years of imprisonment. It also speaks of the courage of ordinary South Africans who endured oppression. Mandela's vision of a rainbow nation shows moral courage.",
        marks: 3, section: "Section C", type: "Short Answer",
        solution: "Mandela's unwavering commitment to justice, collective courage of South Africans, and his ability to forgive oppressors show the highest moral courage.",
      },
    ],
    "Section D": [
      {
        question: "Compare and contrast the characters of the two pilots in 'Two Stories About Flying'. How do they overcome their fears?",
        answer: "In 'His First Flight', the young seagull overcomes fear through hunger and parental encouragement, discovering his natural ability. In 'The Black Aeroplane', the narrator faces a storm and is guided by a mysterious aeroplane to safety. The seagull's fear is overcome by necessity and instinct; the narrator's by trust in an unknown rescuer. Both show that courage is needed to face the unknown.",
        marks: 5, section: "Section D", type: "Long Answer",
        solution: "The seagull learns self-reliance through hunger and instinct; the narrator learns faith in the unknown. Both show that overcoming fear requires courage, and the unknown can lead to growth.",
      },
      {
        question: "Write an essay (200-250 words) on: 'The Impact of Technology on Education'.",
        answer: "Technology has transformed education in unprecedented ways. The traditional classroom now includes smart boards, online resources, and virtual learning platforms. Students can access information instantly, collaborate globally, and learn at their own pace. However, technology also presents challenges. Excessive screen time can affect health, and the digital divide means unequal access. Over-reliance may reduce critical thinking and face-to-face communication. Despite these challenges, the benefits outweigh the drawbacks when used judiciously. During COVID-19, technology proved essential by keeping education alive through online classes. The future lies in a blended approach — combining the best of traditional teaching with digital tools. Teachers remain irreplaceable as guides and mentors, but technology empowers them with better resources. In conclusion, technology is a powerful ally in education, but it must enhance, not replace, the human element of teaching.",
        marks: 5, section: "Section D", type: "Long Answer",
        solution: "A good essay should include: introduction, benefits (access, collaboration, personalization), challenges (health, digital divide), balanced approach, and conclusion.",
      },
      {
        question: "Analyse the poem 'The Ball Poem' by John Berryman. What is the deeper meaning of the boy losing his ball?",
        answer: "The loss of a ball represents the universal experience of losing something precious and irreplaceable. The poet uses this simple incident to teach a profound lesson about loss, responsibility, and growing up. The boy is not to be given another ball, because the lost ball represents the first real loss of his life. The poem shows that material things are transient, and true maturity comes from accepting loss without being broken by it.",
        marks: 5, section: "Section D", type: "Long Answer",
        solution: "Berryman uses the ball as a metaphor for all that we lose in life. The central theme is the 'epistemology of loss' — learning to accept that loss is inevitable and irreplaceable.",
      },
    ],
    "Section E": [
      {
        question: "Read the passage about climate change and answer:\n\n(i) What are the main causes mentioned? (ii) List two effects. (iii) Suggest two individual actions to combat it.",
        answer: "(i) Greenhouse gas emissions. (ii) Extreme weather events and rising sea levels. (iii) Reducing energy consumption and using public transport.",
        marks: 4, section: "Section E", type: "Case-Study",
        solution: "Causes: greenhouse gas emissions. Effects: extreme weather, rising sea levels, ecosystem disruption. Actions: reduce energy use, use public transport, plant trees.",
      },
      {
        question: "Read the passage about the RTE Act and answer:\n\n(i) What does the RTE Act guarantee? (ii) Name two provisions. (iii) Mention two challenges in implementation.",
        answer: "(i) Free and compulsory education for children aged 6-14. (ii) Free education and prohibition of discrimination. (iii) Quality of education and high dropout rates.",
        marks: 4, section: "Section E", type: "Case-Study",
        solution: "RTE guarantees education for children 6-14. Provisions: free education, no discrimination, infrastructure standards. Challenges: quality, dropout rates, unequal rural access.",
      },
      {
        question: "Read the passage about social media and answer:\n\n(i) What are two benefits? (ii) Name two negative effects. (iii) Suggest two measures to mitigate risks.",
        answer: "(i) Connecting people globally and providing platforms for expression. (ii) Mental health issues and cyberbullying. (iii) Responsible use and digital literacy.",
        marks: 4, section: "Section E", type: "Case-Study",
        solution: "Benefits: global connectivity, self-expression. Negative effects: anxiety, cyberbullying, misinformation. Mitigation: responsible use, digital literacy, parental guidance.",
      },
    ],
  },
  Hindi: {
    "Section A": [
      {
        question: "'आत्मकथ्य' कविता के रचयिता हैं:\nA) जयशंकर प्रसाद\nB) सूर्यकांत त्रिपाठी निराला\nC) नागार्जुन\nD) गिरिजाकुमार माथुर",
        options: ["A) जयशंकर प्रसाद", "B) सूर्यकांत त्रिपाठी निराला", "C) नागार्जुन", "D) गिरिजाकुमार माथुर"],
        answer: "A) जयशंकर प्रसाद",
        marks: 1, section: "Section A", type: "MCQ",
        solution: "'आत्मकथ्य' कविता जयशंकर प्रसाद द्वारा रचित है।",
      },
      {
        question: "'कन्यादान' कविता किसने लिखी?\nA) ऋतुराज\nB) राजेंद्र अवस्थी\nC) नरेंद्र कोहली\nD) धर्मवीर भारती",
        options: ["A) ऋतुराज", "B) राजेंद्र अवस्थी", "C) नरेंद्र कोहली", "D) धर्मवीर भारती"],
        answer: "A) ऋतुराज",
        marks: 1, section: "Section A", type: "MCQ",
        solution: "'कन्यादान' कविता ऋतुराज द्वारा रचित है।",
      },
      {
        question: "'बालगोबिन भगत' पाठ के लेखक हैं:\nA) स्वयं प्रकाश\nB) यशपाल\nC) मन्नू भंडारी\nD) भदंत आनंद कौसल्यायन",
        options: ["A) स्वयं प्रकाश", "B) यशपाल", "C) मन्नू भंडारी", "D) भदंत आनंद कौसल्यायन"],
        answer: "A) स्वयं प्रकाश",
        marks: 1, section: "Section A", type: "MCQ",
        solution: "'बालगोबिन भगत' पाठ स्वयं प्रकाश द्वारा रचित है।",
      },
      {
        question: "Assertion (A): 'कर चले हम फ़िदा' एक देशभक्ति गीत है।\nReason (R): इसमें देश के लिए अपना जीवन न्योछावर करने का भाव है।",
        options: ["A) Both A and R are true and R is the correct explanation of A", "B) Both A and R are true but R is NOT the correct explanation of A", "C) A is true but R is false", "D) A is false but R is true"],
        answer: "A) Both A and R are true and R is the correct explanation of A",
        marks: 1, section: "Section A", type: "Assertion-Reason",
        solution: "धर्मवीर भारती की कविता देशभक्ति का गीत है, जिसमें सैनिक देश के लिए जीवन न्योछावर करने का संकल्प व्यक्त करता है।",
      },
      {
        question: "'यह दंतुरहित मुस्कान' कविता के रचयिता हैं:\nA) नागार्जुन\nB) सूरदास\nC) तुलसीदास\nD) देव",
        options: ["A) नागार्जुन", "B) सूरदास", "C) तुलसीदास", "D) देव"],
        answer: "A) नागार्जुन",
        marks: 1, section: "Section A", type: "MCQ",
        solution: "'यह दंतुरहित मुस्कान' कविता नागार्जुन द्वारा रचित है।",
      },
      {
        question: "निम्नलिखित में से कौन-सा शब्द 'विद्यालय' का पर्यायवाची नहीं है?\nA) पाठशाला\nB) गुरुकुल\nC) उद्यान\nD) विद्यामंदिर",
        options: ["A) पाठशाला", "B) गुरुकुल", "C) उद्यान", "D) विद्यामंदिर"],
        answer: "C) उद्यान",
        marks: 1, section: "Section A", type: "MCQ",
        solution: "'उद्यान' का अर्थ बगीचा है, जो विद्यालय का पर्यायवाची नहीं है।",
      },
      {
        question: "Assertion (A): निराला जी को 'महाप्राण' नाम दिया गया।\nReason (R): उनकी कविताओं में प्राणों का स्पंदन झलकता है।",
        options: ["A) Both A and R are true and R is the correct explanation of A", "B) Both A and R are true but R is NOT the correct explanation of A", "C) A is true but R is false", "D) A is false but R is true"],
        answer: "B) Both A and R are true but R is NOT the correct explanation of A",
        marks: 1, section: "Section A", type: "Assertion-Reason",
        solution: "निराला जी को 'महाप्राण' कहा जाता है और उनकी कविताओं में प्राणों का स्पंदन है, परंतु R, A की व्याख्या नहीं करता।",
      },
      {
        question: "'छाया हरे शब्दों का' कविता के रचयिता हैं:\nA) गिरिजाकुमार माथुर\nB) सूर्यकांत त्रिपाठी निराला\nC) नागार्जुन\nD) ऋतुराज",
        options: ["A) गिरिजाकुमार माथुर", "B) सूर्यकांत त्रिपाठी निराला", "C) नागार्जुन", "D) ऋतुराज"],
        answer: "A) गिरिजाकुमार माथुर",
        marks: 1, section: "Section A", type: "MCQ",
        solution: "'छाया हरे शब्दों का' कविता गिरिजाकुमार माथुर द्वारा रचित है।",
      },
    ],
    "Section B": [
      {
        question: "'स्त्री शिक्षा' निबंध में महावीर प्रसाद द्विवेदी का मुख्य तर्क क्या है?",
        answer: "द्विवेदी जी तर्क देते हैं कि स्त्री-शिक्षा आवश्यक है क्योंकि स्त्रियाँ पुरुषों के समान ही बुद्धिमान और सक्षम हैं। शिक्षित स्त्रियाँ समाज और परिवार दोनों का उत्थान करती हैं।",
        marks: 2, section: "Section B", type: "Very Short Answer",
        solution: "द्विवेदी जी तर्क देते हैं कि स्त्री-शिक्षा समाज के उत्थान के लिए आवश्यक है। वे रूढ़िवादी तर्कों का खंडन करते हैं।",
      },
      {
        question: "'नेताजी का चश्मा' कहानी में नेताजी के चश्मे का क्या महत्व है?",
        answer: "नेताजी का चश्मा एक प्रतीक है — यह नेताजी के व्यक्तित्व, उनकी दूरदर्शिता और उनके प्रति लोगों के सम्मान का प्रतिनिधित्व करता है।",
        marks: 2, section: "Section B", type: "Very Short Answer",
        solution: "चश्मा नेताजी सुभाष चंद्र बोस के व्यक्तित्व का प्रतीक है।",
      },
      {
        question: "'लखनवी रसूल' पाठ में लखनवी तहज़ीब की क्या विशेषता बताई गई है?",
        answer: "लखनवी तहज़ीब में विनम्रता, शिष्टाचार, और जीवन के प्रति नरमी और संस्कार की झलक मिलती है।",
        marks: 2, section: "Section B", type: "Very Short Answer",
        solution: "लखनवी तहज़ीब की विशेषताएँ — विनम्रता, शालीनता, मिठास, और जीवन के प्रति संवेदनशील दृष्टि।",
      },
      {
        question: "'एहसास' कविता में कवि क्या भाव व्यक्त करते हैं?",
        answer: "जाबिर हुसैन की 'एहसास' कविता में मानवीय संवेदनाओं, रिश्तों के गहरे एहसास और जीवन के सूक्ष्म अनुभवों का वर्णन है।",
        marks: 2, section: "Section B", type: "Very Short Answer",
        solution: "कवि जीवन के सूक्ष्म अनुभवों, मानवीय संवेदनाओं और रिश्तों की गहराई को व्यक्त करते हैं।",
      },
    ],
    "Section C": [
      {
        question: "'कन्यादान' कविता में ऋतुराज ने स्त्री-शिक्षा के प्रति कैसा दृष्टिकोण प्रस्तुत किया है?",
        answer: "ऋतुराज 'कन्यादान' में स्त्री-शिक्षा का प्रबल पक्षधर हैं। वे तर्क देते हैं कि बिना शिक्षा के कन्या-दान अधूरा है। शिक्षा से सशक्त स्त्री ही समाज का वास्तविक उत्थान कर सकती है।",
        marks: 3, section: "Section C", type: "Short Answer",
        solution: "ऋतुराज का दृष्टिकोण है कि कन्यादान के साथ ज्ञान-दान भी आवश्यक है। शिक्षित स्त्री स्वतंत्र और सशक्त बनती है।",
      },
      {
        question: "'बालगोबिन भगत' पाठ में बालगोबिन भगत के चरित्र की विशेषताओं का वर्णन करें।",
        answer: "बालगोबिन भगत एक साधारण जीवन जीने वाले संत-व्यक्ति थे। वे दयालु, निस्वार्थ, और लोगों के प्रति प्रेमशील थे। उनका जीवन सरलता और त्याग का प्रतीक था।",
        marks: 3, section: "Section C", type: "Short Answer",
        solution: "बालगोबिन भगत की विशेषताएँ: सरल जीवन, निस्वार्थ सेवा-भाव, दयालुता, धन-मोह से मुक्ति।",
      },
      {
        question: "'स्त्री शिक्षा के विरोधी कुतर्कों का खंडन' पाठ में किन कुतर्कों का खंडन किया गया है?",
        answer: "सक्सेना जी ने इन कुतर्कों का खंडन किया: स्त्रियाँ अबला हैं, शिक्षा से चरित्र बिगड़ेगा, घर-गृहस्थी छोड़ देंगी।",
        marks: 3, section: "Section C", type: "Short Answer",
        solution: "सर्वेश्वर दयाल सक्सेना ने इन कुतर्कों का तार्किक खंडन किया: स्त्रियाँ बुद्धि में कमज़ोर नहीं, शिक्षा से चरित्र नहीं बिगड़ता।",
      },
      {
        question: "'एक कहानी यह भी' पाठ में मन्नू भंडारी ने स्त्री-पुरुष संबंधों को कैसे दर्शाया है?",
        answer: "मन्नू भंडारी ने स्त्री-पुरुष संबंधों की जटिलता, संवेदनाओं और सामाजिक दबावों को यथार्थवादी ढंग से दर्शाया है।",
        marks: 3, section: "Section C", type: "Short Answer",
        solution: "मन्नू भंडारी ने व्यक्तिगत संघर्ष, सामाजिक दबाव, और भावनात्मक जटिलता को दर्शाया है।",
      },
    ],
    "Section D": [
      {
        question: "'कर चले हम फ़िदा' कविता का विस्तार से भावार्थ स्पष्ट करें। इसमें देशभक्ति का चित्रण किस प्रकार हुआ है?",
        answer: "धर्मवीर भारती की 'कर चले हम फ़िदा' एक देशभक्ति का गीत है। इसमें सैनिक देश की रक्षा के लिए अपना जीवन न्योछावर करने का संकल्प व्यक्त करता है। यह कविता राष्ट्र-प्रेम, त्याग, और वीरता का संदेश देती है।",
        marks: 5, section: "Section D", type: "Long Answer",
        solution: "सैनिक देश की रक्षा हेतु अपना जीवन न्योछावर करने को तैयार है। धर्मवीर भारती ने वीर-रस और राष्ट्रीय चेतना का सुंदर संगम प्रस्तुत किया है।",
      },
      {
        question: "'संस्कृति' निबंध में भदंत आनंद कौसल्यायन ने संस्कृति को किस रूप में परिभाषित किया है?",
        answer: "कौसल्यायन जी के अनुसार संस्कृति का अर्थ केवल रहन-सहन नहीं है। संस्कृति वह विद्या है जो मनुष्य को सभ्य, संवेदनशील और विवेकशील बनाती है। संस्कृति विचारों और दृष्टिकोण में निहित है।",
        marks: 5, section: "Section D", type: "Long Answer",
        solution: "कौसल्यायन के अनुसार संस्कृति = सम्यक + कृति = उत्तम कर्म। यह बाह्य आडंबर नहीं, बल्कि आंतरिक चेतना है।",
      },
      {
        question: "'नौबतखाने में इबादत' पाठ में यतीन्द्र मिश्र ने संगीत और आध्यात्मिकता के संबंध को किस प्रकार प्रस्तुत किया है?",
        answer: "यतीन्द्र मिश्र के अनुसार संगीत और आध्यात्मिकता एक ही सत्य के दो रूप हैं। नौबतखाने में बजने वाले वाद्य-यंत्र ईश्वर की आराधना करते हैं। संगीत एक इबादत है, जो आत्मा को परमात्मा से जोड़ती है।",
        marks: 5, section: "Section D", type: "Long Answer",
        solution: "संगीत को इबादत (प्रार्थना) के रूप में दर्शाया गया है। संगीत आत्मा को परमात्मा से जोड़ता है।",
      },
    ],
    "Section E": [
      {
        question: "गद्यांश पढ़कर उत्तर दें:\n\nशिक्षा मनुष्य को जीवन जीने की कला सिखाती है। एक शिक्षित व्यक्ति न केवल अपना विकास करता है, बल्कि समाज का भी उत्थान करता है।\n\n(i) शिक्षा का मुख्य उद्देश्य क्या है? (ii) शिक्षित व्यक्ति के दो लाभ बताइए। (iii) शिक्षा के बिना व्यक्ति की स्थिति कैसी होती है?",
        answer: "(i) जीवन जीने की कला सिखाना। (ii) व्यक्तिगत विकास और समाज का उत्थान। (iii) अंधकार में जीवन व्यतीत करता है।",
        marks: 4, section: "Section E", type: "Case-Study",
        solution: "शिक्षा जीवन जीने की कला सिखाती है। लाभ: चेतना-विवेक-संवेदना का विकास, समाज-उत्थान। बिना शिक्षा व्यक्ति अंधकार में जीता है।",
      },
      {
        question: "काव्यांश पढ़कर उत्तर दें:\n\n'यह दंतुरहित मुस्कान,\nइस मुस्कान की जय हो...'\n\n(i) कवि किस मुस्कान की जय कहता है? (ii) इस मुस्कान के लिए कवि का भाव क्या है? (iii) इस काव्यांश में किस भाव की अभिव्यक्ति है?",
        answer: "(i) बच्चों की दंतुरहित मुस्कान। (ii) कुछ भी कर जाने का जोश। (iii) वात्सल्य-रस की अभिव्यक्ति।",
        marks: 4, section: "Section E", type: "Case-Study",
        solution: "नागार्जुन बच्चों की बिना दांतों वाली मुस्कान की जय कहते हैं। वात्सल्य-रस (बच्चों के प्रति प्रेम) की सुंदर अभिव्यक्ति है।",
      },
      {
        question: "गद्यांश पढ़कर उत्तर दें:\n\nप्रौढ्यावस्था में व्यक्ति अपने अनुभवों के आधार पर जीवन को समझता है।\n\n(i) प्रौढ्यावस्था में व्यक्ति जीवन को कैसे समझता है? (ii) सफलता कैसे प्राप्त होती है? (iii) व्यक्ति अपनी गलतियों से क्या सीखता है?",
        answer: "(i) अनुभवों के आधार पर। (ii) निरंतर प्रयास से। (iii) गलतियों से सीखकर आगे बढ़ता है।",
        marks: 4, section: "Section E", type: "Case-Study",
        solution: "अनुभवों के आधार पर जीवन को समझता है। सफलता निरंतर प्रयास से मिलती है। गलतियों से सीखकर आत्म-सुधार करता है।",
      },
    ],
  },
};

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickQuestions<T>(arr: T[], n: number): T[] {
  if (arr.length >= n) return shuffle(arr).slice(0, n);
  const result: T[] = [];
  for (let i = 0; i < n; i++) result.push(arr[i % arr.length]);
  return result;
}

let _uid = 0;
function uid(): string {
  _uid += 1;
  return `q_${Date.now()}_${_uid}`;
}

function toQuestion(bq: BankQuestion): Question {
  return {
    id: uid(),
    question: bq.question,
    options: bq.options ?? null,
    answer: bq.answer,
    marks: bq.marks,
    section: bq.section,
    type: bq.type,
    solution: bq.solution,
  };
}

export function generateLocalPaper(
  config: TestConfig
): { sections: PaperSection[]; provider: string } {
  const bank = QUESTION_BANK[config.subject] ?? QUESTION_BANK["Science"];
  const marks = config.totalMarks;

  const a = Math.max(2, Math.round((marks * 0.25) / 1));
  const b = Math.max(1, Math.round((marks * 0.15) / 2));
  const c = Math.max(1, Math.round((marks * 0.2) / 3));
  const d = Math.max(1, Math.round((marks * 0.25) / 5));
  const e = Math.max(1, Math.round((marks * 0.15) / 4));

  const sections: PaperSection[] = CBSE_SECTIONS.map((sec) => {
    const pool = bank[sec.name] ?? [];
    const count = sec.name === "Section A" ? a
      : sec.name === "Section B" ? b
      : sec.name === "Section C" ? c
      : sec.name === "Section D" ? d
      : e;
    return {
      name: sec.name,
      label: sec.label,
      marksPerQuestion: sec.marksPerQuestion,
      questions: pickQuestions(pool, count).map(toQuestion),
    };
  });

  return { sections, provider: "Local Bank" };
}

export function swapLocalQuestion(
  config: TestConfig,
  section: string,
  marks: number
): { question: Question; provider: string } {
  const bank = QUESTION_BANK[config.subject] ?? QUESTION_BANK["Science"];
  const pool = bank[section] ?? [];
  const bq = shuffle(pool)[0] ?? pool[0];
  return { question: toQuestion(bq), provider: "Local Bank" };
}

export function generateLocalSolutions(
  questions: Array<{ question: string; marks: number; section: string }>
): Record<string, string> {
  const map: Record<string, string> = {};
  for (const q of questions) {
    map[q.question] = "See the answer key provided with the question.";
  }
  return map;
}

export { calcTotalMarks, calcTimeMinutes };
