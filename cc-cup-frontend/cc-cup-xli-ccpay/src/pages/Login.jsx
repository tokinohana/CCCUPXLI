import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';

const Login = () => {
    const navigate = useNavigate();
    const [isAuthenticating, setIsAuthenticating] = useState(false);
    const [authError, setAuthError] = useState(null);
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);

    // 🌟 1. PRE-AUTHENTICATION GATE: Skip login UI entirely if tokens already exist and are fresh
    useEffect(() => {
        const accessToken = localStorage.getItem('access_token');
        const loginTimestamp = localStorage.getItem('login_timestamp');
        const THIRTY_MINUTES_MS = 30 * 60 * 1000; 

        if (accessToken && loginTimestamp) {
            const currentTime = Date.now();
            const timePassed = currentTime - parseInt(loginTimestamp, 10);

            if (timePassed > THIRTY_MINUTES_MS) {
                // Token has passed its lifetime window; clear storage state
                localStorage.clear();
                setAuthError("Sesi Anda telah berakhir (Maksimal 30 menit). Silahkan masuk kembali.");
                setIsCheckingAuth(false);
            } else {
                navigate('/'); // Adjust to '/dashboard' if your main ledger is mounted there
            }
        } else {
            setIsCheckingAuth(false);
        }
    }, [navigate]);

    const handleBackendAuthExchange = async (googleCredentialToken) => {
        try {
            setIsAuthenticating(true);
            setAuthError(null);

            const response = await fetch('/api/ccpay/auth/google/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: googleCredentialToken }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Gagal mengautentikasi akun.");
            }

            localStorage.setItem('access_token', data.access);
            localStorage.setItem('refresh_token', data.refresh);
            // Record the exact time the credentials were issued
            localStorage.setItem('login_timestamp', Date.now().toString());
            
            navigate('/');
        } catch (err) {
            setAuthError(err.message);
        } finally {
            setIsAuthenticating(false);
        }
    };

    // 🌟 2. FETCH CONFIG & INITIALIZE: Dynamically load OAuth parameters from the backend
    useEffect(() => {
        // If the gate is still routing an active session away, don't spin up scripts
        if (isCheckingAuth) return;

        const fetchConfigAndInit = async () => {
            try {
                const response = await fetch('/api/ccpay/auth/google/config/', {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' }
                });

                if (!response.ok) {
                    throw new Error("Gagal memuat konfigurasi autentikasi dari server.");
                }

                const { client_id } = await response.json();

                if (window.google?.accounts?.id) {
                    window.google.accounts.id.initialize({
                        client_id: client_id,
                        callback: (res) => {
                            if (res.credential) {
                                handleBackendAuthExchange(res.credential);
                            }
                        },
                        hd: "kanisius.sch.id",
                        use_fedcm: false
                    });

                    window.google.accounts.id.renderButton(
                        document.getElementById("google-signin-button"),
                        {
                            theme: "filled_black",
                            size: "large",
                            width: "200",
                            logo_alignment: "left"
                        }
                    );
                }
            } catch (err) {
                console.error("Configuration sync failure:", err);
                setAuthError("Sistem gagal berkomunikasi dengan server backend.");
            }
        };

        const scriptCheckTimeout = setTimeout(fetchConfigAndInit, 300);
        return () => clearTimeout(scriptCheckTimeout);
    }, [isCheckingAuth]);

    // Lightweight loading fallback while evaluating user authorization states
    if (isCheckingAuth) {
        return (
            <div className="bg-[#090a0b] flex min-h-screen items-center justify-center font-sans">
                <div className="w-6 h-6 border-2 border-[#69ff87] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="bg-[#090a0b] text-[#f4f5f6] flex min-h-screen font-sans antialiased selection:bg-[#69ff87]/30 w-full overflow-x-hidden select-none justify-center">

            <main className="flex-1 flex flex-col justify-between items-center w-full px-6 py-12 max-w-md min-h-screen relative z-10">

                {/* Header Block */}
                <header className="w-full text-center pt-4 flex-shrink-0">
                    <span className="text-2xl font-black tracking-tight text-white">
                        CC<span className="text-[#69ff87]">.</span>PAY
                    </span>
                </header>

                {/* Dynamic Center Stage Container */}
                <div className="w-full my-auto py-6 flex flex-col items-center justify-center flex-1">
                    <div className="w-full rounded-2xl border border-[#1e2226] bg-[#131619] p-6 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#69ff87]/5 rounded-full blur-3xl pointer-events-none" />

                        <div className="flex flex-col items-center justify-center text-center space-y-2.5 mb-8 w-full mx-auto">
                            <div className="mx-auto h-11 w-11 rounded-xl bg-[#1a1d21] border border-[#2a2f35] flex items-center justify-center shadow-inner">
                                <LogIn className="h-5 w-5 text-[#69ff87]" />
                            </div>
                            <h2 className="text-lg font-black text-white tracking-tight pt-1">Selamat Datang</h2>
                            <p className="text-xs text-[#8a939e] max-w-[260px] mx-auto leading-relaxed">
                                Silahkan masuk untuk memantau saldo allowance dan shift tugas Anda.
                            </p>
                        </div>

                        {authError && (
                            <div className="mb-5 p-3 rounded-xl border border-[#4a1d1d] bg-[#1c1212]/80 text-left">
                                <p className="text-[10px] font-bold text-[#ff6b6b] uppercase tracking-wider">Akses Ditolak</p>
                                <p className="text-xs text-[#8a939e] mt-0.5 leading-normal">{authError}</p>
                            </div>
                        )}

                        <div className="w-full flex flex-col items-center justify-center min-h-[48px] relative">
                            {isAuthenticating && (
                                <div className="absolute inset-0 bg-[#131619]/90 backdrop-blur-sm flex items-center justify-center z-20 rounded-xl">
                                    <div className="flex flex-col items-center space-y-2">
                                        <div className="w-6 h-6 border-2 border-[#69ff87] border-t-transparent rounded-full animate-spin" />
                                        <span className="text-[10px] uppercase font-bold text-[#8a939e] tracking-widest">Autentikasi...</span>
                                    </div>
                                </div>
                            )}
                            <div id="google-signin-button" className="w-full flex justify-center mix-blend-screen brightness-95" />
                        </div>

                    </div>
                </div>

                {/* Footer Boundary Block */}
                <footer className="w-full flex flex-col items-center pt-4 flex-shrink-0">
                    <div className="bg-[#122b1c] border border-[#1b4d2e] px-3 py-1 rounded text-[9px] font-bold text-[#69ff87] uppercase tracking-widest pointer-events-none shadow-sm">
                        @kanisius.sch.id ONLY
                    </div>
                </footer>

            </main>
        </div>
    );
};

export default Login;