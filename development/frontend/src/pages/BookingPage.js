import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { serviceApi, bookingApi, timeSlotApi } from '../api/api';
import { formatTime } from '../utils/formatters';

const BookingPage = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [services, setServices] = useState([]);
    const [packages, setPackages] = useState([]);
    const [timeSlots, setTimeSlots] = useState([]);
    const [loading, setLoading] = useState(true);
    const [confirming, setConfirming] = useState(false);

    // Form State
    const [bookingData, setBookingData] = useState({
        serviceId: '',
        servicePackageId: '',
        bookingDate: '',
        timeSlotId: '',
        vehicleMake: '',
        vehicleModel: '',
        vehicleRegNumber: '',
        customerNotes: ''
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [servsRes, pkgsRes, slotsRes] = await Promise.all([
                    serviceApi.getAll(),
                    serviceApi.getPackages(),
                    timeSlotApi.getAll()
                ]);

                setServices((Array.isArray(servsRes) ? servsRes : servsRes.data || []).filter(s => s.serviceIsActive));
                setPackages((Array.isArray(pkgsRes) ? pkgsRes : pkgsRes.data || []).filter(p => p.servicePackageIsActive));
                setTimeSlots(Array.isArray(slotsRes) ? slotsRes : slotsRes.data || []);
            } catch (error) {
                console.error("Fetch error:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const updateData = (field, value) => {
        setBookingData(prev => ({ ...prev, [field]: value }));
    };

    const handleConfirmBooking = async () => {
        // Validation (simplified)
        if (!bookingData.bookingDate || !bookingData.timeSlotId || !bookingData.vehicleRegNumber) {
            alert("Please fill in all required details.");
            return;
        }

        const userStr = localStorage.getItem('user');
        if (!userStr) {
            navigate('/login');
            return;
        }
        const user = JSON.parse(userStr);

        setConfirming(true);
        try {
            const payload = {
                bookingDate: bookingData.bookingDate,
                bookingCustomerNotes: bookingData.customerNotes,
                customerId: user.customerId || 1, 
                vehicleId: 1, 
                serviceId: bookingData.serviceId || null,
                servicePackageId: bookingData.servicePackageId || null,
                timeSlotId: bookingData.timeSlotId
            };

            const response = await bookingApi.create(payload);
            
            if (response.success) {
                navigate(`/payment/${response.data.bookingId}`);
            }
        } catch (error) {
            console.error("Booking error:", error);
            alert("Failed to create booking. Please check availability.");
        } finally {
            setConfirming(false);
        }
    };

    const renderStepContent = () => {
        const selectedService = services.find(s => s.serviceId === Number(bookingData.serviceId));
        const selectedPackage = packages.find(p => p.servicePackageId === Number(bookingData.servicePackageId));
        const selectedSlot = timeSlots.find(s => s.timeSlotId === Number(bookingData.timeSlotId));

        switch(step) {
            case 1: // SERVICE SELECTION
                return (
                    <div>
                        <h2 className="step-title">1. Select Service or Package</h2>
                        <div className="booking-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                            <div className="booking-section">
                                <h4 style={{ marginBottom: '15px', color: 'var(--navy)' }}>Individual Services</h4>
                                {services.map(s => (
                                    <div 
                                        key={s.serviceId} 
                                        className={`selectable-item ${bookingData.serviceId === String(s.serviceId) ? 'active' : ''}`}
                                        onClick={() => {
                                            updateData('serviceId', String(s.serviceId));
                                            updateData('servicePackageId', '');
                                        }}
                                        style={itemStyle(bookingData.serviceId === String(s.serviceId))}
                                    >
                                        <span>{s.serviceName}</span>
                                        <strong>Rs. {Number(s.servicePrice).toLocaleString()}</strong>
                                    </div>
                                ))}
                            </div>
                            <div className="booking-section">
                                <h4 style={{ marginBottom: '15px', color: 'var(--crimson)' }}>Service Packages</h4>
                                {packages.map(p => (
                                    <div 
                                        key={p.servicePackageId} 
                                        className={`selectable-item package ${bookingData.servicePackageId === String(p.servicePackageId) ? 'active' : ''}`}
                                        onClick={() => {
                                            updateData('servicePackageId', String(p.servicePackageId));
                                            updateData('serviceId', '');
                                        }}
                                        style={itemStyle(bookingData.servicePackageId === String(p.servicePackageId))}
                                    >
                                        <span>{p.servicePackageName}</span>
                                        <strong>Rs. {Number(p.servicePackagePrice).toLocaleString()}</strong>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <button disabled={!bookingData.serviceId && !bookingData.servicePackageId} onClick={() => setStep(2)} className="btn btn-crimson" style={nextBtnStyle}>Proceed to Schedule</button>
                    </div>
                );

            case 2: // SCHEDULE
                return (
                    <div>
                        <h2 className="step-title">2. Choose Date & Time</h2>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>Appointment Date</label>
                                <input 
                                    type="date" 
                                    style={inputStyle}
                                    value={bookingData.bookingDate}
                                    min={new Date().toISOString().split('T')[0]}
                                    onChange={(e) => updateData('bookingDate', e.target.value)}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>Available Time Slots</label>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                                    {timeSlots.map(slot => (
                                        <div 
                                            key={slot.timeSlotId} 
                                            style={slotPillStyle(bookingData.timeSlotId === String(slot.timeSlotId))}
                                            onClick={() => updateData('timeSlotId', String(slot.timeSlotId))}
                                        >
                                            {formatTime(slot.timeSlotStartTime)}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '15px', marginTop: '30px' }}>
                            <button onClick={() => setStep(1)} className="btn btn-navy-outline">Back</button>
                            <button disabled={!bookingData.bookingDate || !bookingData.timeSlotId} onClick={() => setStep(3)} className="btn btn-crimson">Vehicle Details</button>
                        </div>
                    </div>
                );

            case 3: // VEHICLE
                return (
                    <div>
                        <h2 className="step-title">3. Vehicle Information</h2>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '5px' }}>Make (e.g., Toyota)</label>
                                <input type="text" style={inputStyle} value={bookingData.vehicleMake} onChange={(e) => updateData('vehicleMake', e.target.value)} />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '5px' }}>Model (e.g., Prius)</label>
                                <input type="text" style={inputStyle} value={bookingData.vehicleModel} onChange={(e) => updateData('vehicleModel', e.target.value)} />
                            </div>
                            <div style={{ gridColumn: 'span 2' }}>
                                <label style={{ display: 'block', marginBottom: '5px' }}>Registration Number</label>
                                <input type="text" style={inputStyle} placeholder="ABC-1234" value={bookingData.vehicleRegNumber} onChange={(e) => updateData('vehicleRegNumber', e.target.value)} />
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '15px', marginTop: '30px' }}>
                            <button onClick={() => setStep(2)} className="btn btn-navy-outline">Back</button>
                            <button disabled={!bookingData.vehicleMake || !bookingData.vehicleRegNumber} onClick={() => setStep(4)} className="btn btn-crimson">Final Confirmation</button>
                        </div>
                    </div>
                );

            case 4: // SUMMARY & CONFIRM
                return (
                    <div style={{ background: '#f8fafc', padding: '30px', borderRadius: '15px' }}>
                        <h2 className="step-title">4. Summary & Confirmation</h2>
                        <div style={summaryItemStyle}>
                            <span>Selected Service:</span>
                            <strong>{selectedService?.serviceName || selectedPackage?.servicePackageName}</strong>
                        </div>
                        <div style={summaryItemStyle}>
                            <span>Date & Time:</span>
                            <strong>{bookingData.bookingDate} at {formatTime(selectedSlot?.timeSlotStartTime)}</strong>
                        </div>
                        <div style={summaryItemStyle}>
                            <span>Vehicle:</span>
                            <strong>{bookingData.vehicleMake} {bookingData.vehicleModel} ({bookingData.vehicleRegNumber})</strong>
                        </div>
                        <div style={{ ...summaryItemStyle, borderTop: '2px solid #e2e8f0', marginTop: '20px', paddingTop: '20px' }}>
                            <span style={{ fontSize: '1.2rem' }}>Total Amount:</span>
                            <strong style={{ fontSize: '1.5rem', color: 'var(--crimson)' }}>
                                Rs. {Number(selectedService?.servicePrice || selectedPackage?.servicePackagePrice || 0).toLocaleString()}
                            </strong>
                        </div>
                        
                        <div style={{ display: 'flex', gap: '15px', marginTop: '30px' }}>
                            <button onClick={() => setStep(3)} className="btn btn-navy-outline">Edit Details</button>
                            <button 
                                onClick={handleConfirmBooking} 
                                disabled={confirming}
                                className="btn btn-crimson" 
                                style={{ flex: 2, fontSize: '1.1rem' }}
                            >
                                {confirming ? 'PROSECESSING...' : 'CONFIRM & PROCEED TO PAYMENT'}
                            </button>
                        </div>
                    </div>
                );
            default: return null;
        }
    };

    // Inline Styles
    const itemStyle = (isActive) => ({
        padding: '15px', border: isActive ? '2px solid var(--crimson)' : '1px solid #e2e8f0',
        borderRadius: '10px', marginBottom: '10px', cursor: 'pointer', display: 'flex', 
        justifyContent: 'space-between', background: isActive ? '#fffafb' : 'white', transition: 'all 0.2s'
    });

    const slotPillStyle = (isActive) => ({
        padding: '10px', textBy: 'center', border: '1px solid #e2e8f0', borderRadius: '8px', 
        cursor: 'pointer', textAlign: 'center', background: isActive ? 'var(--navy)' : 'white', 
        color: isActive ? 'white' : 'black'
    });

    const inputStyle = { width: '100%', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', outline: 'none' };
    const nextBtnStyle = { width: '100%', marginTop: '20px', padding: '15px', fontWeight: 'bold' };
    const summaryItemStyle = { display: 'flex', justifyContent: 'space-between', marginBottom: '15px' };

    if (loading) return <div style={{ height: '80vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>Loading booking engine...</div>;

    return (
        <div style={{ background: '#f8fafc', minHeight: '100vh' }}>
            <Navbar />
            
            <header style={{ background: 'var(--navy)', color: 'white', padding: '60px 0 100px', textAlign: 'center' }}>
                <div className="container">
                    <h1>Book a Service</h1>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '60px', marginTop: '40px' }}>
                        {[1, 2, 3, 4].map(s => (
                            <div key={s} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: step >= s ? 1 : 0.4 }}>
                                <div style={{ 
                                    width: '40px', height: '40px', borderRadius: '50%', border: '2px solid white', 
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', 
                                    marginBottom: '10px', background: step >= s ? 'var(--crimson)' : 'transparent'
                                }}>{s}</div>
                                <div style={{ fontSize: '0.9rem' }}>
                                    {s === 1 ? 'Service' : s === 2 ? 'Schedule' : s === 3 ? 'Vehicle' : 'Confirm'}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </header>

            <main className="container" style={{ padding: '0 20px 100px' }}>
                <div style={{ 
                    background: 'white', borderRadius: '20px', padding: '40px', marginTop: '-60px', 
                    boxShadow: '0 15px 35px -5px rgba(0,0,0,0.1)', maxWidth: '900px', margin: '-60px auto 0' 
                }}>
                    <div style={{ color: 'var(--navy)', marginBottom: '30px', borderBottom: '2px solid #f1f5f9', paddingBottom: '15px' }}>
                        {renderStepContent()}
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default BookingPage;
