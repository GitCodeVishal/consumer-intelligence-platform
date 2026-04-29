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

- Unified user profile across multiple brands
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
- Sequelize ORM

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
# Add your DB credentials

# Create database manually in MySQL
CREATE DATABASE consumer_platform;

# Run migrations
npm run migrate

# Seed data
npm run seed

# Start server
npm run dev