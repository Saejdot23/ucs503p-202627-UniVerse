import mongoose, { Schema } from "mongoose";

const chatMessageSchema = new Schema(
    {
        conversation: {
            type: Schema.Types.ObjectId,
            ref: "Conversation",
            required: true,
            index: true,
        },

        sender: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        // "text" = plain message
        // "session_details" = structured session info card
        // "meeting_link" = meeting URL shared in chat
        type: {
            type: String,
            required: true,
            enum: ["text", "session_details", "meeting_link"],
            default: "text",
        },

        content: {
            type: String,
            required: true,
            trim: true,
            maxlength: [2000, "Message cannot exceed 2000 characters"],
        },
    },
    { timestamps: true }
);

// Chronological message history for a conversation
chatMessageSchema.index({ conversation: 1, createdAt: 1 });

export const ChatMessage = mongoose.model("ChatMessage", chatMessageSchema);
