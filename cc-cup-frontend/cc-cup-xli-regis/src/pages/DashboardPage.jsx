import React, { useState, useEffect, useCallback } from 'react';

// Components
import NavigationHeader from '../components/NavigationHeader';
import StatusBanner from '../components/StatusBanner';
import TeamSummaryGrid from '../components/TeamSummaryGrid';
import TeamFilesWorkspace from '../components/TeamFilesWorkspace';
import TeamInfoWorkspace from '../components/TeamInfoWorkspace';
import RosterWorkspace from '../components/RosterWorkspace';
import MobileToolbar from '../components/MobileToolbar';
import UnifiedMemberModal from '../components/UnifiedMemberModal';
import BankRekeningForm from '../components/BankRekeningForm';

// Competition metadata for dynamic field/quota resolution
import { COMPETITION_METADATA } from '../config/competition';

// API layer
import {
  getDashboard,
  addMember,
  editMember,
  deleteMember,
  uploadTeamFile,
  deleteTeamFile,
  saveTeamInfo,
  submitRegistration,
  unsubmitRegistration,
  updateRekening,
  logout as apiLogout,
} from '../lib/api';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers: transform API data → component state
// ─────────────────────────────────────────────────────────────────────────────
function filesArrayToState(filesArray) {
  // API returns [{file_type, url, ...}] → state: { pembayaran: url, ... }
  const state = {
    pembayaran: null,
    kartuPelajar: null,
    selfie: null,
    suratPernyataan: null,
    suratIzin: null,
  };
  if (!filesArray) return state;
  filesArray.forEach(f => { state[f.file_type] = f.url; });
  return state;
}

function otherInfoArrayToState(infoArray) {
  // API returns [{key, value}] → state: { key: value }
  const state = {};
  if (!infoArray) return state;
  infoArray.forEach(i => { state[i.key] = i.value; });
  return state;
}

function membersFromApi(membersArray) {
  if (!membersArray) return [];
  return membersArray.map(m => ({
    id: m.id,
    nama: m.nama,
    nisn: m.nisn,
    kelas: m.kelas,
    email: m.email,
    telp: m.nomor_telepon,
    lahir: m.tanggal_lahir,
    gender: m.gender,
    isKapten: m.is_kapten,
    dynamicFields: m.dynamicFields || {},
    files: m.files || [],
  }));
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────
export default function DashboardPage({ teamData: initialTeamData, onTeamUpdate, onStatusChange, onLogout }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Team identity (read-only from server)
  const [teamMetadata, setTeamMetadata] = useState({
    namaTim: '',
    cabangOlahraga: '',
    sportSlug: '',
    asalSekolah: '',
  });

  // Status
  const [regisStatus, setRegisStatus] = useState('PENDING');

  // Dynamic team info (coach data etc.)
  const [teamInfo, setTeamInfo] = useState({});

  // Members roster
  const [members, setMembers] = useState([]);

  // Team files
  const [teamFiles, setTeamFiles] = useState({
    pembayaran: null,
    kartuPelajar: null,
    selfie: null,
    suratPernyataan: null,
    suratIzin: null,
  });

  // Modal
  const [modalConfig, setModalConfig] = useState({ isOpen: false, mode: 'add', selectedMember: null });

  // Active competition rules
  const activeCompetitionRules = COMPETITION_METADATA[teamMetadata.sportSlug] || {
    minPlayers: 1, maxPlayers: 100, teamFields: [], memberFields: [], memberFiles: []
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // Populate state from API data
  // ─────────────────────────────────────────────────────────────────────────────
  const populateFromData = useCallback((data) => {
    if (!data) return;

    // Competition slug is stored directly on the team model
    const slug = data.competition || '';
    const competitionMeta = COMPETITION_METADATA[slug];

    setTeamMetadata({
      namaTim: data.nama_tim,
      cabangOlahraga: competitionMeta?.label || slug,
      sportSlug: slug,
      asalSekolah: data.school,
    });

    setRegisStatus(data.regis_status || 'PENDING');
    setMembers(membersFromApi(data.members));
    setTeamFiles(filesArrayToState(data.files));
    setTeamInfo(otherInfoArrayToState(data.other_info));
  }, []);

  // ─────────────────────────────────────────────────────────────────────────────
  // Fetch on mount (or use pre-loaded initialTeamData)
  // ─────────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    async function init() {
      if (initialTeamData && !loading) {
        // Already have data from session restore / login
        populateFromData(initialTeamData);
        setLoading(false);
        return;
      }
      try {
        const data = await getDashboard();
        populateFromData(data);
        onTeamUpdate?.(data);
      } catch (err) {
        setError('Gagal memuat data dashboard. Silakan refresh atau login ulang.');
      }
      setLoading(false);
    }
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Also populate when initialTeamData changes (e.g. after session restore)
  useEffect(() => {
    if (initialTeamData) populateFromData(initialTeamData);
  }, [initialTeamData, populateFromData]);

  const isFrozen = regisStatus === 'SUBMITTED' || regisStatus === 'ACCEPTED' || regisStatus === 'REVIEWED';
  const isPendingTF = regisStatus === 'PENDINGTF';

  // ─────────────────────────────────────────────────────────────────────────────
  // Handlers
  // ─────────────────────────────────────────────────────────────────────────────

  // Team info field change (coach info etc.) — debounced save
  const teamInfoTimeoutRef = React.useRef(null);
  const handleTeamInfoChange = (fieldName, value) => {
    setTeamInfo(prev => ({ ...prev, [fieldName]: value }));
    // Debounce: wait 800ms after last change before saving
    clearTimeout(teamInfoTimeoutRef.current);
    teamInfoTimeoutRef.current = setTimeout(async () => {
      try {
        await saveTeamInfo({ [fieldName]: value });
      } catch (err) {
        console.error('Gagal menyimpan info tim:', err);
      }
    }, 800);
  };

  // Team file upload
  const handleTeamFileChange = async (key, file) => {
    if (!file) return;
    // Optimistic update: show the local File object immediately
    setTeamFiles(prev => ({ ...prev, [key]: file }));
    try {
      const result = await uploadTeamFile(key, file);
      // Replace with the server URL
      setTeamFiles(prev => ({ ...prev, [key]: result.url }));
    } catch (err) {
      setError(`Gagal mengunggah file "${key}". ${err.response?.data?.error || ''}`);
      setTeamFiles(prev => ({ ...prev, [key]: null }));
    }
  };

  // Team file remove
  const handleRemoveTeamFile = async (key) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus berkas ini?')) return;
    try {
      await deleteTeamFile(key);
      setTeamFiles(prev => ({ ...prev, [key]: null }));
    } catch (err) {
      setError(`Gagal menghapus file. ${err.response?.data?.error || ''}`);
    }
  };

  // Delete member
  const handleDeleteMember = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus anggota ini dari tim?')) return;
    try {
      await deleteMember(id);
      setMembers(prev => prev.filter(m => m.id !== id));
    } catch (err) {
      setError(`Gagal menghapus anggota. ${err.response?.data?.error || ''}`);
    }
  };

  // Save member (add or edit) — builds FormData and calls API
  const handleSaveMember = async (payload) => {
    const formData = new FormData();

    // Base fields
    Object.entries(payload.base).forEach(([key, value]) => {
      formData.append(key, value || '');
    });

    // Dynamic fields as JSON string
    formData.append('dynamic_data', JSON.stringify(payload.dynamic || {}));

    // Member files
    if (payload.files) {
      Object.entries(payload.files).forEach(([key, file]) => {
        if (file instanceof File) {
          formData.append(`file_${key}`, file);
        }
      });
    }

    try {
      let savedMember;
      if (payload.mode === 'add') {
        savedMember = await addMember(formData);
        setMembers(prev => [...prev, {
          id: savedMember.id,
          nama: savedMember.nama,
          nisn: savedMember.nisn,
          kelas: savedMember.kelas,
          email: savedMember.email,
          telp: savedMember.nomor_telepon,
          lahir: savedMember.tanggal_lahir,
          gender: savedMember.gender,
          isKapten: savedMember.is_kapten,
          dynamicFields: savedMember.dynamicFields || {},
          files: savedMember.files || [],
        }]);
      } else {
        savedMember = await editMember(modalConfig.selectedMember.id, formData);
        setMembers(prev => prev.map(m => m.id === savedMember.id ? {
          id: savedMember.id,
          nama: savedMember.nama,
          nisn: savedMember.nisn,
          kelas: savedMember.kelas,
          email: savedMember.email,
          telp: savedMember.nomor_telepon,
          lahir: savedMember.tanggal_lahir,
          gender: savedMember.gender,
          isKapten: savedMember.is_kapten,
          dynamicFields: savedMember.dynamicFields || {},
          files: savedMember.files || [],
        } : m));
      }
      setModalConfig({ isOpen: false, mode: 'add', selectedMember: null });
    } catch (err) {
      const msg = err.response?.data?.error || 'Gagal menyimpan anggota.';
      setError(msg);
    }
  };

  // Final submission
  const handleFinalSubmission = async () => {
    // Client-side pre-check
    const missingFiles = Object.entries(teamFiles).filter(([, v]) => !v);
    if (missingFiles.length > 0) {
      alert(`GAGAL: Seluruh berkas tim wajib harus terunggah! Yang belum: ${missingFiles.map(([k]) => k).join(', ')}`);
      return;
    }
    if (members.length < activeCompetitionRules.minPlayers) {
      alert(`GAGAL: Jumlah anggota tim kurang dari batas kuota minimum (${activeCompetitionRules.minPlayers} Pemain)!`);
      return;
    }
    if (!window.confirm('Apakah Anda yakin seluruh berkas dan data anggota sudah benar? Setelah dikirim, data akan dikunci untuk direview.')) return;

    try {
      const data = await submitRegistration();
      setRegisStatus(data.regis_status);
      onStatusChange?.(data.regis_status);
      onTeamUpdate?.(data);
    } catch (err) {
      alert(err.response?.data?.error || 'Gagal mengirim pendaftaran.');
    }
  };

  // Revoke / unsubmit
  const handleRevoke = async () => {
    if (!window.confirm('Apakah Anda yakin ingin membatalkan pengiriman? Status tim akan kembali menjadi PENDING dan Anda dapat mengubah data kembali.')) return;
    try {
      const data = await unsubmitRegistration();
      setRegisStatus(data.regis_status);
      onStatusChange?.(data.regis_status);
      onTeamUpdate?.(data);
    } catch (err) {
      alert(err.response?.data?.error || 'Gagal menarik pendaftaran.');
    }
  };

  // Bank rekening
  const handleRekeningSubmit = async (data) => {
    try {
      const result = await updateRekening(data);
      onTeamUpdate?.(result);
    } catch (err) {
      setError(err.response?.data?.error || 'Gagal menyimpan data rekening.');
    }
  };

  // Logout
  const handleLogout = async () => {
    await apiLogout();
    onLogout();
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 border-4 border-black border-t-yellow-400 rounded-full animate-spin mx-auto" />
          <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Memuat dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white text-black font-inter min-h-screen flex flex-col justify-between antialiased">

      {/* Reusable Desktop Header */}
      <NavigationHeader onLogout={handleLogout} />

      {/* Main Workspace Frame */}
      <main className="flex-grow max-w-5xl w-full mx-auto px-4 py-6 md:py-10 space-y-8">

        {/* Error banner */}
        {error && (
          <div className="bg-red-50 border-2 border-red-300 rounded-lg p-3 text-sm font-semibold text-red-700">
            {error}
            <button onClick={() => setError('')} className="ml-2 text-red-500 hover:text-red-700 font-black">✕</button>
          </div>
        )}

        {/* Dynamic Workflow Banner */}
        <StatusBanner
          regisStatus={regisStatus}
          isFrozen={isFrozen}
          onFinalSubmit={handleFinalSubmission}
          onRevoke={handleRevoke}
        />

        {/* Read-Only Identity Row */}
        <TeamSummaryGrid teamMetadata={teamMetadata} />

        {/* Dynamic Team-Level Metadata Form */}
        <TeamInfoWorkspace
          sportSlug={teamMetadata.sportSlug}
          teamInfo={teamInfo}
          isFrozen={isFrozen}
          onFieldChange={handleTeamInfoChange}
        />

        {/* The Twin Workspace Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Left Column: Handles document uploads */}
          <TeamFilesWorkspace
            teamFiles={teamFiles}
            isFrozen={isFrozen}
            onFileChange={handleTeamFileChange}
            onFileRemove={handleRemoveTeamFile}
          />

          {/* Right Column: Handles team roster */}
          <RosterWorkspace
            members={members}
            isFrozen={isFrozen}
            minPlayers={activeCompetitionRules.minPlayers}
            maxPlayers={activeCompetitionRules.maxPlayers}
            onOpenModal={(config) => setModalConfig(config)}
            onDeleteMember={handleDeleteMember}
          />

        </div>

        {/* PENDINGTF: Bank Account Configuration Form */}
        {isPendingTF && (
          <BankRekeningForm onSubmit={handleRekeningSubmit} />
        )}
      </main>

      {/* Reusable Mobile Footer Nav Bar */}
      <MobileToolbar onLogout={handleLogout} />

      {/* Controlled Member Operations Portal Overlay Modal */}
      <UnifiedMemberModal
        isOpen={modalConfig.isOpen}
        mode={modalConfig.mode}
        activeSportSlug={teamMetadata.sportSlug}
        existingMemberData={modalConfig.selectedMember}
        isFrozen={isFrozen}
        onClose={() => setModalConfig({ isOpen: false, mode: 'add', selectedMember: null })}
        onSave={handleSaveMember}
      />
    </div>
  );
}
