import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const EXPECTED_BUCKETS = [
  { id: 'tender-documents', public: true, description: 'Tender notices, specifications, and addenda' },
  { id: 'bid-documents', public: false, description: 'Encrypted bid submissions and attachments' },
  { id: 'contract-documents', public: false, description: 'Signed contracts and amendments' },
  { id: 'supplier-documents', public: false, description: 'Supplier registration and qualification docs' },
  { id: 'profile-images', public: true, description: 'User and organization profile images' },
  { id: 'payment-proofs', public: false, description: 'Subscription payment proof uploads' },
  { id: 'evaluation-reports', public: false, description: 'Bid evaluation reports and scoring' },
  { id: 'audit-attachments', public: false, description: 'Audit trail supporting documents' },
];

export async function GET() {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // List all buckets
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();

    if (bucketsError) {
      return NextResponse.json({
        success: false,
        error: bucketsError.message,
        recommendation: 'Run the 003_storage_buckets.sql migration in Supabase SQL Editor',
      }, { status: 500 });
    }

    // Check which buckets exist
    const bucketStatus = EXPECTED_BUCKETS.map(expected => {
      const found = buckets?.find(b => b.id === expected.id);
      return {
        id: expected.id,
        description: expected.description,
        expectedPublic: expected.public,
        exists: !!found,
        actualPublic: found?.public,
        createdAt: found?.created_at,
      };
    });

    const existingBuckets = bucketStatus.filter(b => b.exists);
    const missingBuckets = bucketStatus.filter(b => !b.exists);

    return NextResponse.json({
      success: true,
      summary: {
        expectedBuckets: EXPECTED_BUCKETS.length,
        existingBuckets: existingBuckets.length,
        missingBuckets: missingBuckets.length,
        allBucketsExist: missingBuckets.length === 0,
      },
      buckets: bucketStatus,
      recommendations: missingBuckets.length > 0
        ? [
            'Run the 003_storage_buckets.sql migration in Supabase SQL Editor',
            `Missing buckets: ${missingBuckets.map(b => b.id).join(', ')}`,
          ]
        : ['All storage buckets are configured correctly!'],
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      recommendation: 'Check Supabase connection and credentials',
    }, { status: 500 });
  }
}
