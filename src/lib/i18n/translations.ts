/**
 * PNG eGP System - Internationalization (i18n)
 *
 * Supports: English (en), Tok Pisin (tpi)
 */

export type Language = 'en' | 'tpi';

export interface TranslationStrings {
  // Common
  common: {
    loading: string;
    save: string;
    cancel: string;
    submit: string;
    delete: string;
    edit: string;
    view: string;
    search: string;
    filter: string;
    clear: string;
    confirm: string;
    back: string;
    next: string;
    previous: string;
    close: string;
    yes: string;
    no: string;
    all: string;
    none: string;
    required: string;
    optional: string;
    success: string;
    error: string;
    warning: string;
    info: string;
  };
  // Navigation
  nav: {
    dashboard: string;
    planning: string;
    tenders: string;
    bids: string;
    contracts: string;
    suppliers: string;
    reports: string;
    admin: string;
    settings: string;
    help: string;
    logout: string;
  };
  // Dashboard
  dashboard: {
    welcome: string;
    activeTenders: string;
    activeContracts: string;
    registeredSuppliers: string;
    totalValue: string;
    complianceScore: string;
    attentionRequired: string;
    recentTenders: string;
    upcomingDeadlines: string;
    procurementTrend: string;
    byCategory: string;
  };
  // Tenders
  tender: {
    title: string;
    reference: string;
    description: string;
    category: string;
    estimatedValue: string;
    deadline: string;
    status: string;
    createNew: string;
    viewAll: string;
    bidNow: string;
    closed: string;
    open: string;
    underEvaluation: string;
    awarded: string;
    daysRemaining: string;
    hoursRemaining: string;
    noTenders: string;
    bidSubmission: string;
    technicalProposal: string;
    financialProposal: string;
  };
  // Bids
  bid: {
    title: string;
    yourBid: string;
    amount: string;
    status: string;
    submitted: string;
    draft: string;
    sealed: string;
    opened: string;
    evaluated: string;
    submitBid: string;
    withdrawBid: string;
    confirmSubmission: string;
    encryptionNotice: string;
  };
  // Suppliers
  supplier: {
    title: string;
    register: string;
    profile: string;
    subscription: string;
    documents: string;
    performance: string;
    categories: string;
    status: string;
    active: string;
    pending: string;
    suspended: string;
  };
  // Subscription
  subscription: {
    title: string;
    plans: string;
    currentPlan: string;
    subscribe: string;
    renew: string;
    upgrade: string;
    expiresOn: string;
    bidsRemaining: string;
    bidsUsed: string;
    subscriptionRequired: string;
    paymentPending: string;
  };
  // Contracts
  contract: {
    title: string;
    reference: string;
    value: string;
    startDate: string;
    endDate: string;
    status: string;
    milestones: string;
    variations: string;
    payments: string;
  };
  // Auth
  auth: {
    login: string;
    logout: string;
    signup: string;
    forgotPassword: string;
    resetPassword: string;
    email: string;
    password: string;
    confirmPassword: string;
    rememberMe: string;
    signInButton: string;
    createAccount: string;
    alreadyHaveAccount: string;
    dontHaveAccount: string;
  };
  // Messages
  messages: {
    saveSuccess: string;
    saveFailed: string;
    deleteSuccess: string;
    deleteFailed: string;
    uploadSuccess: string;
    uploadFailed: string;
    submissionSuccess: string;
    submissionFailed: string;
    loginSuccess: string;
    loginFailed: string;
    logoutSuccess: string;
    sessionExpired: string;
    accessDenied: string;
    notFound: string;
    serverError: string;
  };
}

// English translations
export const en: TranslationStrings = {
  common: {
    loading: 'Loading...',
    save: 'Save',
    cancel: 'Cancel',
    submit: 'Submit',
    delete: 'Delete',
    edit: 'Edit',
    view: 'View',
    search: 'Search',
    filter: 'Filter',
    clear: 'Clear',
    confirm: 'Confirm',
    back: 'Back',
    next: 'Next',
    previous: 'Previous',
    close: 'Close',
    yes: 'Yes',
    no: 'No',
    all: 'All',
    none: 'None',
    required: 'Required',
    optional: 'Optional',
    success: 'Success',
    error: 'Error',
    warning: 'Warning',
    info: 'Information',
  },
  nav: {
    dashboard: 'Dashboard',
    planning: 'Planning',
    tenders: 'Tenders',
    bids: 'Bids',
    contracts: 'Contracts',
    suppliers: 'Suppliers',
    reports: 'Reports',
    admin: 'Administration',
    settings: 'Settings',
    help: 'Help',
    logout: 'Logout',
  },
  dashboard: {
    welcome: 'Welcome to the PNG e-Government Procurement System',
    activeTenders: 'Active Tenders',
    activeContracts: 'Active Contracts',
    registeredSuppliers: 'Registered Suppliers',
    totalValue: 'Total Procurement Value',
    complianceScore: 'Compliance Score',
    attentionRequired: 'Attention Required',
    recentTenders: 'Recent Tenders',
    upcomingDeadlines: 'Upcoming Deadlines',
    procurementTrend: 'Procurement Trend',
    byCategory: 'By Category',
  },
  tender: {
    title: 'Tender',
    reference: 'Reference Number',
    description: 'Description',
    category: 'Category',
    estimatedValue: 'Estimated Value',
    deadline: 'Submission Deadline',
    status: 'Status',
    createNew: 'Create New Tender',
    viewAll: 'View All Tenders',
    bidNow: 'Bid Now',
    closed: 'Closed',
    open: 'Open',
    underEvaluation: 'Under Evaluation',
    awarded: 'Awarded',
    daysRemaining: 'days remaining',
    hoursRemaining: 'hours remaining',
    noTenders: 'No tenders available',
    bidSubmission: 'Bid Submission',
    technicalProposal: 'Technical Proposal',
    financialProposal: 'Financial Proposal',
  },
  bid: {
    title: 'Bid',
    yourBid: 'Your Bid',
    amount: 'Bid Amount',
    status: 'Status',
    submitted: 'Submitted',
    draft: 'Draft',
    sealed: 'Sealed',
    opened: 'Opened',
    evaluated: 'Evaluated',
    submitBid: 'Submit Bid',
    withdrawBid: 'Withdraw Bid',
    confirmSubmission: 'Confirm Submission',
    encryptionNotice: 'Your bid will be encrypted and sealed until the official opening time.',
  },
  supplier: {
    title: 'Supplier',
    register: 'Register as Supplier',
    profile: 'Company Profile',
    subscription: 'Subscription',
    documents: 'Documents',
    performance: 'Performance',
    categories: 'Categories',
    status: 'Status',
    active: 'Active',
    pending: 'Pending',
    suspended: 'Suspended',
  },
  subscription: {
    title: 'Subscription',
    plans: 'Subscription Plans',
    currentPlan: 'Current Plan',
    subscribe: 'Subscribe',
    renew: 'Renew',
    upgrade: 'Upgrade',
    expiresOn: 'Expires on',
    bidsRemaining: 'Bids Remaining',
    bidsUsed: 'Bids Used',
    subscriptionRequired: 'Subscription required to bid on tenders',
    paymentPending: 'Payment pending verification',
  },
  contract: {
    title: 'Contract',
    reference: 'Contract Reference',
    value: 'Contract Value',
    startDate: 'Start Date',
    endDate: 'End Date',
    status: 'Status',
    milestones: 'Milestones',
    variations: 'Variations',
    payments: 'Payments',
  },
  auth: {
    login: 'Login',
    logout: 'Logout',
    signup: 'Sign Up',
    forgotPassword: 'Forgot Password?',
    resetPassword: 'Reset Password',
    email: 'Email Address',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    rememberMe: 'Remember me',
    signInButton: 'Sign In',
    createAccount: 'Create Account',
    alreadyHaveAccount: 'Already have an account?',
    dontHaveAccount: 'Don\'t have an account?',
  },
  messages: {
    saveSuccess: 'Changes saved successfully',
    saveFailed: 'Failed to save changes',
    deleteSuccess: 'Deleted successfully',
    deleteFailed: 'Failed to delete',
    uploadSuccess: 'File uploaded successfully',
    uploadFailed: 'Failed to upload file',
    submissionSuccess: 'Submitted successfully',
    submissionFailed: 'Submission failed',
    loginSuccess: 'Login successful',
    loginFailed: 'Login failed',
    logoutSuccess: 'Logged out successfully',
    sessionExpired: 'Your session has expired. Please login again.',
    accessDenied: 'Access denied',
    notFound: 'Page not found',
    serverError: 'Server error. Please try again later.',
  },
};

// Tok Pisin translations
export const tpi: TranslationStrings = {
  common: {
    loading: 'Wetim...',
    save: 'Sevim',
    cancel: 'Lusim',
    submit: 'Salim',
    delete: 'Rausim',
    edit: 'Senisim',
    view: 'Lukim',
    search: 'Painim',
    filter: 'Filta',
    clear: 'Klinim',
    confirm: 'Orait',
    back: 'Bek',
    next: 'Neks',
    previous: 'Bipo',
    close: 'Pasim',
    yes: 'Yes',
    no: 'Nogat',
    all: 'Olgeta',
    none: 'Nating',
    required: 'Mas gat',
    optional: 'Sapos yu laik',
    success: 'Gutpela',
    error: 'Hevi',
    warning: 'Lukaut',
    info: 'Infomesen',
  },
  nav: {
    dashboard: 'Dashbod',
    planning: 'Plenning',
    tenders: 'Tender',
    bids: 'Bid',
    contracts: 'Kontrakt',
    suppliers: 'Saplaia',
    reports: 'Ripot',
    admin: 'Bos Opis',
    settings: 'Seting',
    help: 'Halivim',
    logout: 'Lusim',
  },
  dashboard: {
    welcome: 'Welkam long PNG eGP Sistem',
    activeTenders: 'Tender i Wok',
    activeContracts: 'Kontrakt i Wok',
    registeredSuppliers: 'Saplaia i Rejista',
    totalValue: 'Olgeta Mani',
    complianceScore: 'Mak Bilong Bihainim Lo',
    attentionRequired: 'Mas Lukluk',
    recentTenders: 'Nupela Tender',
    upcomingDeadlines: 'Taim Klostu',
    procurementTrend: 'Baim Samting Trend',
    byCategory: 'Long Kategori',
  },
  tender: {
    title: 'Tender',
    reference: 'Namba',
    description: 'Deskripsen',
    category: 'Kategori',
    estimatedValue: 'Mani Tingting',
    deadline: 'Taim Pinis',
    status: 'Stet',
    createNew: 'Kamapim Nupela Tender',
    viewAll: 'Lukim Olgeta Tender',
    bidNow: 'Bidim Nau',
    closed: 'Pinis',
    open: 'Opin',
    underEvaluation: 'Ol i Lukluk',
    awarded: 'Givim Pinis',
    daysRemaining: 'de i stap',
    hoursRemaining: 'aua i stap',
    noTenders: 'Nogat tender',
    bidSubmission: 'Salim Bid',
    technicalProposal: 'Teknikol Proposel',
    financialProposal: 'Mani Proposel',
  },
  bid: {
    title: 'Bid',
    yourBid: 'Bid Bilong Yu',
    amount: 'Mani Bid',
    status: 'Stet',
    submitted: 'Salim Pinis',
    draft: 'Draf',
    sealed: 'Pasim Pinis',
    opened: 'Opim Pinis',
    evaluated: 'Lukluk Pinis',
    submitBid: 'Salim Bid',
    withdrawBid: 'Pulim Bek Bid',
    confirmSubmission: 'Orait Long Salim',
    encryptionNotice: 'Bid bilong yu bai i stap hait inap long taim bilong opim.',
  },
  supplier: {
    title: 'Saplaia',
    register: 'Rejista Olsem Saplaia',
    profile: 'Kompani Profail',
    subscription: 'Sabskripsen',
    documents: 'Dokumin',
    performance: 'Wok Gut',
    categories: 'Kategori',
    status: 'Stet',
    active: 'Wok',
    pending: 'Wetim',
    suspended: 'Stopim',
  },
  subscription: {
    title: 'Sabskripsen',
    plans: 'Sabskripsen Plen',
    currentPlan: 'Plen Nau',
    subscribe: 'Sabskraib',
    renew: 'Nupelam',
    upgrade: 'Apgreid',
    expiresOn: 'Pinis long',
    bidsRemaining: 'Bid i Stap',
    bidsUsed: 'Bid i Yusim',
    subscriptionRequired: 'Mas gat sabskripsen bilong bidim tender',
    paymentPending: 'Wetim mani i klia',
  },
  contract: {
    title: 'Kontrakt',
    reference: 'Kontrakt Namba',
    value: 'Mani Kontrakt',
    startDate: 'De Stat',
    endDate: 'De Pinis',
    status: 'Stet',
    milestones: 'Mailston',
    variations: 'Variesen',
    payments: 'Peimen',
  },
  auth: {
    login: 'Go Insait',
    logout: 'Kam Ausait',
    signup: 'Joinim',
    forgotPassword: 'Lusim Paswod?',
    resetPassword: 'Nupela Paswod',
    email: 'Imel',
    password: 'Paswod',
    confirmPassword: 'Paswod Gen',
    rememberMe: 'Tingim mi',
    signInButton: 'Go Insait',
    createAccount: 'Kamapim Akaun',
    alreadyHaveAccount: 'Yu gat akaun pinis?',
    dontHaveAccount: 'Nogat akaun?',
  },
  messages: {
    saveSuccess: 'Sevim pinis',
    saveFailed: 'No inap sevim',
    deleteSuccess: 'Rausim pinis',
    deleteFailed: 'No inap rausim',
    uploadSuccess: 'Aplodim pinis',
    uploadFailed: 'No inap aplodim',
    submissionSuccess: 'Salim pinis',
    submissionFailed: 'No inap salim',
    loginSuccess: 'Go insait pinis',
    loginFailed: 'No inap go insait',
    logoutSuccess: 'Kam ausait pinis',
    sessionExpired: 'Taim pinis. Plis go insait gen.',
    accessDenied: 'No gat rot',
    notFound: 'Pes i lus',
    serverError: 'Hevi long server. Traim bihain.',
  },
};

// All translations
export const translations: Record<Language, TranslationStrings> = {
  en,
  tpi,
};

// Get translation by language
export function getTranslations(lang: Language): TranslationStrings {
  return translations[lang] || translations.en;
}

// Translation helper function
export function t(lang: Language, key: string): string {
  const parts = key.split('.');
  let value: unknown = translations[lang];

  for (const part of parts) {
    if (value && typeof value === 'object' && part in value) {
      value = (value as Record<string, unknown>)[part];
    } else {
      // Fallback to English
      value = translations.en;
      for (const p of parts) {
        if (value && typeof value === 'object' && p in value) {
          value = (value as Record<string, unknown>)[p];
        } else {
          return key; // Return key if not found
        }
      }
      break;
    }
  }

  return typeof value === 'string' ? value : key;
}
