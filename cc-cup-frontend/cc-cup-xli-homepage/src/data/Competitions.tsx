export type Jenjang = "SMP" | "SMA"

export interface Competition {
    id: string
    title: string
    description: string
    sopUrl: string
    jenjang: Jenjang[]
    status: "opened" | "closed"
    icon?: string
}

export const competitions: Competition[] = [
    // === MINI SOCCER ===
    {
        id: "mini-soccer",
        title: "Mini Soccer",
        description: "Pertandingan futsal antar sekolah. Tunjukkan kerja sama tim dan strategi terbaikmu di lapangan!",
        sopUrl: "./sop/mini-soccer.pdf",
        jenjang: ["SMP", "SMA"],
        status: "opened",
        icon: "/icons/soccer-kick.svg",
    },

    // === BASKET PUTRA ===
    {
        id: "basket-putra",
        title: "Basket Putra",
        description: "Kompetisi basket putra. Asah skill dribble, shooting, dan teamwork untuk menjadi juara!",
        sopUrl: "./sop/basket-putra.pdf",
        jenjang: ["SMP", "SMA"],
        status: "opened",
        icon: "/icons/basketball-ball.svg",
    },

    // === BASKET PUTRI ===
    {
        id: "basket-putri",
        title: "Basket Putri",
        description: "Kompetisi basket putri. Tunjukkan bahwa putri juga bisa mendominasi lapangan!",
        sopUrl: "./sop/basket-putri.pdf",
        jenjang: ["SMP", "SMA"],
        status: "opened",
        icon: "/icons/basketball-ball.svg",
    },

    // === VOLI PUTRA ===
    {
        id: "voli-putra",
        title: "Voli Putra",
        description: "Pertandingan voli putra. Smash, block, dan spike untuk membawa timmu meraih kemenangan!",
        sopUrl: "./sop/voli-putra.pdf",
        jenjang: ["SMP", "SMA"],
        status: "opened",
        icon: "/icons/volleyball-ball.svg",
    },

    // === VOLI PUTRI ===
    {
        id: "voli-putri",
        title: "Voli Putri",
        description: "Pertandingan voli putri. Tunjukkan kekuatan dan ketepatan di setiap serangan!",
        sopUrl: "./sop/voli-putri.pdf",
        jenjang: ["SMP", "SMA"],
        status: "opened",
        icon: "/icons/volleyball-ball.svg",
    },

    // === BULU TANGKIS ===
    {
        id: "bulu-tangkis",
        title: "Bulu Tangkis",
        description: "Kompetisi bulu tangkis. Uji kecepatan reflex dan teknik pukulan terbaikmu!",
        sopUrl: "./sop/bulu-tangkis.pdf",
        jenjang: ["SMP", "SMA"],
        status: "opened",
        icon: "/icons/shuttlecock.svg",
    },

    // === PENCAK SILAT ===
    {
        id: "pencak-silat",
        title: "Pencak Silat",
        description: "Pertandingan pencak silat. Tunjukkan jurus dan kemampuan bela diri terbaikmu!",
        sopUrl: "./sop/pencak-silat.pdf",
        jenjang: ["SMP", "SMA"],
        status: "opened",
        icon: "/icons/black-belt.svg",
    },

    // === TENIS MEJA ===
    {
        id: "tenis-meja",
        title: "Tenis Meja",
        description: "Kompetisi tenis meja. Asah kecepatan tangan dan strategi spin-mu untuk menang!",
        sopUrl: "./sop/tenis-meja.pdf",
        jenjang: ["SMP", "SMA"],
        status: "opened",
        icon: "/icons/ping-pong-bat.svg",
    },
    
    // === MODERN DANCE ===
    {
        id: "modern-dance",
        title: "Modern Dance",
        description: "Kompetisi modern dance. Ekspresikan kreativitas dan energi melalui tarian!",
        sopUrl: "./sop/modern-dance.pdf",
        jenjang: ["SMP", "SMA"],
        status: "opened",
        icon: "/icons/run.svg",
    },

    // === BAND ===
    {
        id: "band",
        title: "Band",
        description: "Kompetisi band. Tunjukkan bakat musik dan penampilan terbaik di atas panggung!",
        sopUrl: "./sop/band.pdf",
        jenjang: ["SMP", "SMA"],
        status: "opened",
        icon: "/icons/guitar.svg",
    },

    // === CATUR ===
    {
        id: "catur",
        title: "Catur",
        description: "Turnamen catur. Uji kemampuan strategi dan ketajaman pikiran dalam setiap langkah!",
        sopUrl: "./sop/catur.pdf",
        jenjang: ["SMP", "SMA"],
        status: "opened",
        icon: "/icons/chess-king.svg",
    },

    // === FOTOGRAFI ===
    {
        id: "fotografi",
        title: "Fotografi",
        description: "Lomba fotografi. Abadikan momen terbaik lewat lensa kameramu!",
        sopUrl: "./sop/fotografi.pdf",
        jenjang: ["SMP", "SMA"],
        status: "opened",
        icon: "/icons/photo-camera.svg",
    },

    // === ENGLISH DEBATE ===
    {
        id: "english-debate",
        title: "English Debate",
        description: "Kompetisi debat bahasa Inggris. Asah kemampuan argumentasi dan public speaking-mu!",
        sopUrl: "./sop/english-debate.pdf",
        jenjang: ["SMP", "SMA"],
        status: "closed",
        icon: "/icons/thor-hammer.svg",
    },

    // === CUBING ===
    {
        id: "cubing",
        title: "Cubing",
        description: "Kompetisi Rubik's Cube. Pecahkan puzzle secepat mungkin dan pecahkan rekor!",
        sopUrl: "./sop/cubing.pdf",
        jenjang: ["SMP", "SMA"],
        status: "opened",
        icon: "/icons/stone-block.svg",
    },

    // === DEBAT ===
    {
        id: "debat",
        title: "Debat",
        description: "Kompetisi debat. Sampaikan argumen terbaikmu dan jadi pembicara yang unggul!",
        sopUrl: "./sop/debat.pdf",
        jenjang: ["SMP", "SMA"],
        status: "opened",
        icon: "/icons/thor-hammer.svg",
    },

    // === TAEKWONDO (SMA only) ===
    {
        id: "taekwondo",
        title: "Taekwondo",
        description: "Pertandingan taekwondo. Tunjukkan teknik tendangan dan pertahanan terbaikmu!",
        sopUrl: "./sop/taekwondo.pdf",
        jenjang: ["SMA"],
        status: "opened",
        icon: "/icons/high-kick.svg",
    },
    
    // === SHORT MOVIE (SMA only) ===
    {
        id: "short-movie",
        title: "Short Movie",
        description: "Lomba film pendek. Tuangkan ide ceritamu dalam karya sinematik yang memukau!",
        sopUrl: "./sop/short-movie.pdf",
        jenjang: ["SMA"],
        status: "opened",
        icon: "/icons/film-projector.svg",
    },

    // === WALL CLIMBING (SMA only) ===
    {
        id: "wall-climbing",
        title: "Wall Climbing",
        description: "Kompetisi panjat dinding. Uji kekuatan fisik dan mental untuk mencapai puncak!",
        sopUrl: "./sop/wall-climbing.pdf",
        jenjang: ["SMA"],
        status: "opened",
        icon: "/icons/mountain-climbing.svg",
    },

    // === KARATE KYOKUSHIN (SMA only) ===
    {
        id: "karate-kyokushin",
        title: "Karate Kyokushin",
        description: "Pertandingan karate kyokushin. Buktikan kekuatan dan disiplinmu di atas tatami!",
        sopUrl: "./sop/karate-kyokushin.pdf",
        jenjang: ["SMA"],
        status: "opened",
        icon: "/icons/black-belt.svg",
    },

    // === CERDAS CERMAT (SMP only) ===
    {
        id: "cerdas-cermat",
        title: "Cerdas Cermat",
        description: "Lomba cerdas cermat. Uji pengetahuan umum dan kecepatan menjawab bersama tim!",
        sopUrl: "./sop/cerdas-cermat.pdf",
        jenjang: ["SMP"],
        status: "opened",
        icon: "/icons/brain.svg",
    },

    // === PADUAN SUARA (SMP only) ===
    {
        id: "paduan-suara",
        title: "Paduan Suara",
        description: "Kompetisi paduan suara. Tampilkan harmoni dan kekompakan suara terbaik!",
        sopUrl: "./sop/paduan-suara.pdf",
        jenjang: ["SMP"],
        status: "opened",
        icon: "/icons/sing.svg",
    },

    // === DIGITAL PAINTING (SMP only) ===
    {
        id: "digital-painting",
        title: "Digital Painting",
        description: "Lomba digital painting. Tuangkan imajinasimu dalam karya seni digital yang memukau!",
        sopUrl: "./sop/digital-painting.pdf",
        jenjang: ["SMP"],
        status: "opened",
        icon: "/icons/palette.svg",
    },
]
