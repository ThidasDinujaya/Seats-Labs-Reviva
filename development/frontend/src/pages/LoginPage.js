import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const LoginPage = () => {
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
      const response = await login(formData);
      if (response.data.userRole === 'customer') {
        navigate('/customer');
      } else {
        // If staff try to login here, we can either redirect them to their portal 
        // or just redirect to their dashboard, but the user said "Don't redirect it into the customer portal"
        // Let's ensure they go to their specific dashboard directly to avoid the "customer" feel.
        const role = response.data.userRole;
        navigate(`/${role}`);
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
        {/* Left Side: Branding/Imagery */}
        <div style={{ 
          flex: 1, 
          background: 'linear-gradient(rgba(0, 47, 108, 0.9), rgba(0, 47, 108, 0.9)), url("https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&q=80&w=1600")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '80px',
          color: 'white'
        }}>
          <h1 style={{ fontSize: '3.5rem', fontWeight: '800', marginBottom: '20px' }}>Welcome Back to<br/><span style={{ color: 'var(--crimson)' }}>SEATSLABS</span></h1>
          <p style={{ fontSize: '1.2rem', maxWidth: '500px', opacity: 0.9, marginBottom: '40px' }}>
            Access your service history, track ongoing repairs, and manage your vehicle fleet in one secure location.
          </p>
          <div style={{ display: 'flex', gap: '20px' }}>
             <div style={{ borderLeft: '3px solid var(--crimson)', paddingLeft: '20px' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: '800' }}>10k+</div>
                <div style={{ fontSize: '0.8rem', opacity: 0.7, textTransform: 'uppercase' }}>Services Completed</div>
             </div>
             <div style={{ borderLeft: '3px solid var(--crimson)', paddingLeft: '20px' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: '800' }}>4.9/5</div>
                <div style={{ fontSize: '0.8rem', opacity: 0.7, textTransform: 'uppercase' }}>Avg. Rating</div>
             </div>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
          <div style={{ width: '100%', maxWidth: '420px' }}>
            <div style={{ marginBottom: '40px' }}>
              <h2 style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--navy)', marginBottom: '10px' }}>Enter Your Garage</h2>
              <p style={{ color: '#666' }}>Secure login for customers and staff members.</p>
            </div>

            {error && <div style={{ background: '#fee2e2', color: '#dc2626', padding: '15px', borderRadius: '4px', marginBottom: '25px', fontSize: '0.9rem', fontWeight: '600' }}>{error}</div>}

            <form onSubmit={handleLogin} style={{ display: 'grid', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', fontSize: '0.85rem', color: 'var(--navy)' }}>EMAIL ADDRESS</label>
                <input 
                  type="email" 
                  placeholder="name@example.com"
                  required
                  style={{ width: '100%', padding: '14px', borderRadius: '14px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '1rem', outline: 'none' }}
                  value={formData.userEmail}
                  onChange={(e) => setFormData({...formData, userEmail: e.target.value})}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', fontSize: '0.85rem', color: 'var(--navy)' }}>SECURE PASSWORD</label>
                <input 
                  type="password" 
                  placeholder="••••••••"
                  required
                  style={{ width: '100%', padding: '14px', borderRadius: '14px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '1rem', outline: 'none' }}
                  value={formData.userPassword}
                  onChange={(e) => setFormData({...formData, userPassword: e.target.value})}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', padding: '10px 0' }}>
                <Link to="/coming-soon" style={{ fontSize: '0.85rem', color: 'var(--crimson)', textDecoration: 'none', fontWeight: '700' }}>Forgot password?</Link>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="btn btn-crimson" 
                style={{ width: '100%', padding: '16px', borderRadius: '14px', justifyContent: 'center' }}
              >
                {loading ? 'Authenticating...' : 'Access My Garage'}
              </button>
            </form>

            <div style={{ marginTop: '30px', textAlign: 'center', color: '#666', fontSize: '0.9rem' }}>
              New to SeatsLabs? <Link to="/register" style={{ color: 'var(--navy)', fontWeight: '800', textDecoration: 'none' }}>Create an Account</Link>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default LoginPage;
