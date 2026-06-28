const STORAGE_KEYS = {
  menu: 'bakery_menu',
  menuVersion: 'bakery_menu_version',
  orders: 'bakery_orders',
  cart: 'bakery_cart',
};

const MENU_VERSION = 2;

function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function getMenu() {
  return readJSON(STORAGE_KEYS.menu, null);
}

function saveMenu(items) {
  writeJSON(STORAGE_KEYS.menu, items);
}

function getOrders() {
  return readJSON(STORAGE_KEYS.orders, []);
}

function saveOrder(order) {
  const orders = getOrders();
  orders.push(order);
  writeJSON(STORAGE_KEYS.orders, orders);
}

function getCart() {
  return readJSON(STORAGE_KEYS.cart, { items: [] });
}

function saveCart(cart) {
  writeJSON(STORAGE_KEYS.cart, cart);
}

function clearCartStorage() {
  writeJSON(STORAGE_KEYS.cart, { items: [] });
}
