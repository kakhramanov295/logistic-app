import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, UserPlus, Shield, Mail, Trash2, Edit, AlertCircle, RefreshCw } from 'lucide-react';

const SUPABASE_URL = "https://vcjyiihovljzkcpsxpwz.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_NemRADDZEtihhs7fCJ5acA_8h0jVARB";

function UsersPage({ currentUser }) {
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Create User Form State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState('User');
  const [actionLoading, setActionLoading] = useState(false);

  // Custom Dropdown State
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  // Edit User Form State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editName, setEditName] = useState('');
  const [editRole, setEditRole] = useState('User');
  const [editRoleDropdownOpen, setEditRoleDropdownOpen] = useState(false);

  const handleEditClick = (user) => {
    setEditingUser(user);
    setEditName(user.name || '');
    setEditRole(user.role || 'User');
    setShowEditModal(true);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setError('');

    // Update locally first
    setUsersList(prev => prev.map(u => u.id === editingUser.id ? { ...u, name: editName, role: editRole } : u));

    try {
      // Update in Supabase profiles table
      const response = await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${editingUser.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${currentUser.token || SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          name: editName,
          role: editRole
        })
      });

      if (!response.ok) {
        throw new Error("Supabase profiles jadvalini yangilab bo'lmadi.");
      }

      setShowEditModal(false);
      setEditingUser(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      // Fetching from profiles table via REST API
      const response = await fetch(`${SUPABASE_URL}/rest/v1/profiles?select=*`, {
        method: 'GET',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${currentUser.token || SUPABASE_ANON_KEY}`
        }
      });

      if (!response.ok) {
        throw new Error("Supabase profiles jadvalidan o'qib bo'lmadi. SQL kodni ishga tushirganingizga ishonch hosil qiling.");
      }

      const data = await response.json();
      setUsersList(data);
    } catch (err) {
      console.warn("Using fallback local users list because:", err.message);
      // Fallback local list of users
      setUsersList([
        { id: '1', email: 'almazgravity@gmail.com', name: 'Almaz (Admin)', role: 'Admin', phone: '+998-90-111-2233' },
        { id: '2', email: 'admin@gmail.com', name: 'Users', role: 'Admin', phone: '+998-90-123-4567' },
        { id: '3', email: 'manager@gmail.com', name: 'Users', role: 'Manager', phone: '+998-90-987-6543' },
        { id: '4', email: 'user@gmail.com', name: 'Users', role: 'User', phone: '+998-90-555-5555' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setError('');

    try {
      // 1. Register user in Supabase Auth
      const authResponse = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY
        },
        body: JSON.stringify({
          email: newEmail,
          password: newPassword,
          options: {
            data: {
              name: newName,
              role: newRole
            }
          }
        })
      });

      if (!authResponse.ok) {
        const errData = await authResponse.json();
        throw new Error(errData.msg || errData.error || "Foydalanuvchini ro'yxatdan o'tkazib bo'lmadi.");
      }

      const authData = await authResponse.json();

      // If trigger is set up correctly, it will auto-populate profiles.
      // Let's add locally to list immediately for smooth UX
      const newUserObj = {
        id: authData.user?.id || Math.random().toString(),
        email: newEmail,
        name: newName,
        role: newRole,
        phone: ''
      };

      setUsersList(prev => [newUserObj, ...prev]);
      setShowAddModal(false);
      setNewEmail('');
      setNewPassword('');
      setNewName('');
      setNewRole('User');
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async (id, email) => {
    if (!window.confirm(`${email} foydalanuvchisini o'chirishni xohlaysizmi?`)) return;
    
    // Remove from local list
    setUsersList(prev => prev.filter(u => u.id !== id));
    
    try {
      // Delete request to profiles table
      await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${id}`, {
        method: 'DELETE',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${currentUser.token || SUPABASE_ANON_KEY}`
        }
      });
    } catch (err) {
      console.error("Supabase delete failed", err);
    }
  };

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
          <h1 className="page-title">Foydalanuvchilarni boshqarish</h1>
          <p className="page-subtitle">Tizimga kirish huquqiga ega bo'lgan barcha foydalanuvchilar ro'yxati</p>
        </div>
        <div className="header-actions">
          <button className="btn" onClick={fetchUsers} title="Yangilash">
            <RefreshCw size={16} className={loading ? 'spin-anim' : ''} />
          </button>
          <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
            <UserPlus size={16} /> Yangi foydalanuvchi
          </button>
        </div>
      </div>

      {error && (
        <div className="profile-alert danger">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <div className="panel" style={{ marginTop: '24px' }}>
        <div className="panel-header">
          <Users size={20} /> Foydalanuvchilar ro'yxati ({usersList.length})
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
            <span className="login-spinner" />
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Foydalanuvchi</th>
                  <th>Email</th>
                  <th>Telefon</th>
                  <th>Rol</th>
                  <th style={{ textAlign: 'right' }}>Amallar</th>
                </tr>
              </thead>
              <tbody>
                {usersList.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div className="sidebar-avatar" style={{ width: 30, height: 30, fontSize: 11 }}>
                          {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <span style={{ fontWeight: 500 }}>{user.name || 'Users'}</span>
                      </div>
                    </td>
                    <td>{user.email}</td>
                    <td>{user.phone || 'Kiritilmagan'}</td>
                    <td>
                      <span className={`status-badge ${user.role === 'Admin' ? 'status-delivered' : 'status-transit'}`}>
                        {user.role}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                        <button 
                          className="btn" 
                          style={{ padding: '6px 10px', color: 'var(--text-main)' }}
                          onClick={() => handleEditClick(user)}
                          title="Tahrirlash"
                        >
                          <Edit size={14} />
                        </button>
                        <button 
                          className="btn" 
                          style={{ padding: '6px 10px', color: '#f87171', borderColor: 'rgba(239, 68, 68, 0.2)' }}
                          onClick={() => handleDeleteUser(user.id, user.email)}
                          title="O'chirish"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '460px' }}>
            <div className="panel-header" style={{ marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
              <UserPlus size={18} /> Yangi foydalanuvchi qo'shish
            </div>
            <form onSubmit={handleCreateUser} className="profile-form">
              <div className="form-group">
                <label>Ism va Familiya</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Ismni kiriting"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Gmail (Email)</label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="example@gmail.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Parol (kamida 6 ta belgi)</label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>

              <div className="form-group" style={{ position: 'relative' }}>
                <label>Tizimdagi roli</label>
                <div 
                  className="form-control" 
                  onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                  style={{ 
                    cursor: 'pointer', 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid var(--border)',
                    height: '42px'
                  }}
                >
                  <span>{newRole}</span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ transform: roleDropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                    <path d="M6 9l6 6 6-6"/>
                  </svg>
                </div>
                {roleDropdownOpen && (
                  <div className="custom-dropdown-options">
                    {['User', 'Manager', 'Admin'].map((role) => (
                      <div 
                        key={role} 
                        className={`custom-dropdown-option ${newRole === role ? 'active' : ''}`}
                        onClick={() => {
                          setNewRole(role);
                          setRoleDropdownOpen(false);
                        }}
                      >
                        {role}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '20px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn" onClick={() => setShowAddModal(false)} disabled={actionLoading}>
                  Bekor qilish
                </button>
                <button type="submit" className="btn btn-primary" disabled={actionLoading}>
                  {actionLoading ? <span className="login-spinner" /> : "Qo'shish"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '460px' }}>
            <div className="panel-header" style={{ marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
              <Edit size={18} /> Foydalanuvchini tahrirlash
            </div>
            <form onSubmit={handleSaveEdit} className="profile-form">
              <div className="form-group">
                <label>Ism va Familiya</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Ismni kiriting"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Gmail (Email)</label>
                <input
                  type="email"
                  className="form-control"
                  value={editingUser?.email || ''}
                  disabled
                  style={{ opacity: 0.6, cursor: 'not-allowed' }}
                />
              </div>

              <div className="form-group" style={{ position: 'relative' }}>
                <label>Tizimdagi roli</label>
                <div 
                  className="form-control" 
                  onClick={() => setEditRoleDropdownOpen(!editRoleDropdownOpen)}
                  style={{ 
                    cursor: 'pointer', 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid var(--border)',
                    height: '42px'
                  }}
                >
                  <span>{editRole}</span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ transform: editRoleDropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                    <path d="M6 9l6 6 6-6"/>
                  </svg>
                </div>
                {editRoleDropdownOpen && (
                  <div className="custom-dropdown-options">
                    {['User', 'Manager', 'Admin'].map((role) => (
                      <div 
                        key={role} 
                        className={`custom-dropdown-option ${editRole === role ? 'active' : ''}`}
                        onClick={() => {
                          setEditRole(role);
                          setEditRoleDropdownOpen(false);
                        }}
                      >
                        {role}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '20px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn" onClick={() => { setShowEditModal(false); setEditingUser(null); }} disabled={actionLoading}>
                  Bekor qilish
                </button>
                <button type="submit" className="btn btn-primary" disabled={actionLoading}>
                  {actionLoading ? <span className="login-spinner" /> : "Saqlash"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </motion.div>
  );
}

export default UsersPage;
