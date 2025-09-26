import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Building, Briefcase, UserCheck, UserX, Clock, TrendingUp, Database } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { attendanceAPI, employeeAPI, departmentAPI, designationAPI } from '@/services/api';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);

export const Dashboard = () => {
  const [stats, setStats] = useState({
    totalEmployees: 0,
    totalDepartments: 0,
    totalDesignations: 0,
    presentToday: 0,
    absentToday: 0,
    lateToday: 0,
    attendancePercentage: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const seedDatabase = async () => {
    try {
      setLoading(true);

      // Create departments
      const departments = [
        { name: 'Engineering', description: 'Software development team' },
        { name: 'Human Resources', description: 'HR and people operations' },
        { name: 'Sales', description: 'Sales and business development' },
        { name: 'Marketing', description: 'Marketing and communications' },
        { name: 'Finance', description: 'Finance and accounting' }
      ];

      const createdDepts = [];
      for (const dept of departments) {
        const res = await departmentAPI.create(dept);
        createdDepts.push(res.data.data);
      }

      // Create designations
      const designations = [
        { name: 'Junior Developer', description: 'Entry level developer' },
        { name: 'Senior Developer', description: 'Experienced developer' },
        { name: 'Team Lead', description: 'Team leadership role' },
        { name: 'Manager', description: 'Department manager' },
        { name: 'HR Executive', description: 'Human resources executive' },
        { name: 'Sales Executive', description: 'Sales representative' },
        { name: 'Marketing Specialist', description: 'Marketing professional' },
        { name: 'Accountant', description: 'Finance and accounting professional' }
      ];

      const createdDesigs = [];
      for (const desig of designations) {
        const res = await designationAPI.create(desig);
        createdDesigs.push(res.data.data);
      }

      // Create employees
      const employees = [
        { name: 'John Doe', email: 'john@company.com', phoneNumber: '1234567890', department: createdDepts[0]._id, designation: createdDesigs[1]._id },
        { name: 'Jane Smith', email: 'jane@company.com', phoneNumber: '1234567891', department: createdDepts[0]._id, designation: createdDesigs[0]._id },
        { name: 'Mike Johnson', email: 'mike@company.com', phoneNumber: '1234567892', department: createdDepts[0]._id, designation: createdDesigs[2]._id },
        { name: 'Sarah Williams', email: 'sarah@company.com', phoneNumber: '1234567893', department: createdDepts[1]._id, designation: createdDesigs[4]._id },
        { name: 'Tom Brown', email: 'tom@company.com', phoneNumber: '1234567894', department: createdDepts[2]._id, designation: createdDesigs[5]._id },
        { name: 'Lisa Davis', email: 'lisa@company.com', phoneNumber: '1234567895', department: createdDepts[3]._id, designation: createdDesigs[6]._id },
        { name: 'Chris Wilson', email: 'chris@company.com', phoneNumber: '1234567896', department: createdDepts[4]._id, designation: createdDesigs[7]._id },
        { name: 'Amy Taylor', email: 'amy@company.com', phoneNumber: '1234567897', department: createdDepts[0]._id, designation: createdDesigs[0]._id },
        { name: 'David Martinez', email: 'david@company.com', phoneNumber: '1234567898', department: createdDepts[2]._id, designation: createdDesigs[3]._id },
        { name: 'Emily Anderson', email: 'emily@company.com', phoneNumber: '1234567899', department: createdDepts[1]._id, designation: createdDesigs[3]._id }
      ];

      const createdEmps = [];
      for (const emp of employees) {
        const res = await employeeAPI.create(emp);
        createdEmps.push(res.data.data);
      }

      // Create some attendance records for today
      const today = new Date().toISOString().split('T')[0];
      const attendanceRecords = [
        { employee: createdEmps[0]._id, date: today, checkInTime: new Date().setHours(9, 0, 0, 0), checkOutTime: new Date().setHours(18, 0, 0, 0), status: 'Present' },
        { employee: createdEmps[1]._id, date: today, checkInTime: new Date().setHours(9, 15, 0, 0), checkOutTime: new Date().setHours(18, 30, 0, 0), status: 'Present', isLate: true, lateMinutes: 15 },
        { employee: createdEmps[2]._id, date: today, checkInTime: new Date().setHours(8, 45, 0, 0), checkOutTime: new Date().setHours(17, 45, 0, 0), status: 'Present' },
        { employee: createdEmps[3]._id, date: today, checkInTime: new Date().setHours(9, 30, 0, 0), status: 'Present', isLate: true, lateMinutes: 30 },
        { employee: createdEmps[4]._id, date: today, status: 'Absent' },
        { employee: createdEmps[5]._id, date: today, checkInTime: new Date().setHours(9, 0, 0, 0), checkOutTime: new Date().setHours(18, 15, 0, 0), status: 'Present' },
        { employee: createdEmps[6]._id, date: today, checkInTime: new Date().setHours(10, 0, 0, 0), status: 'Present', isLate: true, lateMinutes: 60 },
        { employee: createdEmps[7]._id, date: today, checkInTime: new Date().setHours(8, 30, 0, 0), checkOutTime: new Date().setHours(17, 30, 0, 0), status: 'Present' },
        { employee: createdEmps[8]._id, date: today, status: 'Leave' },
        { employee: createdEmps[9]._id, date: today, checkInTime: new Date().setHours(9, 0, 0, 0), checkOutTime: new Date().setHours(13, 0, 0, 0), status: 'Half Day' }
      ];

      for (const record of attendanceRecords) {
        await attendanceAPI.mark(record);
      }

      toast({
        title: 'Success',
        description: `Created ${departments.length} departments, ${designations.length} designations, ${employees.length} employees, and ${attendanceRecords.length} attendance records`,
      });

      // Refresh dashboard data
      await fetchDashboardData();
    } catch (error) {
      console.error('Failed to seed database:', error);
      toast({
        title: 'Error',
        description: 'Failed to seed database. Some data may already exist.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [employees, departments, designations, dashboard] = await Promise.all([
        employeeAPI.getAll(),
        departmentAPI.getAll(),
        designationAPI.getAll(),
        attendanceAPI.getDashboard(),
      ]);

      setStats({
        totalEmployees: employees.data?.length || 0,
        totalDepartments: departments.data?.length || 0,
        totalDesignations: designations.data?.length || 0,
        presentToday: dashboard.data?.presentToday || 0,
        absentToday: dashboard.data?.absentToday || 0,
        lateToday: dashboard.data?.lateToday || 0,
        attendancePercentage: dashboard.data?.attendancePercentage || 0,
      });
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const attendanceChartData = {
    labels: ['Present', 'Absent', 'Late'],
    datasets: [
      {
        data: [stats.presentToday, stats.absentToday, stats.lateToday],
        backgroundColor: ['#10b981', '#ef4444', '#f59e0b'],
        borderWidth: 0,
      },
    ],
  };

  const weeklyAttendanceData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Attendance',
        data: [85, 90, 88, 92, 87, 60, 0],
        backgroundColor: '#3b82f6',
      },
    ],
  };

  const statCards = [
    {
      title: 'Total Employees',
      value: stats.totalEmployees,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Departments',
      value: stats.totalDepartments,
      icon: Building,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'Designations',
      value: stats.totalDesignations,
      icon: Briefcase,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100',
    },
    {
      title: 'Present Today',
      value: stats.presentToday,
      icon: UserCheck,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Absent Today',
      value: stats.absentToday,
      icon: UserX,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
    },
    {
      title: 'Late Today',
      value: stats.lateToday,
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={seedDatabase}
            className="flex items-center gap-2"
          >
            <Database className="h-4 w-4" />
            Seed Demo Data
          </Button>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <TrendingUp className="h-4 w-4" />
            <span>Attendance Rate: {stats.attendancePercentage}%</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {card.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${card.bgColor}`}>
                  <Icon className={`h-4 w-4 ${card.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{card.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Today's Attendance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <Doughnut
                data={attendanceChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom',
                    },
                  },
                }}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Weekly Attendance Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <Bar
                data={weeklyAttendanceData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false,
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      max: 100,
                    },
                  },
                }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Attendance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                    E{i}
                  </div>
                  <div>
                    <p className="font-medium">Employee {i}</p>
                    <p className="text-sm text-gray-500">Department {i}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full">
                    Present
                  </span>
                  <span className="text-sm text-gray-500">9:00 AM</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
