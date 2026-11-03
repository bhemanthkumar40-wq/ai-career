"""
Career Assistant Service: Integrates Google Gemini API via @google/genai SDK
or provides an intelligent local career coaching engine when no API key is configured.
"""

import os
from typing import List, Dict, Any
from backend.app.config import settings

# Attempt import of google.genai
try:
    from google import genai
    from google.genai import types
    GENAI_AVAILABLE = True
except ImportError:
    GENAI_AVAILABLE = False


SYSTEM_PROMPT = """You are CareerPilot AI, an expert, encouraging, and honest career advisor and interview coach for software engineering and tech job seekers.
Your advice is concrete, actionable, and grounded in industry hiring realities:
- Provide structured feedback on resume bullets using the XYZ formula (Accomplished [X] as measured by [Y] by doing [Z]).
- Give mock interview practice with targeted follow-up questions and constructive critique.
- When evaluating job matches, highlight specific transferable skills and tactical bridge projects.
- Always maintain transparency: distinguish recommendations and estimates from guaranteed outcomes.
"""


def get_demo_assistant_response(messages: List[Dict[str, str]], mode: str = "general") -> Dict[str, Any]:
    """
    Intelligent local domain assistant when no Gemini API key is configured.
    Provides structured, high-value career coaching tailored to the user's inquiry.
    """
    last_msg = messages[-1]["content"].lower() if messages else ""

    if "resume" in last_msg or mode == "resume_review":
        response = (
            "### 📄 Resume Review & Optimization Feedback (Local Demo Mode)\n\n"
            "To make your resume stand out in technical screenings, implement the **Google XYZ Formula**:\n"
            "*\"Accomplished [X] as measured by [Y] by doing [Z]\"*\n\n"
            "**Key Recommendations:**\n"
            "1. **Lead with Metrics**: Instead of *'Built backend APIs'*, write *'Engineered 14 RESTful FastAPI endpoints with SQLite caching, reducing client response latency by 38%'*.\n"
            "2. **Group Skills by Category**: Split skills into Languages (Python, TypeScript), Frameworks (React, FastAPI), Databases (SQLite, PostgreSQL), and DevOps (Docker, Git, CI/CD).\n"
            "3. **Prune Stale Info**: Remove high school details, obsolete tool references, or vague buzzwords like 'fast learner'—let your project bullets prove your adaptability.\n\n"
            "*(💡 Note: You are viewing CareerPilot's local coaching knowledge base. Set `GEMINI_API_KEY` in `.env` to enable dynamic live Gemini AI generation.)*"
        )
        suggestions = [
            "How do I highlight personal projects with zero paid experience?",
            "Review my summary bullet points",
            "What should I cut from a 2-page resume?"
        ]

    elif "interview" in last_msg or mode == "interview_prep":
        response = (
            "### 🎯 Mock Interview Simulation (Local Demo Mode)\n\n"
            "Let's practice the **STAR Method** (Situation, Task, Action, Result) for behavioral questions.\n\n"
            "**Here is a common scenario question for your target role:**\n"
            "> *\"Tell me about a time you diagnosed and resolved a challenging technical bug or performance bottleneck right before a release deadline.\"*\n\n"
            "**Framework for your answer:**\n"
            "- **Situation (15%)**: What was the system context and initial symptom?\n"
            "- **Task (15%)**: What was your specific responsibility vs the team's?\n"
            "- **Action (50%)**: What diagnostic steps did you take (logs, profiling, isolation)? How did you make trade-offs under time pressure?\n"
            "- **Result (20%)**: What was the measurable impact (uptime, latency, post-mortem preventive measures)?\n\n"
            "Reply with your draft response and I'll analyze your structure and impact!"
        )
        suggestions = [
            "Give me a behavioral question about handling team disagreement",
            "How do I answer 'What is your greatest technical weakness'?",
            "What questions should I ask the engineering manager at the end?"
        ]

    elif "salary" in last_msg or "offer" in last_msg or "negotiat" in last_msg:
        response = (
            "### 💼 Offer & Salary Negotiation Playbook (Local Demo Mode)\n\n"
            "**Top rules for tech compensation negotiations:**\n"
            "1. **Never give a hard single number first**: Anchor on a verified market range based on location and level (e.g., *'$115,000 - $135,000 based on the role responsibilities'*).\n"
            "2. **Look at Total Compensation (TC)**: Base salary, equity/stock options vesting schedule, signing bonus, remote work stipend, and health benefits.\n"
            "3. **Use Gratitude + Leverage**: Express genuine excitement for the team first before requesting adjustments.\n\n"
            "*(💡 Set `GEMINI_API_KEY` in `.env` to simulate live counter-offer scripts tailored to your specific offer details.)*"
        )
        suggestions = [
            "Draft an email counter-offering an initial salary quote",
            "How to ask for an extension on a job offer deadline",
            "What questions to ask about equity and stock grants"
        ]

    else:
        response = (
            "### 🧭 CareerPilot AI Career Advisor (Local Demo Mode)\n\n"
            "Welcome! I am your career navigation partner. Here is how I can assist your search:\n\n"
            "- **Skill Prioritization**: Uncover which tools (e.g. Docker, TypeScript, FastAPI) provide the highest return on investment for your target roles.\n"
            "- **Placement Readiness Breakdown**: Understand your readiness score components and steps to move up a tier.\n"
            "- **Resume Tailoring**: Frame your past accomplishments into high-converting technical bullets.\n"
            "- **Interview Coaching**: Practice technical and behavioral questions tailored to junior, mid-level, or senior positions.\n\n"
            "*How would you like to prepare today? Click one of the suggestions below or type your question.*"
        )
        suggestions = [
            "How can I increase my placement readiness score from 68 to 85?",
            "Give me a 3-week study plan for FastAPI and Docker",
            "What are the top 3 questions for a React frontend screening?"
        ]

    return {
        "response": response,
        "model_used": "CareerPilot Local Explainable Coach",
        "is_gemini_active": False,
        "suggestions": suggestions
    }


def generate_career_chat(messages: List[Dict[str, str]], mode: str = "general") -> Dict[str, Any]:
    """
    Calls Google Gemini API if GEMINI_API_KEY is configured,
    otherwise falls back smoothly to the local domain coach.
    """
    api_key = settings.GEMINI_API_KEY or os.environ.get("GEMINI_API_KEY")

    if not api_key or not GENAI_AVAILABLE:
        return get_demo_assistant_response(messages, mode)

    try:
        client = genai.Client(api_key=api_key)
        
        # Build prompt from conversation history
        formatted_contents = []
        for msg in messages:
            role = "user" if msg["role"] == "user" else "model"
            formatted_contents.append(f"{role.upper()}: {msg['content']}")
        
        full_prompt = f"{SYSTEM_PROMPT}\n\nMode: {mode}\n\nConversation:\n" + "\n".join(formatted_contents) + "\n\nMODEL:"

        response = client.models.generate_content(
            model="gemini-3.8-flash",
            contents=full_prompt,
        )

        reply_text = response.text if response and hasattr(response, "text") and response.text else "I am here to help you advance your career. Could you elaborate on your question?"
        
        suggestions = [
            "Can you give me an example?",
            "How do I highlight this in my resume?",
            "What is a common follow-up interview question on this topic?"
        ]

        return {
            "response": reply_text,
            "model_used": "gemini-3.8-flash",
            "is_gemini_active": True,
            "suggestions": suggestions
        }
    except Exception as e:
        # Graceful fallback if API call errors (e.g. invalid key or network issue)
        local_result = get_demo_assistant_response(messages, mode)
        local_result["response"] += f"\n\n*(Note: Gemini API attempt encountered an error: {str(e)[:100]}. Switched to local coaching engine.)*"
        return local_result
