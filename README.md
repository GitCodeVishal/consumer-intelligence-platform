# Consumer Intelligence Platform

A scalable backend system for a multi-brand D2C (Direct-to-Consumer) platform that enables **unified consumer identity**, **behavioral event tracking**, **rule-based segmentation**, and **spending propensity scoring**.

## 🧠 Problem Statement

In multi-brand ecosystems, customer data is often siloed per brand, leading to fragmented user insights.

This platform solves that by:
- Maintaining a **single unified user identity**
- Tracking **cross-brand behavior**
- Generating **actionable insights via segmentation and scoring**

---

## 🚀 Features

- Unified user profile across multiple brands (dedup on email/phone)
- Event-driven architecture (purchase, engagement, activity tracking)
- Rule-based segmentation engine:
  - High Value Users
  - Cross-Brand Users
  - Dormant Users
  - Lifecycle Transition Candidates
- Spending propensity scoring (0–100) with explainable rationale

---

## 🛠 Tech Stack

- Node.js (v20+)
- Express.js
- MySQL 8+
- Sequelize ORM (with `sequelize-cli` for migrations and seeders)

---

## ⚙️ Setup

```bash
# Clone repo
git clone https://github.com/GitCodeVishal/consumer-intelligence-platform.git
cd consumer-intelligence-platform

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Add your DB credentials in .env (DB_PASSWORD, etc.)

# Create database manually in MySQL
mysql -u root -p -e "CREATE DATABASE consumer_platform;"

# Run migrations
npm run migrate

# Seed data (5 brands, 100 users, ~5000 events, 4 segments)
npm run seed

# Start server
npm run dev
```

The server runs on `http://localhost:3000` by default.

| Script | Purpose |
|---|---|
| `npm run dev` | Start with auto-reload |
| `npm run migrate` | Apply migrations |
| `npm run seed` | Populate seed data |
| `npm run db:reset` | Undo migrations → migrate → seed |

---

## 📦 Standard Response Format

Every endpoint returns the same JSON envelope.

**Success:** `{ "success": true, "message": "...", "data": {...}, "error": null }`
**Error:** `{ "success": false, "message": "...", "data": null, "error": null }`

---

## 📡 Sample APIs

### Health
```bash
curl http://localhost:3000/health
```

### Users

Create a user (deduplicates on email/phone, optionally registers a brand):
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alex@example.com",
    "phone": "+919876543210",
    "first_name": "Alex",
    "last_name": "Carter",
    "brand_id": 1
  }'
```

List / filter / get one / update / register or unlink a brand:
```bash
curl "http://localhost:3000/api/users?brand=teenvibe&limit=5"
curl http://localhost:3000/api/users/1
curl -X PATCH http://localhost:3000/api/users/1 \
  -H "Content-Type: application/json" -d '{ "city": "Pune" }'
curl -X POST http://localhost:3000/api/users/1/brands \
  -H "Content-Type: application/json" -d '{ "brand_id": 3 }'
curl -X DELETE http://localhost:3000/api/users/1/brands/3
```

### Events

Single + bulk ingest (auto-links the user-brand pair if missing):
```bash
curl -X POST http://localhost:3000/api/events \
  -H "Content-Type: application/json" \
  -d '{ "user_id": 1, "brand_id": 2, "event_type": "purchase", "amount": 129.50 }'

curl -X POST http://localhost:3000/api/events/bulk \
  -H "Content-Type: application/json" \
  -d '{ "events": [
    { "user_id": 2, "brand_id": 1, "event_type": "app_open" },
    { "user_id": 3, "brand_id": 1, "event_type": "purchase", "amount": 250 }
  ]}'

# A user's event history (with filters)
curl "http://localhost:3000/api/users/1/events?event_type=purchase&limit=10"
```

Allowed `event_type` values: `purchase`, `app_open`, `content_view`, `add_to_cart`, `click`, `page_view`, `product_view`. `amount` is required when `event_type` is `purchase`.

### Segmentation

```bash
# Run all segment rules and refresh memberships
curl -X POST http://localhost:3000/api/segments/evaluate

# Run a single segment
curl -X POST http://localhost:3000/api/segments/dormant_user/evaluate

# List segments with member counts
curl http://localhost:3000/api/segments

# Users in a segment (with their qualification metadata)
curl "http://localhost:3000/api/segments/high_value_user/users?limit=5"

# Segments a user belongs to
curl http://localhost:3000/api/users/31/segments
```

### Propensity Scoring

```bash
curl http://localhost:3000/api/users/99/propensity
```

Sample response:
```json
{
  "user_id": 99,
  "score": 100,
  "rationale": "Frequent buyer with strong recent engagement; high purchase likelihood.",
  "components": {
    "recency":    { "score": 100, "days_since": 1, "weight": 0.4 },
    "frequency":  { "score": 100, "purchase_count": 27, "window_days": 90, "weight": 0.3 },
    "engagement": { "score": 100, "event_count": 111, "window_days": 30, "weight": 0.3 }
  }
}
```

---

## 📌 Notes

- **Dedup precedence:** email match wins; phone is fallback.
- **Soft unlink:** unlinking a user from a brand sets `is_active = false`; event history is preserved.
- **Auto-link on event:** ingesting an event for an unlinked user-brand pair creates the link with `acquisition_source = 'event_ingestion'`.
- **Propensity is computed on read** (no caching) — fast at assignment scale.
- **Seed data is deterministic** (`faker.seed(...)`), so re-running gives the same dataset.
- **Tunable via `.env`:** segmentation thresholds (`SEG_*`) and propensity weights (`PROP_*`) — see [.env.example](.env.example).
- **Adding a new segment** = create one file in `src/segmentation/rules/` (registry auto-loads it) + insert a row into the `segments` table.
