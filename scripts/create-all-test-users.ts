/**
 * Create All Test Users Script
 *
 * Creates users for all major roles in the PNG eGP System
 * Run with: bun run scripts/create-all-test-users.ts
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Define all test users
const TEST_USERS = [
  {
    email: 'npc.admin@npc.gov.pg',
    password: 'NPCAdmin@2026!',
    firstName: 'NPC',
    lastName: 'Administrator',
    username: 'npc_admin',
    role: 'NPC_ADMIN',
    orgCode: 'NPC',
    description: 'NPC Administrator - Oversees all procurement activities',
  },
  {
    email: 'npc.officer@npc.gov.pg',
    password: 'NPCOfficer@2026!',
    firstName: 'James',
    lastName: 'Kuman',
    username: 'npc_officer',
    role: 'NPC_OFFICER',
    orgCode: 'NPC',
    description: 'NPC Officer - Reviews and approves tenders',
  },
  {
    email: 'procurement@finance.gov.pg',
    password: 'Procurement@2026!',
    firstName: 'Mary',
    lastName: 'Apa',
    username: 'proc_officer_dof',
    role: 'PROCUREMENT_OFFICER',
    orgCode: 'DOF',
    description: 'Procurement Officer - Creates and manages tenders',
  },
  {
    email: 'procurement@health.gov.pg',
    password: 'Procurement@2026!',
    firstName: 'Peter',
    lastName: 'Waim',
    username: 'proc_officer_doh',
    role: 'PROCUREMENT_OFFICER',
    orgCode: 'DOH',
    description: 'Procurement Officer - Department of Health',
  },
  {
    email: 'evaluator@finance.gov.pg',
    password: 'Evaluator@2026!',
    firstName: 'Sarah',
    lastName: 'Morea',
    username: 'evaluator_dof',
    role: 'EVALUATOR',
    orgCode: 'DOF',
    description: 'Evaluator - Evaluates and scores bids',
  },
  {
    email: 'evaluator@health.gov.pg',
    password: 'Evaluator@2026!',
    firstName: 'Thomas',
    lastName: 'Puka',
    username: 'evaluator_doh',
    role: 'EVALUATOR',
    orgCode: 'DOH',
    description: 'Evaluator - Department of Health',
  },
  {
    email: 'finance@finance.gov.pg',
    password: 'Finance@2026!',
    firstName: 'Anna',
    lastName: 'Kila',
    username: 'finance_officer',
    role: 'FINANCE_OFFICER',
    orgCode: 'DOF',
    description: 'Finance Officer - Manages payments and budgets',
  },
  {
    email: 'auditor@npc.gov.pg',
    password: 'Auditor@2026!',
    firstName: 'David',
    lastName: 'Tau',
    username: 'auditor',
    role: 'AUDITOR',
    orgCode: 'NPC',
    description: 'Auditor - Reviews audit trails and compliance',
  },
  {
    email: 'agency.head@education.gov.pg',
    password: 'AgencyHead@2026!',
    firstName: 'Elizabeth',
    lastName: 'Sivu',
    username: 'agency_head_doe',
    role: 'AGENCY_HEAD',
    orgCode: 'DOE',
    description: 'Agency Head - Approves high-value procurements',
  },
];

async function createAllTestUsers() {
  console.log('🚀 Creating all test users...\n');
  console.log('═'.repeat(60));

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  // Get all organizations
  const { data: orgs } = await supabase
    .from('organizations')
    .select('id, code, name');

  const orgMap = new Map(orgs?.map(o => [o.code, { id: o.id, name: o.name }]) || []);

  const results: Array<{ email: string; role: string; status: string }> = [];

  for (const user of TEST_USERS) {
    console.log(`\n📧 ${user.email}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Org: ${user.orgCode}`);

    try {
      // Step 1: Create auth user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true,
        user_metadata: {
          first_name: user.firstName,
          last_name: user.lastName,
        },
      });

      let userId: string;

      if (authError) {
        if (authError.message.includes('already been registered')) {
          const { data: users } = await supabase.auth.admin.listUsers();
          const existingUser = users?.users?.find(u => u.email === user.email);
          if (!existingUser) {
            console.log('   ❌ Could not find existing user');
            results.push({ email: user.email, role: user.role, status: 'FAILED' });
            continue;
          }
          userId = existingUser.id;
          console.log('   ⚠️  Auth user exists');
        } else {
          console.log(`   ❌ Auth Error: ${authError.message}`);
          results.push({ email: user.email, role: user.role, status: 'FAILED' });
          continue;
        }
      } else {
        userId = authData.user!.id;
        console.log('   ✅ Auth user created');
      }

      // Step 2: Create or update user profile
      const org = orgMap.get(user.orgCode);

      const { data: existingProfile } = await supabase
        .from('users')
        .select('id')
        .eq('id', userId)
        .single();

      if (existingProfile) {
        await supabase
          .from('users')
          .update({
            role: user.role,
            organization_id: org?.id,
            is_active: true,
          })
          .eq('id', userId);
        console.log('   ✅ Profile updated');
      } else {
        const { error: profileError } = await supabase
          .from('users')
          .insert({
            id: userId,
            email: user.email,
            username: user.username,
            first_name: user.firstName,
            last_name: user.lastName,
            role: user.role,
            organization_id: org?.id,
            is_active: true,
          });

        if (profileError) {
          console.log(`   ❌ Profile Error: ${profileError.message}`);
          results.push({ email: user.email, role: user.role, status: 'PARTIAL' });
          continue;
        }
        console.log('   ✅ Profile created');
      }

      results.push({ email: user.email, role: user.role, status: 'SUCCESS' });

    } catch (error) {
      console.log(`   ❌ Error: ${error}`);
      results.push({ email: user.email, role: user.role, status: 'FAILED' });
    }
  }

  // Print summary
  console.log('\n' + '═'.repeat(60));
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║              ALL TEST USERS CREATED                        ║');
  console.log('╠════════════════════════════════════════════════════════════╣');
  console.log('║                                                            ║');

  for (const user of TEST_USERS) {
    const result = results.find(r => r.email === user.email);
    const status = result?.status === 'SUCCESS' ? '✅' : result?.status === 'PARTIAL' ? '⚠️' : '❌';
    const roleShort = user.role.substring(0, 18).padEnd(18);
    console.log(`║  ${status} ${roleShort} ${user.email.substring(0, 35).padEnd(35)} ║`);
  }

  console.log('║                                                            ║');
  console.log('╠════════════════════════════════════════════════════════════╣');
  console.log('║  All passwords follow pattern: RoleName@2026!              ║');
  console.log('║  Example: NPCAdmin@2026!, Procurement@2026!, etc.          ║');
  console.log('╚════════════════════════════════════════════════════════════╝');

  // Print credentials table
  console.log('\n📋 LOGIN CREDENTIALS:\n');
  console.log('┌' + '─'.repeat(40) + '┬' + '─'.repeat(25) + '┬' + '─'.repeat(20) + '┐');
  console.log('│ ' + 'Email'.padEnd(38) + ' │ ' + 'Password'.padEnd(23) + ' │ ' + 'Role'.padEnd(18) + ' │');
  console.log('├' + '─'.repeat(40) + '┼' + '─'.repeat(25) + '┼' + '─'.repeat(20) + '┤');

  for (const user of TEST_USERS) {
    console.log('│ ' + user.email.padEnd(38) + ' │ ' + user.password.padEnd(23) + ' │ ' + user.role.padEnd(18) + ' │');
  }

  console.log('└' + '─'.repeat(40) + '┴' + '─'.repeat(25) + '┴' + '─'.repeat(20) + '┘');
}

createAllTestUsers().catch(console.error);
