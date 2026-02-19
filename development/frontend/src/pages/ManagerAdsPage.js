import React, { useState, useEffect } from 'react';
import { 
    Search, Plus, Eye, Edit2, 
    Trash2, X, BarChart2, CheckCircle, Clock, AlertTriangle,
    Layout, Megaphone, CreditCard, Layers
} from 'lucide-react';
import SidebarLayout from '../components/SidebarLayout';
import { advertisementApi, campaignApi } from '../api/api';

const ManagerAdsPage = () => {
    const [activeTab, setActiveTab] = useState('ad');
    const [ads, setAds] = useState([]);
    const [campaigns, setCampaigns] = useState([]);
    const [pricingPlans, setPricingPlans] = useState([]);
    const [placements, setPlacements] = useState([]);

    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('view');
    const [selectedId, setSelectedId] = useState(null);
    const [formData, setFormData] = useState({
        advertisementId: '',
        advertisementTitle: '',
        advertiserBusinessName: '',
        advertisementPlacementName: '',
        advertisementStartDate: '',
        advertisementEndDate: '',
        advertisementStatus: 'pending',
        advertisementImpressions: 0,
        advertisementClicks: 0
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [adsRes, campaignsRes] = await Promise.all([
                    advertisementApi.getAll(),
                    campaignApi.getAll()
                ]);

                if (adsRes.success) setAds(adsRes.data);
                if (campaignsRes.success) setCampaigns(campaignsRes.data);
                
                // Keep dummy pricing and placements for now as they might not have full APIs yet
                setPricingPlans([
                    { planId: 1, planName: 'Basic Weekly', price: 5000, duration: '7 Days', description: 'Standard sidebar placement' },
                    { planId: 2, planName: 'Premium Monthly', price: 25000, duration: '30 Days', description: 'Homepage banner + analytics' }
                ]);
                setPlacements([
                    { advertisementPlacementId: 1, advertisementPlacementName: 'Homepage Banner', dimensions: '1200x250', activeAds: 5, priceMultiplier: 2.5 },
                    { advertisementPlacementId: 2, advertisementPlacementName: 'Bottom Banner', dimensions: '1200x280', activeAds: 4, priceMultiplier: 2.0 }
                ]);

            } catch (error) {
                console.error("Failed to fetch ads/campaigns:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const getStatusStyle = (status) => {
        switch (status) {
            case 'active': return { bg: '#ecfdf5', text: '#10b981', icon: <CheckCircle size={14} /> };
            case 'pending': return { bg: '#fff7ed', text: '#f59e0b', icon: <Clock size={14} /> };
            case 'expired': return { bg: '#f1f5f9', text: '#64748b', icon: <AlertTriangle size={14} /> };
            default: return { bg: '#fef2f2', text: '#ef4444', icon: null };
        }
    };

    const handleOpenModal = (mode, item = null) => {
        setModalMode(mode);
        // This would normally handle different entity types based on activeTab
        if (item) setFormData(item);
        else setFormData({}); // Reset for add
        setShowModal(true);
    };

    const getFilteredData = () => {
        switch(activeTab) {
            case 'ad':
                return ads.filter(ad => 
                    ((ad.advertisementTitle?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || 
                     (ad.advertiserBusinessName?.toLowerCase() || '').includes(searchTerm.toLowerCase())) &&
                    (statusFilter === 'all' || ad.advertisementStatus === statusFilter)
                );
            case 'campaign':
                return campaigns.filter(c => 
                    (c.advertisementCampaignName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                    (c.advertiserBusinessName?.toLowerCase() || '').includes(searchTerm.toLowerCase())
                );
            case 'pricing':
                return pricingPlans.filter(p => (p.planName?.toLowerCase() || '').includes(searchTerm.toLowerCase()));
            case 'placement':
                return placements.filter(p => (p.advertisementPlacementName?.toLowerCase() || '').includes(searchTerm.toLowerCase()));
            default: return [];
        }
    };

    const filteredData = getFilteredData();
    const viewOnly = modalMode === 'view';

    const tabStyles = {
        container: { display: 'flex', gap: '8px', marginBottom: '15px', padding: '6px', background: '#f1f5f9', borderRadius: '12px', alignSelf: 'flex-start', width: 'fit-content' },
        tab: (active) => ({
            padding: '10px 20px', border: 'none', background: active ? 'var(--navy)' : 'transparent', color: active ? 'white' : '#475569', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px', borderRadius: '8px', transition: 'all 0.2s ease',
            boxShadow: active ? '0 2px 4px rgba(0,0,0,0.1)' : 'none'
        })
    };

    const getTabLabel = () => {
        switch(activeTab) {
            case 'ad': return 'Ad';
            case 'campaign': return 'Ad Campaign';
            case 'pricing': return 'Ad Pricing Plan';
            case 'placement': return 'Ad Placement';
            default: return 'Item';
        }
    };

    return (
        <SidebarLayout role="manager">
            <div style={{ height: 'calc(100vh - 140px)', display: 'flex', flexDirection: 'column', padding: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                    <div>
                        <h1 style={{ fontSize: '1.875rem', fontWeight: '800', color: '#1e293b', marginBottom: '8px' }}>Advertisement Management</h1>
                        <p style={{ color: '#64748b', fontSize: '1rem' }}>Manage ads, campaigns, pricing, and placements</p>
                    </div>
                </div>

                <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', padding: '24px', flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    <div style={tabStyles.container}>
                        <button onClick={() => { setActiveTab('ad'); setSelectedId(null); }} style={tabStyles.tab(activeTab === 'ad')}>
                            <Layout size={18} /> Ad
                        </button>
                        <button onClick={() => { setActiveTab('campaign'); setSelectedId(null); }} style={tabStyles.tab(activeTab === 'campaign')}>
                            <Megaphone size={18} /> Campaign
                        </button>
                        <button onClick={() => { setActiveTab('pricing'); setSelectedId(null); }} style={tabStyles.tab(activeTab === 'pricing')}>
                            <CreditCard size={18} /> Pricing Plan
                        </button>
                        <button onClick={() => { setActiveTab('placement'); setSelectedId(null); }} style={tabStyles.tab(activeTab === 'placement')}>
                            <Layers size={18} /> Placement
                        </button>
                    </div>

                    <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
                        <div style={{ position: 'relative', flex: 1 }}>
                            <Search style={{ position: 'absolute', left: '12px', top: '12px', color: '#94a3b8' }} size={20} />
                            <input 
                                type="text" 
                                placeholder={`Search ${getTabLabel()}...`} 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none' }} 
                            />
                        </div>
                        {activeTab === 'ad' && (
                            <select 
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                style={{ padding: '12px 15px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', outline: 'none', minWidth: '150px' }}
                            >
                                <option value="all">All Status</option>
                                <option value="active">Active</option>
                                <option value="pending">Pending</option>
                                <option value="expired">Expired</option>
                            </select>
                        )}
                    </div>

                    <div style={{ overflowY: 'auto', flex: 1, overflowX: 'auto', border: '1px solid #f1f5f9', borderRadius: '8px' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid #f1f5f9', textAlign: 'left', position: 'sticky', top: 0, background: 'white', zIndex: 1 }}>
                                    {activeTab === 'ad' && (
                                        <>
                                            <th style={{ padding: '15px', color: '#64748b' }}>Ad ID</th>
                                            <th style={{ padding: '15px', color: '#64748b' }}>Title</th>
                                            <th style={{ padding: '15px', color: '#64748b' }}>Advertiser</th>
                                            <th style={{ padding: '15px', color: '#64748b' }}>Placement</th>
                                            <th style={{ padding: '15px', color: '#64748b' }}>Metrics</th>
                                            <th style={{ padding: '15px', textAlign: 'right', color: '#64748b' }}>Status</th>
                                        </>
                                    )}
                                    {activeTab === 'campaign' && (
                                        <>
                                            <th style={{ padding: '15px', color: '#64748b' }}>Campaign ID</th>
                                            <th style={{ padding: '15px', color: '#64748b' }}>Campaign Name</th>
                                            <th style={{ padding: '15px', color: '#64748b' }}>Advertiser</th>
                                            <th style={{ padding: '15px', textAlign: 'right', color: '#64748b' }}>Status</th>
                                        </>
                                    )}
                                    {activeTab === 'pricing' && (
                                        <>
                                            <th style={{ padding: '15px', color: '#64748b' }}>Plan ID</th>
                                            <th style={{ padding: '15px', color: '#64748b' }}>Plan Name</th>
                                            <th style={{ padding: '15px', color: '#64748b' }}>Price</th>
                                            <th style={{ padding: '15px', color: '#64748b' }}>Duration</th>
                                            <th style={{ padding: '15px', color: '#64748b' }}>Description</th>
                                        </>
                                    )}
                                    {activeTab === 'placement' && (
                                        <>
                                            <th style={{ padding: '15px', color: '#64748b' }}>Placement ID</th>
                                            <th style={{ padding: '15px', color: '#64748b' }}>Placement Name</th>
                                            <th style={{ padding: '15px', color: '#64748b' }}>Dimensions</th>
                                            <th style={{ padding: '15px', color: '#64748b' }}>Active Ads</th>
                                            <th style={{ padding: '15px', textAlign: 'right', color: '#64748b' }}>Multiplier</th>
                                        </>
                                    )}
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="10" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>Loading...</td></tr>
                                ) : filteredData.length === 0 ? (
                                    <tr><td colSpan="10" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>No {getTabLabel()} found.</td></tr>
                                ) : (
                                    filteredData.map(item => {
                                        const id = item.advertisementId || item.advertisementCampaignId || item.planId || item.advertisementPlacementId;
                                        return (
                                            <tr 
                                                key={id} 
                                                onClick={() => setSelectedId(selectedId === id ? null : id)}
                                                style={{ 
                                                    borderBottom: '1px solid #f1f5f9', 
                                                    cursor: 'pointer',
                                                    transition: 'background 0.2s',
                                                    background: selectedId === id ? '#f1f5f9' : 'transparent'
                                                }}
                                            >
                                                {activeTab === 'ad' && (
                                                    <>
                                                        <td style={{ padding: '15px' }}>#{item.advertisementId}</td>
                                                        <td style={{ padding: '15px', fontWeight: '600' }}>{item.advertisementTitle}</td>
                                                        <td style={{ padding: '15px' }}>{item.advertiserBusinessName}</td>
                                                        <td style={{ padding: '15px' }}>
                                                            <span style={{ fontSize: '0.9rem', padding: '4px 8px', background: '#f1f5f9', borderRadius: '4px' }}>
                                                                {item.advertisementPlacementName}
                                                            </span>
                                                        </td>
                                                        <td style={{ padding: '15px' }}>
                                                            <div style={{ display: 'flex', gap: '15px' }}>
                                                                <div style={{ textAlign: 'center' }}>
                                                                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Views</div>
                                                                    <div style={{ fontWeight: 'bold' }}>{item.advertisementImpressions || 0}</div>
                                                                </div>
                                                                <div style={{ textAlign: 'center' }}>
                                                                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Clicks</div>
                                                                    <div style={{ fontWeight: 'bold' }}>{item.advertisementClicks || 0}</div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td style={{ padding: '15px', textAlign: 'right' }}>
                                                            <span style={{ 
                                                                padding: '6px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600',
                                                                background: getStatusStyle(item.advertisementStatus).bg, color: getStatusStyle(item.advertisementStatus).text,
                                                                display: 'inline-flex', alignItems: 'center', gap: '5px'
                                                            }}>
                                                                {getStatusStyle(item.advertisementStatus).icon}
                                                                {item.advertisementStatus.toUpperCase()}
                                                            </span>
                                                        </td>
                                                    </>
                                                )}
                                                {activeTab === 'campaign' && (
                                                    <>
                                                        <td style={{ padding: '15px' }}>#{item.advertisementCampaignId}</td>
                                                        <td style={{ padding: '15px', fontWeight: 'bold' }}>{item.advertisementCampaignName}</td>
                                                        <td style={{ padding: '15px' }}>{item.advertiserBusinessName}</td>
                                                        <td style={{ padding: '15px', textAlign: 'right' }}>
                                                            <span style={{ 
                                                                padding: '6px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600',
                                                                background: getStatusStyle(item.advertisementCampaignStatus).bg, color: getStatusStyle(item.advertisementCampaignStatus).text,
                                                                display: 'inline-flex', alignItems: 'center', gap: '5px'
                                                            }}>
                                                                {getStatusStyle(item.advertisementCampaignStatus).icon}
                                                                {item.advertisementCampaignStatus.toUpperCase()}
                                                            </span>
                                                        </td>
                                                    </>
                                                )}
                                                {activeTab === 'pricing' && (
                                                    <>
                                                        <td style={{ padding: '15px' }}>#{item.planId}</td>
                                                        <td style={{ padding: '15px', fontWeight: 'bold' }}>{item.planName}</td>
                                                        <td style={{ padding: '15px' }}>Rs. {item.price.toLocaleString()}</td>
                                                        <td style={{ padding: '15px' }}>{item.duration}</td>
                                                        <td style={{ padding: '15px', fontSize: '0.9rem', color: '#64748b' }}>{item.description}</td>
                                                    </>
                                                )}
                                                {activeTab === 'placement' && (
                                                    <>
                                                        <td style={{ padding: '15px' }}>#{item.advertisementPlacementId}</td>
                                                        <td style={{ padding: '15px', fontWeight: 'bold' }}>{item.advertisementPlacementName}</td>
                                                        <td style={{ padding: '15px' }}>{item.dimensions}</td>
                                                        <td style={{ padding: '15px' }}>{item.activeAds} Ads</td>
                                                        <td style={{ padding: '15px', textAlign: 'right', fontWeight: 'bold', color: 'var(--navy)' }}>{item.priceMultiplier}x</td>
                                                    </>
                                                )}
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', padding: '20px 0 0 0', borderTop: '1px solid #f1f5f9', marginTop: '10px' }}>
                        <button onClick={() => handleOpenModal('add')} style={{ padding: '10px 24px', borderRadius: '8px', border: 'none', background: 'var(--navy)', color: 'white', cursor: 'pointer', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Plus size={18} /> Add {getTabLabel()}
                        </button>
                        <button 
                            onClick={() => {
                                const idAttribute = activeTab === 'ad' ? 'advertisementId' : activeTab === 'campaign' ? 'advertisementCampaignId' : activeTab === 'pricing' ? 'planId' : 'advertisementPlacementId';
                                const item = filteredData.find(i => i[idAttribute] === selectedId);
                                if (item) handleOpenModal('edit', item);
                            }} 
                            disabled={!selectedId}
                            style={{ padding: '10px 24px', borderRadius: '8px', border: 'none', background: selectedId ? '#3b82f6' : '#f1f5f9', color: selectedId ? 'white' : '#94a3b8', cursor: selectedId ? 'pointer' : 'default', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}
                        >
                            <Edit2 size={18} /> Update {getTabLabel()}
                        </button>
                        <button 
                            onClick={() => {
                                const idAttribute = activeTab === 'ad' ? 'advertisementId' : activeTab === 'campaign' ? 'advertisementCampaignId' : activeTab === 'pricing' ? 'planId' : 'advertisementPlacementId';
                                const item = filteredData.find(i => i[idAttribute] === selectedId);
                                if (item) handleOpenModal('view', item);
                            }} 
                            disabled={!selectedId}
                            style={{ padding: '10px 24px', borderRadius: '8px', border: 'none', background: selectedId ? 'var(--yellow)' : '#f1f5f9', color: selectedId ? 'black' : '#94a3b8', cursor: selectedId ? 'pointer' : 'default', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}
                        >
                            <Eye size={18} /> View {getTabLabel()}
                        </button>
                        <button 
                            onClick={() => {
                                if (selectedId && window.confirm(`Delete this ${getTabLabel()}?`)) {
                                    setSelectedId(null);
                                }
                            }} 
                            disabled={!selectedId}
                            style={{ padding: '10px 24px', borderRadius: '8px', border: 'none', background: selectedId ? '#ef4444' : '#f1f5f9', color: selectedId ? 'white' : '#94a3b8', cursor: selectedId ? 'pointer' : 'default', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}
                        >
                            <Trash2 size={18} /> Delete {getTabLabel()}
                        </button>
                    </div>
                </div>

                {showModal && (
                    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000 }}>
                        <div style={{ background: 'white', borderRadius: '16px', width: '600px', maxWidth: '90%', maxHeight: '90vh', overflowY: 'auto' }}>
                            <div style={{ padding: '20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: 'white', zIndex: 10 }}>
                                <h2 style={{ margin: 0, color: '#1e293b' }}>{modalMode === 'add' ? `Create New ${getTabLabel()}` : modalMode === 'view' ? `${getTabLabel()} Details` : `Edit ${getTabLabel()}`}</h2>
                                <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={24} /></button>
                            </div>
                            <div style={{ padding: '25px' }}>
                                {/* Modal content - For now focusing on layout and navigation as requested */}
                                {activeTab === 'ad' ? (
                                    <>
                                        <div style={{ marginBottom: '20px' }}>
                                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Ad Title</label>
                                            <input type="text" value={formData.advertisementTitle || ''} onChange={(e) => setFormData({...formData, advertisementTitle: e.target.value})} disabled={viewOnly} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                                            <div>
                                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Advertiser</label>
                                                <input type="text" value={formData.advertiserBusinessName || ''} disabled={true} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc' }} />
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Placement</label>
                                                <select value={formData.advertisementPlacementName || 'Homepage Banner'} onChange={(e) => setFormData({...formData, advertisementPlacementName: e.target.value})} disabled={viewOnly} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                                                    <option value="Homepage Banner">Homepage Banner</option>
                                                    <option value="Bottom Banner">Bottom Banner</option>
                                                    <option value="Tower">Tower</option>
                                                    <option value="Left Sidebar">Left Sidebar</option>
                                                    <option value="Right Sidebar">Right Sidebar</option>
                                                    <option value="Square">Square</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                                            <div>
                                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Start Date</label>
                                                <input type="date" value={formData.advertisementStartDate || ''} onChange={(e) => setFormData({...formData, advertisementStartDate: e.target.value})} disabled={viewOnly} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>End Date</label>
                                                <input type="date" value={formData.advertisementEndDate || ''} onChange={(e) => setFormData({...formData, advertisementEndDate: e.target.value})} disabled={viewOnly} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                                            </div>
                                        </div>
                                        <div style={{ marginBottom: '20px' }}>
                                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Ad Status</label>
                                            <select value={formData.advertisementStatus || 'pending'} onChange={(e) => setFormData({...formData, advertisementStatus: e.target.value})} disabled={viewOnly} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                                                <option value="active">Active</option>
                                                <option value="pending">Pending</option>
                                                <option value="expired">Expired</option>
                                                <option value="rejected">Rejected</option>
                                            </select>
                                        </div>
                                        {viewOnly && (
                                            <div style={{ marginTop: '20px', padding: '20px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                                <h4 style={{ margin: '0 0 15px 0', color: '#475569', display: 'flex', alignItems: 'center', gap: '8px' }}><BarChart2 size={18} /> Performance Metrics</h4>
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
                                                    <div style={{ textAlign: 'center' }}>
                                                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Impressions</div>
                                                        <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{formData.advertisementImpressions || 0}</div>
                                                    </div>
                                                    <div style={{ textAlign: 'center' }}>
                                                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Clicks</div>
                                                        <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{formData.advertisementClicks || 0}</div>
                                                    </div>
                                                    <div style={{ textAlign: 'center' }}>
                                                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>CTR</div>
                                                        <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{formData.advertisementImpressions > 0 ? ((formData.advertisementClicks / formData.advertisementImpressions) * 100).toFixed(1) : 0}%</div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                                        <div style={{ fontSize: '1.1rem', marginBottom: '10px' }}>{getTabLabel()} Management</div>
                                        <p>Form fields for {getTabLabel()} will be implemented based on API requirements.</p>
                                    </div>
                                )}
                            </div>
                            {!viewOnly && (
                                <div style={{ padding: '20px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '10px', position: 'sticky', bottom: 0, background: 'white', zIndex: 10 }}>
                                    <button onClick={() => setShowModal(false)} style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #cbd5e1', background: 'white', cursor: 'pointer' }}>Cancel</button>
                                    <button onClick={() => setShowModal(false)} style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: 'var(--navy)', color: 'white', cursor: 'pointer' }}>
                                        {modalMode === 'add' ? `Create ${getTabLabel()}` : `Update ${getTabLabel()}`}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </SidebarLayout>
    );
};

export default ManagerAdsPage;
