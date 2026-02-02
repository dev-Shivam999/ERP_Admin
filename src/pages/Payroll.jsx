import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import {
    IndianRupee, Save, Filter, Search, CheckCircle, AlertCircle, Clock,
    ChevronLeft, ChevronRight, Download, PieChart, Wallet, Users, Banknote, X, Calendar, Loader2
} from 'lucide-react';
import { payrollAPI } from '../services/api';

const Payroll = () => {
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [year, setYear] = useState(new Date().getFullYear());
    const [payrollData, setPayrollData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Modal State
    const [selectedTeacher, setSelectedTeacher] = useState(null);
    const [formData, setFormData] = useState({
        basicSalary: '',
        allowances: '',
        deductions: '',
        status: 'pending',
        paymentDate: new Date().toISOString().split('T')[0]
    });

    const months = [
        { value: 1, label: 'January' }, { value: 2, label: 'February' }, { value: 3, label: 'March' },
        { value: 4, label: 'April' }, { value: 5, label: 'May' }, { value: 6, label: 'June' },
        { value: 7, label: 'July' }, { value: 8, label: 'August' }, { value: 9, label: 'September' },
        { value: 10, label: 'October' }, { value: 11, label: 'November' }, { value: 12, label: 'December' }
    ];

    // Dynamic Year Generation (Current Year - 2 to + 5)
    const years = useMemo(() => {
        const currentYear = new Date().getFullYear();
        const yearRange = [];
        for (let i = currentYear - 2; i <= currentYear; i++) {
            yearRange.push(i);
        }
        return yearRange;
    }, []);

    useEffect(() => {
        fetchPayroll();
    }, [month, year]);

    const fetchPayroll = async () => {
        setLoading(true);
        try {
            const response = await payrollAPI.getPayrollByMonth(month, year);
            if (response.success) {
                setPayrollData(response.data);
            }
        } catch (error) {
            console.error('Fetch payroll error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleProcessClick = (teacher) => {
        setSelectedTeacher(teacher);
        setFormData({
            basicSalary: teacher.basic_salary || '',
            allowances: teacher.allowances || '',
            deductions: teacher.deductions || '',
            status: teacher.status || 'pending',
            paymentDate: teacher.payment_date
                ? new Date(teacher.payment_date).toISOString().split('T')[0]
                : new Date().toISOString().split('T')[0]
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setProcessing(true);
        try {
            await payrollAPI.processPayroll({
                teacherId: selectedTeacher.teacher_id,
                month,
                year,
                ...formData
            });
            setSelectedTeacher(null);
            fetchPayroll(); // Refresh list
        } catch (error) {
            console.error('Process payroll error:', error);
            alert('Failed to process payroll');
        } finally {
            setProcessing(false);
        }
    };

    // Filtered Data
    const filteredData = payrollData.filter(item =>
        item.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.employee_id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Statistics
    const stats = useMemo(() => {
        const totalEmployees = payrollData.length;
        const paidCount = payrollData.filter(p => p.status === 'paid').length;
        const totalPaidAmount = payrollData
            .filter(p => p.status === 'paid')
            .reduce((sum, p) => sum + (parseFloat(p.net_salary) || 0), 0);
        const pendingAmount = payrollData
            .filter(p => p.status !== 'paid')
            .reduce((sum, p) => sum + (parseFloat(p.basic_salary) || 0), 0); // Estimate based on basic

        return { totalEmployees, paidCount, totalPaidAmount, pendingAmount };
    }, [payrollData]);

    const getStatusBadge = (status) => {
        const defaultStyle = "badge badge-primary";
        const styles = {
            paid: { class: "badge badge-success", icon: CheckCircle, label: 'Paid' },
            pending: { class: "badge badge-warning", icon: Clock, label: 'Pending' },
            hold: { class: "badge badge-danger", icon: AlertCircle, label: 'On Hold' },
            default: { class: "badge badge-secondary", icon: AlertCircle, label: 'Unprocessed' }
        };
        const config = styles[status] || styles.default;
        const Icon = config.icon;

        return (
            <span className={config.class} style={{ gap: '0.25rem' }}>
                <Icon size={12} /> {config.label}
            </span>
        );
    };

    return (
        <div className="page-content">
            {/* Header Section */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h2 className="page-title">Payroll Management</h2>
                    <div style={{ color: '#6b7280' }}>Manage salaries, payments, and compensation</div>
                </div>

                <div className="card" style={{ padding: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderRadius: '0.5rem', boxShadow: 'none', border: '1px solid #e5e7eb' }}>
                    <div style={{ padding: '0.5rem', color: '#6b7280' }}>
                        <Calendar size={20} />
                    </div>
                    <div style={{ height: '24px', width: '1px', background: '#e5e7eb' }}></div>
                    <select
                        className="form-select"
                        value={month}
                        onChange={(e) => setMonth(parseInt(e.target.value))}
                        style={{ width: 'auto', minWidth: 140, border: 'none', boxShadow: 'none', background: 'transparent', fontWeight: 500 }}
                    >
                        {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                    </select>
                    <div style={{ height: '24px', width: '1px', background: '#e5e7eb' }}></div>
                    <select
                        className="form-select"
                        value={year}
                        onChange={(e) => setYear(parseInt(e.target.value))}
                        style={{ width: 'auto', border: 'none', boxShadow: 'none', background: 'transparent', fontWeight: 500 }}
                    >
                        {years.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon primary">
                        <Wallet size={24} />
                    </div>
                    <div className="stat-content">
                        <h3>₹{stats.totalPaidAmount.toLocaleString()}</h3>
                        <p>Total Disbursed</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon warning">
                        <Banknote size={24} />
                    </div>
                    <div className="stat-content">
                        <h3>₹{stats.pendingAmount.toLocaleString()}</h3>
                        <p>Estimated Pending</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon success">
                        <CheckCircle size={24} />
                    </div>
                    <div className="stat-content">
                        <h3>{stats.paidCount} / {stats.totalEmployees}</h3>
                        <p>Employees Paid</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon primary">
                        <Users size={24} />
                    </div>
                    <div className="stat-content">
                        <h3>{stats.totalEmployees}</h3>
                        <p>Total Staff</p>
                    </div>
                </div>
            </div>

            {/* Filters & Table */}
            <div className="card">
                <div className="card-header">
                    <h3 className="card-title">Employee Payroll List</h3>
                    <div className="search-box">
                        <Search />
                        <input
                            type="text"
                            placeholder="Search by name or ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Employee</th>
                                <th>Designation</th>
                                <th>Basic Pay</th>
                                <th>Net Salary</th>
                                <th>Status</th>
                                <th>Payment Date</th>
                                <th style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>Loading payroll records...</td></tr>
                            ) : filteredData.length === 0 ? (
                                <tr>
                                    <td colSpan="7" style={{ textAlign: 'center', padding: '3rem' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', color: '#9ca3af' }}>
                                            <Search size={32} />
                                            <p>No teachers found matching your search.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredData.map((item) => (
                                    <tr key={item.teacher_id}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                <div className="user-avatar">
                                                    {item.first_name?.[0]}{item.last_name?.[0]}
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: 600, color: '#1f2937' }}>{item.first_name} {item.last_name}</div>
                                                    <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>{item.employee_id}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>{item.designation}</td>
                                        <td>{item.basic_salary ? `₹${item.basic_salary.toLocaleString()}` : '-'}</td>
                                        <td style={{ fontWeight: 600 }}>{item.net_salary ? `₹${item.net_salary.toLocaleString()}` : '-'}</td>
                                        <td>{getStatusBadge(item.status)}</td>
                                        <td style={{ fontSize: '0.9rem', color: '#4b5563' }}>
                                            {item.payment_date ? new Date(item.payment_date).toLocaleDateString() : '-'}
                                        </td>
                                        <td style={{ textAlign: 'right' }}>
                                            <button
                                                className={item.payroll_id ? 'btn btn-outline' : 'btn btn-primary'}
                                                style={{ padding: '0.5rem 1rem', fontSize: '0.8125rem' }}
                                                onClick={() => handleProcessClick(item)}
                                            >
                                                {item.payroll_id ? 'Edit' : 'Process'}
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Process Salary Modal */}
            {selectedTeacher && (
                <div className="modal-overlay" onClick={() => setSelectedTeacher(null)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <div>
                                <h3 className="modal-title">Process Salary</h3>
                                <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                                    {selectedTeacher.first_name} {selectedTeacher.last_name} ({selectedTeacher.employee_id})
                                </div>
                            </div>
                            <button className="btn btn-outline" style={{ border: 'none', padding: '0.5rem' }} onClick={() => setSelectedTeacher(null)}>
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label className="form-label">Basic Salary (₹)</label>
                                    <input
                                        type="number"
                                        className="form-input"
                                        required
                                        placeholder="0.00"
                                        value={formData.basicSalary}
                                        onChange={e => setFormData({ ...formData, basicSalary: e.target.value })}
                                        style={{ fontWeight: 600, fontSize: '1.1rem' }}
                                    />
                                </div>

                                <div className="grid-2">
                                    <div className="form-group">
                                        <label className="form-label" style={{ color: '#059669' }}>Allowances (+)</label>
                                        <input
                                            type="number"
                                            className="form-input"
                                            value={formData.allowances}
                                            onChange={e => setFormData({ ...formData, allowances: e.target.value })}
                                            placeholder="0.00"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label" style={{ color: '#dc2626' }}>Deductions (-)</label>
                                        <input
                                            type="number"
                                            className="form-input"
                                            value={formData.deductions}
                                            onChange={e => setFormData({ ...formData, deductions: e.target.value })}
                                            placeholder="0.00"
                                        />
                                    </div>
                                </div>

                                <div style={{ padding: '1rem', background: '#f9fafb', borderRadius: '0.5rem', marginBottom: '1.5rem', border: '1px dashed #e5e7eb' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                                        <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>Net Payable Amount</span>
                                        <span className="badge badge-success">Auto-calc</span>
                                    </div>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111827' }}>
                                        ₹ {((parseFloat(formData.basicSalary) || 0) + (parseFloat(formData.allowances) || 0) - (parseFloat(formData.deductions) || 0)).toLocaleString()}
                                    </div>
                                </div>

                                <div className="grid-2">
                                    <div className="form-group">
                                        <label className="form-label">Payment Status</label>
                                        <select
                                            className="form-select"
                                            value={formData.status}
                                            onChange={e => setFormData({ ...formData, status: e.target.value })}
                                        >
                                            <option value="pending">Pending</option>
                                            <option value="paid">Paid</option>
                                            <option value="hold">On Hold</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Payment Date</label>
                                        <input
                                            type="date"
                                            className="form-input"
                                            value={formData.paymentDate}
                                            onChange={e => setFormData({ ...formData, paymentDate: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setSelectedTeacher(null)} disabled={processing}>Cancel</button>
                                <button type="submit" className="btn btn-primary" disabled={processing}>
                                    {processing ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                                    {processing ? 'Processing...' : 'Save & Process'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Payroll;
