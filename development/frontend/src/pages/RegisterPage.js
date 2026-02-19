import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { authApi } from '../api/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const RegisterPage = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const requestedRole = queryParams.get('role') || 'customer';

  const [formData, setFormData] = useState({
    userEmail: '',
    userPassword: '',
    userRole: requestedRole,
    customerFirstName: '',
    customerLastName: '',
    customerPhone: '',
    customerAddress: '',
    advertiserBusinessName: '',
    advertiserContactPerson: '',
    advertiserPhone: '',
    advertiserAddress: '',
    technicianFirstName: '',
    technicianLastName: '',
    technicianPhone: '',
    managerFirstName: '',
    managerLastName: '',
    managerPhone: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await authApi.register(formData);
      if (response.success) {
        if (requestedRole === 'manager') navigate('/manager/login');
        else if (requestedRole === 'technician') navigate('/technician/login');
        else if (requestedRole === 'advertiser') navigate('/advertiser/login');
        else navigate('/login');
      }
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Registration failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--white)' }}>
      <Navbar />
      
      <div style={{ display: 'flex', minHeight: 'calc(100vh - 80px)' }}>
        {/* Left Side: Branding/Imagery */}
        <div style={{ 
          flex: 1, 
          background: requestedRole === 'customer' 
            ? 'linear-gradient(rgba(193, 0, 5, 0.8), rgba(0, 47, 108, 0.9)), url("https://images.unsplash.com/photo-1530046339160-ce3e5b0c7a2f?auto=format&fit=crop&q=80&w=1600")'
            : 'linear-gradient(rgba(0, 47, 108, 0.95), rgba(0, 47, 108, 0.95)), url("https://images.unsplash.com/photo-1454165833767-0274b20476d0?auto=format&fit=crop&q=80&w=1600")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '80px',
          color: 'white'
        }}>
          {requestedRole === 'customer' ? (
            <>
              <h1 style={{ fontSize: '3.5rem', fontWeight: '800', marginBottom: '20px' }}>Join the<br/><span style={{ color: 'white' }}>ELITE AUTO CLUB</span></h1>
              <p style={{ fontSize: '1.2rem', maxWidth: '500px', opacity: 0.9, marginBottom: '40px' }}>
                Register today to unlock personalized service tracking, loyalty rewards, and priority booking at the heart of Colombo.
              </p>
            </>
          ) : (
            <>
              <h1 style={{ fontSize: '3.5rem', fontWeight: '800', marginBottom: '20px' }}>Staff<br/><span style={{ color: 'var(--crimson)' }}>ONBOARDING</span></h1>
              <p style={{ fontSize: '1.2rem', maxWidth: '500px', opacity: 0.9, marginBottom: '40px' }}>
                Join the SeatsLabs professional network. Access advanced workshop tools, manage services, and deliver excellence.
              </p>
            </>
          )}
          <ul style={{ listStyle: 'none', display: 'grid', gap: '20px' }}>
            <li style={{ display: 'flex', alignItems: 'center', gap: '15px', fontWeight: '700' }}>
              <i className="fi fi-rr-check" style={{ color: 'white', background: 'rgba(255,255,255,0.2)', padding: '5px', borderRadius: '50%' }}></i>
              Digital Service Passports
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '15px', fontWeight: '700' }}>
              <i className="fi fi-rr-check" style={{ color: 'white', background: 'rgba(255,255,255,0.2)', padding: '5px', borderRadius: '50%' }}></i>
              Real-time Repair Updates
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '15px', fontWeight: '700' }}>
              <i className="fi fi-rr-check" style={{ color: 'white', background: 'rgba(255,255,255,0.2)', padding: '5px', borderRadius: '50%' }}></i>
              Exclusive Member Discounts
            </li>
          </ul>
        </div>

        {/* Right Side: Register Form */}
        <div style={{ flex: 1.2, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
          <div style={{ width: '100%', maxWidth: '550px' }}>
            <div style={{ marginBottom: '30px' }}>
              <h2 style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--navy)', marginBottom: '10px' }}>Create Account</h2>
              <p style={{ color: '#666' }}>Your keys to the most advanced workshop experience in Sri Lanka.</p>
            </div>

            {error && <div style={{ background: '#fee2e2', color: '#dc2626', padding: '15px', borderRadius: '4px', marginBottom: '25px', fontSize: '0.9rem', fontWeight: '600' }}>{error}</div>}

            <form onSubmit={handleRegister} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', fontSize: '0.85rem', color: 'var(--navy)' }}>
                  {requestedRole === 'advertiser' ? 'CONTACT PERSON' : 'FIRST NAME'}
                </label>
                <input 
                  type="text" 
                  placeholder="Amila"
                  required
                  style={{ width: '100%', padding: '12px', borderRadius: '14px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '0.95rem', outline: 'none' }}
                  value={requestedRole === 'customer' ? formData.customerFirstName : requestedRole === 'technician' ? formData.technicianFirstName : requestedRole === 'manager' ? formData.managerFirstName : formData.advertiserContactPerson}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (requestedRole === 'customer') setFormData({...formData, customerFirstName: val});
                    else if (requestedRole === 'technician') setFormData({...formData, technicianFirstName: val});
                    else if (requestedRole === 'manager') setFormData({...formData, managerFirstName: val});
                    else if (requestedRole === 'advertiser') setFormData({...formData, advertiserContactPerson: val});
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', fontSize: '0.85rem', color: 'var(--navy)' }}>
                  {requestedRole === 'advertiser' ? 'BUSINESS NAME' : 'LAST NAME'}
                </label>
                <input 
                  type="text" 
                  placeholder="Perera"
                  required
                  style={{ width: '100%', padding: '12px', borderRadius: '14px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '0.95rem', outline: 'none' }}
                  value={requestedRole === 'customer' ? formData.customerLastName : requestedRole === 'technician' ? formData.technicianLastName : requestedRole === 'manager' ? formData.managerLastName : formData.advertiserBusinessName}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (requestedRole === 'customer') setFormData({...formData, customerLastName: val});
                    else if (requestedRole === 'technician') setFormData({...formData, technicianLastName: val});
                    else if (requestedRole === 'manager') setFormData({...formData, managerLastName: val});
                    else if (requestedRole === 'advertiser') setFormData({...formData, advertiserBusinessName: val});
                  }}
                />
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', fontSize: '0.85rem', color: 'var(--navy)' }}>EMAIL ADDRESS</label>
                <input 
                  type="email" 
                  placeholder="name@example.lk"
                  required
                  style={{ width: '100%', padding: '12px', borderRadius: '14px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '0.95rem', outline: 'none' }}
                  value={formData.userEmail}
                  onChange={(e) => setFormData({...formData, userEmail: e.target.value})}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', fontSize: '0.85rem', color: 'var(--navy)' }}>PHONE NUMBER</label>
                <input 
                  type="text" 
                  placeholder="077 XXXXXXX"
                  required
                  style={{ width: '100%', padding: '12px', borderRadius: '14px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '0.95rem', outline: 'none' }}
                  value={requestedRole === 'customer' ? formData.customerPhone : requestedRole === 'technician' ? formData.technicianPhone : requestedRole === 'manager' ? formData.managerPhone : formData.advertiserPhone}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (requestedRole === 'customer') setFormData({...formData, customerPhone: val});
                    else if (requestedRole === 'technician') setFormData({...formData, technicianPhone: val});
                    else if (requestedRole === 'manager') setFormData({...formData, managerPhone: val});
                    else if (requestedRole === 'advertiser') setFormData({...formData, advertiserPhone: val});
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', fontSize: '0.85rem', color: 'var(--navy)' }}>SECURE PASSWORD</label>
                <input 
                  type="password" 
                  placeholder="••••••••"
                  required
                  style={{ width: '100%', padding: '12px', borderRadius: '14px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '0.95rem', outline: 'none' }}
                  value={formData.userPassword}
                  onChange={(e) => setFormData({...formData, userPassword: e.target.value})}
                />
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="btn btn-crimson" 
                  style={{ width: '100%', padding: '16px', borderRadius: '14px', justifyContent: 'center' }}
                >
                  {loading ? 'Creating Account...' : 'Join SeatsLabs Modern Workshop'}
                </button>
              </div>
            </form>

            <div style={{ marginTop: '30px', textAlign: 'center', color: '#666', fontSize: '0.9rem' }}>
              Already a Member? <Link to={
                requestedRole === 'manager' ? '/manager/login' :
                requestedRole === 'technician' ? '/technician/login' :
                requestedRole === 'advertiser' ? '/advertiser/login' :
                '/login'
              } style={{ color: 'var(--navy)', fontWeight: '800', textDecoration: 'none' }}>Login to My Garage</Link>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default RegisterPage;
