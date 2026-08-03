/**
 * @typedef {"SMP" | "SMA"} Jenjang
 * @typedef {"PENDING" | "SUBMITTED" | "REVIEWED" | "ACCEPTED" | "PENDINGTF" | "REJECTED"} RegisStatus
 * * @typedef {Object} UploadedFile
 * @property {number} id
 * @property {string} file_type
 * @property {string | null} url
 * @property {string} uploaded_at
 * * @typedef {Object} Member
 * @property {number} id
 * @property {string} nama
 * @property {string} email
 * @property {string} nomor_telepon
 * @property {string | null} tanggal_lahir
 * @property {"Laki-laki" | "Perempuan" | ""} gender
 * @property {string} kelas
 * @property {string} nisn
 * @property {string} tempat_lahir
 * @property {number | null} berat_badan
 * @property {number | null} tinggi_badan
 * @property {string} role
 * @property {string} subkategori
 * @property {Record<string, any>} dynamicFields
 * @property {boolean} is_representative
 * @property {UploadedFile[]} files
 * @property {string} created_at
 * @property {string} updated_at
 * * @typedef {Object} OtherInfo
 * @property {number} id
 * @property {string} key
 * @property {string} value
 * * @typedef {Object} Team
 * @property {number} id
 * @property {string} nama_tim
 * @property {string} school
 * @property {string} phone
 * @property {string} competition
 * @property {Jenjang} jenjang
 * @property {RegisStatus} regis_status
 * @property {string} bank_name
 * @property {string} account_number
 * @property {string} account_holder
 * @property {string} captain_email
 * @property {{ min: number, max: number }} player_range
 * @property {Member[]} members
 * @property {UploadedFile[]} files
 * @property {OtherInfo[]} other_info
 * @property {string} created_at
 * @property {string} updated_at
 */

/**
 * List of required team files to be uploaded.
 */
export const TEAM_FILE_TYPES = [
  { key: "kartuPelajar", label: "Kartu Pelajar", accept: ".pdf", hint: "PDF" },
  { key: "selfie", label: "Foto Selfie", accept: ".pdf", hint: "PDF" },
  { key: "suratPernyataan", label: "Surat Pernyataan", accept: ".pdf", hint: "PDF" },
  { key: "suratIzin", label: "Surat Izin", accept: ".pdf", hint: "PDF" },
  {
    key: "pembayaran",
    label: "Bukti Pembayaran",
    accept: ".pdf,.png,.jpg,.jpeg",
    hint: "PDF, PNG, atau JPG",
  },
];

/**
 * Registration statuses where modification is frozen/locked.
 */
export const FROZEN_STATUSES = ["SUBMITTED", "ACCEPTED"];

/**
 * Human-readable status labels.
 */
export const STATUS_LABEL = {
  PENDING: "DRAFT",
  SUBMITTED: "MENUNGGU VERIFIKASI",
  REVIEWED: "PERLU KOREKSI",
  ACCEPTED: "DITERIMA",
  PENDINGTF: "MENUNGGU PEMBAYARAN",
  REJECTED: "DITOLAK",
};

/**
 * Helper to check if a registration status is frozen/locked.
 * @param {string} status
 * @returns {boolean}
 */
export function isFrozen(status) {
  return FROZEN_STATUSES.includes(status);
}