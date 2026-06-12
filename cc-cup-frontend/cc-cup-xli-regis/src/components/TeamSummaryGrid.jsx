import React from 'react';

export default function TeamSummaryGrid({ teamMetadata }) {
  const { namaTim, cabangOlahraga, asalSekolah } = teamMetadata;

  const cells = [
    { label: 'Nama Kelompok / Tim', value: namaTim },
    { label: 'Cabang Kompetisi', value: cabangOlahraga },
    { label: 'Asal Sekolah', value: asalSekolah },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {cells.map(({ label, value }) => (
        <div key={label} className="border-2 border-black p-4 rounded-lg bg-gray-50 flex flex-col justify-between">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">{label}</span>
          <span className="text-lg font-black text-black uppercase mt-1">{value}</span>
        </div>
      ))}
    </div>
  );
}
