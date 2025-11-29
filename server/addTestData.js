import mongoose from "mongoose";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import User from "./models/user.model.js";
import Goal from "./models/goal.model.js";
import Transaction from "./models/transaction.model.js";

// Load environment variables
dotenv.config();

// Sample data
const sampleUsers = [
    {
        fullName: "John Doe",
        email: "john@example.com",
        password: "$2a$10$examplehashedpassword", // This is a placeholder, in real scenario hash properly
        age: 30,
        profession: "SoftwareEngineer",
        monthlyIncome: 80000,
        savings: 50000,
        profileCompleted: true,
    },
    {
        fullName: "Jane Smith",
        email: "jane@example.com",
        password: "$2a$10$examplehashedpassword",
        age: 28,
        profession: "SoftwareEngineer",
        monthlyIncome: 85000,
        savings: 65000,
        profileCompleted: true,
    },
    {
        fullName: "Alice Johnson",
        email: "alice@example.com",
        password: "$2a$10$examplehashedpassword",
        age: 35,
        profession: "Designer",
        monthlyIncome: 70000,
        savings: 40000,
        profileCompleted: true,
    },
];

const sampleGoals = [
    {
        dreamText: "Buy a Royal Enfield bike",
        estimatedBudget: 150000,
        status: "active",
        roadmap: {
            dreamType: "Vehicle",
            estimatedCost: 150000,
            months: 12,
            monthlySaving: 12500,
            savingPercentage: 15.6,
            milestones: ["Save initial 20%", "Research models", "Purchase bike"],
            isRealistic: true,
            realityCheck: "Feasible with current income",
            challenges: ["Market fluctuations"],
            proTips: ["Look for discounts", "Maintain emergency fund"],
            alternatives: ["Consider used bike", "Opt for financing"],
        },
    },
    {
        dreamText: "Go on a European vacation",
        estimatedBudget: 200000,
        status: "active",
        roadmap: {
            dreamType: "Travel",
            estimatedCost: 200000,
            months: 18,
            monthlySaving: 11111,
            savingPercentage: 13.9,
            milestones: ["Book flights", "Plan itinerary", "Reserve hotels"],
            isRealistic: true,
            realityCheck: "Requires disciplined saving",
            challenges: ["Currency exchange", "Travel restrictions"],
            proTips: ["Book in advance", "Use travel rewards"],
            alternatives: ["Choose budget destinations", "Extend timeline"],
        },
    },
];

const sampleTransactions = [
    // John's transactions
    {
        amount: 5000,
        type: "withdrawal",
        description: "Grocery shopping",
        category: "Food & Dining",
        transactionDate: new Date("2024-01-15"),
    },
    {
        amount: 2000,
        type: "withdrawal",
        description: "Uber rides",
        category: "Travel",
        transactionDate: new Date("2024-01-16"),
    },
    {
        amount: 80000,
        type: "deposit",
        description: "Monthly salary",
        category: "Salary",
        transactionDate: new Date("2024-01-01"),
    },
    {
        amount: 3000,
        type: "withdrawal",
        description: "Movie tickets and dinner",
        category: "Entertainment",
        transactionDate: new Date("2024-01-20"),
    },
    // Jane's transactions
    {
        amount: 4500,
        type: "withdrawal",
        description: "Restaurant dinner",
        category: "Food & Dining",
        transactionDate: new Date("2024-01-15"),
    },
    {
        amount: 1500,
        type: "withdrawal",
        description: "Bus pass",
        category: "Travel",
        transactionDate: new Date("2024-01-16"),
    },
    {
        amount: 85000,
        type: "deposit",
        description: "Monthly salary",
        category: "Salary",
        transactionDate: new Date("2024-01-01"),
    },
    {
        amount: 2500,
        type: "withdrawal",
        description: "Concert tickets",
        category: "Entertainment",
        transactionDate: new Date("2024-01-20"),
    },
    // Alice's transactions
    {
        amount: 6000,
        type: "withdrawal",
        description: "Weekly groceries",
        category: "Food & Dining",
        transactionDate: new Date("2024-01-15"),
    },
    {
        amount: 2500,
        type: "withdrawal",
        description: "Taxi fares",
        category: "Travel",
        transactionDate: new Date("2024-01-16"),
    },
    {
        amount: 70000,
        type: "deposit",
        description: "Monthly salary",
        category: "Salary",
        transactionDate: new Date("2024-01-01"),
    },
    {
        amount: 4000,
        type: "withdrawal",
        description: "Shopping spree",
        category: "Shopping",
        transactionDate: new Date("2024-01-20"),
    },
];

const addTestData = async () => {
    try {
        // Connect to database
        await connectDB();
        console.log("Connected to database");

        // Clear existing data (optional, for fresh start)
        await User.deleteMany({});
        await Goal.deleteMany({});
        await Transaction.deleteMany({});
        console.log("Cleared existing data");

        // Insert users
        const insertedUsers = await User.insertMany(sampleUsers);
        console.log(`Inserted ${insertedUsers.length} users`);

        // Insert goals for each user
        for (let i = 0; i < insertedUsers.length; i++) {
            const user = insertedUsers[i];
            const userGoals = sampleGoals.map((goal) => ({
                ...goal,
                user: user._id,
            }));
            await Goal.insertMany(userGoals);
        }
        console.log(`Inserted goals for ${insertedUsers.length} users`);

        // Insert transactions for each user
        const transactionChunks = [
            sampleTransactions.slice(0, 4), // John's transactions
            sampleTransactions.slice(4, 8), // Jane's transactions
            sampleTransactions.slice(8, 12), // Alice's transactions
        ];

        for (let i = 0; i < insertedUsers.length; i++) {
            const user = insertedUsers[i];
            const userTransactions = transactionChunks[i].map((txn) => ({
                ...txn,
                userId: user._id,
            }));
            await Transaction.insertMany(userTransactions);
        }
        console.log(`Inserted transactions for ${insertedUsers.length} users`);

        console.log("Test data added successfully!");
    } catch (error) {
        console.error("Error adding test data:", error);
    } finally {
        // Close database connection
        await mongoose.connection.close();
        console.log("Database connection closed");
    }
};

// Run the script
addTestData();
