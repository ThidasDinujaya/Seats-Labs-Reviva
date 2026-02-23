import React, { useState, useRef, useCallback, useEffect } from 'react';
import SidebarLayout from '../components/SidebarLayout';
import { reportApi, settingsApi } from '../api/api';
import { useAuth } from '../context/AuthContext';
import { jsPDF } from "jspdf";
import html2canvas from 'html2canvas';
import { Eye, Download } from 'lucide-react';

const Table = ({ headers, rows, alignments, widths }) => (
    <div style={{
        width: '100%',
        marginBottom: '40px',
        marginTop: '20px',
        border: '1px solid #e2e8f0',
        borderRadius: '8px'
    }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem', tableLayout: widths ? 'fixed' : 'auto', background: '#fff' }}>
            <thead>
                <tr style={{ background: 'var(--navy)', color: '#fff' }}>
                    {headers.map((h, i) => (
                        <th key={i} style={{
                            padding: '12px 15px',
                            textAlign: alignments?.[i] || 'left',
                            fontWeight: '800',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            borderRight: i === headers.length - 1 ? 'none' : '1px solid rgba(255,255,255,0.1)',
                            whiteSpace: 'nowrap',
                            width: widths?.[i] || 'auto'
                        }}>{h}</th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {rows && rows.length > 0 ? (
                    rows.map((row, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s' }}>
                           {row.map((cell, j) => (
                               <td key={j} style={{
                                   padding: '10px 15px',
                                   color: '#334155',
                                   fontWeight: '600',
                                   textAlign: alignments?.[j] || 'left',
                                   fontVariantNumeric: 'tabular-nums',
                                   borderRight: j === row.length - 1 ? 'none' : '1px solid #f1f5f9',
                                   background: i % 2 === 0 ? '#fff' : '#f8fafc',
                                   overflow: 'hidden',
                                   textOverflow: 'ellipsis',
                                   whiteSpace: 'nowrap'
                               }} title={typeof cell === 'string' ? cell : undefined}>{cell}</td>
                           ))}
                        </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan={headers.length} style={{ padding: '40px', textAlign: 'center', color: '#64748b', fontStyle: 'italic', fontWeight: '800' }}>--- NO DATA FOUND FOR SELECTED PERIOD ---</td>
                    </tr>
                )}
            </tbody>
        </table>
    </div>
);

const ManagerReportsPage = () => {

    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);

    const { user } = useAuth();
    const [startDate, setStartDate] = useState(firstDay.toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(today.toISOString().split('T')[0]);
    const [activeTab, setActiveTab] = useState('revenue');
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [settings, setSettings] = useState({});
    const reportRef = useRef(null);

    const fetchReport = useCallback(async () => {
        if (!startDate || !endDate) return;

        if (new Date(startDate) > new Date(endDate)) {
            setError('Start date cannot be after end date.');
            return;
        }

        setLoading(true);
        setError(null);

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

            if (res && res.success) {
                setData(res.data);
            } else {
                setError(res?.error || 'Failed to populate report ledger');
            }
        } catch (err) {
            console.error('Report Generation Error:', err);
            setError(err.message || 'Critical failure in report engine');
        } finally {
            setLoading(false);
        }
    }, [activeTab, startDate, endDate]);

    useEffect(() => {
        fetchReport();
    }, [activeTab, startDate, endDate, fetchReport]);

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

    const exportToPDF = async () => {
        if (!reportRef.current) return;
        const btn = document.getElementById('pdf-btn');
        const originalBtnText = btn.innerText;
        btn.innerText = 'Processing...';

        try {
            const canvas = await html2canvas(reportRef.current, {
                scale: 2,
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
            <div style={{ height: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
                <div style={{ flexShrink: 0, marginBottom: '20px' }}>
                    <h1 style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--navy)' }}>Business Intelligence</h1>
                    <p style={{ color: '#666' }}>Generate formal business reports for specific operational periods.</p>
                </div>

                {}
                <div style={{ background: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', marginBottom: '30px', flexShrink: 0 }}>
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

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '25px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '0.9rem', color: '#64748b' }}>Start Date</label>
                            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} disabled={activeTab === 'booking'} style={{ padding: '10px 15px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', background: '#fff', minWidth: '200px' }} />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '0.9rem', color: '#64748b' }}>{activeTab === 'booking' ? 'Select Date' : 'End Date'}</label>
                            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} style={{ padding: '10px 15px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', background: '#fff', minWidth: '200px' }} />
                        </div>
                    </div>
                </div>

                {}
                <div style={{ flex: 1, overflowY: 'auto', paddingRight: '10px', paddingBottom: '100px', position: 'relative' }}>
                    {}
                    {loading && (
                        <div style={{
                            position: 'absolute',
                            top: 0, left: 0, right: 0, bottom: 0,
                            background: data ? 'rgba(255,255,255,0.6)' : 'transparent',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            zIndex: 100,
                            backdropFilter: data ? 'blur(2px)' : 'none'
                        }}>
                            <div style={{ padding: '20px 40px', background: 'var(--navy)', color: 'white', borderRadius: '50px', fontWeight: '800', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}>
                                {data ? 'Refreshing Analytics...' : 'Initializing Engine...'}
                            </div>
                        </div>
                    )}

                    {error && <div style={{ padding: '20px', background: '#fee2e2', color: '#dc2626', borderRadius: '8px', marginBottom: '20px' }}>{error}</div>}

                    {!error && data && (
                        <>
                            <div style={{ padding: '20px 0', background: '#f1f5f9', display: 'flex', justifyContent: 'center' }}>
                                <div ref={reportRef} style={{
                                    background: 'white',
                                    width: '210mm',
                                    minHeight: '297mm',
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
                                        {}
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

                                        {}
                                        <div style={{ marginBottom: '30px' }}>
                                            <div style={{ fontSize: '1.2rem', fontWeight: '900', marginBottom: '15px', color: '#000', textTransform: 'uppercase', letterSpacing: '-0.5px' }}>
                                                {tabs.find(t => t.id === activeTab)?.label}
                                            </div>
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', background: '#fff', padding: '15px', border: '1px solid #000', fontSize: '0.75rem' }}>
                                                <div style={{ borderRight: '1px solid #000', paddingRight: '10px' }}>
                                                    <div style={{ fontWeight: '900', color: '#000', marginBottom: '3px' }}>PERIOD:</div>
                                                    <div style={{ fontWeight: '700' }}>{activeTab === 'booking' ? endDate : `${startDate} TO ${endDate}`}</div>
                                                </div>
                                                <div style={{ borderRight: '1px solid #000', padding: '0 10px' }}>
                                                    <div style={{ fontWeight: '900', color: '#000', marginBottom: '3px' }}>ISSUED BY:</div>
                                                    <div style={{ fontWeight: '700' }}>{user?.userName || 'MANAGER PORTAL'}</div>
                                                </div>
                                                <div style={{ borderRight: '1px solid #000', padding: '0 10px' }}>
                                                    <div style={{ fontWeight: '900', color: '#000', marginBottom: '3px' }}>DOCUMENT ID:</div>
                                                    <div style={{ fontWeight: '700' }}>SLX-{Math.floor(Math.random() * 1000000)}</div>
                                                </div>
                                                <div style={{ paddingLeft: '10px' }}>
                                                    <div style={{ fontWeight: '900', color: '#000', marginBottom: '3px' }}>TIMESTAMP:</div>
                                                    <div style={{ fontWeight: '700' }}>{new Date().toLocaleDateString()} {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                                </div>
                                            </div>
                                        </div>

                                        {}
                                        <div style={{ fontFamily: "'Inter', sans-serif" }}>
                                            {activeTab === 'revenue' && (
                                                <>
                                                    <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', textTransform: 'uppercase', paddingBottom: '5px', marginBottom: '10px', marginTop: '25px', borderBottom: '1px solid #eee' }}>Operational Revenue Stream</h3>
                                                    <Table headers={['serviceName', 'bookingCount', 'totalRevenue']} alignments={['left', 'right', 'right']} rows={data?.serviceRevenue?.byService?.map(item => [item.serviceName, item.bookingCount, `Rs. ${parseFloat(item.totalRevenue).toLocaleString()}`])} />
                                                    <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', textTransform: 'uppercase', paddingBottom: '5px', marginBottom: '10px', marginTop: '25px', borderBottom: '1px solid #eee' }}>Advertising Income Stream</h3>
                                                    <Table headers={['advertiserBusinessName', 'paymentCount', 'advertiserRevenue']} alignments={['left', 'right', 'right']} rows={data?.advertisementRevenue?.byAdvertiser?.map(item => [item.advertiserBusinessName, item.paymentCount, `Rs. ${parseFloat(item.advertiserRevenue).toLocaleString()}`])} />
                                                    <div style={{ borderTop: '2px double #000', paddingTop: '15px', marginTop: '20px' }}>
                                                        <div style={{ display: 'flex', justifyContent: 'flex-end', fontSize: '0.9rem' }}>
                                                            <div style={{ width: '280px' }}>
                                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}><span>GROSS SERVICE REVENUE:</span><span>Rs. {data?.serviceRevenue?.total?.toLocaleString()}</span></div>
                                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}><span>ADVERTISING INCOME:</span><span>Rs. {data?.advertisementRevenue?.total?.toLocaleString()}</span></div>
                                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', color: 'var(--crimson)', fontWeight: '700' }}><span>LESS: REFUNDS:</span><span>(Rs. {data?.refunds?.total?.toLocaleString()})</span></div>
                                                                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '1.1rem', borderTop: '1px solid #000', paddingTop: '10px' }}><span>NET REVENUE:</span><span>Rs. {data?.combinedRevenue?.toLocaleString() ?? '0'}</span></div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </>
                                            )}
                                            {activeTab === 'booking' && (
                                                <>
                                                    <div style={{ border: '2px solid #000', padding: '15px', marginTop: '20px', marginBottom: '30px', background: '#f8fafc' }}>
                                                        <h4 style={{ margin: '0 0 15px 0', fontSize: '0.85rem', fontWeight: '900', color: '#000', borderBottom: '1px solid #000', paddingBottom: '5px' }}>DAILY PERFORMANCE OVERVIEW</h4>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '20px' }}>
                                                            {[
                                                                { label: 'Total Registry Entries', value: data?.totalBookings || 0 },
                                                                { label: 'Completion Rate', value: `${data?.totalBookings > 0 ? ((data?.statusBreakdown?.find(s => s.bookingStatus === 'completed')?.count || 0) / data.totalBookings * 100).toFixed(0) : 0}%` },
                                                                { label: 'Active Pipeline', value: data?.statusBreakdown?.find(s => s.bookingStatus === 'in_progress')?.count || 0 },
                                                                { label: 'Gross Revenue', value: `Rs. ${parseFloat(data?.totalRevenue || 0).toLocaleString()}` }
                                                            ].map((kpi, i) => (
                                                                <div key={i} style={{ flex: 1, borderRight: i === 3 ? 'none' : '1px solid #cbd5e1', paddingRight: i === 3 ? 0 : '15px' }}>
                                                                    <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: '800', textTransform: 'uppercase' }}>{kpi.label}</div>
                                                                    <div style={{ fontSize: '1.1rem', fontWeight: '900', color: '#000' }}>{kpi.value}</div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <h3 style={{ fontSize: '1.2rem', fontWeight: '900', color: '#000', textTransform: 'uppercase', marginBottom: '15px', borderLeft: '4px solid #000', paddingLeft: '10px' }}>Technical Operation Ledger</h3>
                                                    <Table headers={['ID.', 'REF.', 'TIME', 'CUSTOMER', 'REG. NO', 'SERVICE', 'STATUS']} alignments={['left', 'left', 'left', 'left', 'left', 'left', 'left']} rows={data?.bookings?.map(b => [ b.bookingId, b.bookingRefNumber, b.bookingStartTime, `${b.customerFirstName} ${b.customerLastName.charAt(0)}.`, b.vehicleRegNumber, b.serviceName, b.bookingStatus.toUpperCase() ])} />
                                                </>
                                            )}
                                            {activeTab === 'technician' && (
                                                <>
                                                    <h3 style={{ fontSize: '1.1rem', fontWeight: '900', textTransform: 'uppercase', paddingBottom: '5px', marginBottom: '10px', marginTop: '25px', borderBottom: '1px solid #000' }}>Workforce Utilization</h3>
                                                    <Table headers={['TECH. ID', 'NAME', 'SPL.', 'TOTAL', 'CMPL.', 'RATING']} alignments={['left', 'left', 'left', 'right', 'right', 'right']} rows={data?.technicians?.map(t => [ t.technicianId, `${t.technicianFirstName} ${t.technicianLastName.charAt(0)}.`, t.technicianSpecialization, t.totalJobs, t.completedJobs, t.averageRating ? `${parseFloat(t.averageRating).toFixed(1)}` : 'N/A' ])} />
                                                </>
                                            )}
                                            {activeTab === 'ad' && (
                                                <>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '10px', marginTop: '25px', borderBottom: '1px solid #000', paddingBottom: '10px' }}>
                                                        <h3 style={{ fontSize: '1.2rem', fontWeight: '900', color: '#000', textTransform: 'uppercase', margin: 0 }}>Marketing Asset Performance</h3>
                                                    </div>
                                                    <Table
                                                        headers={['ID', 'Placement', 'Impressions', 'Clicks']}
                                                        alignments={['left', 'left', 'right', 'right']}
                                                        widths={['10%', '60%', '15%', '15%']}
                                                        rows={data?.byPlacement?.map(p => [
                                                            p.advertisementPlacementId,
                                                            p.advertisementPlacementName,
                                                            p.advertisementImpressions || 0,
                                                            p.advertisementClicks || 0
                                                        ])}
                                                    />
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {}
                                    <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '15px', marginTop: '40px', textAlign: 'center' }}>
                                        <div style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--navy)', textTransform: 'uppercase', letterSpacing: '1px' }}>Confidential - Internal Distribution Only</div>
                                        <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '6px', lineHeight: '1.4' }}>This document contains proprietary information of Seats Labs Inc. Unauthorized distribution is strictly prohibited.<br />© {new Date().getFullYear()} Seats Labs Inc. All rights reserved.</div>
                                    </div>
                                </div>
                            </div>

                            {}
                            <div style={{ position: 'fixed', bottom: '30px', right: '30px', display: 'flex', gap: '15px', zIndex: 1000, background: 'rgba(255,255,255,0.9)', padding: '15px', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', backdropFilter: 'blur(10px)', border: '1px solid #e2e8f0' }}>
                                <button onClick={fetchReport} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', borderRadius: '8px', border: 'none', background: 'var(--navy)', color: 'white', fontWeight: '700', cursor: 'pointer', fontSize: '0.95rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}> <Eye size={18} /> Refresh Data </button>
                                <button id="pdf-btn" onClick={exportToPDF} disabled={!data || loading} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', borderRadius: '8px', border: 'none', background: data && !loading ? 'var(--crimson)' : '#e2e8f0', color: 'white', fontWeight: '700', cursor: data && !loading ? 'pointer' : 'not-allowed', fontSize: '0.95rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}> <Download size={18} /> Export PDF </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </SidebarLayout>
    );
};

export default ManagerReportsPage;
