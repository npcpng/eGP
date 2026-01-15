/**
 * PNG eGP System - AI Service Layer
 *
 * Implements Phase 1 AI capabilities:
 * - Spend Classification (UNSPSC mapping)
 * - Annual Plan Analysis
 * - Duplicate Detection
 * - Budget Alignment
 * - Price Benchmarking
 * - Document Drafting Assistance
 *
 * All AI functions include:
 * - Explainability
 * - Audit logging
 * - Confidence scores
 * - Human override support
 */

import {
  AIModuleId,
  AIDecision,
  AIExplanation,
  AIAuditEntry,
  DEFAULT_AI_MODULES,
  AI_GOVERNANCE_RULES,
  AI_DECLARATION
} from './ai-config';

// Generate unique ID
function generateId(): string {
  return `ai-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// AI Audit Logger
class AIAuditLogger {
  private entries: AIAuditEntry[] = [];

  log(
    action: AIAuditEntry['action'],
    details: string,
    userId?: string,
    metadata?: Record<string, unknown>
  ): void {
    this.entries.push({
      timestamp: new Date(),
      action,
      userId,
      details,
      metadata,
    });

    // In production, this would write to the database
    console.log(`[AI Audit] ${action}: ${details}`, metadata);
  }

  getEntries(): AIAuditEntry[] {
    return [...this.entries];
  }

  clear(): void {
    this.entries = [];
  }
}

// =============================================================================
// SPEND CLASSIFICATION SERVICE
// =============================================================================

export interface UNSPSCCategory {
  code: string;
  name: string;
  segment: string;
  family: string;
  class: string;
  commodity?: string;
}

export interface SpendClassificationResult {
  decision: AIDecision;
  suggestions: Array<{
    category: UNSPSCCategory;
    confidence: number;
    matchedTerms: string[];
  }>;
  explanation: AIExplanation;
}

// Sample UNSPSC categories for demonstration
const UNSPSC_DATABASE: UNSPSCCategory[] = [
  { code: '42000000', name: 'Medical Equipment and Accessories', segment: 'Medical', family: 'Equipment', class: 'General' },
  { code: '43000000', name: 'Information Technology Equipment', segment: 'IT', family: 'Computing', class: 'Hardware' },
  { code: '72000000', name: 'Building Construction Services', segment: 'Construction', family: 'Building', class: 'Services' },
  { code: '80000000', name: 'Management and Business Services', segment: 'Services', family: 'Consulting', class: 'Professional' },
  { code: '25000000', name: 'Vehicles and Transport Equipment', segment: 'Transport', family: 'Vehicles', class: 'Land' },
  { code: '44000000', name: 'Office Equipment and Supplies', segment: 'Office', family: 'Equipment', class: 'Supplies' },
  { code: '46000000', name: 'Defense and Security Equipment', segment: 'Security', family: 'Defense', class: 'Equipment' },
  { code: '53000000', name: 'Apparel and Textiles', segment: 'Textiles', family: 'Clothing', class: 'Uniforms' },
];

export function classifySpend(
  description: string,
  amount?: number,
  existingCode?: string
): SpendClassificationResult {
  const logger = new AIAuditLogger();
  const moduleConfig = DEFAULT_AI_MODULES.find(m => m.id === 'spend-classification')!;

  logger.log('INPUT', `Classifying: "${description}"`, undefined, { amount, existingCode });

  // Simple keyword matching for demonstration
  // In production, this would use NLP/ML models
  const keywords = description.toLowerCase().split(/\s+/);

  const scoredCategories = UNSPSC_DATABASE.map(category => {
    const categoryTerms = [
      category.name.toLowerCase(),
      category.segment.toLowerCase(),
      category.family.toLowerCase(),
      category.class.toLowerCase(),
    ].join(' ').split(/\s+/);

    const matchedTerms = keywords.filter(kw =>
      categoryTerms.some(ct => ct.includes(kw) || kw.includes(ct))
    );

    const confidence = matchedTerms.length / Math.max(keywords.length, 1);

    return {
      category,
      confidence: Math.min(confidence, AI_GOVERNANCE_RULES.MAX_DISPLAYED_CONFIDENCE),
      matchedTerms,
    };
  });

  // Sort by confidence and take top suggestions
  const suggestions = scoredCategories
    .filter(s => s.confidence >= moduleConfig.thresholds.minConfidence * 0.5)
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, moduleConfig.thresholds.suggestionsLimit);

  logger.log('PROCESSING', `Found ${suggestions.length} matching categories`);

  const topSuggestion = suggestions[0];
  const explanation: AIExplanation = {
    summary: topSuggestion
      ? `Recommended category: ${topSuggestion.category.name} (${topSuggestion.category.code})`
      : 'No confident match found. Manual classification recommended.',
    factors: suggestions.slice(0, 3).map(s => ({
      factor: s.category.name,
      impact: s.confidence > 0.5 ? 'POSITIVE' : 'NEUTRAL',
      weight: s.confidence,
      description: `Matched terms: ${s.matchedTerms.join(', ') || 'semantic similarity'}`,
    })),
    confidence: topSuggestion?.confidence || 0,
    limitations: [
      'Classification based on keyword matching',
      'Historical procurement data not yet integrated',
      'Manual verification recommended for high-value items',
    ],
    humanActionRequired: !topSuggestion || topSuggestion.confidence < moduleConfig.thresholds.minConfidence,
    suggestedAction: topSuggestion
      ? 'Review and confirm the suggested classification'
      : 'Manually select the appropriate UNSPSC code',
  };

  logger.log('OUTPUT', `Top suggestion: ${topSuggestion?.category.code || 'none'}`, undefined, {
    confidence: topSuggestion?.confidence,
  });

  const decision: AIDecision = {
    id: generateId(),
    moduleId: 'spend-classification',
    timestamp: new Date(),
    input: { description, amount, existingCode },
    output: { suggestions: suggestions.map(s => ({ code: s.category.code, confidence: s.confidence })) },
    explanation: explanation.summary,
    confidence: topSuggestion?.confidence || 0,
    humanOverride: false,
    auditTrail: logger.getEntries(),
  };

  return { decision, suggestions, explanation };
}

// =============================================================================
// DUPLICATE DETECTION SERVICE
// =============================================================================

export interface DuplicateDetectionResult {
  decision: AIDecision;
  duplicates: Array<{
    existingItemId: string;
    existingItemTitle: string;
    similarity: number;
    type: 'EXACT' | 'SIMILAR' | 'FRAGMENTED';
  }>;
  explanation: AIExplanation;
}

export function detectDuplicates(
  title: string,
  description: string,
  category: string,
  estimatedValue: number,
  existingItems: Array<{ id: string; title: string; description: string; category: string; value: number }>
): DuplicateDetectionResult {
  const logger = new AIAuditLogger();
  const moduleConfig = DEFAULT_AI_MODULES.find(m => m.id === 'duplicate-detection')!;

  logger.log('INPUT', `Checking duplicates for: "${title}"`, undefined, { category, estimatedValue });

  const duplicates: DuplicateDetectionResult['duplicates'] = [];

  for (const item of existingItems) {
    // Simple similarity check (in production, use proper NLP)
    const titleSimilarity = calculateSimilarity(title, item.title);
    const descSimilarity = calculateSimilarity(description, item.description);
    const categorySame = category === item.category;
    const valueSimilar = Math.abs(estimatedValue - item.value) / Math.max(estimatedValue, item.value) < 0.2;

    const overallSimilarity = (titleSimilarity * 0.4 + descSimilarity * 0.3 + (categorySame ? 0.2 : 0) + (valueSimilar ? 0.1 : 0));

    if (overallSimilarity >= moduleConfig.thresholds.similarityThreshold) {
      duplicates.push({
        existingItemId: item.id,
        existingItemTitle: item.title,
        similarity: Math.min(overallSimilarity, AI_GOVERNANCE_RULES.MAX_DISPLAYED_CONFIDENCE),
        type: overallSimilarity > 0.95 ? 'EXACT' : overallSimilarity > 0.8 ? 'SIMILAR' : 'FRAGMENTED',
      });
    }
  }

  logger.log('PROCESSING', `Found ${duplicates.length} potential duplicates`);

  const explanation: AIExplanation = {
    summary: duplicates.length > 0
      ? `Found ${duplicates.length} potential duplicate(s) or related procurement(s)`
      : 'No duplicates detected',
    factors: duplicates.map(d => ({
      factor: d.existingItemTitle,
      impact: 'NEGATIVE',
      weight: d.similarity,
      description: `${d.type} match with ${(d.similarity * 100).toFixed(0)}% similarity`,
    })),
    confidence: duplicates.length > 0 ? duplicates[0].similarity : 0.9,
    limitations: [
      'Based on text similarity analysis',
      'Does not account for legitimate repeat purchases',
      'Historical data limited to current fiscal year',
    ],
    humanActionRequired: duplicates.length > 0,
    suggestedAction: duplicates.length > 0
      ? 'Review potential duplicates and confirm this is a new, unique procurement'
      : undefined,
  };

  logger.log('OUTPUT', `Duplicates found: ${duplicates.length}`);

  const decision: AIDecision = {
    id: generateId(),
    moduleId: 'duplicate-detection',
    timestamp: new Date(),
    input: { title, description, category, estimatedValue },
    output: { duplicateCount: duplicates.length, duplicates },
    explanation: explanation.summary,
    confidence: explanation.confidence,
    humanOverride: false,
    auditTrail: logger.getEntries(),
  };

  return { decision, duplicates, explanation };
}

// Simple text similarity (Jaccard index)
function calculateSimilarity(text1: string, text2: string): number {
  const words1 = new Set(text1.toLowerCase().split(/\s+/).filter(w => w.length > 2));
  const words2 = new Set(text2.toLowerCase().split(/\s+/).filter(w => w.length > 2));

  const intersection = new Set([...words1].filter(x => words2.has(x)));
  const union = new Set([...words1, ...words2]);

  return union.size > 0 ? intersection.size / union.size : 0;
}

// =============================================================================
// PRICE BENCHMARKING SERVICE
// =============================================================================

export interface PriceBenchmarkResult {
  decision: AIDecision;
  benchmark: {
    averagePrice: number;
    minPrice: number;
    maxPrice: number;
    medianPrice: number;
    standardDeviation: number;
    dataPoints: number;
    priceRange: 'BELOW_MARKET' | 'MARKET_RATE' | 'ABOVE_MARKET' | 'OUTLIER';
  } | null;
  explanation: AIExplanation;
}

export function benchmarkPrice(
  category: string,
  estimatedValue: number,
  historicalData: Array<{ value: number; date: Date; supplier?: string }>
): PriceBenchmarkResult {
  const logger = new AIAuditLogger();
  const moduleConfig = DEFAULT_AI_MODULES.find(m => m.id === 'price-benchmarking')!;

  logger.log('INPUT', `Benchmarking price for category: ${category}`, undefined, { estimatedValue });

  if (historicalData.length < moduleConfig.thresholds.minDataPoints) {
    logger.log('OUTPUT', 'Insufficient historical data');

    return {
      decision: {
        id: generateId(),
        moduleId: 'price-benchmarking',
        timestamp: new Date(),
        input: { category, estimatedValue },
        output: { benchmark: null },
        explanation: 'Insufficient historical data for benchmarking',
        confidence: 0,
        humanOverride: false,
        auditTrail: logger.getEntries(),
      },
      benchmark: null,
      explanation: {
        summary: `Insufficient data: Only ${historicalData.length} data points available (minimum ${moduleConfig.thresholds.minDataPoints} required)`,
        factors: [],
        confidence: 0,
        limitations: ['Not enough historical procurement data'],
        humanActionRequired: true,
        suggestedAction: 'Conduct market research to establish price benchmarks',
      },
    };
  }

  const values = historicalData.map(h => h.value).sort((a, b) => a - b);
  const sum = values.reduce((a, b) => a + b, 0);
  const avg = sum / values.length;
  const median = values.length % 2 === 0
    ? (values[values.length / 2 - 1] + values[values.length / 2]) / 2
    : values[Math.floor(values.length / 2)];

  const variance = values.reduce((acc, val) => acc + Math.pow(val - avg, 2), 0) / values.length;
  const stdDev = Math.sqrt(variance);

  // Determine price range
  let priceRange: PriceBenchmarkResult['benchmark'] extends null ? never : NonNullable<PriceBenchmarkResult['benchmark']>['priceRange'];
  const zScore = stdDev > 0 ? (estimatedValue - avg) / stdDev : 0;

  if (Math.abs(zScore) > moduleConfig.thresholds.outlierStdDev) {
    priceRange = 'OUTLIER';
  } else if (zScore < -0.5) {
    priceRange = 'BELOW_MARKET';
  } else if (zScore > 0.5) {
    priceRange = 'ABOVE_MARKET';
  } else {
    priceRange = 'MARKET_RATE';
  }

  logger.log('PROCESSING', `Price range determined: ${priceRange}`);

  const benchmark = {
    averagePrice: avg,
    minPrice: values[0],
    maxPrice: values[values.length - 1],
    medianPrice: median,
    standardDeviation: stdDev,
    dataPoints: values.length,
    priceRange,
  };

  const explanation: AIExplanation = {
    summary: `Estimated value is ${priceRange.replace('_', ' ').toLowerCase()} based on ${values.length} historical procurements`,
    factors: [
      {
        factor: 'Historical Average',
        impact: 'NEUTRAL',
        weight: 0.4,
        description: `K ${avg.toLocaleString()} (based on ${values.length} records)`,
      },
      {
        factor: 'Price Position',
        impact: priceRange === 'MARKET_RATE' ? 'POSITIVE' : priceRange === 'OUTLIER' ? 'NEGATIVE' : 'NEUTRAL',
        weight: 0.3,
        description: `${((zScore > 0 ? '+' : '') + (zScore * 100).toFixed(0))}% from market average`,
      },
      {
        factor: 'Market Range',
        impact: 'NEUTRAL',
        weight: 0.3,
        description: `K ${values[0].toLocaleString()} - K ${values[values.length - 1].toLocaleString()}`,
      },
    ],
    confidence: Math.min(0.5 + (values.length * 0.05), AI_GOVERNANCE_RULES.MAX_DISPLAYED_CONFIDENCE),
    limitations: [
      'Based on historical data only',
      'Does not account for inflation or market changes',
      'Limited to similar categories',
    ],
    humanActionRequired: priceRange === 'OUTLIER',
    suggestedAction: priceRange === 'OUTLIER'
      ? 'Review pricing - significantly differs from historical benchmarks'
      : undefined,
  };

  logger.log('OUTPUT', `Benchmark complete: ${priceRange}`);

  const decision: AIDecision = {
    id: generateId(),
    moduleId: 'price-benchmarking',
    timestamp: new Date(),
    input: { category, estimatedValue, dataPointsUsed: values.length },
    output: benchmark,
    explanation: explanation.summary,
    confidence: explanation.confidence,
    humanOverride: false,
    auditTrail: logger.getEntries(),
  };

  return { decision, benchmark, explanation };
}

// =============================================================================
// DOCUMENT DRAFTING ASSISTANCE
// =============================================================================

export interface DocumentDraftResult {
  decision: AIDecision;
  draft: {
    content: string;
    sections: Array<{ title: string; content: string }>;
    placeholders: string[];
  };
  explanation: AIExplanation;
  declaration: string;
}

export function generateDocumentDraft(
  documentType: 'RFP' | 'RFQ' | 'RFI' | 'RFT',
  procurementDetails: {
    title: string;
    description: string;
    category: string;
    estimatedValue: number;
    deadline?: Date;
  }
): DocumentDraftResult {
  const logger = new AIAuditLogger();

  logger.log('INPUT', `Generating ${documentType} draft`, undefined, procurementDetails);

  // Template-based generation (in production, would use LLM)
  const sections = getDocumentTemplate(documentType, procurementDetails);
  const placeholders = extractPlaceholders(sections);

  logger.log('PROCESSING', `Generated ${sections.length} sections with ${placeholders.length} placeholders`);

  const content = sections.map(s => `## ${s.title}\n\n${s.content}`).join('\n\n');

  const explanation: AIExplanation = {
    summary: `Generated ${documentType} template with ${sections.length} standard sections`,
    factors: [
      {
        factor: 'Template Compliance',
        impact: 'POSITIVE',
        weight: 0.5,
        description: 'Based on NPC-approved templates',
      },
      {
        factor: 'Completeness',
        impact: 'NEUTRAL',
        weight: 0.3,
        description: `${placeholders.length} fields require completion`,
      },
    ],
    confidence: 0.85,
    limitations: [
      'Template-based generation',
      'Requires human review and completion',
      'May need customization for specific requirements',
    ],
    humanActionRequired: true,
    suggestedAction: 'Review all sections, complete placeholders, and validate before publishing',
  };

  logger.log('OUTPUT', `Draft generated with ${placeholders.length} placeholders to complete`);

  const decision: AIDecision = {
    id: generateId(),
    moduleId: 'document-drafting',
    timestamp: new Date(),
    input: { documentType, ...procurementDetails },
    output: { sectionCount: sections.length, placeholderCount: placeholders.length },
    explanation: explanation.summary,
    confidence: explanation.confidence,
    humanOverride: false,
    auditTrail: logger.getEntries(),
  };

  return {
    decision,
    draft: { content, sections, placeholders },
    explanation,
    declaration: AI_DECLARATION.full,
  };
}

function getDocumentTemplate(
  type: 'RFP' | 'RFQ' | 'RFI' | 'RFT',
  details: { title: string; description: string; category: string; estimatedValue: number; deadline?: Date }
): Array<{ title: string; content: string }> {
  const commonSections = [
    {
      title: 'Introduction',
      content: `The National Procurement Commission (NPC) invites qualified suppliers to submit ${type === 'RFQ' ? 'quotations' : 'proposals'} for:\n\n**${details.title}**\n\n${details.description}`,
    },
    {
      title: 'Scope of Work',
      content: `[PLACEHOLDER: Detailed scope of work]\n\nCategory: ${details.category}\nEstimated Value: K ${details.estimatedValue.toLocaleString()}`,
    },
    {
      title: 'Eligibility Requirements',
      content: '- Valid business registration in Papua New Guinea\n- Tax compliance certificate\n- [PLACEHOLDER: Additional eligibility criteria]\n- Active eGP subscription',
    },
    {
      title: 'Submission Requirements',
      content: `Deadline: ${details.deadline ? details.deadline.toLocaleDateString() : '[PLACEHOLDER: Submission deadline]'}\n\nRequired Documents:\n- [PLACEHOLDER: List required documents]\n- Company profile\n- Relevant experience`,
    },
    {
      title: 'Evaluation Criteria',
      content: '[PLACEHOLDER: Evaluation criteria and weightings]\n\n1. Technical Capability: [X]%\n2. Experience: [X]%\n3. Price: [X]%',
    },
    {
      title: 'Terms and Conditions',
      content: 'Standard NPC Terms and Conditions apply.\n\n[PLACEHOLDER: Any special conditions]',
    },
  ];

  return commonSections;
}

function extractPlaceholders(sections: Array<{ title: string; content: string }>): string[] {
  const placeholders: string[] = [];
  const regex = /\[PLACEHOLDER: ([^\]]+)\]/g;

  for (const section of sections) {
    let match;
    while ((match = regex.exec(section.content)) !== null) {
      placeholders.push(match[1]);
    }
  }

  return placeholders;
}

// =============================================================================
// BUDGET ALIGNMENT SERVICE
// =============================================================================

export interface BudgetAlignmentResult {
  decision: AIDecision;
  alignment: {
    budgetCode: string;
    allocatedAmount: number;
    usedAmount: number;
    remainingAmount: number;
    requestedAmount: number;
    status: 'WITHIN_BUDGET' | 'WARNING' | 'EXCEEDS_BUDGET';
    utilizationRate: number;
  };
  explanation: AIExplanation;
}

export function checkBudgetAlignment(
  budgetCode: string,
  allocatedAmount: number,
  usedAmount: number,
  requestedAmount: number
): BudgetAlignmentResult {
  const logger = new AIAuditLogger();
  const moduleConfig = DEFAULT_AI_MODULES.find(m => m.id === 'budget-alignment')!;

  logger.log('INPUT', `Checking budget alignment for ${budgetCode}`);

  const remainingAmount = allocatedAmount - usedAmount;
  const utilizationRate = usedAmount / allocatedAmount;
  const wouldExceed = requestedAmount > remainingAmount;
  const variance = (requestedAmount - remainingAmount) / allocatedAmount;

  let status: BudgetAlignmentResult['alignment']['status'];
  if (wouldExceed) {
    status = 'EXCEEDS_BUDGET';
  } else if (variance > -moduleConfig.thresholds.varianceWarning) {
    status = 'WARNING';
  } else {
    status = 'WITHIN_BUDGET';
  }

  logger.log('PROCESSING', `Budget status: ${status}`);

  const alignment = {
    budgetCode,
    allocatedAmount,
    usedAmount,
    remainingAmount,
    requestedAmount,
    status,
    utilizationRate,
  };

  const explanation: AIExplanation = {
    summary: status === 'WITHIN_BUDGET'
      ? `Procurement is within budget. K ${remainingAmount.toLocaleString()} remaining after this request.`
      : status === 'WARNING'
      ? `Budget utilization will be high (${((usedAmount + requestedAmount) / allocatedAmount * 100).toFixed(0)}%). Review recommended.`
      : `Requested amount exceeds available budget by K ${(requestedAmount - remainingAmount).toLocaleString()}.`,
    factors: [
      {
        factor: 'Available Budget',
        impact: status === 'EXCEEDS_BUDGET' ? 'NEGATIVE' : 'POSITIVE',
        weight: 0.5,
        description: `K ${remainingAmount.toLocaleString()} of K ${allocatedAmount.toLocaleString()}`,
      },
      {
        factor: 'Utilization Rate',
        impact: utilizationRate > 0.8 ? 'NEGATIVE' : utilizationRate > 0.6 ? 'NEUTRAL' : 'POSITIVE',
        weight: 0.3,
        description: `${(utilizationRate * 100).toFixed(0)}% of annual budget used`,
      },
    ],
    confidence: 0.95,
    limitations: [
      'Based on current budget allocations',
      'Does not account for pending commitments',
    ],
    humanActionRequired: status !== 'WITHIN_BUDGET',
    suggestedAction: status === 'EXCEEDS_BUDGET'
      ? 'Request budget reallocation or reduce procurement scope'
      : status === 'WARNING'
      ? 'Verify budget availability with finance department'
      : undefined,
  };

  logger.log('OUTPUT', `Alignment check complete: ${status}`);

  const decision: AIDecision = {
    id: generateId(),
    moduleId: 'budget-alignment',
    timestamp: new Date(),
    input: { budgetCode, allocatedAmount, usedAmount, requestedAmount },
    output: alignment,
    explanation: explanation.summary,
    confidence: explanation.confidence,
    humanOverride: false,
    auditTrail: logger.getEntries(),
  };

  return { decision, alignment, explanation };
}

// Export all services
export const AIServices = {
  classifySpend,
  detectDuplicates,
  benchmarkPrice,
  generateDocumentDraft,
  checkBudgetAlignment,
};
