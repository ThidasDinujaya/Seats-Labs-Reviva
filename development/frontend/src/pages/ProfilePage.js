import React, { useState } from 'react';
import SidebarLayout from '../components/SidebarLayout';
import { useAuth } from '../context/AuthContext';
import { User, Phone, Lock, Save } from 'lucide-react';

const ProfilePage = ({ role }) => {
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

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Validation for password change if attempted
        if (formData.newPassword || formData.confirmPassword) {
            if (formData.newPassword !== formData.confirmPassword) {
                setMessage({ type: 'error', text: 'New passwords do not match!' });
                return;
            }
            if (!formData.currentPassword) {
                setMessage({ type: 'error', text: 'Current password is required to set a new one.' });
                return;
            }
        }

        // In a real app, API call here
        console.log('Update full profile:', formData);
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    };

    const handleDeleteProfile = () => {
        if (window.confirm('Are you sure you want to delete your profile? This action is permanent!')) {
            console.log('Delete profile trigger');
            alert('Profile deletion request submitted.');
        }
    };

    return (
        <SidebarLayout role={role}>
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                <div style={{ marginBottom: '30px' }}>
                    <h1 style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--navy)', margin: 0 }}>Profile</h1>
                    <p style={{ color: '#64748b', margin: '5px 0 0' }}>Manage your account details and security settings.</p>
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

                <div style={{ background: 'white', padding: '40px', borderRadius: '16px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}>
                    <form onSubmit={handleSubmit}>
                        {/* Section 1: Personal Information */}
                        <div style={{ marginBottom: '30px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', paddingBottom: '10px', borderBottom: '1px solid #f1f5f9' }}>
                                <User size={20} color="var(--navy)" />
                                <h2 style={{ fontSize: '1.1rem', color: 'var(--navy)', margin: 0, fontWeight: '700' }}>Personal Details</h2>
                            </div>
                            
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#64748b', fontSize: '0.85rem' }}>
                                        {user?.userRole === 'advertiser' ? 'Contact Person' : 'First Name'}
                                    </label>
                                    <input 
                                        type="text" 
                                        name={user?.userRole === 'advertiser' ? 'advertiserContactPerson' : 
                                              user?.userRole === 'customer' ? 'customerFirstName' : 
                                              user?.userRole === 'technician' ? 'technicianFirstName' : 'managerFirstName'}
                                        value={formData.customerFirstName || formData.technicianFirstName || formData.managerFirstName || formData.advertiserContactPerson || ''}
                                        onChange={handleChange}
                                        style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', outlineColor: 'var(--navy)' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#64748b', fontSize: '0.85rem' }}>
                                        {user?.userRole === 'advertiser' ? 'Business Name' : 'Last Name'}
                                    </label>
                                    <input 
                                        type="text" 
                                        name={user?.userRole === 'advertiser' ? 'advertiserBusinessName' : 
                                              user?.userRole === 'customer' ? 'customerLastName' : 
                                              user?.userRole === 'technician' ? 'technicianLastName' : 'managerLastName'}
                                        value={formData.customerLastName || formData.technicianLastName || formData.managerLastName || formData.advertiserBusinessName || ''}
                                        onChange={handleChange}
                                        style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', outlineColor: 'var(--navy)' }}
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#64748b', fontSize: '0.85rem' }}>Email Address</label>
                                    <input 
                                        type="email" 
                                        value={user?.userEmail || ''}
                                        disabled
                                        style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#f8fafc', color: '#94a3b8', cursor: 'not-allowed' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#64748b', fontSize: '0.85rem' }}>Phone Number</label>
                                    <div style={{ position: 'relative' }}>
                                        <Phone size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                        <input 
                                            type="tel" 
                                            name={user?.userRole === 'customer' ? 'customerPhone' : 
                                                  user?.userRole === 'technician' ? 'technicianPhone' : 
                                                  user?.userRole === 'advertiser' ? 'advertiserPhone' : 'managerPhone'}
                                            value={formData.customerPhone || formData.technicianPhone || formData.managerPhone || formData.advertiserPhone || ''}
                                            onChange={handleChange}
                                            style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '8px', border: '1px solid #cbd5e1', outlineColor: 'var(--navy)' }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Security */}
                        <div style={{ marginBottom: '40px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', paddingBottom: '10px', borderBottom: '1px solid #f1f5f9' }}>
                                <Lock size={20} color="var(--navy)" />
                                <h2 style={{ fontSize: '1.1rem', color: 'var(--navy)', margin: 0, fontWeight: '700' }}>Security</h2>
                            </div>
                            
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#64748b', fontSize: '0.85rem' }}>Current Password</label>
                                <input 
                                    type="password" 
                                    name="currentPassword"
                                    value={formData.currentPassword}
                                    onChange={handleChange}
                                    placeholder="Enter current password to verify changes"
                                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', outlineColor: 'var(--navy)' }}
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#64748b', fontSize: '0.85rem' }}>New Password</label>
                                    <input 
                                        type="password" 
                                        name="newPassword"
                                        value={formData.newPassword}
                                        onChange={handleChange}
                                        style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', outlineColor: 'var(--navy)' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#64748b', fontSize: '0.85rem' }}>Confirm New Password</label>
                                    <input 
                                        type="password" 
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', outlineColor: 'var(--navy)' }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div style={{ display: 'flex', gap: '20px', paddingTop: '20px', borderTop: '1px solid #f1f5f9' }}>
                            <button type="submit" style={{ 
                                flex: 2,
                                background: 'var(--navy)', 
                                color: 'white', 
                                border: 'none', 
                                padding: '14px', 
                                borderRadius: '10px', 
                                fontWeight: '700', 
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '10px',
                                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
                            }}>
                                <Save size={18} />
                                Update Profile
                            </button>
                            <button 
                                type="button"
                                onClick={handleDeleteProfile}
                                style={{ 
                                    flex: 1,
                                    background: 'white', 
                                    color: '#ef4444', 
                                    border: '2px solid #ef4444', 
                                    padding: '14px', 
                                    borderRadius: '10px', 
                                    fontWeight: '700', 
                                    cursor: 'pointer'
                                }}
                            >
                                Delete Profile
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </SidebarLayout>
    );
};

export default ProfilePage;
