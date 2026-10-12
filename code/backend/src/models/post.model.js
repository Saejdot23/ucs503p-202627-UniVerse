import mongoose, { Schema } from "mongoose";

const postSchema = new Schema(
    {
        author: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        channel: {
            type: String,
            required: true,
            enum: ["general", "borrow_lend", "lost_found"],
            index: true,
        },

        title: {
            type: String,
            required: true,
            trim: true,
            maxlength: [200, "Title cannot exceed 200 characters"],
        },

        body: {
            type: String,
            required: true,
            trim: true,
            maxlength: [5000, "Body cannot exceed 5000 characters"],
        },

        // ── Channel-specific tag ─────────────────────────────────────────────
        // borrow_lend: "LEND" | "BORROW"
        // lost_found:  "LOST" | "FOUND"
        // general:     null
        tag: {
            type: String,
            enum: ["LEND", "BORROW", "LOST", "FOUND", null],
            default: null,
        },

        // ── Images (Borrow/Lend, Lost & Found only) ──────────────────────────
        // Array of { url, publicId } — max 5 entries enforced in controller
        images: [
            {
                url: { type: String, required: true },
                publicId: { type: String, required: true },
            },
        ],

        // ── Lost & Found extras ──────────────────────────────────────────────
        location: {
            type: String,
            trim: true,
            default: "",
        },

        itemDate: {
            type: Date,
            default: null,
        },

        // ── General channel voting ───────────────────────────────────────────
        upvotes: {
            type: Number,
            default: 0,
            min: 0,
        },

        downvotes: {
            type: Number,
            default: 0,
            min: 0,
        },

        // Who has voted — prevents double voting
        // Each entry: { user: ObjectId, vote: "up" | "down" }
        voters: [
            {
                user: { type: Schema.Types.ObjectId, ref: "User" },
                vote: { type: String, enum: ["up", "down"] },
            },
        ],

        // ── Post lifecycle ───────────────────────────────────────────────────
        status: {
            type: String,
            enum: ["open", "closed"],
            default: "open",
            index: true,
        },

        closedAt: {
            type: Date,
            default: null,
        },

        closedBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

// Compound index for efficient channel feed queries (newest first within channel)
postSchema.index({ channel: 1, createdAt: -1 });
postSchema.index({ author: 1, createdAt: -1 });

// Validate tag is required for borrow_lend and lost_found
// Mongoose 9: pre hooks no longer receive next
postSchema.pre("validate", async function () {
    if (this.channel === "borrow_lend" && !["LEND", "BORROW"].includes(this.tag)) {
        this.invalidate("tag", "Borrow/Lend posts must have tag LEND or BORROW");
    }
    if (this.channel === "lost_found" && !["LOST", "FOUND"].includes(this.tag)) {
        this.invalidate("tag", "Lost & Found posts must have tag LOST or FOUND");
    }
    if (this.channel === "general" && this.tag !== null) {
        this.tag = null;
    }
    if (this.images && this.images.length > 5) {
        this.invalidate("images", "Maximum 5 images per post");
    }
});

export const Post = mongoose.model("Post", postSchema);
