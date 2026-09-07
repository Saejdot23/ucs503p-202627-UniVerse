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

skillSchema.pre("validate", function (next) {
    if (this.name) {
        this.name = this.name
            .trim()
            .replace(/\s+/g, " ")
            .toLowerCase();
    }

    next();
});

export const Skill = mongoose.model("Skill", skillSchema);