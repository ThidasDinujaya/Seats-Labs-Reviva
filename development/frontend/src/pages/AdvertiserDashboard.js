import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SidebarLayout from '../components/SidebarLayout';
import { advertisementApi, campaignApi } from '../api/api';
import { useAuth } from '../context/AuthContext';
import { Image as ImageIcon, Trash2, Plus, Eye, Search } from 'lucide-react';

const AdvertiserDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('ad');
  const [ads, setAds] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [placements, setPlacements] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showAdForm, setShowAdForm] = useState(false);
  const [showCampaignForm, setShowCampaignForm] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [selectedAd, setSelectedAd] = useState(null);
  const [selectedCampaignRow, setSelectedCampaignRow] = useState(null);
  
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
      const res = await advertisementApi.getAll(); 
      if (res.success) {
        // Filter only standalone ads (no campaign)
        setAds(res.data.filter(ad => !ad.advertisementCampaignId));
      }
    } catch (err) {
      console.error(err);
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
        <p style={{ color: '#666' }}>Create standalone ad or multi-ad campaign.</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', background: '#f1f5f9', padding: '6px', borderRadius: '12px', marginBottom: '30px', width: 'fit-content' }}>
        <button 
          onClick={() => { setActiveTab('ad'); setSelectedCampaign(null); }}
          style={{
            padding: '10px 24px',
            color: activeTab === 'ad' ? 'white' : '#64748b',
            fontWeight: '700',
            background: activeTab === 'ad' ? 'var(--navy)' : 'transparent',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '0.9rem',
            transition: 'all 0.2s'
          }}
        >
          Ad
        </button>
        <button 
          onClick={() => { setActiveTab('campaign'); setShowAdForm(false); }}
          style={{
            padding: '10px 24px',
            color: activeTab === 'campaign' ? 'white' : '#64748b',
            fontWeight: '700',
            background: activeTab === 'campaign' ? 'var(--navy)' : 'transparent',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '0.9rem',
            transition: 'all 0.2s'
          }}
        >
          Ad Campaign
        </button>
      </div>

      {/* AD TAB */}
      {activeTab === 'ad' && (
        <>
          {!showAdForm ? (
            <>
              <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <Search style={{ position: 'absolute', left: '12px', top: '12px', color: '#94a3b8' }} size={20} />
                  <input 
                    type="text" 
                    placeholder="Search standalone ad..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none' }} 
                  />
                </div>
              </div>

              {/* Table container with fixed layout and scrollable rows */}
              <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', tableLayout: 'fixed' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                      <th style={{ padding: '14px 15px', color: '#64748b', fontSize: '0.85rem', fontWeight: '700' }}>Ad Details</th>
                      <th style={{ padding: '14px 15px', color: '#64748b', fontSize: '0.85rem', fontWeight: '700', width: '200px' }}>Placement</th>
                      <th style={{ padding: '14px 15px', color: '#64748b', fontSize: '0.85rem', fontWeight: '700', width: '120px' }}>Status</th>
                      <th style={{ padding: '14px 15px', color: '#64748b', fontSize: '0.85rem', fontWeight: '700', width: '130px' }}>Metrics</th>
                    </tr>
                  </thead>
                </table>
                <div style={{ overflowY: 'auto', maxHeight: '380px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', tableLayout: 'fixed' }}>
                    <tbody>
                      {ads.filter(ad => ad.advertisementTitle.toLowerCase().includes(searchTerm.toLowerCase())).length === 0 ? (
                        <tr><td colSpan="4" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>No standalone ad found.</td></tr>
                      ) : (
                        ads.filter(ad => ad.advertisementTitle.toLowerCase().includes(searchTerm.toLowerCase())).map(ad => (
                          <tr 
                            key={ad.advertisementId}
                            onClick={() => setSelectedAd(selectedAd?.advertisementId === ad.advertisementId ? null : ad)}
                            style={{ 
                              borderBottom: '1px solid #f1f5f9', cursor: 'pointer',
                              background: selectedAd?.advertisementId === ad.advertisementId ? '#eff6ff' : 'white',
                              transition: 'background 0.15s'
                            }}
                          >
                            <td style={{ padding: '14px 15px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ width: '36px', height: '36px', borderRadius: '4px', background: '#f1f5f9', overflow: 'hidden', flexShrink: 0 }}>
                                  {ad.advertisementImageUrl ? <img src={ad.advertisementImageUrl} alt={ad.advertisementTitle} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <ImageIcon size={18} style={{ margin: '9px', color: '#cbd5e1' }} />}
                                </div>
                                <div>
                                  <div style={{ fontWeight: '700', color: '#1e293b', fontSize: '0.9rem' }}>{ad.advertisementTitle}</div>
                                  <div style={{ fontSize: '0.73rem', color: '#94a3b8' }}>ID: #{ad.advertisementId}</div>
                                </div>
                              </div>
                            </td>
                            <td style={{ padding: '14px 15px', width: '200px' }}>
                              <div style={{ fontWeight: '600', color: '#1e293b', fontSize: '0.85rem' }}>{ad.advertisementPlacementName || 'General'}</div>
                              <div style={{ fontSize: '0.73rem', color: '#94a3b8' }}>{new Date(ad.advertisementStartDate).toLocaleDateString()} – {new Date(ad.advertisementEndDate).toLocaleDateString()}</div>
                            </td>
                            <td style={{ padding: '14px 15px', width: '120px' }}>
                              <span style={{ 
                                padding: '4px 10px', borderRadius: '20px', fontSize: '0.73rem', fontWeight: '800',
                                background: ad.advertisementStatus === 'active' ? '#ecfdf5' : '#fff7ed',
                                color: ad.advertisementStatus === 'active' ? '#10b981' : '#f59e0b'
                              }}>
                                {ad.advertisementStatus.toUpperCase()}
                              </span>
                            </td>
                            <td style={{ padding: '14px 15px', width: '130px' }}>
                              <div style={{ fontSize: '0.83rem' }}><span style={{ fontWeight: '700' }}>{ad.advertisementImpressions || 0}</span> Views</div>
                              <div style={{ fontSize: '0.83rem' }}><span style={{ fontWeight: '700' }}>{ad.advertisementClicks || 0}</span> Clicks</div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Bottom-right action buttons */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', padding: '14px 16px', borderTop: '1px solid #e2e8f0', background: '#f8fafc' }}>
                  <button
                    onClick={() => setShowAdForm(true)}
                    style={{ padding: '9px 20px', background: 'var(--navy)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Plus size={16}/> Add Ad
                  </button>
                  <button
                    disabled={!selectedAd}
                    onClick={() => selectedAd && alert(`View Ad: ${selectedAd.advertisementTitle}`)}
                    style={{ padding: '9px 20px', background: selectedAd ? '#e0f2fe' : '#f1f5f9', color: selectedAd ? '#0369a1' : '#cbd5e1', border: 'none', borderRadius: '8px', cursor: selectedAd ? 'pointer' : 'default', fontWeight: '700', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Eye size={16}/> View Ad
                  </button>
                  <button
                    disabled={!selectedAd}
                    onClick={() => selectedAd && alert(`Update Ad: ${selectedAd.advertisementTitle}`)}
                    style={{ padding: '9px 20px', background: selectedAd ? '#fef3c7' : '#f1f5f9', color: selectedAd ? '#b45309' : '#cbd5e1', border: 'none', borderRadius: '8px', cursor: selectedAd ? 'pointer' : 'default', fontWeight: '700', fontSize: '0.85rem' }}
                  >
                    Update Ad
                  </button>
                  <button
                    disabled={!selectedAd}
                    onClick={() => { if (selectedAd) { handleDeleteAd(selectedAd.advertisementId); setSelectedAd(null); } }}
                    style={{ padding: '9px 20px', background: selectedAd ? '#fef2f2' : '#f1f5f9', color: selectedAd ? '#ef4444' : '#cbd5e1', border: 'none', borderRadius: '8px', cursor: selectedAd ? 'pointer' : 'default', fontWeight: '700', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Trash2 size={16}/> Delete Ad
                  </button>
                </div>
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

      {/* CAMPAIGN TAB */}
      {activeTab === 'campaign' && (
        <>
          {!showCampaignForm && !selectedCampaign ? (
            <>
              <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <Search style={{ position: 'absolute', left: '12px', top: '12px', color: '#94a3b8' }} size={20} />
                  <input 
                    type="text" 
                    placeholder="Search campaign..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none' }} 
                  />
                </div>
              </div>

              <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', tableLayout: 'fixed' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                      <th style={{ padding: '14px 15px', color: '#64748b', fontSize: '0.85rem', fontWeight: '700' }}>Campaign Name</th>
                      <th style={{ padding: '14px 15px', color: '#64748b', fontSize: '0.85rem', fontWeight: '700', width: '220px' }}>Duration</th>
                      <th style={{ padding: '14px 15px', color: '#64748b', fontSize: '0.85rem', fontWeight: '700', width: '120px' }}>Status</th>
                      <th style={{ padding: '14px 15px', color: '#64748b', fontSize: '0.85rem', fontWeight: '700', width: '110px' }}>Ad Count</th>
                    </tr>
                  </thead>
                </table>
                <div style={{ overflowY: 'auto', maxHeight: '380px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', tableLayout: 'fixed' }}>
                    <tbody>
                      {campaigns.filter(c => c.advertisementCampaignName.toLowerCase().includes(searchTerm.toLowerCase())).length === 0 ? (
                        <tr><td colSpan="4" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>No campaign found.</td></tr>
                      ) : (
                        campaigns.filter(c => c.advertisementCampaignName.toLowerCase().includes(searchTerm.toLowerCase())).map(campaign => (
                          <tr
                            key={campaign.advertisementCampaignId}
                            onClick={() => setSelectedCampaignRow(selectedCampaignRow?.advertisementCampaignId === campaign.advertisementCampaignId ? null : campaign)}
                            style={{
                              borderBottom: '1px solid #f1f5f9', cursor: 'pointer',
                              background: selectedCampaignRow?.advertisementCampaignId === campaign.advertisementCampaignId ? '#eff6ff' : 'white',
                              transition: 'background 0.15s'
                            }}
                          >
                            <td style={{ padding: '14px 15px' }}>
                              <div style={{ fontWeight: '700', color: '#1e293b', fontSize: '0.9rem' }}>{campaign.advertisementCampaignName}</div>
                              <div style={{ fontSize: '0.73rem', color: '#94a3b8' }}>{campaign.advertisementCampaignDescription?.substring(0, 55)}...</div>
                            </td>
                            <td style={{ padding: '14px 15px', width: '220px', fontSize: '0.85rem', fontWeight: '500', color: '#475569' }}>
                              {new Date(campaign.advertisementCampaignStartDate).toLocaleDateString()} – {new Date(campaign.advertisementCampaignEndDate).toLocaleDateString()}
                            </td>
                            <td style={{ padding: '14px 15px', width: '120px' }}>
                              <span style={{ 
                                padding: '4px 10px', borderRadius: '20px', fontSize: '0.73rem', fontWeight: '800',
                                background: '#ecfdf5', color: '#10b981'
                              }}>
                                {campaign.advertisementCampaignStatus.toUpperCase()}
                              </span>
                            </td>
                            <td style={{ padding: '14px 15px', width: '110px' }}>
                              <div style={{ fontSize: '0.83rem' }}>{campaign.totalAds || 0} Total</div>
                              <div style={{ fontSize: '0.73rem', color: '#10b981' }}>{campaign.activeAds || 0} Active</div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Bottom-right action buttons */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', padding: '14px 16px', borderTop: '1px solid #e2e8f0', background: '#f8fafc' }}>
                  <button
                    onClick={() => setShowCampaignForm(true)}
                    style={{ padding: '9px 20px', background: 'var(--navy)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Plus size={16}/> Add Campaign
                  </button>
                  <button
                    disabled={!selectedCampaignRow}
                    onClick={() => selectedCampaignRow && viewCampaignDetails(selectedCampaignRow.advertisementCampaignId)}
                    style={{ padding: '9px 20px', background: selectedCampaignRow ? '#e0f2fe' : '#f1f5f9', color: selectedCampaignRow ? '#0369a1' : '#cbd5e1', border: 'none', borderRadius: '8px', cursor: selectedCampaignRow ? 'pointer' : 'default', fontWeight: '700', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Eye size={16}/> View Campaign
                  </button>
                  <button
                    disabled={!selectedCampaignRow}
                    onClick={() => selectedCampaignRow && alert(`Update Campaign: ${selectedCampaignRow.advertisementCampaignName}`)}
                    style={{ padding: '9px 20px', background: selectedCampaignRow ? '#fef3c7' : '#f1f5f9', color: selectedCampaignRow ? '#b45309' : '#cbd5e1', border: 'none', borderRadius: '8px', cursor: selectedCampaignRow ? 'pointer' : 'default', fontWeight: '700', fontSize: '0.85rem' }}
                  >
                    Update Campaign
                  </button>
                  <button
                    disabled={!selectedCampaignRow}
                    onClick={() => { if (selectedCampaignRow) { handleDeleteCampaign(selectedCampaignRow.advertisementCampaignId); setSelectedCampaignRow(null); } }}
                    style={{ padding: '9px 20px', background: selectedCampaignRow ? '#fef2f2' : '#f1f5f9', color: selectedCampaignRow ? '#ef4444' : '#cbd5e1', border: 'none', borderRadius: '8px', cursor: selectedCampaignRow ? 'pointer' : 'default', fontWeight: '700', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Trash2 size={16}/> Delete Campaign
                  </button>
                </div>
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

// ===== Ad Form Component =====
const AdForm = ({ formData, placements, onChange, onSubmit, onCancel, setFormData, submitting }) => (
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
          campaign.ads.map(ad => (
            <div key={ad.advertisementId} style={{ background: '#f8fafc', padding: '15px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: '700', color: '#1e293b' }}>{ad.advertisementTitle}</div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Placement: {ad.advertisementPlacementName || 'Campaign Slot'}</div>
              </div>
              <span style={{ 
                padding: '4px 10px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: '800',
                background: ad.advertisementStatus === 'active' ? '#ecfdf5' : '#fff7ed',
                color: ad.advertisementStatus === 'active' ? '#10b981' : '#f59e0b'
              }}>
                {ad.advertisementStatus.toUpperCase()}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  </div>
);

export default AdvertiserDashboard;
