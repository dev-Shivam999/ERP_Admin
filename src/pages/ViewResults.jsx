import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Download,
  Eye,
  Trophy,
  Users,
  BarChart3,
  FileText,
  Medal,
  TrendingUp,
  Filter,
} from "lucide-react";
import {
  fetchClassResults,
  fetchResultStatistics,
  clearClassResults,
} from "../store/slices/resultsSlice";
import { fetchClasses } from "../store/slices/academicSlice";

const ViewResults = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { sessionId } = useParams();

  const { classResults, statistics, loading } = useSelector(
    (state) => state.results || {},
  );
  const { classes } = useSelector((state) => state.academic || {});

  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [showStatistics, setShowStatistics] = useState(false);

  useEffect(() => {
    dispatch(fetchClasses());
    return () => {
      dispatch(clearClassResults());
    };
  }, [dispatch]);

  useEffect(() => {
    if (selectedClass && selectedSection) {
      dispatch(
        fetchClassResults({
          sessionId,
          classId: selectedClass,
          sectionId: selectedSection,
        }),
      );
      dispatch(fetchResultStatistics(sessionId));
    }
  }, [dispatch, sessionId, selectedClass, selectedSection]);

  const getSelectedClassSections = () => {
    const classObj = classes?.find((c) => c.id === selectedClass);
    return classObj?.sections || [];
  };

  const getGradeColor = (grade) => {
    switch (grade) {
      case "A+":
      case "A":
        return "#10b981";
      case "B+":
      case "B":
        return "#3b82f6";
      case "C+":
      case "C":
        return "#f59e0b";
      case "D":
        return "#f97316";
      case "F":
        return "#ef4444";
      default:
        return "#6b7280";
    }
  };

  const getRankBadge = (rank) => {
    if (rank === 1) return { icon: "🥇", color: "#ffd700" };
    if (rank === 2) return { icon: "🥈", color: "#c0c0c0" };
    if (rank === 3) return { icon: "🥉", color: "#cd7f32" };
    return { icon: `#${rank}`, color: "#6b7280" };
  };

  const handleDownloadReportCard = (studentId) => {
    // This would generate and download a PDF report card
    window.open(
      `/api/results/sessions/${sessionId}/students/${studentId}/report-card`,
      "_blank",
    );
  };

  const handleViewDetailedResult = (studentId) => {
    navigate(`/results/sessions/${sessionId}/students/${studentId}/details`);
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
              📊 View Results
            </h2>
            <p style={{ color: "#64748b", marginTop: "0.25rem" }}>
              View class-wise exam results and statistics
            </p>
          </div>
        </div>
        <div style={{ display: "flex", gap: "1rem" }}>
          <button
            onClick={() => setShowStatistics(!showStatistics)}
            className={`btn ${showStatistics ? "btn-primary" : "btn-outline"}`}
            style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <BarChart3 size={18} />
            {showStatistics ? "Hide" : "Show"} Statistics
          </button>
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

      {/* Statistics Cards */}
      {showStatistics && statistics && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon primary">
              <Users size={24} />
            </div>
            <div className="stat-content">
              <h3>{statistics.total_students}</h3>
              <p>Total Students</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon success">
              <TrendingUp size={24} />
            </div>
            <div className="stat-content">
              <h3>{statistics.average_percentage}%</h3>
              <p>Average Percentage</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon warning">
              <Trophy size={24} />
            </div>
            <div className="stat-content">
              <h3>{statistics.distinction_count}</h3>
              <p>Distinction (A+/A)</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon danger">
              <Medal size={24} />
            </div>
            <div className="stat-content">
              <h3>{statistics.highest_percentage}%</h3>
              <p>Highest Score</p>
            </div>
          </div>
        </div>
      )}

      {/* Results Table */}
      {selectedClass && selectedSection && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              🏆 Results - {classes?.find((c) => c.id === selectedClass)?.name}{" "}
              {
                getSelectedClassSections().find((s) => s.id === selectedSection)
                  ?.name
              }
            </h3>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <span style={{ color: "#64748b", fontSize: "0.875rem" }}>
                <Users size={16} style={{ marginRight: "0.25rem" }} />
                {classResults?.length || 0} students
              </span>
              <button
                className="btn btn-outline"
                onClick={() =>
                  window.open(
                    `/api/results/sessions/${sessionId}/class-report?classId=${selectedClass}&sectionId=${selectedSection}`,
                    "_blank",
                  )
                }
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}>
                <Download size={16} />
                Export Class Report
              </button>
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
                Loading results...
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th className="text-center">Rank</th>
                    <th>Roll No.</th>
                    <th>Student Name</th>
                    <th>Admission No.</th>
                    <th className="text-center">Total Marks</th>
                    <th className="text-center">Obtained</th>
                    <th className="text-center">Percentage</th>
                    <th className="text-center">Grade</th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {classResults?.length > 0 ? (
                    classResults.map((result) => {
                      const rankBadge = getRankBadge(result.rank);
                      return (
                        <tr key={result.student_id}>
                          <td className="text-center">
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: "0.25rem",
                                fontWeight: "bold",
                                color: rankBadge.color,
                              }}>
                              {rankBadge.icon}
                            </div>
                          </td>
                          <td>
                            <strong>{result.roll_number || "N/A"}</strong>
                          </td>
                          <td>
                            <div>
                              <strong>
                                {result.first_name} {result.last_name}
                              </strong>
                            </div>
                          </td>
                          <td>{result.admission_number}</td>
                          <td className="text-center">
                            <strong>{result.total_marks}</strong>
                          </td>
                          <td className="text-center">
                            <strong>{result.obtained_marks}</strong>
                          </td>
                          <td className="text-center">
                            <div
                              style={{
                                fontSize: "1.1rem",
                                fontWeight: "bold",
                                color:
                                  result.percentage >= 75
                                    ? "#10b981"
                                    : result.percentage >= 60
                                      ? "#3b82f6"
                                      : result.percentage >= 33
                                        ? "#f59e0b"
                                        : "#ef4444",
                              }}>
                              {result.percentage}%
                            </div>
                          </td>
                          <td className="text-center">
                            <span
                              className="badge"
                              style={{
                                backgroundColor: getGradeColor(result.grade),
                                color: "#fff",
                                fontSize: "0.875rem",
                                fontWeight: "bold",
                              }}>
                              {result.grade}
                            </span>
                          </td>
                          <td className="text-center">
                            <div
                              style={{
                                display: "flex",
                                gap: "0.5rem",
                                justifyContent: "center",
                              }}>
                              <button
                                className="btn btn-sm btn-outline"
                                onClick={() =>
                                  handleViewDetailedResult(result.student_id)
                                }
                                title="View Detailed Result">
                                <Eye size={14} />
                              </button>
                              <button
                                className="btn btn-sm btn-primary"
                                onClick={() =>
                                  handleDownloadReportCard(result.student_id)
                                }
                                title="Download Report Card">
                                <Download size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td
                        colSpan={9}
                        style={{
                          textAlign: "center",
                          color: "#6b7280",
                          padding: "2rem",
                        }}>
                        {selectedClass && selectedSection
                          ? "No results found for the selected class and section."
                          : "Please select a class and section to view results."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Grade Distribution Chart */}
      {showStatistics && statistics?.gradeDistribution && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">📈 Grade Distribution</h3>
          </div>
          <div className="card-body">
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))",
                gap: "1rem",
              }}>
              {statistics.gradeDistribution.map((grade) => (
                <div
                  key={grade.grade}
                  style={{
                    textAlign: "center",
                    padding: "1rem",
                    backgroundColor: "#f8fafc",
                    borderRadius: "8px",
                    border: `2px solid ${getGradeColor(grade.grade)}`,
                  }}>
                  <div
                    style={{
                      fontSize: "1.5rem",
                      fontWeight: "bold",
                      color: getGradeColor(grade.grade),
                    }}>
                    {grade.count}
                  </div>
                  <div
                    style={{
                      fontSize: "1.25rem",
                      fontWeight: "bold",
                      color: getGradeColor(grade.grade),
                    }}>
                    {grade.grade}
                  </div>
                  <div style={{ fontSize: "0.875rem", color: "#6b7280" }}>
                    {statistics.total_students > 0
                      ? (
                          (grade.count / statistics.total_students) *
                          100
                        ).toFixed(1)
                      : 0}
                    %
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewResults;
