import { useEffect, useState, useRef } from "react";
import confetti from "canvas-confetti";
import { pdf } from "@react-pdf/renderer";
import { toast } from "sonner";
import { QUESTIONS } from "../data/questions";
import type { UserInfo, QuestionnaireAnswers } from "../hooks/useQuestionnaire";
import {
  submitSurvey,
  type QuestionnaireAnalysis,
  type QuestionnaireSubmissionResponse,
} from "../services/api";
import { API_DOCS_URL } from "../config/env";
import { CompletionPDFDocument } from "./CompletionPDF";

interface CompletionProps {
  userInfo: UserInfo;
  answers: QuestionnaireAnswers;
  onStartOver: () => void;
}

export const Completion = ({
  userInfo,
  answers,
  onStartOver,
}: CompletionProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const hasSubmittedRef = useRef(false);
  const [analysis, setAnalysis] = useState<QuestionnaireAnalysis | null>(null);
  const [submissionMeta, setSubmissionMeta] = useState<
    QuestionnaireSubmissionResponse["submission"] | null
  >(null);

  const mounted = useRef(false);

  const handleSubmit = async () => {
    if (isSubmitted || isSubmitting || hasSubmittedRef.current) return;

    hasSubmittedRef.current = true;

    setIsSubmitting(true);
    const finalResponse = {
      user: userInfo,
      questionnaire: answers,
    };

    // Show loading toast
    const loadingToast = toast.loading("Submitting your survey...", {
      description: "Please wait while we save your responses.",
    });

    const result = await submitSurvey(finalResponse);

    setIsSubmitting(false);
    toast.dismiss(loadingToast);

    if (result.success) {
      const responseData =
        (result.data as QuestionnaireSubmissionResponse) ||
        ((result.data as { data?: QuestionnaireSubmissionResponse })?.data ??
          null);

      if (responseData) {
        setAnalysis(responseData.analysis);
        setSubmissionMeta(responseData.submission);
      }

      setIsSubmitted(true);
      toast.success("Survey Submitted!", {
        description:
          result.message ||
          "Your responses have been saved successfully. Please check your email for your personalized wealth blueprint.",
        duration: 7000,
      });
    } else {
      // Reset ref on error so user can retry
      hasSubmittedRef.current = false;

      // Log error for debugging
      console.error("Survey submission error:", result.error);
      console.error("Submission data:", finalResponse);

      // Check if it's a user exists error
      const isUserExistsError =
        result.error?.toLowerCase().includes("already exists") ||
        result.error?.toLowerCase().includes("email already");

      toast.error(
        isUserExistsError ? "Account Already Exists" : "Submission Failed",
        {
          description:
            result.error ||
            `Unable to submit your survey. The API endpoint may not be configured correctly. Please check the Swagger documentation at ${API_DOCS_URL}.`,
          duration: isUserExistsError ? 10000 : 8000,
          action: {
            label: "Retry",
            onClick: () => {
              hasSubmittedRef.current = false;
              handleSubmit();
            },
          },
        }
      );
    }
  };

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      handleSubmit();
    }
  }, []);

  useEffect(() => {
    // Confetti animation on mount
    const duration = 4000;
    const animationEnd = Date.now() + duration;
    const defaults = {
      startVelocity: 30,
      spread: 360,
      ticks: 60,
      zIndex: 9999,
    };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    // Initial burst
    confetti({
      ...defaults,
      particleCount: 100,
      origin: { x: 0.5, y: 0.3 },
      colors: ["#27DC85", "#20C978", "#10b981", "#059669", "#047857"],
    });

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 30 * (timeLeft / duration);

      // Left side
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        colors: ["#27DC85", "#20C978", "#10b981", "#059669"],
      });

      // Right side
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        colors: ["#27DC85", "#20C978", "#10b981", "#059669"],
      });
    }, 200);

    return () => clearInterval(interval);
  }, []);

  const downloadJSON = () => {
    const finalResponse = {
      user: userInfo,
      questionnaire: answers,
      analysis,
      submission: submissionMeta,
    };

    const dataStr = JSON.stringify(finalResponse, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `myrtle-survey-${userInfo.fullName.replace(
      /\s+/g,
      "-"
    )}-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const downloadPDF = async () => {
    const toastId = toast.loading("Generating PDF...", {
      description: "Please wait while we create your blueprint.",
    });

    try {
      const doc = (
        <CompletionPDFDocument
          userInfo={userInfo}
          answers={answers}
          analysis={analysis}
        />
      );

      const blob = await pdf(doc).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const safeName = userInfo.fullName.replace(/\s+/g, "-");
      link.download = `myrtle-blueprint-${safeName}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success("Blueprint downloaded", {
        description: "Your personalized PDF has been generated.",
      });
    } catch (error) {
      toast.error("Unable to generate PDF", {
        description:
          error instanceof Error ? error.message : "Please try again shortly.",
      });
    } finally {
      toast.dismiss(toastId);
    }
  };

  const getAnswerLabel = (questionId: string, answerValue: string) => {
    const question = QUESTIONS.find((q) => q.id === questionId);
    if (!question) return answerValue;

    // Handle Q15 "Other" with free text (SRC_OTHER)
    if (questionId === "Q15" && (answerValue.startsWith("SRC_OTHER:") || answerValue.startsWith("other:"))) {
      const otherText = answerValue.replace("SRC_OTHER:", "").replace("other:", "").trim();
      return `Other: ${otherText || "(not specified)"}`;
    }

    const option = question.options.find((opt) => opt.value === answerValue);
    return option?.label || answerValue;
  };

  const formatCurrency = (value?: number) => {
    if (value === undefined || value === null) return "—";
    return `₦${value.toLocaleString()}`;
  };

  // Helper functions for narrative -1

  const getPersonaDescription = (persona: string) => {
    if (persona.includes("Everyday Builder")) {
      return "You are establishing your financial foundation — building stability, developing strong money habits, and creating the structures that support long-term confidence.";
    }
    if (persona.includes("Strategic Achiever")) {
      return "You are actively expanding your wealth through diversified investments, income growth strategies, and forward-looking financial planning.";
    }
    if (persona.includes("Private Wealth")) {
      return "You oversee significant assets and decisions. Your priority is wealth preservation, strategic growth, governance, and multi-generational continuity.";
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
    if (band.includes("Emerging") || band.includes("NW1")) {
      return "You are in the early wealth-building phase. Your current structure focuses on stability and growth foundations.";
    }
    if (band.includes("Mass Affluent") || band.includes("NW2")) {
      return "You have a growing financial base and expanding opportunities. With structure, your net worth can scale rapidly.";
    }
    if (band.includes("Affluent") || band.includes("NW3")) {
      return "You have established assets and are now in a stage that requires thoughtful diversification, risk-managed growth, and early legacy planning.";
    }
    if (band.includes("Private Wealth") || band.includes("NW4")) {
      return "You are operating at a governance and preservation level. Your plan prioritizes multi-asset strategy, global diversification, security, and intergenerational wealth.";
    }
    return "";
  };

  const getRiskProfileDescription = (profile: string) => {
    const profileLower = profile.toLowerCase();
    if (profileLower.includes("conservative")) {
      return "You prefer stability and protection above aggressive growth. Your strategy prioritizes security and predictable returns.";
    }
    if (profileLower.includes("moderate")) {
      return "You value balance — steady returns with measured exposure to growth opportunities.";
    }
    if (profileLower.includes("growth")) {
      return "You are comfortable with calculated swings because you have a long-term mindset and seek meaningful expansion.";
    }
    if (profileLower.includes("aggressive")) {
      return "You think in decades, not days. You embrace volatility in pursuit of strong long-term returns.";
    }
    return "";
  };

  // Helper functions for narrative template
  const getAnswerLabelForNarrative = (questionId: string) => {
    const answer = answers[questionId];
    if (!answer) return "Not specified";
    if (Array.isArray(answer)) {
      return answer.map((a) => getAnswerLabel(questionId, a)).join(", ");
    }
    return getAnswerLabel(questionId, answer);
  };

  return (
    <div className="space-y-8 px-4 max-w-7xl mx-auto">
      {/* Thank You Message */}
      <div className="text-center space-y-4">
        <div className="w-20 h-20 bg-[#27DC85] rounded-full flex items-center justify-center mx-auto shadow-lg">
          {isSubmitting ? (
            <svg
              className="w-10 h-10 text-white animate-spin"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          ) : (
            <svg
              className="w-10 h-10 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          )}
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 px-2">
          Thank you, {userInfo.fullName}!
        </h1>
        <p className="text-lg text-slate-600 px-4">
          {isSubmitting
            ? "Submitting your responses..."
            : isSubmitted
            ? "Your responses have been recorded and submitted successfully."
            : "Your responses have been recorded successfully."}
        </p>
        {isSubmitted && (
          <div className="bg-[#27DC85]/10 border border-[#27DC85]/30 rounded-xl p-4 max-w-2xl mx-auto">
            <p className="text-base text-slate-700 font-medium">
              📧 Check your email ({userInfo.email}) for your personalized
              Myrtle Wealth Blueprint!
            </p>
            <p className="text-sm text-slate-600 mt-2">
              We've sent your comprehensive wealth analysis and recommendations
              to your inbox.
            </p>
          </div>
        )}
      </div>

      {analysis && (
        <section className="bg-linear-to-br from-slate-900 via-slate-900 to-slate-800 text-white rounded-2xl shadow-xl p-6 sm:p-8 space-y-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-emerald-300">
                Myrtle Wealth Blueprint
              </p>
              <h2 className="text-3xl sm:text-4xl font-semibold mt-2">
                {analysis.persona}
              </h2>
              <p className="text-slate-300 mt-2 text-base max-w-2xl">
                Your personalized profile highlights how Myrtle can guide you
                toward a confident, structured wealth strategy tailored to your
                ambitions.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-2xl bg-white/5 border border-white/10 p-5 backdrop-blur">
              <p className="text-sm text-slate-300 mb-1">Net Worth</p>
              <h3 className="text-3xl font-semibold text-emerald-300">
                {formatCurrency(analysis.netWorth)}
              </h3>
              <p className="text-sm text-slate-400 mt-1">
                Band: {analysis.netWorthBand}
              </p>
            </div>
            <div className="rounded-2xl bg-white/5 border border-white/10 p-5 backdrop-blur">
              <p className="text-sm text-slate-300 mb-1">Risk Profile</p>
              <h3 className="text-3xl font-semibold text-white">
                {analysis.riskProfile}
              </h3>
              <p className="text-sm text-slate-400 mt-1">
                Score: {analysis.riskScore}/28
              </p>
            </div>
            <div className="rounded-2xl bg-white/5 border border-white/10 p-5 backdrop-blur">
              <p className="text-sm text-slate-300 mb-1">Portfolio Outlook</p>
              <h3 className="text-3xl font-semibold text-white">
                {analysis.portfolio?.custom
                  ? "Custom Allocation"
                  : "Guided Mix"}
              </h3>
              {!analysis.portfolio?.custom && (
                <div className="flex gap-3 text-sm text-slate-300 mt-2">
                  {analysis.portfolio?.cash !== undefined && (
                    <span>Cash {analysis.portfolio.cash}%</span>
                  )}
                  {analysis.portfolio?.income !== undefined && (
                    <span>Income {analysis.portfolio.income}%</span>
                  )}
                  {analysis.portfolio?.growth !== undefined && (
                    <span>Growth {analysis.portfolio.growth}%</span>
                  )}
                </div>
              )}
            </div>
          </div>

          {analysis.narrative && (
            <div className="bg-white text-slate-900 rounded-2xl p-6 space-y-4 shadow-lg">
              <p className="text-sm font-semibold text-emerald-600 uppercase tracking-widest">
                Personalized Narrative
              </p>
              <p className="text-base leading-relaxed whitespace-pre-line">
                {analysis.narrative}
              </p>
            </div>
          )}
        </section>
      )}

      {/* Summary */}
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-6 sm:p-8 space-y-6">
        <h2 className="text-2xl font-semibold text-slate-900 mb-6">
          Your Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">Full Name</p>
            <p className="text-base text-slate-900">{userInfo.fullName}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">Email</p>
            <p className="text-base text-slate-900">{userInfo.email}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">Phone</p>
            <p className="text-base text-slate-900">{userInfo.phone}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">
              Date of Birth
            </p>
            <p className="text-base text-slate-900">
              {new Date(userInfo.dateOfBirth).toLocaleDateString()}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">Gender</p>
            <p className="text-base text-slate-900">{userInfo.gender}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">
              Occupation
            </p>
            <p className="text-base text-slate-900">{userInfo.occupation}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">
              Nationality
            </p>
            <p className="text-base text-slate-900">{userInfo.nationality}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">
              State of Residence
            </p>
            <p className="text-base text-slate-900">
              {userInfo.stateOfResidence}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">
              Marital Status
            </p>
            <p className="text-base text-slate-900">{userInfo.maritalStatus}</p>
          </div>
        </div>
      </div>

      {/* MYRTLE WEALTH BLUEPRINT Narrative */}
      {isSubmitted && analysis && (
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-6 sm:p-8 space-y-8">
          <div className="text-center space-y-2 mb-8">
            <h2 className="text-3xl font-bold text-[#27DC85]">
              🌿 MYRTLE WEALTH BLUEPRINT™
            </h2>
            <p className="text-lg text-slate-600 italic">
              — Personalized Client Narrative
            </p>
            <p className="text-base text-slate-500">
              Reimagining Wealth. Building Prosperity Together.
            </p>
          </div>

          {/* Section 1: Financial Identity */}
          <section className="space-y-4">
            <h3 className="text-xl font-bold text-slate-900">
              1. Your Financial Identity — Who You Are Today
            </h3>
            <p className="text-base text-slate-700 leading-relaxed">
              Based on the information you shared, you fall into the{" "}
              <span className="font-semibold text-[#27DC85]">
                {analysis.persona}
              </span>{" "}
              segment.
            </p>
            <p className="text-base text-slate-700 leading-relaxed">
              <strong>What this means in simple language:</strong>
            </p>
            <div className="bg-slate-50 border-l-4 border-[#27DC85] rounded-r-xl p-4 my-4">
              <p className="text-base text-slate-700 italic">
                {getPersonaDescription(analysis.persona)}
              </p>
            </div>
            <p className="text-base text-slate-700 leading-relaxed">
              <em>This section helps us understand where you are on your financial journey so we can recommend solutions that match your lifestyle, goals, capacity, and long-term aspirations.</em>
            </p>
          </section>

          {/* Section 2: Net Worth Position */}
          <section className="space-y-4">
            <h3 className="text-xl font-bold text-slate-900">
              2. Your Net Worth Position — A Clear Picture
            </h3>
            <p className="text-base text-slate-700 leading-relaxed">
              From your responses:
            </p>
            <div className="bg-slate-50 rounded-xl p-4 my-4">
              <ul className="space-y-2 text-base text-slate-700">
                <li>
                  <strong>Cash & Investments:</strong>{" "}
                  {getAnswerLabelForNarrative("Q4")}
                </li>
                <li>
                  <strong>Real Estate:</strong> {getAnswerLabelForNarrative("Q5")}
                </li>
                <li>
                  <strong>Business/Income Assets:</strong>{" "}
                  {getAnswerLabelForNarrative("Q6")}
                </li>
                <li>
                  <strong>Debts:</strong> {getAnswerLabelForNarrative("Q7")}
                </li>
              </ul>
            </div>
            <p className="text-base text-slate-700 leading-relaxed">
              <strong>After consolidating everything, your Estimated Net Worth is:</strong>
            </p>
            <div className="bg-[#27DC85]/10 border-2 border-[#27DC85] rounded-xl p-4 my-4 text-center">
              <p className="text-3xl font-bold text-[#27DC85]">
                {formatCurrency(analysis.netWorth)}
              </p>
            </div>
            <p className="text-base text-slate-700 leading-relaxed">
              This places you in the{" "}
              <span className="font-semibold text-[#27DC85]">
                {getNetWorthBandLabel(analysis.netWorthBand)}
              </span>{" "}
              category.
            </p>
            <div className="bg-slate-50 border-l-4 border-[#27DC85] rounded-r-xl p-4 my-4">
              <p className="text-base text-slate-700 italic">
                {getNetWorthBandDescription(analysis.netWorthBand)}
              </p>
            </div>
            <p className="text-base text-slate-700 leading-relaxed">
              <em>Net worth assessment helps us understand your financial capacity, your liquidity needs, and the type of structures best suited for your long-term prosperity.</em>
            </p>
          </section>

          {/* Section 3: Investment Personality */}
          <section className="space-y-4">
            <h3 className="text-xl font-bold text-slate-900">
              3. Your Investment Personality — Your Comfort With Risk
            </h3>
            <p className="text-base text-slate-700 leading-relaxed">
              Your answers show that your <strong>Risk Profile is:</strong>
            </p>
            <div className="bg-slate-50 border-2 border-slate-300 rounded-xl p-6 my-4 text-center">
              <p className="text-2xl font-bold text-slate-900">
                {analysis.riskProfile}
              </p>
              <p className="text-base text-slate-600 mt-2">
                Risk Score: <span className="font-semibold">{analysis.riskScore}/28</span>
              </p>
            </div>
            <div className="bg-slate-50 border-l-4 border-[#27DC85] rounded-r-xl p-4 my-4">
              <p className="text-base text-slate-700 italic">
                {getRiskProfileDescription(analysis.riskProfile)}
              </p>
            </div>
            <p className="text-base text-slate-700 leading-relaxed">
              <em>This tells us how you naturally make financial decisions and ensures your portfolio aligns with your temperament, not pressure or uncertainty.</em>
            </p>
          </section>

          {/* Section 4: Goals & Financial Behaviour */}
          <section className="space-y-4">
            <h3 className="text-xl font-bold text-slate-900">
              4. Your Goals & Financial Behaviour — What You're Building Toward
            </h3>
            <p className="text-base text-slate-700 leading-relaxed">
              From your goal and behaviour assessments:
            </p>
            <div className="bg-slate-50 rounded-xl p-4 my-4">
              <ul className="space-y-3 text-base text-slate-700">
                <li>
                  <strong>Primary Goals Selected:</strong>{" "}
                  {getAnswerLabelForNarrative("Q8")}
                </li>
                <li>
                  <strong>Your reaction during market dips:</strong>{" "}
                  {getAnswerLabelForNarrative("Q9")}
                </li>
                <li>
                  <strong>Comfort with volatility:</strong>{" "}
                  {getAnswerLabelForNarrative("Q10")}
                </li>
                <li>
                  <strong>Liquidity need:</strong>{" "}
                  {getAnswerLabelForNarrative("Q14")}
                </li>
              </ul>
            </div>
            <p className="text-base text-slate-700 leading-relaxed">
              <em>These behavioural insights help us design a portfolio you can stay consistent with — not just one that looks good on paper.</em>
            </p>
          </section>

          {/* Section 5: Recommendations */}
          <section className="space-y-4">
            <h3 className="text-xl font-bold text-slate-900">
              5. What We Recommend for You — The Myrtle Pathway
            </h3>
            <p className="text-base text-slate-700 leading-relaxed">
              <strong>Your Classification:</strong>{" "}
              <span className="text-[#27DC85] font-semibold">
                {analysis.persona}
              </span>{" "}
              •{" "}
              <span className="text-[#27DC85] font-semibold">
                {analysis.riskProfile}
              </span>{" "}
              •{" "}
              <span className="text-[#27DC85] font-semibold">
                {getNetWorthBandLabel(analysis.netWorthBand)}
              </span>
            </p>
            <p className="text-base text-slate-700 leading-relaxed mt-4">
              Based on your profile, your recommended investment path includes:
            </p>
            
            <div className="space-y-3 mt-4">
              <div className="bg-slate-50 border-l-4 border-[#27DC85] rounded-r-xl p-4">
                <h4 className="font-semibold text-slate-900 mb-2">Collective Investment Schemes</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-slate-700 ml-2">
                  <li><strong>Myrtle Balanced Plus Fund</strong> — Steady, long-term growth with low to medium risk (Min: ₦50,000)</li>
                  <li><strong>Myrtle Dollar Shield Fund</strong> — USD returns & protection against Naira volatility (Min: $1,000)</li>
                  <li><strong>Myrtle Nest (MyNest Money Market Fund)</strong> — Capital preservation with high liquidity (Min: ₦5,000)</li>
                </ul>
              </div>

              <div className="bg-slate-50 border-l-4 border-[#27DC85] rounded-r-xl p-4">
                <h4 className="font-semibold text-slate-900 mb-2">Discretionary Portfolio Management</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-slate-700 ml-2">
                  <li><strong>Myrtle Fixed Income Plus</strong> — Capital preservation & income generation (Min: ₦1,000,000)</li>
                  <li><strong>Myrtle WealthBlend</strong> — Income generation & capital growth (Min: ₦1,000,000)</li>
                  <li><strong>Myrtle Treasury Notes</strong> — Capital preservation & steady income (Min: ₦500,000)</li>
                </ul>
              </div>
            </div>

            <p className="text-base text-slate-700 leading-relaxed mt-4">
              <em>These recommendations align your goals, capacity, temperament, and long-term vision into a focused investment pathway.</em>
            </p>
            
            <p className="text-xs text-slate-500 italic mt-4">
              *Please read the Prospectus and where in doubt, consult your stockbroker, 
              fund/portfolio manager, accountant, banker, solicitor or any other professional 
              adviser for guidance before subscribing. Contact: wecare@myrtleng.com | +2349169826644
            </p>
          </section>

          {/* Section 6: Sample Portfolio Blueprint */}
          {analysis.portfolio && (
            <section className="space-y-4">
              <h3 className="text-xl font-bold text-slate-900">
                6. Sample Portfolio Blueprint — Your Ideal Starting Mix
              </h3>
              <p className="text-base text-slate-700 leading-relaxed">
                Based on your risk profile, here is your recommended portfolio allocation:
              </p>
              <div className="bg-[#27DC85]/10 border-2 border-[#27DC85] rounded-xl p-6 my-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
                  {analysis.portfolio.cash !== undefined && (
                    <div>
                      <p className="text-3xl font-bold text-[#27DC85]">{analysis.portfolio.cash}%</p>
                      <p className="text-sm text-slate-600 mt-1">Cash</p>
                    </div>
                  )}
                  {analysis.portfolio.income !== undefined && (
                    <div>
                      <p className="text-3xl font-bold text-[#27DC85]">{analysis.portfolio.income}%</p>
                      <p className="text-sm text-slate-600 mt-1">Income</p>
                    </div>
                  )}
                  {analysis.portfolio.growth !== undefined && (
                    <div>
                      <p className="text-3xl font-bold text-[#27DC85]">{analysis.portfolio.growth}%</p>
                      <p className="text-sm text-slate-600 mt-1">Growth</p>
                    </div>
                  )}
                </div>
              </div>
              <p className="text-base text-slate-700 leading-relaxed">
                <em>This visual blueprint shows how your wealth is best positioned today, grounded in global standards and Myrtle's disciplined investment philosophy.</em>
              </p>
            </section>
          )}

          {/* Section 7: Sources of Funds */}
          <section className="space-y-4">
            <h3 className="text-xl font-bold text-slate-900">
              7. Sources of Funds
            </h3>
            <div className="bg-slate-50 border-l-4 border-[#27DC85] rounded-r-xl p-4 my-4">
              <p className="text-base text-slate-700">
                <strong>Your investment funds come from:</strong>
              </p>
              <p className="text-base text-slate-700 mt-2">
                {getAnswerLabelForNarrative("Q15")}
              </p>
            </div>
            <p className="text-base text-slate-700 leading-relaxed">
              <em>This helps us understand how your wealth is generated and ensures your plan aligns with both regulatory expectations and your financial reality.</em>
            </p>
          </section>

          {/* Section 8: Your Message to Your Advisor */}
          {answers.Q16 && (
            <section className="space-y-4">
              <h3 className="text-xl font-bold text-slate-900">
                8. Your Message to Your Advisor
              </h3>
              <div className="bg-slate-50 border-l-4 border-[#27DC85] rounded-r-xl p-6 my-4">
                <p className="text-base text-slate-700 italic">
                  "{answers.Q16}"
                </p>
              </div>
              <p className="text-base text-slate-700 leading-relaxed">
                <em>We hear you clearly and will integrate this into your structured wealth plan.</em>
              </p>
            </section>
          )}

          {/* Section 9: Next Steps */}
          <section className="space-y-4 bg-linear-to-br from-slate-50 to-slate-100 rounded-xl p-6 border-2 border-slate-200">
            <h3 className="text-xl font-bold text-slate-900">
              🌿 Your Myrtle Advisor Will Now…
            </h3>
            <ul className="list-disc list-inside space-y-2 text-base text-slate-700 ml-4">
              <li>Validate your details</li>
              <li>Confirm product selection</li>
              <li>Prepare your onboarding documents</li>
              <li>Build your personalized portfolio</li>
              <li>Set up your review cycle</li>
              <li>
                Walk you through each step in plain, human, relatable language
              </li>
            </ul>
            <p className="text-base text-slate-700 leading-relaxed mt-4 font-medium">
              We look forward to being a meaningful partner on your wealth journey.
            </p>
          </section>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col lg:flex-row gap-4">
        <button
          onClick={downloadPDF}
          disabled={!isSubmitted || !analysis}
          className="flex-1 bg-slate-900 text-white font-semibold py-3 px-6 text-base rounded-xl shadow-md hover:shadow-lg transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Download Blueprint (PDF)
        </button>

        <button
          onClick={downloadJSON}
          className="flex-1 bg-[#27DC85] text-white font-semibold py-3 px-6 text-base rounded-xl shadow-md hover:shadow-lg transition-all hover:opacity-90"
        >
          <span className="hidden sm:inline">Download My Responses (JSON)</span>
          <span className="sm:hidden">Download JSON</span>
        </button>
        <button
          onClick={onStartOver}
          className="flex-1 border-2 border-slate-300 text-slate-700 font-semibold py-3 px-6 text-base rounded-xl hover:bg-slate-50 transition-all"
        >
          Start Over
        </button>
      </div>
    </div>
  );
};
