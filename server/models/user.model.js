import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, default: "" },
    location: { type: String, default: "" },
    dateOfBirth: { type: Date },
    occupation: { type: String, default: "" },
    monthlyIncome: { type: String, default: "" },
    preferences: {
      currency: { type: String, default: "INR" },
      language: { type: String, default: "English" },
      theme: { type: String, default: "Light" },
      shareUsageData: { type: Boolean, default: true },
      participateInCircles: { type: Boolean, default: true }
    },
    notifications: {
      goalMilestones: { type: Boolean, default: true },
      spendingAlerts: { type: Boolean, default: true },
      sideHustleOpportunities: { type: Boolean, default: true },
      socialCircleUpdates: { type: Boolean, default: true },
      weeklyReports: { type: Boolean, default: true },
      marketingEmails: { type: Boolean, default: false }
    },
    security: {
      twoFactorEnabled: { type: Boolean, default: false },
      lastPasswordChange: { type: Date, default: Date.now }
    },
    stats: {
      activeGoals: { type: Number, default: 0 },
      totalSaved: { type: String, default: "₹0" },
      goalsAchieved: { type: Number, default: 0 },
      sideHustleIncome: { type: String, default: "₹0" }
    }
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
