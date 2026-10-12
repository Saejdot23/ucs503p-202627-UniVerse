import mongoose, { Schema } from "mongoose";

const ratingSchema = new Schema(
    {
        session: {
            type: Schema.Types.ObjectId,
            ref: "Session",
            required: true,
            index: true,
        },

        // Who gave the rating
        rater: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        // Who received the rating
        ratee: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        // 1–5 stars only; no written review
        stars: {
            type: Number,
            required: true,
            min: [1, "Minimum rating is 1 star"],
            max: [5, "Maximum rating is 5 stars"],
            validate: {
                validator: Number.isInteger,
                message: "Stars must be a whole number",
            },
        },
    },
    {
        timestamps: true,
    }
);

// A rater can only rate a ratee once per session
ratingSchema.index({ session: 1, rater: 1 }, { unique: true });
ratingSchema.index({ ratee: 1 });

export const Rating = mongoose.model("Rating", ratingSchema);
