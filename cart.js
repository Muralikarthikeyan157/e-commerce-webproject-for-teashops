function getCartItems() {
  return getCart().items;
}

function findCartItem(menuId) {
  return getCartItems().find((item) => item.menuId === menuId);
}

function addToCart(menuItem) {
  const cart = getCart();
  const existing = cart.items.find((item) => item.menuId === menuItem.id);

  if (existing) {
    existing.qty += 1;
  } else {
    cart.items.push({
      menuId: menuItem.id,
      name: menuItem.name,
      price: menuItem.price,
      qty: 1,
    });
  }

  saveCart(cart);
  renderCart();
}

function updateQty(menuId, delta) {
  const cart = getCart();
  const item = cart.items.find((i) => i.menuId === menuId);
  if (!item) return;

  item.qty += delta;
  if (item.qty <= 0) {
    cart.items = cart.items.filter((i) => i.menuId !== menuId);
  }

  saveCart(cart);
  renderCart();
}

function getCartTotal() {
  return getCartItems().reduce((sum, item) => sum + item.price * item.qty, 0);
}

function getCartCount() {
  return getCartItems().reduce((sum, item) => sum + item.qty, 0);
}

function clearCart() {
  if (getCartItems().length === 0) return;
  if (!confirm('Clear all items from the cart?')) return;
  clearCartStorage();
  renderCart();
}

function renderCart() {
  const listEl = document.getElementById('cart-items');
  const totalEl = document.getElementById('cart-total-amount');
  const payBtn = document.getElementById('btn-pay');
  const printBtn = document.getElementById('btn-print');

  if (!listEl) return;

  const items = getCartItems();
  listEl.innerHTML = '';

  items.forEach((item) => {
    const li = document.createElement('li');
    li.className = 'cart-item';
    li.innerHTML = `
      <div class="cart-item-info">
        <div class="name">${escapeHtml(item.name)}</div>
        <div class="line-total">${formatCurrency(item.price)} × ${item.qty} = ${formatCurrency(item.price * item.qty)}</div>
      </div>
      <div class="cart-item-qty">
        <button type="button" class="btn btn-outline btn-icon btn-sm qty-minus" data-id="${escapeHtml(item.menuId)}" aria-label="Decrease">−</button>
        <span>${item.qty}</span>
        <button type="button" class="btn btn-outline btn-icon btn-sm qty-plus" data-id="${escapeHtml(item.menuId)}" aria-label="Increase">+</button>
      </div>
    `;

    li.querySelector('.qty-minus').addEventListener('click', () => updateQty(item.menuId, -1));
    li.querySelector('.qty-plus').addEventListener('click', () => updateQty(item.menuId, 1));
    listEl.appendChild(li);
  });

  const total = getCartTotal();
  if (totalEl) totalEl.textContent = formatCurrency(total);

  const hasItems = items.length > 0;
  if (payBtn) payBtn.disabled = !hasItems;
  if (printBtn) printBtn.disabled = !hasItems;
}
