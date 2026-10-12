import mongoose, { Schema } from "mongoose";

const conversationSchema = new Schema(
    {
        // Stable key: alphabetically sorted pair of participant IDs joined by "_"
        // Ensures exactly one conversation between any two users.
        conversationKey: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },

        participants: [
            {
                type: Schema.Types.ObjectId,
                ref: "User",
                required: true,
            },
        ],

        // Snapshot of the most recent message for the conversation list UI
        lastMessage: {
            type: String,
            default: "",
        },

        lastMessageAt: {
            type: Date,
            default: null,
        },
    },
    { timestamps: true }
);

conversationSchema.index({ participants: 1, updatedAt: -1 });

export const Conversation = mongoose.model("Conversation", conversationSchema);
