// File: api/webhook/pakasir.js

// Gunakan require untuk kompatibilitas Serverless Function yang lebih aman
const axios = require('axios'); 

// --- AMBIL DARI ENVIRONMENT VARIABLES VERCEL ---
// Pastikan Anda mengatur dua variabel ini di dashboard Vercel Anda!
const VPS_INTERNAL_WEBHOOK_URL = process.env.VPS_WEBHOOK_URL; 
const PAKASIR_FORWARD_SECRET = process.env.PAKASIR_FORWARD_SECRET; 

export default async function handler(request, response) {
    if (request.method !== 'POST') {
        return response.status(405).json({ 
            success: false, 
            message: 'Metode tidak diizinkan. Hanya POST yang diterima.' 
        });
    }
    
    // Cek keamanan ENV
    if (!VPS_INTERNAL_WEBHOOK_URL || !PAKASIR_FORWARD_SECRET) {
        console.error("❌ ERROR: Variabel VPS_WEBHOOK_URL atau PAKASIR_FORWARD_SECRET belum diatur di Vercel.");
        return response.status(500).json({ 
            success: false, 
            message: 'Konfigurasi server webhook Vercel belum lengkap. Hubungi Admin.' 
        });
    }

    try {
        const payload = request.body;
        
        console.log('--- Webhook Diterima dari Pakasir ---');
        console.log(`Meneruskan ke: ${VPS_INTERNAL_WEBHOOK_URL}`);
        
        // --- 1. Meneruskan Payload ke VPS ---
        // Header Authorization digunakan untuk memvalidasi request di sisi app.js (VPS)
        await axios.post(VPS_INTERNAL_WEBHOOK_URL, payload, {
            headers: { 'Authorization': `Bearer ${PAKASIR_FORWARD_SECRET}` },
            timeout: 10000 // Tambahkan timeout 10 detik agar Vercel tidak menunggu VPS terlalu lama
        });

        // 2. Berikan Respon Sukses (Status 200) ke Pakasir
        // Ini berarti Vercel sukses menerima dan sukses meneruskan request.
        return response.status(200).json({ 
            success: true, 
            message: 'Webhook diterima dan diteruskan ke bot VPS dengan sukses.' 
        });

    } catch (error) {
        console.error('Error saat meneruskan webhook ke VPS:', error.message);
        
        // LOGIKA KRITIS: Jika VPS gagal merespons, kita tetap kirim 200 OK ke Pakasir.
        // Ini mencegah Pakasir mencoba terus-menerus dan membebani VPS/Vercel.
        return response.status(200).json({ 
            success: true, // Kita anggap sukses dari sisi Pakasir
            message: 'Webhook diterima, namun gagal diteruskan atau VPS merespons error. Cek log Vercel dan VPS.' 
        });
    }
}
