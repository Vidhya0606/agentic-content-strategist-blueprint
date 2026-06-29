export interface AudienceAnalysis {
  primaryAudience: string;
  secondaryAudience: string;
  goals: string[];
  painPoints: string[];
  frequentQuestions: string[];
  objections: string[];
  desiredOutcomes: string[];
}

export interface SearchOpportunity {
  topic: string;
  intent: 'Informational' | 'Commercial' | 'Transactional' | 'Emerging' | 'Contrarian';
  description: string;
}

export interface EditorialGapAnalysis {
  saturatedIdeas: string[];
  overusedAngles: string[];
  missingConversations: string[];
  underservedQuestions: string[];
  counterintuitiveInsights: string[];
  summary: string;
}

export interface IdeaScores {
  novelty: number;        // 1-10
  audienceRelevance: number; // 1-10
  businessValue: number;    // 1-10
  searchOpportunity: number;// 1-10
  shareability: number;     // 1-10
  overallScore: number;     // calculated average/weighted
}

export interface BlogIdea {
  id: string;
  title: string;
  targetAudience: string;
  searchIntent: string;
  whyItMatters: string;
  difficulty: 'Low' | 'Medium' | 'High';
  impact: 'Low' | 'Medium' | 'High';
  scores: IdeaScores;
}

export interface LinkedInIdea {
  id: string;
  hook: string;
  coreInsight: string;
  engagementPotential: 'Low' | 'Medium' | 'High';
  suggestedCTA: string;
  scores: IdeaScores;
}

export interface NewsletterIdea {
  id: string;
  subjectLine: string;
  angle: string;
  keyTakeaway: string;
  whySubscribersCare: string;
  scores: IdeaScores;
}

export interface PrioritizedOpportunity {
  ideaId: string;
  title: string;
  whyItWon: string;
  recommendedFormat: string;
  expectedOutcome: string;
  contentBriefString: string;
}

export interface ExecutionBrief {
  workingTitle: string;
  targetKeyword: string;
  audience: string;
  searchIntent: string;
  outline: string[];
  keyTalkingPoints: string[];
  recommendedCTA: string;
  suggestedInternalLinks: string[];
  suggestedLeadMagnet: string;
}

export interface StrategyReport {
  audienceAnalysis: AudienceAnalysis;
  searchIntentMapping: {
    opportunities: SearchOpportunity[];
  };
  editorialGapAnalysis: EditorialGapAnalysis;
  blogIdeas: BlogIdea[];
  linkedinIdeas: LinkedInIdea[];
  newsletterIdeas: NewsletterIdea[];
  prioritizedOpportunities: PrioritizedOpportunity[];
  executionBrief: ExecutionBrief;
}

export interface SavedStrategy {
  id: string;
  timestamp: string;
  topic: string;
  audience: string;
  industry: string;
  contentGoal: string;
  platforms: string[];
  report: StrategyReport;
}
