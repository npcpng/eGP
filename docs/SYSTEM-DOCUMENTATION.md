# PNG National e-Government Procurement (eGP) System
## Comprehensive Technical and User Documentation

**Version:** 1.0
**Date:** January 2026
**Document Type:** Technical & User Documentation

---

## Table of Contents

1. [Executive Overview](#1-executive-overview)
2. [System Architecture](#2-system-architecture)
3. [Functional Areas by Procurement Lifecycle](#3-functional-areas-by-procurement-lifecycle)
4. [Module Documentation](#4-module-documentation)
5. [Data Types & Models](#5-data-types--models)
6. [State Management](#6-state-management)
7. [Security & Compliance](#7-security--compliance)
8. [Integration Services](#8-integration-services)
9. [Development Status](#9-development-status)

---

## 1. Executive Overview

### 1.1 Purpose
The PNG National e-Government Procurement (eGP) System is a comprehensive digital platform designed to manage the entire public procurement lifecycle for the Government of Papua New Guinea. The system ensures transparency, efficiency, and compliance with national and international procurement standards.

### 1.2 Key Objectives
- **Transparency:** All procurement activities are logged and publicly accessible
- **Efficiency:** Streamlined workflows reduce processing time
- **Compliance:** Built-in controls ensure adherence to PNG procurement laws and OCDS standards
- **Accessibility:** Web-based system accessible from any location
- **Security:** AES-256-GCM encryption for sealed bids, role-based access control

### 1.3 Target Users
| User Role | Primary Functions |
|-----------|-------------------|
| System Admin | Full system configuration and user management |
| NPC Admin | National Procurement Commission oversight |
| NPC Officer | Tender management, compliance monitoring |
| Agency Head | Approval authority for their organization |
| Procurement Officer | Day-to-day procurement operations |
| Finance Officer | Budget management and payment processing |
| Evaluator | Bid evaluation and scoring |
| Auditor | Read-only access for audit purposes |
| Supplier | Bid submission and contract management |
| Public Viewer | Read-only access to public notices |

---

## 2. System Architecture

### 2.1 Technology Stack
```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND LAYER                            │
├─────────────────────────────────────────────────────────────┤
│  Next.js 15  │  React 18  │  TypeScript  │  Tailwind CSS   │
│  shadcn/ui   │  Recharts  │  Lucide Icons                   │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                    STATE MANAGEMENT                          │
├─────────────────────────────────────────────────────────────┤
│  Zustand Stores  │  Persistent Storage  │  IndexedDB       │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                    SERVICE LAYER                             │
├─────────────────────────────────────────────────────────────┤
│  Encryption   │  WebSocket  │  Notifications │  PDF Gen    │
│  AES-256-GCM  │  Real-time  │  Email Queue   │  Reports    │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                    PWA LAYER                                 │
├─────────────────────────────────────────────────────────────┤
│  Service Worker  │  Offline Forms  │  Push Notifications   │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Directory Structure
```
png-egp-system/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── admin/              # Administration pages
│   │   ├── auctions/           # Auction management
│   │   ├── audit/              # Audit trail
│   │   ├── bids/               # Bid management
│   │   ├── contracts/          # Contract management
│   │   ├── evaluations/        # Evaluation workspace
│   │   ├── marketplace/        # Catalogue purchasing
│   │   ├── offline/            # Offline fallback
│   │   ├── planning/           # Procurement planning
│   │   ├── reports/            # Analytics & reporting
│   │   ├── suppliers/          # Supplier management
│   │   └── tenders/            # Tender management
│   ├── components/
│   │   ├── bids/               # Bid-related components
│   │   ├── layout/             # Layout components
│   │   ├── notifications/      # Notification components
│   │   └── ui/                 # shadcn/ui components
│   ├── lib/                    # Utility libraries
│   │   ├── encryption.ts       # Sealed bid encryption
│   │   ├── notifications.ts    # Email notification engine
│   │   ├── websocket.ts        # Real-time updates
│   │   ├── pdf-generator.ts    # PDF report generation
│   │   └── offline.ts          # Offline form management
│   ├── stores/                 # Zustand state stores
│   └── types/                  # TypeScript definitions
├── public/
│   ├── sw.js                   # Service Worker
│   └── manifest.json           # PWA manifest
└── docs/                       # Documentation
```

---

## 3. Functional Areas by Procurement Lifecycle

The system is organized into logical functional areas that follow the standard public procurement lifecycle:

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                         PROCUREMENT LIFECYCLE                                 │
├───────────┬───────────┬───────────┬───────────┬───────────┬─────────────────┤
│  PHASE 1  │  PHASE 2  │  PHASE 3  │  PHASE 4  │  PHASE 5  │    PHASE 6      │
│  PLANNING │  SOURCING │EVALUATION │  AWARD    │ CONTRACT  │ IMPLEMENTATION  │
│           │           │           │           │MANAGEMENT │  & MONITORING   │
├───────────┼───────────┼───────────┼───────────┼───────────┼─────────────────┤
│• Annual   │• Tender   │• Bid      │• Award    │• Contract │• Milestone      │
│  Plans    │  Creation │  Opening  │  Decision │  Creation │  Tracking       │
│• Budget   │• Bidder   │• Scoring  │• Approval │• eSign    │• Payment        │
│  Planning │  Portal   │• COI      │  Workflow │• Variation│  Processing     │
│• Calendar │• Bid      │  Checks   │• Notice   │  Orders   │• Performance    │
│           │  Submission│          │           │           │  Evaluation     │
└───────────┴───────────┴───────────┴───────────┴───────────┴─────────────────┘
```

---

## 4. Module Documentation

### 4.1 PLANNING MODULE

**Location:** `/src/app/planning/`

**Purpose:** Enables government agencies to create and manage Annual Procurement Plans (APPs) aligned with budget cycles.

#### 4.1.1 Annual Procurement Plans
**Page:** `/planning/annual-plans`

**Functions:**
| Function | Description | User Actions |
|----------|-------------|--------------|
| View Plans | Display all APPs by fiscal year | Filter by status, organization |
| Create Plan | Generate new APP for agency | Add items, set budgets, categories |
| Edit Plan | Modify draft plans | Update values, add/remove items |
| Submit for Approval | Route to approval workflow | Initiates multi-step approval |
| Consolidate Plans | NPC consolidates agency plans | View national procurement outlook |

**Data Model:**
```typescript
interface AnnualProcurementPlan {
  id: string;
  fiscalYear: number;
  organizationId: string;
  status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'PUBLISHED';
  totalBudget: Money;
  items: ProcurementPlanItem[];
  approvalChain: ApprovalRecord[];
}
```

**Business Rules:**
- Plans must be approved before tenders can be created
- Only one active plan per fiscal year per organization
- Items must have UNSPSC codes for categorization
- Estimated values determine procurement method thresholds

---

### 4.2 SOURCING MODULE

**Location:** `/src/app/tenders/`, `/src/app/bids/`

**Purpose:** Manages the entire tender lifecycle from publication to bid submission.

#### 4.2.1 Tender Management
**Page:** `/tenders`

**Functions:**
| Function | Description | User Actions |
|----------|-------------|--------------|
| Create Tender | Generate tender from APP or direct | Complete tender form |
| Publish Tender | Make tender publicly visible | Approve and publish |
| Manage Documents | Attach specifications, ToRs | Upload/download files |
| Issue Clarifications | Respond to bidder questions | Post Q&A publicly |
| Issue Addenda | Modify published tenders | Update specs, extend deadlines |

**Procurement Methods Supported:**
- Open Tender (> K500,000)
- Restricted Tender (K100,000 - K500,000)
- Request for Quotation (< K100,000)
- Direct Procurement (Emergency/Sole Source)
- Framework Agreement Call-offs
- Emergency Procurement

**Data Model:**
```typescript
interface Tender {
  id: string;
  referenceNumber: string;
  title: string;
  procurementMethod: ProcurementMethod;
  status: TenderStatus;
  estimatedValue: Money;
  submissionDeadline: Date;
  openingDate: Date;
  documents: TenderDocument[];
  evaluationCriteria: EvaluationCriteria[];
  clarifications: Clarification[];
  addenda: Addendum[];
}
```

**Tender Statuses Flow:**
```
DRAFT → PENDING_APPROVAL → APPROVED → PUBLISHED → OPEN_FOR_BIDDING → CLOSED → UNDER_EVALUATION → EVALUATED → AWARDED
```

#### 4.2.2 Bidder Portal
**Page:** `/tenders/bidder-portal`
**New Feature**

**Purpose:** Supplier-facing interface for discovering and submitting bids.

**Functions:**
| Function | Description |
|----------|-------------|
| Browse Opportunities | View all open tenders |
| Search & Filter | Find relevant tenders by category, value, deadline |
| Download Documents | Access tender specifications |
| Prepare Bid | Enter bid details, prices, validity |
| Upload Documents | Attach technical/financial proposals |
| Submit Sealed Bid | Encrypt and submit bid securely |
| Confirm Submission | Receive digital receipt |

**Security Features:**
- Bids encrypted using AES-256-GCM before storage
- Hash verification ensures bid integrity
- Bids cannot be viewed until official opening time
- Supplier receives encrypted confirmation receipt

#### 4.2.3 Sealed Bid Encryption
**Library:** `/src/lib/encryption.ts`

**Purpose:** Ensures bid confidentiality until official opening time.

**Technical Implementation:**
```typescript
// Key operations available
generateEncryptionKey(): Promise<CryptoKey>
encryptBidData(data: BidSubmissionData, key: CryptoKey): Promise<EncryptedBid>
decryptBidData(encryptedBid: EncryptedBid, key: CryptoKey): Promise<BidSubmissionData>
verifyBidIntegrity(data: BidSubmissionData, expectedHash: string): Promise<boolean>
```

**Encryption Process:**
1. Supplier submits bid data
2. System generates random IV (Initialization Vector)
3. Bid data encrypted with AES-256-GCM
4. SHA-256 hash created for integrity verification
5. Encrypted blob + IV + hash stored
6. Supplier receives confirmation with bid reference

**Decryption Process (at opening time):**
1. Committee verifies deadline has passed
2. System retrieves encryption key from secure storage
3. Each bid decrypted in sequence
4. Hash verification confirms integrity
5. Decrypted bids displayed to committee
6. PDF report generated for audit trail

#### 4.2.4 Bid Opening Management
**Page:** `/bids/opening`

**Purpose:** Formal bid opening ceremony with committee verification.

**Functions:**
| Function | Description |
|----------|-------------|
| Schedule Opening | Set date/time after submission deadline |
| Manage Committee | Add committee members, track attendance |
| Verify Quorum | Ensure minimum required members present |
| Open Bids | Decrypt and reveal bids sequentially |
| Record Minutes | Document opening proceedings |
| Generate Report | Create PDF bid opening report |

**Business Rules:**
- Opening cannot occur before deadline
- Minimum 3 committee members required
- All members must declare no conflict of interest
- Bids opened in order received
- Results immediately visible to bidders

---

### 4.3 EVALUATION MODULE

**Location:** `/src/app/evaluations/`

**Purpose:** Structured bid evaluation with conflict of interest controls.

#### 4.3.1 Evaluation Workspace
**Page:** `/evaluations`

**Functions:**
| Function | Description |
|----------|-------------|
| Assign Evaluators | Allocate bids to evaluation committee |
| Declare COI | Committee members declare conflicts |
| Score Technical | Rate technical proposals against criteria |
| Score Financial | Evaluate price competitiveness |
| Calculate Combined | Apply evaluation formula |
| Generate Ranking | Produce final bid rankings |
| Document Justification | Record scoring rationale |

**Evaluation Methods:**
1. **Lowest Price** - Responsive bid with lowest price wins
2. **Quality-Cost Based (QCBS)** - Weighted technical + financial scores
3. **Quality Only** - Technical evaluation for consultancy

**COI Declaration Requirements:**
```typescript
interface ConflictOfInterestDeclaration {
  userId: string;
  procurementId: string;
  hasConflict: boolean;
  conflictDetails?: string;
  declarationDate: Date;
  acknowledgedBy?: string;
}
```

---

### 4.4 CONTRACT MODULE

**Location:** `/src/app/contracts/`

**Purpose:** Full contract lifecycle management from creation to completion.

#### 4.4.1 Contract Management
**Page:** `/contracts`

**Functions:**
| Function | Description |
|----------|-------------|
| Create Contract | Generate from awarded tender |
| Manage Clauses | Standard and custom contract terms |
| Track Milestones | Monitor deliverables and dates |
| Process Variations | Handle scope/price changes |
| Record Payments | Track invoices and disbursements |
| Monitor Performance | Rate supplier delivery |
| eSignature | Digital contract signing |

**Contract Types:**
- Goods Supply
- Works (Construction)
- Services
- Consultancy

**Data Model:**
```typescript
interface Contract {
  id: string;
  referenceNumber: string;
  tenderId: string;
  bidId: string;
  supplierId: string;
  status: ContractStatus;
  value: Money;
  period: Period;
  milestones: ContractMilestone[];
  variations: ContractVariation[];
  payments: ContractPayment[];
  performanceRating?: number;
}
```

**Milestone Tracking:**
```typescript
interface ContractMilestone {
  number: number;
  title: string;
  dueDate: Date;
  completedDate?: Date;
  deliverables: string[];
  paymentPercentage?: number;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'DELAYED';
}
```

---

### 4.5 MARKETPLACE MODULE

**Location:** `/src/app/marketplace/`

**Purpose:** Catalogue-based purchasing for common items under framework agreements.

#### 4.5.1 Product Catalogue
**Page:** `/marketplace/catalogue`

**Functions:**
| Function | Description |
|----------|-------------|
| Browse Products | View items by category |
| Search Items | Find by name, UNSPSC code |
| Compare Prices | View framework pricing |
| Add to Cart | Select items for purchase |
| Create Purchase Order | Generate PO from cart |

**Data Model:**
```typescript
interface CatalogItem {
  id: string;
  supplierId: string;
  name: string;
  unspscCode: string;
  unitPrice: Money;
  specifications: Record<string, string>;
  frameworkAgreementId?: string;
}
```

#### 4.5.2 Purchase Orders
**Page:** `/marketplace/orders`

**Functions:**
| Function | Description |
|----------|-------------|
| Create Order | Generate PO from catalogue |
| Submit for Approval | Route to workflow |
| Track Delivery | Monitor shipment status |
| Confirm Receipt | Acknowledge goods delivered |
| Rate Supplier | Provide delivery feedback |

#### 4.5.3 Framework Agreements
**Page:** `/marketplace/frameworks`

**Purpose:** Pre-negotiated supplier agreements for common goods/services.

**Data Model:**
```typescript
interface FrameworkAgreement {
  id: string;
  referenceNumber: string;
  supplierId: string;
  category: string;
  status: 'DRAFT' | 'ACTIVE' | 'EXPIRED' | 'SUSPENDED';
  maxValue: Money;
  usedValue: Money;
  startDate: Date;
  endDate: Date;
}
```

---

### 4.6 AUCTION MODULE

**Location:** `/src/app/auctions/`

**Purpose:** Dynamic pricing mechanisms for procurement and asset disposal.

#### 4.6.1 Live Auctions
**Page:** `/auctions`

**Auction Types:**

| Type | Description | Use Case |
|------|-------------|----------|
| Reverse Auction | Price decreases over time | Procurement - suppliers compete on price |
| Forward Auction | Price increases over time | Asset disposal - buyers bid up |

**Functions:**
| Function | Description |
|----------|-------------|
| Create Auction | Set up auction parameters |
| Manage Participants | Approve eligible bidders |
| Monitor Live Bids | Real-time bid tracking |
| Extend Time | Auto-extend if bids near closing |
| Declare Winner | Determine successful bidder |

**Data Model:**
```typescript
interface Auction {
  id: string;
  type: 'FORWARD' | 'REVERSE';
  status: 'SCHEDULED' | 'OPEN' | 'CLOSED';
  startTime: Date;
  endTime: Date;
  reservePrice?: Money;
  currentPrice: Money;
  minimumDecrement?: Money;
  bids: AuctionBid[];
  winnerId?: string;
}
```

#### 4.6.2 Asset Disposal
**Page:** `/auctions/disposal`

**Purpose:** Manage disposal of government assets.

**Disposal Methods:**
- Auction (forward)
- Tender
- Direct Sale
- Transfer to other agency
- Destruction (for obsolete items)

---

### 4.7 SUPPLIER MODULE

**Location:** `/src/app/suppliers/`

**Purpose:** Central supplier registry and qualification management.

#### 4.7.1 Supplier Registry
**Page:** `/suppliers`

**Functions:**
| Function | Description |
|----------|-------------|
| Register Supplier | New supplier registration |
| Verify Documents | Check business registration, TIN |
| Manage Categories | Assign product/service categories |
| Track Qualification | Monitor qualification status |
| View History | Contract and performance history |
| Manage Blacklist | Track debarred suppliers |

**Supplier Classifications:**
- SME (Small & Medium Enterprise)
- Women-Owned Business
- Landowner Company
- Disabled-Owned
- Youth Enterprise

**Data Model:**
```typescript
interface Supplier {
  id: string;
  registrationNumber: string;
  name: string;
  type: 'COMPANY' | 'SOLE_TRADER' | 'PARTNERSHIP' | 'JOINT_VENTURE';
  status: SupplierStatus;
  address: Address;
  taxNumber: string;
  classifications: SupplierClassification[];
  qualifications: SupplierQualification[];
  performanceHistory: SupplierPerformance[];
}
```

#### 4.7.2 Pre-qualification
**Page:** `/suppliers/prequalification`

**Purpose:** Assess supplier capability before bidding.

**Qualification Levels:**
| Level | Max Contract Value | Requirements |
|-------|-------------------|--------------|
| Basic | K5,000,000 | Business registration, 1 year history |
| Standard | K15,000,000 | Audited financials, 3 references |
| Advanced | K50,000,000+ | ISO certification, 5+ years experience |

---

### 4.8 ANALYTICS MODULE

**Location:** `/src/app/reports/`

**Purpose:** Comprehensive reporting and business intelligence.

#### 4.8.1 KPI Dashboard
**Page:** `/reports/dashboard`

**Key Metrics Tracked:**
| Metric | Description |
|--------|-------------|
| Active Tenders | Currently open opportunities |
| Active Contracts | Ongoing contract count |
| Registered Suppliers | Total supplier base |
| Total Procurement Value | Aggregate tender value |
| Compliance Rate | On-time, documented tenders |
| Average Processing Days | Time from tender to contract |
| Savings Achieved | Difference from estimates |

#### 4.8.2 OCDS Export
**Page:** `/reports/ocds`

**Purpose:** Open Contracting Data Standard publication for transparency.

**OCDS Release Tags:**
- Planning
- Tender
- Award
- Contract
- Implementation

**Data Model:**
```typescript
interface OCDSRelease {
  ocid: string;
  id: string;
  date: string;
  tag: ('planning' | 'tender' | 'award' | 'contract' | 'implementation')[];
  initiationType: 'tender';
  parties: OCDSOrganization[];
  tender?: OCDSTender;
  awards?: OCDSAward[];
  contracts?: OCDSContract[];
}
```

#### 4.8.3 BI Connectors
**Page:** `/reports/bi`

**Purpose:** Integration with external business intelligence tools.

**Supported Platforms:**
- Power BI (via REST API)
- Tableau (via data export)
- Excel (direct export)

---

### 4.9 ADMINISTRATION MODULE

**Location:** `/src/app/admin/`

**Purpose:** System configuration and user management.

#### 4.9.1 Approval Workflows
**Page:** `/admin/workflows`

**Purpose:** Configurable multi-step approval processes.

**Workflow Types:**
| Type | Steps | Approvers |
|------|-------|-----------|
| Annual Plan | 3 | Procurement Officer → Agency Head → NPC |
| Tender Publication | 2 | Agency Head → NPC Officer |
| Award Decision | 3 | Evaluator → Procurement Officer → NPC Admin |
| Purchase Order | 2 | Finance Officer → Agency Head |
| Contract Variation | 3 | Procurement Officer → Finance → Agency Head |

**Data Model:**
```typescript
interface ApprovalWorkflow {
  id: string;
  entityType: WorkflowEntityType;
  entityId: string;
  currentStep: number;
  totalSteps: number;
  status: 'IN_PROGRESS' | 'APPROVED' | 'REJECTED' | 'RETURNED';
  steps: ApprovalStep[];
}
```

**Available Actions:**
- **Approve** - Move to next step
- **Reject** - End workflow with rejection
- **Return** - Send back for revision

#### 4.9.2 Audit Trail
**Page:** `/audit`

**Purpose:** Immutable record of all system activities.

**Tracked Actions:**
- CREATE, READ, UPDATE, DELETE
- APPROVE, REJECT, SUBMIT, PUBLISH
- AWARD, SIGN, LOGIN, LOGOUT

**Data Model:**
```typescript
interface AuditLog {
  id: string;
  userId: string;
  sessionId: string;
  action: AuditAction;
  entityType: string;
  entityId: string;
  previousState?: string;
  newState?: string;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
}
```

---

## 5. Data Types & Models

### 5.1 Core Enumerations

```typescript
// User Roles
type UserRole =
  | 'SYSTEM_ADMIN' | 'NPC_ADMIN' | 'NPC_OFFICER'
  | 'AGENCY_HEAD' | 'PROCUREMENT_OFFICER' | 'FINANCE_OFFICER'
  | 'EVALUATOR' | 'AUDITOR' | 'SUPPLIER' | 'PUBLIC_VIEWER';

// Tender Statuses
type TenderStatus =
  | 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'PUBLISHED'
  | 'OPEN_FOR_BIDDING' | 'CLOSED' | 'UNDER_EVALUATION'
  | 'EVALUATED' | 'AWARDED' | 'CANCELLED';

// Procurement Methods
type ProcurementMethod =
  | 'OPEN_TENDER' | 'RESTRICTED_TENDER' | 'REQUEST_FOR_QUOTATION'
  | 'DIRECT_PROCUREMENT' | 'FRAMEWORK_AGREEMENT' | 'EMERGENCY_PROCUREMENT';

// Contract Statuses
type ContractStatus =
  | 'DRAFT' | 'PENDING_SIGNATURE' | 'ACTIVE'
  | 'SUSPENDED' | 'COMPLETED' | 'TERMINATED';

// Supplier Statuses
type SupplierStatus =
  | 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'BLACKLISTED' | 'INACTIVE';
```

### 5.2 Money Type
```typescript
interface Money {
  amount: number;
  currency: 'PGK' | 'USD' | 'AUD';
}
```

---

## 6. State Management

### 6.1 Zustand Stores Overview

| Store | Purpose | Key State |
|-------|---------|-----------|
| `auth-store` | Authentication & permissions | user, token, permissions |
| `procurement-store` | Tenders, bids, plans | tenders, bids, plans |
| `supplier-store` | Supplier registry | suppliers, filters |
| `contract-store` | Contract management | contracts, milestones |
| `auction-store` | Auction operations | auctions, bids, disposals |
| `marketplace-store` | Catalogue purchasing | items, orders, cart |
| `workflow-store` | Approval workflows | workflows, pending |
| `sealed-bids-store` | Encrypted bid management | sealedBids, openingSessions |
| `audit-store` | Audit trail | logs, filters |

### 6.2 Role-Based Permissions

```typescript
const rolePermissions: Record<UserRole, string[]> = {
  SYSTEM_ADMIN: ['*'],
  NPC_ADMIN: [
    'system:read', 'system:write',
    'tender:read', 'tender:write', 'tender:approve',
    'contract:read', 'contract:write', 'contract:approve',
    'supplier:read', 'supplier:write', 'supplier:approve',
  ],
  PROCUREMENT_OFFICER: [
    'plan:read', 'plan:write',
    'tender:read', 'tender:write',
    'bid:read', 'evaluation:read',
  ],
  SUPPLIER: [
    'tender:read',
    'bid:read', 'bid:write',
    'profile:read', 'profile:write',
  ],
  // ... other roles
};
```

---

## 7. Security & Compliance

### 7.1 Sealed Bid Encryption

**Algorithm:** AES-256-GCM (Galois/Counter Mode)
**IV Size:** 12 bytes (96 bits)
**Key Size:** 256 bits

**Process Flow:**
```
1. Supplier Submits Bid
         │
         ▼
2. Generate Random IV
         │
         ▼
3. Encrypt with AES-256-GCM
         │
         ▼
4. Generate SHA-256 Hash
         │
         ▼
5. Store: {encryptedData, IV, hash}
         │
         ▼
6. Wait Until Deadline
         │
         ▼
7. Committee Opens Bid
         │
         ▼
8. Decrypt & Verify Hash
         │
         ▼
9. Display to Committee
```

### 7.2 Audit Trail
- All actions logged with timestamp, user, and IP
- Previous and new state captured for changes
- Logs are immutable (append-only)
- Retention period: 7 years minimum

### 7.3 OCDS Compliance
The system exports data in Open Contracting Data Standard 1.1.5 format:
- Unique OCID per contracting process
- All releases tagged by stage
- Full party information
- Document attachments linked
- Value breakdowns included

---

## 8. Integration Services

### 8.1 Email Notification Engine
**Library:** `/src/lib/notifications.ts`

**Notification Types:**
| Type | Trigger | Priority |
|------|---------|----------|
| WORKFLOW_PENDING | Approval request assigned | HIGH |
| WORKFLOW_APPROVED | Request approved | NORMAL |
| WORKFLOW_REJECTED | Request rejected | HIGH |
| BID_SUBMITTED | Supplier submits bid | HIGH |
| BID_OPENED | Bid opening completed | NORMAL |
| TENDER_PUBLISHED | New tender published | NORMAL |
| TENDER_CLOSING_SOON | 24-48 hours before deadline | HIGH |

**Features:**
- HTML and plain text templates
- Variable substitution (e.g., {{recipientName}})
- Queue management with retry logic
- Priority-based processing

### 8.2 WebSocket Real-Time Updates
**Library:** `/src/lib/websocket.ts`

**Event Types:**
| Event | Description |
|-------|-------------|
| BID_SUBMITTED | New bid received for tender |
| BID_OPENED | Bid decrypted during opening |
| AUCTION_BID | New bid in live auction |
| AUCTION_ENDED | Auction closed |
| WORKFLOW_UPDATE | Approval action taken |

**Features:**
- Subscription-based messaging
- Automatic reconnection
- Message queuing when offline
- Role-based event filtering

### 8.3 PDF Report Generator
**Library:** `/src/lib/pdf-generator.ts`

**Report Types:**
- Bid Opening Report
- Contract Summary
- Evaluation Report
- Audit Trail Export

**Features:**
- Print-optimized HTML generation
- Digital signature placeholders
- Official NPC branding
- A4 page formatting

### 8.4 Offline Support (PWA)
**Library:** `/src/lib/offline.ts`

**Features:**
| Feature | Description |
|---------|-------------|
| Service Worker | Caches static assets and API responses |
| IndexedDB Forms | Stores form submissions when offline |
| Background Sync | Syncs queued data when back online |
| Push Notifications | Receives alerts when offline |
| App Installation | Installable as desktop/mobile app |

---

## 9. Development Status

### 9.1 Completed Features (v18)

#### Core System
- [x] Next.js 15 project setup
- [x] TypeScript strict mode
- [x] shadcn/ui components
- [x] Zustand state management
- [x] Role-Based Access Control
- [x] Immutable audit logging

#### Planning
- [x] Annual Procurement Plans
- [x] Plan consolidation view
- [x] Procurement calendar

#### Sourcing
- [x] Tender management (CRUD)
- [x] Bidder Portal
- [x] Sealed Bid Encryption (AES-256-GCM)
- [x] Bid Opening Management
- [x] Bid submission tracking

#### Evaluation
- [x] Evaluation workspace
- [x] COI declarations
- [x] Scoring matrix
- [x] Award recommendations

#### Contracts
- [x] Contract creation
- [x] Milestone tracking
- [x] Variation management
- [x] eSignature placeholders

#### Marketplace
- [x] Product catalogue
- [x] Purchase orders
- [x] Framework agreements
- [x] Supplier ratings

#### Auctions
- [x] Live bidding UI
- [x] Reverse auctions
- [x] Asset disposal

#### Suppliers
- [x] Supplier registry
- [x] Pre-qualification
- [x] Performance tracking

#### Analytics
- [x] KPI dashboard
- [x] OCDS publishing
- [x] BI connectors

#### Administration
- [x] Approval workflows
- [x] User management UI
- [x] Audit trail

#### Communications
- [x] Email notification engine
- [x] WebSocket real-time updates
- [x] Notification center
- [x] Live bid feed

#### PWA
- [x] Service Worker
- [x] Offline form queue
- [x] PWA manifest

### 9.2 Pending Features

#### High Priority
- [ ] PostgreSQL/Supabase backend
- [ ] API routes implementation
- [ ] Real JWT authentication
- [ ] Email service integration (SendGrid/AWS SES)
- [ ] Production WebSocket server

#### Medium Priority
- [ ] File upload handling (S3)
- [ ] Multi-language (English/Tok Pisin)
- [ ] Mobile responsive enhancements
- [ ] Push notifications integration

#### Low Priority
- [ ] Dark mode theme
- [ ] Elasticsearch integration
- [ ] AI-powered bid analysis
- [ ] Blockchain audit trail

---

## Appendix A: Navigation Structure

The system navigation is organized by procurement lifecycle stages:

```
Overview
├── Dashboard

Planning
├── Annual Plans
├── New Plan
├── Consolidation
└── Procurement Calendar

Sourcing
├── Tenders
│   ├── All Tenders
│   ├── Create Tender
│   ├── Quotations
│   └── Clarifications
├── Notices & Documents
├── Bid Submissions
├── Bidder Portal
└── Bid Opening

Evaluation
├── Evaluations
├── COI Declarations
└── Awards

Contracts
├── All Contracts
├── Active Contracts
├── Milestones
├── Variations
├── Templates
└── eSignature

Marketplace
├── Browse Catalogue
├── Purchase Orders
├── Framework Agreements
└── Supplier Ratings

Auctions
├── Active Auctions
├── Reverse Auctions
└── Asset Disposal

Suppliers
├── Supplier Registry
├── Registration
├── Pre-qualification
├── Performance
└── Agencies

Analytics
├── Dashboard
├── KPI Tracking
├── Compliance
├── Reports
├── Data Exports
├── BI Connectors
└── OCDS Export

Communications
├── Notifications
├── Messages
└── Announcements

Public Portal
├── Public Notices
└── Open Data

Administration
├── Users
├── Organizations
├── Roles & Permissions
├── Workflows
├── Integrations
├── Audit Trail
└── System Settings
```

---

## Appendix B: API Endpoints (Planned)

```
# Authentication
POST   /api/auth/login
POST   /api/auth/logout
POST   /api/auth/refresh

# Planning
GET    /api/plans
POST   /api/plans
GET    /api/plans/:id
PUT    /api/plans/:id
POST   /api/plans/:id/submit

# Tenders
GET    /api/tenders
POST   /api/tenders
GET    /api/tenders/:id
PUT    /api/tenders/:id
POST   /api/tenders/:id/publish
GET    /api/tenders/:id/bids

# Bids
GET    /api/bids
POST   /api/bids
GET    /api/bids/:id
POST   /api/bids/:id/open

# Contracts
GET    /api/contracts
POST   /api/contracts
GET    /api/contracts/:id
PUT    /api/contracts/:id
POST   /api/contracts/:id/sign

# Suppliers
GET    /api/suppliers
POST   /api/suppliers
GET    /api/suppliers/:id
PUT    /api/suppliers/:id

# OCDS
GET    /api/ocds/releases
GET    /api/ocds/releases/:ocid

# Notifications
GET    /api/notifications
POST   /api/notifications/:id/read
```

---

**Document End**

*Generated by PNG eGP System v18*
*National Procurement Commission, Papua New Guinea*
