import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";
import { createServer } from "node:http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import initSocket from "./controllers/socketManager.js";
import User from "./models/user.model.js";
import userRoutes from "./routes/user.routes.js";
import protect from "./middlewares/verifyToken.js";
import path from "node:path";
dotenv.config();

const app = express();
const server = createServer(app);
const io = initSocket(server);

const allowedOrigin = process.env.CLIENT_URL;
app.use(cors({
    origin: allowedOrigin,
    credentials: true
}));
app.use(cookieParser())
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/v1/users", userRoutes);
app.use(express.static(path.join(__dirname, "../../frontend/dist")));

const port = process.env.PORT;
const start = async () => {
    server.listen(port, () => {
        console.log("LISTENIN ON 8000");
    });
    connectDB();
}
start();

app.get("/verify", protect, (req, res) => {
    const { _id, name, email } = req.user;

    res.status(200).json({
        authenticated: true,
        user: { _id, name, email }
    });
});

app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "../../frontend/dist/index.html"));
});

app.post("/logout", (req, res) => {
    res.clearCookie("token", {
        httpOnly: true,
        secure: true,        
        sameSite: "none",    
    });

    res.status(200).json({message: "Logged Out"});
})