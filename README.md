# Customer SQL Analytics Dashboard

An interactive end-to-end data analytics and business intelligence solution for analyzing customer shopping behavior, revenue drivers, subscription ROI, product rankings, and demographic segments using PostgreSQL/SQL and a web-based visualization workbench.

---

## 🚀 Quick Start & How to Run

### Option 1: Live Local Web Server (Recommended)

1. Open your terminal in the project root directory:
   ```bash
   npx serve -p 3000
   # or
   python -m http.server 3000
   ```
2. Open your web browser and navigate to:
   ```
   http://localhost:3000
   ```

### Option 2: Direct File Access
Simply double-click [`index.html`](file:///c:/Users/Admin/Documents/New%20folder/SQL/index.html) or open it directly in any modern browser (Chrome, Firefox, Edge, Safari).

---

## 📁 Project Structure

```
SQL/
├── Customer_behaviour/
│   └── customer_shopping_behavior.csv  # Raw dataset (3,900 customer records)
├── customer.sql                        # Production SQL queries & analytics scripts
├── sql_queries.js                      # SQL query definitions & metadata for dashboard
├── customer_data.js                    # In-memory customer dataset & query engine
├── app.js                              # Web dashboard application logic & Chart.js rendering
├── index.html                          # Dashboard user interface HTML
├── styles.css                          # Custom CSS styling (Dark/Light mode support)
└── README.md                           # Documentation & Project Guide
```

---

## 💾 Dataset Details

* **Source File**: [`Customer_behaviour/customer_shopping_behavior.csv`](file:///c:/Users/Admin/Documents/New%20folder/SQL/Customer_behaviour/customer_shopping_behavior.csv)
* **Total Records**: 3,900 customer transactions
* **Features / Columns**:
  1. `Customer ID`: Unique customer identifier (1 to 3900)
  2. `Age`: Customer age (18 to 70)
  3. `Gender`: `Male` (2,652 / 68%) or `Female` (1,248 / 32%)
  4. `Item Purchased`: Specific product title (e.g., Blouse, Sweater, Jeans, Sandals, Coat)
  5. `Category`: Product category (`Clothing`, `Accessories`, `Footwear`, `Outerwear`)
  6. `Purchase Amount (USD)`: Order transaction value ($20 to $100)
  7. `Location`: US state location
  8. `Size`: Item size (`S`, `M`, `L`, `XL`)
  9. `Color`: Product color variation
  10. `Season`: Season of transaction (`Spring`, `Summer`, `Fall`, `Winter`)
  11. `Review Rating`: Rating score (2.5 to 5.0)
  12. `Subscription Status`: Active membership status (`Yes` / `No`)
  13. `Shipping Type`: Shipping method (`Standard`, `Express`, `Free Shipping`, `Next Day Air`, `2-Day Shipping`, `Store Pickup`)
  14. `Discount Applied`: Promo/discount code used (`Yes` / `No`)
  15. `Promo Code Used`: Discount verification
  16. `Previous Purchases`: Historical order count (1 to 50)
  17. `Payment Method`: Preferred payment method (`Credit Card`, `PayPal`, `Venmo`, `Debit Card`, `Cash`, `Bank Transfer`)
  18. `Frequency of Purchases`: Order frequency (`Weekly`, `Bi-Weekly`, `Fortnightly`, `Monthly`, `Quarterly`, `Every 3 Months`, `Annually`)

---

## 🔍 Key Business Insights & SQL Queries

The file [`customer.sql`](file:///c:/Users/Admin/Documents/New%20folder/SQL/customer.sql) contains 10 key SQL analytical queries addressing vital ecommerce business questions:

| Query ID | Title | Business Question | SQL Techniques Used |
| :---: | :--- | :--- | :--- |
| **Q0** | Table DDL & CSV Copy | Define PostgreSQL schema and CSV import instructions | `CREATE TABLE`, `COPY FROM CSV` |
| **Q1** | Revenue by Gender | Revenue split between Male & Female customers | `SUM`, `GROUP BY`, `ORDER BY` |
| **Q2** | Discounted High-Spenders | Discount users spending above overall average | Subquery `WHERE ... >= (SELECT AVG)` |
| **Q3** | Top 5 Product Ratings | Highest average customer review ratings | `ROUND`, `AVG`, `ORDER BY DESC LIMIT` |
| **Q4** | Shipping Method Comparison | Average order size: Standard vs Express | `AVG`, `WHERE IN ('Standard', 'Express')` |
| **Q5** | Subscription Status ROI | Compare order count, avg spend & gross revenue by subscription | `COUNT`, `ROUND(AVG)`, `SUM`, `GROUP BY` |
| **Q6** | Top Products by Discount Rate | Products most dependent on discounts | `CASE WHEN`, `COUNT(*)`, Percentage Calculation |
| **Q7** | Customer Segmentation | Classify customers into `New` (1), `Returning` (2-10), and `Loyal` (>10) | CTE (`WITH`), `CASE WHEN`, `BETWEEN` |
| **Q8** | Top 3 Items per Category | Ranking category leaders | Window Function (`ROW_NUMBER() OVER PARTITION`) |
| **Q9** | Repeat Buyer Subscription Rate | Subscription rate among high-frequency buyers (>5 orders) | Window Aggregation `SUM() OVER ()` |
| **Q10** | Revenue by Age Group | Revenue distribution across demographic cohorts | CTE Age Binning (`CASE WHEN`), `SUM`, `GROUP BY` |

---

## 📊 Key Findings & Metrics Summary

* **Total Revenue**: ~$233,081 USD
* **Average Order Value**: ~$59.76 USD
* **Overall Subscription Rate**: **27.00%** (1,053 / 3,900 customers)
* **Gender Subscription Breakdown**:
  * **Male Customers**: 2,652 total | 1,053 subscribers (**39.71% subscriber rate**)
  * **Female Customers**: 1,248 total | 0 subscribers (**0.00% subscriber rate**)
  * *Note: 100% of all current subscribers in this dataset are Male.*

---

## 💻 Dashboard Features

1. **Interactive Query Workbench**: Select and run any of the 10 SQL analytical queries dynamically.
2. **SQL Code Viewer & Copy Tool**: View clean syntax-highlighted SQL statements with instant copy capability.
3. **Dynamic Visual Charts**: Real-time Chart.js interactive visualizations for metrics and distributions.
4. **Interactive Data Grid**: Full tabular output with instant live text search, sorting, and pagination.
5. **CSV Export**: Export processed query result sets directly to `.csv` format.
6. **Dark / Light Theme Toggle**: Seamless UI theme switching with persistent state.

---

## 🛠️ Tech Stack

* **SQL Dialect**: PostgreSQL compatible
* **Frontend UI**: Standard HTML5, Modern Vanilla CSS (CSS Variables, Flexbox/Grid, Glassmorphism)
* **Logic & Data Engine**: JavaScript (ES6+)
* **Visualization Library**: Chart.js 4.x
* **Iconography & Fonts**: FontAwesome 6, Google Fonts (Inter & JetBrains Mono)