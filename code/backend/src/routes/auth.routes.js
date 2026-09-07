import { Router } from "express";
import {
    startGoogleAuth,
    googleAuthCallback,
    refreshAccessToken,
    logoutUser,
    getCurrentUser,
    updateProfile,
    updateAvatar,
} from "../controllers/auth.controllers.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import { upload } from "../middlewares/multer.middlewares.js";

const router = Router();

// --- Public routes ------------------------------------------------------
router.route("/google").get(startGoogleAuth);
router.route("/google/callback").get(googleAuthCallback);
router.route("/refresh-token").post(refreshAccessToken);

// --- Protected routes (require a valid access token) --------------------
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/me").get(verifyJWT, getCurrentUser);
router.route("/profile").patch(verifyJWT, updateProfile);
router.route("/avatar").patch(verifyJWT, upload.single("avatar"), updateAvatar);

export default router;
