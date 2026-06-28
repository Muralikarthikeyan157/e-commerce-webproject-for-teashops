function openPayModal() {
  const items = getCartItems();
  if (items.length === 0) return;

  const modal = document.getElementById('pay-modal');
  const summaryList = document.getElementById('modal-summary-list');
  const modalTotal = document.getElementById('modal-total');
  const total = getCartTotal();

  summaryList.innerHTML = items
    .map(
      (item) =>
        `<li><span>${escapeHtml(item.name)} × ${item.qty}</span><span>${formatCurrency(item.price * item.qty)}</span></li>`
    )
    .join('');

  modalTotal.textContent = formatCurrency(total);
  renderPaymentQR('payment-qr', total);
  modal.classList.add('open');
}

function closePayModal() {
  document.getElementById('pay-modal').classList.remove('open');
}

function markAsPaid() {
  const items = getCartItems();
  if (items.length === 0) return;

  const order = {
    id: generateId(),
    items: items.map((item) => ({
      id: item.menuId,
      name: item.name,
      price: item.price,
      qty: item.qty,
    })),
    total: getCartTotal(),
    paidAt: new Date().toISOString(),
    paymentMethod: 'UPI',
  };

  saveOrder(order);
  clearCartStorage();
  renderCart();
  closePayModal();
  alert('Payment recorded. Thank you!');
}

function buildPrintReceipt() {
  const items = getCartItems();
  const receipt = document.getElementById('print-receipt');
  if (!receipt || items.length === 0) return;

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-IN');
  const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  const total = getCartTotal();

  receipt.innerHTML = `
    <div class="receipt-header">
      <h1>${escapeHtml(BAKERY_CONFIG.shopName)}</h1>
      <div>${dateStr} ${timeStr}</div>
    </div>
    ${items
      .map(
        (item) => `
      <div class="receipt-line">
        <span>${escapeHtml(item.name)} × ${item.qty}</span>
        <span>${formatCurrency(item.price * item.qty)}</span>
      </div>`
      )
      .join('')}
    <div class="receipt-line receipt-total">
      <span>TOTAL</span>
      <span>${formatCurrency(total)}</span>
    </div>
    <div class="receipt-footer">Thank you! Visit again.</div>
  `;
}

function printBill() {
  if (getCartItems().length === 0) return;
  buildPrintReceipt();
  window.print();
}

function initBilling() {
  document.getElementById('btn-pay').addEventListener('click', openPayModal);
  document.getElementById('btn-print').addEventListener('click', printBill);
  document.getElementById('btn-clear').addEventListener('click', clearCart);
  document.getElementById('btn-mark-paid').addEventListener('click', markAsPaid);
  document.getElementById('btn-close-modal').addEventListener('click', closePayModal);

  document.getElementById('pay-modal').addEventListener('click', (e) => {
    if (e.target.id === 'pay-modal') closePayModal();
  });
}
