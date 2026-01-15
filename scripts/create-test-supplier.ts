/**
 * Create Test Supplier Script
 *
 * Run with: bun run scripts/create-test-supplier.ts
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Test supplier details
const SUPPLIER_USER = {
  email: 'supplier@testcompany.com.pg',
  password: 'Supplier@2026!',
  firstName: 'John',
  lastName: 'Supplier',
  username: 'johnsupplier',
  role: 'SUPPLIER' as const,
};

const SUPPLIER_COMPANY = {
  name: 'PNG Test Supplies Ltd',
  trading_name: 'PNG Test Supplies',
  type: 'COMPANY' as const,
  registration_number: 'SUP-2026-0001',
  tax_number: 'TIN-123456789',
  business_registration_number: 'IPA-2020-12345',
  address_line1: '123 Harbour City Road',
  city: 'Port Moresby',
  province: 'NCD',
  email: 'info@testcompany.com.pg',
  phone: '+675 321 4567',
  mobile: '+675 7654 3210',
  bank_name: 'Bank South Pacific',
  bank_branch: 'Waigani Branch',
  bank_account_name: 'PNG Test Supplies Ltd',
  bank_account_number: '1234567890',
  categories: ['IT & Technology', 'Office Supplies'],
};

async function createTestSupplier() {
  console.log('🚀 Creating test supplier...\n');

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  // Step 1: Create user in Supabase Auth
  console.log('1️⃣  Creating user in Supabase Auth...');

  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: SUPPLIER_USER.email,
    password: SUPPLIER_USER.password,
    email_confirm: true,
    user_metadata: {
      first_name: SUPPLIER_USER.firstName,
      last_name: SUPPLIER_USER.lastName,
    },
  });

  let userId: string;

  if (authError) {
    if (authError.message.includes('already been registered')) {
      console.log('   ⚠️  User already exists, fetching...');
      const { data: users } = await supabase.auth.admin.listUsers();
      const existingUser = users?.users?.find(u => u.email === SUPPLIER_USER.email);
      if (!existingUser) {
        console.error('   ❌ Could not find existing user');
        return;
      }
      userId = existingUser.id;
    } else {
      console.error('   ❌ Auth Error:', authError.message);
      return;
    }
  } else {
    userId = authData.user!.id;
  }

  console.log('   ✅ Auth user:', userId);

  // Step 2: Create user profile
  console.log('\n2️⃣  Creating user profile...');

  const { data: existingProfile } = await supabase
    .from('users')
    .select('id')
    .eq('id', userId)
    .single();

  if (!existingProfile) {
    const { error: profileError } = await supabase
      .from('users')
      .insert({
        id: userId,
        email: SUPPLIER_USER.email,
        username: SUPPLIER_USER.username,
        first_name: SUPPLIER_USER.firstName,
        last_name: SUPPLIER_USER.lastName,
        role: SUPPLIER_USER.role,
        is_active: true,
      });

    if (profileError) {
      console.error('   ❌ Profile Error:', profileError.message);
      return;
    }
    console.log('   ✅ User profile created');
  } else {
    console.log('   ⚠️  User profile already exists');
  }

  // Step 3: Create supplier record
  console.log('\n3️⃣  Creating supplier record...');

  const { data: existingSupplier } = await supabase
    .from('suppliers')
    .select('id')
    .eq('user_id', userId)
    .single();

  let supplierId: string;

  if (!existingSupplier) {
    const { data: newSupplier, error: supplierError } = await supabase
      .from('suppliers')
      .insert({
        user_id: userId,
        ...SUPPLIER_COMPANY,
        status: 'ACTIVE',
        created_by: userId,
        updated_by: userId,
      })
      .select('id')
      .single();

    if (supplierError) {
      console.error('   ❌ Supplier Error:', supplierError.message);
      return;
    }
    supplierId = newSupplier.id;
    console.log('   ✅ Supplier record created:', supplierId);
  } else {
    supplierId = existingSupplier.id;
    console.log('   ⚠️  Supplier record already exists:', supplierId);
  }

  // Step 4: Create subscription (Premium plan for testing)
  console.log('\n4️⃣  Creating test subscription...');

  const { data: premiumPlan } = await supabase
    .from('subscription_plans')
    .select('id')
    .eq('code', 'PREMIUM')
    .single();

  if (premiumPlan) {
    const { data: existingSub } = await supabase
      .from('supplier_subscriptions')
      .select('id')
      .eq('supplier_id', supplierId)
      .eq('status', 'ACTIVE')
      .single();

    if (!existingSub) {
      const startDate = new Date();
      const endDate = new Date();
      endDate.setFullYear(endDate.getFullYear() + 1);

      const { error: subError } = await supabase
        .from('supplier_subscriptions')
        .insert({
          supplier_id: supplierId,
          plan_id: premiumPlan.id,
          status: 'ACTIVE',
          start_date: startDate.toISOString().split('T')[0],
          end_date: endDate.toISOString().split('T')[0],
          bids_used: 0,
          created_by: userId,
        });

      if (subError) {
        console.error('   ❌ Subscription Error:', subError.message);
      } else {
        console.log('   ✅ Premium subscription activated (1 year)');
      }
    } else {
      console.log('   ⚠️  Active subscription already exists');
    }
  }

  // Success summary
  console.log('\n╔════════════════════════════════════════════════╗');
  console.log('║       TEST SUPPLIER CREATED SUCCESSFULLY       ║');
  console.log('╠════════════════════════════════════════════════╣');
  console.log('║                                                ║');
  console.log('║  Email:    supplier@testcompany.com.pg         ║');
  console.log('║  Password: Supplier@2026!                      ║');
  console.log('║  Role:     SUPPLIER                            ║');
  console.log('║  Company:  PNG Test Supplies Ltd               ║');
  console.log('║  Plan:     Premium (50 bids, unlimited value)  ║');
  console.log('║                                                ║');
  console.log('║  This supplier can bid on all tenders!         ║');
  console.log('║                                                ║');
  console.log('╚════════════════════════════════════════════════╝');
}

createTestSupplier().catch(console.error);
