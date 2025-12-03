// File: api/webhook/pakasir.js (Vercel)

const VPS_INTERNAL_WEBHOOK_URL = 'http://160.19.167.112:50123/webhook/pakasir'; // IP & port VPS kamu

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res
      .status(405)
      .json({ success: false, message: 'Only POST allowed' });
  }

  try {
    // Pastikan payload selalu object
    const payload =
      typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};

    // Forward ke VPS
    const forwardResp = await fetch(VPS_INTERNAL_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    // Kalau mau, kita baca respon dari VPS
    const text = await forwardResp.text();

    // Balikin status yang sama atau cukup success aja
    return res.status(200).json({
      success: true,
      forwardedStatus: forwardResp.status,
      body: text,
    });
  } catch (err) {
    console.error('Forward Pakasir → VPS gagal:', err?.message || err);
    return res
      .status(500)
      .json({ success: false, message: 'Failed to forward to VPS' });
  }
}
