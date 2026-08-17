import { apiRequest } from "./api";

export const endpoints = {
  register: (body) => apiRequest("/register/", { method: "POST", body, auth: false }),

  login: (body) => apiRequest("/login/", { method: "POST", body, auth: false }),

  logout: (refresh) => apiRequest("/logout/", { method: "POST", body: { refresh } }),

  dashboard: () => apiRequest("/dashboard/"),

  competitions: () => apiRequest("/competitions/", { auth: false }),

  addMember: (form) =>
    apiRequest("/add_member/", { method: "POST", body: form }),

  editMember: (id, form) =>
    apiRequest(`/edit_member/${id}/`, { method: "PUT", body: form }),

  deleteMember: (id) => apiRequest(`/delete_member/${id}/`, { method: "DELETE" }),

  uploadFile: (fileType, { url, public_id, format }) =>
    apiRequest(`/upload/${fileType}/`, { method: "POST", body: { url, public_id, format }, auth: true }),

  deleteFile: (fileType) => apiRequest(`/delete_file/${fileType}/`, { method: "DELETE" }),

  addInfo: (body) => apiRequest("/add_info/", { method: "POST", body }),

  submit: () => apiRequest("/submit/", { method: "POST" }),

  unsubmit: () => apiRequest("/unsubmit/", { method: "POST" }),

  updateRekening: (body) => apiRequest("/update-rekening/", { method: "POST", body }),

  saveSubkategori: (body) => apiRequest("/save-subkategori/", { method: "POST", body }),

  chatStatus: () => apiRequest("/chat/status/"),
};