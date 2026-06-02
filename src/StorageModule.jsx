import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Plus, Filter, MoreVertical, 
  MapPin, Box, User, Phone, CheckCircle2, 
  XCircle, Warehouse, AlertTriangle, Layers, Trash2, Edit2, Loader2, Info, Download
} from 'lucide-react';

const mockStorage = [];

const StatusBadge = ({ status }) => {
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      padding: '6px 12px',
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
  const [warehouses, setWarehouses] = useState(mockStorage);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [selectedWH, setSelectedWH] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingWH, setEditingWH] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [selectedFormStatus, setSelectedFormStatus] = useState('Active');

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

  const handleSave = (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    setTimeout(() => {
      const formData = new FormData(e.target);
      const capacity = parseFloat(formData.get('capacity'));
      const occupiedSpace = parseFloat(formData.get('occupiedSpace'));
      const availableSpace = capacity - occupiedSpace;

      if (editingWH) {
        const updatedWH = {
          ...editingWH,
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
        setWarehouses(warehouses.map(w => w.id === editingWH.id ? updatedWH : w));
      } else {
        const newWH = {
          id: `WH-00${warehouses.length + 1}`,
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
        setWarehouses([newWH, ...warehouses]);
      }
      
      setIsFormOpen(false);
      setIsLoading(false);
    }, 600);
  };

  const handleDelete = (id) => {
    setIsLoading(true);
    setTimeout(() => {
      setWarehouses(warehouses.filter(w => w.id !== id));
      setSelectedWH(null);
      setIsLoading(false);
    }, 600);
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
                      <button className="btn" style={{ padding: '6px' }} onClick={(e) => { e.stopPropagation(); setEditingWH(wh); setIsFormOpen(true); }}>
                        <Edit2 size={16} />
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
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Phone size={14} /> {selectedWH.contact}
                  </div>
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
                <button className="btn" style={{ marginRight: 'auto', color: '#f87171', borderColor: 'rgba(248, 113, 113, 0.3)' }} onClick={() => handleDelete(selectedWH.id)}>
                  <Trash2 size={16} /> Delete
                </button>
                <button className="btn" onClick={() => setSelectedWH(null)}>Close</button>
                <button className="btn btn-primary" onClick={() => { 
                  setEditingWH(selectedWH); 
                  setSelectedFormStatus(selectedWH.status);
                  setSelectedWH(null); 
                  setIsFormOpen(true); 
                }}>
                  <Edit2 size={16} /> Edit Storage
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {isFormOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="deal-modal-overlay"
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}
            onClick={() => setIsFormOpen(false)}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="deal-modal-content panel"
              style={{ width: '600px', maxWidth: '90vw', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}
              onClick={e => e.stopPropagation()}
            >
              <button onClick={() => setIsFormOpen(false)} style={{ position: 'absolute', top: '24px', right: '24px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <XCircle size={24} />
              </button>
              
              <div style={{ marginBottom: '24px' }}>
                <h2 style={{ fontSize: '24px', margin: 0, marginBottom: '8px' }}>{editingWH ? 'Edit Storage' : 'Create New Storage'}</h2>
                <div style={{ color: 'var(--text-muted)' }}>{editingWH ? 'Update warehouse details below.' : 'Add a new warehouse to your network.'}</div>
              </div>

              <form onSubmit={handleSave}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '6px' }}>Warehouse Name</label>
                    <input type="text" name="name" defaultValue={editingWH?.name || ''} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-main)' }} required />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '6px' }}>Location</label>
                    <input type="text" name="location" defaultValue={editingWH?.location || ''} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-main)' }} required />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '6px' }}>Storage Type</label>
                    <input type="text" name="type" defaultValue={editingWH?.type || ''} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-main)' }} required />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '6px' }}>Status</label>
                    <div style={{ position: 'relative' }}>
                      <input type="hidden" name="status" value={selectedFormStatus} />
                      <div 
                        onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
                        style={{ 
                          width: '100%', padding: '10px', borderRadius: '8px', 
                          border: '1px solid var(--border)', backgroundColor: 'rgba(255, 255, 255, 0.05)', 
                          color: 'var(--text-main)', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                        }}
                      >
                        {selectedFormStatus}
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: statusDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}><polyline points="6 9 12 15 18 9"></polyline></svg>
                      </div>
                      <AnimatePresence>
                        {statusDropdownOpen && (
                          <motion.div 
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            style={{
                              position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '4px',
                              backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)',
                              borderRadius: '8px', overflow: 'hidden', zIndex: 50,
                              boxShadow: '0 10px 25px rgba(0,0,0,0.5)'
                            }}
                          >
                            {['Active', 'Full', 'Maintenance', 'Inactive'].map(s => (
                              <div 
                                key={s}
                                onClick={() => { setSelectedFormStatus(s); setStatusDropdownOpen(false); }}
                                style={{
                                  padding: '10px 12px', cursor: 'pointer',
                                  backgroundColor: selectedFormStatus === s ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                                  color: 'var(--text-main)', fontSize: '14px',
                                  transition: 'background-color 0.2s'
                                }}
                                onMouseEnter={(e) => { if(selectedFormStatus !== s) e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.05)' }}
                                onMouseLeave={(e) => { if(selectedFormStatus !== s) e.target.style.backgroundColor = 'transparent' }}
                              >
                                {s}
                              </div>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '6px' }}>Total Capacity (sq ft)</label>
                    <input type="number" name="capacity" defaultValue={editingWH?.capacity || ''} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-main)' }} required />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '6px' }}>Occupied Space (sq ft)</label>
                    <input type="number" name="occupiedSpace" defaultValue={editingWH?.occupiedSpace || ''} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-main)' }} required />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '6px' }}>Manager Name</label>
                    <input type="text" name="manager" defaultValue={editingWH?.manager || ''} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-main)' }} required />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '6px' }}>Contact Number</label>
                    <input type="text" name="contact" defaultValue={editingWH?.contact || ''} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-main)' }} required />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: '32px', justifyContent: 'flex-end' }}>
                  <button type="button" className="btn" onClick={() => setIsFormOpen(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={isLoading}>
                    {editingWH ? 'Update Storage' : 'Create Storage'}
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
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}
          >
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} style={{ color: 'var(--text-main)' }}>
              <Loader2 size={48} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default StorageModule;
