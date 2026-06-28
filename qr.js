function buildUpiUrl(amount) {
  const params = new URLSearchParams({
    pa: BAKERY_CONFIG.upiId,
    pn: BAKERY_CONFIG.shopName,
    am: amount.toFixed(2),
    cu: BAKERY_CONFIG.currencyCode,
  });
  return `upi://pay?${params.toString()}`;
}

function renderPaymentQR(canvasId, amount) {
  const canvas = document.getElementById(canvasId);
  if (!canvas || typeof QRCode === 'undefined') return;

  const upiUrl = buildUpiUrl(amount);
  QRCode.toCanvas(canvas, upiUrl, {
    width: 220,
    margin: 2,
    color: { dark: '#3d2914', light: '#ffffff' },
  });
}
