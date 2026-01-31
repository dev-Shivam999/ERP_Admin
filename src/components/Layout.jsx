import { useState, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  IndianRupee,
  GraduationCap,
  BookOpen,
  Calendar,
  Settings,
  LogOut,
  School,
  Menu,
  X,
  Layers,
  BarChart3,
  FileText,
} from "lucide-react";
import { logout } from "../store/slices/authSlice";

const Layout = ({ title, children }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Close sidebar on route change (for mobile)
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const navItems = [
    { path: "/", icon: LayoutDashboard, label: "Dashboard" },
    { path: "/students", icon: Users, label: "Students" },
    { path: "/attendance", icon: CalendarCheck, label: "Attendance" },
    { path: "/homework", icon: BookOpen, label: "Homework" },
    { path: "/fees", icon: IndianRupee, label: "Fee Collection" },
    { path: "/exams", icon: BookOpen, label: "Exams & Results" },
    { path: "/exams/admit-cards", icon: FileText, label: "Admit Cards" },
    { path: "/results", icon: BarChart3, label: "Results Management" },
    { path: "/teachers", icon: GraduationCap, label: "Teachers" },
    { path: "/certificates", icon: FileText, label: "Certificate Requests" },
    { path: "/payroll", icon: IndianRupee, label: "Payroll" },
    { path: "/academic", icon: Layers, label: "Academic Architecture" },
    { path: "/calendar", icon: Calendar, label: "Calendar" },
    { path: "/settings", icon: Settings, label: "Settings" },
    { path: "/push-notifications", icon: Settings, label: "Push Notifications" },
  ];

  return (
    <div className="app-layout">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${isSidebarOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <h1>
            <School size={28} />
            School ERP
          </h1>
          <button
            className="mobile-close-btn"
            onClick={() => setIsSidebarOpen(false)}>
            <X size={24} />
          </button>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `nav-item ${isActive ? "active" : ""}`
              }
              end={item.path === "/"}>
              <item.icon size={20} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="nav-item logout-btn" onClick={handleLogout}>
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="top-bar">
          <div className="top-bar-left">
            <button
              className="menu-toggle"
              onClick={() => setIsSidebarOpen(true)}>
              <Menu size={24} />
            </button>
            <h2 className="page-title">{title}</h2>
          </div>

          <div className="user-menu">
            <div className="user-info">
              <p className="user-name">{user?.profile?.firstName || "Admin"}</p>
              <p className="user-role">{user?.role || "Administrator"}</p>
            </div>
            <div className="user-avatar">
              {(user?.profile?.firstName?.[0] || "A").toUpperCase()}
            </div>
          </div>
        </header>

        <div className="page-content">{children}</div>
      </main>
    </div>
  );
};

export default Layout;
