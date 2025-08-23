import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    fullName: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    profilePic: {
      type: String,
      default: "",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    friends: [{
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      since: { type: Date, default: Date.now },
      nickname: { type: String, default: "" },
      badges: [{ type: String }],
      status: { type: String, enum: ['online', 'offline', 'away'], default: 'offline' }
    }],
    friendRequests: [{
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      note: { type: String, default: "" },
      date: { type: Date, default: Date.now },
      status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' }
    }],
    notifications: [{
      type: { type: String, enum: ['friendRequest', 'message', 'system'] },
      from: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      text: String,
      read: { type: Boolean, default: false },
      createdAt: { type: Date, default: Date.now }
    }],
    blockedUsers: [{
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      reason: { type: String, default: "" },
      date: { type: Date, default: Date.now },
    }],
    friendGroups: [{
      name: { type: String, required: true },
      members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
      createdAt: { type: Date, default: Date.now }
    }],
    privacy: {
      canReceiveRequests: { type: Boolean, default: true },
      showOnlineStatus: { type: Boolean, default: true },
      lastSeen: { type: Boolean, default: true }
    },
    notifications: [
      {
        type: { type: String, enum: ["friend_request", "group_invite", "info"], required: true },
        message: { type: String, required: true },
        from: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        group: { type: String },
        read: { type: Boolean, default: false },
        createdAt: { type: Date, default: Date.now },
      }
    ],
    verificationCode: {
      type: String,
    },
    verificationCodeExpires: {
      type: Date,
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;