import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const Logout = () => {
    const navigate = useNavigate();
    const hasLoggedOut = useRef(false);

    useEffect(() => {
        if (hasLoggedOut.current) return;
        hasLoggedOut.current = true;

        const logout = async () => {
            const accessToken = localStorage.getItem('access_token');
            const refreshToken = localStorage.getItem('refresh_token');

            try {
                if (refreshToken) {
                    await fetch(
                        `${import.meta.env.VITE_API_BASE_URL}/api/ccpay/auth/logout/`,
                        {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                ...(accessToken && {
                                    Authorization: `Bearer ${accessToken}`,
                                }),
                            },
                            body: JSON.stringify({
                                refresh: refreshToken,
                            }),
                        }
                    );
                }
            } catch (error) {
                console.error('Logout request failed:', error);
            } finally {
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                localStorage.removeItem('login_timestamp');

                navigate('/login', { replace: true });
            }
        };

        logout();
    }, [navigate]);

    return (
        <div className="bg-[#090a0b] text-[#f4f5f6] flex min-h-screen items-center justify-center font-sans">
            <div className="flex flex-col items-center space-y-3">
                <div className="w-6 h-6 border-2 border-[#69ff87] border-t-transparent rounded-full animate-spin" />
                <span className="text-[10px] uppercase font-bold text-[#8a939e] tracking-widest">
                    Keluar...
                </span>
            </div>
        </div>
    );
};

export default Logout;
