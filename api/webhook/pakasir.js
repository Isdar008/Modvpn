// File: api/webhook/pakasir.js (di Vercel)
import axios from 'axios';

const VPS_INTERNAL_WEBHOOK_URL = 'http://41.216.178.185:50123/webhook/pakasir'; // GANTI IP!

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res
      .status(405)
      .json({ success: false, message: 'Only POST allowed' });
  }

  try {
    const payload = req.body;

    // forward payload ke VPS (Express app.post('/webhook/pakasir', ...))
    await axios.post(VPS_INTERNAL_WEBHOOK_URL, payload, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 10000
    });

    return res.json({ success: true });
  } catch (err) {
    console.error('Forward Pakasir → VPS gagal:', err.message || err);
    return res
      .status(500)
      .json({ success: false, message: 'Failed to forward to VPS' });
  }
}
