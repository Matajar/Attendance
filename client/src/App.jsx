import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Dashboard } from '@/pages/Dashboard';
import { Employees } from '@/pages/Employees';
import { Departments } from '@/pages/Departments';
import { Designations } from '@/pages/Designations';
import { Attendance } from '@/pages/Attendance';
import { MarkAttendance } from '@/pages/MarkAttendance';
import { Reports } from '@/pages/Reports';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="employees" element={<Employees />} />
          <Route path="departments" element={<Departments />} />
          <Route path="designations" element={<Designations />} />
          <Route path="attendance" element={<Attendance />} />
          <Route path="mark-attendance" element={<MarkAttendance />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<div className="text-2xl">Settings Page (Coming Soon)</div>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App
