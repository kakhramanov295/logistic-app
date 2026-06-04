import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Hexagon } from 'lucide-react';

const SUPABASE_URL = "https://vcjyiihovljzkcpsxpwz.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_NemRADDZEtihhs7fCJ5acA_8h0jVARB";


const USERS = [
  { username: 'admin', password: 'admin123', role: 'Admin', name: 'Users' },
  { username: 'manager', password: 'manager123', role: 'Manager', name: 'Users' },
  { username: 'user', password: 'user123', role: 'User', name: 'Users' },
  { username: 'almazgravity@gmail.com', password: 'Almazaltushka6769?', role: 'Admin', name: 'Users' },
  { username: 'almazgravity', password: 'Almazaltushka6769?', role: 'Admin', name: 'Users' },
];

function LoginPage({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [blockedUser, setBlockedUser] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // 1. Local fallback login check
    const localUser = USERS.find(
      (u) => u.username === username && u.password === password
    );
    if (localUser) {
      setTimeout(() => {
        onLogin(localUser);
      }, 500);
      return;
    }

    // 2. Supabase Auth login
    try {
      const email = username.includes('@') ? username : `${username}@gmail.com`;
      const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error_description || errData.error || "Login yoki parol noto'g'ri.");
      }

      const data = await response.json();
      const sbUser = data.user;
      
      let role = sbUser.user_metadata?.role || (email.startsWith('admin') ? 'Admin' : 'User');
      let name = sbUser.user_metadata?.name || 'Users';
      let blocked = false;

      try {
        const profileRes = await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${sbUser.id}&select=*`, {
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${data.access_token}`
          }
        });
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          if (profileData && profileData[0]) {
            blocked = !!profileData[0].blocked;
            if (profileData[0].role) role = profileData[0].role;
            if (profileData[0].name) name = profileData[0].name;
          }
        }
      } catch (err) {
        console.warn("Could not fetch user profile details:", err);
      }

      if (blocked) {
        setLoading(false);
        setBlockedUser({ name, email: sbUser.email });
        return;
      }

      onLogin({
        id: sbUser.id,
        username: sbUser.email.split('@')[0],
        email: sbUser.email,
        role: role,
        name: name,
        token: data.access_token,
        blocked: false
      });
    } catch (err) {
      let errMsg = err.message || "Tizimga kirishda xatolik yuz berdi.";
      if (errMsg.toLowerCase().includes("confirm") || errMsg.toLowerCase().includes("verify") || errMsg.toLowerCase().includes("verified")) {
        errMsg = "Email manzili tasdiqlanmagan. Iltimos, Supabase sozlamalarida 'Confirm email'ni o'chiring yoki ushbu foydalanuvchining emailini tasdiqlang.";
      }
      setError(errMsg);
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    // Redirects to Supabase Google OAuth endpoint
    const redirectUrl = `${window.location.origin}`;
    window.location.href = `${SUPABASE_URL}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(redirectUrl)}`;
  };

  return (
    <div className="login-page">
      {/* Animated background blobs */}
      <div className="login-blob login-blob-1" />
      <div className="login-blob login-blob-2" />
      <div className="login-blob login-blob-3" />

      {/* Full-screen loading overlay when login request is in progress */}
      {loading && (
        <motion.div
          className="app-loading-screen"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.25 }}
          style={{ zIndex: 9998 }}
        >
          <div className="app-loading-blob app-loading-blob-1" />
          <div className="app-loading-blob app-loading-blob-2" />
          <motion.div
            className="app-loading-content"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.05 }}
          >
            <div className="app-loading-logo">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2"/>
              </svg>
            </div>
            <span className="app-loading-title">Logistic</span>
            <div className="app-loading-dots">
              <span /><span /><span />
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Blocked User Modal */}
      {blockedUser && (
        <div className="modal-overlay" style={{ zIndex: 9999, backdropFilter: 'blur(12px)' }}>
          <motion.div
            className="blocked-card"
            initial={{ scale: 0.85, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="blocked-icon-wrap">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </div>
            <h2 className="blocked-title">Hisob bloklangan</h2>
            <p className="blocked-subtitle">
              Sizning hisobingiz administrator tomonidan vaqtincha bloklangan.<br/>
              Muammo bo'yicha admin bilan bog'laning.
            </p>
            <div className="blocked-user-info">
              <span>{blockedUser.name}</span>
              <span style={{ opacity: 0.5, fontSize: '12px' }}>{blockedUser.email}</span>
            </div>
            <button
              className="blocked-logout-btn"
              onClick={() => { setBlockedUser(null); setUsername(''); setPassword(''); }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
              Yopish
            </button>
          </motion.div>
        </div>
      )}

      <motion.div
        className="login-card"
        initial={{ opacity: 0, y: 40, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Logo */}
        <div className="login-logo">
          <div className="login-logo-icon">
            <Hexagon size={28} />
          </div>
          <span className="login-logo-text">Logistic</span>
        </div>

        <div className="login-header">
          <h1 className="login-title">Xush kelibsiz</h1>
          <p className="login-subtitle">Hisobingizga kirish uchun ma'lumotlarni kiriting</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit} autoComplete="off">
          {/* Username (Gmail or Username) */}
          <div className="login-form-group">
            <label className="login-label" htmlFor="login-username">Gmail yoki Foydalanuvchi nomi</label>
            <div className="login-input-wrapper">
              <span className="login-input-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </span>
              <input
                id="login-username"
                type="text"
                className="login-input"
                placeholder="Gmail yoki foydalanuvchi nomini kiriting"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="login-form-group">
            <label className="login-label" htmlFor="login-password">Parol</label>
            <div className="login-input-wrapper">
              <span className="login-input-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </span>
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                className="login-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="login-eye-btn"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <motion.div
              className="login-error"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="15" y1="9" x2="9" y2="15"/>
                <line x1="9" y1="9" x2="15" y2="15"/>
              </svg>
              {error}
            </motion.div>
          )}

          {/* Submit */}
          <motion.button
            type="submit"
            className="login-btn"
            disabled={loading}
            whileTap={{ scale: 0.97 }}
          >
            {loading ? (
              <span className="login-spinner" />
            ) : (
              <>
                Kirish
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </>
            )}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}

export default LoginPage;
