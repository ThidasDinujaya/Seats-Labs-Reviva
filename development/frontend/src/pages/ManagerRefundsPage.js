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
    const [statusFilter, setStatusFilter] = useState('all');
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
        (r.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) || 
         (r.clientName || '').toLowerCase().includes(searchTerm.toLowerCase())) &&
        (statusFilter === 'all' || r.refundStatus === statusFilter)
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
                    <h1 style={{ fontSize: '1.875rem', fontWeight: '800', color: '#1e293b', marginBottom: '8px' }}>Refund & Reversal</h1>
                    <p style={{ color: '#64748b', fontSize: '1rem' }}>Manage customer refund requests and transaction reversals</p>
                </div>

                <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', padding: '24px', flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    <div style={{ display: 'flex', gap: '15px', marginBottom: '25px' }}>
                        <div style={{ position: 'relative', flex: 1 }}>
                            <Search style={{ position: 'absolute', left: '12px', top: '12px', color: '#94a3b8' }} size={20} />
                            <input 
                                type="text" 
                                placeholder="Search by invoice or customer..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none' }} 
                            />
                        </div>
                        <select 
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            style={{ padding: '12px 15px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', outline: 'none' }}
                        >
                            <option value="all">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="completed">Completed</option>
                            <option value="rejected">Rejected</option>
                        </select>
                    </div>

                    <div style={{ overflowY: 'auto', flex: 1, overflowX: 'auto', border: '1px solid #f1f5f9', borderRadius: '8px' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid #f1f5f9', textAlign: 'left', position: 'sticky', top: 0, background: 'white', zIndex: 1 }}>
                                    <th style={{ padding: '15px', color: '#64748b' }}>refundId</th>
                                    <th style={{ padding: '15px', color: '#64748b' }}>invoiceId</th>
                                    <th style={{ padding: '15px', color: '#64748b' }}>Client</th>
                                    <th style={{ padding: '15px', color: '#64748b' }}>refundAmount</th>
                                    <th style={{ padding: '15px', color: '#64748b' }}>refundCreatedAt</th>
                                    <th style={{ padding: '15px', textAlign: 'right', color: '#64748b' }}>refundStatus</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="6" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>Loading refund...</td></tr>
                                ) : filteredRefunds.length === 0 ? (
                                    <tr><td colSpan="6" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>No refund request found.</td></tr>
                                ) : (
                                    filteredRefunds.map(r => (
                                        <tr 
                                            key={r.refundId} 
                                            onClick={() => setSelectedRefund(selectedRefund?.refundId === r.refundId ? null : r)}
                                            style={{ 
                                                borderBottom: '1px solid #f1f5f9', 
                                                cursor: 'pointer',
                                                transition: 'background 0.2s',
                                                background: selectedRefund?.refundId === r.refundId ? '#f1f5f9' : 'transparent'
                                            }}
                                        >
                                            <td style={{ padding: '15px', fontWeight: 'bold' }}>#{r.refundId}</td>
                                            <td style={{ padding: '15px' }}>{r.invoiceNumber}</td>
                                            <td style={{ padding: '15px' }}>{r.clientName}</td>
                                            <td style={{ padding: '15px', fontWeight: 'bold' }}>Rs. {parseFloat(r.refundAmount).toLocaleString()}</td>
                                            <td style={{ padding: '15px', fontSize: '0.85rem' }}>{new Date(r.refundCreatedAt).toLocaleDateString()}</td>
                                            <td style={{ padding: '15px', textAlign: 'right' }}>
                                                <span style={{ 
                                                    padding: '6px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600',
                                                    background: getStatusStyle(r.refundStatus).bg, color: getStatusStyle(r.refundStatus).text,
                                                    display: 'inline-flex', alignItems: 'center', gap: '5px'
                                                }}>
                                                    {getStatusStyle(r.refundStatus).icon}
                                                    {r.refundStatus.toUpperCase()}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) }
                            </tbody>
                        </table>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', padding: '20px 0 0 0', borderTop: '1px solid #f1f5f9', marginTop: '10px' }}>
                        <button 
                            onClick={() => {
                                if (selectedRefund) setShowModal(true);
                            }} 
                            disabled={!selectedRefund}
                            style={{ padding: '10px 24px', borderRadius: '8px', border: 'none', background: selectedRefund ? 'var(--yellow)' : '#f1f5f9', color: selectedRefund ? 'black' : '#94a3b8', cursor: selectedRefund ? 'pointer' : 'default', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}
                        >
                            <Eye size={18} /> View Request
                        </button>
                    </div>
                </div>

                {showModal && (
                    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000 }}>
                        <div style={{ background: 'white', borderRadius: '16px', width: '500px', maxWidth: '95%', maxHeight: '90vh', overflowY: 'auto' }}>
                            <div style={{ padding: '20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: 'white', zIndex: 10 }}>
                                <h2 style={{ margin: 0, color: '#1e293b' }}>Refund Request Details</h2>
                                <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={24} /></button>
                            </div>
                            <div style={{ padding: '30px' }}>
                                <div style={{ border: '1px solid #f1f5f9', borderRadius: '12px', padding: '20px', marginBottom: '25px' }}>
                                    <div style={{ marginBottom: '15px' }}>
                                        <div style={{ color: '#64748b', fontSize: '0.85rem' }}>Reason for Refund</div>
                                        <div style={{ fontWeight: '600', marginTop: '4px' }}>{selectedRefund?.refundReason}</div>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                        <div>
                                            <div style={{ color: '#64748b', fontSize: '0.85rem' }}>Client</div>
                                            <div style={{ fontWeight: '500' }}>{selectedRefund?.clientName}</div>
                                        </div>
                                        <div>
                                            <div style={{ color: '#64748b', fontSize: '0.85rem' }}>Amount</div>
                                            <div style={{ fontWeight: 'bold', color: '#ef4444' }}>Rs. {selectedRefund?.refundAmount.toLocaleString()}</div>
                                        </div>
                                    </div>
                                </div>

                                {selectedRefund?.refundStatus === 'pending' && (
                                    <div style={{ padding: '20px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '10px', position: 'sticky', bottom: 0, background: 'white', zIndex: 10 }}>
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
                                            Approve & Refund
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </SidebarLayout>
    );
};

export default ManagerRefundsPage;
