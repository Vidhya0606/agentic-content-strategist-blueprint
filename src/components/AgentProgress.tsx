import React, { useState, useEffect } from "react";
import { Terminal, ShieldAlert, Cpu, CheckCircle } from "lucide-react";

interface AgentProgressProps {
  currentStep: number;
}

const STAGES = [
  { id: 0, title: "Initialize Strategy Engine", detail: "[System] Booting local context arrays, compiling parameters..." },
  { id: 1, title: "Audience Profiling Run", detail: "[Gemini] Synthesizing primary personas and cognitive pain points..." },
  { id: 2, title: "Intent Vector Calibration", detail: "[Search] Generating exact informational-to-contrarian mapping arrays..." },
  { id: 3, title: "Editorial Gap Critique", detail: "[Strategist] Filtering out industry clichés, finding missing conversations..." },
  { id: 4, title: "Synthesis of Format Verticals", detail: "[AI] Sculpting 10 Blog posts, 10 LinkedIn hooks, and 10 Newsletters..." },
  { id: 5, title: "Mechanical Score Evaluation", detail: "[Sieve] Scoring 30 ideas on Novelty, Value, and Intent density..." },
  { id: 6, title: "Priority Queueing", detail: "[Queue] Compiling top 5 high-leverage editorial opportunities..." },
  { id: 7, title: "Production Spec Drafting", detail: "[Editorial] Authoring complete executive briefs and structural specs..." },
];

export default function AgentProgress({}: AgentProgressProps) {
  const [activeStep, setActiveStep] = useState(0);
  const [ticks, setTicks] = useState<string[]>([]);
  const [elapsed, setElapsed] = useState(0);

  // Auto incrementing steps for high-fidelity interactive engagement
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Progress through active steps every 1.8 seconds max, up to step 7
    const stepInterval = setInterval(() => {
      setActiveStep((prev) => {
        if (prev < 7) {
          return prev + 1;
        }
        return prev;
      });
    }, 1800);

    return () => clearInterval(stepInterval);
  }, []);

  // Generating cute high-tech logger ticks
  useEffect(() => {
    const tickInterval = setInterval(() => {
      const logs = [
        "Analyzing search volume ratios...",
        "Evaluating organic competitiveness score...",
        "Identifying contrarian sentiment offsets...",
        "Injecting editorial industry guidelines...",
        "Removing marketing buzzword clichés...",
        "Refining structural outlines for H2 modules...",
        "Ranking newsletter subject line open-rates...",
        "Designing highly localized lead magnet ideas...",
      ];
      const randomLog = logs[Math.floor(Math.random() * logs.length)];
      setTicks((prev) => [randomLog, ...prev.slice(0, 5)]);
    }, 1200);

    return () => clearInterval(tickInterval);
  }, []);

  return (
    <div id="agent-terminal-panel" className="bg-[#121212] border border-[#2B2B2B] text-[#DCE4ED] rounded-xl p-6 font-mono text-xs max-w-2xl mx-auto shadow-2xl my-6">
      <div className="flex items-center justify-between border-b border-[#2A2A2A] pb-3 mb-4">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-[#C39A6B] animate-pulse" />
          <span className="text-[#C39A6B] uppercase tracking-widest font-bold">Autonomous Strategist Console</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span className="text-[#A0A0A0] text-[10px]">T+{elapsed}s ELAPSED</span>
        </div>
      </div>

      <div className="space-y-4 mb-6">
        <div>
          <span className="text-[#5C5C5C] block mb-1">RUNNING PIPELINE STAGES_</span>
          <div className="space-y-2">
            {STAGES.map((stage) => {
              const isDone = activeStep > stage.id;
              const isActive = activeStep === stage.id;
              return (
                <div
                  key={stage.id}
                  className={`flex items-start gap-2.5 p-2 rounded-md ${
                    isActive ? "bg-[#1E1912] border-l-2 border-[#C39A6B] text-white" : "opacity-60"
                  }`}
                >
                  <div className="mt-0.5">
                    {isDone ? (
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                    ) : isActive ? (
                      <Cpu className="w-3.5 h-3.5 text-[#C39A6B] animate-spin" />
                    ) : (
                      <div className="w-3.5 h-3.5 rounded-full border border-gray-600 bg-transparent flex items-center justify-center text-[8px] text-gray-500 font-bold">
                        {stage.id}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className={`font-semibold ${isActive ? "text-[#C39A6B]" : "text-gray-400"}`}>
                        {stage.title}
                      </span>
                      {isActive && <span className="text-[10px] text-[#A87440] animate-pulse">EXECUTING...</span>}
                    </div>
                    {isActive && <p className="text-[10px] text-gray-400 mt-1">{stage.detail}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="border-t border-[#2A2A2A] pt-3">
        <span className="text-[#5C5C5C] block mb-2">LIVE REAL-TIME STREAMING LOGS_</span>
        <div className="space-y-1 text-[#C39A6B] text-[10px] opacity-80 h-28 overflow-y-auto pr-2 bg-[#090909] p-3 rounded border border-[#222]">
          <div className="animate-pulse mb-1 text-emerald-400">&gt; Querying Gemini API securely server-side...</div>
          {ticks.map((tick, i) => (
            <div key={i} className="truncate">
              <span className="text-[#5C5C5C]">&gt;</span> {tick}
            </div>
          ))}
          <div className="text-[#5C5C5C]">&gt; Listening for chunk callbacks...</div>
        </div>
      </div>

      <div className="flex items-center justify-center gap-1.5 mt-4 text-[#A87440] text-[10px]">
        <ShieldAlert className="w-3 h-3" />
        <span>Please do not close this browser or refresh until calculation results render.</span>
      </div>
    </div>
  );
}
