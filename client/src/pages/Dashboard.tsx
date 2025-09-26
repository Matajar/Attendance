import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Users, UserX, Clock, TrendingDown } from 'lucide-react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { attendanceAPI } from '../services/api';
import { DashboardStats } from '../types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await attendanceAPI.getDashboardStats();
      setStats(response.data.data);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getChartData = () => {
    if (!stats) return null;

    const dates = Object.keys(stats.weeklyStats).sort();
    const absentData = dates.map(date => stats.weeklyStats[date].absent);
    const presentData = dates.map(date => stats.weeklyStats[date].present);

    return {
      labels: dates.map(date => new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })),
      datasets: [
        {
          label: 'Absent',
          data: absentData,
          borderColor: 'rgb(239, 68, 68)',
          backgroundColor: 'rgba(239, 68, 68, 0.5)',
        },
        {
          label: 'Present',
          data: presentData,
          borderColor: 'rgb(34, 197, 94)',
          backgroundColor: 'rgba(34, 197, 94, 0.5)',
        },
      ],
    };
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  const chartData = getChartData();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Absentees</CardTitle>
            <UserX className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.todayAbsentees.length || 0}</div>
            <p className="text-xs text-muted-foreground">Employees absent today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Present</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.weeklyStats[new Date().toISOString().split('T')[0]]?.present || 0}
            </div>
            <p className="text-xs text-muted-foreground">Present today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Half Day</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.weeklyStats[new Date().toISOString().split('T')[0]]?.halfDay || 0}
            </div>
            <p className="text-xs text-muted-foreground">Half day today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats && stats.weeklyStats[new Date().toISOString().split('T')[0]]
                ? Math.round(
                    (stats.weeklyStats[new Date().toISOString().split('T')[0]].present /
                      (stats.weeklyStats[new Date().toISOString().split('T')[0]].present +
                        stats.weeklyStats[new Date().toISOString().split('T')[0]].absent)) *
                      100
                  ) || 0
                : 0}%
            </div>
            <p className="text-xs text-muted-foreground">Today's attendance rate</p>
          </CardContent>
        </Card>
      </div>

      {chartData && (
        <Card>
          <CardHeader>
            <CardTitle>Weekly Attendance Trends</CardTitle>
            <CardDescription>Attendance patterns over the last 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            <Line
              data={chartData}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'top' as const,
                  },
                  title: {
                    display: false,
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                  },
                },
              }}
            />
          </CardContent>
        </Card>
      )}

      {stats && stats.todayAbsentees.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Today's Absentees</CardTitle>
            <CardDescription>Employees who are absent today</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats.todayAbsentees.map((attendance) => {
                const employee = attendance.employee;
                if (typeof employee === 'object' && employee) {
                  return (
                    <div key={attendance._id} className="flex items-center justify-between p-2 border rounded">
                      <div>
                        <p className="font-medium">{employee.name}</p>
                        <p className="text-sm text-gray-500">
                          {typeof employee.department === 'object' ? employee.department.name : ''} -{' '}
                          {typeof employee.designation === 'object' ? employee.designation.name : ''}
                        </p>
                      </div>
                      <span className="text-red-500 text-sm font-medium">Absent</span>
                    </div>
                  );
                }
                return null;
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}