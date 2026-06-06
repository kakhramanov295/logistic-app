import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, CheckCircle2, Clock, MapPin, Tag, Hash, PackageOpen, X, FileText, Trash2, ArrowRight, CircleDollarSign, Pencil, Loader2
} from 'lucide-react';
import { supabase } from './supabaseClient';

const ApplicationModule = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

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

  // Fetch orders from Supabase on mount
  const fetchOrders = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('applications')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      console.error('Error fetching orders:', error);
    } else {
      setOrders(data || []);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Create order in Supabase
  const handleAddOrder = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    const orderToAdd = {
      type: newOrder.type,
      contents: newOrder.contents,
      quantity: Number(newOrder.quantity),
      weight: newOrder.weight,
      origin: newOrder.origin,
      destination: newOrder.destination,
      value: newOrder.value,
      description: newOrder.description,
      status: 'Pending',
      date: new Date().toISOString().split('T')[0]
    };

    const { error } = await supabase.from('applications').insert([orderToAdd]);
    if (error) {
      console.error('Error creating order:', error);
    } else {
      await fetchOrders();
      setIsModalOpen(false);
      setNewOrder({ type: 'Standard', contents: '', quantity: '', weight: '', origin: '', destination: '', value: '', description: '' });
    }
    setIsSaving(false);
  };

  const openEditModal = (order) => {
    setEditModal({ isOpen: true, order: { ...order } });
  };

  // Update order in Supabase
  const handleEditOrder = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    const { id, created_at, ...updateData } = editModal.order;

    const { error } = await supabase
      .from('applications')
      .update(updateData)
      .eq('id', id);
    if (error) {
      console.error('Error updating order:', error);
    } else {
      await fetchOrders();
      setEditModal({ isOpen: false, order: null });
    }
    setIsSaving(false);
  };

  // Accept or delete order in Supabase
  const confirmAction = async () => {
    setIsSaving(true);
    if (confirmModal.actionType === 'accept') {
      const { error } = await supabase
        .from('applications')
        .update({ status: 'Accepted' })
        .eq('id', confirmModal.orderId);
      if (error) console.error('Error accepting order:', error);
    } else if (confirmModal.actionType === 'delete') {
      const { error } = await supabase
        .from('applications')
        .delete()
        .eq('id', confirmModal.orderId);
      if (error) console.error('Error deleting order:', error);
    }
    await fetchOrders();
    setConfirmModal({ isOpen: false, actionType: null, orderId: null });
    setIsSaving(false);
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

      {/* Loading State */}
      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
          <Loader2 size={24} style={{ animation: 'spin 1s linear infinite' }} />
          <span style={{ marginLeft: '12px', fontSize: '14px' }}>Loading orders...</span>
        </div>
      ) : orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
          <PackageOpen size={48} style={{ marginBottom: '16px', opacity: 0.4 }} />
          <p style={{ fontSize: '16px', fontWeight: 500 }}>No orders yet</p>
          <p style={{ fontSize: '13px' }}>Click "New Order" to create your first application.</p>
        </div>
      ) : (
        <div className="panel" style={{ padding: '20px' }}>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Order Info</th>
                  <th>Route (Origin ➔ Destination)</th>
                  <th>Cargo Details</th>
                  <th>Est. Value</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <React.Fragment key={order.id}>
                    <tr>
                      <td>
                        <div style={{ fontWeight: 600 }}>{order.id}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{order.date}</div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
                          <span style={{ fontWeight: 500 }}>{order.origin || 'N/A'}</span>
                          <ArrowRight size={12} style={{ color: 'var(--text-muted)' }} />
                          <span style={{ fontWeight: 500 }}>{order.destination || 'N/A'}</span>
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <PackageOpen size={14} style={{ color: 'var(--text-muted)' }} /> {order.contents}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                          Type: {order.type} | Qty: {order.quantity} {order.weight ? `| Wt: ${order.weight}` : ''}
                        </div>
                      </td>
                      <td style={{ fontWeight: 600 }}>
                        {order.value ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                             <CircleDollarSign size={14} style={{ color: 'var(--text-muted)' }} /> {order.value}
                          </div>
                        ) : 'N/A'}
                      </td>
                      <td>{getStatusBadge(order.status)}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', alignItems: 'center' }}>
                          {order.status === 'Pending' ? (
                            <button 
                              className="btn btn-primary" 
                              onClick={() => setConfirmModal({ isOpen: true, actionType: 'accept', orderId: order.id })}
                              style={{ padding: '6px 10px', fontSize: '12px', backgroundColor: 'var(--text-main)', color: 'var(--bg-dark)' }}
                              title="Accept Order"
                            >
                              <CheckCircle2 size={14} style={{ marginRight: '4px' }} /> Accept
                            </button>
                          ) : (
                            <div style={{ color: 'var(--text-muted)', fontSize: '12px', fontStyle: 'italic', marginRight: 'auto' }}>
                              Processed
                            </div>
                          )}
                          <button 
                            className="btn" 
                            onClick={() => openEditModal(order)}
                            style={{ padding: '6px' }}
                            title="Edit Order"
                          >
                            <Pencil size={14} />
                          </button>
                          <button 
                            className="btn" 
                            onClick={() => setConfirmModal({ isOpen: true, actionType: 'delete', orderId: order.id })}
                            style={{ padding: '6px', color: '#ff4d4f', borderColor: 'rgba(255, 77, 79, 0.3)' }}
                            title="Delete Order"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                    {order.description && (
                      <tr>
                        <td colSpan="6" style={{ padding: '8px 16px 16px 16px', borderTop: 'none' }}>
                          <div style={{ padding: '12px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '8px', color: 'var(--text-muted)', fontSize: '13px', lineHeight: '1.5' }}>
                            <span style={{ fontWeight: 500, color: 'var(--text-main)', marginRight: '6px' }}>Description:</span>
                            {order.description}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Order Modal */}
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
                  <button type="submit" className="btn btn-primary" disabled={isSaving}>
                    {isSaving ? 'Creating...' : 'Create Order'}
                  </button>
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
                  <button type="submit" className="btn btn-primary" disabled={isSaving}>
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirm Modal */}
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
                  disabled={isSaving}
                >
                  {isSaving ? 'Processing...' : 'Confirm'}
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
