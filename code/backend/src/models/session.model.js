import mongoose, { Schema } from "mongoose";

/**
 * Session lifecycle:
 *   pending  → accepted → scheduled → completed
 *                       ↘ cancelled
 *          ↘ rejected
 */

const sessionSchema = new Schema(
    {
        mentor: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        learner: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        skill: {
            type: Schema.Types.ObjectId,
            ref: "Skill",
            required: true,
        },

        // Optional — if session was requested from a listing
        listing: {
            type: Schema.Types.ObjectId,
            ref: "SessionListing",
            default: null,
        },

        status: {
            type: String,
            required: true,
            enum: ["pending", "accepted", "rejected", "scheduled", "completed", "cancelled"],
            default: "pending",
            index: true,
        },

        // ── Scheduling (filled in via chat negotiation) ──────────────────────
        scheduledDate: { type: Date, default: null },
        scheduledTime: { type: String, default: null }, // "14:00"
        durationMinutes: { type: Number, default: null },
        mode: {
            type: String,
            enum: ["Online", "Offline", null],
            default: null,
        },
        meetingLink: { type: String, trim: true, default: null },

        // ── Completion confirmation ──────────────────────────────────────────
        // Who clicked "Mark Completed" first
        completionRequestedBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },

        completionRequestedAt: { type: Date, default: null },

        // Timestamp of final confirmed completion
        completedAt: { type: Date, default: null },

        // ── Cancellation ────────────────────────────────────────────────────
        cancelledBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },

        cancellationReason: { type: String, trim: true, default: null },

        // ── No-show ─────────────────────────────────────────────────────────
        noShowReportedBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },

        noShowResolvedAt: { type: Date, default: null },

        // ── Rating eligibility ───────────────────────────────────────────────
        // Tracks whether each participant has rated
        mentorRated: { type: Boolean, default: false },
        learnerRated: { type: Boolean, default: false },

        // ── Two-party completion confirmation ────────────────────────────────
        mentorConfirmed: { type: Boolean, default: false },
        learnerConfirmed: { type: Boolean, default: false },
    },
    {
        timestamps: true,
    }
);

sessionSchema.index({ mentor: 1, learner: 1, createdAt: -1 });
sessionSchema.index({ mentor: 1, status: 1 });
sessionSchema.index({ learner: 1, status: 1 });

export const Session = mongoose.model("Session", sessionSchema);
