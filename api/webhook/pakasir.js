// File: api/webhook/pakasir.js

import axios from 'axios';

// Ganti dengan IP Public VPS Anda dan PORT Express (50123)
// Pastikan Anda juga memasukkan Secret Key yang sama persis di sini!
const VPS_INTERNAL_WEBHOOK_URL = 'http://41.216.178.185:50123/webhook/pakasir';
const PAKASIR_FORWARD_SECRET = "joytun0018272727Shdha"; // <--- HARUS SAMA DENGAN DI app.js

export default async function handler(request, response) {
    if (request.method !== 'POST') {
        return response.status(405).json({ 
            success: false, 
            message: 'Metode tidak diizinkan. Hanya POST yang diterima.' 
        });
    }

    try {
        const payload = request.body;
        
        console.log('--- Webhook Diterima dari Pakasir ---');
        console.log('Payload Lengkap:', payload);
        
        // --- 1. Meneruskan Payload ke VPS ---
        // Vercel mengirim POST ke VPS Anda
        await axios.post(VPS_INTERNAL_WEBHOOK_URL, payload, {
            headers: { 'Authorization': `Bearer ${PAKASIR_FORWARD_SECRET}` } 
        });

        // 2. Berikan Respon Sukses (Status 200) ke Pakasir
        return response.status(200).json({ 
            success: true, 
            message: 'Webhook diterima dan diteruskan ke bot VPS dengan sukses.' 
        });

    } catch (error) {
        console.error('Error saat meneruskan webhook ke VPS:', error);
        // Jika VPS error, kita tetap kirim 200 OK ke Pakasir agar mereka tidak mengulanginya terus menerus.
        return response.status(200).json({ 
            success: false, 
            message: 'Webhook diterima, namun gagal diteruskan. Cek log Vercel dan VPS.' 
        });
    }
}
