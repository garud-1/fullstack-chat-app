import { config } from "dotenv";
import connectDB from "../db/db.js";
import User from "../models/user.model.js";
import Message from "../models/message.model.js";

config();

const deleteAllUsers = async () => {
  try {
    await connectDB();
    await User.deleteMany({});
    await Message.deleteMany({});
    console.log("All users deleted successfully");
    process.exit(0);
  } catch (error) {
    console.error("Error deleting users:", error);
    process.exit(1);
  }
};

deleteAllUsers();