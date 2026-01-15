-- PNG eGP System - Safe Idempotent Migration
-- This script can be run multiple times without errors
-- Version: 1.0

-- =============================================================================
-- EXTENSIONS
-- =============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================================
-- HELPER: Create type if not exists
-- =============================================================================
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE user_role AS ENUM ('SYSTEM_ADMIN','NPC_ADMIN','NPC_OFFICER','AGENCY_HEAD','PROCUREMENT_OFFICER','FINANCE_OFFICER','EVALUATOR','AUDITOR','SUPPLIER','PUBLIC_VIEWER');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'organization_type') THEN
    CREATE TYPE organization_type AS ENUM ('GOVERNMENT_AGENCY','STATE_OWNED_ENTERPRISE','SUPPLIER','NPC');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'plan_status') THEN
    CREATE TYPE plan_status AS ENUM ('DRAFT','SUBMITTED','APPROVED','PUBLISHED');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'procurement_method') THEN
    CREATE TYPE procurement_method AS ENUM ('OPEN_TENDER','RESTRICTED_TENDER','REQUEST_FOR_QUOTATION','DIRECT_PROCUREMENT','FRAMEWORK_AGREEMENT','EMERGENCY_PROCUREMENT');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tender_status') THEN
    CREATE TYPE tender_status AS ENUM ('DRAFT','PENDING_APPROVAL','APPROVED','PUBLISHED','OPEN_FOR_BIDDING','CLOSED','UNDER_EVALUATION','EVALUATED','AWARDED','CANCELLED');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'bid_status') THEN
    CREATE TYPE bid_status AS ENUM ('DRAFT','SUBMITTED','WITHDRAWN','UNDER_EVALUATION','RESPONSIVE','NON_RESPONSIVE','AWARDED','REJECTED');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'supplier_type') THEN
    CREATE TYPE supplier_type AS ENUM ('COMPANY','SOLE_TRADER','PARTNERSHIP','JOINT_VENTURE');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'supplier_status') THEN
    CREATE TYPE supplier_status AS ENUM ('PENDING','ACTIVE','SUSPENDED','BLACKLISTED','INACTIVE');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'contract_status') THEN
    CREATE TYPE contract_status AS ENUM ('DRAFT','PENDING_SIGNATURE','ACTIVE','SUSPENDED','COMPLETED','TERMINATED');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'contract_type') THEN
    CREATE TYPE contract_type AS ENUM ('GOODS','WORKS','SERVICES','CONSULTANCY');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'milestone_status') THEN
    CREATE TYPE milestone_status AS ENUM ('PENDING','IN_PROGRESS','COMPLETED','DELAYED','CANCELLED');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'workflow_entity_type') THEN
    CREATE TYPE workflow_entity_type AS ENUM ('ANNUAL_PLAN','TENDER','PURCHASE_ORDER','AWARD','CONTRACT','VARIATION');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'workflow_status') THEN
    CREATE TYPE workflow_status AS ENUM ('IN_PROGRESS','APPROVED','REJECTED','RETURNED');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'approval_status') THEN
    CREATE TYPE approval_status AS ENUM ('PENDING','APPROVED','REJECTED','RETURNED');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'audit_action') THEN
    CREATE TYPE audit_action AS ENUM ('CREATE','READ','UPDATE','DELETE','APPROVE','REJECT','SUBMIT','PUBLISH','AWARD','SIGN','LOGIN','LOGOUT');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'auction_type') THEN
    CREATE TYPE auction_type AS ENUM ('FORWARD','REVERSE');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'auction_status') THEN
    CREATE TYPE auction_status AS ENUM ('SCHEDULED','OPEN','CLOSED','CANCELLED');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'document_type') THEN
    CREATE TYPE document_type AS ENUM ('TENDER_NOTICE','TENDER_DOCUMENT','TECHNICAL_SPECIFICATION','BID_DOCUMENT','EVALUATION_REPORT','CONTRACT','AMENDMENT','INVOICE','DELIVERY_NOTE','CERTIFICATE');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'purchase_order_status') THEN
    CREATE TYPE purchase_order_status AS ENUM ('DRAFT','PENDING_APPROVAL','APPROVED','ORDERED','DELIVERED','COMPLETED','CANCELLED');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'subscription_plan_type') THEN
    CREATE TYPE subscription_plan_type AS ENUM ('BASIC','STANDARD','PREMIUM','ENTERPRISE');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'subscription_status') THEN
    CREATE TYPE subscription_status AS ENUM ('PENDING','ACTIVE','EXPIRED','CANCELLED','SUSPENDED');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_status') THEN
    CREATE TYPE payment_status AS ENUM ('PENDING','COMPLETED','FAILED','REFUNDED');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_method') THEN
    CREATE TYPE payment_method AS ENUM ('BANK_TRANSFER','MOBILE_MONEY','CREDIT_CARD','CASH','CHEQUE');
  END IF;
END $$;

-- =============================================================================
-- CORE TABLES
-- =============================================================================

-- ORGANIZATIONS
CREATE TABLE IF NOT EXISTS organizations (
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

-- USERS
CREATE TABLE IF NOT EXISTS users (
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

-- SUPPLIERS
CREATE TABLE IF NOT EXISTS suppliers (
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

-- SUPPLIER CLASSIFICATIONS
CREATE TABLE IF NOT EXISTS supplier_classifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  certification_date DATE NOT NULL,
  expiry_date DATE,
  certificate_url TEXT,
  is_verified BOOLEAN DEFAULT false,
  verified_by UUID REFERENCES users(id),
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- SUPPLIER QUALIFICATIONS
CREATE TABLE IF NOT EXISTS supplier_qualifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
  category VARCHAR(100) NOT NULL,
  level VARCHAR(20) NOT NULL,
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

-- ANNUAL PROCUREMENT PLANS
CREATE TABLE IF NOT EXISTS annual_procurement_plans (
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

-- PROCUREMENT PLAN ITEMS
CREATE TABLE IF NOT EXISTS procurement_plan_items (
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

-- TENDERS
CREATE TABLE IF NOT EXISTS tenders (
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

-- Add foreign key if not exists
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_linked_tender') THEN
    ALTER TABLE procurement_plan_items ADD CONSTRAINT fk_linked_tender FOREIGN KEY (linked_tender_id) REFERENCES tenders(id);
  END IF;
END $$;

-- TENDER DOCUMENTS
CREATE TABLE IF NOT EXISTS tender_documents (
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

-- EVALUATION CRITERIA
CREATE TABLE IF NOT EXISTS evaluation_criteria (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tender_id UUID NOT NULL REFERENCES tenders(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(20) NOT NULL,
  max_score INTEGER,
  weight DECIMAL(5,2),
  is_eliminatory BOOLEAN DEFAULT false,
  order_index INTEGER NOT NULL,
  parent_id UUID REFERENCES evaluation_criteria(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- TENDER CLARIFICATIONS
CREATE TABLE IF NOT EXISTS tender_clarifications (
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

-- TENDER ADDENDA
CREATE TABLE IF NOT EXISTS tender_addenda (
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

-- BIDS
CREATE TABLE IF NOT EXISTS bids (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tender_id UUID NOT NULL REFERENCES tenders(id),
  supplier_id UUID NOT NULL REFERENCES suppliers(id),
  reference_number VARCHAR(50) UNIQUE NOT NULL,
  status bid_status DEFAULT 'DRAFT',
  submitted_at TIMESTAMPTZ,
  total_amount DECIMAL(15,2) NOT NULL,
  total_currency VARCHAR(3) DEFAULT 'PGK',
  validity_period INTEGER DEFAULT 90,
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

-- BID DOCUMENTS
CREATE TABLE IF NOT EXISTS bid_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bid_id UUID NOT NULL REFERENCES bids(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL,
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

-- BID OPENING SESSIONS
CREATE TABLE IF NOT EXISTS bid_opening_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tender_id UUID NOT NULL REFERENCES tenders(id),
  scheduled_at TIMESTAMPTZ NOT NULL,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  status VARCHAR(20) DEFAULT 'PENDING',
  total_bids INTEGER DEFAULT 0,
  opened_bids INTEGER DEFAULT 0,
  venue TEXT,
  notes TEXT,
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- BID OPENING COMMITTEE
CREATE TABLE IF NOT EXISTS bid_opening_committee (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES bid_opening_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id),
  role VARCHAR(50) NOT NULL,
  attended BOOLEAN DEFAULT false,
  attendance_time TIMESTAMPTZ,
  signature_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- EVALUATIONS
CREATE TABLE IF NOT EXISTS evaluations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tender_id UUID NOT NULL REFERENCES tenders(id),
  status VARCHAR(20) DEFAULT 'PENDING',
  evaluation_method VARCHAR(20) NOT NULL,
  technical_threshold DECIMAL(5,2),
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- EVALUATION COMMITTEE MEMBERS
CREATE TABLE IF NOT EXISTS evaluation_committee_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  evaluation_id UUID NOT NULL REFERENCES evaluations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id),
  role VARCHAR(20) NOT NULL,
  assigned_criteria UUID[],
  coi_declared BOOLEAN DEFAULT false,
  coi_has_conflict BOOLEAN,
  coi_details TEXT,
  coi_declaration_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- BID EVALUATIONS
CREATE TABLE IF NOT EXISTS bid_evaluations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  evaluation_id UUID NOT NULL REFERENCES evaluations(id) ON DELETE CASCADE,
  bid_id UUID NOT NULL REFERENCES bids(id),
  is_responsive BOOLEAN,
  responsive_notes TEXT,
  technical_score DECIMAL(5,2),
  financial_score DECIMAL(5,2),
  combined_score DECIMAL(5,2),
  rank INTEGER,
  recommendation VARCHAR(20),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- CRITERIA SCORES
CREATE TABLE IF NOT EXISTS criteria_scores (
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

-- CONTRACTS
CREATE TABLE IF NOT EXISTS contracts (
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

-- CONTRACT MILESTONES
CREATE TABLE IF NOT EXISTS contract_milestones (
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

-- CONTRACT VARIATIONS
CREATE TABLE IF NOT EXISTS contract_variations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contract_id UUID NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
  number INTEGER NOT NULL,
  type VARCHAR(50) NOT NULL,
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

-- CONTRACT PAYMENTS
CREATE TABLE IF NOT EXISTS contract_payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contract_id UUID NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
  milestone_id UUID REFERENCES contract_milestones(id),
  invoice_number VARCHAR(50) NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'PGK',
  due_date DATE NOT NULL,
  paid_date DATE,
  status VARCHAR(20) DEFAULT 'PENDING',
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- APPROVAL WORKFLOWS
CREATE TABLE IF NOT EXISTS approval_workflows (
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

-- APPROVAL STEPS
CREATE TABLE IF NOT EXISTS approval_steps (
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

-- AUDIT LOGS
CREATE TABLE IF NOT EXISTS audit_logs (
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

-- AUCTIONS
CREATE TABLE IF NOT EXISTS auctions (
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

-- AUCTION BIDS
CREATE TABLE IF NOT EXISTS auction_bids (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auction_id UUID NOT NULL REFERENCES auctions(id) ON DELETE CASCADE,
  supplier_id UUID NOT NULL REFERENCES suppliers(id),
  price_amount DECIMAL(15,2) NOT NULL,
  price_currency VARCHAR(3) DEFAULT 'PGK',
  bid_time TIMESTAMPTZ DEFAULT NOW(),
  is_winning BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ASSET DISPOSALS
CREATE TABLE IF NOT EXISTS asset_disposals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reference_number VARCHAR(50) UNIQUE NOT NULL,
  title VARCHAR(500) NOT NULL,
  description TEXT NOT NULL,
  asset_type VARCHAR(100) NOT NULL,
  condition VARCHAR(20) NOT NULL,
  reserve_price_amount DECIMAL(15,2) NOT NULL,
  reserve_price_currency VARCHAR(3) DEFAULT 'PGK',
  disposal_method VARCHAR(20) NOT NULL,
  status VARCHAR(20) DEFAULT 'PENDING',
  auction_id UUID REFERENCES auctions(id),
  created_by UUID NOT NULL REFERENCES users(id),
  updated_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  is_deleted BOOLEAN DEFAULT false
);

-- FRAMEWORK AGREEMENTS (create before catalog_items)
CREATE TABLE IF NOT EXISTS framework_agreements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reference_number VARCHAR(50) UNIQUE NOT NULL,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  supplier_id UUID NOT NULL REFERENCES suppliers(id),
  category VARCHAR(100) NOT NULL,
  status VARCHAR(20) DEFAULT 'DRAFT',
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

-- CATALOG ITEMS
CREATE TABLE IF NOT EXISTS catalog_items (
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
  framework_agreement_id UUID REFERENCES framework_agreements(id),
  created_by UUID NOT NULL REFERENCES users(id),
  updated_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  is_deleted BOOLEAN DEFAULT false
);

-- PURCHASE ORDERS
CREATE TABLE IF NOT EXISTS purchase_orders (
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

-- PURCHASE ORDER ITEMS
CREATE TABLE IF NOT EXISTS purchase_order_items (
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

-- SUPPLIER RATINGS
CREATE TABLE IF NOT EXISTS supplier_ratings (
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

-- NOTIFICATIONS
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  type VARCHAR(20) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- SUBSCRIPTION TABLES
-- =============================================================================

-- SUBSCRIPTION PLANS
CREATE TABLE IF NOT EXISTS subscription_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  code VARCHAR(20) UNIQUE NOT NULL,
  type subscription_plan_type NOT NULL,
  description TEXT,
  price_amount DECIMAL(15,2) NOT NULL,
  price_currency VARCHAR(3) DEFAULT 'PGK',
  duration_months INTEGER NOT NULL DEFAULT 12,
  max_active_bids INTEGER DEFAULT 10,
  max_tender_value DECIMAL(15,2),
  can_bid_on_goods BOOLEAN DEFAULT true,
  can_bid_on_works BOOLEAN DEFAULT true,
  can_bid_on_services BOOLEAN DEFAULT true,
  can_bid_on_consultancy BOOLEAN DEFAULT true,
  priority_support BOOLEAN DEFAULT false,
  featured_listing BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- SUPPLIER SUBSCRIPTIONS
CREATE TABLE IF NOT EXISTS supplier_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES subscription_plans(id),
  status subscription_status DEFAULT 'PENDING',
  start_date DATE,
  end_date DATE,
  auto_renew BOOLEAN DEFAULT false,
  bids_used INTEGER DEFAULT 0,
  payment_id UUID,
  notes TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- SUBSCRIPTION PAYMENTS
CREATE TABLE IF NOT EXISTS subscription_payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subscription_id UUID NOT NULL REFERENCES supplier_subscriptions(id) ON DELETE CASCADE,
  supplier_id UUID NOT NULL REFERENCES suppliers(id),
  amount DECIMAL(15,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'PGK',
  payment_method payment_method NOT NULL,
  status payment_status DEFAULT 'PENDING',
  transaction_reference VARCHAR(100),
  bank_reference VARCHAR(100),
  receipt_number VARCHAR(50),
  payment_date TIMESTAMPTZ,
  verified_date TIMESTAMPTZ,
  verified_by UUID REFERENCES users(id),
  proof_document_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add FK if not exists
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_subscription_payment') THEN
    ALTER TABLE supplier_subscriptions ADD CONSTRAINT fk_subscription_payment FOREIGN KEY (payment_id) REFERENCES subscription_payments(id);
  END IF;
END $$;

-- SUBSCRIPTION HISTORY
CREATE TABLE IF NOT EXISTS subscription_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subscription_id UUID NOT NULL REFERENCES supplier_subscriptions(id) ON DELETE CASCADE,
  action VARCHAR(50) NOT NULL,
  previous_status subscription_status,
  new_status subscription_status,
  previous_end_date DATE,
  new_end_date DATE,
  performed_by UUID REFERENCES users(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- INDEXES (CREATE IF NOT EXISTS not supported, use exception handling)
-- =============================================================================
DO $$ BEGIN
  CREATE INDEX idx_users_organization ON users(organization_id);
EXCEPTION WHEN duplicate_table THEN NULL; END $$;

DO $$ BEGIN
  CREATE INDEX idx_users_role ON users(role);
EXCEPTION WHEN duplicate_table THEN NULL; END $$;

DO $$ BEGIN
  CREATE INDEX idx_users_email ON users(email);
EXCEPTION WHEN duplicate_table THEN NULL; END $$;

DO $$ BEGIN
  CREATE INDEX idx_suppliers_status ON suppliers(status);
EXCEPTION WHEN duplicate_table THEN NULL; END $$;

DO $$ BEGIN
  CREATE INDEX idx_suppliers_registration ON suppliers(registration_number);
EXCEPTION WHEN duplicate_table THEN NULL; END $$;

DO $$ BEGIN
  CREATE INDEX idx_tenders_status ON tenders(status);
EXCEPTION WHEN duplicate_table THEN NULL; END $$;

DO $$ BEGIN
  CREATE INDEX idx_tenders_organization ON tenders(organization_id);
EXCEPTION WHEN duplicate_table THEN NULL; END $$;

DO $$ BEGIN
  CREATE INDEX idx_tenders_deadline ON tenders(submission_deadline);
EXCEPTION WHEN duplicate_table THEN NULL; END $$;

DO $$ BEGIN
  CREATE INDEX idx_tenders_reference ON tenders(reference_number);
EXCEPTION WHEN duplicate_table THEN NULL; END $$;

DO $$ BEGIN
  CREATE INDEX idx_bids_tender ON bids(tender_id);
EXCEPTION WHEN duplicate_table THEN NULL; END $$;

DO $$ BEGIN
  CREATE INDEX idx_bids_supplier ON bids(supplier_id);
EXCEPTION WHEN duplicate_table THEN NULL; END $$;

DO $$ BEGIN
  CREATE INDEX idx_bids_status ON bids(status);
EXCEPTION WHEN duplicate_table THEN NULL; END $$;

DO $$ BEGIN
  CREATE INDEX idx_contracts_status ON contracts(status);
EXCEPTION WHEN duplicate_table THEN NULL; END $$;

DO $$ BEGIN
  CREATE INDEX idx_contracts_supplier ON contracts(supplier_id);
EXCEPTION WHEN duplicate_table THEN NULL; END $$;

DO $$ BEGIN
  CREATE INDEX idx_contracts_organization ON contracts(organization_id);
EXCEPTION WHEN duplicate_table THEN NULL; END $$;

DO $$ BEGIN
  CREATE INDEX idx_audit_user ON audit_logs(user_id);
EXCEPTION WHEN duplicate_table THEN NULL; END $$;

DO $$ BEGIN
  CREATE INDEX idx_audit_entity ON audit_logs(entity_type, entity_id);
EXCEPTION WHEN duplicate_table THEN NULL; END $$;

DO $$ BEGIN
  CREATE INDEX idx_audit_action ON audit_logs(action);
EXCEPTION WHEN duplicate_table THEN NULL; END $$;

DO $$ BEGIN
  CREATE INDEX idx_audit_created ON audit_logs(created_at DESC);
EXCEPTION WHEN duplicate_table THEN NULL; END $$;

DO $$ BEGIN
  CREATE INDEX idx_workflows_entity ON approval_workflows(entity_type, entity_id);
EXCEPTION WHEN duplicate_table THEN NULL; END $$;

DO $$ BEGIN
  CREATE INDEX idx_workflows_status ON approval_workflows(status);
EXCEPTION WHEN duplicate_table THEN NULL; END $$;

DO $$ BEGIN
  CREATE INDEX idx_notifications_user ON notifications(user_id);
EXCEPTION WHEN duplicate_table THEN NULL; END $$;

DO $$ BEGIN
  CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = false;
EXCEPTION WHEN duplicate_table THEN NULL; END $$;

DO $$ BEGIN
  CREATE INDEX idx_subscriptions_supplier ON supplier_subscriptions(supplier_id);
EXCEPTION WHEN duplicate_table THEN NULL; END $$;

DO $$ BEGIN
  CREATE INDEX idx_subscriptions_status ON supplier_subscriptions(status);
EXCEPTION WHEN duplicate_table THEN NULL; END $$;

DO $$ BEGIN
  CREATE INDEX idx_subscriptions_end_date ON supplier_subscriptions(end_date);
EXCEPTION WHEN duplicate_table THEN NULL; END $$;

DO $$ BEGIN
  CREATE INDEX idx_subscription_payments_supplier ON subscription_payments(supplier_id);
EXCEPTION WHEN duplicate_table THEN NULL; END $$;

DO $$ BEGIN
  CREATE INDEX idx_subscription_payments_status ON subscription_payments(status);
EXCEPTION WHEN duplicate_table THEN NULL; END $$;

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================
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
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_history ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- RLS POLICIES (drop and recreate to avoid duplicates)
-- =============================================================================
DROP POLICY IF EXISTS "Public can view published tenders" ON tenders;
CREATE POLICY "Public can view published tenders" ON tenders FOR SELECT USING (status IN ('PUBLISHED', 'OPEN_FOR_BIDDING', 'CLOSED', 'AWARDED'));

DROP POLICY IF EXISTS "Suppliers can view their own bids" ON bids;
CREATE POLICY "Suppliers can view their own bids" ON bids FOR SELECT USING (supplier_id IN (SELECT id FROM suppliers WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
CREATE POLICY "Users can view their own notifications" ON notifications FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;
CREATE POLICY "Users can update their own notifications" ON notifications FOR UPDATE USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Public can view active subscription plans" ON subscription_plans;
CREATE POLICY "Public can view active subscription plans" ON subscription_plans FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Suppliers can view their own subscriptions" ON supplier_subscriptions;
CREATE POLICY "Suppliers can view their own subscriptions" ON supplier_subscriptions FOR SELECT USING (supplier_id IN (SELECT id FROM suppliers WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Suppliers can view their own payments" ON subscription_payments;
CREATE POLICY "Suppliers can view their own payments" ON subscription_payments FOR SELECT USING (supplier_id IN (SELECT id FROM suppliers WHERE user_id = auth.uid()));

-- =============================================================================
-- FUNCTIONS
-- =============================================================================
CREATE OR REPLACE FUNCTION update_updated_at() RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION prevent_audit_modification() RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'Audit logs are immutable and cannot be modified or deleted';
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION generate_reference_number(prefix TEXT, entity TEXT)
RETURNS TEXT AS $$
DECLARE
  year_part TEXT;
  seq_num INTEGER;
  ref TEXT;
BEGIN
  year_part := EXTRACT(YEAR FROM NOW())::TEXT;
  seq_num := 1;

  IF entity = 'tender' THEN
    SELECT COALESCE(MAX(CAST(SUBSTRING(reference_number FROM LENGTH(prefix || '/' || year_part || '/') + 1) AS INTEGER)), 0) + 1 INTO seq_num
    FROM tenders WHERE reference_number LIKE prefix || '/' || year_part || '/%';
  ELSIF entity = 'contract' THEN
    SELECT COALESCE(MAX(CAST(SUBSTRING(reference_number FROM LENGTH(prefix || '/' || year_part || '/') + 1) AS INTEGER)), 0) + 1 INTO seq_num
    FROM contracts WHERE reference_number LIKE prefix || '/' || year_part || '/%';
  ELSIF entity = 'bid' THEN
    SELECT COALESCE(MAX(CAST(SUBSTRING(reference_number FROM LENGTH(prefix || '/' || year_part || '/') + 1) AS INTEGER)), 0) + 1 INTO seq_num
    FROM bids WHERE reference_number LIKE prefix || '/' || year_part || '/%';
  END IF;

  IF seq_num IS NULL THEN seq_num := 1; END IF;
  ref := prefix || '/' || year_part || '/' || LPAD(seq_num::TEXT, 4, '0');
  RETURN ref;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION has_active_subscription(p_supplier_id UUID) RETURNS BOOLEAN AS $$
DECLARE has_subscription BOOLEAN;
BEGIN
  SELECT EXISTS(SELECT 1 FROM supplier_subscriptions WHERE supplier_id = p_supplier_id AND status = 'ACTIVE' AND end_date >= CURRENT_DATE) INTO has_subscription;
  RETURN has_subscription;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_current_subscription(p_supplier_id UUID)
RETURNS TABLE (subscription_id UUID, plan_name VARCHAR, plan_type subscription_plan_type, status subscription_status, start_date DATE, end_date DATE, days_remaining INTEGER, max_active_bids INTEGER, bids_used INTEGER, bids_remaining INTEGER) AS $$
BEGIN
  RETURN QUERY
  SELECT ss.id, sp.name, sp.type, ss.status, ss.start_date, ss.end_date, (ss.end_date - CURRENT_DATE)::INTEGER, sp.max_active_bids, ss.bids_used, (sp.max_active_bids - ss.bids_used)
  FROM supplier_subscriptions ss JOIN subscription_plans sp ON ss.plan_id = sp.id
  WHERE ss.supplier_id = p_supplier_id AND ss.status = 'ACTIVE' AND ss.end_date >= CURRENT_DATE
  ORDER BY ss.end_date DESC LIMIT 1;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION activate_subscription(p_subscription_id UUID, p_payment_id UUID, p_verified_by UUID) RETURNS BOOLEAN AS $$
DECLARE v_plan_duration INTEGER; v_current_status subscription_status;
BEGIN
  SELECT status INTO v_current_status FROM supplier_subscriptions WHERE id = p_subscription_id;
  SELECT sp.duration_months INTO v_plan_duration FROM supplier_subscriptions ss JOIN subscription_plans sp ON ss.plan_id = sp.id WHERE ss.id = p_subscription_id;
  UPDATE supplier_subscriptions SET status = 'ACTIVE', start_date = CURRENT_DATE, end_date = CURRENT_DATE + (v_plan_duration || ' months')::INTERVAL, payment_id = p_payment_id, updated_at = NOW() WHERE id = p_subscription_id;
  UPDATE subscription_payments SET status = 'COMPLETED', verified_date = NOW(), verified_by = p_verified_by, updated_at = NOW() WHERE id = p_payment_id;
  INSERT INTO subscription_history (subscription_id, action, previous_status, new_status, new_end_date, performed_by, notes) VALUES (p_subscription_id, 'ACTIVATED', v_current_status, 'ACTIVE', CURRENT_DATE + (v_plan_duration || ' months')::INTERVAL, p_verified_by, 'Subscription activated after payment verification');
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- TRIGGERS (drop and recreate)
-- =============================================================================
DROP TRIGGER IF EXISTS no_audit_update ON audit_logs;
CREATE TRIGGER no_audit_update BEFORE UPDATE ON audit_logs FOR EACH ROW EXECUTE FUNCTION prevent_audit_modification();

DROP TRIGGER IF EXISTS no_audit_delete ON audit_logs;
CREATE TRIGGER no_audit_delete BEFORE DELETE ON audit_logs FOR EACH ROW EXECUTE FUNCTION prevent_audit_modification();

DROP TRIGGER IF EXISTS update_organizations_updated_at ON organizations;
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_suppliers_updated_at ON suppliers;
CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON suppliers FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_tenders_updated_at ON tenders;
CREATE TRIGGER update_tenders_updated_at BEFORE UPDATE ON tenders FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_bids_updated_at ON bids;
CREATE TRIGGER update_bids_updated_at BEFORE UPDATE ON bids FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_contracts_updated_at ON contracts;
CREATE TRIGGER update_contracts_updated_at BEFORE UPDATE ON contracts FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_workflows_updated_at ON approval_workflows;
CREATE TRIGGER update_workflows_updated_at BEFORE UPDATE ON approval_workflows FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_subscription_plans_updated_at ON subscription_plans;
CREATE TRIGGER update_subscription_plans_updated_at BEFORE UPDATE ON subscription_plans FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_supplier_subscriptions_updated_at ON supplier_subscriptions;
CREATE TRIGGER update_supplier_subscriptions_updated_at BEFORE UPDATE ON supplier_subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_subscription_payments_updated_at ON subscription_payments;
CREATE TRIGGER update_subscription_payments_updated_at BEFORE UPDATE ON subscription_payments FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =============================================================================
-- INITIAL DATA (insert only if not exists)
-- =============================================================================

-- Insert NPC organization if not exists
INSERT INTO organizations (id, name, code, type, address_line1, city, province, email)
SELECT '00000000-0000-0000-0000-000000000001', 'National Procurement Commission', 'NPC', 'NPC', 'Vulupindi Haus, Waigani', 'Port Moresby', 'NCD', 'info@npc.gov.pg'
WHERE NOT EXISTS (SELECT 1 FROM organizations WHERE code = 'NPC');

-- Insert government agencies if not exist
INSERT INTO organizations (name, code, type, address_line1, city, province, email)
SELECT 'Department of Finance', 'DOF', 'GOVERNMENT_AGENCY', 'Vulupindi Haus, Waigani', 'Port Moresby', 'NCD', 'info@finance.gov.pg'
WHERE NOT EXISTS (SELECT 1 FROM organizations WHERE code = 'DOF');

INSERT INTO organizations (name, code, type, address_line1, city, province, email)
SELECT 'Department of Health', 'DOH', 'GOVERNMENT_AGENCY', 'Health Building, Waigani', 'Port Moresby', 'NCD', 'info@health.gov.pg'
WHERE NOT EXISTS (SELECT 1 FROM organizations WHERE code = 'DOH');

INSERT INTO organizations (name, code, type, address_line1, city, province, email)
SELECT 'Department of Education', 'DOE', 'GOVERNMENT_AGENCY', 'Education Building, Waigani', 'Port Moresby', 'NCD', 'info@education.gov.pg'
WHERE NOT EXISTS (SELECT 1 FROM organizations WHERE code = 'DOE');

INSERT INTO organizations (name, code, type, address_line1, city, province, email)
SELECT 'Department of Works', 'DOW', 'GOVERNMENT_AGENCY', 'Works Building, Waigani', 'Port Moresby', 'NCD', 'info@works.gov.pg'
WHERE NOT EXISTS (SELECT 1 FROM organizations WHERE code = 'DOW');

INSERT INTO organizations (name, code, type, address_line1, city, province, email)
SELECT 'Department of Transport', 'DOT', 'GOVERNMENT_AGENCY', 'Transport Building, Waigani', 'Port Moresby', 'NCD', 'info@transport.gov.pg'
WHERE NOT EXISTS (SELECT 1 FROM organizations WHERE code = 'DOT');

-- Insert subscription plans if not exist
INSERT INTO subscription_plans (name, code, type, description, price_amount, duration_months, max_active_bids, max_tender_value, can_bid_on_goods, can_bid_on_works, can_bid_on_services, can_bid_on_consultancy, priority_support, featured_listing, sort_order)
SELECT 'Basic', 'BASIC', 'BASIC', 'Entry-level subscription for small businesses. Bid on goods and services tenders up to K500,000.', 2500.00, 12, 5, 500000.00, true, false, true, false, false, false, 1
WHERE NOT EXISTS (SELECT 1 FROM subscription_plans WHERE code = 'BASIC');

INSERT INTO subscription_plans (name, code, type, description, price_amount, duration_months, max_active_bids, max_tender_value, can_bid_on_goods, can_bid_on_works, can_bid_on_services, can_bid_on_consultancy, priority_support, featured_listing, sort_order)
SELECT 'Standard', 'STANDARD', 'STANDARD', 'For established businesses. Bid on all tender types up to K2,000,000. Includes priority support.', 5000.00, 12, 15, 2000000.00, true, true, true, true, true, false, 2
WHERE NOT EXISTS (SELECT 1 FROM subscription_plans WHERE code = 'STANDARD');

INSERT INTO subscription_plans (name, code, type, description, price_amount, duration_months, max_active_bids, max_tender_value, can_bid_on_goods, can_bid_on_works, can_bid_on_services, can_bid_on_consultancy, priority_support, featured_listing, sort_order)
SELECT 'Premium', 'PREMIUM', 'PREMIUM', 'For medium enterprises. Unlimited tender value access with featured listing.', 10000.00, 12, 50, NULL, true, true, true, true, true, true, 3
WHERE NOT EXISTS (SELECT 1 FROM subscription_plans WHERE code = 'PREMIUM');

INSERT INTO subscription_plans (name, code, type, description, price_amount, duration_months, max_active_bids, max_tender_value, can_bid_on_goods, can_bid_on_works, can_bid_on_services, can_bid_on_consultancy, priority_support, featured_listing, sort_order)
SELECT 'Enterprise', 'ENTERPRISE', 'ENTERPRISE', 'For large corporations and joint ventures. Unlimited access with dedicated account manager.', 25000.00, 12, NULL, NULL, true, true, true, true, true, true, 4
WHERE NOT EXISTS (SELECT 1 FROM subscription_plans WHERE code = 'ENTERPRISE');

-- =============================================================================
-- TABLE COMMENTS
-- =============================================================================
COMMENT ON TABLE organizations IS 'Government agencies and organizations using the eGP system';
COMMENT ON TABLE users IS 'System users linked to Supabase auth';
COMMENT ON TABLE suppliers IS 'Registered suppliers/vendors';
COMMENT ON TABLE tenders IS 'Procurement tenders/opportunities';
COMMENT ON TABLE bids IS 'Supplier bid submissions';
COMMENT ON TABLE contracts IS 'Awarded contracts';
COMMENT ON TABLE audit_logs IS 'Immutable audit trail of all system actions';
COMMENT ON TABLE subscription_plans IS 'Available subscription plans for suppliers';
COMMENT ON TABLE supplier_subscriptions IS 'Supplier subscription records';
COMMENT ON TABLE subscription_payments IS 'Payment records for subscriptions';
COMMENT ON TABLE subscription_history IS 'Audit trail for subscription changes';

-- =============================================================================
-- STORAGE BUCKETS (optional - run separately if needed)
-- =============================================================================
-- Uncomment below to create storage buckets
/*
INSERT INTO storage.buckets (id, name, public)
SELECT 'tender-documents', 'tender-documents', true
WHERE NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'tender-documents');

INSERT INTO storage.buckets (id, name, public)
SELECT 'bid-documents', 'bid-documents', false
WHERE NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'bid-documents');

INSERT INTO storage.buckets (id, name, public)
SELECT 'contract-documents', 'contract-documents', false
WHERE NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'contract-documents');

INSERT INTO storage.buckets (id, name, public)
SELECT 'supplier-documents', 'supplier-documents', false
WHERE NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'supplier-documents');

INSERT INTO storage.buckets (id, name, public)
SELECT 'profile-images', 'profile-images', true
WHERE NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'profile-images');

INSERT INTO storage.buckets (id, name, public)
SELECT 'payment-proofs', 'payment-proofs', false
WHERE NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'payment-proofs');
*/

-- =============================================================================
-- MIGRATION COMPLETE
-- =============================================================================
SELECT 'Migration completed successfully!' as status;
