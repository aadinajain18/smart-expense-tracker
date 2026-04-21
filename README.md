# 💰 Smart Expense Tracker

A full-stack expense tracking application built with **React**, **Tailwind CSS**, **Node.js**, **Express**, and **MongoDB**.

---

## 📁 Project Structure

```
Smart Expense Tracker/
├── client/                 # React frontend (Vite)
│   ├── public/
│   ├── src/
│   │   ├── App.jsx         # Root component
│   │   ├── App.css
│   │   ├── index.css       # Tailwind CSS entry
│   │   └── main.jsx        # React entry point
│   ├── index.html
│   ├── vite.config.js      # Vite + Tailwind + API proxy config
│   └── package.json
│
├── server/                 # Node.js backend (Express)
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js       # MongoDB connection
│   │   ├── controllers/
│   │   │   └── expenseController.js
│   │   ├── middleware/
│   │   │   └── errorMiddleware.js
│   │   ├── models/
│   │   │   └── Expense.js  # Mongoose schema
│   │   ├── routes/
│   │   │   └── expenseRoutes.js
│   │   ├── utils/          # Utility functions (empty)
│   │   └── server.js       # Express entry point
│   ├── .env                # Environment variables
│   ├── .env.example        # Env template
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## 🛠 Tech Stack

| Layer      | Technology                |
| ---------- | ------------------------- |
| Frontend   | React 19 + Vite 8         |
| Styling    | Tailwind CSS 4            |
| Backend    | Node.js + Express 4       |
| Database   | MongoDB + Mongoose 8      |
| Dev Tools  | Nodemon, ESLint, Morgan   |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18+ — [download](https://nodejs.org)
- **MongoDB** — local install or [MongoDB Atlas](https://www.mongodb.com/atlas) (free tier)

### 1. Clone the project

```bash
cd "Smart Expense Tracker"
```

### 2. Install dependencies

```bash
# Install client dependencies
cd client
npm install

# Install server dependencies
cd ../server
npm install
```

### 3. Configure environment

Edit `server/.env` and set your MongoDB connection string:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/smart-expense-tracker
JWT_SECRET=your_secret_here
```

### 4. Start the development servers

**Terminal 1 — Backend:**

```bash
cd server
npm run dev
```

**Terminal 2 — Frontend:**

```bash
cd client
npm run dev
```

The React app runs on **http://localhost:5173** and proxies API calls (`/api/*`) to the Express server on **http://localhost:5000**.

---

## 📡 API Endpoints (Scaffolded)

| Method   | Endpoint              | Description           |
| -------- | --------------------- | --------------------- |
| `GET`    | `/api/health`         | Health check          |
| `GET`    | `/api/expenses`       | Get all expenses      |
| `POST`   | `/api/expenses`       | Create new expense    |
| `GET`    | `/api/expenses/:id`   | Get single expense    |
| `PUT`    | `/api/expenses/:id`   | Update an expense     |
| `DELETE` | `/api/expenses/:id`   | Delete an expense     |

> All route handlers return placeholder responses — implement logic in the controllers.

---

## 📝 Next Steps

- [ ] Implement CRUD logic in `expenseController.js`
- [ ] Wire controllers to routes
- [ ] Build the frontend dashboard UI
- [ ] Add charts & data visualization
- [ ] Add user authentication (JWT)
- [ ] Add budget tracking & smart insights

---

## 📄 License

MIT
