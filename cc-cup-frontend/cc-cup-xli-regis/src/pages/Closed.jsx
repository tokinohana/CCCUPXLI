import { Link } from "react-router-dom";
import { Lock, HelpCircle } from "lucide-react";
import { Panel, SiteShell } from "@/components/site-shell";
import { Button } from "@/components/ui/button";

export default function ClosedRegistration() {
    return (
        <SiteShell>
            {/* Hero Banner Section (Mimicking Home.jsx) */}
            <section className="block-carved mb-10 p-6 sm:p-10 border-2 border-destructive bg-destructive/10">
                <div className="flex flex-col items-start gap-6">
                    <div className="flex items-center gap-3">
                        <Lock className="h-10 w-10 text-destructive" />
                        <span className="font-display text-sm font-semibold uppercase tracking-widest text-muted-foreground sm:text-base">
                            Status Pendaftaran
                        </span>
                    </div>

                    <h1 className="text-4xl sm:text-6xl text-destructive">
                        Pendaftaran Ditutup
                    </h1>

                    <p className="max-w-2xl text-lg text-muted-foreground sm:text-xl">
                        Mohon maaf, periode pembuatan akun baru untuk CC Cup XLI telah berakhir. Terima kasih atas antusiasme dari seluruh tim pendaftar.
                    </p>

                    <div className="mt-2 flex w-full flex-col gap-4 sm:flex-row sm:items-center">
                        <Link
                            to="/masuk"
                            className="inline-flex h-16 w-full items-center justify-center border-2 border-foreground bg-primary px-10 font-display text-xl uppercase tracking-wide text-primary-foreground hover:opacity-90 sm:w-auto"
                        >
                            Masuk ke Dasbor
                        </Link>
                        <Link
                            to="/"
                            className="font-display text-base uppercase tracking-wide underline underline-offset-4"
                        >
                            Kembali ke Beranda
                        </Link>
                    </div>
                </div>
            </section>

            {/* Help Panel (Mimicking Masuk/Dasbor Panels) */}
            <Panel title="Tim Anda Sudah Terdaftar?" description="Informasi bagi pendaftar yang sudah memiliki akun.">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <p className="text-sm text-muted-foreground">
                        Jika tim Anda sudah terdaftar sebelumnya, Anda masih dapat mengakses akun untuk memantau status atau memperbaiki berkas (jika diizinkan panitia).
                    </p>
                    <Button variant="outline" asChild className="shrink-0">
                        <a href="mailto:panitia@event.com" className="flex items-center gap-2">
                            <HelpCircle className="h-4 w-4" /> Hubungi Panitia
                        </a>
                    </Button>
                </div>
            </Panel>
        </SiteShell>
    );
}