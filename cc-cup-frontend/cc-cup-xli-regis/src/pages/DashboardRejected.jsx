import React from 'react';
import NavigationHeader from '../components/NavigationHeader';
import TeamSummaryGrid from '../components/TeamSummaryGrid';
import MobileToolbar from '../components/MobileToolbar';
import { COMPETITION_METADATA } from '../config/competition';
import { logout as apiLogout } from '../lib/api';

export default function RejectedPage({ teamData, onLogout }) {
  // Derive team metadata from the API-provided teamData prop
  const slug = teamData?.competition || '';
  const competitionMeta = COMPETITION_METADATA[slug];

  const teamMetadata = {
    namaTim: teamData?.nama_tim || 'Tim Tidak Ditemukan',
    cabangOlahraga: competitionMeta?.label || slug,
    asalSekolah: teamData?.school || '-',
  };

  const handleLogoutAction = async () => {
    await apiLogout();
    if (onLogout) {
      onLogout();
    } else {
      window.location.href = '/login';
    }
  };

  return (
    <div className="bg-white text-black font-inter min-h-screen flex flex-col justify-between antialiased">

      {/* Shared Global Layout Header */}
      <NavigationHeader onLogout={handleLogoutAction} />

      {/* Main Specialized View Body Wrapper */}
      <main className="flex-grow max-w-5xl w-full mx-auto px-4 py-6 md:py-10 space-y-8">

        {/* REJECTED BANNER STATUS CALLOUT BLOCK */}
        <div className="border-4 border-black p-6 rounded-xl bg-white space-y-4 md:p-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <span className="inline-block w-3 h-3 bg-red-600 rounded-full"></span>
                <span className="text-xs font-black text-red-600 uppercase tracking-wider bg-red-50 px-2 py-0.5 rounded border border-red-200">
                  Status Kelayakan: Dibatasi
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight">
                PENDAFTARAN TIDAK TERSEDIA
              </h1>
              <p className="text-sm text-gray-600 font-medium max-w-xl">
                Mohon maaf, sekolah Anda saat ini tercatat <strong>tidak memenuhi syarat kelayakan (not eligible)</strong> untuk berpartisipasi dalam kompetisi CC CUP XLI berdasarkan catatan evaluasi pelaksanaan kegiatan sebelumnya.
              </p>
            </div>

            <div className="flex-shrink-0">
              <a
                href="https://wa.me/628123456789"
                target="_blank"
                rel="noreferrer"
                className="w-full md:w-auto inline-block text-center bg-black text-white font-bold text-sm uppercase tracking-wider py-4 px-6 border-2 border-black rounded-lg hover:bg-gray-900 active:translate-y-0.5 transition-all shadow-[4px_4px_0px_0px_rgba(156,163,175,1)]"
              >
                Hubungi Panitia ↗
              </a>
            </div>
          </div>
        </div>

        {/* Shared Team Identity Overview Grid */}
        <TeamSummaryGrid teamMetadata={teamMetadata} />

        {/* LOCKED FORM ACCESS NOTICE LOCKOUT NOTICE */}
        <div className="border-2 border-black p-8 rounded-xl bg-gray-50 text-center space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-50 border border-red-200 mx-auto">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 15v2m0 0v2m0-2h2m-2 0H10m3-9a3.5 3.5 0 11-7 0 3.5 3.5 0 017 0zM4 11h16a1 1 0 011 1v7a2 2 0 01-2 2H5a2 2 0 01-2-2v-7a1 1 0 011-1z"
              />
            </svg>
          </div>
          <div className="space-y-2">
            <h3 className="text-base font-bold uppercase tracking-tight text-black">Akses Pengisian Formulir Ditutup</h3>
            <p className="text-sm text-gray-500 font-medium max-w-md mx-auto leading-relaxed">
              Seluruh fitur unggah berkas administrasi dan pendaftaran daftar roster pemain dinonaktifkan secara otomatis oleh sistem pusat.
            </p>
          </div>
          <div className="pt-2 border-t border-gray-200 text-xs font-semibold text-gray-400 uppercase tracking-wide">
            Jika Anda merasa ini adalah kesalahan, hubungi +62 812-3456-789
          </div>
        </div>

      </main>

      {/* Shared Responsive Mobile Toolbar Anchor */}
      <MobileToolbar onLogout={handleLogoutAction} />

    </div>
  );
}
