import React, { useState, useEffect } from 'react';
import SidebarLayout from '../components/SidebarLayout';
import { Eye, RefreshCcw, CheckCircle2, Clock, X, AlertCircle } from 'lucide-react';
import { bookingApi } from '../api/api';
import { formatTime } from '../utils/formatters';

const TechnicianDashboard = () => {
  const [selectedId, setSelectedId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState(null); // 'view' or 'update'
  const [formData, setFormData] = useState({ bookingStatus: '', car: '', job: '', bookingStartTime: '', bookingId: '', regNumber: '', customer: '', bookingTechnicianNotes: '', bookingCustomerNotes: '' });
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchAssignedTasks();
  }, []);

  const fetchAssignedTasks = async () => {
    try {
      setLoading(true);
      // Get the logged-in technician's ID from localStorage
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const technicianId = user.technicianId; // Use the actual technicianId from profile
      
      // Fetch bookings assigned to this technician
      const res = await bookingApi.getAll({ technicianId });
      if (res.success) {
        // Transform booking data to match task structure
        const transformedTasks = res.data.map(booking => ({
          bookingId: booking.bookingId,
          car: `${booking.vehicleMake} ${booking.vehicleModel}`,
          regNumber: booking.vehicleRegNumber,
          customer: `${booking.customerFirstName} ${booking.customerLastName}`,
          job: booking.serviceName,
          bookingStatus: booking.bookingStatus,
          bookingStartTime: booking.bookingStartTime,
          bookingTechnicianNotes: booking.bookingTechnicianNotes || '',
          bookingCustomerNotes: booking.bookingCustomerNotes || '',
        }));
        setTasks(transformedTasks);
      }
    } catch (error) {
      console.error('Failed to fetch assigned tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = (action) => {
    if (!selectedId) return;
    const task = tasks.find(t => t.bookingId === selectedId);
    if (action === 'Update Task') {
      setFormData({ ...task });
      setModalMode('update');
      setShowModal(true);
    } else {
      setFormData({ ...task });
      setModalMode('view');
      setShowModal(true);
    }
  };

  const handleUpdateTask = async () => {
    try {
      if (!formData.bookingStatus) {
        alert('Please select a status.');
        return;
      }

      const task = tasks.find(t => t.bookingId === selectedId);
      if (!task) return;
      
      const res = await bookingApi.update(task.bookingId, {
        bookingStatus: formData.bookingStatus,
        bookingTechnicianNotes: formData.bookingTechnicianNotes
      });
      
      if (res.success) {
        fetchAssignedTasks(); // Refresh the task list
        setShowModal(false);
        alert('Task updated successfully!');
      }
    } catch (error) {
      alert('Failed to update task');
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

  return (
    <SidebarLayout role="technician">
      <div style={{ height: 'calc(100vh - 80px)', display: 'flex', flexDirection: 'column', marginTop: '-15px', padding: '15px' }}>
        
        {/* Header Section */}
        <div style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '1.875rem', fontWeight: '800', color: '#1e293b', marginBottom: '8px' }}>Workshop Task Pipeline</h1>
            <p style={{ color: '#64748b', fontSize: '1rem' }}>Manage your daily service tasks and workshop efficiency.</p>
          </div>
          <button 
            onClick={fetchAssignedTasks}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', color: '#64748b', cursor: 'pointer', fontWeight: '600', transition: 'all 0.2s' }}
          >
            <RefreshCcw size={18} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
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
          
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#1e293b', margin: 0 }}>Active Tasks</h3>
          </div>

          {/* Scrollable Table Wrapper */}
          <div style={{ 
            overflowY: 'auto', 
            flex: 1, 
            overflowX: 'auto', 
            border: '1px solid #f1f5f9', 
            borderRadius: '8px' 
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead style={{ position: 'sticky', top: 0, background: 'white', zIndex: 1, boxShadow: '0 2px 2px -1px rgba(0,0,0,0.05)' }}>
                <tr style={{ borderBottom: '2px solid #f1f5f9' }}>
                  <th style={{ padding: '15px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '1px' }}>bookingId</th>
                  <th style={{ padding: '15px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '1px' }}>vehicleModel</th>
                  <th style={{ padding: '15px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '1px' }}>serviceName</th>
                  <th style={{ padding: '15px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '1px' }}>bookingStartTime</th>
                  <th style={{ padding: '15px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '1px', textAlign: 'right' }}>bookingStatus</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>Loading assigned tasks...</td></tr>
                ) : tasks.length === 0 ? (
                  <tr><td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>No tasks assigned yet.</td></tr>
                ) : (
                  tasks.map((task) => (
                  <tr 
                    key={task.bookingId} 
                    onClick={() => setSelectedId(selectedId === task.bookingId ? null : task.bookingId)}
                    style={{ 
                      borderBottom: '1px solid #f1f5f9', 
                      transition: 'background 0.2s', 
                      cursor: 'pointer',
                      backgroundColor: selectedId === task.bookingId ? '#f1f5f9' : 'transparent'
                    }}
                  >
                    <td style={{ padding: '15px', fontWeight: '600' }}>#{task.bookingId}</td>
                    <td style={{ padding: '15px', fontWeight: '600', color: '#1e293b' }}>{task.car}</td>
                    <td style={{ padding: '15px', color: '#64748b', fontSize: '0.9rem' }}>{task.job}</td>
                    <td style={{ padding: '15px', color: '#1e293b', fontWeight: '600', fontSize: '0.9rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Clock size={14} style={{ color: 'var(--crimson)' }} /> {formatTime(task.bookingStartTime)}
                      </div>
                    </td>
                    <td style={{ padding: '15px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: getStatusDisplay(task.bookingStatus).color, fontWeight: '700', fontSize: '0.85rem' }}>
                        {getStatusDisplay(task.bookingStatus).icon}
                        {getStatusDisplay(task.bookingStatus).label}
                      </div>
                    </td>
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
              const selectedTask = tasks.find(t => t.bookingId === selectedId);
              const isActionable = selectedId && selectedTask?.bookingStatus !== 'rejected' && selectedTask?.bookingStatus !== 'cancelled';
              
              return (
                <>
                  <button 
                    onClick={() => handleAction('Update Task')}
                    disabled={!isActionable}
                    style={{ padding: '10px 24px', borderRadius: '8px', border: 'none', background: isActionable ? '#3b82f6' : '#f1f5f9', color: isActionable ? 'white' : '#94a3b8', cursor: isActionable ? 'pointer' : 'default', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}
                  >
                    <RefreshCcw size={18} /> Update Task
                  </button>
                  <button 
                    onClick={() => handleAction('View Task')}
                    disabled={!selectedId}
                    style={{ padding: '10px 24px', borderRadius: '8px', border: 'none', background: selectedId ? 'var(--yellow)' : '#f1f5f9', color: selectedId ? 'black' : '#94a3b8', cursor: selectedId ? 'pointer' : 'default', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}
                  >
                    <Eye size={18} /> View Task
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
                  {modalMode === 'view' ? 'Task Details' : 'Update Task Status'}
                </h2>
                <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={24} /></button>
              </div>
              
              <div style={{ padding: '25px' }}>
                {modalMode === 'view' ? (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'space-between', background: '#f8fafc', padding: '15px', borderRadius: '8px', marginBottom: '10px' }}>
                      <div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Booking ID</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#1e293b' }}>#{formData.bookingId}</div>
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
                
                <div style={{ marginTop: '25px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                  <button onClick={() => setShowModal(false)} style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #cbd5e1', background: 'white', cursor: 'pointer', fontWeight: '600' }}>
                    {modalMode === 'view' ? 'Close' : 'Cancel'}
                  </button>
                  {modalMode === 'update' && (
                    <button onClick={handleUpdateTask} style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#3b82f6', color: 'white', cursor: 'pointer', fontWeight: '600' }}>
                      Save Changes
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </SidebarLayout>
  );
};

export default TechnicianDashboard;
