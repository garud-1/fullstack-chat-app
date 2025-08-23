import User from "../models/user.model.js";

export const verifyEmail = async (req, res) => {
  const { token } = req.query;
  if (!token) {
    return res.status(400).json({ message: "Verification token is required" });
  }
  try {
    const user = await User.findOne({ verificationToken: token });
    if (!user) {
      return res.status(400).json({ message: "Invalid or expired verification token" });
    }
    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();
    res.status(200).json({ message: "Email verified successfully. You can now log in." });
  } catch (error) {
    console.log("Error in verifyEmail:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
