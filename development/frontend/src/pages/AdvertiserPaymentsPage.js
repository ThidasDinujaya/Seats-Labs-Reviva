import React, { useState, useEffect } from 'react';
import SidebarLayout from '../components/SidebarLayout';
import { paymentApi } from '../api/api';
import { Search, Eye } from 'lucide-react';

const AdvertiserPaymentsPage = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res = await paymentApi.getMyPayment();
      if (res.success) setPayments(res.data);
    } catch (err) {
      console.error(err);
      setError('Failed to load payment history. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filtered = payments.filter(p =>
    (p.invoiceNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.advertisementTitle || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.advertisementPlacementName || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <SidebarLayout role="advertiser">
      <div style={{ padding: '30px', maxWidth: '1200px', margin: '0 auto' }}>

        {}
        <div style={{ marginBottom: '30px' }}>
          <h1 style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--navy)', margin: 0 }}>
            Payment & Billing
          </h1>
          <p style={{ color: '#64748b', marginTop: '6px' }}>
            A complete history of all your advertisement payment.
          </p>
        </div>

        {}
        <div style={{ position: 'relative', marginBottom: '20px' }}>
          <Search style={{ position: 'absolute', left: '12px', top: '12px', color: '#94a3b8' }} size={18} />
          <input
            type="text"
            placeholder="Search by invoice, ad title, placement..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 12px 12px 38px',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              outline: 'none',
              fontSize: '0.9rem',
              boxSizing: 'border-box'
            }}
          />
        </div>

        <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflowX: 'auto' }}>
          <div style={{ minWidth: '1200px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', tableLayout: 'fixed' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e2e8f0', background: '#f8fafc' }}>
                  <th style={{ padding: '14px 15px', color: '#64748b', fontWeight: '700', fontSize: '0.85rem', width: '100px' }}>paymentId</th>
                  <th style={{ padding: '14px 15px', color: '#64748b', fontWeight: '700', fontSize: '0.85rem', width: '120px' }}>paymentAmount</th>
                  <th style={{ padding: '14px 15px', color: '#64748b', fontWeight: '700', fontSize: '0.85rem', width: '120px' }}>paymentMethod</th>
                  <th style={{ padding: '14px 15px', color: '#64748b', fontWeight: '700', fontSize: '0.85rem', width: '100px' }}>paymentStatus</th>
                  <th style={{ padding: '14px 15px', color: '#64748b', fontWeight: '700', fontSize: '0.85rem', width: '120px' }}>paymentDate</th>
                  <th style={{ padding: '14px 15px', color: '#64748b', fontWeight: '700', fontSize: '0.85rem', width: '120px' }}>invoiceId</th>
                  <th style={{ padding: '14px 15px', color: '#64748b', fontWeight: '700', fontSize: '0.85rem', width: '100px' }}>bookingId</th>
                  <th style={{ padding: '14px 15px', color: '#64748b', fontWeight: '700', fontSize: '0.85rem', width: '120px' }}>advertisementId</th>
                  <th style={{ padding: '14px 15px', color: '#64748b', fontWeight: '700', fontSize: '0.85rem', width: '150px', textAlign: 'right' }}>paymentCreatedAt</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="9" style={{ padding: '50px', textAlign: 'center', color: '#94a3b8' }}>Loading payment history...</td></tr>
                ) : error ? (
                  <tr><td colSpan="9" style={{ padding: '50px', textAlign: 'center', color: '#ef4444' }}>{error}</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan="9" style={{ padding: '50px', textAlign: 'center', color: '#94a3b8' }}>
                    {searchTerm ? 'No results found for your search.' : 'No payment records yet. Your transactions will appear here after paying for an ad.'}
                  </td></tr>
                ) : (
                  filtered.map(p => (
                    <tr
                      key={p.paymentId}
                      onClick={() => setSelectedPayment(selectedPayment?.paymentId === p.paymentId ? null : p)}
                      style={{
                        borderBottom: '1px solid #f1f5f9',
                        cursor: 'pointer',
                        background: selectedPayment?.paymentId === p.paymentId ? '#eff6ff' : 'white',
                        transition: 'background 0.15s'
                      }}
                    >
                      <td style={{ padding: '14px 15px', width: '100px', fontWeight: '700', color: '#1e293b' }}>{p.paymentId}</td>
                      <td style={{ padding: '14px 15px', width: '120px', fontWeight: '700' }}>Rs. {parseFloat(p.paymentAmount).toLocaleString()}</td>
                      <td style={{ padding: '14px 15px', width: '120px', color: '#475569' }}>{p.paymentMethod}</td>
                      <td style={{ padding: '14px 15px', width: '100px' }}>
                        <span style={{
                          padding: '4px 10px', borderRadius: '20px', fontSize: '0.73rem', fontWeight: '800',
                          background: p.paymentStatus === 'completed' ? '#ecfdf5' : '#fff1f2',
                          color: p.paymentStatus === 'completed' ? '#10b981' : '#e11d48'
                        }}>
                          {p.paymentStatus.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ padding: '14px 15px', width: '120px', color: '#475569', fontSize: '0.85rem' }}>{new Date(p.paymentDate).toLocaleDateString()}</td>
                      <td style={{ padding: '14px 15px', width: '120px' }}>{p.invoiceId || '-'}</td>
                      <td style={{ padding: '14px 15px', width: '100px' }}>{p.bookingId || '-'}</td>
                      <td style={{ padding: '14px 15px', width: '120px' }}>{p.advertisementId || '-'}</td>
                      <td style={{ padding: '14px 15px', width: '150px', textAlign: 'right', fontSize: '0.8rem', color: '#94a3b8' }}>{new Date(p.paymentCreatedAt).toLocaleString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {}
            <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '14px 16px', borderTop: '1px solid #e2e8f0', background: '#f8fafc' }}>
              <button
                disabled={!selectedPayment}
                onClick={() => { if (selectedPayment) setShowModal(true); }}
                style={{
                  padding: '9px 22px',
                  background: selectedPayment ? 'var(--yellow)' : '#f1f5f9',
                  color: selectedPayment ? 'black' : '#cbd5e1',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: selectedPayment ? 'pointer' : 'default',
                  fontWeight: '700',
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Eye size={16} /> View Payment
              </button>
            </div>
          </div>
        </div>

        {}
        {showModal && selectedPayment && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,10,30,0.5)', backdropFilter: 'blur(6px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px' }}>
            <div style={{ background: 'white', borderRadius: '24px', width: '100%', maxWidth: '550px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.3)', position: 'relative' }}>
              <button
                onClick={() => setShowModal(false)}
                style={{ position: 'absolute', top: '24px', right: '24px', background: '#f1f5f9', border: 'none', padding: '8px', borderRadius: '50%', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>

              <div style={{ padding: '32px' }}>
                <h2 style={{ color: 'var(--navy)', marginBottom: '24px', fontSize: '1.5rem', fontWeight: '800' }}>Payment Details</h2>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                  <DetailField label="Payment ID" value={`PAY-${selectedPayment.paymentId}`} />
                  <DetailField label="Status" value={
                    <span style={{
                      padding: '4px 10px', borderRadius: '20px', fontSize: '0.73rem', fontWeight: '800',
                      background: selectedPayment.paymentStatus === 'completed' ? '#ecfdf5' : '#fff1f2',
                      color: selectedPayment.paymentStatus === 'completed' ? '#10b981' : '#e11d48'
                    }}>
                      {selectedPayment.paymentStatus.toUpperCase()}
                    </span>
                  } />
                  <DetailField label="Amount" value={`Rs. ${parseFloat(selectedPayment.paymentAmount).toLocaleString()}`} />
                  <DetailField label="Method" value={selectedPayment.paymentMethod} />
                  <DetailField label="Date" value={new Date(selectedPayment.paymentDate).toLocaleDateString()} />
                  <DetailField label="Invoice" value={selectedPayment.invoiceId || '-'} />
                  <DetailField label="Booking No" value={selectedPayment.bookingId || '-'} colSpan={2} />
                  <DetailField label="Advertisement" value={selectedPayment.advertisementId ? `AD-${selectedPayment.advertisementId}` : '-'} colSpan={2} />
                </div>

                <button
                  onClick={() => setShowModal(false)}
                  style={{ width: '100%', padding: '14px', background: 'var(--navy)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '700', cursor: 'pointer' }}
                >
                  Close Details
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </SidebarLayout>
  );
};

const X = ({ size, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
  </svg>
);

const DetailField = ({ label, value, colSpan = 1 }) => (
  <div style={{
    gridColumn: `span ${colSpan}`,
    padding: '12px 16px',
    background: '#f8fafc',
    borderRadius: '10px',
    border: '1px solid #f1f5f9'
  }}>
    <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>{label}</div>
    <div style={{ fontWeight: '700', color: '#1e293b', fontSize: '0.95rem' }}>{value}</div>
  </div>
);

export default AdvertiserPaymentsPage;
