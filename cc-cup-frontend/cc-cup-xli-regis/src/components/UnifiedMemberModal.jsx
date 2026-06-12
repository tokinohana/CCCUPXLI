import React, { useState, useEffect, useRef } from 'react';
import { COMPETITION_METADATA } from '../config/competition';

export default function UnifiedMemberModal({ isOpen, mode, activeSportSlug, existingMemberData, isFrozen = false, onClose, onSave }) {
  const formRef = useRef(null);

  const [nama, setNama] = useState('');
  const [nisn, setNisn] = useState('');
  const [kelas, setKelas] = useState('');
  const [email, setEmail] = useState('');
  const [telp, setTelp] = useState('');
  const [lahir, setLahir] = useState('');
  const [gender, setGender] = useState('');

  const [dynamicFields, setDynamicFields] = useState({});
  const [uploadedFiles, setUploadedFiles] = useState({});

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('overflow-hidden');
      if (mode === 'edit' && existingMemberData) {
        setNama(existingMemberData.nama || '');
        setNisn(existingMemberData.nisn || '');
        setKelas(existingMemberData.kelas || '');
        setEmail(existingMemberData.email || '');
        setTelp(existingMemberData.telp || '');
        setLahir(existingMemberData.lahir || '');
        setGender(existingMemberData.gender || '');
        setDynamicFields(existingMemberData.dynamicFields || {});
        // Keep existing file URLs so the UI can display them (convert array → object keyed by file_type)
        const existingFiles = {};
        if (Array.isArray(existingMemberData.files)) {
          existingMemberData.files.forEach(f => { existingFiles[f.file_type] = f.url; });
        }
        setUploadedFiles(existingFiles);
      } else {
        setNama('');
        setNisn('');
        setKelas('');
        setEmail('');
        setTelp('');
        setLahir('');
        setGender('');
        setDynamicFields({});
        setUploadedFiles({});
        if (formRef.current) formRef.current.reset();
      }
    } else {
      document.body.classList.remove('overflow-hidden');
    }
    return () => document.body.classList.remove('overflow-hidden');
  }, [isOpen, mode, existingMemberData]);

  if (!isOpen) return null;

  // FIXED: Changed from ROSTER_RULES_DICTIONARY to COMPETITION_METADATA and adjusted fallbacks
  const activeRules = COMPETITION_METADATA[activeSportSlug] || { memberFields: [], memberFiles: [] };

  const handleDynamicFieldChange = (key, value) => {
    setDynamicFields(prev => ({ ...prev, [key]: value }));
  };

  const handleFileChange = (key, file) => {
    if (file) {
      setUploadedFiles(prev => ({ ...prev, [key]: file }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const basePayload = { nama, nisn, kelas, email, nomor_telepon: telp, tanggal_lahir: lahir, gender };
    // Only include actual File objects (not URL strings) in the files payload
    const filePayload = {};
    Object.entries(uploadedFiles).forEach(([key, val]) => {
      if (val instanceof File) {
        filePayload[key] = val;
      }
    });
    onSave({
      mode,
      base: basePayload,
      dynamic: dynamicFields,
      files: filePayload
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white border-4 border-black w-full max-w-xl rounded-xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col my-auto max-h-[90vh]">

        <div className="p-6 border-b-2 border-black flex items-center justify-between bg-gray-50 rounded-t-lg">
          <div>
            <h3 className="font-berserker text-lg font-bold uppercase tracking-tight text-black">
              {mode === 'add' ? 'Tambah Anggota Baru' : 'Ubah Informasi Anggota'}
            </h3>
            <p className="text-xs text-gray-500 font-medium mt-0.5">Pastikan data identitas siswa sesuai dengan kartu pelajar aktif.</p>
          </div>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-black transition-colors p-2 text-xl font-black">✕</button>
        </div>

        <form ref={formRef} onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-5">

          {/* SECTION A: MANDATORY BASE SYSTEM INPUTS */}
          <div className="space-y-4">
            <div className="border-b-2 border-dashed border-gray-200 pb-1">
              <span className="text-xs font-black uppercase tracking-wider text-gray-400">Data Identitas Wajib</span>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wide text-black">Nama Lengkap Siswa</label>
              <input type="text" required value={nama} onChange={(e) => setNama(e.target.value)} placeholder="Contoh: Budi Santoso" disabled={isFrozen}
                className={`w-full px-3 py-2.5 text-sm border-2 border-black rounded-lg bg-white focus:outline-none focus:bg-gray-50 font-semibold placeholder-gray-300 ${isFrozen ? 'bg-gray-100 text-gray-500 cursor-not-allowed opacity-70' : ''}`} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wide text-black">NISN</label>
                <input type="number" required value={nisn} onChange={(e) => setNisn(e.target.value)} placeholder="10 Digit Angka" disabled={isFrozen}
                  className={`w-full px-3 py-2.5 text-sm border-2 border-black rounded-lg bg-white focus:outline-none focus:bg-gray-50 font-semibold placeholder-gray-300 ${isFrozen ? 'bg-gray-100 text-gray-500 cursor-not-allowed opacity-70' : ''}`} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wide text-black">Kelas</label>
                <select required value={kelas} onChange={(e) => setKelas(e.target.value)} disabled={isFrozen}
                  className={`w-full px-3 py-2.5 text-sm border-2 border-black rounded-lg bg-white focus:outline-none focus:bg-gray-50 font-bold ${isFrozen ? 'bg-gray-100 text-gray-500 cursor-not-allowed opacity-70' : ''}`}>
                  <option value="" disabled hidden>Pilih Kelas</option>
                  <option value="7">Kelas 7 (SMP)</option>
                  <option value="8">Kelas 8 (SMP)</option>
                  <option value="9">Kelas 9 (SMP)</option>
                  <option value="10">Kelas 10 (SMA)</option>
                  <option value="11">Kelas 11 (SMA)</option>
                  <option value="12">Kelas 12 (SMA)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wide text-black">Email Aktif</label>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="budi@email.com" disabled={isFrozen}
                  className={`w-full px-3 py-2.5 text-sm border-2 border-black rounded-lg bg-white focus:outline-none focus:bg-gray-50 font-semibold placeholder-gray-300 ${isFrozen ? 'bg-gray-100 text-gray-500 cursor-not-allowed opacity-70' : ''}`} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wide text-black">No. Telepon / WA</label>
                <input type="tel" required value={telp} onChange={(e) => setTelp(e.target.value)} placeholder="Contoh: 0812345678" disabled={isFrozen}
                  className={`w-full px-3 py-2.5 text-sm border-2 border-black rounded-lg bg-white focus:outline-none focus:bg-gray-50 font-semibold placeholder-gray-300 ${isFrozen ? 'bg-gray-100 text-gray-500 cursor-not-allowed opacity-70' : ''}`} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wide text-black">Tanggal Lahir</label>
                <input type="date" required value={lahir} onChange={(e) => setLahir(e.target.value)} disabled={isFrozen}
                  className={`w-full px-3 py-2.5 text-sm border-2 border-black rounded-lg bg-white focus:outline-none focus:bg-gray-50 font-bold ${isFrozen ? 'bg-gray-100 text-gray-500 cursor-not-allowed opacity-70' : ''}`} />
              </div>

              <div className="space-y-1.5">
                <span className="text-xs font-bold uppercase tracking-wide text-black block">Jenis Kelamin</span>
                <div className="grid grid-cols-2 gap-3">
                  <label className={`flex items-center justify-center p-2.5 border-2 border-black rounded-lg text-xs font-bold uppercase tracking-wide transition-all select-none ${gender === 'Laki-laki' ? 'bg-black text-white' : 'bg-white text-black'} ${isFrozen ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}`}>
                    <input type="radio" name="react-gender" value="Laki-laki" checked={gender === 'Laki-laki'} onChange={() => setGender('Laki-laki')} required disabled={isFrozen} className="sr-only" />
                    <span>Laki-Laki</span>
                  </label>
                  <label className={`flex items-center justify-center p-2.5 border-2 border-black rounded-lg text-xs font-bold uppercase tracking-wide transition-all select-none ${gender === 'Perempuan' ? 'bg-black text-white' : 'bg-white text-black'} ${isFrozen ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}`}>
                    <input type="radio" name="react-gender" value="Perempuan" checked={gender === 'Perempuan'} onChange={() => setGender('Perempuan')} required disabled={isFrozen} className="sr-only" />
                    <span>Perempuan</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION B: CONDITIONAL CUSTOM FIELDS & FILE CHECKLIST BY SPORT */}
          {((activeRules.memberFields && activeRules.memberFields.length > 0) ||
            (activeRules.memberFiles && activeRules.memberFiles.length > 0)) && (
              <div className="space-y-4 pt-4 border-t-2 border-dashed border-gray-200">
                <div className="text-xs font-black uppercase tracking-wider text-gray-400">
                  Persyaratan Khusus Cabang Olahraga
                </div>

                {/* Dynamically Loop and Render Fields Based on Configuration Definition */}
                {activeRules.memberFields.map(field => (
                  <div key={field.name} className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wide text-black">
                      {field.label}
                    </label>

                    {field.type === "select" ? (
                      <select
                        required={field.required}
                        value={dynamicFields[field.name] || ''}
                        onChange={(e) => handleDynamicFieldChange(field.name, e.target.value)}
                        disabled={isFrozen}
                        className={`w-full px-3 py-2.5 text-sm border-2 border-black rounded-lg bg-white focus:outline-none focus:bg-gray-50 font-bold ${isFrozen ? 'bg-gray-100 text-gray-500 cursor-not-allowed opacity-70' : ''}`}
                      >
                        <option value="" disabled hidden>Pilih {field.label}</option>
                        {field.options.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    ) : field.type === "checkbox-group" ? (
                      <div className="grid grid-cols-2 gap-2 p-2 border-2 border-black rounded-lg bg-gray-50/50">
                        {field.options.map(opt => {
                          const currentValues = dynamicFields[field.name] || [];
                          const isChecked = currentValues.includes(opt);
                          return (
                            <label key={opt} className="flex items-center space-x-2 text-xs font-bold uppercase cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                className="w-4 h-4 border-2 border-black rounded accent-black"
                                onChange={() => {
                                  if (isFrozen) return;
                                  const nextValues = isChecked
                                    ? currentValues.filter(v => v !== opt)
                                    : [...currentValues, opt];
                                  handleDynamicFieldChange(field.name, nextValues);
                                }}
                              />
                              <span>{opt}</span>
                            </label>
                          );
                        })}
                      </div>
                    ) : (
                      <input
                        type={field.type}
                        required={field.required}
                        min={field.min}
                        max={field.max}
                        placeholder={field.placeholder || "Sesuai format data resmi"}
                        value={dynamicFields[field.name] || ''}
                        onChange={(e) => handleDynamicFieldChange(field.name, e.target.value)}
                        disabled={isFrozen}
                        className={`w-full px-3 py-2.5 text-sm border-2 border-black rounded-lg focus:outline-none focus:bg-gray-50 font-semibold ${isFrozen ? 'bg-gray-100 text-gray-500 cursor-not-allowed opacity-70' : ''}`}
                      />
                    )}
                  </div>
                ))}

                {/* Dynamically Loop and Render File Dropzones */}
                {activeRules.memberFiles.map(file => {
                  const fileSelected = uploadedFiles[file.name];
                  // fileSelected can be: a File object (newly picked), a URL string (existing), or falsy
                  const isFileObj = fileSelected instanceof File;
                  const isFileUrl = typeof fileSelected === 'string' && fileSelected;
                  const displayName = isFileObj
                    ? fileSelected.name
                    : isFileUrl
                      ? `\u2713 ${fileSelected.split('/').pop()}`
                      : 'Pilih Berkas PDF...';
                  return (
                    <div key={file.name} className="border-2 border-black rounded-xl p-4 bg-white space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-black uppercase tracking-wide">{file.label}</label>
                        <span className="text-[10px] font-black uppercase text-red-600 bg-red-50 px-2 py-0.5 border border-red-200 rounded">Wajib PDF</span>
                      </div>

                      <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-3 hover:border-black transition-colors bg-gray-50/50 focus-within:border-black">
                        <input
                          type="file"
                          accept=".pdf"
                          required={mode === 'add' && file.required}
                          onChange={(e) => handleFileChange(file.name, e.target.files[0])}
                          disabled={isFrozen}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 disabled:cursor-not-allowed"
                        />
                        <div className="flex items-center space-x-3 pointer-events-none">
                          <div className="p-2 bg-white border border-gray-200 rounded-md shadow-sm">
                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <div className="truncate">
                            <p className={`text-xs font-bold ${(isFileObj || isFileUrl) ? 'text-green-600' : 'text-gray-700'}`}>
                              {displayName}
                            </p>
                            <p className="text-[10px] text-gray-400 font-medium">Klik untuk mencari dokumen berkas pemain</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

          <div className="pt-4 border-t-2 border-black flex flex-col sm:flex-row gap-3 bg-white">
            <button type="button" onClick={onClose}
              className="w-full sm:w-1/3 py-3 border-2 border-black rounded-lg font-bold text-sm uppercase tracking-wider bg-white hover:bg-gray-50 text-black active:translate-y-0.5 transition-all">
              {isFrozen ? 'Tutup' : 'Batal'}
            </button>
            {!isFrozen && (
              <button type="submit"
                className="w-full sm:w-2/3 py-3 border-2 border-black rounded-lg font-black text-sm uppercase tracking-wider bg-black hover:bg-gray-900 text-white active:translate-y-0.5 transition-all shadow-[2px_2px_0px_0px_rgba(156,163,175,1)]">
                {mode === 'add' ? 'Simpan Anggota ✓' : 'Simpan Perubahan ✓'}
              </button>
            )}
          </div>

        </form>
      </div>
    </div>
  );
}