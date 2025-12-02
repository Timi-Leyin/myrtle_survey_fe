import { useState, useEffect } from "react";
import { QuestionForm } from "../components/QuestionForm";
import { QUESTIONS } from "../data/questions";
import { useQuestionnaire } from "../hooks/useQuestionnaire";

interface StepQuestionsProps {
  currentQuestionIndex: number;
  onNext: () => void;
  onBack: () => void;
}

export const StepQuestions = ({
  currentQuestionIndex,
  onNext,
  onBack,
}: StepQuestionsProps) => {
  const { answers, setAnswer } = useQuestionnaire();
  const question = QUESTIONS[currentQuestionIndex];
  const isMulti = !!question.multiple;
  const selectedAnswer = answers[question.id];
  const selectedArray = Array.isArray(selectedAnswer)
    ? selectedAnswer
    : selectedAnswer
    ? [selectedAnswer]
    : [];
  const isQ15 = question.id === "Q15";
  const otherCode = isQ15 ? "SRC_OTHER" : "other";
  
  // Extract other text from answer if it exists (format: "other: text")
  const getOtherText = () => {
    if (!isQ15) return "";
    const otherEntry = selectedArray.find((v) => typeof v === "string" && v.startsWith(`${otherCode}:`));
    if (otherEntry) return otherEntry.replace("other:", "").trim();
    return "";
  };
  
  const [otherText, setOtherText] = useState(getOtherText());
  
  // Update otherText when question changes
  useEffect(() => {
    if (isQ15) {
      const otherEntry = selectedArray.find((v) => typeof v === "string" && v.startsWith(`${otherCode}:`));
      if (otherEntry) {
        setOtherText(otherEntry.replace(`${otherCode}:`, "").trim());
        return;
      }
    }
    setOtherText("");
  }, [currentQuestionIndex, selectedAnswer, isQ15]);

  const isOtherSelected = isQ15 && (selectedArray.includes(otherCode) || selectedArray.some((v) => typeof v === "string" && v.startsWith(`${otherCode}:`)));

  const handleAnswerSelect = (answer: string | string[]) => {
    if (isMulti) {
      // For multi, we receive the full array
      let next = Array.isArray(answer) ? answer : [answer];
      // if other is toggled on, clear existing other text
      const hasOther = next.some((v) => v === otherCode || (typeof v === "string" && v.startsWith(`${otherCode}:`)));
      if (isQ15 && hasOther && otherText) {
        // ensure the stored value reflects current typed text
        next = next
          .filter((v) => !(v === otherCode || (typeof v === "string" && v.startsWith(`${otherCode}:`))))
          .concat(`${otherCode}:${otherText}`);
      }
      setAnswer(question.id, next);
    } else {
      if (isQ15 && answer === otherCode) {
        setAnswer(question.id, `${otherCode}:`);
        setOtherText("");
      } else {
        setAnswer(question.id, answer as string);
        setOtherText("");
      }
    }
  };

  const handleOtherTextChange = (text: string) => {
    setOtherText(text);
    if (isMulti) {
      const withoutOther = selectedArray.filter((v) => !(v === otherCode || (typeof v === "string" && v.startsWith(`${otherCode}:`))));
      setAnswer(question.id, [...withoutOther, `${otherCode}:${text}`]);
    } else {
      setAnswer(question.id, `${otherCode}: ${text}`);
    }
  };

  const handleNext = () => {
    if ((isMulti ? selectedArray.length > 0 : !!selectedAnswer) && (!isOtherSelected || otherText.trim())) {
      onNext();
    }
  };

  const handleBack = () => {
    onBack();
  };

  return (
    <div className="max-w-3xl mx-auto px-3 sm:px-4">
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-6 sm:p-8">
        <QuestionForm
          currentQuestionIndex={currentQuestionIndex}
          selectedAnswer={
            isMulti
              ? selectedArray
              : isOtherSelected
              ? "other"
              : (selectedAnswer as string | undefined)
          }
          otherText={otherText}
          onAnswerSelect={handleAnswerSelect}
          onOtherTextChange={handleOtherTextChange}
          onNext={handleNext}
          onBack={handleBack}
          canGoBack={currentQuestionIndex > 0}
        />
      </div>
    </div>
  );
};

