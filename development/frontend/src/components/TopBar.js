import React from 'react';
import { settingsApi } from '../api/api';

const TopBar = () => {
    const [settings, setSettings] = React.useState({});

    React.useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await settingsApi.getAll();
                if (res.success) {
                    const settingsMap = res.data.reduce((acc, s) => ({ ...acc, [s.settingKey]: s.settingValue }), {});
                    setSettings(settingsMap);
                }
            } catch (err) {
                console.error('TopBar settings load error:', err);
            }
        };
        fetchSettings();
    }, []);

    return (
        <div className="top-bar">
            <div className="container top-bar-content">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <i className="fi fi-rr-marker"></i>
                    {settings.contact_address || '123 Automotive Way, Colombo 07, Sri Lanka'}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <i className="fi fi-rr-phone-call"></i>
                    {settings.contact_phone || '+94 11 234 5678'} | {settings.contact_opening_hours || 'Mon - Sat: 8:00 AM - 6:00 PM'}
                </div>
            </div>
        </div>
    );
};

export default TopBar;
