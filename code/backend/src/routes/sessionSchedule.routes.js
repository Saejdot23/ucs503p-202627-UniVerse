/**
 * Session Schedule Routes
 * Separate router for session scheduling functionality.
 */

import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import {
    updateSessionSchedule,
    getSessionSchedule,
} from "../controllers/sessionSchedule.controllers.js";

const router = Router();

// All routes require authentication
router.use(verifyJWT);

// Update session schedule
router.patch("/:id", updateSessionSchedule);

// Get session schedule
router.get("/:id", getSessionSchedule);

export default router;
