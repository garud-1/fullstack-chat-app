import express from "express";
import { verifyEmail } from "../controllers/verify.controller.js";

const router = express.Router();

router.get("/verify-email", verifyEmail);

export default router;
