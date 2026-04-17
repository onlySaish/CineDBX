<div align="center">
  
# 🍿 CineDBX

**An Advanced Database Management System (ADBMS) Implementation**

*CineDBX is a full-stack, enterprise-grade movie ticket booking architecture meticulously designed to handle peak-traffic concurrency, aggressive relational scaling, and state-of-the-art UI synchronization.*

<img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" /> <img src="https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white" /> <img src="https://img.shields.io/badge/Express.js-404D59?style=for-the-badge" /> <img src="https://img.shields.io/badge/MySQL-005C84?style=for-the-badge&logo=mysql&logoColor=white" />

</div>

---

## 📖 About The Project

CineDBX is not just a standard movie booking website; it was engineered specifically as an educational and structural implementation of **Advanced Database Management Systems (ADBMS)**. It focuses intensely on solving real-world database phenomena such as race conditions, strict transactional aggregations, and query bottleneck optimizations.

## ⚙️ ADBMS Concepts Implemented

1. **Concurrency Control (Logical Row Locking):** Custom-built multi-client active seat lock mechanism guaranteeing zero double-bookings. Automatically drops orphaned locks intelligently tracking timeouts (`NOW() + INTERVAL 5 MINUTE` checks) alongside explicit React component cleanup hooks.
2. **Strict SQL Modes & Security:** Highly tuned group aggregations built natively to operate securely under MySQL 5.7+ `ONLY_FULL_GROUP_BY` strict-enforcement protocols.
3. **Optimized B-Tree Indexing Strategies:** Structural indexing on relationships (`seat_lock`, conditional `ticket` joins, exact chronologies) utilizing deterministic query planners mimicking `O(log N)` logarithmic search complexity over millions of potential transactional combinations.
4. **Normalized Relational Architecture:** Sophisticated mappings cleanly isolating entities into dedicated partitions (`hallwise_seat`, `shown_in`, `movie_genre`) enforcing absolute data integrity and ACID compliances.

## 🚀 Key Features

* **Real-time Seat Matrices:** Actively polls and blocks selected matrices before commitment. 
* **Dynamic Search & Filtering:** Filter multi-dimensional records traversing cinemas, dates, and formats natively.
* **Responsive Visual Hierarchy:** Stunningly animated front-end constructed carefully using pure localized CSS.
* **Secure Authentication System:** User portals preserving strict historical purchase artifacts independently per user constraints.
* **Interactive Admin Workflows:** Super-user controls designed to manually append and enforce movie injections and runtime alterations across database shards.

## 💻 Tech Stack

* **Front-End:** React (Vite environment), Redux Toolkit (State Management), Pure CSS
* **Back-End:** Node.js, Express.js
* **Database Engine:** MySQL (InnoDB)

---

## 🛠️ Installation & Setup

Ensure you have Node.js and MySQL locally available before diving in. 

### 1. Database Setup
1. Mount your local MySQL instances.
2. Create your fresh database map schema manually executing `mysql -u root -p < database_schema.sql` (if supplied) or bootstrapping natively.
3. Add proper table indexing configurations (covered inside documentation logs).

### 2. Backend Initialization
```bash
# Navigate to the API Directory
cd backend

# Install Package Dependencies
npm install

# Setup Environment Configuration
cp .env.example .env
# --> Edit .env file and map DB_HOST, DB_USER, DB_PASSWORD, DB_NAME appropriately.

# Launch node deployment
node index.js
# Runs live routinely on Port 7000.
```

### 3. Frontend Initialization
```bash
# Open a secondary terminal & swap to React portal
cd frontend

# Install UI Dependencies
npm install

# Prepare Client Configuration
cp .env.example .env
# --> Set VITE_API_URL internally (e.g. http://localhost:7000)

# Launch local development server
npm run dev
# Deploys standard routing configurations on Port 5173.
```

## 📸 Sneak Peek

(Add your specific local `/demo` screenshots inside the folder pathing below!)

![Payment Matrix Booking](/demo/Purchase1.png)
![Showtimes Aggregation](/demo/Purchase2.png) 

---
*Created meticulously to satisfy advanced scalability milestones.*
