/**
 * PNG eGP System - File Upload Service
 *
 * Handles file uploads to Supabase Storage
 */

import { getSupabaseClient } from '@/lib/supabase/client';

export type StorageBucket =
  | 'tender-documents'
  | 'bid-documents'
  | 'contract-documents'
  | 'supplier-documents'
  | 'profile-images'
  | 'payment-proofs'
  | 'evaluation-reports'
  | 'audit-attachments';

export interface UploadOptions {
  bucket: StorageBucket;
  path: string;
  file: File;
  onProgress?: (progress: number) => void;
  upsert?: boolean;
}

export interface UploadResult {
  success: boolean;
  url?: string;
  path?: string;
  size?: number;
  error?: string;
}

export interface FileMetadata {
  id: string;
  name: string;
  size: number;
  mimeType: string;
  bucket: string;
  path: string;
  url: string;
  createdAt: Date;
  updatedBy: string;
  hash?: string;
}

// Maximum file sizes by type (in bytes)
const MAX_FILE_SIZES: Record<string, number> = {
  'application/pdf': 50 * 1024 * 1024, // 50MB
  'image/jpeg': 10 * 1024 * 1024, // 10MB
  'image/png': 10 * 1024 * 1024, // 10MB
  'image/gif': 5 * 1024 * 1024, // 5MB
  'application/msword': 25 * 1024 * 1024, // 25MB
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 25 * 1024 * 1024,
  'application/vnd.ms-excel': 25 * 1024 * 1024,
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 25 * 1024 * 1024,
  'default': 50 * 1024 * 1024, // 50MB default
};

// Allowed MIME types by bucket
const ALLOWED_TYPES: Record<StorageBucket, string[]> = {
  'tender-documents': [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ],
  'bid-documents': [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/zip',
  ],
  'contract-documents': [
    'application/pdf',
  ],
  'supplier-documents': [
    'application/pdf',
    'image/jpeg',
    'image/png',
  ],
  'profile-images': [
    'image/jpeg',
    'image/png',
    'image/gif',
  ],
  'payment-proofs': [
    'application/pdf',
    'image/jpeg',
    'image/png',
  ],
  'evaluation-reports': [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ],
  'audit-attachments': [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'application/zip',
  ],
};

/**
 * Validate file before upload
 */
function validateFile(file: File, bucket: StorageBucket): { valid: boolean; error?: string } {
  // Check MIME type
  const allowedTypes = ALLOWED_TYPES[bucket];
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File type ${file.type} is not allowed. Allowed types: ${allowedTypes.join(', ')}`,
    };
  }

  // Check file size
  const maxSize = MAX_FILE_SIZES[file.type] || MAX_FILE_SIZES['default'];
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File size ${formatBytes(file.size)} exceeds maximum allowed size of ${formatBytes(maxSize)}`,
    };
  }

  return { valid: true };
}

/**
 * Format bytes to human readable string
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Generate a unique file path
 */
function generateFilePath(bucket: StorageBucket, originalName: string, prefix?: string): string {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 8);
  const extension = originalName.split('.').pop() || '';
  const sanitizedName = originalName
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .substring(0, 50);

  const fileName = `${timestamp}-${randomString}-${sanitizedName}`;

  if (prefix) {
    return `${prefix}/${fileName}`;
  }

  return fileName;
}

/**
 * Calculate file hash (SHA-256)
 */
async function calculateHash(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Upload a file to Supabase Storage
 */
export async function uploadFile(options: UploadOptions): Promise<UploadResult> {
  const { bucket, path, file, upsert = false } = options;

  // Validate file
  const validation = validateFile(file, bucket);
  if (!validation.valid) {
    return {
      success: false,
      error: validation.error,
    };
  }

  try {
    const supabase = getSupabaseClient();

    // Generate unique path if not provided
    const filePath = path || generateFilePath(bucket, file.name);

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert,
        contentType: file.type,
      });

    if (error) {
      throw error;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return {
      success: true,
      url: urlData.publicUrl,
      path: data.path,
      size: file.size,
    };
  } catch (error) {
    console.error('[Upload] Failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
    };
  }
}

/**
 * Upload multiple files
 */
export async function uploadMultipleFiles(
  files: File[],
  bucket: StorageBucket,
  prefix?: string
): Promise<UploadResult[]> {
  const results: UploadResult[] = [];

  for (const file of files) {
    const path = generateFilePath(bucket, file.name, prefix);
    const result = await uploadFile({ bucket, path, file });
    results.push(result);
  }

  return results;
}

/**
 * Delete a file from Supabase Storage
 */
export async function deleteFile(bucket: StorageBucket, path: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = getSupabaseClient();

    const { error } = await supabase.storage
      .from(bucket)
      .remove([path]);

    if (error) {
      throw error;
    }

    return { success: true };
  } catch (error) {
    console.error('[Delete] Failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Delete failed',
    };
  }
}

/**
 * Get a signed URL for private files
 */
export async function getSignedUrl(
  bucket: StorageBucket,
  path: string,
  expiresIn: number = 3600 // 1 hour default
): Promise<{ url?: string; error?: string }> {
  try {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, expiresIn);

    if (error) {
      throw error;
    }

    return { url: data.signedUrl };
  } catch (error) {
    console.error('[SignedURL] Failed:', error);
    return {
      error: error instanceof Error ? error.message : 'Failed to generate signed URL',
    };
  }
}

/**
 * List files in a bucket/folder
 */
export async function listFiles(
  bucket: StorageBucket,
  folder?: string
): Promise<{ files: FileMetadata[]; error?: string }> {
  try {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase.storage
      .from(bucket)
      .list(folder || '', {
        limit: 100,
        sortBy: { column: 'created_at', order: 'desc' },
      });

    if (error) {
      throw error;
    }

    const files: FileMetadata[] = (data || [])
      .filter(item => item.id) // Filter out folders
      .map(item => ({
        id: item.id!,
        name: item.name,
        size: item.metadata?.size || 0,
        mimeType: item.metadata?.mimetype || 'application/octet-stream',
        bucket,
        path: folder ? `${folder}/${item.name}` : item.name,
        url: supabase.storage.from(bucket).getPublicUrl(folder ? `${folder}/${item.name}` : item.name).data.publicUrl,
        createdAt: new Date(item.created_at),
        updatedBy: item.metadata?.lastModified || '',
      }));

    return { files };
  } catch (error) {
    console.error('[List] Failed:', error);
    return {
      files: [],
      error: error instanceof Error ? error.message : 'Failed to list files',
    };
  }
}

/**
 * Download a file
 */
export async function downloadFile(bucket: StorageBucket, path: string): Promise<{ blob?: Blob; error?: string }> {
  try {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase.storage
      .from(bucket)
      .download(path);

    if (error) {
      throw error;
    }

    return { blob: data };
  } catch (error) {
    console.error('[Download] Failed:', error);
    return {
      error: error instanceof Error ? error.message : 'Download failed',
    };
  }
}

// Export utilities
export { validateFile, formatBytes, generateFilePath, calculateHash };
