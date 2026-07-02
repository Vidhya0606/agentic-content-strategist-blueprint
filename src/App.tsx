import React, { useState, useEffect } from "react";
import { 
  Sparkles, 
  Target, 
  BookOpen, 
  Layers, 
  Search, 
  ChevronRight, 
  Share2, 
  FileText, 
  Download, 
  Briefcase, 
  Clock, 
  Filter, 
  CheckCircle, 
  ArrowUpDown, 
  CornerDownRight, 
  Send, 
  Bot, 
  Check, 
  ListOrdered,
  PlusCircle, 
  Hash, 
  Lightbulb, 
  Trash2,
  BookmarkCheck,
  ChevronDown,
  Edit2,
  FileSpreadsheet,
  AlertCircle
} from "lucide-react";
import IntakeForm from "./components/IntakeForm";
import AgentProgress from "./components/AgentProgress";
import { SavedStrategy, StrategyReport, BlogIdea, LinkedInIdea, NewsletterIdea, SearchOpportunity } from "./types";

export default function App() {
  const [topic, setTopic] = useState("GenAI in Mobile Engineering");
  const [audience, setAudience] = useState("Architects and Lead Engineers");
  const [industry, setIndustry] = useState("B2B Enterprise DevTools");
  const [contentGoal, setContentGoal] = useState("Thought Leadership");
  const [platforms, setPlatforms] = useState<string[]>(["Blog", "LinkedIn", "Newsletter"]);

  const [isLoading, setIsLoading] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [report, setReport] = useState<StrategyReport | null>(null);
  const [history, setHistory] = useState<SavedStrategy[]>([]);
  const [activeReportId, setActiveReportId] = useState<string | null>(null);
  const [generationError, setGenerationError] = useState<string | null>(null);

  // Intent Mapping Search & Filters
  const [intentSearch, setIntentSearch] = useState("");
  const [selectedIntentType, setSelectedIntentType] = useState<string>("All");

  // Idea Directory Controls
  const [selectedIdeaTab, setSelectedIdeaTab] = useState<"All" | "Blog" | "LinkedIn" | "Newsletter">("All");
  const [sortBy, setSortBy] = useState<"overall" | "novelty" | "value" | "search" | "shareability">("overall");
  const [selectedIdeaId, setSelectedIdeaId] = useState<string | null>(null);

  // Active Drafts/Notes
  const [customDraftNotes, setCustomDraftNotes] = useState<string>("");
  const [completedPriorities, setCompletedPriorities] = useState<string[]>([]);
  const [isCtaCopied, setIsCtaCopied] = useState(false);
  const [isBriefCopied, setIsBriefCopied] = useState(false);

  // Strategist Refined Chatbox
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'assistant', text: string }>>([
    { role: 'assistant', text: "Greetings. I am your autonomous content strategist. Once your blueprint is constructed, we can brainstorm customized content brief outlines, transform hooks, or refine your distribution loops right here." }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);

  // Load Strategy History from LocalStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("strategist_reports_history");
      if (stored) {
        const parsed = JSON.parse(stored);
        setHistory(parsed);
        if (parsed.length > 0) {
          setReport(parsed[0].report);
          setActiveReportId(parsed[0].id);
          // Auto fill form inputs
          setTopic(parsed[0].topic || "");
          setAudience(parsed[0].audience || "");
          setIndustry(parsed[0].industry || "");
          setContentGoal(parsed[0].contentGoal || "Thought Leadership");
          setPlatforms(parsed[0].platforms || ["Blog", "LinkedIn", "Newsletter"]);
        }
      }
    } catch (e) {
      console.error("Error reading strategy archives", e);
    }
  }, []);

  const handleGenerateStrategy = async (formData: {
    topic: string;
    audience: string;
    industry: string;
    contentGoal: string;
    platforms: string[];
  }) => {
    setIsLoading(true);
    setReport(null);
    setGenerationError(null);
    setTopic(formData.topic);
    setAudience(formData.audience);
    setIndustry(formData.industry);
    setContentGoal(formData.contentGoal);
    setPlatforms(formData.platforms);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success && data.report) {
        const newReport: StrategyReport = data.report;
        setReport(newReport);

        try {
          const slugifiedTopic = formData.topic.toLowerCase().replace(/\s+/g, "-");
          const blueprintId = `${Date.now()}-${slugifiedTopic}`;
          await fetch("/api/history/save", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              blueprint: {
                id: blueprintId,
                date: new Date().toISOString(),
                topic: formData.topic,
                industry: formData.industry,
                audience: formData.audience,
                goal: formData.contentGoal,
                topIdea: newReport.prioritizedOpportunities?.[0]?.title || "",
                executionStatus: "Draft"
              }
            })
          });
        } catch (err) {
          console.error("Failed to save blueprint history:", err);
        }

        const newSaved: SavedStrategy = {
          id: `scr-${Date.now()}`,
          timestamp: new Date().toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }),
          topic: formData.topic,
          audience: formData.audience,
          industry: formData.industry,
          contentGoal: formData.contentGoal,
          platforms: formData.platforms,
          report: newReport,
        };

        const updatedHistory = [newSaved, ...history];
        setHistory(updatedHistory);
        localStorage.setItem("strategist_reports_history", JSON.stringify(updatedHistory));
        setActiveReportId(newSaved.id);
        
        // Reset interactive state
        setSelectedIdeaId(null);
        setCustomDraftNotes("");
        setCompletedPriorities([]);
        setChatMessages([
          { role: 'assistant', text: `Strategy report parsed successfully. Let's optimize content targeting "${formData.topic}". You can ask me to expand any of the 30 outlined ideas into a full post script.` }
        ]);
      } else {
        setGenerationError(data.error || "The model response calculation failed. Please check your developer secrets API key in Settings.");
      }
    } catch (error: any) {
      console.error(error);
      setGenerationError(`API Connection Failed: ${error.message || "Unknown error"}. Make sure your container dev server is responsive.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectHistoryItem = (item: SavedStrategy) => {
    setReport(item.report);
    setActiveReportId(item.id);
    setTopic(item.topic);
    setAudience(item.audience);
    setIndustry(item.industry);
    setContentGoal(item.contentGoal);
    setPlatforms(item.platforms);
    setSelectedIdeaId(null);
    setCustomDraftNotes("");
    setCompletedPriorities([]);
    setChatMessages([
      { role: 'assistant', text: `Loaded strategy from memory: "${item.topic}". Ready to write or align content loops with you.` }
    ]);
  };

  const handleDeleteHistoryItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = history.filter((item) => item.id !== id);
    setHistory(updated);
    localStorage.setItem("strategist_reports_history", JSON.stringify(updated));
    if (activeReportId === id) {
      if (updated.length > 0) {
        setReport(updated[0].report);
        setActiveReportId(updated[0].id);
      } else {
        setReport(null);
        setActiveReportId(null);
      }
    }
  };

  const handleSendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isChatLoading) return;

    const userText = chatInput.trim();
    setChatMessages((prev) => [...prev, { role: "user", text: userText }]);
    setChatInput("");
    setIsChatLoading(true);

    try {
      const chatHistoryForAPI = chatMessages.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.text
      }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userText,
          history: chatHistoryForAPI,
          context: {
            topic,
            audience,
            industry,
            contentGoal,
          }
        }),
      });

      const data = await res.json();
      if (data.success && data.response) {
        setChatMessages((prev) => [...prev, { role: "assistant", text: data.response }]);
      } else {
        setChatMessages((prev) => [...prev, { role: "assistant", text: "I encountered an error connecting to the generative model. Please verify your GEMINI_API_KEY in active Secrets configuration inside Google AI Studio." }]);
      }
    } catch (e: any) {
      console.error(e);
      setChatMessages((prev) => [...prev, { role: "assistant", text: "Connection timeout. Please double check the local server runtime console logger." }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // Compile full aggregated list of ideation assets
  const getAggregatedIdeas = () => {
    if (!report) return [];
    
    const blogs = (report.blogIdeas || []).map((b) => ({ ...b, formatType: "Blog" as const }));
    const linkedins = (report.linkedinIdeas || []).map((l) => ({ 
      ...l, 
      title: `[LinkedIn Hook] ${l.hook.slice(0, 50)}...`, 
      formatType: "LinkedIn" as const 
    }));
    const newsletters = (report.newsletterIdeas || []).map((n) => ({ 
      ...n, 
      title: `[Newsletter] ${n.subjectLine}`, 
      formatType: "Newsletter" as const 
    }));

    let combined = [...blogs, ...linkedins, ...newsletters];

    // Filter by Tab Selection
    if (selectedIdeaTab !== "All") {
      combined = combined.filter((item) => item.formatType === selectedIdeaTab);
    }

    // Sort by key criteria
    combined.sort((a, b) => {
      const keys = {
        overall: "overallScore" as const,
        novelty: "novelty" as const,
        value: "businessValue" as const,
        search: "searchOpportunity" as const,
        shareability: "shareability" as const,
      };
      
      const scoreKey = keys[sortBy];
      const valA = a.scores?.[scoreKey] ?? 0;
      const valB = b.scores?.[scoreKey] ?? 0;
      return valB - valA; // Descending
    });

    return combined;
  };

  // Find currently clicked idea for in-depth card audit
  const getSelectedIdeaDetails = () => {
    if (!selectedIdeaId || !report) return null;
    
    const blogMatch = (report.blogIdeas || []).find((b) => b.id === selectedIdeaId);
    if (blogMatch) return { type: "Blog" as const, data: blogMatch };

    const liMatch = (report.linkedinIdeas || []).find((l) => l.id === selectedIdeaId);
    if (liMatch) return { type: "LinkedIn" as const, data: liMatch };

    const newsMatch = (report.newsletterIdeas || []).find((n) => n.id === selectedIdeaId);
    if (newsMatch) return { type: "Newsletter" as const, data: newsMatch };

    return null;
  };

  const handleExportMarkdown = () => {
    if (!report) return;

    let md = `# High-Leverage Strategic Content Blueprint\n\n`;
    md += `**Topic Focus Area:** ${topic}\n`;
    md += `**Industry Horizon:** ${industry}\n`;
    md += `**Primary Client Segment:** ${audience}\n`;
    md += `**Business Conversion Goal:** ${contentGoal}\n`;
    md += `**Execution Mediums Chosen:** ${platforms.join(", ")}\n`;
    md += `*Generated automatically by AI Autonomous Strategist Core*\n\n`;
    
    md += `## 1. Audience Demographics & Objections Matrix\n\n`;
    md += `### Cohorts\n`;
    md += `- **Primary Audience Focus:** ${report.audienceAnalysis.primaryAudience}\n`;
    md += `- **Secondary Influencers:** ${report.audienceAnalysis.secondaryAudience}\n\n`;
    
    md += `### Real-World Obstacles & Outcomes\n`;
    md += `#### Top Performance Objective Milestones\n`;
    report.audienceAnalysis.goals.forEach(item => { md += `- ${item}\n`; });
    md += `\n#### Daily Pain Points & Friction Lines\n`;
    report.audienceAnalysis.painPoints.forEach(item => { md += `- ${item}\n`; });
    md += `\n#### Internal & Organizational Resistance Blocks\n`;
    report.audienceAnalysis.objections.forEach(item => { md += `- ${item}\n`; });
    md += `\n#### Desired Outcome Profiles\n`;
    report.audienceAnalysis.desiredOutcomes.forEach(item => { md += `- ${item}\n`; });

    md += `\n## 2. Competitive Editorial Gap Analysis\n\n`;
    md += `**Synthesis Summary:** ${report.editorialGapAnalysis.summary}\n\n`;
    md += `### Saturated & Tired Concepts (Avoid Raw):\n`;
    report.editorialGapAnalysis.saturatedIdeas.forEach(item => { md += `- ${item}\n`; });
    md += `\n### Boring Cliché Narratives:\n`;
    report.editorialGapAnalysis.overusedAngles.forEach(item => { md += `- ${item}\n`; });
    md += `\n### Systemic Conversations Missing in Industry:\n`;
    report.editorialGapAnalysis.missingConversations.forEach(item => { md += `- ${item}\n`; });
    md += `\n### Underserved/Difficult Questions Unanswered Online:\n`;
    report.editorialGapAnalysis.underservedQuestions.forEach(item => { md += `- ${item}\n`; });
    md += `\n### Daring Contrarian Positions to Take:\n`;
    report.editorialGapAnalysis.counterintuitiveInsights.forEach(item => { md += `- ${item}\n`; });

    md += `\n## 3. Top 5 Ranked Campaigns Queue\n\n`;
    report.prioritizedOpportunities.forEach((opp, index) => {
      md += `### #${index+1} / ${opp.title}\n`;
      md += `* **Format Recommended:** ${opp.recommendedFormat}\n`;
      md += `* **Expected Commercial Metric:** ${opp.expectedOutcome}\n`;
      md += `* **Why It Secured Priority Outright:** ${opp.whyItWon}\n`;
      md += `* **Editorial Brief Synopsis:** ${opp.contentBriefString}\n\n`;
    });

    md += `\n## 4. Operational Execution Spec for Priority Candidate #1\n\n`;
    md += `### **Working Title:** ${report.executionBrief.workingTitle}\n`;
    md += `* **Target Keyword Mapping:** \`${report.executionBrief.targetKeyword}\`\n`;
    md += `* **Segment Scope:** ${report.executionBrief.audience}\n`;
    md += `* **User Search Intent Group:** ${report.executionBrief.searchIntent}\n\n`;
    
    md += `### Structural Editorial Hierarchy Outline:\n`;
    report.executionBrief.outline.forEach(item => { md += `- ${item}\n`; });
    
    md += `\n### Core Talking Points & Content Arguments:\n`;
    report.executionBrief.keyTalkingPoints.forEach(item => { md += `* ${item}\n`; });
    
    md += `\n### High-Value Lead Magnet Proposed:\n`;
    md += `> ${report.executionBrief.suggestedLeadMagnet}\n\n`;
    
    md += `### Internal Link Opportunities:\n`;
    report.executionBrief.suggestedInternalLinks.forEach(item => { md += `- ${item}\n`; });
    
    md += `\n### Actionable Conversion CTA Text:\n`;
    md += `> "${report.executionBrief.recommendedCTA}"\n\n`;

    if (customDraftNotes.trim()) {
      md += `## 5. Live Working Copy & Notepad Notes\n\n`;
      md += `${customDraftNotes}\n`;
    }

    const blob = new Blob([md], { type: "text/markdown;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `editorial-strategy-${topic.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyTargetCta = () => {
    if (!report) return;
    navigator.clipboard.writeText(report.executionBrief.recommendedCTA);
    setIsCtaCopied(true);
    setTimeout(() => setIsCtaCopied(false), 2000);
  };

  const handleCopyBriefSummary = () => {
    if (!report) return;
    const briefString = `Working Title: ${report.executionBrief.workingTitle}
Target Keyword: ${report.executionBrief.targetKeyword}
Lead Magnet: ${report.executionBrief.suggestedLeadMagnet}
Outline:
${report.executionBrief.outline.map((o, i) => `${i + 1}. ${o}`).join("\n")}
Talking Points:
${report.executionBrief.keyTalkingPoints.map(t => `- ${t}`).join("\n")}`;
    
    navigator.clipboard.writeText(briefString);
    setIsBriefCopied(true);
    setTimeout(() => setIsBriefCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#E5E5E5] font-sans antialiased pb-12 selection:bg-[#C5A267]/30 selection:text-white">
      
      {/* Decorative ambient visual background accent */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#C5A267]/5 blur-[120px] rounded-full pointer-events-none" />

      {/* Primary Workspace Header */}
      <header className="border-b border-white/10 bg-black/60 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#C5A267] rounded-sm flex items-center justify-center text-black font-extrabold text-xl font-mono shadow-md shadow-[#C5A267]/10">
              Σ
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-[10px] uppercase tracking-[0.25em] text-[#C5A267] font-semibold">
                  Autonomous Intelligence
                </h1>
                <span className="text-[8px] bg-red-950 text-red-400 border border-red-900/50 px-1.5 py-0.5 font-mono uppercase rounded">
                  Director v4.2
                </span>
              </div>
              <p className="text-lg font-serif italic text-white font-semibold">
                Content Strategy Director
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs text-zinc-400">
            {report && (
              <>
                <div className="border-l border-zinc-800 pl-4">
                  <p className="text-[9px] uppercase tracking-wider text-zinc-500 mb-0.5">Topic</p>
                  <p className="font-semibold text-zinc-300 font-serif truncate max-w-[160px] sm:max-w-[220px]" title={topic}>
                    {topic}
                  </p>
                </div>
                <div className="border-l border-zinc-800 pl-4 hidden sm:block">
                  <p className="text-[9px] uppercase tracking-wider text-zinc-500 mb-0.5">Goal</p>
                  <p className="font-semibold text-[#C5A267]">{contentGoal}</p>
                </div>
                <div className="border-l border-zinc-800 pr-2 pl-4">
                  <button
                    id="trigger-markdown-download-button"
                    onClick={handleExportMarkdown}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#C5A267] hover:bg-[#B38F55] active:scale-95 text-black font-bold uppercase tracking-wider text-[10px] rounded transition-all cursor-pointer font-mono"
                  >
                    <Download className="w-3.5 h-3.5 shrink-0" />
                    Export Strategy
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Workspace Core Layout */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT COLUMN: Setup Desk & Session Chronicles (3 Columns/12 Span) */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            
            {/* Strategy Session Archives */}
            <div id="archives-dock" className="bg-zinc-900/40 border border-white/5 rounded-xl p-5 backdrop-blur-xs">
              <div className="flex justify-between items-center mb-4">
                <span className="text-[10px] font-mono tracking-wider text-zinc-500 uppercase flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#C5A267]" />
                  Blueprint Chronicles ({history.length})
                </span>
                {history.length > 0 && (
                  <button 
                    onClick={() => {
                      if(confirm("Are you sure you want to clear your strategy history? This is irreversible.")) {
                        localStorage.removeItem("strategist_reports_history");
                        setHistory([]);
                        setReport(null);
                        setActiveReportId(null);
                      }
                    }}
                    className="text-[9px] text-zinc-600 hover:text-red-400 font-mono flex items-center gap-1 cursor-pointer"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {history.length === 0 ? (
                <div className="text-center py-6 border border-zinc-800/55 border-dashed rounded-lg bg-zinc-950/20">
                  <p className="text-xs text-zinc-500 italic">No past strategies recorded yet.</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                  {history.map((item) => {
                    const isActive = activeReportId === item.id;
                    return (
                      <div 
                        key={item.id}
                        onClick={() => handleSelectHistoryItem(item)}
                        className={`group p-2.5 rounded-lg border text-left cursor-pointer transition-all ${
                          isActive 
                            ? "bg-[#C5A267]/10 border-[#C5A267]/30" 
                            : "bg-black/30 border-white/5 hover:border-zinc-700 hover:bg-zinc-900/30"
                        }`}
                      >
                        <div className="flex justify-between items-start gap-2">
                          <p className={`text-xs font-serif truncate ${isActive ? "text-white font-bold" : "text-zinc-300"}`}>
                            {item.topic}
                          </p>
                          <button
                            onClick={(e) => handleDeleteHistoryItem(item.id, e)}
                            className="opacity-0 group-hover:opacity-100 p-0.5 text-zinc-600 hover:text-red-400 rounded transition-colors"
                            title="Delete Strategy Blueprint"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                        <div className="flex justify-between items-center mt-1.5 text-[9px] text-zinc-500 font-mono">
                          <span>{item.timestamp}</span>
                          <span className="text-[#C5A267] font-sans italic">{item.contentGoal}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Strategic Core Generation Setup */}
            <IntakeForm onSubmit={handleGenerateStrategy} isLoading={isLoading} />

            {/* Content Strategist Interactive Chat Terminal */}
            <div id="ai-chat-desk" className="bg-zinc-900/40 border border-white/10 rounded-xl p-5 flex flex-col h-[380px] justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#C5A267]/2 blur-3xl rounded-full" />
              
              <div className="flex justify-between items-center border-b border-zinc-800 pb-3 mb-3">
                <span className="text-[10px] font-mono tracking-widest text-[#C5A267] uppercase flex items-center gap-1.5">
                  <Bot className="w-4 h-4 text-[#C5A267]" />
                  Strategist Consultation
                </span>
                <span className="text-[8px] bg-zinc-800 text-zinc-300 font-mono px-1.5 py-0.5 rounded uppercase">
                  Connected
                </span>
              </div>

              {/* Chat Output Frame */}
              <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs mb-3">
                {chatMessages.map((msg, index) => (
                  <div 
                    key={index} 
                    className={`p-3 rounded-lg leading-relaxed ${
                      msg.role === 'user' 
                        ? 'bg-zinc-800/60 border-l-2 border-[#C5A267] ml-4 text-zinc-200' 
                        : 'bg-black/40 border border-zinc-900 mr-4 text-zinc-300'
                    }`}
                  >
                    <div className="font-mono text-[9px] text-[#C5A267] uppercase mb-1 font-bold">
                      {msg.role === 'user' ? 'CLIENT REQUEST' : 'STRATEGIST ADVICE'}
                    </div>
                    <div className="whitespace-pre-line font-sans leading-relaxed text-zinc-300">
                      {msg.text}
                    </div>
                  </div>
                ))}
                {isChatLoading && (
                  <div className="bg-black/40 border border-zinc-900 p-3 rounded-lg mr-4 text-zinc-400 italic flex items-center gap-2">
                    <div className="animate-spin w-3.5 h-3.5 border-2 border-[#C5A267] border-t-transparent rounded-full" />
                    <span>text-zinc-400 italic flex items-center gap-2</span>
                  </div>
                )}
              </div>

              {/* Chat Input Field */}
              <form onSubmit={handleSendChatMessage} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ask strategist questions..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  className="flex-1 bg-black/50 border border-zinc-800 text-xs text-white rounded-lg px-3 py-2.5 focus:outline-hidden focus:border-[#C5A267]"
                />
                <button
                  type="submit"
                  disabled={!chatInput.trim() || isChatLoading}
                  className="px-3 bg-[#E5E5E5] hover:bg-[#C5A267] text-black font-semibold rounded-lg flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
            
          </div>

          {/* MAIN CORE BODY - Center Display & Step Results Panels */}
          <div className="lg:col-span-8 flex flex-col gap-6">

            {/* Generation Error Banner */}
            {generationError && (
              <div className="p-4 bg-red-950/40 border border-red-500/40 text-red-200 text-xs rounded-xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold uppercase tracking-wider font-mono text-red-300">Strategy Engine Error</p>
                  <p className="leading-relaxed">{generationError}</p>
                  <p className="text-[10px] text-zinc-400 mt-1">
                    Please ensure that you have added your <strong className="text-white">GEMINI_API_KEY</strong> in the <strong className="text-white">Settings &gt; Secrets</strong> menu (on the top right of AI Studio).
                  </p>
                </div>
              </div>
            )}

            {/* Custom Interactive Dashboard Loading Stage */}
            {isLoading && (
              <div className="py-2 inline-block w-full">
                <AgentProgress currentStep={activeStep} />
              </div>
            )}

            {!isLoading && !report && (
              <div id="welcome-empty-placeholder" className="bg-zinc-950/20 border border-dashed border-zinc-800 rounded-2xl py-20 px-6 text-center max-w-4xl mx-auto my-12">
                <div className="w-16 h-16 bg-[#C5A267]/10 text-[#C5A267] rounded-full mx-auto flex items-center justify-center mb-6">
                  <Sparkles className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-serif text-white font-semibold mb-2">
                  Launch the Autonomous Content Architect
                </h3>
                <p className="text-zinc-400 text-sm max-w-lg mx-auto mb-8 leading-relaxed">
                  Enter your target topic constraints in the strategist panel on the left or load one of our scenario blueprints. Our AI engine will conduct step-by-step audience mapping, competitor niche gap evaluation, score 30 assets, and build custom briefs.
                </p>
                <div className="inline-block px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs font-mono text-[#C5A267]">
                  SECURE SERVER-SIDE GEMINI MODEL ACTIVE
                </div>
              </div>
            )}

            {!isLoading && report && (
              <div id="compiled-dashboard-section" className="space-y-6">

                {/* STEP 1: Audience Insight Mapping Section */}
                <section id="step1-audience-scope" className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-zinc-900/40 border border-white/5 p-5 rounded-2xl">
                    <h2 className="text-[10px] uppercase tracking-[0.2em] text-[#C5A267] mb-3 flex items-center justify-between font-mono font-bold">
                      <span>Step 01 / Audience Focus</span>
                      <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Profile Complete</span>
                    </h2>
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs font-bold text-zinc-300 font-serif">Primary Target Cohort</p>
                        <p className="text-[11px] text-zinc-400 leading-relaxed mt-1">
                          {report.audienceAnalysis.primaryAudience}
                        </p>
                      </div>
                      <div className="pt-2 border-t border-zinc-800/40">
                        <p className="text-xs font-bold text-zinc-300 font-serif">Secondary Adopters / Influencers</p>
                        <p className="text-[11px] text-zinc-400 leading-relaxed mt-1">
                          {report.audienceAnalysis.secondaryAudience}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-zinc-900/40 border border-white/5 p-5 rounded-2xl flex flex-col justify-between">
                    <h2 className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 mb-3 font-mono font-bold">
                      Key Focus Indicators & Motivation
                    </h2>
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-[9px] uppercase tracking-wider text-zinc-600 block mb-1">Key Pain Points</span>
                        <ul className="space-y-1.5 text-[10px] text-zinc-400">
                          {report.audienceAnalysis.painPoints.slice(0, 3).map((pt, i) => (
                            <li key={i} className="leading-snug flex items-start gap-1">
                              <span className="text-[#C5A267] mr-1 font-mono">•</span>
                              <span className="italic">{pt}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <span className="text-[9px] uppercase tracking-wider text-zinc-600 block mb-1">Top Objections</span>
                        <ul className="space-y-1.5 text-[10px] text-zinc-400">
                          {report.audienceAnalysis.objections.slice(0, 3).map((ob, i) => (
                            <li key={i} className="leading-snug flex items-start gap-1">
                              <span className="text-red-400 mr-1 font-mono">•</span>
                              <span>{ob}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </section>

                {/* STEP 2: Intent Vector Mapping Section (Exactly 20 Vectors list) */}
                <section id="step2-search-vectors" className="bg-zinc-900/40 border border-white/5 p-5 rounded-2xl">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4 mb-4">
                    <div>
                      <h2 className="text-[10px] uppercase tracking-[0.2em] text-[#C5A267] font-mono font-bold">
                        Step 02 / Intent Vector Calibration (20 Targets)
                      </h2>
                      <p className="text-[10px] text-zinc-500 font-sans mt-0.5">
                        Map audience journeys from informational search to contrarian discovery.
                      </p>
                    </div>

                    {/* Filter and Search Box */}
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          placeholder="Filter topic arrays..."
                          value={intentSearch}
                          onChange={(e) => setIntentSearch(e.target.value)}
                          className="bg-black/40 border border-zinc-800 text-[10px] rounded px-2.5 py-1.5 pl-8 focus:outline-hidden focus:border-[#C5A267]"
                        />
                      </div>
                      <select 
                        value={selectedIntentType}
                        onChange={(e) => setSelectedIntentType(e.target.value)}
                        className="bg-zinc-950 border border-zinc-800 text-[10px] text-zinc-300 rounded px-2 py-1.5 focus:outline-hidden focus:border-[#C5A267]"
                      >
                        <option value="All">All Intent Types</option>
                        <option value="Informational">Informational</option>
                        <option value="Commercial">Commercial</option>
                        <option value="Transactional">Transactional</option>
                        <option value="Emerging">Emerging</option>
                        <option value="Contrarian">Contrarian</option>
                      </select>
                    </div>
                  </div>

                  {/* Horizontal Scrollable/Wrapped Map of Opportunities */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 max-h-[260px] overflow-y-auto pr-1">
                    {report.searchIntentMapping.opportunities
                      .filter((opp) => {
                        const matchesSearch = opp.topic.toLowerCase().includes(intentSearch.toLowerCase()) || 
                                              opp.description.toLowerCase().includes(intentSearch.toLowerCase());
                        const matchesIntent = selectedIntentType === "All" || opp.intent === selectedIntentType;
                        return matchesSearch && matchesIntent;
                      })
                      .map((opp, i) => {
                        const intentColors = {
                          Informational: "bg-blue-950/40 text-blue-400 border-blue-900/50",
                          Commercial: "bg-amber-950/40 text-amber-400 border-amber-900/50",
                          Transactional: "bg-emerald-950/40 text-emerald-400 border-emerald-900/50",
                          Emerging: "bg-purple-950/40 text-purple-400 border-purple-900/50",
                          Contrarian: "bg-rose-950/40 text-[#C5A267] border-rose-900/50",
                        };
                        const colorClass = intentColors[opp.intent] || "bg-zinc-900 text-zinc-400";

                        return (
                          <div 
                            key={i} 
                            onClick={() => {
                              // Trigger an AI strategist chat refinement for this specific search query topic
                              setChatInput(`Explain how we can win the target topic segment: "${opp.topic}" for our ${audience} audience.`);
                              // Scroll into view chat box
                              document.getElementById("ai-chat-desk")?.scrollIntoView({ behavior: "smooth" });
                            }}
                            className="bg-black/30 hover:bg-zinc-900/50 border border-white/5 p-3 rounded-lg transition-transform text-left cursor-pointer group"
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[9px] font-mono text-zinc-500 font-semibold uppercase">#{i+1} Vector</span>
                              <span className={`text-[8px] font-mono uppercase px-1.5 py-0.5 rounded border ${colorClass}`}>
                                {opp.intent}
                              </span>
                            </div>
                            <h4 className="text-xs font-serif font-semibold text-zinc-200 group-hover:text-white leading-tight">
                              {opp.topic}
                            </h4>
                            <p className="text-[10px] text-zinc-500 leading-snug mt-1 italic line-clamp-2">
                              "{opp.description}"
                            </p>
                          </div>
                        );
                      })}
                  </div>
                </section>

                {/* STEP 3 & Gap Analysis */}
                <section id="step3-editorial-critique" className="bg-zinc-900/20 border border-white/5 p-5 rounded-2xl">
                  <div className="flex justify-between items-center border-b border-zinc-800 pb-3 mb-4">
                    <h2 className="text-[10px] uppercase tracking-[0.2em] text-[#C5A267] font-mono font-semibold">
                      Step 03 / Consensus Gap Critique
                    </h2>
                    <span className="text-[9px] bg-amber-950 text-[#C5A267] border border-[#C5A267]/10 px-2 py-0.5 rounded font-mono">
                      Landscape analysis
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div className="bg-black/50 p-3.5 rounded-lg border-l-2 border-[#C5A267]">
                        <p className="text-[10px] font-mono uppercase text-[#C5A267] mb-1 font-bold">Missing Conversations</p>
                        <ul className="space-y-1 text-xs text-zinc-300">
                          {report.editorialGapAnalysis.missingConversations.map((c, i) => (
                            <li key={i} className="leading-relaxed font-sans">• {c}</li>
                          ))}
                        </ul>
                      </div>
                      
                      <div className="bg-black/50 p-3.5 rounded-lg border-l-2 border-red-500/60">
                        <p className="text-[10px] font-mono uppercase text-red-400 mb-1 font-bold">Saturated / Cliché Formats (Avoid Raw)</p>
                        <ul className="space-y-1 text-xs text-zinc-400 italic">
                          {report.editorialGapAnalysis.saturatedIdeas.map((s, i) => (
                            <li key={i} className="leading-relaxed">• {s}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="flex flex-col justify-between space-y-4">
                      <div className="bg-zinc-950 p-4 rounded-lg border border-white/5">
                        <span className="text-[9px] font-mono uppercase tracking-wider text-zinc-500 block mb-1">
                          Strategic Editorial Thesis
                        </span>
                        <p className="text-xs text-zinc-300 leading-relaxed font-serif italic font-medium">
                          "{report.editorialGapAnalysis.summary}"
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-[11px]">
                        <div className="bg-zinc-900/40 p-3 rounded-lg border border-zinc-800/60">
                          <span className="text-[9px] font-mono text-[#C5A267] font-bold uppercase block mb-1">Counterintuitive Views</span>
                          <p className="text-zinc-400 leading-tight">
                            {report.editorialGapAnalysis.counterintuitiveInsights[0] || "Diverge from vanilla opinions"}
                          </p>
                        </div>
                        <div className="bg-zinc-900/40 p-3 rounded-lg border border-zinc-800/60">
                          <span className="text-[9px] font-mono text-zinc-400 font-bold uppercase block mb-1">Underserved Gaps</span>
                          <p className="text-zinc-400 leading-tight">
                            {report.editorialGapAnalysis.underservedQuestions[0] || "Examine technical complexities"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* STEP 4 & 5: Idea Score Sieve & Interactive Directory */}
                <section id="step4-idea-directory" className="bg-zinc-900/60 border border-white/10 p-5 rounded-2xl relative">
                  
                  {/* Aspect Section header */}
                  <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-zinc-800 pb-4 mb-4 gap-4">
                    <div>
                      <h2 className="text-[10px] uppercase tracking-[0.2em] text-[#C5A267] font-mono font-bold">
                        Step 04 & 05 / Scored Editorial Ideas Directory (30 Ideas)
                      </h2>
                      <p className="text-[10px] text-zinc-500 font-sans mt-0.5">
                        Double-click or click any content asset here to load dynamic outline spec in Right Brief panel.
                      </p>
                    </div>

                    {/* Filter and Sort Controllers */}
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      {/* Formats Tabs */}
                      <div className="flex bg-black/60 p-0.5 rounded-lg border border-zinc-800">
                        {["All", "Blog", "LinkedIn", "Newsletter"].map((tab) => (
                          <button
                            key={tab}
                            onClick={() => setSelectedIdeaTab(tab as any)}
                            className={`px-3 py-1 text-[10px] uppercase rounded-md transition-all font-mono cursor-pointer ${
                              selectedIdeaTab === tab
                                ? "bg-[#C5A267] text-black font-extrabold"
                                : "text-zinc-400 hover:text-white"
                            }`}
                          >
                            {tab}
                          </button>
                        ))}
                      </div>

                      {/* Sort selection criteria */}
                      <div className="flex items-center gap-1 bg-zinc-950 px-2.5 py-1 rounded border border-zinc-800 text-[10px] font-mono text-zinc-300">
                        <ArrowUpDown className="w-3.5 h-3.5 text-zinc-500" />
                        <span>Sieve Priority:</span>
                        <select
                          value={sortBy}
                          onChange={(e) => setSortBy(e.target.value as any)}
                          className="bg-transparent border-0 focus:ring-0 focus:outline-hidden font-bold text-[#C5A267] ml-1 cursor-pointer"
                        >
                          <option value="overall">Average Overall Score</option>
                          <option value="novelty">Concept Novelty</option>
                          <option value="value">Business Value / CTR</option>
                          <option value="search">Search Traffic Ratio</option>
                          <option value="shareability">Viral Shareability</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Main Idea Card Display Directory */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[360px] overflow-y-auto pr-1 mb-4">
                    {getAggregatedIdeas().map((idea) => {
                      const isActive = selectedIdeaId === idea.id;
                      const averageScore = idea.scores.overallScore.toFixed(1);
                      const isCompleted = completedPriorities.includes(idea.id);

                      return (
                        <div
                          key={idea.id}
                          onClick={() => setSelectedIdeaId(idea.id)}
                          className={`p-3.5 rounded-xl border text-left flex justify-between items-start cursor-pointer transition-all ${
                            isActive
                              ? "bg-[#C5A267]/15 border-[#C5A267]/60"
                              : "bg-zinc-950/50 border-white/5 hover:border-zinc-800/80 hover:bg-zinc-900/40"
                          }`}
                        >
                          <div className="flex-1 min-w-0 pr-3">
                            <div className="flex items-center gap-2 mb-1.5">
                              <span className={`text-[8px] font-mono uppercase font-bold px-1.5 py-0.5 rounded ${
                                idea.formatType === "Blog"
                                  ? "bg-blue-950 text-blue-300 border border-blue-900/60"
                                  : idea.formatType === "LinkedIn"
                                  ? "bg-cyan-950 text-cyan-300 border border-cyan-900/60"
                                  : "bg-purple-950 text-purple-300 border border-purple-900/60"
                              }`}>
                                {idea.formatType}
                              </span>
                              
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (completedPriorities.includes(idea.id)) {
                                    setCompletedPriorities(completedPriorities.filter(id => id !== idea.id));
                                  } else {
                                    setCompletedPriorities([...completedPriorities, idea.id]);
                                  }
                                }}
                                className="hover:opacity-100 transition-opacity"
                                title="Pin or Bookmark this high opportunity idea"
                              >
                                <BookmarkCheck className={`w-3.5 h-3.5 ${isCompleted ? "text-[#C5A267] fill-[#C5A267]" : "text-zinc-600 hover:text-zinc-400"}`} />
                              </button>
                            </div>

                            <h3 className="text-xs font-serif font-bold text-zinc-100 leading-tight">
                              {"title" in idea ? idea.title : ("hook" in idea ? `Hook: "${(idea as any).hook.slice(0, 40)}..."` : "Content Idea")}
                            </h3>

                            <p className="text-[10px] text-zinc-500 leading-snug mt-1.5 flex items-center gap-1">
                              <span>Focus:</span>
                              <span className="text-zinc-400 font-semibold truncate max-w-[200px]" title={idea.targetAudience}>
                                {idea.targetAudience || audience}
                              </span>
                            </p>
                          </div>

                          {/* Mathematical scoring component */}
                          <div className="text-right flex flex-col justify-between items-end min-h-[50px]">
                            <div className="flex items-center gap-1 font-mono">
                              <span className="text-[10px] text-zinc-500">Score:</span>
                              <span className="text-xs text-[#C5A267] font-bold">{averageScore}</span>
                            </div>
                            <div className="w-12 h-1 bg-zinc-800 rounded-xs overflow-hidden mt-1">
                              <div 
                                className="h-full bg-[#C5A267]" 
                                style={{ width: `${(idea.scores.overallScore / 10) * 100}%` }}
                              />
                            </div>
                            <span className="text-[9px] text-zinc-600 mt-2 font-mono">
                              {idea.difficulty ? `Diff: ${idea.difficulty}` : `Imp: ${idea.engagementPotential || "Med"}`}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Detail Panel for actively clicked idea */}
                  {getSelectedIdeaDetails() ? (
                    (() => {
                      const selected = getSelectedIdeaDetails()!;
                      const scores = selected.data.scores;
                      return (
                        <div className="bg-black/80 border border-[#C5A267]/25 p-4 rounded-xl mt-4 text-xs">
                          <div className="flex justify-between items-start mb-2.5">
                            <div>
                              <span className="text-[9px] font-mono uppercase text-[#C5A267] tracking-wider block mb-0.5">
                                SELECTED COMPREHENSIVE SIÈVE ANALYSIS
                              </span>
                              <h4 className="text-sm font-serif font-bold text-white">
                                {"title" in selected.data ? (selected.data as any).title : (selected.data as any).hook}
                              </h4>
                            </div>
                            <button 
                              onClick={() => {
                                // Load this directly into the Right Spec template brief block
                                setReport({
                                  ...report,
                                  executionBrief: {
                                    workingTitle: "title" in selected.data ? (selected.data as any).title : `Daring: ${(selected.data as any).hook.slice(0, 50)}...`,
                                    targetKeyword: "whyItMatters" in selected.data ? (selected.data as any).searchIntent : "Social Intent Offset",
                                    audience: selected.data.targetAudience || audience,
                                    searchIntent: "Intent Calibration",
                                    outline: [
                                      "The Core consensus landscape baseline",
                                      "Why existing methods and cliché angles are stalling out",
                                      "Practical structural roadmap implementation checklist",
                                      "Quantifiable business metrics and outcome scorecard",
                                    ],
                                    keyTalkingPoints: [
                                      "whyItMatters" in selected.data ? (selected.data as any).whyItMatters : (selected.data as any).coreInsight,
                                      "Adopt a strong, clear position following our competitive research gaps.",
                                      "Include actual real-world industry case stats instead of abstract frameworks.",
                                    ],
                                    recommendedCTA: "suggestedCTA" in selected.data ? (selected.data as any).suggestedCTA : "Sign up for premium insights archive.",
                                    suggestedInternalLinks: ["Featured research index", "Product architecture documentation"],
                                    suggestedLeadMagnet: "Interactive PDF Checklist and diagnostic audit spreadsheet tool.",
                                  }
                                });
                              }}
                              className="px-3 py-1 bg-[#C5A267]/10 hover:bg-[#C5A267]/20 border border-[#C5A267]/30 text-[#C5A267] text-[10px] font-bold uppercase rounded cursor-pointer transition-all"
                            >
                              Load as Active Spec Brief
                            </button>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2.5 border-t border-zinc-800 text-[10px] font-mono">
                            <div>
                              <span className="text-zinc-500 block mb-1">NOVELTY</span>
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-zinc-300">{scores.novelty}/10</span>
                                <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                                  <div className="h-full bg-[#C5A267]" style={{ width: `${scores.novelty * 10}%` }} />
                                </div>
                              </div>
                            </div>
                            <div>
                              <span className="text-zinc-500 block mb-1">RELEVANCE</span>
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-zinc-300">{scores.audienceRelevance || 8}/10</span>
                                <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                                  <div className="h-full bg-[#C5A267]" style={{ width: `${(scores.audienceRelevance || 8) * 10}%` }} />
                                </div>
                              </div>
                            </div>
                            <div>
                              <span className="text-zinc-500 block mb-1">BUSINESS VALUE</span>
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-zinc-300">{scores.businessValue}/10</span>
                                <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                                  <div className="h-full bg-emerald-500" style={{ width: `${scores.businessValue * 10}%` }} />
                                </div>
                              </div>
                            </div>
                            <div>
                              <span className="text-zinc-500 block mb-1">SEARCH VOLUME</span>
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-zinc-300">{scores.searchOpportunity}/10</span>
                                <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                                  <div className="h-full bg-[#C5A267]" style={{ width: `${scores.searchOpportunity * 10}%` }} />
                                </div>
                              </div>
                            </div>
                            <div>
                              <span className="text-zinc-500 block mb-1">SHAREABILITY</span>
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-[#C5A267] font-semibold">{scores.shareability}/10</span>
                                <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                                  <div className="h-full bg-yellow-500" style={{ width: `${scores.shareability * 10}%` }} />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })()
                  ) : (
                    <div className="text-center py-5 border border-zinc-800 border-dashed rounded-xl bg-zinc-950/10 text-xs text-zinc-500 italic">
                      💡 Protip: Select any card from directory to isolate score matrices and customize the priority brief right away.
                    </div>
                  )}
                </section>

                {/* STEP 6: Top 5 Prioritized List */}
                <section id="step6-priority-queue" className="bg-[#C5A267]/5 border border-[#C5A267]/15 p-5 rounded-2xl">
                  <h2 className="text-[10px] uppercase tracking-[0.2em] text-[#C5A267] mb-3 font-mono font-bold flex items-center gap-1.5">
                    <ListOrdered className="w-3.5 h-3.5 text-[#C5A267]" />
                    Step 06 / Strategic Priorities Queue (Top 5 Leverage Concepts)
                  </h2>
                  <div className="space-y-3">
                    {report.prioritizedOpportunities.map((opp, idx) => {
                      const isBookmarked = completedPriorities.includes(opp.ideaId);
                      return (
                        <div 
                          key={opp.ideaId || idx}
                          className="bg-black/40 border border-zinc-900 rounded-xl p-4 flex flex-col md:flex-row gap-4 justify-between items-start"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="w-5 h-5 rounded-full bg-[#C5A267] text-black font-extrabold flex items-center justify-center text-xs font-mono">
                                {idx+1}
                              </span>
                              <h3 className="text-sm font-serif font-semibold text-white">
                                {opp.title}
                              </h3>
                            </div>
                            <p className="text-[10px] text-[#C5A267] font-mono uppercase tracking-wide">
                              Format: <span className="font-bold text-white">{opp.recommendedFormat}</span> | Goal Metrics: <span className="text-white italic">{opp.expectedOutcome}</span>
                            </p>
                            <p className="text-xs text-zinc-300 mt-2 font-sans leading-relaxed">
                              <strong className="text-zinc-500">Why it won:</strong> {opp.whyItWon}
                            </p>
                            <div className="mt-2.5 p-2.5 bg-zinc-950/75 text-[11px] text-zinc-400 rounded-md border border-white/5 whitespace-pre-line">
                              {opp.contentBriefString}
                            </div>
                          </div>

                          <div className="flex md:flex-col gap-2 shrink-0">
                            <button
                              onClick={() => {
                                  if (completedPriorities.includes(opp.ideaId)) {
                                    setCompletedPriorities(completedPriorities.filter(id => id !== opp.ideaId));
                                  } else {
                                    setCompletedPriorities([...completedPriorities, opp.ideaId]);
                                  }
                              }}
                              className={`px-3 py-1.5 text-[9px] uppercase tracking-wider font-mono rounded-lg border font-semibold flex items-center gap-1.5 cursor-pointer ${
                                isBookmarked 
                                  ? "bg-[#C5A267] border-[#C5A267] text-zinc-950" 
                                  : "bg-[#C5A267]/10 hover:bg-[#C5A267]/20 border-[#C5A267]/20 text-[#C5A267]"
                              }`}
                            >
                              <BookmarkCheck className="w-3 h-3 shrink-0" />
                              {isBookmarked ? "Campaign Active" : "Track Opportunity"}
                            </button>
                            <button
                              onClick={() => {
                                // Scroll right to active brief spec and replace working values
                                setReport({
                                  ...report,
                                  executionBrief: {
                                    workingTitle: opp.title,
                                    targetKeyword: opp.expectedOutcome,
                                    audience: audience,
                                    searchIntent: opp.recommendedFormat,
                                    outline: [
                                      "Pillar Hypothesis Narrative",
                                      "Direct Contrast with Obsolete consensus beliefs",
                                      "Tactical blueprint execution checklists",
                                      "Call-to-action details",
                                    ],
                                    keyTalkingPoints: [
                                      opp.whyItWon,
                                      opp.contentBriefString,
                                    ],
                                    recommendedCTA: `Gain full access download.`,
                                    suggestedInternalLinks: ["Research center index"],
                                    suggestedLeadMagnet: `High value ${opp.recommendedFormat} template checklist`,
                                  }
                                });
                                // Scroll execution box into view
                                document.getElementById("step7-production-spec")?.scrollIntoView({ behavior: "smooth" });
                              }}
                              className="px-3 py-1.5 text-[9px] uppercase tracking-wider font-mono bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white rounded-lg flex items-center gap-1.5"
                            >
                              <Edit2 className="w-3 h-3 text-[#C5A267]" />
                              Load Outline Spec
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>

                {/* STEP 7: Operational Production Spec & Notepad */}
                <section id="step7-production-spec" className="border-t border-[#C5A267]/35 pt-4">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                    {/* Left Detail Component of spec */}
                    <div className="lg:col-span-7 bg-[#C5A267]/10 border border-[#C5A267]/25 p-5 rounded-2xl flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start gap-4 mb-4">
                          <div>
                            <span className="text-[9px] font-mono uppercase text-[#C5A267] tracking-wider block mb-1">
                              Step 07 / Editorial Active Execution Brief
                            </span>
                            <h3 className="text-xl font-serif leading-tight text-white font-bold">
                              {report.executionBrief.workingTitle}
                            </h3>
                          </div>
                          
                          <button
                            onClick={handleCopyBriefSummary}
                            className="text-[9px] font-mono uppercase items-center gap-1 flex border border-white/10 px-2.5 py-1 text-zinc-300 rounded hover:bg-[#C5A267]/10 transition-colors"
                          >
                            {isBriefCopied ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-400" />
                                <span>Brief Copied!</span>
                              </>
                            ) : (
                              <>
                                <FileSpreadsheet className="w-3 h-3" />
                                <span>Copy Spec to Clipboard</span>
                              </>
                            )}
                          </button>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-xs mb-4 pt-3.5 border-t border-zinc-800/60">
                          <div>
                            <span className="text-[9px] text-zinc-500 uppercase tracking-widest block mb-0.5">Primary Target Keyword</span>
                            <span className="font-mono text-zinc-200 font-semibold text-xs text-[#C5A267]">
                              {report.executionBrief.targetKeyword || "AI Search density token"}
                            </span>
                          </div>
                          <div>
                            <span className="text-[9px] text-zinc-500 uppercase tracking-widest block mb-0.5 font-sans">User Search Intent</span>
                            <span className="text-zinc-200 font-semibold italic text-xs">
                              {report.executionBrief.searchIntent || "High conversion Commercial"}
                            </span>
                          </div>
                        </div>

                        {/* Hierarchical structural outlines */}
                        <div className="mb-4">
                          <span className="text-[9px] uppercase tracking-wider text-zinc-500 block mb-2 font-mono">
                            Recommended Article Structural Milestones (H2 / H3 Outline)
                          </span>
                          <ul className="space-y-1.5 text-xs text-zinc-300">
                            {report.executionBrief.outline.map((o, idx) => (
                              <li key={idx} className="flex gap-2.5 items-start">
                                <span className="text-[#C5A267] font-mono leading-none font-bold">{idx + 1}.</span>
                                <span className="leading-snug">{o}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Crucial value arguments */}
                        <div className="mb-4 pt-3 border-t border-zinc-800/40">
                          <span className="text-[9px] uppercase tracking-wider text-zinc-500 block mb-1.5 font-mono">
                            Crucial Editorial Value Arguments
                          </span>
                          <ul className="space-y-1 text-xs text-zinc-400">
                            {report.executionBrief.keyTalkingPoints.map((pt, i) => (
                              <li key={i} className="flex gap-1.5 items-start">
                                <span className="text-zinc-500 font-mono">-</span>
                                <span className="leading-relaxed">{pt}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Proposed high value lead magnet */}
                        {report.executionBrief.suggestedLeadMagnet && (
                          <div className="mb-4 bg-black/40 border border-[#C5A267]/15 p-3 rounded-lg leading-relaxed text-xs">
                            <span className="text-[9px] text-zinc-500 uppercase tracking-widest block font-mono font-bold mb-1">
                              💎 Proposed Acquisition Lead Magnet (Opt-in Lead Generation)
                            </span>
                            <span className="font-bold font-serif text-[#C5A267]">"{report.executionBrief.suggestedLeadMagnet}"</span>
                          </div>
                        )}
                      </div>

                      {/* CTA Conversion Box */}
                      <div className="bg-black/60 p-4 border border-zinc-900 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center mt-4 gap-3">
                        <div className="flex-1">
                          <span className="text-[9px] text-zinc-500 uppercase font-mono block mb-1">
                            High Conversion CTR Copy / CTA
                          </span>
                          <p className="text-xs text-zinc-200 font-serif italic tracking-wide">
                            "{report.executionBrief.recommendedCTA}"
                          </p>
                        </div>
                        <button
                          onClick={handleCopyTargetCta}
                          className="px-3.5 py-1.5 bg-[#C5A267] hover:bg-[#B38F55] active:scale-95 text-black font-bold uppercase tracking-widest text-[9px] rounded-sm transition-all shrink-0 cursor-pointer"
                        >
                          {isCtaCopied ? "Copied!" : "Copy CTA"}
                        </button>
                      </div>
                    </div>

                    {/* Right Live Drafting Notebook Notes */}
                    <div className="lg:col-span-5 bg-zinc-900/40 border border-white/5 p-5 rounded-2xl flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase">
                            Operational Strategic Notepad
                          </span>
                          <span className="text-[8px] bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded uppercase">
                            State Saved
                          </span>
                        </div>
                        <p className="text-[10px] text-zinc-500 leading-snug mb-3">
                          Draft outlines, write hooks, customize headers directly, or merge notes. These will be exported cleanly with your overall strategic Markdown file.
                        </p>
                        <textarea
                          placeholder="Type notes, draft hooks, or paste custom strategy insights here..."
                          value={customDraftNotes}
                          onChange={(e) => setCustomDraftNotes(e.target.value)}
                          className="w-full h-80 bg-black/60 border border-zinc-800 rounded-xl p-3.5 text-xs font-mono text-zinc-200 placeholder-zinc-700 focus:outline-hidden focus:border-[#C5A267] focus:ring-1 focus:ring-[#C5A267]"
                        />
                      </div>

                      <div className="flex justify-between mt-3 text-[10px] text-zinc-500 font-mono">
                        <span>Characters: {customDraftNotes.length}</span>
                        <button 
                          onClick={() => setCustomDraftNotes("")}
                          className="text-zinc-600 hover:text-red-400 hover:underline transition-all"
                        >
                          Reset Notepad
                        </button>
                      </div>
                    </div>

                  </div>
                </section>

              </div>
            )}

          </div>

        </div>
      </div>

      {/* FOOTER STATUS BAR */}
      <footer className="mt-16 max-w-[1400px] mx-auto px-4 sm:px-6 flex flex-col sm:flex-row justify-between items-center text-[10px] font-mono text-zinc-650 border-t border-white/5 pt-6 gap-4">
        <div className="flex flex-wrap gap-4 justify-center">
          <span className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 bg-[#C5A267] rounded-full animate-ping"></div>
            AGENT_AUTONOMOUS_CALC_MODE
          </span>
          <span className="text-zinc-600">|</span>
          <span>COMPUTE_ENGINE: models/gemini-3.5-flash (Secure Server Proxy)</span>
        </div>
        <div className="flex gap-4">
          <span>PORT: 3000 (Local Environment)</span>
          <span>© 2026 PRO CONTENT STRATEGIST CORE</span>
        </div>
      </footer>

    </div>
  );
}
