import React from 'react';

const STATUS_CONFIG = {
  PENDING: {
    dotColor: 'bg-yellow-400',
    labelColor: 'text-yellow-700 bg-yellow-50 border-yellow-300',
    label: 'Menunggu Pengiriman',
    title: 'BELUM DIKIRIM (PENDING)',
    desc: 'Lengkapi seluruh berkas tim dan daftar anggota, kemudian tekan tombol di samping untuk mengirim data pendaftaran Anda ke panitia.',
    btnText: 'Kirim Pendaftaran →',
    btnClass: 'bg-black text-white hover:bg-gray-900 shadow-[4px_4px_0px_0px_rgba(156,163,175,1)]',
    showSubmit: true,
    showRevoke: false,
  },
  SUBMITTED: {
    dotColor: 'bg-blue-500',
    labelColor: 'text-blue-700 bg-blue-50 border-blue-300',
    label: 'Sedang Diperiksa Panitia',
    title: 'SUDAH DIKIRIM (SUBMITTED)',
    desc: 'Data pendaftaran Anda sedang dikunci & diperiksa oleh panitia. Anda tidak dapat menambah anggota atau mengubah berkas kecuali Anda membatalkan pengiriman terlebih dahulu.',
    btnText: 'Tarik Pendaftaran ↺',
    btnClass: 'bg-white text-black hover:bg-gray-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]',
    showSubmit: false,
    showRevoke: true,
  },
  REVIEWED: {
    dotColor: 'bg-orange-400',
    labelColor: 'text-orange-700 bg-orange-50 border-orange-300',
    label: 'Perlu Perbaikan Data',
    title: 'PERLU DIREVISI (REVIEWED)',
    desc: 'Panitia telah memeriksa data Anda dan menemukan kesalahan. Silakan perbaiki berkas atau data anggota yang bermasalah, lalu kirim ulang pendaftaran Anda.',
    btnText: 'Kirim Ulang Pendaftaran →',
    btnClass: 'bg-orange-500 text-white hover:bg-orange-600 shadow-[4px_4px_0px_0px_rgba(234,88,12,0.4)]',
    showSubmit: true,
    showRevoke: false,
  },
  ACCEPTED: {
    dotColor: 'bg-green-500',
    labelColor: 'text-green-700 bg-green-50 border-green-300',
    label: 'Diterima & Terverifikasi',
    title: 'DITERIMA (ACCEPTED)',
    desc: 'Selamat! Pendaftaran tim Anda telah diverifikasi dan disetujui oleh panitia. Anda telah resmi terdaftar sebagai peserta CC CUP XLI.',
    btnText: null,
    btnClass: '',
    showSubmit: false,
    showRevoke: false,
  },
  PENDINGTF: {
    dotColor: 'bg-purple-500',
    labelColor: 'text-purple-700 bg-purple-50 border-purple-300',
    label: 'Menunggu Pengembalian Dana',
    title: 'PENGEMBALIAN DANA (PENDINGTF)',
    desc: 'Pendaftaran Anda telah diterima. Silakan lengkapi data rekening bank di bawah untuk proses pengembalian uang jaminan (WO Money).',
    btnText: null,
    btnClass: '',
    showSubmit: false,
    showRevoke: false,
  },
};


export default function StatusBanner({ regisStatus, isFrozen, onFinalSubmit, onRevoke }) {
  const cfg = STATUS_CONFIG[regisStatus] || STATUS_CONFIG.PENDING;

  return (
    <div className="border-4 border-black p-6 rounded-xl bg-white space-y-4 md:p-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <span className={`inline-block w-3 h-3 rounded-full ${cfg.dotColor}`}></span>
            <span className={`text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded border ${cfg.labelColor}`}>
              {cfg.label}
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight">
            {cfg.title}
          </h1>
          <p className="text-sm text-gray-600 font-medium max-w-xl">
            {cfg.desc}
          </p>
        </div>

        {(cfg.showSubmit || cfg.showRevoke) && (
          <div className="flex-shrink-0">
            <button
              type="button"
              onClick={cfg.showSubmit ? onFinalSubmit : onRevoke}
              className={`w-full md:w-auto font-bold text-base uppercase tracking-wider py-4 px-8 border-2 border-black rounded-lg active:translate-y-0.5 transition-all ${cfg.btnClass}`}
            >
              {cfg.btnText}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
