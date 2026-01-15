import { create } from 'zustand';

export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'RETURNED';
export type WorkflowEntityType = 'ANNUAL_PLAN' | 'TENDER' | 'PURCHASE_ORDER' | 'AWARD' | 'CONTRACT' | 'VARIATION';

export interface ApprovalStep {
  id: string;
  stepNumber: number;
  title: string;
  requiredRole: string;
  assignedTo?: string;
  assignedToName?: string;
  status: ApprovalStatus;
  comments?: string;
  actionDate?: Date;
  dueDate?: Date;
}

export interface ApprovalWorkflow {
  id: string;
  entityType: WorkflowEntityType;
  entityId: string;
  entityRef: string;
  entityTitle: string;
  currentStep: number;
  totalSteps: number;
  status: 'IN_PROGRESS' | 'APPROVED' | 'REJECTED' | 'RETURNED';
  steps: ApprovalStep[];
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  requestedValue?: number;
}

interface WorkflowState {
  workflows: ApprovalWorkflow[];

  // Actions
  addWorkflow: (workflow: ApprovalWorkflow) => void;
  approveStep: (workflowId: string, stepId: string, comments?: string) => void;
  rejectStep: (workflowId: string, stepId: string, comments: string) => void;
  returnStep: (workflowId: string, stepId: string, comments: string) => void;
  getWorkflowsByEntity: (entityType: WorkflowEntityType) => ApprovalWorkflow[];
  getPendingApprovals: (userId?: string) => ApprovalWorkflow[];
}

// Use a fixed base date for SSR stability
const BASE_DATE = new Date('2026-01-11T10:00:00.000Z');

const generateMockWorkflows = (): ApprovalWorkflow[] => {
  return [
    {
      id: 'WF-001',
      entityType: 'ANNUAL_PLAN',
      entityId: 'APP-2026-001',
      entityRef: 'APP/2026/DOF-001',
      entityTitle: 'Department of Finance Annual Procurement Plan 2026',
      currentStep: 2,
      totalSteps: 3,
      status: 'IN_PROGRESS',
      requestedValue: 45000000,
      steps: [
        {
          id: 'WF-001-S1',
          stepNumber: 1,
          title: 'Procurement Officer Review',
          requiredRole: 'PROCUREMENT_OFFICER',
          assignedTo: 'user-1',
          assignedToName: 'John Doe',
          status: 'APPROVED',
          comments: 'All items verified and aligned with budget',
          actionDate: new Date(BASE_DATE.getTime() - 3 * 24 * 60 * 60 * 1000),
        },
        {
          id: 'WF-001-S2',
          stepNumber: 2,
          title: 'Agency Head Approval',
          requiredRole: 'AGENCY_HEAD',
          assignedTo: 'user-2',
          assignedToName: 'Mary Smith',
          status: 'PENDING',
          dueDate: new Date(BASE_DATE.getTime() + 2 * 24 * 60 * 60 * 1000),
        },
        {
          id: 'WF-001-S3',
          stepNumber: 3,
          title: 'NPC Final Approval',
          requiredRole: 'NPC_OFFICER',
          status: 'PENDING',
        },
      ],
      createdAt: new Date(BASE_DATE.getTime() - 5 * 24 * 60 * 60 * 1000),
      updatedAt: BASE_DATE,
      createdBy: 'user-1',
    },
    {
      id: 'WF-002',
      entityType: 'PURCHASE_ORDER',
      entityId: 'PO-003',
      entityRef: 'PNG-PO-2026-003',
      entityTitle: 'Office Furniture for National Planning Office',
      currentStep: 1,
      totalSteps: 2,
      status: 'IN_PROGRESS',
      requestedValue: 16900,
      steps: [
        {
          id: 'WF-002-S1',
          stepNumber: 1,
          title: 'Finance Officer Review',
          requiredRole: 'FINANCE_OFFICER',
          assignedTo: 'user-3',
          assignedToName: 'Peter Kila',
          status: 'PENDING',
          dueDate: new Date(BASE_DATE.getTime() + 1 * 24 * 60 * 60 * 1000),
        },
        {
          id: 'WF-002-S2',
          stepNumber: 2,
          title: 'Agency Head Approval',
          requiredRole: 'AGENCY_HEAD',
          status: 'PENDING',
        },
      ],
      createdAt: new Date(BASE_DATE.getTime() - 2 * 24 * 60 * 60 * 1000),
      updatedAt: BASE_DATE,
      createdBy: 'user-4',
    },
    {
      id: 'WF-003',
      entityType: 'AWARD',
      entityId: 'AWARD-001',
      entityRef: 'NPC/2026/T-0001/AWARD',
      entityTitle: 'Award of Medical Equipment Supply Contract',
      currentStep: 2,
      totalSteps: 3,
      status: 'IN_PROGRESS',
      requestedValue: 2200000,
      steps: [
        {
          id: 'WF-003-S1',
          stepNumber: 1,
          title: 'Evaluation Committee Recommendation',
          requiredRole: 'EVALUATOR',
          assignedTo: 'user-5',
          assignedToName: 'Dr. Paul Nao',
          status: 'APPROVED',
          comments: 'PNG Medical Supplies Pty Ltd recommended based on highest combined score',
          actionDate: new Date(BASE_DATE.getTime() - 1 * 24 * 60 * 60 * 1000),
        },
        {
          id: 'WF-003-S2',
          stepNumber: 2,
          title: 'Procurement Officer Verification',
          requiredRole: 'PROCUREMENT_OFFICER',
          assignedTo: 'user-1',
          assignedToName: 'John Doe',
          status: 'PENDING',
          dueDate: new Date(BASE_DATE.getTime() + 2 * 24 * 60 * 60 * 1000),
        },
        {
          id: 'WF-003-S3',
          stepNumber: 3,
          title: 'NPC Award Approval',
          requiredRole: 'NPC_ADMIN',
          status: 'PENDING',
        },
      ],
      createdAt: new Date(BASE_DATE.getTime() - 7 * 24 * 60 * 60 * 1000),
      updatedAt: BASE_DATE,
      createdBy: 'user-5',
    },
    {
      id: 'WF-004',
      entityType: 'TENDER',
      entityId: 'tender-2',
      entityRef: 'NPC/2026/T-0002',
      entityTitle: 'Construction of Provincial Health Center',
      currentStep: 1,
      totalSteps: 2,
      status: 'IN_PROGRESS',
      requestedValue: 14500000,
      steps: [
        {
          id: 'WF-004-S1',
          stepNumber: 1,
          title: 'Agency Head Approval',
          requiredRole: 'AGENCY_HEAD',
          assignedTo: 'user-6',
          assignedToName: 'Anna Ravu',
          status: 'PENDING',
          dueDate: new Date(BASE_DATE.getTime() + 3 * 24 * 60 * 60 * 1000),
        },
        {
          id: 'WF-004-S2',
          stepNumber: 2,
          title: 'NPC Publication Approval',
          requiredRole: 'NPC_OFFICER',
          status: 'PENDING',
        },
      ],
      createdAt: new Date(BASE_DATE.getTime() - 4 * 24 * 60 * 60 * 1000),
      updatedAt: BASE_DATE,
      createdBy: 'user-7',
    },
  ];
};

export const useWorkflowStore = create<WorkflowState>((set, get) => ({
  workflows: generateMockWorkflows(),

  addWorkflow: (workflow) =>
    set((state) => ({
      workflows: [...state.workflows, workflow],
    })),

  approveStep: (workflowId, stepId, comments) =>
    set((state) => ({
      workflows: state.workflows.map((wf) => {
        if (wf.id !== workflowId) return wf;

        const updatedSteps = wf.steps.map((step) => {
          if (step.id !== stepId) return step;
          return {
            ...step,
            status: 'APPROVED' as ApprovalStatus,
            comments,
            actionDate: new Date(),
          };
        });

        const allApproved = updatedSteps.every((s) => s.status === 'APPROVED');
        const nextPendingStep = updatedSteps.findIndex((s) => s.status === 'PENDING') + 1;

        return {
          ...wf,
          steps: updatedSteps,
          currentStep: nextPendingStep || wf.totalSteps,
          status: allApproved ? 'APPROVED' : 'IN_PROGRESS',
          updatedAt: new Date(),
        };
      }),
    })),

  rejectStep: (workflowId, stepId, comments) =>
    set((state) => ({
      workflows: state.workflows.map((wf) => {
        if (wf.id !== workflowId) return wf;

        const updatedSteps = wf.steps.map((step) => {
          if (step.id !== stepId) return step;
          return {
            ...step,
            status: 'REJECTED' as ApprovalStatus,
            comments,
            actionDate: new Date(),
          };
        });

        return {
          ...wf,
          steps: updatedSteps,
          status: 'REJECTED',
          updatedAt: new Date(),
        };
      }),
    })),

  returnStep: (workflowId, stepId, comments) =>
    set((state) => ({
      workflows: state.workflows.map((wf) => {
        if (wf.id !== workflowId) return wf;

        const updatedSteps = wf.steps.map((step) => {
          if (step.id !== stepId) return step;
          return {
            ...step,
            status: 'RETURNED' as ApprovalStatus,
            comments,
            actionDate: new Date(),
          };
        });

        return {
          ...wf,
          steps: updatedSteps,
          status: 'RETURNED',
          updatedAt: new Date(),
        };
      }),
    })),

  getWorkflowsByEntity: (entityType) => {
    return get().workflows.filter((wf) => wf.entityType === entityType);
  },

  getPendingApprovals: (userId) => {
    return get().workflows.filter((wf) => {
      if (wf.status !== 'IN_PROGRESS') return false;
      const currentStepIndex = wf.currentStep - 1;
      const currentStep = wf.steps[currentStepIndex];
      if (!currentStep) return false;
      if (userId && currentStep.assignedTo !== userId) return false;
      return currentStep.status === 'PENDING';
    });
  },
}));
