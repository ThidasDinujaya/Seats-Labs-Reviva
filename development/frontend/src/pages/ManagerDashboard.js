import React from 'react';
import SidebarLayout from '../components/SidebarLayout';

const ManagerDashboard = () => {
  return (
    <SidebarLayout role="manager">
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--navy)' }}>Manager Dashboard</h1>
        <p style={{ color: '#666' }}>Comprehensive access to all business operations and CRUD management.</p>
      </div>

      <div style={{ marginTop: '40px', background: 'white', padding: '30px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
        <h3 style={{ marginBottom: '20px', color: 'var(--navy)' }}>Business Overview</h3>
        <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', borderRadius: '8px', border: '2px dashed #e2e8f0', color: '#94a3b8' }}>
          Interactive Reports & CRUD Operations Loaded Here
        </div>
      </div>
    </SidebarLayout>
  );
};

export default ManagerDashboard;
