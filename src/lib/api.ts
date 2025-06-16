const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

// API client configuration
export const api = {
  // Auth endpoints
  auth: {
    login: `${API_BASE_URL}/auth/login`,
    register: `${API_BASE_URL}/auth/register`,
  },

  // User endpoints
  users: {
    getAll: `${API_BASE_URL}/v1/users`,
    update: (id: number) => `${API_BASE_URL}/v1/users/${id}`,
    delete: (id: number) => `${API_BASE_URL}/v1/users/${id}`,
  },

  // Laporan endpoints
  laporan: {
    create: `${API_BASE_URL}/v1/laporan`,
    getMy: `${API_BASE_URL}/v1/laporan/saya`,
    getAll: `${API_BASE_URL}/v1/laporan/semua`,
    getById: (id: number) => `${API_BASE_URL}/v1/laporan/${id}`,
    update: (id: number) => `${API_BASE_URL}/v1/laporan/${id}`,
    delete: (id: number) => `${API_BASE_URL}/v1/laporan/${id}`,
  },

  // Demo endpoint
  demo: `${API_BASE_URL}/v1/demo`,
};

// Helper function untuk HTTP requests dengan JWT token (DIPERBAIKI)
export const apiRequest = async (url: string, options: RequestInit = {}) => {
  // Ambil token dari localStorage
  const token = localStorage.getItem("authToken");

  // Bangun URL lengkap - jika url sudah lengkap, gunakan apa adanya, jika tidak tambahkan base URL
  const fullUrl = url.startsWith("http") ? url : `${API_BASE_URL}${url}`;

  const config: RequestInit = {
    ...options,
    headers: {
      "Content-Type": "application/json",
      // Sertakan header Authorization jika token ada
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  };

  try {
    const response = await fetch(fullUrl, config);

    if (!response.ok) {
      // Coba ambil pesan error dari response body
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch {
        // Jika tidak bisa parse JSON, gunakan status text
        errorMessage = `${response.status} ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }

    // Jika response tidak memiliki body (misal status 204), kembalikan null
    const text = await response.text();
    return text ? JSON.parse(text) : null;
  } catch (error) {
    // Re-throw error dengan informasi tambahan
    console.error("API Request failed:", error);
    throw error;
  }
};

// Auth functions
export const authService = {
  login: async (username: string, password: string) => {
    const response = await fetch(api.auth.login, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      // Coba ambil pesan error yang lebih spesifik
      let errorMessage = "Login gagal";
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch {
        errorMessage = `Login gagal: ${response.status} ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }

    return response.json();
  },

  register: async (data: {
    username: string;
    password: string;
    fullName: string;
    role: string;
  }) => {
    const { ...payload } = data;
    const response = await fetch(api.auth.register, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      // Coba ambil pesan error dari backend
      const errorData = await response
        .json()
        .catch(() => ({ message: "Registrasi gagal" }));
      throw new Error(errorData.message || "Registrasi gagal");
    }

    return response.text();
  },
};

// Helper functions untuk endpoint-endpoint spesifik
export const userService = {
  // Ambil semua user (untuk admin)
  getAll: () => apiRequest("/v1/users"),

  // Update user
  update: (id: number, data: any) =>
    apiRequest(`/v1/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  // Hapus user
  delete: (id: number) =>
    apiRequest(`/v1/users/${id}`, {
      method: "DELETE",
    }),
};
