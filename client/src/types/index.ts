export interface Department {
  _id: string;
  name: string;
  description?: string;
  status: 'active' | 'inactive';
}

export interface Designation {
  _id: string;
  name: string;
  description?: string;
  level: number;
  status: 'active' | 'inactive';
}

export interface Employee {
  _id: string;
  name: string;
  email: string;
  phoneNumber: string;
  designation: Designation | string;
  department: Department | string;
  joiningDate: string;
  status: 'active' | 'inactive';
}

export interface Attendance {
  _id: string;
  employee: Employee | string;
  date: string;
  checkInTime?: string;
  checkOutTime?: string;
  status: 'Present' | 'Absent' | 'Half Day' | 'Holiday' | 'Leave';
  isLate: boolean;
  lateMinutes: number;
  totalHours: number;
  remarks?: string;
}

export interface MonthlyReport {
  employee: Employee;
  month: string;
  totalDays: number;
  presentDays: number;
  absentDays: number;
  halfDays: number;
  lateDays: number;
  totalHoursWorked: number;
  totalLateMinutes: number;
  details: Attendance[];
}

export interface DashboardStats {
  todayAbsentees: Attendance[];
  weeklyStats: {
    [date: string]: {
      absent: number;
      present: number;
      halfDay: number;
    };
  };
}