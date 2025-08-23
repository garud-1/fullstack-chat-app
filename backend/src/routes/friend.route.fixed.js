import express from "express";
import {
  sendFriendRequest, acceptFriendRequest, blockUser, unblockUser, getFriends, getFriendRequests, getBlockedUsers, cancelFriendRequest, removeFriend,
  getMutualFriends, getFriendSuggestions, addFriendToGroup, removeFriendFromGroup, setFriendNickname, addFriendBadge, setPrivacy, blockUserWithReason, bulkAction, sendFriendRequestWithNote,
  createGroup, getNotifications, markNotificationsRead
} from "../controllers/friend.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

// Notification routes
router.get("/notifications", protectRoute, getNotifications);
router.post("/notifications/read", protectRoute, markNotificationsRead);

// Friend and group routes
router.post("/friends/groups", protectRoute, createGroup);
router.post("/friends/request", protectRoute, sendFriendRequest);
router.post("/friends/request-note", protectRoute, sendFriendRequestWithNote);
router.post("/friends/cancel", protectRoute, cancelFriendRequest);
router.post("/friends/remove", protectRoute, removeFriend);
router.post("/friends/group/add", protectRoute, addFriendToGroup);
router.post("/friends/group/remove", protectRoute, removeFriendFromGroup);
router.post("/friends/nickname", protectRoute, setFriendNickname);
router.post("/friends/badge", protectRoute, addFriendBadge);
router.post("/friends/privacy", protectRoute, setPrivacy);
router.post("/friends/bulk", protectRoute, bulkAction);
router.post("/block-reason", protectRoute, blockUserWithReason);
router.post("/friends/accept", protectRoute, acceptFriendRequest);
router.post("/block", protectRoute, blockUser);
router.post("/unblock", protectRoute, unblockUser);

router.get("/friends", protectRoute, getFriends);
router.get("/friends/requests", protectRoute, getFriendRequests);
router.get("/blocked", protectRoute, getBlockedUsers);
router.get("/friends/mutual", protectRoute, getMutualFriends);
router.get("/friends/suggestions", protectRoute, getFriendSuggestions);

export default router;
