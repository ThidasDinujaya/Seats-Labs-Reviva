// ============================================================
// pages/AdvertiserPaymentsPage.js
// PURPOSE: Display billing/payment history for the logged-in advertiser.
// ============================================================

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

        {/* Header */}
        <div style={{ marginBottom: '30px' }}>
          <h1 style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--navy)', margin: 0 }}>
            Payment & Billing
          </h1>
          <p style={{ color: '#64748b', marginTop: '6px' }}>
            A complete history of all your advertisement payment.
          </p>
        </div>

        {/* Search */}
        <div style={{ position: 'relative', marginBottom: '20px', maxWidth: '400px' }}>
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
              fontSize: '0.9rem'
            }}
          />
        </div>

        {/* Payments Table — fixed header, scrollable body, action footer */}
        <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>

          {/* Fixed Header */}
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', tableLayout: 'fixed' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                <th style={{ padding: '14px 15px', color: '#64748b', fontWeight: '700', fontSize: '0.85rem', width: '150px' }}>Invoice #</th>
                <th style={{ padding: '14px 15px', color: '#64748b', fontWeight: '700', fontSize: '0.85rem' }}>Ad / Plan</th>
                <th style={{ padding: '14px 15px', color: '#64748b', fontWeight: '700', fontSize: '0.85rem', width: '140px' }}>Amount</th>
                <th style={{ padding: '14px 15px', color: '#64748b', fontWeight: '700', fontSize: '0.85rem', width: '130px' }}>Method</th>
                <th style={{ padding: '14px 15px', color: '#64748b', fontWeight: '700', fontSize: '0.85rem', width: '140px' }}>Date</th>
                <th style={{ padding: '14px 15px', color: '#64748b', fontWeight: '700', fontSize: '0.85rem', width: '110px' }}>Status</th>
              </tr>
            </thead>
          </table>

          {/* Scrollable Body */}
          <div style={{ overflowY: 'auto', maxHeight: '420px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', tableLayout: 'fixed' }}>
              <tbody>
                {loading ? (
                  <tr><td colSpan="6" style={{ padding: '50px', textAlign: 'center', color: '#94a3b8' }}>Loading payment history...</td></tr>
                ) : error ? (
                  <tr><td colSpan="6" style={{ padding: '50px', textAlign: 'center', color: '#ef4444' }}>{error}</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan="6" style={{ padding: '50px', textAlign: 'center', color: '#94a3b8' }}>
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
                      <td style={{ padding: '14px 15px', fontWeight: '700', color: 'var(--navy)', width: '150px' }}>
                        {p.invoiceNumber || `INV-${p.paymentId}`}
                      </td>
                      <td style={{ padding: '14px 15px' }}>
                        <div style={{ fontWeight: '600', color: '#1e293b', fontSize: '0.9rem' }}>{p.advertisementTitle || '—'}</div>
                        <div style={{ fontSize: '0.73rem', color: '#94a3b8', marginTop: '2px' }}>
                          {p.advertisementPlacementName || 'General Placement'}
                        </div>
                      </td>
                      <td style={{ padding: '14px 15px', fontWeight: '700', color: '#1e293b', width: '140px' }}>
                        Rs. {parseFloat(p.paymentAmount).toLocaleString()}
                      </td>
                      <td style={{ padding: '14px 15px', color: '#64748b', textTransform: 'capitalize', width: '130px' }}>
                        {p.paymentMethod}
                      </td>
                      <td style={{ padding: '14px 15px', color: '#64748b', fontSize: '0.85rem', width: '140px' }}>
                        {new Date(p.paymentCreatedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </td>
                      <td style={{ padding: '14px 15px', width: '110px' }}>
                        <span style={{
                          padding: '4px 10px', borderRadius: '20px', fontSize: '0.73rem', fontWeight: '800',
                          background: p.paymentStatus === 'completed' ? '#ecfdf5' : '#fff7ed',
                          color: p.paymentStatus === 'completed' ? '#10b981' : '#f59e0b',
                          textTransform: 'uppercase'
                        }}>
                          {p.paymentStatus}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Bottom-right View button */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '14px 16px', borderTop: '1px solid #e2e8f0', background: '#f8fafc' }}>
            <button
              disabled={!selectedPayment}
              onClick={() => {
                if (selectedPayment) {
                  alert(
                    `Invoice: ${selectedPayment.invoiceNumber || `INV-${selectedPayment.paymentId}`}\n` +
                    `Ad: ${selectedPayment.advertisementTitle || '—'}\n` +
                    `Placement: ${selectedPayment.advertisementPlacementName || 'General Placement'}\n` +
                    `Amount: Rs. ${parseFloat(selectedPayment.paymentAmount).toLocaleString()}\n` +
                    `Method: ${selectedPayment.paymentMethod}\n` +
                    `Status: ${selectedPayment.paymentStatus}`
                  );
                }
              }}
              style={{
                padding: '9px 22px',
                background: selectedPayment ? '#e0f2fe' : '#f1f5f9',
                color: selectedPayment ? '#0369a1' : '#cbd5e1',
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
              <Eye size={16} /> View
            </button>
          </div>

        </div>

      </div>
    </SidebarLayout>
  );
};

export default AdvertiserPaymentsPage;
