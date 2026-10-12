import { Router } from "express";
import { verifyJWT, requireAdmin } from "../middlewares/auth.middlewares.js";
import {
    listUsers,
    suspendUser,
    banUser,
    liftRestriction,
    adminDeduct,
    adminDeletePost,
    getAdminStats,
} from "../controllers/admin.controllers.js";

const router = Router();
router.use(verifyJWT, requireAdmin);

router.get("/stats", getAdminStats);
router.get("/users", listUsers);
router.patch("/users/:userId/suspend", suspendUser);
router.patch("/users/:userId/ban", banUser);
router.patch("/users/:userId/lift", liftRestriction);
router.post("/users/:userId/deduct-credits", adminDeduct);
router.delete("/posts/:postId", adminDeletePost);

export default router;
