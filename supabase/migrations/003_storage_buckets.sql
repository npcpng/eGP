-- PNG eGP System - Storage Buckets Setup
-- Version: 1.0
-- Purpose: Create storage buckets for document management
-- Run this in Supabase SQL Editor

-- =============================================================================
-- STORAGE BUCKETS
-- =============================================================================

-- Create buckets (insert only if not exists)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
SELECT 'tender-documents', 'tender-documents', true, 52428800, -- 50MB limit
  ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'image/png', 'image/jpeg', 'image/gif', 'application/zip']
WHERE NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'tender-documents');

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
SELECT 'bid-documents', 'bid-documents', false, 104857600, -- 100MB limit
  ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'image/png', 'image/jpeg', 'application/zip', 'application/x-rar-compressed']
WHERE NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'bid-documents');

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
SELECT 'contract-documents', 'contract-documents', false, 52428800, -- 50MB limit
  ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'image/png', 'image/jpeg']
WHERE NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'contract-documents');

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
SELECT 'supplier-documents', 'supplier-documents', false, 20971520, -- 20MB limit
  ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'image/png', 'image/jpeg', 'image/gif']
WHERE NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'supplier-documents');

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
SELECT 'profile-images', 'profile-images', true, 5242880, -- 5MB limit
  ARRAY['image/png', 'image/jpeg', 'image/gif', 'image/webp']
WHERE NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'profile-images');

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
SELECT 'payment-proofs', 'payment-proofs', false, 10485760, -- 10MB limit
  ARRAY['application/pdf', 'image/png', 'image/jpeg']
WHERE NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'payment-proofs');

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
SELECT 'evaluation-reports', 'evaluation-reports', false, 52428800, -- 50MB limit
  ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']
WHERE NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'evaluation-reports');

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
SELECT 'audit-attachments', 'audit-attachments', false, 20971520, -- 20MB limit
  ARRAY['application/pdf', 'image/png', 'image/jpeg', 'application/zip']
WHERE NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'audit-attachments');

-- =============================================================================
-- STORAGE POLICIES - tender-documents (Public Read, Auth Write)
-- =============================================================================

-- Allow public read access to tender documents
DROP POLICY IF EXISTS "Public can view tender documents" ON storage.objects;
CREATE POLICY "Public can view tender documents"
ON storage.objects FOR SELECT
USING (bucket_id = 'tender-documents');

-- Allow authenticated users to upload tender documents
DROP POLICY IF EXISTS "Auth users can upload tender documents" ON storage.objects;
CREATE POLICY "Auth users can upload tender documents"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'tender-documents'
  AND auth.role() = 'authenticated'
);

-- Allow owners to update their tender documents
DROP POLICY IF EXISTS "Users can update own tender documents" ON storage.objects;
CREATE POLICY "Users can update own tender documents"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'tender-documents'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow owners to delete their tender documents
DROP POLICY IF EXISTS "Users can delete own tender documents" ON storage.objects;
CREATE POLICY "Users can delete own tender documents"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'tender-documents'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- =============================================================================
-- STORAGE POLICIES - bid-documents (Private, Owner Access)
-- =============================================================================

-- Suppliers can view their own bid documents
DROP POLICY IF EXISTS "Suppliers can view own bid documents" ON storage.objects;
CREATE POLICY "Suppliers can view own bid documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'bid-documents'
  AND (
    auth.uid()::text = (storage.foldername(name))[1]
    OR EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND u.role IN ('SYSTEM_ADMIN', 'NPC_ADMIN', 'NPC_OFFICER', 'PROCUREMENT_OFFICER', 'EVALUATOR')
    )
  )
);

-- Suppliers can upload bid documents
DROP POLICY IF EXISTS "Suppliers can upload bid documents" ON storage.objects;
CREATE POLICY "Suppliers can upload bid documents"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'bid-documents'
  AND auth.role() = 'authenticated'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Suppliers can update their bid documents before submission
DROP POLICY IF EXISTS "Suppliers can update own bid documents" ON storage.objects;
CREATE POLICY "Suppliers can update own bid documents"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'bid-documents'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Suppliers can delete their bid documents before submission
DROP POLICY IF EXISTS "Suppliers can delete own bid documents" ON storage.objects;
CREATE POLICY "Suppliers can delete own bid documents"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'bid-documents'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- =============================================================================
-- STORAGE POLICIES - contract-documents (Restricted Access)
-- =============================================================================

-- Contract parties and admins can view contract documents
DROP POLICY IF EXISTS "Contract parties can view contract documents" ON storage.objects;
CREATE POLICY "Contract parties can view contract documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'contract-documents'
  AND (
    auth.uid()::text = (storage.foldername(name))[1]
    OR EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND u.role IN ('SYSTEM_ADMIN', 'NPC_ADMIN', 'NPC_OFFICER', 'PROCUREMENT_OFFICER', 'FINANCE_OFFICER')
    )
  )
);

-- Admins can upload contract documents
DROP POLICY IF EXISTS "Admins can upload contract documents" ON storage.objects;
CREATE POLICY "Admins can upload contract documents"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'contract-documents'
  AND EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()
    AND u.role IN ('SYSTEM_ADMIN', 'NPC_ADMIN', 'NPC_OFFICER', 'PROCUREMENT_OFFICER')
  )
);

-- =============================================================================
-- STORAGE POLICIES - supplier-documents (Owner + Admin Access)
-- =============================================================================

-- Suppliers can view their own documents, admins can view all
DROP POLICY IF EXISTS "Supplier document access" ON storage.objects;
CREATE POLICY "Supplier document access"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'supplier-documents'
  AND (
    auth.uid()::text = (storage.foldername(name))[1]
    OR EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND u.role IN ('SYSTEM_ADMIN', 'NPC_ADMIN', 'NPC_OFFICER')
    )
  )
);

-- Suppliers can upload their documents
DROP POLICY IF EXISTS "Suppliers can upload own documents" ON storage.objects;
CREATE POLICY "Suppliers can upload own documents"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'supplier-documents'
  AND auth.role() = 'authenticated'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Suppliers can update their documents
DROP POLICY IF EXISTS "Suppliers can update own documents" ON storage.objects;
CREATE POLICY "Suppliers can update own documents"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'supplier-documents'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Suppliers can delete their documents
DROP POLICY IF EXISTS "Suppliers can delete own documents" ON storage.objects;
CREATE POLICY "Suppliers can delete own documents"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'supplier-documents'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- =============================================================================
-- STORAGE POLICIES - profile-images (Public Read, Owner Write)
-- =============================================================================

-- Anyone can view profile images
DROP POLICY IF EXISTS "Public can view profile images" ON storage.objects;
CREATE POLICY "Public can view profile images"
ON storage.objects FOR SELECT
USING (bucket_id = 'profile-images');

-- Users can upload their profile images
DROP POLICY IF EXISTS "Users can upload profile images" ON storage.objects;
CREATE POLICY "Users can upload profile images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'profile-images'
  AND auth.role() = 'authenticated'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can update their profile images
DROP POLICY IF EXISTS "Users can update profile images" ON storage.objects;
CREATE POLICY "Users can update profile images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'profile-images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can delete their profile images
DROP POLICY IF EXISTS "Users can delete profile images" ON storage.objects;
CREATE POLICY "Users can delete profile images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'profile-images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- =============================================================================
-- STORAGE POLICIES - payment-proofs (Supplier + Admin Access)
-- =============================================================================

-- Suppliers can view their payment proofs, NPC admins can view all
DROP POLICY IF EXISTS "Payment proof access" ON storage.objects;
CREATE POLICY "Payment proof access"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'payment-proofs'
  AND (
    auth.uid()::text = (storage.foldername(name))[1]
    OR EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND u.role IN ('SYSTEM_ADMIN', 'NPC_ADMIN', 'FINANCE_OFFICER')
    )
  )
);

-- Suppliers can upload payment proofs
DROP POLICY IF EXISTS "Suppliers can upload payment proofs" ON storage.objects;
CREATE POLICY "Suppliers can upload payment proofs"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'payment-proofs'
  AND auth.role() = 'authenticated'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- =============================================================================
-- STORAGE POLICIES - evaluation-reports (Restricted to Evaluators + Admins)
-- =============================================================================

-- Evaluators and admins can view evaluation reports
DROP POLICY IF EXISTS "Evaluation report access" ON storage.objects;
CREATE POLICY "Evaluation report access"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'evaluation-reports'
  AND EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()
    AND u.role IN ('SYSTEM_ADMIN', 'NPC_ADMIN', 'NPC_OFFICER', 'EVALUATOR', 'AUDITOR')
  )
);

-- Evaluators can upload evaluation reports
DROP POLICY IF EXISTS "Evaluators can upload reports" ON storage.objects;
CREATE POLICY "Evaluators can upload reports"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'evaluation-reports'
  AND EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()
    AND u.role IN ('SYSTEM_ADMIN', 'NPC_ADMIN', 'NPC_OFFICER', 'EVALUATOR')
  )
);

-- =============================================================================
-- STORAGE POLICIES - audit-attachments (Auditors + Admins Only)
-- =============================================================================

-- Auditors and admins can view audit attachments
DROP POLICY IF EXISTS "Audit attachment access" ON storage.objects;
CREATE POLICY "Audit attachment access"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'audit-attachments'
  AND EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()
    AND u.role IN ('SYSTEM_ADMIN', 'NPC_ADMIN', 'AUDITOR')
  )
);

-- Auditors can upload audit attachments
DROP POLICY IF EXISTS "Auditors can upload attachments" ON storage.objects;
CREATE POLICY "Auditors can upload attachments"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'audit-attachments'
  AND EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()
    AND u.role IN ('SYSTEM_ADMIN', 'NPC_ADMIN', 'AUDITOR')
  )
);

-- =============================================================================
-- VERIFICATION QUERY
-- =============================================================================

SELECT
  id as bucket_id,
  name as bucket_name,
  public as is_public,
  file_size_limit / 1048576 as max_size_mb,
  created_at
FROM storage.buckets
WHERE id IN (
  'tender-documents',
  'bid-documents',
  'contract-documents',
  'supplier-documents',
  'profile-images',
  'payment-proofs',
  'evaluation-reports',
  'audit-attachments'
)
ORDER BY name;
