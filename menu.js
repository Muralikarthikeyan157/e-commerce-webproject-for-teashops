const DEFAULT_MENU = [
  {
    id: 'tea',
    name: 'Tea',
    price: 15,
    imageUrl: 'assets/images/tea.jpg',
  },
  {
    id: 'coffee',
    name: 'Coffee',
    price: 25,
    imageUrl: 'assets/images/coffee.jpg',
  },
  {
    id: 'boost',
    name: 'Boost',
    price: 30,
    imageUrl: 'assets/images/boost.jpg',
  },
  {
    id: 'horlicks',
    name: 'Horlicks',
    price: 30,
    imageUrl: 'assets/images/horlicks.jpg',
  },
  {
    id: 'bread',
    name: 'Bread',
    price: 40,
    imageUrl: 'assets/images/bread.jpg',
  },
  {
    id: 'vada',
    name: 'Vada',
    price: 20,
    imageUrl: 'assets/images/vada.jpg',
  },
  {
    id: 'bajji',
    name: 'Bajji',
    price: 25,
    imageUrl: 'assets/images/bajji.jpg',
  },
];

function initMenu() {
  const storedVersion = parseInt(localStorage.getItem(STORAGE_KEYS.menuVersion) || '0', 10);
  const existing = getMenu();

  if (!existing || storedVersion < MENU_VERSION) {
    if (existing && storedVersion < MENU_VERSION) {
      const merged = DEFAULT_MENU.map((defaults) => {
        const saved = existing.find((item) => item.id === defaults.id);
        return saved
          ? { ...saved, name: defaults.name, imageUrl: defaults.imageUrl }
          : defaults;
      });
      existing.forEach((item) => {
        if (!merged.find((m) => m.id === item.id)) merged.push(item);
      });
      saveMenu(merged);
    } else {
      saveMenu(DEFAULT_MENU);
    }
    localStorage.setItem(STORAGE_KEYS.menuVersion, String(MENU_VERSION));
  }
}

function loadMenuItems() {
  initMenu();
  return getMenu();
}

function renderMenuGrid(containerId, onAdd) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const items = loadMenuItems();
  container.innerHTML = '';

  items.forEach((item) => {
    const card = document.createElement('article');
    card.className = 'menu-card';
    card.innerHTML = `
      <img src="${escapeHtml(item.imageUrl)}" alt="${escapeHtml(item.name)}" loading="lazy"
           onerror="this.src='assets/images/${encodeURIComponent(item.id)}.jpg'">
      <div class="menu-card-body">
        <h3>${escapeHtml(item.name)}</h3>
        <span class="price">${BAKERY_CONFIG.currency}${item.price}</span>
        <button type="button" class="btn btn-primary btn-sm add-btn" data-id="${escapeHtml(item.id)}">Add</button>
      </div>
    `;

    const addItem = () => onAdd(item);
    card.addEventListener('click', (e) => {
      if (e.target.closest('.add-btn')) return;
      addItem();
    });
    card.querySelector('.add-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      addItem();
    });

    container.appendChild(card);
  });
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function formatCurrency(amount) {
  return `${BAKERY_CONFIG.currency}${amount.toFixed(2)}`;
}

function setActiveNav(page) {
  document.querySelectorAll('.navbar nav a').forEach((link) => {
    link.classList.toggle('active', link.dataset.page === page);
  });
}
