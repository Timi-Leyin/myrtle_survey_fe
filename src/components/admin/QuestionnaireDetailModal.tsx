import { Button } from "../ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "../ui/sheet";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { QUESTIONS, SECTIONS } from "../../data/questions";
import type { Submission } from "../../services/adminApi";

interface QuestionnaireDetailModalProps {
  submission: Submission | null;
  open: boolean;
  onClose: () => void;
}

export const QuestionnaireDetailModal = ({
  submission,
  open,
  onClose,
}: QuestionnaireDetailModalProps) => {
  if (!submission) return null;

  const getAnswerLabel = (questionId: string, answerValue: string) => {
    const question = QUESTIONS.find((q) => q.id === questionId);
    if (!question) return answerValue;

    const option = question.options.find((opt) => opt.value === answerValue);
    return option?.label || answerValue;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount: number) => {
    return `₦${amount.toLocaleString()}`;
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="right" className="w-[50vw] overflow-y-auto">
        <SheetHeader className="pb-6 border-b border-slate-200">
          <SheetTitle className="text-2xl font-bold text-slate-900">
            Questionnaire Details
          </SheetTitle>
          <SheetDescription className="text-base">
            Complete submission information for {submission.fullName}
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          {/* User Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">User Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-500 mb-1">
                    Full Name
                  </p>
                  <p className="text-base text-slate-900">
                    {submission.fullName}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500 mb-1">
                    Email
                  </p>
                  <p className="text-base break-words text-slate-900">
                    {submission.email}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500 mb-1">
                    Phone
                  </p>
                  <p className="text-base text-slate-900">{submission.phone}</p>
                </div>
                {submission.gender && (
                  <div>
                    <p className="text-sm font-medium text-slate-500 mb-1">
                      Gender
                    </p>
                    <p className="text-base text-slate-900">
                      {submission.gender}
                    </p>
                  </div>
                )}
                {submission.dateOfBirth && (
                  <div>
                    <p className="text-sm font-medium text-slate-500 mb-1">
                      Date of Birth
                    </p>
                    <p className="text-base text-slate-900">
                      {new Date(submission.dateOfBirth).toLocaleDateString()}
                    </p>
                  </div>
                )}
                {submission.occupation && (
                  <div>
                    <p className="text-sm font-medium text-slate-500 mb-1">
                      Occupation
                    </p>
                    <p className="text-base text-slate-900">
                      {submission.occupation}
                    </p>
                  </div>
                )}
                {submission.address && (
                  <div>
                    <p className="text-sm font-medium text-slate-500 mb-1">
                      Address
                    </p>
                    <p className="text-base text-slate-900">
                      {submission.address}
                    </p>
                  </div>
                )}
                {submission.maritalStatus && (
                  <div>
                    <p className="text-sm font-medium text-slate-500 mb-1">
                      Marital Status
                    </p>
                    <p className="text-base text-slate-900">
                      {submission.maritalStatus}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-slate-500 mb-1">
                    Submitted
                  </p>
                  <p className="text-base text-slate-900">
                    {formatDate(submission.createdAt)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Analysis Summary */}
          {(submission.netWorth ||
            submission.persona ||
            submission.riskProfile) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Wealth Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-4">
                  {submission.netWorth && (
                    <div className="p-4 bg-[#27DC85]/10 rounded-lg border border-[#27DC85]/20">
                      <p className="text-sm font-medium text-slate-600 mb-1">
                        Net Worth
                      </p>
                      <p className="text-2xl font-bold text-[#27DC85]">
                        {formatCurrency(submission.netWorth)}
                      </p>
                      {submission.netWorthBand && (
                        <p className="text-xs text-slate-600 mt-1">
                          {submission.netWorthBand}
                        </p>
                      )}
                    </div>
                  )}
                  {submission.persona && (
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-sm font-medium text-slate-600 mb-1">
                        Persona
                      </p>
                      <p className="text-xl font-bold text-blue-700">
                        {submission.persona}
                      </p>
                    </div>
                  )}
                  {submission.riskProfile && (
                    <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                      <p className="text-sm font-medium text-slate-600 mb-1">
                        Risk Profile
                      </p>
                      <p className="text-xl font-bold text-purple-700">
                        {submission.riskProfile}
                      </p>
                      {submission.riskScore !== undefined && (
                        <p className="text-xs text-slate-600 mt-1">
                          Score: {submission.riskScore}/28
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Portfolio Allocation */}
                {submission.portfolio && (
                  <div className="mt-4 pt-4 border-t border-slate-200">
                    <p className="text-sm font-medium text-slate-700 mb-3">
                      Portfolio Allocation
                    </p>
                    {submission.portfolio.custom ? (
                      <Badge variant="outline" className="bg-slate-100">
                        Custom Allocation
                      </Badge>
                    ) : (
                      <div className="grid grid-cols-3 gap-4">
                        {submission.portfolio.cash !== undefined && (
                          <div className="text-center">
                            <p className="text-2xl font-bold text-slate-900">
                              {submission.portfolio.cash}%
                            </p>
                            <p className="text-xs text-slate-600">Cash</p>
                          </div>
                        )}
                        {submission.portfolio.income !== undefined && (
                          <div className="text-center">
                            <p className="text-2xl font-bold text-slate-900">
                              {submission.portfolio.income}%
                            </p>
                            <p className="text-xs text-slate-600">Income</p>
                          </div>
                        )}
                        {submission.portfolio.growth !== undefined && (
                          <div className="text-center">
                            <p className="text-2xl font-bold text-slate-900">
                              {submission.portfolio.growth}%
                            </p>
                            <p className="text-xs text-slate-600">Growth</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Narrative */}
                {submission.narrative && (
                  <div className="mt-4 pt-4 border-t border-slate-200">
                    <p className="text-sm font-medium text-slate-700 mb-2">
                      Wealth Narrative
                    </p>
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <p className="text-sm text-slate-700 whitespace-pre-line">
                        {submission.narrative}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Questionnaire Answers - Grouped by Sections */}
          {submission.answers && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Questionnaire Responses
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {SECTIONS.map((section) => {
                    const sectionQuestions = QUESTIONS.filter(
                      (q) => q.sectionNumber === section.number
                    );
                    if (sectionQuestions.length === 0) return null;

                    return (
                      <div key={section.id} className="space-y-3">
                        <div className="border-b-2 border-[#27DC85] pb-2">
                          <h4 className="text-base font-semibold text-slate-900">
                            {section.title}
                          </h4>
                          <p className="text-xs text-slate-500 mt-1">
                            {section.description}
                          </p>
                        </div>
                        <div className="space-y-3 pl-4">
                          {sectionQuestions.map((question) => {
                            const answer = submission.answers?.[question.id];
                            if (!answer) return null;

                            return (
                              <div
                                key={question.id}
                                className="border-l-2 border-slate-200 pl-4 pb-3"
                              >
                                <div className="flex items-start gap-3">
                                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#27DC85]/10 flex items-center justify-center">
                                    <span className="text-xs font-semibold text-[#27DC85]">
                                      {question.id}
                                    </span>
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-slate-900 mb-1">
                                      {question.dimension}
                                    </p>
                                    <p className="text-sm text-slate-700">
                                      {getAnswerLabel(question.id, answer)}
                                    </p>
                                  </div>
                                  <Badge
                                    variant="outline"
                                    className="flex-shrink-0"
                                  >
                                    {answer}
                                  </Badge>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 pb-6">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button
              onClick={() => {
                const dataStr = JSON.stringify(submission, null, 2);
                const dataBlob = new Blob([dataStr], {
                  type: "application/json",
                });
                const url = URL.createObjectURL(dataBlob);
                const link = document.createElement("a");
                link.href = url;
                link.download = `questionnaire-${submission.id}.json`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
              }}
              className="bg-[#27DC85] hover:bg-[#27DC85]/90 text-white"
            >
              Download JSON
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
