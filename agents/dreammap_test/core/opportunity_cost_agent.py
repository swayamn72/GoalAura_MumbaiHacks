"""
Opportunity Cost Agent - Visualizes time vs investment trade-offs
"""

import os
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


def orchestrate_opportunity_cost(
    purchase_item: str,
    purchase_cost: float,
    user_hourly_wage: float
) -> str:
    """
    Calculate and visualize opportunity cost of a purchase.
    
    Args:
        purchase_item: Name of the item being considered
        purchase_cost: Cost in INR
        user_hourly_wage: User's hourly wage in INR
    
    Returns:
        Human-friendly visualization message
    """
    
    # Calculate work hours needed
    hours_to_work = purchase_cost / user_hourly_wage if user_hourly_wage > 0 else 0
    days_to_work = hours_to_work / 8  # Assuming 8-hour workday
    
    # Calculate investment opportunity cost (assuming 12% annual return)
    annual_return_rate = 0.12
    
    # Future value if invested for different periods
    fv_1_year = purchase_cost * (1 + annual_return_rate)
    fv_5_years = purchase_cost * ((1 + annual_return_rate) ** 5)
    fv_10_years = purchase_cost * ((1 + annual_return_rate) ** 10)
    
    # If AI is unavailable, return calculated fallback
    if not os.environ.get("GEMINI_API_KEY"):
        return f"""
⏰ TIME COST ANALYSIS:
To afford {purchase_item} (₹{purchase_cost:,.0f}), you need to work:
• {hours_to_work:.1f} hours ({days_to_work:.1f} working days)
• That's {days_to_work/5:.1f} weeks of your life

💰 INVESTMENT OPPORTUNITY COST:
If you invested ₹{purchase_cost:,.0f} instead:
• After 1 year: ₹{fv_1_year:,.0f} (gain: ₹{fv_1_year - purchase_cost:,.0f})
• After 5 years: ₹{fv_5_years:,.0f} (gain: ₹{fv_5_years - purchase_cost:,.0f})
• After 10 years: ₹{fv_10_years:,.0f} (gain: ₹{fv_10_years - purchase_cost:,.0f})

🤔 PERSPECTIVE:
Is {purchase_item} worth {days_to_work:.1f} days of your work?
Or would you prefer ₹{fv_5_years:,.0f} in 5 years?
"""
    
    # Use AI to generate engaging visualization
    model_name = "gemini-2.0-flash-exp"
    prompt = f"""
You are a financial advisor helping someone understand the TRUE COST of a purchase.

**Purchase Details:**
- Item: {purchase_item}
- Cost: ₹{purchase_cost:,.0f}
- User's Hourly Wage: ₹{user_hourly_wage:,.0f}

**Calculated Metrics:**
- Hours of work needed: {hours_to_work:.1f} hours
- Working days needed: {days_to_work:.1f} days
- Weeks of work: {days_to_work/5:.1f} weeks

**Investment Opportunity Cost (12% annual return):**
- Value after 1 year: ₹{fv_1_year:,.0f}
- Value after 5 years: ₹{fv_5_years:,.0f}
- Value after 10 years: ₹{fv_10_years:,.0f}

**Task:**
Create a compelling, human-friendly message that helps the user visualize the opportunity cost.

Include:
1. ⏰ TIME PERSPECTIVE: How many hours/days/weeks of work this represents
2. 💰 INVESTMENT PERSPECTIVE: What this money could become if invested
3. 🤔 THOUGHT-PROVOKING QUESTION: Make them really think about the trade-off
4. 💡 ALTERNATIVE PERSPECTIVE: What else could they do with this money/time

Be conversational, use emojis, and make it relatable. Keep it under 200 words.
Focus on making them FEEL the opportunity cost, not just see numbers.
"""
    
    try:
        response = _safe_generate_content(
            model=model_name,
            contents=[types.Content(role="user", parts=[types.Part.from_text(text=prompt)])],
            config=types.GenerateContentConfig(temperature=0.8),
        )
        
        return response.text
        
    except Exception as e:
        print(f"Opportunity cost AI generation failed: {e}")
        
        # Return fallback with calculations
        return f"""
⏰ TIME COST ANALYSIS:
To afford {purchase_item} (₹{purchase_cost:,.0f}), you need to work:
• {hours_to_work:.1f} hours ({days_to_work:.1f} working days)
• That's {days_to_work/5:.1f} weeks of your life

💰 INVESTMENT OPPORTUNITY COST:
If you invested ₹{purchase_cost:,.0f} instead:
• After 1 year: ₹{fv_1_year:,.0f} (gain: ₹{fv_1_year - purchase_cost:,.0f})
• After 5 years: ₹{fv_5_years:,.0f} (gain: ₹{fv_5_years - purchase_cost:,.0f})
• After 10 years: ₹{fv_10_years:,.0f} (gain: ₹{fv_10_years - purchase_cost:,.0f})

🤔 PERSPECTIVE:
Is {purchase_item} worth {days_to_work:.1f} days of your work?
Or would you prefer ₹{fv_5_years:,.0f} in 5 years?

💡 ALTERNATIVE:
With ₹{purchase_cost:,.0f}, you could:
• Build an emergency fund
• Invest for long-term wealth
• Save for a bigger goal
• Experience something memorable

The choice is yours, but now you know the TRUE cost.
"""