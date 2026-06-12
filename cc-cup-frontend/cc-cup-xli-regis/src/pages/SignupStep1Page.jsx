import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function SignupStep1Page() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = {};
    if (!email.trim()) errs.email = 'Email wajib diisi.';
    if (!password || password.length < 8) errs.password = 'Password minimal 8 karakter.';
    if (!phone.trim()) errs.phone = 'Nomor WhatsApp wajib diisi.';
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    // Pass step 1 data to step 2 via router state
    navigate('/signup/step2', { state: { email, password, phone } });
  };

  return (
    <div className="bg-white text-black min-h-screen flex flex-col justify-between antialiased"
      style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* Desktop header */}
      <header className="hidden md:flex items-center justify-between px-12 py-6 border-b border-gray-200">
        <div className="text-2xl tracking-wider" style={{ fontFamily: "'Cinzel Decorative', serif", letterSpacing: '0.05em' }}>
          REGISTRASI
        </div>
        <div className="text-sm text-gray-500 font-bold tracking-wide uppercase">
          Langkah 1 dari 2: Akun Kapten
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center px-4 py-8 md:py-12">
        <div className="w-full max-w-xl bg-white border-4 border-black p-6 md:p-10 space-y-8 rounded-xl">

          {/* Title */}
          <div className="space-y-3 text-center md:text-left">
            <h1 className="text-3xl md:text-4xl font-bold uppercase tracking-tight"
              style={{ fontFamily: "'Cinzel Decorative', serif", letterSpacing: '0.05em' }}>
              Daftar Akun
            </h1>
            <p className="text-base text-gray-600 font-medium">
              Buat akun kapten untuk mulai mendaftarkan tim Anda.
            </p>
          </div>

          {/* Progress bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-gray-500">
              <span>Progress Pendaftaran</span>
              <span className="text-black">50% Selesai</span>
            </div>
            <div className="w-full bg-gray-100 h-4 border-2 border-black rounded-full overflow-hidden p-0.5">
              <div className="bg-black h-full rounded-full transition-all duration-500" style={{ width: '50%' }} />
            </div>
          </div>

          {/* Form */}
          <form className="space-y-6" onSubmit={handleSubmit} noValidate>
            <div className="space-y-5">

              {/* Email */}
              <div className="space-y-2">
                <label htmlFor="signup-email" className="block text-base font-bold text-black uppercase tracking-wide">
                  Alamat Email
                </label>
                <input
                  type="email"
                  id="signup-email"
                  required
                  autoComplete="email"
                  placeholder="contoh: nama@email.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setErrors(p => ({ ...p, email: undefined })); }}
                  className={`w-full px-4 py-3.5 text-lg border-2 ${errors.email ? 'border-red-500' : 'border-black'} focus:bg-gray-50 focus:outline-none transition-colors rounded-lg font-medium placeholder-gray-400`}
                />
                {errors.email && <p className="text-xs text-red-500 font-semibold">{errors.email}</p>}
                <p className="text-xs text-gray-500 font-medium">Gunakan email aktif Anda untuk masuk kembali nanti.</p>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label htmlFor="signup-password" className="block text-base font-bold text-black uppercase tracking-wide">
                  Kata Sandi (Password)
                </label>
                <input
                  type="password"
                  id="signup-password"
                  required
                  autoComplete="new-password"
                  placeholder="Masukkan minimal 8 angka atau huruf"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setErrors(p => ({ ...p, password: undefined })); }}
                  className={`w-full px-4 py-3.5 text-lg border-2 ${errors.password ? 'border-red-500' : 'border-black'} focus:bg-gray-50 focus:outline-none transition-colors rounded-lg font-medium placeholder-gray-400`}
                />
                {errors.password && <p className="text-xs text-red-500 font-semibold">{errors.password}</p>}
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <label htmlFor="signup-phone" className="block text-base font-bold text-black uppercase tracking-wide">
                  Nomor WhatsApp
                </label>
                <input
                  type="tel"
                  id="signup-phone"
                  required
                  placeholder="Contoh: 08123456789"
                  value={phone}
                  onChange={(e) => { setPhone(e.target.value); setErrors(p => ({ ...p, phone: undefined })); }}
                  className={`w-full px-4 py-3.5 text-lg border-2 ${errors.phone ? 'border-red-500' : 'border-black'} focus:bg-gray-50 focus:outline-none transition-colors rounded-lg font-medium placeholder-gray-400`}
                />
                {errors.phone && <p className="text-xs text-red-500 font-semibold">{errors.phone}</p>}
                <p className="text-xs text-gray-500 font-medium">Nomor wajib aktif untuk menerima informasi perlombaan.</p>
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                className="w-full bg-black text-white text-lg font-bold py-4 px-6 border-2 border-black hover:bg-gray-900 active:translate-y-0.5 transition-all uppercase tracking-wider rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,0.2)]"
              >
                Lanjut ke Data Sekolah & Tim →
              </button>
            </div>

            <div className="text-center pt-2">
              <Link
                to="/login"
                className="text-sm font-bold text-gray-500 underline uppercase tracking-wide hover:text-black transition-colors"
              >
                Sudah punya akun? Masuk di sini
              </Link>
            </div>
          </form>
        </div>
      </main>

      {/* Mobile bottom nav */}
      <nav className="md:hidden sticky bottom-0 bg-white border-t-2 border-black w-full py-4 px-6 flex justify-between items-center z-30">
        <div className="flex flex-col">
          <span className="text-lg tracking-wide leading-none" style={{ fontFamily: "'Cinzel Decorative', serif", letterSpacing: '0.05em' }}>
            REGISTRASI
          </span>
          <span className="text-xs text-gray-500 font-bold mt-1">Langkah 1/2</span>
        </div>
        <div className="text-xs font-bold uppercase border-2 border-black bg-gray-50 px-3 py-1.5 rounded-md">
          Akun Kapten
        </div>
      </nav>
    </div>
  );
}
