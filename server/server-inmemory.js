require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const app = express();

// In-memory database
const db = {
  departments: [],
  designations: [],
  employees: [],
  attendance: []
};
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Department Routes
app.get('/api/departments', (req, res) => {
  res.json({ success: true, data: db.departments });
});

app.post('/api/departments', (req, res) => {
  const department = {
    _id: uuidv4(),
    ...req.body,
    status: req.body.status || 'active',
    createdAt: new Date(),
    updatedAt: new Date()
  };
  db.departments.push(department);
  res.status(201).json({ success: true, data: department });
});

app.get('/api/departments/:id', (req, res) => {
  const department = db.departments.find(d => d._id === req.params.id);
  if (!department) {
    return res.status(404).json({ success: false, error: 'Department not found' });
  }
  res.json({ success: true, data: department });
});

app.put('/api/departments/:id', (req, res) => {
  const index = db.departments.findIndex(d => d._id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, error: 'Department not found' });
  }
  db.departments[index] = {
    ...db.departments[index],
    ...req.body,
    updatedAt: new Date()
  };
  res.json({ success: true, data: db.departments[index] });
});

app.delete('/api/departments/:id', (req, res) => {
  const index = db.departments.findIndex(d => d._id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, error: 'Department not found' });
  }
  db.departments.splice(index, 1);
  res.json({ success: true, message: 'Department deleted successfully' });
});

// Designation Routes
app.get('/api/designations', (req, res) => {
  res.json({ success: true, data: db.designations });
});

app.post('/api/designations', (req, res) => {
  const designation = {
    _id: uuidv4(),
    ...req.body,
    status: req.body.status || 'active',
    level: req.body.level || 1,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  db.designations.push(designation);
  res.status(201).json({ success: true, data: designation });
});

app.get('/api/designations/:id', (req, res) => {
  const designation = db.designations.find(d => d._id === req.params.id);
  if (!designation) {
    return res.status(404).json({ success: false, error: 'Designation not found' });
  }
  res.json({ success: true, data: designation });
});

app.put('/api/designations/:id', (req, res) => {
  const index = db.designations.findIndex(d => d._id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, error: 'Designation not found' });
  }
  db.designations[index] = {
    ...db.designations[index],
    ...req.body,
    updatedAt: new Date()
  };
  res.json({ success: true, data: db.designations[index] });
});

app.delete('/api/designations/:id', (req, res) => {
  const index = db.designations.findIndex(d => d._id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, error: 'Designation not found' });
  }
  db.designations.splice(index, 1);
  res.json({ success: true, message: 'Designation deleted successfully' });
});

// Employee Routes
app.get('/api/employees', (req, res) => {
  const employeesWithRelations = db.employees.map(emp => ({
    ...emp,
    department: db.departments.find(d => d._id === emp.department),
    designation: db.designations.find(d => d._id === emp.designation)
  }));
  res.json({ success: true, data: employeesWithRelations });
});

app.post('/api/employees', (req, res) => {
  const employee = {
    _id: uuidv4(),
    ...req.body,
    status: req.body.status || 'active',
    joiningDate: req.body.joiningDate || new Date(),
    createdAt: new Date(),
    updatedAt: new Date()
  };
  db.employees.push(employee);
  const employeeWithRelations = {
    ...employee,
    department: db.departments.find(d => d._id === employee.department),
    designation: db.designations.find(d => d._id === employee.designation)
  };
  res.status(201).json({ success: true, data: employeeWithRelations });
});

app.get('/api/employees/:id', (req, res) => {
  const employee = db.employees.find(e => e._id === req.params.id);
  if (!employee) {
    return res.status(404).json({ success: false, error: 'Employee not found' });
  }
  const employeeWithRelations = {
    ...employee,
    department: db.departments.find(d => d._id === employee.department),
    designation: db.designations.find(d => d._id === employee.designation)
  };
  res.json({ success: true, data: employeeWithRelations });
});

app.put('/api/employees/:id', (req, res) => {
  const index = db.employees.findIndex(e => e._id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, error: 'Employee not found' });
  }
  db.employees[index] = {
    ...db.employees[index],
    ...req.body,
    updatedAt: new Date()
  };
  const employeeWithRelations = {
    ...db.employees[index],
    department: db.departments.find(d => d._id === db.employees[index].department),
    designation: db.designations.find(d => d._id === db.employees[index].designation)
  };
  res.json({ success: true, data: employeeWithRelations });
});

app.delete('/api/employees/:id', (req, res) => {
  const index = db.employees.findIndex(e => e._id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, error: 'Employee not found' });
  }
  db.employees.splice(index, 1);
  res.json({ success: true, message: 'Employee deleted successfully' });
});

// Attendance Routes
app.post('/api/attendance/mark', (req, res) => {
  const attendance = {
    _id: uuidv4(),
    ...req.body,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  // Check if attendance already exists for this employee and date
  const existingIndex = db.attendance.findIndex(
    a => a.employee === req.body.employee && a.date === req.body.date
  );

  if (existingIndex !== -1) {
    // Update existing attendance
    db.attendance[existingIndex] = {
      ...db.attendance[existingIndex],
      ...req.body,
      updatedAt: new Date()
    };
    res.json({ success: true, data: db.attendance[existingIndex] });
  } else {
    // Create new attendance
    db.attendance.push(attendance);
    res.status(201).json({ success: true, data: attendance });
  }
});

app.get('/api/attendance/date/:date', (req, res) => {
  const records = db.attendance.filter(a => a.date === req.params.date);
  const recordsWithEmployee = records.map(record => ({
    ...record,
    employee: db.employees.find(e => e._id === record.employee)
  }));
  res.json({ success: true, data: recordsWithEmployee });
});

app.get('/api/attendance/employee/:employeeId', (req, res) => {
  const records = db.attendance.filter(a => a.employee === req.params.employeeId);
  res.json({ success: true, data: records });
});

app.get('/api/attendance/report/:employeeId/:year/:month', (req, res) => {
  const { employeeId, year, month } = req.params;
  const records = db.attendance.filter(a => {
    if (a.employee !== employeeId) return false;
    const date = new Date(a.date);
    return date.getFullYear() === parseInt(year) &&
           date.getMonth() === parseInt(month) - 1;
  });
  res.json({ success: true, data: records });
});

app.get('/api/attendance/dashboard', (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  const todayRecords = db.attendance.filter(a => a.date === today);

  const presentToday = todayRecords.filter(r => r.status === 'Present').length;
  const absentToday = db.employees.length - todayRecords.length;
  const lateToday = todayRecords.filter(r => r.isLate).length;
  const attendancePercentage = db.employees.length > 0
    ? Math.round((presentToday / db.employees.length) * 100)
    : 0;

  res.json({
    success: true,
    data: {
      presentToday,
      absentToday,
      lateToday,
      attendancePercentage
    }
  });
});

app.get('/', (req, res) => {
  res.json({ message: 'Employee Attendance System API (In-Memory)' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5009;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT} (In-Memory Database)`);
  console.log('Note: Data will be lost when server restarts');
});