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
  const selectedAnswer = answers[question.id];
  const isQ15 = question.id === "Q15";
  
  // Extract other text from answer if it exists (format: "other: text")
  const getOtherText = () => {
    if (isQ15 && selectedAnswer?.startsWith("other:")) {
      return selectedAnswer.replace("other:", "").trim();
    }
    return "";
  };
  
  const [otherText, setOtherText] = useState(getOtherText());
  
  // Update otherText when question changes
  useEffect(() => {
    if (isQ15 && selectedAnswer?.startsWith("other:")) {
      setOtherText(selectedAnswer.replace("other:", "").trim());
    } else {
      setOtherText("");
    }
  }, [currentQuestionIndex, selectedAnswer, isQ15]);
  
  const isOtherSelected = isQ15 && (selectedAnswer === "other" || selectedAnswer?.startsWith("other:"));

  const handleAnswerSelect = (answer: string) => {
    if (isQ15 && answer === "other") {
      setAnswer(question.id, "other:");
      setOtherText("");
    } else {
      setAnswer(question.id, answer);
      setOtherText("");
    }
  };

  const handleOtherTextChange = (text: string) => {
    setOtherText(text);
    setAnswer(question.id, `other: ${text}`);
  };

  const handleNext = () => {
    if (selectedAnswer && (!isOtherSelected || otherText.trim())) {
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
          selectedAnswer={isOtherSelected ? "other" : selectedAnswer}
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

