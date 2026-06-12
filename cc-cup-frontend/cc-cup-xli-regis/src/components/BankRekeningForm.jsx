import React, { useState } from 'react';

export default function BankRekeningForm({ onSubmit }) {
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountHolder, setAccountHolder] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = {
      bank_name: bankName,
      account_number: accountNumber,
      account_holder: accountHolder,
    };
    onSubmit(data);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <section className="space-y-4">
        <div className="flex items-center border-b-2 border-black pb-2">
          <h2 className="font-berserker text-base font-bold uppercase tracking-tight">Informasi Rekening (Uang WO)</h2>
        </div>
        <div className="border-2 border-green-500 rounded-xl p-6 bg-green-50 text-center space-y-2">
          <span className="text-2xl">✓</span>
          <p className="text-sm font-bold text-green-700 uppercase tracking-wide">Data rekening berhasil disimpan</p>
          <p className="text-xs text-green-600">Uang jaminan Anda akan diproses setelah verifikasi panitia.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between border-b-2 border-black pb-2">
        <h2 className="font-berserker text-base font-bold uppercase tracking-tight">Informasi Rekening (WO Money)</h2>
        <span className="text-xs font-black uppercase text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-300">Wajib Diisi</span>
      </div>

      <form onSubmit={handleSubmit} className="border-2 border-black rounded-xl p-5 bg-white space-y-4 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
        <div className="text-xs font-black uppercase tracking-wider text-gray-400 border-b border-dashed border-gray-200 pb-2">
          Data Rekening untuk Pengembalian Uang Jaminan
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold uppercase tracking-wide text-black">Nama Bank <span className="text-red-500">*</span></label>
          <input
            type="text"
            required
            placeholder="Contoh: BCA, BNI, Mandiri"
            value={bankName}
            onChange={(e) => setBankName(e.target.value)}
            className="w-full px-3 py-2.5 text-sm border-2 border-black rounded-lg bg-white focus:outline-none focus:bg-gray-50 font-semibold placeholder-gray-300"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold uppercase tracking-wide text-black">Nomor Rekening <span className="text-red-500">*</span></label>
          <input
            type="text"
            required
            placeholder="Contoh: 1234567890"
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value)}
            className="w-full px-3 py-2.5 text-sm border-2 border-black rounded-lg bg-white focus:outline-none focus:bg-gray-50 font-semibold placeholder-gray-300"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold uppercase tracking-wide text-black">Nama Pemilik Rekening <span className="text-red-500">*</span></label>
          <input
            type="text"
            required
            placeholder="Sesuai nama di buku rekening"
            value={accountHolder}
            onChange={(e) => setAccountHolder(e.target.value)}
            className="w-full px-3 py-2.5 text-sm border-2 border-black rounded-lg bg-white focus:outline-none focus:bg-gray-50 font-semibold placeholder-gray-300"
          />
        </div>

        <button
          type="submit"
          className="w-full py-3 border-2 border-black rounded-lg font-black text-sm uppercase tracking-wider bg-black hover:bg-gray-900 text-white active:translate-y-0.5 transition-all shadow-[2px_2px_0px_0px_rgba(156,163,175,1)]"
        >
          Simpan Data Rekening ✓
        </button>
      </form>
    </section>
  );
}
