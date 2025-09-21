// server.js
const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const multer = require('multer');
const cors = require('cors'); 

const app = express();
const port = process.env.PORT || 1904; 

// Konfigurasi Supabase
const SUPABASE_URL = 'https://ycxcrxdnzcyczbktfzes.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InljeGNyeGRuemN5Y3pia3RmemVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxNDU2NzAsImV4cCI6MjA2NTcyMTY3MH0.vwPxPM8hkSCCxLcJRGyiXJ7qzVmkgkzzdHK0mvk5sCg';
const BUCKET_NAME = 'senka';
const CUSTOM_DOMAIN = process.env.CUSTOM_DOMAIN || "http://wil-panel.wildanhdyt.my.id:1900"; // Domain kustom, bisa kosong

if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !BUCKET_NAME) {
    console.error('ERROR: Pastikan SUPABASE_URL, SUPABASE_ANON_KEY, dan BUCKET_NAME diatur di file .env');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 50 * 1024 * 1024 } // Batas ukuran file 50MB
});

app.use(cors()); 
app.use(express.json()); 
app.use(express.static(path.join(__dirname, 'public'))); 

app.post('/api/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Tidak ada file yang diupload.' });
        }

        const file = req.file;
        const fileExt = path.extname(file.originalname).toLowerCase();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 10)}${fileExt}`;
        const filePath = fileName; 
        console.log(`Mengupload file: ${file.originalname} ke ${BUCKET_NAME}/${filePath}`);

        const { data, error } = await supabase.storage
            .from(BUCKET_NAME)
            .upload(filePath, file.buffer, {
                contentType: file.mimetype,
                upsert: false 
            });

        if (error) {
            console.error('Supabase upload error:', error);
            return res.status(500).json({ success: false, message: 'Gagal mengupload file ke Supabase.', error: error.message });
        }

        const publicUrlData = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath);
        if (publicUrlData.error) {
            console.error('Supabase getPublicUrl error:', publicUrlData.error);
            return res.status(500).json({ success: false, message: 'Gagal mendapatkan URL publik file.', error: publicUrlData.error.message });
        }

        let fileUrl = publicUrlData.data.publicUrl;

        if (CUSTOM_DOMAIN && CUSTOM_DOMAIN.trim() !== '') {
        fileUrl = `${CUSTOM_DOMAIN}/files/${fileName}`;
        }

        console.log(`File berhasil diupload. URL: ${fileUrl}`);
        res.status(200).json({
            success: true,
            message: 'File berhasil diupload!',
            fileName: file.originalname,
            fileSize: file.size,
            fileType: file.mimetype,
            fileUrl: fileUrl,
            storagePath: filePath
        });

    } catch (err) {
        console.error('Kesalahan server pada /api/upload:', err);
        if (err.code === 'LIMIT_FILE_SIZE') {
             return res.status(413).json({ success: false, message: 'Ukuran file melebihi batas maksimal (50MB).', error: err.message });
        }
        res.status(500).json({ success: false, message: 'Kesalahan server internal saat upload.', error: err.message });
    }
});

app.get('/files/:fileName', async (req, res) => {
    const fileName = req.params.fileName; 

    try {
        const { data, error } = await supabase.storage
            .from(BUCKET_NAME)
            .download(fileName);

        if (error) {
            console.error(`Gagal mengunduh file '${fileName}' dari Supabase:`, error);
            if (error.statusCode === '404') {
                return res.status(404).json({ success: false, message: 'File tidak ditemukan.' });
            }
            return res.status(500).json({ success: false, message: 'Gagal mengunduh file dari Supabase.', error: error.message });
        }

        const arrayBuffer = await data.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const mimeTypes = {
            'jpg': 'image/jpeg', 'jpeg': 'image/jpeg', 'png': 'image/png', 'gif': 'image/gif', 'svg': 'image/svg+xml',
            'pdf': 'application/pdf', 'mp4': 'video/mp4', 'mov': 'video/quicktime', 'avi': 'video/x-msvideo',
            'mp3': 'audio/mpeg', 'wav': 'audio/wav', 'ogg': 'audio/ogg',
            'txt': 'text/plain', 'html': 'text/html', 'css': 'text/css', 'js': 'application/javascript',
            'json': 'application/json', 'zip': 'application/zip', 'rar': 'application/x-rar-compressed',
            'doc': 'application/msword', 'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'xls': 'application/vnd.ms-excel', 'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'ppt': 'application/vnd.ms-powerpoint', 'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        };
        const fileExt = fileName.split('.').pop()?.toLowerCase();
        const contentType = mimeTypes[fileExt] || 'application/octet-stream';

        res.setHeader('Content-Type', contentType);
        res.setHeader('Content-Length', buffer.length);
        res.send(buffer);
    } catch (err) {
        console.error('Kesalahan server pada /files/:fileName:', err);
        res.status(500).json({ success: false, message: 'Kesalahan server internal.', error: err.message });
    }
});

app.get('/:fileName', async (req, res) => {
    const fileName = req.params.fileName;

    if (fileName === 'favicon.ico' || fileName === '') {
        return res.status(404).send('Not Found');
    }

    try {
        const { data, error } = await supabase.storage
            .from(BUCKET_NAME)
            .download(fileName);

        if (error) {
            console.error(`Gagal mengunduh file '${fileName}' dari Supabase:`, error);
            if (error.statusCode === '404') {
                return res.status(404).send('File tidak ditemukan.');
            }
            return res.status(500).send('Gagal mengunduh file.');
        }

        const arrayBuffer = await data.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const mimeTypes = {
            'jpg': 'image/jpeg', 'jpeg': 'image/jpeg', 'png': 'image/png', 'gif': 'image/gif', 'svg': 'image/svg+xml',
            'pdf': 'application/pdf', 'mp4': 'video/mp4', 'mov': 'video/quicktime', 'avi': 'video/x-msvideo',
            'mp3': 'audio/mpeg', 'wav': 'audio/wav', 'ogg': 'audio/ogg',
            'txt': 'text/plain', 'html': 'text/html', 'css': 'text/css', 'js': 'application/javascript',
            'json': 'application/json', 'zip': 'application/zip', 'rar': 'application/x-rar-compressed',
            'doc': 'application/msword', 'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'xls': 'application/vnd.ms-excel', 'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'ppt': 'application/vnd.ms-powerpoint', 'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        };
        const fileExt = fileName.split('.').pop()?.toLowerCase();
        const contentType = mimeTypes[fileExt] || 'application/octet-stream';

        res.setHeader('Content-Type', contentType);
        res.setHeader('Content-Length', buffer.length);
        res.send(buffer);
    } catch (err) {
        console.error('Kesalahan server pada /:fileName:', err);
        res.status(500).send('Kesalahan server internal.');
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
    console.log(`Server berjalan di http://localhost:${port}`);
    console.log(`Akses aplikasi di http://localhost:${port}`);
    console.log(`Dokumentasi API di http://localhost:${port}/docs.html`);
});
