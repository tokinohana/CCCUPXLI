import React from 'react';

const FILE_LABELS = {
  pembayaran: '1. Bukti Pembayaran',
  kartuPelajar: '2. Kartu Pelajar Kapten',
  selfie: '3. Selfie Dengan Kartu Pelajar',
  suratPernyataan: '4. Surat Pernyataan Tim',
  suratIzin: '5. Surat Izin Sekolah',
};

// pembayaran accepts PDF + image; all others are PDF only
const FILE_ACCEPT = {
  pembayaran: '.pdf,.png,.jpg,.jpeg',
  kartuPelajar: '.pdf',
  selfie: '.pdf',
  suratPernyataan: '.pdf',
  suratIzin: '.pdf',
};

function FileSlot({ slotKey, label, file, isFrozen, onFileChange, onFileRemove }) {
  const isUploaded = !!file;
  // file can be: a URL string (from API), a File object (just selected), or null
  const fileName = file instanceof File
    ? file.name
    : (typeof file === 'string' ? (file.split('/').pop() || file) : null);
  const fileUrl = typeof file === 'string' ? file : null;

  return (
    <div className="border-2 border-black rounded-xl p-4 bg-gray-50 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold text-black uppercase tracking-wide">{label}</span>
        {isUploaded ? (
          <span className="text-[10px] font-black uppercase text-green-600 bg-green-50 px-2 py-0.5 border border-green-200 rounded">
            Terunggah ✓
          </span>
        ) : (
          <span className="text-[10px] font-black uppercase text-red-500 bg-red-50 px-2 py-0.5 border border-red-200 rounded">
            Belum Ada
          </span>
        )}
      </div>

      {isUploaded ? (
        <div className="flex items-center justify-between bg-white border border-gray-200 p-2.5 rounded-lg">
          {fileUrl ? (
            <a
              href={fileUrl}
              target="_blank"
              rel="noreferrer"
              className="text-xs font-medium truncate text-blue-600 hover:underline"
            >
              {fileName}
            </a>
          ) : (
            <span className="text-xs font-medium truncate text-gray-700">{fileName}</span>
          )}
          {!isFrozen && (
            <button
              type="button"
              onClick={() => onFileRemove(slotKey)}
              className="ml-2 text-[10px] font-black text-red-500 uppercase hover:text-red-700 transition-colors flex-shrink-0 cursor-pointer"
            >
              Hapus ✕
            </button>
          )}
          {isFrozen && (
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Selesai</span>
          )}
        </div>
      ) : (
        !isFrozen && (
          <label className="relative flex items-center space-x-3 border-2 border-dashed border-gray-300 rounded-lg p-3 hover:border-black transition-colors bg-white cursor-pointer focus-within:border-black">
            <input
              type="file"
              accept={FILE_ACCEPT[slotKey] || '.pdf'}
              onChange={(e) => onFileChange(slotKey, e.target.files[0])}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <div className="p-1.5 bg-gray-50 border border-gray-200 rounded-md shadow-sm flex-shrink-0">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="pointer-events-none">
              <p className="text-xs font-bold text-gray-700">Pilih Berkas...</p>
              <p className="text-[10px] text-gray-400 font-medium">Klik untuk mengunggah dokumen</p>
            </div>
          </label>
        )
      )}

      {isFrozen && !isUploaded && (
        <div className="flex items-center justify-between bg-red-50 border border-red-200 p-2.5 rounded-lg">
          <span className="text-xs font-medium text-red-500">Berkas tidak diunggah</span>
        </div>
      )}
    </div>
  );
}

export default function TeamFilesWorkspace({ teamFiles, isFrozen, onFileChange, onFileRemove }) {
  return (
    <section className="lg:col-span-5 space-y-4">
      <div className="flex items-center justify-between border-b-2 border-black pb-2">
        <h2 className="font-berserker text-base font-bold uppercase tracking-tight">Berkas Tim Diunggah</h2>
        {isFrozen ? (
          <span className="text-xs font-black uppercase text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">Terkunci</span>
        ) : (
          <span className="text-xs font-black uppercase text-yellow-700 bg-yellow-50 px-2 py-0.5 rounded border border-yellow-300">Dapat Diubah</span>
        )}
      </div>
      <div className="space-y-4">
        {Object.entries(FILE_LABELS).map(([key, label]) => (
          <FileSlot
            key={key}
            slotKey={key}
            label={label}
            file={teamFiles[key]}
            isFrozen={isFrozen}
            onFileChange={onFileChange}
            onFileRemove={onFileRemove}
          />
        ))}
      </div>
    </section>
  );
}
