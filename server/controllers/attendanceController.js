const Attendance = require('../models/Attendance');
const Employee = require('../models/Employee');
const moment = require('moment');

exports.markAttendance = async (req, res) => {
  try {
    const { employeeId, date, checkInTime, checkOutTime, status, remarks } = req.body;

    const existingAttendance = await Attendance.findOne({
      employee: employeeId,
      date: moment(date).startOf('day').toDate()
    });

    let attendance;
    if (existingAttendance) {
      existingAttendance.checkInTime = checkInTime;
      existingAttendance.checkOutTime = checkOutTime;
      existingAttendance.status = status;
      existingAttendance.remarks = remarks;
      existingAttendance.calculateStatus();
      attendance = await existingAttendance.save();
    } else {
      attendance = new Attendance({
        employee: employeeId,
        date: moment(date).startOf('day').toDate(),
        checkInTime,
        checkOutTime,
        status,
        remarks
      });
      attendance.calculateStatus();
      await attendance.save();
    }

    await attendance.populate('employee');
    res.json({ success: true, data: attendance });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.getAttendanceByDate = async (req, res) => {
  try {
    const { date } = req.params;
    const startDate = moment(date).startOf('day').toDate();
    const endDate = moment(date).endOf('day').toDate();

    const attendance = await Attendance.find({
      date: { $gte: startDate, $lte: endDate }
    }).populate({
      path: 'employee',
      populate: { path: 'department designation' }
    });

    res.json({ success: true, data: attendance });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.getEmployeeAttendance = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { startDate, endDate } = req.query;

    const filter = { employee: employeeId };
    if (startDate && endDate) {
      filter.date = {
        $gte: moment(startDate).startOf('day').toDate(),
        $lte: moment(endDate).endOf('day').toDate()
      };
    }

    const attendance = await Attendance.find(filter).sort({ date: -1 });
    res.json({ success: true, data: attendance });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.getMonthlyReport = async (req, res) => {
  try {
    const { employeeId, year, month } = req.params;
    const startDate = moment(`${year}-${month}`, 'YYYY-MM').startOf('month').toDate();
    const endDate = moment(`${year}-${month}`, 'YYYY-MM').endOf('month').toDate();

    const attendance = await Attendance.find({
      employee: employeeId,
      date: { $gte: startDate, $lte: endDate }
    });

    const report = {
      employee: await Employee.findById(employeeId).populate(['department', 'designation']),
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

    res.json({ success: true, data: report });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.getDashboardStats = async (req, res) => {
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

    res.json({
      success: true,
      data: {
        todayAbsentees,
        weeklyStats: dailyCounts
      }
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};