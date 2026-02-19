import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const ReviewsPage = () => {
  return (
    <div className="reviews-page">
      <Navbar />
      
      <header className="page-hero" style={{ padding: '80px 0', background: 'var(--navy)', color: 'white', textAlign: 'center' }}>
        <div className="container">
          <h1 style={{ fontSize: '3.5rem', marginBottom: '10px' }}>Customer Reviews</h1>
          <p style={{ opacity: 0.8 }}>Real Stories from Real Sri Lankan Drivers</p>
        </div>
      </header>

      <section id="reviews" style={{ padding: '100px 0' }}>
        <div className="container">
          <div className="grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
            <div className="testi-card" style={{ background: '#f8fafc', padding: '2rem', borderRadius: '8px' }}>
              "Finally found a shop in Colombo that doesn't try to upsell me things I don't need. They showed me exactly what was wrong on a tablet. Highly recommend!"
              <div style={{ marginTop: '20px', fontWeight: '800', color: 'var(--navy)' }}>- Samantha R.</div>
            </div>
            <div className="testi-card" style={{ background: '#f8fafc', padding: '2rem', borderRadius: '8px' }}>
              "The best service in town. They had my hybrid battery fixed in 48 hours and the price was exactly as quoted. Genuine people."
              <div style={{ marginTop: '20px', fontWeight: '800', color: 'var(--navy)' }}>- David M.</div>
            </div>
            <div className="testi-card" style={{ background: '#f8fafc', padding: '2rem', borderRadius: '8px' }}>
              "I take all three of our family cars here. They keep the records digital so I never have to worry about what's been done. 10/10."
              <div style={{ marginTop: '20px', fontWeight: '800', color: 'var(--navy)' }}>- Jason K.</div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ReviewsPage;
