/**
 * Supabase Database Types for PNG eGP System
 * Auto-generated types matching the database schema
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      // User Management
      users: {
        Row: {
          id: string;
          email: string;
          username: string;
          first_name: string;
          last_name: string;
          role: UserRole;
          organization_id: string | null;
          is_active: boolean;
          mfa_enabled: boolean;
          last_login_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          username: string;
          first_name: string;
          last_name: string;
          role: UserRole;
          organization_id?: string | null;
          is_active?: boolean;
          mfa_enabled?: boolean;
          last_login_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          username?: string;
          first_name?: string;
          last_name?: string;
          role?: UserRole;
          organization_id?: string | null;
          is_active?: boolean;
          mfa_enabled?: boolean;
          last_login_at?: string | null;
          updated_at?: string;
        };
      };

      // Organizations
      organizations: {
        Row: {
          id: string;
          name: string;
          code: string;
          type: OrganizationType;
          address_line1: string;
          address_line2: string | null;
          city: string;
          province: string;
          postal_code: string | null;
          country: string;
          email: string;
          phone: string | null;
          parent_id: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          code: string;
          type: OrganizationType;
          address_line1: string;
          address_line2?: string | null;
          city: string;
          province: string;
          postal_code?: string | null;
          country?: string;
          email: string;
          phone?: string | null;
          parent_id?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          code?: string;
          type?: OrganizationType;
          address_line1?: string;
          address_line2?: string | null;
          city?: string;
          province?: string;
          postal_code?: string | null;
          email?: string;
          phone?: string | null;
          parent_id?: string | null;
          is_active?: boolean;
          updated_at?: string;
        };
      };

      // Annual Procurement Plans
      annual_procurement_plans: {
        Row: {
          id: string;
          fiscal_year: number;
          organization_id: string;
          status: PlanStatus;
          total_budget_amount: number;
          total_budget_currency: string;
          created_by: string;
          updated_by: string;
          created_at: string;
          updated_at: string;
          is_deleted: boolean;
        };
        Insert: {
          id?: string;
          fiscal_year: number;
          organization_id: string;
          status?: PlanStatus;
          total_budget_amount: number;
          total_budget_currency?: string;
          created_by: string;
          updated_by: string;
          created_at?: string;
          updated_at?: string;
          is_deleted?: boolean;
        };
        Update: {
          fiscal_year?: number;
          organization_id?: string;
          status?: PlanStatus;
          total_budget_amount?: number;
          total_budget_currency?: string;
          updated_by?: string;
          updated_at?: string;
          is_deleted?: boolean;
        };
      };

      // Procurement Plan Items
      procurement_plan_items: {
        Row: {
          id: string;
          plan_id: string;
          description: string;
          category: string;
          unspsc_code: string | null;
          estimated_amount: number;
          estimated_currency: string;
          procurement_method: ProcurementMethod;
          expected_quarter: number;
          justification: string;
          linked_tender_id: string | null;
          created_at: string;
          updated_at: string;
          is_deleted: boolean;
        };
        Insert: {
          id?: string;
          plan_id: string;
          description: string;
          category: string;
          unspsc_code?: string | null;
          estimated_amount: number;
          estimated_currency?: string;
          procurement_method: ProcurementMethod;
          expected_quarter: number;
          justification: string;
          linked_tender_id?: string | null;
          created_at?: string;
          updated_at?: string;
          is_deleted?: boolean;
        };
        Update: {
          plan_id?: string;
          description?: string;
          category?: string;
          unspsc_code?: string | null;
          estimated_amount?: number;
          estimated_currency?: string;
          procurement_method?: ProcurementMethod;
          expected_quarter?: number;
          justification?: string;
          linked_tender_id?: string | null;
          updated_at?: string;
          is_deleted?: boolean;
        };
      };

      // Tenders
      tenders: {
        Row: {
          id: string;
          reference_number: string;
          title: string;
          description: string;
          organization_id: string;
          procurement_method: ProcurementMethod;
          status: TenderStatus;
          category: string;
          unspsc_code: string | null;
          estimated_amount: number;
          estimated_currency: string;
          submission_deadline: string;
          opening_date: string;
          validity_period: number;
          bid_security_required: boolean;
          bid_security_amount: number | null;
          bid_security_currency: string | null;
          linked_plan_item_id: string | null;
          created_by: string;
          updated_by: string;
          created_at: string;
          updated_at: string;
          is_deleted: boolean;
        };
        Insert: {
          id?: string;
          reference_number: string;
          title: string;
          description: string;
          organization_id: string;
          procurement_method: ProcurementMethod;
          status?: TenderStatus;
          category: string;
          unspsc_code?: string | null;
          estimated_amount: number;
          estimated_currency?: string;
          submission_deadline: string;
          opening_date: string;
          validity_period?: number;
          bid_security_required?: boolean;
          bid_security_amount?: number | null;
          bid_security_currency?: string | null;
          linked_plan_item_id?: string | null;
          created_by: string;
          updated_by: string;
          created_at?: string;
          updated_at?: string;
          is_deleted?: boolean;
        };
        Update: {
          reference_number?: string;
          title?: string;
          description?: string;
          organization_id?: string;
          procurement_method?: ProcurementMethod;
          status?: TenderStatus;
          category?: string;
          unspsc_code?: string | null;
          estimated_amount?: number;
          estimated_currency?: string;
          submission_deadline?: string;
          opening_date?: string;
          validity_period?: number;
          bid_security_required?: boolean;
          bid_security_amount?: number | null;
          bid_security_currency?: string | null;
          linked_plan_item_id?: string | null;
          updated_by?: string;
          updated_at?: string;
          is_deleted?: boolean;
        };
      };

      // Tender Documents
      tender_documents: {
        Row: {
          id: string;
          tender_id: string;
          type: DocumentType;
          name: string;
          description: string | null;
          file_url: string;
          file_size: number;
          mime_type: string;
          version: number;
          is_public: boolean;
          hash: string;
          created_by: string;
          created_at: string;
          updated_at: string;
          is_deleted: boolean;
        };
        Insert: {
          id?: string;
          tender_id: string;
          type: DocumentType;
          name: string;
          description?: string | null;
          file_url: string;
          file_size: number;
          mime_type: string;
          version?: number;
          is_public?: boolean;
          hash: string;
          created_by: string;
          created_at?: string;
          updated_at?: string;
          is_deleted?: boolean;
        };
        Update: {
          tender_id?: string;
          type?: DocumentType;
          name?: string;
          description?: string | null;
          file_url?: string;
          file_size?: number;
          mime_type?: string;
          version?: number;
          is_public?: boolean;
          hash?: string;
          updated_at?: string;
          is_deleted?: boolean;
        };
      };

      // Bids
      bids: {
        Row: {
          id: string;
          tender_id: string;
          supplier_id: string;
          reference_number: string;
          status: BidStatus;
          submitted_at: string | null;
          total_amount: number;
          total_currency: string;
          validity_period: number;
          encrypted_data: string | null;
          encryption_iv: string | null;
          encryption_hash: string | null;
          decrypted_at: string | null;
          version: number;
          created_by: string;
          updated_by: string;
          created_at: string;
          updated_at: string;
          is_deleted: boolean;
        };
        Insert: {
          id?: string;
          tender_id: string;
          supplier_id: string;
          reference_number: string;
          status?: BidStatus;
          submitted_at?: string | null;
          total_amount: number;
          total_currency?: string;
          validity_period?: number;
          encrypted_data?: string | null;
          encryption_iv?: string | null;
          encryption_hash?: string | null;
          decrypted_at?: string | null;
          version?: number;
          created_by: string;
          updated_by: string;
          created_at?: string;
          updated_at?: string;
          is_deleted?: boolean;
        };
        Update: {
          tender_id?: string;
          supplier_id?: string;
          reference_number?: string;
          status?: BidStatus;
          submitted_at?: string | null;
          total_amount?: number;
          total_currency?: string;
          validity_period?: number;
          encrypted_data?: string | null;
          encryption_iv?: string | null;
          encryption_hash?: string | null;
          decrypted_at?: string | null;
          version?: number;
          updated_by?: string;
          updated_at?: string;
          is_deleted?: boolean;
        };
      };

      // Suppliers
      suppliers: {
        Row: {
          id: string;
          registration_number: string;
          name: string;
          trading_name: string | null;
          type: SupplierType;
          status: SupplierStatus;
          address_line1: string;
          address_line2: string | null;
          city: string;
          province: string;
          postal_code: string | null;
          country: string;
          email: string;
          phone: string | null;
          mobile: string | null;
          tax_number: string;
          business_registration_number: string;
          incorporation_date: string | null;
          bank_name: string;
          bank_branch: string;
          bank_account_name: string;
          bank_account_number: string;
          bank_swift_code: string | null;
          created_by: string;
          updated_by: string;
          created_at: string;
          updated_at: string;
          is_deleted: boolean;
        };
        Insert: {
          id?: string;
          registration_number: string;
          name: string;
          trading_name?: string | null;
          type: SupplierType;
          status?: SupplierStatus;
          address_line1: string;
          address_line2?: string | null;
          city: string;
          province: string;
          postal_code?: string | null;
          country?: string;
          email: string;
          phone?: string | null;
          mobile?: string | null;
          tax_number: string;
          business_registration_number: string;
          incorporation_date?: string | null;
          bank_name: string;
          bank_branch: string;
          bank_account_name: string;
          bank_account_number: string;
          bank_swift_code?: string | null;
          created_by: string;
          updated_by: string;
          created_at?: string;
          updated_at?: string;
          is_deleted?: boolean;
        };
        Update: {
          registration_number?: string;
          name?: string;
          trading_name?: string | null;
          type?: SupplierType;
          status?: SupplierStatus;
          address_line1?: string;
          address_line2?: string | null;
          city?: string;
          province?: string;
          postal_code?: string | null;
          email?: string;
          phone?: string | null;
          mobile?: string | null;
          tax_number?: string;
          business_registration_number?: string;
          incorporation_date?: string | null;
          bank_name?: string;
          bank_branch?: string;
          bank_account_name?: string;
          bank_account_number?: string;
          bank_swift_code?: string | null;
          updated_by?: string;
          updated_at?: string;
          is_deleted?: boolean;
        };
      };

      // Contracts
      contracts: {
        Row: {
          id: string;
          reference_number: string;
          tender_id: string;
          bid_id: string;
          supplier_id: string;
          organization_id: string;
          title: string;
          description: string;
          status: ContractStatus;
          contract_type: ContractType;
          value_amount: number;
          value_currency: string;
          start_date: string;
          end_date: string;
          signed_date: string | null;
          effective_date: string | null;
          completion_date: string | null;
          performance_rating: number | null;
          created_by: string;
          updated_by: string;
          created_at: string;
          updated_at: string;
          is_deleted: boolean;
        };
        Insert: {
          id?: string;
          reference_number: string;
          tender_id: string;
          bid_id: string;
          supplier_id: string;
          organization_id: string;
          title: string;
          description: string;
          status?: ContractStatus;
          contract_type: ContractType;
          value_amount: number;
          value_currency?: string;
          start_date: string;
          end_date: string;
          signed_date?: string | null;
          effective_date?: string | null;
          completion_date?: string | null;
          performance_rating?: number | null;
          created_by: string;
          updated_by: string;
          created_at?: string;
          updated_at?: string;
          is_deleted?: boolean;
        };
        Update: {
          reference_number?: string;
          tender_id?: string;
          bid_id?: string;
          supplier_id?: string;
          organization_id?: string;
          title?: string;
          description?: string;
          status?: ContractStatus;
          contract_type?: ContractType;
          value_amount?: number;
          value_currency?: string;
          start_date?: string;
          end_date?: string;
          signed_date?: string | null;
          effective_date?: string | null;
          completion_date?: string | null;
          performance_rating?: number | null;
          updated_by?: string;
          updated_at?: string;
          is_deleted?: boolean;
        };
      };

      // Contract Milestones
      contract_milestones: {
        Row: {
          id: string;
          contract_id: string;
          number: number;
          title: string;
          description: string;
          due_date: string;
          completed_date: string | null;
          deliverables: string[];
          payment_percentage: number | null;
          status: MilestoneStatus;
          created_at: string;
          updated_at: string;
          is_deleted: boolean;
        };
        Insert: {
          id?: string;
          contract_id: string;
          number: number;
          title: string;
          description: string;
          due_date: string;
          completed_date?: string | null;
          deliverables?: string[];
          payment_percentage?: number | null;
          status?: MilestoneStatus;
          created_at?: string;
          updated_at?: string;
          is_deleted?: boolean;
        };
        Update: {
          contract_id?: string;
          number?: number;
          title?: string;
          description?: string;
          due_date?: string;
          completed_date?: string | null;
          deliverables?: string[];
          payment_percentage?: number | null;
          status?: MilestoneStatus;
          updated_at?: string;
          is_deleted?: boolean;
        };
      };

      // Approval Workflows
      approval_workflows: {
        Row: {
          id: string;
          entity_type: WorkflowEntityType;
          entity_id: string;
          entity_ref: string;
          entity_title: string;
          current_step: number;
          total_steps: number;
          status: WorkflowStatus;
          requested_value: number | null;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          entity_type: WorkflowEntityType;
          entity_id: string;
          entity_ref: string;
          entity_title: string;
          current_step?: number;
          total_steps: number;
          status?: WorkflowStatus;
          requested_value?: number | null;
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          entity_type?: WorkflowEntityType;
          entity_id?: string;
          entity_ref?: string;
          entity_title?: string;
          current_step?: number;
          total_steps?: number;
          status?: WorkflowStatus;
          requested_value?: number | null;
          updated_at?: string;
        };
      };

      // Approval Steps
      approval_steps: {
        Row: {
          id: string;
          workflow_id: string;
          step_number: number;
          title: string;
          required_role: string;
          assigned_to: string | null;
          assigned_to_name: string | null;
          status: ApprovalStatus;
          comments: string | null;
          action_date: string | null;
          due_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          workflow_id: string;
          step_number: number;
          title: string;
          required_role: string;
          assigned_to?: string | null;
          assigned_to_name?: string | null;
          status?: ApprovalStatus;
          comments?: string | null;
          action_date?: string | null;
          due_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          workflow_id?: string;
          step_number?: number;
          title?: string;
          required_role?: string;
          assigned_to?: string | null;
          assigned_to_name?: string | null;
          status?: ApprovalStatus;
          comments?: string | null;
          action_date?: string | null;
          due_date?: string | null;
          updated_at?: string;
        };
      };

      // Audit Logs
      audit_logs: {
        Row: {
          id: string;
          user_id: string;
          session_id: string;
          action: AuditAction;
          entity_type: string;
          entity_id: string;
          previous_state: Json | null;
          new_state: Json | null;
          ip_address: string;
          user_agent: string;
          metadata: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          session_id: string;
          action: AuditAction;
          entity_type: string;
          entity_id: string;
          previous_state?: Json | null;
          new_state?: Json | null;
          ip_address: string;
          user_agent: string;
          metadata?: Json | null;
          created_at?: string;
        };
        Update: never; // Audit logs are immutable
      };

      // Auctions
      auctions: {
        Row: {
          id: string;
          reference_number: string;
          tender_id: string | null;
          type: AuctionType;
          title: string;
          description: string;
          status: AuctionStatus;
          start_time: string;
          end_time: string;
          reserve_price_amount: number | null;
          reserve_price_currency: string | null;
          current_price_amount: number;
          current_price_currency: string;
          minimum_decrement: number | null;
          winner_id: string | null;
          created_by: string;
          updated_by: string;
          created_at: string;
          updated_at: string;
          is_deleted: boolean;
        };
        Insert: {
          id?: string;
          reference_number: string;
          tender_id?: string | null;
          type: AuctionType;
          title: string;
          description: string;
          status?: AuctionStatus;
          start_time: string;
          end_time: string;
          reserve_price_amount?: number | null;
          reserve_price_currency?: string | null;
          current_price_amount: number;
          current_price_currency?: string;
          minimum_decrement?: number | null;
          winner_id?: string | null;
          created_by: string;
          updated_by: string;
          created_at?: string;
          updated_at?: string;
          is_deleted?: boolean;
        };
        Update: {
          reference_number?: string;
          tender_id?: string | null;
          type?: AuctionType;
          title?: string;
          description?: string;
          status?: AuctionStatus;
          start_time?: string;
          end_time?: string;
          reserve_price_amount?: number | null;
          reserve_price_currency?: string | null;
          current_price_amount?: number;
          current_price_currency?: string;
          minimum_decrement?: number | null;
          winner_id?: string | null;
          updated_by?: string;
          updated_at?: string;
          is_deleted?: boolean;
        };
      };

      // Catalog Items
      catalog_items: {
        Row: {
          id: string;
          supplier_id: string;
          name: string;
          description: string;
          category: string;
          unspsc_code: string;
          unit_price_amount: number;
          unit_price_currency: string;
          unit: string;
          minimum_order_quantity: number;
          lead_time_days: number;
          specifications: Json;
          images: string[];
          is_active: boolean;
          framework_agreement_id: string | null;
          created_by: string;
          updated_by: string;
          created_at: string;
          updated_at: string;
          is_deleted: boolean;
        };
        Insert: {
          id?: string;
          supplier_id: string;
          name: string;
          description: string;
          category: string;
          unspsc_code: string;
          unit_price_amount: number;
          unit_price_currency?: string;
          unit: string;
          minimum_order_quantity?: number;
          lead_time_days?: number;
          specifications?: Json;
          images?: string[];
          is_active?: boolean;
          framework_agreement_id?: string | null;
          created_by: string;
          updated_by: string;
          created_at?: string;
          updated_at?: string;
          is_deleted?: boolean;
        };
        Update: {
          supplier_id?: string;
          name?: string;
          description?: string;
          category?: string;
          unspsc_code?: string;
          unit_price_amount?: number;
          unit_price_currency?: string;
          unit?: string;
          minimum_order_quantity?: number;
          lead_time_days?: number;
          specifications?: Json;
          images?: string[];
          is_active?: boolean;
          framework_agreement_id?: string | null;
          updated_by?: string;
          updated_at?: string;
          is_deleted?: boolean;
        };
      };

      // Purchase Orders
      purchase_orders: {
        Row: {
          id: string;
          reference_number: string;
          organization_id: string;
          supplier_id: string;
          status: PurchaseOrderStatus;
          total_amount: number;
          total_currency: string;
          delivery_address: string;
          delivery_date: string | null;
          approved_by: string | null;
          approved_at: string | null;
          created_by: string;
          updated_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          reference_number: string;
          organization_id: string;
          supplier_id: string;
          status?: PurchaseOrderStatus;
          total_amount: number;
          total_currency?: string;
          delivery_address: string;
          delivery_date?: string | null;
          approved_by?: string | null;
          approved_at?: string | null;
          created_by: string;
          updated_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          reference_number?: string;
          organization_id?: string;
          supplier_id?: string;
          status?: PurchaseOrderStatus;
          total_amount?: number;
          total_currency?: string;
          delivery_address?: string;
          delivery_date?: string | null;
          approved_by?: string | null;
          approved_at?: string | null;
          updated_by?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      user_role: UserRole;
      organization_type: OrganizationType;
      plan_status: PlanStatus;
      procurement_method: ProcurementMethod;
      tender_status: TenderStatus;
      bid_status: BidStatus;
      supplier_type: SupplierType;
      supplier_status: SupplierStatus;
      contract_status: ContractStatus;
      contract_type: ContractType;
      milestone_status: MilestoneStatus;
      workflow_entity_type: WorkflowEntityType;
      workflow_status: WorkflowStatus;
      approval_status: ApprovalStatus;
      audit_action: AuditAction;
      auction_type: AuctionType;
      auction_status: AuctionStatus;
      document_type: DocumentType;
      purchase_order_status: PurchaseOrderStatus;
    };
  };
};

// Enum Types
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

export type OrganizationType =
  | 'GOVERNMENT_AGENCY'
  | 'STATE_OWNED_ENTERPRISE'
  | 'SUPPLIER'
  | 'NPC';

export type PlanStatus = 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'PUBLISHED';

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

export type SupplierType =
  | 'COMPANY'
  | 'SOLE_TRADER'
  | 'PARTNERSHIP'
  | 'JOINT_VENTURE';

export type SupplierStatus =
  | 'PENDING'
  | 'ACTIVE'
  | 'SUSPENDED'
  | 'BLACKLISTED'
  | 'INACTIVE';

export type ContractStatus =
  | 'DRAFT'
  | 'PENDING_SIGNATURE'
  | 'ACTIVE'
  | 'SUSPENDED'
  | 'COMPLETED'
  | 'TERMINATED';

export type ContractType = 'GOODS' | 'WORKS' | 'SERVICES' | 'CONSULTANCY';

export type MilestoneStatus =
  | 'PENDING'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'DELAYED'
  | 'CANCELLED';

export type WorkflowEntityType =
  | 'ANNUAL_PLAN'
  | 'TENDER'
  | 'PURCHASE_ORDER'
  | 'AWARD'
  | 'CONTRACT'
  | 'VARIATION';

export type WorkflowStatus = 'IN_PROGRESS' | 'APPROVED' | 'REJECTED' | 'RETURNED';

export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'RETURNED';

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

export type AuctionType = 'FORWARD' | 'REVERSE';

export type AuctionStatus = 'SCHEDULED' | 'OPEN' | 'CLOSED' | 'CANCELLED';

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

export type PurchaseOrderStatus =
  | 'DRAFT'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'ORDERED'
  | 'DELIVERED'
  | 'COMPLETED'
  | 'CANCELLED';

// Helper types for table rows
export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];
export type Inserts<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert'];
export type Updates<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update'];
