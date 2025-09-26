const Attendance = require('../models/Attendance');
const Employee = require('../models/Employee');
const moment = require('moment');

async function markAttendance(req, res) {
  const { employeeId, date, checkInTime, checkOutTime, status, remarks } = req.body;

  // Validation
  if (!employeeId) {
    return res
      .status(200)
      .json({ message: "Employee ID is required", status: false });
  }

  if (!date) {
    return res
      .status(200)
      .json({ message: "Date is required", status: false });
  }

  if (!status || status.trim() === "") {
    return res
      .status(200)
      .json({ message: "Attendance status is required", status: false });
  }

  // Validate status values
  const validStatuses = ['Present', 'Absent', 'Half Day', 'Holiday', 'Leave'];
  if (!validStatuses.includes(status)) {
    return res
      .status(200)
      .json({ message: "Invalid attendance status", status: false });
  }

  try {
    // Check if employee exists
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res
        .status(200)
        .json({ message: "Employee not found", status: false });
    }

    const existingAttendance = await Attendance.findOne({
      employee: employeeId,
      date: moment(date).startOf('day').toDate()
    });

    let attendanceForm;
    if (existingAttendance) {
      existingAttendance.checkInTime = checkInTime;
      existingAttendance.checkOutTime = checkOutTime;
      existingAttendance.status = status;
      existingAttendance.remarks = remarks || "";
      existingAttendance.calculateStatus();
      attendanceForm = await existingAttendance.save();
    } else {
      attendanceForm = new Attendance({
        employee: employeeId,
        date: moment(date).startOf('day').toDate(),
        checkInTime,
        checkOutTime,
        status,
        remarks: remarks || ""
      });
      attendanceForm.calculateStatus();
      await attendanceForm.save();
    }

    await attendanceForm.populate('employee');

    res.status(200).json({
      message: existingAttendance ? "Attendance updated successfully" : "Attendance marked successfully",
      data: attendanceForm,
      status: true,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error", status: false });
  }
}

async function getAttendanceByDate(req, res) {
  const { date } = req.params;

  if (!date) {
    return res
      .status(200)
      .json({ message: "Date is required", status: false });
  }

  try {
    const startDate = moment(date).startOf('day').toDate();
    const endDate = moment(date).endOf('day').toDate();

    const attendance = await Attendance.find({
      date: { $gte: startDate, $lte: endDate }
    }).populate({
      path: 'employee',
      populate: { path: 'department designation' }
    });

    res.status(200).json({
      message: "Attendance retrieved successfully",
      data: attendance,
      status: true,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error", status: false });
  }
}

async function getEmployeeAttendance(req, res) {
  const { employeeId } = req.params;
  const { startDate, endDate } = req.query;

  if (!employeeId) {
    return res
      .status(200)
      .json({ message: "Employee ID is required", status: false });
  }

  try {
    // Check if employee exists
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res
        .status(200)
        .json({ message: "Employee not found", status: false });
    }

    const filter = { employee: employeeId };

    if (startDate && endDate) {
      filter.date = {
        $gte: moment(startDate).startOf('day').toDate(),
        $lte: moment(endDate).endOf('day').toDate()
      };
    }

    const attendance = await Attendance.find(filter).sort({ date: -1 });

    res.status(200).json({
      message: "Employee attendance retrieved successfully",
      data: attendance,
      status: true,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error", status: false });
  }
}

async function getMonthlyReport(req, res) {
  const { employeeId, year, month } = req.params;

  if (!employeeId) {
    return res
      .status(200)
      .json({ message: "Employee ID is required", status: false });
  }

  if (!year || !month) {
    return res
      .status(200)
      .json({ message: "Year and month are required", status: false });
  }

  // Validate year and month
  const yearNum = parseInt(year);
  const monthNum = parseInt(month);

  if (isNaN(yearNum) || yearNum < 2000 || yearNum > 2100) {
    return res
      .status(200)
      .json({ message: "Valid year is required (2000-2100)", status: false });
  }

  if (isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
    return res
      .status(200)
      .json({ message: "Valid month is required (1-12)", status: false });
  }

  try {
    // Check if employee exists
    const employee = await Employee.findById(employeeId)
      .populate(['department', 'designation']);

    if (!employee) {
      return res
        .status(200)
        .json({ message: "Employee not found", status: false });
    }

    const startDate = moment(`${year}-${month}`, 'YYYY-MM').startOf('month').toDate();
    const endDate = moment(`${year}-${month}`, 'YYYY-MM').endOf('month').toDate();

    const attendance = await Attendance.find({
      employee: employeeId,
      date: { $gte: startDate, $lte: endDate }
    });

    const report = {
      employee: employee,
      month: `${year}-${month}`,
      totalDays: moment(endDate).date(),
      presentDays: attendance.filter(a => a.status === 'Present').length,
      absentDays: attendance.filter(a => a.status === 'Absent').length,
      halfDays: attendance.filter(a => a.status === 'Half Day').length,
      lateDays: attendance.filter(a => a.isLate).length,
      totalHoursWorked: attendance.reduce((sum, a) => sum + (a.totalHours || 0), 0),
      totalLateMinutes: attendance.reduce((sum, a) => sum + (a.lateMinutes || 0), 0),
      details: attendance
    };

    res.status(200).json({
      message: "Monthly report retrieved successfully",
      data: report,
      status: true,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error", status: false });
  }
}

async function getDashboardStats(req, res) {
  try {
    const today = moment().startOf('day').toDate();
    const weekAgo = moment().subtract(7, 'days').startOf('day').toDate();

    const todayAbsentees = await Attendance.find({
      date: today,
      status: 'Absent'
    }).populate({
      path: 'employee',
      populate: { path: 'department designation' }
    });

    const weeklyAttendance = await Attendance.find({
      date: { $gte: weekAgo, $lte: today }
    });

    const dailyCounts = {};
    for (let i = 0; i < 7; i++) {
      const date = moment().subtract(i, 'days').format('YYYY-MM-DD');
      dailyCounts[date] = {
        absent: 0,
        present: 0,
        halfDay: 0
      };
    }

    weeklyAttendance.forEach(att => {
      const date = moment(att.date).format('YYYY-MM-DD');
      if (dailyCounts[date]) {
        if (att.status === 'Absent') dailyCounts[date].absent++;
        else if (att.status === 'Present') dailyCounts[date].present++;
        else if (att.status === 'Half Day') dailyCounts[date].halfDay++;
      }
    });

    res.status(200).json({
      message: "Dashboard statistics retrieved successfully",
      data: {
        todayAbsentees,
        weeklyStats: dailyCounts
      },
      status: true,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error", status: false });
  }
}

// Export functions
module.exports = {
  markAttendance,
  getAttendanceByDate,
  getEmployeeAttendance,
  getMonthlyReport,
  getDashboardStats
};