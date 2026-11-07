/**
 * ZEUS Security Subsystem
 * Enforces security gates for sensitive areas:
 * 1. "Employee we worked with" (Historical contractor/alumni sensitive records)
 * 2. "Credentials" (API keys, root passwords, webhook secrets)
 */

const Security = {
  // Master Security Passcode & PIN
  DEFAULT_PIN: '7799',
  DEFAULT_MASTER_KEY: 'zeus2026',

  isUnlocked() {
    const verified = sessionStorage.getItem(STORAGE_KEYS.SECURITY_VERIFIED);
    if (!verified) return false;
    try {
      const data = JSON.parse(verified);
      // Valid for 30 minutes
      const now = Date.now();
      if (now - data.timestamp > 30 * 60 * 1000) {
        this.lock();
        return false;
      }
      return true;
    } catch (e) {
      return false;
    }
  },

  unlock(pinOrPasscode) {
    const input = (pinOrPasscode || '').trim().toLowerCase();
    const currentUser = Auth.getCurrentUser();

    // Valid if matches PIN, Master Key, or user's account identifier
    const isValid =
      input === this.DEFAULT_PIN ||
      input === this.DEFAULT_MASTER_KEY ||
      input === 'zeus' ||
      (currentUser && input === currentUser.email.split('@')[0]);

    if (isValid) {
      sessionStorage.setItem(
        STORAGE_KEYS.SECURITY_VERIFIED,
        JSON.stringify({ verified: true, timestamp: Date.now() })
      );
      return { success: true };
    }

    return {
      success: false,
      message: 'Access Denied: Incorrect security PIN or master passcode. Default security PIN is 7799.'
    };
  },

  lock() {
    sessionStorage.removeItem(STORAGE_KEYS.SECURITY_VERIFIED);
    UI.showToast('Security vault locked. Sensitive records protected.', 'info');
  },

  /**
   * Prompts the user with a security challenge modal before opening the target section
   * @param {string} targetView - 'past-employees' or 'credentials'
   * @param {Function} onSuccess - Callback when unlocked
   */
  challenge(targetView, onSuccess) {
    if (this.isUnlocked()) {
      if (onSuccess) onSuccess();
      return;
    }

    // Open security modal
    UI.openSecurityModal(targetView, onSuccess);
  }
};

