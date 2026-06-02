import React, { useState, useMemo } from 'react';
import {
  Search, Plus, Eye, Edit2, Trash2, X, FileText,
  Phone, MapPin, Calendar, DollarSign, Briefcase, Archive, AlertTriangle
} from 'lucide-react';

export interface Deal {
  id: string;
  title: string;
  customerName: string;
  customerPhone: string;
  pickupLocation: string;
  deliveryLocation: string;
  cargoType: string;
  orderedQuantity: number;
  shippedQuantity: number;
  price: number;
  pickupDate: string;
  deliveryDate: string;
  notes: string;
}

interface DealModuleProps {
  deals: Deal[];
  setDeals: React.Dispatch<React.SetStateAction<Deal[]>>;
}

export const DealModule: React.FC<DealModuleProps> = ({ deals, setDeals }) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Modals state
  const [viewDeal, setViewDeal] = useState<Deal | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editDeal, setEditDeal] = useState<Deal | null>(null);
  const [dealToDelete, setDealToDelete] = useState<Deal | null>(null);

  // Form input state
  const [formData, setFormData] = useState<Omit<Deal, 'id' | 'price' | 'orderedQuantity' | 'shippedQuantity'> & { price: string; orderedQuantity: string; shippedQuantity: string }>({
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

  // Calculate statistics
  const stats = useMemo(() => {
    const total = deals.length;
    const revenue = deals.reduce((sum, d) => sum + d.price, 0);
    const ordered = deals.reduce((sum, d) => sum + d.orderedQuantity, 0);
    const shipped = deals.reduce((sum, d) => sum + d.shippedQuantity, 0);

    return { total, revenue, ordered, shipped };
  }, [deals]);

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

  const handleOpenEditModal = (deal: Deal, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditDeal(deal);
    setFormData({
      ...deal,
      price: String(deal.price),
      orderedQuantity: String(deal.orderedQuantity),
      shippedQuantity: String(deal.shippedQuantity)
    });
    setIsFormOpen(true);
  };

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const ordered = Number(formData.orderedQuantity || 0);
    const shipped = Number(formData.shippedQuantity || 0);

    if (editDeal) {
      setDeals(prev =>
        prev.map(d =>
          d.id === editDeal.id
            ? { 
                ...d, 
                ...formData, 
                price: Number(formData.price || 0),
                orderedQuantity: ordered,
                shippedQuantity: shipped
              }
            : d
        )
      );
    } else {
      const newId = `DEAL-${String(deals.length + 1).padStart(3, '0')}`;
      const newDeal: Deal = {
        ...formData,
        id: newId,
        price: Number(formData.price || 0),
        orderedQuantity: ordered,
        shippedQuantity: shipped
      } as unknown as Deal;
      setDeals(prev => [newDeal, ...prev]);
    }
    setIsFormOpen(false);
  };

  const triggerDeleteConfirm = (deal: Deal, e: React.MouseEvent) => {
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

  // Search & Filtered deals
  const filteredDeals = useMemo(() => {
    return deals.filter(deal => {
      return (
        deal.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        deal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        deal.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        deal.pickupLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
        deal.deliveryLocation.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  }, [deals, searchTerm]);

  return (
    <div className="flex flex-col gap-8 p-6 text-slate-100 min-h-screen bg-slate-950">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Deal Management</h1>
          <p className="text-slate-400 text-sm mt-1">Track and coordinate your active logistics deals</p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-950 rounded-lg font-semibold transition cursor-pointer"
        >
          <Plus size={18} />
          Create Deal
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Deals', val: stats.total, desc: 'Active order records', icon: Briefcase },
          { label: 'Total Revenue', val: `$${stats.revenue.toLocaleString()}`, desc: 'Cumulative deals value', icon: DollarSign },
          { label: 'Total Ordered', val: stats.ordered.toLocaleString(), desc: 'Requested units count', icon: Archive },
          { label: 'Total Shipped', val: stats.shipped.toLocaleString(), desc: 'Dispatched units count', icon: Archive }
        ].map((card, idx) => (
          <div key={idx} className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition">
            <div className="flex justify-between items-center text-slate-400 text-xs font-semibold uppercase tracking-wider">
              {card.label}
              <card.icon className="text-slate-400" size={18} />
            </div>
            <div className="text-3xl font-bold text-white mt-3">{card.val}</div>
            <div className="text-slate-500 text-xs mt-2">{card.desc}</div>
          </div>
        ))}
      </div>

      {/* Main Table & Filter Area */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col gap-6">
        <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4">
          {/* Search bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input
              type="text"
              placeholder="Search by ID, customer, route..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-slate-200 pl-10 pr-4 py-2 rounded-lg text-sm focus:outline-none focus:border-slate-700 transition"
            />
          </div>
        </div>

        {/* Table responsive */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-medium">
                <th className="py-4 px-4">Deal ID</th>
                <th className="py-4 px-4">Customer</th>
                <th className="py-4 px-4">Route</th>
                <th className="py-4 px-4">Cargo & Quantities</th>
                <th className="py-4 px-4">Price</th>
                <th className="py-4 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDeals.map((deal) => {
                const isSurplus = deal.shippedQuantity > deal.orderedQuantity;
                const surplusAmount = isSurplus ? (deal.shippedQuantity - deal.orderedQuantity) : 0;
                return (
                  <tr
                    key={deal.id}
                    onClick={() => setViewDeal(deal)}
                    className="border-b border-slate-800/60 hover:bg-slate-800/20 transition cursor-pointer"
                  >
                    <td className="py-4 px-4 font-semibold text-slate-300">{deal.id}</td>
                    <td className="py-4 px-4">
                      <div className="font-medium text-white">{deal.customerName}</div>
                      <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                        <Phone size={10} /> {deal.customerPhone}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-white">{deal.pickupLocation}</span>
                        <span className="text-slate-500">→</span>
                        <span className="font-medium text-white">{deal.deliveryLocation}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-medium text-white">{deal.cargoType}</div>
                      <div className="text-xs text-slate-400">Ordered: {deal.orderedQuantity} / Shipped: {deal.shippedQuantity}</div>
                      {isSurplus && (
                        <div className="text-xs text-slate-300 font-semibold flex items-center gap-1 mt-1 opacity-80">
                          <Archive size={12} /> Storage Surplus: {surplusAmount}
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-4 font-bold text-slate-200">${deal.price.toLocaleString()}</td>
                    <td className="py-4 px-4 text-right">
                      <div
                        className="flex justify-end gap-2"
                        onClick={e => e.stopPropagation()}
                      >
                        <button
                          onClick={() => setViewDeal(deal)}
                          className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition cursor-pointer"
                          title="View details"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={(e) => handleOpenEditModal(deal, e)}
                          className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition cursor-pointer"
                          title="Edit deal"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={(e) => triggerDeleteConfirm(deal, e)}
                          className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-red-400 transition cursor-pointer"
                          title="Delete deal"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredDeals.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-500">
                    No deals match your search settings.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details View Modal */}
      {viewDeal && (
        <div
          onClick={() => setViewDeal(null)}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <div
            onClick={e => e.stopPropagation()}
            className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-xl p-6 relative max-h-[90vh] overflow-y-auto"
          >
            <button
              onClick={() => setViewDeal(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white cursor-pointer"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-300 tracking-wider uppercase">{viewDeal.id}</span>
            </div>
            <h2 className="text-2xl font-bold text-white mt-2 mb-6">{viewDeal.title}</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="flex flex-col gap-4">
                <div>
                  <div className="text-xs text-slate-500 uppercase tracking-wider flex items-center gap-1.5"><Briefcase size={12} /> Customer Name</div>
                  <div className="font-semibold text-white mt-1">{viewDeal.customerName}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 uppercase tracking-wider flex items-center gap-1.5"><Phone size={12} /> Customer Phone</div>
                  <div className="text-slate-300 mt-1">{viewDeal.customerPhone}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 uppercase tracking-wider flex items-center gap-1.5"><MapPin size={12} /> Route / Locations</div>
                  <div className="text-slate-300 mt-1 flex flex-col gap-0.5">
                    <div>Pickup: <span className="font-medium text-white">{viewDeal.pickupLocation}</span></div>
                    <div>Delivery: <span className="font-medium text-white">{viewDeal.deliveryLocation}</span></div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <div>
                  <div className="text-xs text-slate-500 uppercase tracking-wider flex items-center gap-1.5"><Truck size={12} /> Cargo & Quantities</div>
                  <div className="font-semibold text-white mt-1">{viewDeal.cargoType}</div>
                  <div className="text-slate-300 text-sm mt-1">
                    Ordered: <span className="text-white font-medium">{viewDeal.orderedQuantity}</span><br />
                    Shipped: <span className="text-white font-medium">{viewDeal.shippedQuantity}</span>
                  </div>
                  {viewDeal.shippedQuantity > viewDeal.orderedQuantity && (
                    <div className="text-xs text-emerald-400 font-semibold flex items-center gap-1 mt-2">
                      <Archive size={14} /> Surplus Storage: {viewDeal.shippedQuantity - viewDeal.orderedQuantity} units
                    </div>
                  )}
                </div>
                <div>
                  <div className="text-xs text-slate-500 uppercase tracking-wider flex items-center gap-1.5"><Calendar size={12} /> Timeline</div>
                  <div className="text-slate-300 mt-1">
                    <div>Pickup Date: <span className="font-medium text-white">{viewDeal.pickupDate}</span></div>
                    <div>Delivery Date: <span className="font-medium text-white">{viewDeal.deliveryDate}</span></div>
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 uppercase tracking-wider flex items-center gap-1.5"><DollarSign size={12} /> Price / Valuation</div>
                  <div className="text-2xl font-bold text-white mt-1">${viewDeal.price.toLocaleString()}</div>
                </div>
              </div>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-lg p-4">
              <div className="text-xs text-slate-500 uppercase tracking-wider flex items-center gap-1.5 mb-2"><FileText size={12} /> Special Instructions & Notes</div>
              <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                {viewDeal.notes || 'No additional notes provided for this deal.'}
              </p>
            </div>

            <div className="flex justify-end gap-3 mt-8">
              <button
                onClick={(e) => { setViewDeal(null); triggerDeleteConfirm(viewDeal, e); }}
                className="px-4 py-2 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg font-medium transition cursor-pointer"
              >
                Delete Deal
              </button>
              <button
                onClick={(e) => { setViewDeal(null); handleOpenEditModal(viewDeal, e); }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-950 rounded-lg font-medium transition cursor-pointer"
              >
                Edit Deal
              </button>
              <button
                onClick={() => setViewDeal(null)}
                className="px-4 py-2 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg font-medium transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {dealToDelete && (
        <div
          onClick={() => setDealToDelete(null)}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
        >
          <div
            onClick={e => e.stopPropagation()}
            className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-xl p-6 text-center"
          >
            <AlertTriangle className="text-slate-300 mx-auto mb-4" size={48} />
            <h2 className="text-xl font-bold text-white mb-2">Confirm Deal Deletion</h2>
            <p className="text-slate-400 text-sm mb-6 leading-relaxed">
              Are you sure you want to delete the deal created by customer <strong className="text-white">{dealToDelete.customerName}</strong>?<br />
              This action is permanent and cannot be undone.
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setDealToDelete(null)}
                className="px-4 py-2 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg font-medium transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteDeal}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-950 rounded-lg font-medium transition cursor-pointer"
              >
                Delete Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Form Modal */}
      {isFormOpen && (
        <div
          onClick={() => setIsFormOpen(false)}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <div
            onClick={e => e.stopPropagation()}
            className="bg-slate-900 border border-slate-800 w-full max-w-3xl rounded-xl p-6 relative max-h-[90vh] overflow-y-auto"
          >
            <button
              onClick={() => setIsFormOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white cursor-pointer"
            >
              <X size={20} />
            </button>

            <h2 className="text-2xl font-bold text-white mb-6">
              {editDeal ? `Edit Deal ${editDeal.id}` : 'Create Logistics Deal'}
            </h2>

            <form onSubmit={handleFormSubmit} className="flex flex-col gap-6">
              <div>
                <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-3">General Details</h3>
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5">Deal Title / Description</label>
                  <input
                    type="text"
                    name="title"
                    required
                    value={formData.title}
                    onChange={handleFormChange}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-slate-700 transition"
                  />
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-3">Customer Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1.5">Customer Name</label>
                    <input
                      type="text"
                      name="customerName"
                      required
                      value={formData.customerName}
                      onChange={handleFormChange}
                      className="w-full bg-slate-950 border border-slate-800 text-slate-200 px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-slate-700 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1.5">Customer Phone</label>
                    <input
                      type="text"
                      name="customerPhone"
                      required
                      value={formData.customerPhone}
                      onChange={handleFormChange}
                      className="w-full bg-slate-950 border border-slate-800 text-slate-200 px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-slate-700 transition"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-3">Route & Cargo Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1.5">Pickup Location</label>
                    <input
                      type="text"
                      name="pickupLocation"
                      required
                      value={formData.pickupLocation}
                      onChange={handleFormChange}
                      className="w-full bg-slate-950 border border-slate-800 text-slate-200 px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-slate-700 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1.5">Delivery Location</label>
                    <input
                      type="text"
                      name="deliveryLocation"
                      required
                      value={formData.deliveryLocation}
                      onChange={handleFormChange}
                      className="w-full bg-slate-950 border border-slate-800 text-slate-200 px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-slate-700 transition"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1.5">Cargo Type</label>
                    <input
                      type="text"
                      name="cargoType"
                      required
                      placeholder="e.g. Sneakers"
                      value={formData.cargoType}
                      onChange={handleFormChange}
                      className="w-full bg-slate-950 border border-slate-800 text-slate-200 px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-slate-700 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1.5">Ordered Quantity</label>
                    <input
                      type="number"
                      name="orderedQuantity"
                      required
                      placeholder="e.g. 200"
                      value={formData.orderedQuantity}
                      onChange={handleFormChange}
                      className="w-full bg-slate-950 border border-slate-800 text-slate-200 px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-slate-700 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1.5">Shipped Quantity</label>
                    <input
                      type="number"
                      name="shippedQuantity"
                      required
                      placeholder="e.g. 450"
                      value={formData.shippedQuantity}
                      onChange={handleFormChange}
                      className="w-full bg-slate-950 border border-slate-800 text-slate-200 px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-slate-700 transition"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5">Price (USD)</label>
                  <input
                    type="number"
                    name="price"
                    required
                    value={formData.price}
                    onChange={handleFormChange}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-slate-700 transition"
                  />
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-3">Timeline & Notes</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1.5">Pickup Date</label>
                    <input
                      type="date"
                      name="pickupDate"
                      required
                      value={formData.pickupDate}
                      onChange={handleFormChange}
                      className="w-full bg-slate-950 border border-slate-800 text-slate-200 px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-slate-700 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1.5">Delivery Date</label>
                    <input
                      type="date"
                      name="deliveryDate"
                      required
                      value={formData.deliveryDate}
                      onChange={handleFormChange}
                      className="w-full bg-slate-950 border border-slate-800 text-slate-200 px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-slate-700 transition"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5">Special Instructions / Notes</label>
                  <textarea
                    name="notes"
                    rows={3}
                    value={formData.notes}
                    onChange={handleFormChange}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-slate-700 transition resize-y"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg font-medium transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-950 rounded-lg font-medium transition cursor-pointer"
                >
                  {editDeal ? 'Save Changes' : 'Create Deal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
