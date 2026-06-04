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

const INITIAL_DECLARATIONS = [
  { id: 'CD-2024-001', shipper: 'Acme Corp',       consignee: 'Delta Imports',   origin: 'Shanghai, CN',  port: 'LA Port',      mode: 'sea',     value: '$48,200', hs: '8471.30',   date: 'May 14, 2024', status: 'received',  documents: [{ name: 'Bill of Lading', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' }, { name: 'Commercial Invoice', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' }, { name: 'Packing List', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' }, { name: 'Certificate of Origin', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' }, { name: 'Insurance Policy', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' }, { name: 'Customs Release Certificate', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' }], spendings: '$2,410', spendingBreakdown: 'Import Duty ($1,800) + Handling ($610)', paymentStatus: 'paid' },
  { id: 'CD-2024-002', shipper: 'Euro Supplies',   consignee: 'NexTrade Ltd',    origin: 'Hamburg, DE',   port: 'JFK Airport',  mode: 'air',     value: '$12,900', hs: '6110.20',   date: 'May 15, 2024', status: 'waiting',   documents: [{ name: 'Bill of Lading', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' }, { name: 'Commercial Invoice', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' }, { name: 'Packing List', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' }, { name: 'Airway Bill', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' }], spendings: '$645', spendingBreakdown: 'Import Duty ($450) + Air Handling ($195)', paymentStatus: 'unpaid' },
  { id: 'CD-2024-003', shipper: 'Pacific Goods',   consignee: 'Summit Inc',      origin: 'Tokyo, JP',     port: 'Long Beach',   mode: 'sea',     value: '$73,400', hs: '9403.60',   date: 'May 16, 2024', status: 'waiting',   documents: [{ name: 'Bill of Lading', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' }, { name: 'Commercial Invoice', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' }, { name: 'Packing List', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' }, { name: 'Certificate of Origin', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' }, { name: 'Cargo Manifest', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' }], spendings: '$4,170', spendingBreakdown: 'Import Duty ($3,670) + Storage Fee ($500)', paymentStatus: 'unpaid' },
  { id: 'CD-2024-004', shipper: 'Mex Exports',     consignee: 'BorderLine Co',   origin: 'Mexico City',   port: 'Laredo TX',    mode: 'road',    value: '$9,600',  hs: '0702.00',   date: 'May 17, 2024', status: 'going',     documents: [{ name: 'Bill of Lading', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' }, { name: 'Commercial Invoice', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' }, { name: 'Road Consignment Note', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' }], spendings: '$780', spendingBreakdown: 'Import Duty ($480) + Inspection ($300)', paymentStatus: 'unpaid' },
  { id: 'CD-2024-005', shipper: 'UK Premium',      consignee: 'Global Trade',    origin: 'London, UK',    port: 'ORD Airport',  mode: 'air',     value: '$31,750', hs: '3004.90',   date: 'May 18, 2024', status: 'received',  documents: [{ name: 'Bill of Lading', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' }, { name: 'Commercial Invoice', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' }, { name: 'Packing List', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' }, { name: 'Certificate of Origin', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' }, { name: 'Insurance Certificate', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' }, { name: 'Airway Bill', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' }, { name: 'Customs Release Certificate', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' }], spendings: '$1,580', spendingBreakdown: 'Import Duty ($1,280) + Handling ($300)', paymentStatus: 'paid' },
  { id: 'CD-2024-006', shipper: 'AsiaTech',        consignee: 'TechImport USA',  origin: 'Seoul, KR',     port: 'Newark Port',  mode: 'sea',     value: '$95,000', hs: '8542.31',   date: 'May 19, 2024', status: 'rejected',  documents: [{ name: 'Bill of Lading', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' }, { name: 'Commercial Invoice', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' }, { name: 'Packing List', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' }, { name: 'Certificate of Origin', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' }, { name: 'Insurance Policy', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' }], spendings: '$4,750', spendingBreakdown: 'Import Duty ($3,800) + Quarantine ($950)', paymentStatus: 'unpaid' },
];

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [deals, setDeals] = useState(INITIAL_DEALS);
  const [warehouses, setWarehouses] = useState(INITIAL_WAREHOUSES);
  const [declarations, setDeclarations] = useState(INITIAL_DECLARATIONS);

  const handleDispatchCargo = (cargoData) => {
    const newId = `CD-2024-${String(declarations.length + 1).padStart(3, '0')}`;
    const newDecl = {
      id: newId,
      shipper: cargoData.shipper || 'Tashkent Central Hub',
      consignee: cargoData.consignee || 'Global Trade Inc',
      origin: cargoData.origin || 'Tashkent, UZ',
      port: cargoData.port || 'LA Port',
      mode: cargoData.mode || 'sea',
      value: cargoData.value || '$25,000',
      hs: cargoData.hs || '8708.29',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      status: 'waiting',
      documents: [
        { name: 'Bill of Lading', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' },
        { name: 'Commercial Invoice', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' },
        { name: 'Packing List', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' }
      ],
      spendings: cargoData.spendings || '$1,200',
      spendingBreakdown: cargoData.spendingBreakdown || 'Customs Duty ($900) + Service Fee ($300)',
      paymentStatus: 'unpaid'
    };
    setDeclarations(prev => [newDecl, ...prev]);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard key="dashboard" />;
      case 'application':
        return <ApplicationModule key="application" />;
      case 'deal':
        return <DealModule key="deal" deals={deals} setDeals={setDeals} warehouses={warehouses} />;
      case 'storage':
        return <StorageModule key="storage" warehouses={warehouses} setWarehouses={setWarehouses} deals={deals} onDispatchCargo={handleDispatchCargo} />;
      case 'custom':
        return <CustomPage key="custom" declarations={declarations} setDeclarations={setDeclarations} />;
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
