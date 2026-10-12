import { Router } from "express";
import {
    getUserProfile,
    searchUsers,
    savePost,
    unsavePost,
    getSavedPosts,
} from "../controllers/user.controllers.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import { getCreditHistory } from "../services/credit.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const router = Router();

router.use(verifyJWT);

router.route("/").get(searchUsers);
router.route("/saved").get(getSavedPosts);
router.route("/saved/:postId").post(savePost).delete(unsavePost);

// Must be before /:username to avoid route conflict
router.route("/credits/history").get(asyncHandler(async (req, res) => {
    const { page = 1, limit = 20 } = req.query;
    const data = await getCreditHistory(req.user._id, Number(page), Number(limit));
    return res.status(200).json(new ApiResponse(200, data, "Credit history fetched"));
}));

router.route("/:username").get(getUserProfile);

export default router;
