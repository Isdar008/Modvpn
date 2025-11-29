// File: api/webhook/pakasir.js

// Ini adalah fungsi handler utama untuk Vercel Serverless Function
export default async function handler(request, response) {
    // Webhook biasanya menggunakan metode POST untuk mengirim data
    if (request.method !== 'POST') {
        return response.status(405).json({ 
            success: false, 
            message: 'Metode tidak diizinkan. Hanya POST yang diterima.' 
        });
    }

    try {
        const payload = request.body;
        
        // Cek apakah data dari webhook terkirim
        console.log('--- Webhook Diterima ---');
        console.log('Payload Lengkap:', payload);
        
        // Logika bisnis Anda (misalnya menyimpan ke database)
        
        // Berikan Respon Sukses (Status 200)
        return response.status(200).json({ 
            success: true, 
            message: 'Webhook diterima dan diproses dengan sukses.' 
        });

    } catch (error) {
        console.error('Error saat memproses webhook:', error);
        return response.status(500).json({ 
            success: false, 
            message: 'Terjadi error internal saat memproses webhook.' 
        });
    }
}
