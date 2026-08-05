import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

import { FileChecklist } from "@/components/dashboard/file-checklist";
import { MemberForm } from "@/components/dashboard/member-form";
import { RekeningForm, TeamInfoForm } from "@/components/dashboard/team-forms";
import { Panel, SiteShell } from "@/components/site-shell";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import { endpoints } from "@/lib/endpoints";
import { isFrozen, STATUS_LABEL, TEAM_FILE_TYPES } from "@/lib/types";

export default function Dasbor() {
  const { team, signedIn, ready, refreshTeam } = useAuth();
  const [editingMember, setEditingMember] = useState(null);
  const [addingMember, setAddingMember] = useState(false);
  const [busy, setBusy] = useState(false);

  const { data: competitions } = useQuery({
    queryKey: ["competitions"],
    queryFn: endpoints.competitions,
    enabled: Boolean(team),
  });

  // useEffect(() => {
  //   if (signedIn) void refreshTeam();
  // }, [signedIn, refreshTeam]);

  if (!ready) {
    return (
      <SiteShell>
        <p className="p-8 text-center text-lg">Memuat data…</p>
      </SiteShell>
    );
  }

  if (!signedIn || !team) {
    return (
      <SiteShell>
        <div className="block-carved p-8 text-center">
          <h1 className="text-3xl">Akses Dibatasi</h1>
          <p className="mt-2 text-muted-foreground">Silakan masuk dahulu untuk melihat dasbor.</p>
          <Link
            to="/masuk"
            className="mt-6 inline-block border-2 border-foreground bg-primary px-6 py-2 font-display text-lg uppercase text-primary-foreground"
          >
            Masuk
          </Link>
        </div>
      </SiteShell>
    );
  }

  const frozen = isFrozen(team.regis_status);
  const competitionDetails = competitions?.[team.competition];
  const levelDetails = competitionDetails ? competitionDetails[team.jenjang] : undefined;

  const memberCount = team.members.length;
  const range = team.player_range;
  const rosterOk = range ? memberCount >= range.min && memberCount <= range.max : true;

  const uploadedKeys = new Set(team.files.map((f) => f.file_type));
  const missingFiles = TEAM_FILE_TYPES.filter((type) => !uploadedKeys.has(type.key));
  const canSubmit = rosterOk && missingFiles.length === 0;

  const reload = async () => {
    await refreshTeam();
  };

  const deleteMember = async (id) => {
    if (!window.confirm("Yakin ingin menghapus anggota ini?")) return;
    try {
      await endpoints.deleteMember(id);
      toast.success("Anggota berhasil dihapus.");
      await reload();
    } catch (caught) {
      toast.error(caught instanceof ApiError ? caught.message : "Gagal menghapus.");
    }
  };

  const submitRegistration = async () => {
    setBusy(true);
    try {
      await endpoints.submit();
      toast.success("Pendaftaran berhasil dikirim!");
      await reload();
    } catch (caught) {
      toast.error(caught instanceof ApiError ? caught.message : "Pengiriman gagal.");
    } finally {
      setBusy(false);
    }
  };

  const unsubmit = async () => {
    setBusy(true);
    try {
      await endpoints.unsubmit();
      toast.success("Pendaftaran dibuka kembali.");
      await reload();
    } catch (caught) {
      toast.error(caught instanceof ApiError ? caught.message : "Gagal membuka pendaftaran.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <SiteShell>
      <header className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-4xl">{team.nama_tim}</h1>
          <p className="text-base text-muted-foreground">
            {team.school} — {team.competition} ({team.jenjang})
          </p>
        </div>
        <span className="block-carved self-start px-4 py-2 font-display text-sm uppercase bg-secondary">
          Status: {STATUS_LABEL[team.regis_status] || team.regis_status}
        </span>
      </header>

      {/* 1. Anggota Tim */}
      <Panel
        title="Anggota Tim"
        description={`Minimal ${range?.min || 1}, Maksimal ${range?.max || "N/A"} anggota.`}
        aside={
          !frozen && !addingMember ? (
            <Button variant="monument" size="sm" onClick={() => setAddingMember(true)}>
              + Tambah Anggota
            </Button>
          ) : null
        }
      >
        {addingMember ? (
          <MemberForm
            level={levelDetails}
            onDone={async () => {
              setAddingMember(false);
              await reload();
            }}
            onCancel={() => setAddingMember(false)}
          />
        ) : editingMember ? (
          <MemberForm
            level={levelDetails}
            member={editingMember}
            onDone={async () => {
              setEditingMember(null);
              await reload();
            }}
            onCancel={() => setEditingMember(null)}
          />
        ) : (
          <div className="space-y-4">
            {team.members.length === 0 ? (
              <p className="text-muted-foreground">Belum ada anggota yang terdaftar.</p>
            ) : (
              team.members.map((member) => (
                <div
                  key={member.id}
                  className="block-carved flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-bold text-lg">
                      {member.nama} {member.is_representative ? "(Penanggung Jawab)" : ""}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {member.role || "Anggota"} — {member.email} | {member.nomor_telepon}
                    </p>
                  </div>
                  {!frozen ? (
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => setEditingMember(member)}>
                        Ubah
                      </Button>
                      {!member.is_representative ? (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => void deleteMember(member.id)}
                        >
                          Hapus
                        </Button>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              ))
            )}
          </div>
        )}
      </Panel>

      {/* 2. Berkas Syarat */}
      <Panel title="Berkas Persyaratan" description="Unggah berkas yang diperlukan.">
        <FileChecklist files={team.files} frozen={frozen} onChanged={reload} />
      </Panel>

      {/* 3. Informasi Tambahan */}
      <Panel title="Informasi Tambahan" description="Data tambahan tim.">
        <TeamInfoForm
          level={levelDetails}
          otherInfo={team.other_info}
          frozen={frozen}
          onChanged={reload}
        />
      </Panel>

      {/* 4. Rekening */}
      <Panel title="Data Rekening" description="Untuk kebutuhan pengembalian/pembayaran.">
        <RekeningForm team={team} frozen={frozen} onChanged={reload} />
      </Panel>

      {/* 5. Kirim Pendaftaran */}
      <Panel title="Kirim Pendaftaran" description="Langkah terakhir.">
        {!frozen ? (
          <>
            <ul className="mb-6 space-y-2 text-base">
              <li className={missingFiles.length === 0 ? "text-primary" : "text-destructive"}>
                {missingFiles.length === 0
                  ? "Semua berkas sudah lengkap."
                  : `Berkas belum lengkap: ${missingFiles.map((f) => f.label).join(", ")}.`}
              </li>
              <li className={rosterOk ? "text-primary" : "text-destructive"}>
                {rosterOk
                  ? "Jumlah anggota sudah sesuai."
                  : `Jumlah anggota harus ${range?.min}–${range?.max}. Sekarang ${memberCount}.`}
              </li>
            </ul>
            <Button
              variant="monument"
              disabled={!canSubmit || busy}
              onClick={() => void submitRegistration()}
            >
              {busy ? "Mengirim…" : "Kirim Pendaftaran"}
            </Button>
          </>
        ) : team.regis_status === "SUBMITTED" || team.regis_status === "REVIEWED" ? (
          <Button variant="outline" disabled={busy} onClick={() => void unsubmit()}>
            Buka Kembali untuk Diubah
          </Button>
        ) : (
          <p className="text-base">Pendaftaran timmu sudah diterima panitia.</p>
        )}
      </Panel>
    </SiteShell>
  );
}