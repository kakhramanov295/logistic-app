import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Search, Download, Eye,
  AlertTriangle, CheckCircle, Clock, XCircle,
  X, Ship, Plane, Truck, Package, Calendar, Hash,
  Globe, User, DollarSign, Tag, FileCheck
} from 'lucide-react';

const statusConfig = {
  waiting:  { label: 'Waiting',   color: '#f5f5f5', bg: 'rgba(255,255,255,0.08)', icon: Clock },
  received: { label: 'Received',  color: '#f5f5f5', bg: 'rgba(255,255,255,0.12)', icon: CheckCircle },
  rejected: { label: 'Rejected',  color: '#f5f5f5', bg: 'rgba(255,255,255,0.06)', icon: XCircle },
  going:    { label: 'Going',     color: '#f5f5f5', bg: 'rgba(255,255,255,0.10)', icon: AlertTriangle },
};

const modeIcon = { sea: Ship, air: Plane, road: Truck, courier: Package };

const stats = [
  { label: 'Total Declarations', value: '128', sub: 'This month',       icon: FileText,      color: '#f5f5f5' },
  { label: 'Received',           value: '94',  sub: '73% success rate', icon: CheckCircle,   color: '#f5f5f5' },
  { label: 'Waiting',            value: '21',  sub: 'Awaiting review',  icon: Clock,         color: '#f5f5f5' },
  { label: 'Rejected',           value: '13',  sub: 'Requires action',  icon: XCircle,       color: '#f5f5f5' },
];

/* ─── Detail Modal ─────────────────────────────────────────────────────────── */
const DetailModal = ({ record, onClose, declarations, setDeclarations }) => {
  const [local, setLocal] = useState({ ...record, documents: [...(record.documents || [])] });
  const [saved, setSaved] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const cfg = statusConfig[local.status] || statusConfig['pending'];
  const ModeIcon = modeIcon[local.mode] || Ship;
  const StatusIcon = cfg.icon;

  const updateLocal = (changes) => setLocal(prev => ({ ...prev, ...changes }));

  const addDoc = (doc) => updateLocal({ documents: [...local.documents, doc] });

  const handleSave = () => {
    setDeclarations(declarations.map(d => d.id === local.id ? { ...local } : d));
    setSaved(true);
    setTimeout(() => setSaved(false), 2200);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.72)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 24 }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }}
        onClick={e => e.stopPropagation()}
        style={{ background: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: 32, width: '100%', maxWidth: 640, maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}
      >
        {/* Close */}
        <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: 8, padding: 8, cursor: 'pointer', color: '#888', display: 'flex' }}>
          <X size={18} />
        </button>

        {/* Title row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 12, padding: 10, color: '#f5f5f5' }}>
            <FileText size={22} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 18 }}>{local.id}</div>
            <div style={{ color: '#888', fontSize: 13 }}>Customs Declaration</div>
          </div>
          <span style={{ marginLeft: 'auto', background: cfg.bg, color: cfg.color, padding: '6px 14px', borderRadius: 20, fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
            <StatusIcon size={14} /> {cfg.label}
          </span>
        </div>

        {/* Info grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
          {[
            { label: 'Shipper',        value: local.shipper,  icon: User, onChange: (val) => updateLocal({ shipper: val }) },
            { label: 'Consignee',      value: local.consignee, icon: User, onChange: (val) => updateLocal({ consignee: val }) },
            { label: 'Origin',         value: local.origin,   icon: Globe, onChange: (val) => updateLocal({ origin: val }) },
            { label: 'Port of Entry',  value: local.port,     icon: Globe, onChange: (val) => updateLocal({ port: val }) },
            {
              label: 'Transport Mode',
              icon: ModeIcon,
              customRender: isEditing ? (
                <select
                  value={local.mode}
                  onChange={e => updateLocal({ mode: e.target.value })}
                  style={{
                    width: '100%',
                    background: 'transparent',
                    border: 'none',
                    color: '#f5f5f5',
                    fontSize: '14px',
                    fontWeight: 600,
                    outline: 'none',
                    padding: 0,
                    marginTop: 2,
                    cursor: 'pointer'
                  }}
                >
                  <option value="sea" style={{ background: '#111', color: '#f5f5f5' }}>Sea</option>
                  <option value="air" style={{ background: '#111', color: '#f5f5f5' }}>Air</option>
                  <option value="road" style={{ background: '#111', color: '#f5f5f5' }}>Road</option>
                  <option value="courier" style={{ background: '#111', color: '#f5f5f5' }}>Courier</option>
                </select>
              ) : (
                <div style={{ fontWeight: 600, fontSize: 14, color: '#f5f5f5', marginTop: 2 }}>
                  {local.mode ? local.mode.charAt(0).toUpperCase() + local.mode.slice(1) : '—'}
                </div>
              )
            },
            { label: 'Declared Value', value: local.value,    icon: DollarSign, onChange: (val) => updateLocal({ value: val }) },
            { label: 'HS Code',        value: local.hs,       icon: Hash, onChange: (val) => updateLocal({ hs: val }) },
            {
              label: 'Customs Duties',
              icon: DollarSign,
              customRender: (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%' }}>
                  {isEditing ? (
                    <input
                      type="text"
                      value={local.spendings || ''}
                      onChange={e => updateLocal({ spendings: e.target.value })}
                      placeholder="—"
                      style={{
                        width: '60px',
                        background: 'transparent',
                        border: 'none',
                        color: '#f5f5f5',
                        fontSize: '14px',
                        fontWeight: 600,
                        outline: 'none',
                        padding: 0
                      }}
                    />
                  ) : (
                    <span style={{ fontWeight: 600, fontSize: 14, color: '#f5f5f5' }}>{local.spendings || '—'}</span>
                  )}
                  <span style={{
                    fontSize: 10, padding: '2px 6px', borderRadius: 4,
                    background: local.paymentStatus === 'paid' ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.03)',
                    color: local.paymentStatus === 'paid' ? '#f5f5f5' : '#888',
                    border: '1px solid rgba(255,255,255,0.08)', fontWeight: 600
                  }}>
                    {local.paymentStatus === 'paid' ? 'Paid' : 'Unpaid'}
                  </span>
                </div>
              ),
            },
            { label: 'Fees Purpose', value: local.spendingBreakdown || '', icon: Tag, onChange: (val) => updateLocal({ spendingBreakdown: val }) },
            { label: 'Filed Date',   value: local.date, icon: Calendar, onChange: (val) => updateLocal({ date: val }) },
          ].map(({ label, value, icon: Icon, onChange, customRender }) => (
            <div key={label} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: '13px 15px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ color: '#666', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
                <Icon size={13} /> {label}
              </div>
              {customRender ? customRender : (
                isEditing ? (
                  <input
                    type="text"
                    value={value || ''}
                    onChange={e => onChange(e.target.value)}
                    style={{
                      width: '100%',
                      background: 'transparent',
                      border: 'none',
                      color: '#f5f5f5',
                      fontSize: '14px',
                      fontWeight: 600,
                      outline: 'none',
                      padding: 0,
                      marginTop: 2
                    }}
                  />
                ) : (
                  <div style={{ fontWeight: 600, fontSize: 14, color: '#f5f5f5', marginTop: 2 }}>{value || '—'}</div>
                )
              )}
            </div>
          ))}
        </div>

        {/* Documents */}
        <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: 16, border: '1px solid rgba(255,255,255,0.06)', marginBottom: 16 }}>
          <div style={{ color: '#666', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
            <Tag size={13} /> Attached Documents ({local.documents.length})
          </div>

          {/* Document chips */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
            {local.documents.map((doc, idx) => {
              const name = typeof doc === 'object' ? doc.name : doc;
              const url  = typeof doc === 'object' ? doc.url  : 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
              return (
                <a key={idx} href={url} target="_blank" rel="noopener noreferrer"
                  style={{ background: 'rgba(255,255,255,0.07)', color: '#f5f5f5', padding: '5px 11px', borderRadius: 8, fontSize: 12, fontWeight: 500, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 5, border: '1px solid rgba(255,255,255,0.06)', transition: 'all 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.13)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; }}
                >
                  <FileText size={11} /> {name} ↗
                </a>
              );
            })}
          </div>

          {/* Upload local file */}
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <label
              style={{ flex: 1, background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.14)', borderRadius: 8, padding: '10px 14px', color: '#777', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, transition: 'all 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.28)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.14)'}
            >
              <Download size={13} style={{ transform: 'rotate(180deg)', color: '#666' }} />
              Upload Local File
              <input type="file" style={{ display: 'none' }} onChange={e => {
                const file = e.target.files[0];
                if (!file) return;
                addDoc({ name: file.name, url: URL.createObjectURL(file) });
                e.target.value = '';
              }} />
            </label>
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {isEditing ? (
            <>
              {/* Cancel Edit */}
              <button
                onClick={() => {
                  setLocal({ ...record, documents: [...(record.documents || [])] });
                  setIsEditing(false);
                }}
                style={{ flex: 1, padding: '11px 0', borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#f5f5f5', fontWeight: 600, cursor: 'pointer', fontSize: 14 }}
              >
                Cancel
              </button>

              {/* Save */}
              <button
                onClick={() => {
                  handleSave();
                  setIsEditing(false);
                }}
                style={{
                  flex: 1, padding: '11px 0', borderRadius: 10,
                  background: saved ? 'rgba(255,255,255,0.18)' : '#f5f5f5',
                  border: 'none',
                  color: saved ? '#f5f5f5' : '#0a0a0a',
                  fontWeight: 700, cursor: 'pointer', fontSize: 14,
                  transition: 'all 0.35s',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
                }}
              >
                {saved ? '✓ Saved!' : 'Save'}
              </button>
            </>
          ) : (
            <>
              {/* Pay or Toggle */}
              {local.paymentStatus === 'unpaid' ? (
                <button
                  onClick={() => {
                    const newDocs = [...local.documents, { name: 'Customs Fee Receipt', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' }];
                    setDeclarations(declarations.map(d => d.id === local.id ? { ...local, paymentStatus: 'paid', status: 'received', documents: newDocs } : d));
                    updateLocal({
                      paymentStatus: 'paid', status: 'received',
                      documents: newDocs
                    });
                  }}
                  style={{ flex: 1, padding: '11px 0', borderRadius: 10, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#f5f5f5', fontWeight: 600, cursor: 'pointer', fontSize: 14 }}
                >
                  Pay Fees &amp; Release
                </button>
              ) : (
                <button
                  onClick={() => {
                    const nextStatus = local.status === 'received' ? 'rejected' : 'received';
                    setDeclarations(declarations.map(d => d.id === local.id ? { ...local, status: nextStatus } : d));
                    updateLocal({ status: nextStatus });
                  }}
                  style={{ flex: 1, padding: '11px 0', borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#f5f5f5', fontWeight: 600, cursor: 'pointer', fontSize: 14 }}
                >
                  Toggle Status ({local.status === 'received' ? 'Reject' : 'Receive'})
                </button>
              )}

              {/* Export */}
              <button style={{ flex: 1, padding: '11px 0', borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#f5f5f5', fontWeight: 600, cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <Download size={15} /> Export PDF
              </button>

              {/* Change Info Button */}
              <button
                onClick={() => setIsEditing(true)}
                style={{
                  flex: 1, padding: '11px 0', borderRadius: 10,
                  background: '#f5f5f5',
                  border: 'none',
                  color: '#0a0a0a',
                  fontWeight: 700, cursor: 'pointer', fontSize: 14,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
                }}
              >
                Change Info
              </button>
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

/* ─── CustomPage ────────────────────────────────────────────────────────────── */
const CustomPage = ({ declarations, setDeclarations }) => {
  const [search, setSearch]           = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selected, setSelected]       = useState(null);

  const filtered = declarations.filter(d => {
    const matchSearch = !search
      || d.id.toLowerCase().includes(search.toLowerCase())
      || d.shipper.toLowerCase().includes(search.toLowerCase())
      || d.consignee.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || d.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }} className="main-content">
      <AnimatePresence>
        {selected && (
          <DetailModal
            record={selected}
            onClose={() => setSelected(null)}
            declarations={declarations}
            setDeclarations={setDeclarations}
          />
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="header">
        <div>
          <h1 className="page-title">Customs Clearance</h1>
          <p className="page-subtitle">Manage import/export declarations and clearance status</p>
        </div>
        <div className="header-actions">
          <button className="btn"><Download size={16} /> Export</button>
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
          {['all', 'waiting', 'received', 'rejected', 'going'].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              style={{
                padding: '9px 16px', borderRadius: 10, border: '1px solid', fontWeight: 600, fontSize: 13, cursor: 'pointer', textTransform: 'capitalize', transition: 'all 0.2s',
                borderColor: statusFilter === s ? '#f5f5f5' : 'rgba(255,255,255,0.1)',
                background: statusFilter === s ? 'rgba(255,255,255,0.1)' : 'transparent',
                color: statusFilter === s ? '#f5f5f5' : '#888'
              }}>
              {s === 'all' ? 'All' : statusConfig[s].label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Cards grid */}
      <motion.div layout style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 20, marginBottom: 32 }}>
        {filtered.map((d, i) => {
          const cfg = statusConfig[d.status] || statusConfig['pending'];
          const StatusIcon = cfg.icon;
          const ModeIcon = modeIcon[d.mode] || Ship;
          return (
            <motion.div
              layout
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              whileHover={{ y: -4, borderColor: 'rgba(255,255,255,0.2)', boxShadow: '0 12px 30px rgba(0,0,0,0.6)' }}
              key={d.id}
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: 22, display: 'flex', flexDirection: 'column', gap: 18, transition: 'border-color 0.25s, box-shadow 0.25s', position: 'relative' }}
            >
              {/* Card header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700, color: '#f5f5f5', fontSize: 15 }}>{d.id}</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: cfg.bg, color: cfg.color, padding: '5px 11px', borderRadius: 16, fontSize: 11, fontWeight: 600 }}>
                  <StatusIcon size={12} /> {cfg.label}
                </span>
              </div>

              {/* Transit path */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.02)', padding: '10px 12px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.04)' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 10, color: '#666', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Origin</div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#f5f5f5', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{d.origin}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                  <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#f5f5f5' }} />
                  <div style={{ width: 22, height: 1, borderTop: '2px dotted rgba(255,255,255,0.15)' }} />
                  <div style={{ background: 'rgba(255,255,255,0.08)', color: '#f5f5f5', padding: 5, borderRadius: 6, display: 'flex' }}><ModeIcon size={12} /></div>
                  <div style={{ width: 22, height: 1, borderTop: '2px dotted rgba(255,255,255,0.15)' }} />
                  <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#f5f5f5' }} />
                </div>
                <div style={{ flex: 1, textAlign: 'right' }}>
                  <div style={{ fontSize: 10, color: '#666', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Port of Entry</div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#f5f5f5', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{d.port}</div>
                </div>
              </div>

              {/* Shipper / consignee / value / hs */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, fontSize: 13 }}>
                <div>
                  <div style={{ color: '#555', fontSize: 11, marginBottom: 2 }}>Shipper</div>
                  <div style={{ fontWeight: 500, color: '#aaa', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.shipper}</div>
                </div>
                <div>
                  <div style={{ color: '#555', fontSize: 11, marginBottom: 2 }}>Consignee</div>
                  <div style={{ fontWeight: 500, color: '#aaa', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.consignee}</div>
                </div>
                <div>
                  <div style={{ color: '#555', fontSize: 11, marginBottom: 2 }}>Declared Value</div>
                  <div style={{ fontWeight: 600, color: '#f5f5f5' }}>{d.value}</div>
                </div>
                <div>
                  <div style={{ color: '#555', fontSize: 11, marginBottom: 2 }}>HS Code</div>
                  <div style={{ fontWeight: 600, color: '#f5f5f5', fontFamily: 'monospace' }}>{d.hs}</div>
                </div>
              </div>

              {/* Spendings */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.01)', padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.03)' }}>
                <div>
                  <div style={{ fontSize: 10, color: '#666' }}>Customs Duties / Fees</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontWeight: 700, fontSize: 13, color: '#f5f5f5' }}>{d.spendings || '—'}</span>
                    <span style={{ fontSize: 9, padding: '1px 4px', borderRadius: 3, background: d.paymentStatus === 'paid' ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.03)', color: d.paymentStatus === 'paid' ? '#f5f5f5' : '#888', border: '1px solid rgba(255,255,255,0.08)', fontWeight: 600 }}>
                      {d.paymentStatus === 'paid' ? 'Paid' : 'Unpaid'}
                    </span>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 9, color: '#555' }}>Breakdown</div>
                  <div style={{ fontSize: 11, color: '#aaa', maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={d.spendingBreakdown}>{d.spendingBreakdown || 'N/A'}</div>
                </div>
              </div>

              {/* Bottom */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 14, marginTop: 4 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#666', fontSize: 11 }}>
                  <FileCheck size={13} style={{ color: '#f5f5f5' }} /> {(d.documents || []).length} Docs Attached
                </span>
                <button onClick={() => setSelected(d)} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '6px 12px', color: '#aaa', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, transition: 'all 0.2s' }}>
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
