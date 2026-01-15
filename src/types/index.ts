// =============================================================================
// PNG eGP System - Core Type Definitions
// =============================================================================

// -----------------------------------------------------------------------------
// Type Aliases (using string literal unions for better compatibility)
// -----------------------------------------------------------------------------

export type UserRole =
  | 'SYSTEM_ADMIN'
  | 'NPC_ADMIN'
  | 'NPC_OFFICER'
  | 'AGENCY_HEAD'
  | 'PROCUREMENT_OFFICER'
  | 'FINANCE_OFFICER'
  | 'EVALUATOR'
  | 'AUDITOR'
  | 'SUPPLIER'
  | 'PUBLIC_VIEWER';

export const UserRole = {
  SYSTEM_ADMIN: 'SYSTEM_ADMIN' as const,
  NPC_ADMIN: 'NPC_ADMIN' as const,
  NPC_OFFICER: 'NPC_OFFICER' as const,
  AGENCY_HEAD: 'AGENCY_HEAD' as const,
  PROCUREMENT_OFFICER: 'PROCUREMENT_OFFICER' as const,
  FINANCE_OFFICER: 'FINANCE_OFFICER' as const,
  EVALUATOR: 'EVALUATOR' as const,
  AUDITOR: 'AUDITOR' as const,
  SUPPLIER: 'SUPPLIER' as const,
  PUBLIC_VIEWER: 'PUBLIC_VIEWER' as const,
};

export type ProcurementMethod =
  | 'OPEN_TENDER'
  | 'RESTRICTED_TENDER'
  | 'REQUEST_FOR_QUOTATION'
  | 'DIRECT_PROCUREMENT'
  | 'FRAMEWORK_AGREEMENT'
  | 'EMERGENCY_PROCUREMENT';

export type TenderStatus =
  | 'DRAFT'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'PUBLISHED'
  | 'OPEN_FOR_BIDDING'
  | 'CLOSED'
  | 'UNDER_EVALUATION'
  | 'EVALUATED'
  | 'AWARDED'
  | 'CANCELLED';

export type BidStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'WITHDRAWN'
  | 'UNDER_EVALUATION'
  | 'RESPONSIVE'
  | 'NON_RESPONSIVE'
  | 'AWARDED'
  | 'REJECTED';

export type ContractStatus =
  | 'DRAFT'
  | 'PENDING_SIGNATURE'
  | 'ACTIVE'
  | 'SUSPENDED'
  | 'COMPLETED'
  | 'TERMINATED';

export type SupplierStatus =
  | 'PENDING'
  | 'ACTIVE'
  | 'SUSPENDED'
  | 'BLACKLISTED'
  | 'INACTIVE';

export type DocumentType =
  | 'TENDER_NOTICE'
  | 'TENDER_DOCUMENT'
  | 'TECHNICAL_SPECIFICATION'
  | 'BID_DOCUMENT'
  | 'EVALUATION_REPORT'
  | 'CONTRACT'
  | 'AMENDMENT'
  | 'INVOICE'
  | 'DELIVERY_NOTE'
  | 'CERTIFICATE';

export type ApprovalStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'RETURNED';

export type AuditAction =
  | 'CREATE'
  | 'READ'
  | 'UPDATE'
  | 'DELETE'
  | 'APPROVE'
  | 'REJECT'
  | 'SUBMIT'
  | 'PUBLISH'
  | 'AWARD'
  | 'SIGN'
  | 'LOGIN'
  | 'LOGOUT';

// -----------------------------------------------------------------------------
// Base Types
// -----------------------------------------------------------------------------

export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
  isDeleted: boolean;
}

export interface Address {
  line1: string;
  line2?: string;
  city: string;
  province: string;
  postalCode?: string;
  country: string;
}

export interface ContactInfo {
  email: string;
  phone?: string;
  mobile?: string;
  fax?: string;
}

export interface Money {
  amount: number;
  currency: 'PGK' | 'USD' | 'AUD';
}

export interface Period {
  startDate: Date;
  endDate: Date;
  durationInDays?: number;
}

// -----------------------------------------------------------------------------
// User & Organization Types
// -----------------------------------------------------------------------------

export interface User extends BaseEntity {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  organizationId: string;
  isActive: boolean;
  lastLoginAt?: Date;
  mfaEnabled: boolean;
  permissions: string[];
}

export interface Organization extends BaseEntity {
  name: string;
  code: string;
  type: 'GOVERNMENT_AGENCY' | 'STATE_OWNED_ENTERPRISE' | 'SUPPLIER' | 'NPC';
  address: Address;
  contact: ContactInfo;
  parentId?: string;
  isActive: boolean;
}

// -----------------------------------------------------------------------------
// Procurement Planning Types
// -----------------------------------------------------------------------------

export interface AnnualProcurementPlan extends BaseEntity {
  fiscalYear: number;
  organizationId: string;
  status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'PUBLISHED';
  totalBudget: Money;
  items: ProcurementPlanItem[];
  approvalChain: ApprovalRecord[];
}

export interface ProcurementPlanItem extends BaseEntity {
  planId: string;
  description: string;
  category: string;
  unspscCode?: string;
  estimatedValue: Money;
  procurementMethod: ProcurementMethod;
  expectedQuarter: 1 | 2 | 3 | 4;
  justification: string;
  linkedTenderId?: string;
}

export interface ConflictOfInterestDeclaration extends BaseEntity {
  userId: string;
  procurementId: string;
  hasConflict: boolean;
  conflictDetails?: string;
  declarationDate: Date;
  acknowledgedBy?: string;
}

// -----------------------------------------------------------------------------
// Tender Types
// -----------------------------------------------------------------------------

export interface Tender extends BaseEntity {
  referenceNumber: string;
  title: string;
  description: string;
  organizationId: string;
  procurementMethod: ProcurementMethod;
  status: TenderStatus;
  category: string;
  unspscCode?: string;
  estimatedValue: Money;
  currency: string;
  submissionDeadline: Date;
  openingDate: Date;
  validityPeriod: number;
  bidSecurityRequired: boolean;
  bidSecurityAmount?: Money;
  documents: TenderDocument[];
  lots: TenderLot[];
  evaluationCriteria: EvaluationCriteria[];
  clarifications: Clarification[];
  addenda: Addendum[];
  approvalChain: ApprovalRecord[];
  linkedPlanItemId?: string;
}

export interface TenderLot extends BaseEntity {
  tenderId: string;
  lotNumber: number;
  title: string;
  description: string;
  estimatedValue: Money;
  quantity?: number;
  unit?: string;
  technicalSpecifications: string;
}

export interface TenderDocument extends BaseEntity {
  tenderId: string;
  type: DocumentType;
  name: string;
  description?: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  version: number;
  isPublic: boolean;
  hash: string;
}

export interface EvaluationCriteria extends BaseEntity {
  tenderId: string;
  name: string;
  description: string;
  type: 'PASS_FAIL' | 'SCORED' | 'WEIGHTED';
  maxScore?: number;
  weight?: number;
  isEliminatory: boolean;
  order: number;
  subCriteria?: EvaluationCriteria[];
}

export interface Clarification extends BaseEntity {
  tenderId: string;
  question: string;
  questionBy: string;
  questionDate: Date;
  answer?: string;
  answeredBy?: string;
  answerDate?: Date;
  isPublished: boolean;
}

export interface Addendum extends BaseEntity {
  tenderId: string;
  number: number;
  title: string;
  description: string;
  documentUrl?: string;
  publishedAt: Date;
  extendsDeadline: boolean;
  newDeadline?: Date;
}

// -----------------------------------------------------------------------------
// Bid Types
// -----------------------------------------------------------------------------

export interface Bid extends BaseEntity {
  tenderId: string;
  lotId?: string;
  supplierId: string;
  referenceNumber: string;
  status: BidStatus;
  submittedAt?: Date;
  technicalProposal: BidDocument[];
  financialProposal: BidDocument[];
  totalPrice: Money;
  validityPeriod: number;
  bidSecurity?: BidSecurity;
  encryptedData?: string;
  decryptedAt?: Date;
  version: number;
  previousVersionId?: string;
}

export interface BidDocument extends BaseEntity {
  bidId: string;
  type: 'TECHNICAL' | 'FINANCIAL' | 'QUALIFICATION' | 'OTHER';
  name: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  hash: string;
  isEncrypted: boolean;
}

export interface BidSecurity extends BaseEntity {
  bidId: string;
  type: 'BANK_GUARANTEE' | 'BOND' | 'CASH_DEPOSIT';
  amount: Money;
  issuingBank?: string;
  referenceNumber: string;
  validFrom: Date;
  validTo: Date;
  documentUrl: string;
  isValid: boolean;
}

// -----------------------------------------------------------------------------
// Evaluation Types
// -----------------------------------------------------------------------------

export interface Evaluation extends BaseEntity {
  tenderId: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'APPROVED';
  evaluationCommittee: EvaluationCommitteeMember[];
  bidEvaluations: BidEvaluation[];
  technicalThreshold?: number;
  evaluationMethod: 'LOWEST_PRICE' | 'QUALITY_COST' | 'QUALITY_ONLY';
  startDate: Date;
  endDate?: Date;
  report?: EvaluationReport;
}

export interface EvaluationCommitteeMember extends BaseEntity {
  evaluationId: string;
  userId: string;
  role: 'CHAIR' | 'MEMBER' | 'SECRETARY' | 'OBSERVER';
  conflictDeclaration: ConflictOfInterestDeclaration;
  assignedCriteria?: string[];
}

export interface BidEvaluation extends BaseEntity {
  evaluationId: string;
  bidId: string;
  isResponsive: boolean;
  responsiveNotes?: string;
  criteriaScores: CriteriaScore[];
  technicalScore?: number;
  financialScore?: number;
  combinedScore?: number;
  rank?: number;
  recommendation: 'AWARD' | 'REJECT' | 'STANDBY';
}

export interface CriteriaScore extends BaseEntity {
  bidEvaluationId: string;
  criteriaId: string;
  evaluatorId: string;
  score: number;
  maxScore: number;
  comments?: string;
  scoredAt: Date;
}

export interface EvaluationReport extends BaseEntity {
  evaluationId: string;
  summary: string;
  methodology: string;
  findings: string;
  recommendations: string;
  attachments: string[];
  generatedAt: Date;
  approvalChain: ApprovalRecord[];
}

// -----------------------------------------------------------------------------
// Contract Types
// -----------------------------------------------------------------------------

export interface Contract extends BaseEntity {
  referenceNumber: string;
  tenderId: string;
  bidId: string;
  supplierId: string;
  organizationId: string;
  title: string;
  description: string;
  status: ContractStatus;
  contractType: 'GOODS' | 'WORKS' | 'SERVICES' | 'CONSULTANCY';
  value: Money;
  period: Period;
  signedDate?: Date;
  effectiveDate?: Date;
  completionDate?: Date;
  clauses: ContractClause[];
  milestones: ContractMilestone[];
  variations: ContractVariation[];
  payments: ContractPayment[];
  documents: ContractDocument[];
  performanceRating?: number;
}

export interface ContractClause extends BaseEntity {
  contractId: string;
  number: string;
  title: string;
  content: string;
  isStandard: boolean;
  sourceTemplateId?: string;
}

export interface ContractMilestone extends BaseEntity {
  contractId: string;
  number: number;
  title: string;
  description: string;
  dueDate: Date;
  completedDate?: Date;
  deliverables: string[];
  paymentPercentage?: number;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'DELAYED' | 'CANCELLED';
}

export interface ContractVariation extends BaseEntity {
  contractId: string;
  number: number;
  type: 'PRICE_ADJUSTMENT' | 'SCOPE_CHANGE' | 'TIME_EXTENSION' | 'OTHER';
  description: string;
  justification: string;
  originalValue: Money;
  newValue: Money;
  originalEndDate?: Date;
  newEndDate?: Date;
  status: ApprovalStatus;
  approvalChain: ApprovalRecord[];
}

export interface ContractPayment extends BaseEntity {
  contractId: string;
  milestoneId?: string;
  invoiceNumber: string;
  amount: Money;
  dueDate: Date;
  paidDate?: Date;
  status: 'PENDING' | 'APPROVED' | 'PAID' | 'REJECTED';
}

export interface ContractDocument extends BaseEntity {
  contractId: string;
  type: DocumentType;
  name: string;
  fileUrl: string;
  fileSize: number;
  version: number;
}

// -----------------------------------------------------------------------------
// Supplier Types
// -----------------------------------------------------------------------------

export interface Supplier extends BaseEntity {
  registrationNumber: string;
  name: string;
  tradingName?: string;
  type: 'COMPANY' | 'SOLE_TRADER' | 'PARTNERSHIP' | 'JOINT_VENTURE';
  status: SupplierStatus;
  address: Address;
  contact: ContactInfo;
  taxNumber: string;
  businessRegistrationNumber: string;
  incorporationDate?: Date;
  parentCompanyId?: string;
  classifications: SupplierClassification[];
  qualifications: SupplierQualification[];
  bankDetails: BankDetails;
  categories: string[];
  unspscCodes: string[];
  performanceHistory: SupplierPerformance[];
}

export interface SupplierClassification {
  type: 'SME' | 'WOMEN_OWNED' | 'LANDOWNER' | 'DISABLED_OWNED' | 'YOUTH_OWNED';
  certificationDate: Date;
  expiryDate?: Date;
  certificateUrl?: string;
  isVerified: boolean;
}

export interface SupplierQualification extends BaseEntity {
  supplierId: string;
  category: string;
  level: 'BASIC' | 'STANDARD' | 'ADVANCED';
  maxContractValue: Money;
  validFrom: Date;
  validTo: Date;
  documents: string[];
  status: 'PENDING' | 'APPROVED' | 'EXPIRED' | 'REVOKED';
}

export interface BankDetails {
  bankName: string;
  branchName: string;
  accountName: string;
  accountNumber: string;
  bsbCode?: string;
  swiftCode?: string;
}

export interface SupplierPerformance extends BaseEntity {
  supplierId: string;
  contractId: string;
  evaluationDate: Date;
  qualityScore: number;
  deliveryScore: number;
  priceScore: number;
  overallScore: number;
  comments?: string;
  evaluatedBy: string;
}

// -----------------------------------------------------------------------------
// Marketplace & Auction Types
// -----------------------------------------------------------------------------

export interface CatalogItem extends BaseEntity {
  supplierId: string;
  name: string;
  description: string;
  category: string;
  unspscCode: string;
  unitPrice: Money;
  unit: string;
  minimumOrderQuantity: number;
  leadTimeDays: number;
  specifications: Record<string, string>;
  images: string[];
  isActive: boolean;
  frameworkAgreementId?: string;
}

export interface Auction extends BaseEntity {
  referenceNumber: string;
  tenderId?: string;
  type: 'FORWARD' | 'REVERSE';
  title: string;
  description: string;
  status: 'SCHEDULED' | 'OPEN' | 'CLOSED' | 'CANCELLED';
  startTime: Date;
  endTime: Date;
  reservePrice?: Money;
  currentPrice: Money;
  minimumDecrement?: Money;
  bids: AuctionBid[];
  winnerId?: string;
}

export interface AuctionBid extends BaseEntity {
  auctionId: string;
  supplierId: string;
  price: Money;
  bidTime: Date;
  isWinning: boolean;
}

export interface AssetDisposal extends BaseEntity {
  referenceNumber: string;
  title: string;
  description: string;
  assetType: string;
  condition: 'NEW' | 'GOOD' | 'FAIR' | 'POOR' | 'SCRAP';
  reservePrice: Money;
  disposalMethod: 'AUCTION' | 'TENDER' | 'DIRECT_SALE' | 'TRANSFER' | 'DESTROY';
  status: 'PENDING' | 'APPROVED' | 'IN_PROGRESS' | 'COMPLETED';
  auctionId?: string;
}

// -----------------------------------------------------------------------------
// Approval & Workflow Types
// -----------------------------------------------------------------------------

export interface ApprovalRecord extends BaseEntity {
  entityType: string;
  entityId: string;
  step: number;
  approverId: string;
  status: ApprovalStatus;
  comments?: string;
  actionDate?: Date;
  requiredRole: UserRole;
}

export interface WorkflowDefinition extends BaseEntity {
  name: string;
  entityType: string;
  steps: WorkflowStep[];
  isActive: boolean;
}

export interface WorkflowStep {
  order: number;
  name: string;
  requiredRole: UserRole;
  isOptional: boolean;
  timeoutDays?: number;
  escalationRole?: UserRole;
}

// -----------------------------------------------------------------------------
// Audit Types
// -----------------------------------------------------------------------------

export interface AuditLog extends BaseEntity {
  userId: string;
  sessionId: string;
  action: AuditAction;
  entityType: string;
  entityId: string;
  previousState?: string;
  newState?: string;
  ipAddress: string;
  userAgent: string;
  metadata?: Record<string, unknown>;
}

// -----------------------------------------------------------------------------
// Report Types
// -----------------------------------------------------------------------------

export interface Report extends BaseEntity {
  type: 'OPERATIONAL' | 'COMPLIANCE' | 'KPI' | 'AUDIT' | 'FINANCIAL';
  name: string;
  description: string;
  parameters: Record<string, unknown>;
  generatedAt: Date;
  generatedBy: string;
  format: 'PDF' | 'EXCEL' | 'CSV' | 'JSON';
  fileUrl: string;
}

export interface DashboardMetrics {
  totalTenders: number;
  activeTenders: number;
  totalBids: number;
  totalContracts: number;
  activeContracts: number;
  totalSuppliers: number;
  procurementValue: Money;
  savingsAchieved: Money;
  averageProcessingDays: number;
  complianceRate: number;
}

// -----------------------------------------------------------------------------
// OCDS Types (Open Contracting Data Standard)
// -----------------------------------------------------------------------------

export interface OCDSRelease {
  ocid: string;
  id: string;
  date: string;
  tag: ('planning' | 'tender' | 'award' | 'contract' | 'implementation')[];
  initiationType: 'tender';
  parties: OCDSOrganization[];
  buyer: OCDSOrganizationReference;
  planning?: OCDSPlanning;
  tender?: OCDSTender;
  awards?: OCDSAward[];
  contracts?: OCDSContract[];
}

export interface OCDSOrganization {
  id: string;
  name: string;
  identifier: {
    scheme: string;
    id: string;
    legalName: string;
  };
  address: {
    streetAddress: string;
    locality: string;
    region: string;
    postalCode: string;
    countryName: string;
  };
  contactPoint: {
    name: string;
    email: string;
    telephone: string;
  };
  roles: string[];
}

export interface OCDSOrganizationReference {
  id: string;
  name: string;
}

export interface OCDSPlanning {
  rationale: string;
  budget: {
    amount: {
      amount: number;
      currency: string;
    };
    project: string;
    projectID: string;
  };
}

export interface OCDSTender {
  id: string;
  title: string;
  description: string;
  status: string;
  procurementMethod: string;
  procurementMethodDetails: string;
  mainProcurementCategory: string;
  value: {
    amount: number;
    currency: string;
  };
  tenderPeriod: {
    startDate: string;
    endDate: string;
  };
  documents: OCDSDocument[];
}

export interface OCDSAward {
  id: string;
  title: string;
  description: string;
  status: string;
  date: string;
  value: {
    amount: number;
    currency: string;
  };
  suppliers: OCDSOrganizationReference[];
}

export interface OCDSContract {
  id: string;
  awardID: string;
  title: string;
  description: string;
  status: string;
  period: {
    startDate: string;
    endDate: string;
  };
  value: {
    amount: number;
    currency: string;
  };
  dateSigned: string;
}

export interface OCDSDocument {
  id: string;
  documentType: string;
  title: string;
  description: string;
  url: string;
  datePublished: string;
  format: string;
  language: string;
}

// -----------------------------------------------------------------------------
// Notification Types
// -----------------------------------------------------------------------------

export interface Notification extends BaseEntity {
  userId: string;
  type: 'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS' | 'ACTION_REQUIRED';
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  readAt?: Date;
}

// -----------------------------------------------------------------------------
// System Configuration Types
// -----------------------------------------------------------------------------

export interface SystemConfig {
  id: string;
  key: string;
  value: string;
  category: string;
  description: string;
  isEditable: boolean;
}

export interface UNSPSCCode {
  code: string;
  segment: string;
  family: string;
  class: string;
  commodity: string;
  description: string;
}
