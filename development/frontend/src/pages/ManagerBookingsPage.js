import React, { useState, useEffect } from 'react';
import { 
    Search,
    X, Eye, Edit2, Trash2, CheckCircle, Clock
} from 'lucide-react';
import SidebarLayout from '../components/SidebarLayout';
import { bookingApi, technicianApi } from '../api/api';


const ManagerBookingsPage = () => {
    const [bookings, setBookings] = useState([]);
    const [technicians, setTechnicians] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

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
        const s = status?.toLowerCase();
        switch (s) {
            case 'completed': return { bg: '#ecfdf5', text: '#10b981', icon: <CheckCircle size={14} /> };
            case 'in_progress': case 'in-progress': return { bg: '#eff6ff', text: '#3b82f6', icon: <Clock size={14} /> };
            case 'accepted': case 'confirmed': return { bg: '#f0f9ff', text: '#0ea5e9', icon: <CheckCircle size={14} /> };
            case 'pending': return { bg: '#fff7ed', text: '#f59e0b', icon: <Clock size={14} /> };
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

    const filteredBookings = bookings.filter(b =>
        String(b.bookingId || '').includes(searchTerm) ||
        (b.bookingRefNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (b.bookingStatus || '').toLowerCase().includes(searchTerm.toLowerCase())
    );



    return (
        <SidebarLayout role="manager">
            <div style={{ height: 'calc(100vh - 140px)', display: 'flex', flexDirection: 'column', padding: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '30px' }}>
                    <div>
                        <h1 style={{ fontSize: '1.875rem', fontWeight: '800', color: '#1e293b', marginBottom: '8px' }}>Booking Management</h1>
                        <p style={{ color: '#64748b', fontSize: '1rem' }}>Manage customer service appointments and scheduling</p>
                    </div>
                </div>

                <div style={{ 
                    background: '#fff', 
                    borderRadius: '16px', 
                    border: '1px solid #f1f5f9', 
                    flex: 1, 
                    display: 'flex', 
                    flexDirection: 'column', 
                    overflow: 'hidden' 
                }}>
                    <div style={{ display: 'flex', gap: '15px', padding: '20px', borderBottom: '1px solid #f1f5f9' }}>
                        <div style={{ position: 'relative', flex: 1 }}>
                            <Search style={{ position: 'absolute', left: '12px', top: '12px', color: '#94a3b8' }} size={20} />
                            <input 
                                type="text" 
                                placeholder="Search by ID, customer or vehicle number..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '0.9rem' }} 
                            />
                        </div>
                    </div>

                    <div style={{ flex: 1, border: '1px solid #f1f5f9', borderRadius: '8px', overflow: 'auto', background: '#fff' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', minWidth: '1500px' }}>
                            <thead style={{ position: 'sticky', top: 0, zIndex: 10, background: '#fff' }}>
                                <tr style={{ borderBottom: '2px solid #f1f5f9', textAlign: 'left' }}>
                                    <th style={{ padding: '15px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', fontSize: '0.7rem' }}>bookingId</th>
                                    <th style={{ padding: '15px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', fontSize: '0.7rem' }}>bookingDate</th>
                                    <th style={{ padding: '15px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', fontSize: '0.7rem' }}>bookingStartTime</th>
                                    <th style={{ padding: '15px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', fontSize: '0.7rem' }}>bookingEndTime</th>
                                    <th style={{ padding: '15px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', fontSize: '0.7rem' }}>bookingStatus</th>
                                    <th style={{ padding: '15px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', fontSize: '0.7rem' }}>bookingRefNumber</th>
                                    <th style={{ padding: '15px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', fontSize: '0.7rem' }}>customerId</th>
                                    <th style={{ padding: '15px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', fontSize: '0.7rem' }}>vehicleId</th>
                                    <th style={{ padding: '15px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', fontSize: '0.7rem' }}>serviceId</th>
                                    <th style={{ padding: '15px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', fontSize: '0.7rem' }}>technicianId</th>
                                    <th style={{ padding: '15px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', fontSize: '0.7rem', textAlign: 'right' }}>bookingCreatedAt</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="11" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>Loading booking...</td></tr>
                                ) : filteredBookings.length === 0 ? (
                                    <tr><td colSpan="11" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>No booking found.</td></tr>
                                ) : (
                                    filteredBookings.map(booking => (
                                        <tr 
                                            key={booking.bookingId} 
                                            onClick={() => setSelectedId(selectedId === booking.bookingId ? null : booking.bookingId)}
                                            style={{ 
                                                borderBottom: '1px solid #f1f5f9', 
                                                transition: 'background 0.2s', 
                                                cursor: 'pointer',
                                                background: selectedId === booking.bookingId ? '#f8fafc' : 'transparent'
                                            }}
                                        >
                                            <td style={{ padding: '12px 15px', fontWeight: '800', color: 'var(--navy)' }}>{booking.bookingId}</td>
                                            <td style={{ padding: '12px 15px', fontWeight: '600' }}>{booking.bookingDate || '-'}</td>
                                            <td style={{ padding: '12px 15px', fontWeight: '600' }}>{booking.bookingStartTime || '-'}</td>
                                            <td style={{ padding: '12px 15px', fontWeight: '600' }}>{booking.bookingEndTime || '-'}</td>
                                            <td style={{ padding: '12px 15px' }}>
                                                <span style={{ 
                                                    padding: '6px 12px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: '800',
                                                    background: getStatusColor(booking.bookingStatus).bg, color: getStatusColor(booking.bookingStatus).text,
                                                    display: 'inline-flex', alignItems: 'center', gap: '5px', textTransform: 'uppercase'
                                                }}>
                                                    {getStatusColor(booking.bookingStatus).icon}
                                                    {booking.bookingStatus}
                                                </span>
                                            </td>
                                            <td style={{ padding: '12px 15px', fontWeight: '700', fontFamily: 'monospace' }}>{booking.bookingRefNumber || '-'}</td>
                                            <td style={{ padding: '12px 15px' }}>{booking.customerFirstName ? `${booking.customerFirstName} (${booking.customerId})` : booking.customerId}</td>
                                            <td style={{ padding: '12px 15px' }}>{booking.vehicleRegNumber ? `${booking.vehicleRegNumber} (${booking.vehicleId})` : booking.vehicleId}</td>
                                            <td style={{ padding: '12px 15px' }}>{booking.serviceName ? `${booking.serviceName} (${booking.serviceId})` : booking.serviceId}</td>
                                            <td style={{ padding: '12px 15px' }}>{booking.technicianFirstName ? `${booking.technicianFirstName} (${booking.technicianId})` : (booking.technicianId || 'UNASSIGNED')}</td>
                                            <td style={{ padding: '12px 15px', textAlign: 'right', color: '#94a3b8' }}>{booking.bookingCreatedAt ? new Date(booking.bookingCreatedAt).toLocaleDateString() : '-'}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Persistent Floating Actions */}
                    <div style={{ 
                        position: 'fixed', 
                        bottom: '30px', 
                        right: '30px', 
                        display: 'flex', 
                        gap: '12px', 
                        zIndex: 1000,
                        background: 'rgba(255,255,255,0.9)',
                        padding: '15px',
                        borderRadius: '12px',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid #e2e8f0'
                    }}>
                        {(() => {
                            const selectedBooking = bookings.find(b => b.bookingId === selectedId);
                            
                            return (
                                <>
                                    <button 
                                        onClick={() => { if (selectedBooking) handleOpenModal('view', selectedBooking); }} 
                                        disabled={!selectedId}
                                        style={{ padding: '12px 24px', borderRadius: '8px', border: 'none', background: selectedId ? 'var(--yellow)' : '#f1f5f9', color: selectedId ? 'black' : '#94a3b8', cursor: selectedId ? 'pointer' : 'default', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}
                                    >
                                        <Eye size={18} /> View Booking
                                    </button>
                                </>
                            );
                        })()}
                    </div>
                </div>

                {showModal && (
                    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000 }}>
                        <div style={{ background: 'white', borderRadius: '16px', width: '600px', maxWidth: '90%', maxHeight: '90vh', overflowY: 'auto' }}>
                            <div style={{ padding: '15px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: 'white', zIndex: 10 }}>
                                <h2 style={{ margin: 0, color: '#1e293b', fontSize: '1.25rem' }}>{modalMode === 'view' ? 'View Booking' : 'Update Booking'}</h2>
                                <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><X size={24} /></button>
                            </div>
                            <div style={{ padding: '25px' }}>
                                {modalMode === 'view' ? (
                                    <>
                                        <h4 style={{ margin: '0 0 16px 0', color: '#64748b', textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: '800' }}>booking Table</h4>
                                        <div style={{ background: '#f8fafc', borderRadius: '10px', padding: '18px', marginBottom: '20px', display: 'grid', gap: '12px' }}>
                                            {[
                                                ['bookingId', formData.bookingId],
                                                ['bookingDate', formData.bookingDate],
                                                ['bookingStartTime', formData.bookingStartTime],
                                                ['bookingEndTime', formData.bookingEndTime],
                                                ['bookingStatus', formData.bookingStatus],
                                                ['bookingRefNumber', formData.bookingRefNumber],
                                                ['bookingCustomerNotes', formData.bookingCustomerNotes],
                                                ['customerId', formData.customerId],
                                                ['vehicleId', formData.vehicleId],
                                                ['serviceId', formData.serviceId],
                                                ['servicePackageId', formData.servicePackageId],
                                                ['technicianId', formData.technicianId],
                                                ['timeSlotId', formData.timeSlotId],
                                                ['bookingCreatedAt', formData.bookingCreatedAt ? new Date(formData.bookingCreatedAt).toLocaleString() : '-'],
                                            ].map(([key, val]) => (
                                                <div key={key} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
                                                    <span style={{ color: '#64748b', fontFamily: 'monospace', fontSize: '0.9rem' }}>{key}</span>
                                                    <span style={{ fontWeight: '600', color: '#1e293b' }}>{val ?? '-'}</span>
                                                </div>
                                            ))}
                                        </div>

                                        {(formData.customerFirstName || formData.vehicleModel || formData.serviceName || formData.technicianFirstName) && (
                                            <>
                                                <h4 style={{ margin: '0 0 16px 0', color: '#64748b', textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: '800' }}>Related Data (via Foreign Keys)</h4>
                                                <div style={{ background: '#f8fafc', borderRadius: '10px', padding: '18px', display: 'grid', gap: '12px' }}>
                                                    {[
                                                        ['customerFirstName', formData.customerFirstName],
                                                        ['customerLastName', formData.customerLastName],
                                                        ['vehicleMake', formData.vehicleMake],
                                                        ['vehicleModel', formData.vehicleModel],
                                                        ['vehicleRegNumber', formData.vehicleRegNumber],
                                                        ['serviceName', formData.serviceName],
                                                        ['technicianFirstName', formData.technicianFirstName],
                                                        ['technicianLastName', formData.technicianLastName],
                                                        ['technicianSpecialization', formData.technicianSpecialization],
                                                    ].map(([key, val]) => (
                                                        <div key={key} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
                                                            <span style={{ color: '#64748b', fontFamily: 'monospace', fontSize: '0.9rem' }}>{key}</span>
                                                            <span style={{ fontWeight: '600', color: '#1e293b' }}>{val ?? '-'}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </>
                                        )}
                                    </>
                                ) : (
                                    <>
                                        <div style={{ marginBottom: '20px' }}>
                                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>bookingStatus</label>
                                            <select value={formData.bookingStatus} onChange={(e) => setFormData({...formData, bookingStatus: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                                                <option value="pending">pending</option>
                                                <option value="accepted">accepted</option>
                                                <option value="rejected">rejected</option>
                                                <option value="in_progress">in_progress</option>
                                                <option value="completed">completed</option>
                                                <option value="cancelled">cancelled</option>
                                            </select>
                                        </div>

                                        {['accepted', 'in_progress', 'completed'].includes(formData.bookingStatus) && (
                                            <div style={{ marginBottom: '20px' }}>
                                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>technicianId</label>
                                                <select
                                                    value={formData.technicianId || ''}
                                                    onChange={(e) => setFormData({...formData, technicianId: e.target.value})}
                                                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                                                >
                                                    <option value="">-- Select Technician --</option>
                                                    {technicians.map(tech => (
                                                        <option key={tech.technicianId} value={tech.technicianId}>
                                                            {tech.technicianId} — {tech.technicianFirstName} {tech.technicianLastName}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        )}

                                        <div style={{ marginBottom: '20px' }}>
                                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>bookingCustomerNotes</label>
                                            <textarea value={formData.bookingCustomerNotes || ''} onChange={(e) => setFormData({...formData, bookingCustomerNotes: e.target.value})} rows="4" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', resize: 'vertical' }} />
                                        </div>
                                    </>
                                )}
                            </div>
                             {modalMode !== 'view' && (
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
                                        Update Booking
                                    </button>
                                </div>
                            )}
                            {modalMode === 'view' && (
                                <div style={{ padding: '20px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '10px', position: 'sticky', bottom: 0, background: 'white', zIndex: 10 }}>
                                    <button 
                                        onClick={() => setModalMode('edit')}
                                        style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#3b82f6', color: 'white', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                                    >
                                        <Edit2 size={18} /> Update Booking
                                    </button>
                                    <button 
                                        onClick={async () => {
                                            if (window.confirm('Cancel this booking?')) {
                                                try {
                                                    const res = await bookingApi.cancel(formData.bookingId);
                                                    if (res.success) {
                                                        alert('Booking cancelled successfully!');
                                                        setShowModal(false);
                                                        setSelectedId(null);
                                                        fetchBookings();
                                                    }
                                                } catch (err) {
                                                    console.error(err);
                                                    alert('Failed to cancel booking');
                                                }
                                            }
                                        }}
                                        style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#ef4444', color: 'white', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                                    >
                                        <Trash2 size={18} /> Delete Booking
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
