"""
Per-competition registration rules, sourced from last year's official event metadata.
Single source of truth for roster size, gender restriction, subkategori options,
quota, open/closed status, and dynamic team/member field requirements.
"""

COMPETITIONS = {
    "mini-soccer": {
        "name": "Mini Soccer",
        "short-id": "MS",
        "icon-filename": "",
        "jenjang": ["SMP", "SMA"],
        "sop": "https://docs.google.com/document/d/1zMu1v5MVLLf0MxMExzgyru4aJK_i3zroUDuLhInVRhI/pub?embedded=true",
        "SMP": {
            "gender": ["M"],
            "players": [7,14],
            "subkategori": [],
            "kuota": 12,
            "extra": {
                "tim": {},
                "anggota": {}
                }
        },
        "SMA": {
            "gender": ["M"],
            "players": [7, 14],
            "subkategori": [],
            "kuota": 12,
            "extra": {
                "tim": {},
                "anggota": {}
                }
        },
    },
    "basket-putra": {
        "name": "Basket Putra",
        "short-id": "BA",
        "icon-filename": "",
        "jenjang": ["SMP", "SMA"],
        "sop": "https://docs.google.com/document/d/1-KLWRMp-53UI4s5QA8BmBtfPONorHzUgg5_7xb5XSR0/pub?embedded=true",
        "SMP": {
            "gender": ["M"],
            "players": [5,12],
            "subkategori": [],
            "kuota": "",
            "extra": {
                "tim": {"coach_name": "String", "coach_email" : "String", "coach_phone": "String"},
                "anggota": {"tempat_lahir": "String", "Berat": "String", "Tinggi": "String"}

                }
        },
        "SMA": {
            "gender": ["M"],
            "players": [5,12],
            "subkategori": [],
            "kuota": 12,
            "extra": {
                "tim": {"coach_name": "String", "coach_email" : "String", "coach_phone": "String"},
                "anggota": {"tempat_lahir": "String", "Berat": "String", "Tinggi": "String"}

                }
        },
    },
    "basket-putri": {
        "name": "Basket Putri",
        "short-id": "BI",
        "icon-filename": "",
        "jenjang": ["SMP", "SMA"],
        "sop": "https://docs.google.com/document/d/1-KLWRMp-53UI4s5QA8BmBtfPONorHzUgg5_7xb5XSR0/pub?embedded=true",
        "SMP": {
            "gender": ["F"],
            "players": [5,12],
            "subkategori": [],
            "kuota": "",
            "extra": {
                "tim": {"coach_name": "String", "coach_email" : "String", "coach_phone": "String"},
                "anggota": {"tempat_lahir": "String", "Berat": "String", "Tinggi": "String"}
                }
        },
        "SMA": {
            "gender": ["F"],
            "players": [5,12],
            "subkategori": [],
            "kuota": "",
            "extra": {
                "tim": {"coach_name": "String", "coach_email" : "String", "coach_phone": "String"},
                "anggota": {"tempat_lahir": "String", "Berat": "String", "Tinggi": "String"}
                }
        },
    },
    "voli-putra": {
        "name": "Voli Putra",
        "short-id": "VA",
        "icon-filename": "",
        "jenjang": ["SMP", "SMA"],
        "sop": "https://docs.google.com/document/d/1JgrnsoSFBfww5ejXT3hQ8oLbWkPqahdy8XybrKTSOoM/pub?embedded=true",
        "SMP": {
            "gender": ["M"],
            "players": [6, 12],
            "subkategori": [],
            "kuota": 12,
            "extra": {
                "tim": {},
                "anggota": {}
                }
        },
        "SMA": {
            "gender": ["M"],
            "players": [6, 12],
            "subkategori": [],
            "kuota": 12,
            "extra": {
                "tim": {},
                "anggota": {}
                }
        }
    },
    "voli-putri": {
        "name": "Voli Putri",
        "short-id": "VI",
        "icon-filename": "",
        "jenjang": ["SMP", "SMA"],
        "sop": "https://docs.google.com/document/d/1JgrnsoSFBfww5ejXT3hQ8oLbWkPqahdy8XybrKTSOoM/pub?embedded=true",
        "SMP": {
            "gender": ["F"],
            "players": [6, 12],
            "subkategori": [],
            "kuota": 8,
            "extra": {
                "tim": {},
                "anggota": {}
                }
        },
        "SMA": {
            "gender": ["F"],
            "players": [6, 12],
            "subkategori": [],
            "kuota": 10,
            "extra": {
                "tim": {},
                "anggota": {}
                }
        }
    },
    "bulu-tangkis": {
        "name": "Bulu Tangkis",
        "short-id": "BT",
        "icon-filename": "",
        "jenjang": ["SMP", "SMA"],
        "sop": "https://docs.google.com/document/d/1YV7maBmBjsc3qdrI1ANj0RXZT29rdwumbCa7h5bVaEc/pub?embedded=true",
        "SMP": {
            "gender": ["M"],
            "players": [5,8],
            "subkategori": [],
            "kuota": 16,
            "extra": {
                "tim": {},
                "anggota": {}
                }
        },
        "SMA": {
            "gender": ["M"],
            "players": [5,8],
            "subkategori": [],
            "kuota": 16,
            "extra": {
                "tim": {},
                "anggota": {}
                }
        }
    },
    "pencak-silat": {
        "name": "Pencak Silat",
        "short-id": "PS",
        "icon-filename": "",
        "jenjang": ["SMP", "SMA"],
        "sop": "https://docs.google.com/document/d/11fcJ8gMbmvUs48L57PURl07l6hw1pgGu/pub?embedded=true",
        "SMP": {
            "gender": ["M"],
            "players": [1, 2],
            "subkategori": [
                "H:DIATAS 51KG-54KG",
                "I:DIATAS 54KG-57KG",
                "Open Class:DIATAS 78KG-84KG"
            ],
            "kuota": 24,
            "extra": {
                "tim": {
                    "coach_name": "String",
                    "coach_email": "String",
                    "coach_phone": "String"
                },
                "anggota": {
                    "tempat_lahir": "String",
                    "berat": "Number",
                    "tinggi": "Number"
                }
            }
        },
        "SMA": {
            "gender": ["M"],
            "players": [1, 2],
            "subkategori": [
                "A: 51KG-55.5KG",
                "B: DIATAS 55.6KG-59.5KG",
                "C: DIATAS 59.6KG-63.5KG",
                "D: DIATAS 63.6KG-67.5KG",
                "E: DIATAS 67.6KG-74.5KG",
                "Bebas: 75+KG"
            ],
            "kuota": 96,
            "extra": {
                "tim": {
                    "coach_name": "String",
                    "coach_email": "String",
                    "coach_phone": "String"
                },
                "anggota": {
                    "tempat_lahir": "String",
                    "berat": "Number",
                    "tinggi": "Number"
                }
            }
        }
    },
    "tenis-meja": {
        "name": "Tenis Meja",
        "short-id": "TM",
        "icon-filename": "",
        "jenjang": ["SMP", "SMA"],
        "sop": "https://docs.google.com/document/d/1ZU0YI3EQMtC_tDgKnJvVQRZIaNjJOSko/pub?embedded=true",
        "SMP": {
            "gender": ["M"],
            "players": [3, 8],
            "subkategori": [],
            "kuota": 24,
            "extra": {
                "tim": {
                    "coach_name": "String",
                    "coach_email": "String",
                    "coach_phone": "String"
                        },
                "anggota": {},
                }
        },
        "SMA": {
            "gender": ["M"],
            "players": [3, 5],
            "subkategori": [],
            "kuota": 12,
            "extra": {
                "tim": {
                    "coach_name": "String",
                    "coach_email": "String",
                    "coach_phone": "String"
                        },
                "anggota": {},
                }
        }
    },
    "modern-dance": {
        "name": "Modern Dance",
        "short-id": "MD",
        "icon-filename": "",
        "jenjang": ["SMP", "SMA"],
        "sop": "https://docs.google.com/document/d/1E6isZAmhTHBMA7JXLzyrYw_jOrucYXbE/pub?embedded=true",
        "SMP": {
            "gender": ["U"],
            "players": [5,15],
            "subkategori": [],
            "kuota": 10,
            "extra": {
                "tim": {},
                "anggota": {}
                }
        },
        "SMA": {
            "gender": ["U"],
            "players": [5,15],
            "subkategori": [],
            "kuota": 10,
            "extra": {
                "tim": {},
                "anggota": {}
                }
        },
    },
    "band": {
        "name": "Band",
        "short-id": "BN",
        "icon-filename": "",
        "jenjang": ["SMP", "SMA"],
        "sop": "https://docs.google.com/document/d/1TcSVjOR_so544b9Wr7BvR4d6qi9Er9DC/pub?embedded=true",
        "SMP": {
            "gender": ["U"],
            "players": [3,8],
            "subkategori": [],
            "kuota": "120",
            "extra": {
                "tim": {},
                "anggota": {}
                }
        },
        "SMA": {
            "gender": ["U"],
            "players": [3,8],
            "subkategori": [],
            "kuota": "160",
            "extra": {
                "tim": {},
                "anggota": {}
                }
        },
    },
    "catur": {
        "name": "Catur",
        "short-id": "CA",
        "icon-filename": "",
        "jenjang": ["SMP", "SMA"],
        "sop": "https://docs.google.com/document/d/1-eqEz4OzGUNMrSgV4UefQX_Kv_MlxpGHBrv8GrM7WrU/pub?embedded=true",
        "SMP": {
            "gender": ["U"],
            "players": [1, 2],
            "subkategori": [],
            "kuota": 32,
            "extra": {
                "tim": {},
                "anggota": {
                    "akte_kelahiran": "File",
                    "fotocopy_rapor": "File"
                }
                }
        },
        "SMA": {
            "gender": ["U"],
            "players": [1, 2],
            "subkategori": [],
            "kuota": "",
            "extra": {
                "tim": {},
                "anggota": {
                    "akte_kelahiran": "File",
                    "fotocopy_rapor": "File"
                }
                }
        },
    },
    "fotografi": {
        "name": "Fotografi",
        "short-id": "FO",
        "icon-filename": "",
        "jenjang": ["SMP", "SMA"],
        "sop": "https://docs.google.com/document/d/1FrrbYm2ObhmcnnurvCUFfcpGYOe_VMpalMk5rikXSyQ/pub?embedded=true",
        "SMP": {
            "gender": ["U"],
            "players": [1,1],
            "subkategori": [],
            "kuota": "",
            "extra": {
                "tim": {},
                "anggota": {}
                }
        },
        "SMA": {
            "gender": ["U"],
            "players": [1,1],
            "subkategori": [],
            "kuota": "",
            "extra": {
                "tim": {},
                "anggota": {}
                }
        },
    },
    "taekwondo": {
        "name": "Taekwondo",
        "short-id": "TA",
        "icon-filename": "",
        "jenjang": ["SMA"],
        "sop": "https://docs.google.com/document/d/1FzPA6etvuUUVPbppSC6EveaWN84puXBACRhW_8k7lys/pub?embedded=true",
        "SMA": {
            "gender": ["M"],
            "players": [1, 6],
            "subkategori": [
                "Cowo(kyorugi) Under 55",
                "Cowo(kyorugi) Under 59",
                "Cowo(kyorugi) Under 63",
                "Cowo(kyorugi) Under 78",
                "Cowo(kyorugi) Above 78"
            ],
            "kuota": 96,
            "extra": {
                "tim": {"coach_name": "String",
                    "coach_email": "String",
                    "coach_phone": "String"},
                "anggota": {"akte_kelahiran": "File", "sertifikat_sabuk": "File"}
                }
        }
    },
    "english-debate": {
        "name": "English Debate",
        "short-id": "ED",
        "icon-filename": "",
        "jenjang": ["SMP", "SMA"],
        "sop": "https://docs.google.com/document/d/1osmua7_JQOjP36I7k54r7FO8cIz0DCiVAizlqv_o3Dw/pub?embedded=true",
        "SMP": {
            "gender": ["U"],
            "players": [3, 3],
            "subkategori": [],
            "kuota": 16,
            "extra": {
                "tim": {},
                "anggota": {}
                }
        },
        "SMA": {
            "gender": ["U"],
            "players": [3, 3],
            "subkategori": [],
            "kuota": 16,
            "extra": {
                "tim": {},
                "anggota": {}
                }
        }
    },
    "short-movie": {
        "name": "Short Movie",
        "short-id": "SM",
        "icon-filename": "",
        "jenjang": ["SMA"],
        "sop": "https://docs.google.com/document/d/1RSu1qa3vFrvyh8jHI57grVySxnz59CsHvGR2fF_9s5M/pub?embedded=true",
        "SMA": {
            "gender": ["U"],
            "players": [1,100],
            "subkategori": [],
            "kuota": 16,
            "extra": {
                "tim": {},
                "anggota": {
                    "Role": "String"
                }
                }
        },
    },
    "wall-climbing": {
        "name": "Wall Climbing",
        "short-id": "WC",
        "icon-filename": "",
        "jenjang": ["SMA"],
        "sop": "https://docs.google.com/document/d/1Hn32hW2i3SY9Cu0Cm9yFoNgoIDJfMeEH/pub?embedded=true",
        "SMA": {
            "gender": ["U"],
            "players": [1,6],
            "subkategori": [],
            "kuota": 60,
            "extra": {
                "tim": {},
                "anggota": {
                }
                }
        },
    },
    "cubing": {
        "name": "Cubing",
        "short-id": "CU",
        "icon-filename": "",
        "jenjang": ["SMP", "SMA"],
        "sop": "https://docs.google.com/document/d/19YkVo7_-GJY1PJWfmf1T1b4iBjoY_fm2/pub?embedded=true",
        "SMP": {
            "gender": ["U"],
            "players": [1, 1],
            "subkategori": [],
            "kuota": 100,
            "extra": {
                "tim": {
                    "Cube": {"multiple": ['2x2', '3x3', '4x4', '3x3 one handed', 'Pyraminx', 'Skewb', 'clock']}
                },
                "anggota": {}
                }
        },
        "SMA": {
            "gender": ["U"],
            "players": [1,1],
            "subkategori": [],
            "kuota": 100,
            "extra": {
                "tim": {
                    "Cube": {"multiple": ['2x2', '3x3', '4x4', '3x3 one handed', 'Pyraminx', 'Skewb', 'clock']}
                },
                "anggota": {}
                }
        },
    },
    "debat": {
        "name": "Debat",
        "short-id": "DE",
        "icon-filename": "",
        "jenjang": ["SMP", "SMA"],
        "sop": "https://docs.google.com/document/d/1NFyFNC4Os7PI7i5UGYd_Z5HqIM9o0pY3chUb-h8A_rc/pub?embedded=true",
        "SMP": {
            "gender": ["U"],
            "players": [3, 3],
            "subkategori": [],
            "kuota": 16,
            "extra": {
                "tim": {},
                "anggota": {}
                }
        },
        "SMA": {
            "gender": ["U"],
            "players": [3, 3],
            "subkategori": [],
            "kuota": 16,
            "extra": {
                "tim": {},
                "anggota": {}
                }
        },
    },
    "cerdas-cermat": {
        "name": "Cerdas Cermat",
        "short-id": "CC",
        "icon-filename": "",
        "jenjang": ["SMP"],
        "sop": "https://docs.google.com/document/d/1UfLYnLnjX-RHJpg-VoFKAvNP2O0sggYWbuUfWHymmvI/pub?embedded=true",
        "SMP": {
            "gender": ["U"],
            "players": [2, 3],
            "subkategori": [],
            "kuota": 12,
            "extra": {
                "tim": {},
                "anggota": {}
                }
        }
    },
    "paduan-suara": {
        "name": "Paduan Suara",
        "short-id": "PD",
        "icon-filename": "",
        "jenjang": ["SMP"],
        "sop": "https://docs.google.com/document/d/1vlq0-HdJ3c7KKwW_pOl7N0mGVsylthWJR4aLIQ9aQOY/pub?embedded=true",
        "SMP": {
            "gender": ["U"],
            "players": [16, 23],
            "subkategori": [],
            "kuota": 20,
            "extra": {
                "tim": {},
                "anggota": {
                }
                }
        }
    },
    "digital-painting": {
        "name": "Digital Painting",
        "short-id": "DP",
        "icon-filename": "",
        "jenjang": ["SMP"],
        "sop": "https://docs.google.com/document/d/1SQ5MOD-TWeQz0-ALfr4JGUqpB9zVSrR1/pub?embedded=true",
        "SMP": {
            "gender": ["U"],
            "players": [1, 1],
            "subkategori": [],
            "kuota": 40,
            "extra": {
                "tim": {},
                "anggota": {"akte_kelahiran": "File"}
                }
        }
    },
    "karate-kyokushin": {
        "name": "Karate Kyokushin",
        "short-id": "KK",
        "icon-filename": "",
        "jenjang": ["SMA"],
        "sop": "",
        "SMA": {
            "gender": ["M", "F"],
            "players": [1, 5],
            "subkategori": [
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
            ],
            "kuota": 75,
            "extra": {
                "tim": {},
                "anggota": {
                    "tempat_lahir": "String",
                    "berat": "String",
                    "tinggi": "String",
                    "sertifikat_sabuk": "File"
                }
            }
        }
    }
}

# ─────────────────────────────────────────────────────────────────────────────
# Helpers — everything else in the app should go through these, not COMPETITIONS
# directly, so the dict shape can change without touching serializers/views.
# ─────────────────────────────────────────────────────────────────────────────

GENDER_LABEL_TO_CODE = {
    'Laki-laki': 'M',
    'Perempuan': 'F',
}


def get_rules(competition, jenjang):
    """
    Return the jenjang-specific rules dict for a competition, or None if the
    competition/jenjang combo doesn't exist. Does NOT consider 'closed' status
    — callers that care about closed/quota check separately (kept soft/manual
    per product decision: we don't block registration on these).
    """
    comp = COMPETITIONS.get(competition)
    if not comp or jenjang not in comp.get('jenjang', []):
        return None
    return comp.get(jenjang)


def is_valid_competition_jenjang(competition, jenjang):
    return get_rules(competition, jenjang) is not None


def player_range(competition, jenjang):
    """(min, max) roster size, or None if unknown."""
    rules = get_rules(competition, jenjang)
    if not rules:
        return None
    players = rules.get('players')
    if not players or len(players) != 2:
        return None
    return tuple(players)


def allowed_genders(competition, jenjang):
    """List of allowed gender codes: 'M', 'F', or 'U' (unisex/any)."""
    rules = get_rules(competition, jenjang)
    return rules.get('gender', []) if rules else []


def is_gender_allowed(competition, jenjang, member_gender_label):
    """member_gender_label is the Member.gender value, e.g. 'Laki-laki'."""
    allowed = allowed_genders(competition, jenjang)
    if not allowed or 'U' in allowed:
        return True
    code = GENDER_LABEL_TO_CODE.get(member_gender_label)
    return code in allowed


def allowed_subkategori(competition, jenjang):
    """List of valid subkategori strings for this competition+jenjang, or [] if unrestricted."""
    rules = get_rules(competition, jenjang)
    return rules.get('subkategori', []) if rules else []


def quota(competition, jenjang):
    """Max team count, or None if not set/unlimited."""
    rules = get_rules(competition, jenjang)
    if not rules:
        return None
    q = rules.get('kuota')
    if q in (None, ''):
        return None
    try:
        return int(q)
    except (TypeError, ValueError):
        return None


def is_closed(competition, jenjang):
    rules = get_rules(competition, jenjang)
    return bool(rules) and rules.get('status') == 'closed'


def extra_team_fields(competition, jenjang):
    """dict of {field_name: type_hint} required at the team level (-> OtherInfo)."""
    rules = get_rules(competition, jenjang)
    return rules.get('extra', {}).get('tim', {}) if rules else {}


def extra_member_fields(competition, jenjang):
    """dict of {field_name: type_hint} required per member (-> dynamic_data / MemberFile)."""
    rules = get_rules(competition, jenjang)
    return rules.get('extra', {}).get('anggota', {}) if rules else {}


def competition_choices():
    """[(slug, name), ...] for use in a ChoiceField."""
    return [(slug, data['name']) for slug, data in COMPETITIONS.items()]