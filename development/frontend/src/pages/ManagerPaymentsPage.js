import React, { useState, useEffect } from 'react';
import { 
    Search, Eye, X, CheckCircle, Clock,
    Download
} from 'lucide-react';
import SidebarLayout from '../components/SidebarLayout';
import { paymentApi } from '../api/api';
import { jsPDF } from "jspdf";
import html2canvas from 'html2canvas';


const ManagerPaymentsPage = () => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [invoiceData, setInvoiceData] = useState(null);
    const [isDownloading, setIsDownloading] = useState(false);
    const invoiceRef = React.useRef(null);

    const fetchPayments = async () => {
        setLoading(true);
        try {
            const res = await paymentApi.getAll();
            if (res.success) {
                setPayments(res.data);
            }
        } catch (err) {
            console.error('Error fetching payments:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPayments();
    }, []);

    const handleDownloadInvoice = async (payment) => {
        setIsDownloading(true);
        try {
            let res;
            if (payment.bookingId) {
                res = await paymentApi.getInvoice(payment.bookingId);
            } else {
                res = await paymentApi.getAdInvoice(payment.advertisementId);
            }

            if (res.success) {
                setInvoiceData(res.data);
                // Wait for the hidden component to render
                setTimeout(async () => {
                    if (invoiceRef.current) {
                        const canvas = await html2canvas(invoiceRef.current, { scale: 2 });
                        const imgData = canvas.toDataURL('image/png');
                        const pdf = new jsPDF('p', 'mm', 'a4');
                        const imgWidth = 210;
                        const imgHeight = (canvas.height * imgWidth) / canvas.width;
                        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
                        pdf.save(`Invoice_${res.data.bookingRefNumber || res.data.invoiceNumber}.pdf`);
                        setInvoiceData(null);
                    }
                }, 500);
            }
        } catch (err) {
            alert(err.error || "Failed to download invoice.");
        } finally {
            setIsDownloading(false);
        }
    };

    const getStatusStyle = (status) => {
        const s = status?.toLowerCase();
        switch(s) {
            case 'completed': case 'paid': return { bg: '#ecfdf5', text: '#10b981', icon: <CheckCircle size={14} /> };
            case 'pending': return { bg: '#fff7ed', text: '#f97316', icon: <Clock size={14} /> };
            case 'failed': case 'cancelled': return { bg: '#fef2f2', text: '#ef4444', icon: <X size={14} /> };
            default: return { bg: '#f1f5f9', text: '#64748b', icon: null };
        }
    };

    const filteredPayments = payments.filter(p =>
        String(p.paymentId || '').includes(searchTerm) ||
        String(p.invoiceId || '').includes(searchTerm) ||
        (p.paymentMethod || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.paymentStatus || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <SidebarLayout role="manager">
            <div style={{ height: 'calc(100vh - 140px)', display: 'flex', flexDirection: 'column', padding: '10px' }}>
                <div style={{ marginBottom: '30px' }}>
                    <h1 style={{ fontSize: '1.875rem', fontWeight: '800', color: '#1e293b', marginBottom: '8px' }}>Payments & Billing</h1>
                    <p style={{ color: '#64748b', fontSize: '1rem' }}>Track transactions and monitor revenue</p>
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
                                placeholder="Search by invoice or client..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '0.9rem' }} 
                            />
                        </div>
                    </div>

                    <div style={{ flex: 1, border: '1px solid #f1f5f9', borderRadius: '8px', overflow: 'auto', background: '#fff' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', minWidth: '1400px' }}>
                            <thead style={{ position: 'sticky', top: 0, zIndex: 10, background: '#fff' }}>
                                <tr style={{ borderBottom: '2px solid #f1f5f9', textAlign: 'left' }}>
                                    <th style={{ padding: '15px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', fontSize: '0.7rem' }}>paymentId</th>
                                    <th style={{ padding: '15px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', fontSize: '0.7rem' }}>paymentAmount</th>
                                    <th style={{ padding: '15px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', fontSize: '0.7rem' }}>paymentMethod</th>
                                    <th style={{ padding: '15px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', fontSize: '0.7rem' }}>paymentStatus</th>
                                    <th style={{ padding: '15px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', fontSize: '0.7rem' }}>paymentDate</th>
                                    <th style={{ padding: '15px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', fontSize: '0.7rem' }}>paymentReference</th>
                                    <th style={{ padding: '15px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', fontSize: '0.7rem' }}>invoiceId</th>
                                    <th style={{ padding: '15px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', fontSize: '0.7rem' }}>bookingId</th>
                                    <th style={{ padding: '15px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', fontSize: '0.7rem' }}>advertisementId</th>
                                    <th style={{ padding: '15px', textAlign: 'right', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', fontSize: '0.7rem' }}>paymentCreatedAt</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="10" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>Loading payment...</td></tr>
                                ) : filteredPayments.length === 0 ? (
                                    <tr><td colSpan="10" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>No payment found.</td></tr>
                                ) : (
                                    filteredPayments.map(p => (
                                        <tr
                                            key={p.paymentId}
                                            onClick={() => setSelectedPayment(selectedPayment?.paymentId === p.paymentId ? null : p)}
                                            style={{
                                                borderBottom: '1px solid #f1f5f9',
                                                cursor: 'pointer',
                                                background: selectedPayment?.paymentId === p.paymentId ? '#f8fafc' : 'transparent',
                                                transition: 'background 0.2s'
                                            }}
                                        >
                                            <td style={{ padding: '12px 15px', fontWeight: '800', color: 'var(--navy)' }}>{p.paymentId}</td>
                                            <td style={{ padding: '12px 15px', fontWeight: '700', color: '#1e293b' }}>{p.paymentAmount != null ? `Rs. ${parseFloat(p.paymentAmount).toLocaleString()}` : '-'}</td>
                                            <td style={{ padding: '12px 15px', fontWeight: '600' }}>{p.paymentMethod || '-'}</td>
                                            <td style={{ padding: '12px 15px' }}>
                                                <span style={{
                                                    padding: '6px 12px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: '800',
                                                    background: getStatusStyle(p.paymentStatus).bg, color: getStatusStyle(p.paymentStatus).text,
                                                    display: 'inline-flex', alignItems: 'center', gap: '5px', textTransform: 'uppercase'
                                                }}>
                                                    {getStatusStyle(p.paymentStatus).icon}
                                                    {p.paymentStatus}
                                                </span>
                                            </td>
                                            <td style={{ padding: '12px 15px', fontWeight: '600' }}>{p.paymentDate ? new Date(p.paymentDate).toLocaleDateString() : '-'}</td>
                                            <td style={{ padding: '12px 15px', fontFamily: 'monospace' }}>{p.paymentReference || '-'}</td>
                                            <td style={{ padding: '12px 15px', fontWeight: '700' }}>{p.invoiceNumber || '-'}</td>
                                            <td style={{ padding: '12px 15px' }}>{p.bookingId || '-'}</td>
                                            <td style={{ padding: '12px 15px' }}>{p.advertisementId || '-'}</td>
                                            <td style={{ padding: '12px 15px', textAlign: 'right', color: '#94a3b8' }}>{p.paymentCreatedAt ? new Date(p.paymentCreatedAt).toLocaleDateString() : '-'}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Persistent Floating Action Container */}
                    <div style={{ 
                        position: 'fixed', 
                        bottom: '30px', 
                        right: '30px', 
                        zIndex: 1000,
                        background: 'rgba(255,255,255,0.9)',
                        padding: '15px',
                        borderRadius: '12px',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid #e2e8f0'
                    }}>
                        <button 
                            onClick={() => {
                                if (selectedPayment) setShowModal(true);
                            }} 
                            disabled={!selectedPayment}
                            style={{ 
                                padding: '12px 24px', 
                                borderRadius: '8px', 
                                border: 'none', 
                                background: selectedPayment ? 'var(--yellow)' : '#f1f5f9', 
                                color: selectedPayment ? 'black' : '#94a3b8', 
                                cursor: selectedPayment ? 'pointer' : 'default', 
                                fontWeight: '700', 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '8px',
                                fontSize: '0.9rem',
                                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                            }}
                        >
                            <Eye size={18} /> View Payment
                        </button>
                    </div>
                </div>

                {showModal && selectedPayment && (
                    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000 }}>
                        <div style={{ background: 'white', borderRadius: '16px', width: '560px', maxWidth: '95%', maxHeight: '90vh', overflowY: 'auto' }}>
                            <div style={{ padding: '15px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: 'white', zIndex: 10 }}>
                                <h2 style={{ margin: 0, color: '#1e293b', fontSize: '1.25rem' }}>View Payment</h2>
                                <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><X size={24} /></button>
                            </div>
                            <div style={{ padding: '30px' }}>
                                <h4 style={{ margin: '0 0 16px 0', color: '#64748b', textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: '800' }}>payment Table</h4>
                                <div style={{ background: '#f8fafc', borderRadius: '10px', padding: '18px', marginBottom: '20px', display: 'grid', gap: '12px' }}>
                                    {[
                                        ['paymentId', selectedPayment.paymentId],
                                        ['paymentAmount', selectedPayment.paymentAmount != null ? `Rs. ${parseFloat(selectedPayment.paymentAmount).toLocaleString()}` : '-'],
                                        ['paymentMethod', selectedPayment.paymentMethod],
                                        ['paymentStatus', selectedPayment.paymentStatus],
                                        ['paymentDate', selectedPayment.paymentDate ? new Date(selectedPayment.paymentDate).toLocaleString() : '-'],
                                        ['paymentReference', selectedPayment.paymentReference],
                                        ['invoiceId', selectedPayment.invoiceId],
                                        ['paymentCreatedAt', selectedPayment.paymentCreatedAt ? new Date(selectedPayment.paymentCreatedAt).toLocaleString() : '-'],
                                    ].map(([key, val]) => (
                                        <div key={key} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
                                            <span style={{ color: '#64748b', fontFamily: 'monospace', fontSize: '0.9rem' }}>{key}</span>
                                            <span style={{ fontWeight: '600', color: '#1e293b' }}>{val ?? '-'}</span>
                                        </div>
                                    ))}
                                </div>

                                {(selectedPayment.invoiceNumber || selectedPayment.invoiceAmount) && (
                                    <>
                                        <h4 style={{ margin: '0 0 16px 0', color: '#64748b', textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: '800' }}>invoice (via invoiceId)</h4>
                                        <div style={{ background: '#f8fafc', borderRadius: '10px', padding: '18px', display: 'grid', gap: '12px' }}>
                                            {[
                                                ['invoiceId', selectedPayment.invoiceId],
                                                ['invoiceNumber', selectedPayment.invoiceNumber],
                                                ['invoiceAmount', selectedPayment.invoiceAmount != null ? `Rs. ${parseFloat(selectedPayment.invoiceAmount).toLocaleString()}` : '-'],
                                                ['invoiceStatus', selectedPayment.invoiceStatus],
                                                ['bookingId', selectedPayment.bookingId],
                                                ['advertisementId', selectedPayment.advertisementId],
                                                ['invoiceCreatedAt', selectedPayment.invoiceCreatedAt ? new Date(selectedPayment.invoiceCreatedAt).toLocaleString() : '-'],
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
                                    onClick={() => handleDownloadInvoice(selectedPayment)}
                                    disabled={isDownloading}
                                    style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid var(--navy)', background: 'white', color: 'var(--navy)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
                                >
                                    <Download size={18} /> {isDownloading ? 'Processing...' : 'Download Invoice'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Hidden Invoice Template for PDF Generation */}
                {invoiceData && (
                    <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
                        <div ref={invoiceRef} style={{ 
                            width: '210mm', 
                            minHeight: '297mm', 
                            padding: '25.4mm', 
                            background: 'white', 
                            color: '#000', 
                            fontFamily: "'Inter', sans-serif",
                            boxSizing: 'border-box',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between'
                        }}>
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid var(--navy)', paddingBottom: '20px', marginBottom: '30px' }}>
                                    <div>
                                        <h1 style={{ margin: 0, fontSize: '2.2rem', fontWeight: '900', color: 'var(--navy)' }}>INVOICE</h1>
                                        <p style={{ margin: '5px 0', color: '#64748b', fontWeight: '600' }}>{invoiceData.bookingRefNumber || invoiceData.invoiceNumber}</p>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <h2 style={{ margin: 0, color: 'var(--navy)', fontWeight: '900', fontSize: '1.4rem' }}>SEATS LABS</h2>
                                        <p style={{ margin: '3px 0', fontSize: '0.85rem' }}>123 Automotive Way, Colombo 07</p>
                                        <p style={{ margin: '3px 0', fontSize: '0.85rem' }}>+94 11 234 5678</p>
                                        <p style={{ margin: '3px 0', fontSize: '0.85rem', color: 'var(--crimson)', fontWeight: '600' }}>contact@seatslabs.com</p>
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', marginBottom: '40px' }}>
                                    <div>
                                        <h3 style={{ textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: '800', color: '#94a3b8', borderBottom: '1px solid #e2e8f0', paddingBottom: '5px', marginBottom: '10px' }}>Bill To</h3>
                                        <p style={{ fontWeight: '800', margin: '5px 0', fontSize: '1rem' }}>{invoiceData.customerFirstName ? `${invoiceData.customerFirstName} ${invoiceData.customerLastName}` : invoiceData.advertiserBusinessName}</p>
                                        <p style={{ margin: '3px 0', fontSize: '0.9rem', color: '#475569' }}>{invoiceData.customerAddress || invoiceData.advertiserAddress || 'No address provided'}</p>
                                        <p style={{ margin: '3px 0', fontSize: '0.9rem', color: '#475569' }}>{invoiceData.customerPhone || invoiceData.advertiserContactPhone}</p>
                                        <p style={{ margin: '3px 0', fontSize: '0.9rem', color: 'var(--navy)', fontWeight: '600' }}>{invoiceData.customerEmail || invoiceData.advertiserContactEmail}</p>
                                    </div>
                                    <div>
                                        <h3 style={{ textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: '800', color: '#94a3b8', borderBottom: '1px solid #e2e8f0', paddingBottom: '5px', marginBottom: '10px' }}>Details</h3>
                                        <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: '5px', fontSize: '0.9rem' }}>
                                            <span style={{ color: '#64748b', fontWeight: '600' }}>Date Issued:</span>
                                            <span style={{ fontWeight: '700' }}>{new Date().toLocaleDateString()}</span>
                                            
                                            {invoiceData.bookingId ? (
                                                <>
                                                    <span style={{ color: '#64748b', fontWeight: '600' }}>Vehicle:</span>
                                                    <span style={{ fontWeight: '700' }}>{invoiceData.vehicleMake} {invoiceData.vehicleModel}</span>
                                                    <span style={{ color: '#64748b', fontWeight: '600' }}>Reg Number:</span>
                                                    <span style={{ fontWeight: '700' }}>{invoiceData.vehicleRegNumber}</span>
                                                </>
                                            ) : (
                                                <>
                                                    <span style={{ color: '#64748b', fontWeight: '600' }}>Campaign:</span>
                                                    <span style={{ fontWeight: '700' }}>{invoiceData.advertisementTitle}</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '30px' }}>
                                    <thead>
                                        <tr style={{ background: 'var(--navy)', color: 'white' }}>
                                            <th style={{ textAlign: 'left', padding: '12px 15px', fontSize: '0.8rem', textTransform: 'uppercase' }}>Description</th>
                                            <th style={{ textAlign: 'right', padding: '12px 15px', fontSize: '0.8rem', textTransform: 'uppercase' }}>Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                                            <td style={{ padding: '15px', fontWeight: '600', color: '#1e293b' }}>
                                                {invoiceData.serviceName || `Marketing Placement: ${invoiceData.advertisementTitle}`}
                                                <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px', fontWeight: '400' }}>
                                                    {invoiceData.bookingId ? 'Professional Automotive Service' : 'Digital Advertising Services'}
                                                </div>
                                            </td>
                                            <td style={{ textAlign: 'right', padding: '15px', fontWeight: '700', color: '#1e293b', fontSize: '1rem' }}>
                                                Rs. {parseFloat(invoiceData.servicePrice || invoiceData.invoiceAmount).toLocaleString()}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>

                                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                    <div style={{ width: '250px', background: '#f8fafc', padding: '20px', borderRadius: '8px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '0.9rem', color: '#64748b' }}>
                                            <span>Subtotal:</span>
                                            <span>Rs. {parseFloat(invoiceData.servicePrice || invoiceData.invoiceAmount).toLocaleString()}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px solid #e2e8f0', paddingTop: '10px', marginTop: '10px', fontWeight: '900', color: 'var(--navy)', fontSize: '1.2rem' }}>
                                            <span>TOTAL:</span>
                                            <span>Rs. {parseFloat(invoiceData.servicePrice || invoiceData.invoiceAmount).toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '20px', marginTop: '60px', textAlign: 'center' }}>
                                <p style={{ margin: '0 0 10px 0', fontSize: '0.9rem', fontWeight: '700', color: 'var(--navy)' }}>Thank you for choosing Seats Labs!</p>
                                <div style={{ fontSize: '0.75rem', color: '#94a3b8', lineHeight: '1.5' }}>
                                    This is a computer-generated invoice and requires no physical signature.<br />
                                    Payments once processed are subject to our refund policy.
                                </div>
                                <div style={{ marginTop: '15px', fontSize: '0.7rem', color: '#cbd5e1' }}>
                                    © {new Date().getFullYear()} Seats Labs Inc. All rights reserved.
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </SidebarLayout>
    );
};

export default ManagerPaymentsPage;
