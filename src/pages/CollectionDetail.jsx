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

    const getTitle = () => {
        switch (type) {
            case 'today': return "Today's Collection Detail";
            case 'yearly': return "Yearly Collection Detail";
            case 'pending': return "Pending Fees Detail";
            default: return "Collection Detail";
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const endpoint = type === 'pending'
                    ? '/fees/pending/detail'
                    : `/fees/collection/detail?type=${type}`;

                const response = await api.get(endpoint);

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
        fetchData();
    }, [type]);

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
