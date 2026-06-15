import React, { useState, useEffect, useRef, useCallback } from 'react';
import { getChatStatus, sendChatMessage, clearChatHistory } from '../lib/api';

// ─────────────────────────────────────────────────────────────────────────────
// Icons (inline SVGs to avoid extra deps)
// ─────────────────────────────────────────────────────────────────────────────
const ChatIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
);

const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

const SendIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
  </svg>
);

const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
  </svg>
);

// ─────────────────────────────────────────────────────────────────────────────
// Typing indicator dots
// ─────────────────────────────────────────────────────────────────────────────
function TypingIndicator() {
  return (
    <div className="flex items-center space-x-1 px-3 py-2">
      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Message bubble
// ─────────────────────────────────────────────────────────────────────────────
function MessageBubble({ role, text, sources }) {
  const isUser = role === 'user';
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`}>
      <div className={`max-w-[85%] ${isUser ? 'order-1' : 'order-1'}`}>
        <div
          className={`
            px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap break-words
            ${isUser
              ? 'bg-black text-white rounded-lg rounded-tr-none border-2 border-black'
              : 'bg-white text-black rounded-lg rounded-tl-none border-2 border-gray-300'
            }
          `}
        >
          {text}
        </div>
        {sources && sources.length > 0 && (
          <div className="mt-1 flex flex-wrap gap-1">
            <span className="text-[10px] font-bold text-gray-500 uppercase">Sumber:</span>
            {sources.map((s, i) => (
              <span key={i} className="text-[10px] px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded font-mono text-gray-600">
                {s}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Token usage bar
// ─────────────────────────────────────────────────────────────────────────────
function TokenBar({ usage, cap }) {
  const pct = cap > 0 ? Math.min((usage / cap) * 100, 100) : 0;
  const barColor = pct >= 90 ? 'bg-red-500' : pct >= 70 ? 'bg-yellow-500' : 'bg-green-500';

  return (
    <div className="px-3 py-1.5 border-t-2 border-gray-200 bg-gray-50">
      <div className="flex items-center justify-between text-[10px] font-bold text-gray-500 uppercase mb-1">
        <span>Token AI</span>
        <span>{usage.toLocaleString()} / {cap.toLocaleString()}</span>
      </div>
      <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <div className={`h-full ${barColor} rounded-full transition-all duration-300`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Widget
// ─────────────────────────────────────────────────────────────────────────────
export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [tokenUsage, setTokenUsage] = useState(0);
  const [tokenCap, setTokenCap] = useState(10000);
  const [docCount, setDocCount] = useState(0);
  const [initialized, setInitialized] = useState(false);

  const bodyRef = useRef(null);
  const inputRef = useRef(null);

  // Scroll to bottom helper
  const scrollToBottom = useCallback(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, []);

  // Fetch initial status
  useEffect(() => {
    async function init() {
      try {
        const status = await getChatStatus();
        setTokenUsage(status.token_usage || 0);
        setTokenCap(status.token_cap || 10000);
        setDocCount(status.document_count || 0);

        // Greeting message
        const greeting = status.has_documents
          ? `Halo! Saya Konsultan CC CUP. Saya siap membantu Anda dengan informasi pendaftaran berdasarkan ${status.document_count} dokumen yang tersedia. Ada yang bisa saya bantu?`
          : 'Selamat datang di layanan bantuan CC CUP! Silakan tanyakan seputar pendaftaran kompetisi CC CUP.';

        setMessages([{ role: 'assistant', content: greeting, sources: [] }]);
      } catch (err) {
        setMessages([{
          role: 'assistant',
          content: 'Layanan chat saat ini tidak tersedia. Silakan coba lagi nanti.',
          sources: [],
        }]);
      }
      setInitialized(true);
    }
    init();
  }, []);

  // Auto-scroll when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Send message handler
  const handleSend = async () => {
    if (sending) return;
    const text = input.trim();
    if (!text) return;

    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: text, sources: [] }]);
    setSending(true);

    try {
      const data = await sendChatMessage(text);
      const reply = typeof data.reply === 'string' ? data.reply : 'Respons server tidak terduga.';

      if (data.usage !== undefined) setTokenUsage(data.usage);
      if (data.cap !== undefined) setTokenCap(data.cap);

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: reply,
        sources: data.sources || [],
      }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Terjadi kesalahan koneksi. Silakan coba lagi.',
        sources: [],
      }]);
    } finally {
      setSending(false);
    }
  };

  // Clear chat handler
  const handleClear = async () => {
    if (sending) return;
    setSending(true);
    try {
      await clearChatHistory();
      const greeting = docCount > 0
        ? `Riwayat chat telah dihapus. Saya siap membantu Anda dengan ${docCount} dokumen yang tersedia.`
        : 'Riwayat chat telah dihapus. Ada yang bisa saya bantu?';
      setMessages([{ role: 'assistant', content: greeting, sources: [] }]);
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Gagal menghapus riwayat chat.',
        sources: [],
      }]);
    } finally {
      setSending(false);
    }
  };

  // Keyboard shortcut: Enter to send
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Unread indicator (show badge when closed and there are messages)
  const showBadge = !isOpen && messages.length > 1;

  return (
    <div className="fixed bottom-4 right-4 z-50 font-inter">
      {/* Chat Panel */}
      {isOpen && (
        <div className="
          mb-3 w-[360px] sm:w-[400px] h-[520px]
          bg-white border-4 border-black rounded-xl
          shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]
          flex flex-col overflow-hidden
          animate-in fade-in slide-in-from-bottom-2 duration-200
        ">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b-4 border-black bg-black text-white">
            <div>
              <h3 className="font-black text-sm uppercase tracking-wider">Konsultan CC CUP</h3>
              <p className="text-[10px] font-semibold text-gray-300 uppercase">
                {docCount > 0 ? `${docCount} dokumen siap` : 'Tanyakan apa saja'}
              </p>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={handleClear}
                disabled={sending}
                className="p-1.5 rounded hover:bg-gray-700 transition-colors disabled:opacity-50"
                title="Hapus riwayat chat"
              >
                <TrashIcon />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded hover:bg-gray-700 transition-colors"
                title="Tutup"
              >
                <CloseIcon />
              </button>
            </div>
          </div>

          {/* Message Body */}
          <div ref={bodyRef} className="flex-1 overflow-y-auto px-3 py-3 bg-gray-50">
            {!initialized && (
              <div className="flex items-center justify-center h-full">
                <TypingIndicator />
              </div>
            )}
            {messages.map((msg, i) => (
              <MessageBubble
                key={i}
                role={msg.role}
                text={msg.content}
                sources={msg.sources}
              />
            ))}
            {sending && (
              <div className="flex justify-start mb-3">
                <div className="bg-white border-2 border-gray-300 rounded-lg rounded-tl-none">
                  <TypingIndicator />
                </div>
              </div>
            )}
          </div>

          {/* Token Bar */}
          <TokenBar usage={tokenUsage} cap={tokenCap} />

          {/* Input Footer */}
          <div className="px-3 py-2 border-t-2 border-gray-200 bg-white">
            <div className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={sending}
                rows={2}
                placeholder="Tanyakan seputar kompetisi CC CUP…"
                className="
                  flex-1 resize-none text-sm px-3 py-2
                  border-2 border-gray-300 rounded-lg
                  focus:outline-none focus:border-black
                  disabled:opacity-50 disabled:cursor-not-allowed
                  placeholder:text-gray-400
                "
              />
              <button
                onClick={handleSend}
                disabled={sending || !input.trim()}
                className="
                  p-2.5 bg-black text-white rounded-lg border-2 border-black
                  hover:bg-gray-800 active:translate-y-0.5
                  disabled:opacity-40 disabled:cursor-not-allowed
                  transition-all
                "
                title="Kirim"
              >
                <SendIcon />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Launcher FAB */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          relative w-14 h-14 rounded-full
          bg-black text-white border-4 border-black
          shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)]
          hover:bg-gray-800 active:translate-y-0.5 active:shadow-none
          transition-all cursor-pointer
          flex items-center justify-center
        `}
        aria-label={isOpen ? 'Tutup chat' : 'Buka chat'}
      >
        {isOpen ? <CloseIcon /> : <ChatIcon />}
        {showBadge && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 border-2 border-white rounded-full animate-pulse" />
        )}
      </button>
    </div>
  );
}
