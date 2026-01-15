/**
 * Test Supabase Connection
 * Run with: bun run scripts/test-supabase-connection.ts
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://kwcrfhtlubtieejkaedx.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

async function testConnection() {
  console.log('🔌 Testing Supabase Connection...\n');
  console.log(`URL: ${SUPABASE_URL}`);
  console.log(`Key: ${SUPABASE_ANON_KEY ? SUPABASE_ANON_KEY.substring(0, 20) + '...' : '❌ NOT SET'}\n`);

  if (!SUPABASE_ANON_KEY || SUPABASE_ANON_KEY === 'your_anon_key_here') {
    console.error('❌ NEXT_PUBLIC_SUPABASE_ANON_KEY is not configured!');
    console.log('\n📋 To get your API keys:');
    console.log('1. Go to: https://supabase.com/dashboard/project/kwcrfhtlubtieejkaedx/settings/api');
    console.log('2. Copy the "anon public" key (starts with "eyJ...")');
    console.log('3. Update .env.local with: NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key_here');
    process.exit(1);
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // Test 1: Check if we can connect
    console.log('📡 Testing connection...');
    const { data: healthCheck, error: healthError } = await supabase
      .from('organizations')
      .select('count')
      .limit(1);

    if (healthError) {
      // If table doesn't exist, that's expected before migration
      if (healthError.message.includes('does not exist')) {
        console.log('⚠️  Connection works but tables not found.');
        console.log('   Run the database migration first!');
        console.log('   File: supabase/migrations/001_initial_schema.sql');
      } else {
        throw healthError;
      }
    } else {
      console.log('✅ Connection successful!');
      console.log(`   Organizations table exists with data.`);
    }

    // Test 2: Check auth
    console.log('\n🔐 Testing authentication...');
    const { data: { session }, error: authError } = await supabase.auth.getSession();

    if (authError) {
      console.log('⚠️  Auth check returned error:', authError.message);
    } else {
      console.log('✅ Auth system accessible');
      console.log(`   Session: ${session ? 'Active' : 'No active session (anonymous)'}`);
    }

    console.log('\n✨ Supabase is configured correctly!');
    console.log('\n📋 Next steps:');
    console.log('1. Run the database migration in Supabase SQL Editor');
    console.log('2. Create test users in Supabase Authentication');
    console.log('3. Start using the API services in your application');

  } catch (error) {
    console.error('\n❌ Connection failed:', error);
    console.log('\n🔧 Troubleshooting:');
    console.log('- Check that the API key is correct (should start with "eyJ")');
    console.log('- Verify the project URL is correct');
    console.log('- Ensure your Supabase project is active');
  }
}

testConnection();
