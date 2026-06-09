const COMPETITION_METADATA = {
    "basket-putra": {
        label: "Basketball Putra",
        minPlayers: 5,
        maxPlayers: 12,
        // Fields sent to /add_info
        teamFields: [
            { name: "coach_name", label: "Nama Pelatih", type: "text", required: true, placeholder: "Contoh: Coach Wijaya" },
            { name: "coach_email", label: "Email Pelatih", type: "email", required: true, placeholder: "Contoh: pelatih@sekolah.sch.id" },
            { name: "coach_phone", label: "Nomor Telepon Pelatih (WA)", type: "tel", required: true, placeholder: "Contoh: 08123456789" }
        ],
        // Fields captured per member
        memberFields: [
            { name: "birthplace", label: "Tempat Lahir", type: "text", required: true, placeholder: "Contoh: Jakarta" },
            { name: "weight", label: "Berat Badan (kg)", type: "number", required: true, placeholder: "Contoh: 70" },
            { name: "height", label: "Tinggi Badan (cm)", type: "number", required: true, placeholder: "Contoh: 178" }
        ],
        memberFiles: []
    },
    "pencak-silat": {
        label: "Pencak Silat",
        minPlayers: 1, // Single athlete category
        maxPlayers: 1,
        teamFields: [],
        memberFields: [
            { name: "birthplace", label: "Tempat Lahir", type: "text", required: true },
            { name: "weight", label: "Berat Badan (kg)", type: "number", required: true },
            { name: "height", label: "Tinggi Badan (cm)", type: "number", required: true },
            {
                name: "subkategori",
                label: "Kategori Tanding/Seni",
                type: "select",
                required: true,
                options: ["Tanding Kelas A", "Tanding Kelas B", "Seni Tunggal", "Seni Regu"]
            }
        ],
        memberFiles: [
            { name: "akte", label: "Upload Akte Kelahiran (PDF)", required: true },
            { name: "rapor", label: "Upload Fotocopy Rapor - Identitas (PDF)", required: true }
        ]
    },
    "taekwondo": {
        label: "Taekwondo",
        minPlayers: 1,
        maxPlayers: 1,
        teamFields: [
            { name: "coach_name", label: "Nama Pelatih", type: "text", required: true },
            { name: "coach_email", label: "Email Pelatih", type: "email", required: true },
            { name: "coach_phone", label: "Nomor Telepon Pelatih", type: "tel", required: true }
        ],
        memberFields: [
            { name: "subkategori", label: "Subkategori (Weight Class)", type: "text", required: true, placeholder: "Contoh: Under 45kg Putra" }
        ],
        memberFiles: [
            { name: "akte", label: "Upload Akte Kelahiran (PDF)", required: true },
            { name: "sabuk", label: "Upload Sertifikat Sabuk (PDF)", required: true }
        ]
    },
    "cubing": {
        label: "Cubing",
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
    "mini-soccer": {
        label: "Mini Soccer",
        minPlayers: 7,
        maxPlayers: 14,
        teamFields: [],
        memberFields: [], // Base inputs only
        memberFiles: []
    }
    // All other base sports maps with empty array arrays seamlessly...
};