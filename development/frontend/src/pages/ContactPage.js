import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { settingsApi } from '../api/api';

const ContactPage = () => {
  const [settings, setSettings] = useState({});

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await settingsApi.getAll();
        if (res.success) {
          const settingsMap = res.data.reduce((acc, s) => ({ ...acc, [s.settingKey]: s.settingValue }), {});
          setSettings(settingsMap);
        }
      } catch (err) {
        console.error('Contact settings load error:', err);
      }
    };
    fetchSettings();
  }, []);
  return (
    <div className="contact-page">
      <Navbar />
      
      <header className="page-hero" style={{ padding: '80px 0', background: 'var(--navy)', color: 'white', textAlign: 'center' }}>
        <div className="container">
          <h1 style={{ fontSize: '3.5rem', marginBottom: '10px' }}>Contact Us</h1>
          <p style={{ opacity: 0.8 }}>Get in Touch with Our Experts</p>
        </div>
      </header>

      <section style={{ padding: '100px 0' }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px' }}>
          <div>
            <h2 style={{ fontSize: '2rem', color: 'var(--navy)', marginBottom: '30px' }}>Visit Our Workshop</h2>
            <div style={{ marginBottom: '40px' }}>
              <h4 style={{ color: 'var(--crimson)', marginBottom: '10px' }}>MAIN ADDRESS:</h4>
              <p style={{ fontSize: '1.2rem', fontWeight: '700' }}>{settings.contact_address || 'No. 123, Automotive Way, Colombo 07, Sri Lanka'}</p>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <h4 style={{ color: 'var(--crimson)', marginBottom: '10px' }}>PHONE:</h4>
                <p>Hotline: {settings.contact_phone || '011 234 5678'}</p>
                <p>Emergency Support available 24/7</p>
              </div>
              <div>
                <h4 style={{ color: 'var(--crimson)', marginBottom: '10px' }}>EMAIL:</h4>
                <p>{settings.contact_email || 'contact@seatslabs.com'}</p>
                <p>support@seatslabs.lk</p>
              </div>
            </div>

            <div style={{ marginTop: '40px' }}>
              <h4 style={{ color: 'var(--crimson)', marginBottom: '10px' }}>HOURS OF OPERATION:</h4>
              <p>{settings.contact_opening_hours || 'Mon - Sat: 8:00 AM - 6:00 PM'}</p>
            </div>
          </div>
          
          <div style={{ background: '#f8fafc', padding: '40px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '20px', color: 'var(--navy)' }}>Send a Message</h2>
            <form style={{ display: 'grid', gap: '20px' }}>
              <input type="text" placeholder="senderName" style={{ padding: '12px', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
              <input type="email" placeholder="senderEmail" style={{ padding: '12px', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
              <input type="text" placeholder="enquirySubject" style={{ padding: '12px', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
              <textarea placeholder="enquiryMessage" rows="5" style={{ padding: '12px', borderRadius: '4px', border: '1px solid #cbd5e1' }}></textarea>
              <button type="button" className="btn btn-crimson" style={{ width: '100%' }}>Send Message</button>
            </form>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ContactPage;
