import React from 'react';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  AppWindow, 
  Handshake, 
  Box, 
  Settings2, 
  CheckCircle2,
  Hexagon
} from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'application', label: 'Application', icon: AppWindow },
    { id: 'deal', label: 'Deal', icon: Handshake },
    { id: 'storage', label: 'Storage', icon: Box },
    { id: 'custom', label: 'Custom', icon: Settings2 },
    { id: 'acceptance', label: 'Acceptance', icon: CheckCircle2 },
  ];

  return (
    <motion.aside 
      initial={{ x: -260 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      className="sidebar"
    >
      <div className="logo-container">
        <Hexagon className="logo-icon" size={32} />
        <span>Logisys</span>
      </div>

      <ul className="nav-menu">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
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
                  setActiveTab(item.id);
                }}
              >
                <Icon size={20} />
                {item.label}
              </a>
            </motion.li>
          );
        })}
      </ul>
    </motion.aside>
  );
};

export default Sidebar;
