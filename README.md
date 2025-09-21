# 🚀 Senka Uploader - Platform CDN

**Unggah, simpan, dan bagikan file apa pun dengan mudah.**

![Senka Uploader Banner](https://files.catbox.moe/epedpg.jpg)

---

## 🌟 Fitur Utama

- **Drag & Drop** - Unggah file dengan menyeret dan melepas
- **Pratinjau Langsung** - Lihat gambar sebelum diunggah
- **Salin URL Seketika** - Dapatkan link berbagi dalam satu klik
- **Riwayat Upload** - Lacak semua file yang pernah Anda unggah
- **Dukungan Semua Format** - Gambar, dokumen, video, audio, dll.
- **Batas 50MB** - Cukup besar untuk kebanyakan kebutuhan
- **API Dokumentasi Lengkap** - Integrasi mudah ke aplikasi Anda

---

## 🛠️ Teknologi yang Digunakan

| Kategori | Teknologi |
|----------|-----------|
| **Frontend** | HTML5, CSS3 (Tailwind CSS), JavaScript (ES6+) |
| **Backend** | Node.js, Express.js |
| **Penyimpanan** | Supabase Storage |
| **Deployment** | Vercel, Netlify, atau server apa pun |
| **Build Tools** | Tidak diperlukan - Pure Vanilla JS |

---

## 📥 Instalasi & Setup

### Prasyarat
- Node.js (v16+)
- NPM atau Yarn
- Akun Supabase (gratis)

### Langkah 1: Clone Repositori
```bash
git clone https://github.com/username/senka-uploader.git
cd senka-uploader
```

### Langkah 2: Install Dependencies
```bash
npm install
# atau
yarn install
```

### Langkah 3: Setup Supabase
1. Buat akun di [supabase.com](https://supabase.com)
2. Buat project baru
3. Buat bucket storage bernama `uploads`
4. Salin URL project Anda

### Langkah 4: Konfigurasi Environment
Buat file `.env` di root folder:

```env
PORT=5000
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
BUCKET_NAME=your-bucket-name
CUSTOM_DOMAIN=your-domain
```

### Langkah 5: Jalankan Server
```bash
npm start
# atau
node server.js
```

Buka browser dan kunjungi `http://localhost:5000`

---

## 📁 Struktur File

```
senka-uploader/
├── index.html              # Halaman utama uploader (root)
├── public/
│   ├── docs.html           # Halaman dokumentasi API
│   ├── doc/
│   │   └── doc.js          # Script dokumentasi
│   └── index/
│       └── index.js        # Script utama dari index.html
├── server.js               # Server backend utama
├── .env                    # Konfigurasi environment
├── package.json            # Dependencies & scripts
└── README.md               # Dokumentasi project
```

---

## 📡 Endpoints API

### 1. Unggah File (POST)
```bash
POST /api/upload
Content-Type: multipart/form-data
```

**Request:**
- Form field: `file` (required)

**Response Sukses:**
```json
{
  "success": true,
  "message": "File berhasil diupload!",
  "fileName": "foto-liburan.jpg",
  "fileSize": 2048576,
  "fileType": "image/jpeg",
  "fileUrl": "https://your-domain.com/files/unique-filename.jpg",
  "storagePath": "unique-filename.jpg"
}
```

**Contoh JavaScript:**
```javascript
const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData
  });

  const result = await response.json();
  if (response.ok) {
    console.log('URL File:', result.fileUrl);
  }
};
```

### 2. Akses File (GET)
```bash
GET /files/:fileName
```

**Contoh:**
```
http://localhost:5000/files/12345-abcde.jpg
```

**Gunakan di HTML:**
```html
<img src="/files/12345-abcde.jpg" alt="Gambar">
<video controls>
  <source src="/files/video-123.mp4" type="video/mp4">
</video>
<a href="/files/document.pdf" download>Download PDF</a>
```

---

## 🐞 Penanganan Error Umum

| Kode Error | Penyebab | Solusi |
|------------|----------|--------|
| `400 Bad Request` | Tidak ada file yang dikirim | Pastikan form data berisi field 'file' |
| `404 Not Found` | File tidak ditemukan | Periksa nama file atau upload ulang |
| `413 Payload Too Large` | File terlalu besar | Kompres file atau naikkan batas di .env |
| `500 Internal Server Error` | Masalah server | Periksa koneksi Supabase atau log error |

---

## 🤝 Kontribusi

Ingin berkontribusi? Ikuti langkah ini:

1. Fork repositori ini
2. Buat branch baru (`git checkout -b fitur-baru`)
3. Commit perubahan Anda (`git commit -am 'Tambah fitur baru'`)
4. Push ke branch (`git push origin fitur-baru`)
5. Buka Pull Request

---

## 📞 Dukungan & Bantuan

Butuh bantuan? Hubungi kami:

- **GitHub Issues**: [Buka Issue](https://github.com/Liwirya/senka-uploader/issues)

---

**Dibuat dengan oleh Liwirya**
