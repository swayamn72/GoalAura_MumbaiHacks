import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true // Add index for better query performance
        },
        amount: {
            type: Number,
            required: true,
            min: 0 // Amount should be positive
        },
        type: {
            type: String,
            enum: ['deposit', 'withdrawal'],
            required: true,
            index: true // Add index for filtering
        },
        description: {
            type: String,
            required: true,
            trim: true
        },
        category: {
            type: String,
            enum: [
                'Food & Dining',
                'Entertainment',
                'Shopping',
                'Travel',
                'Bills & Utilities',
                'Healthcare',
                'Education',
                'Salary',
                'Freelance',
                'Investment',
                'Other'
            ],
            default: 'Other'
        },
        currency: {
            type: String,
            default: 'INR',
            uppercase: true
        },
        transactionDate: {
            type: Date,
            default: Date.now,
            index: true // Add index for date-based queries
        },
        status: {
            type: String,
            enum: ['completed', 'pending', 'failed'],
            default: 'completed'
        }
    },
    { 
        timestamps: true // This adds createdAt and updatedAt automatically
    }
);

// Compound indexes for common queries
transactionSchema.index({ userId: 1, createdAt: -1 });
transactionSchema.index({ userId: 1, type: 1 });
transactionSchema.index({ userId: 1, category: 1 });

// Virtual to check if transaction is recent (within last 24 hours)
transactionSchema.virtual('isRecent').get(function() {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return this.createdAt > oneDayAgo;
});

// Method to format amount with currency
transactionSchema.methods.getFormattedAmount = function() {
    return `${this.currency} ${this.amount.toFixed(2)}`;
};

export default mongoose.model("Transaction", transactionSchema);