import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import TopBar from './TopBar';

const Navbar = () => {
  const { user } = useAuth();

  return (
    <>
      <TopBar />
      <nav className="container navbar">
        <Link to="/" className="logo">SEATS<span>LABS</span></Link>
        <div className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/about">About Us</Link>
          <Link to="/services">Our Services</Link>
          <Link to="/book">Book Now</Link>
          <Link to="/reviews">Reviews</Link>
          <Link to="/contact">Contact Us</Link>
        </div>
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          {!user ? (
            <>
              <Link to="/login" style={{ color: 'var(--navy)', fontWeight: '700', textDecoration: 'none' }}>Login</Link>
              <Link to="/register" className="btn btn-crimson" style={{ padding: '10px 20px', fontSize: '0.85rem' }}>
                Register
              </Link>
            </>
          ) : (
            <Link
              to={user.userRole === 'customer' ? '/dashboard' : '/manager'}
              className="btn btn-crimson"
              style={{ padding: '10px 20px', fontSize: '0.85rem' }}
            >
              Profile
            </Link>
          )}
        </div>
      </nav>
    </>
  );
};

export default Navbar;
