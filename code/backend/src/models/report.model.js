import mongoose, { Schema } from "mongoose";

const reportSchema = new Schema(
    {
        reporter: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        targetType: {
            type: String,
            required: true,
            enum: ["post", "comment", "user"],
        },

        targetId: {
            type: Schema.Types.ObjectId,
            required: true,
        },

        reason: {
            type: String,
            required: true,
            trim: true,
            maxlength: [500, "Report reason cannot exceed 500 characters"],
        },

        status: {
            type: String,
            enum: ["pending", "reviewed", "dismissed"],
            default: "pending",
            index: true,
        },

        // Admin who resolved this report
        resolvedBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },

        resolvedAt: {
            type: Date,
            default: null,
        },

        // Optional notes from the admin who reviewed
        adminNotes: {
            type: String,
            trim: true,
            default: "",
        },
    },
    {
        timestamps: true,
    }
);

// Prevent the same user from filing duplicate reports against the same target
reportSchema.index({ reporter: 1, targetId: 1 }, { unique: true });
reportSchema.index({ status: 1, createdAt: -1 });
reportSchema.index({ targetType: 1, targetId: 1 });

export const Report = mongoose.model("Report", reportSchema);
