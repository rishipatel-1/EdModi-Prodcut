
import { GoogleGenAI } from "@google/genai";
import { StudentProfile, MicroLesson, ChatMessage, Topic, LearningPlan } from "../types";

const apiKey = import.meta.env.VITE_GOOGLE_GENAI_API_KEY || process.env.API_KEY || "";
const ai = new GoogleGenAI({ apiKey });

// --- CACHE SYSTEM ---
const lessonCache = new Map<string, MicroLesson>();
const planCache = new Map<string, LearningPlan>();

// Helper: Delay execution for backoff
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// --- FALLBACK SYSTEM (Offline Mode) ---
const getFallbackLesson = (topicId: string, topicTitle: string): MicroLesson => ({
  id: `fallback-${Date.now()}`,
  topicId: topicId,
  title: `${topicTitle} (Offline Mode)`,
  estimatedMinutes: 3,
  steps: [
    {
      id: 'f-1',
      type: 'diagnostic',
      prompt: `We are currently experiencing high traffic (AI Brain Cooling Down). How confident do you feel about ${topicTitle} right now?`,
      choices: ["Not confident", "A little bit", "Pretty confident", "Expert"],
      correctAnswerIndex: 2,
      explanation: "Self-reflection is the first step to mastery. We'll get the AI back online shortly."
    },
    {
      id: 'f-2',
      type: 'explanation',
      content: `**Offline Study Mode**\n\nSince we can't generate a fresh lesson right now, let's use the **'Blurting'** technique.\n\n1. Grab a piece of paper.\n2. Write down EVERYTHING you know about **${topicTitle}** in 2 minutes.\n3. Check your notes to see what you missed.\n\nActive recall builds stronger memory pathways than just reading!`,
      videoTitle: "Focus Music (Lofi Beats)",
      videoUrl: "https://www.youtube.com/watch?v=jfKfPfyJRdk",
      videoExplanation: "Here is some background music to help you focus on your revision notes while we reconnect."
    },
    {
      id: 'f-3',
      type: 'practice',
      prompt: "Did you manage to write down at least 3 key facts about this topic?",
      choices: ["Yes, I did!", "No, I struggled", "I didn't try"],
      correctAnswerIndex: 0,
      explanation: "Even struggling to remember helps your brain learn better next time."
    },
    {
      id: 'f-4',
      type: 'summary',
      content: "Great effort staying productive even when the tech was slow. Try reloading in a few minutes for a full AI lesson."
    }
  ]
});

export const generateLessonContent = async (
  topicId: string,
  topicTitle: string,
  student: StudentProfile,
  isCalibration: boolean = false
): Promise<MicroLesson | null> => {
  
  const cacheKey = `${student.id}-${topicId}-${isCalibration ? 'calib' : 'std'}`;
  if (lessonCache.has(cacheKey)) {
    return lessonCache.get(cacheKey)!;
  }

  try {
    const modelId = "gemini-2.5-flash";
    const isExampleFirst = student.contentPreference === 'Example First';
    const isHigherTier = student.targetGrade?.includes('8-9') || student.targetGrade?.includes('6-7');
    const tierLabel = isHigherTier ? 'Higher' : 'Foundation';

    let stepsStructure = '';
    let promptContext = '';

    if (isCalibration) {
      promptContext = `
        TASK: Create a "Calibration Mission" (Initial Assessment).
        Topic: ${topicTitle} (Mix of weak areas: ${student.weakAreas?.join(', ') || 'General Maths'}).
        Goal: Assess actual level.
        Structure: 5 diagnostic questions only. No explanations.
      `;
      stepsStructure = `
        1. Diagnostic Q1
        2. Diagnostic Q2
        3. Diagnostic Q3
        4. Diagnostic Q4
        5. Diagnostic Q5
        6. Summary: "Baseline Established".
      `;
    } else {
      promptContext = `
        TASK: Create a Micro-Lesson.
        Topic: ${topicTitle} (GCSE Maths).
        Profile: ${student.name}, Level: ${tierLabel}, Style: ${student.learningStyle}.
      `;

      stepsStructure = isExampleFirst
        ? `1. Diagnostic 2. Worked Example 3. Explanation 4. Practice 1 5. Practice 2 6. Summary`
        : `1. Diagnostic 2. Explanation 3. Worked Example 4. Practice 1 5. Practice 2 6. Summary`;
    }

    const searchInstruction = !isCalibration 
      ? (student.learningStyle === 'Visual'
        ? `SEARCH: "GCSE Maths ${topicTitle} visual" or "Cognito".`
        : `SEARCH: "GCSE Maths ${topicTitle} explanation".`)
      : 'SKIP SEARCH';

    const prompt = `
      You are Edmoti's Lead Architect.
      ${promptContext}
      1. **SEARCH**: ${isCalibration ? 'Skip.' : `Use googleSearch. ${searchInstruction}`}
      2. **GENERATE**: Create Micro-Lesson JSON.

      OUTPUT JSON STRICTLY:
      {
        "id": "unique_string",
        "topicId": "${topicId}",
        "title": "${topicTitle}",
        "estimatedMinutes": 5,
        "isCalibration": ${isCalibration},
        "steps": [
          {
            "id": "step_1",
            "type": "diagnostic", 
            "prompt": "Question text",
            "choices": ["A", "B", "C", "D"],
            "correctAnswerIndex": 0,
            "explanation": "Feedback",
            "content": "Text (100 words max)",
            "videoUrl": "https://www.youtube.com/watch?v=...", 
            "videoTitle": "Video Title",
            "videoExplanation": "Why this video fits.",
            "videoTags": ["Tag1", "Tag2"]
          }
        ]
      }
      FLOW: ${stepsStructure}
    `;

    let response = null;
    const maxRetries = 5;
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        response = await ai.models.generateContent({
          model: modelId,
          contents: prompt,
          config: {
            tools: isCalibration ? [] : [{ googleSearch: {} }],
            thinkingConfig: { thinkingBudget: 0 }, 
          },
        });
        break;
      } catch (err: any) {
        const isRateLimit = err.status === 429 || err.status === 503 || err.message?.includes('429') || err.message?.includes('Quota');
        if (isRateLimit && attempt < maxRetries - 1) {
          const waitTime = Math.pow(2, attempt) * 4000 + (Math.random() * 2000);
          await delay(waitTime);
          continue;
        }
        throw err;
      }
    }

    if (response && response.text) {
      let cleanText = response.text.trim();
      if (cleanText.startsWith('```json')) cleanText = cleanText.replace(/^```json/, '').replace(/```$/, '');
      else if (cleanText.startsWith('```')) cleanText = cleanText.replace(/^```/, '').replace(/```$/, '');
      cleanText = cleanText.replace(/"\s+"/g, '", "');
      cleanText = cleanText.replace(/,\s*]/g, ']');

      try {
        const lessonData = JSON.parse(cleanText) as MicroLesson;
        lessonData.topicId = topicId;
        lessonCache.set(cacheKey, lessonData);
        return lessonData;
      } catch (parseError) {
        return getFallbackLesson(topicId, topicTitle);
      }
    }
    return getFallbackLesson(topicId, topicTitle);
  } catch (error) {
    return getFallbackLesson(topicId, topicTitle);
  }
};

export const generateTutorResponse = async (
  studentName: string,
  context: string,
  userQuestion: string,
  learningStyle: string
): Promise<string> => {
  try {
    let response = null;
    const maxRetries = 5;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: `
            Act as Edmoti Tutor. Student: ${studentName} (${learningStyle}).
            Context: "${context}". Question: "${userQuestion}".
            Goal: Reassure, Explain Simply (Analogy), Keep Short.
          `,
          config: { thinkingConfig: { thinkingBudget: 0 } }
        });
        break;
      } catch (err: any) {
        const isRateLimit = err.status === 429 || err.status === 503 || err.message?.includes('429') || err.message?.includes('Quota');
        if (isRateLimit && attempt < maxRetries - 1) {
          await delay(Math.pow(2, attempt) * 4000);
          continue;
        }
        throw err;
      }
    }
    return response?.text || "I'm analyzing that...";
  } catch (e) {
    return "I'm temporarily offline due to high traffic (429). Try again shortly!";
  }
};

// --- LEARNING SEQUENCE ENGINE ---
export const generateLearningPlan = async (
  student: StudentProfile,
  topics: Topic[]
): Promise<LearningPlan | null> => {
  const cacheKey = `plan-${student.id}`;
  if (planCache.has(cacheKey)) return planCache.get(cacheKey)!;

  try {
    // Prepare Data for Prompt
    const studentData = {
      board: "AQA", 
      tier: (student.targetGrade?.includes('8') || student.targetGrade?.includes('9')) ? "higher" : "foundation",
      learningStyle: student.learningStyle,
      attentionMode: student.focusMode.toLowerCase(),
      anxietyLevel: student.confidenceLevel?.toLowerCase() || 'medium',
      topics: topics.map(t => ({
        id: t.id,
        name: t.title,
        group: t.category,
        masteryPercent: t.progress,
        masteryBand: t.mastery.toLowerCase()
      }))
    };

    const prompt = `
      You are Gemini acting as the Lesson Sequencing Engine for Edmoti.
      
      INPUT DATA:
      ${JSON.stringify(studentData)}

      ALGORITHM:
      1. Classify topics (Weak=A, Developing=B, Secure=C).
      2. Prioritize prerequisites.
      3. Plan next 3 sessions.
      4. Balance: 60% A, 30% B, 10% C.

      OUTPUT JSON STRICTLY:
      {
        "planHorizonDays": 5,
        "sessionsPlanned": 3,
        "sequence": [
          {
            "sessionNumber": 1,
            "focus": "confidence",
            "topics": [
              { "topicId": "id", "topicName": "Name", "priorityBand": "A", "reason": "Why", "recommendedMicroLessons": 1 }
            ]
          }
        ],
        "overallStrategy": { "summary": "...", "percentageWeakFocus": 60, "percentageDevelopingFocus": 30, "percentageReviewFocus": 10 }
      }
    `;

    let response = null;
    const maxRetries = 3;
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: prompt,
          config: { thinkingConfig: { thinkingBudget: 0 } }
        });
        break;
      } catch (err: any) {
        const isRateLimit = err.status === 429 || err.status === 503 || err.message?.includes('429');
        if (isRateLimit && attempt < maxRetries - 1) {
          await delay(Math.pow(2, attempt) * 4000);
          continue;
        }
        throw err;
      }
    }

    if (response && response.text) {
      let cleanText = response.text.trim();
      if (cleanText.startsWith('```json')) cleanText = cleanText.replace(/^```json/, '').replace(/```$/, '');
      else if (cleanText.startsWith('```')) cleanText = cleanText.replace(/^```/, '').replace(/```$/, '');
      cleanText = cleanText.replace(/"\s+"/g, '", "'); // Fix missing commas
      
      const plan = JSON.parse(cleanText) as LearningPlan;
      planCache.set(cacheKey, plan);
      return plan;
    }
    return null;
  } catch (e) {
    console.error("Plan Generation Error", e);
    return null;
  }
};
