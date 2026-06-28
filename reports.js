function getWeekKey(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  const yearStart = new Date(d.getFullYear(), 0, 1);
  const weekNo = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  return `${d.getFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}

function getWeekLabel(key) {
  const [year, weekPart] = key.split('-W');
  return `Week ${weekPart}, ${year}`;
}

function getMonthKey(date) {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function getMonthLabel(key) {
  const [year, month] = key.split('-');
  const date = new Date(year, parseInt(month, 10) - 1, 1);
  return date.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
}

function filterOrders(orders, filter) {
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - ((now.getDay() + 6) % 7));
  startOfWeek.setHours(0, 0, 0, 0);

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  return orders.filter((order) => {
    const date = new Date(order.paidAt);
    if (filter === 'week') return date >= startOfWeek;
    if (filter === 'month') return date >= startOfMonth;
    return true;
  });
}

function aggregateByKey(orders, keyFn, labelFn) {
  const map = {};

  orders.forEach((order) => {
    const key = keyFn(order.paidAt);
    if (!map[key]) {
      map[key] = { key, label: labelFn(key), orders: 0, revenue: 0 };
    }
    map[key].orders += 1;
    map[key].revenue += order.total;
  });

  return Object.values(map).sort((a, b) => b.key.localeCompare(a.key));
}

let weeklyChart = null;
let monthlyChart = null;
let currentFilter = 'all';

function renderStats(orders) {
  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const totalOrders = orders.length;
  const avgOrder = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  document.getElementById('stat-revenue').textContent = formatCurrency(totalRevenue);
  document.getElementById('stat-orders').textContent = totalOrders;
  document.getElementById('stat-avg').textContent = formatCurrency(avgOrder);
}

function renderTable(tableId, rows, emptyMsg) {
  const tbody = document.getElementById(tableId);
  if (rows.length === 0) {
    tbody.innerHTML = `<tr><td colspan="3" class="empty-state">${emptyMsg}</td></tr>`;
    return;
  }

  tbody.innerHTML = rows
    .map(
      (row) => `
    <tr>
      <td>${escapeHtml(row.label)}</td>
      <td>${row.orders}</td>
      <td>${formatCurrency(row.revenue)}</td>
    </tr>`
    )
    .join('');
}

function renderChart(canvasId, chartRef, labels, data, label) {
  const canvas = document.getElementById(canvasId);
  if (!canvas || typeof Chart === 'undefined') return chartRef;

  if (chartRef) chartRef.destroy();

  return new Chart(canvas, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label,
          data,
          backgroundColor: 'rgba(139, 69, 19, 0.7)',
          borderColor: '#8b4513',
          borderWidth: 1,
          borderRadius: 6,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: (value) => `${BAKERY_CONFIG.currency}${value}`,
          },
        },
      },
    },
  });
}

function renderReports() {
  const allOrders = getOrders();
  const orders = filterOrders(allOrders, currentFilter);

  renderStats(orders);

  const weekly = aggregateByKey(orders, getWeekKey, getWeekLabel);
  const monthly = aggregateByKey(orders, getMonthKey, getMonthLabel);

  renderTable('weekly-table-body', weekly, 'No sales data for this period.');
  renderTable('monthly-table-body', monthly, 'No sales data for this period.');

  weeklyChart = renderChart(
    'weekly-chart',
    weeklyChart,
    weekly.map((r) => r.label).reverse(),
    weekly.map((r) => r.revenue).reverse(),
    'Weekly Revenue'
  );

  monthlyChart = renderChart(
    'monthly-chart',
    monthlyChart,
    monthly.map((r) => r.label).reverse(),
    monthly.map((r) => r.revenue).reverse(),
    'Monthly Revenue'
  );
}

function initReports() {
  document.querySelectorAll('.report-filters .btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.report-filters .btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.dataset.filter;
      renderReports();
    });
  });

  renderReports();
}
