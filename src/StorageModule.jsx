import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, MapPin, Box, User, CheckCircle2,
  XCircle, Warehouse, AlertTriangle, Layers, Loader2, Info, ArrowRight, Clock
} from 'lucide-react';
import { supabase } from './supabaseClient';

const StatusBadge = ({ status }) => {
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      borderRadius: '20px',
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      color: 'var(--text-main)',
      fontSize: '13px',
      fontWeight: 600,
    }}>
      {status === 'Active' && <CheckCircle2 size={14} />}
      {status === 'Full' && <AlertTriangle size={14} />}
      {status === 'Maintenance' && <Layers size={14} />}
      {status === 'Inactive' && <XCircle size={14} />}
      {status}
    </span>
  );
};

const StorageModule = () => {
  const [warehouses, setWarehouses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [selectedWH, setSelectedWH] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  React.useEffect(() => {
    fetchWarehouses();
  }, []);

  const fetchWarehouses = async () => {
    setIsLoading(true);
    const { data, error } = await supabase.from('warehouses').select('*');
    if (error) {
      console.error('Error fetching warehouses:', error);
    } else {
      setWarehouses(data || []);
    }
    setIsLoading(false);
  };

  const totalWarehouses = warehouses.length;
  const totalCapacity = warehouses.reduce((sum, wh) => sum + wh.capacity, 0);
  const totalOccupied = warehouses.reduce((sum, wh) => sum + wh.occupiedSpace, 0);
  const totalAvailable = warehouses.reduce((sum, wh) => sum + wh.availableSpace, 0);

  const stats = [
    { title: 'Total Warehouses', value: totalWarehouses.toString(), icon: Warehouse },
    { title: 'Total Capacity (sq ft)', value: totalCapacity.toLocaleString(), icon: Box },
    { title: 'Occupied Capacity', value: totalOccupied.toLocaleString(), icon: Layers },
    { title: 'Available Capacity', value: totalAvailable.toLocaleString(), icon: CheckCircle2 },
  ];

  let filteredWarehouses = warehouses.filter(wh => {
    const matchesSearch = wh.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      wh.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      wh.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'All' || wh.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  if (sortConfig.key) {
    filteredWarehouses.sort((a, b) => {
      let valA = a[sortConfig.key];
      let valB = b[sortConfig.key];

      if (['capacity', 'availableSpace', 'occupiedSpace'].includes(sortConfig.key)) {
        valA = parseFloat(valA);
        valB = parseFloat(valB);
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

  const handleSave = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    const formData = new FormData(e.target);
    const capacity = parseFloat(formData.get('capacity'));
    const occupiedSpace = parseFloat(formData.get('occupiedSpace'));
    const availableSpace = capacity - occupiedSpace;

    if (editingWH) {
      const updatedWH = {
        name: formData.get('name'),
        location: formData.get('location'),
        capacity,
        occupiedSpace,
        availableSpace,
        type: formData.get('type'),
        manager: formData.get('manager'),
        contact: formData.get('contact'),
        status: formData.get('status'),
      };
      
      const { error } = await supabase
        .from('warehouses')
        .update(updatedWH)
        .eq('id', editingWH.id);

      if (error) {
        console.error('Error updating warehouse:', error);
      } else {
        await fetchWarehouses();
      }
    } else {
      const newWH = {
        name: formData.get('name'),
        location: formData.get('location'),
        capacity,
        occupiedSpace,
        availableSpace,
        type: formData.get('type'),
        manager: formData.get('manager'),
        contact: formData.get('contact'),
        status: formData.get('status'),
        createdDate: new Date().toISOString().split('T')[0],
      };
      
      const { error } = await supabase
        .from('warehouses')
        .insert([newWH]);

      if (error) {
        console.error('Error creating warehouse:', error);
      } else {
        await fetchWarehouses();
      }
    }
    
    setIsFormOpen(false);
    setIsLoading(false);
  };

  const handleDelete = async (id) => {
    setIsLoading(true);
    const { error } = await supabase
      .from('warehouses')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting warehouse:', error);
    } else {
      await fetchWarehouses();
      setSelectedWH(null);
    }
    setIsLoading(false);
  };

  const handleExport = () => {
    const headers = ['Storage ID', 'Warehouse Name', 'Location', 'Capacity', 'Available Space', 'Occupied Space', 'Type', 'Manager', 'Contact', 'Status', 'Created Date'];
    const csvContent = [
      headers.join(','),
      ...filteredWarehouses.map(wh => [
        wh.id, `"${wh.name}"`, `"${wh.location}"`, wh.capacity, wh.availableSpace, wh.occupiedSpace, wh.type, `"${wh.manager}"`, `"${wh.contact}"`, wh.status, wh.createdDate
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", "storage_export.csv");
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
      className="main-content"
    >
      <div className="header">
        <div>
          <h1 className="page-title">Storage Management</h1>
          <p className="page-subtitle">Overview and control of your warehouse network</p>
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
              placeholder="Search warehouses..."
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
            {['All', 'Active', 'Full', 'Maintenance', 'Inactive'].map(status => (
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
                <th onClick={() => handleSort('id')} style={{ cursor: 'pointer' }}>Storage ID {sortConfig.key === 'id' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}</th>
                <th onClick={() => handleSort('name')} style={{ cursor: 'pointer' }}>Warehouse Name {sortConfig.key === 'name' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}</th>
                <th onClick={() => handleSort('location')} style={{ cursor: 'pointer' }}>Location {sortConfig.key === 'location' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}</th>
                <th onClick={() => handleSort('capacity')} style={{ cursor: 'pointer' }}>Capacity {sortConfig.key === 'capacity' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}</th>
                <th onClick={() => handleSort('availableSpace')} style={{ cursor: 'pointer' }}>Available Space {sortConfig.key === 'availableSpace' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}</th>
                <th onClick={() => handleSort('manager')} style={{ cursor: 'pointer' }}>Manager {sortConfig.key === 'manager' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}</th>
                <th onClick={() => handleSort('status')} style={{ cursor: 'pointer' }}>Status {sortConfig.key === 'status' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredWarehouses.map(wh => (
                <tr key={wh.id} style={{ cursor: 'pointer' }} onClick={() => setSelectedWH(wh)}>
                  <td style={{ fontWeight: 600 }}>{wh.id}</td>
                  <td>
                    <div style={{ fontWeight: 500 }}>{wh.name}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{wh.type}</div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <MapPin size={14} color="var(--text-muted)" /> {wh.location}
                    </div>
                  </td>
                  <td>{wh.capacity.toLocaleString()} sq ft</td>
                  <td>{wh.availableSpace.toLocaleString()} sq ft</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <User size={14} color="var(--text-muted)" /> {wh.manager}
                    </div>
                  </td>
                  <td>
                    <StatusBadge status={wh.status} />
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button className="btn" style={{ padding: '6px' }} onClick={(e) => { e.stopPropagation(); setSelectedWH(wh); }}>
                        <Info size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredWarehouses.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
              No warehouses found.
            </div>
          )}
        </div>
      </div>

      {/* "Kutilyapti" Table Panel */}
      <div className="panel deals-panel" style={{ marginTop: '32px' }}>
        <h2 className="panel-header" style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Clock size={20} /> Kutilyapti (Kutilayotgan yuklar / Expected Shipments)
        </h2>
        <div className="table-container">
          <table className="deals-table">
            <thead>
              <tr>
                <th>Deal ID</th>
                <th>Buyurtmachi (Customer)</th>
                <th>Yuk turi (Cargo Type)</th>
                <th>Buyurtma / Jo'natilgan (Ordered / Shipped)</th>
                <th>Belgilangan Ombor (Warehouse)</th>
                <th>Yo'nalish (Route)</th>
                <th>Holat (Status)</th>
              </tr>
            </thead>
            <tbody>
              {expectedDeals.map(deal => {
                const whName = warehouses.find(w => w.id === deal.assignedWarehouseId)?.name || 'Tayinlanmagan';
                return (
                  <tr key={deal.id}>
                    <td style={{ fontWeight: 600 }}>{deal.id}</td>
                    <td style={{ fontWeight: 500 }}>{deal.customerName}</td>
                    <td>{deal.cargoType}</td>
                    <td>
                      Ordered: {deal.orderedQuantity || 0} / Shipped: {deal.shippedQuantity || 0}
                    </td>
                    <td style={{ color: '#60a5fa', fontWeight: 500 }}>{whName}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
                        <span>{deal.pickupLocation}</span>
                        <ArrowRight size={12} color="var(--text-muted)" />
                        <span>{deal.deliveryLocation}</span>
                      </div>
                    </td>
                    <td>
                      <span className="status-badge status-transit" style={{ padding: '4px 10px', fontSize: '12px' }}>Kutilmoqda</span>
                    </td>
                  </tr>
                );
              })}
              {expectedDeals.length === 0 && (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                    Kutilayotgan yuklar yo'q.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {selectedWH && (
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
            onClick={() => setSelectedWH(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="deal-modal-content panel"
              style={{ width: '600px', maxWidth: '90vw', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}
              onClick={e => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedWH(null)}
                style={{ position: 'absolute', top: '24px', right: '24px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <XCircle size={24} />
              </button>

              <div style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                  <h2 style={{ fontSize: '24px', margin: 0 }}>{selectedWH.name}</h2>
                  <StatusBadge status={selectedWH.status} />
                </div>
                <div style={{ color: 'var(--text-muted)' }}>{selectedWH.id} • {selectedWH.type}</div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
                <div style={{ padding: '16px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                  <h3 style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <MapPin size={16} /> Location Details
                  </h3>
                  <div style={{ fontWeight: 500, marginBottom: '8px' }}>{selectedWH.location}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Created on {selectedWH.createdDate}</div>
                </div>

                <div style={{ padding: '16px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                  <h3 style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <User size={16} /> Management
                  </h3>
                  <div style={{ fontWeight: 500, marginBottom: '4px' }}>{selectedWH.manager}</div>
                </div>
              </div>

              <div style={{ padding: '16px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid var(--border)', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Layers size={16} /> Storage Capacity
                </h3>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span>Total Capacity</span>
                  <span style={{ fontWeight: 600 }}>{selectedWH.capacity.toLocaleString()} sq ft</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span>Occupied Space</span>
                  <span style={{ fontWeight: 600 }}>{selectedWH.occupiedSpace.toLocaleString()} sq ft</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <span>Available Space</span>
                  <span style={{ fontWeight: 600, color: '#34d399' }}>{selectedWH.availableSpace.toLocaleString()} sq ft</span>
                </div>

                <div className="progress-container">
                  <div
                    className="progress-bar"
                    style={{
                      width: `${(selectedWH.occupiedSpace / selectedWH.capacity) * 100}%`,
                      backgroundColor: selectedWH.occupiedSpace === selectedWH.capacity ? '#f87171' : 'var(--text-main)'
                    }}
                  ></div>
                </div>
                <div style={{ textAlign: 'right', fontSize: '12px', color: 'var(--text-muted)', marginTop: '6px' }}>
                  {((selectedWH.occupiedSpace / selectedWH.capacity) * 100).toFixed(1)}% Full
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '32px', justifyContent: 'flex-end' }}>
                <button className="btn" onClick={() => setSelectedWH(null)}>Close</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default StorageModule;
