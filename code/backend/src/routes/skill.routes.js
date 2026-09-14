import { Router } from "express";
import {
    listSkills,
    getSkillById,
    createSkill,
    getMySkills,
    addTeachSkill,
    removeTeachSkill,
    addLearnSkill,
    removeLearnSkill,
    teachDiscovery,
    learnDiscovery,
} from "../controllers/skill.controllers.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();

// All skill routes require authentication
router.use(verifyJWT);

// ── Catalog ──────────────────────────────────────────────────────────────────
router.route("/").get(listSkills).post(createSkill);
router.route("/teach-discovery").get(teachDiscovery);
router.route("/learn-discovery").get(learnDiscovery);
router.route("/my").get(getMySkills);
router.route("/:id").get(getSkillById);

// ── User skill list management ────────────────────────────────────────────────
router.route("/my/teach").post(addTeachSkill);
router.route("/my/teach/:skillId").delete(removeTeachSkill);
router.route("/my/learn").post(addLearnSkill);
router.route("/my/learn/:skillId").delete(removeLearnSkill);

export default router;