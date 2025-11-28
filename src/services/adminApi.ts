import { API_BASE_URL } from "../config/env";

export interface Submission {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  gender?: string;
  dateOfBirth?: string;
  occupation?: string;
  address?: string;
  maritalStatus?: string;
  dependantsCount?: number;
  createdAt: string;
  answers?: Record<string, string>;
  netWorth?: number;
  netWorthBand?: string;
  riskScore?: number;
  riskProfile?: string;
  persona?: string;
  portfolio?: {
    custom?: boolean;
    cash?: number;
    income?: number;
    growth?: number;
  };
  narrative?: string;
  // For list view (from /api/admin/questionnaires)
  // For detail view (from /api/admin/questionnaires/:id) - same structure
}

export interface DashboardStats {
  stats: {
    totalSubmissions: number;
    totalNetWorth: number;
    averageNetWorth: number;
  };
  personaDistribution: Record<string, number>;
  riskProfileDistribution: Record<string, number>;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  data: {
    token: string;
    admin: {
      id: string;
      username: string;
      email: string;
    };
  };
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: {
    questionnaires: T[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
  message?: string;
}

export interface QuestionnaireDetailResponse {
  success: boolean;
  data: {
    questionnaire: Submission;
  };
  message?: string;
}

export interface DashboardStatsResponse {
  success: boolean;
  data: DashboardStats;
  message?: string;
}

/**
 * Get authentication token from localStorage
 */
const getAuthToken = (): string | null => {
  return localStorage.getItem("adminToken");
};

/**
 * Handle API errors with proper messages
 */
const handleApiError = (response: Response, data: any): never => {
  if (response.status === 401) {
    // Clear auth on unauthorized
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminAuth");
    localStorage.removeItem("adminId");
    localStorage.removeItem("adminUsername");
    localStorage.removeItem("adminEmail");
    
    const message = data.message || "Unauthorized. Please login again.";
    throw new Error(message);
  }
  
  throw new Error(data.message || data.error || `HTTP ${response.status}: ${response.statusText}`);
};

/**
 * Admin login
 */
export const adminLogin = async (
  credentials: LoginRequest
): Promise<LoginResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(credentials),
    });

    const data = await response.json();

    if (response.ok && data.success) {
      // Store token and admin info
      const token = data.data?.token;
      const admin = data.data?.admin;

      if (token) {
        localStorage.setItem("adminToken", token);
      }
      
      if (admin) {
        localStorage.setItem("adminAuth", "true");
        localStorage.setItem("adminId", admin.id);
        localStorage.setItem("adminUsername", admin.username);
        localStorage.setItem("adminEmail", admin.email);
      }

      return data;
    } else {
      throw new Error(data.message || "Login failed");
    }
  } catch (error) {
    throw error instanceof Error ? error : new Error("Network error during login");
  }
};

/**
 * Get dashboard statistics
 */
export const fetchDashboardStats = async (): Promise<DashboardStats> => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error("Not authenticated");
    }

    const response = await fetch(`${API_BASE_URL}/api/admin/dashboard`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      handleApiError(response, data);
    }

    return data.data;
  } catch (error) {
    throw error instanceof Error
      ? error
      : new Error("Failed to fetch dashboard stats");
  }
};

/**
 * Fetch all survey submissions (questionnaires) with pagination
 */
export const fetchSubmissions = async (
  page: number = 1,
  limit: number = 20
): Promise<{ submissions: Submission[]; pagination: { page: number; limit: number; total: number; totalPages: number } }> => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error("Not authenticated");
    }

    const response = await fetch(
      `${API_BASE_URL}/api/admin/questionnaires?page=${page}&limit=${limit}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data: PaginatedResponse<Submission> = await response.json();

    if (!response.ok || !data.success) {
      handleApiError(response, data);
    }

    return {
      submissions: data.data.questionnaires || [],
      pagination: data.data.pagination,
    };
  } catch (error) {
    throw error instanceof Error
      ? error
      : new Error("Failed to fetch submissions");
  }
};

/**
 * Fetch a single submission by ID
 */
export const fetchSubmissionById = async (id: string): Promise<Submission> => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error("Not authenticated");
    }

    const response = await fetch(`${API_BASE_URL}/api/admin/questionnaires/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data: QuestionnaireDetailResponse = await response.json();

    if (!response.ok || !data.success) {
      handleApiError(response, data);
    }

    return data.data.questionnaire;
  } catch (error) {
    throw error instanceof Error
      ? error
      : new Error("Failed to fetch submission");
  }
};
