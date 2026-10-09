import mongoose, { Schema } from "mongoose";

const skillSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            unique: true
        },

        category: {
            type: String,
            required: true,
            enum: ["Tech", "Non-tech"]
        },

        demandToLearn: {
            type: Number,
            min: 0,
            default: 0
        },

        demandToTeach: {
            type: Number,
            min: 0,
            default: 0
        }
    },
    {
        timestamps: true
    }
);

// Mongoose 9 no longer passes `next` to pre hooks — use async style instead.
skillSchema.pre("validate", async function () {
    if (this.name) {
        this.name = this.name
            .trim()
            .replace(/\s+/g, " ")
            .toLowerCase();
    }
});

export const Skill = mongoose.model("Skill", skillSchema);
