import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { Field, FormError } from "@/components/field";
import { Panel, SiteShell } from "@/components/site-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ApiError } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import { endpoints } from "@/lib/endpoints";

export default function Masuk() {
    const { applyAuth } = useAuth();
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const [fieldErrors, setFieldErrors] = useState({});
    const [busy, setBusy] = useState(false);

    const submit = async (event) => {
        event.preventDefault();
        setError(null);
        setFieldErrors({});
        setBusy(true);

        try {
            const response = await endpoints.login({ email, password });
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
            <h1 className="mb-6 text-4xl">Masuk</h1>

            <Panel title="Akun Tim" description="Gunakan email yang dipakai saat mendaftar.">
                <form onSubmit={submit} className="space-y-6">
                    <FormError message={error} />

                    <Field id="email" label="Email" error={fieldErrors.email} required>
                        <Input
                            id="email"
                            type="email"
                            autoComplete="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </Field>

                    <Field id="password" label="Kata Sandi" error={fieldErrors.password} required>
                        <Input
                            id="password"
                            type="password"
                            autoComplete="current-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </Field>

                    <Button type="submit" variant="monument" disabled={busy}>
                        {busy ? "Memproses…" : "Masuk"}
                    </Button>
                </form>
            </Panel>

            <p className="text-base">
                Belum punya akun?{" "}
                <Link to="/daftar" className="font-semibold underline underline-offset-4">
                    Buat akun baru
                </Link>
            </p>
        </SiteShell>
    );
}