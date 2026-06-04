
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Shield, Key, Mail, Phone, Calendar, CheckCircle } from 'lucide-react';

function ProfilePage({ currentUser, setCurrentUser }) {
  const [fullName, setFullName] = useState(currentUser.name);
  const [phone, setPhone] = useState(currentUser.phone || '+998-90-123-4567');
  const [email, setEmail] = useState(currentUser.email || `${currentUser.username}@logisys.uz`);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSuccessMessage('');
    setError('');

    if (!currentUser.token) {
      // Local fallback
      setCurrentUser(prev => ({
        ...prev,
        name: fullName,
        phone: phone,
        email: email
      }));
      setSuccessMessage("Profil ma'lumotlari muvaffaqiyatli yangilandi! (Lokal)");
      setTimeout(() => setSuccessMessage(''), 3000);
      return;
    }

    try {
      const response = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${currentUser.token}`
        },
        body: JSON.stringify({
          email: email,
          data: {
            name: fullName,
            phone: phone
          }
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.msg || errData.error || "Yangilashda xatolik yuz berdi");
      }

      const updatedUser = await response.json();
      setCurrentUser(prev => ({
        ...prev,
        name: updatedUser.user_metadata?.name || fullName,
        phone: updatedUser.user_metadata?.phone || phone,
        email: updatedUser.email || email
      }));

      setSuccessMessage("Profil ma'lumotlari Supabase orqali muvaffaqiyatli yangilandi!");
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.message || "Xatolik yuz berdi.");
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setSuccessMessage('');
    setError('');

    if (newPassword.length < 6) {
      setError("Yangi parol kamida 6 ta belgidan iborat bo'lishi kerak!");
      return;
    }

    if (!currentUser.token) {
      // Local fallback
      setCurrentUser(prev => ({
        ...prev,
        password: newPassword
      }));
      setSuccessMessage("Parol muvaffaqiyatli yangilandi! (Lokal)");
      setOldPassword('');
      setNewPassword('');
      setTimeout(() => setSuccessMessage(''), 3000);
      return;
    }

    try {
      const response = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${currentUser.token}`
        },
        body: JSON.stringify({
          password: newPassword
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.msg || errData.error || "Parolni yangilashda xatolik yuz berdi");
      }

      setSuccessMessage("Parol Supabase orqali muvaffaqiyatli yangilandi!");
      setOldPassword('');
      setNewPassword('');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.message || "Xatolik yuz berdi.");
    }
  };

  const initials = fullName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.35 }}
      className="main-content"
    >
      <div className="header">
        <div>
          <h1 className="page-title">Foydalanuvchi profili</h1>
          <p className="page-subtitle">Hisobingiz ma'lumotlari va xavfsizlik sozlamalari</p>
        </div>
      </div>

      {successMessage && (
        <motion.div 
          className="profile-alert success"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <CheckCircle size={18} />
          <span>{successMessage}</span>
        </motion.div>
      )}

      {error && (
        <motion.div 
          className="profile-alert danger"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Shield size={18} />
          <span>{error}</span>
        </motion.div>
      )}

      <div className="profile-grid">
        {/* Left Card - Info Summary */}
        <div className="profile-card info-summary">
          <div className="profile-avatar-large">{initials}</div>
          <h2 className="profile-display-name">{fullName}</h2>
          <span className="profile-role-badge">{currentUser.role}</span>
          
          <div className="profile-meta-list">
            <div className="profile-meta-item">
              <User size={16} className="text-muted" />
              <span>Login: <strong>{currentUser.username}</strong></span>
            </div>
            <div className="profile-meta-item">
              <Shield size={16} className="text-muted" />
              <span>Ruxsat darajasi: <strong>{currentUser.role === 'Admin' ? 'To\'liq' : 'Cheklangan'}</strong></span>
            </div>
            <div className="profile-meta-item">
              <Calendar size={16} className="text-muted" />
              <span>Tizimga kirilgan vaqt: <strong>{new Date().toLocaleDateString()}</strong></span>
            </div>
          </div>
        </div>

        {/* Right Tabbed/Sections */}
        <div className="profile-details-container">
          {/* General Settings */}
          <div className="profile-card">
            <h3 className="profile-section-title">
              <User size={18} /> Asosiy ma'lumotlar
            </h3>
            <form onSubmit={handleUpdateProfile} className="profile-form">
              <div className="profile-form-grid">
                <div className="form-group">
                  <label>To'liq ism</label>
                  <input
                    type="text"
                    className="form-control"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Telefon raqam</label>
                  <input
                    type="text"
                    className="form-control"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label>Email manzil</label>
                  <input
                    type="email"
                    className="form-control"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              <button type="submit" className="btn btn-primary" style={{ marginTop: '16px', alignSelf: 'flex-start' }}>
                O'zgarishlarni saqlash
              </button>
            </form>
          </div>

          {/* Security / Password */}
          <div className="profile-card">
            <h3 className="profile-section-title">
              <Key size={18} /> Xavfsizlik va Parol
            </h3>
            <form onSubmit={handleChangePassword} className="profile-form">
              <div className="profile-form-grid">
                <div className="form-group">
                  <label>Hozirgi parol</label>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="••••••••"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Yangi parol</label>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
              <button type="submit" className="btn btn-primary" style={{ marginTop: '16px', alignSelf: 'flex-start' }}>
                Parolni yangilash
              </button>
            </form>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default ProfilePage;
