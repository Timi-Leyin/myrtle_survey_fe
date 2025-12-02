import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import { QUESTIONS } from "../data/questions";
import type { UserInfo, QuestionnaireAnswers } from "../hooks/useQuestionnaire";
import type { QuestionnaireAnalysis } from "../services/api";

interface CompletionPDFProps {
  userInfo: UserInfo;
  answers: QuestionnaireAnswers;
  analysis: QuestionnaireAnalysis | null;
}

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 11,
    fontFamily: "Helvetica",
  },
  header: {
    marginBottom: 30,
    borderBottom: "2 solid #27DC85",
    paddingBottom: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#27DC85",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: "#666666",
    marginBottom: 10,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#27DC85",
    marginBottom: 10,
    borderBottom: "1 solid #27DC85",
    paddingBottom: 5,
  },
  row: {
    flexDirection: "row",
    marginBottom: 8,
  },
  label: {
    width: "40%",
    fontWeight: "bold",
    color: "#666666",
  },
  value: {
    width: "60%",
    color: "#000000",
  },
  questionItem: {
    marginBottom: 10,
    paddingLeft: 10,
    borderLeft: "2 solid #e5e7eb",
  },
  questionText: {
    fontSize: 10,
    fontWeight: "bold",
    marginBottom: 3,
    color: "#333333",
  },
  answerText: {
    fontSize: 10,
    color: "#666666",
  },
  analysisCard: {
    backgroundColor: "#f0fdf4",
    padding: 15,
    marginBottom: 15,
    borderRadius: 5,
    border: "1 solid #27DC85",
  },
  analysisTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#27DC85",
    marginBottom: 8,
  },
  analysisValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000000",
    marginBottom: 3,
  },
  narrative: {
    backgroundColor: "#f9fafb",
    padding: 15,
    marginTop: 15,
    borderRadius: 5,
    border: "1 solid #e5e7eb",
  },
  narrativeText: {
    fontSize: 10,
    lineHeight: 1.6,
    color: "#333333",
    whiteSpace: "pre-line",
  },
  bulletList: {
    marginLeft: 20,
    marginTop: 5,
  },
  bulletItem: {
    fontSize: 10,
    marginBottom: 4,
    color: "#333333",
  },
});

const getAnswerLabel = (
  questionId: string,
  answerValue: string,
  questions: typeof QUESTIONS
) => {
  const question = questions.find((q) => q.id === questionId);
  if (!question) return answerValue;

  if (questionId === "Q15" && (answerValue.startsWith("SRC_OTHER:") || answerValue.startsWith("other:"))) {
    const otherText = answerValue.replace("SRC_OTHER:", "").replace("other:", "").trim();
    return `Other: ${otherText || "(not specified)"}`;
  }

  const option = question.options.find((opt) => opt.value === answerValue);
  return option?.label || answerValue;
};

export const CompletionPDFDocument = ({
  userInfo,
  answers,
  analysis,
}: CompletionPDFProps) => {
  const formatCurrency = (value?: number) => {
    if (value === undefined || value === null) return "—";
    return `₦${value.toLocaleString()}`;
  };

  const getAnswerLabelForNarrative = (questionId: string) => {
    const answer = answers[questionId];
    if (!answer) return "Not specified";
    if (Array.isArray(answer)) {
      return answer
        .map((a) => getAnswerLabel(questionId, a, QUESTIONS))
        .join(", ");
    }
    return getAnswerLabel(questionId, answer as string, QUESTIONS);
  };

  const getPersonaDescription = (persona: string) => {
    if (persona.includes("Everyday Builder")) {
      return "You are in your foundational building phase — strengthening your income base, forming strong money habits, and preparing for bigger financial moves.";
    }
    if (persona.includes("Strategic Achiever")) {
      return "You are in your growth decade — expanding income streams, planning the future with intention, and building wealth structures that must work long-term.";
    }
    if (persona.includes("Private Wealth")) {
      return "You manage significant assets and decisions. Your focus is on preservation, legacy, governance, tax efficiency, and intergenerational continuity.";
    }
    return "Your financial identity is defined by your unique goals and behaviors.";
  };

  const getNetWorthBandLabel = (band: string) => {
    if (band.includes("Emerging")) return "Emerging";
    if (band.includes("Mass Affluent")) return "Mass Affluent";
    if (band.includes("Affluent")) return "Affluent";
    if (band.includes("Private Wealth")) return "Private Wealth";
    return band;
  };

  const getNetWorthBandDescription = (band: string) => {
    if (band.includes("Emerging")) {
      return "You are in the early asset-building stage.";
    }
    if (band.includes("Mass Affluent")) {
      return "You have a growing financial base and expanding opportunities.";
    }
    if (band.includes("Affluent")) {
      return "You have established assets and require structured growth and protection.";
    }
    if (band.includes("Private Wealth")) {
      return "You are at wealth-preservation, governance, and succession planning levels.";
    }
    return "";
  };

  const getRiskProfileDescription = (profile: string) => {
    const profileLower = profile.toLowerCase();
    if (profileLower.includes("conservative")) {
      return "You value capital protection and stability above growth.";
    }
    if (profileLower.includes("moderate")) {
      return "You balance safety with steady returns.";
    }
    if (profileLower.includes("growth")) {
      return "You are comfortable with calculated swings for higher long-term gains.";
    }
    if (profileLower.includes("aggressive")) {
      return "You seek strong long-term growth and are comfortable with volatility.";
    }
    return "";
  };

  const getPortfolioAllocation = () => {
    if (!analysis?.portfolio) return "Not available";
    if (analysis.portfolio.custom) {
      return "Custom allocation based on your unique profile";
    }
    const parts: string[] = [];
    if (analysis.portfolio.cash !== undefined) {
      parts.push(`Cash: ${analysis.portfolio.cash}%`);
    }
    if (analysis.portfolio.income !== undefined) {
      parts.push(`Income: ${analysis.portfolio.income}%`);
    }
    if (analysis.portfolio.growth !== undefined) {
      parts.push(`Growth: ${analysis.portfolio.growth}%`);
    }
    return parts.length > 0 ? parts.join(", ") : "Not available";
  };

  const getPersonaNarrative = (persona: string) => {
    if (persona.includes("Everyday Builder")) {
      return "building a strong financial foundation with disciplined habits and clear growth plans.";
    }
    if (persona.includes("Strategic Achiever")) {
      return "strategically expanding your wealth with intentional planning and long-term structures.";
    }
    if (persona.includes("Private Wealth")) {
      return "managing significant assets with focus on preservation, legacy, and intergenerational continuity.";
    }
    return "on a path to building confident, structured, long-term financial success.";
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>🌿 MYRTLE WEALTH BLUEPRINT™</Text>
          <Text style={styles.subtitle}>
            — Personalized Client Narrative
          </Text>
          <Text style={styles.subtitle}>
            Reimagining Wealth. Building Prosperity Together.
          </Text>
          <Text style={styles.subtitle}>
            Generated for {userInfo.fullName} on {new Date().toLocaleDateString()}
          </Text>
        </View>

        {/* Section 1: Financial Identity */}
        {analysis && (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                1. Your Financial Identity — Who You Are Today
              </Text>
              <Text style={styles.bulletItem}>
                Based on the information you shared, you fall into the{" "}
                <Text style={{ fontWeight: "bold", color: "#27DC85" }}>
                  {analysis.persona}
                </Text>{" "}
                segment.
              </Text>
              <Text style={styles.bulletItem}>
                What this means in simple language:
              </Text>
              <Text style={styles.bulletItem}>
                • {getPersonaDescription(analysis.persona)}
              </Text>
              <Text style={styles.bulletItem}>
                This gives us clarity on how best to serve you and which financial
                solutions will create the most meaningful impact.
              </Text>
            </View>

            {/* Section 2: Net Worth */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                2. Your Net Worth Position — A Clear Picture
              </Text>
              <Text style={styles.bulletItem}>
                From your responses:
              </Text>
              <Text style={styles.bulletItem}>
                • Cash & Investments: {getAnswerLabelForNarrative("Q4")}
              </Text>
              <Text style={styles.bulletItem}>
                • Real Estate: {getAnswerLabelForNarrative("Q5")}
              </Text>
              <Text style={styles.bulletItem}>
                • Business/Income Assets: {getAnswerLabelForNarrative("Q6")}
              </Text>
              <Text style={styles.bulletItem}>
                • Debts: {getAnswerLabelForNarrative("Q7")}
              </Text>
              <Text style={styles.bulletItem}>
                After consolidating everything, your Estimated Net Worth is:
              </Text>
              <View style={styles.analysisCard}>
                <Text style={styles.analysisValue}>
                  {formatCurrency(analysis.netWorth)}
                </Text>
              </View>
              <Text style={styles.bulletItem}>
                This places you in the{" "}
                <Text style={{ fontWeight: "bold" }}>
                  {getNetWorthBandLabel(analysis.netWorthBand)}
                </Text>{" "}
                category:
              </Text>
              <Text style={styles.bulletItem}>
                • {getNetWorthBandDescription(analysis.netWorthBand)}
              </Text>
            </View>
          </>
        )}
      </Page>

      {/* Page 2 */}
      {analysis && (
        <Page size="A4" style={styles.page}>
          {/* Section 3: Investment Personality */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              3. Your Investment Personality — Your Comfort With Risk
            </Text>
            <Text style={styles.bulletItem}>
              Your answers show that your Risk Profile is:
            </Text>
            <View style={styles.analysisCard}>
              <Text style={styles.analysisValue}>{analysis.riskProfile}</Text>
            </View>
            <Text style={styles.bulletItem}>
              What this means:
            </Text>
            <Text style={styles.bulletItem}>
              • {getRiskProfileDescription(analysis.riskProfile)}
            </Text>
            <Text style={styles.bulletItem}>
              Your Risk Score was{" "}
              <Text style={{ fontWeight: "bold" }}>{analysis.riskScore}/28</Text>,
              which tells us how you naturally make money decisions — steady,
              bold, cautious, or growth-minded.
            </Text>
          </View>

          {/* Section 4: Goals & Behaviour */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              4. Your Goals & Financial Behaviour — What You're Building Toward
            </Text>
            <Text style={styles.bulletItem}>
              From your goal and behaviour assessments:
            </Text>
            <Text style={styles.bulletItem}>
              • Primary Goal Selected: {getAnswerLabelForNarrative("Q8")}
            </Text>
            <Text style={styles.bulletItem}>
              • Your reaction during market dips: {getAnswerLabelForNarrative("Q9")}
            </Text>
            <Text style={styles.bulletItem}>
              • Comfort with volatility: {getAnswerLabelForNarrative("Q10")}
            </Text>
            <Text style={styles.bulletItem}>
              • Liquidity need: {getAnswerLabelForNarrative("Q14")}
            </Text>
          </View>

          {/* Section 5: Recommendations */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              5. What We Recommend for You — The Myrtle Pathway
            </Text>
            <Text style={styles.bulletItem}>
              Using your Persona + Risk Profile + Net Worth, your recommended
              investment path includes:
            </Text>
            <Text style={styles.bulletItem}>
              {"\n"}COLLECTIVE INVESTMENT SCHEMES:
            </Text>
            <Text style={styles.bulletItem}>
              • Myrtle Balanced Plus Fund - Steady, long-term growth (Min: ₦50,000)
            </Text>
            <Text style={styles.bulletItem}>
              • Myrtle Dollar Shield Fund - USD returns & Naira protection (Min: $1,000)
            </Text>
            <Text style={styles.bulletItem}>
              • Myrtle Nest (MyNest Money Market Fund) - High liquidity (Min: ₦5,000)
            </Text>
            <Text style={styles.bulletItem}>
              {"\n"}DISCRETIONARY PORTFOLIO MANAGEMENT:
            </Text>
            <Text style={styles.bulletItem}>
              • Myrtle Fixed Income Plus - Capital preservation & income (Min: ₦1,000,000)
            </Text>
            <Text style={styles.bulletItem}>
              • Myrtle WealthBlend - Income generation & capital growth (Min: ₦1,000,000)
            </Text>
            <Text style={styles.bulletItem}>
              • Myrtle Treasury Notes - Steady income generation (Min: ₦500,000)
            </Text>
            <Text style={{ fontSize: 8, marginTop: 8, color: "#666666" }}>
              *Please read the Prospectus and consult professional advisers before subscribing.
              Contact: wecare@myrtleng.com | +2349169826644
            </Text>
          </View>

          {/* Section 6: Portfolio Blueprint */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              6. Sample Portfolio Blueprint — Your Ideal Starting Mix
            </Text>
            <Text style={styles.bulletItem}>
              {getPortfolioAllocation()}
            </Text>
          </View>
        </Page>
      )}

      {/* Page 3 */}
      {analysis && (
        <Page size="A4" style={styles.page}>
          {/* Section 7: Wealth Story */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              7. Your Wealth Story Going Forward
            </Text>
            <Text style={styles.bulletItem}>
              Across all categories — income, net worth, behaviour, goals, and
              values — your blueprint shows that you are:
            </Text>
            <View style={styles.narrative}>
              <Text style={styles.narrativeText}>
                {getPersonaNarrative(analysis.persona)}
              </Text>
            </View>
            <Text style={styles.bulletItem}>
              Your next step is simple:
            </Text>
            <Text style={styles.bulletItem}>
              We help you structure your money to support the life you're building
              — one that is confident, intentional, and aligned with your
              long-term aspirations.
            </Text>
            <Text style={styles.bulletItem}>
              At Myrtle, our promise is to walk with you — with clarity, structure,
              dignity, and care.
            </Text>
          </View>

          {/* Section 8: Next Steps */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              🌿 Your Myrtle Advisor Will Now…
            </Text>
            <Text style={styles.bulletItem}>• Validate your details</Text>
            <Text style={styles.bulletItem}>• Confirm product selection</Text>
            <Text style={styles.bulletItem}>• Prepare your onboarding documents</Text>
            <Text style={styles.bulletItem}>• Build your personalized portfolio</Text>
            <Text style={styles.bulletItem}>• Set up your review cycle</Text>
            <Text style={styles.bulletItem}>
              • Walk you through each step in plain, human, relatable language
            </Text>
            <Text style={styles.bulletItem}>
              We look forward to being a meaningful partner on your wealth journey.
            </Text>
          </View>
        </Page>
      )}
    </Document>
  );
};

