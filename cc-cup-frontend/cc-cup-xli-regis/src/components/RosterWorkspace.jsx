import React from 'react';

function RosterMemberCard({ member, isFrozen, onEdit, onDelete }) {
  return (
    <div className="border-2 border-black p-4 rounded-xl bg-white flex items-center justify-between shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
      <div className="space-y-1">
        <div className="flex items-center space-x-2 flex-wrap gap-y-1">
          <span className="text-base font-black text-black">{member.nama}</span>
          {member.isKapten ? (
            <span className="text-[9px] font-black uppercase bg-black text-white px-2 py-0.5 rounded tracking-wider">
              Kapten Tim
            </span>
          ) : (
            <span className="text-[9px] font-black uppercase bg-gray-100 border border-black text-black px-2 py-0.5 rounded tracking-wider">
              Anggota
            </span>
          )}
        </div>
        <p className="text-xs text-gray-500 font-medium tracking-wide">
          NISN: {member.nisn} • Kelas {member.kelas} • {member.gender}
        </p>
      </div>

      {!isFrozen ? (
        <div className="flex items-center space-x-2 flex-shrink-0">
          <button
            type="button"
            onClick={() => onEdit(member)}
            className="text-xs font-black uppercase px-3 py-1.5 border-2 border-black rounded-lg bg-white hover:bg-gray-50 transition-all cursor-pointer"
          >
            Edit
          </button>
          {!member.isKapten && (
            <button
              type="button"
              onClick={() => onDelete(member.id)}
              className="text-xs font-black uppercase px-3 py-1.5 border-2 border-red-500 text-red-500 rounded-lg bg-white hover:bg-red-50 transition-all cursor-pointer"
            >
              Hapus
            </button>
          )}
        </div>
      ) : (
        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider pr-2">
          {member.isKapten ? 'Utama' : 'Terdaftar'}
        </span>
      )}
    </div>
  );
}

export default function RosterWorkspace({ members, isFrozen, minPlayers = 5, maxPlayers = 12, onOpenModal, onDeleteMember }) {
  const handleAdd = () => {
    onOpenModal({ isOpen: true, mode: 'add', selectedMember: null });
  };

  const handleEdit = (member) => {
    onOpenModal({ isOpen: true, mode: 'edit', selectedMember: member });
  };

  return (
    <section className="lg:col-span-7 space-y-4">
      <div className="flex items-center justify-between border-b-2 border-black pb-2">
        <h2 className="font-berserker text-base font-bold uppercase tracking-tight">Daftar Anggota Kelompok</h2>
        <span className="text-xs font-bold uppercase bg-gray-100 border border-black px-2 py-0.5 rounded text-gray-600">
          Kuota: {minPlayers} - {maxPlayers} Pemain
        </span>
      </div>

      {isFrozen ? (
        <div className="w-full text-center py-4 border-2 border-dashed border-gray-300 bg-gray-50 rounded-xl font-bold text-sm uppercase tracking-wide text-gray-400 cursor-not-allowed select-none">
          🔒 Fitur Tambah Anggota Dikunci
        </div>
      ) : (
        <button
          type="button"
          onClick={handleAdd}
          className="w-full text-center py-4 border-2 border-dashed border-black bg-white hover:bg-gray-50 rounded-xl font-black text-sm uppercase tracking-wide text-black transition-all cursor-pointer active:translate-y-0.5"
        >
          + Tambah Anggota Baru
        </button>
      )}

      <div className="space-y-3">
        {members.length === 0 ? (
          <div className="text-center py-8 text-sm font-bold text-gray-400 uppercase tracking-wide">
            Belum ada anggota ditambahkan
          </div>
        ) : (
          members.map((member) => (
            <RosterMemberCard
              key={member.id}
              member={member}
              isFrozen={isFrozen}
              onEdit={handleEdit}
              onDelete={onDeleteMember}
            />
          ))
        )}
      </div>

      <div className="pt-2 text-xs font-bold text-gray-400 uppercase tracking-wide border-t border-gray-200">
        Total: {members.length} anggota terdaftar
      </div>
    </section>
  );
}
