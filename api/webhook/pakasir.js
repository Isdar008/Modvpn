// File: api/webhook/pakasir.js
import axios from 'axios';

// ganti pakai IP VPS lu
const VPS_WEBHOOK_URL = "http://41.216.178.185:50123/webhook/pakasir";

export default async function handler(request, response) {
    if (request.method !== "POST") {
        return response.status(405).json({
            success: false,
            message: "Hanya menerima POST."
        });
    }

    try {
        const payload = request.body;

        console.log("=== Webhook diterima dari Pakasir ===");
        console.log(payload);

        // Validasi basic
        if (!payload.order_id || !payload.amount || !payload.status) {
            return response.status(400).json({
                success: false,
                message: "Payload tidak lengkap."
            });
        }

        // Forward langsung ke VPS
        const forward = await axios.post(VPS_WEBHOOK_URL, payload);

        console.log("Forward sukses:", forward.data);

        return response.json({
            success: true,
            message: "Webhook diterima & diteruskan ke VPS."
        });

    } catch (err) {
        console.error("Error:", err.message);
        return response.status(500).json({
            success: false,
            message: "Internal error ketika memproses webhook."
        });
    }
}
