import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import User from "../models/user.model.js";

const router = express.Router();

// Get matched peers
router.get("/matched-peers", authMiddleware, async (req, res) => {
    try {
        const currentUser = await User.findById(req.user._id);
        if (!currentUser) {
            return res.status(404).json({ message: "User not found" });
        }

        const { occupation, monthlyIncome } = currentUser;
        const currentIncome = parseFloat(monthlyIncome) || 0;

        // Find users with similar profiles
        const allUsers = await User.find({
            _id: { $ne: req.user._id }, // Exclude current user
            "preferences.participateInCircles": true, // Only users who opted in
            occupation: { $exists: true, $ne: "" },
            monthlyIncome: { $exists: true, $ne: "" }
        }).select("fullName occupation monthlyIncome location stats");

        // Calculate similarity scores
        const peersWithScores = allUsers.map(user => {
            const userIncome = parseFloat(user.monthlyIncome) || 0;
            const incomeDiff = Math.abs(currentIncome - userIncome);
            const incomeScore = Math.max(0, 100 - (incomeDiff / currentIncome) * 100); // Higher score for closer income

            const occupationMatch = occupation.toLowerCase() === user.occupation.toLowerCase() ? 100 : 0;

            // Combined score: 70% occupation match, 30% income proximity
            const similarity = (occupationMatch * 0.7) + (incomeScore * 0.3);

            return {
                ...user.toObject(),
                similarity: Math.round(similarity),
                job: user.occupation,
                salary: userIncome,
                savings: parseFloat(user.stats?.totalSaved?.replace('₹', '').replace(',', '') || 0),
                savingsRate: 0, // Will be calculated if needed
                activeGoals: user.stats?.activeGoals || 0,
                goalsAchieved: user.stats?.goalsAchieved || 0,
                avatar: user.fullName.substring(0, 2).toUpperCase()
            };
        });

        // Sort by similarity and take top 1-3
        const matchedPeers = peersWithScores
            .sort((a, b) => b.similarity - a.similarity)
            .slice(0, 3)
            .filter(peer => peer.similarity > 20); // Minimum similarity threshold

        // If no good matches, return at least 1 if available
        if (matchedPeers.length === 0 && peersWithScores.length > 0) {
            matchedPeers.push(peersWithScores[0]);
        }

        res.json(matchedPeers);
    } catch (error) {
        console.error("Error fetching matched peers:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// Get peer transactions (for comparison)
router.get("/peer-transactions/:peerId", authMiddleware, async (req, res) => {
    try {
        const { peerId } = req.params;

        // Import Transaction model
        const Transaction = (await import("../models/transaction.model.js")).default;

        const transactions = await Transaction.find({ user: peerId })
            .select("category amount type description createdAt")
            .sort({ createdAt: -1 });

        res.json(transactions);
    } catch (error) {
        console.error("Error fetching peer transactions:", error);
        res.status(500).json({ message: "Server error" });
    }
});

export default router;
