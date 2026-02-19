import React, { useState, useEffect } from 'react';
import SidebarLayout from '../components/SidebarLayout';
import { serviceApi, timeSlotApi } from '../api/api';
import { Plus, X, Search, Package, List, Settings, Eye, Edit2, Trash2, Clock } from 'lucide-react';
import { formatTime } from '../utils/formatters';

const ManagerServicesPage = () => {
    const [activeTab, setActiveTab] = useState('categories');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('');
    const [filterPackage, setFilterPackage] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [sortOrder, setSortOrder] = useState('desc'); // default to newest first

    // Data states
    const [services, setServices] = useState([]);
    const [categories, setCategories] = useState([]);
    const [packages, setPackages] = useState([]);
    const [timeSlots, setTimeSlots] = useState([]);

    // Modal states
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('add');
    const [currentItem, setCurrentItem] = useState(null);
    const [viewOnly, setViewOnly] = useState(false);
    const [selectedId, setSelectedId] = useState(null);

    // Form states
    const [serviceForm, setServiceForm] = useState({
        serviceName: '',
        serviceDescription: '',
        serviceDuration: '',
        servicePrice: '',
        serviceCategoryId: '',
        serviceIsActive: true
    });

    const [categoryForm, setCategoryForm] = useState({
        serviceCategoryName: '',
        serviceCategoryDescription: '',
        serviceCategoryIsActive: true
    });

    const [packageForm, setPackageForm] = useState({
        servicePackageName: '',
        servicePackageDescription: '',
        servicePackagePrice: '',
        serviceIds: [],
        servicePackageIsActive: true
    });

    const [timeSlotForm, setTimeSlotForm] = useState({
        timeSlotStartTime: '',
        timeSlotEndTime: '',
        timeSlotMaxCapacity: 3,
        timeSlotIsActive: true
    });

    useEffect(() => {
        fetchData();
        setSelectedId(null);
        setFilterCategory('');
        setFilterPackage('');
        setFilterStatus('');
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTab]);

    const fetchData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'services') {
                const [sRes, cRes, pRes] = await Promise.all([
                    serviceApi.getAll(), 
                    serviceApi.getCategories(),
                    serviceApi.getPackages()
                ]);
                if (sRes.success) setServices(sRes.data);
                if (cRes.success) setCategories(cRes.data);
                if (pRes.success) setPackages(pRes.data);
            } else if (activeTab === 'categories') {
                const res = await serviceApi.getCategories();
                if (res.success) setCategories(res.data);
            } else if (activeTab === 'packages') {
                const [pRes, sRes] = await Promise.all([serviceApi.getPackages(), serviceApi.getAll()]);
                if (pRes.success) setPackages(pRes.data);
                if (sRes.success) setServices(sRes.data);
            } else if (activeTab === 'timeslots') {
                const res = await timeSlotApi.getAll();
                if (res.success) setTimeSlots(res.data);
            }
        } catch (err) {
            console.error(err);
            setError('Error loading data');
        } finally {
            setLoading(false);
        }
    };

    const handleServiceSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = modalMode === 'add' 
                ? await serviceApi.create(serviceForm)
                : await serviceApi.update(currentItem.serviceId, serviceForm);
            if (res.success) {
                fetchData();
                setShowModal(false);
            } else {
                alert(res.error || 'Operation failed');
            }
        } catch (err) {
            alert('Error saving service');
        }
    };

    const handleCategorySubmit = async (e) => {
        e.preventDefault();
        try {
            const res = modalMode === 'add'
                ? await serviceApi.createCategory(categoryForm)
                : await serviceApi.updateCategory(currentItem.serviceCategoryId, categoryForm);
            if (res.success) {
                fetchData();
                setShowModal(false);
            } else {
                alert(res.error || 'Operation failed');
            }
        } catch (err) {
            alert('Error saving category');
        }
    };

    const handlePackageSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = modalMode === 'add'
                ? await serviceApi.createPackage(packageForm)
                : await serviceApi.updatePackage(currentItem.servicePackageId, packageForm);
            if (res.success) {
                fetchData();
                setShowModal(false);
            } else {
                alert(res.error || 'Operation failed');
            }
        } catch (err) {
            alert('Error saving package');
        }
    };

    const handleTimeSlotSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = modalMode === 'add'
                ? await timeSlotApi.create(timeSlotForm)
                : await timeSlotApi.update(currentItem.timeSlotId, timeSlotForm);
            if (res.success) {
                fetchData();
                setShowModal(false);
            } else {
                alert(res.error || 'Operation failed');
            }
        } catch (err) {
            alert('Error saving time slot');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this item?')) return;
        try {
            let res;
            if (activeTab === 'services') res = await serviceApi.delete(id);
            else if (activeTab === 'categories') res = await serviceApi.deleteCategory(id);
            else if (activeTab === 'packages') res = await serviceApi.deletePackage(id);
            else if (activeTab === 'timeslots') res = await timeSlotApi.delete(id);
            
            if (res.success) fetchData();
            else alert(res.error || 'Delete failed');
        } catch (err) {
            alert('Error deleting item');
        }
    };

    const openAddModal = () => {
        setModalMode('add');
        setViewOnly(false);
        setCurrentItem(null);
        setServiceForm({ serviceName: '', serviceDescription: '', serviceDuration: '', servicePrice: '', serviceCategoryId: '', serviceIsActive: true });
        setCategoryForm({ serviceCategoryName: '', serviceCategoryDescription: '', serviceCategoryIsActive: true });
        setPackageForm({ servicePackageName: '', servicePackageDescription: '', servicePackagePrice: '', serviceIds: [], servicePackageIsActive: true });
        setTimeSlotForm({ timeSlotStartTime: '', timeSlotEndTime: '', timeSlotMaxCapacity: 3, timeSlotIsActive: true });
        setShowModal(true);
    };

    const openViewModal = () => {
        if (!selectedId) return;
        const item = findSelectedItem();
        setModalMode('view');
        setViewOnly(true);
        setCurrentItem(item);
        fillForm(item);
        setShowModal(true);
    };

    const openEditModal = () => {
        if (!selectedId) return;
        const item = findSelectedItem();
        setModalMode('edit');
        setViewOnly(false);
        setCurrentItem(item);
        fillForm(item);
        setShowModal(true);
    };

    const findSelectedItem = () => {
        if (activeTab === 'services') return services.find(s => s.serviceId === selectedId);
        if (activeTab === 'categories') return categories.find(c => c.serviceCategoryId === selectedId);
        if (activeTab === 'packages') return packages.find(p => p.servicePackageId === selectedId);
        if (activeTab === 'timeslots') return timeSlots.find(t => t.timeSlotId === selectedId);
        return null;
    };

    const fillForm = (item) => {
        if (activeTab === 'services') {
            setServiceForm({
                serviceName: item.serviceName,
                serviceDescription: item.serviceDescription || '',
                serviceDuration: item.serviceDuration,
                servicePrice: item.servicePrice,
                serviceCategoryId: item.serviceCategoryId || '',
                serviceIsActive: item.serviceIsActive
            });
        } else if (activeTab === 'categories') {
            setCategoryForm({
                serviceCategoryName: item.serviceCategoryName,
                serviceCategoryDescription: item.serviceCategoryDescription || '',
                serviceCategoryIsActive: item.serviceCategoryIsActive
            });
        } else if (activeTab === 'packages') {
            setPackageForm({
                servicePackageName: item.servicePackageName,
                servicePackageDescription: item.servicePackageDescription || '',
                servicePackagePrice: item.servicePackagePrice,
                serviceIds: item.services?.filter(s => s.serviceId).map(s => s.serviceId) || [],
                servicePackageIsActive: item.servicePackageIsActive
            });
        } else if (activeTab === 'timeslots') {
            setTimeSlotForm({
                timeSlotStartTime: item.timeSlotStartTime,
                timeSlotEndTime: item.timeSlotEndTime,
                timeSlotMaxCapacity: item.timeSlotMaxCapacity,
                timeSlotIsActive: item.timeSlotIsActive
            });
        }
    };

    const filteredData = () => {
        let data = [];
        if (activeTab === 'services') {
            data = services.filter(s => s.serviceName.toLowerCase().includes(searchTerm.toLowerCase()));
            if (filterCategory) {
                data = data.filter(s => String(s.serviceCategoryId) === String(filterCategory));
            }
            if (filterPackage) {
                data = data.filter(s => s.packages?.some(p => String(p.servicePackageId) === String(filterPackage)));
            }
            if (filterStatus) {
                data = data.filter(s => filterStatus === 'active' ? s.serviceIsActive : !s.serviceIsActive);
            }
        } else if (activeTab === 'categories') {
            data = categories.filter(c => c.serviceCategoryName.toLowerCase().includes(searchTerm.toLowerCase()));
            if (filterStatus) {
                data = data.filter(c => filterStatus === 'active' ? c.serviceCategoryIsActive : !c.serviceCategoryIsActive);
            }
        } else if (activeTab === 'packages') {
            data = packages.filter(p => p.servicePackageName.toLowerCase().includes(searchTerm.toLowerCase()));
            if (filterStatus) {
                data = data.filter(p => filterStatus === 'active' ? p.servicePackageIsActive : !p.servicePackageIsActive);
            }
        } else if (activeTab === 'timeslots') {
            data = timeSlots.filter(t => 
                t.timeSlotStartTime.toLowerCase().includes(searchTerm.toLowerCase()) ||
                t.timeSlotEndTime.toLowerCase().includes(searchTerm.toLowerCase())
            );
            if (filterStatus) {
                data = data.filter(t => filterStatus === 'active' ? t.timeSlotIsActive : !t.timeSlotIsActive);
            }
        }
        if (sortOrder === 'asc') {
            data.sort((a, b) => {
                const idA = activeTab === 'services' ? a.serviceId : activeTab === 'categories' ? a.serviceCategoryId : activeTab === 'packages' ? a.servicePackageId : a.timeSlotId;
                const idB = activeTab === 'services' ? b.serviceId : activeTab === 'categories' ? b.serviceCategoryId : activeTab === 'packages' ? b.servicePackageId : b.timeSlotId;
                return idA - idB;
            });
        } else {
            data.sort((a, b) => {
                const idA = activeTab === 'services' ? a.serviceId : activeTab === 'categories' ? a.serviceCategoryId : activeTab === 'packages' ? a.servicePackageId : a.timeSlotId;
                const idB = activeTab === 'services' ? b.serviceId : activeTab === 'categories' ? b.serviceCategoryId : activeTab === 'packages' ? b.servicePackageId : b.timeSlotId;
                return idB - idA;
            });
        }
        return data;
    };

    const entityLabel = activeTab === 'categories' ? 'Service Category' : activeTab === 'services' ? 'Service' : activeTab === 'packages' ? 'Service Package' : 'Time Slot';

    return (
        <SidebarLayout role="manager">
            <div style={{ height: 'calc(100vh - 80px)', display: 'flex', flexDirection: 'column', marginTop: '-15px' }}>
                <div style={{ marginBottom: '15px' }}>
                    <h1 style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--navy)', margin: 0 }}>Service Management</h1>
                    {error && <p style={{ color: 'red', margin: '5px 0' }}>{error}</p>}
                    <p style={{ color: '#666', margin: 0 }}>Manage service categories, services, and service packages.</p>
                </div>

            {/* Tabs */}
            <div style={tabContainerStyle}>
                <button onClick={() => setActiveTab('categories')} style={activeTab === 'categories' ? activeTabStyle : tabStyle}>
                    <List size={18} /> Service Categories
                </button>
                <button onClick={() => setActiveTab('services')} style={activeTab === 'services' ? activeTabStyle : tabStyle}>
                    <Settings size={18} /> Services
                </button>
                <button onClick={() => setActiveTab('packages')} style={activeTab === 'packages' ? activeTabStyle : tabStyle}>
                    <Package size={18} /> Service Packages
                </button>
                <button onClick={() => setActiveTab('timeslots')} style={activeTab === 'timeslots' ? activeTabStyle : tabStyle}>
                    <Clock size={18} /> Time Slots
                </button>
            </div>

            {/* Search and Filter */}
            <div style={{ ...searchContainerStyle, display: 'flex', gap: '15px', maxWidth: 'none' }}>
                <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
                    <Search size={20} style={searchIconStyle} />
                    <input 
                        type="text" 
                        placeholder={`Search ${activeTab === 'categories' ? 'Service Categories' : activeTab === 'services' ? 'Services' : activeTab === 'packages' ? 'Service Packages' : 'Time Slots'}...`} 
                        value={searchTerm} 
                        onChange={(e) => setSearchTerm(e.target.value)} 
                        style={{ ...searchInputStyle, paddingLeft: '40px' }} 
                    />
                </div>
                
                {activeTab === 'services' && (
                    <>
                        <div style={{ minWidth: '160px' }}>
                            <select 
                                value={filterCategory} 
                                onChange={(e) => setFilterCategory(e.target.value)}
                                style={searchInputStyle}
                            >
                                <option value="">All Categories</option>
                                {categories.map(c => (
                                    <option key={c.serviceCategoryId} value={c.serviceCategoryId}>
                                        {c.serviceCategoryName}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div style={{ minWidth: '160px' }}>
                            <select 
                                value={filterPackage} 
                                onChange={(e) => setFilterPackage(e.target.value)}
                                style={searchInputStyle}
                            >
                                <option value="">All Packages</option>
                                {packages.map(p => (
                                    <option key={p.servicePackageId} value={p.servicePackageId}>
                                        {p.servicePackageName}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </>
                )}

                <div style={{ minWidth: '140px' }}>
                    <select 
                        value={filterStatus} 
                        onChange={(e) => setFilterStatus(e.target.value)}
                        style={searchInputStyle}
                    >
                        <option value="">All Statuses</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>
                </div>

                <div style={{ minWidth: '180px' }}>
                    <select 
                        value={sortOrder} 
                        onChange={(e) => setSortOrder(e.target.value)}
                        style={{ ...searchInputStyle, background: '#f1f5f9', paddingLeft: '15px' }}
                    >
                        <option value="desc">Sort: Newest (ID desc)</option>
                        <option value="asc">Sort: Oldest (ID asc)</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div style={tableWrapperStyle}>
                <table style={tableStyle}>
                    <thead style={tableHeadStyle}>
                        <tr>
                            {activeTab === 'services' && (
                                <>
                                    <th style={thStyle}>serviceId</th>
                                    <th style={thStyle}>serviceName</th>
                                    <th style={thStyle}>serviceCategoryName</th>
                                    <th style={thStyle}>serviceDuration</th>
                                    <th style={thStyle}>servicePrice</th>
                                    <th style={{ ...thStyle, textAlign: 'right' }}>serviceIsActive</th>
                                </>
                            )}
                            {activeTab === 'categories' && (
                                <>
                                    <th style={thStyle}>serviceCategoryId</th>
                                    <th style={thStyle}>serviceCategoryName</th>
                                    <th style={thStyle}>serviceCategoryDescription</th>
                                    <th style={{ ...thStyle, textAlign: 'right' }}>serviceCategoryIsActive</th>
                                </>
                            )}
                            {activeTab === 'packages' && (
                                <>
                                    <th style={thStyle}>servicePackageId</th>
                                    <th style={thStyle}>servicePackageName</th>
                                    <th style={thStyle}>servicePackagePrice</th>
                                    <th style={thStyle}>servicePackageItem</th>
                                    <th style={{ ...thStyle, textAlign: 'right' }}>servicePackageIsActive</th>
                                </>
                            )}
                            {activeTab === 'timeslots' && (
                                <>
                                    <th style={thStyle}>timeSlotId</th>
                                    <th style={thStyle}>timeSlotStartTime</th>
                                    <th style={thStyle}>timeSlotEndTime</th>
                                    <th style={thStyle}>timeSlotMaxCapacity</th>
                                    <th style={{ ...thStyle, textAlign: 'right' }}>timeSlotIsActive</th>
                                </>
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="6" style={loadingCellStyle}>Loading...</td></tr>
                        ) : filteredData().length > 0 ? (
                            filteredData().map((item, idx) => {
                                const id = activeTab === 'services' ? item.serviceId : activeTab === 'categories' ? item.serviceCategoryId : activeTab === 'packages' ? item.servicePackageId : item.timeSlotId;
                                const isSelected = selectedId === id;
                                return (
                                    <tr 
                                        key={idx} 
                                        style={{ ...trStyle, background: isSelected ? '#f1f5f9' : 'transparent', cursor: 'pointer' }}
                                        onClick={() => setSelectedId(isSelected ? null : id)}
                                    >
                                        {activeTab === 'services' && (
                                            <>
                                                <td style={tdStyle}>{item.serviceId}</td>
                                                <td style={tdStyle}><b>{item.serviceName}</b></td>
                                                <td style={tdStyle}>{item.serviceCategoryName || 'Uncategorized'}</td>
                                                <td style={tdStyle}>{item.serviceDuration} mins</td>
                                                <td style={tdStyle}>Rs. {parseFloat(item.servicePrice).toLocaleString()}</td>
                                                <td style={{ ...tdStyle, textAlign: 'right' }}>
                                                    <span style={{ color: item.serviceIsActive ? '#10b981' : '#ef4444', fontWeight: '600' }}>
                                                        {item.serviceIsActive ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>
                                            </>
                                        )}
                                        {activeTab === 'categories' && (
                                            <>
                                                <td style={tdStyle}>{item.serviceCategoryId}</td>
                                                <td style={tdStyle}><b>{item.serviceCategoryName}</b></td>
                                                <td style={tdStyle}>{item.serviceCategoryDescription || '-'}</td>
                                                <td style={{ ...tdStyle, textAlign: 'right' }}>
                                                    <span style={{ color: item.serviceCategoryIsActive ? '#10b981' : '#ef4444', fontWeight: '600' }}>
                                                        {item.serviceCategoryIsActive ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>
                                            </>
                                        )}
                                        {activeTab === 'packages' && (
                                            <>
                                                <td style={tdStyle}>{item.servicePackageId}</td>
                                                <td style={tdStyle}><b>{item.servicePackageName}</b></td>
                                                <td style={tdStyle}>Rs. {parseFloat(item.servicePackagePrice).toLocaleString()}</td>
                                                <td style={tdStyle}>
                                                    {item.services?.filter(s => s.serviceId).map(s => s.serviceName).join(', ') || 'No services'}
                                                </td>
                                                <td style={{ ...tdStyle, textAlign: 'right' }}>
                                                    <span style={{ color: item.servicePackageIsActive ? '#10b981' : '#ef4444', fontWeight: '600' }}>
                                                        {item.servicePackageIsActive ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>
                                            </>
                                        )}
                                        {activeTab === 'timeslots' && (
                                            <>
                                                <td style={tdStyle}>{item.timeSlotId}</td>
                                                <td style={tdStyle}><b>{formatTime(item.timeSlotStartTime)}</b></td>
                                                <td style={tdStyle}>{formatTime(item.timeSlotEndTime)}</td>
                                                <td style={tdStyle}>{item.timeSlotMaxCapacity} bookings</td>
                                                <td style={{ ...tdStyle, textAlign: 'right' }}>
                                                    <span style={{ color: item.timeSlotIsActive ? '#10b981' : '#ef4444', fontWeight: '600' }}>
                                                        {item.timeSlotIsActive ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>
                                            </>
                                        )}
                                    </tr>
                                );
                            })
                        ) : (
                            <tr><td colSpan="6" style={loadingCellStyle}>No data found.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', padding: '20px 0', borderTop: '1px solid #f1f5f9', marginTop: '10px' }}>
                <button onClick={openAddModal} style={{ padding: '10px 24px', borderRadius: '8px', border: 'none', background: 'var(--navy)', color: 'white', cursor: 'pointer', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Plus size={18} /> Add {entityLabel}
                </button>
                <button 
                    onClick={openEditModal} 
                    disabled={!selectedId}
                    style={{ padding: '10px 24px', borderRadius: '8px', border: 'none', background: selectedId ? '#3b82f6' : '#f1f5f9', color: selectedId ? 'white' : '#94a3b8', cursor: selectedId ? 'pointer' : 'default', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                    <Edit2 size={18} /> Update {entityLabel}
                </button>
                <button 
                    onClick={openViewModal} 
                    disabled={!selectedId}
                    style={{ padding: '10px 24px', borderRadius: '8px', border: 'none', background: selectedId ? 'var(--yellow)' : '#f1f5f9', color: selectedId ? 'black' : '#94a3b8', cursor: selectedId ? 'pointer' : 'default', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                    <Eye size={18} /> View {entityLabel}
                </button>
                <button 
                    onClick={() => handleDelete(selectedId)} 
                    disabled={!selectedId}
                    style={{ padding: '10px 24px', borderRadius: '8px', border: 'none', background: selectedId ? '#ef4444' : '#f1f5f9', color: selectedId ? 'white' : '#94a3b8', cursor: selectedId ? 'pointer' : 'default', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                    <Trash2 size={18} /> Delete {entityLabel}
                </button>
            </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div style={modalOverlayStyle}>
                    <div style={modalContentStyle}>
                        <div style={modalHeaderStyle}>
                            <h2 style={{ margin: 0 }}>
                                {modalMode === 'add' ? 'Add' : modalMode === 'view' ? 'View' : 'Edit'} {
                                    activeTab === 'categories' ? 'Service Category' : 
                                    activeTab === 'services' ? 'Service' : 
                                    activeTab === 'packages' ? 'Service Package' :
                                    'Time Slot'
                                }
                            </h2>
                            <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
                        </div>
                        <form style={{ padding: '20px' }} onSubmit={
                            viewOnly ? (e) => e.preventDefault() :
                            activeTab === 'services' ? handleServiceSubmit : 
                            activeTab === 'categories' ? handleCategorySubmit : 
                            activeTab === 'packages' ? handlePackageSubmit :
                            handleTimeSlotSubmit
                        }>
                            {activeTab === 'services' && (
                                <>
                                    <div style={formGroupStyle}>
                                        <label style={labelStyle}>Service Name</label>
                                        <input type="text" value={serviceForm.serviceName} onChange={(e) => setServiceForm({...serviceForm, serviceName: e.target.value})} required style={inputStyle} disabled={viewOnly} />
                                    </div>
                                    <div style={formGroupStyle}>
                                        <label style={labelStyle}>Description</label>
                                        <textarea value={serviceForm.serviceDescription} onChange={(e) => setServiceForm({...serviceForm, serviceDescription: e.target.value})} style={{...inputStyle, height: '80px'}} disabled={viewOnly} />
                                    </div>
                                    <div style={{ display: 'flex', gap: '15px' }}>
                                        <div style={{ ...formGroupStyle, flex: 1 }}>
                                            <label style={labelStyle}>Duration (mins)</label>
                                            <input type="number" value={serviceForm.serviceDuration} onChange={(e) => setServiceForm({...serviceForm, serviceDuration: e.target.value})} required style={inputStyle} disabled={viewOnly} />
                                        </div>
                                        <div style={{ ...formGroupStyle, flex: 1 }}>
                                            <label style={labelStyle}>Price (Rs.)</label>
                                            <input type="number" value={serviceForm.servicePrice} onChange={(e) => setServiceForm({...serviceForm, servicePrice: e.target.value})} required style={inputStyle} disabled={viewOnly} />
                                        </div>
                                    </div>
                                    <div style={formGroupStyle}>
                                        <label style={labelStyle}>Category</label>
                                        <select value={serviceForm.serviceCategoryId} onChange={(e) => setServiceForm({...serviceForm, serviceCategoryId: e.target.value})} style={inputStyle} disabled={viewOnly}>
                                            <option value="">Select Category</option>
                                            {categories.map(c => <option key={c.serviceCategoryId} value={c.serviceCategoryId}>{c.serviceCategoryName}</option>)}
                                        </select>
                                    </div>
                                    <div style={formGroupStyle}>
                                         <label style={labelStyle}>Service Status</label>
                                         <select 
                                             value={serviceForm.serviceIsActive ? 'true' : 'false'} 
                                             onChange={(e) => setServiceForm({...serviceForm, serviceIsActive: e.target.value === 'true'})}
                                             style={inputStyle}
                                             disabled={viewOnly}
                                         >
                                             <option value="true">Active</option>
                                             <option value="false">Inactive</option>
                                         </select>
                                     </div>
                                </>
                            )}

                            {activeTab === 'categories' && (
                                <>
                                    <div style={formGroupStyle}>
                                         <label style={labelStyle}>Category Name</label>
                                         <input type="text" value={categoryForm.serviceCategoryName} onChange={(e) => setCategoryForm({...categoryForm, serviceCategoryName: e.target.value})} required style={inputStyle} disabled={viewOnly} />
                                     </div>
                                     <div style={formGroupStyle}>
                                         <label style={labelStyle}>Description</label>
                                         <textarea value={categoryForm.serviceCategoryDescription} onChange={(e) => setCategoryForm({...categoryForm, serviceCategoryDescription: e.target.value})} style={{...inputStyle, height: '80px'}} disabled={viewOnly} />
                                     </div>
                                     <div style={formGroupStyle}>
                                         <label style={labelStyle}>Category Status</label>
                                         <select 
                                             value={categoryForm.serviceCategoryIsActive ? 'true' : 'false'} 
                                             onChange={(e) => setCategoryForm({...categoryForm, serviceCategoryIsActive: e.target.value === 'true'})}
                                             style={inputStyle}
                                             disabled={viewOnly}
                                         >
                                             <option value="true">Active</option>
                                             <option value="false">Inactive</option>
                                         </select>
                                     </div>
                                </>
                            )}

                            {activeTab === 'packages' && (
                                <>
                                    <div style={formGroupStyle}>
                                         <label style={labelStyle}>Package Name</label>
                                         <input type="text" value={packageForm.servicePackageName} onChange={(e) => setPackageForm({...packageForm, servicePackageName: e.target.value})} required style={inputStyle} disabled={viewOnly} />
                                     </div>
                                     <div style={formGroupStyle}>
                                         <label style={labelStyle}>Description</label>
                                         <textarea value={packageForm.servicePackageDescription} onChange={(e) => setPackageForm({...packageForm, servicePackageDescription: e.target.value})} style={{...inputStyle, height: '80px'}} disabled={viewOnly} />
                                     </div>
                                     <div style={formGroupStyle}>
                                         <label style={labelStyle}>Package Price (Rs.)</label>
                                         <input type="number" value={packageForm.servicePackagePrice} onChange={(e) => setPackageForm({...packageForm, servicePackagePrice: e.target.value})} required style={inputStyle} disabled={viewOnly} />
                                     </div>
                                     <div style={formGroupStyle}>
                                         <label style={labelStyle}>Select Services</label>
                                         <div style={{ maxHeight: '150px', overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '10px' }}>
                                             {services.filter(s => !viewOnly || packageForm.serviceIds.includes(s.serviceId)).map(s => (
                                                 <label key={s.serviceId} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px', cursor: 'pointer' }}>
                                                     <input 
                                                         type="checkbox" 
                                                         disabled={viewOnly}
                                                         checked={packageForm.serviceIds.includes(s.serviceId)}
                                                         onChange={(e) => {
                                                             const ids = e.target.checked 
                                                                 ? [...packageForm.serviceIds, s.serviceId]
                                                                 : packageForm.serviceIds.filter(id => id !== s.serviceId);
                                                             setPackageForm({...packageForm, serviceIds: ids});
                                                         }}
                                                     />
                                                     {s.serviceName} (Rs. {parseFloat(s.servicePrice).toLocaleString()})
                                                 </label>
                                             ))}
                                         </div>
                                     </div>
                                     <div style={formGroupStyle}>
                                         <label style={labelStyle}>Package Status</label>
                                         <select 
                                             value={packageForm.servicePackageIsActive ? 'true' : 'false'} 
                                             onChange={(e) => setPackageForm({...packageForm, servicePackageIsActive: e.target.value === 'true'})}
                                             style={inputStyle}
                                             disabled={viewOnly}
                                         >
                                             <option value="true">Active</option>
                                             <option value="false">Inactive</option>
                                         </select>
                                     </div>
                                </>
                            )}

                            {activeTab === 'timeslots' && (
                                <>
                                    <div style={formGroupStyle}>
                                         <label style={labelStyle}>Start Time</label>
                                         <input 
                                             type="time" 
                                             value={timeSlotForm.timeSlotStartTime} 
                                             onChange={(e) => setTimeSlotForm({...timeSlotForm, timeSlotStartTime: e.target.value})} 
                                             required 
                                             style={inputStyle} 
                                             disabled={viewOnly} 
                                         />
                                     </div>
                                     <div style={formGroupStyle}>
                                         <label style={labelStyle}>End Time</label>
                                         <input 
                                             type="time" 
                                             value={timeSlotForm.timeSlotEndTime} 
                                             onChange={(e) => setTimeSlotForm({...timeSlotForm, timeSlotEndTime: e.target.value})} 
                                             required 
                                             style={inputStyle} 
                                             disabled={viewOnly} 
                                         />
                                     </div>
                                     <div style={formGroupStyle}>
                                         <label style={labelStyle}>Maximum Capacity (Bookings)</label>
                                         <input 
                                             type="number" 
                                             min="1"
                                             max="10"
                                             value={timeSlotForm.timeSlotMaxCapacity} 
                                             onChange={(e) => setTimeSlotForm({...timeSlotForm, timeSlotMaxCapacity: e.target.value})} 
                                             required 
                                             style={inputStyle} 
                                             disabled={viewOnly} 
                                         />
                                     </div>
                                     <div style={formGroupStyle}>
                                         <label style={labelStyle}>Time Slot Status</label>
                                         <select 
                                             value={timeSlotForm.timeSlotIsActive ? 'true' : 'false'} 
                                             onChange={(e) => setTimeSlotForm({...timeSlotForm, timeSlotIsActive: e.target.value === 'true'})}
                                             style={inputStyle}
                                             disabled={viewOnly}
                                         >
                                             <option value="true">Active</option>
                                             <option value="false">Inactive</option>
                                         </select>
                                     </div>
                                </>
                            )}

                            {!viewOnly && (
                                <div style={modalFooterStyle}>
                                    <button type="button" onClick={() => setShowModal(false)} style={cancelBtnStyle}>Cancel</button>
                                    <button type="submit" style={submitBtnStyle}>Save Changes</button>
                                </div>
                            )}
                        </form>
                    </div>
                </div>
            )}
        </SidebarLayout>
    );
};

// Styles
const cancelBtnStyle = { padding: '10px 20px', borderRadius: '8px', border: '1px solid #cbd5e1', background: 'white', cursor: 'pointer' };
const submitBtnStyle = { padding: '10px 20px', borderRadius: '8px', border: 'none', background: 'var(--navy)', color: 'white', cursor: 'pointer' };
const tabContainerStyle = { display: 'flex', gap: '8px', marginBottom: '25px', padding: '6px', background: '#f1f5f9', borderRadius: '12px', alignSelf: 'flex-start', width: 'fit-content' };
const tabStyle = { padding: '10px 20px', border: 'none', background: 'transparent', color: '#475569', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px', borderRadius: '8px', transition: 'all 0.2s ease' };
const activeTabStyle = { ...tabStyle, color: 'white', background: 'var(--navy)', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' };
const searchContainerStyle = { marginBottom: '20px', position: 'relative', maxWidth: '400px' };
const searchIconStyle = { position: 'absolute', left: '12px', top: '12px', color: '#94a3b8' };
const searchInputStyle = { width: '100%', padding: '12px 12px 12px 40px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none' };
const tableWrapperStyle = { background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflowY: 'auto', flex: 1 };
const tableStyle = { width: '100%', borderCollapse: 'collapse' };
const tableHeadStyle = { background: '#f8fafc', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 1 };
const thStyle = { padding: '15px 20px', textAlign: 'left', fontWeight: '600', color: '#64748b', fontSize: '0.85rem', textTransform: 'uppercase' };
const tdStyle = { padding: '15px 20px', color: '#334155', fontSize: '0.95rem' };
const trStyle = { borderBottom: '1px solid #f1f5f9' };
const loadingCellStyle = { padding: '40px', textAlign: 'center', color: '#64748b' };
const modalOverlayStyle = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000 };
const modalContentStyle = { background: 'white', borderRadius: '12px', width: '550px', maxWidth: '95%', maxHeight: '90vh', overflowY: 'auto' };
const modalHeaderStyle = { padding: '20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, backgroundColor: 'white', zIndex: 10 };
const formGroupStyle = { marginBottom: '15px' };
const labelStyle = { display: 'block', marginBottom: '5px', fontSize: '0.85rem', fontWeight: '700', color: '#475569' };
const inputStyle = { width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' };
const modalFooterStyle = { 
    marginTop: '20px', 
    display: 'flex', 
    justifyContent: 'flex-end', 
    gap: '10px',
    position: 'sticky',
    bottom: 0,
    backgroundColor: 'white',
    padding: '20px 0',
    borderTop: '1px solid #e2e8f0',
    zIndex: 10
};

export default ManagerServicesPage;
