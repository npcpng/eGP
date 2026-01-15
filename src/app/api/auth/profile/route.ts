import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user profile from users table
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      // If profile doesn't exist, return user metadata
      return NextResponse.json({
        id: user.id,
        email: user.email,
        firstName: user.user_metadata?.first_name || '',
        lastName: user.user_metadata?.last_name || '',
        role: user.user_metadata?.role || 'PUBLIC_VIEWER',
        profileExists: false,
      });
    }

    // Use type assertion to access profile properties
    const p = profile as Record<string, unknown>;

    return NextResponse.json({
      id: p.id,
      email: p.email,
      username: p.username,
      firstName: p.first_name,
      lastName: p.last_name,
      role: p.role,
      organizationId: p.organization_id,
      isActive: p.is_active,
      profileExists: true,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Insert user profile directly using SQL
    const { error: insertError } = await supabase.from('users').insert([
      {
        id: user.id,
        email: user.email || body.email,
        username: body.username || user.email?.split('@')[0] || '',
        first_name: body.firstName || user.user_metadata?.first_name || '',
        last_name: body.lastName || user.user_metadata?.last_name || '',
        role: body.role || user.user_metadata?.role || 'SUPPLIER',
        organization_id: body.organizationId || null,
        is_active: true,
      },
    ] as never);

    if (insertError) {
      throw insertError;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Update user profile
    const { error: updateError } = await supabase
      .from('users')
      .update({
        first_name: body.firstName,
        last_name: body.lastName,
        username: body.username,
        updated_at: new Date().toISOString(),
      } as never)
      .eq('id', user.id);

    if (updateError) {
      throw updateError;
    }

    // Also update Supabase auth user metadata
    await supabase.auth.updateUser({
      data: {
        first_name: body.firstName,
        last_name: body.lastName,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
