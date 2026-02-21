import React, { useState, useEffect } from 'react';
import { 
    Save, MapPin, Phone, Mail, Clock, 
    Settings, ShieldCheck, Pencil, Trash2, X 
} from 'lucide-react';
import SidebarLayout from '../components/SidebarLayout';
import { settingsApi } from '../api/api';

const ManagerSettingsPage = () => {
    const [settings, setSettings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [showModal, setShowModal] = useState(false);
    const [tempSettings, setTempSettings] = useState([]);

    const fetchSettings = async () => {
        setLoading(true);
        try {
            const res = await settingsApi.getAll();
            if (res.success) {
                setSettings(res.data);
            }
        } catch (err) {
            console.error('Fetch settings error:', err);
            setMessage({ type: 'error', text: 'Failed to load system settings.' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    const handleOpenModal = () => {
        setTempSettings(JSON.parse(JSON.stringify(settings)));
        setShowModal(true);
    };

    const handleSaveAll = async () => {
        setSaving(true);
        setMessage({ type: '', text: '' });
        let successCount = 0;
        try {
            for (const setting of tempSettings) {
                const res = await settingsApi.update(setting.settingKey, setting.settingValue);
                if (res.success) successCount++;
            }
            setSettings(tempSettings);
            setShowModal(false);
            setMessage({ type: 'success', text: `Updated ${successCount} settings successfully!` });
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } catch (err) {
            console.error('Update all settings error:', err);
            setMessage({ type: 'error', text: 'Failed to update settings.' });
        } finally {
            setSaving(false);
        }
    };

    const handleClearAll = () => {
        if (window.confirm('Are you sure you want to clear all settings?')) {
            setTempSettings(tempSettings.map(s => ({ ...s, settingValue: '' })));
        }
    };

    const getIcon = (key) => {
        if (key.includes('address')) return <MapPin size={18} />;
        if (key.includes('phone')) return <Phone size={18} />;
        if (key.includes('email')) return <Mail size={18} />;
        if (key.includes('hours')) return <Clock size={18} />;
        return <Settings size={18} />;
    };

    return (
        <SidebarLayout role="manager">
            <div style={{ padding: '20px', maxWidth: '900px', margin: '0 auto' }}>
                <div style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1 style={{ fontSize: '1.875rem', fontWeight: '800', color: 'var(--black)', margin: 0 }}>System Setting</h1>
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button 
                            onClick={handleOpenModal}
                            style={{ padding: '12px 24px', borderRadius: '8px', background: 'var(--navy)', color: 'white', border: 'none', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                        >
                            <Pencil size={18} /> Update Settings
                        </button>
                    </div>
                </div>

                {message.text && (
                    <div style={{ 
                        padding: '15px 20px', 
                        borderRadius: '8px', 
                        marginBottom: '25px',
                        background: message.type === 'success' ? '#ecfdf5' : '#fef2f2',
                        color: message.type === 'success' ? '#10b981' : '#ef4444',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        fontWeight: '600',
                        border: `1px solid ${message.type === 'success' ? '#10b981' : '#ef4444'}30`
                    }}>
                        <ShieldCheck size={20} />
                        {message.text}
                    </div>
                )}

                <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                    <div style={{ padding: '20px 25px', background: 'var(--gray-light)', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h2 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--navy)', margin: 0 }}>Business contact information</h2>
                    </div>

                    <div style={{ padding: '25px' }}>
                        {loading ? (
                            <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Loading setting...</div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                {settings.map((setting) => (
                                    <div key={setting.settingId} style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: '20px', alignItems: 'start', padding: '15px', borderRadius: '12px', background: '#f8fafc', border: '1px solid #f1f5f9' }}>
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--navy)', fontWeight: '700', textTransform: 'capitalize', marginBottom: '4px' }}>
                                                {getIcon(setting.settingKey)}
                                                {setting.settingKey.replace(/_/g, ' ')}
                                            </div>
                                            <p style={{ fontSize: '0.8rem', color: '#64748b' }}>{setting.settingDescription}</p>
                                        </div>
                                        <div style={{ padding: '12px', background: 'white', borderRadius: '8px', border: '1px solid #e2e8f0', color: '#334155', fontWeight: '500', minHeight: '45px' }}>
                                            {setting.settingValue}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* MODAL */}
                {showModal && (
                    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(15, 23, 42, 0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000 }}>
                        <div style={{ background: 'white', width: '90%', maxWidth: '800px', maxHeight: '90vh', borderRadius: '20px', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
                            <div style={{ padding: '25px 30px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '800', color: 'var(--navy)' }}>Update Settings</h2>
                                    <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748b' }}>Modify system-wide settings</p>
                                </div>
                                <button onClick={() => setShowModal(false)} style={{ background: '#f1f5f9', border: 'none', color: '#64748b', padding: '8px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <X size={20} />
                                </button>
                            </div>

                            <div style={{ padding: '30px', overflowY: 'auto', flex: 1 }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                    {tempSettings.map((setting) => (
                                        <div key={setting.settingId} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            <label style={{ color: 'var(--navy)', fontWeight: '700', textTransform: 'capitalize', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                {getIcon(setting.settingKey)}
                                                {setting.settingKey.replace(/_/g, ' ')}
                                            </label>
                                            {setting.settingKey === 'contact_address' ? (
                                                <textarea 
                                                    value={setting.settingValue}
                                                    onChange={(e) => setTempSettings(tempSettings.map(s => s.settingKey === setting.settingKey ? { ...s, settingValue: e.target.value } : s))}
                                                    style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', minHeight: '100px', fontSize: '1rem', outlineColor: 'var(--navy)' }}
                                                />
                                            ) : (
                                                <input 
                                                    type="text" 
                                                    value={setting.settingValue} 
                                                    onChange={(e) => setTempSettings(tempSettings.map(s => s.settingKey === setting.settingKey ? { ...s, settingValue: e.target.value } : s))}
                                                    style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '1rem', outlineColor: 'var(--navy)' }}
                                                />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div style={{ padding: '20px 30px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '15px' }}>
                                <button 
                                    onClick={handleClearAll}
                                    style={{ padding: '12px 24px', borderRadius: '10px', background: '#f1f5f9', color: '#64748b', border: '1px solid #e2e8f0', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                                >
                                    <Trash2 size={18} /> Clear All
                                </button>
                                <button 
                                    onClick={handleSaveAll}
                                    disabled={saving}
                                    style={{ padding: '12px 30px', borderRadius: '10px', background: 'var(--navy)', color: 'white', border: 'none', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', opacity: saving ? 0.7 : 1 }}
                                >
                                    <Save size={18} /> {saving ? 'Updating...' : 'Update Settings'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </SidebarLayout>
    );
};

export default ManagerSettingsPage;
