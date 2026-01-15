import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET() {
  try {
    // Use service role key for admin access
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check tables
    const { data: tables, error: tablesError } = await supabase
      .rpc('get_table_info')
      .select('*');

    // If RPC doesn't exist, query information_schema directly
    const { data: tableList, error: tableListError } = await supabase
      .from('organizations')
      .select('count')
      .limit(1);

    // Try to get table count using raw SQL via REST
    const tablesQuery = await fetch(
      `${supabaseUrl}/rest/v1/rpc/get_tables_count`,
      {
        headers: {
          'apikey': supabaseServiceKey,
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    // Check each critical table
    const tablesToCheck = [
      'organizations',
      'users',
      'suppliers',
      'tenders',
      'bids',
      'contracts',
      'subscription_plans',
      'supplier_subscriptions',
      'subscription_payments',
      'audit_logs',
      'approval_workflows',
      'notifications',
    ];

    const tableStatus: Record<string, { exists: boolean; count: number | null; error?: string }> = {};

    for (const table of tablesToCheck) {
      try {
        const { count, error } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true });

        tableStatus[table] = {
          exists: !error,
          count: count,
          error: error?.message,
        };
      } catch (e) {
        tableStatus[table] = {
          exists: false,
          count: null,
          error: e instanceof Error ? e.message : 'Unknown error',
        };
      }
    }

    // Check seed data
    const { data: orgs, error: orgsError } = await supabase
      .from('organizations')
      .select('code, name, type')
      .order('code');

    const { data: plans, error: plansError } = await supabase
      .from('subscription_plans')
      .select('code, name, price_amount, type')
      .order('sort_order');

    // Count existing tables
    const existingTables = Object.entries(tableStatus).filter(([_, status]) => status.exists);
    const missingTables = Object.entries(tableStatus).filter(([_, status]) => !status.exists);

    return NextResponse.json({
      success: true,
      summary: {
        tablesChecked: tablesToCheck.length,
        tablesExist: existingTables.length,
        tablesMissing: missingTables.length,
        migrationComplete: missingTables.length === 0,
      },
      tables: tableStatus,
      seedData: {
        organizations: {
          count: orgs?.length || 0,
          data: orgs || [],
          error: orgsError?.message,
        },
        subscriptionPlans: {
          count: plans?.length || 0,
          data: plans || [],
          error: plansError?.message,
        },
      },
      recommendations: missingTables.length > 0
        ? [
            'Run the safe_migration.sql script in Supabase SQL Editor',
            `Missing tables: ${missingTables.map(([name]) => name).join(', ')}`,
          ]
        : ['Migration verified successfully! All tables exist.'],
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        recommendation: 'Check Supabase connection and credentials',
      },
      { status: 500 }
    );
  }
}
