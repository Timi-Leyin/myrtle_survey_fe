import { QUESTIONS, SECTIONS } from "../data/questions";

interface QuestionFormProps {
  currentQuestionIndex: number;
  selectedAnswer: string | string[] | undefined;
  otherText?: string;
  onAnswerSelect: (answer: string | string[]) => void;
  onOtherTextChange?: (text: string) => void;
  onNext: () => void;
  onBack: () => void;
  canGoBack: boolean;
}

export const QuestionForm = ({
  currentQuestionIndex,
  selectedAnswer,
  otherText = "",
  onAnswerSelect,
  onOtherTextChange,
  onNext,
  onBack,
  canGoBack,
}: QuestionFormProps) => {
  const question = QUESTIONS[currentQuestionIndex];
  const totalQuestions = QUESTIONS.length;
  const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100;
  const isQ15 = question.id === "Q15";
  const isMulti = !!question.multiple;
  const isText = (question as any).type === "text" || question.options.length === 0;
  const selectedArray = Array.isArray(selectedAnswer)
    ? selectedAnswer
    : selectedAnswer
    ? [selectedAnswer]
    : [];
  const otherCode = isQ15 ? "SRC_OTHER" : "other";
  const isOtherSelected = isQ15 && selectedArray.some((v) => typeof v === "string" && (v === otherCode || v.startsWith(`${otherCode}:`)));
  
  // Get current section info
  const currentSection = SECTIONS.find((s) => s.number === question.sectionNumber);
  const sectionQuestions = QUESTIONS.filter((q) => q.sectionNumber === question.sectionNumber);
  const questionInSection = sectionQuestions.findIndex((q) => q.id === question.id) + 1;

  return (
    <div className="space-y-6">
      {/* Section Header */}
      {currentSection && (
        <div className="mb-4 pb-4 border-b border-slate-200">
          <p className="text-sm font-semibold text-[#27DC85] uppercase tracking-wide mb-1">
            {currentSection.title}
          </p>
          <p className="text-xs text-slate-500">
            Question {questionInSection} of {sectionQuestions.length} in this section
          </p>
        </div>
      )}

      {/* Progress Bar */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-slate-600">
            Question {currentQuestionIndex + 1} of {totalQuestions}
          </span>
          <span className="text-sm font-medium text-slate-600">
            {Math.round(progress)}%
          </span>
        </div>
        <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#27DC85] transition-all duration-300 ease-out rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-semibold text-slate-900 mb-3">
          {question.dimension}
        </h2>
        {!isText && (
          <p className="text-base text-slate-600 mb-6">
            {isMulti ? "Select all that apply" : "Please select one option"}
          </p>
        )}

        {/* Options */}
        {isText ? (
          <div className="space-y-3">
            <textarea
              value={typeof selectedAnswer === "string" ? selectedAnswer : selectedArray[0] || ""}
              onChange={(e) => onAnswerSelect(e.target.value)}
              placeholder="Type your response here..."
              className="w-full min-h-32 px-4 py-3 text-base rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#27DC85] focus:border-transparent transition-all"
            />
          </div>
        ) : (
        <div className="space-y-3">
          {question.options.map((option) => {
            const isSelected = selectedArray.some((v) => v === option.value || v === `${otherCode}:${otherText}`);
            const onSelect = () => {
              if (isMulti) {
                let next: string[] = [...selectedArray];
                // handle other specially
                if (option.value === otherCode) {
                  const hasOther = next.some((v) => v === otherCode || (typeof v === "string" && v.startsWith(`${otherCode}:`)));
                  if (hasOther) {
                    next = next.filter((v) => !(v === otherCode || (typeof v === "string" && v.startsWith(`${otherCode}:`))));
                  } else {
                    next.push(otherCode);
                  }
                } else {
                  if (next.includes(option.value)) {
                    next = next.filter((v) => v !== option.value);
                  } else {
                    next.push(option.value);
                  }
                }
                onAnswerSelect(next);
              } else {
                onAnswerSelect(option.value);
              }
            };

            return (
              <div key={option.value}>
                <button
                  type="button"
                  onClick={onSelect}
                  className={`w-full text-left p-5 rounded-xl border-2 transition-all duration-200 ${
                    isSelected
                      ? "border-[#27DC85] bg-[#27DC85]/10 shadow-md"
                      : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
                  }`}
                >
                  <div className="flex items-center">
                    <div
                      className={`${
                        isMulti
                          ? "w-5 h-5 mr-4 rounded border-2 flex items-center justify-center shrink-0"
                          : "w-5 h-5 rounded-full border-2 mr-4 flex items-center justify-center shrink-0"
                      } ${isSelected ? "border-[#27DC85] bg-[#27DC85]" : "border-slate-300"}`}
                    >
                      {isSelected && (
                        isMulti ? (
                          <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                            <path d="M20 6L9 17l-5-5" />
                          </svg>
                        ) : (
                          <div className="w-2 h-2 rounded-full bg-white" />
                        )
                      )}
                    </div>
                    <span
                      className={`text-base font-medium ${
                        isSelected ? "text-slate-900" : "text-slate-700"
                      }`}
                    >
                      {option.label}
                    </span>
                  </div>
                </button>
                {isQ15 && option.value === otherCode && isOtherSelected && (
                  <div className="mt-3 ml-9">
                    <input
                      type="text"
                      value={otherText}
                      onChange={(e) => onOtherTextChange?.(e.target.value)}
                      placeholder="Please specify..."
                      className="w-full px-4 py-3 text-base rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#27DC85] focus:border-transparent transition-all"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex gap-4 pt-4">
        {canGoBack && (
          <button
            type="button"
            onClick={onBack}
            className="flex-1 py-3 px-6 text-base rounded-xl border-2 border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 transition-all"
          >
            Back
          </button>
        )}
        <button
          type="button"
          onClick={onNext}
          disabled={
            isMulti
              ? selectedArray.length === 0 || (isOtherSelected && !otherText.trim())
              : isText
              ? !(typeof selectedAnswer === "string" ? selectedAnswer.trim() : (selectedArray[0] || "").trim())
              : !selectedArray.length || (isOtherSelected && !otherText.trim())
          }
          className={`flex-1 py-3 px-6 text-base rounded-xl font-semibold transition-all ${
            (isText
              ? (typeof selectedAnswer === "string" ? selectedAnswer.trim() : (selectedArray[0] || "").trim())
              : selectedArray.length) && (!isOtherSelected || otherText.trim())
              ? "bg-[#27DC85] text-white shadow-md hover:shadow-lg hover:opacity-90"
              : "bg-slate-200 text-slate-400 cursor-not-allowed"
          }`}
        >
          {currentQuestionIndex === totalQuestions - 1 ? "Complete" : "Next"}
        </button>
      </div>
    </div>
  );
};

