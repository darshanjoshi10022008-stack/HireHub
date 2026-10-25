const BASE_URL = import.meta.env.VITE_API_URL || "";

export const apiFetch = async (endpoint, options = {}) => {
  const token = localStorage.getItem("hirehubToken");

  const headers = {
    ...options.headers,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // If body is not FormData, set Content-Type to application/json
  if (options.body && !(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
    if (typeof options.body !== "string") {
      options.body = JSON.stringify(options.body);
    }
  }

  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const fullUrl = `${BASE_URL}${cleanEndpoint}`;

  try {
    const res = await fetch(fullUrl, {
      ...options,
      headers,
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      if (res.status === 401 && token) {
        // Expired token
        localStorage.removeItem("hirehubToken");
        localStorage.removeItem("hirehubUser");
      }
      const error = new Error(data.message || `Request failed with status ${res.status}`);
      error.status = res.status;
      error.data = data;
      error.code = data.code;
      error.isEmailVerified = data.isEmailVerified;
      throw error;
    }

    return data;
  } catch (error) {
    throw error;
  }
};

// Auth APIs
export const authApi = {
  register: (body) => apiFetch("/api/auth/register", { method: "POST", body }),
  login: (body) => apiFetch("/api/auth/login", { method: "POST", body }),
  googleLogin: (body) => apiFetch("/api/auth/google", { method: "POST", body }),
  verifyEmail: (token) => apiFetch(`/api/auth/verify-email/${token}`),
  resendVerification: (body) => apiFetch("/api/auth/resend-verification", { method: "POST", body }),
  forgotPassword: (body) => apiFetch("/api/auth/forgot-password", { method: "POST", body }),
  resetPassword: (token, body) => apiFetch(`/api/auth/reset-password/${token}`, { method: "POST", body }),
  getMe: () => apiFetch("/api/auth/me"),
  updatePassword: (body) => apiFetch("/api/auth/update-password", { method: "PUT", body }),
};

// Job APIs
export const jobApi = {
  getJobs: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return apiFetch(`/api/jobs${qs ? `?${qs}` : ""}`);
  },
  getFeaturedJobs: () => apiFetch("/api/jobs/featured"),
  getCategories: () => apiFetch("/api/jobs/categories"),
  getJobById: (id) => apiFetch(`/api/jobs/${id}`),
  createJob: (body) => apiFetch("/api/jobs", { method: "POST", body }),
  updateJob: (id, body) => apiFetch(`/api/jobs/${id}`, { method: "PUT", body }),
  deleteJob: (id) => apiFetch(`/api/jobs/${id}`, { method: "DELETE" }),
  getRecruiterJobs: () => apiFetch("/api/jobs/recruiter/my-jobs"),
  updateJobStatus: (id, status) => apiFetch(`/api/jobs/${id}/status`, { method: "PATCH", body: { status } }),
};

// Company APIs
export const companyApi = {
  getCompanies: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return apiFetch(`/api/companies${qs ? `?${qs}` : ""}`);
  },
  getCompanyById: (id) => apiFetch(`/api/companies/${id}`),
  getMyCompany: () => apiFetch("/api/companies/my-company"),
  saveCompany: (body) => apiFetch("/api/companies", { method: "POST", body }),
  uploadLogo: (formData) => apiFetch("/api/companies/upload-logo", { method: "POST", body: formData }),
};

// Candidate APIs
export const candidateApi = {
  getProfile: () => apiFetch("/api/candidate/profile"),
  updateProfile: (body) => apiFetch("/api/candidate/profile", { method: "PUT", body }),
  uploadResume: (formData) => apiFetch("/api/candidate/upload-resume", { method: "POST", body: formData }),
  toggleSaveJob: (jobId) => apiFetch(`/api/candidate/saved-jobs/${jobId}`, { method: "POST" }),
  getSavedJobs: () => apiFetch("/api/candidate/saved-jobs"),
  getDashboardStats: () => apiFetch("/api/candidate/dashboard-stats"),
};

// Application APIs
export const applicationApi = {
  applyToJob: (jobId, formDataOrBody) =>
    apiFetch(`/api/applications/apply/${jobId}`, { method: "POST", body: formDataOrBody }),
  checkJobApplied: (jobId) => apiFetch(`/api/applications/check/${jobId}`),
  getMyApplications: () => apiFetch("/api/applications/my-applications"),
  withdrawApplication: (id) => apiFetch(`/api/applications/withdraw/${id}`, { method: "DELETE" }),
  getRecruiterApplications: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return apiFetch(`/api/applications/recruiter${qs ? `?${qs}` : ""}`);
  },
  getJobApplications: (jobId) => apiFetch(`/api/applications/job/${jobId}`),
  updateStatus: (id, status, note) =>
    apiFetch(`/api/applications/${id}/status`, { method: "PATCH", body: { status, note } }),
};

// Admin APIs
export const adminApi = {
  getStats: () => apiFetch("/api/admin/stats"),
  getUsers: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return apiFetch(`/api/admin/users${qs ? `?${qs}` : ""}`);
  },
  updateUserStatus: (id, status) => apiFetch(`/api/admin/users/${id}/status`, { method: "PATCH", body: { status } }),
  getAllJobs: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return apiFetch(`/api/admin/jobs${qs ? `?${qs}` : ""}`);
  },
  moderateJob: (id, status) => apiFetch(`/api/admin/jobs/${id}/moderate`, { method: "PATCH", body: { status } }),
  getAllCompanies: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return apiFetch(`/api/admin/companies${qs ? `?${qs}` : ""}`);
  },
  toggleVerifyCompany: (id) => apiFetch(`/api/admin/companies/${id}/verify`, { method: "PATCH" }),
};
