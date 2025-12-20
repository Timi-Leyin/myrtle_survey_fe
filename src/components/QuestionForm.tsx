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
  const isOptional = question.optional || false;
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
    <div className="space-y-8">
      {/* Section Header */}
      {currentSection && (
        <div className="mb-6 pb-5 border-b-2 border-slate-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-[#27DC85]/10 flex items-center justify-center">
              <span className="text-[#27DC85] font-bold text-lg">{currentSection.number}</span>
            </div>
            <div>
              <p className="text-sm font-bold text-[#27DC85] uppercase tracking-wide">
                {currentSection.title}
              </p>
              <p className="text-xs text-slate-500">
                Question {questionInSection} of {sectionQuestions.length}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Progress Bar */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm font-semibold text-slate-700">
            Progress
          </span>
          <span className="text-sm font-bold text-[#27DC85]">
            {currentQuestionIndex + 1}/{totalQuestions} • {Math.round(progress)}%
          </span>
        </div>
        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden shadow-inner">
          <div
            className="h-full bg-linear-to-r from-[#27DC85] to-[#20C978] transition-all duration-500 ease-out rounded-full shadow-sm"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="bg-white rounded-2xl border-2 border-slate-200 p-6 md:p-8 shadow-sm">
        <div className="flex items-start justify-between gap-4 mb-2">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 leading-tight">
            {question.dimension}
          </h2>
          {isOptional && (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-amber-50 text-amber-700 whitespace-nowrap">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Optional
            </span>
          )}
        </div>
        {!isText && (
          <p className="text-base text-slate-600 mb-6">
            {isMulti ? (
              <span className="inline-flex items-center gap-2 bg-[#27DC85]/10 text-[#27DC85] px-3 py-1 rounded-full text-sm font-medium">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Select all that apply
              </span>
            ) : (
              <span className="text-slate-500">Choose one option</span>
            )}
          </p>
        )}

        {/* Options */}
        {isText ? (
          <div className="space-y-3">
            <textarea
              value={typeof selectedAnswer === "string" ? selectedAnswer : selectedArray[0] || ""}
              onChange={(e) => onAnswerSelect(e.target.value)}
              placeholder="Share your thoughts here... (Optional)"
              className="w-full min-h-40 px-5 py-4 text-base rounded-xl border-2 border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#27DC85] focus:border-[#27DC85] transition-all resize-none"
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
                  className={`group w-full text-left px-5 py-4 rounded-xl border-2 transition-all duration-200 ${
                    isSelected
                      ? "border-[#27DC85] bg-[#27DC85]/5 shadow-md ring-2 ring-[#27DC85]/20"
                      : "border-slate-200 bg-white hover:border-[#27DC85]/50 hover:bg-slate-50 hover:shadow-sm"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`${
                        isMulti
                          ? "w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0"
                          : "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0"
                      } transition-all ${isSelected ? "border-[#27DC85] bg-[#27DC85]" : "border-slate-300 group-hover:border-[#27DC85]/50"}`}
                    >
                      {isSelected && (
                        isMulti ? (
                          <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                            <path d="M20 6L9 17l-5-5" />
                          </svg>
                        ) : (
                          <div className="w-2.5 h-2.5 rounded-full bg-white" />
                        )
                      )}
                    </div>
                    <span
                      className={`text-base flex-1 ${
                        isSelected ? "font-semibold text-slate-900" : "text-slate-700 group-hover:text-slate-900"
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
                      className="w-full px-4 py-3 text-base rounded-xl border-2 border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#27DC85] focus:border-[#27DC85] transition-all"
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
      <div className="flex gap-4 pt-6">
        {canGoBack && (
          <button
            type="button"
            onClick={onBack}
            className="flex items-center justify-center gap-2 flex-1 py-3.5 px-6 text-base rounded-xl border-2 border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 hover:border-slate-400 transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
        )}
        <button
          type="button"
          onClick={onNext}
          disabled={
            isOptional
              ? false // Optional questions can always proceed
              : isMulti
              ? selectedArray.length === 0 || (isOtherSelected && !otherText.trim())
              : isText
              ? !(typeof selectedAnswer === "string" ? selectedAnswer.trim() : (selectedArray[0] || "").trim())
              : !selectedArray.length || (isOtherSelected && !otherText.trim())
          }
          className={`flex items-center justify-center gap-2 flex-1 py-3.5 px-6 text-base rounded-xl font-bold transition-all ${
            (isOptional || (isText
              ? (typeof selectedAnswer === "string" ? selectedAnswer.trim() : (selectedArray[0] || "").trim())
              : selectedArray.length) && (!isOtherSelected || otherText.trim()))
              ? "bg-linear-to-r from-[#27DC85] to-[#20C978] text-white shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
              : "bg-slate-200 text-slate-400 cursor-not-allowed"
          }`}
        >
          {currentQuestionIndex === totalQuestions - 1 ? "Complete Survey" : "Continue"}
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
};

