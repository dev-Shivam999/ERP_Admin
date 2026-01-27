import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import {
  Save,
  ArrowLeft,
  Users,
  BookOpen,
  Calculator,
  CheckCircle,
  AlertCircle,
  Edit3,
} from "lucide-react";
import {
  fetchStudentsForMarkEntry,
  fetchSubjectsForClass,
  enterStudentMarks,
  fetchStudentMarks,
  clearStudentMarks,
} from "../store/slices/resultsSlice";
import { fetchClasses } from "../store/slices/academicSlice";

const MarkEntry = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { sessionId } = useParams();

  const { students, subjects, studentMarks, markEntryLoading, loading } =
    useSelector((state) => state.results || {});
  const { classes } = useSelector((state) => state.academic || {});

  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [marks, setMarks] = useState({});
  const [showMarkEntryModal, setShowMarkEntryModal] = useState(false);

  useEffect(() => {
    dispatch(fetchClasses());
  }, [dispatch]);

  useEffect(() => {
    if (selectedClass) {
      dispatch(fetchSubjectsForClass(selectedClass));
    }
  }, [dispatch, selectedClass]);

  useEffect(() => {
    if (selectedClass && selectedSection) {
      dispatch(
        fetchStudentsForMarkEntry({
          sessionId,
          classId: selectedClass,
          sectionId: selectedSection,
        }),
      );
    }
  }, [dispatch, sessionId, selectedClass, selectedSection]);

  const handleStudentSelect = async (student) => {
    setSelectedStudent(student);
    setShowMarkEntryModal(true);

    // If student already has marks, fetch them
    if (student.result_id) {
      const result = await dispatch(
        fetchStudentMarks({
          sessionId,
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
    } else {
      // Initialize empty marks for all subjects
      const initialMarks = {};
      subjects.forEach((subject) => {
        initialMarks[subject.id] = {
          maxMarks: 100,
          obtainedMarks: 0,
        };
      });
      setMarks(initialMarks);
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
        sessionId,
        studentId: selectedStudent.student_id,
        marks: marksArray,
        classId: selectedClass,
        sectionId: selectedSection,
      }),
    );

    if (!result.error) {
      setShowMarkEntryModal(false);
      setSelectedStudent(null);
      setMarks({});
      dispatch(clearStudentMarks());

      // Refresh students list
      dispatch(
        fetchStudentsForMarkEntry({
          sessionId,
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
    const classObj = classes?.find((c) => c.id === selectedClass);
    return classObj?.sections || [];
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <button
            onClick={() => navigate("/results")}
            className="btn btn-outline"
            style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <ArrowLeft size={18} /> Back to Results
          </button>
          <div>
            <h2
              style={{
                fontSize: "2rem",
                fontWeight: "bold",
                color: "#1e293b",
                margin: 0,
              }}>
              📝 Mark Entry
            </h2>
            <p style={{ color: "#64748b", marginTop: "0.25rem" }}>
              Enter subject-wise marks for students
            </p>
          </div>
        </div>
      </div>

      {/* Class & Section Selection */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">🎯 Select Class & Section</h3>
        </div>
        <div className="card-body">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "1rem",
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
          </div>
        </div>
      </div>

      {/* Students List */}
      {selectedClass && selectedSection && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              👥 Students - {classes?.find((c) => c.id === selectedClass)?.name}{" "}
              {
                getSelectedClassSections().find((s) => s.id === selectedSection)
                  ?.name
              }
            </h3>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <span style={{ color: "#64748b", fontSize: "0.875rem" }}>
                <Users size={16} style={{ marginRight: "0.25rem" }} />
                {students?.length || 0} students
              </span>
            </div>
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
                    <th className="text-center">Marks Status</th>
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
                                <AlertCircle size={14} />
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
                        No students found for the selected class and section.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Mark Entry Modal */}
      {showMarkEntryModal && selectedStudent && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}>
          <div
            style={{
              backgroundColor: "#fff",
              padding: "2rem",
              borderRadius: "12px",
              width: "800px",
              maxWidth: "90%",
              maxHeight: "90%",
              overflow: "auto",
              boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)",
            }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "1.5rem",
              }}>
              <h3
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  margin: 0,
                }}>
                📝 Enter Marks - {selectedStudent.first_name}{" "}
                {selectedStudent.last_name}
              </h3>
              <div style={{ fontSize: "0.875rem", color: "#6b7280" }}>
                Roll No: {selectedStudent.roll_number} | Admission:{" "}
                {selectedStudent.admission_number}
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
                className="btn btn-outline"
                onClick={() => {
                  setShowMarkEntryModal(false);
                  setSelectedStudent(null);
                  setMarks({});
                  dispatch(clearStudentMarks());
                }}>
                Cancel
              </button>
              <button
                className="btn btn-success"
                onClick={handleSaveMarks}
                disabled={markEntryLoading}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}>
                <Save size={16} />
                {markEntryLoading ? "Saving..." : "Save Marks"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarkEntry;
