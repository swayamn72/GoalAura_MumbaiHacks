import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import User from "./models/user.model.js";
import Transaction from "./models/transaction.model.js";

// Load environment variables
dotenv.config();

// Professions array
const professions = [
    "Engineer", "Teacher", "Doctor", "Lawyer", "Accountant", "Nurse", "Architect", "Scientist", "Journalist", "Chef",
    "Mechanic", "Pharmacist", "Dentist", "Veterinarian", "Psychologist", "Graphic Designer", "Software Developer", "Data Analyst",
    "Marketing Manager", "Sales Representative", "HR Specialist", "Financial Advisor", "Electrician", "Plumber", "Carpenter",
    "Painter", "Photographer", "Musician", "Actor", "Writer", "Librarian", "Social Worker", "Police Officer", "Firefighter",
    "Pilot", "Flight Attendant", "Tour Guide", "Event Planner", "Real Estate Agent", "Insurance Agent", "Consultant",
    "Researcher", "Professor", "Student", "Entrepreneur", "Freelancer", "Manager", "Executive", "Analyst", "Specialist"
];

// Categories for transactions
const transactionCategories = [
    'Food & Dining', 'Entertainment', 'Shopping', 'Travel', 'Bills & Utilities', 'Healthcare', 'Education', 'Salary', 'Freelance', 'Investment', 'Other'
];

// Function to generate random users
const generateUsers = async (count) => {
    const users = [];
    for (let i = 0; i < count; i++) {
        const firstName = `User${i + 1}`;
        const lastName = `Mock${i + 1}`;
        const fullName = `${firstName} ${lastName}`;
        const email = `mockuser${i + 1}@example.com`;
        const password = await bcrypt.hash("password123", 10); // Hash password
        const profession = professions[Math.floor(Math.random() * professions.length)];
        const monthlyIncome = Math.floor(Math.random() * 100000) + 30000; // Random income between 30k-130k
        const location = ["Mumbai", "Delhi", "Bangalore", "Chennai", "Pune", "Hyderabad"][Math.floor(Math.random() * 6)];

        users.push({
            fullName,
            email,
            password,
            phone: `+91${Math.floor(Math.random() * 9000000000) + 1000000000}`,
            location,
            occupation: profession,
            monthlyIncome: monthlyIncome.toString(),
            preferences: {
                currency: "INR",
                language: "English",
                theme: "Light",
                shareUsageData: Math.random() > 0.5,
                participateInCircles: Math.random() > 0.5
            },
            notifications: {
                goalMilestones: Math.random() > 0.5,
                spendingAlerts: Math.random() > 0.5,
                sideHustleOpportunities: Math.random() > 0.5,
                socialCircleUpdates: Math.random() > 0.5,
                weeklyReports: Math.random() > 0.5,
                marketingEmails: Math.random() > 0.5
            },
            security: {
                twoFactorEnabled: Math.random() > 0.5,
                lastPasswordChange: new Date()
            },
            stats: {
                activeGoals: Math.floor(Math.random() * 5),
                totalSaved: `₹${Math.floor(Math.random() * 50000)}`,
                goalsAchieved: Math.floor(Math.random() * 10),
                sideHustleIncome: `₹${Math.floor(Math.random() * 20000)}`
            }
        });
    }
    return users;
};

// Function to generate random transactions for a user
const generateTransactions = (userId, count) => {
    const transactions = [];
    for (let i = 0; i < count; i++) {
        const type = Math.random() > 0.5 ? 'deposit' : 'withdrawal';
        const amount = Math.floor(Math.random() * 10000) + 100; // Random amount between 100-10100
        const category = transactionCategories[Math.floor(Math.random() * transactionCategories.length)];
        const description = `${type === 'deposit' ? 'Income' : 'Expense'} ${i + 1}`;
        const transactionDate = new Date(Date.now() - Math.floor(Math.random() * 365 * 24 * 60 * 60 * 1000)); // Random date within last year

        transactions.push({
            userId,
            amount,
            type,
            description,
            category,
            currency: 'INR',
            transactionDate,
            status: 'completed'
        });
    }
    return transactions;
};

const addMockData = async () => {
    try {
        // Connect to database
        await connectDB();
        console.log("Connected to database");

        // Generate and insert 50 users
        const users = await generateUsers(50);
        const insertedUsers = await User.insertMany(users);
        console.log(`Inserted ${insertedUsers.length} users`);

        // Generate and insert transactions (2-4 per user, total ~150)
        let totalTransactions = 0;
        for (const user of insertedUsers) {
            const transactionCount = Math.floor(Math.random() * 3) + 2; // 2-4 transactions
            const transactions = generateTransactions(user._id, transactionCount);
            await Transaction.insertMany(transactions);
            totalTransactions += transactionCount;
        }
        console.log(`Inserted ${totalTransactions} transactions`);

        console.log("Mock data added successfully!");
    } catch (error) {
        console.error("Error adding mock data:", error);
    } finally {
        // Close database connection
        await mongoose.connection.close();
        console.log("Database connection closed");
    }
};

// Run the script
addMockData();
