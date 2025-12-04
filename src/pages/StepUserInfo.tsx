import { UserInfoForm } from "../components/UserInfoForm";
import type { UserInfo } from "../hooks/useQuestionnaire";
import { Card, CardContent } from "../components/ui/card";

interface StepUserInfoProps {
  defaultValues?: UserInfo;
  onSubmit: (data: UserInfo) => void;
}

export const StepUserInfo = ({
  defaultValues,
  onSubmit,
}: StepUserInfoProps) => {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 sm:py-16 bg-linear-to-br from-slate-50 via-white to-[#27DC85]/5">
      <div className="max-w-3xl w-full space-y-10">
        {/* Header Section */}
        <div className="text-center space-y-4 animate-fade-in">
          <div className="inline-block">
            <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-[#27DC85] to-[#20C978] flex items-center justify-center mx-auto mb-4 shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 tracking-tight">
            Welcome to Myrtle
          </h1>
          <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Let's build your personalized wealth blueprint together. Start by telling us a bit about yourself.
          </p>
        </div>

        {/* Form Card */}
        <Card className="animate-slide-up shadow-2xl border-2 border-slate-100 rounded-2xl overflow-hidden">
          <CardContent className="p-8 sm:p-10">
            <UserInfoForm defaultValues={defaultValues} onSubmit={onSubmit} />
          </CardContent>
        </Card>

        {/* Footer Note */}
        <div className="text-center space-y-2">
          <p className="text-sm text-slate-500 flex items-center justify-center gap-2">
            <svg className="w-4 h-4 text-[#27DC85]" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            Your information is secure and confidential
          </p>
        </div>
      </div>
    </div>
  );
};
