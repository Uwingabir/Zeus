/**
 * ZEUS Data Store & State Management
 * Supports both Cloud Supabase Database and Local Encrypted Storage.
 * Consolidates team members and historical personnel into unified Employees register.
 */

const STORAGE_KEYS = {
  CURRENT_USER: 'zeus_current_user',
  AUTH_TOKEN: 'zeus_auth_token',
  PROJECTS: 'zeus_projects',
  PRODUCTS: 'zeus_products',
  CLIENTS: 'zeus_clients',
  EMPLOYEES: 'zeus_employees',
  DOCUMENTS: 'zeus_documents',
  TEMPLATES: 'zeus_templates',
  INTERNSHIPS: 'zeus_internships',
  CREDENTIALS: 'zeus_credentials',
  USERS: 'zeus_users',
  SECURITY_VERIFIED: 'zeus_sec_verified',
  ALLOWED_DOMAINS: 'zeus_allowed_domains'
};

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

// Unified Initial Seed Data
const INITIAL_DATA = {
  users: [
    {
      id: 'usr-1',
      name: 'Alexandre Ndungutse',
      email: 'alex@domari.com',
      passwordHash: 'sha256_mock_hash',
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
      passwordHash: 'sha256_mock_hash',
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
      passwordHash: 'sha256_mock_hash',
      role: 'Security Engineer',
      domain: 'fraudshield.com',
      department: 'Cybersecurity',
      status: 'Active',
      lastLogin: 'Yesterday',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80'
    }
  ],

  // CONSOLIDATED EMPLOYEES REGISTER:
  // Includes active employees, former colleagues, and contractors worked with,
  // tracking status and time worked together!
  employees: [
    {
      id: 'emp-1',
      name: 'Alexandre Ndungutse',
      role: 'Chief Technology Officer',
      department: 'Engineering',
      email: 'alex@domari.com',
      status: 'Active',
      timeWorkedTogether: 'Jan 2023 - Present (3+ years)',
      joinDate: '2023-01-15',
      location: 'Kigali HQ',
      type: 'Full-time',
      projectsCount: 4,
      performanceScore: '9.9 / 10',
      notes: 'Core system architect for Zeus engine and Domari switch.'
    },
    {
      id: 'emp-2',
      name: 'Sarah Uwase',
      role: 'VP of Product & Delivery',
      department: 'Product Management',
      email: 'sarah@ikirezi.com',
      status: 'Active',
      timeWorkedTogether: 'May 2023 - Present (3 years)',
      joinDate: '2023-05-10',
      location: 'Kigali HQ',
      type: 'Full-time',
      projectsCount: 3,
      performanceScore: '9.7 / 10',
      notes: 'Oversees product roadmaps for Ikirezi Logistics and client delivery.'
    },
    {
      id: 'emp-3',
      name: 'David Mugisha',
      role: 'Principal Security Architect',
      department: 'Cybersecurity',
      email: 'david@fraudshield.com',
      status: 'Active',
      timeWorkedTogether: 'Aug 2023 - Present (2.5 years)',
      joinDate: '2023-08-01',
      location: 'Remote / Kigali',
      type: 'Full-time',
      projectsCount: 2,
      performanceScore: '9.8 / 10',
      notes: 'Lead security governance, HSM key rotation, and penetration audits.'
    },
    {
      id: 'emp-4',
      name: 'Diane Kalisa',
      role: 'Lead Full-Stack Engineer',
      department: 'Engineering',
      email: 'diane@domari.com',
      status: 'Active',
      timeWorkedTogether: 'Feb 2024 - Present (2 years)',
      joinDate: '2024-02-18',
      location: 'Kigali HQ',
      type: 'Full-time',
      projectsCount: 3,
      performanceScore: '9.5 / 10',
      notes: 'Mentors software interns and leads telecom integration sprint teams.'
    },
    {
      id: 'emp-5',
      name: 'Jean-Claude Nsengiyumva',
      role: 'Senior Cryptography Consultant',
      department: 'Cybersecurity',
      email: 'j.nseng@alum.mit.edu',
      status: 'Contractor (Completed)',
      timeWorkedTogether: 'Jan 2024 - Dec 2024 (12 mos)',
      joinDate: '2024-01-05',
      location: 'Contractor (External)',
      type: 'Contractor',
      projectsCount: 2,
      performanceScore: '9.8 / 10',
      notes: 'Worked on FraudShield v1 core fraud algorithm and HSM key rotation.'
    },
    {
      id: 'emp-6',
      name: 'Nathalie Mukamana',
      role: 'Lead Distributed Systems Architect',
      department: 'Engineering',
      email: 'mukamana.nathalie@tech-network.ch',
      status: 'Former / Alumni',
      timeWorkedTogether: 'Feb 2023 - Mar 2025 (25 mos)',
      joinDate: '2023-02-01',
      location: 'Alumni Network',
      type: 'Full-time (Founding)',
      projectsCount: 4,
      performanceScore: '9.9 / 10',
      notes: 'Key founder of Zeus initial distributed architecture; relocated to Zurich.'
    },
    {
      id: 'emp-7',
      name: 'Kevin Kayitare',
      role: 'Mobile Security Penetration Tester',
      department: 'Cybersecurity',
      email: 'kevin@redteam-security.rw',
      status: 'Contractor (Completed)',
      timeWorkedTogether: 'Jul 2024 - Nov 2024 (5 mos)',
      joinDate: '2024-07-10',
      location: 'Contractor (Audit)',
      type: 'Contractor',
      projectsCount: 2,
      performanceScore: '9.4 / 10',
      notes: 'Completed security penetration testing on MTN app bridge and KCB SDK.'
    },
    {
      id: 'emp-8',
      name: 'Aline Umutoni',
      role: 'Junior Frontend Developer',
      department: 'Design & Frontend',
      email: 'umutoni.aline@edu-mail.org',
      status: 'Former / Alumni',
      timeWorkedTogether: 'Oct 2024 - Jan 2025 (4 mos)',
      joinDate: '2024-10-01',
      location: 'Alumni Network',
      type: 'Intern to Contractor',
      projectsCount: 1,
      performanceScore: '8.9 / 10',
      notes: 'Built Ikirezi Dispatch UI; now pursuing Master of Science in Data Science.'
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
    }
  ],

  products: [
    {
      id: 'prod-1',
      name: 'Zeus Operations Engine',
      stage: 'Live Production',
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
      progress: 35,
      lead: 'Diane Kalisa',
      category: 'Fintech',
      version: 'v0.9.0',
      description: 'Multi-currency settlement switch supporting regional mobile money and card networks.'
    }
  ],

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
      status: 'Interviewing',
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
    }
  ]
};

// Data Store Object with Supabase Synchronization
const Store = {
  init() {
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      this.resetToDefaults();
    }
    // Attempt asynchronous background sync from Supabase if connected
    this.syncFromSupabase();
  },

  async syncFromSupabase() {
    if (!SupabaseDB.isConfigured()) return;

    try {
      const [projects, clients, employees, documents, templates, internships, credentials] = await Promise.all([
        SupabaseDB.fetchAll('projects'),
        SupabaseDB.fetchAll('clients'),
        SupabaseDB.fetchAll('employees'),
        SupabaseDB.fetchAll('documents'),
        SupabaseDB.fetchAll('templates'),
        SupabaseDB.fetchAll('internships'),
        SupabaseDB.fetchAll('credentials')
      ]);

      if (projects && projects.length) this.setProjects(projects);
      if (clients && clients.length) this.setClients(clients);
      if (employees && employees.length) this.setEmployees(employees);
      if (documents && documents.length) this.setDocuments(documents);
      if (templates && templates.length) this.setTemplates(templates);
      if (internships && internships.length) this.setInternships(internships);
      if (credentials && credentials.length) this.setCredentials(credentials);

      console.info('Zeus synchronized with Supabase database successfully.');
    } catch (e) {
      console.warn('Supabase sync skipped, using secured cache:', e);
    }
  },

  resetToDefaults() {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_DATA.users));
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_DATA.products));
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(INITIAL_DATA.projects));
    localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(INITIAL_DATA.clients));
    localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(INITIAL_DATA.employees));
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
      return [];
    }
  },

  set(key, val) {
    try {
      localStorage.setItem(key, JSON.stringify(val));
    } catch (e) {}
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
      if (SupabaseDB.isConfigured()) {
        SupabaseDB.insert('company_domains', { domain: clean, company_name: clean.split('.')[0] });
      }
    }
  },

  // Async & Local CRUD operations
  async addItem(collectionKey, item) {
    const list = this.get(collectionKey);
    item.id = item.id || `item-${Date.now()}`;
    item.created_at = new Date().toISOString();
    list.unshift(item);
    this.set(collectionKey, list);

    // Sync to Supabase
    const tableMap = {
      [STORAGE_KEYS.PROJECTS]: 'projects',
      [STORAGE_KEYS.CLIENTS]: 'clients',
      [STORAGE_KEYS.EMPLOYEES]: 'employees',
      [STORAGE_KEYS.DOCUMENTS]: 'documents',
      [STORAGE_KEYS.TEMPLATES]: 'templates',
      [STORAGE_KEYS.INTERNSHIPS]: 'internships',
      [STORAGE_KEYS.CREDENTIALS]: 'credentials',
      [STORAGE_KEYS.USERS]: 'users'
    };

    const tableName = tableMap[collectionKey];
    if (tableName && SupabaseDB.isConfigured()) {
      SupabaseDB.insert(tableName, item);
    }

    return item;
  },

  async updateItem(collectionKey, id, updatedFields) {
    const list = this.get(collectionKey);
    const index = list.findIndex(i => i.id === id);
    if (index !== -1) {
      list[index] = { ...list[index], ...updatedFields };
      this.set(collectionKey, list);

      const tableMap = {
        [STORAGE_KEYS.PROJECTS]: 'projects',
        [STORAGE_KEYS.CLIENTS]: 'clients',
        [STORAGE_KEYS.EMPLOYEES]: 'employees',
        [STORAGE_KEYS.DOCUMENTS]: 'documents',
        [STORAGE_KEYS.TEMPLATES]: 'templates',
        [STORAGE_KEYS.INTERNSHIPS]: 'internships',
        [STORAGE_KEYS.CREDENTIALS]: 'credentials',
        [STORAGE_KEYS.USERS]: 'users'
      };
      const tableName = tableMap[collectionKey];
      if (tableName && SupabaseDB.isConfigured()) {
        SupabaseDB.update(tableName, id, updatedFields);
      }

      return list[index];
    }
    return null;
  },

  async deleteItem(collectionKey, id) {
    const list = this.get(collectionKey);
    const filtered = list.filter(i => i.id !== id);
    this.set(collectionKey, filtered);

    const tableMap = {
      [STORAGE_KEYS.PROJECTS]: 'projects',
      [STORAGE_KEYS.CLIENTS]: 'clients',
      [STORAGE_KEYS.EMPLOYEES]: 'employees',
      [STORAGE_KEYS.DOCUMENTS]: 'documents',
      [STORAGE_KEYS.TEMPLATES]: 'templates',
      [STORAGE_KEYS.INTERNSHIPS]: 'internships',
      [STORAGE_KEYS.CREDENTIALS]: 'credentials',
      [STORAGE_KEYS.USERS]: 'users'
    };
    const tableName = tableMap[collectionKey];
    if (tableName && SupabaseDB.isConfigured()) {
      SupabaseDB.delete(tableName, id);
    }

    return filtered;
  }
};

// Initialize store immediately
Store.init();
