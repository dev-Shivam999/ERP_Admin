import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Students from "./pages/Students";
import AddStudent from "./pages/AddStudent";
import Fees from "./pages/Fees";
import RecordPayment from "./pages/RecordPayment";
import StudentFeeDetails from "./pages/StudentFeeDetails";
import Attendance from "./pages/Attendance";
import Teachers from "./pages/Teachers";
import AddTeacher from "./pages/AddTeacher";
import EditTeacher from "./pages/EditTeacher";
import Exams from "./pages/Exams";
import AddExam from "./pages/AddExam";
import EditExam from "./pages/EditExam";
import Results from "./pages/Results";
import MarkEntry from "./pages/MarkEntry";
import ViewResults from "./pages/ViewResults";
import Calendar from "./pages/Calendar";
import Settings from "./pages/Settings";
import Academic from "./pages/Academic";
import CollectionDetail from "./pages/CollectionDetail";
import Homework from "./pages/Homework";
import Payroll from "./pages/Payroll";
import Certificates from "./pages/Certificates";
import AdmitCardManager from "./pages/AdmitCardManager";
import { Toaster } from "react-hot-toast";
import "./index.css";

// Protected Route wrapper using Redux
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useSelector((state) => state.auth);

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          fontSize: "1.25rem",
          color: "#6b7280",
        }}>
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Page wrapper to pass title to Layout
const PageWrapper = ({ title, children }) => {
  return <Layout title={title}>{children}</Layout>;
};

function AppRoutes() {
  const { isAuthenticated } = useSelector((state) => state.auth);

  return (
    <Routes>
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/" replace /> : <Login />}
      />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <PageWrapper title="Dashboard">
              <Dashboard />
            </PageWrapper>
          </ProtectedRoute>
        }
      />

      <Route
        path="/students"
        element={
          <ProtectedRoute>
            <PageWrapper title="Student Management">
              <Students />
            </PageWrapper>
          </ProtectedRoute>
        }
      />

      <Route
        path="/students/add"
        element={
          <ProtectedRoute>
            <PageWrapper title="Add Student">
              <AddStudent />
            </PageWrapper>
          </ProtectedRoute>
        }
      />

      <Route
        path="/students/edit/:id"
        element={
          <ProtectedRoute>
            <PageWrapper title="Edit Student">
              <AddStudent />
            </PageWrapper>
          </ProtectedRoute>
        }
      />

      <Route
        path="/fees"
        element={
          <ProtectedRoute>
            <PageWrapper title="Fee Collection">
              <Fees />
            </PageWrapper>
          </ProtectedRoute>
        }
      />

      <Route
        path="/fees/record-payment"
        element={
          <ProtectedRoute>
            <PageWrapper title="Record Payment">
              <RecordPayment />
            </PageWrapper>
          </ProtectedRoute>
        }
      />

      <Route
        path="/fees/student/:id"
        element={
          <ProtectedRoute>
            <PageWrapper title="Student Fee Details">
              <StudentFeeDetails />
            </PageWrapper>
          </ProtectedRoute>
        }
      />

      <Route
        path="/fees/details/:type"
        element={
          <ProtectedRoute>
            <PageWrapper title="Collections Detail">
              <CollectionDetail />
            </PageWrapper>
          </ProtectedRoute>
        }
      />

      <Route
        path="/attendance"
        element={
          <ProtectedRoute>
            <PageWrapper title="Attendance">
              <Attendance />
            </PageWrapper>
          </ProtectedRoute>
        }
      />

      <Route
        path="/exams"
        element={
          <ProtectedRoute>
            <PageWrapper title="Exams & Results">
              <Exams />
            </PageWrapper>
          </ProtectedRoute>
        }
      />

      <Route
        path="/exams/add"
        element={
          <ProtectedRoute>
            <PageWrapper title="Create Exam">
              <AddExam />
            </PageWrapper>
          </ProtectedRoute>
        }
      />

      <Route
        path="/exams/edit/:id"
        element={
          <ProtectedRoute>
            <PageWrapper title="Edit Exam">
              <EditExam />
            </PageWrapper>
          </ProtectedRoute>
        }
      />

      <Route
        path="/exams/admit-cards"
        element={
          <ProtectedRoute>
            <PageWrapper title="Admit Cards">
              <AdmitCardManager />
            </PageWrapper>
          </ProtectedRoute>
        }
      />

      <Route
        path="/results"
        element={
          <ProtectedRoute>
            <PageWrapper title="Results Management">
              <Results />
            </PageWrapper>
          </ProtectedRoute>
        }
      />

      <Route
        path="/results/sessions/:sessionId/marks"
        element={
          <ProtectedRoute>
            <PageWrapper title="Mark Entry">
              <MarkEntry />
            </PageWrapper>
          </ProtectedRoute>
        }
      />

      <Route
        path="/results/sessions/:sessionId/view"
        element={
          <ProtectedRoute>
            <PageWrapper title="View Results">
              <ViewResults />
            </PageWrapper>
          </ProtectedRoute>
        }
      />

      <Route
        path="/teachers"
        element={
          <ProtectedRoute>
            <PageWrapper title="Teachers">
              <Teachers />
            </PageWrapper>
          </ProtectedRoute>
        }
      />

      <Route
        path="/teachers/add"
        element={
          <ProtectedRoute>
            <PageWrapper title="Add Teacher">
              <AddTeacher />
            </PageWrapper>
          </ProtectedRoute>
        }
      />

      <Route
        path="/teachers/edit/:id"
        element={
          <ProtectedRoute>
            <PageWrapper title="Edit Teacher">
              <EditTeacher />
            </PageWrapper>
          </ProtectedRoute>
        }
      />

      <Route
        path="/payroll"
        element={
          <ProtectedRoute>
            <PageWrapper title="Payroll Management">
              <Payroll />
            </PageWrapper>
          </ProtectedRoute>
        }
      />

      <Route
        path="/academic"
        element={
          <ProtectedRoute>
            <PageWrapper title="Academic Architecture">
              <Academic />
            </PageWrapper>
          </ProtectedRoute>
        }
      />

      <Route
        path="/calendar"
        element={
          <ProtectedRoute>
            <PageWrapper title="Calendar">
              <Calendar />
            </PageWrapper>
          </ProtectedRoute>
        }
      />

      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <PageWrapper title="Settings">
              <Settings />
            </PageWrapper>
          </ProtectedRoute>
        }
      />
      <Route
        path="/homework"
        element={
          <ProtectedRoute>
            <PageWrapper title="Homework Management">
              <Homework />
            </PageWrapper>
          </ProtectedRoute>
        }
      />
      <Route
        path="/certificates"
        element={
          <ProtectedRoute>
            <PageWrapper title="Certificate Management">
              <Certificates />
            </PageWrapper>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
