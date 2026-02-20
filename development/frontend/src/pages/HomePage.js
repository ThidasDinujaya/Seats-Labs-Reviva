import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Advertisement from '../components/Advertisement';
import { useAuth } from '../context/AuthContext';

const HomePage = () => {
  const { user } = useAuth();

  return (
    <div className="homepage">
      <Navbar />

      {/* Hero Section */}
      <header className="hero" style={{ height: '80vh', display: 'flex', alignItems: 'center' }}>
        <div className="container">
          <div style={{ textTransform: 'uppercase', letterSpacing: '3px', fontWeight: '700', color: 'var(--crimson)', marginBottom: '10px' }}>
            Trusted Automotive Experts Since 2012
          </div>
          <h1 style={{ fontSize: '4.5rem', lineHeight: '1.1' }}>Honest Repairs,<br/>Exceptional Service</h1>
          <p style={{ fontSize: '1.25rem', maxWidth: '600px', margin: '20px auto 40px' }}>
            From routine maintenance to complex engine diagnostics, SEATSLABS provides the high-quality 
            service your vehicle deserves. Locally owned and operated in the heart of the community.
          </p>
          <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
            {!user ? (
              <Link to="/register" className="btn btn-crimson">Register</Link>
            ) : (
              <Link to={user.userRole === 'customer' ? '/dashboard' : '/manager'} className="btn btn-crimson">Book Now</Link>
            )}
            <Link to="/services" className="btn btn-outline" style={{ border: '2px solid white', color: 'white' }}>View Services</Link>
          </div>
        </div>
      </header>

      <div className="container">
        <Advertisement type="Homepage Banner" />
      </div>

      {/* Brand Coverage Banner */}
      <div className="brands-banner" style={{ background: 'var(--navy)', padding: '40px 0', color: 'white' }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.1)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ textAlign: 'right', fontWeight: '800', fontSize: '1.2rem' }}>
            WE SERVICE ALL MAKES & MODELS
          </div>
          <div style={{ textAlign: 'left', fontWeight: '500', opacity: 0.9 }}>
            Domestic | European | Asian | Luxury & Performance
          </div>
        </div>
      </div>

      <section style={{ padding: '80px 0 40px', background: 'white' }}>
        <div className="container" style={{ display: 'flex', gap: '40px', alignItems: 'center' }}>
          {/* Left Side Ad */}
          <div style={{ flex: '0 0 180px' }}>
            <Advertisement type="Tower" />
          </div>

          {/* Center Content */}
          <div style={{ flex: 1, textAlign: 'center' }}>
            <h2 style={{ fontSize: '2.5rem', color: 'var(--navy)', marginBottom: '20px' }}>Drive With Confidence</h2>
            <p style={{ maxWidth: '800px', margin: '0 auto 40px', fontSize: '1.1rem', color: '#666' }}>
              We understand how important your vehicle is to your daily life. That's why we've built a facility 
              that combines expert craftsmanship with a customer-first philosophy. Discover the SEATSLABS difference today.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
               <div style={{ padding: '30px', background: '#f8fafc', borderRadius: '8px' }}>
                  <i className="fi fi-rr-shield-check" style={{ fontSize: '2.5rem', color: 'var(--crimson)' }}></i>
                  <h3 style={{ marginTop: '20px', color: 'var(--navy)' }}>Guaranteed Quality</h3>
                  <p style={{ fontSize: '0.9rem' }}>We use only certified parts and stand behind our work with a nationwide warranty.</p>
               </div>
               
               <div style={{ padding: '30px', background: '#f8fafc', borderRadius: '8px' }}>
                  <i className="fi fi-rr-user-md" style={{ fontSize: '2.5rem', color: 'var(--crimson)' }}></i>
                  <h3 style={{ marginTop: '20px', color: 'var(--navy)' }}>Certified Experts</h3>
                  <p style={{ fontSize: '0.9rem' }}>Our technicians are highly trained and experienced in all makes and models.</p>
               </div>

               <div style={{ padding: '30px', background: '#f8fafc', borderRadius: '8px' }}>
                  <i className="fi fi-rr-time-fast" style={{ fontSize: '2.5rem', color: 'var(--crimson)' }}></i>
                  <h3 style={{ marginTop: '20px', color: 'var(--navy)' }}>Fast Service</h3>
                  <p style={{ fontSize: '0.9rem' }}>We value your time and aim to get you back on the road as quickly as possible.</p>
               </div>
            </div>
          </div>

          {/* Right Side Ad */}
          <div style={{ flex: '0 0 180px' }}>
            <Advertisement type="Tower" />
          </div>
        </div>
      </section>

      <div className="container">
        <Advertisement type="Bottom Banner" />
      </div>

      <Footer />
    </div>
  );
};

export default HomePage;
