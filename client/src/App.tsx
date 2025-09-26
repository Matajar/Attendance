import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Users, Calendar, FileText, LayoutDashboard, Building, Briefcase } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import EmployeeManagement from './pages/EmployeeManagement';
import DepartmentManagement from './pages/DepartmentManagement';
import DesignationManagement from './pages/DesignationManagement';
import AttendanceCalendar from './pages/AttendanceCalendar';
import Reports from './pages/Reports';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-black text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <h1 className="text-xl font-bold text-gold-500">Attendance System</h1>
                <div className="ml-10 flex items-baseline space-x-4">
                  <Link to="/" className="hover:bg-gray-800 px-3 py-2 rounded-md text-sm font-medium flex items-center">
                    <LayoutDashboard className="w-4 h-4 mr-2" />
                    Dashboard
                  </Link>
                  <Link to="/employees" className="hover:bg-gray-800 px-3 py-2 rounded-md text-sm font-medium flex items-center">
                    <Users className="w-4 h-4 mr-2" />
                    Employees
                  </Link>
                  <Link to="/departments" className="hover:bg-gray-800 px-3 py-2 rounded-md text-sm font-medium flex items-center">
                    <Building className="w-4 h-4 mr-2" />
                    Departments
                  </Link>
                  <Link to="/designations" className="hover:bg-gray-800 px-3 py-2 rounded-md text-sm font-medium flex items-center">
                    <Briefcase className="w-4 h-4 mr-2" />
                    Designations
                  </Link>
                  <Link to="/attendance" className="hover:bg-gray-800 px-3 py-2 rounded-md text-sm font-medium flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    Attendance
                  </Link>
                  <Link to="/reports" className="hover:bg-gray-800 px-3 py-2 rounded-md text-sm font-medium flex items-center">
                    <FileText className="w-4 h-4 mr-2" />
                    Reports
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/employees" element={<EmployeeManagement />} />
            <Route path="/departments" element={<DepartmentManagement />} />
            <Route path="/designations" element={<DesignationManagement />} />
            <Route path="/attendance" element={<AttendanceCalendar />} />
            <Route path="/reports" element={<Reports />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;