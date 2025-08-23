import dotenv from "dotenv";
dotenv.config();
import express from "express";
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import verifyRoutes from "./routes/verify.route.js";
import friendRoutes from "./routes/friend.route.js";
import verifyCodeRoutes from "./routes/verifyCode.route.js";
import connectDB from "./db/db.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import { server, io, app } from "./utils/socket.js";


import path from "path";

const PORT = process.env.PORT;
const __dirname = path.resolve();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api", verifyRoutes);
app.use("/api", friendRoutes);
app.use("/api", verifyCodeRoutes);


if(process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname,"../frontend/dist")) )

  app.get("*",(req,res) => {
    res.sendFile(path.join(__dirname ,"../frontend", "dist" ,"index.html"));
  })
}
 



server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  connectDB();
});
