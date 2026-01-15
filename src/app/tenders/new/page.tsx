'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import {
  ArrowLeft,
  ArrowRight,
  Save,
  Send,
  FileText,
  Calendar,
  DollarSign,
  Building2,
  AlertCircle,
  CheckCircle2,
  Plus,
  Trash2,
  Upload,
} from 'lucide-react';
import { toast } from 'sonner';
import { useProcurementStore } from '@/stores/procurement-store';
import type { ProcurementMethod } from '@/types';

const steps = [
  { id: 1, name: 'Basic Information', description: 'Tender details' },
  { id: 2, name: 'Requirements', description: 'Specifications and documents' },
  { id: 3, name: 'Evaluation', description: 'Criteria and scoring' },
  { id: 4, name: 'Review', description: 'Final review and submit' },
];

export default function NewTenderPage() {
  const router = useRouter();
  const { addTender } = useProcurementStore();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    procurementMethod: '' as ProcurementMethod | '',
    estimatedValue: '',
    currency: 'PGK',
    submissionDeadline: '',
    openingDate: '',
    validityPeriod: '90',
    bidSecurityRequired: false,
    bidSecurityAmount: '',
    technicalSpecifications: '',
    evaluationMethod: 'QUALITY_COST',
  });

  const [evaluationCriteria, setEvaluationCriteria] = useState([
    { name: 'Technical Compliance', weight: 30, isEliminatory: true },
    { name: 'Experience & Track Record', weight: 20, isEliminatory: false },
    { name: 'Price', weight: 50, isEliminatory: false },
  ]);

  const updateFormData = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const addCriteria = () => {
    setEvaluationCriteria((prev) => [
      ...prev,
      { name: '', weight: 0, isEliminatory: false },
    ]);
  };

  const removeCriteria = (index: number) => {
    setEvaluationCriteria((prev) => prev.filter((_, i) => i !== index));
  };

  const updateCriteria = (index: number, field: string, value: string | number | boolean) => {
    setEvaluationCriteria((prev) =>
      prev.map((c, i) => (i === index ? { ...c, [field]: value } : c))
    );
  };

  const handleSaveDraft = () => {
    toast.success('Tender saved as draft');
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const newTender = {
      id: `tender-${Date.now()}`,
      referenceNumber: `NPC/2026/T-${String(Math.floor(Math.random() * 9000) + 1000).padStart(4, '0')}`,
      title: formData.title,
      description: formData.description,
      organizationId: 'org-1',
      procurementMethod: formData.procurementMethod as ProcurementMethod,
      status: 'PENDING_APPROVAL' as const,
      category: formData.category,
      estimatedValue: {
        amount: Number.parseFloat(formData.estimatedValue) || 0,
        currency: 'PGK' as const,
      },
      currency: formData.currency,
      submissionDeadline: new Date(formData.submissionDeadline),
      openingDate: new Date(formData.openingDate),
      validityPeriod: Number.parseInt(formData.validityPeriod),
      bidSecurityRequired: formData.bidSecurityRequired,
      bidSecurityAmount: formData.bidSecurityRequired
        ? { amount: Number.parseFloat(formData.bidSecurityAmount), currency: 'PGK' as const }
        : undefined,
      documents: [],
      lots: [],
      evaluationCriteria: [],
      clarifications: [],
      addenda: [],
      approvalChain: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'admin',
      updatedBy: 'admin',
      isDeleted: false,
    };

    addTender(newTender);
    toast.success('Tender submitted for approval');
    setIsSubmitting(false);
    router.push('/tenders');
  };

  const totalWeight = evaluationCriteria.reduce((sum, c) => sum + c.weight, 0);

  return (
    <div className="p-6 space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/tenders">Tenders</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>New Tender</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Create New Tender</h1>
          <p className="text-sm text-zinc-500">
            Complete all required fields to create a new procurement tender
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={handleSaveDraft}>
            <Save className="h-4 w-4 mr-2" />
            Save Draft
          </Button>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center flex-1">
            <div className="flex items-center gap-3">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full border-2 font-semibold transition-colors ${
                  currentStep > step.id
                    ? 'border-emerald-500 bg-emerald-500 text-white'
                    : currentStep === step.id
                    ? 'border-red-600 bg-red-600 text-white'
                    : 'border-zinc-300 bg-white text-zinc-400'
                }`}
              >
                {currentStep > step.id ? (
                  <CheckCircle2 className="h-5 w-5" />
                ) : (
                  step.id
                )}
              </div>
              <div className="hidden md:block">
                <p className={`text-sm font-medium ${currentStep >= step.id ? 'text-zinc-900' : 'text-zinc-400'}`}>
                  {step.name}
                </p>
                <p className="text-xs text-zinc-500">{step.description}</p>
              </div>
            </div>
            {index < steps.length - 1 && (
              <div className={`flex-1 h-0.5 mx-4 ${currentStep > step.id ? 'bg-emerald-500' : 'bg-zinc-200'}`} />
            )}
          </div>
        ))}
      </div>

      {/* Form Content */}
      <Card>
        <CardContent className="p-6">
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-zinc-900 mb-4">Basic Information</h2>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="md:col-span-2">
                  <Label htmlFor="title">Tender Title *</Label>
                  <Input
                    id="title"
                    placeholder="Enter a descriptive title for the tender"
                    value={formData.title}
                    onChange={(e) => updateFormData('title', e.target.value)}
                    className="mt-1.5"
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Provide a detailed description of the procurement requirements"
                    value={formData.description}
                    onChange={(e) => updateFormData('description', e.target.value)}
                    className="mt-1.5 min-h-[120px]"
                  />
                </div>

                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(v) => updateFormData('category', v)}
                  >
                    <SelectTrigger className="mt-1.5">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Information Technology">Information Technology</SelectItem>
                      <SelectItem value="Medical Supplies">Medical Supplies</SelectItem>
                      <SelectItem value="Construction Works">Construction Works</SelectItem>
                      <SelectItem value="Office Supplies">Office Supplies</SelectItem>
                      <SelectItem value="Professional Services">Professional Services</SelectItem>
                      <SelectItem value="Vehicles & Equipment">Vehicles & Equipment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="method">Procurement Method *</Label>
                  <Select
                    value={formData.procurementMethod}
                    onValueChange={(v) => updateFormData('procurementMethod', v)}
                  >
                    <SelectTrigger className="mt-1.5">
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="OPEN_TENDER">Open Tender</SelectItem>
                      <SelectItem value="RESTRICTED_TENDER">Restricted Tender</SelectItem>
                      <SelectItem value="REQUEST_FOR_QUOTATION">Request for Quotation</SelectItem>
                      <SelectItem value="DIRECT_PROCUREMENT">Direct Procurement</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="value">Estimated Value (PGK) *</Label>
                  <div className="relative mt-1.5">
                    <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                    <Input
                      id="value"
                      type="number"
                      placeholder="0.00"
                      value={formData.estimatedValue}
                      onChange={(e) => updateFormData('estimatedValue', e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="validity">Bid Validity Period (days) *</Label>
                  <Input
                    id="validity"
                    type="number"
                    value={formData.validityPeriod}
                    onChange={(e) => updateFormData('validityPeriod', e.target.value)}
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label htmlFor="deadline">Submission Deadline *</Label>
                  <div className="relative mt-1.5">
                    <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                    <Input
                      id="deadline"
                      type="datetime-local"
                      value={formData.submissionDeadline}
                      onChange={(e) => updateFormData('submissionDeadline', e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="opening">Bid Opening Date *</Label>
                  <div className="relative mt-1.5">
                    <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                    <Input
                      id="opening"
                      type="datetime-local"
                      value={formData.openingDate}
                      onChange={(e) => updateFormData('openingDate', e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <div className="flex items-center gap-3 mb-4">
                  <Checkbox
                    id="security"
                    checked={formData.bidSecurityRequired}
                    onCheckedChange={(checked) => updateFormData('bidSecurityRequired', !!checked)}
                  />
                  <Label htmlFor="security" className="font-medium">Bid Security Required</Label>
                </div>

                {formData.bidSecurityRequired && (
                  <div className="ml-7">
                    <Label htmlFor="securityAmount">Bid Security Amount (PGK)</Label>
                    <div className="relative mt-1.5 max-w-xs">
                      <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                      <Input
                        id="securityAmount"
                        type="number"
                        placeholder="0.00"
                        value={formData.bidSecurityAmount}
                        onChange={(e) => updateFormData('bidSecurityAmount', e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Requirements */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-zinc-900 mb-4">Technical Requirements</h2>
              </div>

              <div>
                <Label htmlFor="specs">Technical Specifications *</Label>
                <Textarea
                  id="specs"
                  placeholder="Enter detailed technical specifications and requirements"
                  value={formData.technicalSpecifications}
                  onChange={(e) => updateFormData('technicalSpecifications', e.target.value)}
                  className="mt-1.5 min-h-[200px]"
                />
              </div>

              <Separator />

              <div>
                <h3 className="text-base font-medium text-zinc-900 mb-4">Tender Documents</h3>
                <div className="border-2 border-dashed border-zinc-200 rounded-lg p-8 text-center">
                  <Upload className="h-10 w-10 mx-auto text-zinc-400 mb-3" />
                  <p className="text-sm font-medium text-zinc-900 mb-1">
                    Upload tender documents
                  </p>
                  <p className="text-xs text-zinc-500 mb-4">
                    PDF, DOC, DOCX, XLS, XLSX up to 50MB each
                  </p>
                  <Button variant="outline">
                    <Upload className="h-4 w-4 mr-2" />
                    Select Files
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Evaluation */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-zinc-900 mb-4">Evaluation Criteria</h2>
              </div>

              <div className="max-w-md">
                <Label>Evaluation Method *</Label>
                <Select
                  value={formData.evaluationMethod}
                  onValueChange={(v) => updateFormData('evaluationMethod', v)}
                >
                  <SelectTrigger className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOWEST_PRICE">Lowest Price</SelectItem>
                    <SelectItem value="QUALITY_COST">Quality-Cost Based</SelectItem>
                    <SelectItem value="QUALITY_ONLY">Quality Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-base font-medium text-zinc-900">Scoring Criteria</h3>
                    <p className="text-sm text-zinc-500">Define evaluation criteria and weights</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={addCriteria}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Criteria
                  </Button>
                </div>

                <div className="space-y-3">
                  {evaluationCriteria.map((criteria, index) => (
                    <div key={index} className="flex items-center gap-4 p-4 rounded-lg border border-zinc-200">
                      <div className="flex-1">
                        <Input
                          placeholder="Criteria name"
                          value={criteria.name}
                          onChange={(e) => updateCriteria(index, 'name', e.target.value)}
                        />
                      </div>
                      <div className="w-24">
                        <div className="relative">
                          <Input
                            type="number"
                            placeholder="Weight"
                            value={criteria.weight}
                            onChange={(e) => updateCriteria(index, 'weight', Number(e.target.value))}
                            className="pr-8"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400">%</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Checkbox
                          checked={criteria.isEliminatory}
                          onCheckedChange={(checked) => updateCriteria(index, 'isEliminatory', !!checked)}
                        />
                        <span className="text-xs text-zinc-500">Eliminatory</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                        onClick={() => removeCriteria(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                <div className="mt-4 p-3 rounded-lg bg-zinc-50 flex items-center justify-between">
                  <span className="text-sm font-medium text-zinc-700">Total Weight</span>
                  <Badge
                    variant="secondary"
                    className={totalWeight === 100 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}
                  >
                    {totalWeight}% {totalWeight === 100 ? '(Valid)' : '(Must equal 100%)'}
                  </Badge>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Review */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-zinc-900 mb-4">Review & Submit</h2>
                <p className="text-sm text-zinc-500">Review your tender details before submission</p>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Basic Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Title</span>
                      <span className="font-medium text-right max-w-[200px] truncate">{formData.title || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Category</span>
                      <span className="font-medium">{formData.category || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Method</span>
                      <span className="font-medium">{formData.procurementMethod?.replace(/_/g, ' ') || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Value</span>
                      <span className="font-medium">K {Number(formData.estimatedValue || 0).toLocaleString()}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Timeline</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Submission Deadline</span>
                      <span className="font-medium">{formData.submissionDeadline || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Opening Date</span>
                      <span className="font-medium">{formData.openingDate || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Validity Period</span>
                      <span className="font-medium">{formData.validityPeriod} days</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Bid Security</span>
                      <span className="font-medium">
                        {formData.bidSecurityRequired ? `K ${Number(formData.bidSecurityAmount || 0).toLocaleString()}` : 'Not required'}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle className="text-sm">Evaluation Criteria</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {evaluationCriteria.map((c, i) => (
                        <div key={i} className="flex items-center justify-between py-2 border-b border-zinc-100 last:border-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm">{c.name || 'Unnamed'}</span>
                            {c.isEliminatory && (
                              <Badge variant="outline" className="text-[10px]">Eliminatory</Badge>
                            )}
                          </div>
                          <span className="text-sm font-medium">{c.weight}%</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="p-4 rounded-lg bg-amber-50 border border-amber-200">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-amber-900">Before submitting</p>
                    <p className="text-sm text-amber-700 mt-1">
                      This tender will be submitted for approval. Once approved, it will be published
                      and visible to all registered suppliers.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>

        {/* Navigation */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-200">
          <Button
            variant="outline"
            onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
            disabled={currentStep === 1}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          <div className="flex items-center gap-3">
            {currentStep < 4 ? (
              <Button
                onClick={() => setCurrentStep((prev) => Math.min(4, prev + 1))}
                className="bg-red-600 hover:bg-red-700"
              >
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-red-600 hover:bg-red-700"
              >
                {isSubmitting ? (
                  <>
                    <span className="animate-spin mr-2">...</span>
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Submit for Approval
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
