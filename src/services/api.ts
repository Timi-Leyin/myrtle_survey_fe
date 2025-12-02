import type { UserInfo, QuestionnaireAnswers } from "../hooks/useQuestionnaire";
import { API_BASE_URL } from "../config/env";

export interface SurveySubmission {
  user: UserInfo;
  questionnaire: QuestionnaireAnswers;
}

export interface SubmitQuestionnaireRequest {
  fullName: string;
  email: string;
  phone: string;
  gender: string;
  dateOfBirth: string; // ISO date string
  occupation: string;
  address?: string;
  maritalStatus: string;
  dependantsCount?: number;
  answers: QuestionnaireAnswers;
}

export interface QuestionnaireAnalysis {
  netWorth: number;
  netWorthBand: string;
  riskScore: number;
  riskProfile: string;
  persona: string;
  portfolio: {
    custom?: boolean;
    cash?: number;
    income?: number;
    growth?: number;
  };
  narrative: string;
}

export interface QuestionnaireSubmissionResponse {
  submission: {
    id: string;
    fullName: string;
    email: string;
    createdAt: string;
  };
  analysis: QuestionnaireAnalysis;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  statusCode?: number;
}

// Normalize answers to match backend expectations:
// - Keep arrays as arrays (Q2, Q8, Q15 may be arrays)
// - For Q15, convert any "SRC_OTHER: text" to "SRC_OTHER" and derive Q16 if missing
const normalizeAnswers = (
  answers: QuestionnaireAnswers
): QuestionnaireAnswers => {
  const normalized: QuestionnaireAnswers = {};
  let derivedQ16: string | undefined;

  Object.entries(answers).forEach(([qid, value]) => {
    if (Array.isArray(value)) {
      if (qid === "Q15") {
        const cleaned = value.map((v) => {
          if (typeof v === "string" && v.startsWith("SRC_OTHER:")) {
            const text = v.replace("SRC_OTHER:", "").trim();
            if (text) derivedQ16 = text;
            return "SRC_OTHER";
          }
          return v;
        });
        normalized[qid] = cleaned;
      } else {
        normalized[qid] = value;
      }
    } else if (typeof value === "string") {
      if (qid === "Q15" && value.startsWith("SRC_OTHER:")) {
        const text = value.replace("SRC_OTHER:", "").trim();
        if (text) derivedQ16 = text;
        normalized[qid] = "SRC_OTHER";
      } else {
        normalized[qid] = value;
      }
    }
  });

  // If Q16 is not set but we derived from Q15 other text, set it
  if (!normalized["Q16"] && derivedQ16) {
    normalized["Q16"] = derivedQ16;
  }

  return normalized;
};

/**
 * Submit survey response to the API
 * Single endpoint that handles both user creation and questionnaire submission
 */
export const submitSurvey = async (
  submission: SurveySubmission
): Promise<ApiResponse<QuestionnaireSubmissionResponse>> => {
  try {
    // Normalize answers to ensure Q15 is in the correct format
    const normalizedAnswers = normalizeAnswers(submission.questionnaire);

    const questionnaireRequest: SubmitQuestionnaireRequest = {
      fullName: submission.user.fullName,
      email: submission.user.email,
      phone: submission.user.phone,
      gender: submission.user.gender,
      dateOfBirth: submission.user.dateOfBirth,
      occupation: submission.user.occupation,
      address: submission.user.stateOfResidence, // Using stateOfResidence as address
      maritalStatus: submission.user.maritalStatus,
      dependantsCount: 0, // Default value
      answers: normalizedAnswers,
    };

    const response = await fetch(`${API_BASE_URL}/api/questionnaire/submit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(questionnaireRequest),
    });

    let data: any;
    const contentType = response.headers.get("content-type");

    if (contentType?.includes("application/json")) {
      try {
        data = await response.json();
      } catch (parseError) {
        const text = await response.text();
        data = { message: text || `HTTP ${response.status}` };
      }
    } else {
      const text = await response.text();
      try {
        data = JSON.parse(text);
      } catch {
        data = { message: text || `HTTP ${response.status}` };
      }
    }

    if (response.ok || response.status === 201) {
      return {
        success: true,
        data: data.data || data,
        message: data.message || "Questionnaire submitted successfully",
        statusCode: response.status,
      };
    } else if (response.status === 400) {
      // Check if user already exists
      const errorMessage = data.message || data.error || "";
      const isUserExists =
        errorMessage.toLowerCase().includes("already exists") ||
        errorMessage.toLowerCase().includes("user with email");

      if (isUserExists) {
        return {
          success: false,
          error:
            "An account with this email already exists. Please use a different email address or contact support if this is your account.",
          statusCode: response.status,
        };
      }

      // Other 400 errors (validation errors)
      return {
        success: false,
        error:
          data.message ||
          data.error ||
          "Validation error. Please check your input and try again.",
        statusCode: response.status,
      };
    } else {
      return {
        success: false,
        error:
          data.message ||
          data.error ||
          `HTTP ${response.status}: ${response.statusText}`,
        statusCode: response.status,
      };
    }
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Network error. Please check your connection.",
    };
  }
};
