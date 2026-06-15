import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/regis';

// ─────────────────────────────────────────────────────────────────────────────
// Axios instance with JWT interceptors
// ─────────────────────────────────────────────────────────────────────────────
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT access token to every outgoing request
api.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem('regis_access_token');
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle 401 responses: try to refresh token, or force logout
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Only try refresh once per request
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem('regis_refresh_token');
      if (refreshToken) {
        try {
          const res = await axios.post(`${API_BASE_URL}/token/refresh/`, {
            refresh: refreshToken,
          });
          const newAccess = res.data.access;
          localStorage.setItem('regis_access_token', newAccess);
          originalRequest.headers.Authorization = `Bearer ${newAccess}`;
          return api(originalRequest);
        } catch (refreshError) {
          // Refresh failed - clear tokens and redirect
          clearAuth();
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      } else {
        clearAuth();
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// Auth helpers
// ─────────────────────────────────────────────────────────────────────────────
export function clearAuth() {
  localStorage.removeItem('regis_access_token');
  localStorage.removeItem('regis_refresh_token');
}

export function isAuthenticated() {
  return !!localStorage.getItem('regis_access_token');
}

// ─────────────────────────────────────────────────────────────────────────────
// Auth endpoints
// ─────────────────────────────────────────────────────────────────────────────
export async function login(email, password) {
  const res = await api.post('/login/', { email, password });
  const { access, refresh, team } = res.data;
  localStorage.setItem('regis_access_token', access);
  localStorage.setItem('regis_refresh_token', refresh);
  return team; // team profile object
}

export async function register(payload) {
  // payload: { email, password, phone, jenjang, school, nama_tim, competition }
  const res = await api.post('/register/', payload);
  const { access, refresh, team } = res.data;
  localStorage.setItem('regis_access_token', access);
  localStorage.setItem('regis_refresh_token', refresh);
  return team;
}

export async function logout() {
  const refresh = localStorage.getItem('regis_refresh_token');
  try {
    await api.post('/logout/', { refresh });
  } catch {
    // Ignore errors on logout
  }
  clearAuth();
}

// ─────────────────────────────────────────────────────────────────────────────
// Dashboard
// ─────────────────────────────────────────────────────────────────────────────
export async function getDashboard() {
  const res = await api.get('/dashboard/');
  return res.data;
}

// ─────────────────────────────────────────────────────────────────────────────
// Members
// ─────────────────────────────────────────────────────────────────────────────
export async function addMember(formData) {
  // formData is a FormData instance with member fields + files
  const res = await api.post('/add_member/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
}

export async function editMember(memberId, formData) {
  // formData is a FormData instance with member fields + files
  const res = await api.put(`/edit_member/${memberId}/`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
}

export async function deleteMember(memberId) {
  const res = await api.delete(`/delete_member/${memberId}/`);
  return res.data;
}

// ─────────────────────────────────────────────────────────────────────────────
// Team Files
// ─────────────────────────────────────────────────────────────────────────────
export async function uploadTeamFile(fileType, file) {
  const formData = new FormData();
  formData.append('file', file);
  const res = await api.post(`/upload/${fileType}/`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
}

export async function deleteTeamFile(fileType) {
  const res = await api.delete(`/delete_file/${fileType}/`);
  return res.data;
}

// ─────────────────────────────────────────────────────────────────────────────
// Team Info (OtherInfo)
// ─────────────────────────────────────────────────────────────────────────────
export async function saveTeamInfo(data) {
  // data is a plain object: { coach_name: "...", coach_email: "...", ... }
  const res = await api.post('/add_info/', data);
  return res.data;
}

// ─────────────────────────────────────────────────────────────────────────────
// Submit / Unsubmit
// ─────────────────────────────────────────────────────────────────────────────
export async function submitRegistration() {
  const res = await api.post('/submit/');
  return res.data;
}

export async function unsubmitRegistration() {
  const res = await api.post('/unsubmit/');
  return res.data;
}

// ─────────────────────────────────────────────────────────────────────────────
// Rekening
// ─────────────────────────────────────────────────────────────────────────────
export async function updateRekening(data) {
  // data: { bank_name, account_number, account_holder }
  const res = await api.post('/update-rekening/', data);
  return res.data;
}

// ─────────────────────────────────────────────────────────────────────────────
// Subkategori
// ─────────────────────────────────────────────────────────────────────────────
export async function saveSubkategori(memberId, subkategori) {
  const res = await api.post('/save-subkategori/', { member_id: memberId, subkategori });
  return res.data;
}

// ─────────────────────────────────────────────────────────────────────────────
// AI Chat Consultant
// ─────────────────────────────────────────────────────────────────────────────
export async function getChatStatus() {
  const res = await api.get('/chat/status/');
  return res.data;
}

export async function sendChatMessage(message) {
  const res = await api.post('/chat/', { message });
  return res.data;
}

export async function clearChatHistory() {
  const res = await api.post('/chat/clear/');
  return res.data;
}

export default api;
