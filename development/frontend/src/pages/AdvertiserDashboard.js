import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SidebarLayout from '../components/SidebarLayout';
import { advertisementApi, campaignApi } from '../api/api';
import { useAuth } from '../context/AuthContext';
import { Image as ImageIcon, Trash2, Plus, FolderPlus, Eye } from 'lucide-react';

const AdvertiserDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('ads');
  const [ads, setAds] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [placements, setPlacements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showAdForm, setShowAdForm] = useState(false);
  const [showCampaignForm, setShowCampaignForm] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  
  const [adFormData, setAdFormData] = useState({
    advertisementTitle: '',
    advertisementImageUrl: '',
    advertisementStartDate: '',
    advertisementEndDate: '',
    advertisementPlacementId: '',
  });

  const [campaignFormData, setCampaignFormData] = useState({
    advertisementCampaignName: '',
    advertisementCampaignDescription: '',
    advertisementCampaignStartDate: '',
    advertisementCampaignEndDate: '',
  });

  useEffect(() => {
    fetchAds();
    fetchCampaigns();
    fetchPlacements();
  }, [user]);

  const fetchAds = async () => {
    try {
      setLoading(true);
      const res = await advertisementApi.getAll(); 
      if (res.success) {
        // Filter only standalone ads (no campaign)
        setAds(res.data.filter(ad => !ad.advertisementCampaignId));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCampaigns = async () => {
    try {
      const res = await campaignApi.getAll();
      if (res.success) setCampaigns(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchPlacements = async () => {
    try {
      // For demonstration with requested data, using hardcoded values
      const mockPlacements = [
        { advertisementPlacementId: 1, advertisementPlacementName: 'Homepage Banner', advertisementPlacementPrice: '5000.00' },
        { advertisementPlacementId: 2, advertisementPlacementName: 'Sidebar', advertisementPlacementPrice: '2500.00' },
        { advertisementPlacementId: 3, advertisementPlacementName: 'Footer', advertisementPlacementPrice: '1500.00' },
        { advertisementPlacementId: 4, advertisementPlacementName: 'Booking Page', advertisementPlacementPrice: '3500.00' }
      ];
      setPlacements(mockPlacements);
      
      // Attempt to fetch from API as well
      const res = await advertisementApi.getPlacements();
      if (res.success && res.data.length > 0) setPlacements(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAdInputChange = (e) => {
    setAdFormData({ ...adFormData, [e.target.name]: e.target.value });
  };

  const handleCampaignInputChange = (e) => {
    setCampaignFormData({ ...campaignFormData, [e.target.name]: e.target.value });
  };

  const calculateAdCost = () => {
    if (!adFormData.advertisementPlacementId || !adFormData.advertisementStartDate || !adFormData.advertisementEndDate) return 0;
    const placement = placements.find(p => p.advertisementPlacementId === parseInt(adFormData.advertisementPlacementId));
    if (!placement) return 0;
    
    const start = new Date(adFormData.advertisementStartDate);
    const end = new Date(adFormData.advertisementEndDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    
    return (parseFloat(placement.advertisementPlacementPrice) * Math.max(1, diffDays)).toFixed(2);
  };

  const handleAdSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        ...adFormData,
        advertiserId: user.advertiserId || user.userId // Ensure correct ID mapping
      };

      const res = await advertisementApi.create(payload);
      if (res.success) {
        alert("Standalone Ad Submitted Successfully! Redirecting to payment...");
        const newAdId = res.data.advertisementId;
        setShowAdForm(false);
        setAdFormData({ advertisementTitle: '', advertisementImageUrl: '', advertisementStartDate: '', advertisementEndDate: '', advertisementPlacementId: '' });
        navigate(`/payment/ad/${newAdId}`); // Using navigate from react-router-dom
      } else {
        alert("Failed to create ad");
      }
    } catch (err) {
      console.error(err);
      alert("Error submitting ad");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCampaignSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        ...campaignFormData,
        advertiserId: user.advertiserId || user.userId,
      };

      const res = await campaignApi.create(payload);
      if (res.success) {
        alert("Campaign Created Successfully!");
        setShowCampaignForm(false);
        fetchCampaigns();
        setCampaignFormData({ advertisementCampaignName: '', advertisementCampaignDescription: '', advertisementCampaignStartDate: '', advertisementCampaignEndDate: '' });
      } else {
        alert("Failed to create campaign");
      }
    } catch (err) {
      console.error(err);
      alert("Error submitting campaign");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAd = async (id) => {
    if(window.confirm('Are you sure you want to delete this ad?')) {
      try {
        await advertisementApi.delete(id);
        fetchAds();
      } catch(e) {
        console.error(e);
        alert('Failed to delete ad');
      }
    }
  };

  const handleDeleteCampaign = async (id) => {
    if(window.confirm('Are you sure you want to delete this campaign?')) {
      try {
        await campaignApi.delete(id);
        fetchCampaigns();
      } catch(e) {
        console.error(e);
        alert('Failed to delete campaign');
      }
    }
  };

  const viewCampaignDetails = async (campaignId) => {
    try {
      const res = await campaignApi.getById(campaignId);
      if (res.success) {
        setSelectedCampaign(res.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <SidebarLayout role="advertiser">
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--navy)' }}>Ad Management</h1>
        <p style={{ color: '#666' }}>Create standalone ads or multi-ad campaigns.</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '20px', borderBottom: '1px solid #e2e8f0', marginBottom: '30px' }}>
        <button 
          onClick={() => { setActiveTab('ads'); setSelectedCampaign(null); }}
          style={{
            padding: '10px 20px',
            color: activeTab === 'ads' ? 'var(--navy)' : '#64748b',
            fontWeight: '600',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'ads' ? '3px solid var(--navy)' : '3px solid transparent',
            cursor: 'pointer'
          }}
        >
          Ads
        </button>
        <button 
          onClick={() => { setActiveTab('campaigns'); setShowAdForm(false); }}
          style={{
            padding: '10px 20px',
            color: activeTab === 'campaigns' ? 'var(--navy)' : '#64748b',
            fontWeight: '600',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'campaigns' ? '3px solid var(--navy)' : '3px solid transparent',
            cursor: 'pointer'
          }}
        >
          Ad Campaigns
        </button>
      </div>

      {/* ADS TAB */}
      {activeTab === 'ads' && (
        <>
          {!showAdForm ? (
            <>
              <button 
                onClick={() => setShowAdForm(true)}
                style={{ 
                  marginBottom: '20px', 
                  padding: '12px 24px', 
                  background: 'var(--navy)', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '8px', 
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontWeight: '600'
                }}
              >
                <Plus size={20}/> Create Standalone Ad
              </button>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                {ads.length === 0 ? (
                  <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px', color: '#94a3b8', background: 'white', borderRadius: '8px' }}>
                    No standalone ads found. Create your first ad!
                    {loading && <div style={{marginTop: '10px'}}>Loading...</div>}
                  </div>
                ) : (
                  ads.map(ad => (
                    <AdCard key={ad.advertisementId} ad={ad} onDelete={handleDeleteAd} />
                  ))
                )}
              </div>
            </>
          ) : (
            <AdForm
              formData={adFormData}
              placements={placements}
              onChange={handleAdInputChange}
              onSubmit={handleAdSubmit}
              onCancel={() => setShowAdForm(false)}
              setFormData={setAdFormData}
              calculateCost={calculateAdCost}
              submitting={submitting}
            />
          )}
        </>
      )}

      {/* CAMPAIGNS TAB */}
      {activeTab === 'campaigns' && (
        <>
          {!showCampaignForm && !selectedCampaign ? (
            <>
              <button 
                onClick={() => setShowCampaignForm(true)}
                style={{ 
                  marginBottom: '20px', 
                  padding: '12px 24px', 
                  background: 'var(--navy)', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '8px', 
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontWeight: '600'
                }}
              >
                <FolderPlus size={20}/> Create Campaign
              </button>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
                {campaigns.length === 0 ? (
                  <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px', color: '#94a3b8', background: 'white', borderRadius: '8px' }}>
                    No campaigns found. Create a campaign with multiple ads!
                  </div>
                ) : (
                  campaigns.map(campaign => (
                    <CampaignCard 
                      key={campaign.advertisementCampaignId} 
                      campaign={campaign} 
                      onDelete={handleDeleteCampaign}
                      onView={viewCampaignDetails}
                    />
                  ))
                )}
              </div>
            </>
          ) : showCampaignForm ? (
            <CampaignForm
              formData={campaignFormData}
              onChange={handleCampaignInputChange}
              onSubmit={handleCampaignSubmit}
              onCancel={() => setShowCampaignForm(false)}
              submitting={submitting}
            />
          ) : (
            <CampaignDetails 
              campaign={selectedCampaign} 
              onBack={() => setSelectedCampaign(null)}
              placements={placements}
              user={user}
              refreshCampaigns={fetchCampaigns}
            />
          )}
        </>
      )}
    </SidebarLayout>
  );
};

// ===== Ad Card Component =====
const AdCard = ({ ad, onDelete }) => {
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active': return { bg: '#ecfdf5', text: '#10b981' };
      case 'pending': return { bg: '#fff7ed', text: '#f59e0b' };
      case 'rejected': return { bg: '#fef2f2', text: '#ef4444' };
      default: return { bg: '#f1f5f9', text: '#64748b' };
    }
  };

  const statusStyle = getStatusColor(ad.advertisementStatus);

  return (
    <div style={{ background: 'white', borderRadius: '16px', overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'default' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
      <div style={{ height: '160px', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', borderBottom: '1px solid #f1f5f9' }}>
        {ad.advertisementImageUrl ? (
          <img src={ad.advertisementImageUrl} alt={ad.advertisementTitle} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <ImageIcon size={48} color="#cbd5e1" />
        )}
        <div style={{ position: 'absolute', top: '12px', right: '12px', padding: '4px 12px', borderRadius: '20px', background: statusStyle.bg, color: statusStyle.text, fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          {ad.advertisementStatus}
        </div>
      </div>
      <div style={{ padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#1e293b', margin: 0, lineHeight: '1.2' }}>{ad.advertisementTitle}</h3>
        </div>
        <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '15px', fontWeight: '500' }}>{ad.advertisementPlacementName || 'General Placement'}</p>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', background: '#f8fafc', padding: '12px', borderRadius: '12px', marginBottom: '15px' }}>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#1e293b' }}>{ad.advertisementImpressions || 0}</div>
            <div style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase' }}>Impressions</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#1e293b' }}>{ad.advertisementClicks || 0}</div>
            <div style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase' }}>Clicks</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          {ad.invoiceStatus !== 'paid' && (
            <button 
              onClick={() => window.location.href = `/payment/ad/${ad.advertisementId}`}
              style={{ flex: 2, padding: '10px', background: 'var(--navy)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.9rem', fontWeight: '700' }}
            >
              Pay Now
            </button>
          )}
          <button onClick={() => onDelete(ad.advertisementId)} style={{ flex: 1, padding: '10px', background: 'white', color: '#ef4444', border: '1px solid #fecaca', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.9rem', fontWeight: '700', transition: '0.2s' }} onMouseOver={e => e.currentTarget.style.background = '#fef2f2'} onMouseOut={e => e.currentTarget.style.background = 'white'}>
            <Trash2 size={16}/> Remove
          </button>
        </div>
      </div>
    </div>
  );
};

// ===== Campaign Card Component =====
const CampaignCard = ({ campaign, onDelete, onView }) => {
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active': return { bg: '#ecfdf5', text: '#10b981' };
      case 'pending': return { bg: '#fff7ed', text: '#f59e0b' };
      default: return { bg: '#f1f5f9', text: '#64748b' };
    }
  };

  const statusStyle = getStatusColor(campaign.advertisementCampaignStatus);

  return (
    <div style={{ background: 'white', borderRadius: '16px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div style={{ padding: '4px 12px', borderRadius: '20px', background: statusStyle.bg, color: statusStyle.text, fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          {campaign.advertisementCampaignStatus}
        </div>
        <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: '600' }}>Starts {new Date(campaign.advertisementCampaignStartDate).toLocaleDateString()}</span>
      </div>
      
      <h3 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#1e293b', marginBottom: '8px' }}>{campaign.advertisementCampaignName}</h3>
      <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '20px', minHeight: '40px', lineHeight: '1.5' }}>{campaign.advertisementCampaignDescription || 'Accelerate your brand with targeted workshop placements.'}</p>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px', padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
        <div>
          <div style={{ fontSize: '1.2rem', fontWeight: '800', color: '#1e293b' }}>{campaign.totalAds || 0}</div>
          <div style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase' }}>Total Ads</div>
        </div>
        <div>
          <div style={{ fontSize: '1.2rem', fontWeight: '800', color: '#10b981' }}>{campaign.activeAds || 0}</div>
          <div style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase' }}>Active</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginTop: 'auto' }}>
        <button onClick={() => onView(campaign.advertisementCampaignId)} style={{ flex: 1, padding: '12px', background: '#f0f9ff', color: '#0369a1', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontWeight: '700', transition: '0.2s' }} onMouseOver={e => e.currentTarget.style.background = '#e0f2fe'} onMouseOut={e => e.currentTarget.style.background = '#f0f9ff'}>
          <Eye size={18}/> Manage
        </button>
        <button onClick={() => onDelete(campaign.advertisementCampaignId)} style={{ padding: '12px', background: 'white', color: '#94a3b8', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: '0.2s' }} onMouseOver={e => e.currentTarget.style.color = '#ef4444'} onMouseOut={e => e.currentTarget.style.color = '#94a3b8'}>
          <Trash2 size={18}/>
        </button>
      </div>
    </div>
  );
};

// ===== Ad Form Component (continued in next message) =====
const AdForm = ({ formData, placements, onChange, onSubmit, onCancel, setFormData, calculateCost, submitting }) => (
  <div style={{ maxWidth: '800px', margin: '0 auto' }}>
    <div style={{ background: 'white', padding: '40px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
      <h3 style={{ marginBottom: '20px', color: 'var(--navy)', textAlign: 'center' }}>Create Standalone Ad</h3>
      <form onSubmit={onSubmit}>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#475569' }}>Ad Title</label>
          <input 
            type="text" 
            name="advertisementTitle"
            value={formData.advertisementTitle}
            onChange={onChange}
            required
            placeholder="e.g., Summer Sale Promo"
            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#475569' }}>Image URL</label>
          <input 
            type="url" 
            name="advertisementImageUrl"
            value={formData.advertisementImageUrl}
            onChange={onChange}
            placeholder="https://example.com/banner.jpg"
            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#475569' }}>Select Placement</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px' }}>
            {placements.map(p => (
              <div 
                key={p.advertisementPlacementId}
                onClick={() => setFormData({...formData, advertisementPlacementId: p.advertisementPlacementId})}
                style={{ 
                  padding: '15px', 
                  borderRadius: '8px', 
                  border: formData.advertisementPlacementId === p.advertisementPlacementId ? '2px solid var(--navy)' : '1px solid #cbd5e1',
                  cursor: 'pointer',
                  background: formData.advertisementPlacementId === p.advertisementPlacementId ? '#f0f9ff' : 'white',
                  transition: '0.2s'
                }}
              >
                <div style={{ fontWeight: '700', color: 'var(--navy)' }}>{p.advertisementPlacementName}</div>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Rs. {p.advertisementPlacementPrice} / day</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '25px', marginBottom: '30px', justifyContent: 'center' }}>
          <div style={{ flex: 1, maxWidth: '280px' }}>
            <label style={{ display: 'block', marginBottom: '10px', fontWeight: '700', color: '#1e293b', textAlign: 'center' }}>Start Date</label>
            <input 
              type="date" 
              name="advertisementStartDate"
              value={formData.advertisementStartDate}
              onChange={onChange}
              required
              style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '1rem', textAlign: 'center' }}
            />
          </div>
          <div style={{ flex: 1, maxWidth: '280px' }}>
            <label style={{ display: 'block', marginBottom: '10px', fontWeight: '700', color: '#1e293b', textAlign: 'center' }}>End Date</label>
            <input 
              type="date" 
              name="advertisementEndDate"
              value={formData.advertisementEndDate}
              onChange={onChange}
              required
              style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '1rem', textAlign: 'center' }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '15px' }}>
          <button 
            type="button"
            onClick={onCancel}
            style={{ 
              flex: 1, 
              padding: '15px', 
              background: '#f1f5f9', 
              color: '#64748b', 
              border: 'none', 
              borderRadius: '8px', 
              fontWeight: '700', 
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            disabled={submitting}
            style={{ 
              flex: 2, 
              padding: '15px', 
              background: 'var(--navy)', 
              color: 'white', 
              border: 'none', 
              borderRadius: '8px', 
              fontWeight: '700', 
              fontSize: '1rem',
              cursor: submitting ? 'wait' : 'pointer'
            }}
          >
            {submitting ? 'Submitting...' : 'Submit Ad'}
          </button>
        </div>
      </form>
    </div>
  </div>
);

// ===== Campaign Form Component =====
const CampaignForm = ({ formData, onChange, onSubmit, onCancel, submitting }) => (
  <div style={{ maxWidth: '700px', margin: '0 auto' }}>
    <div style={{ background: 'white', padding: '40px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
      <h3 style={{ marginBottom: '20px', color: 'var(--navy)', textAlign: 'center' }}>Create New Campaign</h3>
      <form onSubmit={onSubmit}>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#475569' }}>Campaign Name</label>
          <input 
            type="text" 
            name="advertisementCampaignName"
            value={formData.advertisementCampaignName}
            onChange={onChange}
            required
            placeholder="e.g., Summer 2024 Campaign"
            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#475569' }}>Description</label>
          <textarea 
            name="advertisementCampaignDescription"
            value={formData.advertisementCampaignDescription}
            onChange={onChange}
            rows={3}
            placeholder="Campaign objectives and details..."
            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
          />
        </div>



        <div style={{ display: 'flex', gap: '25px', marginBottom: '30px', justifyContent: 'center' }}>
          <div style={{ flex: 1, maxWidth: '280px' }}>
            <label style={{ display: 'block', marginBottom: '10px', fontWeight: '700', color: '#1e293b', textAlign: 'center' }}>Start Date</label>
            <input 
              type="date" 
              name="advertisementCampaignStartDate"
              value={formData.advertisementCampaignStartDate}
              onChange={onChange}
              required
              style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '1rem', textAlign: 'center' }}
            />
          </div>
          <div style={{ flex: 1, maxWidth: '280px' }}>
            <label style={{ display: 'block', marginBottom: '10px', fontWeight: '700', color: '#1e293b', textAlign: 'center' }}>End Date</label>
            <input 
              type="date" 
              name="advertisementCampaignEndDate"
              value={formData.advertisementCampaignEndDate}
              onChange={onChange}
              required
              style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '1rem', textAlign: 'center' }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '15px' }}>
          <button 
            type="button"
            onClick={onCancel}
            style={{ 
              flex: 1, 
              padding: '15px', 
              background: '#f1f5f9', 
              color: '#64748b', 
              border: 'none', 
              borderRadius: '8px', 
              fontWeight: '700', 
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            disabled={submitting}
            style={{ 
              flex: 2, 
              padding: '15px', 
              background: 'var(--navy)', 
              color: 'white', 
              border: 'none', 
              borderRadius: '8px', 
              fontWeight: '700', 
              fontSize: '1rem',
              cursor: submitting ? 'wait' : 'pointer'
            }}
          >
            {submitting ? 'Creating...' : 'Create Campaign'}
          </button>
        </div>
      </form>
    </div>
  </div>
);

// ===== Campaign Details Component (simplified - you can expand this) =====
const CampaignDetails = ({ campaign, onBack }) => (
  <div>
    <button onClick={onBack} style={{ marginBottom: '20px', padding: '10px 20px', background: '#f1f5f9', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
      ← Back to Campaigns
    </button>

    <div style={{ background: 'white', padding: '30px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
      <h2 style={{ color: 'var(--navy)', marginBottom: '20px' }}>{campaign.campaign.advertisementCampaignName}</h2>
      <p style={{ color: '#64748b', marginBottom: '30px' }}>{campaign.campaign.advertisementCampaignDescription}</p>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '30px' }}>
        <div style={{ padding: '15px', background: '#f8fafc', borderRadius: '8px' }}>
          <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Total Ads</div>
          <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--navy)' }}>{campaign.ads.length}</div>
        </div>
        <div style={{ padding: '15px', background: '#f8fafc', borderRadius: '8px' }}>
          <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Status</div>
          <div style={{ fontSize: '1.2rem', fontWeight: '700', color: 'green', textTransform: 'uppercase' }}>{campaign.campaign.advertisementCampaignStatus}</div>
        </div>
        <div style={{ padding: '15px', background: '#f8fafc', borderRadius: '8px' }}>
          <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Duration</div>
          <div style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--navy)' }}>
            {new Date(campaign.campaign.advertisementCampaignStartDate).toLocaleDateString()} - {new Date(campaign.campaign.advertisementCampaignEndDate).toLocaleDateString()}
          </div>
        </div>
      </div>

      <h3 style={{ marginBottom: '15px', color: 'var(--navy)' }}>Ads in this Campaign ({campaign.ads.length})</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        {campaign.ads.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8', background: '#f8fafc', borderRadius: '8px' }}>
            No ads in this campaign yet. Add ads to get started!
          </div>
        ) : (
          campaign.ads.map(ad => <AdCard key={ad.advertisementId} ad={ad} onDelete={() => {}} />)
        )}
      </div>
    </div>
  </div>
);

export default AdvertiserDashboard;
