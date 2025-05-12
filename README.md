
# 🩸 Raktlink – Location-Based Blood Donation Web App

**Raktlink** is a real-time, location-based blood donation platform designed to connect individuals in urgent need of blood with nearby donors. The project aims to streamline the blood request process using geolocation, real-time notifications, and secure authentication.

---

## 🔗 Live Demo

**Deployed at:** [https://raktlink-server.onrender.com](https://raktlink-server.onrender.com) *(update with your actual deployment URL if different)*

---

## 🚀 Features

* 🧭 **Location Detection** – Detects users' current location for precise donor-requester mapping.
* 🩸 **Smart Matching Algorithm** – Matches blood requests with potential donors based on blood group and proximity.
* 📬 **Real-time Notifications** – Donors get notified instantly when a nearby request is raised (via socket.io).
* 🔐 **Secure Authentication** – JWT-based login and registration system.
* 📜 **History Tracking** – View past donation and request activity.
* ⚙️ **RESTful API** – Built with Express and MongoDB for scalable and secure backend operations.

---

## 🧰 Tech Stack

| Technology      | Description                    |
| --------------- | ------------------------------ |
| **Backend**     | Node.js, Express               |
| **Database**    | MongoDB, Mongoose              |
| **Auth**        | JWT (JSON Web Token), bcryptjs |
| **Real-Time**   | Socket.io                      |
| **Deployment**  | Render (for server)            |
| **Environment** | dotenv                         |

---

## 📁 Project Structure

```
raktlink-server/
│
├── index.js              # Entry point for the server
├── routes/               # API routes for user and request handling
├── models/               # Mongoose models for Users and Requests
├── controllers/          # Business logic
├── middleware/           # JWT auth middleware
├── config/               # DB connection and config files
├── .env                  # Environment variables
└── ...
```

---

## 📦 Installation

1. Clone the repo:

   ```bash
   git clone https://github.com/yourusername/raktlink-server.git
   cd raktlink-server
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Add your `.env` file:

   ```
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_secret_key
   ```

4. Start the server:

   ```bash
   npm run dev
   ```

---

## 🚀 Deployment

The Raktlink backend is deployed using **Render**.

### Deployment Steps:

1. Push your code to a GitHub repository.
2. Go to [https://render.com](https://render.com) and connect your GitHub.
3. Create a new Web Service:

   * **Environment:** Node
   * **Build Command:** `npm install`
   * **Start Command:** `node index.js`
4. Add environment variables (`PORT`, `MONGO_URI`, `JWT_SECRET`).
5. Deploy and get your live backend URL.

Optional: Use services like **Railway**, **Vercel**, or **Firebase Hosting** for frontend (if applicable).

---

## ✅ Future Improvements

* Donor rating & feedback system
* Email/SMS alerts
* Admin dashboard for NGOs/hospitals
* Mobile app version

---

