-- PNG eGP System Database Schema
-- Version: 1.0
-- Created: January 2026

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================================
-- ENUM TYPES
-- =============================================================================

CREATE TYPE user_role AS ENUM (
  'SYSTEM_ADMIN',
  'NPC_ADMIN',
  'NPC_OFFICER',
  'AGENCY_HEAD',
  'PROCUREMENT_OFFICER',
  'FINANCE_OFFICER',
  'EVALUATOR',
  'AUDITOR',
  'SUPPLIER',
  'PUBLIC_VIEWER'
);

CREATE TYPE organization_type AS ENUM (
  'GOVERNMENT_AGENCY',
  'STATE_OWNED_ENTERPRISE',
  'SUPPLIER',
  'NPC'
);

CREATE TYPE plan_status AS ENUM (
  'DRAFT',
  'SUBMITTED',
  'APPROVED',
  'PUBLISHED'
);

CREATE TYPE procurement_method AS ENUM (
  'OPEN_TENDER',
  'RESTRICTED_TENDER',
  'REQUEST_FOR_QUOTATION',
  'DIRECT_PROCUREMENT',
  'FRAMEWORK_AGREEMENT',
  'EMERGENCY_PROCUREMENT'
);

CREATE TYPE tender_status AS ENUM (
  'DRAFT',
  'PENDING_APPROVAL',
  'APPROVED',
  'PUBLISHED',
  'OPEN_FOR_BIDDING',
  'CLOSED',
  'UNDER_EVALUATION',
  'EVALUATED',
  'AWARDED',
  'CANCELLED'
);

CREATE TYPE bid_status AS ENUM (
  'DRAFT',
  'SUBMITTED',
  'WITHDRAWN',
  'UNDER_EVALUATION',
  'RESPONSIVE',
  'NON_RESPONSIVE',
  'AWARDED',
  'REJECTED'
);

CREATE TYPE supplier_type AS ENUM (
  'COMPANY',
  'SOLE_TRADER',
  'PARTNERSHIP',
  'JOINT_VENTURE'
);

CREATE TYPE supplier_status AS ENUM (
  'PENDING',
  'ACTIVE',
  'SUSPENDED',
  'BLACKLISTED',
  'INACTIVE'
);

CREATE TYPE contract_status AS ENUM (
  'DRAFT',
  'PENDING_SIGNATURE',
  'ACTIVE',
  'SUSPENDED',
  'COMPLETED',
  'TERMINATED'
);

CREATE TYPE contract_type AS ENUM (
  'GOODS',
  'WORKS',
  'SERVICES',
  'CONSULTANCY'
);

CREATE TYPE milestone_status AS ENUM (
  'PENDING',
  'IN_PROGRESS',
  'COMPLETED',
  'DELAYED',
  'CANCELLED'
);

CREATE TYPE workflow_entity_type AS ENUM (
  'ANNUAL_PLAN',
  'TENDER',
  'PURCHASE_ORDER',
  'AWARD',
  'CONTRACT',
  'VARIATION'
);

CREATE TYPE workflow_status AS ENUM (
  'IN_PROGRESS',
  'APPROVED',
  'REJECTED',
  'RETURNED'
);

CREATE TYPE approval_status AS ENUM (
  'PENDING',
  'APPROVED',
  'REJECTED',
  'RETURNED'
);

CREATE TYPE audit_action AS ENUM (
  'CREATE',
  'READ',
  'UPDATE',
  'DELETE',
  'APPROVE',
  'REJECT',
  'SUBMIT',
  'PUBLISH',
  'AWARD',
  'SIGN',
  'LOGIN',
  'LOGOUT'
);

CREATE TYPE auction_type AS ENUM (
  'FORWARD',
  'REVERSE'
);

CREATE TYPE auction_status AS ENUM (
  'SCHEDULED',
  'OPEN',
  'CLOSED',
  'CANCELLED'
);

CREATE TYPE document_type AS ENUM (
  'TENDER_NOTICE',
  'TENDER_DOCUMENT',
  'TECHNICAL_SPECIFICATION',
  'BID_DOCUMENT',
  'EVALUATION_REPORT',
  'CONTRACT',
  'AMENDMENT',
  'INVOICE',
  'DELIVERY_NOTE',
  'CERTIFICATE'
);

CREATE TYPE purchase_order_status AS ENUM (
  'DRAFT',
  'PENDING_APPROVAL',
  'APPROVED',
  'ORDERED',
  'DELIVERED',
  'COMPLETED',
  'CANCELLED'
);

-- =============================================================================
-- ORGANIZATIONS TABLE
-- =============================================================================

CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) UNIQUE NOT NULL,
  type organization_type NOT NULL,
  address_line1 VARCHAR(255) NOT NULL,
  address_line2 VARCHAR(255),
  city VARCHAR(100) NOT NULL,
  province VARCHAR(100) NOT NULL,
  postal_code VARCHAR(20),
  country VARCHAR(100) DEFAULT 'Papua New Guinea',
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  parent_id UUID REFERENCES organizations(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- USERS TABLE (extends Supabase auth.users)
-- =============================================================================

CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(100) UNIQUE NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  role user_role NOT NULL DEFAULT 'PUBLIC_VIEWER',
  organization_id UUID REFERENCES organizations(id),
  is_active BOOLEAN DEFAULT true,
  mfa_enabled BOOLEAN DEFAULT false,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- SUPPLIERS TABLE
-- =============================================================================

CREATE TABLE suppliers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  registration_number VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  trading_name VARCHAR(255),
  type supplier_type NOT NULL,
  status supplier_status DEFAULT 'PENDING',
  address_line1 VARCHAR(255) NOT NULL,
  address_line2 VARCHAR(255),
  city VARCHAR(100) NOT NULL,
  province VARCHAR(100) NOT NULL,
  postal_code VARCHAR(20),
  country VARCHAR(100) DEFAULT 'Papua New Guinea',
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  mobile VARCHAR(50),
  tax_number VARCHAR(50) NOT NULL,
  business_registration_number VARCHAR(50) NOT NULL,
  incorporation_date DATE,
  bank_name VARCHAR(100) NOT NULL,
  bank_branch VARCHAR(100) NOT NULL,
  bank_account_name VARCHAR(255) NOT NULL,
  bank_account_number VARCHAR(50) NOT NULL,
  bank_swift_code VARCHAR(20),
  categories TEXT[] DEFAULT '{}',
  unspsc_codes TEXT[] DEFAULT '{}',
  created_by UUID REFERENCES users(id),
  updated_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  is_deleted BOOLEAN DEFAULT false
);

-- =============================================================================
-- SUPPLIER CLASSIFICATIONS
-- =============================================================================

CREATE TABLE supplier_classifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL, -- SME, WOMEN_OWNED, LANDOWNER, etc.
  certification_date DATE NOT NULL,
  expiry_date DATE,
  certificate_url TEXT,
  is_verified BOOLEAN DEFAULT false,
  verified_by UUID REFERENCES users(id),
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- SUPPLIER QUALIFICATIONS
-- =============================================================================

CREATE TABLE supplier_qualifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
  category VARCHAR(100) NOT NULL,
  level VARCHAR(20) NOT NULL, -- BASIC, STANDARD, ADVANCED
  max_contract_value_amount DECIMAL(15,2) NOT NULL,
  max_contract_value_currency VARCHAR(3) DEFAULT 'PGK',
  valid_from DATE NOT NULL,
  valid_to DATE NOT NULL,
  documents TEXT[] DEFAULT '{}',
  status VARCHAR(20) DEFAULT 'PENDING',
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  is_deleted BOOLEAN DEFAULT false
);

-- =============================================================================
-- ANNUAL PROCUREMENT PLANS
-- =============================================================================

CREATE TABLE annual_procurement_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  fiscal_year INTEGER NOT NULL,
  organization_id UUID NOT NULL REFERENCES organizations(id),
  status plan_status DEFAULT 'DRAFT',
  total_budget_amount DECIMAL(15,2) NOT NULL,
  total_budget_currency VARCHAR(3) DEFAULT 'PGK',
  created_by UUID NOT NULL REFERENCES users(id),
  updated_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  is_deleted BOOLEAN DEFAULT false,
  UNIQUE(fiscal_year, organization_id)
);

-- =============================================================================
-- PROCUREMENT PLAN ITEMS
-- =============================================================================

CREATE TABLE procurement_plan_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_id UUID NOT NULL REFERENCES annual_procurement_plans(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  category VARCHAR(100) NOT NULL,
  unspsc_code VARCHAR(20),
  estimated_amount DECIMAL(15,2) NOT NULL,
  estimated_currency VARCHAR(3) DEFAULT 'PGK',
  procurement_method procurement_method NOT NULL,
  expected_quarter INTEGER NOT NULL CHECK (expected_quarter BETWEEN 1 AND 4),
  justification TEXT NOT NULL,
  linked_tender_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  is_deleted BOOLEAN DEFAULT false
);

-- =============================================================================
-- TENDERS
-- =============================================================================

CREATE TABLE tenders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reference_number VARCHAR(50) UNIQUE NOT NULL,
  title VARCHAR(500) NOT NULL,
  description TEXT NOT NULL,
  organization_id UUID NOT NULL REFERENCES organizations(id),
  procurement_method procurement_method NOT NULL,
  status tender_status DEFAULT 'DRAFT',
  category VARCHAR(100) NOT NULL,
  unspsc_code VARCHAR(20),
  estimated_amount DECIMAL(15,2) NOT NULL,
  estimated_currency VARCHAR(3) DEFAULT 'PGK',
  submission_deadline TIMESTAMPTZ NOT NULL,
  opening_date TIMESTAMPTZ NOT NULL,
  validity_period INTEGER DEFAULT 90,
  bid_security_required BOOLEAN DEFAULT false,
  bid_security_amount DECIMAL(15,2),
  bid_security_currency VARCHAR(3),
  linked_plan_item_id UUID REFERENCES procurement_plan_items(id),
  created_by UUID NOT NULL REFERENCES users(id),
  updated_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  is_deleted BOOLEAN DEFAULT false
);

-- Add foreign key after tenders table exists
ALTER TABLE procurement_plan_items
  ADD CONSTRAINT fk_linked_tender
  FOREIGN KEY (linked_tender_id) REFERENCES tenders(id);

-- =============================================================================
-- TENDER DOCUMENTS
-- =============================================================================

CREATE TABLE tender_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tender_id UUID NOT NULL REFERENCES tenders(id) ON DELETE CASCADE,
  type document_type NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  file_url TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  version INTEGER DEFAULT 1,
  is_public BOOLEAN DEFAULT true,
  hash VARCHAR(64) NOT NULL,
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  is_deleted BOOLEAN DEFAULT false
);

-- =============================================================================
-- EVALUATION CRITERIA
-- =============================================================================

CREATE TABLE evaluation_criteria (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tender_id UUID NOT NULL REFERENCES tenders(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(20) NOT NULL, -- PASS_FAIL, SCORED, WEIGHTED
  max_score INTEGER,
  weight DECIMAL(5,2),
  is_eliminatory BOOLEAN DEFAULT false,
  order_index INTEGER NOT NULL,
  parent_id UUID REFERENCES evaluation_criteria(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- TENDER CLARIFICATIONS
-- =============================================================================

CREATE TABLE tender_clarifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tender_id UUID NOT NULL REFERENCES tenders(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  question_by UUID REFERENCES users(id),
  question_date TIMESTAMPTZ DEFAULT NOW(),
  answer TEXT,
  answered_by UUID REFERENCES users(id),
  answer_date TIMESTAMPTZ,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- TENDER ADDENDA
-- =============================================================================

CREATE TABLE tender_addenda (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tender_id UUID NOT NULL REFERENCES tenders(id) ON DELETE CASCADE,
  number INTEGER NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  document_url TEXT,
  published_at TIMESTAMPTZ DEFAULT NOW(),
  extends_deadline BOOLEAN DEFAULT false,
  new_deadline TIMESTAMPTZ,
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- BIDS
-- =============================================================================

CREATE TABLE bids (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tender_id UUID NOT NULL REFERENCES tenders(id),
  supplier_id UUID NOT NULL REFERENCES suppliers(id),
  reference_number VARCHAR(50) UNIQUE NOT NULL,
  status bid_status DEFAULT 'DRAFT',
  submitted_at TIMESTAMPTZ,
  total_amount DECIMAL(15,2) NOT NULL,
  total_currency VARCHAR(3) DEFAULT 'PGK',
  validity_period INTEGER DEFAULT 90,
  -- Sealed bid encryption fields
  encrypted_data TEXT,
  encryption_iv TEXT,
  encryption_hash VARCHAR(64),
  encryption_algorithm VARCHAR(20) DEFAULT 'AES-256-GCM',
  decrypted_at TIMESTAMPTZ,
  decrypted_by UUID REFERENCES users(id),
  version INTEGER DEFAULT 1,
  previous_version_id UUID REFERENCES bids(id),
  created_by UUID NOT NULL REFERENCES users(id),
  updated_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  is_deleted BOOLEAN DEFAULT false
);

-- =============================================================================
-- BID DOCUMENTS
-- =============================================================================

CREATE TABLE bid_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bid_id UUID NOT NULL REFERENCES bids(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL, -- TECHNICAL, FINANCIAL, QUALIFICATION, OTHER
  name VARCHAR(255) NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  hash VARCHAR(64) NOT NULL,
  is_encrypted BOOLEAN DEFAULT true,
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  is_deleted BOOLEAN DEFAULT false
);

-- =============================================================================
-- BID OPENING SESSIONS
-- =============================================================================

CREATE TABLE bid_opening_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tender_id UUID NOT NULL REFERENCES tenders(id),
  scheduled_at TIMESTAMPTZ NOT NULL,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  status VARCHAR(20) DEFAULT 'PENDING', -- PENDING, IN_PROGRESS, COMPLETED
  total_bids INTEGER DEFAULT 0,
  opened_bids INTEGER DEFAULT 0,
  venue TEXT,
  notes TEXT,
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- BID OPENING COMMITTEE
-- =============================================================================

CREATE TABLE bid_opening_committee (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES bid_opening_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id),
  role VARCHAR(50) NOT NULL,
  attended BOOLEAN DEFAULT false,
  attendance_time TIMESTAMPTZ,
  signature_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- EVALUATIONS
-- =============================================================================

CREATE TABLE evaluations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tender_id UUID NOT NULL REFERENCES tenders(id),
  status VARCHAR(20) DEFAULT 'PENDING', -- PENDING, IN_PROGRESS, COMPLETED, APPROVED
  evaluation_method VARCHAR(20) NOT NULL, -- LOWEST_PRICE, QUALITY_COST, QUALITY_ONLY
  technical_threshold DECIMAL(5,2),
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- EVALUATION COMMITTEE MEMBERS
-- =============================================================================

CREATE TABLE evaluation_committee_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  evaluation_id UUID NOT NULL REFERENCES evaluations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id),
  role VARCHAR(20) NOT NULL, -- CHAIR, MEMBER, SECRETARY, OBSERVER
  assigned_criteria UUID[],
  coi_declared BOOLEAN DEFAULT false,
  coi_has_conflict BOOLEAN,
  coi_details TEXT,
  coi_declaration_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- BID EVALUATIONS
-- =============================================================================

CREATE TABLE bid_evaluations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  evaluation_id UUID NOT NULL REFERENCES evaluations(id) ON DELETE CASCADE,
  bid_id UUID NOT NULL REFERENCES bids(id),
  is_responsive BOOLEAN,
  responsive_notes TEXT,
  technical_score DECIMAL(5,2),
  financial_score DECIMAL(5,2),
  combined_score DECIMAL(5,2),
  rank INTEGER,
  recommendation VARCHAR(20), -- AWARD, REJECT, STANDBY
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- CRITERIA SCORES
-- =============================================================================

CREATE TABLE criteria_scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bid_evaluation_id UUID NOT NULL REFERENCES bid_evaluations(id) ON DELETE CASCADE,
  criteria_id UUID NOT NULL REFERENCES evaluation_criteria(id),
  evaluator_id UUID NOT NULL REFERENCES users(id),
  score DECIMAL(5,2) NOT NULL,
  max_score DECIMAL(5,2) NOT NULL,
  comments TEXT,
  scored_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- CONTRACTS
-- =============================================================================

CREATE TABLE contracts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reference_number VARCHAR(50) UNIQUE NOT NULL,
  tender_id UUID NOT NULL REFERENCES tenders(id),
  bid_id UUID NOT NULL REFERENCES bids(id),
  supplier_id UUID NOT NULL REFERENCES suppliers(id),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  title VARCHAR(500) NOT NULL,
  description TEXT NOT NULL,
  status contract_status DEFAULT 'DRAFT',
  contract_type contract_type NOT NULL,
  value_amount DECIMAL(15,2) NOT NULL,
  value_currency VARCHAR(3) DEFAULT 'PGK',
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  signed_date DATE,
  effective_date DATE,
  completion_date DATE,
  performance_rating DECIMAL(3,2),
  created_by UUID NOT NULL REFERENCES users(id),
  updated_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  is_deleted BOOLEAN DEFAULT false
);

-- =============================================================================
-- CONTRACT MILESTONES
-- =============================================================================

CREATE TABLE contract_milestones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contract_id UUID NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
  number INTEGER NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  due_date DATE NOT NULL,
  completed_date DATE,
  deliverables TEXT[] DEFAULT '{}',
  payment_percentage DECIMAL(5,2),
  status milestone_status DEFAULT 'PENDING',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  is_deleted BOOLEAN DEFAULT false
);

-- =============================================================================
-- CONTRACT VARIATIONS
-- =============================================================================

CREATE TABLE contract_variations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contract_id UUID NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
  number INTEGER NOT NULL,
  type VARCHAR(50) NOT NULL, -- PRICE_ADJUSTMENT, SCOPE_CHANGE, TIME_EXTENSION, OTHER
  description TEXT NOT NULL,
  justification TEXT NOT NULL,
  original_value_amount DECIMAL(15,2) NOT NULL,
  original_value_currency VARCHAR(3) DEFAULT 'PGK',
  new_value_amount DECIMAL(15,2) NOT NULL,
  new_value_currency VARCHAR(3) DEFAULT 'PGK',
  original_end_date DATE,
  new_end_date DATE,
  status approval_status DEFAULT 'PENDING',
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- CONTRACT PAYMENTS
-- =============================================================================

CREATE TABLE contract_payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contract_id UUID NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
  milestone_id UUID REFERENCES contract_milestones(id),
  invoice_number VARCHAR(50) NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'PGK',
  due_date DATE NOT NULL,
  paid_date DATE,
  status VARCHAR(20) DEFAULT 'PENDING', -- PENDING, APPROVED, PAID, REJECTED
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- APPROVAL WORKFLOWS
-- =============================================================================

CREATE TABLE approval_workflows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity_type workflow_entity_type NOT NULL,
  entity_id UUID NOT NULL,
  entity_ref VARCHAR(100) NOT NULL,
  entity_title VARCHAR(500) NOT NULL,
  current_step INTEGER DEFAULT 1,
  total_steps INTEGER NOT NULL,
  status workflow_status DEFAULT 'IN_PROGRESS',
  requested_value DECIMAL(15,2),
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- APPROVAL STEPS
-- =============================================================================

CREATE TABLE approval_steps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workflow_id UUID NOT NULL REFERENCES approval_workflows(id) ON DELETE CASCADE,
  step_number INTEGER NOT NULL,
  title VARCHAR(255) NOT NULL,
  required_role VARCHAR(50) NOT NULL,
  assigned_to UUID REFERENCES users(id),
  assigned_to_name VARCHAR(200),
  status approval_status DEFAULT 'PENDING',
  comments TEXT,
  action_date TIMESTAMPTZ,
  due_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- AUDIT LOGS (Immutable)
-- =============================================================================

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  session_id VARCHAR(100) NOT NULL,
  action audit_action NOT NULL,
  entity_type VARCHAR(100) NOT NULL,
  entity_id VARCHAR(100) NOT NULL,
  previous_state JSONB,
  new_state JSONB,
  ip_address INET NOT NULL,
  user_agent TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Prevent updates and deletes on audit_logs
CREATE OR REPLACE FUNCTION prevent_audit_modification()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'Audit logs are immutable and cannot be modified or deleted';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER no_audit_update
  BEFORE UPDATE ON audit_logs
  FOR EACH ROW EXECUTE FUNCTION prevent_audit_modification();

CREATE TRIGGER no_audit_delete
  BEFORE DELETE ON audit_logs
  FOR EACH ROW EXECUTE FUNCTION prevent_audit_modification();

-- =============================================================================
-- AUCTIONS
-- =============================================================================

CREATE TABLE auctions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reference_number VARCHAR(50) UNIQUE NOT NULL,
  tender_id UUID REFERENCES tenders(id),
  type auction_type NOT NULL,
  title VARCHAR(500) NOT NULL,
  description TEXT NOT NULL,
  status auction_status DEFAULT 'SCHEDULED',
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  reserve_price_amount DECIMAL(15,2),
  reserve_price_currency VARCHAR(3) DEFAULT 'PGK',
  current_price_amount DECIMAL(15,2) NOT NULL,
  current_price_currency VARCHAR(3) DEFAULT 'PGK',
  minimum_decrement DECIMAL(15,2),
  winner_id UUID REFERENCES suppliers(id),
  created_by UUID NOT NULL REFERENCES users(id),
  updated_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  is_deleted BOOLEAN DEFAULT false
);

-- =============================================================================
-- AUCTION BIDS
-- =============================================================================

CREATE TABLE auction_bids (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auction_id UUID NOT NULL REFERENCES auctions(id) ON DELETE CASCADE,
  supplier_id UUID NOT NULL REFERENCES suppliers(id),
  price_amount DECIMAL(15,2) NOT NULL,
  price_currency VARCHAR(3) DEFAULT 'PGK',
  bid_time TIMESTAMPTZ DEFAULT NOW(),
  is_winning BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- ASSET DISPOSALS
-- =============================================================================

CREATE TABLE asset_disposals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reference_number VARCHAR(50) UNIQUE NOT NULL,
  title VARCHAR(500) NOT NULL,
  description TEXT NOT NULL,
  asset_type VARCHAR(100) NOT NULL,
  condition VARCHAR(20) NOT NULL, -- NEW, GOOD, FAIR, POOR, SCRAP
  reserve_price_amount DECIMAL(15,2) NOT NULL,
  reserve_price_currency VARCHAR(3) DEFAULT 'PGK',
  disposal_method VARCHAR(20) NOT NULL, -- AUCTION, TENDER, DIRECT_SALE, TRANSFER, DESTROY
  status VARCHAR(20) DEFAULT 'PENDING',
  auction_id UUID REFERENCES auctions(id),
  created_by UUID NOT NULL REFERENCES users(id),
  updated_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  is_deleted BOOLEAN DEFAULT false
);

-- =============================================================================
-- CATALOG ITEMS
-- =============================================================================

CREATE TABLE catalog_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  supplier_id UUID NOT NULL REFERENCES suppliers(id),
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(100) NOT NULL,
  unspsc_code VARCHAR(20) NOT NULL,
  unit_price_amount DECIMAL(15,2) NOT NULL,
  unit_price_currency VARCHAR(3) DEFAULT 'PGK',
  unit VARCHAR(50) NOT NULL,
  minimum_order_quantity INTEGER DEFAULT 1,
  lead_time_days INTEGER DEFAULT 7,
  specifications JSONB DEFAULT '{}',
  images TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  framework_agreement_id UUID,
  created_by UUID NOT NULL REFERENCES users(id),
  updated_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  is_deleted BOOLEAN DEFAULT false
);

-- =============================================================================
-- FRAMEWORK AGREEMENTS
-- =============================================================================

CREATE TABLE framework_agreements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reference_number VARCHAR(50) UNIQUE NOT NULL,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  supplier_id UUID NOT NULL REFERENCES suppliers(id),
  category VARCHAR(100) NOT NULL,
  status VARCHAR(20) DEFAULT 'DRAFT', -- DRAFT, ACTIVE, EXPIRED, SUSPENDED
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  max_value_amount DECIMAL(15,2) NOT NULL,
  max_value_currency VARCHAR(3) DEFAULT 'PGK',
  used_value_amount DECIMAL(15,2) DEFAULT 0,
  used_value_currency VARCHAR(3) DEFAULT 'PGK',
  item_count INTEGER DEFAULT 0,
  created_by UUID NOT NULL REFERENCES users(id),
  updated_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add foreign key for catalog items
ALTER TABLE catalog_items
  ADD CONSTRAINT fk_framework_agreement
  FOREIGN KEY (framework_agreement_id) REFERENCES framework_agreements(id);

-- =============================================================================
-- PURCHASE ORDERS
-- =============================================================================

CREATE TABLE purchase_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reference_number VARCHAR(50) UNIQUE NOT NULL,
  organization_id UUID NOT NULL REFERENCES organizations(id),
  supplier_id UUID NOT NULL REFERENCES suppliers(id),
  status purchase_order_status DEFAULT 'DRAFT',
  total_amount DECIMAL(15,2) NOT NULL,
  total_currency VARCHAR(3) DEFAULT 'PGK',
  delivery_address TEXT NOT NULL,
  delivery_date DATE,
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMPTZ,
  created_by UUID NOT NULL REFERENCES users(id),
  updated_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- PURCHASE ORDER ITEMS
-- =============================================================================

CREATE TABLE purchase_order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
  catalog_item_id UUID NOT NULL REFERENCES catalog_items(id),
  quantity INTEGER NOT NULL,
  unit_price_amount DECIMAL(15,2) NOT NULL,
  unit_price_currency VARCHAR(3) DEFAULT 'PGK',
  total_price_amount DECIMAL(15,2) NOT NULL,
  total_price_currency VARCHAR(3) DEFAULT 'PGK',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- SUPPLIER RATINGS
-- =============================================================================

CREATE TABLE supplier_ratings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  supplier_id UUID NOT NULL REFERENCES suppliers(id),
  order_id UUID REFERENCES purchase_orders(id),
  contract_id UUID REFERENCES contracts(id),
  quality_score DECIMAL(3,2) NOT NULL CHECK (quality_score BETWEEN 0 AND 5),
  delivery_score DECIMAL(3,2) NOT NULL CHECK (delivery_score BETWEEN 0 AND 5),
  price_score DECIMAL(3,2) NOT NULL CHECK (price_score BETWEEN 0 AND 5),
  overall_score DECIMAL(3,2) NOT NULL CHECK (overall_score BETWEEN 0 AND 5),
  comments TEXT,
  rated_by UUID NOT NULL REFERENCES users(id),
  rated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- NOTIFICATIONS
-- =============================================================================

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  type VARCHAR(20) NOT NULL, -- INFO, WARNING, ERROR, SUCCESS, ACTION_REQUIRED
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- INDEXES
-- =============================================================================

-- Users
CREATE INDEX idx_users_organization ON users(organization_id);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_email ON users(email);

-- Suppliers
CREATE INDEX idx_suppliers_status ON suppliers(status);
CREATE INDEX idx_suppliers_registration ON suppliers(registration_number);

-- Tenders
CREATE INDEX idx_tenders_status ON tenders(status);
CREATE INDEX idx_tenders_organization ON tenders(organization_id);
CREATE INDEX idx_tenders_deadline ON tenders(submission_deadline);
CREATE INDEX idx_tenders_reference ON tenders(reference_number);

-- Bids
CREATE INDEX idx_bids_tender ON bids(tender_id);
CREATE INDEX idx_bids_supplier ON bids(supplier_id);
CREATE INDEX idx_bids_status ON bids(status);

-- Contracts
CREATE INDEX idx_contracts_status ON contracts(status);
CREATE INDEX idx_contracts_supplier ON contracts(supplier_id);
CREATE INDEX idx_contracts_organization ON contracts(organization_id);

-- Audit logs
CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_action ON audit_logs(action);
CREATE INDEX idx_audit_created ON audit_logs(created_at DESC);

-- Workflows
CREATE INDEX idx_workflows_entity ON approval_workflows(entity_type, entity_id);
CREATE INDEX idx_workflows_status ON approval_workflows(status);

-- Notifications
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = false;

-- =============================================================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================================================

-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE annual_procurement_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenders ENABLE ROW LEVEL SECURITY;
ALTER TABLE bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Public read access to published tenders
CREATE POLICY "Public can view published tenders"
  ON tenders FOR SELECT
  USING (status IN ('PUBLISHED', 'OPEN_FOR_BIDDING', 'CLOSED', 'AWARDED'));

-- Suppliers can view their own bids
CREATE POLICY "Suppliers can view their own bids"
  ON bids FOR SELECT
  USING (
    supplier_id IN (
      SELECT id FROM suppliers WHERE user_id = auth.uid()
    )
  );

-- Users can view their own notifications
CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications"
  ON notifications FOR UPDATE
  USING (user_id = auth.uid());

-- =============================================================================
-- FUNCTIONS
-- =============================================================================

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables with updated_at
CREATE TRIGGER update_organizations_updated_at
  BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_suppliers_updated_at
  BEFORE UPDATE ON suppliers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_tenders_updated_at
  BEFORE UPDATE ON tenders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_bids_updated_at
  BEFORE UPDATE ON bids
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_contracts_updated_at
  BEFORE UPDATE ON contracts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_workflows_updated_at
  BEFORE UPDATE ON approval_workflows
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Function to generate reference numbers
CREATE OR REPLACE FUNCTION generate_reference_number(prefix TEXT, entity TEXT)
RETURNS TEXT AS $
DECLARE
  year_part TEXT;
  seq_num INTEGER;
  ref TEXT;
BEGIN
  year_part := EXTRACT(YEAR FROM NOW())::TEXT;
  seq_num := 1;

  -- Get next sequence number based on entity type
  IF entity = 'tender' THEN
    SELECT COALESCE(MAX(
      CAST(SUBSTRING(reference_number FROM LENGTH(prefix || '/' || year_part || '/') + 1) AS INTEGER)
    ), 0) + 1
    INTO seq_num
    FROM tenders
    WHERE reference_number LIKE prefix || '/' || year_part || '/%';
  ELSIF entity = 'contract' THEN
    SELECT COALESCE(MAX(
      CAST(SUBSTRING(reference_number FROM LENGTH(prefix || '/' || year_part || '/') + 1) AS INTEGER)
    ), 0) + 1
    INTO seq_num
    FROM contracts
    WHERE reference_number LIKE prefix || '/' || year_part || '/%';
  ELSIF entity = 'bid' THEN
    SELECT COALESCE(MAX(
      CAST(SUBSTRING(reference_number FROM LENGTH(prefix || '/' || year_part || '/') + 1) AS INTEGER)
    ), 0) + 1
    INTO seq_num
    FROM bids
    WHERE reference_number LIKE prefix || '/' || year_part || '/%';
  END IF;

  -- Handle NULL case
  IF seq_num IS NULL THEN
    seq_num := 1;
  END IF;

  ref := prefix || '/' || year_part || '/' || LPAD(seq_num::TEXT, 4, '0');
  RETURN ref;
END;
$ LANGUAGE plpgsql;

-- =============================================================================
-- INITIAL DATA
-- =============================================================================

-- Insert National Procurement Commission
INSERT INTO organizations (id, name, code, type, address_line1, city, province, email)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'National Procurement Commission',
  'NPC',
  'NPC',
  'Vulupindi Haus, Waigani',
  'Port Moresby',
  'NCD',
  'info@npc.gov.pg'
);

-- Insert sample government agencies
INSERT INTO organizations (name, code, type, address_line1, city, province, email) VALUES
  ('Department of Finance', 'DOF', 'GOVERNMENT_AGENCY', 'Vulupindi Haus, Waigani', 'Port Moresby', 'NCD', 'info@finance.gov.pg'),
  ('Department of Health', 'DOH', 'GOVERNMENT_AGENCY', 'Health Building, Waigani', 'Port Moresby', 'NCD', 'info@health.gov.pg'),
  ('Department of Education', 'DOE', 'GOVERNMENT_AGENCY', 'Education Building, Waigani', 'Port Moresby', 'NCD', 'info@education.gov.pg'),
  ('Department of Works', 'DOW', 'GOVERNMENT_AGENCY', 'Works Building, Waigani', 'Port Moresby', 'NCD', 'info@works.gov.pg'),
  ('Department of Transport', 'DOT', 'GOVERNMENT_AGENCY', 'Transport Building, Waigani', 'Port Moresby', 'NCD', 'info@transport.gov.pg');

COMMENT ON TABLE organizations IS 'Government agencies and organizations using the eGP system';
COMMENT ON TABLE users IS 'System users linked to Supabase auth';
COMMENT ON TABLE suppliers IS 'Registered suppliers/vendors';
COMMENT ON TABLE tenders IS 'Procurement tenders/opportunities';
COMMENT ON TABLE bids IS 'Supplier bid submissions';
COMMENT ON TABLE contracts IS 'Awarded contracts';
COMMENT ON TABLE audit_logs IS 'Immutable audit trail of all system actions';
