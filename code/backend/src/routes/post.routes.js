import { Router } from "express";
import {
    listPosts,
    getPost,
    createPost,
    closePost,
    deletePost,
    votePost,
} from "../controllers/post.controllers.js";
import { getComments, createComment, deleteComment } from "../controllers/comment.controllers.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import { upload } from "../middlewares/multer.middlewares.js";

const router = Router();

router.use(verifyJWT);

// ── Posts ─────────────────────────────────────────────────────────────────────
router.route("/").get(listPosts).post(upload.array("images", 5), createPost);
router.route("/:id").get(getPost).delete(deletePost);
router.route("/:id/close").patch(closePost);
router.route("/:id/vote").post(votePost);

// ── Comments (nested under post) ─────────────────────────────────────────────
router.route("/:postId/comments").get(getComments).post(createComment);
router.route("/:postId/comments/:commentId").delete(deleteComment);

export default router;
