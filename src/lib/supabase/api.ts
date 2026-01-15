/**
 * Supabase API Services
 * Database operations for all eGP modules
 *
 * Note: Type assertions are used until proper types are generated from Supabase CLI
 * Run: npx supabase gen types typescript --project-id kwcrfhtlubtieejkaedx > src/lib/supabase/database.types.ts
 */

import { getSupabaseClient } from './client';
import type { SupabaseClient } from '@supabase/supabase-js';

// Generic database types until we generate from Supabase
type DbClient = SupabaseClient;

// Status types
type TenderStatus = string;
type BidStatus = string;
type SupplierStatus = string;
type ContractStatus = string;

// =============================================================================
// TENDER SERVICES
// =============================================================================

export const tenderService = {
  async getAll(client: DbClient, options?: {
    status?: TenderStatus;
    organizationId?: string;
    limit?: number;
    offset?: number;
  }) {
    let query = client
      .from('tenders')
      .select('*, organizations(*)')
      .eq('is_deleted', false)
      .order('created_at', { ascending: false });

    if (options?.status) {
      query = query.eq('status', options.status);
    }
    if (options?.organizationId) {
      query = query.eq('organization_id', options.organizationId);
    }
    if (options?.limit) {
      query = query.limit(options.limit);
    }
    if (options?.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async getById(client: DbClient, id: string) {
    const { data, error } = await client
      .from('tenders')
      .select(`
        *,
        organizations(*),
        tender_documents(*),
        evaluation_criteria(*),
        tender_clarifications(*),
        tender_addenda(*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async getByReference(client: DbClient, referenceNumber: string) {
    const { data, error } = await client
      .from('tenders')
      .select('*')
      .eq('reference_number', referenceNumber)
      .single();

    if (error) throw error;
    return data;
  },

  async create(client: DbClient, tender: Record<string, unknown>) {
    const { data, error } = await client
      .from('tenders')
      .insert(tender as never)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(client: DbClient, id: string, updates: Record<string, unknown>) {
    const { data, error } = await client
      .from('tenders')
      .update(updates as never)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(client: DbClient, id: string) {
    const { error } = await client
      .from('tenders')
      .update({ is_deleted: true } as never)
      .eq('id', id);

    if (error) throw error;
  },

  async getPublishedTenders(client: DbClient) {
    const { data, error } = await client
      .from('tenders')
      .select('*, organizations(name)')
      .in('status', ['PUBLISHED', 'OPEN_FOR_BIDDING'])
      .eq('is_deleted', false)
      .order('submission_deadline', { ascending: true });

    if (error) throw error;
    return data;
  },

  async updateStatus(client: DbClient, id: string, status: TenderStatus, userId: string) {
    const { data, error } = await client
      .from('tenders')
      .update({ status, updated_by: userId } as never)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};

// =============================================================================
// BID SERVICES
// =============================================================================

export const bidService = {
  async getByTender(client: DbClient, tenderId: string) {
    const { data, error } = await client
      .from('bids')
      .select('*, suppliers(*)')
      .eq('tender_id', tenderId)
      .eq('is_deleted', false)
      .order('submitted_at', { ascending: true });

    if (error) throw error;
    return data;
  },

  async getBySupplier(client: DbClient, supplierId: string) {
    const { data, error } = await client
      .from('bids')
      .select('*, tenders(*)')
      .eq('supplier_id', supplierId)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getById(client: DbClient, id: string) {
    const { data, error } = await client
      .from('bids')
      .select('*, suppliers(*), tenders(*), bid_documents(*)')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async create(client: DbClient, bid: Record<string, unknown>) {
    const { data, error } = await client
      .from('bids')
      .insert(bid as never)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(client: DbClient, id: string, updates: Record<string, unknown>) {
    const { data, error } = await client
      .from('bids')
      .update(updates as never)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async submitBid(client: DbClient, id: string, encryptedData: {
    encrypted_data: string;
    encryption_iv: string;
    encryption_hash: string;
  }) {
    const { data, error } = await client
      .from('bids')
      .update({
        ...encryptedData,
        status: 'SUBMITTED',
        submitted_at: new Date().toISOString(),
      } as never)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async openBid(client: DbClient, id: string, userId: string) {
    const { data, error } = await client
      .from('bids')
      .update({
        decrypted_at: new Date().toISOString(),
        decrypted_by: userId,
      } as never)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};

// =============================================================================
// SUPPLIER SERVICES
// =============================================================================

export const supplierService = {
  async getAll(client: DbClient, options?: {
    status?: SupplierStatus;
    category?: string;
    limit?: number;
  }) {
    let query = client
      .from('suppliers')
      .select('*')
      .eq('is_deleted', false)
      .order('name', { ascending: true });

    if (options?.status) {
      query = query.eq('status', options.status);
    }
    if (options?.category) {
      query = query.contains('categories', [options.category]);
    }
    if (options?.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async getById(client: DbClient, id: string) {
    const { data, error } = await client
      .from('suppliers')
      .select(`
        *,
        supplier_classifications(*),
        supplier_qualifications(*),
        supplier_ratings(*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async getByUserId(client: DbClient, userId: string) {
    const { data, error } = await client
      .from('suppliers')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    return data;
  },

  async create(client: DbClient, supplier: Record<string, unknown>) {
    const { data, error } = await client
      .from('suppliers')
      .insert(supplier as never)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(client: DbClient, id: string, updates: Record<string, unknown>) {
    const { data, error } = await client
      .from('suppliers')
      .update(updates as never)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateStatus(client: DbClient, id: string, status: SupplierStatus) {
    const { data, error } = await client
      .from('suppliers')
      .update({ status } as never)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};

// =============================================================================
// CONTRACT SERVICES
// =============================================================================

export const contractService = {
  async getAll(client: DbClient, options?: {
    status?: ContractStatus;
    supplierId?: string;
    organizationId?: string;
    limit?: number;
  }) {
    let query = client
      .from('contracts')
      .select('*, suppliers(name), organizations(name)')
      .eq('is_deleted', false)
      .order('created_at', { ascending: false });

    if (options?.status) {
      query = query.eq('status', options.status);
    }
    if (options?.supplierId) {
      query = query.eq('supplier_id', options.supplierId);
    }
    if (options?.organizationId) {
      query = query.eq('organization_id', options.organizationId);
    }
    if (options?.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async getById(client: DbClient, id: string) {
    const { data, error } = await client
      .from('contracts')
      .select(`
        *,
        suppliers(*),
        organizations(*),
        tenders(reference_number, title),
        contract_milestones(*),
        contract_variations(*),
        contract_payments(*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async create(client: DbClient, contract: Record<string, unknown>) {
    const { data, error } = await client
      .from('contracts')
      .insert(contract as never)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(client: DbClient, id: string, updates: Record<string, unknown>) {
    const { data, error } = await client
      .from('contracts')
      .update(updates as never)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateMilestone(client: DbClient, milestoneId: string, updates: Record<string, unknown>) {
    const { data, error } = await client
      .from('contract_milestones')
      .update(updates as never)
      .eq('id', milestoneId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};

// =============================================================================
// WORKFLOW SERVICES
// =============================================================================

export const workflowService = {
  async getAll(client: DbClient, status?: string) {
    let query = client
      .from('approval_workflows')
      .select('*, approval_steps(*)')
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async getPending(client: DbClient, userId?: string) {
    const query = client
      .from('approval_workflows')
      .select('*, approval_steps(*)')
      .eq('status', 'IN_PROGRESS')
      .order('created_at', { ascending: false });

    const { data, error } = await query;
    if (error) throw error;

    // Filter by assigned user if specified
    if (userId && data) {
      return data.filter((wf: Record<string, unknown>) => {
        const steps = wf.approval_steps as Array<Record<string, unknown>> | undefined;
        const currentStep = steps?.find(
          (s) => s.step_number === wf.current_step && s.status === 'PENDING'
        );
        return currentStep?.assigned_to === userId;
      });
    }

    return data;
  },

  async create(client: DbClient, workflow: Record<string, unknown>, steps: Array<Record<string, unknown>>) {
    const { data: workflowData, error: workflowError } = await client
      .from('approval_workflows')
      .insert(workflow as never)
      .select()
      .single();

    if (workflowError) throw workflowError;

    const stepsWithWorkflowId = steps.map(step => ({
      ...step,
      workflow_id: (workflowData as Record<string, unknown>).id,
    }));

    const { error: stepsError } = await client
      .from('approval_steps')
      .insert(stepsWithWorkflowId as never);

    if (stepsError) throw stepsError;

    return workflowData;
  },

  async approveStep(client: DbClient, workflowId: string, stepId: string, comments?: string) {
    const { error: stepError } = await client
      .from('approval_steps')
      .update({
        status: 'APPROVED',
        comments,
        action_date: new Date().toISOString(),
      } as never)
      .eq('id', stepId);

    if (stepError) throw stepError;

    const { data: workflow, error: workflowError } = await client
      .from('approval_workflows')
      .select('*, approval_steps(*)')
      .eq('id', workflowId)
      .single();

    if (workflowError) throw workflowError;

    const wf = workflow as Record<string, unknown>;
    const steps = wf.approval_steps as Array<Record<string, unknown>> | undefined;
    const allApproved = steps?.every((s) => s.status === 'APPROVED');
    const currentStep = (wf.current_step as number) || 1;
    const totalSteps = (wf.total_steps as number) || 1;
    const nextStep = currentStep + 1;

    const { data, error } = await client
      .from('approval_workflows')
      .update({
        current_step: allApproved ? totalSteps : nextStep,
        status: allApproved ? 'APPROVED' : 'IN_PROGRESS',
      } as never)
      .eq('id', workflowId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async rejectStep(client: DbClient, workflowId: string, stepId: string, comments: string) {
    const { error: stepError } = await client
      .from('approval_steps')
      .update({
        status: 'REJECTED',
        comments,
        action_date: new Date().toISOString(),
      } as never)
      .eq('id', stepId);

    if (stepError) throw stepError;

    const { data, error } = await client
      .from('approval_workflows')
      .update({ status: 'REJECTED' } as never)
      .eq('id', workflowId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};

// =============================================================================
// AUDIT SERVICES
// =============================================================================

export const auditService = {
  async log(client: DbClient, log: Record<string, unknown>) {
    const { data, error } = await client
      .from('audit_logs')
      .insert(log as never)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getByEntity(client: DbClient, entityType: string, entityId: string) {
    const { data, error } = await client
      .from('audit_logs')
      .select('*')
      .eq('entity_type', entityType)
      .eq('entity_id', entityId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getByUser(client: DbClient, userId: string, limit = 50) {
    const { data, error } = await client
      .from('audit_logs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  },

  async getRecent(client: DbClient, limit = 50) {
    const { data, error } = await client
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  },
};

// =============================================================================
// MARKETPLACE SERVICES
// =============================================================================

export const marketplaceService = {
  async getCatalogItems(client: DbClient, options?: {
    category?: string;
    supplierId?: string;
    isActive?: boolean;
  }) {
    let query = client
      .from('catalog_items')
      .select('*, suppliers(name), framework_agreements(reference_number)')
      .eq('is_deleted', false)
      .order('name', { ascending: true });

    if (options?.category) {
      query = query.eq('category', options.category);
    }
    if (options?.supplierId) {
      query = query.eq('supplier_id', options.supplierId);
    }
    if (options?.isActive !== undefined) {
      query = query.eq('is_active', options.isActive);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async getPurchaseOrders(client: DbClient, organizationId?: string) {
    let query = client
      .from('purchase_orders')
      .select('*, suppliers(name), organizations(name), purchase_order_items(*)')
      .order('created_at', { ascending: false });

    if (organizationId) {
      query = query.eq('organization_id', organizationId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async createPurchaseOrder(client: DbClient, order: Record<string, unknown>, items: Array<Record<string, unknown>>) {
    const { data: orderData, error: orderError } = await client
      .from('purchase_orders')
      .insert(order as never)
      .select()
      .single();

    if (orderError) throw orderError;

    const itemsWithOrderId = items.map(item => ({
      ...item,
      order_id: (orderData as Record<string, unknown>).id,
    }));

    const { error: itemsError } = await client
      .from('purchase_order_items')
      .insert(itemsWithOrderId as never);

    if (itemsError) throw itemsError;

    return orderData;
  },
};

// =============================================================================
// AUCTION SERVICES
// =============================================================================

export const auctionService = {
  async getAll(client: DbClient) {
    const { data, error } = await client
      .from('auctions')
      .select('*, auction_bids(*)')
      .eq('is_deleted', false)
      .order('start_time', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getActive(client: DbClient) {
    const { data, error } = await client
      .from('auctions')
      .select('*, auction_bids(*)')
      .eq('status', 'OPEN')
      .eq('is_deleted', false)
      .order('end_time', { ascending: true });

    if (error) throw error;
    return data;
  },

  async placeBid(client: DbClient, auctionId: string, supplierId: string, amount: number) {
    const { data: bidData, error: bidError } = await client
      .from('auction_bids')
      .insert({
        auction_id: auctionId,
        supplier_id: supplierId,
        price_amount: amount,
        is_winning: true,
      } as never)
      .select()
      .single();

    if (bidError) throw bidError;

    await client
      .from('auction_bids')
      .update({ is_winning: false } as never)
      .eq('auction_id', auctionId)
      .neq('id', (bidData as Record<string, unknown>).id)
      .eq('is_winning', true);

    const { error: auctionError } = await client
      .from('auctions')
      .update({ current_price_amount: amount } as never)
      .eq('id', auctionId);

    if (auctionError) throw auctionError;

    return bidData;
  },
};

// =============================================================================
// ORGANIZATION SERVICES
// =============================================================================

export const organizationService = {
  async getAll(client: DbClient) {
    const { data, error } = await client
      .from('organizations')
      .select('*')
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (error) throw error;
    return data;
  },

  async getById(client: DbClient, id: string) {
    const { data, error } = await client
      .from('organizations')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },
};

// =============================================================================
// USER SERVICES
// =============================================================================

export const userService = {
  async getById(client: DbClient, id: string) {
    const { data, error } = await client
      .from('users')
      .select('*, organizations(*)')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async getByOrganization(client: DbClient, organizationId: string) {
    const { data, error } = await client
      .from('users')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('is_active', true)
      .order('last_name', { ascending: true });

    if (error) throw error;
    return data;
  },

  async updateProfile(client: DbClient, id: string, updates: Record<string, unknown>) {
    const { data, error } = await client
      .from('users')
      .update(updates as never)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};

// =============================================================================
// NOTIFICATION SERVICES
// =============================================================================

export const notificationService = {
  async getForUser(client: DbClient, userId: string, unreadOnly = false) {
    let query = client
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (unreadOnly) {
      query = query.eq('is_read', false);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async markAsRead(client: DbClient, id: string) {
    const { error } = await client
      .from('notifications')
      .update({ is_read: true, read_at: new Date().toISOString() } as never)
      .eq('id', id);

    if (error) throw error;
  },

  async markAllAsRead(client: DbClient, userId: string) {
    const { error } = await client
      .from('notifications')
      .update({ is_read: true, read_at: new Date().toISOString() } as never)
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) throw error;
  },

  async create(client: DbClient, notification: Record<string, unknown>) {
    const { data, error } = await client
      .from('notifications')
      .insert(notification as never)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};
