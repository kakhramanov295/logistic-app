import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PackageCheck, Search, Plus, Eye, X, Download,
  CheckCircle, Clock, AlertTriangle, XCircle,
  Truck, Ship, Plane, Package, Thermometer,
  Weight, Ruler, User, Calendar, MapPin,
  ClipboardList, Camera, ShieldCheck, BarChart3,
  ExternalLink, Layers
} from 'lucide-react';

const statusConfig = {
  accepted:   { label: 'Accepted',      color: '#22c55e', bg: 'rgba(34,197,94,0.12)',   icon: CheckCircle },
  pending:    { label: 'Pending',        color: '#f59e0b', bg: 'rgba(245,158,11,0.12)',  icon: Clock },
  rejected:   { label: 'Rejected',       color: '#ef4444', bg: 'rgba(239,68,68,0.12)',   icon: XCircle },
  inspection: { label: 'Under Inspect.', color: '#6366f1', bg: 'rgba(99,102,241,0.12)', icon: AlertTriangle },
};

const conditionConfig = {
  good:     { label: 'Good Condition',     color: '#22c55e', bg: 'rgba(34,197,94,0.1)' },
  damaged:  { label: 'Damaged Packaging',  color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
  partial:  { label: 'Partial Cargo Damage', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
};

const modeIcon = { road: Truck, sea: Ship, air: Plane, courier: Package };

const cargos = [
  { id: 'AC-2024-001', ref: 'SH-2024-001', carrier: 'FastFreight LLC',  sender: 'Acme Corp',       origin: 'New York, NY',  weight: '2,400 kg', dims: '120×80×90 cm', pieces: 12, temp: 'Ambient',  arrival: 'May 14, 09:00', mode: 'road',    status: 'accepted',   condition: 'good',    inspector: 'J. Williams', notes: '' },
  { id: 'AC-2024-002', ref: 'SH-2024-002', carrier: 'SkyMove Air',      sender: 'Euro Supplies',   origin: 'Hamburg, DE',   weight: '380 kg',   dims: '60×40×50 cm',  pieces: 4,  temp: 'Chilled',  arrival: 'May 15, 14:30', mode: 'air',     status: 'pending',    condition: 'good',    inspector: 'Unassigned', notes: '' },
  { id: 'AC-2024-003', ref: 'SH-2024-003', carrier: 'OceanPrime',       sender: 'Pacific Goods',   origin: 'Tokyo, JP',     weight: '8,700 kg', dims: '240×120×200',  pieces: 34, temp: 'Ambient',  arrival: 'May 16, 08:15', mode: 'sea',     status: 'inspection', condition: 'partial', inspector: 'M. Torres',  notes: '3 pallets show moisture damage' },
  { id: 'AC-2024-004', ref: 'SH-2024-004', carrier: 'BorderXpress',     sender: 'Mex Exports',     origin: 'Mexico City',   weight: '1,100 kg', dims: '100×60×80 cm', pieces: 8,  temp: 'Frozen',   arrival: 'May 17, 11:00', mode: 'road',    status: 'rejected',   condition: 'damaged', inspector: 'S. Patel',   notes: 'Packaging integrity compromised, temperature breach' },
  { id: 'AC-2024-005', ref: 'SH-2024-005', carrier: 'QuickCourier',     sender: 'UK Premium',      origin: 'London, UK',    weight: '95 kg',    dims: '45×30×30 cm',  pieces: 3,  temp: 'Ambient',  arrival: 'May 18, 16:45', mode: 'courier', status: 'accepted',   condition: 'good',    inspector: 'J. Williams', notes: '' },
  { id: 'AC-2024-006', ref: 'SH-2024-006', carrier: 'MarineRoute',      sender: 'AsiaTech',        origin: 'Seoul, KR',     weight: '5,200 kg', dims: '200×100×150',  pieces: 22, temp: 'Ambient',  arrival: 'May 19, 07:30', mode: 'sea',     status: 'pending',    condition: 'good',    inspector: 'Unassigned', notes: '' },
];

const stats = [
  { label: 'Total Receipts',   value: '74',  sub: 'This month',       icon: PackageCheck,  color: '#6366f1' },
  { label: 'Accepted',         value: '55',  sub: '74% acceptance',   icon: CheckCircle,   color: '#22c55e' },
  { label: 'Under Inspection', value: '10',  sub: 'Awaiting verdict', icon: AlertTriangle, color: '#f59e0b' },
  { label: 'Rejected',         value: '9',   sub: 'Returned/held',    icon: XCircle,       color: '#ef4444' },
];

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

const InspectionModal = ({ record, onClose }) => {
  const [checks, setChecks] = useState(Array(checklist.length).fill(false));
  const [note, setNote] = useState(record.notes);
  const cfg = statusConfig[record.status];
  const condCfg = conditionConfig[record.condition];
  const StatusIcon = cfg.icon;
  const ModeIcon = modeIcon[record.mode];
  const allChecked = checks.every(Boolean);

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
          <div style={{ background: 'rgba(34,197,94,0.15)', borderRadius: 12, padding: 10, color: '#22c55e' }}>
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
            <ClipboardList size={16} style={{ color: '#6366f1' }} /> Acceptance Checklist
            <span style={{ marginLeft: 'auto', fontSize: 12, color: '#888' }}>{checks.filter(Boolean).length}/{checklist.length} completed</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {checklist.map((item, i) => (
              <label key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
                <div
                  onClick={() => setChecks(p => p.map((c, j) => j === i ? !c : c))}
                  style={{ width: 20, height: 20, borderRadius: 6, border: `2px solid ${checks[i] ? '#22c55e' : 'rgba(255,255,255,0.15)'}`, background: checks[i] ? '#22c55e' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', flexShrink: 0 }}>
                  {checks[i] && <CheckCircle size={13} color="#fff" fill="#fff" />}
                </div>
                <span style={{ fontSize: 13, color: checks[i] ? '#f5f5f5' : '#888', transition: 'color 0.2s' }}>{item}</span>
              </label>
            ))}
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
          <button style={{ flex: 1, padding: '12px 0', borderRadius: 10, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', fontWeight: 600, cursor: 'pointer', fontSize: 14 }}>
            Reject Cargo
          </button>
          <button style={{ flex: 1, padding: '12px 0', borderRadius: 10, background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', color: '#f59e0b', fontWeight: 600, cursor: 'pointer', fontSize: 14 }}>
            Flag for Inspection
          </button>
          <button
            style={{ flex: 1.5, padding: '12px 0', borderRadius: 10, background: allChecked ? '#22c55e' : 'rgba(255,255,255,0.05)', border: '1px solid', borderColor: allChecked ? '#22c55e' : 'rgba(255,255,255,0.1)', color: allChecked ? '#fff' : '#555', fontWeight: 700, cursor: allChecked ? 'pointer' : 'default', fontSize: 14, transition: 'all 0.3s' }}>
            {allChecked ? '✓ Confirm Acceptance' : `Complete checklist (${checks.filter(Boolean).length}/{checklist.length})`}
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
                  style={{ flex: 1, padding: '10px 0', borderRadius: 10, border: '1px solid', borderColor: form.mode === m ? '#22c55e' : 'rgba(255,255,255,0.1)', background: form.mode === m ? 'rgba(34,197,94,0.12)' : 'transparent', color: form.mode === m ? '#22c55e' : '#888', fontWeight: 600, cursor: 'pointer', fontSize: 13, textTransform: 'capitalize' }}>
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
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selected, setSelected] = useState(null);
  const [showNew, setShowNew] = useState(false);

  const filtered = cargos.filter(c => {
    const matchSearch = !search || c.id.toLowerCase().includes(search.toLowerCase()) || c.carrier.toLowerCase().includes(search.toLowerCase()) || c.sender.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }} className="main-content">
      <AnimatePresence>{selected && <InspectionModal record={selected} onClose={() => setSelected(null)} />}</AnimatePresence>
      <AnimatePresence>{showNew && <NewReceiptModal onClose={() => setShowNew(false)} />}</AnimatePresence>

      {/* Header */}
      <div className="header">
        <div>
          <h1 className="page-title">Cargo Acceptance</h1>
          <p className="page-subtitle">Receive, inspect and accept incoming cargo shipments</p>
        </div>
        <div className="header-actions">
          <button className="btn"><Download size={16} /> Export</button>
          <button className="btn btn-primary" onClick={() => setShowNew(true)}><Plus size={16} /> Register Receipt</button>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', marginBottom: 28 }}>
        {stats.map((s, i) => {
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
          const cfg = statusConfig[c.status];
          const condCfg = conditionConfig[c.condition];
          const StatusIcon = cfg.icon;
          const ModeIcon = modeIcon[c.mode];
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
                  <span style={{ fontWeight: 700, color: '#86efac', fontSize: '15px' }}>{c.id}</span>
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
                    <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#22c55e' }}></div>
                    <div style={{ width: '25px', height: '1px', borderTop: '2px dotted rgba(255,255,255,0.15)' }}></div>
                    <div style={{ background: 'rgba(34,197,94,0.12)', color: '#86efac', padding: '5px', borderRadius: '6px', display: 'flex' }}>
                      <ModeIcon size={12} />
                    </div>
                    <div style={{ width: '25px', height: '1px', borderTop: '2px dotted rgba(255,255,255,0.15)' }}></div>
                    <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#22c55e' }}></div>
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
                  <div style={{ fontWeight: 600, color: c.temp === 'Ambient' ? '#aaa' : '#7dd3fc' }}>{c.temp}</div>
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
                  <ClipboardList size={13} style={{ color: '#22c55e' }} /> Inspect Cargo
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
