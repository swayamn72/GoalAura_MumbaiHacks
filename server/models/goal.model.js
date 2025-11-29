import mongoose from "mongoose";

const goalSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        dreamText: { type: String, required: true },
        estimatedBudget: { type: Number, required: true },
        status: { type: String, enum: ["active", "completed"], default: "active" },
        roadmap: {
            dreamType: { type: String },
            estimatedCost: { type: Number },
            months: { type: Number },
            monthlySaving: { type: Number },
            savingPercentage: { type: Number },
            milestones: [{ type: String }],
            isRealistic: { type: Boolean },
            realityCheck: { type: String },
            challenges: [{ type: String }],
            proTips: [{ type: String }],
            alternatives: [{ type: String }]
        }
    },
    { timestamps: true }
);

export default mongoose.model("Goal", goalSchema);
