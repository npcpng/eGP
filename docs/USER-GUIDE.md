# PNG National eGP System - User Guide

**Version:** 1.0
**Date:** January 2026
**Audience:** All System Users

---

## Quick Start Guide

### For Government Officers

#### Step 1: Login
Access the system at the official URL with your government credentials.

#### Step 2: Dashboard Overview
The dashboard provides a summary of:
- Active tenders in your organization
- Pending approvals requiring your action
- Upcoming deadlines
- Key performance metrics

#### Step 3: Navigate by Task
Use the left sidebar organized by procurement stages:
- **Planning** - Create annual procurement plans
- **Sourcing** - Create and manage tenders
- **Evaluation** - Assess submitted bids
- **Contracts** - Manage awarded contracts

---

### For Suppliers

#### Step 1: Register
Complete supplier registration through the **Suppliers > Registration** portal.

Required Documents:
- Business Registration Certificate
- Tax Identification Number (TIN)
- Bank Account Details
- Key Personnel Information

#### Step 2: Browse Opportunities
Navigate to **Sourcing > Bidder Portal** to view all open tenders.

Filter by:
- Category (IT, Construction, Medical, etc.)
- Estimated Value Range
- Submission Deadline
- Procurement Method

#### Step 3: Submit a Bid
1. Select a tender and download specifications
2. Prepare your technical and financial proposals
3. Complete the online bid form
4. Upload required documents
5. Review and submit

**Note:** Your bid is encrypted immediately upon submission. No one can view it until the official opening time.

#### Step 4: Track Your Bid
Monitor your bid status:
- SEALED - Awaiting opening
- OPENED - Under evaluation
- RESPONSIVE / NON-RESPONSIVE - Compliance status
- AWARDED / NOT AWARDED - Final outcome

---

## Module-by-Module User Guide

### Planning Module

**Who Uses This:** Procurement Officers, Agency Heads, NPC Officers

#### Creating an Annual Procurement Plan

1. Navigate to **Planning > Annual Plans**
2. Click **Create New Plan**
3. Select Fiscal Year
4. Add Procurement Items:
   - Description
   - UNSPSC Category Code
   - Estimated Value
   - Procurement Method (auto-suggested based on value)
   - Expected Quarter
   - Justification

5. Save as Draft
6. Submit for Approval

**Approval Flow:**
```
Draft → Procurement Officer Review → Agency Head Approval → NPC Approval → Published
```

---

### Sourcing Module

**Who Uses This:** Procurement Officers, NPC Officers, Suppliers

#### Creating a Tender

1. Navigate to **Sourcing > Tenders > Create Tender**
2. Complete Tender Details:
   - Reference Number (auto-generated)
   - Title and Description
   - Category and UNSPSC Code
   - Estimated Value
   - Procurement Method
   - Submission Deadline
   - Bid Validity Period

3. Add Evaluation Criteria:
   - Technical criteria with weights
   - Pass/fail requirements
   - Price evaluation method

4. Upload Tender Documents:
   - Tender Notice
   - Technical Specifications
   - Terms of Reference
   - Bill of Quantities

5. Submit for Approval and Publish

#### Managing Clarifications

When suppliers ask questions:
1. Navigate to tender details
2. View **Clarifications** tab
3. Draft answer
4. Publish response (visible to all bidders)

#### Issuing Addenda

To modify a published tender:
1. Navigate to tender details
2. Click **Issue Addendum**
3. Describe changes
4. Optionally extend deadline
5. All registered bidders notified automatically

---

### Bid Management

**Who Uses This:** Procurement Officers, Evaluation Committee

#### Bid Opening Ceremony

1. Navigate to **Sourcing > Bid Opening**
2. Select the tender session
3. Verify committee attendance (minimum 3 members)
4. Each member must declare no conflict of interest
5. Click **Start Opening Session**
6. Bids are decrypted in order received
7. View bid amounts and documents
8. Generate **Bid Opening Report** (PDF)

**Security Features:**
- Cannot open before deadline
- All actions logged
- Committee signatures required
- Report serves as legal record

---

### Evaluation Module

**Who Uses This:** Evaluators, Procurement Officers

#### Conducting Evaluation

1. Navigate to **Evaluation > Evaluations**
2. Select assigned tender
3. Complete COI Declaration (mandatory)
4. For each bid:
   - Assess compliance (responsive/non-responsive)
   - Score technical criteria
   - Record comments/justifications
5. Financial evaluation:
   - Lowest price automatic scoring, or
   - Formula-based for QCBS
6. Generate ranking
7. Submit evaluation report

#### COI Declaration

Before evaluating, declare:
- Any relationship with bidders
- Financial interests
- Personal connections
- Previous employment

If conflict exists, recuse from that bid's evaluation.

---

### Contract Module

**Who Uses This:** Procurement Officers, Contract Managers, Finance Officers

#### Creating a Contract

After award approval:
1. Navigate to **Contracts > Create from Award**
2. Contract auto-populated from tender/bid
3. Review and adjust:
   - Contract value
   - Start/end dates
   - Milestone schedule
   - Payment terms
4. Add specific clauses
5. Generate contract document
6. Route for signatures

#### Tracking Milestones

1. Navigate to **Contracts > Milestones**
2. View all pending deliverables
3. Update status:
   - Mark complete with evidence
   - Flag delays with reasons
4. Trigger payment on completion

#### Processing Variations

If contract scope/value changes:
1. Navigate to contract details
2. Click **Add Variation**
3. Specify:
   - Type (price, scope, time)
   - Justification
   - Financial impact
4. Submit for approval

---

### Marketplace Module

**Who Uses This:** All Government Officers, Suppliers

#### Purchasing from Catalogue

For low-value, pre-approved items:
1. Navigate to **Marketplace > Browse Catalogue**
2. Search or filter by category
3. Select items and quantities
4. Add to cart
5. Create Purchase Order
6. Submit for approval
7. Track delivery

**Thresholds:**
- < K50,000: Single approval
- K50,000-100,000: Two approvals
- > K100,000: Use formal tender process

---

### Supplier Module

**Who Uses This:** Suppliers, NPC Officers

#### Supplier Registration

Required Information:
1. **Business Details**
   - Company Name
   - Registration Number
   - Address
   - Contact Information

2. **Legal Documents**
   - IPA Registration
   - TIN Certificate
   - Insurance Certificate

3. **Financial Information**
   - Bank Details
   - Audited Financials (if applicable)

4. **Categories**
   - UNSPSC codes for products/services
   - Industry classifications

5. **Qualifications**
   - Certifications (ISO, etc.)
   - Past performance references

#### Pre-qualification

For high-value contracts:
1. Apply for qualification level
2. Submit supporting documents
3. NPC reviews and approves
4. Qualification valid for 2 years
5. Can bid on contracts up to qualified amount

---

### Analytics Module

**Who Uses This:** Agency Heads, NPC Officers, Auditors

#### Dashboard Metrics

Key indicators displayed:
- **Active Tenders** - Open opportunities
- **Contract Value** - Total committed spend
- **Compliance Rate** - Percentage meeting requirements
- **Processing Time** - Average days to award
- **Savings** - Difference from estimates

#### OCDS Export

For transparency reporting:
1. Navigate to **Analytics > OCDS Export**
2. Select date range
3. Choose release types
4. Download JSON file
5. Publish to national open data portal

---

## Approval Workflows

All major actions require approval. The workflow depends on entity type:

| Entity | Steps | Approvers |
|--------|-------|-----------|
| Annual Plan | 3 | Procurement Officer → Agency Head → NPC |
| Tender Publication | 2 | Agency Head → NPC Officer |
| Bid Award | 3 | Evaluation Committee → Procurement → NPC |
| Purchase Order | 2 | Finance Officer → Agency Head |
| Contract Variation | 3 | Procurement → Finance → Agency Head |

### Taking Action on Workflows

1. Navigate to **Administration > Workflows**
2. View items assigned to you
3. Review attached documents
4. Choose action:
   - **Approve** - Forward to next step
   - **Reject** - End with rejection (requires reason)
   - **Return** - Send back for corrections

---

## Notifications

The system sends automatic notifications for:

| Event | Notification |
|-------|--------------|
| Approval pending | Email + in-app |
| Tender published | Email to registered suppliers |
| Deadline approaching | 48-hour reminder |
| Bid submitted | Confirmation email |
| Award decision | Email to all bidders |
| Contract milestone due | 7-day reminder |

### Managing Notifications

1. Click the bell icon in the header
2. View recent notifications
3. Click to navigate to source
4. Mark as read

---

## Offline Mode

The system works offline for essential functions:

### What Works Offline
- View previously loaded pages
- Draft forms (saved locally)
- View downloaded documents

### What Requires Connection
- Submit forms
- Upload documents
- Receive real-time updates

### Syncing When Back Online
1. Reconnect to internet
2. System automatically syncs queued data
3. View sync status on offline page

---

## Security Best Practices

1. **Password Security**
   - Use strong, unique password
   - Enable MFA if available
   - Never share credentials

2. **Session Management**
   - Log out when finished
   - Don't leave sessions unattended
   - Report suspicious activity

3. **Document Handling**
   - Only download what's needed
   - Secure confidential documents
   - Don't email tender documents

4. **Bid Confidentiality**
   - Sealed bids are encrypted
   - Only committee can open after deadline
   - All access is logged

---

## Getting Help

### In-System Help
- Click **?** icons for context help
- Tooltips on hover

### Support Contacts
- **NPC Helpdesk:** support@npc.gov.pg
- **Phone:** +675 XXX XXXX
- **Hours:** 8:00 AM - 5:00 PM (Mon-Fri)

### Training Resources
- Online training modules
- User manuals (this document)
- Video tutorials

---

## Glossary

| Term | Definition |
|------|------------|
| APP | Annual Procurement Plan |
| COI | Conflict of Interest |
| OCDS | Open Contracting Data Standard |
| QCBS | Quality-Cost Based Selection |
| RFQ | Request for Quotation |
| ToR | Terms of Reference |
| UNSPSC | Universal Standard Products and Services Classification |

---

**End of User Guide**

*National Procurement Commission, Papua New Guinea*
