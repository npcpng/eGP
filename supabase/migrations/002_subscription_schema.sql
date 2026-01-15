-- PNG eGP System - Subscription Schema
-- Version: 1.0
-- Purpose: Supplier/Vendor subscription management for bidding access

-- =============================================================================
-- ENUM TYPES FOR SUBSCRIPTIONS
-- =============================================================================

CREATE TYPE subscription_plan_type AS ENUM (
  'BASIC',
  'STANDARD',
  'PREMIUM',
  'ENTERPRISE'
);

CREATE TYPE subscription_status AS ENUM (
  'PENDING',
  'ACTIVE',
  'EXPIRED',
  'CANCELLED',
  'SUSPENDED'
);

CREATE TYPE payment_status AS ENUM (
  'PENDING',
  'COMPLETED',
  'FAILED',
  'REFUNDED'
);

CREATE TYPE payment_method AS ENUM (
  'BANK_TRANSFER',
  'MOBILE_MONEY',
  'CREDIT_CARD',
  'CASH',
  'CHEQUE'
);

-- =============================================================================
-- SUBSCRIPTION PLANS TABLE
-- =============================================================================

CREATE TABLE subscription_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  code VARCHAR(20) UNIQUE NOT NULL,
  type subscription_plan_type NOT NULL,
  description TEXT,
  -- Pricing
  price_amount DECIMAL(15,2) NOT NULL,
  price_currency VARCHAR(3) DEFAULT 'PGK',
  -- Duration
  duration_months INTEGER NOT NULL DEFAULT 12,
  -- Features/Limits
  max_active_bids INTEGER DEFAULT 10,
  max_tender_value DECIMAL(15,2), -- Maximum tender value they can bid on (NULL = unlimited)
  can_bid_on_goods BOOLEAN DEFAULT true,
  can_bid_on_works BOOLEAN DEFAULT true,
  can_bid_on_services BOOLEAN DEFAULT true,
  can_bid_on_consultancy BOOLEAN DEFAULT true,
  priority_support BOOLEAN DEFAULT false,
  featured_listing BOOLEAN DEFAULT false,
  -- Status
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- SUPPLIER SUBSCRIPTIONS TABLE
-- =============================================================================

CREATE TABLE supplier_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES subscription_plans(id),
  -- Status and dates
  status subscription_status DEFAULT 'PENDING',
  start_date DATE,
  end_date DATE,
  -- Auto-renewal
  auto_renew BOOLEAN DEFAULT false,
  -- Tracking
  bids_used INTEGER DEFAULT 0,
  -- Payment reference
  payment_id UUID,
  -- Metadata
  notes TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- SUBSCRIPTION PAYMENTS TABLE
-- =============================================================================

CREATE TABLE subscription_payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subscription_id UUID NOT NULL REFERENCES supplier_subscriptions(id) ON DELETE CASCADE,
  supplier_id UUID NOT NULL REFERENCES suppliers(id),
  -- Payment details
  amount DECIMAL(15,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'PGK',
  payment_method payment_method NOT NULL,
  -- Status
  status payment_status DEFAULT 'PENDING',
  -- Transaction info
  transaction_reference VARCHAR(100),
  bank_reference VARCHAR(100),
  receipt_number VARCHAR(50),
  -- Dates
  payment_date TIMESTAMPTZ,
  verified_date TIMESTAMPTZ,
  verified_by UUID REFERENCES users(id),
  -- Proof of payment
  proof_document_url TEXT,
  -- Notes
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add payment_id foreign key to subscriptions
ALTER TABLE supplier_subscriptions
  ADD CONSTRAINT fk_subscription_payment
  FOREIGN KEY (payment_id) REFERENCES subscription_payments(id);

-- =============================================================================
-- SUBSCRIPTION HISTORY TABLE (for audit)
-- =============================================================================

CREATE TABLE subscription_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subscription_id UUID NOT NULL REFERENCES supplier_subscriptions(id) ON DELETE CASCADE,
  action VARCHAR(50) NOT NULL, -- CREATED, ACTIVATED, RENEWED, EXPIRED, CANCELLED, SUSPENDED
  previous_status subscription_status,
  new_status subscription_status,
  previous_end_date DATE,
  new_end_date DATE,
  performed_by UUID REFERENCES users(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- INDEXES
-- =============================================================================

CREATE INDEX idx_subscriptions_supplier ON supplier_subscriptions(supplier_id);
CREATE INDEX idx_subscriptions_status ON supplier_subscriptions(status);
CREATE INDEX idx_subscriptions_end_date ON supplier_subscriptions(end_date);
CREATE INDEX idx_subscription_payments_supplier ON subscription_payments(supplier_id);
CREATE INDEX idx_subscription_payments_status ON subscription_payments(status);

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================

ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_history ENABLE ROW LEVEL SECURITY;

-- Public can view subscription plans
CREATE POLICY "Public can view active subscription plans"
  ON subscription_plans FOR SELECT
  USING (is_active = true);

-- Suppliers can view their own subscriptions
CREATE POLICY "Suppliers can view their own subscriptions"
  ON supplier_subscriptions FOR SELECT
  USING (
    supplier_id IN (
      SELECT id FROM suppliers WHERE user_id = auth.uid()
    )
  );

-- Suppliers can view their own payments
CREATE POLICY "Suppliers can view their own payments"
  ON subscription_payments FOR SELECT
  USING (
    supplier_id IN (
      SELECT id FROM suppliers WHERE user_id = auth.uid()
    )
  );

-- =============================================================================
-- FUNCTIONS
-- =============================================================================

-- Function to check if supplier has active subscription
CREATE OR REPLACE FUNCTION has_active_subscription(p_supplier_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  has_subscription BOOLEAN;
BEGIN
  SELECT EXISTS(
    SELECT 1 FROM supplier_subscriptions
    WHERE supplier_id = p_supplier_id
      AND status = 'ACTIVE'
      AND end_date >= CURRENT_DATE
  ) INTO has_subscription;

  RETURN has_subscription;
END;
$$ LANGUAGE plpgsql;

-- Function to get supplier's current subscription details
CREATE OR REPLACE FUNCTION get_current_subscription(p_supplier_id UUID)
RETURNS TABLE (
  subscription_id UUID,
  plan_name VARCHAR,
  plan_type subscription_plan_type,
  status subscription_status,
  start_date DATE,
  end_date DATE,
  days_remaining INTEGER,
  max_active_bids INTEGER,
  bids_used INTEGER,
  bids_remaining INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ss.id as subscription_id,
    sp.name as plan_name,
    sp.type as plan_type,
    ss.status,
    ss.start_date,
    ss.end_date,
    (ss.end_date - CURRENT_DATE)::INTEGER as days_remaining,
    sp.max_active_bids,
    ss.bids_used,
    (sp.max_active_bids - ss.bids_used) as bids_remaining
  FROM supplier_subscriptions ss
  JOIN subscription_plans sp ON ss.plan_id = sp.id
  WHERE ss.supplier_id = p_supplier_id
    AND ss.status = 'ACTIVE'
    AND ss.end_date >= CURRENT_DATE
  ORDER BY ss.end_date DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Function to activate subscription after payment verification
CREATE OR REPLACE FUNCTION activate_subscription(
  p_subscription_id UUID,
  p_payment_id UUID,
  p_verified_by UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  v_plan_duration INTEGER;
  v_current_status subscription_status;
BEGIN
  -- Get current subscription status
  SELECT status INTO v_current_status
  FROM supplier_subscriptions
  WHERE id = p_subscription_id;

  -- Get plan duration
  SELECT sp.duration_months INTO v_plan_duration
  FROM supplier_subscriptions ss
  JOIN subscription_plans sp ON ss.plan_id = sp.id
  WHERE ss.id = p_subscription_id;

  -- Update subscription
  UPDATE supplier_subscriptions
  SET
    status = 'ACTIVE',
    start_date = CURRENT_DATE,
    end_date = CURRENT_DATE + (v_plan_duration || ' months')::INTERVAL,
    payment_id = p_payment_id,
    updated_at = NOW()
  WHERE id = p_subscription_id;

  -- Update payment status
  UPDATE subscription_payments
  SET
    status = 'COMPLETED',
    verified_date = NOW(),
    verified_by = p_verified_by,
    updated_at = NOW()
  WHERE id = p_payment_id;

  -- Record in history
  INSERT INTO subscription_history (
    subscription_id,
    action,
    previous_status,
    new_status,
    new_end_date,
    performed_by,
    notes
  ) VALUES (
    p_subscription_id,
    'ACTIVATED',
    v_current_status,
    'ACTIVE',
    CURRENT_DATE + (v_plan_duration || ' months')::INTERVAL,
    p_verified_by,
    'Subscription activated after payment verification'
  );

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at
CREATE TRIGGER update_subscription_plans_updated_at
  BEFORE UPDATE ON subscription_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_supplier_subscriptions_updated_at
  BEFORE UPDATE ON supplier_subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_subscription_payments_updated_at
  BEFORE UPDATE ON subscription_payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =============================================================================
-- INITIAL DATA - SUBSCRIPTION PLANS
-- =============================================================================

INSERT INTO subscription_plans (name, code, type, description, price_amount, duration_months, max_active_bids, max_tender_value, can_bid_on_goods, can_bid_on_works, can_bid_on_services, can_bid_on_consultancy, priority_support, featured_listing, sort_order) VALUES
(
  'Basic',
  'BASIC',
  'BASIC',
  'Entry-level subscription for small businesses. Bid on goods and services tenders up to K500,000.',
  2500.00,
  12,
  5,
  500000.00,
  true,
  false,
  true,
  false,
  false,
  false,
  1
),
(
  'Standard',
  'STANDARD',
  'STANDARD',
  'For established businesses. Bid on all tender types up to K2,000,000. Includes priority support.',
  5000.00,
  12,
  15,
  2000000.00,
  true,
  true,
  true,
  true,
  true,
  false,
  2
),
(
  'Premium',
  'PREMIUM',
  'PREMIUM',
  'For medium enterprises. Unlimited tender value access with featured listing.',
  10000.00,
  12,
  50,
  NULL,
  true,
  true,
  true,
  true,
  true,
  true,
  3
),
(
  'Enterprise',
  'ENTERPRISE',
  'ENTERPRISE',
  'For large corporations and joint ventures. Unlimited access with dedicated account manager.',
  25000.00,
  12,
  NULL,
  NULL,
  true,
  true,
  true,
  true,
  true,
  true,
  4
);

COMMENT ON TABLE subscription_plans IS 'Available subscription plans for suppliers';
COMMENT ON TABLE supplier_subscriptions IS 'Supplier subscription records';
COMMENT ON TABLE subscription_payments IS 'Payment records for subscriptions';
COMMENT ON TABLE subscription_history IS 'Audit trail for subscription changes';
