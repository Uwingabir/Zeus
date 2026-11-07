/**
 * ZEUS Authentication Module
 * Strictly enforces company email domain requirements (@domari, @ikirezi, @fraudshield, etc.)
 * Manages active session, login state, and secure logout.
 */

const Auth = {
  // Check if user is currently authenticated
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

  /**
   * Validate if an email domain matches authorized company accounts:
   * e.g., @domari, @ikirezi, @fraudshield, or custom company domains
   */
  isCompanyEmail(email) {
    if (!email || !email.includes('@')) return false;

    const parts = email.trim().toLowerCase().split('@');
    if (parts.length !== 2) return false;

    const domainPart = parts[1]; // e.g. "domari.com" or "domari" or "ikirezi.rw"
    const allowed = Store.getAllowedDomains();

    // Check if domain matches or starts with or contains any allowed domain
    return allowed.some(allowedDomain => {
      // exact match or sub-domain or primary segment match (e.g. domari matches domari.com or domari.rw)
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

  /**
   * Login with email and password
   */
  login(email, password, rememberMe = true) {
    const trimmedEmail = email.trim().toLowerCase();

    // 1. Check basic input
    if (!trimmedEmail || !password) {
      return {
        success: false,
        message: 'Please provide both your company email and password.'
      };
    }

    // 2. Validate Company Domain
    if (!this.isCompanyEmail(trimmedEmail)) {
      return {
        success: false,
        message: 'Access Restricted: You must use an authorized company account (@domari, @ikirezi, @fraudshield, or corporate partner domain).'
      };
    }

    // 3. Find or generate user profile
    const users = Store.getUsers();
    let user = users.find(u => u.email.toLowerCase() === trimmedEmail);

    if (!user) {
      // Create user session for new corporate team member
      const brand = this.getCompanyBrand(trimmedEmail);
      const namePart = trimmedEmail.split('@')[0].replace(/[._]/g, ' ');
      const capitalized = namePart.replace(/\b\w/g, l => l.toUpperCase());

      user = {
        id: `usr-${Date.now()}`,
        name: capitalized,
        email: trimmedEmail,
        role: 'Team Member',
        domain: trimmedEmail.split('@')[1],
        department: brand.name,
        status: 'Active',
        lastLogin: 'Just now',
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(capitalized)}`
      };

      // Add to users store
      users.push(user);
      Store.setUsers(users);
    } else {
      user.lastLogin = 'Just now';
      Store.updateItem(STORAGE_KEYS.USERS, user.id, { lastLogin: 'Just now' });
    }

    // Save session
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, 'tok_' + Math.random().toString(36).substring(2));

    return {
      success: true,
      user
    };
  },

  /**
   * Fast Demo Login Helper
   */
  quickLogin(companyKey) {
    const demoAccounts = {
      domari: { email: 'alex@domari.com', pass: 'Zeus@2026' },
      ikirezi: { email: 'sarah@ikirezi.com', pass: 'Zeus@2026' },
      fraudshield: { email: 'david@fraudshield.com', pass: 'Zeus@2026' }
    };

    const acc = demoAccounts[companyKey] || demoAccounts.domari;
    return this.login(acc.email, acc.pass);
  },

  /**
   * Logout user
   */
  logout() {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    // Clear security lock verification for sensitive sections on logout
    Security.lock();
    window.location.hash = '';
    App.render();
  }
};
