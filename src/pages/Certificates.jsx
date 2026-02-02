import { useState, useEffect } from 'react';
import { certificateAPI } from '../services/api';
import { Check, X, Trash2, Clock, Calendar, Search, AlertCircle, FileText } from 'lucide-react';
import { toast } from 'react-hot-toast';

const Certificates = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('pending'); // pending, today, all
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [remarks, setRemarks] = useState('');
    const [newStatus, setNewStatus] = useState('');

    useEffect(() => {
        fetchRequests();
    }, [filter]);

    const fetchRequests = async () => {
        try {
            setLoading(true);
            let response;
            if (filter === 'today') {
                response = await certificateAPI.getToday();
            } else {
                response = await certificateAPI.getPending();
            }
            if (response.success) {
                setRequests(response.data);
            }
        } catch (error) {
            console.error('Fetch requests error:', error);
            toast.error('Failed to load certificate requests');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (id, status) => {
        setSelectedRequest(requests.find(r => r.id === id));
        setNewStatus(status);
        setRemarks('');
        setShowModal(true);
    };

    const confirmUpdateStatus = async () => {
        try {
            const response = await certificateAPI.updateStatus(selectedRequest.id, {
                status: newStatus,
                adminRemarks: remarks
            });
            if (response.success) {
                toast.success(`Request ${newStatus} successfully`);
                setShowModal(false);
                fetchRequests();
            }
        } catch (error) {
            console.error('Update status error:', error);
            toast.error('Failed to update request status');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this request?')) return;
        try {
            const response = await certificateAPI.delete(id);
            if (response.success) {
                toast.success('Request deleted successfully');
                fetchRequests();
            }
        } catch (error) {
            console.error('Delete request error:', error);
            toast.error('Failed to delete request');
        }
    };

    const filteredRequests = requests.filter(r =>
        r.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.admission_number.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusBadge = (status) => {
        switch (status) {
            case 'pending': return <span className="badge badge-warning">Pending</span>;
            case 'accepted': return <span className="badge badge-success">Accepted</span>;
            case 'rejected': return <span className="badge badge-danger">Rejected</span>;
            default: return <span className="badge badge-secondary">{status}</span>;
        }
    };

    return (
        <div className="certificates-page">
            {/* Stats Cards */}
            <div className="stats-grid grid-3" style={{ marginBottom: '2rem' }}>
                <div
                    className={`stat-card ${filter === 'pending' ? 'active' : ''}`}
                    onClick={() => setFilter('pending')}
                    style={{ cursor: 'pointer', border: filter === 'pending' ? '2px solid #4f46e5' : '1px solid #e5e7eb' }}
                >
                    <div className="stat-icon warning">
                        <Clock size={24} />
                    </div>
                    <div className="stat-content">
                        <h3>{requests.filter(r => r.status === 'pending').length}</h3>
                        <p>Pending Requests</p>
                    </div>
                </div>

                <div
                    className={`stat-card ${filter === 'today' ? 'active' : ''}`}
                    onClick={() => setFilter('today')}
                    style={{ cursor: 'pointer', border: filter === 'today' ? '2px solid #10b981' : '1px solid #e5e7eb' }}
                >
                    <div className="stat-icon success">
                        <Calendar size={24} />
                    </div>
                    <div className="stat-content">
                        <h3>{requests.filter(r => new Date(r.created_at).toDateString() === new Date().toDateString()).length}</h3>
                        <p>New Today</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon info">
                        <FileText size={24} />
                    </div>
                    <div className="stat-content">
                        <h3>{requests.length}</h3>
                        <p>Total Shown</p>
                    </div>
                </div>
            </div>

            {/* Filter & Search */}
            <div className="card" style={{ marginBottom: '1.5rem' }}>
                <div className="card-body" style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <div className="search-input" style={{ flex: 1, minWidth: '300px', position: 'relative' }}>
                        <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }} />
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Search by student name or admission number..."
                            style={{ paddingLeft: '40px' }}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="btn-group">
                        <button
                            className={`btn ${filter === 'pending' ? 'btn-primary' : 'btn-outline'}`}
                            onClick={() => setFilter('pending')}
                        >
                            Pending
                        </button>
                        <button
                            className={`btn ${filter === 'today' ? 'btn-primary' : 'btn-outline'}`}
                            onClick={() => setFilter('today')}
                        >
                            Today
                        </button>
                    </div>
                </div>
            </div>

            {/* Requests Table */}
            <div className="card">
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Student Details</th>
                                <th>Certificate Type</th>
                                <th>Request Date</th>
                                <th>Reason</th>
                                <th>Status</th>
                                <th className="text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="text-center" style={{ padding: '3rem' }}>
                                        <div className="spinner"></div>
                                        <p style={{ marginTop: '1rem', color: '#6b7280' }}>Loading requests...</p>
                                    </td>
                                </tr>
                            ) : filteredRequests.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="text-center" style={{ padding: '3rem', color: '#6b7280' }}>
                                        <AlertCircle size={40} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                                        <p>No certificate requests found</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredRequests.map((req) => (
                                    <tr key={req.id}>
                                        <td>
                                            <div style={{ fontWeight: 600 }}>{req.student_name}</div>
                                            <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Adm: {req.admission_number} | Class: {req.class_name}</div>
                                        </td>
                                        <td>
                                            <span style={{ textTransform: 'capitalize' }}>
                                                {req.certificate_type.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td>{new Date(req.created_at).toLocaleDateString()}</td>
                                        <td style={{ maxWidth: '250px' }}>
                                            <div className="text-truncate" title={req.reason}>
                                                {req.reason}
                                            </div>
                                        </td>
                                        <td>{getStatusBadge(req.status)}</td>
                                        <td>
                                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                                {req.status === 'pending' && (
                                                    <>
                                                        <button
                                                            className="btn btn-icon btn-success"
                                                            title="Accept"
                                                            onClick={() => handleUpdateStatus(req.id, 'accepted')}
                                                        >
                                                            <Check size={18} />
                                                        </button>
                                                        <button
                                                            className="btn btn-icon btn-danger"
                                                            title="Reject"
                                                            onClick={() => handleUpdateStatus(req.id, 'rejected')}
                                                        >
                                                            <X size={18} />
                                                        </button>
                                                    </>
                                                )}
                                                <button
                                                    className="btn btn-icon btn-outline text-danger"
                                                    title="Delete"
                                                    onClick={() => handleDelete(req.id)}
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal" style={{ maxWidth: '400px' }}>
                        <div className="modal-header">
                            <h3 className="modal-title">
                                {newStatus === 'accepted' ? 'Accept Request' : 'Reject Request'}
                            </h3>
                            <button className="close-btn" onClick={() => setShowModal(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className="modal-body">
                            <p style={{ marginBottom: '1rem', color: '#4b5563' }}>
                                Are you sure you want to {newStatus} this request for <strong>{selectedRequest?.student_name}</strong>?
                            </p>
                            <div className="form-group">
                                <label>Admin Remarks (Optional)</label>
                                <textarea
                                    className="form-control"
                                    rows="3"
                                    placeholder="Add any remarks or instructions..."
                                    value={remarks}
                                    onChange={(e) => setRemarks(e.target.value)}
                                ></textarea>
                            </div>
                        </div>
                        <div className="modal-footer" style={{ borderTop: '1px solid #e5e7eb', paddingTop: '1rem', marginTop: '1rem', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                            <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                            <button
                                className={`btn ${newStatus === 'accepted' ? 'btn-success' : 'btn-danger'}`}
                                onClick={confirmUpdateStatus}
                            >
                                Confirm {newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Certificates;
