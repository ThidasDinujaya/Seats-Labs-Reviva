import React from 'react';
import SidebarLayout from '../components/SidebarLayout';

const ComingSoon = ({ role, title }) => {
    return (
        <SidebarLayout role={role}>
            <div style={{ 
                height: 'calc(100vh - 80px)', 
                display: 'flex', 
                flexDirection: 'column', 
                justifyContent: 'center', 
                alignItems: 'center',
                color: '#64748b'
            }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '10px' }}>{title || 'Coming Soon'}</h1>
                <p style={{ fontSize: '1.1rem' }}>This feature is currently under development.</p>
            </div>
        </SidebarLayout>
    );
};

export default ComingSoon;
