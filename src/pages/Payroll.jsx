
import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { IndianRupee, Save, Filter, Search, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { payrollAPI } from '../services/api';

const Payroll = () => {
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [year, setYear] = useState(new Date().getFullYear());
    const [payrollData, setPayrollData] = useState([]);
    const [loading, setLoading] = useState(false);
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
        }
    };

    // Filtered Data
    const filteredData = payrollData.filter(item =>
        item.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.employee_id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusBadge = (status) => {
        if (!status) return <span className="badge bg-secondary">Unprocessed</span>;
        switch (status) {
            case 'paid': return <span className="badge bg-success">Paid</span>;
            case 'pending': return <span className="badge bg-warning text-dark">Pending</span>;
            case 'hold': return <span className="badge bg-danger">On Hold</span>;
            default: return <span className="badge bg-secondary">{status}</span>;
        }
    };

    return (
        <div className="container-fluid p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Payroll Management</h2>
                <div className="d-flex gap-2">
                    <select className="form-select" value={month} onChange={(e) => setMonth(parseInt(e.target.value))} style={{ width: 150 }}>
                        {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                    </select>
                    <select className="form-select" value={year} onChange={(e) => setYear(parseInt(e.target.value))} style={{ width: 100 }}>
                        {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                </div>
            </div>

            <div className="card shadow-sm mb-4">
                <div className="card-header bg-white py-3">
                    <div className="input-group" style={{ maxWidth: 300 }}>
                        <span className="input-group-text bg-light border-end-0"><Search size={18} /></span>
                        <input
                            type="text"
                            className="form-control border-start-0 ps-0"
                            placeholder="Search teacher..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="bg-light">
                            <tr>
                                <th>Teacher</th>
                                <th>Designation</th>
                                <th>Basic Pay</th>
                                <th>Net Salary</th>
                                <th>Status</th>
                                <th>Payment Date</th>
                                <th className="text-end">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="7" className="text-center py-5">Loading payroll data...</td></tr>
                            ) : filteredData.length === 0 ? (
                                <tr><td colSpan="7" className="text-center py-5">No teachers found</td></tr>
                            ) : (
                                filteredData.map((item) => (
                                    <tr key={item.teacher_id}>
                                        <td>
                                            <div className="d-flex flex-column">
                                                <span className="fw-medium">{item.first_name} {item.last_name}</span>
                                                <small className="text-muted">{item.employee_id}</small>
                                            </div>
                                        </td>
                                        <td>{item.designation}</td>
                                        <td>{item.basic_salary ? `₹${item.basic_salary} ` : '-'}</td>
                                        <td className="fw-bold">{item.net_salary ? `₹${item.net_salary} ` : '-'}</td>
                                        <td>{getStatusBadge(item.status)}</td>
                                        <td>{item.payment_date ? new Date(item.payment_date).toLocaleDateString() : '-'}</td>
                                        <td className="text-end">
                                            <button
                                                className="btn btn-sm btn-outline-primary"
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
                <div className="modal-overlay" style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999,
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }} onClick={() => setSelectedTeacher(null)}>
                    <div className="modal-content rounded shadow-lg" style={{
                        maxWidth: '500px',
                        width: '90%',
                        backgroundColor: '#fff',
                        border: '1px solid #e5e7eb',
                        zIndex: 10000
                    }} onClick={e => e.stopPropagation()}>
                        <div className="modal-header border-bottom p-3 d-flex justify-content-between align-items-center">
                            <h5 className="m-0">Process Salary - {selectedTeacher.first_name}</h5>
                            <button type="button" className="btn-close" onClick={() => setSelectedTeacher(null)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body p-4">
                                <div className="mb-3">
                                    <label className="form-label">Basic Salary (₹)</label>
                                    <input
                                        type="number"
                                        className="form-input"
                                        required
                                        value={formData.basicSalary}
                                        onChange={e => setFormData({ ...formData, basicSalary: e.target.value })}
                                    />
                                </div>
                                <div className="row g-3 mb-3" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div>
                                        <label className="form-label">Allowances (+)</label>
                                        <input
                                            type="number"
                                            className="form-input"
                                            value={formData.allowances}
                                            onChange={e => setFormData({ ...formData, allowances: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="form-label">Deductions (-)</label>
                                        <input
                                            type="number"
                                            className="form-input"
                                            value={formData.deductions}
                                            onChange={e => setFormData({ ...formData, deductions: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label fw-bold">Net Salary Calculation: </label>
                                    <div className="fs-5 p-2 bg-light rounded text-center border" style={{ backgroundColor: '#f9fafb', fontWeight: 'bold' }}>
                                        ₹ {((parseFloat(formData.basicSalary) || 0) + (parseFloat(formData.allowances) || 0) - (parseFloat(formData.deductions) || 0)).toFixed(2)}
                                    </div>
                                </div>
                                <div className="row g-3 mb-3" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div>
                                        <label className="form-label">Status</label>
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
                                    <div>
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
                            <div className="modal-footer border-top p-3 d-flex justify-content-end gap-2">
                                <button type="button" className="btn btn-outline-secondary" onClick={() => setSelectedTeacher(null)}>Cancel</button>
                                <button type="submit" className="btn btn-primary d-flex align-items-center gap-2">
                                    <Save size={18} /> Save & Process
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
