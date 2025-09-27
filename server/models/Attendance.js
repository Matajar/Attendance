const mongoose = require('mongoose');
const moment = require('moment-timezone');

const attendanceSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  checkInTime: {
    type: String
  },
  checkOutTime: {
    type: String
  },
  status: {
    type: String,
    enum: ['Present', 'Absent', 'Half Day', 'Holiday', 'Leave'],
    default: 'Absent'
  },
  isLate: {
    type: Boolean,
    default: false
  },
  lateMinutes: {
    type: Number,
    default: 0
  },
  totalHours: {
    type: Number,
    default: 0
  },
  remarks: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

attendanceSchema.index({ employee: 1, date: 1 }, { unique: true });

attendanceSchema.methods.calculateStatus = function(expectedCheckIn = '09:00') {
  if (this.checkInTime && this.checkOutTime) {
    // Times are already in HH:mm:ss format in Dubai timezone
    const today = moment.tz('Asia/Dubai').format('YYYY-MM-DD');
    const checkOut = moment.tz(`${today} ${this.checkOutTime}`, 'YYYY-MM-DD HH:mm:ss', 'Asia/Dubai');
    const checkOutHour = checkOut.hour();

    if (checkOutHour < 12) {
      this.status = 'Half Day';
    } else {
      this.status = 'Present';
    }

    const checkIn = moment.tz(`${today} ${this.checkInTime}`, 'YYYY-MM-DD HH:mm:ss', 'Asia/Dubai');
    const [expectedHour, expectedMinute] = expectedCheckIn.split(':').map(Number);
    const expectedTime = checkIn.clone();
    expectedTime.hour(expectedHour).minute(expectedMinute).second(0).millisecond(0);

    if (checkIn.isAfter(expectedTime)) {
      this.isLate = true;
      this.lateMinutes = Math.floor(checkIn.diff(expectedTime, 'minutes'));
    }

    const diffMs = checkOut.diff(checkIn, 'milliseconds');
    this.totalHours = Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100;
  }
};

module.exports = mongoose.model('Attendance', attendanceSchema);