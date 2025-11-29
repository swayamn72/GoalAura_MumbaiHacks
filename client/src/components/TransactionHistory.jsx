import React, { useState } from 'react';
import {
  ArrowUpRight, ArrowDownLeft, Search, Filter, Download,
  Calendar, TrendingUp, TrendingDown, Wallet, DollarSign,
  CreditCard, Receipt, ChevronDown
} from 'lucide-react';

export default function TransactionHistory() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [dateRange, setDateRange] = useState('all');

  // Mock user data
  const userData = {
    fullName: 'Priya Sharma',
    stats: {
      totalSaved: '₹2,80,000',
      activeGoals: 3,
      goalsAchieved: 5
    },
    preferences: {
      currency: 'INR'
    }
  };

  // Mock transaction data
  const mockTransactions = [
    {
      _id: '1',
      amount: 15000,
      type: 'deposit',
      description: 'Monthly salary savings',
      currency: 'INR',
      createdAt: '2024-11-28T10:30:00Z'
    },
    {
      _id: '2',
      amount: 3500,
      type: 'withdrawal',
      description: 'Home bakery equipment - Mixer',
      currency: 'INR',
      createdAt: '2024-11-27T14:20:00Z'
    },
    {
      _id: '3',
      amount: 25000,
      type: 'deposit',
      description: 'Freelance project payment',
      currency: 'INR',
      createdAt: '2024-11-25T09:15:00Z'
    },
    {
      _id: '4',
      amount: 8000,
      type: 'withdrawal',
      description: 'Travel fund - Flight booking',
      currency: 'INR',
      createdAt: '2024-11-22T16:45:00Z'
    },
    {
      _id: '5',
      amount: 12000,
      type: 'deposit',
      description: 'Side hustle - Video editing',
      currency: 'INR',
      createdAt: '2024-11-20T11:30:00Z'
    },
    {
      _id: '6',
      amount: 5000,
      type: 'withdrawal',
      description: 'Emergency fund withdrawal',
      currency: 'INR',
      createdAt: '2024-11-18T13:00:00Z'
    },
    {
      _id: '7',
      amount: 18000,
      type: 'deposit',
      description: 'Monthly salary savings',
      currency: 'INR',
      createdAt: '2024-11-15T10:30:00Z'
    },
    {
      _id: '8',
      amount: 2500,
      type: 'withdrawal',
      description: 'Goal milestone celebration',
      currency: 'INR',
      createdAt: '2024-11-12T19:20:00Z'
    },
    {
      _id: '9',
      amount: 10000,
      type: 'deposit',
      description: 'Bonus from client',
      currency: 'INR',
      createdAt: '2024-11-10T08:45:00Z'
    },
    {
      _id: '10',
      amount: 7500,
      type: 'withdrawal',
      description: 'Home renovation materials',
      currency: 'INR',
      createdAt: '2024-11-08T15:30:00Z'
    },
    {
      _id: '11',
      amount: 15000,
      type: 'deposit',
      description: 'Monthly salary savings',
      currency: 'INR',
      createdAt: '2024-11-01T10:30:00Z'
    },
    {
      _id: '12',
      amount: 4000,
      type: 'withdrawal',
      description: 'Investment in learning - Online course',
      currency: 'INR',
      createdAt: '2024-10-28T12:00:00Z'
    }
  ];

  // Calculate summary
  const totalDeposits = mockTransactions
    .filter(t => t.type === 'deposit')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalWithdrawals = mockTransactions
    .filter(t => t.type === 'withdrawal')
    .reduce((sum, t) => sum + t.amount, 0);

  const netBalance = totalDeposits - totalWithdrawals;

  // Filter transactions
  const filteredTransactions = mockTransactions.filter(transaction => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || transaction.type === filterType;
    
    let matchesDate = true;
    if (dateRange !== 'all') {
      const transactionDate = new Date(transaction.createdAt);
      const now = new Date();
      const diffDays = Math.floor((now - transactionDate) / (1000 * 60 * 60 * 24));
      
      if (dateRange === '7days') matchesDate = diffDays <= 7;
      else if (dateRange === '30days') matchesDate = diffDays <= 30;
      else if (dateRange === '90days') matchesDate = diffDays <= 90;
    }
    
    return matchesSearch && matchesType && matchesDate;
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Transaction History</h1>
          <p className="text-gray-600">Track all your deposits and withdrawals in one place</p>
        </div>

        {/* Summary Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
            <div className="text-sm text-gray-600 mb-1">Total Deposits</div>
            <div className="text-2xl font-bold text-gray-900">{formatCurrency(totalDeposits)}</div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-red-500">
            <div className="flex items-center justify-between mb-2">
              <TrendingDown className="w-8 h-8 text-red-600" />
            </div>
            <div className="text-sm text-gray-600 mb-1">Total Withdrawals</div>
            <div className="text-2xl font-bold text-gray-900">{formatCurrency(totalWithdrawals)}</div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-violet-500">
            <div className="flex items-center justify-between mb-2">
              <Wallet className="w-8 h-8 text-violet-600" />
            </div>
            <div className="text-sm text-gray-600 mb-1">Net Balance</div>
            <div className="text-2xl font-bold text-gray-900">{formatCurrency(netBalance)}</div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between mb-2">
              <Receipt className="w-8 h-8 text-blue-600" />
            </div>
            <div className="text-sm text-gray-600 mb-1">Total Transactions</div>
            <div className="text-2xl font-bold text-gray-900">{mockTransactions.length}</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="grid md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all"
              />
            </div>

            {/* Type Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all appearance-none bg-white"
              >
                <option value="all">All Transactions</option>
                <option value="deposit">Deposits Only</option>
                <option value="withdrawal">Withdrawals Only</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>

            {/* Date Range Filter */}
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all appearance-none bg-white"
              >
                <option value="all">All Time</option>
                <option value="7days">Last 7 Days</option>
                <option value="30days">Last 30 Days</option>
                <option value="90days">Last 90 Days</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Export Button */}
          <div className="mt-4 flex justify-end">
            <button className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors font-medium">
              <Download className="w-4 h-4" />
              Export to CSV
            </button>
          </div>
        </div>

        {/* Transactions List */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-violet-600 to-purple-600 text-white">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Date & Time</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Description</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Type</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold">Amount</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                      No transactions found matching your filters
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((transaction) => (
                    <tr 
                      key={transaction._id} 
                      className="hover:bg-violet-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-700">{formatDate(transaction.createdAt)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            transaction.type === 'deposit' 
                              ? 'bg-green-100' 
                              : 'bg-red-100'
                          }`}>
                            {transaction.type === 'deposit' ? (
                              <ArrowDownLeft className={`w-5 h-5 text-green-600`} />
                            ) : (
                              <ArrowUpRight className={`w-5 h-5 text-red-600`} />
                            )}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {transaction.description}
                            </div>
                            <div className="text-xs text-gray-500">
                              Transaction ID: {transaction._id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          transaction.type === 'deposit'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {transaction.type === 'deposit' ? '↓ Deposit' : '↑ Withdrawal'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className={`text-lg font-bold ${
                          transaction.type === 'deposit' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.type === 'deposit' ? '+' : '-'}{formatCurrency(transaction.amount)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Completed
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Info */}
          {filteredTransactions.length > 0 && (
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Showing <span className="font-medium">{filteredTransactions.length}</span> of{' '}
                  <span className="font-medium">{mockTransactions.length}</span> transactions
                </div>
                <div className="flex gap-2">
                  <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                    Previous
                  </button>
                  <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 text-white">
            <h3 className="text-xl font-bold mb-2">Add Deposit</h3>
            <p className="text-green-100 mb-4">Record a new income or savings deposit</p>
            <button className="bg-white text-green-600 px-6 py-2 rounded-lg font-semibold hover:shadow-lg transition-all">
              Add Deposit
            </button>
          </div>

          <div className="bg-gradient-to-r from-violet-500 to-purple-600 rounded-2xl p-6 text-white">
            <h3 className="text-xl font-bold mb-2">Record Withdrawal</h3>
            <p className="text-purple-100 mb-4">Track your expenses and goal spending</p>
            <button className="bg-white text-violet-600 px-6 py-2 rounded-lg font-semibold hover:shadow-lg transition-all">
              Add Withdrawal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}