import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { FileText, Download, Clock, Calendar, TrendingUp } from 'lucide-react';
import { attendanceAPI, employeeAPI, departmentAPI, designationAPI } from '../services/api';
import { Employee, Department, Designation, MonthlyReport } from '../types';

export default function Reports() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [designations, setDesignations] = useState<Designation[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [selectedDesignation, setSelectedDesignation] = useState<string>('all');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [report, setReport] = useState<MonthlyReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedEmployee) {
      fetchReport();
    }
  }, [selectedEmployee, selectedMonth, selectedYear]);

  const fetchData = async () => {
    try {
      const [empRes, deptRes, desRes] = await Promise.all([
        employeeAPI.getAll(),
        departmentAPI.getAll(),
        designationAPI.getAll(),
      ]);
      setEmployees(empRes.data.data);
      setDepartments(deptRes.data.data);
      setDesignations(desRes.data.data);
      if (empRes.data.data.length > 0) {
        setSelectedEmployee(empRes.data.data[0]._id);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReport = async () => {
    try {
      const response = await attendanceAPI.getMonthlyReport(
        selectedEmployee,
        selectedYear,
        selectedMonth
      );
      setReport(response.data.data);
    } catch (error) {
      console.error('Error fetching report:', error);
    }
  };

  const getFilteredEmployees = () => {
    return employees.filter((emp) => {
      if (selectedDepartment !== 'all') {
        const deptId = typeof emp.department === 'object' ? emp.department._id : emp.department;
        if (deptId !== selectedDepartment) return false;
      }
      if (selectedDesignation !== 'all') {
        const desId = typeof emp.designation === 'object' ? emp.designation._id : emp.designation;
        if (desId !== selectedDesignation) return false;
      }
      return true;
    });
  };

  const exportToCSV = () => {
    if (!report) return;

    const csvContent = [
      ['Employee Report'],
      [`Employee: ${report.employee.name}`],
      [`Month: ${report.month}`],
      [''],
      ['Summary'],
      [`Total Days: ${report.totalDays}`],
      [`Present Days: ${report.presentDays}`],
      [`Absent Days: ${report.absentDays}`],
      [`Half Days: ${report.halfDays}`],
      [`Late Days: ${report.lateDays}`],
      [`Total Hours Worked: ${report.totalHoursWorked.toFixed(2)}`],
      [`Total Late Minutes: ${report.totalLateMinutes}`],
      [''],
      ['Daily Attendance Details'],
      ['Date', 'Status', 'Check In', 'Check Out', 'Total Hours', 'Late Minutes'],
      ...report.details.map((d) => [
        new Date(d.date).toLocaleDateString(),
        d.status,
        d.checkInTime ? new Date(d.checkInTime).toLocaleTimeString() : '',
        d.checkOutTime ? new Date(d.checkOutTime).toLocaleTimeString() : '',
        d.totalHours.toFixed(2),
        d.lateMinutes.toString(),
      ]),
    ];

    const csv = csvContent.map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance_report_${report.employee.name}_${report.month}.csv`;
    a.click();
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  const filteredEmployees = getFilteredEmployees();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Reports</h1>
        {report && (
          <Button onClick={exportToCSV} className="bg-gold-500 hover:bg-gold-600">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Report Filters</CardTitle>
          <CardDescription>Select filters to generate employee reports</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
              <SelectTrigger>
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept._id} value={dept._id}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedDesignation} onValueChange={setSelectedDesignation}>
              <SelectTrigger>
                <SelectValue placeholder="Designation" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Designations</SelectItem>
                {designations.map((des) => (
                  <SelectItem key={des._id} value={des._id}>
                    {des.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
              <SelectTrigger>
                <SelectValue placeholder="Employee" />
              </SelectTrigger>
              <SelectContent>
                {filteredEmployees.map((emp) => (
                  <SelectItem key={emp._id} value={emp._id}>
                    {emp.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={selectedMonth.toString()}
              onValueChange={(value) => setSelectedMonth(parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Month" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                  <SelectItem key={month} value={month.toString()}>
                    {new Date(2024, month - 1, 1).toLocaleString('default', { month: 'long' })}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={selectedYear.toString()}
              onValueChange={(value) => setSelectedYear(parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                {[2023, 2024, 2025].map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {report && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Present Days</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{report.presentDays}</div>
                <p className="text-xs text-muted-foreground">
                  out of {report.totalDays} working days
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{report.totalHoursWorked.toFixed(1)}</div>
                <p className="text-xs text-muted-foreground">hours worked this month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Late Arrivals</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{report.lateDays}</div>
                <p className="text-xs text-muted-foreground">
                  {report.totalLateMinutes} minutes late total
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Math.round((report.presentDays / report.totalDays) * 100)}%
                </div>
                <p className="text-xs text-muted-foreground">monthly attendance</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Monthly Attendance Details</CardTitle>
              <CardDescription>
                Detailed attendance records for {report.employee.name} - {report.month}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Date</th>
                      <th className="text-left p-2">Status</th>
                      <th className="text-left p-2">Check In</th>
                      <th className="text-left p-2">Check Out</th>
                      <th className="text-left p-2">Total Hours</th>
                      <th className="text-left p-2">Late By</th>
                      <th className="text-left p-2">Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.details.map((detail) => (
                      <tr key={detail._id} className="border-b hover:bg-gray-50">
                        <td className="p-2">
                          {new Date(detail.date).toLocaleDateString()}
                        </td>
                        <td className="p-2">
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${
                              detail.status === 'Present'
                                ? 'bg-green-100 text-green-800'
                                : detail.status === 'Absent'
                                ? 'bg-red-100 text-red-800'
                                : detail.status === 'Half Day'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {detail.status}
                          </span>
                        </td>
                        <td className="p-2">
                          {detail.checkInTime
                            ? new Date(detail.checkInTime).toLocaleTimeString()
                            : '-'}
                        </td>
                        <td className="p-2">
                          {detail.checkOutTime
                            ? new Date(detail.checkOutTime).toLocaleTimeString()
                            : '-'}
                        </td>
                        <td className="p-2">{detail.totalHours.toFixed(2)} hrs</td>
                        <td className="p-2">
                          {detail.lateMinutes > 0 ? `${detail.lateMinutes} min` : '-'}
                        </td>
                        <td className="p-2">{detail.remarks || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}