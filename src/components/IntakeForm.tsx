import React, { useState } from "react";
import { Sparkles, Target, Layers, Send, TrendingUp, AlertCircle } from "lucide-react";

interface Preset {
  id: string;
  name: string;
  topic: string;
  audience: string;
  industry: string;
  contentGoal: string;
  platforms: string[];
}

const PRESETS: Preset[] = [
  {
    id: "dev-tools",
    name: "🛠️ DevTools Startup",
    topic: "Continuous Integration for iOS/Android apps",
    audience: "Mobile Engineering Leads and iOS Architects",
    industry: "Developer Tools / B2B SaaS",
    contentGoal: "Product Adoption",
    platforms: ["Blog", "LinkedIn", "Newsletter"],
  },
  {
    id: "sustainable-b2c",
    name: "🌿 Sustainable E-commerce",
    topic: "Transitioning to a zero-waste home pantry",
    audience: "Eco-conscious millennial parents",
    industry: "Consumer Packaged Goods / Lifestyle",
    contentGoal: "Brand Awareness",
    platforms: ["Blog", "Newsletter"],
  },
  {
    id: "fintech-enterprise",
    name: "💳 AI FinTech SaaS",
    topic: "Automating enterprise treasury reconciliation with AI agents",
    audience: "Corporate treasurers and CFOs of mid-market companies",
    industry: "Financial Services / Enterprise Software",
    contentGoal: "Thought Leadership",
    platforms: ["LinkedIn", "Newsletter"],
  },
  {
    id: "fitness-local",
    name: "🏋️ Local Fitness Coaching",
    topic: "Strength training routine consistency for busy 30+ year-olds",
    audience: "Desk-bound working professionals looking to build solid habits",
    industry: "Health, Wellness & Personal Fitness",
    contentGoal: "Lead Generation",
    platforms: ["Blog", "LinkedIn"],
  },
];

interface IntakeFormProps {
  onSubmit: (data: {
    topic: string;
    audience: string;
    industry: string;
    contentGoal: string;
    platforms: string[];
  }) => void;
  isLoading: boolean;
}

export default function IntakeForm({ onSubmit, isLoading }: IntakeFormProps) {
  const [topic, setTopic] = useState("");
  const [audience, setAudience] = useState("");
  const [industry, setIndustry] = useState("");
  const [contentGoal, setContentGoal] = useState("Thought Leadership");
  const [platforms, setPlatforms] = useState<string[]>(["Blog", "LinkedIn", "Newsletter"]);
  const [validationError, setValidationError] = useState("");

  const [customScenario, setCustomScenario] = useState("");
  const [isParsingScenario, setIsParsingScenario] = useState(false);

  const handleApplyPreset = (preset: Preset) => {
    setTopic(preset.topic);
    setAudience(preset.audience);
    setIndustry(preset.industry);
    setContentGoal(preset.contentGoal);
    setPlatforms(preset.platforms);
    setValidationError("");
  };

  const handleApplyCustomScenario = async (autoSubmit = false) => {
    if (!customScenario.trim()) {
      setValidationError("Please specify or describe a custom scenario first.");
      return;
    }
    setIsParsingScenario(true);
    setValidationError("");
    try {
      const res = await fetch("/api/parse-scenario", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenario: customScenario }),
      });
      const data = await res.json();
      if (data.success && data.parameters) {
        const { topic: parsedTopic, audience: parsedAudience, industry: parsedIndustry, contentGoal: parsedGoal, platforms: parsedPlatforms } = data.parameters;
        
        const finalTopic = parsedTopic || "";
        const finalAudience = parsedAudience || "";
        const finalIndustry = parsedIndustry || "";
        const finalGoal = parsedGoal || "Thought Leadership";
        const finalPlatforms = (parsedPlatforms && parsedPlatforms.length > 0) ? parsedPlatforms : ["Blog", "LinkedIn", "Newsletter"];

        setTopic(finalTopic);
        setAudience(finalAudience);
        setIndustry(finalIndustry);
        setContentGoal(finalGoal);
        setPlatforms(finalPlatforms);

        if (autoSubmit) {
          if (!finalTopic || !finalAudience || !finalIndustry) {
            setValidationError("Extracted fields are incomplete. Please review and fill manual gaps before running.");
          } else {
            onSubmit({
              topic: finalTopic,
              audience: finalAudience,
              industry: finalIndustry,
              contentGoal: finalGoal,
              platforms: finalPlatforms
            });
          }
        }
      } else {
        setValidationError(data.error || "The AI model failed to parse and extract scenario details. Please describe it with more details.");
      }
    } catch (err: any) {
      console.error(err);
      setValidationError("Network connection to strategist parser failed. Please ensure the backend is responsive.");
    } finally {
      setIsParsingScenario(false);
    }
  };

  const handlePlatformToggle = (platform: string) => {
    if (platforms.includes(platform)) {
      if (platforms.length > 1) {
        setPlatforms(platforms.filter((p) => p !== platform));
      } else {
        setValidationError("Select at least one content distribution channel.");
      }
    } else {
      setPlatforms([...platforms, platform]);
      setValidationError("");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) {
      setValidationError("Please specify a content topic or focus area.");
      return;
    }
    if (!audience.trim()) {
      setValidationError("Please specify a target reader or buyer profile.");
      return;
    }
    if (!industry.trim()) {
      setValidationError("Please specify the industry context.");
      return;
    }
    setValidationError("");
    onSubmit({ topic, audience, industry, contentGoal, platforms });
  };

  return (
    <div id="strategy-setup-pane" className="bg-white border border-[#EBEBEB] rounded-xl p-6 sm:p-8 shadow-xs">
      <div className="mb-6">
        <h2 className="text-xl font-serif text-[#1F1F1F] font-bold tracking-tight mb-1">
          Intake Strategy Engine
        </h2>
        <p className="text-xs text-[#6F6F6F] font-sans">
          Lock in your target constraints to guide our autonomous strategist core.
        </p>
      </div>

      {/* Scenario Entry & Presets */}
      <div className="mb-8 border-b border-[#F2F2F2] pb-6">
        <label htmlFor="custom-scenario-input" className="block text-xs font-mono tracking-wider text-[#A0A0A0] uppercase mb-2">
          1. Select or Enter a Strategic Blueprint Scenario
        </label>
        
        {/* Custom Scenario Text Area */}
        <div className="mb-4">
          <div className="flex flex-col sm:flex-row gap-2">
            <textarea
              id="custom-scenario-input"
              rows={3}
              placeholder="Describe any strategic goal or scenario (e.g., 'A sustainable coffee subscription targeting young urban professionals looking for premium organic roasts')"
              value={customScenario}
              onChange={(e) => setCustomScenario(e.target.value)}
              className="flex-1 text-xs font-sans px-3 py-2.5 bg-[#FAF8F5] border border-[#E2DFD9] rounded-lg text-[#1F1F1F] focus:outline-hidden focus:border-[#C39A6B] placeholder-zinc-400 leading-normal resize-none"
            />
            <div className="flex flex-row sm:flex-col gap-2 shrink-0 sm:w-[130px]">
              <button
                type="button"
                onClick={() => handleApplyCustomScenario(false)}
                disabled={isParsingScenario || !customScenario.trim()}
                className="flex-1 py-2 px-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 disabled:bg-zinc-50 disabled:text-zinc-400 disabled:cursor-not-allowed text-[10px] font-mono uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-1.5 border border-[#E2DFD9] cursor-pointer"
              >
                {isParsingScenario ? (
                  <div className="animate-spin border-2 border-zinc-400 border-t-transparent rounded-full w-3.5 h-3.5" />
                ) : (
                  <Layers className="w-3.5 h-3.5 text-zinc-500" />
                )}
                <span>1. Fill Form</span>
              </button>
              <button
                type="button"
                onClick={() => handleApplyCustomScenario(true)}
                disabled={isParsingScenario || !customScenario.trim() || isLoading}
                className="flex-1 py-2 px-3 bg-[#1F1F1F] hover:bg-[#C39A6B] text-white disabled:bg-zinc-100 disabled:text-zinc-400 disabled:cursor-not-allowed text-[10px] font-mono uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-1.5 border border-transparent font-bold cursor-pointer"
              >
                {isParsingScenario || isLoading ? (
                  <div className="animate-spin border-2 border-white/50 border-t-transparent rounded-full w-3.5 h-3.5" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5 text-[#C39A6B]" />
                )}
                <span>2. Fill & Run</span>
              </button>
            </div>
          </div>
          <p className="text-[10px] text-zinc-400 font-sans mt-1">
            Type any scenario and click <span className="text-zinc-700 font-semibold">1. Fill Form</span> to review details below, or click <span className="text-zinc-700 font-semibold">2. Fill & Run</span> to directly generate your campaign strategy!
          </p>
        </div>

        {/* Quick presets row */}
        <div>
          <span className="block text-[9px] font-mono tracking-wider text-[#A0A0A0] uppercase mb-2">
            Or choose a quick starter preset:
          </span>
          <div className="grid grid-cols-2 gap-2">
            {PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => {
                  handleApplyPreset(preset);
                  setCustomScenario(`Continuous growth strategy for ${preset.topic} targeting ${preset.audience}`);
                }}
                className="px-3 py-2 text-left text-[11px] font-sans rounded-lg border border-[#EAEAEA] bg-[#FAF9F5] hover:bg-[#F2EFE8] hover:border-[#D6D0C2] active:bg-[#ECE6D9] transition-all cursor-pointer truncate"
              >
                <span className="font-semibold">{preset.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Topic Input */}
        <div>
          <label htmlFor="topic-input" className="block text-xs font-mono tracking-wider text-[#A0A0A0] uppercase mb-2">
            2. Content Focus / Core Topic Area
          </label>
          <div className="relative">
            <input
              id="topic-input"
              type="text"
              placeholder="e.g., continuous delivery for mobile engineers, meal prepping"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full text-sm font-sans px-4 py-3 bg-[#FAF8F5] border border-[#E2DFD9] rounded-lg text-[#1F1F1F] focus:outline-hidden focus:border-[#C39A6B] focus:ring-1 focus:ring-[#C39A6B] transition-colors"
            />
          </div>
        </div>

        {/* Audience Input */}
        <div>
          <label htmlFor="audience-input" className="block text-xs font-mono tracking-wider text-[#A0A0A0] uppercase mb-2">
            3. Specific Target Audience Cohort
          </label>
          <input
            id="audience-input"
            type="text"
            placeholder="e.g., bootstrapped micro-saas founders, busy parents"
            value={audience}
            onChange={(e) => setAudience(e.target.value)}
            className="w-full text-sm font-sans px-4 py-3 bg-[#FAF8F5] border border-[#E2DFD9] rounded-lg text-[#1F1F1F] focus:outline-hidden focus:border-[#C39A6B] focus:ring-1 focus:ring-[#C39A6B] transition-colors"
          />
        </div>

        {/* Industry Input */}
        <div>
          <label htmlFor="industry-input" className="block text-xs font-mono tracking-wider text-[#A0A0A0] uppercase mb-2">
            4. Industry Vertical Context
          </label>
          <input
            id="industry-input"
            type="text"
            placeholder="e.g., B2B Developer Tools, FinTech, Lifestyle CPG"
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            className="w-full text-sm font-sans px-4 py-3 bg-[#FAF8F5] border border-[#E2DFD9] rounded-lg text-[#1F1F1F] focus:outline-hidden focus:border-[#C39A6B] focus:ring-1 focus:ring-[#C39A6B] transition-colors"
          />
        </div>

        {/* Content Goal Selection */}
        <div>
          <span className="block text-xs font-mono tracking-wider text-[#A0A0A0] uppercase mb-2">
            5. Primary Commercial KPI Goal
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {[
              { label: "Thought Leadership", desc: "Build authority and high novelty angles" },
              { label: "Lead Generation", desc: "Drive downloads, newsletters, & forms" },
              { label: "Traffic", desc: "In-depth SEO search interest density" },
              { label: "Product Adoption", desc: "Technical tutorials and problem-solving" },
              { label: "Brand Awareness", desc: "Amplified shareability and fast hooks" },
            ].map((goalObj) => (
              <button
                key={goalObj.label}
                type="button"
                onClick={() => setContentGoal(goalObj.label)}
                className={`p-3 text-left border rounded-lg transition-all cursor-pointer ${
                  contentGoal === goalObj.label
                    ? "bg-[#1F1F1F] border-[#1F1F1F] text-white"
                    : "bg-[#FAF8F5] border-[#E2DFD9] text-[#4A4A4A] hover:bg-[#F3EFF8] hover:border-[#D6D0C2]"
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <Target className={`w-3.5 h-3.5 ${contentGoal === goalObj.label ? "text-[#C39A6B]" : "text-[#7B7B7B]"}`} />
                  <span className="text-xs font-bold leading-none">{goalObj.label}</span>
                </div>
                <span className={`text-[10px] block leading-tight ${contentGoal === goalObj.label ? "text-[#E0E0E0]" : "text-[#7B7B7B]"}`}>
                  {goalObj.desc}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Channels/Platforms */}
        <div>
          <span className="block text-xs font-mono tracking-wider text-[#A0A0A0] uppercase mb-2">
            6. Target Distribution Channels
          </span>
          <div className="flex flex-wrap gap-2">
            {["Blog", "LinkedIn", "Newsletter"].map((platform) => {
              const selected = platforms.includes(platform);
              return (
                <button
                  key={platform}
                  type="button"
                  onClick={() => handlePlatformToggle(platform)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-xs font-sans font-medium transition-all cursor-pointer ${
                    selected
                      ? "bg-[#C39A6B] border-[#C39A6B] text-white font-semibold"
                      : "bg-[#FAF8F5] border-[#E2DFD9] text-[#787878] hover:bg-[#F2EFE8]"
                  }`}
                >
                  <Layers className={`w-3.5 h-3.5 ${selected ? "text-white" : "text-[#A0A0A0]"}`} />
                  {platform}
                </button>
              );
            })}
          </div>
        </div>

        {validationError && (
          <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg border border-red-100 text-xs font-sans">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full py-4 px-6 rounded-lg text-white font-sans text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs ${
            isLoading
              ? "bg-[#717171] cursor-not-allowed"
              : "bg-[#1F1F1F] hover:bg-[#C39A6B] active:scale-98 tracking-wide font-mono uppercase"
          }`}
        >
          {isLoading ? (
            <>
              <div className="animate-spin border-2 border-white border-t-transparent rounded-full w-4 h-4" />
              <span>Analyzing Market Landscapes...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Deploy Asset Strategist Run</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
