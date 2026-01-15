/**
 * Sealed Bid Encryption Service
 * Implements AES-256-GCM encryption for sealed bid submissions
 * Bids remain encrypted until the deadline passes and auto-opening is triggered
 */

// Generate a random encryption key
export async function generateEncryptionKey(): Promise<CryptoKey> {
  return await crypto.subtle.generateKey(
    {
      name: 'AES-GCM',
      length: 256,
    },
    true,
    ['encrypt', 'decrypt']
  );
}

// Export key to base64 for storage
export async function exportKey(key: CryptoKey): Promise<string> {
  const exported = await crypto.subtle.exportKey('raw', key);
  return arrayBufferToBase64(exported);
}

// Import key from base64
export async function importKey(keyString: string): Promise<CryptoKey> {
  const keyBuffer = base64ToArrayBuffer(keyString);
  return await crypto.subtle.importKey(
    'raw',
    keyBuffer,
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
}

// Encrypt bid data
export async function encryptBidData(
  data: BidSubmissionData,
  key: CryptoKey
): Promise<EncryptedBid> {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(JSON.stringify(data));

  // Generate random IV (Initialization Vector)
  const iv = crypto.getRandomValues(new Uint8Array(12));

  // Encrypt the data
  const encryptedBuffer = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv,
    },
    key,
    dataBuffer
  );

  // Create hash for integrity verification
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  const hash = arrayBufferToBase64(hashBuffer);

  return {
    encryptedData: arrayBufferToBase64(encryptedBuffer),
    iv: arrayBufferToBase64(iv.buffer),
    hash,
    encryptedAt: new Date(),
    algorithm: 'AES-256-GCM',
  };
}

// Decrypt bid data (only after deadline)
export async function decryptBidData(
  encryptedBid: EncryptedBid,
  key: CryptoKey
): Promise<BidSubmissionData> {
  const encryptedBuffer = base64ToArrayBuffer(encryptedBid.encryptedData);
  const iv = base64ToArrayBuffer(encryptedBid.iv);

  const decryptedBuffer = await crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: new Uint8Array(iv),
    },
    key,
    encryptedBuffer
  );

  const decoder = new TextDecoder();
  const jsonString = decoder.decode(decryptedBuffer);
  return JSON.parse(jsonString);
}

// Verify bid integrity
export async function verifyBidIntegrity(
  data: BidSubmissionData,
  expectedHash: string
): Promise<boolean> {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(JSON.stringify(data));
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  const actualHash = arrayBufferToBase64(hashBuffer);
  return actualHash === expectedHash;
}

// Helper functions for base64 conversion
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

// Types
export interface BidSubmissionData {
  tenderId: string;
  tenderRef: string;
  supplierId: string;
  supplierName: string;
  bidAmount: number;
  currency: string;
  validityDays: number;
  technicalProposal?: {
    fileName: string;
    fileSize: number;
    fileHash: string;
  };
  financialProposal?: {
    fileName: string;
    fileSize: number;
    fileHash: string;
  };
  additionalDocuments?: Array<{
    fileName: string;
    fileSize: number;
    fileHash: string;
  }>;
  declarations: {
    accuracyConfirmed: boolean;
    conflictOfInterestDeclared: boolean;
    termsAccepted: boolean;
  };
  submittedAt: Date;
  submittedBy: string;
}

export interface EncryptedBid {
  encryptedData: string;
  iv: string;
  hash: string;
  encryptedAt: Date;
  algorithm: string;
}

export interface SealedBid {
  id: string;
  tenderId: string;
  tenderRef: string;
  supplierId: string;
  supplierName: string;
  encryptedBid: EncryptedBid;
  sealedAt: Date;
  openingDeadline: Date;
  status: 'SEALED' | 'OPENED' | 'WITHDRAWN' | 'DISQUALIFIED';
  openedAt?: Date;
  openedBy?: string;
  decryptedBid?: BidSubmissionData;
}

/**
 * Sealed Bid Manager
 * Manages the lifecycle of sealed bids including auto-opening
 */
export class SealedBidManager {
  private encryptionKey: CryptoKey | null = null;
  private keyString: string | null = null;

  async initialize(): Promise<void> {
    this.encryptionKey = await generateEncryptionKey();
    this.keyString = await exportKey(this.encryptionKey);
  }

  async sealBid(
    bidData: BidSubmissionData,
    openingDeadline: Date
  ): Promise<SealedBid> {
    if (!this.encryptionKey) {
      await this.initialize();
    }

    const encryptedBid = await encryptBidData(bidData, this.encryptionKey!);

    const sealedBid: SealedBid = {
      id: `BID-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      tenderId: bidData.tenderId,
      tenderRef: bidData.tenderRef,
      supplierId: bidData.supplierId,
      supplierName: bidData.supplierName,
      encryptedBid,
      sealedAt: new Date(),
      openingDeadline,
      status: 'SEALED',
    };

    return sealedBid;
  }

  async openBid(sealedBid: SealedBid, userId: string): Promise<SealedBid> {
    // Check if deadline has passed
    const now = new Date();
    if (now < sealedBid.openingDeadline) {
      throw new Error(
        `Cannot open bid before deadline. Deadline: ${sealedBid.openingDeadline.toISOString()}`
      );
    }

    if (sealedBid.status !== 'SEALED') {
      throw new Error(`Bid is not in SEALED status. Current status: ${sealedBid.status}`);
    }

    if (!this.encryptionKey) {
      throw new Error('Encryption key not initialized');
    }

    const decryptedBid = await decryptBidData(sealedBid.encryptedBid, this.encryptionKey);

    // Verify integrity
    const isValid = await verifyBidIntegrity(decryptedBid, sealedBid.encryptedBid.hash);
    if (!isValid) {
      throw new Error('Bid integrity verification failed');
    }

    return {
      ...sealedBid,
      status: 'OPENED',
      openedAt: now,
      openedBy: userId,
      decryptedBid,
    };
  }

  canOpenBid(sealedBid: SealedBid): boolean {
    const now = new Date();
    return now >= sealedBid.openingDeadline && sealedBid.status === 'SEALED';
  }

  getTimeUntilOpening(sealedBid: SealedBid): number {
    const now = new Date();
    return Math.max(0, sealedBid.openingDeadline.getTime() - now.getTime());
  }
}

// Export a singleton instance
export const sealedBidManager = new SealedBidManager();
