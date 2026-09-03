import { useState } from "react";
import { toast } from "sonner";

import { Field, FormError } from "@/components/field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ApiError } from "@/lib/api";
import { endpoints } from "@/lib/endpoints";

export function TeamInfoForm({ level, otherInfo, frozen, onChanged }) {
  const fieldConfigs = level?.extra?.tim ?? {};
  const keys = Object.keys(fieldConfigs);
  const [values, setValues] = useState(() => {
    const initial = {};
    for (const key of keys) {
      initial[key] = otherInfo.find((info) => info.key === key)?.value ?? "";
    }
    return initial;
  });
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  if (keys.length === 0) {
    return (
      <p className="text-base text-muted-foreground">
        Cabang lomba ini tidak memerlukan data tambahan tim.
      </p>
    );
  }

  const submit = async (event) => {
    event.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await endpoints.addInfo(values);
      await onChanged();
      toast.success("Data tim tersimpan.");
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "Data gagal disimpan.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-6">
      <FormError message={error} />
      {keys.map((key) => {
        const config = fieldConfigs[key];
        const options = config && typeof config === "object" ? config.multiple : null;

        if (Array.isArray(options)) {
          const selected = values[key] ? values[key].split(",").filter(Boolean) : [];
          const toggle = (option) => {
            setValues((prev) => {
              const current = prev[key] ? prev[key].split(",").filter(Boolean) : [];
              const next = current.includes(option)
                ? current.filter((o) => o !== option)
                : [...current, option];
              return { ...prev, [key]: next.join(",") };
            });
          };

          return (
            <Field key={key} id={`info-${key}`} label={key}>
              <div className="space-y-2 border-2 border-input bg-card p-3">
                {options.map((option) => {
                  const optionId = `info-${key}-${option}`;
                  return (
                    <label
                      key={option}
                      htmlFor={optionId}
                      className="flex items-center gap-2 text-sm font-medium"
                    >
                      <input
                        id={optionId}
                        type="checkbox"
                        className="h-4 w-4 rounded-none border-2 border-input accent-primary"
                        checked={selected.includes(option)}
                        disabled={frozen}
                        onChange={() => toggle(option)}
                      />
                      {option}
                    </label>
                  );
                })}
              </div>
            </Field>
          );
        }

        return (
          <Field key={key} id={`info-${key}`} label={key}>
            <Input
              id={`info-${key}`}
              value={values[key] ?? ""}
              disabled={frozen}
              onChange={(event) =>
                setValues((prev) => ({ ...prev, [key]: event.target.value }))
              }
            />
          </Field>
        );
      })}
      {!frozen ? (
        <Button type="submit" disabled={busy}>
          {busy ? "Menyimpan…" : "Simpan Data Tim"}
        </Button>
      ) : null}
    </form>
  );
}

export function RekeningForm({ bankName, accountNumber, accountHolder, onChanged }) {
  const [bank, setBank] = useState(bankName);
  const [number, setNumber] = useState(accountNumber);
  const [holder, setHolder] = useState(accountHolder);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [busy, setBusy] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setError(null);
    setFieldErrors({});
    setBusy(true);
    try {
      await endpoints.updateRekening({
        bank_name: bank,
        account_number: number,
        account_holder: holder,
      });
      await onChanged();
      toast.success("Rekening tersimpan.");
    } catch (caught) {
      if (caught instanceof ApiError) {
        setFieldErrors(caught.fieldErrors);
        setError(caught.message);
      } else setError("Rekening gagal disimpan.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-6">
      <FormError message={error} />
      <Field id="bank_name" label="Nama Bank" error={fieldErrors["bank_name"]} required>
        <Input id="bank_name" value={bank} onChange={(e) => setBank(e.target.value)} />
      </Field>
      <Field
        id="account_number"
        label="Nomor Rekening"
        error={fieldErrors["account_number"]}
        required
      >
        <Input
          id="account_number"
          inputMode="numeric"
          value={number}
          onChange={(e) => setNumber(e.target.value)}
        />
      </Field>
      <Field
        id="account_holder"
        label="Nama Pemilik Rekening"
        error={fieldErrors["account_holder"]}
        required
      >
        <Input id="account_holder" value={holder} onChange={(e) => setHolder(e.target.value)} />
      </Field>
      <Button type="submit" variant="monument" disabled={busy}>
        {busy ? "Menyimpan…" : "Simpan Rekening"}
      </Button>
    </form>
  );
}