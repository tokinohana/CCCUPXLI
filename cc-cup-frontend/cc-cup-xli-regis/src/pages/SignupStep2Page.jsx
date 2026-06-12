import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { register as apiRegister } from '../lib/api';
import { COMPETITION_METADATA } from '../config/competition';

// Build a deduplicated sport list for a given jenjang
function getSportsForJenjang(jenjang) {
  const suffix = `-${jenjang.toLowerCase()}`;
  const seen = new Map();
  for (const [slug, meta] of Object.entries(COMPETITION_METADATA)) {
    if (!slug.endsWith(suffix)) continue;
    if (meta.status === 'closed') continue;
    // The sport key is the slug without the jenjang suffix
    const sportKey = slug.slice(0, -suffix.length);
    if (!seen.has(sportKey)) {
      seen.set(sportKey, { slug, label: meta.label });
    }
  }
  return Array.from(seen.values());
}

export default function SignupStep2Page({ onSignup }) {
  const navigate = useNavigate();
  const location = useLocation();

  // Step 1 data from router state
  const step1 = location.state;
  useEffect(() => {
    if (!step1?.email) navigate('/signup', { replace: true });
  }, [step1, navigate]);

  const [jenjang, setJenjang] = useState('SMP');
  const [school, setSchool] = useState('');
  const [teamName, setTeamName] = useState('');
  const [selectedSport, setSelectedSport] = useState(null); // { slug, label }
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const searchRef = useRef(null);
  const dropdownRef = useRef(null);
  const triggerRef = useRef(null);

  // Sports list filtered by jenjang
  const sportsList = useMemo(() => getSportsForJenjang(jenjang), [jenjang]);

  // Filtered sports based on search query
  const filteredSports = useMemo(() => {
    if (!searchQuery.trim()) return sportsList;
    const q = searchQuery.toLowerCase();
    return sportsList.filter(s => s.label.toLowerCase().includes(q));
  }, [sportsList, searchQuery]);

  // Reset sport selection when jenjang changes
  const handleJenjangChange = (val) => {
    setJenjang(val);
    setSelectedSport(null);
  };

  const selectSport = (sport) => {
    setSelectedSport(sport);
    setDropdownOpen(false);
    setSearchQuery('');
  };

  // Close dropdown on outside click (desktop)
  useEffect(() => {
    const handler = (e) => {
      if (window.innerWidth >= 768 && dropdownOpen) {
        if (
          dropdownRef.current && !dropdownRef.current.contains(e.target) &&
          triggerRef.current && !triggerRef.current.contains(e.target)
        ) {
          setDropdownOpen(false);
        }
      }
    };
    window.addEventListener('click', handler);
    return () => window.removeEventListener('click', handler);
  }, [dropdownOpen]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (dropdownOpen && searchRef.current) {
      searchRef.current.focus();
    }
  }, [dropdownOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const errs = {};
    if (!school.trim()) errs.school = 'Nama sekolah wajib diisi.';
    if (!teamName.trim()) errs.teamName = 'Nama tim wajib diisi.';
    if (!selectedSport) errs.competition = 'Pilih cabang lomba terlebih dahulu.';
    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      return;
    }

    setSubmitting(true);
    try {
      const team = await apiRegister({
        email: step1.email,
        password: step1.password,
        phone: step1.phone,
        jenjang,
        school: school.trim(),
        nama_tim: teamName.trim(),
        competition: selectedSport.slug,
      });
      onSignup(team);
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.email?.[0] || 'Gagal mendaftar. Silakan coba lagi.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (!step1?.email) return null;

  return (
    <div className="bg-white text-black min-h-screen flex flex-col justify-between antialiased"
      style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* Desktop header */}
      <header className="hidden md:flex items-center justify-between px-12 py-6 border-b border-gray-200">
        <div className="text-2xl tracking-wider" style={{ fontFamily: "'Cinzel Decorative', serif", letterSpacing: '0.05em' }}>
          REGISTRASI
        </div>
        <div className="text-sm text-gray-500 font-bold tracking-wide uppercase">
          Langkah 2 dari 2: Data Sekolah & Tim
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center px-4 py-8 md:py-12 relative z-10">
        <div className="w-full max-w-xl bg-white border-4 border-black p-6 md:p-10 space-y-8 rounded-xl relative">

          {/* Title */}
          <div className="space-y-3 text-center md:text-left">
            <h1 className="text-3xl md:text-4xl font-bold uppercase tracking-tight"
              style={{ fontFamily: "'Cinzel Decorative', serif", letterSpacing: '0.05em' }}>
              Data Sekolah & Tim
            </h1>
            <p className="text-base text-gray-600 font-medium">
              Lengkapi informasi kelompok dan kategori kompetisi.
            </p>
          </div>

          {/* Progress bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-gray-500">
              <span>Pembuatan Akun Kapten</span>
              <span className="text-black font-bold">Langkah Terakhir</span>
            </div>
            <div className="w-full bg-gray-100 h-4 border-2 border-black rounded-full overflow-hidden p-0.5">
              <div className="bg-black h-full rounded-full transition-all duration-500" style={{ width: '100%' }} />
            </div>
          </div>

          {/* Error banner */}
          {error && (
            <div className="bg-red-50 border-2 border-red-300 rounded-lg p-3 text-sm font-semibold text-red-700">
              {error}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit} noValidate>
            <div className="space-y-6">

              {/* Jenjang */}
              <div className="space-y-3">
                <label className="block text-base font-bold text-black uppercase tracking-wide">
                  Tingkat Sekolah (Jenjang)
                </label>
                <div className="grid grid-cols-2 gap-4">
                  {['SMP', 'SMA'].map((val) => (
                    <label key={val} className="relative cursor-pointer">
                      <input
                        type="radio"
                        name="jenjang"
                        value={val}
                        className="sr-only peer"
                        checked={jenjang === val}
                        onChange={() => handleJenjangChange(val)}
                      />
                      <div className={`flex flex-col p-4 border-2 border-black rounded-lg transition-all text-center
                        ${jenjang === val ? 'bg-black text-white' : 'bg-white hover:bg-gray-50'}`}>
                        <span className="text-xl font-bold uppercase block">{val}</span>
                        <p className={`text-xs block mt-0.5 ${jenjang === val ? 'text-gray-300' : 'text-gray-500'}`}>
                          {val === 'SMP' ? 'Sekolah Menengah Pertama' : 'Sekolah Menengah Atas'}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* School name */}
              <div className="space-y-2">
                <label htmlFor="school" className="block text-base font-bold text-black uppercase tracking-wide">
                  Nama Asal Sekolah
                </label>
                <input
                  type="text"
                  id="school"
                  required
                  placeholder="Contoh: SMP Negeri 1 Jakarta"
                  value={school}
                  onChange={(e) => { setSchool(e.target.value); setFieldErrors(p => ({ ...p, school: undefined })); }}
                  className={`w-full px-4 py-3.5 text-lg border-2 ${fieldErrors.school ? 'border-red-500' : 'border-black'} focus:bg-gray-50 focus:outline-none transition-colors rounded-lg font-medium placeholder-gray-400`}
                />
                {fieldErrors.school && <p className="text-xs text-red-500 font-semibold">{fieldErrors.school}</p>}
              </div>

              {/* Team name */}
              <div className="space-y-2">
                <label htmlFor="team-name" className="block text-base font-bold text-black uppercase tracking-wide">
                  Nama Tim / Kelompok
                </label>
                <input
                  type="text"
                  id="team-name"
                  required
                  placeholder="Contoh: Tim Elang Perkasa"
                  value={teamName}
                  onChange={(e) => { setTeamName(e.target.value); setFieldErrors(p => ({ ...p, teamName: undefined })); }}
                  className={`w-full px-4 py-3.5 text-lg border-2 ${fieldErrors.teamName ? 'border-red-500' : 'border-black'} focus:bg-gray-50 focus:outline-none transition-colors rounded-lg font-medium placeholder-gray-400`}
                />
                {fieldErrors.teamName && <p className="text-xs text-red-500 font-semibold">{fieldErrors.teamName}</p>}
              </div>

              {/* Competition dropdown */}
              <div className="space-y-2 relative">
                <label className="block text-base font-bold text-black uppercase tracking-wide">
                  Pilih Cabang Lomba
                </label>

                <button
                  type="button"
                  ref={triggerRef}
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="w-full flex items-center justify-between px-4 py-4 text-left text-lg border-2 border-black rounded-lg bg-white font-medium focus:outline-none focus:bg-gray-50"
                >
                  <span className={selectedSport ? 'text-black' : 'text-gray-400'}>
                    {selectedSport ? selectedSport.label : '-- Cari & Pilih Jenis Lomba --'}
                  </span>
                  <svg
                    className={`w-5 h-5 text-black transform transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {fieldErrors.competition && <p className="text-xs text-red-500 font-semibold">{fieldErrors.competition}</p>}
                <p className="text-xs text-gray-500 font-medium">
                  Klik untuk mengetik kata kunci atau memilih dari daftar cabang lomba.
                </p>

                {/* Mobile backdrop */}
                {dropdownOpen && (
                  <div
                    className="fixed top-0 left-0 w-screen h-screen bg-black/60 z-[100] md:hidden backdrop-blur-sm"
                    onClick={() => setDropdownOpen(false)}
                  />
                )}

                {/* Dropdown menu */}
                {dropdownOpen && (
                  <div
                    ref={dropdownRef}
                    className="fixed inset-x-4 top-6 bottom-24 m-auto max-h-[460px] bg-white border-4 border-black rounded-xl z-[110] overflow-hidden shadow-2xl flex flex-col
                      md:absolute md:inset-x-0 md:top-full md:bottom-auto md:m-0 md:max-h-64 md:border-2 md:rounded-lg md:shadow-lg md:z-50"
                  >
                    {/* Search */}
                    <div className="p-4 border-b-2 border-black bg-gray-50 flex items-center space-x-2 sticky top-0 md:p-3 md:border-b">
                      <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <input
                        type="text"
                        ref={searchRef}
                        placeholder="Ketik kata kunci untuk mencari..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-transparent text-lg font-medium focus:outline-none placeholder-gray-400 py-1 md:text-base"
                      />
                      <button
                        type="button"
                        onClick={() => setDropdownOpen(false)}
                        className="md:hidden p-1 text-gray-400 hover:text-black"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>

                    {/* Sports list */}
                    <div className="overflow-y-auto divide-y divide-gray-200 flex-grow">
                      {filteredSports.length === 0 && (
                        <div className="px-5 py-4 text-gray-400 text-center font-semibold">
                          Tidak ada lomba tersedia untuk jenjang ini.
                        </div>
                      )}
                      {filteredSports.map((sport) => (
                        <button
                          key={sport.slug}
                          type="button"
                          onClick={() => selectSport(sport)}
                          className="w-full text-left px-5 py-4 text-base font-semibold hover:bg-black hover:text-white transition-colors md:px-4 md:py-3.5"
                        >
                          {sport.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Submit buttons */}
            <div className="pt-4 space-y-3">
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-black text-white text-lg font-bold py-4 px-6 border-2 border-black hover:bg-gray-900 active:translate-y-0.5 transition-all uppercase tracking-wider rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Mendaftarkan...' : 'Selesaikan Buat Akun ✓'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/signup')}
                className="w-full bg-transparent text-gray-500 text-sm font-bold py-2 px-6 hover:text-black transition-colors uppercase tracking-wide"
              >
                ← Kembali ke Langkah 1
              </button>
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
          <span className="text-xs text-gray-500 font-bold mt-1">Langkah 2/2</span>
        </div>
        <div className="text-xs font-bold uppercase border-2 border-black bg-gray-50 px-3 py-1.5 rounded-md">
          Data Sekolah
        </div>
      </nav>
    </div>
  );
}
