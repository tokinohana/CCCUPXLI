import type { Competition } from "../data/Competitions"

interface TataTertibModalProps {
    competition: Competition
    onClose: () => void
    onProceed: () => void
}

function TataTertibModal({
    competition,
    onClose,
    onProceed,
}: TataTertibModalProps) {
    return (
        <div
            onClick={(e) => {
                if (e.target === e.currentTarget) {
                    onClose()
                }
            }}
            className="
                fixed
                inset-0
                flex
                items-center
                justify-center
                bg-black/60
                backdrop-blur-sm
                z-50
            "
        >
            <div className="
                bg-[#ece8dc]
                text-[#2B2B2B]
                rounded-2xl
                p-8
                max-w-2xl
                w-full
                mx-4
                shadow-2xl
                max-h-[85vh]
                overflow-y-auto
            ">
                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                    {competition.icon && (
                        <div
                            className="w-10 h-10 bg-[#d69642] shrink-0"
                            style={{
                                maskImage: `url(${competition.icon})`,
                                maskSize: "contain",
                                maskRepeat: "no-repeat",
                                maskPosition: "center",
                                WebkitMaskImage: `url(${competition.icon})`,
                                WebkitMaskSize: "contain",
                                WebkitMaskRepeat: "no-repeat",
                                WebkitMaskPosition: "center",
                            }}
                        />
                    )}
                    <div>
                        <h2 className="
                            font-cinzel
                            text-2xl
                            font-bold
                            text-[#1f3347]
                        ">
                            Tata Tertib Umum
                        </h2>
                        <p className="text-sm opacity-60">
                            {competition.title}
                        </p>
                    </div>
                </div>

                {/* Rules */}
                <div className="
                    opacity-80
                    leading-relaxed
                    mb-8
                    space-y-4
                ">
                    <ol className="list-decimal list-inside space-y-2">
                        <li>
                            Peserta wajib mendaftar melalui website resmi CC Cup XLI
                            dengan mengisi data secara lengkap dan benar.
                        </li>
                        <li>
                            Setiap sekolah hanya diperbolehkan mendaftarkan satu tim
                            per kategori lomba, kecuali dinyatakan lain pada aturan
                            teknis masing-masing cabang.
                        </li>
                        <li>
                            Peserta wajib merupakan siswa/siswi aktif di sekolah yang
                            bersangkutan dan dibuktikan dengan surat keterangan dari
                            sekolah.
                        </li>
                        <li>
                            Pendaftaran ditutup sesuai dengan jadwal yang telah
                            ditentukan oleh panitia. Pendaftaran yang diterima setelah
                            batas waktu tidak akan diproses.
                        </li>
                        <li>
                            Peserta wajib mengikuti technical meeting yang akan
                            dilaksanakan pada waktu dan tempat yang diumumkan
                            kemudian.
                        </li>
                        <li>
                            Segala bentuk kecurangan, pelanggaran, atau tindakan
                            tidak sportif akan dikenakan sanksi berupa diskualifikasi.
                        </li>
                        <li>
                            Keputusan juri dan panitia bersifat mutlak dan tidak dapat
                            diganggu gugat.
                        </li>
                        <li>
                            Dengan mendaftar, peserta dianggap telah membaca, memahami,
                            dan menyetujui seluruh tata tertib serta aturan teknis
                            yang berlaku.
                        </li>
                    </ol>

                    <p className="text-sm italic opacity-60 pt-2">
                        Aturan teknis detail tersedia pada SOP masing-masing lomba
                        setelah pendaftaran.
                    </p>
                </div>

                {/* Actions */}
                <div className="flex gap-4 justify-end">
                    <button
                        onClick={onClose}
                        className="
                            px-6
                            py-3
                            border
                            border-[#1f3347]
                            rounded-full
                            cursor-pointer
                            transition
                            hover:bg-[#1f3347]
                            hover:text-white
                        "
                    >
                        Cancel
                    </button>

                    <button
                        onClick={onProceed}
                        className="
                            px-6
                            py-3
                            bg-[#d69642]
                            text-white
                            rounded-full
                            cursor-pointer
                            transition
                            hover:brightness-110
                        "
                    >
                        I Understand, Continue →
                    </button>
                </div>
            </div>
        </div>
    )
}

export default TataTertibModal
