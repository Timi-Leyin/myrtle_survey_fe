import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AlertCircle } from "lucide-react";
import type { UserInfo } from "../hooks/useQuestionnaire";
import { DatePicker } from "./ui/date-picker";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Separator } from "./ui/separator";
import { Button } from "./ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { cn } from "@/lib/utils";

const userInfoSchema = z.object({
  fullName: z
    .string()
    .min(1, "Please enter your full name")
    .min(2, "Name must be at least 2 characters")
    .regex(
      /^[a-zA-Z\s'-]+$/,
      "Name can only contain letters, spaces, hyphens, and apostrophes"
    ),
  email: z
    .string()
    .min(1, "Please enter your email address")
    .email("Please enter a valid email address (e.g., john@example.com)"),
  phone: z
    .string()
    .min(1, "Please enter your phone number")
    .regex(
      /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/,
      "Please enter a valid phone number (e.g., +234 800 000 0000)"
    ),
  dateOfBirth: z
    .string()
    .min(1, "Please select your date of birth")
    .refine(
      (date) => {
        if (!date) return false;
        const birthDate = new Date(date);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        const dayDiff = today.getDate() - birthDate.getDate();
        return (
          age > 18 ||
          (age === 18 && (monthDiff > 0 || (monthDiff === 0 && dayDiff >= 0)))
        );
      },
      {
        message:
          "You must be at least 18 years old to participate in this survey",
      }
    ),
  gender: z
    .string()
    .min(1, "Please select your gender")
    .refine((val) => ["Male", "Female", "Prefer not to say"].includes(val), {
      message: "Please select a valid gender option",
    }),
  occupation: z
    .string()
    .min(1, "Please enter your occupation")
    .min(2, "Occupation must be at least 2 characters"),
  nationality: z
    .string()
    .min(1, "Please enter your nationality")
    .min(2, "Nationality must be at least 2 characters"),
  stateOfResidence: z
    .string()
    .min(1, "Please enter your state of residence")
    .min(2, "State must be at least 2 characters"),
  maritalStatus: z
    .string()
    .min(1, "Please select your marital status")
    .refine(
      (val) => ["Single", "Married", "Divorced", "Widowed"].includes(val),
      { message: "Please select a valid marital status option" }
    ),
});

type UserInfoFormData = z.infer<typeof userInfoSchema>;

interface UserInfoFormProps {
  defaultValues?: UserInfo;
  onSubmit: (data: UserInfo) => void;
}

export const UserInfoForm = ({
  defaultValues,
  onSubmit,
}: UserInfoFormProps) => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<UserInfoFormData>({
    resolver: zodResolver(userInfoSchema),
    mode: "onBlur",
    reValidateMode: "onBlur",
    defaultValues: defaultValues
      ? {
          ...defaultValues,
          dateOfBirth: defaultValues.dateOfBirth
            ? new Date(defaultValues.dateOfBirth).toISOString().split("T")[0]
            : undefined,
        }
      : undefined,
  });

  const onFormSubmit = (data: UserInfoFormData) => {
    onSubmit({
      ...data,
      gender: data.gender as "Male" | "Female" | "Prefer not to say",
      maritalStatus: data.maritalStatus as
        | "Single"
        | "Married"
        | "Divorced"
        | "Widowed",
    });
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-8">
      {/* Personal Info Section */}
      <div className="space-y-6">
        <div className="space-y-3">
          <div className="inline-block">
            <h3 className="text-xl font-bold text-slate-900 mb-1">
              Personal Information
            </h3>
            <div className="h-1 w-16 bg-linear-to-r from-[#27DC85] to-[#20C978] rounded-full"></div>
          </div>
          <p className="text-sm text-slate-600">Let's start with some basic details about you</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="fullName" className="text-sm font-medium text-slate-700">
              Full Name <span className="text-[#27DC85]">*</span>
            </Label>
            <div className="relative">
              <Input
                id="fullName"
                type="text"
                {...register("fullName")}
                placeholder="John Doe"
                className={cn(
                  "h-11 rounded-xl border-slate-300 focus-visible:ring-[#27DC85] focus-visible:border-[#27DC85] pr-10 transition-all",
                  errors.fullName &&
                    "border-red-500 focus-visible:ring-red-500 focus-visible:border-red-500"
                )}
                aria-invalid={errors.fullName ? "true" : "false"}
                aria-describedby={
                  errors.fullName ? "fullName-error" : undefined
                }
              />
              {errors.fullName && (
                <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-red-500 pointer-events-none" />
              )}
            </div>
            {errors.fullName && (
              <p
                id="fullName-error"
                className="text-xs text-red-600 flex items-start gap-1.5 animate-in fade-in slide-in-from-top-1"
                role="alert"
              >
                <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                <span>{errors.fullName.message}</span>
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-slate-700">
              Email <span className="text-[#27DC85]">*</span>
            </Label>
            <div className="relative">
              <Input
                id="email"
                type="email"
                {...register("email")}
                placeholder="john@example.com"
                className={cn(
                  "h-11 rounded-xl border-slate-300 focus-visible:ring-[#27DC85] focus-visible:border-[#27DC85] pr-10 transition-all",
                  errors.email &&
                    "border-red-500 focus-visible:ring-red-500 focus-visible:border-red-500"
                )}
                aria-invalid={errors.email ? "true" : "false"}
                aria-describedby={errors.email ? "email-error" : undefined}
              />
              {errors.email && (
                <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-red-500 pointer-events-none" />
              )}
            </div>
            {errors.email && (
              <p
                id="email-error"
                className="text-sm text-red-600 flex items-start gap-1.5 animate-in fade-in slide-in-from-top-1"
                role="alert"
              >
                <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                <span>{errors.email.message}</span>
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2.5">
            <Label htmlFor="phone" className="text-sm">
              Phone <span className="text-[#27DC85]">*</span>
            </Label>
            <div className="relative">
              <Input
                id="phone"
                type="tel"
                {...register("phone")}
                placeholder="+234 800 000 0000"
                className={cn(
                  "h-10 pr-10",
                  errors.phone &&
                    "border-red-500 focus-visible:ring-red-500 focus-visible:border-red-500"
                )}
                aria-invalid={errors.phone ? "true" : "false"}
                aria-describedby={errors.phone ? "phone-error" : undefined}
              />
              {errors.phone && (
                <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-red-500 pointer-events-none" />
              )}
            </div>
            {errors.phone && (
              <p
                id="phone-error"
                className="text-sm text-red-600 flex items-start gap-1.5 animate-in fade-in slide-in-from-top-1"
                role="alert"
              >
                <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                <span>{errors.phone.message}</span>
              </p>
            )}
          </div>

          <div className="space-y-2.5">
            <Label htmlFor="dateOfBirth" className="text-sm">
              Date of Birth <span className="text-[#27DC85]">*</span>
            </Label>
            <Controller
              name="dateOfBirth"
              control={control}
              render={({ field }) => {
                const dateValue = field.value
                  ? new Date(field.value)
                  : undefined;
                return (
                  <div className="relative">
                    <DatePicker
                      value={dateValue}
                      onChange={(date) => {
                        field.onChange(
                          date ? date.toISOString().split("T")[0] : ""
                        );
                      }}
                      placeholder="Select date of birth"
                      className={cn(
                        "[&>button]:h-10 [&>button]:w-full",
                        errors.dateOfBirth &&
                          "[&>button]:border-red-500 [&>button]:focus-visible:ring-red-500"
                      )}
                      fromYear={1900}
                      toYear={new Date().getFullYear()}
                    />
                    <input type="hidden" {...field} value={field.value || ""} />
                    {errors.dateOfBirth && (
                      <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-red-500 pointer-events-none z-10" />
                    )}
                  </div>
                );
              }}
            />
            {errors.dateOfBirth && (
              <p
                id="dateOfBirth-error"
                className="text-sm text-red-600 flex items-start gap-1.5 animate-in fade-in slide-in-from-top-1"
                role="alert"
              >
                <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                <span>{errors.dateOfBirth.message}</span>
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2.5">
            <Label htmlFor="gender" className="text-sm">
              Gender <span className="text-[#27DC85]">*</span>
            </Label>
            <Controller
              name="gender"
              control={control}
              render={({ field }) => (
                <div className="relative">
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger
                      id="gender"
                      className={cn(
                        "w-full h-10",
                        errors.gender &&
                          "border-red-500 focus-visible:ring-red-500"
                      )}
                      aria-invalid={errors.gender ? "true" : "false"}
                      aria-describedby={
                        errors.gender ? "gender-error" : undefined
                      }
                    >
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Prefer not to say">
                        Prefer not to say
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.gender && (
                    <AlertCircle className="absolute right-10 top-1/2 -translate-y-1/2 h-4 w-4 text-red-500 pointer-events-none z-10" />
                  )}
                </div>
              )}
            />
            {errors.gender && (
              <p
                id="gender-error"
                className="text-sm text-red-600 flex items-start gap-1.5 animate-in fade-in slide-in-from-top-1"
                role="alert"
              >
                <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                <span>{errors.gender.message}</span>
              </p>
            )}
          </div>

          <div className="space-y-2.5">
            <Label htmlFor="maritalStatus" className="text-sm">
              Marital Status <span className="text-[#27DC85]">*</span>
            </Label>
            <Controller
              name="maritalStatus"
              control={control}
              render={({ field }) => (
                <div className="relative">
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger
                      id="maritalStatus"
                      className={cn(
                        "w-full h-10",
                        errors.maritalStatus &&
                          "border-red-500 focus-visible:ring-red-500"
                      )}
                      aria-invalid={errors.maritalStatus ? "true" : "false"}
                      aria-describedby={
                        errors.maritalStatus ? "maritalStatus-error" : undefined
                      }
                    >
                      <SelectValue placeholder="Select marital status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Single">Single</SelectItem>
                      <SelectItem value="Married">Married</SelectItem>
                      <SelectItem value="Divorced">Divorced</SelectItem>
                      <SelectItem value="Widowed">Widowed</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.maritalStatus && (
                    <AlertCircle className="absolute right-10 top-1/2 -translate-y-1/2 h-4 w-4 text-red-500 pointer-events-none z-10" />
                  )}
                </div>
              )}
            />
            {errors.maritalStatus && (
              <p
                id="maritalStatus-error"
                className="text-sm text-red-600 flex items-start gap-1.5 animate-in fade-in slide-in-from-top-1"
                role="alert"
              >
                <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                <span>{errors.maritalStatus.message}</span>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Additional Info Section */}
      <div className="space-y-5 pt-5">
        <div className="space-y-2">
          <h3 className="text-base font-semibold text-slate-900">
            Additional Details
          </h3>
          <Separator className="bg-[#27DC85]/20" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2.5">
            <Label htmlFor="occupation" className="text-sm">
              Occupation <span className="text-[#27DC85]">*</span>
            </Label>
            <div className="relative">
              <Input
                id="occupation"
                type="text"
                {...register("occupation")}
                placeholder="Software Engineer"
                className={cn(
                  "h-10 pr-10",
                  errors.occupation &&
                    "border-red-500 focus-visible:ring-red-500 focus-visible:border-red-500"
                )}
                aria-invalid={errors.occupation ? "true" : "false"}
                aria-describedby={
                  errors.occupation ? "occupation-error" : undefined
                }
              />
              {errors.occupation && (
                <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-red-500 pointer-events-none" />
              )}
            </div>
            {errors.occupation && (
              <p
                id="occupation-error"
                className="text-sm text-red-600 flex items-start gap-1.5 animate-in fade-in slide-in-from-top-1"
                role="alert"
              >
                <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                <span>{errors.occupation.message}</span>
              </p>
            )}
          </div>

          <div className="space-y-2.5">
            <Label htmlFor="nationality" className="text-sm">
              Nationality <span className="text-[#27DC85]">*</span>
            </Label>
            <div className="relative">
              <Input
                id="nationality"
                type="text"
                {...register("nationality")}
                placeholder="Nigerian"
                className={cn(
                  "h-10 pr-10",
                  errors.nationality &&
                    "border-red-500 focus-visible:ring-red-500 focus-visible:border-red-500"
                )}
                aria-invalid={errors.nationality ? "true" : "false"}
                aria-describedby={
                  errors.nationality ? "nationality-error" : undefined
                }
              />
              {errors.nationality && (
                <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-red-500 pointer-events-none" />
              )}
            </div>
            {errors.nationality && (
              <p
                id="nationality-error"
                className="text-sm text-red-600 flex items-start gap-1.5 animate-in fade-in slide-in-from-top-1"
                role="alert"
              >
                <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                <span>{errors.nationality.message}</span>
              </p>
            )}
          </div>
        </div>

        <div className="space-y-2.5">
          <Label htmlFor="stateOfResidence" className="text-sm">
            State of Residence <span className="text-[#27DC85]">*</span>
          </Label>
          <div className="relative">
            <Input
              id="stateOfResidence"
              type="text"
              {...register("stateOfResidence")}
              placeholder="Lagos"
              className={cn(
                "h-10 pr-10",
                errors.stateOfResidence &&
                  "border-red-500 focus-visible:ring-red-500 focus-visible:border-red-500"
              )}
              aria-invalid={errors.stateOfResidence ? "true" : "false"}
              aria-describedby={
                errors.stateOfResidence ? "stateOfResidence-error" : undefined
              }
            />
            {errors.stateOfResidence && (
              <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-red-500 pointer-events-none" />
            )}
          </div>
          {errors.stateOfResidence && (
            <p
              id="stateOfResidence-error"
              className="text-sm text-red-600 flex items-start gap-1.5 animate-in fade-in slide-in-from-top-1"
              role="alert"
            >
              <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
              <span>{errors.stateOfResidence.message}</span>
            </p>
          )}
        </div>
      </div>

      {/* Submit Button */}
      <div className="pt-6">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-linear-to-r from-[#27DC85] to-[#20C978] hover:opacity-90 text-white h-12 text-base font-bold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98]"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <svg
                className="animate-spin h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Processing...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              Start Survey
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>
          )}
        </Button>
      </div>
    </form>
  );
};
