import { Router } from "express";
import { listNotifications, readNotification, readAllNotifications } from "../controllers/notification.controllers.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();
router.use(verifyJWT);

router.route("/").get(listNotifications);
router.route("/read-all").patch(readAllNotifications);
router.route("/:id/read").patch(readNotification);

export default router;
