import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { settingsApi } from '../api/api';

const Footer = () => {
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
        console.error('Footer settings load error:', err);
      }
    };
    fetchSettings();
  }, []);
  return (
    <footer>
      <div className="container">
        <div className="footer-grid">
          <div>
            <div className="logo" style={{ color: 'white', marginBottom: '20px' }}>SEATS<span>LABS</span></div>
            <p style={{ opacity: 0.7, fontSize: '0.9rem' }}>
              Your trusted Sri Lankan partner in automotive excellence. We treat your vehicle as if it were our own.
            </p>
          </div>
          <div>
            <div className="footer-h">Quick Access</div>
            <ul className="footer-links">
              <li><Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>Home</Link></li>
              <li><Link to="/about" style={{ color: 'inherit', textDecoration: 'none' }}>Our Team</Link></li>
              <li><Link to="/contact" style={{ color: 'inherit', textDecoration: 'none' }}>Careers</Link></li>
              <li><Link to="/reviews" style={{ color: 'inherit', textDecoration: 'none' }}>Privacy Policy</Link></li>
            </ul>
          </div>
          <div>
            <div className="footer-h">Staff Portals</div>
            <ul className="footer-links">
              <li><Link to="/manager/login" style={{ color: 'inherit', textDecoration: 'none' }}>Manager Portal</Link></li>
              <li><Link to="/technician/login" style={{ color: 'inherit', textDecoration: 'none' }}>Technician Portal</Link></li>
              <li><Link to="/advertiser/login" style={{ color: 'inherit', textDecoration: 'none' }}>Advertiser Portal</Link></li>
            </ul>
          </div>
          <div>
            <div className="footer-h">Contact</div>
            <ul className="footer-links" id="footer-contact">
              <li>Hotline: {settings.contact_phone || '011 234 5678'}</li>
              <li>Workshop: {settings.contact_address || '123 Automotive Way, Colombo 07'}</li>
              <li style={{ color: 'var(--crimson)', fontWeight: '800' }}>Email: {settings.contact_email || 'contact@seatslabs.com'}</li>
            </ul>
          </div>
        </div>
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px', textAlign: 'center', opacity: 0.5, fontSize: '0.8rem' }}>
          &copy; {new Date().getFullYear()} SeatsLabs Auto Repair Sri Lanka. All Rights Reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
