require('dotenv').config();
const mongoose = require('mongoose');
const Department = require('./models/Department');
const Designation = require('./models/Designation');
const Employee = require('./models/Employee');
const Attendance = require('./models/Attendance');
const moment = require('moment');

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    await Department.deleteMany({});
    await Designation.deleteMany({});
    await Employee.deleteMany({});
    await Attendance.deleteMany({});

    const departments = await Department.insertMany([
      { name: 'Engineering', description: 'Software Development Team' },
      { name: 'Human Resources', description: 'HR and Recruitment' },
      { name: 'Sales', description: 'Sales and Business Development' },
      { name: 'Marketing', description: 'Marketing and Branding' },
      { name: 'Finance', description: 'Finance and Accounting' }
    ]);

    const designations = await Designation.insertMany([
      { name: 'Junior Developer', level: 1 },
      { name: 'Senior Developer', level: 2 },
      { name: 'Team Lead', level: 3 },
      { name: 'Manager', level: 4 },
      { name: 'HR Executive', level: 2 },
      { name: 'Sales Executive', level: 2 },
      { name: 'Marketing Executive', level: 2 },
      { name: 'Accountant', level: 2 }
    ]);

    const employees = await Employee.insertMany([
      {
        name: 'John Doe',
        email: 'john.doe@company.com',
        phoneNumber: '1234567890',
        department: departments[0]._id,
        designation: designations[1]._id
      },
      {
        name: 'Jane Smith',
        email: 'jane.smith@company.com',
        phoneNumber: '1234567891',
        department: departments[0]._id,
        designation: designations[0]._id
      },
      {
        name: 'Mike Johnson',
        email: 'mike.johnson@company.com',
        phoneNumber: '1234567892',
        department: departments[1]._id,
        designation: designations[4]._id
      },
      {
        name: 'Sarah Williams',
        email: 'sarah.williams@company.com',
        phoneNumber: '1234567893',
        department: departments[2]._id,
        designation: designations[5]._id
      },
      {
        name: 'Tom Brown',
        email: 'tom.brown@company.com',
        phoneNumber: '1234567894',
        department: departments[0]._id,
        designation: designations[2]._id
      }
    ]);

    const today = moment();
    const attendanceData = [];

    for (let i = 0; i < 30; i++) {
      const date = moment(today).subtract(i, 'days');

      for (const employee of employees) {
        if (date.day() !== 0 && date.day() !== 6) {
          const random = Math.random();
          let status, checkIn, checkOut;

          if (random > 0.1) {
            const checkInHour = Math.floor(Math.random() * 2) + 8;
            const checkInMinute = Math.floor(Math.random() * 60);
            checkIn = moment(date).set({ hour: checkInHour, minute: checkInMinute });

            const checkOutHour = random > 0.95 ? 11 : Math.floor(Math.random() * 3) + 17;
            const checkOutMinute = Math.floor(Math.random() * 60);
            checkOut = moment(date).set({ hour: checkOutHour, minute: checkOutMinute });

            status = checkOutHour < 12 ? 'Half Day' : 'Present';

            const attendance = new Attendance({
              employee: employee._id,
              date: date.startOf('day').toDate(),
              checkInTime: checkIn.toDate(),
              checkOutTime: checkOut.toDate(),
              status
            });

            attendance.calculateStatus();
            attendanceData.push(attendance);
          } else {
            attendanceData.push({
              employee: employee._id,
              date: date.startOf('day').toDate(),
              status: 'Absent'
            });
          }
        }
      }
    }

    await Attendance.insertMany(attendanceData);

    console.log('Seed data inserted successfully!');
    console.log(`Created ${departments.length} departments`);
    console.log(`Created ${designations.length} designations`);
    console.log(`Created ${employees.length} employees`);
    console.log(`Created ${attendanceData.length} attendance records`);

    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();