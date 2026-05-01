# EchoMeet 🎥
 
> **Connect with your loved ones — Cover the distance by Echo Meet**
 
EchoMeet is a full-stack MERN video calling web application that allows users to join meetings via unique meeting codes, preview their camera before connecting, and review their meeting history — all in real time.
 
---
 
## ✨ Features
 
- **Landing Page** — Clean hero section with call-to-action to get started
- **Authentication** — Sign In / Sign Up flow with username & password
- **Meeting Dashboard** — Join any meeting using a unique meeting code
- **Lobby Preview** — Live camera preview before entering a meeting room
- **Meeting History** — View a log of past sessions with meeting codes and dates
- **Guest Access** — Join as a guest without registering
---

## 🛠️ Tech Stack
 
### Frontend
- **React.js** — UI components and routing
- **WebRTC** — Peer-to-peer video/audio streaming
- **Socket.IO Client** — Real-time signaling
### Backend
- **Node.js** — Runtime environment
- **Express.js** — REST API server
- **Socket.IO** — WebSocket signaling server
### Database
- **MongoDB** — Storing users and meeting history
- **Mongoose** — MongoDB object modeling
---
 
## 📁 Project Structure
 
```
echomeet/
├── client/                 # React frontend
│   ├── public/
│   └── src/
│       ├── components/
│       ├── pages/
│       │   ├── Home.jsx
│       │   ├── Login.jsx
│       │   ├── Dashboard.jsx
│       │   ├── Lobby.jsx
│       │   └── History.jsx
│       └── App.jsx
├── server/                 # Node/Express backend
│   ├── models/
│   │   ├── User.js
│   │   └── Meeting.js
│   ├── routes/
│   │   ├── auth.js
│   │   └── meetings.js
│   ├── socket.js
│   └── index.js
├── screenshots/
└── README.md
```
 
---
 
## 🚀 Getting Started
 
### Prerequisites
 
- Node.js (v18 or higher)
- MongoDB (local or [MongoDB Atlas](https://www.mongodb.com/atlas))
- npm or yarn
### Installation
 
```bash
# Clone the repository
git clone https://github.com/your-username/echomeet.git
cd echomeet
```
 
#### Setup Backend
 
```bash
cd server
npm install
```
 
Create a `.env` file inside `server/`:
 
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```
 
```bash
# Start the backend server
npm run dev
```
 
#### Setup Frontend
 
```bash
cd client
npm install
npm start
```
 
App runs at `http://localhost:3000`, backend at `http://localhost:5000`
 
---
 
## 📖 How to Use
 
1. **Register or Login** — Create an account or sign in with your credentials
2. **Join a Meeting** — Enter a meeting code on the dashboard and click **Join**
3. **Lobby** — Enter your username and preview your camera, then click **Connect**
4. **In Meeting** — Enjoy your real-time video call
5. **History** — Click the **History** button in the navbar to review past sessions
---
 
## 🔌 API Endpoints
 
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login and receive token |
| GET | `/api/meetings/history` | Get user's meeting history |
| POST | `/api/meetings/join` | Join or create a meeting |
 
---
 
## 🔒 Authentication
 
- JWT-based authentication
- Protected routes on both frontend and backend
- "Remember me" option on sign-in
- Guest access available (no registration required)
---
 
## 🤝 Contributing
 
Contributions are welcome! Please open an issue or submit a pull request.
 
```bash
git checkout -b feature/your-feature
git commit -m "Add your feature"
git push origin feature/your-feature
```
 
---
 
## 📄 License
 
This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.
 
---