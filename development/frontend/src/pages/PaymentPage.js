import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CreditCard, Landmark, CheckCircle, ArrowRight, ShieldCheck, Upload, Info } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { paymentApi } from '../api/api';

const PaymentPage = () => {
  const { bookingId, adId } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [error, setError] = useState(null);

  // Form Details
  const [cardDetails, setCardDetails] = useState({ number: '', expiry: '', cvv: '', name: '' });
  const [bankDetails, setBankDetails] = useState({ reference: '', file: null });

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        setLoading(true);
        setError(null);
        let res;
        if (bookingId) {
          res = await paymentApi.getInvoice(bookingId);
        } else if (adId) {
          res = await paymentApi.getAdInvoice(adId);
        }
        
        if (res && res.data) {
          setInvoice(res.data);
        } else {
          setError("Invoice details not found.");
        }
      } catch (err) {
        console.error("Failed to fetch invoice:", err);
        setError(err.error || "Failed to load invoice. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchInvoice();
  }, [bookingId, adId]);

  const handlePayment = async () => {
    if (!invoice || isNaN(parseFloat(invoice.invoiceAmount))) {
        alert("Wait for invoice details to load.");
        return;
    }

    if (paymentMethod === 'card') {
        if (!cardDetails.number || !cardDetails.expiry || !cardDetails.cvv || !cardDetails.name) {
            alert("Please provide complete card details.");
            return;
        }
    } else {
        if (!bankDetails.reference) {
            alert("Please provide the bank transfer reference number.");
            return;
        }
    }

    setProcessing(true);
    try {
      await paymentApi.processPayment({
        invoiceId: invoice.invoiceId,
        paymentAmount: parseFloat(invoice.invoiceAmount),
        paymentMethod: paymentMethod === 'card' ? 'Credit Card' : 'Bank Transfer',
        paymentReference: paymentMethod === 'card' ? `CARD-XXXX-${cardDetails.number.slice(-4)}` : bankDetails.reference
      });
      
      setPaymentSuccess(true);
      setTimeout(() => {
        navigate(adId ? '/advertiser' : '/dashboard');
      }, 3000);
    } catch (err) {
      console.error("Payment failed:", err);
      alert(err.error || "Payment processing failed. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  const inputStyle = {
    width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', marginTop: '5px', outline: 'none'
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div className="loader">Verifying payment request...</div>
    </div>
  );

  if (error) return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
      <h2 style={{ color: 'var(--crimson)' }}>{error}</h2>
      <button 
        onClick={() => navigate('/dashboard')}
        style={{ marginTop: '20px', padding: '10px 20px', backgroundColor: 'var(--navy)', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
      >
        Back to Dashboard
      </button>
    </div>
  );

  if (paymentSuccess) return (
    <div style={{ minHeight: '100vh', background: 'var(--navy)', color: 'white', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', padding: '60px', borderRadius: '24px', textAlign: 'center', maxWidth: '500px' }}>
        <CheckCircle size={80} color="#10b981" style={{ marginBottom: '20px' }} />
        <h1 style={{ fontSize: '2.5rem', marginBottom: '10px' }}>Secure Payment Complete</h1>
        <p style={{ opacity: 0.8, fontSize: '1.2rem', marginBottom: '30px' }}>Your booking has been confirmed. Redirecting you to your dashboard...</p>
        <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)' }}>Transaction Reference: {invoice?.invoiceNumber}</div>
      </div>
    </div>
  );

  const amount = parseFloat(invoice?.invoiceAmount) || 0;

  return (
    <div className="payment-page" style={{ background: '#f8fafc', minHeight: '100vh', direction: 'ltr' }}>
      <Navbar />
      
      <div className="container" style={{ padding: '60px 20px', maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ marginBottom: '40px' }}>
          <h1 style={{ color: 'var(--navy)', fontSize: '2.5rem', fontWeight: '800' }}>Secure Checkout</h1>
          <p style={{ color: '#64748b' }}>
            {invoice?.bookingRefNumber 
              ? `Complete payment for Booking: ${invoice.bookingRefNumber}` 
              : `Complete payment for Advertisement: ${invoice?.advertisementTitle || 'Marketing Service'}`}
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '40px' }}>
          
          <div style={{ background: 'white', padding: '40px', borderRadius: '24px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)' }}>
            <h3 style={{ marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <ShieldCheck size={24} color="var(--navy)" /> Payment details
            </h3>

            {/* Method Toggles */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '30px' }}>
              <div 
                onClick={() => setPaymentMethod('card')}
                style={{ 
                  padding: '15px', borderRadius: '12px', border: `2px solid ${paymentMethod === 'card' ? 'var(--crimson)' : '#f1f5f9'}`,
                  cursor: 'pointer', textAlign: 'center', background: paymentMethod === 'card' ? '#fffafb' : 'white', transition: 'all 0.2s'
                }}
              >
                <CreditCard size={24} color={paymentMethod === 'card' ? 'var(--crimson)' : '#64748b'} />
                <div style={{ fontWeight: '700', marginTop: '5px' }}>Card Payment</div>
              </div>
              <div 
                onClick={() => setPaymentMethod('bank')}
                style={{ 
                  padding: '15px', borderRadius: '12px', border: `2px solid ${paymentMethod === 'bank' ? 'var(--crimson)' : '#f1f5f9'}`,
                  cursor: 'pointer', textAlign: 'center', background: paymentMethod === 'bank' ? '#fffafb' : 'white', transition: 'all 0.2s'
                }}
              >
                <Landmark size={24} color={paymentMethod === 'bank' ? 'var(--crimson)' : '#64748b'} />
                <div style={{ fontWeight: '700', marginTop: '5px' }}>Bank Transfer</div>
              </div>
            </div>

            {/* Dynamic Forms */}
            {paymentMethod === 'card' ? (
              <div style={{ display: 'grid', gap: '15px' }}>
                <div>
                  <label style={{ fontSize: '0.9rem', color: '#64748b' }}>Cardholder Name</label>
                  <input type="text" placeholder="John Doe" style={inputStyle} value={cardDetails.name} onChange={e => setCardDetails({...cardDetails, name: e.target.value})} />
                </div>
                <div>
                  <label style={{ fontSize: '0.9rem', color: '#64748b' }}>Card Number</label>
                  <input type="text" placeholder="0000 0000 0000 0000" style={inputStyle} value={cardDetails.number} onChange={e => setCardDetails({...cardDetails, number: e.target.value})} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div>
                    <label style={{ fontSize: '0.9rem', color: '#64748b' }}>Expiry (MM/YY)</label>
                    <input type="text" placeholder="12/26" style={inputStyle} value={cardDetails.expiry} onChange={e => setCardDetails({...cardDetails, expiry: e.target.value})} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.9rem', color: '#64748b' }}>CVV</label>
                    <input type="password" placeholder="***" style={inputStyle} value={cardDetails.cvv} onChange={e => setCardDetails({...cardDetails, cvv: e.target.value})} />
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '20px' }}>
                <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '16px', borderLeft: '4px solid var(--navy)' }}>
                  <h4 style={{ marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}><Info size={16} /> Workshop Bank Details</h4>
                  <div style={{ fontSize: '0.9rem', lineHeight: '1.6' }}>
                    <strong>Bank:</strong> Commercial Bank<br />
                    <strong>Account Name:</strong> SeatsLabs Reviva (Pvt) Ltd<br />
                    <strong>Account Number:</strong> 1000 5678 9012<br />
                    <strong>Branch:</strong> Colombo 07
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: '0.9rem', color: '#64748b' }}>Transaction Reference Number</label>
                  <input type="text" placeholder="Enter bank reference" style={inputStyle} value={bankDetails.reference} onChange={e => setBankDetails({...bankDetails, reference: e.target.value})} />
                </div>
                <div>
                  <label style={{ fontSize: '0.9rem', color: '#64748b' }}>Upload Transfer Slip</label>
                  <div style={{ border: '2px dashed #cbd5e1', borderRadius: '12px', padding: '30px', textAlign: 'center', cursor: 'pointer', marginTop: '5px' }}>
                    <input type="file" id="slip" hidden onChange={e => setBankDetails({...bankDetails, file: e.target.files[0]})} />
                    <label htmlFor="slip" style={{ cursor: 'pointer' }}>
                        <Upload size={32} color="#94a3b8" style={{ marginBottom: '10px' }} />
                        <div style={{ color: '#64748b' }}>{bankDetails.file ? bankDetails.file.name : 'Click to upload receipt image or PDF'}</div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            <button 
              onClick={handlePayment}
              disabled={processing}
              style={{ 
                width: '100%', marginTop: '40px', padding: '20px', borderRadius: '16px', background: 'var(--navy)', 
                color: 'white', border: 'none', fontWeight: '800', fontSize: '1.2rem', cursor: processing ? 'default' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', opacity: processing ? 0.7 : 1
              }}
            >
              {processing ? 'Processing Securely...' : `Complete Payment (Rs. ${amount.toLocaleString()})`} <ArrowRight size={20} />
            </button>
          </div>

          <div style={{ background: 'white', padding: '40px', borderRadius: '24px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)', height: 'fit-content' }}>
            <h3 style={{ marginBottom: '25px', borderBottom: '1px solid #f1f5f9', paddingBottom: '15px' }}>Payment Summary</h3>
            <div style={{ marginBottom: '15px', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748b' }}>Invoice Total</span>
              <span style={{ fontWeight: '600' }}>Rs. {amount.toLocaleString()}</span>
            </div>
            <div style={{ marginTop: '25px', borderTop: '2px dashed #f1f5f9', paddingTop: '25px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <div style={{ color: 'var(--navy)', fontWeight: '800', fontSize: '1.1rem' }}>Total Payable</div>
              <div style={{ color: 'var(--crimson)', fontWeight: '900', fontSize: '1.8rem' }}>
                Rs. {amount.toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PaymentPage;
