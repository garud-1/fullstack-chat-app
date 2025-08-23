import User from '../models/user.model.js';

// Get notifications for the current user
export const getNotifications = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('notifications.from', 'fullName email profilePic');
    if (!user) return res.status(404).json({ message: "User not found." });
    res.json({ notifications: user.notifications });
  } catch (err) {
    res.status(500).json({ message: "Server error." });
  }
};

// Mark all notifications as read
export const markNotificationsRead = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found." });
    user.notifications.forEach(n => n.read = true);
    await user.save();
    res.json({ message: "All notifications marked as read." });
  } catch (err) {
    res.status(500).json({ message: "Server error." });
  }
};
// Create a new group
export const createGroup = async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ message: "Group name is required." });
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found." });
    if (user.friendGroups.some(g => g.name === name)) {
      return res.status(400).json({ message: "Group with this name already exists." });
    }
    user.friendGroups.push({ name, members: [] });
    await user.save();
    res.json({ message: "Group created.", groups: user.friendGroups });
  } catch (err) {
    res.status(500).json({ message: "Server error." });
  }
};
import mongoose from "mongoose";
 
export const getMutualFriends = async (req, res) => {
  const { userId } = req.query;
  try {
    const user = await User.findById(req.user._id);
    const other = await User.findById(userId);
    if (!user || !other) return res.status(404).json({ message: "User not found." });
    const mutual = user.friends.filter(f1 => other.friends.some(f2 => f2.user.toString() === f1.user.toString()));
    res.json({ mutual });
  } catch (err) {
    res.status(500).json({ message: "Server error." });
  }
};

 
// Add friend to group
export const addFriendToGroup = async (req, res) => {
  const { groupName, friendId } = req.body;
  try {
    const user = await User.findById(req.user._id);
    let group = user.friendGroups.find(g => g.name === groupName);
    if (!group) {
      group = { name: groupName, members: [] };
      user.friendGroups.push(group);
    }
    if (!group.members.includes(friendId)) group.members.push(friendId);
    await user.save();
    res.json({ message: "Friend added to group." });
  } catch (err) {
    res.status(500).json({ message: "Server error." });
  }
};

// Remove friend from group
export const removeFriendFromGroup = async (req, res) => {
  const { groupName, friendId } = req.body;
  try {
    const user = await User.findById(req.user._id);
    let group = user.friendGroups.find(g => g.name === groupName);
    if (group) {
      group.members = group.members.filter(id => id.toString() !== friendId);
      await user.save();
    }
    res.json({ message: "Friend removed from group." });
  } catch (err) {
    res.status(500).json({ message: "Server error." });
  }
};
 
 
// Set privacy settings
export const setPrivacy = async (req, res) => {
  const { canReceiveRequests, showOnlineStatus } = req.body;
  try {
    const user = await User.findById(req.user._id);
    if (typeof canReceiveRequests === "boolean") user.privacy.canReceiveRequests = canReceiveRequests;
    if (typeof showOnlineStatus === "boolean") user.privacy.showOnlineStatus = showOnlineStatus;
    await user.save();
    res.json({ message: "Privacy updated." });
  } catch (err) {
    res.status(500).json({ message: "Server error." });
  }
};

 
 

// Set friend request note
export const sendFriendRequestWithNote = async (req, res) => {
  const { userId: targetUserId, note } = req.body;
  const userId = req.user._id;
  if (userId.toString() === targetUserId) return res.status(400).json({ message: "Cannot add yourself." });
  try {
    const targetUser = await User.findById(targetUserId);
    const user = await User.findById(userId);
    if (!targetUser) return res.status(404).json({ message: "User does not exist." });
    if (targetUser.friendRequests.some(r => r.user.toString() === userId.toString()) || targetUser.friends.some(f => f.user.toString() === userId.toString())) {
      return res.status(400).json({ message: "Already requested or friends." });
    }
    if (targetUser.blockedUsers.some(b => b.user.toString() === userId.toString()) || user.blockedUsers.some(b => b.user.toString() === targetUserId)) {
      return res.status(400).json({ message: "You cannot send a request to this user." });
    }
    targetUser.friendRequests.push({ user: userId, note });
    // push a notification for the target user
    targetUser.notifications.push({
      type: 'friend_request',
      message: `${user.fullName} sent you a friend request`,
      from: userId,
      read: false,
      createdAt: Date.now()
    });
    await targetUser.save();
    res.json({ message: "Friend request sent." });
  } catch (err) {
    res.status(500).json({ message: "Server error." });
  }
};
 
// Get current user's friend requests
export const getFriendRequests = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('friendRequests', 'fullName email profilePic');
    if (!user) return res.status(404).json({ message: "User not found." });
    res.json({ friendRequests: user.friendRequests });
  } catch (err) {
    res.status(500).json({ message: "Server error." });
  }
};
 

// Send a friend request
export const sendFriendRequest = async (req, res) => {
  const { userId: targetUserId } = req.body;
  const userId = req.user._id;
  if (userId.toString() === targetUserId) return res.status(400).json({ message: "Cannot add yourself." });
  try {
    const targetUser = await User.findById(targetUserId);
    const user = await User.findById(userId);
    if (!targetUser) return res.status(404).json({ message: "User does not exist." });
    // normalize checks: friendRequests may be stored as objects { user: id }
    const alreadyRequested = targetUser.friendRequests.some(r => (r.user ? r.user.toString() === userId.toString() : r.toString() === userId.toString()));
    const alreadyFriend = targetUser.friends.some(f => (f.user ? f.user.toString() === userId.toString() : f.toString() === userId.toString()));
    if (alreadyRequested || alreadyFriend) {
      return res.status(400).json({ message: "Already requested or friends." });
    }
    if (targetUser.blockedUsers.includes(userId) || user.blockedUsers.includes(targetUserId)) {
      return res.status(400).json({ message: "You cannot send a request to this user." });
    }
    // store as object with user field for consistency
    targetUser.friendRequests.push({ user: userId, date: Date.now(), status: 'pending' });
    // push a notification for the target user
    const sender = await User.findById(userId);
    targetUser.notifications.push({
      type: 'friend_request',
      message: `${sender?.fullName || 'Someone'} sent you a friend request`,
      from: userId,
      read: false,
      createdAt: Date.now()
    });
    await targetUser.save();
    res.json({ message: "Friend request sent." });
  } catch (err) {
    res.status(500).json({ message: "Server error." });
  }
};

// Cancel a sent friend request
export const cancelFriendRequest = async (req, res) => {
  const { userId: targetUserId } = req.body;
  const userId = req.user._id;
  try {
    const targetUser = await User.findById(targetUserId);
    if (!targetUser) return res.status(404).json({ message: "User does not exist." });
    targetUser.friendRequests = targetUser.friendRequests.filter(id => id.toString() !== userId.toString());
    await targetUser.save();
    res.json({ message: "Friend request cancelled." });
  } catch (err) {
    res.status(500).json({ message: "Server error." });
  }
};

// Remove a friend
export const removeFriend = async (req, res) => {
  const { userId: targetUserId } = req.body;
  const userId = req.user._id;
  try {
    const user = await User.findById(userId);
    const targetUser = await User.findById(targetUserId);
    if (!user || !targetUser) return res.status(404).json({ message: "User does not exist." });
    user.friends = user.friends.filter(id => id.toString() !== targetUserId);
    targetUser.friends = targetUser.friends.filter(id => id.toString() !== userId.toString());
    await user.save();
    await targetUser.save();
    res.json({ message: "Friend removed." });
  } catch (err) {
    res.status(500).json({ message: "Server error." });
  }
};

// Accept a friend request
export const acceptFriendRequest = async (req, res) => {
  const { requesterId } = req.body;
  const userId = req.user._id;
  try {
    const user = await User.findById(userId);
    const requester = await User.findById(requesterId);
    if (!user || !requester) return res.status(404).json({ message: "User not found." });
    // Find the request element whether stored as object { user } or as direct id
    const requestIndex = user.friendRequests.findIndex(r => {
      if (!r) return false;
      if (typeof r === 'string' || r instanceof String) return r.toString() === requesterId.toString();
      if (r.user) return r.user.toString() === requesterId.toString();
      return false;
    });

    // Add to friends arrays as objects for consistency
    user.friends = user.friends || [];
    requester.friends = requester.friends || [];
    // avoid duplicates
    const alreadyFriendUser = user.friends.some(f => (f.user ? f.user.toString() === requesterId.toString() : f.toString() === requesterId.toString()));
    const alreadyFriendRequester = requester.friends.some(f => (f.user ? f.user.toString() === userId.toString() : f.toString() === userId.toString()));
    if (!alreadyFriendUser) user.friends.push({ user: requesterId, since: Date.now() });
    if (!alreadyFriendRequester) requester.friends.push({ user: userId, since: Date.now() });

    // If a friend request entry exists, remove it
    if (requestIndex !== -1) {
      user.friendRequests.splice(requestIndex, 1);
    }

    // save both users
    await user.save();
    // notify the requester that request was accepted
    requester.notifications.push({
      type: 'info',
      message: `${user.fullName} accepted your friend request`,
      from: userId,
      read: false,
      createdAt: Date.now()
    });
    await requester.save();

    res.json({ message: "Friend request accepted." });
  } catch (err) {
    res.status(500).json({ message: "Server error." });
  }
};

// Block a user
export const blockUser = async (req, res) => {
  const { blockUserId } = req.body;
  const userId = req.user._id;
  if (userId === blockUserId) return res.status(400).json({ message: "Cannot block yourself." });
  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found." });
    if (!user.blockedUsers.includes(blockUserId)) {
      user.blockedUsers.push(blockUserId);
      // Remove from friends and friendRequests if present
      user.friends = user.friends.filter(id => id.toString() !== blockUserId);
      user.friendRequests = user.friendRequests.filter(id => id.toString() !== blockUserId);
      await user.save();
    }
    res.json({ message: "User blocked." });
  } catch (err) {
    res.status(500).json({ message: "Server error." });
  }
};

// Unblock a user
export const unblockUser = async (req, res) => {
  const { unblockUserId } = req.body;
  const userId = req.user._id;
  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found." });
    user.blockedUsers = user.blockedUsers.filter(id => id.toString() !== unblockUserId);
    await user.save();
    res.json({ message: "User unblocked." });
  } catch (err) {
    res.status(500).json({ message: "Server error." });
  }
};
