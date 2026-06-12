import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { login as apiLogin } from '../lib/api';

export default function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const team = await apiLogin(email, password);
      onLogin(team);
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        'Gagal masuk. Periksa email dan password Anda.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-[#f3f4f6] text-black font-inter min-h-screen flex flex-col justify-center items-center p-4 antialiased selection:bg-yellow-300">
      <div className="max-w-md w-full border-4 border-black p-8 rounded-xl bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] space-y-6">

        {/* Title Header */}
        <div className="text-center space-y-2">
          <div className="inline-block bg-yellow-300 border-2 border-black px-3 py-1 text-xs font-black uppercase tracking-wider rounded">
            Portal Pendaftaran
          </div>
          <h1 className="text-3xl font-black uppercase tracking-tight">
            CC CUP XLI
          </h1>
          <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
            Silakan masuk untuk melanjutkan
          </p>
        </div>

        {/* Error banner */}
        {error && (
          <div className="bg-red-50 border-2 border-red-300 rounded-lg p-3 text-sm font-semibold text-red-700">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-xs font-black uppercase tracking-wider text-black">
              Email Tim
            </label>
            <input
              type="email"
              required
              placeholder="tim-elang@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border-2 border-black p-3 rounded-lg font-bold text-sm bg-white focus:outline-none focus:ring-2 focus:ring-yellow-300 transition-all placeholder-gray-400"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-black uppercase tracking-wider text-black">
              Password
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border-2 border-black p-3 rounded-lg font-bold text-sm bg-white focus:outline-none focus:ring-2 focus:ring-yellow-300 transition-all placeholder-gray-400"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-black text-white hover:bg-yellow-300 hover:text-black font-black text-sm uppercase tracking-wider py-4 px-6 border-2 border-black rounded-lg active:translate-y-0.5 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Memuat...' : 'Masuk ke Akun ↗'}
          </button>

          <div className="text-center">
            <Link
              to="/signup"
              className="text-sm font-bold text-gray-500 underline uppercase tracking-wide hover:text-black transition-colors"
            >
              Belum punya akun? Daftar di sini
            </Link>
          </div>
        </form>

        {/* Footer info */}
        <div className="pt-4 border-t-2 border-dashed border-gray-200 text-center text-xs font-bold text-gray-400 uppercase tracking-wide">
          Bantuan: +62 812-3456-789
        </div>
      </div>
    </div>
  );
}
