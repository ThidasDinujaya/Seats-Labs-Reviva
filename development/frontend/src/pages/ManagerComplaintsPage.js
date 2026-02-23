import React, { useState, useEffect } from 'react';
import {
    Search, Eye, X,
    CheckCircle, Clock, ShieldAlert
} from 'lucide-react';
import SidebarLayout from '../components/SidebarLayout';
import { complaintApi } from '../api/api';

const ManagerComplaintsPage = () => {
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const [showModal, setShowModal] = useState(false);
    const [selectedComplaint, setSelectedComplaint] = useState(null);
    const [managerResponse, setManagerResponse] = useState('');
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        fetchComplaints();
    }, []);

    const fetchComplaints = async () => {
        try {
            setLoading(true);
            const res = await complaintApi.getAll();
            if (res.success) {
                setComplaints(res.data);
            }
        } catch (error) {
            console.error('Failed to fetch complaints:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateComplaint = async (status) => {
        if (!selectedComplaint) return;
        try {
            setUpdating(true);
            const res = await complaintApi.update(selectedComplaint.complaintId, {
                complaintStatus: status,
                complaintManagerResponse: managerResponse || undefined
            });
            if (res.success) {
                alert(`Complaint marked as ${status}.`);
                setShowModal(false);
                setManagerResponse('');
                fetchComplaints();
            }
        } catch (error) {
            console.error('Failed to update complaint:', error);
            alert('Failed to update complaint.');
        } finally {
            setUpdating(false);
        }
    };

    const getPriorityStyle = (priority) => {
        switch (priority) {
            case 'high': return { bg: '#fee2e2', text: '#ef4444' };
            case 'medium': return { bg: '#ffedd5', text: '#f97316' };
            case 'low': return { bg: '#f1f5f9', text: '#64748b' };
            default: return { bg: '#f1f5f9', text: '#64748b' };
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'open': return { color: '#3b82f6', icon: <Clock size={14} /> };
            case 'in_progress': return { color: '#f59e0b', icon: <Clock size={14} /> };
            case 'resolved': return { color: '#10b981', icon: <CheckCircle size={14} /> };
            case 'closed': return { color: '#64748b', icon: <CheckCircle size={14} /> };
            default: return { color: '#64748b', icon: <Clock size={14} /> };
        }
    };

    const filteredComplaints = complaints.filter(c =>
        String(c.complaintId || '').includes(searchTerm) ||
        String(c.customerId || '').includes(searchTerm) ||
        (c.complaintTitle || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.complaintStatus || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <SidebarLayout role="manager">
            <div style={{ height: 'calc(100vh - 140px)', display: 'flex', flexDirection: 'column', padding: '10px' }}>
                <div style={{ marginBottom: '30px' }}>
                    <h1 style={{ fontSize: '1.875rem', fontWeight: '800', color: '#1e293b', marginBottom: '8px' }}>Customer Complaint</h1>
                    <p style={{ color: '#64748b', fontSize: '1rem' }}>Address and resolve customer grievances and service issues</p>
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
                                placeholder="Search by complaintId, customerId, title or status..."
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
                                    <th style={{ padding: '15px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', textAlign: 'left', fontSize: '0.7rem' }}>complaintId</th>
                                    <th style={{ padding: '15px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', textAlign: 'left', fontSize: '0.7rem' }}>complaintTitle</th>
                                    <th style={{ padding: '15px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', textAlign: 'left', fontSize: '0.7rem' }}>complaintPriority</th>
                                    <th style={{ padding: '15px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', textAlign: 'left', fontSize: '0.7rem' }}>complaintStatus</th>
                                    <th style={{ padding: '15px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', textAlign: 'left', fontSize: '0.7rem' }}>customerId</th>
                                    <th style={{ padding: '15px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', textAlign: 'left', fontSize: '0.7rem' }}>bookingId</th>
                                    <th style={{ padding: '15px', textAlign: 'right', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', fontSize: '0.7rem' }}>complaintCreatedAt</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="7" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>Synchronizing Grievance Registry...</td></tr>
                                ) : filteredComplaints.length === 0 ? (
                                    <tr><td colSpan="7" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>No active complaints matched your criteria.</td></tr>
                                ) : (
                                    filteredComplaints.map(c => (
                                        <tr
                                            key={c.complaintId}
                                            onClick={() => setSelectedComplaint(selectedComplaint?.complaintId === c.complaintId ? null : c)}
                                            style={{
                                                borderBottom: '1px solid #f1f5f9',
                                                cursor: 'pointer',
                                                transition: 'background 0.2s',
                                                background: selectedComplaint?.complaintId === c.complaintId ? '#f8fafc' : 'transparent'
                                            }}
                                        >
                                            <td style={{ padding: '12px 15px', fontWeight: '800', color: 'var(--navy)' }}>{c.complaintId}</td>
                                            <td style={{ padding: '12px 15px', fontWeight: '700' }}>{c.complaintTitle}</td>
                                            <td style={{ padding: '12px 15px' }}>
                                                <span style={{
                                                    padding: '6px 12px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase',
                                                    background: getPriorityStyle(c.complaintPriority).bg,
                                                    color: getPriorityStyle(c.complaintPriority).text
                                                }}>
                                                    {c.complaintPriority}
                                                </span>
                                            </td>
                                            <td style={{ padding: '12px 15px' }}>
                                                <span style={{ color: getStatusStyle(c.complaintStatus).color, display: 'inline-flex', alignItems: 'center', gap: '5px', fontWeight: '700' }}>
                                                    {getStatusStyle(c.complaintStatus).icon}
                                                    {c.complaintStatus}
                                                </span>
                                            </td>
                                            <td style={{ padding: '12px 15px', fontWeight: '600' }}>UID: {c.customerId}</td>
                                            <td style={{ padding: '12px 15px', fontWeight: '600' }}>{c.bookingId ?? '-'}</td>
                                            <td style={{ padding: '12px 15px', color: '#94a3b8', textAlign: 'right' }}>
                                                {c.complaintCreatedAt ? new Date(c.complaintCreatedAt).toLocaleDateString() : '-'}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {}
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
                            onClick={() => { if (selectedComplaint) setShowModal(true); }}
                            disabled={!selectedComplaint}
                            style={{ padding: '12px 24px', borderRadius: '8px', border: 'none', background: selectedComplaint ? 'var(--yellow)' : '#f1f5f9', color: selectedComplaint ? 'black' : '#94a3b8', cursor: selectedComplaint ? 'pointer' : 'default', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}
                        >
                            <Eye size={18} /> View Complaint
                        </button>
                    </div>
                </div>
                </div>

                {showModal && selectedComplaint && (
                    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000 }}>
                        <div style={{ background: 'white', borderRadius: '16px', width: '580px', maxWidth: '95%', maxHeight: '90vh', overflowY: 'auto' }}>
                            <div style={{ padding: '15px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: 'white', zIndex: 10 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <ShieldAlert color="#ef4444" size={24} />
                                    <h2 style={{ margin: 0, color: '#1e293b', fontSize: '1.25rem' }}>View Complaint</h2>
                                </div>
                                <button onClick={() => { setShowModal(false); setManagerResponse(''); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><X size={24} /></button>
                            </div>
                            <div style={{ padding: '30px' }}>
                                <h4 style={{ margin: '0 0 16px 0', color: '#64748b', textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: '800' }}>complaint Table</h4>
                                <div style={{ background: '#f8fafc', borderRadius: '10px', padding: '18px', marginBottom: '20px', display: 'grid', gap: '12px' }}>
                                    {[
                                        ['complaintId', selectedComplaint.complaintId],
                                        ['complaintTitle', selectedComplaint.complaintTitle],
                                        ['complaintDescription', selectedComplaint.complaintDescription],
                                        ['complaintPriority', selectedComplaint.complaintPriority],
                                        ['complaintStatus', selectedComplaint.complaintStatus],
                                        ['complaintManagerResponse', selectedComplaint.complaintManagerResponse],
                                        ['customerId', selectedComplaint.customerId],
                                        ['bookingId', selectedComplaint.bookingId],
                                        ['complaintCreatedAt', selectedComplaint.complaintCreatedAt ? new Date(selectedComplaint.complaintCreatedAt).toLocaleString() : '-'],
                                        ['complaintResolvedAt', selectedComplaint.complaintResolvedAt ? new Date(selectedComplaint.complaintResolvedAt).toLocaleString() : '-'],
                                    ].map(([key, val]) => (
                                        <div key={key} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
                                            <span style={{ color: '#64748b', fontFamily: 'monospace', fontSize: '0.9rem' }}>{key}</span>
                                            <span style={{ fontWeight: '600', color: '#1e293b', maxWidth: '60%', textAlign: 'right', wordBreak: 'break-word' }}>{val ?? '-'}</span>
                                        </div>
                                    ))}
                                </div>

                                {}
                                {(selectedComplaint.customerFirstName || selectedComplaint.customerLastName) && (
                                    <>
                                        <h4 style={{ margin: '0 0 16px 0', color: '#64748b', textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: '800' }}>customer (via customerId)</h4>
                                        <div style={{ background: '#f8fafc', borderRadius: '10px', padding: '18px', marginBottom: '20px', display: 'grid', gap: '12px' }}>
                                            {[
                                                ['customerFirstName', selectedComplaint.customerFirstName],
                                                ['customerLastName', selectedComplaint.customerLastName],
                                            ].map(([key, val]) => (
                                                <div key={key} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
                                                    <span style={{ color: '#64748b', fontFamily: 'monospace', fontSize: '0.9rem' }}>{key}</span>
                                                    <span style={{ fontWeight: '600', color: '#1e293b' }}>{val ?? '-'}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                )}

                                {selectedComplaint.bookingRefNumber && (
                                    <>
                                        <h4 style={{ margin: '0 0 16px 0', color: '#64748b', textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: '800' }}>booking (via bookingId)</h4>
                                        <div style={{ background: '#f8fafc', borderRadius: '10px', padding: '18px', marginBottom: '20px', display: 'grid', gap: '12px' }}>
                                            {[
                                                ['bookingRefNumber', selectedComplaint.bookingRefNumber],
                                            ].map(([key, val]) => (
                                                <div key={key} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
                                                    <span style={{ color: '#64748b', fontFamily: 'monospace', fontSize: '0.9rem' }}>{key}</span>
                                                    <span style={{ fontWeight: '600', color: '#1e293b' }}>{val ?? '-'}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                )}

                                {(selectedComplaint.complaintStatus === 'open' || selectedComplaint.complaintStatus === 'in_progress') && (
                                    <div style={{ marginTop: '20px' }}>
                                        <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold', color: '#475569' }}>complaintManagerResponse</label>
                                        <textarea
                                            rows="4"
                                            placeholder="Enter manager response..."
                                            value={managerResponse}
                                            onChange={(e) => setManagerResponse(e.target.value)}
                                            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', resize: 'vertical' }}
                                        />
                                    </div>
                                )}
                            </div>

                            <div style={{ padding: '20px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '10px', position: 'sticky', bottom: 0, background: 'white', zIndex: 10 }}>
                                {(selectedComplaint.complaintStatus === 'open' || selectedComplaint.complaintStatus === 'in_progress') && (
                                    <>
                                        <button
                                            onClick={() => handleUpdateComplaint('in_progress')}
                                            disabled={updating}
                                            style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #f59e0b', background: 'white', color: '#f59e0b', fontWeight: 'bold', cursor: 'pointer' }}
                                        >
                                            Mark In Progress
                                        </button>
                                        <button
                                            onClick={() => handleUpdateComplaint('resolved')}
                                            disabled={updating}
                                            style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#10b981', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}
                                        >
                                            Mark Resolved
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

export default ManagerComplaintsPage;
