import React, { useState, useEffect, useRef } from 'react';
import Sidebar from './Sidebar';
import Dashboard from './Dashboard';
import DealModule from './DealModule';
import StorageModule from './StorageModule';
import ApplicationModule from './ApplicationModule';
import CustomPage from './CustomPage';
import AcceptancePage from './AcceptancePage';
import LoginPage from './LoginPage';
import ProfilePage from './ProfilePage';
import UsersPage from './UsersPage';
import { motion, AnimatePresence } from 'framer-motion';

const SUPABASE_URL = "https://vcjyiihovljzkcpsxpwz.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_NemRADDZEtihhs7fCJ5acA_8h0jVARB";

const INITIAL_WAREHOUSES = [
  { id: 'WH-001', name: 'Tashkent Central Hub', type: 'General Cold Storage', location: 'Tashkent, UZ', capacity: 50000, occupiedSpace: 12000, availableSpace: 38000, manager: 'Dilshod Karimov', status: 'Active', createdDate: '2025-01-10' },
  { id: 'WH-002', name: 'Samarkand Logistics Center', type: 'Dry Storage', location: 'Samarkand, UZ', capacity: 30000, occupiedSpace: 30000, availableSpace: 0, manager: 'Sardor Alimov', status: 'Full', createdDate: '2025-03-15' },
  { id: 'WH-003', name: 'Fergana Valley Depot', type: 'Distribution Center', location: 'Fergana, UZ', capacity: 20000, occupiedSpace: 5000, availableSpace: 15000, manager: 'Malika Sobirova', status: 'Maintenance', createdDate: '2025-05-20' }
];

const INITIAL_DEALS = [
  {
    id: 'DEAL-001',
    title: 'Krasovka (Sneakers) Order',
    customerName: 'Obod Trade LLC',
    customerPhone: '+998-90-123-4567',
    pickupLocation: 'Tashkent, UZ',
    deliveryLocation: 'Samarkand, UZ',
    cargoType: 'Krasovka (Sneakers)',
    orderedQuantity: 200,
    shippedQuantity: 450,
    vehicleType: 'Semi-Truck',
    driverName: 'John Doe',
    truckNumber: '01 777 AAA',
    price: 3500,
    pickupDate: '2026-06-05',
    deliveryDate: '2026-06-10',
    status: 'In Transit',
    assignedWarehouseId: 'WH-001',
    notes: 'Fragile cargo. Shipped 450 units, 200 ordered, surplus 250 units must go to Tashkent Central Hub storage.'
  },
  {
    id: 'DEAL-002',
    title: 'Office Furniture Delivery',
    customerName: 'Global Corp',
    customerPhone: '+1-555-0142',
    pickupLocation: 'Chicago, IL',
    deliveryLocation: 'Houston, TX',
    cargoType: 'Furniture',
    orderedQuantity: 100,
    shippedQuantity: 100,
    vehicleType: 'Flatbed',
    driverName: 'Robert Smith',
    truckNumber: 'IL-456-CD',
    price: 2800,
    pickupDate: '2026-06-03',
    deliveryDate: '2026-06-07',
    status: 'Pending',
    assignedWarehouseId: 'WH-002',
    notes: 'Deliver to building B, loading dock 4.'
  }
];

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
  const [deals, setDeals] = useState(INITIAL_DEALS);
  const [warehouses, setWarehouses] = useState(INITIAL_WAREHOUSES);
  const [declarations, setDeclarations] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [appLoading, setAppLoading] = useState(true);
  const pollRef = useRef(null);

  // Show loading screen briefly on initial mount
  useEffect(() => {
    const timer = setTimeout(() => setAppLoading(false), 1400);
    return () => clearTimeout(timer);
  }, []);

  const handleLogin = (user) => {
    setAppLoading(true);
    setTimeout(() => {
      setCurrentUser(user);
      setAppLoading(false);
    }, 800);
  };

  const handleLogout = () => {
    setAppLoading(true);
    if (pollRef.current) clearInterval(pollRef.current);
    setTimeout(() => {
      setCurrentUser(null);
      setAppLoading(false);
    }, 600);
  };

  // Poll every 10 seconds to check if user is blocked
  useEffect(() => {
    if (!currentUser || !currentUser.id) return;
    const checkBlock = async () => {
      try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${currentUser.id}&select=blocked`, {
          headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${currentUser.token || SUPABASE_ANON_KEY}` }
        });
        if (!res.ok) return;
        const data = await res.json();
        if (data && data[0]) {
          setCurrentUser(prev => prev ? { ...prev, blocked: data[0].blocked } : prev);
        }
      } catch {}
    };
    checkBlock();
    pollRef.current = setInterval(checkBlock, 10000);
    return () => clearInterval(pollRef.current);
  }, [currentUser?.id]);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard key="dashboard" />;
      case 'application':
        return <ApplicationModule key="application" />;
      case 'deal':
        return <DealModule key="deal" deals={deals} setDeals={setDeals} warehouses={warehouses} />;
      case 'storage':
        return <StorageModule key="storage" warehouses={warehouses} setWarehouses={setWarehouses} deals={deals} />;
      case 'custom':
        return <CustomPage key="custom" declarations={declarations} setDeclarations={setDeclarations} />;
      case 'acceptance':
        return <AcceptancePage key="acceptance" />;
      case 'profile':
        if (currentUser && currentUser.role === 'Admin') {
          return <ProfilePage key="profile" currentUser={currentUser} setCurrentUser={setCurrentUser} />;
        }
        return <Dashboard key="dashboard" />;
      case 'users':
        if (currentUser && currentUser.role === 'Admin') {
          return <UsersPage key="users" currentUser={currentUser} />;
        }
        return <Dashboard key="dashboard" />;
      default:
        return <Dashboard key="dashboard" />;
    }
  };

  if (appLoading) {
    return (
      <motion.div
        key="app-loading"
        className="app-loading-screen"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="app-loading-blob app-loading-blob-1" />
        <div className="app-loading-blob app-loading-blob-2" />
        <motion.div
          className="app-loading-content"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
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
    );
  }

  if (!currentUser) {
    return (
      <AnimatePresence mode="wait">
        <LoginPage key="login" onLogin={handleLogin} />
      </AnimatePresence>
    );
  }

  // Blocked screen
  if (currentUser.blocked) {
    return (
      <motion.div
        className="blocked-screen"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="blocked-blob blocked-blob-1" />
        <div className="blocked-blob blocked-blob-2" />
        <motion.div
          className="blocked-card"
          initial={{ scale: 0.85, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
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
            <span>{currentUser.name || currentUser.username}</span>
            <span style={{ opacity: 0.5, fontSize: '12px' }}>{currentUser.email || ''}</span>
          </div>
          <button className="blocked-logout-btn" onClick={handleLogout}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Chiqish
          </button>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="app-container"
      key="main-app"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} currentUser={currentUser} onLogout={handleLogout} />
      <AnimatePresence mode="wait">
        {renderContent()}
      </AnimatePresence>
    </motion.div>
  );
}

export default App;

