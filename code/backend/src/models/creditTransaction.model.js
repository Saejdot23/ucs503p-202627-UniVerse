import mongoose, { Schema } from "mongoose";

const TRANSACTION_TYPES = [
    "initial_credit",   // 50 credits on account creation
    "session_teach",    // +10 for completed teaching session
    "session_learn",    // -5 for completed learning session
    "admin_deduct",     // Admin-applied deduction (no-show, moderation)
];

const creditTransactionSchema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        // Positive = credit added, negative = credit removed
        amount: {
            type: Number,
            required: true,
        },

        type: {
            type: String,
            required: true,
            enum: TRANSACTION_TYPES,
        },

        // Related session (if applicable)
        session: {
            type: Schema.Types.ObjectId,
            ref: "Session",
            default: null,
        },

        description: {
            type: String,
            trim: true,
            default: "",
        },

        // Balance after this transaction (snapshot for audit trail)
        balanceAfter: {
            type: Number,
            required: true,
            min: 0,
        },

        // Admin who triggered this (for admin_deduct type)
        performedBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

// Compound unique index: one transaction record per (session, user) pair
// This is the DB-level idempotency guard for credit transfers
creditTransactionSchema.index({ session: 1, user: 1, type: 1 }, {
    unique: true,
    partialFilterExpression: { session: { $ne: null } },
});

creditTransactionSchema.index({ user: 1, createdAt: -1 });

export const CreditTransaction = mongoose.model("CreditTransaction", creditTransactionSchema);
