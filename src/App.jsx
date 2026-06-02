import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Dashboard from './Dashboard';
import DealModule from './DealModule';
import StorageModule from './StorageModule';
import ApplicationModule from './ApplicationModule';
import CustomPage from './CustomPage';
import AcceptancePage from './AcceptancePage';
import { motion, AnimatePresence } from 'framer-motion';

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
        return <CustomPage key="custom" />;
      case 'acceptance':
        return <AcceptancePage key="acceptance" />;
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
