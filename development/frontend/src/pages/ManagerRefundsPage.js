import React, { useState, useEffect } from 'react';
import {
    Search, Eye, X, CheckCircle,
    AlertTriangle, Clock
} from 'lucide-react';
import SidebarLayout from '../components/SidebarLayout';
import { refundApi } from '../api/api';

const ManagerRefundsPage = () => {
    const [refunds, setRefunds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [selectedRefund, setSelectedRefund] = useState(null);

    useEffect(() => {
        fetchRefunds();
    }, []);

    const fetchRefunds = async () => {
        try {
            setLoading(true);
            const res = await refundApi.getAll();
            if (res.success) {
                setRefunds(res.data || []);
            }
        } catch (error) {
            console.error('Failed to fetch refunds:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateRefundStatus = async (status) => {
        if (!selectedRefund) return;
        try {
            const res = await refundApi.update(selectedRefund.refundId, { refundStatus: status });
            if (res.success) {
                alert(`Refund ${status} successfully!`);
                setShowModal(false);
                fetchRefunds();
            }
        } catch (error) {
            console.error('Failed to update refund status:', error);
            alert('Failed to update refund status');
        }
    };

    const filteredRefunds = refunds.filter(r =>
        String(r.refundId || '').includes(searchTerm) ||
        String(r.invoiceId || '').includes(searchTerm) ||
        (r.refundStatus || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.refundReason || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusStyle = (status) => {
        switch (status) {
            case 'completed': return { bg: '#ecfdf5', text: '#10b981', icon: <CheckCircle size={14} /> };
            case 'pending': return { bg: '#fff7ed', text: '#f59e0b', icon: <Clock size={14} /> };
            case 'rejected': return { bg: '#fef2f2', text: '#ef4444', icon: <AlertTriangle size={14} /> };
            default: return { bg: '#f1f5f9', text: '#64748b', icon: null };
        }
    };

    return (
        <SidebarLayout role="manager">
            <div style={{ height: 'calc(100vh - 140px)', display: 'flex', flexDirection: 'column', padding: '10px' }}>
                <div style={{ marginBottom: '30px' }}>
                    <h1 style={{ fontSize: '1.875rem', fontWeight: '800', color: '#1e293b', marginBottom: '8px' }}>Refund &amp; Reversal</h1>
                    <p style={{ color: '#64748b', fontSize: '1rem' }}>Manage customer refund requests and transaction reversals</p>
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
                                placeholder="Search by refundId, invoiceId, status or reason..."
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
                                    <th style={{ padding: '15px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', textAlign: 'left', fontSize: '0.7rem' }}>refundId</th>
                                    <th style={{ padding: '15px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', textAlign: 'left', fontSize: '0.7rem' }}>refundAmount</th>
                                    <th style={{ padding: '15px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', textAlign: 'left', fontSize: '0.7rem' }}>refundStatus</th>
                                    <th style={{ padding: '15px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', textAlign: 'left', fontSize: '0.7rem' }}>invoiceId</th>
                                    <th style={{ padding: '15px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', textAlign: 'left', fontSize: '0.7rem' }}>bookingId</th>
                                    <th style={{ padding: '15px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', textAlign: 'left', fontSize: '0.7rem' }}>refundDate</th>
                                    <th style={{ padding: '15px', textAlign: 'right', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', fontSize: '0.7rem' }}>refundCreatedAt</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="7" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>Synchronizing Reversal Records...</td></tr>
                                ) : filteredRefunds.length === 0 ? (
                                    <tr><td colSpan="7" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>No reversal requests matched your criteria.</td></tr>
                                ) : (
                                    filteredRefunds.map(r => (
                                        <tr
                                            key={r.refundId}
                                            onClick={() => setSelectedRefund(selectedRefund?.refundId === r.refundId ? null : r)}
                                            style={{
                                                borderBottom: '1px solid #f1f5f9',
                                                cursor: 'pointer',
                                                transition: 'background 0.2s',
                                                background: selectedRefund?.refundId === r.refundId ? '#f8fafc' : 'transparent'
                                            }}
                                        >
                                            <td style={{ padding: '12px 15px', fontWeight: '800', color: 'var(--navy)' }}>{r.refundId}</td>
                                            <td style={{ padding: '12px 15px', fontWeight: '700' }}>
                                                {r.refundAmount != null ? `${parseFloat(r.refundAmount).toLocaleString()}` : '0.00'}
                                            </td>
                                            <td style={{ padding: '12px 15px' }}>
                                                <span style={{
                                                    padding: '6px 12px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase',
                                                    background: getStatusStyle(r.refundStatus).bg, color: getStatusStyle(r.refundStatus).text,
                                                    display: 'inline-flex', alignItems: 'center', gap: '5px'
                                                }}>
                                                    {getStatusStyle(r.refundStatus).icon}
                                                    {r.refundStatus}
                                                </span>
                                            </td>
                                            <td style={{ padding: '12px 15px', fontWeight: '600' }}>{r.invoiceId ?? '-'}</td>
                                            <td style={{ padding: '12px 15px', fontWeight: '600' }}>{r.bookingId ?? '-'}</td>
                                            <td style={{ padding: '12px 15px', color: '#334155' }}>
                                                {r.refundDate ? new Date(r.refundDate).toLocaleDateString() : '-'}
                                            </td>
                                            <td style={{ padding: '12px 15px', textAlign: 'right', color: '#94a3b8' }}>
                                                {r.refundCreatedAt ? new Date(r.refundCreatedAt).toLocaleDateString() : '-'}
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
                            onClick={() => { if (selectedRefund) setShowModal(true); }}
                            disabled={!selectedRefund}
                            style={{ padding: '12px 24px', borderRadius: '8px', border: 'none', background: selectedRefund ? 'var(--yellow)' : '#f1f5f9', color: selectedRefund ? 'black' : '#94a3b8', cursor: selectedRefund ? 'pointer' : 'default', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}
                        >
                            <Eye size={18} /> View Refund
                        </button>
                    </div>
                </div>
                </div>

                {showModal && selectedRefund && (
                    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000 }}>
                        <div style={{ background: 'white', borderRadius: '16px', width: '520px', maxWidth: '95%', maxHeight: '90vh', overflowY: 'auto' }}>
                            <div style={{ padding: '15px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: 'white', zIndex: 10 }}>
                                <h2 style={{ margin: 0, color: '#1e293b', fontSize: '1.25rem' }}>View Refund</h2>
                                <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><X size={24} /></button>
                            </div>
                            <div style={{ padding: '30px' }}>
                                <h4 style={{ margin: '0 0 16px 0', color: '#64748b', textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: '800' }}>refund Table</h4>
                                <div style={{ background: '#f8fafc', borderRadius: '10px', padding: '18px', marginBottom: '20px', display: 'grid', gap: '12px' }}>
                                    {[
                                        ['refundId', selectedRefund.refundId],
                                        ['refundAmount', selectedRefund.refundAmount != null ? `Rs. ${parseFloat(selectedRefund.refundAmount).toLocaleString()}` : '-'],
                                        ['refundReason', selectedRefund.refundReason],
                                        ['refundStatus', selectedRefund.refundStatus],
                                        ['refundDate', selectedRefund.refundDate ? new Date(selectedRefund.refundDate).toLocaleString() : '-'],
                                        ['invoiceId', selectedRefund.invoiceId],
                                        ['refundCreatedAt', selectedRefund.refundCreatedAt ? new Date(selectedRefund.refundCreatedAt).toLocaleString() : '-'],
                                    ].map(([key, val]) => (
                                        <div key={key} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
                                            <span style={{ color: '#64748b', fontFamily: 'monospace', fontSize: '0.9rem' }}>{key}</span>
                                            <span style={{ fontWeight: '600', color: '#1e293b', maxWidth: '60%', textAlign: 'right', wordBreak: 'break-word' }}>{val ?? '-'}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* Joined data from invoice/customer */}
                                {(selectedRefund.invoiceNumber || selectedRefund.clientName) && (
                                    <>
                                        <h4 style={{ margin: '0 0 16px 0', color: '#64748b', textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: '800' }}>invoice (via invoiceId)</h4>
                                        <div style={{ background: '#f8fafc', borderRadius: '10px', padding: '18px', display: 'grid', gap: '12px' }}>
                                            {[
                                                ['invoiceNumber', selectedRefund.invoiceNumber],
                                                ['clientName', selectedRefund.clientName],
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
                                {selectedRefund.refundStatus === 'pending' && (
                                    <>
                                        <button
                                            onClick={() => handleUpdateRefundStatus('rejected')}
                                            style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #ef4444', background: 'white', color: '#ef4444', fontWeight: 'bold', cursor: 'pointer' }}
                                        >
                                            Reject Request
                                        </button>
                                        <button
                                            onClick={() => handleUpdateRefundStatus('completed')}
                                            style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#10b981', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}
                                        >
                                            Approve &amp; Refund
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )}
        </SidebarLayout>
    );
};

export default ManagerRefundsPage;
