import { useEffect, useState, useRef } from "react";
import confetti from "canvas-confetti";
import { toast } from "sonner";
import { QUESTIONS } from "../data/questions";
import type { UserInfo, QuestionnaireAnswers } from "../hooks/useQuestionnaire";
import { submitSurvey } from "../services/api";
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
    // Auto-submit on mount - only once
    if (!hasSubmittedRef.current) {
      handleSubmit();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  return (
    <div className="space-y-8 px-4">
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

      {/* Questionnaire Answers */}
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-6 sm:p-8 space-y-6">
        <h2 className="text-2xl font-semibold text-slate-900 mb-6">
          Your Responses
        </h2>
        <div className="space-y-4">
          {QUESTIONS.map((question) => (
            <div
              key={question.id}
              className="border-b border-slate-200 pb-4 last:border-b-0 last:pb-0"
            >
              <p className="text-sm font-medium text-slate-500 mb-2">
                {question.id} - {question.dimension}
              </p>
              <p className="text-base text-slate-900">
                {getAnswerLabel(question.id, answers[question.id] || "")}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4">
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
