import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Printer } from "lucide-react";
import { studentAPI } from "../services/api";

const StudentPrint = () => {
    const { id } = useParams();
    const [student, setStudent] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStudent = async () => {
            try {
                const res = await studentAPI.getById(id);
                setStudent(res.data || res);
            } catch (err) {
                console.error(err);
                alert("Failed to load student details");
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchStudent();
    }, [id]);

    useEffect(() => {
        if (student && !loading) {
            setTimeout(() => window.print(), 800);
        }
    }, [student, loading]);

    if (loading) return <div className="p-10 text-center">Loading Form...</div>;
    if (!student) return <div className="p-10 text-center">Student not found</div>;

    // Helper to render data or a dotted line if empty (for handwriting)
    const Val = ({ v }) => (
        <span className="font-semibold px-2">
            {v ? v : "________________________"}
        </span>
    );

    return (
        <div className="bg-gray-100 min-h-screen py-8">
            {/* PRINT STYLES */}
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Tinos:wght@400;700&display=swap');
        
        @media print {
          @page { size: A4; margin: 5mm; }
          body { 
            print-color-adjust: exact; 
            -webkit-print-color-adjust: exact; 
            background-color: white !important;
          }
          .no-print { display: none !important; }
          .print-container { 
            box-shadow: none !important; 
            border: none !important;
            width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
          }
        }
        .serif-font { font-family: 'Tinos', 'Times New Roman', Times, serif; }
        .table-form td, .table-form th {
          border: 1px solid black;
          padding: 2px 4px;
          vertical-align: middle;
          font-size: 12px;
        }
      `}</style>

            {/* PAPER CONTAINER */}
            <div className="print-container max-w-[210mm] mx-auto bg-white text-black serif-font shadow-lg">

                {/* ACTION BAR */}
                <div className="no-print p-4 bg-gray-800 text-white flex justify-between items-center mb-0">
                    <span className="text-sm">Preview Mode</span>
                    <button
                        onClick={() => window.print()}
                        className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded flex items-center gap-2 font-sans text-sm"
                    >
                        <Printer size={16} /> Print Form
                    </button>
                </div>

                {/* ACTUAL FORM CONTENT */}
                <div className="p-4 relative">

                    {/* BORDER CONTAINER */}
                    <div className="border-4 border-double border-black h-full p-2">

                        {/* 1. HEADER */}
                        <div className="flex justify-between items-start border-b-2 border-black pb-2 mb-2">
                            <div className="w-20 h-20 border border-black flex items-center justify-center bg-gray-50 text-xs text-center p-1">
                                [School Logo]
                            </div>
                            <div className="flex-1 text-center px-4">
                                <h1 className="text-2xl font-bold uppercase tracking-wide">
                                    St. Xavier's High School
                                </h1>
                                <p className="font-bold text-xs mt-1">
                                    (Affiliated to C.B.S.E., New Delhi | Affiliation No. 123456)
                                </p>
                                <p className="text-xs">
                                    Plot No. 45, Knowledge Park, City Name - 400001
                                </p>
                                <p className="text-xs">
                                    Email: info@school.com | Ph: 022-12345678
                                </p>
                            </div>
                            <div className="w-20 h-24 border border-black flex items-center justify-center bg-gray-50">
                                {student.photo_url ? (
                                    <img src={student.photo_url} className="w-full h-full object-cover" alt="Student" />
                                ) : (
                                    <span className="text-[10px] text-center font-bold text-gray-400">AFFIX RECENT PHOTO</span>
                                )}
                            </div>
                        </div>

                        <div className="text-center mb-3 relative">
                            <span className="bg-black text-white px-6 py-0.5 font-bold rounded-full text-base uppercase inline-block">
                                Admission Form
                            </span>
                            <div className="absolute right-0 top-1 text-xs font-bold">
                                Session: 2024-2025
                            </div>
                        </div>

                        {/* 2. OFFICE USE ONLY */}
                        <div className="mb-3">
                            <div className="text-[10px] font-bold uppercase mb-0.5">For Office Use Only:</div>
                            <table className="w-full table-form text-xs">
                                <tbody>
                                    <tr className="bg-gray-100">
                                        <td width="25%"><b>Form No:</b> <span className="ml-2 text-red-600 font-bold">{student.admission_number}</span></td>
                                        <td width="25%"><b>Date:</b> {new Date().toLocaleDateString()}</td>
                                        <td width="25%"><b>Class Admitted:</b> {student.class_name}</td>
                                        <td width="25%"><b>Reg. No:</b> ____________</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {/* 3. STUDENT DETAILS TABLE */}
                        <h3 className="text-xs font-bold uppercase bg-gray-200 border border-black border-b-0 p-1 pl-2">
                            1. Student Details
                        </h3>
                        <table className="w-full table-form text-xs mb-3 border-collapse">
                            <tbody>
                                <tr>
                                    <td width="20%" className="font-bold">Full Name</td>
                                    <td colSpan="3" className="uppercase text-sm font-bold">
                                        {student.first_name} {student.middle_name ? student.middle_name + ' ' : ''}{student.last_name}
                                    </td>
                                </tr>
                                <tr>
                                    <td className="font-bold">Date of Birth</td>
                                    <td><Val v={student.date_of_birth} /></td>
                                    <td className="font-bold" width="15%">Gender</td>
                                    <td>{student.gender || "Male / Female"}</td>
                                </tr>
                                <tr>
                                    <td className="font-bold">Nationality</td>
                                    <td>Indian</td>
                                    <td className="font-bold">Blood Group</td>
                                    <td><Val v={student.blood_group} /></td>
                                </tr>
                                <tr>
                                    <td className="font-bold">Religion</td>
                                    <td><Val v={student.religion} /></td>
                                    <td className="font-bold">Category</td>
                                    <td><Val v={student.category} /></td>
                                </tr>
                                <tr>
                                    <td className="font-bold">Aadhaar No.</td>
                                    <td colSpan="3"><Val v={student.aadhar_number} /></td>
                                </tr>
                            </tbody>
                        </table>

                        {/* 4. PARENT DETAILS */}
                        <h3 className="text-xs font-bold uppercase bg-gray-200 border border-black border-b-0 p-1 pl-2">
                            2. Parent / Guardian Details
                        </h3>
                        <table className="w-full table-form text-xs mb-3">
                            <thead>
                                <tr className="bg-gray-50">
                                    <th width="20%">Particulars</th>
                                    <th width="40%">Father's Details</th>
                                    <th width="40%">Mother's Details</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="font-bold">Name</td>
                                    <td className="uppercase"><Val v={student.father_name} /></td>
                                    <td className="uppercase"><Val v={student.mother_name} /></td>
                                </tr>
                                <tr>
                                    <td className="font-bold">Mobile No.</td>
                                    <td><Val v={student.phone} /></td>
                                    <td>________________________</td>
                                </tr>
                                <tr>
                                    <td className="font-bold">Email ID</td>
                                    <td><Val v={student.phone} /></td>
                                    <td>________________________</td>
                                </tr>
                            </tbody>
                        </table>

                        {/* 5. ADDRESS */}
                        <h3 className="text-xs font-bold uppercase bg-gray-200 border border-black border-b-0 p-1 pl-2">
                            3. Communication Address
                        </h3>
                        <table className="w-full table-form text-xs mb-3">
                            <tbody>
                                <tr>
                                    <td width="20%" className="font-bold">Residential Address</td>
                                    <td className="h-12 align-top pt-1">
                                        {student.address}, {student.city}, {student.state} - {student.pincode}
                                    </td>
                                </tr>
                                <tr>
                                    <td className="font-bold">Permanent Address</td>
                                    <td className="h-8 align-top pt-1">
                                        <span className="text-gray-400 italic">(If different from above)</span>
                                    </td>
                                </tr>
                            </tbody>
                        </table>

                        {/* 6. DECLARATION */}
                        <div className="border border-black p-2 text-justify text-xs mb-2">
                            <h4 className="font-bold underline mb-1 text-center">DECLARATION BY PARENTS</h4>
                            <p className="leading-tight mb-8">
                                I, <b>{student.father_name || "__________________"}</b>, hereby declare that the information furnished above is true
                                and correct to the best of my knowledge. I agree to abide by the rules and regulations of the school
                                management. I understand that admission is subject to verification of documents.
                            </p>

                            <div className="flex justify-between items-end px-4">
                                <div className="text-center">
                                    <p>______________________</p>
                                    <p className="font-bold text-[10px]">Date</p>
                                </div>
                                <div className="text-center">
                                    <p>______________________</p>
                                    <p className="font-bold text-[10px]">Signature of Father</p>
                                </div>
                                <div className="text-center">
                                    <p>______________________</p>
                                    <p className="font-bold text-[10px]">Signature of Mother</p>
                                </div>
                            </div>
                        </div>

                        {/* 7. FOOTER */}
                        <div className="border-t-2 border-dashed border-black pt-1 mt-auto">
                            <p className="text-center font-bold uppercase text-[10px]">For School Office Use Only</p>
                            <div className="flex justify-between mt-6 px-8 text-xs">
                                <div className="text-center">
                                    <p>________________</p>
                                    <p>Clerk</p>
                                </div>
                                <div className="text-center">
                                    <p>________________</p>
                                    <p>Accounts Officer</p>
                                </div>
                                <div className="text-center">
                                    <p>________________</p>
                                    <p>Principal</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentPrint;