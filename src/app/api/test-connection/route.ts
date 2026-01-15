import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET() {
  const results: {
    connection: boolean;
    tablesExist: boolean;
    organizationsCount: number | null;
    sampleOrg: { name: string; code: string } | null;
    error: string | null;
    timestamp: string;
  } = {
    connection: false,
    tablesExist: false,
    organizationsCount: null,
    sampleOrg: null,
    error: null,
    timestamp: new Date().toISOString(),
  };

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      results.error = 'Missing Supabase environment variables';
      return NextResponse.json(results, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Test connection by querying organizations table
    const { data, error, count } = await supabase
      .from('organizations')
      .select('name, code', { count: 'exact' })
      .limit(1);

    if (error) {
      if (error.code === '42P01') {
        // Table doesn't exist
        results.connection = true;
        results.tablesExist = false;
        results.error = 'Tables do not exist. Please run the migration SQL in Supabase SQL Editor.';
        return NextResponse.json(results, { status: 200 });
      }
      throw error;
    }

    results.connection = true;
    results.tablesExist = true;
    results.organizationsCount = count;

    if (data && data.length > 0) {
      results.sampleOrg = { name: data[0].name, code: data[0].code };
    }

    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    results.error = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(results, { status: 500 });
  }
}
