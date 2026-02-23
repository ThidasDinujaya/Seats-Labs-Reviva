import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Advertisement from '../components/Advertisement';

const AboutPage = () => {
  return (
    <div className="about-page">
      <Navbar />

      <header className="page-hero" style={{ padding: '80px 0', background: 'var(--navy)', color: 'white', textAlign: 'center' }}>
        <div className="container">
          <h1 style={{ fontSize: '3.5rem', marginBottom: '10px' }}>About Us</h1>
          <p style={{ opacity: 0.8 }}>Trusted Automotive Experts Since 2012</p>
        </div>
      </header>

      <section className="about-content" style={{ padding: '100px 0' }}>
        <div className="container" style={{ display: 'flex', gap: '60px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
          <div style={{ flex: '2 1 600px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', alignItems: 'center' }}>
            <div>
              <img
                src="https://images.unsplash.com/photo-1517524206127-48bbd363f3d7?auto=format&fit=crop&q=80&w=1000"
                alt="Our Workshop"
                style={{ width: '100%', borderRadius: '8px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
              />
            </div>
            <div>
              <div className="logo" style={{ marginBottom: '20px' }}>SEATS<span>LABS</span> DIFFERENCE</div>
              <h2 style={{ fontSize: '2.4rem', color: 'var(--navy)', fontWeight: '800', marginBottom: '20px' }}>Take the Stress Out of Car Repair</h2>
              <p style={{ marginBottom: '25px', color: '#444' }}>
                We know that car trouble can be stressful. That’s why we focus on transparency.
                Our certified technicians will walk you through every repair, provide digital photos
                of the issues, and offer competitive pricing with no hidden surprises.
              </p>
              <ul style={{ listStyle: 'none', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <li style={{ fontWeight: '700' }}><i className="fi fi-rr-check-circle" style={{ color: 'var(--crimson)' }}></i> Nationwide Warranty</li>
                <li style={{ fontWeight: '700' }}><i className="fi fi-rr-check-circle" style={{ color: 'var(--crimson)' }}></i> Free Safety Inspection</li>
                <li style={{ fontWeight: '700' }}><i className="fi fi-rr-check-circle" style={{ color: 'var(--crimson)' }}></i> Shuttle Service Available</li>
                <li style={{ fontWeight: '700' }}><i className="fi fi-rr-check-circle" style={{ color: 'var(--crimson)' }}></i> Certified Parts</li>
              </ul>
            </div>
          </div>

          <aside style={{ flex: '1 1 300px' }}>
            <div>
              <Advertisement type="Sidebar" />
            </div>
          </aside>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AboutPage;
