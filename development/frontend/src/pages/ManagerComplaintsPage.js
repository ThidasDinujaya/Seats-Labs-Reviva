import React, { useState, useEffect } from 'react';
import { 
    Search, Eye, X, 
    CheckCircle, Clock, ShieldAlert
} from 'lucide-react';
import SidebarLayout from '../components/SidebarLayout';

const ManagerComplaintsPage = () => {
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [selectedComplaint, setSelectedComplaint] = useState(null);

    useEffect(() => {
        setTimeout(() => {
            const mockComplaints = [
                {
                    complaintId: 4001,
                    customerName: 'Nimal Sirisena',
                    complaintTitle: 'Delayed Service Completion',
                    complaintDescription: 'The service was promised to be finished by 2 PM but was only ready at 5 PM without any update.',
                    complaintPriority: 'high',
                    complaintStatus: 'open',
                    complaintCreatedAt: '2026-02-14'
                },
                {
                    complaintId: 4002,
                    customerName: 'Anura Kumara',
                    complaintTitle: 'Incorrect Billing',
                    complaintDescription: 'I was charged for a filter replacement that I specifically asked not to be performed.',
                    complaintPriority: 'medium',
                    complaintStatus: 'resolved',
                    complaintCreatedAt: '2026-02-13'
                },
                {
                    complaintId: 4003,
                    customerName: 'Sunil Perera',
                    complaintTitle: 'Rude Behavior',
                    complaintDescription: 'The front desk staff was very dismissive when I asked about my car status.',
                    complaintPriority: 'low',
                    complaintStatus: 'open',
                    complaintCreatedAt: '2026-02-12'
                }
            ];
            setComplaints(mockComplaints);
            setLoading(false);
        }, 800);
    }, []);

    const getPriorityStyle = (priority) => {
        switch(priority) {
            case 'high': return { bg: '#fee2e2', text: '#ef4444' };
            case 'medium': return { bg: '#ffedd5', text: '#f97316' };
            case 'low': return { bg: '#f1f5f9', text: '#64748b' };
            default: return { bg: '#f1f5f9', text: '#64748b' };
        }
    };

    const filteredComplaints = complaints.filter(c => 
        (c.customerName.toLowerCase().includes(searchTerm.toLowerCase()) || 
         c.complaintTitle.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <SidebarLayout role="manager">
            <div style={{ height: 'calc(100vh - 80px)', display: 'flex', flexDirection: 'column', marginTop: '-15px', padding: '15px' }}>
                <div style={{ marginBottom: '30px' }}>
                    <h1 style={{ fontSize: '1.875rem', fontWeight: '800', color: '#1e293b', marginBottom: '8px' }}>Customer Complaints</h1>
                    <p style={{ color: '#64748b', fontSize: '1rem' }}>Address and resolve customer grievances and service issues</p>
                </div>

                <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', padding: '24px', flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    <div style={{ display: 'flex', gap: '15px', marginBottom: '25px' }}>
                        <div style={{ position: 'relative', flex: 1 }}>
                            <Search style={{ position: 'absolute', left: '12px', top: '12px', color: '#94a3b8' }} size={20} />
                            <input 
                                type="text" 
                                placeholder="Search by customer or issue..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none' }} 
                            />
                        </div>
                    </div>

                    <div style={{ overflowY: 'auto', flex: 1, overflowX: 'auto', border: '1px solid #f1f5f9', borderRadius: '8px' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid #f1f5f9', textAlign: 'left', position: 'sticky', top: 0, background: 'white', zIndex: 1 }}>
                                    <th style={{ padding: '15px', color: '#64748b' }}>customerId</th>
                                    <th style={{ padding: '15px', color: '#64748b' }}>complaintTitle</th>
                                    <th style={{ padding: '15px', color: '#64748b' }}>complaintStatus</th>
                                    <th style={{ padding: '15px', textAlign: 'right', color: '#64748b' }}>complaintCreatedAt</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="4" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>Loading complaints...</td></tr>
                                ) : filteredComplaints.length === 0 ? (
                                    <tr><td colSpan="4" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>No complaints found.</td></tr>
                                ) : (
                                    filteredComplaints.map(c => (
                                        <tr 
                                            key={c.complaintId} 
                                            onClick={() => setSelectedComplaint(selectedComplaint?.complaintId === c.complaintId ? null : c)}
                                            style={{ 
                                                borderBottom: '1px solid #f1f5f9', 
                                                cursor: 'pointer',
                                                transition: 'background 0.2s',
                                                background: selectedComplaint?.complaintId === c.complaintId ? '#f1f5f9' : 'transparent'
                                            }}
                                        >
                                            <td style={{ padding: '15px', fontWeight: '600' }}>{c.customerName}</td>
                                            <td style={{ padding: '15px' }}>{c.complaintTitle}</td>
                                            <td style={{ padding: '15px' }}>
                                                <span style={{ color: c.complaintStatus === 'open' ? '#3b82f6' : '#10b981', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.9rem' }}>
                                                    {c.complaintStatus === 'open' ? <Clock size={16} /> : <CheckCircle size={16} />}
                                                    {c.complaintStatus.charAt(0).toUpperCase() + c.complaintStatus.slice(1)}
                                                </span>
                                            </td>
                                            <td style={{ padding: '15px', color: '#64748b', fontSize: '0.85rem', textAlign: 'right' }}>{c.complaintCreatedAt}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', padding: '20px 0 0 0', borderTop: '1px solid #f1f5f9', marginTop: '10px' }}>
                        <button 
                            onClick={() => {
                                if (selectedComplaint) setShowModal(true);
                            }} 
                            disabled={!selectedComplaint}
                            style={{ padding: '10px 24px', borderRadius: '8px', border: 'none', background: selectedComplaint ? 'var(--yellow)' : '#f1f5f9', color: selectedComplaint ? 'black' : '#94a3b8', cursor: selectedComplaint ? 'pointer' : 'default', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}
                        >
                            <Eye size={18} /> View Complaint
                        </button>
                    </div>
                </div>

                {showModal && (
                    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000 }}>
                        <div style={{ background: 'white', borderRadius: '16px', width: '600px', maxWidth: '95%', maxHeight: '90vh', overflowY: 'auto' }}>
                            <div style={{ padding: '20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: 'white', zIndex: 10 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <ShieldAlert color="#ef4444" size={24} />
                                    <h2 style={{ margin: 0, color: '#1e293b' }}>Complaint Details</h2>
                                </div>
                                <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={24} /></button>
                            </div>
                            <div style={{ padding: '30px' }}>
                                <div style={{ marginBottom: '25px' }}>
                                    <h3 style={{ margin: '0 0 10px 0', fontSize: '1.25rem' }}>{selectedComplaint?.complaintTitle}</h3>
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Reported by: <strong>{selectedComplaint?.customerName}</strong></span>
                                        <span style={{ fontSize: '0.85rem', color: '#64748b' }}>| Date: {selectedComplaint?.complaintCreatedAt}</span>
                                    </div>
                                </div>
                                <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', borderLeft: `4px solid ${getPriorityStyle(selectedComplaint?.complaintPriority).text}`, marginBottom: '25px' }}>
                                    <div style={{ color: '#475569', lineHeight: '1.6' }}>{selectedComplaint?.complaintDescription}</div>
                                </div>
                            </div>
                            {selectedComplaint?.complaintStatus === 'open' && (
                                <div style={{ borderTop: '1px solid #e2e8f0' }}>
                                    <div style={{ padding: '30px', paddingBottom: '10px' }}>
                                        <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>Internal Resolution Notes</label>
                                        <textarea rows="4" placeholder="Enter steps taken to resolve this issue..." style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }} />
                                    </div>
                                    <div style={{ padding: '20px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '10px', position: 'sticky', bottom: 0, background: 'white', zIndex: 10 }}>
                                        <button style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #cbd5e1', background: 'white', fontWeight: '600', cursor: 'pointer' }}>Assign to Team</button>
                                        <button style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#10b981', color: 'white', fontWeight: '600', cursor: 'pointer' }}>Mark as Resolved</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </SidebarLayout>
    );
};

export default ManagerComplaintsPage;
