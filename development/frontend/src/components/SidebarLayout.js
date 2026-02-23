import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Users, Wrench, Calendar, CreditCard, MessageSquare,
  AlertTriangle, Image as ImageIcon, CheckSquare,
  BarChart, Settings, LogOut, Menu, X, RotateCcw, Globe
} from 'lucide-react';

const SidebarLayout = ({ children, role }) => {
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const sidebarRef = React.useRef(null);

  React.useLayoutEffect(() => {
    const savedScroll = sessionStorage.getItem(`sidebar-scroll-${role}`);
    if (sidebarRef.current && savedScroll) {
      sidebarRef.current.scrollTop = parseInt(savedScroll, 10);
    }
  }, [location.pathname, role]);

  const menuConfigs = {
    manager: [
      { id: 'user', label: 'User', icon: <Users size={20} />, path: '/manager/users' },
      { id: 'service', label: 'Service', icon: <Wrench size={20} />, path: '/manager/services' },
      { id: 'booking', label: 'Booking', icon: <Calendar size={20} />, path: '/manager' },
      { id: 'payment', label: 'Payment', icon: <CreditCard size={20} />, path: '/manager/payments' },
      { id: 'refund', label: 'Refund', icon: <RotateCcw size={20} />, path: '/manager/refunds' },
      { id: 'feedback', label: 'Feedback', icon: <MessageSquare size={20} />, path: '/manager/feedbacks' },
      { id: 'complaint', label: 'Complaint', icon: <AlertTriangle size={20} />, path: '/manager/complaints' },
      { id: 'ad', label: 'Ad', icon: <ImageIcon size={20} />, path: '/manager/ads' },
      { id: 'task', label: 'Service tracking', icon: <CheckSquare size={20} />, path: '/manager/tasks' },
      { id: 'report', label: 'Report', icon: <BarChart size={20} />, path: '/manager/reports' },
      { id: 'website-setting', label: 'System Setting', icon: <Globe size={20} />, path: '/manager/website-settings' },
      { id: 'setting', label: 'Profile', icon: <Settings size={20} />, path: '/manager/settings' },
    ],
    technician: [
      { id: 'task', label: 'My Booking', icon: <CheckSquare size={20} />, path: '/technician' },
      { id: 'setting', label: 'Profile', icon: <Settings size={20} />, path: '/technician/settings' },
    ],
    advertiser: [
      { id: 'ad', label: 'Ad Management', icon: <ImageIcon size={20} />, path: '/advertiser' },
      { id: 'payment', label: 'Payment', icon: <CreditCard size={20} />, path: '/advertiser/payments' },
      { id: 'setting', label: 'Profile', icon: <Settings size={20} />, path: '/advertiser/settings' },
    ],
    customer: [
      { id: 'setting', label: 'Profile', icon: <Settings size={20} />, path: '/customer/settings' },
      { id: 'refund', label: 'Request Refund', icon: <RotateCcw size={20} />, path: '/customer/refunds' },
      { id: 'booking', label: 'Booking', icon: <Calendar size={20} />, path: '/dashboard' },
      { id: 'complaint', label: 'Complaint', icon: <AlertTriangle size={20} />, path: '/customer/complaints' },
      { id: 'feedback', label: 'Feedback', icon: <MessageSquare size={20} />, path: '/customer/feedbacks' },
    ]
  };

  const navItems = menuConfigs[role] || [];

  const handleLogout = () => {
    sessionStorage.removeItem(`sidebar-scroll-${role}`);
    logout();
    if (role === 'manager') navigate('/manager/login');
    else if (role === 'technician') navigate('/technician/login');
    else if (role === 'advertiser') navigate('/advertiser/login');
    else navigate('/login');
  };

  const handleNavigation = (path) => {
    if (sidebarRef.current) {
      sessionStorage.setItem(`sidebar-scroll-${role}`, sidebarRef.current.scrollTop);
    }
    navigate(path);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
      {}
      <aside
        ref={sidebarRef}
        id="sidebar-scroll-container"
        style={{
        width: collapsed ? '80px' : '280px',
        background: 'var(--navy)',
        color: 'white',
        transition: 'width 0.3s ease',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        height: '100vh',
        overflowY: 'auto',
        zIndex: 1000
      }}>
        {}
        <div style={{ padding: '30px 20px', display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'space-between' }}>
          {!collapsed && <div className="logo" style={{ color: 'white', fontSize: '1.4rem' }}>SEATS<span>LABS</span></div>}
          <button onClick={() => setCollapsed(!collapsed)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
            {collapsed ? <Menu size={24} /> : <X size={24} />}
          </button>
        </div>

        {}
        {!collapsed && (
          <div style={{ padding: '0 20px 30px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '1px' }}>{role} Portal</div>
            <div style={{ fontSize: '1.1rem', fontWeight: '700', marginTop: '5px' }}>{user?.userName || user?.userEmail?.split('@')[0]}</div>
          </div>
        )}

        {}
        <nav style={{ flex: 1, padding: '20px 10px' }}>
          {navItems.map(item => {
            const isActive = item.path === '/manager' || item.path === '/technician' || item.path === '/advertiser'
              ? location.pathname === item.path || location.pathname === `${item.path}/`
              : location.pathname.startsWith(item.path);

            return (
              <div key={item.id}
                onClick={() => handleNavigation(item.path)}
                style={{
                display: 'flex',
                alignItems: 'center',
                gap: '15px',
                padding: '15px',
                borderRadius: '8px',
                cursor: 'pointer',
                marginBottom: '5px',
                transition: '0.2s',
                background: isActive ? 'rgba(255,255,255,0.15)' : 'transparent',
                color: isActive ? 'white' : 'rgba(255,255,255,0.7)'
              }} onMouseOver={(e) => {
                  if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
              }}
                 onMouseOut={(e) => {
                  if (!isActive) e.currentTarget.style.background = 'transparent';
              }}>
                <div style={{ color: isActive ? 'white' : 'inherit' }}>
                  {item.icon}
                </div>
                {!collapsed && <span style={{ fontWeight: isActive ? '700' : '600' }}>{item.label}</span>}
              </div>
            );
          })}
        </nav>

        {}
        <div style={{ padding: '20px', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', gap: '10px' }}>

          {role === 'customer' && (
            <button onClick={() => navigate('/')} style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: collapsed ? 'center' : 'flex-start',
              gap: '15px',
              padding: '12px',
              borderRadius: '8px',
              background: '#ca8a04',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
              fontWeight: '700'
            }}>
              <Globe size={20} />
              {!collapsed && <span>Back to Website</span>}
            </button>
          )}

          <button onClick={handleLogout} style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'flex-start',
            gap: '15px',
            padding: '12px',
            borderRadius: '8px',
            background: 'var(--crimson)',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            fontWeight: '700'
          }}>
            <LogOut size={20} />
            {!collapsed && <span>Log Out</span>}
          </button>
        </div>
      </aside>

      {}
      <main style={{
        flex: 1,
        marginLeft: collapsed ? '80px' : '280px',
        transition: 'margin-left 0.3s ease',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{ padding: '40px' }}>
          {children}
        </div>
      </main>
    </div>
  );
};

export default SidebarLayout;
