// api/webhook/pakasir.js  (CommonJS - cepat)
const axios = require('axios');

const VPS_INTERNAL_WEBHOOK_URL = process.env.VPS_INTERNAL_WEBHOOK_URL || 'http://41.216.178.185:50123/webhook/pakasir';
const PAKASIR_FORWARD_SECRET = process.env.PAKASIR_FORWARD_SECRET || 'joytun0018272727Shdha';

module.exports = async function handler(request, response) {
  if (request.method !== 'POST') {
    return response.status(405).json({
      success: false,
      message: 'Metode tidak diizinkan. Hanya POST yang diterima.'
    });
  }

  try {
    const payload = request.body;
    console.log('--- Webhook Diterima dari Pakasir ---');
    console.log('Payload Lengkap:', JSON.stringify(payload).slice(0, 1000));

    // forward dengan timeout dan header
    const res = await axios.post(VPS_INTERNAL_WEBHOOK_URL, payload, {
      headers: { 'Authorization': `Bearer ${PAKASIR_FORWARD_SECRET}` },
      timeout: 8000
    });

    console.log('Forwarded to VPS, status:', res.status);

    return response.status(200).json({
      success: true,
      message: 'Webhook diterima dan diteruskan ke bot VPS dengan sukses.'
    });
  } catch (error) {
    // logging yang lebih informatif
    console.error('Error saat meneruskan webhook ke VPS:', error.message);
    if (error.response) {
      console.error('VPS response status:', error.response.status);
      console.error('VPS response data:', JSON.stringify(error.response.data).slice(0, 1000));
    }
    console.error(error.stack);

    // tetap kirim 200 ke pakasir (sesuai design kamu)
    return response.status(200).json({
      success: false,
      message: 'Webhook diterima, namun gagal diteruskan. Cek log Vercel dan VPS.'
    });
  }
};
