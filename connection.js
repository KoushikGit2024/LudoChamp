import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
async function connect() {
    const URL=(process.env.NODE_ENV === "production") ? process.env.MONGO_URL : process.env.MONGO_URL_DEV;
    console.log(URL)
    try {
        await mongoose.connect(URL);
        console.log("Connected to MongoDB");
    } catch (error) {
        console.log(error);
    }
}

export default connect;
