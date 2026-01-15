'use client';

import { useState, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Upload,
  File,
  FileText,
  Image,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { uploadFile, formatBytes, type StorageBucket, type UploadResult } from '@/lib/storage/file-upload';
import { cn } from '@/lib/utils';

export interface FileUploadProps {
  bucket: StorageBucket;
  pathPrefix?: string;
  accept?: string;
  maxFiles?: number;
  maxSize?: number; // in MB
  onUploadComplete?: (results: UploadResult[]) => void;
  onUploadError?: (error: string) => void;
  disabled?: boolean;
  className?: string;
}

interface UploadingFile {
  id: string;
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'complete' | 'error';
  result?: UploadResult;
  error?: string;
}

function getFileIcon(mimeType: string) {
  if (mimeType.startsWith('image/')) {
    return <Image className="h-5 w-5 text-blue-500" />;
  }
  if (mimeType === 'application/pdf') {
    return <FileText className="h-5 w-5 text-red-500" />;
  }
  return <File className="h-5 w-5 text-slate-500" />;
}

export function FileUpload({
  bucket,
  pathPrefix,
  accept,
  maxFiles = 5,
  maxSize = 50,
  onUploadComplete,
  onUploadError,
  disabled = false,
  className,
}: FileUploadProps) {
  const [files, setFiles] = useState<UploadingFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragging(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleFilesSelected = useCallback((selectedFiles: File[]) => {
    // Limit number of files
    const filesToAdd = selectedFiles.slice(0, maxFiles - files.length);

    // Validate file sizes
    const validFiles = filesToAdd.filter(file => {
      const maxSizeBytes = maxSize * 1024 * 1024;
      if (file.size > maxSizeBytes) {
        onUploadError?.(`File "${file.name}" exceeds maximum size of ${maxSize}MB`);
        return false;
      }
      return true;
    });

    // Add files to state
    const newFiles: UploadingFile[] = validFiles.map(file => ({
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      file,
      progress: 0,
      status: 'pending' as const,
    }));

    setFiles(prev => [...prev, ...newFiles]);
  }, [maxFiles, files.length, maxSize, onUploadError]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled) return;

    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFilesSelected(droppedFiles);
  }, [disabled, handleFilesSelected]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    handleFilesSelected(selectedFiles);
    // Reset input
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const uploadFiles = async () => {
    const pendingFiles = files.filter(f => f.status === 'pending');
    if (pendingFiles.length === 0) return;

    setIsUploading(true);
    const results: UploadResult[] = [];

    for (const uploadingFile of pendingFiles) {
      // Update status to uploading
      setFiles(prev => prev.map(f =>
        f.id === uploadingFile.id ? { ...f, status: 'uploading' as const, progress: 10 } : f
      ));

      try {
        // Generate path with prefix
        const path = pathPrefix
          ? `${pathPrefix}/${Date.now()}-${uploadingFile.file.name}`
          : undefined;

        // Upload file
        const result = await uploadFile({
          bucket,
          path: path || '',
          file: uploadingFile.file,
        });

        results.push(result);

        // Update file status
        setFiles(prev => prev.map(f =>
          f.id === uploadingFile.id
            ? {
                ...f,
                status: result.success ? 'complete' as const : 'error' as const,
                progress: 100,
                result,
                error: result.error,
              }
            : f
        ));
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Upload failed';

        setFiles(prev => prev.map(f =>
          f.id === uploadingFile.id
            ? { ...f, status: 'error' as const, progress: 0, error: errorMessage }
            : f
        ));

        results.push({ success: false, error: errorMessage });
      }
    }

    setIsUploading(false);
    onUploadComplete?.(results);
  };

  const clearCompleted = () => {
    setFiles(prev => prev.filter(f => f.status !== 'complete'));
  };

  const hasFiles = files.length > 0;
  const hasPending = files.some(f => f.status === 'pending');
  const hasCompleted = files.some(f => f.status === 'complete');

  return (
    <div className={cn('space-y-4', className)}>
      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && inputRef.current?.click()}
        className={cn(
          'relative border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer',
          isDragging && 'border-red-400 bg-red-50',
          !isDragging && !disabled && 'border-slate-200 hover:border-slate-300 hover:bg-slate-50',
          disabled && 'opacity-50 cursor-not-allowed bg-slate-50'
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={maxFiles > 1}
          onChange={handleInputChange}
          disabled={disabled}
          className="hidden"
        />

        <Upload className={cn(
          'h-10 w-10 mx-auto mb-3',
          isDragging ? 'text-red-500' : 'text-slate-400'
        )} />

        <p className="text-sm font-medium text-slate-700">
          {isDragging ? 'Drop files here' : 'Click to upload or drag and drop'}
        </p>
        <p className="text-xs text-slate-500 mt-1">
          Maximum {maxFiles} files, up to {maxSize}MB each
        </p>
        {accept && (
          <p className="text-xs text-slate-400 mt-1">
            Accepted: {accept}
          </p>
        )}
      </div>

      {/* File List */}
      {hasFiles && (
        <div className="space-y-2">
          {files.map(uploadingFile => (
            <div
              key={uploadingFile.id}
              className={cn(
                'flex items-center gap-3 p-3 rounded-lg border',
                uploadingFile.status === 'complete' && 'bg-emerald-50 border-emerald-200',
                uploadingFile.status === 'error' && 'bg-red-50 border-red-200',
                uploadingFile.status === 'pending' && 'bg-slate-50 border-slate-200',
                uploadingFile.status === 'uploading' && 'bg-blue-50 border-blue-200'
              )}
            >
              {/* File Icon */}
              {getFileIcon(uploadingFile.file.type)}

              {/* File Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-700 truncate">
                  {uploadingFile.file.name}
                </p>
                <p className="text-xs text-slate-500">
                  {formatBytes(uploadingFile.file.size)}
                </p>

                {/* Progress Bar */}
                {uploadingFile.status === 'uploading' && (
                  <Progress value={uploadingFile.progress} className="h-1 mt-2" />
                )}

                {/* Error Message */}
                {uploadingFile.status === 'error' && uploadingFile.error && (
                  <p className="text-xs text-red-600 mt-1">{uploadingFile.error}</p>
                )}
              </div>

              {/* Status Icon */}
              <div className="flex-shrink-0">
                {uploadingFile.status === 'complete' && (
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                )}
                {uploadingFile.status === 'error' && (
                  <AlertCircle className="h-5 w-5 text-red-500" />
                )}
                {uploadingFile.status === 'uploading' && (
                  <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
                )}
                {uploadingFile.status === 'pending' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(uploadingFile.id);
                    }}
                    className="p-1 hover:bg-slate-200 rounded"
                  >
                    <X className="h-4 w-4 text-slate-400" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      {hasFiles && (
        <div className="flex gap-2">
          {hasPending && (
            <Button
              onClick={uploadFiles}
              disabled={isUploading || disabled}
              className="bg-red-600 hover:bg-red-700"
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload {files.filter(f => f.status === 'pending').length} File(s)
                </>
              )}
            </Button>
          )}
          {hasCompleted && (
            <Button variant="outline" onClick={clearCompleted}>
              Clear Completed
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
