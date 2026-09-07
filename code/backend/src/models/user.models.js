import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";

const UserSchema = new Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
        },

        fullName: {
            type: String,
            required: true,
            trim: true
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^[a-zA-Z0-9._%+-]+@thapar\.edu$/, "Please use a valid Thapar college email"],
        },

        googleId: {
            type: String,
            unique: true,
            sparse: true,
            index: true,
        },

        avatar: {
            type: String,
            default: "",
        },

        // Cloudinary public_id for the current avatar, so a replaced avatar
        // can be deleted from Cloudinary instead of left as an orphaned file.
        avatarPublicId: {
            type: String,
            default: "",
        },

        degree: {
            type: String,
            default: "",
        },

        branch: {
            type: String,
            default: "",
        },

        year: {
            type: Number,
            default: 0,
        },

        EndYear: {
            type: Number,
            default: 0,
        },

        CGPA: {
            type: Number,
            min: [0, "CGPA cannot be negative"],
            max: [10, "CGPA cannot exceed 10"],
        },

        bio: {
            type: String,
            default: "",
            trim: true,
        },

        skillsToTeach: [
            {
                type: Schema.Types.ObjectId,
                ref: "Skill",
            },
        ],

        skillsToLearn: [
            {
                type: Schema.Types.ObjectId,
                ref: "Skill",
            },
        ],

        credits: {
            type: Number,
            default: 0,
            min: [0, "Credits cannot be negative"],
        },

        averageRating: {
            type: Number,
            default: 0,
            min: [0, "Rating cannot be negative"],
            max: [5, "Rating cannot exceed 5"],
        },

        totalRatings: {
            type: Number,
            default: 0,
            min: [0, "Total ratings cannot be negative"],
        },

        // bcrypt hash of the current refresh token (never the raw token),
        // so a database leak alone can't be replayed as a live session.
        refreshToken: {
            type: String,
            select: false,
        },

        role: {
            type: String,
            enum: ["student", "admin"],
            default: "student"
        },
    },
    {
        timestamps: true,
    }
);

// Generate access token
UserSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            fullName: this.fullName,
            role: this.role,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
        }
    );
};

// Generate refresh token
UserSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
        }
    );
};

export const User = mongoose.model("User", UserSchema);
