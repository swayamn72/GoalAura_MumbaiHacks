import React, { useState } from 'react';
import {
  Target, Sparkles, TrendingUp, Calendar, Wallet, CheckCircle,
  ArrowRight, Lightbulb, PieChart, Clock, DollarSign, Award
} from 'lucide-react';

export default function DreamMap() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [dreamRoadmap, setDreamRoadmap] = useState(null);
  const [formData, setFormData] = useState({
    dream_text: '',
    user_income: '',
    target_months: ''
  });

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleGenerateRoadmap = async () => {
    setIsGenerating(true);
    
    // Simulate API call - Replace with your actual API endpoint
    setTimeout(() => {
      const mockRoadmap = {
        dreamType: 'Royal Enfield Motorcycle',
        estimatedCost: 185000,
        months: parseInt(formData.target_months),
        monthlySaving: 185000 / parseInt(formData.target_months),
        savingPercentage: (185000 / parseInt(formData.target_months) / parseFloat(formData.user_income)) * 100,
        milestones: [
          'Month 1-2: Research models and build initial savings buffer',
          'Month 3-4: Save 25% of target amount (₹46,250)',
          'Month 5-6: Reach halfway mark and lock in financing options',
          'Month 7-8: Hit 75% savings milestone (₹138,750)',
          'Month 9-10: Complete savings goal and finalize purchase',
          'Month 10: Visit showroom, test ride, and make your dream purchase!',
          'Post-purchase: Set up maintenance fund (₹2,000/month)'
        ]
      };
      setDreamRoadmap(mockRoadmap);
      setIsGenerating(false);
    }, 2000);

    /* 
    Replace above with actual API call:
    try {
      const response = await fetch('YOUR_API_ENDPOINT', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      setDreamRoadmap(data);
      setIsGenerating(false);
    } catch (error) {
      console.error('Error generating roadmap:', error);
      setIsGenerating(false);
    }
    */
  };

  const isFormValid = formData.dream_text && formData.user_income && formData.target_months;

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

            <div className="grid md:grid-cols-2 gap-6">
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

            {/* Generate Button */}
            <button
              onClick={handleGenerateRoadmap}
              disabled={!isFormValid || isGenerating}
              className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-200 flex items-center justify-center space-x-3 ${
                isFormValid && !isGenerating
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
                  <button className="bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white px-8 py-3 rounded-full font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center justify-center space-x-2">
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
                { icon: '🏍️', text: 'Buy a Royal Enfield motorcycle', income: '50000', months: '10' },
                { icon: '🏠', text: 'Renovate my home kitchen', income: '75000', months: '8' },
                { icon: '✈️', text: 'Take a family trip to Europe', income: '100000', months: '12' }
              ].map((example, idx) => (
                <button
                  key={idx}
                  onClick={() => setFormData({
                    dream_text: example.text,
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