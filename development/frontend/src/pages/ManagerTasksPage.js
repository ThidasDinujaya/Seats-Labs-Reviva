import React, { useState, useEffect } from 'react';
import { 
    Search, Eye, X, RefreshCcw,
    User, Wrench, Clock, CheckCircle
} from 'lucide-react';
import SidebarLayout from '../components/SidebarLayout';
import { trackingApi } from '../api/api';
import { formatTime } from '../utils/formatters';

const ManagerTasksPage = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [showModal, setShowModal] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        try {
            setLoading(true);
            const res = await trackingApi.getTasks();
            if (res.success) {
                // Transform backend data to match UI structure
                const transformed = res.data.map(t => ({
                    serviceTrackingId: t.bookingId, // Using bookingId as display ID
                    taskName: t.serviceName,
                    technicianFirstName: t.technicianFirstName,
                    technicianLastName: t.technicianLastName,
                    serviceTrackingStatus: t.bookingStatus,
                    serviceTrackingStartedAt: t.bookingStartTime,
                    serviceTrackingEstimatedEndAt: t.bookingEndTime,
                    priority: 'medium', // Default priority for now
                    lastUpdate: t.lastUpdate
                }));
                setTasks(transformed);
            }
        } catch (error) {
            console.error('Failed to fetch tasks:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusStyle = (status) => {
        switch(status) {
            case 'completed': return { bg: '#ecfdf5', text: '#10b981', icon: <CheckCircle size={16} /> };
            case 'in_progress':
            case 'active': return { bg: '#eff6ff', text: '#3b82f6', icon: <Clock size={16} /> };
            case 'accepted':
            case 'pending': return { bg: '#fef3c7', text: '#f59e0b', icon: <Clock size={16} /> };
            default: return { bg: '#f1f5f9', text: '#64748b', icon: <Clock size={16} /> };
        }
    };

    const filteredTasks = tasks.filter(t => 
        ((t.taskName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || 
         ((t.technicianFirstName || '') + ' ' + (t.technicianLastName || '')).toLowerCase().includes(searchTerm.toLowerCase())) &&
        (statusFilter === 'all' || t.serviceTrackingStatus === statusFilter)
    );

    return (
        <SidebarLayout role="manager">
            <div style={{ height: 'calc(100vh - 80px)', display: 'flex', flexDirection: 'column', marginTop: '-15px', padding: '15px' }}>
                <div style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1 style={{ fontSize: '1.875rem', fontWeight: '800', color: '#1e293b', marginBottom: '8px' }}>Technician Tasks</h1>
                        <p style={{ color: '#64748b', fontSize: '1rem' }}>Monitor real-time service progress and assignments</p>
                    </div>
                    <button 
                        onClick={fetchTasks}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', color: '#64748b', cursor: 'pointer', fontWeight: '600', transition: 'all 0.2s' }}
                    >
                        <RefreshCcw size={18} className={loading ? 'animate-spin' : ''} /> Refresh
                    </button>
                </div>

                <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', padding: '24px', flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    <div style={{ display: 'flex', gap: '15px', marginBottom: '25px' }}>
                        <div style={{ position: 'relative', flex: 1 }}>
                            <Search style={{ position: 'absolute', left: '12px', top: '12px', color: '#94a3b8' }} size={20} />
                            <input 
                                type="text" 
                                placeholder="Search by task or technician..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none' }} 
                            />
                        </div>
                        <select 
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            style={{ padding: '12px 15px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', outline: 'none' }}
                        >
                            <option value="all">All Statuses</option>
                            <option value="accepted">Accepted</option>
                            <option value="in_progress">In Progress</option>
                            <option value="completed">Completed</option>
                        </select>
                    </div>

                    <div style={{ overflowY: 'auto', flex: 1, overflowX: 'auto', border: '1px solid #f1f5f9', borderRadius: '8px' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid #f1f5f9', textAlign: 'left', position: 'sticky', top: 0, background: 'white', zIndex: 1 }}>
                                    <th style={{ padding: '15px', color: '#64748b' }}>serviceTrackingId</th>
                                    <th style={{ padding: '15px', color: '#64748b' }}>bookingId</th>
                                    <th style={{ padding: '15px', color: '#64748b' }}>technicianId</th>
                                    <th style={{ padding: '15px', color: '#64748b' }}>serviceTrackingCreatedAt</th>
                                    <th style={{ padding: '15px', textAlign: 'right', color: '#64748b' }}>serviceTrackingStatus</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>Loading assignments...</td></tr>
                                ) : filteredTasks.length === 0 ? (
                                    <tr><td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>No tasks found.</td></tr>
                                ) : (
                                    filteredTasks.map(t => (
                                        <tr 
                                            key={t.serviceTrackingId} 
                                            onClick={() => setSelectedTask(selectedTask?.serviceTrackingId === t.serviceTrackingId ? null : t)}
                                            style={{ 
                                                borderBottom: '1px solid #f1f5f9', 
                                                cursor: 'pointer',
                                                transition: 'background 0.2s',
                                                background: selectedTask?.serviceTrackingId === t.serviceTrackingId ? '#f1f5f9' : 'transparent'
                                            }}
                                        >
                                            <td style={{ padding: '15px', fontWeight: 'bold' }}>#{t.serviceTrackingId}</td>
                                            <td style={{ padding: '15px', fontWeight: '600' }}>{t.taskName}</td>
                                            <td style={{ padding: '15px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <User size={16} color="#64748b" />
                                                    {t.technicianFirstName} {t.technicianLastName}
                                                </div>
                                            </td>
                                            <td style={{ padding: '15px' }}>
                                                <div style={{ fontSize: '0.85rem' }}>{formatTime(t.serviceTrackingStartedAt)} - {formatTime(t.serviceTrackingEstimatedEndAt)}</div>
                                            </td>
                                            <td style={{ padding: '15px', textAlign: 'right' }}>
                                                <span style={{ 
                                                    padding: '6px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600',
                                                    background: getStatusStyle(t.serviceTrackingStatus).bg, color: getStatusStyle(t.serviceTrackingStatus).text,
                                                    display: 'inline-flex', alignItems: 'center', gap: '5px'
                                                }}>
                                                    {getStatusStyle(t.serviceTrackingStatus).icon}
                                                    {t.serviceTrackingStatus.toUpperCase()}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', padding: '20px 0 0 0', borderTop: '1px solid #f1f5f9', marginTop: '10px' }}>
                        <button 
                            onClick={() => {
                                if (selectedTask) setShowModal(true);
                            }} 
                            disabled={!selectedTask}
                            style={{ padding: '10px 24px', borderRadius: '8px', border: 'none', background: selectedTask ? 'var(--yellow)' : '#f1f5f9', color: selectedTask ? 'black' : '#94a3b8', cursor: selectedTask ? 'pointer' : 'default', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}
                        >
                            <Eye size={18} /> View Tracking Details
                        </button>
                    </div>
                </div>

                {showModal && (
                    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000 }}>
                        <div style={{ background: 'white', borderRadius: '16px', width: '500px', maxWidth: '95%', maxHeight: '90vh', overflowY: 'auto' }}>
                            <div style={{ padding: '20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: 'white', zIndex: 10 }}>
                                <h2 style={{ margin: 0, color: '#1e293b' }}>Task Progress</h2>
                                <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={24} /></button>
                            </div>
                            <div style={{ padding: '30px' }}>
                                <div style={{ marginBottom: '25px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                                        <Wrench size={24} color="var(--navy)" />
                                        <h3 style={{ margin: 0 }}>{selectedTask?.taskName}</h3>
                                    </div>
                                    <div style={{ color: '#64748b' }}>Assigned to: <strong>{selectedTask?.technicianFirstName} {selectedTask?.technicianLastName}</strong></div>
                                </div>
                                
                                <div style={{ marginBottom: '30px' }}>
                                    <h4 style={{ margin: '0 0 15px 0', fontSize: '1rem' }}>Timeline</h4>
                                    <div style={{ position: 'relative', paddingLeft: '30px' }}>
                                        <div style={{ position: 'absolute', left: '11px', top: '5px', bottom: '5px', width: '2px', background: '#e2e8f0' }}></div>
                                        
                                        <div style={{ position: 'relative', marginBottom: '20px' }}>
                                            <div style={{ position: 'absolute', left: '-24px', top: '4px', width: '10px', height: '10px', borderRadius: '50%', background: '#10b981' }}></div>
                                            <div style={{ fontWeight: '600' }}>Task Started</div>
                                            <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{formatTime(selectedTask?.serviceTrackingStartedAt)}</div>
                                        </div>
                                        
                                        <div style={{ relative: 'true' }}>
                                            <div style={{ position: 'absolute', left: '-24px', top: '4px', width: '10px', height: '10px', borderRadius: '50%', background: selectedTask?.serviceTrackingStatus === 'completed' ? '#10b981' : '#cbd5e1' }}></div>
                                            <div style={{ fontWeight: '600' }}>Estimated Completion</div>
                                            <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{formatTime(selectedTask?.serviceTrackingEstimatedEndAt)}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div style={{ padding: '20px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '10px', position: 'sticky', bottom: 0, background: 'white', zIndex: 10 }}>
                                <button style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid var(--navy)', background: 'white', color: 'var(--navy)', fontWeight: 'bold', cursor: 'pointer' }}>Reassign Technician</button>
                                <button onClick={() => setShowModal(false)} style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: 'var(--navy)', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>Close</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </SidebarLayout>
    );
};

export default ManagerTasksPage;
