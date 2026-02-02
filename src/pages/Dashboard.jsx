import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Users, IndianRupee, AlertTriangle, Table, BarChart2, PieChart as PieChartIcon, FileText } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { fetchDashboardStats } from '../store/slices/dashboardSlice';

const Dashboard = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { stats, loading, error } = useSelector((state) => state.dashboard);

    const [showAttendanceTable, setShowAttendanceTable] = useState(false);
    const [showCategoryTable, setShowCategoryTable] = useState(false);

    useEffect(() => {
        dispatch(fetchDashboardStats());
    }, [dispatch]);

    const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4rem' }}>
                <div style={{ textAlign: 'center', color: '#6b7280' }}>
                    <div className="spinner" style={{ marginBottom: '1rem' }}></div>
                    Loading dashboard data...
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="card" style={{ background: '#fef2f2', border: '1px solid #fecaca' }}>
                <div className="card-body" style={{ textAlign: 'center', color: '#dc2626' }}>
                    <AlertTriangle size={48} style={{ marginBottom: '1rem' }} />
                    <p>Failed to load dashboard: {error}</p>
                    <button className="btn btn-primary" onClick={() => dispatch(fetchDashboardStats())}>
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <>
            {/* Stats Grid */}
            <div className="stats-grid grid-4" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
                <div className="stat-card" onClick={() => navigate('/fees/details/today')} style={{ cursor: 'pointer' }}>
                    <div className="stat-icon success">
                        <IndianRupee size={24} />
                    </div>
                    <div className="stat-content">
                        <h3>₹{stats.todayCollection.total.toLocaleString()}</h3>
                        <p>Today's Collection</p>
                    </div>
                </div>

                <div className="stat-card" onClick={() => navigate('/fees/details/yearly')} style={{ cursor: 'pointer' }}>
                    <div className="stat-icon primary">
                        <IndianRupee size={24} />
                    </div>
                    <div className="stat-content">
                        <h3>₹{stats.yearlyCollection.toLocaleString()}</h3>
                        <p>Yearly Collection</p>
                    </div>
                </div>

                <div className="stat-card" onClick={() => navigate('/fees/details/pending')} style={{ cursor: 'pointer' }}>
                    <div className="stat-icon danger">
                        <AlertTriangle size={24} />
                    </div>
                    <div className="stat-content">
                        <h3>₹{stats.pendingFees.toLocaleString()}</h3>
                        <p>Total Pending</p>
                    </div>
                </div>

                <div className="stat-card" onClick={() => navigate('/students')} style={{ cursor: 'pointer' }}>
                    <div className="stat-icon info">
                        <Users size={24} />
                    </div>
                    <div className="stat-content">
                        <h3>{stats.totalStudents}</h3>
                        <p>Active Students</p>
                    </div>
                </div>

                <div className="stat-card" onClick={() => navigate('/certificates')} style={{ cursor: 'pointer', borderLeft: stats.pendingCertificates > 0 ? '4px solid #f59e0b' : 'none' }}>
                    <div className="stat-icon warning" style={{ background: stats.pendingCertificates > 0 ? '#fef3c7' : '#f1f5f9', color: stats.pendingCertificates > 0 ? '#d97706' : '#64748b' }}>
                        <FileText size={24} />
                    </div>
                    <div className="stat-content">
                        <h3>{stats.pendingCertificates}</h3>
                        <p>Cert. Requests</p>
                        {stats.pendingCertificates > 0 && <span style={{ fontSize: '0.75rem', color: '#d97706', fontWeight: 600 }}>Action Required</span>}
                    </div>
                </div>
            </div>

            {/* Charts Row */}
            <div className="grid-2" style={{ marginBottom: '2rem' }}>
                <div className="card">
                    <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 className="card-title">Weekly Attendance (%)</h3>
                        <button
                            className="btn btn-outline btn-sm"
                            onClick={() => setShowAttendanceTable(!showAttendanceTable)}
                            style={{ padding: '0.25rem 0.5rem' }}
                        >
                            {showAttendanceTable ? <BarChart2 size={16} /> : <Table size={16} />}
                        </button>
                    </div>
                    <div className="card-body">
                        {showAttendanceTable ? (
                            <div className="table-container" style={{ height: '250px', overflowY: 'auto' }}>
                                <table className="compact-table">
                                    <thead>
                                        <tr>
                                            <th>Date</th>
                                            <th>Present %</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {stats.weeklyAttendance?.map((item, idx) => (
                                            <tr key={idx}>
                                                <td>{new Date(item.date).toLocaleDateString()} ({item.day})</td>
                                                <td>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                        <div style={{ flex: 1, height: '8px', background: '#e5e7eb', borderRadius: '4px', overflow: 'hidden' }}>
                                                            <div style={{ width: `${item.present}%`, height: '100%', background: '#4f46e5' }}></div>
                                                        </div>
                                                        <span>{item.present}%</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height={250}>
                                <BarChart data={stats.weeklyAttendance}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="day" />
                                    <YAxis domain={[0, 100]} />
                                    <Tooltip />
                                    <Bar dataKey="present" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>

                <div className="card">
                    <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 className="card-title">Students by Category</h3>
                        <button
                            className="btn btn-outline btn-sm"
                            onClick={() => setShowCategoryTable(!showCategoryTable)}
                            style={{ padding: '0.25rem 0.5rem' }}
                        >
                            {showCategoryTable ? <PieChartIcon size={16} /> : <Table size={16} />}
                        </button>
                    </div>
                    <div className="card-body">
                        {showCategoryTable ? (
                            <div className="table-container" style={{ height: '250px', overflowY: 'auto' }}>
                                <table className="compact-table">
                                    <thead>
                                        <tr>
                                            <th>Category</th>
                                            <th className="text-right">No. of Students</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {stats.categoryStats?.map((item, idx) => (
                                            <tr key={idx}>
                                                <td>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                        <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: COLORS[idx % COLORS.length] }}></div>
                                                        {item.name}
                                                    </div>
                                                </td>
                                                <td className="text-right">{item.value}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height={250}>
                                <PieChart>
                                    <Pie
                                        data={stats.categoryStats}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                    >
                                        {stats.categoryStats?.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>
            </div>

            {/* Tables Row */}
            <div className="grid-2">
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">Recent Admissions</h3>
                    </div>
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Class</th>
                                    <th>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats.recentAdmissions.length > 0 ? (
                                    stats.recentAdmissions.map((student) => (
                                        <tr key={student.id}>
                                            <td>{student.name}</td>
                                            <td>{student.class}</td>
                                            <td>{new Date(student.date).toLocaleDateString()}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={3} style={{ textAlign: 'center', color: '#6b7280' }}>
                                            No recent admissions
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">⚠️ Fee Defaulters</h3>
                    </div>
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Class</th>
                                    <th>Due Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats.feeDefaulters.length > 0 ? (
                                    stats.feeDefaulters.map((student) => (
                                        <tr key={student.id}>
                                            <td>{student.name}</td>
                                            <td>{student.class}</td>
                                            <td style={{ color: '#ef4444', fontWeight: 600 }}>₹{student.dueAmount.toLocaleString()}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={3} style={{ textAlign: 'center', color: '#6b7280' }}>
                                            No fee defaulters
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Dashboard;
