# ARC — Autonomous Research and Content Agent

A multi-agent AI system that helps B2B content teams figure out
what to write next, and exactly how to write it.

---

## The Problem

Content teams at B2B SaaS companies are drowning in data and
still guessing. They know AI can help but most tools either
generate generic ideas or require hours of manual research
before producing anything useful. The real bottleneck isn't
writing. It's knowing what's worth writing in the first place.

---

## What ARC Does

ARC runs a 7-agent sequential pipeline that takes a topic,
audience, and business goal and returns a complete, prioritized
content strategy in under 3 minutes.

It doesn't just generate ideas. It reasons about your audience,
maps how they search, identifies what's missing from the current
content landscape, generates 30 scored ideas across three
channels, and produces a production-ready brief for the
highest-priority piece.

Every step builds on the previous one. The gap analysis actually
knows what the audience analysis found. The scoring actually
reflects the gaps. That's the difference between a well-structured
prompt and a real multi-agent system.

---

## The Agent Architecture

```
User Input (topic, audience, industry, goal)
        │
        ▼
Agent 1 — Audience Analyst
Pain points, questions, mental blocks, desired outcomes
        │
        ▼
Agent 2 — Search Intent Mapper
20 intent vectors across 5 categories
        │
        ▼
Agent 3 — Editorial Gap Analyst
Saturated topics, missing conversations, underserved gaps
        │
        ▼
Agent 4 — Idea Generator
30 ideas across blog, LinkedIn, newsletter
        │
        ▼
Agent 5 — Scoring Agent
Novelty, relevance, value, opportunity, shareability
        │
        ▼
Agent 6 — Prioritization Agent
Top 5 ranked ideas with rationale
        │
        ▼
Agent 7 — Execution Brief Agent
Full brief for #1 idea: outline, CTA, lead magnet
        │
        ▼
Strategy Report (exported as markdown)
```

Seven specialized agents run in sequence:

**Agent 1 — Audience Analyst**
Deep-profiles the target audience. Job titles, pain points,
real questions they ask, mental blocks preventing action.
Temperature: 0.2 for consistency.

**Agent 2 — Search Intent Mapper**
Takes the audience analysis and maps exactly 20 search intent
vectors across Informational, Commercial, Transactional,
Emerging, and Contrarian categories. Builds directly on
Agent 1 output.

**Agent 3 — Editorial Gap Analyst**
Cross-references audience needs against search intent to
identify what's saturated, what's overused, and what nobody
is talking about yet. Temperature: 0.1 for precision.

**Agent 4 — Idea Generator**
Produces exactly 30 content ideas (10 blog, 10 LinkedIn,
10 newsletter) that each address a specific pain point,
map to a search intent, and fill a genuine gap.
Temperature: 0.3 for creative range.

**Agent 5 — Scoring Agent**
Scores all 30 ideas on five dimensions: Novelty, Audience
Relevance, Business Value, Search Opportunity, and
Shareability. Forces real differentiation — clustered scores
are treated as a failure state.

**Agent 6 — Prioritization Agent**
Selects the top 5 ideas by overall score. No two identical
angles even if both scored highly. Returns ranked list with
rationale for each selection.

**Agent 7 — Execution Brief Agent**
Produces a complete production brief for the #1 ranked idea.
Working title, primary keyword, full H2/H3 outline, key
talking points, lead magnet concept, and CTA copy. Specific
enough that a writer can produce a finished draft without
asking a single clarifying question.

---

## Key Technical Features

**Multi-model fallback chain**
Runs on gemini-3.5-flash with automatic fallback to
gemini-flash-latest and gemini-3.1-flash-lite if quota is
hit or the primary model is unavailable. No silent failures.

**Persistent storage**
Every strategy run is saved to a local JSON store and
displayed in the Blueprint Chronicles history panel.
Runs persist across sessions.

**Structured JSON output**
Each agent returns validated JSON against a strict schema.
Responses are parsed and passed as structured context to
the next agent, not as raw text.

**Retry logic with exponential backoff**
Transient API errors trigger automatic retries with
increasing delays before falling back to the next model.

**API key security**
The Gemini API key is read from environment variables only.
Never hardcoded. Never logged.

---

## Built With

- Google Gemini API (gemini-3.5-flash, gemini-flash-latest,
  gemini-3.1-flash-lite)
- Google AI Studio / Antigravity 2.0
- TypeScript + Node.js (Express)
- React + Vite
- Tailwind CSS

---

## Course Concepts Demonstrated

- Multi-agent system with sequential orchestration
- Vibe coding workflow via Antigravity 2.0
- Context engineering across agent handoffs
- Agent quality via structured output schemas and
  temperature tuning per agent role
- Security via environment variable key management
- Deployability via AI Studio with Cloud Run architecture

---

## Setup Instructions

### Prerequisites
- Node.js 18+
- A Google Gemini API key (free tier works)
  Get one at: aistudio.google.com/apikey

### Local Setup

```bash
git clone https://github.com/Vidhya0606/agentic-content-strategist-blueprint
cd agentic-content-strategist-blueprint
npm install
```

Create a `.env` file in the root directory:
```
GEMINI_API_KEY=your_key_here
```

Start the development server:
```bash
npm run dev
```

Open `http://localhost:3000` in your browser.

### AI Studio Setup
1. Import the project into Google AI Studio
2. Add your Gemini API key under Settings → Secrets
   as `GEMINI_API_KEY`
3. Click Run

---

## How to Use ARC

1. Enter a content topic or scenario in the Intake Strategy Engine
2. Fill in your target audience, industry, and content goal
3. Click "Fill & Run" to deploy all 7 agents
4. Review the full strategy output across all 7 steps
5. Click "Load Outline Spec" on any top-5 idea to load
   the execution brief
6. Export your strategy using the Export button

Previous runs are saved in Blueprint Chronicles on the
left panel.

---

## About This Project

ARC was built during Kaggle's 5-Day AI Agents Intensive
Vibe Coding Course with Google (June 2026) by Vidhya
Padmanabhan, a content strategist and AI workflow specialist
with 8+ years in B2B SaaS.

I'm not a developer. I built this entirely through vibe
coding, using natural language as my primary interface.
That's kind of the point. The content professionals who
need a tool like this shouldn't have to wait for an
engineering team to build it for them. ARC is proof that
they don't have to.

Most AI content tools solve for speed. ARC solves for
direction. There's a difference, and content teams feel
it every week.

**Track:** Agents for Business

---

## License

MIT
