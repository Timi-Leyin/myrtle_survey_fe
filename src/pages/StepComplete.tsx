import { Completion } from "../components/Completion";
import { useQuestionnaire } from "../hooks/useQuestionnaire";

interface StepCompleteProps {
  onStartOver: () => void;
}

export const StepComplete = ({ onStartOver }: StepCompleteProps) => {
  const { userInfo, answers, reset } = useQuestionnaire();

  const handleStartOver = () => {
    reset();
    onStartOver();
  };

  if (!userInfo) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Completion
        userInfo={userInfo}
        answers={answers}
        onStartOver={handleStartOver}
      />
    </div>
  );
};

