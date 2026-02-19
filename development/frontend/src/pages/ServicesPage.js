import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Advertisement from '../components/Advertisement';
import { serviceApi } from '../api/api';

const ServicesPage = () => {
  const [categories, setCategories] = useState([]);
  const [services, setServices] = useState([]);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catsRes, servsRes, pkgsRes] = await Promise.all([
          serviceApi.getCategory(),
          serviceApi.getAll(),
          serviceApi.getPackage()
        ]);
        
        // Handle potential response structures (array or object with data property)
        // Filter to show only ACTIVE items to customers
        setCategories((Array.isArray(catsRes) ? catsRes : catsRes.data || []).filter(c => c.serviceCategoryIsActive));
        setServices((Array.isArray(servsRes) ? servsRes : servsRes.data || []).filter(s => s.serviceIsActive));
        setPackages((Array.isArray(pkgsRes) ? pkgsRes : pkgsRes.data || []).filter(p => p.servicePackageIsActive));
      } catch (error) {
        console.error("Failed to fetch services data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getCategoryIcon = (name) => {
    // Safety check just in case name is undefined
    if (!name) return 'fi fi-rr-wrench';
    const lowerName = name.toLowerCase();
    if (lowerName.includes('maintenance')) return 'fi fi-rr-settings';
    if (lowerName.includes('repair')) return 'fi fi-rr-car-mechanic';
    if (lowerName.includes('inspection') || lowerName.includes('diagnostic')) return 'fi fi-rr-dashboard';
    if (lowerName.includes('detail') || lowerName.includes('wash')) return 'fi fi-rr-paint-roller';
    return 'fi fi-rr-wrench'; // Default
  };

  const getServicesByCategory = (catId) => {
    return services.filter(s => s.serviceCategoryId === catId);
  };

  return (
    <div className="services-page">
      <Navbar />
      
      <header className="page-hero" style={{ padding: '80px 0', background: 'var(--navy)', color: 'white', textAlign: 'center' }}>
        <div className="container">
          <h1 style={{ fontSize: '3.5rem', marginBottom: '10px' }}>Our Services</h1>
          <p style={{ opacity: 0.8 }}>Professional Automotive Care Categorized for You</p>
        </div>
      </header>

      <section id="services" style={{ padding: '100px 0', background: '#f8fafc' }}>
        <div className="container" style={{ display: 'flex', gap: '40px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
          <div style={{ flex: '3 1 600px' }}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>Loading services...</div>
            ) : (
              <div className="services-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '40px' }}>
                
                {/* Dynamic Category Cards */}
                {categories.map(category => {
                  const categoryServices = getServicesByCategory(category.serviceCategoryId);
                  if (categoryServices.length === 0) return null; // Skip empty categories

                  return (
                    <div key={category.serviceCategoryId} className="service-card" style={{ padding: '0', overflow: 'hidden', border: '1px solid var(--bg-gray-mid)', background: 'white' }}>
                      <div style={{ backgroundColor: 'var(--navy)', color: 'white', padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <i className={getCategoryIcon(category.serviceCategoryName)} style={{ fontSize: '1.8rem', color: 'white', margin: 0 }}></i>
                        <h3 style={{ margin: 0, color: 'white' }}>{category.serviceCategoryName}</h3>
                      </div>
                      <ul style={{ listStyle: 'none', padding: '2rem' }}>
                        {categoryServices.map(service => (
                          <li key={service.serviceId} style={{ marginBottom: '1rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
                            <span>{service.serviceName}</span>
                            <span style={{ color: 'var(--crimson)', fontWeight: '700' }}>
                              Rs. {Number(service.servicePrice).toLocaleString()}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}

                {packages.map(pkg => (
                  <div key={pkg.servicePackageId} className="service-card" style={{ padding: '0', overflow: 'hidden', border: '1px solid var(--bg-gray-mid)', background: 'white' }}>
                    <div style={{ backgroundColor: 'var(--crimson)', color: 'white', padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <i className="fi fi-rr-box-alt" style={{ fontSize: '1.8rem', color: 'white', margin: 0 }}></i>
                      <h3 style={{ margin: 0, color: 'white' }}>{pkg.servicePackageName}</h3>
                    </div>
                    <div style={{ padding: '2rem' }}>
                       <p style={{ color: '#64748b', marginBottom: '20px', minHeight: '60px' }}>{pkg.servicePackageDescription}</p>
                       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '20px' }}>
                          <span style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--navy)' }}>Package Price</span>
                          <span style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--crimson)' }}>
                            Rs. {Number(pkg.servicePackagePrice).toLocaleString()}
                          </span>
                       </div>
                       <button 
                         className="btn btn-crimson" 
                         style={{ width: '100%', marginTop: '20px', justifyContent: 'center' }}
                         onClick={() => window.location.href = '/book'}
                       >
                         Book Package
                       </button>
                    </div>
                  </div>
                ))}

              </div>
            )}
          </div>
          
          <aside style={{ flex: '1 1 300px' }}>
            <div>
              <Advertisement type="Square" />
              <div style={{ marginTop: '20px', padding: '20px', background: 'white', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <h4 style={{ color: 'var(--navy)', marginBottom: '15px' }}>Need Help?</h4>
                <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '15px' }}>Contact our service advisors for personalized assistance and custom quotes.</p>
                <button style={{ width: '100%', padding: '10px', background: 'var(--crimson)', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                  Call Now
                </button>
              </div>
            </div>
          </aside>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ServicesPage;
