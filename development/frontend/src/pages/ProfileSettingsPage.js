import React, { useState } from 'react';
import SidebarLayout from '../components/SidebarLayout';
import { useAuth } from '../context/AuthContext';
import { User, Phone, Lock, Save } from 'lucide-react';

const ProfileSettingsPage = ({ role }) => {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        customerFirstName: user?.customerFirstName || '',
        customerLastName: user?.customerLastName || '',
        customerPhone: user?.customerPhone || '',
        customerAddress: user?.customerAddress || '',
        technicianFirstName: user?.technicianFirstName || '',
        technicianLastName: user?.technicianLastName || '',
        technicianPhone: user?.technicianPhone || '',
        technicianSpecialization: user?.technicianSpecialization || '',
        managerFirstName: user?.managerFirstName || '',
        managerLastName: user?.managerLastName || '',
        managerPhone: user?.managerPhone || '',
        advertiserBusinessName: user?.advertiserBusinessName || '',
        advertiserContactPerson: user?.advertiserContactPerson || '',
        advertiserPhone: user?.advertiserPhone || '',
        advertiserAddress: user?.advertiserAddress || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [message, setMessage] = useState({ type: '', text: '' });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSaveProfile = (e) => {
        e.preventDefault();
        // In a real app, you would make an API call here to update the user profile
        console.log('Update profile:', formData);
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    };

    const handleChangePassword = (e) => {
        e.preventDefault();
        if (formData.newPassword !== formData.confirmPassword) {
            setMessage({ type: 'error', text: 'New passwords do not match!' });
            return;
        }
        // In a real app, API call to update password
        console.log('Update password');
        setMessage({ type: 'success', text: 'Password changed successfully!' });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    };

    return (
        <SidebarLayout role={role}>
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                <div style={{ marginBottom: '30px' }}>
                    <h1 style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--navy)' }}>Account Settings</h1>
                    <p style={{ color: '#64748b' }}>Manage your profile information and security settings.</p>
                </div>

                {message.text && (
                    <div style={{
                        padding: '15px',
                        marginBottom: '20px',
                        borderRadius: '8px',
                        background: message.type === 'success' ? '#dcfce7' : '#fee2e2',
                        color: message.type === 'success' ? '#166534' : '#dc2626',
                        fontWeight: '500'
                    }}>
                        {message.text}
                    </div>
                )}

                <div style={{ display: 'grid', gap: '30px' }}>
                    
                    {/* Profile Information Card */}
                    <div style={{ background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', paddingBottom: '15px', borderBottom: '1px solid #e2e8f0' }}>
                            <User size={24} color="var(--navy)" />
                            <h2 style={{ fontSize: '1.2rem', color: 'var(--navy)', margin: 0 }}>Personal Information</h2>
                        </div>

                        <form onSubmit={handleSaveProfile}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#64748b', fontSize: '0.9rem' }}>
                                        {user?.userRole === 'advertiser' ? 'advertiserContactPerson' : 
                                         user?.userRole === 'customer' ? 'customerFirstName' : 
                                         user?.userRole === 'technician' ? 'technicianFirstName' : 'managerFirstName'}
                                    </label>
                                    <input 
                                        type="text" 
                                        name={user?.userRole === 'advertiser' ? 'advertiserContactPerson' : 
                                              user?.userRole === 'customer' ? 'customerFirstName' : 
                                              user?.userRole === 'technician' ? 'technicianFirstName' : 'managerFirstName'}
                                        value={formData.customerFirstName || formData.technicianFirstName || formData.managerFirstName || formData.advertiserContactPerson || ''}
                                        onChange={handleChange}
                                        style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#64748b', fontSize: '0.9rem' }}>
                                        {user?.userRole === 'advertiser' ? 'advertiserBusinessName' : 
                                         user?.userRole === 'customer' ? 'customerLastName' : 
                                         user?.userRole === 'technician' ? 'technicianLastName' : 'managerLastName'}
                                    </label>
                                    <input 
                                        type="text" 
                                        name={user?.userRole === 'advertiser' ? 'advertiserBusinessName' : 
                                              user?.userRole === 'customer' ? 'customerLastName' : 
                                              user?.userRole === 'technician' ? 'technicianLastName' : 'managerLastName'}
                                        value={formData.customerLastName || formData.technicianLastName || formData.managerLastName || formData.advertiserBusinessName || ''}
                                        onChange={handleChange}
                                        style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }}
                                    />
                                </div>
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#64748b', fontSize: '0.9rem' }}>Email Address</label>
                                <input 
                                    type="email" 
                                    value={user?.userEmail || ''}
                                    disabled
                                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#f8fafc', color: '#94a3b8', outline: 'none' }}
                                />
                                <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '5px' }}>Email address cannot be changed.</div>
                            </div>

                            <div style={{ marginBottom: '30px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#64748b', fontSize: '0.9rem' }}>
                                    {user?.userRole === 'customer' ? 'customerPhone' : 
                                     user?.userRole === 'technician' ? 'technicianPhone' : 
                                     user?.userRole === 'advertiser' ? 'advertiserPhone' : 'managerPhone'}
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <Phone size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                    <input 
                                        type="tel" 
                                        name={user?.userRole === 'customer' ? 'customerPhone' : 
                                              user?.userRole === 'technician' ? 'technicianPhone' : 
                                              user?.userRole === 'advertiser' ? 'advertiserPhone' : 'managerPhone'}
                                        value={formData.customerPhone || formData.technicianPhone || formData.managerPhone || formData.advertiserPhone || ''}
                                        onChange={handleChange}
                                        style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }}
                                        placeholder="+94 7X XXX XXXX"
                                    />
                                </div>
                            </div>

                            <button type="submit" style={{ 
                                background: 'var(--navy)', 
                                color: 'white', 
                                border: 'none', 
                                padding: '12px 24px', 
                                borderRadius: '8px', 
                                fontWeight: '600', 
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}>
                                <Save size={18} />
                                Save Changes
                            </button>
                        </form>
                    </div>

                    {/* Change Password Card */}
                    <div style={{ background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', paddingBottom: '15px', borderBottom: '1px solid #e2e8f0' }}>
                            <Lock size={24} color="var(--navy)" />
                            <h2 style={{ fontSize: '1.2rem', color: 'var(--navy)', margin: 0 }}>Security</h2>
                        </div>

                        <form onSubmit={handleChangePassword}>
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#64748b', fontSize: '0.9rem' }}>Current Password</label>
                                <input 
                                    type="password" 
                                    name="currentPassword"
                                    value={formData.currentPassword}
                                    onChange={handleChange}
                                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }}
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#64748b', fontSize: '0.9rem' }}>New Password</label>
                                    <input 
                                        type="password" 
                                        name="newPassword"
                                        value={formData.newPassword}
                                        onChange={handleChange}
                                        style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#64748b', fontSize: '0.9rem' }}>Confirm New Password</label>
                                    <input 
                                        type="password" 
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }}
                                    />
                                </div>
                            </div>

                            <button type="submit" style={{ 
                                background: 'white', 
                                color: 'var(--navy)', 
                                border: '2px solid var(--navy)', 
                                padding: '12px 24px', 
                                borderRadius: '8px', 
                                fontWeight: '600', 
                                cursor: 'pointer' 
                            }}>
                                Update Password
                            </button>
                        </form>
                    </div>

                </div>
            </div>
        </SidebarLayout>
    );
};

export default ProfileSettingsPage;
