import React, { useState, useEffect } from 'react';
import SidebarLayout from '../components/SidebarLayout';
import { userApi } from '../api/api';
import { Edit2, Trash2, Plus, X, Search, Eye } from 'lucide-react';

const ManagerUsersPage = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Modal states
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
    const [currentUser, setCurrentUser] = useState(null);
    const [selectedId, setSelectedId] = useState(null);
    const [viewOnly, setViewOnly] = useState(false);
    const [filterRole, setFilterRole] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [sortOrder, setSortOrder] = useState('desc'); // default to newest first
    
    // Form state
    const [formData, setFormData] = useState({
        customerFirstName: '',
        customerLastName: '',
        userEmail: '',
        userPassword: '',
        userRole: 'customer',
        customerPhone: '',
        customerAddress: '',
        advertiserBusinessName: '',
        advertiserContactPerson: '',
        advertiserPhone: '',
        advertiserAddress: '',
        technicianFirstName: '',
        technicianLastName: '',
        technicianPhone: '',
        technicianSpecialization: '',
        managerFirstName: '',
        managerLastName: '',
        managerPhone: '',
        userIsActive: true
    });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await userApi.getAll();
            if (res.success) {
                setUsers(res.data);
            } else {
                setError('Failed to fetch users');
            }
        } catch (err) {
            console.error(err);
            setError('Error loading users');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const openAddModal = () => {
        setModalMode('add');
        setFormData({
            customerFirstName: '',
            customerLastName: '',
            userEmail: '',
            userPassword: '',
            userRole: 'customer',
            customerPhone: '',
            customerAddress: '',
            advertiserBusinessName: '',
            advertiserContactPerson: '',
            advertiserPhone: '',
            advertiserAddress: '',
            technicianFirstName: '',
            technicianLastName: '',
            technicianPhone: '',
            technicianSpecialization: '',
            managerFirstName: '',
            managerLastName: '',
            managerPhone: '',
            userIsActive: true
        });
        setShowModal(true);
    };

    const openViewModal = (user) => {
        setModalMode('view');
        setViewOnly(true);
        const target = user || users.find(u => u.userId === selectedId);
        if (target) {
            setCurrentUser(target);
            setFormData({
                ...formData,
                ...target,
                userPassword: ''
            });
            setShowModal(true);
        }
    };

    const openEditModal = (user) => {
        setModalMode('edit');
        setViewOnly(false);
        const target = user || users.find(u => u.userId === selectedId);
        if (target) {
            setCurrentUser(target);
            setFormData({
                ...formData,
                ...target,
                userPassword: ''
            });
            setShowModal(true);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (modalMode === 'add') {
                const res = await userApi.create(formData);
                if (res.success) {
                    fetchUsers();
                    setShowModal(false);
                } else {
                    alert(res.error || 'Failed to create user');
                }
            } else {
                // Update
                const updateData = { ...formData };
                delete updateData.userEmail; // Cannot update email
                delete updateData.userPassword; 
                
                const res = await userApi.update(currentUser.userId, updateData);
                if (res.success) {
                    fetchUsers();
                    setShowModal(false);
                } else {
                    alert(res.error || 'Failed to update user');
                }
            }
        } catch (err) {
            console.error(err);
            alert('Operation failed');
        }
    };

    const handleDelete = async (id) => {
        const targetId = id || selectedId;
        if (!targetId) return;
        if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            try {
                const res = await userApi.delete(targetId);
                if (res.success) {
                    fetchUsers();
                    if (selectedId === targetId) setSelectedId(null);
                } else {
                    alert(res.error || 'Failed to delete user');
                }
            } catch (err) {
                console.error(err);
                alert('Delete failed');
            }
        }
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch = 
            (user.customerFirstName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
             user.technicianFirstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
             user.managerFirstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
             user.advertiserBusinessName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
             user.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
             user.userRole?.toLowerCase().includes(searchTerm.toLowerCase()));
            
        const matchesRole = filterRole ? user.userRole === filterRole : true;
        const matchesStatus = filterStatus ? (
            filterStatus === 'active' ? user.userIsActive === true : user.userIsActive === false
        ) : true;
        
        return matchesSearch && matchesRole && matchesStatus;
    }).sort((a, b) => {
        if (sortOrder === 'asc') return a.userId - b.userId;
        return b.userId - a.userId;
    });

    return (
        <SidebarLayout role="manager">
            <div style={{ height: 'calc(100vh - 140px)', display: 'flex', flexDirection: 'column' }}>
                {error && (
                    <div style={{ padding: '15px', background: '#fee2e2', color: '#b91c1c', borderRadius: '8px', marginBottom: '15px' }}>
                        {error}
                    </div>
                )}
                <div style={{ marginBottom: '15px' }}>
                    <h1 style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--navy)', margin: 0 }}>User Management</h1>
                    <p style={{ color: '#666', margin: 0 }}>Manage system users, roles, and permissions.</p>
                </div>

            {/* Search and Filters */}
            <div style={{ marginBottom: '20px', display: 'flex', gap: '15px' }}>
                <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
                    <Search size={20} style={{ position: 'absolute', left: '12px', top: '12px', color: '#94a3b8' }} />
                    <input 
                        type="text" 
                        placeholder="Search user..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ 
                            width: '100%', padding: '12px 12px 12px 40px', 
                            borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none' 
                        }}
                    />
                </div>
                
                <div style={{ minWidth: '160px' }}>
                    <select 
                        value={filterRole} 
                        onChange={(e) => setFilterRole(e.target.value)}
                        style={inputStyle}
                    >
                        <option value="">All Roles</option>
                        <option value="manager">Manager</option>
                        <option value="technician">Technician</option>
                        <option value="advertiser">Advertiser</option>
                        <option value="customer">Customer</option>
                    </select>
                </div>

                <div style={{ minWidth: '160px' }}>
                    <select 
                        value={filterStatus} 
                        onChange={(e) => setFilterStatus(e.target.value)}
                        style={inputStyle}
                    >
                        <option value="">All Statuses</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>
                </div>

                <div style={{ minWidth: '180px' }}>
                    <select 
                        value={sortOrder} 
                        onChange={(e) => setSortOrder(e.target.value)}
                        style={{ ...inputStyle, background: '#f1f5f9' }}
                    >
                        <option value="desc">Sort: Newest (ID desc)</option>
                        <option value="asc">Sort: Oldest (ID asc)</option>
                    </select>
                    </div>
                </div>


                {/* Users Table */}
            <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflowY: 'auto', flex: 1 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 1 }}>
                        <tr>
                            <th style={headerStyle}>userId</th>
                            <th style={headerStyle}>customerFirstName</th>
                            <th style={headerStyle}>userEmail</th>
                            <th style={headerStyle}>userRole</th>
                            <th style={headerStyle}>customerPhone</th>
                            <th style={{ ...headerStyle, textAlign: 'right' }}>userIsActive</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="7" style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>Loading user...</td></tr>
                        ) : filteredUsers.length > 0 ? (
                            filteredUsers.map(user => (
                                <tr 
                                    key={user.userId} 
                                    style={{ 
                                        borderBottom: '1px solid #f1f5f9', 
                                        background: selectedId === user.userId ? '#f1f5f9' : 'transparent',
                                        cursor: 'pointer'
                                    }}
                                    onClick={() => setSelectedId(selectedId === user.userId ? null : user.userId)}
                                >
                                    <td style={cellStyle}>{user.userId}</td>
                                    <td style={cellStyle}>
                                        {user.userRole === 'customer' && `${user.customerFirstName} ${user.customerLastName}`}
                                        {user.userRole === 'technician' && `${user.technicianFirstName} ${user.technicianLastName}`}
                                        {user.userRole === 'manager' && `${user.managerFirstName} ${user.managerLastName}`}
                                        {user.userRole === 'advertiser' && user.advertiserBusinessName}
                                    </td>
                                    <td style={cellStyle}>{user.userEmail}</td>
                                    <td style={cellStyle}>
                                        <span style={{ 
                                            padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase',
                                            background: getRoleColor(user.userRole).bg, color: getRoleColor(user.userRole).text
                                        }}>
                                            {user.userRole}
                                        </span>
                                    </td>
                                    <td style={cellStyle}>
                                        {user.customerPhone || user.technicianPhone || user.managerPhone || user.advertiserPhone || '-'}
                                    </td>
                                    <td style={{ ...cellStyle, textAlign: 'right' }}>
                                        <span style={{ 
                                            display: 'inline-flex', alignItems: 'center', gap: '5px',
                                            color: user.userIsActive ? '#10b981' : '#ef4444', fontWeight: '600', fontSize: '0.9rem' 
                                        }}>
                                            {user.userIsActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="7" style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>No user found.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', padding: '20px 0', borderTop: '1px solid #f1f5f9', marginTop: '10px' }}>
                <button onClick={openAddModal} style={{ padding: '10px 24px', borderRadius: '8px', border: 'none', background: 'var(--navy)', color: 'white', cursor: 'pointer', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Plus size={18} /> Add User
                </button>
                <button 
                    onClick={() => openEditModal()} 
                    disabled={!selectedId}
                    style={{ padding: '10px 24px', borderRadius: '8px', border: 'none', background: selectedId ? '#3b82f6' : '#f1f5f9', color: selectedId ? 'white' : '#94a3b8', cursor: selectedId ? 'pointer' : 'default', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                    <Edit2 size={18} /> Update User
                </button>
                <button 
                    onClick={() => openViewModal()} 
                    disabled={!selectedId}
                    style={{ padding: '10px 24px', borderRadius: '8px', border: 'none', background: selectedId ? 'var(--yellow)' : '#f1f5f9', color: selectedId ? 'black' : '#94a3b8', cursor: selectedId ? 'pointer' : 'default', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                    <Eye size={18} /> View User
                </button>
                <button 
                    onClick={() => handleDelete()} 
                    disabled={!selectedId}
                    style={{ padding: '10px 24px', borderRadius: '8px', border: 'none', background: selectedId ? '#ef4444' : '#f1f5f9', color: selectedId ? 'white' : '#94a3b8', cursor: selectedId ? 'pointer' : 'default', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                    <Trash2 size={18} /> Delete User
                </button>
            </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div style={{ 
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
                    background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000 
                }}>
                    <div style={{ background: 'white', borderRadius: '12px', width: '600px', maxWidth: '90%', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div style={{ 
                            padding: '20px', 
                            borderBottom: '1px solid #e2e8f0', 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center',
                            position: 'sticky',
                            top: 0,
                            backgroundColor: 'white',
                            zIndex: 10
                        }}>
                            <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#1e293b' }}>
                                {modalMode === 'add' ? 'Add New User' : modalMode === 'view' ? 'View User' : 'Edit User'}
                            </h2>
                            <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
                        </div>
                        
                        <form onSubmit={handleSubmit} style={{ padding: '20px' }}>
                            {/* Common Fields */}
                            <div style={formRowStyle}>
                                <div style={inputGroupStyle}>
                                    <label style={labelStyle}>Role</label>
                                    <select 
                                        name="userRole" 
                                        value={formData.userRole} 
                                        onChange={handleInputChange} 
                                        disabled={modalMode === 'edit' || viewOnly} 
                                        style={inputStyle}
                                    >
                                        <option value="customer">Customer</option>
                                        <option value="technician">Technician</option>
                                        <option value="advertiser">Advertiser</option>
                                        <option value="manager">Manager</option>
                                    </select>
                                </div>
                                <div style={inputGroupStyle}>
                                    <label style={labelStyle}>userEmail</label>
                                    <input 
                                        type="email" 
                                        name="userEmail" 
                                        value={formData.userEmail} 
                                        onChange={handleInputChange} 
                                        disabled={modalMode === 'edit' || viewOnly} 
                                        required 
                                        style={inputStyle} 
                                    />
                                </div>
                            </div>

                            {modalMode === 'add' && (
                                <div style={formRowStyle}>
                                    <div style={inputGroupStyle}>
                                        <label style={labelStyle}>Password</label>
                                        <input 
                                            type="password" 
                                            name="password" 
                                            value={formData.password} 
                                            onChange={handleInputChange} 
                                            required 
                                            style={inputStyle} 
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Role Specific Fields */}
                            <h3 style={{ fontSize: '1rem', color: '#64748b', marginTop: '20px', marginBottom: '15px', borderBottom: '1px solid #f1f5f9', paddingBottom: '5px' }}>Personal Information</h3>
                            
                            {formData.userRole === 'customer' && (
                                <div style={formRowStyle}>
                                    <div style={inputGroupStyle}>
                                        <label style={labelStyle}>customerFirstName</label>
                                        <input type="text" name="customerFirstName" value={formData.customerFirstName} onChange={handleInputChange} required style={inputStyle} disabled={viewOnly} />
                                    </div>
                                    <div style={inputGroupStyle}>
                                        <label style={labelStyle}>customerLastName</label>
                                        <input type="text" name="customerLastName" value={formData.customerLastName} onChange={handleInputChange} style={inputStyle} disabled={viewOnly} />
                                    </div>
                                </div>
                            )}

                            {formData.userRole === 'technician' && (
                                <>
                                    <div style={formRowStyle}>
                                        <div style={inputGroupStyle}>
                                            <label style={labelStyle}>technicianFirstName</label>
                                            <input type="text" name="technicianFirstName" value={formData.technicianFirstName} onChange={handleInputChange} required style={inputStyle} disabled={viewOnly} />
                                        </div>
                                        <div style={inputGroupStyle}>
                                            <label style={labelStyle}>technicianLastName</label>
                                            <input type="text" name="technicianLastName" value={formData.technicianLastName} onChange={handleInputChange} style={inputStyle} disabled={viewOnly} />
                                        </div>
                                    </div>
                                    <div style={formRowStyle}>
                                        <div style={inputGroupStyle}>
                                            <label style={labelStyle}>technicianSpecialization</label>
                                            <input type="text" name="technicianSpecialization" value={formData.technicianSpecialization} onChange={handleInputChange} style={inputStyle} disabled={viewOnly} />
                                        </div>
                                    </div>
                                </>
                            )}

                            {formData.userRole === 'manager' && (
                                <div style={formRowStyle}>
                                    <div style={inputGroupStyle}>
                                        <label style={labelStyle}>managerFirstName</label>
                                        <input type="text" name="managerFirstName" value={formData.managerFirstName} onChange={handleInputChange} required style={inputStyle} disabled={viewOnly} />
                                    </div>
                                    <div style={inputGroupStyle}>
                                        <label style={labelStyle}>managerLastName</label>
                                        <input type="text" name="managerLastName" value={formData.managerLastName} onChange={handleInputChange} style={inputStyle} disabled={viewOnly} />
                                    </div>
                                </div>
                            )}

                            <div style={formRowStyle}>
                                <div style={inputGroupStyle}>
                                    <label style={labelStyle}>
                                        {formData.userRole === 'customer' ? 'customerPhone' : 
                                         formData.userRole === 'technician' ? 'technicianPhone' : 
                                         formData.userRole === 'manager' ? 'managerPhone' : 'advertiserPhone'}
                                    </label>
                                    <input 
                                        type="text" 
                                        name={formData.userRole === 'customer' ? 'customerPhone' : formData.userRole === 'technician' ? 'technicianPhone' : formData.userRole === 'manager' ? 'managerPhone' : 'advertiserPhone'} 
                                        value={formData.customerPhone || formData.technicianPhone || formData.managerPhone || formData.advertiserPhone || ''} 
                                        onChange={handleInputChange} 
                                        style={inputStyle} 
                                        disabled={viewOnly} 
                                    />
                                </div>
                                <div style={inputGroupStyle}>
                                    <label style={labelStyle}>
                                        {formData.userRole === 'customer' ? 'customerAddress' : 
                                         formData.userRole === 'advertiser' ? 'advertiserAddress' : 
                                         formData.userRole === 'technician' ? 'Technician (N/A)' : 'Manager (N/A)'}
                                    </label>
                                    <input 
                                        type="text" 
                                        name={formData.userRole === 'customer' ? 'customerAddress' : formData.userRole === 'advertiser' ? 'advertiserAddress' : 'n/a'} 
                                        value={formData.customerAddress || formData.advertiserAddress || ''} 
                                        onChange={handleInputChange} 
                                        style={inputStyle} 
                                        disabled={viewOnly || (formData.userRole !== 'customer' && formData.userRole !== 'advertiser')} 
                                    />
                                </div>
                            </div>

                            {/* Extra Fields based on Role */}
                            {formData.role === 'advertiser' && (
                                <>
                                    <div style={formRowStyle}>
                                        <div style={{ ...inputGroupStyle, flex: '1' }}>
                                            <label style={labelStyle}>Business Name</label>
                                            <input type="text" name="businessName" value={formData.businessName} onChange={handleInputChange} style={inputStyle} disabled={viewOnly} />
                                        </div>
                                    </div>
                                    <div style={formRowStyle}>
                                        <div style={{ ...inputGroupStyle, flex: '1' }}>
                                            <label style={labelStyle}>Contact Person</label>
                                            <input type="text" name="contactPerson" value={formData.contactPerson} onChange={handleInputChange} style={inputStyle} disabled={viewOnly} />
                                        </div>
                                    </div>
                                </>
                            )}

                            {formData.role === 'technician' && (
                                <div style={formRowStyle}>
                                    <div style={{ ...inputGroupStyle, flex: '1 0 100%' }}>
                                        <label style={labelStyle}>Specialization</label>
                                        <input type="text" name="specialization" value={formData.specialization} onChange={handleInputChange} style={inputStyle} disabled={viewOnly} />
                                    </div>
                                </div>
                            )}

                            <div style={formRowStyle}>
                                <div style={inputGroupStyle}>
                                    <label style={labelStyle}>userIsActive</label>
                                    <select 
                                        name="userIsActive" 
                                        value={formData.userIsActive ? 'true' : 'false'} 
                                        onChange={(e) => setFormData({...formData, userIsActive: e.target.value === 'true'})}
                                        style={inputStyle}
                                        disabled={viewOnly}
                                    >
                                        <option value="true">Active</option>
                                        <option value="false">Inactive</option>
                                    </select>
                                </div>
                            </div>

                            {!viewOnly && (
                                <div style={{ 
                                    marginTop: '30px', 
                                    display: 'flex', 
                                    justifyContent: 'flex-end', 
                                    gap: '10px',
                                    position: 'sticky',
                                    bottom: 0,
                                    backgroundColor: 'white',
                                    padding: '20px 0',
                                    borderTop: '1px solid #e2e8f0',
                                    zIndex: 10
                                }}>
                                    <button type="button" onClick={() => setShowModal(false)} style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #cbd5e1', background: 'white', cursor: 'pointer' }}>
                                        Cancel
                                    </button>
                                    <button type="submit" style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: 'var(--navy)', color: 'white', cursor: 'pointer' }}>
                                        {modalMode === 'add' ? 'Create User' : 'Save Changes'}
                                    </button>
                                </div>
                            )}
                        </form>
                    </div>
                </div>
            )}
        </SidebarLayout>
    );
};

// Styles
const headerStyle = { padding: '15px 20px', textAlign: 'left', fontWeight: '600', color: '#64748b', fontSize: '0.9rem', textTransform: 'uppercase' };
const cellStyle = { padding: '15px 20px', color: '#334155', fontSize: '0.95rem' };
const formRowStyle = { display: 'flex', gap: '15px', marginBottom: '15px' };
const inputGroupStyle = { flex: 1 };
const labelStyle = { display: 'block', marginBottom: '5px', fontSize: '0.85rem', fontWeight: 'bold', color: '#475569' };
const inputStyle = { width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '0.9rem' };

const getRoleColor = (role) => {
    switch(role) {
        case 'manager': return { bg: '#e0e7ff', text: '#3730a3' };
        case 'technician': return { bg: '#dcfce7', text: '#166534' };
        case 'advertiser': return { bg: '#fef3c7', text: '#92400e' };
        default: return { bg: '#f1f5f9', text: '#475569' };
    }
};

export default ManagerUsersPage;
