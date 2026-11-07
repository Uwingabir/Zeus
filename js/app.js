/**
 * ZEUS Main Application Controller
 * Handles application lifecycle, routing, event binding, and global modal management.
 */

const App = {
  init() {
    // 1. Initial State & Store Check
    Store.init();

    // 2. Hash Routing
    const initialHash = window.location.hash.replace('#', '');
    if (initialHash && ['dashboard', 'projects', 'clients', 'employees', 'past-employees', 'documents', 'templates', 'internships', 'credentials', 'users'].includes(initialHash)) {
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

  bindEvents() {
    // Login Form Submit
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const emailInput = document.getElementById('login-email');
        const passInput = document.getElementById('login-password');
        const errorEl = document.getElementById('login-error');

        const email = emailInput ? emailInput.value : '';
        const pass = passInput ? passInput.value : '';

        const res = Auth.login(email, pass);
        if (res.success) {
          if (errorEl) errorEl.classList.add('hidden');
          UI.showToast(`Welcome back, ${res.user.name}!`, 'success');
          UI.activeView = 'dashboard';
          this.render();
        } else {
          if (errorEl) {
            errorEl.textContent = res.message;
            errorEl.classList.remove('hidden');
          }
          if (emailInput) {
            emailInput.classList.add('border-rose-500');
            setTimeout(() => emailInput.classList.remove('border-rose-500'), 1500);
          }
        }
      });
    }

    // Quick Login Demo Buttons
    document.querySelectorAll('[data-quick-login]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const brandKey = btn.getAttribute('data-quick-login');
        const res = Auth.quickLogin(brandKey);
        if (res.success) {
          UI.showToast(`Logged in as ${res.user.name} (${res.user.role})`, 'success');
          UI.activeView = 'dashboard';
          this.render();
        }
      });
    });

    // Security PIN Submission on Enter
    const pinInput = document.getElementById('security-pin-input');
    if (pinInput) {
      pinInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          UI.submitSecurityPin();
        }
      });
    }

    // Escape Key to Close Modals
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        UI.closeSecurityModal();
        UI.closePreviewModal();
        UI.closeGenericModal();
        this.closeLogoutModal();
      }
    });
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
  },

  // Reset Demo Data
  resetAllData() {
    if (confirm('Reset all ZEUS records to clean initial demo state?')) {
      Store.resetToDefaults();
      Security.lock();
      UI.showToast('System data successfully restored to factory defaults.', 'success');
      this.render();
    }
  }
};

// Start application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
