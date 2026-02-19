import React, { useState, useEffect } from 'react';

const Advertisement = ({ type, height = 'auto', width = '100%', interval = 5000, style = {} }) => {
  const [currentAdIndex, setCurrentAdIndex] = useState(0);

  // Mock data for 5 ads per placement
  const ads = [
    { id: 1, title: 'Expert Lubrication', subtitle: 'Keep your engine smooth' },
    { id: 2, title: 'Brake Safety Pack', subtitle: 'Stop with confidence' },
    { id: 3, title: 'Premium Car Wash', subtitle: 'Sri Lanka\'s finest grooming' },
    { id: 4, title: 'Hybrid Care', subtitle: 'Specialized battery health' },
    { id: 5, title: 'AC Refresh', subtitle: 'Stay cool on the road' }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentAdIndex((prevIndex) => (prevIndex + 1) % ads.length);
    }, interval);

    return () => clearInterval(timer);
  }, [ads.length, interval]);

  const getStyles = () => {
    switch (type) {
      case 'Homepage Banner':
        return {
          height: '250px',
          background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
          margin: '40px 0',
          borderRadius: '12px',
          border: '1px dashed #cbd5e1'
        };
      case 'Bottom Banner':
        return {
          height: '280px',
          background: 'linear-gradient(90deg, #f1f5f9 0%, #ffffff 100%)',
          margin: '40px 0',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
        };
      case 'Sidebar':
        return {
          height: '600px',
          width: '300px',
          background: '#f1f5f9',
          borderRadius: '8px',
          padding: '20px',
          border: '1px solid #e2e8f0'
        };
      case 'Square':
        return {
          width: '100%',
          maxWidth: '350px',
          aspectRatio: '1/1',
          background: '#f1f5f9',
          borderRadius: '8px',
          padding: '20px',
          border: '1px solid #e2e8f0'
        };
      case 'Tower':
        return {
          height: '700px',
          width: '180px',
          background: '#ffffff',
          borderRadius: '8px',
          padding: '20px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
          zIndex: 10
        };
      case 'Feature Ad':
        return {
          height: '100%',
          background: '#ffffff',
          borderRadius: '8px',
          padding: '20px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
        };
      default:
        return {
          height: height,
          width: width,
          background: '#f8fafc',
          borderRadius: '8px',
          border: '1px solid #e2e8f0'
        };
    }
  };

  const ad = ads[currentAdIndex];

  return (
    <div className="ad-placement" style={{ 
      ...getStyles(), 
      ...style,
      position: style.position || getStyles().position || 'relative',
      display: 'flex', 
      flexDirection: 'column', 
      justifyContent: 'center', 
      alignItems: 'center', 
      textAlign: 'center',
      overflow: 'hidden'
    }}>
      <div style={{ position: 'absolute', top: '10px', right: '15px', color: '#94a3b8', fontSize: '0.7rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>
        Sponsored
      </div>
      
      <div key={ad.id}>
        <div style={{ color: '#1e293b', fontSize: '1.1rem', fontWeight: 'bold' }}>
          {ad.title}
        </div>
        <div style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '5px' }}>
          {ad.subtitle}
        </div>
      </div>

      <div style={{ position: 'absolute', bottom: '15px', display: 'flex', gap: '6px' }}>
        {ads.map((_, index) => (
          <div 
            key={index} 
            style={{ 
              width: '6px', 
              height: '6px', 
              borderRadius: '50%', 
              background: index === currentAdIndex ? 'var(--crimson)' : '#cbd5e1',
              transition: 'background 0.3s'
            }} 
          />
        ))}
      </div>

      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(5px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}
      </style>
    </div>
  );
};

export default Advertisement;
