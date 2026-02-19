import React, { useState, useRef, useCallback, useEffect } from 'react';
import SidebarLayout from '../components/SidebarLayout';
import { reportApi, settingsApi } from '../api/api';
import { useAuth } from '../context/AuthContext';
import { jsPDF } from "jspdf";
import html2canvas from 'html2canvas';
import { Eye, Download } from 'lucide-react';

// Helper Components - Business Professional Design
// Helper Components - Ledger Style
const Table = ({ headers, rows, alignments }) => (
    <div style={{ width: '100%', marginBottom: '40px', marginTop: '20px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem', tableLayout: 'auto' }}>
            <thead>
                <tr style={{ background: 'var(--navy)', color: 'white' }}>
                    {headers.map((h, i) => (
                        <th key={i} style={{ 
                            padding: '10px 8px', 
                            textAlign: alignments?.[i] || 'left', 
                            fontWeight: '800', 
                            textTransform: 'uppercase', 
                            letterSpacing: '0.1px',
                            wordBreak: 'break-word',
                            minWidth: '60px'
                        }}>{h}</th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {rows && rows.length > 0 ? (
                    rows.map((row, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid #e2e8f0', transition: 'background 0.2s' }}>
                           {row.map((cell, j) => (
                               <td key={j} style={{ 
                                   padding: '10px 8px', 
                                   color: '#1e293b', 
                                   fontWeight: '500',
                                   textAlign: alignments?.[j] || 'left',
                                   fontVariantNumeric: 'tabular-nums',
                                   wordBreak: 'break-word'
                               }}>{cell}</td>
                           ))}
                        </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan={headers.length} style={{ padding: '40px', textAlign: 'center', color: '#64748b', fontStyle: 'italic' }}>*** NO ENTRIES RECORDED ***</td>
                    </tr>
                )}
            </tbody>
        </table>
    </div>
);



const ManagerReportsPage = () => {
    // Default to current month
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    
    const { user } = useAuth();
    const [startDate, setStartDate] = useState(firstDay.toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(today.toISOString().split('T')[0]);
    const [activeTab, setActiveTab] = useState('revenue'); // revenue, booking, technician, ad
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [settings, setSettings] = useState({});
    const reportRef = useRef(null);

    // Fetch Report Function
    const fetchReport = useCallback(async () => {
        // Validation
        if (!startDate || !endDate) {
            setError('Please select both start and end dates.');
            return;
        }

        if (new Date(startDate) > new Date(endDate)) {
            setError('Start date cannot be after end date.');
            return;
        }

        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
            setError('Invalid date format. Please use YYYY-MM-DD.');
            return;
        }

        setLoading(true);
        setError(null);
        setData(null);
        try {
            let res;
            if (activeTab === 'revenue') {
                res = await reportApi.getRevenueAnalysis(startDate, endDate);
            } else if (activeTab === 'booking') {
                res = await reportApi.getDailyBookingReport(endDate);
            } else if (activeTab === 'technician') {
                res = await reportApi.getTechnicianPerformance(startDate, endDate);
            } else if (activeTab === 'ad') {
                res = await reportApi.getAdPerformance(startDate, endDate);
            }
            
            if (res.success) {
                setData(res.data);
            } else {
                setError(res.error || 'Failed to load report data');
            }
        } catch (err) {
            console.error(err);
            setError(err.error || err.message || 'Error executing report request');
        } finally {
            setLoading(false);
        }
    }, [activeTab, startDate, endDate]);

    // Fetch Report when params change
    useEffect(() => {
        fetchReport();
    }, [fetchReport]);

    // Fetch System Settings for letterhead
    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await settingsApi.getAll();
                if (res && res.success) {
                    const settingsMap = res.data.reduce((acc, s) => ({
                        ...acc,
                        [s.settingKey]: s.settingValue
                    }), {});
                    setSettings(settingsMap);
                }
            } catch (err) {
                console.error('Settings fetch error:', err);
            }
        };
        fetchSettings();
    }, []);



    // PDF Export Function using html2canvas
    const exportToPDF = async () => {
        if (!reportRef.current) return;

        const btn = document.getElementById('pdf-btn');
        const originalBtnText = btn.innerText;
        btn.innerText = 'Processing...';
        
        try {
            const canvas = await html2canvas(reportRef.current, {
                scale: 2, // Higher scale for better quality
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff'
            });
            
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            
            const imgFinalWidth = pdfWidth; 
            const imgFinalHeight = (canvas.height * pdfWidth) / canvas.width;
            
            let heightLeft = imgFinalHeight;
            let position = 0;

            pdf.addImage(imgData, 'PNG', 0, position, imgFinalWidth, imgFinalHeight);
            heightLeft -= pdfHeight;

            // Only add extra pages if there is meaningful content left (using > 1mm tolerance)
            while (heightLeft > 1) {
              position = heightLeft - imgFinalHeight;
              pdf.addPage();
              pdf.addImage(imgData, 'PNG', 0, position, imgFinalWidth, imgFinalHeight);
              heightLeft -= pdfHeight;
            }

            pdf.save(`SeatsLabs_${activeTab}_report.pdf`);
        } catch (err) {
            console.error("PDF Export Error:", err);
            alert("Failed to generate PDF");
        } finally {
            if (btn) btn.innerText = originalBtnText;
        }
    };

    const tabs = [
        { id: 'revenue', label: 'Financial Report' },
        { id: 'booking', label: 'Operations Registry' },
        { id: 'technician', label: 'Workforce Performance' },
        { id: 'ad', label: 'Marketing Analysis' },
    ];

    return (
        <SidebarLayout role="manager">
            <div style={{ marginBottom: '30px' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--navy)' }}>Business Intelligence</h1>
                <p style={{ color: '#666' }}>Generate formal business reports for specific operational periods.</p>
            </div>

            {/* Controls */}
            <div style={{ background: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', marginBottom: '30px' }}>
                
                {/* Top Row: Report Type */}
                <div style={{ marginBottom: '25px' }}>
                    <label style={{ display: 'block', marginBottom: '10px', fontWeight: '700', fontSize: '0.9rem', color: '#64748b' }}>Report Category</label>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                style={{
                                    padding: '12px 20px',
                                    borderRadius: '8px',
                                    border: 'none',
                                    background: activeTab === tab.id ? 'var(--navy)' : '#f1f5f9',
                                    color: activeTab === tab.id ? 'white' : '#64748b',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    transition: '0.2s',
                                    flex: '1 0 auto',
                                    textAlign: 'center'
                                }}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Middle Row: Dates */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '25px', marginBottom: '25px' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '0.9rem', color: '#64748b' }}>Start Date</label>
                        <input 
                            type="date" 
                            value={startDate} 
                            onChange={(e) => setStartDate(e.target.value)} 
                            disabled={activeTab === 'booking'}
                            style={{ padding: '10px 15px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', background: '#fff', minWidth: '200px' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '0.9rem', color: '#64748b' }}>
                            {activeTab === 'booking' ? 'Select Date' : 'End Date'}
                        </label>
                        <input 
                            type="date" 
                            value={endDate} 
                            onChange={(e) => setEndDate(e.target.value)} 
                            style={{ padding: '10px 15px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', background: '#fff', minWidth: '200px' }}
                        />
                    </div>
                </div>

                {/* Bottom Row: Actions */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '15px', borderTop: '1px solid #f1f5f9', paddingTop: '20px' }}>
                    <button 
                        onClick={fetchReport}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '8px',
                            padding: '10px 24px', borderRadius: '8px', border: 'none',
                            background: 'var(--navy)', color: 'white',
                            fontWeight: '600', cursor: 'pointer',
                            fontSize: '0.95rem'
                        }}
                    >
                        <Eye size={18} />
                        Generate Preview
                    </button>

                    <button 
                        id="pdf-btn"
                        onClick={exportToPDF}
                        disabled={!data}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '8px',
                            padding: '10px 24px', borderRadius: '8px', border: 'none',
                            background: data ? 'var(--crimson)' : '#e2e8f0',
                            color: 'white',
                            fontWeight: '600',
                            cursor: data ? 'pointer' : 'not-allowed',
                            fontSize: '0.95rem'
                        }}
                    >
                        <Download size={18} />
                        Export to PDF
                    </button>
                </div>
            </div>

            {/* Content Area */}
            {loading && <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Processing Request...</div>}
            
            {error && <div style={{ padding: '20px', background: '#fee2e2', color: '#dc2626', borderRadius: '8px' }}>{error}</div>}

            {!loading && !error && data && (
                <div style={{ overflowX: 'auto', padding: '20px 0', background: '#f1f5f9' }}>
                    <div ref={reportRef} style={{ 
                        background: 'white', 
                        width: '210mm', 
                        minHeight: '297mm', 
                        margin: '0 auto', 
                        padding: '25.4mm', 
                        boxSizing: 'border-box',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        boxShadow: '0 0 20px rgba(0,0,0,0.1)',
                        fontFamily: "'Inter', sans-serif", 
                        color: '#000',
                        position: 'relative'
                    }}>
                        
                        <div>
                            {/* Official Letterhead Header - BRANDED */}
                            <div style={{ borderBottom: '2px solid var(--navy)', paddingBottom: '20px', marginBottom: '30px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div>
                                        <h1 style={{ fontSize: '2.4rem', fontWeight: '900', color: 'var(--navy)', margin: 0, letterSpacing: '-1.5px', textTransform: 'uppercase' }}>
                                            SEATS<span style={{ color: 'var(--crimson)' }}>LABS</span>
                                        </h1>
                                        <div style={{ fontSize: '0.8rem', fontWeight: '600', color: '#64748b', marginTop: '4px', letterSpacing: '1px' }}>CERTIFIED AUTOMOTIVE SERVICE NETWORK</div>
                                    </div>
                                    <div style={{ textAlign: 'right', fontSize: '0.75rem', color: '#334155', lineHeight: '1.4' }}>
                                        <div style={{ fontWeight: 'bold', color: 'var(--navy)', marginBottom: '4px', fontSize: '0.8rem' }}>CORPORATE OFFICE</div>
                                        <div>{settings?.contact_address || '123 Automotive Way, Colombo 07, Sri Lanka'}</div>
                                        <div>{settings?.contact_phone || '+94 11 234 5678'}</div>
                                        <div style={{ fontWeight: '600', color: 'var(--crimson)' }}>{settings?.contact_email || 'contact@seatslabs.com'}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Report Metadata Block - Branded */}
                            <div style={{ marginBottom: '30px' }}>
                                <div style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '15px', color: 'var(--navy)', textTransform: 'uppercase', letterSpacing: '-0.5px' }}>
                                    {tabs.find(t => t.id === activeTab)?.label}
                                </div>
                                
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', background: '#f8fafc', padding: '15px', borderLeft: '4px solid var(--navy)', fontSize: '0.75rem' }}>
                                     <div style={{ borderRight: '1px solid #e2e8f0', paddingRight: '10px' }}>
                                        <div style={{ fontWeight: '800', color: 'var(--navy)', marginBottom: '3px' }}>PERIOD:</div>
                                        <div style={{ fontWeight: '600' }}>{`${startDate} TO ${endDate}`}</div>
                                    </div>
                                    <div style={{ borderRight: '1px solid #e2e8f0', padding: '0 10px' }}>
                                        <div style={{ fontWeight: '800', color: 'var(--navy)', marginBottom: '3px' }}>ISSUED BY:</div>
                                        <div style={{ fontWeight: '600' }}>{user?.userName || 'MANAGER PORTAL'}</div>
                                    </div>
                                    <div style={{ borderRight: '1px solid #e2e8f0', padding: '0 10px' }}>
                                        <div style={{ fontWeight: '800', color: 'var(--navy)', marginBottom: '3px' }}>DOCUMENT ID:</div>
                                        <div style={{ fontWeight: '600' }}>SLX-{Math.floor(Math.random() * 1000000)}</div>
                                    </div>
                                    <div style={{ paddingLeft: '10px' }}>
                                        <div style={{ fontWeight: '800', color: 'var(--navy)', marginBottom: '3px' }}>TIMESTAMP:</div>
                                        <div style={{ fontWeight: '600' }}>{new Date().toLocaleDateString()} {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Report Content */}
                            <div style={{ fontFamily: "'Inter', sans-serif" }}>
                                
                                {/* 1. Revenue Analysis */}
                                {activeTab === 'revenue' && (
                                    <>
                                        <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', textTransform: 'uppercase', paddingBottom: '5px', marginBottom: '10px', marginTop: '25px', borderBottom: '1px solid #eee' }}>Operational Revenue Stream</h3>
                                        <Table 
                                            headers={['Service Name', 'Bookings', 'Total Revenue']}
                                            alignments={['left', 'right', 'right']}
                                            rows={data?.serviceRevenue?.byService?.map(item => [
                                                item.serviceName,
                                                item.bookingCount,
                                                `Rs. ${parseFloat(item.totalRevenue).toLocaleString()}`
                                            ])}
                                        />

                                        <h4 style={{ fontSize: '0.9rem', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '10px' }}>Adjustments & Reversals:</h4>
                                        <Table 
                                            headers={['Category', 'Description', 'Amount']}
                                            alignments={['left', 'left', 'right']}
                                            rows={[
                                                ['REFUNDS', 'Processed Reversals', `Rs. ${(data?.refunds?.total || 0).toLocaleString()}`]
                                            ]}
                                        />

                                        <div style={{ borderTop: '2px double #000', paddingTop: '15px', marginTop: '20px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'flex-end', fontSize: '0.9rem' }}>
                                                <div style={{ width: '280px' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                                        <span>GROSS SERVICE REVENUE:</span>
                                                        <span>Rs. {data?.serviceRevenue?.total?.toLocaleString()}</span>
                                                    </div>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                                        <span>ADVERTISING INCOME:</span>
                                                        <span>Rs. {data?.advertisementRevenue?.total?.toLocaleString()}</span>
                                                    </div>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', color: '#ef4444' }}>
                                                        <span>LESS: REFUNDS:</span>
                                                        <span>(Rs. {data?.refunds?.total?.toLocaleString()})</span>
                                                    </div>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '1.1rem', borderTop: '1px solid #000', paddingTop: '10px' }}>
                                                        <span>NET REVENUE:</span>
                                                        <span>Rs. {data?.combinedRevenue?.toLocaleString() ?? '0'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}

                                {/* 2. Daily Booking */}
                                {activeTab === 'booking' && (
                                    <>
                                        <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', textTransform: 'uppercase', paddingBottom: '5px', marginBottom: '10px', marginTop: '25px', borderBottom: '1px solid #eee' }}>Operations Log</h3>
                                        <Table 
                                            headers={['Time', 'Customer', 'Vehicle', 'Service', 'Technician', 'Status']}
                                            alignments={['left', 'left', 'left', 'left', 'left', 'left']}
                                            rows={data?.bookings?.map(b => [
                                                b.bookingStartTime,
                                                `${b.customerFirstName} ${b.customerLastName}`,
                                                b.vehicleRegNumber,
                                                b.serviceName,
                                                b.technicianFirstName || '--',
                                                b.bookingStatus.toUpperCase()
                                            ])}
                                        />
                                        <div style={{ textAlign: 'right', fontWeight: 'bold', fontSize: '1rem', marginTop: '10px' }}>
                                            TOTAL LOG ENTRIES: {data?.totalBookings ?? 0}
                                        </div>
                                    </>
                                )}

                                {/* 3. Technician Performance */}
                                {activeTab === 'technician' && (
                                    <>
                                        <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', textTransform: 'uppercase', paddingBottom: '5px', marginBottom: '10px', marginTop: '25px', borderBottom: '1px solid #eee' }}>Workforce Utilization</h3>
                                        <Table 
                                            headers={['Technician', 'Specialization', 'Total Jobs', 'Completed', 'Rating']}
                                            alignments={['left', 'left', 'right', 'right', 'right']}
                                            rows={data?.technicians?.map(t => [
                                                `${t.technicianFirstName} ${t.technicianLastName}`,
                                                t.technicianSpecialization,
                                                t.totalJobs,
                                                t.completedJobs,
                                                t.averageRating ? `${parseFloat(t.averageRating).toFixed(1)} / 5.0` : 'N/A'
                                            ])}
                                        />
                                    </>
                                )}

                                {/* 4. Ad Performance */}
                                {activeTab === 'ad' && (
                                    <>
                                        <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', textTransform: 'uppercase', paddingBottom: '5px', marginBottom: '10px', marginTop: '25px', borderBottom: '1px solid #eee' }}>Marketing Asset Performance</h3>
                                        <h4 style={{ fontSize: '0.85rem', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '5px' }}>Placement Matrix:</h4>
                                        <Table 
                                            headers={['ID', 'Placement', 'Impressions', 'Clicks', 'CTR']}
                                            alignments={['left', 'left', 'right', 'right', 'right']}
                                            rows={data?.byPlacement?.map(p => [
                                                `#${p.advertisementPlacementId}`,
                                                p.advertisementPlacementName,
                                                p.advertisementImpressions || 0,
                                                p.advertisementClicks || 0,
                                                `${p.ctr}%`
                                            ])}
                                        />
                                        
                                        <h4 style={{ fontSize: '0.85rem', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '5px', marginTop: '20px' }}>Creative Breakdown:</h4>
                                        <Table 
                                            headers={['ID', 'Asset Title', 'Impressions', 'Clicks', 'CTR']}
                                            alignments={['left', 'left', 'right', 'right', 'right']}
                                            rows={data?.topAds?.map(ad => [
                                                `#${ad.advertisementId}`,
                                                ad.advertisementTitle,
                                                ad.advertisementImpressions || 0,
                                                ad.advertisementClicks || 0,
                                                `${ad.ctr}%`
                                            ])}
                                        />
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Report Footer - Branded & Consistent */}
                        <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '15px', marginTop: '40px', textAlign: 'center' }}>
                            <div style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--navy)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                Confidential - Internal Distribution Only
                            </div>
                            <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '6px', lineHeight: '1.4' }}>
                                This document contains proprietary information of Seats Labs Inc. Unauthorized distribution is strictly prohibited.<br />
                                © {new Date().getFullYear()} Seats Labs Inc. All rights reserved.
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </SidebarLayout>
    );
};




export default ManagerReportsPage;
