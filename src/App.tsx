import { useState } from "react";
import { QuestionnaireProvider, useQuestionnaire } from "./hooks/useQuestionnaire";
import type { UserInfo } from "./hooks/useQuestionnaire";
import { StepUserInfo } from "./pages/StepUserInfo";
import { StepQuestions } from "./pages/StepQuestions";
import { StepComplete } from "./pages/StepComplete";
import { QUESTIONS } from "./data/questions";
import { Logo } from "./components/Logo";

type Step = "userInfo" | "questions" | "complete";

const AppContent = () => {
  const [currentStep, setCurrentStep] = useState<Step>("userInfo");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const { userInfo, setUserInfo } = useQuestionnaire();

  const handleUserInfoSubmit = (data: UserInfo) => {
    setUserInfo(data);
    setCurrentStep("questions");
    setCurrentQuestionIndex(0);
  };

  const handleQuestionNext = () => {
    if (currentQuestionIndex < QUESTIONS.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setCurrentStep("complete");
    }
  };

  const handleQuestionBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    } else {
      setCurrentStep("userInfo");
    }
  };

  const handleStartOver = () => {
    setCurrentStep("userInfo");
    setCurrentQuestionIndex(0);
  };

  return (
    <div className={`min-h-screen ${currentStep === "userInfo" ? "" : "bg-white"}`}>
      {/* Fixed Logo */}
      <Logo size="sm" fixed className="hidden sm:block" />
      
      {currentStep === "userInfo" ? (
        <StepUserInfo
          defaultValues={userInfo || undefined}
          onSubmit={handleUserInfoSubmit}
        />
      ) : (
        <div className="container mx-auto px-4 py-8 md:py-12">
          {currentStep === "questions" && (
            <StepQuestions
              currentQuestionIndex={currentQuestionIndex}
              onNext={handleQuestionNext}
              onBack={handleQuestionBack}
            />
          )}

          {currentStep === "complete" && <StepComplete onStartOver={handleStartOver} />}
        </div>
      )}
    </div>
  );
};

const App = () => {
  return (
    <QuestionnaireProvider>
      <AppContent />
    </QuestionnaireProvider>
  );
};

export default App;
