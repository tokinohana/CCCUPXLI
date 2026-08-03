import { apiRequest } from "./api";

export const endpoints = {
  register: (body) => apiRequest("/api/regis/register/", { method: "POST", body, auth: false }),

  login: (body) => apiRequest("/api/regis/login/", { method: "POST", body, auth: false }),

  logout: (refresh) => apiRequest("/api/regis/logout/", { method: "POST", body: { refresh } }),

  dashboard: () => apiRequest("/api/regis/dashboard/"),

  competitions: () => apiRequest("/api/regis/competitions/", { auth: false }),

  addMember: (form) =>
    apiRequest("/api/regis/add_member/", { method: "POST", body: form, multipart: true }),

  editMember: (id, form) =>
    apiRequest(`/api/regis/edit_member/${id}/`, { method: "PUT", body: form, multipart: true }),

  deleteMember: (id) => apiRequest(`/api/regis/delete_member/${id}/`, { method: "DELETE" }),

  uploadFile: (fileType, file) => {
    const form = new FormData();
    form.append("file", file);
    return apiRequest(`/api/regis/upload/${fileType}/`, {
      method: "POST",
      body: form,
      multipart: true,
    });
  },

  deleteFile: (fileType) => apiRequest(`/api/regis/delete_file/${fileType}/`, { method: "DELETE" }),

  addInfo: (body) => apiRequest("/api/regis/add_info/", { method: "POST", body }),

  submit: () => apiRequest("/api/regis/submit/", { method: "POST" }),

  unsubmit: () => apiRequest("/api/regis/unsubmit/", { method: "POST" }),

  updateRekening: (body) => apiRequest("/api/regis/update-rekening/", { method: "POST", body }),

  saveSubkategori: (body) => apiRequest("/api/regis/save-subkategori/", { method: "POST", body }),

  chatStatus: () => apiRequest("/api/regis/chat/status/"),
};