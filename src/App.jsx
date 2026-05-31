import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Dashboard from './Dashboard';
import DealModule from './DealModule';
import StorageModule from './StorageModule';
import { motion, AnimatePresence } from 'framer-motion';

const PlaceholderPage = ({ title }) => (
  <motion.div 
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 1.05 }}
    transition={{ duration: 0.4 }}
    className="main-content"
    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px' }}
  >
    <div className="stat-icon blue" style={{ width: 80, height: 80, borderRadius: 20 }}>
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
      </svg>
    </div>
    <h2 style={{ fontSize: '24px', fontWeight: 600 }}>{title} Module</h2>
    <p style={{ color: 'var(--text-muted)' }}>This section is currently under development.</p>
  </motion.div>
);

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard key="dashboard" />;
      case 'application':
        return <PlaceholderPage key="application" title="Application" />;
      case 'deal':
        return <DealModule key="deal" />;
      case 'storage':
        return <StorageModule key="storage" />;
      case 'custom':
        return <PlaceholderPage key="custom" title="Custom" />;
      case 'acceptance':
        return <PlaceholderPage key="acceptance" title="Acceptance" />;
      default:
        return <Dashboard key="dashboard" />;
    }
  };

  return (
    <div className="app-container">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <AnimatePresence mode="wait">
        {renderContent()}
      </AnimatePresence>
    </div>
  );
}

export default App;
