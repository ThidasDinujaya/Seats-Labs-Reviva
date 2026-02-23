import React, { useState, useEffect } from 'react';
import SidebarLayout from '../components/SidebarLayout';
import { serviceApi, timeSlotApi } from '../api/api';
import { Plus, X, Search, Package, List, Settings, Eye, Edit2, Trash2, Clock, Save } from 'lucide-react';

const ManagerServicesPage = () => {
    const [activeTab, setActiveTab] = useState('categories');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const [services, setServices] = useState([]);
    const [categories, setCategories] = useState([]);
    const [packages, setPackages] = useState([]);
    const [timeSlots, setTimeSlots] = useState([]);

    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('add');
    const [currentItem, setCurrentItem] = useState(null);
    const [viewOnly, setViewOnly] = useState(false);
    const [selectedId, setSelectedId] = useState(null);

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
        timeSlotDate: '',
        timeSlotStartTime: '',
        timeSlotEndTime: '',
        timeSlotMaxCapacity: 3,
        timeSlotIsActive: true
    });

    useEffect(() => {
        fetchData();
        setSelectedId(null);

    }, [activeTab]);

    const fetchData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'services') {
                const [sRes, cRes, pRes] = await Promise.all([
                    serviceApi.getAll(),
                    serviceApi.getCategory(),
                    serviceApi.getPackage()
                ]);
                if (sRes.success) setServices(sRes.data);
                if (cRes.success) setCategories(cRes.data);
                if (pRes.success) setPackages(pRes.data);
            } else if (activeTab === 'categories') {
                const res = await serviceApi.getCategory();
                if (res.success) setCategories(res.data);
            } else if (activeTab === 'packages') {
                const [pRes, sRes] = await Promise.all([serviceApi.getPackage(), serviceApi.getAll()]);
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
        setTimeSlotForm({ timeSlotDate: '', timeSlotStartTime: '', timeSlotEndTime: '', timeSlotMaxCapacity: 3, timeSlotIsActive: true });
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
                timeSlotDate: item.timeSlotDate ? item.timeSlotDate.split('T')[0] : '',
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
        } else if (activeTab === 'categories') {
            data = categories.filter(c => c.serviceCategoryName.toLowerCase().includes(searchTerm.toLowerCase()));
        } else if (activeTab === 'packages') {
            data = packages.filter(p => p.servicePackageName.toLowerCase().includes(searchTerm.toLowerCase()));
        } else if (activeTab === 'timeslots') {
            data = timeSlots.filter(t =>
                (t.timeSlotDate || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                t.timeSlotStartTime.toLowerCase().includes(searchTerm.toLowerCase()) ||
                t.timeSlotEndTime.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        return data;
    };

    const entityLabel = activeTab === 'categories' ? 'Service Category' : activeTab === 'services' ? 'Service' : activeTab === 'packages' ? 'Service Package' : 'Time Slot';

    return (
        <SidebarLayout role="manager">
            <>
            <div style={{ height: 'calc(100vh - 140px)', display: 'flex', flexDirection: 'column' }}>
                <div style={{ marginBottom: '15px' }}>
                    <h1 style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--navy)', margin: 0 }}>Service Management</h1>
                    {error && <p style={{ color: 'red', margin: '5px 0' }}>{error}</p>}
                    <p style={{ color: '#666', margin: 0 }}>Manage service categories, services, and service packages.</p>
                </div>

                <div style={{ padding: '20px', borderBottom: '1px solid #f1f5f9', background: '#fff', borderTopLeftRadius: '16px', borderTopRightRadius: '16px' }}>
                    <div style={tabContainerStyle}>
                        <button onClick={() => setActiveTab('categories')} style={activeTab === 'categories' ? activeTabStyle : tabStyle}>
                            <List size={18} /> Service Category
                        </button>
                        <button onClick={() => setActiveTab('services')} style={activeTab === 'services' ? activeTabStyle : tabStyle}>
                            <Settings size={18} /> Service
                        </button>
                        <button onClick={() => setActiveTab('packages')} style={activeTab === 'packages' ? activeTabStyle : tabStyle}>
                            <Package size={18} /> Service Package
                        </button>
                        <button onClick={() => setActiveTab('timeslots')} style={activeTab === 'timeslots' ? activeTabStyle : tabStyle}>
                            <Clock size={18} /> Time Slot
                        </button>
                    </div>

                    <div style={{ display: 'flex', gap: '15px' }}>
                        <div style={{ position: 'relative', flex: 1 }}>
                            <Search size={20} style={searchIconStyle} />
                            <input
                                type="text"
                                placeholder={`Search ${activeTab === 'categories' ? 'Service Category' : activeTab === 'services' ? 'Service' : activeTab === 'packages' ? 'Service Package' : 'Time Slot'}...`}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ ...searchInputStyle, paddingLeft: '40px', fontSize: '0.9rem' }}
                            />
                        </div>
                                            </div>
                </div>

            {}
            <div style={{
                background: '#fff',
                borderRadius: '16px',
                border: '1px solid #f1f5f9',
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                position: 'relative'
            }}>
                <div style={{ flex: 1, overflow: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', minWidth: activeTab === 'services' ? '1200px' : '1000px' }}>
                        <thead style={{ position: 'sticky', top: 0, zIndex: 10, background: '#fff' }}>
                            <tr style={{ borderBottom: '2px solid #f1f5f9' }}>
                                {activeTab === 'services' && (
                                    <>
                                        <th style={thStyle}>serviceId</th>
                                        <th style={thStyle}>serviceName</th>
                                        <th style={thStyle}>serviceCategoryId</th>
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
                                        <th style={thStyle}>servicePackageDescription</th>
                                        <th style={thStyle}>servicePackagePrice</th>
                                        <th style={{ ...thStyle, textAlign: 'right' }}>servicePackageIsActive</th>
                                    </>
                                )}
                                {activeTab === 'timeslots' && (
                                    <>
                                        <th style={thStyle}>timeSlotId</th>
                                        <th style={thStyle}>timeSlotDate</th>
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
                                <tr><td colSpan="6" style={loadingCellStyle}>Synchronizing Service Assets...</td></tr>
                            ) : filteredData().length > 0 ? (
                                filteredData().map((item, idx) => {
                                    const id = activeTab === 'services' ? item.serviceId : activeTab === 'categories' ? item.serviceCategoryId : activeTab === 'packages' ? item.servicePackageId : item.timeSlotId;
                                    const isSelected = selectedId === id;
                                    return (
                                        <tr
                                            key={idx}
                                            style={{ borderBottom: '1px solid #f1f5f9', background: isSelected ? '#f8fafc' : 'transparent', cursor: 'pointer', transition: 'background 0.2s' }}
                                            onClick={() => setSelectedId(isSelected ? null : id)}
                                        >
                                            {activeTab === 'services' && (
                                                <>
                                                    <td style={{ ...tdStyle, fontWeight: '800', color: 'var(--navy)' }}>{item.serviceId}</td>
                                                    <td style={{ ...tdStyle, fontWeight: '700' }}>{item.serviceName}</td>
                                                    <td style={tdStyle}>{item.serviceCategoryId ?? '-'}</td>
                                                    <td style={{ ...tdStyle, fontWeight: '600' }}>{item.serviceDuration} mins</td>
                                                    <td style={{ ...tdStyle, fontWeight: '800', color: 'var(--crimson)' }}>Rs. {parseFloat(item.servicePrice).toLocaleString()}</td>
                                                    <td style={{ ...tdStyle, textAlign: 'right' }}>
                                                        <span style={{
                                                            padding: '6px 12px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: '800',
                                                            background: item.serviceIsActive ? '#dcfce7' : '#fee2e2', color: item.serviceIsActive ? '#15803d' : '#b91c1c',
                                                            textTransform: 'uppercase'
                                                        }}>
                                                            {item.serviceIsActive ? 'Active' : 'Halted'}
                                                        </span>
                                                    </td>
                                                </>
                                            )}
                                            {activeTab === 'categories' && (
                                                <>
                                                    <td style={{ ...tdStyle, fontWeight: '800', color: 'var(--navy)' }}>{item.serviceCategoryId}</td>
                                                    <td style={{ ...tdStyle, fontWeight: '700' }}>{item.serviceCategoryName}</td>
                                                    <td style={{ ...tdStyle, fontSize: '0.75rem', color: '#64748b' }}>{item.serviceCategoryDescription || '-'}</td>
                                                    <td style={{ ...tdStyle, textAlign: 'right' }}>
                                                        <span style={{
                                                            padding: '6px 12px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: '800',
                                                            background: item.serviceCategoryIsActive ? '#dcfce7' : '#fee2e2', color: item.serviceCategoryIsActive ? '#15803d' : '#b91c1c',
                                                            textTransform: 'uppercase'
                                                        }}>
                                                            {item.serviceCategoryIsActive ? 'Active' : 'Inactive'}
                                                        </span>
                                                    </td>
                                                </>
                                            )}
                                            {activeTab === 'packages' && (
                                                <>
                                                    <td style={{ ...tdStyle, fontWeight: '800', color: 'var(--navy)' }}>{item.servicePackageId}</td>
                                                    <td style={{ ...tdStyle, fontWeight: '700' }}>{item.servicePackageName}</td>
                                                    <td style={{ ...tdStyle, fontSize: '0.75rem', color: '#64748b' }}>{item.servicePackageDescription || '-'}</td>
                                                    <td style={{ ...tdStyle, fontWeight: '800', color: 'var(--crimson)' }}>Rs. {parseFloat(item.servicePackagePrice).toLocaleString()}</td>
                                                    <td style={{ ...tdStyle, textAlign: 'right' }}>
                                                        <span style={{
                                                            padding: '6px 12px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: '800',
                                                            background: item.servicePackageIsActive ? '#dcfce7' : '#fee2e2', color: item.servicePackageIsActive ? '#15803d' : '#b91c1c',
                                                            textTransform: 'uppercase'
                                                        }}>
                                                            {item.servicePackageIsActive ? 'Active' : 'Halted'}
                                                        </span>
                                                    </td>
                                                </>
                                            )}
                                            {activeTab === 'timeslots' && (
                                                <>
                                                    <td style={{ ...tdStyle, fontWeight: '800', color: 'var(--navy)' }}>{item.timeSlotId}</td>
                                                    <td style={{ ...tdStyle, fontWeight: '700' }}>{item.timeSlotDate ? new Date(item.timeSlotDate).toLocaleDateString() : '-'}</td>
                                                    <td style={{ ...tdStyle, fontWeight: '700' }}>{item.timeSlotStartTime}</td>
                                                    <td style={{ ...tdStyle, fontWeight: '700' }}>{item.timeSlotEndTime}</td>
                                                    <td style={{ ...tdStyle, fontWeight: '800' }}>{item.timeSlotMaxCapacity} units</td>
                                                    <td style={{ ...tdStyle, textAlign: 'right' }}>
                                                        <span style={{
                                                            padding: '6px 12px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: '800',
                                                            background: item.timeSlotIsActive ? '#dcfce7' : '#fee2e2', color: item.timeSlotIsActive ? '#15803d' : '#b91c1c',
                                                            textTransform: 'uppercase'
                                                        }}>
                                                            {item.timeSlotIsActive ? 'Open' : 'Closed'}
                                                        </span>
                                                    </td>
                                                </>
                                            )}
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr><td colSpan="6" style={loadingCellStyle}>No Data Found in Service Registry.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {}
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
                    <button onClick={openAddModal} style={{ padding: '12px 24px', borderRadius: '8px', border: 'none', background: 'var(--navy)', color: 'white', cursor: 'pointer', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}>
                        <Plus size={18} /> Add {entityLabel}
                    </button>
                    <button
                        onClick={openViewModal}
                        disabled={!selectedId}
                        style={{ padding: '12px 24px', borderRadius: '8px', border: 'none', background: selectedId ? 'var(--yellow)' : '#f1f5f9', color: selectedId ? 'black' : '#94a3b8', cursor: selectedId ? 'pointer' : 'default', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}
                    >
                        <Eye size={18} /> View {entityLabel}
                    </button>
                </div>
            </div>
            </div>

            {}
            {showModal && (
                <div style={modalOverlayStyle}>
                    <div style={modalContentStyle}>
                        <div style={modalHeaderStyle}>
                            <h2 style={{ margin: 0 }}>
                                {modalMode === 'add' ? 'Add' : modalMode === 'view' ? 'View' : 'Update'} {
                                    activeTab === 'categories' ? 'Service Category' :
                                    activeTab === 'services' ? 'Service' :
                                    activeTab === 'packages' ? 'Service Package' :
                                    'Time Slot'
                                }
                            </h2>
                            <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><X size={20} /></button>
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
                                         <label style={labelStyle}>Time Slot Date</label>
                                         <input
                                             type="date"
                                             value={timeSlotForm.timeSlotDate}
                                             onChange={(e) => setTimeSlotForm({...timeSlotForm, timeSlotDate: e.target.value})}
                                             required
                                             style={inputStyle}
                                             disabled={viewOnly}
                                         />
                                     </div>
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

                            {viewOnly ? (
                                <div style={modalFooterStyle}>
                                    <button
                                        type="button"
                                        onClick={() => { setViewOnly(false); setModalMode('edit'); }}
                                        style={{ ...submitBtnStyle, background: '#3b82f6', display: 'flex', alignItems: 'center', gap: '8px' }}
                                    >
                                        <Edit2 size={18} /> Update {entityLabel}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            handleDelete(selectedId);
                                            setShowModal(false);
                                            setSelectedId(null);
                                        }}
                                        style={{ ...submitBtnStyle, background: '#ef4444', display: 'flex', alignItems: 'center', gap: '8px' }}
                                    >
                                        <Trash2 size={18} /> Delete {entityLabel}
                                    </button>
                                </div>
                            ) : (
                                <div style={modalFooterStyle}>
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        style={{ ...submitBtnStyle, background: 'white', color: '#64748b', border: '1px solid #e2e8f0' }}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        style={{ ...submitBtnStyle, display: 'flex', alignItems: 'center', gap: '8px' }}
                                    >
                                        <Save size={18} /> {modalMode === 'add' ? `Save ${entityLabel}` : 'Save Changes'}
                                    </button>
                                </div>
                            )}
                        </form>
                    </div>
                </div>
            )}
            </>
        </SidebarLayout>
    );
};

const submitBtnStyle = { padding: '10px 20px', borderRadius: '8px', border: 'none', background: 'var(--navy)', color: 'white', cursor: 'pointer' };
const tabContainerStyle = { display: 'flex', gap: '8px', marginBottom: '25px', padding: '6px', background: '#f1f5f9', borderRadius: '12px', alignSelf: 'flex-start', width: 'fit-content' };
const tabStyle = { padding: '10px 20px', border: 'none', background: 'transparent', color: '#475569', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px', borderRadius: '8px', transition: 'all 0.2s ease' };
const activeTabStyle = { ...tabStyle, color: 'white', background: 'var(--navy)', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' };
const searchIconStyle = { position: 'absolute', left: '12px', top: '12px', color: '#94a3b8' };
const searchInputStyle = { width: '100%', padding: '12px 12px 12px 40px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none' };
const thStyle = { padding: '15px 20px', textAlign: 'left', fontWeight: '600', color: '#64748b', fontSize: '0.85rem', textTransform: 'uppercase' };
const tdStyle = { padding: '15px 20px', color: '#334155', fontSize: '0.95rem' };
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
