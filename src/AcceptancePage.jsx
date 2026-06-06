import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PackageCheck, Search, Eye, X, Download,
  CheckCircle, Clock, AlertTriangle, XCircle,
  Truck, Ship, Plane, Package, Thermometer,
  Weight, Ruler, User, Calendar, MapPin,
  ClipboardList, Camera, ShieldCheck, BarChart3,
  ExternalLink, Layers
} from 'lucide-react';
import { supabase } from './supabaseClient';

const statusConfig = {
  accepted:   { label: 'Accepted',      color: '#f5f5f5', bg: 'rgba(255,255,255,0.12)',  icon: CheckCircle },
  pending:    { label: 'Pending',        color: '#f5f5f5', bg: 'rgba(255,255,255,0.08)',  icon: Clock },
  rejected:   { label: 'Rejected',       color: '#f5f5f5', bg: 'rgba(255,255,255,0.06)',  icon: XCircle },
  inspection: { label: 'Under Inspect.', color: '#f5f5f5', bg: 'rgba(255,255,255,0.10)', icon: AlertTriangle },
};

const conditionConfig = {
  good:     { label: 'Good Condition',       color: '#f5f5f5', bg: 'rgba(255,255,255,0.08)' },
  damaged:  { label: 'Damaged Packaging',    color: '#f5f5f5', bg: 'rgba(255,255,255,0.06)' },
  partial:  { label: 'Partial Cargo Damage', color: '#f5f5f5', bg: 'rgba(255,255,255,0.07)' },
};

const modeIcon = { road: Truck, sea: Ship, air: Plane, courier: Package };

const checklist = [
  'Quantity matches AWB/BOL',
  'External packaging intact',
  'Seals / locks intact',
  'Weight matches declaration',
  'No visible damage',
  'Temperature compliance',
  'Hazmat labels present (if applicable)',
  'Delivery documents signed',
];

const getStats = (items) => {
  const total = items.length;
  const accepted = items.filter(d => d.status === 'accepted').length;
  const inspection = items.filter(d => d.status === 'inspection').length;
  const rejected = items.filter(d => d.status === 'rejected').length;
  return [
    { label: 'Total Receipts',   value: total.toString(),  sub: 'Overall volume',       icon: PackageCheck,  color: '#f5f5f5' },
    { label: 'Accepted',         value: accepted.toString(),  sub: `${total ? Math.round((accepted/total)*100) : 0}% acceptance`,   icon: CheckCircle,   color: '#f5f5f5' },
    { label: 'Under Inspection', value: inspection.toString(),  sub: 'Awaiting verdict', icon: AlertTriangle, color: '#f5f5f5' },
    { label: 'Rejected',         value: rejected.toString(),   sub: 'Returned/held',    icon: XCircle,       color: '#f5f5f5' },
  ];
};

const InspectionModal = ({ record, onClose, onUpdate }) => {
  const [checks, setChecks] = useState(Array(checklist.length).fill(false));
  const [note, setNote] = useState(record.notes || '');
  const [spendings, setSpendings] = useState(record.spendings || []);
  const [newLabel, setNewLabel] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const cfg = statusConfig[record.status] || statusConfig['pending'];
  const condCfg = conditionConfig[record.condition] || conditionConfig['good'];
  const StatusIcon = cfg.icon;
  const ModeIcon = modeIcon[record.mode] || Truck;
  const allChecked = checks.every(Boolean);

  const totalSpendings = spendings.reduce((sum, s) => sum + (parseFloat(s.amount) || 0), 0);
  const orderValue = record.orderValue || 0;
  const totalCost = orderValue + totalSpendings;

  const fmt = (n) => n.toLocaleString('en-US', { minimumFractionDigits: 0 }) + ' UZS';

  const addSpending = () => {
    if (!newLabel.trim() || !newAmount) return;
    setSpendings(prev => [...prev, { label: newLabel.trim(), amount: parseFloat(newAmount) || 0 }]);
    setNewLabel('');
    setNewAmount('');
  };

  const removeSpending = (idx) => setSpendings(prev => prev.filter((_, i) => i !== idx));

  const handleUpdateStatus = async (newStatus) => {
    setIsProcessing(true);
    const { error } = await supabase
      .from('cargos')
      .update({
        status: newStatus,
        notes: note,
        spendings: spendings
      })
      .eq('id', record.id);
    
    if (!error) {
      onUpdate({ ...record, status: newStatus, notes: note, spendings: spendings });
      onClose();
    } else {
      console.error('Error updating cargo status:', error);
      alert('Error updating in database');
    }
    setIsProcessing(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 24 }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
        onClick={e => e.stopPropagation()}
        style={{ background: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: 32, width: '100%', maxWidth: 660, maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}
      >
        <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: 8, padding: 8, cursor: 'pointer', color: '#888', display: 'flex' }}>
          <X size={18} />
        </button>

        {/* Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 12, padding: 10, color: '#f5f5f5' }}>
            <ClipboardList size={22} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 18 }}>Cargo Inspection — {record.id}</div>
            <div style={{ color: '#888', fontSize: 13 }}>Ref: {record.ref} · {record.arrival}</div>
          </div>
          <span style={{ marginLeft: 'auto', background: cfg.bg, color: cfg.color, padding: '6px 14px', borderRadius: 20, fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
            <StatusIcon size={14} /> {cfg.label}
          </span>
        </div>

        {/* Info Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 20 }}>
          {[
            { label: 'Carrier',     value: record.carrier,   icon: ModeIcon },
            { label: 'Sender',      value: record.sender,    icon: User },
            { label: 'Origin',      value: record.origin,    icon: MapPin },
            { label: 'Weight',      value: record.weight,    icon: Weight },
            { label: 'Dimensions',  value: record.dims,      icon: Ruler },
            { label: 'Pieces',      value: `${record.pieces} pcs`, icon: Package },
            { label: 'Temperature', value: record.temp,      icon: Thermometer },
            { label: 'Inspector',   value: record.inspector, icon: ShieldCheck },
            { label: 'Condition',   value: <span style={{ color: condCfg.color, fontWeight: 700 }}>{condCfg.label}</span>, icon: BarChart3 },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: '12px 14px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ color: '#666', fontSize: 11, display: 'flex', alignItems: 'center', gap: 5, marginBottom: 5 }}>
                <Icon size={12} /> {label}
              </div>
              <div style={{ fontWeight: 600, fontSize: 13 }}>{value}</div>
            </div>
          ))}
        </div>

        {/* Checklist */}
        <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: 12, padding: 18, border: '1px solid rgba(255,255,255,0.06)', marginBottom: 16 }}>
          <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
            <ClipboardList size={16} style={{ color: '#f5f5f5' }} /> Acceptance Checklist
            <span style={{ marginLeft: 'auto', fontSize: 12, color: '#888' }}>{checks.filter(Boolean).length}/{checklist.length} completed</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {checklist.map((item, i) => (
              <label key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
                <div
                  onClick={() => setChecks(p => p.map((c, j) => j === i ? !c : c))}
                  style={{ width: 20, height: 20, borderRadius: 6, border: `2px solid ${checks[i] ? '#f5f5f5' : 'rgba(255,255,255,0.15)'}`, background: checks[i] ? '#f5f5f5' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', flexShrink: 0 }}>
                  {checks[i] && <CheckCircle size={13} color="#fff" fill="#fff" />}
                </div>
                <span style={{ fontSize: 13, color: checks[i] ? '#f5f5f5' : '#888', transition: 'color 0.2s' }}>{item}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Cost Breakdown */}
        <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: 12, padding: 18, border: '1px solid rgba(255,255,255,0.06)', marginBottom: 16 }}>
          <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Layers size={16} style={{ color: '#f5f5f5' }} /> Cost Breakdown
          </div>

          {/* Order value row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, paddingBottom: 10, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <span style={{ color: '#888', fontSize: 13 }}>Order Value</span>
            <span style={{ fontWeight: 700, color: '#f5f5f5', fontSize: 14 }}>{fmt(orderValue)}</span>
          </div>

          {/* Spending rows */}
          {spendings.map((s, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ color: '#aaa', fontSize: 13 }}>+ {s.label}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ color: '#f5f5f5', fontWeight: 600, fontSize: 13 }}>{fmt(s.amount)}</span>
                <button onClick={() => removeSpending(i)} style={{ background: 'none', border: 'none', color: '#555', cursor: 'pointer', padding: 2, display: 'flex' }}>
                  <X size={13} />
                </button>
              </div>
            </div>
          ))}

          {/* Add new spending row */}
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <input
              type="text"
              placeholder="Spending label (e.g. Customs)"
              value={newLabel}
              onChange={e => setNewLabel(e.target.value)}
              style={{ flex: 2, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 8, padding: '7px 10px', color: '#f5f5f5', fontSize: 12, outline: 'none' }}
            />
            <input
              type="number"
              placeholder="Amount"
              value={newAmount}
              onChange={e => setNewAmount(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addSpending()}
              style={{ flex: 1, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 8, padding: '7px 10px', color: '#f5f5f5', fontSize: 12, outline: 'none' }}
            />
            <button onClick={addSpending} style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, padding: '7px 14px', color: '#f5f5f5', fontSize: 12, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>+ Add</button>
          </div>

          {/* Total row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 14, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <div>
              <div style={{ color: '#666', fontSize: 11, marginBottom: 2 }}>Total Cost</div>
              <div style={{ color: '#888', fontSize: 11 }}>Order {fmt(orderValue)} + Spendings {fmt(totalSpendings)}</div>
            </div>
            <span style={{ fontWeight: 800, color: '#f5f5f5', fontSize: 18 }}>{fmt(totalCost)}</span>
          </div>
        </div>

        {/* Notes */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', color: '#888', fontSize: 12, marginBottom: 8 }}>Inspector Notes</label>
          <textarea value={note} onChange={e => setNote(e.target.value)}
            placeholder="Add inspection remarks, damage description, or additional observations..."
            rows={3}
            style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '12px 14px', color: '#f5f5f5', fontSize: 13, outline: 'none', resize: 'none', fontFamily: 'Inter, sans-serif' }} />
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button 
            onClick={() => handleUpdateStatus('rejected')}
            disabled={isProcessing}
            style={{ flex: 1, padding: '12px 0', borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.2)', color: '#f5f5f5', fontWeight: 600, cursor: 'pointer', fontSize: 14 }}>
            {isProcessing ? 'Saving...' : 'Reject Cargo'}
          </button>
          <button 
            onClick={() => handleUpdateStatus('inspection')}
            disabled={isProcessing}
            style={{ flex: 1, padding: '12px 0', borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', color: '#f5f5f5', fontWeight: 600, cursor: 'pointer', fontSize: 14 }}>
            {isProcessing ? 'Saving...' : 'Flag for Inspection'}
          </button>
          <button
            onClick={() => { if (allChecked) handleUpdateStatus('accepted'); }}
            disabled={isProcessing || !allChecked}
            style={{ flex: 1.5, padding: '12px 0', borderRadius: 10, background: allChecked ? '#f5f5f5' : 'rgba(255,255,255,0.05)', border: '1px solid', borderColor: allChecked ? '#f5f5f5' : 'rgba(255,255,255,0.1)', color: allChecked ? '#0a0a0a' : '#555', fontWeight: 700, cursor: allChecked ? 'pointer' : 'default', fontSize: 14, transition: 'all 0.3s' }}>
            {allChecked ? (isProcessing ? 'Saving...' : '✓ Confirm Acceptance') : `Complete checklist (${checks.filter(Boolean).length}/${checklist.length})`}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

const NewReceiptModal = ({ onClose }) => {
  const [form, setForm] = useState({ carrier: '', sender: '', origin: '', weight: '', pieces: '', temp: 'Ambient', mode: 'road' });
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 24 }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
        onClick={e => e.stopPropagation()}
        style={{ background: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: 32, width: '100%', maxWidth: 520 }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div style={{ fontWeight: 700, fontSize: 20 }}>Register Cargo Receipt</div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: 8, padding: 8, cursor: 'pointer', color: '#888', display: 'flex' }}><X size={18} /></button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          {[
            { key: 'carrier', label: 'Carrier / Driver', placeholder: 'e.g. FastFreight LLC' },
            { key: 'sender',  label: 'Sender',           placeholder: 'Shipping company name' },
            { key: 'origin',  label: 'Origin Point',     placeholder: 'City, Country' },
            { key: 'weight',  label: 'Gross Weight',     placeholder: 'e.g. 500 kg' },
            { key: 'pieces',  label: 'No. of Pieces',    placeholder: 'e.g. 12' },
          ].map(({ key, label, placeholder }) => (
            <div key={key}>
              <label style={{ display: 'block', color: '#888', fontSize: 12, marginBottom: 6 }}>{label}</label>
              <input value={form[key]} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))} placeholder={placeholder}
                style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '10px 14px', color: '#f5f5f5', fontSize: 14, outline: 'none' }} />
            </div>
          ))}
          <div>
            <label style={{ display: 'block', color: '#888', fontSize: 12, marginBottom: 6 }}>Temperature Regime</label>
            <select value={form.temp} onChange={e => setForm(p => ({ ...p, temp: e.target.value }))}
              style={{ width: '100%', background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '10px 14px', color: '#f5f5f5', fontSize: 14, outline: 'none' }}>
              {['Ambient', 'Chilled', 'Frozen', 'Controlled'].map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div style={{ gridColumn: '1/-1' }}>
            <label style={{ display: 'block', color: '#888', fontSize: 12, marginBottom: 8 }}>Transport Mode</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {['road','sea','air','courier'].map(m => (
                <button key={m} onClick={() => setForm(p => ({ ...p, mode: m }))}
                  style={{ flex: 1, padding: '10px 0', borderRadius: 10, border: '1px solid', borderColor: form.mode === m ? '#f5f5f5' : 'rgba(255,255,255,0.1)', background: form.mode === m ? 'rgba(255,255,255,0.1)' : 'transparent', color: form.mode === m ? '#f5f5f5' : '#888', fontWeight: 600, cursor: 'pointer', fontSize: 13, textTransform: 'capitalize' }}>
                  {m}
                </button>
              ))}
            </div>
          </div>
        </div>
        <button style={{ width: '100%', marginTop: 20, padding: '13px 0', borderRadius: 10, background: '#f5f5f5', border: 'none', color: '#0a0a0a', fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>
          Register Receipt
        </button>
      </motion.div>
    </motion.div>
  );
};

const AcceptancePage = () => {
  const [cargos, setCargos] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selected, setSelected] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchCargos();
  }, []);

  const fetchCargos = async () => {
    setIsLoading(true);
    const { data, error } = await supabase.from('cargos').select('*');
    if (!error && data) {
      setCargos(data);
    } else {
      console.error('Error fetching cargos:', error);
    }
    setIsLoading(false);
  };

  const dynamicStats = getStats(cargos);

  const filtered = cargos.filter(c => {
    const matchSearch = !search || c.id.toLowerCase().includes(search.toLowerCase()) || c.carrier.toLowerCase().includes(search.toLowerCase()) || c.sender.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleUpdateRecord = (updatedRecord) => {
    setCargos(cargos.map(c => c.id === updatedRecord.id ? updatedRecord : c));
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }} className="main-content">
      <AnimatePresence>
        {selected && <InspectionModal record={selected} onClose={() => setSelected(null)} onUpdate={handleUpdateRecord} />}
      </AnimatePresence>

      {/* Header */}
      <div className="header">
        <div>
          <h1 className="page-title">Cargo Acceptance</h1>
          <p className="page-subtitle">Receive, inspect and accept incoming cargo shipments</p>
        </div>
        <div className="header-actions">
          <button className="btn" onClick={fetchCargos} disabled={isLoading}>
            {isLoading ? 'Syncing...' : <><Download size={16} /> Sync</>}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', marginBottom: 28 }}>
        {dynamicStats.map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="stat-card">
              <div className="stat-header">
                <span className="stat-title">{s.label}</span>
                <div className="stat-icon" style={{ background: s.color + '20', color: s.color }}><Icon size={20} /></div>
              </div>
              <div className="stat-value" style={{ fontSize: 28 }}>{s.value}</div>
              <div className="stat-desc">{s.sub}</div>
            </motion.div>
          );
        })}
      </div>

      {/* Filters */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 260 }}>
          <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#666' }} />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by receipt ID, carrier, sender..."
            style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '10px 14px 10px 40px', color: '#f5f5f5', fontSize: 14, outline: 'none' }} />
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {['all', 'accepted', 'pending', 'inspection', 'rejected'].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              style={{ padding: '9px 16px', borderRadius: 10, border: '1px solid', fontWeight: 600, fontSize: 13, cursor: 'pointer', textTransform: 'capitalize', transition: 'all 0.2s',
                borderColor: statusFilter === s ? (s === 'all' ? '#f5f5f5' : statusConfig[s]?.color || '#f5f5f5') : 'rgba(255,255,255,0.1)',
                background: statusFilter === s ? (s === 'all' ? 'rgba(255,255,255,0.1)' : statusConfig[s]?.bg || 'rgba(255,255,255,0.1)') : 'transparent',
                color: statusFilter === s ? (s === 'all' ? '#f5f5f5' : statusConfig[s]?.color || '#f5f5f5') : '#888' }}>
              {s === 'all' ? 'All' : statusConfig[s].label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Grid of Interactive Cargo Cards */}
      <motion.div 
        layout 
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
          gap: '20px',
          marginBottom: '32px'
        }}
      >
        {filtered.map((c, i) => {
          const cfg = statusConfig[c.status] || statusConfig['pending'];
          const condCfg = conditionConfig[c.condition] || conditionConfig['good'];
          const StatusIcon = cfg.icon;
          const ModeIcon = modeIcon[c.mode] || Truck;
          return (
            <motion.div
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -4, borderColor: 'rgba(255, 255, 255, 0.2)', boxShadow: '0 12px 30px rgba(0,0,0,0.6)' }}
              key={c.id}
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: '16px',
                padding: '22px',
                display: 'flex',
                flexDirection: 'column',
                gap: '18px',
                transition: 'border-color 0.25s, box-shadow 0.25s',
                position: 'relative'
              }}
            >
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontWeight: 700, color: '#f5f5f5', fontSize: '15px' }}>{c.id}</span>
                  <span style={{ fontSize: '11px', color: '#666', marginLeft: '8px' }}>Ref: {c.ref}</span>
                </div>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: cfg.bg, color: cfg.color, padding: '5px 11px', borderRadius: '16px', fontSize: '11px', fontWeight: 600 }}>
                  <StatusIcon size={12} /> {cfg.label}
                </span>
              </div>

              {/* Transit Path Indicator */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.02)', padding: '10px 12px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.04)' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '10px', color: '#666', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Origin</div>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: '#f5f5f5', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.origin}</div>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', flexShrink: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#f5f5f5' }}></div>
                    <div style={{ width: '25px', height: '1px', borderTop: '2px dotted rgba(255,255,255,0.15)' }}></div>
                    <div style={{ background: 'rgba(255,255,255,0.08)', color: '#f5f5f5', padding: '5px', borderRadius: '6px', display: 'flex' }}>
                      <ModeIcon size={12} />
                    </div>
                    <div style={{ width: '25px', height: '1px', borderTop: '2px dotted rgba(255,255,255,0.15)' }}></div>
                    <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#f5f5f5' }}></div>
                  </div>
                </div>

                <div style={{ flex: 1, textAlign: 'right' }}>
                  <div style={{ fontSize: '10px', color: '#666', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Destination</div>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: '#f5f5f5' }}>Warehouse A</div>
                </div>
              </div>

              {/* Grid properties */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', fontSize: '13px' }}>
                <div>
                  <div style={{ color: '#555', fontSize: '11px', marginBottom: '2px' }}>Carrier</div>
                  <div style={{ fontWeight: 500, color: '#aaa', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.carrier}</div>
                </div>
                <div>
                  <div style={{ color: '#555', fontSize: '11px', marginBottom: '2px' }}>Sender</div>
                  <div style={{ fontWeight: 500, color: '#aaa', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.sender}</div>
                </div>
                <div>
                  <div style={{ color: '#555', fontSize: '11px', marginBottom: '2px' }}>Weight & Items</div>
                  <div style={{ fontWeight: 600, color: '#f5f5f5' }}>{c.weight} · {c.pieces} pcs</div>
                </div>
                <div>
                  <div style={{ color: '#555', fontSize: '11px', marginBottom: '2px' }}>Temp. Regime</div>
                  <div style={{ fontWeight: 600, color: '#f5f5f5' }}>{c.temp}</div>
                </div>
              </div>

              {/* Condition Badge */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.01)', padding: '10px 12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.03)' }}>
                <span style={{ fontSize: '11px', color: '#666' }}>Declared Condition</span>
                <span style={{ color: condCfg.color, fontWeight: 700, fontSize: '12px' }}>{condCfg.label}</span>
              </div>

              {/* Bottom Row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '14px', marginTop: '4px' }}>
                <span style={{ color: '#666', fontSize: '11px' }}>
                  Arrived: {c.arrival}
                </span>
                <button onClick={() => setSelected(c)} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '6px 12px', color: '#aaa', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, transition: 'all 0.2s' }}>
                  <ClipboardList size={13} style={{ color: '#f5f5f5' }} /> Inspect Cargo
                </button>
              </div>
            </motion.div>
          );
        })}
        {filtered.length === 0 && (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: 48, color: '#555' }}>No cargo receipts match your search.</div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default AcceptancePage;
