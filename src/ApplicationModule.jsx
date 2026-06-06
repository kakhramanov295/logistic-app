import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, CheckCircle2, Clock, MapPin, Tag, Hash, PackageOpen, X, FileText, Trash2, ArrowRight, CircleDollarSign, Pencil
} from 'lucide-react';

const ApplicationModule = () => {
  const [orders, setOrders] = useState([
    {
      id: 'ORD-2024-001',
      type: 'Express',
      contents: 'High-end Electronics',
      quantity: 50,
      quantity: 50,
      weight: '120 lbs',
      origin: 'New York, NY',
      destination: 'Los Angeles, CA',
      value: '$45,000',
      status: 'Pending',
      date: '2024-05-18',
      description: 'Fragile screens, handle with care during transport.'
    },
    {
      id: 'ORD-2024-002',
      type: 'Fragile',
      contents: 'Medical Equipment',
      quantity: 12,
      quantity: 12,
      weight: '45 lbs',
      origin: 'Chicago, IL',
      destination: 'Houston, TX',
      value: '$120,000',
      status: 'Accepted',
      date: '2024-05-16',
      description: 'Requires temperature controlled storage.'
    }
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, actionType: null, orderId: null });
  const [editModal, setEditModal] = useState({ isOpen: false, order: null });
  const [newOrder, setNewOrder] = useState({
    type: 'Standard',
    contents: '',
    quantity: '',
    weight: '',
    origin: '',
    destination: '',
    value: '',
    description: ''
  });

  const handleAddOrder = (e) => {
    e.preventDefault();
    const newId = `ORD-2024-${String(orders.length + 1).padStart(3, '0')}`;
    const orderToAdd = {
      ...newOrder,
      id: newId,
      status: 'Pending',
      date: new Date().toISOString().split('T')[0]
    };
    setOrders([orderToAdd, ...orders]);
    setIsModalOpen(false);
    setNewOrder({ type: 'Standard', contents: '', quantity: '', weight: '', origin: '', destination: '', value: '', description: '' });
  };

  const openEditModal = (order) => {
    setEditModal({ isOpen: true, order: { ...order } });
  };

  const handleEditOrder = (e) => {
    e.preventDefault();
    setOrders(orders.map(o => o.id === editModal.order.id ? { ...editModal.order } : o));
    setEditModal({ isOpen: false, order: null });
  };

  const confirmAction = () => {
    if (confirmModal.actionType === 'accept') {
      setOrders(orders.map(order => 
        order.id === confirmModal.orderId ? { ...order, status: 'Accepted' } : order
      ));
    } else if (confirmModal.actionType === 'delete') {
      setOrders(orders.filter(order => order.id !== confirmModal.orderId));
    }
    setConfirmModal({ isOpen: false, actionType: null, orderId: null });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Pending':
        return <span className="status-badge status-delayed"><Clock size={14} /> Pending</span>;
      case 'Accepted':
        return <span className="status-badge status-transit"><CheckCircle2 size={14} /> Accepted</span>;
      default:
        return null;
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="main-content"
    >
      <div className="header">
        <div>
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="page-title"
          >
            Applications & Orders
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="page-subtitle"
          >
            Manage incoming orders, cargo types, and accept new applications.
          </motion.p>
        </div>
        <div className="header-actions">
          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
            <Plus size={16} />
            New Order
          </button>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="order-grid"
        style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
      >
        {orders.map((order, index) => (
          <motion.div 
            key={order.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 * index }}
            className="panel order-card"
            style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap', width: '100%' }}>
              <div className="order-info" style={{ display: 'flex', gap: '24px', flex: 1, flexWrap: 'wrap' }}>
                <div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '4px' }}>Order ID</div>
                  <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Hash size={16} style={{ color: 'var(--text-muted)' }} /> {order.id}
                  </div>
                </div>
                <div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '4px' }}>Route</div>
                  <div style={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <MapPin size={16} style={{ color: 'var(--text-muted)' }} /> {order.origin || 'N/A'} <ArrowRight size={14} style={{ color: 'var(--text-muted)', margin: '0 4px' }} /> {order.destination || 'N/A'}
                  </div>
                </div>
                <div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '4px' }}>Contents</div>
                  <div style={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <PackageOpen size={16} style={{ color: 'var(--text-muted)' }} /> {order.contents}
                  </div>
                </div>
                <div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '4px' }}>Est. Value</div>
                  <div style={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CircleDollarSign size={16} style={{ color: 'var(--text-muted)' }} /> {order.value || 'N/A'}
                  </div>
                </div>
                <div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '4px' }}>Status</div>
                  <div>{getStatusBadge(order.status)}</div>
                </div>
              </div>
              <div className="order-actions" style={{ display: 'flex', gap: '12px', minWidth: '160px', justifyContent: 'flex-end', alignItems: 'center' }}>
                {order.status === 'Pending' ? (
                  <button 
                    className="btn btn-primary" 
                    onClick={() => setConfirmModal({ isOpen: true, actionType: 'accept', orderId: order.id })}
                    style={{ backgroundColor: 'var(--text-main)', color: 'var(--bg-dark)' }}
                  >
                    <CheckCircle2 size={16} /> Accept
                  </button>
                ) : (
                  <div style={{ color: 'var(--text-muted)', fontSize: '14px', fontStyle: 'italic', marginRight: 'auto' }}>
                    Processed
                  </div>
                )}
                <button 
                  className="btn" 
                  onClick={() => openEditModal(order)}
                  style={{ borderColor: 'rgba(255,255,255,0.12)', color: 'var(--text-main)', padding: '10px' }}
                  title="Edit Order"
                >
                  <Pencil size={16} />
                </button>
                <button 
                  className="btn" 
                  onClick={() => setConfirmModal({ isOpen: true, actionType: 'delete', orderId: order.id })}
                  style={{ borderColor: 'rgba(255, 77, 79, 0.3)', color: '#ff4d4f', padding: '10px' }}
                  title="Delete Order"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            {order.description && (
              <div style={{ padding: '12px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '8px', color: 'var(--text-muted)', fontSize: '13px', lineHeight: '1.5' }}>
                <span style={{ fontWeight: 500, color: 'var(--text-main)', marginRight: '6px' }}>Description:</span>
                {order.description}
              </div>
            )}
          </motion.div>
        ))}
      </motion.div>

      <AnimatePresence>
        {isModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="modal-overlay"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="modal-content panel"
            >
              <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 600 }}>Create New Order</h2>
                <button type="button" className="icon-btn" onClick={() => setIsModalOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                  <X size={20} />
                </button>
              </div>
              
              <form onSubmit={handleAddOrder} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div className="form-group">
                  <label>Cargo Contents</label>
                  <input 
                    type="text" 
                    className="form-control"
                    required
                    placeholder="e.g. Electronics, Furniture..."
                    value={newOrder.contents}
                    onChange={(e) => setNewOrder({...newOrder, contents: e.target.value})}
                  />
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label>Cargo Type</label>
                    <select 
                      className="form-control"
                      value={newOrder.type}
                      onChange={(e) => setNewOrder({...newOrder, type: e.target.value})}
                    >
                      <option value="Standard">Standard</option>
                      <option value="Express">Express</option>
                      <option value="Fragile">Fragile</option>
                      <option value="Heavy">Heavy Duty</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label>Quantity</label>
                    <input 
                      type="number" 
                      className="form-control"
                      required
                      min="1"
                      placeholder="Amount"
                      value={newOrder.quantity}
                      onChange={(e) => setNewOrder({...newOrder, quantity: e.target.value})}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label>Origin</label>
                    <input 
                      type="text" 
                      className="form-control"
                      required
                      placeholder="e.g. New York, NY"
                      value={newOrder.origin}
                      onChange={(e) => setNewOrder({...newOrder, origin: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label>Destination</label>
                    <input 
                      type="text" 
                      className="form-control"
                      required
                      placeholder="e.g. Los Angeles, CA"
                      value={newOrder.destination}
                      onChange={(e) => setNewOrder({...newOrder, destination: e.target.value})}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label>Total Weight (optional)</label>
                    <input 
                      type="text" 
                      className="form-control"
                      placeholder="e.g. 150 lbs"
                      value={newOrder.weight}
                      onChange={(e) => setNewOrder({...newOrder, weight: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label>Est. Value (optional)</label>
                    <input 
                      type="text" 
                      className="form-control"
                      placeholder="e.g. $5,000"
                      value={newOrder.value}
                      onChange={(e) => setNewOrder({...newOrder, value: e.target.value})}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Description (optional)</label>
                  <textarea 
                    className="form-control"
                    placeholder="Any additional details or special instructions..."
                    rows="2"
                    value={newOrder.description}
                    onChange={(e) => setNewOrder({...newOrder, description: e.target.value})}
                    style={{ resize: 'vertical' }}
                  ></textarea>
                </div>

                <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
                  <button type="button" className="btn" onClick={() => setIsModalOpen(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Create Order</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Order Modal */}
      <AnimatePresence>
        {editModal.isOpen && editModal.order && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="modal-overlay"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="modal-content panel"
            >
              <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 600 }}>Edit Order — {editModal.order.id}</h2>
                <button type="button" className="icon-btn" onClick={() => setEditModal({ isOpen: false, order: null })} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                  <X size={20} />
                </button>
              </div>
              
              <form onSubmit={handleEditOrder} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div className="form-group">
                  <label>Cargo Contents</label>
                  <input 
                    type="text" 
                    className="form-control"
                    required
                    value={editModal.order.contents}
                    onChange={(e) => setEditModal({ ...editModal, order: { ...editModal.order, contents: e.target.value } })}
                  />
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label>Cargo Type</label>
                    <select 
                      className="form-control"
                      value={editModal.order.type}
                      onChange={(e) => setEditModal({ ...editModal, order: { ...editModal.order, type: e.target.value } })}
                    >
                      <option value="Standard">Standard</option>
                      <option value="Express">Express</option>
                      <option value="Fragile">Fragile</option>
                      <option value="Heavy">Heavy Duty</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label>Quantity</label>
                    <input 
                      type="number" 
                      className="form-control"
                      required
                      min="1"
                      value={editModal.order.quantity}
                      onChange={(e) => setEditModal({ ...editModal, order: { ...editModal.order, quantity: e.target.value } })}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label>Origin</label>
                    <input 
                      type="text" 
                      className="form-control"
                      required
                      value={editModal.order.origin}
                      onChange={(e) => setEditModal({ ...editModal, order: { ...editModal.order, origin: e.target.value } })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Destination</label>
                    <input 
                      type="text" 
                      className="form-control"
                      required
                      value={editModal.order.destination}
                      onChange={(e) => setEditModal({ ...editModal, order: { ...editModal.order, destination: e.target.value } })}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label>Total Weight</label>
                    <input 
                      type="text" 
                      className="form-control"
                      value={editModal.order.weight}
                      onChange={(e) => setEditModal({ ...editModal, order: { ...editModal.order, weight: e.target.value } })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Est. Value</label>
                    <input 
                      type="text" 
                      className="form-control"
                      value={editModal.order.value}
                      onChange={(e) => setEditModal({ ...editModal, order: { ...editModal.order, value: e.target.value } })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea 
                    className="form-control"
                    rows="2"
                    value={editModal.order.description}
                    onChange={(e) => setEditModal({ ...editModal, order: { ...editModal.order, description: e.target.value } })}
                    style={{ resize: 'vertical' }}
                  ></textarea>
                </div>

                <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
                  <button type="button" className="btn" onClick={() => setEditModal({ isOpen: false, order: null })}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Save Changes</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {confirmModal.isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="modal-overlay"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="modal-content panel"
              style={{ maxWidth: '400px' }}
            >
              <div className="modal-header" style={{ marginBottom: '16px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 600 }}>
                  {confirmModal.actionType === 'accept' ? 'Accept Order' : 'Delete Order'}
                </h2>
              </div>
              <p style={{ color: 'var(--text-muted)', marginBottom: '24px', lineHeight: '1.5' }}>
                {confirmModal.actionType === 'accept' 
                  ? `Are you sure you want to accept order ${confirmModal.orderId}? This will change its status to Accepted.` 
                  : `Are you sure you want to permanently delete order ${confirmModal.orderId}? This action cannot be undone.`}
              </p>
              <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" className="btn" onClick={() => setConfirmModal({ isOpen: false, actionType: null, orderId: null })}>Cancel</button>
                <button 
                  type="button" 
                  className="btn btn-primary"
                  style={confirmModal.actionType === 'delete' ? { backgroundColor: '#ff4d4f', color: '#fff' } : {}}
                  onClick={confirmAction}
                >
                  Confirm
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ApplicationModule;
