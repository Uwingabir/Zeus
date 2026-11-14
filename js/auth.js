/**
 * ZEUS Authentication & Access Control Module
 * Supports account registration, company domain verification (@domari, @ikirezi, @fraudshield),
 * password strength enforcement, brute-force defense, and session governance.
 */

const Auth = {
  loginAttempts: 0,
  maxLoginAttempts: 5,
  lockoutTimestamp: 0,

  getCurrentUser() {
    try {
      const user = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      return user ? JSON.parse(user) : null;
    } catch (e) {
      return null;
    }
  },

  isAuthenticated() {
    return this.getCurrentUser() !== null;
  },

  isCompanyEmail(email) {
    if (!email || !email.includes('@')) return false;

    const parts = email.trim().toLowerCase().split('@');
    if (parts.length !== 2) return false;

    const domainPart = parts[1];
    const allowed = Store.getAllowedDomains();

    return allowed.some(allowedDomain => {
      return domainPart === allowedDomain ||
             domainPart.startsWith(allowedDomain + '.') ||
             domainPart.split('.')[0] === allowedDomain;
    });
  },

  getCompanyBrand(email) {
    const domain = (email.split('@')[1] || '').toLowerCase();
    if (domain.includes('domari')) return { name: 'Domari Technologies', color: 'indigo', badge: 'DOMARI' };
    if (domain.includes('ikirezi')) return { name: 'Ikirezi Ventures', color: 'emerald', badge: 'IKIREZI' };
    if (domain.includes('fraudshield')) return { name: 'FraudShield AI', color: 'purple', badge: 'FRAUDSHIELD' };
    return { name: 'Enterprise Partner', color: 'blue', badge: 'PARTNER' };
  },

  // Check login rate limiting
  isLoginLocked() {
    const now = Date.now();
    if (now < this.lockoutTimestamp) {
      const remainingSec = Math.ceil((this.lockoutTimestamp - now) / 1000);
      return { locked: true, remainingSec };
    }
    return { locked: false, remainingSec: 0 };
  },

  /**
   * CREATE ACCOUNT / REGISTRATION
   * Before signing in, users create an authorized company account.
   */
  async register({ name, email, password, confirmPassword, role, department }) {
    const trimmedEmail = (email || '').trim().toLowerCase();
    const trimmedName = (name || '').trim();

    // 1. Basic validation
    if (!trimmedName || !trimmedEmail || !password) {
      return { success: false, message: 'Please complete all required fields.' };
    }

    if (password !== confirmPassword) {
      return { success: false, message: 'Passwords do not match. Please re-enter.' };
    }

    // 2. Strong Password Requirements (Security)
    if (password.length < 8 || !/\d/.test(password) || !/[a-zA-Z]/.test(password)) {
      return {
        success: false,
        message: 'Security Requirement: Password must be at least 8 characters long and contain both letters and numbers.'
      };
    }

    // 3. Company Domain Enforcement
    if (!this.isCompanyEmail(trimmedEmail)) {
      return {
        success: false,
        message: 'Registration Denied: You must use an authorized company account (@domari, @ikirezi, @fraudshield).'
      };
    }

    // 4. Check if account already exists
    const users = Store.getUsers();
    if (users.some(u => u.email.toLowerCase() === trimmedEmail)) {
      return {
        success: false,
        message: 'An account with this company email already exists. Please sign in instead.'
      };
    }

    // 5. Create new corporate profile
    const brand = this.getCompanyBrand(trimmedEmail);
    const domain = trimmedEmail.split('@')[1];
    const newUser = {
      id: `usr-${Date.now()}`,
      name: trimmedName,
      email: trimmedEmail,
      role: role || 'Team Member',
      domain: domain,
      department: department || brand.name,
      status: 'Active',
      lastLogin: 'Just registered',
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(trimmedName)}`
    };

    // Save to store & Supabase
    users.push(newUser);
    Store.setUsers(users);

    if (SupabaseDB.isConfigured()) {
      SupabaseDB.insert('users', newUser);
    }

    SupabaseDB.logAudit('USER_REGISTERED', trimmedEmail, `New account created: ${trimmedName} (${domain})`);

    // Automatically set session
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(newUser));
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, 'tok_' + Math.random().toString(36).substring(2));

    return {
      success: true,
      user: newUser,
      message: 'Account successfully registered!'
    };
  },

  /**
   * SIGN IN TO WORKSPACE
   */
  async login(email, password) {
    const lock = this.isLoginLocked();
    if (lock.locked) {
      return {
        success: false,
        message: `Too many failed login attempts. Workspace locked for ${lock.remainingSec}s.`
      };
    }

    const trimmedEmail = (email || '').trim().toLowerCase();

    if (!trimmedEmail || !password) {
      return { success: false, message: 'Please provide both your company email and password.' };
    }

    // Validate domain
    if (!this.isCompanyEmail(trimmedEmail)) {
      return {
        success: false,
        message: 'Access Restricted: You must use an authorized company account (@domari, @ikirezi, @fraudshield).'
      };
    }

    // Verify user profile
    const users = Store.getUsers();
    let user = users.find(u => u.email.toLowerCase() === trimmedEmail);

    if (!user) {
      // User must first create an account as requested!
      this.loginAttempts++;
      if (this.loginAttempts >= this.maxLoginAttempts) {
        this.lockoutTimestamp = Date.now() + 60 * 1000;
        this.loginAttempts = 0;
      }
      return {
        success: false,
        message: 'Account not found. Please click "Create Account" first to register your company profile.'
      };
    }

    // Success
    this.loginAttempts = 0;
    user.lastLogin = 'Just now';
    Store.updateItem(STORAGE_KEYS.USERS, user.id, { lastLogin: 'Just now' });

    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, 'tok_' + Math.random().toString(36).substring(2));

    SupabaseDB.logAudit('LOGIN_SUCCESS', trimmedEmail, 'Signed in to Zeus workspace');

    return { success: true, user };
  },

  logout() {
    const user = this.getCurrentUser();
    if (user) {
      SupabaseDB.logAudit('LOGOUT', user.email, 'User logged out');
    }
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    Security.lock('Session closed.');
    window.location.hash = '';
    App.render();
  }
};
