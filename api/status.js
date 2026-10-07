module.exports = async (req, res) => {
  const id = String(req.query.id || '');
  if (!/^PC-[\w-]+$/.test(id)) return res.status(400).json({ success: false, error: 'Bad id' });
  try {
    const r = await fetch('https://pay-kwacha.vercel.app/api/payment-status/' + encodeURIComponent(id));
    const d = await r.json().catch(() => ({}));
    res.status(200).json({ success: !!d.success, status: d.status });
  } catch (e) {
    res.status(502).json({ success: false, error: 'Status check failed' });
  }
};
