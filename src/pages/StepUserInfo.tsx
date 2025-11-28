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
    <div className="min-h-screen flex items-center justify-center px-4 py-8 sm:py-12 bg-gradient-to-br from-slate-50 via-white to-[#27DC85]/5">
      <div className="max-w-3xl w-full space-y-8">
        {/* Header Section */}
        <div className="text-center space-y-3 animate-fade-in">
          <h1 className="text-3xl sm:text-4xl font-semibold text-slate-900">
            Let's Get Started
          </h1>
          <p className="text-base sm:text-lg text-slate-600 max-w-xl mx-auto">
            Tell us a bit about yourself. This will only take a minute.
          </p>
        </div>

        {/* Form Card */}
        <Card className="animate-slide-up shadow-lg">
          <CardContent className="pt-6">
            <UserInfoForm defaultValues={defaultValues} onSubmit={onSubmit} />
          </CardContent>
        </Card>

        {/* Footer Note */}
        <p className="text-center text-sm text-slate-500">
          🔒 Your information is secure and will only be used for this survey
        </p>
      </div>
    </div>
  );
};
