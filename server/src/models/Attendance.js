const mongoose = require('mongoose');

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
    type: Date
  },
  checkOutTime: {
    type: Date
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
    const checkOut = new Date(this.checkOutTime);
    const checkOutHour = checkOut.getHours();

    if (checkOutHour < 12) {
      this.status = 'Half Day';
    } else {
      this.status = 'Present';
    }

    const checkIn = new Date(this.checkInTime);
    const [expectedHour, expectedMinute] = expectedCheckIn.split(':').map(Number);
    const expectedTime = new Date(checkIn);
    expectedTime.setHours(expectedHour, expectedMinute, 0, 0);

    if (checkIn > expectedTime) {
      this.isLate = true;
      this.lateMinutes = Math.floor((checkIn - expectedTime) / 60000);
    }

    const diffMs = checkOut - checkIn;
    this.totalHours = Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100;
  }
};

module.exports = mongoose.model('Attendance', attendanceSchema);