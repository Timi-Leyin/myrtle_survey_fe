import { useEffect, useState, useRef } from "react";
import confetti from "canvas-confetti";
import { toast } from "sonner";
import { QUESTIONS, SECTIONS } from "../data/questions";
import type { UserInfo, QuestionnaireAnswers } from "../hooks/useQuestionnaire";
import {
  submitSurvey,
  type QuestionnaireAnalysis,
  type QuestionnaireSubmissionResponse,
} from "../services/api";
import { API_DOCS_URL } from "../config/env";

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


  const getAnswerLabel = (questionId: string, answerValue: string) => {
    const question = QUESTIONS.find((q) => q.id === questionId);
    if (!question) return answerValue;

    // Handle Q15 "other" option with free text
    if (questionId === "Q15" && answerValue.startsWith("other:")) {
      const otherText = answerValue.replace("other:", "").trim();
      return `Other: ${otherText || "(not specified)"}`;
    }

    const option = question.options.find((opt) => opt.value === answerValue);
    return option?.label || answerValue;
  };

  const formatCurrency = (value?: number) => {
    if (value === undefined || value === null) return "—";
    return `₦${value.toLocaleString()}`;
  };

  return (
    <div
      className="space-y-8 px-4 no-oklch"
      style={{ colorScheme: "light" }}
    >
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
        <section className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 text-white rounded-2xl shadow-xl p-6 sm:p-8 space-y-8">
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
            {submissionMeta && (
              <div className="bg-white/10 border border-white/10 rounded-xl px-5 py-4 space-y-2 w-full lg:w-80">
                <p className="text-sm text-slate-300">Reference ID</p>
                <p className="text-base font-semibold tracking-wide">
                  {submissionMeta.id}
                </p>
                <p className="text-sm text-slate-300">
                  Submitted on{" "}
                  <span className="text-white font-medium">
                    {new Date(submissionMeta.createdAt).toLocaleString()}
                  </span>
                </p>
              </div>
            )}
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

      {/* Questionnaire Answers - Grouped by Sections */}
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-6 sm:p-8 space-y-8">
        <h2 className="text-2xl font-semibold text-slate-900 mb-6">
          Your Responses
        </h2>
        {SECTIONS.map((section) => {
          const sectionQuestions = QUESTIONS.filter(
            (q) => q.sectionNumber === section.number
          );
          if (sectionQuestions.length === 0) return null;

          return (
            <div key={section.id} className="space-y-4">
              <div className="border-b-2 border-[#27DC85] pb-2 mb-4">
                <h3 className="text-lg font-semibold text-slate-900">
                  {section.title}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  {section.description}
                </p>
              </div>
              <div className="space-y-4 pl-4">
                {sectionQuestions.map((question) => {
                  const answer = answers[question.id];
                  if (!answer) return null;

                  return (
                    <div
                      key={question.id}
                      className="border-l-2 border-slate-200 pl-4 pb-4 last:pb-0"
                    >
                      <p className="text-sm font-semibold text-slate-700 mb-1">
                        {question.id}. {question.dimension}
                      </p>
                      <p className="text-base text-slate-900">
                        {getAnswerLabel(question.id, answer)}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Actions */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* <button
          onClick={downloadPDF}
          className="flex-1 bg-slate-900 text-white font-semibold py-3 px-6 text-base rounded-xl shadow-md hover:shadow-lg transition-all hover:opacity-90"
        >
          Download Blueprint (PDF)
        </button> */}

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
