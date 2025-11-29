import axios from 'axios';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: 'Only POST allowed.' });
    }

    try {
        const payload = req.body;

        // Teruskan webhook ke VPS bot (ganti IP milik lo)
        const forward = await axios.post(
            '41.216.178.185:50123/app/webhook/pakasir',
            payload,
            { timeout: 5000 }
        );

        return res.status(200).json({
            success: true,
            message: 'Webhook diterima & diteruskan ke bot.',
            forward: forward.data
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: 'Gagal meneruskan webhook ke VPS.'
        });
    }
}
