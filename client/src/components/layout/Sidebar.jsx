import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  Users,
  Building,
  Briefcase,
  Calendar,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  ClipboardList
} from 'lucide-react';
import { cn } from '@/lib/utils';

const menuItems = [
  {
    title: 'Dashboard',
    icon: Home,
    path: '/',
  },
  {
    title: 'Employees',
    icon: Users,
    path: '/employees',
  },
  {
    title: 'Departments',
    icon: Building,
    path: '/departments',
  },
  {
    title: 'Designations',
    icon: Briefcase,
    path: '/designations',
  },
  {
    title: 'Attendance',
    icon: ClipboardList,
    path: '/attendance',
  },
  {
    title: 'Mark Attendance',
    icon: Calendar,
    path: '/mark-attendance',
  },
  {
    title: 'Reports',
    icon: FileText,
    path: '/reports',
  },
  {
    title: 'Settings',
    icon: Settings,
    path: '/settings',
  },
];

export const Sidebar = ({ isCollapsed, setIsCollapsed }) => {
  const location = useLocation();

  return (
    <aside
      className={cn(
        "relative min-h-screen bg-gray-900 text-white transition-all duration-300 ease-in-out",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex h-16 items-center justify-between px-4 border-b border-gray-800">
        {!isCollapsed && (
          <h2 className="text-xl font-bold">Attendance</h2>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 rounded-lg hover:bg-gray-800 transition-colors"
        >
          {isCollapsed ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <ChevronLeft className="h-5 w-5" />
          )}
        </button>
      </div>

      <nav className="p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all",
                "hover:bg-gray-800",
                isActive && "bg-blue-600 hover:bg-blue-700",
                isCollapsed && "justify-center"
              )}
              title={isCollapsed ? item.title : undefined}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              {!isCollapsed && (
                <span className="font-medium">{item.title}</span>
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};