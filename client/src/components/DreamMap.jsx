import React, { useState } from 'react';
import {
  Target, Sparkles, TrendingUp, Calendar, Wallet, CheckCircle,
  ArrowRight, Lightbulb, PieChart, Clock, DollarSign, Award
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function DreamMap() {
  const { token } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);
  const [dreamRoadmap, setDreamRoadmap] = useState(null);
  const [incomeGrowthReport, setIncomeGrowthReport] = useState(null);
  const [formData, setFormData] = useState({
    dream_text: '',
    estimated_budget: '',
    user_income: '',
    target_months: '',
    profession: '',
    years_of_experience: ''
  });

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const fetchIncomeGrowthReport = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/income-growth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          current_income: parseFloat(formData.user_income),
          profession: formData.profession || 'Unknown',
          years_of_experience: parseInt(formData.years_of_experience) || 0,
          current_skills: [], // Can be extended later
          location: 'India'
        })
      });

      if (!response.ok) {
        throw new Error(`Income growth API failed: ${response.status}`);
      }

      const data = await response.json();
      setIncomeGrowthReport(data);
    } catch (error) {
      console.error('Error fetching income growth report:', error);
      // Don't show alert, just log the error
    }
  };

  const handleGenerateRoadmap = async () => {
    setIsGenerating(true);

    try {
      const response = await fetch('http://127.0.0.1:8000/api/dream-map', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dream_text: formData.dream_text,
          estimated_budget: parseFloat(formData.estimated_budget),
          user_monthly_income: parseFloat(formData.user_income),
          target_months: parseInt(formData.target_months)
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();

      // Map the API response to the component's expected format
      const mappedRoadmap = {
        dreamType: data.dreamType,
        estimatedCost: data.estimatedCost,
        months: data.months,
        monthlySaving: data.monthlySaving,
        savingPercentage: data.savingPercentage,
        milestones: data.actionPlan, // Map actionPlan to milestones
        isRealistic: data.isRealistic,
        realityCheck: data.realityCheck,
        challenges: data.challenges,
        proTips: data.proTips,
        alternatives: data.alternatives
      };

      setDreamRoadmap(mappedRoadmap);

      // If the dream is not realistic, fetch income growth suggestions
      if (!mappedRoadmap.isRealistic) {
        fetchIncomeGrowthReport();
      }

      setIsGenerating(false);
    } catch (error) {
      console.error('Error generating roadmap:', error);
      setIsGenerating(false);
      // You could add a state for error messages and display them to the user
      alert('Failed to generate roadmap. Please check if the server is running and try again.');
    }
  };

  const handleSaveGoal = async () => {
    if (!token) {
      alert('Please login to save goals');
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/api/goals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          dreamText: formData.dream_text,
          estimatedBudget: parseFloat(formData.estimated_budget),
          roadmap: dreamRoadmap
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to save goal: ${response.status}`);
      }

      const data = await response.json();
      alert('Goal saved successfully!');
    } catch (error) {
      console.error('Error saving goal:', error);
      alert('Failed to save goal. Please try again.');
    }
  };

  const isFormValid = formData.dream_text && formData.estimated_budget && formData.user_income && formData.target_months;

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full mb-4">
            <Target className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Dream Mapping Studio
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Tell us your dream, and we'll reverse-engineer the perfect financial roadmap to make it happen
          </p>
        </div>

        {/* Input Section */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 mb-8">
          <div className="flex items-center space-x-3 mb-8">
            <Lightbulb className="w-8 h-8 text-violet-600" />
            <h2 className="text-2xl font-bold text-gray-900">Describe Your Dream</h2>
          </div>

          <div className="space-y-6">
            {/* Dream Text Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                What's your dream? <span className="text-red-500">*</span>
              </label>
              <textarea
                name="dream_text"
                value={formData.dream_text}
                onChange={handleInputChange}
                placeholder="e.g., I want to buy a Royal Enfield motorcycle, start a home bakery, travel to Europe..."
                rows="4"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all resize-none"
              />
              <p className="mt-2 text-sm text-gray-500">
                Be as specific as possible. The more details you provide, the better your roadmap will be!
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {/* Estimated Budget */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estimated Budget <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    name="estimated_budget"
                    value={formData.estimated_budget}
                    onChange={handleInputChange}
                    placeholder="150000"
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all"
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                    ₹
                  </span>
                </div>
              </div>

              {/* Monthly Income */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Monthly Income <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Wallet className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    name="user_income"
                    value={formData.user_income}
                    onChange={handleInputChange}
                    placeholder="75000"
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all"
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                    ₹
                  </span>
                </div>
              </div>

              {/* Target Timeline */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Timeline (Months) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    name="target_months"
                    value={formData.target_months}
                    onChange={handleInputChange}
                    placeholder="12"
                    min="1"
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all"
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                    months
                  </span>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Profession */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Profession
                </label>
                <input
                  type="text"
                  name="profession"
                  value={formData.profession}
                  onChange={handleInputChange}
                  placeholder="e.g., Software Engineer, Teacher, Doctor"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all"
                />
              </div>

              {/* Years of Experience */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Years of Experience
                </label>
                <input
                  type="number"
                  name="years_of_experience"
                  value={formData.years_of_experience}
                  onChange={handleInputChange}
                  placeholder="5"
                  min="0"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all"
                />
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerateRoadmap}
              disabled={!isFormValid || isGenerating}
              className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-200 flex items-center justify-center space-x-3 ${isFormValid && !isGenerating
                ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white hover:shadow-2xl transform hover:scale-[1.02]'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
            >
              {isGenerating ? (
                <>
                  <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Generating Your Roadmap...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-6 h-6" />
                  <span>Generate My Dream Roadmap</span>
                  <ArrowRight className="w-6 h-6" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Output Section */}
        {dreamRoadmap && (
          <div className="space-y-6">
            {/* Overview Cards */}
            <div className="grid md:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-violet-500">
                <div className="flex items-center justify-between mb-2">
                  <Target className="w-8 h-8 text-violet-600" />
                </div>
                <div className="text-sm text-gray-600 mb-1">Dream Type</div>
                <div className="text-xl font-bold text-gray-900">{dreamRoadmap.dreamType}</div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
                <div className="flex items-center justify-between mb-2">
                  <DollarSign className="w-8 h-8 text-green-600" />
                </div>
                <div className="text-sm text-gray-600 mb-1">Estimated Cost</div>
                <div className="text-xl font-bold text-gray-900">
                  ₹{dreamRoadmap.estimatedCost.toLocaleString('en-IN')}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-orange-500">
                <div className="flex items-center justify-between mb-2">
                  <Wallet className="w-8 h-8 text-orange-600" />
                </div>
                <div className="text-sm text-gray-600 mb-1">Monthly Saving</div>
                <div className="text-xl font-bold text-gray-900">
                  ₹{Math.round(dreamRoadmap.monthlySaving).toLocaleString('en-IN')}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
                <div className="flex items-center justify-between mb-2">
                  <PieChart className="w-8 h-8 text-blue-600" />
                </div>
                <div className="text-sm text-gray-600 mb-1">Saving %</div>
                <div className="text-xl font-bold text-gray-900">
                  {dreamRoadmap.savingPercentage.toFixed(1)}%
                </div>
              </div>
            </div>

            {/* Timeline Visualization */}
            <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12">
              <div className="flex items-center space-x-3 mb-8">
                <Clock className="w-8 h-8 text-violet-600" />
                <h2 className="text-2xl font-bold text-gray-900">
                  Your {dreamRoadmap.months}-Month Roadmap
                </h2>
              </div>

              {/* Progress Bar */}
              <div className="mb-12">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-700">Timeline Progress</span>
                  <span className="text-sm font-bold text-violet-600">
                    {dreamRoadmap.months} months to your dream!
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div
                    className="bg-gradient-to-r from-violet-600 to-fuchsia-600 h-4 rounded-full transition-all duration-1000 animate-pulse"
                    style={{ width: '100%' }}
                  ></div>
                </div>
              </div>

              {/* Milestones */}
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-6">
                  <Award className="w-6 h-6 text-yellow-500" />
                  Your Milestones to Success
                </h3>

                {dreamRoadmap.milestones.map((milestone, index) => (
                  <div
                    key={index}
                    className="flex items-start space-x-4 p-6 bg-gradient-to-r from-violet-50 to-purple-50 rounded-xl hover:shadow-lg transition-all duration-300 border border-violet-100"
                  >
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {index + 1}
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-800 font-medium leading-relaxed">{milestone}</p>
                    </div>
                    <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                  </div>
                ))}
              </div>
            </div>

            {/* Reality Check */}
            {dreamRoadmap.realityCheck && (
              <div className="bg-gradient-to-r from-red-50 to-orange-50 border-l-4 border-red-500 rounded-xl p-6">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white font-bold text-sm">!</div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">Reality Check</h4>
                    <p className="text-gray-700">{dreamRoadmap.realityCheck}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Challenges */}
            {dreamRoadmap.challenges && dreamRoadmap.challenges.length > 0 && (
              <div className="bg-gradient-to-r from-yellow-50 to-red-50 border-l-4 border-yellow-500 rounded-xl p-6">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center text-white font-bold text-sm">⚠</div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">Potential Challenges</h4>
                    <ul className="list-disc list-inside text-gray-700 space-y-1">
                      {dreamRoadmap.challenges.map((challenge, index) => (
                        <li key={index}>{challenge}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Pro Tips */}
            {dreamRoadmap.proTips && dreamRoadmap.proTips.length > 0 && (
              <div className="bg-gradient-to-r from-green-50 to-blue-50 border-l-4 border-green-500 rounded-xl p-6">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-sm">💡</div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">Pro Tips</h4>
                    <ul className="list-disc list-inside text-gray-700 space-y-1">
                      {dreamRoadmap.proTips.map((tip, index) => (
                        <li key={index}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Alternatives */}
            {dreamRoadmap.alternatives && dreamRoadmap.alternatives.length > 0 && (
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-l-4 border-purple-500 rounded-xl p-6">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">🔄</div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">Alternative Approaches</h4>
                    <ul className="list-disc list-inside text-gray-700 space-y-1">
                      {dreamRoadmap.alternatives.map((alternative, index) => (
                        <li key={index}>{alternative}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Ready to Start Your Journey?
                </h3>
                <p className="text-gray-600 mb-6">
                  Save this roadmap and track your progress with GoalAura
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={handleSaveGoal}
                    className="bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white px-8 py-3 rounded-full font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center justify-center space-x-2"
                  >
                    <Target className="w-5 h-5" />
                    <span>Save to My Goals</span>
                  </button>
                  <button className="border-2 border-violet-600 text-violet-600 px-8 py-3 rounded-full font-semibold hover:bg-violet-50 transition-all duration-200">
                    Create Another Dream
                  </button>
                </div>
              </div>
            </div>

            {/* Insights Box */}
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-yellow-500 rounded-xl p-6">
              <div className="flex items-start space-x-3">
                <Sparkles className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-gray-900 mb-2">💡 AI Insight</h4>
                  <p className="text-gray-700">
                    Based on your income of ₹{parseFloat(formData.user_income).toLocaleString('en-IN')}/month,
                    saving {dreamRoadmap.savingPercentage.toFixed(1)}% is {dreamRoadmap.savingPercentage < 30 ? 'very achievable' : dreamRoadmap.savingPercentage < 50 ? 'challenging but doable' : 'ambitious'}.
                    {dreamRoadmap.savingPercentage > 50 && ' Consider extending your timeline or exploring side hustles to make it easier!'}
                  </p>
                </div>
              </div>
            </div>

            {/* Income Growth Report */}
            {incomeGrowthReport && (
              <div className="bg-gradient-to-r from-green-50 to-teal-50 border-l-4 border-green-500 rounded-xl p-6">
                <div className="flex items-start space-x-3">
                  <TrendingUp className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">📈 Income Growth Opportunities</h4>
                    <p className="text-gray-700 mb-4">
                      Since your dream seems challenging with your current income, here are some ways to boost your earnings:
                    </p>
                    <div className="space-y-3">
                      {incomeGrowthReport.suggestions && incomeGrowthReport.suggestions.map((suggestion, index) => (
                        <div key={index} className="flex items-start space-x-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                          <p className="text-gray-700 text-sm">{suggestion}</p>
                        </div>
                      ))}
                      {incomeGrowthReport.expected_income_increase && (
                        <div className="mt-4 p-3 bg-green-100 rounded-lg">
                          <p className="text-green-800 font-medium">
                            Expected Income Increase: ₹{incomeGrowthReport.expected_income_increase.toLocaleString('en-IN')}/month
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Examples Section (shown when no roadmap) */}
        {!dreamRoadmap && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Lightbulb className="w-6 h-6 text-yellow-500" />
              Need Inspiration? Try These Dreams:
            </h3>
            <div className="grid md:grid-cols-3 gap-4">
              {[
                { icon: '🏍️', text: 'Buy a Royal Enfield motorcycle', budget: '185000', income: '50000', months: '10' },
                { icon: '🏠', text: 'Renovate my home kitchen', budget: '200000', income: '75000', months: '8' },
                { icon: '✈️', text: 'Take a family trip to Europe', budget: '500000', income: '100000', months: '12' }
              ].map((example, idx) => (
                <button
                  key={idx}
                  onClick={() => setFormData({
                    dream_text: example.text,
                    estimated_budget: example.budget,
                    user_income: example.income,
                    target_months: example.months
                  })}
                  className="p-4 border-2 border-gray-200 rounded-xl hover:border-violet-500 hover:bg-violet-50 transition-all text-left group"
                >
                  <div className="text-3xl mb-2">{example.icon}</div>
                  <div className="text-sm font-medium text-gray-900 group-hover:text-violet-600">
                    {example.text}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}