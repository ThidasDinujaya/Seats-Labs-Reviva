import React, { useState, useEffect } from 'react';
import { Search, Eye, X, Clock, CheckCircle } from 'lucide-react';
import SidebarLayout from '../components/SidebarLayout';
import { trackingApi } from '../api/api';

const ManagerServiceTrackingPage = () => {
    const [trackings, setTrackings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [selectedTracking, setSelectedTracking] = useState(null);

    useEffect(() => {
        fetchTrackings();
    }, []);

    const fetchTrackings = async () => {
        try {
            setLoading(true);
            const res = await trackingApi.getServiceTracking();
            if (res.success) {
                setTrackings(res.data);
            }
        } catch (error) {
            console.error('Failed to fetch tracking data:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusStyle = (status) => {
        switch(status) {
            case 'completed': return { bg: '#ecfdf5', text: '#10b981', icon: <CheckCircle size={16} /> };
            case 'in_progress':
            case 'active':
            case 'started': return { bg: '#eff6ff', text: '#3b82f6', icon: <Clock size={16} /> };
            case 'accepted':
            case 'pending': return { bg: '#fef3c7', text: '#f59e0b', icon: <Clock size={16} /> };
            default: return { bg: '#f1f5f9', text: '#64748b', icon: <Clock size={16} /> };
        }
    };

    const filteredTrackings = trackings.filter(t =>
        String(t.serviceTrackingId || '').includes(searchTerm) ||
        String(t.bookingId || '').includes(searchTerm) ||
        (t.serviceTrackingStatus || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <SidebarLayout role="manager">
            <div style={{ height: 'calc(100vh - 140px)', display: 'flex', flexDirection: 'column', padding: '10px' }}>
                <div style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1 style={{ fontSize: '1.875rem', fontWeight: '800', color: '#1e293b', marginBottom: '8px' }}>Service Tracking</h1>
                        <p style={{ color: '#64748b', fontSize: '1rem' }}>Monitor real-time service progress and assignments</p>
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
                                placeholder="Search by serviceTrackingId, bookingId or status..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '0.9rem' }}
                            />
                        </div>
                    </div>

                    <div style={{ flex: 1, overflow: 'auto' }}>
                        <table style={{ width: '100%', minWidth: '900px', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                            <thead style={{ position: 'sticky', top: 0, background: '#fff', zIndex: 10 }}>
                                <tr style={{ borderBottom: '2px solid #f1f5f9' }}>
                                    <th style={{ padding: '15px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', textAlign: 'left', fontSize: '0.7rem' }}>serviceTrackingId</th>
                                    <th style={{ padding: '15px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', textAlign: 'left', fontSize: '0.7rem' }}>serviceTrackingStatus</th>
                                    <th style={{ padding: '15px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', textAlign: 'left', fontSize: '0.7rem' }}>bookingId</th>
                                    <th style={{ padding: '15px', textAlign: 'right', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', fontSize: '0.7rem' }}>serviceTrackingCreatedAt</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="4" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>Synchronizing Operational Stream...</td></tr>
                                ) : filteredTrackings.length === 0 ? (
                                    <tr><td colSpan="4" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>No operational records matched your search query.</td></tr>
                                ) : (
                                    filteredTrackings.map(t => (
                                        <tr
                                            key={t.serviceTrackingId}
                                            onClick={() => setSelectedTracking(selectedTracking?.serviceTrackingId === t.serviceTrackingId ? null : t)}
                                            style={{
                                                borderBottom: '1px solid #f1f5f9',
                                                cursor: 'pointer',
                                                transition: 'background 0.2s',
                                                background: selectedTracking?.serviceTrackingId === t.serviceTrackingId ? '#f8fafc' : 'transparent'
                                            }}
                                        >
                                            <td style={{ padding: '12px 15px', fontWeight: '800', color: 'var(--navy)' }}>{t.serviceTrackingId}</td>
                                            <td style={{ padding: '12px 15px' }}>
                                                <span style={{
                                                    padding: '6px 12px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase',
                                                    background: getStatusStyle(t.serviceTrackingStatus).bg, color: getStatusStyle(t.serviceTrackingStatus).text,
                                                    display: 'inline-flex', alignItems: 'center', gap: '5px'
                                                }}>
                                                    {getStatusStyle(t.serviceTrackingStatus).icon}
                                                    {t.serviceTrackingStatus}
                                                </span>
                                            </td>
                                            <td style={{ padding: '12px 15px', fontWeight: '600' }}>{t.bookingId}</td>
                                            <td style={{ padding: '12px 15px', textAlign: 'right', color: '#94a3b8' }}>{t.serviceTrackingCreatedAt ? new Date(t.serviceTrackingCreatedAt).toLocaleString() : '-'}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Persistent Control Deck */}
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
                        <button
                            onClick={() => { if (selectedTracking) setShowModal(true); }}
                            disabled={!selectedTracking}
                            style={{ padding: '12px 24px', borderRadius: '8px', border: 'none', background: selectedTracking ? 'var(--yellow)' : '#f1f5f9', color: selectedTracking ? 'black' : '#94a3b8', cursor: selectedTracking ? 'pointer' : 'default', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}
                        >
                            <Eye size={18} /> View Detail
                        </button>
                    </div>
                </div>
                </div>

                {showModal && selectedTracking && (
                    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000 }}>
                        <div style={{ background: 'white', borderRadius: '16px', width: '520px', maxWidth: '95%', maxHeight: '90vh', overflowY: 'auto' }}>
                            <div style={{ padding: '15px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: 'white', zIndex: 10 }}>
                                <h2 style={{ margin: 0, color: '#1e293b', fontSize: '1.25rem' }}>View Detail</h2>
                                <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><X size={24} /></button>
                            </div>
                            <div style={{ padding: '30px' }}>
                                <h4 style={{ margin: '0 0 16px 0', color: '#64748b', textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: '800' }}>serviceTracking Table</h4>
                                <div style={{ background: '#f8fafc', borderRadius: '10px', padding: '18px', marginBottom: '20px', display: 'grid', gap: '12px' }}>
                                    {[
                                        ['serviceTrackingId', selectedTracking.serviceTrackingId],
                                        ['serviceTrackingStatus', selectedTracking.serviceTrackingStatus],
                                        ['bookingId', selectedTracking.bookingId],
                                        ['serviceTrackingCreatedAt', selectedTracking.serviceTrackingCreatedAt ? new Date(selectedTracking.serviceTrackingCreatedAt).toLocaleString() : '-'],
                                    ].map(([key, val]) => (
                                        <div key={key} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
                                            <span style={{ color: '#64748b', fontFamily: 'monospace', fontSize: '0.9rem' }}>{key}</span>
                                            <span style={{ fontWeight: '600', color: '#1e293b' }}>{val ?? '-'}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* Related booking data if available from JOIN */}
                                {(selectedTracking.bookingDate || selectedTracking.bookingStatus || selectedTracking.bookingRefNumber) && (
                                    <>
                                        <h4 style={{ margin: '0 0 16px 0', color: '#64748b', textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: '800' }}>booking (via bookingId)</h4>
                                        <div style={{ background: '#f8fafc', borderRadius: '10px', padding: '18px', display: 'grid', gap: '12px' }}>
                                            {[
                                                ['bookingDate', selectedTracking.bookingDate],
                                                ['bookingStartTime', selectedTracking.bookingStartTime],
                                                ['bookingEndTime', selectedTracking.bookingEndTime],
                                                ['bookingStatus', selectedTracking.bookingStatus],
                                                ['bookingRefNumber', selectedTracking.bookingRefNumber],
                                                ['customerId', selectedTracking.customerId],
                                                ['vehicleId', selectedTracking.vehicleId],
                                                ['serviceId', selectedTracking.serviceId],
                                                ['technicianId', selectedTracking.technicianId],
                                                ['timeSlotId', selectedTracking.timeSlotId],
                                            ].map(([key, val]) => (
                                                <div key={key} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
                                                    <span style={{ color: '#64748b', fontFamily: 'monospace', fontSize: '0.9rem' }}>{key}</span>
                                                    <span style={{ fontWeight: '600', color: '#1e293b' }}>{val ?? '-'}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                            <div style={{ padding: '20px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', position: 'sticky', bottom: 0, background: 'white', zIndex: 10 }}>
                            </div>
                        </div>
                    </div>
                )}
        </SidebarLayout>
    );
};

export default ManagerServiceTrackingPage;
