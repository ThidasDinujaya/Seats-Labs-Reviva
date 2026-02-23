import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SidebarLayout from '../components/SidebarLayout';
import { advertisementApi, campaignApi } from '../api/api';
import { useAuth } from '../context/AuthContext';
import { Trash2, Plus, Search, Edit2, X, Eye } from 'lucide-react';

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
  const [showAdModal, setShowAdModal] = useState(false);
  const [showCampaignRowModal, setShowCampaignRowModal] = useState(false);

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

        setAds(res.data);
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

      const mockPlacements = [
        { advertisementPlacementId: 1, advertisementPlacementName: 'Homepage Banner', advertisementPlacementPrice: '5000.00' },
        { advertisementPlacementId: 2, advertisementPlacementName: 'Sidebar', advertisementPlacementPrice: '2500.00' },
        { advertisementPlacementId: 3, advertisementPlacementName: 'Footer', advertisementPlacementPrice: '1500.00' },
        { advertisementPlacementId: 4, advertisementPlacementName: 'Booking Page', advertisementPlacementPrice: '3500.00' }
      ];
      setPlacements(mockPlacements);

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
        advertiserId: user.advertiserId || user.userId
      };

      const res = await advertisementApi.create(payload);
      if (res.success) {
        alert("Standalone Ad Submitted Successfully! Redirecting to payment...");
        const newAdId = res.data.advertisementId;
        setShowAdForm(false);
        setAdFormData({ advertisementTitle: '', advertisementImageUrl: '', advertisementStartDate: '', advertisementEndDate: '', advertisementPlacementId: '' });
        navigate(`/payment/ad/${newAdId}`);
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

      {}
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

      {}
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

              {}
              {}
              <div style={{
                background: 'rgba(255, 255, 255, 0.7)',
                backdropFilter: 'blur(10px)',
                borderRadius: '16px',
                border: '1px solid rgba(226, 232, 240, 0.8)',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                overflow: 'hidden'
              }}>
                <div style={{ maxHeight: '500px', overflowY: 'auto', overflowX: 'auto' }}>
                  <table style={{ width: '100%', minWidth: '1650px', borderCollapse: 'separate', borderSpacing: 0, textAlign: 'left', tableLayout: 'fixed' }}>
                    <thead style={{ position: 'sticky', top: 0, background: 'linear-gradient(to bottom, #f8fafc, #f1f5f9)', zIndex: 10 }}>
                      <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                        <th style={{ padding: '16px 20px', color: '#475569', fontSize: '0.8rem', fontWeight: '800', width: '100px', textTransform: 'uppercase', letterSpacing: '0.025em' }}>ID</th>
                        <th style={{ padding: '16px 20px', color: '#475569', fontSize: '0.8rem', fontWeight: '800', width: '300px', textTransform: 'uppercase', letterSpacing: '0.025em' }}>Title</th>
                        <th style={{ padding: '16px 20px', color: '#475569', fontSize: '0.8rem', fontWeight: '800', width: '200px', textTransform: 'uppercase', letterSpacing: '0.025em' }}>Image URL</th>
                        <th style={{ padding: '16px 20px', color: '#475569', fontSize: '0.8rem', fontWeight: '800', width: '140px', textTransform: 'uppercase', letterSpacing: '0.025em' }}>Start Date</th>
                        <th style={{ padding: '16px 20px', color: '#475569', fontSize: '0.8rem', fontWeight: '800', width: '140px', textTransform: 'uppercase', letterSpacing: '0.025em' }}>End Date</th>
                        <th style={{ padding: '16px 20px', color: '#475569', fontSize: '0.8rem', fontWeight: '800', width: '140px', textTransform: 'uppercase', letterSpacing: '0.025em' }}>Status</th>
                        <th style={{ padding: '16px 20px', color: '#475569', fontSize: '0.8rem', fontWeight: '800', width: '120px', textTransform: 'uppercase', letterSpacing: '0.025em' }}>Advertiser</th>
                        <th style={{ padding: '16px 20px', color: '#475569', fontSize: '0.8rem', fontWeight: '800', width: '200px', textTransform: 'uppercase', letterSpacing: '0.025em' }}>Placement ID</th>
                        <th style={{ padding: '16px 20px', color: '#475569', fontSize: '0.8rem', fontWeight: '800', width: '200px', textTransform: 'uppercase', letterSpacing: '0.025em' }}>Campaign ID</th>
                        <th style={{ padding: '16px 20px', color: '#475569', fontSize: '0.8rem', fontWeight: '800', width: '200px', textAlign: 'right', textTransform: 'uppercase', letterSpacing: '0.025em' }}>Created At</th>
                      </tr>
                    </thead>
                    <tbody style={{ background: 'rgba(255, 255, 255, 0.5)' }}>
                      {ads.filter(ad => ad.advertisementTitle.toLowerCase().includes(searchTerm.toLowerCase())).length === 0 ? (
                        <tr><td colSpan="10" style={{ padding: '60px', textAlign: 'center', color: '#94a3b8', fontSize: '1rem', fontStyle: 'italic' }}>No advertisements found.</td></tr>
                      ) : (
                        ads.filter(ad => ad.advertisementTitle.toLowerCase().includes(searchTerm.toLowerCase())).map(ad => {
                          return (
                            <tr
                              key={ad.advertisementId}
                              onClick={() => setSelectedAd(selectedAd?.advertisementId === ad.advertisementId ? null : ad)}
                                style={{
                                  borderBottom: '1px solid rgba(241, 245, 249, 0.5)',
                                  cursor: 'pointer',
                                  background: 'transparent',
                                  outline: selectedAd?.advertisementId === ad.advertisementId ? '2px solid #eab308' : 'none',
                                  outlineOffset: '-2px',
                                  transition: 'all 0.1s'
                                }}
                              className="table-row-hover"
                            >
                              <td style={{ padding: '16px 20px', fontSize: '0.9rem' }}>{ad.advertisementId}</td>
                              <td style={{ padding: '16px 20px', fontWeight: '700', color: '#1e293b', fontSize: '0.95rem' }}>{ad.advertisementTitle}</td>
                              <td style={{ padding: '16px 20px', color: '#64748b', fontSize: '0.85rem' }}>
                                <div style={{ maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {ad.advertisementImageUrl || '-'}
                                </div>
                              </td>
                              <td style={{ padding: '16px 20px', fontSize: '0.9rem' }}>{new Date(ad.advertisementStartDate).toLocaleDateString()}</td>
                              <td style={{ padding: '16px 20px', fontSize: '0.9rem' }}>{new Date(ad.advertisementEndDate).toLocaleDateString()}</td>
                              <td style={{ padding: '16px 20px' }}>
                                <span style={{
                                  padding: '6px 14px', borderRadius: '100px', fontSize: '0.7rem', fontWeight: '800',
                                  display: 'inline-flex', alignItems: 'center', gap: '4px',
                                  boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.02)',
                                  background: ad.advertisementStatus === 'active' ? '#ecfdf5' :
                                              ad.advertisementStatus === 'pending' ? '#fff7ed' :
                                              ad.advertisementStatus === 'rejected' ? '#fef2f2' : '#f8fafc',
                                  color: ad.advertisementStatus === 'active' ? '#10b981' :
                                         ad.advertisementStatus === 'pending' ? '#f59e0b' :
                                         ad.advertisementStatus === 'rejected' ? '#ef4444' : '#64748b',
                                  border: `1px solid ${
                                    ad.advertisementStatus === 'active' ? '#bbf7d0' :
                                    ad.advertisementStatus === 'pending' ? '#fed7aa' :
                                    ad.advertisementStatus === 'rejected' ? '#fecaca' : '#e2e8f0'
                                  }`
                                }}>
                                  {ad.advertisementStatus.toUpperCase()}
                                </span>
                              </td>
                              <td style={{ padding: '16px 20px', fontSize: '0.9rem' }}>USR-{ad.advertiserId}</td>
                              <td style={{ padding: '16px 20px', fontSize: '0.9rem' }}>PLC-{ad.advertisementPlacementId || '-'}</td>
                              <td style={{ padding: '16px 20px', fontSize: '0.9rem' }}>CMP-{ad.advertisementCampaignId || '-'}</td>
                              <td style={{ padding: '16px 20px', textAlign: 'right', fontSize: '0.85rem', color: '#64748b', fontVariantNumeric: 'tabular-nums' }}>
                                {new Date(ad.advertisementCreatedAt).toLocaleDateString()} {new Date(ad.advertisementCreatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {}
              {showAdModal && selectedAd && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,10,30,0.5)', backdropFilter: 'blur(6px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px' }}>
                  <div style={{ background: 'white', borderRadius: '24px', width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.3)', position: 'relative' }}>
                    <button
                      onClick={() => setShowAdModal(false)}
                      style={{ position: 'absolute', top: '24px', right: '24px', background: '#f1f5f9', border: 'none', padding: '8px', borderRadius: '50%', cursor: 'pointer', color: '#64748b', transition: 'all 0.2s' }}
                      onMouseOver={(e) => e.currentTarget.style.background = '#e2e8f0'}
                      onMouseOut={(e) => e.currentTarget.style.background = '#f1f5f9'}
                    >
                      <X size={20} />
                    </button>

                    <div style={{ padding: '32px' }}>
                      <h2 style={{ color: 'var(--navy)', marginBottom: '24px', fontSize: '1.5rem', fontWeight: '800' }}>Advertisement Details</h2>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '32px' }}>
                        <DetailField label="ID" value={`AD-${selectedAd.advertisementId}`} />
                        <DetailField label="Status" value={
                          <span style={{
                            padding: '4px 12px', borderRadius: '100px', fontSize: '0.72rem', fontWeight: '800',
                            background: selectedAd.advertisementStatus === 'active' ? '#ecfdf5' : selectedAd.advertisementStatus === 'pending' ? '#fff7ed' : '#fef2f2',
                            color: selectedAd.advertisementStatus === 'active' ? '#10b981' : selectedAd.advertisementStatus === 'pending' ? '#f59e0b' : '#ef4444'
                          }}>{selectedAd.advertisementStatus.toUpperCase()}</span>
                        } />
                        <DetailField label="Title" value={selectedAd.advertisementTitle} colSpan={2} />
                        <DetailField label="Start Date" value={new Date(selectedAd.advertisementStartDate).toLocaleDateString()} />
                        <DetailField label="End Date" value={new Date(selectedAd.advertisementEndDate).toLocaleDateString()} />
                        <DetailField label="Placement" value={`PLC-${selectedAd.advertisementPlacementId || '—'}`} />
                        <DetailField label="Campaign" value={selectedAd.advertisementCampaignId ? `CMP-${selectedAd.advertisementCampaignId}` : 'None'} />
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <button
                          onClick={() => { alert('Update advertisement — connect to API.'); setShowAdModal(false); }}
                          style={{ padding: '14px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                        >
                          <Edit2 size={18} /> Update Advertisement
                        </button>
                        <button
                          onClick={() => { handleDeleteAd(selectedAd.advertisementId); setSelectedAd(null); setShowAdModal(false); }}
                          style={{ padding: '14px', background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '12px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                        >
                          <Trash2 size={18} /> Delete Advertisement
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {}
              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '12px',
                padding: '20px',
                position: 'sticky',
                bottom: '0',
                background: 'rgba(255,255,255,0.9)',
                backdropFilter: 'blur(10px)',
                borderTop: '1px solid #e2e8f0',
                margin: '20px -40px -40px -40px',
                zIndex: 20
              }}>
                <button
                  onClick={() => selectedAd && setShowAdModal(true)}
                  disabled={!selectedAd}
                  style={{
                    padding: '10px 24px',
                    background: selectedAd ? '#eab308' : '#f1f5f9',
                    color: selectedAd ? 'white' : '#94a3b8',
                    border: 'none',
                    borderRadius: '10px',
                    cursor: selectedAd ? 'pointer' : 'not-allowed',
                    fontWeight: '700',
                    fontSize: '0.9rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 0.2s',
                    boxShadow: selectedAd ? '0 4px 6px -1px rgba(0,0,0,0.1)' : 'none'
                  }}
                  onMouseOver={(e) => { if (selectedAd) e.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseOut={(e) => { if (selectedAd) e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                  <Eye size={18}/> View Advertisement
                </button>
                <button
                  onClick={() => setShowAdForm(true)}
                  style={{
                    padding: '10px 24px', background: 'var(--navy)', color: 'white', border: 'none', borderRadius: '10px',
                    cursor: 'pointer', fontWeight: '700', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px',
                    transition: 'transform 0.2s, background 0.2s', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <Plus size={18}/> New Advertisement
                </button>
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

      {}
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

              {}
              <div style={{
                background: 'rgba(255, 255, 255, 0.7)',
                backdropFilter: 'blur(10px)',
                borderRadius: '16px',
                border: '1px solid rgba(226, 232, 240, 0.8)',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                overflow: 'hidden'
              }}>
                <div style={{ maxHeight: '500px', overflowY: 'auto', overflowX: 'auto' }}>
                  <table style={{ width: '100%', minWidth: '1350px', borderCollapse: 'separate', borderSpacing: 0, textAlign: 'left', tableLayout: 'fixed' }}>
                    <thead style={{ position: 'sticky', top: 0, background: 'linear-gradient(to bottom, #f8fafc, #f1f5f9)', zIndex: 10 }}>
                      <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                        <th style={{ padding: '16px 20px', color: '#475569', fontSize: '0.8rem', fontWeight: '800', width: '100px', textTransform: 'uppercase', letterSpacing: '0.025em' }}>ID</th>
                        <th style={{ padding: '16px 20px', color: '#475569', fontSize: '0.8rem', fontWeight: '800', width: '300px', textTransform: 'uppercase', letterSpacing: '0.025em' }}>Campaign Name</th>
                        <th style={{ padding: '16px 20px', color: '#475569', fontSize: '0.8rem', fontWeight: '800', width: '160px', textTransform: 'uppercase', letterSpacing: '0.025em' }}>Start Date</th>
                        <th style={{ padding: '16px 20px', color: '#475569', fontSize: '0.8rem', fontWeight: '800', width: '160px', textTransform: 'uppercase', letterSpacing: '0.025em' }}>End Date</th>
                        <th style={{ padding: '16px 20px', color: '#475569', fontSize: '0.8rem', fontWeight: '800', width: '150px', textTransform: 'uppercase', letterSpacing: '0.025em' }}>Status</th>
                        <th style={{ padding: '16px 20px', color: '#475569', fontSize: '0.8rem', fontWeight: '800', width: '120px', textTransform: 'uppercase', letterSpacing: '0.025em' }}>Advertiser</th>
                        <th style={{ padding: '16px 20px', color: '#475569', fontSize: '0.8rem', fontWeight: '800', width: '220px', textAlign: 'right', textTransform: 'uppercase', letterSpacing: '0.025em' }}>Created At</th>
                      </tr>
                    </thead>
                    <tbody style={{ background: 'rgba(255, 255, 255, 0.5)' }}>
                      {campaigns.filter(c => c.advertisementCampaignName.toLowerCase().includes(searchTerm.toLowerCase())).length === 0 ? (
                        <tr><td colSpan="7" style={{ padding: '60px', textAlign: 'center', color: '#94a3b8', fontSize: '1rem', fontStyle: 'italic' }}>No campaigns found.</td></tr>
                      ) : (
                        campaigns.filter(c => c.advertisementCampaignName.toLowerCase().includes(searchTerm.toLowerCase())).map(campaign => {
                          return (
                            <tr
                              key={campaign.advertisementCampaignId}
                              onClick={() => setSelectedCampaignRow(selectedCampaignRow?.advertisementCampaignId === campaign.advertisementCampaignId ? null : campaign)}
                              style={{
                                borderBottom: '1px solid rgba(241, 245, 249, 0.5)',
                                cursor: 'pointer',
                                background: 'transparent',
                                outline: selectedCampaignRow?.advertisementCampaignId === campaign.advertisementCampaignId ? '2px solid #eab308' : 'none',
                                outlineOffset: '-2px',
                                transition: 'all 0.1s'
                              }}
                            >
                              <td style={{ padding: '16px 20px', fontSize: '0.9rem' }}>{campaign.advertisementCampaignId}</td>
                              <td style={{ padding: '16px 20px', fontWeight: '700', color: '#1e293b', fontSize: '0.95rem' }}>{campaign.advertisementCampaignName}</td>
                              <td style={{ padding: '16px 20px', fontSize: '0.9rem' }}>{new Date(campaign.advertisementCampaignStartDate).toLocaleDateString()}</td>
                              <td style={{ padding: '16px 20px', fontSize: '0.9rem' }}>{new Date(campaign.advertisementCampaignEndDate).toLocaleDateString()}</td>
                              <td style={{ padding: '16px 20px' }}>
                                <span style={{
                                  padding: '6px 14px', borderRadius: '100px', fontSize: '0.7rem', fontWeight: '800',
                                  display: 'inline-flex', alignItems: 'center', gap: '4px',
                                  boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.02)',
                                  background: campaign.advertisementCampaignStatus === 'active' ? '#ecfdf5' :
                                              campaign.advertisementCampaignStatus === 'pending' ? '#fff7ed' :
                                              campaign.advertisementCampaignStatus === 'paused' ? '#fffbeb' :
                                              campaign.advertisementCampaignStatus === 'cancelled' ? '#fef2f2' : '#f8fafc',
                                  color: campaign.advertisementCampaignStatus === 'active' ? '#10b981' :
                                         campaign.advertisementCampaignStatus === 'pending' ? '#f59e0b' :
                                         campaign.advertisementCampaignStatus === 'paused' ? '#d97706' :
                                         campaign.advertisementCampaignStatus === 'cancelled' ? '#ef4444' : '#64748b',
                                  border: `1px solid ${
                                    campaign.advertisementCampaignStatus === 'active' ? '#bbf7d0' :
                                    campaign.advertisementCampaignStatus === 'pending' ? '#fed7aa' :
                                    campaign.advertisementCampaignStatus === 'paused' ? '#fef3c7' :
                                    campaign.advertisementCampaignStatus === 'cancelled' ? '#fecaca' : '#e2e8f0'
                                  }`
                                }}>
                                  {campaign.advertisementCampaignStatus.toUpperCase()}
                                </span>
                              </td>
                              <td style={{ padding: '16px 20px', fontSize: '0.9rem' }}>USR-{campaign.advertiserId}</td>
                              <td style={{ padding: '16px 20px', textAlign: 'right', fontSize: '0.85rem', color: '#64748b', fontVariantNumeric: 'tabular-nums' }}>
                                {new Date(campaign.advertisementCampaignCreatedAt).toLocaleDateString()}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {}
              {showCampaignRowModal && selectedCampaignRow && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,10,30,0.5)', backdropFilter: 'blur(6px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px' }}>
                  <div style={{ background: 'white', borderRadius: '24px', width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.3)', position: 'relative' }}>
                    <button
                      onClick={() => setShowCampaignRowModal(false)}
                      style={{ position: 'absolute', top: '24px', right: '24px', background: '#f1f5f9', border: 'none', padding: '8px', borderRadius: '50%', cursor: 'pointer', color: '#64748b', transition: 'all 0.2s' }}
                      onMouseOver={(e) => e.currentTarget.style.background = '#e2e8f0'}
                      onMouseOut={(e) => e.currentTarget.style.background = '#f1f5f9'}
                    >
                      <X size={20} />
                    </button>

                    <div style={{ padding: '32px' }}>
                      <h2 style={{ color: 'var(--navy)', marginBottom: '24px', fontSize: '1.5rem', fontWeight: '800' }}>Campaign Details</h2>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '32px' }}>
                        <DetailField label="ID" value={`CMP-${selectedCampaignRow.advertisementCampaignId}`} />
                        <DetailField label="Status" value={
                          <span style={{
                            padding: '4px 12px', borderRadius: '100px', fontSize: '0.72rem', fontWeight: '800',
                            background: selectedCampaignRow.advertisementCampaignStatus === 'active' ? '#ecfdf5' : selectedCampaignRow.advertisementCampaignStatus === 'pending' ? '#fff7ed' : '#fef2f2',
                            color: selectedCampaignRow.advertisementCampaignStatus === 'active' ? '#10b981' : selectedCampaignRow.advertisementCampaignStatus === 'pending' ? '#f59e0b' : '#ef4444'
                          }}>{selectedCampaignRow.advertisementCampaignStatus.toUpperCase()}</span>
                        } />
                        <DetailField label="Name" value={selectedCampaignRow.advertisementCampaignName} colSpan={2} />
                        <DetailField label="Start Date" value={new Date(selectedCampaignRow.advertisementCampaignStartDate).toLocaleDateString()} />
                        <DetailField label="End Date" value={new Date(selectedCampaignRow.advertisementCampaignEndDate).toLocaleDateString()} />
                        <DetailField label="Description" value={selectedCampaignRow.advertisementCampaignDescription || 'No description provided'} colSpan={2} />
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <button
                          onClick={() => { viewCampaignDetails(selectedCampaignRow.advertisementCampaignId); setShowCampaignRowModal(false); }}
                          style={{ padding: '14px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                        >
                          <Edit2 size={18} /> Update Campaign
                        </button>
                        <button
                          onClick={() => { if (window.confirm('Delete this campaign?')) { handleDeleteCampaign(selectedCampaignRow.advertisementCampaignId); setSelectedCampaignRow(null); setShowCampaignRowModal(false); } }}
                          style={{ padding: '14px', background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '12px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                        >
                          <Trash2 size={18} /> Delete Campaign
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {}
              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '12px',
                padding: '20px',
                position: 'sticky',
                bottom: '0',
                background: 'rgba(255,255,255,0.9)',
                backdropFilter: 'blur(10px)',
                borderTop: '1px solid #e2e8f0',
                margin: '20px -40px -40px -40px',
                zIndex: 20
              }}>
                <button
                  onClick={() => selectedCampaignRow && setShowCampaignRowModal(true)}
                  disabled={!selectedCampaignRow}
                  style={{
                    padding: '10px 24px',
                    background: selectedCampaignRow ? '#eab308' : '#f1f5f9',
                    color: selectedCampaignRow ? 'white' : '#94a3b8',
                    border: 'none',
                    borderRadius: '10px',
                    cursor: selectedCampaignRow ? 'pointer' : 'not-allowed',
                    fontWeight: '700',
                    fontSize: '0.9rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 0.2s',
                    boxShadow: selectedCampaignRow ? '0 4px 6px -1px rgba(0,0,0,0.1)' : 'none'
                  }}
                  onMouseOver={(e) => { if (selectedCampaignRow) e.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseOut={(e) => { if (selectedCampaignRow) e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                  <Eye size={18}/> View Campaign
                </button>
                <button
                  onClick={() => setShowCampaignForm(true)}
                  style={{
                    padding: '10px 24px', background: 'var(--navy)', color: 'white', border: 'none', borderRadius: '10px',
                    cursor: 'pointer', fontWeight: '700', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px',
                    transition: 'transform 0.2s, background 0.2s', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <Plus size={18}/> New Campaign
                </button>
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

const CampaignDetails = ({ campaign, onBack }) => (
  <div style={{ padding: '20px', background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
    <button
      onClick={onBack}
      style={{ marginBottom: '24px', padding: '10px 20px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', color: '#64748b', display: 'flex', alignItems: 'center', gap: '8px' }}
    >
      ← Back to Campaigns
    </button>

    <div style={{ marginBottom: '32px' }}>
      <h2 style={{ color: 'var(--navy)', marginBottom: '8px', fontSize: '1.5rem', fontWeight: '800' }}>{campaign.campaign.advertisementCampaignName}</h2>
      <p style={{ color: '#64748b', fontSize: '1rem' }}>{campaign.campaign.advertisementCampaignDescription}</p>
    </div>

    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '40px' }}>
      <DetailField label="Total Ads" value={campaign.ads.length} />
      <DetailField label="Status" value={
        <span style={{
          padding: '4px 10px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: '800',
          color: campaign.campaign.advertisementCampaignStatus === 'active' ? '#10b981' : '#f59e0b',
          textTransform: 'uppercase'
        }}>{campaign.campaign.advertisementCampaignStatus}</span>
      } />
      <DetailField label="Start Date" value={new Date(campaign.campaign.advertisementCampaignStartDate).toLocaleDateString()} />
      <DetailField label="End Date" value={new Date(campaign.campaign.advertisementCampaignEndDate).toLocaleDateString()} />
    </div>

    <h3 style={{ marginBottom: '20px', color: 'var(--navy)', fontSize: '1.25rem', fontWeight: '800' }}>Ads in this Campaign</h3>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
      {campaign.ads.length === 0 ? (
        <div style={{ padding: '60px', textAlign: 'center', color: '#94a3b8', background: '#f8fafc', borderRadius: '16px', gridColumn: '1 / -1' }}>
          No ads in this campaign yet.
        </div>
      ) : (
        campaign.ads.map(ad => (
          <div key={ad.advertisementId} style={{ background: '#f8fafc', padding: '20px', borderRadius: '16px', border: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: '700', color: '#1e293b', fontSize: '1rem' }}>{ad.advertisementTitle}</div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>Placement: {ad.advertisementPlacementName || 'Campaign Slot'}</div>
            </div>
            <span style={{
              padding: '6px 12px', borderRadius: '100px', fontSize: '0.65rem', fontWeight: '800',
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
);

const DetailField = ({ label, value, colSpan = 1 }) => (
  <div style={{
    gridColumn: `span ${colSpan}`,
    padding: '16px',
    background: '#f8fafc',
    borderRadius: '12px',
    border: '1px solid #f1f5f9'
  }}>
    <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>{label}</div>
    <div style={{ fontWeight: '700', color: '#1e293b', fontSize: '1rem' }}>{value}</div>
  </div>
);

export default AdvertiserDashboard;
