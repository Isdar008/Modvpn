export default async function handler(req, res) {
  try {
    const body = req.body || {};

    console.log("Webhook from Pakasir:", body);

    res.status(200).json({
      success: true,
      message: "Webhook received",
      data: body
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
}
