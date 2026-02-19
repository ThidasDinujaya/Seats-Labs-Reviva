import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const TechnicianLoginPage = () => {
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
      if (response.data.userRole === 'technician') {
        navigate('/technician');
      } else {
        setError('Access Denied: You do not have Technician privileges.');
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Login failed. Please check your credentials.');
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
          background: 'linear-gradient(rgba(0, 47, 108, 0.95), rgba(0, 47, 108, 0.95)), url("https://images.unsplash.com/photo-1504222490345-c075b6008014?auto=format&fit=crop&q=80&w=1600")',
          backgroundSize: 'cover',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '80px',
          color: 'white'
        }}>
          <h1 style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '20px' }}>Service Expert<br/><span style={{ color: 'var(--crimson)' }}>TASK PORTAL</span></h1>
          <p style={{ fontSize: '1.2rem', opacity: 0.8 }}>Secure entrance for certified workshop technicians.</p>
        </div>

        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
          <div style={{ width: '100%', maxWidth: '400px' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--navy)', marginBottom: '30px' }}>Technician Login</h2>
            {error && <div style={{ background: '#fee2e2', color: '#dc2626', padding: '15px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.9rem' }}>{error}</div>}
            
            <form onSubmit={handleLogin} style={{ display: 'grid', gap: '20px' }}>
              <input 
                type="email" 
                placeholder="Staff Email"
                required
                style={{ width: '100%', padding: '15px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc' }}
                value={formData.userEmail}
                onChange={(e) => setFormData({...formData, userEmail: e.target.value})}
              />
              <input 
                type="password" 
                placeholder="Staff Password"
                required
                style={{ width: '100%', padding: '15px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc' }}
                value={formData.userPassword}
                onChange={(e) => setFormData({...formData, userPassword: e.target.value})}
              />
              <button type="submit" disabled={loading} className="btn btn-crimson" style={{ padding: '16px', borderRadius: '12px', justifyContent: 'center' }}>
                {loading ? 'Authenticating...' : 'Access My Tasks'}
              </button>
            </form>

            <div style={{ marginTop: '30px', textAlign: 'center', color: '#666', fontSize: '0.9rem' }}>
              Newly Appointed Technician? <Link to="/register?role=technician" style={{ color: 'var(--navy)', fontWeight: '800', textDecoration: 'none' }}>Register Here</Link>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default TechnicianLoginPage;
