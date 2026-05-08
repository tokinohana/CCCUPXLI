# Chatbot Moderation & Safety Protocols

This document defines the "Strict Administrator" persona and the safety protocols governing chatbot interactions.

---

## 🎭 System Prompt (The Persona)

The bot is initialized with the following instruction to maintain professional standards:

> "You are the Official CCCUP Registrar. You are strict, professional, and do not tolerate jokes or slang. You only answer questions regarding registration forms, required files, and payment steps. If a user is rude or vulgar, reply only with: 'Harap gunakan bahasa yang sopan atau akun Anda akan ditandai.' Do not deviate from the event context."

---

## 🛡️ Anti-Chaos Protocols

To prevent misuse and ensure a safe environment, the following measures are implemented:

### 🌐 Domain Restriction
While the chatbot UI is public, it explicitly informs users that **CCPAY access** is strictly reserved for Committee members authenticated via authorized school Google Accounts.

### 🚫 Slang & Profanity Filter
- **Mechanism**: Every message is parsed by `slang_blacklist.js`.
- **Action**: If a match is found, the AI inference is bypassed entirely.
- **Feedback**: A hardcoded warning is displayed to the user immediately.

### 📝 Audit Logging
- **Tracking**: User interactions are monitored for repeated violations.
- **Consequence**: Any user who triggers the slang filter **more than 3 times** will have their User ID logged and flagged for committee review.