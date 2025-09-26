import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay } from 'date-fns';
import { attendanceAPI, employeeAPI } from '../services/api';
import { Attendance, Employee } from '../types';

export default function AttendanceCalendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [attendanceData, setAttendanceData] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [formData, setFormData] = useState({
    checkInTime: '',
    checkOutTime: '',
    status: 'Present' as 'Present' | 'Absent' | 'Half Day' | 'Leave',
    remarks: '',
  });

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    if (selectedEmployee) {
      fetchAttendance();
    }
  }, [currentMonth, selectedEmployee]);

  const fetchEmployees = async () => {
    try {
      const response = await employeeAPI.getAll();
      setEmployees(response.data.data);
      if (response.data.data.length > 0) {
        setSelectedEmployee(response.data.data[0]._id);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendance = async () => {
    try {
      const startDate = startOfMonth(currentMonth).toISOString();
      const endDate = endOfMonth(currentMonth).toISOString();
      const response = await attendanceAPI.getEmployeeAttendance(selectedEmployee, startDate, endDate);
      setAttendanceData(response.data.data);
    } catch (error) {
      console.error('Error fetching attendance:', error);
    }
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    const existingAttendance = attendanceData.find(
      (att) => new Date(att.date).toDateString() === date.toDateString()
    );

    if (existingAttendance) {
      setFormData({
        checkInTime: existingAttendance.checkInTime
          ? format(new Date(existingAttendance.checkInTime), 'HH:mm')
          : '',
        checkOutTime: existingAttendance.checkOutTime
          ? format(new Date(existingAttendance.checkOutTime), 'HH:mm')
          : '',
        status: existingAttendance.status as 'Present' | 'Absent' | 'Half Day' | 'Leave',
        remarks: existingAttendance.remarks || '',
      });
    } else {
      setFormData({
        checkInTime: '',
        checkOutTime: '',
        status: 'Present',
        remarks: '',
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate || !selectedEmployee) return;

    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const data = {
        employeeId: selectedEmployee,
        date: dateStr,
        checkInTime: formData.checkInTime ? `${dateStr}T${formData.checkInTime}:00` : undefined,
        checkOutTime: formData.checkOutTime ? `${dateStr}T${formData.checkOutTime}:00` : undefined,
        status: formData.status,
        remarks: formData.remarks,
      };

      await attendanceAPI.markAttendance(data);
      fetchAttendance();
      setSelectedDate(null);
    } catch (error) {
      console.error('Error marking attendance:', error);
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth((prev) => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const getDaysInMonth = () => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  };

  const getAttendanceForDate = (date: Date) => {
    return attendanceData.find(
      (att) => new Date(att.date).toDateString() === date.toDateString()
    );
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'Present':
        return 'bg-green-100 text-green-800';
      case 'Absent':
        return 'bg-red-100 text-red-800';
      case 'Half Day':
        return 'bg-yellow-100 text-yellow-800';
      case 'Leave':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100';
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  const daysInMonth = getDaysInMonth();
  const firstDayOfWeek = getDay(daysInMonth[0]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Attendance Calendar</h1>
        <div className="flex items-center space-x-4">
          <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Select Employee" />
            </SelectTrigger>
            <SelectContent>
              {employees.map((emp) => (
                <SelectItem key={emp._id} value={emp._id}>
                  {emp.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              {format(currentMonth, 'MMMM yyyy')}
            </CardTitle>
            <div className="flex space-x-2">
              <Button size="sm" variant="outline" onClick={() => navigateMonth('prev')}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="outline" onClick={() => navigateMonth('next')}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="text-center font-semibold text-sm p-2">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: firstDayOfWeek }).map((_, index) => (
              <div key={`empty-${index}`} />
            ))}
            {daysInMonth.map((date) => {
              const attendance = getAttendanceForDate(date);
              const isWeekend = getDay(date) === 0 || getDay(date) === 6;
              return (
                <div
                  key={date.toISOString()}
                  onClick={() => !isWeekend && handleDateClick(date)}
                  className={`border rounded-lg p-2 min-h-[80px] ${
                    isWeekend ? 'bg-gray-50' : 'hover:bg-gray-50 cursor-pointer'
                  }`}
                >
                  <div className="font-semibold text-sm mb-1">{format(date, 'd')}</div>
                  {attendance && (
                    <div className={`text-xs p-1 rounded ${getStatusColor(attendance.status)}`}>
                      {attendance.status}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {selectedDate && (
        <Card>
          <CardHeader>
            <CardTitle>Mark Attendance for {format(selectedDate, 'MMMM d, yyyy')}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) =>
                      setFormData({ ...formData, status: value as any })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Present">Present</SelectItem>
                      <SelectItem value="Absent">Absent</SelectItem>
                      <SelectItem value="Half Day">Half Day</SelectItem>
                      <SelectItem value="Leave">Leave</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="checkIn">Check-in Time</Label>
                  <Input
                    id="checkIn"
                    type="time"
                    value={formData.checkInTime}
                    onChange={(e) => setFormData({ ...formData, checkInTime: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="checkOut">Check-out Time</Label>
                  <Input
                    id="checkOut"
                    type="time"
                    value={formData.checkOutTime}
                    onChange={(e) => setFormData({ ...formData, checkOutTime: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="remarks">Remarks</Label>
                  <Input
                    id="remarks"
                    value={formData.remarks}
                    onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                    placeholder="Optional remarks"
                  />
                </div>
              </div>
              <div className="flex space-x-2">
                <Button type="submit">Save Attendance</Button>
                <Button type="button" variant="outline" onClick={() => setSelectedDate(null)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}