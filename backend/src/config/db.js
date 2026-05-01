import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const connectDB = async () => {
    try {
        const connection = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected`);
    } catch(err) {
        console.log("Failed to connect with MongoDB", err);
    }
}

export default connectDB;