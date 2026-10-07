// Main Application Logic for SQL Customer Analytics Dashboard

let state = {
  raw: [],
  filtered: [],
  charts: {},
  activeTab: 'dashboard',
  selectedQueryId: 1,
  queryResults: null,
  tablePage: 1,
  pageSize: 15,
  sortCol: null,
  sortAsc: true,
  activeCategoryLeaderboard: 'Clothing'
};

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
  if (typeof CUSTOMER_DATA !== 'undefined' && Array.isArray(CUSTOMER_DATA)) {
    state.raw = processRawData(CUSTOMER_DATA);
    state.filtered = [...state.raw];
    initDashboard();
  } else {
    showToast('Failed to load dataset. Please check customer_data.js');
  }
});

// Normalize raw CSV fields & calculate age groups
function processRawData(data) {
  // Determine age quantiles for exact age_group matching
  // Bins: <=31 (Young Adult), 32-44 (Adult), 45-57 (Middle_age), >57 (Senior)
  return data.map(item => {
    const age = Number(item['Age'] || item['age'] || 0);
    let age_group = 'Senior';
    if (age <= 31) age_group = 'Young Adult';
    else if (age <= 44) age_group = 'Adult';
    else if (age <= 57) age_group = 'Middle_age';

    const prevPurchases = Number(item['Previous Purchases'] || item['previous_purchases'] || 0);
    let segment = 'Loyal';
    if (prevPurchases === 1) segment = 'New';
    else if (prevPurchases >= 2 && prevPurchases <= 10) segment = 'Returning';

    return {
      customer_id: Number(item['Customer ID'] || item['customer_id']),
      age: age,
      gender: item['Gender'] || item['gender'],
      item_purchased: item['Item Purchased'] || item['item_purchased'],
      category: item['Category'] || item['category'],
      purchase_amount: Number(item['Purchase Amount (USD)'] || item['purchase_amount'] || 0),
      location: item['Location'] || item['location'],
      size: item['Size'] || item['size'],
      color: item['Color'] || item['color'],
      season: item['Season'] || item['season'],
      review_rating: Number(item['Review Rating'] || item['review_rating'] || 0),
      subscription_status: item['Subscription Status'] || item['subscription_status'],
      shipping_type: item['Shipping Type'] || item['shipping_type'],
      discount_applied: item['Discount Applied'] || item['discount_applied'],
      promo_code_used: item['Promo Code Used'] || item['promo_code_used'],
      previous_purchases: prevPurchases,
      payment_method: item['Payment Method'] || item['payment_method'],
      frequency_of_purchases: item['Frequency of Purchases'] || item['frequency_of_purchases'],
      age_group: age_group,
      customer_segment: segment
    };
  });
}

function initDashboard() {
  populateFilterDropdowns();
  setupEventListeners();
  applyFilters();
  renderQuerySelector();
  selectQuery(1);
}

// Populate Filter Dropdowns dynamically
function populateFilterDropdowns() {
  const categories = [...new Set(state.raw.map(d => d.category))].sort();
  const seasons = [...new Set(state.raw.map(d => d.season))].sort();
  
  const catSelect = document.getElementById('filter-category');
  categories.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c;
    opt.textContent = c;
    catSelect.appendChild(opt);
  });

  const seasonSelect = document.getElementById('filter-season');
  seasons.forEach(s => {
    const opt = document.createElement('option');
    opt.value = s;
    opt.textContent = s;
    seasonSelect.appendChild(opt);
  });
}

function setupEventListeners() {
  // Global Filters
  document.getElementById('filter-category').addEventListener('change', applyFilters);
  document.getElementById('filter-gender').addEventListener('change', applyFilters);
  document.getElementById('filter-subscription').addEventListener('change', applyFilters);
  document.getElementById('filter-season').addEventListener('change', applyFilters);
  document.getElementById('filter-discount').addEventListener('change', applyFilters);
  document.getElementById('btn-reset-filters').addEventListener('click', resetFilters);

  // Tab Navigation
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const tab = btn.getAttribute('data-tab');
      switchTab(tab);
    });
  });

  // Theme Toggle
  document.getElementById('btn-theme-toggle').addEventListener('click', toggleTheme);

  // Export Buttons
  document.getElementById('btn-export-csv').addEventListener('click', exportTableToCSV);

  // SQL Playground Controls
  document.getElementById('btn-run-query').addEventListener('click', runSelectedQuery);
  document.getElementById('btn-copy-sql').addEventListener('click', copySQLCode);

  // Search input for Table
  document.getElementById('table-search').addEventListener('input', () => {
    state.tablePage = 1;
    renderTable();
  });
}

function switchTab(tabName) {
  state.activeTab = tabName;
  document.getElementById('tab-dashboard').style.display = tabName === 'dashboard' ? 'block' : 'none';
  document.getElementById('tab-sql').style.display = tabName === 'sql' ? 'block' : 'none';
  
  if (tabName === 'dashboard') {
    renderCharts();
  }
}

function resetFilters() {
  document.getElementById('filter-category').value = 'All';
  document.getElementById('filter-gender').value = 'All';
  document.getElementById('filter-subscription').value = 'All';
  document.getElementById('filter-season').value = 'All';
  document.getElementById('filter-discount').value = 'All';
  applyFilters();
  showToast('Filters reset to default');
}

function applyFilters() {
  const cat = document.getElementById('filter-category').value;
  const gen = document.getElementById('filter-gender').value;
  const sub = document.getElementById('filter-subscription').value;
  const sea = document.getElementById('filter-season').value;
  const disc = document.getElementById('filter-discount').value;

  state.filtered = state.raw.filter(d => {
    if (cat !== 'All' && d.category !== cat) return false;
    if (gen !== 'All' && d.gender !== gen) return false;
    if (sub !== 'All' && d.subscription_status !== sub) return false;
    if (sea !== 'All' && d.season !== sea) return false;
    if (disc !== 'All' && d.discount_applied !== disc) return false;
    return true;
  });

  updateKPICards();
  renderCharts();
  runSelectedQuery();
}

// KPI Computation
function updateKPICards() {
  const data = state.filtered;
  const totalRev = data.reduce((sum, d) => sum + d.purchase_amount, 0);
  const totalCust = data.length;
  const avgSpend = totalCust > 0 ? (totalRev / totalCust) : 0;
  
  const discountCust = data.filter(d => d.discount_applied === 'Yes').length;
  const discountPct = totalCust > 0 ? ((discountCust / totalCust) * 100) : 0;

  const subCust = data.filter(d => d.subscription_status === 'Yes').length;
  const subPct = totalCust > 0 ? ((subCust / totalCust) * 100) : 0;

  const avgRating = totalCust > 0 ? (data.reduce((sum, d) => sum + d.review_rating, 0) / totalCust) : 0;

  document.getElementById('kpi-revenue').textContent = `$${totalRev.toLocaleString('en-US')}`;
  document.getElementById('kpi-customers').textContent = totalCust.toLocaleString('en-US');
  document.getElementById('kpi-avg-spend').textContent = `$${avgSpend.toFixed(2)}`;
  document.getElementById('kpi-discount-pct').textContent = `${discountPct.toFixed(1)}%`;
  document.getElementById('kpi-subscribers').textContent = `${subPct.toFixed(1)}%`;
  document.getElementById('kpi-rating').textContent = `${avgRating.toFixed(2)} ★`;
}

// -------------------------------------------------------------
// Chart Renderers corresponding directly to SQL Queries Q1 - Q10
// -------------------------------------------------------------
function renderCharts() {
  renderQ1GenderRevenueChart();
  renderQ3TopRatedChart();
  renderQ4ShippingChart();
  renderQ5SubscriptionChart();
  renderQ6DiscountRateWidget();
  renderQ7SegmentationWidget();
  renderQ8CategoryLeaderboardWidget();
  renderQ9RepeatBuyersChart();
  renderQ10AgeGroupChart();
}

// Q1: Revenue by Gender
function renderQ1GenderRevenueChart() {
  const ctx = document.getElementById('chart-q1-gender').getContext('2d');
  
  const genderRev = {};
  state.filtered.forEach(d => {
    genderRev[d.gender] = (genderRev[d.gender] || 0) + d.purchase_amount;
  });

  const labels = Object.keys(genderRev);
  const values = Object.values(genderRev);

  if (state.charts.q1) state.charts.q1.destroy();

  state.charts.q1 = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: labels,
      datasets: [{
        data: values,
        backgroundColor: ['#3b82f6', '#ec4899'],
        borderWidth: 2,
        borderColor: '#1e293b'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom', labels: { color: '#94a3b8', font: { family: 'Inter' } } },
        tooltip: {
          callbacks: {
            label: (ctx) => ` ${ctx.label}: $${ctx.raw.toLocaleString()}`
          }
        }
      },
      cutout: '70%'
    }
  });
}

// Q3: Top 5 Highest Rated Products
function renderQ3TopRatedChart() {
  const ctx = document.getElementById('chart-q3-rating').getContext('2d');

  const ratingMap = {};
  state.filtered.forEach(d => {
    if (!ratingMap[d.item_purchased]) ratingMap[d.item_purchased] = { sum: 0, count: 0 };
    ratingMap[d.item_purchased].sum += d.review_rating;
    ratingMap[d.item_purchased].count += 1;
  });

  const sorted = Object.keys(ratingMap).map(item => ({
    item,
    avg: ratingMap[item].count > 0 ? (ratingMap[item].sum / ratingMap[item].count) : 0
  })).sort((a, b) => b.avg - a.avg).slice(0, 5);

  if (state.charts.q3) state.charts.q3.destroy();

  state.charts.q3 = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: sorted.map(s => s.item),
      datasets: [{
        label: 'Average Review Rating',
        data: sorted.map(s => Number(s.avg.toFixed(2))),
        backgroundColor: 'rgba(99, 102, 241, 0.85)',
        borderColor: '#6366f1',
        borderRadius: 6
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: (ctx) => ` Rating: ${ctx.raw} ★` } }
      },
      scales: {
        x: { min: 3.0, max: 5.0, grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } },
        y: { grid: { display: false }, ticks: { color: '#f8fafc', font: { weight: '600' } } }
      }
    }
  });
}

// Q4: Shipping Spend Comparison
function renderQ4ShippingChart() {
  const ctx = document.getElementById('chart-q4-shipping').getContext('2d');

  const shipMap = {};
  state.filtered.forEach(d => {
    if (!shipMap[d.shipping_type]) shipMap[d.shipping_type] = { sum: 0, count: 0 };
    shipMap[d.shipping_type].sum += d.purchase_amount;
    shipMap[d.shipping_type].count += 1;
  });

  const labels = Object.keys(shipMap);
  const values = labels.map(l => (shipMap[l].sum / shipMap[l].count).toFixed(2));

  if (state.charts.q4) state.charts.q4.destroy();

  state.charts.q4 = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Avg Spend ($)',
        data: values,
        backgroundColor: ['#06b6d4', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899', '#6366f1'],
        borderRadius: 8
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } },
        x: { grid: { display: false }, ticks: { color: '#f8fafc' } }
      }
    }
  });
}

// Q5: Subscriber vs Non-Subscriber Value
function renderQ5SubscriptionChart() {
  const ctx = document.getElementById('chart-q5-subscription').getContext('2d');

  const subData = { Yes: { count: 0, sum: 0 }, No: { count: 0, sum: 0 } };
  state.filtered.forEach(d => {
    if (subData[d.subscription_status]) {
      subData[d.subscription_status].count += 1;
      subData[d.subscription_status].sum += d.purchase_amount;
    }
  });

  const labels = ['Subscribed', 'Non-Subscribed'];
  const totalRev = [subData.Yes.sum, subData.No.sum];
  const avgSpend = [
    subData.Yes.count > 0 ? (subData.Yes.sum / subData.Yes.count).toFixed(2) : 0,
    subData.No.count > 0 ? (subData.No.sum / subData.No.count).toFixed(2) : 0
  ];

  if (state.charts.q5) state.charts.q5.destroy();

  state.charts.q5 = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Total Revenue ($)',
          data: totalRev,
          backgroundColor: '#6366f1',
          yAxisID: 'y'
        },
        {
          label: 'Avg Order Value ($)',
          data: avgSpend,
          backgroundColor: '#10b981',
          yAxisID: 'y1'
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'top', labels: { color: '#94a3b8' } }
      },
      scales: {
        y: { type: 'linear', position: 'left', grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } },
        y1: { type: 'linear', position: 'right', grid: { display: false }, ticks: { color: '#10b981' } },
        x: { ticks: { color: '#f8fafc' } }
      }
    }
  });
}

// Q6: Top 5 Products by Discount Rate %
function renderQ6DiscountRateWidget() {
  const itemMap = {};
  state.filtered.forEach(d => {
    if (!itemMap[d.item_purchased]) itemMap[d.item_purchased] = { total: 0, discount: 0 };
    itemMap[d.item_purchased].total += 1;
    if (d.discount_applied === 'Yes') itemMap[d.item_purchased].discount += 1;
  });

  const sorted = Object.keys(itemMap).map(item => ({
    item,
    rate: itemMap[item].total > 0 ? ((itemMap[item].discount / itemMap[item].total) * 100).toFixed(2) : 0
  })).sort((a, b) => b.rate - a.rate).slice(0, 5);

  const container = document.getElementById('widget-q6-discount');
  container.innerHTML = sorted.map(s => `
    <div class="progress-item">
      <div class="progress-label-row">
        <span>${s.item}</span>
        <span style="color: var(--accent-cyan); font-family: var(--font-mono);">${s.rate}%</span>
      </div>
      <div class="progress-track">
        <div class="progress-fill" style="width: ${s.rate}%;"></div>
      </div>
    </div>
  `).join('');
}

// Q7: Customer Segmentation (New / Returning / Loyal)
function renderQ7SegmentationWidget() {
  const counts = { New: 0, Returning: 0, Loyal: 0 };
  state.filtered.forEach(d => {
    if (counts[d.customer_segment] !== undefined) counts[d.customer_segment] += 1;
  });

  const total = state.filtered.length || 1;

  document.getElementById('seg-new-count').textContent = counts.New.toLocaleString();
  document.getElementById('seg-new-pct').textContent = `${((counts.New / total) * 100).toFixed(1)}% of total`;

  document.getElementById('seg-ret-count').textContent = counts.Returning.toLocaleString();
  document.getElementById('seg-ret-pct').textContent = `${((counts.Returning / total) * 100).toFixed(1)}% of total`;

  document.getElementById('seg-loyal-count').textContent = counts.Loyal.toLocaleString();
  document.getElementById('seg-loyal-pct').textContent = `${((counts.Loyal / total) * 100).toFixed(1)}% of total`;
}

// Q8: Top 3 Products per Category Leaderboard
function renderQ8CategoryLeaderboardWidget() {
  const categories = ['Clothing', 'Accessories', 'Footwear', 'Outerwear'];
  
  const tabContainer = document.getElementById('q8-cat-tabs');
  tabContainer.innerHTML = categories.map(cat => `
    <button class="cat-tab ${cat === state.activeCategoryLeaderboard ? 'active' : ''}" onclick="selectCategoryTab('${cat}')">${cat}</button>
  `).join('');

  renderLeaderboardItems(state.activeCategoryLeaderboard);
}

function selectCategoryTab(cat) {
  state.activeCategoryLeaderboard = cat;
  renderQ8CategoryLeaderboardWidget();
}

function renderLeaderboardItems(category) {
  const itemCounts = {};
  state.filtered.filter(d => d.category === category).forEach(d => {
    itemCounts[d.item_purchased] = (itemCounts[d.item_purchased] || 0) + 1;
  });

  const sorted = Object.keys(itemCounts).map(item => ({
    item,
    count: itemCounts[item]
  })).sort((a, b) => b.count - a.count).slice(0, 3);

  const container = document.getElementById('q8-leaderboard-list');
  container.innerHTML = sorted.map((s, idx) => `
    <div class="leader-item">
      <div class="leader-rank">${idx + 1}</div>
      <div class="leader-name">${s.item}</div>
      <div class="leader-orders">${s.count} orders</div>
    </div>
  `).join('');
}

// Q9: Repeat Buyers Subscription Status
function renderQ9RepeatBuyersChart() {
  const ctx = document.getElementById('chart-q9-repeat').getContext('2d');

  const repeatBuyers = state.filtered.filter(d => d.previous_purchases > 5);
  const subCounts = { Subscribed: 0, 'Non-Subscribed': 0 };

  repeatBuyers.forEach(d => {
    if (d.subscription_status === 'Yes') subCounts.Subscribed += 1;
    else subCounts['Non-Subscribed'] += 1;
  });

  if (state.charts.q9) state.charts.q9.destroy();

  state.charts.q9 = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: ['Subscribed (>5 Purchases)', 'Non-Subscribed (>5 Purchases)'],
      datasets: [{
        data: [subCounts.Subscribed, subCounts['Non-Subscribed']],
        backgroundColor: ['#10b981', '#f59e0b'],
        borderWidth: 2,
        borderColor: '#1e293b'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom', labels: { color: '#94a3b8' } }
      }
    }
  });
}

// Q10: Age Group Revenue
function renderQ10AgeGroupChart() {
  const ctx = document.getElementById('chart-q10-age').getContext('2d');

  const ageRev = { 'Young Adult': 0, 'Adult': 0, 'Middle_age': 0, 'Senior': 0 };
  state.filtered.forEach(d => {
    if (ageRev[d.age_group] !== undefined) {
      ageRev[d.age_group] += d.purchase_amount;
    }
  });

  const labels = ['Young Adult (18-31)', 'Adult (32-44)', 'Middle_age (45-57)', 'Senior (58-70)'];
  const values = [ageRev['Young Adult'], ageRev['Adult'], ageRev['Middle_age'], ageRev['Senior']];

  if (state.charts.q10) state.charts.q10.destroy();

  state.charts.q10 = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Total Revenue ($)',
        data: values,
        backgroundColor: ['#ec4899', '#8b5cf6', '#3b82f6', '#06b6d4'],
        borderRadius: 8
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } },
        x: { grid: { display: false }, ticks: { color: '#f8fafc' } }
      }
    }
  });
}

// -------------------------------------------------------------
// Interactive SQL Query Explorer & Runner
// -------------------------------------------------------------
function renderQuerySelector() {
  const list = document.getElementById('query-list');
  list.innerHTML = SQL_QUERIES.map(q => `
    <div class="query-item ${q.id === state.selectedQueryId ? 'active' : ''}" onclick="selectQuery(${q.id})">
      <div class="q-title">${q.title}</div>
      <div class="q-cat">${q.category}</div>
    </div>
  `).join('');
}

function selectQuery(id) {
  state.selectedQueryId = id;
  renderQuerySelector();

  const query = SQL_QUERIES.find(q => q.id === id);
  if (!query) return;

  document.getElementById('sql-code-display').textContent = query.sql;
  document.getElementById('sql-query-title').textContent = query.title;
  document.getElementById('sql-query-desc').textContent = `${query.question} — ${query.description}`;

  runSelectedQuery();
}

function copySQLCode() {
  const code = document.getElementById('sql-code-display').textContent;
  navigator.clipboard.writeText(code);
  showToast('SQL code copied to clipboard!');
}

function runSelectedQuery() {
  const startTime = performance.now();
  const query = SQL_QUERIES.find(q => q.id === state.selectedQueryId);
  if (!query) return;

  let results = [];
  const dataset = state.filtered;

  // Execute JavaScript analytical engine equivalent to the SQL Query
  switch (query.id) {
    case 1: // Revenue by Gender
      const q1Map = {};
      dataset.forEach(d => { q1Map[d.gender] = (q1Map[d.gender] || 0) + d.purchase_amount; });
      results = Object.keys(q1Map).map(g => ({ gender: g, revenue: q1Map[g] }));
      break;

    case 2: // Discount Applied & Purchase Amount >= AVG(Purchase Amount)
      const avgPurchase = dataset.length > 0 ? (dataset.reduce((s, d) => s + d.purchase_amount, 0) / dataset.length) : 0;
      results = dataset
        .filter(d => d.discount_applied === 'Yes' && d.purchase_amount >= avgPurchase)
        .map(d => ({ customer_id: d.customer_id, purchase_amount: d.purchase_amount, category: d.category, item_purchased: d.item_purchased }));
      break;

    case 3: // Top 5 products by review_rating
      const q3Map = {};
      dataset.forEach(d => {
        if (!q3Map[d.item_purchased]) q3Map[d.item_purchased] = { sum: 0, count: 0 };
        q3Map[d.item_purchased].sum += d.review_rating;
        q3Map[d.item_purchased].count += 1;
      });
      results = Object.keys(q3Map)
        .map(item => ({ item_purchased: item, avg_rating: Number((q3Map[item].sum / q3Map[item].count).toFixed(2)) }))
        .sort((a, b) => b.avg_rating - a.avg_rating)
        .slice(0, 5);
      break;

    case 4: // Standard vs Express Shipping
      const q4Map = {};
      dataset.filter(d => ['Standard', 'Express'].includes(d.shipping_type)).forEach(d => {
        if (!q4Map[d.shipping_type]) q4Map[d.shipping_type] = { sum: 0, count: 0 };
        q4Map[d.shipping_type].sum += d.purchase_amount;
        q4Map[d.shipping_type].count += 1;
      });
      results = Object.keys(q4Map).map(st => ({ shipping_type: st, avg_purchase_amount: Number((q4Map[st].sum / q4Map[st].count).toFixed(2)) }));
      break;

    case 5: // Subscriber Spend & Revenue
      const q5Map = {};
      dataset.forEach(d => {
        const s = d.subscription_status;
        if (!q5Map[s]) q5Map[s] = { total_customers: 0, total_revenue: 0 };
        q5Map[s].total_customers += 1;
        q5Map[s].total_revenue += d.purchase_amount;
      });
      results = Object.keys(q5Map)
        .map(s => ({
          subscription_status: s,
          total_customers: q5Map[s].total_customers,
          avg_spend: Number((q5Map[s].total_revenue / q5Map[s].total_customers).toFixed(2)),
          total_revenue: q5Map[s].total_revenue
        }))
        .sort((a, b) => b.total_revenue - a.total_revenue || b.avg_spend - a.avg_spend);
      break;

    case 6: // Top 5 products by discount rate
      const q6Map = {};
      dataset.forEach(d => {
        if (!q6Map[d.item_purchased]) q6Map[d.item_purchased] = { total: 0, discount: 0 };
        q6Map[d.item_purchased].total += 1;
        if (d.discount_applied === 'Yes') q6Map[d.item_purchased].discount += 1;
      });
      results = Object.keys(q6Map)
        .map(item => ({
          item_purchased: item,
          discount_rate: Number((100.0 * q6Map[item].discount / q6Map[item].total).toFixed(2))
        }))
        .sort((a, b) => b.discount_rate - a.discount_rate)
        .slice(0, 5);
      break;

    case 7: // Customer Segmentation
      const q7Map = { New: 0, Returning: 0, Loyal: 0 };
      dataset.forEach(d => { q7Map[d.customer_segment] += 1; });
      results = Object.keys(q7Map).map(seg => ({ customer_segment: seg, number_of_customers: q7Map[seg] }));
      break;

    case 8: // Top 3 Products per Category
      const q8Map = {};
      dataset.forEach(d => {
        const key = `${d.category}|||${d.item_purchased}`;
        if (!q8Map[key]) q8Map[key] = { category: d.category, item_purchased: d.item_purchased, total_orders: 0 };
        q8Map[key].total_orders += 1;
      });

      const grouped = {};
      Object.values(q8Map).forEach(row => {
        if (!grouped[row.category]) grouped[row.category] = [];
        grouped[row.category].push(row);
      });

      results = [];
      Object.keys(grouped).forEach(cat => {
        const top3 = grouped[cat].sort((a, b) => b.total_orders - a.total_orders).slice(0, 3);
        top3.forEach((item, idx) => {
          results.push({ item_rank: idx + 1, category: cat, item_purchased: item.item_purchased, total_orders: item.total_orders });
        });
      });
      break;

    case 9: // Repeat buyers subscription status
      const q9Map = { Yes: 0, No: 0 };
      dataset.filter(d => d.previous_purchases > 5).forEach(d => {
        q9Map[d.subscription_status] = (q9Map[d.subscription_status] || 0) + 1;
      });
      results = Object.keys(q9Map).map(s => ({ subscription_status: s, repeat_buyers: q9Map[s] }));
      break;

    case 10: // Revenue by Age Group
      const q10Map = {};
      dataset.forEach(d => {
        q10Map[d.age_group] = (q10Map[d.age_group] || 0) + d.purchase_amount;
      });
      results = Object.keys(q10Map)
        .map(ag => ({ age_group: ag, total_revenue: q10Map[ag] }))
        .sort((a, b) => b.total_revenue - a.total_revenue);
      break;

    default:
      results = dataset;
  }

  const duration = (performance.now() - startTime).toFixed(2);
  state.queryResults = results;
  state.tablePage = 1;

  document.getElementById('query-exec-time').textContent = `Execution time: ${duration} ms | ${results.length} records returned`;

  renderTable();
}

// Data Table Rendering with Sorting & Pagination
function renderTable() {
  let data = [...(state.queryResults || [])];

  // Search Filter
  const query = document.getElementById('table-search').value.toLowerCase();
  if (query) {
    data = data.filter(row => JSON.stringify(row).toLowerCase().includes(query));
  }

  // Column Sort
  if (state.sortCol) {
    data.sort((a, b) => {
      let valA = a[state.sortCol];
      let valB = b[state.sortCol];
      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();
      if (valA < valB) return state.sortAsc ? -1 : 1;
      if (valA > valB) return state.sortAsc ? 1 : -1;
      return 0;
    });
  }

  // Pagination
  const total = data.length;
  const startIdx = (state.tablePage - 1) * state.pageSize;
  const paginated = data.slice(startIdx, startIdx + state.pageSize);

  const tableHead = document.getElementById('table-head');
  const tableBody = document.getElementById('table-body');

  if (data.length === 0) {
    tableHead.innerHTML = '';
    tableBody.innerHTML = `<tr><td colspan="10" style="text-align: center; padding: 2rem; color: var(--text-muted);">No records found matching criteria.</td></tr>`;
    document.getElementById('pagination-info').textContent = 'Showing 0 records';
    return;
  }

  const columns = Object.keys(data[0]);

  // Render Th
  tableHead.innerHTML = `
    <tr>
      ${columns.map(col => `
        <th onclick="sortTable('${col}')">
          ${col.replace(/_/g, ' ')}
          ${state.sortCol === col ? (state.sortAsc ? '▲' : '▼') : ''}
        </th>
      `).join('')}
    </tr>
  `;

  // Render Td
  tableBody.innerHTML = paginated.map(row => `
    <tr>
      ${columns.map(col => {
        let val = row[col];
        if (typeof val === 'number' && col.includes('revenue') || col.includes('amount') || col.includes('spend')) {
          val = `$${val.toLocaleString()}`;
        }
        return `<td>${val}</td>`;
      }).join('')}
    </tr>
  `).join('');

  // Pagination Text & Controls
  const endIdx = Math.min(startIdx + state.pageSize, total);
  document.getElementById('pagination-info').textContent = `Showing ${startIdx + 1} to ${endIdx} of ${total} records`;

  const totalPages = Math.ceil(total / state.pageSize) || 1;
  const pageBtns = document.getElementById('pagination-buttons');
  pageBtns.innerHTML = `
    <button class="btn" ${state.tablePage === 1 ? 'disabled' : ''} onclick="changePage(-1)">Previous</button>
    <span style="align-self: center; font-weight: 600;">Page ${state.tablePage} of ${totalPages}</span>
    <button class="btn" ${state.tablePage >= totalPages ? 'disabled' : ''} onclick="changePage(1)">Next</button>
  `;
}

function sortTable(col) {
  if (state.sortCol === col) {
    state.sortAsc = !state.sortAsc;
  } else {
    state.sortCol = col;
    state.sortAsc = true;
  }
  renderTable();
}

function changePage(delta) {
  state.tablePage += delta;
  renderTable();
}

// CSV Exporter
function exportTableToCSV() {
  const data = state.queryResults;
  if (!data || data.length === 0) {
    showToast('No query data available to export.');
    return;
  }

  const keys = Object.keys(data[0]);
  let csvContent = keys.join(',') + '\n';

  data.forEach(row => {
    const line = keys.map(k => `"${row[k]}"`).join(',');
    csvContent += line + '\n';
  });

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `customer_sql_query_${state.selectedQueryId}_results.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  showToast(`Exported Query ${state.selectedQueryId} results to CSV!`);
}

// Theme Toggle
function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', newTheme);
  
  const icon = document.getElementById('theme-icon');
  icon.className = newTheme === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
  
  showToast(`Switched to ${newTheme} mode`);
  renderCharts();
}

// Toast Helper
function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}
