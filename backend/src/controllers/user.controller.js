import User from "../models/user.model.js";
import bcrypt from "bcrypt";
import generateJWT from "../utils/generateJWT.js";
import Meeting from "../models/meeting.model.js";

const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                message: "All fields required"
            });
        }

        const user = await User.findOne({username: username});
        if(!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if(!isMatch) {
            return res.status(401).json({
                message: "Invalid credentials"
            });
        }

        let token = generateJWT(user._id);

        res.cookie("token", token, {
            httpOnly: true,
            secure: false,    
            sameSite: "lax", 
            maxAge: 24 * 60 * 60 * 1000
        });
        
        return res.status(201).json({
            message: "Login successfully",
            user
        });

    } catch(err) {
        console.log(err);

        res.status(401).json({
            message: "login failed",
        });
    }
}


const register = async (req, res) => {
    try {
        const { name, username, password } = req.body;
        
        const existingUser = await User.findOne({username: username});
        if(existingUser) {
            return res.status(409).json({
                message: "User already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({
            name: name,
            username: username,
            password: hashedPassword
        });
        
        return res.status(201).json({
            message: "User registered successfully",
            newUser
        });

    } catch(err) {
        console.log(err);

        res.status(401).json({
            message: "registration failed"
        });
    }
}

const getUserHistory = async (req, res) => {
    try {
        const user = req.user;

        const meetings = await Meeting.find({ user_id: user._id });

        return res.status(200).json({
            message: "User's meeting history fetched",
            meetings
        });

    } catch (err) {
        return res.status(500).json({
            message: "Something went wrong",
            error: err.message
        });
    }
};

const addToHistory = async (req, res) => {
    try {
        const user = req.user;
        const { meetingCode } = req.body;

        if (!meetingCode) {
            return res.status(400).json({
                message: "Meeting code is required"
            });
        }

        await Meeting.create({
            user_id: user._id,
            meetingCode: meetingCode
        });

        return res.status(200).json({
            message: "Successfully added to history"
        });

    } catch (err) {
        return res.status(500).json({
            message: "Something went wrong!",
            error: err.message
        });
    }
};

export { login, register, getUserHistory, addToHistory };