import React, { useState, useEffect } from 'react';
import { Search, Star, Eye, X } from 'lucide-react';
import SidebarLayout from '../components/SidebarLayout';
import { feedbackApi } from '../api/api';

const ManagerFeedbacksPage = () => {
    const [feedbacks, setFeedbacks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const [showModal, setShowModal] = useState(false);
    const [selectedFeedback, setSelectedFeedback] = useState(null);

    useEffect(() => {
        fetchFeedbacks();
    }, []);

    const fetchFeedbacks = async () => {
        try {
            setLoading(true);
            const res = await feedbackApi.getAll();
            if (res.success) {
                setFeedbacks(res.data);
            }
        } catch (error) {
            console.error('Failed to fetch feedbacks:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredFeedbacks = feedbacks.filter(f =>
        String(f.feedbackId || '').includes(searchTerm) ||
        String(f.customerId || '').includes(searchTerm) ||
        String(f.bookingId || '').includes(searchTerm) ||
        (f.feedbackComment || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const renderStars = (rating) => (
        <div style={{ display: 'flex', gap: '2px' }}>
            {[1, 2, 3, 4, 5].map(star => (
                <Star
                    key={star}
                    size={14}
                    fill={star <= rating ? '#f59e0b' : 'none'}
                    color={star <= rating ? '#f59e0b' : '#cbd5e1'}
                />
            ))}
        </div>
    );

    return (
        <SidebarLayout role="manager">
            <div style={{ height: 'calc(100vh - 140px)', display: 'flex', flexDirection: 'column', padding: '10px' }}>
                <div style={{ marginBottom: '30px' }}>
                    <h1 style={{ fontSize: '1.875rem', fontWeight: '800', color: '#1e293b', marginBottom: '8px' }}>Customer Feedback</h1>
                    <p style={{ color: '#64748b', fontSize: '1rem' }}>Review and manage customer ratings and testimonials</p>
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
                                placeholder="Search by feedbackId, customerId, bookingId or comment..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '0.9rem' }}
                            />
                        </div>
                    </div>

                    <div style={{ flex: 1, overflow: 'auto' }}>
                        <table style={{ width: '100%', minWidth: '1100px', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                            <thead style={{ position: 'sticky', top: 0, background: '#fff', zIndex: 10 }}>
                                <tr style={{ borderBottom: '2px solid #f1f5f9' }}>
                                    <th style={{ padding: '15px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', textAlign: 'left', fontSize: '0.7rem' }}>feedbackId</th>
                                    <th style={{ padding: '15px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', textAlign: 'left', fontSize: '0.7rem' }}>feedbackRating</th>
                                    <th style={{ padding: '15px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', textAlign: 'left', fontSize: '0.7rem' }}>feedbackComment</th>
                                    <th style={{ padding: '15px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', textAlign: 'left', fontSize: '0.7rem' }}>customerId</th>
                                    <th style={{ padding: '15px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', textAlign: 'left', fontSize: '0.7rem' }}>bookingId</th>
                                    <th style={{ padding: '15px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', textAlign: 'left', fontSize: '0.7rem' }}>technicianId</th>
                                    <th style={{ padding: '15px', textAlign: 'right', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', fontSize: '0.7rem' }}>feedbackCreatedAt</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="7" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>Synchronizing Sentiment Ledger...</td></tr>
                                ) : filteredFeedbacks.length === 0 ? (
                                    <tr><td colSpan="7" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>No feedback entries matched your filter criteria.</td></tr>
                                ) : (
                                    filteredFeedbacks.map(f => (
                                        <tr
                                            key={f.feedbackId}
                                            onClick={() => setSelectedFeedback(selectedFeedback?.feedbackId === f.feedbackId ? null : f)}
                                            style={{
                                                borderBottom: '1px solid #f1f5f9',
                                                cursor: 'pointer',
                                                transition: 'background 0.2s',
                                                background: selectedFeedback?.feedbackId === f.feedbackId ? '#f8fafc' : 'transparent'
                                            }}
                                        >
                                            <td style={{ padding: '12px 15px', fontWeight: '800', color: 'var(--navy)' }}>{f.feedbackId}</td>
                                            <td style={{ padding: '12px 15px' }}>{renderStars(f.feedbackRating)}</td>
                                            <td style={{ padding: '12px 15px', maxWidth: '300px' }}>
                                                <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: '600', color: '#334155' }}>
                                                    {f.feedbackComment || <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Rating only</span>}
                                                </div>
                                            </td>
                                            <td style={{ padding: '12px 15px', fontWeight: '600' }}>UID: {f.customerId}</td>
                                            <td style={{ padding: '12px 15px', fontWeight: '600' }}>{f.bookingId}</td>
                                            <td style={{ padding: '12px 15px', fontWeight: '600' }}>{f.technicianId || '-'}</td>
                                            <td style={{ padding: '12px 15px', color: '#94a3b8', textAlign: 'right' }}>
                                                {f.feedbackCreatedAt ? new Date(f.feedbackCreatedAt).toLocaleDateString() : '-'}
                                            </td>
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
                            onClick={() => { if (selectedFeedback) setShowModal(true); }}
                            disabled={!selectedFeedback}
                            style={{ padding: '12px 24px', borderRadius: '8px', border: 'none', background: selectedFeedback ? 'var(--yellow)' : '#f1f5f9', color: selectedFeedback ? 'black' : '#94a3b8', cursor: selectedFeedback ? 'pointer' : 'default', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}
                        >
                            <Eye size={18} /> View Feedback
                        </button>
                    </div>
                </div>
                </div>

                {showModal && selectedFeedback && (
                    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000 }}>
                        <div style={{ background: 'white', borderRadius: '16px', width: '520px', maxWidth: '95%', maxHeight: '90vh', overflowY: 'auto' }}>
                            <div style={{ padding: '15px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: 'white', zIndex: 10 }}>
                                <h2 style={{ margin: 0, color: '#1e293b', fontSize: '1.25rem' }}>View Feedback</h2>
                                <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><X size={24} /></button>
                            </div>
                            <div style={{ padding: '30px' }}>
                                <h4 style={{ margin: '0 0 16px 0', color: '#64748b', textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: '800' }}>feedback Table</h4>
                                <div style={{ background: '#f8fafc', borderRadius: '10px', padding: '18px', marginBottom: '20px', display: 'grid', gap: '12px' }}>
                                    {[
                                        ['feedbackId', selectedFeedback.feedbackId],
                                        ['feedbackRating', selectedFeedback.feedbackRating],
                                        ['feedbackComment', selectedFeedback.feedbackComment],
                                        ['customerId', selectedFeedback.customerId],
                                        ['bookingId', selectedFeedback.bookingId],
                                        ['technicianId', selectedFeedback.technicianId],
                                        ['feedbackCreatedAt', selectedFeedback.feedbackCreatedAt ? new Date(selectedFeedback.feedbackCreatedAt).toLocaleString() : '-'],
                                    ].map(([key, val]) => (
                                        <div key={key} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
                                            <span style={{ color: '#64748b', fontFamily: 'monospace', fontSize: '0.9rem' }}>{key}</span>
                                            <span style={{ fontWeight: '600', color: '#1e293b' }}>{val ?? '-'}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* Star rating visual */}
                                <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginBottom: '20px' }}>
                                    {renderStars(selectedFeedback.feedbackRating)}
                                </div>

                                {(selectedFeedback.customerFirstName || selectedFeedback.serviceName || selectedFeedback.technicianFirstName) && (
                                    <>
                                        <h4 style={{ margin: '0 0 16px 0', color: '#64748b', textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: '800' }}>Related Data (via Foreign Keys)</h4>
                                        <div style={{ background: '#f8fafc', borderRadius: '10px', padding: '18px', display: 'grid', gap: '12px' }}>
                                            {[
                                                ['customerFirstName', selectedFeedback.customerFirstName],
                                                ['customerLastName', selectedFeedback.customerLastName],
                                                ['serviceName', selectedFeedback.serviceName],
                                                ['servicePackageName', selectedFeedback.servicePackageName],
                                                ['technicianFirstName', selectedFeedback.technicianFirstName],
                                                ['technicianLastName', selectedFeedback.technicianLastName],
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
                            <div style={{ padding: '20px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '10px', position: 'sticky', bottom: 0, background: 'white', zIndex: 10 }}>
                                <button 
                                    onClick={async () => {
                                        if (window.confirm('Are you sure you want to delete this feedback?')) {
                                            try {
                                                const res = await feedbackApi.delete(selectedFeedback.feedbackId);
                                                if (res.success) {
                                                    alert('Feedback deleted successfully');
                                                    setShowModal(false);
                                                    setSelectedFeedback(null);
                                                    fetchFeedbacks();
                                                }
                                            } catch (err) {
                                                console.error(err);
                                                alert('Failed to delete feedback');
                                            }
                                        }
                                    }}
                                    style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #ef4444', background: 'white', color: '#ef4444', fontWeight: 'bold', cursor: 'pointer' }}
                                >
                                    Delete Feedback
                                </button>
                            </div>
                        </div>
                    </div>
                )}
        </SidebarLayout>
    );
};

export default ManagerFeedbacksPage;
