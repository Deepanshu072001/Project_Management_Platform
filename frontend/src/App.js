import React from "react";
import { Routes, Route } from "react-router-dom";
import "../src/App.css";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Projects from "./pages/Projects";
import ProjectDetails from "./pages/ProjectDetails";
import AdminDashboard from "./pages/AdminDashboard";
import Analytics from "./pages/Analytics";
import AnalyticsTasks from "./pages/AnalyticsTasks";
import VerifyEmail from "./pages/VerifyEmail";
import ResendVerification from "./pages/ResendVerification";
import NotesPage from "./pages/NotesPage";
import "./App.css";
import ProtectedRoute from "./components/ProtectedRoute";
import MainLayout from "./layout/MainLayout";

export default function App({ mode, setMode }) {
  return (
    <Routes>

      {/* Public */}
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />

      {/* Dashboard */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <MainLayout mode={mode} setMode={setMode}>
              <Dashboard />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* Profile */}
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <MainLayout mode={mode} setMode={setMode}>
              <Profile />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* Projects */}
      <Route
        path="/projects"
        element={
          <ProtectedRoute>
            <MainLayout mode={mode} setMode={setMode}>
              <Projects />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/projects/:projectId"
        element={
          <ProtectedRoute>
            <MainLayout mode={mode} setMode={setMode}>
              <ProjectDetails />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
      path="/projects/:projectId/notes"
      element={
        <ProtectedRoute>
          <MainLayout mode={mode} setMode={setMode}>
            <NotesPage />
          </MainLayout>
        </ProtectedRoute>
  }
/>


      {/* Admin */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <MainLayout mode={mode} setMode={setMode}>
              <AdminDashboard />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* Analytics */}
      <Route
        path="/analytics"
        element={
          <ProtectedRoute>
            <MainLayout mode={mode} setMode={setMode}>
              <Analytics />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/analytics/tasks"
        element={
          <ProtectedRoute>
            <MainLayout mode={mode} setMode={setMode}>
              <AnalyticsTasks />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* Email */}
      <Route path="/verify-email/:token" element={<VerifyEmail />} />
      <Route path="/resend-verification" element={<ResendVerification />} />

      {/* Default */}
      <Route path="*" element={<Login />} />
    </Routes>
  );
}
