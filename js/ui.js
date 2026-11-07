/**
 * ZEUS User Interface Module
 * High-performance UI renderers, tables, interactive analytics charts, and modals.
 */

const UI = {
  activeView: 'dashboard',
  searchQueries: {},
  filterStates: {
    projectsStage: 'All',
    clientsStatus: 'All',
    internshipsStatus: 'All'
  },
  dashboardChartInstance: null,

  // Keypad Helper Functions for Security PIN Pad
  keypadPress(digit) {
    const input = document.getElementById('security-pin-input');
    if (input && input.value.length < 8) {
      input.value += digit;
    }
  },

  keypadClear() {
    const input = document.getElementById('security-pin-input');
    if (input) {
      input.value = '';
    }
  },

  // Toast Notification System
  showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const colors = {
      success: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
      error: 'bg-rose-500/10 border-rose-500/30 text-rose-400',
      warning: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
      info: 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400'
    };

    const icons = {
      success: '<i data-lucide="check-circle" class="w-5 h-5 text-emerald-400 shrink-0"></i>',
      error: '<i data-lucide="alert-circle" class="w-5 h-5 text-rose-400 shrink-0"></i>',
      warning: '<i data-lucide="alert-triangle" class="w-5 h-5 text-amber-400 shrink-0"></i>',
      info: '<i data-lucide="info" class="w-5 h-5 text-indigo-400 shrink-0"></i>'
    };

    const toast = document.createElement('div');
    toast.className = `flex items-center gap-3 px-4 py-3 rounded-2xl border shadow-xl backdrop-blur-md text-sm toast-enter pointer-events-auto max-w-md ${colors[type] || colors.info}`;
    toast.innerHTML = `
      ${icons[type] || icons.info}
      <span class="font-medium text-slate-200">${message}</span>
      <button class="ml-auto text-slate-400 hover:text-white" onclick="this.parentElement.remove()">
        <i data-lucide="x" class="w-4 h-4"></i>
      </button>
    `;

    container.appendChild(toast);
    lucide.createIcons({ root: toast });

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(-10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  },

  // Security Challenge Modal
  openSecurityModal(targetView, onSuccess) {
    const modal = document.getElementById('security-modal');
    if (!modal) return;

    const pinInput = document.getElementById('security-pin-input');
    const errorText = document.getElementById('security-modal-error');
    const targetLabel = document.getElementById('security-target-label');

    if (pinInput) pinInput.value = '';
    if (errorText) errorText.classList.add('hidden');
    if (targetLabel) {
      targetLabel.textContent = targetView === 'past-employees' 
        ? 'Restricted Access: Historical Personnel & Contractor Archive' 
        : 'Restricted Access: Enterprise Secret & Credentials Vault';
    }

    modal.classList.remove('hidden');
    modal.classList.add('flex');
    if (pinInput) pinInput.focus();

    window._securitySuccessCallback = () => {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
      if (onSuccess) onSuccess();
    };
  },

  closeSecurityModal() {
    const modal = document.getElementById('security-modal');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  },

  submitSecurityPin() {
    const pinInput = document.getElementById('security-pin-input');
    const errorText = document.getElementById('security-modal-error');
    const pin = pinInput ? pinInput.value : '';

    const res = Security.unlock(pin);
    if (res.success) {
      this.showToast('Security clearance verified. Access granted.', 'success');
      if (window._securitySuccessCallback) {
        window._securitySuccessCallback();
      }
      this.renderHeaderSecurityIndicator();
    } else {
      if (errorText) {
        errorText.textContent = res.message;
        errorText.classList.remove('hidden');
      }
      if (pinInput) {
        pinInput.classList.add('border-rose-500', 'shake');
        setTimeout(() => pinInput.classList.remove('border-rose-500', 'shake'), 800);
      }
    }
  },

  // Header Security Indicator
  renderHeaderSecurityIndicator() {
    const badge = document.getElementById('header-security-badge');
    if (!badge) return;

    const unlocked = Security.isUnlocked();
    if (unlocked) {
      badge.innerHTML = `
        <button onclick="Security.lock(); UI.render();" class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all shadow-sm" title="Click to Lock Vault">
          <span class="status-dot status-dot-emerald"></span>
          <span>Vault Cleared</span>
          <i data-lucide="lock" class="w-3.5 h-3.5 ml-1 opacity-70"></i>
        </button>
      `;
    } else {
      badge.innerHTML = `
        <button onclick="Security.challenge('credentials', () => UI.render());" class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 transition-all shadow-sm" title="Security restricted: click to unlock">
          <i data-lucide="shield-alert" class="w-3.5 h-3.5"></i>
          <span>Vault Locked</span>
        </button>
      `;
    }
    lucide.createIcons({ root: badge });
  },

  // Switch Active View
  navigate(viewName) {
    if (viewName === 'past-employees' || viewName === 'credentials') {
      if (!Security.isUnlocked()) {
        Security.challenge(viewName, () => {
          this.activeView = viewName;
          this.render();
        });
        return;
      }
    }

    this.activeView = viewName;
    window.location.hash = viewName;
    this.render();
  },

  // Main Render Controller
  render() {
    const user = Auth.getCurrentUser();
    const loginView = document.getElementById('login-view');
    const appView = document.getElementById('app-view');

    if (!user) {
      if (loginView) loginView.classList.remove('hidden');
      if (appView) appView.classList.add('hidden');
      this.renderLoginForm();
      return;
    }

    if (loginView) loginView.classList.add('hidden');
    if (appView) appView.classList.remove('hidden');

    this.renderSidebar(user);
    this.renderHeader(user);
    this.renderHeaderSecurityIndicator();
    this.renderContent();
    lucide.createIcons();

    if (this.activeView === 'dashboard') {
      this.initDashboardCharts();
    }
  },

  // 1. LOGIN FORM RENDERER
  renderLoginForm() {
    const allowed = Store.getAllowedDomains();
    const domainsText = allowed.filter(d => !d.includes('.')).map(d => '@' + d).join(', ');
    const hintEl = document.getElementById('allowed-domains-hint');
    if (hintEl) {
      hintEl.textContent = `Authorized: ${domainsText}`;
    }
  },

  // 2. SIDEBAR RENDERER
  renderSidebar(user) {
    const navItems = [
      { id: 'dashboard', label: 'Dashboard', icon: 'layout-dashboard' },
      { id: 'projects', label: 'Projects', icon: 'folder-kanban', count: Store.getProjects().length },
      { id: 'clients', label: 'Clients', icon: 'building-2', count: Store.getClients().length },
      { id: 'employees', label: 'Employees', icon: 'users', count: Store.getEmployees().length },
      { id: 'documents', label: 'Important Documents', icon: 'file-text', count: Store.getDocuments().length },
      { id: 'templates', label: 'Templates', icon: 'file-code', count: Store.getTemplates().length },
      { id: 'internships', label: 'Internship', icon: 'graduation-cap', count: Store.getInternships().length },
      { id: 'users', label: 'Users', icon: 'user-check', count: Store.getUsers().length }
    ];

    const restrictedNavItems = [
      { 
        id: 'past-employees', 
        label: 'Employees Worked With', 
        icon: 'user-minus', 
        isRestricted: true,
        count: Store.getPastEmployees().length 
      },
      { 
        id: 'credentials', 
        label: 'Credentials Vault', 
        icon: 'key-round', 
        isRestricted: true,
        count: Store.getCredentials().length 
      }
    ];

    const navContainer = document.getElementById('sidebar-nav');
    if (!navContainer) return;

    let html = `
      <div class="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
        Core Operations
      </div>
    `;

    navItems.forEach(item => {
      const active = this.activeView === item.id;
      html += `
        <button 
          onclick="UI.navigate('${item.id}')"
          class="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
            active 
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25 ring-1 ring-white/10' 
              : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
          }">
          <div class="flex items-center gap-3">
            <i data-lucide="${item.icon}" class="w-4 h-4"></i>
            <span>${item.label}</span>
          </div>
          ${item.count !== undefined ? `
            <span class="text-xs px-2 py-0.5 rounded-full ${
              active ? 'bg-indigo-500/50 text-white' : 'bg-slate-800 text-slate-400'
            }">${item.count}</span>
          ` : ''}
        </button>
      `;
    });

    html += `
      <div class="px-3 mt-6 mb-2 flex items-center justify-between">
        <span class="text-[10px] font-bold uppercase tracking-wider text-slate-500">Security Restricted</span>
        <i data-lucide="shield" class="w-3.5 h-3.5 text-amber-500"></i>
      </div>
    `;

    const isUnlocked = Security.isUnlocked();

    restrictedNavItems.forEach(item => {
      const active = this.activeView === item.id;
      html += `
        <button 
          onclick="UI.navigate('${item.id}')"
          class="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
            active 
              ? 'bg-amber-600/90 text-white shadow-lg shadow-amber-600/20' 
              : 'text-slate-400 hover:text-amber-200 hover:bg-amber-500/10'
          }">
          <div class="flex items-center gap-3">
            <i data-lucide="${item.icon}" class="w-4 h-4 ${active ? 'text-white' : 'text-amber-400'}"></i>
            <span>${item.label}</span>
          </div>
          <div class="flex items-center gap-1.5">
            <i data-lucide="${isUnlocked ? 'unlock' : 'lock'}" class="w-3.5 h-3.5 ${
              isUnlocked ? 'text-emerald-400' : 'text-amber-400 opacity-60 group-hover:opacity-100'
            }"></i>
            <span class="text-xs px-1.5 py-0.5 rounded-md ${
              active ? 'bg-amber-700 text-white' : 'bg-slate-800 text-slate-400'
            }">${item.count}</span>
          </div>
        </button>
      `;
    });

    navContainer.innerHTML = html;
  },

  // 3. HEADER RENDERER
  renderHeader(user) {
    const brand = Auth.getCompanyBrand(user.email);
    const brandBadge = document.getElementById('user-company-badge');
    const userNameEl = document.getElementById('header-user-name');
    const userRoleEl = document.getElementById('header-user-role');
    const userAvatarEl = document.getElementById('header-user-avatar');

    if (brandBadge) {
      brandBadge.textContent = brand.badge;
      brandBadge.className = `text-[10px] font-bold px-2 py-0.5 rounded-md bg-${brand.color}-500/20 text-${brand.color}-400 border border-${brand.color}-500/30`;
    }
    if (userNameEl) userNameEl.textContent = user.name;
    if (userRoleEl) userRoleEl.textContent = `${user.role} • ${user.email}`;
    if (userAvatarEl) userAvatarEl.src = user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name)}`;

    const pageTitle = document.getElementById('page-title');
    const pageDesc = document.getElementById('page-description');

    const titles = {
      dashboard: { title: 'Executive Overview', desc: 'Real-time corporate telemetry, active stages, and protected modules.' },
      projects: { title: 'Projects Portfolio', desc: 'Manage strategic deliveries, milestones, budgets, and pipeline stages.' },
      clients: { title: 'Enterprise Clients', desc: 'Client directory, active service contracts, and institutional contacts.' },
      employees: { title: 'Team Directory', desc: 'Active engineering, design, and operations personnel across corporate entities.' },
      'past-employees': { title: 'Employees We Worked With', desc: 'Confidential historical archive of consultants, contractors, and alumni.' },
      documents: { title: 'Important Documents', desc: 'Critical governance, ISO security standards, legal MSAs, and blueprints.' },
      templates: { title: 'Enterprise Templates', desc: 'Standard operating agreements, engineering RFCs, NDAs, and delivery templates.' },
      internships: { title: 'Internship Pipeline', desc: 'Candidate vetting, university partnerships, mentorship, and assignments.' },
      credentials: { title: 'Credentials & Key Vault', desc: 'Protected vault for master database credentials, KMS secrets, and webhook tokens.' },
      users: { title: 'User Management', desc: 'Identity governance, access credentials, and authorized corporate domains.' }
    };

    const current = titles[this.activeView] || titles.dashboard;
    if (pageTitle) pageTitle.textContent = current.title;
    if (pageDesc) pageDesc.textContent = current.desc;
  },

  // 4. MAIN CONTENT ROUTER
  renderContent() {
    const container = document.getElementById('main-content-area');
    if (!container) return;

    switch (this.activeView) {
      case 'dashboard':
        container.innerHTML = this.renderDashboardView();
        break;
      case 'projects':
        container.innerHTML = this.renderProjectsView();
        break;
      case 'clients':
        container.innerHTML = this.renderClientsView();
        break;
      case 'employees':
        container.innerHTML = this.renderEmployeesView();
        break;
      case 'past-employees':
        container.innerHTML = this.renderPastEmployeesView();
        break;
      case 'documents':
        container.innerHTML = this.renderDocumentsView();
        break;
      case 'templates':
        container.innerHTML = this.renderTemplatesView();
        break;
      case 'internships':
        container.innerHTML = this.renderInternshipsView();
        break;
      case 'credentials':
        container.innerHTML = this.renderCredentialsView();
        break;
      case 'users':
        container.innerHTML = this.renderUsersView();
        break;
      default:
        container.innerHTML = this.renderDashboardView();
    }

    lucide.createIcons({ root: container });
  },

  // ==========================================
  // DASHBOARD VIEW (All 7 required sections + Charts)
  // ==========================================
  renderDashboardView() {
    const projects = Store.getProjects();
    const clients = Store.getClients();
    const employees = Store.getEmployees();
    const pastEmployees = Store.getPastEmployees();
    const documents = Store.getDocuments();
    const internships = Store.getInternships();
    const products = Store.getProducts();
    const credentials = Store.getCredentials();
    const isUnlocked = Security.isUnlocked();

    return `
      <div class="space-y-8 animate-fade-in pb-12">
        <!-- 1. STATS ROW -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div class="p-5 rounded-3xl card-premium">
            <div class="flex items-center justify-between mb-3">
              <span class="text-xs font-semibold uppercase tracking-wider text-slate-400">Active Projects</span>
              <div class="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-400">
                <i data-lucide="folder-kanban" class="w-5 h-5"></i>
              </div>
            </div>
            <div class="flex items-baseline gap-2">
              <span class="text-3xl font-extrabold text-white">${projects.length}</span>
              <span class="text-xs font-semibold text-emerald-400 flex items-center bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                <i data-lucide="trending-up" class="w-3.5 h-3.5 mr-0.5"></i> +18% MoM
              </span>
            </div>
            <p class="text-xs text-slate-400 mt-2.5">Across Domari, Ikirezi & FraudShield</p>
          </div>

          <div class="p-5 rounded-3xl card-premium">
            <div class="flex items-center justify-between mb-3">
              <span class="text-xs font-semibold uppercase tracking-wider text-slate-400">Enterprise Clients</span>
              <div class="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-400">
                <i data-lucide="building-2" class="w-5 h-5"></i>
              </div>
            </div>
            <div class="flex items-baseline gap-2">
              <span class="text-3xl font-extrabold text-white">${clients.length}</span>
              <span class="text-xs font-semibold text-emerald-400 flex items-center bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                <span class="status-dot status-dot-emerald mr-1.5"></span> 100% Active
              </span>
            </div>
            <p class="text-xs text-slate-400 mt-2.5">Tier 1 Banking, Telco & Energy</p>
          </div>

          <div class="p-5 rounded-3xl card-premium">
            <div class="flex items-center justify-between mb-3">
              <span class="text-xs font-semibold uppercase tracking-wider text-slate-400">Team & Interns</span>
              <div class="p-2.5 rounded-2xl bg-purple-500/10 text-purple-400">
                <i data-lucide="users" class="w-5 h-5"></i>
              </div>
            </div>
            <div class="flex items-baseline gap-2">
              <span class="text-3xl font-extrabold text-white">${employees.length + internships.filter(i => i.status === 'Accepted').length}</span>
              <span class="text-xs font-semibold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/20">
                ${employees.length} core • ${internships.length} pipeline
              </span>
            </div>
            <p class="text-xs text-slate-400 mt-2.5">Engineering, ML & Architecture</p>
          </div>

          <div class="p-5 rounded-3xl card-premium">
            <div class="flex items-center justify-between mb-3">
              <span class="text-xs font-semibold uppercase tracking-wider text-slate-400">Security Vault</span>
              <div class="p-2.5 rounded-2xl ${isUnlocked ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}">
                <i data-lucide="${isUnlocked ? 'shield-check' : 'shield-alert'}" class="w-5 h-5"></i>
              </div>
            </div>
            <div class="flex items-baseline gap-2">
              <span class="text-3xl font-extrabold text-white">${credentials.length}</span>
              <span class="text-xs font-semibold ${isUnlocked ? 'text-emerald-400 bg-emerald-500/10' : 'text-amber-400 bg-amber-500/10'} px-2 py-0.5 rounded-md border ${isUnlocked ? 'border-emerald-500/20' : 'border-amber-500/20'}">
                ${isUnlocked ? 'Vault Cleared' : 'PIN Protected'}
              </span>
            </div>
            <p class="text-xs text-slate-400 mt-2.5">KMS, Database & Root keys</p>
          </div>
        </div>

        <!-- INTERACTIVE ANALYTICS ROW -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div class="lg:col-span-2 p-6 rounded-3xl card-premium">
            <div class="flex items-center justify-between mb-4">
              <div>
                <h3 class="text-sm font-bold text-white flex items-center gap-2">
                  <i data-lucide="line-chart" class="w-4 h-4 text-indigo-400"></i>
                  Portfolio Delivery & Financial Trajectory
                </h3>
                <p class="text-xs text-slate-400 mt-0.5">Contract values and delivery velocity across quarters</p>
              </div>
              <span class="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                Total Value: $1.43M
              </span>
            </div>
            <div class="h-64 w-full">
              <canvas id="dashboard-trend-chart"></canvas>
            </div>
          </div>

          <div class="p-6 rounded-3xl card-premium flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-sm font-bold text-white flex items-center gap-2">
                  <i data-lucide="pie-chart" class="w-4 h-4 text-purple-400"></i>
                  Pipeline Stage Breakdown
                </h3>
              </div>
              <div class="h-48 w-full flex items-center justify-center">
                <canvas id="dashboard-pie-chart"></canvas>
              </div>
            </div>
            <div class="grid grid-cols-2 gap-2 text-xs text-slate-400 pt-3 border-t border-slate-800">
              <div><strong class="text-white">4</strong> In Production</div>
              <div><strong class="text-white">5</strong> Under Review</div>
            </div>
          </div>
        </div>

        <!-- 2. PRODUCTS AND STAGES -->
        <div class="p-6 rounded-3xl card-premium">
          <div class="flex items-center justify-between mb-6">
            <div>
              <h3 class="text-lg font-bold text-white flex items-center gap-2">
                <i data-lucide="layers" class="w-5 h-5 text-indigo-400"></i>
                Products & Pipeline Stages
              </h3>
              <p class="text-xs text-slate-400 mt-1">Lifecycle track across Ideation, Planning, Development, QA, and Live Production</p>
            </div>
            <button onclick="UI.navigate('projects')" class="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
              View All Projects <i data-lucide="arrow-right" class="w-3.5 h-3.5"></i>
            </button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            ${products.map(product => {
              return `
                <div class="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-indigo-500/30 transition-all flex flex-col justify-between">
                  <div>
                    <div class="flex items-start justify-between gap-2 mb-2">
                      <h4 class="font-bold text-sm text-slate-100">${product.name}</h4>
                      <span class="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">${product.version}</span>
                    </div>
                    <p class="text-xs text-slate-400 line-clamp-2 mb-4">${product.description}</p>
                  </div>

                  <div>
                    <div class="flex items-center justify-between text-xs mb-1.5">
                      <span class="font-medium text-indigo-400 flex items-center gap-1.5">
                        <span class="status-dot status-dot-indigo"></span>
                        ${product.stage}
                      </span>
                      <span class="text-slate-400 font-mono">${product.progress}%</span>
                    </div>
                    <div class="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                      <div class="bg-gradient-to-r from-indigo-500 to-indigo-400 h-1.5 rounded-full transition-width" style="width: ${product.progress}%"></div>
                    </div>

                    <div class="flex items-center justify-between mt-3 pt-3 border-t border-slate-800 text-[11px] text-slate-400">
                      <span>Lead: <strong class="text-slate-300">${product.lead}</strong></span>
                      <span class="text-slate-500">${product.category}</span>
                    </div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- 3. SPLIT ROW: RECENT CLIENTS & APPLICATIONS -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Clients Card -->
          <div class="p-6 rounded-3xl card-premium flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-base font-bold text-white flex items-center gap-2">
                  <i data-lucide="building-2" class="w-5 h-5 text-emerald-400"></i>
                  Clients Overview
                </h3>
                <button onclick="UI.navigate('clients')" class="text-xs font-semibold text-emerald-400 hover:text-emerald-300">
                  Full Directory (${clients.length})
                </button>
              </div>

              <div class="space-y-3">
                ${clients.slice(0, 4).map(client => `
                  <div class="p-3.5 rounded-2xl bg-slate-900/50 border border-slate-800/80 flex items-center justify-between hover:bg-slate-800/60 transition-colors">
                    <div>
                      <h4 class="text-sm font-semibold text-white">${client.name}</h4>
                      <div class="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                        <span>${client.industry}</span>
                        <span>•</span>
                        <span>${client.contactPerson.split('(')[0]}</span>
                      </div>
                    </div>
                    <div class="text-right">
                      <span class="text-xs font-mono font-semibold text-emerald-400">${client.contractValue}</span>
                      <span class="block text-[10px] text-slate-500">${client.activeProjects} active project${client.activeProjects > 1 ? 's' : ''}</span>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
            <button onclick="UI.openAddClientModal()" class="mt-4 w-full py-2.5 rounded-2xl border border-dashed border-slate-700 text-xs font-medium text-slate-300 hover:border-slate-500 hover:text-white transition-all flex items-center justify-center gap-2">
              <i data-lucide="plus" class="w-4 h-4"></i> Add New Client
            </button>
          </div>

          <!-- Applications Card -->
          <div class="p-6 rounded-3xl card-premium flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-base font-bold text-white flex items-center gap-2">
                  <i data-lucide="graduation-cap" class="w-5 h-5 text-purple-400"></i>
                  Applications & Talent Pipeline
                </h3>
                <button onclick="UI.navigate('internships')" class="text-xs font-semibold text-purple-400 hover:text-purple-300">
                  Manage Pipeline (${internships.length})
                </button>
              </div>

              <div class="space-y-3">
                ${internships.slice(0, 4).map(intern => {
                  const statusColors = {
                    Accepted: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
                    Interviewing: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
                    Reviewing: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
                    Pending: 'bg-slate-700/50 text-slate-300 border-slate-600/30'
                  };

                  return `
                    <div class="p-3.5 rounded-2xl bg-slate-900/50 border border-slate-800/80 flex items-center justify-between hover:bg-slate-800/60 transition-colors">
                      <div>
                        <div class="flex items-center gap-2">
                          <h4 class="text-sm font-semibold text-white">${intern.candidateName}</h4>
                          <span class="text-[10px] px-2 py-0.5 rounded-full border ${statusColors[intern.status] || statusColors.Pending}">
                            ${intern.status}
                          </span>
                        </div>
                        <p class="text-xs text-slate-400 mt-0.5">${intern.institution} • ${intern.track}</p>
                      </div>
                      <div class="text-right">
                        <span class="text-xs text-slate-300">Mentor: ${intern.mentor}</span>
                        <span class="block text-[10px] text-slate-500">Evaluation: ${intern.evaluationScore}</span>
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>
            <button onclick="UI.openAddInternModal()" class="mt-4 w-full py-2.5 rounded-2xl border border-dashed border-slate-700 text-xs font-medium text-slate-300 hover:border-slate-500 hover:text-white transition-all flex items-center justify-center gap-2">
              <i data-lucide="plus" class="w-4 h-4"></i> Register Candidate Application
            </button>
          </div>
        </div>

        <!-- 4. IMPORTANT DOCUMENTS ROW -->
        <div class="p-6 rounded-3xl card-premium">
          <div class="flex items-center justify-between mb-4">
            <div>
              <h3 class="text-base font-bold text-white flex items-center gap-2">
                <i data-lucide="file-text" class="w-5 h-5 text-blue-400"></i>
                Important Documents
              </h3>
              <p class="text-xs text-slate-400 mt-0.5">Critical compliance policies, blueprints, and executed contracts</p>
            </div>
            <button onclick="UI.navigate('documents')" class="text-xs font-semibold text-blue-400 hover:text-blue-300">
              View All Documents (${documents.length})
            </button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            ${documents.slice(0, 3).map(doc => `
              <div class="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between">
                <div>
                  <div class="flex items-center justify-between mb-2">
                    <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 font-mono">${doc.fileType}</span>
                    <span class="text-xs text-slate-400">${doc.size}</span>
                  </div>
                  <h4 class="font-bold text-sm text-white mb-1 line-clamp-1">${doc.title}</h4>
                  <p class="text-xs text-slate-400">${doc.category}</p>
                </div>
                <div class="flex items-center justify-between mt-4 pt-3 border-t border-slate-800 text-xs">
                  <span class="text-slate-500">By ${doc.author}</span>
                  <button onclick="UI.previewDocument('${doc.id}')" class="text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1">
                    <i data-lucide="eye" class="w-3.5 h-3.5"></i> Preview
                  </button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- 5. SECURITY RESTRICTED SECTIONS -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- A. EMPLOYEE WE WORKED WITH -->
          <div class="relative p-6 rounded-3xl card-premium overflow-hidden">
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center gap-2.5">
                <div class="p-2.5 rounded-2xl ${isUnlocked ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}">
                  <i data-lucide="${isUnlocked ? 'user-check' : 'user-x'}" class="w-5 h-5"></i>
                </div>
                <div>
                  <h3 class="text-base font-bold text-white flex items-center gap-2">
                    Employee We Worked With
                    <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      Security Restriction
                    </span>
                  </h3>
                  <p class="text-xs text-slate-400">Historical archive of contractors, alumni, and confidential engagements</p>
                </div>
              </div>
            </div>

            ${!isUnlocked ? `
              <!-- LOCKED OVERLAY -->
              <div class="p-6 rounded-2xl bg-slate-950/80 border border-amber-500/20 text-center flex flex-col items-center justify-center my-2">
                <div class="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-400 mb-3 animate-shield">
                  <i data-lucide="shield-alert" class="w-6 h-6"></i>
                </div>
                <h4 class="text-sm font-bold text-white mb-1">Access Restricted By Security Policy</h4>
                <p class="text-xs text-slate-400 max-w-sm mb-4">
                  Viewing previous team members, contractors, exit ratings, and clearances requires master security authorization.
                </p>
                <button 
                  onclick="Security.challenge('past-employees', () => UI.render())"
                  class="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-all shadow-lg shadow-amber-600/20 flex items-center gap-2">
                  <i data-lucide="key-round" class="w-4 h-4"></i> Enter Security Clearance PIN
                </button>
                <span class="text-[10px] text-slate-500 mt-2 font-mono">Default Demo PIN: 7799</span>
              </div>
            ` : `
              <!-- UNLOCKED DATA -->
              <div class="space-y-3">
                ${pastEmployees.map(emp => `
                  <div class="p-3.5 rounded-2xl bg-slate-900/50 border border-slate-800/80 hover:bg-slate-800/60 transition-all flex items-center justify-between">
                    <div>
                      <div class="flex items-center gap-2">
                        <h4 class="text-sm font-semibold text-white">${emp.name}</h4>
                        <span class="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-mono">${emp.clearanceLevel}</span>
                      </div>
                      <p class="text-xs text-slate-400 mt-0.5">${emp.formerRole} • ${emp.period}</p>
                      <p class="text-[11px] text-slate-500 mt-1">Projects: ${emp.projectsWorkedOn}</p>
                    </div>
                    <div class="text-right">
                      <span class="text-xs font-bold text-amber-400">${emp.performanceScore}</span>
                      <span class="block text-[10px] text-slate-400">${emp.status}</span>
                    </div>
                  </div>
                `).join('')}
                <button onclick="UI.navigate('past-employees')" class="w-full py-2 text-xs font-semibold text-slate-400 hover:text-white text-center">
                  Open Full Personnel Archive →
                </button>
              </div>
            `}
          </div>

          <!-- B. CREDENTIALS VAULT -->
          <div class="relative p-6 rounded-3xl card-premium overflow-hidden">
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center gap-2.5">
                <div class="p-2.5 rounded-2xl ${isUnlocked ? 'bg-emerald-500/10 text-emerald-400' : 'bg-purple-500/10 text-purple-400'}">
                  <i data-lucide="key-round" class="w-5 h-5"></i>
                </div>
                <div>
                  <h3 class="text-base font-bold text-white flex items-center gap-2">
                    Credentials & Secrets Vault
                    <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                      Security Restriction
                    </span>
                  </h3>
                  <p class="text-xs text-slate-400">Production AWS keys, database clusters, and webhook secrets</p>
                </div>
              </div>
            </div>

            ${!isUnlocked ? `
              <!-- LOCKED OVERLAY -->
              <div class="p-6 rounded-2xl bg-slate-950/80 border border-purple-500/20 text-center flex flex-col items-center justify-center my-2">
                <div class="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-400 mb-3 animate-shield">
                  <i data-lucide="lock" class="w-6 h-6"></i>
                </div>
                <h4 class="text-sm font-bold text-white mb-1">Encrypted Credentials Vault</h4>
                <p class="text-xs text-slate-400 max-w-sm mb-4">
                  Access to infrastructure master keys, connection strings, and webhook tokens is strictly controlled.
                </p>
                <button 
                  onclick="Security.challenge('credentials', () => UI.render())"
                  class="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-lg shadow-purple-600/20 flex items-center gap-2">
                  <i data-lucide="shield-check" class="w-4 h-4"></i> Unlock Credentials Vault
                </button>
                <span class="text-[10px] text-slate-500 mt-2 font-mono">Default Demo PIN: 7799</span>
              </div>
            ` : `
              <!-- UNLOCKED SECRETS -->
              <div class="space-y-3">
                ${credentials.slice(0, 3).map(cred => `
                  <div class="p-3.5 rounded-2xl bg-slate-900/50 border border-slate-800/80 hover:bg-slate-800/60 transition-all">
                    <div class="flex items-center justify-between mb-1">
                      <h4 class="text-sm font-semibold text-white">${cred.title}</h4>
                      <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">${cred.environment}</span>
                    </div>
                    <div class="flex items-center justify-between gap-2 bg-slate-950/90 px-3 py-2 rounded-xl border border-slate-800 font-mono text-xs text-slate-300 mt-2">
                      <span class="truncate" id="vault-key-${cred.id}">••••••••••••••••••••••••</span>
                      <div class="flex items-center gap-1 shrink-0">
                        <button onclick="UI.toggleSecretVisibility('vault-key-${cred.id}', '${cred.secret}')" class="p-1 text-slate-400 hover:text-white" title="Toggle visibility">
                          <i data-lucide="eye" class="w-3.5 h-3.5"></i>
                        </button>
                        <button onclick="UI.copyToClipboard('${cred.secret}', '${cred.title}')" class="p-1 text-indigo-400 hover:text-indigo-300" title="Copy secret">
                          <i data-lucide="copy" class="w-3.5 h-3.5"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                `).join('')}
                <button onclick="UI.navigate('credentials')" class="w-full py-2 text-xs font-semibold text-slate-400 hover:text-white text-center">
                  Open Complete Secrets Vault (${credentials.length}) →
                </button>
              </div>
            `}
          </div>
        </div>
      </div>
    `;
  },

  // Initialize Interactive Charts
  initDashboardCharts() {
    // 1. Line/Area Chart for Revenue & Velocity
    const trendCtx = document.getElementById('dashboard-trend-chart');
    if (trendCtx && window.Chart) {
      if (window._zeusTrendChart) window._zeusTrendChart.destroy();
      window._zeusTrendChart = new Chart(trendCtx, {
        type: 'line',
        data: {
          labels: ['Q1 2026', 'Q2 2026', 'Q3 2026', 'Q4 2026 (Est)', 'Q1 2027 (Proj)'],
          datasets: [
            {
              label: 'Enterprise Contract Value ($k)',
              data: [420, 680, 950, 1430, 1850],
              borderColor: '#6366f1',
              backgroundColor: 'rgba(99, 102, 241, 0.12)',
              fill: true,
              tension: 0.4,
              borderWidth: 2.5,
              pointBackgroundColor: '#6366f1',
              pointRadius: 4
            },
            {
              label: 'Active Sprint Velocity (pts)',
              data: [180, 290, 420, 580, 710],
              borderColor: '#10b981',
              backgroundColor: 'transparent',
              borderWidth: 2,
              borderDash: [5, 5],
              tension: 0.4,
              pointRadius: 3
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              labels: { color: '#94a3b8', font: { family: 'Plus Jakarta Sans', size: 11 } }
            }
          },
          scales: {
            x: {
              grid: { color: 'rgba(255, 255, 255, 0.05)' },
              ticks: { color: '#64748b', font: { size: 10 } }
            },
            y: {
              grid: { color: 'rgba(255, 255, 255, 0.05)' },
              ticks: { color: '#64748b', font: { size: 10 } }
            }
          }
        }
      });
    }

    // 2. Pie / Doughnut Chart for Stages
    const pieCtx = document.getElementById('dashboard-pie-chart');
    if (pieCtx && window.Chart) {
      if (window._zeusPieChart) window._zeusPieChart.destroy();
      window._zeusPieChart = new Chart(pieCtx, {
        type: 'doughnut',
        data: {
          labels: ['Live Production', 'QA & Testing', 'Development', 'Planning'],
          datasets: [{
            data: [35, 25, 25, 15],
            backgroundColor: ['#10b981', '#6366f1', '#3b82f6', '#f59e0b'],
            borderWidth: 0
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '72%',
          plugins: {
            legend: {
              position: 'bottom',
              labels: { color: '#94a3b8', font: { size: 10 }, boxWidth: 10, padding: 8 }
            }
          }
        }
      });
    }
  },

  // ==========================================
  // TABLE VIEW: PROJECTS
  // ==========================================
  renderProjectsView() {
    const projects = Store.getProjects();
    const query = (this.searchQueries.projects || '').toLowerCase();
    const stageFilter = this.filterStates.projectsStage || 'All';

    const filtered = projects.filter(p => {
      const matchesQuery = p.name.toLowerCase().includes(query) ||
        p.client.toLowerCase().includes(query) ||
        p.lead.toLowerCase().includes(query) ||
        p.stage.toLowerCase().includes(query);
      const matchesStage = stageFilter === 'All' || p.stage === stageFilter;
      return matchesQuery && matchesStage;
    });

    const stagesList = ['All', 'Ideation', 'Planning', 'Development', 'QA & Testing', 'Live Production'];

    return `
      <div class="space-y-6 animate-fade-in">
        <!-- Controls Bar -->
        <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div class="relative flex-1 max-w-md">
            <i data-lucide="search" class="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"></i>
            <input 
              type="text" 
              placeholder="Search projects by name, client, stage, or lead..." 
              value="${this.searchQueries.projects || ''}"
              oninput="UI.setSearch('projects', this.value)"
              class="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-900 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500">
          </div>
          <div class="flex items-center gap-3">
            <button onclick="UI.exportToCSV('projects')" class="px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all flex items-center gap-2">
              <i data-lucide="download" class="w-4 h-4"></i> Export CSV
            </button>
            <button onclick="UI.openAddProjectModal()" class="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-lg shadow-indigo-600/25 flex items-center gap-2">
              <i data-lucide="plus" class="w-4 h-4"></i> New Project
            </button>
          </div>
        </div>

        <!-- Filter Pills Bar -->
        <div class="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span class="text-slate-500 font-medium mr-1">Stage:</span>
          ${stagesList.map(st => `
            <button 
              onclick="UI.setFilter('projectsStage', '${st}')" 
              class="px-3 py-1.5 rounded-xl font-medium transition-all ${
                stageFilter === st 
                  ? 'bg-indigo-600 text-white shadow-sm' 
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }">
              ${st}
            </button>
          `).join('')}
        </div>

        <!-- Table Container -->
        <div class="rounded-3xl card-premium overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="border-b border-slate-800 bg-slate-950/40 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <th class="py-4 px-4">Project Name</th>
                  <th class="py-4 px-4">Client</th>
                  <th class="py-4 px-4">Stage</th>
                  <th class="py-4 px-4">Progress</th>
                  <th class="py-4 px-4">Budget</th>
                  <th class="py-4 px-4">Deadline</th>
                  <th class="py-4 px-4">Lead</th>
                  <th class="py-4 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-800/60 text-sm">
                ${filtered.length === 0 ? `
                  <tr>
                    <td colspan="8" class="text-center py-12 text-slate-500">
                      <i data-lucide="folder-search" class="w-8 h-8 mx-auto mb-2 opacity-50"></i>
                      No projects found matching your criteria.
                    </td>
                  </tr>
                ` : filtered.map(p => `
                  <tr class="table-row-hover">
                    <td class="py-4 px-4 font-semibold text-white">${p.name}</td>
                    <td class="py-4 px-4 text-slate-300">
                      <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs bg-slate-800 text-slate-300">
                        <i data-lucide="building" class="w-3 h-3 text-slate-400"></i>
                        ${p.client}
                      </span>
                    </td>
                    <td class="py-4 px-4">
                      <span class="px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 w-max ${
                        p.stage === 'Live Production' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                        p.stage === 'QA & Testing' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' :
                        p.stage === 'Development' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                        'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }">
                        <span class="status-dot ${
                          p.stage === 'Live Production' ? 'status-dot-emerald' :
                          p.stage === 'QA & Testing' ? 'status-dot-indigo' :
                          'status-dot-amber'
                        }"></span>
                        ${p.stage}
                      </span>
                    </td>
                    <td class="py-4 px-4">
                      <div class="flex items-center gap-2">
                        <div class="w-24 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                          <div class="bg-indigo-500 h-1.5 rounded-full" style="width: ${p.completion}%"></div>
                        </div>
                        <span class="text-xs font-mono text-slate-400">${p.completion}%</span>
                      </div>
                    </td>
                    <td class="py-4 px-4 font-mono text-slate-300">${p.budget}</td>
                    <td class="py-4 px-4 text-slate-400 text-xs">${p.deadline}</td>
                    <td class="py-4 px-4 text-slate-300">${p.lead}</td>
                    <td class="py-4 px-4 text-right">
                      <div class="flex items-center justify-end gap-2">
                        <button onclick="UI.deleteProject('${p.id}')" class="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800" title="Delete Project">
                          <i data-lucide="trash-2" class="w-4 h-4"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          <div class="px-4 py-3 border-t border-slate-800 bg-slate-950/20 flex items-center justify-between text-xs text-slate-400">
            <span>Showing ${filtered.length} of ${projects.length} strategic projects</span>
            <span>All systems nominal</span>
          </div>
        </div>
      </div>
    `;
  },

  // ==========================================
  // TABLE VIEW: CLIENTS
  // ==========================================
  renderClientsView() {
    const clients = Store.getClients();
    const query = (this.searchQueries.clients || '').toLowerCase();
    const statusFilter = this.filterStates.clientsStatus || 'All';

    const filtered = clients.filter(c => {
      const matchesQuery = c.name.toLowerCase().includes(query) ||
        c.industry.toLowerCase().includes(query) ||
        c.contactPerson.toLowerCase().includes(query) ||
        c.location.toLowerCase().includes(query);
      const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
      return matchesQuery && matchesStatus;
    });

    return `
      <div class="space-y-6 animate-fade-in">
        <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div class="relative flex-1 max-w-md">
            <i data-lucide="search" class="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"></i>
            <input 
              type="text" 
              placeholder="Search clients by company, industry, or location..." 
              value="${this.searchQueries.clients || ''}"
              oninput="UI.setSearch('clients', this.value)"
              class="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-900 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500">
          </div>
          <div class="flex items-center gap-3">
            <button onclick="UI.exportToCSV('clients')" class="px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all flex items-center gap-2">
              <i data-lucide="download" class="w-4 h-4"></i> Export CSV
            </button>
            <button onclick="UI.openAddClientModal()" class="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-lg shadow-emerald-600/25 flex items-center gap-2">
              <i data-lucide="plus" class="w-4 h-4"></i> Add Client
            </button>
          </div>
        </div>

        <div class="rounded-3xl card-premium overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="border-b border-slate-800 bg-slate-950/40 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <th class="py-4 px-4">Client Organization</th>
                  <th class="py-4 px-4">Industry / Sector</th>
                  <th class="py-4 px-4">Primary Contact</th>
                  <th class="py-4 px-4">Email</th>
                  <th class="py-4 px-4">Phone</th>
                  <th class="py-4 px-4">Contract Value</th>
                  <th class="py-4 px-4">Status</th>
                  <th class="py-4 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-800/60 text-sm">
                ${filtered.length === 0 ? `
                  <tr><td colspan="8" class="text-center py-12 text-slate-500">No clients match your filter.</td></tr>
                ` : filtered.map(c => `
                  <tr class="table-row-hover">
                    <td class="py-4 px-4 font-semibold text-white">
                      <div>${c.name}</div>
                      <div class="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <i data-lucide="map-pin" class="w-3 h-3 text-slate-500"></i> ${c.location}
                      </div>
                    </td>
                    <td class="py-4 px-4 text-slate-300">${c.industry}</td>
                    <td class="py-4 px-4 text-slate-200">${c.contactPerson}</td>
                    <td class="py-4 px-4 text-slate-400 text-xs font-mono">${c.email}</td>
                    <td class="py-4 px-4 text-slate-400 text-xs">${c.phone}</td>
                    <td class="py-4 px-4 font-mono font-semibold text-emerald-400">${c.contractValue}</td>
                    <td class="py-4 px-4">
                      <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        c.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400'
                      }">${c.status}</span>
                    </td>
                    <td class="py-4 px-4 text-right">
                      <button onclick="UI.deleteClient('${c.id}')" class="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800" title="Delete Client">
                        <i data-lucide="trash-2" class="w-4 h-4"></i>
                      </button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  },

  // ==========================================
  // TABLE VIEW: EMPLOYEES (ACTIVE)
  // ==========================================
  renderEmployeesView() {
    const employees = Store.getEmployees();
    const query = (this.searchQueries.employees || '').toLowerCase();
    const filtered = employees.filter(e =>
      e.name.toLowerCase().includes(query) ||
      e.role.toLowerCase().includes(query) ||
      e.department.toLowerCase().includes(query) ||
      e.email.toLowerCase().includes(query)
    );

    return `
      <div class="space-y-6 animate-fade-in">
        <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div class="relative flex-1 max-w-md">
            <i data-lucide="search" class="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"></i>
            <input 
              type="text" 
              placeholder="Search team members by name, role, department..." 
              value="${this.searchQueries.employees || ''}"
              oninput="UI.setSearch('employees', this.value)"
              class="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-900 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500">
          </div>
          <div class="flex items-center gap-3">
            <button onclick="UI.openAddEmployeeModal()" class="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-lg shadow-indigo-600/25 flex items-center gap-2">
              <i data-lucide="user-plus" class="w-4 h-4"></i> Add Employee
            </button>
          </div>
        </div>

        <div class="rounded-3xl card-premium overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="border-b border-slate-800 bg-slate-950/40 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <th class="py-4 px-4">Employee</th>
                  <th class="py-4 px-4">Role / Title</th>
                  <th class="py-4 px-4">Department</th>
                  <th class="py-4 px-4">Company Email</th>
                  <th class="py-4 px-4">Location</th>
                  <th class="py-4 px-4">Status</th>
                  <th class="py-4 px-4">Join Date</th>
                  <th class="py-4 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-800/60 text-sm">
                ${filtered.map(emp => `
                  <tr class="table-row-hover">
                    <td class="py-4 px-4">
                      <div class="flex items-center gap-3">
                        <div class="w-9 h-9 rounded-full bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold text-xs ring-1 ring-indigo-500/30">
                          ${emp.name.split(' ').map(n=>n[0]).join('')}
                        </div>
                        <div>
                          <div class="font-semibold text-white">${emp.name}</div>
                          <div class="text-[11px] text-slate-500">${emp.type}</div>
                        </div>
                      </div>
                    </td>
                    <td class="py-4 px-4 text-slate-300 font-medium">${emp.role}</td>
                    <td class="py-4 px-4 text-slate-400">${emp.department}</td>
                    <td class="py-4 px-4 text-slate-300 font-mono text-xs">${emp.email}</td>
                    <td class="py-4 px-4 text-slate-400 text-xs">${emp.location}</td>
                    <td class="py-4 px-4">
                      <span class="px-2.5 py-0.5 rounded-full text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        ${emp.status}
                      </span>
                    </td>
                    <td class="py-4 px-4 text-slate-400 text-xs">${emp.joinDate}</td>
                    <td class="py-4 px-4 text-right">
                      <button onclick="UI.deleteEmployee('${emp.id}')" class="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800" title="Remove Employee">
                        <i data-lucide="trash-2" class="w-4 h-4"></i>
                      </button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  },

  // ==========================================
  // TABLE VIEW: EMPLOYEE WE WORKED WITH (SECURITY RESTRICTION)
  // ==========================================
  renderPastEmployeesView() {
    const isUnlocked = Security.isUnlocked();
    if (!isUnlocked) {
      return `
        <div class="p-12 rounded-3xl card-premium border-amber-500/30 text-center max-w-xl mx-auto my-12 animate-fade-in">
          <div class="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto mb-4 animate-shield ring-1 ring-amber-500/30">
            <i data-lucide="shield-alert" class="w-8 h-8"></i>
          </div>
          <h3 class="text-xl font-bold text-white mb-2">Confidential Personnel Vault Gated</h3>
          <p class="text-sm text-slate-400 mb-6">
            Access to past personnel, consultants, performance evaluations, and exit clearance records requires corporate authorization.
          </p>
          <button 
            onclick="Security.challenge('past-employees', () => UI.render())"
            class="px-6 py-3 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white text-sm font-bold shadow-lg shadow-amber-600/25 transition-all inline-flex items-center gap-2">
            <i data-lucide="key-round" class="w-4 h-4"></i> Enter Clearance PIN (Default: 7799)
          </button>
        </div>
      `;
    }

    const pastEmployees = Store.getPastEmployees();
    const query = (this.searchQueries.pastEmployees || '').toLowerCase();
    const filtered = pastEmployees.filter(p =>
      p.name.toLowerCase().includes(query) ||
      p.formerRole.toLowerCase().includes(query) ||
      p.projectsWorkedOn.toLowerCase().includes(query)
    );

    return `
      <div class="space-y-6 animate-fade-in">
        <div class="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
          <div class="flex items-center gap-3 text-amber-300 text-xs">
            <i data-lucide="shield-check" class="w-5 h-5 text-amber-400"></i>
            <span><strong>Clearance Verified:</strong> Viewing confidential contractor and alumni records. Session will automatically re-lock on inactivity.</span>
          </div>
          <button onclick="Security.lock(); UI.render();" class="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-bold transition-all flex items-center gap-1.5">
            <i data-lucide="lock" class="w-3.5 h-3.5"></i> Lock Archive
          </button>
        </div>

        <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div class="relative flex-1 max-w-md">
            <i data-lucide="search" class="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"></i>
            <input 
              type="text" 
              placeholder="Search historical records by name, role, project..." 
              value="${this.searchQueries.pastEmployees || ''}"
              oninput="UI.setSearch('pastEmployees', this.value)"
              class="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-900 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500">
          </div>
          <button onclick="UI.openAddPastEmployeeModal()" class="px-4 py-2.5 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-all shadow-lg shadow-amber-600/25 flex items-center gap-2">
            <i data-lucide="plus" class="w-4 h-4"></i> Archive Personnel Record
          </button>
        </div>

        <div class="rounded-3xl card-premium overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="border-b border-slate-800 bg-slate-950/40 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <th class="py-4 px-4">Individual</th>
                  <th class="py-4 px-4">Former Role</th>
                  <th class="py-4 px-4">Engagement Type</th>
                  <th class="py-4 px-4">Period</th>
                  <th class="py-4 px-4">Clearance Level</th>
                  <th class="py-4 px-4">Key Projects</th>
                  <th class="py-4 px-4">Rating</th>
                  <th class="py-4 px-4">Exit Status</th>
                  <th class="py-4 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-800/60 text-sm">
                ${filtered.map(emp => `
                  <tr class="table-row-hover">
                    <td class="py-4 px-4">
                      <div class="font-semibold text-white">${emp.name}</div>
                      <div class="text-[11px] text-slate-400 font-mono">${emp.currentContact}</div>
                    </td>
                    <td class="py-4 px-4 text-slate-300">${emp.formerRole}</td>
                    <td class="py-4 px-4 text-slate-400 text-xs">${emp.engagementType}</td>
                    <td class="py-4 px-4 text-slate-400 text-xs">${emp.period}</td>
                    <td class="py-4 px-4">
                      <span class="px-2 py-0.5 rounded text-[11px] font-mono bg-purple-500/10 text-purple-400 border border-purple-500/20">
                        ${emp.clearanceLevel}
                      </span>
                    </td>
                    <td class="py-4 px-4 text-xs text-slate-300 max-w-xs truncate">${emp.projectsWorkedOn}</td>
                    <td class="py-4 px-4 font-bold text-amber-400">${emp.performanceScore}</td>
                    <td class="py-4 px-4">
                      <span class="px-2 py-0.5 rounded-full text-[11px] bg-slate-800 text-slate-300">
                        ${emp.status}
                      </span>
                    </td>
                    <td class="py-4 px-4 text-right">
                      <button onclick="UI.deletePastEmployee('${emp.id}')" class="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800" title="Delete Archive">
                        <i data-lucide="trash-2" class="w-4 h-4"></i>
                      </button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  },

  // ==========================================
  // TABLE VIEW: IMPORTANT DOCUMENTS
  // ==========================================
  renderDocumentsView() {
    const documents = Store.getDocuments();
    const query = (this.searchQueries.documents || '').toLowerCase();
    const filtered = documents.filter(d =>
      d.title.toLowerCase().includes(query) ||
      d.category.toLowerCase().includes(query) ||
      d.author.toLowerCase().includes(query)
    );

    return `
      <div class="space-y-6 animate-fade-in">
        <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div class="relative flex-1 max-w-md">
            <i data-lucide="search" class="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"></i>
            <input 
              type="text" 
              placeholder="Search documents by title, category, or author..." 
              value="${this.searchQueries.documents || ''}"
              oninput="UI.setSearch('documents', this.value)"
              class="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-900 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500">
          </div>
          <button onclick="UI.openAddDocumentModal()" class="px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-lg shadow-blue-600/25 flex items-center gap-2">
            <i data-lucide="file-up" class="w-4 h-4"></i> Register Document
          </button>
        </div>

        <div class="rounded-3xl card-premium overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="border-b border-slate-800 bg-slate-950/40 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <th class="py-4 px-4">Document Title</th>
                  <th class="py-4 px-4">Category</th>
                  <th class="py-4 px-4">Format</th>
                  <th class="py-4 px-4">File Size</th>
                  <th class="py-4 px-4">Classification</th>
                  <th class="py-4 px-4">Registered By</th>
                  <th class="py-4 px-4">Last Modified</th>
                  <th class="py-4 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-800/60 text-sm">
                ${filtered.map(doc => `
                  <tr class="table-row-hover">
                    <td class="py-4 px-4 font-semibold text-white flex items-center gap-2">
                      <i data-lucide="file-text" class="w-4 h-4 text-blue-400"></i>
                      ${doc.title}
                    </td>
                    <td class="py-4 px-4 text-slate-300">${doc.category}</td>
                    <td class="py-4 px-4">
                      <span class="px-2 py-0.5 rounded text-xs font-mono font-bold bg-slate-800 text-slate-300">${doc.fileType}</span>
                    </td>
                    <td class="py-4 px-4 text-slate-400 text-xs font-mono">${doc.size}</td>
                    <td class="py-4 px-4">
                      <span class="px-2.5 py-0.5 rounded-full text-xs ${
                        doc.accessLevel === 'Confidential' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                        doc.accessLevel === 'Restricted' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                        'bg-slate-800 text-slate-300'
                      }">${doc.accessLevel}</span>
                    </td>
                    <td class="py-4 px-4 text-slate-400 text-xs">${doc.author}</td>
                    <td class="py-4 px-4 text-slate-400 text-xs">${doc.updatedAt}</td>
                    <td class="py-4 px-4 text-right">
                      <div class="flex items-center justify-end gap-1">
                        <button onclick="UI.previewDocument('${doc.id}')" class="p-1.5 rounded-lg text-indigo-400 hover:bg-slate-800" title="Preview Document">
                          <i data-lucide="eye" class="w-4 h-4"></i>
                        </button>
                        <button onclick="UI.downloadDocumentMock('${doc.title}')" class="p-1.5 rounded-lg text-emerald-400 hover:bg-slate-800" title="Download Document">
                          <i data-lucide="download" class="w-4 h-4"></i>
                        </button>
                        <button onclick="UI.deleteDocument('${doc.id}')" class="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800" title="Delete">
                          <i data-lucide="trash-2" class="w-4 h-4"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  },

  // ==========================================
  // TABLE VIEW: TEMPLATES
  // ==========================================
  renderTemplatesView() {
    const templates = Store.getTemplates();
    const query = (this.searchQueries.templates || '').toLowerCase();
    const filtered = templates.filter(t =>
      t.title.toLowerCase().includes(query) ||
      t.category.toLowerCase().includes(query) ||
      t.description.toLowerCase().includes(query)
    );

    return `
      <div class="space-y-6 animate-fade-in">
        <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div class="relative flex-1 max-w-md">
            <i data-lucide="search" class="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"></i>
            <input 
              type="text" 
              placeholder="Search templates by title or category..." 
              value="${this.searchQueries.templates || ''}"
              oninput="UI.setSearch('templates', this.value)"
              class="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-900 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500">
          </div>
          <button onclick="UI.openAddTemplateModal()" class="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-lg shadow-indigo-600/25 flex items-center gap-2">
            <i data-lucide="plus" class="w-4 h-4"></i> Add Template
          </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          ${filtered.map(tpl => `
            <div class="p-5 rounded-3xl card-premium flex flex-col justify-between">
              <div>
                <div class="flex items-center justify-between mb-3">
                  <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 uppercase tracking-wider">${tpl.category}</span>
                  <span class="text-xs text-slate-500 font-mono">${tpl.format}</span>
                </div>
                <h4 class="font-bold text-base text-white mb-2">${tpl.title}</h4>
                <p class="text-xs text-slate-400 line-clamp-3 mb-4">${tpl.description}</p>
              </div>

              <div class="pt-4 border-t border-slate-800 flex items-center justify-between text-xs">
                <span class="text-slate-500 flex items-center gap-1">
                  <i data-lucide="download-cloud" class="w-3.5 h-3.5"></i> ${tpl.downloadsCount} uses
                </span>
                <div class="flex items-center gap-2">
                  <button onclick="UI.copyTemplateMock('${tpl.title}')" class="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium flex items-center gap-1.5 transition-colors">
                    <i data-lucide="copy" class="w-3.5 h-3.5"></i> Copy
                  </button>
                  <button onclick="UI.downloadDocumentMock('${tpl.title}')" class="px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 font-medium flex items-center gap-1.5 transition-colors">
                    <i data-lucide="download" class="w-3.5 h-3.5"></i> Get
                  </button>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  },

  // ==========================================
  // TABLE VIEW: INTERNSHIP
  // ==========================================
  renderInternshipsView() {
    const internships = Store.getInternships();
    const query = (this.searchQueries.internships || '').toLowerCase();
    const statusFilter = this.filterStates.internshipsStatus || 'All';

    const filtered = internships.filter(i => {
      const matchesQuery = i.candidateName.toLowerCase().includes(query) ||
        i.institution.toLowerCase().includes(query) ||
        i.track.toLowerCase().includes(query) ||
        i.mentor.toLowerCase().includes(query);
      const matchesStatus = statusFilter === 'All' || i.status === statusFilter;
      return matchesQuery && matchesStatus;
    });

    const statusOptions = ['All', 'Accepted', 'Interviewing', 'Reviewing', 'Pending'];

    return `
      <div class="space-y-6 animate-fade-in">
        <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div class="relative flex-1 max-w-md">
            <i data-lucide="search" class="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"></i>
            <input 
              type="text" 
              placeholder="Search interns by name, school, track, mentor..." 
              value="${this.searchQueries.internships || ''}"
              oninput="UI.setSearch('internships', this.value)"
              class="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-900 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500">
          </div>
          <button onclick="UI.openAddInternModal()" class="px-4 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-lg shadow-purple-600/25 flex items-center gap-2">
            <i data-lucide="user-plus" class="w-4 h-4"></i> New Applicant
          </button>
        </div>

        <!-- Filter Pills Bar -->
        <div class="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span class="text-slate-500 font-medium mr-1">Status:</span>
          ${statusOptions.map(st => `
            <button 
              onclick="UI.setFilter('internshipsStatus', '${st}')" 
              class="px-3 py-1.5 rounded-xl font-medium transition-all ${
                statusFilter === st 
                  ? 'bg-purple-600 text-white shadow-sm' 
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }">
              ${st}
            </button>
          `).join('')}
        </div>

        <div class="rounded-3xl card-premium overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="border-b border-slate-800 bg-slate-950/40 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <th class="py-4 px-4">Candidate</th>
                  <th class="py-4 px-4">Academic Institution</th>
                  <th class="py-4 px-4">Track / Focus</th>
                  <th class="py-4 px-4">Status</th>
                  <th class="py-4 px-4">Assigned Mentor</th>
                  <th class="py-4 px-4">Project Assigned</th>
                  <th class="py-4 px-4">Evaluation</th>
                  <th class="py-4 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-800/60 text-sm">
                ${filtered.map(intern => `
                  <tr class="table-row-hover">
                    <td class="py-4 px-4">
                      <div class="font-semibold text-white">${intern.candidateName}</div>
                      <div class="text-[11px] text-slate-400 font-mono">${intern.email}</div>
                    </td>
                    <td class="py-4 px-4 text-slate-300">${intern.institution}</td>
                    <td class="py-4 px-4 text-slate-400 text-xs">${intern.track}</td>
                    <td class="py-4 px-4">
                      <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        intern.status === 'Accepted' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                        intern.status === 'Interviewing' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' :
                        intern.status === 'Reviewing' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                        'bg-slate-800 text-slate-300'
                      }">${intern.status}</span>
                    </td>
                    <td class="py-4 px-4 text-slate-300">${intern.mentor}</td>
                    <td class="py-4 px-4 text-slate-400 text-xs">${intern.assignedProject}</td>
                    <td class="py-4 px-4 font-bold text-purple-400">${intern.evaluationScore}</td>
                    <td class="py-4 px-4 text-right">
                      <button onclick="UI.deleteIntern('${intern.id}')" class="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800" title="Delete Applicant">
                        <i data-lucide="trash-2" class="w-4 h-4"></i>
                      </button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  },

  // ==========================================
  // TABLE VIEW: CREDENTIALS VAULT (SECURITY RESTRICTION)
  // ==========================================
  renderCredentialsView() {
    const isUnlocked = Security.isUnlocked();
    if (!isUnlocked) {
      return `
        <div class="p-12 rounded-3xl card-premium border-purple-500/30 text-center max-w-xl mx-auto my-12 animate-fade-in">
          <div class="w-16 h-16 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center mx-auto mb-4 animate-shield ring-1 ring-purple-500/30">
            <i data-lucide="lock" class="w-8 h-8"></i>
          </div>
          <h3 class="text-xl font-bold text-white mb-2">Master Credentials Vault Encrypted</h3>
          <p class="text-sm text-slate-400 mb-6">
            Production cloud infrastructure keys, database root passwords, and HMAC webhook secrets require security authentication.
          </p>
          <button 
            onclick="Security.challenge('credentials', () => UI.render())"
            class="px-6 py-3 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-bold shadow-lg shadow-purple-600/25 transition-all inline-flex items-center gap-2">
            <i data-lucide="shield-check" class="w-4 h-4"></i> Unlock Vault (Default PIN: 7799)
          </button>
        </div>
      `;
    }

    const credentials = Store.getCredentials();
    const query = (this.searchQueries.credentials || '').toLowerCase();
    const filtered = credentials.filter(c =>
      c.title.toLowerCase().includes(query) ||
      c.service.toLowerCase().includes(query) ||
      c.environment.toLowerCase().includes(query)
    );

    return `
      <div class="space-y-6 animate-fade-in">
        <div class="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-between">
          <div class="flex items-center gap-3 text-purple-300 text-xs">
            <i data-lucide="shield-check" class="w-5 h-5 text-purple-400"></i>
            <span><strong>Clearance Verified:</strong> Production credentials vault unlocked. Copy actions are logged for corporate audit.</span>
          </div>
          <button onclick="Security.lock(); UI.render();" class="px-3 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 text-xs font-bold transition-all flex items-center gap-1.5">
            <i data-lucide="lock" class="w-3.5 h-3.5"></i> Lock Vault
          </button>
        </div>

        <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div class="relative flex-1 max-w-md">
            <i data-lucide="search" class="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"></i>
            <input 
              type="text" 
              placeholder="Search secrets by title, service, environment..." 
              value="${this.searchQueries.credentials || ''}"
              oninput="UI.setSearch('credentials', this.value)"
              class="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-900 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500">
          </div>
          <button onclick="UI.openAddCredentialModal()" class="px-4 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-lg shadow-purple-600/25 flex items-center gap-2">
            <i data-lucide="plus" class="w-4 h-4"></i> Add Secret Key
          </button>
        </div>

        <div class="space-y-4">
          ${filtered.map(cred => `
            <div class="p-5 rounded-3xl card-premium">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                <div class="flex items-center gap-3">
                  <div class="p-2.5 rounded-2xl bg-purple-500/10 text-purple-400 ring-1 ring-purple-500/20">
                    <i data-lucide="key" class="w-5 h-5"></i>
                  </div>
                  <div>
                    <h4 class="font-bold text-base text-white">${cred.title}</h4>
                    <span class="text-xs text-slate-400">${cred.service} • ${cred.username}</span>
                  </div>
                </div>
                <div class="flex items-center gap-2">
                  <span class="px-2.5 py-1 rounded-full text-xs font-mono font-bold ${
                    cred.environment === 'Production' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-slate-800 text-slate-300'
                  }">${cred.environment}</span>
                  <button onclick="UI.deleteCredential('${cred.id}')" class="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800" title="Delete Key">
                    <i data-lucide="trash-2" class="w-4 h-4"></i>
                  </button>
                </div>
              </div>

              <!-- Masked Secret Box -->
              <div class="flex items-center justify-between gap-3 bg-slate-950/90 border border-slate-800 p-3.5 rounded-2xl font-mono text-xs">
                <span id="cred-val-${cred.id}" class="text-slate-400 truncate tracking-wider">••••••••••••••••••••••••••••••••</span>
                <div class="flex items-center gap-2 shrink-0">
                  <button onclick="UI.toggleSecretVisibility('cred-val-${cred.id}', '${cred.secret}')" class="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1.5 transition-colors">
                    <i data-lucide="eye" class="w-3.5 h-3.5"></i> Reveal
                  </button>
                  <button onclick="UI.copyToClipboard('${cred.secret}', '${cred.title}')" class="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors">
                    <i data-lucide="copy" class="w-3.5 h-3.5"></i> Copy Secret
                  </button>
                </div>
              </div>

              <div class="flex items-center justify-between text-[11px] text-slate-500 mt-3 pt-2 border-t border-slate-800/60">
                <span>Notes: ${cred.notes}</span>
                <span>Last updated ${cred.lastUpdated} by ${cred.updatedBy}</span>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  },

  // ==========================================
  // TABLE VIEW: USERS
  // ==========================================
  renderUsersView() {
    const users = Store.getUsers();
    const query = (this.searchQueries.users || '').toLowerCase();
    const filtered = users.filter(u =>
      u.name.toLowerCase().includes(query) ||
      u.email.toLowerCase().includes(query) ||
      u.role.toLowerCase().includes(query) ||
      u.domain.toLowerCase().includes(query)
    );

    return `
      <div class="space-y-6 animate-fade-in">
        <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div class="relative flex-1 max-w-md">
            <i data-lucide="search" class="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"></i>
            <input 
              type="text" 
              placeholder="Search users by name, company email, role..." 
              value="${this.searchQueries.users || ''}"
              oninput="UI.setSearch('users', this.value)"
              class="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-900 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500">
          </div>
          <div class="flex items-center gap-3">
            <button onclick="UI.openAddDomainModal()" class="px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all flex items-center gap-2">
              <i data-lucide="globe" class="w-4 h-4"></i> Manage Domains
            </button>
            <button onclick="UI.openAddUserModal()" class="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-lg shadow-indigo-600/25 flex items-center gap-2">
              <i data-lucide="user-plus" class="w-4 h-4"></i> Add User
            </button>
          </div>
        </div>

        <div class="rounded-3xl card-premium overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="border-b border-slate-800 bg-slate-950/40 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <th class="py-4 px-4">User</th>
                  <th class="py-4 px-4">Authorized Company Account</th>
                  <th class="py-4 px-4">Organization / Domain</th>
                  <th class="py-4 px-4">Role</th>
                  <th class="py-4 px-4">Status</th>
                  <th class="py-4 px-4">Last Active</th>
                  <th class="py-4 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-800/60 text-sm">
                ${filtered.map(u => `
                  <tr class="table-row-hover">
                    <td class="py-4 px-4 font-semibold text-white flex items-center gap-3">
                      <div class="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center font-bold text-xs text-indigo-400 ring-1 ring-slate-700">
                        ${u.name[0]}
                      </div>
                      ${u.name}
                    </td>
                    <td class="py-4 px-4 font-mono text-slate-300 text-xs">${u.email}</td>
                    <td class="py-4 px-4">
                      <span class="px-2 py-0.5 rounded text-xs font-mono bg-slate-800 text-slate-300">@${u.domain}</span>
                    </td>
                    <td class="py-4 px-4 text-slate-300 font-medium">${u.role}</td>
                    <td class="py-4 px-4">
                      <span class="px-2.5 py-0.5 rounded-full text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        ${u.status}
                      </span>
                    </td>
                    <td class="py-4 px-4 text-slate-400 text-xs">${u.lastLogin}</td>
                    <td class="py-4 px-4 text-right">
                      <button onclick="UI.deleteUser('${u.id}')" class="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800" title="Revoke User Access">
                        <i data-lucide="trash-2" class="w-4 h-4"></i>
                      </button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  },

  // ==========================================
  // HELPER ACTIONS & FILTERS
  // ==========================================
  setSearch(key, val) {
    this.searchQueries[key] = val;
    this.render();
  },

  setFilter(key, val) {
    this.filterStates[key] = val;
    this.render();
  },

  toggleSecretVisibility(elementId, secret) {
    const el = document.getElementById(elementId);
    if (!el) return;
    if (el.textContent === secret) {
      el.textContent = '••••••••••••••••••••••••••••••••';
    } else {
      el.textContent = secret;
    }
  },

  copyToClipboard(text, title = 'Value') {
    navigator.clipboard.writeText(text).then(() => {
      this.showToast(`Copied ${title} to clipboard!`, 'success');
    }).catch(() => {
      this.showToast(`Failed to copy to clipboard`, 'error');
    });
  },

  copyTemplateMock(title) {
    const text = `# ${title}\n\nCONFIDENTIAL - ZEUS OPERATIONS PLATFORM\nDocument Reference: REF-${Date.now()}\n\n1. Purpose & Scope\nThis agreement regulates services executed under corporate governance.\n\n2. Signatures\nDomari / Ikirezi / FraudShield Authorized Representative.`;
    navigator.clipboard.writeText(text).then(() => {
      this.showToast(`Template contents for "${title}" copied to clipboard!`, 'success');
    });
  },

  downloadDocumentMock(title) {
    this.showToast(`Preparing download package for "${title}"...`, 'info');
    setTimeout(() => {
      this.showToast(`Downloaded "${title}" successfully.`, 'success');
    }, 800);
  },

  previewDocument(id) {
    const doc = Store.getDocuments().find(d => d.id === id);
    if (!doc) return;

    const modal = document.getElementById('preview-modal');
    const modalContent = document.getElementById('preview-modal-content');
    if (!modal || !modalContent) return;

    modalContent.innerHTML = `
      <div class="p-6">
        <div class="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <span class="text-xs font-mono font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-400">${doc.fileType} • ${doc.size}</span>
            <h3 class="text-lg font-bold text-white mt-1">${doc.title}</h3>
            <p class="text-xs text-slate-400">Classification: <span class="text-rose-400 font-semibold">${doc.accessLevel}</span> • Author: ${doc.author}</p>
          </div>
          <button onclick="UI.closePreviewModal()" class="text-slate-400 hover:text-white p-2">
            <i data-lucide="x" class="w-5 h-5"></i>
          </button>
        </div>

        <div class="my-6 p-6 rounded-2xl bg-slate-950/80 border border-slate-800 font-mono text-xs text-slate-300 space-y-4 max-h-[60vh] overflow-y-auto">
          <p class="text-emerald-400 font-bold">// ZEUS SECURE DOCUMENT ENCLAVE VERIFIED</p>
          <p>Document Hash: sha256_88b9c02e18fa4d92039ab1849f92e84</p>
          <hr class="border-slate-800">
          <h4 class="text-sm font-bold text-white uppercase tracking-wider font-sans">1. EXECUTIVE SUMMARY & JURISDICTION</h4>
          <p class="font-sans leading-relaxed text-slate-300">
            This document sets forth operational parameters, cybersecurity governance frameworks, and data sovereignty safeguards for all deployments managed within the Zeus ecosystem.
          </p>
          <h4 class="text-sm font-bold text-white uppercase tracking-wider font-sans">2. COMPLIANCE & ACCESS AUDITING</h4>
          <p class="font-sans leading-relaxed text-slate-300">
            All cryptographic key exchanges, personnel archive reviews, and client statements of work strictly adhere to ISO/IEC 27001 standards and national data protection statutory laws.
          </p>
        </div>

        <div class="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <button onclick="UI.closePreviewModal()" class="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold">
            Close
          </button>
          <button onclick="UI.downloadDocumentMock('${doc.title}')" class="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-2">
            <i data-lucide="download" class="w-4 h-4"></i> Download Archive
          </button>
        </div>
      </div>
    `;

    modal.classList.remove('hidden');
    modal.classList.add('flex');
    lucide.createIcons({ root: modal });
  },

  closePreviewModal() {
    const modal = document.getElementById('preview-modal');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  },

  // DELETE HANDLERS
  deleteProject(id) {
    if (confirm('Are you sure you want to delete this project?')) {
      Store.deleteItem(STORAGE_KEYS.PROJECTS, id);
      this.showToast('Project deleted successfully.', 'info');
      this.render();
    }
  },

  deleteClient(id) {
    if (confirm('Are you sure you want to remove this client?')) {
      Store.deleteItem(STORAGE_KEYS.CLIENTS, id);
      this.showToast('Client removed from directory.', 'info');
      this.render();
    }
  },

  deleteEmployee(id) {
    if (confirm('Are you sure you want to remove this team member?')) {
      Store.deleteItem(STORAGE_KEYS.EMPLOYEES, id);
      this.showToast('Team member removed.', 'info');
      this.render();
    }
  },

  deletePastEmployee(id) {
    if (confirm('Delete this historical personnel record from archive?')) {
      Store.deleteItem(STORAGE_KEYS.PAST_EMPLOYEES, id);
      this.showToast('Personnel archive record removed.', 'info');
      this.render();
    }
  },

  deleteDocument(id) {
    if (confirm('Delete this document?')) {
      Store.deleteItem(STORAGE_KEYS.DOCUMENTS, id);
      this.showToast('Document deleted.', 'info');
      this.render();
    }
  },

  deleteIntern(id) {
    if (confirm('Remove this applicant?')) {
      Store.deleteItem(STORAGE_KEYS.INTERNSHIPS, id);
      this.showToast('Candidate application removed.', 'info');
      this.render();
    }
  },

  deleteCredential(id) {
    if (confirm('Are you sure you want to delete this secret key from vault?')) {
      Store.deleteItem(STORAGE_KEYS.CREDENTIALS, id);
      this.showToast('Secret key permanently purged.', 'warning');
      this.render();
    }
  },

  deleteUser(id) {
    if (confirm('Revoke access for this user?')) {
      Store.deleteItem(STORAGE_KEYS.USERS, id);
      this.showToast('User access revoked.', 'info');
      this.render();
    }
  },

  // EXPORT TO CSV
  exportToCSV(type) {
    let data = [];
    if (type === 'projects') data = Store.getProjects();
    if (type === 'clients') data = Store.getClients();
    if (!data.length) return;

    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(item => Object.values(item).map(v => `"${v}"`).join(','));
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `zeus_${type}_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    this.showToast(`Exported ${type} to CSV.`, 'success');
  },

  // MODAL CREATION FORMS
  openAddProjectModal() {
    this.openGenericModal('Create New Project', `
      <form id="generic-form" onsubmit="UI.handleAddProjectSubmit(event)" class="space-y-4">
        <div>
          <label class="block text-xs font-semibold text-slate-300 mb-1">Project Name</label>
          <input required name="name" class="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm" placeholder="e.g. AI Fraud Monitoring Pipeline">
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-semibold text-slate-300 mb-1">Client Organization</label>
            <input required name="client" class="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm" placeholder="e.g. Bank of Kigali">
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-300 mb-1">Pipeline Stage</label>
            <select name="stage" class="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm">
              <option value="Ideation">Ideation</option>
              <option value="Planning">Planning</option>
              <option value="Development" selected>Development</option>
              <option value="QA & Testing">QA & Testing</option>
              <option value="Live Production">Live Production</option>
            </select>
          </div>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-semibold text-slate-300 mb-1">Budget</label>
            <input required name="budget" class="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm" placeholder="e.g. $120,000">
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-300 mb-1">Deadline</label>
            <input required type="date" name="deadline" class="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm">
          </div>
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-300 mb-1">Lead Architect / Manager</label>
          <input required name="lead" class="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm" placeholder="e.g. Alexandre N.">
        </div>
        <button type="submit" class="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs mt-4">
          Save Project
        </button>
      </form>
    `);
  },

  handleAddProjectSubmit(e) {
    e.preventDefault();
    const fd = new FormData(e.target);
    Store.addItem(STORAGE_KEYS.PROJECTS, {
      name: fd.get('name'),
      client: fd.get('client'),
      stage: fd.get('stage'),
      status: 'In Progress',
      budget: fd.get('budget'),
      deadline: fd.get('deadline'),
      lead: fd.get('lead'),
      priority: 'High',
      completion: 10
    });
    this.closeGenericModal();
    this.showToast('Project registered successfully!', 'success');
    this.render();
  },

  openAddClientModal() {
    this.openGenericModal('Register Enterprise Client', `
      <form id="generic-form" onsubmit="UI.handleAddClientSubmit(event)" class="space-y-4">
        <div>
          <label class="block text-xs font-semibold text-slate-300 mb-1">Client Company Name</label>
          <input required name="name" class="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm" placeholder="e.g. Safaricom Telecommunications">
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-semibold text-slate-300 mb-1">Industry Sector</label>
            <input required name="industry" class="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm" placeholder="e.g. Telecommunications">
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-300 mb-1">Location</label>
            <input required name="location" class="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm" placeholder="e.g. Nairobi, Kenya">
          </div>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-semibold text-slate-300 mb-1">Primary Contact</label>
            <input required name="contactPerson" class="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm" placeholder="e.g. Amina Hassan">
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-300 mb-1">Contact Email</label>
            <input required type="email" name="email" class="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm" placeholder="amina@safaricom.co.ke">
          </div>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-semibold text-slate-300 mb-1">Phone Number</label>
            <input required name="phone" class="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm" placeholder="+254 700 000 000">
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-300 mb-1">Contract Value</label>
            <input required name="contractValue" class="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm" placeholder="$350,000">
          </div>
        </div>
        <button type="submit" class="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs mt-4">
          Add Client to Directory
        </button>
      </form>
    `);
  },

  handleAddClientSubmit(e) {
    e.preventDefault();
    const fd = new FormData(e.target);
    Store.addItem(STORAGE_KEYS.CLIENTS, {
      name: fd.get('name'),
      industry: fd.get('industry'),
      contactPerson: fd.get('contactPerson'),
      email: fd.get('email'),
      phone: fd.get('phone'),
      status: 'Active',
      contractValue: fd.get('contractValue'),
      activeProjects: 1,
      location: fd.get('location')
    });
    this.closeGenericModal();
    this.showToast('Client successfully registered!', 'success');
    this.render();
  },

  openAddEmployeeModal() {
    this.openGenericModal('Add Active Team Member', `
      <form id="generic-form" onsubmit="UI.handleAddEmployeeSubmit(event)" class="space-y-4">
        <div>
          <label class="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
          <input required name="name" class="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm" placeholder="e.g. Eric Karangwa">
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-semibold text-slate-300 mb-1">Role / Job Title</label>
            <input required name="role" class="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm" placeholder="e.g. Backend Engineer">
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-300 mb-1">Department</label>
            <select name="department" class="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm">
              <option value="Engineering">Engineering</option>
              <option value="Cybersecurity">Cybersecurity</option>
              <option value="Product Management">Product Management</option>
              <option value="Infrastructure">Infrastructure</option>
              <option value="Design">Design</option>
            </select>
          </div>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-semibold text-slate-300 mb-1">Company Email</label>
            <input required type="email" name="email" class="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm" placeholder="e.g. eric@domari.com">
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-300 mb-1">Location</label>
            <input required name="location" class="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm" placeholder="Kigali HQ">
          </div>
        </div>
        <button type="submit" class="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs mt-4">
          Add Team Member
        </button>
      </form>
    `);
  },

  handleAddEmployeeSubmit(e) {
    e.preventDefault();
    const fd = new FormData(e.target);
    Store.addItem(STORAGE_KEYS.EMPLOYEES, {
      name: fd.get('name'),
      role: fd.get('role'),
      department: fd.get('department'),
      email: fd.get('email'),
      status: 'Active',
      joinDate: new Date().toISOString().split('T')[0],
      location: fd.get('location'),
      type: 'Full-time',
      projectsCount: 1
    });
    this.closeGenericModal();
    this.showToast('Team member added to directory!', 'success');
    this.render();
  },

  openAddPastEmployeeModal() {
    this.openGenericModal('Archive Personnel & Contractor Record', `
      <form id="generic-form" onsubmit="UI.handleAddPastEmployeeSubmit(event)" class="space-y-4">
        <div>
          <label class="block text-xs font-semibold text-slate-300 mb-1">Individual Name</label>
          <input required name="name" class="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm" placeholder="e.g. Samuel Mutabazi">
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-semibold text-slate-300 mb-1">Former Role</label>
            <input required name="formerRole" class="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm" placeholder="Senior Security Auditor">
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-300 mb-1">Engagement Type</label>
            <input required name="engagementType" class="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm" placeholder="Contractor (Confidential)">
          </div>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-semibold text-slate-300 mb-1">Period of Engagement</label>
            <input required name="period" class="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm" placeholder="Jan 2024 - Dec 2024">
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-300 mb-1">Performance Rating</label>
            <input required name="performanceScore" class="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm" placeholder="9.5 / 10">
          </div>
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-300 mb-1">Projects Worked On</label>
          <input required name="projectsWorkedOn" class="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm" placeholder="FraudShield v1, Bank of Kigali PenTest">
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-semibold text-slate-300 mb-1">Clearance Level</label>
            <input required name="clearanceLevel" class="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm" placeholder="Level 3 Confidential">
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-300 mb-1">Contact Email</label>
            <input required name="currentContact" class="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm" placeholder="samuel@external-consult.com">
          </div>
        </div>
        <button type="submit" class="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs mt-4">
          Archive Record
        </button>
      </form>
    `);
  },

  handleAddPastEmployeeSubmit(e) {
    e.preventDefault();
    const fd = new FormData(e.target);
    Store.addItem(STORAGE_KEYS.PAST_EMPLOYEES, {
      name: fd.get('name'),
      formerRole: fd.get('formerRole'),
      engagementType: fd.get('engagementType'),
      period: fd.get('period'),
      performanceScore: fd.get('performanceScore'),
      projectsWorkedOn: fd.get('projectsWorkedOn'),
      clearanceLevel: fd.get('clearanceLevel'),
      currentContact: fd.get('currentContact'),
      status: 'Alumni Network'
    });
    this.closeGenericModal();
    this.showToast('Personnel archive record created.', 'success');
    this.render();
  },

  openAddCredentialModal() {
    this.openGenericModal('Store Secret in Credentials Vault', `
      <form id="generic-form" onsubmit="UI.handleAddCredentialSubmit(event)" class="space-y-4">
        <div>
          <label class="block text-xs font-semibold text-slate-300 mb-1">Secret / Credential Name</label>
          <input required name="title" class="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm" placeholder="e.g. Production Stripe Secret Key">
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-semibold text-slate-300 mb-1">Target Service / Subsystem</label>
            <input required name="service" class="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm" placeholder="Stripe Payments API">
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-300 mb-1">Environment</label>
            <select name="environment" class="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm">
              <option value="Production">Production</option>
              <option value="Staging">Staging</option>
              <option value="Development">Development</option>
            </select>
          </div>
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-300 mb-1">Username / Key Identifier</label>
          <input required name="username" class="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm" placeholder="sk_live_master_zeus">
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-300 mb-1">Secret Value / Token</label>
          <input required name="secret" type="password" class="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm font-mono" placeholder="Secret Token Value">
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-300 mb-1">Access Notes & CIDR Restrictions</label>
          <input name="notes" class="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm" placeholder="Restricted to production VPC subnet.">
        </div>
        <button type="submit" class="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs mt-4">
          Store in Vault
        </button>
      </form>
    `);
  },

  handleAddCredentialSubmit(e) {
    e.preventDefault();
    const fd = new FormData(e.target);
    const user = Auth.getCurrentUser();
    Store.addItem(STORAGE_KEYS.CREDENTIALS, {
      title: fd.get('title'),
      service: fd.get('service'),
      environment: fd.get('environment'),
      username: fd.get('username'),
      secret: fd.get('secret'),
      notes: fd.get('notes') || 'Secured key',
      lastUpdated: new Date().toISOString().split('T')[0],
      updatedBy: user ? user.name : 'Security Admin'
    });
    this.closeGenericModal();
    this.showToast('Secret safely encrypted and stored in vault.', 'success');
    this.render();
  },

  openAddDocumentModal() {
    this.openGenericModal('Register Important Document', `
      <form id="generic-form" onsubmit="UI.handleAddDocumentSubmit(event)" class="space-y-4">
        <div>
          <label class="block text-xs font-semibold text-slate-300 mb-1">Document Title</label>
          <input required name="title" class="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm" placeholder="e.g. Master Services Agreement 2026">
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-semibold text-slate-300 mb-1">Category</label>
            <select name="category" class="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm">
              <option value="Compliance & Security">Compliance & Security</option>
              <option value="Legal & Contracts">Legal & Contracts</option>
              <option value="Engineering Architecture">Engineering Architecture</option>
              <option value="Finance">Finance</option>
              <option value="Human Resources">Human Resources</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-300 mb-1">File Format</label>
            <select name="fileType" class="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm font-mono">
              <option value="PDF">PDF</option>
              <option value="DOCX">DOCX</option>
              <option value="XLSX">XLSX</option>
              <option value="MARKDOWN">MARKDOWN</option>
            </select>
          </div>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-semibold text-slate-300 mb-1">Classification Level</label>
            <select name="accessLevel" class="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm">
              <option value="Confidential">Confidential</option>
              <option value="Restricted">Restricted</option>
              <option value="Internal">Internal</option>
              <option value="Company Wide">Company Wide</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-300 mb-1">File Size</label>
            <input required name="size" class="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm" placeholder="e.g. 3.2 MB">
          </div>
        </div>
        <button type="submit" class="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs mt-4">
          Register Document
        </button>
      </form>
    `);
  },

  handleAddDocumentSubmit(e) {
    e.preventDefault();
    const fd = new FormData(e.target);
    const user = Auth.getCurrentUser();
    Store.addItem(STORAGE_KEYS.DOCUMENTS, {
      title: fd.get('title'),
      category: fd.get('category'),
      fileType: fd.get('fileType'),
      size: fd.get('size'),
      updatedAt: new Date().toISOString().split('T')[0],
      author: user ? user.name : 'Authorized Lead',
      accessLevel: fd.get('accessLevel'),
      isPinned: false
    });
    this.closeGenericModal();
    this.showToast('Document registered in repository.', 'success');
    this.render();
  },

  openAddInternModal() {
    this.openGenericModal('Register Internship Candidate', `
      <form id="generic-form" onsubmit="UI.handleAddInternSubmit(event)" class="space-y-4">
        <div>
          <label class="block text-xs font-semibold text-slate-300 mb-1">Candidate Name</label>
          <input required name="candidateName" class="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm" placeholder="e.g. Keza Umwali">
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-semibold text-slate-300 mb-1">Academic Institution</label>
            <input required name="institution" class="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm" placeholder="e.g. Rwanda Coding Academy">
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-300 mb-1">Track / Focus</label>
            <input required name="track" class="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm" placeholder="e.g. Full-Stack / DevOps">
          </div>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-semibold text-slate-300 mb-1">Email</label>
            <input required type="email" name="email" class="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm" placeholder="candidate@school.edu">
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-300 mb-1">Assigned Mentor</label>
            <input required name="mentor" class="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm" placeholder="e.g. Diane Kalisa">
          </div>
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-300 mb-1">Initial Project Assigned</label>
          <input required name="assignedProject" class="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm" placeholder="e.g. Ikirezi Routing Optimization">
        </div>
        <button type="submit" class="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs mt-4">
          Register Candidate
        </button>
      </form>
    `);
  },

  handleAddInternSubmit(e) {
    e.preventDefault();
    const fd = new FormData(e.target);
    Store.addItem(STORAGE_KEYS.INTERNSHIPS, {
      candidateName: fd.get('candidateName'),
      institution: fd.get('institution'),
      track: fd.get('track'),
      email: fd.get('email'),
      status: 'Reviewing',
      appliedDate: new Date().toISOString().split('T')[0],
      mentor: fd.get('mentor'),
      assignedProject: fd.get('assignedProject'),
      evaluationScore: 'Pending',
      gpa: '3.8 / 4.0'
    });
    this.closeGenericModal();
    this.showToast('Candidate application submitted!', 'success');
    this.render();
  },

  openAddTemplateModal() {
    this.openGenericModal('Create New Enterprise Template', `
      <form id="generic-form" onsubmit="UI.handleAddTemplateSubmit(event)" class="space-y-4">
        <div>
          <label class="block text-xs font-semibold text-slate-300 mb-1">Template Title</label>
          <input required name="title" class="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm" placeholder="e.g. Software Service Level Agreement (SLA)">
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-semibold text-slate-300 mb-1">Category</label>
            <input required name="category" class="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm" placeholder="Legal & SLAs">
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-300 mb-1">Format</label>
            <input required name="format" class="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm font-mono" placeholder="Markdown / Docx">
          </div>
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-300 mb-1">Description</label>
          <textarea required name="description" rows="3" class="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm" placeholder="Details and usage instructions..."></textarea>
        </div>
        <button type="submit" class="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs mt-4">
          Save Template
        </button>
      </form>
    `);
  },

  handleAddTemplateSubmit(e) {
    e.preventDefault();
    const fd = new FormData(e.target);
    Store.addItem(STORAGE_KEYS.TEMPLATES, {
      title: fd.get('title'),
      category: fd.get('category'),
      format: fd.get('format'),
      description: fd.get('description'),
      downloadsCount: 0,
      lastUpdated: new Date().toISOString().split('T')[0]
    });
    this.closeGenericModal();
    this.showToast('Template added to catalog!', 'success');
    this.render();
  },

  openAddUserModal() {
    this.openGenericModal('Add Authorized User', `
      <form id="generic-form" onsubmit="UI.handleAddUserSubmit(event)" class="space-y-4">
        <div>
          <label class="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
          <input required name="name" class="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm" placeholder="e.g. Christian K.">
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-300 mb-1">Company Account Email</label>
          <input required type="email" name="email" class="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm" placeholder="christian@domari.com or ikirezi or fraudshield">
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-semibold text-slate-300 mb-1">Role</label>
            <select name="role" class="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm">
              <option value="Admin">Admin</option>
              <option value="Manager">Manager</option>
              <option value="Engineer">Engineer</option>
              <option value="Viewer">Viewer</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-300 mb-1">Department</label>
            <input required name="department" class="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm" placeholder="Engineering">
          </div>
        </div>
        <button type="submit" class="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs mt-4">
          Grant User Access
        </button>
      </form>
    `);
  },

  handleAddUserSubmit(e) {
    e.preventDefault();
    const fd = new FormData(e.target);
    const email = fd.get('email');
    if (!Auth.isCompanyEmail(email)) {
      alert('Error: Email must be a company account (@domari, @ikirezi, @fraudshield, etc.)');
      return;
    }
    Store.addItem(STORAGE_KEYS.USERS, {
      name: fd.get('name'),
      email: email,
      role: fd.get('role'),
      domain: email.split('@')[1],
      department: fd.get('department'),
      status: 'Active',
      lastLogin: 'Never'
    });
    this.closeGenericModal();
    this.showToast('Authorized user access granted.', 'success');
    this.render();
  },

  openAddDomainModal() {
    const domains = Store.getAllowedDomains();
    this.openGenericModal('Manage Authorized Company Domains', `
      <div class="space-y-4">
        <p class="text-xs text-slate-400">
          Only team accounts ending with these authorized company domains can log in to Zeus.
        </p>
        <div class="space-y-2">
          ${domains.map(d => `
            <div class="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-emerald-400 flex items-center justify-between">
              <span>@${d}</span>
              <span class="text-[10px] text-slate-500 uppercase">Authorized</span>
            </div>
          `).join('')}
        </div>
        <div class="pt-3 border-t border-slate-800">
          <label class="block text-xs font-semibold text-slate-300 mb-1">Add Another Company Domain</label>
          <div class="flex gap-2">
            <input id="new-domain-input" type="text" placeholder="e.g. mycompany.com" class="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm">
            <button onclick="UI.handleAddDomain()" class="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold">
              Add
            </button>
          </div>
        </div>
      </div>
    `);
  },

  handleAddDomain() {
    const input = document.getElementById('new-domain-input');
    if (!input || !input.value.trim()) return;
    Store.addAllowedDomain(input.value.trim());
    this.closeGenericModal();
    this.showToast('Company domain added to whitelist!', 'success');
    this.render();
  },

  openGenericModal(title, bodyHtml) {
    const modal = document.getElementById('generic-modal');
    const modalTitle = document.getElementById('generic-modal-title');
    const modalBody = document.getElementById('generic-modal-body');

    if (modalTitle) modalTitle.textContent = title;
    if (modalBody) modalBody.innerHTML = bodyHtml;

    if (modal) {
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    }
  },

  closeGenericModal() {
    const modal = document.getElementById('generic-modal');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  }
};
