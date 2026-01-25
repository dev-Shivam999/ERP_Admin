import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Trash2,
  Edit3,
  Layers,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Fingerprint,
  Layers3,
  Hash,
  IndianRupee,
  Sliders,
  Sparkles,
} from "lucide-react";
import {
  fetchClasses,
  createClass,
  updateClass,
  deleteClass,
  fetchSectionsByClass,
  createSection,
} from "../store/slices/academicSlice";

const Academic = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { classes, sectionsByClass, loading } = useSelector(
    (state) => state.academic,
  );
  const [selectedClassId, setSelectedClassId] = useState(null);
  const [showClassModal, setShowClassModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingClassId, setEditingClassId] = useState(null);
  const [showSectionModal, setShowSectionModal] = useState(false);

  const [newClass, setNewClass] = useState({ name: "", numericValue: "" });
  const [newSection, setNewSection] = useState({ name: "", capacity: 40 });

  useEffect(() => {
    dispatch(fetchClasses());
  }, [dispatch]);

  useEffect(() => {
    if (selectedClassId) {
      dispatch(fetchSectionsByClass(selectedClassId));
    }
  }, [dispatch, selectedClassId]);

  const handleCreateClass = async (e) => {
    e.preventDefault();
    try {
      if (isEditMode) {
        const result = await dispatch(
          updateClass({ id: editingClassId, ...newClass }),
        );
        if (!result.error) {
          setShowClassModal(false);
          setIsEditMode(false);
          setEditingClassId(null);
          setNewClass({ name: "", numericValue: "" });
        }
      } else {
        const result = await dispatch(createClass(newClass));
        if (!result.error) {
          setShowClassModal(false);
          setNewClass({ name: "", numericValue: "" });
        }
      }
    } catch (error) {
      console.error("Operation failed:", error);
    }
  };

  const handleEditClass = (cls) => {
    setIsEditMode(true);
    setEditingClassId(cls.id);
    setNewClass({
      name: cls.name,
      numericValue: cls.numeric_value,
    });
    setShowClassModal(true);
  };

  const handleDeleteClass = async (id) => {
    if (
      window.confirm(
        "Are you sure you want to delete this class? This action cannot be undone.",
      )
    ) {
      const result = await dispatch(deleteClass(id));
      if (!result.error) {
        if (selectedClassId === id) setSelectedClassId(null);
      } else {
        alert(
          result.error.message ||
            "Failed to delete class. Please ensure it has no students or sections.",
        );
      }
    }
  };

  const handleCreateSection = async (e) => {
    e.preventDefault();
    const result = await dispatch(
      createSection({ ...newSection, classId: selectedClassId }),
    );
    if (!result.error) {
      setShowSectionModal(false);
      setNewSection({ name: "", capacity: 40 });
    }
  };

  if (loading && classes.length === 0) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          background: "#f8fafc",
        }}>
        <div
          className="spinner"
          style={{
            width: "40px",
            height: "40px",
            border: "4px solid #e2e8f0",
            borderTopColor: "#4f46e5",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
          }}></div>
      </div>
    );
  }

  return (
    <div style={{ background: "#f8fafc", minHeight: "100vh", padding: "2rem" }}>
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "3rem",
          }}>
          <div>
            <h2
              style={{
                fontSize: "2.25rem",
                fontWeight: 700,
                color: "#1e293b",
                margin: 0,
              }}>
              Academic Management
            </h2>
            <p
              style={{
                color: "#64748b",
                fontSize: "1rem",
                marginTop: "0.25rem",
              }}>
              Organize and manage school classes and sections
            </p>
          </div>
          <button
            onClick={() => {
              setIsEditMode(false);
              setNewClass({ name: "", numericValue: "" });
              setShowClassModal(true);
            }}
            style={{
              padding: "0.75rem 1.5rem",
              background: "#4f46e5",
              color: "#fff",
              border: "none",
              borderRadius: "0.75rem",
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              transition: "all 0.2s",
              boxShadow: "0 4px 6px -1px rgba(79, 70, 229, 0.2)",
            }}>
            <Plus size={20} /> Add New Class
          </button>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "350px 1fr",
            gap: "2rem",
          }}>
          {/* Class List Sidebar */}
          <div
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                padding: "0 0.5rem",
              }}>
              <Layers size={18} style={{ color: "#64748b" }} />
              <h3
                style={{
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  color: "#64748b",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  margin: 0,
                }}>
                All Classes
              </h3>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.75rem",
              }}>
              {classes.length > 0 ? (
                classes.map((cls) => (
                  <div
                    key={cls.id}
                    onClick={() => setSelectedClassId(cls.id)}
                    style={{
                      padding: "1.25rem",
                      background:
                        selectedClassId === cls.id ? "#fff" : "transparent",
                      borderRadius: "1rem",
                      border: "1px solid",
                      borderColor:
                        selectedClassId === cls.id ? "#e2e8f0" : "transparent",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      boxShadow:
                        selectedClassId === cls.id
                          ? "0 10px 15px -3px rgba(0, 0, 0, 0.05)"
                          : "none",
                    }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "1rem",
                      }}>
                      <div
                        style={{
                          width: "2.5rem",
                          height: "2.5rem",
                          background:
                            selectedClassId === cls.id ? "#eef2ff" : "#fff",
                          borderRadius: "0.75rem",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "1rem",
                          fontWeight: 700,
                          color:
                            selectedClassId === cls.id ? "#4f46e5" : "#64748b",
                          border: "1px solid #e2e8f0",
                        }}>
                        {cls.numeric_value}
                      </div>
                      <div>
                        <h4
                          style={{
                            margin: 0,
                            fontSize: "1rem",
                            fontWeight: 600,
                            color: "#1e293b",
                          }}>
                          {cls.name}
                        </h4>
                        <p
                          style={{
                            margin: 0,
                            fontSize: "0.75rem",
                            color: "#64748b",
                          }}>
                          Class {cls.numeric_value} • Fees managed in Settings
                        </p>
                      </div>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                      }}>
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditClass(cls);
                        }}
                        style={{
                          padding: "0.5rem",
                          borderRadius: "0.5rem",
                          color: "#64748b",
                          cursor: "pointer",
                          transition: "background 0.2s",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.background = "#f1f5f9")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.background = "transparent")
                        }>
                        <Edit3 size={16} />
                      </div>
                      <ArrowRight
                        size={18}
                        style={{
                          color:
                            selectedClassId === cls.id ? "#4f46e5" : "#e2e8f0",
                        }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <div
                  style={{
                    textAlign: "center",
                    padding: "4rem 2rem",
                    background: "#fff",
                    borderRadius: "1.5rem",
                    border: "2px dashed #e2e8f0",
                  }}>
                  <Layers
                    size={32}
                    style={{ color: "#cbd5e1", marginBottom: "1rem" }}
                  />
                  <p
                    style={{
                      fontSize: "0.875rem",
                      color: "#64748b",
                      margin: 0,
                    }}>
                    No classes found
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Main Content Area */}
          <div
            style={{
              background: "#fff",
              borderRadius: "1.5rem",
              padding: "2.5rem",
              border: "1px solid #e2e8f0",
              minHeight: "600px",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
            }}>
            {selectedClassId ? (
              <>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: "2.5rem",
                    paddingBottom: "1.5rem",
                    borderBottom: "1px solid #f1f5f9",
                  }}>
                  <div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "1rem",
                        marginBottom: "0.5rem",
                      }}>
                      <h3
                        style={{
                          fontSize: "1.5rem",
                          fontWeight: 700,
                          color: "#1e293b",
                          margin: 0,
                        }}>
                        {classes.find((c) => c.id === selectedClassId)?.name}
                      </h3>
                      <span
                        style={{
                          padding: "0.25rem 0.75rem",
                          background: "#eef2ff",
                          color: "#4f46e5",
                          borderRadius: "2rem",
                          fontSize: "0.75rem",
                          fontWeight: 600,
                        }}>
                        Standard
                      </span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "1.5rem",
                        color: "#64748b",
                        fontSize: "0.875rem",
                      }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.4rem",
                        }}>
                        <Hash size={14} />
                        Numeric Value:{" "}
                        {
                          classes.find((c) => c.id === selectedClassId)
                            ?.numeric_value
                        }
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.4rem",
                        }}>
                        <Layers3 size={14} />
                        Sections:{" "}
                        {sectionsByClass[selectedClassId]?.length || 0}
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.4rem",
                        }}>
                        <IndianRupee size={14} />
                        <span
                          style={{ color: "#4f46e5", cursor: "pointer" }}
                          onClick={() => navigate("/settings")}>
                          Manage Fees in Settings →
                        </span>
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "0.75rem" }}>
                    <button
                      onClick={() =>
                        handleEditClass(
                          classes.find((c) => c.id === selectedClassId),
                        )
                      }
                      style={{
                        padding: "0.5rem 1rem",
                        background: "#fff",
                        color: "#1e293b",
                        border: "1px solid #e2e8f0",
                        borderRadius: "0.5rem",
                        fontSize: "0.875rem",
                        fontWeight: 600,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.4rem",
                      }}>
                      <Edit3 size={14} /> Edit Class
                    </button>
                    <button
                      onClick={() => handleDeleteClass(selectedClassId)}
                      style={{
                        padding: "0.5rem 1rem",
                        background: "#fff",
                        color: "#ef4444",
                        border: "1px solid #fee2e2",
                        borderRadius: "0.5rem",
                        fontSize: "0.875rem",
                        fontWeight: 600,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.4rem",
                      }}>
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: "1.5rem",
                  }}>
                  <h4
                    style={{
                      fontSize: "1.125rem",
                      fontWeight: 600,
                      color: "#1e293b",
                      margin: 0,
                    }}>
                    Sections
                  </h4>
                  <button
                    onClick={() => setShowSectionModal(true)}
                    style={{
                      color: "#4f46e5",
                      background: "transparent",
                      border: "none",
                      fontSize: "0.875rem",
                      fontWeight: 600,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.25rem",
                    }}>
                    <Plus size={16} /> Add Section
                  </button>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fill, minmax(300px, 1fr))",
                    gap: "1.25rem",
                  }}>
                  {sectionsByClass[selectedClassId]?.length > 0 ? (
                    sectionsByClass[selectedClassId].map((sec) => (
                      <div
                        key={sec.id}
                        style={{
                          padding: "1.5rem",
                          borderRadius: "1rem",
                          background: "#fff",
                          border: "1px solid #e2e8f0",
                          transition: "all 0.2s ease",
                          boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.borderColor = "#cbd5e1")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.borderColor = "#e2e8f0")
                        }>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            marginBottom: "1rem",
                          }}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "0.75rem",
                            }}>
                            <div
                              style={{
                                width: "2.5rem",
                                height: "2.5rem",
                                background: "#f8fafc",
                                borderRadius: "0.75rem",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "#1e293b",
                                fontWeight: 700,
                                border: "1px solid #f1f5f9",
                              }}>
                              {sec.name}
                            </div>
                            <div>
                              <h5
                                style={{
                                  margin: 0,
                                  fontSize: "1rem",
                                  fontWeight: 600,
                                  color: "#1e293b",
                                }}>
                                Section {sec.name}
                              </h5>
                              <p
                                style={{
                                  margin: 0,
                                  fontSize: "0.75rem",
                                  color: "#64748b",
                                }}>
                                Primary Section
                              </p>
                            </div>
                          </div>
                          <div style={{ color: "#94a3b8", cursor: "pointer" }}>
                            <Edit3 size={16} />
                          </div>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "1rem",
                            paddingTop: "1rem",
                            borderTop: "1px solid #f8fafc",
                          }}>
                          <div
                            style={{
                              fontSize: "0.875rem",
                              color: "#64748b",
                              display: "flex",
                              alignItems: "center",
                              gap: "0.4rem",
                            }}>
                            <BookOpen size={14} />
                            Capacity:{" "}
                            <span style={{ fontWeight: 600, color: "#1e293b" }}>
                              {sec.capacity}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div
                      style={{
                        gridColumn: "1 / -1",
                        textAlign: "center",
                        padding: "4rem 2rem",
                        background: "#f8fafc",
                        borderRadius: "1rem",
                        border: "1px dashed #cbd5e1",
                      }}>
                      <Layers3
                        size={32}
                        style={{ color: "#cbd5e1", marginBottom: "1rem" }}
                      />
                      <p
                        style={{
                          fontSize: "0.875rem",
                          color: "#64748b",
                          margin: 0,
                        }}>
                        No sections defined for this class
                      </p>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div
                style={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  textAlign: "center",
                  padding: "4rem",
                }}>
                <div
                  style={{
                    width: "4rem",
                    height: "4rem",
                    background: "#f1f5f9",
                    borderRadius: "1.25rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#94a3b8",
                    marginBottom: "1.5rem",
                  }}>
                  <Sliders size={32} />
                </div>
                <h3
                  style={{
                    fontSize: "1.25rem",
                    fontWeight: 600,
                    color: "#1e293b",
                    marginBottom: "0.5rem",
                  }}>
                  Select a class to view details
                </h3>
                <p
                  style={{
                    color: "#64748b",
                    maxWidth: "300px",
                    lineHeight: 1.6,
                    fontSize: "0.875rem",
                  }}>
                  Choose a class from the list on the left to manage its
                  sections and configuration.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Modals */}
        {showClassModal && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(15, 23, 42, 0.4)",
              backdropFilter: "blur(4px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
            }}>
            <div
              style={{
                background: "#fff",
                borderRadius: "1.25rem",
                padding: "2.5rem",
                width: "100%",
                maxWidth: "500px",
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
              }}>
              <div style={{ marginBottom: "2rem" }}>
                <h3
                  style={{
                    fontSize: "1.5rem",
                    fontWeight: 700,
                    color: "#1e293b",
                    margin: 0,
                  }}>
                  {isEditMode ? "Edit Class" : "Add New Class"}
                </h3>
                <p
                  style={{
                    color: "#64748b",
                    fontSize: "0.875rem",
                    marginTop: "0.25rem",
                  }}>
                  Define the basic parameters for this academic level.
                </p>
              </div>

              <form
                onSubmit={handleCreateClass}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1.5rem",
                }}>
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.875rem",
                      fontWeight: 600,
                      color: "#1e293b",
                      marginBottom: "0.5rem",
                    }}>
                    Class Name
                  </label>
                  <input
                    type="text"
                    value={newClass.name}
                    onChange={(e) =>
                      setNewClass({ ...newClass, name: e.target.value })
                    }
                    placeholder="e.g. Class 10, Nursery"
                    style={{
                      width: "100%",
                      padding: "0.75rem 1rem",
                      background: "#f8fafc",
                      border: "1px solid #e2e8f0",
                      borderRadius: "0.5rem",
                      fontSize: "1rem",
                      outline: "none",
                      transition: "border-color 0.2s",
                    }}
                    onFocus={(e) => (e.target.style.borderColor = "#4f46e5")}
                    onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
                    required
                  />
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "1rem",
                  }}>
                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: "0.875rem",
                        fontWeight: 600,
                        color: "#1e293b",
                        marginBottom: "0.5rem",
                      }}>
                      Numeric Value
                    </label>
                    <input
                      type="number"
                      value={newClass.numericValue}
                      onChange={(e) =>
                        setNewClass({
                          ...newClass,
                          numericValue: e.target.value,
                        })
                      }
                      placeholder="e.g. 10"
                      style={{
                        width: "100%",
                        padding: "0.75rem 1rem",
                        background: "#f8fafc",
                        border: "1px solid #e2e8f0",
                        borderRadius: "0.5rem",
                        fontSize: "1rem",
                        outline: "none",
                      }}
                      required
                    />
                  </div>
                </div>

                <div
                  style={{ display: "flex", gap: "1rem", marginTop: "1.5rem" }}>
                  <button
                    type="button"
                    onClick={() => setShowClassModal(false)}
                    style={{
                      flex: 1,
                      padding: "0.75rem",
                      background: "#f8fafc",
                      border: "1px solid #e2e8f0",
                      borderRadius: "0.5rem",
                      fontWeight: 600,
                      color: "#64748b",
                      cursor: "pointer",
                    }}>
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{
                      flex: 1,
                      padding: "0.75rem",
                      background: "#4f46e5",
                      color: "#fff",
                      border: "none",
                      borderRadius: "0.5rem",
                      fontWeight: 600,
                      cursor: "pointer",
                      boxShadow: "0 4px 6px -1px rgba(79, 70, 229, 0.2)",
                    }}>
                    {isEditMode ? "Update Class" : "Create Class"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showSectionModal && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(15, 23, 42, 0.4)",
              backdropFilter: "blur(4px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
            }}>
            <div
              style={{
                background: "#fff",
                borderRadius: "1.25rem",
                padding: "2.5rem",
                width: "100%",
                maxWidth: "400px",
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
              }}>
              <div style={{ marginBottom: "2rem" }}>
                <h3
                  style={{
                    fontSize: "1.25rem",
                    fontWeight: 700,
                    color: "#1e293b",
                    margin: 0,
                  }}>
                  Add New Section
                </h3>
                <p
                  style={{
                    color: "#64748b",
                    fontSize: "0.875rem",
                    marginTop: "0.25rem",
                  }}>
                  Add a new student cohort to this class.
                </p>
              </div>

              <form
                onSubmit={handleCreateSection}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1.5rem",
                }}>
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.875rem",
                      fontWeight: 600,
                      color: "#1e293b",
                      marginBottom: "0.5rem",
                    }}>
                    Section Name
                  </label>
                  <input
                    type="text"
                    value={newSection.name}
                    onChange={(e) =>
                      setNewSection({ ...newSection, name: e.target.value })
                    }
                    placeholder="e.g. A, B, Blue"
                    style={{
                      width: "100%",
                      padding: "0.75rem 1rem",
                      background: "#f8fafc",
                      border: "1px solid #e2e8f0",
                      borderRadius: "0.5rem",
                      fontSize: "1rem",
                      outline: "none",
                    }}
                    required
                  />
                </div>
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.875rem",
                      fontWeight: 600,
                      color: "#1e293b",
                      marginBottom: "0.5rem",
                    }}>
                    Max Capacity
                  </label>
                  <input
                    type="number"
                    value={newSection.capacity}
                    onChange={(e) =>
                      setNewSection({ ...newSection, capacity: e.target.value })
                    }
                    placeholder="40"
                    style={{
                      width: "100%",
                      padding: "0.75rem 1rem",
                      background: "#f8fafc",
                      border: "1px solid #e2e8f0",
                      borderRadius: "0.5rem",
                      fontSize: "1rem",
                      outline: "none",
                    }}
                    required
                  />
                </div>

                <div
                  style={{ display: "flex", gap: "1rem", marginTop: "1.5rem" }}>
                  <button
                    type="button"
                    onClick={() => setShowSectionModal(false)}
                    style={{
                      flex: 1,
                      padding: "0.75rem",
                      background: "#f8fafc",
                      border: "1px solid #e2e8f0",
                      borderRadius: "0.5rem",
                      fontWeight: 600,
                      color: "#64748b",
                      cursor: "pointer",
                    }}>
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{
                      flex: 1,
                      padding: "0.75rem",
                      background: "#0f172a",
                      color: "#fff",
                      border: "none",
                      borderRadius: "0.5rem",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}>
                    Create Section
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Academic;
