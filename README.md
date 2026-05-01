# EchoMeet 🎥

> **Connect with your loved ones — Cover the distance by Echo Meet**

EchoMeet is a real-time video calling web application that allows users to join meetings via unique meeting codes, preview their camera before connecting, and review their meeting history.

---

## ✨ Features

- **Landing Page** — Clean hero section with call-to-action to get started
- **Authentication** — Sign In / Sign Up flow with username & password
- **Meeting Dashboard** — Join any meeting using a unique meeting code
- **Lobby Preview** — Live camera preview before entering a meeting room
- **Meeting History** — View a log of past sessions with meeting codes and dates
- **Guest Access** — Join as a guest without registering

---

## 📸 Screenshots

| Page | Description | Screenshots |
|------|-------------|-------------|
| Home | Hero landing page with "Get Started" CTA | ![Home](images/home.png) |
| Login | Sign In / Sign Up with username & password | ![Login](images/login.png) |
| Dashboard | Join meeting via code input | ![Dashboard](images/dashboard.png) |
| Lobby | Live camera preview before connecting | ![Lobby](images/lobby.png) |
| History | View past meeting sessions | ![History](images/history.png) |

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/echomeet.git

# Navigate to the project directory
cd echomeet

# Install dependencies
npm install

# Start the development server
npm run dev
```

### Running the App

```bash
npm start
```

Then open your browser and go to `http://localhost:3000`

---

## 🛠️ Tech Stack

- **Frontend** — HTML, CSS, JavaScript (or React)
- **Real-time Communication** — WebRTC
- **Signaling** — Socket.IO / WebSockets
- **Authentication** — Session-based or JWT
- **Backend** — Node.js / Express

---

## 📖 How to Use

1. **Register or Login** — Create an account or sign in with your credentials
2. **Join a Meeting** — Enter a meeting code on the dashboard and click **Join**
3. **Lobby** — Enter your username and preview your camera, then click **Connect**
4. **In Meeting** — Enjoy your video call
5. **History** — View your past meetings by clicking the **History** button in the navbar

---

## 🔒 Authentication

- Username & password login
- "Remember me" option on sign-in
- Guest access available (no registration required)

---

## 📅 Meeting History

Each meeting session is logged with:
- **Meeting Code** — Unique identifier for the room
- **Date** — When the session took place

---

## 🤝 Contributing

Contributions are welcome! Please open an issue or submit a pull request.

```bash
# Fork the repo, make your changes, then
git checkout -b feature/your-feature
git commit -m "Add your feature"
git push origin feature/your-feature
```

---

## 📄 License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

---

<p align="center">Made with ❤️ by the EchoMeet Team</p>