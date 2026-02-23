import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const ManagerLoginPage = () => {
  const [formData, setFormData] = useState({ userEmail: '', userPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await login({
        userEmail: formData.userEmail,
        userPassword: formData.userPassword
      });

      if (response.data.userRole === 'manager') {
        navigate('/manager');
      } else {
        setError('Access Denied: You do not have Manager privileges.');
      }
    } catch (err) {
      setError(err?.error || err?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--white)' }}>
      <Navbar />
      <div style={{ display: 'flex', minHeight: 'calc(100vh - 80px)' }}>
        <div style={{
          flex: 1,
          background: 'linear-gradient(rgba(0, 47, 108, 0.95), rgba(0, 47, 108, 0.95)), url("https://images.unsplash.com/photo-1454165833767-02305596328a?auto=format&fit=crop&q=80&w=1600")',
          backgroundSize: 'cover',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '80px',
          color: 'white'
        }}>
          <h1 style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '20px' }}>Managerial<br/><span style={{ color: 'var(--crimson)' }}>CONTROL PORTAL</span></h1>
          <p style={{ fontSize: '1.2rem', opacity: 0.8 }}>Secure entrance for workshop managers and business administrators.</p>
        </div>

        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
          <div style={{ width: '100%', maxWidth: '400px' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--navy)', marginBottom: '30px' }}>Staff Authorization</h2>
            {error && <div style={{ background: '#fee2e2', color: '#dc2626', padding: '15px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.9rem' }}>{error}</div>}

            <form onSubmit={handleLogin} style={{ display: 'grid', gap: '20px' }}>
              <input
                type="email"
                placeholder="Manager Email"
                required
                style={{ width: '100%', padding: '15px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc' }}
                value={formData.userEmail}
                onChange={(e) => setFormData({...formData, userEmail: e.target.value})}
              />
              <input
                type="password"
                placeholder="Security Password"
                required
                style={{ width: '100%', padding: '15px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc' }}
                value={formData.userPassword}
                onChange={(e) => setFormData({...formData, userPassword: e.target.value})}
              />
              <button type="submit" disabled={loading} className="btn btn-crimson" style={{ padding: '16px', borderRadius: '12px', justifyContent: 'center' }}>
                {loading ? 'Verifying...' : 'Authenticate Manager'}
              </button>
            </form>

            <div style={{ marginTop: '30px', textAlign: 'center', color: '#666', fontSize: '0.9rem' }}>
              Newly Appointed Manager? <Link to="/register?role=manager" style={{ color: 'var(--navy)', fontWeight: '800', textDecoration: 'none' }}>Register Here</Link>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ManagerLoginPage;
