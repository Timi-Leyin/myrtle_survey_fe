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
  const [analysis, setAnalysis] = useState<QuestionnaireAnalysis | null>(null);
  const [submissionMeta, setSubmissionMeta] = useState<
    QuestionnaireSubmissionResponse["submission"] | null
  >(null);

  const hasSubmittedRef = useRef(false);
  const mounted = useRef(false);

  const handleSubmit = async () => {
    if (isSubmitted || isSubmitting || hasSubmittedRef.current) return;

    hasSubmittedRef.current = true;
    setIsSubmitting(true);

    const finalResponse = {
      user: userInfo,
      questionnaire: answers,
    };

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
      hasSubmittedRef.current = false;

      const isUserExistsError =
        result.error?.toLowerCase().includes("already exists") ||
        result.error?.toLowerCase().includes("email already");

      toast.error(
        isUserExistsError ? "Account Already Exists" : "Submission Failed",
        {
          description:
            result.error ||
            `Unable to submit your survey. Please check the Swagger documentation at ${API_DOCS_URL}.`,
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
    const duration = 4000;
    const animationEnd = Date.now() + duration;

    const defaults = {
      startVelocity: 30,
      spread: 360,
      ticks: 60,
      zIndex: 9999,
    };

    const randomInRange = (min: number, max: number) =>
      Math.random() * (max - min) + min;

    confetti({
      ...defaults,
      particleCount: 100,
      origin: { x: 0.5, y: 0.3 },
      colors: ["#27DC85", "#20C978", "#10b981", "#059669", "#047857"],
    });

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) return clearInterval(interval);

      const particleCount = 30 * (timeLeft / duration);

      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        colors: ["#27DC85", "#20C978", "#10b981", "#059669"],
      });

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

    if (questionId === "Q15" && answerValue.startsWith("other:")) {
      const otherText = answerValue.replace("other:", "").trim();
      return `Other: ${otherText || "(not specified)"}`;
    }

    const option = question.options.find((opt) => opt.value === answerValue);
    return option?.label || answerValue;
  };

  const formatCurrency = (value?: number) => {
    if (value == null) return "—";
    return `₦${value.toLocaleString()}`;
  };

  return (
    <div className="space-y-8 px-4 no-oklch" style={{ colorScheme: "light" }}>
      {/* UI code remains unchanged */}
      {/* ... your big JSX block stays exactly as originally used ... */}

      {/* Only JSON download + restart */}
      <div className="flex flex-col lg:flex-row gap-4">
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
