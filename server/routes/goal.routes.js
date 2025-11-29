import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import Goal from "../models/goal.model.js";
import User from "../models/user.model.js";

const router = express.Router();

// All goal routes require authentication
router.use(authMiddleware);

// Save a new goal
router.post("/", async (req, res) => {
    try {
        const goalData = {
            user: req.user._id,
            dreamText: req.body.dreamText,
            estimatedBudget: req.body.estimatedBudget,
            roadmap: req.body.roadmap
        };

        const newGoal = new Goal(goalData);
        await newGoal.save();

        // Update user's active goals count
        await User.findByIdAndUpdate(req.user._id, { $inc: { "stats.activeGoals": 1 } });

        res.status(201).json({ message: "Goal saved successfully", goal: newGoal });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

// Get all goals for the authenticated user
router.get("/", async (req, res) => {
    try {
        const goals = await Goal.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.json({ goals });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

// Update goal status
router.put("/:id/status", async (req, res) => {
    try {
        const { status } = req.body;
        const goal = await Goal.findOneAndUpdate(
            { _id: req.params.id, user: req.user._id },
            { status },
            { new: true }
        );

        if (!goal) {
            return res.status(404).json({ message: "Goal not found" });
        }

        res.json({ message: "Goal status updated successfully", goal });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

export default router;
