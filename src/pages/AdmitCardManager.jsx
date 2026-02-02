import React, { useState, useEffect } from 'react';
import { examAPI, studentAPI } from '../services/api';
import {
    FileText,
    CheckCircle,
    AlertCircle,
    Search,
    Printer,
    User,
    ShieldCheck,
    Filter,
    CreditCard,
    Users,
    XCircle,
    Download
} from 'lucide-react';

const AdmitCardManager = () => {
    const [exams, setExams] = useState([]);
    const [selectedExam, setSelectedExam] = useState('');

    // Bulk Gen State
    const [feeTypes, setFeeTypes] = useState('');
    const [checkFees, setCheckFees] = useState(true);
    const [genLoading, setGenLoading] = useState(false);

    // Student List State
    const [students, setStudents] = useState([]);
    const [listLoading, setListLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [classFilter, setClassFilter] = useState('');
    const [activeTab, setActiveTab] = useState('list'); // 'list' or 'bulk'

    useEffect(() => {
        fetchExams();
    }, []);

    useEffect(() => {
        if (selectedExam) {
            fetchStudentStatus();
        } else {
            setStudents([]);
        }
    }, [selectedExam, classFilter, search]); // Re-fetch on filter change (server-side filtering)

    // Debounce search could be better, but for now direct effect is okay or add manual trigger
    // Let's optimize: only fetch on selectedExam or classFilter change, 
    // and filter search client-side if list is small? 
    // Or use server-side. Let's stick to server-side for scalability.

    const fetchExams = async () => {
        try {
            const response = await examAPI.getAll();
            if (response.success) setExams(response.data);
        } catch (error) {
            console.error('Failed to fetch exams', error);
        }
    };

    const fetchStudentStatus = async () => {
        setListLoading(true);
        try {
            // Debounce check manually? simplify for now
            const response = await examAPI.getStudentsStatus(selectedExam, {
                classId: classFilter,
                search: search
            });
            if (response.success) {
                setStudents(response.data);
            }
        } catch (error) {
            console.error('Failed to fetch students', error);
        } finally {
            setListLoading(false);
        }
    };

    const handleGenerate = async () => {
        if (!selectedExam) return alert('Please select an exam first.');

        setGenLoading(true);
        try {
            const typesArray = feeTypes ? feeTypes.split(',').map(t => t.trim()).filter(Boolean) : undefined;

            const response = await examAPI.generateAdmitCards(selectedExam, {
                checkFees,
                requiredFeeTypes: typesArray
            });

            if (response.success) {
                alert(`✅ Success! Generated ${response.data.count} admit cards.`);
                fetchStudentStatus(); // Refresh list
                setActiveTab('list');
            }
        } catch (error) {
            alert('❌ Failed: ' + (error.response?.data?.message || error.message));
        } finally {
            setGenLoading(false);
        }
    };

    const handleIssue = async (studentId, studentName) => {
        if (!window.confirm(`Force issue admit card for ${studentName}?`)) return;
        try {
            await examAPI.issueAdmitCard(selectedExam, { studentId });
            alert('Issued successfully');
            fetchStudentStatus(); // Refresh row
        } catch (error) {
            alert('Failed: ' + error.message);
        }
    };

    // Derived Stats
    const totalStudents = students.length;
    const issuedCount = students.filter(s => s.admit_card_status === 'issued').length;

    // Get unique classes for filter dropdown (from full list or just pre-defined? 
    // Since we filter server side, we might need a separate class list or just unique from current list if unfiltered.
    // For now, let's extract from current list if no filter applied, or just show ID if simple.)
    // Better: Allow user to just type Class ID? No, Dropdown is expected.
    // For MVP, unique class names from the fetched list (if unfiltered) is okay, 
    // but correct way is to fetch All Classes. I'll rely on the text input for Search as generic backup.
    // Actually, let's just use uniq classes from the initial load (assuming user loads all first).
    const uniqueClasses = [...new Set(students.map(s => s.class_name))];

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

            {/* Header / Exam Selector */}
            <div className="card mb-6">
                <div className="card-body">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <FileText className="text-blue-600" /> Admit Card Manager
                        </h2>
                        {selectedExam && (
                            <div className="flex gap-4 text-sm">
                                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">
                                    Total: {totalStudents}
                                </span>
                                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full font-medium">
                                    Issued: {issuedCount}
                                </span>
                                <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full font-medium">
                                    Pending: {totalStudents - issuedCount}
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="form-group max-w-md">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Select Active Exam</label>
                        <select
                            className="form-select w-full"
                            value={selectedExam}
                            onChange={(e) => setSelectedExam(e.target.value)}
                        >
                            <option value="">-- Choose Exam --</option>
                            {exams.map(exam => (
                                <option key={exam.id} value={exam.id}>
                                    {exam.name} ({new Date(exam.start_date).toLocaleDateString()})
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {selectedExam && (
                <>
                    {/* Tabs */}
                    <div className="flex border-b border-gray-200 mb-0">
                        <button
                            className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'list'
                                ? 'border-blue-600 text-blue-600 bg-blue-50/50'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
                            onClick={() => setActiveTab('list')}
                        >
                            <Users size={18} /> Student List
                        </button>
                        <button
                            className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'bulk'
                                ? 'border-blue-600 text-blue-600 bg-blue-50/50'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
                            onClick={() => setActiveTab('bulk')}
                        >
                            <ShieldCheck size={18} /> Bulk Generation Rules
                        </button>
                    </div>

                    {/* Content */}
                    <div className="bg-white border text-gray-800 rounded-b-lg shadow-sm">
                        {activeTab === 'list' && (
                            <>
                                <div className="p-4 border-b bg-gray-50/50">
                                    <div className="flex flex-col md:flex-row gap-3 items-center justify-between">

                                        {/* Filter Group: Unified Container */}
                                        <div className="flex flex-1 gap-2 w-full md:w-auto items-stretch">
                                            <div className="relative flex-grow max-w-md">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <Search size={16} className="text-gray-400" />
                                                </div>
                                                <input
                                                    className="form-control pl-9 w-full h-10 border-gray-300 focus:ring-blue-500 focus:border-blue-500 rounded-l-md"
                                                    placeholder="Search by name or admission no..."
                                                    value={search}
                                                    onChange={(e) => setSearch(e.target.value)}
                                                    onKeyDown={(e) => e.key === 'Enter' && fetchStudentStatus()}
                                                />
                                            </div>

                                            <select
                                                className="form-select h-10 border-l-0 rounded-none border-gray-300 focus:ring-blue-500 focus:border-blue-500 min-w-[140px]"
                                                value={classFilter}
                                                onChange={(e) => setClassFilter(e.target.value)}
                                            >
                                                <option value="">All Classes</option>
                                                {uniqueClasses.map(c => <option key={c} value={c}>{c}</option>)}
                                            </select>

                                            <button
                                                className="btn btn-primary h-10 px-4 rounded-r-md rounded-l-none"
                                                onClick={fetchStudentStatus}
                                            >
                                                Search
                                            </button>
                                        </div>

                                        <div className="text-sm font-medium text-gray-500">
                                            Showing <span className="text-gray-900">{students.length}</span> students
                                        </div>
                                    </div>
                                </div>
                                <div className="table-container p-0">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-gray-50 text-gray-700 uppercase font-bold text-xs border-b tracking-wider">
                                            <tr>
                                                <th className="p-4">Adm No</th>
                                                <th className="p-4">Student Name</th>
                                                <th className="p-4">Class</th>
                                                <th className="p-4">Fee Status</th>
                                                <th className="p-4">Card Status</th>
                                                <th className="p-4 text-right">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {listLoading ? (
                                                <tr><td colSpan="6" className="text-center p-8">Loading...</td></tr>
                                            ) : students.length === 0 ? (
                                                <tr><td colSpan="6" className="text-center p-8 text-gray-500">No students found.</td></tr>
                                            ) : (
                                                students.map((s) => (
                                                    <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                                                        <td className="p-4 font-mono text-gray-600 font-medium">{s.admission_number}</td>
                                                        <td className="p-4">
                                                            <div className="font-semibold text-gray-900">{s.first_name} {s.last_name}</div>
                                                        </td>
                                                        <td className="p-4 text-gray-600">{s.class_name} - {s.section_name}</td>
                                                        <td className="p-4">
                                                            {parseFloat(s.total_pending) > 0 ? (
                                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                                    Due: ₹{s.total_pending}
                                                                </span>
                                                            ) : (
                                                                <span className="inline-flex items-center gap-1 text-green-700 font-medium text-sm">
                                                                    <CheckCircle size={14} /> Cleared
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="p-4">
                                                            {s.admit_card_status === 'issued' ? (
                                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                                                                    Issued
                                                                </span>
                                                            ) : (
                                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                                                                    Not Issued
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="p-4 text-right">
                                                            {s.admit_card_status !== 'issued' && (
                                                                <button
                                                                    className="btn btn-primary btn-sm py-1 px-3 text-xs"
                                                                    style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}
                                                                    onClick={() => handleIssue(s.id, s.first_name)}
                                                                >
                                                                    Force Issue
                                                                </button>
                                                            )}
                                                            {s.admit_card_status === 'issued' && (
                                                                <span className="text-gray-400 text-xs italic">
                                                                    Already Issued
                                                                </span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </>
                        )}

                        {activeTab === 'bulk' && (
                            <div className="card-body max-w-2xl mx-auto py-8">
                                <div className="border p-6 rounded-lg bg-blue-50/50 border-blue-100">
                                    <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                                        <ShieldCheck className="text-blue-600" /> Auto-Generation Rules
                                    </h4>

                                    <div className="space-y-4">
                                        <label className="flex items-center space-x-3 cursor-pointer p-3 bg-white rounded border hover:border-blue-300 transition-colors">
                                            <input
                                                type="checkbox"
                                                checked={checkFees}
                                                onChange={(e) => setCheckFees(e.target.checked)}
                                                className="w-5 h-5 text-blue-600 rounded"
                                            />
                                            <span className="text-gray-700 font-medium">Require Fee Clearance</span>
                                        </label>

                                        {checkFees && (
                                            <div className="ml-8">
                                                <label className="block text-sm font-semibold text-gray-600 mb-1">
                                                    Required Fee Types (Optional)
                                                </label>
                                                <input
                                                    type="text"
                                                    className="form-control w-full"
                                                    placeholder="e.g. Tuition Fee"
                                                    value={feeTypes}
                                                    onChange={(e) => setFeeTypes(e.target.value)}
                                                />
                                                <p className="text-xs text-gray-500 mt-1">
                                                    Comma-separated names. Leave empty to check overall balance.
                                                </p>
                                            </div>
                                        )}

                                        <div className="pt-4">
                                            <button
                                                onClick={handleGenerate}
                                                disabled={genLoading}
                                                className="btn btn-primary w-full py-3 shadow-lg shadow-blue-200"
                                            >
                                                {genLoading ? 'Processing...' : `Generate for All Eligible Students`}
                                            </button>
                                            <p className="text-center text-xs text-gray-500 mt-2">
                                                This will check all active students linked to this exam's schedule.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </>
            )}

            {!selectedExam && (
                <div className="text-center py-20 bg-gray-50 rounded-lg border border-dashed border-gray-300 text-gray-500">
                    <AlertCircle size={48} className="mx-auto text-gray-300 mb-3" />
                    Please select an exam from the dropdown above to manage admit cards.
                </div>
            )}
        </div>
    );
};

export default AdmitCardManager;
