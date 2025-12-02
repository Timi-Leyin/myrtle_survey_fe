export interface Question {
  id: string;
  dimension: string;
  section: string;
  sectionNumber: number;
  options: Array<{ value: string; label: string }>;
  multiple?: boolean; // allow multi-select (checkboxes)
  type?: "single" | "multi" | "text";
}

export const SECTIONS = [
  {
    id: "section-1",
    title: "SECTION 1 — FINANCIAL PROFILE",
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
    title: "SECTION 3 — INVESTMENT BEHAVIOUR & RISK STYLE",
    number: 3,
    description: "7 Questions",
  },
  {
    id: "section-4",
    title: "SECTION 4 — COMPLIANCE & RELATIONSHIP DISCOVERY",
    number: 4,
    description: "2 Questions",
  },
];

export const QUESTIONS: Question[] = [
  // SECTION 1 — FINANCIAL PROFILE (3 Questions)
  {
    id: "Q1",
    dimension: "What is your approximate ANNUAL income?",
    section: "SECTION 1 — FINANCIAL PROFILE",
    sectionNumber: 1,
    options: [
      { value: "A", label: "Below ₦5m" },
      { value: "B", label: "₦5m–₦20m" },
      { value: "C", label: "₦20m–₦40m" },
      { value: "D", label: "₦40m–₦100m" },
      { value: "E", label: "₦100m–₦500m" },
      { value: "F", label: "Above ₦500m" },
    ],
  },
  {
    id: "Q2",
    dimension: "Which of these describe your current FINANCIAL STAGE?",
    section: "SECTION 1 — FINANCIAL PROFILE",
    sectionNumber: 1,
    multiple: true,
    type: "multi",
    options: [
      { value: "STG1", label: "Building stability" },
      { value: "STG2", label: "Growing income / expanding career or business" },
      { value: "STG3", label: "Preparing long-term financial plans" },
      { value: "STG4", label: "Wealth expansion & asset consolidation" },
      { value: "STG5", label: "Preparing for legacy transfer / succession" },
      { value: "STG6", label: "Managing multi-generational wealth" },
    ],
  },
  {
    id: "Q3",
    dimension: "What is your INVESTMENT HORIZON for this fund?",
    section: "SECTION 1 — FINANCIAL PROFILE",
    sectionNumber: 1,
    options: [
      { value: "A", label: "Short-term (0–12 months)" },
      { value: "B", label: "Medium-term (1–3 years)" },
      { value: "C", label: "Long-term (3–5 years)" },
      { value: "D", label: "Very long-term (5+ years)" },
    ],
  },

  // SECTION 2 — NET WORTH INDICATORS (4 Questions)
  {
    id: "Q4",
    dimension: "Cash, Investments & Liquid Assets (₦ equivalent)",
    section: "SECTION 2 — NET WORTH INDICATORS",
    sectionNumber: 2,
    options: [
      { value: "A", label: "Below ₦5m" },
      { value: "B", label: "₦5m–₦50m" },
      { value: "C", label: "₦50m–₦250m" },
      { value: "D", label: "₦250m–₦1bn" },
      { value: "E", label: "Above ₦1bn" },
    ],
  },
  {
    id: "Q5",
    dimension: "Real Estate / Land Holdings",
    section: "SECTION 2 — NET WORTH INDICATORS",
    sectionNumber: 2,
    options: [
      { value: "A", label: "None" },
      { value: "B", label: "Below ₦50m" },
      { value: "C", label: "₦50m–₦250m" },
      { value: "D", label: "₦250m–₦1bn" },
      { value: "E", label: "Above ₦1bn" },
    ],
  },
  {
    id: "Q6",
    dimension: "Business / Income-Generating Assets",
    section: "SECTION 2 — NET WORTH INDICATORS",
    sectionNumber: 2,
    options: [
      { value: "A", label: "None" },
      { value: "B", label: "Below ₦50m" },
      { value: "C", label: "₦50m–₦250m" },
      { value: "D", label: "₦250m–₦1bn" },
      { value: "E", label: "Above ₦1bn" },
    ],
  },
  {
    id: "Q7",
    dimension: "Total Debts / Financial Obligations",
    section: "SECTION 2 — NET WORTH INDICATORS",
    sectionNumber: 2,
    options: [
      { value: "A", label: "None" },
      { value: "B", label: "Below ₦25m" },
      { value: "C", label: "₦25m–₦100m" },
      { value: "D", label: "₦100m–₦500m" },
      { value: "E", label: "Above ₦500m" },
    ],
  },

  // SECTION 3 — INVESTMENT BEHAVIOUR & RISK STYLE (7 Questions)
  {
    id: "Q8",
    dimension: "What are your PRIMARY investment goals?",
    section: "SECTION 3 — INVESTMENT BEHAVIOUR & RISK STYLE",
    sectionNumber: 3,
    multiple: true,
    type: "multi",
    options: [
      { value: "T1", label: "Capital preservation / safety" },
      { value: "T2", label: "Steady income" },
      { value: "T3", label: "Medium-term growth" },
      { value: "T4", label: "Long-term aggressive growth" },
      { value: "T5", label: "Legacy building" },
      { value: "T6", label: "FX protection / currency diversification" },
      { value: "T7", label: "Wealth transfer & continuity" },
    ],
  },
  {
    id: "Q9",
    dimension: "If your investment DROPPED by 10% temporarily, what would you likely do?",
    section: "SECTION 3 — INVESTMENT BEHAVIOUR & RISK STYLE",
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
    dimension: "How comfortable are you with market FLUCTUATIONS?",
    section: "SECTION 3 — INVESTMENT BEHAVIOUR & RISK STYLE",
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
    dimension: "How much LOSS can you tolerate in a bad year?",
    section: "SECTION 3 — INVESTMENT BEHAVIOUR & RISK STYLE",
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
    dimension: "How strong is your FINANCIAL BUFFER?",
    section: "SECTION 3 — INVESTMENT BEHAVIOUR & RISK STYLE",
    sectionNumber: 3,
    options: [
      { value: "A", label: "Limited buffer — I may need liquidity often" },
      { value: "B", label: "Moderate buffer — I can stay invested" },
      { value: "C", label: "Strong buffer — little need for liquidity" },
      { value: "D", label: "Very strong buffer — I invest for the long game" },
    ],
  },

  {
    id: "Q13",
    dimension: "What is your level of INVESTMENT EXPERIENCE?",
    section: "SECTION 3 — INVESTMENT BEHAVIOUR & RISK STYLE",
    sectionNumber: 3,
    options: [
      { value: "A", label: "None" },
      { value: "B", label: "Beginner" },
      { value: "C", label: "Moderate" },
      { value: "D", label: "Experienced" },
    ],
  },
  {
    id: "Q14",
    dimension: "What is your LIQUIDITY REQUIREMENT for these funds?",
    section: "SECTION 3 — INVESTMENT BEHAVIOUR & RISK STYLE",
    sectionNumber: 3,
    options: [
      { value: "A", label: "Very high liquidity (may need access anytime)" },
      { value: "B", label: "Moderate liquidity (6–12 months)" },
      { value: "C", label: "Low liquidity (1–3 years)" },
      { value: "D", label: "No liquidity need (3+ years)" },
    ],
  },

  // SECTION 4 — COMPLIANCE & RELATIONSHIP DISCOVERY (2 Questions)
  {
    id: "Q15",
    dimension: "What are your SOURCES OF FUNDS for this investment?",
    section: "SECTION 4 — COMPLIANCE & RELATIONSHIP DISCOVERY",
    sectionNumber: 4,
    multiple: true,
    type: "multi",
    options: [
      { value: "SRC1", label: "Salary / Employment Income" },
      { value: "SRC2", label: "Business Income" },
      { value: "SRC3", label: "Rental Income" },
      { value: "SRC4", label: "Investment Income (Dividends, Interest)" },
      { value: "SRC5", label: "Asset Sale" },
      { value: "SRC6", label: "Family Support / Gifts" },
      { value: "SRC7", label: "Diaspora Remittance" },
      { value: "SRC_OTHER", label: "Others (please specify)" },
    ],
  },
  {
    id: "Q16",
    dimension:
      "What do you wish your Advisor understood about you or your money journey?",
    section: "SECTION 4 — COMPLIANCE & RELATIONSHIP DISCOVERY",
    sectionNumber: 4,
    options: [],
    type: "text",
  },
];
