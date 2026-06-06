import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  AppWindow, 
  Handshake, 
  Box, 
  Settings2, 
  CheckCircle2,
  Hexagon,
  LogOut,
  Users
} from 'lucide-react';

const Sidebar = ({ currentUser, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  const baseMenuItems = [
    { id: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: '/application', label: 'Application', icon: AppWindow },
    { id: '/deal', label: 'Deal', icon: Handshake },
    { id: '/storage', label: 'Storage', icon: Box },
    { id: '/custom', label: 'Custom', icon: Settings2 },
    { id: '/acceptance', label: 'Acceptance', icon: CheckCircle2 },
  ];

  const menuItems = currentUser && currentUser.role === 'Admin'
    ? [...baseMenuItems, { id: '/users', label: 'Users', icon: Users }]
    : baseMenuItems;

  const initials = currentUser
    ? currentUser.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : '?';

  return (
    <motion.aside 
      initial={{ x: -260 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      className="sidebar"
    >
      <div className="logo-container">
        <Hexagon className="logo-icon" size={32} />
        <span>Logistic</span>
      </div>

      <ul className="nav-menu">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPath === item.id || (currentPath === '/' && item.id === '/dashboard');
          return (
            <motion.li 
              key={item.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <a 
                className={`nav-item ${isActive ? 'active' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  navigate(item.id);
                }}
              >
                <Icon size={20} />
                {item.label}
              </a>
            </motion.li>
          );
        })}
      </ul>

      {/* User profile + logout for ADMIN */}
      {currentUser && currentUser.role === 'Admin' && (
        <div 
          className={`sidebar-user ${currentPath === '/profile' ? 'active' : ''}`}
          onClick={() => navigate('/profile')}
          style={{ cursor: 'pointer' }}
        >
          <div className="sidebar-user-info">
            <div className="sidebar-avatar">{initials}</div>
            <div className="sidebar-user-text">
              <span className="sidebar-user-name">{currentUser.name}</span>
              <span className="sidebar-user-role">{currentUser.role}</span>
            </div>
          </div>
          <motion.button
            className="sidebar-logout-btn"
            onClick={(e) => {
              e.stopPropagation(); // prevent triggering profile navigation
              onLogout();
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="Chiqish"
          >
            <LogOut size={16} />
          </motion.button>
        </div>
      )}

      {/* Clean logout button for regular users (non-Admin) */}
      {currentUser && currentUser.role !== 'Admin' && (
        <div className="sidebar-logout-only">
          <motion.button
            className="sidebar-logout-btn-full"
            onClick={onLogout}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <LogOut size={16} />
            <span>Tizimdan chiqish</span>
          </motion.button>
        </div>
      )}
    </motion.aside>
  );
};

export default Sidebar;
