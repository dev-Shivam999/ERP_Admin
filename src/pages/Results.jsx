import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Edit3,
  Eye,
  Send,
  Download,
  BarChart3,
  Trophy,
  FileText,
  Users,
  Calculator,
  CheckCircle,
  Clock,
  Award,
  BookOpen,
  GraduationCap,
} from "lucide-react";
import {
  fetchStudentsForMarkEntry,
  fetchSubjectsForClass,
  enterStudentMarks,
  fetchStudentMarks,
  clearStudentMarks,
} from "../store/slices/resultsSlice";
import { fetchExams } from "../store/slices/examsSlice";
import { fetchClasses } from "../store/slices/academicSlice";

const Results = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { students, subjects, studentMarks, markEntryLoading, loading } =
    useSelector((state) => state.results || {});
  const { exams } = useSelector((state) => state.exams || {});
  const { classes } = useSelector((state) => state.academic || {});

  // Selection states
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [selectedExam, setSelectedExam] = useState("");
  const [selectedYear, setSelectedYear] = useState(
    new Date().getFullYear().toString(),
  );
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Mark entry states
  const [marks, setMarks] = useState({});
  const [showMarkEntryModal, setShowMarkEntryModal] = useState(false);
  const [activeStep, setActiveStep] = useState(1); // 1: Select filters, 2: Select student, 3: Enter marks

  useEffect(() => {
    dispatch(fetchExams());
    dispatch(fetchClasses());
  }, [dispatch]);

  useEffect(() => {
    if (selectedClass) {
      dispatch(fetchSubjectsForClass(selectedClass));
    }
  }, [dispatch, selectedClass]);

  useEffect(() => {
    if (selectedClass && selectedSection && selectedExam) {
      dispatch(
        fetchStudentsForMarkEntry({
          sessionId: `${selectedExam}-${selectedYear}`, // Create a session ID from exam and year
          classId: selectedClass,
          sectionId: selectedSection,
        }),
      );
    }
  }, [dispatch, selectedClass, selectedSection, selectedExam, selectedYear]);

  const handleStudentSelect = async (student) => {
    setSelectedStudent(student);
    setActiveStep(3);

    // Initialize marks for all subjects
    const initialMarks = {};
    subjects.forEach((subject) => {
      initialMarks[subject.id] = {
        maxMarks: 100,
        obtainedMarks: 0,
      };
    });
    setMarks(initialMarks);

    // If student already has marks, fetch them
    if (student.result_id) {
      const result = await dispatch(
        fetchStudentMarks({
          sessionId: `${selectedExam}-${selectedYear}`,
          studentId: student.student_id,
        }),
      );

      if (!result.error && result.payload?.subject_marks) {
        const existingMarks = {};
        result.payload.subject_marks.forEach((mark) => {
          if (mark.subject_id) {
            existingMarks[mark.subject_id] = {
              maxMarks: mark.max_marks || 100,
              obtainedMarks: mark.obtained_marks || 0,
            };
          }
        });
        setMarks(existingMarks);
      }
    }
  };

  const handleMarkChange = (subjectId, field, value) => {
    setMarks((prev) => ({
      ...prev,
      [subjectId]: {
        ...prev[subjectId],
        [field]: parseFloat(value) || 0,
      },
    }));
  };

  const handleSaveMarks = async () => {
    if (!selectedStudent) return;

    const marksArray = Object.entries(marks).map(([subjectId, mark]) => ({
      subjectId,
      maxMarks: mark.maxMarks,
      obtainedMarks: mark.obtainedMarks,
    }));

    const result = await dispatch(
      enterStudentMarks({
        sessionId: `${selectedExam}-${selectedYear}`,
        studentId: selectedStudent.student_id,
        marks: marksArray,
        classId: selectedClass,
        sectionId: selectedSection,
      }),
    );

    if (!result.error) {
      setActiveStep(2);
      setSelectedStudent(null);
      setMarks({});
      dispatch(clearStudentMarks());

      // Refresh students list
      dispatch(
        fetchStudentsForMarkEntry({
          sessionId: `${selectedExam}-${selectedYear}`,
          classId: selectedClass,
          sectionId: selectedSection,
        }),
      );

      alert("Marks saved successfully!");
    }
  };

  const calculatePercentage = (obtained, max) => {
    if (max === 0) return 0;
    return ((obtained / max) * 100).toFixed(2);
  };

  const getTotalMarks = () => {
    const total = Object.values(marks).reduce(
      (acc, mark) => ({
        max: acc.max + (mark.maxMarks || 0),
        obtained: acc.obtained + (mark.obtainedMarks || 0),
      }),
      { max: 0, obtained: 0 },
    );
    return total;
  };

  const getSelectedClassSections = () => {
    console.log(classes,"",selectedClass);
    
    const classObj = classes?.find((c) => c.id === selectedClass);
    return classObj?.sections || [];
  };

  const canProceedToStep2 =
    selectedClass && selectedSection && selectedExam && selectedYear;
  const canProceedToStep3 = canProceedToStep2 && selectedStudent;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}>
        <div>
          <h2
            style={{
              fontSize: "2rem",
              fontWeight: "bold",
              color: "#1e293b",
              margin: 0,
            }}>
            📊 Results Management
          </h2>
          <p style={{ color: "#64748b", marginTop: "0.25rem" }}>
            Select class, exam, and year to manage student results
          </p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="card">
        <div className="card-body" style={{ padding: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                color: activeStep >= 1 ? "#4f46e5" : "#9ca3af",
              }}>
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  backgroundColor: activeStep >= 1 ? "#4f46e5" : "#e5e7eb",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: "bold",
                }}>
                1
              </div>
              <span style={{ fontWeight: "500" }}>Select Filters</span>
            </div>
            <div
              style={{
                flex: 1,
                height: "2px",
                backgroundColor: activeStep >= 2 ? "#4f46e5" : "#e5e7eb",
              }}
            />
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                color: activeStep >= 2 ? "#4f46e5" : "#9ca3af",
              }}>
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  backgroundColor: activeStep >= 2 ? "#4f46e5" : "#e5e7eb",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: "bold",
                }}>
                2
              </div>
              <span style={{ fontWeight: "500" }}>Select Student</span>
            </div>
            <div
              style={{
                flex: 1,
                height: "2px",
                backgroundColor: activeStep >= 3 ? "#4f46e5" : "#e5e7eb",
              }}
            />
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                color: activeStep >= 3 ? "#4f46e5" : "#9ca3af",
              }}>
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  backgroundColor: activeStep >= 3 ? "#4f46e5" : "#e5e7eb",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: "bold",
                }}>
                3
              </div>
              <span style={{ fontWeight: "500" }}>Enter Marks</span>
            </div>
          </div>
        </div>
      </div>

      {/* Step 1: Selection Filters */}
      {activeStep === 1 && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">🎯 Step 1: Select Class, Exam & Year</h3>
          </div>
          <div className="card-body">
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr 1fr",
                gap: "1rem",
                marginBottom: "1.5rem",
              }}>
              <div className="form-group">
                <label className="form-label">Class</label>
                <select
                  className="form-select"
                  value={selectedClass}
                  onChange={(e) => {
                    setSelectedClass(e.target.value);
                    setSelectedSection("");
                  }}>
                  <option value="">Select Class</option>
                  {classes?.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Section</label>
                <select
                  className="form-select"
                  value={selectedSection}
                  onChange={(e) => setSelectedSection(e.target.value)}
                  disabled={!selectedClass}>
                  <option value="">Select Section</option>
                  {getSelectedClassSections().map((section) => (
                    <option key={section.id} value={section.id}>
                      {section.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Exam</label>
                <select
                  className="form-select"
                  value={selectedExam}
                  onChange={(e) => setSelectedExam(e.target.value)}>
                  <option value="">Select Exam</option>
                  {exams?.map((exam) => (
                    <option key={exam.id} value={exam.id}>
                      {exam.name} ({exam.exam_type})
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Year</label>
                <select
                  className="form-select"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}>
                  <option value="">Select Year</option>
                  {[2024, 2025, 2026].map((year) => (
                    <option key={year} value={year.toString()}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button
                className="btn btn-primary"
                onClick={() => setActiveStep(2)}
                disabled={!canProceedToStep2}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}>
                <Users size={18} />
                Proceed to Select Student
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Student Selection */}
      {activeStep === 2 && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              👥 Step 2: Select Student -{" "}
              {classes?.find((c) => c.id === selectedClass)?.name}{" "}
              {
                getSelectedClassSections().find((s) => s.id === selectedSection)
                  ?.name
              }
            </h3>
            <button
              className="btn btn-outline"
              onClick={() => setActiveStep(1)}
              style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              ← Back to Filters
            </button>
          </div>
          <div className="table-container">
            {loading ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "3rem",
                  color: "#6b7280",
                }}>
                Loading students...
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Roll No.</th>
                    <th>Student Name</th>
                    <th>Admission No.</th>
                    <th className="text-center">Result Status</th>
                    <th className="text-center">Percentage</th>
                    <th className="text-center">Grade</th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {students?.length > 0 ? (
                    students.map((student) => (
                      <tr key={student.student_id}>
                        <td>
                          <strong>{student.roll_number || "N/A"}</strong>
                        </td>
                        <td>
                          <div>
                            <strong>
                              {student.first_name} {student.last_name}
                            </strong>
                          </div>
                        </td>
                        <td>{student.admission_number}</td>
                        <td className="text-center">
                          {student.result_status ? (
                            <span
                              className="badge"
                              style={{
                                backgroundColor:
                                  student.result_status === "published"
                                    ? "#10b981"
                                    : "#f59e0b",
                                color: "#fff",
                                display: "flex",
                                alignItems: "center",
                                gap: "0.25rem",
                                justifyContent: "center",
                              }}>
                              {student.result_status === "published" ? (
                                <CheckCircle size={14} />
                              ) : (
                                <Clock size={14} />
                              )}
                              {student.result_status}
                            </span>
                          ) : (
                            <span
                              className="badge"
                              style={{
                                backgroundColor: "#6b7280",
                                color: "#fff",
                              }}>
                              Not Started
                            </span>
                          )}
                        </td>
                        <td className="text-center">
                          {student.percentage ? (
                            <strong>{student.percentage}%</strong>
                          ) : (
                            "-"
                          )}
                        </td>
                        <td className="text-center">
                          {student.grade ? (
                            <span
                              className="badge"
                              style={{
                                backgroundColor:
                                  student.grade === "F" ? "#ef4444" : "#10b981",
                                color: "#fff",
                              }}>
                              {student.grade}
                            </span>
                          ) : (
                            "-"
                          )}
                        </td>
                        <td className="text-center">
                          <button
                            className="btn btn-sm btn-primary"
                            onClick={() => handleStudentSelect(student)}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "0.25rem",
                            }}>
                            <Edit3 size={14} />
                            {student.result_status ? "Edit" : "Enter"} Marks
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={7}
                        style={{
                          textAlign: "center",
                          color: "#6b7280",
                          padding: "2rem",
                        }}>
                        No students found for the selected filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Step 3: Mark Entry */}
      {activeStep === 3 && selectedStudent && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              📝 Step 3: Enter Marks - {selectedStudent.first_name}{" "}
              {selectedStudent.last_name}
            </h3>
            <div style={{ display: "flex", gap: "1rem" }}>
              <button
                className="btn btn-outline"
                onClick={() => setActiveStep(2)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}>
                ← Back to Students
              </button>
            </div>
          </div>
          <div className="card-body">
            <div
              style={{
                marginBottom: "1.5rem",
                padding: "1rem",
                backgroundColor: "#f8fafc",
                borderRadius: "8px",
              }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}>
                <div>
                  <strong>Student:</strong> {selectedStudent.first_name}{" "}
                  {selectedStudent.last_name} |<strong> Roll No:</strong>{" "}
                  {selectedStudent.roll_number} |<strong> Admission:</strong>{" "}
                  {selectedStudent.admission_number}
                </div>
                <div>
                  <strong>Exam:</strong>{" "}
                  {exams?.find((e) => e.id === selectedExam)?.name} |
                  <strong> Year:</strong> {selectedYear}
                </div>
              </div>
            </div>

            <div className="table-container" style={{ marginBottom: "1.5rem" }}>
              <table>
                <thead>
                  <tr>
                    <th>Subject</th>
                    <th className="text-center">Max Marks</th>
                    <th className="text-center">Obtained Marks</th>
                    <th className="text-center">Percentage</th>
                  </tr>
                </thead>
                <tbody>
                  {subjects?.map((subject) => (
                    <tr key={subject.id}>
                      <td>
                        <div>
                          <strong>{subject.name}</strong>
                          {subject.code && (
                            <div
                              style={{
                                fontSize: "0.75rem",
                                color: "#6b7280",
                              }}>
                              {subject.code}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="text-center">
                        <input
                          type="number"
                          className="form-input"
                          style={{ width: "80px", textAlign: "center" }}
                          value={marks[subject.id]?.maxMarks || 100}
                          onChange={(e) =>
                            handleMarkChange(
                              subject.id,
                              "maxMarks",
                              e.target.value,
                            )
                          }
                          min="0"
                          max="1000"
                        />
                      </td>
                      <td className="text-center">
                        <input
                          type="number"
                          className="form-input"
                          style={{ width: "80px", textAlign: "center" }}
                          value={marks[subject.id]?.obtainedMarks || 0}
                          onChange={(e) =>
                            handleMarkChange(
                              subject.id,
                              "obtainedMarks",
                              e.target.value,
                            )
                          }
                          min="0"
                          max={marks[subject.id]?.maxMarks || 100}
                        />
                      </td>
                      <td className="text-center">
                        <strong>
                          {calculatePercentage(
                            marks[subject.id]?.obtainedMarks || 0,
                            marks[subject.id]?.maxMarks || 100,
                          )}
                          %
                        </strong>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Total Summary */}
            <div
              style={{
                backgroundColor: "#f8fafc",
                padding: "1rem",
                borderRadius: "8px",
                marginBottom: "1.5rem",
              }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: "1rem",
                  textAlign: "center",
                }}>
                <div>
                  <div style={{ fontSize: "0.875rem", color: "#6b7280" }}>
                    Total Max Marks
                  </div>
                  <div style={{ fontSize: "1.25rem", fontWeight: "bold" }}>
                    {getTotalMarks().max}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: "0.875rem", color: "#6b7280" }}>
                    Total Obtained
                  </div>
                  <div style={{ fontSize: "1.25rem", fontWeight: "bold" }}>
                    {getTotalMarks().obtained}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: "0.875rem", color: "#6b7280" }}>
                    Overall Percentage
                  </div>
                  <div
                    style={{
                      fontSize: "1.25rem",
                      fontWeight: "bold",
                      color:
                        calculatePercentage(
                          getTotalMarks().obtained,
                          getTotalMarks().max,
                        ) >= 33
                          ? "#10b981"
                          : "#ef4444",
                    }}>
                    {calculatePercentage(
                      getTotalMarks().obtained,
                      getTotalMarks().max,
                    )}
                    %
                  </div>
                </div>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "1rem",
              }}>
              <button
                className="btn btn-success"
                onClick={handleSaveMarks}
                disabled={markEntryLoading}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}>
                <Calculator size={16} />
                {markEntryLoading ? "Saving..." : "Save Marks"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Results;
