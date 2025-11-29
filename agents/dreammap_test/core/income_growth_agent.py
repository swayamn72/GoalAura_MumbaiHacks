"""
Income Growth Agent - Analyzes current income and profession to suggest structured paths for income growth
"""

import os
import json
from typing import Dict, List
from dotenv import load_dotenv
from google import genai
from google.genai import types

load_dotenv()

# Initialize client
try:
    client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))
except Exception as e:
    client = None
    print(f"Warning: Gemini client init failed: {e}")


def _safe_generate_content(*, model: str, contents, config):
    """Wrap model call to provide clearer errors when client is not initialized."""
    if client is None:
        raise RuntimeError("GenAI client not initialized. Set GEMINI_API_KEY in env.")
    return client.models.generate_content(model=model, contents=contents, config=config)


def analyze_income_growth_paths(
    current_income: float,
    profession: str,
    current_skills: List[str] = None
) -> Dict:
    """
    Analyzes user's current income and profession to suggest structured paths for income growth.
    
    Args:
        current_income: Current monthly income in INR
        profession: Current job profession/role
        current_skills: List of current skills (optional)
    
    Returns:
        Dictionary with structured income growth paths and recommendations
    """
    
    if current_skills is None:
        current_skills = []
    
    # Calculate income benchmarks
    annual_income = current_income * 12
    
    # If AI is unavailable, return basic fallback
    if not os.environ.get("GEMINI_API_KEY"):
        return {
            "current_analysis": {
                "monthly_income": current_income,
                "annual_income": annual_income,
                "profession": profession
            },
            "growth_paths": [
                {
                    "path_name": "Skill Upgrade Path",
                    "potential_income_increase": "20-40%",
                    "timeline": "6-12 months",
                    "steps": [
                        "Identify high-demand skills in your field",
                        "Enroll in online courses or certifications",
                        "Build portfolio projects",
                        "Apply for higher-paying positions"
                    ]
                },
                {
                    "path_name": "Side Income Path",
                    "potential_income_increase": "15-30%",
                    "timeline": "3-6 months",
                    "steps": [
                        "Identify freelance opportunities",
                        "Set up profiles on freelancing platforms",
                        "Start with small projects",
                        "Scale up gradually"
                    ]
                }
            ],
            "recommendations": [
                "AI unavailable - configure GEMINI_API_KEY for detailed analysis"
            ]
        }
    
    # Use AI to generate comprehensive income growth analysis
    model_name = "gemini-2.0-flash-exp"
    
    skills_context = f"Current skills: {', '.join(current_skills)}" if current_skills else "No specific skills mentioned"
    
    prompt = f"""
You are an expert career and income growth advisor specializing in the Indian job market.

**User Profile:**
- Current Profession: {profession}
- Monthly Income: ₹{current_income:,.0f} (Annual: ₹{annual_income:,.0f})
- {skills_context}
- Location: India

**Your Task:**
Analyze this profile and provide SPECIFIC, ACTIONABLE paths to increase income. Be realistic about timelines and potential gains.

Return a JSON object with the following structure:

{{
  "current_analysis": {{
    "income_percentile": "string (e.g., 'Your income is in the 60th percentile for {profession} in India')",
    "market_position": "string (honest assessment of where they stand)",
    "immediate_opportunities": ["array of 2-3 quick wins they can pursue now"]
  }},
  
  "growth_paths": [
    {{
      "path_name": "string (e.g., 'Senior Role Transition')",
      "path_type": "string (career_advancement | skill_upgrade | side_income | career_switch | entrepreneurship)",
      "potential_income_increase": "string (e.g., '30-50% in 12-18 months')",
      "difficulty_level": "string (Easy | Moderate | Challenging | Very Challenging)",
      "timeline": "string (realistic timeline)",
      "investment_required": "string (time and money needed)",
      "steps": [
        "Detailed step 1 with specific actions",
        "Detailed step 2 with specific actions",
        "... (5-8 steps total)"
      ],
      "skills_to_learn": ["specific skill 1", "specific skill 2", "..."],
      "resources": ["specific course/platform 1", "specific course/platform 2", "..."],
      "success_metrics": ["How to measure progress 1", "How to measure progress 2"],
      "potential_roadblocks": ["Challenge 1", "Challenge 2"],
      "pro_tips": ["Insider tip 1", "Insider tip 2"]
    }}
  ],
  
  "high_paying_skills": [
    {{
      "skill_name": "string",
      "average_salary_increase": "string (e.g., '+₹20,000-40,000/month')",
      "learning_time": "string (e.g., '3-6 months')",
      "demand_level": "string (High | Very High | Moderate)",
      "learning_resources": ["resource 1", "resource 2"]
    }}
  ],
  
  "side_income_opportunities": [
    {{
      "opportunity_name": "string",
      "potential_monthly_income": "string (e.g., '₹10,000-30,000/month')",
      "time_commitment": "string (e.g., '5-10 hours/week')",
      "startup_cost": "string",
      "steps_to_start": ["step 1", "step 2", "..."]
    }}
  ],
  
  "immediate_action_plan": {{
    "week_1": ["action 1", "action 2"],
    "month_1": ["action 1", "action 2"],
    "month_3": ["action 1", "action 2"],
    "month_6": ["action 1", "action 2"]
  }},
  
  "recommendations": [
    "Prioritized recommendation 1 with specific reasoning",
    "Prioritized recommendation 2 with specific reasoning",
    "... (4-6 total)"
  ]
}}

**CRITICAL RULES:**
- Be SPECIFIC with numbers, timelines, and resources
- Tailor advice to Indian market (mention specific platforms, companies, trends)
- Consider their experience level - don't suggest unrealistic jumps
- Include both short-term (3-6 months) and long-term (1-2 years) paths
- Mention specific courses, certifications, platforms by name
- Be honest about difficulty and investment required
- Focus on ACTIONABLE steps, not generic advice
- Include at least 3-4 different growth paths with varying difficulty levels
- Suggest 4-6 high-paying skills relevant to their field
- Provide 3-4 realistic side income opportunities
"""

    try:
        response = _safe_generate_content(
            model=model_name,
            contents=[types.Content(role="user", parts=[types.Part.from_text(text=prompt)])],
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                temperature=0.8
            ),
        )
        
        result = json.loads(response.text)
        
        # Add calculated fields
        result["user_profile"] = {
            "profession": profession,
            "monthly_income": current_income,
            "annual_income": annual_income,
            "skills": current_skills
        }
        
        return result
        
    except Exception as e:
        print(f"Income growth analysis failed: {e}")
        
        # Return enhanced fallback
        return {
            "user_profile": {
                "profession": profession,
                "monthly_income": current_income,
                "annual_income": annual_income,
                "skills": current_skills
            },
            "current_analysis": {
                "income_percentile": f"Analysis unavailable - configure AI for detailed insights",
                "market_position": f"Current income: ₹{current_income:,.0f}/month as {profession}",
                "immediate_opportunities": [
                    "Update LinkedIn profile with recent achievements",
                    "Research salary benchmarks for your role",
                    "Network with professionals in your field"
                ]
            },
            "growth_paths": [
                {
                    "path_name": "Career Advancement Path",
                    "path_type": "career_advancement",
                    "potential_income_increase": "25-40% in 12-18 months",
                    "difficulty_level": "Moderate",
                    "timeline": "12-18 months",
                    "investment_required": "Time: 5-10 hours/week, Money: ₹10,000-30,000 for courses",
                    "steps": [
                        "Identify senior roles in your field and required qualifications",
                        "Assess skill gaps between current and target role",
                        "Enroll in relevant certifications or courses",
                        "Take on leadership responsibilities in current role",
                        "Build a portfolio of achievements and projects",
                        "Network with senior professionals and hiring managers",
                        "Apply for senior positions or request promotion",
                        "Negotiate salary based on market research"
                    ],
                    "skills_to_learn": ["Leadership", "Project Management", "Strategic Planning"],
                    "resources": ["Coursera", "LinkedIn Learning", "Industry-specific certifications"],
                    "success_metrics": ["Completed certifications", "Leadership projects delivered", "Interview calls received"],
                    "potential_roadblocks": ["Limited senior positions", "Competition", "Skill gaps"],
                    "pro_tips": ["Document all achievements", "Build visibility in your organization"]
                },
                {
                    "path_name": "High-Value Skill Acquisition",
                    "path_type": "skill_upgrade",
                    "potential_income_increase": "30-60% in 6-12 months",
                    "difficulty_level": "Challenging",
                    "timeline": "6-12 months",
                    "investment_required": "Time: 10-15 hours/week, Money: ₹20,000-50,000",
                    "steps": [
                        "Research high-demand skills in your industry",
                        "Choose 2-3 complementary skills to master",
                        "Enroll in structured learning programs",
                        "Build real-world projects to demonstrate skills",
                        "Create online portfolio showcasing your work",
                        "Contribute to open-source or community projects",
                        "Apply for roles requiring these new skills",
                        "Leverage new skills for freelance opportunities"
                    ],
                    "skills_to_learn": ["Data Analysis", "Cloud Computing", "AI/ML", "Digital Marketing"],
                    "resources": ["Udemy", "Coursera", "edX", "YouTube tutorials"],
                    "success_metrics": ["Skills certified", "Portfolio projects completed", "Freelance gigs secured"],
                    "potential_roadblocks": ["Learning curve", "Time management", "Staying motivated"],
                    "pro_tips": ["Focus on in-demand skills", "Build public portfolio", "Join skill-specific communities"]
                },
                {
                    "path_name": "Side Income Stream",
                    "path_type": "side_income",
                    "potential_income_increase": "15-35% additional income",
                    "difficulty_level": "Easy to Moderate",
                    "timeline": "3-6 months",
                    "investment_required": "Time: 5-10 hours/week, Money: ₹5,000-15,000",
                    "steps": [
                        "Identify marketable skills you already have",
                        "Research freelance platforms and opportunities",
                        "Create professional profiles on 2-3 platforms",
                        "Start with small projects to build reputation",
                        "Deliver quality work to get positive reviews",
                        "Gradually increase rates as reputation grows",
                        "Diversify income streams across multiple clients",
                        "Consider productizing your services"
                    ],
                    "skills_to_learn": ["Freelancing", "Client Management", "Time Management"],
                    "resources": ["Upwork", "Fiverr", "Freelancer.in", "Toptal"],
                    "success_metrics": ["Profile created", "First client secured", "Positive reviews received"],
                    "potential_roadblocks": ["Finding first clients", "Pricing services", "Time management"],
                    "pro_tips": ["Start with competitive pricing", "Over-deliver initially", "Build long-term client relationships"]
                }
            ],
            "high_paying_skills": [
                {
                    "skill_name": "Data Analysis & Visualization",
                    "average_salary_increase": "+₹15,000-35,000/month",
                    "learning_time": "4-6 months",
                    "demand_level": "Very High",
                    "learning_resources": ["Google Data Analytics Certificate", "Tableau courses", "Python for Data Analysis"]
                },
                {
                    "skill_name": "Cloud Computing (AWS/Azure/GCP)",
                    "average_salary_increase": "+₹20,000-50,000/month",
                    "learning_time": "6-9 months",
                    "demand_level": "Very High",
                    "learning_resources": ["AWS Certified Solutions Architect", "Azure Fundamentals", "Cloud Academy"]
                },
                {
                    "skill_name": "Digital Marketing & SEO",
                    "average_salary_increase": "+₹10,000-30,000/month",
                    "learning_time": "3-5 months",
                    "demand_level": "High",
                    "learning_resources": ["Google Digital Marketing Certificate", "HubSpot Academy", "SEMrush Academy"]
                }
            ],
            "side_income_opportunities": [
                {
                    "opportunity_name": "Freelance Consulting",
                    "potential_monthly_income": "₹15,000-50,000/month",
                    "time_commitment": "5-10 hours/week",
                    "startup_cost": "₹5,000-10,000 (website, tools)",
                    "steps_to_start": [
                        "Define your consulting niche",
                        "Create LinkedIn and freelance profiles",
                        "Reach out to potential clients",
                        "Deliver first project successfully"
                    ]
                },
                {
                    "opportunity_name": "Online Teaching/Tutoring",
                    "potential_monthly_income": "₹10,000-40,000/month",
                    "time_commitment": "6-12 hours/week",
                    "startup_cost": "₹3,000-8,000 (equipment, platform fees)",
                    "steps_to_start": [
                        "Choose subject/skill to teach",
                        "Join platforms like Unacademy, Vedantu, or Udemy",
                        "Create course content or offer live sessions",
                        "Market your courses"
                    ]
                },
                {
                    "opportunity_name": "Content Creation",
                    "potential_monthly_income": "₹8,000-30,000/month",
                    "time_commitment": "8-15 hours/week",
                    "startup_cost": "₹5,000-15,000 (equipment, software)",
                    "steps_to_start": [
                        "Choose platform (YouTube, Blog, Instagram)",
                        "Create content in your expertise area",
                        "Build audience consistently",
                        "Monetize through ads, sponsorships, or products"
                    ]
                }
            ],
            "immediate_action_plan": {
                "week_1": [
                    "Research salary benchmarks for your role",
                    "Update resume and LinkedIn profile",
                    "List your marketable skills"
                ],
                "month_1": [
                    "Identify 2-3 high-value skills to learn",
                    "Enroll in one online course",
                    "Set up profiles on freelance platforms"
                ],
                "month_3": [
                    "Complete first certification",
                    "Build 1-2 portfolio projects",
                    "Secure first freelance client or side project"
                ],
                "month_6": [
                    "Apply for higher-paying positions",
                    "Have consistent side income stream",
                    "Network with industry professionals"
                ]
            },
            "recommendations": [
                "Focus on skill upgrades - add high-demand skills to multiply your market value",
                "Start a side income stream immediately - even ₹10,000/month extra adds up to ₹1.2L annually",
                "Network actively - 70% of jobs are filled through networking, not job boards",
                "Document your achievements - build a portfolio that showcases your value",
                "Research market rates - you might be underpaid without knowing it",
                "Consider career coaching - professional guidance can accelerate your growth"
            ]
        }


def format_income_growth_report(analysis_result: Dict) -> str:
    """
    Formats the income growth analysis into a human-readable report.
    
    Args:
        analysis_result: Dictionary returned by analyze_income_growth_paths
    
    Returns:
        Formatted string report
    """
    report = []
    
    # Header
    profile = analysis_result.get("user_profile", {})
    report.append("=" * 80)
    report.append("📈 INCOME GROWTH ANALYSIS REPORT")
    report.append("=" * 80)
    report.append(f"\n👤 PROFILE:")
    report.append(f"   Profession: {profile.get('profession', 'N/A')}")
    report.append(f"   Current Income: ₹{profile.get('monthly_income', 0):,.0f}/month (₹{profile.get('annual_income', 0):,.0f}/year)")
    
    # Current Analysis
    current = analysis_result.get("current_analysis", {})
    if current:
        report.append(f"\n📊 CURRENT MARKET POSITION:")
        report.append(f"   {current.get('income_percentile', 'N/A')}")
        report.append(f"   {current.get('market_position', 'N/A')}")
        
        immediate = current.get("immediate_opportunities", [])
        if immediate:
            report.append(f"\n   🎯 Quick Wins:")
            for opp in immediate:
                report.append(f"      • {opp}")
    
    # Growth Paths
    paths = analysis_result.get("growth_paths", [])
    if paths:
        report.append(f"\n\n🚀 INCOME GROWTH PATHS:")
        report.append("=" * 80)
        
        for i, path in enumerate(paths, 1):
            report.append(f"\n{i}. {path.get('path_name', 'Unnamed Path')}")
            report.append(f"   Type: {path.get('path_type', 'N/A')}")
            report.append(f"   💰 Potential Increase: {path.get('potential_income_increase', 'N/A')}")
            report.append(f"   ⏱️  Timeline: {path.get('timeline', 'N/A')}")
            report.append(f"   📊 Difficulty: {path.get('difficulty_level', 'N/A')}")
            report.append(f"   💵 Investment: {path.get('investment_required', 'N/A')}")
            
            steps = path.get('steps', [])
            if steps:
                report.append(f"\n   📋 Action Steps:")
                for j, step in enumerate(steps, 1):
                    report.append(f"      {j}. {step}")
            
            skills = path.get('skills_to_learn', [])
            if skills:
                report.append(f"\n   🎓 Skills to Learn: {', '.join(skills)}")
            
            resources = path.get('resources', [])
            if resources:
                report.append(f"   📚 Resources: {', '.join(resources)}")
            
            tips = path.get('pro_tips', [])
            if tips:
                report.append(f"\n   💡 Pro Tips:")
                for tip in tips:
                    report.append(f"      • {tip}")
            
            report.append("")
    
    # High-Paying Skills
    skills = analysis_result.get("high_paying_skills", [])
    if skills:
        report.append(f"\n💎 HIGH-PAYING SKILLS TO LEARN:")
        report.append("=" * 80)
        for skill in skills:
            report.append(f"\n• {skill.get('skill_name', 'N/A')}")
            report.append(f"  Salary Boost: {skill.get('average_salary_increase', 'N/A')}")
            report.append(f"  Learning Time: {skill.get('learning_time', 'N/A')}")
            report.append(f"  Demand: {skill.get('demand_level', 'N/A')}")
    
    # Side Income Opportunities
    side_income = analysis_result.get("side_income_opportunities", [])
    if side_income:
        report.append(f"\n\n💼 SIDE INCOME OPPORTUNITIES:")
        report.append("=" * 80)
        for opp in side_income:
            report.append(f"\n• {opp.get('opportunity_name', 'N/A')}")
            report.append(f"  Potential Income: {opp.get('potential_monthly_income', 'N/A')}")
            report.append(f"  Time Needed: {opp.get('time_commitment', 'N/A')}")
            report.append(f"  Startup Cost: {opp.get('startup_cost', 'N/A')}")
    
    # Immediate Action Plan
    action_plan = analysis_result.get("immediate_action_plan", {})
    if action_plan:
        report.append(f"\n\n📅 IMMEDIATE ACTION PLAN:")
        report.append("=" * 80)
        for timeframe, actions in action_plan.items():
            report.append(f"\n{timeframe.upper().replace('_', ' ')}:")
            for action in actions:
                report.append(f"  ✓ {action}")
    
    # Recommendations
    recommendations = analysis_result.get("recommendations", [])
    if recommendations:
        report.append(f"\n\n⭐ KEY RECOMMENDATIONS:")
        report.append("=" * 80)
        for i, rec in enumerate(recommendations, 1):
            report.append(f"{i}. {rec}")
    
    report.append("\n" + "=" * 80)
    report.append("💪 Remember: Income growth requires consistent effort and strategic action!")
    report.append("=" * 80)
    
    return "\n".join(report)