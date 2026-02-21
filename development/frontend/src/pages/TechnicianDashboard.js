import React, { useState, useEffect } from 'react';
import SidebarLayout from '../components/SidebarLayout';
import { Eye, CheckCircle2, Clock, X, AlertCircle, Search } from 'lucide-react';
import { bookingApi } from '../api/api';
import { formatTime } from '../utils/formatters';

const TechnicianDashboard = () => {
  const [selectedId, setSelectedId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState(null); // 'view' or 'update'
  const [formData, setFormData] = useState({ bookingStatus: '', car: '', job: '', bookingStartTime: '', bookingId: '', regNumber: '', customer: '', bookingTechnicianNotes: '', bookingCustomerNotes: '' });
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  useEffect(() => {
    fetchAssignedBookings();
  }, []);

  const fetchAssignedBookings = async () => {
    try {
      setLoading(true);
      // Get the logged-in technician's ID from localStorage
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const technicianId = user.technicianId; // Use the actual technicianId from profile
      
      // Fetch bookings assigned to this technician
      const res = await bookingApi.getAll({ technicianId });
      if (res.success) {
        // Transform booking data for dashboard view
        const transformedBookings = res.data.map(booking => ({
          ...booking,
          car: `${booking.vehicleMake} ${booking.vehicleModel}`,
          regNumber: booking.vehicleRegNumber,
          customer: `${booking.customerFirstName} ${booking.customerLastName}`,
          job: booking.serviceName,
        }));
        setBookings(transformedBookings);
      }
    } catch (error) {
      console.error('Failed to fetch assigned bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = (action) => {
    if (!selectedId) return;
    const booking = bookings.find(b => b.bookingId === selectedId);
    if (action === 'Update Booking') {
      setFormData({ ...booking });
      setModalMode('update');
      setShowModal(true);
    } else {
      setFormData({ ...booking });
      setModalMode('view');
      setShowModal(true);
    }
  };

  const handleUpdateBooking = async () => {
    try {
      if (!formData.bookingStatus) {
        alert('Please select a status.');
        return;
      }

      const booking = bookings.find(b => b.bookingId === selectedId);
      if (!booking) return;
      
      const res = await bookingApi.update(booking.bookingId, {
        bookingStatus: formData.bookingStatus,
        bookingTechnicianNotes: formData.bookingTechnicianNotes
      });
      
      if (res.success) {
        fetchAssignedBookings(); // Refresh the booking list
        setShowModal(false);
        alert('Booking updated successfully!');
      }
    } catch (error) {
      alert('Failed to update booking');
    }
  };

  const getStatusDisplay = (status) => {
    switch (status) {
      case 'completed': return { label: 'Completed', color: '#10b981', icon: <CheckCircle2 size={16} /> };
      case 'in_progress': return { label: 'In Progress', color: '#3b82f6', icon: <Clock size={16} /> };
      case 'accepted': return { label: 'Accepted', color: '#0ea5e9', icon: <CheckCircle2 size={16} /> };
      case 'pending': return { label: 'Pending', color: '#f59e0b', icon: <AlertCircle size={16} /> };
      case 'rejected':
      case 'cancelled': return { label: status.charAt(0).toUpperCase() + status.slice(1), color: '#ef4444', icon: <X size={16} /> };
      default: return { label: status, color: '#94a3b8', icon: null };
    }
  };

  const q = searchTerm.toLowerCase();
  const filteredBookings = searchTerm
    ? bookings.filter(b =>
        String(b.bookingId || '').includes(q) ||
        (b.customer || '').toLowerCase().includes(q) ||
        (b.regNumber || '').toLowerCase().includes(q) ||
        (b.car || '').toLowerCase().includes(q) ||
        (b.job || '').toLowerCase().includes(q) ||
        (b.bookingStatus || '').toLowerCase().includes(q)
      )
    : bookings;

  return (
    <SidebarLayout role="technician">
      <div style={{ height: 'calc(100vh - 80px)', display: 'flex', flexDirection: 'column', marginTop: '-15px', padding: '15px' }}>
        
        {/* Header Section */}
        <div style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '1.875rem', fontWeight: '800', color: '#1e293b', marginBottom: '8px' }}>Workshop Booking Pipeline</h1>
            <p style={{ color: '#64748b', fontSize: '1rem' }}>Manage your daily service bookings and workshop efficiency.</p>
          </div>
        </div>

        {/* Main Card Container */}
        <div style={{ 
          background: 'white', 
          borderRadius: '16px', 
          border: '1px solid #e2e8f0', 
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', 
          padding: '24px', 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column', 
          overflow: 'hidden' 
        }}>
          
          <div style={{ marginBottom: '16px' }}>
            <div style={{ position: 'relative', width: '100%' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
              <input
                type="text"
                placeholder="Search by ID, customer, car, job, status..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 36px',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  outline: 'none',
                  fontSize: '0.88rem',
                  background: '#f8fafc',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
              />
            </div>
          </div>

          {/* Scrollable Table Wrapper */}
          <div style={{ 
            overflowY: 'auto', 
            flex: 1, 
            overflowX: 'auto', 
            border: '1px solid #f1f5f9', 
            borderRadius: '8px' 
          }}>
            <table style={{ width: '100%', minWidth: '800px', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead style={{ position: 'sticky', top: 0, background: 'white', zIndex: 1, boxShadow: '0 2px 2px -1px rgba(0,0,0,0.05)' }}>
                <tr style={{ borderBottom: '2px solid #f1f5f9' }}>
                  <th style={{ padding: '15px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '1px' }}>bookingId</th>
                  <th style={{ padding: '15px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '1px' }}>bookingDate</th>
                  <th style={{ padding: '15px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '1px' }}>bookingStartTime</th>
                  <th style={{ padding: '15px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '1px' }}>bookingEndTime</th>
                  <th style={{ padding: '15px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '1px' }}>customerId</th>
                  <th style={{ padding: '15px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '1px' }}>vehicleId</th>
                  <th style={{ padding: '15px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '1px' }}>serviceId</th>
                  <th style={{ padding: '15px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '1px' }}>servicePackageId</th>
                  <th style={{ padding: '15px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '1px' }}>bookingStatus</th>
                  <th style={{ padding: '15px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '1px', textAlign: 'right' }}>bookingCreatedAt</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="10" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>Loading assigned bookings...</td></tr>
                ) : bookings.length === 0 ? (
                  <tr><td colSpan="10" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>No bookings assigned yet.</td></tr>
                ) : filteredBookings.length === 0 ? (
                  <tr><td colSpan="10" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>No bookings match your search.</td></tr>
                ) : (
                  filteredBookings.map((booking) => (
                  <tr 
                    key={booking.bookingId} 
                    onClick={() => setSelectedId(selectedId === booking.bookingId ? null : booking.bookingId)}
                    style={{ 
                      borderBottom: '1px solid #f1f5f9', 
                      transition: 'background 0.2s', 
                      cursor: 'pointer',
                      backgroundColor: selectedId === booking.bookingId ? '#f1f5f9' : 'transparent'
                    }}
                  >
                    <td style={{ padding: '15px', fontWeight: '600' }}>{booking.bookingId}</td>
                    <td style={{ padding: '15px' }}>{new Date(booking.bookingDate).toLocaleDateString()}</td>
                    <td style={{ padding: '15px', color: '#1e293b', fontWeight: '600' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Clock size={14} style={{ color: 'var(--crimson)' }} /> {formatTime(booking.bookingStartTime)}
                      </div>
                    </td>
                    <td style={{ padding: '15px', color: '#1e293b', fontWeight: '600' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Clock size={14} style={{ color: 'var(--crimson)' }} /> {formatTime(booking.bookingEndTime)}
                      </div>
                    </td>
                    <td style={{ padding: '15px' }}>{booking.customerId}</td>
                    <td style={{ padding: '15px' }}>{booking.vehicleId}</td>
                    <td style={{ padding: '15px' }}>{booking.serviceId || '-'}</td>
                    <td style={{ padding: '15px' }}>{booking.servicePackageId || '-'}</td>
                    <td style={{ padding: '15px' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: getStatusDisplay(booking.bookingStatus).color, fontWeight: '700', fontSize: '0.85rem' }}>
                        {getStatusDisplay(booking.bookingStatus).icon}
                        {getStatusDisplay(booking.bookingStatus).label}
                      </div>
                    </td>
                    <td style={{ padding: '15px', textAlign: 'right' }}>{new Date(booking.bookingCreatedAt).toLocaleString()}</td>
                  </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Action Footer */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'flex-end', 
            gap: '12px', 
            padding: '20px 0 0 0', 
            borderTop: '1px solid #f1f5f9', 
            marginTop: '10px' 
          }}>
            {(() => {
              
              return (
                <>
                  <button 
                    onClick={() => handleAction('View Booking')}
                    disabled={!selectedId}
                    style={{ padding: '10px 24px', borderRadius: '8px', border: 'none', background: selectedId ? 'var(--yellow)' : '#f1f5f9', color: selectedId ? 'black' : '#94a3b8', cursor: selectedId ? 'pointer' : 'default', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}
                  >
                    <Eye size={18} /> View Booking
                  </button>
                </>
              );
            })()}
          </div>
        </div>

        {/* Modal - Switching between View and Update */}
        {showModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000 }}>
            <div style={{ background: 'white', borderRadius: '16px', width: modalMode === 'view' ? '600px' : '400px', maxWidth: '90%' }}>
              <div style={{ padding: '20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ margin: 0, color: '#1e293b', fontSize: '1.25rem' }}>
                  {modalMode === 'view' ? 'Booking Details' : 'Update Booking Status'}
                </h2>
                <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={24} /></button>
              </div>
              
              <div style={{ padding: '25px' }}>
                {modalMode === 'view' ? (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'space-between', background: '#f8fafc', padding: '15px', borderRadius: '8px', marginBottom: '10px' }}>
                      <div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Booking ID</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#1e293b' }}>{formData.bookingId}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Current Status</div>
                        <div style={{ color: getStatusDisplay(formData.bookingStatus).color, fontWeight: '800' }}>{getStatusDisplay(formData.bookingStatus).label}</div>
                      </div>
                    </div>
                    
                    <div>
                      <label style={{ display: 'block', marginBottom: '5px', fontWeight: '700', color: '#64748b', fontSize: '0.85rem' }}>Customer</label>
                      <div style={{ padding: '10px', background: '#f1f5f9', borderRadius: '6px', fontWeight: '600' }}>{formData.customer}</div>
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '5px', fontWeight: '700', color: '#64748b', fontSize: '0.85rem' }}>Registration No.</label>
                      <div style={{ padding: '10px', background: '#f1f5f9', borderRadius: '6px', fontWeight: '600' }}>{formData.regNumber}</div>
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '5px', fontWeight: '700', color: '#64748b', fontSize: '0.85rem' }}>Car Model</label>
                      <div style={{ padding: '10px', background: '#f1f5f9', borderRadius: '6px', fontWeight: '600' }}>{formData.car}</div>
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '5px', fontWeight: '700', color: '#64748b', fontSize: '0.85rem' }}>Scheduled Time</label>
                      <div style={{ padding: '10px', background: '#f1f5f9', borderRadius: '6px', fontWeight: '600' }}>{formatTime(formData.bookingStartTime)}</div>
                    </div>
                    <div style={{ gridColumn: 'span 2' }}>
                      <label style={{ display: 'block', marginBottom: '5px', fontWeight: '700', color: '#64748b', fontSize: '0.85rem' }}>Customer Instructions</label>
                      <div style={{ padding: '10px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', color: '#1e293b', minHeight: '50px' }}>{formData.bookingCustomerNotes}</div>
                    </div>
                    <div style={{ gridColumn: 'span 2' }}>
                      <label style={{ display: 'block', marginBottom: '5px', fontWeight: '700', color: '#64748b', fontSize: '0.85rem' }}>Workshop Progress Notes</label>
                      <div style={{ padding: '10px', background: '#fffbeb', border: '1px solid #fef3c7', borderRadius: '6px', color: '#92400e', minHeight: '60px' }}>{formData.bookingTechnicianNotes}</div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div style={{ marginBottom: '20px' }}>
                      <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold', color: '#64748b' }}>Select New Status</label>
                      <select 
                        value={formData.bookingStatus} 
                        onChange={(e) => setFormData({ ...formData, bookingStatus: e.target.value })} 
                        style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }}
                      >
                        <option value="accepted">Accepted (Waiting)</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold', color: '#64748b' }}>Workshop Notes (Editable by Technician)</label>
                      <textarea 
                        value={formData.bookingTechnicianNotes} 
                        onChange={(e) => setFormData({ ...formData, bookingTechnicianNotes: e.target.value })} 
                        placeholder="Add job progress notes or technical details..."
                        style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', minHeight: '100px', resize: 'vertical' }}
                      />
                    </div>
                  </div>
                )}
                
                  {modalMode === 'view' && (
                    <>
                      <button 
                        onClick={() => setModalMode('update')}
                        style={{ padding: '10px 24px', borderRadius: '8px', border: 'none', background: '#3b82f6', color: 'white', cursor: 'pointer', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}
                      >
                        <Clock size={18} /> Update Booking
                      </button>
                    </>
                  )}
                  {modalMode === 'update' && (
                    <>
                      <button onClick={() => setShowModal(false)} style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #cbd5e1', background: 'white', cursor: 'pointer', fontWeight: '600' }}>
                        Cancel
                      </button>
                      <button onClick={handleUpdateBooking} style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#3b82f6', color: 'white', cursor: 'pointer', fontWeight: '600' }}>
                        Save Changes
                      </button>
                    </>
                  )}
              </div>
            </div>
          </div>
        )}
      </div>
    </SidebarLayout>
  );
};

export default TechnicianDashboard;
