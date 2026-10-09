import { User } from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";

export const verifyJWT = asyncHandler(async (req, _, next) => {
    try {
        const token =
            req.cookies?.accessToken ||
            req.header("Authorization")?.replace("Bearer ", "");

        if (!token) throw new ApiError(401, "Unauthorized access");

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        const user = await User.findById(decodedToken?._id);

        if (!user) {
            throw new ApiError(401, "Invalid access token");
        }

        // ── Account status enforcement ──────────────────────────────────────
        if (user.status === "banned") {
            throw new ApiError(403, "Your account has been permanently banned");
        }

        if (user.status === "suspended") {
            const now = new Date();
            if (user.suspendedUntil && user.suspendedUntil > now) {
                throw new ApiError(
                    403,
                    `Your account is temporarily suspended until ${user.suspendedUntil.toUTCString()}`
                );
            }
            // Suspension has expired — auto-lift it
            await User.findByIdAndUpdate(user._id, {
                $set: { status: "active", suspendedUntil: null },
            });
            user.status = "active";
            user.suspendedUntil = null;
        }

        req.user = user;
        next();
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid access token");
    }
});

/** requireAdmin — must be used AFTER verifyJWT */
export const requireAdmin = (req, _res, next) => {
    if (req.user?.role !== "admin") {
        throw new ApiError(403, "Admin access required");
    }
    next();
};
