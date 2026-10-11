import mongoose, { Schema } from "mongoose";

// A mentor creates a SessionListing to advertise that they can teach a skill.
// Learners browse listings and request sessions based on them.

const availabilitySlotSchema = new Schema(
    {
        day: {
            type: String,
            required: true,
            enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        },
        startTime: { type: String, required: true }, // e.g. "17:00"
        endTime: { type: String, required: true },   // e.g. "20:00"
    },
    { _id: false }
);

const sessionListingSchema = new Schema(
    {
        mentor: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        skill: {
            type: Schema.Types.ObjectId,
            ref: "Skill",
            required: true,
            index: true,
        },

        title: {
            type: String,
            required: true,
            trim: true,
            maxlength: [150, "Title cannot exceed 150 characters"],
        },

        description: {
            type: String,
            trim: true,
            maxlength: [1000, "Description cannot exceed 1000 characters"],
            default: "",
        },

        mode: {
            type: String,
            required: true,
            enum: ["Online", "Offline", "Both"],
        },

        // Recurring weekly availability slots
        availability: [availabilitySlotSchema],

        // Whether this listing is currently active and accepting requests
        isActive: {
            type: Boolean,
            default: true,
            index: true,
        },
    },
    {
        timestamps: true,
    }
);

sessionListingSchema.index({ mentor: 1, skill: 1 });
sessionListingSchema.index({ skill: 1, isActive: 1 });

export const SessionListing = mongoose.model("SessionListing", sessionListingSchema);
