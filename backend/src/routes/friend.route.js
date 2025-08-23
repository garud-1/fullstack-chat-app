import express from "express";
import {
  sendFriendRequest, acceptFriendRequest, blockUser, unblockUser, getFriendRequests, cancelFriendRequest, removeFriend,
  addFriendToGroup, removeFriendFromGroup, setPrivacy, sendFriendRequestWithNote,
  createGroup, getNotifications, markNotificationsRead
} from "../controllers/friend.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import User from "../models/user.model.js";

const router = express.Router();


// Friend and group routes
router.post("/friends/groups", protectRoute, createGroup);
router.post("/friends/request", protectRoute, sendFriendRequest);
router.post("/friends/request-note", protectRoute, sendFriendRequestWithNote);
router.post("/friends/cancel", protectRoute, cancelFriendRequest);
router.post("/friends/remove", protectRoute, removeFriend);
router.post("/friends/group/add", protectRoute, addFriendToGroup);
router.post("/friends/group/remove", protectRoute, removeFriendFromGroup);
router.post("/friends/privacy", protectRoute, setPrivacy);
router.post("/friends/accept", protectRoute, acceptFriendRequest);
router.post("/block", protectRoute, blockUser);
router.post("/unblock", protectRoute, unblockUser);
// Get all friends
router.get("/friends", protectRoute, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate("friends.user", "fullName email profilePic");
    res.json(user.friends || []);
  } catch (error) {
    console.error("Error in getFriends:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get friend requests
router.get("/friends/requests", protectRoute, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate("friendRequests.user", "fullName email profilePic");
    res.json(user.friendRequests || []);
  } catch (error) {
    console.error("Error in getFriendRequests:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get notifications
router.get("/friends/notifications", protectRoute, getNotifications);
// Mark notifications as read
router.post("/friends/notifications/read", protectRoute, markNotificationsRead);

// Get blocked users
router.get("/blocked", protectRoute, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate("blockedUsers.user", "fullName email profilePic");
    res.json(user.blockedUsers || []);
  } catch (error) {
    console.error("Error in getBlockedUsers:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get friend groups
router.get("/friends/groups", protectRoute, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate("friendGroups.members", "fullName email profilePic");
    res.json(user.friendGroups || []);
  } catch (error) {
    console.error("Error in getFriendGroups:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
