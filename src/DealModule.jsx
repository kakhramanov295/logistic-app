import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Plus, Filter, MoreVertical, 
  MapPin, Calendar, Truck, User, DollarSign,
  CheckCircle2, Clock, XCircle, FileText, ArrowRight, TrendingUp, Handshake, Box, Loader2, Trash2, Edit2, Download
} from 'lucide-react';
import { supabase } from './supabaseClient';

const mockDeals = [];

const StatusBadge = ({ status }) => {
  const getStatusStyles = () => {
    switch (status) {
      case 'New': return { bg: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-main)', icon: Clock };
      case 'Pending': return { bg: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-main)', icon: Clock };
      case 'In Progress': return { bg: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-main)', icon: Truck };
      case 'Completed': return { bg: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-main)', icon: CheckCircle2 };
      case 'Cancelled': return { bg: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-main)', icon: XCircle };
      default: return { bg: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-main)', icon: FileText };
    }
  };
  
  const styles = getStatusStyles();
  const Icon = styles.icon;

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      padding: '6px 12px',
      borderRadius: '20px',
      backgroundColor: styles.bg,
      color: styles.color,
      fontSize: '13px',
      fontWeight: 600,
    }}>
      <Icon size={14} />
      {status}
    </span>
  );
};

const DealModule = () => {
  const [deals, setDeals] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [isNewDealOpen, setIsNewDealOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  React.useEffect(() => {
    fetchDeals();
  }, []);

  const fetchDeals = async () => {
    setIsLoading(true);
    const { data, error } = await supabase.from('deals').select('*');
    if (error) {
      console.error('Error fetching deals:', error);
    } else {
      setDeals(data || []);
    }
    setIsLoading(false);
  };

  const stats = [
    { title: 'Total Deals', value: '1,284', trend: '+12%', icon: Handshake, isUp: true },
    { title: 'Active Deals', value: '42', trend: '+5%', icon: Truck, isUp: true },
    { title: 'Completed', value: '1,190', trend: '+18%', icon: CheckCircle2, isUp: true },
    { title: 'Revenue', value: '$1.4M', trend: '+24%', icon: DollarSign, isUp: true },
  ];

  let filteredDeals = deals.filter(deal => {
    const matchesSearch = deal.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          deal.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          deal.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'All' || deal.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  if (sortConfig.key) {
    filteredDeals.sort((a, b) => {
      let valA = a[sortConfig.key];
      let valB = b[sortConfig.key];

      if (sortConfig.key === 'price') {
        valA = parseFloat(valA);
        valB = parseFloat(valB);
      } else if (sortConfig.key === 'pickupDate' || sortConfig.key === 'deliveryDate') {
        valA = new Date(valA).getTime();
        valB = new Date(valB).getTime();
      }

      if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
      if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleExport = () => {
    const headers = ['Deal ID', 'Title', 'Customer Name', 'Pickup Location', 'Delivery Location', 'Cargo Type', 'Weight', 'Vehicle Type', 'Price', 'Driver', 'Pickup Date', 'Delivery Date', 'Status'];
    const csvContent = [
      headers.join(','),
      ...filteredDeals.map(deal => [
        deal.id, `"${deal.title}"`, `"${deal.customerName}"`, `"${deal.pickupLocation}"`, `"${deal.deliveryLocation}"`, deal.cargoType, deal.cargoWeight, deal.vehicleType, deal.price, deal.driverInfo, deal.pickupDate, deal.deliveryDate, deal.status
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", "deals_export.csv");
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="main-content deal-module"
    >
      <div className="header">
        <div>
          <h1 className="page-title">Deals Management</h1>
          <p className="page-subtitle">Track and manage freight shipping deals</p>
        </div>
        <div className="header-actions">
          <button className="btn" onClick={handleExport}>
            <Download size={18} />
            Export
          </button>
          <button className="btn btn-primary" onClick={() => { setEditingDeal(null); setIsNewDealOpen(true); }}>
            <Plus size={18} />
            New Deal
          </button>
        </div>
      </div>

      <div className="stats-grid">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="stat-card">
              <div className="stat-header">
                <span className="stat-title">{stat.title}</span>
                <div className="stat-icon">
                  <Icon size={20} />
                </div>
              </div>
              <div className="stat-value">
                {stat.value}
                <span className={`stat-trend ${stat.isUp ? 'trend-up' : 'trend-down'}`}>
                  {stat.trend}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="panel deals-panel">
        <div className="deals-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', alignItems: 'center' }}>
          <div className="search-bar" style={{ position: 'relative', width: '300px' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              placeholder="Search deals..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px 10px 40px',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                color: 'var(--text-main)',
                fontSize: '14px',
                outline: 'none',
              }}
            />
          </div>
          <div className="filter-group" style={{ display: 'flex', gap: '8px' }}>
            {['All', 'New', 'Pending', 'In Progress', 'Completed'].map(status => (
              <button 
                key={status}
                onClick={() => setFilterStatus(status)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '20px',
                  border: '1px solid var(--border)',
                  backgroundColor: filterStatus === status ? 'var(--text-main)' : 'transparent',
                  color: filterStatus === status ? 'var(--bg-dark)' : 'var(--text-muted)',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        <div className="table-container">
          <table className="deals-table">
            <thead>
              <tr>
                <th onClick={() => handleSort('id')} style={{ cursor: 'pointer' }}>Deal Info {sortConfig.key === 'id' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}</th>
                <th onClick={() => handleSort('pickupLocation')} style={{ cursor: 'pointer' }}>Route {sortConfig.key === 'pickupLocation' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}</th>
                <th onClick={() => handleSort('cargoType')} style={{ cursor: 'pointer' }}>Cargo Details {sortConfig.key === 'cargoType' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}</th>
                <th onClick={() => handleSort('pickupDate')} style={{ cursor: 'pointer' }}>Dates {sortConfig.key === 'pickupDate' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}</th>
                <th onClick={() => handleSort('price')} style={{ cursor: 'pointer' }}>Price {sortConfig.key === 'price' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}</th>
                <th onClick={() => handleSort('status')} style={{ cursor: 'pointer' }}>Status {sortConfig.key === 'status' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filteredDeals.map(deal => (
                <tr key={deal.id} style={{ cursor: 'pointer' }} onClick={() => setSelectedDeal(deal)}>
                  <td>
                    <div style={{ fontWeight: 600, marginBottom: '4px' }}>{deal.id}</div>
                    <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{deal.customerName}</div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                      <MapPin size={14} color="var(--text-muted)" />
                      <span>{deal.pickupLocation}</span>
                      <ArrowRight size={14} color="var(--text-muted)" />
                      <span>{deal.deliveryLocation}</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                      <Box size={14} color="var(--text-muted)" />
                      <span style={{ fontSize: '13px' }}>{deal.cargoType}</span>
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{deal.cargoWeight} • {deal.vehicleType}</div>
                  </td>
                  <td>
                    <div style={{ fontSize: '13px', marginBottom: '4px' }}>Pickup: {deal.pickupDate}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Delivery: {deal.deliveryDate}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>${deal.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                  </td>
                  <td>
                    <StatusBadge status={deal.status} />
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                      <MoreVertical size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredDeals.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
              No deals found matching your criteria.
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {selectedDeal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="deal-modal-overlay"
            style={{
              position: 'fixed',
              top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.7)',
              zIndex: 100,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backdropFilter: 'blur(4px)',
            }}
            onClick={() => setSelectedDeal(null)}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="deal-modal-content panel"
              style={{
                width: '600px',
                maxWidth: '90vw',
                maxHeight: '90vh',
                overflowY: 'auto',
                position: 'relative',
              }}
              onClick={e => e.stopPropagation()}
            >
              <button 
                onClick={() => setSelectedDeal(null)}
                style={{ position: 'absolute', top: '24px', right: '24px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <XCircle size={24} />
              </button>
              
              <div style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                  <h2 style={{ fontSize: '24px', margin: 0 }}>{selectedDeal.title}</h2>
                  <StatusBadge status={selectedDeal.status} />
                </div>
                <div style={{ color: 'var(--text-muted)' }}>{selectedDeal.id} • {selectedDeal.customerName}</div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
                <div style={{ padding: '16px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                  <h3 style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <MapPin size={16} /> Route Info
                  </h3>
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Pickup Location</div>
                    <div style={{ fontWeight: 500 }}>{selectedDeal.pickupLocation}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>{selectedDeal.pickupDate}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Delivery Location</div>
                    <div style={{ fontWeight: 500 }}>{selectedDeal.deliveryLocation}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>{selectedDeal.deliveryDate}</div>
                  </div>
                </div>

                <div style={{ padding: '16px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                  <h3 style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Truck size={16} /> Logistics
                  </h3>
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Cargo</div>
                    <div style={{ fontWeight: 500 }}>{selectedDeal.cargoType} ({selectedDeal.cargoWeight})</div>
                  </div>
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Equipment</div>
                    <div style={{ fontWeight: 500 }}>{selectedDeal.vehicleType}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Driver</div>
                    <div style={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <User size={14} /> {selectedDeal.driverInfo}
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ padding: '16px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid var(--border)', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '8px' }}>Financials</h3>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Total Freight Cost</span>
                  <span style={{ fontSize: '20px', fontWeight: 700 }}>${selectedDeal.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              </div>

              {selectedDeal.notes && (
                <div style={{ padding: '16px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                  <h3 style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '8px' }}>Notes</h3>
                  <p style={{ fontSize: '14px', lineHeight: '1.5' }}>{selectedDeal.notes}</p>
                </div>
              )}

              <div style={{ display: 'flex', gap: '12px', marginTop: '32px', justifyContent: 'flex-end' }}>
                <button className="btn" style={{ marginRight: 'auto', color: '#f87171', borderColor: 'rgba(248, 113, 113, 0.3)' }} onClick={async () => {
                  setIsLoading(true);
                  const { error } = await supabase
                    .from('deals')
                    .delete()
                    .eq('id', selectedDeal.id);
                  if (error) {
                    console.error('Error deleting deal:', error);
                  } else {
                    await fetchDeals();
                    setSelectedDeal(null);
                  }
                  setIsLoading(false);
                }}>
                  <Trash2 size={16} /> Delete
                </button>
                <button className="btn" onClick={() => setSelectedDeal(null)}>Close</button>
                <button className="btn btn-primary" onClick={() => {
                  setEditingDeal(selectedDeal);
                  setSelectedDeal(null);
                  setIsNewDealOpen(true);
                }}>
                  <Edit2 size={16} /> Edit Deal
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {isNewDealOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="deal-modal-overlay"
            style={{
              position: 'fixed',
              top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.7)',
              zIndex: 100,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backdropFilter: 'blur(4px)',
            }}
            onClick={() => setIsNewDealOpen(false)}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="deal-modal-content panel"
              style={{
                width: '600px',
                maxWidth: '90vw',
                maxHeight: '90vh',
                overflowY: 'auto',
                position: 'relative',
              }}
              onClick={e => e.stopPropagation()}
            >
              <button 
                onClick={() => setIsNewDealOpen(false)}
                style={{ position: 'absolute', top: '24px', right: '24px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <XCircle size={24} />
              </button>
              
              <div style={{ marginBottom: '24px' }}>
                <h2 style={{ fontSize: '24px', margin: 0, marginBottom: '8px' }}>{editingDeal ? 'Edit Deal' : 'Create New Deal'}</h2>
                <div style={{ color: 'var(--text-muted)' }}>{editingDeal ? 'Update the details for this freight shipment.' : 'Fill in the details for the new freight shipment.'}</div>
              </div>

              <form onSubmit={async (e) => {
                e.preventDefault();
                setIsLoading(true);
                
                const formData = new FormData(e.target);
                
                if (editingDeal) {
                  const updatedDeal = {
                    title: formData.get('title'),
                    customerName: formData.get('customerName'),
                    pickupLocation: formData.get('pickupLocation'),
                    deliveryLocation: formData.get('deliveryLocation'),
                    cargoType: formData.get('cargoType'),
                    cargoWeight: formData.get('cargoWeight'),
                    vehicleType: formData.get('vehicleType'),
                    price: parseFloat(formData.get('price')),
                  };
                  
                  const { error } = await supabase
                    .from('deals')
                    .update(updatedDeal)
                    .eq('id', editingDeal.id);
                    
                  if (error) console.error('Error updating deal:', error);
                  else await fetchDeals();
                } else {
                  const newDeal = {
                    title: formData.get('title'),
                    customerName: formData.get('customerName'),
                    pickupLocation: formData.get('pickupLocation'),
                    deliveryLocation: formData.get('deliveryLocation'),
                    cargoType: formData.get('cargoType'),
                    cargoWeight: formData.get('cargoWeight'),
                    vehicleType: formData.get('vehicleType'),
                    price: parseFloat(formData.get('price')),
                    driverInfo: 'Pending',
                    pickupDate: new Date().toISOString().split('T')[0],
                    deliveryDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
                    status: 'New',
                    notes: '',
                  };
                  
                  const { error } = await supabase
                    .from('deals')
                    .insert([newDeal]);
                    
                  if (error) console.error('Error creating deal:', error);
                  else await fetchDeals();
                }
                
                setIsNewDealOpen(false);
                setIsLoading(false);
              }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '6px' }}>Deal Title</label>
                    <input type="text" name="title" defaultValue={editingDeal?.title || ''} placeholder="e.g. Electronics to Seattle Hub" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-main)' }} required />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '6px' }}>Customer Name</label>
                    <input type="text" name="customerName" defaultValue={editingDeal?.customerName || ''} placeholder="e.g. TechCorp Industries" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-main)' }} required />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '6px' }}>Pickup Location</label>
                    <input type="text" name="pickupLocation" defaultValue={editingDeal?.pickupLocation || ''} placeholder="City, State" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-main)' }} required />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '6px' }}>Delivery Location</label>
                    <input type="text" name="deliveryLocation" defaultValue={editingDeal?.deliveryLocation || ''} placeholder="City, State" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-main)' }} required />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '6px' }}>Cargo Type</label>
                    <input type="text" name="cargoType" defaultValue={editingDeal?.cargoType || ''} placeholder="e.g. Electronics" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-main)' }} required />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '6px' }}>Cargo Weight</label>
                    <input type="text" name="cargoWeight" defaultValue={editingDeal?.cargoWeight || ''} placeholder="e.g. 12,500 lbs" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-main)' }} required />
                  </div>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '6px' }}>Vehicle Type</label>
                    <input type="text" name="vehicleType" defaultValue={editingDeal?.vehicleType || ''} placeholder="e.g. Dry Van - 53ft" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-main)' }} required />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '6px' }}>Price ($)</label>
                    <input type="number" name="price" defaultValue={editingDeal?.price || ''} step="0.01" placeholder="3450.00" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-main)' }} required />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: '32px', justifyContent: 'flex-end' }}>
                  <button type="button" className="btn" onClick={() => setIsNewDealOpen(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={isLoading}>
                    {editingDeal ? 'Update Deal' : 'Create Deal'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}

        {isLoading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.5)',
              zIndex: 1000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backdropFilter: 'blur(4px)',
            }}
          >
            <motion.div 
              animate={{ rotate: 360 }} 
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              style={{ color: 'var(--text-main)' }}
            >
              <Loader2 size={48} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default DealModule;
