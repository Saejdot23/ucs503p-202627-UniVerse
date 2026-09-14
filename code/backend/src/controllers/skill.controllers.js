/**
 * Skill Controllers
 *
 * Manages the global skill catalog and user skill lists (skillsToTeach / skillsToLearn).
 */

import { Skill } from "../models/skill.model.js";
import { User } from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// ── Catalog ──────────────────────────────────────────────────────────────────

/**
 * GET /api/v1/skills
 * List all skills with optional search + category filter.
 * Sorted by demandToLearn desc (teach mode default) or demandToTeach desc.
 */
export const listSkills = asyncHandler(async (req, res) => {
    const { q, category, sort = "demandToLearn", page = 1, limit = 30 } = req.query;

    const filter = {};
    if (q) filter.name = { $regex: q.trim(), $options: "i" };
    if (category && ["Tech", "Non-tech"].includes(category)) filter.category = category;

    const validSorts = { demandToLearn: -1, demandToTeach: -1, name: 1 };
    const sortField = validSorts[sort] !== undefined ? sort : "demandToLearn";
    const sortDir = validSorts[sortField];

    const skip = (Number(page) - 1) * Number(limit);

    const [skills, total] = await Promise.all([
        Skill.find(filter).sort({ [sortField]: sortDir }).skip(skip).limit(Number(limit)),
        Skill.countDocuments(filter),
    ]);

    return res.status(200).json(
        new ApiResponse(200, { skills, total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) }, "Skills fetched")
    );
});

/**
 * GET /api/v1/skills/:id
 * Get a single skill by ID.
 */
export const getSkillById = asyncHandler(async (req, res) => {
    const skill = await Skill.findById(req.params.id);
    if (!skill) throw new ApiError(404, "Skill not found");
    return res.status(200).json(new ApiResponse(200, skill, "Skill fetched"));
});

/**
 * POST /api/v1/skills
 * Create a new skill (auto-normalised to lowercase).
 * Any authenticated user may create; duplicates return the existing skill.
 */
export const createSkill = asyncHandler(async (req, res) => {
    const { name, category } = req.body;
    if (!name?.trim()) throw new ApiError(400, "Skill name is required");
    if (!["Tech", "Non-tech"].includes(category)) {
        throw new ApiError(400, "Category must be Tech or Non-tech");
    }

    const normalized = name.trim().replace(/\s+/g, " ").toLowerCase();

    // Return existing skill if already in catalog
    const existing = await Skill.findOne({ name: normalized });
    if (existing) {
        return res.status(200).json(new ApiResponse(200, existing, "Skill already exists in catalog"));
    }

    const skill = await Skill.create({ name: normalized, category });
    return res.status(201).json(new ApiResponse(201, skill, "Skill created"));
});

// ── User skill list management ────────────────────────────────────────────────

/**
 * GET /api/v1/skills/my
 * Return the authenticated user's teach + learn skill lists (populated).
 */
export const getMySkills = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id)
        .populate("skillsToTeach", "name category demandToLearn demandToTeach")
        .populate("skillsToLearn", "name category demandToLearn demandToTeach");

    return res.status(200).json(
        new ApiResponse(200, { skillsToTeach: user.skillsToTeach, skillsToLearn: user.skillsToLearn }, "My skills fetched")
    );
});

/**
 * POST /api/v1/skills/my/teach
 * Add a skill to the authenticated user's skillsToTeach list.
 */
export const addTeachSkill = asyncHandler(async (req, res) => {
    const { skillId } = req.body;
    if (!skillId) throw new ApiError(400, "skillId is required");

    const skill = await Skill.findById(skillId);
    if (!skill) throw new ApiError(404, "Skill not found");

    const user = await User.findById(req.user._id);

    if (user.skillsToTeach.some((s) => s.toString() === skillId)) {
        throw new ApiError(409, "Skill already in your teach list");
    }

    user.skillsToTeach.push(skillId);
    await user.save();

    // Increment demand counter
    await Skill.findByIdAndUpdate(skillId, { $inc: { demandToTeach: 1 } });

    const updated = await User.findById(req.user._id)
        .populate("skillsToTeach", "name category demandToLearn demandToTeach");

    return res.status(200).json(new ApiResponse(200, updated, "Skill added to teach list"));
});

/**
 * DELETE /api/v1/skills/my/teach/:skillId
 * Remove a skill from the authenticated user's skillsToTeach list.
 */
export const removeTeachSkill = asyncHandler(async (req, res) => {
    const { skillId } = req.params;
    const user = await User.findById(req.user._id);

    const before = user.skillsToTeach.length;
    user.skillsToTeach = user.skillsToTeach.filter((s) => s.toString() !== skillId);

    if (user.skillsToTeach.length === before) {
        throw new ApiError(404, "Skill not found in your teach list");
    }

    await user.save();
    await Skill.findByIdAndUpdate(skillId, { $inc: { demandToTeach: -1 } });
    // Ensure floor at 0
    await Skill.updateOne({ _id: skillId, demandToTeach: { $lt: 0 } }, { $set: { demandToTeach: 0 } });

    return res.status(200).json(new ApiResponse(200, {}, "Skill removed from teach list"));
});

/**
 * POST /api/v1/skills/my/learn
 * Add a skill to the authenticated user's skillsToLearn list.
 */
export const addLearnSkill = asyncHandler(async (req, res) => {
    const { skillId } = req.body;
    if (!skillId) throw new ApiError(400, "skillId is required");

    const skill = await Skill.findById(skillId);
    if (!skill) throw new ApiError(404, "Skill not found");

    const user = await User.findById(req.user._id);

    if (user.skillsToLearn.some((s) => s.toString() === skillId)) {
        throw new ApiError(409, "Skill already in your learn list");
    }

    user.skillsToLearn.push(skillId);
    await user.save();

    await Skill.findByIdAndUpdate(skillId, { $inc: { demandToLearn: 1 } });

    const updated = await User.findById(req.user._id)
        .populate("skillsToLearn", "name category demandToLearn demandToTeach");

    return res.status(200).json(new ApiResponse(200, updated, "Skill added to learn list"));
});

/**
 * DELETE /api/v1/skills/my/learn/:skillId
 * Remove a skill from the authenticated user's skillsToLearn list.
 */
export const removeLearnSkill = asyncHandler(async (req, res) => {
    const { skillId } = req.params;
    const user = await User.findById(req.user._id);

    const before = user.skillsToLearn.length;
    user.skillsToLearn = user.skillsToLearn.filter((s) => s.toString() !== skillId);

    if (user.skillsToLearn.length === before) {
        throw new ApiError(404, "Skill not found in your learn list");
    }

    await user.save();
    await Skill.findByIdAndUpdate(skillId, { $inc: { demandToLearn: -1 } });
    await Skill.updateOne({ _id: skillId, demandToLearn: { $lt: 0 } }, { $set: { demandToLearn: 0 } });

    return res.status(200).json(new ApiResponse(200, {}, "Skill removed from learn list"));
});

// ── Skill discovery for Teach / Learn modes ──────────────────────────────────

/**
 * GET /api/v1/skills/teach-discovery
 * For "I Want to Teach" mode.
 * Returns skills ordered by demandToLearn desc (most learners wanting them).
 * Includes how many users want to learn each skill.
 */
export const teachDiscovery = asyncHandler(async (req, res) => {
    const { q, category, branch, year, page = 1, limit = 20 } = req.query;

    const skillFilter = {};
    if (q) skillFilter.name = { $regex: q.trim(), $options: "i" };
    if (category && ["Tech", "Non-tech"].includes(category)) skillFilter.category = category;

    const skip = (Number(page) - 1) * Number(limit);

    const skills = await Skill.find(skillFilter)
        .sort({ demandToLearn: -1 })
        .skip(skip)
        .limit(Number(limit));

    // For each skill, find users who want to learn it
    const skillIds = skills.map((s) => s._id);
    const userFilter = { skillsToLearn: { $in: skillIds } };
    if (branch) userFilter.branch = branch;
    if (year) userFilter.year = Number(year);

    const learners = await User.find(userFilter)
        .select("fullName username avatar branch year averageRating skillsToLearn")
        .limit(100);

    const skillsWithLearners = skills.map((skill) => ({
        ...skill.toObject(),
        learners: learners.filter((u) =>
            u.skillsToLearn.some((s) => s.toString() === skill._id.toString())
        ),
    }));

    const total = await Skill.countDocuments(skillFilter);

    return res.status(200).json(
        new ApiResponse(200, {
            skills: skillsWithLearners,
            total,
            page: Number(page),
            totalPages: Math.ceil(total / Number(limit)),
        }, "Teach discovery results")
    );
});

/**
 * GET /api/v1/skills/learn-discovery
 * For "I Want to Learn" mode.
 * Returns skills ordered by demandToTeach desc (most mentors offering them).
 * Includes mentor profiles for each skill.
 */
export const learnDiscovery = asyncHandler(async (req, res) => {
    const { q, category, branch, year, page = 1, limit = 20 } = req.query;

    const skillFilter = {};
    if (q) skillFilter.name = { $regex: q.trim(), $options: "i" };
    if (category && ["Tech", "Non-tech"].includes(category)) skillFilter.category = category;

    const skip = (Number(page) - 1) * Number(limit);

    const skills = await Skill.find(skillFilter)
        .sort({ demandToTeach: -1 })
        .skip(skip)
        .limit(Number(limit));

    const skillIds = skills.map((s) => s._id);
    const userFilter = { skillsToTeach: { $in: skillIds } };
    if (branch) userFilter.branch = branch;
    if (year) userFilter.year = Number(year);

    const mentors = await User.find(userFilter)
        .select("fullName username avatar branch year averageRating totalRatings skillsToTeach credits")
        .sort({ averageRating: -1 })
        .limit(100);

    const skillsWithMentors = skills.map((skill) => ({
        ...skill.toObject(),
        mentors: mentors.filter((u) =>
            u.skillsToTeach.some((s) => s.toString() === skill._id.toString())
        ),
    }));

    const total = await Skill.countDocuments(skillFilter);

    return res.status(200).json(
        new ApiResponse(200, {
            skills: skillsWithMentors,
            total,
            page: Number(page),
            totalPages: Math.ceil(total / Number(limit)),
        }, "Learn discovery results")
    );
});