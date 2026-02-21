import React, { useState, useEffect } from 'react';
import { 
    Search, Plus, Eye, Edit2, 
    Trash2, X, BarChart2, CheckCircle, Clock, AlertTriangle,
    Layout, Megaphone, CreditCard, Layers, Save
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
                // Real placements from SQL schema
                setPlacements([
                    { 
                        advertisementPlacementId: 1, 
                        advertisementPlacementSlug: 'homepage-top-banner',
                        advertisementPlacementName: 'Homepage Hero Banner', 
                        advertisementPlacementPage: 'Home',
                        advertisementPlacementPosition: 'Top',
                        advertisementPlacementDescription: 'Massive visibility at the top of the home page.',
                        advertisementPlacementWidth: 1200, 
                        advertisementPlacementHeight: 300,
                        advertisementPlacementPrice: 15000.00,
                        advertisementPlacementIsFixed: true,
                        advertisementPlacementCreatedAt: '2026-01-15T10:00:00Z'
                    },
                    { 
                        advertisementPlacementId: 2, 
                        advertisementPlacementSlug: 'sidebar-square',
                        advertisementPlacementName: 'Sidebar Widget', 
                        advertisementPlacementPage: 'Dashboard',
                        advertisementPlacementPosition: 'Right Sidebar',
                        advertisementPlacementDescription: 'Consistent presence while users browse data.',
                        advertisementPlacementWidth: 300, 
                        advertisementPlacementHeight: 250,
                        advertisementPlacementPrice: 5000.00,
                        advertisementPlacementIsFixed: false,
                        advertisementPlacementCreatedAt: '2026-01-20T14:30:00Z'
                    }
                ]);

                setPricingPlans([
                    { planId: 1, planName: 'Performance Starter', price: 12000, duration: '14 Days', description: 'Includes 2 placements + priority support' },
                    { planId: 2, planName: 'Enterprise Growth', price: 45000, duration: '90 Days', description: 'Full site coverage + deep analytics' }
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
        const s = status?.toLowerCase();
        switch (s) {
            case 'active': return { bg: '#ecfdf5', text: '#10b981', icon: <CheckCircle size={14} /> };
            case 'pending': return { bg: '#fff7ed', text: '#f59e0b', icon: <Clock size={14} /> };
            case 'expired': case 'paused': return { bg: '#fffbeb', text: '#d97706', icon: <AlertTriangle size={14} /> };
            case 'rejected': case 'cancelled': return { bg: '#fef2f2', text: '#ef4444', icon: <X size={14} /> };
            default: return { bg: '#f1f5f9', text: '#64748b', icon: null };
        }
    };

    const getColSpan = () => {
        switch(activeTab) {
            case 'ad': return 10;
            case 'campaign': return 7;
            case 'pricing': return 5;
            case 'placement': return 11;
            default: return 1;
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
                     (ad.advertiserBusinessName?.toLowerCase() || '').includes(searchTerm.toLowerCase()))
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
            <>
            <div style={{ height: 'calc(100vh - 140px)', display: 'flex', flexDirection: 'column', padding: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                    <div>
                        <h1 style={{ fontSize: '1.875rem', fontWeight: '800', color: '#1e293b', marginBottom: '8px' }}>Advertisement Management</h1>
                        <p style={{ color: '#64748b', fontSize: '1rem' }}>Manage ads, campaigns, pricing, and placements</p>
                    </div>
                </div>

                <div style={{ 
                    background: '#fff', 
                    borderRadius: '16px', 
                    border: '1px solid #f1f5f9', 
                    flex: 1, 
                    display: 'flex', 
                    flexDirection: 'column', 
                    overflow: 'hidden' 
                }}>
                    <div style={{ padding: '20px', borderBottom: '1px solid #f1f5f9' }}>
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

                        <div style={{ display: 'flex', gap: '15px' }}>
                            <div style={{ position: 'relative', flex: 1 }}>
                                <Search style={{ position: 'absolute', left: '12px', top: '12px', color: '#94a3b8' }} size={20} />
                                <input 
                                    type="text" 
                                    placeholder={`Search ${getTabLabel()}...`} 
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '0.9rem' }} 
                                />
                            </div>
                        </div>
                    </div>

                    <div style={{ 
                        background: '#fff',
                        borderRadius: '16px',
                        border: '1px solid #f1f5f9',
                        display: 'flex',
                        flexDirection: 'column',
                        flex: 1,
                        overflow: 'hidden',
                        position: 'relative'
                    }}>
                        <div style={{ flex: 1, overflow: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', minWidth: activeTab === 'placement' ? '1800px' : activeTab === 'ad' ? '1600px' : '1200px' }}>
                                <thead style={{ position: 'sticky', top: 0, zIndex: 10, background: '#fff' }}>
                                    <tr style={{ background: '#fff', borderBottom: '2px solid #f1f5f9' }}>
                                        {activeTab === 'ad' && (
                                            <>
                                                <th style={{ padding: '15px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', fontSize: '0.7rem' }}>advertisementId</th>
                                                <th style={{ padding: '15px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', fontSize: '0.7rem' }}>advertisementTitle</th>
                                                <th style={{ padding: '15px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', fontSize: '0.7rem' }}>advertisementImageUrl</th>
                                                <th style={{ padding: '15px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', fontSize: '0.7rem' }}>advertisementStartDate</th>
                                                <th style={{ padding: '15px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', fontSize: '0.7rem' }}>advertisementStatus</th>
                                                <th style={{ padding: '15px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', fontSize: '0.7rem' }}>advertiserId</th>
                                                <th style={{ padding: '15px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', fontSize: '0.7rem' }}>advertisementPlacementId</th>
                                                <th style={{ padding: '15px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', fontSize: '0.7rem' }}>advertisementCampaignId</th>
                                                <th style={{ padding: '15px', textAlign: 'right', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', fontSize: '0.7rem' }}>advertisementCreatedAt</th>
                                            </>
                                        )}
                                        {activeTab === 'campaign' && (
                                            <>
                                                <th style={{ padding: '15px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', fontSize: '0.7rem' }}>advertisementCampaignId</th>
                                                <th style={{ padding: '15px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', fontSize: '0.7rem' }}>advertisementCampaignName</th>
                                                <th style={{ padding: '15px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', fontSize: '0.7rem' }}>advertisementCampaignStartDate</th>
                                                <th style={{ padding: '15px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', fontSize: '0.7rem' }}>advertisementCampaignEndDate</th>
                                                <th style={{ padding: '15px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', fontSize: '0.7rem' }}>advertisementCampaignStatus</th>
                                                <th style={{ padding: '15px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', fontSize: '0.7rem' }}>advertiserId</th>
                                                <th style={{ padding: '15px', textAlign: 'right', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', fontSize: '0.7rem' }}>advertisementCampaignCreatedAt</th>
                                            </>
                                        )}
                                        {activeTab === 'pricing' && (
                                            <>
                                                <th style={{ padding: '15px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', fontSize: '0.7rem' }}>advertisementPricingPlanId</th>
                                                <th style={{ padding: '15px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', fontSize: '0.7rem' }}>advertisementPricingPlanName</th>
                                                <th style={{ padding: '15px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', fontSize: '0.7rem' }}>advertisementPricingPlanPrice</th>
                                                <th style={{ padding: '15px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', fontSize: '0.7rem' }}>advertisementPricingPlanDuration</th>
                                                <th style={{ padding: '15px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', fontSize: '0.7rem' }}>advertisementPricingPlanDescription</th>
                                            </>
                                        )}
                                        {activeTab === 'placement' && (
                                            <>
                                                <th style={{ padding: '15px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', fontSize: '0.7rem' }}>advertisementPlacementId</th>
                                                <th style={{ padding: '15px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', fontSize: '0.7rem' }}>advertisementPlacementSlug</th>
                                                <th style={{ padding: '15px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', fontSize: '0.7rem' }}>advertisementPlacementName</th>
                                                <th style={{ padding: '15px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', fontSize: '0.7rem' }}>advertisementPlacementPage</th>
                                                <th style={{ padding: '15px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', fontSize: '0.7rem' }}>advertisementPlacementPosition</th>
                                                <th style={{ padding: '15px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', fontSize: '0.7rem' }}>advertisementPlacementWidth × Height</th>
                                                <th style={{ padding: '15px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', fontSize: '0.7rem' }}>advertisementPlacementIsFixed</th>
                                                <th style={{ padding: '15px', textAlign: 'right', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', fontSize: '0.7rem' }}>advertisementPlacementCreatedAt</th>
                                            </>
                                        )}
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr><td colSpan={getColSpan()} style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>Loading Data Pool...</td></tr>
                                    ) : filteredData.length === 0 ? (
                                        <tr><td colSpan={getColSpan()} style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>No {getTabLabel()} Found in Registry.</td></tr>
                                    ) : (
                                        filteredData.map(item => {
                                            const id = item.advertisementId || item.advertisementCampaignId || item.planId || item.advertisementPlacementId;
                                            return (
                                                <tr key={id} onClick={() => setSelectedId(selectedId === id ? null : id)} style={{ borderBottom: '1px solid #f1f5f9', cursor: 'pointer', transition: 'background 0.2s', background: selectedId === id ? '#f8fafc' : 'transparent' }}>
                                                    {activeTab === 'ad' && (
                                                        <>
                                                            <td style={{ padding: '12px 15px', fontWeight: '800', color: 'var(--navy)' }}>{item.advertisementId}</td>
                                                            <td style={{ padding: '12px 15px', fontWeight: '700' }}>{item.advertisementTitle}</td>
                                                            <td style={{ padding: '12px 15px', color: '#64748b', fontSize: '0.7rem', wordBreak: 'break-all', maxWidth: '150px' }}>{item.advertisementImageUrl || '-'}</td>
                                                            <td style={{ padding: '12px 15px', fontWeight: '600' }}>{item.advertisementStartDate}</td>
                                                            <td style={{ padding: '12px 15px', fontWeight: '600' }}>{item.advertisementEndDate}</td>
                                                            <td style={{ padding: '12px 15px' }}>
                                                                <span style={{ padding: '6px 12px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: '800', background: getStatusStyle(item.advertisementStatus).bg, color: getStatusStyle(item.advertisementStatus).text, display: 'inline-flex', alignItems: 'center', gap: '5px', textTransform: 'uppercase' }}>
                                                                    {getStatusStyle(item.advertisementStatus).icon} {item.advertisementStatus}
                                                                </span>
                                                            </td>
                                                            <td style={{ padding: '12px 15px' }}>{item.advertiserId}</td>
                                                            <td style={{ padding: '12px 15px' }}>{item.advertisementPlacementId || '-'}</td>
                                                            <td style={{ padding: '12px 15px' }}>{item.advertisementCampaignId || '-'}</td>
                                                            <td style={{ padding: '12px 15px', textAlign: 'right', color: '#94a3b8' }}>{new Date(item.advertisementCreatedAt || Date.now()).toLocaleDateString()}</td>
                                                        </>
                                                    )}
                                                    {activeTab === 'campaign' && (
                                                        <>
                                                            <td style={{ padding: '12px 15px', fontWeight: '800', color: 'var(--navy)' }}>{item.advertisementCampaignId}</td>
                                                            <td style={{ padding: '12px 15px', fontWeight: '700' }}>{item.advertisementCampaignName}</td>
                                                            <td style={{ padding: '12px 15px', fontWeight: '600' }}>{item.advertisementCampaignStartDate}</td>
                                                            <td style={{ padding: '12px 15px', fontWeight: '600' }}>{item.advertisementCampaignEndDate}</td>
                                                            <td style={{ padding: '12px 15px' }}>
                                                                <span style={{ padding: '6px 12px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: '800', background: getStatusStyle(item.advertisementCampaignStatus).bg, color: getStatusStyle(item.advertisementCampaignStatus).text, display: 'inline-flex', alignItems: 'center', gap: '5px', textTransform: 'uppercase' }}>
                                                                    {getStatusStyle(item.advertisementCampaignStatus).icon} {item.advertisementCampaignStatus}
                                                                </span>
                                                            </td>
                                                            <td style={{ padding: '12px 15px' }}>{item.advertiserId}</td>
                                                            <td style={{ padding: '12px 15px', textAlign: 'right', color: '#94a3b8' }}>{new Date(item.advertisementCampaignCreatedAt || Date.now()).toLocaleDateString()}</td>
                                                        </>
                                                    )}
                                                    {activeTab === 'pricing' && (
                                                        <>
                                                            <td style={{ padding: '12px 15px', fontWeight: '800', color: 'var(--navy)' }}>{item.planId}</td>
                                                            <td style={{ padding: '12px 15px', fontWeight: '700' }}>{item.planName}</td>
                                                            <td style={{ padding: '12px 15px', fontWeight: '800', color: 'var(--crimson)' }}>Rs. {item.price.toLocaleString()}</td>
                                                            <td style={{ padding: '12px 15px', fontWeight: '600' }}>{item.duration}</td>
                                                            <td style={{ padding: '12px 15px', fontSize: '0.75rem', color: '#64748b' }}>{item.description}</td>
                                                        </>
                                                    )}
                                                    {activeTab === 'placement' && (
                                                        <>
                                                            <td style={{ padding: '12px 15px', fontWeight: '800', color: 'var(--navy)' }}>{item.advertisementPlacementId}</td>
                                                            <td style={{ padding: '12px 15px', fontFamily: 'monospace', fontWeight: '600' }}>{item.advertisementPlacementSlug}</td>
                                                            <td style={{ padding: '12px 15px', fontWeight: '700' }}>{item.advertisementPlacementName}</td>
                                                            <td style={{ padding: '12px 15px' }}>{item.advertisementPlacementPage}</td>
                                                            <td style={{ padding: '12px 15px' }}>{item.advertisementPlacementPosition}</td>
                                                            <td style={{ padding: '12px 15px', fontSize: '0.75rem' }}>{item.advertisementPlacementWidth}×{item.advertisementPlacementHeight}</td>
                                                            <td style={{ padding: '12px 15px', fontWeight: '800', color: 'var(--navy)' }}>Rs. {parseFloat(item.advertisementPlacementPrice || 0).toLocaleString()}</td>
                                                            <td style={{ padding: '12px 15px' }}>{item.advertisementPlacementIsFixed ? 'YES' : 'NO'}</td>
                                                            <td style={{ padding: '12px 15px', textAlign: 'right', color: '#94a3b8' }}>{new Date(item.advertisementPlacementCreatedAt || Date.now()).toLocaleDateString()}</td>
                                                        </>
                                                    )}
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Persistent Floating Logic Container */}
                        <div style={{ 
                            position: 'fixed', 
                            bottom: '30px', 
                            right: '30px', 
                            display: 'flex', 
                            gap: '12px', 
                            zIndex: 1000,
                            background: 'rgba(255,255,255,0.9)',
                            padding: '15px',
                            borderRadius: '12px',
                            boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid #e2e8f0'
                        }}>
                             <button
                                onClick={() => handleOpenModal('add')}
                                style={{ 
                                    padding: '12px 24px', background: 'var(--navy)', color: 'white', border: 'none', borderRadius: '8px', 
                                    cursor: 'pointer', fontWeight: '700', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px',
                                    transition: 'all 0.2s', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
                                }}
                            >
                                <Plus size={18} /> Add {getTabLabel()}
                            </button>
                            <button
                                disabled={!selectedId}
                                onClick={() => {
                                    const idAttribute = activeTab === 'ad' ? 'advertisementId' : activeTab === 'campaign' ? 'advertisementCampaignId' : activeTab === 'pricing' ? 'planId' : 'advertisementPlacementId';
                                    const item = filteredData.find(i => i[idAttribute] === selectedId);
                                    if (item) handleOpenModal('view', item);
                                }}
                                style={{ 
                                    padding: '12px 24px', 
                                    background: selectedId ? 'var(--yellow)' : '#f1f5f9', 
                                    color: selectedId ? 'black' : '#94a3b8', 
                                    border: 'none', 
                                    borderRadius: '8px', 
                                    cursor: selectedId ? 'pointer' : 'default', fontWeight: '700', fontSize: '0.9rem', 
                                    display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s'
                                }}
                            >
                                <Eye size={18} /> View {getTabLabel()}
                            </button>
                        </div>
                    </div>
                </div>
                </div>

                {showModal && (
                    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000 }}>
                        <div style={{ background: 'white', borderRadius: '16px', width: '600px', maxWidth: '90%', maxHeight: '90vh', overflowY: 'auto' }}>
                            <div style={{ padding: '20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: 'white', zIndex: 10 }}>
                                <h2 style={{ margin: 0, color: '#1e293b' }}>{modalMode === 'add' ? `Add ${getTabLabel()}` : modalMode === 'view' ? `View ${getTabLabel()}` : `Update ${getTabLabel()}`}</h2>
                                <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><X size={24} /></button>
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
                            {modalMode === 'view' ? (
                                <div style={{ padding: '20px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '10px', position: 'sticky', bottom: 0, background: 'white', zIndex: 10 }}>
                                    <button 
                                        onClick={() => setModalMode('edit')}
                                        style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#3b82f6', color: 'white', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                                    >
                                        <Edit2 size={18} /> Update {getTabLabel()}
                                    </button>
                                    <button 
                                        onClick={() => {
                                            if (selectedId && window.confirm(`Permanently remove this ${getTabLabel()}?`)) {
                                                alert('Asset decommissioning logic triggered.');
                                                setShowModal(false);
                                                setSelectedId(null);
                                            }
                                        }}
                                        style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#ef4444', color: 'white', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                                    >
                                        <Trash2 size={18} /> Delete {getTabLabel()}
                                    </button>
                                </div>
                            ) : (
                                <div style={{ padding: '20px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '10px', position: 'sticky', bottom: 0, background: 'white', zIndex: 10 }}>
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', color: '#64748b', fontWeight: 'bold', cursor: 'pointer' }}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => alert('Save logic will be connected to API.')}
                                        style={{ padding: '10px 24px', borderRadius: '8px', border: 'none', background: 'var(--navy)', color: 'white', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                                    >
                                        <Save size={18} /> {modalMode === 'add' ? `Save ${getTabLabel()}` : 'Save Changes'}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </>
        </SidebarLayout>
    );
};

export default ManagerAdsPage;
