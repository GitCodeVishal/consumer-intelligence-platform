# Backend Developer Assignment – Consumer Intelligence Platform

## 📌 Overview

Build the backend for a **multi-brand D2C (Direct-to-Consumer) platform** where multiple brands serve different customer demographics and life stages.

A single consumer may interact with multiple brands over time. The goal is to create a **unified consumer intelligence platform** instead of maintaining isolated brand-wise customer records.

---

## 🎯 Objectives

You are expected to:

* Design your own **database schema / data model**
* Create **seed or dummy data**
* Build **APIs and backend logic** around the platform

Your approach to **data modeling, scalability, and extensibility** will be part of the evaluation.

---

## 🧱 Core Data Areas

### 1. Consumer Profile Data

Store user information such as:

* Demographics
* Brand associations
* Registration details
* Location / acquisition source
* Lifecycle-related attributes

---

### 2. Behavioural & Transaction Data

Store timestamped user events such as:

* Purchases
* App activity
* Content engagement
* Other interactions/events

Each event should be associated with both a **user** and a **brand**.

---

## ⚙️ Functional Requirements

### 1. Unified User Profile Management

Build APIs to:

* Create/manage users across multiple brands
* Register users against one or more brands
* Store behavioural/transaction events
* Handle duplicate or conflicting entries gracefully

👉 A user interacting with multiple brands should still exist as a **single identity** in the system.

---

### 2. Consumer Segmentation Engine

Create a **rule-based and extensible segmentation system**.

Minimum segments to support:

* **High Value User** – based on total spend
* **Cross-Brand User** – active across multiple brands
* **Dormant User** – inactive beyond a configurable period
* **Lifecycle Transition Candidate** – users likely to move to another brand based on engagement/profile signals

👉 A user can belong to **multiple segments simultaneously**.

---

### 3. Spending Propensity Scoring

Build a **rule-based scoring system (0–100)** to estimate purchase likelihood.

Possible signals:

* Purchase recency
* Transaction frequency
* Recent engagement activity

Each score should include a short explainable rationale.

**Example:**

> "Recently active with high engagement but low purchase frequency."

---

## 📦 Submission Requirements

* GitHub repository with source code
* Seed/dummy data setup
* README with setup instructions and sample APIs

---

## 📝 Important Note

You are not required to implement every feature perfectly or completely.

We are primarily evaluating:

* Backend architecture & data modelling
* API design
* Code quality & scalability
* Problem-solving approach
* Extensibility of your implementation

👉 You may prioritize core functionality and make reasonable assumptions where needed.

---
