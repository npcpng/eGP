# PNG eGP System Architecture

## System Overview

The National e-Government Procurement (eGP) System is a comprehensive platform for managing the full procurement lifecycle in Papua New Guinea. The system follows a logical process flow from planning through to analytics.

## Procurement Lifecycle

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    PROCUREMENT LIFECYCLE FLOW                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐             │
│   │ PLANNING │ ─► │ SOURCING │ ─► │EVALUATION│ ─► │ CONTRACTS│             │
│   │          │    │          │    │          │    │          │             │
│   │ • Annual │    │ • Tenders│    │ • Scoring│    │ • Register│            │
│   │   Plans  │    │ • Notices│    │ • COI    │    │ • Milestones│          │
│   │ • Budget │    │ • Bids   │    │ • Awards │    │ • Variations│          │
│   │ • Calendar│   │ • Docs   │    │          │    │ • eSign   │            │
│   └──────────┘    └──────────┘    └──────────┘    └──────────┘             │
│                                                                              │
│   ┌──────────┐    ┌──────────┐    ┌──────────┐                             │
│   │MARKETPLACE│   │ AUCTIONS │    │ SUPPLIERS│                             │
│   │          │    │          │    │          │                             │
│   │ • Catalog│    │ • Reverse│    │ • Registry│                            │
│   │ • Orders │    │ • Forward│    │ • Pre-qual│                            │
│   │ • Ratings│    │ • Disposal│   │ • Perform │                            │
│   └──────────┘    └──────────┘    └──────────┘                             │
│                                                                              │
│                          ┌──────────────────────┐                           │
│                          │      ANALYTICS       │                           │
│                          │                      │                           │
│                          │  • Dashboards        │                           │
│                          │  • KPIs & Compliance │                           │
│                          │  • Reports & BI      │                           │
│                          │  • OCDS Export       │                           │
│                          └──────────────────────┘                           │
│                                                                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                       INTEGRATION LAYER (APIs)                               │
│  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐     │
│  │    IPA    │ │    IRC    │ │    BSP    │ │   IFMS    │ │   OCDS    │     │
│  │ Company   │ │   Tax     │ │ Payments  │ │ Finance   │ │  Publish  │     │
│  │  Lookup   │ │  Status   │ │           │ │  Export   │ │           │     │
│  └───────────┘ └───────────┘ └───────────┘ └───────────┘ └───────────┘     │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Technology Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **UI Components**: shadcn/ui, Tailwind CSS
- **State Management**: Zustand
- **Data Fetching**: TanStack Query
- **Forms**: React Hook Form + Zod
- **Charts**: Recharts
- **Authentication**: Jose (JWT)
- **Runtime**: Bun

## Module Details

### Planning
| Module | Description |
|--------|-------------|
| Annual Plans | Multi-year and annual procurement plan management |
| Budget Management | Budget allocation and tracking by agency/program |
| Consolidation | Aggregate procurement items across agencies |
| Calendar | Procurement schedule and milestone planning |

### Sourcing
| Module | Description |
|--------|-------------|
| Tenders | Create, manage, and publish tenders (RFT/RFP/RFQ/EOI) |
| Notices & Documents | Templates, document repository, versioning |
| Bid Submissions | Secure bid receipt with encryption |
| Clarifications | Q&A management with bidders |

### Evaluation
| Module | Description |
|--------|-------------|
| Evaluations | Committee setup, scoring, automated ranking |
| COI Declarations | Conflict of interest and confidentiality |
| Awards | Award recommendations and approvals |

### Contracts
| Module | Description |
|--------|-------------|
| Contract Register | Active and completed contract management |
| Milestones | Deliverable and milestone tracking |
| Variations | Contract amendments and change orders |
| eSignature | Digital contract signing |

### Marketplace
| Module | Description |
|--------|-------------|
| Catalogue | Item master with pricing and specifications |
| Purchase Orders | Order creation and tracking |
| Framework Agreements | Standing offers and panel contracts |
| Ratings | Supplier transaction ratings |

### Auctions
| Module | Description |
|--------|-------------|
| Reverse Auctions | Price reduction bidding for procurement |
| Forward Auctions | Asset disposal sales |
| Asset Disposal | Government surplus management |

### Suppliers
| Module | Description |
|--------|-------------|
| Registry | Supplier database with verification |
| Pre-qualification | Supplier capability assessment |
| Performance | Historical performance tracking |
| Agencies | Government buyer profiles |

### Analytics
| Module | Description |
|--------|-------------|
| Dashboards | KPI and metric visualization |
| Compliance | Audit and compliance monitoring |
| Reports | Custom report generation |
| BI Connectors | Power BI/Tableau integration |
| OCDS Export | Open contracting data publishing |

### Administration
| Module | Description |
|--------|-------------|
| Users | User management and MFA |
| Organizations | Agency and department setup |
| Roles & Permissions | RBAC configuration |
| Workflows | Approval chain setup |
| Audit Trail | Immutable action logging |

## Data Flow Architecture

```
                    ┌─────────────────┐
                    │   User Actions  │
                    └────────┬────────┘
                             │
                             ▼
┌────────────────────────────────────────────────────────┐
│                   PRESENTATION LAYER                    │
│  Dashboard │ Tenders │ Contracts │ Marketplace │ Admin │
└────────────────────────────────────────────────────────┘
                             │
                             ▼
┌────────────────────────────────────────────────────────┐
│                   APPLICATION LAYER                     │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│  │ Workflow │ │ Notific. │ │ Document │ │ Encrypt  │  │
│  │ Engine   │ │ Service  │ │ Manager  │ │ Service  │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘  │
└────────────────────────────────────────────────────────┘
                             │
                             ▼
┌────────────────────────────────────────────────────────┐
│                     DOMAIN LAYER                        │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐      │
│  │Planning │ │Sourcing │ │Contracts│ │Catalogue│      │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘      │
└────────────────────────────────────────────────────────┘
                             │
                             ▼
┌────────────────────────────────────────────────────────┐
│                 INFRASTRUCTURE LAYER                    │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐      │
│  │  Auth   │ │ Storage │ │  Audit  │ │ Search  │      │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘      │
└────────────────────────────────────────────────────────┘
                             │
                             ▼
┌────────────────────────────────────────────────────────┐
│                   DATA WAREHOUSE                        │
│  ┌─────────────────────────────────────────────────┐   │
│  │           Unified Data Model                     │   │
│  │  Events │ Suppliers │ Contracts │ Catalogue     │   │
│  └─────────────────────────────────────────────────┘   │
│                          │                              │
│         ┌────────────────┼────────────────┐            │
│         ▼                ▼                ▼            │
│  ┌──────────┐     ┌──────────┐     ┌──────────┐       │
│  │   OCDS   │     │ Power BI │     │  Custom  │       │
│  │  Export  │     │ /Tableau │     │ Reports  │       │
│  └──────────┘     └──────────┘     └──────────┘       │
└────────────────────────────────────────────────────────┘
```

## Security Architecture

### Role-Based Access Control (RBAC)

| Role | Planning | Sourcing | Evaluation | Contracts | Marketplace | Analytics |
|------|----------|----------|------------|-----------|-------------|-----------|
| SYSTEM_ADMIN | Full | Full | Full | Full | Full | Full |
| NPC_ADMIN | Full | Full | Full | Full | Read | Full |
| NPC_OFFICER | Write | Write | Write | Write | Read | Read |
| AGENCY_HEAD | Approve | Approve | Approve | Approve | Approve | Read |
| PROCUREMENT_OFFICER | Write | Write | Write | Write | Write | Read |
| FINANCE_OFFICER | Read | Read | Read | Read | Approve | Read |
| EVALUATOR | Read | Read | Evaluate | Read | - | - |
| AUDITOR | Read | Read | Read | Read | Read | Full |
| SUPPLIER | - | Bid | Read | Read | Buy | - |
| PUBLIC_VIEWER | - | Public | - | Public | Browse | - |

### Security Controls

1. **Authentication**: JWT with MFA support
2. **Encryption**: AES-256 at rest, TLS 1.3 in transit
3. **Sealed Bids**: Encryption until opening time
4. **Audit Trail**: Immutable logging, 7-year retention
5. **Session Management**: Timeout, concurrent session control
6. **Data Sovereignty**: PNG datacenter requirements

## External Integrations

### Investment Promotion Authority (IPA)
- Company registration lookup
- Business status verification
- Director/shareholder data

### Inland Revenue Commission (IRC)
- Tax compliance status
- TIN validation
- Good standing verification

### BSP Banking Portal
- Tender fee payments
- Bid security processing
- Performance guarantee management
- Payment reconciliation webhooks

### IFMS (Finance System)
- Budget commitment export
- Contract milestone data
- Payment scheduling
- Expenditure reporting

## PNG-Specific Considerations

### Low Bandwidth Optimization
- Progressive image loading
- Minimal JavaScript bundles
- Compressed assets (Brotli/gzip)
- Offline-capable forms (IndexedDB)

### Session Resilience
- Auto-save every 30 seconds
- Session recovery after disconnect
- Draft state preservation

### Currency & Locale
- PGK (Papua New Guinea Kina) default
- Support for USD, AUD transactions
- PNG timezone (AEST+1/+10:00)
- English (official) language

### Governance Workflows
- Multi-level approval chains
- Authority limits by value/category
- NPC oversight integration
- Provincial/District support

## OCDS Compliance (1.1.5)

All procurement data follows Open Contracting Data Standard:
- Release packages per procurement
- Tags: planning, tender, award, contract, implementation
- Parties: buyer, tenderers, suppliers
- Full document references
- Amendment tracking

## Performance Targets

| Metric | Target |
|--------|--------|
| Page Load | < 3 seconds on 3G |
| API Response | < 500ms (95th percentile) |
| Uptime | 99.5% monthly |
| Data Sync | Near real-time (< 5 minutes) |
| Concurrent Users | 1000+ |

## Document Retention

| Document Type | Retention Period |
|---------------|------------------|
| Tender Documents | 7 years after close |
| Contracts | 7 years after completion |
| Audit Logs | 10 years |
| Supplier Records | Active + 7 years |
| Financial Records | 7 years per PNG law |
