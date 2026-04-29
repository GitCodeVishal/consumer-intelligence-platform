# Consumer Intelligence Platform

Backend for a multi-brand D2C (Direct-to-Consumer) platform with unified consumer identity, behavioral event tracking, rule-based segmentation, and spending propensity scoring.

> **Status:** Work in progress — see [PLAN.md](./PLAN.md) for the phased build plan and current progress.

---

## Stack

- **Node.js** (v20+) + **Express.js**
- **MySQL 8+** with **Sequelize** ORM
- **Joi** for request validation

---

## Quick Start

> Full setup, API reference, and examples will be added once Phase 7 (documentation) is complete.

```bash
# Clone
git clone https://github.com/GitCodeVishal/consumer-intelligence-platform.git
cd consumer-intelligence-platform

# Install (once package.json exists)
npm install

# Configure
cp .env.example .env
# edit .env with your local MySQL credentials

# Seed database
npm run seed

# Run
npm run dev
```

---

## Project Structure

See [PLAN.md](./PLAN.md) for the planned folder structure and phase-by-phase breakdown.

---

## Assignment

See [assignment.md](./assignment.md) for the original brief.
