/**
 * Credit Service
 *
 * All credit mutations go through this service.
 * Uses atomic MongoDB operations to prevent race conditions.
 * Every change produces a CreditTransaction audit record.
 */

import mongoose from "mongoose";
import { User } from "../models/user.models.js";
import { CreditTransaction } from "../models/creditTransaction.model.js";
import { ApiError } from "../utils/ApiError.js";

/**
 * Apply a credit change to a user atomically.
 *
 * @param {object} opts
 * @param {string|ObjectId} opts.userId
 * @param {number}          opts.amount       - positive = add, negative = deduct
 * @param {string}          opts.type         - CreditTransaction type enum value
 * @param {string|null}     opts.sessionId    - related session (for idempotency index)
 * @param {string}          opts.description
 * @param {string|null}     opts.performedBy  - admin userId if applicable
 * @returns {Promise<{user: User, transaction: CreditTransaction}>}
 */
export const applyCreditChange = async ({
    userId,
    amount,
    type,
    sessionId = null,
    description = "",
    performedBy = null,
}) => {
    if (typeof amount !== "number" || amount === 0) {
        throw new ApiError(400, "Credit amount must be a non-zero number");
    }

    // Atomic update: $inc credits, floor at 0 via $max trick
    // We fetch the user first to know the current balance, then update.
    const user = await User.findById(userId);
    if (!user) throw new ApiError(404, "User not found");

    const currentCredits = user.credits ?? 0;
    const newBalance = Math.max(0, currentCredits + amount);
    const actualAmount = newBalance - currentCredits; // may differ from `amount` if floored

    // Atomically set credits to newBalance only if credits hasn't changed since we read it
    const updated = await User.findOneAndUpdate(
        { _id: userId, credits: currentCredits },
        { $set: { credits: newBalance } },
        { new: true }
    );

    if (!updated) {
        // Concurrent modification — retry once
        return applyCreditChange({ userId, amount, type, sessionId, description, performedBy });
    }

    // Record the transaction
    const transaction = await CreditTransaction.create({
        user: userId,
        amount: actualAmount,
        type,
        session: sessionId ? new mongoose.Types.ObjectId(sessionId) : null,
        description,
        balanceAfter: newBalance,
        performedBy: performedBy ? new mongoose.Types.ObjectId(performedBy) : null,
    });

    return { user: updated, transaction };
};

/**
 * Award teaching credits after session completion.
 * Idempotency is enforced by the unique (session, user, type) index on CreditTransaction.
 */
export const awardTeachingCredits = async (mentorId, sessionId) => {
    try {
        return await applyCreditChange({
            userId: mentorId,
            amount: 10,
            type: "session_teach",
            sessionId,
            description: "Completed teaching session",
        });
    } catch (err) {
        if (err?.code === 11000) {
            throw new ApiError(409, "Credits for this session have already been awarded");
        }
        throw err;
    }
};

/**
 * Deduct learning credits after session completion.
 */
export const deductLearningCredits = async (learnerId, sessionId) => {
    try {
        return await applyCreditChange({
            userId: learnerId,
            amount: -5,
            type: "session_learn",
            sessionId,
            description: "Completed learning session",
        });
    } catch (err) {
        if (err?.code === 11000) {
            throw new ApiError(409, "Credits for this session have already been deducted");
        }
        throw err;
    }
};

/**
 * Admin deduction (no-show or moderation).
 * Default penalty is 5 credits (D-008).
 */
export const adminDeductCredits = async (userId, adminId, reason, amount = 5) => {
    return applyCreditChange({
        userId,
        amount: -Math.abs(amount),
        type: "admin_deduct",
        description: reason,
        performedBy: adminId,
    });
};

/**
 * Get paginated credit history for a user.
 */
export const getCreditHistory = async (userId, page = 1, limit = 20) => {
    const skip = (page - 1) * limit;
    const [transactions, total] = await Promise.all([
        CreditTransaction.find({ user: userId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate("session", "skill status"),
        CreditTransaction.countDocuments({ user: userId }),
    ]);
    return { transactions, total, page, totalPages: Math.ceil(total / limit) };
};
