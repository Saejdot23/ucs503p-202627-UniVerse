import crypto from "node:crypto";
import fs from "node:fs";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { OAuth2Client } from "google-auth-library";

import { User } from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";
import { parseDurationToMs } from "../utils/time.js";

const THAPAR_EMAIL_REGEX = /^[^@\s]+@thapar\.edu$/i;
const OAUTH_STATE_COOKIE = "googleOAuthState";
const UPDATABLE_PROFILE_FIELDS = ["fullName", "bio", "degree", "branch", "year", "EndYear", "CGPA", "username"];

const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.COOKIE_SAME_SITE || "lax",
};

const oauthStateCookieOptions = { ...cookieOptions, maxAge: 10 * 60 * 1000 };

const getGoogleClient = () => {
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET || !process.env.GOOGLE_CALLBACK_URL) {
        throw new ApiError(500, "Google authentication is not configured");
    }

    return new OAuth2Client(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_CALLBACK_URL
    );
};

const getFrontendUrl = () => process.env.FRONTEND_URL || process.env.CORS_ORIGIN;

const redirectOAuthError = (res, message) => {
    const frontendUrl = getFrontendUrl();
    if (!frontendUrl) return res.status(401).json(new ApiResponse(401, null, message));

    const redirectUrl = new URL(frontendUrl);
    redirectUrl.searchParams.set("authError", message);
    return res.redirect(redirectUrl.toString());
};

const removeTempFileIfExists = (path) => {
    try {
        if (path && fs.existsSync(path)) fs.unlinkSync(path);
    } catch (error) {
        console.error("Failed to remove temp file:", error?.message);
    }
};

const generateAccessAndRefreshTokens = async (userId) => {
    const user = await User.findById(userId);
    if (!user) throw new ApiError(404, "User not found");

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = await bcrypt.hash(refreshToken, 10);
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
};

const setAuthCookies = (res, accessToken, refreshToken) =>
    res
        .cookie("accessToken", accessToken, {
            ...cookieOptions,
            maxAge: parseDurationToMs(process.env.ACCESS_TOKEN_EXPIRY, 15 * 60 * 1000),
        })
        .cookie("refreshToken", refreshToken, {
            ...cookieOptions,
            maxAge: parseDurationToMs(process.env.REFRESH_TOKEN_EXPIRY, 7 * 24 * 60 * 60 * 1000),
        });

const createAvailableUsername = async (email) => {
    const baseUsername = email.split("@")[0].toLowerCase().replace(/[^a-z0-9_]/g, "").slice(0, 25) || "student";
    let username = baseUsername;
    let suffix = 1;

    while (await User.exists({ username })) {
        username = `${baseUsername.slice(0, 25 - String(suffix).length)}${suffix}`;
        suffix += 1;
    }
    return username;
};

const findOrCreateGoogleUser = async ({ googleId, email, fullName, avatar }) => {
    let user = await User.findOne({ googleId });

    if (!user) {
        user = await User.findOne({ email });
        if (user?.googleId && user.googleId !== googleId) {
            throw new ApiError(409, "This email is linked to a different Google account");
        }
    }

    if (user) {
        const updates = {};
        if (!user.googleId) updates.googleId = googleId;
        if (!user.avatar && avatar) updates.avatar = avatar;
        if (Object.keys(updates).length) user = await User.findByIdAndUpdate(user._id, updates, { new: true });
        return user;
    }

    return User.create({
        googleId,
        username: await createAvailableUsername(email),
        fullName: fullName || email.split("@")[0],
        email,
        avatar: avatar || "",
    });
};

const startGoogleAuth = asyncHandler(async (req, res) => {
    const state = crypto.randomBytes(32).toString("hex");
    const googleClient = getGoogleClient();
    const authorizationUrl = googleClient.generateAuthUrl({
        access_type: "online",
        scope: ["openid", "email", "profile"],
        state,
        prompt: "select_account",
    });

    return res.cookie(OAUTH_STATE_COOKIE, state, oauthStateCookieOptions).redirect(authorizationUrl);
});

const googleAuthCallback = asyncHandler(async (req, res) => {
    const { code, state } = req.query;
    const savedState = req.cookies?.[OAUTH_STATE_COOKIE];
    res.clearCookie(OAUTH_STATE_COOKIE, oauthStateCookieOptions);

    if (typeof code !== "string" || typeof state !== "string" || typeof savedState !== "string" ||
        state.length !== savedState.length ||
        !crypto.timingSafeEqual(Buffer.from(state), Buffer.from(savedState))) {
        return redirectOAuthError(res, "Invalid OAuth state");
    }

    try {
        const googleClient = getGoogleClient();
        const { tokens } = await googleClient.getToken(code);
        const ticket = await googleClient.verifyIdToken({
            idToken: tokens.id_token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        const email = payload?.email?.toLowerCase().trim();

        if (!email || payload.email_verified !== true) {
            return redirectOAuthError(res, "Google did not provide a verified email");
        }
        if (!THAPAR_EMAIL_REGEX.test(email)) {
            return redirectOAuthError(res, "Only @thapar.edu Google accounts are allowed");
        }

        const user = await findOrCreateGoogleUser({
            googleId: payload.sub,
            email,
            fullName: payload.name,
            avatar: payload.picture,
        });
        const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);
        const loggedInUser = await User.findById(user._id);
        const frontendUrl = getFrontendUrl();

        setAuthCookies(res, accessToken, refreshToken);
        if (frontendUrl) return res.redirect(new URL("/", frontendUrl).toString());
        return res.status(200).json(new ApiResponse(200, { user: loggedInUser, accessToken }, "Login successful"));
    } catch (error) {
        if (error instanceof ApiError) return redirectOAuthError(res, error.message);
        console.error("Google OAuth callback failed:", error?.message);
        return redirectOAuthError(res, "Google authentication failed");
    }
});

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
    if (!incomingRefreshToken) throw new ApiError(401, "Refresh token is missing");

    let decoded;
    try {
        decoded = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
    } catch {
        throw new ApiError(401, "Invalid or expired refresh token");
    }

    const user = await User.findById(decoded._id).select("+refreshToken");
    if (!user || !user.refreshToken || !(await bcrypt.compare(incomingRefreshToken, user.refreshToken))) {
        throw new ApiError(401, "Invalid refresh token");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);
    return setAuthCookies(res, accessToken, refreshToken)
        .status(200)
        .json(new ApiResponse(200, { accessToken }, "Access token refreshed"));
});

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(req.user._id, { $unset: { refreshToken: 1 } });
    return res.clearCookie("accessToken", cookieOptions).clearCookie("refreshToken", cookieOptions)
        .status(200).json(new ApiResponse(200, {}, "Logged out successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) =>
    res.status(200).json(new ApiResponse(200, req.user, "Current user fetched successfully")));

const updateProfile = asyncHandler(async (req, res) => {
    const updates = {};
    for (const field of UPDATABLE_PROFILE_FIELDS) {
        if (req.body[field] !== undefined) updates[field] = req.body[field];
    }
    if (!Object.keys(updates).length) throw new ApiError(400, "No valid fields provided to update");

    if (updates.username) {
        updates.username = String(updates.username).toLowerCase().trim();
        if (await User.findOne({ username: updates.username, _id: { $ne: req.user._id } })) {
            throw new ApiError(409, "Username is already taken");
        }
    }
    if (updates.CGPA !== undefined) {
        updates.CGPA = Number(updates.CGPA);
        if (Number.isNaN(updates.CGPA) || updates.CGPA < 0 || updates.CGPA > 10) {
            throw new ApiError(400, "CGPA must be between 0 and 10");
        }
    }

    try {
        const updatedUser = await User.findByIdAndUpdate(req.user._id, { $set: updates }, { new: true, runValidators: true });
        return res.status(200).json(new ApiResponse(200, updatedUser, "Profile updated successfully"));
    } catch (error) {
        if (error?.code === 11000) throw new ApiError(409, "Username is already in use");
        throw error;
    }
});

const updateAvatar = asyncHandler(async (req, res) => {
    const avatarLocalPath = req.file?.path;
    if (!avatarLocalPath) throw new ApiError(400, "Avatar file is required");

    const cloudinaryResponse = await uploadOnCloudinary(avatarLocalPath, { folder: "universe/avatars", resource_type: "image" });
    removeTempFileIfExists(avatarLocalPath);
    if (!cloudinaryResponse) throw new ApiError(502, "Failed to upload avatar. Please try again.");

    const previousPublicId = req.user.avatarPublicId;
    const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        { $set: { avatar: cloudinaryResponse.secure_url, avatarPublicId: cloudinaryResponse.public_id } },
        { new: true }
    );
    if (previousPublicId) await deleteFromCloudinary(previousPublicId);
    return res.status(200).json(new ApiResponse(200, updatedUser, "Avatar updated successfully"));
});

export {
    startGoogleAuth,
    googleAuthCallback,
    refreshAccessToken,
    logoutUser,
    getCurrentUser,
    updateProfile,
    updateAvatar,
};
