import express from "express";
import bcrypt from "bcryptjs";
import authMiddleware from "../middleware/auth.middleware.js";
import User from "../models/user.model.js";
import { body, validationResult } from "express-validator";

const router = express.Router();

// All profile routes require authentication
router.use(authMiddleware);

// Get user profile
router.get("/", async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select("-password");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json({ user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

// Update user profile
router.put(
    "/",
    [
        body("fullName").optional().notEmpty().withMessage("Full name cannot be empty"),
        body("email").optional().isEmail().withMessage("Valid email is required"),
        body("phone").optional(),
        body("location").optional(),
        body("dateOfBirth").optional().isISO8601().withMessage("Invalid date format"),
        body("occupation").optional(),
        body("monthlyIncome").optional()
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            console.log('Profile update request received for user:', req.user._id);
            console.log('Request body:', req.body);

            const allowedFields = [
                "fullName", "email", "phone", "location", "dateOfBirth",
                "occupation", "monthlyIncome"
            ];

            const updates = {};
            allowedFields.forEach(field => {
                if (req.body[field] !== undefined) {
                    updates[field] = req.body[field];
                }
            });

            // Handle preferences separately
            if (req.body.preferences) {
                const allowedPreferences = [
                    "currency", "language", "theme", "shareUsageData", "participateInCircles"
                ];
                allowedPreferences.forEach(pref => {
                    if (req.body.preferences[pref] !== undefined) {
                        updates[`preferences.${pref}`] = req.body.preferences[pref];
                    }
                });
            }

            console.log('Updates object:', updates);

            const user = await User.findByIdAndUpdate(
                req.user._id,
                updates,
                { new: true, runValidators: true }
            ).select("-password");

            console.log('Updated user:', user);

            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }

            res.json({
                message: "Profile updated successfully",
                user
            });
        } catch (error) {
            console.error(error);
            if (error.code === 11000) {
                return res.status(400).json({ message: "Email already exists" });
            }
            res.status(500).json({ message: "Server error" });
        }
    }
);

// Change password
router.put(
    "/password",
    [
        body("currentPassword").notEmpty().withMessage("Current password is required"),
        body("newPassword").isLength({ min: 6 }).withMessage("New password must be at least 6 characters"),
        body("confirmPassword").custom((value, { req }) => {
            if (value !== req.body.newPassword) {
                throw new Error("Passwords do not match");
            }
            return true;
        })
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { currentPassword, newPassword } = req.body;

        try {
            // Verify current password
            const isMatch = await bcrypt.compare(currentPassword, req.user.password);
            if (!isMatch) {
                return res.status(400).json({ message: "Current password is incorrect" });
            }

            // Hash new password
            const hashedPassword = await bcrypt.hash(newPassword, 10);

            // Update password and lastPasswordChange
            await User.findByIdAndUpdate(req.user._id, {
                password: hashedPassword,
                "security.lastPasswordChange": new Date()
            });

            res.json({ message: "Password changed successfully" });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Server error" });
        }
    }
);

// Update preferences
router.put("/preferences", async (req, res) => {
    try {
        const allowedPreferences = [
            "currency", "language", "theme", "shareUsageData", "participateInCircles"
        ];

        const updates = {};
        allowedPreferences.forEach(pref => {
            if (req.body[pref] !== undefined) {
                updates[`preferences.${pref}`] = req.body[pref];
            }
        });

        const user = await User.findByIdAndUpdate(
            req.user._id,
            updates,
            { new: true, runValidators: true }
        ).select("-password");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json({
            message: "Preferences updated successfully",
            user
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

// Update notifications
router.put("/notifications", async (req, res) => {
    try {
        const allowedNotifications = [
            "goalMilestones", "spendingAlerts", "sideHustleOpportunities",
            "socialCircleUpdates", "weeklyReports", "marketingEmails"
        ];

        const updates = {};
        allowedNotifications.forEach(notification => {
            if (req.body[notification] !== undefined) {
                updates[`notifications.${notification}`] = req.body[notification];
            }
        });

        const user = await User.findByIdAndUpdate(
            req.user._id,
            updates,
            { new: true, runValidators: true }
        ).select("-password");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json({
            message: "Notification preferences updated successfully",
            user
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

// Update two-factor authentication
router.put("/security/2fa", async (req, res) => {
    try {
        const { enabled } = req.body;

        const user = await User.findByIdAndUpdate(
            req.user._id,
            { "security.twoFactorEnabled": enabled },
            { new: true, runValidators: true }
        ).select("-password");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json({
            message: `Two-factor authentication ${enabled ? 'enabled' : 'disabled'} successfully`,
            user
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

export default router;
