import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// Lazy-loaded Gemini AI client to prevent startup crashes if key is empty
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not set. Please add it in Settings > Secrets.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

async function callGeminiWithRetry<T>(
  apiCall: (modelName: string) => Promise<T>,
  retries = 3,
  delay = 1500,
  useFallbackModel = false
): Promise<T> {
  const modelName = useFallbackModel ? "gemini-2.5-flash" : "gemini-3.5-flash";
  try {
    return await apiCall(modelName);
  } catch (error: any) {
    const errorStr = String(error?.message || error || "");
    const status = error?.status || error?.statusCode || 0;
    
    const isTransient = 
      status === 503 || 
      status === 429 || 
      errorStr.includes("503") ||
      errorStr.includes("429") ||
      errorStr.includes("high demand") ||
      errorStr.includes("UNAVAILABLE") ||
      errorStr.includes("RESOURCE_EXHAUSTED") ||
      errorStr.includes("overloaded");

    if (isTransient) {
      if (retries > 0) {
        console.warn(`Gemini API returned transient error for ${modelName} (status ${status}, retries left: ${retries}). Retrying in ${delay}ms...`, errorStr);
        await new Promise((resolve) => setTimeout(resolve, delay));
        return callGeminiWithRetry(apiCall, retries - 1, delay * 2, useFallbackModel);
      } else if (!useFallbackModel) {
        console.warn(`Gemini API retries exhausted for ${modelName}. Falling back to gemini-2.5-flash...`);
        return callGeminiWithRetry(apiCall, 2, 1000, true);
      }
    }
    throw error;
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Use JSON parsing with a generous size limit for rich payloads
  app.use(express.json({ limit: "15mb" }));

  // API endpoint for content generation
  app.post("/api/generate", async (req, res) => {
    try {
      const { topic, audience, industry, contentGoal, platforms } = req.body;

      if (!topic || !audience || !industry || !contentGoal || !platforms || !platforms.length) {
        return res.status(400).json({ error: "Missing required fields (topic, audience, industry, contentGoal, platforms)." });
      }

      const ai = getGeminiClient();

      const analysisPrompt = `You are an elite growth-oriented Content Strategist, Search Analyst, and Editorial Director.
Generate a comprehensive, non-cliché, highly specific editorial blueprint for the following parameters:

Topic Area: "${topic}"
Audience Segment: "${audience}"
Industry Vertical: "${industry}"
Primary Conversion Goal: "${contentGoal}"
Target Distribution Mediums: ${platforms.join(", ")}

Perform these exact 7 steps to formulate your master plan:
- Step 1 (Audience Analysis): Detail primary and secondary cohorts, deep challenges, frequent real-world queries, mental blocks, and target outcomes.
- Step 2 (Search Intent Mapping): Generate EXACTLY 20 highly specific search/social intent vectors spread across Informational, Commercial, Transactional, Emerging, and Contrarian.
- Step 3 (Editorial Gap Analysis): Examine the landscape. Outline saturated clichès, boring overdone titles, missing active discussions, tough questions people dodge, and contrarian perspectives.
- Step 4 (Idea Generation): Craft exactly 10 blog concepts, 10 LinkedIn ideas, and 10 Newsletter formats.
- Step 5 (Idea Scoring): Score each of these 30 items 1-10 on Novelty, Audience Relevance, Business Value, Search Opportunity, and Shareability, producing a mathematically calculated average overall score (1.0 - 10.0).
- Step 6 (Prioritization): Order the aggregate ideas list by their scoring to extract the top 5 high-leverage concepts. Provide distinct reasons for prioritization, format suggestions, and brief.
- Step 7 (Execution Brief): Take the single #1 highest-scored prospect. Author a deep production brief containing a systematic outline, talking points, concrete lead magnet, and high-converting CTA copy.

Deliver your strategic blueprint strictly respecting the JSON output schema. Avoid filler text and generic boilerplate advice. Populate values with specific, data-rich terms customized specifically for "${topic}" in the context of "${industry}".`;

      const responseSchema = {
        type: Type.OBJECT,
        properties: {
          audienceAnalysis: {
            type: Type.OBJECT,
            properties: {
              primaryAudience: { type: Type.STRING, description: "Detailed persona profiles of primary buyers/readers" },
              secondaryAudience: { type: Type.STRING, description: "Detailed persona profiles of secondary influencers/adopters" },
              goals: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Direct objectives the readers are evaluated on" },
              painPoints: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Real-world friction points, operational leaks, or daily frustrations" },
              frequentQuestions: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Specific verbatim questions target readers ask online or in meetings" },
              objections: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Internal or organizational barriers to adopting this topic's concepts" },
              desiredOutcomes: { type: Type.ARRAY, items: { type: Type.STRING }, description: "What maximum success or validation looks like for them" }
            },
            required: ["primaryAudience", "secondaryAudience", "goals", "painPoints", "frequentQuestions", "objections", "desiredOutcomes"]
          },
          searchIntentMapping: {
            type: Type.OBJECT,
            properties: {
              opportunities: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    topic: { type: Type.STRING, description: "Highly specific keyword phrase or content concept structure" },
                    intent: { type: Type.STRING, description: "Category string, must be one of: Informational, Commercial, Transactional, Emerging, Contrarian" },
                    description: { type: Type.STRING, description: "Analysis of reader search intent and emotional trigger" }
                  },
                  required: ["topic", "intent", "description"]
                },
                description: "List of exactly 20 diverse search/topic intent opportunities mapping out user journeys."
              }
            },
            required: ["opportunities"]
          },
          editorialGapAnalysis: {
            type: Type.OBJECT,
            properties: {
              saturatedIdeas: { type: Type.ARRAY, items: { type: Type.STRING }, description: "The most common and boring topics in this niche that we should avoid doing raw" },
              overusedAngles: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Tired content hooks, clickbait clichés, and overplayed narratives" },
              missingConversations: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Crucial sub-discussions or systemic realities that are weirdly neglected" },
              underservedQuestions: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Highly technical or difficult questions that current search results fail to answer" },
              counterintuitiveInsights: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Strong, truth-based contrarian perspectives that break conventional consensus" },
              summary: { type: Type.STRING, description: "A high-level synthesis outlining how to win by filling these specific gaps (150-200 words)" }
            },
            required: ["saturatedIdeas", "overusedAngles", "missingConversations", "underservedQuestions", "counterintuitiveInsights", "summary"]
          },
          blogIdeas: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                title: { type: Type.STRING, description: "Highly optimized, original article headline" },
                targetAudience: { type: Type.STRING },
                searchIntent: { type: Type.STRING, description: "e.g., Commercial, Transactional, etc." },
                whyItMatters: { type: Type.STRING, description: "Why this article commands active reading time" },
                difficulty: { type: Type.STRING, description: "Must be: Low, Medium, High" },
                impact: { type: Type.STRING, description: "Must be: Low, Medium, High" },
                scores: {
                  type: Type.OBJECT,
                  properties: {
                    novelty: { type: Type.NUMBER, description: "Integer 1-10 based on how rare/original this content concept is" },
                    audienceRelevance: { type: Type.NUMBER, description: "Integer 1-10 based on alignment with pain points" },
                    businessValue: { type: Type.NUMBER, description: "Integer 1-10 based on product alignment/lead potential" },
                    searchOpportunity: { type: Type.NUMBER, description: "Integer 1-10 based on search volume to programmatic competition ratio" },
                    shareability: { type: Type.NUMBER, description: "Integer 1-10 based on emotional triggers, controversy, or visual ease" },
                    overallScore: { type: Type.NUMBER, description: "Average score calculated from the 5 scoring parameters" }
                  },
                  required: ["novelty", "audienceRelevance", "businessValue", "searchOpportunity", "shareability", "overallScore"]
                }
              },
              required: ["id", "title", "targetAudience", "searchIntent", "whyItMatters", "difficulty", "impact", "scores"]
            }
          },
          linkedinIdeas: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                hook: { type: Type.STRING, description: "Attention-grabbing hook line designed to stop scroll" },
                coreInsight: { type: Type.STRING, description: "The single high-impact thesis or framework" },
                engagementPotential: { type: Type.STRING, description: "Must be: Low, Medium, High" },
                suggestedCTA: { type: Type.STRING, description: "Conversion or discussion oriented CTAs" },
                scores: {
                  type: Type.OBJECT,
                  properties: {
                    novelty: { type: Type.NUMBER },
                    audienceRelevance: { type: Type.NUMBER },
                    businessValue: { type: Type.NUMBER },
                    searchOpportunity: { type: Type.NUMBER },
                    shareability: { type: Type.NUMBER },
                    overallScore: { type: Type.NUMBER }
                  },
                  required: ["novelty", "audienceRelevance", "businessValue", "searchOpportunity", "shareability", "overallScore"]
                }
              },
              required: ["id", "hook", "coreInsight", "engagementPotential", "suggestedCTA", "scores"]
            }
          },
          newsletterIdeas: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                subjectLine: { type: Type.STRING, description: "Punchy email subject line designed for top open rates" },
                angle: { type: Type.STRING, description: "Storytelling setup, case study framework, or thought-experiments used as hook" },
                keyTakeaway: { type: Type.STRING, description: "The exact practical lesson a reader holds afterwards" },
                whySubscribersCare: { type: Type.STRING, description: "Why users won't hit unsubscribe" },
                scores: {
                  type: Type.OBJECT,
                  properties: {
                    novelty: { type: Type.NUMBER },
                    audienceRelevance: { type: Type.NUMBER },
                    businessValue: { type: Type.NUMBER },
                    searchOpportunity: { type: Type.NUMBER },
                    shareability: { type: Type.NUMBER },
                    overallScore: { type: Type.NUMBER }
                  },
                  required: ["novelty", "audienceRelevance", "businessValue", "searchOpportunity", "shareability", "overallScore"]
                }
              },
              required: ["id", "subjectLine", "angle", "keyTakeaway", "whySubscribersCare", "scores"]
            }
          },
          prioritizedOpportunities: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                ideaId: { type: Type.STRING, description: "Must match one of the generated ids e.g. blog-X, linkedin-Y, newsletter-Z" },
                title: { type: Type.STRING, description: "Headline / Name of the content item" },
                whyItWon: { type: Type.STRING, description: "Detailed strategic analysis of why this scored highest (Novelty, search traffic, or brand conversion synergy)" },
                recommendedFormat: { type: Type.STRING, description: "Concrete suggested media asset type" },
                expectedOutcome: { type: Type.STRING, description: "High-level goal outcome e.g. lead downloads, thought authority, viral backlinks" },
                contentBriefString: { type: Type.STRING, description: "Detailed synopsis mapping out sections, format, and core thesis" }
              },
              required: ["ideaId", "title", "whyItWon", "recommendedFormat", "expectedOutcome", "contentBriefString"]
            },
            description: "Top 5 high-leverage content concepts extracted directly based on highest aggregate scores."
          },
          executionBrief: {
            type: Type.OBJECT,
            properties: {
              workingTitle: { type: Type.STRING, description: "The final production title locked in" },
              targetKeyword: { type: Type.STRING, description: "High-level primary keyword with semantic search variations" },
              audience: { type: Type.STRING, description: "Segment target definition" },
              searchIntent: { type: Type.STRING },
              outline: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Comprehensive structural hierarchy (H2 / H3 milestones)" },
              keyTalkingPoints: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Specific points, insights, diagrams, stats, or frameworks to argue" },
              recommendedCTA: { type: Type.STRING, description: "Conversion link copy, inline triggers, or direct actions" },
              suggestedInternalLinks: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Supporting pillar pages or adjacent topics to link back to or link out" },
              suggestedLeadMagnet: { type: Type.STRING, description: "High-value asset (templates, cheat sheets, video audits, calculatros) designed to secure lead information" }
            },
            required: ["workingTitle", "targetKeyword", "audience", "searchIntent", "outline", "keyTalkingPoints", "recommendedCTA", "suggestedInternalLinks", "suggestedLeadMagnet"]
          }
        },
        required: ["audienceAnalysis", "searchIntentMapping", "editorialGapAnalysis", "blogIdeas", "linkedinIdeas", "newsletterIdeas", "prioritizedOpportunities", "executionBrief"]
      };

      const result = await callGeminiWithRetry((modelName) => 
        ai.models.generateContent({
          model: modelName,
          contents: analysisPrompt,
          config: {
            responseMimeType: "application/json",
            responseSchema,
            temperature: 0.2, // structured strategy prefers consistency, low temperature
          },
        })
      );

      const responseText = result.text;
      if (!responseText) {
        throw new Error("Empty response received from Gemini.");
      }

      const reportData = JSON.parse(responseText.trim());
      res.json({ success: true, report: reportData });
    } catch (error: any) {
      console.error("Content strategy generation error:", error);
      res.status(500).json({
        success: false,
        error: error.message || "An unexpected error occurred during model analysis.",
      });
    }
  });

  // API endpoint for parsing a custom scenario description into strategy parameters
  app.post("/api/parse-scenario", async (req, res) => {
    try {
      const { scenario } = req.body;
      if (!scenario || !scenario.trim()) {
        return res.status(400).json({ error: "No scenario description was provided." });
      }

      const ai = getGeminiClient();

      const parsePrompt = `You are a professional growth marketer and search content strategist.
Analyze the following custom strategic content scenario description:
"${scenario}"

Extract and recommend the optimal strategic parameters for our Content Strategy Generator.
Fill in the parameters with highly specific, non-cliché, professional growth-oriented descriptions.

Strictly map the extracted parameters into the output schema.
- contentGoal MUST be exactly one of: "Thought Leadership", "Lead Generation", "Traffic", "Product Adoption", "Brand Awareness".
- platforms MUST be an array containing at least one of: "Blog", "LinkedIn", "Newsletter".`;

      const responseSchema = {
        type: Type.OBJECT,
        properties: {
          topic: { type: Type.STRING, description: "Extracted/formulated content focus or core topic area" },
          audience: { type: Type.STRING, description: "Specific target audience cohort" },
          industry: { type: Type.STRING, description: "Industry vertical context" },
          contentGoal: { type: Type.STRING, description: "Recommended conversion KPI goal" },
          platforms: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Optimal distribution channels list" }
        },
        required: ["topic", "audience", "industry", "contentGoal", "platforms"]
      };

      const result = await callGeminiWithRetry((modelName) => 
        ai.models.generateContent({
          model: modelName,
          contents: parsePrompt,
          config: {
            responseMimeType: "application/json",
            responseSchema,
            temperature: 0.1,
          },
        })
      );

      const responseText = result.text;
      if (!responseText) {
        throw new Error("No response returned from the extractor.");
      }

      const extractedData = JSON.parse(responseText.trim());
      res.json({ success: true, parameters: extractedData });
    } catch (error: any) {
      console.error("Scenario parsing error:", error);
      res.status(500).json({
        success: false,
        error: error.message || "An unexpected error occurred during scenario extraction.",
      });
    }
  });

  // API endpoint for interactive strategist refinement chat
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, history, context } = req.body;

      if (!message) {
        return res.status(400).json({ error: "No message specified." });
      }

      const ai = getGeminiClient();

      // Build context summary for agent priming
      const contextPrompt = context 
        ? `You are discussing a content strategy report for the Topic: "${context.topic}" (Industry: "${context.industry}", Target Audience: "${context.audience}", Goal: "${context.contentGoal}").`
        : "You are an elite, high-leverage content strategist consulting a user on content ideation and distribution.";

      // Filter out leading model/assistant messages to ensure Gemini chat starts with a "user" turn
      const chatHistory = (history || [])
        .filter((msg: any, idx: number) => {
          const role = msg.role === "user" ? "user" : "model";
          if (role !== "user" && !history.slice(0, idx).some((m: any) => m.role === "user")) {
            return false;
          }
          return true;
        })
        .map((msg: any) => ({
          role: msg.role === "user" ? "user" : "model",
          parts: [{ text: msg.content || msg.text || "" }]
        }));

      // Append introductory prompt to set persona
      const systemInstruction = `${contextPrompt} Always speak like a highly experienced growth CMO, editorial director, and world-class SEO authority. Give actionable, expert advice. Skip surface-level recommendations, fluff, and pleasantries. Focus on CTR, distribution mechanics, psychological triggers, and editorial positioning. Keep answers tight, structured, and extremely practical.`;

      const contents = [
        ...chatHistory,
        { role: "user", parts: [{ text: message }] }
      ];

      const response = await callGeminiWithRetry((modelName) => 
        ai.models.generateContent({
          model: modelName,
          contents,
          config: {
            systemInstruction,
            temperature: 0.7,
          },
        })
      );

      res.json({ success: true, response: response.text });
    } catch (error: any) {
      console.error("Strategist chat error:", error);
      res.status(500).json({
        success: false,
        error: error.message || "An error occurred during interactive chat.",
      });
    }
  });

  // Serve static assets out of /dist in production mode, or run Vite middleware in development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Server] Agentic Content Strategist running on host 0.0.0.0, port ${PORT}`);
  });
}

startServer();
