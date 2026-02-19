import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { bookingApi, timeSlotApi } from '../api/api';
import { Plus, Car, Eye, Edit2, Trash2, X, Check, AlertCircle, Search, Download, CreditCard, MessageSquare, AlertTriangle, Star } from 'lucide-react';
import SidebarLayout from '../components/SidebarLayout';
import api, { paymentApi, feedbackApi, complaintApi } from '../api/api';
import { formatTime } from '../utils/formatters';
import { jsPDF } from "jspdf";
import html2canvas from 'html2canvas';

const Dashboard = () => {
    const { user } = useAuth();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [timeSlots, setTimeSlots] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedId, setSelectedId] = useState(null);

    // Modal states
    const [showViewModal, setShowViewModal] = useState(false);
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [selectedBookingForModal, setSelectedBookingForModal] = useState(null);
    const [invoiceData, setInvoiceData] = useState(null);
    const [isDownloading, setIsDownloading] = useState(false);
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);
    const [showComplaintModal, setShowComplaintModal] = useState(false);
    const [feedbackData, setFeedbackData] = useState({ rating: 5, comment: '' });
    const [complaintData, setComplaintData] = useState({ title: '', description: '', priority: 'medium' });
    const invoiceRef = React.useRef(null);

    // Form state for update
    const [formData, setFormData] = useState({
        bookingDate: '',
        timeSlotId: '',
        vehicleId: '',
        bookingCustomerNotes: ''
    });

    const fetchBookings = async () => {
        try {
            const res = await bookingApi.getAll({ customerId: user?.customerId });
            setBookings(res.data || []);
        } catch (err) {
            console.error('Error fetching bookings:', err);
        }
    };

    useEffect(() => {
        const initData = async () => {
            setLoading(true);
            try {
                const res = await bookingApi.getAll({ customerId: user?.customerId });
                setBookings(res.data || []);

                // Fetch time slots
                const tsRes = await timeSlotApi.getAll();
                if (tsRes.success) setTimeSlots(tsRes.data.filter(ts => ts.timeSlotIsActive));

                // Fetch vehicles
                if (user?.customerId) {
                    const cRes = await api.get(`/customers/${user.customerId}`);
                    if (cRes.success) setVehicles(cRes.data.vehicles || []);
                }
            } catch (err) {
                console.error('Error initializing dashboard:', err);
            } finally {
                setLoading(false);
            }
        };
        initData();
    }, [user?.customerId]);

    const handleCancelBooking = async () => {
        if (!selectedId) return;
        const booking = bookings.find(b => b.bookingId === selectedId);
        if (!booking || !['pending', 'accepted'].includes(booking.bookingStatus)) return;

        if (!window.confirm("Are you sure you want to cancel this booking? This action cannot be undone.")) return;
        try {
            const res = await bookingApi.cancel(selectedId);
            if (res.success) {
                const refundMsg = res.data.refundPercentage ? ` Refund processed: ${res.data.refundPercentage}.` : "";
                alert("Booking cancelled successfully." + refundMsg);
                setSelectedId(null);
                fetchBookings();
            }
        } catch (err) {
            alert(err.error || "Failed to cancel booking.");
        }
    };

    const handleUpdateBooking = async (e) => {
        e.preventDefault();

        // Basic Validation
        if (!formData.bookingDate || !formData.timeSlotId || !formData.vehicleId) {
            alert("Please fill in all required fields.");
            return;
        }

        const selectedDate = new Date(formData.bookingDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (selectedDate < today) {
            alert("Booking date cannot be in the past.");
            return;
        }

        try {
            const res = await bookingApi.update(selectedId, formData);
            if (res.success) {
                alert("Booking updated successfully.");
                setShowUpdateModal(false);
                fetchBookings();
            }
        } catch (err) {
            alert(err.error || "Failed to update booking.");
        }
    };

    const openUpdateModal = () => {
        const booking = bookings.find(b => b.bookingId === selectedId);
        if (!booking || booking.bookingStatus !== 'pending') return;

        setSelectedBookingForModal(booking);
        setFormData({
            bookingDate: booking.bookingDate.split('T')[0],
            timeSlotId: booking.timeSlotId,
            vehicleId: booking.vehicleId,
            bookingCustomerNotes: booking.bookingCustomerNotes || ''
        });
        setShowUpdateModal(true);
    };

    const openViewModal = () => {
        const booking = bookings.find(b => b.bookingId === selectedId);
        if (!booking) return;
        setSelectedBookingForModal(booking);
        setInvoiceData(null); // Reset invoice data
        setShowViewModal(true);
    };

    const handleDownloadInvoice = async (bookingId) => {
        setIsDownloading(true);
        try {
            const res = await paymentApi.getInvoice(bookingId);
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
                        pdf.save(`Invoice_${res.data.bookingRefNumber}.pdf`);
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

    const handleFeedbackSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await feedbackApi.create({
                feedbackRating: feedbackData.rating,
                feedbackComment: feedbackData.comment,
                customerId: user.customerId,
                bookingId: selectedId,
                technicianId: selectedBooking.technicianId
            });
            if (res.success) {
                alert("Thank you for your feedback!");
                setShowFeedbackModal(false);
                setFeedbackData({ rating: 5, comment: '' });
                fetchBookings();
            }
        } catch (err) {
            alert(err.error || "Failed to submit feedback. You might have already submitted feedback for this booking.");
        }
    };

    const handleComplaintSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await complaintApi.create({
                complaintTitle: complaintData.title,
                complaintDescription: complaintData.description,
                complaintPriority: complaintData.priority,
                customerId: user.customerId,
                bookingId: selectedId
            });
            if (res.success) {
                alert("Complaint filed successfully. A manager will review it soon.");
                setShowComplaintModal(false);
                setComplaintData({ title: '', description: '', priority: 'medium' });
                fetchBookings();
            }
        } catch (err) {
            alert(err.error || "Failed to file complaint.");
        }
    };

    if (loading) return (
        <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-white)', color: 'var(--navy-blue)' }}>
            <div style={{ textAlign: 'center' }}>
                <Car size={48} className="spin" style={{ marginBottom: '1rem', color: 'var(--accent-red)' }} />
                <p style={{ fontWeight: '700' }}>Loading your dashboard...</p>
            </div>
        </div>
    );

    const filteredBookings = bookings.filter(b =>
        b.bookingRefNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (b.serviceName || b.servicePackageName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.vehicleRegNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const selectedBooking = bookings.find(b => b.bookingId === selectedId);
    const canModify = selectedBooking && selectedBooking.bookingStatus === 'pending';
    const canPay = selectedBooking && selectedBooking.invoiceStatus !== 'paid' && ['pending', 'accepted'].includes(selectedBooking.bookingStatus);
    const canReview = selectedBooking && selectedBooking.bookingStatus === 'completed';

    return (
        <SidebarLayout role="customer">
            <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '20px', height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>

                {/* Header Section */}
                <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 10px', flexShrink: 0 }}>
                    <div>
                        <h1 style={{ fontSize: '2.2rem', fontWeight: '900', color: 'var(--navy)', margin: 0, letterSpacing: '-1px' }}>My Bookings</h1>
                        <p style={{ color: '#64748b', marginTop: '2px', fontSize: '1rem' }}>Manage and track your automotive service appointments.</p>
                    </div>
                    <button onClick={() => window.location.href = '/book'} style={{ padding: '12px 24px', background: 'var(--navy)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 4px 12px rgba(0,47,108,0.2)' }}>
                        <Plus size={20} /> New Service Booking
                    </button>
                </div>

                {/* Search Bar */}
                <div style={{ marginBottom: '15px', position: 'relative', maxWidth: '400px', flexShrink: 0 }}>
                    <Search size={20} style={{ position: 'absolute', left: '15px', top: '12px', color: '#94a3b8' }} />
                    <input
                        type="text"
                        placeholder="Search by Ref #, Service or Vehicle..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        style={{ width: '100%', padding: '12px 15px 12px 45px', borderRadius: '12px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '1rem' }}
                    />
                </div>

                {/* Table Container - Only this scrolls */}
                <div style={{
                    background: 'white',
                    borderRadius: '20px 20px 0 0',
                    border: '1px solid #e2e8f0',
                    overflowY: 'auto',
                    flex: 1,
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
                }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead style={{ position: 'sticky', top: 0, background: '#f8fafc', zIndex: 1, borderBottom: '1px solid #e2e8f0' }}>
                            <tr>
                                <th style={thStyle}>bookingDate</th>
                                <th style={thStyle}>serviceName</th>
                                <th style={thStyle}>vehicleRegNumber</th>
                                <th style={thStyle}>bookingRefNumber</th>
                                <th style={thStyle}>bookingStatus</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredBookings.length > 0 ? filteredBookings.map(booking => (
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
                                    <td style={tdStyle}>
                                        <div style={{ fontWeight: '700', color: 'var(--navy)' }}>{new Date(booking.bookingDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{formatTime(booking.bookingStartTime)}</div>
                                    </td>
                                    <td style={tdStyle}>
                                        <div style={{ fontWeight: '700' }}>{booking.serviceName || booking.servicePackageName || 'Auto Service'}</div>
                                    </td>
                                    <td style={tdStyle}>
                                        <div style={{ fontWeight: '600' }}>{booking.vehicleMake} {booking.vehicleModel}</div>
                                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{booking.vehicleRegNumber}</div>
                                    </td>
                                    <td style={tdStyle}>
                                        <span style={{ fontFamily: 'monospace', fontWeight: '700', color: '#64748b' }}>{booking.bookingRefNumber}</span>
                                    </td>
                                    <td style={tdStyle}>
                                        <span style={{
                                            padding: '6px 14px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase',
                                            backgroundColor:
                                                booking.bookingStatus === 'completed' ? '#dcfce7' :
                                                    booking.bookingStatus === 'cancelled' || booking.bookingStatus === 'rejected' ? '#fee2e2' :
                                                        booking.bookingStatus === 'in_progress' ? '#fff7ed' : '#f1f5f9',
                                            color:
                                                booking.bookingStatus === 'completed' ? '#166534' :
                                                    booking.bookingStatus === 'cancelled' || booking.bookingStatus === 'rejected' ? '#991b1b' :
                                                        booking.bookingStatus === 'in_progress' ? '#9a3412' : 'var(--navy)'
                                        }}>
                                            {booking.bookingStatus.replace('_', ' ')}
                                        </span>
                                        {booking.refundStatus && (
                                            <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '4px', fontWeight: '600' }}>
                                                Refund: <span style={{ color: booking.refundStatus === 'completed' ? '#10b981' : '#f59e0b' }}>
                                                    {booking.refundStatus.toUpperCase()}
                                                </span>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="5" style={{ padding: '60px', textAlign: 'center', color: '#94a3b8' }}>
                                        {searchTerm ? 'No bookings match your search.' : 'You have no service bookings yet.'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Action Column Replacement - Bottom Buttons */}
                <div style={{
                    background: 'white',
                    padding: '20px 30px',
                    borderRadius: '0 0 20px 20px',
                    border: '1px solid #e2e8f0',
                    borderTop: 'none',
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: '12px',
                    flexShrink: 0
                }}>
                    {canPay && (
                        <button
                            onClick={() => window.location.href = `/payment/${selectedId}`}
                            style={{ ...footerBtnStyle, background: 'var(--navy)', color: 'white', cursor: 'pointer' }}
                        >
                            <CreditCard size={18} /> Pay Now
                        </button>
                    )}
                    {canReview && (
                        <>
                            <button
                                onClick={() => setShowFeedbackModal(true)}
                                style={{ ...footerBtnStyle, background: '#10b981', color: 'white', cursor: 'pointer' }}
                            >
                                <MessageSquare size={18} /> Feedback
                            </button>
                            <button
                                onClick={() => setShowComplaintModal(true)}
                                style={{ ...footerBtnStyle, background: '#f59e0b', color: 'white', cursor: 'pointer' }}
                            >
                                <AlertTriangle size={18} /> Complaint
                            </button>
                        </>
                    )}
                    <button
                        onClick={openViewModal}
                        disabled={!selectedId}
                        style={{ ...footerBtnStyle, background: selectedId ? 'var(--yellow)' : '#f1f5f9', color: selectedId ? 'black' : '#94a3b8', cursor: selectedId ? 'pointer' : 'default' }}
                    >
                        <Eye size={18} /> View Booking
                    </button>
                    <button
                        onClick={openUpdateModal}
                        disabled={!canModify}
                        style={{ ...footerBtnStyle, background: canModify ? '#3b82f6' : '#f1f5f9', color: canModify ? 'white' : '#94a3b8', cursor: canModify ? 'pointer' : 'not-allowed' }}
                    >
                        <Edit2 size={18} /> Update Booking
                    </button>
                    <button
                        onClick={handleCancelBooking}
                        disabled={!canModify}
                        style={{ ...footerBtnStyle, background: canModify ? '#ef4444' : '#f1f5f9', color: canModify ? 'white' : '#94a3b8', cursor: canModify ? 'pointer' : 'not-allowed' }}
                    >
                        <Trash2 size={18} /> Cancel Booking
                    </button>
                </div>

                {/* View Modal */}
                {showViewModal && selectedBookingForModal && (
                    <div style={modalOverlayStyle}>
                        <div style={modalContentStyle}>
                            <div style={modalHeaderStyle}>
                                <h2 style={{ margin: 0, fontSize: '1.4rem', color: 'var(--navy)', fontWeight: '800' }}>Booking Details</h2>
                                <button onClick={() => setShowViewModal(false)} style={closeBtnStyle}><X size={20} /></button>
                            </div>
                            <div style={{ padding: '30px' }}>
                                <div style={{ marginBottom: '25px', textAlign: 'center', padding: '20px', background: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                                    <div style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '800', marginBottom: '5px' }}>Current Status</div>
                                    <div style={{ fontSize: '1.4rem', fontWeight: '900', color: 'var(--navy)' }}>{selectedBookingForModal.bookingStatus.toUpperCase().replace('_', ' ')}</div>
                                </div>
                                <div style={{ display: 'grid', gap: '20px' }}>
                                    <DetailRow label="Reference Number" value={selectedBookingForModal.bookingRefNumber} isMono />
                                    <DetailRow label="Service Type" value={selectedBookingForModal.serviceName || selectedBookingForModal.servicePackageName} />
                                    <DetailRow label="Vehicle" value={`${selectedBookingForModal.vehicleMake} ${selectedBookingForModal.vehicleModel} (${selectedBookingForModal.vehicleRegNumber})`} />
                                    <DetailRow label="Appointment" value={`${new Date(selectedBookingForModal.bookingDate).toLocaleDateString(undefined, { dateStyle: 'full' })} at ${formatTime(selectedBookingForModal.bookingStartTime)}`} />
                                    <DetailRow label="My Notes" value={selectedBookingForModal.bookingCustomerNotes || 'No notes provided'} />
                                    {selectedBookingForModal.bookingTechnicianNotes && <DetailRow label="Workshop Feedback" value={selectedBookingForModal.bookingTechnicianNotes} color="var(--crimson)" />}
                                </div>
                            </div>
                            <div style={modalFooterStyle}>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button 
                                        onClick={() => handleDownloadInvoice(selectedBookingForModal.bookingId)} 
                                        disabled={isDownloading}
                                        style={{ flex: 1, padding: '12px 24px', background: 'var(--navy)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
                                    >
                                        <Download size={18} /> {isDownloading ? 'Generating...' : 'Download Invoice'}
                                    </button>
                                    <button onClick={() => setShowViewModal(false)} style={{ flex: 1, padding: '12px 24px', background: 'white', color: 'var(--navy)', border: '1px solid var(--navy)', borderRadius: '12px', fontWeight: '700', cursor: 'pointer' }}>Close</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Update Modal */}
                {showUpdateModal && selectedBookingForModal && (
                    <div style={modalOverlayStyle}>
                        <div style={modalContentStyle}>
                            <div style={modalHeaderStyle}>
                                <h2 style={{ margin: 0, fontSize: '1.4rem', color: 'var(--navy)', fontWeight: '800' }}>Update Booking</h2>
                                <button onClick={() => setShowUpdateModal(false)} style={closeBtnStyle}><X size={20} /></button>
                            </div>
                            <form onSubmit={handleUpdateBooking}>
                                <div style={{ padding: '30px', display: 'grid', gap: '20px' }}>
                                    <div style={{ padding: '15px', background: '#fffbeb', border: '1px solid #fef3c7', borderRadius: '12px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                                        <AlertCircle size={20} color="#d97706" style={{ flexShrink: 0, marginTop: '2px' }} />
                                        <p style={{ margin: 0, fontSize: '0.85rem', color: '#92400e', lineHeight: '1.5' }}>Updates are only permitted while the booking is <strong>Pending</strong>. Rescheduling depends on workshop slot availability.</p>
                                    </div>

                                    <div>
                                        <label style={labelStyle}>Selected Vehicle</label>
                                        <select style={inputStyle} value={formData.vehicleId} onChange={e => setFormData({ ...formData, vehicleId: e.target.value })}>
                                            {vehicles.map(v => (
                                                <option key={v.vehicleId} value={v.vehicleId}>{v.vehicleMake} {v.vehicleModel} ({v.vehicleRegNumber})</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                        <div>
                                            <label style={labelStyle}>New Date</label>
                                            <input type="date" style={inputStyle} value={formData.bookingDate} onChange={e => setFormData({ ...formData, bookingDate: e.target.value })} min={new Date().toISOString().split('T')[0]} />
                                        </div>
                                        <div>
                                            <label style={labelStyle}>New Time Slot</label>
                                            <select style={inputStyle} value={formData.timeSlotId} onChange={e => setFormData({ ...formData, timeSlotId: e.target.value })}>
                                                {timeSlots.map(ts => (
                                                    <option key={ts.timeSlotId} value={ts.timeSlotId}>{ts.timeSlotStartTime} - {ts.timeSlotEndTime}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label style={labelStyle}>Additional Notes</label>
                                        <textarea style={{ ...inputStyle, height: '100px', resize: 'none' }} value={formData.bookingCustomerNotes} onChange={e => setFormData({ ...formData, bookingCustomerNotes: e.target.value })} placeholder="Any specific concerns or details..." />
                                    </div>
                                </div>
                                <div style={{ ...modalFooterStyle, display: 'flex', gap: '12px' }}>
                                    <button type="button" onClick={() => setShowUpdateModal(false)} style={{ flex: 1, padding: '12px', background: 'white', color: '#64748b', border: '1px solid #e2e8f0', borderRadius: '12px', fontWeight: '700', cursor: 'pointer' }}>Cancel</button>
                                    <button type="submit" style={{ flex: 1, padding: '12px', background: 'var(--navy)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                        <Check size={20} /> Save Changes
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Hidden Invoice Template for PDF Generation */}
                {invoiceData && (
                    <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
                        <div ref={invoiceRef} style={{ width: '800px', padding: '60px', background: 'white', color: '#000', fontFamily: 'Arial, sans-serif' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #333', paddingBottom: '20px', marginBottom: '30px' }}>
                                <div>
                                    <h1 style={{ margin: 0, fontSize: '2.5rem', fontWeight: 'bold' }}>INVOICE</h1>
                                    <p style={{ margin: '5px 0', color: '#666' }}>#{invoiceData.bookingRefNumber}</p>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <h2 style={{ margin: 0, color: 'var(--navy)' }}>SEATS LABS</h2>
                                    <p style={{ margin: '5px 0' }}>123 Automotive Way, Colombo 07</p>
                                    <p style={{ margin: '5px 0' }}>+94 11 234 5678</p>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '50px', marginBottom: '40px' }}>
                                <div>
                                    <h3 style={{ textTransform: 'uppercase', fontSize: '0.9rem', color: '#666', borderBottom: '1px solid #eee', paddingBottom: '5px' }}>Bill To</h3>
                                    <p style={{ fontWeight: 'bold', margin: '5px 0' }}>{invoiceData.customerFirstName} {invoiceData.customerLastName}</p>
                                    <p style={{ margin: '5px 0' }}>{invoiceData.customerAddress || 'No address provided'}</p>
                                    <p style={{ margin: '5px 0' }}>{invoiceData.customerPhone}</p>
                                    <p style={{ margin: '5px 0' }}>{invoiceData.customerEmail}</p>
                                </div>
                                <div>
                                    <h3 style={{ textTransform: 'uppercase', fontSize: '0.9rem', color: '#666', borderBottom: '1px solid #eee', paddingBottom: '5px' }}>Details</h3>
                                    <p style={{ margin: '5px 0' }}><strong>Date Issued:</strong> {new Date().toLocaleDateString()}</p>
                                    <p style={{ margin: '5px 0' }}><strong>Vehicle:</strong> {invoiceData.vehicleMake} {invoiceData.vehicleModel}</p>
                                    <p style={{ margin: '5px 0' }}><strong>Reg Number:</strong> {invoiceData.vehicleRegNumber}</p>
                                </div>
                            </div>

                            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '40px' }}>
                                <thead>
                                    <tr style={{ borderBottom: '2px solid #333' }}>
                                        <th style={{ textAlign: 'left', padding: '15px' }}>serviceName</th>
                                        <th style={{ textAlign: 'right', padding: '15px' }}>servicePrice</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr style={{ borderBottom: '1px solid #eee' }}>
                                        <td style={{ padding: '15px' }}>{invoiceData.serviceName || 'Service Fee'}</td>
                                        <td style={{ textAlign: 'right', padding: '15px' }}>Rs. {(parseFloat(invoiceData.servicePrice) || parseFloat(invoiceData.invoiceAmount)).toLocaleString()}</td>
                                    </tr>
                                </tbody>
                                <tfoot>
                                    <tr>
                                        <td style={{ textAlign: 'right', padding: '15px', fontWeight: 'bold' }}>Total Amount</td>
                                        <td style={{ textAlign: 'right', padding: '15px', fontWeight: 'bold', fontSize: '1.2rem' }}>Rs. {(parseFloat(invoiceData.invoiceAmount) || 0).toLocaleString()}</td>
                                    </tr>
                                </tfoot>
                            </table>

                            <div style={{ borderTop: '1px solid #eee', paddingTop: '20px', marginTop: '60px', textAlign: 'center', color: '#999', fontSize: '0.9rem' }}>
                                <p>Thank you for choosing Seats Labs for your automotive needs.</p>
                                <p>This is a computer-generated document. No signature required.</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Feedback Modal */}
                {showFeedbackModal && (
                    <div style={modalOverlayStyle}>
                        <div style={modalContentStyle}>
                            <div style={modalHeaderStyle}>
                                <h2 style={{ margin: 0, fontSize: '1.4rem', color: 'var(--navy)', fontWeight: '800' }}>Submit Feedback</h2>
                                <button onClick={() => setShowFeedbackModal(false)} style={closeBtnStyle}><X size={20} /></button>
                            </div>
                            <form onSubmit={handleFeedbackSubmit}>
                                <div style={{ padding: '30px' }}>
                                    <div style={{ marginBottom: '25px', textAlign: 'center' }}>
                                        <div style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '15px', fontWeight: '600' }}>How was your experience?</div>
                                        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                                            {[1, 2, 3, 4, 5].map(star => (
                                                <Star 
                                                    key={star} 
                                                    size={32} 
                                                    fill={star <= feedbackData.rating ? '#f59e0b' : 'none'} 
                                                    color={star <= feedbackData.rating ? '#f59e0b' : '#cbd5e1'} 
                                                    style={{ cursor: 'pointer' }}
                                                    onClick={() => setFeedbackData({ ...feedbackData, rating: star })}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <label style={labelStyle}>Comment (Optional)</label>
                                        <textarea 
                                            style={{ ...inputStyle, height: '120px', resize: 'none' }} 
                                            value={feedbackData.comment} 
                                            onChange={e => setFeedbackData({ ...feedbackData, comment: e.target.value })} 
                                            placeholder="Tell us what you liked or how we can improve..." 
                                        />
                                    </div>
                                </div>
                                <div style={modalFooterStyle}>
                                    <button type="submit" style={{ width: '100%', padding: '14px', background: 'var(--navy)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '800', cursor: 'pointer' }}>
                                        Submit Feedback
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Complaint Modal */}
                {showComplaintModal && (
                    <div style={modalOverlayStyle}>
                        <div style={modalContentStyle}>
                            <div style={modalHeaderStyle}>
                                <h2 style={{ margin: 0, fontSize: '1.4rem', color: 'var(--navy)', fontWeight: '800' }}>File a Complaint</h2>
                                <button onClick={() => setShowComplaintModal(false)} style={closeBtnStyle}><X size={20} /></button>
                            </div>
                            <form onSubmit={handleComplaintSubmit}>
                                <div style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                    <div>
                                        <label style={labelStyle}>Complaint Title</label>
                                        <input 
                                            type="text" 
                                            style={inputStyle} 
                                            value={complaintData.title} 
                                            onChange={e => setComplaintData({ ...complaintData, title: e.target.value })} 
                                            placeholder="e.g., Still hearing noise, Overcharged, etc."
                                            required 
                                        />
                                    </div>
                                    <div>
                                        <label style={labelStyle}>Priority</label>
                                        <select 
                                            style={inputStyle} 
                                            value={complaintData.priority} 
                                            onChange={e => setComplaintData({ ...complaintData, priority: e.target.value })}
                                        >
                                            <option value="low">Low - Minor issue</option>
                                            <option value="medium">Medium - General concern</option>
                                            <option value="high">High - Urgent issue</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label style={labelStyle}>Description</label>
                                        <textarea 
                                            style={{ ...inputStyle, height: '120px', resize: 'none' }} 
                                            value={complaintData.description} 
                                            onChange={e => setComplaintData({ ...complaintData, description: e.target.value })} 
                                            placeholder="Provide as much detail as possible..." 
                                            required
                                        />
                                    </div>
                                </div>
                                <div style={modalFooterStyle}>
                                    <button type="submit" style={{ width: '100%', padding: '14px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '800', cursor: 'pointer' }}>
                                        Submit Complaint
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

            </div>
        </SidebarLayout>
    );
};

const DetailRow = ({ label, value, color, isMono }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
        <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</span>
        <span style={{ fontSize: '1rem', color: color || '#334155', fontWeight: '700', fontFamily: isMono ? 'monospace' : 'inherit' }}>{value}</span>
    </div>
);

const thStyle = { padding: '18px 20px', fontWeight: '700', color: '#64748b', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' };
const tdStyle = { padding: '20px', verticalAlign: 'middle' };
const footerBtnStyle = { padding: '10px 24px', borderRadius: '8px', border: 'none', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s' };
const labelStyle = { display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: '700', color: 'var(--navy)' };
const inputStyle = { width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '0.95rem', background: '#f8fafc' };

const modalOverlayStyle = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,10,30,0.5)', backdropFilter: 'blur(6px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px' };
const modalContentStyle = { background: 'white', borderRadius: '24px', width: '100%', maxWidth: '550px', maxHeight: '95vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.3)' };
const modalHeaderStyle = { padding: '25px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9' };
const modalFooterStyle = { padding: '20px 30px', borderTop: '1px solid #f1f5f9', background: '#f8fafc' };
const closeBtnStyle = { background: '#f1f5f9', border: 'none', padding: '8px', borderRadius: '50%', cursor: 'pointer', color: '#64748b' };

export default Dashboard;
