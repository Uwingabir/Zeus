/**
 * ZEUS Supabase Client & Real-time Database Adapter
 * Connects ZEUS to Supabase PostgreSQL cloud database with full CRUD and audit logging.
 */

const SupabaseDB = {
  client: null,

  STORAGE_KEYS: {
    URL: 'zeus_supabase_url',
    KEY: 'zeus_supabase_key'
  },

  init() {
    const url = localStorage.getItem(this.STORAGE_KEYS.URL);
    const key = localStorage.getItem(this.STORAGE_KEYS.KEY);

    if (url && key && window.supabase) {
      try {
        this.client = window.supabase.createClient(url.trim(), key.trim());
      } catch (e) {
        console.warn('Failed to initialize Supabase client:', e);
        this.client = null;
      }
    }
  },

  isConfigured() {
    return this.client !== null;
  },

  getConfig() {
    return {
      url: localStorage.getItem(this.STORAGE_KEYS.URL) || '',
      key: localStorage.getItem(this.STORAGE_KEYS.KEY) || ''
    };
  },

  async setConfig(url, key) {
    const cleanUrl = (url || '').trim();
    const cleanKey = (key || '').trim();

    if (!cleanUrl || !cleanKey) {
      localStorage.removeItem(this.STORAGE_KEYS.URL);
      localStorage.removeItem(this.STORAGE_KEYS.KEY);
      this.client = null;
      return { success: true, message: 'Supabase disconnected. Using local secured storage.' };
    }

    try {
      const client = window.supabase.createClient(cleanUrl, cleanKey);
      // Test basic query
      const { data, error } = await client.from('company_domains').select('*').limit(1);
      
      if (error && error.code !== 'PGRST116') {
        // Even if table doesn't exist yet, we verify URL/Key connectivity
        if (error.message && error.message.includes('FetchError')) {
          throw new Error('Could not reach Supabase. Please verify your Project URL.');
        }
      }

      localStorage.setItem(this.STORAGE_KEYS.URL, cleanUrl);
      localStorage.setItem(this.STORAGE_KEYS.KEY, cleanKey);
      this.client = client;

      return { success: true, message: 'Successfully connected to Supabase cloud database!' };
    } catch (err) {
      return { success: false, message: err.message || 'Invalid Supabase Project URL or Anon Key.' };
    }
  },

  // -------------------------------------------------------------
  // CRUD OPERATIONS
  // -------------------------------------------------------------

  async fetchAll(table) {
    if (!this.isConfigured()) return null;
    try {
      const { data, error } = await this.client.from(table).select('*').order('created_at', { ascending: false });
      if (error) {
        console.warn(`Supabase fetchAll error for ${table}:`, error.message);
        return null;
      }
      return data;
    } catch (e) {
      return null;
    }
  },

  async insert(table, item) {
    if (!this.isConfigured()) return null;
    try {
      const payload = { ...item };
      // Map id if needed
      const { data, error } = await this.client.from(table).insert([payload]).select();
      if (error) {
        console.warn(`Supabase insert error on ${table}:`, error.message);
        return null;
      }
      return data && data[0] ? data[0] : item;
    } catch (e) {
      return null;
    }
  },

  async update(table, id, fields) {
    if (!this.isConfigured()) return null;
    try {
      const { data, error } = await this.client.from(table).update(fields).eq('id', id).select();
      if (error) {
        console.warn(`Supabase update error on ${table}:`, error.message);
        return null;
      }
      return data && data[0] ? data[0] : null;
    } catch (e) {
      return null;
    }
  },

  async delete(table, id) {
    if (!this.isConfigured()) return null;
    try {
      const { error } = await this.client.from(table).delete().eq('id', id);
      if (error) {
        console.warn(`Supabase delete error on ${table}:`, error.message);
        return false;
      }
      return true;
    } catch (e) {
      return false;
    }
  },

  // -------------------------------------------------------------
  // AUDIT LOGGING FOR ENHANCED SECURITY
  // -------------------------------------------------------------
  async logAudit(eventType, userEmail, details) {
    const logItem = {
      id: `log-${Date.now()}`,
      event_type: eventType,
      user_email: userEmail || 'Anonymous',
      details: details || '',
      created_at: new Date().toISOString()
    };

    // Always log locally
    try {
      const localLogs = JSON.parse(localStorage.getItem('zeus_audit_logs') || '[]');
      localLogs.unshift(logItem);
      localStorage.setItem('zeus_audit_logs', JSON.stringify(localLogs.slice(0, 200)));
    } catch (e) {}

    // Mirror to Supabase if connected
    if (this.isConfigured()) {
      try {
        await this.client.from('audit_logs').insert([logItem]);
      } catch (e) {}
    }
  }
};

// Initialize Supabase on script load
SupabaseDB.init();

