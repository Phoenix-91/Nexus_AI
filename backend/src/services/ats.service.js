import { createRequire } from 'module';
import Groq from 'groq-sdk';
import fs from 'fs';

// pdf-parse is CommonJS-only; use createRequire for ESM compatibility
// .default is needed because createRequire wraps the CJS exports object
const require = createRequire(import.meta.url);
const pdf = require('pdf-parse').default ?? require('pdf-parse');

// Lazy-init: ESM hoists imports before dotenv.config() runs, so we must
// create the Groq client inside the function (not at module level).
let _groq;
const getGroq = () => {
    if (!_groq) _groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    return _groq;
};

// Extract text from PDF
export const extractTextFromPDF = async (filePath) => {
    try {
        const dataBuffer = fs.readFileSync(filePath);
        const data = await pdf(dataBuffer);
        return data.text;
    } catch (error) {
        throw new Error(`PDF extraction failed: ${error.message}`);
    }
};

// Analyze resume with Groq AI
export const analyzeWithAI = async (resumeText, jobRole) => {
    try {
        console.log('🤖 Starting AI analysis for role:', jobRole);

        const prompt = `You are an ATS (Applicant Tracking System) expert analyzer. Analyze this resume for the role of ${jobRole}.

RESUME TEXT:
${resumeText}

TARGET JOB ROLE: ${jobRole}

Provide a comprehensive ATS analysis in JSON format with exactly these fields:

{
  "atsScore": <number 0-100>,
  "verdict": "<Excellent/Good/Fair/Poor>",
  "keywordScore": <number 0-100>,
  "formatScore": <number 0-100>,
  "experienceScore": <number 0-100>,
  "skillsScore": <number 0-100>,
  "missingKeywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
  "foundKeywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
  "skillsAnalysis": [
    {"name": "skill1", "score": 85},
    {"name": "skill2", "score": 70},
    {"name": "skill3", "score": 60},
    {"name": "skill4", "score": 80},
    {"name": "skill5", "score": 65}
  ],
  "suggestions": [
    {"icon": "📝", "title": "Suggestion title", "description": "Detailed suggestion text"},
    {"icon": "🔑", "title": "Suggestion title", "description": "Detailed suggestion text"},
    {"icon": "💼", "title": "Suggestion title", "description": "Detailed suggestion text"},
    {"icon": "📊", "title": "Suggestion title", "description": "Detailed suggestion text"}
  ],
  "detailedAnalysis": "A comprehensive 3-4 sentence paragraph explaining the resume quality, what is missing, what is good, and how to improve it specifically for the ${jobRole} role."
}

Be specific to the ${jobRole} role. Include relevant technical keywords, skills, and experience requirements.

RESPOND ONLY WITH VALID JSON. NO MARKDOWN CODE BLOCKS, NO EXPLANATIONS, JUST RAW JSON.`;

        const response = await getGroq().chat.completions.create({
            model: 'llama-3.3-70b-versatile',
            messages: [{ role: 'user', content: prompt }],
            response_format: { type: 'json_object' },
            temperature: 0.7,
            max_tokens: 2000
        });

        const analysis = JSON.parse(response.choices[0].message.content);
        console.log('✅ AI analysis complete. Score:', analysis.atsScore);
        return analysis;

    } catch (error) {
        console.error('❌ AI analysis error:', error);
        throw new Error(`AI analysis failed: ${error.message}`);
    }
};
