# PROJECT PROPOSAL

---

<div align="center">

# NATIONAL e-GOVERNMENT PROCUREMENT SYSTEM
## FOR PAPUA NEW GUINEA

### Technical & Financial Proposal

---

**Submitted to:**

**National Procurement Commission**
**Independent State of Papua New Guinea**

---

**Proposal Reference:** NPC/eGP/2026/001
**Submission Date:** January 2026
**Validity Period:** 180 Days

---

</div>

---

## TABLE OF CONTENTS

1. [Executive Summary](#1-executive-summary)
2. [Understanding of Requirements](#2-understanding-of-requirements)
3. [Proposed Solution](#3-proposed-solution)
4. [Implementation Approach](#4-implementation-approach)
5. [Project Organization](#5-project-organization)
6. [Technical Specifications](#6-technical-specifications)
7. [Risk Management](#7-risk-management)
8. [Quality Assurance](#8-quality-assurance)
9. [Training & Capacity Building](#9-training--capacity-building)
10. [Financial Proposal](#10-financial-proposal)
11. [Terms & Conditions](#11-terms--conditions)
12. [Annexures](#12-annexures)

---

## 1. EXECUTIVE SUMMARY

### 1.1 Introduction

We are pleased to submit this proposal for the design, development, implementation, and deployment of the **National e-Government Procurement System (eGP)** for Papua New Guinea. This comprehensive solution will transform public procurement across all government agencies, ensuring transparency, efficiency, and compliance with international standards.

### 1.2 Proposal Highlights

| Aspect | Our Offering |
|--------|--------------|
| **Solution** | End-to-end eProcurement platform covering full procurement lifecycle |
| **Technology** | Modern cloud-native architecture with Next.js, React, PostgreSQL |
| **Standards** | OCDS 1.1.5 compliant, aligned with PNG Procurement Act |
| **Timeline** | 24 months from contract signing to full deployment |
| **Investment** | USD $2,990,000 (total project cost) |
| **Warranty** | 12 months defects liability with optional extended support |

### 1.3 Key Differentiators

1. **Proven Expertise:** Deep experience in government procurement systems
2. **Local Presence:** Committed to establishing PNG-based support operations
3. **Knowledge Transfer:** Comprehensive training to ensure sustainability
4. **Flexible Architecture:** Modular design allowing phased implementation
5. **Open Standards:** OCDS compliance ensures international interoperability

### 1.4 Value Proposition

The proposed eGP system will deliver:

- **15-25% cost savings** through competitive bidding and reduced procurement cycle times
- **60% reduction** in procurement processing time
- **100% audit trail** for all procurement activities
- **Real-time transparency** through public disclosure portal
- **Elimination of paper-based processes** across government

---

## 2. UNDERSTANDING OF REQUIREMENTS

### 2.1 Current State Assessment

Papua New Guinea's public procurement currently faces several challenges:

| Challenge | Impact | Our Solution |
|-----------|--------|--------------|
| Manual paper-based processes | Delays, errors, lost documents | Fully digital workflow |
| Limited transparency | Public trust concerns | OCDS public disclosure |
| Fragmented systems | Data silos, duplication | Integrated platform |
| Inconsistent practices | Compliance risks | Standardized processes |
| Limited supplier access | Reduced competition | Online bidder portal |
| Weak monitoring | Difficult to track performance | Real-time dashboards |

### 2.2 Stakeholder Requirements

We have identified the following key stakeholder groups and their requirements:

**National Procurement Commission (NPC):**
- Central oversight and control
- Policy enforcement mechanisms
- Comprehensive reporting and analytics
- OCDS publishing capability

**Procuring Agencies:**
- User-friendly tender creation
- Approval workflow automation
- Contract management tools
- Integration with IFMS

**Suppliers/Bidders:**
- Easy registration and pre-qualification
- Secure bid submission
- Real-time notification of opportunities
- Mobile-accessible platform

**Civil Society & Public:**
- Transparent access to procurement data
- Award and contract disclosure
- Complaint mechanisms
- Open data downloads

### 2.3 Compliance Requirements

| Requirement | Standard/Regulation | Our Compliance |
|-------------|---------------------|----------------|
| Legal Framework | PNG Procurement Act 2018 | Full compliance |
| Data Standard | OCDS 1.1.5 | Native implementation |
| Security | ISO 27001 principles | Security-by-design |
| Accessibility | WCAG 2.1 Level AA | Responsive, accessible UI |
| Data Protection | PNG Data Protection | Encryption, access controls |

---

## 3. PROPOSED SOLUTION

### 3.1 Solution Overview

The PNG National eGP System is a comprehensive, web-based procurement platform consisting of 11 integrated modules:

```
┌─────────────────────────────────────────────────────────────────────┐
│                    PNG NATIONAL eGP SYSTEM                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐           │
│  │   PLANNING    │  │   SOURCING    │  │  EVALUATION   │           │
│  │    MODULE     │  │    MODULE     │  │    MODULE     │           │
│  │               │  │               │  │               │           │
│  │ Annual Plans  │  │ eTendering    │  │ Bid Evaluation│           │
│  │ Budgeting     │  │ Bidder Portal │  │ COI Mgmt      │           │
│  │ Consolidation │  │ Sealed Bids   │  │ Awards        │           │
│  └───────────────┘  └───────────────┘  └───────────────┘           │
│                                                                      │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐           │
│  │   CONTRACTS   │  │  MARKETPLACE  │  │   AUCTIONS    │           │
│  │    MODULE     │  │    MODULE     │  │    MODULE     │           │
│  │               │  │               │  │               │           │
│  │ Contract Mgmt │  │ Catalogue     │  │ Reverse Auct. │           │
│  │ Milestones    │  │ Purchase Ord. │  │ Asset Disposal│           │
│  │ eSignature    │  │ Frameworks    │  │ Real-time Bid │           │
│  └───────────────┘  └───────────────┘  └───────────────┘           │
│                                                                      │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐           │
│  │   SUPPLIERS   │  │   ANALYTICS   │  │    ADMIN      │           │
│  │    MODULE     │  │    MODULE     │  │    MODULE     │           │
│  │               │  │               │  │               │           │
│  │ Registration  │  │ Dashboards    │  │ Users/Roles   │           │
│  │ Pre-qual      │  │ KPIs          │  │ Workflows     │           │
│  │ Performance   │  │ OCDS Export   │  │ Audit Logs    │           │
│  └───────────────┘  └───────────────┘  └───────────────┘           │
│                                                                      │
│  ┌───────────────┐  ┌───────────────┐                               │
│  │COMMUNICATIONS │  │ PUBLIC PORTAL │                               │
│  │    MODULE     │  │    MODULE     │                               │
│  │               │  │               │                               │
│  │ Notifications │  │ Tender Search │                               │
│  │ Messaging     │  │ Open Data     │                               │
│  │ Alerts        │  │ OCDS API      │                               │
│  └───────────────┘  └───────────────┘                               │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### 3.2 Module Descriptions

#### 3.2.1 Planning Module
- Annual Procurement Plan (APP) creation and management
- Budget integration with IFMS
- Procurement consolidation across agencies
- Calendar and milestone tracking
- Multi-level approval workflows

#### 3.2.2 Sourcing Module (eTendering)
- Notice creation (EOI, RFI, RFT, RFP, RFQ)
- Document repository with version control
- Secure bidder portal with registration
- **AES-256-GCM sealed bid encryption**
- Automated bid opening at deadline
- Clarification management

#### 3.2.3 Evaluation Module
- Configurable evaluation criteria
- Committee management with COI declarations
- Automated scoring and ranking
- Award recommendations
- Compliance checks

#### 3.2.4 Contract Management Module
- Contract creation from templates
- Milestone and deliverable tracking
- Variation and amendment management
- Digital signature integration
- Performance monitoring

#### 3.2.5 Marketplace Module
- Product/service catalogue
- Framework agreement management
- Shopping cart and purchase orders
- Supplier ratings and reviews
- Quick procurement for low-value items

#### 3.2.6 Auctions Module
- Reverse eAuctions (price reduction)
- Forward auctions (asset disposal)
- Real-time bidding with WebSocket
- Anti-sniping protection
- Auction history and analytics

#### 3.2.7 Supplier Management Module
- Online registration portal
- Pre-qualification management
- Classification (SME, women-owned, etc.)
- Performance history tracking
- Blacklisting management

#### 3.2.8 Analytics Module
- Executive dashboards
- KPI tracking and visualization
- **OCDS publishing pipeline**
- BI tool integration (Power BI, Tableau)
- Custom report builder

#### 3.2.9 Administration Module
- User and role management
- Organizational hierarchy
- Workflow configuration
- System settings
- Immutable audit logs

#### 3.2.10 Communications Module
- Email notification engine
- SMS integration
- In-app notifications
- Document collaboration
- Announcement broadcasting

#### 3.2.11 Public Portal
- Tender search and discovery
- Award and contract disclosure
- Open data downloads (OCDS, CSV)
- Supplier registration gateway
- Feedback and complaints

### 3.3 Technical Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                      PRESENTATION LAYER                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌───────────┐  │
│  │  Web App    │  │ Mobile PWA  │  │ Public API  │  │ Admin UI  │  │
│  │  (Next.js)  │  │  (React)    │  │  (REST)     │  │           │  │
│  └─────────────┘  └─────────────┘  └─────────────┘  └───────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      APPLICATION LAYER                               │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                    API Gateway (Kong/AWS)                    │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│  │ Tender   │ │ Supplier │ │ Contract │ │ Workflow │ │ Notif.   │  │
│  │ Service  │ │ Service  │ │ Service  │ │ Engine   │ │ Service  │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         DATA LAYER                                   │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌───────────┐  │
│  │ PostgreSQL  │  │   Redis     │  │ Elasticsearch│ │ S3/Blob   │  │
│  │ (Primary)   │  │  (Cache)    │  │  (Search)   │  │ (Files)   │  │
│  └─────────────┘  └─────────────┘  └─────────────┘  └───────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    INTEGRATION LAYER                                 │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│  │  IFMS    │ │   IPA    │ │   IRC    │ │ Payment  │ │   SMS    │  │
│  │          │ │          │ │          │ │ Gateway  │ │ Gateway  │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 4. IMPLEMENTATION APPROACH

### 4.1 Methodology

We employ an **Agile-Waterfall Hybrid** methodology:

- **Waterfall** for overall project phases and governance
- **Agile (Scrum)** for development sprints within phases
- **2-week sprints** with regular stakeholder demos
- **Continuous integration/deployment** for rapid iteration

### 4.2 Phase Summary

| Phase | Duration | Key Activities | Deliverables |
|-------|----------|----------------|--------------|
| **Phase 1** | Months 1-4 | Inception & Design | Requirements, Architecture, UI/UX |
| **Phase 2** | Months 3-10 | Core Development | Core modules, Database, Security |
| **Phase 3** | Months 8-14 | Advanced Features | eTendering, Contracts, Marketplace |
| **Phase 4** | Months 12-18 | Integration & Testing | Integrations, Testing, Security Audit |
| **Phase 5** | Months 16-22 | Training & Rollout | Training, Pilot, Provincial Rollout |
| **Phase 6** | Months 20-24 | Stabilization | Go-live, Hypercare, Handover |

### 4.3 Key Milestones

```
2026                                    2027                                    2028
Mar  Apr  May  Jun  Jul  Aug  Sep  Oct  Nov  Dec  Jan  Feb  Mar  Apr  May  Jun  Jul  Aug  Sep  Oct  Nov  Dec  Jan  Feb
 │    │    │    │    │    │    │    │    │    │    │    │    │    │    │    │    │    │    │    │    │    │    │    │
 ▼    │    │    ▼    │    │    │    │    │    ▼    │    │    │    │    ▼    │    │    │    │    │    │    ▼    │    ▼
 M1   │    │   M2    │    │    │    │    │   M3    │    │    │    │   M4    │    │    │    │    │    │   M5    │   M6
 │    │    │    │    │    │    │    │    │    │    │    │    │    │    │    │    │    │    │    │    │    │    │    │
 │    │    │    │    │    │    │    │    │    │    │    │    │    │    │    │    │    │    │    │    │    │    │    │
Project  Design    Phase 2      Phase 3      Phase 4      Pilot     Production  Final
Start   Complete   Gate         Gate         Gate        Go-Live    Go-Live   Acceptance
```

### 4.4 Deliverable Schedule

| Deliverable | Phase | Due Date |
|-------------|-------|----------|
| Project Charter | 1 | Week 2 |
| Business Requirements Document | 1 | Week 8 |
| System Architecture Document | 1 | Week 12 |
| UI/UX Design & Prototype | 1 | Week 14 |
| Core System Framework | 2 | Week 20 |
| Planning Module | 2 | Week 34 |
| Supplier Management Module | 2 | Week 38 |
| eTendering Module | 3 | Week 48 |
| Evaluation Module | 3 | Week 52 |
| Contract Management Module | 3 | Week 56 |
| Marketplace Module | 3 | Week 60 |
| Analytics & OCDS | 4 | Week 64 |
| External Integrations | 4 | Week 72 |
| Security Audit Report | 4 | Week 78 |
| Training Materials | 5 | Week 76 |
| Pilot Deployment | 5 | Week 88 |
| Production Deployment | 6 | Week 94 |
| Final Documentation | 6 | Week 104 |

---

## 5. PROJECT ORGANIZATION

### 5.1 Governance Structure

```
┌─────────────────────────────────────────────────────────────────┐
│                    PROJECT STEERING COMMITTEE                    │
│         (NPC Chairman, Secretary Treasury, Key Agencies)        │
└─────────────────────────────────────────────────────────────────┘
                                │
                    ┌───────────┴───────────┐
                    │                       │
            ┌───────▼───────┐       ┌───────▼───────┐
            │   PROJECT     │       │   TECHNICAL   │
            │   DIRECTOR    │       │   COMMITTEE   │
            │   (NPC)       │       │               │
            └───────┬───────┘       └───────────────┘
                    │
            ┌───────▼───────┐
            │   PROJECT     │
            │   MANAGER     │
            │  (Contractor) │
            └───────┬───────┘
                    │
    ┌───────────────┼───────────────┐
    │               │               │
┌───▼───┐       ┌───▼───┐       ┌───▼───┐
│ Dev   │       │  QA   │       │Training│
│ Team  │       │ Team  │       │ Team   │
└───────┘       └───────┘       └───────┘
```

### 5.2 Proposed Team Structure

| Role | Quantity | Duration | Responsibility |
|------|----------|----------|----------------|
| Project Director | 1 | 24 months | Overall accountability |
| Project Manager | 1 | 24 months | Day-to-day management |
| Solution Architect | 1 | 20 months | Technical design |
| Senior Developers | 3 | 18 months | Core development |
| Backend Developers | 2 | 16 months | API & integrations |
| Frontend Developers | 2 | 16 months | UI implementation |
| UI/UX Designer | 1 | 12 months | User experience |
| QA Lead | 1 | 18 months | Quality assurance |
| QA Engineers | 2 | 16 months | Testing |
| DevOps Engineer | 1 | 24 months | Infrastructure |
| Security Specialist | 1 | 14 months | Security |
| Business Analysts | 2 | 20 months | Requirements |
| Training Lead | 1 | 12 months | Training program |
| Technical Writer | 1 | 12 months | Documentation |

---

## 6. TECHNICAL SPECIFICATIONS

### 6.1 Technology Stack

| Layer | Technology | Rationale |
|-------|------------|-----------|
| **Frontend** | Next.js 15, React 18, TypeScript | Modern, performant, SEO-friendly |
| **UI Framework** | Tailwind CSS, shadcn/ui | Consistent, customizable design |
| **State Management** | Zustand | Lightweight, type-safe |
| **Backend** | Node.js, Express/Next API | JavaScript ecosystem, async I/O |
| **Database** | PostgreSQL 15 | Enterprise-grade, ACID compliant |
| **Cache** | Redis | High-performance caching |
| **Search** | Elasticsearch | Full-text search capability |
| **File Storage** | AWS S3 / Azure Blob | Scalable document storage |
| **Authentication** | JWT, OAuth 2.0 | Secure, standards-based |
| **Encryption** | AES-256-GCM | Military-grade bid encryption |

### 6.2 Security Features

| Feature | Implementation |
|---------|----------------|
| Sealed Bid Encryption | AES-256-GCM with per-bid keys |
| Authentication | Multi-factor authentication (MFA) |
| Authorization | Role-based access control (RBAC) |
| Data Protection | Encryption at rest and in transit |
| Audit Trail | Immutable logging of all actions |
| Session Security | Secure cookies, session timeout |
| API Security | Rate limiting, API keys, OAuth |
| Penetration Testing | Third-party security audit |

### 6.3 Performance Requirements

| Metric | Target |
|--------|--------|
| Concurrent Users | 500+ simultaneous |
| Page Load Time | < 3 seconds (95th percentile) |
| API Response Time | < 500ms (average) |
| System Availability | 99.5% uptime |
| Data Backup | Daily with 30-day retention |
| Disaster Recovery | RTO: 4 hours, RPO: 1 hour |

---

## 7. RISK MANAGEMENT

### 7.1 Risk Register

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Stakeholder resistance | Medium | High | Change management, early engagement |
| Integration delays (IFMS) | Medium | High | Early API specifications, mock interfaces |
| Resource availability | Medium | Medium | Cross-training, backup resources |
| Scope creep | High | Medium | Strict change control process |
| Infrastructure delays | Low | High | Cloud-based development environment |
| Data migration issues | Medium | High | Phased migration, validation scripts |
| Security vulnerabilities | Low | High | Security-by-design, external audit |
| Low user adoption | Medium | High | Comprehensive training, user support |

### 7.2 Contingency Measures

- 10% contingency budget included
- Parallel workstreams for critical path items
- Experienced backup resources identified
- Regular risk reviews with Steering Committee

---

## 8. QUALITY ASSURANCE

### 8.1 QA Approach

| QA Activity | Timing | Responsibility |
|-------------|--------|----------------|
| Code Reviews | Every commit | Development Team |
| Unit Testing | Development | Developers |
| Integration Testing | Per sprint | QA Team |
| System Testing | Phase gates | QA Team |
| Performance Testing | Pre-production | QA Team |
| Security Testing | Phase 4 | External Auditor |
| User Acceptance Testing | Pre-pilot | End Users |

### 8.2 Quality Metrics

| Metric | Target |
|--------|--------|
| Code Coverage | > 80% |
| Defect Density | < 1 per KLOC |
| Critical Defects at Go-Live | 0 |
| UAT Pass Rate | > 95% |
| User Satisfaction | > 4.0/5.0 |

---

## 9. TRAINING & CAPACITY BUILDING

### 9.1 Training Program

| Training Type | Target Audience | Duration | Participants |
|---------------|-----------------|----------|--------------|
| System Administration | IT Staff | 5 days | 30 |
| Procurement Officers | Agency Staff | 3 days | 200 |
| Evaluators | Committee Members | 2 days | 150 |
| Suppliers (Basic) | Vendors | 1 day | 500 |
| Executives | Management | 0.5 day | 50 |
| Train-the-Trainer | Provincial Trainers | 5 days | 44 |

### 9.2 Training Materials

- User manuals (by role)
- Quick reference guides
- 20 eLearning modules
- 30 video tutorials
- Hands-on exercises
- Assessment questions

### 9.3 Knowledge Transfer

- Technical documentation handover
- Operations manual
- Source code and database documentation
- Support team mentoring
- 3 months of parallel support

---

## 10. FINANCIAL PROPOSAL

### 10.1 Cost Summary

| Category | Amount (USD) |
|----------|--------------|
| Software Development | $1,050,000 |
| Hardware & Infrastructure | $280,000 |
| Training & Capacity Building | $320,000 |
| Project Management | $280,000 |
| Travel & Logistics | $400,000 |
| Stakeholder Consultations | $220,000 |
| Change Management | $120,000 |
| Legal & Compliance | $100,000 |
| Documentation | $70,000 |
| Contingency (10%) | $150,000 |
| **TOTAL PROJECT COST** | **$2,990,000** |

### 10.2 Payment Schedule

| Milestone | % | Amount (USD) |
|-----------|---|--------------|
| Advance (with bank guarantee) | 10% | $299,000 |
| Phase 1: Design Complete | 12% | $358,800 |
| Phase 2: Core Development | 20% | $598,000 |
| Phase 3: Advanced Features | 16% | $478,400 |
| Phase 4: Integration & Testing | 14% | $418,600 |
| Phase 5: Training & Rollout | 13% | $388,700 |
| Phase 6: Go-Live & Handover | 10% | $299,000 |
| Retention (after 12 months) | 5% | $149,500 |
| **TOTAL** | **100%** | **$2,990,000** |

### 10.3 Annual Operating Costs (Post-Implementation)

| Item | Year 1 | Year 2+ |
|------|--------|---------|
| Cloud Hosting | $90,000 | $95,000 |
| Licenses | $45,000 | $45,000 |
| Support Team | $160,000 | $165,000 |
| Maintenance | $100,000 | $80,000 |
| Training | $40,000 | $30,000 |
| Security | $25,000 | $25,000 |
| **TOTAL** | **$460,000** | **$440,000** |

---

## 11. TERMS & CONDITIONS

### 11.1 Contract Type
Lump-sum, milestone-based payment

### 11.2 Warranty Period
12 months from Final Acceptance

### 11.3 Intellectual Property
All developed software becomes property of GoPNG upon final payment

### 11.4 Confidentiality
All project information treated as confidential

### 11.5 Insurance
- Professional liability: $1,000,000
- Public liability: $500,000

### 11.6 Dispute Resolution
Arbitration under PNG Arbitration Act

### 11.7 Governing Law
Laws of the Independent State of Papua New Guinea

---

## 12. ANNEXURES

### Annexure A: Detailed Work Breakdown Structure
*[See separate document: 01-PROJECT-SCHEDULE-GANTT.md]*

### Annexure B: Funding Source Breakdown
*[See separate document: 02-FUNDING-SOURCES-BREAKDOWN.md]*

### Annexure C: Payment Milestones Detail
*[See separate document: 03-PAYMENT-MILESTONES.md]*

### Annexure D: Team CVs
*[To be provided upon request]*

### Annexure E: Past Project References
*[To be provided upon request]*

### Annexure F: Technical Specifications Detail
*[Available in system documentation]*

### Annexure G: Draft Contract Terms
*[To be negotiated]*

---

## DECLARATION

We hereby declare that:

1. All information provided in this proposal is true and accurate
2. We have the capacity and resources to deliver the proposed solution
3. We accept the terms and conditions of the RFP
4. This proposal is valid for 180 days from submission date
5. We commit to the proposed timeline and budget

---

**Authorized Signatory:**

Name: _________________________________

Title: _________________________________

Date: _________________________________

Signature: _____________________________

Company Seal:

---

<div align="center">

**END OF PROPOSAL**

*For queries, please contact:*
*proposals@contractor.com*
*+675 XXX XXXX*

</div>
