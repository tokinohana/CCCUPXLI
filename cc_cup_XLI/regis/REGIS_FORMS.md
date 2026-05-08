# Registration Forms & Inputs Documentation

This document detail the inputs required for different sports (Cabang Olahraga) in the CCCUP XL registration system.

## 1. Common Registration Data

### Team Captain / Account Info
These fields are collected during the initial signup:
- **Email**: Unique login identifier.
- **Password**: Account security.
- **Team Name**: The display name of the team.
- **School**: The institution representing the team.
- **Phone**: Contact number (WA preferred).
- **Competition**: Selected sport.
- **Jenjang**: SMP or SMA.

### Required Team-Level Files
These files must be uploaded by the captain in the dashboard:
- **Bukti Pembayaran**: PDF of the payment receipt.
- **Kartu Pelajar**: PDF of the captain's student ID (or School Letter).
- **Selfie dengan Kartu Pelajar**: PDF photo for verification.
- **Surat Pernyataan**: PDF signed commitment.
- **Izin Sekolah**: PDF formal permission from school.

---

## 2. Base Member Inputs (Mandatory for All)
Every member added to a team requires these basic fields:
- **Nama**: Full name.
- **Email**: Personal email.
- **Nomor Telepon**: Personal contact.
- **Tanggal Lahir**: Date of birth.
- **Gender**: Laki-laki / Perempuan (Restricted by metadata).
- **Kelas**: Grade level (Number).
- **NISN**: National Student Identification Number.

---

## 3. Sport-Specific Inputs (Cabang Olahraga)

The inputs below are **in addition** to the base member inputs above.

### 🏀 Basketball (Putra & Putri)
- **Team Info**: Nama Pelatih, Email Pelatih, Nomor Telepon Pelatih.
- **Member Info**: Tempat Lahir, Berat Badan (kg), Tinggi Badan (cm).

### 🥋 Pencak Silat
- **Team Info**: Nama Pelatih, Email Pelatih, Nomor Telepon Pelatih.
- **Member Info**: Tempat Lahir, Berat Badan (kg), Tinggi Badan (cm), Subkategori (Weight Class).

### ♟️ Catur (Chess)
- **Member Files**: Akte Kelahiran (PDF), Fotocopy Rapor - Identitas (PDF).

### 🥋 Taekwondo
- **Team Info**: Nama Pelatih, Email Pelatih, Nomor Telepon Pelatih.
- **Member Info**: Akte Kelahiran (File), Sertifikat Sabuk (File), Subkategori (Weight Class).

### 🎬 Short Movie
- **Member Info**: Role (e.g., Director, Actor, Editor).

### 🧊 Cubing
- **Team Info**: Cube Categories (Multiple select: 2x2, 3x3, 4x4, 3x3 OH, Pyraminx, Skewb, Clock).

### 🎨 Digital Painting
- **Member Files**: Akte Kelahiran (PDF).

### 🥋 Karate Kyokushin
- **Member Info**: Tempat Lahir, Berat Badan (kg), Tinggi Badan (cm), Sertifikat Sabuk (File), Subkategori (Weight/Category Class).

### ⚽ Mini Soccer, 🏐 Voli, 🏸 Bulu Tangkis, 💃 Modern Dance, 🎸 Band, 📸 Fotografi, 🗣️ English Debate, 🧗 Wall Climbing, 🎤 Paduan Suara, 🧠 Cerdas Cermat
- **Member Info**: No extra fields (Only Base Member Inputs).

---

## 4. Input Constraints Summary

| Sport | Player Count (Min-Max) | Extra Member Data | Extra Member Files | Team Metadata |
| :--- | :---: | :--- | :--- | :--- |
| **Mini Soccer** | 7 - 14 | - | - | - |
| **Basket** | 5 - 12 | Birthplace, Weight, Height | - | Coach Info |
| **Pencak Silat**| 1 - 2 | Birthplace, Weight, Height | - | Coach Info |
| **Catur** | 1 - 2 | - | Akte, Rapor | - |
| **Taekwondo** | 1 - 6 | - | Akte, Belt Cert | Coach Info |
| **Short Movie** | 1 - 100| Role | - | - |
| **Cubing** | 1 - 1 | - | - | Cube Types |
| **Karate** | 1 - 5 | Birthplace, Weight, Height | Belt Cert | - |
| **Digital Paint**| 1 - 1 | - | Akte | - |
