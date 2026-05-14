# Chatbot Routing & Data Flow

This document describes the data flow between the client-side AI and the Django backend.

---

## 📂 Static Routes (Frontend)

These routes serve the necessary assets for the chatbot to function locally in the user's browser.

| Path | Description |
| :--- | :--- |
| `/static/chatbot/` | Contains `transformers.js` library and `ChatWidget.js`. |
| `/static/models/` | Local directory for the quantized ONNX model files (allows offline/fast loading). |

---

## 🔌 Internal API Endpoints (Read-Only)

The chatbot accesses these Django endpoints to provide real-time data to students. All requests are **strictly GET** and optimized for low latency.

### 1. Competition Live Status
- **Endpoint**: `/api/regis/live-slots/`
- **Use Case**: User asks: *"Futsal masih ada slot gak?"*
- **Response**: A JSON list of competitions with their remaining quotas.

### 2. Requirement Lookup
- **Endpoint**: `/api/regis/requirements/<competition_name>/`
- **Use Case**: User asks: *"Syarat buat Taekwondo apa aja?"*
- **Response**: Details on required base inputs and sport-specific files (Akte, Sertifikat, etc.).

### 3. Personal Status Retrieval
- **Endpoint**: `/api/regis/my-status/`
- **Use Case**: User asks: *"Pendaftaran gue udah diterima belum?"*
- **Authentication**: **Requires active session login.**
- **Response**: Current `RegisStatus` (e.g., `PENDING`, `SUBMITTED`, `ACCEPTED`).