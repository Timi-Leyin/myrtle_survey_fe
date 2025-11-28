import { createContext, useContext, useState, type ReactNode } from "react";

export interface UserInfo {
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: "Male" | "Female" | "Prefer not to say";
  occupation: string;
  nationality: string;
  stateOfResidence: string;
  maritalStatus: "Single" | "Married" | "Divorced" | "Widowed";
}

export interface QuestionnaireAnswers {
  [key: string]: string;
}

// Export as type for better compatibility
export type {
  UserInfo as UserInfoType,
  QuestionnaireAnswers as QuestionnaireAnswersType,
};

interface QuestionnaireContextType {
  userInfo: UserInfo | null;
  answers: QuestionnaireAnswers;
  setUserInfo: (info: UserInfo) => void;
  setAnswer: (questionId: string, answer: string) => void;
  reset: () => void;
}

const QuestionnaireContext = createContext<
  QuestionnaireContextType | undefined
>(undefined);

export const QuestionnaireProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [answers, setAnswers] = useState<QuestionnaireAnswers>({});

  const setAnswer = (questionId: string, answer: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const reset = () => {
    setUserInfo(null);
    setAnswers({});
  };

  return (
    <QuestionnaireContext.Provider
      value={{
        userInfo,
        answers,
        setUserInfo,
        setAnswer,
        reset,
      }}
    >
      {children}
    </QuestionnaireContext.Provider>
  );
};

export const useQuestionnaire = () => {
  const context = useContext(QuestionnaireContext);
  if (!context) {
    throw new Error(
      "useQuestionnaire must be used within QuestionnaireProvider"
    );
  }
  return context;
};
