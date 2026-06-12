export const COMPETITION_METADATA = {
    // === MINI SOCCER ===
    "mini-soccer-smp": {
        label: "Mini Soccer (SMP)",
        status: "opened",
        minPlayers: 7,
        maxPlayers: 14,
        teamFields: [],
        memberFields: [],
        memberFiles: []
    },
    "mini-soccer-sma": {
        label: "Mini Soccer (SMA)",
        status: "opened",
        minPlayers: 7,
        maxPlayers: 14,
        teamFields: [],
        memberFields: [],
        memberFiles: []
    },

    // === BASKET PUTRA ===
    "basket-putra-smp": {
        label: "Basket Putra (SMP)",
        status: "opened",
        minPlayers: 5,
        maxPlayers: 12,
        teamFields: [
            { name: "coach_name", label: "Nama Pelatih", type: "text", required: true },
            { name: "coach_email", label: "Email Pelatih", type: "email", required: true },
            { name: "coach_phone", label: "Nomor Telepon Pelatih (WA)", type: "tel", required: true }
        ],
        memberFields: [
            { name: "tempat_lahir", label: "Tempat Lahir", type: "text", required: true, placeholder: "Contoh: Jakarta" },
            { name: "berat_badan", label: "Berat Badan (kg)", type: "number", required: true, min: 30, max: 150, placeholder: "Contoh: 70" },
            { name: "tinggi_badan", label: "Tinggi Badan (cm)", type: "number", required: true, min: 100, max: 250, placeholder: "Contoh: 178" }
        ],
        memberFiles: []
    },
    "basket-putra-sma": {
        label: "Basket Putra (SMA)",
        status: "opened",
        minPlayers: 5,
        maxPlayers: 12,
        teamFields: [
            { name: "coach_name", label: "Nama Pelatih", type: "text", required: true },
            { name: "coach_email", label: "Email Pelatih", type: "email", required: true },
            { name: "coach_phone", label: "Nomor Telepon Pelatih (WA)", type: "tel", required: true }
        ],
        memberFields: [
            { name: "tempat_lahir", label: "Tempat Lahir", type: "text", required: true, placeholder: "Contoh: Jakarta" },
            { name: "berat_badan", label: "Berat Badan (kg)", type: "number", required: true, min: 30, max: 150, placeholder: "Contoh: 70" },
            { name: "tinggi_badan", label: "Tinggi Badan (cm)", type: "number", required: true, min: 100, max: 250, placeholder: "Contoh: 178" }
        ],
        memberFiles: []
    },

    // === BASKET PUTRI ===
    "basket-putri-smp": {
        label: "Basket Putri (SMP)",
        status: "opened",
        minPlayers: 5,
        maxPlayers: 12,
        teamFields: [
            { name: "coach_name", label: "Nama Pelatih", type: "text", required: true },
            { name: "coach_email", label: "Email Pelatih", type: "email", required: true },
            { name: "coach_phone", label: "Nomor Telepon Pelatih (WA)", type: "tel", required: true }
        ],
        memberFields: [
            { name: "tempat_lahir", label: "Tempat Lahir", type: "text", required: true, placeholder: "Contoh: Jakarta" },
            { name: "berat_badan", label: "Berat Badan (kg)", type: "number", required: true, min: 30, max: 150, placeholder: "Contoh: 55" },
            { name: "tinggi_badan", label: "Tinggi Badan (cm)", type: "number", required: true, min: 100, max: 250, placeholder: "Contoh: 165" }
        ],
        memberFiles: []
    },
    "basket-putri-sma": {
        label: "Basket Putri (SMA)",
        status: "opened",
        minPlayers: 5,
        maxPlayers: 12,
        teamFields: [
            { name: "coach_name", label: "Nama Pelatih", type: "text", required: true },
            { name: "coach_email", label: "Email Pelatih", type: "email", required: true },
            { name: "coach_phone", label: "Nomor Telepon Pelatih (WA)", type: "tel", required: true }
        ],
        memberFields: [
            { name: "tempat_lahir", label: "Tempat Lahir", type: "text", required: true, placeholder: "Contoh: Jakarta" },
            { name: "berat_badan", label: "Berat Badan (kg)", type: "number", required: true, min: 30, max: 150, placeholder: "Contoh: 55" },
            { name: "tinggi_badan", label: "Tinggi Badan (cm)", type: "number", required: true, min: 100, max: 250, placeholder: "Contoh: 165" }
        ],
        memberFiles: []
    },

    // === VOLI PUTRA ===
    "voli-putra-smp": { label: "Voli Putra (SMP)", status: "opened", minPlayers: 6, maxPlayers: 12, teamFields: [], memberFields: [], memberFiles: [] },
    "voli-putra-sma": { label: "Voli Putra (SMA)", status: "opened", minPlayers: 6, maxPlayers: 12, teamFields: [], memberFields: [], memberFiles: [] },

    // === VOLI PUTRI ===
    "voli-putri-smp": { label: "Voli Putri (SMP)", status: "opened", minPlayers: 6, maxPlayers: 12, teamFields: [], memberFields: [], memberFiles: [] },
    "voli-putri-sma": { label: "Voli Putri (SMA)", status: "opened", minPlayers: 6, maxPlayers: 12, teamFields: [], memberFields: [], memberFiles: [] },

    // === BULU TANGKIS ===
    "bulu-tangkis-smp": { label: "Bulu Tangkis (SMP)", status: "opened", minPlayers: 5, maxPlayers: 8, teamFields: [], memberFields: [], memberFiles: [] },
    "bulu-tangkis-sma": { label: "Bulu Tangkis (SMA)", status: "opened", minPlayers: 5, maxPlayers: 8, teamFields: [], memberFields: [], memberFiles: [] },

    // === PENCAK SILAT ===
    "pencak-silat-smp": {
        label: "Pencak Silat (SMP)",
        status: "opened",
        minPlayers: 1,
        maxPlayers: 2,
        teamFields: [
            { name: "coach_name", label: "Nama Pelatih", type: "text", required: true }
        ],
        memberFields: [
            { name: "tempat_lahir", label: "Tempat Lahir", type: "text", required: true },
            { name: "berat_badan", label: "Berat Badan (kg)", type: "number", required: true },
            { name: "tinggi_badan", label: "Tinggi Badan (cm)", type: "number", required: true },
            {
                name: "subkategori",
                label: "Kategori Tanding/Seni",
                type: "select",
                required: true,
                options: ["H:DIATAS 51KG-54KG", "I:DIATAS 54KG-57KG", "Open Class:DIATAS 78KG-84KG"]
            }
        ],
        memberFiles: [
            { name: "akte", label: "Upload Akte Kelahiran (PDF)", required: true },
            { name: "rapor", label: "Upload Fotocopy Rapor - Identitas (PDF)", required: true }
        ]
    },
    "pencak-silat-sma": {
        label: "Pencak Silat (SMA)",
        status: "opened",
        minPlayers: 1,
        maxPlayers: 2,
        teamFields: [
            { name: "coach_name", label: "Nama Pelatih", type: "text", required: true }
        ],
        memberFields: [
            { name: "tempat_lahir", label: "Tempat Lahir", type: "text", required: true },
            { name: "berat_badan", label: "Berat Badan (kg)", type: "number", required: true },
            { name: "tinggi_badan", label: "Tinggi Badan (cm)", type: "number", required: true },
            {
                name: "subkategori",
                label: "Kategori Tanding/Seni",
                type: "select",
                required: true,
                options: ["A: 51KG-55.5KG", "B: DIATAS 55.6KG-59.5KG", "C: DIATAS 59.6KG-63.5KG", "D: DIATAS 63.6KG-67.5KG", "E: DIATAS 67.6KG-74.5KG", "Bebas: 75+KG"]
            }
        ],
        memberFiles: [
            { name: "akte", label: "Upload Akte Kelahiran (PDF)", required: true },
            { name: "rapor", label: "Upload Fotocopy Rapor - Identitas (PDF)", required: true }
        ]
    },

    // === TENIS MEJA ===
    "tenis-meja-smp": {
        label: "Tenis Meja (SMP)",
        status: "opened",
        minPlayers: 3,
        maxPlayers: 8,
        teamFields: [{ name: "coach_name", label: "Nama Pelatih", type: "text", required: true }],
        memberFields: [],
        memberFiles: []
    },
    "tenis-meja-sma": {
        status: "opened",
        label: "Tenis Meja (SMA)",
        minPlayers: 3,
        maxPlayers: 5,
        teamFields: [{ name: "coach_name", label: "Nama Pelatih", type: "text", required: true }],
        memberFields: [],
        memberFiles: []
    },

    // === MODERN DANCE ===
    "modern-dance-smp": { label: "Modern Dance (SMP)",status: "opened", minPlayers: 5, maxPlayers: 15, teamFields: [], memberFields: [], memberFiles: [] },
    "modern-dance-sma": { label: "Modern Dance (SMA)", status: "opened", minPlayers: 5, maxPlayers: 15, teamFields: [], memberFields: [], memberFiles: [] },

    // === BAND ===
    "band-smp": { label: "Band (SMP)", status: "opened", minPlayers: 3, maxPlayers: 8, teamFields: [], memberFields: [], memberFiles: [] },
    "band-sma": { label: "Band (SMA)", status: "opened", minPlayers: 3, maxPlayers: 8, teamFields: [], memberFields: [], memberFiles: [] },

    // === CATUR ===
    "catur-smp": {
        label: "Catur (SMP)",
        status: "opened",
        minPlayers: 1,
        maxPlayers: 2,
        teamFields: [],
        memberFields: [],
        memberFiles: [
            { name: "akte", label: "Upload Akte Kelahiran (PDF)", required: true },
            { name: "rapor", label: "Upload Fotocopy Rapor - Identitas (PDF)", required: true }
        ]
    },
    "catur-sma": {
        label: "Catur (SMA)",
        status: "opened",
        minPlayers: 1,
        maxPlayers: 2,
        teamFields: [],
        memberFields: [],
        memberFiles: [
            { name: "akte", label: "Upload Akte Kelahiran (PDF)", required: true },
            { name: "rapor", label: "Upload Fotocopy Rapor - Identitas (PDF)", required: true }
        ]
    },

    // === FOTOGRAFI ===
    "fotografi-smp": { label: "Fotografi (SMP)", status: "opened", minPlayers: 1, maxPlayers: 1, teamFields: [], memberFields: [], memberFiles: [] },
    "fotografi-sma": { label: "Fotografi (SMA)", status: "opened", minPlayers: 1, maxPlayers: 1, teamFields: [], memberFields: [], memberFiles: [] },

    // === TAEKWONDO ===
    "taekwondo-sma": {
        label: "Taekwondo (SMA)",
        status: "opened",
        minPlayers: 1,
        maxPlayers: 6,
        teamFields: [{ name: "coach_name", label: "Nama Pelatih", type: "text", required: true }],
        memberFields: [
            {
                name: "subkategori",
                label: "Subkategori (Weight Class)",
                type: "select",
                required: true,
                options: ["Cowo(kyorugi) Under 55", "Cowo(kyorugi) Under 59", "Cowo(kyorugi) Under 63", "Cowo(kyorugi) Under 78", "Cowo(kyorugi) Above 78"]
            }
        ],
        memberFiles: [
            { name: "akte", label: "Upload Akte Kelahiran (PDF)", required: true },
            { name: "sabuk", label: "Upload Sertifikat Sabuk (PDF)", required: true }
        ]
    },

    // === ENGLISH DEBATE ===
    "english-debate-smp": { label: "English Debate (SMP)", status: "closed", minPlayers: 3, maxPlayers: 3, teamFields: [], memberFields: [], memberFiles: [] },
    "english-debate-sma": { label: "English Debate (SMA)", status: "closed", minPlayers: 3, maxPlayers: 3, teamFields: [], memberFields: [], memberFiles: [] },

    // === SHORT MOVIE ===
    "short-movie-sma": {
        label: "Short Movie (SMA)",
        status: "opened",
        minPlayers: 1,
        maxPlayers: 100,
        teamFields: [],
        memberFields: [{ name: "role", label: "Role / Peran Anggota", type: "text", required: true, placeholder: "Contoh: Sutradara, Editor" }],
        memberFiles: []
    },

    // === WALL CLIMBING ===
    "wall-climbing-sma": { label: "Wall Climbing (SMA)", status: "opened", minPlayers: 1, maxPlayers: 6, teamFields: [], memberFields: [], memberFiles: [] },

    // === CUBING ===
    "cubing-smp": {
        label: "Cubing (SMP)",
        status: "opened",
        minPlayers: 1,
        maxPlayers: 1,
        teamFields: [],
        memberFields: [
            {
                name: "subkategori",
                label: "Kategori Rubik (Bisa Pilih Banyak)",
                type: "checkbox-group",
                required: true,
                options: ["2x2", "3x3", "4x4", "3x3 OH", "Pyraminx", "Skewb", "Clock"]
            }
        ],
        memberFiles: []
    },
    "cubing-sma": {
        label: "Cubing (SMA)",
        minPlayers: 1,
        maxPlayers: 1,
        teamFields: [],
        memberFields: [
            {
                name: "subkategori",
                label: "Kategori Rubik (Bisa Pilih Banyak)",
                type: "checkbox-group",
                required: true,
                options: ["2x2", "3x3", "4x4", "3x3 OH", "Pyraminx", "Skewb", "Clock"]
            }
        ],
        memberFiles: []
    },

    // === DEBAT ===
    "debat-smp": { label: "Debat (SMP)", minPlayers: 3, maxPlayers: 3, teamFields: [], memberFields: [], memberFiles: [] },
    "debat-sma": { label: "Debat (SMA)", minPlayers: 3, maxPlayers: 3, teamFields: [], memberFields: [], memberFiles: [] },

    // === CERDAS CERMAT ===
    "cerdas-cermat-smp": { label: "Cerdas Cermat (SMP)", minPlayers: 2, maxPlayers: 3, teamFields: [], memberFields: [], memberFiles: [] },

    // === PADUAN SUARA ===
    "paduan-suara-smp": { label: "Paduan Suara (SMP)", minPlayers: 16, maxPlayers: 23, teamFields: [], memberFields: [], memberFiles: [] },

    // === DIGITAL PAINTING ===
    "digital-painting-smp": {
        label: "Digital Painting (SMP)",
        minPlayers: 1,
        maxPlayers: 1,
        teamFields: [],
        memberFields: [],
        memberFiles: [{ name: "akte", label: "Upload Akte Kelahiran (PDF)", required: true }]
    },

    // === KARATE KYOKUSHIN ===
    "karate-kyokushin-sma": {
        label: "Karate Kyokushin (SMA)",
        status: "opened",
        minPlayers: 1,
        maxPlayers: 5,
        teamFields: [],
        memberFields: [
            { name: "tempat_lahir", label: "Tempat Lahir", type: "text", required: true },
            { name: "berat_badan", label: "Berat Badan (kg)", type: "number", required: true },
            { name: "tinggi_badan", label: "Tinggi Badan (cm)", type: "number", required: true },
            {
                name: "subkategori",
                label: "Kategori Tanding/Kata",
                type: "select",
                required: true,
                options: [
                    "KUMITE - Putra sampai dengan kyu 6 (14-18 tahun) - <= 65 kg",
                    "KUMITE - Putra sampai dengan kyu 6 (14-18 tahun) - 65.1 - 75 kg",
                    "KUMITE - Putra sampai dengan kyu 6 (14-18 tahun) - 75.1 - 85 kg",
                    "KUMITE - Putri sampai dengan kyu 6 (14-18 tahun) - <= 65 kg",
                    "KUMITE - Putri sampai dengan kyu 6 (14-18 tahun) - 65.1 - 75 kg",
                    "KUMITE - Putri sampai dengan kyu 6 (14-18 tahun) - 75.1 - 85 kg",
                    "KUMITE - Putra kyu 5 keatas (14-18 tahun) - <= 65 kg",
                    "KUMITE - Putra kyu 5 keatas (14-18 tahun) - 65.1 - 75 kg",
                    "KUMITE - Putra kyu 5 keatas (14-18 tahun) - 75.1 - 85 kg",
                    "KUMITE - Putri kyu 5 keatas (14-18 tahun) - <= 65 kg",
                    "KUMITE - Putri kyu 5 keatas (14-18 tahun) - 65.1 - 75 kg",
                    "KUMITE - Putri kyu 5 keatas (14-18 tahun) - 75.1 - 85 kg",
                    "KATA - Putra & Putri - Kyu 10 (Usia 14-18 tahun)",
                    "KATA - Putra & Putri - Kyu 9 – Kyu 6 (Usia 14-18 tahun)",
                    "KATA - Putra & Putri - Kyu ≥ 5 (Usia 14-18 tahun)"
                ]
            }
        ],
        memberFiles: [{ name: "sabuk", label: "Upload Sertifikat Sabuk (PDF)", required: true }]
    }
};