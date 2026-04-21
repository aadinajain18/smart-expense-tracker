# 💰 Smart Expense Tracker

[![Deployed App](https://img.shields.io/badge/Live_Demo-Vercel-success?style=for-the-badge&logo=vercel)](https://client-chi-nine-37.vercel.app)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green?style=for-the-badge&logo=nodedotjs)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)](https://react.dev)

A modern, full-stack personal finance application designed to help users track their spending habits, visualize categories, and interact with a smart finance chatbot. 

## 🌟 Live Demo
[**Click here to view the live deployed application!**](https://client-chi-nine-37.vercel.app)

---

## 🚀 Features

- **Real-Time Dashboard**: Visualize your monthly expenses categorized through responsive pie and bar charts powered by Recharts.
- **Smart Chatbot Integration**: Ask questions about your spending naturally! If provided an OpenAI key, it uses GPT-4 to respond; otherwise, it safely falls back to a custom offline logic parser.
- **Secure User Authentication**: Full JWT-based registration and login system to keep your financial data privatized.
- **Dynamic Budget Setting**: Set category limits and see real-time color-coded progress bars to prevent overspending.
- **Beautiful Glassmorphism UI**: Built cleanly with Vite and Tailwind CSS 4 for a visually stunning desktop and mobile user experience.

---

## 🛠️ Technology Stack

| Layer | Tools Used |
| :--- | :--- |
| **Frontend** | React 19, Vite, Tailwind CSS 4, Axios, Recharts, React Router Dom |
| **Backend** | Node.js, Express, Socket.io, JsonWebToken |
| **Database** | MongoDB Atlas, Mongoose |
| **Deployment** | Vercel (Frontend Client) & Render (Backend API) |

---

## 💻 Local Setup Instructions

Want to run this project locally? Follow these steps:

### Prerequisites
- Node.js installed (v18+)
- A local MongoDB instance or a free MongoDB Atlas URI

### 1. Clone the Repository
```bash
git clone https://github.com/aadinajain18/smart-expense-tracker.git
cd smart-expense-tracker
```

### 2. Configure Environment Variables
Create a `.env` file inside the `server/` directory and add:
```env
PORT=5001
NODE_ENV=development
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=any_random_string_here
```

*(Note: Provide an `OPENAI_API_KEY` only if you want AI chatbot features, otherwise leave blank to use the offline fallback)*

### 3. Install Dependencies & Run

**Backend:**
```bash
cd server
npm install
npm run dev
```

**Frontend:**
Open a new terminal tab and run:
```bash
cd client
npm install
npm run dev
```

The application will now be running at `http://localhost:5173`.

---

## 📄 License
MIT License
