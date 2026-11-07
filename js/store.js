/**
 * ZEUS Data Store & State Management
 * Handles persistent storage with localStorage, CRUD operations, and initial seed data.
 */

const STORAGE_KEYS = {
  CURRENT_USER: 'zeus_current_user',
  AUTH_TOKEN: 'zeus_auth_token',
  PROJECTS: 'zeus_projects',
  PRODUCTS: 'zeus_products',
  CLIENTS: 'zeus_clients',
  EMPLOYEES: 'zeus_employees',
  PAST_EMPLOYEES: 'zeus_past_employees',
  DOCUMENTS: 'zeus_documents',
  TEMPLATES: 'zeus_templates',
  INTERNSHIPS: 'zeus_internships',
  CREDENTIALS: 'zeus_credentials',
  USERS: 'zeus_users',
  SECURITY_VERIFIED: 'zeus_sec_verified',
  THEME: 'zeus_theme',
  ALLOWED_DOMAINS: 'zeus_allowed_domains'
};

// Default authorized company domains
const DEFAULT_ALLOWED_DOMAINS = [
  'domari.com',
  'domari.rw',
  'domari',
  'ikirezi.com',
  'ikirezi.rw',
  'ikirezi',
  'fraudshield.com',
  'fraudshield.ai',
  'fraudshield'
];

// Initial Seed Data
const INITIAL_DATA = {
  users: [
    {
      id: 'usr-1',
      name: 'Alexandre Ndungutse',
      email: 'alex@domari.com',
      role: 'Super Admin',
      domain: 'domari.com',
      department: 'Executive Management',
      status: 'Active',
      lastLogin: 'Just now',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80'
    },
    {
      id: 'usr-2',
      name: 'Sarah Uwase',
      email: 'sarah@ikirezi.com',
      role: 'Project Director',
      domain: 'ikirezi.com',
      department: 'Product Delivery',
      status: 'Active',
      lastLogin: '2 hours ago',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80'
    },
    {
      id: 'usr-3',
      name: 'David Mugisha',
      email: 'david@fraudshield.com',
      role: 'Security Engineer',
      domain: 'fraudshield.com',
      department: 'Cybersecurity',
      status: 'Active',
      lastLogin: 'Yesterday',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80'
    },
    {
      id: 'usr-4',
      name: 'Diane Kalisa',
      email: 'diane@domari.com',
      role: 'Product Lead',
      domain: 'domari.com',
      department: 'Engineering',
      status: 'Active',
      lastLogin: '3 days ago',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&auto=format&fit=crop&q=80'
    }
  ],

  products: [
    {
      id: 'prod-1',
      name: 'Zeus Operations Engine',
      stage: 'Live Production',
      stageIndex: 4, // 0: Ideation, 1: Planning, 2: Development, 3: QA & Testing, 4: Live Production
      progress: 95,
      lead: 'Alexandre N.',
      category: 'Core Platform',
      version: 'v2.4.0',
      description: 'Centralized operations, access governance, and corporate management framework.'
    },
    {
      id: 'prod-2',
      name: 'FraudShield AI Gateway',
      stage: 'QA & Testing',
      stageIndex: 3,
      progress: 78,
      lead: 'David Mugisha',
      category: 'Security & ML',
      version: 'v1.8.0-rc',
      description: 'Real-time transaction fraud scoring and synthetic identity detection pipeline.'
    },
    {
      id: 'prod-3',
      name: 'Ikirezi Smart Logistics',
      stage: 'Development',
      stageIndex: 2,
      progress: 60,
      lead: 'Sarah Uwase',
      category: 'Supply Chain',
      version: 'v1.2.0-beta',
      description: 'Automated fleet telemetry, customs clearance tracking, and route optimizer.'
    },
    {
      id: 'prod-4',
      name: 'Domari Unified Payment Gateway',
      stage: 'Planning',
      stageIndex: 1,
      progress: 35,
      lead: 'Diane Kalisa',
      category: 'Fintech',
      version: 'v0.9.0',
      description: 'Multi-currency settlement switch supporting regional mobile money and card networks.'
    }
  ],

  projects: [
    {
      id: 'prj-101',
      name: 'National Core Banking Fraud Detection',
      client: 'Bank of Kigali',
      clientId: 'cli-1',
      status: 'In Progress',
      stage: 'Development',
      budget: '$185,000',
      deadline: '2026-12-15',
      lead: 'David Mugisha',
      priority: 'High',
      completion: 72
    },
    {
      id: 'prj-102',
      name: 'Cross-Border Telecom Billing Bridge',
      client: 'MTN Group Africa',
      clientId: 'cli-2',
      status: 'Testing',
      stage: 'QA & Testing',
      budget: '$240,000',
      deadline: '2026-11-30',
      lead: 'Sarah Uwase',
      priority: 'Urgent',
      completion: 88
    },
    {
      id: 'prj-103',
      name: 'Smart Grid Metering Automation',
      client: 'Rwanda Energy Group',
      clientId: 'cli-3',
      status: 'In Progress',
      stage: 'Development',
      budget: '$130,000',
      deadline: '2027-02-28',
      lead: 'Diane Kalisa',
      priority: 'Medium',
      completion: 45
    },
    {
      id: 'prj-104',
      name: 'Merchant Mobile Checkout SDK',
      client: 'KCB Regional Bank',
      clientId: 'cli-4',
      status: 'Completed',
      stage: 'Live Production',
      budget: '$95,000',
      deadline: '2026-10-20',
      lead: 'Alexandre N.',
      priority: 'High',
      completion: 100
    },
    {
      id: 'prj-105',
      name: 'Agri-Commodity Cold Chain Telemetry',
      client: 'East Africa Harvest Corp',
      clientId: 'cli-5',
      status: 'Planning',
      stage: 'Planning',
      budget: '$110,000',
      deadline: '2027-04-15',
      lead: 'Sarah Uwase',
      priority: 'Low',
      completion: 20
    }
  ],

  clients: [
    {
      id: 'cli-1',
      name: 'Bank of Kigali PLC',
      industry: 'Banking & Financial Services',
      contactPerson: 'Eric Manzi (Chief Risk Officer)',
      email: 'e.manzi@bk.rw',
      phone: '+250 788 123 456',
      status: 'Active',
      contractValue: '$380,000',
      activeProjects: 2,
      location: 'Kigali, Rwanda'
    },
    {
      id: 'cli-2',
      name: 'MTN Group Africa',
      industry: 'Telecommunications',
      contactPerson: 'Amina Bello (Fintech VP)',
      email: 'amina.bello@mtn.com',
      phone: '+27 11 555 9800',
      status: 'Active',
      contractValue: '$520,000',
      activeProjects: 3,
      location: 'Johannesburg / Kigali'
    },
    {
      id: 'cli-3',
      name: 'Rwanda Energy Group (REG)',
      industry: 'Public Infrastructure & Energy',
      contactPerson: 'Jean-Paul Habimana',
      email: 'jp.habimana@reg.gov.rw',
      phone: '+250 788 445 566',
      status: 'Active',
      contractValue: '$210,000',
      activeProjects: 1,
      location: 'Kigali, Rwanda'
    },
    {
      id: 'cli-4',
      name: 'KCB Regional Bank',
      industry: 'Banking',
      contactPerson: 'Grace Wambui (Head of Digital)',
      email: 'gwambui@kcbgroup.com',
      phone: '+254 20 3270000',
      status: 'Active',
      contractValue: '$175,000',
      activeProjects: 1,
      location: 'Nairobi, Kenya'
    },
    {
      id: 'cli-5',
      name: 'East Africa Harvest Corp',
      industry: 'Agritech & Supply Chain',
      contactPerson: 'Patrick Rukundo (COO)',
      email: 'p.rukundo@eaharvest.org',
      phone: '+250 788 901 234',
      status: 'Onboarding',
      contractValue: '$110,000',
      activeProjects: 1,
      location: 'Musanze, Rwanda'
    }
  ],

  employees: [
    {
      id: 'emp-1',
      name: 'Alexandre Ndungutse',
      role: 'Chief Technology Officer',
      department: 'Engineering',
      email: 'alex@domari.com',
      status: 'Active',
      joinDate: '2023-01-15',
      location: 'Kigali HQ',
      type: 'Full-time',
      projectsCount: 4
    },
    {
      id: 'emp-2',
      name: 'Sarah Uwase',
      role: 'VP of Product & Delivery',
      department: 'Product Management',
      email: 'sarah@ikirezi.com',
      status: 'Active',
      joinDate: '2023-05-10',
      location: 'Kigali HQ',
      type: 'Full-time',
      projectsCount: 3
    },
    {
      id: 'emp-3',
      name: 'David Mugisha',
      role: 'Principal Security Architect',
      department: 'Cybersecurity',
      email: 'david@fraudshield.com',
      status: 'Active',
      joinDate: '2023-08-01',
      location: 'Remote / Kigali',
      type: 'Full-time',
      projectsCount: 2
    },
    {
      id: 'emp-4',
      name: 'Diane Kalisa',
      role: 'Lead Full-Stack Engineer',
      department: 'Engineering',
      email: 'diane@domari.com',
      status: 'Active',
      joinDate: '2024-02-18',
      location: 'Kigali HQ',
      type: 'Full-time',
      projectsCount: 3
    },
    {
      id: 'emp-5',
      name: 'Cedric Bizimana',
      role: 'DevOps & Cloud Systems Lead',
      department: 'Infrastructure',
      email: 'cedric@domari.com',
      status: 'Active',
      joinDate: '2024-06-01',
      location: 'Kigali HQ',
      type: 'Full-time',
      projectsCount: 5
    },
    {
      id: 'emp-6',
      name: 'Fiona Gatesi',
      role: 'Senior UI/UX Designer',
      department: 'Design',
      email: 'fiona@ikirezi.com',
      status: 'Active',
      joinDate: '2024-09-12',
      location: 'Remote',
      type: 'Full-time',
      projectsCount: 2
    }
  ],

  // SENSITIVE: "Employee we worked with" (Historical / Contractors / Alumni)
  // Protected behind security restriction
  pastEmployees: [
    {
      id: 'pst-1',
      name: 'Jean-Claude Nsengiyumva',
      formerRole: 'Senior Cryptography Consultant',
      engagementType: 'Contractor (Confidential)',
      period: 'Jan 2024 - Dec 2024 (12 mos)',
      exitReason: 'Contract Completion',
      performanceScore: '9.8 / 10',
      projectsWorkedOn: 'FraudShield v1 Core Algorithm, HSM Key Rotation',
      clearanceLevel: 'Top Secret - Level 3',
      currentContact: 'j.nseng@alum.mit.edu',
      status: 'Eligible for Rehire'
    },
    {
      id: 'pst-2',
      name: 'Nathalie Mukamana',
      formerRole: 'Lead Distributed Systems Architect',
      engagementType: 'Full-time (Founding)',
      period: 'Feb 2023 - Mar 2025 (25 mos)',
      exitReason: 'Relocated to Google Zurich',
      performanceScore: '9.9 / 10',
      projectsWorkedOn: 'Zeus Initial Engine, Domari Payment Switch',
      clearanceLevel: 'Level 4 Archival',
      currentContact: 'mukamana.nathalie@tech-network.ch',
      status: 'Advisory Alumni'
    },
    {
      id: 'pst-3',
      name: 'Kevin Kayitare',
      formerRole: 'Mobile Security Penetration Tester',
      engagementType: 'Security Audit Contractor',
      period: 'Jul 2024 - Nov 2024 (5 mos)',
      exitReason: 'Audit Scope Finished',
      performanceScore: '9.4 / 10',
      projectsWorkedOn: 'MTN Billing App Pentest, KCB SDK Hardening',
      clearanceLevel: 'Confidential Audit',
      currentContact: 'kevin@redteam-security.rw',
      status: 'Retainer Available'
    },
    {
      id: 'pst-4',
      name: 'Aline Umutoni',
      formerRole: 'Junior Frontend Developer (Intern to Contractor)',
      engagementType: 'Contractor',
      period: 'Oct 2024 - Jan 2025 (4 mos)',
      exitReason: 'Pursuing MSc in Data Science',
      performanceScore: '8.9 / 10',
      projectsWorkedOn: 'Ikirezi Dispatch Dashboard UI',
      clearanceLevel: 'Standard Internal',
      currentContact: 'umutoni.aline@edu-mail.org',
      status: 'Alumni Network'
    }
  ],

  // SENSITIVE: "Credentials & Key Vault"
  // Protected behind security restriction
  credentials: [
    {
      id: 'crd-1',
      title: 'Production AWS Root & KMS Keys',
      service: 'Amazon Web Services',
      environment: 'Production',
      username: 'ops-admin@zeus-cloud.internal',
      secret: 'AKIA_PROD_9942_SECRET_KEY_x9A2F8#k!90',
      notes: 'Master KMS key for database encryption. Requires 2FA for AWS console.',
      lastUpdated: '2026-10-15',
      updatedBy: 'David Mugisha'
    },
    {
      id: 'crd-2',
      title: 'Domari Mobile Money Master Webhook Secret',
      service: 'Payment Gateway',
      environment: 'Production',
      username: 'wh_domari_live_master',
      secret: 'whsec_8849b2c3d1e9882fa0b7642199fccb88',
      notes: 'Shared secret for verifying telecom signature headers.',
      lastUpdated: '2026-11-01',
      updatedBy: 'Alexandre N.'
    },
    {
      id: 'crd-3',
      title: 'FraudShield Machine Learning Model API Key',
      service: 'Fraud Engine API',
      environment: 'Production & Staging',
      username: 'fs_core_cluster_api',
      secret: 'fs_live_api_88209849204928049284092840',
      notes: 'Bearer token used by Bank of Kigali & MTN integrations.',
      lastUpdated: '2026-10-28',
      updatedBy: 'David Mugisha'
    },
    {
      id: 'crd-4',
      title: 'Primary Postgres Superuser Database Cluster',
      service: 'PostgreSQL RDS Multi-AZ',
      environment: 'Production',
      username: 'zeus_master_dba',
      secret: 'Db#Z3u$_P0stgr3$_99#Sup3rS3cur3!',
      notes: 'Host: pg-zeus-cluster.internal.domari.rw. Restricted to VPC CIDR.',
      lastUpdated: '2026-09-12',
      updatedBy: 'Cedric Bizimana'
    },
    {
      id: 'crd-5',
      title: 'GitHub Enterprise Zeus Deployment Bot Token',
      service: 'GitHub CI/CD',
      environment: 'All Environments',
      username: 'zeus-ci-bot',
      secret: 'ghp_448829F8aZkL1093JskKkd92kdk00293kslw',
      notes: 'Fine-grained personal access token with repo:write permission.',
      lastUpdated: '2026-11-04',
      updatedBy: 'Diane Kalisa'
    }
  ],

  documents: [
    {
      id: 'doc-1',
      title: 'ISO 27001 Security Governance Audit 2026',
      category: 'Compliance & Security',
      fileType: 'PDF',
      size: '4.8 MB',
      updatedAt: '2026-10-18',
      author: 'David Mugisha',
      accessLevel: 'Confidential',
      isPinned: true
    },
    {
      id: 'doc-2',
      title: 'Bank of Kigali Master Services Agreement (MSA)',
      category: 'Legal & Contracts',
      fileType: 'PDF',
      size: '2.4 MB',
      updatedAt: '2026-09-10',
      author: 'Legal Counsel',
      accessLevel: 'Restricted',
      isPinned: true
    },
    {
      id: 'doc-3',
      title: 'Zeus Distributed Architecture Technical Blueprint',
      category: 'Engineering Architecture',
      fileType: 'DOCX',
      size: '12.1 MB',
      updatedAt: '2026-10-25',
      author: 'Alexandre N.',
      accessLevel: 'Internal',
      isPinned: true
    },
    {
      id: 'doc-4',
      title: 'Q3 Financial Revenue & Payroll Consolidated Audit',
      category: 'Finance',
      fileType: 'XLSX',
      size: '3.1 MB',
      updatedAt: '2026-10-05',
      author: 'Finance Lead',
      accessLevel: 'Management Only',
      isPinned: false
    },
    {
      id: 'doc-5',
      title: 'Employee Code of Conduct & IP Assignment Agreement',
      category: 'Human Resources',
      fileType: 'PDF',
      size: '1.2 MB',
      updatedAt: '2026-08-14',
      author: 'HR Operations',
      accessLevel: 'Company Wide',
      isPinned: false
    }
  ],

  templates: [
    {
      id: 'tpl-1',
      title: 'Enterprise Non-Disclosure Agreement (NDA) - Mutual',
      category: 'Legal',
      format: 'Markdown / Word',
      description: 'Standard 2-way bilateral confidentiality agreement for all partners, contractors, and clients.',
      downloadsCount: 142,
      lastUpdated: '2026-08-20'
    },
    {
      id: 'tpl-2',
      title: 'Client Statement of Work (SOW) & Milestone Delivery',
      category: 'Sales & Delivery',
      format: 'Word / Google Doc',
      description: 'Defines deliverables, milestones, payment schedules, and acceptance criteria.',
      downloadsCount: 98,
      lastUpdated: '2026-09-02'
    },
    {
      id: 'tpl-3',
      title: 'Engineering Technical Specification & RFC Template',
      category: 'Engineering',
      format: 'Markdown',
      description: 'Standard template for architectural RFCs, database schema changes, and API reviews.',
      downloadsCount: 84,
      lastUpdated: '2026-10-12'
    },
    {
      id: 'tpl-4',
      title: 'Internship 12-Week Evaluation & Mentorship Plan',
      category: 'HR & Internship',
      format: 'PDF / Form',
      description: 'Weekly milestone tracking, technical sprint reviews, and final hiring recommendation checklist.',
      downloadsCount: 65,
      lastUpdated: '2026-10-01'
    },
    {
      id: 'tpl-5',
      title: 'Standard Commercial Invoice & Tax Clearance Form',
      category: 'Finance',
      format: 'Excel / Sheets',
      description: 'Compliant commercial billing template with VAT calculations and regional bank wire details.',
      downloadsCount: 110,
      lastUpdated: '2026-07-15'
    }
  ],

  internships: [
    {
      id: 'int-1',
      candidateName: 'Prince Ishimwe',
      email: 'p.ishimwe@rca.ac.rw',
      institution: 'Rwanda Coding Academy',
      track: 'Full-Stack Software Engineering',
      appliedDate: '2026-10-22',
      status: 'Interviewing', // Pending, Reviewing, Interviewing, Accepted, Rejected
      mentor: 'Diane Kalisa',
      assignedProject: 'Domari Mobile SDK',
      evaluationScore: '92%',
      gpa: '3.9 / 4.0'
    },
    {
      id: 'int-2',
      candidateName: 'Gloria Keza',
      email: 'gkeza@alustudent.com',
      institution: 'African Leadership University',
      track: 'Product Design & UX Research',
      appliedDate: '2026-10-29',
      status: 'Accepted',
      mentor: 'Fiona Gatesi',
      assignedProject: 'Zeus Design System 2.0',
      evaluationScore: '95%',
      gpa: '3.85 / 4.0'
    },
    {
      id: 'int-3',
      candidateName: 'Christian Manzi',
      email: 'c.manzi@cmu.edu',
      institution: 'Carnegie Mellon University Africa',
      track: 'Cybersecurity & AI Fraud Detection',
      appliedDate: '2026-11-01',
      status: 'Reviewing',
      mentor: 'David Mugisha',
      assignedProject: 'FraudShield Transaction Heuristics',
      evaluationScore: '89%',
      gpa: '3.95 / 4.0'
    },
    {
      id: 'int-4',
      candidateName: 'Divine Uwera',
      email: 'uwera.d@ur.ac.rw',
      institution: 'University of Rwanda (CST)',
      track: 'Cloud Infrastructure & DevOps',
      appliedDate: '2026-11-03',
      status: 'Pending',
      mentor: 'Cedric Bizimana',
      assignedProject: 'Multi-Region Kubernetes Telemetry',
      evaluationScore: 'Pending',
      gpa: '3.7 / 4.0'
    },
    {
      id: 'int-5',
      candidateName: 'Samuel Habineza',
      email: 's.habineza@aims.ac.rw',
      institution: 'AIMS Rwanda',
      track: 'Data Science & Quantitative Analytics',
      appliedDate: '2026-10-14',
      status: 'Accepted',
      mentor: 'Sarah Uwase',
      assignedProject: 'Ikirezi Route Optimization Algorithms',
      evaluationScore: '94%',
      gpa: '4.0 / 4.0'
    }
  ]
};

// Data Store Object
const Store = {
  init() {
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      this.resetToDefaults();
    }
  },

  resetToDefaults() {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_DATA.users));
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_DATA.products));
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(INITIAL_DATA.projects));
    localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(INITIAL_DATA.clients));
    localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(INITIAL_DATA.employees));
    localStorage.setItem(STORAGE_KEYS.PAST_EMPLOYEES, JSON.stringify(INITIAL_DATA.pastEmployees));
    localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(INITIAL_DATA.documents));
    localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(INITIAL_DATA.templates));
    localStorage.setItem(STORAGE_KEYS.INTERNSHIPS, JSON.stringify(INITIAL_DATA.internships));
    localStorage.setItem(STORAGE_KEYS.CREDENTIALS, JSON.stringify(INITIAL_DATA.credentials));
    localStorage.setItem(STORAGE_KEYS.ALLOWED_DOMAINS, JSON.stringify(DEFAULT_ALLOWED_DOMAINS));
  },

  get(key) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error(`Error reading ${key}:`, e);
      return [];
    }
  },

  set(key, val) {
    try {
      localStorage.setItem(key, JSON.stringify(val));
    } catch (e) {
      console.error(`Error writing ${key}:`, e);
    }
  },

  // Collections accessors
  getUsers() { return this.get(STORAGE_KEYS.USERS); },
  setUsers(data) { this.set(STORAGE_KEYS.USERS, data); },

  getProducts() { return this.get(STORAGE_KEYS.PRODUCTS); },
  setProducts(data) { this.set(STORAGE_KEYS.PRODUCTS, data); },

  getProjects() { return this.get(STORAGE_KEYS.PROJECTS); },
  setProjects(data) { this.set(STORAGE_KEYS.PROJECTS, data); },

  getClients() { return this.get(STORAGE_KEYS.CLIENTS); },
  setClients(data) { this.set(STORAGE_KEYS.CLIENTS, data); },

  getEmployees() { return this.get(STORAGE_KEYS.EMPLOYEES); },
  setEmployees(data) { this.set(STORAGE_KEYS.EMPLOYEES, data); },

  getPastEmployees() { return this.get(STORAGE_KEYS.PAST_EMPLOYEES); },
  setPastEmployees(data) { this.set(STORAGE_KEYS.PAST_EMPLOYEES, data); },

  getDocuments() { return this.get(STORAGE_KEYS.DOCUMENTS); },
  setDocuments(data) { this.set(STORAGE_KEYS.DOCUMENTS, data); },

  getTemplates() { return this.get(STORAGE_KEYS.TEMPLATES); },
  setTemplates(data) { this.set(STORAGE_KEYS.TEMPLATES, data); },

  getInternships() { return this.get(STORAGE_KEYS.INTERNSHIPS); },
  setInternships(data) { this.set(STORAGE_KEYS.INTERNSHIPS, data); },

  getCredentials() { return this.get(STORAGE_KEYS.CREDENTIALS); },
  setCredentials(data) { this.set(STORAGE_KEYS.CREDENTIALS, data); },

  getAllowedDomains() {
    const domains = this.get(STORAGE_KEYS.ALLOWED_DOMAINS);
    return (domains && domains.length > 0) ? domains : DEFAULT_ALLOWED_DOMAINS;
  },

  addAllowedDomain(domain) {
    const clean = domain.trim().toLowerCase().replace(/^@/, '');
    const current = this.getAllowedDomains();
    if (!current.includes(clean)) {
      current.push(clean);
      this.set(STORAGE_KEYS.ALLOWED_DOMAINS, current);
    }
  },

  // Generic Helpers
  addItem(collectionKey, item) {
    const list = this.get(collectionKey);
    item.id = item.id || `item-${Date.now()}`;
    list.unshift(item);
    this.set(collectionKey, list);
    return item;
  },

  updateItem(collectionKey, id, updatedFields) {
    const list = this.get(collectionKey);
    const index = list.findIndex(i => i.id === id);
    if (index !== -1) {
      list[index] = { ...list[index], ...updatedFields };
      this.set(collectionKey, list);
      return list[index];
    }
    return null;
  },

  deleteItem(collectionKey, id) {
    const list = this.get(collectionKey);
    const filtered = list.filter(i => i.id !== id);
    this.set(collectionKey, filtered);
    return filtered;
  }
};

// Initialize store immediately
Store.init();

