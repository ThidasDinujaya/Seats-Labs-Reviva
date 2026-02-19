import React, { useState, useEffect } from 'react';
import { 
    Search, Star, Eye, X
} from 'lucide-react';
import SidebarLayout from '../components/SidebarLayout';

const ManagerFeedbacksPage = () => {
    const [feedbacks, setFeedbacks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [ratingFilter, setRatingFilter] = useState('all');
    const [showModal, setShowModal] = useState(false);
    const [selectedFeedback, setSelectedFeedback] = useState(null);

    useEffect(() => {
        setTimeout(() => {
            const mockFeedbacks = [
                {
                    feedbackId: 3001,
                    customerFirstName: 'Saman',
                    customerLastName: 'Perera',
                    serviceName: 'Full Lubrication Service',
                    feedbackRating: 5,
                    feedbackComment: 'Excellent service! The staff was very professional and the job was done quickly.',
                    feedbackCreatedAt: '2026-02-14T10:00:00'
                },
                {
                    feedbackId: 3002,
                    customerFirstName: 'Kamal',
                    customerLastName: 'Silva',
                    serviceName: 'Engine Tuning',
                    feedbackRating: 4,
                    feedbackComment: 'Decent work, but had to wait a bit longer than expected.',
                    feedbackCreatedAt: '2026-02-13T14:30:00'
                },
                {
                    feedbackId: 3003,
                    customerFirstName: 'John',
                    customerLastName: 'Doe',
                    serviceName: 'AC Full Service',
                    feedbackRating: 2,
                    feedbackComment: 'AC is still making some noise. Not fully satisfied.',
                    feedbackCreatedAt: '2026-02-12T09:15:00'
                }
            ];
            setFeedbacks(mockFeedbacks);
            setLoading(false);
        }, 800);
    }, []);

    const filteredFeedbacks = feedbacks.filter(f => 
        ((f.customerFirstName + ' ' + f.customerLastName).toLowerCase().includes(searchTerm.toLowerCase()) || 
         f.serviceName.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (ratingFilter === 'all' || f.feedbackRating.toString() === ratingFilter)
    );

    const renderStars = (rating) => {
        return (
            <div style={{ display: 'flex', gap: '2px' }}>
                {[1, 2, 3, 4, 5].map(star => (
                    <Star 
                        key={star} 
                        size={14} 
                        fill={star <= rating ? "#f59e0b" : "none"} 
                        color={star <= rating ? "#f59e0b" : "#cbd5e1"} 
                    />
                ))}
            </div>
        );
    };

    return (
        <SidebarLayout role="manager">
            <div style={{ height: 'calc(100vh - 140px)', display: 'flex', flexDirection: 'column', padding: '10px' }}>
                <div style={{ marginBottom: '30px' }}>
                    <h1 style={{ fontSize: '1.875rem', fontWeight: '800', color: '#1e293b', marginBottom: '8px' }}>Customer Feedback</h1>
                    <p style={{ color: '#64748b', fontSize: '1rem' }}>Review and manage customer ratings and testimonials</p>
                </div>


                <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', padding: '24px', flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    <div style={{ display: 'flex', gap: '15px', marginBottom: '25px' }}>
                        <div style={{ position: 'relative', flex: 1 }}>
                            <Search style={{ position: 'absolute', left: '12px', top: '12px', color: '#94a3b8' }} size={20} />
                            <input 
                                type="text" 
                                placeholder="Search by customer or service..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none' }} 
                            />
                        </div>
                        <select 
                            value={ratingFilter}
                            onChange={(e) => setRatingFilter(e.target.value)}
                            style={{ padding: '12px 15px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', outline: 'none' }}
                        >
                            <option value="all">All Ratings</option>
                            <option value="5">5 Stars</option>
                            <option value="4">4 Stars</option>
                            <option value="3">3 Stars</option>
                            <option value="2">2 Stars</option>
                            <option value="1">1 Star</option>
                        </select>
                    </div>

                    <div style={{ overflowY: 'auto', flex: 1, overflowX: 'auto', border: '1px solid #f1f5f9', borderRadius: '8px' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid #f1f5f9', textAlign: 'left', position: 'sticky', top: 0, background: 'white', zIndex: 1 }}>
                                    <th style={{ padding: '15px', color: '#64748b' }}>customerId</th>
                                    <th style={{ padding: '15px', color: '#64748b' }}>bookingId</th>
                                    <th style={{ padding: '15px', color: '#64748b' }}>feedbackRating</th>
                                    <th style={{ padding: '15px', color: '#64748b' }}>feedbackComment</th>
                                    <th style={{ padding: '15px', textAlign: 'right', color: '#64748b' }}>feedbackCreatedAt</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>Loading feedback...</td></tr>
                                ) : filteredFeedbacks.length === 0 ? (
                                    <tr><td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>No feedback found.</td></tr>
                                ) : (
                                    filteredFeedbacks.map(f => (
                                        <tr 
                                            key={f.feedbackId} 
                                            onClick={() => setSelectedFeedback(selectedFeedback?.feedbackId === f.feedbackId ? null : f)}
                                            style={{ 
                                                borderBottom: '1px solid #f1f5f9', 
                                                cursor: 'pointer',
                                                transition: 'background 0.2s',
                                                background: selectedFeedback?.feedbackId === f.feedbackId ? '#f1f5f9' : 'transparent'
                                            }}
                                        >
                                            <td style={{ padding: '15px', fontWeight: '600' }}>{f.customerFirstName} {f.customerLastName}</td>
                                            <td style={{ padding: '15px' }}>{f.serviceName}</td>
                                            <td style={{ padding: '15px' }}>{renderStars(f.feedbackRating)}</td>
                                            <td style={{ padding: '15px', maxWidth: '300px' }}>
                                                <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: '0.9rem' }}>
                                                    {f.feedbackComment}
                                                </div>
                                            </td>
                                            <td style={{ padding: '15px', color: '#64748b', fontSize: '0.85rem', textAlign: 'right' }}>{new Date(f.feedbackCreatedAt).toLocaleDateString()}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', padding: '20px 0 0 0', borderTop: '1px solid #f1f5f9', marginTop: '10px' }}>
                        <button 
                            onClick={() => {
                                if (selectedFeedback) setShowModal(true);
                            }} 
                            disabled={!selectedFeedback}
                            style={{ padding: '10px 24px', borderRadius: '8px', border: 'none', background: selectedFeedback ? 'var(--yellow)' : '#f1f5f9', color: selectedFeedback ? 'black' : '#94a3b8', cursor: selectedFeedback ? 'pointer' : 'default', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}
                        >
                            <Eye size={18} /> View Feedback
                        </button>
                    </div>
                </div>

                {showModal && (
                    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000 }}>
                        <div style={{ background: 'white', borderRadius: '16px', width: '500px', maxWidth: '95%', maxHeight: '90vh', overflowY: 'auto' }}>
                            <div style={{ padding: '20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: 'white', zIndex: 10 }}>
                                <h2 style={{ margin: 0, color: '#1e293b' }}>Feedback Details</h2>
                                <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={24} /></button>
                            </div>
                            <div style={{ padding: '30px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
                                    <div style={{ width: '50px', height: '50px', background: '#f1f5f9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.2rem', color: 'var(--navy)' }}>
                                        {selectedFeedback?.customerFirstName.charAt(0)}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{selectedFeedback?.customerFirstName} {selectedFeedback?.customerLastName}</div>
                                        <div style={{ color: '#64748b', fontSize: '0.85rem' }}>Service: {selectedFeedback?.serviceName}</div>
                                    </div>
                                </div>
                                <div style={{ marginBottom: '20px' }}>
                                    <div style={{ marginBottom: '8px' }}>{renderStars(selectedFeedback?.feedbackRating)}</div>
                                    <div style={{ background: '#f8fafc', p: '20px', borderRadius: '12px', fontStyle: 'italic', color: '#334155', lineHeight: '1.6' }}>
                                        "{selectedFeedback?.feedbackComment}"
                                    </div>
                                </div>
                            </div>
                            <div style={{ padding: '20px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '10px', position: 'sticky', bottom: 0, background: 'white', zIndex: 10 }}>
                                <button style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #ef4444', background: 'white', color: '#ef4444', fontWeight: '600', cursor: 'pointer' }}>Hide Comment</button>
                                <button style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#10b981', color: 'white', fontWeight: '600', cursor: 'pointer' }}>Featured Testimonial</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </SidebarLayout>
    );
};

export default ManagerFeedbacksPage;
