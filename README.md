# Zoozu (Backend) 👗👔🛍️

Zoozu is a high-performance, enterprise-grade e-commerce backend designed for a premium, hybrid fashion brand. The architecture seamlessly unifies two distinct business models: standard B2C retail (**ready-to-wear storefront collections**) and bespoke tailoring services (**custom-made apparel workflows** combined with an **integrated fitting appointment system**).

Built with automated, secure online payment pipelines and state-driven order tracking, the platform is optimized for exceptional transactional throughput, data integrity, and cross-gender catalog management.

---

## 🛠️ Technical Architecture & Stack

* **Framework:** **NestJS / Node.js** (TypeScript) – Engineered using a highly structured, decoupled module pattern (`UserModule`, `ProductModule`, `OrderModule`, `BookingModule`).
* **Payment Architecture:** **Paystack / Stripe API** *(👈 Replace with the one you used)* – Integrated webhook handling and secure server-to-server transaction validation for real-time order processing.
* **Database & Relationships:** [PostgreSQL / MongoDB - *Insert Database here*] – Robust data schema managing inventory state-locking to prevent race conditions during checkout.
* **Authentication & Access Control:** **JWT Auth** backed by Role-Based Access Control (RBAC) to differentiate between standard clients, retail managers, and master tailors.

---

## ✨ Core Business Workflows & Engineering Highlights

* **🛒 Hybrid Commerce Engine:** Supports simultaneous item checkout for ready-to-wear items (instant inventory decrementing) and custom-order item configurations (capturing measurements, fabric preferences, and custom specs).
* **📅 Real-Time Fitting Scheduling System:** A calendar allocation engine allowing clients to book physical or virtual fittings. Built-in backend availability rules prevent double-bookings or scheduling conflicts for styling staff.
* **💳 Automated Webhook & Payment Engine:** Implemented bulletproof, idempotent payment processing via webhooks to automatically shift order statuses from `Pending Payment` ➡️ `Processing` upon ledger verification.
* **📦 Sophisticated State Machine:** Tracks the lifecycle of custom clothing: `Order Placed` ➡️ `Fitting Scheduled` ➡️ `In Production` ➡️ `Dispatched`.

---

## 🚀 REST API Architecture Overview

The backend API follows strict REST guidelines, using DTOs (Data Transfer Objects) for input mapping and strict validation rules.

### 🔐 Identity & Access Control
* `POST /api/v1/auth/register` - Creates a new customer account.
* `POST /api/v1/auth/login` - Authenticates user and issues a stateless session JWT.

### 🛍️ Storefront & Inventory
* `GET /api/v1/products` - Fetches catalog with dynamic query filtering (by collection, gender, size, or custom/ready-to-wear tags).
* `POST /api/v1/orders/checkout` - Initializes an online payment intent and locks the shopping cart items. 🔒

### 🪡 Custom Orders & Bookings
* `POST /api/v1/orders/custom` - Submits a custom-tailored garment specification report. 🔒
* `POST /api/v1/fittings/book` - Claims an open calendar slot for a physical or virtual styling session. 🔒
* `POST /api/v1/payments/webhook` - Public-facing immutable endpoint for payment gateway provider callbacks to verify transaction logs.

---

## ⚙️ Local Setup and Installation

### Prerequisites
* Ensure you have **Node.js (v18+)** and your database engine running locally.
* Valid developer credentials for your chosen payment gateway provider.

### 1. Installation
```bash
git clone [https://github.com/Shukazuby/zoozu-backend.git](https://github.com/Shukazuby/zoozu-backend.git)
cd zoozu-backend
npm install
