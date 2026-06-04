import React from 'react';
import { motion } from 'framer-motion';
import { 
  Truck, 
  PackageCheck, 
  Clock, 
  CircleDollarSign,
  TrendingUp,
  TrendingDown,
  Plus,
  RefreshCw,
  Search,
  Filter,
  Download
} from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, color, trend, trendValue, desc, delay }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    className="stat-card"
  >
    <div className="stat-header">
      <span className="stat-title">{title}</span>
      <div className={`stat-icon ${color}`}>
        <Icon size={20} />
      </div>
    </div>
    <div className="stat-value">
      {value}
      <span className={`stat-trend ${trend === 'up' ? 'trend-up' : 'trend-down'}`}>
        {trend === 'up' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
        {trendValue}
      </span>
    </div>
    <div className="stat-desc">{desc}</div>
  </motion.div>
);

const Dashboard = () => {
  const shipments = [
    { id: 'SH-2024-001', customer: 'Acme Corp', origin: 'New York, NY', dest: 'Los Angeles, CA', eta: 'May 18, 2024', status: 'transit' },
    { id: 'SH-2024-002', customer: 'Global Tech', origin: 'Chicago, IL', dest: 'Houston, TX', eta: 'May 16, 2024', status: 'delivered' },
    { id: 'SH-2024-003', customer: 'Nexus Ind.', origin: 'Miami, FL', dest: 'Seattle, WA', eta: 'May 20, 2024', status: 'delayed' },
    { id: 'SH-2024-004', customer: 'Stark Co', origin: 'Boston, MA', dest: 'Denver, CO', eta: 'May 19, 2024', status: 'transit' },
  ];

  const getStatusBadge = (status) => {
    switch (status) {
      case 'transit':
        return <span className="status-badge status-transit"><Truck size={14} /> In Transit</span>;
      case 'delivered':
        return <span className="status-badge status-delivered"><PackageCheck size={14} /> Delivered</span>;
      case 'delayed':
        return <span className="status-badge status-delayed"><Clock size={14} /> Delayed</span>;
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
            Dashboard Overview
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="page-subtitle"
          >
            Welcome back! Here's what's happening with your logistics operations.
          </motion.p>
        </div>
        <div className="header-actions">
          <button className="btn">
            <RefreshCw size={16} />
            Refresh
          </button>
          <button className="btn btn-primary">
            <Plus size={16} />
            New Shipment
          </button>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard 
          title="Active Shipments" 
          value="42" 
          icon={Truck} 
          color="neutral" 
          trend="up" 
          trendValue="+12%" 
          desc="Currently in transit"
          delay={0.1}
        />
        <StatCard 
          title="Delivered Today" 
          value="28" 
          icon={PackageCheck} 
          color="neutral" 
          trend="up" 
          trendValue="+8%" 
          desc="Successful deliveries"
          delay={0.2}
        />
        <StatCard 
          title="Pending Orders" 
          value="156" 
          icon={Clock} 
          color="neutral" 
          trend="down" 
          trendValue="-5%" 
          desc="Awaiting processing"
          delay={0.3}
        />
        <StatCard 
          title="Revenue (MTD)" 
          value="$284,590" 
          icon={CircleDollarSign} 
          color="neutral" 
          trend="up" 
          trendValue="+15%" 
          desc="Month to date"
          delay={0.4}
        />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="panel"
      >
        <div className="panel-header" style={{ justifyContent: 'space-between' }}>
          <div>Recent Shipments</div>
          <div className="header-actions">
            <button className="btn"><Filter size={16} /> Filters</button>
            <button className="btn"><Download size={16} /> Export</button>
          </div>
        </div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Tracking ID</th>
                <th>Customer</th>
                <th>Origin</th>
                <th>Destination</th>
                <th>ETA</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {shipments.map((shipment) => (
                <tr 
                  key={shipment.id}
                >
                  <td style={{ fontWeight: 500 }}>{shipment.id}</td>
                  <td>{shipment.customer}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{shipment.origin}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{shipment.dest}</td>
                  <td>{shipment.eta}</td>
                  <td>{getStatusBadge(shipment.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Dashboard;
