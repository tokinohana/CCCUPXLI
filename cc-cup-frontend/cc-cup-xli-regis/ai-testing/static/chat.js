(() => {
  const mount = document.getElementById("chat-root");
  if (!mount) return;

  const state = {
    open: false,
    sending: false,
    docs: JSON.parse(mount.dataset.docs || "[]"),
    adminPhone: mount.dataset.adminPhone || "",
    settingsOpen: false,
    keySet: false,
  };

  const el = (tag, attrs = {}, children = []) => {
    const node = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (k === "class") node.className = v;
      else if (k === "dataset" && v && typeof v === "object") {
        for (const [dk, dv] of Object.entries(v)) node.dataset[dk] = String(dv);
      } else if (k === "text") node.textContent = String(v);
      else if (k.startsWith("on") && typeof v === "function") node.addEventListener(k.slice(2), v);
      else node.setAttribute(k, String(v));
    }
    for (const c of children) node.appendChild(c);
    return node;
  };

  const widget = el("div", { class: "chat-widget" });
  const launcherBadge = el("span", { class: "chat-launcher-badge" });
  const launcher = el(
    "button",
    {
      type: "button",
      class: "chat-launcher",
      "aria-label": "Open chat",
    },
    [el("span", { text: "Chat" }), launcherBadge]
  );

  const titleMain = el("div", { class: "chat-title-main", text: "Konsultan CC CUP" });
  const titleSub = el("div", {
    class: "chat-title-sub",
    text: state.docs.length > 0 ? `${state.docs.length} dokumen siap` : "Unggah SOP untuk mulai",
  });

  const closeBtn = el("button", { type: "button", class: "chat-action-btn", text: "Tutup" });
  const clearBtn = el("button", { type: "button", class: "chat-action-btn", text: "Hapus" });
  const keyBtn = el("button", { type: "button", class: "chat-action-btn", text: "Kunci" });

  const header = el("div", { class: "chat-header" }, [
    el("div", { class: "chat-title" }, [titleMain, titleSub]),
    el("div", { class: "chat-actions" }, [keyBtn, clearBtn, closeBtn]),
  ]);

  const body = el("div", { class: "chat-body", role: "log", "aria-live": "polite" });

  const settingsTitle = el("div", { class: "chat-settings-title", text: "Pengaturan Chat" });
  const settingsHint = el("div", {
    class: "chat-settings-hint",
    text: "Konfigurasi API Groq di bawah ini.",
  });

  const keyInput = el("input", {
    class: "chat-settings-input",
    type: "password",
    placeholder: "Masukkan Groq API Key (gsk_...)…",
    autocomplete: "off",
  });
  const modelInput = el("input", {
    class: "chat-settings-input",
    type: "text",
    placeholder: "Model (opsional), default: llama-3.3-70b-versatile",
    autocomplete: "off",
  });

  const tokenCapLabel = el("div", { class: "chat-settings-label", text: "Batas Token API: 10000" });
  const tokenCapSlider = el("input", {
    class: "chat-settings-input",
    type: "range",
    min: "1000",
    max: "100000",
    step: "1000",
    value: "10000",
  });
  const tokenUsageInfo = el("div", { class: "chat-settings-hint", text: "Penggunaan: 0 / 10000 tokens" });

  const saveKeyBtn = el("button", { type: "button", class: "chat-settings-save", text: "Simpan" });
  const forgetKeyBtn = el("button", { type: "button", class: "chat-settings-forget", text: "Hapus" });
  const settingsActions = el("div", { class: "chat-settings-actions" }, [forgetKeyBtn, saveKeyBtn]);
  const settingsPanel = el("div", { class: "chat-settings", dataset: { open: "0" } }, [
    settingsTitle,
    settingsHint,
    el("div", { class: "chat-settings-label", text: "Groq API Key" }),
    keyInput,
    el("div", { class: "chat-settings-label", text: "Model (Optional)" }),
    modelInput,
    tokenCapLabel,
    tokenCapSlider,
    tokenUsageInfo,
    settingsActions,
  ]);

  const input = el("textarea", {
    class: "chat-input",
    placeholder: "Tanyakan seputar kompetisi CC CUP…",
    rows: "2",
  });
  const sendBtn = el("button", { type: "button", class: "chat-send", text: "→" });

  const footer = el("div", { class: "chat-footer" }, [input, sendBtn]);
  const panel = el("div", { class: "chat-panel", dataset: { open: "0" } }, [
    header,
    settingsPanel,
    body,
    footer,
  ]);

  widget.appendChild(launcher);
  widget.appendChild(panel);
  mount.replaceWith(widget);

  const init = async () => {
    try {
      const res = await fetch("/api/settings", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
      const data = await res.json();
      if (data.token_usage !== undefined) {
        tokenUsageInfo.textContent = `Penggunaan: ${data.token_usage} / ${data.token_cap} tokens`;
        tokenCapSlider.value = data.token_cap;
        tokenCapLabel.textContent = `Batas Token API: ${data.token_cap}`;
      }
    } catch (e) {}
  };
  init();

  const setOpen = (next) => {
    state.open = next;
    panel.dataset.open = next ? "1" : "0";
    launcher.setAttribute("aria-label", next ? "Close chat" : "Open chat");
    if (next) {
      setTimeout(() => input.focus(), 0);
      body.scrollTop = body.scrollHeight;
    }
  };

  const setSettingsOpen = (next) => {
    state.settingsOpen = next;
    settingsPanel.dataset.open = next ? "1" : "0";
    if (next) setTimeout(() => keyInput.focus(), 0);
  };

  const setDocState = (docs) => {
    state.docs = docs || [];
    titleSub.textContent = state.docs.length > 0 ? `${state.docs.length} documents ready` : "Upload SOPs to start";
    launcherBadge.style.display = state.docs.length > 0 ? "block" : "none";
  };

  const appendMessage = (role, text, sources = []) => {
    const bubble = el("div", { class: "chat-bubble", text });
    const msg = el("div", { class: "chat-msg", dataset: { role } }, [bubble]);
    
    if (sources && sources.length > 0) {
      const sourceList = el("div", { class: "chat-sources" }, [
        el("span", { class: "chat-sources-label", text: "Sumber: " }),
        ...sources.map(s => el("span", { class: "chat-source-badge", text: s }))
      ]);
      msg.appendChild(sourceList);
    }

    body.appendChild(msg);
    body.scrollTop = body.scrollHeight;
    return msg;
  };

  const appendTyping = () => {
    const bubble = el("div", { class: "chat-bubble" }, [
      el("span", { class: "chat-typing" }, [
        el("span", { class: "chat-dot" }),
        el("span", { class: "chat-dot" }),
        el("span", { class: "chat-dot" }),
      ]),
    ]);
    const msg = el("div", { class: "chat-msg", dataset: { role: "assistant" } }, [bubble]);
    body.appendChild(msg);
    body.scrollTop = body.scrollHeight;
    return msg;
  };

  const setSending = (next) => {
    state.sending = next;
    sendBtn.disabled = next;
    input.disabled = next;
  };

  const greet = () => {
    body.innerHTML = "";
    if (state.docs.length > 0) {
      appendMessage("assistant", `Halo! Saya Konsultan CC CUP. Saya siap membantu Anda dengan informasi pendaftaran berdasarkan ${state.docs.length} dokumen yang tersedia. Ada yang bisa saya bantu?`);
    } else {
      appendMessage("assistant", "Selamat datang di layanan bantuan CC CUP! Silakan unggah dokumen SOP kompetisi agar saya dapat membantu Anda dengan informasi pendaftaran yang akurat.");
    }
  };

  const send = async () => {
    if (state.sending) return;
    const text = (input.value || "").trim();
    if (!text) return;
    input.value = "";
    appendMessage("user", text);
    const typing = appendTyping();
    setSending(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      const data = await res.json().catch(() => ({}));
      const reply = typeof data.reply === "string" ? data.reply : "Respons server tidak terduga.";
      if (data.usage !== undefined) {
        tokenUsageInfo.textContent = `Penggunaan: ${data.usage} / ${data.cap} tokens`;
      }
      typing.remove();
      appendMessage("assistant", reply || "Tidak ada respons yang dihasilkan.", data.sources || []);
    } catch (e) {
      typing.remove();
      appendMessage("assistant", "Kesalahan. Silakan coba lagi.");
    } finally {
      setSending(false);
      input.focus();
    }
  };

  const clearAll = async () => {
    if (state.sending) return;
    setSending(true);
    try {
      await fetch("/api/clear", { method: "POST" });
      setDocState([]);
      greet();
    } catch (e) {
      appendMessage("assistant", "Tidak dapat menghapus saat ini. Silakan coba lagi.");
    } finally {
      setSending(false);
    }
  };

  tokenCapSlider.addEventListener("input", () => {
    tokenCapLabel.textContent = `Batas Token API: ${tokenCapSlider.value}`;
  });

  const saveSettings = async (forget) => {
    if (state.sending) return;
    setSending(true);
    try {
      let payload = {
        groq_api_key: forget ? "" : (keyInput.value || ""),
        groq_model: forget ? "" : (modelInput.value || ""),
        token_cap: tokenCapSlider.value
      };

      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        appendMessage("assistant", typeof data.error === "string" ? data.error : "Gagal menyimpan API key.");
        return;
      }
      state.keySet = !!data.key_set;
      
      if (data.token_usage !== undefined) {
        tokenUsageInfo.textContent = `Usage: ${data.token_usage} / ${data.token_cap} tokens`;
        tokenCapSlider.value = data.token_cap;
        tokenCapLabel.textContent = `API Token Cap: ${data.token_cap}`;
      }
      
      if (forget) {
        appendMessage("assistant", "API key Groq dihapus untuk sesi ini.");
      } else if (state.keySet) {
        appendMessage("assistant", "API key Groq tersimpan untuk sesi ini.");
      } else {
        appendMessage("assistant", "API key Groq kosong. Chat akan tetap di mode demo.");
      }
      keyInput.value = "";
      setSettingsOpen(false);
      input.focus();
    } catch (e) {
      appendMessage("assistant", "Network error. Coba lagi.");
    } finally {
      setSending(false);
    }
  };

  launcher.addEventListener("click", () => setOpen(!state.open));
  closeBtn.addEventListener("click", () => setOpen(false));
  clearBtn.addEventListener("click", clearAll);
  keyBtn.addEventListener("click", () => setSettingsOpen(!state.settingsOpen));
  saveKeyBtn.addEventListener("click", () => saveSettings(false));
  forgetKeyBtn.addEventListener("click", () => saveSettings(true));
  sendBtn.addEventListener("click", send);

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  });

  setDocState(state.docs);
  greet();
})();
