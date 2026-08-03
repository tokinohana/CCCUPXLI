import { useState } from "react";

import { Field, FormError, NativeSelect } from "@/components/field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ApiError } from "@/lib/api";
import { endpoints } from "@/lib/endpoints";

const GENDER_LABEL = { M: "Laki-laki", F: "Perempuan" };

function allowedGenders(level) {
  const codes = level?.gender ?? ["U"];
  if (codes.includes("U") || codes.length === 0) return ["Laki-laki", "Perempuan"];
  return codes.map((code) => GENDER_LABEL[code] ?? code);
}

export function MemberForm({ level, member, onDone, onCancel }) {
  const editing = Boolean(member);
  const genders = allowedGenders(level);
  const subkategoriOptions = level?.subkategori ?? [];
  const extra = level?.extra?.anggota ?? {};

  const [values, setValues] = useState({
    nama: member?.nama ?? "",
    email: member?.email ?? "",
    nomor_telepon: member?.nomor_telepon ?? "",
    tanggal_lahir: member?.tanggal_lahir ?? "",
    gender: member?.gender ?? (genders.length === 1 ? genders[0] : ""),
    kelas: member?.kelas ?? "",
    nisn: member?.nisn ?? "",
    tempat_lahir: member?.tempat_lahir ?? "",
    berat_badan: member?.berat_badan != null ? String(member.berat_badan) : "",
    tinggi_badan: member?.tinggi_badan != null ? String(member.tinggi_badan) : "",
    role: member?.role ?? "",
    subkategori: member?.subkategori ?? "",
  });

  const [dynamicValues, setDynamicValues] = useState(() => {
    const initial = {};
    for (const key of Object.keys(extra)) {
      const current = member?.dynamicFields?.[key];
      initial[key] = current == null ? "" : String(current);
    }
    return initial;
  });

  const [files, setFiles] = useState({});
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [busy, setBusy] = useState(false);

  const set = (key) => (value) =>
    setValues((prev) => ({ ...prev, [key]: value }));

  const namedExtras = new Set([
    "tempat_lahir",
    "berat_badan",
    "tinggi_badan",
    "role",
    "subkategori",
  ]);

  const submit = async (event) => {
    event.preventDefault();
    setError(null);
    setFieldErrors({});
    setBusy(true);

    const form = new FormData();
    for (const key of ["nama", "email", "nomor_telepon", "tanggal_lahir", "gender", "kelas", "nisn"]) {
      form.append(key, values[key] ?? "");
    }
    for (const key of namedExtras) {
      if (key in extra || values[key]) form.append(key, values[key] ?? "");
    }

    const dynamicPayload = {};
    for (const [key, type] of Object.entries(extra)) {
      if (namedExtras.has(key)) continue;
      if (type === "File") {
        const file = files[key];
        if (file) form.append(`file_${key}`, file);
      } else if (dynamicValues[key]) {
        dynamicPayload[key] = dynamicValues[key];
      }
    }
    if (Object.keys(dynamicPayload).length > 0) {
      form.append("dynamic_data", JSON.stringify(dynamicPayload));
    }

    try {
      if (member) await endpoints.editMember(member.id, form);
      else await endpoints.addMember(form);
      await onDone();
    } catch (caught) {
      if (caught instanceof ApiError) {
        setFieldErrors(caught.fieldErrors);
        setError(caught.message);
      } else {
        setError("Tidak bisa terhubung ke server. Coba lagi.");
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-6 border-2 border-foreground bg-card p-5">
      <h3 className="text-xl">{editing ? "Ubah Anggota" : "Tambah Anggota"}</h3>
      <FormError message={error} />

      <Field id="nama" label="Nama Lengkap" error={fieldErrors["nama"]} required>
        <Input id="nama" value={values["nama"]} onChange={(e) => set("nama")(e.target.value)} />
      </Field>
      <Field id="m-email" label="Email" error={fieldErrors["email"]} required>
        <Input
          id="m-email"
          type="email"
          value={values["email"]}
          onChange={(e) => set("email")(e.target.value)}
        />
      </Field>
      <Field id="nomor_telepon" label="Nomor WhatsApp" error={fieldErrors["nomor_telepon"]} required>
        <Input
          id="nomor_telepon"
          inputMode="tel"
          value={values["nomor_telepon"]}
          onChange={(e) => set("nomor_telepon")(e.target.value)}
        />
      </Field>
      <Field id="tanggal_lahir" label="Tanggal Lahir" error={fieldErrors["tanggal_lahir"]}>
        <Input
          id="tanggal_lahir"
          type="date"
          value={values["tanggal_lahir"]}
          onChange={(e) => set("tanggal_lahir")(e.target.value)}
        />
      </Field>
      <Field
        id="gender"
        label="Jenis Kelamin"
        hint={genders.length === 1 ? `Cabang ini hanya menerima ${genders[0]}.` : undefined}
        error={fieldErrors["gender"]}
        required
      >
        <NativeSelect id="gender" value={values["gender"] ?? ""} onChange={set("gender")}>
          <option value="">Pilih</option>
          {genders.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </NativeSelect>
      </Field>
      <Field id="kelas" label="Kelas" error={fieldErrors["kelas"]} required>
        <Input id="kelas" value={values["kelas"]} onChange={(e) => set("kelas")(e.target.value)} />
      </Field>
      <Field id="nisn" label="NISN" error={fieldErrors["nisn"]} required>
        <Input id="nisn" value={values["nisn"]} onChange={(e) => set("nisn")(e.target.value)} />
      </Field>

      {"tempat_lahir" in extra ? (
        <Field id="tempat_lahir" label="Tempat Lahir" error={fieldErrors["tempat_lahir"]}>
          <Input
            id="tempat_lahir"
            value={values["tempat_lahir"]}
            onChange={(e) => set("tempat_lahir")(e.target.value)}
          />
        </Field>
      ) : null}
      {"berat_badan" in extra ? (
        <Field id="berat_badan" label="Berat Badan (kg)" error={fieldErrors["berat_badan"]}>
          <Input
            id="berat_badan"
            type="number"
            value={values["berat_badan"]}
            onChange={(e) => set("berat_badan")(e.target.value)}
          />
        </Field>
      ) : null}
      {"tinggi_badan" in extra ? (
        <Field id="tinggi_badan" label="Tinggi Badan (cm)" error={fieldErrors["tinggi_badan"]}>
          <Input
            id="tinggi_badan"
            type="number"
            value={values["tinggi_badan"]}
            onChange={(e) => set("tinggi_badan")(e.target.value)}
          />
        </Field>
      ) : null}
      {"role" in extra ? (
        <Field id="role" label="Posisi / Peran" error={fieldErrors["role"]}>
          <Input id="role" value={values["role"]} onChange={(e) => set("role")(e.target.value)} />
        </Field>
      ) : null}
      {subkategoriOptions.length > 0 ? (
        <Field id="subkategori" label="Kelas Pertandingan" error={fieldErrors["subkategori"]}>
          <NativeSelect
            id="subkategori"
            value={values["subkategori"] ?? ""}
            onChange={set("subkategori")}
          >
            <option value="">Pilih</option>
            {subkategoriOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </NativeSelect>
        </Field>
      ) : null}

      {Object.entries(extra)
        .filter(([key]) => !namedExtras.has(key))
        .map(([key, type]) =>
          type === "File" ? (
            <Field key={key} label={key} id={`file-${key}`} error={fieldErrors[key]}>
              <Input
                id={`file-${key}`}
                type="file"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) setFiles((prev) => ({ ...prev, [key]: file }));
                }}
              />
            </Field>
          ) : (
            <Field key={key} label={key} id={`dyn-${key}`} error={fieldErrors[key]}>
              <Input
                id={`dyn-${key}`}
                type={type === "Number" ? "number" : "text"}
                value={dynamicValues[key] ?? ""}
                onChange={(e) =>
                  setDynamicValues((prev) => ({ ...prev, [key]: e.target.value }))
                }
              />
            </Field>
          ),
        )}

      <div className="flex flex-col gap-3 sm:flex-row-reverse">
        <Button type="submit" variant="monument" disabled={busy}>
          {busy ? "Menyimpan…" : "Simpan Anggota"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Batal
        </Button>
      </div>
    </form>
  );
}