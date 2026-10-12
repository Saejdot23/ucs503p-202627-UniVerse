/**
 * Socket.IO server
 *
 * Authentication: reads the JWT from the HTTP-only accessToken cookie
 * (same cookie used by the REST API) or Authorization header.
 *
 * Room strategy: each Conversation document gets a room = its _id string.
 *
 * Client → server events:
 *   join_conversation  { conversationId }
 *   send_message       { conversationId, content, type? }
 *
 * Server → client events:
 *   new_message        { message }
 *   error              { message }
 */

import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import * as cookie from "cookie";

import { User } from "./models/user.models.js";
import { Conversation } from "./models/conversation.model.js";
import { ChatMessage } from "./models/chatMessage.model.js";

export const initSocketServer = (httpServer) => {
    const io = new Server(httpServer, {
        cors: {
            origin: process.env.CORS_ORIGIN,
            credentials: true,
        },
    });

    // ── Authentication middleware ────────────────────────────────────────────
    io.use(async (socket, next) => {
        try {
            let token = null;

            // Prefer cookie (same flow as REST API)
            const rawCookies = socket.handshake.headers?.cookie || "";
            if (rawCookies) {
                const parsed = cookie.parseCookie(rawCookies);
                token = parsed.accessToken || null;
            }
            // Fall back to Authorization header
            if (!token) {
                const auth = socket.handshake.headers?.authorization || "";
                if (auth.startsWith("Bearer ")) token = auth.slice(7);
            }

            if (!token) return next(new Error("Authentication required"));

            const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
            const user = await User.findById(decoded._id).select(
                "_id fullName username avatar status"
            );

            if (!user) return next(new Error("User not found"));
            if (user.status === "banned") return next(new Error("Account banned"));
            if (user.status === "suspended") return next(new Error("Account suspended"));

            socket.user = user;
            next();
        } catch {
            next(new Error("Invalid or expired token"));
        }
    });

    // ── Connection handler ───────────────────────────────────────────────────
    io.on("connection", (socket) => {
        const userId = socket.user._id.toString();
        console.log(`[socket] connected: ${socket.user.username} (${userId})`);

        // ── Join a conversation room ─────────────────────────────────────────
        socket.on("join_conversation", async ({ conversationId }) => {
            try {
                if (!conversationId) {
                    return socket.emit("error", { message: "conversationId is required" });
                }

                const convo = await Conversation.findById(conversationId);
                if (!convo) return socket.emit("error", { message: "Conversation not found" });

                const isParticipant = convo.participants.some(
                    (p) => p.toString() === userId
                );
                if (!isParticipant) {
                    return socket.emit("error", { message: "Not authorized for this conversation" });
                }

                socket.join(conversationId);
                console.log(`[socket] ${socket.user.username} joined room ${conversationId}`);
            } catch (err) {
                console.error("[socket] join_conversation error:", err.message);
                socket.emit("error", { message: "Failed to join conversation" });
            }
        });

        // ── Send a message ───────────────────────────────────────────────────
        socket.on("send_message", async ({ conversationId, content, type = "text" }) => {
            try {
                if (!conversationId || !content?.trim()) {
                    return socket.emit("error", {
                        message: "conversationId and content are required",
                    });
                }

                const VALID_TYPES = ["text", "session_details", "meeting_link"];
                if (!VALID_TYPES.includes(type)) {
                    return socket.emit("error", { message: "Invalid message type" });
                }

                if (content.trim().length > 2000) {
                    return socket.emit("error", { message: "Message too long (max 2000 characters)" });
                }

                const convo = await Conversation.findById(conversationId);
                if (!convo) return socket.emit("error", { message: "Conversation not found" });

                const isParticipant = convo.participants.some(
                    (p) => p.toString() === userId
                );
                if (!isParticipant) {
                    return socket.emit("error", { message: "Not authorized" });
                }

                // Persist the message
                const msg = await ChatMessage.create({
                    conversation: conversationId,
                    sender: socket.user._id,
                    content: content.trim(),
                    type,
                });
                await msg.populate("sender", "fullName username avatar");

                // Update conversation's last-message snapshot
                await Conversation.findByIdAndUpdate(conversationId, {
                    lastMessage: content.trim().slice(0, 100),
                    lastMessageAt: new Date(),
                    updatedAt: new Date(),
                });

                // Broadcast to every socket in the room (including sender's own tab)
                io.to(conversationId).emit("new_message", { message: msg });
            } catch (err) {
                console.error("[socket] send_message error:", err.message);
                socket.emit("error", { message: "Failed to send message" });
            }
        });

        socket.on("disconnect", () => {
            console.log(`[socket] disconnected: ${socket.user.username}`);
        });
    });

    return io;
};
