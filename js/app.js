/**
 * ZEUS Main Application Controller
 * Handles application lifecycle, routing, command palette (Ctrl+K), authentication tabs,
 * and Supabase cloud synchronization.
 */

const App = {
  commandsList: [
    { id: 'dashboard', label: 'Go to Dashboard', category: 'Navigation', icon: 'layout-dashboard', action: () => UI.navigate('dashboard') },
    { id: 'projects', label: 'Go to Projects Portfolio', category: 'Navigation', icon: 'folder-kanban', action: () => UI.navigate('projects') },
    { id: 'clients', label: 'Go to Clients Directory', category: 'Navigation', icon: 'building-2', action: () => UI.navigate('clients') },
    { id: 'employees', label: 'Go to Employees & Alumni', category: 'Navigation', icon: 'users', action: () => UI.navigate('employees') },
    { id: 'documents', label: 'Go to Important Documents', category: 'Navigation', icon: 'file-text', action: () => UI.navigate('documents') },
    { id: 'templates', label: 'Go to Enterprise Templates', category: 'Navigation', icon: 'file-code', action: () => UI.navigate('templates') },
    { id: 'internships', label: 'Go to Internship Pipeline', category: 'Navigation', icon: 'graduation-cap', action: () => UI.navigate('internships') },
    { id: 'credentials', label: 'Open Credentials Vault', category: 'Security Restricted', icon: 'key-round', action: () => UI.navigate('credentials') },
    { id: 'users', label: 'Manage Users & Roles', category: 'Navigation', icon: 'user-check', action: () => UI.navigate('users') },
    { id: 'supabase-settings', label: 'Configure Supabase Cloud Database', category: 'Database', icon: 'database', action: () => UI.openSupabaseModal() },
    { id: 'add-project', label: 'Create New Project', category: 'Quick Action', icon: 'plus-circle', action: () => UI.openAddProjectModal() },
    { id: 'add-client', label: 'Register New Enterprise Client', category: 'Quick Action', icon: 'plus-circle', action: () => UI.openAddClientModal() },
    { id: 'add-employee', label: 'Add Person Record', category: 'Quick Action', icon: 'user-plus', action: () => UI.openAddEmployeeModal() },
    { id: 'lock-vault', label: 'Lock Security Vault', category: 'Security', icon: 'lock', action: () => { Security.lock(); UI.render(); } },
    { id: 'logout', label: 'Sign Out / Logout', category: 'System', icon: 'log-out', action: () => App.confirmLogout() }
  ],

  init() {
    // 1. Initial State & Store Check
    Store.init();

    // 2. Hash Routing
    const initialHash = window.location.hash.replace('#', '');
    if (initialHash && ['dashboard', 'projects', 'clients', 'employees', 'documents', 'templates', 'internships', 'credentials', 'users'].includes(initialHash)) {
      UI.activeView = initialHash;
    } else {
      UI.activeView = 'dashboard';
    }

    window.addEventListener('hashchange', () => {
      const hash = window.location.hash.replace('#', '');
      if (hash && hash !== UI.activeView) {
        UI.navigate(hash);
      }
    });

    // 3. Bind Global Events
    this.bindEvents();

    // 4. Initial Render
    this.render();
  },

  render() {
    UI.render();
  },

  switchAuthTab(tab) {
    const regForm = document.getElementById('register-form');
    const loginForm = document.getElementById('login-form');
    const tabBtnReg = document.getElementById('tab-btn-register');
    const tabBtnLogin = document.getElementById('tab-btn-login');
    const errEl = document.getElementById('auth-error');
    const succEl = document.getElementById('auth-success');

    if (errEl) errEl.classList.add('hidden');
    if (succEl) succEl.classList.add('hidden');

    if (tab === 'register') {
      if (regForm) regForm.classList.remove('hidden');
      if (loginForm) loginForm.classList.add('hidden');
      if (tabBtnReg) {
        tabBtnReg.className = 'flex-1 py-2 rounded-xl text-xs font-bold transition-all bg-indigo-600 text-white shadow-sm flex items-center justify-center gap-1.5';
      }
      if (tabBtnLogin) {
        tabBtnLogin.className = 'flex-1 py-2 rounded-xl text-xs font-semibold transition-all text-slate-400 hover:text-white flex items-center justify-center gap-1.5';
      }
    } else {
      if (regForm) regForm.classList.add('hidden');
      if (loginForm) loginForm.classList.remove('hidden');
      if (tabBtnLogin) {
        tabBtnLogin.className = 'flex-1 py-2 rounded-xl text-xs font-bold transition-all bg-indigo-600 text-white shadow-sm flex items-center justify-center gap-1.5';
      }
      if (tabBtnReg) {
        tabBtnReg.className = 'flex-1 py-2 rounded-xl text-xs font-semibold transition-all text-slate-400 hover:text-white flex items-center justify-center gap-1.5';
      }
    }
  },

  bindEvents() {
    // 1. Account Creation (Register) Submit
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
      registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('reg-name')?.value;
        const email = document.getElementById('reg-email')?.value;
        const role = document.getElementById('reg-role')?.value;
        const department = document.getElementById('reg-department')?.value;
        const password = document.getElementById('reg-password')?.value;
        const confirmPassword = document.getElementById('reg-confirm-password')?.value;

        const errEl = document.getElementById('auth-error');
        const succEl = document.getElementById('auth-success');

        if (errEl) errEl.classList.add('hidden');
        if (succEl) succEl.classList.add('hidden');

        const res = await Auth.register({ name, email, password, confirmPassword, role, department });
        if (res.success) {
          if (succEl) {
            succEl.textContent = res.message;
            succEl.classList.remove('hidden');
          }
          UI.showToast(`Welcome to Zeus, ${res.user.name}! Your account is active.`, 'success');
          setTimeout(() => {
            UI.activeView = 'dashboard';
            this.render();
          }, 600);
        } else {
          if (errEl) {
            errEl.textContent = res.message;
            errEl.classList.remove('hidden');
          }
        }
      });
    }

    // 2. Sign In Submit
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
      loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const emailInput = document.getElementById('login-email');
        const passInput = document.getElementById('login-password');
        const errEl = document.getElementById('auth-error');

        const email = emailInput ? emailInput.value : '';
        const pass = passInput ? passInput.value : '';

        const res = await Auth.login(email, pass);
        if (res.success) {
          if (errEl) errEl.classList.add('hidden');
          UI.showToast(`Welcome back, ${res.user.name}!`, 'success');
          UI.activeView = 'dashboard';
          this.render();
        } else {
          if (errEl) {
            errEl.textContent = res.message;
            errEl.classList.remove('hidden');
          }
          if (emailInput) {
            emailInput.classList.add('border-rose-500');
            setTimeout(() => emailInput.classList.remove('border-rose-500'), 1500);
          }
        }
      });
    }

    // Security PIN Submission on Enter
    const pinInput = document.getElementById('security-pin-input');
    if (pinInput) {
      pinInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          UI.submitSecurityPin();
        }
      });
    }

    // Keyboard Shortcuts: Ctrl+K / Cmd+K for Command Palette, Esc to close
    window.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        this.openCommandPalette();
      }

      if (e.key === 'Escape') {
        this.closeCommandPalette();
        UI.closeSecurityModal();
        UI.closeSupabaseModal();
        UI.closePreviewModal();
        UI.closeGenericModal();
        this.closeLogoutModal();
      }
    });
  },

  // ==========================================
  // COMMAND PALETTE (CTRL+K)
  // ==========================================
  openCommandPalette() {
    if (!Auth.isAuthenticated()) return;
    const modal = document.getElementById('command-palette-modal');
    const input = document.getElementById('command-palette-input');
    if (modal) {
      modal.classList.remove('hidden');
      modal.classList.add('flex');
      if (input) {
        input.value = '';
        input.focus();
      }
      this.filterCommandPalette('');
    }
  },

  closeCommandPalette() {
    const modal = document.getElementById('command-palette-modal');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  },

  filterCommandPalette(query) {
    const container = document.getElementById('command-palette-results');
    if (!container) return;

    const q = (query || '').toLowerCase().trim();
    const filtered = this.commandsList.filter(c =>
      c.label.toLowerCase().includes(q) ||
      c.category.toLowerCase().includes(q)
    );

    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="py-8 text-center text-xs text-slate-500">
          No matching commands or navigation routes found.
        </div>
      `;
      return;
    }

    container.innerHTML = filtered.map((cmd) => `
      <button 
        onclick="App.executeCommand('${cmd.id}')"
        class="w-full px-3 py-2.5 rounded-xl flex items-center justify-between text-left text-xs transition-colors hover:bg-slate-800 focus:bg-slate-800 group">
        <div class="flex items-center gap-3">
          <div class="p-1.5 rounded-lg bg-slate-800 text-slate-400 group-hover:text-indigo-400 group-hover:bg-indigo-500/10">
            <i data-lucide="${cmd.icon}" class="w-4 h-4"></i>
          </div>
          <span class="font-medium text-slate-200 group-hover:text-white">${Security.sanitize(cmd.label)}</span>
        </div>
        <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-slate-500 border border-slate-800">${cmd.category}</span>
      </button>
    `).join('');

    lucide.createIcons({ root: container });
  },

  executeCommand(commandId) {
    const cmd = this.commandsList.find(c => c.id === commandId);
    this.closeCommandPalette();
    if (cmd && cmd.action) {
      cmd.action();
    }
  },

  // Logout Flow
  confirmLogout() {
    const modal = document.getElementById('logout-modal');
    if (modal) {
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    }
  },

  closeLogoutModal() {
    const modal = document.getElementById('logout-modal');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  },

  executeLogout() {
    this.closeLogoutModal();
    Auth.logout();
    UI.showToast('You have been securely logged out.', 'info');
  }
};

// Start application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
