import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Search, Filter, Download, Plus, Eye,
  AlertTriangle, CheckCircle, Clock, XCircle,
  X, Ship, Plane, Truck, Package, Calendar, Hash,
  Globe, User, DollarSign, Tag, FileCheck
} from 'lucide-react';

const statusConfig = {
  cleared:    { label: 'Cleared',     color: '#22c55e', bg: 'rgba(34,197,94,0.12)',   icon: CheckCircle },
  pending:    { label: 'Pending',     color: '#f59e0b', bg: 'rgba(245,158,11,0.12)',  icon: Clock },
  hold:       { label: 'On Hold',     color: '#ef4444', bg: 'rgba(239,68,68,0.12)',   icon: XCircle },
  inspection: { label: 'Inspection',  color: '#6366f1', bg: 'rgba(99,102,241,0.12)',  icon: AlertTriangle },
};

const modeIcon = { sea: Ship, air: Plane, road: Truck, courier: Package };

const declarations = [
  { id: 'CD-2024-001', shipper: 'Acme Corp',       consignee: 'Delta Imports',   origin: 'Shanghai, CN',  port: 'LA Port',      mode: 'sea',     value: '$48,200', hs: '8471.30',   date: 'May 14, 2024', status: 'cleared',    docs: 6 },
  { id: 'CD-2024-002', shipper: 'Euro Supplies',   consignee: 'NexTrade Ltd',    origin: 'Hamburg, DE',   port: 'JFK Airport',  mode: 'air',     value: '$12,900', hs: '6110.20',   date: 'May 15, 2024', status: 'pending',    docs: 4 },
  { id: 'CD-2024-003', shipper: 'Pacific Goods',   consignee: 'Summit Inc',      origin: 'Tokyo, JP',     port: 'Long Beach',   mode: 'sea',     value: '$73,400', hs: '9403.60',   date: 'May 16, 2024', status: 'hold',       docs: 5 },
  { id: 'CD-2024-004', shipper: 'Mex Exports',     consignee: 'BorderLine Co',   origin: 'Mexico City',   port: 'Laredo TX',    mode: 'road',    value: '$9,600',  hs: '0702.00',   date: 'May 17, 2024', status: 'inspection', docs: 3 },
  { id: 'CD-2024-005', shipper: 'UK Premium',      consignee: 'Global Trade',    origin: 'London, UK',    port: 'ORD Airport',  mode: 'air',     value: '$31,750', hs: '3004.90',   date: 'May 18, 2024', status: 'cleared',    docs: 7 },
  { id: 'CD-2024-006', shipper: 'AsiaTech',        consignee: 'TechImport USA',  origin: 'Seoul, KR',     port: 'Newark Port',  mode: 'sea',     value: '$95,000', hs: '8542.31',   date: 'May 19, 2024', status: 'pending',    docs: 5 },
];

const stats = [
  { label: 'Total Declarations', value: '128',  sub: 'This month',       icon: FileText,      color: '#6366f1' },
  { label: 'Cleared',            value: '94',   sub: '73% success rate', icon: CheckCircle,   color: '#22c55e' },
  { label: 'Pending Review',     value: '21',   sub: 'Awaiting officer',  icon: Clock,         color: '#f59e0b' },
  { label: 'On Hold / Detained', value: '13',   sub: 'Requires action',  icon: AlertTriangle, color: '#ef4444' },
];

const DetailModal = ({ record, onClose }) => {
  const cfg = statusConfig[record.status];
  const ModeIcon = modeIcon[record.mode];
  const StatusIcon = cfg.icon;
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 24 }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
        onClick={e => e.stopPropagation()}
        style={{ background: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: 32, width: '100%', maxWidth: 620, position: 'relative' }}
      >
        <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: 8, padding: 8, cursor: 'pointer', color: '#888', display: 'flex' }}>
          <X size={18} />
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <div style={{ background: 'rgba(99,102,241,0.15)', borderRadius: 12, padding: 10, color: '#6366f1' }}>
            <FileText size={22} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 18 }}>{record.id}</div>
            <div style={{ color: '#888', fontSize: 13 }}>Customs Declaration</div>
          </div>
          <span style={{ marginLeft: 'auto', background: cfg.bg, color: cfg.color, padding: '6px 14px', borderRadius: 20, fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
            <StatusIcon size={14} /> {cfg.label}
          </span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {[
            { label: 'Shipper',        value: record.shipper,    icon: User },
            { label: 'Consignee',      value: record.consignee,  icon: User },
            { label: 'Origin',         value: record.origin,     icon: Globe },
            { label: 'Port of Entry',  value: record.port,       icon: Globe },
            { label: 'Transport Mode', value: record.mode.charAt(0).toUpperCase()+record.mode.slice(1), icon: ModeIcon },
            { label: 'Declared Value', value: record.value,      icon: DollarSign },
            { label: 'HS Code',        value: record.hs,         icon: Hash },
            { label: 'Filed Date',     value: record.date,       icon: Calendar },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: '14px 16px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ color: '#666', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                <Icon size={13} /> {label}
              </div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{value}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 16, background: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: '14px 16px', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ color: '#666', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <Tag size={13} /> Attached Documents ({record.docs})
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {['Bill of Lading', 'Commercial Invoice', 'Packing List', 'Certificate of Origin', 'Insurance', 'Phytosanitary'].slice(0, record.docs).map(doc => (
              <span key={doc} style={{ background: 'rgba(99,102,241,0.1)', color: '#a5b4fc', padding: '4px 10px', borderRadius: 8, fontSize: 12, fontWeight: 500 }}>{doc}</span>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
          <button style={{ flex: 1, padding: '12px 0', borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#f5f5f5', fontWeight: 600, cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <Download size={15} /> Export PDF
          </button>
          <button style={{ flex: 1, padding: '12px 0', borderRadius: 10, background: '#f5f5f5', border: 'none', color: '#0a0a0a', fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>
            Update Status
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

const NewDeclarationModal = ({ onClose }) => {
  const [form, setForm] = useState({ shipper: '', consignee: '', origin: '', port: '', mode: 'sea', value: '', hs: '' });
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 24 }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
        onClick={e => e.stopPropagation()}
        style={{ background: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: 32, width: '100%', maxWidth: 560 }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div style={{ fontWeight: 700, fontSize: 20 }}>New Customs Declaration</div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: 8, padding: 8, cursor: 'pointer', color: '#888', display: 'flex' }}><X size={18} /></button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          {[
            { key: 'shipper', label: 'Shipper Name', placeholder: 'Company name' },
            { key: 'consignee', label: 'Consignee', placeholder: 'Receiving company' },
            { key: 'origin', label: 'Country of Origin', placeholder: 'e.g. Shanghai, CN' },
            { key: 'port', label: 'Port of Entry', placeholder: 'e.g. LA Port' },
            { key: 'value', label: 'Declared Value', placeholder: 'e.g. $10,000' },
            { key: 'hs', label: 'HS Code', placeholder: 'e.g. 8471.30' },
          ].map(({ key, label, placeholder }) => (
            <div key={key}>
              <label style={{ display: 'block', color: '#888', fontSize: 12, marginBottom: 6 }}>{label}</label>
              <input
                value={form[key]} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                placeholder={placeholder}
                style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '10px 14px', color: '#f5f5f5', fontSize: 14, outline: 'none' }}
              />
            </div>
          ))}
          <div style={{ gridColumn: '1/-1' }}>
            <label style={{ display: 'block', color: '#888', fontSize: 12, marginBottom: 6 }}>Transport Mode</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {['sea','air','road','courier'].map(m => (
                <button key={m} onClick={() => setForm(p => ({ ...p, mode: m }))}
                  style={{ flex: 1, padding: '10px 0', borderRadius: 10, border: '1px solid', borderColor: form.mode === m ? '#6366f1' : 'rgba(255,255,255,0.1)', background: form.mode === m ? 'rgba(99,102,241,0.15)' : 'transparent', color: form.mode === m ? '#a5b4fc' : '#888', fontWeight: 600, cursor: 'pointer', fontSize: 13, textTransform: 'capitalize' }}>
                  {m}
                </button>
              ))}
            </div>
          </div>
        </div>
        <button style={{ width: '100%', marginTop: 20, padding: '13px 0', borderRadius: 10, background: '#f5f5f5', border: 'none', color: '#0a0a0a', fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>
          Submit Declaration
        </button>
      </motion.div>
    </motion.div>
  );
};

const CustomPage = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selected, setSelected] = useState(null);
  const [showNew, setShowNew] = useState(false);

  const filtered = declarations.filter(d => {
    const matchSearch = !search || d.id.toLowerCase().includes(search.toLowerCase()) || d.shipper.toLowerCase().includes(search.toLowerCase()) || d.consignee.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || d.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }} className="main-content">
      <AnimatePresence>{selected && <DetailModal record={selected} onClose={() => setSelected(null)} />}</AnimatePresence>
      <AnimatePresence>{showNew && <NewDeclarationModal onClose={() => setShowNew(false)} />}</AnimatePresence>

      {/* Header */}
      <div className="header">
        <div>
          <h1 className="page-title">Customs Clearance</h1>
          <p className="page-subtitle">Manage import/export declarations and clearance status</p>
        </div>
        <div className="header-actions">
          <button className="btn"><Download size={16} /> Export</button>
          <button className="btn btn-primary" onClick={() => setShowNew(true)}><Plus size={16} /> New Declaration</button>
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
            placeholder="Search by ID, shipper, consignee..."
            style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '10px 14px 10px 40px', color: '#f5f5f5', fontSize: 14, outline: 'none' }} />
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {['all', 'cleared', 'pending', 'hold', 'inspection'].map(s => (
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

      {/* Grid of Interactive Customs Cards */}
      <motion.div 
        layout 
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
          gap: '20px',
          marginBottom: '32px'
        }}
      >
        {filtered.map((d, i) => {
          const cfg = statusConfig[d.status];
          const StatusIcon = cfg.icon;
          const ModeIcon = modeIcon[d.mode];
          return (
            <motion.div
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -4, borderColor: 'rgba(255, 255, 255, 0.2)', boxShadow: '0 12px 30px rgba(0,0,0,0.6)' }}
              key={d.id}
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
                <span style={{ fontWeight: 700, color: '#a5b4fc', fontSize: '15px' }}>{d.id}</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: cfg.bg, color: cfg.color, padding: '5px 11px', borderRadius: '16px', fontSize: '11px', fontWeight: 600 }}>
                  <StatusIcon size={12} /> {cfg.label}
                </span>
              </div>

              {/* Transit Path Indicator */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.02)', padding: '10px 12px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.04)' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '10px', color: '#666', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Origin</div>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: '#f5f5f5', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{d.origin}</div>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', flexShrink: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#6366f1' }}></div>
                    <div style={{ width: '25px', height: '1px', borderTop: '2px dotted rgba(255,255,255,0.15)' }}></div>
                    <div style={{ background: 'rgba(99,102,241,0.15)', color: '#a5b4fc', padding: '5px', borderRadius: '6px', display: 'flex' }}>
                      <ModeIcon size={12} />
                    </div>
                    <div style={{ width: '25px', height: '1px', borderTop: '2px dotted rgba(255,255,255,0.15)' }}></div>
                    <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#6366f1' }}></div>
                  </div>
                </div>

                <div style={{ flex: 1, textAlign: 'right' }}>
                  <div style={{ fontSize: '10px', color: '#666', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Port of Entry</div>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: '#f5f5f5', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{d.port}</div>
                </div>
              </div>

              {/* Grid properties */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', fontSize: '13px' }}>
                <div>
                  <div style={{ color: '#555', fontSize: '11px', marginBottom: '2px' }}>Shipper</div>
                  <div style={{ fontWeight: 500, color: '#aaa', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.shipper}</div>
                </div>
                <div>
                  <div style={{ color: '#555', fontSize: '11px', marginBottom: '2px' }}>Consignee</div>
                  <div style={{ fontWeight: 500, color: '#aaa', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.consignee}</div>
                </div>
                <div>
                  <div style={{ color: '#555', fontSize: '11px', marginBottom: '2px' }}>Declared Value</div>
                  <div style={{ fontWeight: 600, color: '#22c55e' }}>{d.value}</div>
                </div>
                <div>
                  <div style={{ color: '#555', fontSize: '11px', marginBottom: '2px' }}>HS Code</div>
                  <div style={{ fontWeight: 600, color: '#a5b4fc', fontFamily: 'monospace' }}>{d.hs}</div>
                </div>
              </div>

              {/* Bottom Row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '14px', marginTop: '4px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#666', fontSize: '11px' }}>
                  <FileCheck size={13} style={{ color: '#6366f1' }} /> {d.docs} Docs Attached
                </span>
                <button onClick={() => setSelected(d)} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '6px 12px', color: '#aaa', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, transition: 'all 0.2s' }}>
                  <Eye size={13} /> View
                </button>
              </div>
            </motion.div>
          );
        })}
        {filtered.length === 0 && (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: 48, color: '#555' }}>No declarations match your search.</div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default CustomPage;
