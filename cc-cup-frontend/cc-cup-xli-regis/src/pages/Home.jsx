import { Link } from "react-router-dom";
import { GlyphJaguar, GlyphPyramid, GlyphStepBlock, GlyphSun } from "@/components/glyphs";
import { SiteShell } from "@/components/site-shell";

const STEPS = [
    {
        number: "1",
        title: "Buat Akun",
        body: "Isi email, sekolah, nama tim, dan cabang lomba.",
        Icon: GlyphSun,
    },
    {
        number: "2",
        title: "Isi Anggota",
        body: "Tambahkan anggota tim satu per satu. Unggah berkas yang diminta.",
        Icon: GlyphStepBlock,
    },
    {
        number: "3",
        title: "Kirim",
        body: "Periksa daftar centang, lalu tekan kirim pendaftaran.",
        Icon: GlyphJaguar,
    },
];

export default function Home() {
    return (
        <SiteShell>
            {/* Hero Banner Section */}
            <section className="block-carved mb-10 p-6 sm:p-10">
                <div className="flex flex-col items-start gap-6">
                    <div className="flex items-center gap-3">
                        <GlyphPyramid className="h-10 w-10 text-primary" />
                        <span className="font-display text-sm font-semibold uppercase tracking-widest text-muted-foreground sm:text-base">
                            Platform Pendaftaran Resmi
                        </span>
                    </div>

                    <h1 className="text-4xl sm:text-6xl">
                        CC CUP XLI
                    </h1>

                    <p className="max-w-2xl text-lg text-muted-foreground sm:text-xl">
                        Selamat datang di portal pendaftaran CC Cup XLI. Daftarkan tim sekolahmu, isi data anggota, dan unggah berkas persyaratan langsung dalam tiga langkah mudah.
                    </p>

                    <div className="mt-2 flex w-full flex-col gap-4 sm:flex-row sm:items-center">
                        <Link
                            to="/daftar"
                            className="inline-flex h-16 w-full items-center justify-center border-2 border-foreground bg-primary px-10 font-display text-xl uppercase tracking-wide text-primary-foreground hover:bg-jungle-deep sm:w-auto"
                        >
                            Mulai Pendaftaran
                        </Link>
                        <Link
                            to="/masuk"
                            className="font-display text-base uppercase tracking-wide underline underline-offset-4"
                        >
                            Sudah punya akun? Masuk
                        </Link>
                    </div>
                </div>
            </section>

            {/* Stepped pyramid layout */}
            <h2 className="mb-4 text-2xl">Tiga Langkah</h2>
            <ol className="space-y-4">
                {STEPS.map((step, index) => (
                    <li
                        key={step.number}
                        className="block-carved flex items-start gap-4 p-5"
                        style={{ marginLeft: `${index * 4}%` }}
                    >
                        <span className="glyph-band flex h-12 w-12 shrink-0 items-center justify-center font-display text-2xl">
                            {step.number}
                        </span>
                        <div className="min-w-0">
                            <h3 className="text-xl">{step.title}</h3>
                            <p className="mt-1 text-base text-muted-foreground">{step.body}</p>
                        </div>
                        <step.Icon className="ml-auto hidden h-10 w-10 shrink-0 text-muted-foreground sm:block" />
                    </li>
                ))}
            </ol>
        </SiteShell>
    );
}