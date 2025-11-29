/**
 * Modul: pakasir.js
 * Fungsi: Menangani inisiasi pesanan deposit saldo melalui Pakasir API.
 */

// Module.exports menerima dependencies yang sudah ada di app.js
module.exports = (dependencies) => {
    const { 
        bot, 
        pakasir, 
        dbRunAsync, 
        logger, 
        MIN_DEPOSIT_AMOUNT, 
        PAKASIR_WEBHOOK_URL,
        escapeMarkdownV2 // Helper untuk formatting Telegram V2
    } = dependencies;

    /**
     * Menginisiasi pesanan deposit baru melalui Pakasir.
     * Fungsi ini harus dipanggil dari handler perintah Telegram, misalnya /deposit.
     * * @param {object} ctx Konteks Telegraf (untuk reply ke user).
     * @param {number} amount Jumlah deposit yang diminta (sudah divalidasi dan di-parse).
     * @param {string} paymentMethod Metode pembayaran yang dipilih (default 'QRIS').
     */
    async function initiatePakasirDeposit(ctx, amount, paymentMethod = 'QRIS') {
        const userId = ctx.from.id;
        const username = ctx.from.username || `id${userId}`;
        const cleanAmount = Number(amount);

        // Validasi Dasar (Meskipun sebaiknya dilakukan di handler command)
        if (isNaN(cleanAmount) || cleanAmount < MIN_DEPOSIT_AMOUNT) {
            await ctx.reply(
                `❌ *Gagal:* Jumlah deposit minimal adalah Rp ${MIN_DEPOSIT_AMOUNT.toLocaleString('id-ID')}\n\n` +
                `Jumlah yang Anda masukkan: *Rp ${amount.toLocaleString('id-ID')}*`,
                { parse_mode: 'Markdown' }
            );
            return;
        }

        try {
            // ID unik eksternal untuk melacak transaksi di sisi Pakasir
            const externalId = `PAKASIR-${userId}-${Date.now()}`;
            const description = `Top Up Saldo ${username} - ${cleanAmount.toLocaleString('id-ID')}`;
            
            // Tentukan URL redirect sukses dummy dan URL webhook yang sebenarnya
            const successUrl = PAKASIR_WEBHOOK_URL.replace('/webhook/pakasir', '/topup-success'); 
            
            // 1. Buat Order di Pakasir
            const orderPayload = {
                order: {
                    external_id: externalId,
                    amount: cleanAmount,
                    description: description,
                    payment_method: paymentMethod.toUpperCase(), 
                    success_redirect_url: successUrl,
                    webhook_url: PAKASIR_WEBHOOK_URL // Webhook yang akan memproses saat pembayaran sukses
                },
                customer: {
                    user_id: String(userId),
                    name: ctx.from.first_name || username,
                    email: `${username}@telegram.me`,
                }
            };
            
            logger.info(`Membuat order Pakasir untuk User ${userId} (${cleanAmount})...`);
            
            const pakasirResponse = await pakasir.createOrder(orderPayload);

            if (!pakasirResponse.order) {
                 logger.error(`Gagal membuat order Pakasir: ${JSON.stringify(pakasirResponse)}`);
                 await ctx.reply('❌ *Gagal membuat order Pakasir.* Silakan coba lagi nanti atau hubungi Admin.', { parse_mode: 'Markdown' });
                 return;
            }
            
            const order = pakasirResponse.order;
            const payment = pakasirResponse.payment;
            
            // 2. Simpan ke Database pending_deposits_pakasir
            await dbRunAsync(
                `INSERT INTO pending_deposits_pakasir 
                 (user_id, order_id, amount, status, payment_method, payment_data, expired_at)
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [userId, order.order_id, order.amount, order.status, payment.payment_method, JSON.stringify(payment), order.expired_at]
            );
            
            logger.info(`Order Pakasir ${order.order_id} tersimpan. Status: ${order.status}`);

            // 3. Kirim Detail Pembayaran ke User
            let message = `🧾 *Detail Pembayaran Pakasir* 🧾\n\n`;
            message += `🆔 Order ID: \`${escapeMarkdownV2(order.order_id)}\`\n`;
            message += `💰 Nominal: *Rp ${cleanAmount.toLocaleString('id-ID')}*\n`;
            message += `💳 Metode: *${escapeMarkdownV2(payment.payment_method)}*\n`;
            
            const expiredTime = new Date(order.expired_at).toLocaleString('id-ID', {
                timeZone: 'Asia/Jakarta', 
                year: 'numeric', month: 'numeric', day: 'numeric', 
                hour: '2-digit', minute: '2-digit'
            });
            message += `⏳ Kedaluwarsa: *${escapeMarkdownV2(expiredTime)}*\n\n`;
            
            // Detail spesifik pembayaran (contoh untuk QRIS dan VA)
            if (payment.payment_method.includes('QRIS') || payment.payment_method.includes('QR')) {
                message += `🔗 *Link Pembayaran:* [Klik di sini untuk QRIS/Link](${escapeMarkdownV2(payment.pay_url)})\n\n`;
                message += `Silakan buka tautan di atas untuk melihat QR Code dan menyelesaikan pembayaran.`;
                
            } else if (payment.payment_method.includes('BANK_TRANSFER') && payment.virtual_account) {
                message += `🏦 Bank: *${escapeMarkdownV2(payment.bank_name || 'Virtual Account')}*\n`;
                message += `🔢 Nomor VA: \`${escapeMarkdownV2(payment.virtual_account)}\`\n\n`;
                message += `Pastikan Anda transfer tepat *Rp ${cleanAmount.toLocaleString('id-ID')}* ke Nomor VA di atas.`;
            } else {
                 message += `Untuk menyelesaikan pembayaran, [klik tautan ini](${escapeMarkdownV2(payment.pay_url)}).\n\n`;
            }
            
            message += `\n_Setelah berhasil dibayar, saldo akan masuk otomatis dalam 1\\-5 menit\\._`;

            await ctx.reply(message, { 
                parse_mode: 'MarkdownV2',
                reply_markup: {
                    inline_keyboard: [
                        [{ text: `🔗 Bayar Sekarang (Rp ${cleanAmount.toLocaleString('id-ID')})`, url: payment.pay_url }]
                    ]
                }
            });

        } catch (error) {
            logger.error(`Error saat inisiasi deposit Pakasir untuk ${userId}:`, error.message);
            await ctx.reply('❌ *Terjadi kesalahan sistem saat membuat order deposit.* Coba lagi nanti.', { parse_mode: 'Markdown' });
        }
    }

    return { initiatePakasirDeposit };
};
