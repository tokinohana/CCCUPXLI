import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { Field, FormError, NativeSelect } from "@/components/field";
import { Panel, SiteShell } from "@/components/site-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ApiError } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import { endpoints } from "@/lib/endpoints";

const STEP_TITLES = ["Data Sekolah", "Cabang Lomba", "Akun Masuk"];

export default function Daftar() {
    const { applyAuth } = useAuth();
    const navigate = useNavigate();

    const [step, setStep] = useState(0);

    // Step 0 fields
    const [jenjang, setJenjang] = useState("SMA");
    const [school, setSchool] = useState("");
    const [namaTim, setNamaTim] = useState("");
    const [phone, setPhone] = useState("");

    // Step 1 fields
    const [competition, setCompetition] = useState("");

    // Step 2 fields
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [error, setError] = useState(null);
    const [fieldErrors, setFieldErrors] = useState({});
    const [busy, setBusy] = useState(false);

    // Fetch competitions list from API
    const { data: competitions } = useQuery({
        queryKey: ["competitions"],
        queryFn: endpoints.competitions,
    });

    // Filter valid competitions by selected school level (jenjang)
    const availableCompetitions = useMemo(() => {
        if (!competitions) return [];
        return Object.entries(competitions)
            .filter(([, comp]) => comp.jenjang?.includes(jenjang))
            .map(([key, comp]) => ({ key, name: comp.name }));
    }, [competitions, jenjang]);

    const selectedCompObj = competition ? competitions?.[competition] : null;
    const levelDetails = selectedCompObj ? selectedCompObj[jenjang] : null;

    const stepValid = [
        school.trim().length > 0 && namaTim.trim().length > 0 && phone.trim().length > 0,
        competition.length > 0,
        email.includes("@") && password.length >= 8,
    ];

    const submit = async (event) => {
        event.preventDefault();
        if (!stepValid[2]) return;

        setError(null);
        setFieldErrors({});
        setBusy(true);

        try {
            const response = await endpoints.register({
                email,
                password,
                phone,
                jenjang,
                school,
                nama_tim: namaTim,
                competition,
            });
            applyAuth(response);
            navigate("/dasbor");
        } catch (caught) {
            if (caught instanceof ApiError) {
                setFieldErrors(caught.fieldErrors || {});
                setError(caught.message);
            } else {
                setError("Tidak bisa terhubung ke server. Periksa koneksi internetmu.");
            }
        } finally {
            setBusy(false);
        }
    };

    return (
        <SiteShell>
            <h1 className="mb-2 text-4xl">Buat Akun Tim</h1>
            <p className="mb-6 text-base text-muted-foreground">
                Langkah {step + 1} dari 3 — {STEP_TITLES[step]}
            </p>

            {/* Step Indicators */}
            <div className="mb-8 flex gap-2">
                {STEP_TITLES.map((title, index) => (
                    <button
                        key={title}
                        type="button"
                        onClick={() => index < step && setStep(index)}
                        disabled={index > step}
                        className={`flex-1 border-b-4 py-2 font-display text-sm uppercase tracking-wide transition-colors ${index === step
                            ? "border-primary font-bold text-foreground"
                            : index < step
                                ? "border-foreground text-foreground"
                                : "border-muted text-muted-foreground"
                            }`}
                    >
                        {index + 1}. {title}
                    </button>
                ))}
            </div>

            <form onSubmit={submit}>
                <FormError message={error} />

                {/* Step 1: Data Sekolah */}
                {step === 0 ? (
                    <Panel title="Data Sekolah" description="Pilih jenjang dan isi nama sekolahmu.">
                        <div className="space-y-6">
                            <Field id="jenjang" label="Jenjang Sekolah" required>
                                <div className="flex gap-4">
                                    {["SMP", "SMA"].map((j) => (
                                        <label key={j} className="flex items-center gap-2 font-semibold">
                                            <input
                                                type="radio"
                                                name="jenjang"
                                                value={j}
                                                checked={jenjang === j}
                                                onChange={() => {
                                                    setJenjang(j);
                                                    setCompetition("");
                                                }}
                                            />
                                            {j}
                                        </label>
                                    ))}
                                </div>
                            </Field>

                            <Field id="school" label="Nama Sekolah" error={fieldErrors.school} required>
                                <Input
                                    id="school"
                                    value={school}
                                    onChange={(e) => setSchool(e.target.value)}
                                    placeholder="mis. SMA Negeri 1 Jakarta"
                                />
                            </Field>

                            <Field id="nama_tim" label="Nama Tim" error={fieldErrors.nama_tim} required>
                                <Input
                                    id="nama_tim"
                                    value={namaTim}
                                    onChange={(e) => setNamaTim(e.target.value)}
                                    placeholder="mis. Garuda A"
                                />
                            </Field>

                            <Field
                                id="phone"
                                label="Nomor WhatsApp Penanggung Jawab"
                                error={fieldErrors.phone}
                                required
                            >
                                <Input
                                    id="phone"
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="08123456789"
                                />
                            </Field>
                        </div>
                    </Panel>
                ) : null}

                {/* Step 2: Cabang Lomba */}
                {step === 1 ? (
                    <Panel title="Cabang Lomba" description="Pilih lomba yang ingin diikuti oleh tim ini.">
                        <div className="space-y-6">
                            <Field
                                id="competition"
                                label="Cabang Lomba"
                                error={fieldErrors.competition}
                                required
                            >
                                <NativeSelect
                                    id="competition"
                                    value={competition}
                                    onChange={(val) => setCompetition(val)}
                                >
                                    <option value="">-- Pilih Cabang Lomba --</option>
                                    {availableCompetitions.map((c) => (
                                        <option key={c.key} value={c.key}>
                                            {c.name}
                                        </option>
                                    ))}
                                </NativeSelect>
                            </Field>

                            {levelDetails ? (
                                <div className="block-carved bg-secondary p-4 text-sm space-y-1">
                                    <p>
                                        <strong>Jumlah Pemain:</strong> {levelDetails.players?.[0]}–
                                        {levelDetails.players?.[1]} orang
                                    </p>
                                    {levelDetails.kuota ? (
                                        <p>
                                            <strong>Total Kuota:</strong> {levelDetails.kuota}
                                        </p>
                                    ) : null}
                                </div>
                            ) : null}
                        </div>
                    </Panel>
                ) : null}

                {/* Step 3: Akun Masuk */}
                {step === 2 ? (
                    <Panel title="Akun Masuk" description="Buat kredensial login untuk tim ini.">
                        <div className="space-y-6">
                            <Field id="email" label="Email Penanggung Jawab" error={fieldErrors.email} required>
                                <Input
                                    id="email"
                                    type="email"
                                    autoComplete="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </Field>

                            <Field
                                id="password"
                                label="Kata Sandi (Min 8 karakter)"
                                error={fieldErrors.password}
                                required
                            >
                                <Input
                                    id="password"
                                    type="password"
                                    autoComplete="new-password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                {password.length > 0 && password.length < 8 ? (
                                    <p className="text-sm text-destructive">Kata sandi masih kurang dari 8 huruf.</p>
                                ) : null}
                            </Field>
                        </div>
                    </Panel>
                ) : null}

                <div className="flex flex-col gap-3 sm:flex-row-reverse sm:items-center">
                    {step < 2 ? (
                        <Button
                            type="button"
                            variant="monument"
                            disabled={!stepValid[step]}
                            onClick={() => setStep((v) => v + 1)}
                        >
                            Lanjut
                        </Button>
                    ) : (
                        <Button type="submit" variant="monument" disabled={!stepValid[2] || busy}>
                            {busy ? "Mendaftarkan…" : "Selesai Daftar"}
                        </Button>
                    )}
                    {step > 0 ? (
                        <Button type="button" variant="outline" onClick={() => setStep((v) => v - 1)}>
                            Kembali
                        </Button>
                    ) : null}
                </div>
            </form>

            <p className="mt-8 text-base">
                Sudah punya akun?{" "}
                <Link to="/masuk" className="font-semibold underline underline-offset-4">
                    Masuk di sini
                </Link>
            </p>
        </SiteShell>
    );
}