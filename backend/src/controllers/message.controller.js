import User from "../models/user.model.js";
import Message from "../models/message.model.js";

import cloudinary from "../utils/cloudinary.js";
import { getReceiverSocketId, io } from "../utils/socket.js";

export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select("-password");

    res.status(200).json(filteredUsers);
  } catch (error) {
    console.error("Error in getUsersForSidebar: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    });

    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getMessages controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    // verify sender and receiver and friendship/block status before doing any heavy work
    const sender = await User.findById(senderId);
    const receiver = await User.findById(receiverId);

    if (!sender) {
      return res.status(404).json({ error: 'Sender not found' });
    }

    if (!receiver) {
      return res.status(404).json({ error: 'Receiver not found' });
    }

    // Check if receiver is in sender's friends list
    const isFriend = Array.isArray(sender.friends) && sender.friends.some(f => String(f.user) === String(receiverId));
    if (!isFriend) {
      return res.status(403).json({ error: 'You can only send messages to friends.' });
    }

    // Check block lists
    const receiverBlockedSender = Array.isArray(receiver.blockedUsers) && receiver.blockedUsers.some(b => String(b.user) === String(senderId));
    if (receiverBlockedSender) {
      return res.status(403).json({ error: 'You are blocked by this user.' });
    }

    const senderBlockedReceiver = Array.isArray(sender.blockedUsers) && sender.blockedUsers.some(b => String(b.user) === String(receiverId));
    if (senderBlockedReceiver) {
      return res.status(403).json({ error: 'You have blocked this user.' });
    }

    let imageUrl;
    if (image) {
      // Upload base64 image to cloudinary
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
    });

    await newMessage.save();

    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    // create a notification for the receiver
    try {
      const receiver = await User.findById(receiverId);
      const sender = await User.findById(senderId).select('fullName profilePic');
      if (receiver) {
        receiver.notifications = receiver.notifications || [];
        receiver.notifications.push({
          type: 'message',
          message: `${sender?.fullName || 'Someone'} sent you a message`,
          from: senderId,
          read: false,
          createdAt: Date.now()
        });
        await receiver.save();
      }
      // emit a socket-level notification event
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('notification', { type: 'message', from: senderId, message: `${sender?.fullName || 'Someone'} sent you a message` });
      }
    } catch (err) {
      console.error('Failed to create message notification', err.message);
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.log("Error in sendMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};