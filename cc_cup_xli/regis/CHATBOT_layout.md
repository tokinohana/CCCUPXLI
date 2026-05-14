# Chatbot Layout & UI Specification

This document describes the user interface and frontend behavioral logic of the registration assistant.

---

## UI Components

### 🟢 Floating Chat Trigger
- **Description**: A fixed FAB (Floating Action Button) at the bottom-right of the screen.
- **Behavior**: Toggles the visibility of the Chat Container.

### 💬 Chat Container
The main window where interactions occur. It consists of the following:

- **Header**: 
    - Title: "Admin CCCUP Assistant"
    - Status Indicator: Visual cue for system state (e.g., "Online/Strict Mode").
- **Message Feed**: 
    - Scrollable area with distinct styles for User and Bot messages.
    - Automatic scroll-to-bottom on new messages.
- **Typing Indicator**: 
    - A subtle animation (dots or pulse).
    - Triggered while `Transformers.js` is performing local inference.

### ⌨️ Input Field
- **Constraint**: Maximum length of **150 characters**. 
    - *Purpose*: Prevents long-form "jailbreak" prompts or excessive load on local inference.
- **Cooldown**: The "Send" button is disabled for **3 seconds** after each message to prevent spamming.

### ⚡ Quick Action Chips
Pre-defined buttons for common questions to streamline user experience:
- `"Cara upload foto?"`
- `"Syarat Basket apa?"`
- `"Status saya apa?"`

---

## Interaction Logic

### 🤖 Local Inference
The AI model runs directly in the browser using a **Web Worker**. This ensures the main registration form remains responsive and data remains private where possible.

### 🛡️ Sanitization Layer
All user input is passed through a local `slang_blacklist.js` filter **before** reaching the AI model. This acts as a first line of defense against inappropriate content.

### 🧠 Context Management
- **History Limit**: The conversation history is restricted to the **last 5 messages**.
- **Reasoning**: Prevents users from "gaslighting" or prompt-engineering the bot into inappropriate behavior over long sessions.