let editingId = null;

function renderAdminTable() {
  const tbody = document.getElementById('menu-table-body');
  const items = loadMenuItems();

  if (items.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" class="empty-state">No menu items yet.</td></tr>';
    return;
  }

  tbody.innerHTML = items
    .map(
      (item) => `
    <tr>
      <td><img class="thumb" src="${escapeHtml(item.imageUrl)}" alt="${escapeHtml(item.name)}"
           onerror="this.src='assets/images/${escapeHtml(item.id)}.jpg'"></td>
      <td>${escapeHtml(item.name)}</td>
      <td>${formatCurrency(item.price)}</td>
      <td>
        <div class="actions">
          <button type="button" class="btn btn-primary btn-sm edit-btn" data-id="${escapeHtml(item.id)}">Edit</button>
          <button type="button" class="btn btn-danger btn-sm delete-btn" data-id="${escapeHtml(item.id)}">Delete</button>
        </div>
      </td>
    </tr>`
    )
    .join('');

  tbody.querySelectorAll('.edit-btn').forEach((btn) => {
    btn.addEventListener('click', () => startEdit(btn.dataset.id));
  });

  tbody.querySelectorAll('.delete-btn').forEach((btn) => {
    btn.addEventListener('click', () => deleteItem(btn.dataset.id));
  });
}

function resetForm() {
  editingId = null;
  document.getElementById('menu-form').reset();
  document.getElementById('image-preview').style.display = 'none';
  document.getElementById('form-title').textContent = 'Add Menu Item';
  document.getElementById('btn-cancel-edit').style.display = 'none';
}

function startEdit(id) {
  const items = loadMenuItems();
  const item = items.find((i) => i.id === id);
  if (!item) return;

  editingId = id;
  document.getElementById('item-name').value = item.name;
  document.getElementById('item-price').value = item.price;
  document.getElementById('item-image').value = item.imageUrl.startsWith('data:') ? '' : item.imageUrl;

  const preview = document.getElementById('image-preview');
  preview.src = item.imageUrl;
  preview.style.display = 'block';

  document.getElementById('form-title').textContent = 'Edit Menu Item';
  document.getElementById('btn-cancel-edit').style.display = 'inline-flex';
}

function deleteItem(id) {
  const items = loadMenuItems();
  const item = items.find((i) => i.id === id);
  if (!item) return;
  if (!confirm(`Delete "${item.name}" from the menu?`)) return;

  saveMenu(items.filter((i) => i.id !== id));
  if (editingId === id) resetForm();
  renderAdminTable();
}

function handleImageFile(file) {
  if (!file || !file.type.startsWith('image/')) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    const preview = document.getElementById('image-preview');
    preview.src = e.target.result;
    preview.style.display = 'block';
    preview.dataset.base64 = e.target.result;
  };
  reader.readAsDataURL(file);
}

function getImageUrl() {
  const preview = document.getElementById('image-preview');
  if (preview.dataset.base64) return preview.dataset.base64;

  const urlInput = document.getElementById('item-image').value.trim();
  if (urlInput) return urlInput;

  if (preview.src && preview.style.display !== 'none') return preview.src;
  return '';
}

function saveMenuItem(e) {
  e.preventDefault();

  const name = document.getElementById('item-name').value.trim();
  const price = parseFloat(document.getElementById('item-price').value);
  const imageUrl = getImageUrl();

  if (!name || isNaN(price) || price < 0) {
    alert('Please enter a valid name and price.');
    return;
  }

  if (!imageUrl) {
    alert('Please provide an image URL or upload an image.');
    return;
  }

  const items = loadMenuItems();

  if (editingId) {
    const index = items.findIndex((i) => i.id === editingId);
    if (index !== -1) {
      items[index] = { id: editingId, name, price, imageUrl };
    }
  } else {
    items.push({
      id: generateId(),
      name,
      price,
      imageUrl,
    });
  }

  saveMenu(items);
  resetForm();
  renderAdminTable();
}

function initAdmin() {
  document.getElementById('menu-form').addEventListener('submit', saveMenuItem);
  document.getElementById('btn-cancel-edit').addEventListener('click', resetForm);

  document.getElementById('item-image').addEventListener('input', (e) => {
    const url = e.target.value.trim();
    const preview = document.getElementById('image-preview');
    delete preview.dataset.base64;
    if (url) {
      preview.src = url;
      preview.style.display = 'block';
    } else {
      preview.style.display = 'none';
    }
  });

  document.getElementById('item-file').addEventListener('change', (e) => {
    handleImageFile(e.target.files[0]);
  });

  renderAdminTable();
}
