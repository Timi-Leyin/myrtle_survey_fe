export interface Question {
  id: string;
  dimension: string;
  section: string;
  sectionNumber: number;
  options: Array<{ value: string; label: string }>;
}

export const SECTIONS = [
  {
    id: "section-1",
    title: "SECTION 1 — YOUR FINANCIAL PROFILE",
    number: 1,
    description: "3 Questions",
  },
  {
    id: "section-2",
    title: "SECTION 2 — NET WORTH INDICATORS",
    number: 2,
    description: "4 Questions",
  },
  {
    id: "section-3",
    title: "SECTION 3 — YOUR INVESTMENT BEHAVIOUR & RISK STYLE",
    number: 3,
    description: "5 Questions",
  },
  {
    id: "section-4",
    title: "SECTION 4 — SUITABILITY",
    number: 4,
    description: "2 Questions",
  },
  {
    id: "section-5",
    title: "SECTION 5 — COMPLIANCE & RELATIONSHIP",
    number: 5,
    description: "1 Question",
  },
];

export const QUESTIONS: Question[] = [
  // SECTION 1 — YOUR FINANCIAL PROFILE (3 Questions)
  {
    id: "Q1",
    dimension: "What is your approximate monthly or annual income?",
    section: "SECTION 1 — YOUR FINANCIAL PROFILE",
    sectionNumber: 1,
    options: [
      { value: "A", label: "Below ₦5m per year" },
      { value: "B", label: "₦5m–₦20m" },
      { value: "C", label: "₦20m–₦40m" },
      { value: "D", label: "Above ₦40m" },
    ],
  },
  {
    id: "Q2",
    dimension: "What stage best describes you today?",
    section: "SECTION 1 — YOUR FINANCIAL PROFILE",
    sectionNumber: 1,
    options: [
      { value: "A", label: "Building stability and structure" },
      { value: "B", label: "Growing income & making long-term plans" },
      { value: "C", label: "Expanding wealth & planning legacy" },
      { value: "D", label: "Managing multi-generational wealth" },
    ],
  },
  {
    id: "Q3",
    dimension: "How long do you intend to invest the funds you are discussing today?",
    section: "SECTION 1 — YOUR FINANCIAL PROFILE",
    sectionNumber: 1,
    options: [
      { value: "A", label: "Less than 1 year" },
      { value: "B", label: "1–3 years" },
      { value: "C", label: "3–5 years" },
      { value: "D", label: "5+ years" },
    ],
  },

  // SECTION 2 — NET WORTH INDICATORS (4 Questions)
  {
    id: "Q4",
    dimension: "Approximate value of your cash & investments?",
    section: "SECTION 2 — NET WORTH INDICATORS",
    sectionNumber: 2,
    options: [
      { value: "A", label: "Below ₦5m" },
      { value: "B", label: "₦5m–₦50m" },
      { value: "C", label: "₦50m–₦100m" },
      { value: "D", label: "Above ₦100m–₦500m+" },
    ],
  },
  {
    id: "Q5",
    dimension: "Approximate value of your real estate or land assets?",
    section: "SECTION 2 — NET WORTH INDICATORS",
    sectionNumber: 2,
    options: [
      { value: "A", label: "None" },
      { value: "B", label: "Below ₦25m" },
      { value: "C", label: "₦25m–₦250m" },
      { value: "D", label: "Above ₦250m–₦500m+" },
    ],
  },
  {
    id: "Q6",
    dimension: "Approximate value of your business or income-generating assets?",
    section: "SECTION 2 — NET WORTH INDICATORS",
    sectionNumber: 2,
    options: [
      { value: "A", label: "Not applicable" },
      { value: "B", label: "Below ₦25m" },
      { value: "C", label: "₦25m–₦250m" },
      { value: "D", label: "Above ₦250m–₦500m+" },
    ],
  },
  {
    id: "Q7",
    dimension: "Total outstanding debts or obligations?",
    section: "SECTION 2 — NET WORTH INDICATORS",
    sectionNumber: 2,
    options: [
      { value: "A", label: "None" },
      { value: "B", label: "Below ₦25m" },
      { value: "C", label: "₦25m–₦250m" },
      { value: "D", label: "Above ₦250m–₦500m+" },
    ],
  },

  // SECTION 3 — YOUR INVESTMENT BEHAVIOUR & RISK STYLE (5 Questions)
  {
    id: "Q8",
    dimension: "Which of these best describes your primary goal?",
    section: "SECTION 3 — YOUR INVESTMENT BEHAVIOUR & RISK STYLE",
    sectionNumber: 3,
    options: [
      { value: "A", label: "Safety and liquidity" },
      { value: "B", label: "Steady growth" },
      { value: "C", label: "Aggressive long-term growth" },
      { value: "D", label: "Legacy building" },
    ],
  },
  {
    id: "Q9",
    dimension: "If your investment dropped by 10% temporarily, what would you likely do?",
    section: "SECTION 3 — YOUR INVESTMENT BEHAVIOUR & RISK STYLE",
    sectionNumber: 3,
    options: [
      { value: "A", label: "Buy more" },
      { value: "B", label: "Stay invested" },
      { value: "C", label: "Reduce exposure" },
      { value: "D", label: "Exit immediately" },
    ],
  },
  {
    id: "Q10",
    dimension: "How comfortable are you with fluctuations in your investment value?",
    section: "SECTION 3 — YOUR INVESTMENT BEHAVIOUR & RISK STYLE",
    sectionNumber: 3,
    options: [
      { value: "A", label: "Very comfortable" },
      { value: "B", label: "Moderately comfortable" },
      { value: "C", label: "Slightly uncomfortable" },
      { value: "D", label: "Not comfortable at all" },
    ],
  },
  {
    id: "Q11",
    dimension: "How much loss can you tolerate in a bad market year?",
    section: "SECTION 3 — YOUR INVESTMENT BEHAVIOUR & RISK STYLE",
    sectionNumber: 3,
    options: [
      { value: "A", label: "0% (No loss)" },
      { value: "B", label: "Up to 5%" },
      { value: "C", label: "Up to 10%" },
      { value: "D", label: "Above 10%" },
    ],
  },
  {
    id: "Q12",
    dimension: "Which best describes your financial buffer?",
    section: "SECTION 3 — YOUR INVESTMENT BEHAVIOUR & RISK STYLE",
    sectionNumber: 3,
    options: [
      { value: "A", label: "Limited buffer — I may need liquidity often" },
      { value: "B", label: "Moderate buffer — I can stay invested" },
      { value: "C", label: "Strong buffer — little need for liquidity" },
      { value: "D", label: "Very strong buffer — I invest for the long game" },
    ],
  },

  // SECTION 4 — SUITABILITY (2 Questions)
  {
    id: "Q13",
    dimension: "What is your level of investment experience?",
    section: "SECTION 4 — SUITABILITY",
    sectionNumber: 4,
    options: [
      { value: "A", label: "None" },
      { value: "B", label: "Beginner" },
      { value: "C", label: "Moderate" },
      { value: "D", label: "Experienced" },
    ],
  },
  {
    id: "Q14",
    dimension: "How soon might you need access to the funds you want to invest?",
    section: "SECTION 4 — SUITABILITY",
    sectionNumber: 4,
    options: [
      { value: "A", label: "Anytime" },
      { value: "B", label: "Within 6 months" },
      { value: "C", label: "1–3 years" },
      { value: "D", label: "No immediate need" },
    ],
  },

  // SECTION 5 — COMPLIANCE & RELATIONSHIP (1 Question)
  {
    id: "Q15",
    dimension: "What is the source of funds for this investment?",
    section: "SECTION 5 — COMPLIANCE & RELATIONSHIP",
    sectionNumber: 5,
    options: [
      { value: "salary", label: "Salary" },
      { value: "business", label: "Business Income" },
      { value: "investments", label: "Investments" },
      { value: "rental", label: "Rental Income" },
      { value: "other", label: "Others (please state)" },
    ],
  },
];
