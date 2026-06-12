import React from 'react';
import { COMPETITION_METADATA } from '../config/competition';

export default function TeamInfoWorkspace({ sportSlug, teamInfo, isFrozen, onFieldChange }) {
  const activeRules = COMPETITION_METADATA[sportSlug] || { teamFields: [] };
  const fields = activeRules.teamFields || [];

  // If no team fields for this sport, render a muted fallback
  if (fields.length === 0) {
    return (
      <section className="space-y-4">
        <div className="flex items-center border-b-2 border-black pb-2">
          <h2 className="font-berserker text-base font-bold uppercase tracking-tight">Informasi Tambahan Kompetisi</h2>
        </div>
        <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 bg-gray-50 text-center">
          <p className="text-sm font-bold text-gray-400 uppercase tracking-wide">
            Tidak ada informasi tambahan yang diperlukan untuk cabang olahraga ini.
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Lanjutkan ke pengunggahan berkas dan pengisian daftar anggota tim.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between border-b-2 border-black pb-2">
        <h2 className="font-berserker text-base font-bold uppercase tracking-tight">Informasi Tambahan Kompetisi</h2>
        {isFrozen ? (
          <span className="text-xs font-black uppercase text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">Terkunci</span>
        ) : (
          <span className="text-xs font-black uppercase text-yellow-700 bg-yellow-50 px-2 py-0.5 rounded border border-yellow-300">Dapat Diubah</span>
        )}
      </div>

      <div className="border-2 border-black rounded-xl p-5 bg-white space-y-4 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
        <div className="text-xs font-black uppercase tracking-wider text-gray-400 border-b border-dashed border-gray-200 pb-2">
          Data Pelatih / Penanggung Jawab
        </div>

        {fields.map(field => (
          <div key={field.name} className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wide text-black">
              {field.label}
              {field.required && <span className="text-red-500 ml-0.5">*</span>}
            </label>
            <input
              type={field.type}
              required={field.required}
              disabled={isFrozen}
              placeholder={field.placeholder || `Masukkan ${field.label.toLowerCase()}`}
              value={teamInfo[field.name] || ''}
              onChange={(e) => onFieldChange(field.name, e.target.value)}
              className={`w-full px-3 py-2.5 text-sm border-2 border-black rounded-lg bg-white focus:outline-none focus:bg-gray-50 font-semibold placeholder-gray-300 transition-colors ${
                isFrozen ? 'bg-gray-100 text-gray-500 cursor-not-allowed opacity-70' : ''
              }`}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
