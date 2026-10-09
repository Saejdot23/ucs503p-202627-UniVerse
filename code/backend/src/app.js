import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import authRouter from "./routes/auth.routes.js";
import skillRouter from "./routes/skill.routes.js";
import userRouter from "./routes/user.routes.js";
import postRouter from "./routes/post.routes.js";
import notificationRouter from "./routes/notification.routes.js";
import reportRouter from "./routes/report.routes.js";
import sessionRouter from "./routes/session.routes.js";
import chatRouter from "./routes/chat.routes.js";
import adminRouter from "./routes/admin.routes.js";

import { ApiError } from "./utils/ApiError.js";

const app = express();

// ── Security headers ──────────────────────────────────────────────────────────
app.use(helmet());

// ── CORS ──────────────────────────────────────────────────────────────────────
app.use(
    cors({
        origin: process.env.CORS_ORIGIN,
        credentials: true,
    })
);

// ── Body parsing ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// ── Rate limiting ─────────────────────────────────────────────────────────────
const globalLimiter = rateLimit({
    windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
    max: Number(process.env.RATE_LIMIT_MAX) || 200,
    standardHeaders: true,
    legacyHeaders: false,
    message: { statusCode: 429, message: "Too many requests, please try again later", success: false },
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: Number(process.env.AUTH_RATE_LIMIT_MAX) || 30,
    standardHeaders: true,
    legacyHeaders: false,
    message: { statusCode: 429, message: "Too many authentication requests", success: false },
});

app.use(globalLimiter);

// ── Routes ────────────────────────────────────────────────────────────────────
app.use("/api/v1/auth", authLimiter, authRouter);
app.use("/api/v1/skills", skillRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/posts", postRouter);
app.use("/api/v1/notifications", notificationRouter);
app.use("/api/v1/reports", reportRouter);
app.use("/api/v1/sessions", sessionRouter);
app.use("/api/v1/chat", chatRouter);
app.use("/api/v1/admin", adminRouter);

// ── Health check ─────────────────────────────────────────────────────────────
app.get("/health", (_req, res) => res.status(200).json({ status: "ok", service: "UniVerse API" }));

// ── Centralized error handler ─────────────────────────────────────────────────
app.use((err, req, res, _next) => {
    if (err instanceof ApiError) {
        return res.status(err.statusCode).json({
            statusCode: err.statusCode,
            data: err.data,
            message: err.message,
            success: err.success,
            errors: err.errors,
        });
    }

    console.error(err);

    const statusCode = err.statusCode || 500;
    return res.status(statusCode).json({
        statusCode,
        data: null,
        message: process.env.NODE_ENV === "production" ? "Internal server error" : err.message,
        success: false,
        errors: [],
    });
});

export { app };
