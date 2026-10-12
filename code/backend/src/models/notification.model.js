import mongoose, { Schema } from "mongoose";

const NOTIFICATION_TYPES = [
    "session_request",          // Someone requested a session with you
    "session_accepted",         // Your session request was accepted
    "session_rejected",         // Your session request was rejected
    "session_completion_request", // Other party marked session complete, needs your confirmation
    "session_completed",        // Session confirmed complete
    "session_cancelled",        // Session was cancelled
    "no_show_reported",         // Someone reported a no-show against you
    "admin_action",             // Admin took action on your account/content
    "new_comment",              // Someone commented on your post
    "credit_update",            // Your credits changed
];

const notificationSchema = new Schema(
    {
        recipient: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        type: {
            type: String,
            required: true,
            enum: NOTIFICATION_TYPES,
        },

        // Human-readable notification message
        message: {
            type: String,
            required: true,
            trim: true,
        },

        // Generic reference to the related entity (session, post, user, etc.)
        relatedId: {
            type: Schema.Types.ObjectId,
            default: null,
        },

        // What collection relatedId refers to
        relatedModel: {
            type: String,
            enum: ["Session", "Post", "User", "Comment", "CreditTransaction", null],
            default: null,
        },

        read: {
            type: Boolean,
            default: false,
            index: true,
        },
    },
    {
        timestamps: true,
    }
);

// Efficient unread count query for the bell icon
notificationSchema.index({ recipient: 1, read: 1, createdAt: -1 });

export const Notification = mongoose.model("Notification", notificationSchema);
