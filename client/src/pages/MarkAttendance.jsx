import React, { useState, useEffect } from 'react';
import { attendanceAPI, employeeAPI } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { Clock, UserCheck, LogIn, LogOut, Calendar, Search } from 'lucide-react';

export const MarkAttendance = () => {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [checkInTime, setCheckInTime] = useState('');
  const [checkOutTime, setCheckOutTime] = useState('');

  useEffect(() => {
    fetchEmployees();
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (selectedEmployee) {
      fetchTodayAttendance();
      // Set default time to current time when employee is selected
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const currentTimeStr = `${hours}:${minutes}`;

      // Only set check-in time if not already checked in
      if (!todayAttendance?.checkInTime && !checkInTime) {
        setCheckInTime(currentTimeStr);
      }
      // Only set check-out time if already checked in
      if (todayAttendance?.checkInTime && !todayAttendance?.checkOutTime && !checkOutTime) {
        setCheckOutTime(currentTimeStr);
      }
    } else {
      setTodayAttendance(null);
      setCheckInTime('');
      setCheckOutTime('');
    }
  }, [selectedEmployee]);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await employeeAPI.getAll();
      setEmployees(response.data.data || []);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to fetch employees');
      toast({
        title: 'Error',
        description: err.message || 'Failed to fetch employees',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchTodayAttendance = async () => {
    if (!selectedEmployee) return;

    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await attendanceAPI.getByDate(today);
      const attendanceData = response.data.data || [];
      const employeeAttendance = attendanceData.find(
        record => (record.employee?._id || record.employee?.id || record.employee || '').toString() === selectedEmployee
      );
      setTodayAttendance(employeeAttendance || null);
    } catch (err) {
      console.error('Failed to fetch today\'s attendance:', err);
    }
  };


  const handleMarkAttendance = async (type) => {
    if (!selectedEmployee) {
      toast({
        title: 'Error',
        description: 'Please select an employee',
        variant: 'destructive',
      });
      return;
    }

    // Check if time is selected
    const selectedTime = type === 'check_in' ? checkInTime : checkOutTime;
    if (!selectedTime) {
      toast({
        title: 'Error',
        description: `Please select a ${type === 'check_in' ? 'check-in' : 'check-out'} time`,
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);
      // Combine today's date with selected time to create ISO timestamp
      const today = new Date().toISOString().split('T')[0];
      const isoString = new Date(`${today}T${selectedTime}:00`).toISOString();

      // Use correct field names for backend
      const data = {
        employeeId: selectedEmployee, // Backend expects employeeId, not employee_id
        date: today,
        status: type === 'check_in' ? 'Present' : 'Present', // Always mark as present when checking in/out
        [type === 'check_in' ? 'checkInTime' : 'checkOutTime']: isoString
      };

      const response = await attendanceAPI.mark(data);

      toast({
        title: 'Success',
        description: response.data.message || `${type === 'check_in' ? 'Check-in' : 'Check-out'} recorded successfully`,
      });

      // Refresh today's attendance and clear the time input
      await fetchTodayAttendance();
      if (type === 'check_in') {
        setCheckInTime('');
      } else {
        setCheckOutTime('');
      }
    } catch (err) {
      toast({
        title: 'Error',
        description: err.message || `Failed to record ${type === 'check_in' ? 'check-in' : 'check-out'}`,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return '-';
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  const getSelectedEmployeeInfo = () => {
    const employee = employees.find(emp => (emp._id || emp.id || '').toString() === selectedEmployee);
    return employee;
  };

  const getAttendanceStatus = () => {
    if (!todayAttendance) return 'Not marked';
    if (todayAttendance?.checkInTime && todayAttendance?.checkOutTime) return 'Completed';
    if (todayAttendance?.checkInTime && !todayAttendance?.checkOutTime) return 'Checked in';
    return 'Not marked';
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case 'Checked in':
        return <Badge className="bg-yellow-100 text-yellow-800">Checked In</Badge>;
      default:
        return <Badge variant="outline">Not Marked</Badge>;
    }
  };

  const filteredEmployees = employees.filter(employee =>
    employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    employee.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const canCheckIn = !todayAttendance?.checkInTime;
  const canCheckOut = todayAttendance?.checkInTime && !todayAttendance?.checkOutTime;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <UserCheck className="h-8 w-8" />
            Mark Attendance
          </h1>
          <p className="text-gray-600 mt-1">Record employee check-in and check-out times</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Current Time Card */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Current Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {currentTime.toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: true
                  })}
                </div>
                <div className="text-gray-600 flex items-center justify-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {currentTime.toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Employee Selection */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Select Employee</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="search">Search Employee</Label>
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="Search by name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="employee">Employee</Label>
                <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredEmployees.map((employee) => (
                      <SelectItem key={employee._id || employee.id} value={(employee._id || employee.id || '').toString()}>
                        <div className="flex flex-col">
                          <span className="font-medium">{employee.name}</span>
                          <span className="text-sm text-gray-500">{employee.email}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedEmployee && getSelectedEmployeeInfo() && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Name:</span>
                      <span className="text-sm font-medium">{getSelectedEmployeeInfo().name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Email:</span>
                      <span className="text-sm">{getSelectedEmployeeInfo().email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Status:</span>
                      {getStatusBadge(getAttendanceStatus())}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Attendance Actions */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Today's Attendance</CardTitle>
            </CardHeader>
            <CardContent>
              {!selectedEmployee ? (
                <div className="text-center py-12">
                  <UserCheck className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500 text-lg">Please select an employee to mark attendance</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Current Status */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="bg-blue-50 border-blue-200">
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-blue-600">Check In Time</p>
                            <p className="text-2xl font-bold text-blue-800">
                              {todayAttendance?.checkInTime ? formatTime(todayAttendance.checkInTime) : 'Not marked'}
                            </p>
                          </div>
                          <LogIn className="h-8 w-8 text-blue-500" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-green-50 border-green-200">
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-green-600">Check Out Time</p>
                            <p className="text-2xl font-bold text-green-800">
                              {todayAttendance?.checkOutTime ? formatTime(todayAttendance.checkOutTime) : 'Not marked'}
                            </p>
                          </div>
                          <LogOut className="h-8 w-8 text-green-500" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Time Input and Action Buttons */}
                  <div className="space-y-4">
                    {/* Time Input Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className={`${!canCheckIn ? 'opacity-50' : ''}`}>
                        <Label htmlFor="checkin-time" className="flex items-center justify-between">
                          <span>Check In Time</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const now = new Date();
                              const hours = String(now.getHours()).padStart(2, '0');
                              const minutes = String(now.getMinutes()).padStart(2, '0');
                              setCheckInTime(`${hours}:${minutes}`);
                            }}
                            disabled={!canCheckIn}
                            className="text-xs"
                          >
                            Use Current Time
                          </Button>
                        </Label>
                        <Input
                          id="checkin-time"
                          type="time"
                          value={checkInTime}
                          onChange={(e) => setCheckInTime(e.target.value)}
                          disabled={!canCheckIn}
                          className="mt-1"
                        />
                      </div>
                      <div className={`${!canCheckOut ? 'opacity-50' : ''}`}>
                        <Label htmlFor="checkout-time" className="flex items-center justify-between">
                          <span>Check Out Time</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const now = new Date();
                              const hours = String(now.getHours()).padStart(2, '0');
                              const minutes = String(now.getMinutes()).padStart(2, '0');
                              setCheckOutTime(`${hours}:${minutes}`);
                            }}
                            disabled={!canCheckOut}
                            className="text-xs"
                          >
                            Use Current Time
                          </Button>
                        </Label>
                        <Input
                          id="checkout-time"
                          type="time"
                          value={checkOutTime}
                          onChange={(e) => setCheckOutTime(e.target.value)}
                          disabled={!canCheckOut}
                          className="mt-1"
                        />
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4">
                      <Button
                        onClick={() => handleMarkAttendance('check_in')}
                        disabled={!canCheckIn || loading || !checkInTime}
                        className="flex-1 h-16 text-lg"
                        size="lg"
                      >
                        <LogIn className="h-6 w-6 mr-2" />
                        {loading ? 'Processing...' : 'Check In'}
                      </Button>

                      <Button
                        onClick={() => handleMarkAttendance('check_out')}
                        disabled={!canCheckOut || loading || !checkOutTime}
                        variant="outline"
                        className="flex-1 h-16 text-lg border-green-300 text-green-700 hover:bg-green-50"
                        size="lg"
                      >
                        <LogOut className="h-6 w-6 mr-2" />
                        {loading ? 'Processing...' : 'Check Out'}
                      </Button>
                    </div>
                  </div>

                  {/* Helper Text */}
                  <div className="text-center text-sm text-gray-600 space-y-1">
                    {!todayAttendance?.checkInTime && (
                      <p>Select a time and click "Check In" to record arrival</p>
                    )}
                    {todayAttendance?.checkInTime && !todayAttendance?.checkOutTime && (
                      <p>Select a time and click "Check Out" to record departure</p>
                    )}
                    {todayAttendance?.checkInTime && todayAttendance?.checkOutTime && (
                      <div className="bg-green-50 p-3 rounded-lg">
                        <p className="text-green-700 font-medium">
                          Attendance completed for today!
                        </p>
                        <p className="text-green-600">
                          Working time: {(() => {
                            const checkIn = new Date(`2000-01-01T${todayAttendance.checkInTime}`);
                            const checkOut = new Date(`2000-01-01T${todayAttendance.checkOutTime}`);
                            const diffMs = checkOut - checkIn;
                            const diffHours = diffMs / (1000 * 60 * 60);
                            return `${diffHours.toFixed(1)} hours`;
                          })()}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

