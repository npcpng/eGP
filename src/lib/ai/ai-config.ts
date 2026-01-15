/**
 * PNG eGP System - AI Configuration & Governance Framework
 *
 * PRINCIPLE: AI must support human judgement, strengthen compliance,
 * enhance transparency, and improve efficiency — but final procurement
 * decisions must remain with accountable public officers.
 *
 * This module implements:
 * - Human-in-the-Loop (HITL) controls
 * - Explainability by default
 * - Configurable thresholds (NPC-controlled)
 * - Full audit logging
 * - No vendor lock-in (open standards)
 */

export type AIModuleId =
  | 'spend-classification'
  | 'plan-analysis'
  | 'duplicate-detection'
  | 'budget-alignment'
  | 'price-benchmarking'
  | 'document-drafting'
  | 'compliance-check'
  | 'supplier-chatbot'
  | 'risk-scoring'
  | 'anomaly-detection';

export type AIRiskLevel = 'LOW' | 'MEDIUM' | 'MEDIUM_HIGH' | 'HIGH';

export type AIPhase = 1 | 2 | 3 | 4;

export interface AIModuleConfig {
  id: AIModuleId;
  name: string;
  description: string;
  phase: AIPhase;
  riskLevel: AIRiskLevel;
  enabled: boolean;
  requiresHumanApproval: boolean;
  explainabilityRequired: boolean;
  auditLoggingEnabled: boolean;
  configurable: boolean;
  thresholds: Record<string, number>;
  lastUpdated: Date;
  updatedBy: string;
}

export interface AIDecision {
  id: string;
  moduleId: AIModuleId;
  timestamp: Date;
  input: Record<string, unknown>;
  output: Record<string, unknown>;
  explanation: string;
  confidence: number;
  humanOverride: boolean;
  overrideReason?: string;
  overrideBy?: string;
  overrideAt?: Date;
  auditTrail: AIAuditEntry[];
}

export interface AIAuditEntry {
  timestamp: Date;
  action: 'INPUT' | 'PROCESSING' | 'OUTPUT' | 'HUMAN_REVIEW' | 'OVERRIDE' | 'APPROVAL' | 'REJECTION';
  userId?: string;
  details: string;
  metadata?: Record<string, unknown>;
}

export interface AIExplanation {
  summary: string;
  factors: AIExplanationFactor[];
  confidence: number;
  limitations: string[];
  humanActionRequired: boolean;
  suggestedAction?: string;
}

export interface AIExplanationFactor {
  factor: string;
  impact: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
  weight: number;
  description: string;
}

// Default AI Module Configurations (NPC can override)
export const DEFAULT_AI_MODULES: AIModuleConfig[] = [
  // Phase 1 - Low Risk
  {
    id: 'spend-classification',
    name: 'Spend Classification',
    description: 'AI-assisted UNSPSC/CPV code mapping for procurement items',
    phase: 1,
    riskLevel: 'LOW',
    enabled: true,
    requiresHumanApproval: false,
    explainabilityRequired: true,
    auditLoggingEnabled: true,
    configurable: true,
    thresholds: {
      minConfidence: 0.7,
      suggestionsLimit: 5,
    },
    lastUpdated: new Date(),
    updatedBy: 'SYSTEM',
  },
  {
    id: 'plan-analysis',
    name: 'Annual Plan Analysis',
    description: 'AI-supported analysis of Annual Procurement Plans for patterns and anomalies',
    phase: 1,
    riskLevel: 'LOW',
    enabled: true,
    requiresHumanApproval: false,
    explainabilityRequired: true,
    auditLoggingEnabled: true,
    configurable: true,
    thresholds: {
      duplicateThreshold: 0.85,
      fragmentationThreshold: 0.6,
    },
    lastUpdated: new Date(),
    updatedBy: 'SYSTEM',
  },
  {
    id: 'duplicate-detection',
    name: 'Duplicate Detection',
    description: 'Detect duplicate or fragmented procurement activities',
    phase: 1,
    riskLevel: 'LOW',
    enabled: true,
    requiresHumanApproval: false,
    explainabilityRequired: true,
    auditLoggingEnabled: true,
    configurable: true,
    thresholds: {
      similarityThreshold: 0.8,
      timeWindowDays: 365,
    },
    lastUpdated: new Date(),
    updatedBy: 'SYSTEM',
  },
  {
    id: 'budget-alignment',
    name: 'Budget Alignment',
    description: 'Alerts for budget-to-procurement alignment issues',
    phase: 1,
    riskLevel: 'LOW',
    enabled: true,
    requiresHumanApproval: false,
    explainabilityRequired: true,
    auditLoggingEnabled: true,
    configurable: true,
    thresholds: {
      varianceWarning: 0.1,
      varianceCritical: 0.25,
    },
    lastUpdated: new Date(),
    updatedBy: 'SYSTEM',
  },
  {
    id: 'price-benchmarking',
    name: 'Price Benchmarking',
    description: 'Historical price benchmarking and market range indicators',
    phase: 1,
    riskLevel: 'LOW',
    enabled: true,
    requiresHumanApproval: false,
    explainabilityRequired: true,
    auditLoggingEnabled: true,
    configurable: true,
    thresholds: {
      outlierStdDev: 2.0,
      minDataPoints: 3,
    },
    lastUpdated: new Date(),
    updatedBy: 'SYSTEM',
  },
  {
    id: 'document-drafting',
    name: 'Document Drafting',
    description: 'AI-assisted drafting of RFI, RFP, RFQ, RFT templates',
    phase: 1,
    riskLevel: 'LOW',
    enabled: true,
    requiresHumanApproval: true, // Must be human-validated
    explainabilityRequired: true,
    auditLoggingEnabled: true,
    configurable: true,
    thresholds: {
      maxSuggestions: 3,
    },
    lastUpdated: new Date(),
    updatedBy: 'SYSTEM',
  },
  // Phase 2 - Medium Risk
  {
    id: 'compliance-check',
    name: 'Compliance Check',
    description: 'Automated compliance checks for bid submissions',
    phase: 2,
    riskLevel: 'MEDIUM',
    enabled: true,
    requiresHumanApproval: true,
    explainabilityRequired: true,
    auditLoggingEnabled: true,
    configurable: true,
    thresholds: {
      mandatoryDocumentScore: 1.0,
      warningThreshold: 0.8,
    },
    lastUpdated: new Date(),
    updatedBy: 'SYSTEM',
  },
  {
    id: 'supplier-chatbot',
    name: 'Supplier Support Chatbot',
    description: 'AI chatbot for supplier registration and tender guidance',
    phase: 2,
    riskLevel: 'MEDIUM',
    enabled: true,
    requiresHumanApproval: false,
    explainabilityRequired: false,
    auditLoggingEnabled: true,
    configurable: true,
    thresholds: {
      escalationConfidence: 0.6,
    },
    lastUpdated: new Date(),
    updatedBy: 'SYSTEM',
  },
  // Phase 3 - Medium-High Risk
  {
    id: 'risk-scoring',
    name: 'Risk Scoring',
    description: 'Risk scoring of tenders and suppliers',
    phase: 3,
    riskLevel: 'MEDIUM_HIGH',
    enabled: false, // Disabled by default
    requiresHumanApproval: true,
    explainabilityRequired: true,
    auditLoggingEnabled: true,
    configurable: true,
    thresholds: {
      highRiskThreshold: 0.7,
      mediumRiskThreshold: 0.4,
    },
    lastUpdated: new Date(),
    updatedBy: 'SYSTEM',
  },
  {
    id: 'anomaly-detection',
    name: 'Anomaly Detection',
    description: 'Pattern detection for bid rotation, collusion, and suspicious activities',
    phase: 3,
    riskLevel: 'MEDIUM_HIGH',
    enabled: false, // Disabled by default
    requiresHumanApproval: true,
    explainabilityRequired: true,
    auditLoggingEnabled: true,
    configurable: true,
    thresholds: {
      anomalyThreshold: 0.9,
      minPatternOccurrences: 3,
    },
    lastUpdated: new Date(),
    updatedBy: 'SYSTEM',
  },
];

// AI Governance Rules
export const AI_GOVERNANCE_RULES = {
  // AI must never make final decisions
  FINAL_DECISION_HUMAN_ONLY: true,

  // All AI outputs must be explainable
  EXPLAINABILITY_REQUIRED: true,

  // Audit logging is mandatory
  AUDIT_LOGGING_MANDATORY: true,

  // High-risk actions require dual human validation
  DUAL_VALIDATION_HIGH_RISK: true,

  // AI suggestions must be editable
  SUGGESTIONS_EDITABLE: true,

  // Override justification required
  OVERRIDE_JUSTIFICATION_REQUIRED: true,

  // Data retention for AI decisions (days)
  AUDIT_RETENTION_DAYS: 2555, // ~7 years

  // Maximum confidence display (never show 100%)
  MAX_DISPLAYED_CONFIDENCE: 0.95,
};

// AI Declaration watermark for documents
export const AI_DECLARATION = {
  short: 'AI-assisted, human-validated',
  full: 'This content was generated with AI assistance and has been reviewed and validated by authorized personnel. Final decisions remain with accountable public officers.',
};
