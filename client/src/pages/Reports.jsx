import React, { useState, useEffect } from 'react';
import { attendanceAPI, employeeAPI, departmentAPI } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { BarChart3, Download, Calendar, FileText, TrendingUp, Clock } from 'lucide-react';

export const Reports = () => {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [reportParams, setReportParams] = useState({
    employee_id: 'all',
    department: 'all',
    year: new Date().getFullYear().toString(),
    month: (new Date().getMonth() + 1).toString().padStart(2, '0'),
    report_type: 'monthly'
  });
  const [summary, setSummary] = useState({
    totalDays: 0,
    presentDays: 0,
    absentDays: 0,
    avgWorkingHours: 0,
    attendanceRate: 0
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [employeesRes, departmentsRes] = await Promise.all([
        employeeAPI.getAll(),
        departmentAPI.getAll()
      ]);
      setEmployees(employeesRes.data.data || []);
      setDepartments(departmentsRes.data.data || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch data');
      toast({
        title: 'Error',
        description: err.message || 'Failed to fetch data',
        variant: 'destructive',
      });
    }
  };

  const generateReport = async () => {
    if (!reportParams.employee_id && !reportParams.department) {
      toast({
        title: 'Error',
        description: 'Please select either an employee or department',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);
      setError(null);

      if (reportParams.employee_id && reportParams.employee_id !== 'all') {
        // Generate individual employee report
        const response = await attendanceAPI.getReport(
          reportParams.employee_id,
          reportParams.year,
          reportParams.month
        );
        const reportData = response.data.data;
        setReportData([reportData]);
        calculateSummary([reportData]);
      } else if (reportParams.department !== 'all') {
        // Generate department report - fetch all employees in department
        const deptEmployees = employees.filter(
          emp => (emp.department?._id || emp.department || '').toString() === reportParams.department
        );

        const reportPromises = deptEmployees.map(employee =>
          attendanceAPI.getReport(
            employee._id || employee.id,
            reportParams.year,
            reportParams.month
          )
            .then(response => ({
              ...response.data.data,
              employee_name: employee.name,
              employee_id: employee._id || employee.id
            }))
            .catch(err => ({
              employee_name: employee.name,
              employee_id: employee._id || employee.id,
              details: [],
              totalDays: 0,
              presentDays: 0,
              absentDays: 0,
              halfDays: 0,
              totalHoursWorked: 0
            }))
        );

        const reports = await Promise.all(reportPromises);
        setReportData(reports);
        calculateSummary(reports);
      }
    } catch (err) {
      setError('Failed to generate report');
      toast({
        title: 'Error',
        description: 'Failed to generate report',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateSummary = (data) => {
    const totalEmployees = data.length;
    let totalDays = 0;
    let totalPresentDays = 0;
    let totalAbsentDays = 0;
    let totalWorkingHours = 0;

    data.forEach(report => {
      if (report.summary) {
        totalDays += report.summary.total_days || 0;
        totalPresentDays += report.summary.present_days || 0;
        totalAbsentDays += report.summary.absent_days || 0;
        totalWorkingHours += parseFloat(report.summary.avg_working_hours || 0);
      }
    });

    const attendanceRate = totalDays > 0 ? (totalPresentDays / totalDays * 100) : 0;
    const avgWorkingHours = totalEmployees > 0 ? (totalWorkingHours / totalEmployees) : 0;

    setSummary({
      totalDays,
      presentDays: totalPresentDays,
      absentDays: totalAbsentDays,
      avgWorkingHours,
      attendanceRate
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return '-';
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const calculateWorkingHours = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return '-';

    const checkInTime = new Date(`2000-01-01T${checkIn}`);
    const checkOutTime = new Date(`2000-01-01T${checkOut}`);
    const diffMs = checkOutTime - checkInTime;
    const diffHours = diffMs / (1000 * 60 * 60);

    return `${diffHours.toFixed(1)}h`;
  };

  const getStatusBadge = (record) => {
    if (record.check_in && record.check_out) {
      return <Badge className="bg-green-100 text-green-800">Present</Badge>;
    } else if (record.check_in && !record.check_out) {
      return <Badge className="bg-yellow-100 text-yellow-800">Partial</Badge>;
    } else {
      return <Badge variant="destructive">Absent</Badge>;
    }
  };

  const getEmployeeName = (employeeId) => {
    const employee = employees.find(e => e.id === employeeId);
    return employee ? employee.name : 'Unknown Employee';
  };

  const getDepartmentName = (departmentId) => {
    const department = departments.find(d => d.id === departmentId);
    return department ? department.name : 'Unknown Department';
  };

  const exportToCSV = () => {
    if (reportData.length === 0) {
      toast({
        title: 'Error',
        description: 'No data to export',
        variant: 'destructive',
      });
      return;
    }

    const csvContent = [];
    csvContent.push(['Employee', 'Date', 'Check In', 'Check Out', 'Working Hours', 'Status']);

    reportData.forEach(report => {
      const employeeName = report.employee_name || getEmployeeName(report.employee_id);
      if (report.records && report.records.length > 0) {
        report.records.forEach(record => {
          csvContent.push([
            employeeName,
            new Date(record.date).toLocaleDateString(),
            formatTime(record.check_in),
            formatTime(record.check_out),
            calculateWorkingHours(record.check_in, record.check_out),
            record.check_in && record.check_out ? 'Present' : record.check_in ? 'Partial' : 'Absent'
          ]);
        });
      }
    });

    const csvString = csvContent.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance-report-${reportParams.year}-${reportParams.month}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: 'Success',
      description: 'Report exported successfully',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <BarChart3 className="h-8 w-8" />
            Attendance Reports
          </h1>
          <p className="text-gray-600 mt-1">Generate comprehensive attendance reports</p>
        </div>
      </div>

      {/* Report Parameters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Report Parameters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div>
              <Label htmlFor="employee">Employee</Label>
              <Select
                value={reportParams.employee_id}
                onValueChange={(value) => setReportParams({
                  ...reportParams,
                  employee_id: value,
                  department: value ? '' : reportParams.department
                })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All employees</SelectItem>
                  {employees.map((employee) => (
                    <SelectItem key={employee._id || employee.id} value={(employee._id || employee.id || '').toString()}>
                      {employee.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="department">Department</Label>
              <Select
                value={reportParams.department}
                onValueChange={(value) => setReportParams({
                  ...reportParams,
                  department: value,
                  employee_id: value ? '' : reportParams.employee_id
                })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All departments</SelectItem>
                  {departments.map((department) => (
                    <SelectItem key={department._id || department.id} value={(department._id || department.id || '').toString()}>
                      {department.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="year">Year</Label>
              <Select
                value={reportParams.year}
                onValueChange={(value) => setReportParams({ ...reportParams, year: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 5 }, (_, i) => {
                    const year = new Date().getFullYear() - i;
                    return (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="month">Month</Label>
              <Select
                value={reportParams.month}
                onValueChange={(value) => setReportParams({ ...reportParams, month: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, i) => {
                    const month = i + 1;
                    const monthName = new Date(2000, i, 1).toLocaleString('en-US', { month: 'long' });
                    return (
                      <SelectItem key={month} value={month.toString().padStart(2, '0')}>
                        {monthName}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button onClick={generateReport} disabled={loading} className="w-full">
                {loading ? 'Generating...' : 'Generate Report'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {reportData.length > 0 && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Days</p>
                    <p className="text-2xl font-bold">{summary.totalDays}</p>
                  </div>
                  <Calendar className="h-8 w-8 text-gray-400" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Present Days</p>
                    <p className="text-2xl font-bold text-green-600">{summary.presentDays}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Attendance Rate</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {summary.attendanceRate.toFixed(1)}%
                    </p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Avg Working Hours</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {summary.avgWorkingHours.toFixed(1)}h
                    </p>
                  </div>
                  <Clock className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Report Table */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Attendance Details</CardTitle>
              <Button onClick={exportToCSV} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Check In</TableHead>
                      <TableHead>Check Out</TableHead>
                      <TableHead>Working Hours</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reportData.map((report) => {
                      const employeeName = report.employee_name || getEmployeeName(report.employee_id);

                      if (!report.records || report.records.length === 0) {
                        return (
                          <TableRow key={`${report.employee_id}-no-records`}>
                            <TableCell className="font-medium">{employeeName}</TableCell>
                            <TableCell colSpan={5} className="text-center text-gray-500">
                              No attendance records found
                            </TableCell>
                          </TableRow>
                        );
                      }

                      return report.records.map((record, index) => (
                        <TableRow key={`${report.employee_id}-${record.date}-${index}`}>
                          <TableCell className="font-medium">{employeeName}</TableCell>
                          <TableCell>
                            {new Date(record.date).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </TableCell>
                          <TableCell>{formatTime(record.check_in)}</TableCell>
                          <TableCell>{formatTime(record.check_out)}</TableCell>
                          <TableCell>
                            {calculateWorkingHours(record.check_in, record.check_out)}
                          </TableCell>
                          <TableCell>{getStatusBadge(record)}</TableCell>
                        </TableRow>
                      ));
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {reportData.length === 0 && !loading && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <BarChart3 className="h-16 w-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg">No report generated</p>
              <p className="text-sm text-gray-400">
                Select report parameters and click "Generate Report" to view attendance data
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {loading && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center h-32">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                <p className="mt-2 text-gray-600">Generating report...</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

