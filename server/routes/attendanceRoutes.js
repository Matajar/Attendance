const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');

router.post('/mark', attendanceController.markAttendance);
router.get('/date/:date', attendanceController.getAttendanceByDate);
router.get('/employee/:employeeId', attendanceController.getEmployeeAttendance);
router.get('/report/:employeeId/:year/:month', attendanceController.getMonthlyReport);
router.get('/dashboard', attendanceController.getDashboardStats);

module.exports = router;