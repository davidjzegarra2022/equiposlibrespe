const loginView = document.getElementById('loginView');
const dashboardView = document.getElementById('dashboardView');
const sessionActions = document.getElementById('sessionActions');

let catalog = { categories: [], products: [] };

function formatPrice(price) {
  return new Intl.NumberFormat('es-PE', { minimumFractionDigits: 0 }).format(price);
}

async function checkSession() {
  const res = await fetch('/api/auth/me');
  const data = await res.json();
  if (data.isAdmin) {
    showDashboard(data.username);
  } else {
    showLogin();
  }
}

function showLogin() {
  loginView.style.display = 'block';
  dashboardView.style.display = 'none';
  sessionActions.innerHTML = '';
}

async function showDashboard(username) {
  loginView.style.display = 'none';
  dashboardView.style.display = 'block';
  sessionActions.innerHTML = `
    <span style="color:var(--text-dim); font-size:0.85rem;">👤 ${username}</span>
    <button class="btn btn-ghost btn-sm" id="logoutBtn">Cerrar sesión</button>
  `;
  document.getElementById('logoutBtn').addEventListener('click', logout);
  await loadCatalog();
}

async function logout() {
  await fetch('/api/auth/logout', { method: 'POST' });
  showLogin();
}

document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;
  const errorEl = document.getElementById('loginError');
  errorEl.textContent = '';

  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      errorEl.textContent = data.error || 'No se pudo iniciar sesión.';
      return;
    }
    showDashboard(data.username);
  } catch (err) {
    errorEl.textContent = 'Error de conexión con el servidor.';
  }
});

async function loadCatalog() {
  const res = await fetch('/api/products');
  catalog = await res.json();
  populateCategoryFilter();
  renderTable();
}

function populateCategoryFilter() {
  const select = document.getElementById('adminCategoryFilter');
  select.innerHTML = '<option value="all">Todas las categorías</option>';
  catalog.categories.forEach((cat) => {
    const opt = document.createElement('option');
    opt.value = cat.id;
    opt.textContent = `${cat.icon} ${cat.name}`;
    select.appendChild(opt);
  });
}

function categoryName(id) {
  const cat = catalog.categories.find((c) => c.id === id);
  return cat ? `${cat.icon} ${cat.name}` : id;
}

function renderTable() {
  const tbody = document.getElementById('adminTableBody');
  const term = document.getElementById('adminSearch').value.trim().toLowerCase();
  const categoryFilter = document.getElementById('adminCategoryFilter').value;

  const rows = catalog.products.filter((p) => {
    const matchesCategory = categoryFilter === 'all' || p.categoryId === categoryFilter;
    const matchesTerm =
      !term || `${p.brand} ${p.name} ${p.specs}`.toLowerCase().includes(term);
    return matchesCategory && matchesTerm;
  });

  tbody.innerHTML = rows
    .map(
      (p) => `
    <tr data-id="${p.id}">
      <td>${categoryName(p.categoryId)}</td>
      <td><strong>${p.name}</strong><br /><span style="color:var(--text-dim); font-size:0.8rem;">${p.brand}</span></td>
      <td>${p.specs || '-'}</td>
      <td>
        <div class="price-input-group">
          <span>S/</span>
          <input type="number" min="0" step="1" value="${p.price}" data-role="price-input" />
          <button class="btn btn-primary btn-sm" data-role="save-price">Guardar</button>
          <span class="row-status" data-role="status"></span>
        </div>
      </td>
      <td>
        <label class="stock-toggle">
          <input type="checkbox" data-role="stock-toggle" ${p.stock ? 'checked' : ''} />
          En stock
        </label>
      </td>
      <td></td>
    </tr>
  `
    )
    .join('');

  tbody.querySelectorAll('tr').forEach((tr) => {
    const id = tr.dataset.id;
    tr.querySelector('[data-role="save-price"]').addEventListener('click', () =>
      savePrice(id, tr)
    );
    tr.querySelector('[data-role="stock-toggle"]').addEventListener('change', (e) =>
      saveStock(id, tr, e.target.checked)
    );
  });
}

async function savePrice(id, tr) {
  const input = tr.querySelector('[data-role="price-input"]');
  const status = tr.querySelector('[data-role="status"]');
  const price = Number(input.value);

  status.textContent = 'Guardando...';
  status.className = 'row-status saving';

  try {
    const res = await fetch(`/api/admin/products/${id}/price`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ price }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error al guardar');

    const product = catalog.products.find((p) => p.id === id);
    if (product) product.price = data.product.price;

    status.textContent = '✔ Guardado';
    status.className = 'row-status saved';
    setTimeout(() => (status.textContent = ''), 2000);
  } catch (err) {
    status.textContent = err.message;
    status.className = 'row-status error';
  }
}

async function saveStock(id, tr, stock) {
  const status = tr.querySelector('[data-role="status"]');
  try {
    const res = await fetch(`/api/admin/products/${id}/stock`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stock }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error al guardar');

    const product = catalog.products.find((p) => p.id === id);
    if (product) product.stock = data.product.stock;

    status.textContent = '✔ Actualizado';
    status.className = 'row-status saved';
    setTimeout(() => (status.textContent = ''), 2000);
  } catch (err) {
    status.textContent = err.message;
    status.className = 'row-status error';
  }
}

document.getElementById('adminSearch').addEventListener('input', renderTable);
document.getElementById('adminCategoryFilter').addEventListener('change', renderTable);

checkSession();
