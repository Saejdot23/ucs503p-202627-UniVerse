/**
 * Chat Controllers
 *
 * Conversations are identified by a stable conversationKey:
 * alphabetically sorted pair of two participant user IDs joined by "_".
 * This guarantees exactly one conversation between any two users.
 */
import { Conversation } from "../models/conversation.model.js";
import { ChatMessage } from "../models/chatMessage.model.js";
import { User } from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const makeConversationKey = (idA, idB) =>
    [idA.toString(), idB.toString()].sort().join("_");

/**
 * POST /api/v1/chat/conversations
 * Get or create a one-to-one conversation.
 * Body: { participantId }
 */
export const getOrCreateConversation = asyncHandler(async (req, res) => {
    const { participantId } = req.body;
    if (!participantId) throw new ApiError(400, "participantId is required");

    const myId = req.user._id;
    if (participantId.toString() === myId.toString()) {
        throw new ApiError(400, "You cannot start a conversation with yourself");
    }

    const other = await User.findById(participantId).select("fullName username avatar status");
    if (!other) throw new ApiError(404, "User not found");
    if (other.status === "banned") throw new ApiError(403, "Cannot message a banned user");

    const key = makeConversationKey(myId, participantId);

    let convo = await Conversation.findOne({ conversationKey: key })
        .populate("participants", "fullName username avatar");

    if (!convo) {
        convo = await Conversation.create({
            conversationKey: key,
            participants: [myId, participantId],
        });
        await convo.populate("participants", "fullName username avatar");
    }

    return res.status(200).json(new ApiResponse(200, convo, "Conversation ready"));
});

/**
 * GET /api/v1/chat/conversations
 * List all conversations for the logged-in user, newest first.
 */
export const listConversations = asyncHandler(async (req, res) => {
    const conversations = await Conversation.find({ participants: req.user._id })
        .populate("participants", "fullName username avatar")
        .sort({ updatedAt: -1 });

    return res.status(200).json(new ApiResponse(200, conversations, "Conversations fetched"));
});

/**
 * GET /api/v1/chat/conversations/:conversationId/messages
 */
export const getMessages = asyncHandler(async (req, res) => {
    const { conversationId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const convo = await Conversation.findById(conversationId);
    if (!convo) throw new ApiError(404, "Conversation not found");

    const isParticipant = convo.participants.some(
        (p) => p.toString() === req.user._id.toString()
    );
    if (!isParticipant) throw new ApiError(403, "You are not a participant in this conversation");

    const skip = (Number(page) - 1) * Number(limit);
    const [messages, total] = await Promise.all([
        ChatMessage.find({ conversation: conversationId })
            .populate("sender", "fullName username avatar")
            .sort({ createdAt: 1 })
            .skip(skip)
            .limit(Number(limit)),
        ChatMessage.countDocuments({ conversation: conversationId }),
    ]);

    return res.status(200).json(
        new ApiResponse(200, {
            messages,
            total,
            page: Number(page),
            totalPages: Math.ceil(total / Number(limit)),
        }, "Messages fetched")
    );
});

/**
 * POST /api/v1/chat/conversations/:conversationId/messages
 * REST fallback for sending a message (primary path is Socket.IO).
 */
export const sendMessage = asyncHandler(async (req, res) => {
    const { conversationId } = req.params;
    const { content, type = "text" } = req.body;

    if (!content?.trim()) throw new ApiError(400, "Message content is required");
    if (!["text", "session_details", "meeting_link"].includes(type)) {
        throw new ApiError(400, "Invalid message type");
    }

    const convo = await Conversation.findById(conversationId);
    if (!convo) throw new ApiError(404, "Conversation not found");

    const isParticipant = convo.participants.some(
        (p) => p.toString() === req.user._id.toString()
    );
    if (!isParticipant) throw new ApiError(403, "You are not a participant in this conversation");

    const msg = await ChatMessage.create({
        conversation: conversationId,
        sender: req.user._id,
        content: content.trim(),
        type,
    });
    await msg.populate("sender", "fullName username avatar");

    // Update conversation's last message snapshot
    await Conversation.findByIdAndUpdate(conversationId, {
        lastMessage: content.trim().slice(0, 100),
        lastMessageAt: new Date(),
        updatedAt: new Date(),
    });

    return res.status(201).json(new ApiResponse(201, msg, "Message sent"));
});
