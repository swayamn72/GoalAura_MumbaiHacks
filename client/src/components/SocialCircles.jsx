import React, { useState, useEffect } from 'react';
import {
  Users, TrendingUp, TrendingDown, Shield, Eye, EyeOff,
  Target, Award, Sparkles, ArrowRight, PieChart, Wallet,
  ChevronDown, ChevronRight, Info, Lock, CheckCircle, AlertCircle
} from 'lucide-react';

export default function SocialCircles() {
  const [selectedPeer, setSelectedPeer] = useState(null);
  const [showComparison, setShowComparison] = useState(false);
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);
  const [comparisonInsights, setComparisonInsights] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [peers, setPeers] = useState([]);
  const [userTransactions, setUserTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch current user data
  useEffect(() => {
    fetchCurrentUserData();
  }, []);

  const fetchCurrentUserData = async () => {
    try {
      // Get auth token from localStorage or your auth context
      const token = localStorage.getItem('token');

      if (!token) {
        console.error('No auth token found');
        setIsLoading(false);
        return;
      }

      // Fetch user profile
      const userResponse = await fetch('http://localhost:5000/api/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!userResponse.ok) {
        throw new Error('Failed to fetch user profile');
      }

      const userData = await userResponse.json();

      // Fetch user transactions
      const transactionsResponse = await fetch('http://localhost:5000/api/transactions', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!transactionsResponse.ok) {
        throw new Error('Failed to fetch transactions');
      }

      const transactionsData = await transactionsResponse.json();

      // Extract transactions array from response
      const transactions = transactionsData.transactions || [];

      // Calculate user metrics
      const totalDeposits = transactions
        .filter(t => t.type === 'deposit')
        .reduce((sum, t) => sum + t.amount, 0);

      const totalWithdrawals = transactions
        .filter(t => t.type === 'withdrawal')
        .reduce((sum, t) => sum + t.amount, 0);

      const totalSpent = totalWithdrawals;
      const savings = totalDeposits - totalWithdrawals;
      const monthlyIncome = parseFloat(userData.monthlyIncome) || 0;
      const savingsRate = monthlyIncome > 0 ? (savings / monthlyIncome) * 100 : 0;

      // Analyze spending by category
      const categories = {};
      transactions
        .filter(t => t.type === 'withdrawal')
        .forEach(t => {
          const category = t.category || 'Other';
          categories[category] = (categories[category] || 0) + t.amount;
        });

      setCurrentUser({
        job: userData.occupation || 'Unknown',
        salary: monthlyIncome,
        savings: savings,
        savingsRate: savingsRate,
        totalSpent: totalSpent,
        categories: categories,
        location: userData.location || 'Unknown'
      });

      setUserTransactions(transactions);

      // Fetch matched peers
      await fetchMatchedPeers(userData);

      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching user data:', error);
      setIsLoading(false);
    }
  };

  const fetchMatchedPeers = async (userData) => {
    try {
      const token = localStorage.getItem('token');

      // Fetch peers with similar profiles
      const response = await fetch('http://localhost:5000/api/social-circles/matched-peers', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch matched peers');
      }

      const peersData = await response.json();
      setPeers(peersData);
    } catch (error) {
      console.error('Error fetching matched peers:', error);
      // Set empty peers array if fetch fails
      setPeers([]);
    }
  };

  const convertTransactionsToCSV = (transactions) => {
    const header = 'category,amount,type,description\n';
    const rows = transactions.map(t =>
      `${t.category || 'Other'},${t.amount},${t.type},"${t.description}"`
    ).join('\n');
    return header + rows;
  };

  const handleCompare = async (peer) => {
    setSelectedPeer(peer);
    setShowComparison(true);
    setIsGeneratingInsights(true);

    try {
      const token = localStorage.getItem('token');

      // Fetch peer's transactions
      const peerTransactionsResponse = await fetch(
        `http://localhost:5000/api/social-circles/peer-transactions/${peer._id}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!peerTransactionsResponse.ok) {
        throw new Error('Failed to fetch peer transactions');
      }

      const peerTransactions = await peerTransactionsResponse.json();

      // Convert transactions to CSV format
      const currentUserCSV = convertTransactionsToCSV(userTransactions);
      const peerUserCSV = convertTransactionsToCSV(peerTransactions);

      // Format user info for API
      const currentUserInfo = `${currentUser.job.replace(/\s+/g, '')}_${Math.round(currentUser.salary)}_${Math.round(currentUser.savings)}`;
      const otherUserInfo = `${peer.job.replace(/\s+/g, '')}_${Math.round(peer.salary)}_${Math.round(peer.savings)}`;

      // Call the comparison API
      const comparisonResponse = await fetch('http://127.0.0.1:8000/api/compare-users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          current_user_info: currentUserInfo,
          other_user_info: otherUserInfo,
          current_user_transactions: currentUserCSV,
          other_user_transactions: peerUserCSV
        })
      });

      if (!comparisonResponse.ok) {
        throw new Error(`Comparison API failed: ${comparisonResponse.status}`);
      }

      const insights = await comparisonResponse.json();
      setComparisonInsights(insights);
      setIsGeneratingInsights(false);
    } catch (error) {
      console.error('Error generating comparison:', error);
      setIsGeneratingInsights(false);
      alert('Failed to generate comparison insights. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-violet-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your financial profile...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">Failed to load user data. Please try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full mb-4">
            <Users className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Social Financial Circles
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Connect anonymously with peers who share similar financial profiles. Learn from their success strategies.
          </p>
        </div>

        {/* Privacy Notice */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 rounded-xl p-6 mb-8">
          <div className="flex items-start space-x-3">
            <Shield className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-gray-900 mb-2">🔒 100% Anonymous & Secure</h3>
              <p className="text-gray-700">
                All comparisons are anonymous. We only share financial insights, never bank balances or personal identities.
                Your data is encrypted and participation is completely voluntary.
              </p>
            </div>
          </div>
        </div>

        {/* Your Profile Overview */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Target className="w-7 h-7 text-violet-600" />
            Your Financial Profile
          </h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-violet-50 rounded-xl">
              <div className="text-3xl font-bold text-violet-600 mb-1">
                {currentUser.savingsRate.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">Savings Rate</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-xl">
              <div className="text-3xl font-bold text-green-600 mb-1">
                ₹{currentUser.savings.toLocaleString('en-IN')}
              </div>
              <div className="text-sm text-gray-600">Total Saved</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-xl">
              <div className="text-3xl font-bold text-orange-600 mb-1">
                ₹{currentUser.totalSpent.toLocaleString('en-IN')}
              </div>
              <div className="text-sm text-gray-600">Monthly Spending</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-xl">
              <div className="text-3xl font-bold text-blue-600 mb-1">
                {currentUser.job}
              </div>
              <div className="text-sm text-gray-600">Profession</div>
            </div>
          </div>
        </div>

        {/* Matched Peers */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Sparkles className="w-7 h-7 text-yellow-500" />
              Your Matched Financial Peers
            </h2>
            <span className="text-sm text-gray-600 bg-violet-100 px-3 py-1 rounded-full">
              {peers.length} matches found
            </span>
          </div>

          {peers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No matched peers found yet. Check back later!</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {peers.map((peer) => (
                <div
                  key={peer._id}
                  className="border-2 border-gray-200 rounded-2xl p-6 hover:border-violet-500 hover:shadow-xl transition-all group"
                >
                  {/* Peer Avatar & Match Score */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                      {peer.avatar || peer.job.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-600">Match Score</div>
                      <div className="text-2xl font-bold text-violet-600">{peer.similarity || 90}%</div>
                    </div>
                  </div>

                  {/* Peer Info */}
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-2 text-gray-700">
                      <Target className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium">{peer.job}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Wallet className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">₹{peer.salary.toLocaleString('en-IN')}/month</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <PieChart className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">{peer.savingsRate.toFixed(1)}% savings rate</span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="bg-green-50 rounded-lg p-3">
                      <div className="text-lg font-bold text-green-600">{peer.activeGoals || 0}</div>
                      <div className="text-xs text-gray-600">Active Goals</div>
                    </div>
                    <div className="bg-yellow-50 rounded-lg p-3">
                      <div className="text-lg font-bold text-yellow-600">{peer.goalsAchieved || 0}</div>
                      <div className="text-xs text-gray-600">Achieved</div>
                    </div>
                  </div>

                  {/* Compare Button */}
                  <button
                    onClick={() => handleCompare(peer)}
                    className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transform group-hover:scale-105 transition-all flex items-center justify-center gap-2"
                  >
                    <span>Compare Insights</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Comparison Insights Modal */}
        {showComparison && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-gradient-to-r from-violet-600 to-purple-600 text-white p-6 rounded-t-3xl z-10">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Financial Comparison Insights</h2>
                    <p className="text-purple-100">AI-powered peer comparison analysis</p>
                  </div>
                  <button
                    onClick={() => {
                      setShowComparison(false);
                      setComparisonInsights(null);
                      setSelectedPeer(null);
                    }}
                    className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <div className="p-8">
                {isGeneratingInsights ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 border-4 border-violet-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Analyzing spending patterns and generating AI-powered insights...</p>
                  </div>
                ) : comparisonInsights && (
                  <div className="space-y-6">
                    {/* Summary */}
                    <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-l-4 border-blue-500 rounded-xl p-6">
                      <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                        <Info className="w-5 h-5 text-blue-600" />
                        Summary
                      </h3>
                      <p className="text-gray-700">{comparisonInsights.summary}</p>
                    </div>

                    {/* Job Comparison */}
                    <div className="bg-white border border-gray-200 rounded-xl p-6">
                      <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <Target className="w-5 h-5 text-violet-600" />
                        Job & Income Analysis
                      </h3>
                      <p className="text-gray-700">{comparisonInsights.job_comparison}</p>
                    </div>

                    {/* Savings Insights */}
                    <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                      <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-green-600" />
                        Savings Analysis
                      </h3>
                      <p className="text-gray-700">{comparisonInsights.savings_insights}</p>
                    </div>

                    {/* Spending Patterns */}
                    <div className="bg-white border border-gray-200 rounded-xl p-6">
                      <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <PieChart className="w-5 h-5 text-orange-600" />
                        Spending Patterns Comparison
                      </h3>
                      <ul className="space-y-2">
                        {comparisonInsights.spending_patterns.map((pattern, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <ChevronRight className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                            <span className="text-gray-700">{pattern}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Recommendations */}
                    <div className="bg-violet-50 border border-violet-200 rounded-xl p-6">
                      <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-violet-600" />
                        AI-Powered Recommendations
                      </h3>
                      <ul className="space-y-3">
                        {comparisonInsights.recommendations.map((rec, idx) => (
                          <li key={idx} className="flex items-start gap-3 bg-white p-3 rounded-lg">
                            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                            <span className="text-gray-700">{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Unnecessary Expenses */}
                    <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                      <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-red-600" />
                        Areas to Reduce Spending
                      </h3>
                      <ul className="space-y-2">
                        {comparisonInsights.unnecessary_expenses.map((expense, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <TrendingDown className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                            <span className="text-gray-700">{expense}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Peer Benchmark */}
                    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-yellow-500 rounded-xl p-6">
                      <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                        <Award className="w-5 h-5 text-yellow-600" />
                        Peer Benchmark Insight
                      </h3>
                      <p className="text-gray-700">{comparisonInsights.peer_benchmark}</p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4 pt-4">
                      <button className="flex-1 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all">
                        Save Insights
                      </button>
                      <button
                        onClick={() => {
                          setShowComparison(false);
                          setComparisonInsights(null);
                          setSelectedPeer(null);
                        }}
                        className="flex-1 border-2 border-gray-300 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-all"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Benefits Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">
            Why Join Social Circles?
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Learn from Peers</h4>
              <p className="text-sm text-gray-600">
                See how others with similar income manage finances better
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">AI-Driven Insights</h4>
              <p className="text-sm text-gray-600">
                Get specific, actionable recommendations powered by Gemini AI
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-violet-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-violet-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">100% Anonymous</h4>
              <p className="text-sm text-gray-600">
                Your identity is never shared, only insights
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}