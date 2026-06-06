import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Plus, Eye, Edit2, Trash2, X, FileText,
  Phone, MapPin, Calendar, DollarSign, Briefcase, Archive, AlertTriangle, Truck
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
  
  // Modals state
  const [viewDeal, setViewDeal] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editDeal, setEditDeal] = useState(null);
  const [dealToDelete, setDealToDelete] = useState(null);

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

  // Calculate Dashboard statistics
  const totalDeals = deals.length;
  const totalRevenue = deals.reduce((sum, d) => sum + Number(d.price || 0), 0);
  const totalOrdered = deals.reduce((sum, d) => sum + Number(d.orderedQuantity || 0), 0);
  const totalShipped = deals.reduce((sum, d) => sum + Number(d.shippedQuantity || 0), 0);

  // Form opening and reset
  const handleOpenCreateModal = () => {
    setEditDeal(null);
    setFormData({
      title: '',
      customerName: '',
      customerPhone: '',
      pickupLocation: '',
      deliveryLocation: '',
      cargoType: '',
      orderedQuantity: '',
      shippedQuantity: '',
      price: '',
      pickupDate: '',
      deliveryDate: '',
      notes: ''
    });
    setIsFormOpen(true);
  };

  const handleOpenEditModal = (deal, e) => {
    e.stopPropagation();
    setEditDeal(deal);
    setFormData({ ...deal });
    setIsFormOpen(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const ordered = Number(formData.orderedQuantity || 0);
    const shipped = Number(formData.shippedQuantity || 0);

    if (editDeal) {
      // Edit mode
      setDeals(prev => prev.map(d => d.id === editDeal.id ? { 
        ...formData, 
        price: Number(formData.price || 0),
        orderedQuantity: ordered,
        shippedQuantity: shipped
      } : d));
    } else {
      // Create mode
      const newId = `DEAL-${String(deals.length + 1).padStart(3, '0')}`;
      const newDeal = {
        ...formData,
        id: newId,
        price: Number(formData.price || 0),
        orderedQuantity: ordered,
        shippedQuantity: shipped
      };
      setDeals(prev => [newDeal, ...prev]);
    }
    setIsFormOpen(false);
  };

  const triggerDeleteConfirm = (deal, e) => {
    e.stopPropagation();
    setDealToDelete(deal);
  };

  const confirmDeleteDeal = () => {
    if (dealToDelete) {
      setDeals(prev => prev.filter(d => d.id !== dealToDelete.id));
      if (viewDeal?.id === dealToDelete.id) setViewDeal(null);
      setDealToDelete(null);
    }
  };

  // Search Logic
  const filteredDeals = deals.filter(deal => {
    return (
      deal.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      deal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      deal.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      deal.pickupLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      deal.deliveryLocation.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.35 }}
      className="main-content"
      style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}
    >
      {/* Header */}
      <div className="header" style={{ margin: 0 }}>
        <div>
          <h1 className="page-title">Deal Management</h1>
          <p className="page-subtitle">Track and coordinate your active logistics deals</p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenCreateModal} style={{ gap: '8px' }}>
          <Plus size={16} /> Create Deal
        </button>
      </div>

      {/* Dashboard Statistics Cards */}
      <div className="stats-grid">
        {[
          { title: 'Total Deals', value: totalDeals, icon: Briefcase, desc: 'Active order records' },
          { title: 'Total Revenue', value: `$${totalRevenue.toLocaleString()}`, icon: DollarSign, desc: 'Cumulative deals value' },
          { title: 'Total Ordered', value: totalOrdered.toLocaleString(), icon: Archive, desc: 'Requested units count' },
          { title: 'Total Shipped', value: totalShipped.toLocaleString(), icon: Truck, desc: 'Dispatched units count' }
        ].map((card, index) => {
          const Icon = card.icon || Truck;
          return (
            <div key={index} className="stat-card">
              <div className="stat-header">
                <span className="stat-title">{card.title}</span>
                <div className="stat-icon">
                  <Icon size={18} />
                </div>
              </div>
              <div className="stat-value">{card.value}</div>
              <div className="stat-desc">{card.desc}</div>
            </div>
          );
        })}
      </div>

      {/* Filters & Actions Panel */}
      <div className="panel" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '16px', alignItems: 'center', marginBottom: '20px' }}>
          {/* Search Box */}
          <div style={{ position: 'relative', flex: '1', minWidth: '260px', maxWidth: '400px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search by ID, customer, route..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px 10px 38px',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                color: 'var(--text-main)',
                fontSize: '14px',
                outline: 'none',
              }}
            />
          </div>
        </div>

        {/* Data Table */}
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Deal ID</th>
                <th>Customer</th>
                <th>Route</th>
                <th>Cargo & Quantities</th>
                <th>Price</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDeals.map((deal) => {
                const isSurplus = deal.shippedQuantity > deal.orderedQuantity;
                const surplusAmount = isSurplus ? (deal.shippedQuantity - deal.orderedQuantity) : 0;
                
                return (
                  <tr key={deal.id} style={{ cursor: 'pointer' }} onClick={() => setViewDeal(deal)}>
                    <td style={{ fontWeight: 600 }}>{deal.id}</td>
                    <td>
                      <div style={{ fontWeight: 500 }}>{deal.customerName}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Phone size={10} /> {deal.customerPhone}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
                        <span style={{ fontWeight: 500 }}>{deal.pickupLocation}</span>
                        <span style={{ color: 'var(--text-muted)' }}>→</span>
                        <span style={{ fontWeight: 500 }}>{deal.deliveryLocation}</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 500 }}>{deal.cargoType}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        Ordered: {deal.orderedQuantity} / Shipped: {deal.shippedQuantity}
                      </div>
                      {isSurplus && (
                        <div style={{ fontSize: '11px', color: 'var(--text-main)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px', opacity: 0.8 }}>
                          <Archive size={10} /> Storage Surplus: {surplusAmount}
                        </div>
                      )}
                    </td>
                    <td style={{ fontWeight: 600 }}>
                      ${deal.price.toLocaleString()}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }} onClick={e => e.stopPropagation()}>
                        <button className="btn" style={{ padding: '6px' }} title="View details" onClick={() => setViewDeal(deal)}>
                          <Eye size={14} />
                        </button>
                        <button className="btn" style={{ padding: '6px' }} title="Edit deal" onClick={(e) => handleOpenEditModal(deal, e)}>
                          <Edit2 size={14} />
                        </button>
                        <button className="btn" style={{ padding: '6px' }} title="Delete deal" onClick={(e) => triggerDeleteConfirm(deal, e)}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filteredDeals.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
              No deals match your search settings.
            </div>
          )}
        </div>
      </div>

      {/* Details View Modal */}
      <AnimatePresence>
        {viewDeal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="deal-modal-overlay"
            style={{
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.75)', zIndex: 100,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              backdropFilter: 'blur(5px)'
            }}
            onClick={() => setViewDeal(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="panel"
              style={{
                width: '640px', maxWidth: '95vw', maxHeight: '90vh', overflowY: 'auto',
                position: 'relative', padding: '28px', backgroundColor: 'var(--bg-card)',
                boxShadow: '0 20px 25px -5px rgba(0,0,0,0.5)'
              }}
              onClick={e => e.stopPropagation()}
            >
              <button
                onClick={() => setViewDeal(null)}
                style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', letterSpacing: '1px' }}>{viewDeal.id}</span>
              </div>
              <h2 style={{ fontSize: '22px', fontWeight: 700, margin: '0 0 20px 0', color: '#fff' }}>{viewDeal.title}</h2>

              {/* Grid content */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                {/* Column 1 */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <h3 style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Briefcase size={12} /> Customer Name
                    </h3>
                    <div style={{ fontWeight: 500 }}>{viewDeal.customerName}</div>
                  </div>
                  <div>
                    <h3 style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Phone size={12} /> Customer Phone
                    </h3>
                    <div>{viewDeal.customerPhone}</div>
                  </div>
                  <div>
                    <h3 style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <MapPin size={12} /> Route / Locations
                    </h3>
                    <div style={{ fontSize: '13px' }}>
                      <div style={{ fontWeight: 500 }}>Pickup: {viewDeal.pickupLocation}</div>
                      <div style={{ fontWeight: 500 }}>Delivery: {viewDeal.deliveryLocation}</div>
                    </div>
                  </div>
                </div>

                {/* Column 2 */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <h3 style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      Cargo & Quantities
                    </h3>
                    <div style={{ fontWeight: 500 }}>{viewDeal.cargoType}</div>
                    <div style={{ fontSize: '13px', color: 'var(--text-main)', marginTop: '4px' }}>
                      Ordered Quantity: <strong>{viewDeal.orderedQuantity}</strong><br />
                      Shipped Quantity: <strong>{viewDeal.shippedQuantity}</strong>
                    </div>
                    {viewDeal.shippedQuantity > viewDeal.orderedQuantity && (
                      <div style={{ fontSize: '12px', color: 'var(--text-main)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px' }}>
                        <Archive size={14} /> Warehouse Storage Surplus: {viewDeal.shippedQuantity - viewDeal.orderedQuantity} units
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Calendar size={12} /> Timeline
                    </h3>
                    <div style={{ fontSize: '13px' }}>
                      <div>Pickup: {viewDeal.pickupDate}</div>
                      <div>Delivery: {viewDeal.deliveryDate}</div>
                    </div>
                  </div>
                  <div>
                    <h3 style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <DollarSign size={12} /> Price / Valuation
                    </h3>
                    <div style={{ fontSize: '18px', fontWeight: 700 }}>
                      ${viewDeal.price.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                <h3 style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FileText size={12} /> Deal Notes
                </h3>
                <p style={{ fontSize: '13px', margin: 0, color: 'var(--text-main)', lineHeight: '1.5' }}>
                  {viewDeal.notes || 'No additional notes provided for this deal.'}
                </p>
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
                <button className="btn btn-primary" onClick={(e) => { setViewDeal(null); handleOpenEditModal(viewDeal, e); }}>
                  Edit Deal
                </button>
                <button className="btn" onClick={() => setViewDeal(null)}>
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {dealToDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="deal-modal-overlay"
            style={{
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 110,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              backdropFilter: 'blur(6px)'
            }}
            onClick={() => setDealToDelete(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="panel"
              style={{
                width: '450px', maxWidth: '90vw', padding: '24px', backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border)', textAlign: 'center'
              }}
              onClick={e => e.stopPropagation()}
            >
              <AlertTriangle size={48} color="var(--text-main)" style={{ margin: '0 auto 16px auto', opacity: 0.8 }} />
              <h2 style={{ fontSize: '20px', fontWeight: 700, margin: '0 0 12px 0', color: '#fff' }}>
                Confirm Deal Deletion
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: '1.6', marginBottom: '24px' }}>
                Are you sure you want to delete the deal created by customer <strong style={{ color: '#fff' }}>{dealToDelete.customerName}</strong>?<br />
                This action is permanent and cannot be undone.
              </p>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                <button className="btn" onClick={() => setDealToDelete(null)}>
                  Cancel
                </button>
                <button className="btn btn-primary" onClick={confirmDeleteDeal}>
                  Delete Now
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create / Edit Form Modal */}
      <AnimatePresence>
        {isFormOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="deal-modal-overlay"
            style={{
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.75)', zIndex: 100,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              backdropFilter: 'blur(5px)'
            }}
            onClick={() => setIsFormOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="panel"
              style={{
                width: '720px', maxWidth: '95vw', maxHeight: '90vh', overflowY: 'auto',
                position: 'relative', padding: '28px', backgroundColor: 'var(--bg-card)',
                boxShadow: '0 20px 25px -5px rgba(0,0,0,0.5)'
              }}
              onClick={e => e.stopPropagation()}
            >
              <button
                onClick={() => setIsFormOpen(false)}
                style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>

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
                    <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>Deal Title / Description</label>
                    <input
                      type="text"
                      name="title"
                      required
                      value={formData.title}
                      onChange={handleFormChange}
                      style={{
                        width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)',
                        backgroundColor: 'rgba(255, 255, 255, 0.02)', color: 'var(--text-main)', outline: 'none'
                      }}
                    />
                  </div>
                </div>

                {/* Section 2: Customer */}
                <div>
                  <h3 style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Customer Information</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>Customer Name</label>
                      <input
                        type="text"
                        name="customerName"
                        required
                        value={formData.customerName}
                        onChange={handleFormChange}
                        style={{
                          width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)',
                          backgroundColor: 'rgba(255, 255, 255, 0.02)', color: 'var(--text-main)', outline: 'none'
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>Customer Phone</label>
                      <input
                        type="text"
                        name="customerPhone"
                        required
                        value={formData.customerPhone}
                        onChange={handleFormChange}
                        style={{
                          width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)',
                          backgroundColor: 'rgba(255, 255, 255, 0.02)', color: 'var(--text-main)', outline: 'none'
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Section 3: Cargo & Routing */}
                <div>
                  <h3 style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Route & Cargo Details</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>Pickup Location</label>
                      <input
                        type="text"
                        name="pickupLocation"
                        required
                        value={formData.pickupLocation}
                        onChange={handleFormChange}
                        style={{
                          width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)',
                          backgroundColor: 'rgba(255, 255, 255, 0.02)', color: 'var(--text-main)', outline: 'none'
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>Delivery Location</label>
                      <input
                        type="text"
                        name="deliveryLocation"
                        required
                        value={formData.deliveryLocation}
                        onChange={handleFormChange}
                        style={{
                          width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)',
                          backgroundColor: 'rgba(255, 255, 255, 0.02)', color: 'var(--text-main)', outline: 'none'
                        }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>Cargo Type</label>
                      <input
                        type="text"
                        name="cargoType"
                        required
                        placeholder="e.g. Krasovka"
                        value={formData.cargoType}
                        onChange={handleFormChange}
                        style={{
                          width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)',
                          backgroundColor: 'rgba(255, 255, 255, 0.02)', color: 'var(--text-main)', outline: 'none'
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>Ordered Quantity</label>
                      <input
                        type="number"
                        name="orderedQuantity"
                        required
                        placeholder="e.g. 200"
                        value={formData.orderedQuantity}
                        onChange={handleFormChange}
                        style={{
                          width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)',
                          backgroundColor: 'rgba(255, 255, 255, 0.02)', color: 'var(--text-main)', outline: 'none'
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>Shipped Quantity</label>
                      <input
                        type="number"
                        name="shippedQuantity"
                        required
                        placeholder="e.g. 450"
                        value={formData.shippedQuantity}
                        onChange={handleFormChange}
                        style={{
                          width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)',
                          backgroundColor: 'rgba(255, 255, 255, 0.02)', color: 'var(--text-main)', outline: 'none'
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>Price (USD)</label>
                    <input
                      type="number"
                      name="price"
                      required
                      value={formData.price}
                      onChange={handleFormChange}
                      style={{
                        width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)',
                        backgroundColor: 'rgba(255, 255, 255, 0.02)', color: 'var(--text-main)', outline: 'none'
                      }}
                    />
                  </div>
                </div>

                {/* Section 4: Timeline & Notes */}
                <div>
                  <h3 style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Timeline & Notes</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>Pickup Date</label>
                      <input
                        type="date"
                        name="pickupDate"
                        required
                        value={formData.pickupDate}
                        onChange={handleFormChange}
                        style={{
                          width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)',
                          backgroundColor: 'rgba(255, 255, 255, 0.02)', color: 'var(--text-main)', outline: 'none'
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>Delivery Date</label>
                      <input
                        type="date"
                        name="deliveryDate"
                        required
                        value={formData.deliveryDate}
                        onChange={handleFormChange}
                        style={{
                          width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)',
                          backgroundColor: 'rgba(255, 255, 255, 0.02)', color: 'var(--text-main)', outline: 'none'
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>Special Instructions / Notes</label>
                    <textarea
                      name="notes"
                      rows="3"
                      value={formData.notes}
                      onChange={handleFormChange}
                      style={{
                        width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)',
                        backgroundColor: 'rgba(255, 255, 255, 0.02)', color: 'var(--text-main)', outline: 'none', resize: 'vertical'
                      }}
                    />
                  </div>
                </div>

                {/* Form Actions */}
                <div style={{ display: 'flex', gap: '12px', marginTop: '16px', justifyContent: 'flex-end' }}>
                  <button type="button" className="btn" onClick={() => setIsFormOpen(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editDeal ? 'Save Changes' : 'Create Deal'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default DealModule;
