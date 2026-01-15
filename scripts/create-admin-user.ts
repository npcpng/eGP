/**
 * Create Admin User Script
 *
 * Run with: bun run scripts/create-admin-user.ts
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Admin user details
const ADMIN_USER = {
  email: 'admin@npc.gov.pg',
  password: 'Admin@PNG2026!',
  firstName: 'System',
  lastName: 'Administrator',
  username: 'sysadmin',
  role: 'SYSTEM_ADMIN' as const,
};

async function createAdminUser() {
  console.log('🚀 Creating admin user...\n');

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  // Step 1: Create user in Supabase Auth
  console.log('1️⃣  Creating user in Supabase Auth...');

  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: ADMIN_USER.email,
    password: ADMIN_USER.password,
    email_confirm: true, // Auto-confirm email
    user_metadata: {
      first_name: ADMIN_USER.firstName,
      last_name: ADMIN_USER.lastName,
    },
  });

  if (authError) {
    if (authError.message.includes('already been registered')) {
      console.log('   ⚠️  User already exists in Auth, fetching existing user...');

      // Get existing user
      const { data: users } = await supabase.auth.admin.listUsers();
      const existingUser = users?.users?.find(u => u.email === ADMIN_USER.email);

      if (existingUser) {
        console.log('   ✅ Found existing user:', existingUser.id);
        await createUserProfile(supabase, existingUser.id);
        return;
      }
    }
    console.error('   ❌ Auth Error:', authError.message);
    return;
  }

  console.log('   ✅ Auth user created:', authData.user?.id);

  // Step 2: Create user profile in users table
  await createUserProfile(supabase, authData.user!.id);
}

async function createUserProfile(supabase: any, userId: string) {
  console.log('\n2️⃣  Creating user profile in database...');

  // Get NPC organization ID
  const { data: npcOrg } = await supabase
    .from('organizations')
    .select('id')
    .eq('code', 'NPC')
    .single();

  // Check if user profile already exists
  const { data: existingProfile } = await supabase
    .from('users')
    .select('id')
    .eq('id', userId)
    .single();

  if (existingProfile) {
    console.log('   ⚠️  User profile already exists, updating...');

    const { error: updateError } = await supabase
      .from('users')
      .update({
        role: ADMIN_USER.role,
        organization_id: npcOrg?.id,
        is_active: true,
      })
      .eq('id', userId);

    if (updateError) {
      console.error('   ❌ Update Error:', updateError.message);
      return;
    }
    console.log('   ✅ User profile updated');
  } else {
    // Create new profile
    const { error: profileError } = await supabase
      .from('users')
      .insert({
        id: userId,
        email: ADMIN_USER.email,
        username: ADMIN_USER.username,
        first_name: ADMIN_USER.firstName,
        last_name: ADMIN_USER.lastName,
        role: ADMIN_USER.role,
        organization_id: npcOrg?.id,
        is_active: true,
      });

    if (profileError) {
      console.error('   ❌ Profile Error:', profileError.message);
      return;
    }
    console.log('   ✅ User profile created');
  }

  // Success summary
  console.log('\n╔════════════════════════════════════════════════╗');
  console.log('║         ADMIN USER CREATED SUCCESSFULLY        ║');
  console.log('╠════════════════════════════════════════════════╣');
  console.log('║                                                ║');
  console.log('║  Email:    admin@npc.gov.pg                    ║');
  console.log('║  Password: Admin@PNG2026!                      ║');
  console.log('║  Role:     SYSTEM_ADMIN                        ║');
  console.log('║  Org:      National Procurement Commission     ║');
  console.log('║                                                ║');
  console.log('║  You can now login at /login                   ║');
  console.log('║                                                ║');
  console.log('╚════════════════════════════════════════════════╝');
}

// Run the script
createAdminUser().catch(console.error);
