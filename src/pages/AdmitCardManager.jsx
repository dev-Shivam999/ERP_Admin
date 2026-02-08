import React, { useState, useEffect } from 'react';
import { examAPI } from '../services/api';
import {
    Download,
    Printer,
    FileText,
    CheckCircle,
    AlertCircle,
    Search,
    ShieldCheck,
    Users
} from 'lucide-react';

const AdmitCardManager = () => {
    const [exams, setExams] = useState([]);
    const [selectedExam, setSelectedExam] = useState('');
    const [classes, setClasses] = useState([]);

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
            fetchExamStats();
        } else {
            setStudents([]);
            setClasses([]);
        }
    }, [selectedExam, classFilter, search]);

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

    const fetchExamStats = async () => {
        try {
            const response = await examAPI.getStats(selectedExam);
            if (response.success && response.data) {
                setClasses(response.data);
            }
        } catch (error) {
            console.error('Failed to fetch exam stats', error);
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

    const handlePrintAll = async () => {
        const printWindow = window.open('', '_blank');
        printWindow.document.write('<html><head><title>Print Admit Cards</title></head><body>Loading...</body></html>');

        try {
            const response = await examAPI.getBatchAdmitCards(selectedExam, { classId: classFilter });
            if (response.success) {
                const cards = response.data;
                if (cards.length === 0) {
                    printWindow.close();
                    return alert("No issued admit cards found to print.");
                }

                // Generate HTML
                const htmlContent = `
                <html>
                <head>
                    <title>Admit Cards - ${cards[0].exam.name}</title>
                    <style>
                        @media print {
                            .page-break { page-break-after: always; }
                            body { margin: 0; padding: 0; }
                        }
                        body { font-family: Arial, sans-serif; background: #f0f0f0; margin: 20px; }
                        .admit-card {
                            width: 210mm; 
                            min-height: 297mm;
                            background: white;
                            padding: 40px;
                            box-sizing: border-box;
                            margin: 0 auto 20px auto;
                            position: relative;
                            border: 1px solid #ddd;
                        }
                        @media print {
                             .admit-card { border: none; margin: 0; height: 100vh; }
                        }
                        .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 15px; margin-bottom: 25px; }
                        .school-name { font-size: 26px; font-weight: 800; text-transform: uppercase; margin-bottom: 5px; }
                        .school-address { font-size: 14px; color: #555; margin-bottom: 5px; }
                        .exam-name { font-size: 20px; margin-top: 10px; font-weight: bold; color: #000; text-decoration: underline; }
                        
                        .student-info { display: flex; justify-content: space-between; margin-bottom: 25px; border: 1px solid #000; padding: 20px; border-radius: 4px; }
                        .info-group { margin-bottom: 8px; }
                        .info-group label { display: inline-block; width: 100px; font-size: 13px; color: #555; font-weight: bold; }
                        .info-group span { font-size: 15px; font-weight: 600; color: #000; }
                        
                        table { width: 100%; border-collapse: collapse; margin-top: 15px; border: 1px solid #000; }
                        th, td { border: 1px solid #000; padding: 12px; text-align: center; font-size: 14px; }
                        th { background: #f8f9fa; font-weight: bold; text-transform: uppercase; }
                        
                        .footer { margin-top: 50px; display: flex; justify-content: space-between; padding: 0 20px; }
                        .sign-box { text-align: center; width: 200px; border-top: 1px solid #000; padding-top: 10px; font-weight: bold; }
                        
                        .generated-date { position: absolute; bottom: 20px; left: 40px; font-size: 10px; color: #999; }
                    </style>
                </head>
                <body>
                    ${cards.map(item => `
                        <div class="admit-card page-break">
                            <div class="header">
                                <div class="school-name">${item.exam.school_name || 'SCHOOL NAME'}</div>
                                <div class="school-address">${item.exam.school_address || 'Address Line 1'}</div>
                                <div class="exam-name">${item.exam.name} - ADMIT CARD</div>
                            </div>
                            
                            <div class="student-info">
                                <div style="flex: 1;">
                                    <div class="info-group">
                                        <label>Name:</label>
                                        <span>${item.student.student_name}</span>
                                    </div>
                                    <div class="info-group">
                                        <label>Father's Name:</label>
                                        <span>${item.student.father_name}</span>
                                    </div>
                                    <div class="info-group">
                                        <label>Admission No:</label>
                                        <span>${item.student.admission_number}</span>
                                    </div>
                                </div>
                                <div style="flex: 1; text-align: right;">
                                     <div class="info-group">
                                        <label style="text-align: left;">Class:</label>
                                        <span>${item.student.class_name} - ${item.student.section_name}</span>
                                    </div>
                                    <div class="info-group">
                                        <label style="text-align: left;">Roll No:</label>
                                        <span>${item.student.roll_number || 'N/A'}</span>
                                    </div>
                                </div>
                            </div>

                            <table class="table-auto w-full">
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Time</th>
                                        <th>Subject</th>
                                        <th>Invigilator Sign</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${item.schedule.map(sch => `
                                        <tr>
                                            <td>${new Date(sch.exam_date).toLocaleDateString()}</td>
                                            <td>${sch.start_time.slice(0, 5)} - ${sch.end_time.slice(0, 5)}</td>
                                            <td style="text-align: left; padding-left: 20px; font-weight: 500;">${sch.subject_name}</td>
                                            <td></td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>

                            <div class="footer">
                                <div class="sign-box">Class Teacher</div>
                                <div class="sign-box">Principal / Controller of Exams</div>
                            </div>
                            
                            <div class="generated-date">Generated on: ${new Date().toLocaleString()}</div>
                        </div>
                    `).join('')}
                    <script>
                        window.onload = function() { window.print(); }
                    </script>
                </body>
                </html>
               `;

                printWindow.document.open();
                printWindow.document.write(htmlContent);
                printWindow.document.close();
            }
        } catch (error) {
            printWindow.close();
            alert('Failed to load admit cards: ' + error.message);
        }
    };

    // Derived Stats
    const totalStudents = students.length;
    const issuedCount = students.filter(s => s.admit_card_status === 'issued').length;

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
                                                {classes.map(c => (
                                                    <option key={c.class_id} value={c.class_id}>
                                                        {c.class_name}
                                                    </option>
                                                ))}
                                            </select>

                                            <button
                                                className="btn btn-primary h-10 px-4 rounded-none"
                                                onClick={fetchStudentStatus}
                                            >
                                                Search
                                            </button>
                                            <button
                                                className="btn btn-outline-secondary h-10 px-4 rounded-r-md border-l-0"
                                                onClick={() => handlePrintAll()}
                                                title="Print All Issued"
                                            >
                                                <Printer size={18} />
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
                                                                <span className="text-red-600 font-bold text-xs">
                                                                    Due: ₹{s.total_pending}
                                                                </span>
                                                            ) : (
                                                                <span className="text-green-600 font-bold text-xs">
                                                                    Paid
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="p-4">
                                                            {s.admit_card_status === 'issued' ? (
                                                                <span className="text-green-600 font-bold text-xs uppercase tracking-wider">
                                                                    Issued
                                                                </span>
                                                            ) : (
                                                                <span className="text-gray-400 font-bold text-xs uppercase tracking-wider">
                                                                    Pending
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
