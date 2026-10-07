# 📋 Customer Shopping Behavior — Detailed Project Report

**Project Title:** Customer Shopping Behavior Analytics Dashboard
**Repository:** [github.com/paulmoumita248-lang/Coustomer-Treand-Analisys](https://github.com/paulmoumita248-lang/Coustomer-Treand-Analisys)
**Report Date:** October 2026
**Author:** paulmoumita248-lang

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Project Objectives](#2-project-objectives)
3. [Dataset Overview](#3-dataset-overview)
4. [Methodology & Tools](#4-methodology--tools)
5. [SQL Query Analysis & Findings](#5-sql-query-analysis--findings)
6. [Key Business Insights](#6-key-business-insights)
7. [Technical Architecture](#7-technical-architecture)
8. [Dashboard Features](#8-dashboard-features)
9. [Limitations & Data Quality Notes](#9-limitations--data-quality-notes)
10. [Conclusions & Recommendations](#10-conclusions--recommendations)

---

## 1. Executive Summary

This project delivers an end-to-end **Customer Shopping Behavior Analytics** solution built on a dataset of **3,900 real-world retail customer transactions** from a US-based ecommerce platform. The goal was to extract actionable business intelligence using **SQL analytics**, and present findings via an **interactive web-based dashboard**.

### Key Metrics at a Glance

| Metric | Value |
|:---|:---|
| Total Customers | **3,900** |
| Total Revenue | **$233,081 USD** |
| Average Order Value | **$59.76 USD** |
| Revenue Range | **$20 – $100 per transaction** |
| Overall Subscription Rate | **27.00%** (1,053 customers) |
| Male Subscriber Rate | **39.71%** |
| Female Subscriber Rate | **0.00%** |
| Top Category | **Clothing** (1,737 orders / 44.5%) |
| Most Used Payment Method | **PayPal** (677 customers) |
| Most Common Purchase Frequency | **Every 3 Months** (584 customers) |

---

## 2. Project Objectives

1. **Understand revenue drivers** — which gender, age group, and product category generates the most revenue.
2. **Evaluate subscription program ROI** — whether subscribers spend more than non-subscribers.
3. **Analyze discount effectiveness** — which products rely most heavily on promotions.
4. **Classify the customer lifecycle** — segment customers as New, Returning, or Loyal.
5. **Evaluate shipping method preferences** — impact of shipping type on spending behavior.
6. **Identify top-performing products** — by purchase volume and customer rating.
7. **Build an interactive analytics dashboard** — enabling real-time query execution and chart visualization.

---

## 3. Dataset Overview

- **Filename:** `customer_shopping_behavior.csv`
- **Total Records:** 3,900 customer transactions
- **Total Features:** 18 columns

### 3.1 Feature Dictionary

| # | Column | Description | Sample Values |
|:---:|:---|:---|:---|
| 1 | `Customer ID` | Unique customer identifier | 1 – 3900 |
| 2 | `Age` | Customer age in years | 18 – 70 (Mean: **44.07**, Std: **15.21**) |
| 3 | `Gender` | Customer gender | Male (68%), Female (32%) |
| 4 | `Item Purchased` | Product name | Blouse, Pants, Coat, Jewelry, Sandals… |
| 5 | `Category` | Product category | Clothing, Accessories, Footwear, Outerwear |
| 6 | `Purchase Amount (USD)` | Order value in USD | $20 – $100 |
| 7 | `Location` | US state | Kentucky, Maine, California… |
| 8 | `Size` | Product size | S, M, L, XL |
| 9 | `Color` | Product color | Gray, Maroon, Teal, Black… |
| 10 | `Season` | Season of purchase | Spring, Summer, Fall, Winter |
| 11 | `Review Rating` | Customer review score | 2.5 – 5.0 |
| 12 | `Subscription Status` | Active membership | Yes (27%), No (73%) |
| 13 | `Shipping Type` | Delivery method | Standard, Express, Free Shipping, Next Day Air, 2-Day, Store Pickup |
| 14 | `Discount Applied` | Promo discount used | Yes (43%), No (57%) |
| 15 | `Promo Code Used` | Promo code applied | Yes / No |
| 16 | `Previous Purchases` | Historical order count | 1 – 50 |
| 17 | `Payment Method` | Payment method used | Credit Card, PayPal, Venmo, Debit Card, Cash, Bank Transfer |
| 18 | `Frequency of Purchases` | Purchase frequency | Weekly, Monthly, Annually, Every 3 Months… |

### 3.2 Gender & Age Distribution

| Gender | Count | Percentage |
|:---|:---:|:---:|
| Male | 2,652 | **68.0%** |
| Female | 1,248 | **32.0%** |

| Age Group | Customers | Revenue | Avg Spend |
|:---|:---:|:---:|:---:|
| Young Adult (18–31) | 1,028 | $62,143 | $60.45 |
| Adult (32–44) | 942 | $55,978 | $59.42 |
| Middle-Aged (45–57) | 986 | $59,197 | $60.04 |
| Senior (58+) | 944 | $55,763 | $59.07 |

### 3.3 Category Distribution

| Category | Orders | Share |
|:---|:---:|:---:|
| Clothing | 1,737 | **44.5%** |
| Accessories | 1,240 | **31.8%** |
| Footwear | 599 | **15.4%** |
| Outerwear | 324 | **8.3%** |

---

## 4. Methodology & Tools

### 4.1 Analytical Approach
- **10 structured SQL analytical queries** were designed covering Revenue, Discounts, Ratings, Shipping, Subscriptions, Segmentation, and Demographics.
- All SQL queries use standard **PostgreSQL** syntax and follow best practices: CTEs, Window Functions, Subqueries, Aggregation.
- Results were validated using **Python (pandas)** for cross-verification.

### 4.2 Tools & Technologies

| Layer | Technology |
|:---|:---|
| Database / SQL | PostgreSQL (queries), DuckDB / SQLite compatible |
| Data Analysis | Python 3.12, pandas |
| Frontend | HTML5, Vanilla CSS (Glassmorphism, CSS Variables) |
| Visualization | Chart.js 4.x |
| Scripting | JavaScript (ES6+) |
| Icons & Fonts | FontAwesome 6, Google Fonts (Inter, JetBrains Mono) |
| Version Control | Git + GitHub |

---

## 5. SQL Query Analysis & Findings

### Q1 — Revenue by Gender

```sql
SELECT gender, SUM(purchase_amount) AS revenue,
       COUNT(customer_id) AS customer_count,
       ROUND(AVG(purchase_amount), 2) AS avg_purchase
FROM customer GROUP BY gender ORDER BY revenue DESC;
```

| Gender | Revenue | Customers | Avg Purchase |
|:---|:---:|:---:|:---:|
| **Male** | **$157,890** | 2,652 | $59.54 |
| Female | $75,191 | 1,248 | $60.25 |

> **Finding:** Males generate 67.7% of total revenue due to their larger population share. However, **females have a slightly higher average order value ($60.25 vs $59.54)**, suggesting female customers spend more per transaction.

---

### Q2 — Discounted High-Spenders

```sql
SELECT customer_id, purchase_amount FROM customer
WHERE discount_applied = 'Yes'
  AND purchase_amount >= (SELECT AVG(purchase_amount) FROM customer);
```

| Metric | Value |
|:---|:---:|
| Total discount users | 1,677 (43.0%) |
| Customers using discount AND spending above average ($59.76) | Significant subset |
| Avg spend WITH discount | $59.28 |
| Avg spend WITHOUT discount | $60.13 |

> **Finding:** Discounts do **not significantly drive up individual order values** — in fact, non-discount customers average slightly higher ($60.13 vs $59.28). This suggests discounts attract price-sensitive buyers rather than premium spenders.

---

### Q3 — Top 5 Highest Rated Products

```sql
SELECT item_purchased, ROUND(AVG(review_rating), 2) AS avg_rating,
       COUNT(customer_id) AS total_reviews
FROM customer GROUP BY item_purchased ORDER BY avg_rating DESC LIMIT 5;
```

| Rank | Product | Avg Rating |
|:---:|:---|:---:|
| 1 | **Gloves** | ⭐ 3.86 |
| 2 | **Sandals** | ⭐ 3.84 |
| 3 | **Boots** | ⭐ 3.82 |
| 4 | **Hat** | ⭐ 3.80 |
| 5 | **Skirt** | ⭐ 3.79 |

> **Finding:** Seasonal accessories (Gloves, Sandals, Boots, Hat) dominate the top ratings, indicating high customer satisfaction with accessory-type purchases.

---

### Q4 — Shipping Method Spend Comparison

```sql
SELECT shipping_type, ROUND(AVG(purchase_amount), 2) AS avg_spend,
       COUNT(customer_id) AS total_orders
FROM customer WHERE shipping_type IN ('Standard', 'Express')
GROUP BY shipping_type;
```

| Shipping Type | Avg Spend | Orders |
|:---|:---:|:---:|
| **Express** | **$60.48** | 646 |
| Standard | $58.46 | 654 |

> **Finding:** Customers choosing **Express shipping** spend **$2.02 more on average** than Standard shipping customers. This may indicate that higher-value purchases merit faster delivery or that premium buyers prefer speed.

---

### Q5 — Subscriber vs Non-Subscriber Value

```sql
SELECT subscription_status,
       COUNT(customer_id) AS total_customers,
       ROUND(AVG(purchase_amount), 2) AS avg_spend,
       ROUND(SUM(purchase_amount), 2) AS total_revenue
FROM customer GROUP BY subscription_status;
```

| Status | Customers | Avg Spend | Total Revenue |
|:---|:---:|:---:|:---:|
| **Subscribers (Yes)** | 1,053 | — | — |
| Non-Subscribers (No) | 2,847 | — | — |
| **Total** | **3,900** | **$59.76** | **$233,081** |

> **Finding:** Subscription program exists exclusively among **Male customers** (39.71% of males subscribed; 0% of females). This is a major gap requiring marketing attention.

---

### Q6 — Top 5 Products by Discount Rate

```sql
SELECT item_purchased,
       ROUND(100.0 * SUM(CASE WHEN discount_applied = 'Yes' THEN 1 ELSE 0 END) / COUNT(*), 2) AS discount_rate
FROM customer GROUP BY item_purchased ORDER BY discount_rate DESC LIMIT 5;
```

| Rank | Product | Discount Rate |
|:---:|:---|:---:|
| 1 | **Hat** | 50.00% |
| 2 | **Sneakers** | 49.66% |
| 3 | **Coat** | 49.07% |
| 4 | **Sweater** | 48.17% |
| 5 | **Pants** | 47.37% |

> **Finding:** Hats, Sneakers, and Coats see nearly **50% of purchases made with discounts**, indicating high price sensitivity. These products likely require promotions to drive conversions.

---

### Q7 — Customer Lifecycle Segmentation

```sql
WITH customer_type AS (
    SELECT customer_id, previous_purchases,
           CASE WHEN previous_purchases = 1 THEN 'New'
                WHEN previous_purchases BETWEEN 2 AND 10 THEN 'Returning'
                ELSE 'Loyal' END AS customer_segment
    FROM customer
)
SELECT customer_segment, COUNT(*) AS count,
       ROUND(100.0 * COUNT(*) / (SELECT COUNT(*) FROM customer), 2) AS pct
FROM customer_type GROUP BY customer_segment;
```

| Segment | Customers | Share |
|:---|:---:|:---:|
| **Loyal** (>10 purchases) | **3,116** | **79.9%** |
| Returning (2–10 purchases) | 701 | 18.0% |
| New (1 purchase) | 83 | 2.1% |

> **Finding:** An overwhelming **79.9% of customers are Loyal** repeat buyers (>10 previous purchases). This indicates a **highly retention-positive** customer base — ideal for subscription upgrades, loyalty programs, and upselling.

---

### Q8 — Top 3 Products per Category

| Category | Rank 1 | Rank 2 | Rank 3 |
|:---|:---|:---|:---|
| **Clothing** | Blouse (171) | Pants (171) | Shirt (169) |
| **Accessories** | Jewelry (171) | Sunglasses (161) | Belt (161) |
| **Footwear** | Sandals (160) | Shoes (150) | Sneakers (145) |
| **Outerwear** | Jacket (163) | Coat (161) | — |

> **Finding:** Blouse, Pants, and Jewelry are volume leaders within their categories. The near-equal counts suggest consistent demand without a single dominant product.

---

### Q9 — Subscription Among Repeat Buyers (>5 Purchases)

```sql
SELECT subscription_status, COUNT(customer_id) AS repeat_buyers,
       ROUND(100.0 * COUNT(customer_id) / SUM(COUNT(customer_id)) OVER (), 2) AS pct
FROM customer WHERE previous_purchases > 5
GROUP BY subscription_status;
```

| Status | Count | Percentage |
|:---|:---:|:---:|
| No | 2,518 | **72.44%** |
| **Yes** | 958 | **27.56%** |

> **Finding:** Even among the most loyal repeat buyers (>5 purchases), **72.44% are still not subscribed**. This is a large untapped pool for subscription conversion campaigns.

---

### Q10 — Revenue by Age Group

| Age Group | Revenue | Customers | Avg Spend |
|:---|:---:|:---:|:---:|
| **Young Adult (18–31)** | **$62,143** | 1,028 | $60.45 |
| Middle-Aged (45–57) | $59,197 | 986 | $60.04 |
| Adult (32–44) | $55,978 | 942 | $59.42 |
| Senior (58+) | $55,763 | 944 | $59.07 |

> **Finding:** **Young Adults (18–31) are the top revenue-generating cohort** ($62,143), with the highest average spend ($60.45). Senior customers spend the least on average, but all groups are within a very similar range ($59–$60), indicating consistent spending across demographics.

---

## 6. Key Business Insights

### 💡 Insight 1 — Subscription Gender Gap is Critical
- **100% of subscribers are Male.** Not a single female customer holds a subscription.
- With 1,248 female customers, this represents a **completely untapped subscription market**.
- **Recommendation:** Launch female-targeted subscription campaigns with personalized incentives.

### 💡 Insight 2 — Loyalty is Extremely High
- **79.9% of customers are Loyal** (>10 previous purchases).
- Yet only **27.56%** of these repeat buyers have subscribed.
- **Recommendation:** Implement a loyalty-to-subscription conversion funnel — offer exclusive subscriber perks to Loyal segment.

### 💡 Insight 3 — Discounts Don't Drive Higher Spend
- Customers using discounts spend **$0.85 less** on average than non-discount buyers.
- **Recommendation:** Use discounts selectively for acquisition (new customers) rather than retention where they cannibalize margins.

### 💡 Insight 4 — Female Customers Have Higher Avg Order Value
- Despite lower transaction volume, **female customers average $60.25 per order** vs Male's $59.54.
- **Recommendation:** Premium product campaigns targeting female customers could improve revenue mix.

### 💡 Insight 5 — Express Shipping Correlates With Higher Spend
- Express shipping customers spend **$2.02 more** on average than Standard.
- **Recommendation:** Offer bundled Express shipping for high-value carts to increase AOV.

### 💡 Insight 6 — Young Adults are Top Revenue Segment
- Young Adults (18–31) generate the most revenue ($62,143) with the highest average spend ($60.45).
- **Recommendation:** Prioritize digital marketing channels (social media, influencers) targeting 18–31 demographic.

---

## 7. Technical Architecture

```
┌─────────────────────────────────────────────┐
│              Data Layer                      │
│  customer_shopping_behavior.csv             │
│  (3,900 records × 18 features)              │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│            SQL Analytics Layer               │
│  customer.sql — 10 Production SQL Queries   │
│  PostgreSQL DDL Schema + CSV Import         │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│         JavaScript Engine Layer              │
│  customer_data.js — Dataset Array (JSON)    │
│  sql_queries.js — Query Definitions         │
│  app.js — Query Executor + State Manager    │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│          Presentation Layer                  │
│  index.html — Dashboard UI                  │
│  styles.css — Glassmorphism Dark/Light      │
│  Chart.js — Interactive Visualizations      │
└─────────────────────────────────────────────┘
```

---

## 8. Dashboard Features

| Feature | Description |
|:---|:---|
| **KPI Cards** | Live metrics: Total Revenue, Customers, Avg Spend, Discount %, Subscription %, Avg Rating |
| **Interactive Filters** | Filter by Category, Gender, Subscription Status, Season, Discount |
| **SQL Query Workbench** | Select & run any of 10 queries with syntax-highlighted SQL viewer |
| **Dynamic Chart.js Charts** | 9 real-time charts matching all SQL queries |
| **Query Data Grid** | Paginated, searchable, sortable data table with 15 rows/page |
| **CSV Export** | Download any query result as `.csv` file |
| **Dark / Light Theme** | Toggle between dark and light modes, persisted via DOM attribute |
| **Copy SQL Button** | Instantly copy any SQL query to clipboard |

---

## 9. Limitations & Data Quality Notes

| Issue | Detail |
|:---|:---|
| **No female subscribers** | All 1,248 female records have `Subscription Status = No`. This may be a data collection gap or a real business scenario worth investigating. |
| **Synthetic-leaning data** | Some column distributions (e.g., nearly uniform season counts, exactly equal payment method usage) suggest the dataset may be partially synthetic. |
| **No temporal dimension** | There is no `Date` or `Order Date` column, preventing time-series trend analysis. |
| **US-only dataset** | All locations are US states — no international dimension. |
| **No return/refund data** | Revenue figures represent gross purchase amounts only; net revenue after returns is unknown. |

---

## 10. Conclusions & Recommendations

### ✅ Summary of Conclusions

1. The customer base is overwhelmingly **Loyal** (79.9%), representing strong retention.
2. **Male customers dominate** both volume and subscription uptake; female customers are an untapped segment.
3. The **subscription program has a 39.71% male adoption rate** but 0% female adoption — a critical business gap.
4. **Discount campaigns** are widely used (43% of purchases) but do not meaningfully increase spend per order.
5. **Young Adults (18–31)** are the highest-revenue and highest-spending age group.
6. **Accessories (Gloves, Sandals, Boots)** receive the best customer reviews.
7. **Express shipping customers** tend to be higher spenders.

### 📌 Recommended Business Actions

| Priority | Action | Expected Impact |
|:---:|:---|:---|
| 🔴 High | Launch female-targeted subscription program with exclusive benefits | Capture 1,248 potential subscribers |
| 🔴 High | Create loyalty-to-subscription funnel for Loyal segment (3,116 customers) | Drive subscription rate from 27% toward 40%+ |
| 🟡 Medium | Reduce blanket discounts on Hat, Sneakers, Coat — test margin impact | Improve revenue margin |
| 🟡 Medium | Bundle Express shipping with high-value carts ($80+) | Increase AOV |
| 🟢 Low | Expand product lines for top-rated categories (Accessories/Footwear) | Improve customer satisfaction |
| 🟢 Low | Add date/time dimension to future data collection | Enable time-series & seasonal trend analysis |

---

*Report generated from dataset: `customer_shopping_behavior.csv` | 3,900 records | October 2026*
