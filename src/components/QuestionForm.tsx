import { QUESTIONS } from "../data/questions";

interface QuestionFormProps {
  currentQuestionIndex: number;
  selectedAnswer: string | undefined;
  otherText?: string;
  onAnswerSelect: (answer: string) => void;
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
  const isOtherSelected = isQ15 && selectedAnswer === "other";

  return (
    <div className="space-y-6">
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
        <p className="text-base text-slate-600 mb-6">Please select one option</p>

        {/* Options */}
        <div className="space-y-3">
          {question.options.map((option) => (
            <div key={option.value}>
              <button
                type="button"
                onClick={() => onAnswerSelect(option.value)}
                className={`w-full text-left p-5 rounded-xl border-2 transition-all duration-200 ${
                  selectedAnswer === option.value
                    ? "border-[#27DC85] bg-[#27DC85]/10 shadow-md"
                    : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
                }`}
              >
                <div className="flex items-center">
                  <div
                    className={`w-5 h-5 rounded-full border-2 mr-4 flex items-center justify-center flex-shrink-0 ${
                      selectedAnswer === option.value
                        ? "border-[#27DC85] bg-[#27DC85]"
                        : "border-slate-300"
                    }`}
                  >
                    {selectedAnswer === option.value && (
                      <div className="w-2 h-2 rounded-full bg-white" />
                    )}
                  </div>
                  <span
                    className={`text-base font-medium ${
                      selectedAnswer === option.value
                        ? "text-slate-900"
                        : "text-slate-700"
                    }`}
                  >
                    {option.label}
                  </span>
                </div>
              </button>
              {isQ15 && option.value === "other" && isOtherSelected && (
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
          ))}
        </div>
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
          disabled={!selectedAnswer || (isOtherSelected && !otherText.trim())}
          className={`flex-1 py-3 px-6 text-base rounded-xl font-semibold transition-all ${
            selectedAnswer && (!isOtherSelected || otherText.trim())
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

