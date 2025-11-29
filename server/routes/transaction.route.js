import express from "express";
import Transaction from "../models/transaction.model.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

// POST route to create a new transaction (YOUR EXISTING ROUTE - ENHANCED)
router.post("/", authMiddleware, async (req, res) => {
    try {
        const { amount, type, description, currency, category, timestamp } = req.body;
        const userId = req.user._id; // Get userId from authenticated user

        // Validate required fields
        if (!amount || !type || !description) {
            return res.status(400).json({ message: "Amount, type, and description are required" });
        }

        // Validate type
        if (!['deposit', 'withdrawal'].includes(type)) {
            return res.status(400).json({ message: "Type must be either 'deposit' or 'withdrawal'" });
        }

        // Create new transaction
        const newTransaction = new Transaction({
            userId,
            amount: Math.abs(amount), // Ensure positive amount
            type,
            description,
            currency: currency || 'INR',
            category: category || 'Other', // Add category support
            transactionDate: timestamp ? new Date(timestamp) : new Date(), // Add custom timestamp support
            status: 'completed' // Default status
        });

        await newTransaction.save();

        res.status(201).json({
            message: "Transaction created successfully",
            transaction: newTransaction
        });
    } catch (error) {
        console.error('Transaction creation error:', error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// GET route to fetch all transactions for authenticated user
router.get("/", authMiddleware, async (req, res) => {
    try {
        const userId = req.user._id;
        const { page = 1, limit = 10, type, startDate, endDate, category } = req.query;

        // Build query
        const query = { userId };

        // Filter by type
        if (type && ['deposit', 'withdrawal'].includes(type)) {
            query.type = type;
        }

        // Filter by category
        if (category) {
            query.category = category;
        }

        // Filter by date range
        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) query.createdAt.$gte = new Date(startDate);
            if (endDate) query.createdAt.$lte = new Date(endDate);
        }

        // Fetch transactions with pagination
        const transactions = await Transaction.find(query)
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit));

        // Get total count
        const totalTransactions = await Transaction.countDocuments(query);

        // Calculate summary
        const deposits = await Transaction.aggregate([
            { $match: { userId, type: 'deposit' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);

        const withdrawals = await Transaction.aggregate([
            { $match: { userId, type: 'withdrawal' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);

        const totalDeposits = deposits.length > 0 ? deposits[0].total : 0;
        const totalWithdrawals = withdrawals.length > 0 ? withdrawals[0].total : 0;

        res.status(200).json({
            transactions,
            totalPages: Math.ceil(totalTransactions / parseInt(limit)),
            currentPage: parseInt(page),
            totalTransactions,
            summary: {
                totalDeposits,
                totalWithdrawals,
                netBalance: totalDeposits - totalWithdrawals
            }
        });
    } catch (error) {
        console.error('Fetch transactions error:', error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// GET route to fetch a single transaction by ID
router.get("/:id", authMiddleware, async (req, res) => {
    try {
        const userId = req.user._id;
        const { id } = req.params;

        const transaction = await Transaction.findOne({ _id: id, userId });

        if (!transaction) {
            return res.status(404).json({ message: "Transaction not found" });
        }

        res.status(200).json({ transaction });
    } catch (error) {
        console.error('Fetch transaction error:', error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// PUT route to update a transaction
router.put("/:id", authMiddleware, async (req, res) => {
    try {
        const userId = req.user._id;
        const { id } = req.params;
        const { amount, type, description, currency, category, status } = req.body;

        // Find transaction
        const transaction = await Transaction.findOne({ _id: id, userId });

        if (!transaction) {
            return res.status(404).json({ message: "Transaction not found" });
        }

        // Validate type if provided
        if (type && !['deposit', 'withdrawal'].includes(type)) {
            return res.status(400).json({ message: "Type must be either 'deposit' or 'withdrawal'" });
        }

        // Update fields
        if (amount !== undefined) transaction.amount = Math.abs(amount);
        if (type) transaction.type = type;
        if (description) transaction.description = description;
        if (currency) transaction.currency = currency;
        if (category) transaction.category = category;
        if (status) transaction.status = status;

        await transaction.save();

        res.status(200).json({
            message: "Transaction updated successfully",
            transaction
        });
    } catch (error) {
        console.error('Update transaction error:', error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// DELETE route to delete a transaction
router.delete("/:id", authMiddleware, async (req, res) => {
    try {
        const userId = req.user._id;
        const { id } = req.params;

        const transaction = await Transaction.findOneAndDelete({ _id: id, userId });

        if (!transaction) {
            return res.status(404).json({ message: "Transaction not found" });
        }

        res.status(200).json({ message: "Transaction deleted successfully" });
    } catch (error) {
        console.error('Delete transaction error:', error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// GET route to fetch transaction statistics
router.get("/stats/summary", authMiddleware, async (req, res) => {
    try {
        const userId = req.user._id;
        const { period = 'month' } = req.query; // month, week, year

        // Calculate date range
        const now = new Date();
        let startDate;

        switch (period) {
            case 'week':
                startDate = new Date(now.setDate(now.getDate() - 7));
                break;
            case 'year':
                startDate = new Date(now.setFullYear(now.getFullYear() - 1));
                break;
            case 'month':
            default:
                startDate = new Date(now.setMonth(now.getMonth() - 1));
        }

        // Get transactions in period
        const transactions = await Transaction.find({
            userId,
            createdAt: { $gte: startDate }
        });

        // Calculate totals
        const deposits = transactions.filter(t => t.type === 'deposit')
            .reduce((sum, t) => sum + t.amount, 0);
        
        const withdrawals = transactions.filter(t => t.type === 'withdrawal')
            .reduce((sum, t) => sum + t.amount, 0);

        // Category breakdown
        const categoryBreakdown = await Transaction.aggregate([
            { $match: { userId, createdAt: { $gte: startDate } } },
            { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } },
            { $sort: { total: -1 } }
        ]);

        res.status(200).json({
            period,
            startDate,
            endDate: new Date(),
            summary: {
                totalDeposits: deposits,
                totalWithdrawals: withdrawals,
                netBalance: deposits - withdrawals,
                transactionCount: transactions.length
            },
            categoryBreakdown: categoryBreakdown.map(cat => ({
                category: cat._id,
                total: cat.total,
                count: cat.count
            }))
        });
    } catch (error) {
        console.error('Stats error:', error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// GET route to fetch recent transactions (last 5)
router.get("/recent/list", authMiddleware, async (req, res) => {
    try {
        const userId = req.user._id;
        const { limit = 5 } = req.query;

        const transactions = await Transaction.find({ userId })
            .sort({ createdAt: -1 })
            .limit(parseInt(limit));

        res.status(200).json({ transactions });
    } catch (error) {
        console.error('Recent transactions error:', error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

export default router;