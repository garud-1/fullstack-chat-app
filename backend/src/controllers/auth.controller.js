import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/utils.js";
import express from "express";
import cloudinary from "../utils/cloudinary.js";
import { sendVerificationEmail } from "../utils/email.js";

const app = express();
app.use(express.json());

export const signup = async (req, res) => {
  console.log("Request body:", req.body);
  const { fullName, email, password } = req.body;
  try {
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters long" });
    }
    const user = await User.findOne({ email });
    if (user)
      return res
        .status(400)
        .json({ message: "User already exists with this email" });

    // hash the password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Generate 6-digit code and expiry (10 min)
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationCodeExpires = new Date(Date.now() + 10 * 60 * 1000);

    // making new user
    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
      isVerified: false,
      verificationCode,
      verificationCodeExpires,
    });

    await newUser.save();

    // Send verification code by email. If email fails, don't block signup — log error for debugging
    try {
      await sendVerificationEmail(email, verificationCode);
    } catch (emailErr) {
      console.error('sendVerificationEmail failed:', emailErr && emailErr.message ? emailErr.message : emailErr);
      // optionally record this in a monitoring system
    }

    res.status(201).json({
      message: "User created. Please check your email for the verification code (email may be delayed).",
      email,
    });
  } catch (error) {
    console.log("Error in signup : ", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  console.log("Request body:", req.body);
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "user not exists" });
    }

    if (!user.isVerified) {
      return res.status(401).json({ message: "Please verify your email before logging in." });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "invalid credentials" });
    }

    generateToken(user._id, res);
    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,
    });
    console.log("User logged in successfully");
  } catch (error) {
    console.log("Error in login : ", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const logout = (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.log("Error in logout controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { profilePic } = req.body;
    const userId = req.user._id;

    if (!profilePic) {
      return res.status(400).json({ message: "Profile pic is required" });
    }

    const uploadResponse = await cloudinary.uploader.upload(profilePic);
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilePic: uploadResponse.secure_url },
      { new: true }
    );

    res.status(200).json(updatedUser);
  } catch (error) {
    console.log("error in update profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const checkAuth = (req, res) => {
  try {
    res.status(200).json(req.user);
  } catch (error) {
    console.log("Error in checkAuth controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};