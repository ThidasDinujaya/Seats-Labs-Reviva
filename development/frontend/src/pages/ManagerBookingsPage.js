import React, { useState, useEffect } from 'react';
import { 
    Search, Plus, 
    X, Eye, Edit2, Trash2, CheckCircle, Clock, AlertCircle
} from 'lucide-react';
import SidebarLayout from '../components/SidebarLayout';
import { bookingApi, technicianApi } from '../api/api';
import { formatTime } from '../utils/formatters';

const ManagerBookingsPage = () => {
    const [bookings, setBookings] = useState([]);
    const [technicians, setTechnicians] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [sortOrder, setSortOrder] = useState('newest');
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('view');
    const [selectedId, setSelectedId] = useState(null);
    const [formData, setFormData] = useState({
        bookingId: '',
        customerFirstName: '',
        customerLastName: '',
        vehicleModel: '',
        vehicleRegNumber: '',
        serviceName: '',
        bookingDate: '',
        bookingStartTime: '',
        bookingStatus: 'pending',
        bookingCustomerNotes: '',
        technicianId: null,
        technicianFirstName: '',
        technicianLastName: ''
    });

    useEffect(() => {
        fetchBookings();
        fetchTechnicians();
    }, []);

    const fetchBookings = async () => {
        try {
            setLoading(true);
            const res = await bookingApi.getAll();
            if (res.success) {
                setBookings(res.data);
            }
        } catch (error) {
            console.error('Failed to fetch bookings:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchTechnicians = async () => {
        try {
            const res = await technicianApi.getAll();
            if (res.success) {
                setTechnicians(res.data);
            }
        } catch (error) {
            console.error('Failed to fetch technicians:', error);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed': return { bg: '#ecfdf5', text: '#10b981', icon: <CheckCircle size={14} /> };
            case 'in_progress': return { bg: '#eff6ff', text: '#3b82f6', icon: <Clock size={14} /> };
            case 'accepted': return { bg: '#f0f9ff', text: '#0ea5e9', icon: <CheckCircle size={14} /> };
            case 'pending': return { bg: '#fff7ed', text: '#f59e0b', icon: <AlertCircle size={14} /> };
            case 'rejected':
            case 'cancelled': return { bg: '#fef2f2', text: '#ef4444', icon: <X size={14} /> };
            default: return { bg: '#f1f5f9', text: '#64748b', icon: null };
        }
    };

    const handleOpenModal = (mode, booking = null) => {
        setModalMode(mode);
        if (booking) {
            setFormData(booking);
        } else {
            setFormData({
                bookingId: '',
                customerFirstName: '',
                customerLastName: '',
                vehicleModel: '',
                vehicleRegNumber: '',
                serviceName: '',
                bookingDate: '',
                bookingStartTime: '',
                bookingStatus: 'pending',
                bookingCustomerNotes: ''
            });
        }
        setShowModal(true);
    };

    const filteredBookings = bookings
        .filter(b => 
            ((b.customerFirstName + ' ' + b.customerLastName).toLowerCase().includes(searchTerm.toLowerCase()) || 
             b.vehicleRegNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
             b.bookingId?.toString().includes(searchTerm)) &&
            (statusFilter === 'all' || b.bookingStatus === statusFilter)
        )
        .sort((a, b) => sortOrder === 'newest' ? b.bookingId - a.bookingId : a.bookingId - b.bookingId);

    const viewOnly = modalMode === 'view' || formData.bookingStatus === 'rejected' || formData.bookingStatus === 'cancelled';

    return (
        <SidebarLayout role="manager">
            <div style={{ height: 'calc(100vh - 140px)', display: 'flex', flexDirection: 'column', padding: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '30px' }}>
                    <div>
                        <h1 style={{ fontSize: '1.875rem', fontWeight: '800', color: '#1e293b', marginBottom: '8px' }}>Booking Management</h1>
                        <p style={{ color: '#64748b', fontSize: '1rem' }}>Manage customer service appointments and scheduling</p>
                    </div>
                </div>

                <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', padding: '24px', flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    <div style={{ display: 'flex', gap: '15px', marginBottom: '25px' }}>
                        <div style={{ position: 'relative', flex: 1 }}>
                            <Search style={{ position: 'absolute', left: '12px', top: '12px', color: '#94a3b8' }} size={20} />
                            <input 
                                type="text" 
                                placeholder="Search by ID, customer or vehicle number..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none' }} 
                            />
                        </div>
                        <select 
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            style={{ padding: '12px 15px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', outline: 'none', minWidth: '150px' }}
                        >
                            <option value="all">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="accepted">Accepted</option>
                            <option value="in_progress">In Progress</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                            <option value="rejected">Rejected</option>
                        </select>
                        <select 
                            value={sortOrder}
                            onChange={(e) => setSortOrder(e.target.value)}
                            style={{ padding: '12px 15px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', outline: 'none', minWidth: '150px' }}
                        >
                            <option value="newest">Sort: Newest</option>
                            <option value="oldest">Sort: Oldest</option>
                        </select>
                    </div>

                    <div style={{ overflowY: 'auto', flex: 1, overflowX: 'auto', border: '1px solid #f1f5f9', borderRadius: '8px' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid #f1f5f9', textAlign: 'left', position: 'sticky', top: 0, background: 'white', zIndex: 1 }}>
                                    <th style={{ padding: '15px', color: '#64748b', fontWeight: 'bold' }}>bookingId</th>
                                    <th style={{ padding: '15px', color: '#64748b', fontWeight: 'bold' }}>customerId</th>
                                    <th style={{ padding: '15px', color: '#64748b', fontWeight: 'bold' }}>vehicleId</th>
                                    <th style={{ padding: '15px', color: '#64748b', fontWeight: 'bold' }}>serviceId</th>
                                    <th style={{ padding: '15px', color: '#64748b', fontWeight: 'bold' }}>bookingDate</th>
                                    <th style={{ padding: '15px', color: '#64748b', fontWeight: 'bold' }}>technicianId</th>
                                    <th style={{ padding: '15px', color: '#64748b', fontWeight: 'bold', textAlign: 'right' }}>bookingStatus</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="7" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>Loading booking...</td></tr>
                                ) : filteredBookings.length === 0 ? (
                                    <tr><td colSpan="7" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>No booking found.</td></tr>
                                ) : (
                                    filteredBookings.map(booking => (
                                        <tr 
                                            key={booking.bookingId} 
                                            onClick={() => setSelectedId(selectedId === booking.bookingId ? null : booking.bookingId)}
                                            style={{ 
                                                borderBottom: '1px solid #f1f5f9', 
                                                transition: 'background 0.2s', 
                                                cursor: 'pointer',
                                                background: selectedId === booking.bookingId ? '#f1f5f9' : 'transparent'
                                            }}
                                        >
                                            <td style={{ padding: '15px', fontWeight: '600' }}>#{booking.bookingId}</td>
                                            <td style={{ padding: '15px' }}>{booking.customerFirstName} {booking.customerLastName}</td>
                                            <td style={{ padding: '15px' }}>
                                                <div>{booking.vehicleModel}</div>
                                                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{booking.vehicleRegNumber}</div>
                                            </td>
                                            <td style={{ padding: '15px' }}>{booking.serviceName}</td>
                                            <td style={{ padding: '15px' }}>
                                                <div>{booking.bookingDate}</div>
                                                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{formatTime(booking.bookingStartTime)}</div>
                                            </td>
                                            <td style={{ padding: '15px' }}>
                                                {booking.technicianFirstName && booking.technicianLastName ? (
                                                    <div>
                                                        <div>{booking.technicianFirstName} {booking.technicianLastName}</div>
                                                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{booking.technicianSpecialization || 'General'}</div>
                                                    </div>
                                                ) : (
                                                    <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Not assigned</span>
                                                )}
                                            </td>
                                            <td style={{ padding: '15px', textAlign: 'right' }}>
                                                <span style={{ 
                                                    padding: '6px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600',
                                                    background: getStatusColor(booking.bookingStatus).bg, color: getStatusColor(booking.bookingStatus).text,
                                                    display: 'inline-flex', alignItems: 'center', gap: '5px'
                                                }}>
                                                    {getStatusColor(booking.bookingStatus).icon}
                                                    {booking.bookingStatus.charAt(0).toUpperCase() + booking.bookingStatus.slice(1)}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', padding: '20px 0 0 0', borderTop: '1px solid #f1f5f9', marginTop: '10px' }}>
                        {(() => {
                            const selectedBooking = bookings.find(b => b.bookingId === selectedId);
                            const isActionable = selectedId && selectedBooking?.bookingStatus !== 'rejected' && selectedBooking?.bookingStatus !== 'cancelled';
                            
                            return (
                                <>
                                    <button onClick={() => handleOpenModal('add')} style={{ padding: '10px 24px', borderRadius: '8px', border: 'none', background: 'var(--navy)', color: 'white', cursor: 'pointer', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <Plus size={18} /> Add Booking
                                    </button>
                                    <button 
                                        onClick={() => {
                                            if (selectedBooking) handleOpenModal('edit', selectedBooking);
                                        }} 
                                        disabled={!isActionable}
                                        style={{ padding: '10px 24px', borderRadius: '8px', border: 'none', background: isActionable ? '#3b82f6' : '#f1f5f9', color: isActionable ? 'white' : '#94a3b8', cursor: isActionable ? 'pointer' : 'default', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}
                                    >
                                        <Edit2 size={18} /> Update Booking
                                    </button>
                                    <button 
                                        onClick={() => {
                                            if (selectedBooking) handleOpenModal('view', selectedBooking);
                                        }} 
                                        disabled={!selectedId}
                                        style={{ padding: '10px 24px', borderRadius: '8px', border: 'none', background: selectedId ? 'var(--yellow)' : '#f1f5f9', color: selectedId ? 'black' : '#94a3b8', cursor: selectedId ? 'pointer' : 'default', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}
                                    >
                                        <Eye size={18} /> View Booking
                                    </button>
                                    <button 
                                        onClick={async () => {
                                            if (selectedId && window.confirm('Cancel this booking?')) {
                                                try {
                                                    const res = await bookingApi.cancel(selectedId);
                                                    if (res.success) {
                                                        alert('Booking cancelled successfully!');
                                                        setSelectedId(null);
                                                        fetchBookings();
                                                    }
                                                } catch (err) {
                                                    console.error(err);
                                                    alert('Failed to cancel booking');
                                                }
                                            }
                                        }} 
                                        disabled={!isActionable}
                                        style={{ padding: '10px 24px', borderRadius: '8px', border: 'none', background: isActionable ? '#ef4444' : '#f1f5f9', color: isActionable ? 'white' : '#94a3b8', cursor: isActionable ? 'pointer' : 'default', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}
                                    >
                                        <Trash2 size={18} /> Cancel Booking
                                    </button>
                                </>
                            );
                        })()}
                    </div>
                </div>

                {showModal && (
                    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000 }}>
                        <div style={{ background: 'white', borderRadius: '16px', width: '600px', maxWidth: '90%', maxHeight: '90vh', overflowY: 'auto' }}>
                            <div style={{ padding: '20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: 'white', zIndex: 10 }}>
                                <h2 style={{ margin: 0, color: '#1e293b' }}>{modalMode === 'add' ? 'New Booking' : modalMode === 'view' ? 'Booking Details' : 'Edit Booking'}</h2>
                                <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={24} /></button>
                            </div>
                            <div style={{ padding: '25px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Customer Name</label>
                                        <input type="text" value={formData.customerFirstName + ' ' + formData.customerLastName} disabled style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc' }} />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Service</label>
                                        <select value={formData.serviceName} onChange={(e) => setFormData({...formData, serviceName: e.target.value})} disabled={viewOnly} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                                            <option value="">Select Service</option>
                                            <option value="Hybrid Battery Health Check">Hybrid Battery Health Check</option>
                                            <option value="Full Lubrication Service">Full Lubrication Service</option>
                                        </select>
                                    </div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Vehicle Model</label>
                                        <input type="text" value={formData.vehicleModel} onChange={(e) => setFormData({...formData, vehicleModel: e.target.value})} disabled={viewOnly} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Reg Number</label>
                                        <input type="text" value={formData.vehicleRegNumber} onChange={(e) => setFormData({...formData, vehicleRegNumber: e.target.value})} disabled={viewOnly} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                                    </div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Booking Date</label>
                                        <input type="date" value={formData.bookingDate} onChange={(e) => setFormData({...formData, bookingDate: e.target.value})} disabled={viewOnly} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Start Time</label>
                                        <input type="time" value={formData.bookingStartTime} onChange={(e) => setFormData({...formData, bookingStartTime: e.target.value})} disabled={viewOnly} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                                    </div>
                                </div>
                                <div style={{ marginBottom: '20px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Booking Status</label>
                                    <select value={formData.bookingStatus} onChange={(e) => setFormData({...formData, bookingStatus: e.target.value})} disabled={viewOnly} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                                        <option value="pending">Pending</option>
                                        <option value="accepted">Accepted</option>
                                        <option value="rejected">Rejected</option>
                                    </select>
                                </div>
                                
                                {/* Assigned Technician - Only shown when booking is accepted or beyond */}
                                {['accepted', 'in_progress', 'completed'].includes(formData.bookingStatus) && (
                                    <div style={{ marginBottom: '20px' }}>
                                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Assigned Technician</label>
                                        <select 
                                            value={formData.technicianId || ''} 
                                            onChange={(e) => setFormData({...formData, technicianId: e.target.value})} 
                                            disabled={viewOnly} 
                                            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                                        >
                                            <option value="">-- Select Technician --</option>
                                            {technicians.map(tech => (
                                                <option key={tech.technicianId} value={tech.technicianId}>
                                                    {tech.technicianFirstName} {tech.technicianLastName} - {tech.technicianSpecialization || 'General'}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                                
                                <div style={{ marginBottom: '20px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Customer Notes</label>
                                    <textarea value={formData.bookingCustomerNotes} onChange={(e) => setFormData({...formData, bookingCustomerNotes: e.target.value})} disabled={viewOnly} rows="4" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', resize: 'vertical' }} />
                                </div>
                            </div>
                             {!viewOnly && (
                                <div style={{ padding: '20px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '10px', position: 'sticky', bottom: 0, background: 'white', zIndex: 10 }}>
                                    <button onClick={() => setShowModal(false)} style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #cbd5e1', background: 'white', cursor: 'pointer' }}>Cancel</button>
                                    <button 
                                        onClick={async () => {
                                            try {
                                                const res = await bookingApi.update(formData.bookingId, formData);
                                                if (res.success) {
                                                    alert('Booking updated successfully!');
                                                    setShowModal(false);
                                                    fetchBookings();
                                                }
                                            } catch (err) {
                                                console.error(err);
                                                alert('Failed to update booking');
                                            }
                                        }}
                                        style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: 'var(--navy)', color: 'white', cursor: 'pointer' }}
                                    >
                                        {modalMode === 'add' ? 'Create Booking' : 'Save Changes'}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </SidebarLayout>
    );
};

export default ManagerBookingsPage;
