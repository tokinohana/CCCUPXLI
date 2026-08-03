/**
 * Clean Markdown source for every content page.
 */
export const PAGE_MARKDOWN = {
  "/": `# Pendaftaran CC Cup XLI

Platform pendaftaran kompetisi CC Cup XLI untuk tim sekolah (SMP dan SMA).

## Tiga langkah

1. **Buat Akun** — isi jenjang, sekolah, nama tim, nomor WhatsApp, cabang lomba, email, dan kata sandi.
2. **Isi Anggota** — tambahkan anggota tim satu per satu dan unggah berkas yang diminta.
3. **Kirim** — lengkapi lima berkas wajib, pastikan jumlah anggota sesuai, lalu kirim pendaftaran.

## Halaman

- [/daftar](/daftar) — buat akun tim baru
- [/masuk](/masuk) — masuk ke akun tim
- [/dasbor](/dasbor) — kelola anggota, berkas, dan pengiriman (perlu login)
`,
  "/daftar": `# Buat Akun Tim — CC Cup XLI

Formulir tiga langkah:

1. **Data Sekolah** — jenjang (SMP atau SMA), nama sekolah, nama tim, nomor WhatsApp.
2. **Cabang Lomba** — satu cabang lomba per tim. Daftar cabang dan batas jumlah pemain diambil langsung dari server panitia.
3. **Akun Masuk** — email dan kata sandi (minimal 8 karakter).

Setelah akun dibuat, penanggung jawab otomatis terdaftar sebagai anggota pertama tim.
`,
  "/masuk": `# Masuk — CC Cup XLI

Masuk memakai email dan kata sandi yang dipakai saat mendaftar. Setelah masuk, kamu diarahkan ke halaman pendaftaran tim (/dasbor) untuk melanjutkan pengisian data.

Belum punya akun? Buka [/daftar](/daftar).
`,
};

export const LLMS_TXT = `# CC Cup XLI — Pendaftaran

> Platform pendaftaran kompetisi CC Cup XLI untuk tim sekolah SMP dan SMA di Indonesia.
> Antarmuka dirancang untuk pengguna dengan literasi rendah: satu aksi utama per halaman, bahasa langsung, alur langkah demi langkah.

## Halaman

- [Beranda](/index.md): ringkasan alur pendaftaran tiga langkah.
- [Buat Akun Tim](/daftar.md): formulir pembuatan akun tim.
- [Masuk](/masuk.md): halaman login tim.

## Catatan

- Halaman /dasbor memerlukan login dan tidak tersedia sebagai Markdown publik.
- Setiap halaman konten juga tersedia dalam Markdown di URL yang bersangkutan.
`;