// Vercel serverless function: keeps the PayKwacha key on the server.
module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed' });
  const { phoneNumber, amount, provider } = req.body || {};
  let phone = String(phoneNumber || '').replace(/\D/g, '');
  if (phone.startsWith('265')) phone = phone.slice(3);
  if (phone.length === 10 && phone.startsWith('0')) phone = phone.slice(1);
  const amt = Math.floor(Number(amount));
  if (phone.length !== 9) return res.status(400).json({ success: false, error: 'Enter a valid phone number, e.g. 0999 123 456' });
  if (!(amt >= 50)) return res.status(400).json({ success: false, error: 'Amount must be at least MWK 50' });
  if (!['AIRTEL_MWI', 'TNM_MWI'].includes(provider)) return res.status(400).json({ success: false, error: 'Choose a network' });
  if (!process.env.PAYKWACHA_KEY) return res.status(500).json({ success: false, error: 'Payments are not set up yet' });
  try {
    const r = await fetch('https://pay-kwacha.vercel.app/api/payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apiKey: process.env.PAYKWACHA_KEY, phoneNumber: phone, amount: String(amt), provider })
    });
    const d = await r.json().catch(() => ({}));
    res.status(r.ok ? 200 : r.status).json({ success: !!d.success, chargeId: d.chargeId, status: d.status, error: d.success ? undefined : (d.error || 'Payment could not be started') });
  } catch (e) {
    res.status(502).json({ success: false, error: 'Payment service unreachable' });
  }
};
