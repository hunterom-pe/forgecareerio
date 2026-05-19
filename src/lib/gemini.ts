import { GoogleGenerativeAI } from "@google/generative-ai";

// Helper for model rotation and auto-retry
async function runWithRotation(genAI: any, prompt: string) {
  const modelsToTry = [
    "gemini-3.1-pro-preview",
    "gemini-3.1-flash-lite-preview",
    "gemini-flash-latest",
    "gemini-2.0-flash",
  ];

  let lastError = null;
  
  for (let attempt = 1; attempt <= 3; attempt++) {
    for (const modelName of modelsToTry) {
      try {
        console.log(`[AI] Attempt ${attempt} - Running model: ${modelName}`);
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return { text: response.text(), modelName };
      } catch (error: any) {
        lastError = error;
        console.warn(`[AI] Model ${modelName} failed on attempt ${attempt}: ${error.message}`);
        
        // If it's a rate limit or connection glitch, wait briefly
        if (error.message?.includes('429') || error.message?.includes('fetch') || error.message?.includes('network')) {
          await new Promise(r => setTimeout(r, 1000 * attempt));
        }
      }
    }
  }

  throw lastError || new Error("All AI models failed after multiple attempts.");
}

export async function optimizeResumeContent(resumeText: string, jobDescription: string) {
  // Demo Mode Fallback: If no API key is provided, return a realistic mock response instantly
  if (!process.env.GEMINI_API_KEY) {
    console.log("No GEMINI_API_KEY found in .env. Using mock optimization data for demo purposes.");
    // Simulate slight network delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    return {
      originalSummary: "Experienced professional seeking a new challenge.",
      newSummary: "Dynamic and results-driven professional with a proven track record of aligning technical execution with high-level business objectives. Highly adaptable and skilled in bridging the gap between cross-functional teams to deliver scalable solutions tailored to this company's exact needs.",
      bulletReplacements: [
        {
          original: "Responsible for managing team projects.",
          new: "Architected and deployed scalable systems that improved operational efficiency by 40% across all target demographics."
        }
      ]
    };
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

  const prompt = `
    You are an expert career coach. Your goal is ATS Optimization (Precise Mapping).
    Rewrite the candidate's resume summary, core competencies (skills), and professional experience bullets to mirror the terminology of the job description.
    
    GUIDELINES:
    1. Swap the candidate's words for the job description's keywords where the meaning is identical.
    2. Focus on the "Summary", "Core Competencies", and "Professional Experience" sections.
    3. Do NOT invent new skills or experience.
    4. Ensure the "original" text matches EXACTLY what is in the resume. This is CRITICAL for our surgical replacement engine. Copy the text character-for-character including punctuation.
    5. Focus on mirroring specific tools (e.g. TFS, SQL Server, Postman) and methodologies mentioned in the JD.
    
    ORIGINAL RESUME:
    ${resumeText}
    MANDATORY ACTION: You must optimize the resume. Even if the resume is already strong, find ways to mirror the JD's specific adjectives and technical nouns. Do not return placeholders.
    
    JOB DESCRIPTION:
    ${jobDescription}
    
    RETURN JSON ONLY:
    {
      "originalSummary": "exact paragraph text from Summary to find",
      "newSummary": "rewritten Summary paragraph mirroring JD terminology",
      "bulletReplacements": [
        { "original": "exact bullet or skill text to find", "new": "rewritten version" }
      ]
    }
  `;

  try {
    const { text, modelName } = await runWithRotation(genAI, prompt);
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch (e: any) {
        console.error(`JSON PARSE FAILED (${modelName}): ${e.message}`);
      }
    }
    throw new Error("No JSON found in AI response");
  } catch (error: any) {
    console.error("AI Optimization Critical Failure:", error.message);
    return { originalSummary: "", newSummary: "", bulletReplacements: [] };
  }
}

export async function generateFollowUpEmail(jobTitle: string, companyName: string) {
  if (!process.env.GEMINI_API_KEY) {
    return `Subject: Follow-up: ${jobTitle} application - [Your Name]

Dear Hiring Team at ${companyName},

I hope this email finds you well. 

I'm writing to briefly follow up on my application for the ${jobTitle} position that I submitted last week. I remain very enthusiastic about the opportunity to join ${companyName} and contribute to your team.

Looking forward to hearing from you.

Best regards,
[Your Name]`;
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

  const prompt = `
    You are a professional career advisor. 
    Write a concise, professional, and polite follow-up email for a candidate who applied for the position of "${jobTitle}" at "${companyName}" 5 days ago and hasn't heard back yet.
    
    The email should:
    1. Have a clear subject line.
    2. Be respectful and brief.
    3. Express continued interest.
    4. Provide placeholders like [Your Name] for the user to fill in.
    
    Return ONLY the email text, no explanations.
  `;

  try {
    const { text } = await runWithRotation(genAI, prompt);
    return text.trim();
  } catch (error: any) {
    console.error("AI Follow-up Generation Error:", error.message || error);
    // Return fallback even if API fails
    return `Subject: Follow-up: ${jobTitle} application - [Your Name]

Dear Hiring Team at ${companyName},

I hope this email finds you well. 

I'm writing to briefly follow up on my application for the ${jobTitle} position. I remain very enthusiastic about the opportunity to join ${companyName}.

Best regards,
[Your Name]`;
  }
}

export async function generateInterviewBrief(jobTitle: string, companyName: string, jobDescription: string) {
  if (!process.env.GEMINI_API_KEY) {
    await new Promise(resolve => setTimeout(resolve, 1500));
    return {
      technicalQuestions: [
        "How do you approach scaling a Next.js application for millions of users?",
        "Explain your experience with micro-frontends in a high-stakes environment."
      ],
      behavioralQuestions: [
        "Describe a time you had to pivot quickly due to changing market requirements.",
        "How do you handle conflict in a cross-functional squad?"
      ],
      companyDossier: `They value "surgical precision" and rapid deployment. Focus on your ability to deliver high-quality code under tight deadlines. Their culture is built on "Extreme Ownership"—mention times you took full responsibility for a product launch.`,
      reverseQuestions: [
        "How does the team balance technical debt with the speed of new feature rollouts?",
        "What does 'Elite Performance' look like in this specific role after 6 months?"
      ]
    };
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

  const prompt = `
    You are an elite interview coach. Generate a "Surgical Intelligence Brief" for a candidate interviewing for the position of "${jobTitle}" at "${companyName}".
    
    JOB DESCRIPTION:
    ${jobDescription}
    
    Return a JSON object with:
    1. "technicalQuestions": Array of 3 highly relevant technical questions.
    2. "behavioralQuestions": Array of 3 behavioral questions based on the job requirements.
    3. "companyDossier": A short paragraph (2-3 sentences) on the company's likely values and what the candidate should emphasize.
    4. "reverseQuestions": Array of 2 high-impact questions the candidate should ask the interviewer.
    
    Return ONLY JSON.
  `;

  try {
    const { text } = await runWithRotation(genAI, prompt);
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error("Invalid AI response format");
  } catch (error: any) {
    console.error("AI Interview Brief Generation Error:", error.message || error);
    // Return high-quality fallback data so the user is never stuck
    return {
      technicalQuestions: [
        `How do you handle complex technical challenges in a role like ${jobTitle}?`,
        "Describe your experience with the core tech stack mentioned in the job description.",
        "How do you ensure code quality and scalability in a fast-paced environment?"
      ],
      behavioralQuestions: [
        "Tell me about a time you had to solve a difficult problem under a tight deadline.",
        `Why are you interested in joining the team at ${companyName} specifically?`,
        "How do you handle feedback and collaboration within a technical squad?"
      ],
      companyDossier: `${companyName} values innovation and results. In your interview, emphasize your ability to take ownership of projects and deliver high-impact solutions. Focus on how your past experience directly solves the challenges mentioned in the ${jobTitle} description.`,
      reverseQuestions: [
        "What does success look like for someone in this role after their first 90 days?",
        "How does the team approach technical debt vs. new feature development?"
      ]
    };
  }
}


export async function generateNegotiationPlaybook(jobTitle: string, companyName: string, matchScore: number, location: string = "United States", marketData: string = "") {
  if (!process.env.GEMINI_API_KEY) {
    // ... (keep fallback as is or update it)
    await new Promise(resolve => setTimeout(resolve, 1500));
    return {
      salaryRange: "$145k - $185k",
      leveragePoints: [
        `High DNA Match Score (${matchScore}%) indicates perfect technical alignment.`,
        "Rare combination of Next.js and System Design expertise.",
        "Proven track record of delivering 40% efficiency gains."
      ],
      negotiationScript: `Subject: Regarding the offer for ${jobTitle} - [Your Name]\n\nDear [Recruiter Name],\n\nThank you so much for the offer to join ${companyName} as a ${jobTitle}. I am incredibly excited about the team and the mission.\n\nGiven my ${matchScore}% alignment with the core technical requirements—specifically my experience in [Skill A] and [Skill B] which are critical for this role—I was hoping we could discuss the base salary. Based on my research for similar roles in the current market, I am looking for a base closer to $180k.\n\nI am very eager to join and contribute. Please let me know if there is any flexibility here.`,
      benefitsChecklist: [
        "Confirm 401k matching percentage and vesting period.",
        "Verify equity (RSU/Option) vesting schedule (e.g., 1-year cliff).",
        "Clarify PTO policy and 'Unlimited' vs. Accrued days."
      ]
    };
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

  const prompt = `
    You are an elite career negotiator. Generate a "Negotiation Playbook" for a candidate who just received an offer for "${jobTitle}" at "${companyName}" in "${location}".
    The candidate has a match score of ${matchScore}%.
    
    ${marketData ? `RESEARCH DATA FOR THIS ROLE:\n${marketData}\n` : ""}
    
    Use the provided research data (if any) and your internal knowledge to provide a REALISTIC salary range for this specific location.
    
    Return a JSON object with:
    1. "salaryRange": A string showing the estimated US market range for this role in ${location} (e.g. "$120k - $160k").
    2. "leveragePoints": Array of 3 points why this candidate has high leverage (referencing the ${matchScore}% match and specific skills).
    3. "negotiationScript": A professional email script to ask for a 10-15% increase in base salary.
    4. "benefitsChecklist": Array of 3 things to verify in the offer letter.
    
    Return ONLY JSON.
  `;

  try {
    const { text } = await runWithRotation(genAI, prompt);
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error("Invalid AI response format");
  } catch (error: any) {
    console.error("AI Negotiation Playbook Generation Error:", error.message || error);
    // Final defensive fallback
    return {
      salaryRange: "$95k - $145k",
      leveragePoints: [
        `Good match score (${matchScore}%) indicates solid technical alignment.`,
        "Strong fundamental skills matching the core job requirements.",
        "Ability to contribute effectively to the team from day one."
      ],
      negotiationScript: `Subject: Regarding the offer for ${jobTitle} - [Your Name]

Dear [Recruiter Name],

Thank you so much for the offer to join ${companyName} as a ${jobTitle}. I'm very excited about the opportunity!

Given my ${matchScore}% alignment with the role's requirements, I'd like to discuss the base salary. Based on market data for this seniority, I'm looking for a range closer to $135k.

I'm very eager to join—please let me know if there's flexibility here.`,
      benefitsChecklist: [
        "Verify 401k match and vesting.",
        "Confirm PTO and holiday schedule.",
        "Clarify equity/bonus structure if applicable."
      ]
    };
  }
}

export async function generateStrategicAudit(resumeText: string, jobTitle: string, rejectionInsights: string[]) {
  if (!process.env.GEMINI_API_KEY) {
    await new Promise(resolve => setTimeout(resolve, 1500));
    return `Based on your recent rejections for ${jobTitle} roles, there's a recurring signal that your "Skills Gap" is the primary hurdle. We recommend emphasizing your recent projects in Next.js and System Design more prominently in your summary to better align with the roles you're targeting.`;
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

  const insightsText = rejectionInsights.length > 0 
    ? rejectionInsights.join("\n- ")
    : "No specific rejection notes provided yet.";

  const prompt = `
    You are an elite career strategist and recruiter. Your task is to perform a "Surgical Search Audit" for a candidate.
    
    CANDIDATE PROFILE:
    Target Job Title: ${jobTitle}
    Resume Content: ${resumeText.substring(0, 4000)}
    
    REJECTION SIGNALS (Post-Mortem Notes):
    - ${insightsText}
    
    TASK:
    Analyze the patterns in the rejections. Compare the feedback (if any) with the candidate's resume and target job title.
    Provide a "Strategic Pivot" in 3-4 powerful, actionable sentences. 
    Focus on:
    1. Identifying the "Root Cause" of friction (e.g. skills gap, seniority mismatch, interview performance).
    2. Suggesting a specific change (e.g. "Pivot to Mid-level roles," "Add [X] skill to your summary," "Focus on [Y] type of companies").
    
    Be direct, high-agency, and professional. Avoid fluff.
    
    Return ONLY the strategic advice text.
  `;

  try {
    const { text } = await runWithRotation(genAI, prompt);
    return text.trim();
  } catch (error: any) {
    console.error("AI Strategic Audit Error:", error.message || error);
    return "Your search is currently focused on high-match roles. Continue gathering signals to generate a deep-learning pivot recommendation.";
  }
}
