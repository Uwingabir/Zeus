-- ==============================================================================
-- ZEUS ENTERPRISE OPERATIONS PLATFORM - SUPABASE DATABASE SCHEMA
-- ==============================================================================
-- Run this script in your Supabase project SQL Editor (https://supabase.com/dashboard)
-- It creates all required tables, security policies, indexes, and triggers.
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. COMPANY DOMAINS WHITELIST
CREATE TABLE IF NOT EXISTS public.company_domains (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    domain VARCHAR(100) UNIQUE NOT NULL,
    company_name VARCHAR(150) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seed initial authorized domains
INSERT INTO public.company_domains (domain, company_name)
VALUES 
    ('domari.com', 'Domari Technologies'),
    ('ikirezi.com', 'Ikirezi Ventures'),
    ('fraudshield.com', 'FraudShield AI')
ON CONFLICT (domain) DO NOTHING;

-- 3. USERS TABLE
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role VARCHAR(50) DEFAULT 'Team Member',
    domain VARCHAR(100) NOT NULL,
    department VARCHAR(100) DEFAULT 'Operations',
    status VARCHAR(50) DEFAULT 'Active',
    avatar TEXT,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. PROJECTS TABLE
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    client VARCHAR(255) NOT NULL,
    stage VARCHAR(50) NOT NULL DEFAULT 'Development',
    status VARCHAR(50) NOT NULL DEFAULT 'In Progress',
    budget VARCHAR(100),
    deadline DATE,
    lead VARCHAR(150),
    priority VARCHAR(50) DEFAULT 'High',
    completion INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. CLIENTS TABLE
CREATE TABLE IF NOT EXISTS public.clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    industry VARCHAR(150),
    contact_person VARCHAR(150),
    email VARCHAR(150),
    phone VARCHAR(50),
    status VARCHAR(50) DEFAULT 'Active',
    contract_value VARCHAR(100),
    active_projects INTEGER DEFAULT 1,
    location VARCHAR(150),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. EMPLOYEES & WORKED WITH TABLE (Consolidated)
CREATE TABLE IF NOT EXISTS public.employees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(150) NOT NULL,
    role VARCHAR(150) NOT NULL,
    department VARCHAR(100) NOT NULL,
    email VARCHAR(150),
    status VARCHAR(50) NOT NULL DEFAULT 'Active', -- 'Active', 'Former / Alumni', 'Contractor (Completed)'
    time_worked_together VARCHAR(100) NOT NULL,    -- e.g. 'Jan 2023 - Present' or 'Jan 2024 - Dec 2024 (12 mos)'
    join_date DATE DEFAULT CURRENT_DATE,
    location VARCHAR(150) DEFAULT 'Kigali HQ',
    type VARCHAR(50) DEFAULT 'Full-time',
    projects_count INTEGER DEFAULT 1,
    performance_score VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. IMPORTANT DOCUMENTS TABLE
CREATE TABLE IF NOT EXISTS public.documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    size VARCHAR(50),
    access_level VARCHAR(50) DEFAULT 'Internal',
    author VARCHAR(150),
    is_pinned BOOLEAN DEFAULT FALSE,
    updated_at DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. ENTERPRISE TEMPLATES TABLE
CREATE TABLE IF NOT EXISTS public.templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    format VARCHAR(50) NOT NULL,
    description TEXT,
    downloads_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. INTERNSHIP & TALENT PIPELINE TABLE
CREATE TABLE IF NOT EXISTS public.internships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    candidate_name VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL,
    institution VARCHAR(200),
    track VARCHAR(150),
    status VARCHAR(50) DEFAULT 'Reviewing', -- 'Pending', 'Reviewing', 'Interviewing', 'Accepted', 'Rejected'
    applied_date DATE DEFAULT CURRENT_DATE,
    mentor VARCHAR(150),
    assigned_project VARCHAR(200),
    evaluation_score VARCHAR(50) DEFAULT 'Pending',
    gpa VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. CREDENTIALS VAULT (ENCRYPTED SECRETS)
CREATE TABLE IF NOT EXISTS public.credentials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    service VARCHAR(150) NOT NULL,
    environment VARCHAR(50) DEFAULT 'Production',
    username VARCHAR(150),
    encrypted_secret TEXT NOT NULL, -- AES-GCM Encrypted
    notes TEXT,
    last_updated DATE DEFAULT CURRENT_DATE,
    updated_by VARCHAR(150),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. SECURITY AUDIT LOGS
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type VARCHAR(100) NOT NULL, -- 'LOGIN_SUCCESS', 'LOGIN_FAILED', 'VAULT_UNLOCKED', 'RECORD_CREATED', etc.
    user_email VARCHAR(150),
    ip_address VARCHAR(50),
    details TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.company_domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.internships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Allow anon read/write with service key or project access policies
CREATE POLICY "Public Read/Write for Zeus client" ON public.company_domains FOR ALL USING (true);
CREATE POLICY "Public Read/Write for Zeus client" ON public.users FOR ALL USING (true);
CREATE POLICY "Public Read/Write for Zeus client" ON public.projects FOR ALL USING (true);
CREATE POLICY "Public Read/Write for Zeus client" ON public.clients FOR ALL USING (true);
CREATE POLICY "Public Read/Write for Zeus client" ON public.employees FOR ALL USING (true);
CREATE POLICY "Public Read/Write for Zeus client" ON public.documents FOR ALL USING (true);
CREATE POLICY "Public Read/Write for Zeus client" ON public.templates FOR ALL USING (true);
CREATE POLICY "Public Read/Write for Zeus client" ON public.internships FOR ALL USING (true);
CREATE POLICY "Public Read/Write for Zeus client" ON public.credentials FOR ALL USING (true);
CREATE POLICY "Public Read/Write for Zeus client" ON public.audit_logs FOR ALL USING (true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_projects_stage ON public.projects(stage);
CREATE INDEX IF NOT EXISTS idx_employees_status ON public.employees(status);

