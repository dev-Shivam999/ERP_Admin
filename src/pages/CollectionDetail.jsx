import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, IndianRupee, Phone, User, Calendar } from 'lucide-react';
import axios from 'axios';
import api from '../services/api';

const CollectionDetail = () => {
    const { type } = useParams(); // 'today', 'yearly', 'pending'
    const navigate = useNavigate();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    // Filter states
    const [metadata, setMetadata] = useState({ classes: [], feeTypes: [] });
    const [filters, setFilters] = useState({
        classId: '',
        sectionId: '',
        feeTypeId: '',
        dateRange: type === 'today' ? 'today' : (type === 'yearly' ? 'year' : 'month'),
        startDate: '',
        endDate: ''
    });

    const getTitle = () => {
        switch (type) {
            case 'today': return "Today's Collection Detail";
            case 'yearly': return "Yearly Collection Detail";
            case 'pending': return "Pending Fees Detail";
            default: return "Collection Detail";
        }
    };

    // Fetch metadata on mount
    useEffect(() => {
        const fetchMetadata = async () => {
            try {
                const response = await api.get('/fees/metadata');
                if (response.success) {
                    setMetadata(response.data);
                }
            } catch (error) {
                console.error("Error fetching metadata:", error);
            }
        };
        fetchMetadata();
    }, []);

    const getDateRange = (rangeType) => {
        const today = new Date();
        let start = new Date();
        let end = new Date();

        switch (rangeType) {
            case 'today':
                start = today;
                end = today;
                break;
            case 'week':
                // First day of current week (Sunday)
                // Adjust if you want Monday as first day
                const day = today.getDay();
                const diff = today.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
                // Let's stick to standard Monday start? Or Sunday?
                // Standard JS getDay(): 0 is Sunday.
                // Request said "Week", usually means "This Week".
                const firstDay = new Date(today.setDate(today.getDate() - today.getDay()));
                const lastDay = new Date(today.setDate(today.getDate() - today.getDay() + 6));
                start = firstDay;
                end = lastDay;
                break;
            case 'month':
                start = new Date(today.getFullYear(), today.getMonth(), 1);
                end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
                break;
            case 'year':
                // Academic year? Or Calendar year?
                // Let's go with current year for now
                start = new Date(today.getFullYear(), 0, 1);
                end = new Date(today.getFullYear(), 11, 31);
                break;
            default:
                return { start: null, end: null };
        }

        // Format YYYY-MM-DD
        const formatDate = (d) => d.toISOString().split('T')[0];
        return { start: formatDate(start), end: formatDate(end) };
    };

    const fetchData = async (currentFilters = {}) => {
        setLoading(true);
        try {
            const endpoint = type === 'pending'
                ? '/fees/pending/detail'
                : `/fees/collection/detail?type=${type}`;

            // Build query params
            const params = new URLSearchParams();
            if (currentFilters.classId) params.append('classId', currentFilters.classId);
            if (currentFilters.sectionId) params.append('sectionId', currentFilters.sectionId);
            if (currentFilters.feeTypeId) params.append('feeTypeId', currentFilters.feeTypeId);

            // Handle Dates
            if (currentFilters.dateRange && currentFilters.dateRange !== 'custom') {
                const { start, end } = getDateRange(currentFilters.dateRange);
                if (start && end) {
                    params.append('startDate', start);
                    params.append('endDate', end);
                }
            } else if (currentFilters.dateRange === 'custom' && currentFilters.startDate && currentFilters.endDate) {
                params.append('startDate', currentFilters.startDate);
                params.append('endDate', currentFilters.endDate);
            }

            const queryString = params.toString();
            // endpoint might already have query params if not pending (e.g. ?type=today)
            // But if we are sending dates, the backend will prioritize dates.
            // However, we should be clean.

            let finalUrl = endpoint;
            if (type === 'pending') {
                finalUrl = `${endpoint}?${queryString}`;
            } else {
                // If endpoint has question mark
                if (endpoint.includes('?')) {
                    finalUrl = `${endpoint}&${queryString}`;
                } else {
                    finalUrl = `${endpoint}?${queryString}`;
                }
            }

            const response = await api.get(finalUrl);

            if (response.success) {
                setData(response.data || []);
            } else {
                setData([]);
            }
        } catch (error) {
            console.error("Error fetching detail data:", error);
            setData([]);
        } finally {
            setLoading(false);
        }
    };

    // Initial fetch
    useEffect(() => {
        const initialDateRange = type === 'today' ? 'today' : (type === 'yearly' ? 'year' : 'month');
        const initialFilters = {
            classId: '',
            sectionId: '',
            feeTypeId: '',
            dateRange: initialDateRange,
            startDate: '',
            endDate: ''
        };
        setFilters(initialFilters);
        fetchData(initialFilters);
    }, [type]);

    const handleFilterChange = (key, value) => {
        setFilters(prev => {
            const newFilters = { ...prev, [key]: value };
            // Reset section if class changes
            if (key === 'classId') {
                newFilters.sectionId = '';
            }
            return newFilters;
        });
    };

    const handleSubmit = () => {
        fetchData(filters);
    };

    const getSections = () => {
        if (!filters.classId) return [];
        const selectedClass = metadata.classes.find(c => String(c.id) === String(filters.classId));
        return selectedClass ? selectedClass.sections : [];
    };

    const filteredData = (data || []).filter(item =>
        (item.student_name?.toLowerCase().includes(search.toLowerCase())) ||
        (item.admission_number?.toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <div className="collection-detail-page">
            <div className="page-header" style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                <button className="btn btn-outline btn-sm" onClick={() => navigate(-1)}>
                    <ArrowLeft size={18} /> Back
                </button>
                <h1 className="h2">{getTitle()}</h1>
            </div>

            {/* Filter Section */}
            <div className="card" style={{ marginBottom: '1.5rem' }}>
                <div className="card-body">
                    <div className="filters-container" style={{ display: 'flex', gap: '1rem', alignItems: 'end', flexWrap: 'wrap' }}>

                        {/* Date Range Filter */}
                        <div className="form-group" style={{ marginBottom: 0, minWidth: '150px' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>Period</label>
                            <select
                                className="form-control"
                                value={filters.dateRange}
                                onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                                style={{ width: '100%' }}
                            >
                                <option value="today">Today</option>
                                <option value="week">This Week</option>
                                <option value="month">This Month</option>
                                <option value="year">This Year</option>
                                <option value="custom">Custom Range</option>
                            </select>
                        </div>

                        {filters.dateRange === 'custom' && (
                            <>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>Start Date</label>
                                    <input
                                        type="date"
                                        className="form-control"
                                        value={filters.startDate}
                                        onChange={(e) => handleFilterChange('startDate', e.target.value)}
                                    />
                                </div>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>End Date</label>
                                    <input
                                        type="date"
                                        className="form-control"
                                        value={filters.endDate}
                                        onChange={(e) => handleFilterChange('endDate', e.target.value)}
                                    />
                                </div>
                            </>
                        )}

                        <div className="form-group" style={{ marginBottom: 0, minWidth: '150px' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>Class</label>
                            <select
                                className="form-control"
                                value={filters.classId}
                                onChange={(e) => handleFilterChange('classId', e.target.value)}
                                style={{ width: '100%' }}
                            >
                                <option value="">All Classes</option>
                                {metadata.classes.map(cls => (
                                    <option key={cls.id} value={cls.id}>{cls.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group" style={{ marginBottom: 0, minWidth: '150px' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>Section</label>
                            <select
                                className="form-control"
                                value={filters.sectionId}
                                onChange={(e) => handleFilterChange('sectionId', e.target.value)}
                                disabled={!filters.classId}
                                style={{ width: '100%' }}
                            >
                                <option value="">All Sections</option>
                                {getSections().map(sec => (
                                    <option key={sec.id} value={sec.id}>{sec.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group" style={{ marginBottom: 0, minWidth: '150px' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>Fee Type</label>
                            <select
                                className="form-control"
                                value={filters.feeTypeId}
                                onChange={(e) => handleFilterChange('feeTypeId', e.target.value)}
                                style={{ width: '100%' }}
                            >
                                <option value="">All Fee Types</option>
                                {metadata.feeTypes.map(ft => (
                                    <option key={ft.id} value={ft.id}>{ft.name}</option>
                                ))}
                            </select>
                        </div>

                        <button
                            className="btn btn-primary"
                            onClick={handleSubmit}
                            style={{ height: '42px' }}
                        >
                            Filter Data
                        </button>
                    </div>
                </div>
            </div>

            <div className="card" style={{ marginBottom: '1.5rem' }}>
                <div className="card-body">
                    <div className="search-box">
                        <Search />
                        <input
                            type="text"
                            placeholder="Search by student name or admission number..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="card">
                <div className="table-container">
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
                            Loading details...
                        </div>
                    ) : (
                        <table>
                            <thead>
                                <tr>
                                    <th>Student Info</th>
                                    <th>Class & Section</th>
                                    <th>Contact</th>
                                    <th className="text-right">
                                        {type === 'pending' ? 'Pending Amount' : 'Amount Paid'}
                                    </th>
                                    <th className="text-center">Status</th>
                                    <th className="text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredData.length > 0 ? (
                                    filteredData.map((item) => (
                                        <tr key={item.student_id}>
                                            <td>
                                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                    <span style={{ fontWeight: 600, color: '#111827' }}>{item.student_name}</span>
                                                    <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>Adm: {item.admission_number}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                                    <span className="badge badge-info">{item.class_name}</span>
                                                    <span className="badge badge-outline">{item.section_name}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#4b5563' }}>
                                                    <Phone size={14} />
                                                    <span>{item.phone || 'N/A'}</span>
                                                </div>
                                            </td>
                                            <td className="text-right">
                                                <span style={{ fontWeight: 600, fontSize: '1.1rem', color: type === 'pending' ? '#ef4444' : '#10b981' }}>
                                                    ₹{parseFloat(type === 'pending' ? item.total_pending : item.amount_paid).toLocaleString('en-IN')}
                                                </span>
                                            </td>
                                            <td className="text-center">
                                                {type === 'pending' ? (
                                                    <span className="badge badge-danger">Pending</span>
                                                ) : (
                                                    <span className={`badge ${item.current_status === 'paid' ? 'badge-success' : 'badge-warning'}`}>
                                                        {item.current_status === 'paid' ? 'Fully Paid' : 'Partial'}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="text-center">
                                                <button
                                                    className="btn btn-primary btn-sm"
                                                    onClick={() => navigate(`/fees/student/${item.student_id}`)}
                                                >
                                                    View Fees
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} style={{ textAlign: 'center', color: '#6b7280', padding: '3rem' }}>
                                            No records found matching your search.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CollectionDetail;
