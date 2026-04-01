# 🚀 Backend Setup Guide

Welcome to the **Pulse Backend**! This service provides the API layer, authentication, and video management logic for the Pulse application.

---

## 🛠 Prerequisites

Ensure you have the following installed on your local machine:
- **Node.js** (>= 18.x)
- **npm** (comes with Node.js)
- **MongoDB** (Running locally at `mongodb://localhost:27017` or a connection string ready)

---

## 🏗 Initial Setup

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Environment Variables**:
    Copy the example environment file and update it with your local settings (e.g., `MONGODB_URI`, `JWT_SECRET`).
    ```bash
    cp .env.example .env
    ```

3.  **Seed Database (Demo Accounts)**:
    We provide a seeding script to initialize the database with demo users (`Viewer`, `Editor`, `Admin`).
    ```bash
    node scripts/seed.js
    ```

| User Role | Email | Password |
| :--- | :--- | :--- |
| **Viewer** | `viewer@pulse.com` | `123456` |
| **Editor** | `editor@pulse.com` | `123456` |
| **Admin** | `admin@pulse.com` | `123456` |

---

## 🚀 Running the Server

### Option 1: Standard Node.js (Development)
Ideal for quick testing and debugging.
```bash
npm start
```

### Option 2: PM2 (Recommended)
PM2 provides process management, logging, and automatic restarts.
```bash
# Register and start the service with PM2
npm run start:dev

# Check status
npm run status

# View logs
npm run logs
```

---

## 🏥 Health Verification

Once the server is running, verify it's active:
- **Base Status**: `GET http://localhost:5000/health`
- **DB Readiness**: `GET http://localhost:5000/health/ready`
- **Liveness**: `GET http://localhost:5000/health/live`

---

## 📁 Project Structure

- `controller/`: Request handlers (API logic).
- `models/`: Mongoose schemas.
- `routes/`: Express route definitions.
- `services/`: Business logic.
- `middleware/`: Auth, logging, and error handlers.
- `validation/`: Joi request validation schemas.
