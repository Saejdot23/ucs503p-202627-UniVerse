import { Router } from "express";
import {
    getOrCreateConversation,
    listConversations,
    getMessages,
    sendMessage,
} from "../controllers/chat.controllers.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();
router.use(verifyJWT);

router.route("/conversations").get(listConversations).post(getOrCreateConversation);
router.route("/conversations/:conversationId/messages").get(getMessages).post(sendMessage);

export default router;
